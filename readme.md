# ~ staging.loopcast.fm

### requirements

 - git
 - node.js
 - make

### installing

````
make setup
mkdir node_modules/polvo/node_modules/socket.io/node_modules/
cp -rv node_modules/polvo/node_modules/socket.io-client/ node_modules/polvo/node_modules/socket.io/node_modules/socket.io-client
````

On Ubuntu 16.04:

```
sudo apt-get install coffeescript
```

If you are getting errors regarding undefined `process.EventEmitter` it means
you are running too fresh node.js for the app, then you can apply a hotfix by
running:

```
rpl -R 'process.EventEmitter' "require('events').EventEmitter" node_modules/
```

(of course do `brew install rpl` or `sudo apt-get install rpl` first).

### running server

````
make start
````

Then browse [http://localhost:1993](http://localhost:1993)

### developing frontend

````
make client
````

Then edit files on ````src/frontend````, note that .jade templates are actually being rendered by the backend.

They are on the frontend folder just for convenience while developing the templates, which are deeply connected with scripts and stylesheets which are pre-compiled for every release.


### building frontend for release

````
make release
````

### publishing to [http://development.loopcast.fm](http://development.loopcast.fm)

````
git push origin development
````
