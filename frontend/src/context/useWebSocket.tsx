import { createContext, useContext, useEffect, useRef, useState } from "react";

export interface socketContextType {
  socket: WebSocket | undefined;
  joinRoom: (roomId: string) => void;
  createRoom: () => void;
  getLocalStream: () => MediaStream | undefined;
  setLocalStream: (locall: MediaStream) => void;
}

const SocketContext = createContext<socketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<WebSocket>();
  const localMediaStream = useRef<MediaStream>(undefined);

  useEffect(() => {
    const sckt = new WebSocket("ws://localhost:8080");
    setSocket(sckt);

    return () => {
      sckt.close();
    };
  }, []);

  async function createRoom() {
    console.log("I am here");
    console.log(socket);
    try {
      if (!socket) {
        throw new Error("Socket connection not established");
      }

      console.log("checked socket");

      socket.send(
        JSON.stringify({
          type: "createRoom",
        })
      );

      //   socket.onopen = () => {
      //     console.log("creating");
      //     socket.send(
      //       JSON.stringify({
      //         type: "createRoom",
      //       })
      //     );
      //   };
    } catch (err) {
      console.error(err);
    }
  }

  async function joinRoom(roomId: string) {
    try {
      if (!socket) {
        throw new Error("Socket connection not established");
      }

      socket.send(
        JSON.stringify({
          type: "joinRoom",
          roomId: roomId,
        })
      );

      //   socket.onopen = () => {};
    } catch (err) {
      alert("error");
      console.error(err);
    }
  }

  async function setLocalStream(locall: MediaStream) {
    localMediaStream.current = locall;
  }

  function getLocalStream(): MediaStream | undefined {
    return localMediaStream.current;
  }

  return (
    <SocketContext.Provider
      value={{
        socket,
        joinRoom,
        createRoom,
        setLocalStream,
        getLocalStream,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useAuth must be used inside an socketProvider");
  }

  return context;
}
