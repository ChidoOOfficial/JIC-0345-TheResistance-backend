const mongoose = require('mongoose');

const UserProfileSchema = mongoose.Schema({

    Username: {
        type: String,
        required: true
    },
    FirstName: {
        type: String,
        required: true
    },
    LastName: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        required: true
    },
    AccountType: {
        type: String,
        required: true
    }, //Account Type: student/teacher 
    HashedPassword: {
        type: String,
        require: true
    },
    SpecialID: {
        type: String,
        require: true
    },
    Inventory: {
        type: [{
            Item: {
                type: String,
                required: true
            },
            Quantity: {
                type: Number,
                required: true
            }
        }] 
    }
});

module.exports = mongoose.model('UserProfile', UserProfileSchema);