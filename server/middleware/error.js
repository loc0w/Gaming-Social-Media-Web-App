// middleware/error.js
const multer = require('multer');

const errorHandler = (err, req, res, next next) => {
  console.error('Hata detayı:', {
    name: err.name,
    message: err.message,
    code: err.code,
    stack: err.stack
  });

  // Multer hataları
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({ 
          message: 'Dosya boyutu çok büyük (maksimum 5MB)'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({ 
          message: 'Beklenmeyen dosya alanı'
        });
      default:
        return res.status(400).json({ 
          message: 'Dosya yükleme hatası'
        });
    }
  }

  // Mongoose validasyon hataları
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      message: Object.values(err.errors).map(e => e.message).join(', '),
      type: 'ValidationError',
      errors: err.errors
    });
  }

  // Mongoose cast hataları (geçersiz ID vb.)
  if (err.name === 'CastError') {
    return res.status(400).json({ 
      message: 'Geçersiz ID formatı',
      type: 'CastError',
      value: err.value
    });
  }

  // Mongoose benzersizlik hataları
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ 
      message: `Bu ${field} zaten kullanımda`,
      type: 'DuplicateError',
      field: field
    });
  }

  // Dosya sistemi hataları
  if (err.code === 'ENOENT') {
    return res.status(500).json({ 
      message: 'Dosya veya dizin bulunamadı',
      type: 'FileSystemError'
    });
  }

  // JWT hataları
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      message: 'Geçersiz token',
      type: 'AuthenticationError'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ 
      message: 'Token süresi dolmuş',
      type: 'AuthenticationError'
    });
  }

  // Sharp hataları
  if (err.name === 'SharpError') {
    return res.status(500).json({ 
      message: 'Resim işleme hatası',
      type: 'ImageProcessingError'
    });
  }

  // Özel hata sınıfları için
  if (err.isOperational) {
    return res.status(err.statusCode || 400).json({ 
      message: err.message,
      type: err.type
    });
  }

  // Genel sunucu hataları
  res.status(500).json({ 
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Sunucu hatası',
    type: 'ServerError',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;