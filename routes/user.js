require('dotenv/config');
const authentication = require("../authentication.js");
const express = require('express');
const router = express.Router();
const UserProfile = require('../models/UserProfile');
const bcrypt = require('bcrypt');
const passport = require('passport');

HashCycles = parseInt(process.env.PASSWORD_HASHING_CYCLES);

// Submit login information for login
router.post('/login', authentication.checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: "/",
    failureRedirect: "/user/login",
    failureFlash: true
}))

// Log out of user
router.post('/logout', (req, res) => {
    req.logOut()
    res.redirect('/user/login')
})

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

        new UserProfile({
            Username: req.body.username,
            FirstName: req.body.firstname,
            LastName: req.body.lastname,
            Email: req.body.email,
            MiddleName: req.body.middlename,
            AccountType: req.body.acounttype,
            HashedPassword: password
        }).save();
        console.log('new account created');
        res.json({ result: 'True'});
    }
});



module.exports = router;