const router = require('express').Router();

router.use('/menu', require('./menu'));

module.exports = router;