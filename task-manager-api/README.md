# Practical 5: MongoDB Task Manager API

A RESTful task API built with Node.js, Express, MongoDB, and Mongoose.

## Features

- MongoDB-backed CRUD operations
- Mongoose schema validation
- Required `title` field
- `description`, `completed`, `createdAt`, and `priority` fields
- `priority` restricted to `low`, `medium`, or `high`
- Automatic title trimming before validation
- Structured validation errors
- Request logging and centralized error handling
- ObjectId validation and 404 responses

## Setup

1. Install dependencies:

```powershell
npm install
```

2. Install and start MongoDB locally, or create a MongoDB Atlas database.

3. Copy `.env.example` to `.env` and set the connection string:

```env
MONGO_URI=mongodb://127.0.0.1:27017/taskmanager
PORT=5000
JWT_SECRET=replace-with-a-long-random-secret
```

The `.env` file is ignored by Git. Never commit credentials or a private connection string.

4. Start the API:

```powershell
npm start
```

The server connects to MongoDB before listening on `http://localhost:5000`.

## Authentication

Register and login are public. Passwords are hashed with bcrypt and never returned to clients. Login returns a JWT valid for one hour.

| Method | Endpoint | Result |
| --- | --- | --- |
| POST | `/auth/register` | Create an account |
| POST | `/auth/login` | Return a JWT and public user |
| GET | `/me` | Return the authenticated user |

Send this header with `/me` and all task requests:

```text
Authorization: Bearer YOUR_JWT_TOKEN
```

## Task Endpoints

| Method | Endpoint | Result |
| --- | --- | --- |
| GET | `/tasks` | Return all tasks |
| GET | `/tasks/:id` | Return one task or 404 |
| POST | `/tasks` | Create a task |
| PUT | `/tasks/:id` | Update a task |
| DELETE | `/tasks/:id` | Delete a task |

POST and PUT requests require the header `Content-Type: application/json`.

Example request body:

```json
{
  "title": "Complete Practical 5",
  "description": "Connect the API to MongoDB",
  "completed": false,
  "priority": "high"
}
```

## Validation Response

A missing title or invalid priority returns a safe structured response such as:

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "title",
      "message": "Task title is required"
    }
  ]
}
```

## Tests

Run the database-independent checks with:

```powershell
npm test
```

The automated tests verify schema validation, defaults, title trimming, middleware, ObjectId validation, and undefined routes. Use Postman with a running MongoDB instance to verify live CRUD persistence after restarting the server.

## Viva Notes

- MongoDB is schema-less at the database level, but Mongoose schemas enforce a predictable application data contract.
- Required fields and defaults belong in the schema so every client receives the same validation rules.
- Mongoose validation runs before a document is saved. A failed validation rejects the operation and is converted by the global error handler into structured JSON.
- The server logs detailed errors internally but does not expose raw stack traces to clients.
