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

#### **1. Technology Stack**
* **Runtime:** **Node.js** as the core execution environment.
* **Framework:** **Express.js**, chosen for its minimalist and flexible middleware-based routing.
* **Database & ODM:** **MongoDB** with **Mongoose** for schema enforcement and simplified document interaction.

#### **2. Project Organization**
The server follows a "Separation of Concerns" (SoC) principle to ensure high maintainability:
* **`src/app.js`:** Centralized Express configuration including middlewares, CORS, route mounting, and Swagger documentation setup.
* **`src/server.js`:** Entry point for server bootstrapping and database connection initialization.
* **`src/config/`:** Infrastructure configuration, including Database connections (`db.js`) and OpenAPI/Swagger specifications (`swagger.js`).
* **`src/models/`:** Mongoose schemas representing the data layer (`User`, `Project`, `Comment`).
* **`src/routes/`:** Domain-driven routing logic (Auth, Projects, Dashboard, Users).
* **`src/middleware/`:** Logic for JWT authentication and Role-Based Access Control (RBAC).
* **`tests/`:** Integration testing suite utilizing the native `node:test` runner, `supertest` for HTTP assertions, and an **in-memory MongoDB** for isolated test environments.

#### **3. Key Architectural Decision**
* **Scalable Directory Structure:**
    * **Decision:** We established a clear decoupling between configuration, models, routes, and middleware. 
    * **Impact:** This modularity simplifies the addition of new endpoints or domains and prevents the "Fat Controller" anti-pattern, allowing the API to scale horizontally in terms of features without increasing technical debt.

### Frontend Structure

#### **1. Technology Stack**
* **Core Framework:** **React** with **TypeScript** for type safety and improved developer experience.
* **Build Tool:** **Vite**, chosen for its superior development server speed and optimized production bundling.
* **Styling:** **Tailwind CSS**, utilizing a utility-first approach for rapid and consistent UI development.

#### **2. Project Organization**
The project follows a modular directory structure to ensure maintainability:
* **`src/main.tsx` & `src/App.tsx`:** Application entry point and global provider configuration.
* **`src/router/`:** Centralized route definitions, including `ProtectedRoute` and `PublicOnly` guards.
* **`src/contexts/`:** **AuthContext** implementation to manage user sessions, JWT tokens, and authentication errors.
* **`src/lib/api.ts`:** A centralized HTTP client (Fetch API) with integrated TypeScript types for consistent API communication.
* **`src/components/`:** Reusable UI components (Responsive `Layout` with Header/Footer, `AuthHeader`, etc.).
* **`src/pages/`:** High-level views (Login, Register, Dashboards, Projects, 404).

#### **3. Key Architectural Decisions**
* **State Management Strategy:**
    * **Global State:** Leveraged **React Context + Hooks** strictly for minimal global data (specifically Authentication).
    * **Local State:** Application data is kept as local state within pages to reduce complexity, prevent unnecessary re-renders, and maintain a "KISS" (Keep It Simple, Stupid) code philosophy.

### Database Design

#### **1. Technology Stack**
* **Database:** MongoDB, chosen for its flexibility with document-based structures.
* **ODM (Object Data Modeling):** **Mongoose**, used to enforce schema validation and manage relationships within the application logic.

#### **2. Key Technical Decisions**
* **Referential Integrity:** Implementation of **References (ObjectId)** between collections. This allows the use of `.populate()` to efficiently fetch related data (e.g., attaching user details to comments or project owners).
* **Data Transformation:** Applied `toJSON` transformations across all models to:
    * **Expose a user-friendly `id`** (converting `_id` to `id`).
    * **Sanitize Output:** Automatically exclude sensitive fields, such as `password` and `__v`, from API responses.

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


#### **1. Frontend-Backend Synchronization**
* **API Alignment:** We strictly aligned routes, HTTP methods, and response formats (e.g., `PATCH /projects/:id`, `/projects/stats`, and structured `comment` objects).
* **Impact:** This ensures that React consumes the API natively, eliminating the need for complex "glue code" or heavy data transformation layers on the client side.

#### **2. Modern Testing Strategy (ESM + MongoDB)**
* **Context:** Adopting modern Node.js with `"type": "module"` (ESM) can introduce compatibility challenges with legacy testing frameworks.
* **Technical Solution:** We opted for a lightweight yet powerful stack:
    * **`node:test`:** Node's native test runner for high performance and zero external dependencies.
    * **`supertest`:** For reliable HTTP integration testing.
    * **`mongodb-memory-server`:** To run realistic integration tests against a real MongoDB instance in-memory, removing the dependency on an external or shared database.

#### **3. Responsiveness & UX Design**
* **Mobile-First Approach:** The UI layout was optimized using Tailwind CSS to ensure a seamless experience across all devices:
    * **Fluid Layouts:** Wider, more accessible forms for desktop users.
    * **Navigation:** Responsive Header featuring a "hamburger" menu for mobile viewports.
    * **Consistency:** A persistent Footer across all views to maintain structural integrity.

#### **4. Key Technical Decisions**
* **Integration Strategy:** By mirroring the backend's domain logic directly in the frontend types, we reduced debugging time and improved end-to-end data consistency.
* **Test Isolation:** The use of an in-memory database ensures that tests are idempotent (they don't interfere with each other) and can run in any CI/CD environment without extra configuration.

---

## Trade-offs


#### **1. Database Choice: MongoDB/Mongoose vs. SQL/ORM**
* **Decision:** Selected **MongoDB with Mongoose** to prioritize development speed and flexibility.
* **Justification:** The core domain entities (Projects and Comments) map naturally to document-based structures, allowing for nested data and schema fluidity.
* **Future Consideration:** For more complex reporting requirements or heavy relational data (native Joins), a migration to an RDBMS like **PostgreSQL with Prisma** would be evaluated to ensure strict data integrity and advanced querying capabilities.

#### **2. Lean State Management**
* **Decision:** Implemented **React Context** exclusively for authentication; no heavy state management libraries (Redux, Zustand, or MobX) were introduced.
* **Justification:** Keeping the architecture "KISS" (Keep It Simple, Stupid) avoids unnecessary boilerplate for the current scope.
* **Future Consideration:** As the frontend scales with more complex workflows and views, a more robust global state solution.

#### **3. Testing Focus: Integration over Unit Testing**
* **Decision:** Prioritized **Integration Tests** over pure Unit Tests.
* **Justification:** This approach ensures that the "happy path" (from HTTP request to Database persistence) works as expected, providing higher confidence with simpler initial configuration.
* **Future Consideration:** While integration tests provide broad coverage, they are inherently slower. Future iterations would include isolated **Unit Tests** for custom middlewares and validation logic to improve test suite performance and granularity.
---

## Resources Used

*Express and Mongoose (models, middleware, validation).
React, React Router, and Vite.
Tailwind CSS for responsive design utilities.
Node.js Test Runner and supertest examples + mongodb-memory-server.*

*Generate component skeletons and routes.
Adjust Docker/Docker Compose configuration and automated test flows.
*

