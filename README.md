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
| GET | `/auth/protected` | Test protected route | - | `{ "message": string, "user": User }` |

### Account Endpoints for N8N Integration

These endpoints are particularly useful for integration with N8N workflows and importing Nubank data:

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/accounts` | Get all accounts | - | `{ accounts: Account[] }` |
| GET | `/accounts/:id` | Get account by ID | - | `{ account: Account }` |
| POST | `/accounts` | Create a new account | See details below | `{ account: Account, message: string }` |
| PUT | `/accounts/:id` | Update an account | See details below | `{ account: Account, message: string }` |
| DELETE | `/accounts/:id` | Delete an account (will fail if contains transactions) | - | `{ success: true, message: string }` |
| PUT | `/accounts/:id/deactivate` | Deactivate an account (preferred over deletion) | - | `{ account: Account, message: string }` |

#### Account Request Body Schema

For creating or updating accounts (critical for N8N integration with Nubank):

```json
{
  "name": "string", // Required: Account name (e.g., "Nubank Credit Card")
  "type": "checking|savings|credit", // Required: Account type
  "balance": number, // Required: Initial or updated balance
  "color": "string", // Optional: Color code for UI
  "isActive": boolean // Optional: Account status (defaults to true)
}
```

#### Account Response Schema

```json
{
  "id": "string", // UUID of the account
  "name": "string", // Account name
  "type": "checking|savings|credit", // Account type
  "balance": number, // Current balance
  "color": "string", // Color code
  "isActive": boolean, // Account status
  "userId": "string", // ID of the account owner
  "createdAt": "Date", // Creation timestamp
  "updatedAt": "Date" // Last update timestamp
}
```

### Category Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/categories` | Get all categories | - | `{ categories: Category[] }` |
| GET | `/categories?type=income|expense` | Get categories by type | - | `{ categories: Category[] }` |
| GET | `/categories/:id` | Get category by ID | - | `{ category: Category }` |
| POST | `/categories` | Create a new category | `{ "name": "string", "type": "income|expense", "color": "string", "icon": "string" }` | `{ category: Category, message: string }` |
| PUT | `/categories/:id` | Update a category | `{ "name": "string", "type": "income|expense", "color": "string", "icon": "string" }` | `{ category: Category, message: string }` |
| DELETE | `/categories/:id` | Delete a category | - | `{ success: true, message: string }` |
| POST | `/categories/default` | Create default categories | - | `{ count: number, message: string }` |

## N8N Integration Guide for Nubank Data

### Setting Up N8N for Nubank Data Import

1. **Authentication**: Obtain an API token by logging in to Moobi API
2. **Create an Account First**: Before importing transactions, create a dedicated Nubank account in Moobi:

```http
POST /api/v1/accounts
Content-Type: application/json
Authorization: Bearer your-token-here

{
  "name": "Nubank Credit Card",
  "type": "credit",
  "balance": 0
}
```

3. **Save the account ID** from the response to use in your transaction import workflow

### Example N8N Workflow for Nubank Data

1. **Nubank Node**: Extract transaction data
2. **HTTP Request Node**: Send data to Moobi API
   - Use the account ID from step 2
   - Map Nubank transaction fields to Moobi transaction format
   - Include proper authentication

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

#### Create an Account for Nubank Import
```http
POST /api/v1/accounts
Content-Type: application/json
Authorization: Bearer your-token-here

{
  "name": "Nubank Credit Card",
  "type": "credit",
  "balance": 0,
  "color": "#8A05BE"
}
```

#### Get All Accounts
```http
GET /api/v1/accounts
Authorization: Bearer your-token-here
```

#### Update Account Balance
```http
PUT /api/v1/accounts/account-id-here
Content-Type: application/json
Authorization: Bearer your-token-here

{
  "balance": 1250.75
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
