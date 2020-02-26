# lighthouse-batch-parallel
This is a module to help collect multiple websites' performance data under [Lighthouse](https://github.com/GoogleChrome/lighthouse) monitoring.

The highlight capability of this tool is monitoring multiple websites in parallel, it can accelerate the collecting process when the target URLs are in plenty. You can decide how many workers working at the same time, every worker would launch an independent headless Chrome browser.

You can require this module in your own project, get the report data stream in CSV, JS Object or JSON format and handle the stream by yourself, or you can just use the [cli-tool](#cli-tool) which is also provided to generate the report file.

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
    * [input](#input) `<object> | <string>`
    * [customAudits](#customAudits-optional) `<object> | <string>`
    * [throttling](#throttling-optional)`<string>`
    * [outputFormat](#outputFormat-optional)`<string>`
    * [workersNum](#workersNum-optional)`<number>`
* returns `<EventEmitter>`
    * ['data'](#event-data)
    * ['error'](#event-error)
    * ['end'](#event-end)

---
#### Parameters
#### `input`
To give all target URLs, the format could be:

* **File**
    * available file format: 
        * **.csv**
        * **.json**
```js
lighthouseBatchParallel({ 
  input: '/path/of/your/inputfile.json'
  ...
});
```
Required **.json** file structure:
```JSON
[
  {
    "Device":"mobile",
    "URL":"https://www.npmjs.com/package/lighthouse-batch-parallel"
  },
  {
    "Device":"desktop",
    "URL":"https://www.npmjs.com/package/lighthouse-batch-parallel"
  },
]
```
Required **.csv** file structure:

```CSV
Device,URL
mobile,https://www.npmjs.com/package/lighthouse-batch-parallel
desktop,https://www.npmjs.com/package/lighthouse-batch-parallel
```

* **Object**
    * available format:
        * An array of JS Objects
        * CSV string

The object requires property `stream` as the key of the targets data.

```js
const csvString = `Device,URL
mobile,https://www.npmjs.com/package/lighthouse-batch-parallel
desktop,https://www.npmjs.com/package/lighthouse-batch-parallel`;

lighthouseBatchParallel({ 
  input: { stream: csvString }
  ...
});
```
```js
const targets = [
  {
    Device: 'desktop',
    URL: 'https://www.npmjs.com/package/lighthouse-batch-parallel'
  },
  {
    Device: 'mobile',
    URL: 'https://www.npmjs.com/package/lighthouse-batch-parallel'
  },
];

lighthouseBatchParallel({ 
  input: { stream: targets }
  ...
});
```

#### `customAudits [optional]`

Decide which audits would be showed in the report, if this argument is not given, this module would use [its default one](https://github.com/Carr1005/lighthouse-batch-parallel/blob/507c1ccce397a2fbaf49a73ef0d99971aa70de0d/assets/defaultConfig.js#L20), the format of this configuration could be:

* **File**
    * available file format: 
        * **.csv**
        * **.json**
```js
lighthouseBatchParallel({ 
  customAudits: '/path/of/your/customAudits.json'
  ...
});
```
Required **.json** file structure:
```JSON
{
  "first-contentful-paint": "First Contentful Paint",
  "first-meaningful-paint": "First Meaningful Paint",
  "speed-index": "Speed Index"
}
```
Required **.csv** file structure:

```CSV
first-contentful-paint, First Contentful Paint
first-meaningful-paint, First Meaningful Paint
speed-index, Speed Index
```

* **Object**
    * available format:
        * JS Object
        * CSV string

The object requires property `stream` which as the key of the targets data.

```js
const csvString = `first-contentful-paint, First Contentful Paint
first-meaningful-paint, First Meaningful Paint
speed-index, Speed Index`;

lighthouseBatchParallel({ 
  customAudits: { stream: csvString }
  ...
});
```
```js
const customAuditsConfig = {
  'first-contentful-paint': 'First Contentful Paint',
  'first-meaningful-paint': 'First Meaningful Paint',
  'speed-index': 'Speed Index',
};

lighthouseBatchParallel({ 
  customAudits: { stream: customAuditsConfig }
  ...
});
```

The values before commas (or keys in the object) which in [kebab-case](https://en.wikipedia.org/wiki/Naming_convention_(programming)#Delimiter-separated_words) are subset of audit options available in Lighthouse, to add more audits for monitoring, check the URL below:

[https://github.com/GoogleChrome/lighthouse/blob/d8410d5f81db8b3f98304f338afb7309719be0ae/lighthouse-core/config/default-config.js#L365](https://github.com/GoogleChrome/lighthouse/blob/d8410d5f81db8b3f98304f338afb7309719be0ae/lighthouse-core/config/default-config.js#L365)

The values after comma (or values in the object) correspond to the titles in the report, they are not regulated, feel free to rename it.

#### `throttling [optional]`

Allowed properties:
```
'simulated3G' (default)
'applied3G'
'no'
```
The properties above align to the options provided in Chrome Devtools. To understand the difference between them and more details, please visit the [documentation](https://github.com/GoogleChrome/lighthouse/blob/master/docs/throttling.md).

#### `outputFormat [optional]`

Decide the format of output stream, if this argument is not given, the default output format is `csv`.

Allowed properties:
```
'csv' (default)
'jsObject'
'json'
```

Output structures:

* The first output in `csv` format would be the titles header which is defined by [customAudits](#customAudits-optional):
```js
// first output
Device,URL,Performance,Accessibility,Best-practices,SEO,PWA,First Contentful Paint,First Meaningful Paint,Speed Index

// the rest of outputs
mobile,https://www.npmjs.com/package/lighthouse-batch-parallel,0.42,0.78,1,1,0.31,2.7 s,4.0 s,5.8 s
desktop,https://www.npmjs.com/package/lighthouse-batch-parallel,0.42,0.78,1,1,0.31,2.7 s,4.1 s,5.8 s
```

* The output stream of `jsObject` would be:

```js
{
  Device: 'desktop',
  URL: 'https://www.npmjs.com/package/lighthouse-batch-parallel',
  audits: {
    performance: { title: 'Performance', score: 0.39 },
    accessibility: { title: 'Accessibility', score: 0.78 },
    'best-practices': { title: 'Best-practices', score: 0.93 },
    seo: { title: 'SEO', score: 1 },
    pwa: { title: 'PWA', score: 0.31 },
    'first-contentful-paint': { title: 'First Contentful Paint', score: '3.0 s' },
    'first-meaningful-paint': { title: 'First Meaningful Paint', score: '4.4 s' },
    'speed-index': { title: 'Speed Index', score: '6.1 s' }
  }
}
```

* The output stream of `json` would be:

```js
{"Device":"desktop","URL":"https://www.npmjs.com/package/lighthouse-batch-parallel","audits":{"performance":{"title":"Performance","score":0.4},"accessibility":{"title":"Accessibility","score":0.78},"best-practices":{"title":"Best-practices","score":1},"seo":{"title":"SEO","score":1},"pwa":{"title":"PWA","score":0.31},"first-contentful-paint":{"title":"First Contentful Paint","score":"2.9 s"},"first-meaningful-paint":{"title":"First Meaningful Paint","score":"4.3 s"},"speed-index":{"title":"Speed Index","score":"6.0 s"}}}
```

#### `workersNum [optional]`
Decide how many workers would work in parallel, if this argument is not given, the default number is 4, in this case if the amount of targets is less than 4, the number would be the amount of the tasks.

---

#### Returns

After giving the arguments to `lighthouseBatchParallel`, it returns an [EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter). Use this EventEmitter instance to register listeners which listen for following events emitted in `lighthouseBatchParallel`:
<br>
<br>
#### Event: `'data'`
This event would be emitted right after each target URL is audited, the result would give to listenr's callback.

```js
const lighthouseAuditing = lighthouseBatchParallel({ ... })
lighthouseAuditing.on('data', ({ data, progress, header }) => {...})
```

* Parameter of listener's callback is an object, the object contains following properties:
    * `data` `<object> | <string>`
      The format of the `data` depends on the given [`outputFormat`](#outputFormat).
    * `progress` `<object>` This object contains following properties:
        * `device` `<string>`
        * `url` `<string>`
        * `totalTasksNum` `<number>`
        * `leftTasksNum` `number`
    * `header` `<boolean>`

When [`outputFormat`](#outputFormat-optional) is in `csv` mode, the first `data` comes out would be the titles header, in that case, the `header` would be `true`, also `device` and `url` in `progress` would be `undefined`.
<br>
<br>
#### Event: `'error'`
This event would be emitted when any auditing encounters problems.

* Parameter of listener's callback is an object, the object contains following property:
    * `error` `<object> | <string>`
      The format of the `error` depends on the given [`outputFormat`](#outputFormat-optional).
<br>
<br>

#### Event: `'end'`
This event would be emitted when all auditing tasks are finished.


## Cli Tool
This cli-tool is a little gadget only takes file as input, and also only generates file as output, it also can be an [example](https://github.com/Carr1005/lighthouse-batch-parallel/blob/master/lighthouse-batch-parallel.js) to show how to use this module. Install this module globally would be easier to use this cli-tool.

`$ npm i lighthouse-batch-parallel -g`

#### Input file

`$ lighthouse-batch-parallel your-input.csv`

The input file should follow the structure as what is [required](#input). Options below can help to pass custom settings to the module.

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

---

* Give your own audits config by `-a` or `--audits-config`:
```
$ lighthouse-batch-parallel input.csv -a your-custom-audits.csv 
```
Should follow the structure as what is [required](#customAudits-optional).

<br>

* Throttling option `-t` or `--throttling`:
```
$ lighthouse-batch-parallel -t applied3G input.csv
```
Allowed properties are the same as [here](#throttling-optional).

<br>

* Specify the path of output report file by `-p` or `--path`:
```
$ lighthouse-batch-parallel -p /your/path/to/output input.csv
```
If the option is not given, the report will be put into `output` folder which would be generated automatically in current working directory.

<br>

* Specify the name of output report file by `-f` or `--file-name`:
```
$ lighthouse-batch-parallel -f my-report.csv input.csv
```
If this option is not given, the name of file would be the time when report is generated. If the file format is specified here (`.csv` or `.json`), the `-o` option would be ignored. If both here and `-o` don't specify the output file format, the default would be `.csv`.

<br>

* Specify the output file format by `-o` or `--output-format`:
```
$ lighthouse-batch-parallel -o json input.csv
```
The available formats are `csv` and `json`.

If this option is not given, the default would be `csv`.

<br>

* Have more or less worker work parallely by giving option `-n` or `--number` :
```
$ lighthouse-batch-parallel input.csv  
(default 4)

$ lighthouse-batch-parallel -n 9 input.csv
```

<br>

* Log the progress in the console by `-l` or `--log-mode` :
```
$ lighthouse-batch-parallel -l input.csv
```

<br>

* Generate the error log file by `-e` or `--error-log-file` :
```
$ lighthouse-batch-parallel -e input.csv
```
The report will be put into `errorLog` folder which would be generated automatically in current working directory.
