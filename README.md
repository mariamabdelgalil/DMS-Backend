# DocSimple - Your Way to Simple Documents Management

The backend of this project built using **Node.js**, **Express**, PostgreSQL, MongoDB, and **Prisma/Mongoose** following a clean, modular architecture.  
The system exposes secure RESTful endpoints for user/workspace/document management and integrates with both PostgreSQL and MongoDB.  
This backend powers the frontend built with React.

---

## Tech Stack

### **Backend**
- Node.js + Express  
- Controllers / Services / Models / Routes (Clean Architecture)
- Prisma ORM (PostgreSQL)
- Mongoose (MongoDB Atlas)
- JWT Authentication  
- Sharp for image compression  

---

## Clean Architecture Flow

- **Routes**: Define API paths and call controllers  
- **Controllers**: Handle requests, responses & basic validation  
- **Services**: Core business logic  
- **Models**: Prisma/Mongoose database access  
- **Database**: PostgreSQL for users, MongoDB for workspaces/documents  

---

## Authentication

- JSON Web Tokens (JWT)  
- Protected routes with auth middleware



