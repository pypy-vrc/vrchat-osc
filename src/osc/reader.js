const {OscMidi, OscColor} = require('./types');
const {NTP_DELTA, TWO32} = require('./consts');

class OscReader {
  /** @type {Buffer} */
  buf = null;
  byteOffset = 0;

  constructor(buf) {
    this.buf = buf;
  }

  skip(length) {
    this.byteOffset += length;
  }

  remain() {
    return this.buf.byteLength - this.byteOffset;
  }

  int32() {
    const value = this.buf.readInt32BE(this.byteOffset);
    this.byteOffset += 4;
    return value;
  }

  int64() {
    const value = this.buf.readBigInt64BE(this.byteOffset);
    this.byteOffset += 4;
    return value;
  }

  float32() {
    const value = this.buf.readFloatBE(this.byteOffset);
    this.byteOffset += 4;
    return value;
  }

  float64() {
    const value = this.buf.readDoubleBE(this.byteOffset);
    this.byteOffset += 8;
    return value;
  }

  string() {
    const pos = this.buf.indexOf(0, this.byteOffset);
    if (pos < 0) {
      return '';
    }

    const value = this.buf.toString('utf8', this.byteOffset, pos);
    this.byteOffset = (pos + 4) & ~3;
    return value;
  }

  blob() {
    const length = this.int32();
    const value = this.buf.slice(this.byteOffset, this.byteOffset + length);
    this.byteOffset += (length + 3) & ~3;
    return value;
  }

  timeTag() {
    const seconds = this.buf.readUint32BE(this.byteOffset);
    const fraction = this.buf.readUint32BE(this.byteOffset + 4);
    const value = new Date((seconds - NTP_DELTA + fraction / TWO32) * 1000);
    this.byteOffset += 8;
    return value;
  }

  midi() {
    const value = new OscMidi();
    value.portId = this.buf.readUInt8(this.byteOffset);
    value.status = this.buf.readUInt8(this.byteOffset + 1);
    value.data1 = this.buf.readUInt8(this.byteOffset + 2);
    value.data2 = this.buf.readUInt8(this.byteOffset + 3);
    this.byteOffset += 4;
    return value;
  }

  color() {
    const value = new OscColor();
    value.r = this.buf.readUInt8(this.byteOffset);
    value.g = this.buf.readUInt8(this.byteOffset + 1);
    value.b = this.buf.readUInt8(this.byteOffset + 2);
    value.a = this.buf.readUInt8(this.byteOffset + 3);
    this.byteOffset += 4;
    return value;
  }
}

module.exports = {
  OscReader
};
