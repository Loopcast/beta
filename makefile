# bin
COFFEE   			   = ./node_modules/.bin/coffee
NODEMON  			   = ./node_modules/.bin/nodemon
POLVO   			   = ./node_modules/.bin/polvo
LIVE_SPRITESHEET = ./node_modules/.bin/live-spritesheet

# shell
BRANCH  = $(shell git rev-parse --abbrev-ref HEAD)

start:

  # with remote debug
	# DEBUG=app:* GIT_BRANCH=$(BRANCH) $(NODEMON) --debug --watch . -e coffee,jade ./src/app.coffee

	# without remote debug
	DEBUG=app:* GIT_BRANCH=$(BRANCH) $(NODEMON)	--watch . -e coffee,jade ./src/app.coffee

# install modules and forks needed to compile frontend code
setup:
	npm install
	rm -rf node_modules/polvo/node_modules/polvo-stylus
	cd node_modules/polvo/node_modules/ && git clone https://github.com/hems/polvo-stylus
	cd node_modules/polvo/node_modules/polvo-stylus/ && npm install

# watch frontend using polvo
client:
	$(POLVO) -ws

# action to be executed before releasing the app
release:
	# compile frontend javascript and css
	$(POLVO) -r

spritesheet:
	$(LIVE_SPRITESHEET) -c src/frontend/sprites/config.json