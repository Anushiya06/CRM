# CRM + Khata MERN Starter

A simplified Customer Relationship Management and Digital Ledger system built with MongoDB, Express, React, Node.js, Vite, Tailwind CSS, Axios, and React Router.

## Setup

```bash
npm run install:all
```

Create `server/.env` from `server/.env.example`, then start both apps:

```bash
npm run dev
```

- API: `http://localhost:5000`
- Web app: `http://localhost:5173`

## Demo Flow

1. Register or log in.
2. Create products from Inventory.
3. Send mock leads to `POST /api/webhook` with `{ "phone": "...", "message": "price please" }`.
4. Convert hot leads into customers.
5. Create cash or credit sales from POS.
6. Track and settle dues from Khata Ledger.
