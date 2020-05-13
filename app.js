/* Importing Different Modules */

const { globalVariables } = require('./config/configuration');
const storage = require('node-persist')
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const hbs = require('express-handlebars');
const { mongoDbUrl, PORT } = require('./config/configuration');
const flash = require('connect-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const { selectOption } = require('./config/customFunctions');
const fileUpload = require('express-fileupload');
const passport = require('passport');

const app = express();



// Configure Mongoose to Connect to MongoDB
mongoose.connect(mongoDbUrl, { useNewUrlParser: true })
    .then(response => {
        console.log("MongoDB Connected Successfully.");
    }).catch(err => {
        console.log("Database connection failed.");
    });




/* Configure express*/
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


/*  Flash and Session*/
app.use(session({
    secret: 'anysecret',
    saveUninitialized: true,
    resave: true
}));

app.use(flash());

/* Passport Initialize */
app.use(passport.initialize());
app.use(passport.session());

/* Use Global Variables */
app.use(globalVariables);


/* File Upload Middleware*/
app.use(fileUpload());

/* Setup View Engine To Use Handlebars */
app.engine('handlebars', hbs({ defaultLayout: 'default', helpers: { select: selectOption } }));
app.set('view engine', 'handlebars');


/* Method Override Middleware*/
app.use(methodOverride('newMethod'));

var counter = 0

app.get("/counter", (req, res) => {
    counter++;
    storage.init().then(() => storage.getItem("counter")).then((value) => {
        if (value > 0) {
            counter = value;
        } else {
            counter = 0;
        }
      });

    // Saves counter into the store and send response AFTER the store has been saved
    storage.setItem("counter", counter).then(() => {
        res.json(counter);
    });
});

    /* Routes */
    const defaultRoutes = require('./routes/defaultRoutes');
    const adminRoutes = require('./routes/adminRoutes');

    // aap.get('/', (req, res)=> {

    // })

    app.use('/', defaultRoutes);
    app.use('/admin', adminRoutes);

    app.all('*', function (req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        next();
    })

    /* Start The Server */
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });