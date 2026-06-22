# Viewing Fix Checklist (Cloudinary)

## Goal
Make sure uploaded files can be viewed inline via the frontend.

## Completed
- [x] Cloudinary upload sets `resource_type` based on mimetype (image/video/audio/upload for PDFs; else auto)
- [x] Frontend “View” uses contentType-based rendering: image/pdf link, video `<video>`, audio link, others download fallback

## Remaining for existing uploads
Older files uploaded before the fix may still have incompatible Cloudinary storage settings.

### Do next
1. Re-upload the failing PDFs/media after backend/frontend restart.
2. If re-upload also fails, inspect stored `secureUrl` and `contentType` in MongoDB for one failing file.
3. If `secureUrl` exists but browser still downloads instead of viewing, update Cloudinary options for rendering (e.g., force `format`, add `attachment:false` if applicable).

## Notes
- Existing Cloudinary assets keep their original resource_type.
- Updating upload logic only affects future uploads.

