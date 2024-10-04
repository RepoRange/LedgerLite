# LedgerLite

## Overview

**LedgerLite** is a simple yet powerful ledger application that allows users to manage their financial records seamlessly. Built with a session-based authentication system using Google OAuth 2.0, this application enables users to perform CRUD operations on their ledger entries while ensuring security and efficiency.

## Features

- **User Authentication**: Secure login and session management using Google OAuth 2.0.
- **CRUD Operations**: Create, Read, Update, and Delete ledger entries.
- **Responsive Design**: Built with Tailwind CSS for a modern, responsive user interface.
- **Real-time Data Handling**: Efficient data management with MongoDB Atlas.

## Technologies Used

- **Node.js**: JavaScript runtime for building scalable server-side applications.
- **Express.js**: Web framework for Node.js, providing a robust set of features for web and mobile applications.
- **MongoDB Atlas**: Cloud-based NoSQL database for flexible data storage.
- **EJS (Embedded JavaScript)**: Templating engine for rendering dynamic HTML pages.
- **Google OAuth 2.0**: Authentication protocol for secure user login.

## Packages Used

The following packages are essential for the functionality of the LedgerLite application:

- **express**: Fast, unopinionated, minimalist web framework for Node.js.
- **mongoose**: MongoDB object modeling for Node.js, enabling schema-based data modeling.
- **dotenv**: Module to load environment variables from a `.env` file into `process.env`.
- **passport**: Authentication middleware for Node.js, used with various strategies.
- **passport-google-oauth20**: Google OAuth 2.0 authentication strategy for Passport.
- **express-session**: Middleware for managing sessions in Express applications.
- **ejs**: Templating engine to render dynamic HTML pages.
- **tailwindcss**: Utility-first CSS framework for creating responsive designs.

## Setup and Installation

1. **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/LedgerLite.git
    ```

2. **Navigate to the project directory**:
    ```bash
    cd LedgerLite
    ```

3. **Install dependencies**:
    ```bash
    npm install
    ```

4. **Create a `.env` file** in the root directory and add your MongoDB Atlas connection string and Google OAuth credentials:
    ```
    MONGODB_URI=your_mongodb_uri
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    SESSION_SECRET=your_session_secret
    ```

5. **Run the application**:
    ```bash
    npm start
    ```

6. **Access the application**: Open your web browser and go to `http://localhost:3000`.

## Usage

1. **Authenticate using Google**: Click on the "Login with Google" button to authenticate your session.
2. **Manage Ledger Entries**: Use the provided interface to create, view, edit, or delete your ledger entries.

## Contributing

Contributions are welcome! If you have suggestions for improvements or bug fixes, please feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License.
 
