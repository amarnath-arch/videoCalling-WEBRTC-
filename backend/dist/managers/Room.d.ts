import { WebSocket } from "ws";
export declare class RoomManager {
    private rooms;
    private userToRooms;
    constructor();
    generateRoom(): string;
    createRoom(user: WebSocket): void;
    joinRoom(roomId: string, user: WebSocket): void;
    removeUserFromRoom(user: WebSocket): void;
    sendOffer(socket: WebSocket): void;
    getOtherUserInRoom(currentUser: WebSocket): WebSocket | undefined;
}
//# sourceMappingURL=Room.d.ts.map