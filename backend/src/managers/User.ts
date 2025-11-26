import { WebSocket } from "ws";
import { RoomManager } from "./Room.js";

export class UserManager {
  // let's say users is a set or a map
  private users: Set<WebSocket>;
  private roomManager: RoomManager;

  constructor() {
    this.users = new Set<WebSocket>();
    this.roomManager = new RoomManager();
  }

  addUser(socketId: WebSocket) {
    // if socketId already exists
    if (this.users.has(socketId)) {
      socketId.send(
        JSON.stringify({
          type: "error",
          message: "You are already in an existing room",
        })
      );
    }

    this.users.add(socketId);
    this.initHandlers(socketId);
    console.log("user added successfully");
  }

  removeUser(socket: WebSocket) {
    console.log("removing User");
    this.users.delete(socket);
    this.roomManager.removeUserFromRoom(socket);
  }

  initHandlers(socket: WebSocket) {
    socket.on("message", (message) => {
      // parse the message first
      const msg = JSON.parse(message.toString());

      if (msg.type == "joinRoom") {
        console.log("joinRoom");
        this.roomManager.joinRoom(msg.roomId, socket);
      } else if (msg.type == "createRoom") {
        console.log("createRoom");
        this.roomManager.createRoom(socket);
      } else if (msg.type == "create-offer") {
        console.log("create-offer-message-found");
        // local sdp
        const otherUser = this.roomManager.getOtherUserInRoom(socket);
        console.log(otherUser);
        if (!otherUser) {
          return;
        }

        console.log("sending the offer to other user");
        console.log(msg.sdp);

        otherUser.send(
          JSON.stringify({
            type: "create-offer",
            sdp: msg.sdp,
          })
        );
      } else if (msg.type == "create-answer") {
        // get th other user
        console.log("create-answer-request");
        const otherUser = this.roomManager.getOtherUserInRoom(socket);
        if (!otherUser) {
          return;
        }

        console.log("creating the answer now");

        otherUser.send(
          JSON.stringify({
            type: "create-answer",
            sdp: msg.sdp,
          })
        );
      } else if (msg.type == "ice-candidate") {
        // get th other user
        const otherUser = this.roomManager.getOtherUserInRoom(socket);
        if (!otherUser) {
          return;
        }

        otherUser.send(
          JSON.stringify({
            type: "ice-candidate",
            who: msg.who,
            candidate: msg.candidate,
          })
        );
      } else if (msg.type == "chat") {
        // get th other user
        console.log("sending chat");
        const otherUser = this.roomManager.getOtherUserInRoom(socket);
        if (!otherUser) {
          return;
        }

        otherUser.send(
          JSON.stringify({
            type: "chat",
            chat: msg.chat,
          })
        );
      }
    });
  }
}
