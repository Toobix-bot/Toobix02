const User = require('../models/User');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password
    });

    if (user) {
      // Initialize default skills for new user
      // This would be handled by a separate service in a production app

      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile,
        stats: user.stats,
        token: user.generateToken()
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists and password matches
    if (user && (await user.matchPassword(password))) {
      // Update last login
      user.lastLogin = Date.now();
      await user.save();

      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile,
        stats: user.stats,
        token: user.generateToken()
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile,
        stats: user.stats,
        settings: user.settings
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Update basic info
      user.username = req.body.username || user.username;
      user.email = req.body.email || user.email;
      
      // Update profile
      if (req.body.profile) {
        user.profile.displayName = req.body.profile.displayName || user.profile.displayName;
        user.profile.avatar = req.body.profile.avatar || user.profile.avatar;
        user.profile.bio = req.body.profile.bio || user.profile.bio;
        
        if (req.body.profile.goals) {
          user.profile.goals = req.body.profile.goals;
        }
      }
      
      // Update settings
      if (req.body.settings) {
        user.settings.theme = req.body.settings.theme || user.settings.theme;
        user.settings.notifications = req.body.settings.notifications !== undefined 
          ? req.body.settings.notifications 
          : user.settings.notifications;
          
        if (req.body.settings.privacySettings) {
          user.settings.privacySettings = req.body.settings.privacySettings;
        }
      }
      
      // Update password if provided
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        profile: updatedUser.profile,
        stats: updatedUser.stats,
        settings: updatedUser.settings,
        token: updatedUser.generateToken()
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile
};
