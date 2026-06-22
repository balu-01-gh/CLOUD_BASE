# TODO - Complete Personal Cloud Storage Platform (Cloudinary + MongoDB Atlas)

## Frontend (React)
- [ ] Add Tailwind CSS (or keep minimal CSS if preferred)
- [ ] Add Axios (optional) + unify API calls
- [ ] Real upload progress bar (Cloudinary upload progress via backend streaming is hard; implement progress for FormData upload using XHR)
- [ ] Drag-and-drop + multiple file upload
- [ ] Search + sort dashboard (client-side using metadata from backend)
- [ ] Rename files (update MongoDB + Cloudinary public_id)
- [ ] Preview supported files (images/videos use `secureUrl`; others open in new tab)

## Backend (Express)
- [ ] Add endpoint: PATCH `/api/cloudinary-files/:fileId/rename` (ownership enforced)
- [ ] Add endpoint: GET `/api/cloudinary-files/stats` (analytics)
- [ ] Add endpoint: GET `/api/cloudinary-files/search?...` (optional) or keep search client-side
- [ ] Support multi-file upload (accept multiple multipart parts)
- [ ] Add better error handling + validation schemas

## Sharing (future enhancement -> implement if required)
- [ ] Add share links table/collection with expiry + permissions
- [ ] Add endpoint to generate share link and access it without login

## DevOps / Docs
- [ ] Update README with complete setup (Atlas + Cloudinary env vars)
- [ ] Add `.env.example` files for both backend and frontend
- [ ] Provide Postman/curl examples for: register/login/upload/list/delete/rename

