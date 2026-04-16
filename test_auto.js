const { JSDOM } = require('jsdom');
const dom = new JSDOM('<div>Some math: $-ld 6$ here </div>');
global.document = dom.window.document;
global.window = dom.window;
require('./quiz/assets/katex/katex.js');
const renderMathInElement = require('./quiz/assets/katex/contrib/auto-render.js');

renderMathInElement(document.body, {
  delimiters: [
    { left: '$$', right: '$$', display: true },
    { left: '$', right: '$', display: false }
  ],
  throwOnError: false
});

console.log(document.body.innerHTML);
