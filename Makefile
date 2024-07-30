.PHONY: install check fix build publish

install: node_modules pnpm-lock.yaml

node_modules: package.json
	pnpm i

pnpm-lock.yaml: package.json
	pnpm up

check: install
	pnpm check

fix: install
	pnpm fix

build: check
	pnpm build

publish: build
	pnpm publish
