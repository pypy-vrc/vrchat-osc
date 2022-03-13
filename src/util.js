function sleep(milliseonds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseonds);
  });
}

module.exports = {
  sleep
};
