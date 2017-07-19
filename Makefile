REPORTER = spec

all: jshint test

jshint:
	jshint lib examples index.js

tests: test

tap:
	@NODE_ENV=test ./node_modules/.bin/mocha -R tap > results.tap

unit:
	@NODE_ENV=test ./node_modules/.bin/mocha --recursive -R xunit > results.xml --timeout 3000

skel:
	mkdir examples lib test
	touch index.js
	npm install mocha chai --save-dev

.PHONY: test tap unit jshint skel