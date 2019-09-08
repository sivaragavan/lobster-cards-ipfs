var express = require('express');
var router = express.Router();

let video;
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('message', { message: 'Please find and scan a Lobster Card to get started.' });
});

module.exports = router;
