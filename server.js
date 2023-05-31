const express = require('express');
const app = express();
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cors = require('cors')
const path = require('path')

app.use(express.static(path.join(__dirname,'/build'))); 

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb+srv://Mridul:Mridul123@cluster0.2khlvfl.mongodb.net/OtpAppDb?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected');
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

// Define the User schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  otp: {
    type: String,
    required: true,
  },
});

const userModel = mongoose.model('User', userSchema);

// Send OTP route
app.post('/api/send-otp', async (req, res) => {
  console.log(req.body)
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    // Save OTP to the database
    let user = new userModel({
      email: req.body.email,
      otp: otp
    })
    console.log(user);
    await user.save()
    // Send the OTP via email
    const transporter = nodemailer.createTransport({
        service: 'gmail',
  auth: {
    user: 'mriduljoly2000@gmail.com',
    pass: 'nbehoukcokwtlksa'
  }
    });

    await transporter.sendMail({
      from: 'mriduljoly2000@gmail.com',
      to: email,
      subject: 'OTP Verification',
      text: `Your OTP: ${otp}`,
    });

    res.status(200).send('OTP saved successfully');
  } catch (error) {
    console.error('Failed to send OTP:', error);
    res.status(500).send('Failed to send OTP');
  }
});

// Verify OTP route
app.post('/api/verify-otp', async (req, res) => {
  const { otp } = req.body;

  try {
    // Find user by OTP in the database
    const user = await userModel.findOne({ otp: otp});
    console.log(user)
    if (user) {
      res.status(200).send('OTP matched');
    } else {
      res.status(400).send('Invalid OTP');
    }
  } catch (error) {
    console.error('Failed to verify OTP:', error);
    res.status(500).send('Failed to verify OTP');
  }
});

app.get('/*', function(req, res) { 
  res.sendFile(path.join(__dirname ,'/build/index.html')); });

// Start the server

app.listen(3001, () => {
  console.log("Server is running ");
});
