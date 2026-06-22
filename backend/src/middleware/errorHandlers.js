function notFoundHandler(req, res) {
  return res.status(404).json({ message: 'Not found' });
}

function errorHandler(err, req, res, _next) {
  // eslint-disable-next-line no-console
  console.error(err);

  const status = err.statusCode || 500;

  // In development, return the underlying message to help debug (Cloudinary/Mongo issues).
  const isDev = (process.env.NODE_ENV || 'development') === 'development';
  const message = err.expose ? err.message : isDev ? (err.message || 'Internal Server Error') : 'Internal Server Error';

  return res.status(status).json({ message });
}


module.exports = { notFoundHandler, errorHandler };

