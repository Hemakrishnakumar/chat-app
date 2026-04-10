export class PresenceService {
    private userSockets = new Map<string, Set<string>>();
    constructor(){}    

    addUser(userId: string, socketId: string) {
        if (!this.userSockets.has(userId)) {
            this.userSockets.set(userId, new Set());
        }
        this.userSockets[userId].add(socketId);
    }

    getUserSockets(userId: string): string[] {
        return Array.from(this.userSockets.get(userId) || []);
    }
}