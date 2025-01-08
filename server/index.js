const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Media = require('./models/Media');
const multer = require('multer');

require('dotenv').config();

const app = express();
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Multer setup
// limits for file size
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // limit file size to 10MB
  },
  storage: multer.memoryStorage(), // store files in memory as buffers
});

// CRUD API for Media

// Create a new media file
app.post('/media', upload.single('file'), async (req, res) => {
  try {
    const { title, userId } = req.body;

    // Check if title and user ID are provided
    if (!title || !userId) {
      return res.status(400).json({ msg: 'Title and User ID are required' });
    }

    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    const { originalname, mimetype, buffer } = req.file;

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Create a new media object
    const newMedia = new Media({
      title,
      filename: originalname,
      mediatype: mimetype,
      image: buffer,
      user: userId, // Assign the user ID to the media object
    });

    // Save the media object to the database
    await newMedia.save();

    res.status(201).json({
      msg: 'Media created successfully',
      media: {
        id: newMedia._id,
        title: newMedia.title,
        filename: newMedia.filename,
        mediatype: newMedia.mediatype,
        user: newMedia.user,
        createdAt: newMedia.createdAt,
        updatedAt: newMedia.updatedAt,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all media files
app.get('/media', async (req, res) => {
  try {
    const mediaFiles = await Media.find()
      .select('-image')
      .populate('user', 'username email');
    res.status(200).json(mediaFiles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get latest media files
app.get('/media/latest', async (req, res) => {
  try {
    // Get the limit from the query string or default to 7
    const limit = parseInt(req.query.limit) || 7;

    const latestMediaFiles = await Media.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('user', 'username email');

    res.status(200).json(latestMediaFiles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get one media file by ID
app.get('/media/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const mediaFile = await Media.findById(id).populate(
      'user',
      'username email'
    );
    if (!mediaFile) {
      return res.status(404).json({ msg: 'Media not found' });
    }

    res.status(200).json(mediaFile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a media file
app.put('/media/:id', upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    const mediaFile = await Media.findById(id);
    if (!mediaFile) {
      return res.status(404).json({ msg: 'Media not found' });
    }

    if (title) mediaFile.title = title;

    if (req.file) {
      const { originalname, mimetype, buffer } = req.file;
      mediaFile.filename = originalname;
      mediaFile.mediatype = mimetype;
      mediaFile.image = buffer;
    }

    await mediaFile.save();

    res.status(200).json({
      msg: 'Media updated successfully',
      media: {
        id: newMedia._id,
        title: newMedia.title,
        filename: newMedia.filename,
        mediatype: newMedia.mediatype,
        user: newMedia.user,
        createdAt: newMedia.createdAt,
        updatedAt: newMedia.updatedAt,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove a media file
app.delete('/media/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const mediaFile = await Media.findByIdAndDelete(id);
    if (!mediaFile) {
      return res.status(404).json({ msg: 'Media not found' });
    }

    res.status(200).json({ msg: 'Media deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register API
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ msg: 'Please enter all fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: passwordHash,
    });

    await newUser.save();

    res.status(201).json({ msg: 'User created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login API
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if any field is empty
    if (!email || !password) {
      return res.status(400).json({ msg: 'Please enter all fields' });
    }

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'User does not exist' });
    }

    // Check if the password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Return the user if login is successful
    res.status(200).json({
      msg: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
