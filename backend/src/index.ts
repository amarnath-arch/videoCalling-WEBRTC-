import { WebSocketServer } from "ws";
import { UserManager } from "./managers/User.js";

const wss = new WebSocketServer({ port: 8080 });

// when a single person comes he will create a room and other person has the option either to create a room or to join one .
// there will be multiple users, multiple rooms

const userManager = new UserManager();

wss.on("connection", (socket) => {
  console.log("connection established ");

  userManager.addUser(socket);

  socket.on("close", () => {
    userManager.removeUser(socket);
  });
});
