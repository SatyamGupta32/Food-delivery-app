# 🍔 Food Delivery App

A production-style **Food Delivery Application** inspired by Zomato/Swiggy, built using **Microservices Architecture** with real-time rider tracking, notifications, Docker, RabbitMQ, Socket.IO, Leaflet maps, and role-based access.

---

## 🚀 Features

### 👤 Customer
- User Registration & Login (JWT)
- Browse Restaurants
- Restaurant Search
- View Menus
- Add/Remove Cart Items
- Place Orders
- Live Order Status Updates
- Real-Time Rider Tracking
- Delivery Address Management
- Notifications

### 🏪 Restaurant
- Restaurant Authentication
- Restaurant Dashboard
- Add/Edit/Delete Menu Items
- Manage Orders
- Accept/Reject Orders
- Update Order Status

### 🛵 Rider
- Rider Authentication
- View Assigned Orders
- Accept Deliveries
- Update Delivery Status
- Share Live Location
- Navigation Support

### 👨‍💼 Admin
- Dashboard Analytics
- Manage Restaurants
- Manage Riders
- View Platform Statistics
- Monitor Orders

---

# 🏗️ Architecture

This project follows a **Microservices Architecture**.

```
Frontend
   ↓
API Gateway
   ↓
──────────────────────────────
User Service
Restaurant Service
Order Service
Cart Service
Rider Service
Notification Service
──────────────────────────────
   ↓
RabbitMQ Event Bus
   ↓
MongoDB Databases
```

---

# 📂 Project Structure

```
food-delivery-app/
│
├── frontend/
│
├── services/
│   │
│   ├── api-gateway/
│   │
│   ├── user-service/
│   │
│   ├── restaurant-service/
│   │
│   ├── cart-service/
│   │
│   ├── order-service/
│   │
│   ├── rider-service/
│   │
│   └── notification-service/
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

# 🎨 Frontend (React)

Location:

```
frontend/
```

## Responsibilities

- Customer UI
- Restaurant UI
- Rider UI
- Admin UI
- Authentication
- API Calls
- Socket Connections
- Leaflet Maps
- Notifications
- Responsive Design

## Technologies Used

| Technology | Usage |
|-----------|---------|
| React | Frontend Framework |
| React Router | Routing |
| Axios | API Requests |
| Context API | Global State |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| Socket.IO Client | Real-Time Updates |
| React Leaflet | Maps |
| Leaflet | Rider Tracking |
| React Hot Toast | Notifications |
| JWT | Authentication |
| Vite | Build Tool |

---

# 🔐 API Gateway

```
services/api-gateway/
```

## Responsibilities

- Single Entry Point
- Request Routing
- Authentication Middleware
- Rate Limiting
- Security
- Service Proxy

Routes requests to all microservices.

---

# 👤 User Service

```
services/user-service/
```

## Responsibilities

- User Registration
- Login
- JWT Generation
- Profile Management
- Address Management

## Database

Own MongoDB Collection.

---

# 🍽️ Restaurant Service

```
services/restaurant-service/
```

## Responsibilities

- Restaurant Authentication
- Restaurant Details
- Menu Management
- Food Categories
- Availability Control

## Database

Own MongoDB Collection.

---

# 🛒 Cart Service

```
services/cart-service/
```

## Responsibilities

- Add To Cart
- Remove From Cart
- Update Quantity
- Cart Validation
- Calculate Totals

## Price Handling

Cart stores product snapshot prices.

Benefits:

- Prevents menu changes affecting cart.
- Maintains pricing consistency.
- Better checkout experience.

---

# 📦 Order Service

```
services/order-service/
```

## Responsibilities

- Create Orders
- Order Validation
- Payment Preparation
- Order Lifecycle

## Order Status Flow

```
PLACED
↓
ACCEPTED
↓
PREPARING
↓
READY_FOR_PICKUP
↓
PICKED_UP
↓
OUT_FOR_DELIVERY
↓
DELIVERED
```

Handles communication with RabbitMQ.

---

# 🛵 Rider Service

```
services/rider-service/
```

## Responsibilities

- Rider Registration
- Rider Availability
- Order Assignment
- Live Location Updates
- Delivery Status Updates

---

# 🔔 Notification Service

```
services/notification-service/
```

## Responsibilities

- Push Notifications
- Order Notifications
- Status Updates
- Event Consumption

Consumes events from RabbitMQ.

Examples:

- Order Placed
- Order Accepted
- Rider Assigned
- Order Delivered

---

# 🐇 RabbitMQ

Used as an **Event Bus** between services.

## Why RabbitMQ?

Without RabbitMQ:

```
Order Service
   ↓
