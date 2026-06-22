import React, { useEffect, useMemo, useState } from 'react';
import { api } from './api/client';

// Helper to format bytes nicely
function prettyBytes(bytes) {
  if (!bytes && bytes !== 0) return '-';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let idx = 0;
  let val = bytes;
  while (val >= 1024 && idx < units.length - 1) {
    val /= 1024;
    idx += 1;
  }
  return `${val.toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`;
}

// Get file extension
function extOf(name = '') {
  const m = String(name).match(/\.([a-z0-9]+)$/i);
  return m ? m[1].toLowerCase() : '';
}

// Format date
function formatDate(d) {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '';
  }
}

// Inline SVGs for elegant visual presentation
const Icons = {
  Cloud: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.42 0-.83.08-1.21.23A7 7 0 0 0 2.5 13.5C2.5 16.5 5 19 8 19h9.5z"/>
    </svg>
  ),
  Folder: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  Search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon-svg">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Grid: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  List: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  ),
  Trash: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      <line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
    </svg>
  ),
  Rename: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>
  ),
  Share: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  ),
  Download: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  Close: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Upload: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
    </svg>
  ),
  Logout: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Eye: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  Copy: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  ),
  FileGeneric: () => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
    </svg>
  ),
  FilePdf: () => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
      <text x="6" y="17" fontSize="5" fontWeight="bold" fill="#ef4444" fontFamily="sans-serif">PDF</text>
    </svg>
  ),
  FileImage: () => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
      <circle cx="9" cy="13" r="1.5"/><polyline points="20 18 16 14 9 21"/>
    </svg>
  ),
  FileVideo: () => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
      <polygon points="9 11 15 14 9 17 9 11"/>
    </svg>
  ),
  FileAudio: () => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
      <path d="M9 18V9l6-2v9"/><circle cx="8" cy="18" r="2"/><circle cx="14" cy="16" r="2"/>
    </svg>
  )
};

// Render file type icon based on contentType / ext
function FileIcon({ contentType, filename }) {
  const ext = extOf(filename);
  if (contentType?.startsWith('image/')) return <Icons.FileImage />;
  if (contentType === 'application/pdf' || ext === 'pdf') return <Icons.FilePdf />;
  if (contentType?.startsWith('video/')) return <Icons.FileVideo />;
  if (contentType?.startsWith('audio/')) return <Icons.FileAudio />;
  return <Icons.FileGeneric />;
}

