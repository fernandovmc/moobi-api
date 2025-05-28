# Moobi API

Backend API for the Moobi application built with NestJS, Prisma, and Supabase.

## Features

- User authentication via Supabase
- RESTful API endpoints
- PostgreSQL database with Prisma ORM
- Environment-based configuration
- Account management
- Category management
- Transaction tracking

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
| GET | `/auth/users` | Get all users (admin) | - | List of users |
| GET | `/auth/users/:id` | Get user by ID (admin) | - | User data |
| PUT | `/auth/users/:id` | Update user (admin) | `{ "name": "string", "email": "string" }` | Updated user data |
| DELETE | `/auth/users/:id` | Delete user (admin) | - | `{ "success": true }` |

### Account Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/accounts` | Get all accounts | - | List of accounts |
| GET | `/accounts/:id` | Get account by ID | - | Account data |
| POST | `/accounts` | Create a new account | `{ "name": "string", "type": "checking\|savings\|credit", "balance": number }` | Created account data |
| PUT | `/accounts/:id` | Update an account | `{ "name": "string", "type": "checking\|savings\|credit", "balance": number, "isActive": boolean }` | Updated account data |
| DELETE | `/accounts/:id` | Delete an account | - | `{ "success": true }` |
| PUT | `/accounts/:id/deactivate` | Deactivate an account | - | Updated account data |

### Category Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/categories` | Get all categories | - | List of categories |
| GET | `/categories?type=income\|expense` | Get categories by type | - | Filtered list of categories |
| GET | `/categories/:id` | Get category by ID | - | Category data |
| POST | `/categories` | Create a new category | `{ "name": "string", "type": "income\|expense", "color": "string", "icon": "string" }` | Created category data |
| PUT | `/categories/:id` | Update a category | `{ "name": "string", "type": "income\|expense", "color": "string", "icon": "string" }` | Updated category data |
| DELETE | `/categories/:id` | Delete a category | - | `{ "success": true }` |
| POST | `/categories/default` | Create default categories | - | `{ "count": number, "message": "string" }` |

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

### Account Example

#### Create an Account
```http
POST /api/v1/accounts
Content-Type: application/json
Authorization: Bearer your-token-here

{
  "name": "My Checking Account",
  "type": "checking",
  "balance": 1000
}
```

### Category Example

#### Create a Category
```http
POST /api/v1/categories
Content-Type: application/json
Authorization: Bearer your-token-here

{
  "name": "Groceries",
  "type": "expense",
  "color": "#FF5733",
  "icon": "shopping_cart"
}
```

## Database Schema

The application uses a PostgreSQL database with the following structure:

- **User**: Stores user information
- **Account**: Represents financial accounts (checking, savings, credit)
- **Category**: Categorizes transactions (income, expense)
- **Transaction**: Records financial transactions

## Technologies

- NestJS
- Prisma ORM
- PostgreSQL
- Supabase
- TypeScript
