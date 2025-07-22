// backend/utils/multerConfig.js
import multer from 'multer';
import path from 'path'; // Untuk bekerja dengan path file

// Konfigurasi penyimpanan untuk Multer
const storage = multer.diskStorage({
  destination(req, file, cb) {
    // Pastikan folder 'uploads/' ada di root backend Anda.
    // Multer akan otomatis membuat folder jika belum ada (tergantung permissions).
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    // Membuat nama file unik: fieldname-timestamp.ext
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// Filter file untuk hanya menerima gambar (jpeg, jpg, png, gif)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const mimeType = allowedTypes.test(file.mimetype);
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimeType && extName) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar (JPEG, JPG, PNG, GIF) yang diizinkan!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Batas ukuran file 5MB (dalam bytes)
  },
});

export default upload;