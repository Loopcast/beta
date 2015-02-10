# binaries
COFFEE   			   = ./node_modules/.bin/coffee
NODEMON  			   = ./node_modules/.bin/nodemon
POLVO   			   = ./node_modules/.bin/polvo
LIVE_SPRITESHEET = ./node_modules/.bin/live-spritesheet

# shell assignments
BRANCH  = $(shell git rev-parse --abbrev-ref HEAD)

start:

  # with remote debug
	# DEBUG=app:* NODE_ENV=$(BRANCH) $(NODEMON) --debug --watch . -e coffee,jade ./src/app.coffee

	# without remote debug
	DEBUG=app:* NODE_ENV=$(BRANCH) $(NODEMON)	--watch . -e coffee,jade ./src/app.coffee

setup:
	npm install
	rm -rf node_modules/polvo/node_modules/polvo-stylus
	# cd node_modules/polvo/node_modules/ && git clone https://github.com/hems/polvo-stylus
	# cd node_modules/polvo/node_modules/polvo-stylus/ && npm install

client:
	$(POLVO) -ws

client-release:
	$(POLVO) -r

spritesheet:
	$(LIVE_SPRITESHEET) -c src/sprites/config.json