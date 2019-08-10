# lighthouse-batch-parallel
This is a tool to help collect multiple websites' performance data under [lighthouse](https://github.com/GoogleChrome/lighthouse) monitoring.

The highlight capability of this tool is monitoring multiple websites parallelly, it could accelerate the collecting process when the target URLs are in plenty. By changing the number or workers in `assets/custumConfig.js`, you could have more or less process work parallelly, every worker would launch an independant headless Chrome brwoser, so be careful on memory/cpu usage on your device.

Now this tool only supports input and output file in `csv` format.

# Usage

`node lighthouse-batch-parallel.js input.csv`

The format of csv input file should follow the example below:

`
Device,URL
desktop,https://www.example.com/
mobile,https://www.example.com/
`

You could have a quick test by using the sample provided under `assets` folder

`node lighthouse-batch-parallel.js assets/input.csv`

The report will be put into `output` folder which would be generated automatically in current working directory as well.

## Configuration

Do your own configuration in `assets/customeConfig.js`:

* Have more or less worker work parallely 

```js
module.exports.workersNum = 4;
```

* Decide which audits shoud be showed in report.

```js
module.exports.auditsNameTitleMap = {
  'first-contentful-paint': 'First Contentful Paint',
  'first-meaningful-paint': 'First Meaningful Paint',
}

/**
  The keys in this map are subset of options available in lighthouse,
  to add more audits for monitoring, check the url below:
  https://github.com/GoogleChrome/lighthouse/blob/d8410d5f81db8b3f98304f338afb7309719be0ae/lighthouse-core/config/default-config.js#L365
  The values in this map corresponding to titles in the report, it's not
  regulated, feel free to revise them if it could be easier to understand
*/
```