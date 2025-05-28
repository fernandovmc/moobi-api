# Moobi API

Backend API for the Moobi application built with NestJS, Prisma, and Supabase.

## Features

- User authentication via Supabase
- RESTful API endpoints
- PostgreSQL database with Prisma ORM
- Environment-based configuration

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   pnpm install
   ```
3. Configure your environment variables:
   ```
   cp .env.example .env
   ```
4. Edit the `.env` file with your database and Supabase credentials
5. Start the development server:
   ```
   pnpm run start:dev
   ```

## API Documentation

The API is available at `http://localhost:3001/api/v1`

### Authentication Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/auth/register` | Register a new user | `{ "email": "string", "password": "string", "name": "string" }` | User and session data |
| POST | `/auth/login` | Authenticate a user | `{ "email": "string", "password": "string" }` | User and session data |
| POST | `/auth/logout` | Logout a user | - | `{ "success": true }` |
| GET | `/auth/me` | Get current user info | - | User data or null |
| GET | `/auth/protected` | Example of protected route | - | User data and message |

### Authentication Example

#### Register a User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "Example User"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### Using the Authentication Token
For endpoints that require authentication, include the token in the Authorization header:
```
Authorization: Bearer your-token-here
```

## Technologies

- NestJS
- Prisma ORM
- PostgreSQL
- Supabase
- TypeScript
