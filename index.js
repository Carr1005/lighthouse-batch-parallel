const fs = require('fs');
const cluster = require('cluster');

const csvParse = require('csv-parse/lib/sync');
const csvStringify = require('csv-stringify/lib/sync');
const {
  workersNum:         defaultWorkersNum,
  auditsNameTitleMap: defaultAudits,
  lighthouseConfig:   defaultLighthouseConfig,
  throttlingOptions,
  supportedInputFileTypes,
  supportedOutputStreamTypes,
} = require('./assets/defaultConfig.js');

const mobileSlow4G = require('./node_modules/lighthouse/lighthouse-core/config/constants.js').throttling.mobileSlow4G;

const EventEmitter = require('events');
class lighthouseBatchParallelEventEmitter extends EventEmitter {}
const lighthouseBatchParallelEvent = new lighthouseBatchParallelEventEmitter();

/**
  lighthouse result return both "title"(for display) and "name", we use name as key for mapping data later
*/
const categoriesNameTitleMap = {
  'performance':    'Performance',
  'accessibility':  'Accessibility',
  'best-practices': 'Best-practices',
  'seo':            'SEO',
  'pwa':            'PWA',
};

const inputColumnsHeader = ['Device', 'URL'];
module.exports.inputColumnsHeader = inputColumnsHeader;

/**
  use orderMap to record the index of each "name", lighthouse result 
  from target urls could use this index to find correct column.
*/
const orderMap = {};

module.exports.lighthouseBatchParallel = ({
  customAudits,
  input        = {},
  workersNum   = defaultWorkersNum,
  throttling   = throttlingOptions[0],
  outputFormat = supportedOutputStreamTypes[0],
} = {}) => {
  const auditsConfig = customAudits ? inputNormalizer(customAudits, 'auditsConfig') : defaultAudits;
  let lighthouseConfig = handeLighthouseConfig(defaultLighthouseConfig, throttling);

  Object.keys({ ...categoriesNameTitleMap, ...auditsConfig }).forEach((element, i) => {
    orderMap[element] = i + inputColumnsHeader.length;
  });

  cluster.setupMaster({ 
    exec: __dirname + '/worker.js',
  });
  if (cluster.isMaster) {
    masterTask({ input, outputFormat, workersNum, auditsConfig, lighthouseConfig })
  }
  return lighthouseBatchParallelEvent;
}

const handeLighthouseConfig = (defaultLighthouseConfig, throttling) => {
  let lighthouseConfig = { ...defaultLighthouseConfig };
  switch (throttling) {
    case 'simulated3G':
      break;
    case 'applied3G':
      lighthouseConfig['settings'] = {
        throttlingMethod: 'devtools',
        throttling:       mobileSlow4G,
      };
      break;
    case 'no':
      lighthouseConfig['passes'] = [{ 
        useThrottling: false,
      }]
      break;
    default:
      console.log('Unrecognized throttling method');
  }
  return lighthouseConfig;
}

const masterTask = ({ input, outputFormat, workersNum, auditsConfig, lighthouseConfig }) => {
  try {
    const auditTargets = inputNormalizer(input);
    if (auditTargets.length === 0) {
      console.log('Please make sure the input is correct');
      return;
    }
    const totalTasksNum = auditTargets.length;
    let leftTasksNum = totalTasksNum;

    const reportHeader = Object.values(auditsConfig);
    reportHeader.unshift(...Object.values(categoriesNameTitleMap));
    reportHeader.unshift(...inputColumnsHeader);
    
    cluster.on('online', (worker) => {
      if (outputFormat === supportedOutputStreamTypes[0] && auditTargets.length === totalTasksNum) {
        const headerRow = csvStringify([reportHeader], { delimiter: ',' });
        lighthouseBatchParallelEvent.emit('data', { 
          data:     headerRow,
          progress: {
            leftTasksNum,
            totalTasksNum,
          },
          header: true,
        });
      }
      deliverTask({ worker, outputFormat, auditTargets, reportHeader, lighthouseConfig });
    });

    cluster.on('message', (worker, { data, error, target }) => {
      leftTasksNum = leftTasksNum - 1;
      if (error) {
        lighthouseBatchParallelEvent.emit('error', { error });
      }

      lighthouseBatchParallelEvent.emit('data', {
        data,
        progress: {
          device: target[`${inputColumnsHeader[0]}`],
          url:    target[`${inputColumnsHeader[1]}`],
          leftTasksNum,
          totalTasksNum,
        },
        header: false,
      });

      /**
        reuse worker if there are still tasks.
      */
      if (auditTargets.length !== 0) {
        deliverTask({ worker, outputFormat, auditTargets, reportHeader, lighthouseConfig });
      } else {
        worker.kill();
      }
    });

    cluster.on('exit', () => {
      /**
        1.re-create worker if worker dies because of unexpected error instead of 
          being killed by worker.kill().
        2.'online' listener will handle the new worker then.
      */
      if (auditTargets.length !== 0) {
        cluster.fork();
      }
      if (Object.keys(cluster.workers).length === 0) {
        lighthouseBatchParallelEvent.emit('end');
      }
    });

    for (let i = 0; i < Math.min(workersNum, auditTargets.length); i++) {
      cluster.fork();
    }
  } catch (e) {
    console.log(e);
  }
}

const deliverTask = ({ worker, outputFormat, auditTargets, reportHeader, lighthouseConfig }) => {
  const newTask = auditTargets.shift();
  worker.send({ 
    target: newTask,
    outputFormat,
    reportHeader,
    lighthouseConfig,
    orderMap,
  });
};

const inputNormalizer = (input, usage) => {
  if (typeof input === 'object') {
    const { stream } = input;
    if (typeof stream === 'string') {
      if (usage === 'auditsConfig') {
        return auditsConfigCsvDeserializator(stream, false);
      } else {
        return inputCsvDeserializator(stream, false);  
      }
    } else if (typeof stream === 'object') {
      return stream;
    } else if (stream === undefined) {
      return [];
    }
  } else if (typeof input === 'string') {
    const fileType = (input.match(/[^\\/]+\.[^\\/]+$/) || []).pop().split('.')[1];
    if (supportedInputFileTypes.includes(fileType)) {
      switch(fileType) {
        case 'csv':
          if (usage === 'auditsConfig') {
            return auditsConfigCsvDeserializator(input, true);
          } else {
            return inputCsvDeserializator(input, true);  
          }
        case 'json':
          return jsonDeserializator(input);
        default:
          console.log('Unsupported file type');
      }
    }
  } else {
    console.log('Input should be a string of file path or an array of objects');
  }
}

const auditsConfigCsvDeserializator = (customAudits, isFile) => {
  try {
    const customAuditsStream = isFile ? fs.readFileSync(customAudits, { encoding: 'utf8' }) : customAudits;
    const audits = csvParse(customAuditsStream, {
      skip_empty_lines: true,
      trim:             true,
    });
    const customAuditsObject = {};
    audits.forEach(pairs => {
      customAuditsObject[pairs[0]] = pairs[1];
    });
    return customAuditsObject;
  } catch (e) {
    console.log(e);
  }
}

const inputCsvDeserializator = (input, isFile) => {
  const inputStream = isFile ? fs.readFileSync(input, { encoding: 'utf8' }) : input;
  return csvParse(inputStream, {
    columns:          true,
    skip_empty_lines: true,
    trim:             true,
  });
}

const jsonDeserializator = (input) => {
  const inputStream = fs.readFileSync(input, { encoding: 'utf8' });
  return JSON.parse(inputStream);
}