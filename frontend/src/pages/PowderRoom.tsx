import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useWebSocket } from "../context/useWebSocket";

export default function PowderRoom() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const roomCodeRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { socket, joinRoom, createRoom, setLocalStream } = useWebSocket();

  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId");

  useEffect(() => {
    const getVideoSrc = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setLocalStream(stream);
      }
    };

    getVideoSrc();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.onmessage = (e) => {
        console.log("got the data");
        const message = JSON.parse(e.data.toString());

        if (message.type == "create-room-success") {
          navigate(`/room?roomId=${message.roomId}`);
        } else if (message.type == "join-room-success") {
          navigate(`/room?roomId=${message.roomId}`);
        }
      };
    }
  }, [socket]);

  return (
    <div className="flex items-center h-screen justify-evenly">
      <div className="border-slate-200 border-r">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="rounded-lg mr-50 h-[80%] w-[70%]"
        ></video>
        <p className="text-slate-700">Prepare yourself</p>
      </div>

      <div className="flex-col gap-20">
        <input
          placeholder="Enter Room Code"
          type="text"
          className={`px-6 py-4 border-slate-200 border rounded-xl text-slate-500 w-full`}
          ref={roomCodeRef}
          value={roomId?.toString() ?? ""}
          disabled
        />
        <button
          className="px-8 py-4 bg-blue-500 text-white rounded-2xl shadow-xl hover:scale-105 cursor-pointer transition-transform duration-100 w-full mt-10"
          onClick={() => {
            const roomId = roomCodeRef?.current?.value;
            joinRoom(roomId ?? "");
            navigate(`/room?roomId=${roomId}`);
          }}
        >
          Join meeting
        </button>
      </div>
    </div>
  );
}
