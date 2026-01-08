import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Use a strong secret in production

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define User Schema and Model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model('User', userSchema);

// API Routes for Auth
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Username already exists or invalid data' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login successful', token, user: { id: user._id, username: user.username } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// API Routes for One-Time View System
app.post('/api/check-hash', async (req, res) => {
  try {
    const { file_hash } = req.body;
    if (!file_hash) {
      return res.status(400).json({ error: 'File hash is required' });
    }

    const existingFile = await DecodedFile.findOne({ file_hash });
    const exists = !!existingFile;

    res.status(200).json({ exists });
  } catch (err) {
    console.error('Error checking hash:', err);
    res.status(500).json({ error: 'Server error checking hash' });
  }
});

app.post('/api/store-hash', async (req, res) => {
  try {
    const { file_hash } = req.body;
    if (!file_hash) {
      return res.status(400).json({ error: 'File hash is required' });
    }

    const newDecodedFile = new DecodedFile({ file_hash });
    await newDecodedFile.save();

    res.status(201).json({ message: 'Hash stored successfully' });
  } catch (err) {
    if (err.code === 11000) { // Duplicate key error
      res.status(200).json({ message: 'Hash already exists' });
    } else {
      console.error('Error storing hash:', err);
      res.status(500).json({ error: 'Server error storing hash' });
    }
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
