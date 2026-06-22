# TODO - Express modular backend refactor

## Step 1: Create folder structure
- [ ] Create: `server/config`, `server/models`, `server/controllers`, `server/routes`, `server/middleware`, `server/utils`

## Step 2: Add config/db
- [ ] Create `server/config/db.js` exporting `connectDB()` using `process.env.MONGO_URI`

## Step 3: Extract Mongoose models
- [ ] Create models:
  - [ ] `server/models/User.js`
  - [ ] `server/models/Product.js`
  - [ ] `server/models/Lead.js`
  - [ ] `server/models/Customer.js`
  - [ ] `server/models/Sale.js`
  - [ ] `server/models/KhataAccount.js`

## Step 4: Add middleware + utils
- [ ] Create `server/middleware/requireAuth.js`
- [ ] Create `server/middleware/errorHandler.js`
- [ ] Create `server/utils/makeToken.js`

## Step 5: Create controllers
- [ ] `authController` (register/login)
- [ ] `leadController` (webhook, list leads, convert-from-lead)
- [ ] `productController` (CRUD + list/create)
- [ ] `customerController` (CRUD + list)
- [ ] `saleController` (create sale with stock update + khata credit)
- [ ] `khataController` (list accounts with credit>0, apply payment/debit)
- [ ] `dashboardController` (aggregation)

## Step 6: Create routes
- [ ] `routes/authRoutes.js`
- [ ] `routes/leadRoutes.js`
- [ ] `routes/productRoutes.js`
- [ ] `routes/customerRoutes.js`
- [ ] `routes/saleRoutes.js`
- [ ] `routes/khataRoutes.js`
- [ ] `routes/dashboardRoutes.js`

## Step 7: Replace entrypoint
- [x] Refactor `server/server.js` to initialize Express, connect DB, mount `/api` routes, add error handling

## Step 8: Add .env example (if missing)
- [ ] Create `.env` (or `.env` only if repo expects it)

## Step 9: Run & smoke test
- [ ] `npm run dev --prefix server`
- [ ] Verify key endpoints still work

