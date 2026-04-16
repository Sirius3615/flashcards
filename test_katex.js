const katex = require('./quiz/assets/katex/katex.js');
try {
  console.log("Rendering: ", katex.renderToString("$-ld 6$", {throwOnError: false}));
} catch(e) {
  console.log("Error:", e);
}
try {
  console.log("Rendering2: ", katex.renderToString("-ld 6", {throwOnError: false}));
} catch(e) {
  console.log("Error2:", e);
}
