
### 📁 `cosmic-gazzer-api/README.md`

```md
# 🌌 Cosmic Gazzer API

**Cosmic Gazzer API** is the backend server for the Cosmic Gazzer mobile app — a social platform where users can create and join space-related events and share posts with the community. This API handles authentication, user data, posts, and event management.

---

## 🔧 Tech Stack

- **Node.js**
- **Express.js**
- **MongoDB** + Mongoose
- **JWT Authentication**
- **RESTful API Design**

---


## 🗂️ Folder Structure

```
📁 /controllers     → Logic for auth, posts, events
📁 /models          → Mongoose schemas
📁 /routes          → All API route definitions
📁 /middlewares      → Auth middleware
📁 /utils           → Helpers (e.g. token functions)
📁 /confg           → For Database 
📄 server.js        → App entry point
```

---

## ⚙️ Getting Started

### 🔐 Setup `.env`

```
PORT=5000
MONGODB_URI=your_mongodb_connection
JWT_SECRET=your_super_secret_key
```

### 🚀 Run the Server

```bash
npm install
npm run dev
```

The server will run on `http://localhost:5000`.

---

## 🛡️ Security

- JWT-based route protection
- Passwords hashed using `bcrypt`
- CORS enabled for frontend access

---

## 🚀 Future Improvements

- [ ] Add image upload support (Cloudinary or S3)
- [ ] Add comment system for posts
- [ ] Add RSVP feature for events
- [ ] Add user settings/profile update

---

## 📬 Feedback

Feel free to open issues or reach out for suggestions, improvements, or questions. Contributions are welcome!
```