Notification Service
   ↓
Rider Service
```

Tightly coupled.

With RabbitMQ:

```
Order Service
      ↓
RabbitMQ
 ↙       ↘
Notification  Rider
 Service      Service
```

Benefits:

- Loose Coupling
- Scalability
- Reliability
- Async Processing
- Independent Deployments

Example Events:

- ORDER_CREATED
- ORDER_ACCEPTED
- RIDER_ASSIGNED
- ORDER_DELIVERED

---

# 🌍 Maps & Live Tracking

## Leaflet

Used for interactive maps.

Features:

- Customer Delivery Location
- Rider Current Location
- Restaurant Location
- Route Visualization

## React Leaflet

React wrapper around Leaflet.

Benefits:

- Easy React Integration
- Dynamic Marker Updates
- Lightweight

---

# ⚡ Socket.IO

Used for real-time communication.

Features:

- Rider Live Location
- Order Status Updates
- Instant UI Updates

Example:

```
Rider
   ↓
Socket.IO Server
   ↓
Customer
```

No page refresh required.

---

# 🔔 Notifications

Used for improving user experience.

Examples:

- Order Placed Successfully
- Restaurant Accepted Order
- Rider Assigned
- Order Delivered

Frontend:

```
React Hot Toast
```

Backend:

```
Notification Service
```

---

# 🐳 Docker

Docker is used to containerize the application.

Benefits:

- Same environment everywhere
- Easy deployment
- Isolation between services
- Simplified setup

Containers:

- Frontend
- API Gateway
- User Service
- Restaurant Service
- Cart Service
- Order Service
- Rider Service
- Notification Service
- RabbitMQ

---

# 🗄️ MongoDB

Database used across services.

Each service maintains its own data ownership.

Benefits:

- Independent databases
- Better scalability
- Service isolation

---

# 🔒 Authentication

Authentication uses:

- JWT Tokens
- Role-Based Access Control

Roles:

- User
- Restaurant
- Rider
- Admin

Protected Routes are implemented on both frontend and backend.

---

# ⚙️ Environment Variables

Example:

```env
PORT=
MONGO_URI=
JWT_SECRET=

RABBITMQ_URL=

SOCKET_PORT=

FRONTEND_URL=
```

---

# 🚀 Running Locally

## Clone Repository

```bash
git clone <repository-url>
cd food-delivery-app
```

## Install Dependencies

Frontend:

```bash
cd frontend
npm install
```

Services:

```bash
cd services/<service-name>
npm install
```

## Start Development Servers

```bash
npm run dev
```

---

# 🐳 Run Using Docker

```bash
docker-compose up --build
```

Stop:

```bash
docker-compose down
```

---

# 📌 Future Improvements

- Payment Gateway Integration
- Redis Caching
- Recommendation System
- Email Notifications
- SMS Notifications
- Kubernetes Deployment
- CI/CD Pipeline
- Monitoring & Logging

---

# 🛠️ Tech Stack

- React
- Vite
- Tailwind CSS
- Axios
- Context API
- Framer Motion
- React Router
- Socket.IO
- React Leaflet
- Leaflet
- Node.js
- Express.js
- MongoDB
- Mongoose
- RabbitMQ
- JWT
- Docker
- Docker Compose

---

## 📄 License

This project is built for educational and learning purposes to demonstrate a real-world scalable food delivery system using microservices and modern web technologies.
