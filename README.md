# lighthouse-batch-parallel

> :warning: **Running Lighthouse concurrently is not recommended** according to this [reply from Lighthouse team](https://github.com/GoogleChrome/lighthouse/issues/7104#issuecomment-458368476). Be careful when you want to give [workersNum](#workersNum-optional) argument.

<br>

This is a module to help collect multiple websites' performance data under [Lighthouse](https://github.com/GoogleChrome/lighthouse) monitoring.

You can require this module in your own project, get the report data stream in CSV, JS Object or JSON format and handle the stream by yourself, or you can just use the [cli-tool](#cli-tool) which is also provided to generate the report file.

It has the capability to monitor multiple websites in parallel which can accelerate the collecting process when the target URLs are in plenty, but please be aware of the [warning](#lighthouse-batch-parallel). You can decide how many workers working at the same time, every worker would launch an independent headless Chrome browser.

## Usage

npm:

`$ npm i lighthouse-batch-parallel`

yarn:

`$ yarn add lighthouse-batch-parallel`

#### Example

```js
const { lighthouseBatchParallel } = require('lighthouse-batch-parallel');

const targetWebsites = [
  {
    Device: 'mobile',
    URL:    'https://www.npmjs.com/package/lighthouse-batch-parallel'
  },
  {
    Device: 'desktop',
    URL:    'https://www.npmjs.com/package/lighthouse-batch-parallel'
  },
];

const customAuditsConfig = {
  'first-contentful-paint': 'First Contentful Paint',
  'first-meaningful-paint': 'First Meaningful Paint',
  'speed-index':            'Speed Index',
};

const lighthouseAuditing = lighthouseBatchParallel({ 
  input: {
    stream: targetWebsites,
  },
  customAudits: { stream: customAuditsConfig },
  throttling:   'applied3G',
  outputFormat: 'jsObject',
  workersNum:   2,
});

let reports = [];

lighthouseAuditing.on('data', ({ data }) => {
  body.push(data);
});

lighthouseAuditing.on('error', ({ error }) => {
  console.log(error);
});

lighthouseAuditing.on('end', () => {
  console.log(reports);
  console.log(reports[0].audits);
});
```
Output of example above:
```js
// console.log(reports);
[
  {
    Device: 'mobile',
    URL: 'https://www.npmjs.com/package/react-carousel-slider',
    audits: {
      performance: [Object],
      accessibility: [Object],
      'best-practices': [Object],
      seo: [Object],
      pwa: [Object],
      'first-contentful-paint': [Object],
      'first-meaningful-paint': [Object],
      'speed-index': [Object]
    }
  },
  {
    Device: 'desktop',
    URL: 'https://www.npmjs.com/package/react-carousel-slider',
    audits: {
      performance: [Object],
      accessibility: [Object],
      'best-practices': [Object],
      seo: [Object],
      pwa: [Object],
      'first-contentful-paint': [Object],
      'first-meaningful-paint': [Object],
      'speed-index': [Object]
    }
  }
]

// console.log(reports[0].audits);
{
  performance: { title: 'Performance', score: 0.42 },
  accessibility: { title: 'Accessibility', score: 0.78 },
  'best-practices': { title: 'Best-practices', score: 1 },
  seo: { title: 'SEO', score: 1 },
  pwa: { title: 'PWA', score: 0.31 },
  'first-contentful-paint': { title: 'First Contentful Paint', score: '2.7 s' },
  'first-meaningful-paint': { title: 'First Meaningful Paint', score: '4.2 s' },
  'speed-index': { title: 'Speed Index', score: '5.9 s' }
}
```

---

#### lighthouseBatchParallel(parameters)
* `parameters <Object>`
    * [input](https://github.com/Carr1005/lighthouse-batch-parallel/tree/master#input) `<object> | <string>`
    * [customAudits](https://github.com/Carr1005/lighthouse-batch-parallel/tree/master#customAudits-optional) `<object> | <string>`
    * [throttling](https://github.com/Carr1005/lighthouse-batch-parallel/tree/master#throttling-optional)`<string>`
    * [outputFormat](https://github.com/Carr1005/lighthouse-batch-parallel/tree/master#outputFormat-optional)`<string>`
    * [workersNum](https://github.com/Carr1005/lighthouse-batch-parallel/tree/master#workersNum-optional)`<number>`
* returns `<EventEmitter>`
    * ['data'](https://github.com/Carr1005/lighthouse-batch-parallel/tree/master#event-data)
    * ['error'](https://github.com/Carr1005/lighthouse-batch-parallel/tree/master#event-error)
    * ['end'](https://github.com/Carr1005/lighthouse-batch-parallel/tree/master#event-end)

#### [More details on Github](https://github.com/Carr1005/lighthouse-batch-parallel/tree/master#parameters)

---

## Cli Tool
This cli-tool is a little gadget only takes file as input, and also only generates file as output, it also can be an [example](https://github.com/Carr1005/lighthouse-batch-parallel/blob/master/lighthouse-batch-parallel.js) to show how to use this module. Install this module globally would be easier to use this cli-tool.

`$ npm i lighthouse-batch-parallel -g`

#### Input file

`$ lighthouse-batch-parallel your-input.csv`

The input file should follow the structure as what is [required](https://github.com/Carr1005/lighthouse-batch-parallel/tree/master#input). Options below can help to pass custom settings to the module.

#### Options

```
-a <path>   ||  --audits-config <path>    { Custom audits config }

-t <method> ||  --throttling <method>     { Throttling Method }

-p <path>   ||  --path <path>             { The location of output file }

-f <name>   ||  --file-name <name>        { The name of output file }

-o <format> ||  --output-format <format>  { The output format }

-n <number> ||  --number <number>         { Number of workers }

-l          ||  --log-mode                { Log progress of process }

-e          ||  --error-log-file          { Output error log file}
```

#### [More details on Github](https://github.com/Carr1005/lighthouse-batch-parallel/tree/master#options)