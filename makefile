# binaries
COFFEE   			= ./node_modules/.bin/coffee
NODEMON  			= ./node_modules/.bin/nodemon
LIVE_SPRITESHEET  	= ./node_modules/.bin/live-spritesheet

# shell assignments
BRANCH  = $(shell git rev-parse --abbrev-ref HEAD)

start:

  # with remote debug
	# DEBUG=app:* NODE_ENV=$(BRANCH) $(NODEMON) --debug --watch . -e coffee,jade ./src/app.coffee

	# without remote debug
	DEBUG=app:* NODE_ENV=$(BRANCH) $(NODEMON) 		--watch . -e coffee,jade,styl ./src/app.coffee


spritesheet:
	$(LIVE_SPRITESHEET) -c src/sprites/config.json