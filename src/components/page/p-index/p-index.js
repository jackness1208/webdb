import Vue from 'vue';
import { mapGetters, mapActions } from 'vuex';

import tpl from './p-index.pug';
import './p-index.scss';
import vDemo from '../../widget/v-demo/v-demo.vue';
import fData from '../../../js/data.js';
// import db from '../../../js/lib/webDB.js';
// import db from '../../../js/lib/indexedDB.js';
import db from '../../../js/lib/localstorage.js';


export default Vue.extend({
  template: tpl(),
  methods: {
    ...mapActions(['addDemoLog'])
  },
  computed: {
    ...mapGetters(['demoLogs'])
  },
  data() {
    return {
    };
  },
  components: {
    vDemo
  },
  mounted() {
    const vm = this;
    window.db = db;
    vm.addDemoLog('p-index is ready');

    const add = function (done) {
      db.getItem('total').then((d) => {
        vm.addDemoLog(`getItem total done ${d}`);
        let iData = Number(d);
        if (!iData) {
          iData = 1;
        } else {
          iData += 1;
        }
        db.setItem('total', iData).then(() => {
          db.setItem(`dblimit-${iData}`, {
            content: fData
          }).then(() => {
            done(iData);
          });
        });
      });
    };


    add(function check() {
      db.getItem('total').then((d) => {
        if (+d < 200) {
          add(check);
        }
      });
    });
  }
});
