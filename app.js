require('dotenv/config');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport')
const cookieParser = require('cookie-parser')
const session = require('express-session')

//--------------------Start of Middleware----------------------//

app.use(bodyParser.json());
app.set('view-engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
}));

app.use(cookieParser(process.env.SESSION_SECRET))

app.use(passport.initialize());
app.use(passport.session());
require('./passportConfig')(passport);

//--------------------End of Middleware----------------------//

//--------------------Start of Routes----------------------//
app.get('/', async (req, res) => {
    console.log('hit')
    res.render('index.ejs')
})
app.use('/user', require('./routes/user'));
//--------------------End of Routes----------------------//

//Connect to DB
mongoose.connect(
    process.env.DB_CONNECTION, 
    {
        useNewUrlParser: true,
        useUnifiedTopology: true 
    },
    () => { 
        console.log('Connected to DB!')
});

app.listen(process.env.PORT || 3000);