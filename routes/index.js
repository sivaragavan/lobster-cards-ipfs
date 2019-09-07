var express = require('express');
var router = express.Router();

let video;
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('message', { message: 'Welcome! Please scan a lobster card to get started!' });
});

module.exports = router;
