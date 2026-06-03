<div align="center">

<img src="https://img.shields.io/badge/FruitMart-E--Commerce-brightgreen?style=for-the-badge&logo=leaf&logoColor=white" alt="FruitMart" height="60"/>

# 🍎 FruitMart — Fresh Fruits E-Commerce Platform

**A full-stack MEAN application for buying and selling fresh fruits online.**  
Built with Angular 21, Node.js, Express, and MongoDB.

[![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=flat-square&logo=angular&logoColor=white)](https://angular.io/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

[🌐 Live Demo](#) · [📂 GitHub Repo](https://github.com/Sanjaymo/mean_ecommerce_fruitmart.git) · [🗂️ Portfolio](https://Sanjaymo.github.io) · [🐛 Report Bug](https://github.com/Sanjaymo/mean_ecommerce_fruitmart/issues)

</div>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Data Model (ERD)](#-data-model-erd)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [User Roles](#-user-roles)
- [Security](#-security)
- [Screenshots](#-screenshots)
- [Roadmap](#-roadmap)
- [Author](#-author)

---

## 🌿 About the Project

**FruitMart** is a feature-complete e-commerce platform focused on fresh fruit delivery. It supports the full lifecycle of online retail — from product browsing and cart management to order placement, payment processing, and seller/admin dashboards.

The project follows a clean separation between the **Angular frontend** (SSR-capable) and a **Node.js/Express REST API backend**, connected to a **MongoDB** database via Mongoose.

> ⚠️ **Status:** This project is actively under development and not yet production-ready. It is being shared for portfolio and interview purposes.

---

## ✨ Features

### 🛒 Shopper / Consumer
- Browse fruit catalogue with categories, search, and filters
- Product detail pages with images, price, and stock info
- Add to cart, update quantities, remove items
- Secure checkout with shipping address entry
- Payment integration (provider-configurable)
- Order history and real-time order tracking
- User profile management
- OTP-based email verification and password reset flow

### 🧑‍🌾 Seller
- Apply to become a seller via the `become-seller` flow
- Seller dashboard to list, update, and manage products
- View incoming orders tied to listed products
- Inventory/stock management

### 🛡️ Admin
- Admin dashboard for platform-wide management
- Manage users (view, roles, block)
- Manage all products across sellers
- View and update all orders
- Send emails to users directly from the dashboard
- Support ticket management

### 📧 Email & Notifications
- Transactional emails: OTPs, order confirmations, support replies
- Customer contact form with auto-acknowledgement
- Email activity logging via `EmailLog` model

### 🎨 UX & Resilience
- Fully responsive design (mobile, tablet, desktop)
- Smooth animations and theme support
- HTTP retry interceptor for network resilience
- Global loading indicator via loading interceptor
- Network status detection service

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | Angular 21 (TypeScript) with SSR (Angular Universal) |
| **Styling** | Tailwind CSS + Custom CSS animations |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB + Mongoose ODM |
| **Authentication** | JWT (JSON Web Tokens) |
| **Email** | Nodemailer (Gmail SMTP) |
| **Payment** | Configurable payment provider via `payments.js` |
| **Dev Tools** | Angular CLI, npm workspaces, seed scripts |
| **Testing** | Jasmine/Karma (frontend), custom spec files |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                   │
│                                                         │
│   Angular 21 SPA (SSR-capable)                          │
│   ┌──────────┐  ┌──────────┐  ┌────────────────────┐   │
│   │  Pages   │  │Components│  │    Services         │   │
│   │  home    │  │  navbar  │  │  api.ts  auth.ts    │   │
│   │  cart    │  │  footer  │  │  cart.ts fruit.ts   │   │
│   │  orders  │  └──────────┘  └────────────────────┘   │
│   │  profile │                                          │
│   │  seller- │  ┌──────────────────────────────────┐   │
│   │  dashboard│ │         Interceptors              │   │
│   │  admin-  │  │  auth · loading · retry           │   │
│   │  dashboard│ └──────────────────────────────────┘   │
│   └──────────┘                                          │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS / REST
┌────────────────────────▼────────────────────────────────┐
│                   Node.js + Express API                  │
│                                                         │
│   ┌──────────┐  ┌──────────────┐  ┌──────────────────┐ │
│   │  Routes  │  │  Middleware  │  │     Utils         │ │
│   │ /auth    │  │  auth.js     │  │  mailer.js        │ │
│   │ /products│  │  (JWT guard) │  │  email-templates  │ │
│   │ /orders  │  └──────────────┘  └──────────────────┘ │
│   │ /payments│                                          │
│   │ /seller  │  ┌──────────────────────────────────┐   │
│   │ /admin   │  │           Models (Mongoose)       │   │
│   │ /support │  │  User · Product · Order           │   │
│   └──────────┘  │  Payment · EmailLog · OrderItem   │   │
│                 └──────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                       MongoDB Atlas                      │
└─────────────────────────────────────────────────────────┘
```

**Request lifecycle:**
1. Browser sends HTTP request → Angular interceptors attach JWT header
2. Express router matches route → `auth.js` middleware validates JWT for protected routes
3. Route handler interacts with Mongoose models → reads/writes MongoDB
4. Utils (mailer, payment) invoked as needed
5. JSON response returned → Angular service updates component state

---

## 🗃️ Data Model (ERD)

```
USER ||--o{ ORDER       : places
USER ||--o{ PRODUCT     : "sells (sellerId)"
ORDER ||--|{ ORDER_ITEM  : contains
PRODUCT ||--o{ ORDER_ITEM : "ordered as"
ORDER ||--o| PAYMENT    : "paid by"
```

### Entities

**USER**
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId (PK) | |
| `name` | string | |
| `email` | string | unique |
| `passwordHash` | string | bcrypt hashed |
| `role` | string | `buyer` / `seller` / `admin` |
| `createdAt` | datetime | |
| `updatedAt` | datetime | |

**PRODUCT**
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId (PK) | |
| `sellerId` | ObjectId (FK → USER) | |
| `name` | string | |
| `description` | text | |
| `price` | number | |
| `stock` | number | |
| `category` | string | |
| `images` | string[] | |

**ORDER**
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId (PK) | |
| `userId` | ObjectId (FK → USER) | |
| `total` | number | |
| `status` | string | `pending` / `confirmed` / `shipped` / `delivered` |
| `shippingAddress` | object | |

**ORDER_ITEM** — junction between Order and Product
| Field | Type |
|---|---|
| `orderId` | FK → ORDER |
| `productId` | FK → PRODUCT |
| `quantity` | number |
| `price` | number (snapshot at time of order) |

**PAYMENT**
| Field | Type | Notes |
|---|---|---|
| `orderId` | FK → ORDER | |
| `amount` | number | |
| `method` | string | |
| `status` | string | `pending` / `paid` / `failed` |
| `providerRef` | string | Gateway transaction ID |

**EMAIL_LOG**
| Field | Type |
|---|---|
| `to` | string |
| `subject` | string |
| `template` | string |
| `status` | string |
| `sentAt` | datetime |

---

## 📁 Project Structure

```
mean_ecommerce_fruitmart/
│
├── backend/
│   ├── server.js                  # Express app entry point
│   ├── package.json
│   ├── seed.js                    # DB seed (users, admin)
│   ├── seed-products.js           # DB seed (products catalogue)
│   │
│   ├── routes/
│   │   ├── auth.js                # Register, login, OTP, reset password
│   │   ├── products.js            # CRUD for products
│   │   ├── orders.js              # Place, view, track orders
│   │   ├── payments.js            # Payment initiation & webhook
│   │   ├── seller.js              # Seller-specific routes
│   │   ├── admin.js               # Admin management routes
│   │   ├── support.js             # Customer support / contact
│   │   └── user.js                # Profile management
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── OrderItem.js
│   │   ├── Payment.js
│   │   └── EmailLog.js
│   │
│   ├── middleware/
│   │   └── auth.js                # JWT verification middleware
│   │
│   └── utils/
│       ├── mailer.js              # Nodemailer SMTP wrapper
│       └── email-templates.js     # HTML email templates
│
└── frontend/
    ├── angular.json
    ├── package.json
    ├── tailwind.config.cjs
    │
    └── src/
        ├── index.html
        ├── main.ts                # Angular bootstrap
        ├── main.server.ts         # SSR bootstrap
        ├── styles.css             # Global styles
        │
        └── app/
            ├── app.ts
            ├── app.routes.ts
            │
            ├── components/
            │   ├── navbar/
            │   └── footer/
            │
            ├── pages/
            │   ├── home/
            │   ├── cart/
            │   ├── payment/
            │   ├── orders/
            │   ├── order-confirmation/
            │   ├── order-tracking/
            │   ├── profile/
            │   ├── seller-dashboard/
            │   ├── become-seller/
            │   ├── admin-dashboard/
            │   ├── verify-otp/
            │   ├── forgot-password/
            │   └── reset-password/
            │
            ├── services/
            │   ├── api.ts
            │   ├── auth.ts
            │   ├── cart.ts
            │   ├── fruit.ts
            │   ├── theme.ts
            │   ├── ui-motion.ts
            │   └── network-status.ts
            │
            ├── interceptors/
            │   ├── auth.interceptor.ts    # Attaches JWT to requests
            │   ├── loading.interceptor.ts # Shows global loading UI
            │   └── retry.interceptor.ts   # Auto-retries failed requests
            │
            ├── models/
            │   ├── fruit.ts
            │   └── interfaces.ts
            │
            └── guards/
                └── auth.guard.ts
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- [Angular CLI](https://angular.io/cli) v17+
- npm v9+

### 1. Clone the repository

```bash
git clone https://github.com/Sanjaymo/mean_ecommerce_fruitmart.git
cd mean_ecommerce_fruitmart
```

### 2. Set up the Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` — see [Environment Variables](#-environment-variables) below.

Seed the database (optional but recommended for demo data):

```bash
node seed.js
node seed-products.js
```

Start the server:

```bash
npm start
```

Backend runs at: `http://localhost:3000`  
Health check: `http://localhost:3000/api/health`

### 3. Set up the Frontend

```bash
cd ../frontend
npm install
npm start
```

Frontend runs at: `http://localhost:4200`

### 4. Build for Production

```bash
# Frontend
cd frontend
npm run build

# Backend
cd ../backend
npm start
```

---

## 🔐 Environment Variables

Create `backend/.env` with the following:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/fruitmart
# Or MongoDB Atlas:
# MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/fruitmart

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Email (Gmail SMTP)
SUPPORT_EMAIL=sanjayworks99@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=sanjayworks99@gmail.com
SMTP_PASS=your_gmail_app_password   # Use Gmail App Password, not your login password
MAIL_FROM_NAME=FruitMart
MAIL_FROM_ADDRESS=sanjayworks99@gmail.com

# Payment (configure per provider)
PAYMENT_API_KEY=your_payment_provider_key
```

> **Gmail note:** Enable 2-step verification in your Google account, then generate an [App Password](https://myaccount.google.com/apppasswords) and use it as `SMTP_PASS`.

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ | Register new user |
| `POST` | `/api/auth/login` | ❌ | Login, returns JWT |
| `POST` | `/api/auth/verify-otp` | ❌ | Verify email OTP |
| `POST` | `/api/auth/forgot-password` | ❌ | Send reset email |
| `POST` | `/api/auth/reset-password` | ❌ | Reset password |
| `GET` | `/api/products` | ❌ | List all products |
| `GET` | `/api/products/:id` | ❌ | Single product detail |
| `POST` | `/api/products` | ✅ Seller | Create product |
| `PUT` | `/api/products/:id` | ✅ Seller | Update product |
| `DELETE` | `/api/products/:id` | ✅ Seller | Delete product |
| `POST` | `/api/orders` | ✅ Buyer | Place an order |
| `GET` | `/api/orders` | ✅ Buyer | Get user's orders |
| `GET` | `/api/orders/:id` | ✅ Buyer | Order detail + tracking |
| `POST` | `/api/payments` | ✅ Buyer | Initiate payment |
| `GET` | `/api/seller/dashboard` | ✅ Seller | Seller stats & orders |
| `GET` | `/api/admin/users` | ✅ Admin | All users |
| `GET` | `/api/admin/orders` | ✅ Admin | All orders |
| `POST` | `/api/support/contact` | ❌ | Customer contact form |
| `GET` | `/api/health` | ❌ | Server health check |

✅ = Requires `Authorization: Bearer <token>` header

---

## 👥 User Roles

| Role | Capabilities |
|---|---|
| **Buyer** (default) | Browse, cart, checkout, track orders, manage profile |
| **Seller** | All buyer capabilities + list/manage products, view seller orders |
| **Admin** | Full platform access — users, products, orders, email, support |

Role is stored on the `User` model and enforced via the `auth.js` middleware on protected routes.

---

## 🔒 Security

- **JWT Authentication** — stateless token-based auth; tokens validated on every protected request
- **Helmet.js** — sets secure HTTP headers (X-Content-Type-Options, X-Frame-Options, etc.)
- **Rate Limiting** — API-wide and stricter limits on auth endpoints to prevent brute-force
- **JSON Body Size Limits** — guards against large payload attacks
- **Password Hashing** — passwords stored as bcrypt hashes, never plaintext
- **Hidden `x-powered-by`** — Express signature removed to reduce information leakage
- **Auth Interceptor (Frontend)** — rejects invalid/expired stored tokens on app restore

---

## 🖼️ Screenshots

> Screenshots will be added once the UI is finalized.

| Page | Preview |
|---|---|
| Home / Product Listing | _coming soon_ |
| Product Detail | _coming soon_ |
| Cart & Checkout | _coming soon_ |
| Seller Dashboard | _coming soon_ |
| Admin Dashboard | _coming soon_ |

---

## 🗺️ Roadmap

- [x] User authentication (JWT + OTP)
- [x] Product catalogue with categories
- [x] Shopping cart
- [x] Order placement and tracking
- [x] Seller dashboard
- [x] Admin dashboard
- [x] Email notifications (SMTP)
- [x] Responsive UI (Tailwind)
- [ ] Payment gateway integration (in progress)
- [ ] Product reviews and ratings
- [ ] Wishlist / saved items
- [ ] Push notifications
- [ ] Docker / deployment configuration
- [ ] CI/CD pipeline

---

## 👨‍💻 Author

**Sanjay Choudhari**

| | |
|---|---|
| 📂 GitHub | [@Sanjaymo](https://github.com/Sanjaymo) |
| 🌐 Portfolio | [Sanjaymo.github.io](https://Sanjaymo.github.io) |
| 📞 Phone | +91 9963785768 |
| 📧 Email | sanjayworks99@gmail.com |

---

## 📄 License

This project is currently unlicensed and shared for portfolio/interview purposes only.  
Please contact the author before reusing any part of this codebase.

---

<div align="center">

Made with ❤️ by **Sanjay Choudhari**

⭐ Star this repo if you found it useful!

</div>
