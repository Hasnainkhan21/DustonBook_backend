const multer = require("multer");
const  CloudinaryStorage  = require("multer-storage-cloudinary");
const cloudinary = require("../Configurations/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "book_covers",
    allowed_formats: ["jpg", "png", "jpeg"],
    transformation: [{ width: 500, height: 750, crop: "limit" }],
  },
});

const upload = multer({ storage });

module.exports = upload;
