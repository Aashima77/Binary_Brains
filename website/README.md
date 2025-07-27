
# VisionAI

**VisionAI** is a comprehensive AI-powered system designed to monitor industrial environments for safety and compliance. It leverages real-time video feeds, object detection, and a robust web interface to provide actionable alerts and insights.

---

## 🔍 Features

- **Real-time Monitoring**: Continuously analyzes camera feeds for safety violations.
- **Object Detection**: Identifies specific objects and behaviors (e.g., missing hard hats, unauthorized access).
- **Alerting System**: Generates immediate alerts with captured images and metadata.
- **Dashboard & Reporting**: Visualizes factory, location, and camera statuses; includes historical violation review.
- **User Management**: Secure login with role-based access control.
- **Configurable Setup**: Easily manage factories, locations, cameras, and worker data.

---

## 🧰 Technologies Used

### Frontend
- **Next.js**: React framework for full-stack capabilities.
- **TypeScript**: Type-safe JavaScript for better developer experience.
- **Tailwind CSS**: Utility-first CSS for building UI fast.
- **HeroUI**: Modern UI component library for React.

### Backend
- **Node.js (Express.js)**: Handles API and backend services.
- **PostgreSQL**: Relational database for structured application data.
- **Redis**: In-memory store for real-time data and job queues.
  - **BullMQ**: Job queue manager.
  - **Redis Pub/Sub**: Real-time event messaging.
- **Socket.IO**: Real-time WebSocket communication.
- **Cloudinary**: Cloud-based media management (images, videos).

---

## 🗂️ Project Structure

```
VisionAI/
├── app/               # Next.js pages, APIs, and layouts
├── components/        # Reusable UI components
├── config/            # Global configurations
├── database/          # Schema files
├── lib/               # Utility functions
├── src/
|   ├── lib/           # Utility functions for server and worker
│   ├── server/        # Node.js server
│   └── worker/        # BullMQ worker for processing
├── styles/            # Global styles
├── types/             # TypeScript types
```

---

## 🚀 Getting Started

### Prerequisites

Ensure the following are installed:

- Node.js (v18+)
- PostgreSQL
- Redis
- Git

---

## 📦 Installation

### 1. Clone the repository
```bash
https://github.com/Aashima77/Binary_Brains.git
cd Binary_Brains
cd website
```

### 2. Install Node dependencies
```bash
npm install
```

### 4. Database Setup
- Create a PostgreSQL database manually.
- Run the schema:
```bash
psql -U your_username -d your_database_name -f database/schema.sql
```

### 5. Configure Environment Variables
Create a `.env.local` file in the root:
```env
DATABASE_URL= [database connection string]
REDIS_URL= [redis connection string]
JWT_ACCESS_SECRET= [JWT secret key]
JWT_REFRESH_SECRET= [JWT secret key]

CLOUDINARY_CLOUD_NAME= [cloudinary cloud name]
CLOUDINARY_API_KEY= [cloudinary api key]
CLOUDINARY_API_SECRET= [cloudinary api secret]

NEXT_PUBLIC_FLASK_API_URL= http://localhost:5000
```

---

## ▶️ Running the Application


### 1. Start the BullMQ Worker
From root directory:
```bash
npm run worker
```

### 2. Start the App + Backend
From root directory:
```bash
npm run dev
```

