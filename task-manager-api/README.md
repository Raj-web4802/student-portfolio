# Practical 4: Task Management RESTful API

**Course Outcome / Program Outcome:** CO2 / PO3, PO5  
**Technology Stack:** Node.js, Express.js (JavaScript / CommonJS)

---

## 🎯 Objective

Design and implement a RESTful backend server with complete CRUD endpoints using an Express middleware pipeline (logging, Content-Type validation, route parameter validation, undefined route handling, and centralized global error handling).

---

## 🏗️ Architecture & Request Lifecycle Diagram

```text
Client (Postman / Thunder Client / Browser)
   │
   ▼
[1. Request Logging Middleware] (app.use)
   │  └── Logs: ${req.method} ${req.url} - ${timestamp}
   ▼
[2. Content-Type Header Validator] (app.use)
   │  └── Validates 'Content-Type: application/json' for POST/PUT requests
   ▼
[3. JSON Parser Middleware] (app.use(express.json()))
   │  └── Parses JSON payload into req.body
   ▼
Express Router (CRUD Routes)
   ├── GET    /tasks         ➔ getAllTasks (200 OK)
   ├── GET    /tasks/:id     ➔ getTaskById [validateTaskId] (200 OK / 404 / 400)
   ├── POST   /tasks         ➔ createTask (201 Created / 400 Bad Request)
   ├── PUT    /tasks/:id     ➔ updateTask [validateTaskId] (200 OK / 404 / 400)
   └── DELETE /tasks/:id     ➔ deleteTask [validateTaskId] (200 OK / 404 / 400)
   │
   ▼
[4. 404 Undefined Route Handler] (app.use)
   │  └── Catches unhandled routes and returns status 404 structured JSON
   ▼
[5. Global Error Handling Middleware] (app.use - 4 parameters)
      └── Catches exceptions via next(err), logs stack trace, returns status 500
```

---

## 📌 API Endpoints Reference

| Method | Endpoint | Description | Request Body | Status Codes |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/tasks` | Retrieve all tasks | None | `200 OK` |
| `GET` | `/tasks/:id` | Retrieve a task by numeric ID | None | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `POST` | `/tasks` | Create a new task | `{ "title": "Task name", "completed": false }` | `201 Created`, `400 Bad Request` |
| `PUT` | `/tasks/:id` | Update an existing task | `{ "title": "Updated", "completed": true }` | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `DELETE` | `/tasks/:id` | Delete a task by numeric ID | None | `200 OK`, `400 Bad Request`, `404 Not Found` |

---

## ⚙️ Middleware Pipeline Implementation

1. **Request Logger (`app.use`):**
   Logs method, path, and ISO timestamp for all incoming HTTP requests.
2. **Content-Type Validator (`app.use`):**
   Ensures all `POST` and `PUT` requests supply `Content-Type: application/json`.
3. **Route-Specific Task ID Validator (`validateTaskId`):**
   Validates that `:id` route parameter is a positive integer before hitting the route controller.
4. **404 Unhandled Route Handler:**
   Captures invalid routes and returns `{ "error": "Route not found" }`.
5. **Global Error Handler (`(err, req, res, next)`):**
   Catches thrown or forwarded errors (`next(err)`), logs errors server-side, and returns a safe standard HTTP 500 response.

---

## 💡 Key Questions & Theoretical Analysis

### 1. Why must the error handling middleware be defined last in the middleware chain?
Express executes middleware sequentially in the order they are registered via `app.use()`. Error-handling middleware (identified by having 4 arguments: `err, req, res, next`) only receives errors passed down the pipeline using `next(err)` or thrown inside async middleware. If defined before routes or other middleware, unhandled errors occurring in subsequent routes will bypass it completely.

### 2. What is the difference between `app.use()` and a route-specific middleware?
- **`app.use()` (Global Middleware):** Applies to every incoming request matching the base path (or all paths if no path is given), forming global stages in the request pipeline (e.g., logging, body parsing).
- **Route-specific Middleware:** Passed as argument(s) directly inside specific route declarations (e.g., `router.get('/tasks/:id', validateTaskId, controller)`). It executes only for that specific endpoint and method, enabling targeted validation or authentication.

### 3. Why is it considered bad practice to send raw error stack traces to the client?
Sending raw error stack traces exposes internal codebase structure, file system paths, database schema details, and server framework versions to clients. Attackers can exploit this information to discover vulnerability vectors. In production environments, stack traces should be logged internally while returning clean, sanitized error messages to the client.

---

## 🚀 How to Setup and Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Express Server
```bash
npm start
```
The server will run on `http://localhost:5000`.

### 3. Run Automated Tests
```bash
npm test
```

---

## 🧪 Testing with cURL / Postman

### GET all tasks
```bash
curl -X GET http://localhost:5000/tasks
```

### POST new task
```bash
curl -X POST http://localhost:5000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Submit Practical 4 Assignment", "completed": false}'
```

### PUT update task
```bash
curl -X PUT http://localhost:5000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

### DELETE task
```bash
curl -X DELETE http://localhost:5000/tasks/1
```
