const API_BASE = import.meta.env.VITE_API_BASE_URL;

function authHeaders() {
  const token = localStorage.getItem('token');
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders()
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!res.ok) {
    let msg = 'Request failed';
    try {
      const data = await res.json();
      msg = data?.message || msg;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  return res.json();
}

export const api = {
  baseURL: API_BASE,
  register: (email, password) => request('/auth/register', { method: 'POST', body: { email, password } }),
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  listFiles: () => request('/cloudinary-files', { method: 'GET' }),



  uploadFile: async (file, { onProgress } = {}) => {
    const token = localStorage.getItem('token');
    const form = new FormData();
    form.append('file', file);

    // Use XHR to expose client-side upload progress.
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE}/cloudinary-files/upload`);


      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      xhr.upload.onprogress = (evt) => {
        if (!onProgress) return;
        if (!evt.lengthComputable) return;
        const percent = Math.round((evt.loaded / evt.total) * 100);
        onProgress(percent);
      };

      xhr.onload = () => {
        const isOk = xhr.status >= 200 && xhr.status < 300;
        if (!isOk) {
          let msg = 'Upload failed';
          try {
            const data = JSON.parse(xhr.responseText);
            msg = data?.message || msg;
          } catch {
            // ignore
          }
          return reject(new Error(msg));
        }

        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          resolve({});
        }
      };

      xhr.onerror = () => reject(new Error('Upload failed'));

      xhr.send(form);
    });
  },
  deleteFile: (fileId) => request(`/cloudinary-files/${fileId}`, { method: 'DELETE' }),
  renameFile: (fileId, originalName) => request(`/cloudinary-files/${fileId}/rename`, { method: 'PATCH', body: { originalName } }),
  stats: () => request('/cloudinary-files/stats', { method: 'GET' }),
  usage: () => request('/cloudinary-files/usage', { method: 'GET' }),
  createShare: (fileId) => request('/shares/create', { method: 'POST', body: { fileId } }),
  getShare: (shareKey) => request(`/shares/${shareKey}`, { method: 'GET' }),
  getSharesForFile: (fileId) => request(`/shares/file/${fileId}`, { method: 'GET' })



};







