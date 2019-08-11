# lighthouse-batch-parallel
This is a cli-tool to help collect multiple websites' performance data under [lighthouse](https://github.com/GoogleChrome/lighthouse) monitoring.

The highlight capability of this tool is monitoring multiple websites parallelly, it could accelerate the collecting process when the target URLs are in plenty. By giving the number or workers with `-n`, you could have more or less process work parallelly, every worker would launch an independant headless Chrome brwoser, so be careful on memory/cpu usage on your device.

Now this tool only supports input and output file in `csv` format.

# Install

`npm i lighthouse-batch-parallel -g`

(please must install this cli-tool with `-g` flag, or you need to make the symlink by yourself)

# Usage

`lighthouse-batch-parallel your-input.csv`

The format of csv input file should follow the example below:

**your-input.csv**

```
Device, URL
desktop, https://www.example.com/
mobile, https://www.example.com/
```

The report will be put into `output` folder which would be generated automatically in current working directory as well.

## Custom Configuration

```
-n <number> ||  --number <number>         { Number of workers }

-a <path>   ||  --audits-config <path>    { Custom audits config }

-t <method> ||  --throttling <method>     { Throttling Method }
```


* Have more or less worker work parallely by giving option `-n` or `--number` (default 4):
  
```
lighthouse-batch-parallel -n 9 input.csv
```



* Throttling option `-t` or `--throttling`:

```
lighthouse-batch-parallel -t applied3G input.csv
```

Allowed properties:
```
'simulated3G' (default)
'applied3G'
'no'
```
The properties above align to the options provided in Chrome Devtools. To understand the difference and details, please visit the [doc](https://github.com/GoogleChrome/lighthouse/blob/master/docs/throttling.md).



* Decide which audits shoud be showed in report by giving your own config by `-a` or `--audits-config`:

```
lighthouse-batch-parallel input.csv -a your-custom-audits.csv 
```

**your-custom-audits.csv**

```
first-contentful-paint, First Contentful Paint
first-meaningful-paint, First Meaningful Paint
speed-index, Speed Index
```

The values before commas are subset of options available in lighthouse, to add more audits for monitoring, check the url below:

https://github.com/GoogleChrome/lighthouse/blob/d8410d5f81db8b3f98304f338afb7309719be0ae/lighthouse-core/config/default-config.js#L365

The values after comma corresponding to titles in the report, they are not regulated, feel free to revise them if it could be easier to understand.
