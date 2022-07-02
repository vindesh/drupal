'use strict';

module.exports = ($el) => {

  require.ensure([], (require) => {

    var Module = require('./link-image.main');
    new Module($el);

  });

};
