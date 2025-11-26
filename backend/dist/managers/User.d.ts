import { WebSocket } from "ws";
export declare class UserManager {
    private users;
    private roomManager;
    constructor();
    addUser(socketId: WebSocket): void;
    removeUser(socket: WebSocket): void;
    initHandlers(socket: WebSocket): void;
}
//# sourceMappingURL=User.d.ts.map