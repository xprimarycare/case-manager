# Case Management System

A full-stack case management application built with NestJS, React, and PostgreSQL.

## Tech Stack

- **Backend**: NestJS
- **Frontend**: React with Vite
- **Database**: PostgreSQL 17.7
- **ORM**: Prisma
- **Monorepo**: Nx
- **API Documentation**: Swagger/OpenAPI

## Prerequisites

- Node.js (v20 or higher)
- Docker and Docker Compose
- npm or yarn

## Getting Started (local)

### 1. Install Dependencies

npm install

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/case-management"
PORT=3000

Create a `.env` file in the `web` directory:

VITE_API_BASE_URL=http://localhost:3000/api

### 3. Start the Database

docker compose up -d

This will start a PostgreSQL database container on port 5432.

### 4. Run Database Migrations

npx prisma migrate deploy

Or for development:

npx prisma migrate dev

### 5. Generate Prisma Client

npx prisma generate## Running the Application

### Start the API Server

npx nx serve api

The API will be available at `http://localhost:3000/api`

API documentation (Swagger) is available at `http://localhost:3000/api-docs`

### Start the Frontend

npx nx serve web

The web application will be available at `http://localhost:4200` (or the port shown in the terminal).

## Database Management

### Access Prisma Studio

npx prisma studio

This opens a visual database browser at `http://localhost:5555`
