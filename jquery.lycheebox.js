/*! jQuery.LycheeBox (https://github.com/Takazudo/jQuery.LycheeBox)
 * lastupdate: 2013-10-01
 * version: 0.0.0
 * author: 'Takazudo' Takeshi Takatsudo <takazudo@gmail.com>
 * License: MIT */
(function() {
  (function($) {
    var ns, wait;
    ns = {};
    wait = function(time) {
      return $.Deferred(function(defer) {
        return setTimeout(function() {
          return defer.resolve();
        }, time);
      });
    };
    ns.Dialog = (function() {
      function Dialog() {
        console.log('lychee!');
      }

      return Dialog;

    })();
    $.fn.lycheeBox = function(options) {
      return this.each(function(i, el) {
        var $opener, instance;
        $opener = $(el);
        instance = $opener.data('lycheebox');
        if (instance) {
          instance.open();
          return;
        }
        instance = new ns.Dialog($opener, options);
        $opener.data('liycheebox', instance);
        return instance.open();
      });
    };
    $.LycheeBoxNs = ns;
    return $.LycheeBox = ns.Dialog;
  })(jQuery);

}).call(this);
