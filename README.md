School ERP Backend
Backend API for a School Enterprise Resource Planning (ERP) system built with Node.js, Express, and modern JavaScript practices.
Prerequisites

Node.js (v20.x or higher)
npm (v10.x or higher)
MongoDB (local or cloud instance)
Redis (local or cloud instance)
Cloudinary, SMTP, and Twilio accounts for respective services

Installation

Clone the repository:git clone <repository-url>
cd school-erp-backend

Install dependencies:npm install

Create environment file:
Copy .env.local to .env.<environment> (e.g., .env.development, .env.production)
Update the environment variables with your credentials (e.g., DATABASE_URL, JWT_SECRET, etc.)

Running the Server

Development mode (with nodemon):npm run dev

Production mode:npm run start

Testing
Run tests using Jest:
npm run test

Project Structure

src/ - Source code
api/ - API routes, controllers, and services
config/ - Configuration files (database, logger, env)
lib/ - External service integrations (Redis, Cloudinary, etc.)
middleware/ - Express middlewares
models/ - Database models
repositories/ - Data access layer
services/ - Business logic
shared/ - Utilities, constants, and i18n
jobs/ - Background jobs
templates/ - Email and SMS templates
docs/ - API documentation

tests/ - Unit and integration tests
.env.\* - Environment-specific configuration files

Import Aliases
The project uses # aliases for cleaner imports, configured in package.json and jsconfig.json. Examples:

import db from '#config/database.js'
import authRoutes from '#api/v1/routes/auth.routes.js'

Ensure your editor supports jsconfig.json for proper IntelliSense.
