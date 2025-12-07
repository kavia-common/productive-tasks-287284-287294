# productive-tasks-287284-287294

This workspace contains a React frontend (todo_frontend) and a Spring Boot backend (backend in a sibling workspace).

Integration notes:
- Frontend uses REACT_APP_API_BASE to target the backend in development (default suggested: http://localhost:3001/api).
- In production/preview, frontend defaults to relative "/api" so apps can be served from the same origin with the backend mounted under /api.
- Backend should enable CORS and read FRONTEND_ORIGIN (default http://localhost:3000) from application.properties to allow the frontend origin during development.

Refer to todo_frontend/.env.example for environment variables.