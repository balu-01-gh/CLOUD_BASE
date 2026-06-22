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

## 2) AWS S3
The backend generates pre-signed URLs for upload/download.

In `backend/.env` ensure:
- `AWS_REGION=...`
- `AWS_ACCESS_KEY_ID=...`
- `AWS_SECRET_ACCESS_KEY=...`
- `S3_BUCKET_NAME=...`

Also ensure your bucket policy/IAM allows:
- `s3:PutObject` to `uploads/<userId>/*`
- `s3:GetObject` to `uploads/<userId>/*`
- `s3:DeleteObject` to `uploads/<userId>/*`

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

