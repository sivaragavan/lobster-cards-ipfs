var express = require('express');
var router = express.Router();

const ipfsAPI = require('ipfs-api');

// Connecting to the ipfs network via infura gateway
const ipfs = ipfsAPI('ipfs.infura.io', '5001', { protocol: 'https' })

const upload = require('../uploadMiddleware');

const Web3 = require('web3')
const provider = new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/02754071220c49e1b2bfeb1eb905af88')
const web3 = new Web3(provider)

const axios = require('axios');

const IPFS_URL = "https://ipfs.infura.io/ipfs/";
const CREATE = "0x01"
const LIKE = "0x02"
const DISLIKE = "0x03"

router.get('/:key', function (req, res, next) {
  const private_key = req.params.key;
  var account = web3.eth.accounts.privateKeyToAccount(private_key);
  console.log(account.address)
  var signature = web3.eth.accounts.sign('Lobsters', private_key);
  var recovered = web3.eth.accounts.recover(signature);

  if (recovered == account.address) {
    const url = "http://api-ropsten.etherscan.io/api?module=account&action=txlist&startblock=0&endblock=99999999&sort=asc&apikey=YourApiKeyToken&address=" + account.address;
    axios.get(url)
      .then(function (response) {


     // loop through past txs and check if image is created
     const txs = response.data.result;
     const dataLength = txs.length;
     var hasImage = false;
     for (var i = 0; i < dataLength; i++) {
       const tx = txs[i];
       console.log("tx.input:", tx.input);
       if (tx.input !== null && tx.input !== undefined) {
         hasImage = true;
         break;
       }
     }
        if (hasImage === false) {
          res.render('upload', { private_key: private_key });
        } else {
          var numLikes = 0;
          var numDislikes = 0;
          var hash = null;
          for (var i = 0; i < dataLength; i++) {
            const tx = txs[i];
            console.log("tx", tx);
            if (tx.input === LIKE) {
              numLikes++;
            } else if (tx.input == DISLIKE) {
              numDislikes++;
            } else if (tx.input !== null && tx.input !== undefined) {
              if (hash !== null) {
                console.log("MULTIPLE NON NULL HASHES SEEN IN DATA");
              }
              console.log("Hash:", hash);
              hash = web3.utils.hexToAscii(tx.input);
            }
          }
          var fileUrl = IPFS_URL + hash;
          console.log("numLikes:", numLikes, "numDislikes:", numDislikes);
          res.render('view', { url: fileUrl, numLikes: numLikes, numDislikes: numDislikes });
        }
      })
      .catch(function (error) {
        console.log(error);
      })
  } else {
    res.render('message', { message: 'Invalid Signature' });
  }
});


/* GET home page. */
router.post('/:key', upload.single('image'), function (req, res, next) {
  const private_key = req.params.key;
  var account = web3.eth.accounts.privateKeyToAccount(private_key);
  const buffer = req.file.buffer;
  ipfs.files.add(buffer, function (err, file) {
    if (err) {
      console.log(err);
    } else {
      var hash = file[0].hash;
      console.log(hash)
      const strHexHash = web3.utils.asciiToHex(hash);
      const backToAscii = web3.utils.hexToAscii(strHexHash);

      console.log("hash:", hash, "strHexHash:", strHexHash, "backToAscii:", backToAscii);
      const rawTransaction = {
        "from": account.address,
        "to": account.address,
        "gas": 50000,
        "data": strHexHash,
      };

      account.signTransaction(rawTransaction)
        .then(signedTx => web3.eth.sendSignedTransaction(signedTx.rawTransaction))
        .then(receipt => console.log("Transaction receipt: ", receipt))
        .catch(err => console.error(err));

      var fileUrl = IPFS_URL + hash
      res.render('view', { url: fileUrl });
    }
  });
});

router.post('/like/:isLike', function (req, res, next) {
  const isLike = req.params.isLike;
  if (req.params.isLike) { // req.params.isLike === true ?
      const rawTransaction = {
        "from": account.address,
        "to": account.address,
        "gas": 50000,
        "data": LIKE,
      };

      account.signTransaction(rawTransaction)
        .then(signedTx => web3.eth.sendSignedTransaction(signedTx.rawTransaction))
        .then(receipt => console.log("Transaction receipt: ", receipt))
        .catch(err => console.error(err));

  } else {
      const rawTransaction = {
        "from": account.address,
        "to": account.address,
        "gas": 50000,
        "data": DISLIKE,
      };

      account.signTransaction(rawTransaction)
        .then(signedTx => web3.eth.sendSignedTransaction(signedTx.rawTransaction))
        .then(receipt => console.log("Transaction receipt: ", receipt))
        .catch(err => console.error(err));

  }
});

module.exports = router;
