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
        return res.status(400).send({
            message: err.details,
            isError: true
        });
    }

    //////// checking existing user ////////

    const existingUser = await User.findOne({
        email: req.body.email
    });


    if (existingUser) return res.status(400).send({
        message: 'Email already exists!',
        isError: true
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
            message: 'Kayıt başarılı!',
            isError: false
        });
    } catch (error) {
        return res.status(400).send({
            message: error,
            isError: true
        });
    }
});


router.post('/login', async (req, res) => {

    /////// lets validate before save user /////////
    const err = loginValidation(req.body);
    if (err) {
        return res.status(400).send({
            message: err.details,
            isError: true
        });
    }

    //////// checking existing user ////////

    const user = await User.findOne({
        email: req.body.email
    });


    if (!user) return res.status(400).send({
        message: 'Email or password is wrong!',
        isError: true
    });

    const validPass = await bcrypt.compare(req.body.password, user.password);

    if (!validPass) return res.status(400).send({
        message: 'Email or password is wrong!',
        isError: true
    });

    

    const token = jwt.sign({
        _id: user._id,
        email: user.email
    }, 'Ortamlardanaşağıalperinsikidaşşağı',{ expiresIn: '15d' });
    res.header('Authorization', token).send({
        token: token,
        id: user._id,
        message: 'Giriş başarılı!',
        isError: false

    });
});

//// Login ////



module.exports = router;