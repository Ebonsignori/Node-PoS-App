const router = require('express').Router();

router.use('/menu', require('./menu'));
router.use("/menu/category", require("./menu_category"));

module.exports = router;