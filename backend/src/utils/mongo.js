const mongoose = require('mongoose');

async function connectMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is missing');

  mongoose.set('strictQuery', true);

  // Atlas connection strings are typically TLS-enabled.
  // Some environments may require retry/handshake options.
  await mongoose.connect(uri, {
    // Keep defaults unless overridden by the URI.
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000
  });

  return mongoose.connection;
}

module.exports = { connectMongo };

