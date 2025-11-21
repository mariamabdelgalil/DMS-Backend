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


---

## Document Management Features

###  File Upload (multer + Sharp)
- Users upload documents (PDF, images, word, etc.)
- If the file is an **image**, Sharp compresses it  
- The system generates:  
  - **Original file**  
  - **Thumbnail preview (Base64)**

###  File Preview (Base64)
- For image documents → Base64 preview string is generated 
- Allows instant preview in frontend without extra requests  
- Improves UI performance  

###  File Download
- Secure REST endpoint to download files by ID  
- Token verification keeps private documents protected  

###  Soft Delete (Move to Recycle Bin)
- Document is marked as `isDeleted = true`
- Removed from workspace view but recoverable  

###  Permanent Delete
- File removed permanently from storage  
- Document removed from MongoDB  

---

## 🔐 Authentication Flow

- User logs in/registers → backend validates → returns **JWT + user info**  
- Redux stores auth data  
- Redux Persist saves it into **localStorage**  
- Protected routes check JWT validity  
- Middleware checks token before accessing sensitive operations

