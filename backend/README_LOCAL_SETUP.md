# Local setup checklist (MongoDB + AWS)

## 1) MongoDB
The backend requires `MONGODB_URI` in `backend/.env`.

### If using local MongoDB
- Ensure MongoDB is running and listening on `127.0.0.1:27017`.
- Keep `.env` as:
  - `MONGODB_URI=mongodb://127.0.0.1:27017/aws-s3-file-storage`

### If using MongoDB Atlas / remote MongoDB
- Replace `MONGODB_URI` with your Atlas connection string.
  - Example shape:
    - `mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority`

After changing it, restart the backend.

## 2) Cloudinary
The backend streams and uploads files directly to Cloudinary storage.

In `backend/.env` ensure:
- `CLOUDINARY_CLOUD_NAME=your_cloud_name`
- `CLOUDINARY_API_KEY=your_api_key`
- `CLOUDINARY_API_SECRET=your_api_secret`

## 3) Run
Backend:
```powershell
cd c:\Users\Dell\Downloads\file_aws\backend
npm run dev
```

Frontend:
```powershell
cd c:\Users\Dell\Downloads\file_aws\frontend
npm run dev
```

Open:
- Frontend: http://localhost:5173
- Backend health: http://localhost:4000/health
```

