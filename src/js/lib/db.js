const db = {
  source: null,
  ctrl: null,
  init() {
    const self = this;
    const runner = function (next) {
      if (self.ctrl) {
        next();
      } else {
        self.ctrl = openDatabase('yydb', '1.0', 'yydb test', 1000 * 1024 * 1024);
        self.ctrl.transaction((tx) => {
          tx.executeSql('CREATE TABLE IF NOT EXISTS cache (id, obj)');
          tx.executeSql('SELECT * FROM cache', [], (ttx, results) => {
            self.source = {};
            if (results.rows.length) {
              [...results.rows].forEach((item) => {
                self.source[item.id] = JSON.parse(item.obj);
              });
            }
            next();
          });
        });
      }
    };

    return new Promise(runner);
  },
  sql(ctx, arr) {
    const self = this;
    const runner = function (next, reject) {
      self.init().then(() => {
        self.ctrl.transaction((tx) => {
          tx.executeSql(ctx, arr || [], () => {
            next();
          }, (err) => {
            reject(err);
          });
        });
      });
    };
    return new Promise(runner);
  },
  clear() {
    const self = this;
    const runner = function (next) {
      self.init().then(() => {
        self.ctrl.transaction((tx) => {
          tx.executeSql('DROP TABLE cache', [], () => {
            next();
          });
        });
      });
    };
    return new Promise(runner);
  },
  setItem(name, data) {
    const self = this;
    const dataStr = JSON.stringify(data);
    const runner = function (next, reject) {
      let iSql = '';
      let iArgv = [];
      if (self.source[name]) {
        iSql = 'UPDATE cache SET obj = ? WHERE id = ?';
        iArgv = [dataStr, name];
      } else {
        iSql = 'INSERT INTO cache (id, obj) VALUES (?, ?)';
        iArgv = [name, dataStr];
      }

      self.sql(iSql, iArgv).then(() => {
        self.source[name] = data;
        next();
      }).catch((er) => {
        reject(er);
      });
    };
    return new Promise(runner);
  },
  getItem(name) {
    const self = this;
    const runner = function (next) {
      self.init().then(() => {
        next(self.source[name]);
      });
    };
    return new Promise(runner);
  }
};

module.exports = db;
