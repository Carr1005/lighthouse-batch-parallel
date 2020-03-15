/** 
  The highlight capability of lighthouse-batch-parallel is monitoring multiple 
  websites parallelly, it could save a lot of time when the target URLs are
  in plenty. By changing the number or workers, you could have more or less
  process work parallelly, every worker would launch an independant headless Chrome
  brwoser, so be careful on memory/cpu usage on your device.
*/

module.exports.workersNum = 1;

/**
  This map defines what audits would be recorded in the report,
  the keys in this map are subset of options available in lighthouse,
  to add more audits to monitor, check the url below:
  https://github.com/GoogleChrome/lighthouse/blob/d8410d5f81db8b3f98304f338afb7309719be0ae/lighthouse-core/config/default-config.js#L365
  The values in this map corresponding to titles in the report, it's not
  regulated, feel free to revise them if it could be easier to understand
*/

module.exports.auditsNameTitleMap = {
  'first-contentful-paint':     'First Contentful Paint',
  'first-meaningful-paint':     'First Meaningful Paint',
  'speed-index':                'Speed Index',
  'estimated-input-latency':    'Estimated Input Latency',
  'interactive':                'Time to Interactive',
  'first-cpu-idle':             'First CPU Idle',
  'render-blocking-resources':  'Eliminate render-blocking resources',
  'uses-rel-preconnect':        'Preconnect to required origins',
  'uses-text-compression':      'Enable text compression',
  'time-to-first-byte':         'Server response times are low (TTFB)',
  'offscreen-images':           'Defer offscreen images',
  'uses-webp-images':           'Serve images in next-gen formats',
  'uses-optimized-images':      'Efficiently encode images',
  'uses-responsive-images':     'Properly size images',
  'unminified-javascript':      'Minify JavaScript',
  'uses-rel-preload':           'Preload key requests',
  'unused-css-rules':           'Remove unused CSS',
  'efficient-animated-content': 'Use video formats for animated content',
  'unminified-css':             'Minify CSS',
  'mainthread-work-breakdown':  'Minimize main-thread work',
  'dom-size':                   'Avoid an excessive DOM size',
  'uses-long-cache-ttl':        'Serve static assets with an efficient cache policy',
  'bootup-time':                'Reduce JavaScript execution time',
  'critical-request-chains':    'Minimize Critical Requests Depth',
  'user-timings':               'User Timing marks and measures',
  'font-display':               'All text remains visible during webfont loads',
  'total-byte-weight':          'Avoids enormous network payloads',
};

module.exports.lighthouseConfig = {
  extends: 'lighthouse:default',
}

/**
  To make this easier to trace, showing the properties related to custome options of this tool 
  in 'settings' and 'passes' for defaultConfig in lighthouse

  node_modules/lighthouse/lighthouse-core/config/default-config.js
  ------------------------------------------
  ...

  settings: constants.defaultSettings,
  passes: [{
    passName: 'defaultPass',
    recordTrace: true,
    useThrottling: true,
    ...
  },

  ...

  constants.defaultSettings defines in

  node_modules/lighthouse/lighthouse-core/config/constants.js
  ------------------------------------------
  defaultSettings = {
    output: 'json',
    maxWaitForFcp: 15 * 1000,
    maxWaitForLoad: 45 * 1000,
    throttlingMethod: 'simulate',
    throttling: throttling.mobileSlow4G,
    auditMode: false,
    gatherMode: false,
    disableStorageReset: false,
    disableDeviceEmulation: false,
    emulatedFormFactor: 'mobile',
    channel: 'node',

    // the following settings have no defaults but we still want ensure that `key in settings`
    // in config will work in a typechecked way
    locale: 'en-US', // actual default determined by Config using lib/i18n
    blockedUrlPatterns: null,
    additionalTraceCategories: null,
    extraHeaders: null,
    precomputedLanternData: null,
    onlyAudits: null,
    onlyCategories: null,
    skipAudits: null,
  };

  ...

*/

module.exports.throttlingOptions          = ['simulated3G', 'applied3G', 'no'];
module.exports.supportedInputFileTypes    = ['csv', 'json'];
module.exports.supportedOutputStreamTypes = ['csv', 'json', 'jsObject'];
module.exports.supportedOutputFileTypes   = ['csv', 'json'];