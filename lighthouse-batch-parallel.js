#!/usr/bin/env node

const lighthouseGenuis = require('.');
const program = require('commander');

const { throttlingOptions } = require('./assets/defaultConfig.js');

program
  .option('-n, --number <number>', 'Number of workers')
  .option('-a, --audits-config <path>', 'Custom audits config')
  .option('-t, --throttling <method>', 'Throttling Method');

program.parse(process.argv);

if (program.throttling && !throttlingOptions.includes(program.throttling)) {
  console.log(`Cannot understand provided throttling method, please provide property in one of [ ${throttlingOptions} ]`);
} else {
  lighthouseGenuis({ 
    inputFilePath:        program.args[0],
    workersNum:           program.number,
    customAuditsFilePath: program.auditsConfig,
    throttling:           program.throttling,
  });
}