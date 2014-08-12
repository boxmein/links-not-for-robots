# links not for robots

wanna send a link you don't want robots to browse? or the NSA? use this handy 
website to block robots from entering!

oh, and as an extra, links will work forever, since link data is literally kept
inside the URL (except it's encrypted with symmetrical magic, so only this site 
can decipher it, unless you can get to the private key... :\^)

therefore, this does not serve as an URL shortener, rather an URL obfuscator. 

## Use the web app

Use the [link creator][create] to make your own link, and then just copy the link
to wherever you want it! You can optionally also pass it through an URL shortener
to make the long clumsy link shorter.

[create]: /make

## Run your own clone

Before you can run this web app, you have to give it some *very* secret data! 
Namely, your [reCAPTCHA private and public keys][re], and a 
[custom private key for links][random].

The keys are stored in a JSON file, which is called PRIVATE_DATA.json (quaint, 
huh) and should *not* be posted publicly. An example private data file has been 
provided. Your job is to fill in the keys.

    $ cp PRIVATE_DATA.json.example PRIVATE_DATA.json
    $ $EDITOR PRIVATE_DATA.json

Running this program is simple: 

    $ npm install && node index.js

, where `npm` is the Node Package Manager. You ought to also have the 
[Node.js][node] runtime. 

[node]: http://nodejs.org
[re]: https://www.google.com/recaptcha/admin#list
[random]: http://www.random.org/strings/?num=5&len=20&digits=on&upperalpha=on&loweralpha=on&unique=off&format=plain&rnd=new

## More help

Have questions? Found a bug? Mail me at wsdf294@gmail.com, or simply leave an issue 
in the [issue tracker](https://github.com/boxmein/links-not-for-robots/issues).