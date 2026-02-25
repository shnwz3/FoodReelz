# Zomato Clone - MERN Stack Project

A high-performance, full-stack food delivery and partner management platform. This project mimics the core functionality of Zomato, allowing users to browse food items while providing a dedicated portal for food partners to manage their inventory with video-based previews.

## 🌟 Key Features

- **Dual-Role Authentication**: Separate login and registration for Customers and Food Partners.
- **Dynamic Food Feed**: Real-time listing of food items available for all users.
- **Partner Dashboard**: Secure portal for partners to add new food items.
- **Cloud Video Integration**: Efficient video handling using ImageKit for food showcases.
- **Secure Architecture**: JWT-based session management with HttpOnly cookies.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Vanilla CSS, React Router DOM.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose ODM).
- **Authentication**: JWT, BcryptJS.
- **Media**: Multer, ImageKit Cloud Storage.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16.x or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (Local or Atlas)
- An [ImageKit](https://imagekit.io/) account for media storage.

## ⚙️ How to Run the Project

Follow these steps to get the project running locally.

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd zomato
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   - Create a `.env` file in the `backend` folder.
   - Use `.env.example` as a template and fill in your MongoDB URI, JWT Secret, and ImageKit credentials.
4. Start the server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

The application should now be running! Visit `http://localhost:5173` (or the port shown in your terminal) to view the frontend.

## 📂 Project Structure

```text
zomato/
├── backend/            # Express.js API
│   ├── src/
│   │   ├── controllers/# Request handlers (Auth, Food)
│   │   ├── db/         # MongoDB connection setup
│   │   ├── middlewares/# Auth & validation middlewares
│   │   ├── models/     # Mongoose Data Models (User, FoodPartner, Food)
│   │   ├── routes/     # API Route definitions
│   │   └── services/   # Internal services (e.g., Media Handling)
│   └── .env.example    # Template for environment variables
├── frontend/           # React + Vite Frontend
│   └── src/
│       ├── components/ # Shared UI components
│       └── pages/      # Page components (Login, Register, Dashboard)
├── videos/             # Sample media assets
└── README.md           # Project documentation
```

## 🛠️ API Documentation

### Authentication (Base URL: `/api/auth`)

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/register` | POST | Register a new customer |
| `/login` | POST | Customer login (sets session cookie) |
| `/logout` | POST | Customer logout |
| `/food-partner/register` | POST | Register a new food partner |
| `/food-partner/login` | POST | Food partner login |
| `/food-partner/logout` | GET | Food partner logout |

### Food Management (Base URL: `/api/food`)

| Endpoint | Method | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `/` | GET | No | Fetch all listed food items |
| `/` | POST | Yes (Partner) | Add new food (supports video upload) |

## 📜 License

This project is for educational purposes as a Zomato Clone demonstration.
