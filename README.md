# User Notes Dashboard

A secure, full-stack web application that allows users to sign up, log in, and manage their own private text notes. Built with React, Node.js, Express, and MySQL.

## ✨ Features

- **User Authentication:** Secure signup and login using JWT (JSON Web Tokens) and bcrypt password hashing.
- **Protected Dashboard:** Only authenticated users can access the dashboard and API routes.
- **Full CRUD Operations:** Users can Create, Read, Update, and Delete their own notes.
- **Strict User Isolation:** Database-level enforcement ensures users can only view, edit, and delete their _own_ messages. Cross-user access is prevented.
- **Forgot Password:** A built-in direct-reset feature to change a forgotten password.
- **Session Persistence:** JWT tokens are stored in `localStorage` to keep users logged in across page refreshes.

## 🛠️ Tech Stack

- **Frontend:** React.js (Vite), CSS3
- **Backend:** Node.js, Express.js
- **Database:** MySQL (`mysql2` promise pool)
- **Authentication:** JSON Web Tokens (JWT), bcryptjs

## 📁 Folder Structure

```text
user-notes-dashboard/
├── database/
│   └── schema.sql
├── server/
│   ├── .env
│   ├── package.json
│   ├── server.js
│   ├── db.js
│   ├── middleware/
│   │   └── auth.js
│   └── routes/
│       ├── auth.js
│       └── messages.js
└── client/
    ├── .env
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api.js
        ├── styles.css
        └── components/
            ├── AuthForm.jsx
            └── Dashboard.jsx





Setup & Installation Instructions:-
Prerequisites
Make sure you have the following installed on your machine:

Node.js (v16 or higher)

MySQL (running locally)

Git

Step 1: Database Setup
Ensure your local MySQL server is running.

Open your MySQL client (e.g., MySQL Workbench) or use the terminal to run the SQL script located at database/schema.sql.
Using PowerShell/Terminal:

powershell
mysql -u root -p -e "source ./database/schema.sql"
(Note: Enter your MySQL root password when prompted. This will create the notes_app database and the required user_tbl and message_tbl tables).

Step 2: Backend Setup
Open a terminal and navigate to the server folder:

bash
cd server
Install the required NPM packages:

bash
npm install
Create a .env file in the server directory and add the following variables (update with your actual MySQL credentials):

env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=notes_app
JWT_SECRET=super_secret_random_string_here
JWT_EXPIRES_IN=1d
CLIENT_ORIGIN=http://localhost:5173
Start the backend development server:

bash
npm run dev
(The API should now be running on http://localhost:5000. Leave this terminal open).

Step 3: Frontend Setup
Open a new terminal window and navigate to the client folder:

bash
cd client
Install the required NPM packages:

bash
npm install
Create a .env file in the client directory:

env
VITE_API_URL=http://localhost:5000/api
Start the React development server:

bash
npm run dev
(The frontend should now be running on http://localhost:5173. Leave this terminal open).

🧪 How to Test the Application
Access the App: Open your browser and go to http://localhost:5173. You will see the centered "User Notes Dashboard" title.

Sign Up: Click the "Sign Up" tab, create a new account, and verify that it automatically redirects you to the Login screen.

Login & CRUD: Log in, add a few short text messages, edit one, and delete one.

Test Forgot Password: Click "Logout", click "Forgot Password?", enter your email and a new password, and verify you can log in with the new credentials.

Test User Isolation (Security):

Keep User A logged in and note down the ID of one of their messages.

Open an incognito window or a different browser, log in as User B (create a new account).

Try to manually trigger a DELETE request to User A's message ID using an API tool (like Postman) with User B's token.

Expected Result: The backend uses WHERE id = ? AND user_id = ? to ensure User B receives a 404 Not Found and the data remains secure.


```
