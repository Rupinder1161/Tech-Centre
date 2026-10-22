# Laptop Inventory Management System

A production-ready local web application for tracking laptop movement in and out of a Tech Centre.

## Features

- Dashboard with current inventory, received, and sent-out totals
- Receive laptop records (IN)
- Send laptop records (OUT)
- Inventory list showing laptops currently in the Tech Centre
- Transaction history with pagination
- Laptop search by number
- Excel export for the current inventory
- SQLite persistence
- Validation for duplicate IN/OUT actions
- Modern responsive UI using React + Tailwind CSS

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Axios, React Router
- Backend: Node.js, Express
- Database: SQLite
- Reporting: XLSX

## Project Structure

```text
laptop-inventory/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── ...
├── server/
│   ├── controllers/
│   ├── database/
│   ├── exports/
│   ├── routes/
│   ├── services/
│   ├── server.js
│   └── package.json
├── package.json
├── README.md
└── .gitignore
```

## Prerequisites

- Node.js 18+
- npm

## Installation

```bash
cd laptop-inventory
npm install
npm --prefix server install
npm --prefix client install
```

## Database Setup

The SQLite database file is created automatically when the backend starts.

- Database file: `server/database/inventory.db`
- Initial schema is created in `server/database/db.js`

## Running the Application

### Start both frontend and backend

```bash
npm run dev
```

### Start backend only

```bash
npm run server
```

### Start frontend only

```bash
npm run client
```

## API Documentation

### Dashboard

- GET `/api/dashboard`

```json
{
  "currentInventory": 87,
  "totalReceived": 250,
  "totalSentOut": 163
}
```

### Receive laptop

- POST `/api/in`

Request body:

```json
{
  "laptopNumber": "LT001",
  "purpose": "NEW STOCK",
  "notes": "New Dell Latitude"
}
```

### Send laptop

- POST `/api/out`

Request body:

```json
{
  "laptopNumber": "LT001",
  "purpose": "USER ISSUE",
  "notes": "Given to John Smith"
}
```

### Inventory list

- GET `/api/inventory`

### Transactions

- GET `/api/transactions?page=1&limit=10`

### Search by laptop number

- GET `/api/search?q=LT001`

### Export Excel

- GET `/api/export`

Downloads the file named:

```text
Inventory_Report_YYYY_MM.xlsx
```

## Business Rules

- Only two actions are allowed: `IN` and `OUT`
- A laptop can be marked as `IN` only if its latest recorded action is not already `IN`
- A laptop can be marked as `OUT` only if its latest recorded action is `IN`
- The latest transaction determines the current status of the laptop

## Validation Rules

The backend rejects:

- Empty laptop numbers
- Duplicate `IN` transactions when the laptop is already in the Tech Centre
- Duplicate `OUT` transactions when the laptop is already outside the Tech Centre

## Screenshots

Placeholders for screenshots:

- Dashboard page
- Inventory page
- Transaction page
- Receive laptop form
- Send laptop form

## Deployment Notes

This project is intended for local development. For deployment, you would typically:

1. Run the Node.js backend on a server
2. Set production environment variables
3. Build the frontend with `npm --prefix client run build`
4. Serve the static frontend files or reverse proxy them behind the backend
5. Keep the SQLite database on a persistent volume

## Support

This app is built for local tracking of laptop inventory and transaction history in a Tech Centre environment.
