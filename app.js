const express = require("express");

const mongoose = require("mongoose")

const passport = require('passport');

const session = require('express-session');

const path = require("path");

const flash = require("express-flash")

const User = require('./models/user');

const Ledger = require('./models/ledger');

const bcrypt = require('bcryptjs');

const connectDB = require('./config/database');

const ledger = require("./models/ledger");

const { log } = require("console");

const cookie = require("express-session/session/cookie");

require('dotenv').config();

require('./config/passport')(passport);

const MongoStore = require('connect-mongo');

const {sendEmail }= require('./config/emailServices');




const app = express();

// Database connection
connectDB();


//middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



//session setup to store the session object
app.use(session({
    secret: process.env.secret || 'your-secret-key', // Secret for signing session IDs
    resave: false, // Prevents resaving unmodified sessions
    saveUninitialized: false, // Don't create session until something stored
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI, // MongoDB connection string
        collectionName: 'sessions', // Specify the collection for sessions
        ttl:  24 * 60 * 60, // Set TTL for sessions (1 day)
        autoRemove: 'native', // Automatically remove expired sessions
    }),
    cookie: {
        maxAge:  24 * 60 * 60 * 1000 // Session cookie expiration time (1 day)
    }
}));

//app.use(session({ secret: process.env.secret || 'your-secret-key', resave: false, saveUninitialized: false }));




app.use(passport.session());//this initiates the deserialization of the user from the session




app.use(flash());//this initializes the flash middleware for flash messages means that we can use req.flash('success', 'Message') to display messages to the user


app.set("view engine", "ejs");//this sets the view engine to ejs for rendering the views



//ensuring the is authenticated

// helper function to ensure the user is authenticated this works after deserialiazation by the passport middleware
function ensureAuthenticated(req, res, next) {
    //console.log('Checking authentication status...');
   // console.log('User:', req.user);

    if (req.isAuthenticated()) {
        //console.log('User is authenticated');
        return next(); // User is authenticated, proceed to the next middleware
    } 
    
    console.log('User not authenticated');
    res.redirect('/login');
}



//staritng page
app.get('/', (req, res) => {
    
    res.render('landing'); // Redirect to the authentication page
});

app.get('/login', (req, res) => {
    res.render('login'); // Redirect to the authentication page
});





app.get('/signup', (req, res) => {
    res.render("signup"); // Renders signup.ejs
});

//login verifiyng the candida
app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err); // Pass errors to the next middleware
        }
        if (!user) {
            // Determine the error field based on the failure message
            let errorField = 'email'; // Default to email field
            
            if (info.message === 'Incorrect password') {
                errorField = 'password';
            } else if (info.message === 'No user with that email') {
                errorField = 'email';
            }

            // Flash an error message along with the field causing the error
            req.flash('error', info.message || 'Login failed. Please try again.');
            req.flash('errorField', errorField);

            return res.redirect('/login');
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err); // Handle errors during login
            }
            // Set userId in the session manually since the passport has serialized the user no need to do that
            //req.session.userId = user._id;

            // Authentication successful, flash a success message
            req.flash('success', 'You are successfully logged in!');
            return res.redirect('/index');
        });
    })(req, res, next);
});



//signup route 
app.post('/signup', async (req, res, next) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Create a new user
        const newUser = new User({ firstName, lastName, email, password });
        await newUser.save();

        // Log the user in
        req.logIn(newUser, (err) => {
            if (err) {
                return next(err); // Handle errors
            }

            sendEmail( firstName,email);
            // Successfully signed up and logged in

            return res.redirect('/login');
        });
    } catch (error) {
        return next(error); // Handle errors
    }
});

//page rendering
app.get('/index',ensureAuthenticated ,async(req, res) => {
    //console.log("in the index");
    try {
        // Fetch ledgers for the logged-in user
        const ledgers = await Ledger.find({ userId: req.user.id }).sort({ date: -1 }); // Sort by date descending
        res.render('index', { ledgers });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


// //google oauth route 

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email']
}));

app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // Successful authentication
        const userEmail = req.user.email; // Extract the email from the user object
        const userName = req.user.firstName || req.user.lastName || req.user.displayName; // Adjust based on your user schema

       

        // Send welcome email
        sendEmail(userName, userEmail);


        res.redirect('/index');
    }
);
//create page
app.get('/create', ensureAuthenticated ,  (req, res) => {
    if (!req.user) {
        // Redirect to login if no user is logged in
        return res.redirect('/');
    }
    res.render("create");
});
// Route to create a ledger entry
app.post('/createledger', ensureAuthenticated , async (req, res) => {
    try {
        const { title, content, date } = req.body;

        // Get userId from req.user (Passport handles this for both local and Google login)
        const userId = req.user ? req.user._id : null;

        // Validate required fields
        if (!title || !userId) {
            console.log(userId);
            console.log(title);
            return res.status(400).send('Title and User ID are required.');
        }

        // Set default values if other fields are missing
        const ledgerDate = date || new Date().toISOString().split('T')[0]; // Default to current date
        const ledgerContent = content || 'No content provided'; // Default content

        // Create a new ledger entry
        const newLedger = new Ledger({
            title,
            content: ledgerContent,
            date: ledgerDate,
            userId
        });

        // Save the ledger entry to the database
        await newLedger.save();

        // Redirect or respond with success message
        res.status(201).redirect('/index'); // Change the redirect path as needed

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});
//route to handle deletion
app.post('/deleteledger/:id', ensureAuthenticated , async (req, res) => {
    try {
        const { id } = req.params;

        // Delete the ledger entry by ID
        await Ledger.findByIdAndDelete(id);

        // Respond with a success message or redirect
        res.status(200).redirect('/index');

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


//rouet to open the div doc
app.get('/ledger/:id/open',ensureAuthenticated ,  async (req, res) => {
    try {
        const { id } = req.params;

        
        const ledger = await Ledger.findById(id);
        

        if (!ledger) {
            return res.status(404).send('Ledger not found');
        }

        // Render the edit page with the ledger ID and content
        res.render('edit', {
            id: ledger._id,
            content: ledger.content,
            title: ledger.title,
            date: ledger.date
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


//update the content
app.post('/update/:id',ensureAuthenticated ,  async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        // Find the ledger entry by ID and update its content
        await Ledger.findByIdAndUpdate(id, { content });

        // Redirect to the desired page after updating
        res.redirect('/index');
    } catch (error) {
        console.error(error);
        console.log("hello")
        res.status(500).send('Internal Server Error');
    }
});



//logout


app.get('/logout', (req, res) => {
    console.log('Logout route accessed');
    
    if (req.session) {
      // Get the session ID before destroying the session
      const sessionId = req.session.id;
      
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
          return res.status(500).send('Error logging out');
        }
        
        // After destroying the session, remove it from MongoDB
        if (req.sessionStore.destroy) {
          req.sessionStore.destroy(sessionId, (destroyErr) => {
            if (destroyErr) {
              console.error('Error removing session from MongoDB:', destroyErr);
            } else {
              console.log('Session removed from MongoDB');
            }
            
            res.clearCookie('connect.sid'); // Clear the session cookie
            res.redirect('/login'); // Redirect to login page
          });
        } else {
          console.warn('SessionStore does not have a destroy method');
          res.clearCookie('connect.sid');
          res.redirect('/login');
        }
      });
    } else {
      res.redirect('/login');
    }
  });

  














  


app.listen(3000 , ()=>{
    console.log("app is running in the port 3000")
});











































































































































































































































