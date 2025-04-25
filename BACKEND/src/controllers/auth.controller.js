const User = require("../model/user.model");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();
// Register User
const registerUser = async (req, res) => {
  try {    
    const { username, nickname, password } = req.body;
    // Check if user already exists
    let user = await User.findOne({ username });
    if (user) return res.status(400).json({ message: "User already exists" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = new User({ username, nickname, password: hashedPassword });
    await user.save();
    console.log(user);
    res.status(201).json({ message: "User registered successfully" ,user : user});
  } catch (error) {
    console.error("Error in signup:", error);
    res.status(500).json({ message: "Server error in signup", error });
  }
};

// Login User
const loginUser = async (req, res) => {
 
  try {    
    const { username, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT Token
    res.status(200).json({ message: "Login successful",user : user });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = { registerUser, loginUser };
