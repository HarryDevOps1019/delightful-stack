# Asia Electronics â€” Express.js Backend API

Production-ready REST API built with Node.js and Express.js for **Asia Electronics & Cellular Pvt Ltd**.

---

## ðŸš€ Features
- **850+ Electronic Components & SKUs**: Pre-seeded realistic electronic components, ICs, passives, modules, tools, and accessories.
- **RESTful Endpoints**: Full CRUD for products, categories, orders, and dashboard analytics.
- **Fast Search & Pagination**: Indexed search across SKU, product title, brand, and model with customizable page limit.
- **Stock Management**: Low-stock alerts and instant inventory restock endpoints.
- **Persistent Storage**: Automated local JSON database persistence (`data/products.json`, `data/categories.json`, `data/orders.json`).
- **CORS Configured**: Ready to connect with Vite / TanStack Start frontend or mobile apps.

---

## ðŸ› ï¸ Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Run in Development Mode (Live reload)
```bash
npm run dev
```

### 3. Run in Production Mode
```bash
npm start
```
The server will start at **`http://localhost:5000`**.

---

## Deploy to Vercel

Deploy the backend as a separate Vercel project from the frontend:

1. Import this repository as a new Vercel project and set **Root Directory** to `backend`.
2. Set the project framework preset to **Other**. Vercel will install dependencies from `package.json` and deploy the catch-all function in `api/`.
3. Add `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` as Vercel environment variables for the environments you deploy. Apply `src/data/migration.sql` to the Supabase project before using the API.
4. Deploy and verify `https://<backend-project>.vercel.app/api/health`.
5. In the frontend Vercel project, set `VITE_API_URL` to `https://<backend-project>.vercel.app/api`, then redeploy the frontend.

The backend continues to listen on `PORT` when run locally; on Vercel, the exported Express app is handled by the serverless function.

## ðŸ“¡ API Endpoints

### Health & Info
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status and uptime |
| `GET` | `/` | API welcome message and route sitemap |

### Products
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | List products with query params: `search`, `category`, `brand`, `minPrice`, `maxPrice`, `inStock`, `page`, `limit`, `sort` |
| `GET` | `/api/products/stats` | Stock summary (Total, In Stock, Low Stock, Out of Stock) |
| `GET` | `/api/products/:identifier` | Get product by ID, slug, or SKU |
| `POST` | `/api/products` | Create a new product (Name, SKU, category, price, stock, specs) |
| `PUT` | `/api/products/:id` | Update product details or stock |
| `DELETE` | `/api/products/:id` | Delete product |
| `POST` | `/api/products/seed-800` | Regenerate 850 realistic electronics SKUs |

### Categories
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/categories` | List all categories with real-time product counts |
| `POST` | `/api/categories` | Create a new category |
| `DELETE` | `/api/categories/:slug` | Delete a category |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/orders` | List customer orders |
| `POST` | `/api/orders` | Place a new customer order |
| `PATCH` | `/api/orders/:id/status` | Update order status (`Processing`, `Shipped`, `Delivered`, `Cancelled`) |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/analytics` | Revenue total, order stats, category breakdown |

---

## âš™ï¸ Environment Variables (`.env`)
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080,http://localhost:5173,https://delightful-stack.vercel.app
```

### Order-status email notifications (free Gmail SMTP)

When an admin changes an order status, the backend can email the customer automatically. Use a free Gmail account with a Google App Password:

1. Enable 2-Step Verification for the Gmail account.
2. Create an App Password at https://myaccount.google.com/apppasswords.
3. Add the following to the untracked `backend/.env` file. Do **not** commit the App Password or add it to this README.

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=yourstore@gmail.com
SMTP_PASS=your-16-character-google-app-password
EMAIL_FROM=yourstore@gmail.com
```

On Vercel, add the same values through **Project Settings → Environment Variables** instead of committing them to the repository.