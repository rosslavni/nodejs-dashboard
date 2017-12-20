"use strict";

var _ = require("lodash");
var expect = require("chai").expect;

var Panel = require("../../../lib/views/panel");

/* eslint-disable no-magic-numbers */
describe("Panel", function () {

  var parent = {
    top: 0,
    left: 0,
    width: 17,
    height: 13
  };

  var createPanel = function (layouts) {
    var views = layouts.map(function (config) {
      return _.merge({ type: "panel" }, config);
    });

    return new Panel({
      layoutConfig: {
        view: {
          type: "panel",
          views: views
        },
        getPosition: _.identity
      },
      creator: _.identity
    });
  };

  describe("layout panel", function () {
    it("should create fullscreen view", function () {
      var layouts = createPanel([{
        views: [
          {
            type: "memory"
          }
        ]
      }]);
      expect(layouts.views[0]).to.have.property("getPosition").that.is.a("function");
      expect(layouts.views[0].getPosition(parent)).to.be.deep.equal({
        left: 0,
        top: 0,
        width: parent.width,
        height: parent.height
      });
    });

    it("should create exact width panel", function () {
      var layouts = createPanel([{
        position: {
          size: 11
        },
        views: [
          {
            type: "memory"
          }
        ]
      }]);
      expect(layouts.views[0].getPosition(parent)).to.be.deep.equal({
        left: 0,
        top: 0,
        width: 11,
        height: parent.height
      });
    });

    it("should create growing panels", function () {
      var layouts = createPanel([
        {
          position: {
            grow: 2
          },
          views: [
            {
              type: "memory"
            }
          ]
        },
        {
          position: {
            grow: 3
          },
          views: [
            {
              type: "memory"
            }
          ]
        }
      ]);
      expect(layouts.views[0].getPosition(parent)).to.be.deep.equal({
        left: 0,
        top: 0,
        width: 7,
        height: parent.height
      });
      expect(layouts.views[1].getPosition(parent)).to.be.deep.equal({
        left: 7,
        top: 0,
        width: 10,
        height: parent.height
      });
    });

    it("should create mixed width panels", function () {
      var layouts = createPanel([
        {
          position: {
            grow: 2
          },
          views: [
            {
              type: "memory"
            }
          ]
        },
        {
          position: {
            size: 4
          },
          views: [
            {
              type: "memory"
            }
          ]
        },
        {
          position: {
            grow: 3
          },
          views: [
            {
              type: "memory"
            }
          ]
        }
      ]);
      expect(layouts.views[0].getPosition(parent)).to.be.deep.equal({
        left: 0,
        top: 0,
        width: 6,
        height: parent.height
      });
      expect(layouts.views[1].getPosition(parent)).to.be.deep.equal({
        left: 6,
        top: 0,
        width: 4,
        height: parent.height
      });
      expect(layouts.views[2].getPosition(parent)).to.be.deep.equal({
        left: 10,
        top: 0,
        width: 7,
        height: parent.height
      });
    });

    it("should create exact height view", function () {
      var layouts = createPanel([
        {
          views: [
            {
              position: {
                size: 11
              },
              type: "memory"
            }
          ]
        }
      ]);
      expect(layouts.views[0].getPosition(parent)).to.be.deep.equal({
        left: 0,
        top: 0,
        width: parent.width,
        height: 11
      });
    });

    it("should create growing views", function () {
      var layouts = createPanel([
        {
          views: [
            {
              position: {
                grow: 2
              },
              type: "memory"
            },
            {
              position: {
                grow: 3
              },
              type: "memory"
            }
          ]
        }
      ]);
      expect(layouts.views[0].getPosition(parent)).to.be.deep.equal({
        left: 0,
        top: 0,
        width: parent.width,
        height: 6
      });
      expect(layouts.views[1].getPosition(parent)).to.be.deep.equal({
        left: 0,
        top: 6,
        width: parent.width,
        height: 7
      });
    });

    it("should create mixed height views", function () {
      var layouts = createPanel([
        {
          views: [
            {
              position: {
                grow: 2
              },
              type: "memory"
            },
            {
              position: {
                size: 4
              },
              type: "memory"
            },
            {
              position: {
                grow: 3
              },
              type: "memory"
            }
          ]
        }
      ]);
      expect(layouts.views[0].getPosition(parent)).to.be.deep.equal({
        left: 0,
        top: 0,
        width: parent.width,
        height: 4
      });
      expect(layouts.views[1].getPosition(parent)).to.be.deep.equal({
        left: 0,
        top: 4,
        width: parent.width,
        height: 4
      });
      expect(layouts.views[2].getPosition(parent)).to.be.deep.equal({
        left: 0,
        top: 8,
        width: parent.width,
        height: 5
      });
    });
  });
});
