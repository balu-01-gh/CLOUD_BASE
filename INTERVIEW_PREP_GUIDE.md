# Interview Preparation & Project Walkthrough Guide

Use this guide to prepare for your project defense, technical interview, or viva. It is written as a step-by-step answer sheet to explain **how** the project was built and **what** role each tech stack plays.

---

## 🚀 Part 1: Step-by-Step Project Development Walkthrough

If the interviewer asks: **"Walk me through how you built this project step-by-step"**, answer with this structure:

### **Step 1: Monorepo Architecture & Directory Setup**
* *"First, I structured the project as a decoupled full-stack application (monorepo). I separated it into a `frontend/` directory (React/Vite client) and a `backend/` directory (Express API server). I initialized `.gitignore` to prevent committing dependency directories like `node_modules` or sensitive environment secrets (`.env`)."*

### **Step 2: Database Schema Design & Authentication (MongoDB + JWT)**
* *"Next, I set up the database schemas in Mongoose. I created three models: `User` (credentials), `File` (references `userId` and tracks metadata like URL, type, and size), and `Share` (tracks public sharing keys and view counts).*
* *I built the auth routes using `bcryptjs` to securely hash passwords during registration, and created a **JWT (JSON Web Token) utility** to sign tokens on login. I then wrote an authorization middleware (`requireAuth`) that intercepts API requests, extracts the Bearer token, validates it, and mounts the authenticated user's ID to `req.user` for ownership enforcement."*

### **Step 3: Storage Integration & Memory-Buffer Upload Streaming (Multer + Cloudinary)**
* *"Once authentication was secure, I set up the file upload pipeline. I configured `multer` with a memory-buffer storage engine instead of disk-storage, keeping file data in temporary RAM.*
* *I integrated the **Cloudinary SDK** and wrote the upload route. In this route, the backend checks the file's MIME type and maps it to the correct Cloudinary resource classification (`image`, `video`, or `raw`). It then opens a writable upload stream and pipes the file's binary memory buffer directly to Cloudinary. On successful upload, Cloudinary returns a secure URL and a public ID, which the backend saves into MongoDB."*

### **Step 4: Frontend Development & UI Design (React + Vanilla CSS)**
* *"With the API endpoints ready, I built the client-side dashboard in React. I used Vite as the bundler. I coded the components from scratch using **Vanilla CSS with a dark glassmorphic theme** (using backdrop-filters and harmonized HSL colors).*
* *I implemented core React states to manage view toggling (grid vs list), category filters, search input, and responsive file preview modals (rendering inline `<img>`, `<video>`, `<audio>`, or PDF `<iframe>` based on content type).*
* *For uploads, I coded a custom file selector and dropzone that exposes upload progress percentages by mapping an `XMLHttpRequest (XHR)` progress handler to React state."*

### **Step 5: Optimization, Sharing, & Direct Downloads (Refining)**
* *"Lastly, I refined the system by fixing bugs: I added queue deduplication on the frontend to prevent double uploads, replaced standard browser prompt windows with custom inline React states for deletion and renaming, and built a backend download proxy route to pipe files as standard attachments, solving CORS download blocks. Finally, I deployed the frontend configuration to Vercel."*

---

## 🛠️ Part 2: Tech Stack Breakdown (Why and How)

If the interviewer asks: **"Explain what each technology in your stack does and why you used it"**, refer to this guide:

| Technology | What it is | Why we chose it & What it does in this project |
| :--- | :--- | :--- |
| **React (Frontend)** | Component-based JS library | **Why**: Single Page Application (SPA) state updates without page reloading.<br>**How**: Handles view state toggles, triggers API requests, calculates upload percentages, and opens modal viewing players. |
| **Node.js & Express (Backend)** | JavaScript runtime & framework | **Why**: Highly efficient asynchronous, event-driven architecture.<br>**How**: Acts as the RESTful API server. Receives files, verifies user JWT tokens, validates storage quotas, and proxies binary download streams. |
| **MongoDB Atlas (Database)** | Cloud NoSQL database | **Why**: Document-based storage matches our JSON metadata schema naturally. Scalable and fast.<br>**How**: Stores user credentials, file records, and share statistics. We use database indices on `userId` to query and load user workspaces instantly. |
| **Cloudinary (Storage)** | Cloud SaaS Asset Management | **Why**: Generous free tier, fast CDN, automatic media compression.<br>**How**: Stores the actual binary files. Serves files securely over HTTPS and classifies media types dynamically. |
| **JWT (JSON Web Token)** | Stateless session protocol | **Why**: Scaleable stateless authentication. No server session state required.<br>**How**: Generated upon successful login. Sent in the header of API requests as a Bearer token to authorize access to user private workspaces. |
| **Mongoose** | ODM (Object Document Mapper) | **Why**: Provides strict schema validation and query helpers for MongoDB.<br>**How**: Manages document relationships (linking Files/Shares to Users) and runs calculations like database file size aggregations. |
