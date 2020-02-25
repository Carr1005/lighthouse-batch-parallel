const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');

const csvParse = require('csv-parse/lib/sync');
const csvStringify = require('csv-stringify/lib/sync');

const { inputColumnsHeader } = require('.');
const { supportedOutputStreamTypes } = require('./assets/defaultConfig.js');

/**
  this is necessary to handle the situation auditing fails, besides lighthouse instance
  will throw error (which be handled and may be passed to err log), the worker of cluster
  will throw an error at the same time, if this error is not handled here, the worker would
  malfunction and cannot accept new task which would lead the situation that tasks are not
  completely processed.
*/

process.on('uncaughtException', (err) => {
  console.log(err);
});

process.on('message', ({
  target,
  reportHeader,
  outputFormat,
  lighthouseConfig,
  orderMap
}) => {
  (async() => {
    let browser;
    const resultRow = [target[`${inputColumnsHeader[0]}`], target[`${inputColumnsHeader[1]}`]];
    const resultObject = {
      data:  undefined,
      error: undefined,
      target,
    };

    try {
      browser = await puppeteer.launch({
        executablePath:  puppeteer.executablePath(),
        headless:        true,
        args:            ['--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: null,
      });

      const lighthousePort = new URL(browser.wsEndpoint()).port;
      lighthouseConfig.emulatedFormFactor = target[`${inputColumnsHeader[0]}`];
      const { lhr } = await lighthouse(target[`${inputColumnsHeader[1]}`], { port: lighthousePort }, lighthouseConfig);
      const csv = generateReportCSV(lhr);
      const csvParseResult = csvParse(csv, {
        columns:          true,
        skip_empty_lines: true,
        trim:             true,
      });

      csvParseResult.forEach(item => {
        let position = orderMap[item.name];
        if (position !== undefined) {
          resultRow[position] = item.displayValue;  
        }
      });

      Object.keys(lhr.categories).forEach(categoryKey => {
        let position = orderMap[categoryKey];
        resultRow[position] = lhr.categories[categoryKey].score;
      });
    } catch (e) {
      if (outputFormat === supportedOutputStreamTypes[0]) {
        const errorPairs = [resultRow[0], resultRow[1]];
        Object.entries(e).forEach(([key, value]) => {
          errorPairs.push(key, value);
        });
        const errResult = csvStringify([errorPairs], { delimiter: ',' });
        resultObject.error = errResult;
      } else if (outputFormat === supportedOutputStreamTypes[1]) {
        resultObject.error = JSON.stringify(jsObjectErrorResultGenerator({ resultRow, reportHeader, error: e }));
      } else if (outputFormat === supportedOutputStreamTypes[2]) {
        resultObject.error = jsObjectErrorResultGenerator({ resultRow, reportHeader, error: e });
      }
    } finally {
      browser.disconnect();
      browser.close();
      if (outputFormat === supportedOutputStreamTypes[0]) {
        resultObject.data = csvStringify([resultRow], { delimiter: ',' });
      } else if (outputFormat === supportedOutputStreamTypes[1]) {
        resultObject.data = JSON.stringify(jsObjectResultGenerator({ resultRow, reportHeader, orderMap }));
      } else if (outputFormat === supportedOutputStreamTypes[2]) {
        resultObject.data = jsObjectResultGenerator({ resultRow, reportHeader, orderMap });
      }
      process.send(resultObject);
    }
  })();
});

const jsObjectResultGenerator = ({ resultRow, reportHeader, orderMap }) => {
  let jsObject = {};
  jsObject[reportHeader[0]] = resultRow[0];
  jsObject[reportHeader[1]] = resultRow[1];
  let auditObject = {};
  Object.keys(orderMap).forEach(auditKey => {
    auditObject[auditKey] = {
      title: reportHeader[orderMap[auditKey]],
      score: resultRow[orderMap[auditKey]],
    };
  });
  jsObject.audits = auditObject;
  return jsObject;
}

const jsObjectErrorResultGenerator = ({ resultRow, reportHeader, error }) => {
  let jsObject = {};
  jsObject[reportHeader[0]] = resultRow[0];
  jsObject[reportHeader[1]] = resultRow[1];
  jsObject['error'] = error;
  return jsObject;
}

const normalizeResult = (value) => {
  const matchNumber = /\d+/.exec(value);
  return /^-?\d+/.test(value) ? value :
    matchNumber ? `${value.slice(matchNumber.index)} (${value.slice(0, matchNumber.index - 1)})` : value;
}

/** 
  This function is copied and revised from node_modules/lighthouse/lighthouse-core/repoert/report-generator.js
*/
const generateReportCSV = (lhr) => {
  /**
    To keep things "official" we follow the CSV specification (RFC4180)
    The document describes how to deal with escaping commas and quotes etc.
  */
  const CRLF = '\r\n';
  const separator = ',';
  const escape = value => `"${value.replace(/"/g, '""')}"`;
  const header = ['category', 'name', 'title', 'type', 'score', 'displayValue'];
  const table = Object.values(lhr.categories).map(category => {
    return category.auditRefs.map(auditRef => {
      const audit = lhr.audits[auditRef.id];
      /**
        CSV validator wants all scores to be numeric, use -1 for now
      */
      const numericScore = audit.score === null ? -1 : audit.score;
      return [category.title, audit.id, audit.title, audit.scoreDisplayMode, numericScore, audit.displayValue || numericScore]
        .map(value => value.toString())
        .map(value => normalizeResult(value))
        .map(escape);
    });
  });
  return [header].concat(...table).map(row => row.join(separator)).join(CRLF);
}