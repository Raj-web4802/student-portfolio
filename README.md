# Student Portfolio + Task Manager

This repository contains the React portfolio frontend and the Express/MongoDB task manager used for Practical 6 full-stack integration.

## Run the full stack

### Backend

1. Make sure the local MongoDB service is running.
2. Create `task-manager-api/.env` from `task-manager-api/.env.example`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/taskmanager
PORT=5000
JWT_SECRET=replace-with-a-long-random-secret
```

3. Start the API in one terminal:

```powershell
cd task-manager-api
npm install
npm start
```

### Frontend

Start the React app in a second terminal from the repository root:

```powershell
npm install
npm run dev
```

Open `http://localhost:5173/login`, register an account, and then use the protected Task workspace. It supports JWT authentication, create/read/update/delete, loading/error states, optimistic creation rollback, delete confirmation, logout, and operation notifications. Data is scoped to the authenticated user and persisted to MongoDB through the backend.

The frontend API URL defaults to `http://localhost:5000`. To use another backend URL, create a root `.env` file with `VITE_API_URL=...`.

Run frontend checks with `npm run build` and `npm run lint`. Run backend checks from `task-manager-api` with `npm test`.

## Practical 7 flow

1. Register with `POST /auth/register` using an email and password of at least 8 characters.
2. Login with `POST /auth/login` and copy the returned JWT.
3. Send `Authorization: Bearer <token>` with `GET /me` and every `/tasks` request.
4. Use the frontend login screen or Postman to create and manage private tasks.
5. Logout clears the browser token. Missing, invalid, or expired tokens return `401`.

## Earlier Vite notes

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
