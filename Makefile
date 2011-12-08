all: backbrace backbrace-min testscript html-docs example-js

clean:
	rm backbrace.js test/test.js

backbrace: backbrace.coffee
	coffee -c backbrace.coffee

testscript:
	coffee -c test/test.coffee

backbrace-min: backbrace
	closure-compiler --js backbrace.js --js_output_file backbrace.min.js

html-docs: backbrace.coffee
	docco backbrace.coffee

example-js:
	coffee -c examples/*.coffee
