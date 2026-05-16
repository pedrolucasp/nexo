import s3 from '@app/lib/s3';
import multerBase from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import crypto from 'crypto';

const avatarMulter = multerBase({
  storage: multerS3({
    s3,
    acl: "public-read",
    bucket: process.env.S3_BUCKET!,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const ext = path.extname(file.originalname).slice(1);
      const uuid = crypto.randomUUID();

      cb(null, `avatars/${uuid}.${ext}`)
    }
  })
})

export default avatarMulter;