The app will be available at: [http://localhost:3000](http://localhost:3000)

---

## 📡 API Endpoints

### API Routes Documentation

**1. `/api/alerts`**
*   **GET /api/alerts**
    *   **Description**: Fetches a list of violations (alerts) associated with the authenticated user's factories.
    *   **Authentication**: Requires a valid `accessToken` cookie.
    *   **Request**: No request body.
    *   **Response**:
        *   `200 OK`: Returns an array of alert objects.
            ```json
            [
              {
                "id": "string",
                "timestamp": "string (ISO 8601 datetime)",
                "type": "string",
                "image": "string (URL)",
                "camera_name": "string",
                "location_name": "string",
                "factory_name": "string"
              }
            ]
            ```
        *   `401 Unauthorized`: If `accessToken` is missing or invalid.
        *   `500 Internal Server Error`: If an error occurs during fetching.

**2. `/api/auth/session`**
*   **POST /api/auth/session**
    *   **Description**: Authenticates a user and sets `accessToken` and `refreshToken` cookies.
    *   **Authentication**: None (this is the login endpoint).
    *   **Request Body**:
        ```json
        {
          "email": "string (email format)",
          "password": "string (min 6 characters)"
        }
        ```
    *   **Response**:
        *   `200 OK`: `Set-Cookie` headers for `accessToken` and `refreshToken`.
            ```json
            {
              "message": "Login successful"
            }
            ```
        *   `400 Bad Request`: If request body is invalid (e.g., invalid email, password too short).
        *   `401 Unauthorized`: If credentials are invalid.
        *   `500 Internal Server Error`: If an unexpected error occurs.
*   **DELETE /api/auth/session**
    *   **Description**: Logs out the user by clearing `accessToken` and `refreshToken` cookies.
    *   **Authentication**: None (clears cookies regardless of validity).
    *   **Request**: No request body.
    *   **Response**:
        *   `200 OK`: `Set-Cookie` headers to expire `accessToken` and `refreshToken`.
            ```json
            {
              "message": "Logout successful"
            }
            ```

**3. `/api/auth/user`**
*   **GET /api/auth/user**
    *   **Description**: Checks if a user is authenticated and returns user details if so.
    *   **Authentication**: Requires a valid `accessToken` cookie.
    *   **Request**: No request body.
    *   **Response**:
        *   `200 OK`:
            ```json
            {
              "isAuthenticated": true,
              "user": {
                "name": "string",
                "email": "string"
              }
            }
            ```
            or
            ```json
            {
              "isAuthenticated": false
            }
            ```
        *   `404 Not Found`: If user ID from token is not found in the database.
*   **POST /api/auth/user**
    *   **Description**: Registers a new user and sets `accessToken` and `refreshToken` cookies.
    *   **Authentication**: None (this is the signup endpoint).
    *   **Request Body**:
        ```json
        {
          "name": "string",
          "email": "string (email format)",
          "password": "string"
        }
        ```
    *   **Response**:
        *   `200 OK`: `Set-Cookie` headers for `accessToken` and `refreshToken`.
            ```json
            {
              "user": {
                "id": "string"
              }
            }
            ```
        *   `500 Internal Server Error`: If an error occurs during registration.

**4. `/api/configs/camera`**
*   **POST /api/configs/camera**
    *   **Description**: Adds a new camera.
    *   **Authentication**: Requires a valid `accessToken` cookie.
    *   **Request Body**:
        ```json
        {
          "name": "string (min 1 character)",
          "streamUrl": "string (URL format, optional)",
          "locationId": "number (positive integer)"
        }
        ```
    *   **Response**:
        *   `201 Created`: Returns the newly created camera object.
        *   `400 Bad Request`: If request body is invalid.
        *   `401 Unauthorized`: If `accessToken` is missing or invalid.
        *   `404 Not Found`: If `locationId` does not exist or does not belong to the user.
        *   `500 Internal Server Error`: If an error occurs.

**5. `/api/configs/factory`**
*   **POST /api/configs/factory**
    *   **Description**: Adds a new factory.
    *   **Authentication**: Requires a valid `accessToken` cookie.
    *   **Request Body**:
        ```json
        {
          "name": "string (min 1 character)"
        }
        ```
    *   **Response**:
        *   `201 Created`: Returns the newly created factory object.
        *   `400 Bad Request`: If request body is invalid.
        *   `401 Unauthorized`: If `accessToken` is missing or invalid.
        *   `500 Internal Server Error`: If an error occurs.
*   **GET /api/configs/factory**
    *   **Description**: Fetches a list of factories belonging to the authenticated user.
    *   **Authentication**: Requires a valid `accessToken` cookie.
    *   **Request**: No request body.
    *   **Response**:
        *   `200 OK`: Returns an array of factory objects.
            ```json
            [
              {
                "id": "string",
                "name": "string"
              }
            ]
            ```
        *   `401 Unauthorized`: If `accessToken` is missing or invalid.
        *   `500 Internal Server Error`: If an error occurs.

**6. `/api/configs/location`**
*   **POST /api/configs/location**
    *   **Description**: Adds a new location.
    *   **Authentication**: Requires a valid `accessToken` cookie.
    *   **Request Body**:
        ```json
        {
          "name": "string (min 1 character)",
          "factoryId": "number (positive integer)"
        }
        ```
    *   **Response**:
        *   `201 Created`: Returns the newly created location object.
        *   `400 Bad Request`: If request body is invalid.
        *   `401 Unauthorized`: If `accessToken` is missing or invalid.
        *   `404 Not Found`: If `factoryId` does not exist or does not belong to the user.
        *   `500 Internal Server Error`: If an error occurs.
*   **GET /api/configs/location**
    *   **Description**: Fetches a list of locations belonging to the authenticated user's factories.
    *   **Authentication**: Requires a valid `accessToken` cookie.
    *   **Request**: No request body.
    *   **Response**:
        *   `200 OK`: Returns an array of location objects.
            ```json
            [
              {
                "id": "string",
                "location": "string",
                "factory_id": "string",
                "factory": "string"
              }
            ]
            ```
        *   `401 Unauthorized`: If `accessToken` is missing or invalid.
        *   `500 Internal Server Error`: If an error occurs.

**7. `/api/configs/worker`**
*   **POST /api/configs/worker**
    *   **Description**: Adds a new worker.
    *   **Authentication**: Requires a valid `accessToken` cookie.
    *   **Request Body**:
        ```json
        {
          "name": "string (min 1 character)",
          "employeeId": "string (min 1 character)",
          "department": "string (optional)",
          "factoryId": "number (positive integer)"
        }
        ```
    *   **Response**:
        *   `201 Created`: Returns the newly created worker object.
        *   `400 Bad Request`: If request body is invalid.
        *   `401 Unauthorized`: If `accessToken` is missing or invalid.
        *   `404 Not Found`: If `factoryId` does not exist or does not belong to the user.
        *   `500 Internal Server Error`: If an error occurs.

**8. `/api/feed`**
*   **GET /api/feed**
    *   **Description**: Fetches a structured feed of factories, locations, and cameras belonging to the authenticated user.
    *   **Authentication**: Requires a valid `accessToken` cookie.
    *   **Request**: No request body.
    *   **Response**:
        *   `200 OK`: Returns an array of factory objects, each containing nested locations and cameras.
            ```json
            [
              {
                "id": "string",
                "name": "string",
                "locations": {
                  "location_id_1": {
                    "id": "string",
                    "name": "string",
                    "cameras": [
                      {
                        "id": "string",
                        "name": "string",
                        "status": "string"
                      }
                    ]
                  }
                }
              }
            ]
            ```
        *   `401 Unauthorized`: If `accessToken` is missing or invalid.
        *   `500 Internal Server Error`: If an error occurs.

**9. `/api/refresh`**
*   **POST /api/refresh**
    *   **Description**: Refreshes the `accessToken` using a valid `refreshToken`.
    *   **Authentication**: Requires a valid `refreshToken` cookie.
    *   **Request**: No request body.
    *   **Response**:
        *   `200 OK`: `Set-Cookie` header for a new `accessToken`.
            ```json
            {
              "accessToken": "string (JWT)"
            }
            ```
        *   `401 Unauthorized`: If `refreshToken` is missing or invalid.

### Database Data Structures (SQL Schema)

The application uses a PostgreSQL database with the following tables:

**1. `users` Table**
*   **Description**: Stores user information.
*   **Columns**:
    *   `id`: `SERIAL PRIMARY KEY` - Unique identifier for the user.
    *   `name`: `TEXT NOT NULL` - User's full name.
    *   `email`: `TEXT UNIQUE NOT NULL` - User's email address, must be unique.
    *   `password`: `TEXT NOT NULL` - Hashed password for the user.
    *   `created_at`: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` - Timestamp when the user record was created.

**2. `factories` Table**
*   **Description**: Stores information about factories. Each factory is associated with a user.
*   **Columns**:
    *   `id`: `SERIAL PRIMARY KEY` - Unique identifier for the factory.
    *   `name`: `TEXT NOT NULL` - Name of the factory.
    *   `user_id`: `INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE` - Foreign key referencing the `users` table. If a user is deleted, their associated factories are also deleted.
    *   `created_at`: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` - Timestamp when the factory record was created.

**3. `locations` Table**
*   **Description**: Stores information about locations within factories.
*   **Columns**:
    *   `id`: `SERIAL PRIMARY KEY` - Unique identifier for the location.
    *   `name`: `TEXT NOT NULL` - Name of the location.
    *   `factory_id`: `INTEGER NOT NULL REFERENCES factories(id) ON DELETE CASCADE` - Foreign key referencing the `factories` table. If a factory is deleted, its associated locations are also deleted.
    *   `created_at`: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` - Timestamp when the location record was created.

**4. `cameras` Table**
*   **Description**: Stores information about cameras installed at locations.
*   **Columns**:
    *   `id`: `SERIAL PRIMARY KEY` - Unique identifier for the camera.
    *   `name`: `TEXT NOT NULL` - Name of the camera.
    *   `stream_url`: `TEXT` - URL for the camera's video stream (can be null).
    *   `status`: `camera_status DEFAULT 'active'` - Current status of the camera.
        *   `camera_status` is an `ENUM` type with possible values: `'active'`, `'inactive'`, `'offline'`.
    *   `location_id`: `INTEGER NOT NULL REFERENCES locations(id) ON DELETE CASCADE` - Foreign key referencing the `locations` table. If a location is deleted, its associated cameras are also deleted.
    *   `created_at`: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` - Timestamp when the camera record was created.

**5. `workers` Table**
*   **Description**: Stores information about workers associated with factories.
*   **Columns**:
    *   `id`: `SERIAL PRIMARY KEY` - Unique identifier for the worker.
    *   `name`: `TEXT NOT NULL` - Worker's name.
    *   `employee_id`: `TEXT UNIQUE` - Unique employee ID (can be null, but if present, must be unique).
    *   `department`: `TEXT` - Worker's department (can be null).
    *   `factory_id`: `INTEGER NOT NULL REFERENCES factories(id) ON DELETE CASCADE` - Foreign key referencing the `factories` table. If a factory is deleted, its associated workers are also deleted.
    *   `created_at`: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` - Timestamp when the worker record was created.

**6. `violations` Table**
*   **Description**: Stores records of detected violations.
*   **Columns**:
    *   `id`: `SERIAL PRIMARY KEY` - Unique identifier for the violation.
    *   `timestamp`: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` - Timestamp when the violation was recorded.
    *   `violation_type`: `TEXT NOT NULL` - Type or description of the violation.
    *   `image_url`: `TEXT` - URL to an image associated with the violation (can be null).
    *   `camera_id`: `INTEGER NOT NULL REFERENCES cameras(id) ON DELETE CASCADE` - Foreign key referencing the `cameras` table. If a camera is deleted, its associated violations are also deleted.

---

## 🤝 Contributing

We welcome contributions! Please submit issues, feature requests, and pull requests via GitHub.

---

## 📄 License

This project is licensed under the MIT License. See [`LICENSE`](./LICENSE) for more information.

---

## 📬 Contact

_Replace with your contact information:_

- **Maintainer**: Mohit Davar
- **Email**: mohitdavar2004@gmail.com
- **GitHub**: [@Mohit-Davar](https://github.com/Mohit-Davar)
