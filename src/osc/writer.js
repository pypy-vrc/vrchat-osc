const {OscMidi, OscColor} = require('./types');
const {NTP_DELTA, TWO32} = require('./consts');

class OscWriter {
  buf = Buffer.allocUnsafe(256);
  byteLength = 0;

  copy() {
    return Buffer.from(this.buf.slice(0, this.byteLength));
  }

  ensure(length) {
    const totalLength = this.byteLength + length;
    if (totalLength < this.buf.byteLength) {
      return;
    }

    const buf = Buffer.allocUnsafe((totalLength + 4095) & ~4095);
    this.buf.copy(buf, 0, 0, this.byteLength);
    this.buf = buf;
  }

  /** @param {Buffer} value */
  buffer(value) {
    value.copy(this.buf, this.byteLength);
    this.byteLength += value.byteLength;
  }

  int32(value) {
    this.buf.writeInt32BE(value, this.byteLength);
    this.byteLength += 4;
  }

  int64(value) {
    this.buf.writeBigInt64BE(value, this.byteLength);
    this.byteLength += 8;
  }

  float32(value) {
    this.buf.writeFloatBE(value, this.byteLength);
    this.byteLength += 4;
  }

  float64(value) {
    this.buf.writeDoubleBE(value, this.byteLength);
    this.byteLength += 8;
  }

  align4(length) {
    this.byteLength += length;
    const padding = 4 - (length & 3);
    if (padding === 0 || padding === 4) {
      return;
    }
    this.buf.fill(0, this.byteLength, this.byteLength + padding);
    this.byteLength += padding;
  }

  string(value) {
    const length = this.buf.write(value, this.byteLength);
    this.buf.writeInt8(0, this.byteLength + length);
    this.align4(length + 1);
  }

  /** @param {Buffer} value */
  blob(value) {
    this.int32(value.byteLength);
    value.copy(this.buf, this.byteLength);
    this.align4(value.byteLength);
  }

  /** @param {Date} value */
  timeTag(value) {
    const ts = value.getTime() / 1000;
    const seconds = Math.floor(ts);
    this.buf.writeUint32BE(seconds + NTP_DELTA, this.byteLength);
    this.buf.writeUint32BE(
      Math.floor((ts - seconds) * TWO32),
      this.byteLength + 4
    );
    this.byteLength += 8;
  }

  /** @param {OscMidi} value */
  midi(value) {
    this.buf.writeUint8(value.portId, this.byteLength);
    this.buf.writeUint8(value.status, this.byteLength + 1);
    this.buf.writeUint8(value.data1, this.byteLength + 2);
    this.buf.writeUint8(value.data2, this.byteLength + 3);
    this.byteLength += 4;
  }

  /** @param {OscColor} value */
  color(value) {
    this.buf.writeUint8(value.r, this.byteLength);
    this.buf.writeUint8(value.g, this.byteLength + 1);
    this.buf.writeUint8(value.b, this.byteLength + 2);
    this.buf.writeUint8(value.a, this.byteLength + 3);
    this.byteLength += 4;
  }
}

module.exports = {
  OscWriter
};
