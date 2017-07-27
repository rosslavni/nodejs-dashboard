"use strict";

var assert = require("assert");
var contrib = require("blessed-contrib");
var util = require("util");
var _ = require("lodash");

var BaseView = require("./base-view");

var BaseLineGraph = function BaseLineGraph(options) {
  var setupEventHandlers = function setupEventHandlers() {
    this._boundOnEvent = this.onEvent.bind(this);
    this._boundOnRefreshMetrics = this.onRefreshMetrics.bind(this);

    options.metricsProvider.on("metrics", this._boundOnEvent);
    options.metricsProvider.on("refreshMetrics", this._boundOnRefreshMetrics);
  }.bind(this);

  BaseView.call(this, options);

  assert(options.metricsProvider, "View requires metricsProvider");
  this.metricsProvider = options.metricsProvider;

  this.unit = options.unit || "";
  this.label = this.layoutConfig.title ? util.format(" %s ", this.layoutConfig.title) : " ";

  this._remountOnResize = true;

  this.limit = this.layoutConfig.limit;
  this.seriesOptions = options.series;

  var xAxis = this.metricsProvider.getXAxis(this.layoutConfig.limit);
  this.series = _.mapValues(options.series, function (seriesConfig) {
    if (seriesConfig.highwater && !seriesConfig.color) {
      seriesConfig.color = "red";
    }
    return {
      x: xAxis,
      y: _.times(this.layoutConfig.limit, _.constant(0)),
      style: {
        line: seriesConfig.color
      }
    };
  }.bind(this));

  this._createGraph(options);

  setupEventHandlers();
};

BaseLineGraph.prototype = Object.create(BaseView.prototype);

BaseLineGraph.prototype.onEvent = function () {
  throw new Error("BaseLineGraph onEvent should be overwritten");
};

BaseLineGraph.prototype.onRefreshMetrics = function () {
  throw new Error("BaseLineGraph onRefreshMetrics should be overwritten");
};

BaseLineGraph.prototype._isHighwater = function (name) {
  return this.seriesOptions[name].highwater;
};

// Should be called by child's onEvent handler
BaseLineGraph.prototype.update = function (values) {
  _.each(values, function (value, seriesName) {
    if (!this.series[seriesName]) {
      return;
    }
    if (this._isHighwater(seriesName)) {
      this.series[seriesName].y = _.times(this.limit, _.constant(value));
    } else {
      this.series[seriesName].y.shift();
      this.series[seriesName].y.push(value);
    }
  }.bind(this));

  this._updateLabel();

  this.node.setData(_.values(this.series));
};

BaseLineGraph.prototype.refresh = function (mapper) {
  var data = mapper(this.metricsProvider.getMetrics(this.limit));
  var xAxis = this.metricsProvider.getXAxis(this.layoutConfig.limit);

  _.each(data[0], function (value, seriesName) {
    if (!this.series[seriesName]) {
      return;
    }
    if (this._isHighwater(seriesName)) {
      this.series[seriesName].y = _.times(this.limit, _.constant(value));
    } else {
      this.series[seriesName].y = _.times(this.limit, _.constant(0));
    }
    this.series[seriesName].x = xAxis;
  }.bind(this));

  _.each(data, function (values) {
    _.each(values, function (value, seriesName) {
      if (!this.series[seriesName]) {
        return;
      }
      if (!this._isHighwater(seriesName)) {
        this.series[seriesName].y.shift();
        this.series[seriesName].y.push(value);
      }
    }.bind(this));
  }.bind(this));

  this._updateLabel();

  this.node.setData(_.values(this.series));
};

BaseLineGraph.prototype._updateLabel = function () {
  // use view label + series labels/data

  var seriesLabels = _.map(this.series, function (series, id) {
    var seriesLabel = "";
    if (this.seriesOptions[id].label) {
      seriesLabel = this.seriesOptions[id].label + " ";
    } else if (!this.seriesOptions[id].hasOwnProperty("label")) {
      seriesLabel = id + " ";
    }
    return util.format("%s(%d%s)", seriesLabel, _.last(this.series[id].y), this.unit);
  }.bind(this)).join(", ");

  this.node.setLabel(util.format("%s%s ", this.label, seriesLabels));
};

BaseLineGraph.prototype._createGraph = function (options) {
  this.node = contrib.line({
    label: this.label,
    border: "line",
    numYLabels: 4,
    maxY: options.maxY,
    showLegend: false,
    wholeNumbersOnly: true,
    style: {
      border: {
        fg: this.layoutConfig.borderColor
      }
    }
  });

  this.recalculatePosition();

  this.parent.append(this.node);

  var values = this.metricsProvider.getMetrics(this.limit);
  _.each(values, function (value) {
    this.onEvent(value);
  }.bind(this));
};

BaseLineGraph.prototype.destroy = function () {
  BaseView.prototype.destroy.call(this);

  this.metricsProvider.removeListener("metrics", this._boundOnEvent);
  this.metricsProvider.removeListener("refreshMetrics", this._boundOnRefreshMetrics);

  this._boundOnEvent = null;
  this._boundOnRefreshMetrics = null;
  this.metricsProvider = null;
};

module.exports = BaseLineGraph;
