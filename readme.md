# ~ staging.loopcast.fm
  
### requirements

 - git
 - node.js
 - make

### installing

````
make setup
````

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
