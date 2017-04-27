const jsdom = require('jsdom');

const DEFAULT_HTML = '<html><body></body></html>';
const dom = new jsdom.JSDOM(DEFAULT_HTML);
global.document = dom.window.document;
global.window = dom.window;
global.navigator = window.navigator;