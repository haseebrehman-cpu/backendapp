import multer from 'multer';

import { CloudinaryStorage } from 'multer-storage-cloudinary';

import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profile-pictures',
    allowed_formats: ['jpg', 'jpeg', 'png', 'avif'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  }
})

export const upload = multer({ storage: storage });
