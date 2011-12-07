all: backbrace backbrace-min testscript html-docs

clean:
	rm backbrace.js test/test.js

backbrace: backbrace.coffee
	coffee -c backbrace.coffee

testscript:
	coffee -c test/test.coffee

backbrace-min: backbrace
	echo

html-docs: backbrace.coffee
	docco backbrace.coffee
