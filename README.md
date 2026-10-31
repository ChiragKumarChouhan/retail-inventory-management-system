# Retail Inventory Management System

A full-stack web application designed to help businesses manage inventory, monitor sales performance, and make data-driven decisions through a centralized dashboard.

## Project Overview

The Retail Inventory Management System provides a centralized platform for managing products, tracking inventory, monitoring sales, and analyzing business performance.

It helps businesses identify low-stock products, understand sales trends, and maintain better control over inventory operations.

## Technology Stack

**Frontend**
- React.js
- Vite
- Tailwind CSS
- React Router
- Recharts
- Lucide React

**Backend**
- Node.js
- Express.js
- REST APIs
- JWT Authentication
- bcryptjs

**Database**
- PostgreSQL

## Key Features

- User Registration and Login
- Interactive Dashboard
- Inventory Management
- Product Management (CRUD)
- Sales Management
- Business Analytics
- Demand Forecasting
- Low-Stock Alerts
- Search, Filtering and Pagination
- PostgreSQL Database Integration

## Project Structure

```text
retail-inventory-management-system/
├── frontend/
│   └── src/
├── backend/
│   ├── routes/
│   ├── db.js
│   └── server.js
├── public/
├── .env.example
└── README.md
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/ChiragKumarChouhan/retail-inventory-management-system.git
```

### 2. Setup Backend

```bash
cd retail-inventory-management-system/backend
npm install
```

Configure your PostgreSQL database and environment variables before starting the server.

```bash
npm run dev
```

### 3. Setup Frontend

Open another terminal:

```bash
cd retail-inventory-management-system/frontend
npm install
npm run dev
```

### 4. Database Configuration

The application uses PostgreSQL. Configure the database connection using the environment variables described in `.env.example`.

## API Base URL

```text
http://localhost:5000/api
```

## Developer

**Chirag Kumar Chauhan**

B.Tech Student

## Future Improvements

- Improved demand forecasting
- Advanced inventory intelligence
- Enhanced business analytics
- Additional automation features
