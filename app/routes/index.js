const router = require('express').Router();

router.use("/menu/category", require("./menu_category"));
router.use('/menu', require('./menu'));

module.exports = router;