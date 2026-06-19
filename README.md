# 🍔 Food Delivery App

A full-stack food delivery platform implemented as a React frontend plus independent backend microservices. The repo uses service-to-service HTTP, Socket.IO for realtime updates, and RabbitMQ for payment and rider assignment workflows.

---

## 🧠 Architecture overview

This project is organized as six backend services plus one frontend application:

- `frontend/` — React + Vite client
- `services/auth/` — authentication, JWT, Google sign-in, role management
- `services/restaurant/` — restaurant storefront, menu, cart, address, order and payment consumer
- `services/utils/` — image upload, reverse geocoding, payment checkout creation and verification
- `services/realtime/` — Socket.IO server and internal event emitter
- `services/rider/` — rider profile, availability, order acceptance and delivery progression
- `services/admin/` — admin verification APIs using native MongoDB driver

There is no root-level `package.json` or `docker-compose.yml`; each service runs independently and maintains its own dependencies.

---

## 🌐 Frontend

Path: `frontend/`

The frontend is a Vite React app that supports:

- Guest login/signup flows
- Role selection for `customer`, `seller`, and `rider`
- Protected routes for authenticated users
- Customer restaurant discovery, search, cart, checkout, address management, and order details
- Seller dashboard for restaurant management, menu item uploads, status toggling, and sales overview
- Rider dashboard for profile creation, availability toggling, active order management, and delivery status updates
- Realtime socket connection for live order and rider location updates
- Map-based delivery tracking using Leaflet and Leaflet Routing Machine

### Frontend service configuration

Frontend service location mapping is hard-coded in `frontend/src/config/services.jsx`:

```js
export const authService = 'http://localhost:4000';
export const restaurantService = 'http://localhost:4001';
export const utilsService = 'http://localhost:4002';
export const realtimeService = 'http://localhost:4003';
export const riderService = 'http://localhost:4004';
export const adminService = 'http://localhost:4005';
```

### Frontend environment variables

The frontend reads the following Vite env vars in `frontend/src/config/env.js`:

- `VITE_STRIPE_PUBLISHABLE_KEY`
- `VITE_INTERNAL_SERVICE_KEY`

The rider location emitter in `frontend/src/components/map/DeliveryMap.jsx` uses `VITE_INTERNAL_SERVICE_KEY` to call the realtime service internal emit route.

---

## 🧩 Backend services

### 1. Auth Service (`services/auth/`)

**Port**: `4000`

Responsibilities:

- Email signup and login
- Google OAuth login
- JWT token creation and validation on protected routes
- User role assignment (`customer`, `rider`, `seller`)
- Internal service user lookup and update via `x-internal-key`

Key routes under `/api/auth`:

- `POST /google_login`
- `POST /email-signup`
- `POST /email-login`
- `PUT /add-role`
- `PATCH /set-password`
- `GET /my-profile`
- `PATCH /internal/update-user`
- `GET /internal/users`

### 2. Restaurant Service (`services/restaurant/`)

**Port**: `4001`

Responsibilities:

- Restaurant creation and status management
- Seller menu management and search
- Customer cart and address management
- Order creation and order status updates
- RabbitMQ payment consumer
- Internal order assignment and rider income aggregation
- Real-time event emission through the realtime service

Routes:

- `/api/restaurant`
- `/api/menu`
- `/api/cart`
- `/api/address`
- `/api/order`

This service also consumes the payment queue and processes `PAYMENT_SUCCESS` events to mark orders as paid.

### 3. Utils Service (`services/utils/`)

**Port**: `4002`

Responsibilities:

- Cloudinary image upload
- Reverse geocoding for frontend address and location lookup
- Payment checkout creation for Razorpay and Stripe
- Payment verification and RabbitMQ event publishing

Routes:

- `/api/utils/upload`
- `/api/utils/reverse-geocode`
- `/api/payment/razorpay/create`
- `/api/payment/razorpay/verify`
- `/api/payment/stripe/create`
- `/api/payment/stripe/verify`

### 4. Realtime Service (`services/realtime/`)

**Port**: `4003`

Responsibilities:

- Socket.IO connection management
- JWT authentication for socket clients
- Room-based event delivery for users, restaurants, and global restaurant updates
- Internal service event emitter at `/api/v1/internal/emit`

Rooms joined by connected sockets:

- `user:<userId>`
- `restaurant:<restaurantId>` when the JWT contains `restaurantId`
- `restaurants`

### 5. Rider Service (`services/rider/`)

**Port**: `4004`

Responsibilities:

