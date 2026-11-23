// Conservative whitespace minification: preserve strings, escapes and calc spacing.
module.exports = function compactCSS(input) {
  let out = '', quote = '', pending = false;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (quote) { out += c; if (c === '\\') out += input[++i] || ''; else if (c === quote) quote = ''; continue; }
    if (c === '/' && input[i + 1] === '*') { i += 2; while (i < input.length && !(input[i] === '*' && input[i + 1] === '/')) i++; i++; continue; }
    if (/\s/.test(c)) { pending = true; continue; }
    if (pending && out) out += ' '; pending = false;
    if (c === '"' || c === "'") quote = c;
    out += c;
  }
  return out.trim();
};
