require('dotenv').config();
const { connectMongo } = require('./utils/mongo');
const FileModel = require('./models/File.model');

async function checkFiles() {
  try {
    await connectMongo();
    console.log('Connected to MongoDB.');

    const files = await FileModel.find({}).sort({ uploadedAt: -1 }).limit(10);
    console.log('Recent uploaded files metadata:');
    files.forEach(f => {
      console.log(`- Name: ${f.originalName}`);
      console.log(`  ID: ${f._id}`);
      console.log(`  Url: ${f.secureUrl}`);
      console.log(`  ResourceType: ${f.resourceType}`);
      console.log(`  ContentType: ${f.contentType}`);
      console.log(`  Size: ${prettyBytes(f.sizeBytes)}`);
      console.log('----------------------------------------');
    });

    process.exit(0);
  } catch (err) {
    console.error('Error fetching files:', err);
    process.exit(1);
  }
}

function prettyBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let idx = 0;
  let val = bytes;
  while (val >= 1024 && idx < units.length - 1) {
    val /= 1024;
    idx += 1;
  }
  return `${val.toFixed(1)} ${units[idx]}`;
}

checkFiles();
