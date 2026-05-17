import s3 from '@app/lib/s3';
import multerBase from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import crypto from 'crypto';

const avatarMulter = multerBase({
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/jpg'
    ];

    cb(null, allowed.includes(file.mimetype));
  },

  storage: multerS3({
    s3,
    acl: "public-read",
    contentDisposition: "inline",
    bucket: process.env.S3_BUCKET!,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const ext = path.extname(file.originalname).slice(1);
      const uuid = crypto.randomUUID();

      cb(null, `avatars/${uuid}.${ext}`)
    },
  })
})

export default avatarMulter;
