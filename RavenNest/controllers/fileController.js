// controllers/fileController.js
const multer = require("multer");
const cloudinary = require('../config/cloudinary');
const fs = require("fs");
const path = require("path");

const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadedFilesPath = path.join(__dirname, "..", "uploadedFiles.json");

const saveFileInfo = (fileName, fileUrl) => {
  // Read the existing uploaded files data
  let uploadedFiles = [];
  if (fs.existsSync(uploadedFilesPath)) {
    const fileData = fs.readFileSync(uploadedFilesPath, "utf8");
    uploadedFiles = JSON.parse(fileData);
  }

  // Add the new file information
  uploadedFiles.push({ fileName, fileUrl });

  // Save the updated list to the file
  fs.writeFileSync(uploadedFilesPath, JSON.stringify(uploadedFiles, null, 2), "utf8");
};

const uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  try {
    const publicId = req.file.originalname;
    const uploadResult = await cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          console.error(error);
          return res.status(500).send("Error uploading to Cloudinary.");
        }

        // Save file info (name and URL) to a JSON file
        saveFileInfo(req.file.originalname, result.secure_url);

        res.send({
          message: 'File uploaded successfully!',
          url: result.secure_url
        });
      }
    );

    uploadResult.end(req.file.buffer);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error uploading to Cloudinary.");
  }
};

module.exports = { upload, uploadFile };
