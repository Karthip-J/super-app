# 🚀 Super App - Complete Multi-Service Platform

A comprehensive super app platform with multiple service modules including e-commerce, food delivery, hotel booking, taxi service, porter service, and rider management.

## 📱 **Modules Overview**

### **1. Super App (Customer App)**
- **Location**: `superapp_master/superapp-master/`
- **Features**: E-commerce, Food Delivery, Hotel Booking, Taxi Service, Porter Service
- **Payment**: Integrated Razorpay payment gateway
- **Tech Stack**: React.js, Tailwind CSS, MongoDB

### **2. Admin Panel**
- **Location**: `secom_admin-main/secom_admin-main/`
- **Features**: Complete admin dashboard for all modules
- **Management**: Users, Orders, Bookings, Products, Categories
- **Tech Stack**: React.js, Tailwind CSS, Node.js

### **3. Backend API**
- **Location**: `node-backend/`
- **Features**: RESTful APIs for all modules
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication
- **Tech Stack**: Node.js, Express.js, MongoDB

### **4. Rider App** 🆕
- **Location**: `rider-app/`
- **Features**: Complete rider/driver management system
- **Capabilities**: Trip management, earnings tracking, wallet system
- **Tech Stack**: React.js, Leaflet Maps, Tailwind CSS

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### **1. Backend Setup**
```bash
cd node-backend
npm install
npm start
```
Backend will run on `http://localhost:5000`

### **2. Super App (Customer) Setup**
```bash
cd superapp_master/superapp-master
npm install
npm start
```
Customer app will run on `http://localhost:3000`

### **3. Admin Panel Setup**
```bash
cd secom_admin-main/secom_admin-main
npm install
npm start
```
Admin panel will run on `http://localhost:3001`

### **4. Rider App Setup** 🆕
```bash
cd rider-app
# Run setup script
./setup.sh  # Linux/Mac
# OR
setup.bat   # Windows

# Or manual setup
npm install
cp src/config/api.example.js src/config/api.js
# Edit src/config/api.js with your API keys
npm start
```
Rider app will run on `http://localhost:3002`

## 🔧 **Configuration**

### **Environment Variables**
Create `.env` files in respective directories:

**Backend (.env)**
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

**Rider App API Keys**
- LocationIQ API key for routing
- Google Maps API key (optional)

## 💳 **Payment Integration**

All modules are integrated with **Razorpay** payment gateway:
- ✅ Hotel Bookings
- ✅ Grocery Orders  
- ✅ Taxi Rides
- ✅ Porter Services
- ✅ E-commerce Orders

## 📊 **Features by Module**

### **E-commerce**
- Product catalog with categories
- Shopping cart functionality
- Order management
- Payment processing

### **Food Delivery**
- Restaurant listings
- Menu management
- Order tracking
- Delivery management

### **Hotel Booking**
- Hotel listings with amenities
- Room booking system
- Payment processing
- Booking management

### **Taxi Service**
- Ride booking
- Real-time tracking
- Payment processing
- Trip history

### **Porter Service**
- Delivery booking
- Vehicle selection
- Distance calculation
- Payment processing

### **Rider App** 🆕
- Trip acceptance/rejection
- Real-time navigation
- Earnings tracking
- Wallet management
- Profile management

## 🔐 **Authentication**

- **Customer App**: OTP-based authentication
- **Admin Panel**: Role-based access control
- **Rider App**: Email/password authentication
- **Backend**: JWT token-based authentication

## 📱 **Mobile Responsive**

All modules are optimized for mobile devices with:
- Responsive design
- Touch-friendly interfaces
- Mobile-first approach
- Progressive Web App features

## 🚀 **Deployment**

### **Backend**
- Deploy to Heroku, Railway, or AWS
- Set environment variables
- Configure MongoDB Atlas

### **Frontend Apps**
- Deploy to Netlify, Vercel, or Firebase
- Configure API endpoints
- Set up environment variables

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 **License**

This project is for educational and demonstration purposes.

## 🆕 **Recent Updates**

- **Rider App Integration**: Complete rider management system added
- **Payment Integration**: All modules now support Razorpay payments
- **Admin Panel**: Enhanced with comprehensive management features
- **Backend APIs**: Robust API endpoints for all modules

---

**Note**: This is a comprehensive super app platform. For production use, additional security measures, proper error handling, and real API integrations would be required.
