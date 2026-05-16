type NotificationType = 'Placement' | 'Result' | 'Event';

interface Notification {
    ID: string;
    Type: NotificationType;
    Message: string;
    Timestamp: string;
}

// 1. Define the Priority Weights
const typeWeights: Record<NotificationType, number> = {
    'Placement': 3,
    'Result': 2,
    'Event': 1
};

// 2. Create the Comparison Function
function comparePriority(a: Notification, b: Notification): number {
    if (typeWeights[a.Type] !== typeWeights[b.Type]) {
        return typeWeights[b.Type] - typeWeights[a.Type];
    }
    const timeA = new Date(a.Timestamp).getTime();
    const timeB = new Date(b.Timestamp).getTime();
    return timeB - timeA;
}

// 3. The Priority Inbox Class
class PriorityInbox {
    private limit: number;
    private topNotifications: Notification[];

    constructor(limit: number = 10) {
        this.limit = limit;
        this.topNotifications = [];
    }

    public processNewNotification(notif: Notification): void {
        this.topNotifications.push(notif);
        this.topNotifications.sort(comparePriority);
        
        if (this.topNotifications.length > this.limit) {
            this.topNotifications.pop();
        }
    }

    public getInbox(): Notification[] {
        return this.topNotifications;
    }
}

// --- EXECUTION & TESTING --- //

const incomingStream: Notification[] = [
    { ID: "d146095a", Type: "Result", Message: "mid-sem", Timestamp: "2026-04-22 17:51:30" },
    { ID: "b283218f", Type: "Placement", Message: "CSX Corporation hiring", Timestamp: "2026-04-22 17:51:18" },
    { ID: "81589ada", Type: "Event", Message: "farewell", Timestamp: "2026-04-22 17:51:06" },
    { ID: "0005513a", Type: "Result", Message: "mid-sem", Timestamp: "2026-04-22 17:50:54" },
    { ID: "ea836726", Type: "Result", Message: "project-review", Timestamp: "2026-04-22 17:50:42" },
    { ID: "003cb427", Type: "Result", Message: "external", Timestamp: "2026-04-22 17:50:30" },
    { ID: "e5c4ff20", Type: "Result", Message: "project-review", Timestamp: "2026-04-22 17:50:18" },
    { ID: "1cfce5ee", Type: "Event", Message: "tech-fest", Timestamp: "2026-04-22 17:50:06" },
    { ID: "cf2885a6", Type: "Result", Message: "project-review", Timestamp: "2026-04-22 17:49:54" },
    { ID: "8a7412bd", Type: "Placement", Message: "Advanced Micro Devices Inc. hiring", Timestamp: "2026-04-22 17:49:42" }
];

const inbox = new PriorityInbox(5);

console.log("\n--- Processing Incoming Notification Stream ---");
incomingStream.forEach(notif => {
    inbox.processNewNotification(notif);
});

console.log(`\n--- Top ${inbox.getInbox().length} Priority Notifications ---`);
console.table(inbox.getInbox(), ["Type", "Message", "Timestamp"]);