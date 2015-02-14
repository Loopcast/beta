
// POLVO :: AUTORELOAD
/*! Socket.IO.js build:0.9.16, development. Copyright(c) 2011 LearnBoost <dev@learnboost.com> MIT Licensed */

var io = ('undefined' === typeof module ? {} : module.exports);
(function() {

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, global) {

  /**
   * IO namespace.
   *
   * @namespace
   */

  var io = exports;

  /**
   * Socket.IO version
   *
   * @api public
   */

  io.version = '0.9.16';

  /**
   * Protocol implemented.
   *
   * @api public
   */

  io.protocol = 1;

  /**
   * Available transports, these will be populated with the available transports
   *
   * @api public
   */

  io.transports = [];

  /**
   * Keep track of jsonp callbacks.
   *
   * @api private
   */

  io.j = [];

  /**
   * Keep track of our io.Sockets
   *
   * @api private
   */
  io.sockets = {};


  /**
   * Manages connections to hosts.
   *
   * @param {String} uri
   * @Param {Boolean} force creation of new socket (defaults to false)
   * @api public
   */

  io.connect = function (host, details) {
    var uri = io.util.parseUri(host)
      , uuri
      , socket;

    if (global && global.location) {
      uri.protocol = uri.protocol || global.location.protocol.slice(0, -1);
      uri.host = uri.host || (global.document
        ? global.document.domain : global.location.hostname);
      uri.port = uri.port || global.location.port;
    }

    uuri = io.util.uniqueUri(uri);

    var options = {
        host: uri.host
      , secure: 'https' == uri.protocol
      , port: uri.port || ('https' == uri.protocol ? 443 : 80)
      , query: uri.query || ''
    };

    io.util.merge(options, details);

    if (options['force new connection'] || !io.sockets[uuri]) {
      socket = new io.Socket(options);
    }

    if (!options['force new connection'] && socket) {
      io.sockets[uuri] = socket;
    }

    socket = socket || io.sockets[uuri];

    // if path is different from '' or /
    return socket.of(uri.path.length > 1 ? uri.path : '');
  };

})('object' === typeof module ? module.exports : (this.io = {}), this);
/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, global) {

  /**
   * Utilities namespace.
   *
   * @namespace
   */

  var util = exports.util = {};

  /**
   * Parses an URI
   *
   * @author Steven Levithan <stevenlevithan.com> (MIT license)
   * @api public
   */

  var re = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

  var parts = ['source', 'protocol', 'authority', 'userInfo', 'user', 'password',
               'host', 'port', 'relative', 'path', 'directory', 'file', 'query',
               'anchor'];

  util.parseUri = function (str) {
    var m = re.exec(str || '')
      , uri = {}
      , i = 14;

    while (i--) {
      uri[parts[i]] = m[i] || '';
    }

    return uri;
  };

  /**
   * Produces a unique url that identifies a Socket.IO connection.
   *
   * @param {Object} uri
   * @api public
   */

  util.uniqueUri = function (uri) {
    var protocol = uri.protocol
      , host = uri.host
      , port = uri.port;

    if ('document' in global) {
      host = host || document.domain;
      port = port || (protocol == 'https'
        && document.location.protocol !== 'https:' ? 443 : document.location.port);
    } else {
      host = host || 'localhost';

      if (!port && protocol == 'https') {
        port = 443;
      }
    }

    return (protocol || 'http') + '://' + host + ':' + (port || 80);
  };

  /**
   * Mergest 2 query strings in to once unique query string
   *
   * @param {String} base
   * @param {String} addition
   * @api public
   */

  util.query = function (base, addition) {
    var query = util.chunkQuery(base || '')
      , components = [];

    util.merge(query, util.chunkQuery(addition || ''));
    for (var part in query) {
      if (query.hasOwnProperty(part)) {
        components.push(part + '=' + query[part]);
      }
    }

    return components.length ? '?' + components.join('&') : '';
  };

  /**
   * Transforms a querystring in to an object
   *
   * @param {String} qs
   * @api public
   */

  util.chunkQuery = function (qs) {
    var query = {}
      , params = qs.split('&')
      , i = 0
      , l = params.length
      , kv;

    for (; i < l; ++i) {
      kv = params[i].split('=');
      if (kv[0]) {
        query[kv[0]] = kv[1];
      }
    }

    return query;
  };

  /**
   * Executes the given function when the page is loaded.
   *
   *     io.util.load(function () { console.log('page loaded'); });
   *
   * @param {Function} fn
   * @api public
   */

  var pageLoaded = false;

  util.load = function (fn) {
    if ('document' in global && document.readyState === 'complete' || pageLoaded) {
      return fn();
    }

    util.on(global, 'load', fn, false);
  };

  /**
   * Adds an event.
   *
   * @api private
   */

  util.on = function (element, event, fn, capture) {
    if (element.attachEvent) {
      element.attachEvent('on' + event, fn);
    } else if (element.addEventListener) {
      element.addEventListener(event, fn, capture);
    }
  };

  /**
   * Generates the correct `XMLHttpRequest` for regular and cross domain requests.
   *
   * @param {Boolean} [xdomain] Create a request that can be used cross domain.
   * @returns {XMLHttpRequest|false} If we can create a XMLHttpRequest.
   * @api private
   */

  util.request = function (xdomain) {

    if (xdomain && 'undefined' != typeof XDomainRequest && !util.ua.hasCORS) {
      return new XDomainRequest();
    }

    if ('undefined' != typeof XMLHttpRequest && (!xdomain || util.ua.hasCORS)) {
      return new XMLHttpRequest();
    }

    if (!xdomain) {
      try {
        return new window[(['Active'].concat('Object').join('X'))]('Microsoft.XMLHTTP');
      } catch(e) { }
    }

    return null;
  };

  /**
   * XHR based transport constructor.
   *
   * @constructor
   * @api public
   */

  /**
   * Change the internal pageLoaded value.
   */

  if ('undefined' != typeof window) {
    util.load(function () {
      pageLoaded = true;
    });
  }

  /**
   * Defers a function to ensure a spinner is not displayed by the browser
   *
   * @param {Function} fn
   * @api public
   */

  util.defer = function (fn) {
    if (!util.ua.webkit || 'undefined' != typeof importScripts) {
      return fn();
    }

    util.load(function () {
      setTimeout(fn, 100);
    });
  };

  /**
   * Merges two objects.
   *
   * @api public
   */

  util.merge = function merge (target, additional, deep, lastseen) {
    var seen = lastseen || []
      , depth = typeof deep == 'undefined' ? 2 : deep
      , prop;

    for (prop in additional) {
      if (additional.hasOwnProperty(prop) && util.indexOf(seen, prop) < 0) {
        if (typeof target[prop] !== 'object' || !depth) {
          target[prop] = additional[prop];
          seen.push(additional[prop]);
        } else {
          util.merge(target[prop], additional[prop], depth - 1, seen);
        }
      }
    }

    return target;
  };

  /**
   * Merges prototypes from objects
   *
   * @api public
   */

  util.mixin = function (ctor, ctor2) {
    util.merge(ctor.prototype, ctor2.prototype);
  };

  /**
   * Shortcut for prototypical and static inheritance.
   *
   * @api private
   */

  util.inherit = function (ctor, ctor2) {
    function f() {};
    f.prototype = ctor2.prototype;
    ctor.prototype = new f;
  };

  /**
   * Checks if the given object is an Array.
   *
   *     io.util.isArray([]); // true
   *     io.util.isArray({}); // false
   *
   * @param Object obj
   * @api public
   */

  util.isArray = Array.isArray || function (obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  };

  /**
   * Intersects values of two arrays into a third
   *
   * @api public
   */

  util.intersect = function (arr, arr2) {
    var ret = []
      , longest = arr.length > arr2.length ? arr : arr2
      , shortest = arr.length > arr2.length ? arr2 : arr;

    for (var i = 0, l = shortest.length; i < l; i++) {
      if (~util.indexOf(longest, shortest[i]))
        ret.push(shortest[i]);
    }

    return ret;
  };

  /**
   * Array indexOf compatibility.
   *
   * @see bit.ly/a5Dxa2
   * @api public
   */

  util.indexOf = function (arr, o, i) {

    for (var j = arr.length, i = i < 0 ? i + j < 0 ? 0 : i + j : i || 0;
         i < j && arr[i] !== o; i++) {}

    return j <= i ? -1 : i;
  };

  /**
   * Converts enumerables to array.
   *
   * @api public
   */

  util.toArray = function (enu) {
    var arr = [];

    for (var i = 0, l = enu.length; i < l; i++)
      arr.push(enu[i]);

    return arr;
  };

  /**
   * UA / engines detection namespace.
   *
   * @namespace
   */

  util.ua = {};

  /**
   * Whether the UA supports CORS for XHR.
   *
   * @api public
   */

  util.ua.hasCORS = 'undefined' != typeof XMLHttpRequest && (function () {
    try {
      var a = new XMLHttpRequest();
    } catch (e) {
      return false;
    }

    return a.withCredentials != undefined;
  })();

  /**
   * Detect webkit.
   *
   * @api public
   */

  util.ua.webkit = 'undefined' != typeof navigator
    && /webkit/i.test(navigator.userAgent);

   /**
   * Detect iPad/iPhone/iPod.
   *
   * @api public
   */

  util.ua.iDevice = 'undefined' != typeof navigator
      && /iPad|iPhone|iPod/i.test(navigator.userAgent);

})('undefined' != typeof io ? io : module.exports, this);
/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io) {

  /**
   * Expose constructor.
   */

  exports.EventEmitter = EventEmitter;

  /**
   * Event emitter constructor.
   *
   * @api public.
   */

  function EventEmitter () {};

  /**
   * Adds a listener
   *
   * @api public
   */

  EventEmitter.prototype.on = function (name, fn) {
    if (!this.$events) {
      this.$events = {};
    }

    if (!this.$events[name]) {
      this.$events[name] = fn;
    } else if (io.util.isArray(this.$events[name])) {
      this.$events[name].push(fn);
    } else {
      this.$events[name] = [this.$events[name], fn];
    }

    return this;
  };

  EventEmitter.prototype.addListener = EventEmitter.prototype.on;

  /**
   * Adds a volatile listener.
   *
   * @api public
   */

  EventEmitter.prototype.once = function (name, fn) {
    var self = this;

    function on () {
      self.removeListener(name, on);
      fn.apply(this, arguments);
    };

    on.listener = fn;
    this.on(name, on);

    return this;
  };

  /**
   * Removes a listener.
   *
   * @api public
   */

  EventEmitter.prototype.removeListener = function (name, fn) {
    if (this.$events && this.$events[name]) {
      var list = this.$events[name];

      if (io.util.isArray(list)) {
        var pos = -1;

        for (var i = 0, l = list.length; i < l; i++) {
          if (list[i] === fn || (list[i].listener && list[i].listener === fn)) {
            pos = i;
            break;
          }
        }

        if (pos < 0) {
          return this;
        }

        list.splice(pos, 1);

        if (!list.length) {
          delete this.$events[name];
        }
      } else if (list === fn || (list.listener && list.listener === fn)) {
        delete this.$events[name];
      }
    }

    return this;
  };

  /**
   * Removes all listeners for an event.
   *
   * @api public
   */

  EventEmitter.prototype.removeAllListeners = function (name) {
    if (name === undefined) {
      this.$events = {};
      return this;
    }

    if (this.$events && this.$events[name]) {
      this.$events[name] = null;
    }

    return this;
  };

  /**
   * Gets all listeners for a certain event.
   *
   * @api publci
   */

  EventEmitter.prototype.listeners = function (name) {
    if (!this.$events) {
      this.$events = {};
    }

    if (!this.$events[name]) {
      this.$events[name] = [];
    }

    if (!io.util.isArray(this.$events[name])) {
      this.$events[name] = [this.$events[name]];
    }

    return this.$events[name];
  };

  /**
   * Emits an event.
   *
   * @api public
   */

  EventEmitter.prototype.emit = function (name) {
    if (!this.$events) {
      return false;
    }

    var handler = this.$events[name];

    if (!handler) {
      return false;
    }

    var args = Array.prototype.slice.call(arguments, 1);

    if ('function' == typeof handler) {
      handler.apply(this, args);
    } else if (io.util.isArray(handler)) {
      var listeners = handler.slice();

      for (var i = 0, l = listeners.length; i < l; i++) {
        listeners[i].apply(this, args);
      }
    } else {
      return false;
    }

    return true;
  };

})(
    'undefined' != typeof io ? io : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
);

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Based on JSON2 (http://www.JSON.org/js.html).
 */

(function (exports, nativeJSON) {
  "use strict";

  // use native JSON if it's available
  if (nativeJSON && nativeJSON.parse){
    return exports.JSON = {
      parse: nativeJSON.parse
    , stringify: nativeJSON.stringify
    };
  }

  var JSON = exports.JSON = {};

  function f(n) {
      // Format integers to have at least two digits.
      return n < 10 ? '0' + n : n;
  }

  function date(d, key) {
    return isFinite(d.valueOf()) ?
        d.getUTCFullYear()     + '-' +
        f(d.getUTCMonth() + 1) + '-' +
        f(d.getUTCDate())      + 'T' +
        f(d.getUTCHours())     + ':' +
        f(d.getUTCMinutes())   + ':' +
        f(d.getUTCSeconds())   + 'Z' : null;
  };

  var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
      escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
      gap,
      indent,
      meta = {    // table of character substitutions
          '\b': '\\b',
          '\t': '\\t',
          '\n': '\\n',
          '\f': '\\f',
          '\r': '\\r',
          '"' : '\\"',
          '\\': '\\\\'
      },
      rep;


  function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

      escapable.lastIndex = 0;
      return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
          var c = meta[a];
          return typeof c === 'string' ? c :
              '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
      }) + '"' : '"' + string + '"';
  }


  function str(key, holder) {

// Produce a string from holder[key].

      var i,          // The loop counter.
          k,          // The member key.
          v,          // The member value.
          length,
          mind = gap,
          partial,
          value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

      if (value instanceof Date) {
          value = date(key);
      }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

      if (typeof rep === 'function') {
          value = rep.call(holder, key, value);
      }

// What happens next depends on the value's type.

      switch (typeof value) {
      case 'string':
          return quote(value);

      case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

          return isFinite(value) ? String(value) : 'null';

      case 'boolean':
      case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

          return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

      case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

          if (!value) {
              return 'null';
          }

// Make an array to hold the partial results of stringifying this object value.

          gap += indent;
          partial = [];

// Is the value an array?

          if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

              length = value.length;
              for (i = 0; i < length; i += 1) {
                  partial[i] = str(i, value) || 'null';
              }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

              v = partial.length === 0 ? '[]' : gap ?
                  '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
                  '[' + partial.join(',') + ']';
              gap = mind;
              return v;
          }

// If the replacer is an array, use it to select the members to be stringified.

          if (rep && typeof rep === 'object') {
              length = rep.length;
              for (i = 0; i < length; i += 1) {
                  if (typeof rep[i] === 'string') {
                      k = rep[i];
                      v = str(k, value);
                      if (v) {
                          partial.push(quote(k) + (gap ? ': ' : ':') + v);
                      }
                  }
              }
          } else {

// Otherwise, iterate through all of the keys in the object.

              for (k in value) {
                  if (Object.prototype.hasOwnProperty.call(value, k)) {
                      v = str(k, value);
                      if (v) {
                          partial.push(quote(k) + (gap ? ': ' : ':') + v);
                      }
                  }
              }
          }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

          v = partial.length === 0 ? '{}' : gap ?
              '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
              '{' + partial.join(',') + '}';
          gap = mind;
          return v;
      }
  }

// If the JSON object does not yet have a stringify method, give it one.

  JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

      var i;
      gap = '';
      indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

      if (typeof space === 'number') {
          for (i = 0; i < space; i += 1) {
              indent += ' ';
          }

// If the space parameter is a string, it will be used as the indent string.

      } else if (typeof space === 'string') {
          indent = space;
      }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

      rep = replacer;
      if (replacer && typeof replacer !== 'function' &&
              (typeof replacer !== 'object' ||
              typeof replacer.length !== 'number')) {
          throw new Error('JSON.stringify');
      }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

      return str('', {'': value});
  };

// If the JSON object does not yet have a parse method, give it one.

  JSON.parse = function (text, reviver) {
  // The parse method takes a text and an optional reviver function, and returns
  // a JavaScript value if the text is a valid JSON text.

      var j;

      function walk(holder, key) {

  // The walk method is used to recursively walk the resulting structure so
  // that modifications can be made.

          var k, v, value = holder[key];
          if (value && typeof value === 'object') {
              for (k in value) {
                  if (Object.prototype.hasOwnProperty.call(value, k)) {
                      v = walk(value, k);
                      if (v !== undefined) {
                          value[k] = v;
                      } else {
                          delete value[k];
                      }
                  }
              }
          }
          return reviver.call(holder, key, value);
      }


  // Parsing happens in four stages. In the first stage, we replace certain
  // Unicode characters with escape sequences. JavaScript handles many characters
  // incorrectly, either silently deleting them, or treating them as line endings.

      text = String(text);
      cx.lastIndex = 0;
      if (cx.test(text)) {
          text = text.replace(cx, function (a) {
              return '\\u' +
                  ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
          });
      }

  // In the second stage, we run the text against regular expressions that look
  // for non-JSON patterns. We are especially concerned with '()' and 'new'
  // because they can cause invocation, and '=' because it can cause mutation.
  // But just to be safe, we want to reject all unexpected forms.

  // We split the second stage into 4 regexp operations in order to work around
  // crippling inefficiencies in IE's and Safari's regexp engines. First we
  // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
  // replace all simple value tokens with ']' characters. Third, we delete all
  // open brackets that follow a colon or comma or that begin the text. Finally,
  // we look to see that the remaining characters are only whitespace or ']' or
  // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

      if (/^[\],:{}\s]*$/
              .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                  .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                  .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

  // In the third stage we use the eval function to compile the text into a
  // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
  // in JavaScript: it can begin a block or an object literal. We wrap the text
  // in parens to eliminate the ambiguity.

          j = eval('(' + text + ')');

  // In the optional fourth stage, we recursively walk the new structure, passing
  // each name/value pair to a reviver function for possible transformation.

          return typeof reviver === 'function' ?
              walk({'': j}, '') : j;
      }

  // If the text is not JSON parseable, then a SyntaxError is thrown.

      throw new SyntaxError('JSON.parse');
  };

})(
    'undefined' != typeof io ? io : module.exports
  , typeof JSON !== 'undefined' ? JSON : undefined
);

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io) {

  /**
   * Parser namespace.
   *
   * @namespace
   */

  var parser = exports.parser = {};

  /**
   * Packet types.
   */

  var packets = parser.packets = [
      'disconnect'
    , 'connect'
    , 'heartbeat'
    , 'message'
    , 'json'
    , 'event'
    , 'ack'
    , 'error'
    , 'noop'
  ];

  /**
   * Errors reasons.
   */

  var reasons = parser.reasons = [
      'transport not supported'
    , 'client not handshaken'
    , 'unauthorized'
  ];

  /**
   * Errors advice.
   */

  var advice = parser.advice = [
      'reconnect'
  ];

  /**
   * Shortcuts.
   */

  var JSON = io.JSON
    , indexOf = io.util.indexOf;

  /**
   * Encodes a packet.
   *
   * @api private
   */

  parser.encodePacket = function (packet) {
    var type = indexOf(packets, packet.type)
      , id = packet.id || ''
      , endpoint = packet.endpoint || ''
      , ack = packet.ack
      , data = null;

    switch (packet.type) {
      case 'error':
        var reason = packet.reason ? indexOf(reasons, packet.reason) : ''
          , adv = packet.advice ? indexOf(advice, packet.advice) : '';

        if (reason !== '' || adv !== '')
          data = reason + (adv !== '' ? ('+' + adv) : '');

        break;

      case 'message':
        if (packet.data !== '')
          data = packet.data;
        break;

      case 'event':
        var ev = { name: packet.name };

        if (packet.args && packet.args.length) {
          ev.args = packet.args;
        }

        data = JSON.stringify(ev);
        break;

      case 'json':
        data = JSON.stringify(packet.data);
        break;

      case 'connect':
        if (packet.qs)
          data = packet.qs;
        break;

      case 'ack':
        data = packet.ackId
          + (packet.args && packet.args.length
              ? '+' + JSON.stringify(packet.args) : '');
        break;
    }

    // construct packet with required fragments
    var encoded = [
        type
      , id + (ack == 'data' ? '+' : '')
      , endpoint
    ];

    // data fragment is optional
    if (data !== null && data !== undefined)
      encoded.push(data);

    return encoded.join(':');
  };

  /**
   * Encodes multiple messages (payload).
   *
   * @param {Array} messages
   * @api private
   */

  parser.encodePayload = function (packets) {
    var decoded = '';

    if (packets.length == 1)
      return packets[0];

    for (var i = 0, l = packets.length; i < l; i++) {
      var packet = packets[i];
      decoded += '\ufffd' + packet.length + '\ufffd' + packets[i];
    }

    return decoded;
  };

  /**
   * Decodes a packet
   *
   * @api private
   */

  var regexp = /([^:]+):([0-9]+)?(\+)?:([^:]+)?:?([\s\S]*)?/;

  parser.decodePacket = function (data) {
    var pieces = data.match(regexp);

    if (!pieces) return {};

    var id = pieces[2] || ''
      , data = pieces[5] || ''
      , packet = {
            type: packets[pieces[1]]
          , endpoint: pieces[4] || ''
        };

    // whether we need to acknowledge the packet
    if (id) {
      packet.id = id;
      if (pieces[3])
        packet.ack = 'data';
      else
        packet.ack = true;
    }

    // handle different packet types
    switch (packet.type) {
      case 'error':
        var pieces = data.split('+');
        packet.reason = reasons[pieces[0]] || '';
        packet.advice = advice[pieces[1]] || '';
        break;

      case 'message':
        packet.data = data || '';
        break;

      case 'event':
        try {
          var opts = JSON.parse(data);
          packet.name = opts.name;
          packet.args = opts.args;
        } catch (e) { }

        packet.args = packet.args || [];
        break;

      case 'json':
        try {
          packet.data = JSON.parse(data);
        } catch (e) { }
        break;

      case 'connect':
        packet.qs = data || '';
        break;

      case 'ack':
        var pieces = data.match(/^([0-9]+)(\+)?(.*)/);
        if (pieces) {
          packet.ackId = pieces[1];
          packet.args = [];

          if (pieces[3]) {
            try {
              packet.args = pieces[3] ? JSON.parse(pieces[3]) : [];
            } catch (e) { }
          }
        }
        break;

      case 'disconnect':
      case 'heartbeat':
        break;
    };

    return packet;
  };

  /**
   * Decodes data payload. Detects multiple messages
   *
   * @return {Array} messages
   * @api public
   */

  parser.decodePayload = function (data) {
    // IE doesn't like data[i] for unicode chars, charAt works fine
    if (data.charAt(0) == '\ufffd') {
      var ret = [];

      for (var i = 1, length = ''; i < data.length; i++) {
        if (data.charAt(i) == '\ufffd') {
          ret.push(parser.decodePacket(data.substr(i + 1).substr(0, length)));
          i += Number(length) + 1;
          length = '';
        } else {
          length += data.charAt(i);
        }
      }

      return ret;
    } else {
      return [parser.decodePacket(data)];
    }
  };

})(
    'undefined' != typeof io ? io : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
);
/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io) {

  /**
   * Expose constructor.
   */

  exports.Transport = Transport;

  /**
   * This is the transport template for all supported transport methods.
   *
   * @constructor
   * @api public
   */

  function Transport (socket, sessid) {
    this.socket = socket;
    this.sessid = sessid;
  };

  /**
   * Apply EventEmitter mixin.
   */

  io.util.mixin(Transport, io.EventEmitter);


  /**
   * Indicates whether heartbeats is enabled for this transport
   *
   * @api private
   */

  Transport.prototype.heartbeats = function () {
    return true;
  };

  /**
   * Handles the response from the server. When a new response is received
   * it will automatically update the timeout, decode the message and
   * forwards the response to the onMessage function for further processing.
   *
   * @param {String} data Response from the server.
   * @api private
   */

  Transport.prototype.onData = function (data) {
    this.clearCloseTimeout();

    // If the connection in currently open (or in a reopening state) reset the close
    // timeout since we have just received data. This check is necessary so
    // that we don't reset the timeout on an explicitly disconnected connection.
    if (this.socket.connected || this.socket.connecting || this.socket.reconnecting) {
      this.setCloseTimeout();
    }

    if (data !== '') {
      // todo: we should only do decodePayload for xhr transports
      var msgs = io.parser.decodePayload(data);

      if (msgs && msgs.length) {
        for (var i = 0, l = msgs.length; i < l; i++) {
          this.onPacket(msgs[i]);
        }
      }
    }

    return this;
  };

  /**
   * Handles packets.
   *
   * @api private
   */

  Transport.prototype.onPacket = function (packet) {
    this.socket.setHeartbeatTimeout();

    if (packet.type == 'heartbeat') {
      return this.onHeartbeat();
    }

    if (packet.type == 'connect' && packet.endpoint == '') {
      this.onConnect();
    }

    if (packet.type == 'error' && packet.advice == 'reconnect') {
      this.isOpen = false;
    }

    this.socket.onPacket(packet);

    return this;
  };

  /**
   * Sets close timeout
   *
   * @api private
   */

  Transport.prototype.setCloseTimeout = function () {
    if (!this.closeTimeout) {
      var self = this;

      this.closeTimeout = setTimeout(function () {
        self.onDisconnect();
      }, this.socket.closeTimeout);
    }
  };

  /**
   * Called when transport disconnects.
   *
   * @api private
   */

  Transport.prototype.onDisconnect = function () {
    if (this.isOpen) this.close();
    this.clearTimeouts();
    this.socket.onDisconnect();
    return this;
  };

  /**
   * Called when transport connects
   *
   * @api private
   */

  Transport.prototype.onConnect = function () {
    this.socket.onConnect();
    return this;
  };

  /**
   * Clears close timeout
   *
   * @api private
   */

  Transport.prototype.clearCloseTimeout = function () {
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = null;
    }
  };

  /**
   * Clear timeouts
   *
   * @api private
   */

  Transport.prototype.clearTimeouts = function () {
    this.clearCloseTimeout();

    if (this.reopenTimeout) {
      clearTimeout(this.reopenTimeout);
    }
  };

  /**
   * Sends a packet
   *
   * @param {Object} packet object.
   * @api private
   */

  Transport.prototype.packet = function (packet) {
    this.send(io.parser.encodePacket(packet));
  };

  /**
   * Send the received heartbeat message back to server. So the server
   * knows we are still connected.
   *
   * @param {String} heartbeat Heartbeat response from the server.
   * @api private
   */

  Transport.prototype.onHeartbeat = function (heartbeat) {
    this.packet({ type: 'heartbeat' });
  };

  /**
   * Called when the transport opens.
   *
   * @api private
   */

  Transport.prototype.onOpen = function () {
    this.isOpen = true;
    this.clearCloseTimeout();
    this.socket.onOpen();
  };

  /**
   * Notifies the base when the connection with the Socket.IO server
   * has been disconnected.
   *
   * @api private
   */

  Transport.prototype.onClose = function () {
    var self = this;

    /* FIXME: reopen delay causing a infinit loop
    this.reopenTimeout = setTimeout(function () {
      self.open();
    }, this.socket.options['reopen delay']);*/

    this.isOpen = false;
    this.socket.onClose();
    this.onDisconnect();
  };

  /**
   * Generates a connection url based on the Socket.IO URL Protocol.
   * See <https://github.com/learnboost/socket.io-node/> for more details.
   *
   * @returns {String} Connection url
   * @api private
   */

  Transport.prototype.prepareUrl = function () {
    var options = this.socket.options;

    return this.scheme() + '://'
      + options.host + ':' + options.port + '/'
      + options.resource + '/' + io.protocol
      + '/' + this.name + '/' + this.sessid;
  };

  /**
   * Checks if the transport is ready to start a connection.
   *
   * @param {Socket} socket The socket instance that needs a transport
   * @param {Function} fn The callback
   * @api private
   */

  Transport.prototype.ready = function (socket, fn) {
    fn.call(this);
  };
})(
    'undefined' != typeof io ? io : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
);
/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io, global) {

  /**
   * Expose constructor.
   */

  exports.Socket = Socket;

  /**
   * Create a new `Socket.IO client` which can establish a persistent
   * connection with a Socket.IO enabled server.
   *
   * @api public
   */

  function Socket (options) {
    this.options = {
        port: 80
      , secure: false
      , document: 'document' in global ? document : false
      , resource: 'socket.io'
      , transports: io.transports
      , 'connect timeout': 10000
      , 'try multiple transports': true
      , 'reconnect': true
      , 'reconnection delay': 500
      , 'reconnection limit': Infinity
      , 'reopen delay': 3000
      , 'max reconnection attempts': 10
      , 'sync disconnect on unload': false
      , 'auto connect': true
      , 'flash policy port': 10843
      , 'manualFlush': false
    };

    io.util.merge(this.options, options);

    this.connected = false;
    this.open = false;
    this.connecting = false;
    this.reconnecting = false;
    this.namespaces = {};
    this.buffer = [];
    this.doBuffer = false;

    if (this.options['sync disconnect on unload'] &&
        (!this.isXDomain() || io.util.ua.hasCORS)) {
      var self = this;
      io.util.on(global, 'beforeunload', function () {
        self.disconnectSync();
      }, false);
    }

    if (this.options['auto connect']) {
      this.connect();
    }
};

  /**
   * Apply EventEmitter mixin.
   */

  io.util.mixin(Socket, io.EventEmitter);

  /**
   * Returns a namespace listener/emitter for this socket
   *
   * @api public
   */

  Socket.prototype.of = function (name) {
    if (!this.namespaces[name]) {
      this.namespaces[name] = new io.SocketNamespace(this, name);

      if (name !== '') {
        this.namespaces[name].packet({ type: 'connect' });
      }
    }

    return this.namespaces[name];
  };

  /**
   * Emits the given event to the Socket and all namespaces
   *
   * @api private
   */

  Socket.prototype.publish = function () {
    this.emit.apply(this, arguments);

    var nsp;

    for (var i in this.namespaces) {
      if (this.namespaces.hasOwnProperty(i)) {
        nsp = this.of(i);
        nsp.$emit.apply(nsp, arguments);
      }
    }
  };

  /**
   * Performs the handshake
   *
   * @api private
   */

  function empty () { };

  Socket.prototype.handshake = function (fn) {
    var self = this
      , options = this.options;

    function complete (data) {
      if (data instanceof Error) {
        self.connecting = false;
        self.onError(data.message);
      } else {
        fn.apply(null, data.split(':'));
      }
    };

    var url = [
          'http' + (options.secure ? 's' : '') + ':/'
        , options.host + ':' + options.port
        , options.resource
        , io.protocol
        , io.util.query(this.options.query, 't=' + +new Date)
      ].join('/');

    if (this.isXDomain() && !io.util.ua.hasCORS) {
      var insertAt = document.getElementsByTagName('script')[0]
        , script = document.createElement('script');

      script.src = url + '&jsonp=' + io.j.length;
      insertAt.parentNode.insertBefore(script, insertAt);

      io.j.push(function (data) {
        complete(data);
        script.parentNode.removeChild(script);
      });
    } else {
      var xhr = io.util.request();

      xhr.open('GET', url, true);
      if (this.isXDomain()) {
        xhr.withCredentials = true;
      }
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          xhr.onreadystatechange = empty;

          if (xhr.status == 200) {
            complete(xhr.responseText);
          } else if (xhr.status == 403) {
            self.onError(xhr.responseText);
          } else {
            self.connecting = false;            
            !self.reconnecting && self.onError(xhr.responseText);
          }
        }
      };
      xhr.send(null);
    }
  };

  /**
   * Find an available transport based on the options supplied in the constructor.
   *
   * @api private
   */

  Socket.prototype.getTransport = function (override) {
    var transports = override || this.transports, match;

    for (var i = 0, transport; transport = transports[i]; i++) {
      if (io.Transport[transport]
        && io.Transport[transport].check(this)
        && (!this.isXDomain() || io.Transport[transport].xdomainCheck(this))) {
        return new io.Transport[transport](this, this.sessionid);
      }
    }

    return null;
  };

  /**
   * Connects to the server.
   *
   * @param {Function} [fn] Callback.
   * @returns {io.Socket}
   * @api public
   */

  Socket.prototype.connect = function (fn) {
    if (this.connecting) {
      return this;
    }

    var self = this;
    self.connecting = true;
    
    this.handshake(function (sid, heartbeat, close, transports) {
      self.sessionid = sid;
      self.closeTimeout = close * 1000;
      self.heartbeatTimeout = heartbeat * 1000;
      if(!self.transports)
          self.transports = self.origTransports = (transports ? io.util.intersect(
              transports.split(',')
            , self.options.transports
          ) : self.options.transports);

      self.setHeartbeatTimeout();

      function connect (transports){
        if (self.transport) self.transport.clearTimeouts();

        self.transport = self.getTransport(transports);
        if (!self.transport) return self.publish('connect_failed');

        // once the transport is ready
        self.transport.ready(self, function () {
          self.connecting = true;
          self.publish('connecting', self.transport.name);
          self.transport.open();

          if (self.options['connect timeout']) {
            self.connectTimeoutTimer = setTimeout(function () {
              if (!self.connected) {
                self.connecting = false;

                if (self.options['try multiple transports']) {
                  var remaining = self.transports;

                  while (remaining.length > 0 && remaining.splice(0,1)[0] !=
                         self.transport.name) {}

                    if (remaining.length){
                      connect(remaining);
                    } else {
                      self.publish('connect_failed');
                    }
                }
              }
            }, self.options['connect timeout']);
          }
        });
      }

      connect(self.transports);

      self.once('connect', function (){
        clearTimeout(self.connectTimeoutTimer);

        fn && typeof fn == 'function' && fn();
      });
    });

    return this;
  };

  /**
   * Clears and sets a new heartbeat timeout using the value given by the
   * server during the handshake.
   *
   * @api private
   */

  Socket.prototype.setHeartbeatTimeout = function () {
    clearTimeout(this.heartbeatTimeoutTimer);
    if(this.transport && !this.transport.heartbeats()) return;

    var self = this;
    this.heartbeatTimeoutTimer = setTimeout(function () {
      self.transport.onClose();
    }, this.heartbeatTimeout);
  };

  /**
   * Sends a message.
   *
   * @param {Object} data packet.
   * @returns {io.Socket}
   * @api public
   */

  Socket.prototype.packet = function (data) {
    if (this.connected && !this.doBuffer) {
      this.transport.packet(data);
    } else {
      this.buffer.push(data);
    }

    return this;
  };

  /**
   * Sets buffer state
   *
   * @api private
   */

  Socket.prototype.setBuffer = function (v) {
    this.doBuffer = v;

    if (!v && this.connected && this.buffer.length) {
      if (!this.options['manualFlush']) {
        this.flushBuffer();
      }
    }
  };

  /**
   * Flushes the buffer data over the wire.
   * To be invoked manually when 'manualFlush' is set to true.
   *
   * @api public
   */

  Socket.prototype.flushBuffer = function() {
    this.transport.payload(this.buffer);
    this.buffer = [];
  };
  

  /**
   * Disconnect the established connect.
   *
   * @returns {io.Socket}
   * @api public
   */

  Socket.prototype.disconnect = function () {
    if (this.connected || this.connecting) {
      if (this.open) {
        this.of('').packet({ type: 'disconnect' });
      }

      // handle disconnection immediately
      this.onDisconnect('booted');
    }

    return this;
  };

  /**
   * Disconnects the socket with a sync XHR.
   *
   * @api private
   */

  Socket.prototype.disconnectSync = function () {
    // ensure disconnection
    var xhr = io.util.request();
    var uri = [
        'http' + (this.options.secure ? 's' : '') + ':/'
      , this.options.host + ':' + this.options.port
      , this.options.resource
      , io.protocol
      , ''
      , this.sessionid
    ].join('/') + '/?disconnect=1';

    xhr.open('GET', uri, false);
    xhr.send(null);

    // handle disconnection immediately
    this.onDisconnect('booted');
  };

  /**
   * Check if we need to use cross domain enabled transports. Cross domain would
   * be a different port or different domain name.
   *
   * @returns {Boolean}
   * @api private
   */

  Socket.prototype.isXDomain = function () {

    var port = global.location.port ||
      ('https:' == global.location.protocol ? 443 : 80);

    return this.options.host !== global.location.hostname 
      || this.options.port != port;
  };

  /**
   * Called upon handshake.
   *
   * @api private
   */

  Socket.prototype.onConnect = function () {
    if (!this.connected) {
      this.connected = true;
      this.connecting = false;
      if (!this.doBuffer) {
        // make sure to flush the buffer
        this.setBuffer(false);
      }
      this.emit('connect');
    }
  };

  /**
   * Called when the transport opens
   *
   * @api private
   */

  Socket.prototype.onOpen = function () {
    this.open = true;
  };

  /**
   * Called when the transport closes.
   *
   * @api private
   */

  Socket.prototype.onClose = function () {
    this.open = false;
    clearTimeout(this.heartbeatTimeoutTimer);
  };

  /**
   * Called when the transport first opens a connection
   *
   * @param text
   */

  Socket.prototype.onPacket = function (packet) {
    this.of(packet.endpoint).onPacket(packet);
  };

  /**
   * Handles an error.
   *
   * @api private
   */

  Socket.prototype.onError = function (err) {
    if (err && err.advice) {
      if (err.advice === 'reconnect' && (this.connected || this.connecting)) {
        this.disconnect();
        if (this.options.reconnect) {
          this.reconnect();
        }
      }
    }

    this.publish('error', err && err.reason ? err.reason : err);
  };

  /**
   * Called when the transport disconnects.
   *
   * @api private
   */

  Socket.prototype.onDisconnect = function (reason) {
    var wasConnected = this.connected
      , wasConnecting = this.connecting;

    this.connected = false;
    this.connecting = false;
    this.open = false;

    if (wasConnected || wasConnecting) {
      this.transport.close();
      this.transport.clearTimeouts();
      if (wasConnected) {
        this.publish('disconnect', reason);

        if ('booted' != reason && this.options.reconnect && !this.reconnecting) {
          this.reconnect();
        }
      }
    }
  };

  /**
   * Called upon reconnection.
   *
   * @api private
   */

  Socket.prototype.reconnect = function () {
    this.reconnecting = true;
    this.reconnectionAttempts = 0;
    this.reconnectionDelay = this.options['reconnection delay'];

    var self = this
      , maxAttempts = this.options['max reconnection attempts']
      , tryMultiple = this.options['try multiple transports']
      , limit = this.options['reconnection limit'];

    function reset () {
      if (self.connected) {
        for (var i in self.namespaces) {
          if (self.namespaces.hasOwnProperty(i) && '' !== i) {
              self.namespaces[i].packet({ type: 'connect' });
          }
        }
        self.publish('reconnect', self.transport.name, self.reconnectionAttempts);
      }

      clearTimeout(self.reconnectionTimer);

      self.removeListener('connect_failed', maybeReconnect);
      self.removeListener('connect', maybeReconnect);

      self.reconnecting = false;

      delete self.reconnectionAttempts;
      delete self.reconnectionDelay;
      delete self.reconnectionTimer;
      delete self.redoTransports;

      self.options['try multiple transports'] = tryMultiple;
    };

    function maybeReconnect () {
      if (!self.reconnecting) {
        return;
      }

      if (self.connected) {
        return reset();
      };

      if (self.connecting && self.reconnecting) {
        return self.reconnectionTimer = setTimeout(maybeReconnect, 1000);
      }

      if (self.reconnectionAttempts++ >= maxAttempts) {
        if (!self.redoTransports) {
          self.on('connect_failed', maybeReconnect);
          self.options['try multiple transports'] = true;
          self.transports = self.origTransports;
          self.transport = self.getTransport();
          self.redoTransports = true;
          self.connect();
        } else {
          self.publish('reconnect_failed');
          reset();
        }
      } else {
        if (self.reconnectionDelay < limit) {
          self.reconnectionDelay *= 2; // exponential back off
        }

        self.connect();
        self.publish('reconnecting', self.reconnectionDelay, self.reconnectionAttempts);
        self.reconnectionTimer = setTimeout(maybeReconnect, self.reconnectionDelay);
      }
    };

    this.options['try multiple transports'] = false;
    this.reconnectionTimer = setTimeout(maybeReconnect, this.reconnectionDelay);

    this.on('connect', maybeReconnect);
  };

})(
    'undefined' != typeof io ? io : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
  , this
);
/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io) {

  /**
   * Expose constructor.
   */

  exports.SocketNamespace = SocketNamespace;

  /**
   * Socket namespace constructor.
   *
   * @constructor
   * @api public
   */

  function SocketNamespace (socket, name) {
    this.socket = socket;
    this.name = name || '';
    this.flags = {};
    this.json = new Flag(this, 'json');
    this.ackPackets = 0;
    this.acks = {};
  };

  /**
   * Apply EventEmitter mixin.
   */

  io.util.mixin(SocketNamespace, io.EventEmitter);

  /**
   * Copies emit since we override it
   *
   * @api private
   */

  SocketNamespace.prototype.$emit = io.EventEmitter.prototype.emit;

  /**
   * Creates a new namespace, by proxying the request to the socket. This
   * allows us to use the synax as we do on the server.
   *
   * @api public
   */

  SocketNamespace.prototype.of = function () {
    return this.socket.of.apply(this.socket, arguments);
  };

  /**
   * Sends a packet.
   *
   * @api private
   */

  SocketNamespace.prototype.packet = function (packet) {
    packet.endpoint = this.name;
    this.socket.packet(packet);
    this.flags = {};
    return this;
  };

  /**
   * Sends a message
   *
   * @api public
   */

  SocketNamespace.prototype.send = function (data, fn) {
    var packet = {
        type: this.flags.json ? 'json' : 'message'
      , data: data
    };

    if ('function' == typeof fn) {
      packet.id = ++this.ackPackets;
      packet.ack = true;
      this.acks[packet.id] = fn;
    }

    return this.packet(packet);
  };

  /**
   * Emits an event
   *
   * @api public
   */
  
  SocketNamespace.prototype.emit = function (name) {
    var args = Array.prototype.slice.call(arguments, 1)
      , lastArg = args[args.length - 1]
      , packet = {
            type: 'event'
          , name: name
        };

    if ('function' == typeof lastArg) {
      packet.id = ++this.ackPackets;
      packet.ack = 'data';
      this.acks[packet.id] = lastArg;
      args = args.slice(0, args.length - 1);
    }

    packet.args = args;

    return this.packet(packet);
  };

  /**
   * Disconnects the namespace
   *
   * @api private
   */

  SocketNamespace.prototype.disconnect = function () {
    if (this.name === '') {
      this.socket.disconnect();
    } else {
      this.packet({ type: 'disconnect' });
      this.$emit('disconnect');
    }

    return this;
  };

  /**
   * Handles a packet
   *
   * @api private
   */

  SocketNamespace.prototype.onPacket = function (packet) {
    var self = this;

    function ack () {
      self.packet({
          type: 'ack'
        , args: io.util.toArray(arguments)
        , ackId: packet.id
      });
    };

    switch (packet.type) {
      case 'connect':
        this.$emit('connect');
        break;

      case 'disconnect':
        if (this.name === '') {
          this.socket.onDisconnect(packet.reason || 'booted');
        } else {
          this.$emit('disconnect', packet.reason);
        }
        break;

      case 'message':
      case 'json':
        var params = ['message', packet.data];

        if (packet.ack == 'data') {
          params.push(ack);
        } else if (packet.ack) {
          this.packet({ type: 'ack', ackId: packet.id });
        }

        this.$emit.apply(this, params);
        break;

      case 'event':
        var params = [packet.name].concat(packet.args);

        if (packet.ack == 'data')
          params.push(ack);

        this.$emit.apply(this, params);
        break;

      case 'ack':
        if (this.acks[packet.ackId]) {
          this.acks[packet.ackId].apply(this, packet.args);
          delete this.acks[packet.ackId];
        }
        break;

      case 'error':
        if (packet.advice){
          this.socket.onError(packet);
        } else {
          if (packet.reason == 'unauthorized') {
            this.$emit('connect_failed', packet.reason);
          } else {
            this.$emit('error', packet.reason);
          }
        }
        break;
    }
  };

  /**
   * Flag interface.
   *
   * @api private
   */

  function Flag (nsp, name) {
    this.namespace = nsp;
    this.name = name;
  };

  /**
   * Send a message
   *
   * @api public
   */

  Flag.prototype.send = function () {
    this.namespace.flags[this.name] = true;
    this.namespace.send.apply(this.namespace, arguments);
  };

  /**
   * Emit an event
   *
   * @api public
   */

  Flag.prototype.emit = function () {
    this.namespace.flags[this.name] = true;
    this.namespace.emit.apply(this.namespace, arguments);
  };

})(
    'undefined' != typeof io ? io : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
);

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io, global) {

  /**
   * Expose constructor.
   */

  exports.websocket = WS;

  /**
   * The WebSocket transport uses the HTML5 WebSocket API to establish an
   * persistent connection with the Socket.IO server. This transport will also
   * be inherited by the FlashSocket fallback as it provides a API compatible
   * polyfill for the WebSockets.
   *
   * @constructor
   * @extends {io.Transport}
   * @api public
   */

  function WS (socket) {
    io.Transport.apply(this, arguments);
  };

  /**
   * Inherits from Transport.
   */

  io.util.inherit(WS, io.Transport);

  /**
   * Transport name
   *
   * @api public
   */

  WS.prototype.name = 'websocket';

  /**
   * Initializes a new `WebSocket` connection with the Socket.IO server. We attach
   * all the appropriate listeners to handle the responses from the server.
   *
   * @returns {Transport}
   * @api public
   */

  WS.prototype.open = function () {
    var query = io.util.query(this.socket.options.query)
      , self = this
      , Socket


    if (!Socket) {
      Socket = global.MozWebSocket || global.WebSocket;
    }

    this.websocket = new Socket(this.prepareUrl() + query);

    this.websocket.onopen = function () {
      self.onOpen();
      self.socket.setBuffer(false);
    };
    this.websocket.onmessage = function (ev) {
      self.onData(ev.data);
    };
    this.websocket.onclose = function () {
      self.onClose();
      self.socket.setBuffer(true);
    };
    this.websocket.onerror = function (e) {
      self.onError(e);
    };

    return this;
  };

  /**
   * Send a message to the Socket.IO server. The message will automatically be
   * encoded in the correct message format.
   *
   * @returns {Transport}
   * @api public
   */

  // Do to a bug in the current IDevices browser, we need to wrap the send in a 
  // setTimeout, when they resume from sleeping the browser will crash if 
  // we don't allow the browser time to detect the socket has been closed
  if (io.util.ua.iDevice) {
    WS.prototype.send = function (data) {
      var self = this;
      setTimeout(function() {
         self.websocket.send(data);
      },0);
      return this;
    };
  } else {
    WS.prototype.send = function (data) {
      this.websocket.send(data);
      return this;
    };
  }

  /**
   * Payload
   *
   * @api private
   */

  WS.prototype.payload = function (arr) {
    for (var i = 0, l = arr.length; i < l; i++) {
      this.packet(arr[i]);
    }
    return this;
  };

  /**
   * Disconnect the established `WebSocket` connection.
   *
   * @returns {Transport}
   * @api public
   */

  WS.prototype.close = function () {
    this.websocket.close();
    return this;
  };

  /**
   * Handle the errors that `WebSocket` might be giving when we
   * are attempting to connect or send messages.
   *
   * @param {Error} e The error.
   * @api private
   */

  WS.prototype.onError = function (e) {
    this.socket.onError(e);
  };

  /**
   * Returns the appropriate scheme for the URI generation.
   *
   * @api private
   */
  WS.prototype.scheme = function () {
    return this.socket.options.secure ? 'wss' : 'ws';
  };

  /**
   * Checks if the browser has support for native `WebSockets` and that
   * it's not the polyfill created for the FlashSocket transport.
   *
   * @return {Boolean}
   * @api public
   */

  WS.check = function () {
    return ('WebSocket' in global && !('__addTask' in WebSocket))
          || 'MozWebSocket' in global;
  };

  /**
   * Check if the `WebSocket` transport support cross domain communications.
   *
   * @returns {Boolean}
   * @api public
   */

  WS.xdomainCheck = function () {
    return true;
  };

  /**
   * Add the transport to your public io.transports array.
   *
   * @api private
   */

  io.transports.push('websocket');

})(
    'undefined' != typeof io ? io.Transport : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
  , this
);

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io) {

  /**
   * Expose constructor.
   */

  exports.flashsocket = Flashsocket;

  /**
   * The FlashSocket transport. This is a API wrapper for the HTML5 WebSocket
   * specification. It uses a .swf file to communicate with the server. If you want
   * to serve the .swf file from a other server than where the Socket.IO script is
   * coming from you need to use the insecure version of the .swf. More information
   * about this can be found on the github page.
   *
   * @constructor
   * @extends {io.Transport.websocket}
   * @api public
   */

  function Flashsocket () {
    io.Transport.websocket.apply(this, arguments);
  };

  /**
   * Inherits from Transport.
   */

  io.util.inherit(Flashsocket, io.Transport.websocket);

  /**
   * Transport name
   *
   * @api public
   */

  Flashsocket.prototype.name = 'flashsocket';

  /**
   * Disconnect the established `FlashSocket` connection. This is done by adding a 
   * new task to the FlashSocket. The rest will be handled off by the `WebSocket` 
   * transport.
   *
   * @returns {Transport}
   * @api public
   */

  Flashsocket.prototype.open = function () {
    var self = this
      , args = arguments;

    WebSocket.__addTask(function () {
      io.Transport.websocket.prototype.open.apply(self, args);
    });
    return this;
  };
  
  /**
   * Sends a message to the Socket.IO server. This is done by adding a new
   * task to the FlashSocket. The rest will be handled off by the `WebSocket` 
   * transport.
   *
   * @returns {Transport}
   * @api public
   */

  Flashsocket.prototype.send = function () {
    var self = this, args = arguments;
    WebSocket.__addTask(function () {
      io.Transport.websocket.prototype.send.apply(self, args);
    });
    return this;
  };

  /**
   * Disconnects the established `FlashSocket` connection.
   *
   * @returns {Transport}
   * @api public
   */

  Flashsocket.prototype.close = function () {
    WebSocket.__tasks.length = 0;
    io.Transport.websocket.prototype.close.call(this);
    return this;
  };

  /**
   * The WebSocket fall back needs to append the flash container to the body
   * element, so we need to make sure we have access to it. Or defer the call
   * until we are sure there is a body element.
   *
   * @param {Socket} socket The socket instance that needs a transport
   * @param {Function} fn The callback
   * @api private
   */

  Flashsocket.prototype.ready = function (socket, fn) {
    function init () {
      var options = socket.options
        , port = options['flash policy port']
        , path = [
              'http' + (options.secure ? 's' : '') + ':/'
            , options.host + ':' + options.port
            , options.resource
            , 'static/flashsocket'
            , 'WebSocketMain' + (socket.isXDomain() ? 'Insecure' : '') + '.swf'
          ];

      // Only start downloading the swf file when the checked that this browser
      // actually supports it
      if (!Flashsocket.loaded) {
        if (typeof WEB_SOCKET_SWF_LOCATION === 'undefined') {
          // Set the correct file based on the XDomain settings
          WEB_SOCKET_SWF_LOCATION = path.join('/');
        }

        if (port !== 843) {
          WebSocket.loadFlashPolicyFile('xmlsocket://' + options.host + ':' + port);
        }

        WebSocket.__initialize();
        Flashsocket.loaded = true;
      }

      fn.call(self);
    }

    var self = this;
    if (document.body) return init();

    io.util.load(init);
  };

  /**
   * Check if the FlashSocket transport is supported as it requires that the Adobe
   * Flash Player plug-in version `10.0.0` or greater is installed. And also check if
   * the polyfill is correctly loaded.
   *
   * @returns {Boolean}
   * @api public
   */

  Flashsocket.check = function () {
    if (
        typeof WebSocket == 'undefined'
      || !('__initialize' in WebSocket) || !swfobject
    ) return false;

    return swfobject.getFlashPlayerVersion().major >= 10;
  };

  /**
   * Check if the FlashSocket transport can be used as cross domain / cross origin 
   * transport. Because we can't see which type (secure or insecure) of .swf is used
   * we will just return true.
   *
   * @returns {Boolean}
   * @api public
   */

  Flashsocket.xdomainCheck = function () {
    return true;
  };

  /**
   * Disable AUTO_INITIALIZATION
   */

  if (typeof window != 'undefined') {
    WEB_SOCKET_DISABLE_AUTO_INITIALIZATION = true;
  }

  /**
   * Add the transport to your public io.transports array.
   *
   * @api private
   */

  io.transports.push('flashsocket');
})(
    'undefined' != typeof io ? io.Transport : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
);
/*	SWFObject v2.2 <http://code.google.com/p/swfobject/> 
	is released under the MIT License <http://www.opensource.org/licenses/mit-license.php> 
*/
if ('undefined' != typeof window) {
var swfobject=function(){var D="undefined",r="object",S="Shockwave Flash",W="ShockwaveFlash.ShockwaveFlash",q="application/x-shockwave-flash",R="SWFObjectExprInst",x="onreadystatechange",O=window,j=document,t=navigator,T=false,U=[h],o=[],N=[],I=[],l,Q,E,B,J=false,a=false,n,G,m=true,M=function(){var aa=typeof j.getElementById!=D&&typeof j.getElementsByTagName!=D&&typeof j.createElement!=D,ah=t.userAgent.toLowerCase(),Y=t.platform.toLowerCase(),ae=Y?/win/.test(Y):/win/.test(ah),ac=Y?/mac/.test(Y):/mac/.test(ah),af=/webkit/.test(ah)?parseFloat(ah.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):false,X=!+"\v1",ag=[0,0,0],ab=null;if(typeof t.plugins!=D&&typeof t.plugins[S]==r){ab=t.plugins[S].description;if(ab&&!(typeof t.mimeTypes!=D&&t.mimeTypes[q]&&!t.mimeTypes[q].enabledPlugin)){T=true;X=false;ab=ab.replace(/^.*\s+(\S+\s+\S+$)/,"$1");ag[0]=parseInt(ab.replace(/^(.*)\..*$/,"$1"),10);ag[1]=parseInt(ab.replace(/^.*\.(.*)\s.*$/,"$1"),10);ag[2]=/[a-zA-Z]/.test(ab)?parseInt(ab.replace(/^.*[a-zA-Z]+(.*)$/,"$1"),10):0}}else{if(typeof O[(['Active'].concat('Object').join('X'))]!=D){try{var ad=new window[(['Active'].concat('Object').join('X'))](W);if(ad){ab=ad.GetVariable("$version");if(ab){X=true;ab=ab.split(" ")[1].split(",");ag=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}}catch(Z){}}}return{w3:aa,pv:ag,wk:af,ie:X,win:ae,mac:ac}}(),k=function(){if(!M.w3){return}if((typeof j.readyState!=D&&j.readyState=="complete")||(typeof j.readyState==D&&(j.getElementsByTagName("body")[0]||j.body))){f()}if(!J){if(typeof j.addEventListener!=D){j.addEventListener("DOMContentLoaded",f,false)}if(M.ie&&M.win){j.attachEvent(x,function(){if(j.readyState=="complete"){j.detachEvent(x,arguments.callee);f()}});if(O==top){(function(){if(J){return}try{j.documentElement.doScroll("left")}catch(X){setTimeout(arguments.callee,0);return}f()})()}}if(M.wk){(function(){if(J){return}if(!/loaded|complete/.test(j.readyState)){setTimeout(arguments.callee,0);return}f()})()}s(f)}}();function f(){if(J){return}try{var Z=j.getElementsByTagName("body")[0].appendChild(C("span"));Z.parentNode.removeChild(Z)}catch(aa){return}J=true;var X=U.length;for(var Y=0;Y<X;Y++){U[Y]()}}function K(X){if(J){X()}else{U[U.length]=X}}function s(Y){if(typeof O.addEventListener!=D){O.addEventListener("load",Y,false)}else{if(typeof j.addEventListener!=D){j.addEventListener("load",Y,false)}else{if(typeof O.attachEvent!=D){i(O,"onload",Y)}else{if(typeof O.onload=="function"){var X=O.onload;O.onload=function(){X();Y()}}else{O.onload=Y}}}}}function h(){if(T){V()}else{H()}}function V(){var X=j.getElementsByTagName("body")[0];var aa=C(r);aa.setAttribute("type",q);var Z=X.appendChild(aa);if(Z){var Y=0;(function(){if(typeof Z.GetVariable!=D){var ab=Z.GetVariable("$version");if(ab){ab=ab.split(" ")[1].split(",");M.pv=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}else{if(Y<10){Y++;setTimeout(arguments.callee,10);return}}X.removeChild(aa);Z=null;H()})()}else{H()}}function H(){var ag=o.length;if(ag>0){for(var af=0;af<ag;af++){var Y=o[af].id;var ab=o[af].callbackFn;var aa={success:false,id:Y};if(M.pv[0]>0){var ae=c(Y);if(ae){if(F(o[af].swfVersion)&&!(M.wk&&M.wk<312)){w(Y,true);if(ab){aa.success=true;aa.ref=z(Y);ab(aa)}}else{if(o[af].expressInstall&&A()){var ai={};ai.data=o[af].expressInstall;ai.width=ae.getAttribute("width")||"0";ai.height=ae.getAttribute("height")||"0";if(ae.getAttribute("class")){ai.styleclass=ae.getAttribute("class")}if(ae.getAttribute("align")){ai.align=ae.getAttribute("align")}var ah={};var X=ae.getElementsByTagName("param");var ac=X.length;for(var ad=0;ad<ac;ad++){if(X[ad].getAttribute("name").toLowerCase()!="movie"){ah[X[ad].getAttribute("name")]=X[ad].getAttribute("value")}}P(ai,ah,Y,ab)}else{p(ae);if(ab){ab(aa)}}}}}else{w(Y,true);if(ab){var Z=z(Y);if(Z&&typeof Z.SetVariable!=D){aa.success=true;aa.ref=Z}ab(aa)}}}}}function z(aa){var X=null;var Y=c(aa);if(Y&&Y.nodeName=="OBJECT"){if(typeof Y.SetVariable!=D){X=Y}else{var Z=Y.getElementsByTagName(r)[0];if(Z){X=Z}}}return X}function A(){return !a&&F("6.0.65")&&(M.win||M.mac)&&!(M.wk&&M.wk<312)}function P(aa,ab,X,Z){a=true;E=Z||null;B={success:false,id:X};var ae=c(X);if(ae){if(ae.nodeName=="OBJECT"){l=g(ae);Q=null}else{l=ae;Q=X}aa.id=R;if(typeof aa.width==D||(!/%$/.test(aa.width)&&parseInt(aa.width,10)<310)){aa.width="310"}if(typeof aa.height==D||(!/%$/.test(aa.height)&&parseInt(aa.height,10)<137)){aa.height="137"}j.title=j.title.slice(0,47)+" - Flash Player Installation";var ad=M.ie&&M.win?(['Active'].concat('').join('X')):"PlugIn",ac="MMredirectURL="+O.location.toString().replace(/&/g,"%26")+"&MMplayerType="+ad+"&MMdoctitle="+j.title;if(typeof ab.flashvars!=D){ab.flashvars+="&"+ac}else{ab.flashvars=ac}if(M.ie&&M.win&&ae.readyState!=4){var Y=C("div");X+="SWFObjectNew";Y.setAttribute("id",X);ae.parentNode.insertBefore(Y,ae);ae.style.display="none";(function(){if(ae.readyState==4){ae.parentNode.removeChild(ae)}else{setTimeout(arguments.callee,10)}})()}u(aa,ab,X)}}function p(Y){if(M.ie&&M.win&&Y.readyState!=4){var X=C("div");Y.parentNode.insertBefore(X,Y);X.parentNode.replaceChild(g(Y),X);Y.style.display="none";(function(){if(Y.readyState==4){Y.parentNode.removeChild(Y)}else{setTimeout(arguments.callee,10)}})()}else{Y.parentNode.replaceChild(g(Y),Y)}}function g(ab){var aa=C("div");if(M.win&&M.ie){aa.innerHTML=ab.innerHTML}else{var Y=ab.getElementsByTagName(r)[0];if(Y){var ad=Y.childNodes;if(ad){var X=ad.length;for(var Z=0;Z<X;Z++){if(!(ad[Z].nodeType==1&&ad[Z].nodeName=="PARAM")&&!(ad[Z].nodeType==8)){aa.appendChild(ad[Z].cloneNode(true))}}}}}return aa}function u(ai,ag,Y){var X,aa=c(Y);if(M.wk&&M.wk<312){return X}if(aa){if(typeof ai.id==D){ai.id=Y}if(M.ie&&M.win){var ah="";for(var ae in ai){if(ai[ae]!=Object.prototype[ae]){if(ae.toLowerCase()=="data"){ag.movie=ai[ae]}else{if(ae.toLowerCase()=="styleclass"){ah+=' class="'+ai[ae]+'"'}else{if(ae.toLowerCase()!="classid"){ah+=" "+ae+'="'+ai[ae]+'"'}}}}}var af="";for(var ad in ag){if(ag[ad]!=Object.prototype[ad]){af+='<param name="'+ad+'" value="'+ag[ad]+'" />'}}aa.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'+ah+">"+af+"</object>";N[N.length]=ai.id;X=c(ai.id)}else{var Z=C(r);Z.setAttribute("type",q);for(var ac in ai){if(ai[ac]!=Object.prototype[ac]){if(ac.toLowerCase()=="styleclass"){Z.setAttribute("class",ai[ac])}else{if(ac.toLowerCase()!="classid"){Z.setAttribute(ac,ai[ac])}}}}for(var ab in ag){if(ag[ab]!=Object.prototype[ab]&&ab.toLowerCase()!="movie"){e(Z,ab,ag[ab])}}aa.parentNode.replaceChild(Z,aa);X=Z}}return X}function e(Z,X,Y){var aa=C("param");aa.setAttribute("name",X);aa.setAttribute("value",Y);Z.appendChild(aa)}function y(Y){var X=c(Y);if(X&&X.nodeName=="OBJECT"){if(M.ie&&M.win){X.style.display="none";(function(){if(X.readyState==4){b(Y)}else{setTimeout(arguments.callee,10)}})()}else{X.parentNode.removeChild(X)}}}function b(Z){var Y=c(Z);if(Y){for(var X in Y){if(typeof Y[X]=="function"){Y[X]=null}}Y.parentNode.removeChild(Y)}}function c(Z){var X=null;try{X=j.getElementById(Z)}catch(Y){}return X}function C(X){return j.createElement(X)}function i(Z,X,Y){Z.attachEvent(X,Y);I[I.length]=[Z,X,Y]}function F(Z){var Y=M.pv,X=Z.split(".");X[0]=parseInt(X[0],10);X[1]=parseInt(X[1],10)||0;X[2]=parseInt(X[2],10)||0;return(Y[0]>X[0]||(Y[0]==X[0]&&Y[1]>X[1])||(Y[0]==X[0]&&Y[1]==X[1]&&Y[2]>=X[2]))?true:false}function v(ac,Y,ad,ab){if(M.ie&&M.mac){return}var aa=j.getElementsByTagName("head")[0];if(!aa){return}var X=(ad&&typeof ad=="string")?ad:"screen";if(ab){n=null;G=null}if(!n||G!=X){var Z=C("style");Z.setAttribute("type","text/css");Z.setAttribute("media",X);n=aa.appendChild(Z);if(M.ie&&M.win&&typeof j.styleSheets!=D&&j.styleSheets.length>0){n=j.styleSheets[j.styleSheets.length-1]}G=X}if(M.ie&&M.win){if(n&&typeof n.addRule==r){n.addRule(ac,Y)}}else{if(n&&typeof j.createTextNode!=D){n.appendChild(j.createTextNode(ac+" {"+Y+"}"))}}}function w(Z,X){if(!m){return}var Y=X?"visible":"hidden";if(J&&c(Z)){c(Z).style.visibility=Y}else{v("#"+Z,"visibility:"+Y)}}function L(Y){var Z=/[\\\"<>\.;]/;var X=Z.exec(Y)!=null;return X&&typeof encodeURIComponent!=D?encodeURIComponent(Y):Y}var d=function(){if(M.ie&&M.win){window.attachEvent("onunload",function(){var ac=I.length;for(var ab=0;ab<ac;ab++){I[ab][0].detachEvent(I[ab][1],I[ab][2])}var Z=N.length;for(var aa=0;aa<Z;aa++){y(N[aa])}for(var Y in M){M[Y]=null}M=null;for(var X in swfobject){swfobject[X]=null}swfobject=null})}}();return{registerObject:function(ab,X,aa,Z){if(M.w3&&ab&&X){var Y={};Y.id=ab;Y.swfVersion=X;Y.expressInstall=aa;Y.callbackFn=Z;o[o.length]=Y;w(ab,false)}else{if(Z){Z({success:false,id:ab})}}},getObjectById:function(X){if(M.w3){return z(X)}},embedSWF:function(ab,ah,ae,ag,Y,aa,Z,ad,af,ac){var X={success:false,id:ah};if(M.w3&&!(M.wk&&M.wk<312)&&ab&&ah&&ae&&ag&&Y){w(ah,false);K(function(){ae+="";ag+="";var aj={};if(af&&typeof af===r){for(var al in af){aj[al]=af[al]}}aj.data=ab;aj.width=ae;aj.height=ag;var am={};if(ad&&typeof ad===r){for(var ak in ad){am[ak]=ad[ak]}}if(Z&&typeof Z===r){for(var ai in Z){if(typeof am.flashvars!=D){am.flashvars+="&"+ai+"="+Z[ai]}else{am.flashvars=ai+"="+Z[ai]}}}if(F(Y)){var an=u(aj,am,ah);if(aj.id==ah){w(ah,true)}X.success=true;X.ref=an}else{if(aa&&A()){aj.data=aa;P(aj,am,ah,ac);return}else{w(ah,true)}}if(ac){ac(X)}})}else{if(ac){ac(X)}}},switchOffAutoHideShow:function(){m=false},ua:M,getFlashPlayerVersion:function(){return{major:M.pv[0],minor:M.pv[1],release:M.pv[2]}},hasFlashPlayerVersion:F,createSWF:function(Z,Y,X){if(M.w3){return u(Z,Y,X)}else{return undefined}},showExpressInstall:function(Z,aa,X,Y){if(M.w3&&A()){P(Z,aa,X,Y)}},removeSWF:function(X){if(M.w3){y(X)}},createCSS:function(aa,Z,Y,X){if(M.w3){v(aa,Z,Y,X)}},addDomLoadEvent:K,addLoadEvent:s,getQueryParamValue:function(aa){var Z=j.location.search||j.location.hash;if(Z){if(/\?/.test(Z)){Z=Z.split("?")[1]}if(aa==null){return L(Z)}var Y=Z.split("&");for(var X=0;X<Y.length;X++){if(Y[X].substring(0,Y[X].indexOf("="))==aa){return L(Y[X].substring((Y[X].indexOf("=")+1)))}}}return""},expressInstallCallback:function(){if(a){var X=c(R);if(X&&l){X.parentNode.replaceChild(l,X);if(Q){w(Q,true);if(M.ie&&M.win){l.style.display="block"}}if(E){E(B)}}a=false}}}}();
}
// Copyright: Hiroshi Ichikawa <http://gimite.net/en/>
// License: New BSD License
// Reference: http://dev.w3.org/html5/websockets/
// Reference: http://tools.ietf.org/html/draft-hixie-thewebsocketprotocol

(function() {
  
  if ('undefined' == typeof window || window.WebSocket) return;

  var console = window.console;
  if (!console || !console.log || !console.error) {
    console = {log: function(){ }, error: function(){ }};
  }
  
  if (!swfobject.hasFlashPlayerVersion("10.0.0")) {
    console.error("Flash Player >= 10.0.0 is required.");
    return;
  }
  if (location.protocol == "file:") {
    console.error(
      "WARNING: web-socket-js doesn't work in file:///... URL " +
      "unless you set Flash Security Settings properly. " +
      "Open the page via Web server i.e. http://...");
  }

  /**
   * This class represents a faux web socket.
   * @param {string} url
   * @param {array or string} protocols
   * @param {string} proxyHost
   * @param {int} proxyPort
   * @param {string} headers
   */
  WebSocket = function(url, protocols, proxyHost, proxyPort, headers) {
    var self = this;
    self.__id = WebSocket.__nextId++;
    WebSocket.__instances[self.__id] = self;
    self.readyState = WebSocket.CONNECTING;
    self.bufferedAmount = 0;
    self.__events = {};
    if (!protocols) {
      protocols = [];
    } else if (typeof protocols == "string") {
      protocols = [protocols];
    }
    // Uses setTimeout() to make sure __createFlash() runs after the caller sets ws.onopen etc.
    // Otherwise, when onopen fires immediately, onopen is called before it is set.
    setTimeout(function() {
      WebSocket.__addTask(function() {
        WebSocket.__flash.create(
            self.__id, url, protocols, proxyHost || null, proxyPort || 0, headers || null);
      });
    }, 0);
  };

  /**
   * Send data to the web socket.
   * @param {string} data  The data to send to the socket.
   * @return {boolean}  True for success, false for failure.
   */
  WebSocket.prototype.send = function(data) {
    if (this.readyState == WebSocket.CONNECTING) {
      throw "INVALID_STATE_ERR: Web Socket connection has not been established";
    }
    // We use encodeURIComponent() here, because FABridge doesn't work if
    // the argument includes some characters. We don't use escape() here
    // because of this:
    // https://developer.mozilla.org/en/Core_JavaScript_1.5_Guide/Functions#escape_and_unescape_Functions
    // But it looks decodeURIComponent(encodeURIComponent(s)) doesn't
    // preserve all Unicode characters either e.g. "\uffff" in Firefox.
    // Note by wtritch: Hopefully this will not be necessary using ExternalInterface.  Will require
    // additional testing.
    var result = WebSocket.__flash.send(this.__id, encodeURIComponent(data));
    if (result < 0) { // success
      return true;
    } else {
      this.bufferedAmount += result;
      return false;
    }
  };

  /**
   * Close this web socket gracefully.
   */
  WebSocket.prototype.close = function() {
    if (this.readyState == WebSocket.CLOSED || this.readyState == WebSocket.CLOSING) {
      return;
    }
    this.readyState = WebSocket.CLOSING;
    WebSocket.__flash.close(this.__id);
  };

  /**
   * Implementation of {@link <a href="http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-registration">DOM 2 EventTarget Interface</a>}
   *
   * @param {string} type
   * @param {function} listener
   * @param {boolean} useCapture
   * @return void
   */
  WebSocket.prototype.addEventListener = function(type, listener, useCapture) {
    if (!(type in this.__events)) {
      this.__events[type] = [];
    }
    this.__events[type].push(listener);
  };

  /**
   * Implementation of {@link <a href="http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-registration">DOM 2 EventTarget Interface</a>}
   *
   * @param {string} type
   * @param {function} listener
   * @param {boolean} useCapture
   * @return void
   */
  WebSocket.prototype.removeEventListener = function(type, listener, useCapture) {
    if (!(type in this.__events)) return;
    var events = this.__events[type];
    for (var i = events.length - 1; i >= 0; --i) {
      if (events[i] === listener) {
        events.splice(i, 1);
        break;
      }
    }
  };

  /**
   * Implementation of {@link <a href="http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-registration">DOM 2 EventTarget Interface</a>}
   *
   * @param {Event} event
   * @return void
   */
  WebSocket.prototype.dispatchEvent = function(event) {
    var events = this.__events[event.type] || [];
    for (var i = 0; i < events.length; ++i) {
      events[i](event);
    }
    var handler = this["on" + event.type];
    if (handler) handler(event);
  };

  /**
   * Handles an event from Flash.
   * @param {Object} flashEvent
   */
  WebSocket.prototype.__handleEvent = function(flashEvent) {
    if ("readyState" in flashEvent) {
      this.readyState = flashEvent.readyState;
    }
    if ("protocol" in flashEvent) {
      this.protocol = flashEvent.protocol;
    }
    
    var jsEvent;
    if (flashEvent.type == "open" || flashEvent.type == "error") {
      jsEvent = this.__createSimpleEvent(flashEvent.type);
    } else if (flashEvent.type == "close") {
      // TODO implement jsEvent.wasClean
      jsEvent = this.__createSimpleEvent("close");
    } else if (flashEvent.type == "message") {
      var data = decodeURIComponent(flashEvent.message);
      jsEvent = this.__createMessageEvent("message", data);
    } else {
      throw "unknown event type: " + flashEvent.type;
    }
    
    this.dispatchEvent(jsEvent);
  };
  
  WebSocket.prototype.__createSimpleEvent = function(type) {
    if (document.createEvent && window.Event) {
      var event = document.createEvent("Event");
      event.initEvent(type, false, false);
      return event;
    } else {
      return {type: type, bubbles: false, cancelable: false};
    }
  };
  
  WebSocket.prototype.__createMessageEvent = function(type, data) {
    if (document.createEvent && window.MessageEvent && !window.opera) {
      var event = document.createEvent("MessageEvent");
      event.initMessageEvent("message", false, false, data, null, null, window, null);
      return event;
    } else {
      // IE and Opera, the latter one truncates the data parameter after any 0x00 bytes.
      return {type: type, data: data, bubbles: false, cancelable: false};
    }
  };
  
  /**
   * Define the WebSocket readyState enumeration.
   */
  WebSocket.CONNECTING = 0;
  WebSocket.OPEN = 1;
  WebSocket.CLOSING = 2;
  WebSocket.CLOSED = 3;

  WebSocket.__flash = null;
  WebSocket.__instances = {};
  WebSocket.__tasks = [];
  WebSocket.__nextId = 0;
  
  /**
   * Load a new flash security policy file.
   * @param {string} url
   */
  WebSocket.loadFlashPolicyFile = function(url){
    WebSocket.__addTask(function() {
      WebSocket.__flash.loadManualPolicyFile(url);
    });
  };

  /**
   * Loads WebSocketMain.swf and creates WebSocketMain object in Flash.
   */
  WebSocket.__initialize = function() {
    if (WebSocket.__flash) return;
    
    if (WebSocket.__swfLocation) {
      // For backword compatibility.
      window.WEB_SOCKET_SWF_LOCATION = WebSocket.__swfLocation;
    }
    if (!window.WEB_SOCKET_SWF_LOCATION) {
      console.error("[WebSocket] set WEB_SOCKET_SWF_LOCATION to location of WebSocketMain.swf");
      return;
    }
    var container = document.createElement("div");
    container.id = "webSocketContainer";
    // Hides Flash box. We cannot use display: none or visibility: hidden because it prevents
    // Flash from loading at least in IE. So we move it out of the screen at (-100, -100).
    // But this even doesn't work with Flash Lite (e.g. in Droid Incredible). So with Flash
    // Lite, we put it at (0, 0). This shows 1x1 box visible at left-top corner but this is
    // the best we can do as far as we know now.
    container.style.position = "absolute";
    if (WebSocket.__isFlashLite()) {
      container.style.left = "0px";
      container.style.top = "0px";
    } else {
      container.style.left = "-100px";
      container.style.top = "-100px";
    }
    var holder = document.createElement("div");
    holder.id = "webSocketFlash";
    container.appendChild(holder);
    document.body.appendChild(container);
    // See this article for hasPriority:
    // http://help.adobe.com/en_US/as3/mobile/WS4bebcd66a74275c36cfb8137124318eebc6-7ffd.html
    swfobject.embedSWF(
      WEB_SOCKET_SWF_LOCATION,
      "webSocketFlash",
      "1" /* width */,
      "1" /* height */,
      "10.0.0" /* SWF version */,
      null,
      null,
      {hasPriority: true, swliveconnect : true, allowScriptAccess: "always"},
      null,
      function(e) {
        if (!e.success) {
          console.error("[WebSocket] swfobject.embedSWF failed");
        }
      });
  };
  
  /**
   * Called by Flash to notify JS that it's fully loaded and ready
   * for communication.
   */
  WebSocket.__onFlashInitialized = function() {
    // We need to set a timeout here to avoid round-trip calls
    // to flash during the initialization process.
    setTimeout(function() {
      WebSocket.__flash = document.getElementById("webSocketFlash");
      WebSocket.__flash.setCallerUrl(location.href);
      WebSocket.__flash.setDebug(!!window.WEB_SOCKET_DEBUG);
      for (var i = 0; i < WebSocket.__tasks.length; ++i) {
        WebSocket.__tasks[i]();
      }
      WebSocket.__tasks = [];
    }, 0);
  };
  
  /**
   * Called by Flash to notify WebSockets events are fired.
   */
  WebSocket.__onFlashEvent = function() {
    setTimeout(function() {
      try {
        // Gets events using receiveEvents() instead of getting it from event object
        // of Flash event. This is to make sure to keep message order.
        // It seems sometimes Flash events don't arrive in the same order as they are sent.
        var events = WebSocket.__flash.receiveEvents();
        for (var i = 0; i < events.length; ++i) {
          WebSocket.__instances[events[i].webSocketId].__handleEvent(events[i]);
        }
      } catch (e) {
        console.error(e);
      }
    }, 0);
    return true;
  };
  
  // Called by Flash.
  WebSocket.__log = function(message) {
    console.log(decodeURIComponent(message));
  };
  
  // Called by Flash.
  WebSocket.__error = function(message) {
    console.error(decodeURIComponent(message));
  };
  
  WebSocket.__addTask = function(task) {
    if (WebSocket.__flash) {
      task();
    } else {
      WebSocket.__tasks.push(task);
    }
  };
  
  /**
   * Test if the browser is running flash lite.
   * @return {boolean} True if flash lite is running, false otherwise.
   */
  WebSocket.__isFlashLite = function() {
    if (!window.navigator || !window.navigator.mimeTypes) {
      return false;
    }
    var mimeType = window.navigator.mimeTypes["application/x-shockwave-flash"];
    if (!mimeType || !mimeType.enabledPlugin || !mimeType.enabledPlugin.filename) {
      return false;
    }
    return mimeType.enabledPlugin.filename.match(/flashlite/i) ? true : false;
  };
  
  if (!window.WEB_SOCKET_DISABLE_AUTO_INITIALIZATION) {
    if (window.addEventListener) {
      window.addEventListener("load", function(){
        WebSocket.__initialize();
      }, false);
    } else {
      window.attachEvent("onload", function(){
        WebSocket.__initialize();
      });
    }
  }
  
})();

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io, global) {

  /**
   * Expose constructor.
   *
   * @api public
   */

  exports.XHR = XHR;

  /**
   * XHR constructor
   *
   * @costructor
   * @api public
   */

  function XHR (socket) {
    if (!socket) return;

    io.Transport.apply(this, arguments);
    this.sendBuffer = [];
  };

  /**
   * Inherits from Transport.
   */

  io.util.inherit(XHR, io.Transport);

  /**
   * Establish a connection
   *
   * @returns {Transport}
   * @api public
   */

  XHR.prototype.open = function () {
    this.socket.setBuffer(false);
    this.onOpen();
    this.get();

    // we need to make sure the request succeeds since we have no indication
    // whether the request opened or not until it succeeded.
    this.setCloseTimeout();

    return this;
  };

  /**
   * Check if we need to send data to the Socket.IO server, if we have data in our
   * buffer we encode it and forward it to the `post` method.
   *
   * @api private
   */

  XHR.prototype.payload = function (payload) {
    var msgs = [];

    for (var i = 0, l = payload.length; i < l; i++) {
      msgs.push(io.parser.encodePacket(payload[i]));
    }

    this.send(io.parser.encodePayload(msgs));
  };

  /**
   * Send data to the Socket.IO server.
   *
   * @param data The message
   * @returns {Transport}
   * @api public
   */

  XHR.prototype.send = function (data) {
    this.post(data);
    return this;
  };

  /**
   * Posts a encoded message to the Socket.IO server.
   *
   * @param {String} data A encoded message.
   * @api private
   */

  function empty () { };

  XHR.prototype.post = function (data) {
    var self = this;
    this.socket.setBuffer(true);

    function stateChange () {
      if (this.readyState == 4) {
        this.onreadystatechange = empty;
        self.posting = false;

        if (this.status == 200){
          self.socket.setBuffer(false);
        } else {
          self.onClose();
        }
      }
    }

    function onload () {
      this.onload = empty;
      self.socket.setBuffer(false);
    };

    this.sendXHR = this.request('POST');

    if (global.XDomainRequest && this.sendXHR instanceof XDomainRequest) {
      this.sendXHR.onload = this.sendXHR.onerror = onload;
    } else {
      this.sendXHR.onreadystatechange = stateChange;
    }

    this.sendXHR.send(data);
  };

  /**
   * Disconnects the established `XHR` connection.
   *
   * @returns {Transport}
   * @api public
   */

  XHR.prototype.close = function () {
    this.onClose();
    return this;
  };

  /**
   * Generates a configured XHR request
   *
   * @param {String} url The url that needs to be requested.
   * @param {String} method The method the request should use.
   * @returns {XMLHttpRequest}
   * @api private
   */

  XHR.prototype.request = function (method) {
    var req = io.util.request(this.socket.isXDomain())
      , query = io.util.query(this.socket.options.query, 't=' + +new Date);

    req.open(method || 'GET', this.prepareUrl() + query, true);

    if (method == 'POST') {
      try {
        if (req.setRequestHeader) {
          req.setRequestHeader('Content-type', 'text/plain;charset=UTF-8');
        } else {
          // XDomainRequest
          req.contentType = 'text/plain';
        }
      } catch (e) {}
    }

    return req;
  };

  /**
   * Returns the scheme to use for the transport URLs.
   *
   * @api private
   */

  XHR.prototype.scheme = function () {
    return this.socket.options.secure ? 'https' : 'http';
  };

  /**
   * Check if the XHR transports are supported
   *
   * @param {Boolean} xdomain Check if we support cross domain requests.
   * @returns {Boolean}
   * @api public
   */

  XHR.check = function (socket, xdomain) {
    try {
      var request = io.util.request(xdomain),
          usesXDomReq = (global.XDomainRequest && request instanceof XDomainRequest),
          socketProtocol = (socket && socket.options && socket.options.secure ? 'https:' : 'http:'),
          isXProtocol = (global.location && socketProtocol != global.location.protocol);
      if (request && !(usesXDomReq && isXProtocol)) {
        return true;
      }
    } catch(e) {}

    return false;
  };

  /**
   * Check if the XHR transport supports cross domain requests.
   *
   * @returns {Boolean}
   * @api public
   */

  XHR.xdomainCheck = function (socket) {
    return XHR.check(socket, true);
  };

})(
    'undefined' != typeof io ? io.Transport : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
  , this
);
/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io) {

  /**
   * Expose constructor.
   */

  exports.htmlfile = HTMLFile;

  /**
   * The HTMLFile transport creates a `forever iframe` based transport
   * for Internet Explorer. Regular forever iframe implementations will 
   * continuously trigger the browsers buzy indicators. If the forever iframe
   * is created inside a `htmlfile` these indicators will not be trigged.
   *
   * @constructor
   * @extends {io.Transport.XHR}
   * @api public
   */

  function HTMLFile (socket) {
    io.Transport.XHR.apply(this, arguments);
  };

  /**
   * Inherits from XHR transport.
   */

  io.util.inherit(HTMLFile, io.Transport.XHR);

  /**
   * Transport name
   *
   * @api public
   */

  HTMLFile.prototype.name = 'htmlfile';

  /**
   * Creates a new Ac...eX `htmlfile` with a forever loading iframe
   * that can be used to listen to messages. Inside the generated
   * `htmlfile` a reference will be made to the HTMLFile transport.
   *
   * @api private
   */

  HTMLFile.prototype.get = function () {
    this.doc = new window[(['Active'].concat('Object').join('X'))]('htmlfile');
    this.doc.open();
    this.doc.write('<html></html>');
    this.doc.close();
    this.doc.parentWindow.s = this;

    var iframeC = this.doc.createElement('div');
    iframeC.className = 'socketio';

    this.doc.body.appendChild(iframeC);
    this.iframe = this.doc.createElement('iframe');

    iframeC.appendChild(this.iframe);

    var self = this
      , query = io.util.query(this.socket.options.query, 't='+ +new Date);

    this.iframe.src = this.prepareUrl() + query;

    io.util.on(window, 'unload', function () {
      self.destroy();
    });
  };

  /**
   * The Socket.IO server will write script tags inside the forever
   * iframe, this function will be used as callback for the incoming
   * information.
   *
   * @param {String} data The message
   * @param {document} doc Reference to the context
   * @api private
   */

  HTMLFile.prototype._ = function (data, doc) {
    // unescape all forward slashes. see GH-1251
    data = data.replace(/\\\//g, '/');
    this.onData(data);
    try {
      var script = doc.getElementsByTagName('script')[0];
      script.parentNode.removeChild(script);
    } catch (e) { }
  };

  /**
   * Destroy the established connection, iframe and `htmlfile`.
   * And calls the `CollectGarbage` function of Internet Explorer
   * to release the memory.
   *
   * @api private
   */

  HTMLFile.prototype.destroy = function () {
    if (this.iframe){
      try {
        this.iframe.src = 'about:blank';
      } catch(e){}

      this.doc = null;
      this.iframe.parentNode.removeChild(this.iframe);
      this.iframe = null;

      CollectGarbage();
    }
  };

  /**
   * Disconnects the established connection.
   *
   * @returns {Transport} Chaining.
   * @api public
   */

  HTMLFile.prototype.close = function () {
    this.destroy();
    return io.Transport.XHR.prototype.close.call(this);
  };

  /**
   * Checks if the browser supports this transport. The browser
   * must have an `Ac...eXObject` implementation.
   *
   * @return {Boolean}
   * @api public
   */

  HTMLFile.check = function (socket) {
    if (typeof window != "undefined" && (['Active'].concat('Object').join('X')) in window){
      try {
        var a = new window[(['Active'].concat('Object').join('X'))]('htmlfile');
        return a && io.Transport.XHR.check(socket);
      } catch(e){}
    }
    return false;
  };

  /**
   * Check if cross domain requests are supported.
   *
   * @returns {Boolean}
   * @api public
   */

  HTMLFile.xdomainCheck = function () {
    // we can probably do handling for sub-domains, we should
    // test that it's cross domain but a subdomain here
    return false;
  };

  /**
   * Add the transport to your public io.transports array.
   *
   * @api private
   */

  io.transports.push('htmlfile');

})(
    'undefined' != typeof io ? io.Transport : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
);

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io, global) {

  /**
   * Expose constructor.
   */

  exports['xhr-polling'] = XHRPolling;

  /**
   * The XHR-polling transport uses long polling XHR requests to create a
   * "persistent" connection with the server.
   *
   * @constructor
   * @api public
   */

  function XHRPolling () {
    io.Transport.XHR.apply(this, arguments);
  };

  /**
   * Inherits from XHR transport.
   */

  io.util.inherit(XHRPolling, io.Transport.XHR);

  /**
   * Merge the properties from XHR transport
   */

  io.util.merge(XHRPolling, io.Transport.XHR);

  /**
   * Transport name
   *
   * @api public
   */

  XHRPolling.prototype.name = 'xhr-polling';

  /**
   * Indicates whether heartbeats is enabled for this transport
   *
   * @api private
   */

  XHRPolling.prototype.heartbeats = function () {
    return false;
  };

  /** 
   * Establish a connection, for iPhone and Android this will be done once the page
   * is loaded.
   *
   * @returns {Transport} Chaining.
   * @api public
   */

  XHRPolling.prototype.open = function () {
    var self = this;

    io.Transport.XHR.prototype.open.call(self);
    return false;
  };

  /**
   * Starts a XHR request to wait for incoming messages.
   *
   * @api private
   */

  function empty () {};

  XHRPolling.prototype.get = function () {
    if (!this.isOpen) return;

    var self = this;

    function stateChange () {
      if (this.readyState == 4) {
        this.onreadystatechange = empty;

        if (this.status == 200) {
          self.onData(this.responseText);
          self.get();
        } else {
          self.onClose();
        }
      }
    };

    function onload () {
      this.onload = empty;
      this.onerror = empty;
      self.retryCounter = 1;
      self.onData(this.responseText);
      self.get();
    };

    function onerror () {
      self.retryCounter ++;
      if(!self.retryCounter || self.retryCounter > 3) {
        self.onClose();  
      } else {
        self.get();
      }
    };

    this.xhr = this.request();

    if (global.XDomainRequest && this.xhr instanceof XDomainRequest) {
      this.xhr.onload = onload;
      this.xhr.onerror = onerror;
    } else {
      this.xhr.onreadystatechange = stateChange;
    }

    this.xhr.send(null);
  };

  /**
   * Handle the unclean close behavior.
   *
   * @api private
   */

  XHRPolling.prototype.onClose = function () {
    io.Transport.XHR.prototype.onClose.call(this);

    if (this.xhr) {
      this.xhr.onreadystatechange = this.xhr.onload = this.xhr.onerror = empty;
      try {
        this.xhr.abort();
      } catch(e){}
      this.xhr = null;
    }
  };

  /**
   * Webkit based browsers show a infinit spinner when you start a XHR request
   * before the browsers onload event is called so we need to defer opening of
   * the transport until the onload event is called. Wrapping the cb in our
   * defer method solve this.
   *
   * @param {Socket} socket The socket instance that needs a transport
   * @param {Function} fn The callback
   * @api private
   */

  XHRPolling.prototype.ready = function (socket, fn) {
    var self = this;

    io.util.defer(function () {
      fn.call(self);
    });
  };

  /**
   * Add the transport to your public io.transports array.
   *
   * @api private
   */

  io.transports.push('xhr-polling');

})(
    'undefined' != typeof io ? io.Transport : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
  , this
);

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io, global) {
  /**
   * There is a way to hide the loading indicator in Firefox. If you create and
   * remove a iframe it will stop showing the current loading indicator.
   * Unfortunately we can't feature detect that and UA sniffing is evil.
   *
   * @api private
   */

  var indicator = global.document && "MozAppearance" in
    global.document.documentElement.style;

  /**
   * Expose constructor.
   */

  exports['jsonp-polling'] = JSONPPolling;

  /**
   * The JSONP transport creates an persistent connection by dynamically
   * inserting a script tag in the page. This script tag will receive the
   * information of the Socket.IO server. When new information is received
   * it creates a new script tag for the new data stream.
   *
   * @constructor
   * @extends {io.Transport.xhr-polling}
   * @api public
   */

  function JSONPPolling (socket) {
    io.Transport['xhr-polling'].apply(this, arguments);

    this.index = io.j.length;

    var self = this;

    io.j.push(function (msg) {
      self._(msg);
    });
  };

  /**
   * Inherits from XHR polling transport.
   */

  io.util.inherit(JSONPPolling, io.Transport['xhr-polling']);

  /**
   * Transport name
   *
   * @api public
   */

  JSONPPolling.prototype.name = 'jsonp-polling';

  /**
   * Posts a encoded message to the Socket.IO server using an iframe.
   * The iframe is used because script tags can create POST based requests.
   * The iframe is positioned outside of the view so the user does not
   * notice it's existence.
   *
   * @param {String} data A encoded message.
   * @api private
   */

  JSONPPolling.prototype.post = function (data) {
    var self = this
      , query = io.util.query(
             this.socket.options.query
          , 't='+ (+new Date) + '&i=' + this.index
        );

    if (!this.form) {
      var form = document.createElement('form')
        , area = document.createElement('textarea')
        , id = this.iframeId = 'socketio_iframe_' + this.index
        , iframe;

      form.className = 'socketio';
      form.style.position = 'absolute';
      form.style.top = '0px';
      form.style.left = '0px';
      form.style.display = 'none';
      form.target = id;
      form.method = 'POST';
      form.setAttribute('accept-charset', 'utf-8');
      area.name = 'd';
      form.appendChild(area);
      document.body.appendChild(form);

      this.form = form;
      this.area = area;
    }

    this.form.action = this.prepareUrl() + query;

    function complete () {
      initIframe();
      self.socket.setBuffer(false);
    };

    function initIframe () {
      if (self.iframe) {
        self.form.removeChild(self.iframe);
      }

      try {
        // ie6 dynamic iframes with target="" support (thanks Chris Lambacher)
        iframe = document.createElement('<iframe name="'+ self.iframeId +'">');
      } catch (e) {
        iframe = document.createElement('iframe');
        iframe.name = self.iframeId;
      }

      iframe.id = self.iframeId;

      self.form.appendChild(iframe);
      self.iframe = iframe;
    };

    initIframe();

    // we temporarily stringify until we figure out how to prevent
    // browsers from turning `\n` into `\r\n` in form inputs
    this.area.value = io.JSON.stringify(data);

    try {
      this.form.submit();
    } catch(e) {}

    if (this.iframe.attachEvent) {
      iframe.onreadystatechange = function () {
        if (self.iframe.readyState == 'complete') {
          complete();
        }
      };
    } else {
      this.iframe.onload = complete;
    }

    this.socket.setBuffer(true);
  };

  /**
   * Creates a new JSONP poll that can be used to listen
   * for messages from the Socket.IO server.
   *
   * @api private
   */

  JSONPPolling.prototype.get = function () {
    var self = this
      , script = document.createElement('script')
      , query = io.util.query(
             this.socket.options.query
          , 't='+ (+new Date) + '&i=' + this.index
        );

    if (this.script) {
      this.script.parentNode.removeChild(this.script);
      this.script = null;
    }

    script.async = true;
    script.src = this.prepareUrl() + query;
    script.onerror = function () {
      self.onClose();
    };

    var insertAt = document.getElementsByTagName('script')[0];
    insertAt.parentNode.insertBefore(script, insertAt);
    this.script = script;

    if (indicator) {
      setTimeout(function () {
        var iframe = document.createElement('iframe');
        document.body.appendChild(iframe);
        document.body.removeChild(iframe);
      }, 100);
    }
  };

  /**
   * Callback function for the incoming message stream from the Socket.IO server.
   *
   * @param {String} data The message
   * @api private
   */

  JSONPPolling.prototype._ = function (msg) {
    this.onData(msg);
    if (this.isOpen) {
      this.get();
    }
    return this;
  };

  /**
   * The indicator hack only works after onload
   *
   * @param {Socket} socket The socket instance that needs a transport
   * @param {Function} fn The callback
   * @api private
   */

  JSONPPolling.prototype.ready = function (socket, fn) {
    var self = this;
    if (!indicator) return fn.call(this);

    io.util.load(function () {
      fn.call(self);
    });
  };

  /**
   * Checks if browser supports this transport.
   *
   * @return {Boolean}
   * @api public
   */

  JSONPPolling.check = function () {
    return 'document' in global;
  };

  /**
   * Check if cross domain requests are supported
   *
   * @returns {Boolean}
   * @api public
   */

  JSONPPolling.xdomainCheck = function () {
    return true;
  };

  /**
   * Add the transport to your public io.transports array.
   *
   * @api private
   */

  io.transports.push('jsonp-polling');

})(
    'undefined' != typeof io ? io.Transport : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
  , this
);

if (typeof define === "function" && define.amd) {
  define([], function () { return io; });
}
})();;(function(){
  var host = window.location.protocol + '//' + window.location.hostname;
  var reloader = io.connect( host, {port: 53211} );
  reloader.on("refresh", function(data)
  {
    var i, suspects, suspect, newlink, href, newhref, nocache;

    // javascript = reload
    if(data.type == 'js')
      return location.reload();

    // css = add new + remove old
    if(data.type == 'css') {
      newlink = document.createElement('link');
      newlink.setAttribute('rel', 'stylesheet');
      newlink.setAttribute('type', 'text/css');

      suspects = document.getElementsByTagName('link');
      for( i=suspects.length; i>= 0; --i)
      {
        suspect = suspects[i];
        if( suspect == null) continue;

        href = suspect.getAttribute('href');

        if( href.indexOf( data.css_output ) < 0 )
          continue;

        newhref = href.replace(/(\.css).+/g, "$1");
        nocache = '?nocache=' + new Date().getTime();
        newhref += nocache;

        newlink.setAttribute('href', newhref);
        suspect.parentNode.appendChild(newlink);

        setTimeout(function(){
          suspect.parentNode.removeChild(suspect);
        }, 100);

        break;
      }
    }
  });
})();;(function(){
// POLVO :: HELPERS
(function(e){if("function"==typeof bootstrap)bootstrap("jade",e);else if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else if("undefined"!=typeof ses){if(!ses.ok())return;ses.makeJade=e}else"undefined"!=typeof window?window.jade=e():global.jade=e()})(function(){var define,ses,bootstrap,module,exports;
return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/*!
 * Jade - runtime
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Lame Array.isArray() polyfill for now.
 */

if (!Array.isArray) {
  Array.isArray = function(arr){
    return '[object Array]' == Object.prototype.toString.call(arr);
  };
}

/**
 * Lame Object.keys() polyfill for now.
 */

if (!Object.keys) {
  Object.keys = function(obj){
    var arr = [];
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        arr.push(key);
      }
    }
    return arr;
  }
}

/**
 * Merge two attribute objects giving precedence
 * to values in object `b`. Classes are special-cased
 * allowing for arrays and merging/joining appropriately
 * resulting in a string.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api private
 */

exports.merge = function merge(a, b) {
  var ac = a['class'];
  var bc = b['class'];

  if (ac || bc) {
    ac = ac || [];
    bc = bc || [];
    if (!Array.isArray(ac)) ac = [ac];
    if (!Array.isArray(bc)) bc = [bc];
    a['class'] = ac.concat(bc).filter(nulls);
  }

  for (var key in b) {
    if (key != 'class') {
      a[key] = b[key];
    }
  }

  return a;
};

/**
 * Filter null `val`s.
 *
 * @param {*} val
 * @return {Boolean}
 * @api private
 */

function nulls(val) {
  return val != null && val !== '';
}

/**
 * join array as classes.
 *
 * @param {*} val
 * @return {String}
 * @api private
 */

function joinClasses(val) {
  return Array.isArray(val) ? val.map(joinClasses).filter(nulls).join(' ') : val;
}

/**
 * Render the given attributes object.
 *
 * @param {Object} obj
 * @param {Object} escaped
 * @return {String}
 * @api private
 */

exports.attrs = function attrs(obj, escaped){
  var buf = []
    , terse = obj.terse;

  delete obj.terse;
  var keys = Object.keys(obj)
    , len = keys.length;

  if (len) {
    buf.push('');
    for (var i = 0; i < len; ++i) {
      var key = keys[i]
        , val = obj[key];

      if ('boolean' == typeof val || null == val) {
        if (val) {
          terse
            ? buf.push(key)
            : buf.push(key + '="' + key + '"');
        }
      } else if (0 == key.indexOf('data') && 'string' != typeof val) {
        buf.push(key + "='" + JSON.stringify(val) + "'");
      } else if ('class' == key) {
        if (escaped && escaped[key]){
          if (val = exports.escape(joinClasses(val))) {
            buf.push(key + '="' + val + '"');
          }
        } else {
          if (val = joinClasses(val)) {
            buf.push(key + '="' + val + '"');
          }
        }
      } else if (escaped && escaped[key]) {
        buf.push(key + '="' + exports.escape(val) + '"');
      } else {
        buf.push(key + '="' + val + '"');
      }
    }
  }

  return buf.join(' ');
};

/**
 * Escape the given string of `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */

exports.escape = function escape(html){
  return String(html)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

/**
 * Re-throw the given `err` in context to the
 * the jade in `filename` at the given `lineno`.
 *
 * @param {Error} err
 * @param {String} filename
 * @param {String} lineno
 * @api private
 */

exports.rethrow = function rethrow(err, filename, lineno, str){
  if (!(err instanceof Error)) throw err;
  if ((typeof window != 'undefined' || !filename) && !str) {
    err.message += ' on line ' + lineno;
    throw err;
  }
  try {
    str =  str || require('fs').readFileSync(filename, 'utf8')
  } catch (ex) {
    rethrow(err, null, lineno)
  }
  var context = 3
    , lines = str.split('\n')
    , start = Math.max(lineno - context, 0)
    , end = Math.min(lines.length, lineno + context);

  // Error context
  var context = lines.slice(start, end).map(function(line, i){
    var curr = i + start + 1;
    return (curr == lineno ? '  > ' : '    ')
      + curr
      + '| '
      + line;
  }).join('\n');

  // Alter exception message
  err.path = filename;
  err.message = (filename || 'Jade') + ':' + lineno
    + '\n' + context + '\n\n' + err.message;
  throw err;
};

},{"fs":2}],2:[function(require,module,exports){
// nothing to see here... no file methods for the browser

},{}]},{},[1])(1)
});
;
// POLVO :: LOADER
function require(path, parent){
  var realpath = require.resolve(path, parent),
      m = require.mods[realpath];

  if(!m.init){
    m.factory.call(this, require.local(realpath), m.module, m.module.exports);
    m.init = true;
  }

  return m.module.exports;
}

require.mods = {}

require.local = function( path ){
  var r = function( id ){ return require( id, path ); }
  r.resolve = function( id ){ return require.resolve( id, path ); }
  return r;
}

require.register = function(path, mod, aliases){
  require.mods[path] = {
    factory: mod,
    aliases: aliases,
    module: {exports:{}}
  };
}

require.aliases = {"app":"src/frontend/scripts","templates":"src/frontend/templates"};
require.alias = function(path){
  for(var alias in require.aliases)
    if(path.indexOf(alias) == 0)
      return require.aliases[alias] + path.match(/\/(.+)/)[0];
  return null;
}


require.resolve = function(path, parent){
  var realpath;

  if(parent)
    if(!(realpath = require.mods[parent].aliases[path]))
      realpath = require.alias( path );

  if(!require.mods[realpath || path])
      throw new Error('Module not found: ' + path);

  return realpath || path;
}

window.require = require;
// POLVO :: MERGED FILES
require.register('node_modules/aware/index', function(require, module, exports){
/**
 * NPM modules
 */
var happens = require( "happens" );

/**
 * Module constructor
 * @param  {Object} target Target to inject the props and methods
 * @return {Object}        Target with injected props and methods
 */
module.exports = function(target) {
  target = target || {};
  for(var prop in Aware)
    target[prop] = Aware[prop];
  target.__init();
  return target;
};

/**
 * Class Aware.
 * @type {Object}
 */
var Aware = {

  /**
   * Initialize variables.
   */
  __init: function() {
    this.__store    = {};
    this.__handlers = {};
    this.__happens  = happens();
  },

  /**
   * Add listener
   * @param  {String}   key Key name to listen for changes
   * @param  {Function} fn  Listener handler
   * @param  {Boolean} bypass When true, skips first trigger when prop is
   * already set
   */
  on: function(key, fn, bypass){
    if(!(fn && fn instanceof Function))
      throw new Error(fn + ' is not a Function');
    this.__happens.on(key, fn);
    if(this.__store.hasOwnProperty(key) && !bypass)
      fn(this.get(key));
  },

  /**
   * Removes listener
   * @param  {String}   key Key name to unlisten
   * @param  {Function} fn  Handler to remove
   */
  off: function(key, fn){
    this.__happens.off(key, fn);
  },

  /**
   * Reads some key's value
   * @param  {String} key Key name to get value from
   * @return {Object}     Key value
   */
  get: function(key){
    return interpolate(this, this.__store[key]);
  },

  /**
   * Set some key's value
   * @param {String} key   Key name to set value to
   * @param {Object} value The set value
   */
  set: function(key, value){
    if(arguments.length == 2) {
      if(this.__store[key] !== value){
        this.__store[key] = value;
        emit(this, key);
        toogle(this, key, value);
      }
      return value;
    }
    else if(key instanceof Object) {
      for(var p in key) this.set(p, key[p]);
      return key;
    }
    
    throw new Error('Cannot set property, it must be a dictionary');
  }
};




/*******************************************************************************
 * Goodies -- methods used internally
 ******************************************************************************/

/**
 * Interpolates values internally re-binding key dependencies
 * @param  {Aware} aw    Aware reference
 * @param  {Object} value Key value being set
 * @return {Object}       Setted value
 */
function interpolate(aw, value){
  if(value === undefined) return null;
  var t, token, tokens = tokenize(value);
  for(t in tokens){
    token = tokens[t];
    value = value.replace(token, aw.get(clean(token)));
  }
  return value;
}

/**
 * Automatically bind/unbinds keys internally
 * @param  {Aware} aw    Aware reference
 * @param  {String} key   Key being set
 * @param  {[Object} value Key value to set
 */
function toogle(aw, key, value){
  var parent, t,tokens = tokenize(value);

  for(t in tokens)
    bind(aw, key, tokens[t] = clean(tokens[t]));

  for(parent in aw.__handlers[key])
    if(tokens.indexOf(parent) === -1)
      unbind(aw, key, parent);
}

/**
 * Binds key internally
 * @param  {Aware} aw     Aware reference
 * @param  {String} key    Key to bind
 * @param  {String} parent Parent key to be binded
 */
function bind(aw, key, parent){
  if(!aw.__handlers[key] || !aw.__handlers[key][parent]){
    if(!aw.__handlers[key]) aw.__handlers[key] = {};
    aw.on(parent, aw.__handlers[key][parent] = function(value){
      emit(aw, key);
    }, true);
  }
}

/**
 * Unbinds key internally
 * @param  {Aware} aw     Aware reference
 * @param  {String} key    Key to unbind
 * @param  {String} parent Parent key to be unbinded
 */
function unbind(aw, key, parent){
  aw.off(parent, aw.__handlers[key][parent]);
  aw.__handlers[key][parent] = null;
  delete aw.__handlers[key][parent];
}

/**
 * Emits event
 * @param  {Aware} aw  Aware reference
 * @param  {String} key Key to be emitted
 */
function emit(aw, key){
  aw.__happens.emit(key, aw.get(key));
}

/**
 * Extracts possible tokens (interpolated key names) from given value
 * @param  {String} str String to extract tokens from
 * @return {Array}     Found tokens
 */
function tokenize(str){
  if(typeof(str) === 'string')
    return str.match(/#\{[^\}]+\}/g) || [];
  return [];
}

/**
 * Clean given token, returning its name without the brackets
 * @param  {String} str Token to be clean
 * @return {String}     Clean token name
 */
function clean(str) {
  return str.replace(/#\{([^\}]+)\}/g, '$1');
}
}, {"happens":"node_modules/happens/index"});
require.register('node_modules/happens/index', function(require, module, exports){
/**
 * Module constructor
 * @param  {Object} target Target object to extends methods and properties into
 * @return {Object}        Target after with extended methods and properties
 */
module.exports = function(target) {
  target = target || {};
  for(var prop in Happens)
    target[prop] = Happens[prop];
  return target;
};



/**
 * Class Happens
 * @type {Object}
 */
var Happens = {

  /**
   * Initializes event
   * @param  {String} event Event name to initialize
   * @return {Array}        Initialized event pool
   */
  __init: function(event) {
    var tmp = this.__listeners || (this.__listeners = []);
    return tmp[event] || (tmp[event] = []);
  },

  /**
   * Adds listener
   * @param  {String}   event Event name
   * @param  {Function} fn    Event handler
   */
  on: function(event, fn) {
    validate(fn);
    this.__init(event).push(fn);
  },

  /**
   * Removes listener
   * @param  {String}   event Event name
   * @param  {Function} fn    Event handler
   */
  off: function(event, fn) {
    var pool = this.__init(event);
    pool.splice(pool.indexOf(fn), 1);
  },

  /**
   * Add listener the fires once and auto-removes itself
   * @param  {String}   event Event name
   * @param  {Function} fn    Event handler
   */
  once: function(event, fn) {
    validate(fn);
    var self = this, wrapper = function() {
      self.off(event, wrapper);
      fn.apply(this, arguments);
    };
    this.on(event, wrapper );
  },

  /**
   * Emit some event
   * @param  {String} event Event name -- subsequent params after `event` will
   * be passed along to the event's handlers
   */
  emit: function(event /*, arg1, arg2 */ ) {
    var i, pool = this.__init(event).slice(0);
    for(i in pool)
      pool[i].apply(this, [].slice.call(arguments, 1));
  }
};



/**
 * Validates if a function exists and is an instanceof Function, and throws
 * an error if needed
 * @param  {Function} fn Function to validate
 */
function validate(fn) {
  if(!(fn && fn instanceof Function))
    throw new Error(fn + ' is not a Function');
}
}, {});
require.register('node_modules/ways-browser/lib/hash', function(require, module, exports){
// Generated by CoffeeScript 1.6.3
var Event, Hash, PseudoHistory, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Event = require('happens');

PseudoHistory = (function(_super) {
  __extends(PseudoHistory, _super);

  function PseudoHistory() {
    _ref = PseudoHistory.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  PseudoHistory.prototype.state = null;

  return PseudoHistory;

})(Array);

module.exports = Hash = (function(_super) {
  __extends(Hash, _super);

  Hash.prototype.history = null;

  function Hash() {
    var hash, pathname,
      _this = this;
    this.history = new PseudoHistory;
    hash = window.location.hash;
    pathname = window.location.pathname;
    if (hash === '') {
      if (pathname.length > 1) {
        window.location.href = '/#' + pathname;
      } else {
        window.location.href = '#/';
      }
    }
    window.attachEvent('onhashchange', function() {
      return _this.emit('url:change', _this.pathname());
    }, false);
  }

  Hash.prototype.pathname = function() {
    return window.location.hash;
  };

  Hash.prototype.push = function(url, title, state) {
    this.history.push(this.history.state = state);
    window.location.hash = url;
    if (title != null) {
      document.title = title;
    }
    return this.emit('url:change', this.pathname());
  };

  Hash.prototype.replace = function(url, title, state) {
    this.history[this.history.length - 1] = this.history.state = state;
    if (title != null) {
      document.title = title;
    }
    return window.location.hash.replace(url);
  };

  return Hash;

})(Event);

}, {"happens":"node_modules/ways-browser/node_modules/happens/lib/happens"});
require.register('node_modules/ways-browser/lib/history', function(require, module, exports){
// Generated by CoffeeScript 1.6.3
var Event, History,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Event = require('happens');

module.exports = History = (function(_super) {
  __extends(History, _super);

  History.prototype.history = window.history;

  function History() {
    var _ref,
      _this = this;
    if ((_ref = window.location.hash) != null ? _ref.length : void 0) {
      this.replace(window.location.hash.substr(1));
    }
    window.addEventListener('popstate', function() {
      var popped;
      if (initial === _this.pathname() && !popped) {
        return popped = true;
      }
      return _this.emit('url:change', window.location.pathname);
    }, false);
  }

  History.prototype.pathname = function() {
    return window.location.pathname;
  };

  History.prototype.push = function(url, title, state) {
    window.history.pushState(state, title, url);
    if (title != null) {
      document.title = title;
    }
    return this.emit('url:change', window.location.pathname);
  };

  History.prototype.replace = function(url, title, state) {
    window.history.replaceState(state, title, url);
    if (title != null) {
      return document.title = title;
    }
  };

  return History;

})(Event);

}, {"happens":"node_modules/ways-browser/node_modules/happens/lib/happens"});
require.register('node_modules/ways-browser/lib/index', function(require, module, exports){
// Generated by CoffeeScript 1.6.3
var Event, Hash, History, Index,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Event = require('happens');

History = require('./history');

Hash = require('./hash');

module.exports = Index = (function(_super) {
  __extends(Index, _super);

  Index.prototype.api = null;

  function Index() {
    var _this = this;
    if (window.history.pushState != null) {
      this.api = new History;
    } else {
      this.api = new Hash;
    }
    this.api.on('url:change', function(pathname) {
      return _this.emit('url:change', pathname);
    });
    this.history = this.api.history;
  }

  Index.prototype.pathname = function() {
    return this.api.pathname();
  };

  Index.prototype.push = function(url, title, state) {
    return this.api.push(url, title, state);
  };

  Index.prototype.replace = function(url, title, state) {
    return this.api.replace(url, title, state);
  };

  return Index;

})(Event);

}, {"happens":"node_modules/ways-browser/node_modules/happens/lib/happens","./history":"node_modules/ways-browser/lib/history","./hash":"node_modules/ways-browser/lib/hash"});
require.register('node_modules/ways-browser/node_modules/happens/lib/happens', function(require, module, exports){
// Generated by CoffeeScript 1.6.3
var Happens,
  __slice = [].slice;

module.exports = Happens = (function() {
  function Happens() {}

  Happens.prototype.on = function(key, callback) {
    var pool;
    pool = this.__listeners || (this.__listeners = []);
    return (pool[key] || (pool[key] = [])).push(callback);
  };

  Happens.prototype.off = function(key, callback) {
    var pool, _ref;
    if ((pool = (_ref = this.__listeners) != null ? _ref[key] : void 0) != null) {
      return pool.splice(pool.indexOf(callback), 1);
    }
  };

  Happens.prototype.once = function(key, callback) {
    var wrapper,
      _this = this;
    return this.on(key, wrapper = function() {
      _this.off(key, wrapper);
      return callback.apply(_this, arguments);
    });
  };

  Happens.prototype.emit = function() {
    var args, key, listener, pool, _i, _len, _ref, _ref1, _results;
    key = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    if ((pool = (_ref = this.__listeners) != null ? _ref[key] : void 0) != null) {
      _ref1 = pool.slice(0);
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        listener = _ref1[_i];
        _results.push(listener.apply(this, args));
      }
      return _results;
    }
  };

  Happens.mixin = function(target) {
    var prop, _results;
    _results = [];
    for (prop in this.prototype) {
      _results.push(target[prop] = this.prototype[prop]);
    }
    return _results;
  };

  return Happens;

})();

}, {});
require.register('node_modules/ways/lib/flow', function(require, module, exports){
var happens = require('happens'),
    fluid = require('./fluid');

var find = function(arr, filter) {
  for (var item, i = 0, len = arr.length; i < len; i++) {
    if (filter(item = arr[i])) {
      return item;
    }
  }
};

var reject = function(arr, filter) {
  for (var item, copy = [], i = 0, len = arr.length; i < len; i++) {
    if (!filter(item = arr[i])) {
      copy.push(item);
    }
  }
  return copy;
};


module.exports = function(routes, mode){
  return new Flow( routes, mode );
};


function Flow(routes, mode) {
  happens(this);

  this.routes = routes;
  this.mode = mode;

  this.deads = [];
  this.actives = [];
  this.pendings = [];
  this.status = 'free'
}

Flow.prototype.run = function(url, route) {
  var flu, self = this;

  if( this.status == 'busy')
    this.actives.splice(-1, 1);

  this.emit('status:busy');

  this.deads = [];
  this.pendings = [];

  flu = fluid(route, url);
  this.filter_pendings(flu);
  this.filter_deads();

  this.status = 'busy';
  if (this.mode === 'run+destroy') {
    this.run_pendings(function() {
      self.destroy_deads(function() {
        self.status = 'free';
        self.emit('status:free', self.mode);
      });
    });
  }
  else if (this.mode === 'destroy+run') {
    this.destroy_deads(function() {
      self.run_pendings(function() {
        self.status = 'free';
        self.emit('status:free', self.mode);
      });
    });
  }
};

Flow.prototype.find_dependency = function(parent) {
  var route, flu;

  flu = find(this.actives, function(f) {
    return f.url === parent.dependency;
  });
  if(flu != null) return flu;
  
  route = find(this.routes, function(r) {
    return r.matcher.test(parent.route.dependency);
  });
  if(route != null) return fluid(route, parent.dependency);

  return null;
};

Flow.prototype.filter_pendings = function(parent) {
  var err, flu, route, dep;

  this.pendings.unshift(parent);
  if (parent.dependency == null)
    return;

  if ((flu = this.find_dependency(parent)) != null)
    return this.filter_pendings(flu);

  route = parent.route.pattern;
  dep = parent.dependency
  err = "Dependency '" + dep + "' not found for route '" + route + "'";

  throw new Error(err);
};

Flow.prototype.filter_deads = function() {
  var flu, is_pending, i, len;

  for (i = 0, len = this.actives.length; i < len; i++) {
    
    flu = this.actives[i];
    is_pending = find(this.pendings, function(f) {
      return f.url === flu.url;
    });

    if (!is_pending) {
      this.deads.push(flu);
    }
  }
};

Flow.prototype.run_pendings = function(done) {
  var flu, is_active, self = this;

  if (this.pendings.length === 0) return done();

  flu = this.pendings.shift();
  is_active = find(this.actives, function(f) {
    return f.url === flu.url;
  });

  if (is_active)
    return this.run_pendings(done);

  this.actives.push(flu);
  this.emit('run:pending', flu.url);

  flu.run(function() {
    self.run_pendings(done);
  });
};

Flow.prototype.destroy_deads = function(done) {
  var flu, self = this;

  if (this.deads.length === 0) return done();

  flu = this.deads.pop();
  this.actives = reject(this.actives, function(f) {
    return f.url === flu.url;
  });

  flu.destroy(function() {
    self.destroy_deads(done);
  });
};
}, {"happens":"node_modules/ways/node_modules/happens/lib/happens","./fluid":"node_modules/ways/lib/fluid"});
require.register('node_modules/ways/lib/fluid', function(require, module, exports){
module.exports = function(route, url) {
  return new Fluid(route, url);
}

function Fluid(route, url) {
  this.route = route;
  this.url = url;

  if(route.dependency)
    this.dependency = route.computed_dependency(url);
}

Fluid.prototype.run = function(done) {
  this.req = this.route.run(this.url, done);
};

Fluid.prototype.destroy = function(done){
  if(this.req) this.route.destroy(this.req, done);
};
}, {});
require.register('node_modules/ways/lib/way', function(require, module, exports){
var _params_regex = {
  named: /:\w+/g,
  splat: /\*\w+/g,
  optional: /\/(?:\:|\*)(\w+)\?/g
};

module.exports = function(pattern, runner, destroyer, dependency) {
  return new Way(pattern, runner, destroyer, dependency);
};


function Way(pattern, runner, destroyer, dependency) {

  this.matcher = null;
  this.pattern = pattern;
  this.runner = runner;
  this.destroyer = destroyer;
  this.dependency = dependency;

  var _params_regex = {
    named: /:\w+/g,
    splat: /\*\w+/g,
    optional: /\/(\:|\*)(\w+)\?/g
  };

  if (pattern === '*') {
    this.matcher = /.*/;
  } else {
    this.matcher = pattern.replace(_params_regex.optional, '(?:\/)?$1$2?');
    this.matcher = this.matcher.replace(_params_regex.named, '([^\/]+)');
    this.matcher = this.matcher.replace(_params_regex.splat, '(.*?)');
    this.matcher = new RegExp("^" + this.matcher + "$", 'm');
  }
};

Way.prototype.extract_params = function(url) {
  var name, names, params, vals, i, len;

  names = this.pattern.match(/(?::|\*)(\w+)/g);
  if (names == null) return {};

  vals = url.match(this.matcher);
  params = {};
  for (i = 0, len = names.length; i < len; i++) {
    name = names[i];
    params[name.substr(1)] = vals[i+1];
  }

  return params;
};

Way.prototype.rewrite_pattern = function(pattern, url) {
  var key, value, reg, params;

  params = this.extract_params(url);
  for (key in params) {
    value = params[key];
    reg = new RegExp("[\:\*]+" + key, 'g');
    pattern = pattern.replace(reg, value);
  }
  return pattern;
};

Way.prototype.computed_dependency = function(url) {
  return this.rewrite_pattern(this.dependency, url);
};

Way.prototype.run = function(url, done) {
  var req = {
    url: url,
    pattern: this.pattern,
    params: this.extract_params(url)
  };
  this.runner(req, done);
  return req;
};

Way.prototype.destroy = function(req, done) {
  this.destroyer(req, done);
};
}, {});
require.register('node_modules/ways/lib/ways', function(require, module, exports){
var way = require('./way'),
    flow = require('./flow');

var mode, flo, middleware,
    routes = [];

dispatch = function(url) {
  var i, route;
  url = '/' + url.replace(/^[\/]+|[\/]+$/mg, '');
  for(i in routes) {
    route = routes[i];
    if(routes[i].matcher.test(url))
      return run(url, routes[i]);
  }
  throw new Error("Route not found for url '"+ url +"'");
};

run = function(url, route) {
  if(flo) {
    flo.run(url, route);
  } else {
    route.run(url);
  }
  return route;
};

module.exports = function(pattern, runner, destroyer, dependency){
  if(flo && arguments.length < 3)
    throw new Error('In `flow` mode you must to pass at least 3 args.');
  
  var route = way(pattern, runner, destroyer, dependency);
  routes.push(route);
  return route;
};

exports = module.exports;

exports.init = function() {
  dispatch(this.pathname());
};

exports.mode = function (m){
  routes = [];
  if((mode = m) != null)
    flo = flow(routes, mode);
};

exports.use = function(mid){
  middleware = new mid;
  middleware.on('url:change', function() {
    dispatch(middleware.pathname());
  });
};

exports.pathname = function(){
  if(middleware)
    return middleware.pathname();
};

exports.go = function(url, title, state){
  if(middleware)
    middleware.push(url, title, state);
  else
    dispatch(url);
};

exports.go.silent = function(url, title, state){
  if(middleware)
    middleware.replace(url, title, state);
};

exports.reset = function(){
  flo = null
  mode = null
  routes = []
  middleware = null
};
}, {"./way":"node_modules/ways/lib/way","./flow":"node_modules/ways/lib/flow"});
require.register('node_modules/ways/node_modules/happens/lib/happens', function(require, module, exports){
module.exports = function(target) {
  for(var prop in Happens)
    target[prop] = Happens[prop];
  return target;
};

function validate(fn) {
  if(!(fn && fn instanceof Function))
    throw new Error(fn + 'is not a function');
}

var Happens = {
  __init: function(event) {
    var tmp = this.__listeners || (this.__listeners = []);
    return tmp[event] || (tmp[event] = []);
  },

  on: function(event, fn) {
    validate(fn);
    this.__init(event).push(fn);
  },

  off: function(event, fn) {
    var pool = this.__init(event);
    pool.splice(pool.indexOf(fn), 1);
  },

  once: function(event, fn) {
    validate(fn);
    var self = this, wrapper = function() {
      self.off(event, wrapper);
      fn.apply(this, arguments);
    };
    this.on(event, wrapper );
  },

  emit: function(event) {
    var i, pool = this.__init(event).slice(0);
    for(i in pool)
      pool[i].apply(this, [].slice.call(arguments, 1));
  }
};
}, {});
require.register('src/frontend/scripts/app', function(require, module, exports){
var App, app, navigation, user_controller, views,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

require('./globals');

require('./vendors');

require('../vendors/parallax.min.js');

views = require('./controllers/views');

navigation = require('./controllers/navigation');

user_controller = require('./controllers/user');

App = (function() {
  App.prototype.window = null;

  App.prototype.settings = null;

  App.prototype.local = null;

  function App() {
    this.after_render = __bind(this.after_render, this);
    happens(this);
    this.on('ready', this.after_render);
  }

  App.prototype.start = function() {
    var _this = this;
    this.local = require('app/controllers/local_connection');
    this.window = require('app/controllers/window');
    this.body = $('body');
    this.settings = require('app/utils/settings');
    this.settings.bind(this.body);
    views.bind();
    navigation.bind();
    navigation.on('before_destroy', function() {
      log("--------- BEFORE DESTROY");
      return views.unbind('#content');
    });
    return navigation.on('after_render', function() {
      views.bind('#content');
      navigation.bind('#content');
      return user_controller.check_user();
    });
  };

  App.prototype.login = function(user) {
    log("--------> login called from outside");
    navigation.go("/" + user.username);
    return user_controller.login(user);
  };

  App.prototype.logout = function() {
    log("[logged out]", user);
    return user_controller.logout();
  };

  /*
  	# After the views have been rendered
  */


  App.prototype.after_render = function() {
    var _this = this;
    log("after_render");
    return delay(10, function() {
      return _this.body.addClass("loaded");
    });
  };

  return App;

})();

app = new App;

$(function() {
  return app.start();
});

module.exports = window.app = app;

}, {"./globals":"src/frontend/scripts/globals","./vendors":"src/frontend/scripts/vendors","../vendors/parallax.min.js":"src/frontend/vendors/parallax.min","./controllers/views":"src/frontend/scripts/controllers/views","./controllers/navigation":"src/frontend/scripts/controllers/navigation","./controllers/user":"src/frontend/scripts/controllers/user","app/controllers/local_connection":"src/frontend/scripts/controllers/local_connection","app/controllers/window":"src/frontend/scripts/controllers/window","app/utils/settings":"src/frontend/scripts/utils/settings"});
require.register('src/frontend/scripts/controllers/appcast', function(require, module, exports){
/*
# Socket controller will be used to communicate with desktop app AppCast
*/

var WebSocket, appcast, aware, v;

aware = require('aware');

v = require('app/vendors');

appcast = aware({});

WebSocket = window.WebSocket || null;

appcast.messages = {};

appcast.vu = {};

appcast.set('connected', false);

appcast.connect = function() {
  var messages_socket, vu_socket;
  if (!WebSocket) {
    return console.info('+ socket controller wont connect');
  }
  messages_socket = 'ws://localhost:51234/loopcast/messages';
  appcast.messages = new v.ReconnectingWebsocket(messages_socket);
  appcast.messages.onopen = function() {
    console.info('- socket controller connection opened');
    appcast.set('connected', true);
    return appcast.messages.send(JSON.stringify(['get_input_devices']));
  };
  appcast.messages.onclose = function() {
    console.info('- AppCast isnt OPEN, will retry to connect');
    return appcast.set('connected', false);
  };
  appcast.messages.onmessage = function(e) {
    var args, error, from_json, json, method;
    json = e.data;
    try {
      from_json = JSON.parse(json);
    } catch (_error) {
      error = _error;
      console.error("- socket controller error parsing json");
      console.error(error);
      return error;
    }
    method = from_json[0];
    args = from_json[1];
    if ('error' === method) {
      return console.log('error', args);
    }
    if (typeof appcast.callbacks[method] === 'function') {
      return appcast.callbacks[method](args);
    } else {
      return console.log(" + socket controller has no callback for:", method);
    }
  };
  vu_socket = 'ws://localhost:51234/loopcast/vu';
  appcast.vu = new v.ReconnectingWebsocket(vu_socket);
  appcast.vu.onopen = function() {
    console.info('- socket VU connection opened');
    return appcast.set('vu:connected', true);
  };
  appcast.vu.onclose = function() {
    console.info('- socket VU connection closed');
    return appcast.set('vu:connected', false);
  };
  return appcast.vu.onmessage = function(e) {
    var reader;
    reader = new FileReader;
    reader.onload = function(e) {
      var buffer;
      buffer = new Float32Array(e.target.result);
      return appcast.set('stream:vu', buffer);
    };
    return reader.readAsArrayBuffer(e.data);
  };
};

appcast.start_stream = function(device_name) {
  var mount_point, password, payload;
  mount_point = "hems";
  password = "loopcast2015";
  payload = {
    device_name: device_name,
    mount_point: mount_point,
    password: password
  };
  appcast.set("stream:starting", true);
  return appcast.messages.send(JSON.stringify(["start_stream", payload]));
};

appcast.stop_stream = function() {
  appcast.set("stream:stopping", true);
  return appcast.messages.send(JSON.stringify(["stop_stream"]));
};

/*
# callbacks are called by "messages" coming from the WebsocketServer created
# by the desktop application AppCast
*/


appcast.callbacks = {
  input_devices: function(args) {
    return appcast.set('input_devices', args.devices);
  },
  stream_started: function(args) {
    if ((args != null) && (args.error != null)) {
      console.error("- stream_started error:", args.error);
      appcast.set("stream:error", args.error);
      return;
    }
    appcast.set('stream:online', true);
    appcast.set("stream:starting", null);
    return appcast.set("stream:error", null);
  },
  stream_stopped: function() {
    appcast.set('stream:online', false);
    return appcast.set("stream:stopping", null);
  }
};

/*
# Listening to messages
*/


appcast.on('input_device', function() {
  if (appcast.get('stream:online')) {
    console.error('- input device changed while stream:online');
    return console.error('? what should we do');
  }
});

appcast.connect();

module.exports = appcast;

}, {"aware":"node_modules/aware/index","app/vendors":"src/frontend/scripts/vendors"});
require.register('src/frontend/scripts/controllers/local_connection', function(require, module, exports){
/*
#
# Controller responsible for communication with other instances of the app
# for instance another tab or pop up open
#
# see https://github.com/jeremyharris/LocalConnection.js/tree/master
# fore more information, for instance integration with IE9
#
*/

var app, connection;

app = require('app/app');

connection = new LocalConnection('beta.loopcast.fm');

connection.listen();

connection.addCallback('login', function(user) {
  console.info(' + location connection, user logged in:', user);
  return app.login(user);
});

connection.addCallback('logout', function() {
  console.info(' + location connection, user logged out');
  return app.logout();
});

module.exports = connection;

}, {"app/app":"src/frontend/scripts/app"});
require.register('src/frontend/scripts/controllers/navigation', function(require, module, exports){
var Navigation, happens, settings, ways,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

settings = require('app/utils/settings');

happens = require('happens');

ways = require('ways');

ways.use(require('ways-browser'));

Navigation = (function() {
  var instance;

  instance = null;

  Navigation.prototype.first_loading = true;

  function Navigation() {
    this.url_changed = __bind(this.url_changed, this);
    var _this = this;
    if (Navigation.instance) {
      console.error("You can't instantiate this Navigation twice");
      return;
    }
    Navigation.instance = this;
    this.content_selector = '#content .inner_content';
    this.content_div = $(this.content_selector);
    happens(this);
    window.ways = ways;
    ways('*', this.url_changed);
    delay(200, function() {
      if (_this.first_loading) {
        return _this.emit('after_render');
      }
    });
  }

  Navigation.prototype.url_changed = function(req) {
    var div,
      _this = this;
    log("url_changed", req.url);
    req.url = req.url.replace("/#", '');
    div = $('<div>');
    this.emit('before_load');
    return div.load(req.url, function() {
      _this.emit('on_load');
      if (app.body.scrollTop() > 0) {
        app.body.animate({
          scrollTop: 0
        });
      }
      _this.emit('before_destroy');
      return delay(400, function() {
        var new_content;
        new_content = div.find(_this.content_selector).children();
        _this.content_div = $(_this.content_selector);
        _this.content_div.children().remove();
        _this.content_div.append(new_content);
        return delay(10, function() {
          log("[Navigation] after_render", req.url);
          return _this.emit('after_render');
        });
      });
    });
  };

  Navigation.prototype.go = function(url) {
    if (window.opener != null) {
      return true;
    }
    this.first_loading = false;
    ways.go(url);
    return false;
  };

  Navigation.prototype.bind = function(scope) {
    if (scope == null) {
      scope = 'body';
    }
    return $(scope).find('a').each(function(index, item) {
      var $item, href;
      $item = $(item);
      href = $item.attr('href');
      if (href == null) {
        return;
      }
      if (href.indexOf('http') >= 0 && href.indexOf(document.domain) < 0) {
        return;
      }
      if (href.indexOf("#") === 0) {
        return $item.click(function() {
          return false;
        });
      } else if (href.indexOf("javascript") === 0 || href.indexOf("tel:") === 0) {
        return true;
      } else {
        return $item.click(function() {
          return Navigation.instance.go($(this).attr('href'));
        });
      }
    });
  };

  return Navigation;

})();

module.exports = new Navigation;

}, {"app/utils/settings":"src/frontend/scripts/utils/settings","happens":"node_modules/happens/index","ways":"node_modules/ways/lib/ways","ways-browser":"node_modules/ways-browser/lib/index"});
require.register('src/frontend/scripts/controllers/user', function(require, module, exports){
var happens;

happens = require('happens');

module.exports = happens({
  logout: function(callback) {
    var _this = this;
    if (callback == null) {
      callback = function() {};
    }
    if (!this.is_logged()) {
      return callback({
        error: {
          code: 'node_logged'
        }
      });
    }
    log("[User] trying to logout...");
    return $.post('/api/v1/logout', {}, function(data) {
      log("[User] logout ~ success", data);
      _this.emit('user:unlogged');
      app.body.removeClass("logged");
      log("[User Controller] deleting user variable");
      delete loopcast.user;
      return typeof callback === "function" ? callback() : void 0;
    });
  },
  login: function(user) {
    loopcast.user = user;
    app.body.addClass("logged");
    this.emit('user:logged', loopcast.user);
    return log("[User Controller] login", loopcast.user);
  },
  check_user: function() {
    if (this.is_logged()) {
      return this.login(loopcast.user);
    } else {
      return this.logout();
    }
  },
  is_logged: function() {
    return loopcast.user != null;
  }
});

}, {"happens":"node_modules/happens/index"});
require.register('src/frontend/scripts/controllers/views', function(require, module, exports){
var View, happens, view,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

happens = require('happens');

View = (function() {
  var UNIQUE_ID;

  function View() {
    this.get_by_dom = __bind(this.get_by_dom, this);
    this.get_by_uid = __bind(this.get_by_uid, this);
    this.get = __bind(this.get, this);
  }

  UNIQUE_ID = 0;

  /*
  	Hash Map to store the views:
  
  	hash_model = {
  		"<view_name>" : [ <view_instance>, <view_instance>, .. ],
  		"<view_name>" : [ <view_instance>, <view_instance>, .. ]
  	}
  */


  View.prototype.hash_model = {};

  /*
  	Uid Map. Internal map used for easily get a view by uid
  
  	uid_map = {
  		"<UNIQUE_ID>" : { name : <view_name>, index: <view_index> },
  		"<UNIQUE_ID>" : { name : <view_name>, index: <view_index> },
  		  ...
  	}
  */


  View.prototype.uid_map = {};

  View.prototype.get = function(id, index) {
    if (index == null) {
      index = 0;
    }
    if (this.hash_model[id] == null) {
      return false;
    }
    return this.hash_model[id][index];
  };

  View.prototype.get_by_uid = function(uid) {
    var index, name;
    if (this.uid_map[uid] != null) {
      name = this.uid_map[uid].name;
      index = this.uid_map[uid].index;
      return this.get(name, index);
    }
    return false;
  };

  View.prototype.get_by_dom = function(selector) {
    return this.get_by_uid($(selector).data('uid'));
  };

  View.prototype.bind = function(scope, tolog) {
    var _this = this;
    if (scope == null) {
      scope = 'body';
    }
    if (tolog == null) {
      tolog = false;
    }
    return $(scope).find('[data-view]').each(function(index, item) {
      var $item, name, names, view_name, _i, _len;
      $item = $(item);
      view_name = $item.data('view');
      $item.removeAttr('data-view');
      if (view_name.substring(0, 1) === "[") {
        names = view_name.substring(1, view_name.length - 1).split(",");
      } else {
        names = [view_name];
      }
      for (_i = 0, _len = names.length; _i < _len; _i++) {
        name = names[_i];
        _this._add_view($item, name);
      }
      return $item.removeAttr('data-view');
    }).promise().done(function() {
      return _this.emit("binded");
    });
  };

  View.prototype.unbind = function(scope) {
    var _this = this;
    if (scope == null) {
      scope = 'body';
    }
    return $(scope).find('[data-uid]').each(function(index, item) {
      var $item, id, v;
      $item = $(item);
      id = $item.data('uid');
      v = view.get_by_uid(id);
      if (v) {
        if (typeof v.destroy === "function") {
          v.destroy();
        }
        return view.on_view_destroyed(id);
      }
    }).promise().done(function() {
      return _this.emit("unbinded");
    });
  };

  View.prototype._add_view = function($item, view_name) {
    var e, l, view, _base;
    try {
      view = require("app/views/" + view_name);
    } catch (_error) {
      e = _error;
      console.warn('e ->', e.message);
      console.error("app/views/" + view + " not found for ", $item);
    }
    view = new view($item);
    if ((_base = this.hash_model)[view_name] == null) {
      _base[view_name] = [];
    }
    l = this.hash_model[view_name].length;
    this.hash_model[view_name][l] = view;
    view.uid = UNIQUE_ID;
    view.view_name = view_name;
    $item.attr('data-uid', UNIQUE_ID);
    this.uid_map[UNIQUE_ID] = {
      name: view_name,
      index: this.hash_model[view_name].length - 1
    };
    return UNIQUE_ID++;
  };

  View.prototype.on_view_destroyed = function(uid) {
    var i, index, item, name, _i, _len, _ref, _results;
    if (this.uid_map[uid] != null) {
      name = this.uid_map[uid].name;
      index = this.uid_map[uid].index;
      if (this.hash_model[name][index] != null) {
        delete this.uid_map[uid];
        this.hash_model[name].splice(index, 1);
        _ref = this.hash_model[name];
        _results = [];
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          item = _ref[i];
          _results.push(this.uid_map[item.uid].index = i);
        }
        return _results;
      }
    }
  };

  return View;

})();

view = new View;

happens(view);

module.exports = window.view = view;

window.View = view;

}, {"happens":"node_modules/happens/index"});
require.register('src/frontend/scripts/controllers/window', function(require, module, exports){
var happens, on_resize, win;

happens = require('happens');

module.exports = happens(win = {});

win.obj = $(window);

win.obj.on('resize', on_resize = function() {
  win.w = win.obj.width();
  win.h = win.obj.height();
  return win.emit('resize');
});

delay(100, on_resize);

$('html,body').on('click', function() {
  return win.emit("body:clicked");
});

}, {"happens":"node_modules/happens/index"});
require.register('src/frontend/scripts/globals', function(require, module, exports){
/*
# on the browser, window is the global holder
*/

window.delay = require('./globals/delay');

window.interval = require('./globals/interval');

window.log = require('./globals/log');

window.mover = require('./globals/mover');

window.happens = require('happens');

module.exports = window;

}, {"./globals/delay":"src/frontend/scripts/globals/delay","./globals/interval":"src/frontend/scripts/globals/interval","./globals/log":"src/frontend/scripts/globals/log","./globals/mover":"src/frontend/scripts/globals/mover","happens":"node_modules/happens/index"});
require.register('src/frontend/scripts/globals/delay', function(require, module, exports){
module.exports = function(delay, funk) {
  return setTimeout(funk, delay);
};

}, {});
require.register('src/frontend/scripts/globals/interval', function(require, module, exports){
module.exports = function(interval, funk) {
  return setInterval(funk, interval);
};

}, {});
require.register('src/frontend/scripts/globals/log', function(require, module, exports){
module.exports = function() {
  log.history = log.history || [];
  log.history.push(arguments);
  if (typeof console !== "undefined" && console !== null) {
    return console.log(Array.prototype.slice.call(arguments));
  }
};

}, {});
require.register('src/frontend/scripts/globals/mover', function(require, module, exports){
module.exports = {
  scroll_to: function(el, with_topbar, speed) {
    var y;
    if (with_topbar == null) {
      with_topbar = false;
    }
    if (speed == null) {
      speed = 300;
    }
    y = el.position().top;
    log("[Mover] scroll_to", y);
    return this.scroll_to_y(y, with_topbar, speed);
  },
  scroll_to_y: function(y, with_topbar, speed) {
    if (with_topbar == null) {
      with_topbar = true;
    }
    if (speed == null) {
      speed = 300;
    }
    if (with_topbar) {
      y -= app.settings.header_height;
    }
    log("[mover] scroll_to_y", y);
    return $('html, body').animate({
      scrollTop: y
    }, speed);
  }
};

}, {});
require.register('src/frontend/scripts/utils/browser', function(require, module, exports){
var BrowserDetect;

BrowserDetect = {
  init: function() {
    this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
    this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || "an unknown version";
    return this.OS = this.searchString(this.dataOS) || "an unknown OS";
  },
  searchString: function(data) {
    var dataProp, dataString, i;
    i = 0;
    while (i < data.length) {
      dataString = data[i].string;
      dataProp = data[i].prop;
      this.versionSearchString = data[i].versionSearch || data[i].identity;
      if (dataString) {
        if (dataString.indexOf(data[i].subString) !== -1) {
          return data[i].identity;
        }
      } else {
        if (dataProp) {
          return data[i].identity;
        }
      }
      i++;
    }
  },
  searchVersion: function(dataString) {
    var index;
    index = dataString.indexOf(this.versionSearchString);
    if (index === -1) {
      return;
    }
    return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
  },
  dataBrowser: [
    {
      string: navigator.userAgent,
      subString: "Chrome",
      identity: "Chrome"
    }, {
      string: navigator.userAgent,
      subString: "OmniWeb",
      versionSearch: "OmniWeb/",
      identity: "OmniWeb"
    }, {
      string: navigator.vendor,
      subString: "Apple",
      identity: "Safari",
      versionSearch: "Version"
    }, {
      prop: window.opera,
      identity: "Opera",
      versionSearch: "Version"
    }, {
      string: navigator.vendor,
      subString: "iCab",
      identity: "iCab"
    }, {
      string: navigator.vendor,
      subString: "KDE",
      identity: "Konqueror"
    }, {
      string: navigator.userAgent,
      subString: "Firefox",
      identity: "Firefox"
    }, {
      string: navigator.vendor,
      subString: "Camino",
      identity: "Camino"
    }, {
      string: navigator.userAgent,
      subString: "Netscape",
      identity: "Netscape"
    }, {
      string: navigator.userAgent,
      subString: "MSIE",
      identity: "Explorer",
      versionSearch: "MSIE"
    }, {
      string: navigator.userAgent,
      subString: "Gecko",
      identity: "Mozilla",
      versionSearch: "rv"
    }, {
      string: navigator.userAgent,
      subString: "Mozilla",
      identity: "Netscape",
      versionSearch: "Mozilla"
    }
  ],
  dataOS: [
    {
      string: navigator.platform,
      subString: "Win",
      identity: "Windows"
    }, {
      string: navigator.platform,
      subString: "Mac",
      identity: "Mac"
    }, {
      string: navigator.userAgent,
      subString: "iPhone",
      identity: "iPhone/iPod"
    }, {
      string: navigator.platform,
      subString: "Linux",
      identity: "Linux"
    }
  ]
};

BrowserDetect.init();

module.exports = BrowserDetect;

}, {});
require.register('src/frontend/scripts/utils/opacity', function(require, module, exports){
var Opacity;

Opacity = {
  show: function(el, time) {
    if (time == null) {
      time = 500;
    }
    return el.fadeIn(time);
  },
  hide: function(el, time) {
    if (time == null) {
      time = 500;
    }
    return el.fadeOut(time);
  },
  get_time: function(time) {
    return (time / 1000) + "s";
  }
};

module.exports = Opacity;

}, {});
require.register('src/frontend/scripts/utils/preload', function(require, module, exports){
module.exports = function(images, callback) {
  var count, images_loaded, item, load, loaded, _i, _len, _results;
  count = 0;
  images_loaded = [];
  load = function(src, callback) {
    var img;
    img = new Image();
    img.onload = callback;
    img.src = src;
    return images_loaded.push(img);
  };
  loaded = function() {
    count++;
    log("[Preloader] load_multiple - loaded", "" + count + " / " + images.length);
    if (count === images.length) {
      log("[Preloader] load_multiple - loaded ALL");
      return callback(images_loaded);
    }
  };
  _results = [];
  for (_i = 0, _len = images.length; _i < _len; _i++) {
    item = images[_i];
    _results.push(load(item, loaded));
  }
  return _results;
};

}, {});
require.register('src/frontend/scripts/utils/settings', function(require, module, exports){
var BrowserDetect, has3d, platform, ratio, settings;

BrowserDetect = require('app/utils/browser');

settings = {
  browser: {
    id: BrowserDetect.browser,
    version: BrowserDetect.version,
    OS: BrowserDetect.OS,
    chrome: navigator.userAgent.toLowerCase().indexOf('chrome') > -1,
    firefox: /Firefox/i.test(navigator.userAgent),
    ie8: false,
    device_ratio: window.devicePixelRatio,
    handheld: false,
    tablet: false,
    mobile: false,
    desktop: false,
    device: false,
    debug: false,
    css_cover_supported: Modernizr.backgroundsize,
    min_size: {
      w: 900,
      h: 400
    }
  },
  webp: false
};

settings.theme = "desktop";

settings.threshold_theme = 900;

settings.browser.retina = settings.browser.device_ratio === 2;

if (settings.browser.chrome && settings.browser.version >= 30) {
  settings.webp = true;
}

if (settings.browser.id === 'Explorer') {
  settings.browser.ie = true;
  if (settings.browser.version === 8) {
    settings.browser.ie8 = true;
  }
  if (settings.browser.version === 9) {
    settings.browser.ie9 = true;
  }
}

settings.video_active = settings.browser.id !== 'Explorer';

if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
  settings.browser.handheld = true;
  ratio = $(window).width() / $(window).height();
  settings.browser.orientation = ratio > 1 ? "landscape" : "portrait";
  if ($(window).width() < 610 || (settings.browser.orientation === "landscape" && ratio > 2.10)) {
    settings.browser.mobile = true;
    settings.browser.tablet = false;
  } else {
    settings.browser.mobile = false;
    settings.browser.tablet = true;
  }
}

settings.browser.device = settings.browser.tablet || settings.browser.mobile;

if (settings.browser.tablet === false && settings.browser.mobile === false) {
  settings.browser.desktop = true;
}

settings.browser.windows_phone = false;

if (settings.browser.mobile && settings.browser.id === 'Explorer') {
  settings.browser.windows_phone = true;
}

settings.touch_device = settings.browser.handheld;

settings.events_map = {
  'down': 'mousedown',
  'up': 'mouseup',
  'move': 'mousemove'
};

if (settings.browser.device) {
  if (settings.browser.windows_phone) {
    settings.events_map = {
      'down': 'MSPointerDown',
      'up': 'MSPointerUp',
      'move': 'MSPointerMove'
    };
  } else {
    settings.events_map = {
      'down': 'touchstart',
      'up': 'touchend',
      'move': 'touchmove'
    };
  }
}

if (settings.browser.desktop) {
  platform = 'desktop';
} else if (settings.browser.tablet) {
  platform = 'tablet';
} else {
  platform = 'mobile';
}

settings.browser_class = settings.browser.id + '_' + settings.browser.version;

has3d = function() {
  var el, t, transforms;
  el = document.createElement("p");
  has3d = void 0;
  transforms = {
    webkitTransform: "-webkit-transform",
    OTransform: "-o-transform",
    msTransform: "-ms-transform",
    MozTransform: "-moz-transform",
    transform: "transform"
  };
  document.body.insertBefore(el, null);
  for (t in transforms) {
    if (el.style[t] !== undefined) {
      el.style[t] = "translate3d(1px,1px,1px)";
      has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]);
    }
  }
  document.body.removeChild(el);
  return has3d !== undefined && has3d.length > 0 && has3d !== "none";
};

settings.bind = function(body) {
  var klasses;
  klasses = [];
  klasses.push(settings.browser_class);
  klasses.push(settings.browser.OS.replace('/', '_'));
  klasses.push(settings.browser.id);
  if (settings.touch_device) {
    klasses.push("touch_device");
  } else {
    klasses.push("no_touch_device");
  }
  if (settings.browser.css_cover_supported) {
    klasses.push("css_cover_supported");
  }
  body.addClass(klasses.join(" ").toLowerCase());
  return settings.header_height = $('header').height();
};

module.exports = settings;

}, {"app/utils/browser":"src/frontend/scripts/utils/browser"});
require.register('src/frontend/scripts/vendors', function(require, module, exports){
var vendors;

vendors = {
  Modernizr: require('../vendors/modernizr.custom.js'),
  LocalConnection: require('../vendors/LocalConnection.js'),
  ReconnectingWebsocket: require('../vendors/reconnecting-websocket.js')
};

module.exports = vendors;

}, {"../vendors/modernizr.custom.js":"src/frontend/vendors/modernizr.custom","../vendors/LocalConnection.js":"src/frontend/vendors/LocalConnection","../vendors/reconnecting-websocket.js":"src/frontend/vendors/reconnecting-websocket"});
require.register('src/frontend/scripts/views/buttons/start_recording', function(require, module, exports){
var appcast;

appcast = require('app/controllers/appcast');

module.exports = function(dom) {
  return dom.click(function() {
    var done, fail, url;
    if (!appcast.get('streaming:online')) {
      console.error('- cant start recording if not streaming');
      return;
    }
    console.log('+ start recording', appcast.get('input_device'));
    url = "/tape/start/recording";
    done = function() {
      console.info('+ recording post done ->', arguments);
      return appcast.set('recording', true);
    };
    fail = function() {
      return console.error('- failing trying to start recording ->', arguments);
    };
    return $.post(url).done(done).fail(fail);
  });
};

}, {"app/controllers/appcast":"src/frontend/scripts/controllers/appcast"});
require.register('src/frontend/scripts/views/buttons/start_stream', function(require, module, exports){
var appcast;

appcast = require('app/controllers/appcast');

module.exports = function(dom) {
  return dom.click(function() {
    if (!appcast.get('input_device')) {
      console.error('- cant start stream before selecting input device');
      return;
    }
    console.log('starting streaming with', appcast.get('input_device'));
    return appcast.start_stream(appcast.get('input_device'));
  });
};

}, {"app/controllers/appcast":"src/frontend/scripts/controllers/appcast"});
require.register('src/frontend/scripts/views/buttons/stop_recording', function(require, module, exports){
var appcast;

appcast = require('app/controllers/appcast');

module.exports = function(dom) {
  return dom.click(function() {
    var done, fail, url;
    if (!appcast.get('stream:recording')) {
      console.error('- cant stop recording if not recording');
      return;
    }
    console.log('+ stopping to record with ', appcast.get('input_device'));
    url = "/tape/stop/recording";
    done = function() {
      return console.info('+ /tape/stop/recording post done ->', arguments);
    };
    fail = function() {
      return console.error('- /tape/stop/recording post failed ->', arguments);
    };
    return $.post(url).done(done).fail(fail);
  });
};

}, {"app/controllers/appcast":"src/frontend/scripts/controllers/appcast"});
require.register('src/frontend/scripts/views/buttons/stop_stream', function(require, module, exports){
var appcast;

appcast = require('app/controllers/appcast');

module.exports = function(dom) {
  return dom.click(function() {
    if (!appcast.get('streaming:online')) {
      console.error('- cant stop stream if not streaming');
      return;
    }
    console.log('+ stoping streaming with', appcast.get('input_device'));
    return appcast.stop_stream();
  });
};

}, {"app/controllers/appcast":"src/frontend/scripts/controllers/appcast"});
require.register('src/frontend/scripts/views/components/click_trigger', function(require, module, exports){
var ClickTrigger, HoverTrigger, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

HoverTrigger = require('app/views/components/hover_trigger');

module.exports = ClickTrigger = (function(_super) {
  __extends(ClickTrigger, _super);

  function ClickTrigger() {
    _ref = ClickTrigger.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  ClickTrigger.prototype.set_listeners = function() {
    this.dom.on('click', this.toggle);
    return app.window.on("body:clicked", this.close);
  };

  return ClickTrigger;

})(HoverTrigger);

}, {"app/views/components/hover_trigger":"src/frontend/scripts/views/components/hover_trigger"});
require.register('src/frontend/scripts/views/components/fullscreen', function(require, module, exports){
var Fullscreen,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

module.exports = Fullscreen = (function() {
  Fullscreen.prototype.factor = 1;

  function Fullscreen(dom) {
    this.dom = dom;
    this.on_resize = __bind(this.on_resize, this);
    this.dom.addClass('fullscreen');
    if (this.dom.data('factor')) {
      this.factor = this.dom.data('factor');
    }
    app.window.on('resize', this.on_resize);
    this.on_resize();
  }

  Fullscreen.prototype.on_resize = function() {
    return this.dom.css({
      'width': '100%',
      'height': (app.window.h - app.settings.header_height) * this.factor
    });
  };

  return Fullscreen;

})();

}, {});
require.register('src/frontend/scripts/views/components/hover', function(require, module, exports){
var Hover, happens,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

happens = require('happens');

module.exports = Hover = (function() {
  function Hover(dom) {
    this.dom = dom;
    this.on_mouse_leave = __bind(this.on_mouse_leave, this);
    this.on_mouse_over = __bind(this.on_mouse_over, this);
    if (app.settings.touch_device) {
      return;
    }
    happens(this);
    this.dom.on('mouseover', this.on_mouse_over);
    this.dom.on('mouseleave', this.on_mouse_leave);
    this.dom.addClass('hover_object');
  }

  Hover.prototype.on_mouse_over = function() {
    return this.dom.addClass('hovered');
  };

  Hover.prototype.on_mouse_leave = function() {
    return this.dom.removeClass('hovered');
  };

  return Hover;

})();

}, {"happens":"node_modules/happens/index"});
require.register('src/frontend/scripts/views/components/hover_trigger', function(require, module, exports){
/*
Adds the class 'hovered' to the element and to the target
The class is toggled on mouseover/mouseleave for desktops
and on click for touch devices
*/

var HoverTrigger,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

module.exports = HoverTrigger = (function() {
  HoverTrigger.prototype.opened = false;

  HoverTrigger.prototype.klass = "hovered";

  function HoverTrigger(dom) {
    this.dom = dom;
    this.on_dropdown_closed = __bind(this.on_dropdown_closed, this);
    this.on_dropdown_opened = __bind(this.on_dropdown_opened, this);
    this.close = __bind(this.close, this);
    this.open = __bind(this.open, this);
    this.toggle = __bind(this.toggle, this);
    this.target = $(this.dom.data('target'));
    if (this.target.length <= 0) {
      log("[HoverTrigger] error. target not found", this.dom.data('target'));
      return;
    }
    this.dom.addClass("hover_dropdown_trigger");
    this.set_listeners();
    app.on("dropdown:opened", this.on_dropdown_opened);
    app.on("dropdown:closed", this.on_dropdown_closed);
  }

  HoverTrigger.prototype.set_listeners = function() {
    if (app.settings.touch_device) {
      this.dom.on('click', this.toggle);
    } else {
      this.dom.on('mouseover', this.open);
      this.target.on('mouseleave', this.close);
    }
    return app.window.on("body:clicked", this.close);
  };

  HoverTrigger.prototype.toggle = function(e) {
    if (this.opened) {
      this.close();
    } else {
      this.open();
    }
    return e.stopPropagation();
  };

  HoverTrigger.prototype.open = function() {
    if (this.opened) {
      return;
    }
    this.opened = true;
    this.dom.addClass(this.klass);
    this.target.addClass(this.klass);
    return app.emit("dropdown:opened", this.uid);
  };

  HoverTrigger.prototype.close = function() {
    if (!this.opened) {
      return;
    }
    this.opened = false;
    this.dom.removeClass(this.klass);
    this.target.removeClass(this.klass);
    return app.emit("dropdown:closed", this.uid);
  };

  HoverTrigger.prototype.on_dropdown_opened = function(data) {
    if (data !== this.uid) {
      return this.close();
    }
  };

  HoverTrigger.prototype.on_dropdown_closed = function(data) {};

  return HoverTrigger;

})();

}, {});
require.register('src/frontend/scripts/views/components/input_devices', function(require, module, exports){
var appcast, happens;

appcast = require('app/controllers/appcast');

happens = require('happens');

module.exports = function(dom) {
  happens(this);
  dom.on('change', function() {
    return appcast.set('input_device', dom.val());
  });
  return appcast.on('input_devices', function(devices) {
    var device, _i, _len, _results;
    dom.html(" ");
    _results = [];
    for (_i = 0, _len = devices.length; _i < _len; _i++) {
      device = devices[_i];
      _results.push(dom.append("<option value='" + device + "'>" + device + "</option>"));
    }
    return _results;
  });
};

}, {"app/controllers/appcast":"src/frontend/scripts/controllers/appcast","happens":"node_modules/happens/index"});
require.register('src/frontend/scripts/views/components/logout_link', function(require, module, exports){
var user_controller;

user_controller = require('app/controllers/user');

module.exports = function(dom) {
  return dom.on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    user_controller.logout(function(error) {
      if (error) {
        return console.error(error);
      }
    });
    return log("[LogoutLink] logout succedeed.");
  });
};

}, {"app/controllers/user":"src/frontend/scripts/controllers/user"});
require.register('src/frontend/scripts/views/components/modal', function(require, module, exports){
var Modal,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

module.exports = Modal = (function() {
  Modal.prototype.opened = false;

  function Modal(dom) {
    this.dom = dom;
    this.close = __bind(this.close, this);
    this.overlay = $('.md_overlay');
  }

  Modal.prototype.open = function() {
    if (this.opened) {
      return;
    }
    this.opened = true;
    this.dom.addClass('md_show');
    return this.overlay.off('click').on('click', this.close);
  };

  Modal.prototype.close = function() {
    if (!this.opened) {
      return;
    }
    this.opened = false;
    return this.dom.removeClass('md_show');
  };

  return Modal;

})();

}, {});
require.register('src/frontend/scripts/views/components/modal_handler', function(require, module, exports){
var ModalHandler,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

module.exports = ModalHandler = (function() {
  function ModalHandler(dom) {
    this.dom = dom;
    this.on_ready = __bind(this.on_ready, this);
    view.once('binded', this.on_ready);
  }

  ModalHandler.prototype.on_ready = function() {
    var modal_target;
    modal_target = view.get_by_dom(this.dom.data('modal'));
    return this.dom.on('click', function() {
      return modal_target.open();
    });
  };

  return ModalHandler;

})();

}, {});
require.register('src/frontend/scripts/views/components/player', function(require, module, exports){
var appcast;

appcast = require('app/controllers/appcast');

module.exports = function(dom) {
  var audio, check_stream, start_audio, stop_audio, stream, vu;
  audio = dom.find('audio');
  vu = dom.find('.vu');
  stream = audio.data('src');
  audio.hide();
  appcast.on('connected', function(status) {
    if (status) {
      return dom.find('.status').html('... waiting stream to start ...');
    } else {
      return dom.find('.status').html('... waiting AppCast to start ...');
    }
  });
  appcast.on("stream:error", function(error) {
    if (!error) {
      return;
    }
    return dom.find('.status').html("... " + error + " ...");
  });
  check_stream = function() {
    return $.get(stream, function(error, response) {
      if (error) {
        delay(100, check_stream);
        return console.error('- error loading streaming');
      }
      return console.warn('+ all good!');
    });
  };
  start_audio = function() {
    audio.attr('src', audio.data('src'));
    return audio.show();
  };
  stop_audio = function() {
    audio.stop();
    return audio.hide();
  };
  appcast.on('stream:online', function(status) {
    if (status) {
      return start_audio();
    } else {
      return stop_audio();
    }
  });
  return appcast.on('stream:vu', function(meter) {
    vu.find('.meter_left').width(meter[0] * 1000);
    return vu.find('.meter_right').width(meter[1] * 1000);
  });
};

}, {"app/controllers/appcast":"src/frontend/scripts/controllers/appcast"});
require.register('src/frontend/scripts/views/components/popup_handler', function(require, module, exports){
var PopupHandler,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

module.exports = PopupHandler = (function() {
  function PopupHandler(dom) {
    this.dom = dom;
    this.open = __bind(this.open, this);
    this.url = this.dom.data('url');
    this.title = this.dom.data('title');
    this.w = this.dom.data('w');
    this.h = this.dom.data('h');
    this.dom.on('click', this.open);
  }

  PopupHandler.prototype.open = function() {
    var left, params, top;
    left = (app.window.w / 2) - (this.w / 2);
    top = (app.window.h / 2) - (this.h / 2);
    params = 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + this.w + ', height=' + this.h + ', top=' + top + ', left=' + left;
    log("params", params);
    log("url", this.url);
    log("title", this.title);
    return window.open(this.url, this.title, params).focus();
  };

  return PopupHandler;

})();

}, {});
require.register('src/frontend/scripts/views/components/scroll_handler', function(require, module, exports){
var ScrollHandler;

module.exports = ScrollHandler = (function() {
  function ScrollHandler(dom) {
    var target;
    this.dom = dom;
    target = $(this.dom.data('target'));
    if (target.length <= 0) {
      return;
    }
    this.dom.addClass('scroll_handler');
    this.dom.on('click', function() {
      return mover.scroll_to(target);
    });
  }

  return ScrollHandler;

})();

}, {});
require.register('src/frontend/scripts/views/components/stream_controls', function(require, module, exports){
var user_controller;

user_controller = require('app/controllers/user');

module.exports = function(dom) {
  user_controller.on('user:logged', function(user) {
    console.log('user logged ->', user.username);
    if (("/" + user.username) === ways.pathname()) {
      return $('.controls').show();
    }
  });
  return user_controller.on('user:unlogged', function() {
    return $('.controls').hide();
  });
};

}, {"app/controllers/user":"src/frontend/scripts/controllers/user"});
require.register('src/frontend/scripts/views/explore', function(require, module, exports){
var Explore;

module.exports = Explore = (function() {
  function Explore(dom) {
    this.dom = dom;
  }

  return Explore;

})();

}, {});
require.register('src/frontend/scripts/views/header', function(require, module, exports){
var Header, navigation, user_controller,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

navigation = require('app/controllers/navigation');

user_controller = require('app/controllers/user');

module.exports = Header = (function() {
  Header.prototype.current_page = "";

  Header.prototype.user_logged = false;

  function Header(dom) {
    this.dom = dom;
    this.on_user_unlogged = __bind(this.on_user_unlogged, this);
    this.on_user_logged = __bind(this.on_user_logged, this);
    this.check_menu = __bind(this.check_menu, this);
    user_controller.on('user:logged', this.on_user_logged);
    user_controller.on('user:unlogged', this.on_user_unlogged);
    navigation.on('after_render', this.check_menu);
  }

  Header.prototype.check_menu = function() {
    var obj, page;
    obj = $('[data-menu]');
    if (obj.length > 0) {
      page = obj.data('menu');
      log("[Header] check_menu", page);
      if (this.current_page.length > 0) {
        this.dom.find("." + this.current_page + "_item").removeClass("selected");
        app.body.removeClass("" + this.current_page + "_page");
      }
      this.dom.find("." + page + "_item").addClass("selected");
      app.body.addClass("" + page + "_page");
      return this.current_page = page;
    }
  };

  Header.prototype.on_user_logged = function(data) {
    var html, tmpl, wrapper;
    if (this.user_logged) {
      return;
    }
    this.user_logged = true;
    wrapper = this.dom.find('.user_logged');
    tmpl = require('templates/shared/header_user_logged');
    html = tmpl(data);
    log("[Header] on_user_logged", data, html);
    log("wrapper", wrapper.length, wrapper);
    wrapper.empty().append(html);
    return view.bind(wrapper);
  };

  Header.prototype.on_user_unlogged = function(data) {
    if (!this.user_logged) {
      return;
    }
    this.user_logged = false;
    return log("[Header] on_user_unlogged", data);
  };

  return Header;

})();

}, {"app/controllers/navigation":"src/frontend/scripts/controllers/navigation","app/controllers/user":"src/frontend/scripts/controllers/user","templates/shared/header_user_logged":"src/frontend/templates/shared/header_user_logged"});
require.register('src/frontend/scripts/views/homepage', function(require, module, exports){
var Homepage, preload;

preload = require('app/utils/preload');

module.exports = Homepage = (function() {
  function Homepage(dom) {
    var elements, images;
    this.dom = dom;
    elements = [];
    images = [];
    this.dom.find('.parallax-container').each(function() {
      elements.push($(this));
      return images.push($(this).data('image-parallax'));
    });
    preload(images, function(images_loaded) {
      var el, i, _i, _len,
        _this = this;
      for (i = _i = 0, _len = elements.length; _i < _len; i = ++_i) {
        el = elements[i];
        el.parallax({
          imageSrc: images_loaded[i].src,
          bleed: 10,
          parallax: 'scroll',
          naturalWidth: images_loaded[i].width,
          naturalheight: images_loaded[i].height
        });
      }
      return delay(100, function() {
        return app.window.obj.trigger('resize');
      });
    });
  }

  Homepage.prototype.destroy = function() {
    var p;
    p = $('.parallax-mirror');
    p.addClass('hide');
    return delay(300, function() {
      return p.remove();
    });
  };

  return Homepage;

})();

}, {"app/utils/preload":"src/frontend/scripts/utils/preload"});
require.register('src/frontend/scripts/views/loading', function(require, module, exports){
var Loading, Opacity, navigation;

navigation = require('app/controllers/navigation');

Opacity = require('app/utils/opacity');

module.exports = Loading = (function() {
  Loading.prototype.first_time = true;

  function Loading(dom) {
    var _this = this;
    this.dom = dom;
    navigation.on('before_destroy', function() {
      app.body.addClass('loading').removeClass('loaded');
      return Opacity.show(_this.dom, 100);
    });
    navigation.on('after_render', function() {
      if (_this.first_time) {
        app.body.addClass('first_loaded');
        _this.first_time = false;
      }
      app.body.removeClass('loading').addClass('loaded');
      return Opacity.hide(_this.dom);
    });
  }

  return Loading;

})();

}, {"app/controllers/navigation":"src/frontend/scripts/controllers/navigation","app/utils/opacity":"src/frontend/scripts/utils/opacity"});
require.register('src/frontend/scripts/views/login', function(require, module, exports){
var Login, Navigation,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Navigation = require('app/controllers/navigation');

module.exports = Login = (function() {
  function Login(dom) {
    this.dom = dom;
    this._google_login = __bind(this._google_login, this);
    this._soundcloud_login = __bind(this._soundcloud_login, this);
    this._facebook_login = __bind(this._facebook_login, this);
    if (window.opener == null) {
      app.body.removeClass("login_page");
      Navigation.go('/');
    }
    this.username = this.dom.find('.username');
    this.password = this.dom.find('.password');
    this.dom.find('.facebook').on('click', this._facebook_login);
    this.dom.find('.soundcloud').on('click', this._soundcloud_login);
    this.dom.find('.google').on('click', this._google_login);
  }

  Login.prototype._facebook_login = function() {
    return log("[Login] _facebook_login");
  };

  Login.prototype._soundcloud_login = function() {
    return log("[Login] _soundcloud_login");
  };

  Login.prototype._google_login = function() {
    return log("[Login] _google_login");
  };

  return Login;

})();

}, {"app/controllers/navigation":"src/frontend/scripts/controllers/navigation"});
require.register('src/frontend/scripts/views/profile', function(require, module, exports){
var Profile;

module.exports = Profile = (function() {
  function Profile(dom) {
    var ref,
      _this = this;
    this.dom = dom;
    this.elements = {
      profile_picture: this.dom.find('.profile_image img'),
      cover_picture: this.dom.find('.cover_image'),
      location: this.dom.find('.location'),
      location_input: this.dom.find('.location_input'),
      bio: this.dom.find('.bio'),
      bio_input: this.dom.find('.bio_input'),
      links: [
        {
          type: "spotify",
          el: this.dom.find('.spotify_link')
        }, {
          type: "soundcloud",
          el: this.dom.find('.soundcloud_link')
        }, {
          type: "facebook",
          el: this.dom.find('.facebook_link')
        }
      ],
      links_input: [
        {
          type: "spotify",
          el: this.dom.find('.spotify_input')
        }, {
          type: "soundcloud",
          el: this.dom.find('.soundcloud_input')
        }, {
          type: "facebook",
          el: this.dom.find('.facebook_input')
        }
      ]
    };
    this.fake_user = {
      profile_picture: "/images/profile_big.png",
      cover_picture: "/images/homepage_2.jpg",
      location: "London - UK",
      bio: "Thomas Amundsen from Oslo, now based in London has from an early age lots of musical influences, experimenting from acoustic instruments to electronic music production and DJing.<br/><br/>He released his debut EP “I Feel” on Fusion recordings, sub-label of Dj Center Records, and has since released frequently on labels such as; Dobara, Susurrous Music, Incognitus Recordings, Koolwaters and gained support from the likes of Amine Edge, Stacey Pullen, Detlef, Slam, Marc Vedo, Loverdose, Ashley Wild, Jobe and many more",
      links: [
        {
          type: "spotify",
          url: "http://spotify.com"
        }, {
          type: "soundcloud",
          url: "http://soundcloud.com"
        }, {
          type: "facebook",
          url: "http://facebook.com"
        }
      ]
    };
    this.form_bio = this.dom.find('.profile_form');
    this.form_bio.on('submit', function(e) {
      return e.preventDefault();
    });
    this.form_bio.find('input').keyup(function(e) {
      if (e.keyCode === 13) {
        return _this.read_mode();
      }
    });
    this.update_dom_from_user();
    ref = this;
    this.dom.find('[data-profile]').on('click', function() {
      var value;
      value = $(this).data('profile');
      switch (value) {
        case 'set-write-mode':
          return ref.write_mode();
        case 'set-read-mode':
          return ref.read_mode();
      }
    });
  }

  Profile.prototype.write_mode = function() {
    log("[Profile] set write mode");
    return app.body.addClass('write_mode');
  };

  Profile.prototype.read_mode = function() {
    this.fetch_user_from_dom();
    this.update_dom_from_user();
    log("[Profile] set read mode");
    return app.body.removeClass('write_mode');
  };

  Profile.prototype.fetch_user_from_dom = function() {
    var i, l, _i, _len, _ref, _results;
    this.fake_user.location = this.elements.location_input.val();
    this.fake_user.bio = this.elements.bio_input.val();
    this.fake_user.links = [];
    _ref = this.elements.links_input;
    _results = [];
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      l = _ref[i];
      _results.push(this.fake_user.links.push({
        type: l.type,
        url: l.el.val()
      }));
    }
    return _results;
  };

  Profile.prototype.update_dom_from_user = function() {
    var d, e, i, link, _i, _len, _ref, _results;
    e = this.elements;
    d = this.fake_user;
    e.profile_picture.css('background-image', d.profile_picture);
    e.cover_picture.css('background-image', d.cover_picture);
    e.location.html(d.location);
    e.location_input.val(d.location);
    e.bio.html(d.bio);
    e.bio_input.val(this.html_to_textarea(d.bio));
    log("SAVING", d.links, e.links);
    _ref = d.links;
    _results = [];
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      link = _ref[i];
      log('link', link, 'i', i);
      e.links[i].el.attr('href', link.url);
      _results.push(e.links_input[i].el.val(link.url));
    }
    return _results;
  };

  Profile.prototype.html_to_textarea = function(str) {
    var re, to_find, to_replace;
    to_find = "<br/>";
    to_replace = "\n";
    re = new RegExp(to_find, 'g');
    return str.replace(re, to_replace);
  };

  return Profile;

})();

}, {});
require.register('src/frontend/scripts/views/room', function(require, module, exports){
var Room;

module.exports = Room = (function() {
  function Room(dom) {
    this.dom = dom;
  }

  return Room;

})();

}, {});
require.register('src/frontend/templates/shared/header_user_logged', function(require, module, exports){
module.exports = function anonymous(locals
/**/) {
jade.debug = [{ lineno: 1, filename: "/Users/stefanoortisi/Workspace/Sites/personal/loopcast/beta/src/frontend/templates/shared/header_user_logged.jade" }];
try {
var buf = [];
var locals_ = (locals || {}),avatar = locals_.avatar,username = locals_.username;jade.debug.unshift({ lineno: 1, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 1, filename: jade.debug[0].filename });
buf.push("<div data-view=\"components/click_trigger\" data-target=\".user_dropdown\" class=\"thumb_wrapper\">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 2, filename: jade.debug[0].filename });
buf.push("<img" + (jade.attrs({ 'width':("42"), 'src':("" + (avatar) + "") }, {"width":true,"src":true})) + "/>");
jade.debug.shift();
jade.debug.unshift({ lineno: 3, filename: jade.debug[0].filename });
buf.push("<span class=\"spritesheet small_arrow_white\">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.shift();
buf.push("</span>");
jade.debug.shift();
jade.debug.unshift({ lineno: 5, filename: jade.debug[0].filename });
buf.push("<ul class=\"user_dropdown hover_dropdown\">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 7, filename: jade.debug[0].filename });
buf.push("<li>");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 7, filename: jade.debug[0].filename });
buf.push("<a" + (jade.attrs({ 'href':("/" + (username) + ""), 'title':("My Profile") }, {"href":true,"title":true})) + ">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 7, filename: jade.debug[0].filename });
buf.push("My Profile");
jade.debug.shift();
jade.debug.shift();
buf.push("</a>");
jade.debug.shift();
jade.debug.shift();
buf.push("</li>");
jade.debug.shift();
jade.debug.unshift({ lineno: 9, filename: jade.debug[0].filename });
buf.push("<li>");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 9, filename: jade.debug[0].filename });
buf.push("<a href=\"#\" title=\"Feedback\">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 9, filename: jade.debug[0].filename });
buf.push("Feedback");
jade.debug.shift();
jade.debug.shift();
buf.push("</a>");
jade.debug.shift();
jade.debug.shift();
buf.push("</li>");
jade.debug.shift();
jade.debug.unshift({ lineno: 11, filename: jade.debug[0].filename });
buf.push("<li>");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 11, filename: jade.debug[0].filename });
buf.push("<a href=\"#\" title=\"Logout\" data-view=\"components/logout_link\" class=\"logout\">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 11, filename: jade.debug[0].filename });
buf.push("Logout");
jade.debug.shift();
jade.debug.shift();
buf.push("</a>");
jade.debug.shift();
jade.debug.shift();
buf.push("</li>");
jade.debug.shift();
jade.debug.shift();
buf.push("</ul>");
jade.debug.shift();
jade.debug.shift();
buf.push("</div>");
jade.debug.shift();
jade.debug.unshift({ lineno: 15, filename: jade.debug[0].filename });
buf.push("<a href=\"#\" title=\"Messages\">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 16, filename: jade.debug[0].filename });
buf.push("<span class=\"spritesheet messages_icon\">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.shift();
buf.push("</span>");
jade.debug.shift();
jade.debug.shift();
buf.push("</a>");
jade.debug.shift();
jade.debug.shift();;return buf.join("");
} catch (err) {
  jade.rethrow(err, jade.debug[0].filename, jade.debug[0].lineno,".thumb_wrapper(data-view=\"components/click_trigger\" data-target=\".user_dropdown\")\n\timg(width=\"42\", src=\"#{avatar}\")\n\tspan.spritesheet.small_arrow_white\n\n\tul.user_dropdown.hover_dropdown\n\t\tli\n\t\t\ta(href=\"/#{username}\" title=\"My Profile\") My Profile\n\t\tli\n\t\t\ta(href=\"#\" title=\"Feedback\") Feedback\n\t\tli\n\t\t\ta.logout(href=\"#\" title=\"Logout\", data-view=\"components/logout_link\") Logout\n\n\n\na(href=\"#\", title=\"Messages\")\n\tspan.spritesheet.messages_icon");
}
}
}, {});
require.register('src/frontend/vendors/LocalConnection', function(require, module, exports){
/**
 * LocalConnection
 *
 * LocalConnection allows callbacks to be triggered across browser tabs and
 * windows on the same domain
 */
window.LocalConnection= function LocalConnection(options) {

/**
 * Cookie name
 *
 * @var string
 */
  this.name = 'localconnection';

/**
 * Unique id for this transmitter
 *
 * @var integer
 */
  this.id = new Date().getTime();

/**
 * Whether or not localStorage is supported. Falls back to cookies if not.
 *
 * @var boolean
 */
  this.useLocalStorage = false;

/**
 * Log events to the console
 *
 * @var boolean
 */
  this.debug = false;

/**
 * List of actions set by addCallback
 *
 * @var array
 */
  this._actions= [];

/**
 * Initializes the transmitter
 *
 * @param opts Object
 */
  this.init = function(options) {
    // test for localStorage
    try {
      localStorage.setItem(this.id, this.id);
      localStorage.removeItem(this.id);
      this.useLocalStorage = true;
    } catch(e) {
      this.useLocalStorage = false;
    }
    for (var o in options) {
      this[o] = options[o];
    }
    this.clear();
  }

/**
 * Starts listening for events
 */
  this.listen = function() {
    if (this.useLocalStorage) {
      if (window.addEventListener) {
        window.addEventListener('storage', this.bind(this, this._check), false);
      } else {
        window.attachEvent('onstorage', this.bind(this, this._check));
      }
    } else {
      setInterval(this.bind(this, this._check), 100);
    }
  }

/**
 * Sends an event with arguments
 *
 * {{{
 * // on receiver
 * LocalConnection.addCallback('startVid', myfunction);
 * // on sender
 * LocalConnection.send('startVid', '#video');
 * }}}
 *
 * @param event string The event name as defined by the receiver
 * @param ...rest Other arguments as to be passed to the function
 */
  this.send = function(event) {
    var args = Array.prototype.slice.call(arguments, 1);
    return this._write(event, args);
  }

/**
 * Adds a callback to a receive event
 *
 * {{{
 * // on receiver
 * function myfunction(vidid) {
 *     $(vidid).play();
 * }
 * LocalConnection.addCallback('startVid', myfunction);
 * // on sender
 * LocalConnection.send('startVid', '#video');
 * }}}
 *
 * @param event string The name of the event
 * @param func function The callback
 */
  this.addCallback = function(event, func, scope) {
    if (scope == undefined) {
      scope = this;
    }
    if (this._actions[event] == undefined) {
      this._actions[event] = [];
    }
    this._actions[event].push({f: func, s: scope});
  }

/**
 * Removes a callback
 *
 * @param event string The event to stop polling for
 */
  this.removeCallback = function(event) {
    for (var e in this._actions) {
      if (e == event) {
        delete this._actions[e];
        break;
      }
    }
  }

/**
 * Checks for new data
 */
  this._check = function() {
    var data = this._read();
    if (data.length > 0) {
      for (var e in data) {
        this._receive(data[e].event, data[e].args);
      }
    }
  }

/**
 * Called when data is received
 *
 * @param event string The event name
 * @param args array Arguments to pass to the event
 */
  this._receive = function(event, args) {
    if (this._actions[event] != undefined) {
      for (var func in this._actions[event]) {
        if (this._actions[event].hasOwnProperty(func)) {
          this.log('Triggering callback "'+event+'"', this._actions[event]);
          var callback = this._actions[event][func];
          callback.f.apply(callback.s, args);
        }
      }
    }
  };

/**
 * Writes the cookie. Will append if there is already information
 *
 * @param event string Event name
 * @param args array Array of arguments
 */
  this._write = function(event, args) {
    var events = this._getEvents();
    var evt = {
      id: this.id,
      event: event,
      args: args
    };
    events.push(evt);
    this.log('Sending event', evt);
    if (this.useLocalStorage) {
      localStorage.setItem(this.name, JSON.stringify(events));
    } else {
      document.cookie = this.name + '=' + JSON.stringify(events) + "; path=/";
    }
    return true;
  }

/**
 * Reads the cookie
 *
 * Returns false if the cookie is empty (i.e., no new data). If new data is found,
 * it will return an array of events sent
 */
  this._read = function() {
    var events = this._getEvents();
    if (events == '') {
      return false;
    }
    var ret = [];
    // only return events from other connections
    for (var e in events) {
      if (events[e].id != this.id) {
        ret.push({
          event: events[e].event,
          args: events[e].args
        });
        events.splice(e, 1);
      }
    }
    if (this.useLocalStorage) {
      localStorage.setItem(this.name, JSON.stringify(events));
    } else {
      document.cookie = this.name + '=' + JSON.stringify(events) + "; path=/";
    }
    return ret;
  }

/**
 * Gets all queued events
 *
 * @return string
 */
  this._getEvents = function() {
    return this.useLocalStorage ? this._getLocalStorage() : this._getCookie();
  }

/**
 * Gets raw localStorage data
 *
 * @return string
 */
  this._getLocalStorage = function() {
    var events = localStorage.getItem(this.name);
    if (events == null) {
      return [];
    }
    return JSON.parse(events);
  }

/**
 * Gets raw cookie data
 *
 * @return string
 */
  this._getCookie = function() {
    var ca = document.cookie.split(';');
    var data;
    for (var i=0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1, c.length);
      }
      if (c.indexOf(this.name+'=') == 0) {
        data = c.substring(this.name.length+1, c.length);
        break;
      }
    }
    data = data || '[]';
    return JSON.parse(data);
  }

/**
 * Clears all events
 */
  this.clear = function() {
    if (this.useLocalStorage) {
      localStorage.removeItem(this.name);
    } else {
      document.cookie = this.name + "=; path=/";
    }
  }

/**
 * Binds a function to a scope
 *
 * @param scope Object The scope
 * @param fn Function The function
 * @return Function
 */
  this.bind = function(scope, fn) {
    return function () {
      fn.apply(scope, arguments);
    };
  }

/**
 * Logs to the console if it exists
 */
  this.log = function() {
    if (!this.debug) {
      return;
    }
    if (console) {
      console.log(Array.prototype.slice.call(arguments));
    }
  }

  this.init(options);

}
}, {});
require.register('src/frontend/vendors/modernizr.custom', function(require, module, exports){
/* Modernizr 2.8.3 (Custom Build) | MIT & BSD
 * Build: http://modernizr.com/download/#-backgroundsize-csstransforms-csstransforms3d-video-input-inputtypes-shiv-cssclasses-teststyles-testprop-testallprops-prefixes-domprefixes
 */
;window.Modernizr=function(a,b,c){function A(a){j.cssText=a}function B(a,b){return A(n.join(a+";")+(b||""))}function C(a,b){return typeof a===b}function D(a,b){return!!~(""+a).indexOf(b)}function E(a,b){for(var d in a){var e=a[d];if(!D(e,"-")&&j[e]!==c)return b=="pfx"?e:!0}return!1}function F(a,b,d){for(var e in a){var f=b[a[e]];if(f!==c)return d===!1?a[e]:C(f,"function")?f.bind(d||b):f}return!1}function G(a,b,c){var d=a.charAt(0).toUpperCase()+a.slice(1),e=(a+" "+p.join(d+" ")+d).split(" ");return C(b,"string")||C(b,"undefined")?E(e,b):(e=(a+" "+q.join(d+" ")+d).split(" "),F(e,b,c))}function H(){e.input=function(c){for(var d=0,e=c.length;d<e;d++)t[c[d]]=c[d]in k;return t.list&&(t.list=!!b.createElement("datalist")&&!!a.HTMLDataListElement),t}("autocomplete autofocus list placeholder max min multiple pattern required step".split(" ")),e.inputtypes=function(a){for(var d=0,e,f,h,i=a.length;d<i;d++)k.setAttribute("type",f=a[d]),e=k.type!=="text",e&&(k.value=l,k.style.cssText="position:absolute;visibility:hidden;",/^range$/.test(f)&&k.style.WebkitAppearance!==c?(g.appendChild(k),h=b.defaultView,e=h.getComputedStyle&&h.getComputedStyle(k,null).WebkitAppearance!=="textfield"&&k.offsetHeight!==0,g.removeChild(k)):/^(search|tel)$/.test(f)||(/^(url|email)$/.test(f)?e=k.checkValidity&&k.checkValidity()===!1:e=k.value!=l)),s[a[d]]=!!e;return s}("search tel url email datetime date month week time datetime-local number range color".split(" "))}var d="2.8.3",e={},f=!0,g=b.documentElement,h="modernizr",i=b.createElement(h),j=i.style,k=b.createElement("input"),l=":)",m={}.toString,n=" -webkit- -moz- -o- -ms- ".split(" "),o="Webkit Moz O ms",p=o.split(" "),q=o.toLowerCase().split(" "),r={},s={},t={},u=[],v=u.slice,w,x=function(a,c,d,e){var f,i,j,k,l=b.createElement("div"),m=b.body,n=m||b.createElement("body");if(parseInt(d,10))while(d--)j=b.createElement("div"),j.id=e?e[d]:h+(d+1),l.appendChild(j);return f=["&#173;",'<style id="s',h,'">',a,"</style>"].join(""),l.id=h,(m?l:n).innerHTML+=f,n.appendChild(l),m||(n.style.background="",n.style.overflow="hidden",k=g.style.overflow,g.style.overflow="hidden",g.appendChild(n)),i=c(l,a),m?l.parentNode.removeChild(l):(n.parentNode.removeChild(n),g.style.overflow=k),!!i},y={}.hasOwnProperty,z;!C(y,"undefined")&&!C(y.call,"undefined")?z=function(a,b){return y.call(a,b)}:z=function(a,b){return b in a&&C(a.constructor.prototype[b],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(b){var c=this;if(typeof c!="function")throw new TypeError;var d=v.call(arguments,1),e=function(){if(this instanceof e){var a=function(){};a.prototype=c.prototype;var f=new a,g=c.apply(f,d.concat(v.call(arguments)));return Object(g)===g?g:f}return c.apply(b,d.concat(v.call(arguments)))};return e}),r.backgroundsize=function(){return G("backgroundSize")},r.csstransforms=function(){return!!G("transform")},r.csstransforms3d=function(){var a=!!G("perspective");return a&&"webkitPerspective"in g.style&&x("@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}",function(b,c){a=b.offsetLeft===9&&b.offsetHeight===3}),a},r.video=function(){var a=b.createElement("video"),c=!1;try{if(c=!!a.canPlayType)c=new Boolean(c),c.ogg=a.canPlayType('video/ogg; codecs="theora"').replace(/^no$/,""),c.h264=a.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/,""),c.webm=a.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/,"")}catch(d){}return c};for(var I in r)z(r,I)&&(w=I.toLowerCase(),e[w]=r[I](),u.push((e[w]?"":"no-")+w));return e.input||H(),e.addTest=function(a,b){if(typeof a=="object")for(var d in a)z(a,d)&&e.addTest(d,a[d]);else{a=a.toLowerCase();if(e[a]!==c)return e;b=typeof b=="function"?b():b,typeof f!="undefined"&&f&&(g.className+=" "+(b?"":"no-")+a),e[a]=b}return e},A(""),i=k=null,function(a,b){function l(a,b){var c=a.createElement("p"),d=a.getElementsByTagName("head")[0]||a.documentElement;return c.innerHTML="x<style>"+b+"</style>",d.insertBefore(c.lastChild,d.firstChild)}function m(){var a=s.elements;return typeof a=="string"?a.split(" "):a}function n(a){var b=j[a[h]];return b||(b={},i++,a[h]=i,j[i]=b),b}function o(a,c,d){c||(c=b);if(k)return c.createElement(a);d||(d=n(c));var g;return d.cache[a]?g=d.cache[a].cloneNode():f.test(a)?g=(d.cache[a]=d.createElem(a)).cloneNode():g=d.createElem(a),g.canHaveChildren&&!e.test(a)&&!g.tagUrn?d.frag.appendChild(g):g}function p(a,c){a||(a=b);if(k)return a.createDocumentFragment();c=c||n(a);var d=c.frag.cloneNode(),e=0,f=m(),g=f.length;for(;e<g;e++)d.createElement(f[e]);return d}function q(a,b){b.cache||(b.cache={},b.createElem=a.createElement,b.createFrag=a.createDocumentFragment,b.frag=b.createFrag()),a.createElement=function(c){return s.shivMethods?o(c,a,b):b.createElem(c)},a.createDocumentFragment=Function("h,f","return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&("+m().join().replace(/[\w\-]+/g,function(a){return b.createElem(a),b.frag.createElement(a),'c("'+a+'")'})+");return n}")(s,b.frag)}function r(a){a||(a=b);var c=n(a);return s.shivCSS&&!g&&!c.hasCSS&&(c.hasCSS=!!l(a,"article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}mark{background:#FF0;color:#000}template{display:none}")),k||q(a,c),a}var c="3.7.0",d=a.html5||{},e=/^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,f=/^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,g,h="_html5shiv",i=0,j={},k;(function(){try{var a=b.createElement("a");a.innerHTML="<xyz></xyz>",g="hidden"in a,k=a.childNodes.length==1||function(){b.createElement("a");var a=b.createDocumentFragment();return typeof a.cloneNode=="undefined"||typeof a.createDocumentFragment=="undefined"||typeof a.createElement=="undefined"}()}catch(c){g=!0,k=!0}})();var s={elements:d.elements||"abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output progress section summary template time video",version:c,shivCSS:d.shivCSS!==!1,supportsUnknownElements:k,shivMethods:d.shivMethods!==!1,type:"default",shivDocument:r,createElement:o,createDocumentFragment:p};a.html5=s,r(b)}(this,b),e._version=d,e._prefixes=n,e._domPrefixes=q,e._cssomPrefixes=p,e.testProp=function(a){return E([a])},e.testAllProps=G,e.testStyles=x,g.className=g.className.replace(/(^|\s)no-js(\s|$)/,"$1$2")+(f?" js "+u.join(" "):""),e}(this,this.document);
}, {});
require.register('src/frontend/vendors/parallax.min', function(require, module, exports){
/*!
 * parallax.js v1.3 (http://pixelcog.github.io/parallax.js/)
 * @copyright 2015 PixelCog, Inc.
 * @license MIT (https://github.com/pixelcog/parallax.js/blob/master/LICENSE)
 */
!function(t,i,e,s){function o(i,e){var h=this;"object"==typeof e&&(delete e.refresh,delete e.render,t.extend(this,e)),this.$element=t(i),!this.imageSrc&&this.$element.is("img")&&(this.imageSrc=this.$element.attr("src"));var n=(this.position+"").toLowerCase().match(/\S+/g)||[];return n.length<1&&n.push("center"),1==n.length&&n.push(n[0]),"top"==n[0]||"bottom"==n[0]||"left"==n[1]||"right"==n[1]?(h.positionX=n[1],h.positionY=n[0]):(h.positionX=n[0],h.positionY=n[1]),this.positionX!=s&&(n[0]=this.positionX.toLowerCase()),this.positionY!=s&&(n[1]=this.positionY.toLowerCase()),"left"!=this.positionX&&"right"!=this.positionX&&(this.positionX=isNaN(parseInt(this.positionX))?"center":parseInt(this.positionX)),"top"!=this.positionY&&"bottom"!=this.positionY&&(this.positionY=isNaN(parseInt(this.positionY))?"center":parseInt(this.positionY)),this.position=this.positionX+(isNaN(this.positionX)?"":"px")+" "+this.positionY+(isNaN(this.positionY)?"":"px"),navigator.userAgent.match(/(iPod|iPhone|iPad)/)?(this.iosFix&&!this.$element.is("img")&&this.$element.css({backgroundImage:"url("+this.imageSrc+")",backgroundSize:"cover",backgroundPosition:this.position}),this):navigator.userAgent.match(/(Android)/)?(this.androidFix&&!this.$element.is("img")&&this.$element.css({backgroundImage:"url("+this.imageSrc+")",backgroundSize:"cover",backgroundPosition:this.position}),this):(this.$mirror=t("<div />").prependTo("body"),this.$slider=t("<img />").prependTo(this.$mirror),this.$mirror.addClass("parallax-mirror").css({visibility:"hidden",zIndex:this.zIndex,position:"fixed",top:0,left:0,overflow:"hidden"}),this.$slider.addClass("parallax-slider").one("load",function(){h.naturalHeight&&h.naturalWidth||(h.naturalHeight=this.naturalHeight||this.height||1,h.naturalWidth=this.naturalWidth||this.width||1),h.aspectRatio=h.naturalWidth/h.naturalHeight,o.isSetup||o.setup(),o.sliders.push(h),o.isFresh=!1,o.requestRender()}),this.$slider[0].src=this.imageSrc,void((this.naturalHeight&&this.naturalWidth||this.$slider[0].complete)&&this.$slider.trigger("load")))}function h(s){return this.each(function(){var h=t(this),n="object"==typeof s&&s;this==i||this==e||h.is("body")?o.configure(n):h.data("px.parallax")||(n=t.extend({},h.data(),n),h.data("px.parallax",new o(this,n))),"string"==typeof s&&o[s]()})}!function(){for(var t=0,e=["ms","moz","webkit","o"],s=0;s<e.length&&!i.requestAnimationFrame;++s)i.requestAnimationFrame=i[e[s]+"RequestAnimationFrame"],i.cancelAnimationFrame=i[e[s]+"CancelAnimationFrame"]||i[e[s]+"CancelRequestAnimationFrame"];i.requestAnimationFrame||(i.requestAnimationFrame=function(e){var s=(new Date).getTime(),o=Math.max(0,16-(s-t)),h=i.setTimeout(function(){e(s+o)},o);return t=s+o,h}),i.cancelAnimationFrame||(i.cancelAnimationFrame=function(t){clearTimeout(t)})}(),t.extend(o.prototype,{speed:.2,bleed:0,zIndex:-100,iosFix:!0,androidFix:!0,position:"center",refresh:function(){this.boxWidth=this.$element.outerWidth(),this.boxHeight=this.$element.outerHeight()+2*this.bleed,this.boxOffsetTop=this.$element.offset().top-this.bleed,this.boxOffsetLeft=this.$element.offset().left,this.boxOffsetBottom=this.boxOffsetTop+this.boxHeight;var t=o.winHeight,i=o.docHeight,e=Math.min(this.boxOffsetTop,i-t),s=Math.max(this.boxOffsetTop+this.boxHeight-t,0),h=this.boxHeight+(e-s)*(1-this.speed)|0,n=(this.boxOffsetTop-e)*(1-this.speed)|0;if(h*this.aspectRatio>=this.boxWidth){this.imageWidth=h*this.aspectRatio|0,this.imageHeight=h,this.offsetBaseTop=n;var r=this.imageWidth-this.boxWidth;this.offsetLeft="left"==this.positionX?0:"right"==this.positionX?-r:isNaN(this.positionX)?-r/2|0:Math.max(this.positionX,-r)}else{this.imageWidth=this.boxWidth,this.imageHeight=this.boxWidth/this.aspectRatio|0,this.offsetLeft=0;var r=this.imageHeight-h;this.offsetBaseTop="top"==this.positionY?n:"bottom"==this.positionY?n-r:isNaN(this.positionY)?n-r/2|0:n+Math.max(this.positionY,-r)}},render:function(){var t=o.scrollTop,i=o.scrollLeft,e=t+o.winHeight;this.visibility=this.boxOffsetBottom>t&&this.boxOffsetTop<e?"visible":"hidden",this.mirrorTop=this.boxOffsetTop-t,this.mirrorLeft=this.boxOffsetLeft-i,this.offsetTop=this.offsetBaseTop-this.mirrorTop*(1-this.speed),this.$mirror.css({transform:"translate3d(0px, 0px, 0px)",visibility:this.visibility,top:this.mirrorTop,left:this.mirrorLeft,height:this.boxHeight,width:this.boxWidth}),this.$slider.css({transform:"translate3d(0px, 0px, 0px)",position:"absolute",top:this.offsetTop,left:this.offsetLeft,height:this.imageHeight,width:this.imageWidth})}}),t.extend(o,{scrollTop:0,scrollLeft:0,winHeight:0,winWidth:0,docHeight:1<<30,docWidth:1<<30,sliders:[],isReady:!1,isFresh:!1,isBusy:!1,setup:function(){if(!this.isReady){var s=t(e),h=t(i);h.on("scroll.px.parallax load.px.parallax",function(){var t=o.docHeight-o.winHeight,i=o.docWidth-o.winWidth;o.scrollTop=Math.max(0,Math.min(t,h.scrollTop())),o.scrollLeft=Math.max(0,Math.min(i,h.scrollLeft())),o.requestRender()}).on("resize.px.parallax load.px.parallax",function(){o.winHeight=h.height(),o.winWidth=h.width(),o.docHeight=s.height(),o.docWidth=s.width(),o.isFresh=!1,o.requestRender()}),this.isReady=!0}},configure:function(i){"object"==typeof i&&(delete i.refresh,delete i.render,t.extend(this.prototype,i))},refresh:function(){t.each(this.sliders,function(){this.refresh()}),this.isFresh=!0},render:function(){this.isFresh||this.refresh(),t.each(this.sliders,function(){this.render()})},requestRender:function(){var t=this;this.isBusy||(this.isBusy=!0,i.requestAnimationFrame(function(){t.render(),t.isBusy=!1}))}});var n=t.fn.parallax;t.fn.parallax=h,t.fn.parallax.Constructor=o,t.fn.parallax.noConflict=function(){return t.fn.parallax=n,this},t(e).on("ready.px.parallax.data-api",function(){t('[data-parallax="scroll"]').parallax()})}(jQuery,window,document);
}, {});
require.register('src/frontend/vendors/reconnecting-websocket', function(require, module, exports){
// MIT License:
//
// Copyright (c) 2010-2012, Joe Walnes
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/**
 * This behaves like a WebSocket in every way, except if it fails to connect,
 * or it gets disconnected, it will repeatedly poll until it successfully connects
 * again.
 *
 * It is API compatible, so when you have:
 *   ws = new WebSocket('ws://....');
 * you can replace with:
 *   ws = new ReconnectingWebSocket('ws://....');
 *
 * The event stream will typically look like:
 *  onconnecting
 *  onopen
 *  onmessage
 *  onmessage
 *  onclose // lost connection
 *  onconnecting
 *  onopen  // sometime later...
 *  onmessage
 *  onmessage
 *  etc...
 *
 * It is API compatible with the standard WebSocket API, apart from the following members:
 *
 * - `bufferedAmount`
 * - `extensions`
 * - `binaryType`
 *
 * Latest version: https://github.com/joewalnes/reconnecting-websocket/
 * - Joe Walnes
 *
 * Syntax
 * ======
 * var socket = new ReconnectingWebSocket(url, protocols, options);
 *
 * Parameters
 * ==========
 * url - The url you are connecting to.
 * protocols - Optional string or array of protocols.
 * options - See below
 *
 * Options
 * =======
 * Options can either be passed upon instantiation or set after instantiation:
 *
 * var socket = new ReconnectingWebSocket(url, null, { debug: true, reconnectInterval: 4000 });
 *
 * or
 *
 * var socket = new ReconnectingWebSocket(url);
 * socket.debug = true;
 * socket.reconnectInterval = 4000;
 *
 * debug
 * - Whether this instance should log debug messages. Accepts true or false. Default: false.
 *
 * automaticOpen
 * - Whether or not the websocket should attempt to connect immediately upon instantiation. The socket can be manually opened or closed at any time using ws.open() and ws.close().
 *
 * reconnectInterval
 * - The number of milliseconds to delay before attempting to reconnect. Accepts integer. Default: 1000.
 *
 * maxReconnectInterval
 * - The maximum number of milliseconds to delay a reconnection attempt. Accepts integer. Default: 30000.
 *
 * reconnectDecay
 * - The rate of increase of the reconnect delay. Allows reconnect attempts to back off when problems persist. Accepts integer or float. Default: 1.5.
 *
 * timeoutInterval
 * - The maximum time in milliseconds to wait for a connection to succeed before closing and retrying. Accepts integer. Default: 2000.
 *
 */
(function (global, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module !== 'undefined' && module.exports){
        module.exports = factory();
    } else {
        global.ReconnectingWebSocket = factory();
    }
})(this, function () {

    function ReconnectingWebSocket(url, protocols, options) {

        // Default settings
        var settings = {

            /** Whether this instance should log debug messages. */
            debug: false,

            /** Whether or not the websocket should attempt to connect immediately upon instantiation. */
            automaticOpen: true,

            /** The number of milliseconds to delay before attempting to reconnect. */
            reconnectInterval: 1000,
            /** The maximum number of milliseconds to delay a reconnection attempt. */
            maxReconnectInterval: 30000,
            /** The rate of increase of the reconnect delay. Allows reconnect attempts to back off when problems persist. */
            reconnectDecay: 1.5,

            /** The maximum time in milliseconds to wait for a connection to succeed before closing and retrying. */
            timeoutInterval: 2000
        }
        if (!options) { options = {}; }

        // Overwrite and define settings with options if they exist.
        for (var key in settings) {
            if (typeof options[key] !== 'undefined') {
                this[key] = options[key];
            } else {
                this[key] = settings[key];
            }
        }

        // These should be treated as read-only properties

        /** The URL as resolved by the constructor. This is always an absolute URL. Read only. */
        this.url = url;

        /** The number of attempted reconnects since starting, or the last successful connection. Read only. */
        this.reconnectAttempts = 0;

        /**
         * The current state of the connection.
         * Can be one of: WebSocket.CONNECTING, WebSocket.OPEN, WebSocket.CLOSING, WebSocket.CLOSED
         * Read only.
         */
        this.readyState = WebSocket.CONNECTING;

        /**
         * A string indicating the name of the sub-protocol the server selected; this will be one of
         * the strings specified in the protocols parameter when creating the WebSocket object.
         * Read only.
         */
        this.protocol = null;

        // Private state variables

        var self = this;
        var ws;
        var forcedClose = false;
        var timedOut = false;
        var eventTarget = document.createElement('div');

        // Wire up "on*" properties as event handlers

        eventTarget.addEventListener('open',       function(event) { self.onopen(event); });
        eventTarget.addEventListener('close',      function(event) { self.onclose(event); });
        eventTarget.addEventListener('connecting', function(event) { self.onconnecting(event); });
        eventTarget.addEventListener('message',    function(event) { self.onmessage(event); });
        eventTarget.addEventListener('error',      function(event) { self.onerror(event); });

        // Expose the API required by EventTarget

        this.addEventListener = eventTarget.addEventListener.bind(eventTarget);
        this.removeEventListener = eventTarget.removeEventListener.bind(eventTarget);
        this.dispatchEvent = eventTarget.dispatchEvent.bind(eventTarget);

        /**
         * This function generates an event that is compatible with standard
         * compliant browsers and IE9 - IE11
         *
         * This will prevent the error:
         * Object doesn't support this action
         *
         * http://stackoverflow.com/questions/19345392/why-arent-my-parameters-getting-passed-through-to-a-dispatched-event/19345563#19345563
         * @param s String The name that the event should use
         * @param args Object an optional object that the event will use
         */
        function generateEvent(s, args) {
          var evt = document.createEvent("CustomEvent");
          evt.initCustomEvent(s, false, false, args);
          return evt;
        };

        this.open = function (reconnectAttempt) {
            ws = new WebSocket(self.url, protocols || []);

            if (!reconnectAttempt) {
                eventTarget.dispatchEvent(generateEvent('connecting'));
            }

            if (self.debug || ReconnectingWebSocket.debugAll) {
                console.debug('ReconnectingWebSocket', 'attempt-connect', self.url);
            }

            var localWs = ws;
            var timeout = setTimeout(function() {
                if (self.debug || ReconnectingWebSocket.debugAll) {
                    console.debug('ReconnectingWebSocket', 'connection-timeout', self.url);
                }
                timedOut = true;
                localWs.close();
                timedOut = false;
            }, self.timeoutInterval);

            ws.onopen = function(event) {
                clearTimeout(timeout);
                if (self.debug || ReconnectingWebSocket.debugAll) {
                    console.debug('ReconnectingWebSocket', 'onopen', self.url);
                }
                self.protocol = ws.protocol;
                self.readyState = WebSocket.OPEN;
                self.reconnectAttempts = 0;
                var e = generateEvent('open');
                e.isReconnect = reconnectAttempt;
                reconnectAttempt = false;
                eventTarget.dispatchEvent(e);
            };

            ws.onclose = function(event) {
                clearTimeout(timeout);
                ws = null;
                if (forcedClose) {
                    self.readyState = WebSocket.CLOSED;
                    eventTarget.dispatchEvent(generateEvent('close'));
                } else {
                    self.readyState = WebSocket.CONNECTING;
                    var e = generateEvent('connecting');
                    e.code = event.code;
                    e.reason = event.reason;
                    e.wasClean = event.wasClean;
                    eventTarget.dispatchEvent(e);
                    if (!reconnectAttempt && !timedOut) {
                        if (self.debug || ReconnectingWebSocket.debugAll) {
                            console.debug('ReconnectingWebSocket', 'onclose', self.url);
                        }
                        eventTarget.dispatchEvent(generateEvent('close'));
                    }

                    var timeout = self.reconnectInterval * Math.pow(self.reconnectDecay, self.reconnectAttempts);
                    setTimeout(function() {
                        self.reconnectAttempts++;
                        self.open(true);
                    }, timeout > self.maxReconnectInterval ? self.maxReconnectInterval : timeout);
                }
            };
            ws.onmessage = function(event) {
                if (self.debug || ReconnectingWebSocket.debugAll) {
                    console.debug('ReconnectingWebSocket', 'onmessage', self.url, event.data);
                }
                var e = generateEvent('message');
                e.data = event.data;
                eventTarget.dispatchEvent(e);
            };
            ws.onerror = function(event) {
                if (self.debug || ReconnectingWebSocket.debugAll) {
                    console.debug('ReconnectingWebSocket', 'onerror', self.url, event);
                }
                eventTarget.dispatchEvent(generateEvent('error'));
            };
        }

        // Whether or not to create a websocket upon instantiation
        if (this.automaticOpen == true) {
            this.open(false);
        }

        /**
         * Transmits data to the server over the WebSocket connection.
         *
         * @param data a text string, ArrayBuffer or Blob to send to the server.
         */
        this.send = function(data) {
            if (ws) {
                if (self.debug || ReconnectingWebSocket.debugAll) {
                    console.debug('ReconnectingWebSocket', 'send', self.url, data);
                }
                return ws.send(data);
            } else {
                throw 'INVALID_STATE_ERR : Pausing to reconnect websocket';
            }
        };

        /**
         * Closes the WebSocket connection or connection attempt, if any.
         * If the connection is already CLOSED, this method does nothing.
         */
        this.close = function(code, reason) {
            // Default CLOSE_NORMAL code
            if (typeof code == 'undefined') {
                code = 1000;
            }
            forcedClose = true;
            if (ws) {
                ws.close(code, reason);
            }
        };

        /**
         * Additional public API method to refresh the connection if still open (close, re-open).
         * For example, if the app suspects bad data / missed heart beats, it can try to refresh.
         */
        this.refresh = function() {
            if (ws) {
                ws.close();
            }
        };
    }

    /**
     * An event listener to be called when the WebSocket connection's readyState changes to OPEN;
     * this indicates that the connection is ready to send and receive data.
     */
    ReconnectingWebSocket.prototype.onopen = function(event) {};
    /** An event listener to be called when the WebSocket connection's readyState changes to CLOSED. */
    ReconnectingWebSocket.prototype.onclose = function(event) {};
    /** An event listener to be called when a connection begins being attempted. */
    ReconnectingWebSocket.prototype.onconnecting = function(event) {};
    /** An event listener to be called when a message is received from the server. */
    ReconnectingWebSocket.prototype.onmessage = function(event) {};
    /** An event listener to be called when an error occurs. */
    ReconnectingWebSocket.prototype.onerror = function(event) {};

    /**
     * Whether all instances of ReconnectingWebSocket should log debug messages.
     * Setting this to true is the equivalent of setting all instances of ReconnectingWebSocket.debug to true.
     */
    ReconnectingWebSocket.debugAll = false;

    ReconnectingWebSocket.CONNECTING = WebSocket.CONNECTING;
    ReconnectingWebSocket.OPEN = WebSocket.OPEN;
    ReconnectingWebSocket.CLOSING = WebSocket.CLOSING;
    ReconnectingWebSocket.CLOSED = WebSocket.CLOSED;

    return ReconnectingWebSocket;
});
}, {});
// POLVO :: INITIALIZER
require('src/frontend/scripts/app');
/*
//@ sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic2VjdGlvbnMiOlt7Im9mZnNldCI6eyJsaW5lIjo1MDY4LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvYXBwLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJyZXF1aXJlICcuL2dsb2JhbHMnXG5yZXF1aXJlICcuL3ZlbmRvcnMnXG5yZXF1aXJlICcuLi92ZW5kb3JzL3BhcmFsbGF4Lm1pbi5qcydcblxudmlld3MgICAgICAgICAgID0gcmVxdWlyZSAnLi9jb250cm9sbGVycy92aWV3cydcbm5hdmlnYXRpb24gICAgICA9IHJlcXVpcmUgJy4vY29udHJvbGxlcnMvbmF2aWdhdGlvbidcbnVzZXJfY29udHJvbGxlciA9IHJlcXVpcmUgJy4vY29udHJvbGxlcnMvdXNlcidcbiMgbW90aW9uICAgPSByZXF1aXJlICdhcHAvY29udHJvbGxlcnMvbW90aW9uJ1xuXG5jbGFzcyBBcHBcblxuXHQjIGxpbmsgdG8gd2luZG93XG5cdHdpbmRvdzogbnVsbFxuXG5cdCMgbGluayB0byB1dGlscy9zZXR0aW5nc1xuXHRzZXR0aW5nczogbnVsbFxuXG5cdCMgbGluayB0byBjb250cm9sbGVyL2xvY2FsX2Nvbm5lY3Rpb25cblx0bG9jYWw6IG51bGxcblxuXHRjb25zdHJ1Y3RvcjogLT4gXHRcblxuXHRcdGhhcHBlbnMgQFxuXG5cdFx0IyBhcmUgd2UgdXNpbmcgdGhpcz9cblx0XHRAb24gJ3JlYWR5JywgQGFmdGVyX3JlbmRlclxuXG5cdHN0YXJ0OiAtPlxuXHRcdFxuXHRcdEBsb2NhbCAgPSByZXF1aXJlICdhcHAvY29udHJvbGxlcnMvbG9jYWxfY29ubmVjdGlvbidcblx0XHRAd2luZG93ID0gcmVxdWlyZSAnYXBwL2NvbnRyb2xsZXJzL3dpbmRvdydcblxuXHRcdEBib2R5ICAgPSAkICdib2R5J1xuXG5cdFx0XG5cdFx0QHNldHRpbmdzID0gcmVxdWlyZSAnYXBwL3V0aWxzL3NldHRpbmdzJ1xuXHRcdEBzZXR0aW5ncy5iaW5kIEBib2R5XG5cblx0XHQjIENvbnRyb2xsZXJzIGJpbmRpbmdcblx0XHRkbyB2aWV3cy5iaW5kXG5cdFx0ZG8gbmF2aWdhdGlvbi5iaW5kXG5cblx0XHQjIHdoZW4gdGhlIG5ldyBhcmUgaXMgcmVuZGVyZWQsIGRvIHRoZSBzYW1lIHdpdGggdGhlIG5ldyBjb250ZW50XG5cblx0XHRuYXZpZ2F0aW9uLm9uICdiZWZvcmVfZGVzdHJveScsID0+XG5cdFx0XHRsb2cgXCItLS0tLS0tLS0gQkVGT1JFIERFU1RST1lcIlxuXHRcdFx0dmlld3MudW5iaW5kICcjY29udGVudCdcblxuXHRcdG5hdmlnYXRpb24ub24gJ2FmdGVyX3JlbmRlcicsID0+IFxuXHRcdFx0dmlld3MuYmluZCAgICAgICAnI2NvbnRlbnQnXG5cdFx0XHRuYXZpZ2F0aW9uLmJpbmQgJyNjb250ZW50J1xuXHRcdFx0ZG8gdXNlcl9jb250cm9sbGVyLmNoZWNrX3VzZXJcblxuXHRcdFx0XG5cdFxuXHQjIFVzZXIgUHJveGllc1xuXHRsb2dpbiA6ICggdXNlciApIC0+IFxuXHRcdGxvZyBcIi0tLS0tLS0tPiBsb2dpbiBjYWxsZWQgZnJvbSBvdXRzaWRlXCJcblx0XHRuYXZpZ2F0aW9uLmdvIFwiLyN7dXNlci51c2VybmFtZX1cIlxuXHRcdHVzZXJfY29udHJvbGxlci5sb2dpbiB1c2VyXG5cblx0bG9nb3V0OiAtPiBcblx0XHRsb2cgXCJbbG9nZ2VkIG91dF1cIiwgdXNlclxuXHRcdFxuXHRcdHVzZXJfY29udHJvbGxlci5sb2dvdXQoKVxuXG5cblx0IyMjXG5cdCMgQWZ0ZXIgdGhlIHZpZXdzIGhhdmUgYmVlbiByZW5kZXJlZFxuXHQjIyNcblx0YWZ0ZXJfcmVuZGVyOiAoICkgPT5cblx0XHRsb2cgXCJhZnRlcl9yZW5kZXJcIlxuXHRcdCMgSGlkZSB0aGUgbG9hZGluZ1xuXHRcdGRlbGF5IDEwLCA9PiBAYm9keS5hZGRDbGFzcyBcImxvYWRlZFwiXG5cblx0XHRcbmFwcCA9IG5ldyBBcHBcblxuJCAtPiBhcHAuc3RhcnQoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHdpbmRvdy5hcHAgPSBhcHAiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSx3Q0FBQTtHQUFBLCtFQUFBOztBQUFBLENBQUEsTUFBQSxJQUFBOztBQUNBLENBREEsTUFDQSxJQUFBOztBQUNBLENBRkEsTUFFQSxxQkFBQTs7QUFFQSxDQUpBLEVBSWtCLEVBQWxCLEVBQWtCLGNBQUE7O0FBQ2xCLENBTEEsRUFLa0IsSUFBQSxHQUFsQixnQkFBa0I7O0FBQ2xCLENBTkEsRUFNa0IsSUFBQSxRQUFsQixLQUFrQjs7QUFHWixDQVROO0NBWUMsRUFBUSxDQUFSLEVBQUE7O0NBQUEsRUFHVSxDQUhWLElBR0E7O0NBSEEsRUFNTyxDQU5QLENBTUE7O0NBRWEsQ0FBQSxDQUFBLFVBQUE7Q0FFWixrREFBQTtDQUFBLEdBQUEsR0FBQTtDQUFBLENBR0EsRUFBQSxHQUFBLEtBQUE7Q0FiRCxFQVFhOztDQVJiLEVBZU8sRUFBUCxJQUFPO0NBRU4sT0FBQSxJQUFBO0NBQUEsRUFBVSxDQUFWLENBQUEsRUFBVSwyQkFBQTtDQUFWLEVBQ1UsQ0FBVixFQUFBLENBQVUsaUJBQUE7Q0FEVixFQUdVLENBQVYsRUFBVTtDQUhWLEVBTVksQ0FBWixHQUFZLENBQVosWUFBWTtDQU5aLEdBT0EsSUFBUztDQVBULEdBVUcsQ0FBSztDQVZSLEdBV0csTUFBVTtDQVhiLENBZUEsQ0FBZ0MsQ0FBaEMsS0FBZ0MsQ0FBdEIsTUFBVjtDQUNDLEVBQUEsR0FBQSxvQkFBQTtDQUNNLElBQUQsQ0FBTCxJQUFBLEdBQUE7Q0FGRCxJQUFnQztDQUlyQixDQUFYLENBQThCLE1BQUEsQ0FBcEIsQ0FBVixHQUFBO0NBQ0MsR0FBQSxDQUFLLENBQUwsSUFBQTtDQUFBLEdBQ0EsRUFBQSxJQUFVO0NBQ1MsU0FBbkIsR0FBRyxFQUFlO0NBSG5CLElBQThCO0NBcEMvQixFQWVPOztDQWZQLEVBNENRLENBQUEsQ0FBUixJQUFVO0NBQ1QsRUFBQSxDQUFBLGlDQUFBO0NBQUEsQ0FDQSxDQUFlLENBQWYsSUFBQSxFQUFVO0NBQ00sR0FBaEIsQ0FBQSxNQUFBLElBQWU7Q0EvQ2hCLEVBNENROztDQTVDUixFQWlEUSxHQUFSLEdBQVE7Q0FDUCxDQUFvQixDQUFwQixDQUFBLFVBQUE7Q0FFZ0IsS0FBaEIsS0FBQSxJQUFlO0NBcERoQixFQWlEUTs7Q0FNUjs7O0NBdkRBOztDQUFBLEVBMERjLE1BQUEsR0FBZDtDQUNDLE9BQUEsSUFBQTtDQUFBLEVBQUEsQ0FBQSxVQUFBO0NBRU0sQ0FBTixDQUFVLEVBQVYsSUFBVSxFQUFWO0NBQWMsR0FBSSxDQUFKLEdBQUQsS0FBQTtDQUFiLElBQVU7Q0E3RFgsRUEwRGM7O0NBMURkOztDQVpEOztBQTRFQSxDQTVFQSxFQTRFQTs7QUFFQSxDQTlFQSxFQThFRSxNQUFBO0NBQU8sRUFBRCxFQUFILElBQUE7Q0FBSDs7QUFFRixDQWhGQSxFQWdGaUIsR0FBWCxDQUFOIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjUxNTQsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy9jb250cm9sbGVycy9hcHBjYXN0LmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiMgU29ja2V0IGNvbnRyb2xsZXIgd2lsbCBiZSB1c2VkIHRvIGNvbW11bmljYXRlIHdpdGggZGVza3RvcCBhcHAgQXBwQ2FzdFxuIyMjXG5cbmF3YXJlICAgID0gcmVxdWlyZSAnYXdhcmUnXG4jIHNob3J0Y3V0IGZvciB2ZW5kb3Igc2NyaXB0c1xudiAgICAgICA9IHJlcXVpcmUgJ2FwcC92ZW5kb3JzJ1xuXG4jIHRoZSBjb250cm9sbGVyIGlzIHRoZSBtb2RlbCwgbW9kZXJuIGNvbmNlcHQgb2YgaGVybWFwaHJvZGl0ZSBmaWxlXG5hcHBjYXN0ID0gYXdhcmUge31cblxuIyBvbmx5IGVuYWJsZSBpZiBhdmFpbGFibGUgb24gd2luZG93XG5XZWJTb2NrZXQgPSB3aW5kb3cuV2ViU29ja2V0IHx8IG51bGxcblxuIyB3ZWJzb2NrZXQgY29ubmVjdGlvbnNcbmFwcGNhc3QubWVzc2FnZXMgPSB7fVxuYXBwY2FzdC52dSAgICAgICA9IHt9XG5cblxuYXBwY2FzdC5zZXQgJ2Nvbm5lY3RlZCcsIGZhbHNlXG4jIGNvbm5lY3RzIHRvIEFwcENhc3QncyBXZWJTb2NrZXQgc2VydmVyIGFuZCBsaXN0ZW4gZm9yIG1lc3NhZ2VzXG5hcHBjYXN0LmNvbm5lY3QgPSAtPlxuXG4gIGlmIG5vdCBXZWJTb2NrZXRcbiAgICByZXR1cm4gY29uc29sZS5pbmZvICcrIHNvY2tldCBjb250cm9sbGVyIHdvbnQgY29ubmVjdCdcblxuICBtZXNzYWdlc19zb2NrZXQgPSAnd3M6Ly9sb2NhbGhvc3Q6NTEyMzQvbG9vcGNhc3QvbWVzc2FnZXMnXG4gIGFwcGNhc3QubWVzc2FnZXMgPSBuZXcgdi5SZWNvbm5lY3RpbmdXZWJzb2NrZXQgbWVzc2FnZXNfc29ja2V0XG5cbiAgYXBwY2FzdC5tZXNzYWdlcy5vbm9wZW4gPSAtPlxuICAgIGNvbnNvbGUuaW5mbyAnLSBzb2NrZXQgY29udHJvbGxlciBjb25uZWN0aW9uIG9wZW5lZCdcblxuICAgIGFwcGNhc3Quc2V0ICdjb25uZWN0ZWQnLCB0cnVlXG5cbiAgICBhcHBjYXN0Lm1lc3NhZ2VzLnNlbmQgSlNPTi5zdHJpbmdpZnkgWyAnZ2V0X2lucHV0X2RldmljZXMnIF1cblxuICBhcHBjYXN0Lm1lc3NhZ2VzLm9uY2xvc2UgPSAtPlxuICAgIGNvbnNvbGUuaW5mbyAnLSBBcHBDYXN0IGlzbnQgT1BFTiwgd2lsbCByZXRyeSB0byBjb25uZWN0J1xuXG4gICAgYXBwY2FzdC5zZXQgJ2Nvbm5lY3RlZCcsIGZhbHNlXG5cblxuICAjIHJvdXRlIGluY29taW5nIG1lc3NhZ2VzIHRvIGFwcGNhc3QuY2FsbGJhY2tzIGhhc2hcbiAgYXBwY2FzdC5tZXNzYWdlcy5vbm1lc3NhZ2UgPSAoIGUgKSAtPlxuXG4gICAganNvbiA9IGUuZGF0YVxuXG4gICAgdHJ5XG4gICAgICBmcm9tX2pzb24gPSBKU09OLnBhcnNlIGpzb25cbiAgICBjYXRjaCBlcnJvclxuICAgICAgY29uc29sZS5lcnJvciBcIi0gc29ja2V0IGNvbnRyb2xsZXIgZXJyb3IgcGFyc2luZyBqc29uXCJcbiAgICAgIGNvbnNvbGUuZXJyb3IgZXJyb3JcbiAgICAgIHJldHVybiBlcnJvclxuXG4gICAgbWV0aG9kID0gZnJvbV9qc29uWzBdXG4gICAgYXJncyAgID0gZnJvbV9qc29uWzFdXG4gICAgXG4gICAgaWYgJ2Vycm9yJyA9PSBtZXRob2RcbiAgICAgIHJldHVybiBjb25zb2xlLmxvZyAnZXJyb3InLCBhcmdzXG5cbiAgICBpZiB0eXBlb2YgYXBwY2FzdC5jYWxsYmFja3NbbWV0aG9kXSBpcyAnZnVuY3Rpb24nXG4gICAgICBhcHBjYXN0LmNhbGxiYWNrc1ttZXRob2RdKCBhcmdzIClcbiAgICBlbHNlIFxuICAgICAgY29uc29sZS5sb2cgXCIgKyBzb2NrZXQgY29udHJvbGxlciBoYXMgbm8gY2FsbGJhY2sgZm9yOlwiLCBtZXRob2RcblxuXG5cbiAgdnVfc29ja2V0ID0gJ3dzOi8vbG9jYWxob3N0OjUxMjM0L2xvb3BjYXN0L3Z1J1xuICBhcHBjYXN0LnZ1ID0gbmV3IHYuUmVjb25uZWN0aW5nV2Vic29ja2V0IHZ1X3NvY2tldFxuXG4gIGFwcGNhc3QudnUub25vcGVuID0gLT5cbiAgICBjb25zb2xlLmluZm8gJy0gc29ja2V0IFZVIGNvbm5lY3Rpb24gb3BlbmVkJ1xuXG4gICAgYXBwY2FzdC5zZXQgJ3Z1OmNvbm5lY3RlZCcsIHRydWVcblxuICBhcHBjYXN0LnZ1Lm9uY2xvc2UgPSAtPlxuICAgIGNvbnNvbGUuaW5mbyAnLSBzb2NrZXQgVlUgY29ubmVjdGlvbiBjbG9zZWQnXG5cbiAgICBhcHBjYXN0LnNldCAndnU6Y29ubmVjdGVkJywgZmFsc2VcblxuICAjIHJvdXRlIGluY29taW5nIG1lc3NhZ2VzIHRvIGFwcGNhc3QuY2FsbGJhY2tzIGhhc2hcbiAgYXBwY2FzdC52dS5vbm1lc3NhZ2UgPSAoIGUgKSAtPlxuXG4gICAgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXJcblxuICAgIHJlYWRlci5vbmxvYWQgPSAoIGUgKSAtPlxuICAgICAgYnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheSBlLnRhcmdldC5yZXN1bHRcblxuICAgICAgYXBwY2FzdC5zZXQgJ3N0cmVhbTp2dScsIGJ1ZmZlciAgXG5cbiAgICByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIgZS5kYXRhXG5cbmFwcGNhc3Quc3RhcnRfc3RyZWFtID0gKCBkZXZpY2VfbmFtZSApIC0+XG5cbiAgbW91bnRfcG9pbnQgPSBcImhlbXNcIlxuICBwYXNzd29yZCAgICA9IFwibG9vcGNhc3QyMDE1XCJcblxuICBwYXlsb2FkID0gXG4gICAgZGV2aWNlX25hbWUgOiBkZXZpY2VfbmFtZVxuICAgIG1vdW50X3BvaW50IDogbW91bnRfcG9pbnRcbiAgICBwYXNzd29yZCAgICA6IHBhc3N3b3JkXG5cbiAgYXBwY2FzdC5zZXQgXCJzdHJlYW06c3RhcnRpbmdcIiwgdHJ1ZVxuICBhcHBjYXN0Lm1lc3NhZ2VzLnNlbmQgSlNPTi5zdHJpbmdpZnkgWyBcInN0YXJ0X3N0cmVhbVwiLCBwYXlsb2FkIF1cblxuYXBwY2FzdC5zdG9wX3N0cmVhbSA9IC0+XG5cbiAgYXBwY2FzdC5zZXQgXCJzdHJlYW06c3RvcHBpbmdcIiwgdHJ1ZVxuICBhcHBjYXN0Lm1lc3NhZ2VzLnNlbmQgSlNPTi5zdHJpbmdpZnkgWyBcInN0b3Bfc3RyZWFtXCIgXVxuXG5cbiMjI1xuIyBjYWxsYmFja3MgYXJlIGNhbGxlZCBieSBcIm1lc3NhZ2VzXCIgY29taW5nIGZyb20gdGhlIFdlYnNvY2tldFNlcnZlciBjcmVhdGVkXG4jIGJ5IHRoZSBkZXNrdG9wIGFwcGxpY2F0aW9uIEFwcENhc3RcbiMjI1xuYXBwY2FzdC5jYWxsYmFja3MgPVxuICBpbnB1dF9kZXZpY2VzICA6ICggYXJncyApIC0+XG5cbiAgICAjIGNvbnNvbGUubG9nIFwiKyBzb2NrZXQgY29udHJvbGxyIGdvdCBpbnB1dCBkZXZpY2VzXCIsIGFyZ3MuZGV2aWNlc1xuXG4gICAgIyBzYXZlcyBsaXN0IG9mIGRldmljZXMgYW5kIGJyb2FkY2FzdCBjaGFuZ2VcbiAgICBhcHBjYXN0LnNldCAnaW5wdXRfZGV2aWNlcycsIGFyZ3MuZGV2aWNlc1xuXG4gICAgIyBhdXRvbWF0aWNhbHkgdGVzdGluZyBzdHJlYW1cbiAgICAjIGFwcGNhc3Quc3RhcnRfc3RyZWFtIFwiU291bmRmbG93ZXIgKDJjaClcIlxuXG4gIHN0cmVhbV9zdGFydGVkIDogKCBhcmdzICkgLT5cblxuICAgIGlmIGFyZ3M/IGFuZCBhcmdzLmVycm9yP1xuXG4gICAgICBjb25zb2xlLmVycm9yIFwiLSBzdHJlYW1fc3RhcnRlZCBlcnJvcjpcIiwgYXJncy5lcnJvclxuXG4gICAgICBhcHBjYXN0LnNldCBcInN0cmVhbTplcnJvclwiLCBhcmdzLmVycm9yXG5cbiAgICAgIHJldHVyblxuXG4gICAgIyBzYXZlIGN1cnJlbnQgc3RyZWFtOm9ubGluZSBzdGF0dXNcbiAgICBhcHBjYXN0LnNldCAnc3RyZWFtOm9ubGluZScsIHRydWVcblxuICAgICMgcmVzZXQgb3RoZXIgc3RyYW1pbmcgZmxhZ3NcbiAgICBhcHBjYXN0LnNldCBcInN0cmVhbTpzdGFydGluZ1wiLCBudWxsXG4gICAgYXBwY2FzdC5zZXQgXCJzdHJlYW06ZXJyb3JcIiAgICwgbnVsbFxuXG4gIHN0cmVhbV9zdG9wcGVkOiAtPlxuXG4gICAgIyBzYXZlIGN1cnJlbnQgc3RyZWFtOm9ubGluZSBzdGF0dXNcbiAgICBhcHBjYXN0LnNldCAnc3RyZWFtOm9ubGluZScgICwgZmFsc2VcbiAgICBhcHBjYXN0LnNldCBcInN0cmVhbTpzdG9wcGluZ1wiLCBudWxsXG5cbiMjI1xuIyBMaXN0ZW5pbmcgdG8gbWVzc2FnZXNcbiMjI1xuYXBwY2FzdC5vbiAnaW5wdXRfZGV2aWNlJywgLT5cblxuICBpZiBhcHBjYXN0LmdldCAnc3RyZWFtOm9ubGluZSdcbiAgICBjb25zb2xlLmVycm9yICctIGlucHV0IGRldmljZSBjaGFuZ2VkIHdoaWxlIHN0cmVhbTpvbmxpbmUnXG4gICAgY29uc29sZS5lcnJvciAnPyB3aGF0IHNob3VsZCB3ZSBkbydcblxuIyBzaG91bGQgdHJ5IHRvIGNvbm5lY3Qgb25seSBvbiBpdCdzIG93biBwcm9maWxlIHBhZ2VcbmFwcGNhc3QuY29ubmVjdCgpXG5cbm1vZHVsZS5leHBvcnRzID0gYXBwY2FzdCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0NBQUE7Q0FBQSxHQUFBLHdCQUFBOztBQUlBLENBSkEsRUFJVyxFQUFYLEVBQVc7O0FBRVgsQ0FOQSxFQU1VLElBQUEsTUFBQTs7QUFHVixDQVRBLENBU1UsQ0FBQSxFQUFBLEVBQVY7O0FBR0EsQ0FaQSxFQVlZLENBQW9CLEVBQWQsR0FBbEI7O0FBR0EsQ0FmQSxDQUFBLENBZW1CLElBQVosQ0FBUDs7QUFDQSxDQWhCQSxDQWdCQSxDQUFtQixJQUFaOztBQUdQLENBbkJBLENBbUJ5QixDQUF6QixFQUFBLEVBQU8sSUFBUDs7QUFFQSxDQXJCQSxFQXFCa0IsSUFBWCxFQUFXO0NBRWhCLEtBQUEsb0JBQUE7QUFBTyxDQUFQLENBQUEsRUFBRyxLQUFIO0NBQ0UsR0FBTyxHQUFPLElBQVAsdUJBQUE7SUFEVDtDQUFBLENBR0EsQ0FBa0IsWUFBbEIseUJBSEE7Q0FBQSxDQUlBLENBQXVCLENBQUEsR0FBaEIsQ0FBUCxPQUF1QixNQUFBO0NBSnZCLENBTUEsQ0FBMEIsR0FBMUIsQ0FBTyxDQUFTLENBQVU7Q0FDeEIsR0FBQSxHQUFPLGdDQUFQO0NBQUEsQ0FFeUIsQ0FBekIsQ0FBQSxHQUFPLElBQVA7Q0FFUSxHQUFSLEdBQU8sQ0FBUyxDQUFNLEVBQXRCLFFBQXFDO0NBWHZDLEVBTTBCO0NBTjFCLENBYUEsQ0FBMkIsSUFBcEIsQ0FBUyxDQUFXO0NBQ3pCLEdBQUEsR0FBTyxxQ0FBUDtDQUVRLENBQWlCLENBQXpCLEVBQUEsRUFBTyxJQUFQO0NBaEJGLEVBYTJCO0NBYjNCLENBb0JBLENBQTZCLElBQXRCLENBQVMsQ0FBaEI7Q0FFRSxPQUFBLDRCQUFBO0NBQUEsRUFBTyxDQUFQO0NBRUE7Q0FDRSxFQUFZLENBQUksQ0FBSixDQUFaLEdBQUE7TUFERjtDQUdFLEtBREk7Q0FDSixJQUFBLENBQUEsQ0FBTyxpQ0FBUDtDQUFBLElBQ0EsQ0FBQSxDQUFPO0NBQ1AsSUFBQSxRQUFPO01BUFQ7Q0FBQSxFQVNTLENBQVQsRUFBQSxHQUFtQjtDQVRuQixFQVVTLENBQVQsS0FBbUI7Q0FFbkIsR0FBQSxDQUFjLENBQWQsQ0FBRztDQUNELENBQTRCLENBQXJCLENBQUEsR0FBTyxNQUFQO01BYlQ7QUFlRyxDQUFILEdBQUEsQ0FBdUMsQ0FBcEMsQ0FBYyxFQUFXLENBQTVCO0NBQ1UsR0FBUixFQUFrQixDQUFYLEVBQVcsSUFBbEI7TUFERjtDQUdVLENBQWlELENBQXpELEdBQUEsQ0FBTyxNQUFQLDhCQUFBO01BcEJ5QjtDQXBCN0IsRUFvQjZCO0NBcEI3QixDQTRDQSxDQUFZLE1BQVoseUJBNUNBO0NBQUEsQ0E2Q0EsQ0FBaUIsQ0FBQSxHQUFWLEVBQVUsWUFBQTtDQTdDakIsQ0ErQ0EsQ0FBb0IsR0FBcEIsQ0FBTyxFQUFhO0NBQ2xCLEdBQUEsR0FBTyx3QkFBUDtDQUVRLENBQW9CLENBQTVCLENBQUEsR0FBTyxJQUFQLEdBQUE7Q0FsREYsRUErQ29CO0NBL0NwQixDQW9EQSxDQUFxQixJQUFkLEVBQWM7Q0FDbkIsR0FBQSxHQUFPLHdCQUFQO0NBRVEsQ0FBb0IsQ0FBNUIsRUFBQSxFQUFPLElBQVAsR0FBQTtDQXZERixFQW9EcUI7Q0FNYixDQUFFLENBQWEsSUFBaEIsRUFBUDtDQUVFLEtBQUEsRUFBQTtBQUFTLENBQVQsRUFBUyxDQUFULEVBQUEsSUFBQTtDQUFBLEVBRWdCLENBQWhCLEVBQU0sR0FBWTtDQUNoQixLQUFBLElBQUE7Q0FBQSxFQUFhLENBQUEsRUFBYixNQUFhO0NBRUwsQ0FBaUIsQ0FBekIsR0FBQSxDQUFPLElBQVAsRUFBQTtDQUxGLElBRWdCO0NBS1QsR0FBUCxFQUFNLEtBQU4sTUFBQTtDQXJFYyxFQTRETztDQTVEUDs7QUF1RWxCLENBNUZBLEVBNEZ1QixJQUFoQixFQUFrQixFQUFGLENBQXZCO0NBRUUsS0FBQSx3QkFBQTtDQUFBLENBQUEsQ0FBYyxHQUFkLEtBQUE7Q0FBQSxDQUNBLENBQWMsS0FBZCxNQURBO0NBQUEsQ0FHQSxDQUNFLElBREY7Q0FDRSxDQUFjLEVBQWQsT0FBQTtDQUFBLENBQ2MsRUFBZCxPQUFBO0NBREEsQ0FFYyxFQUFkLElBQUE7Q0FORixHQUFBO0NBQUEsQ0FRQSxDQUFBLENBQUEsR0FBTyxVQUFQO0NBQ1EsQ0FBK0MsRUFBdkQsR0FBTyxDQUFTLENBQWhCLEtBQXFDO0NBWGhCOztBQWF2QixDQXpHQSxFQXlHc0IsSUFBZixFQUFlLEVBQXRCO0NBRUUsQ0FBQSxDQUFBLENBQUEsR0FBTyxVQUFQO0NBQ1EsR0FBUixHQUFPLENBQVMsQ0FBaEIsSUFBcUM7Q0FIakI7O0NBTXRCOzs7O0NBL0dBOztBQW1IQSxDQW5IQSxFQW9IRSxJQURLLEVBQVA7Q0FDRSxDQUFBLENBQWlCLENBQUEsS0FBRSxJQUFuQjtDQUtVLENBQXFCLENBQTdCLENBQWlDLEdBQTFCLElBQVAsSUFBQTtDQUxGLEVBQWlCO0NBQWpCLENBVUEsQ0FBaUIsQ0FBQSxLQUFFLEtBQW5CO0NBRUUsR0FBQSxVQUFHLE1BQUg7Q0FFRSxDQUF5QyxFQUFJLENBQTdDLENBQUEsQ0FBTyxrQkFBUDtDQUFBLENBRTRCLENBQTVCLENBQWdDLENBQWhDLENBQUEsQ0FBTyxPQUFQO0NBRUEsV0FBQTtNQU5GO0NBQUEsQ0FTNkIsQ0FBN0IsQ0FBQSxHQUFPLFFBQVA7Q0FUQSxDQVkrQixDQUEvQixDQUFBLEdBQU8sVUFBUDtDQUNRLENBQXVCLENBQS9CLENBQUEsR0FBTyxJQUFQLEdBQUE7Q0F6QkYsRUFVaUI7Q0FWakIsQ0EyQkEsQ0FBZ0IsTUFBQSxLQUFoQjtDQUdFLENBQStCLENBQS9CLENBQUEsQ0FBQSxFQUFPLFFBQVA7Q0FDUSxDQUF1QixDQUEvQixDQUFBLEdBQU8sSUFBUCxNQUFBO0NBL0JGLEVBMkJnQjtDQS9JbEIsQ0FBQTs7Q0FxSkE7OztDQXJKQTs7QUF3SkEsQ0F4SkEsQ0F3SkEsQ0FBMkIsSUFBcEIsRUFBb0IsS0FBM0I7Q0FFRSxDQUFBLENBQUcsQ0FBQSxHQUFPLFFBQVA7Q0FDRCxHQUFBLENBQUEsRUFBTyxxQ0FBUDtDQUNRLElBQVIsRUFBTyxJQUFQLFVBQUE7SUFKdUI7Q0FBQTs7QUFPM0IsQ0EvSkEsTUErSk87O0FBRVAsQ0FqS0EsRUFpS2lCLEdBQVgsQ0FBTiJ9fSx7Im9mZnNldCI6eyJsaW5lIjo1Mjk2LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvY29udHJvbGxlcnMvbG9jYWxfY29ubmVjdGlvbi5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4jXG4jIENvbnRyb2xsZXIgcmVzcG9uc2libGUgZm9yIGNvbW11bmljYXRpb24gd2l0aCBvdGhlciBpbnN0YW5jZXMgb2YgdGhlIGFwcFxuIyBmb3IgaW5zdGFuY2UgYW5vdGhlciB0YWIgb3IgcG9wIHVwIG9wZW5cbiNcbiMgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9qZXJlbXloYXJyaXMvTG9jYWxDb25uZWN0aW9uLmpzL3RyZWUvbWFzdGVyXG4jIGZvcmUgbW9yZSBpbmZvcm1hdGlvbiwgZm9yIGluc3RhbmNlIGludGVncmF0aW9uIHdpdGggSUU5XG4jXG4jIyNcblxuYXBwID0gcmVxdWlyZSAnYXBwL2FwcCdcblxuY29ubmVjdGlvbiA9IG5ldyBMb2NhbENvbm5lY3Rpb24gJ2JldGEubG9vcGNhc3QuZm0nXG5jb25uZWN0aW9uLmxpc3RlbigpXG5cbmNvbm5lY3Rpb24uYWRkQ2FsbGJhY2sgJ2xvZ2luJywgKCB1c2VyICkgLT5cblxuICBjb25zb2xlLmluZm8gJyArIGxvY2F0aW9uIGNvbm5lY3Rpb24sIHVzZXIgbG9nZ2VkIGluOicsIHVzZXJcblxuICBhcHAubG9naW4gdXNlclxuXG5jb25uZWN0aW9uLmFkZENhbGxiYWNrICdsb2dvdXQnLCAtPlxuXG4gIGNvbnNvbGUuaW5mbyAnICsgbG9jYXRpb24gY29ubmVjdGlvbiwgdXNlciBsb2dnZWQgb3V0J1xuXG4gIGFwcC5sb2dvdXQoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbm5lY3Rpb24iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztDQUFBO0NBQUEsR0FBQSxXQUFBOztBQVVBLENBVkEsRUFVQSxJQUFNLEVBQUE7O0FBRU4sQ0FaQSxFQVlpQixDQUFBLE1BQWpCLEtBQWlCLEdBQUE7O0FBQ2pCLENBYkEsS0FhQSxJQUFVOztBQUVWLENBZkEsQ0FlZ0MsQ0FBQSxDQUFBLEdBQWhDLEVBQWtDLENBQXhCLENBQVY7Q0FFRSxDQUFBLEVBQUEsR0FBTyxrQ0FBUDtDQUVJLEVBQUQsQ0FBSCxDQUFBLElBQUE7Q0FKOEI7O0FBTWhDLENBckJBLENBcUJpQyxDQUFBLEtBQWpDLENBQWlDLENBQXZCLENBQVY7Q0FFRSxDQUFBLEVBQUEsR0FBTyxrQ0FBUDtDQUVJLEVBQUQsR0FBSCxHQUFBO0NBSitCOztBQU1qQyxDQTNCQSxFQTJCaUIsR0FBWCxDQUFOLEdBM0JBIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjUzMjgsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy9jb250cm9sbGVycy9uYXZpZ2F0aW9uLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJzZXR0aW5ncyAgXHQ9IHJlcXVpcmUgJ2FwcC91dGlscy9zZXR0aW5ncydcbmhhcHBlbnMgIFx0PSByZXF1aXJlICdoYXBwZW5zJ1xud2F5cyAgICBcdD0gcmVxdWlyZSAnd2F5cydcbndheXMudXNlIHJlcXVpcmUgJ3dheXMtYnJvd3NlcidcblxuY2xhc3MgTmF2aWdhdGlvblxuXG5cdGluc3RhbmNlID0gbnVsbFxuXHRmaXJzdF9sb2FkaW5nOiBvblxuXG5cdGNvbnN0cnVjdG9yOiAtPlxuXG5cdFx0aWYgTmF2aWdhdGlvbi5pbnN0YW5jZVxuXHRcdFx0Y29uc29sZS5lcnJvciBcIllvdSBjYW4ndCBpbnN0YW50aWF0ZSB0aGlzIE5hdmlnYXRpb24gdHdpY2VcIlx0XG5cblx0XHRcdHJldHVyblxuXG5cdFx0TmF2aWdhdGlvbi5pbnN0YW5jZSA9IEBcblx0XHRAY29udGVudF9zZWxlY3RvciA9ICcjY29udGVudCAuaW5uZXJfY29udGVudCdcblx0XHRAY29udGVudF9kaXYgPSAkIEBjb250ZW50X3NlbGVjdG9yXG5cblx0XHRoYXBwZW5zIEBcblx0XG5cdFx0IyBleHBvcnQgdG8gd2luZG93XG5cdFx0d2luZG93LndheXMgPSB3YXlzO1xuXHRcdFxuXHRcdCMgcm91dGluZ1xuXHRcdHdheXMgJyonLCBAdXJsX2NoYW5nZWRcblxuXG5cdFx0IyBGb3IgdGhlIGZpcnN0IHNjcmVlbiwgZW1pdCB0aGUgZXZlbnQgYWZ0ZXJfcmVuZGVyLlxuXHRcdCMgaWYsIGluIHRoZSBtZWFudGltZSwgdGhlIG5hdmlnYXRpb24gZ29lcyB0byBhbm90aGVyIHVybFxuXHRcdCMgd2Ugd29uJ3QgZW1pdCB0aGlzIGZpcnN0IGV2ZW50LlxuXHRcdGRlbGF5IDIwMCwgPT5cblx0XHRcdGlmIEBmaXJzdF9sb2FkaW5nIHRoZW4gQGVtaXQgJ2FmdGVyX3JlbmRlcidcblxuXG5cdHVybF9jaGFuZ2VkOiAoIHJlcSApID0+XG5cblxuXHRcdGxvZyBcInVybF9jaGFuZ2VkXCIsIHJlcS51cmxcblxuXHRcdCMgaWUgaGFjayBmb3IgaGFzaCB1cmxzXG5cdFx0cmVxLnVybCA9IHJlcS51cmwucmVwbGFjZSggXCIvI1wiLCAnJyApXG5cblx0XHQjIGxvZyBcIiBjb250cm9sbGVycy9uYXZpZ2F0aW9uL3VybF9jaGFuZ2VkOjogI3tyZXEudXJsfVwiXG5cdFx0IyBUT0RPOiBcblx0XHQjICAtIGRvbid0IHJlbG9hZCBpZiB0aGUgY29udGVudCBpcyBhbHJlYWR5IGxvYWRlZFxuXHRcdCMgIC0gaW1wbGVtZW50IHRyYW5zaXRpb25zIG91dFxuXHRcdCMgIC0gaW1wbGVtZW50IHRyYW5zaXRpb24gIGluIFxuXG5cdFx0ZGl2ID0gJCggJzxkaXY+JyApXG5cblx0XHRAZW1pdCAnYmVmb3JlX2xvYWQnXG5cblx0XHRkaXYubG9hZCByZXEudXJsLCA9PlxuXG5cdFx0XHRAZW1pdCAnb25fbG9hZCdcblxuXHRcdFx0aWYgYXBwLmJvZHkuc2Nyb2xsVG9wKCkgPiAwXG5cdFx0XHRcdGFwcC5ib2R5LmFuaW1hdGUgc2Nyb2xsVG9wOiAwXG5cblxuXHRcdFx0QGVtaXQgJ2JlZm9yZV9kZXN0cm95J1x0XHRcblxuXHRcdFx0ZGVsYXkgNDAwLCA9Plx0XHRcdFxuXG5cdFx0XHRcdG5ld19jb250ZW50ID0gZGl2LmZpbmQoIEBjb250ZW50X3NlbGVjdG9yICkuY2hpbGRyZW4oKVxuXHRcdFx0XHRcblx0XHRcdFx0QGNvbnRlbnRfZGl2ID0gJCBAY29udGVudF9zZWxlY3RvclxuXG5cdFx0XHRcdCMgUmVtb3ZlIG9sZCBjb250ZW50XG5cdFx0XHRcdEBjb250ZW50X2Rpdi5jaGlsZHJlbigpLnJlbW92ZSgpXG5cblx0XHRcdFx0IyBwb3B1bGF0ZSB3aXRoIHRoZSBsb2FkZWQgY29udGVudFxuXHRcdFx0XHRAY29udGVudF9kaXYuYXBwZW5kIG5ld19jb250ZW50XG5cdFx0XHRcdGRlbGF5IDEwLCA9PlxuXHRcdFx0XHRcdGxvZyBcIltOYXZpZ2F0aW9uXSBhZnRlcl9yZW5kZXJcIiwgcmVxLnVybFxuXHRcdFx0XHRcdEBlbWl0ICdhZnRlcl9yZW5kZXInXG5cblx0IyNcblx0IyBOYXZpZ2F0ZXMgdG8gYSBnaXZlbiBVUkwgdXNpbmcgSHRtbCA1IGhpc3RvcnkgQVBJXG5cdCMjXG5cdGdvOiAoIHVybCApIC0+XG5cblx0XHQjIElmIGl0J3MgYSBwb3B1cCwgYnlwYXNzIHdheXMgYW5kIHNlYW1sZXNzIG5hdmlnYXRpb25cblx0XHRpZiB3aW5kb3cub3BlbmVyP1xuXHRcdFx0cmV0dXJuIHRydWVcblxuXHRcdEBmaXJzdF9sb2FkaW5nID0gb2ZmXG5cblx0XHR3YXlzLmdvIHVybFxuXG5cdFx0cmV0dXJuIGZhbHNlXG5cblx0IyNcblx0IyBMb29rcyBmb3IgaW50ZXJuYWwgbGlua3MgYW5kIGJpbmQgdGhlbiB0byBjbGllbnQgc2lkZSBuYXZpZ2F0aW9uXG5cdCMgYXMgaW46IGh0bWwgSGlzdG9yeSBhcGlcblx0IyNcblx0YmluZDogKCBzY29wZSA9ICdib2R5JyApIC0+XG5cblx0XHQkKCBzY29wZSApLmZpbmQoICdhJyApLmVhY2ggKCBpbmRleCwgaXRlbSApIC0+XG5cblx0XHRcdCRpdGVtID0gJCBpdGVtXG5cdFx0XHRocmVmID0gJGl0ZW0uYXR0ciggJ2hyZWYnIClcblxuXHRcdFx0aWYgIWhyZWY/IHRoZW4gcmV0dXJuIFxuXG5cdFx0XHQjIGlmIHRoZSBsaW5rIGhhcyBodHRwIGFuZCB0aGUgZG9tYWluIGlzIGRpZmZlcmVudFxuXHRcdFx0aWYgaHJlZi5pbmRleE9mKCAnaHR0cCcgKSA+PSAwIGFuZCBocmVmLmluZGV4T2YoIGRvY3VtZW50LmRvbWFpbiApIDwgMCBcblx0XHRcdFx0cmV0dXJuIFxuXG5cdFx0XHRpZiBocmVmLmluZGV4T2YoIFwiI1wiICkgaXMgMFxuXHRcdFx0XHQkaXRlbS5jbGljayAtPiByZXR1cm4gZmFsc2VcblxuXHRcdFx0ZWxzZSBpZiBocmVmLmluZGV4T2YoIFwiamF2YXNjcmlwdFwiICkgaXMgMCBvciBocmVmLmluZGV4T2YoIFwidGVsOlwiICkgaXMgMFxuXHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHQkaXRlbS5jbGljayAtPiBcblx0XHRcdFx0XHRyZXR1cm4gTmF2aWdhdGlvbi5pbnN0YW5jZS5nbyAkKCBAICkuYXR0ciAnaHJlZidcblxuXG4jIHdpbGwgYWx3YXlzIGV4cG9ydCB0aGUgc2FtZSBpbnN0YW5jZVxubW9kdWxlLmV4cG9ydHMgPSBuZXcgTmF2aWdhdGlvbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLCtCQUFBO0dBQUEsK0VBQUE7O0FBQUEsQ0FBQSxFQUFhLElBQUEsQ0FBYixZQUFhOztBQUNiLENBREEsRUFDWSxJQUFaLEVBQVk7O0FBQ1osQ0FGQSxFQUVXLENBQVgsRUFBVyxDQUFBOztBQUNYLENBSEEsRUFHQSxDQUFJLEdBQUssT0FBQTs7QUFFSCxDQUxOO0NBT0MsS0FBQSxFQUFBOztDQUFBLENBQUEsQ0FBVyxDQUFYLElBQUE7O0NBQUEsRUFDZSxDQURmLFNBQ0E7O0NBRWEsQ0FBQSxDQUFBLGlCQUFBO0NBRVosZ0RBQUE7Q0FBQSxPQUFBLElBQUE7Q0FBQSxHQUFBLElBQUEsRUFBYTtDQUNaLElBQUEsQ0FBQSxDQUFPLHNDQUFQO0NBRUEsV0FBQTtNQUhEO0NBQUEsRUFLc0IsQ0FBdEIsSUFBQSxFQUFVO0NBTFYsRUFNb0IsQ0FBcEIsWUFBQSxTQU5BO0NBQUEsRUFPZSxDQUFmLE9BQUEsS0FBZTtDQVBmLEdBU0EsR0FBQTtDQVRBLEVBWWMsQ0FBZCxFQUFNO0NBWk4sQ0FlVSxDQUFWLENBQUEsT0FBQTtDQWZBLENBcUJXLENBQVgsQ0FBQSxDQUFBLElBQVc7Q0FDVixHQUFHLENBQUMsQ0FBSixPQUFBO0NBQXdCLEdBQUQsQ0FBQyxTQUFELENBQUE7UUFEYjtDQUFYLElBQVc7Q0ExQlosRUFHYTs7Q0FIYixFQThCYSxNQUFFLEVBQWY7Q0FHQyxFQUFBLEtBQUE7T0FBQSxLQUFBO0NBQUEsQ0FBbUIsQ0FBbkIsQ0FBQSxTQUFBO0NBQUEsQ0FHaUMsQ0FBOUIsQ0FBSCxHQUFVO0NBSFYsRUFXQSxDQUFBLEdBQU07Q0FYTixHQWFBLFNBQUE7Q0FFSSxDQUFjLENBQWYsQ0FBSCxLQUFrQixFQUFsQjtDQUVDLEdBQUEsQ0FBQyxDQUFELEdBQUE7Q0FFQSxFQUFNLENBQUgsRUFBSCxHQUFHO0NBQ0YsRUFBRyxDQUFLLEdBQVIsQ0FBQTtDQUFpQixDQUFXLE9BQVgsQ0FBQTtDQUFqQixTQUFBO1FBSEQ7Q0FBQSxHQU1BLENBQUMsQ0FBRCxVQUFBO0NBRU0sQ0FBSyxDQUFYLEVBQUEsSUFBVyxJQUFYO0NBRUMsVUFBQSxDQUFBO0NBQUEsRUFBYyxDQUFBLENBQVcsR0FBekIsR0FBQSxLQUFjO0NBQWQsRUFFZSxFQUFkLEdBQUQsR0FBQSxLQUFlO0NBRmYsSUFLQyxDQUFELEVBQUEsR0FBWTtDQUxaLElBUUMsQ0FBRCxFQUFBLEdBQVk7Q0FDTixDQUFOLENBQVUsRUFBVixJQUFVLE1BQVY7Q0FDQyxDQUFpQyxDQUFqQyxPQUFBLGlCQUFBO0NBQ0MsR0FBRCxDQUFDLFNBQUQsR0FBQTtDQUZELFFBQVU7Q0FYWCxNQUFXO0NBVlosSUFBa0I7Q0FoRG5CLEVBOEJhOztDQTlCYixDQTRFQSxDQUFJLE1BQUU7Q0FHTCxHQUFBLGlCQUFBO0NBQ0MsR0FBQSxTQUFPO01BRFI7Q0FBQSxFQUdpQixDQUFqQixDQUhBLFFBR0E7Q0FIQSxDQUtBLENBQUEsQ0FBQTtDQUVBLElBQUEsTUFBTztDQXRGUixFQTRFSTs7Q0E1RUosRUE0Rk0sQ0FBTixDQUFNLElBQUU7O0dBQVEsR0FBUjtNQUVQO0NBQUEsQ0FBcUMsQ0FBckMsQ0FBQSxDQUFBLElBQThCLEVBQTlCO0NBRUMsU0FBQSxDQUFBO0NBQUEsRUFBUSxDQUFBLENBQVIsQ0FBQTtDQUFBLEVBQ08sQ0FBUCxDQUFZLENBQVo7Q0FFQSxHQUFJLEVBQUosTUFBQTtDQUFlLGFBQUE7UUFIZjtDQU1BLEVBQXFFLENBQWxFLEVBQUgsQ0FBRyxDQUFzRDtDQUN4RCxhQUFBO1FBUEQ7Q0FTQSxFQUFHLENBQUEsQ0FBdUIsQ0FBMUIsQ0FBRztDQUNJLEVBQU0sRUFBUCxJQUFPLE1BQVo7Q0FBZSxJQUFBLFlBQU87Q0FBdEIsUUFBWTtDQUVBLEdBQUwsQ0FBZ0MsQ0FIeEMsQ0FHUSxDQUhSLElBR1E7Q0FDUCxHQUFBLFdBQU87TUFKUixFQUFBO0NBTU8sRUFBTSxFQUFQLElBQU8sTUFBWjtDQUNDLENBQU8sRUFBdUIsRUFBQSxFQUFKLEVBQVQsT0FBVjtDQURSLFFBQVk7UUFqQmM7Q0FBNUIsSUFBNEI7Q0E5RjdCLEVBNEZNOztDQTVGTjs7Q0FQRDs7QUEySEEsQ0EzSEEsRUEySGlCLEdBQVgsQ0FBTixHQTNIQSJ9fSx7Im9mZnNldCI6eyJsaW5lIjo1NDQwLCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvY29udHJvbGxlcnMvdXNlci5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiaGFwcGVucyA9IHJlcXVpcmUgJ2hhcHBlbnMnXG5cbm1vZHVsZS5leHBvcnRzID0gaGFwcGVuc1xuXHRsb2dvdXQ6ICggY2FsbGJhY2sgPSAtPiApIC0+XG5cdFx0XG5cdFx0aWYgbm90IEBpc19sb2dnZWQoKSB0aGVuIHJldHVybiBjYWxsYmFjayBlcnJvcjogY29kZTogJ25vZGVfbG9nZ2VkJ1xuXG5cdFx0bG9nIFwiW1VzZXJdIHRyeWluZyB0byBsb2dvdXQuLi5cIlxuXG5cdFx0JC5wb3N0ICcvYXBpL3YxL2xvZ291dCcsIHt9LCAoZGF0YSkgPT5cblx0XHRcdGxvZyBcIltVc2VyXSBsb2dvdXQgfiBzdWNjZXNzXCIsIGRhdGFcblxuXHRcdFx0QGVtaXQgJ3VzZXI6dW5sb2dnZWQnXG5cblx0XHRcdGFwcC5ib2R5LnJlbW92ZUNsYXNzIFwibG9nZ2VkXCJcblxuXHRcdFx0bG9nIFwiW1VzZXIgQ29udHJvbGxlcl0gZGVsZXRpbmcgdXNlciB2YXJpYWJsZVwiXG5cdFx0XHRkZWxldGUgbG9vcGNhc3QudXNlclxuXG5cdFx0XHRjYWxsYmFjaz8oKVxuXHRcblx0bG9naW46ICggdXNlciApIC0+XG5cblx0XHRsb29wY2FzdC51c2VyID0gdXNlclxuXG5cdFx0YXBwLmJvZHkuYWRkQ2xhc3MgXCJsb2dnZWRcIlxuXG5cdFx0QGVtaXQgJ3VzZXI6bG9nZ2VkJywgbG9vcGNhc3QudXNlclxuXG5cdFx0bG9nIFwiW1VzZXIgQ29udHJvbGxlcl0gbG9naW5cIiwgbG9vcGNhc3QudXNlclxuXG5cdGNoZWNrX3VzZXI6IC0+IFxuXHRcdGlmIEBpc19sb2dnZWQoKVxuXHRcdFx0QGxvZ2luIGxvb3BjYXN0LnVzZXJcblx0XHRlbHNlXG5cdFx0XHRAbG9nb3V0KClcblxuXHRpc19sb2dnZWQ6IC0+IGxvb3BjYXN0LnVzZXI/Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsR0FBQTs7QUFBQSxDQUFBLEVBQVUsSUFBVixFQUFVOztBQUVWLENBRkEsRUFFaUIsR0FBWCxDQUFOO0NBQ0MsQ0FBQSxDQUFRLEdBQVIsRUFBUSxDQUFFO0NBRVQsT0FBQSxJQUFBOztHQUZvQixHQUFYLEdBQVc7TUFFcEI7QUFBTyxDQUFQLEdBQUEsS0FBTztDQUFrQixPQUFPLEtBQUE7Q0FBUyxDQUFPLEdBQVAsR0FBQTtDQUFPLENBQU0sRUFBTixNQUFBLEdBQUE7VUFBUDtDQUFoQixPQUFPO01BQWhDO0NBQUEsRUFFQSxDQUFBLHdCQUFBO0NBRUMsQ0FBd0IsQ0FBSSxDQUE3QixLQUE4QixFQUE5QixLQUFBO0NBQ0MsQ0FBK0IsQ0FBL0IsQ0FBQSxFQUFBLG1CQUFBO0NBQUEsR0FFQSxDQUFDLENBQUQsU0FBQTtDQUZBLEVBSUcsQ0FBSyxFQUFSLEVBQUEsR0FBQTtDQUpBLEVBTUEsR0FBQSxvQ0FBQTtBQUNBLENBUEEsR0FBQSxFQU9BLEVBQWU7Q0FSYSxFQVU1QjtDQVZELElBQTZCO0NBTjlCLEVBQVE7Q0FBUixDQWtCQSxDQUFPLENBQUEsQ0FBUCxJQUFTO0NBRVIsRUFBZ0IsQ0FBaEIsSUFBUTtDQUFSLEVBRUcsQ0FBSCxJQUFBO0NBRkEsQ0FJcUIsRUFBckIsSUFBNkIsS0FBN0I7Q0FFSSxDQUEyQixDQUEvQixDQUFBLElBQXVDLEdBQXZDLGNBQUE7Q0ExQkQsRUFrQk87Q0FsQlAsQ0E0QkEsQ0FBWSxNQUFBLENBQVo7Q0FDQyxHQUFBLEtBQUc7Q0FDRCxHQUFBLENBQUQsR0FBZSxLQUFmO01BREQ7Q0FHRSxHQUFBLEVBQUQsT0FBQTtNQUpVO0NBNUJaLEVBNEJZO0NBNUJaLENBa0NBLENBQVcsTUFBWDtDQUFXLFVBQUc7Q0FsQ2QsRUFrQ1c7Q0FyQ1osQ0FFaUIifX0seyJvZmZzZXQiOnsibGluZSI6NTQ4NywiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL2NvbnRyb2xsZXJzL3ZpZXdzLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJoYXBwZW5zID0gcmVxdWlyZSAnaGFwcGVucydcblxuY2xhc3MgVmlld1xuXG5cdFVOSVFVRV9JRCAgXHQ9IDBcblxuXG5cdCMjI1xuXHRIYXNoIE1hcCB0byBzdG9yZSB0aGUgdmlld3M6XG5cblx0aGFzaF9tb2RlbCA9IHtcblx0XHRcIjx2aWV3X25hbWU+XCIgOiBbIDx2aWV3X2luc3RhbmNlPiwgPHZpZXdfaW5zdGFuY2U+LCAuLiBdLFxuXHRcdFwiPHZpZXdfbmFtZT5cIiA6IFsgPHZpZXdfaW5zdGFuY2U+LCA8dmlld19pbnN0YW5jZT4sIC4uIF1cblx0fVxuXHQjIyNcblx0aGFzaF9tb2RlbCAgOiB7fVxuXG5cblx0IyMjXG5cdFVpZCBNYXAuIEludGVybmFsIG1hcCB1c2VkIGZvciBlYXNpbHkgZ2V0IGEgdmlldyBieSB1aWRcblxuXHR1aWRfbWFwID0ge1xuXHRcdFwiPFVOSVFVRV9JRD5cIiA6IHsgbmFtZSA6IDx2aWV3X25hbWU+LCBpbmRleDogPHZpZXdfaW5kZXg+IH0sXG5cdFx0XCI8VU5JUVVFX0lEPlwiIDogeyBuYW1lIDogPHZpZXdfbmFtZT4sIGluZGV4OiA8dmlld19pbmRleD4gfSxcblx0XHQgIC4uLlxuXHR9XG5cdCMjI1xuXHR1aWRfbWFwOiB7fVxuXG5cblxuXG5cblx0IyBHZXQgdGhlIHZpZXcgZnJvbSB0aGUgaGFzaCBtb2RlbFxuXHRnZXQ6ICggaWQsIGluZGV4ID0gMCApID0+XG5cdFx0dW5sZXNzIEBoYXNoX21vZGVsWyBpZCBdP1xuXHRcdFx0IyBjb25zb2xlLmVycm9yIFwiVmlldyAje2lkfSAje2luZGV4fSBkb2Vzbid0IGV4aXN0c1wiXG5cdFx0XHRyZXR1cm4gZmFsc2VcblxuXHRcdEBoYXNoX21vZGVsWyBpZCBdWyBpbmRleCBdXG5cblxuXG5cdGdldF9ieV91aWQ6ICggdWlkICkgPT5cblx0XHRpZiBAdWlkX21hcFsgdWlkIF0/XG5cdFx0XHRuYW1lID0gQHVpZF9tYXBbIHVpZCBdLm5hbWVcblx0XHRcdGluZGV4ID0gQHVpZF9tYXBbIHVpZCBdLmluZGV4XG5cblx0XHRcdHJldHVybiBAZ2V0IG5hbWUsIGluZGV4XG5cblx0XHRyZXR1cm4gZmFsc2VcblxuXHRnZXRfYnlfZG9tOiAoIHNlbGVjdG9yICkgPT4gQGdldF9ieV91aWQgJCggc2VsZWN0b3IgKS5kYXRhICd1aWQnXG5cblxuXG5cdGJpbmQ6ICggc2NvcGUgPSAnYm9keScsIHRvbG9nID0gZmFsc2UgKSAtPlxuXG5cdFx0IyBjb25zb2xlLmVycm9yIFwiQmluZGluZ3Mgdmlld3M6ICN7c2NvcGV9XCJcblx0XHQkKCBzY29wZSApLmZpbmQoICdbZGF0YS12aWV3XScgKS5lYWNoKCAoIGluZGV4LCBpdGVtICkgPT5cblxuXHRcdFx0JGl0ZW0gPSAkIGl0ZW1cblxuXHRcdFx0dmlld19uYW1lID0gJGl0ZW0uZGF0YSggJ3ZpZXcnIClcblxuXHRcdFx0JGl0ZW0ucmVtb3ZlQXR0ciAnZGF0YS12aWV3J1xuXG5cdFx0XHRpZiB2aWV3X25hbWUuc3Vic3RyaW5nKDAsIDEpIGlzIFwiW1wiXG5cdFx0XHRcdG5hbWVzID0gdmlld19uYW1lLnN1YnN0cmluZygxLCB2aWV3X25hbWUubGVuZ3RoIC0gMSkuc3BsaXQoXCIsXCIpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdG5hbWVzID0gW3ZpZXdfbmFtZV1cblxuXHRcdFx0Zm9yIG5hbWUgaW4gbmFtZXNcblx0XHRcdFx0QF9hZGRfdmlldyAkaXRlbSwgbmFtZVxuXG5cdFx0XHQjIHJlbW92ZSB0aGUgZGF0YS12aWV3IGF0dHJpYnV0ZSwgc28gaXQgd29uJ3QgYmUgaW5zdGFudGlhdGVkIHR3aWNlIVxuXHRcdFx0JGl0ZW0ucmVtb3ZlQXR0ciAnZGF0YS12aWV3J1xuXG5cdFx0KS5wcm9taXNlKCkuZG9uZSA9PiBAZW1pdCBcImJpbmRlZFwiXG5cblx0dW5iaW5kOiAoIHNjb3BlID0gJ2JvZHknICkgLT5cblx0XHQkKCBzY29wZSApLmZpbmQoICdbZGF0YS11aWRdJyApLmVhY2goICggaW5kZXgsIGl0ZW0gKSA9PlxuXG5cdFx0XHQkaXRlbSA9ICQgaXRlbVxuXG5cdFx0XHRpZCA9ICRpdGVtLmRhdGEgJ3VpZCdcblxuXHRcdFx0diA9IHZpZXcuZ2V0X2J5X3VpZCBpZFxuXG5cdFx0XHRpZiB2XG5cdFx0XHRcdHYuZGVzdHJveT8oKVxuXHRcdFx0XHR2aWV3Lm9uX3ZpZXdfZGVzdHJveWVkIGlkXG5cblx0XHQpLnByb21pc2UoKS5kb25lID0+IEBlbWl0IFwidW5iaW5kZWRcIlxuXG5cblxuXHRfYWRkX3ZpZXc6ICggJGl0ZW0sIHZpZXdfbmFtZSApIC0+XG5cblx0XHR0cnlcblx0XHRcdHZpZXcgPSByZXF1aXJlIFwiYXBwL3ZpZXdzLyN7dmlld19uYW1lfVwiXG5cdFx0Y2F0Y2ggZVxuXHRcdFx0Y29uc29sZS53YXJuICdlIC0+JywgZS5tZXNzYWdlXG5cdFx0XHRjb25zb2xlLmVycm9yIFwiYXBwL3ZpZXdzLyN7dmlld30gbm90IGZvdW5kIGZvciBcIiwgJGl0ZW1cblxuXHRcdHZpZXcgPSBuZXcgdmlldyAkaXRlbVxuXG5cdFx0IyBTYXZlIHRoZSB2aWV3IGluIGEgaGFzaCBtb2RlbFxuXHRcdEBoYXNoX21vZGVsWyB2aWV3X25hbWUgXSA/PSBbXVxuXG5cdFx0bCA9IEBoYXNoX21vZGVsWyB2aWV3X25hbWUgXS5sZW5ndGhcblxuXHRcdEBoYXNoX21vZGVsWyB2aWV3X25hbWUgXVsgbCBdID0gdmlld1xuXG5cblx0XHQjIFNhdmUgdGhlIGluY3JlbWVudGFsIHVpZCB0byB0aGUgZG9tIGFuZCB0byB0aGUgaW5zdGFuY2Vcblx0XHR2aWV3LnVpZCA9IFVOSVFVRV9JRFxuXHRcdHZpZXcudmlld19uYW1lID0gdmlld19uYW1lXG5cblx0XHQjIGxvZyBcIlt2aWV3XSBhZGRcIiwgdmlldy51aWQsIHZpZXcudmlld19uYW1lXG5cblx0XHQkaXRlbS5hdHRyICdkYXRhLXVpZCcsIFVOSVFVRV9JRFxuXG5cdFx0IyBTYXZlIHRoZSB2aWV3IGluIGEgbGluZWFyIGFycmF5IG1vZGVsXG5cdFx0QHVpZF9tYXBbIFVOSVFVRV9JRCBdID1cblx0XHRcdG5hbWUgIDogdmlld19uYW1lXG5cdFx0XHRpbmRleCA6IEBoYXNoX21vZGVsWyB2aWV3X25hbWUgXS5sZW5ndGggLSAxXG5cblxuXHRcdFVOSVFVRV9JRCsrXG5cblxuXG5cblx0b25fdmlld19kZXN0cm95ZWQ6ICggdWlkICkgLT5cblx0XHRcblx0XHQjIGxvZyBcIltWaWV3XSBvbl92aWV3X2Rlc3Ryb3llZFwiLCB1aWRcblx0XHRpZiBAdWlkX21hcFsgdWlkIF0/XG5cblx0XHRcdCMgR2V0IHRoZSBkYXRhIGZyb20gdGhlIHVpZCBtYXBcblx0XHRcdG5hbWUgID0gQHVpZF9tYXBbIHVpZCBdLm5hbWVcblx0XHRcdGluZGV4ID0gQHVpZF9tYXBbIHVpZCBdLmluZGV4XG5cblx0XHRcdCMgZGVsZXRlIHRoZSByZWZlcmVuY2UgaW4gdGhlIG1vZGVsXG5cdFx0XHRpZiBAaGFzaF9tb2RlbFsgbmFtZSBdWyBpbmRleCBdP1xuXG5cdFx0XHRcdCMgZGVsZXRlIHRoZSBpdGVtIGZyb20gdGhlIHVpZF9tYXBcblx0XHRcdFx0ZGVsZXRlIEB1aWRfbWFwWyB1aWQgXVxuXG5cdFx0XHRcdCMgRGVsZXRlIHRoZSBpdGVtIGZyb20gdGhlIGhhc2hfbW9kZWxcblx0XHRcdFx0QGhhc2hfbW9kZWxbIG5hbWUgXS5zcGxpY2UgaW5kZXgsIDFcblxuXHRcdFx0XHQjIFVwZGF0ZSB0aGUgaW5kZXggb24gdGhlIHVpZF9tYXAgZm9yIHRoZSB2aWV3cyBsZWZ0IG9mIHRoZSBzYW1lIHR5cGVcblx0XHRcdFx0Zm9yIGl0ZW0sIGkgaW4gQGhhc2hfbW9kZWxbIG5hbWUgXVxuXHRcdFx0XHRcdEB1aWRfbWFwWyBpdGVtLnVpZCBdLmluZGV4ID0gaVxuXG5cblx0XHRcdFx0XG5cblxuXG52aWV3ID0gbmV3IFZpZXdcbmhhcHBlbnMgdmlld1xuXG5tb2R1bGUuZXhwb3J0cyA9IHdpbmRvdy52aWV3ID0gdmlld1xuXG5cbiMgZXhwb3J0aW5nIGdldCBtZXRob2QgZm9yIHdpbmRvdywgc28geW91IGNhbiByZXRyaWV2ZSB2aWV3cyBqdXN0IHdpdGggVmlldyggaWQgKVxud2luZG93LlZpZXcgPSB2aWV3Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsZUFBQTtHQUFBLCtFQUFBOztBQUFBLENBQUEsRUFBVSxJQUFWLEVBQVU7O0FBRUosQ0FGTjtDQUlDLEtBQUEsR0FBQTs7Ozs7O0NBQUE7O0NBQUEsQ0FBQSxDQUFjLE1BQWQ7O0NBR0E7Ozs7Ozs7O0NBSEE7O0NBQUEsQ0FBQSxDQVdjLE9BQWQ7O0NBR0E7Ozs7Ozs7OztDQWRBOztDQUFBLENBQUEsQ0F1QlMsSUFBVDs7Q0F2QkEsQ0E4QkssQ0FBTCxFQUFLLElBQUU7O0dBQVksR0FBUjtNQUNWO0NBQUEsR0FBQSx1QkFBQTtDQUVDLElBQUEsUUFBTztNQUZSO0NBSUMsQ0FBWSxFQUFaLENBQWtCLEtBQU4sQ0FBYjtDQW5DRCxFQThCSzs7Q0E5QkwsRUF1Q1ksTUFBRSxDQUFkO0NBQ0MsT0FBQSxHQUFBO0NBQUEsR0FBQSxxQkFBQTtDQUNDLEVBQU8sQ0FBUCxFQUFBLENBQWlCO0NBQWpCLEVBQ1EsQ0FBQyxDQUFULENBQUEsQ0FBa0I7Q0FFbEIsQ0FBa0IsQ0FBWCxDQUFDLENBQUQsUUFBQTtNQUpSO0NBTUEsSUFBQSxNQUFPO0NBOUNSLEVBdUNZOztDQXZDWixFQWdEWSxLQUFBLENBQUUsQ0FBZDtDQUE2QixHQUFBLENBQVcsR0FBQSxFQUFaLENBQUE7Q0FoRDVCLEVBZ0RZOztDQWhEWixDQW9Ed0IsQ0FBbEIsQ0FBTixDQUFNLElBQUU7Q0FHUCxPQUFBLElBQUE7O0dBSGUsR0FBUjtNQUdQOztHQUgrQixHQUFSO01BR3ZCO0NBQUEsQ0FBZ0QsQ0FBVCxDQUF2QyxDQUFBLElBQXlDLEVBQXpDLEVBQUE7Q0FFQyxTQUFBLDZCQUFBO0NBQUEsRUFBUSxDQUFBLENBQVIsQ0FBQTtDQUFBLEVBRVksQ0FBQSxDQUFLLENBQWpCLEdBQUE7Q0FGQSxJQUlLLENBQUwsSUFBQSxDQUFBO0NBRUEsQ0FBMEIsQ0FBMUIsQ0FBRyxDQUE2QixDQUFoQyxHQUFZO0NBQ1gsQ0FBK0IsQ0FBdkIsRUFBUixDQUErQixFQUEvQixDQUFpQjtNQURsQixFQUFBO0NBR0MsRUFBUSxFQUFSLEdBQUEsQ0FBUTtRQVRUO0FBV0EsQ0FBQSxVQUFBLGlDQUFBOzBCQUFBO0NBQ0MsQ0FBa0IsRUFBbEIsQ0FBQyxHQUFELENBQUE7Q0FERCxNQVhBO0NBZU0sSUFBRCxLQUFMLENBQUEsRUFBQTtDQWpCRCxFQW1CaUIsQ0FuQmpCLENBQXVDLEVBQXZDLEVBbUJpQjtDQUFJLEdBQUQsQ0FBQyxHQUFELEtBQUE7Q0FuQnBCLElBbUJpQjtDQTFFbEIsRUFvRE07O0NBcEROLEVBNEVRLEVBQUEsQ0FBUixHQUFVO0NBQ1QsT0FBQSxJQUFBOztHQURpQixHQUFSO01BQ1Q7Q0FBQSxDQUErQyxDQUFULENBQXRDLENBQUEsSUFBd0MsRUFBeEMsQ0FBQTtDQUVDLFNBQUEsRUFBQTtDQUFBLEVBQVEsQ0FBQSxDQUFSLENBQUE7Q0FBQSxDQUVBLENBQUssQ0FBQSxDQUFLLENBQVY7Q0FGQSxDQUlJLENBQUEsQ0FBSSxFQUFSLElBQUk7Q0FFSixHQUFHLEVBQUg7O0NBQ0UsU0FBRDtVQUFBO0NBQ0ssQ0FBTCxFQUFJLFdBQUosRUFBQTtRQVZvQztDQUF0QyxFQVlpQixDQVpqQixDQUFzQyxFQUF0QyxFQVlpQjtDQUFJLEdBQUQsQ0FBQyxLQUFELEdBQUE7Q0FacEIsSUFZaUI7Q0F6RmxCLEVBNEVROztDQTVFUixDQTZGb0IsQ0FBVCxFQUFBLElBQVg7Q0FFQyxPQUFBLFNBQUE7Q0FBQTtDQUNDLEVBQU8sQ0FBUCxFQUFBLENBQU8sRUFBQSxHQUFTO01BRGpCO0NBR0MsS0FESztDQUNMLENBQXFCLEVBQXJCLEVBQUEsQ0FBTztDQUFQLENBQ2tELENBQXhCLENBQVgsQ0FBZixDQUFBLENBQU8sS0FBUSxLQUFmO01BSkQ7Q0FBQSxFQU1XLENBQVgsQ0FBVzs7Q0FHRSxFQUFlLEVBQWYsSUFBQTtNQVRiO0NBQUEsRUFXSSxDQUFKLEVBWEEsR0FXaUIsQ0FBQTtDQVhqQixFQWFnQyxDQUFoQyxLQUFhLENBQUE7Q0FiYixFQWlCQSxDQUFBLEtBakJBO0NBQUEsRUFrQmlCLENBQWpCLEtBQUE7Q0FsQkEsQ0FzQnVCLEVBQXZCLENBQUssSUFBTCxDQUFBO0NBdEJBLEVBMEJDLENBREQsR0FBVSxFQUFBO0NBQ1QsQ0FBUSxFQUFSLEVBQUEsR0FBQTtDQUFBLENBQ1EsQ0FBa0MsQ0FBakMsQ0FBVCxDQUFBLEdBQXFCLENBQUE7Q0EzQnRCLEtBQUE7QUE4QkEsQ0FoQ1UsUUFnQ1YsRUFBQTtDQTdIRCxFQTZGVzs7Q0E3RlgsRUFrSW1CLE1BQUUsUUFBckI7Q0FHQyxPQUFBLHNDQUFBO0NBQUEsR0FBQSxxQkFBQTtDQUdDLEVBQVEsQ0FBUixFQUFBLENBQWtCO0NBQWxCLEVBQ1EsQ0FBQyxDQUFULENBQUEsQ0FBa0I7Q0FHbEIsR0FBRyxFQUFILDhCQUFBO0FBR0MsQ0FBQSxFQUFpQixDQUFULEVBQVIsQ0FBaUIsQ0FBakI7Q0FBQSxDQUdrQyxFQUFqQyxDQUFELENBQUEsRUFBQSxFQUFhO0NBR2I7Q0FBQTtjQUFBLHFDQUFBOzBCQUFBO0NBQ0MsRUFBVSxDQUFULENBQUQsRUFBVTtDQURYO3lCQVREO1FBUEQ7TUFIa0I7Q0FsSW5CLEVBa0ltQjs7Q0FsSW5COztDQUpEOztBQWlLQSxDQWpLQSxFQWlLTyxDQUFQOztBQUNBLENBbEtBLEdBa0tBLEdBQUE7O0FBRUEsQ0FwS0EsRUFvS2lCLENBQUEsRUFBWCxDQUFOOztBQUlBLENBeEtBLEVBd0tjLENBQWQsRUFBTSJ9fSx7Im9mZnNldCI6eyJsaW5lIjo1NjU5LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvY29udHJvbGxlcnMvd2luZG93LmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJoYXBwZW5zID0gcmVxdWlyZSAnaGFwcGVucydcblxuIyBjcmVhdGUgYW5kIGV4cG9ydCBhIG5ldyBoYXBwZW5zIG9iamVjdFxubW9kdWxlLmV4cG9ydHMgPSBoYXBwZW5zKCB3aW4gPSB7fSApXG5cbiMgZXZlbnQgaGFuZGxpbmcgZm9yIHdpbmRvdyByZXNpemVcbndpbi5vYmogPSAkIHdpbmRvd1xud2luLm9iai5vbiAncmVzaXplJywgb25fcmVzaXplID0gLT5cblx0d2luLncgPSB3aW4ub2JqLndpZHRoKClcblx0d2luLmggPSB3aW4ub2JqLmhlaWdodCgpXG5cdHdpbi5lbWl0ICdyZXNpemUnXG5cbiMgdHJpZ2dlciByZXNpemUgYXV0b21hdGljYWxseSBhZnRlciAxMDAgbXNcbmRlbGF5IDEwMCwgb25fcmVzaXplXG5cbiMgZ2xvYmFsIGNsaWNrIGV2ZW50XG4kKCAnaHRtbCxib2R5JyApLm9uICdjbGljaycsIC0+IHdpbi5lbWl0IFwiYm9keTpjbGlja2VkXCIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxtQkFBQTs7QUFBQSxDQUFBLEVBQVUsSUFBVixFQUFVOztBQUdWLENBSEEsQ0FHaUIsQ0FBQSxHQUFYLENBQU47O0FBR0EsQ0FOQSxFQU1HLEdBQU87O0FBQ1YsQ0FQQSxDQU9BLENBQUcsS0FBSCxDQUFxQjtDQUNwQixDQUFBLENBQUcsRUFBSztDQUFSLENBQ0EsQ0FBRyxHQUFLO0NBQ0osRUFBRCxDQUFILElBQUEsQ0FBQTtDQUhnQzs7QUFNakMsQ0FiQSxDQWFXLENBQVgsRUFBQSxJQUFBOztBQUdBLENBaEJBLENBZ0JBLENBQTZCLElBQTdCLEVBQTZCLEVBQTdCO0NBQW9DLEVBQUQsQ0FBSCxLQUFBLEtBQUE7Q0FBSCJ9fSx7Im9mZnNldCI6eyJsaW5lIjo1NjgxLCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvZ2xvYmFscy5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4jIG9uIHRoZSBicm93c2VyLCB3aW5kb3cgaXMgdGhlIGdsb2JhbCBob2xkZXJcbiMjI1xuXG4jIHV0aWxzXG5cbndpbmRvdy5kZWxheSA9IHJlcXVpcmUgJy4vZ2xvYmFscy9kZWxheSdcblxud2luZG93LmludGVydmFsICA9IHJlcXVpcmUgJy4vZ2xvYmFscy9pbnRlcnZhbCdcblxud2luZG93LmxvZyAgID0gcmVxdWlyZSAnLi9nbG9iYWxzL2xvZydcblxud2luZG93Lm1vdmVyID0gcmVxdWlyZSAnLi9nbG9iYWxzL21vdmVyJ1xuXG4jIHdpZGVseSB1c2VkIG1vZHVsZXNcblxud2luZG93LmhhcHBlbnMgPSByZXF1aXJlICdoYXBwZW5zJ1xuXG5cbm1vZHVsZS5leHBvcnRzID0gd2luZG93Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Q0FBQTtBQU1BLENBTkEsRUFNZSxFQUFmLENBQU0sQ0FBUyxVQUFBOztBQUVmLENBUkEsRUFRbUIsR0FBYixDQUFhLENBQW5CLFlBQW1COztBQUVuQixDQVZBLEVBVUEsR0FBTSxDQUFTLFFBQUE7O0FBRWYsQ0FaQSxFQVllLEVBQWYsQ0FBTSxDQUFTLFVBQUE7O0FBSWYsQ0FoQkEsRUFnQmlCLEdBQVgsQ0FBTixFQUFpQjs7QUFHakIsQ0FuQkEsRUFtQmlCLEdBQVgsQ0FBTiJ9fSx7Im9mZnNldCI6eyJsaW5lIjo1Njk5LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvZ2xvYmFscy9kZWxheS5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSAoIGRlbGF5LCBmdW5rICkgLT4gc2V0VGltZW91dCBmdW5rLCBkZWxheSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxDQUFPLENBQW1CLENBQVQsQ0FBQSxDQUFBLENBQVgsQ0FBTixFQUFtQjtDQUE0QixDQUFNLEVBQWpCLENBQUEsSUFBQSxDQUFBO0NBQW5CIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjU3MDUsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy9nbG9iYWxzL2ludGVydmFsLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9ICggaW50ZXJ2YWwsIGZ1bmsgKSAtPiBzZXRJbnRlcnZhbCBmdW5rLCBpbnRlcnZhbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxDQUFPLENBQXNCLENBQVosQ0FBQSxFQUFYLENBQU4sQ0FBaUIsQ0FBRTtDQUFnQyxDQUFNLEVBQWxCLElBQUEsQ0FBQSxFQUFBO0NBQXRCIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjU3MTEsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy9nbG9iYWxzL2xvZy5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSAtPlxuXHRsb2cuaGlzdG9yeSA9IGxvZy5oaXN0b3J5IG9yIFtdICMgc3RvcmUgbG9ncyB0byBhbiBhcnJheSBmb3IgcmVmZXJlbmNlXG5cdGxvZy5oaXN0b3J5LnB1c2ggYXJndW1lbnRzXG5cblx0aWYgY29uc29sZT9cblx0XHRjb25zb2xlLmxvZyBBcnJheTo6c2xpY2UuY2FsbChhcmd1bWVudHMpIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLENBQU8sRUFBVSxHQUFYLENBQU4sRUFBaUI7Q0FDaEIsQ0FBQSxDQUFHLENBQTBCLEdBQTdCO0NBQUEsQ0FDQSxDQUFHLENBQUgsR0FBVyxFQUFYO0NBRUEsQ0FBQSxFQUFHLDhDQUFIO0NBQ1MsRUFBUixDQUFZLENBQUssRUFBVixFQUFZLEVBQW5CO0lBTGU7Q0FBQSJ9fSx7Im9mZnNldCI6eyJsaW5lIjo1NzIxLCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvZ2xvYmFscy9tb3Zlci5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSBcblx0c2Nyb2xsX3RvIDogKGVsLCB3aXRoX3RvcGJhciA9IGZhbHNlLCBzcGVlZCA9IDMwMCkgLT5cblxuXHRcdHkgPSBlbC5wb3NpdGlvbigpLnRvcFxuXG5cdFx0bG9nIFwiW01vdmVyXSBzY3JvbGxfdG9cIiwgeVxuXHRcdEBzY3JvbGxfdG9feSB5LCB3aXRoX3RvcGJhciwgc3BlZWRcblx0XHRcblxuXHRzY3JvbGxfdG9feTogKHksIHdpdGhfdG9wYmFyID0gdHJ1ZSwgc3BlZWQgPSAzMDApIC0+XG5cdFx0aWYgd2l0aF90b3BiYXJcblx0XHRcdHkgLT0gYXBwLnNldHRpbmdzLmhlYWRlcl9oZWlnaHRcblxuXHRcdGxvZyBcIlttb3Zlcl0gc2Nyb2xsX3RvX3lcIiwgeVxuXHRcdFxuXHRcdCQoICdodG1sLCBib2R5JyApLmFuaW1hdGUgc2Nyb2xsVG9wOiB5LCBzcGVlZCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxDQUFPLEVBQ04sR0FESyxDQUFOO0NBQ0MsQ0FBQSxDQUFZLEVBQUEsSUFBWixFQUFZO0NBRVgsT0FBQTs7R0FGOEIsR0FBZDtNQUVoQjs7R0FGNkMsR0FBUjtNQUVyQztDQUFBLENBQU0sQ0FBRixDQUFKLElBQUk7Q0FBSixDQUV5QixDQUF6QixDQUFBLGVBQUE7Q0FDQyxDQUFlLEVBQWYsQ0FBRCxNQUFBO0NBTEQsRUFBWTtDQUFaLENBUUEsQ0FBYSxFQUFBLElBQUMsRUFBZDs7R0FBK0IsR0FBZDtNQUNoQjs7R0FENEMsR0FBUjtNQUNwQztDQUFBLEdBQUEsT0FBQTtDQUNDLEVBQVEsQ0FBSCxFQUFMLEVBQWlCLEtBQWpCO01BREQ7Q0FBQSxDQUcyQixDQUEzQixDQUFBLGlCQUFBO0NBRUEsTUFBQSxJQUFBLENBQUE7Q0FBMEIsQ0FBVyxJQUFYLEdBQUE7Q0FOZCxDQU00QixHQUF4QyxDQUFBO0NBZEQsRUFRYTtDQVRkLENBQUEifX0seyJvZmZzZXQiOnsibGluZSI6NTc1MywiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3V0aWxzL2Jyb3dzZXIuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIkJyb3dzZXJEZXRlY3QgPVxuXHRpbml0OiAoICkgLT5cblx0XHRAYnJvd3NlciA9IEBzZWFyY2hTdHJpbmcoQGRhdGFCcm93c2VyKSBvciBcIkFuIHVua25vd24gYnJvd3NlclwiXG5cdFx0QHZlcnNpb24gPSBAc2VhcmNoVmVyc2lvbihuYXZpZ2F0b3IudXNlckFnZW50KSBvciBAc2VhcmNoVmVyc2lvbihuYXZpZ2F0b3IuYXBwVmVyc2lvbikgb3IgXCJhbiB1bmtub3duIHZlcnNpb25cIlxuXHRcdEBPUyA9IEBzZWFyY2hTdHJpbmcoQGRhdGFPUykgb3IgXCJhbiB1bmtub3duIE9TXCJcblxuXHRzZWFyY2hTdHJpbmc6IChkYXRhKSAtPlxuXHRcdGkgPSAwXG5cblx0XHR3aGlsZSBpIDwgZGF0YS5sZW5ndGhcblx0XHRcdGRhdGFTdHJpbmcgPSBkYXRhW2ldLnN0cmluZ1xuXHRcdFx0ZGF0YVByb3AgPSBkYXRhW2ldLnByb3Bcblx0XHRcdEB2ZXJzaW9uU2VhcmNoU3RyaW5nID0gZGF0YVtpXS52ZXJzaW9uU2VhcmNoIG9yIGRhdGFbaV0uaWRlbnRpdHlcblx0XHRcdGlmIGRhdGFTdHJpbmdcblx0XHRcdFx0cmV0dXJuIGRhdGFbaV0uaWRlbnRpdHkgIHVubGVzcyBkYXRhU3RyaW5nLmluZGV4T2YoZGF0YVtpXS5zdWJTdHJpbmcpIGlzIC0xXG5cdFx0XHRlbHNlIHJldHVybiBkYXRhW2ldLmlkZW50aXR5ICBpZiBkYXRhUHJvcFxuXHRcdFx0aSsrXG5cdFx0cmV0dXJuXG5cblx0c2VhcmNoVmVyc2lvbjogKGRhdGFTdHJpbmcpIC0+XG5cdFx0aW5kZXggPSBkYXRhU3RyaW5nLmluZGV4T2YoQHZlcnNpb25TZWFyY2hTdHJpbmcpXG5cdFx0cmV0dXJuICBpZiBpbmRleCBpcyAtMVxuXHRcdHBhcnNlRmxvYXQgZGF0YVN0cmluZy5zdWJzdHJpbmcoaW5kZXggKyBAdmVyc2lvblNlYXJjaFN0cmluZy5sZW5ndGggKyAxKVxuXG5cdGRhdGFCcm93c2VyOiBbXG5cdFx0e1xuXHRcdFx0c3RyaW5nOiBuYXZpZ2F0b3IudXNlckFnZW50XG5cdFx0XHRzdWJTdHJpbmc6IFwiQ2hyb21lXCJcblx0XHRcdGlkZW50aXR5OiBcIkNocm9tZVwiXG5cdFx0fVxuXHRcdHtcblx0XHRcdHN0cmluZzogbmF2aWdhdG9yLnVzZXJBZ2VudFxuXHRcdFx0c3ViU3RyaW5nOiBcIk9tbmlXZWJcIlxuXHRcdFx0dmVyc2lvblNlYXJjaDogXCJPbW5pV2ViL1wiXG5cdFx0XHRpZGVudGl0eTogXCJPbW5pV2ViXCJcblx0XHR9XG5cdFx0e1xuXHRcdFx0c3RyaW5nOiBuYXZpZ2F0b3IudmVuZG9yXG5cdFx0XHRzdWJTdHJpbmc6IFwiQXBwbGVcIlxuXHRcdFx0aWRlbnRpdHk6IFwiU2FmYXJpXCJcblx0XHRcdHZlcnNpb25TZWFyY2g6IFwiVmVyc2lvblwiXG5cdFx0fVxuXHRcdHtcblx0XHRcdHByb3A6IHdpbmRvdy5vcGVyYVxuXHRcdFx0aWRlbnRpdHk6IFwiT3BlcmFcIlxuXHRcdFx0dmVyc2lvblNlYXJjaDogXCJWZXJzaW9uXCJcblx0XHR9XG5cdFx0e1xuXHRcdFx0c3RyaW5nOiBuYXZpZ2F0b3IudmVuZG9yXG5cdFx0XHRzdWJTdHJpbmc6IFwiaUNhYlwiXG5cdFx0XHRpZGVudGl0eTogXCJpQ2FiXCJcblx0XHR9XG5cdFx0e1xuXHRcdFx0c3RyaW5nOiBuYXZpZ2F0b3IudmVuZG9yXG5cdFx0XHRzdWJTdHJpbmc6IFwiS0RFXCJcblx0XHRcdGlkZW50aXR5OiBcIktvbnF1ZXJvclwiXG5cdFx0fVxuXHRcdHtcblx0XHRcdHN0cmluZzogbmF2aWdhdG9yLnVzZXJBZ2VudFxuXHRcdFx0c3ViU3RyaW5nOiBcIkZpcmVmb3hcIlxuXHRcdFx0aWRlbnRpdHk6IFwiRmlyZWZveFwiXG5cdFx0fVxuXHRcdHtcblx0XHRcdHN0cmluZzogbmF2aWdhdG9yLnZlbmRvclxuXHRcdFx0c3ViU3RyaW5nOiBcIkNhbWlub1wiXG5cdFx0XHRpZGVudGl0eTogXCJDYW1pbm9cIlxuXHRcdH1cblx0XHR7XG5cdFx0XHQjIGZvciBuZXdlciBOZXRzY2FwZXMgKDYrKVxuXHRcdFx0c3RyaW5nOiBuYXZpZ2F0b3IudXNlckFnZW50XG5cdFx0XHRzdWJTdHJpbmc6IFwiTmV0c2NhcGVcIlxuXHRcdFx0aWRlbnRpdHk6IFwiTmV0c2NhcGVcIlxuXHRcdH1cblx0XHR7XG5cdFx0XHRzdHJpbmc6IG5hdmlnYXRvci51c2VyQWdlbnRcblx0XHRcdHN1YlN0cmluZzogXCJNU0lFXCJcblx0XHRcdGlkZW50aXR5OiBcIkV4cGxvcmVyXCJcblx0XHRcdHZlcnNpb25TZWFyY2g6IFwiTVNJRVwiXG5cdFx0fVxuXHRcdHtcblx0XHRcdHN0cmluZzogbmF2aWdhdG9yLnVzZXJBZ2VudFxuXHRcdFx0c3ViU3RyaW5nOiBcIkdlY2tvXCJcblx0XHRcdGlkZW50aXR5OiBcIk1vemlsbGFcIlxuXHRcdFx0dmVyc2lvblNlYXJjaDogXCJydlwiXG5cdFx0fVxuXHRcdHtcblx0XHRcdCMgZm9yIG9sZGVyIE5ldHNjYXBlcyAoNC0pXG5cdFx0XHRzdHJpbmc6IG5hdmlnYXRvci51c2VyQWdlbnRcblx0XHRcdHN1YlN0cmluZzogXCJNb3ppbGxhXCJcblx0XHRcdGlkZW50aXR5OiBcIk5ldHNjYXBlXCJcblx0XHRcdHZlcnNpb25TZWFyY2g6IFwiTW96aWxsYVwiXG5cdFx0fVxuXHRdXG5cdGRhdGFPUzogW1xuXHRcdHtcblx0XHRcdHN0cmluZzogbmF2aWdhdG9yLnBsYXRmb3JtXG5cdFx0XHRzdWJTdHJpbmc6IFwiV2luXCJcblx0XHRcdGlkZW50aXR5OiBcIldpbmRvd3NcIlxuXHRcdH1cblx0XHR7XG5cdFx0XHRzdHJpbmc6IG5hdmlnYXRvci5wbGF0Zm9ybVxuXHRcdFx0c3ViU3RyaW5nOiBcIk1hY1wiXG5cdFx0XHRpZGVudGl0eTogXCJNYWNcIlxuXHRcdH1cblx0XHR7XG5cdFx0XHRzdHJpbmc6IG5hdmlnYXRvci51c2VyQWdlbnRcblx0XHRcdHN1YlN0cmluZzogXCJpUGhvbmVcIlxuXHRcdFx0aWRlbnRpdHk6IFwiaVBob25lL2lQb2RcIlxuXHRcdH1cblx0XHR7XG5cdFx0XHRzdHJpbmc6IG5hdmlnYXRvci5wbGF0Zm9ybVxuXHRcdFx0c3ViU3RyaW5nOiBcIkxpbnV4XCJcblx0XHRcdGlkZW50aXR5OiBcIkxpbnV4XCJcblx0XHR9XG5cdF1cblxuQnJvd3NlckRldGVjdC5pbml0KClcblxubW9kdWxlLmV4cG9ydHMgPSBCcm93c2VyRGV0ZWN0Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsU0FBQTs7QUFBQSxDQUFBLEVBQ0MsVUFERDtDQUNDLENBQUEsQ0FBTSxDQUFOLEtBQU07Q0FDTCxFQUFXLENBQVgsR0FBQSxJQUFXLENBQUEsUUFBWDtDQUFBLEVBQ1csQ0FBWCxHQUFBLEVBQW1DLENBQWUsR0FBdkMsT0FEWDtDQUVDLENBQUQsQ0FBTSxDQUFMLEVBQUssS0FBTixDQUFNO0NBSFAsRUFBTTtDQUFOLENBS0EsQ0FBYyxDQUFBLEtBQUMsR0FBZjtDQUNDLE9BQUEsZUFBQTtDQUFBLEVBQUksQ0FBSjtDQUVBLEVBQVUsQ0FBSSxFQUFkLEtBQU07Q0FDTCxFQUFhLENBQUssRUFBbEIsSUFBQTtDQUFBLEVBQ1csQ0FBSyxFQUFoQixFQUFBO0NBREEsRUFFdUIsQ0FBdEIsRUFBRCxFQUZBLEtBRXVCLE1BQXZCO0NBQ0EsR0FBRyxFQUFILElBQUE7QUFDMkUsQ0FBMUUsR0FBZ0MsQ0FBeUMsRUFBekMsQ0FBaEMsQ0FBZ0MsQ0FBVTtDQUExQyxHQUFZLElBQVosU0FBTztVQURSO01BQUEsRUFBQTtDQUVLLEdBQTRCLElBQTVCO0NBQUEsR0FBWSxJQUFaLFNBQU87VUFGWjtRQUhBO0FBTUEsQ0FOQSxDQUFBLElBTUE7Q0FWWSxJQUdiO0NBUkQsRUFLYztDQUxkLENBa0JBLENBQWUsTUFBQyxDQUFELEdBQWY7Q0FDQyxJQUFBLEdBQUE7Q0FBQSxFQUFRLENBQVIsQ0FBQSxFQUFRLEdBQVUsU0FBVjtBQUNhLENBQXJCLEdBQUEsQ0FBVztDQUFYLFdBQUE7TUFEQTtDQUVXLEVBQTZCLENBQUMsQ0FBVCxDQUFBLEdBQXJCLENBQVgsQ0FBQSxRQUE0RDtDQXJCN0QsRUFrQmU7Q0FsQmYsQ0F1QkEsU0FBQTtLQUNDO0NBQUEsQ0FDUyxJQUFSLEdBQWlCO0NBRGxCLENBRVksSUFBWCxFQUZELENBRUM7Q0FGRCxDQUdXLElBQVYsRUFBQTtFQUVELElBTlk7Q0FNWixDQUNTLElBQVIsR0FBaUI7Q0FEbEIsQ0FFWSxJQUFYLEdBQUE7Q0FGRCxDQUdnQixJQUFmLElBSEQsR0FHQztDQUhELENBSVcsSUFBVixFQUFBLENBSkQ7RUFNQSxJQVpZO0NBWVosQ0FDUyxJQUFSLEdBQWlCO0NBRGxCLENBRVksSUFBWCxDQUZELEVBRUM7Q0FGRCxDQUdXLElBQVYsRUFBQTtDQUhELENBSWdCLElBQWYsR0FKRCxJQUlDO0VBRUQsSUFsQlk7Q0FrQlosQ0FDTyxFQUFOLENBREQsQ0FDQztDQURELENBRVcsSUFBVixDQUZELENBRUM7Q0FGRCxDQUdnQixJQUFmLEdBSEQsSUFHQztFQUVELElBdkJZO0NBdUJaLENBQ1MsSUFBUixHQUFpQjtDQURsQixDQUVZLElBQVgsR0FBQTtDQUZELENBR1csSUFBVixFQUFBO0VBRUQsSUE1Qlk7Q0E0QlosQ0FDUyxJQUFSLEdBQWlCO0NBRGxCLENBRVksR0FGWixDQUVDLEdBQUE7Q0FGRCxDQUdXLElBQVYsRUFBQSxHQUhEO0VBS0EsSUFqQ1k7Q0FpQ1osQ0FDUyxJQUFSLEdBQWlCO0NBRGxCLENBRVksSUFBWCxHQUFBO0NBRkQsQ0FHVyxJQUFWLEVBQUEsQ0FIRDtFQUtBLElBdENZO0NBc0NaLENBQ1MsSUFBUixHQUFpQjtDQURsQixDQUVZLElBQVgsRUFGRCxDQUVDO0NBRkQsQ0FHVyxJQUFWLEVBQUE7RUFFRCxJQTNDWTtDQTJDWixDQUVTLElBQVIsR0FBaUI7Q0FGbEIsQ0FHWSxJQUFYLEdBQUEsQ0FIRDtDQUFBLENBSVcsSUFBVixFQUFBLEVBSkQ7RUFNQSxJQWpEWTtDQWlEWixDQUNTLElBQVIsR0FBaUI7Q0FEbEIsQ0FFWSxJQUFYLEdBQUE7Q0FGRCxDQUdXLElBQVYsRUFBQSxFQUhEO0NBQUEsQ0FJZ0IsSUFBZixPQUFBO0VBRUQsSUF2RFk7Q0F1RFosQ0FDUyxJQUFSLEdBQWlCO0NBRGxCLENBRVksSUFBWCxDQUZELEVBRUM7Q0FGRCxDQUdXLElBQVYsRUFBQSxDQUhEO0NBQUEsQ0FJZ0IsRUFKaEIsRUFJQyxPQUFBO0VBRUQsSUE3RFk7Q0E2RFosQ0FFUyxJQUFSLEdBQWlCO0NBRmxCLENBR1ksSUFBWCxHQUFBO0NBSEQsQ0FJVyxJQUFWLEVBQUEsRUFKRDtDQUFBLENBS2dCLElBQWYsR0FMRCxJQUtDO01BbEVXO0lBdkJiO0NBQUEsQ0E0RkEsSUFBQTtLQUNDO0NBQUEsQ0FDUyxJQUFSLEVBREQsQ0FDa0I7Q0FEbEIsQ0FFWSxHQUZaLENBRUMsR0FBQTtDQUZELENBR1csSUFBVixFQUFBLENBSEQ7RUFLQSxJQU5PO0NBTVAsQ0FDUyxJQUFSLEVBREQsQ0FDa0I7Q0FEbEIsQ0FFWSxHQUZaLENBRUMsR0FBQTtDQUZELENBR1csR0FIWCxDQUdDLEVBQUE7RUFFRCxJQVhPO0NBV1AsQ0FDUyxJQUFSLEdBQWlCO0NBRGxCLENBRVksSUFBWCxFQUZELENBRUM7Q0FGRCxDQUdXLElBQVYsRUFBQSxLQUhEO0VBS0EsSUFoQk87Q0FnQlAsQ0FDUyxJQUFSLEVBREQsQ0FDa0I7Q0FEbEIsQ0FFWSxJQUFYLENBRkQsRUFFQztDQUZELENBR1csSUFBVixDQUhELENBR0M7TUFuQk07SUE1RlI7Q0FERCxDQUFBOztBQW9IQSxDQXBIQSxHQW9IQSxTQUFhOztBQUViLENBdEhBLEVBc0hpQixHQUFYLENBQU4sTUF0SEEifX0seyJvZmZzZXQiOnsibGluZSI6NTg3MSwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3V0aWxzL29wYWNpdHkuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIk9wYWNpdHkgPSBcblx0c2hvdzogKGVsLCB0aW1lID0gNTAwKSAtPlxuXHRcdCMgbG9nIFwiW09wYWNpdHldIHNob3dcIlxuXHRcdGVsLmZhZGVJbiB0aW1lXG5cdFx0IyB0ID0gT3BhY2l0eS5nZXRfdGltZSggdGltZSApXG5cdFx0IyBlbC5jc3MgXG5cdFx0IyBcdCd2aXNpYmlsaXR5JyA6IFwidmlzaWJsZVwiXG5cdFx0IyBcdCd0cmFuc2l0aW9uJyA6IFwib3BhY2l0eSAje3R9IGxpbmVhclwiXG5cblx0XHQjIGRlbGF5IDEsIC0+XG5cdFx0IyBcdGVsLmNzcyAnb3BhY2l0eScsIDFcblxuXHRoaWRlOiAoIGVsLCB0aW1lID0gNTAwICkgLT5cblx0XHQjIGxvZyBcIltPcGFjaXR5XSBoaWRlXCJcblx0XHRlbC5mYWRlT3V0IHRpbWVcblxuXHRcdCMgdCA9IE9wYWNpdHkuZ2V0X3RpbWUgdGltZVxuXHRcdCMgdDEgPSBPcGFjaXR5LmdldF90aW1lKCB0aW1lICsgMTAwIClcblxuXHRcdCMgZWwuY3NzICd0cmFuc2l0aW9uJywgXCJvcGFjaXR5ICN7dH0gbGluZWFyXCJcblx0XHQjIGRlbGF5IDEsIC0+IGVsLmNzcyAnb3BhY2l0eScsIDBcblx0XHQjIGRlbGF5IHQxLCAtPiBlbC5jc3MgJ3Zpc2liaWxpdHknLCAnaGlkZGVuJ1xuXG5cdGdldF90aW1lOiAoIHRpbWUgKSAtPlxuXHRcdHJldHVybiAodGltZS8xMDAwKSArIFwic1wiXG5cbm1vZHVsZS5leHBvcnRzID0gT3BhY2l0eSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLEdBQUE7O0FBQUEsQ0FBQSxFQUNDLElBREQ7Q0FDQyxDQUFBLENBQU0sQ0FBTixLQUFPOztHQUFXLEdBQVA7TUFFVjtDQUFHLENBQUQsRUFBRixFQUFBLEtBQUE7Q0FGRCxFQUFNO0NBQU4sQ0FXQSxDQUFNLENBQU4sS0FBUTs7R0FBVyxHQUFQO01BRVg7Q0FBRyxDQUFELEVBQUYsR0FBQSxJQUFBO0NBYkQsRUFXTTtDQVhOLENBc0JBLENBQVUsQ0FBQSxJQUFWLENBQVk7Q0FDWCxFQUFhLENBQUwsT0FBRDtDQXZCUixFQXNCVTtDQXZCWCxDQUFBOztBQTBCQSxDQTFCQSxFQTBCaUIsR0FBWCxDQUFOIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjU4OTUsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy91dGlscy9wcmVsb2FkLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IChpbWFnZXMsIGNhbGxiYWNrKSAtPlxuXG5cdGNvdW50ID0gMFxuXHRpbWFnZXNfbG9hZGVkID0gW11cblxuXHRsb2FkID0gKCBzcmMsIGNhbGxiYWNrICkgLT5cblx0XHRcdFxuXHRcdGltZyA9IG5ldyBJbWFnZSgpXG5cdFx0aW1nLm9ubG9hZCA9IGNhbGxiYWNrXG5cdFx0aW1nLnNyYyA9IHNyY1xuXG5cdFx0aW1hZ2VzX2xvYWRlZC5wdXNoIGltZ1xuXG5cdGxvYWRlZCA9IC0+XG5cdFx0Y291bnQrK1xuXHRcdGxvZyBcIltQcmVsb2FkZXJdIGxvYWRfbXVsdGlwbGUgLSBsb2FkZWRcIiwgXCIje2NvdW50fSAvICN7aW1hZ2VzLmxlbmd0aH1cIlxuXG5cdFx0aWYgY291bnQgaXMgaW1hZ2VzLmxlbmd0aFxuXHRcdFx0bG9nIFwiW1ByZWxvYWRlcl0gbG9hZF9tdWx0aXBsZSAtIGxvYWRlZCBBTExcIlxuXHRcdFx0Y2FsbGJhY2soIGltYWdlc19sb2FkZWQgKVxuXG5cdGZvciBpdGVtIGluIGltYWdlc1xuXHRcdGxvYWQgaXRlbSwgbG9hZGVkXG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsQ0FBTyxDQUFtQixDQUFULEdBQVgsQ0FBTixDQUFpQixDQUFDO0NBRWpCLEtBQUEsc0RBQUE7Q0FBQSxDQUFBLENBQVEsRUFBUjtDQUFBLENBQ0EsQ0FBZ0IsVUFBaEI7Q0FEQSxDQUdBLENBQU8sQ0FBUCxJQUFPLENBQUU7Q0FFUixFQUFBLEtBQUE7Q0FBQSxFQUFBLENBQUEsQ0FBVTtDQUFWLEVBQ0csQ0FBSCxFQUFBLEVBREE7Q0FBQSxFQUVHLENBQUg7Q0FFYyxFQUFkLENBQUEsT0FBQSxFQUFhO0NBVGQsRUFHTztDQUhQLENBV0EsQ0FBUyxHQUFULEdBQVM7QUFDUixDQUFBLENBQUEsRUFBQSxDQUFBO0NBQUEsQ0FDMEMsQ0FBMUMsQ0FBQSxDQUEwQyxDQUFtQiw4QkFBN0Q7Q0FFQSxHQUFBLENBQUcsQ0FBZTtDQUNqQixFQUFBLEdBQUEsa0NBQUE7Q0FDVSxPQUFWLEtBQUE7TUFOTztDQVhULEVBV1M7QUFRVCxDQUFBO1FBQUEscUNBQUE7dUJBQUE7Q0FDQyxDQUFXLEVBQVgsRUFBQTtDQUREO21CQXJCZ0I7Q0FBQSJ9fSx7Im9mZnNldCI6eyJsaW5lIjo1OTI0LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdXRpbHMvc2V0dGluZ3MuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIkJyb3dzZXJEZXRlY3QgPSByZXF1aXJlICdhcHAvdXRpbHMvYnJvd3Nlcidcblxuc2V0dGluZ3MgPSBcblxuXHQjIEJyb3dzZXIgaWQsIHZlcnNpb24sIE9TXG5cdGJyb3dzZXI6IHtcblxuXHRcdCMgSUQgW1N0cmluZ11cblx0XHRpZDogQnJvd3NlckRldGVjdC5icm93c2VyXG5cblx0XHQjIFZlcnNpb24gW1N0cmluZ11cblx0XHR2ZXJzaW9uOiBCcm93c2VyRGV0ZWN0LnZlcnNpb25cblx0XHRcblx0XHQjIE9TIFtTdHJpbmddXG5cdFx0T1M6IEJyb3dzZXJEZXRlY3QuT1Ncblx0XHRcblx0XHQjIElzIENocm9tZT8gW0Jvb2xlYW5dXG5cdFx0Y2hyb21lOiAobmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpLmluZGV4T2YoICdjaHJvbWUnICkgPiAtMSlcblxuXHRcdCMgSXMgRmlyZWZveCBbQm9vbGVhbl1cblx0XHRmaXJlZm94OiAoL0ZpcmVmb3gvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpKVxuXG5cdFx0IyBJcyBJRTg/IFtCb29sZWFuXVxuXHRcdGllODogZmFsc2VcblxuXHRcdCMgRGV2aWNlIHJhdGlvIFtOdW1iZXJdXG5cdFx0ZGV2aWNlX3JhdGlvOiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpb1xuXG5cdFx0IyBJcyBhIGhhbmRoZWxkIGRldmljZT8gW0Jvb2xlYW5dXG5cdFx0aGFuZGhlbGQ6IGZhbHNlXG5cblx0XHQjIElzIGEgdGFibGV0PyBbQm9vbGVhbl1cblx0XHR0YWJsZXQ6IGZhbHNlXG5cdFx0XG5cdFx0IyBJcyBhIG1vYmlsZT8gW0Jvb2xlYW5dXG5cdFx0bW9iaWxlOiBmYWxzZVxuXG5cdFx0IyBJcyBkZXNrdG9wPyBTZXQgYWZ0ZXIgdGhlIGNsYXNzIGRlZmluaXRpb24gW0Jvb2xlYW5dXG5cdFx0ZGVza3RvcDogZmFsc2VcblxuXHRcdCMgSXMgYSB0YWJsZXQgb3IgbW9iaWxlPyBbQm9vbGVhbl1cblx0XHRkZXZpY2U6IGZhbHNlXG5cblx0XHQjIERlYnVnIG1vZGUgLSBzZXQgYnkgZW52IGluIGluZGV4LnBocFxuXHRcdGRlYnVnOiBmYWxzZVxuXG5cdFx0Y3NzX2NvdmVyX3N1cHBvcnRlZDogTW9kZXJuaXpyLmJhY2tncm91bmRzaXplXG5cblx0XHRtaW5fc2l6ZTpcblx0XHRcdHc6IDkwMFxuXHRcdFx0aDogNDAwXG5cdH1cblxuXHQjIFVzZSB0aGlzIGZsYWcgaWYgd2VyZSBkb2luZyBrZXlmcmFtZSBhbmltYXRpb25zXG5cdCMgb3RoZXJ3aXNlIGltcGxlbWVudCBhIGpzIGZhbGxiYWNrXG5cblx0IyBXZWJwIHN1cHBvcnRcblx0d2VicDogZmFsc2Vcblxuc2V0dGluZ3MudGhlbWUgPSBcImRlc2t0b3BcIlxuc2V0dGluZ3MudGhyZXNob2xkX3RoZW1lID0gOTAwXG5cblxuIyBSZXRpbmEgc3VwcG9ydGVkIFtCb29sZWFuXVxuc2V0dGluZ3MuYnJvd3Nlci5yZXRpbmEgPSBzZXR0aW5ncy5icm93c2VyLmRldmljZV9yYXRpbyBpcyAyXG5cbiMgV2VicCB0ZXN0XG5pZiBzZXR0aW5ncy5icm93c2VyLmNocm9tZSBhbmQgc2V0dGluZ3MuYnJvd3Nlci52ZXJzaW9uID49IDMwXG5cdHNldHRpbmdzLndlYnAgPSB0cnVlXG5cbiMgRmxhZ3MgZm9yIElFXG5pZiBzZXR0aW5ncy5icm93c2VyLmlkIGlzICdFeHBsb3JlcicgXG5cdHNldHRpbmdzLmJyb3dzZXIuaWUgPSB0cnVlXG5cdGlmIHNldHRpbmdzLmJyb3dzZXIudmVyc2lvbiBpcyA4XG5cdFx0c2V0dGluZ3MuYnJvd3Nlci5pZTggPSB0cnVlXG5cdGlmIHNldHRpbmdzLmJyb3dzZXIudmVyc2lvbiBpcyA5XG5cdFx0c2V0dGluZ3MuYnJvd3Nlci5pZTkgPSB0cnVlXG5cblxuIyBJZiBpdCdzIGFuIGhhbmRoZWxkIGRldmljZVxuc2V0dGluZ3MudmlkZW9fYWN0aXZlID0gc2V0dGluZ3MuYnJvd3Nlci5pZCBpc250ICdFeHBsb3JlcidcblxuXG5cbmlmKCAvQW5kcm9pZHx3ZWJPU3xpUGhvbmV8aVBhZHxpUG9kfEJsYWNrQmVycnl8SUVNb2JpbGV8T3BlcmEgTWluaS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkgKVxuXHRzZXR0aW5ncy5icm93c2VyLmhhbmRoZWxkID0gdHJ1ZVxuXG5cdCMgQ2hlY2sgaWYgaXQncyBtb2JpbGUgb3IgdGFibGV0IGNhbGN1bGF0aW5nIHJhdGlvIGFuZCBvcmllbnRhdGlvblxuXHRyYXRpbyA9ICQod2luZG93KS53aWR0aCgpLyQod2luZG93KS5oZWlnaHQoKVxuXHRzZXR0aW5ncy5icm93c2VyLm9yaWVudGF0aW9uID0gaWYgcmF0aW8gPiAxIHRoZW4gXCJsYW5kc2NhcGVcIiBlbHNlIFwicG9ydHJhaXRcIlxuXG5cdCMgY2hlY2sgbWF4IHdpZHRoIGZvciBtb2JpbGUgZGV2aWNlIChuZXh1cyA3IGluY2x1ZGVkKVxuXHRpZiAkKHdpbmRvdykud2lkdGgoKSA8IDYxMCBvciAoc2V0dGluZ3MuYnJvd3Nlci5vcmllbnRhdGlvbiBpcyBcImxhbmRzY2FwZVwiIGFuZCByYXRpbyA+IDIuMTAgKVxuXHRcdHNldHRpbmdzLmJyb3dzZXIubW9iaWxlID0gdHJ1ZVxuXHRcdHNldHRpbmdzLmJyb3dzZXIudGFibGV0ID0gZmFsc2Vcblx0ZWxzZVxuXHRcdHNldHRpbmdzLmJyb3dzZXIubW9iaWxlID0gZmFsc2Vcblx0XHRzZXR0aW5ncy5icm93c2VyLnRhYmxldCA9IHRydWVcblxuc2V0dGluZ3MuYnJvd3Nlci5kZXZpY2UgPSAoc2V0dGluZ3MuYnJvd3Nlci50YWJsZXQgb3Igc2V0dGluZ3MuYnJvd3Nlci5tb2JpbGUpXG5cbiMgU2V0IGRlc2t0b3AgZmxhZ1xuaWYgc2V0dGluZ3MuYnJvd3Nlci50YWJsZXQgaXMgZmFsc2UgYW5kICBzZXR0aW5ncy5icm93c2VyLm1vYmlsZSBpcyBmYWxzZVxuXHRzZXR0aW5ncy5icm93c2VyLmRlc2t0b3AgPSB0cnVlXG5cblxuc2V0dGluZ3MuYnJvd3Nlci53aW5kb3dzX3Bob25lID0gZmFsc2VcbmlmIHNldHRpbmdzLmJyb3dzZXIubW9iaWxlIGFuZCBzZXR0aW5ncy5icm93c2VyLmlkIGlzICdFeHBsb3Jlcidcblx0c2V0dGluZ3MuYnJvd3Nlci53aW5kb3dzX3Bob25lID0gdHJ1ZVxuXG5cbnNldHRpbmdzLnRvdWNoX2RldmljZSA9IHNldHRpbmdzLmJyb3dzZXIuaGFuZGhlbGRcblxuIyBQbGF0Zm9ybSBzcGVjaWZpYyBldmVudHMgbWFwXG5zZXR0aW5ncy5ldmVudHNfbWFwID1cblx0J2Rvd24nIDogJ21vdXNlZG93bidcblx0J3VwJyAgIDogJ21vdXNldXAnXG5cdCdtb3ZlJyA6ICdtb3VzZW1vdmUnXG5cbmlmIHNldHRpbmdzLmJyb3dzZXIuZGV2aWNlXG5cblx0aWYgc2V0dGluZ3MuYnJvd3Nlci53aW5kb3dzX3Bob25lXG5cdFx0c2V0dGluZ3MuZXZlbnRzX21hcCA9XG5cdFx0XHQnZG93bicgOiAnTVNQb2ludGVyRG93bidcblx0XHRcdCd1cCcgICA6ICdNU1BvaW50ZXJVcCdcblx0XHRcdCdtb3ZlJyA6ICdNU1BvaW50ZXJNb3ZlJ1xuXHRcdFx0XG5cdGVsc2Vcblx0XHRzZXR0aW5ncy5ldmVudHNfbWFwID1cblx0XHRcdCdkb3duJyA6ICd0b3VjaHN0YXJ0J1xuXHRcdFx0J3VwJyAgIDogJ3RvdWNoZW5kJ1xuXHRcdFx0J21vdmUnIDogJ3RvdWNobW92ZSdcblxuXG5cblxuIyBQbGF0Zm9ybSBjbGFzc1xuaWYgc2V0dGluZ3MuYnJvd3Nlci5kZXNrdG9wXG5cdHBsYXRmb3JtID0gJ2Rlc2t0b3AnXG5lbHNlIGlmIHNldHRpbmdzLmJyb3dzZXIudGFibGV0XG5cdHBsYXRmb3JtID0gJ3RhYmxldCdcbmVsc2Vcblx0cGxhdGZvcm0gPSAnbW9iaWxlJ1xuXG4jIEJyb3dzZXIgY2xhc3MgZm9yIHRoZSBib2R5XG5zZXR0aW5ncy5icm93c2VyX2NsYXNzID0gc2V0dGluZ3MuYnJvd3Nlci5pZCArICdfJyArIHNldHRpbmdzLmJyb3dzZXIudmVyc2lvblxuXG5oYXMzZCA9IC0+XG5cdGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIilcblx0aGFzM2QgPSB1bmRlZmluZWRcblx0dHJhbnNmb3JtcyA9XG5cdFx0d2Via2l0VHJhbnNmb3JtOiBcIi13ZWJraXQtdHJhbnNmb3JtXCJcblx0XHRPVHJhbnNmb3JtOiBcIi1vLXRyYW5zZm9ybVwiXG5cdFx0bXNUcmFuc2Zvcm06IFwiLW1zLXRyYW5zZm9ybVwiXG5cdFx0TW96VHJhbnNmb3JtOiBcIi1tb3otdHJhbnNmb3JtXCJcblx0XHR0cmFuc2Zvcm06IFwidHJhbnNmb3JtXCJcblxuXG5cdCMgQWRkIGl0IHRvIHRoZSBib2R5IHRvIGdldCB0aGUgY29tcHV0ZWQgc3R5bGUuXG5cdGRvY3VtZW50LmJvZHkuaW5zZXJ0QmVmb3JlIGVsLCBudWxsXG5cdGZvciB0IG9mIHRyYW5zZm9ybXNcblx0XHRpZiBlbC5zdHlsZVt0XSBpc250IGB1bmRlZmluZWRgXG5cdFx0XHRlbC5zdHlsZVt0XSA9IFwidHJhbnNsYXRlM2QoMXB4LDFweCwxcHgpXCJcblx0XHRcdGhhczNkID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWwpLmdldFByb3BlcnR5VmFsdWUodHJhbnNmb3Jtc1t0XSlcblx0ZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZCBlbFxuXHRoYXMzZCBpc250IGB1bmRlZmluZWRgIGFuZCBoYXMzZC5sZW5ndGggPiAwIGFuZCBoYXMzZCBpc250IFwibm9uZVwiXG5cblxuIyBzZXR0aW5ncy5oYXMzZCA9IGhhczNkKClcblxuXG5cbnNldHRpbmdzLmJpbmQgPSAoYm9keSktPlxuXHRrbGFzc2VzID0gW11cblx0a2xhc3Nlcy5wdXNoIHNldHRpbmdzLmJyb3dzZXJfY2xhc3Ncblx0a2xhc3Nlcy5wdXNoIHNldHRpbmdzLmJyb3dzZXIuT1MucmVwbGFjZSggJy8nLCAnXycgKVxuXHRrbGFzc2VzLnB1c2ggc2V0dGluZ3MuYnJvd3Nlci5pZFxuXG5cdGlmIHNldHRpbmdzLnRvdWNoX2RldmljZVxuXHRcdGtsYXNzZXMucHVzaCBcInRvdWNoX2RldmljZVwiXG5cdGVsc2Vcblx0XHRrbGFzc2VzLnB1c2ggXCJub190b3VjaF9kZXZpY2VcIlxuXG5cdGlmIHNldHRpbmdzLmJyb3dzZXIuY3NzX2NvdmVyX3N1cHBvcnRlZFxuXHRcdGtsYXNzZXMucHVzaCBcImNzc19jb3Zlcl9zdXBwb3J0ZWRcIlxuXG5cdGJvZHkuYWRkQ2xhc3Mga2xhc3Nlcy5qb2luKCBcIiBcIiApLnRvTG93ZXJDYXNlKClcblxuXHRzZXR0aW5ncy5oZWFkZXJfaGVpZ2h0ID0gJCggJ2hlYWRlcicgKS5oZWlnaHQoKVxuXHQjIGJvZHkuY3NzIFxuXHQjIFx0J21pbi13aWR0aCcgIDogc2V0dGluZ3MuYnJvd3Nlci5taW5fc2l6ZS53XG5cdCMgXHQnbWluLWhlaWdodCcgOiBzZXR0aW5ncy5icm93c2VyLm1pbl9zaXplLmhcblxuXG5cbiMgVEVNUFxuXG4jIHNldHRpbmdzLnZpZGVvX2FjdGl2ZSA9IGZhbHNlXG4jIHNldHRpbmdzLmNzc19jb3Zlcl9zdXBwb3J0ZWQgPSBmYWxzZVxuXG5cbm1vZHVsZS5leHBvcnRzID0gc2V0dGluZ3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSwyQ0FBQTs7QUFBQSxDQUFBLEVBQWdCLElBQUEsTUFBaEIsTUFBZ0I7O0FBRWhCLENBRkEsRUFLQyxLQUhEO0NBR0MsQ0FBQSxLQUFBO0NBQVMsQ0FHUixFQUFBLEdBSFEsTUFHUztDQUhULENBTUMsRUFBVCxHQUFBLE1BQXNCO0NBTmQsQ0FTUixFQUFBLFNBQWlCO0FBR2lELENBWjFELENBWUMsQ0FBd0QsQ0FBakUsRUFBQSxDQUFTLENBQUEsQ0FBUyxFQUFUO0NBWkQsQ0FlRSxFQUFWLEdBQUEsRUFBbUMsQ0FBZjtDQWZaLENBa0JILENBQUwsQ0FBQSxDQWxCUTtDQUFBLENBcUJNLEVBQWQsRUFBb0IsTUFBcEIsSUFyQlE7Q0FBQSxDQXdCRSxFQUFWLENBeEJRLEdBd0JSO0NBeEJRLENBMkJBLEVBQVIsQ0EzQlEsQ0EyQlI7Q0EzQlEsQ0E4QkEsRUFBUixDQTlCUSxDQThCUjtDQTlCUSxDQWlDQyxFQUFULENBakNRLEVBaUNSO0NBakNRLENBb0NBLEVBQVIsQ0FwQ1EsQ0FvQ1I7Q0FwQ1EsQ0F1Q0QsRUFBUCxDQUFBO0NBdkNRLENBeUNhLEVBQXJCLEtBQThCLEtBekN0QixLQXlDUjtDQXpDUSxDQTRDUCxFQURELElBQUE7Q0FDQyxDQUFHLENBQUgsR0FBQTtDQUFBLENBQ0csQ0FESCxHQUNBO01BN0NPO0lBQVQ7Q0FBQSxDQW9EQSxFQUFBLENBcERBO0NBTEQsQ0FBQTs7QUEyREEsQ0EzREEsRUEyRGlCLEVBQWpCLEdBQVEsQ0EzRFI7O0FBNERBLENBNURBLEVBNEQyQixLQUFuQixPQUFSOztBQUlBLENBaEVBLEVBZ0UwQixFQUFpQyxDQUEzRCxDQUFnQixDQUFSLElBQWtCOztBQUcxQixDQUFBLENBQUEsRUFBRyxFQUFBLENBQWdCLENBQVI7Q0FDVixDQUFBLENBQWdCLENBQWhCLElBQVE7RUFwRVQ7O0FBdUVBLENBQUEsQ0FBRyxFQUFBLENBQXVCLEVBQVAsQ0FBUixFQUFYO0NBQ0MsQ0FBQSxDQUFzQixDQUF0QixHQUFnQixDQUFSO0NBQ1IsQ0FBQSxFQUFHLENBQTRCLEVBQVosQ0FBUjtDQUNWLEVBQUEsQ0FBQSxHQUFnQixDQUFSO0lBRlQ7Q0FHQSxDQUFBLEVBQUcsQ0FBNEIsRUFBWixDQUFSO0NBQ1YsRUFBQSxDQUFBLEdBQWdCLENBQVI7SUFMVjtFQXZFQTs7QUFnRkEsQ0FoRkEsQ0FnRndCLENBQUEsRUFBeUIsRUFBVCxDQUFoQyxFQWhGUixFQWdGQTs7QUFJQSxDQUFBLEdBQUksS0FBK0UsdURBQWY7Q0FDbkUsQ0FBQSxDQUE0QixDQUE1QixHQUFnQixDQUFSO0NBQVIsQ0FHQSxDQUFRLEVBQVIsQ0FBUTtDQUhSLENBSUEsQ0FBa0MsRUFBQSxFQUFsQixDQUFSLEVBSlIsQ0FJQTtDQUdBLENBQUEsQ0FBdUIsQ0FBcEIsQ0FBQSxDQUFBLENBQTRDLENBQVIsR0FBUjtDQUM5QixFQUEwQixDQUExQixFQUFBLENBQWdCLENBQVI7Q0FBUixFQUMwQixDQUExQixDQURBLENBQ0EsQ0FBZ0IsQ0FBUjtJQUZULEVBQUE7Q0FJQyxFQUEwQixDQUExQixDQUFBLENBQUEsQ0FBZ0IsQ0FBUjtDQUFSLEVBQzBCLENBQTFCLEVBQUEsQ0FBZ0IsQ0FBUjtJQWJWO0VBcEZBOztBQW1HQSxDQW5HQSxFQW1HMkIsQ0FBMkIsRUFBdEQsQ0FBZ0IsQ0FBUjs7QUFHUixDQUFBLEdBQUcsQ0FBMkIsQ0FBM0IsQ0FBZ0IsQ0FBUjtDQUNWLENBQUEsQ0FBMkIsQ0FBM0IsR0FBZ0IsQ0FBUjtFQXZHVDs7QUEwR0EsQ0ExR0EsRUEwR2lDLEVBMUdqQyxFQTBHZ0IsQ0FBUixLQUFSOztBQUNBLENBQUEsQ0FBK0IsRUFBNUIsQ0FBbUQsQ0FBbkQsQ0FBZ0IsQ0FBUixFQUFYO0NBQ0MsQ0FBQSxDQUFpQyxDQUFqQyxHQUFnQixDQUFSLEtBQVI7RUE1R0Q7O0FBK0dBLENBL0dBLEVBK0d3QixJQUFnQixDQUFoQyxJQUFSOztBQUdBLENBbEhBLEVBbUhDLEtBRE8sRUFBUjtDQUNDLENBQUEsSUFBQSxLQUFBO0NBQUEsQ0FDQSxFQUFBLEtBREE7Q0FBQSxDQUVBLElBQUEsS0FGQTtDQW5IRCxDQUFBOztBQXVIQSxDQUFBLEdBQUcsRUFBSCxDQUFtQixDQUFSO0NBRVYsQ0FBQSxFQUFHLEdBQWdCLENBQVIsS0FBWDtDQUNDLEVBQ0MsQ0FERCxJQUFRLEVBQVI7Q0FDQyxDQUFTLElBQVQsU0FBQTtDQUFBLENBQ1MsRUFBVCxFQUFBLE9BREE7Q0FBQSxDQUVTLElBQVQsU0FGQTtDQUZGLEtBQ0M7SUFERCxFQUFBO0NBT0MsRUFDQyxDQURELElBQVEsRUFBUjtDQUNDLENBQVMsSUFBVCxNQUFBO0NBQUEsQ0FDUyxFQUFULEVBQUEsSUFEQTtDQUFBLENBRVMsSUFBVCxLQUZBO0NBUkYsS0FPQztJQVRGO0VBdkhBOztBQXlJQSxDQUFBLEdBQUcsR0FBZ0IsQ0FBUjtDQUNWLENBQUEsQ0FBVyxLQUFYLENBQUE7Q0FDZ0IsQ0FGakIsRUFFUSxFQUZSLENBRXdCLENBQVI7Q0FDZixDQUFBLENBQVcsS0FBWDtFQUhELElBQUE7Q0FLQyxDQUFBLENBQVcsS0FBWDtFQTlJRDs7QUFpSkEsQ0FqSkEsQ0FpSnlCLENBQUEsSUFBZ0IsQ0FBakMsS0FBUjs7QUFFQSxDQW5KQSxFQW1KUSxFQUFSLElBQVE7Q0FDUCxLQUFBLFdBQUE7Q0FBQSxDQUFBLENBQUssS0FBUSxLQUFSO0NBQUwsQ0FDQSxDQUFRLEVBQVIsQ0FEQTtDQUFBLENBRUEsQ0FDQyxPQUREO0NBQ0MsQ0FBaUIsRUFBakIsV0FBQSxJQUFBO0NBQUEsQ0FDWSxFQUFaLE1BQUEsSUFEQTtDQUFBLENBRWEsRUFBYixPQUFBLElBRkE7Q0FBQSxDQUdjLEVBQWQsUUFBQSxJQUhBO0NBQUEsQ0FJVyxFQUFYLEtBQUEsRUFKQTtDQUhELEdBQUE7Q0FBQSxDQVdBLEVBQWEsSUFBTCxJQUFSO0FBQ0EsQ0FBQSxFQUFBLElBQUEsUUFBQTtDQUNDLENBQUssRUFBTCxDQUFZLElBQVo7Q0FDQyxDQUFFLENBQVksRUFBTCxDQUFULG9CQUFBO0NBQUEsQ0FDUSxDQUFBLEVBQVIsQ0FBQSxJQUFnRSxNQUF4RDtNQUhWO0NBQUEsRUFaQTtDQUFBLENBZ0JBLEVBQWEsSUFBTCxHQUFSO0NBQ2lDLEVBQVMsQ0FBZixDQUEzQixDQUEyQixHQUEzQjtDQWxCTzs7QUF5QlIsQ0E1S0EsRUE0S2dCLENBQWhCLElBQVEsQ0FBUztDQUNoQixLQUFBLENBQUE7Q0FBQSxDQUFBLENBQVUsSUFBVjtDQUFBLENBQ0EsRUFBQSxHQUFPLENBQWMsS0FBckI7Q0FEQSxDQUVBLENBQWEsQ0FBYixHQUFPLENBQWM7Q0FGckIsQ0FHQSxFQUFBLEdBQU8sQ0FBYztDQUVyQixDQUFBLEVBQUcsSUFBUSxJQUFYO0NBQ0MsR0FBQSxHQUFPLE9BQVA7SUFERCxFQUFBO0NBR0MsR0FBQSxHQUFPLFVBQVA7SUFSRDtDQVVBLENBQUEsRUFBRyxHQUFnQixDQUFSLFdBQVg7Q0FDQyxHQUFBLEdBQU8sY0FBUDtJQVhEO0NBQUEsQ0FhQSxDQUFjLENBQVYsR0FBaUIsQ0FBckIsR0FBYztDQUVMLEVBQWdCLEdBQUEsRUFBakIsQ0FBUixJQUFBO0NBaEJlOztBQTZCaEIsQ0F6TUEsRUF5TWlCLEdBQVgsQ0FBTixDQXpNQSJ9fSx7Im9mZnNldCI6eyJsaW5lIjo2MDc3LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmVuZG9ycy5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsidmVuZG9ycyA9IFxuICAjIGRvY3VtZW50YXRpb246IGh0dHA6Ly9tb2Rlcm5penIuY29tL2RvY3MvXG4gIE1vZGVybml6ciAgICAgICAgICAgIDogcmVxdWlyZSAnLi4vdmVuZG9ycy9tb2Rlcm5penIuY3VzdG9tLmpzJ1xuXG4gICMgZG9jdW1lbnRhdGlvbjogaHR0cHM6Ly9naXRodWIuY29tL2plcmVteWhhcnJpcy9Mb2NhbENvbm5lY3Rpb24uanMvdHJlZS9tYXN0ZXJcbiAgTG9jYWxDb25uZWN0aW9uICAgICAgOiByZXF1aXJlICcuLi92ZW5kb3JzL0xvY2FsQ29ubmVjdGlvbi5qcydcblxuXG4gICMgZG9jdW1udGF0aW9uOiBodHRwczovL2dpdGh1Yi5jb20vam9ld2FsbmVzL3JlY29ubmVjdGluZy13ZWJzb2NrZXRcbiAgUmVjb25uZWN0aW5nV2Vic29ja2V0OiByZXF1aXJlICcuLi92ZW5kb3JzL3JlY29ubmVjdGluZy13ZWJzb2NrZXQuanMnXG5cbm1vZHVsZS5leHBvcnRzID0gdmVuZG9ycyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLEdBQUE7O0FBQUEsQ0FBQSxFQUVFLElBRkY7Q0FFRSxDQUFBLEtBQXVCLEVBQXZCLHVCQUF1QjtDQUF2QixDQUdBLEtBQXVCLFFBQXZCLGdCQUF1QjtDQUh2QixDQU9BLEtBQXVCLGNBQXZCLGlCQUF1QjtDQVR6QixDQUFBOztBQVdBLENBWEEsRUFXaUIsR0FBWCxDQUFOIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjYwODksImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9idXR0b25zL3N0YXJ0X3JlY29yZGluZy5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiYXBwY2FzdCA9IHJlcXVpcmUgJ2FwcC9jb250cm9sbGVycy9hcHBjYXN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9ICggZG9tICkgLT5cblxuICBkb20uY2xpY2sgLT4gXG5cbiAgICBpZiBub3QgYXBwY2FzdC5nZXQgJ3N0cmVhbWluZzpvbmxpbmUnXG5cbiAgICAgIGNvbnNvbGUuZXJyb3IgJy0gY2FudCBzdGFydCByZWNvcmRpbmcgaWYgbm90IHN0cmVhbWluZydcbiAgICAgIHJldHVyblxuXG4gICAgY29uc29sZS5sb2cgJysgc3RhcnQgcmVjb3JkaW5nJywgYXBwY2FzdC5nZXQgJ2lucHV0X2RldmljZSdcbiAgICBcbiAgICAjIHBvc3QgdG8gYmFja2VuZCBpbiBvcmRlciB0byBzdGFydCByZWNvcmRpbmcgc2V0XG5cbiAgICB1cmwgID0gXCIvdGFwZS9zdGFydC9yZWNvcmRpbmdcIlxuICAgIGRvbmUgPSAtPlxuICAgICAgY29uc29sZS5pbmZvICcrIHJlY29yZGluZyBwb3N0IGRvbmUgLT4nLCBhcmd1bWVudHNcbiAgICAgIGFwcGNhc3Quc2V0ICdyZWNvcmRpbmcnLCB0cnVlXG5cbiAgICBmYWlsID0gLT5cbiAgICAgIGNvbnNvbGUuZXJyb3IgJy0gZmFpbGluZyB0cnlpbmcgdG8gc3RhcnQgcmVjb3JkaW5nIC0+JywgYXJndW1lbnRzXG5cbiAgICAjIHBvc3QgdG8gYmFja2VuZCBpbiBvcmRlciB0byBzdGFydCByZWNvcmRpbmdcbiAgICAkLnBvc3QoIHVybCApLmRvbmUoIGRvbmUgKS5mYWlsKCBmYWlsICkiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxHQUFBOztBQUFBLENBQUEsRUFBVSxJQUFWLGtCQUFVOztBQUVWLENBRkEsRUFFaUIsR0FBWCxDQUFOLEVBQW1CO0NBRWIsRUFBRCxFQUFILElBQUE7Q0FFRSxPQUFBLE9BQUE7QUFBTyxDQUFQLEVBQU8sQ0FBUCxHQUFjLFdBQVA7Q0FFTCxJQUFBLENBQUEsQ0FBTyxrQ0FBUDtDQUNBLFdBQUE7TUFIRjtDQUFBLENBS2lDLENBQWpDLENBQUEsR0FBTyxPQUEwQixLQUFqQztDQUxBLEVBU0EsQ0FBQSxtQkFUQTtDQUFBLEVBVU8sQ0FBUCxLQUFPO0NBQ0wsQ0FBeUMsRUFBekMsRUFBQSxDQUFPLEVBQVAsaUJBQUE7Q0FDUSxDQUFpQixDQUF6QixDQUFBLEdBQU8sSUFBUCxFQUFBO0NBWkYsSUFVTztDQVZQLEVBY08sQ0FBUCxLQUFPO0NBQ0csQ0FBZ0QsR0FBeEQsRUFBTyxFQUFQLElBQUEsMkJBQUE7Q0FmRixJQWNPO0NBSU4sRUFBRCxDQUFBLE9BQUE7Q0FwQkYsRUFBVTtDQUZLIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjYxMTUsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9idXR0b25zL3N0YXJ0X3N0cmVhbS5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiYXBwY2FzdCA9IHJlcXVpcmUgJ2FwcC9jb250cm9sbGVycy9hcHBjYXN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9ICggZG9tICkgLT5cblxuICBkb20uY2xpY2sgLT4gXG5cbiAgICBpZiBub3QgYXBwY2FzdC5nZXQgJ2lucHV0X2RldmljZSdcblxuICAgICAgY29uc29sZS5lcnJvciAnLSBjYW50IHN0YXJ0IHN0cmVhbSBiZWZvcmUgc2VsZWN0aW5nIGlucHV0IGRldmljZSdcbiAgICAgIHJldHVyblxuXG4gICAgY29uc29sZS5sb2cgJ3N0YXJ0aW5nIHN0cmVhbWluZyB3aXRoJywgYXBwY2FzdC5nZXQgJ2lucHV0X2RldmljZSdcbiAgICBcbiAgICBhcHBjYXN0LnN0YXJ0X3N0cmVhbSBhcHBjYXN0LmdldCAnaW5wdXRfZGV2aWNlJyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLEdBQUE7O0FBQUEsQ0FBQSxFQUFVLElBQVYsa0JBQVU7O0FBRVYsQ0FGQSxFQUVpQixHQUFYLENBQU4sRUFBbUI7Q0FFYixFQUFELEVBQUgsSUFBQTtBQUVTLENBQVAsRUFBTyxDQUFQLEdBQWMsT0FBUDtDQUVMLElBQUEsQ0FBQSxDQUFPLDRDQUFQO0NBQ0EsV0FBQTtNQUhGO0NBQUEsQ0FLdUMsQ0FBdkMsQ0FBQSxHQUFPLE9BQWdDLFdBQXZDO0NBRVEsRUFBYSxJQUFkLElBQVAsQ0FBQSxFQUFxQjtDQVR2QixFQUFVO0NBRksifX0seyJvZmZzZXQiOnsibGluZSI6NjEzMiwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2J1dHRvbnMvc3RvcF9yZWNvcmRpbmcuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbImFwcGNhc3QgPSByZXF1aXJlICdhcHAvY29udHJvbGxlcnMvYXBwY2FzdCdcblxubW9kdWxlLmV4cG9ydHMgPSAoIGRvbSApIC0+XG5cbiAgZG9tLmNsaWNrIC0+IFxuXG4gICAgaWYgbm90IGFwcGNhc3QuZ2V0ICdzdHJlYW06cmVjb3JkaW5nJ1xuXG4gICAgICBjb25zb2xlLmVycm9yICctIGNhbnQgc3RvcCByZWNvcmRpbmcgaWYgbm90IHJlY29yZGluZydcbiAgICAgIHJldHVyblxuXG4gICAgY29uc29sZS5sb2cgJysgc3RvcHBpbmcgdG8gcmVjb3JkIHdpdGggJywgYXBwY2FzdC5nZXQgJ2lucHV0X2RldmljZSdcbiAgICBcbiAgICAjIHBvc3QgdG8gYmFja2VuZCBpbiBvcmRlciB0byBzdGFydCByZWNvcmRpbmcgc2V0XG5cbiAgICB1cmwgID0gXCIvdGFwZS9zdG9wL3JlY29yZGluZ1wiXG4gICAgZG9uZSA9IC0+XG4gICAgICBjb25zb2xlLmluZm8gJysgL3RhcGUvc3RvcC9yZWNvcmRpbmcgcG9zdCBkb25lIC0+JywgYXJndW1lbnRzXG5cbiAgICBmYWlsID0gLT5cbiAgICAgIGNvbnNvbGUuZXJyb3IgJy0gL3RhcGUvc3RvcC9yZWNvcmRpbmcgcG9zdCBmYWlsZWQgLT4nLCBhcmd1bWVudHNcblxuICAgICMgcG9zdCB0byBiYWNrZW5kIGluIG9yZGVyIHRvIHN0YXJ0IHJlY29yZGluZ1xuICAgICQucG9zdCggdXJsICkuZG9uZSggZG9uZSApLmZhaWwoIGZhaWwgKSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLEdBQUE7O0FBQUEsQ0FBQSxFQUFVLElBQVYsa0JBQVU7O0FBRVYsQ0FGQSxFQUVpQixHQUFYLENBQU4sRUFBbUI7Q0FFYixFQUFELEVBQUgsSUFBQTtDQUVFLE9BQUEsT0FBQTtBQUFPLENBQVAsRUFBTyxDQUFQLEdBQWMsV0FBUDtDQUVMLElBQUEsQ0FBQSxDQUFPLGlDQUFQO0NBQ0EsV0FBQTtNQUhGO0NBQUEsQ0FLMEMsQ0FBMUMsQ0FBQSxHQUFPLE9BQW1DLGNBQTFDO0NBTEEsRUFTQSxDQUFBLGtCQVRBO0NBQUEsRUFVTyxDQUFQLEtBQU87Q0FDRyxDQUE0QyxFQUFwRCxHQUFPLEVBQVAsSUFBQSx3QkFBQTtDQVhGLElBVU87Q0FWUCxFQWFPLENBQVAsS0FBTztDQUNHLENBQStDLEdBQXZELEVBQU8sRUFBUCxJQUFBLDBCQUFBO0NBZEYsSUFhTztDQUlOLEVBQUQsQ0FBQSxPQUFBO0NBbkJGLEVBQVU7Q0FGSyJ9fSx7Im9mZnNldCI6eyJsaW5lIjo2MTU3LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvYnV0dG9ucy9zdG9wX3N0cmVhbS5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiYXBwY2FzdCA9IHJlcXVpcmUgJ2FwcC9jb250cm9sbGVycy9hcHBjYXN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9ICggZG9tICkgLT5cblxuICBkb20uY2xpY2sgLT4gXG5cbiAgICBpZiBub3QgYXBwY2FzdC5nZXQgJ3N0cmVhbWluZzpvbmxpbmUnXG5cbiAgICAgIGNvbnNvbGUuZXJyb3IgJy0gY2FudCBzdG9wIHN0cmVhbSBpZiBub3Qgc3RyZWFtaW5nJ1xuICAgICAgcmV0dXJuXG5cbiAgICBjb25zb2xlLmxvZyAnKyBzdG9waW5nIHN0cmVhbWluZyB3aXRoJywgYXBwY2FzdC5nZXQgJ2lucHV0X2RldmljZSdcbiAgICBcbiAgICBhcHBjYXN0LnN0b3Bfc3RyZWFtKCkiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxHQUFBOztBQUFBLENBQUEsRUFBVSxJQUFWLGtCQUFVOztBQUVWLENBRkEsRUFFaUIsR0FBWCxDQUFOLEVBQW1CO0NBRWIsRUFBRCxFQUFILElBQUE7QUFFUyxDQUFQLEVBQU8sQ0FBUCxHQUFjLFdBQVA7Q0FFTCxJQUFBLENBQUEsQ0FBTyw4QkFBUDtDQUNBLFdBQUE7TUFIRjtDQUFBLENBS3dDLENBQXhDLENBQUEsR0FBTyxPQUFpQyxZQUF4QztDQUVRLE1BQUQsSUFBUDtDQVRGLEVBQVU7Q0FGSyJ9fSx7Im9mZnNldCI6eyJsaW5lIjo2MTc0LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvY29tcG9uZW50cy9jbGlja190cmlnZ2VyLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJIb3ZlclRyaWdnZXIgPSByZXF1aXJlICdhcHAvdmlld3MvY29tcG9uZW50cy9ob3Zlcl90cmlnZ2VyJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIENsaWNrVHJpZ2dlciBleHRlbmRzIEhvdmVyVHJpZ2dlclxuXG5cdHNldF9saXN0ZW5lcnM6ICggKSAtPlxuXHRcdEBkb20ub24gJ2NsaWNrJywgQHRvZ2dsZVxuXHRcdGFwcC53aW5kb3cub24gXCJib2R5OmNsaWNrZWRcIiwgQGNsb3NlXG5cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLDRCQUFBO0dBQUE7a1NBQUE7O0FBQUEsQ0FBQSxFQUFlLElBQUEsS0FBZix3QkFBZTs7QUFFZixDQUZBLEVBRXVCLEdBQWpCLENBQU47Q0FFQzs7Ozs7Q0FBQTs7Q0FBQSxFQUFlLE1BQUEsSUFBZjtDQUNDLENBQUEsQ0FBSSxDQUFKLEVBQUEsQ0FBQTtDQUNJLENBQUosQ0FBRyxDQUE0QixDQUEvQixDQUFVLEtBQVYsR0FBQTtDQUZELEVBQWU7O0NBQWY7O0NBRjJDIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjYxOTksImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9jb21wb25lbnRzL2Z1bGxzY3JlZW4uY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gY2xhc3MgRnVsbHNjcmVlblxuXHRmYWN0b3I6IDFcblx0Y29uc3RydWN0b3I6ICggQGRvbSApIC0+XG5cdFx0QGRvbS5hZGRDbGFzcyAnZnVsbHNjcmVlbidcblx0XHRpZiBAZG9tLmRhdGEgJ2ZhY3Rvcidcblx0XHRcdEBmYWN0b3IgPSBAZG9tLmRhdGEgJ2ZhY3RvcidcblxuXHRcdGFwcC53aW5kb3cub24gJ3Jlc2l6ZScsIEBvbl9yZXNpemVcblx0XHRkbyBAb25fcmVzaXplXG5cblx0b25fcmVzaXplOiAoICkgPT5cblx0XHRAZG9tLmNzc1xuIFx0XHRcdCd3aWR0aCcgOiAnMTAwJSdcbiBcdFx0XHQnaGVpZ2h0JyA6IChhcHAud2luZG93LmggLSBhcHAuc2V0dGluZ3MuaGVhZGVyX2hlaWdodCkqQGZhY3RvclxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsTUFBQTtHQUFBLCtFQUFBOztBQUFBLENBQUEsRUFBdUIsR0FBakIsQ0FBTjtDQUNDLEVBQVEsR0FBUjs7Q0FDYSxDQUFBLENBQUEsaUJBQUc7Q0FDZixFQURlLENBQUQ7Q0FDZCw0Q0FBQTtDQUFBLEVBQUksQ0FBSixJQUFBLElBQUE7Q0FDQSxFQUFPLENBQVAsSUFBRztDQUNGLEVBQVUsQ0FBVCxFQUFELEVBQVU7TUFGWDtDQUFBLENBSUEsQ0FBRyxDQUFILEVBQVUsRUFBVixDQUFBO0NBSkEsR0FLRyxLQUFIO0NBUEQsRUFDYTs7Q0FEYixFQVNXLE1BQVg7Q0FDRSxFQUFHLENBQUgsT0FBRDtDQUNFLENBQVUsSUFBVixDQUFBO0NBQUEsQ0FDVyxDQUFJLENBQXlDLEVBQXhELEVBQUEsS0FBVztDQUhILEtBQ1Y7Q0FWRCxFQVNXOztDQVRYOztDQUREIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjYyMjksImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9jb21wb25lbnRzL2hvdmVyLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJoYXBwZW5zID0gcmVxdWlyZSAnaGFwcGVucydcbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgSG92ZXJcblx0Y29uc3RydWN0b3I6ICggQGRvbSApIC0+XG5cdFx0cmV0dXJuIGlmIGFwcC5zZXR0aW5ncy50b3VjaF9kZXZpY2VcblxuXHRcdGhhcHBlbnMgQFxuXHRcdFxuXHRcdEBkb20ub24gJ21vdXNlb3ZlcicsIEBvbl9tb3VzZV9vdmVyXG5cdFx0QGRvbS5vbiAnbW91c2VsZWF2ZScsIEBvbl9tb3VzZV9sZWF2ZVxuXG5cdFx0QGRvbS5hZGRDbGFzcyAnaG92ZXJfb2JqZWN0J1xuXG5cdG9uX21vdXNlX292ZXI6ICggKSA9PlxuXHRcdEBkb20uYWRkQ2xhc3MgJ2hvdmVyZWQnXG5cblx0b25fbW91c2VfbGVhdmU6ICggKSA9PlxuXHRcdEBkb20ucmVtb3ZlQ2xhc3MgJ2hvdmVyZWQnIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsVUFBQTtHQUFBLCtFQUFBOztBQUFBLENBQUEsRUFBVSxJQUFWLEVBQVU7O0FBQ1YsQ0FEQSxFQUN1QixHQUFqQixDQUFOO0NBQ2MsQ0FBQSxDQUFBLFlBQUc7Q0FDZixFQURlLENBQUQ7Q0FDZCxzREFBQTtDQUFBLG9EQUFBO0NBQUEsRUFBYSxDQUFiLElBQXNCLElBQXRCO0NBQUEsV0FBQTtNQUFBO0NBQUEsR0FFQSxHQUFBO0NBRkEsQ0FJQSxDQUFJLENBQUosT0FBQSxFQUFBO0NBSkEsQ0FLQSxDQUFJLENBQUosUUFBQSxFQUFBO0NBTEEsRUFPSSxDQUFKLElBQUEsTUFBQTtDQVJELEVBQWE7O0NBQWIsRUFVZSxNQUFBLElBQWY7Q0FDRSxFQUFHLENBQUgsSUFBRCxDQUFBLEVBQUE7Q0FYRCxFQVVlOztDQVZmLEVBYWdCLE1BQUEsS0FBaEI7Q0FDRSxFQUFHLENBQUgsS0FBRCxFQUFBO0NBZEQsRUFhZ0I7O0NBYmhCOztDQUZEIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjYyNjIsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9jb21wb25lbnRzL2hvdmVyX3RyaWdnZXIuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIiMjI1xuQWRkcyB0aGUgY2xhc3MgJ2hvdmVyZWQnIHRvIHRoZSBlbGVtZW50IGFuZCB0byB0aGUgdGFyZ2V0XG5UaGUgY2xhc3MgaXMgdG9nZ2xlZCBvbiBtb3VzZW92ZXIvbW91c2VsZWF2ZSBmb3IgZGVza3RvcHNcbmFuZCBvbiBjbGljayBmb3IgdG91Y2ggZGV2aWNlc1xuIyMjXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgSG92ZXJUcmlnZ2VyXG5cdG9wZW5lZDogZmFsc2Vcblx0a2xhc3M6IFwiaG92ZXJlZFwiXG5cblx0Y29uc3RydWN0b3I6ICggQGRvbSApIC0+XG5cdFx0QHRhcmdldCA9ICQgQGRvbS5kYXRhICd0YXJnZXQnXG5cblx0XHRpZiBAdGFyZ2V0Lmxlbmd0aCA8PSAwXG5cdFx0XHRsb2cgXCJbSG92ZXJUcmlnZ2VyXSBlcnJvci4gdGFyZ2V0IG5vdCBmb3VuZFwiLCBAZG9tLmRhdGEoICd0YXJnZXQnIClcblx0XHRcdHJldHVyblxuXG5cdFx0QGRvbS5hZGRDbGFzcyBcImhvdmVyX2Ryb3Bkb3duX3RyaWdnZXJcIlxuXHRcdEBzZXRfbGlzdGVuZXJzKClcblxuXHRcdGFwcC5vbiBcImRyb3Bkb3duOm9wZW5lZFwiLCBAb25fZHJvcGRvd25fb3BlbmVkXG5cdFx0YXBwLm9uIFwiZHJvcGRvd246Y2xvc2VkXCIsIEBvbl9kcm9wZG93bl9jbG9zZWRcblxuXHRzZXRfbGlzdGVuZXJzOiAoICkgLT5cblxuXHRcdGlmIGFwcC5zZXR0aW5ncy50b3VjaF9kZXZpY2Vcblx0XHRcdEBkb20ub24gJ2NsaWNrJywgQHRvZ2dsZVxuXHRcdGVsc2Vcblx0XHRcdEBkb20ub24gJ21vdXNlb3ZlcicsIEBvcGVuXG5cdFx0XHRAdGFyZ2V0Lm9uICdtb3VzZWxlYXZlJywgQGNsb3NlXG5cblx0XHRhcHAud2luZG93Lm9uIFwiYm9keTpjbGlja2VkXCIsIEBjbG9zZVxuXG5cdHRvZ2dsZTogKCBlICkgPT5cblx0XHRpZiBAb3BlbmVkXG5cdFx0XHRkbyBAY2xvc2Vcblx0XHRlbHNlXG5cdFx0XHRkbyBAb3BlblxuXG5cdFx0ZS5zdG9wUHJvcGFnYXRpb24oKVxuXG5cblxuXHRvcGVuOiAoICkgPT5cblx0XHRyZXR1cm4gaWYgQG9wZW5lZFxuXHRcdEBvcGVuZWQgPSB0cnVlXG5cblx0XHRAZG9tLmFkZENsYXNzIEBrbGFzc1xuXHRcdEB0YXJnZXQuYWRkQ2xhc3MgQGtsYXNzXG5cblx0XHRhcHAuZW1pdCBcImRyb3Bkb3duOm9wZW5lZFwiLCBAdWlkXG5cblx0Y2xvc2U6ICggKSA9PlxuXHRcdHJldHVybiBpZiBub3QgQG9wZW5lZFxuXHRcdEBvcGVuZWQgPSBmYWxzZVxuXG5cdFx0QGRvbS5yZW1vdmVDbGFzcyBAa2xhc3Ncblx0XHRAdGFyZ2V0LnJlbW92ZUNsYXNzIEBrbGFzc1xuXG5cdFx0YXBwLmVtaXQgXCJkcm9wZG93bjpjbG9zZWRcIiwgQHVpZFxuXG5cdG9uX2Ryb3Bkb3duX29wZW5lZDogKCBkYXRhICkgPT5cblx0XHRAY2xvc2UoKSBpZiBkYXRhIGlzbnQgQHVpZFxuXG5cdG9uX2Ryb3Bkb3duX2Nsb3NlZDogKCBkYXRhICkgPT5cblxuXG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0NBQUE7Q0FBQSxHQUFBLFFBQUE7R0FBQSwrRUFBQTs7QUFNQSxDQU5BLEVBTXVCLEdBQWpCLENBQU47Q0FDQyxFQUFRLEVBQVIsQ0FBQTs7Q0FBQSxFQUNPLEVBQVAsSUFEQTs7Q0FHYSxDQUFBLENBQUEsbUJBQUc7Q0FDZixFQURlLENBQUQ7Q0FDZCw4REFBQTtDQUFBLDhEQUFBO0NBQUEsb0NBQUE7Q0FBQSxrQ0FBQTtDQUFBLHNDQUFBO0NBQUEsRUFBVSxDQUFWLEVBQUEsRUFBWTtDQUVaLEdBQUEsRUFBVTtDQUNULENBQThDLENBQTlDLENBQStDLEVBQS9DLEVBQThDLGdDQUE5QztDQUNBLFdBQUE7TUFKRDtDQUFBLEVBTUksQ0FBSixJQUFBLGdCQUFBO0NBTkEsR0FPQSxTQUFBO0NBUEEsQ0FTQSxDQUFHLENBQUgsYUFBQSxDQUFBO0NBVEEsQ0FVQSxDQUFHLENBQUgsYUFBQSxDQUFBO0NBZEQsRUFHYTs7Q0FIYixFQWdCZSxNQUFBLElBQWY7Q0FFQyxFQUFNLENBQU4sSUFBZSxJQUFmO0NBQ0MsQ0FBQSxDQUFJLENBQUgsRUFBRCxDQUFBO01BREQ7Q0FHQyxDQUFBLENBQUksQ0FBSCxFQUFELEtBQUE7Q0FBQSxDQUNBLEVBQUMsQ0FBRCxDQUFBLE1BQUE7TUFKRDtDQU1JLENBQUosQ0FBRyxDQUE0QixDQUEvQixDQUFVLEtBQVYsR0FBQTtDQXhCRCxFQWdCZTs7Q0FoQmYsRUEwQlEsR0FBUixHQUFVO0NBQ1QsR0FBQSxFQUFBO0NBQ0MsR0FBSSxDQUFKLENBQUc7TUFESjtDQUdDLEdBQUksRUFBRDtNQUhKO0NBS0MsVUFBRCxJQUFBO0NBaENELEVBMEJROztDQTFCUixFQW9DTSxDQUFOLEtBQU07Q0FDTCxHQUFBLEVBQUE7Q0FBQSxXQUFBO01BQUE7Q0FBQSxFQUNVLENBQVYsRUFBQTtDQURBLEVBR0ksQ0FBSixDQUFBLEdBQUE7Q0FIQSxHQUlBLENBQUEsQ0FBTyxFQUFQO0NBRUksQ0FBd0IsQ0FBekIsQ0FBSCxPQUFBLE1BQUE7Q0EzQ0QsRUFvQ007O0NBcENOLEVBNkNPLEVBQVAsSUFBTztBQUNRLENBQWQsR0FBQSxFQUFBO0NBQUEsV0FBQTtNQUFBO0NBQUEsRUFDVSxDQUFWLENBREEsQ0FDQTtDQURBLEVBR0ksQ0FBSixDQUFBLE1BQUE7Q0FIQSxHQUlBLENBQUEsQ0FBTyxLQUFQO0NBRUksQ0FBd0IsQ0FBekIsQ0FBSCxPQUFBLE1BQUE7Q0FwREQsRUE2Q087O0NBN0NQLEVBc0RvQixDQUFBLEtBQUUsU0FBdEI7Q0FDQyxFQUFBLENBQUEsQ0FBc0I7Q0FBckIsR0FBQSxDQUFELFFBQUE7TUFEbUI7Q0F0RHBCLEVBc0RvQjs7Q0F0RHBCLEVBeURvQixDQUFBLEtBQUUsU0FBdEI7O0NBekRBOztDQVBEIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjYzNDcsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9jb21wb25lbnRzL2lucHV0X2RldmljZXMuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbImFwcGNhc3QgID0gcmVxdWlyZSAnYXBwL2NvbnRyb2xsZXJzL2FwcGNhc3QnXG5oYXBwZW5zID0gcmVxdWlyZSAnaGFwcGVucydcblxubW9kdWxlLmV4cG9ydHMgPSAoIGRvbSApIC0+XG5cbiAgaGFwcGVucyBAXG5cbiAgZG9tLm9uICdjaGFuZ2UnLCAtPlxuXG4gICAgYXBwY2FzdC5zZXQgJ2lucHV0X2RldmljZScsIGRvbS52YWwoKVxuXG4gIGFwcGNhc3Qub24gJ2lucHV0X2RldmljZXMnLCAoIGRldmljZXMgKSAtPlxuXG4gICAgIyBjbGVhciBvcHRpb25zXG4gICAgIyBUT0RPOiBrZWVwIHRoZSBjaG9vc2VuIG9wdGlvbiBzZWxlY3RlZFxuICAgICMgVE9ETzogbGV0IHRoZSB1c2VyIGtub3cgaWYgcHJldmlvdWx5IHNlbGVjdGVkIGlzbid0IGF2YWlsYWJsZSBhbnltb3JlXG4gICAgZG9tLmh0bWwgXCIgXCJcbiAgICBmb3IgZGV2aWNlIGluIGRldmljZXNcbiAgICAgIGRvbS5hcHBlbmQgXCI8b3B0aW9uIHZhbHVlPScje2RldmljZX0nPiN7ZGV2aWNlfTwvb3B0aW9uPlwiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsWUFBQTs7QUFBQSxDQUFBLEVBQVcsSUFBWCxrQkFBVzs7QUFDWCxDQURBLEVBQ1UsSUFBVixFQUFVOztBQUVWLENBSEEsRUFHaUIsR0FBWCxDQUFOLEVBQW1CO0NBRWpCLENBQUEsRUFBQSxHQUFBO0NBQUEsQ0FFQSxDQUFHLEtBQUgsQ0FBaUI7Q0FFUCxDQUFvQixDQUE1QixJQUFPLElBQVAsR0FBQTtDQUZGLEVBQWlCO0NBSVQsQ0FBUixDQUE0QixJQUFyQixFQUFQLE1BQUE7Q0FLRSxPQUFBLGtCQUFBO0NBQUEsRUFBRyxDQUFIO0FBQ0EsQ0FBQTtVQUFBLG9DQUFBOzRCQUFBO0NBQ0UsRUFBRyxDQUFTLEVBQVosS0FBQSxNQUFZO0NBRGQ7cUJBTjBCO0NBQTVCLEVBQTRCO0NBUmIifX0seyJvZmZzZXQiOnsibGluZSI6NjM3MiwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2NvbXBvbmVudHMvbG9nb3V0X2xpbmsuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbInVzZXJfY29udHJvbGxlciA9IHJlcXVpcmUgJ2FwcC9jb250cm9sbGVycy91c2VyJ1xuXG5tb2R1bGUuZXhwb3J0cyA9ICggZG9tICkgLT5cblxuXHRkb20ub24gJ2NsaWNrJywgKCBlICkgLT5cblx0XHRlLnByZXZlbnREZWZhdWx0KClcblx0XHRlLnN0b3BQcm9wYWdhdGlvbigpXG5cblx0XHR1c2VyX2NvbnRyb2xsZXIubG9nb3V0ICggZXJyb3IgKSAtPlxuXG4gICAgICBpZiBlcnJvciB0aGVuIGNvbnNvbGUuZXJyb3IgZXJyb3JcbiAgICAgIFxuXHRcdFx0bG9nIFwiW0xvZ291dExpbmtdIGxvZ291dCBzdWNjZWRlZWQuXCIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxXQUFBOztBQUFBLENBQUEsRUFBa0IsSUFBQSxRQUFsQixPQUFrQjs7QUFFbEIsQ0FGQSxFQUVpQixHQUFYLENBQU4sRUFBbUI7Q0FFZCxDQUFKLENBQUcsSUFBSCxFQUFBO0NBQ0MsR0FBQSxVQUFBO0NBQUEsR0FDQSxXQUFBO0NBREEsRUFHdUIsQ0FBdkIsQ0FBdUIsQ0FBdkIsR0FBeUIsTUFBVjtDQUVYLEdBQUcsQ0FBSCxDQUFBO0NBQXNCLElBQVIsRUFBTyxRQUFQO1FBRks7Q0FBdkIsSUFBdUI7Q0FJbEIsRUFBSixRQUFBLHFCQUFBO0NBUkYsRUFBZ0I7Q0FGQSJ9fSx7Im9mZnNldCI6eyJsaW5lIjo2MzkxLCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvY29tcG9uZW50cy9tb2RhbC5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBNb2RhbFxuXHRvcGVuZWQ6IGZhbHNlXG5cdGNvbnN0cnVjdG9yOiAoIEBkb20gKSAtPlxuXHRcdEBvdmVybGF5ID0gJCAnLm1kX292ZXJsYXknXG5cblxuXHRvcGVuOiAoICkgLT5cblx0XHRyZXR1cm4gaWYgQG9wZW5lZFxuXHRcdEBvcGVuZWQgPSB0cnVlXG5cblx0XHRAZG9tLmFkZENsYXNzICdtZF9zaG93J1xuXG5cdFx0QG92ZXJsYXkub2ZmKCAnY2xpY2snICkub24oICdjbGljaycsIEBjbG9zZSApXG5cblx0Y2xvc2U6ICggKSA9PlxuXHRcdHJldHVybiBpZiBub3QgQG9wZW5lZFxuXHRcdEBvcGVuZWQgPSBmYWxzZVxuXG5cdFx0QGRvbS5yZW1vdmVDbGFzcyAnbWRfc2hvdydcdFx0Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsQ0FBQTtHQUFBLCtFQUFBOztBQUFBLENBQUEsRUFBdUIsR0FBakIsQ0FBTjtDQUNDLEVBQVEsRUFBUixDQUFBOztDQUNhLENBQUEsQ0FBQSxZQUFHO0NBQ2YsRUFEZSxDQUFEO0NBQ2Qsb0NBQUE7Q0FBQSxFQUFXLENBQVgsR0FBQSxNQUFXO0NBRlosRUFDYTs7Q0FEYixFQUtNLENBQU4sS0FBTTtDQUNMLEdBQUEsRUFBQTtDQUFBLFdBQUE7TUFBQTtDQUFBLEVBQ1UsQ0FBVixFQUFBO0NBREEsRUFHSSxDQUFKLElBQUEsQ0FBQTtDQUVDLENBQUQsQ0FBQSxDQUFDLENBQUQsRUFBUSxJQUFSO0NBWEQsRUFLTTs7Q0FMTixFQWFPLEVBQVAsSUFBTztBQUNRLENBQWQsR0FBQSxFQUFBO0NBQUEsV0FBQTtNQUFBO0NBQUEsRUFDVSxDQUFWLENBREEsQ0FDQTtDQUVDLEVBQUcsQ0FBSCxLQUFELEVBQUE7Q0FqQkQsRUFhTzs7Q0FiUDs7Q0FERCJ9fSx7Im9mZnNldCI6eyJsaW5lIjo2NDI2LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvY29tcG9uZW50cy9tb2RhbF9oYW5kbGVyLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IGNsYXNzIE1vZGFsSGFuZGxlclxuXHRjb25zdHJ1Y3RvcjogKCBAZG9tICkgLT5cblx0XHR2aWV3Lm9uY2UgJ2JpbmRlZCcsIEBvbl9yZWFkeVxuXG5cdG9uX3JlYWR5OiAoICkgPT5cblx0XHRtb2RhbF90YXJnZXQgPSB2aWV3LmdldF9ieV9kb20gQGRvbS5kYXRhKCAnbW9kYWwnIClcblx0XHRAZG9tLm9uICdjbGljaycsIC0+IG1vZGFsX3RhcmdldC5vcGVuKCkiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxRQUFBO0dBQUEsK0VBQUE7O0FBQUEsQ0FBQSxFQUF1QixHQUFqQixDQUFOO0NBQ2MsQ0FBQSxDQUFBLG1CQUFHO0NBQ2YsRUFEZSxDQUFEO0NBQ2QsMENBQUE7Q0FBQSxDQUFvQixFQUFwQixJQUFBO0NBREQsRUFBYTs7Q0FBYixFQUdVLEtBQVYsQ0FBVTtDQUNULE9BQUEsSUFBQTtDQUFBLEVBQWUsQ0FBZixHQUErQixHQUFoQixFQUFmO0NBQ0MsQ0FBRCxDQUFJLENBQUgsR0FBRCxFQUFpQixFQUFqQjtDQUFpQyxHQUFiLFFBQVksQ0FBWjtDQUFwQixJQUFpQjtDQUxsQixFQUdVOztDQUhWOztDQUREIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjY0NTAsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9jb21wb25lbnRzL3BsYXllci5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiYXBwY2FzdCAgPSByZXF1aXJlICdhcHAvY29udHJvbGxlcnMvYXBwY2FzdCdcblxubW9kdWxlLmV4cG9ydHMgPSAoIGRvbSApIC0+XG5cbiAgIyBzaG9ydGN1dCB0byBkb20gdGFnc1xuICBhdWRpbyA9IGRvbS5maW5kICdhdWRpbydcbiAgdnUgICAgPSBkb20uZmluZCAnLnZ1J1xuICBcbiAgIyBncmFicyBzdHJlYW0gdXJsIGZyb20gRE9NIGF0dHJpYnV0ZVxuICBzdHJlYW0gPSBhdWRpby5kYXRhICdzcmMnXG5cbiAgIyBoaWRlIGl0ZW1zIHdoZW4gaW5pdGlhbGl6aW5nXG4gIGF1ZGlvLmhpZGUoKVxuXG4gIGFwcGNhc3Qub24gJ2Nvbm5lY3RlZCcsICggc3RhdHVzICkgLT5cblxuICAgIGlmIHN0YXR1c1xuICAgICAgZG9tLmZpbmQoICcuc3RhdHVzJyApLmh0bWwgJy4uLiB3YWl0aW5nIHN0cmVhbSB0byBzdGFydCAuLi4nXG4gICAgZWxzZVxuICAgICAgZG9tLmZpbmQoICcuc3RhdHVzJyApLmh0bWwgJy4uLiB3YWl0aW5nIEFwcENhc3QgdG8gc3RhcnQgLi4uJ1xuXG4gIGFwcGNhc3Qub24gXCJzdHJlYW06ZXJyb3JcIiwgKCBlcnJvciApIC0+XG4gICAgaWYgbm90IGVycm9yIHRoZW4gcmV0dXJuXG5cbiAgICBkb20uZmluZCggJy5zdGF0dXMnICkuaHRtbCBcIi4uLiAje2Vycm9yfSAuLi5cIlxuXG4gICMgdGVtcG9yYXJ5IHNvbHV0aW9uIHdoaWxlIHdlIGRvbid0IGhhdmUgYXBwY2FzdHMgdG8gdGhlIHdlYnNlcnZlclxuICAjIGNoZWNrIHN0cmVhbSBzdGF0dXMgYW5kIHJldHJpZXMgMTAwbXMgYWZ0ZXIgcmVzcG9uc2VcbiAgY2hlY2tfc3RyZWFtID0gLT5cblxuICAgICQuZ2V0IHN0cmVhbSwgKCBlcnJvciwgcmVzcG9uc2UgKSAtPlxuXG4gICAgICBpZiBlcnJvclxuXG4gICAgICAgICMgdHJ5IGFnYWluXG4gICAgICAgIGRlbGF5IDEwMCwgY2hlY2tfc3RyZWFtXG5cbiAgICAgICAgcmV0dXJuIGNvbnNvbGUuZXJyb3IgJy0gZXJyb3IgbG9hZGluZyBzdHJlYW1pbmcnXG5cbiAgICAgIGNvbnNvbGUud2FybiAnKyBhbGwgZ29vZCEnXG5cbiAgIyBUT0RPOiBTZXQgQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luIG9uIHN0cmVhbWluZyBzZXJ2ZXIgc28gamF2YXNjcmlwdFxuICAjIHdpbGwgYmUgYWJsZSB0byBjaGVjayBzdHJlYW0gc3RhdHVzXG5cbiAgIyBkbyBjaGVja19zdHJlYW1cblxuXG4gICMgcmVsb2FkIGF1ZGlvIHRhZ1xuICBzdGFydF9hdWRpbyA9IC0+IFxuICAgIGF1ZGlvLmF0dHIgJ3NyYycsIGF1ZGlvLmRhdGEgJ3NyYydcbiAgICBhdWRpby5zaG93KClcblxuICBzdG9wX2F1ZGlvID0gLT5cbiAgICBhdWRpby5zdG9wKClcbiAgICBhdWRpby5oaWRlKClcblxuICAjIHRlbXBvcmFyeSBoYWNrIHRvIHN0YXJ0IGF1ZGlvIG9ubHkgYWZ0ZXIgc3RyZWFtIHN0YXJ0c1xuICBhcHBjYXN0Lm9uICdzdHJlYW06b25saW5lJywgKCBzdGF0dXMgKSAtPlxuXG4gICAgaWYgc3RhdHVzXG4gICAgICBzdGFydF9hdWRpbygpXG4gICAgZWxzZVxuICAgICAgc3RvcF9hdWRpbygpXG5cbiAgIyBjb25zb2xlLndhcm4gXCJsaXN0ZW5pbmcgZm9yIHZ1XCJcbiAgIyB0ZW1wb3JhcnkgaGFjayB0byBzdGFydCBhdWRpbyBvbmx5IGFmdGVyIHN0cmVhbSBzdGFydHNcbiAgYXBwY2FzdC5vbiAnc3RyZWFtOnZ1JywgKCBtZXRlciApIC0+XG5cbiAgICB2dS5maW5kKCAnLm1ldGVyX2xlZnQnICkud2lkdGggbWV0ZXJbMF0gKiAxMDAwXG4gICAgdnUuZmluZCggJy5tZXRlcl9yaWdodCcgKS53aWR0aCBtZXRlclsxXSAqIDEwMDAiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxHQUFBOztBQUFBLENBQUEsRUFBVyxJQUFYLGtCQUFXOztBQUVYLENBRkEsRUFFaUIsR0FBWCxDQUFOLEVBQW1CO0NBR2pCLEtBQUEsa0RBQUE7Q0FBQSxDQUFBLENBQVEsQ0FBQSxDQUFSLEVBQVE7Q0FBUixDQUNBLENBQVEsQ0FBQSxDQUFBO0NBRFIsQ0FJQSxDQUFTLENBQUEsQ0FBSyxDQUFkO0NBSkEsQ0FPQSxFQUFBLENBQUs7Q0FQTCxDQVNBLENBQXdCLEdBQUEsQ0FBakIsRUFBbUIsRUFBMUI7Q0FFRSxHQUFBLEVBQUE7Q0FDTSxFQUFELENBQUgsS0FBQSxJQUFBLG9CQUFBO01BREY7Q0FHTSxFQUFELENBQUgsS0FBQSxJQUFBLHFCQUFBO01BTG9CO0NBQXhCLEVBQXdCO0NBVHhCLENBZ0JBLENBQTJCLEVBQUEsRUFBcEIsRUFBc0IsS0FBN0I7QUFDUyxDQUFQLEdBQUEsQ0FBQTtDQUFrQixXQUFBO01BQWxCO0NBRUksRUFBRCxDQUFILENBQTRCLENBQUEsR0FBNUIsRUFBQTtDQUhGLEVBQTJCO0NBaEIzQixDQXVCQSxDQUFlLE1BQUEsR0FBZjtDQUVHLENBQWEsQ0FBZCxFQUFjLENBQWQsRUFBYyxDQUFFLEVBQWhCO0NBRUUsR0FBRyxDQUFILENBQUE7Q0FHRSxDQUFXLENBQVgsRUFBQSxHQUFBLElBQUE7Q0FFQSxJQUFPLEVBQU8sUUFBUCxZQUFBO1FBTFQ7Q0FPUSxHQUFSLEdBQU8sTUFBUDtDQVRGLElBQWM7Q0F6QmhCLEVBdUJlO0NBdkJmLENBMkNBLENBQWMsTUFBQSxFQUFkO0NBQ0UsQ0FBa0IsRUFBbEIsQ0FBSztDQUNDLEdBQU4sQ0FBSyxNQUFMO0NBN0NGLEVBMkNjO0NBM0NkLENBK0NBLENBQWEsTUFBQSxDQUFiO0NBQ0UsR0FBQSxDQUFLO0NBQ0MsR0FBTixDQUFLLE1BQUw7Q0FqREYsRUErQ2E7Q0EvQ2IsQ0FvREEsQ0FBNEIsR0FBQSxDQUFyQixFQUF1QixNQUE5QjtDQUVFLEdBQUEsRUFBQTtDQUNFLFVBQUEsRUFBQTtNQURGO0NBR0UsU0FBQSxHQUFBO01BTHdCO0NBQTVCLEVBQTRCO0NBU3BCLENBQVIsQ0FBd0IsRUFBQSxFQUFqQixFQUFQLEVBQUE7Q0FFRSxDQUFFLENBQXdDLENBQTFDLENBQUEsUUFBQTtDQUNHLENBQUQsQ0FBeUMsQ0FBM0MsQ0FBQSxNQUFBLEdBQUE7Q0FIRixFQUF3QjtDQWhFVCJ9fSx7Im9mZnNldCI6eyJsaW5lIjo2NTA1LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvY29tcG9uZW50cy9wb3B1cF9oYW5kbGVyLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFBvcHVwSGFuZGxlclxuXHRjb25zdHJ1Y3RvcjogKCBAZG9tICkgLT5cblx0XHRAdXJsICAgICA9IEBkb20uZGF0YSAndXJsJ1xuXHRcdEB0aXRsZSAgID0gQGRvbS5kYXRhICd0aXRsZSdcblx0XHRAdyAgICAgICA9IEBkb20uZGF0YSAndydcblx0XHRAaCAgICAgICA9IEBkb20uZGF0YSAnaCdcblxuXHRcdEBkb20ub24gJ2NsaWNrJywgQG9wZW5cblx0XHRcblx0b3BlbjogKCApID0+XG5cdFx0bGVmdCA9IChhcHAud2luZG93LncvMiktKEB3LzIpO1xuXHRcdHRvcCA9IChhcHAud2luZG93LmgvMiktKEBoLzIpO1xuXG5cdFx0cGFyYW1zID0gJ3Rvb2xiYXI9bm8sIGxvY2F0aW9uPW5vLCBkaXJlY3Rvcmllcz1ubywgc3RhdHVzPW5vLCBtZW51YmFyPW5vLCBzY3JvbGxiYXJzPW5vLCByZXNpemFibGU9bm8sIGNvcHloaXN0b3J5PW5vLCB3aWR0aD0nK0B3KycsIGhlaWdodD0nK0BoKycsIHRvcD0nK3RvcCsnLCBsZWZ0PScrbGVmdFxuXG5cdFx0bG9nIFwicGFyYW1zXCIsIHBhcmFtc1xuXHRcdGxvZyBcInVybFwiLCBAdXJsXG5cdFx0bG9nIFwidGl0bGVcIiwgQHRpdGxlXG5cblx0XHRyZXR1cm4gd2luZG93Lm9wZW4oQHVybCwgQHRpdGxlLCBwYXJhbXMpLmZvY3VzKCk7XG5cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFFBQUE7R0FBQSwrRUFBQTs7QUFBQSxDQUFBLEVBQXVCLEdBQWpCLENBQU47Q0FDYyxDQUFBLENBQUEsbUJBQUc7Q0FDZixFQURlLENBQUQ7Q0FDZCxrQ0FBQTtDQUFBLEVBQUEsQ0FBQSxDQUFXO0NBQVgsRUFDVyxDQUFYLENBQUEsRUFBVztDQURYLEVBRVcsQ0FBWDtDQUZBLEVBR1csQ0FBWDtDQUhBLENBS0EsQ0FBSSxDQUFKLEdBQUE7Q0FORCxFQUFhOztDQUFiLEVBUU0sQ0FBTixLQUFNO0NBQ0wsT0FBQSxTQUFBO0NBQUEsRUFBTyxDQUFQLEVBQWtCO0NBQWxCLEVBQ0EsQ0FBQSxFQUFpQjtDQURqQixFQUdTLENBQVQsRUFBQSxFQUFTLENBQUEsRUFBQSwwR0FBQTtDQUhULENBS2MsQ0FBZCxDQUFBLEVBQUEsRUFBQTtDQUxBLENBTVcsQ0FBWCxDQUFBLENBQUE7Q0FOQSxDQU9hLENBQWIsQ0FBQSxDQUFBLEVBQUE7Q0FFQSxDQUF5QixDQUFsQixDQUFBLENBQUEsQ0FBTSxLQUFOO0NBbEJSLEVBUU07O0NBUk47O0NBREQifX0seyJvZmZzZXQiOnsibGluZSI6NjUzNiwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2NvbXBvbmVudHMvc2Nyb2xsX2hhbmRsZXIuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gY2xhc3MgU2Nyb2xsSGFuZGxlclxuXHRjb25zdHJ1Y3RvcjogKCBAZG9tICkgLT5cblxuXHRcdHRhcmdldCA9ICQgQGRvbS5kYXRhKCAndGFyZ2V0JyApXG5cdFx0cmV0dXJuIGlmIHRhcmdldC5sZW5ndGggPD0gMFxuXG5cdFx0QGRvbS5hZGRDbGFzcyAnc2Nyb2xsX2hhbmRsZXInXG5cdFx0XG5cdFx0QGRvbS5vbiAnY2xpY2snLCAtPlxuXHRcdFx0bW92ZXIuc2Nyb2xsX3RvIHRhcmdldCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFNBQUE7O0FBQUEsQ0FBQSxFQUF1QixHQUFqQixDQUFOO0NBQ2MsQ0FBQSxDQUFBLG9CQUFHO0NBRWYsS0FBQSxFQUFBO0NBQUEsRUFGZSxDQUFEO0NBRWQsRUFBUyxDQUFULEVBQUEsRUFBVztDQUNYLEdBQUEsRUFBZ0I7Q0FBaEIsV0FBQTtNQURBO0NBQUEsRUFHSSxDQUFKLElBQUEsUUFBQTtDQUhBLENBS0EsQ0FBSSxDQUFKLEdBQUEsRUFBaUI7Q0FDVixJQUFELENBQUwsR0FBQSxJQUFBO0NBREQsSUFBaUI7Q0FQbEIsRUFBYTs7Q0FBYjs7Q0FERCJ9fSx7Im9mZnNldCI6eyJsaW5lIjo2NTU4LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvY29tcG9uZW50cy9zdHJlYW1fY29udHJvbHMuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbInVzZXJfY29udHJvbGxlciA9IHJlcXVpcmUgJ2FwcC9jb250cm9sbGVycy91c2VyJ1xuXG4jIFRPRE86IGFuaW1hdGlvbiBmb3IgY29udHJvbHMgaW4gYW5kIG91dFxuXG5tb2R1bGUuZXhwb3J0cyA9ICggZG9tICkgLT5cblxuICAjIHdhaXRzIG1vZGVsIGdldCB1c2VyIG5hbWVcbiAgdXNlcl9jb250cm9sbGVyLm9uICd1c2VyOmxvZ2dlZCcsICggdXNlciApIC0+XG5cbiAgICBjb25zb2xlLmxvZyAndXNlciBsb2dnZWQgLT4nLCB1c2VyLnVzZXJuYW1lXG5cbiAgICBpZiBcIi8je3VzZXIudXNlcm5hbWV9XCIgaXMgd2F5cy5wYXRobmFtZSgpXG4gICAgICAkKCAnLmNvbnRyb2xzJyApLnNob3coKVxuXG5cbiAgdXNlcl9jb250cm9sbGVyLm9uICd1c2VyOnVubG9nZ2VkJywgLT5cbiAgICAkKCAnLmNvbnRyb2xzJyApLmhpZGUoKVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsV0FBQTs7QUFBQSxDQUFBLEVBQWtCLElBQUEsUUFBbEIsT0FBa0I7O0FBSWxCLENBSkEsRUFJaUIsR0FBWCxDQUFOLEVBQW1CO0NBR2pCLENBQUEsQ0FBa0MsQ0FBQSxLQUFFLElBQXBDLEVBQWU7Q0FFYixDQUE4QixDQUE5QixDQUFBLEdBQU8sQ0FBUCxRQUFBO0NBRUEsRUFBSSxDQUFKLENBQTBCLEdBQXZCO0NBQ0QsR0FBQSxPQUFBLEVBQUE7TUFMOEI7Q0FBbEMsRUFBa0M7Q0FRbEIsQ0FBaEIsQ0FBb0MsTUFBcEMsTUFBZTtDQUNiLEdBQUEsT0FBQTtDQURGLEVBQW9DO0NBWHJCIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjY1NzYsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9leHBsb3JlLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEV4cGxvcmVcblx0Y29uc3RydWN0b3I6ICggQGRvbSApIC0+Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsR0FBQTs7QUFBQSxDQUFBLEVBQXVCLEdBQWpCLENBQU47Q0FDYyxDQUFBLENBQUEsY0FBRztDQUFPLEVBQVAsQ0FBRDtDQUFmLEVBQWE7O0NBQWI7O0NBREQifX0seyJvZmZzZXQiOnsibGluZSI6NjU4OSwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2hlYWRlci5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsibmF2aWdhdGlvbiAgICAgID0gcmVxdWlyZSAnYXBwL2NvbnRyb2xsZXJzL25hdmlnYXRpb24nXG51c2VyX2NvbnRyb2xsZXIgPSByZXF1aXJlICdhcHAvY29udHJvbGxlcnMvdXNlcidcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBIZWFkZXJcblxuXHRjdXJyZW50X3BhZ2U6IFwiXCJcblx0dXNlcl9sb2dnZWQ6IGZhbHNlXG5cblx0Y29uc3RydWN0b3I6ICggQGRvbSApIC0+XG5cdFx0dXNlcl9jb250cm9sbGVyLm9uICd1c2VyOmxvZ2dlZCcsIEBvbl91c2VyX2xvZ2dlZFxuXHRcdHVzZXJfY29udHJvbGxlci5vbiAndXNlcjp1bmxvZ2dlZCcsIEBvbl91c2VyX3VubG9nZ2VkXG5cblx0XHRuYXZpZ2F0aW9uLm9uICdhZnRlcl9yZW5kZXInLCBAY2hlY2tfbWVudVxuXG5cdGNoZWNrX21lbnU6ID0+XG5cdFx0b2JqID0gJCggJ1tkYXRhLW1lbnVdJyApXG5cdFx0aWYgb2JqLmxlbmd0aCA+IDBcblx0XHRcdHBhZ2UgPSBvYmouZGF0YSAnbWVudSdcblx0XHRcdGxvZyBcIltIZWFkZXJdIGNoZWNrX21lbnVcIiwgcGFnZVxuXHRcdFx0XG5cdFx0XHRpZiBAY3VycmVudF9wYWdlLmxlbmd0aCA+IDBcblx0XHRcdFx0QGRvbS5maW5kKCBcIi4je0BjdXJyZW50X3BhZ2V9X2l0ZW1cIiApLnJlbW92ZUNsYXNzIFwic2VsZWN0ZWRcIlxuXHRcdFx0XHRhcHAuYm9keS5yZW1vdmVDbGFzcyBcIiN7QGN1cnJlbnRfcGFnZX1fcGFnZVwiXG5cblx0XHRcdEBkb20uZmluZCggXCIuI3twYWdlfV9pdGVtXCIgKS5hZGRDbGFzcyBcInNlbGVjdGVkXCJcblx0XHRcdGFwcC5ib2R5LmFkZENsYXNzIFwiI3twYWdlfV9wYWdlXCJcblxuXHRcdFx0QGN1cnJlbnRfcGFnZSA9IHBhZ2VcblxuXG5cdG9uX3VzZXJfbG9nZ2VkOiAoIGRhdGEgKSA9PlxuXG5cdFx0cmV0dXJuIGlmIEB1c2VyX2xvZ2dlZFxuXHRcdEB1c2VyX2xvZ2dlZCA9IHRydWVcblx0XHRcblx0XHR3cmFwcGVyID0gQGRvbS5maW5kKCAnLnVzZXJfbG9nZ2VkJyApXG5cdFx0dG1wbCAgICA9IHJlcXVpcmUgJ3RlbXBsYXRlcy9zaGFyZWQvaGVhZGVyX3VzZXJfbG9nZ2VkJ1xuXHRcdGh0bWwgICAgPSB0bXBsIGRhdGFcblxuXHRcdGxvZyBcIltIZWFkZXJdIG9uX3VzZXJfbG9nZ2VkXCIsIGRhdGEsIGh0bWxcblxuXHRcdGxvZyBcIndyYXBwZXJcIiwgd3JhcHBlci5sZW5ndGgsIHdyYXBwZXJcblxuXHRcdHdyYXBwZXIuZW1wdHkoKS5hcHBlbmQgaHRtbFxuXG5cdFx0dmlldy5iaW5kIHdyYXBwZXJcblxuXG5cblx0b25fdXNlcl91bmxvZ2dlZDogKCBkYXRhICkgPT5cblx0XHRyZXR1cm4gaWYgbm90IEB1c2VyX2xvZ2dlZFxuXHRcdEB1c2VyX2xvZ2dlZCA9IGZhbHNlXG5cdFx0bG9nIFwiW0hlYWRlcl0gb25fdXNlcl91bmxvZ2dlZFwiLCBkYXRhIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsK0JBQUE7R0FBQSwrRUFBQTs7QUFBQSxDQUFBLEVBQWtCLElBQUEsR0FBbEIsa0JBQWtCOztBQUNsQixDQURBLEVBQ2tCLElBQUEsUUFBbEIsT0FBa0I7O0FBRWxCLENBSEEsRUFHdUIsR0FBakIsQ0FBTjtDQUVDLENBQUEsQ0FBYyxTQUFkOztDQUFBLEVBQ2EsRUFEYixNQUNBOztDQUVhLENBQUEsQ0FBQSxhQUFHO0NBQ2YsRUFEZSxDQUFEO0NBQ2QsMERBQUE7Q0FBQSxzREFBQTtDQUFBLDhDQUFBO0NBQUEsQ0FBQSxFQUFBLFNBQUEsQ0FBQSxDQUFlO0NBQWYsQ0FDQSxFQUFBLFdBQWUsQ0FBZjtDQURBLENBR0EsRUFBQSxNQUFVLElBQVY7Q0FQRCxFQUdhOztDQUhiLEVBU1ksTUFBQSxDQUFaO0NBQ0MsT0FBQSxDQUFBO0NBQUEsRUFBQSxDQUFBLFNBQU07Q0FDTixFQUFNLENBQU4sRUFBRztDQUNGLEVBQU8sQ0FBUCxFQUFBO0NBQUEsQ0FDMkIsQ0FBM0IsQ0FBQSxFQUFBLGVBQUE7Q0FFQSxFQUEwQixDQUF2QixFQUFILE1BQWdCO0NBQ2YsRUFBSSxDQUFILEdBQUQsQ0FBQSxFQUFBLENBQUEsQ0FBWTtDQUFaLENBQ3FCLENBQWxCLENBQUssR0FBUixDQUFBLEdBQUEsQ0FBcUI7UUFMdEI7Q0FBQSxFQU9JLENBQUgsRUFBRCxDQUFBLENBQUEsRUFBQTtDQVBBLENBUWtCLENBQWYsQ0FBSyxFQUFSLENBQUEsQ0FBQTtDQUVDLEVBQWUsQ0FBZixRQUFELENBQUE7TUFiVTtDQVRaLEVBU1k7O0NBVFosRUF5QmdCLENBQUEsS0FBRSxLQUFsQjtDQUVDLE9BQUEsV0FBQTtDQUFBLEdBQUEsT0FBQTtDQUFBLFdBQUE7TUFBQTtDQUFBLEVBQ2UsQ0FBZixPQUFBO0NBREEsRUFHVSxDQUFWLEdBQUEsT0FBVTtDQUhWLEVBSVUsQ0FBVixHQUFVLDhCQUFBO0NBSlYsRUFLVSxDQUFWO0NBTEEsQ0FPK0IsQ0FBL0IsQ0FBQSxxQkFBQTtDQVBBLENBU2UsQ0FBZixDQUFBLEVBQUEsQ0FBc0IsRUFBdEI7Q0FUQSxHQVdBLENBQUEsQ0FBQSxDQUFPO0NBRUYsR0FBRCxHQUFKLElBQUE7Q0F4Q0QsRUF5QmdCOztDQXpCaEIsRUE0Q2tCLENBQUEsS0FBRSxPQUFwQjtBQUNlLENBQWQsR0FBQSxPQUFBO0NBQUEsV0FBQTtNQUFBO0NBQUEsRUFDZSxDQUFmLENBREEsTUFDQTtDQUNJLENBQTZCLENBQWpDLENBQUEsT0FBQSxnQkFBQTtDQS9DRCxFQTRDa0I7O0NBNUNsQjs7Q0FMRCJ9fSx7Im9mZnNldCI6eyJsaW5lIjo2NjU2LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvaG9tZXBhZ2UuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbInByZWxvYWQgPSByZXF1aXJlICdhcHAvdXRpbHMvcHJlbG9hZCdcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBIb21lcGFnZVxuXHRjb25zdHJ1Y3RvcjogKEBkb20pIC0+XG5cblx0XHRlbGVtZW50cyA9IFtdXG5cdFx0aW1hZ2VzID0gW11cblxuXHRcdEBkb20uZmluZCggJy5wYXJhbGxheC1jb250YWluZXInICkuZWFjaCAtPlxuXHRcdFx0ZWxlbWVudHMucHVzaCAkKCBAIClcblx0XHRcdGltYWdlcy5wdXNoICQoIEAgKS5kYXRhKCAnaW1hZ2UtcGFyYWxsYXgnIClcblxuXHRcdHByZWxvYWQgaW1hZ2VzLCAoIGltYWdlc19sb2FkZWQgKS0+XG5cblx0XHRcdGZvciBlbCwgaSBpbiBlbGVtZW50c1xuXHRcdFx0XHRlbC5wYXJhbGxheFxuXHRcdFx0XHRcdGltYWdlU3JjICAgICA6IGltYWdlc19sb2FkZWRbIGkgXS5zcmNcblx0XHRcdFx0XHRibGVlZCAgICAgICAgOiAxMFxuXHRcdFx0XHRcdHBhcmFsbGF4ICAgICA6ICdzY3JvbGwnXG5cdFx0XHRcdFx0bmF0dXJhbFdpZHRoIDogaW1hZ2VzX2xvYWRlZFsgaSBdLndpZHRoXG5cdFx0XHRcdFx0bmF0dXJhbGhlaWdodDogaW1hZ2VzX2xvYWRlZFsgaSBdLmhlaWdodFxuXG5cdFx0XHRkZWxheSAxMDAsID0+IGFwcC53aW5kb3cub2JqLnRyaWdnZXIgJ3Jlc2l6ZSdcblxuXG5cdGRlc3Ryb3k6ICggKSAtPlxuXHRcdHAgPSAkKCAnLnBhcmFsbGF4LW1pcnJvcicgKVxuXHRcdHAuYWRkQ2xhc3MoICdoaWRlJyApXG5cdFx0ZGVsYXkgMzAwLCAtPiBwLnJlbW92ZSgpIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsYUFBQTs7QUFBQSxDQUFBLEVBQVUsSUFBVixZQUFVOztBQUVWLENBRkEsRUFFdUIsR0FBakIsQ0FBTjtDQUNjLENBQUEsQ0FBQSxlQUFFO0NBRWQsT0FBQSxRQUFBO0NBQUEsRUFGYyxDQUFEO0NBRWIsQ0FBQSxDQUFXLENBQVgsSUFBQTtDQUFBLENBQUEsQ0FDUyxDQUFULEVBQUE7Q0FEQSxFQUdJLENBQUosS0FBd0MsWUFBeEM7Q0FDQyxHQUFBLEVBQUEsRUFBUTtDQUNELEdBQVAsRUFBTSxPQUFOLEdBQVk7Q0FGYixJQUF3QztDQUh4QyxDQU9nQixDQUFBLENBQWhCLEVBQUEsQ0FBQSxFQUFrQixJQUFGO0NBRWYsU0FBQSxLQUFBO1NBQUEsR0FBQTtBQUFBLENBQUEsVUFBQSw0Q0FBQTswQkFBQTtDQUNDLENBQUUsTUFBRjtDQUNDLENBQWUsQ0FBZixLQUFBLEVBQUEsR0FBOEI7Q0FBOUIsQ0FDZSxHQUFmLEtBQUE7Q0FEQSxDQUVlLE1BQWYsRUFBQTtDQUZBLENBR2UsR0FIZixLQUdBLEVBQUEsQ0FBOEI7Q0FIOUIsQ0FJZSxJQUpmLElBSUEsR0FBQTtDQUxELFNBQUE7Q0FERCxNQUFBO0NBUU0sQ0FBSyxDQUFYLEVBQUEsSUFBVyxJQUFYO0NBQWtCLEVBQUQsR0FBTyxDQUFWLENBQUEsT0FBQTtDQUFkLE1BQVc7Q0FWWixJQUFnQjtDQVRqQixFQUFhOztDQUFiLEVBc0JTLElBQVQsRUFBUztDQUNSLE9BQUE7Q0FBQSxFQUFJLENBQUosY0FBSTtDQUFKLEdBQ0EsRUFBQSxFQUFBO0NBQ00sQ0FBSyxDQUFYLEVBQUEsSUFBVyxFQUFYO0NBQWUsS0FBRCxPQUFBO0NBQWQsSUFBVztDQXpCWixFQXNCUzs7Q0F0QlQ7O0NBSEQifX0seyJvZmZzZXQiOnsibGluZSI6NjcwNCwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2xvYWRpbmcuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIm5hdmlnYXRpb24gICAgICAgIFx0PSByZXF1aXJlICdhcHAvY29udHJvbGxlcnMvbmF2aWdhdGlvbidcbk9wYWNpdHkgXHRcdFx0PSByZXF1aXJlICdhcHAvdXRpbHMvb3BhY2l0eSdcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBMb2FkaW5nXG5cdGZpcnN0X3RpbWU6IG9uXG5cdGNvbnN0cnVjdG9yOiAoIEBkb20gKSAtPlxuXHRcdG5hdmlnYXRpb24ub24gJ2JlZm9yZV9kZXN0cm95JywgPT5cblx0XHRcdGFwcC5ib2R5LmFkZENsYXNzKCAnbG9hZGluZycgKS5yZW1vdmVDbGFzcyggJ2xvYWRlZCcgKVxuXHRcdFx0T3BhY2l0eS5zaG93IEBkb20sIDEwMFxuXG5cdFx0bmF2aWdhdGlvbi5vbiAnYWZ0ZXJfcmVuZGVyJywgPT4gXG5cdFx0XHRpZiBAZmlyc3RfdGltZVxuXHRcdFx0XHRhcHAuYm9keS5hZGRDbGFzcyAnZmlyc3RfbG9hZGVkJ1xuXHRcdFx0XHRAZmlyc3RfdGltZSA9IG9mZlxuXHRcdFx0YXBwLmJvZHkucmVtb3ZlQ2xhc3MoICdsb2FkaW5nJyApLmFkZENsYXNzKCAnbG9hZGVkJyApXG5cdFx0XHRPcGFjaXR5LmhpZGUgQGRvbSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLHdCQUFBOztBQUFBLENBQUEsRUFBcUIsSUFBQSxHQUFyQixrQkFBcUI7O0FBQ3JCLENBREEsRUFDYSxJQUFiLFlBQWE7O0FBRWIsQ0FIQSxFQUd1QixHQUFqQixDQUFOO0NBQ0MsRUFBWSxDQUFaLE1BQUE7O0NBQ2EsQ0FBQSxDQUFBLGNBQUc7Q0FDZixPQUFBLElBQUE7Q0FBQSxFQURlLENBQUQ7Q0FDZCxDQUFBLENBQWdDLENBQWhDLEtBQWdDLENBQXRCLE1BQVY7Q0FDQyxFQUFHLENBQUssRUFBUixFQUFBLENBQUEsRUFBQTtDQUNRLENBQVcsQ0FBbkIsQ0FBQSxDQUFjLEVBQVAsTUFBUDtDQUZELElBQWdDO0NBQWhDLENBSUEsQ0FBOEIsQ0FBOUIsS0FBOEIsQ0FBcEIsSUFBVjtDQUNDLEdBQUcsQ0FBQyxDQUFKLElBQUE7Q0FDQyxFQUFHLENBQUssSUFBUixNQUFBO0NBQUEsRUFDYyxFQUFiLEdBQUQsRUFBQTtRQUZEO0NBQUEsRUFHRyxDQUFLLEVBQVIsRUFBQSxDQUFBLEVBQUE7Q0FDUSxFQUFSLENBQUEsQ0FBYyxFQUFQLE1BQVA7Q0FMRCxJQUE4QjtDQU4vQixFQUNhOztDQURiOztDQUpEIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjY3MzYsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9sb2dpbi5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiTmF2aWdhdGlvbiA9IHJlcXVpcmUgJ2FwcC9jb250cm9sbGVycy9uYXZpZ2F0aW9uJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIExvZ2luXG5cdGNvbnN0cnVjdG9yOiAoIEBkb20gKSAtPlxuXG5cdFx0dW5sZXNzIHdpbmRvdy5vcGVuZXI/XG5cdFx0XHRhcHAuYm9keS5yZW1vdmVDbGFzcyBcImxvZ2luX3BhZ2VcIlxuXHRcdFx0TmF2aWdhdGlvbi5nbyAnLydcblx0XHRcblx0XHRAdXNlcm5hbWUgPSBAZG9tLmZpbmQoICcudXNlcm5hbWUnIClcblx0XHRAcGFzc3dvcmQgPSBAZG9tLmZpbmQoICcucGFzc3dvcmQnIClcblxuXHRcdEBkb20uZmluZCggJy5mYWNlYm9vaycgKS5vbiAnY2xpY2snLCBAX2ZhY2Vib29rX2xvZ2luXG5cdFx0QGRvbS5maW5kKCAnLnNvdW5kY2xvdWQnICkub24gJ2NsaWNrJywgQF9zb3VuZGNsb3VkX2xvZ2luXG5cdFx0QGRvbS5maW5kKCAnLmdvb2dsZScgKS5vbiAnY2xpY2snLCBAX2dvb2dsZV9sb2dpblxuXG5cdFx0XG5cdFx0IyBAZG9tLmZpbmQoICcuc2lnbmluJyApLm9uICdjbGljaycsIEBfY3VzdG9tX2xvZ2luXG5cblx0XHQjIEBkb20uZmluZCggJ2lucHV0JyApLmtleXByZXNzIChldmVudCkgPT5cblx0XHQjIFx0aWYgZXZlbnQud2hpY2ggaXMgMTNcblx0XHQjIFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdCMgXHRcdEBfY3VzdG9tX2xvZ2luKClcblx0XHQjIFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcdFxuXG5cdF9mYWNlYm9va19sb2dpbjogKCApID0+XG5cdFx0bG9nIFwiW0xvZ2luXSBfZmFjZWJvb2tfbG9naW5cIlxuXG5cdF9zb3VuZGNsb3VkX2xvZ2luOiAoICkgPT5cblx0XHRsb2cgXCJbTG9naW5dIF9zb3VuZGNsb3VkX2xvZ2luXCJcblxuXHRfZ29vZ2xlX2xvZ2luOiAoICkgPT5cblx0XHRsb2cgXCJbTG9naW5dIF9nb29nbGVfbG9naW5cIlxuXG5cdCMgX2N1c3RvbV9sb2dpbjogKCApID0+XG5cdCMgXHRAZG9tLnJlbW92ZUNsYXNzIFwiZXJyb3JcIlxuXHQjIFx0aWYgQHVzZXJuYW1lLnZhbCgpLmxlbmd0aCA8PSAwIG9yIEBwYXNzd29yZC52YWwoKS5sZW5ndGggPD0gMFxuXHQjIFx0XHRsb2cgXCJbTG9naW5dIGVycm9yXCJcblx0IyBcdFx0QGRvbS5hZGRDbGFzcyBcImVycm9yXCJcblx0IyBcdFx0cmV0dXJuIGZhbHNlXG5cblx0IyBcdGRhdGE6XG5cdCMgXHRcdHVzZXJuYW1lOiBAdXNlcm5hbWUudmFsKClcblx0IyBcdFx0cGFzc3dvcmQ6IEBwYXNzd29yZC52YWwoKVxuXG5cdCMgXHRsb2cgXCJbTG9naW5dIHN1Ym1pdHRpbmcgZGF0YVwiLCBkYXRhXG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxhQUFBO0dBQUEsK0VBQUE7O0FBQUEsQ0FBQSxFQUFhLElBQUEsR0FBYixrQkFBYTs7QUFFYixDQUZBLEVBRXVCLEdBQWpCLENBQU47Q0FDYyxDQUFBLENBQUEsWUFBRztDQUVmLEVBRmUsQ0FBRDtDQUVkLG9EQUFBO0NBQUEsNERBQUE7Q0FBQSx3REFBQTtDQUFBLEdBQUEsaUJBQUE7Q0FDQyxFQUFHLENBQUssRUFBUixLQUFBLENBQUE7Q0FBQSxDQUNBLENBQUEsR0FBQSxJQUFVO01BRlg7Q0FBQSxFQUlZLENBQVosSUFBQSxHQUFZO0NBSlosRUFLWSxDQUFaLElBQUEsR0FBWTtDQUxaLENBT0EsQ0FBSSxDQUFKLEdBQUEsSUFBQSxJQUFBO0NBUEEsQ0FRQSxDQUFJLENBQUosR0FBQSxNQUFBLElBQUE7Q0FSQSxDQVNBLENBQUksQ0FBSixHQUFBLEVBQUEsSUFBQTtDQVhELEVBQWE7O0NBQWIsRUF1QmlCLE1BQUEsTUFBakI7Q0FDSyxFQUFKLFFBQUEsY0FBQTtDQXhCRCxFQXVCaUI7O0NBdkJqQixFQTBCbUIsTUFBQSxRQUFuQjtDQUNLLEVBQUosUUFBQSxnQkFBQTtDQTNCRCxFQTBCbUI7O0NBMUJuQixFQTZCZSxNQUFBLElBQWY7Q0FDSyxFQUFKLFFBQUEsWUFBQTtDQTlCRCxFQTZCZTs7Q0E3QmY7O0NBSEQifX0seyJvZmZzZXQiOnsibGluZSI6Njc3NiwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL3Byb2ZpbGUuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUHJvZmlsZSBcblx0Y29uc3RydWN0b3I6ICggQGRvbSApIC0+XG5cblx0XHRAZWxlbWVudHMgPSBcblx0XHRcdHByb2ZpbGVfcGljdHVyZTogQGRvbS5maW5kKCAnLnByb2ZpbGVfaW1hZ2UgaW1nJyApXG5cdFx0XHRjb3Zlcl9waWN0dXJlOiBAZG9tLmZpbmQoICcuY292ZXJfaW1hZ2UnIClcblx0XHRcdGxvY2F0aW9uOiBAZG9tLmZpbmQoICcubG9jYXRpb24nIClcblx0XHRcdGxvY2F0aW9uX2lucHV0OiBAZG9tLmZpbmQoICcubG9jYXRpb25faW5wdXQnIClcblx0XHRcdGJpbzogQGRvbS5maW5kKCAnLmJpbycgKVxuXHRcdFx0YmlvX2lucHV0OiBAZG9tLmZpbmQoICcuYmlvX2lucHV0JyApXG5cdFx0XHRsaW5rczogW1xuXHRcdFx0XHR7dHlwZTpcInNwb3RpZnlcIiwgZWw6QGRvbS5maW5kKCAnLnNwb3RpZnlfbGluaycgKX0sXG5cdFx0XHRcdHt0eXBlOlwic291bmRjbG91ZFwiLCBlbDpAZG9tLmZpbmQoICcuc291bmRjbG91ZF9saW5rJyApfSxcblx0XHRcdFx0e3R5cGU6XCJmYWNlYm9va1wiLCBlbDpAZG9tLmZpbmQoICcuZmFjZWJvb2tfbGluaycgKX1cblx0XHRcdF1cblx0XHRcdGxpbmtzX2lucHV0OiBbXG5cdFx0XHRcdHt0eXBlOlwic3BvdGlmeVwiLCBlbDpAZG9tLmZpbmQoICcuc3BvdGlmeV9pbnB1dCcgKX0sXG5cdFx0XHRcdHt0eXBlOlwic291bmRjbG91ZFwiLCBlbDpAZG9tLmZpbmQoICcuc291bmRjbG91ZF9pbnB1dCcgKX0sXG5cdFx0XHRcdHt0eXBlOlwiZmFjZWJvb2tcIiwgZWw6QGRvbS5maW5kKCAnLmZhY2Vib29rX2lucHV0JyApfVxuXHRcdFx0XVxuXG5cdFx0QGZha2VfdXNlciA9IFxuXHRcdFx0cHJvZmlsZV9waWN0dXJlOiBcIi9pbWFnZXMvcHJvZmlsZV9iaWcucG5nXCJcblx0XHRcdGNvdmVyX3BpY3R1cmU6IFwiL2ltYWdlcy9ob21lcGFnZV8yLmpwZ1wiXG5cdFx0XHRsb2NhdGlvbjogXCJMb25kb24gLSBVS1wiXG5cdFx0XHRiaW86IFwiVGhvbWFzIEFtdW5kc2VuIGZyb20gT3Nsbywgbm93IGJhc2VkIGluIExvbmRvbiBoYXMgZnJvbSBhbiBlYXJseSBhZ2UgbG90cyBvZiBtdXNpY2FsIGluZmx1ZW5jZXMsIGV4cGVyaW1lbnRpbmcgZnJvbSBhY291c3RpYyBpbnN0cnVtZW50cyB0byBlbGVjdHJvbmljIG11c2ljIHByb2R1Y3Rpb24gYW5kIERKaW5nLjxici8+PGJyLz5IZSByZWxlYXNlZCBoaXMgZGVidXQgRVAg4oCcSSBGZWVs4oCdIG9uIEZ1c2lvbiByZWNvcmRpbmdzLCBzdWItbGFiZWwgb2YgRGogQ2VudGVyIFJlY29yZHMsIGFuZCBoYXMgc2luY2UgcmVsZWFzZWQgZnJlcXVlbnRseSBvbiBsYWJlbHMgc3VjaCBhczsgRG9iYXJhLCBTdXN1cnJvdXMgTXVzaWMsIEluY29nbml0dXMgUmVjb3JkaW5ncywgS29vbHdhdGVycyBhbmQgZ2FpbmVkIHN1cHBvcnQgZnJvbSB0aGUgbGlrZXMgb2YgQW1pbmUgRWRnZSwgU3RhY2V5IFB1bGxlbiwgRGV0bGVmLCBTbGFtLCBNYXJjIFZlZG8sIExvdmVyZG9zZSwgQXNobGV5IFdpbGQsIEpvYmUgYW5kIG1hbnkgbW9yZVwiXG5cdFx0XHRsaW5rczogW1xuXHRcdFx0XHR7dHlwZTpcInNwb3RpZnlcIiwgdXJsOlwiaHR0cDovL3Nwb3RpZnkuY29tXCJ9LFxuXHRcdFx0XHR7dHlwZTpcInNvdW5kY2xvdWRcIiwgdXJsOlwiaHR0cDovL3NvdW5kY2xvdWQuY29tXCJ9LFxuXHRcdFx0XHR7dHlwZTpcImZhY2Vib29rXCIsIHVybDpcImh0dHA6Ly9mYWNlYm9vay5jb21cIn1cblx0XHRcdF1cblxuXG5cdFx0QGZvcm1fYmlvID0gQGRvbS5maW5kKCAnLnByb2ZpbGVfZm9ybScgKVxuXHRcdEBmb3JtX2Jpby5vbiAnc3VibWl0JywgKGUpIC0+IGUucHJldmVudERlZmF1bHQoKVxuXHRcdEBmb3JtX2Jpby5maW5kKCAnaW5wdXQnICkua2V5dXAgKGUpID0+XG5cdFx0XHRpZiBlLmtleUNvZGUgaXMgMTNcblx0XHRcdFx0QHJlYWRfbW9kZSgpXG5cblxuXHRcdEB1cGRhdGVfZG9tX2Zyb21fdXNlcigpXG5cblx0XHRyZWYgPSBAXG5cblx0XHRAZG9tLmZpbmQoICdbZGF0YS1wcm9maWxlXScgKS5vbiAnY2xpY2snLCAtPlxuXG5cdFx0XHR2YWx1ZSA9ICQoQCkuZGF0YSAncHJvZmlsZSdcblxuXHRcdFx0c3dpdGNoIHZhbHVlXG5cdFx0XHRcdHdoZW4gJ3NldC13cml0ZS1tb2RlJ1xuXHRcdFx0XHRcdGRvIHJlZi53cml0ZV9tb2RlXG5cdFx0XHRcdHdoZW4gJ3NldC1yZWFkLW1vZGUnXG5cdFx0XHRcdFx0ZG8gcmVmLnJlYWRfbW9kZVxuXG5cblx0d3JpdGVfbW9kZSA6IC0+XG5cdFx0bG9nIFwiW1Byb2ZpbGVdIHNldCB3cml0ZSBtb2RlXCJcblx0XHRhcHAuYm9keS5hZGRDbGFzcyAnd3JpdGVfbW9kZSdcblxuXHRyZWFkX21vZGUgOiAtPlxuXHRcdCMgVHJ5aW5nIHRvIHNhdmUgXG5cdFx0QGZldGNoX3VzZXJfZnJvbV9kb20oKVxuXG5cdFx0QHVwZGF0ZV9kb21fZnJvbV91c2VyKClcblxuXHRcdGxvZyBcIltQcm9maWxlXSBzZXQgcmVhZCBtb2RlXCJcblx0XHRhcHAuYm9keS5yZW1vdmVDbGFzcyAnd3JpdGVfbW9kZSdcblxuXHRmZXRjaF91c2VyX2Zyb21fZG9tOiAtPlxuXHRcdEBmYWtlX3VzZXIubG9jYXRpb24gPSBAZWxlbWVudHMubG9jYXRpb25faW5wdXQudmFsKClcblx0XHRAZmFrZV91c2VyLmJpbyA9IEBlbGVtZW50cy5iaW9faW5wdXQudmFsKClcblxuXHRcdEBmYWtlX3VzZXIubGlua3MgPSBbXVxuXHRcdGZvciBsLCBpIGluIEBlbGVtZW50cy5saW5rc19pbnB1dFxuXHRcdFx0QGZha2VfdXNlci5saW5rcy5wdXNoXG5cdFx0XHRcdHR5cGU6IGwudHlwZVxuXHRcdFx0XHR1cmw6IGwuZWwudmFsKClcblxuXG5cdHVwZGF0ZV9kb21fZnJvbV91c2VyIDogLT5cblx0XHRlID0gQGVsZW1lbnRzXG5cdFx0ZCA9IEBmYWtlX3VzZXJcblxuXHRcdGUucHJvZmlsZV9waWN0dXJlLmNzcyAnYmFja2dyb3VuZC1pbWFnZScsIGQucHJvZmlsZV9waWN0dXJlXG5cdFx0ZS5jb3Zlcl9waWN0dXJlLmNzcyAnYmFja2dyb3VuZC1pbWFnZScsIGQuY292ZXJfcGljdHVyZVxuXG5cdFx0ZS5sb2NhdGlvbi5odG1sIGQubG9jYXRpb25cblx0XHRlLmxvY2F0aW9uX2lucHV0LnZhbCBkLmxvY2F0aW9uXG5cblx0XHRlLmJpby5odG1sIGQuYmlvXG5cdFx0ZS5iaW9faW5wdXQudmFsIEBodG1sX3RvX3RleHRhcmVhKCBkLmJpbyApXG5cblx0XHRsb2cgXCJTQVZJTkdcIiwgZC5saW5rcywgZS5saW5rc1xuXHRcdGZvciBsaW5rLCBpIGluIGQubGlua3Ncblx0XHRcdGxvZyAnbGluaycsIGxpbmssICdpJywgaVxuXHRcdFx0ZS5saW5rc1sgaSBdLmVsLmF0dHIgJ2hyZWYnLCBsaW5rLnVybFxuXHRcdFx0ZS5saW5rc19pbnB1dFsgaSBdLmVsLnZhbCBsaW5rLnVybFxuXG5cdGh0bWxfdG9fdGV4dGFyZWEgOiAoIHN0ciApIC0+XG5cdFx0dG9fZmluZCA9IFwiPGJyLz5cIlxuXHRcdHRvX3JlcGxhY2UgPSBcIlxcblwiXG5cdFx0cmUgPSBuZXcgUmVnRXhwKHRvX2ZpbmQsICdnJyk7XG5cblx0XHRyZXR1cm4gc3RyLnJlcGxhY2UocmUsIHRvX3JlcGxhY2UpOyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLEdBQUE7O0FBQUEsQ0FBQSxFQUF1QixHQUFqQixDQUFOO0NBQ2MsQ0FBQSxDQUFBLGNBQUc7Q0FFZixFQUFBLEtBQUE7T0FBQSxLQUFBO0NBQUEsRUFGZSxDQUFEO0NBRWQsRUFDQyxDQURELElBQUE7Q0FDQyxDQUFpQixDQUFJLENBQUgsRUFBbEIsU0FBQSxLQUFpQjtDQUFqQixDQUNlLENBQUksQ0FBSCxFQUFoQixPQUFBLENBQWU7Q0FEZixDQUVVLENBQUksQ0FBSCxFQUFYLEVBQUEsR0FBVTtDQUZWLENBR2dCLENBQUksQ0FBSCxFQUFqQixRQUFBLEdBQWdCO0NBSGhCLENBSUssQ0FBTCxDQUFNLEVBQU47Q0FKQSxDQUtXLENBQUksQ0FBSCxFQUFaLEdBQUEsR0FBVztDQUxYLENBTU8sR0FBUCxDQUFBO1NBQ0M7Q0FBQSxDQUFNLEVBQUwsS0FBRCxDQUFDO0NBQUQsQ0FBaUIsQ0FBTyxDQUFILE1BQUosS0FBRztFQUNwQixRQUZNO0NBRU4sQ0FBTSxFQUFMLE1BQUEsRUFBRDtDQUFBLENBQW9CLENBQU8sQ0FBSCxNQUFKLFFBQUc7RUFDdkIsUUFITTtDQUdOLENBQU0sRUFBTCxNQUFBO0NBQUQsQ0FBa0IsQ0FBTyxDQUFILE1BQUosTUFBRztVQUhmO1FBTlA7Q0FBQSxDQVdhLElBQWIsS0FBQTtTQUNDO0NBQUEsQ0FBTSxFQUFMLEtBQUQsQ0FBQztDQUFELENBQWlCLENBQU8sQ0FBSCxNQUFKLE1BQUc7RUFDcEIsUUFGWTtDQUVaLENBQU0sRUFBTCxNQUFBLEVBQUQ7Q0FBQSxDQUFvQixDQUFPLENBQUgsTUFBSixTQUFHO0VBQ3ZCLFFBSFk7Q0FHWixDQUFNLEVBQUwsTUFBQTtDQUFELENBQWtCLENBQU8sQ0FBSCxNQUFKLE9BQUc7VUFIVDtRQVhiO0NBREQsS0FBQTtDQUFBLEVBbUJDLENBREQsS0FBQTtDQUNDLENBQWlCLElBQWpCLFNBQUEsVUFBQTtDQUFBLENBQ2UsSUFBZixPQUFBLFdBREE7Q0FBQSxDQUVVLElBQVYsRUFBQSxLQUZBO0NBQUEsQ0FHSyxDQUFMLEdBQUEsbWdCQUhBO0NBQUEsQ0FJTyxHQUFQLENBQUE7U0FDQztDQUFBLENBQU0sRUFBTCxLQUFELENBQUM7Q0FBRCxDQUFxQixDQUFKLE9BQUEsVUFBakI7RUFDQSxRQUZNO0NBRU4sQ0FBTSxFQUFMLE1BQUEsRUFBRDtDQUFBLENBQXdCLENBQUosT0FBQSxhQUFwQjtFQUNBLFFBSE07Q0FHTixDQUFNLEVBQUwsTUFBQTtDQUFELENBQXNCLENBQUosT0FBQSxXQUFsQjtVQUhNO1FBSlA7Q0FuQkQsS0FBQTtDQUFBLEVBOEJZLENBQVosSUFBQSxPQUFZO0NBOUJaLENBK0JBLENBQXVCLENBQXZCLElBQVMsQ0FBZTtDQUFPLFlBQUQsQ0FBQTtDQUE5QixJQUF1QjtDQS9CdkIsRUFnQ2dDLENBQWhDLENBQUEsRUFBQSxDQUFTLENBQXdCO0NBQ2hDLENBQUEsRUFBRyxDQUFhLENBQWhCLENBQUc7Q0FDRCxJQUFBLElBQUQsTUFBQTtRQUY4QjtDQUFoQyxJQUFnQztDQWhDaEMsR0FxQ0EsZ0JBQUE7Q0FyQ0EsRUF1Q0EsQ0FBQTtDQXZDQSxDQXlDQSxDQUFJLENBQUosR0FBQSxFQUEwQyxPQUExQztDQUVDLElBQUEsS0FBQTtDQUFBLEVBQVEsQ0FBQSxDQUFSLENBQUEsR0FBUTtDQUVSLElBQUEsU0FBTztDQUFQLFlBQ00sR0FETjtDQUVTLEVBQUQsT0FBTixPQUFHO0NBRkwsWUFHTSxFQUhOO0NBSVMsRUFBRCxNQUFOLFFBQUc7Q0FKTCxNQUp5QztDQUExQyxJQUEwQztDQTNDM0MsRUFBYTs7Q0FBYixFQXNEYSxNQUFBLENBQWI7Q0FDQyxFQUFBLENBQUEsc0JBQUE7Q0FDSSxFQUFELENBQUssSUFBUixHQUFBLENBQUE7Q0F4REQsRUFzRGE7O0NBdERiLEVBMERZLE1BQVo7Q0FFQyxHQUFBLGVBQUE7Q0FBQSxHQUVBLGdCQUFBO0NBRkEsRUFJQSxDQUFBLHFCQUFBO0NBQ0ksRUFBRCxDQUFLLE9BQVIsQ0FBQTtDQWpFRCxFQTBEWTs7Q0ExRFosRUFtRXFCLE1BQUEsVUFBckI7Q0FDQyxPQUFBLHNCQUFBO0NBQUEsRUFBc0IsQ0FBdEIsSUFBQSxDQUFVLEtBQW9DO0NBQTlDLEVBQ0EsQ0FBQSxJQUEwQixDQUFoQjtDQURWLENBQUEsQ0FHbUIsQ0FBbkIsQ0FBQSxJQUFVO0NBQ1Y7Q0FBQTtVQUFBLHlDQUFBO21CQUFBO0NBQ0MsR0FBQyxDQUFlLElBQU47Q0FDVCxDQUFNLEVBQU4sSUFBQTtDQUFBLENBQ0ssQ0FBTCxLQUFBO0NBRkQsT0FBQTtDQUREO3FCQUxvQjtDQW5FckIsRUFtRXFCOztDQW5FckIsRUE4RXVCLE1BQUEsV0FBdkI7Q0FDQyxPQUFBLCtCQUFBO0NBQUEsRUFBSSxDQUFKLElBQUE7Q0FBQSxFQUNJLENBQUosS0FEQTtDQUFBLENBRzBDLENBQTFDLENBQUEsV0FBaUIsR0FBakI7Q0FIQSxDQUl3QyxDQUF4QyxDQUFBLFNBQWUsS0FBZjtDQUpBLEdBTUEsSUFBVTtDQU5WLEVBT0EsQ0FBQSxJQUFBLE1BQWdCO0NBUGhCLEVBU0ssQ0FBTDtDQVRBLEVBVUEsQ0FBQSxLQUFXLE9BQUs7Q0FWaEIsQ0FZYyxDQUFkLENBQUEsQ0FBQSxHQUFBO0NBQ0E7Q0FBQTtVQUFBLHlDQUFBO3NCQUFBO0NBQ0MsQ0FBWSxDQUFaLENBQUEsRUFBQTtDQUFBLENBQ2UsQ0FBZixDQUFBLENBQVMsQ0FBVDtDQURBLENBRXFCLENBQXJCLENBQThCLE9BQWY7Q0FIaEI7cUJBZHNCO0NBOUV2QixFQThFdUI7O0NBOUV2QixFQWlHbUIsTUFBRSxPQUFyQjtDQUNDLE9BQUEsZUFBQTtDQUFBLEVBQVUsQ0FBVixHQUFBO0NBQUEsRUFDYSxDQUFiLE1BQUE7Q0FEQSxDQUVBLENBQVMsQ0FBVCxFQUFTLENBQUE7Q0FFVCxDQUFPLENBQUcsSUFBSCxHQUFBLENBQUE7Q0F0R1IsRUFpR21COztDQWpHbkI7O0NBREQifX0seyJvZmZzZXQiOnsibGluZSI6NjkyMSwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL3Jvb20uY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUm9vbVxuXHRjb25zdHJ1Y3RvcjogKCBAZG9tICkgLT4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQTs7QUFBQSxDQUFBLEVBQXVCLEdBQWpCLENBQU47Q0FDYyxDQUFBLENBQUEsV0FBRztDQUFPLEVBQVAsQ0FBRDtDQUFmLEVBQWE7O0NBQWI7O0NBREQifX1dfQ==
*/})()