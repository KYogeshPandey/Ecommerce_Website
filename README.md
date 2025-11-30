# E-commerce Website

Full-stack E-commerce website built with Node.js, Express, MongoDB, and Bootstrap 5.

## Features
- User Authentication (Login/Register)
- Product Browsing & Search
- Shopping Cart
- Checkout with Razorpay Payment Integration
- Admin Dashboard (Manage Products, Orders, Users)
- Responsive UI

## Prerequisites
- Node.js installed
- MongoDB installed and running locally (or use MongoDB Atlas)
- Razorpay Account (for payment keys)

## Installation

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Configure Environment Variables**
    - Open `.env` file.
    - Update `MONGO_URI` if your database is different.
    - Add your `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
    - Set a secure `JWT_SECRET`.

    Example `.env`:
    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/ecommerce
    JWT_SECRET=mysecretkey123
    RAZORPAY_KEY_ID=rzp_test_123456789
    RAZORPAY_KEY_SECRET=abcdefg1234567
    ```

3.  **Start the Server**
    ```bash
    npm start
    ```
    Or for development with nodemon (if installed):
    ```bash
    npm run dev
    ```

4.  **Access the Website**
    - User Interface: [http://localhost:5000](http://localhost:5000)
    - Admin Dashboard: [http://localhost:5000/admin/dashboard.html](http://localhost:5000/admin/dashboard.html) (Requires Admin Login)

## Admin Access
To access the admin dashboard, you need a user with `role: "admin"`.
You can manually update a user in MongoDB or create a registration route that accepts roles (currently defaults to "user").

**Quick Admin Setup (MongoDB Shell):**
```javascript
use ecommerce
db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } })
```
