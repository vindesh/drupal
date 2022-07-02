'use strict';

module.exports = ($el) => {

  require.ensure([], (require) => {

    var Module = require('./section-toggles.main');
    new Module($el);

  });

};