- Rider profile creation and verification
- Rider availability toggling and GPS location storage
- Rider active order checks
- Accepting orders and updating delivery status
- Fetching rider income summaries from the restaurant service
- RabbitMQ consumer that notifies nearby riders when an order is ready for pickup

### 6. Admin Service (`services/admin/`)

**Port**: `4005`

Responsibilities:

- Admin approval workflows for riders and restaurants
- Fetching verified and pending records
- Verifying and unverifying riders/restaurants
- Data enrichment through auth service user metadata

This service uses the native MongoDB driver instead of Mongoose.

---

## 🔗 Communication patterns

### Socket.IO

- The realtime service authenticates socket clients with `JWT_SECRET`
- Sockets send the token in `handshake.auth.token`
- Connected users automatically join the user room, seller restaurant room, and broadcast `restaurants` room

### Internal service calls

- Many internal APIs require `x-internal-key`
- Example internal endpoints:
  - Auth: `/api/auth/internal/update-user`, `/api/auth/internal/users`
  - Restaurant: `/api/order/payment/:id`, `/api/order/assign-rider`, `/api/order/current-order/rider`, `/api/order/update-order/rider`, `/api/order/internal/rider-income`
  - Realtime: `/api/v1/internal/emit`

### RabbitMQ event flow

- `utils` publishes `PAYMENT_SUCCESS` to `PAYMENT_QUEUE`
- `restaurant` consumes payment success and emits `new-order` to `restaurant:<restaurantId>`
- When the restaurant updates status to `ready_for_rider`, `restaurant` publishes `ORDER_READY_FOR_RIDER` to `ORDER_QUEUE`
- `rider` consumes `ORDER_QUEUE`, finds nearby verified riders, and emits `order-available` to `user:<riderUserId>`

---

## 📌 API summary

### Auth service (`http://localhost:4000/api/auth`)

- `POST /google_login`
- `POST /email-signup`
- `POST /email-login`
- `PUT /add-role`
- `PATCH /set-password`
- `GET /my-profile`
- `PATCH /internal/update-user`
- `GET /internal/users`

### Restaurant service

#### Restaurant endpoints (`http://localhost:4001/api/restaurant`)

- `GET /nearby` — query params: `latitude`, `longitude`, optional `radius`, optional `search`
- `POST /add-restaurant`
- `GET /my-restaurant`
- `PUT /status`
- `PUT /edit-restaurant`
- `PATCH /heartbeat`
- `GET /sales`
- `GET /:id`

#### Menu endpoints (`http://localhost:4001/api/menu`)

- `POST /add-items`
- `GET /menu-items/:id`
- `GET /search?query=`
- `GET /item/:id`

#### Cart endpoints (`http://localhost:4001/api/cart`)

- `POST /add-cart`
- `GET /fetch-cart`

#### Address endpoints (`http://localhost:4001/api/address`)

- `POST /new-address`
- `DELETE /delete-address/:id`
- `GET /get-address`

#### Order endpoints (`http://localhost:4001/api/order`)

- `GET /my-orders`
- `POST /create`
- `GET /payment/:id`
- `GET /restaurant-orders/:restaurantId`
- `PUT /assign-rider`
- `GET /current-order/rider`
- `GET /internal/rider-income`
- `PUT /update-order/rider`
- `PUT /:orderId`
- `GET /:id`

### Utils service

#### Upload and geocoding (`http://localhost:4002/api/utils`)

- `POST /upload`
- `GET /reverse-geocode`

#### Payment (`http://localhost:4002/api/payment`)

- `POST /razorpay/create`
- `POST /razorpay/verify`
- `POST /stripe/create`
- `POST /stripe/verify`

### Rider service (`http://localhost:4004/api/rider`)

- `POST /create-profile`
- `GET /myprofile`
- `PATCH /availability`
- `PATCH /update-profile`
- `PATCH /heartbeat`
- `POST /accept-order/:orderId`
- `GET /current-orders`
- `PUT /update-status/:orderId`
- `GET /income`

### Admin service (`http://localhost:4005/api/v1/admin`)

- `GET /pending/riders`
- `GET /verified/riders`
- `GET /pending/restaurants`
- `GET /verified/restaurants`
- `PATCH /verify/restaurant/:id`
- `PATCH /unverify/restaurant/:id`
- `PATCH /verify/rider/:id`
- `PATCH /unverify/rider/:id`

### Realtime internal emitter (`http://localhost:4003/api/v1/internal/emit`)

