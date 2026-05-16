```markdown
# Stage 1: API Design & Real-Time Mechanism

### Core Actions
1. Fetch notifications (with pagination and filtering).
2. Mark a specific notification as read.
3. Mark all notifications as read.

### REST API Endpoints

**1. Fetch Notifications**
* **Endpoint:** `GET /api/v1/notifications`
* **Headers:** `Authorization: Bearer <token>`
* **Query Params:** `page` (int), `limit` (int), `notification_type` (enum: Event, Result, Placement)
* **Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "Placement",
      "message": "CSX Corporation hiring",
      "isRead": false,
      "timestamp": "2026-04-22T17:51:18Z"
    }
  ],
  "meta": { "total": 50, "page": 1, "limit": 10 }
}

```

**2. Mark Notification as Read**

* **Endpoint:** `PATCH /api/v1/notifications/{id}/read`
* **Headers:** `Authorization: Bearer <token>`
* **Request Body:** `{}`
* **Response (200 OK):**

```json
{ "message": "Notification marked as read successfully." }

```

### Real-Time Notification Mechanism

For real-time delivery, I propose **Server-Sent Events (SSE)**.

* **Why:** Notifications are a unidirectional data flow (Server -> Client). Unlike WebSockets, which are bidirectional and heavier to scale, SSE operates over standard HTTP, making it easier to load balance, natively supports auto-reconnection, and is highly efficient for pushing real-time campus updates to students.

---

# Stage 2: Database Storage & Queries

### Database Choice

I suggest **PostgreSQL**. It provides strong ACID compliance, robust indexing (like B-Trees and partial indexes), and native support for partitioning, which is highly beneficial for time-series-like notification data.

### Database Schema

```sql
CREATE TYPE notif_type AS ENUM ('Event', 'Result', 'Placement');

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studentID INT NOT NULL,
    notificationType notif_type NOT NULL,
    message TEXT NOT NULL,
    isRead BOOLEAN DEFAULT false,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

```

### Handling Data Volume Increases

As data scales to millions of rows, the following strategies should be applied:

1. **Table Partitioning:** Partition the `notifications` table by `createdAt` (e.g., monthly partitions) so queries naturally scan smaller physical data blocks.
2. **Archiving:** Move notifications older than 6 months to cold storage (e.g., AWS S3 or a cheaper analytics DB) since students rarely check old notifications.

### REST API Queries

**Fetch Notifications:**

```sql
SELECT id, notificationType, message, isRead, createdAt 
FROM notifications 
WHERE studentID = $1 AND notificationType = $2
ORDER BY createdAt DESC 
LIMIT $3 OFFSET $4;

```

**Mark as Read:**

```sql
UPDATE notifications SET isRead = true WHERE id = $1 AND studentID = $2;

```

---

# Stage 3: Query Optimization

### Analysis of the Slow Query

**Query:** `SELECT * FROM notifications WHERE studentID = 1042 AND isRead = false ORDER BY createdAt ASC;`

* **Accuracy:** Yes, the query is functionally accurate.
* **Why it's slow:** Without a composite index, the database engine must perform a Full Table Scan across 5,000,000 rows to find the unread notifications for a specific student, and then load them into memory to sort them.

### Optimization & Cost

To fix this, I would create a composite B-Tree index:

```sql
CREATE INDEX idx_student_unread_time ON notifications (studentID, isRead, createdAt);

```

* **Computation Cost:** The query cost shifts from O(N) (scanning all rows) to O(log N) for the index traversal. The DB can now directly pinpoint the student's unread notifications already sorted by time, fetching results in milliseconds.

### Critique on Indexing Every Column

Adding an index to every column is **highly ineffective and an anti-pattern**.

* **Trade-offs:** Every time a new notification is inserted or updated, the database must update every single index. This causes massive write-amplification, significantly slowing down `INSERT` and `UPDATE` operations, and consumes excessive disk space. Indexes should only be applied to columns frequently used in `WHERE`, `JOIN`, or `ORDER BY` clauses.

### Query for Placement Notifications (Last 7 Days)

```sql
SELECT DISTINCT studentID 
FROM notifications 
WHERE notificationType = 'Placement' 
AND createdAt >= NOW() - INTERVAL '7 days';

```

---

# Stage 4: Performance Improvements

Fetching notifications on every page load overwhelms the database.

### Solutions & Trade-offs

1. **Caching Layer (Redis):**
* **Strategy:** Cache the "unread count" for each student in Redis. When the page loads, fetch the count from Redis (O(1) time). Only hit the PostgreSQL DB when the student actively clicks the notification bell to view the actual feed.
* **Trade-off:** Data staleness. If a notification is read on a mobile device, the web cache must be explicitly invalidated to keep them in sync, increasing system complexity.


2. **Cursor-Based Pagination:**
* **Strategy:** Instead of `OFFSET` pagination (which becomes slower on deep pages because the DB still computes skipped rows), use cursors (e.g., `WHERE createdAt < last_seen_timestamp`).
* **Trade-off:** Users cannot jump to a specific page number (e.g., "Page 5"); they can only go to "Next" or "Previous".



---

# Stage 5: Reliability & Fast Delivery

### Shortcomings of the Current Implementation

The current pseudocode is **synchronous and blocking**. If the `send_email` API times out or fails (e.g., due to rate limits), the loop breaks or stalls. This is exactly why 200 students didn't get their emails. Furthermore, looping 50,000 times sequentially will take minutes, meaning it is not "simultaneous".

### Transactional Integrity

Saving to the DB and sending the email **should not** happen in the same synchronous transaction. Network calls (emails) are unpredictable. If the email fails, rolling back the DB insert means the student loses the in-app notification too.

### Redesign: Event-Driven Architecture

To make this reliable and fast, we must decouple the DB insertion from the external network calls using a **Message Queue** (like RabbitMQ or AWS SQS) and an asynchronous worker pool.

### Revised Pseudocode

```python
# Main API Handler (Fast, returns 200 OK immediately)
function notify_all(student_ids: array, message: string):
    # 1. Bulk insert to DB in one go (Fast)
    bulk_save_to_db(student_ids, message)
    
    # 2. Push tasks to a Message Queue (Fast)
    for student_id in student_ids:
        publish_to_queue("notification_events", {student_id, message})

    # 3. Trigger Real-Time App UI update
    broadcast_sse_event(message)

# ---------------------------------------------------------
# Background Worker Service (Consumes from Queue asynchronously)
function process_queue_worker(event):
    try:
        send_email(event.student_id, event.message)
    except EmailDeliveryError:
        # If email fails, the queue automatically retries it later
        # without affecting other students.
        requeue_message_with_delay(event)

```

```