#!/usr/bin/env node

const lighthouseGenuis = require('.');
const program = require('commander');

program
  .option('-n, --number <number>', 'Number of workers')
  .option('-a, --audits-config <path>', 'Custom audits config');

program.parse(process.argv);

lighthouseGenuis({ 
  inputFilePath:        program.args[0],
  workersNum:           program.number,
  customAuditsFilePath: program.auditsConfig
});