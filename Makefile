BIN=node_modules/.bin/

.PHONY: all tsc browserify

all: browserify
browserify: tsc
	$(BIN)/browserify -t babelify out/example/browser/index.js > example/index.js     
tsc:
	$(BIN)/tsc -p .
