const loDB = {
  getItem(key) {
    const val = window.localStorage.getItem(key);
    return Promise.resolve(val? JSON.parse(val): undefined);
  },
  setItem(key, val) {
    window.localStorage.setItem(key, JSON.stringify(val));
    return Promise.resolve(val);
  },
  clear() {
    window.localStorage.clear();
  }
};
module.exports = loDB;
