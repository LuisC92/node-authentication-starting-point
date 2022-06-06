//  Add in the authentication within this file
const express = require('express');
const router = express.Router();
const connection = require('../config');
const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('../models/user')

router.get('/', (req, res) => {
    console.log(res)
})

router.post('/signup', (req, res) => {
    let validationErrors = User.validate(req.body);
    if (validationErrors) {
        return Promise.reject('Invalid data')
    }
    User.create(req.body)
    console.log('Kelly The Great')
        .then((createdUser) => {
            res.status(201).json(createdUser)
            console.log(createdUser)
        })
        .catch((error) => {
            if (error == 'Invalid data') {
                res.status(422).json({ validationErrors })
            } else {
                res.status(500).json('Error creating a user.')
            }
        })

})

module.exports = router;