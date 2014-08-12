var express = require('express')
  , http    = require('http')
  , path    = require('path')
  , logfmt  = require('logfmt')
  , bodyparser = require('body-parser')
  , Blowfish = require('blowfish')
  , Recaptcha = require('recaptcha').Recaptcha
  , private_data = require('./PRIVATE_DATA.json');;

var app = express();

var bf = new Blowfish(private_data.link_private_key);
// App configuration

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname,'views'));
app.engine('jade', require('jade').__express);

// POST formats
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(logfmt.requestLogger());

// Static site data
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
  return res.render('index.jade');
});

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
  
  try {
    var link = bf.decrypt(req.params.link);
  }
  catch (err) {
    res.render('err.jade', { 
      'errname': err.name 
    });
  }
  // Check the reCAPTCHA for validity, send the page if ok
  var rc = new Recaptcha(private_data.recaptcha_public_key, 
                                private_data.recaptcha_private_key, data);

  rc.verify(function(success, error_code) {
    if (success) {
      res.render('link-ok.jade', {
        'link': link
      });
    }
    else {
      // Redisplay the form.
      res.render('link-notok.jade', {
        'recaptcha_form': rc.toHTML()
      });
    }
  });

});

app.get('/make', function(req, res) {
  var rc = new Recaptcha(private_data.recaptcha_public_key, 
                         private_data.recaptcha_private_key);
  res.render('make.jade', {  
    'captcha': rc.toHTML() 
  });
});

app.post('/make', function(req, res) {
  
  if (!req.body || 
      !req.body.link ||
      !req.body.recaptcha_challenge_field ||
      !req.body.recaptcha_response_field) {
    res.render('err.jade', {
      'errname': 'no form data sent!'
    });
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
    if (success) {
      var link = req.body.link; 
      console.log('got link', link);
    
      var encrypted = bf.encrypt(link);
      console.log('encrypted link', encrypted);
      
      res.render('make-result.jade', {
        'encrypted': encrypted
      });
    } else {
      var rc = new Recaptcha(private_data.recaptcha_public_key, 
                         private_data.recaptcha_private_key);
      res.render('make.jade', {  
        'captcha': rc.toHTML() 
      });
    }
  });
})

app.listen(app.get('port'));