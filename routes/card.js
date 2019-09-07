var express = require('express');
var router = express.Router();

const Web3 = require('web3')
const provider = new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/02754071220c49e1b2bfeb1eb905af88')
const web3 = new Web3(provider)

let video;

router.get('/:key', function (req, res, next) {
  const private_key = req.params.key;
  var account = web3.eth.accounts.privateKeyToAccount(private_key);
  var signature = web3.eth.accounts.sign('Lobsters', private_key);
  var recovered = web3.eth.accounts.recover(signature);

  if (recovered == account.address) {
    // Use account.address to get ipfs hash
    res.render('upload', { private_key :  private_key});
  } else {
    res.render('message', { message: 'Invalid Signature' });
  }
});


/* GET home page. */
router.post('/:key', function (req, res, next) {
  file = req.body.file;
  console.log(file);
  res.render('view', { url :  "https://ipfs.infura.io/ipfs/QmRHDjZC6ZgkDwdKP2b2N984ckhhs2yKehLSz7NmeZv7Rn"});
});

module.exports = router;
