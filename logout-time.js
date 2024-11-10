const express = require('express');
const router = express.Router();
const LogoutTime = require('../models/LogoutTime'); // Import your LogoutTime model

router.post('/', async (req, res) => {
    try {
        const newLogoutTime = new LogoutTime(req.body);
        await newLogoutTime.save();
        res.status(201).json(newLogoutTime);
    } catch (error) {
        res.status(500).json({ message: 'Error recording logout time' });
    }
});

module.exports = router;