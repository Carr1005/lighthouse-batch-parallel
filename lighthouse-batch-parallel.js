#!/usr/bin/env node
const fs = require('fs');
const { lighthouseBatchParallel } = require('.');
const program = require('commander');

const {
  createOutputDir,
  consoleLogger,
  errorLogger,
  calculateElapsedTime,
} = require('./utils.js');

const {
  throttlingOptions,
  supportedOutputFileTypes,
} = require('./assets/defaultConfig.js');

program
  .option('-n, --number <number>', 'Number of workers')
  .option('-a, --audits-config <path>', 'Custom audits config')
  .option('-t, --throttling <method>', 'Throttling Method')
  .option('-p, --path <path>', 'The location of output file')
  .option('-f, --file-name <name>', 'The name of output file')
  .option('-o, --output-format <format>', 'The output format')
  .option('-l, --log-mode', 'Log progress of process')
  .option('-e, --error-log-file', 'Record error');

program.parse(process.argv);

if (program.throttling && !throttlingOptions.includes(program.throttling)) {
  console.log(`Cannot process provided throttling method, please provide property in one of [ ${throttlingOptions} ]`);
  return;
}

const defaultErrLogDirName = 'errorLog';
const clock = new Date();
const genDateTime = new Date(clock.getTime() - (clock.getTimezoneOffset() * 60000)).toISOString().slice(0, 19);

let outputPath;
let outputFileName;
let outputFileFormat;
let writeStream;
let errLogWriteStream = {};

if (program.path) {
  createOutputDir(program.path);
  outputPath = program.path;
} else {
  const defaultOutputDirName = 'output';
  createOutputDir(defaultOutputDirName);
  outputPath = `./${defaultOutputDirName}`;
}

if (program.fileName) {
  outputFileName = program.fileName.split('.')[0];
  const fileFormat = program.fileName.split('.')[1];
  if (fileFormat) {
    outputFileFormat = fileFormat;
  }
} else {
  outputFileName = genDateTime;
}

if (program.outputFormat && !outputFileFormat) {
  outputFileFormat = program.outputFormat;
}

if (outputFileFormat && !supportedOutputFileTypes.includes(outputFileFormat)) {
  console.log(`Cannot process provided file format for output file, please provide format in one of [ ${supportedOutputFileTypes} ]`);
  return;
}

if (!outputFileFormat) {
  outputFileFormat = supportedOutputFileTypes[0];
}

writeStream = fs.createWriteStream(`${outputPath}/${outputFileName}.${outputFileFormat}`, { flags: 'ax' });

writeStream.on('error', (error) => {
  console.log(error);
});

writeStream.on('open', () => {
  const startTime = Date.now();
  if (outputFileFormat === supportedOutputFileTypes[1]) {
    writeStream.write('[');
  }

  if (program.errorLogFile) {
    createOutputDir(defaultErrLogDirName);
    errLogWriteStream = fs.createWriteStream(`./${defaultErrLogDirName}/${genDateTime}-error-log.${outputFileFormat}`, { flags: 'ax' });  
  }

  const lighthouseAuditing = lighthouseBatchParallel({
    input:        program.args[0],
    customAuduts: program.auditsConfig,
    throttling:   program.throttling,
    outputFormat: outputFileFormat,
    workersNum:   program.number,
  });

  lighthouseAuditing.on('data', ({ data, progress, header }) => {
    const { device, url, totalTasksNum, leftTasksNum } = progress;
    consoleLogger(program.logMode && !header, `Device = ${device} || URL = ${url}`);  
    consoleLogger(program.logMode, `Total: ${totalTasksNum} || Remain: ${leftTasksNum}`);  
    if (outputFileFormat === supportedOutputFileTypes[1] && leftTasksNum !== 0) {
      data+=',';
    }
    writeStream.write(data);
  });

  lighthouseAuditing.on('error', ({ error }) => {
    errorLogger(program.errorLogFile, () => errLogWriteStream.write(error));
  });

  lighthouseAuditing.on('end', () => {
    const { seconds, minutes } = calculateElapsedTime(startTime);
    consoleLogger(program.logMode, `Total time to accomplish all tasks: ${minutes} minutes ${seconds} seconds`); 
    if (outputFileFormat === supportedOutputFileTypes[1]) {
      writeStream.write(']');
    }
    writeStream.end();
    errorLogger(program.errorLogFile, () => errLogWriteStream.end());
  });
});