const router = require('express').Router();
const verified = require('../auth/verifyToken');
const User = require('../model/User');

router.get('/get-profile',verified, async (req,res)=> {
    const user = await User.findOne({
        _id: req.user._id
    });

    res.json({id:user._id,name:user.name});
})

module.exports = router;