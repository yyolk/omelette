
build: components
	@component build --dev

components: component.json
	@component install --dev

clean:
	rm -fr build components template.js

.PHONY: clean


run:
	@node server

article:
	@./create-article.sh

work:
	@./create-work.sh

recent:
	@node recent > recent.txt