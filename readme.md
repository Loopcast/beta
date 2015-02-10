# ~ beta.loopcast.fm


### requirements

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


### developing frontend

````
make client
````

Then edit files on ````src/frontend````, note that jade files are actually being rendered by the backend.

They are on the frontend folder just for convenience while developing the templates, which are deeply connected with scripts and stlesheets which are pre-compiled for every release.


### building frontend for release

````
make client-release
````