- `POST /emit`
  - body: `{ event, room, payload }`
  - requires `x-internal-key`

---

## 💳 Payment and delivery flow

1. Customer creates an order with `POST /api/order/create`
2. Frontend requests checkout details from the utils service
3. Payment provider returns success and the utils service publishes `PAYMENT_SUCCESS`
4. Restaurant service consumes the payment event, updates order status to `paid`, and emits `new-order` to the restaurant room
5. Restaurant owner moves the order to `ready_for_rider`
6. Restaurant publishes `ORDER_READY_FOR_RIDER` to RabbitMQ
7. Rider service consumes the order readiness event and notifies nearby verified riders
8. Rider accepts the order and later updates delivery status to `picked_up` and `delivered`

---

## 🔧 Required environment variables

### Frontend (`frontend/.env`)

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_INTERNAL_SERVICE_KEY=your_internal_key
```

### Auth service (`services/auth/.env`)

```env
PORT=4000
MONGO_URI=mongodb://...
JWT_SECRET=your_jwt_secret
INTERNAL_SERVICE_KEY=your_internal_key
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### Restaurant service (`services/restaurant/.env`)

```env
PORT=4001
MONGO_URI=mongodb://...
JWT_SECRET=your_jwt_secret
UTILS_SERVICE=http://localhost:4002
REALTIME_SERVICE=http://localhost:4003
INTERNAL_SERVICE_KEY=your_internal_key
RABBITMQ_URL=amqp://...
PAYMENT_QUEUE=payment_queue
ORDER_QUEUE=order_queue
RIDER_QUEUE=rider_queue
```

### Utils service (`services/utils/.env`)

```env
PORT=4002
MONGO_URI=mongodb://...
JWT_SECRET=your_jwt_secret
CLOUD_NAME=...
CLOUD_API_KEY=...
CLOUD_SECRET_KEY=...
RESTAURANT_SERVICE=http://localhost:4001
FRONTEND_URL=http://localhost:5173
INTERNAL_SERVICE_KEY=your_internal_key
RABBITMQ_URL=amqp://...
PAYMENT_QUEUE=payment_queue
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
STRIPE_SECRET_KEY=...
```

### Realtime service (`services/realtime/.env`)

```env
PORT=4003
MONGO_URI=mongodb://...
JWT_SECRET=your_jwt_secret
INTERNAL_SERVICE_KEY=your_internal_key
```

### Rider service (`services/rider/.env`)

```env
PORT=4004
MONGO_URI=mongodb://...
JWT_SECRET=your_jwt_secret
AUTH_SERVICE=http://localhost:4000
UTILS_SERVICE=http://localhost:4002
REALTIME_SERVICE=http://localhost:4003
RESTAURANT_SERVICE=http://localhost:4001
INTERNAL_SERVICE_KEY=your_internal_key
ORDER_QUEUE=order_queue
RABBITMQ_URL=amqp://...
```

### Admin service (`services/admin/.env`)

```env
PORT=4005
MONGO_URI=mongodb://...
DB_NAME=food-delivery-app
AUTH_SERVICE=http://localhost:4000
INTERNAL_SERVICE_KEY=your_internal_key
```

> Each backend service loads its own `.env`. There is no unified root `.env`.

---

## ▶️ Running locally

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Each backend service

```bash
cd services/auth
npm install
npm run dev
```

```bash
cd services/restaurant
npm install
npm run dev
```

```bash
cd services/utils
npm install
npm run dev
```

```bash
cd services/realtime
npm install
npm run dev
```

```bash
cd services/rider
npm install
npm run dev
```

```bash
cd services/admin
npm install
npm run dev
```

---

## 🐳 Docker support

Every backend service contains its own `Dockerfile`. There is no root-level `docker-compose.yml` in this repository.

Example build commands:

```bash
cd services/auth
docker build -t food-app-auth .

cd ../restaurant
docker build -t food-app-restaurant .
```

---

## ⚠️ Notes from the codebase

- The admin service uses native MongoDB driver code, while the other backend services use Mongoose.
- Restaurant and rider services both use GeoJSON location fields and geospatial queries.
- The frontend uses token-based auth and conditional route rendering in `App.jsx`.
- The frontend `SocketProvider` connects to the realtime service only when authenticated.
- The rider location map publishes location updates every 10 seconds using the realtime internal emit API.
- The codebase does not contain a root `docker-compose.yml` or root `package.json`.

---

## ✅ Code-accurate summary

This README reflects the actual repository implementation and does not assume extra functionality beyond what is present in the workspace code.
