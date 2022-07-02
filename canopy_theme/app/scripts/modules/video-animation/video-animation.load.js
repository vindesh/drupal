'use strict';

module.exports = ($el) => {

  require.ensure([], (require) => {

    var Module = require('./video-animation.main');
    new Module($el);

  });

};
