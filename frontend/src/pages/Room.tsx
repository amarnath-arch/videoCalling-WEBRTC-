import { useSearchParams } from "react-router-dom";
import { useWebSocket } from "../context/useWebSocket";
import { useEffect, useRef, useState } from "react";

type chatType = {
  type: string;
  chat: string;
};

export default function Room() {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId");

  const { socket, getLocalStream } = useWebSocket();
  const [chat, setChat] = useState<chatType[]>([]);
  const sendChatRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

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

            // alert("answering");

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
          } else if (message.type == "chat") {
            const chatt = {
              type: "receive",
              chat: message.chat,
            };
            setChat((c) => [...c, chatt]);
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  return (
    <div className="grid grid-cols-12">
      <div className="col-span-9 h-screen flex p-10 justify-evenly">
        <div>
          <video
            ref={localVideoRef}
            muted
            playsInline
            autoPlay
            className="rounded-xl w-xl"
          ></video>
        </div>

        <div>
          <video
            ref={remoteVideoRef}
            autoPlay
            className="rounded-xl w-xl"
          ></video>
        </div>
      </div>

      <div className="col-span-3 border-l-slate-300 border-l h-screen px-5 pt-4 flex  flex-col">
        <button
          className="bg-blue-500 text-white px-6 py-4 w-full cursor-pointer hover:scale-105  transition-transform duration-100 rounded-2xl shadow-xl"
          onClick={async () => {
            await navigator.clipboard.writeText(window.location.href);
            alert("copied to clipbard");
          }}
        >
          Invite someone
        </button>
        <div className="flex flex-col flex-1 mt-4 justify-between  mb-2">
          <div className="flex-1 overflow-y-auto p-2 flex flex-col-reverse gap-4 overflow-hidden">
            {[...chat].reverse().map((c, i) => {
              const isReceive = c.type === "receive";

              return (
                <div
                  key={i}
                  className={`flex w-full ${
                    isReceive ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl max-w-[70%] ${
                      isReceive ? "bg-slate-300" : "bg-blue-500 text-white"
                    }`}
                  >
                    {c.chat}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (socket) {
                socket.send(
                  JSON.stringify({
                    type: "chat",
                    chat: sendChatRef.current?.value,
                  })
                );
              }

              const chatt = {
                type: "send",
                chat: sendChatRef.current?.value ?? "",
              };

              setChat((c) => [...c, chatt]);
              if (sendChatRef.current) sendChatRef.current.value = "";
            }}
          >
            <input
              type="text"
              placeholder="message"
              className="flex-1 border-slate-200 border rounded-2xl text-slate-700 p-2"
              ref={sendChatRef}
            />
            <button
              type="submit"
              className="px-4 py-3 bg-blue-500 text-white px-4 py-2 rounded-xl hover:scale-105 transition-transform duration-200 cursor-pointer"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
