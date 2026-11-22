# IdeaVault – Server

The backend API for **IdeaVault**, a startup idea-sharing platform where users can share, explore, like, and comment on startup ideas.

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- Firebase Authentication
- Firebase Admin SDK

## Features

- RESTful API for managing startup ideas
- Create, read, update, and delete ideas
- Trending ideas using MongoDB aggregation
- Like and unlike startup ideas
- Add, edit, and delete comments
- Firebase token verification for protected routes
- Ownership verification for idea and comment modifications
- Secure user identity using Firebase authentication
- Excludes private author email information from public idea responses

## Installation and Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/tasnimnova-28/IdeaVault-server.git
   ```

2. Navigate to the project folder:

   ```bash
   cd IdeaVault-server
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file in the root directory:

   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   ```

5. Add your Firebase Admin service account JSON file to the root directory as:

   `firebase-service-account.json`

   Keep this file private. Never upload it to GitHub.

6. Start the server:

   ```bash
   npm start
   ```

## API Endpoints

Base URL: `http://localhost:5000/api/ideas`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Get all ideas |
| GET | `/trending` | Get trending ideas |
| GET | `/:id` | Get a single idea |
| POST | `/` | Create an idea |
| PUT | `/:id` | Update an idea |
| DELETE | `/:id` | Delete an idea |
| POST | `/:id/like` | Like or unlike an idea |
| POST | `/:id/comments` | Add a comment |
| PUT | `/:id/comments/:commentId` | Edit a comment |
| DELETE | `/:id/comments/:commentId` | Delete a comment |

### Authentication

Protected endpoints require a valid Firebase ID token in the Authorization header:

```http
Authorization: Bearer YOUR_FIREBASE_ID_TOKEN
```

Users can only modify or delete their own ideas and comments.

## Project Structure

```text
server/
├── middleware/
│   └── verifyToken.js
├── models/
│   └── Idea.js
├── routes/
│   └── ideaRoutes.js
├── firebaseAdmin.js
├── server.js
├── package.json
└── README.md
```

## Author

Developed as part of the IdeaVault project.