const express = require('express');
const router = express.Router();

// Example route
router.get('/history', (req, res) => {
  res.send('History route working!');
});

module.exports = router;
