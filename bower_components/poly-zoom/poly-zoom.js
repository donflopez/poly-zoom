Polymer({
  is: "poly-zoom",

  properties: {
    reverse: {
      type: Boolean,
      value: true
    },
    upperLimit: {
      type: Number,
      value: 3
    }
  },

  listeners: {
    "zoomed.wheel": "onScroll",
    "zoomed.track": "track"
  },

  ready: function() {
    this.zoomed = this.$.zoomed;
    this.scale = 1;
    this.originX = 0;
    this.originY = 0;
    this.x = 0;
    this.y = 0;
    this.lastX = 0;
    this.lastY = 0;

    this.sFactor = 0.01;

    this.zoomed.style.transform = "scale(1) translate3d(0,0,0)";
    this.zoomed.style[ "transform-origin" ] = "0 0";
  },

  reset: function() {
    var self = this;

    this.zoomed.style.transition = "all .3s ease";
    // window.getComputedStyle( this.zoomed );
    this.zoomed.style.transform = "scale(1) translate3d(0,0,0)";
    this.zoomed.style[ "transform-origin" ] = "0 0";
    // window.getComputedStyle( this.zoomed );

    this.originX = 0;
    this.originY = 0;
    this.scale = 1;
    this.x = 0;
    this.y = 0;
    this.lastX = 0;
    this.lastY = 0;

    setTimeout(function() {
      self.zoomed.style.transition = "";
    }, 200 );
  },

  _timerRef: null,

  _timer: function( time ) {
    var self = this;
    if ( this._timerRef ) {
      clearTimeout( this._timerRef );
    }

    this._timerRef = setTimeout(function() {
      self._onStopScroll();
    }, time );
  },

  _onStopScroll: function() {
    if ( this.scale === 1 ) {
      this.reset();
    }
  },

  onScroll: function( e ) {
    e.preventDefault();
    this.rect = this.scale === 1 ? this.getBoundingClientRect() : this.rect;

    var x = e.x - this.rect.left,
        y = e.y - this.rect.top;

    this.originX = this.originX + ( (x - this.lastX) / this.scale );
    this.originY = this.originY + ( (y - this.lastY) / this.scale );

    this.scale = this._getScale( e.deltaY, this.reverse );

    this.x = (x - this.originX) / this.scale;
    this.y = (y - this.originY) / this.scale;

    this.lastX = x;
    this.lastY = y;

    this._apply();

    this._timer( 200 );
  },

  _getScale: function( deltaY, reverse ) {
    deltaY = reverse ? deltaY : deltaY * -1;

    var incr = deltaY !== undefined ? deltaY * this.sFactor : this.sFactor * 10,
        scale = this.scale + incr;

    scale = scale >= 1 ? scale <= this.upperLimit ? scale : this.upperLimit : 1;

    return scale;
  },

  _apply: function() {
    var scale = "scale(" + this.scale + ") ",
        translate = "translate3d(" + this.x + "px, " + this.y + "px, 0)",
        origin = this.originX + "px " + this.originY + "px";

    this.zoomed.style.transform = scale + translate;
    this.zoomed.style[ "transform-origin" ] = origin;
  },

  track: function( e ) {
    switch ( e.detail.state ) {
      case "track":
        this._onTrack( e );
        break;
      case "start":
        this._startHandle( e );
        break;
      case "end":
        this._endHandle( e );
        break;
      default:
    }
  },

  _onTrack: function( e ) {
    e.preventDefault();

    var x = (this.startX - e.detail.sourceEvent.screenX) / this.scale,
        y = (this.startY - e.detail.sourceEvent.screenY) / this.scale;

    this.x = this.atDownX - x;
    this.y = this.atDownY - y;

    this.apply();
  },

  _endHandle: function( e ) {
    this.originX += this.atDownX - this.x;
    this.originY += this.atDownY - this.y;
  },

  _startHandle: function( e ) {
    e.preventDefault();
    this.startX = e.detail.sourceEvent.screenX;
    this.startY = e.detail.sourceEvent.screenY;

    this.atDownX = this.x;
    this.atDownY = this.y;
  }
});