// Authentication registration & login component
function AuthCard({ onAuthed }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const payload = mode === 'login'
        ? await api.login(email, password)
        : await api.register(email, password);

      localStorage.setItem('token', payload.token);
      localStorage.setItem('userEmail', email);
      onAuthed();
    } catch (e) {
      setErr(e.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  }

  const isLogin = mode === 'login';

  return (
    <div className="auth-wrapper">
      <div className="auth-card animate-slide">
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', marginBottom: 12 }}>
            <div className="logo-icon">
              <Icons.Cloud />
            </div>
          </div>
          <h2 className="auth-title">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {isLogin ? 'Access your personal cloud drive securely' : 'Get started with 5GB of free storage'}
          </p>
        </div>

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="name@domain.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••••••"
              required
            />
          </div>

          {err ? (
            <div style={{ color: 'var(--danger)', fontSize: '0.8rem', fontWeight: '600', marginBottom: 16, marginTop: 4 }}>
              {err}
            </div>
          ) : null}

          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: 8 }}
            disabled={loading}
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Register Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span>{isLogin ? "Don't have an account? " : 'Already have an account? '}</span>
          <button
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer', outline: 'none' }}
            onClick={() => {
              setErr('');
              setMode(isLogin ? 'register' : 'login');
            }}
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Media viewing modal overlay
function MediaViewerModal({ file, onClose, onDownload }) {
  const isImage = file.contentType?.startsWith('image/');
  const isPdf = file.contentType === 'application/pdf' || extOf(file.originalName) === 'pdf';
  const isVideo = file.contentType?.startsWith('video/');
  const isAudio = file.contentType?.startsWith('audio/');

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileIcon contentType={file.contentType} filename={file.originalName} />
            <div>
              <h3 className="modal-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '350px' }}>
                {file.originalName}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{prettyBytes(file.sizeBytes)} • {file.contentType}</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <Icons.Close />
          </button>
        </div>

        <div className="modal-body" style={{ background: '#070a14' }}>
          {isImage && (
            <div className="image-viewer-container">
              <img src={file.secureUrl} className="image-viewer-img" alt={file.originalName} />
            </div>
          )}

          {isPdf && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  If the PDF does not display inline below, it can be viewed directly in a browser tab:
                </span>
                <a href={file.secureUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', textDecoration: 'none' }}>
                  Open PDF in New Tab
                </a>
              </div>
              <iframe
                src={file.secureUrl}
                className="pdf-viewer-iframe"
                title={file.originalName}
                style={{ flex: 1, minHeight: '55vh', width: '100%', border: 'none' }}
              />
            </div>
          )}

          {isVideo && (
            <div className="video-viewer-container">
              <video src={file.secureUrl} className="video-element" controls autoPlay />
            </div>
          )}

          {isAudio && (
            <div className="audio-player-card">
              <div style={{ color: 'var(--primary)', marginBottom: 12 }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 18V9l12-2v9"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                </svg>
              </div>
              <p style={{ fontWeight: '700', fontSize: '0.9rem', color: 'white' }}>{file.originalName}</p>
              <audio src={file.secureUrl} className="audio-element" controls autoPlay />
            </div>
          )}

          {!isImage && !isPdf && !isVideo && !isAudio && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
                <Icons.FileGeneric />
              </div>
              <p style={{ fontWeight: '700', marginBottom: 6 }}>No inline viewer available</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 20 }}>
                This file format ({extOf(file.originalName).toUpperCase()}) cannot be rendered directly in the dashboard.
              </p>
              <button className="btn btn-primary" onClick={() => onDownload(file._id, file.originalName)}>
                <Icons.Download /> Download File
              </button>
            </div>
          )}
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={() => onDownload(file._id, file.originalName)}>
            <Icons.Download /> Download
          </button>
        </div>
      </div>
    </div>
  );
}

