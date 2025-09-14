LeetCode Clone Project API
This is the backend API for a LeetCode-style coding platform. It allows admins to create, update, and manage coding problems, and allows users to view them. The API uses Judge0 for code execution and validation.

Features
User registration and authentication (JWT-based)

Admin and User roles

Admins can create and update problems

Users can view a list of all problems

Users can view a single problem by its ID

Code validation against test cases using the Judge0 API

Caching of logout tokens using Redis

Tech Stack
Node.js: JavaScript runtime environment

Express.js: Web framework for Node.js

MongoDB: NoSQL database for storing user and problem data

Mongoose: ODM for MongoDB

Redis: In-memory data store for token blocklisting

Judge0: API for compiling and running code

JWT: For handling user authentication tokens

bcrypt: For password hashing

Getting Started
Follow these instructions to get a local copy of the project up and running.

Prerequisites
Node.js and npm installed

MongoDB instance (local or cloud-based)

Redis instance (local or cloud-based)

A RapidAPI account with a subscription to the Judge0 CE API

Installation & Setup
Clone the repository:

git clone <your-repository-url>
cd leetcode_project


Install NPM packages:

npm install


Create the environment file:
Create a file named .env in the root of the project and add the following variables.

# Server Configuration
PORT=3000

# MongoDB Connection
DB_CONNECT_STRING=your_mongodb_connection_string

# JWT Secret Key
JWT_KEY=your_super_secret_jwt_key

# Redis Password (if required)
REDIS_PASS=your_redis_password

# Judge0 API Key from RapidAPI
JUDGE0_API_KEY=your_judge0_api_key_from_rapidapi


Start the server:

npm start


The server should now be running on http://localhost:3000.

API Endpoints
All endpoints are prefixed with /.

Authentication (/user)
POST /user/register: Register a new user.

POST /user/login: Log in an existing user.

POST /user/logout: Log out the current user (requires authentication).

POST /user/admin/register: Register a new admin (requires admin authentication).

Problems (/problem)
POST /problem/create: (Admin only) Create a new coding problem. The request body should be a JSON object containing the problem details, including referenceSolution for multiple languages. The solutions are validated against the visibleTestCases before saving.

PUT /problem/update/:id: (Admin only) Update an existing problem by its ID. The request body is the same as the create endpoint.

GET /problem/all: (User/Admin) Get a list of all problems in the database (returns _id, title, difficulty, tags).

GET /problem/:id: (User/Admin) Get a single problem by its ID.

Next Steps
Now that the backend is solid, here are some ideas for what you could build next:

A frontend application (using React, Vue, or Angular) to interact with this API.

An endpoint for users to submit their own code for a specific problem, which gets validated against both visible and hidden test cases.

A DELETE /problem/delete/:id endpoint for admins.

Tracking user submissions and which problems they have solved.

Congratulations on getting everything working! Let me know if you have any more questions.