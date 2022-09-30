const cloudinary = require("cloudinary").v2
const { CloudinaryStorage } = require("multer-storage-cloudinary")

const cloudStorage = (folder_name) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })

  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folder_name,
    },
  })

  return storage
}

module.exports = cloudStorage
