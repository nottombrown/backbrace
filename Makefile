all: backbrace backbrace-min testscript docs

clean:
	rm backbrace.js test/test.js

backbrace:
	coffee -c backbrace.coffee

testscript:
	coffee -c test/test.coffee

backbrace-min: backbrace
	echo

docs:
	echo
