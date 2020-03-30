const Cloudinary = require('cloudinary').v2;

Cloudinary.config({
  cloud_name: 'dtquxmxcs',
  api_key: '219447449487377',
  api_secret: 'YsATAdSo0HSkKKu1Xhp9n4bV3js'
});

module.exports = {
  uploadImage: (path) => {
    return new Promise((resolve, reject) => {
      Cloudinary.uploader.upload(path, function(error, result) {
        if (error) {
          reject(error);
        }
        
        resolve(result);
      });
    });
  },
  cloudinary: Cloudinary
};
