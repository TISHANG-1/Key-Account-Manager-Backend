# Lead Management System for Key Account Managers

## Project Overview
The Lead Management System is designed to help Udaan’s Key Account Managers (KAMs) manage large restaurant accounts effectively. The system helps track leads, manage contacts, plan calls, and monitor account performance. It is built with a Node.js and Express backend using PostgreSQL for the database and a React.js frontend for the user interface.

## System Requirements

### Backend
- **Node.js** with Express for RESTful APIs
- **PostgreSQL** as the database

### Frontend
- **React.js** for the user interface

## Installation Instructions

### Prerequisites
- Node.js (v16 or later)
- PostgreSQL (v12 or later)
- npm or yarn package manager

### Setup Steps

#### Backend
1. Clone the repository:
   ```bash
   git clone https://github.com/TISHANG-1/Key-Account-Manager-Backend
   cd Key-Account-Manager-Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in a `.env` file:
   ```env
   PORT=8080
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=10d
   POSTGRESQL_URL=postgres://username:password@localhost:5432/lead_management
   ```



5. Start the backend server:
   ```bash
   npm start
   ```

#### Frontend
1. Clone the repository:
   ```bash
   git clone https://github.com/TISHANG-1/Key-account-manager-frontend
   cd Key-account-manager-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure the API URL in `src/utils.js`:
   ```javascript
   export const ROOT_URL = 'http://localhost:8080';
   ```

4. Start the React development server:
   ```bash
   npm start
   ```

## Running Instructions
1. Ensure both the backend and frontend are running.
2. Open the frontend in your browser at `http://localhost:3000`.


## [API Documentation Link](https://documenter.getpostman.com/view/26405540/2sAYJ6BKbz)
use this if above link doesn't work https://documenter.getpostman.com/view/26405540/2sAYJ6BKbz
