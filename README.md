# 🍔 Food Delivery App

A full-stack **Food Delivery Platform** built in a modular service-based architecture. The repo includes a React frontend plus backend services for auth, restaurants, riders, admin, real-time updates, and utilities.

---

## 🚀 What this project does

- Customer ordering with cart, checkout, and saved addresses
- Restaurant menu management and order processing
- Rider assignment, live tracking, and delivery updates
- Admin reporting and platform oversight
- Real-time events via Socket.IO
- Map-based delivery tracking using Leaflet
- Payment and image upload helpers via utility service
- Container-friendly backend services with individual Dockerfiles

---

## 📂 Actual repo structure

```
food delivery app/
├── frontend/
│   ├── package.json
│   ├── src/
│   └── public/
├── services/
│   ├── admin/
│   ├── auth/
│   ├── realtime/
│   ├── restaurant/
│   ├── rider/
│   └── utils/
├── client_secret.json
├── razorpay_test_api_keys.csv
├── stripe_test_api_keys.csv
├── .gitignore
└── README.md
```

> Note: There is no root `package.json` or `docker-compose.yml` in this repository. Each service is started independently.

---

## 📌 Frontend overview

Path: `frontend/`

The frontend is a React app built with Vite. It handles all user-facing flows for customers, restaurants, riders, and admin pages.

### Key frontend features

- Role-based pages for customer, vendor, rider, and admin
- Login / signup and token-based session handling
- Restaurant browsing, search, item selection, and cart management
- Checkout flow with address selection, payment handling, and order creation
- Rider live-tracking page with Leaflet map and routing
- Real-time notifications and status updates using Socket.IO
- Toast notifications throughout the UI using `react-hot-toast`
- Cloudinary-powered image upload flow through the utils service

### Main frontend libraries

- `react`, `react-dom`
- `vite`
- `react-router-dom`
- `axios`
- `react-hot-toast`
- `react-leaflet`, `leaflet`, `leaflet-routing-machine`
- `socket.io-client`
- `tailwindcss`
- `framer-motion`
- `@stripe/stripe-js`
- `@react-oauth/google`

---

## 🧩 Backend services

### 1. Auth Service (`services/auth/`)

- Exposes `/api/auth` routes
- Handles user registration, login, and JWT issuance
- Connects to MongoDB using Mongoose
- Runs on port `4000`

### 2. Restaurant Service (`services/restaurant/`)

- Exposes restaurant, menu, cart, address, and order APIs
- Uses MongoDB and RabbitMQ for queue integration
- Starts payment consumer and RabbitMQ connection on launch
- Runs on port `4001`

### 3. Utils Service (`services/utils/`)

- Handles Cloudinary image upload routes
- Exposes geocoding helper endpoints
- Supports payment-related routes via Stripe/Razorpay logic
- Connects to RabbitMQ for payment queue integration
- Runs on port `4002`

### 4. Realtime Service (`services/realtime/`)

- Hosts Socket.IO server for live updates
- Authenticates socket clients using JWT
- Joins users into rooms like `user:<id>` and `restaurant:<id>`
- Sends live delivery and order status notifications
- Runs on port `4003`

### 5. Rider Service (`services/rider/`)

- Exposes `/api/rider` routes for rider authentication and order handling
- Consumes order events from RabbitMQ
- Uses MongoDB for rider data storage
- Runs on port `4004`

### 6. Admin Service (`services/admin/`)

- Exposes admin dashboard routes under `/api/v1/admin`
- Connects directly to MongoDB via the native `mongodb` driver
- Runs on port `4005`

---

## 🔧 How frontend and backend connect

Frontend service URLs are configured in `frontend/src/config/services.jsx`:

```js
export const authService = 'http://localhost:4000';
export const restaurantService = 'http://localhost:4001';
export const utilsService = 'http://localhost:4002';
export const realtimeService = 'http://localhost:4003';
export const riderService = 'http://localhost:4004';
export const adminService = 'http://localhost:4005';
```

Change these URLs if you run services on different ports or behind proxies.

---

## 🗺️ Maps, tracking, and notifications

### Maps

- The rider tracking page uses `react-leaflet` with `leaflet` and `leaflet-routing-machine`
- User location is obtained via browser geolocation
- Delivery routes are displayed on an interactive map

### Notifications

- The UI uses `react-hot-toast` for success/error toasts
- The Socket.IO connection enables real-time push updates for order changes
- Rider and restaurant events can be delivered instantly through socket rooms

### Real-time updates

- `services/realtime/` hosts the Socket.IO server
- Socket auth is handled with the same JWT secret as the API
- Clients join rooms for users and restaurants to receive targeted events

---

## 🐇 RabbitMQ and async workflows

- `services/restaurant/`, `services/rider/`, and `services/utils/` connect to RabbitMQ
- Queues are used for order and payment workflows
- This provides an event-driven architecture for order processing and payment handling

---

## 🐳 Docker support

Each backend service contains its own `Dockerfile`.

Example Docker build commands:

```bash
cd services/auth
docker build -t food-app-auth .

cd ../restaurant
docker build -t food-app-restaurant .
```

If you want to run containers, use the service-level Dockerfiles directly. There is no root-level Compose file included in this repo.

---

## ▶️ Run locally

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend services

For each service:

```bash
cd services/auth
npm install
npm run dev
```

Repeat for `services/restaurant`, `services/utils`, `services/realtime`, `services/rider`, and `services/admin`.

---

## ⚠️ Important notes

- The repo includes `client_secret.json`, Razorpay, and Stripe test key files.
- Ensure environment variables are configured for MongoDB, JWT secret, Cloudinary, and RabbitMQ.
- The backend services are designed to run independently and communicate through HTTP and sockets.

---

## 📝 Summary

This project is a React-based food delivery platform with microservice backends, live tracking, map integration, real-time Socket.IO notifications, and utility services for image upload and payment processing.
