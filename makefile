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
	DEBUG=app:* GIT_BRANCH=$(BRANCH) $(NODEMON)	--watch . --ignore ./src/frontend/ --ignore ./src/templates/ -e coffee,jade ./src/app.coffee

# install modules and forks needed to compile frontend code
setup:
	npm install
	rm -rf node_modules/polvo/node_modules/polvo-stylus
	cd node_modules/polvo/node_modules/ && git clone https://github.com/hems/polvo-stylus
	cd node_modules/polvo/node_modules/polvo-stylus/ && npm install
	mkdir -p node_modules/polvo/node_modules/socket.io/node_modules
	cp -r node_modules/polvo/node_modules/socket.io-client node_modules/polvo/node_modules/socket.io/node_modules

	#@mkdir -p node_modules/polvo/node_modules/socket.io/node_modules/
	#@cp -R node_modules/socket.io-client node_modules/polvo/node_modules/socket.io/node_modules/socket.io-client
debug:
	coffee --nodejs --debug ./src/app.coffee

# watch frontend using polvo
client:
	$(POLVO) -ws

# action to be executed before releasing the app
release:
	# compile frontend javascript and css
	ENV=production $(POLVO) -r

spritesheet:
	$(LIVE_SPRITESHEET) -c src/frontend/sprites/config.json

# force deploy from current development version into staging environment
deploy_staging:
	# https://git.heroku.com/staging-loopcast-fm.git
	# git push origin development:staging -f
	git push heroku-staging staging:master -f

deploy_beta:
	# https://git.heroku.com/beta-loopcast-fm.git
	git push heroku staging:master -f

deploy_beta_latest:
	git stash
	git pull origin development
	# ignore if build and commit doesnt happen properly
	# because the stash apply has to happen anyway.
	@make build_commit
	@make deploy_beta
	git stash apply

build_commit:
	make release
	git add public/js/app.js
	git add public/css/app.css
	git commit -m 'latest compiled frontend'

logs_beta:
	# heroku logs --app beta-loopcast-fm
	heroku logs --app beta-loopcast-fm --ps web --tail

logs_staging:
	# heroku logs --app staging-loopcast-fm
	heroku logs --app staging-loopcast-fm --ps web --tail
