# 🗨️ Chat App Backend

A real-time chat application backend using **Node.js**, **Express.js**, **Socket.io**, and **MongoDB**.

## 🚀 Features

- 🔒 **Authentication & Authorization** (JWT-based)
- 💬 **Real-time Messaging** using Socket.io
- 📁 **Media Uploads** via Multer & Cloudinary
- 🗄️ **MongoDB Database** with Mongoose ORM
- 📧 **Email Notifications** via Nodemailer
- 🔄 **Token Refresh System**

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Real-time:** Socket.io
- **File Storage:** Cloudinary
- **Authentication:** JWT (JSON Web Token)
- **Security:** bcrypt for password hashing

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository
```bash
    git clone https://github.com/raneemmagdy/ChatAppSocketBE.git
    cd ChatAppSocketBE
```

### 2️⃣ Install Dependencies
```bash
    npm install
```

### 3️⃣ Setup Environment Variables
Create a `.env` file in the root directory and add the following:
```env
PORT=3000
MONGO_DB_URI=your_mongodb_uri
PREFIX_FOR_USER=Bearer
PREFIX_FOR_ADMIN=Admin
ACCESS_JWT_SECRET_USER=your_access_jwt_secret
ACCESS_JWT_SECRET_ADMIN=your_access_jwt_secret
REFRESH_JWT_SECRET_USER=your_refresh_jwt_secret
REFRESH_JWT_SECRET_ADMIN=your_refresh_jwt_secret
SALT_ROUND=12
PASSWORD_FOR_EMAIL_SENDER=your_email_password
EMAIL_SENDER=your_email@example.com
CLIENT_ID=your_google_client_id
SECRET_KEY_PHONE=your_phone_secret_key
CLOUD_NAME=your_cloudinary_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
```

### 4️⃣ Start the Server
```bash
    npm run dev
```

The server will run on `http://localhost:3000`

## 🔌 Socket.io Events

### 🔹 **Connection Event**
When a user connects, they are registered in the system.
```javascript
io.on('connection', async (socket) => {
    console.log(socket.id);
    await registerUser(socket);
    await sendMessage(socket);
    await logOut(socket);
});
```

### 💬 **Send Message**
```javascript
socket.on('sendMessage', async (messageInfo) => {
    console.log(messageInfo);
    // Authentication Check
    const data = await authSocket({ socket });
    if (data.statusCode !== 200) {
        return socket.emit('authError', data);
    }
    // Message Logic Here
});
```

### ❌ **User Disconnect**
```javascript
socket.on("disconnect", async () => {
    const data = await authSocket({ socket });
    if (data.statusCode !== 200) {
        return socket.emit('authError', data);
    }
    connectedUsers.delete(data.user._id.toString(), socket.id);
});
```

### 📌 Events

| Event Name      | Description                |
|----------------|----------------------------|
| `sendMessage`  | Sends a message            |
| `receiveMessage` | Receives a message       |
| `authError`    | Authentication error       |
| `disconnect`   | User disconnects           |


## 📩 REST API Documentation

Postman API Docs: [View Here](https://documenter.getpostman.com/view/26311189/2sAYdbQE9U)



