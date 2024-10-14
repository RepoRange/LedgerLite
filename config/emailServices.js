const nodemailer = require('nodemailer');


// Create a transporter object using Gmail as the email service
const sendEmail = async (firstName, recipientEmail) => {
    try {
      // Create a transporter object using SMTP settings
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com', // Replace with your SMTP server
        port: 587, // Typically 587 for TLS or 465 for SSL
        secure: false, // Set to true if using port 465
        auth: {
          user: 'process.env.EMAIL_USER', // Your email address
          pass: 'process.env.EMAIL_PASS' // Your email password or app-specific password
        }
      });
  
      // Define default subject and message
      const subject = `Welcome to LedgerLite, ${firstName}!`;
      const message = `Hello ${firstName},\n\nWelcome to LedgerLite! We're excited to have you on board. In this app, you can easily manage your records. Thank you for signing up!\n\nBest Regards,\nThe LedgerLite Team`;
  
      // Define email options
      const mailOptions = {
        from: 'process.env.EMAIL_USER', // Sender's email address
        to: recipientEmail, // Receiver's email address
        subject: subject, // Email subject
        text: message // Email content
      };
  
      // Send the email
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.response);
      return { success: true, message: 'Email sent successfully' };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, message: 'Failed to send email' };
    }
  };
  
  
module.exports = { sendEmail };
