/*! jQuery.LycheeBox (https://github.com/Takazudo/jQuery.LycheeBox)
 * lastupdate: 2013-10-04
 * version: 0.0.0
 * author: 'Takazudo' Takeshi Takatsudo <takazudo@gmail.com>
 * License: MIT */
(function() {
  (function($) {
    var $document, $window, domwindowApi, ns, wait;
    $window = $(window);
    $document = $(document);
    domwindowApi = null;
    ns = {};
    wait = function(time) {
      return $.Deferred(function(defer) {
        return setTimeout(function() {
          return defer.resolve();
        }, time);
      }).promise();
    };
    ns.setup = (function() {
      var setupDone;
      setupDone = false;
      return function() {
        if (setupDone) {
          return;
        }
        setupDone = true;
        $.ui.domwindowdialog.setup({
          width: 600,
          height: 300
        });
        return domwindowApi = window.domwindowApi;
      };
    })();
    ns.viewport = {
      width: function() {
        return $window.width();
      },
      height: function() {
        return window.innerHeight || $window.height();
      },
      createSizeObject: function() {
        var o;
        o = {
          width: ns.viewport.width(),
          height: ns.viewport.height()
        };
        return o;
      }
    };
    ns.fadeIn = function($el, duration) {
      var from, to;
      if (duration == null) {
        duration = 400;
      }
      from = {
        display: 'block',
        opacity: 0
      };
      to = {
        opacity: 1
      };
      return $el.css(from).animate(to, duration);
    };
    ns.fadeOut = function($el, duration) {
      var from, to;
      if (duration == null) {
        duration = 400;
      }
      from = {
        display: 'block',
        opacity: 1
      };
      to = {
        opacity: 0
      };
      return $el.css(from).animate(to, duration);
    };
    ns.Dialog = (function() {
      Dialog.defaults = {
        dialog_src: "<div class=\"lycheebox-dialog\">\n  <div class=\"lycheebox-positioner\">\n    <div class=\"lycheebox-main\">\n      <div class=\"lycheebox-main-inner\">\n        <div class=\"lycheebox-imgholder\"></div>\n        <a class=\"lycheebox-dialogcloser apply-domwindow-close\" href=\"#\">close</a>\n      </div>\n    </div>\n  </div>\n  <div class=\"lycheebox-loader\"></div>\n</div>",
        spinner_options: {
          color: '#fff',
          lines: 20,
          length: 10,
          width: 2,
          radius: 40
        },
        selector_dialogRoot: '.lycheebox-dialog',
        selector_loader: '.lycheebox-loader',
        selector_holder: '.lycheebox-imgholder',
        selector_main: '.lycheebox-main',
        dialog_LR_margin: 10,
        dialog_TB_margin: 10,
        dialog_LR_padding: 10,
        dialog_TB_padding: 10,
        dialog_closer_height: 35,
        dialog_click_close: true,
        prevent_touchmove: true
      };

      function Dialog($opener, options) {
        this.$opener = $opener;
        this.options = $.extend({}, ns.Dialog.defaults, options);
        this._eventify();
      }

      Dialog.prototype.open = function() {
        var dialog_src, openOptions,
          _this = this;
        ns.setup();
        dialog_src = $.trim(this.options.dialog_src);
        openOptions = $.extend({
          strdialog: true,
          tandbmargintodecideposition: 0,
          afteropen: function(e, data) {
            _this.$dialog = data.dialog;
            return _this._handleAfterOpen();
          },
          beforeclose: function() {
            return _this._handleBeforeClose();
          },
          afterclose: function() {
            _this.$dialog.empty();
            return _this.$dialog = null;
          }
        }, ns.viewport.createSizeObject());
        return domwindowApi.open(this.options.dialog_src, openOptions);
      };

      Dialog.prototype.destroy = function() {
        this.$opener.unbind('click', this._openerClickHandler);
        return $window.unbind('resize orientationchange', this._resizeHandler);
      };

      Dialog.prototype.resizeDialog = function() {
        var size;
        if (!this.opened) {
          return;
        }
        size = ns.viewport.createSizeObject();
        return this.$dialog.css(size);
      };

      Dialog.prototype.resizeEls = function() {
        var h, imgSize, mainSize, o, w;
        if (!this.opened) {
          return;
        }
        if (!this.imgReady) {
          return;
        }
        o = this.options;
        imgSize = $.imgUtil.calcRectContainImgWH({
          imgWidth: this.naturalImgSize.width,
          imgHeight: this.naturalImgSize.height,
          rectWidth: ns.viewport.width() - (o.dialog_LR_margin * 2) - (o.dialog_LR_padding * 2),
          rectHeight: ns.viewport.height() - (o.dialog_TB_margin * 2) - (o.dialog_TB_padding * 2) - o.dialog_closer_height,
          enlargeSmallImg: false
        });
        w = imgSize.width + (o.dialog_LR_padding * 2);
        h = imgSize.height + (o.dialog_TB_padding * 2) + o.dialog_closer_height;
        mainSize = {
          width: w,
          height: h,
          marginTop: -1 * h / 2,
          marginLeft: -1 * w / 2
        };
        this.$main.css(mainSize);
        return this.$holder.css(imgSize);
      };

      Dialog.prototype._handleAfterOpen = function() {
        var _this = this;
        this.opened = true;
        this.imgsrc = this.$opener.attr('href');
        this._eventify_overlayClickClose();
        this._eventify_dialogTouchmove();
        this._putSpinner();
        return this._calcImgSize().then(function() {
          return _this._removeSpinner();
        }).then(function() {
          _this._prepareElsInsideDialog();
          _this.$holder.append(_this.$img);
          _this.imgReady = true;
          _this.resizeEls();
          return ns.fadeIn(_this.$main);
        });
      };

      Dialog.prototype._handleBeforeClose = function() {
        this.opened = false;
        this.imgReady = false;
        this._uneventify_overlayClickClose();
        return this._uneventify_overlayClickClose();
      };

      Dialog.prototype._eventify_dialogTouchmove = function() {
        if (!this.options.prevent_touchmove) {
          return;
        }
        this._touchmoveHandler = function(e) {
          return e.preventDefault();
        };
        return this.$dialog.bind('touchmove', this._touchmoveHandler);
      };

      Dialog.prototype._uneventify_dialogTouchmove = function() {
        if (!this.options.prevent_touchmove) {
          return;
        }
        return this.$dialog.unbind('touchmove', this._touchmoveHandler);
      };

      Dialog.prototype._eventify_overlayClickClose = function() {
        var o,
          _this = this;
        if (!this.options.dialog_click_close) {
          return;
        }
        o = this.options;
        this._overlayClickHandler = function(e) {
          var $target;
          $target = $(e.target);
          if (!$target.is("" + o.selector_loader + ", " + o.selector_dialogRoot)) {
            return;
          }
          return domwindowApi.close();
        };
        return this.$dialog.bind('click', this._overlayClickHandler);
      };

      Dialog.prototype._uneventify_overlayClickClose = function() {
        if (!this.options.dialog_click_close) {
          return;
        }
        return this.$dialog.unbind('click', this._overlayClickHandler);
      };

      Dialog.prototype._putSpinner = function() {
        var o;
        o = this.options;
        this.$loader = $(o.selector_loader, this.$dialog);
        this.$loader.stop().css({
          display: 'block',
          opacity: 0
        });
        (new Spinner(o.spinner_options)).spin(this.$loader[0]);
        return ns.fadeIn(this.$loader, 200);
      };

      Dialog.prototype._calcImgSize = function() {
        var defer,
          _this = this;
        defer = $.Deferred();
        ($.imgUtil.calcNaturalWH(this.imgsrc)).done(function(wh, $img) {
          _this.naturalImgSize = wh;
          _this.$img = $img;
          return defer.resolve();
        });
        return defer.promise();
      };

      Dialog.prototype._removeSpinner = function() {
        var defer,
          _this = this;
        defer = $.Deferred();
        ($.when(ns.fadeOut(this.$loader))).done(function() {
          _this.$loader.empty().remove();
          return defer.resolve();
        });
        return defer.promise();
      };

      Dialog.prototype._eventify = function() {
        var _this = this;
        this._openerClickHandler = function(e) {
          e.preventDefault();
          return _this.open();
        };
        this._resizeHandler = function(e) {
          _this.resizeDialog();
          return _this.resizeEls();
        };
        this.$opener.bind('click', this._openerClickHandler);
        return $window.bind('resize orientationchange', this._resizeHandler);
      };

      Dialog.prototype._prepareElsInsideDialog = function() {
        this.$main = $(this.options.selector_main, this.$dialog);
        this.$holder = $(this.options.selector_holder, this.$dialog);
        return this.$main.css('display', 'none');
      };

      return Dialog;

    })();
    $.fn.lycheeBox = function(options) {
      return this.each(function(i, el) {
        var $opener, instance;
        $opener = $(el);
        instance = $opener.data('lycheebox');
        if (instance != null) {
          instance.destroy();
        }
        instance = new ns.Dialog($opener, options);
        return $opener.data('liycheebox', instance);
      });
    };
    return $.LycheeBox = ns;
  })(jQuery);

}).call(this);
