var express = require('express');
var router = express.Router();

const ipfsAPI = require('ipfs-api');

// Connecting to the ipfs network via infura gateway
const ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})

const upload = require('../uploadMiddleware');

const Web3 = require('web3')
const provider = new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/02754071220c49e1b2bfeb1eb905af88')
const web3 = new Web3(provider)

const IPFS_URL = "https://ipfs.infura.io/ipfs/";

let video;

router.get('/:key', function (req, res, next) {
  const private_key = req.params.key;
  var account = web3.eth.accounts.privateKeyToAccount(private_key);
  var signature = web3.eth.accounts.sign('Lobsters', private_key);
  var recovered = web3.eth.accounts.recover(signature);

  if (recovered == account.address) {
    // Use account.address to get ipfs hash
    res.render('upload', { private_key : private_key });
  } else {
    res.render('message', { message: 'Invalid Signature' });
  }
});


/* GET home page. */
router.post('/:key', upload.single('image'), function (req, res, next) {
  console.log('file:', req.file);
  const buffer = req.file.buffer;
  ipfs.files.add(buffer, function (err, file) {
    if (err) {
      console.log(err);
    } else {
      console.log(file)
      var hash = file[0].hash;
      var fileUrl = IPFS_URL + hash
      res.render('view', { url : fileUrl });
    }
  });
});

module.exports = router;
