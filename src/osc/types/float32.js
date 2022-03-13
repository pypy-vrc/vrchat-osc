class OscFloat32 {
  value = 0;

  static from(value) {
    const self = new OscFloat32();
    self.value = value;
    return self;
  }
}

module.exports = {
  OscFloat32
};
