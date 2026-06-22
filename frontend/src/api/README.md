Client API helpers for the backend.

Endpoints used (base: VITE_API_BASE_URL):
- POST   /api/auth/register
- POST   /api/auth/login
- GET    /api/cloudinary-files
- POST   /api/cloudinary-files/upload (multipart field name: "file")
- DELETE /api/cloudinary-files/:fileId
- PATCH  /api/cloudinary-files/:fileId/rename
- GET    /api/cloudinary-files/stats

