import { useEffect, useState } from "react";

export default function useSocket() {
  const [socket, setSocket] = useState<WebSocket>();

  async function createRoom() {
    try {
      if (!socket) {
        throw new Error("Socket connection not established");
      }

      socket.onopen = () => {
        socket.send(
          JSON.stringify({
            type: "createRoom",
          })
        );
      };
    } catch (err) {
      console.error(err);
    }
  }

  async function joinRoom(roomId: string) {
    try {
      if (!socket) {
        throw new Error("Socket connection not established");
      }

      socket.onopen = () => {
        socket.send(
          JSON.stringify({
            type: "joinRoom",
            roomId: roomId,
          })
        );
      };
    } catch (err) {
      alert("error");
      console.error(err);
    }
  }

  useEffect(() => {
    const sckt = new WebSocket("ws://localhost:8080");
    setSocket(sckt);

    return () => {
      sckt.close();
    };
  }, []);

  return { socket, joinRoom, createRoom };
}
