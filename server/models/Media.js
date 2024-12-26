const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema(
  {
    title: {
      // title of the media
      type: String,
      required: true,
    },
    filename: {
      // name of the file
      type: String,
      required: true,
    },
    mediatype: {
      //image/jpg or video/mp4
      type: String,
      required: true,
    },
    image: {
      // binary data for storing images, videos, etc.
      type: Buffer,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Media', MediaSchema);
