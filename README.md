# CarGo - Full Stack Car Rental Application

A comprehensive car rental web application built with React.js, Node.js, Express.js, and MongoDB.

## 🚀 Features

### User Features
- **Authentication**: Secure user registration and login with JWT
- **Car Browsing**: Browse available cars with advanced search and filtering
- **Car Details**: Detailed car information with images and specifications
- **Booking System**: Book cars for hourly or daily rentals
- **Booking Management**: View and manage booking history
- **Real-time Availability**: Check car availability for specific dates

### Admin Features
- **Admin Dashboard**: Overview of bookings, revenue, and analytics
- **Car Management**: Add, edit, and delete car listings
- **Booking Management**: View and manage all user bookings
- **User Management**: Monitor user activities and bookings

### Technical Features
- **Responsive Design**: Mobile-first responsive design with Tailwind CSS
- **Real-time Updates**: Live availability checking and booking updates
- **Security**: JWT authentication, input validation, and rate limiting
- **Search & Filter**: Advanced search with multiple filter options
- **Pagination**: Efficient data loading with pagination
- **Error Handling**: Comprehensive error handling and user feedback

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **React Toastify** - Toast notifications
- **Lucide React** - Icon library
- **React DatePicker** - Date selection component

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

\`\`\`
cargo-car-rental/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   │   ├── admin/      # Admin pages
│   │   │   └── ...         # User pages
│   │   ├── services/       # API services
│   │   ├── utils/          # Utility functions
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
├── server/                 # Node.js backend
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── config/            # Configuration files
│   ├── server.js          # Entry point
│   ├── package.json
│   └── .env               # Environment variables
├── package.json           # Root package.json
└── README.md
\`\`\`

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd cargo-car-rental
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   npm run install-server
   
   # Install client dependencies
   npm run install-client
   \`\`\`

3. **Environment Setup**
   
   Create a `.env` file in the `server` directory:
   \`\`\`env
   # Database
   MONGODB_URI=mongodb://localhost:27017/cargo
   
   # JWT Secret (Generate a strong secret key)
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_very_long_and_random
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Client URL (for CORS)
   CLIENT_URL=http://localhost:3000
   
   # Cloudinary Configuration (Optional)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   \`\`\`

4. **Database Setup**
   
   Make sure MongoDB is running on your system. The application will automatically create the database and collections.

5. **Start the application**
   \`\`\`bash
   # Start both frontend and backend concurrently
   npm run dev
   
   # Or start them separately:
   # Backend only
   npm run server
   
   # Frontend only (in another terminal)
   npm run client
   \`\`\`

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🔧 VS Code Setup

### Recommended Extensions
1. **ES7+ React/Redux/React-Native snippets** - Code snippets
2. **Prettier - Code formatter** - Code formatting
3. **ESLint** - Code linting
4. **Auto Rename Tag** - HTML/JSX tag renaming
5. **Bracket Pair Colorizer** - Bracket highlighting
6. **Thunder Client** - API testing (alternative to Postman)

### VS Code Settings
Create `.vscode/settings.json` in your project root:
\`\`\`json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  },
  "files.associations": {
    "*.js": "javascriptreact"
  }
}
\`\`\`

### Debugging Configuration
Create `.vscode/launch.json`:
\`\`\`json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch React App",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}/client",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["start"]
    },
    {
      "name": "Launch Node Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/server/server.js",
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
\`\`\`

## 📱 Usage

### For Users
1. **Register/Login**: Create an account or login with existing credentials
2. **Browse Cars**: Explore available cars with search and filter options
3. **View Details**: Check detailed car information and specifications
4. **Book Car**: Select dates and book your preferred vehicle
5. **Manage Bookings**: View and manage your booking history

### For Admins
1. **Login**: Use admin credentials to access admin panel
2. **Dashboard**: Monitor business metrics and recent activities
3. **Manage Cars**: Add, edit, or remove car listings
4. **Manage Bookings**: Oversee all user bookings and update statuses
5. **Analytics**: View booking trends and revenue reports

## 🔐 Default Admin Account

To create an admin account, you can either:

1. **Register normally and manually update the database**:
   \`\`\`javascript
   // In MongoDB shell or compass
   db.users.updateOne(
     { email: "admin@cargo.com" },
     { $set: { role: "admin" } }
   )
   \`\`\`

2. **Create via API** (recommended for production):
   Implement a separate admin creation endpoint with proper security.

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Cars
- `GET /api/cars` - Get all cars (with filters)
- `GET /api/cars/:id` - Get single car
- `POST /api/cars/:id/check-availability` - Check availability
- `GET /api/cars/filters/brands` - Get unique brands

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - Get user bookings
- `GET /api/bookings/:id` - Get single booking
- `PATCH /api/bookings/:id/cancel` - Cancel booking

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `POST /api/admin/cars` - Add car
- `PUT /api/admin/cars/:id` - Update car
- `DELETE /api/admin/cars/:id` - Delete car
- `GET /api/admin/bookings` - Get all bookings
- `PATCH /api/admin/bookings/:id/status` - Update booking status

## 🚀 Deployment

### Frontend (Vercel)
1. Build the client: `cd client && npm run build`
2. Deploy to Vercel or your preferred hosting service

### Backend (Railway/Render)
1. Set up environment variables on your hosting platform
2. Deploy the server directory
3. Ensure MongoDB connection is configured

### Environment Variables for Production
\`\`\`env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
CLIENT_URL=your_frontend_domain
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact: info@cargo.com
- Documentation: Check the code comments and this README

## 🔄 Future Enhancements

- [ ] Payment gateway integration (Stripe/Razorpay)
- [ ] Real-time notifications
- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Car reviews and ratings system
- [ ] GPS tracking integration
- [ ] Automated email notifications
- [ ] Social media login integration
- [ ] Advanced search with location-based filtering

---

**Happy Coding! 🚗💨**
