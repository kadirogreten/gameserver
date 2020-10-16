const router = require('express').Router();
const User = require('../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


////// VALIDATION ///////
const {
    registerValidation,
    loginValidation
} = require('../validation/validation');



////// VALIDATION ///////

//// Register ////

router.post('/register', async (req, res) => {


    /////// lets validate before save user /////////
    const err = registerValidation(req.body);
    if (err) {
        return res.status(400).send(err.details);
    }

    //////// checking existing user ////////

    const existingUser = await User.findOne({
        email: req.body.email
    });


    if (existingUser) return res.status(400).send({
        message: 'Email already exists!'
    });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(req.body.password, salt);

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hash
    });

    try {
        const savedUser = await user.save();
        return res.send({
            user: user._id
        });
    } catch (error) {
        return res.status(400).send(error);
    }
});


router.post('/login', async (req, res) => {
    
    /////// lets validate before save user /////////
    const err = loginValidation(req.body);
    if (err) {
        return res.status(400).send(err.details);
    }

    //////// checking existing user ////////

    const user = await User.findOne({
        email: req.body.email
    });


    if (!user) return res.status(400).send({
        message: 'Email or password is wrong!'
    });

    const validPass = await bcrypt.compare(req.body.password, user.password);

    if (!validPass) return res.status(400).send({
        message: 'Email or password is wrong!'
    });

    const token = jwt.sign({
        _id: user._id,
        email: user.email
    }, 'Ortamlardanaşağıalperinsikidaşşağı');
    res.header('Authorization', token).send({
        token: token
    });
});

//// Login ////



module.exports = router;