// Sharing overlay modal
function ShareModal({ file, onClose, showToast }) {
  const [loading, setLoading] = useState(false);
  const [share, setShare] = useState(null);

  const shareUrl = useMemo(() => {
    if (!share) return '';
    return `${window.location.origin}/?share=${share.shareKey}`;
  }, [share]);

  // Load existing shares on mount
  useEffect(() => {
    async function loadShare() {
      setLoading(true);
      try {
        const data = await api.getSharesForFile(file._id);
        if (data && data.share) {
          setShare(data.share);
        }
      } catch {
        // no share exists yet
      } finally {
        setLoading(false);
      }
    }
    loadShare();
  }, [file._id]);

  async function generateShare() {
    setLoading(true);
    try {
      const data = await api.createShare(file._id);
      if (data && data.share) {
        setShare(data.share);
        showToast('Public sharing link generated!');
      }
    } catch (err) {
      showToast(err.message || 'Failed to create share link', 'danger');
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard() {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    showToast('Copied share link to clipboard!');
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Share "{file.originalName}"</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <Icons.Close />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>
            Generate a secure, public share link. Anyone with this link can view and download this file without requiring an account.
          </p>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
              Loading share details...
            </div>
          ) : share ? (
            <div>
              <label className="form-label">Shared Link</label>
              <div className="share-link-box">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="share-link-input"
                  onClick={(e) => e.target.select()}
                />
                <button
                  className="btn btn-secondary"
                  style={{ padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}
                  onClick={copyToClipboard}
                  title="Copy link"
                >
                  <Icons.Copy /> Copy
                </button>
              </div>

              <div style={{ marginTop: 16, fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Views: <b>{share.views || 0}</b></span>
                <span>Created: {new Date(share.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <button className="btn btn-primary" onClick={generateShare}>
                <Icons.Share /> Generate Public Share Link
              </button>
            </div>
          )}
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// Dedicated public download page
function PublicShareView({ shareKey, setShareKey }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);

  useEffect(() => {
    async function loadSharedFile() {
      try {
        const data = await api.getShare(shareKey);
        setFile(data);
      } catch (err) {
        setError(err.message || 'This sharing link is invalid or has expired.');
      } finally {
        setLoading(false);
      }
    }
    loadSharedFile();
  }, [shareKey]);

  if (loading) {
    return (
      <div className="public-share-bg">
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ animation: 'pulse 1.5s infinite', display: 'inline-flex', marginBottom: 16 }}>
            <Icons.Cloud />
          </div>
          <p style={{ fontWeight: '600' }}>Retrieving shared file details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="public-share-bg">
        <div className="public-share-card">
          <div style={{ color: 'var(--danger)', marginBottom: 16 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: 8 }}>Unable to access file</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 24 }}>{error}</p>
          <button className="btn btn-primary" onClick={() => {
            window.history.replaceState(null, '', window.location.origin);
            setShareKey('');
          }}>
            Go to Portal
          </button>
        </div>
      </div>
    );
  }

  const isImage = file.contentType?.startsWith('image/');
  const isVideo = file.contentType?.startsWith('video/');
  const isAudio = file.contentType?.startsWith('audio/');
  const isPdf = file.contentType === 'application/pdf' || extOf(file.originalName) === 'pdf';

  return (
    <div className="public-share-bg">
      <div className="public-share-card animate-slide" style={{ maxWidth: isPdf ? '800px' : '520px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div className="logo-icon">
            <Icons.Cloud />
          </div>
        </div>
        <h2 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {file.originalName}
        </h2>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 24 }}>
          Shared File • {prettyBytes(file.sizeBytes)} • {file.contentType}
        </p>

        <div className="public-preview-box" style={{ background: '#060913', minHeight: isPdf ? '450px' : '150px' }}>
          {isImage && (
            <img src={file.secureUrl} style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: 'var(--radius-sm)' }} alt={file.originalName} />
          )}

          {isPdf && (
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  If the PDF does not load below, click to view:
                </span>
                <a href={file.secureUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', textDecoration: 'none' }}>
                  Open PDF in New Tab
                </a>
              </div>
              <iframe src={file.secureUrl} style={{ width: '100%', height: '400px', border: 'none', borderRadius: 'var(--radius-sm)' }} title={file.originalName} />
            </div>
          )}

          {isVideo && (
            <video src={file.secureUrl} style={{ width: '100%', maxHeight: '300px', borderRadius: 'var(--radius-sm)' }} controls />
          )}

          {isAudio && (
            <audio src={file.secureUrl} style={{ width: '100%' }} controls />
          )}

          {!isImage && !isPdf && !isVideo && !isAudio && (
            <div>
              <FileIcon contentType={file.contentType} filename={file.originalName} />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 12 }}>No preview available for this format</p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => {
            window.history.replaceState(null, '', window.location.origin);
            setShareKey('');
          }}>
            Go to Portal
          </button>
          <a href={`${api.baseURL || 'http://localhost:5000/api'}/shares/${shareKey}/download`} className="btn btn-primary" download={file.originalName}>
            <Icons.Download /> Download File
          </a>
        </div>

        <div style={{ marginTop: 24, borderTop: '1px solid var(--border-color)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>Views: <b>{file.views || 0}</b></span>
          <span>Uploaded: {formatDate(file.uploadedAt)}</span>
        </div>
      </div>
    </div>
  );
}

// Dashboard component containing main logic
function Dashboard() {
  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  // UI States
  const [viewMode, setViewMode] = useState('grid'); // grid | list
  const [activeCategory, setActiveCategory] = useState('all'); // all | image | pdf | video | audio | document | other
  const [selectedFileViewer, setSelectedFileViewer] = useState(null);
  const [selectedFileShare, setSelectedFileShare] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [renamingFileId, setRenamingFileId] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  // Advanced Filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest | oldest | size_desc | size_asc
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minSizeMb, setMinSizeMb] = useState('');

  // Drag and Drop & Multiple Upload Queue
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadQueue, setUploadQueue] = useState([]); // { id, file, name, size, progress, status, error }

  const userEmail = useMemo(() => localStorage.getItem('userEmail') || 'User', []);

  // Show Toast
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Refresh files list and stats
  async function refresh() {
    setErr('');
    try {
      const data = await api.listFiles();
      setFiles(data.files || []);

      // best-effort stats
      try {
        const s = await api.stats();
        setStats(s);
      } catch {
        // ignore
      }

      // best-effort usage
      try {
        const u = await api.usage();
        setStats((prev) => ({ ...(prev || {}), ...u }));
      } catch {
        // ignore
      }
    } catch (e) {
      setErr(e.message || 'Failed to refresh workspace details.');
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Trigger individual file upload
  async function startUploadQueue(itemsToUpload) {
    const pendings = itemsToUpload.filter((x) => x.status === 'pending');
    if (pendings.length === 0) return;

    setLoading(true);

    const promises = pendings.map(async (item) => {
      // update item status to uploading
      setUploadQueue((prev) =>
        prev.map((x) => (x.id === item.id ? { ...x, status: 'uploading' } : x))
      );

      try {
        await api.uploadFile(item.file, {
          onProgress: (pct) => {
            setUploadQueue((prev) =>
              prev.map((x) => (x.id === item.id ? { ...x, progress: pct } : x))
            );
          }
        });

        // completed
        setUploadQueue((prev) =>
          prev.map((x) => (x.id === item.id ? { ...x, status: 'completed', progress: 100 } : x))
        );
      } catch (e) {
        const msg = e?.message || 'Upload failed';
        setUploadQueue((prev) =>
          prev.map((x) => (x.id === item.id ? { ...x, status: 'failed', error: msg } : x))
        );
      }
    });

    await Promise.all(promises);
    setLoading(false);
    refresh();
  }

  // Handle files selection
  const handleFilesSelected = (selectedList) => {
    if (!selectedList || selectedList.length === 0) return;

    // Filter out duplicates if already uploading in the current queue
    const filteredList = Array.from(selectedList).filter(file => {
      return !uploadQueue.some(
        x => x.name === file.name && x.size === file.size && (x.status === 'uploading' || x.status === 'pending')
      );
    });

    if (filteredList.length === 0) return;

    const newItems = filteredList.map((file) => ({
      id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'pending',
      error: ''
    }));

    // Reset input value so selecting the same file again behaves properly
    const fileInput = document.getElementById('file-upload-input');
    if (fileInput) fileInput.value = '';

    // Update queue state purely (no side effects in callback)
    setUploadQueue((prev) => [...prev, ...newItems]);

    // Automatically trigger upload on new items only
    startUploadQueue(newItems);
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  // Action methods
  async function del(fileId, filename) {
    if (confirmDeleteId !== fileId) {
      setConfirmDeleteId(fileId);
      // Auto reset confirmation state after 4 seconds
      setTimeout(() => {
        setConfirmDeleteId((prev) => (prev === fileId ? null : prev));
      }, 4000);
      return;
    }

    setConfirmDeleteId(null);
    setLoading(true);
    try {
      await api.deleteFile(fileId);
      showToast('File deleted successfully');
      await refresh();
    } catch (e) {
      showToast(e.message || 'Delete failed', 'danger');
    } finally {
      setLoading(false);
    }
  }

  function startRename(fileId, currentName) {
    setRenamingFileId(fileId);
    setRenameValue(currentName);
  }

  async function submitRename(fileId) {
    if (!renameValue || renameValue.trim() === '') return;
    const newName = renameValue.trim();

    setRenamingFileId(null);
    setLoading(true);
    try {
      await api.renameFile(fileId, newName);
      showToast('File renamed successfully');
      await refresh();
    } catch (e) {
      showToast(e.message || 'Rename failed', 'danger');
    } finally {
      setLoading(false);
    }
  }

  async function downloadFile(fileId, originalName) {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const downloadUrl = `${api.baseURL || 'http://localhost:5000/api'}/cloudinary-files/download/${fileId}?token=${token}`;
      
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = originalName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast('Download started');
    } catch (e) {
      showToast(e.message || 'Download failed', 'danger');
    } finally {
      setLoading(false);
    }
  }

  // Clear completed uploads from queue
  const clearCompletedUploads = () => {
    setUploadQueue((prev) => prev.filter((x) => x.status !== 'completed' && x.status !== 'failed'));
  };

  // Filter & sort files on the client side
  const filteredFiles = useMemo(() => {
    return files
      .filter((f) => {
        // Search by query
        const q = query.trim().toLowerCase();
        if (q) {
          const name = String(f.originalName || '').toLowerCase();
          const ext = extOf(f.originalName).toLowerCase();
          const type = String(f.contentType || '').toLowerCase();
          if (!name.includes(q) && !ext.includes(q) && !type.includes(q)) return false;
        }

        // Sidebar category mapping
        if (activeCategory !== 'all') {
          const ext = extOf(f.originalName);
          const ct = String(f.contentType || '');
          const bucket = (() => {
            if (ct.startsWith('image/')) return 'image';
            if (ct.startsWith('video/')) return 'video';
            if (ct.startsWith('audio/')) return 'audio';
            if (ct === 'application/pdf' || ext === 'pdf') return 'pdf';
            if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'rtf'].includes(ext) || ct.startsWith('text/')) return 'document';
            return 'other';
          })();
          if (bucket !== activeCategory) return false;
        }

        // Date from constraints
        const uploadedAt = f.uploadedAt ? new Date(f.uploadedAt).getTime() : 0;
        if (dateFrom) {
          const from = new Date(dateFrom).getTime();
          if (uploadedAt < from) return false;
        }

        // Date to constraints
        if (dateTo) {
          const to = new Date(dateTo).getTime() + 24 * 60 * 60 * 1000; // end of dateTo day
          if (uploadedAt >= to) return false;
        }

        // Size constraint
        if (minSizeMb) {
          const minBytes = Number(minSizeMb) * 1024 * 1024;
          if (!Number.isNaN(minBytes) && f.sizeBytes < minBytes) return false;
        }

        return true;
      })
      .slice()
      .sort((a, b) => {
        if (sortBy === 'oldest') return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
        if (sortBy === 'size_desc') return (b.sizeBytes || 0) - (a.sizeBytes || 0);
        if (sortBy === 'size_asc') return (a.sizeBytes || 0) - (b.sizeBytes || 0);
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      });
  }, [files, query, activeCategory, dateFrom, dateTo, minSizeMb, sortBy]);

  // Compute stats details
  const storageUsed = stats?.totalBytes ?? files.reduce((acc, f) => acc + (f.sizeBytes || 0), 0);
  const storageLimit = stats?.storageLimitBytes || 5 * 1024 * 1024 * 1024; // fallback 5GB
  const storagePercentage = Math.min(100, Math.round((storageUsed / storageLimit) * 100));

  return (
    <div className="app-container">
      {/* Toast feedback */}
      {toast && (
        <div className="toast-msg" style={{ borderLeft: `4px solid ${toast.type === 'danger' ? 'var(--danger)' : 'var(--success)'}` }}>
          {toast.message}
        </div>
      )}

      {/* Sidebar Panel */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Icons.Cloud />
          </div>
          <span className="logo-text">PersonalDrive</span>
        </div>

        <nav className="sidebar-nav">
          <button className={`nav-item ${activeCategory === 'all' ? 'active' : ''}`} onClick={() => setActiveCategory('all')}>
            <Icons.Folder /> All Files
          </button>
          <button className={`nav-item ${activeCategory === 'image' ? 'active' : ''}`} onClick={() => setActiveCategory('image')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg> Images
          </button>
          <button className={`nav-item ${activeCategory === 'pdf' ? 'active' : ''}`} onClick={() => setActiveCategory('pdf')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg> PDFs
          </button>
          <button className={`nav-item ${activeCategory === 'video' ? 'active' : ''}`} onClick={() => setActiveCategory('video')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg> Videos
          </button>
          <button className={`nav-item ${activeCategory === 'audio' ? 'active' : ''}`} onClick={() => setActiveCategory('audio')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            </svg> Audio
          </button>
          <button className={`nav-item ${activeCategory === 'document' ? 'active' : ''}`} onClick={() => setActiveCategory('document')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg> Documents
          </button>
        </nav>

        <div className="sidebar-stats">
          <div className="quota-container">
            <div className="quota-header">
              <span>Storage Used</span>
              <span>{storagePercentage}%</span>
            </div>
            <div className="quota-bar-bg">
              <div className="quota-bar-fill" style={{ width: `${storagePercentage}%` }} />
            </div>
            <div className="quota-footer">
              <span>{prettyBytes(storageUsed)} of {prettyBytes(storageLimit)}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="main-content animate-fade">
        {/* Top Header */}
        <header className="top-header">
          <div className="search-container">
            <Icons.Search />
            <input
              type="text"
              placeholder="Search by name, extension or type..."
              className="search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="user-profile">
            <span className="user-email">{userEmail}</span>
            <button
              className="btn btn-secondary"
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              style={{ padding: '8px 12px' }}
            >
              <Icons.Logout /> Log out
            </button>
          </div>
        </header>

        {/* Stats Grid Dashboard */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <span>Total Uploads</span>
            </div>
            <div className="stat-value">{stats?.totalFiles ?? files.length}</div>
            <div className="stat-desc">Sync completed to Cloudinary</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span>Cloud Storage Used</span>
            </div>
            <div className="stat-value">{prettyBytes(storageUsed)}</div>
            <div className="stat-desc">Representing {storagePercentage}% quota load</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span>Security Status</span>
            </div>
            <div className="stat-value" style={{ color: 'var(--success)' }}>AES-JWT</div>
            <div className="stat-desc">Transfers secured with TLS</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span>System Status</span>
            </div>
            <div className="stat-value" style={{ color: loading ? 'var(--warning)' : 'var(--success)' }}>
              {loading ? 'Working...' : 'Active'}
            </div>
            <div className="stat-desc">{loading ? 'Processing network requests' : 'Ready for upload/view'}</div>
          </div>
        </section>

        {/* Drag & Drop Upload Zone */}
        <input
          id="file-upload-input"
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => handleFilesSelected(e.target.files)}
        />
        <section
          className={`dropzone ${isDragActive ? 'active-drag' : ''}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload-input').click()}
        >
          <div className="dropzone-icon">
            <Icons.Upload />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: 6 }}>
            Drag & drop files here, or click to upload
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Supports PDF, images, video, audio, or zip archives up to 100MB
          </p>
        </section>

        {/* Uploading Progress drawer */}
        {uploadQueue.length > 0 && (
          <section className="upload-queue-container animate-slide">
            <div className="upload-queue-header">
              <h4 style={{ fontWeight: '800', fontSize: '0.9rem' }}>Uploading Queue ({uploadQueue.length})</h4>
              <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={clearCompletedUploads}>
                Clear Finished
              </button>
            </div>
            <div className="upload-queue-list">
              {uploadQueue.map((item) => (
                <div key={item.id} className="upload-queue-item">
                  <div className="upload-item-info">
                    <div className="upload-item-name">{item.name}</div>
                    <div className="upload-item-meta">
                      <span>{prettyBytes(item.size)}</span>
                      <span>
                        {item.status === 'pending' && 'Waiting...'}
                        {item.status === 'uploading' && `Uploading... ${item.progress}%`}
                        {item.status === 'completed' && <span style={{ color: 'var(--success)' }}>Completed</span>}
                        {item.status === 'failed' && <span style={{ color: 'var(--danger)' }}>Failed: {item.error}</span>}
                      </span>
                    </div>
                    {item.status === 'uploading' && (
                      <div className="upload-item-progress-bg">
                        <div className="upload-item-progress-fill" style={{ width: `${item.progress}%` }} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Workspace Files Panel */}
        <section style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          {/* Controls bar */}
          <div className="controls-bar">
            <div className="filters-group">
              <span style={{ fontSize: '0.8rem', fontWeight: '700', marginRight: 8, color: 'var(--text-muted)' }}>VIEWING:</span>
              <button className={`filter-badge ${activeCategory === 'all' ? 'active' : ''}`} onClick={() => setActiveCategory('all')}>All</button>
              <button className={`filter-badge ${activeCategory === 'image' ? 'active' : ''}`} onClick={() => setActiveCategory('image')}>Images</button>
              <button className={`filter-badge ${activeCategory === 'pdf' ? 'active' : ''}`} onClick={() => setActiveCategory('pdf')}>PDFs</button>
              <button className={`filter-badge ${activeCategory === 'video' ? 'active' : ''}`} onClick={() => setActiveCategory('video')}>Videos</button>
              <button className={`filter-badge ${activeCategory === 'audio' ? 'active' : ''}`} onClick={() => setActiveCategory('audio')}>Audio</button>
              <button className={`filter-badge ${activeCategory === 'document' ? 'active' : ''}`} onClick={() => setActiveCategory('document')}>Docs</button>
            </div>

            <div className="view-controls">
              <button
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                Filters {showAdvancedFilters ? '▲' : '▼'}
              </button>

              <div style={{ height: 20, width: 1, background: 'var(--border-color)', margin: '0 8px' }} />

              <button
                className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid mode"
              >
                <Icons.Grid />
              </button>
              <button
                className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List mode"
              >
                <Icons.List />
              </button>
            </div>
          </div>

          {/* Advanced filters collapsible block */}
          {showAdvancedFilters && (
            <div className="adv-filters-panel animate-fade">
              <div className="adv-filter-field">
                <span className="adv-filter-label">Sort Order</span>
                <select className="select-filter" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="size_desc">Size (High → Low)</option>
                  <option value="size_asc">Size (Low → High)</option>
                </select>
              </div>

              <div className="adv-filter-field">
                <span className="adv-filter-label">Date From</span>
                <input type="date" className="adv-filter-input" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>

              <div className="adv-filter-field">
                <span className="adv-filter-label">Date To</span>
                <input type="date" className="adv-filter-input" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>

              <div className="adv-filter-field">
                <span className="adv-filter-label">Min Size (MB)</span>
                <input type="number" className="adv-filter-input" placeholder="e.g. 5" value={minSizeMb} onChange={(e) => setMinSizeMb(e.target.value)} />
              </div>

              <div className="adv-filter-field" style={{ justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '8px 12px' }}
                  onClick={() => {
                    setQuery('');
                    setSortBy('newest');
                    setDateFrom('');
                    setDateTo('');
                    setMinSizeMb('');
                  }}
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}

          {/* Files presentation container */}
          {filteredFiles.length === 0 ? (
            <div className="empty-state animate-fade">
              <div style={{ color: 'var(--text-dim)', marginBottom: 12 }}>
                <Icons.Folder />
              </div>
              <p style={{ fontWeight: '700', marginBottom: 4 }}>No files found</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {files.length === 0
                  ? 'Drag and drop a file into this portal to begin your secure cloud storage.'
                  : 'No files match your search criteria. Clear some filters.'}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            /* GRID VIEW LAYOUT */
            <div className="file-grid animate-fade">
              {filteredFiles.map((f) => {
                const isImg = f.contentType?.startsWith('image/');
                return (
                  <div key={f._id} className="file-card">
                    <div className="file-card-preview" onClick={() => setSelectedFileViewer(f)} style={{ cursor: 'pointer' }}>
                      {isImg ? (
                        <img src={f.secureUrl} className="file-card-image" alt={f.originalName} loading="lazy" />
                      ) : (
                        <div className="file-card-icon">
                          <FileIcon contentType={f.contentType} filename={f.originalName} />
                        </div>
                      )}
                    </div>

                    {renamingFileId === f._id ? (
                      <div style={{ display: 'flex', gap: 6, margin: '4px 0' }} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          className="adv-filter-input"
                          style={{ flex: 1, padding: '4px 8px', fontSize: '0.8rem', color: 'white' }}
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') submitRename(f._id);
                            if (e.key === 'Escape') setRenamingFileId(null);
                          }}
                          autoFocus
                        />
                        <button
                          className="btn btn-secondary"
                          style={{ padding: 4, width: 26, height: 26, borderRadius: 'var(--radius-sm)' }}
                          onClick={() => submitRename(f._id)}
                          title="Save"
                        >
                          ✓
                        </button>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: 4, width: 26, height: 26, borderRadius: 'var(--radius-sm)' }}
                          onClick={() => setRenamingFileId(null)}
                          title="Cancel"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="file-card-name" title={f.originalName}>
                        {f.originalName}
                      </div>
                    )}

                    <div className="file-card-meta">
                      <span>{prettyBytes(f.sizeBytes)}</span>
                      <span>{new Date(f.uploadedAt).toLocaleDateString()}</span>
                    </div>

                    {/* Aligned Spacious Buttons prevents merging */}
                    <div className="card-actions-wrapper">
                      <button className="card-action-btn" title="View File" onClick={() => setSelectedFileViewer(f)}>
                        <Icons.Eye />
                      </button>
                      <button className="card-action-btn" title="Generate Share link" onClick={() => setSelectedFileShare(f)}>
                        <Icons.Share />
                      </button>
                      <button
                        className="card-action-btn"
                        onClick={() => downloadFile(f._id, f.originalName)}
                        title="Download"
                      >
                        <Icons.Download />
                      </button>
                      <button className="card-action-btn" title="Rename" onClick={() => startRename(f._id, f.originalName)}>
                        <Icons.Rename />
                      </button>
                      <button
                        className={`card-action-btn delete ${confirmDeleteId === f._id ? 'confirming' : ''}`}
                        title={confirmDeleteId === f._id ? "Click again to confirm delete" : "Delete File"}
                        onClick={() => del(f._id, f.originalName)}
                      >
                        {confirmDeleteId === f._id ? 'Confirm?' : <Icons.Trash />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* LIST VIEW LAYOUT (TABLE) */
            <div className="table-wrapper animate-fade">
              <table className="files-table">
                <thead>
                  <tr>
                    <th>Filename</th>
                    <th>Size</th>
                    <th>Date Uploaded</th>
                    <th>Content Type</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFiles.map((f) => (
                    <tr key={f._id}>
                      <td>
                        <div className="table-file-info">
                          <FileIcon contentType={f.contentType} filename={f.originalName} />
                          {renamingFileId === f._id ? (
                            <div style={{ display: 'flex', gap: 6, width: '100%' }} onClick={(e) => e.stopPropagation()}>
                              <input
                                type="text"
                                className="adv-filter-input"
                                style={{ flex: 1, padding: '4px 8px', fontSize: '0.8rem', color: 'white' }}
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') submitRename(f._id);
                                  if (e.key === 'Escape') setRenamingFileId(null);
                                }}
                                autoFocus
                              />
                              <button
                                className="btn btn-secondary"
                                style={{ padding: 4, width: 26, height: 26 }}
                                onClick={() => submitRename(f._id)}
                                title="Save"
                              >
                                ✓
                              </button>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: 4, width: 26, height: 26 }}
                                onClick={() => setRenamingFileId(null)}
                                title="Cancel"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <span className="table-file-name" title={f.originalName} style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {f.originalName}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>{prettyBytes(f.sizeBytes)}</td>
                      <td>{formatDate(f.uploadedAt)}</td>
                      <td>
                        <span className="badge badge-info">{f.contentType || 'unknown'}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button className="card-action-btn" style={{ flex: 'none' }} title="View File" onClick={() => setSelectedFileViewer(f)}>
                            <Icons.Eye /> View
                          </button>
                          <button className="card-action-btn" style={{ flex: 'none' }} title="Share" onClick={() => setSelectedFileShare(f)}>
                            <Icons.Share /> Share
                          </button>
                           <button
                             className="card-action-btn"
                             style={{ flex: 'none' }}
                             onClick={() => downloadFile(f._id, f.originalName)}
                             title="Download"
                           >
                             <Icons.Download /> Download
                           </button>
                          <button className="card-action-btn" style={{ flex: 'none' }} title="Rename" onClick={() => startRename(f._id, f.originalName)}>
                            <Icons.Rename /> Rename
                          </button>
                           <button
                             className={`card-action-btn delete ${confirmDeleteId === f._id ? 'confirming' : ''}`}
                             style={{ flex: 'none' }}
                             title={confirmDeleteId === f._id ? "Click again to confirm delete" : "Delete"}
                             onClick={() => del(f._id, f.originalName)}
                           >
                             {confirmDeleteId === f._id ? 'Confirm?' : <><Icons.Trash /> Delete</>}
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Modal Viewers */}
      {selectedFileViewer && (
        <MediaViewerModal file={selectedFileViewer} onClose={() => setSelectedFileViewer(null)} onDownload={downloadFile} />
      )}

      {selectedFileShare && (
        <ShareModal file={selectedFileShare} showToast={showToast} onClose={() => setSelectedFileShare(null)} />
      )}
    </div>
  );
}

// Master component directing routing
export default function App() {
  const [authed, setAuthed] = useState(() => !!localStorage.getItem('token'));
  
  // Public sharing state
  const [shareKey, setShareKey] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('share') || '';
  });

  useEffect(() => {
    const onStorage = () => setAuthed(!!localStorage.getItem('token'));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Handle URL changes to capture share keys dynamically
  useEffect(() => {
    const handleLocationChange = () => {
      const params = new URLSearchParams(window.location.search);
      setShareKey(params.get('share') || '');
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  if (shareKey) {
    return <PublicShareView shareKey={shareKey} setShareKey={setShareKey} />;
  }

  if (!authed) {
    return <AuthCard onAuthed={() => setAuthed(true)} />;
  }

  return <Dashboard />;
}
