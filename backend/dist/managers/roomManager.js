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
    }
    joinRoom(roomId, user) {
        const room = this.rooms.get(roomId);
        // check if the room exists or not
        if (!this.rooms.has(roomId)) {
            return user.send(JSON.stringify({
                type: "error",
                message: "RoomId does not exist",
            }));
        }
        if ((room?.size || 0) > 2) {
            return user.send(JSON.stringify({
                type: "error",
                message: "Room is full",
            }));
        }
        // i can let the user now to join the room
        room?.add(user);
        this.userToRooms.set(user, roomId);
        if (room?.size == 2) {
            this.rooms.get(roomId)?.forEach((user) => {
                this.sendOffer(user);
            });
            this.sendOffer(user);
        }
    }
    removeUserFromRoom(user) {
        if (!this.userToRooms.has(user)) {
            return;
        }
        const roomId = this.userToRooms.get(user);
        this.rooms.get(roomId ?? "")?.delete(user);
        this.userToRooms.delete(user);
        if (this.rooms.get(roomId ?? "")?.size == 0) {
            this.rooms.delete(roomId ?? "");
        }
    }
    sendOffer(socket) {
        socket.send(JSON.stringify({
            type: "send-offer",
        }));
    }
    getOtherUserInRoom(currentUser) {
        const roomId = this.userToRooms.get(currentUser);
        // check if the room is full or not
        if (this.rooms.get(roomId ?? "")?.size != 2) {
            return undefined;
        }
        const otherUser = [...(this.rooms.get(roomId ?? "") ?? [])].filter((user) => user != currentUser);
        return otherUser[0];
    }
}
//# sourceMappingURL=roomManager.js.map