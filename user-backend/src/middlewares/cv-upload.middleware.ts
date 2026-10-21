import multer from 'multer';

export const cvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB to prevent memory/database bloat DoS
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/pdf', 'text/plain'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and TXT files are allowed!') as any, false);
    }
  }
});
