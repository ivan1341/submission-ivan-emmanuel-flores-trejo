# Analysis Responses

## Candidate Information

| Field | Value |
|-------|-------|
| **Name** | Ivan Emmanuel Flores Trejo|
| **Date** | 23 Feb 2026|

---

## Question 1: Performance Bottlenecks

> What are the two main performance bottlenecks in your implementation? How would you address them?

### Bottleneck 1

**What:**  
List endpoints (`GET /api/projects`, `GET /api/projects/:id` with comments) return all records with no pagination.

**Why it's a problem:**  
As projects and comments grow, response size and MongoDB query time increase, hurting latency and memory on server and client.

**Solution:**  
Add pagination (e.g. `?limit=20&skip=0` or cursor-based). Paginate comments on project detail; optionally virtualize long lists on the frontend.

### Bottleneck 2

**What:**  
No caching on backend or frontend for repeated reads.

**Why it's a problem:**  
Every visit to lists, project detail, or dashboard hits MongoDB. Stats and project lists are recomputed on every request, increasing DB load and perceived latency.

**Solution:**  
Backend: short-TTL cache (in-memory or Redis) for stats and hot data. Frontend: use a data layer with cache (e.g. React Query, SWR) for lists and detail to cut duplicate requests and improve perceived speed.

---

## Question 2: Real-time Updates

> The client asks: "Can we add real-time updates so clients see new comments without refreshing?"

**Recommended approach:**  
WebSockets (e.g. **Socket.io**) so only users viewing a project get notified when a new comment is added.

**How it works:**  
On project detail, the client connects and joins a room for that `projectId`. When someone posts a comment, the server persists it and emits an event (e.g. `comment:added`) to the room; subscribed clients update the comment list without reloading.

**Why this approach:**  
WebSockets give low-latency push over a single bidirectional channel, suited to frequent, scoped updates. Polling is simpler but uses more traffic and adds delay; SSE is server-to-client only and could suffice if client-initiated events are not needed.

**Trade-offs:**  
WebSocket layer needs deployment and scaling (e.g. sticky sessions or Redis adapter for Socket.io), plus reconnection and disconnected UI handling. For low comment volume, polling every 10-15s is a simpler short-term option before moving to WebSockets.
