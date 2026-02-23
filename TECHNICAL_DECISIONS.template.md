# Technical Decisions

## Candidate Information

| Field | Value |
|-------|-------|
| **Name** | Ivan Emmanuel Flores Trejo |
| **Date Started** | 19 Feb 2026 |
| **Date Completed** | 23 Feb 2026 |
| **Total Time Spent** | 20 hrs |

---

## Summary

*A system was built to track projects, allowing the client to review their status and provide feedback.

The MERN stack was used, enabling execution in low-resource environments. AWS EC2 was used for deployment.*



---

## Technology Stack

### Backend

| Component | Choice | Why? |
|-----------|--------|------|
| Framework | Express | High performance, small learning curve, high flexibility and lots of documentation. |
| Database | MongoDB| It's a lightweight database, it uses few resources |
| ORM | Mongoose |  |

### Frontend

| Component | Choice | Why? |
|-----------|--------|------|
| Framework | React | Lightweight and fast, with extensive documentation and easy use of reusable components |
| State Management | Nativo de React | Simple, no neceita dependencias extras|
| Styling | Tailwind | It's very lightweight and speeds up page loading because it only uses the necessary CSS classes. Fast prototyping. |

---

## Architecture Decisions

### Backend Structure

*Brief description of how you organized your backend code.*

### Frontend Structure

*Brief description of how you organized your frontend code.*

### Database Design

*Describe your schema and any important design decisions.*

---

## Security

### **Security & Access Control Architecture**

#### **1. Authentication**
* **JWT Implementation:** Utilizing JSON Web Tokens (JWT) with a dedicated `JWT_SECRET` and configurable expiration settings.
* **User Management:** Secure Login/Registration flow featuring password hashing via **bcrypt**, implemented through a `pre('save')` hook in the User model.

#### **2. Authorization & Middleware**
* **`authenticate` Middleware:** Validates the JWT, retrieves the user from the database, and injects the user object into `req.user` for subsequent logic.
* **Role-Based Access Control (RBAC):** * `requireRole('admin')` middleware specifically protects administrative endpoints (e.g., `/projects`, `/users`, `/projects/stats`).
    * **Query Filtering:** Dynamic data filtering based on roles—Admins have full visibility, while Clients are restricted to their specific projects and assignments.

#### **3. Input Validation**
* **`express-validator` Integration:** Applied across all critical routes:
    * **Auth:** Email format and password strength.
    * **Projects:** Name, status, and ID validation.
    * **Comments:** Content integrity and sanitization.

#### **4. CORS & API Exposure**
* **Local Development:** CORS is configured to allow requests only from trusted local origins.
* **Production (Docker/Nginx):** In the containerized environment, the Frontend communicates with the Backend via the `/api` prefix on the same domain through an **Nginx reverse proxy**. This architectural choice eliminates CORS issues and simplifies SSL management.

---

## Challenges

*What was the most difficult part? How did you solve it?*

---

## Trade-offs

*I chose MongoDB/Mongoose for its development speed and because the domain (projects/comments) is well-modeled as documents.
With more time, I might consider an RDBMS (PostgreSQL + Prisma) for more complex reports and native joins.*

---

## Resources Used

*Express and Mongoose (models, middleware, validation).
React, React Router, and Vite.
Tailwind CSS for responsive design utilities.
Node.js Test Runner and supertest examples + mongodb-memory-server.*

*Generate component skeletons and routes.
Adjust Docker/Docker Compose configuration and automated test flows.
*

