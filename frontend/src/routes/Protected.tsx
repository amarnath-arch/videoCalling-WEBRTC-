import { Navigate, useSearchParams } from "react-router-dom";
import { useWebSocket } from "../context/useWebSocket";

export default function Protected({ children }: { children: React.ReactNode }) {
  const { socket, getLocalStream } = useWebSocket();
  const localStream = getLocalStream();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId");

  console.log("room ID", roomId);

  if (roomId == null) {
    return <Navigate to={"/"} />;
  }

  if (!socket || !localStream) {
    return <Navigate to={`/join?roomId=${roomId.toString()}`} />;
  }

  return <>{children}</>;
}
