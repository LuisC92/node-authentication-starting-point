const Joi = require('joi');
const connection = require('../config');
const db = connection.promise();
const bcrypt = require('bcrypt');

const validate = (data, forCreation = true) => {
    const presence = forCreation ? 'required' : 'optional';
    return Joi.object({
        email: Joi.string().email().max(255).presence(presence),
        password: Joi.string().min(8).max(24).presence(presence),
        firstname: Joi.string().max(255).presence(presence),
        lastname: Joi.string().max(255).presence(presence),
        city: Joi.string().max(255).allow(null, ''),
        language: Joi.string().max(255).allow(null, '')
    }).validate(data, { abortEarly: false }).error;
}

const create = ({ email, password, firstname, lastname, city, language }) => {
    const salt = bcrypt.genSalt(10);     // now we set user password to hashed password     
    return bcrypt.hash(password, salt).then((hashedPassword) => {
        return db
            .query('INSERT INTO users SET ?', {
                email, hashedPassword, firstname, lastname, city, language
            })
            .then(([result]) => {
                console.log(result)
                const id = result.insertId;
                return { email, firstname, lastname, city, language, id }
            })
    });
}

module.exports = { create, validate };