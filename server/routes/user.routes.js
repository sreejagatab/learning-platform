const express = require('express');
const router = express.Router();

// Example route
router.get('/users', (req, res) => {
  res.send('User route working!');
});

module.exports = router;
