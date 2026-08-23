# API Notes

## DummyJSON
- `POST /auth/login` — username, password, expiresInMins. Returns access and refresh tokens plus user data.
- `POST /auth/refresh` — refreshToken, expiresInMins. Returns new access and refresh tokens.

Base URL: `https://dummyjson.com`

## JSONPlaceholder
- `GET https://jsonplaceholder.typicode.com/posts?_limit=5`
- Used only for simulated notification polling. New post IDs become local notifications.

## Mock data service
- `GET /mock-data.json`
- The file is treated as a backend-shaped source and is accessed only through `fetchMockData()`.
