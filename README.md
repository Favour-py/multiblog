# MultiBlog - Multi-User Blogging Platform

A modern, full-stack blogging platform built for collaborative content creation. Users can create, share, and engage with blog posts across multiple categories.

## Features

✨ **User Management**
- User registration and authentication with JWT
- Secure password hashing with bcryptjs
- User profiles with personal blog feeds

📝 **Blogging Functionality**
- Create, read, update, and delete blog posts
- Categorize posts (Technology, Lifestyle, Travel, Food, etc.)
- View posts by specific authors or categories
- Like and comment on posts (foundational structure)

🎯 **User Experience**
- Responsive, modern UI with gradient design
- Real-time post feed updates
- Modal-based authentication and post creation
- Empty state messages for better UX

## Tech Stack

### Frontend
- HTML5, CSS3, JavaScript (Vanilla)
- Responsive grid layout
- Fetch API for backend communication
- Local storage for session management

### Backend
- **Node.js** with Express.js
- **MongoDB** for data persistence
- JWT for authentication
- bcryptjs for password security
- express-validator for input validation
- CORS enabled for frontend communication

## Project Structure

```
├── index.html          # Main frontend page
├── styles.css          # Styling and responsive design
├── script.js           # Frontend logic and API calls
├── server.js           # Express backend server
├── package.json        # Project dependencies
└── README.md           # Documentation
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or connection string)
- npm (comes with Node.js)

### Setup Steps

1. **Install Dependencies**
```bash
npm install
```

2. **Start MongoDB**
```bash
# On Windows
mongod

# On macOS/Linux
mongod
```

3. **Start the Backend Server**
```bash
npm start
# or for development with auto-reload
npm run dev
```

The server will run on `http://localhost:5000`

4. **Open the Frontend**
- Open `index.html` in your web browser
- Or use a local server: `python -m http.server 8000`
- Then navigate to `http://localhost:8000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login user

### Posts
- `POST /api/posts` - Create new post (requires auth)
- `GET /api/posts` - Get all posts or filtered posts
- `GET /api/posts/:id` - Get specific post
- `PUT /api/posts/:id` - Update post (requires auth, owner only)
- `DELETE /api/posts/:id` - Delete post (requires auth, owner only)
- `GET /api/posts/tags/all` - Get all categories

## Usage

1. **Sign Up** - Create a new account with email and password
2. **Login** - Access your account
3. **Create Posts** - Click "New Post" button to create blog posts
4. **Browse Posts** - View posts from other users on the feed
5. **Manage Posts** - Edit or delete your own posts
6. **Filter Posts** - Click category tags to filter by topic

## Future Enhancements

- [ ] Post comments and nested replies
- [ ] Like/unlike posts
- [ ] Follow other users
- [ ] User profiles with bio and profile picture
- [ ] Search functionality
- [ ] Post bookmarks/favorites
- [ ] Email notifications
- [ ] Admin dashboard
- [ ] Analytics and stats

## Security Notes

⚠️ **For Production:**
- Change the JWT_SECRET in server.js
- Use environment variables for sensitive data
- Implement HTTPS
- Add rate limiting
- Add CSRF protection
- Use helmet middleware for security headers

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  createdAt: Date
}
```

### Posts Collection
```javascript
{
  _id: ObjectId,
  title: String,
  content: String,
  category: String,
  author: {
    _id: String,
    name: String,
    email: String
  },
  likes: Number,
  comments: Array,
  createdAt: Date,
  updatedAt: Date
}
```

## Troubleshooting

**"Server not running" error**
- Make sure MongoDB is running
- Verify server is started with `npm start`
- Check that port 5000 is not in use

**CORS errors**
- Ensure backend is running on port 5000
- Check CORS middleware in server.js

**MongoDB connection failed**
- Install MongoDB from https://www.mongodb.com/try/download/community
- Ensure mongod service is running

## Contact & Support

For questions or issues, please refer to the project documentation or create an issue in the repository.

---

**Good luck with your Final Year Project! 🚀**
