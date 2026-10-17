# Asia Electronics — Express.js Backend API

Production-ready REST API built with Node.js and Express.js for **Asia Electronics & Cellular Pvt Ltd**.

---

## 🚀 Features
- **850+ Electronic Components & SKUs**: Pre-seeded realistic electronic components, ICs, passives, modules, tools, and accessories.
- **RESTful Endpoints**: Full CRUD for products, categories, orders, and dashboard analytics.
- **Fast Search & Pagination**: Indexed search across SKU, product title, brand, and model with customizable page limit.
- **Stock Management**: Low-stock alerts and instant inventory restock endpoints.
- **Persistent Storage**: Automated local JSON database persistence (`data/products.json`, `data/categories.json`, `data/orders.json`).
- **CORS Configured**: Ready to connect with Vite / TanStack Start frontend or mobile apps.

---

## 🛠️ Quick Start

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

## 📡 API Endpoints

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

## ⚙️ Environment Variables (`.env`)
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080,http://localhost:5173,https://delightful-stack.vercel.app
```
