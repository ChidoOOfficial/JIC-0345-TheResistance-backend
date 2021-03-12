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

router.get('/inventory', authentication.checkAuthenticated, async (req, res)=> {
    inventory = await UserProfile.findById(req.user._id, {Inventory: 1})
    res.json(inventory)
})

router.post('/inventory', authentication.checkAuthenticated, async (req, res)=> {
    changes = req.body.Inventory 
    if (changes == null) {
        res.json({
            success: true,
            status: 'no changes made'
        })
    }

    _inventory = (await UserProfile.findById(req.user._id, {Inventory: 1})).Inventory
    inventory = []
    
    for(i=0; i < _inventory.length; i++) {
        inventory.push({
            Item: _inventory[i].Item,
            Quantity: _inventory[i].Quantity
        })
    }

    for (j = 0; j < changes.length; j++){
        found = false
        for (i=0; i < inventory.length; i++) {
            if (inventory[i].Item == changes[j].Item) {
                inventory[i].Quantity = changes[j].Quantity
                found = true
                break
            }
        }

        if (!found) {
            inventory.push({
                Item: changes[j].Item,
                Quantity: changes[j].Quantity
            })
        }
    }

    await UserProfile.updateOne({_id: req.user._id  }, { $set: {
        Inventory: inventory
    }})

    res.json({
        success: true,
        status: 'changes made'
    })
})

router.get('/coins', authentication.checkAuthenticated, async (req, res)=> {
    coins = await UserProfile.findById(req.user._id, {Coins: 1})
    res.json(coins)
})

router.post('/coins', authentication.checkAuthenticated, async (req, res)=> {
    coins = req.body.Coins
    console.log(coins)
    await UserProfile.updateOne({_id: req.user._id  }, { $set: {
        Coins: coins
    }})

    res.json(
        {
            status: 'changed',
            successful: true
        }
    )
})

router.post('/quizscore/latest', authentication.checkAuthenticated, async (req, res)=> {
    topic = req.body.topic
    quizscores = (await UserProfile.findById(req.user._id, {QuizScores: 1})).QuizScores
    quiz = null

    for (i=0; i<quizscores.length; i++){

        if (quizscores[i].Topic == topic) {
            quiz = quizscores[i]
            break
        }
    }

    if (quiz == null) {
        res.json({
            Topic: topic,
            Status: 'No History'
        })
    }

    quiz.ScoreHistory.sort(function(a, b) {
        return new Date(a.Date).getTime() - new Date(b.Date).getTime();
    })    

    response = {
        Score: quiz.ScoreHistory[quiz.ScoreHistory.length - 1].Score,
        Date: quiz.ScoreHistory[quiz.ScoreHistory.length - 1].Date,
        Topic: topic,
        PossibleScore: quiz.PossibleScore
    }

    res.json(response)
})

router.post('/quizscore/all', authentication.checkAuthenticated, async (req, res)=> {
    topic = req.body.topic
    quizscores = (await UserProfile.findById(req.user._id, {QuizScores: 1})).QuizScores

    quiz = null
    for (i=0; i<quizscores.length; i++){
        if (quizscores[i].Topic == topic) {
            quiz = quizscores[i]
            break
        }
    }

    if (quiz == null) {
        res.json({
            Topic: topic,
            Status: 'No History'
        })
    } else {
        quiz.ScoreHistory.sort(function(a, b) {
            return new Date(a.Date).getTime() - new Date(b.Date).getTime();
        })

        response = {
            ScoreHistory: quiz.ScoreHistory,
            Topic: topic,
            PossibleScore: quiz.PossibleScore
        }

        res.json(response)
    }
})

router.post('/quizscore/add', authentication.checkAuthenticated, async (req, res)=> {
    topic = req.body.topic
    score = req.body.score
    possiblescore = req.body.possiblescore

    quizscores = (await UserProfile.findById(req.user._id, {QuizScores: 1})).QuizScores
    
    if (quizscores == null) {
        quizscores = []
    }

    found = false
    quizInd = null 

    for (i=0; i<quizscores.length; i++){
        if (quizscores[i].Topic == topic) {
            quizInd = i
            found = true
            break
        }
    }

    if (!found) {
        quizscores.push({
            Topic:  topic,
            PossibleScore: possiblescore,
            ScoreHistory: []
        })
        quizInd = quizscores.length-1
    }

    quizscores[i].ScoreHistory.push({
        Date: Date.now(),
        Score: score
    })
    
    await UserProfile.updateOne({_id: req.user._id  }, { $set: {
        QuizScores: quizscores
    }})

    res.json({
        successful: true
    })
})

/**
 * QuizResults: {
        type: [
            {
                Topic: {
                    type: String,
                    required: true
                },
                ScoreHistory: {
                    type: [
                        {
                            Date: {
                                type: Date
                            },
                            Score: {
                                type: Number
                            }
                        }
                    ],
                    required: true
                },
                PossibleScore: {
                    type: Number,
                    required: true
                }
            }
        ]
    }
 */





module.exports = router;