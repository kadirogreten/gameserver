const Joi = require('@hapi/joi');

const registerValidation = data => {
    const schema = Joi.object({
        name : Joi.string().min(6).required(),
        email : Joi.string().min(6).required().email(),
        password : Joi.string().min(6).required(),
    });


    const options = {
        abortEarly: false, // include all errors
        allowUnknown: true, // ignore unknown props
        stripUnknown: true // remove unknown props
    };

    // validate request body against schema
    const {validation,error} = schema.validate(data, options);

    if (error) {
        // on fail return comma separated errors
        // message = []
        //console.log(error)
        // error.details.forEach(function(item)
        // {
        //     message.push(item.message);
        // })
        return error;
    } else {
        // on success replace req.body with validated value and trigger next middleware function
        return validation;
    }
}


const loginValidation = data => {
    const loginSchema = Joi.object({
        email : Joi.string().min(6).required().email(),
        password : Joi.string().min(6).required(),
    });


    const options = {
        abortEarly: false, // include all errors
        allowUnknown: true, // ignore unknown props
        stripUnknown: true // remove unknown props
    };

    // validate request body against schema

    const {validation,error} = loginSchema.validate(data, options);

    if (error) {
        // on fail return comma separated errors
        // message = []
        //console.log(error)
        // error.details.forEach(function(item)
        // {
        //     message.push(item.message);
        // })
        return error;
    } else {
        // on success replace req.body with validated value and trigger next middleware function
        return validation;
    }
}


module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;

