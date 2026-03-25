// This is a wrapper around pdf-parse to avoid its "debug mode" which tries to read files
// from the filesystem and causes ENOENT errors in Next.js/Webpack environments.
const pdf = require('pdf-parse/lib/pdf-parse.js');

module.exports = pdf;
