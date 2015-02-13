# ~ beta.loopcast.fm

[ ![Codeship Status for Loopcast/beta](https://codeship.com/projects/0663b7f0-9522-0132-d4fc-466960a0e7d2/status?branch=development)](https://codeship.com/projects/62741)

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
make client-release
````
