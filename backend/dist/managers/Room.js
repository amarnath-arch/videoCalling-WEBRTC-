import { WebSocket } from "ws";
export class RoomManager {
    // create a mapping from string to type (user1, user2)
    rooms;
    userToRooms;
    constructor() {
        this.rooms = new Map();
        this.userToRooms = new Map();
    }
    generateRoom() {
        const randomString = "asdjfaklurwiFHJUoeencjakrESFrmtzufnxzieyerw";
        const length = 6;
        let ans = "";
        for (let i = 0; i < length; ++i) {
            ans += randomString[Math.floor(Math.random() * randomString.length)];
        }
        return ans;
    }
    createRoom(user) {
        // generate the room
        const roomId = this.generateRoom();
        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, new Set());
        }
        const room = this.rooms.get(roomId);
        room?.add(user);
        this.userToRooms.set(user, roomId);
        user.send(JSON.stringify({
            type: "create-room-success",
            roomId: roomId,
        }));
    }
    joinRoom(roomId, user) {
        console.log("joining The Room");
        const room = this.rooms.get(roomId);
        // check if the room exists or not
        if (!this.rooms.has(roomId)) {
            return user.send(JSON.stringify({
                type: "error",
                message: "RoomId does not exist",
            }));
        }
        // check if the user is already in this room
        if (this.userToRooms.get(user) == roomId) {
            return user.send(JSON.stringify({
                type: "error",
                message: "User is already in the room",
            }));
        }
        if ((room?.size || 0) >= 2) {
            return user.send(JSON.stringify({
                type: "error",
                message: "Room is full",
            }));
        }
        // i can let the user now to join the room
        room?.add(user);
        this.userToRooms.set(user, roomId);
        if (room?.size == 2) {
            console.log("2 users in the room");
            user.send(JSON.stringify({
                type: "join-room-success",
                roomId: roomId,
            }));
            this.rooms.get(roomId)?.forEach((user) => {
                this.sendOffer(user);
            });
        }
    }
    removeUserFromRoom(user) {
        // console.log("reacher here");
        if (!this.userToRooms.has(user)) {
            return;
        }
        const roomId = this.userToRooms.get(user);
        this.rooms.get(roomId ?? "")?.delete(user);
        this.userToRooms.delete(user);
        if (this.rooms.get(roomId ?? "")?.size == 0) {
            this.rooms.delete(roomId ?? "");
        }
        // console.log("here");
        // console.log(this.rooms.get(roomId ?? ""));
        user.send(JSON.stringify({
            type: "exit",
            message: "exited successfully",
        }));
    }
    sendOffer(socket) {
        socket.send(JSON.stringify({
            type: "send-offer",
        }));
    }
    getOtherUserInRoom(currentUser) {
        const roomId = this.userToRooms.get(currentUser);
        console.log("roomId is : ", roomId);
        // check if the room is full or not
        if (this.rooms.get(roomId ?? "")?.size != 2) {
            console.log("I got here");
            return undefined;
        }
        console.log("getting other User");
        const otherUser = [...(this.rooms.get(roomId ?? "") ?? [])].filter((user) => user != currentUser);
        return otherUser[0];
    }
}
//# sourceMappingURL=Room.js.map