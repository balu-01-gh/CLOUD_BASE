# TESTING_REPORT.md

## Status
- ✅ Backend is running and reachable.
- ✅ `GET http://localhost:5000/health` returns: `{"ok":true}`.
- ⚠️ Full end-to-end endpoint tests (auth + upload/view/download) were **not executed here** because sending POST requests via this tool environment hit client-side command quoting issues (PowerShell/curl header/body formatting).

## Evidence (runtime)
- Backend `/health` success confirmed via local HTTP request.

## Known runtime prerequisites
- MongoDB Atlas connectivity must remain enabled (IP allowlist / TLS settings) for server + tests.
- Cloudinary environment variables (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) must be set for Cloudinary routes.

## Verification Checklist (run locally)

### Backend (Cloudinary-only)
1. `GET /health`
   - Expected: `{ "ok": true }`
2. Auth
   - `POST /api/auth/register` (valid email/password)
     - Expected: `201` and `{ token, user }`
   - `POST /api/auth/login` (same credentials)
     - Expected: `200` and `{ token, user }`
   - Missing/invalid token
     - Expected: `401 Unauthorized` from `requireAuth`.
3. Cloudinary file flows (auth required)
   - Upload
     - `POST /api/cloudinary-files/upload` with multipart form-data field name `file`
     - Expected: `201` and returned `secureUrl`
   - List
     - `GET /api/cloudinary-files`
     - Expected: user-scoped `files[]`
   - View/Download
     - Frontend uses returned `secureUrl`.
     - Confirm PDFs/media load without Cloudinary 401.
   - Rename
     - `PATCH /api/cloudinary-files/:fileId/rename`
     - Expected: metadata + Cloudinary asset renamed; frontend reflects it.
   - Delete
     - `DELETE /api/cloudinary-files/:fileId`
     - Expected: metadata removed and Cloudinary asset destroyed.

## Cloudinary 401 for “View” (PDFs) — implemented safeguard
In `backend/src/routes/file.cloudinary.routes.js`, upload metadata stores:
- `secureUrl = result?.url || result?.secure_url`
This prevents missing/undefined URL fields from causing broken links that can manifest as 401/view failures.


## Notes on automated tests
This repo includes a plan in `TODO_test_plan.md`, but automated Jest/Supertest execution was not added yet.



