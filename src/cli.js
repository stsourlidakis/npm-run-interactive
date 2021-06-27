#!/usr/bin/env node

const fs = require('fs');
const util = require('util');
const { prompt } = require('enquirer');
const hasYarn = require('has-yarn');
const spawn = util.promisify(require('child_process').spawn);

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
		name: script,
		value: script,
		searchStr: `"${script}": "${command}"`,
	}));

	let response;

	try {
		response = await prompt({
			type: 'autocomplete',
			name: 'script',
			message: 'Pick a script to run',
			limit: 20,
			choices: scriptChoices,
			suggest: (input, choices) =>
				choices.filter((choice) =>
					choice.searchStr.toLowerCase().includes(input.trim().toLowerCase())
				),
		});
	} catch (error) {
		console.error(error);
		response = {};
	}

	if (!response.script) {
		console.log('No script selected, exiting');
		return;
	}

	await spawn(hasYarn() ? 'yarn' : 'npm', ['run', response.script], {
		stdio: 'inherit',
	});
})();
