const {OscReader} = require('./reader');

/** @param {Buffer} buf */
function parse(buf) {
  const messages = [];

  switch (buf.readInt8(0)) {
    case 35: // '#'
      messages.push(...bundle(buf));
      break;

    case 47: // '/'
      messages.push(message(buf));
      break;

    default:
      throw new Error('wtf');
  }

  return messages;
}

/** @param {Buffer} buf */
function bundle(buf) {
  const messages = [];
  const r = new OscReader(buf);

  // 8 : "#bundle\0"
  // 8 : time tag
  r.skip(16);

  while (r.remain() >= 4) {
    const data = r.blob();
    messages.push(parse(data));
  }

  return messages;
}

/** @param {Buffer} buf */
function message(buf) {
  const r = new OscReader(buf);
  const address = r.string();
  const [values] = decode(r);
  return [address, values];
}

/** @param {OscReader} r */
function decode(r) {
  const tags = r.string().slice(1);
  const values = [];

  // TODO: array tags

  for (const tag of tags) {
    switch (tag) {
      case 'b': // blob, standard
        values.push(r.blob());
        break;

      case 'c': // ascii char 32, non-standard
        values.push(String.fromCharCode(r.int32()));
        break;

      case 'd': // float64, non-standard
        values.push(r.float64());
        break;

      case 'f': // float32, standard
        values.push(r.float32());
        break;

      case 'h': // int64, non-standard
        values.push(r.int64());
        break;

      case 'i': // int32, standard
        values.push(r.int32());
        break;

      case 'm': // midi message, non-standard
        values.push(r.midi());
        break;

      case 'r': // color, non-standard
        values.push(r.color());
        break;

      case 's': // string, standard
        values.push(r.string());
        break;

      case 't': // time tag, non-standard
        values.push(r.timeTag());
        break;

      case 'F': // false, non-standard
        values.push(false);
        break;

      case 'I': // infinitum, non-standard
        values.push(NaN);
        break;

      case 'N': // nil, non-standard
        values.push(null);
        break;

      case 'S': // alt type string, non-standard
        values.push(r.string());
        break;

      case 'T': // true, non-standard
        values.push(true);
        break;

      default:
        throw new Error(`invalid type: ${tag}`);
    }
  }

  return [values, tags];
}

module.exports = {
  parse,
  bundle,
  message
};
