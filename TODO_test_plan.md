# TODO - Project tests & runtime verification (Cloudinary-only)

## Backend (Node/Express)
- [ ] Install dev test deps (Jest + Supertest)
- [ ] Add endpoint tests:
  - [ ] `GET /health` returns `{ ok: true }`
  - [ ] `POST /api/auth/register` validates missing fields -> 400
  - [ ] `POST /api/auth/login` invalid creds -> 401
  - [ ] Auth middleware blocks missing token -> 401
- [ ] Add Cloudinary route tests with mocks:
  - [ ] `POST /api/cloudinary-files/upload` rejects missing `file` -> 400
  - [ ] Upload stores `secureUrl` as `result.url || result.secure_url`
  - [ ] `GET /api/cloudinary-files` requires auth
  - [ ] `DELETE /api/cloudinary-files/:fileId` only deletes owned file
  - [ ] `PATCH /api/cloudinary-files/:fileId/rename` only owned file

## Frontend (React)
- [ ] Manual smoke test checklist:
  - [ ] Login/Register works
  - [ ] Upload triggers network call `POST /api/cloudinary-files/upload`
  - [ ] List displays returned files array
  - [ ] View opens image/PDF correctly (no Cloudinary 401)
  - [ ] Delete removes item from list and requests backend delete endpoint

## Runtime checks (no mocks)
- [ ] Start backend and confirm `/health`
- [ ] Use a real PDF upload (end-to-end)
- [ ] Confirm rename changes filename in UI
- [ ] Confirm delete removes both metadata and Cloudinary asset

