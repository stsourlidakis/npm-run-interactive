#!/usr/bin/env node

const fs = require('fs');
const prompts = require('prompts');
const execa = require('execa');
const hasYarn = require('has-yarn');

(async function main() {
	const packagePath = `${process.cwd()}/package.json`;

	if (!fs.existsSync(packagePath)) {
		console.error('package.json not found in this directory');
		process.exit(1);
	}

	const { scripts } = require(packagePath);

	if (!scripts || Object.keys(scripts).length === 0) {
		console.error('No scripts available in package.json');
		process.exit(1);
	}

	const scriptChoices = Object.entries(scripts).map(([script, command]) => ({
		title: `"${script}": "${command}"`,
		value: script,
	}));

	const response = await prompts({
		type: 'autocomplete',
		name: 'script',
		message: 'Pick a script to run',
		limit: 20,
		choices: scriptChoices,
		suggest: (input, choices) =>
			Promise.resolve(
				choices.filter((choice) =>
					choice.title.toLowerCase().includes(input.trim().toLowerCase())
				)
			),
	});

	if (!response.script) {
		console.log('No script selected, exiting');
		return;
	}

	try {
		await execa(hasYarn() ? 'yarn' : 'npm', ['run', response.script]).stdout.pipe(
			process.stdout
		);
	} catch (error) {
		console.log(error);
	}
})();
