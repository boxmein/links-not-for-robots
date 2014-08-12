// The entry point to the web-app.
var express = require('express')
  , http    = require('http')
  , path    = require('path')
  , logfmt  = require('logfmt')
  , bodyparser = require('body-parser')
  , crypto = require('crypto')
  , Recaptcha = require('recaptcha').Recaptcha
  , private_data = require('./PRIVATE_DATA.json');;

var app = express();
// App configuration

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname,'views'));
app.engine('jade', require('jade').__express);

// POST data
app.use(bodyparser.urlencoded({ extended: true }));

// Logging
app.use(logfmt.requestLogger());

// Static stuff like stylesheets
app.use(express.static(path.join(__dirname, 'public')));

// Index page!
app.get('/', function(req, res) {
  return res.render('index.jade');
});

// We got linked to!
app.get('/l/:link', function(req, res) {
  var rc = new Recaptcha(private_data.recaptcha_public_key,
                         private_data.recaptcha_private_key);
  res.render('link-notok.jade', {
    'recaptcha_form': rc.toHTML()
  });
});

app.post('/l/:link', function(req, res) {
  
  var data = {
    remoteip:  req.connection.remoteAddress,
    challenge: req.body.recaptcha_challenge_field,
    response:  req.body.recaptcha_response_field
  };

  // Check the reCAPTCHA for validity, send the page if ok
  var rc = new Recaptcha(private_data.recaptcha_public_key, 
                         private_data.recaptcha_private_key, data);

  rc.verify(function(success, error_code) {
    if (success) {
      try {
        var decr = crypto.createDecipher('aes192', 
                   new Buffer(private_data.link_private_key));
        var link = decr.update(req.params.link, 'base64', 'utf-8') + decr.final('utf-8');
        res.render('link-ok.jade', {
          'link': link
        });
      }
      catch (err) {
        console.log(err.stack);
        res.redirect('/l/'+req.params.link+'?err=decrypt');
      }
    }
    else {
      res.redirect('/l/'+req.params.link+'?err=captcha_fail');
    }
  });

});

// Create your own link
app.get('/make', function(req, res) {
  var rc = new Recaptcha(private_data.recaptcha_public_key, 
                         private_data.recaptcha_private_key);
  res.render('make.jade', {  
    'captcha': rc.toHTML(),
    'err': req.query.err || false
  });
});

app.post('/make', function(req, res) {
  
  if (!req.body || 
      !req.body.link) {
    res.redirect('/make?err=empty');
  }

  if (!req.body.recaptcha_challenge_field || 
      !req.body.recaptcha_response_field) {
    res.redirect('/make?err=captcha_empty');
  }

  var data = {
    remoteip:  req.connection.remoteAddress,
    challenge: req.body.recaptcha_challenge_field,
    response:  req.body.recaptcha_response_field
  };

  // Check the reCAPTCHA for validity, send the page if ok
  var rc = new Recaptcha(private_data.recaptcha_public_key, 
                         private_data.recaptcha_private_key, data);

  rc.verify(function(success, error_code) {
    // if the CAPTCHA went okay, work the encrypting part and send the link
    // to the user.

    // Otherwise, ask them for the link and captcha again!

    if (success) {

      var link = req.body.link; 
      // Encrypt
      var encr = crypto.createCipher('aes192', 
        new Buffer(private_data.link_private_key));
      var encrypted = encr.update(link, 'utf-8', 'base64') + encr.final('base64');

      res.render('make-result.jade', {
        'encrypted': encrypted
      });

    } else {
      res.redirect('/make?err=captcha_fail');
    }
  });
})

app.listen(app.get('port'));