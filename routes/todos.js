var express = require("express");
var router = express.Router();

router.post('/message', (req, res) => {

  // Start our TwiML response.
  var msgBody = req.body.Body;
  var fromNumber = req.body.From;
  parseMessage(msgBody, fromNumber, res);
});


module.exports = router;
