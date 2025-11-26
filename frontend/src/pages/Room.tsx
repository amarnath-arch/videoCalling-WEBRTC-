import { useSearchParams } from "react-router-dom";
import { useWebSocket } from "../context/useWebSocket";
import { useEffect, useRef, useState } from "react";

export default function Room() {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId");

  const { socket, getLocalStream } = useWebSocket();

  const [sendingPc, setSendingPc] = useState<RTCConfiguration>();
  const [receivingPc, setReceivingPc] = useState<RTCConfiguration>();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    console.log(socket);
    console.log("local Stream is ");
    const localStream = getLocalStream();
    console.log(localStream);

    if (localStream) {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
        localVideoRef.current.play();
      }
    }

    let senderPc: RTCPeerConnection;
    let receiverPc: RTCPeerConnection;

    if (socket) {
      // let 's say the socket connection is open now. and the user has joined through usual method.

      const peerConnection = async () => {
        senderPc = new RTCPeerConnection();
        receiverPc = new RTCPeerConnection();

        senderPc.onnegotiationneeded = async () => {
          console.log("creating offer");
          const localSdp = await senderPc.createOffer();
          await senderPc.setLocalDescription(localSdp);

          socket.send(
            JSON.stringify({
              type: "create-offer",
              sdp: localSdp,
            })
          );
        };

        senderPc.onicecandidate = (e) => {
          socket.send(
            JSON.stringify({
              type: "ice-candidate",
              who: "sender",
              candidate: e.candidate,
            })
          );
        };

        receiverPc.onicecandidate = (e) => {
          socket.send(
            JSON.stringify({
              type: "ice-candidate",
              who: "receiver",
              candidate: e.candidate,
            })
          );
        };

        const localVideoTrack = localStream?.getVideoTracks()[0];
        const localAudioTrack = localStream?.getAudioTracks()[0];

        if (localAudioTrack) {
          senderPc.addTrack(localAudioTrack);
        }
        if (localVideoTrack) {
          senderPc.addTrack(localVideoTrack);
        }

        receiverPc.ontrack = (e) => {
          console.log("track received");
          console.log("track received", e.track);
          const remoteStream = new MediaStream([e.track]);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.play();
          }
        };

        socket.onmessage = async (e) => {
          const message = JSON.parse(e.data.toString());

          if (message.type == "create-offer") {
            console.log("offer received");

            console.log("the offer is ", message);

            const remoteSdp = message.sdp;
            await receiverPc.setRemoteDescription(remoteSdp);

            // i have to create answer;
            const localSdp = await receiverPc.createAnswer();
            await receiverPc.setLocalDescription(localSdp);

            alert("answering");

            socket.send(
              JSON.stringify({
                type: "create-answer",
                sdp: localSdp,
              })
            );
          } else if (message.type == "create-answer") {
            console.log("answer received");
            await senderPc.setRemoteDescription(message.sdp);
          } else if (message.type == "ice-candidate") {
            if (message.who == "sender") {
              console.log("add ice-candidate receiver", receiverPc);
              if (!receiverPc) return;
              await receiverPc.addIceCandidate(message.candidate);
              console.log("ice-candidate added in receiverPc");
            } else if (message.who == "receiver") {
              console.log("add ice-candidate sender", senderPc);
              if (!senderPc) return;
              await senderPc.addIceCandidate(message.candidate);
              console.log("ice-candidate added in senderPC");
            }
          } else if (message.type == "send-offer") {
            console.log("send the offer");
            if (senderPc && receiverPc) {
              console.log("sending the offer");

              const localSdp = await senderPc.createOffer();
              await senderPc.setLocalDescription(localSdp);

              socket.send(
                JSON.stringify({
                  type: "create-offer",
                  sdp: localSdp,
                })
              );
            }
          }
        };
      };

      peerConnection();
    }

    return () => {
      senderPc?.close();
      receiverPc?.close();
    };
  }, []);

  return (
    <div className="grid grid-cols-12">
      <div className="col-span-9 h-screen flex p-10 justify-evenly">
        <div className=" border-red-500 border">
          <video
            ref={localVideoRef}
            muted
            playsInline
            autoPlay
            className="rounded-xl w-[70%]"
          ></video>
        </div>

        <div>
          <video
            ref={remoteVideoRef}
            autoPlay
            className="rounded-xl w-[70%]"
          ></video>
        </div>
      </div>

      <div className="col-span-3 border-l-slate-300 border-l h-screen px-5 py-4">
        <button
          className="bg-blue-500 text-white px-6 py-4 w-full cursor-pointer hover:scale-105  transition-transform duration-100 rounded-2xl shadow-xl"
          onClick={async () => {
            await navigator.clipboard.writeText(window.location.href);
            alert("copied to clipbard");
          }}
        >
          Invite someone
        </button>
      </div>
    </div>
  );
}
