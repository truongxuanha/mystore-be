const bucket = require("../config/firebase/firebaseAdmin");

const uploadToFirebase = async (file, folderPath) => {
  if (!file) {
    throw new Error("No file uploaded.");
  }
  try {
    const filePath = `${folderPath}/${file.originalname}`;
    const blob = bucket.file(filePath);

    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype
      }
    });
    await new Promise((resolve, reject) => {
      blobStream.on("error", reject);
      blobStream.on("finish", resolve);
      blobStream.end(file.buffer);
    });

    const encodedBlobName = encodeURIComponent(blob.name);
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedBlobName}?alt=media`;

    return publicUrl;
  } catch (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }
};

module.exports = { uploadToFirebase };
