class Logger {
  info(...args) { console.log(...args); }
  warn(...args) { console.warn(...args); }
  error(...args) { console.error(...args); }
  debug(...args) { if (process.env.DEBUG) console.debug(...args); }
}
module.exports = new Logger();
