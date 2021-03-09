require('dotenv/config');
const authentication = require("../authentication.js");
const express = require('express');
const router = express.Router();
const UserProfile = require('../models/UserProfile');
const bcrypt = require('bcrypt');
const passport = require('passport');
const { request } = require('express');

HashCycles = parseInt(process.env.PASSWORD_HASHING_CYCLES);

// Submit login information for login
router.post('/login', authentication.checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: "/user/login/successful",
    failureRedirect: "/user/login/unsuccessful"
}))

router.get('/login/successful', (req, res) => {
    res.json({
        loggedIn: true
    })
})

router.get('/login/unsuccessful', (req, res) => {
    res.json({
        loggedIn: false
    })
})

router.get('/login/isloggedin', (req, res) => {
    res.json({
        isloggedIn: req.isAuthenticated()
    })
})

// Log out of user
router.post('/logout', (req, res) => {
    req.logOut()
    res.redirect('/user/login')
})



function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

// Submit new registration form
router.post('/register', async (req, res) => {
    try {        
        var usersWithUsername = await UserProfile.findOne({
            Username: req.body.username
        })
    } catch(err) {
        res.json({
            runtimeErrorOccurred: true,
            errorMessage: err,
            existAlready: false
        });
    }   
    
    if (usersWithUsername != null){
        console.log('already exists');
        res.json({ result: 'False'});
    } else {

        const password = await bcrypt.hash(req.body.password, HashCycles)

        var randomID = 0

        do {
            randomID = makeid(12)
            userData = await UserProfile.find({SpecialID: randomID})
        } while(userData.length > 0);

        new UserProfile({
            Username: req.body.username,
            FirstName: req.body.firstname,
            LastName: req.body.lastname,
            Email: req.body.email,
            AccountType: req.body.acounttype,
            HashedPassword: password,
            SpecialID: randomID
        }).save();

        console.log('new account created');
        res.json({
            runtimeErrorOccurred: false,
            existAlready: false,
            status: 'successful'
        });
    }
});

router.post('/getprofile', async (req, res) => {
    res = await UserProfile.findById(req.user.id, {HashedPassword: 0})
    res.json({userprolife: res})
});





module.exports = router;