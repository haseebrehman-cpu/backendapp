import { prisma } from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { emailQueue } from '../config/queue.js';

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const profilePicture = req.file ? req.file.path : null; // this will be the path of the uploaded file

    // Validate request body
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'All fields are required',
        status: 'error',
        code: 400,
      });
    }

    // Check if user already exists
    const userExists = await prisma.user.findUnique({ where: { email: email } });
    if (userExists) return res.status(400).json({ message: 'User already exists', status: 'error', code: 400 });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        profilePicture: profilePicture,
      },
    });
    if (!newUser) return res.status(500).json({ message: 'Failed to create user', status: 'error', code: 500 });

    // Enqueue the verification email; a background worker sends it so the
    // response isn't blocked on the mail server.
    await emailQueue.add('sendVerificationEmail', newUser);

    // Return success response
    return res.status(201).json({
      message: 'User created successfully. Please check your email to verify your account.',
      status: 'success',
      code: 201,
      data: newUser,
    });
  } catch (error) {
    console.error('registerUser error:', error);
    // Return error response
    return res.status(500).json({ message: 'Internal server error', status: 'error', code: 500 });
  }
}

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'All fields are required', status: 'error', code: 400 });
    const userExists = await prisma.user.findUnique({ where: { email: email } });
    if (!userExists) return res.status(400).json({ message: 'User with this email doesn\'t exist', status: 'error', code: 400 });

    if (!await bcrypt.compare(password, userExists.password)) return res.status(400).json({ message: 'Invalid password', status: 'error', code: 400 });

    if (!userExists.isVerified) return res.status(403).json({ message: 'Please verify your email before logging in', status: 'error', code: 403 });

    const token = jwt.sign({ id: userExists.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({ message: 'Login successful', status: 'success', code: 200, data: { user: userExists, token: token } });
  } catch (error) {
    console.error('loginUser error:', error);
    return res.status(500).json({ message: 'Internal server error', status: 'error', code: 500, data: null });
  }
}
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: 'Verification token is required', status: 'error', code: 400 });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid or expired verification token', status: 'error', code: 400 });
    }

    if (payload.type !== 'email_verification') {
      return res.status(400).json({ message: 'Invalid verification token', status: 'error', code: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) return res.status(404).json({ message: 'User not found', status: 'error', code: 404 });

    if (user.isVerified) {
      return res.status(200).json({ message: 'Email already verified', status: 'success', code: 200 });
    }

    await prisma.user.update({ where: { id: user.id }, data: { isVerified: true } });

    return res.status(200).json({ message: 'Email verified successfully', status: 'success', code: 200 });
  } catch (error) {
    console.error('verifyEmail error:', error);
    return res.status(500).json({ message: 'Internal server error', status: 'error', code: 500 });
  }
}

export default { registerUser, loginUser, verifyEmail };