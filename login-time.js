const express = require('express');
const router = express.Router();
const LoginTime = require('../models/LoginTime'); // Import your LoginTime model

router.post('/', async (req, res) => {
    try {
        const newLoginTime = new LoginTime(req.body);
        await newLoginTime.save();
        res.status(201).json(newLoginTime);
    } catch (error) {
        res.status(500).json({ message: 'Error recording login time' });
    }
});

module.exports = router;