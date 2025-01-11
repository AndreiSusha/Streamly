const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Media = require('./models/Media');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Database connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Multer setup for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB file size limit
});

// Token blacklist
const tokenBlacklist = new Set();

// Helper function to transform media data
const transformMedia = (media) => ({
  _id: media._id,
  title: media.title,
  filename: `data:${media.mediatype};base64,${media.image.toString('base64')}`,
  mediatype: media.mediatype,
  user: media.user,
});

// Middleware to verify token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ msg: 'Access denied, token missing!' });
  }

  if (tokenBlacklist.has(token)) {
    return res
      .status(401)
      .json({ msg: 'Token is no longer valid (logged out).' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ msg: 'Invalid token.' });
    }
    req.user = user; // Attach user data to request
    next();
  });
};

// User registration
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ msg: 'All fields are required.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ msg: 'User registered successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
});

// User login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: 'User not found.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ msg: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h', // Token valid for 1 hour
      }
    );

    res.status(200).json({ msg: 'Login successful.', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
});

// User logout
app.post('/logout', authenticateToken, (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    tokenBlacklist.add(token); // Add token to blacklist
    return res.status(200).json({ msg: 'Logged out successfully.' });
  }

  res.status(400).json({ msg: 'Token is required for logout.' });
});

// Protected route example
app.get('/protected', authenticateToken, (req, res) => {
  res.status(200).json({ msg: 'This is a protected route.', user: req.user });
});

// Media routes
app.post('/media', upload.single('file'), async (req, res) => {
  try {
    const { title, userId } = req.body;

    if (!title || !userId || !req.file) {
      return res.status(400).json({ msg: 'All fields are required.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found.' });
    }

    const media = new Media({
      title,
      filename: req.file.originalname,
      mediatype: req.file.mimetype,
      image: req.file.buffer,
      user: userId,
    });

    await media.save();

    res.status(201).json({
      msg: 'Media created successfully.',
      media: transformMedia(media),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
});

// Get latest media files
app.get('/media/latest', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 7;

    const latestMediaFiles = await Media.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('user', 'username email');

    const transformedMedia = latestMediaFiles.map(transformMedia);
    res.status(200).json(transformedMedia);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
});

// Search media files by title
app.get('/media/search', async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ msg: 'Query parameter is required.' });
    }

    const mediaFiles = await Media.find({
      title: { $regex: query, $options: 'i' }, // Search case-insensitive
    }).populate('user', 'username email');

    if (mediaFiles.length === 0) {
      return res
        .status(404)
        .json({ msg: 'No media found matching the query.' });
    }

    const transformedMedia = mediaFiles.map(transformMedia);
    res.status(200).json(transformedMedia);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
});

// Get all media files
app.get('/media', async (req, res) => {
  try {
    const mediaFiles = await Media.find().populate('user', 'username email');

    const transformedMedia = mediaFiles.map(transformMedia);
    res.status(200).json(transformedMedia);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
});

// Get a specific media file by ID
app.get('/media/:id', async (req, res) => {
  try {
    const media = await Media.findById(req.params.id).populate(
      'user',
      'username email'
    );
    if (!media) {
      return res.status(404).json({ msg: 'Media not found.' });
    }

    res.status(200).json(transformMedia(media));
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
});

// Get media files by user ID
app.get('/media/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found.' });
    }

    // Get all media files for the user
    const mediaFiles = await Media.find({ user: userId }).populate(
      'user',
      'username email'
    );

    if (mediaFiles.length === 0) {
      return res
        .status(404)
        .json({ msg: 'No media files found for this user.' });
    }

    // Transform the media data
    const transformedMedia = mediaFiles.map(transformMedia);

    res.status(200).json(transformedMedia);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
});

// Update a media file by ID
app.put('/media/:id', upload.single('file'), async (req, res) => {
  try {
    const { title } = req.body;
    const media = await Media.findById(req.params.id);

    if (!media) {
      return res.status(404).json({ msg: 'Media not found.' });
    }

    if (title) media.title = title;

    if (req.file) {
      media.filename = req.file.originalname;
      media.mediatype = req.file.mimetype;
      media.image = req.file.buffer;
    }

    await media.save();

    res.status(200).json({
      msg: 'Media updated successfully.',
      media: transformMedia(media),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
});

// Delete a media file by ID
app.delete('/media/:id', async (req, res) => {
  try {
    const media = await Media.findByIdAndDelete(req.params.id);

    if (!media) {
      return res.status(404).json({ msg: 'Media not found.' });
    }

    res.status(200).json({ msg: 'Media deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
});

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
