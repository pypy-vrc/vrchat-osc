const {OscMidi, OscColor, OscFloat32} = require('./types');
const {OscWriter} = require('./writer');

/** @param {Buffer[]} messages */
function bundle(...messages) {
  const w = new OscWriter();
  w.string('#bundle');
  w.timeTag(new Date());

  for (const m of messages) {
    w.blob(m);
  }

  return w.copy();
}

function message(address, ...values) {
  const [data, tags] = encode(values);
  const w = new OscWriter();
  w.string(address);
  w.string(tags);
  w.buffer(data);
  return w.copy();
}

function encode(values) {
  const w = new OscWriter();
  const tags = [','];

  // TODO: array tags

  for (const value of values) {
    switch (typeof value) {
      case 'boolean':
        if (value) {
          tags.push('T'); // true, non-standard
        } else {
          tags.push('F'); // false, non-standard
        }
        break;

      case 'number':
        if (isNaN(value)) {
          tags.push('I'); // infinitum, non-standard
          break;
        }

        if (Math.floor(value) === value) {
          // FIXME: int64, non-standard
          tags.push('i'); // int32, standard
          w.int32(value);
          break;
        }

        // FIXME: float64, non-standard
        tags.push('f'); // float32, standard}
        w.float32(value);
        break;

      case 'string':
        tags.push('s'); // string, standard
        w.string(value);
        break;

      case 'object':
        if (value !== null) {
          if (Buffer.isBuffer(value)) {
            tags.push('b'); // blob, standard
            w.blob(value);
            break;
          }

          if (value.constructor === Date) {
            tags.push('t'); // time tag, non-standard
            w.timeTag(value);
            break;
          }

          if (value.constructor === OscMidi) {
            tags.push('m'); // midi message, non-standard
            w.midi(value);
            break;
          }

          if (value.constructor === OscColor) {
            tags.push('r'); // color, non-standard
            w.color(value);
            break;
          }

          if (value.constructor === OscFloat32) {
            // FIXME: float64, non-standard
            tags.push('f'); // float32, standard}
            w.float32(value.value);
            break;
          }
        }

        tags.push('N'); // nil, non-standard
        break;
    }
  }

  return [w.copy(), tags.join('')];
}

module.exports = {
  bundle,
  message
};
