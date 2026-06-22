require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { connectMongo } = require('./utils/mongo');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandlers');

const authRoutes = require('./routes/auth.routes');
const fileRoutes = require('./routes/file.routes');
const cloudinaryRoutes = require('./routes/file.cloudinary.routes');
const cloudinaryMetaRoutes = require('./routes/file.cloudinary.meta.routes');
const cloudinaryUsageRoutes = require('./routes/cloudinaryUsage.routes');
const shareRoutes = require('./routes/share.routes');

const app = express();

app.use(helmet());
app.use(express.json({ limit: '2mb' }));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  })
);
app.use(morgan('dev'));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/cloudinary-files', cloudinaryRoutes);
app.use('/api/cloudinary-files', cloudinaryMetaRoutes);
app.use('/api/cloudinary-files', cloudinaryUsageRoutes);
app.use('/api/shares', shareRoutes);




app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

// Make sure we don't crash on unhandled promise rejections
process.on('unhandledRejection', (err) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled rejection', err);
});

connectMongo()
  .then(() => {
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Mongo connection failed', err);
    process.exit(1);
  });

