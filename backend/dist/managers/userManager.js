import { WebSocket } from "ws";
import { RoomManager } from "./Room.js";
export class UserManager {
  // let's say users is a set or a map
  users;
  roomManager;
  constructor() {
    this.users = new Set();
    this.roomManager = new RoomManager();
  }
  addUser(socketId) {
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
  }
  removeUser(socket) {
    this.users.delete(socket);
  }
  initHandlers(socket) {
    socket.on("message", (message) => {
      // parse the message first
      const msg = JSON.parse(message.toString());
      if (msg.type == "joinRoom") {
        this.roomManager.joinRoom(msg.roomId, socket);
      } else if (msg.type == "createRoom") {
        this.roomManager.createRoom(socket);
      } else if (msg.type == "create-offer") {
        // local sdp
        const otherUser = this.roomManager.getOtherUserInRoom(socket);
        if (!otherUser) {
          return;
        }
        otherUser.send(
          JSON.stringify({
            type: "create-offer",
            sdp: msg.sdp,
          })
        );
      } else if (msg.type == "create-answer") {
        // get th other user
        const otherUser = this.roomManager.getOtherUserInRoom(socket);
        if (!otherUser) {
          return;
        }
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
            candidate: msg.candidate,
          })
        );
      }
    });
  }
}
//# sourceMappingURL=userManager.js.map
