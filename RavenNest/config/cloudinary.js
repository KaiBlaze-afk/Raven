// config/cloudinary.js
const { v2: cloudinary } = require('cloudinary');

cloudinary.config({ 
    cloud_name: 'dej0fmtbz', 
    api_key: '254134622878137', 
    api_secret: 'UwtWkTld72tTKmv4Euzm051M_zI'
});

module.exports = cloudinary;
