const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

let otpStorage = {}; // Stores OTP temporarily for demo

// API to send OTP
app.post('/send-otp', (req, res) => {
  const { phoneNumber } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
  otpStorage[phoneNumber] = otp; // Store OTP
  console.log(`Sending OTP ${otp} to ${phoneNumber}`);
  res.status(200).json({ message: 'OTP sent successfully!' });
});

// API to validate OTP
app.post('/validate-otp', (req, res) => {
  const { phoneNumber, otp } = req.body;
  if (otpStorage[phoneNumber] && otpStorage[phoneNumber] == otp) {
    delete otpStorage[phoneNumber]; // Remove OTP after validation
    res.status(200).json({ message: 'OTP validated successfully!' });
  } else {
    res.status(400).json({ message: 'Invalid OTP' });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
