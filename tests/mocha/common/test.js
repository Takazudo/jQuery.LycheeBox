(function() {
  var wait;

  wait = function(time) {
    return $.Deferred(function(defer) {
      return setTimeout(function() {
        return defer.resolve();
      }, time);
    });
  };

  describe('ns.common', function() {
    return describe('global exports', function() {
      it('should export namespace to global', function() {
        return (expect($.DomwinNs)).to.be.a('object');
      });
      return it('should export main class to global', function() {
        return (expect($.Domwin)).to.be.a('function');
      });
    });
  });

  describe('ns.util', function() {
    var util;
    util = $.DomwinNs.util;
    describe('feature/browser detection', function() {
      describe('isIe6', function() {
        return it('should return Boolean', function() {
          var res1, res2;
          res1 = util.isIe6();
          res2 = util.isIe6();
          (expect(res1)).to.be.a('boolean');
          (expect(res2)).to.be.a('boolean');
          return (expect(res1)).to.be(res2);
        });
      });
      return describe('isBlackListedMobile', function() {
        return it('should return Boolean', function() {
          var res1, res2;
          res1 = util.isBlackListedMobile();
          res2 = util.isBlackListedMobile();
          (expect(res1)).to.be.a('boolean');
          (expect(res2)).to.be.a('boolean');
          return (expect(res1)).to.be(res2);
        });
      });
    });
    return describe('viewport things', function() {
      return it('should return number', function() {
        (expect(util.viewportH())).to.be.a('number');
        (expect(util.viewportW())).to.be.a('number');
        (expect(util.offsetY())).to.be.a('number');
        return (expect(util.offsetX())).to.be.a('number');
      });
    });
  });

  describe('ns.support', function() {
    var support;
    support = $.DomwinNs.support;
    return describe('fixed', function() {
      return it('should return boolean', function() {
        var res1, res2;
        res1 = support.fixed();
        res2 = support.fixed();
        (expect(res1)).to.be.a('boolean');
        (expect(res2)).to.be.a('boolean');
        return (expect(res1)).to.be(res2);
      });
    });
  });

  describe('ns.winwatcher', function() {
    var ns;
    ns = $.DomwinNs;
    it("should have Winwatcher instance on namespace", function() {
      return (expect(ns.winwatcher != null)).to.be(true);
    });
    it("should fire `resize` event on window's resize", function() {
      var spy;
      spy = sinon.spy();
      ns.winwatcher.on('resize', spy);
      $(window).resize();
      return (expect(spy.calledOnce)).to.be(true);
    });
    return it("should not invoke already offed callbacks", function() {
      var spy;
      spy = sinon.spy();
      ns.winwatcher.on('resize', spy);
      $(window).resize();
      ns.winwatcher.off('resize', spy);
      $(window).resize();
      return (expect(spy.calledOnce)).to.be(true);
    });
  });

}).call(this);
