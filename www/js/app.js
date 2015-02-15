
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
var App, app, cloudinary, navigation, user_controller, views,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

require('./globals');

require('./vendors');

require('../vendors/parallax.min.js');

views = require('./controllers/views');

navigation = require('./controllers/navigation');

user_controller = require('./controllers/user');

cloudinary = require('./controllers/cloudinary');

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

}, {"./globals":"src/frontend/scripts/globals","./vendors":"src/frontend/scripts/vendors","../vendors/parallax.min.js":"src/frontend/vendors/parallax.min","./controllers/views":"src/frontend/scripts/controllers/views","./controllers/navigation":"src/frontend/scripts/controllers/navigation","./controllers/user":"src/frontend/scripts/controllers/user","./controllers/cloudinary":"src/frontend/scripts/controllers/cloudinary","app/controllers/local_connection":"src/frontend/scripts/controllers/local_connection","app/controllers/window":"src/frontend/scripts/controllers/window","app/utils/settings":"src/frontend/scripts/utils/settings"});
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
require.register('src/frontend/scripts/controllers/cloudinary', function(require, module, exports){
var Cloudinary;

require('happens');

Cloudinary = (function() {
  var instance;

  instance = null;

  Cloudinary.prototype.config = {
    cloud_name: "",
    api_key: ""
  };

  function Cloudinary() {
    if (Cloudinary.instance) {
      console.error("You can't instantiate this Cloudinary twice");
      return;
    }
    Cloudinary.instance = this;
  }

  Cloudinary.prototype.set_config = function(data) {
    if (this.config.cloud_name !== data.cloud_name || this.config.api_key !== data.api_key) {
      this.config = data;
      return $.cloudinary.config({
        cloud_name: this.config.cloud_name,
        api_key: this.config.api_key
      });
    }
  };

  Cloudinary.prototype.initialise_form = function(form, callback) {
    form.append($.cloudinary.unsigned_upload_tag(this.config.unsigned_id, {
      cloud_name: this.config.cloud_name
    }));
    return delay(100, function() {
      return callback(form);
    });
  };

  return Cloudinary;

})();

module.exports = new Cloudinary;

}, {"happens":"node_modules/happens/index"});
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
  ReconnectingWebsocket: require('../vendors/reconnecting-websocket.js'),
  JqueryUiWidget: require('../vendors/jquery.ui.widget.js'),
  IframeTransport: require('../vendors/jquery.iframe-transport.js'),
  FileUpload: require('../vendors/jquery.fileupload.js'),
  Cloudinary: require('../vendors/jquery.cloudinary.js')
};

module.exports = vendors;

}, {"../vendors/modernizr.custom.js":"src/frontend/vendors/modernizr.custom","../vendors/LocalConnection.js":"src/frontend/vendors/LocalConnection","../vendors/reconnecting-websocket.js":"src/frontend/vendors/reconnecting-websocket","../vendors/jquery.ui.widget.js":"src/frontend/vendors/jquery.ui.widget","../vendors/jquery.iframe-transport.js":"src/frontend/vendors/jquery.iframe-transport","../vendors/jquery.fileupload.js":"src/frontend/vendors/jquery.fileupload","../vendors/jquery.cloudinary.js":"src/frontend/vendors/jquery.cloudinary"});
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
require.register('src/frontend/scripts/views/components/image_uploader', function(require, module, exports){
var Cloudinary, ImageUploader;

require('happens');

Cloudinary = require('app/controllers/cloudinary');

/*
Unsigned upload to Cloudinary
http://cloudinary.com/blog/direct_upload_made_easy_from_browser_or_mobile_app_to_the_cloud
*/


module.exports = ImageUploader = (function() {
  function ImageUploader(dom) {
    var api_key, cloud_name, on_upload_complete, on_upload_fail, on_upload_progress, on_upload_start, progress, ref, unsigned_id;
    happens(this);
    api_key = dom.find('.api_key').val();
    cloud_name = dom.find('.cloud_name').val();
    unsigned_id = dom.find('.unsigned_id').val();
    Cloudinary.set_config({
      cloud_name: cloud_name,
      api_key: api_key,
      unsigned_id: unsigned_id
    });
    progress = dom.find('.progress');
    Cloudinary.initialise_form(dom.find('form'), function(form) {
      form.on('cloudinarydone', on_upload_complete);
      form.on('fileuploadstart', on_upload_start);
      form.on('fileuploadprogress', on_upload_progress);
      return form.on('fileuploadfail', on_upload_fail);
    });
    ref = this;
    on_upload_start = function(e, data) {
      log("[Cloudinary] on_upload_start", e, data);
      progress.removeClass('hide');
      return ref.emit('started', data);
    };
    on_upload_progress = function(e, data) {
      var percent;
      percent = data.loaded / data.total * 100;
      log("[Cloudinary] on_upload_progress", percent + "%");
      progress.css("width", "" + percent + "%");
      return ref.emit('progress', progress);
    };
    on_upload_complete = function(e, data) {
      log("[ImageUploader] on_upload_complete", e, data);
      progress.addClass('hide');
      return ref.emit('completed', data);
    };
    on_upload_fail = function(e, data) {
      log("[Cloudinary] on_upload_fail", e);
      return ref.emit('error', e);
    };
  }

  return ImageUploader;

})();

}, {"happens":"node_modules/happens/index","app/controllers/cloudinary":"src/frontend/scripts/controllers/cloudinary"});
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
var Cloudinary, Profile,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Cloudinary = require('app/controllers/cloudinary');

module.exports = Profile = (function() {
  Profile.prototype.elements = null;

  Profile.prototype.form_bio = null;

  Profile.prototype.user_data = {
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

  function Profile(dom) {
    var ref,
      _this = this;
    this.dom = dom;
    this.on_views_binded = __bind(this.on_views_binded, this);
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
    this.form_bio = this.dom.find('.profile_form');
    this.form_bio.on('submit', function(e) {
      return e.preventDefault();
    });
    this.form_bio.find('input').keyup(function(e) {
      if (e.keyCode === 13) {
        return _this.read_mode();
      }
    });
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
    this.update_dom_from_user_data();
    view.on('binded', this.on_views_binded);
  }

  Profile.prototype.on_views_binded = function() {
    var change_cover_uploader,
      _this = this;
    change_cover_uploader = view.get_by_dom(this.dom.find('.change_cover'));
    return change_cover_uploader.on('completed', function(data) {
      return _this.dom.find('.cover_image').css({
        'background-image': "url(" + data.result.url + ")"
      });
    });
  };

  Profile.prototype.write_mode = function() {
    return app.body.addClass('write_mode');
  };

  Profile.prototype.read_mode = function() {
    this.update_user_data_from_dom();
    this.update_dom_from_user_data();
    this.send_to_server();
    return app.body.removeClass('write_mode');
  };

  Profile.prototype.update_user_data_from_dom = function() {
    var i, l, _i, _len, _ref, _results;
    this.user_data.location = this.elements.location_input.val();
    this.user_data.bio = this.elements.bio_input.val();
    this.user_data.links = [];
    _ref = this.elements.links_input;
    _results = [];
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      l = _ref[i];
      _results.push(this.user_data.links.push({
        type: l.type,
        url: l.el.val()
      }));
    }
    return _results;
  };

  Profile.prototype.update_dom_from_user_data = function() {
    var d, e, i, link, _i, _len, _ref, _results;
    e = this.elements;
    d = this.user_data;
    e.profile_picture.css('background-image', d.profile_picture);
    e.cover_picture.css('background-image', d.cover_picture);
    e.location.html(d.location);
    e.location_input.val(d.location);
    e.bio.html(d.bio);
    e.bio_input.val(this.html_to_textarea(d.bio));
    _ref = d.links;
    _results = [];
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      link = _ref[i];
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

  Profile.prototype.send_to_server = function() {
    var _this = this;
    log("[Profile] save", this.user_data);
    return;
    return $.post("/api/v1/user/save", this.user_data, function(data) {
      return log("[Profile] server response", data);
    });
  };

  return Profile;

})();

}, {"app/controllers/cloudinary":"src/frontend/scripts/controllers/cloudinary"});
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
require.register('src/frontend/vendors/jquery.cloudinary', function(require, module, exports){
/*
 * Cloudinary's jQuery library - v1.0.22
 * Copyright Cloudinary
 * see https://github.com/cloudinary/cloudinary_js
 */

(function (factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    // Register as an anonymous AMD module:
    define([
      'jquery',
      'jquery.ui.widget',
      'jquery.iframe-transport',
      'jquery.fileupload'
    ], factory);
  } else {
    // Browser globals:
    var $ = window.jQuery;
    factory($);
    $(function() {
      if($.fn.cloudinary_fileupload !== undefined) {
        $("input.cloudinary-fileupload[type=file]").cloudinary_fileupload();
      }
    });
  }
}(function ($) {
  'use strict';
  var CF_SHARED_CDN = "d3jpl91pxevbkh.cloudfront.net";
  var OLD_AKAMAI_SHARED_CDN = "cloudinary-a.akamaihd.net";
  var AKAMAI_SHARED_CDN = "res.cloudinary.com";
  var SHARED_CDN = AKAMAI_SHARED_CDN;

  function utf8_encode (argString) {
    // http://kevin.vanzonneveld.net
    // +   original by: Webtoolkit.info (http://www.webtoolkit.info/)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: sowberry
    // +    tweaked by: Jack
    // +   bugfixed by: Onno Marsman
    // +   improved by: Yves Sucaet
    // +   bugfixed by: Onno Marsman
    // +   bugfixed by: Ulrich
    // +   bugfixed by: Rafal Kukawski
    // +   improved by: kirilloid
    // *     example 1: utf8_encode('Kevin van Zonneveld');
    // *     returns 1: 'Kevin van Zonneveld'

    if (argString === null || typeof argString === "undefined") {
      return "";
    }

    var string = (argString + ''); // .replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    var utftext = '',
        start, end, stringl = 0;

    start = end = 0;
    stringl = string.length;
    for (var n = 0; n < stringl; n++) {
      var c1 = string.charCodeAt(n);
      var enc = null;

      if (c1 < 128) {
        end++;
      } else if (c1 > 127 && c1 < 2048) {
        enc = String.fromCharCode((c1 >> 6) | 192, (c1 & 63) | 128);
      } else {
        enc = String.fromCharCode((c1 >> 12) | 224, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128);
      }
      if (enc !== null) {
        if (end > start) {
          utftext += string.slice(start, end);
        }
        utftext += enc;
        start = end = n + 1;
      }
    }

    if (end > start) {
      utftext += string.slice(start, stringl);
    }

    return utftext;
  }

  function crc32 (str) {
    // http://kevin.vanzonneveld.net
    // +   original by: Webtoolkit.info (http://www.webtoolkit.info/)
    // +   improved by: T0bsn
    // +   improved by: http://stackoverflow.com/questions/2647935/javascript-crc32-function-and-php-crc32-not-matching
    // -    depends on: utf8_encode
    // *     example 1: crc32('Kevin van Zonneveld');
    // *     returns 1: 1249991249
    str = utf8_encode(str);
    var table = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D";

    var crc = 0;
    var x = 0;
    var y = 0;

    crc = crc ^ (-1);
    for (var i = 0, iTop = str.length; i < iTop; i++) {
      y = (crc ^ str.charCodeAt(i)) & 0xFF;
      x = "0x" + table.substr(y * 9, 8);
      crc = (crc >>> 8) ^ x;
    }

    crc = crc ^ (-1);
    //convert to unsigned 32-bit int if needed
    if (crc < 0) {crc += 4294967296;}
    return crc;
  }

  function option_consume(options, option_name, default_value) {
    var result = options[option_name];
    delete options[option_name];
    return typeof(result) == 'undefined' ? default_value : result;
  }

  function build_array(arg) {
    if (arg === null || typeof(arg) == 'undefined') {
      return [];
    } else if ($.isArray(arg)) {
      return arg;
    } else {
      return [arg];
    }
  }

  function present(value) {
    return typeof value != 'undefined' && ("" + value).length > 0;
  }

  function process_base_transformations(options) {
    var transformations = build_array(options.transformation);
    var all_named = true;
    for (var i = 0; i < transformations.length; i++) {
      all_named = all_named && typeof(transformations[i]) == 'string';
    }
    if (all_named) {
      return [];
    }
    delete options.transformation;
    var base_transformations = [];
    for (var i = 0; i < transformations.length; i++) {
      var transformation = transformations[i];
      if (typeof(transformation) == 'string') {
        base_transformations.push("t_" + transformation);
      } else {
        base_transformations.push(generate_transformation_string($.extend({}, transformation)));
      }
    }
    return base_transformations;
  }

  function process_size(options) {
    var size = option_consume(options, 'size');
    if (size) {
      var split_size = size.split("x");
      options.width = split_size[0];
      options.height = split_size[1];
    }
  }

  function process_html_dimensions(options) {
    var width = options.width, height = options.height;
    var has_layer = options.overlay || options.underlay;
    var crop = options.crop;
    var use_as_html_dimensions = !has_layer && !options.angle && crop != "fit" && crop != "limit" && crop != "lfill";
    if (use_as_html_dimensions) {
      if (width && !options.html_width && width !== "auto" && parseFloat(width) >= 1) options.html_width = width;
      if (height && !options.html_height && parseFloat(height) >= 1) options.html_height = height;
    }
    if (!crop && !has_layer) {
      delete options.width;
      delete options.height;
    }
  }

  var TRANSFORMATION_PARAM_NAME_MAPPING = {
    angle: 'a',
    background: 'b',
    border: 'bo',
    color: 'co',
    color_space: 'cs',
    crop: 'c',
    default_image: 'd',
    delay: 'dl',
    density: 'dn',
    dpr: 'dpr',
    effect: 'e',
    fetch_format: 'f',
    flags: 'fl',
    gravity: 'g',
    height: 'h',
    opacity: 'o',
    overlay: 'l',
    page: 'pg',
    prefix: 'p',
    quality: 'q',
    radius: 'r',
    transformation: 't',
    underlay: 'u',
    width: 'w',
    x: 'x',
    y: 'y'
  };

  var TRANSFORMATION_PARAM_VALUE_MAPPING = {
    angle: function(angle){ return build_array(angle).join("."); },
    background: function(background) { return background.replace(/^#/, 'rgb:');},
    border: function(border) {
      if ($.isPlainObject(border)) {
        var border_width = "" + (border.width || 2);
        var border_color = (border.color || "black").replace(/^#/, 'rgb:');
        border = border_width + "px_solid_" + border_color;
      }
      return border;
    },
    color: function(color) { return color.replace(/^#/, 'rgb:');},
    dpr: function(dpr) {
      dpr = dpr.toString();
      if (dpr === "auto") {
        return "1.0";
      } else if (dpr.match(/^\d+$/)) {
        return dpr + ".0";
      } else {
        return dpr;
      }
    },
    effect: function(effect) { return build_array(effect).join(":");},
    flags: function(flags) { return build_array(flags).join(".")},
    transformation: function(transformation) { return build_array(transformation).join(".")}
  };

  function generate_transformation_string(options) {
    var base_transformations = process_base_transformations(options);
    process_size(options);
    process_html_dimensions(options);

    var params = [];
    for (var param in TRANSFORMATION_PARAM_NAME_MAPPING) {
      var value = option_consume(options, param);
      if (!present(value)) continue;
      if (TRANSFORMATION_PARAM_VALUE_MAPPING[param]) {
        value = TRANSFORMATION_PARAM_VALUE_MAPPING[param](value);
      }
      if (!present(value)) continue;
      params.push(TRANSFORMATION_PARAM_NAME_MAPPING[param] + "_" + value);
    }
    params.sort();

    var raw_transformation = option_consume(options, 'raw_transformation');
    if (present(raw_transformation)) params.push(raw_transformation);
    var transformation = params.join(",");
    if (present(transformation)) base_transformations.push(transformation);
    return base_transformations.join("/");
  }

  function absolutize(url) {
    if (!url.match(/^https?:\//)) {
      var prefix = document.location.protocol + "//" + document.location.host;
      if (url[0] == '?') {
        prefix += document.location.pathname;
      } else if (url[0] != '/') {
        prefix += document.location.pathname.replace(/\/[^\/]*$/, '/');
      }
      url = prefix + url;
    }
    return url;
  }

  function cloudinary_url_prefix(public_id, cloud_name, private_cdn, cdn_subdomain, secure_cdn_subdomain, cname, secure, secure_distribution, protocol) {
    if (cloud_name.match(/^\//) && !secure) {
      return "/res" + cloud_name;
    }
    
    var prefix = secure ? 'https://' : (window.location.protocol === 'file:' ? "file://" : 'http://');
    prefix = protocol ? protocol + '//' : prefix;

    var shared_domain = !private_cdn;
    if (secure) {
      if (!secure_distribution || secure_distribution == OLD_AKAMAI_SHARED_CDN) {
        secure_distribution = private_cdn ? cloud_name + "-res.cloudinary.com" : SHARED_CDN;
      }
      shared_domain = shared_domain || secure_distribution == SHARED_CDN;
      if (secure_cdn_subdomain == null && shared_domain) {
        secure_cdn_subdomain = cdn_subdomain;
      }
      if (secure_cdn_subdomain) {
        secure_distribution = secure_distribution.replace('res.cloudinary.com', "res-" + ((crc32(public_id) % 5) + 1) + ".cloudinary.com");
      }
      prefix += secure_distribution;
    } else if (cname) {
      var subdomain = cdn_subdomain ? "a" + ((crc32(public_id) % 5) + 1) + "." : "";      
      prefix += subdomain + cname;
    } else {
      prefix += (private_cdn ? cloud_name + "-res" : "res");
      prefix += (cdn_subdomain ? "-" + ((crc32(public_id) % 5) + 1) : "") 
      prefix += ".cloudinary.com";
    }
    if (shared_domain) prefix += "/" + cloud_name;

    return prefix;
  }

  function finalize_resource_type(resource_type, type, url_suffix, use_root_path, shorten) {
    var resource_type_and_type = resource_type + "/" + type;
    if (url_suffix) {
      if (resource_type_and_type == "image/upload") {
        resource_type_and_type = "images";
      } else if (resource_type_and_type == "raw/upload") {
        resource_type_and_type = "files";
      } else {
        throw "URL Suffix only supported for image/upload and raw/upload";
      }
    }
    if (use_root_path) {
      if (resource_type_and_type == "image/upload" || resource_type_and_type == "images") {
        resource_type_and_type = "";
      } else {
        throw "Root path only supported for image/upload";
      }
    }
    if (shorten && resource_type_and_type == "image/upload") {
      resource_type_and_type = "iu";
    }
    return resource_type_and_type;
  }

  function cloudinary_url(public_id, options) {
    options = options || {};
    var type = option_consume(options, 'type', 'upload');
    if (type == 'fetch') {
      options.fetch_format = options.fetch_format || option_consume(options, 'format');
    }
    var transformation = generate_transformation_string(options);
    var resource_type = option_consume(options, 'resource_type', "image");
    var version = option_consume(options, 'version');
    var format = option_consume(options, 'format');
    var cloud_name = option_consume(options, 'cloud_name', $.cloudinary.config().cloud_name);
    if (!cloud_name) throw "Unknown cloud_name";
    var private_cdn = option_consume(options, 'private_cdn', $.cloudinary.config().private_cdn);
    var secure_distribution = option_consume(options, 'secure_distribution', $.cloudinary.config().secure_distribution);
    var cname = option_consume(options, 'cname', $.cloudinary.config().cname);
    var cdn_subdomain = option_consume(options, 'cdn_subdomain', $.cloudinary.config().cdn_subdomain);
    var secure_cdn_subdomain = option_consume(options, 'secure_cdn_subdomain', $.cloudinary.config().secure_cdn_subdomain);
    var shorten = option_consume(options, 'shorten', $.cloudinary.config().shorten);
    var secure = option_consume(options, 'secure', window.location.protocol == 'https:');
    var protocol = option_consume(options, 'protocol', $.cloudinary.config().protocol);
    var trust_public_id = option_consume(options, 'trust_public_id');
    var url_suffix = option_consume(options, 'url_suffix');
    var use_root_path = option_consume(options, 'use_root_path', $.cloudinary.config().use_root_path);

    if (url_suffix && !private_cdn) {
      throw "URL Suffix only supported in private CDN";
    }

    if (type == 'fetch') {
      public_id = absolutize(public_id);
    }

    if (public_id.search("/") >= 0 && !public_id.match(/^v[0-9]+/) && !public_id.match(/^https?:\//) && !present(version)) {
      version = 1;
    }

    if (public_id.match(/^https?:/)) {
      if (type == "upload" || type == "asset") return public_id;
      public_id = encodeURIComponent(public_id).replace(/%3A/g, ":").replace(/%2F/g, "/");
    } else {
      // Make sure public_id is URI encoded.
      public_id = encodeURIComponent(decodeURIComponent(public_id)).replace(/%3A/g, ":").replace(/%2F/g, "/");
      if (url_suffix) {
        if (url_suffix.match(/[\.\/]/)) throw "url_suffix should not include . or /";
        public_id = public_id + "/" + url_suffix;
      }

      if (format) {
        if (!trust_public_id) public_id = public_id.replace(/\.(jpg|png|gif|webp)$/, '');
        public_id = public_id + "." + format;
      }
    }

    var resource_type_and_type = finalize_resource_type(resource_type, type, url_suffix, use_root_path, shorten);

    var prefix = cloudinary_url_prefix(public_id, cloud_name, private_cdn, cdn_subdomain, secure_cdn_subdomain, cname, secure, secure_distribution, protocol);

    var url = [prefix, resource_type_and_type, transformation, version ? "v" + version : "",
               public_id].join("/").replace(/([^:])\/+/g, '$1/');
    return url;
  }

  function default_stoppoints(width) {
    return 10 * Math.ceil(width / 10);
  }

  function prepare_html_url(public_id, options) {
    if ($.cloudinary.config('dpr') && !options.dpr) {
      options.dpr = $.cloudinary.config('dpr');
    }
    var url = cloudinary_url(public_id, options);
    var width = option_consume(options, 'html_width');
    var height = option_consume(options, 'html_height');
    if (width) options.width = width;
    if (height) options.height = height;
    return url;
  }

  function get_config(name, options, default_value) {
    var value = options[name] || $.cloudinary.config(name);
    if (typeof(value) == 'undefined') value = default_value;
    return value;
  }

  function closest_above(list, value) {
    var i = list.length - 2;
    while (i >= 0 && list[i] >= value) {
      i--;
    }
    return list[i+1];
  }

  var cloudinary_config = null;
  var responsive_config = null;
  var responsive_resize_initialized = false;
  var device_pixel_ratio_cache = {};

  $.cloudinary = {
    CF_SHARED_CDN: CF_SHARED_CDN,
    OLD_AKAMAI_SHARED_CDN: OLD_AKAMAI_SHARED_CDN,
    AKAMAI_SHARED_CDN: AKAMAI_SHARED_CDN,
    SHARED_CDN: SHARED_CDN,
    config: function(new_config, new_value) {
      if (!cloudinary_config) {
        cloudinary_config = {};
        $('meta[name^="cloudinary_"]').each(function() {
          cloudinary_config[$(this).attr('name').replace("cloudinary_", '')] = $(this).attr('content');
        });
      }
      if (typeof(new_value) != 'undefined') {
        cloudinary_config[new_config] = new_value;
      } else if (typeof(new_config) == 'string') {
        return cloudinary_config[new_config];
      } else if (new_config) {
        cloudinary_config = new_config;
      }
      return cloudinary_config;
    },
    url: function(public_id, options) {
      options = $.extend({}, options);
      return cloudinary_url(public_id, options);
    },
    url_internal: cloudinary_url,
    transformation_string: function(options) {
      options = $.extend({}, options);
      return generate_transformation_string(options);
    },
    image: function(public_id, options) {
      options = $.extend({}, options);
      var url = prepare_html_url(public_id, options);
      var img = $('<img/>').data('src-cache', url).attr(options).cloudinary_update(options);
      return img;
    },
    facebook_profile_image: function(public_id, options) {
      return $.cloudinary.image(public_id, $.extend({type: 'facebook'}, options));
    },
    twitter_profile_image: function(public_id, options) {
      return $.cloudinary.image(public_id, $.extend({type: 'twitter'}, options));
    },
    twitter_name_profile_image: function(public_id, options) {
      return $.cloudinary.image(public_id, $.extend({type: 'twitter_name'}, options));
    },
    gravatar_image: function(public_id, options) {
      return $.cloudinary.image(public_id, $.extend({type: 'gravatar'}, options));
    },
    fetch_image: function(public_id, options) {
      return $.cloudinary.image(public_id, $.extend({type: 'fetch'}, options));
    },
    sprite_css: function(public_id, options) {
      options = $.extend({type: 'sprite'}, options);
      if (!public_id.match(/.css$/)) options.format = 'css';
      return $.cloudinary.url(public_id, options);
    },
    /**
     * Turn on hidpi (dpr_auto) and responsive (w_auto) processing according to the current container size and the device pixel ratio.
     * Use the following classes:
     * - cld-hidpi - only set dpr_auto
     * - cld-responsive - update both dpr_auto and w_auto
     * @param: options
     * - responsive_resize - should responsive images be updated on resize (default: true).
     * - responsive_debounce - if set, how many milliseconds after resize is done before the image is replaces (default: 100). Set to 0 to disable.
     * - responsive_use_stoppoints:
     *   - true - always use stoppoints for width
     *   - "resize" - use exact width on first render and stoppoints on resize (default)
     *   - false - always use exact width
     * Stoppoints - to prevent creating a transformation for every pixel, stop-points can be configured. The smallest stop-point that is larger than
     *    the wanted width will be used. The default stoppoints are all the multiples of 10. See calc_stoppoint for ways to override this.
     */
    responsive: function(options) {
      responsive_config = $.extend(responsive_config || {}, options);
      $('img.cld-responsive, img.cld-hidpi').cloudinary_update(responsive_config);
      var responsive_resize = get_config('responsive_resize', responsive_config, true);
      if (responsive_resize && !responsive_resize_initialized) {
        responsive_config.resizing = responsive_resize_initialized = true;
        var timeout = null;
        $(window).on('resize', function() {
          var debounce = get_config('responsive_debounce', responsive_config, 100);
          function reset() {
            if (timeout) {
              clearTimeout(timeout);
              timeout = null;
            }
          }
          function run() {
            $('img.cld-responsive').cloudinary_update(responsive_config);
          }
          function wait() {
            reset();
            setTimeout(function() { reset(); run(); }, debounce);
          }
          if (debounce) {
            wait();
          } else {
            run();
          }
        });
      }
    },
    /**
     * Compute the stoppoint for the given element and width.
     * By default the stoppoint will be the smallest multiple of 10 larger than the width.
     * These can be overridden by either setting the data-stoppoints attribute of an image or using $.cloudinary.config('stoppoints', stoppoints).
     * The value can be either:
     * - an ordered list of the wanted stoppoints
     * - a comma separated ordered list of stoppoints
     * - a function that returns the stoppoint given the wanted width.
     */
    calc_stoppoint: function (element, width) {
      var stoppoints = $(element).data('stoppoints') || $.cloudinary.config().stoppoints || default_stoppoints;
      if (typeof(stoppoints) === 'function') {
        return stoppoints(width);
      }
      if (typeof(stoppoints) === 'string') {
        stoppoints = $.map(stoppoints.split(","), function(val){ return parseInt(val); });
      }
      return closest_above(stoppoints, width);
    },
    device_pixel_ratio: function() {
      var dpr = window.devicePixelRatio || 1;
      var dpr_string = device_pixel_ratio_cache[dpr];
      if (!dpr_string) {
        // Find closest supported DPR (to work correctly with device zoom)
        var dpr_used = closest_above($.cloudinary.supported_dpr_values, dpr);
        dpr_string = dpr_used.toString();
        if (dpr_string.match(/^\d+$/)) dpr_string += ".0";
        device_pixel_ratio_cache[dpr] = dpr_string;
      }
      return dpr_string;
    },
    supported_dpr_values: [0.75, 1.0, 1.3, 1.5, 2.0, 3.0]
  };

  $.fn.cloudinary = function(options) {
    this.filter('img').each(function() {
      var img_options = $.extend({width: $(this).attr('width'), height: $(this).attr('height'),
                                  src: $(this).attr('src')}, $(this).data(), options);
      var public_id = option_consume(img_options, 'source', option_consume(img_options, 'src'));
      var url = prepare_html_url(public_id, img_options);
      $(this).data('src-cache', url).attr({width: img_options.width, height: img_options.height});
    }).cloudinary_update(options);
    return this;
  };

  /**
   * Update hidpi (dpr_auto) and responsive (w_auto) fields according to the current container size and the device pixel ratio.
   * Only images marked with the cld-responsive class have w_auto updated.
   * options:
   * - responsive_use_stoppoints:
   *   - true - always use stoppoints for width
   *   - "resize" - use exact width on first render and stoppoints on resize (default)
   *   - false - always use exact width
   * - responsive:
   *   - true - enable responsive on this element. Can be done by adding cld-responsive.
   *            Note that $.cloudinary.responsive() should be called once on the page.
   */
  $.fn.cloudinary_update = function(options) {
    options = options || {};
    var responsive_use_stoppoints = get_config('responsive_use_stoppoints', options, "resize");
    var exact = responsive_use_stoppoints === false || (responsive_use_stoppoints == "resize" && !options.resizing);

    this.filter('img').each(function() {
      if (options.responsive) {
        $(this).addClass('cld-responsive');
      }
      var attrs = {};
      var src = $(this).data('src-cache') || $(this).data('src');

      if (!src) return;
      var responsive = $(this).hasClass('cld-responsive') && src.match(/\bw_auto\b/);
      if (responsive) {
        var parents = $(this).parents(),
            parentsLength = parents.length,
            container,
            containerWidth = 0,
            nthParent;

        for (nthParent = 0; nthParent < parentsLength; nthParent+=1) {
          container = parents[nthParent];
          if (container && container.clientWidth) {
            containerWidth = container.clientWidth;
            break;
          }
        }
        if (containerWidth == 0) {
          // container doesn't know the size yet. Usually because the image is hidden or outside the DOM.
          return;
        }

        var requestedWidth = exact ? containerWidth : $.cloudinary.calc_stoppoint(this, containerWidth);
        var currentWidth = $(this).data('width') || 0;
        if (requestedWidth > currentWidth) {
          // requested width is larger, fetch new image
          $(this).data('width', requestedWidth);
        } else {
          // requested width is not larger - keep previous
          requestedWidth = currentWidth;
        }
        src = src.replace(/\bw_auto\b/g, "w_" + requestedWidth);
        attrs.width = null;
        attrs.height = null;
      }
      // Update dpr according to the device's devicePixelRatio
      attrs.src = src.replace(/\bdpr_(1\.0|auto)\b/g, "dpr_" + $.cloudinary.device_pixel_ratio());
      $(this).attr(attrs);
    });
    return this;
  };


  var webp = null;
  $.fn.webpify = function(options, webp_options) {
    var that = this;
    options = options || {};
    webp_options = webp_options || options;
    if (!webp) {
      webp = $.Deferred();
      var webp_canary = new Image();
      webp_canary.onerror = webp.reject;
      webp_canary.onload = webp.resolve;
      webp_canary.src = 'data:image/webp;base64,UklGRi4AAABXRUJQVlA4TCEAAAAvAUAAEB8wAiMwAgSSNtse/cXjxyCCmrYNWPwmHRH9jwMA';
    }
    $(function() {
      webp.done(function() {
        $(that).cloudinary($.extend({}, webp_options, {format: 'webp'}));
      }).fail(function() {
        $(that).cloudinary(options);
      });
    });
    return this;
  };
  $.fn.fetchify = function(options) {
    return this.cloudinary($.extend(options, {'type': 'fetch'}));
  };
  if (!$.fn.fileupload) {
    return;
  }
  $.cloudinary.delete_by_token = function(delete_token, options) {
    options = options || {};
    var url = options.url;
    if (!url) {
      var cloud_name = options.cloud_name || $.cloudinary.config().cloud_name;
      url = "https://api.cloudinary.com/v1_1/" + cloud_name + "/delete_by_token";
    }
    var dataType = $.support.xhrFileUpload ? "json" : "iframe json";
    return $.ajax({
      url: url,
      method: "POST",
      data: {token: delete_token},
      headers: {"X-Requested-With": "XMLHttpRequest"},
      dataType: dataType
    });
  };

  $.fn.cloudinary_fileupload = function(options) {
    var initializing = !this.data('blueimpFileupload');
    if (initializing) {
      options = $.extend({
        maxFileSize: 20000000,
        dataType: 'json',
        headers: {"X-Requested-With": "XMLHttpRequest"}
      }, options);
    }
    this.fileupload(options);

    if (initializing) {
      this.bind("fileuploaddone", function(e, data) {
        if (data.result.error) return;
        data.result.path = ["v", data.result.version, "/", data.result.public_id,
                            data.result.format ? "." + data.result.format : ""].join("");

        if (data.cloudinaryField && data.form.length > 0) {
          var upload_info = [data.result.resource_type, data.result.type, data.result.path].join("/") + "#" + data.result.signature;
          var multiple = $(e.target).prop("multiple");
          var add_field = function() {
            $('<input></input>').attr({type: "hidden", name: data.cloudinaryField}).val(upload_info).appendTo(data.form);
          };

          if (multiple) {
            add_field();
          } else {
            var field = $(data.form).find('input[name="' + data.cloudinaryField + '"]');
            if (field.length > 0) {
              field.val(upload_info);
            } else {
              add_field();
            }
          }
        }
        $(e.target).trigger('cloudinarydone', data);
      });

      this.bind("fileuploadstart", function(e){
        $(e.target).trigger('cloudinarystart');
      });
      this.bind("fileuploadstop", function(e){
        $(e.target).trigger('cloudinarystop');
      });
      this.bind("fileuploadprogress", function(e,data){
        $(e.target).trigger('cloudinaryprogress',data);
      });
      this.bind("fileuploadprogressall", function(e,data){
        $(e.target).trigger('cloudinaryprogressall',data);
      });
      this.bind("fileuploadfail", function(e,data){
        $(e.target).trigger('cloudinaryfail',data);
      });
      this.bind("fileuploadalways", function(e,data){
        $(e.target).trigger('cloudinaryalways',data);
      });

      if (!this.fileupload('option').url) {
        var cloud_name = options.cloud_name || $.cloudinary.config().cloud_name;
        var upload_url = "https://api.cloudinary.com/v1_1/" + cloud_name + "/upload";
        this.fileupload('option', 'url', upload_url);
      }
    }
    return this;
  };

  $.fn.cloudinary_upload_url = function(remote_url) {
    this.fileupload('option', 'formData').file = remote_url;
    this.fileupload('add', { files: [ remote_url ] });
    delete(this.fileupload('option', 'formData').file);
  };

  $.fn.unsigned_cloudinary_upload = function(upload_preset, upload_params, options) {
    options = options || {};
    upload_params = $.extend({}, upload_params) || {};

    if (upload_params.cloud_name) {
      options.cloud_name = upload_params.cloud_name;
      delete upload_params.cloud_name;
    }

    // Serialize upload_params
    for (var key in upload_params) {
      var value = upload_params[key];
      if ($.isPlainObject(value)) {
        upload_params[key] = $.map(value, function(v, k){return k + "=" + v;}).join("|");
      } else if ($.isArray(value)) {
        if (value.length > 0 && $.isArray(value[0])) {
          upload_params[key] = $.map(value, function(array_value){return array_value.join(",");}).join("|");
        } else {
          upload_params[key] = value.join(",");
        }
      }
    }
    if (!upload_params.callback) {
      upload_params.callback = "/cloudinary_cors.html";
    }
    upload_params.upload_preset = upload_preset;

    options.formData = upload_params;

    if (options.cloudinary_field) {
      options.cloudinaryField = options.cloudinary_field;
      delete options.cloudinary_field;
    }

    var html_options = options.html || {};
    html_options["class"] = "cloudinary_fileupload " + (html_options["class"] || "");
    if (options.multiple) html_options.multiple = true;
    this.attr(html_options).cloudinary_fileupload(options);
    return this;
  };

  $.cloudinary.unsigned_upload_tag = function(upload_preset, upload_params, options) {
    return $('<input/>').attr({type: "file", name: "file"}).unsigned_cloudinary_upload(upload_preset, upload_params, options);
  };
}));

}, {});
require.register('src/frontend/vendors/jquery.fileupload', function(require, module, exports){
/*
 * jQuery File Upload Plugin 5.42.1
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/* jshint nomen:false */
/* global define, window, document, location, Blob, FormData */

(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define([
            'jquery',
            'jquery.ui.widget'
        ], factory);
    } else {
        // Browser globals:
        factory(window.jQuery);
    }
}(function ($) {
    'use strict';

    // Detect file input support, based on
    // http://viljamis.com/blog/2012/file-upload-support-on-mobile/
    $.support.fileInput = !(new RegExp(
        // Handle devices which give false positives for the feature detection:
        '(Android (1\\.[0156]|2\\.[01]))' +
            '|(Windows Phone (OS 7|8\\.0))|(XBLWP)|(ZuneWP)|(WPDesktop)' +
            '|(w(eb)?OSBrowser)|(webOS)' +
            '|(Kindle/(1\\.0|2\\.[05]|3\\.0))'
    ).test(window.navigator.userAgent) ||
        // Feature detection for all other devices:
        $('<input type="file">').prop('disabled'));

    // The FileReader API is not actually used, but works as feature detection,
    // as some Safari versions (5?) support XHR file uploads via the FormData API,
    // but not non-multipart XHR file uploads.
    // window.XMLHttpRequestUpload is not available on IE10, so we check for
    // window.ProgressEvent instead to detect XHR2 file upload capability:
    $.support.xhrFileUpload = !!(window.ProgressEvent && window.FileReader);
    $.support.xhrFormDataFileUpload = !!window.FormData;

    // Detect support for Blob slicing (required for chunked uploads):
    $.support.blobSlice = window.Blob && (Blob.prototype.slice ||
        Blob.prototype.webkitSlice || Blob.prototype.mozSlice);

    // Helper function to create drag handlers for dragover/dragenter/dragleave:
    function getDragHandler(type) {
        var isDragOver = type === 'dragover';
        return function (e) {
            e.dataTransfer = e.originalEvent && e.originalEvent.dataTransfer;
            var dataTransfer = e.dataTransfer;
            if (dataTransfer && $.inArray('Files', dataTransfer.types) !== -1 &&
                    this._trigger(
                        type,
                        $.Event(type, {delegatedEvent: e})
                    ) !== false) {
                e.preventDefault();
                if (isDragOver) {
                    dataTransfer.dropEffect = 'copy';
                }
            }
        };
    }

    // The fileupload widget listens for change events on file input fields defined
    // via fileInput setting and paste or drop events of the given dropZone.
    // In addition to the default jQuery Widget methods, the fileupload widget
    // exposes the "add" and "send" methods, to add or directly send files using
    // the fileupload API.
    // By default, files added via file input selection, paste, drag & drop or
    // "add" method are uploaded immediately, but it is possible to override
    // the "add" callback option to queue file uploads.
    $.widget('blueimp.fileupload', {

        options: {
            // The drop target element(s), by the default the complete document.
            // Set to null to disable drag & drop support:
            dropZone: $(document),
            // The paste target element(s), by the default undefined.
            // Set to a DOM node or jQuery object to enable file pasting:
            pasteZone: undefined,
            // The file input field(s), that are listened to for change events.
            // If undefined, it is set to the file input fields inside
            // of the widget element on plugin initialization.
            // Set to null to disable the change listener.
            fileInput: undefined,
            // By default, the file input field is replaced with a clone after
            // each input field change event. This is required for iframe transport
            // queues and allows change events to be fired for the same file
            // selection, but can be disabled by setting the following option to false:
            replaceFileInput: true,
            // The parameter name for the file form data (the request argument name).
            // If undefined or empty, the name property of the file input field is
            // used, or "files[]" if the file input name property is also empty,
            // can be a string or an array of strings:
            paramName: undefined,
            // By default, each file of a selection is uploaded using an individual
            // request for XHR type uploads. Set to false to upload file
            // selections in one request each:
            singleFileUploads: true,
            // To limit the number of files uploaded with one XHR request,
            // set the following option to an integer greater than 0:
            limitMultiFileUploads: undefined,
            // The following option limits the number of files uploaded with one
            // XHR request to keep the request size under or equal to the defined
            // limit in bytes:
            limitMultiFileUploadSize: undefined,
            // Multipart file uploads add a number of bytes to each uploaded file,
            // therefore the following option adds an overhead for each file used
            // in the limitMultiFileUploadSize configuration:
            limitMultiFileUploadSizeOverhead: 512,
            // Set the following option to true to issue all file upload requests
            // in a sequential order:
            sequentialUploads: false,
            // To limit the number of concurrent uploads,
            // set the following option to an integer greater than 0:
            limitConcurrentUploads: undefined,
            // Set the following option to true to force iframe transport uploads:
            forceIframeTransport: false,
            // Set the following option to the location of a redirect url on the
            // origin server, for cross-domain iframe transport uploads:
            redirect: undefined,
            // The parameter name for the redirect url, sent as part of the form
            // data and set to 'redirect' if this option is empty:
            redirectParamName: undefined,
            // Set the following option to the location of a postMessage window,
            // to enable postMessage transport uploads:
            postMessage: undefined,
            // By default, XHR file uploads are sent as multipart/form-data.
            // The iframe transport is always using multipart/form-data.
            // Set to false to enable non-multipart XHR uploads:
            multipart: true,
            // To upload large files in smaller chunks, set the following option
            // to a preferred maximum chunk size. If set to 0, null or undefined,
            // or the browser does not support the required Blob API, files will
            // be uploaded as a whole.
            maxChunkSize: undefined,
            // When a non-multipart upload or a chunked multipart upload has been
            // aborted, this option can be used to resume the upload by setting
            // it to the size of the already uploaded bytes. This option is most
            // useful when modifying the options object inside of the "add" or
            // "send" callbacks, as the options are cloned for each file upload.
            uploadedBytes: undefined,
            // By default, failed (abort or error) file uploads are removed from the
            // global progress calculation. Set the following option to false to
            // prevent recalculating the global progress data:
            recalculateProgress: true,
            // Interval in milliseconds to calculate and trigger progress events:
            progressInterval: 100,
            // Interval in milliseconds to calculate progress bitrate:
            bitrateInterval: 500,
            // By default, uploads are started automatically when adding files:
            autoUpload: true,

            // Error and info messages:
            messages: {
                uploadedBytes: 'Uploaded bytes exceed file size'
            },

            // Translation function, gets the message key to be translated
            // and an object with context specific data as arguments:
            i18n: function (message, context) {
                message = this.messages[message] || message.toString();
                if (context) {
                    $.each(context, function (key, value) {
                        message = message.replace('{' + key + '}', value);
                    });
                }
                return message;
            },

            // Additional form data to be sent along with the file uploads can be set
            // using this option, which accepts an array of objects with name and
            // value properties, a function returning such an array, a FormData
            // object (for XHR file uploads), or a simple object.
            // The form of the first fileInput is given as parameter to the function:
            formData: function (form) {
                return form.serializeArray();
            },

            // The add callback is invoked as soon as files are added to the fileupload
            // widget (via file input selection, drag & drop, paste or add API call).
            // If the singleFileUploads option is enabled, this callback will be
            // called once for each file in the selection for XHR file uploads, else
            // once for each file selection.
            //
            // The upload starts when the submit method is invoked on the data parameter.
            // The data object contains a files property holding the added files
            // and allows you to override plugin options as well as define ajax settings.
            //
            // Listeners for this callback can also be bound the following way:
            // .bind('fileuploadadd', func);
            //
            // data.submit() returns a Promise object and allows to attach additional
            // handlers using jQuery's Deferred callbacks:
            // data.submit().done(func).fail(func).always(func);
            add: function (e, data) {
                if (e.isDefaultPrevented()) {
                    return false;
                }
                if (data.autoUpload || (data.autoUpload !== false &&
                        $(this).fileupload('option', 'autoUpload'))) {
                    data.process().done(function () {
                        data.submit();
                    });
                }
            },

            // Other callbacks:

            // Callback for the submit event of each file upload:
            // submit: function (e, data) {}, // .bind('fileuploadsubmit', func);

            // Callback for the start of each file upload request:
            // send: function (e, data) {}, // .bind('fileuploadsend', func);

            // Callback for successful uploads:
            // done: function (e, data) {}, // .bind('fileuploaddone', func);

            // Callback for failed (abort or error) uploads:
            // fail: function (e, data) {}, // .bind('fileuploadfail', func);

            // Callback for completed (success, abort or error) requests:
            // always: function (e, data) {}, // .bind('fileuploadalways', func);

            // Callback for upload progress events:
            // progress: function (e, data) {}, // .bind('fileuploadprogress', func);

            // Callback for global upload progress events:
            // progressall: function (e, data) {}, // .bind('fileuploadprogressall', func);

            // Callback for uploads start, equivalent to the global ajaxStart event:
            // start: function (e) {}, // .bind('fileuploadstart', func);

            // Callback for uploads stop, equivalent to the global ajaxStop event:
            // stop: function (e) {}, // .bind('fileuploadstop', func);

            // Callback for change events of the fileInput(s):
            // change: function (e, data) {}, // .bind('fileuploadchange', func);

            // Callback for paste events to the pasteZone(s):
            // paste: function (e, data) {}, // .bind('fileuploadpaste', func);

            // Callback for drop events of the dropZone(s):
            // drop: function (e, data) {}, // .bind('fileuploaddrop', func);

            // Callback for dragover events of the dropZone(s):
            // dragover: function (e) {}, // .bind('fileuploaddragover', func);

            // Callback for the start of each chunk upload request:
            // chunksend: function (e, data) {}, // .bind('fileuploadchunksend', func);

            // Callback for successful chunk uploads:
            // chunkdone: function (e, data) {}, // .bind('fileuploadchunkdone', func);

            // Callback for failed (abort or error) chunk uploads:
            // chunkfail: function (e, data) {}, // .bind('fileuploadchunkfail', func);

            // Callback for completed (success, abort or error) chunk upload requests:
            // chunkalways: function (e, data) {}, // .bind('fileuploadchunkalways', func);

            // The plugin options are used as settings object for the ajax calls.
            // The following are jQuery ajax settings required for the file uploads:
            processData: false,
            contentType: false,
            cache: false
        },

        // A list of options that require reinitializing event listeners and/or
        // special initialization code:
        _specialOptions: [
            'fileInput',
            'dropZone',
            'pasteZone',
            'multipart',
            'forceIframeTransport'
        ],

        _blobSlice: $.support.blobSlice && function () {
            var slice = this.slice || this.webkitSlice || this.mozSlice;
            return slice.apply(this, arguments);
        },

        _BitrateTimer: function () {
            this.timestamp = ((Date.now) ? Date.now() : (new Date()).getTime());
            this.loaded = 0;
            this.bitrate = 0;
            this.getBitrate = function (now, loaded, interval) {
                var timeDiff = now - this.timestamp;
                if (!this.bitrate || !interval || timeDiff > interval) {
                    this.bitrate = (loaded - this.loaded) * (1000 / timeDiff) * 8;
                    this.loaded = loaded;
                    this.timestamp = now;
                }
                return this.bitrate;
            };
        },

        _isXHRUpload: function (options) {
            return !options.forceIframeTransport &&
                ((!options.multipart && $.support.xhrFileUpload) ||
                $.support.xhrFormDataFileUpload);
        },

        _getFormData: function (options) {
            var formData;
            if ($.type(options.formData) === 'function') {
                return options.formData(options.form);
            }
            if ($.isArray(options.formData)) {
                return options.formData;
            }
            if ($.type(options.formData) === 'object') {
                formData = [];
                $.each(options.formData, function (name, value) {
                    formData.push({name: name, value: value});
                });
                return formData;
            }
            return [];
        },

        _getTotal: function (files) {
            var total = 0;
            $.each(files, function (index, file) {
                total += file.size || 1;
            });
            return total;
        },

        _initProgressObject: function (obj) {
            var progress = {
                loaded: 0,
                total: 0,
                bitrate: 0
            };
            if (obj._progress) {
                $.extend(obj._progress, progress);
            } else {
                obj._progress = progress;
            }
        },

        _initResponseObject: function (obj) {
            var prop;
            if (obj._response) {
                for (prop in obj._response) {
                    if (obj._response.hasOwnProperty(prop)) {
                        delete obj._response[prop];
                    }
                }
            } else {
                obj._response = {};
            }
        },

        _onProgress: function (e, data) {
            if (e.lengthComputable) {
                var now = ((Date.now) ? Date.now() : (new Date()).getTime()),
                    loaded;
                if (data._time && data.progressInterval &&
                        (now - data._time < data.progressInterval) &&
                        e.loaded !== e.total) {
                    return;
                }
                data._time = now;
                loaded = Math.floor(
                    e.loaded / e.total * (data.chunkSize || data._progress.total)
                ) + (data.uploadedBytes || 0);
                // Add the difference from the previously loaded state
                // to the global loaded counter:
                this._progress.loaded += (loaded - data._progress.loaded);
                this._progress.bitrate = this._bitrateTimer.getBitrate(
                    now,
                    this._progress.loaded,
                    data.bitrateInterval
                );
                data._progress.loaded = data.loaded = loaded;
                data._progress.bitrate = data.bitrate = data._bitrateTimer.getBitrate(
                    now,
                    loaded,
                    data.bitrateInterval
                );
                // Trigger a custom progress event with a total data property set
                // to the file size(s) of the current upload and a loaded data
                // property calculated accordingly:
                this._trigger(
                    'progress',
                    $.Event('progress', {delegatedEvent: e}),
                    data
                );
                // Trigger a global progress event for all current file uploads,
                // including ajax calls queued for sequential file uploads:
                this._trigger(
                    'progressall',
                    $.Event('progressall', {delegatedEvent: e}),
                    this._progress
                );
            }
        },

        _initProgressListener: function (options) {
            var that = this,
                xhr = options.xhr ? options.xhr() : $.ajaxSettings.xhr();
            // Accesss to the native XHR object is required to add event listeners
            // for the upload progress event:
            if (xhr.upload) {
                $(xhr.upload).bind('progress', function (e) {
                    var oe = e.originalEvent;
                    // Make sure the progress event properties get copied over:
                    e.lengthComputable = oe.lengthComputable;
                    e.loaded = oe.loaded;
                    e.total = oe.total;
                    that._onProgress(e, options);
                });
                options.xhr = function () {
                    return xhr;
                };
            }
        },

        _isInstanceOf: function (type, obj) {
            // Cross-frame instanceof check
            return Object.prototype.toString.call(obj) === '[object ' + type + ']';
        },

        _initXHRData: function (options) {
            var that = this,
                formData,
                file = options.files[0],
                // Ignore non-multipart setting if not supported:
                multipart = options.multipart || !$.support.xhrFileUpload,
                paramName = $.type(options.paramName) === 'array' ?
                    options.paramName[0] : options.paramName;
            options.headers = $.extend({}, options.headers);
            if (options.contentRange) {
                options.headers['Content-Range'] = options.contentRange;
            }
            if (!multipart || options.blob || !this._isInstanceOf('File', file)) {
                options.headers['Content-Disposition'] = 'attachment; filename="' +
                    encodeURI(file.name) + '"';
            }
            if (!multipart) {
                options.contentType = file.type || 'application/octet-stream';
                options.data = options.blob || file;
            } else if ($.support.xhrFormDataFileUpload) {
                if (options.postMessage) {
                    // window.postMessage does not allow sending FormData
                    // objects, so we just add the File/Blob objects to
                    // the formData array and let the postMessage window
                    // create the FormData object out of this array:
                    formData = this._getFormData(options);
                    if (options.blob) {
                        formData.push({
                            name: paramName,
                            value: options.blob
                        });
                    } else {
                        $.each(options.files, function (index, file) {
                            formData.push({
                                name: ($.type(options.paramName) === 'array' &&
                                    options.paramName[index]) || paramName,
                                value: file
                            });
                        });
                    }
                } else {
                    if (that._isInstanceOf('FormData', options.formData)) {
                        formData = options.formData;
                    } else {
                        formData = new FormData();
                        $.each(this._getFormData(options), function (index, field) {
                            formData.append(field.name, field.value);
                        });
                    }
                    if (options.blob) {
                        formData.append(paramName, options.blob, file.name);
                    } else {
                        $.each(options.files, function (index, file) {
                            // This check allows the tests to run with
                            // dummy objects:
                            if (that._isInstanceOf('File', file) ||
                                    that._isInstanceOf('Blob', file)) {
                                formData.append(
                                    ($.type(options.paramName) === 'array' &&
                                        options.paramName[index]) || paramName,
                                    file,
                                    file.uploadName || file.name
                                );
                            }
                        });
                    }
                }
                options.data = formData;
            }
            // Blob reference is not needed anymore, free memory:
            options.blob = null;
        },

        _initIframeSettings: function (options) {
            var targetHost = $('<a></a>').prop('href', options.url).prop('host');
            // Setting the dataType to iframe enables the iframe transport:
            options.dataType = 'iframe ' + (options.dataType || '');
            // The iframe transport accepts a serialized array as form data:
            options.formData = this._getFormData(options);
            // Add redirect url to form data on cross-domain uploads:
            if (options.redirect && targetHost && targetHost !== location.host) {
                options.formData.push({
                    name: options.redirectParamName || 'redirect',
                    value: options.redirect
                });
            }
        },

        _initDataSettings: function (options) {
            if (this._isXHRUpload(options)) {
                if (!this._chunkedUpload(options, true)) {
                    if (!options.data) {
                        this._initXHRData(options);
                    }
                    this._initProgressListener(options);
                }
                if (options.postMessage) {
                    // Setting the dataType to postmessage enables the
                    // postMessage transport:
                    options.dataType = 'postmessage ' + (options.dataType || '');
                }
            } else {
                this._initIframeSettings(options);
            }
        },

        _getParamName: function (options) {
            var fileInput = $(options.fileInput),
                paramName = options.paramName;
            if (!paramName) {
                paramName = [];
                fileInput.each(function () {
                    var input = $(this),
                        name = input.prop('name') || 'files[]',
                        i = (input.prop('files') || [1]).length;
                    while (i) {
                        paramName.push(name);
                        i -= 1;
                    }
                });
                if (!paramName.length) {
                    paramName = [fileInput.prop('name') || 'files[]'];
                }
            } else if (!$.isArray(paramName)) {
                paramName = [paramName];
            }
            return paramName;
        },

        _initFormSettings: function (options) {
            // Retrieve missing options from the input field and the
            // associated form, if available:
            if (!options.form || !options.form.length) {
                options.form = $(options.fileInput.prop('form'));
                // If the given file input doesn't have an associated form,
                // use the default widget file input's form:
                if (!options.form.length) {
                    options.form = $(this.options.fileInput.prop('form'));
                }
            }
            options.paramName = this._getParamName(options);
            if (!options.url) {
                options.url = options.form.prop('action') || location.href;
            }
            // The HTTP request method must be "POST" or "PUT":
            options.type = (options.type ||
                ($.type(options.form.prop('method')) === 'string' &&
                    options.form.prop('method')) || ''
                ).toUpperCase();
            if (options.type !== 'POST' && options.type !== 'PUT' &&
                    options.type !== 'PATCH') {
                options.type = 'POST';
            }
            if (!options.formAcceptCharset) {
                options.formAcceptCharset = options.form.attr('accept-charset');
            }
        },

        _getAJAXSettings: function (data) {
            var options = $.extend({}, this.options, data);
            this._initFormSettings(options);
            this._initDataSettings(options);
            return options;
        },

        // jQuery 1.6 doesn't provide .state(),
        // while jQuery 1.8+ removed .isRejected() and .isResolved():
        _getDeferredState: function (deferred) {
            if (deferred.state) {
                return deferred.state();
            }
            if (deferred.isResolved()) {
                return 'resolved';
            }
            if (deferred.isRejected()) {
                return 'rejected';
            }
            return 'pending';
        },

        // Maps jqXHR callbacks to the equivalent
        // methods of the given Promise object:
        _enhancePromise: function (promise) {
            promise.success = promise.done;
            promise.error = promise.fail;
            promise.complete = promise.always;
            return promise;
        },

        // Creates and returns a Promise object enhanced with
        // the jqXHR methods abort, success, error and complete:
        _getXHRPromise: function (resolveOrReject, context, args) {
            var dfd = $.Deferred(),
                promise = dfd.promise();
            context = context || this.options.context || promise;
            if (resolveOrReject === true) {
                dfd.resolveWith(context, args);
            } else if (resolveOrReject === false) {
                dfd.rejectWith(context, args);
            }
            promise.abort = dfd.promise;
            return this._enhancePromise(promise);
        },

        // Adds convenience methods to the data callback argument:
        _addConvenienceMethods: function (e, data) {
            var that = this,
                getPromise = function (args) {
                    return $.Deferred().resolveWith(that, args).promise();
                };
            data.process = function (resolveFunc, rejectFunc) {
                if (resolveFunc || rejectFunc) {
                    data._processQueue = this._processQueue =
                        (this._processQueue || getPromise([this])).pipe(
                            function () {
                                if (data.errorThrown) {
                                    return $.Deferred()
                                        .rejectWith(that, [data]).promise();
                                }
                                return getPromise(arguments);
                            }
                        ).pipe(resolveFunc, rejectFunc);
                }
                return this._processQueue || getPromise([this]);
            };
            data.submit = function () {
                if (this.state() !== 'pending') {
                    data.jqXHR = this.jqXHR =
                        (that._trigger(
                            'submit',
                            $.Event('submit', {delegatedEvent: e}),
                            this
                        ) !== false) && that._onSend(e, this);
                }
                return this.jqXHR || that._getXHRPromise();
            };
            data.abort = function () {
                if (this.jqXHR) {
                    return this.jqXHR.abort();
                }
                this.errorThrown = 'abort';
                that._trigger('fail', null, this);
                return that._getXHRPromise(false);
            };
            data.state = function () {
                if (this.jqXHR) {
                    return that._getDeferredState(this.jqXHR);
                }
                if (this._processQueue) {
                    return that._getDeferredState(this._processQueue);
                }
            };
            data.processing = function () {
                return !this.jqXHR && this._processQueue && that
                    ._getDeferredState(this._processQueue) === 'pending';
            };
            data.progress = function () {
                return this._progress;
            };
            data.response = function () {
                return this._response;
            };
        },

        // Parses the Range header from the server response
        // and returns the uploaded bytes:
        _getUploadedBytes: function (jqXHR) {
            var range = jqXHR.getResponseHeader('Range'),
                parts = range && range.split('-'),
                upperBytesPos = parts && parts.length > 1 &&
                    parseInt(parts[1], 10);
            return upperBytesPos && upperBytesPos + 1;
        },

        // Uploads a file in multiple, sequential requests
        // by splitting the file up in multiple blob chunks.
        // If the second parameter is true, only tests if the file
        // should be uploaded in chunks, but does not invoke any
        // upload requests:
        _chunkedUpload: function (options, testOnly) {
            options.uploadedBytes = options.uploadedBytes || 0;
            var that = this,
                file = options.files[0],
                fs = file.size,
                ub = options.uploadedBytes,
                mcs = options.maxChunkSize || fs,
                slice = this._blobSlice,
                dfd = $.Deferred(),
                promise = dfd.promise(),
                jqXHR,
                upload;
            if (!(this._isXHRUpload(options) && slice && (ub || mcs < fs)) ||
                    options.data) {
                return false;
            }
            if (testOnly) {
                return true;
            }
            if (ub >= fs) {
                file.error = options.i18n('uploadedBytes');
                return this._getXHRPromise(
                    false,
                    options.context,
                    [null, 'error', file.error]
                );
            }
            // The chunk upload method:
            upload = function () {
                // Clone the options object for each chunk upload:
                var o = $.extend({}, options),
                    currentLoaded = o._progress.loaded;
                o.blob = slice.call(
                    file,
                    ub,
                    ub + mcs,
                    file.type
                );
                // Store the current chunk size, as the blob itself
                // will be dereferenced after data processing:
                o.chunkSize = o.blob.size;
                // Expose the chunk bytes position range:
                o.contentRange = 'bytes ' + ub + '-' +
                    (ub + o.chunkSize - 1) + '/' + fs;
                // Process the upload data (the blob and potential form data):
                that._initXHRData(o);
                // Add progress listeners for this chunk upload:
                that._initProgressListener(o);
                jqXHR = ((that._trigger('chunksend', null, o) !== false && $.ajax(o)) ||
                        that._getXHRPromise(false, o.context))
                    .done(function (result, textStatus, jqXHR) {
                        ub = that._getUploadedBytes(jqXHR) ||
                            (ub + o.chunkSize);
                        // Create a progress event if no final progress event
                        // with loaded equaling total has been triggered
                        // for this chunk:
                        if (currentLoaded + o.chunkSize - o._progress.loaded) {
                            that._onProgress($.Event('progress', {
                                lengthComputable: true,
                                loaded: ub - o.uploadedBytes,
                                total: ub - o.uploadedBytes
                            }), o);
                        }
                        options.uploadedBytes = o.uploadedBytes = ub;
                        o.result = result;
                        o.textStatus = textStatus;
                        o.jqXHR = jqXHR;
                        that._trigger('chunkdone', null, o);
                        that._trigger('chunkalways', null, o);
                        if (ub < fs) {
                            // File upload not yet complete,
                            // continue with the next chunk:
                            upload();
                        } else {
                            dfd.resolveWith(
                                o.context,
                                [result, textStatus, jqXHR]
                            );
                        }
                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        o.jqXHR = jqXHR;
                        o.textStatus = textStatus;
                        o.errorThrown = errorThrown;
                        that._trigger('chunkfail', null, o);
                        that._trigger('chunkalways', null, o);
                        dfd.rejectWith(
                            o.context,
                            [jqXHR, textStatus, errorThrown]
                        );
                    });
            };
            this._enhancePromise(promise);
            promise.abort = function () {
                return jqXHR.abort();
            };
            upload();
            return promise;
        },

        _beforeSend: function (e, data) {
            if (this._active === 0) {
                // the start callback is triggered when an upload starts
                // and no other uploads are currently running,
                // equivalent to the global ajaxStart event:
                this._trigger('start');
                // Set timer for global bitrate progress calculation:
                this._bitrateTimer = new this._BitrateTimer();
                // Reset the global progress values:
                this._progress.loaded = this._progress.total = 0;
                this._progress.bitrate = 0;
            }
            // Make sure the container objects for the .response() and
            // .progress() methods on the data object are available
            // and reset to their initial state:
            this._initResponseObject(data);
            this._initProgressObject(data);
            data._progress.loaded = data.loaded = data.uploadedBytes || 0;
            data._progress.total = data.total = this._getTotal(data.files) || 1;
            data._progress.bitrate = data.bitrate = 0;
            this._active += 1;
            // Initialize the global progress values:
            this._progress.loaded += data.loaded;
            this._progress.total += data.total;
        },

        _onDone: function (result, textStatus, jqXHR, options) {
            var total = options._progress.total,
                response = options._response;
            if (options._progress.loaded < total) {
                // Create a progress event if no final progress event
                // with loaded equaling total has been triggered:
                this._onProgress($.Event('progress', {
                    lengthComputable: true,
                    loaded: total,
                    total: total
                }), options);
            }
            response.result = options.result = result;
            response.textStatus = options.textStatus = textStatus;
            response.jqXHR = options.jqXHR = jqXHR;
            this._trigger('done', null, options);
        },

        _onFail: function (jqXHR, textStatus, errorThrown, options) {
            var response = options._response;
            if (options.recalculateProgress) {
                // Remove the failed (error or abort) file upload from
                // the global progress calculation:
                this._progress.loaded -= options._progress.loaded;
                this._progress.total -= options._progress.total;
            }
            response.jqXHR = options.jqXHR = jqXHR;
            response.textStatus = options.textStatus = textStatus;
            response.errorThrown = options.errorThrown = errorThrown;
            this._trigger('fail', null, options);
        },

        _onAlways: function (jqXHRorResult, textStatus, jqXHRorError, options) {
            // jqXHRorResult, textStatus and jqXHRorError are added to the
            // options object via done and fail callbacks
            this._trigger('always', null, options);
        },

        _onSend: function (e, data) {
            if (!data.submit) {
                this._addConvenienceMethods(e, data);
            }
            var that = this,
                jqXHR,
                aborted,
                slot,
                pipe,
                options = that._getAJAXSettings(data),
                send = function () {
                    that._sending += 1;
                    // Set timer for bitrate progress calculation:
                    options._bitrateTimer = new that._BitrateTimer();
                    jqXHR = jqXHR || (
                        ((aborted || that._trigger(
                            'send',
                            $.Event('send', {delegatedEvent: e}),
                            options
                        ) === false) &&
                        that._getXHRPromise(false, options.context, aborted)) ||
                        that._chunkedUpload(options) || $.ajax(options)
                    ).done(function (result, textStatus, jqXHR) {
                        that._onDone(result, textStatus, jqXHR, options);
                    }).fail(function (jqXHR, textStatus, errorThrown) {
                        that._onFail(jqXHR, textStatus, errorThrown, options);
                    }).always(function (jqXHRorResult, textStatus, jqXHRorError) {
                        that._onAlways(
                            jqXHRorResult,
                            textStatus,
                            jqXHRorError,
                            options
                        );
                        that._sending -= 1;
                        that._active -= 1;
                        if (options.limitConcurrentUploads &&
                                options.limitConcurrentUploads > that._sending) {
                            // Start the next queued upload,
                            // that has not been aborted:
                            var nextSlot = that._slots.shift();
                            while (nextSlot) {
                                if (that._getDeferredState(nextSlot) === 'pending') {
                                    nextSlot.resolve();
                                    break;
                                }
                                nextSlot = that._slots.shift();
                            }
                        }
                        if (that._active === 0) {
                            // The stop callback is triggered when all uploads have
                            // been completed, equivalent to the global ajaxStop event:
                            that._trigger('stop');
                        }
                    });
                    return jqXHR;
                };
            this._beforeSend(e, options);
            if (this.options.sequentialUploads ||
                    (this.options.limitConcurrentUploads &&
                    this.options.limitConcurrentUploads <= this._sending)) {
                if (this.options.limitConcurrentUploads > 1) {
                    slot = $.Deferred();
                    this._slots.push(slot);
                    pipe = slot.pipe(send);
                } else {
                    this._sequence = this._sequence.pipe(send, send);
                    pipe = this._sequence;
                }
                // Return the piped Promise object, enhanced with an abort method,
                // which is delegated to the jqXHR object of the current upload,
                // and jqXHR callbacks mapped to the equivalent Promise methods:
                pipe.abort = function () {
                    aborted = [undefined, 'abort', 'abort'];
                    if (!jqXHR) {
                        if (slot) {
                            slot.rejectWith(options.context, aborted);
                        }
                        return send();
                    }
                    return jqXHR.abort();
                };
                return this._enhancePromise(pipe);
            }
            return send();
        },

        _onAdd: function (e, data) {
            var that = this,
                result = true,
                options = $.extend({}, this.options, data),
                files = data.files,
                filesLength = files.length,
                limit = options.limitMultiFileUploads,
                limitSize = options.limitMultiFileUploadSize,
                overhead = options.limitMultiFileUploadSizeOverhead,
                batchSize = 0,
                paramName = this._getParamName(options),
                paramNameSet,
                paramNameSlice,
                fileSet,
                i,
                j = 0;
            if (limitSize && (!filesLength || files[0].size === undefined)) {
                limitSize = undefined;
            }
            if (!(options.singleFileUploads || limit || limitSize) ||
                    !this._isXHRUpload(options)) {
                fileSet = [files];
                paramNameSet = [paramName];
            } else if (!(options.singleFileUploads || limitSize) && limit) {
                fileSet = [];
                paramNameSet = [];
                for (i = 0; i < filesLength; i += limit) {
                    fileSet.push(files.slice(i, i + limit));
                    paramNameSlice = paramName.slice(i, i + limit);
                    if (!paramNameSlice.length) {
                        paramNameSlice = paramName;
                    }
                    paramNameSet.push(paramNameSlice);
                }
            } else if (!options.singleFileUploads && limitSize) {
                fileSet = [];
                paramNameSet = [];
                for (i = 0; i < filesLength; i = i + 1) {
                    batchSize += files[i].size + overhead;
                    if (i + 1 === filesLength ||
                            ((batchSize + files[i + 1].size + overhead) > limitSize) ||
                            (limit && i + 1 - j >= limit)) {
                        fileSet.push(files.slice(j, i + 1));
                        paramNameSlice = paramName.slice(j, i + 1);
                        if (!paramNameSlice.length) {
                            paramNameSlice = paramName;
                        }
                        paramNameSet.push(paramNameSlice);
                        j = i + 1;
                        batchSize = 0;
                    }
                }
            } else {
                paramNameSet = paramName;
            }
            data.originalFiles = files;
            $.each(fileSet || files, function (index, element) {
                var newData = $.extend({}, data);
                newData.files = fileSet ? element : [element];
                newData.paramName = paramNameSet[index];
                that._initResponseObject(newData);
                that._initProgressObject(newData);
                that._addConvenienceMethods(e, newData);
                result = that._trigger(
                    'add',
                    $.Event('add', {delegatedEvent: e}),
                    newData
                );
                return result;
            });
            return result;
        },

        _replaceFileInput: function (data) {
            var input = data.fileInput,
                inputClone = input.clone(true);
            // Add a reference for the new cloned file input to the data argument:
            data.fileInputClone = inputClone;
            $('<form></form>').append(inputClone)[0].reset();
            // Detaching allows to insert the fileInput on another form
            // without loosing the file input value:
            input.after(inputClone).detach();
            // Avoid memory leaks with the detached file input:
            $.cleanData(input.unbind('remove'));
            // Replace the original file input element in the fileInput
            // elements set with the clone, which has been copied including
            // event handlers:
            this.options.fileInput = this.options.fileInput.map(function (i, el) {
                if (el === input[0]) {
                    return inputClone[0];
                }
                return el;
            });
            // If the widget has been initialized on the file input itself,
            // override this.element with the file input clone:
            if (input[0] === this.element[0]) {
                this.element = inputClone;
            }
        },

        _handleFileTreeEntry: function (entry, path) {
            var that = this,
                dfd = $.Deferred(),
                errorHandler = function (e) {
                    if (e && !e.entry) {
                        e.entry = entry;
                    }
                    // Since $.when returns immediately if one
                    // Deferred is rejected, we use resolve instead.
                    // This allows valid files and invalid items
                    // to be returned together in one set:
                    dfd.resolve([e]);
                },
                successHandler = function (entries) {
                    that._handleFileTreeEntries(
                        entries,
                        path + entry.name + '/'
                    ).done(function (files) {
                        dfd.resolve(files);
                    }).fail(errorHandler);
                },
                readEntries = function () {
                    dirReader.readEntries(function (results) {
                        if (!results.length) {
                            successHandler(entries);
                        } else {
                            entries = entries.concat(results);
                            readEntries();
                        }
                    }, errorHandler);
                },
                dirReader, entries = [];
            path = path || '';
            if (entry.isFile) {
                if (entry._file) {
                    // Workaround for Chrome bug #149735
                    entry._file.relativePath = path;
                    dfd.resolve(entry._file);
                } else {
                    entry.file(function (file) {
                        file.relativePath = path;
                        dfd.resolve(file);
                    }, errorHandler);
                }
            } else if (entry.isDirectory) {
                dirReader = entry.createReader();
                readEntries();
            } else {
                // Return an empy list for file system items
                // other than files or directories:
                dfd.resolve([]);
            }
            return dfd.promise();
        },

        _handleFileTreeEntries: function (entries, path) {
            var that = this;
            return $.when.apply(
                $,
                $.map(entries, function (entry) {
                    return that._handleFileTreeEntry(entry, path);
                })
            ).pipe(function () {
                return Array.prototype.concat.apply(
                    [],
                    arguments
                );
            });
        },

        _getDroppedFiles: function (dataTransfer) {
            dataTransfer = dataTransfer || {};
            var items = dataTransfer.items;
            if (items && items.length && (items[0].webkitGetAsEntry ||
                    items[0].getAsEntry)) {
                return this._handleFileTreeEntries(
                    $.map(items, function (item) {
                        var entry;
                        if (item.webkitGetAsEntry) {
                            entry = item.webkitGetAsEntry();
                            if (entry) {
                                // Workaround for Chrome bug #149735:
                                entry._file = item.getAsFile();
                            }
                            return entry;
                        }
                        return item.getAsEntry();
                    })
                );
            }
            return $.Deferred().resolve(
                $.makeArray(dataTransfer.files)
            ).promise();
        },

        _getSingleFileInputFiles: function (fileInput) {
            fileInput = $(fileInput);
            var entries = fileInput.prop('webkitEntries') ||
                    fileInput.prop('entries'),
                files,
                value;
            if (entries && entries.length) {
                return this._handleFileTreeEntries(entries);
            }
            files = $.makeArray(fileInput.prop('files'));
            if (!files.length) {
                value = fileInput.prop('value');
                if (!value) {
                    return $.Deferred().resolve([]).promise();
                }
                // If the files property is not available, the browser does not
                // support the File API and we add a pseudo File object with
                // the input value as name with path information removed:
                files = [{name: value.replace(/^.*\\/, '')}];
            } else if (files[0].name === undefined && files[0].fileName) {
                // File normalization for Safari 4 and Firefox 3:
                $.each(files, function (index, file) {
                    file.name = file.fileName;
                    file.size = file.fileSize;
                });
            }
            return $.Deferred().resolve(files).promise();
        },

        _getFileInputFiles: function (fileInput) {
            if (!(fileInput instanceof $) || fileInput.length === 1) {
                return this._getSingleFileInputFiles(fileInput);
            }
            return $.when.apply(
                $,
                $.map(fileInput, this._getSingleFileInputFiles)
            ).pipe(function () {
                return Array.prototype.concat.apply(
                    [],
                    arguments
                );
            });
        },

        _onChange: function (e) {
            var that = this,
                data = {
                    fileInput: $(e.target),
                    form: $(e.target.form)
                };
            this._getFileInputFiles(data.fileInput).always(function (files) {
                data.files = files;
                if (that.options.replaceFileInput) {
                    that._replaceFileInput(data);
                }
                if (that._trigger(
                        'change',
                        $.Event('change', {delegatedEvent: e}),
                        data
                    ) !== false) {
                    that._onAdd(e, data);
                }
            });
        },

        _onPaste: function (e) {
            var items = e.originalEvent && e.originalEvent.clipboardData &&
                    e.originalEvent.clipboardData.items,
                data = {files: []};
            if (items && items.length) {
                $.each(items, function (index, item) {
                    var file = item.getAsFile && item.getAsFile();
                    if (file) {
                        data.files.push(file);
                    }
                });
                if (this._trigger(
                        'paste',
                        $.Event('paste', {delegatedEvent: e}),
                        data
                    ) !== false) {
                    this._onAdd(e, data);
                }
            }
        },

        _onDrop: function (e) {
            e.dataTransfer = e.originalEvent && e.originalEvent.dataTransfer;
            var that = this,
                dataTransfer = e.dataTransfer,
                data = {};
            if (dataTransfer && dataTransfer.files && dataTransfer.files.length) {
                e.preventDefault();
                this._getDroppedFiles(dataTransfer).always(function (files) {
                    data.files = files;
                    if (that._trigger(
                            'drop',
                            $.Event('drop', {delegatedEvent: e}),
                            data
                        ) !== false) {
                        that._onAdd(e, data);
                    }
                });
            }
        },

        _onDragOver: getDragHandler('dragover'),

        _onDragEnter: getDragHandler('dragenter'),

        _onDragLeave: getDragHandler('dragleave'),

        _initEventHandlers: function () {
            if (this._isXHRUpload(this.options)) {
                this._on(this.options.dropZone, {
                    dragover: this._onDragOver,
                    drop: this._onDrop,
                    // event.preventDefault() on dragenter is required for IE10+:
                    dragenter: this._onDragEnter,
                    // dragleave is not required, but added for completeness:
                    dragleave: this._onDragLeave
                });
                this._on(this.options.pasteZone, {
                    paste: this._onPaste
                });
            }
            if ($.support.fileInput) {
                this._on(this.options.fileInput, {
                    change: this._onChange
                });
            }
        },

        _destroyEventHandlers: function () {
            this._off(this.options.dropZone, 'dragenter dragleave dragover drop');
            this._off(this.options.pasteZone, 'paste');
            this._off(this.options.fileInput, 'change');
        },

        _setOption: function (key, value) {
            var reinit = $.inArray(key, this._specialOptions) !== -1;
            if (reinit) {
                this._destroyEventHandlers();
            }
            this._super(key, value);
            if (reinit) {
                this._initSpecialOptions();
                this._initEventHandlers();
            }
        },

        _initSpecialOptions: function () {
            var options = this.options;
            if (options.fileInput === undefined) {
                options.fileInput = this.element.is('input[type="file"]') ?
                        this.element : this.element.find('input[type="file"]');
            } else if (!(options.fileInput instanceof $)) {
                options.fileInput = $(options.fileInput);
            }
            if (!(options.dropZone instanceof $)) {
                options.dropZone = $(options.dropZone);
            }
            if (!(options.pasteZone instanceof $)) {
                options.pasteZone = $(options.pasteZone);
            }
        },

        _getRegExp: function (str) {
            var parts = str.split('/'),
                modifiers = parts.pop();
            parts.shift();
            return new RegExp(parts.join('/'), modifiers);
        },

        _isRegExpOption: function (key, value) {
            return key !== 'url' && $.type(value) === 'string' &&
                /^\/.*\/[igm]{0,3}$/.test(value);
        },

        _initDataAttributes: function () {
            var that = this,
                options = this.options,
                clone = $(this.element[0].cloneNode(false)),
                data = clone.data();
            // Avoid memory leaks:
            clone.remove();
            // Initialize options set via HTML5 data-attributes:
            $.each(
                data,
                function (key, value) {
                    var dataAttributeName = 'data-' +
                        // Convert camelCase to hyphen-ated key:
                        key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
                    if (clone.attr(dataAttributeName)) {
                        if (that._isRegExpOption(key, value)) {
                            value = that._getRegExp(value);
                        }
                        options[key] = value;
                    }
                }
            );
        },

        _create: function () {
            this._initDataAttributes();
            this._initSpecialOptions();
            this._slots = [];
            this._sequence = this._getXHRPromise(true);
            this._sending = this._active = 0;
            this._initProgressObject(this);
            this._initEventHandlers();
        },

        // This method is exposed to the widget API and allows to query
        // the number of active uploads:
        active: function () {
            return this._active;
        },

        // This method is exposed to the widget API and allows to query
        // the widget upload progress.
        // It returns an object with loaded, total and bitrate properties
        // for the running uploads:
        progress: function () {
            return this._progress;
        },

        // This method is exposed to the widget API and allows adding files
        // using the fileupload API. The data parameter accepts an object which
        // must have a files property and can contain additional options:
        // .fileupload('add', {files: filesList});
        add: function (data) {
            var that = this;
            if (!data || this.options.disabled) {
                return;
            }
            if (data.fileInput && !data.files) {
                this._getFileInputFiles(data.fileInput).always(function (files) {
                    data.files = files;
                    that._onAdd(null, data);
                });
            } else {
                data.files = $.makeArray(data.files);
                this._onAdd(null, data);
            }
        },

        // This method is exposed to the widget API and allows sending files
        // using the fileupload API. The data parameter accepts an object which
        // must have a files or fileInput property and can contain additional options:
        // .fileupload('send', {files: filesList});
        // The method returns a Promise object for the file upload call.
        send: function (data) {
            if (data && !this.options.disabled) {
                if (data.fileInput && !data.files) {
                    var that = this,
                        dfd = $.Deferred(),
                        promise = dfd.promise(),
                        jqXHR,
                        aborted;
                    promise.abort = function () {
                        aborted = true;
                        if (jqXHR) {
                            return jqXHR.abort();
                        }
                        dfd.reject(null, 'abort', 'abort');
                        return promise;
                    };
                    this._getFileInputFiles(data.fileInput).always(
                        function (files) {
                            if (aborted) {
                                return;
                            }
                            if (!files.length) {
                                dfd.reject();
                                return;
                            }
                            data.files = files;
                            jqXHR = that._onSend(null, data);
                            jqXHR.then(
                                function (result, textStatus, jqXHR) {
                                    dfd.resolve(result, textStatus, jqXHR);
                                },
                                function (jqXHR, textStatus, errorThrown) {
                                    dfd.reject(jqXHR, textStatus, errorThrown);
                                }
                            );
                        }
                    );
                    return this._enhancePromise(promise);
                }
                data.files = $.makeArray(data.files);
                if (data.files.length) {
                    return this._onSend(null, data);
                }
            }
            return this._getXHRPromise(false, data && data.context);
        }

    });

}));

}, {});
require.register('src/frontend/vendors/jquery.iframe-transport', function(require, module, exports){
/*
 * jQuery Iframe Transport Plugin 1.8.2
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/* global define, window, document */

(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define(['jquery'], factory);
    } else {
        // Browser globals:
        factory(window.jQuery);
    }
}(function ($) {
    'use strict';

    // Helper variable to create unique names for the transport iframes:
    var counter = 0;

    // The iframe transport accepts four additional options:
    // options.fileInput: a jQuery collection of file input fields
    // options.paramName: the parameter name for the file form data,
    //  overrides the name property of the file input field(s),
    //  can be a string or an array of strings.
    // options.formData: an array of objects with name and value properties,
    //  equivalent to the return data of .serializeArray(), e.g.:
    //  [{name: 'a', value: 1}, {name: 'b', value: 2}]
    // options.initialIframeSrc: the URL of the initial iframe src,
    //  by default set to "javascript:false;"
    $.ajaxTransport('iframe', function (options) {
        if (options.async) {
            // javascript:false as initial iframe src
            // prevents warning popups on HTTPS in IE6:
            /*jshint scripturl: true */
            var initialIframeSrc = options.initialIframeSrc || 'javascript:false;',
            /*jshint scripturl: false */
                form,
                iframe,
                addParamChar;
            return {
                send: function (_, completeCallback) {
                    form = $('<form style="display:none;"></form>');
                    form.attr('accept-charset', options.formAcceptCharset);
                    addParamChar = /\?/.test(options.url) ? '&' : '?';
                    // XDomainRequest only supports GET and POST:
                    if (options.type === 'DELETE') {
                        options.url = options.url + addParamChar + '_method=DELETE';
                        options.type = 'POST';
                    } else if (options.type === 'PUT') {
                        options.url = options.url + addParamChar + '_method=PUT';
                        options.type = 'POST';
                    } else if (options.type === 'PATCH') {
                        options.url = options.url + addParamChar + '_method=PATCH';
                        options.type = 'POST';
                    }
                    // IE versions below IE8 cannot set the name property of
                    // elements that have already been added to the DOM,
                    // so we set the name along with the iframe HTML markup:
                    counter += 1;
                    iframe = $(
                        '<iframe src="' + initialIframeSrc +
                            '" name="iframe-transport-' + counter + '"></iframe>'
                    ).bind('load', function () {
                        var fileInputClones,
                            paramNames = $.isArray(options.paramName) ?
                                    options.paramName : [options.paramName];
                        iframe
                            .unbind('load')
                            .bind('load', function () {
                                var response;
                                // Wrap in a try/catch block to catch exceptions thrown
                                // when trying to access cross-domain iframe contents:
                                try {
                                    response = iframe.contents();
                                    // Google Chrome and Firefox do not throw an
                                    // exception when calling iframe.contents() on
                                    // cross-domain requests, so we unify the response:
                                    if (!response.length || !response[0].firstChild) {
                                        throw new Error();
                                    }
                                } catch (e) {
                                    response = undefined;
                                }
                                // The complete callback returns the
                                // iframe content document as response object:
                                completeCallback(
                                    200,
                                    'success',
                                    {'iframe': response}
                                );
                                // Fix for IE endless progress bar activity bug
                                // (happens on form submits to iframe targets):
                                $('<iframe src="' + initialIframeSrc + '"></iframe>')
                                    .appendTo(form);
                                window.setTimeout(function () {
                                    // Removing the form in a setTimeout call
                                    // allows Chrome's developer tools to display
                                    // the response result
                                    form.remove();
                                }, 0);
                            });
                        form
                            .prop('target', iframe.prop('name'))
                            .prop('action', options.url)
                            .prop('method', options.type);
                        if (options.formData) {
                            $.each(options.formData, function (index, field) {
                                $('<input type="hidden"/>')
                                    .prop('name', field.name)
                                    .val(field.value)
                                    .appendTo(form);
                            });
                        }
                        if (options.fileInput && options.fileInput.length &&
                                options.type === 'POST') {
                            fileInputClones = options.fileInput.clone();
                            // Insert a clone for each file input field:
                            options.fileInput.after(function (index) {
                                return fileInputClones[index];
                            });
                            if (options.paramName) {
                                options.fileInput.each(function (index) {
                                    $(this).prop(
                                        'name',
                                        paramNames[index] || options.paramName
                                    );
                                });
                            }
                            // Appending the file input fields to the hidden form
                            // removes them from their original location:
                            form
                                .append(options.fileInput)
                                .prop('enctype', 'multipart/form-data')
                                // enctype must be set as encoding for IE:
                                .prop('encoding', 'multipart/form-data');
                            // Remove the HTML5 form attribute from the input(s):
                            options.fileInput.removeAttr('form');
                        }
                        form.submit();
                        // Insert the file input fields at their original location
                        // by replacing the clones with the originals:
                        if (fileInputClones && fileInputClones.length) {
                            options.fileInput.each(function (index, input) {
                                var clone = $(fileInputClones[index]);
                                // Restore the original name and form properties:
                                $(input)
                                    .prop('name', clone.prop('name'))
                                    .attr('form', clone.attr('form'));
                                clone.replaceWith(input);
                            });
                        }
                    });
                    form.append(iframe).appendTo(document.body);
                },
                abort: function () {
                    if (iframe) {
                        // javascript:false as iframe src aborts the request
                        // and prevents warning popups on HTTPS in IE6.
                        // concat is used to avoid the "Script URL" JSLint error:
                        iframe
                            .unbind('load')
                            .prop('src', initialIframeSrc);
                    }
                    if (form) {
                        form.remove();
                    }
                }
            };
        }
    });

    // The iframe transport returns the iframe content document as response.
    // The following adds converters from iframe to text, json, html, xml
    // and script.
    // Please note that the Content-Type for JSON responses has to be text/plain
    // or text/html, if the browser doesn't include application/json in the
    // Accept header, else IE will show a download dialog.
    // The Content-Type for XML responses on the other hand has to be always
    // application/xml or text/xml, so IE properly parses the XML response.
    // See also
    // https://github.com/blueimp/jQuery-File-Upload/wiki/Setup#content-type-negotiation
    $.ajaxSetup({
        converters: {
            'iframe text': function (iframe) {
                return iframe && $(iframe[0].body).text();
            },
            'iframe json': function (iframe) {
                return iframe && $.parseJSON($(iframe[0].body).text());
            },
            'iframe html': function (iframe) {
                return iframe && $(iframe[0].body).html();
            },
            'iframe xml': function (iframe) {
                var xmlDoc = iframe && iframe[0];
                return xmlDoc && $.isXMLDoc(xmlDoc) ? xmlDoc :
                        $.parseXML((xmlDoc.XMLDocument && xmlDoc.XMLDocument.xml) ||
                            $(xmlDoc.body).html());
            },
            'iframe script': function (iframe) {
                return iframe && $.globalEval($(iframe[0].body).text());
            }
        }
    });

}));

}, {});
require.register('src/frontend/vendors/jquery.ui.widget', function(require, module, exports){
/*! jQuery UI - v1.11.1 - 2014-09-17
* http://jqueryui.com
* Includes: widget.js
* Copyright 2014 jQuery Foundation and other contributors; Licensed MIT */

(function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define([ "jquery" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}(function( $ ) {
/*!
 * jQuery UI Widget 1.11.1
 * http://jqueryui.com
 *
 * Copyright 2014 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/jQuery.widget/
 */


var widget_uuid = 0,
	widget_slice = Array.prototype.slice;

$.cleanData = (function( orig ) {
	return function( elems ) {
		var events, elem, i;
		for ( i = 0; (elem = elems[i]) != null; i++ ) {
			try {

				// Only trigger remove when necessary to save time
				events = $._data( elem, "events" );
				if ( events && events.remove ) {
					$( elem ).triggerHandler( "remove" );
				}

			// http://bugs.jquery.com/ticket/8235
			} catch( e ) {}
		}
		orig( elems );
	};
})( $.cleanData );

$.widget = function( name, base, prototype ) {
	var fullName, existingConstructor, constructor, basePrototype,
		// proxiedPrototype allows the provided prototype to remain unmodified
		// so that it can be used as a mixin for multiple widgets (#8876)
		proxiedPrototype = {},
		namespace = name.split( "." )[ 0 ];

	name = name.split( "." )[ 1 ];
	fullName = namespace + "-" + name;

	if ( !prototype ) {
		prototype = base;
		base = $.Widget;
	}

	// create selector for plugin
	$.expr[ ":" ][ fullName.toLowerCase() ] = function( elem ) {
		return !!$.data( elem, fullName );
	};

	$[ namespace ] = $[ namespace ] || {};
	existingConstructor = $[ namespace ][ name ];
	constructor = $[ namespace ][ name ] = function( options, element ) {
		// allow instantiation without "new" keyword
		if ( !this._createWidget ) {
			return new constructor( options, element );
		}

		// allow instantiation without initializing for simple inheritance
		// must use "new" keyword (the code above always passes args)
		if ( arguments.length ) {
			this._createWidget( options, element );
		}
	};
	// extend with the existing constructor to carry over any static properties
	$.extend( constructor, existingConstructor, {
		version: prototype.version,
		// copy the object used to create the prototype in case we need to
		// redefine the widget later
		_proto: $.extend( {}, prototype ),
		// track widgets that inherit from this widget in case this widget is
		// redefined after a widget inherits from it
		_childConstructors: []
	});

	basePrototype = new base();
	// we need to make the options hash a property directly on the new instance
	// otherwise we'll modify the options hash on the prototype that we're
	// inheriting from
	basePrototype.options = $.widget.extend( {}, basePrototype.options );
	$.each( prototype, function( prop, value ) {
		if ( !$.isFunction( value ) ) {
			proxiedPrototype[ prop ] = value;
			return;
		}
		proxiedPrototype[ prop ] = (function() {
			var _super = function() {
					return base.prototype[ prop ].apply( this, arguments );
				},
				_superApply = function( args ) {
					return base.prototype[ prop ].apply( this, args );
				};
			return function() {
				var __super = this._super,
					__superApply = this._superApply,
					returnValue;

				this._super = _super;
				this._superApply = _superApply;

				returnValue = value.apply( this, arguments );

				this._super = __super;
				this._superApply = __superApply;

				return returnValue;
			};
		})();
	});
	constructor.prototype = $.widget.extend( basePrototype, {
		// TODO: remove support for widgetEventPrefix
		// always use the name + a colon as the prefix, e.g., draggable:start
		// don't prefix for widgets that aren't DOM-based
		widgetEventPrefix: existingConstructor ? (basePrototype.widgetEventPrefix || name) : name
	}, proxiedPrototype, {
		constructor: constructor,
		namespace: namespace,
		widgetName: name,
		widgetFullName: fullName
	});

	// If this widget is being redefined then we need to find all widgets that
	// are inheriting from it and redefine all of them so that they inherit from
	// the new version of this widget. We're essentially trying to replace one
	// level in the prototype chain.
	if ( existingConstructor ) {
		$.each( existingConstructor._childConstructors, function( i, child ) {
			var childPrototype = child.prototype;

			// redefine the child widget using the same prototype that was
			// originally used, but inherit from the new version of the base
			$.widget( childPrototype.namespace + "." + childPrototype.widgetName, constructor, child._proto );
		});
		// remove the list of existing child constructors from the old constructor
		// so the old child constructors can be garbage collected
		delete existingConstructor._childConstructors;
	} else {
		base._childConstructors.push( constructor );
	}

	$.widget.bridge( name, constructor );

	return constructor;
};

$.widget.extend = function( target ) {
	var input = widget_slice.call( arguments, 1 ),
		inputIndex = 0,
		inputLength = input.length,
		key,
		value;
	for ( ; inputIndex < inputLength; inputIndex++ ) {
		for ( key in input[ inputIndex ] ) {
			value = input[ inputIndex ][ key ];
			if ( input[ inputIndex ].hasOwnProperty( key ) && value !== undefined ) {
				// Clone objects
				if ( $.isPlainObject( value ) ) {
					target[ key ] = $.isPlainObject( target[ key ] ) ?
						$.widget.extend( {}, target[ key ], value ) :
						// Don't extend strings, arrays, etc. with objects
						$.widget.extend( {}, value );
				// Copy everything else by reference
				} else {
					target[ key ] = value;
				}
			}
		}
	}
	return target;
};

$.widget.bridge = function( name, object ) {
	var fullName = object.prototype.widgetFullName || name;
	$.fn[ name ] = function( options ) {
		var isMethodCall = typeof options === "string",
			args = widget_slice.call( arguments, 1 ),
			returnValue = this;

		// allow multiple hashes to be passed on init
		options = !isMethodCall && args.length ?
			$.widget.extend.apply( null, [ options ].concat(args) ) :
			options;

		if ( isMethodCall ) {
			this.each(function() {
				var methodValue,
					instance = $.data( this, fullName );
				if ( options === "instance" ) {
					returnValue = instance;
					return false;
				}
				if ( !instance ) {
					return $.error( "cannot call methods on " + name + " prior to initialization; " +
						"attempted to call method '" + options + "'" );
				}
				if ( !$.isFunction( instance[options] ) || options.charAt( 0 ) === "_" ) {
					return $.error( "no such method '" + options + "' for " + name + " widget instance" );
				}
				methodValue = instance[ options ].apply( instance, args );
				if ( methodValue !== instance && methodValue !== undefined ) {
					returnValue = methodValue && methodValue.jquery ?
						returnValue.pushStack( methodValue.get() ) :
						methodValue;
					return false;
				}
			});
		} else {
			this.each(function() {
				var instance = $.data( this, fullName );
				if ( instance ) {
					instance.option( options || {} );
					if ( instance._init ) {
						instance._init();
					}
				} else {
					$.data( this, fullName, new object( options, this ) );
				}
			});
		}

		return returnValue;
	};
};

$.Widget = function( /* options, element */ ) {};
$.Widget._childConstructors = [];

$.Widget.prototype = {
	widgetName: "widget",
	widgetEventPrefix: "",
	defaultElement: "<div>",
	options: {
		disabled: false,

		// callbacks
		create: null
	},
	_createWidget: function( options, element ) {
		element = $( element || this.defaultElement || this )[ 0 ];
		this.element = $( element );
		this.uuid = widget_uuid++;
		this.eventNamespace = "." + this.widgetName + this.uuid;
		this.options = $.widget.extend( {},
			this.options,
			this._getCreateOptions(),
			options );

		this.bindings = $();
		this.hoverable = $();
		this.focusable = $();

		if ( element !== this ) {
			$.data( element, this.widgetFullName, this );
			this._on( true, this.element, {
				remove: function( event ) {
					if ( event.target === element ) {
						this.destroy();
					}
				}
			});
			this.document = $( element.style ?
				// element within the document
				element.ownerDocument :
				// element is window or document
				element.document || element );
			this.window = $( this.document[0].defaultView || this.document[0].parentWindow );
		}

		this._create();
		this._trigger( "create", null, this._getCreateEventData() );
		this._init();
	},
	_getCreateOptions: $.noop,
	_getCreateEventData: $.noop,
	_create: $.noop,
	_init: $.noop,

	destroy: function() {
		this._destroy();
		// we can probably remove the unbind calls in 2.0
		// all event bindings should go through this._on()
		this.element
			.unbind( this.eventNamespace )
			.removeData( this.widgetFullName )
			// support: jquery <1.6.3
			// http://bugs.jquery.com/ticket/9413
			.removeData( $.camelCase( this.widgetFullName ) );
		this.widget()
			.unbind( this.eventNamespace )
			.removeAttr( "aria-disabled" )
			.removeClass(
				this.widgetFullName + "-disabled " +
				"ui-state-disabled" );

		// clean up events and states
		this.bindings.unbind( this.eventNamespace );
		this.hoverable.removeClass( "ui-state-hover" );
		this.focusable.removeClass( "ui-state-focus" );
	},
	_destroy: $.noop,

	widget: function() {
		return this.element;
	},

	option: function( key, value ) {
		var options = key,
			parts,
			curOption,
			i;

		if ( arguments.length === 0 ) {
			// don't return a reference to the internal hash
			return $.widget.extend( {}, this.options );
		}

		if ( typeof key === "string" ) {
			// handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
			options = {};
			parts = key.split( "." );
			key = parts.shift();
			if ( parts.length ) {
				curOption = options[ key ] = $.widget.extend( {}, this.options[ key ] );
				for ( i = 0; i < parts.length - 1; i++ ) {
					curOption[ parts[ i ] ] = curOption[ parts[ i ] ] || {};
					curOption = curOption[ parts[ i ] ];
				}
				key = parts.pop();
				if ( arguments.length === 1 ) {
					return curOption[ key ] === undefined ? null : curOption[ key ];
				}
				curOption[ key ] = value;
			} else {
				if ( arguments.length === 1 ) {
					return this.options[ key ] === undefined ? null : this.options[ key ];
				}
				options[ key ] = value;
			}
		}

		this._setOptions( options );

		return this;
	},
	_setOptions: function( options ) {
		var key;

		for ( key in options ) {
			this._setOption( key, options[ key ] );
		}

		return this;
	},
	_setOption: function( key, value ) {
		this.options[ key ] = value;

		if ( key === "disabled" ) {
			this.widget()
				.toggleClass( this.widgetFullName + "-disabled", !!value );

			// If the widget is becoming disabled, then nothing is interactive
			if ( value ) {
				this.hoverable.removeClass( "ui-state-hover" );
				this.focusable.removeClass( "ui-state-focus" );
			}
		}

		return this;
	},

	enable: function() {
		return this._setOptions({ disabled: false });
	},
	disable: function() {
		return this._setOptions({ disabled: true });
	},

	_on: function( suppressDisabledCheck, element, handlers ) {
		var delegateElement,
			instance = this;

		// no suppressDisabledCheck flag, shuffle arguments
		if ( typeof suppressDisabledCheck !== "boolean" ) {
			handlers = element;
			element = suppressDisabledCheck;
			suppressDisabledCheck = false;
		}

		// no element argument, shuffle and use this.element
		if ( !handlers ) {
			handlers = element;
			element = this.element;
			delegateElement = this.widget();
		} else {
			element = delegateElement = $( element );
			this.bindings = this.bindings.add( element );
		}

		$.each( handlers, function( event, handler ) {
			function handlerProxy() {
				// allow widgets to customize the disabled handling
				// - disabled as an array instead of boolean
				// - disabled class as method for disabling individual parts
				if ( !suppressDisabledCheck &&
						( instance.options.disabled === true ||
							$( this ).hasClass( "ui-state-disabled" ) ) ) {
					return;
				}
				return ( typeof handler === "string" ? instance[ handler ] : handler )
					.apply( instance, arguments );
			}

			// copy the guid so direct unbinding works
			if ( typeof handler !== "string" ) {
				handlerProxy.guid = handler.guid =
					handler.guid || handlerProxy.guid || $.guid++;
			}

			var match = event.match( /^([\w:-]*)\s*(.*)$/ ),
				eventName = match[1] + instance.eventNamespace,
				selector = match[2];
			if ( selector ) {
				delegateElement.delegate( selector, eventName, handlerProxy );
			} else {
				element.bind( eventName, handlerProxy );
			}
		});
	},

	_off: function( element, eventName ) {
		eventName = (eventName || "").split( " " ).join( this.eventNamespace + " " ) + this.eventNamespace;
		element.unbind( eventName ).undelegate( eventName );
	},

	_delay: function( handler, delay ) {
		function handlerProxy() {
			return ( typeof handler === "string" ? instance[ handler ] : handler )
				.apply( instance, arguments );
		}
		var instance = this;
		return setTimeout( handlerProxy, delay || 0 );
	},

	_hoverable: function( element ) {
		this.hoverable = this.hoverable.add( element );
		this._on( element, {
			mouseenter: function( event ) {
				$( event.currentTarget ).addClass( "ui-state-hover" );
			},
			mouseleave: function( event ) {
				$( event.currentTarget ).removeClass( "ui-state-hover" );
			}
		});
	},

	_focusable: function( element ) {
		this.focusable = this.focusable.add( element );
		this._on( element, {
			focusin: function( event ) {
				$( event.currentTarget ).addClass( "ui-state-focus" );
			},
			focusout: function( event ) {
				$( event.currentTarget ).removeClass( "ui-state-focus" );
			}
		});
	},

	_trigger: function( type, event, data ) {
		var prop, orig,
			callback = this.options[ type ];

		data = data || {};
		event = $.Event( event );
		event.type = ( type === this.widgetEventPrefix ?
			type :
			this.widgetEventPrefix + type ).toLowerCase();
		// the original event may come from any element
		// so we need to reset the target on the new event
		event.target = this.element[ 0 ];

		// copy original event properties over to the new event
		orig = event.originalEvent;
		if ( orig ) {
			for ( prop in orig ) {
				if ( !( prop in event ) ) {
					event[ prop ] = orig[ prop ];
				}
			}
		}

		this.element.trigger( event, data );
		return !( $.isFunction( callback ) &&
			callback.apply( this.element[0], [ event ].concat( data ) ) === false ||
			event.isDefaultPrevented() );
	}
};

$.each( { show: "fadeIn", hide: "fadeOut" }, function( method, defaultEffect ) {
	$.Widget.prototype[ "_" + method ] = function( element, options, callback ) {
		if ( typeof options === "string" ) {
			options = { effect: options };
		}
		var hasOptions,
			effectName = !options ?
				method :
				options === true || typeof options === "number" ?
					defaultEffect :
					options.effect || defaultEffect;
		options = options || {};
		if ( typeof options === "number" ) {
			options = { duration: options };
		}
		hasOptions = !$.isEmptyObject( options );
		options.complete = callback;
		if ( options.delay ) {
			element.delay( options.delay );
		}
		if ( hasOptions && $.effects && $.effects.effect[ effectName ] ) {
			element[ method ]( options );
		} else if ( effectName !== method && element[ effectName ] ) {
			element[ effectName ]( options.duration, options.easing, callback );
		} else {
			element.queue(function( next ) {
				$( this )[ method ]();
				if ( callback ) {
					callback.call( element[ 0 ] );
				}
				next();
			});
		}
	};
});

var widget = $.widget;



}));

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
//@ sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic2VjdGlvbnMiOlt7Im9mZnNldCI6eyJsaW5lIjo1MDY4LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvYXBwLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJyZXF1aXJlICcuL2dsb2JhbHMnXG5yZXF1aXJlICcuL3ZlbmRvcnMnXG5yZXF1aXJlICcuLi92ZW5kb3JzL3BhcmFsbGF4Lm1pbi5qcydcblxuXG52aWV3cyAgICAgICAgICAgPSByZXF1aXJlICcuL2NvbnRyb2xsZXJzL3ZpZXdzJ1xubmF2aWdhdGlvbiAgICAgID0gcmVxdWlyZSAnLi9jb250cm9sbGVycy9uYXZpZ2F0aW9uJ1xudXNlcl9jb250cm9sbGVyID0gcmVxdWlyZSAnLi9jb250cm9sbGVycy91c2VyJ1xuY2xvdWRpbmFyeSAgICAgID0gcmVxdWlyZSAnLi9jb250cm9sbGVycy9jbG91ZGluYXJ5J1xuIyBtb3Rpb24gICA9IHJlcXVpcmUgJ2FwcC9jb250cm9sbGVycy9tb3Rpb24nXG5cbmNsYXNzIEFwcFxuXG5cdCMgbGluayB0byB3aW5kb3dcblx0d2luZG93OiBudWxsXG5cblx0IyBsaW5rIHRvIHV0aWxzL3NldHRpbmdzXG5cdHNldHRpbmdzOiBudWxsXG5cblx0IyBsaW5rIHRvIGNvbnRyb2xsZXIvbG9jYWxfY29ubmVjdGlvblxuXHRsb2NhbDogbnVsbFxuXG5cdGNvbnN0cnVjdG9yOiAtPiBcdFxuXG5cdFx0aGFwcGVucyBAXG5cblx0XHQjIGFyZSB3ZSB1c2luZyB0aGlzP1xuXHRcdEBvbiAncmVhZHknLCBAYWZ0ZXJfcmVuZGVyXG5cblx0c3RhcnQ6IC0+XG5cdFx0XG5cdFx0QGxvY2FsICA9IHJlcXVpcmUgJ2FwcC9jb250cm9sbGVycy9sb2NhbF9jb25uZWN0aW9uJ1xuXHRcdEB3aW5kb3cgPSByZXF1aXJlICdhcHAvY29udHJvbGxlcnMvd2luZG93J1xuXG5cdFx0QGJvZHkgICA9ICQgJ2JvZHknXG5cblx0XHRcblx0XHRAc2V0dGluZ3MgPSByZXF1aXJlICdhcHAvdXRpbHMvc2V0dGluZ3MnXG5cdFx0QHNldHRpbmdzLmJpbmQgQGJvZHlcblxuXHRcdCMgQ29udHJvbGxlcnMgYmluZGluZ1xuXHRcdGRvIHZpZXdzLmJpbmRcblx0XHRkbyBuYXZpZ2F0aW9uLmJpbmRcblxuXHRcdCMgd2hlbiB0aGUgbmV3IGFyZSBpcyByZW5kZXJlZCwgZG8gdGhlIHNhbWUgd2l0aCB0aGUgbmV3IGNvbnRlbnRcblxuXHRcdG5hdmlnYXRpb24ub24gJ2JlZm9yZV9kZXN0cm95JywgPT5cblx0XHRcdGxvZyBcIi0tLS0tLS0tLSBCRUZPUkUgREVTVFJPWVwiXG5cdFx0XHR2aWV3cy51bmJpbmQgJyNjb250ZW50J1xuXG5cdFx0bmF2aWdhdGlvbi5vbiAnYWZ0ZXJfcmVuZGVyJywgPT4gXG5cdFx0XHR2aWV3cy5iaW5kICAgICAgICcjY29udGVudCdcblx0XHRcdG5hdmlnYXRpb24uYmluZCAnI2NvbnRlbnQnXG5cdFx0XHRkbyB1c2VyX2NvbnRyb2xsZXIuY2hlY2tfdXNlclxuXG5cdFx0XHRcblx0XG5cdCMgVXNlciBQcm94aWVzXG5cdGxvZ2luIDogKCB1c2VyICkgLT4gXG5cdFx0bG9nIFwiLS0tLS0tLS0+IGxvZ2luIGNhbGxlZCBmcm9tIG91dHNpZGVcIlxuXHRcdG5hdmlnYXRpb24uZ28gXCIvI3t1c2VyLnVzZXJuYW1lfVwiXG5cdFx0dXNlcl9jb250cm9sbGVyLmxvZ2luIHVzZXJcblxuXHRsb2dvdXQ6IC0+IFxuXHRcdGxvZyBcIltsb2dnZWQgb3V0XVwiLCB1c2VyXG5cdFx0XG5cdFx0dXNlcl9jb250cm9sbGVyLmxvZ291dCgpXG5cblxuXHQjIyNcblx0IyBBZnRlciB0aGUgdmlld3MgaGF2ZSBiZWVuIHJlbmRlcmVkXG5cdCMjI1xuXHRhZnRlcl9yZW5kZXI6ICggKSA9PlxuXHRcdGxvZyBcImFmdGVyX3JlbmRlclwiXG5cdFx0IyBIaWRlIHRoZSBsb2FkaW5nXG5cdFx0ZGVsYXkgMTAsID0+IEBib2R5LmFkZENsYXNzIFwibG9hZGVkXCJcblxuXHRcdFxuYXBwID0gbmV3IEFwcFxuXG4kIC0+IGFwcC5zdGFydCgpXG5cbm1vZHVsZS5leHBvcnRzID0gd2luZG93LmFwcCA9IGFwcCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLG9EQUFBO0dBQUEsK0VBQUE7O0FBQUEsQ0FBQSxNQUFBLElBQUE7O0FBQ0EsQ0FEQSxNQUNBLElBQUE7O0FBQ0EsQ0FGQSxNQUVBLHFCQUFBOztBQUdBLENBTEEsRUFLa0IsRUFBbEIsRUFBa0IsY0FBQTs7QUFDbEIsQ0FOQSxFQU1rQixJQUFBLEdBQWxCLGdCQUFrQjs7QUFDbEIsQ0FQQSxFQU9rQixJQUFBLFFBQWxCLEtBQWtCOztBQUNsQixDQVJBLEVBUWtCLElBQUEsR0FBbEIsZ0JBQWtCOztBQUdaLENBWE47Q0FjQyxFQUFRLENBQVIsRUFBQTs7Q0FBQSxFQUdVLENBSFYsSUFHQTs7Q0FIQSxFQU1PLENBTlAsQ0FNQTs7Q0FFYSxDQUFBLENBQUEsVUFBQTtDQUVaLGtEQUFBO0NBQUEsR0FBQSxHQUFBO0NBQUEsQ0FHQSxFQUFBLEdBQUEsS0FBQTtDQWJELEVBUWE7O0NBUmIsRUFlTyxFQUFQLElBQU87Q0FFTixPQUFBLElBQUE7Q0FBQSxFQUFVLENBQVYsQ0FBQSxFQUFVLDJCQUFBO0NBQVYsRUFDVSxDQUFWLEVBQUEsQ0FBVSxpQkFBQTtDQURWLEVBR1UsQ0FBVixFQUFVO0NBSFYsRUFNWSxDQUFaLEdBQVksQ0FBWixZQUFZO0NBTlosR0FPQSxJQUFTO0NBUFQsR0FVRyxDQUFLO0NBVlIsR0FXRyxNQUFVO0NBWGIsQ0FlQSxDQUFnQyxDQUFoQyxLQUFnQyxDQUF0QixNQUFWO0NBQ0MsRUFBQSxHQUFBLG9CQUFBO0NBQ00sSUFBRCxDQUFMLElBQUEsR0FBQTtDQUZELElBQWdDO0NBSXJCLENBQVgsQ0FBOEIsTUFBQSxDQUFwQixDQUFWLEdBQUE7Q0FDQyxHQUFBLENBQUssQ0FBTCxJQUFBO0NBQUEsR0FDQSxFQUFBLElBQVU7Q0FDUyxTQUFuQixHQUFHLEVBQWU7Q0FIbkIsSUFBOEI7Q0FwQy9CLEVBZU87O0NBZlAsRUE0Q1EsQ0FBQSxDQUFSLElBQVU7Q0FDVCxFQUFBLENBQUEsaUNBQUE7Q0FBQSxDQUNBLENBQWUsQ0FBZixJQUFBLEVBQVU7Q0FDTSxHQUFoQixDQUFBLE1BQUEsSUFBZTtDQS9DaEIsRUE0Q1E7O0NBNUNSLEVBaURRLEdBQVIsR0FBUTtDQUNQLENBQW9CLENBQXBCLENBQUEsVUFBQTtDQUVnQixLQUFoQixLQUFBLElBQWU7Q0FwRGhCLEVBaURROztDQU1SOzs7Q0F2REE7O0NBQUEsRUEwRGMsTUFBQSxHQUFkO0NBQ0MsT0FBQSxJQUFBO0NBQUEsRUFBQSxDQUFBLFVBQUE7Q0FFTSxDQUFOLENBQVUsRUFBVixJQUFVLEVBQVY7Q0FBYyxHQUFJLENBQUosR0FBRCxLQUFBO0NBQWIsSUFBVTtDQTdEWCxFQTBEYzs7Q0ExRGQ7O0NBZEQ7O0FBOEVBLENBOUVBLEVBOEVBOztBQUVBLENBaEZBLEVBZ0ZFLE1BQUE7Q0FBTyxFQUFELEVBQUgsSUFBQTtDQUFIOztBQUVGLENBbEZBLEVBa0ZpQixHQUFYLENBQU4ifX0seyJvZmZzZXQiOnsibGluZSI6NTE1NiwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL2NvbnRyb2xsZXJzL2FwcGNhc3QuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIyBTb2NrZXQgY29udHJvbGxlciB3aWxsIGJlIHVzZWQgdG8gY29tbXVuaWNhdGUgd2l0aCBkZXNrdG9wIGFwcCBBcHBDYXN0XG4jIyNcblxuYXdhcmUgICAgPSByZXF1aXJlICdhd2FyZSdcbiMgc2hvcnRjdXQgZm9yIHZlbmRvciBzY3JpcHRzXG52ICAgICAgID0gcmVxdWlyZSAnYXBwL3ZlbmRvcnMnXG5cbiMgdGhlIGNvbnRyb2xsZXIgaXMgdGhlIG1vZGVsLCBtb2Rlcm4gY29uY2VwdCBvZiBoZXJtYXBocm9kaXRlIGZpbGVcbmFwcGNhc3QgPSBhd2FyZSB7fVxuXG4jIG9ubHkgZW5hYmxlIGlmIGF2YWlsYWJsZSBvbiB3aW5kb3dcbldlYlNvY2tldCA9IHdpbmRvdy5XZWJTb2NrZXQgfHwgbnVsbFxuXG4jIHdlYnNvY2tldCBjb25uZWN0aW9uc1xuYXBwY2FzdC5tZXNzYWdlcyA9IHt9XG5hcHBjYXN0LnZ1ICAgICAgID0ge31cblxuXG5hcHBjYXN0LnNldCAnY29ubmVjdGVkJywgZmFsc2VcbiMgY29ubmVjdHMgdG8gQXBwQ2FzdCdzIFdlYlNvY2tldCBzZXJ2ZXIgYW5kIGxpc3RlbiBmb3IgbWVzc2FnZXNcbmFwcGNhc3QuY29ubmVjdCA9IC0+XG5cbiAgaWYgbm90IFdlYlNvY2tldFxuICAgIHJldHVybiBjb25zb2xlLmluZm8gJysgc29ja2V0IGNvbnRyb2xsZXIgd29udCBjb25uZWN0J1xuXG4gIG1lc3NhZ2VzX3NvY2tldCA9ICd3czovL2xvY2FsaG9zdDo1MTIzNC9sb29wY2FzdC9tZXNzYWdlcydcbiAgYXBwY2FzdC5tZXNzYWdlcyA9IG5ldyB2LlJlY29ubmVjdGluZ1dlYnNvY2tldCBtZXNzYWdlc19zb2NrZXRcblxuICBhcHBjYXN0Lm1lc3NhZ2VzLm9ub3BlbiA9IC0+XG4gICAgY29uc29sZS5pbmZvICctIHNvY2tldCBjb250cm9sbGVyIGNvbm5lY3Rpb24gb3BlbmVkJ1xuXG4gICAgYXBwY2FzdC5zZXQgJ2Nvbm5lY3RlZCcsIHRydWVcblxuICAgIGFwcGNhc3QubWVzc2FnZXMuc2VuZCBKU09OLnN0cmluZ2lmeSBbICdnZXRfaW5wdXRfZGV2aWNlcycgXVxuXG4gIGFwcGNhc3QubWVzc2FnZXMub25jbG9zZSA9IC0+XG4gICAgY29uc29sZS5pbmZvICctIEFwcENhc3QgaXNudCBPUEVOLCB3aWxsIHJldHJ5IHRvIGNvbm5lY3QnXG5cbiAgICBhcHBjYXN0LnNldCAnY29ubmVjdGVkJywgZmFsc2VcblxuXG4gICMgcm91dGUgaW5jb21pbmcgbWVzc2FnZXMgdG8gYXBwY2FzdC5jYWxsYmFja3MgaGFzaFxuICBhcHBjYXN0Lm1lc3NhZ2VzLm9ubWVzc2FnZSA9ICggZSApIC0+XG5cbiAgICBqc29uID0gZS5kYXRhXG5cbiAgICB0cnlcbiAgICAgIGZyb21fanNvbiA9IEpTT04ucGFyc2UganNvblxuICAgIGNhdGNoIGVycm9yXG4gICAgICBjb25zb2xlLmVycm9yIFwiLSBzb2NrZXQgY29udHJvbGxlciBlcnJvciBwYXJzaW5nIGpzb25cIlxuICAgICAgY29uc29sZS5lcnJvciBlcnJvclxuICAgICAgcmV0dXJuIGVycm9yXG5cbiAgICBtZXRob2QgPSBmcm9tX2pzb25bMF1cbiAgICBhcmdzICAgPSBmcm9tX2pzb25bMV1cbiAgICBcbiAgICBpZiAnZXJyb3InID09IG1ldGhvZFxuICAgICAgcmV0dXJuIGNvbnNvbGUubG9nICdlcnJvcicsIGFyZ3NcblxuICAgIGlmIHR5cGVvZiBhcHBjYXN0LmNhbGxiYWNrc1ttZXRob2RdIGlzICdmdW5jdGlvbidcbiAgICAgIGFwcGNhc3QuY2FsbGJhY2tzW21ldGhvZF0oIGFyZ3MgKVxuICAgIGVsc2UgXG4gICAgICBjb25zb2xlLmxvZyBcIiArIHNvY2tldCBjb250cm9sbGVyIGhhcyBubyBjYWxsYmFjayBmb3I6XCIsIG1ldGhvZFxuXG5cblxuICB2dV9zb2NrZXQgPSAnd3M6Ly9sb2NhbGhvc3Q6NTEyMzQvbG9vcGNhc3QvdnUnXG4gIGFwcGNhc3QudnUgPSBuZXcgdi5SZWNvbm5lY3RpbmdXZWJzb2NrZXQgdnVfc29ja2V0XG5cbiAgYXBwY2FzdC52dS5vbm9wZW4gPSAtPlxuICAgIGNvbnNvbGUuaW5mbyAnLSBzb2NrZXQgVlUgY29ubmVjdGlvbiBvcGVuZWQnXG5cbiAgICBhcHBjYXN0LnNldCAndnU6Y29ubmVjdGVkJywgdHJ1ZVxuXG4gIGFwcGNhc3QudnUub25jbG9zZSA9IC0+XG4gICAgY29uc29sZS5pbmZvICctIHNvY2tldCBWVSBjb25uZWN0aW9uIGNsb3NlZCdcblxuICAgIGFwcGNhc3Quc2V0ICd2dTpjb25uZWN0ZWQnLCBmYWxzZVxuXG4gICMgcm91dGUgaW5jb21pbmcgbWVzc2FnZXMgdG8gYXBwY2FzdC5jYWxsYmFja3MgaGFzaFxuICBhcHBjYXN0LnZ1Lm9ubWVzc2FnZSA9ICggZSApIC0+XG5cbiAgICByZWFkZXIgPSBuZXcgRmlsZVJlYWRlclxuXG4gICAgcmVhZGVyLm9ubG9hZCA9ICggZSApIC0+XG4gICAgICBidWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5IGUudGFyZ2V0LnJlc3VsdFxuXG4gICAgICBhcHBjYXN0LnNldCAnc3RyZWFtOnZ1JywgYnVmZmVyICBcblxuICAgIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlciBlLmRhdGFcblxuYXBwY2FzdC5zdGFydF9zdHJlYW0gPSAoIGRldmljZV9uYW1lICkgLT5cblxuICBtb3VudF9wb2ludCA9IFwiaGVtc1wiXG4gIHBhc3N3b3JkICAgID0gXCJsb29wY2FzdDIwMTVcIlxuXG4gIHBheWxvYWQgPSBcbiAgICBkZXZpY2VfbmFtZSA6IGRldmljZV9uYW1lXG4gICAgbW91bnRfcG9pbnQgOiBtb3VudF9wb2ludFxuICAgIHBhc3N3b3JkICAgIDogcGFzc3dvcmRcblxuICBhcHBjYXN0LnNldCBcInN0cmVhbTpzdGFydGluZ1wiLCB0cnVlXG4gIGFwcGNhc3QubWVzc2FnZXMuc2VuZCBKU09OLnN0cmluZ2lmeSBbIFwic3RhcnRfc3RyZWFtXCIsIHBheWxvYWQgXVxuXG5hcHBjYXN0LnN0b3Bfc3RyZWFtID0gLT5cblxuICBhcHBjYXN0LnNldCBcInN0cmVhbTpzdG9wcGluZ1wiLCB0cnVlXG4gIGFwcGNhc3QubWVzc2FnZXMuc2VuZCBKU09OLnN0cmluZ2lmeSBbIFwic3RvcF9zdHJlYW1cIiBdXG5cblxuIyMjXG4jIGNhbGxiYWNrcyBhcmUgY2FsbGVkIGJ5IFwibWVzc2FnZXNcIiBjb21pbmcgZnJvbSB0aGUgV2Vic29ja2V0U2VydmVyIGNyZWF0ZWRcbiMgYnkgdGhlIGRlc2t0b3AgYXBwbGljYXRpb24gQXBwQ2FzdFxuIyMjXG5hcHBjYXN0LmNhbGxiYWNrcyA9XG4gIGlucHV0X2RldmljZXMgIDogKCBhcmdzICkgLT5cblxuICAgICMgY29uc29sZS5sb2cgXCIrIHNvY2tldCBjb250cm9sbHIgZ290IGlucHV0IGRldmljZXNcIiwgYXJncy5kZXZpY2VzXG5cbiAgICAjIHNhdmVzIGxpc3Qgb2YgZGV2aWNlcyBhbmQgYnJvYWRjYXN0IGNoYW5nZVxuICAgIGFwcGNhc3Quc2V0ICdpbnB1dF9kZXZpY2VzJywgYXJncy5kZXZpY2VzXG5cbiAgICAjIGF1dG9tYXRpY2FseSB0ZXN0aW5nIHN0cmVhbVxuICAgICMgYXBwY2FzdC5zdGFydF9zdHJlYW0gXCJTb3VuZGZsb3dlciAoMmNoKVwiXG5cbiAgc3RyZWFtX3N0YXJ0ZWQgOiAoIGFyZ3MgKSAtPlxuXG4gICAgaWYgYXJncz8gYW5kIGFyZ3MuZXJyb3I/XG5cbiAgICAgIGNvbnNvbGUuZXJyb3IgXCItIHN0cmVhbV9zdGFydGVkIGVycm9yOlwiLCBhcmdzLmVycm9yXG5cbiAgICAgIGFwcGNhc3Quc2V0IFwic3RyZWFtOmVycm9yXCIsIGFyZ3MuZXJyb3JcblxuICAgICAgcmV0dXJuXG5cbiAgICAjIHNhdmUgY3VycmVudCBzdHJlYW06b25saW5lIHN0YXR1c1xuICAgIGFwcGNhc3Quc2V0ICdzdHJlYW06b25saW5lJywgdHJ1ZVxuXG4gICAgIyByZXNldCBvdGhlciBzdHJhbWluZyBmbGFnc1xuICAgIGFwcGNhc3Quc2V0IFwic3RyZWFtOnN0YXJ0aW5nXCIsIG51bGxcbiAgICBhcHBjYXN0LnNldCBcInN0cmVhbTplcnJvclwiICAgLCBudWxsXG5cbiAgc3RyZWFtX3N0b3BwZWQ6IC0+XG5cbiAgICAjIHNhdmUgY3VycmVudCBzdHJlYW06b25saW5lIHN0YXR1c1xuICAgIGFwcGNhc3Quc2V0ICdzdHJlYW06b25saW5lJyAgLCBmYWxzZVxuICAgIGFwcGNhc3Quc2V0IFwic3RyZWFtOnN0b3BwaW5nXCIsIG51bGxcblxuIyMjXG4jIExpc3RlbmluZyB0byBtZXNzYWdlc1xuIyMjXG5hcHBjYXN0Lm9uICdpbnB1dF9kZXZpY2UnLCAtPlxuXG4gIGlmIGFwcGNhc3QuZ2V0ICdzdHJlYW06b25saW5lJ1xuICAgIGNvbnNvbGUuZXJyb3IgJy0gaW5wdXQgZGV2aWNlIGNoYW5nZWQgd2hpbGUgc3RyZWFtOm9ubGluZSdcbiAgICBjb25zb2xlLmVycm9yICc/IHdoYXQgc2hvdWxkIHdlIGRvJ1xuXG4jIHNob3VsZCB0cnkgdG8gY29ubmVjdCBvbmx5IG9uIGl0J3Mgb3duIHByb2ZpbGUgcGFnZVxuYXBwY2FzdC5jb25uZWN0KClcblxubW9kdWxlLmV4cG9ydHMgPSBhcHBjYXN0Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Q0FBQTtDQUFBLEdBQUEsd0JBQUE7O0FBSUEsQ0FKQSxFQUlXLEVBQVgsRUFBVzs7QUFFWCxDQU5BLEVBTVUsSUFBQSxNQUFBOztBQUdWLENBVEEsQ0FTVSxDQUFBLEVBQUEsRUFBVjs7QUFHQSxDQVpBLEVBWVksQ0FBb0IsRUFBZCxHQUFsQjs7QUFHQSxDQWZBLENBQUEsQ0FlbUIsSUFBWixDQUFQOztBQUNBLENBaEJBLENBZ0JBLENBQW1CLElBQVo7O0FBR1AsQ0FuQkEsQ0FtQnlCLENBQXpCLEVBQUEsRUFBTyxJQUFQOztBQUVBLENBckJBLEVBcUJrQixJQUFYLEVBQVc7Q0FFaEIsS0FBQSxvQkFBQTtBQUFPLENBQVAsQ0FBQSxFQUFHLEtBQUg7Q0FDRSxHQUFPLEdBQU8sSUFBUCx1QkFBQTtJQURUO0NBQUEsQ0FHQSxDQUFrQixZQUFsQix5QkFIQTtDQUFBLENBSUEsQ0FBdUIsQ0FBQSxHQUFoQixDQUFQLE9BQXVCLE1BQUE7Q0FKdkIsQ0FNQSxDQUEwQixHQUExQixDQUFPLENBQVMsQ0FBVTtDQUN4QixHQUFBLEdBQU8sZ0NBQVA7Q0FBQSxDQUV5QixDQUF6QixDQUFBLEdBQU8sSUFBUDtDQUVRLEdBQVIsR0FBTyxDQUFTLENBQU0sRUFBdEIsUUFBcUM7Q0FYdkMsRUFNMEI7Q0FOMUIsQ0FhQSxDQUEyQixJQUFwQixDQUFTLENBQVc7Q0FDekIsR0FBQSxHQUFPLHFDQUFQO0NBRVEsQ0FBaUIsQ0FBekIsRUFBQSxFQUFPLElBQVA7Q0FoQkYsRUFhMkI7Q0FiM0IsQ0FvQkEsQ0FBNkIsSUFBdEIsQ0FBUyxDQUFoQjtDQUVFLE9BQUEsNEJBQUE7Q0FBQSxFQUFPLENBQVA7Q0FFQTtDQUNFLEVBQVksQ0FBSSxDQUFKLENBQVosR0FBQTtNQURGO0NBR0UsS0FESTtDQUNKLElBQUEsQ0FBQSxDQUFPLGlDQUFQO0NBQUEsSUFDQSxDQUFBLENBQU87Q0FDUCxJQUFBLFFBQU87TUFQVDtDQUFBLEVBU1MsQ0FBVCxFQUFBLEdBQW1CO0NBVG5CLEVBVVMsQ0FBVCxLQUFtQjtDQUVuQixHQUFBLENBQWMsQ0FBZCxDQUFHO0NBQ0QsQ0FBNEIsQ0FBckIsQ0FBQSxHQUFPLE1BQVA7TUFiVDtBQWVHLENBQUgsR0FBQSxDQUF1QyxDQUFwQyxDQUFjLEVBQVcsQ0FBNUI7Q0FDVSxHQUFSLEVBQWtCLENBQVgsRUFBVyxJQUFsQjtNQURGO0NBR1UsQ0FBaUQsQ0FBekQsR0FBQSxDQUFPLE1BQVAsOEJBQUE7TUFwQnlCO0NBcEI3QixFQW9CNkI7Q0FwQjdCLENBNENBLENBQVksTUFBWix5QkE1Q0E7Q0FBQSxDQTZDQSxDQUFpQixDQUFBLEdBQVYsRUFBVSxZQUFBO0NBN0NqQixDQStDQSxDQUFvQixHQUFwQixDQUFPLEVBQWE7Q0FDbEIsR0FBQSxHQUFPLHdCQUFQO0NBRVEsQ0FBb0IsQ0FBNUIsQ0FBQSxHQUFPLElBQVAsR0FBQTtDQWxERixFQStDb0I7Q0EvQ3BCLENBb0RBLENBQXFCLElBQWQsRUFBYztDQUNuQixHQUFBLEdBQU8sd0JBQVA7Q0FFUSxDQUFvQixDQUE1QixFQUFBLEVBQU8sSUFBUCxHQUFBO0NBdkRGLEVBb0RxQjtDQU1iLENBQUUsQ0FBYSxJQUFoQixFQUFQO0NBRUUsS0FBQSxFQUFBO0FBQVMsQ0FBVCxFQUFTLENBQVQsRUFBQSxJQUFBO0NBQUEsRUFFZ0IsQ0FBaEIsRUFBTSxHQUFZO0NBQ2hCLEtBQUEsSUFBQTtDQUFBLEVBQWEsQ0FBQSxFQUFiLE1BQWE7Q0FFTCxDQUFpQixDQUF6QixHQUFBLENBQU8sSUFBUCxFQUFBO0NBTEYsSUFFZ0I7Q0FLVCxHQUFQLEVBQU0sS0FBTixNQUFBO0NBckVjLEVBNERPO0NBNURQOztBQXVFbEIsQ0E1RkEsRUE0RnVCLElBQWhCLEVBQWtCLEVBQUYsQ0FBdkI7Q0FFRSxLQUFBLHdCQUFBO0NBQUEsQ0FBQSxDQUFjLEdBQWQsS0FBQTtDQUFBLENBQ0EsQ0FBYyxLQUFkLE1BREE7Q0FBQSxDQUdBLENBQ0UsSUFERjtDQUNFLENBQWMsRUFBZCxPQUFBO0NBQUEsQ0FDYyxFQUFkLE9BQUE7Q0FEQSxDQUVjLEVBQWQsSUFBQTtDQU5GLEdBQUE7Q0FBQSxDQVFBLENBQUEsQ0FBQSxHQUFPLFVBQVA7Q0FDUSxDQUErQyxFQUF2RCxHQUFPLENBQVMsQ0FBaEIsS0FBcUM7Q0FYaEI7O0FBYXZCLENBekdBLEVBeUdzQixJQUFmLEVBQWUsRUFBdEI7Q0FFRSxDQUFBLENBQUEsQ0FBQSxHQUFPLFVBQVA7Q0FDUSxHQUFSLEdBQU8sQ0FBUyxDQUFoQixJQUFxQztDQUhqQjs7Q0FNdEI7Ozs7Q0EvR0E7O0FBbUhBLENBbkhBLEVBb0hFLElBREssRUFBUDtDQUNFLENBQUEsQ0FBaUIsQ0FBQSxLQUFFLElBQW5CO0NBS1UsQ0FBcUIsQ0FBN0IsQ0FBaUMsR0FBMUIsSUFBUCxJQUFBO0NBTEYsRUFBaUI7Q0FBakIsQ0FVQSxDQUFpQixDQUFBLEtBQUUsS0FBbkI7Q0FFRSxHQUFBLFVBQUcsTUFBSDtDQUVFLENBQXlDLEVBQUksQ0FBN0MsQ0FBQSxDQUFPLGtCQUFQO0NBQUEsQ0FFNEIsQ0FBNUIsQ0FBZ0MsQ0FBaEMsQ0FBQSxDQUFPLE9BQVA7Q0FFQSxXQUFBO01BTkY7Q0FBQSxDQVM2QixDQUE3QixDQUFBLEdBQU8sUUFBUDtDQVRBLENBWStCLENBQS9CLENBQUEsR0FBTyxVQUFQO0NBQ1EsQ0FBdUIsQ0FBL0IsQ0FBQSxHQUFPLElBQVAsR0FBQTtDQXpCRixFQVVpQjtDQVZqQixDQTJCQSxDQUFnQixNQUFBLEtBQWhCO0NBR0UsQ0FBK0IsQ0FBL0IsQ0FBQSxDQUFBLEVBQU8sUUFBUDtDQUNRLENBQXVCLENBQS9CLENBQUEsR0FBTyxJQUFQLE1BQUE7Q0EvQkYsRUEyQmdCO0NBL0lsQixDQUFBOztDQXFKQTs7O0NBckpBOztBQXdKQSxDQXhKQSxDQXdKQSxDQUEyQixJQUFwQixFQUFvQixLQUEzQjtDQUVFLENBQUEsQ0FBRyxDQUFBLEdBQU8sUUFBUDtDQUNELEdBQUEsQ0FBQSxFQUFPLHFDQUFQO0NBQ1EsSUFBUixFQUFPLElBQVAsVUFBQTtJQUp1QjtDQUFBOztBQU8zQixDQS9KQSxNQStKTzs7QUFFUCxDQWpLQSxFQWlLaUIsR0FBWCxDQUFOIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjUyOTgsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy9jb250cm9sbGVycy9jbG91ZGluYXJ5LmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJyZXF1aXJlICdoYXBwZW5zJ1xuXG5jbGFzcyBDbG91ZGluYXJ5XG5cdGluc3RhbmNlID0gbnVsbFxuXHRjb25maWc6IFxuXHRcdGNsb3VkX25hbWU6IFwiXCJcblx0XHRhcGlfa2V5OiBcIlwiXG5cblxuXHRjb25zdHJ1Y3RvcjogLT5cblxuXHRcdGlmIENsb3VkaW5hcnkuaW5zdGFuY2Vcblx0XHRcdGNvbnNvbGUuZXJyb3IgXCJZb3UgY2FuJ3QgaW5zdGFudGlhdGUgdGhpcyBDbG91ZGluYXJ5IHR3aWNlXCJcdFxuXHRcdFx0cmV0dXJuXG5cblx0XHRDbG91ZGluYXJ5Lmluc3RhbmNlID0gQFxuXG5cdHNldF9jb25maWc6ICggZGF0YSApIC0+XG5cblx0XHRpZiBAY29uZmlnLmNsb3VkX25hbWUgaXNudCBkYXRhLmNsb3VkX25hbWUgb3IgQGNvbmZpZy5hcGlfa2V5IGlzbnQgZGF0YS5hcGlfa2V5XG5cdFx0XHQjIFVwZGF0ZSB0aGUgaW50ZXJuYWwgb2JqZWN0XG5cdFx0XHRAY29uZmlnID0gZGF0YVxuXG5cdFx0XHQjIFVwZGF0ZSB0aGUgalF1ZXJ5IHBsdWdpbiBjb25maWdcblx0XHRcdCQuY2xvdWRpbmFyeS5jb25maWdcblx0XHRcdFx0Y2xvdWRfbmFtZTogQGNvbmZpZy5jbG91ZF9uYW1lIFxuXHRcdFx0XHRhcGlfa2V5ICAgOiBAY29uZmlnLmFwaV9rZXlcblxuXHQjIFJldHVybiB0aGUgZm9ybSB3aXRoIHRoZSBjbG91ZGluYXJ5IHVuc2lnbmVkIGlucHV0IGZpbGUgYXBwZW5kZWRcblx0aW5pdGlhbGlzZV9mb3JtOiAoIGZvcm0sIGNhbGxiYWNrICkgLT5cblx0XHRmb3JtLmFwcGVuZCggJC5jbG91ZGluYXJ5LnVuc2lnbmVkX3VwbG9hZF90YWcoIEBjb25maWcudW5zaWduZWRfaWQsIFxuXHRcdFx0Y2xvdWRfbmFtZTogQGNvbmZpZy5jbG91ZF9uYW1lXG5cdFx0KSApXG5cblx0XHRkZWxheSAxMDAsIC0+IGNhbGxiYWNrIGZvcm1cblxuXG5cbiMgd2lsbCBhbHdheXMgZXhwb3J0IHRoZSBzYW1lIGluc3RhbmNlXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBDbG91ZGluYXJ5XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxNQUFBOztBQUFBLENBQUEsTUFBQSxFQUFBOztBQUVNLENBRk47Q0FHQyxLQUFBLEVBQUE7O0NBQUEsQ0FBQSxDQUFXLENBQVgsSUFBQTs7Q0FBQSxFQUVDLEdBREQ7Q0FDQyxDQUFZLEVBQVosTUFBQTtDQUFBLENBQ1MsRUFBVCxHQUFBO0NBSEQsR0FBQTs7Q0FNYSxDQUFBLENBQUEsaUJBQUE7Q0FFWixHQUFBLElBQUEsRUFBYTtDQUNaLElBQUEsQ0FBQSxDQUFPLHNDQUFQO0NBQ0EsV0FBQTtNQUZEO0NBQUEsRUFJc0IsQ0FBdEIsSUFBQSxFQUFVO0NBWlgsRUFNYTs7Q0FOYixFQWNZLENBQUEsS0FBRSxDQUFkO0NBRUMsR0FBQSxDQUEyQixDQUFqQixDQUFvQyxHQUEzQztDQUVGLEVBQVUsQ0FBVCxFQUFEO0NBR0MsS0FBRCxJQUFZLEdBQVo7Q0FDQyxDQUFZLEVBQUMsRUFBTSxFQUFuQixFQUFBO0NBQUEsQ0FDWSxFQUFDLEVBQU0sQ0FBbkIsQ0FBQTtDQVBGLE9BS0M7TUFQVTtDQWRaLEVBY1k7O0NBZFosQ0EwQnlCLENBQVIsQ0FBQSxJQUFBLENBQUUsTUFBbkI7Q0FDQyxDQUNDLEVBREQsRUFBQSxJQUF5QixDQUFaLFFBQUE7Q0FDWixDQUFZLEVBQUMsRUFBYixJQUFBO0NBREQsS0FBYTtDQUlQLENBQUssQ0FBWCxFQUFBLElBQVcsRUFBWDtDQUF1QixHQUFULElBQUEsS0FBQTtDQUFkLElBQVc7Q0EvQlosRUEwQmlCOztDQTFCakI7O0NBSEQ7O0FBdUNBLENBdkNBLEVBdUNpQixHQUFYLENBQU4sR0F2Q0EifX0seyJvZmZzZXQiOnsibGluZSI6NTM0NywiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL2NvbnRyb2xsZXJzL2xvY2FsX2Nvbm5lY3Rpb24uY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIiMjI1xuI1xuIyBDb250cm9sbGVyIHJlc3BvbnNpYmxlIGZvciBjb21tdW5pY2F0aW9uIHdpdGggb3RoZXIgaW5zdGFuY2VzIG9mIHRoZSBhcHBcbiMgZm9yIGluc3RhbmNlIGFub3RoZXIgdGFiIG9yIHBvcCB1cCBvcGVuXG4jXG4jIHNlZSBodHRwczovL2dpdGh1Yi5jb20vamVyZW15aGFycmlzL0xvY2FsQ29ubmVjdGlvbi5qcy90cmVlL21hc3RlclxuIyBmb3JlIG1vcmUgaW5mb3JtYXRpb24sIGZvciBpbnN0YW5jZSBpbnRlZ3JhdGlvbiB3aXRoIElFOVxuI1xuIyMjXG5cbmFwcCA9IHJlcXVpcmUgJ2FwcC9hcHAnXG5cbmNvbm5lY3Rpb24gPSBuZXcgTG9jYWxDb25uZWN0aW9uICdiZXRhLmxvb3BjYXN0LmZtJ1xuY29ubmVjdGlvbi5saXN0ZW4oKVxuXG5jb25uZWN0aW9uLmFkZENhbGxiYWNrICdsb2dpbicsICggdXNlciApIC0+XG5cbiAgY29uc29sZS5pbmZvICcgKyBsb2NhdGlvbiBjb25uZWN0aW9uLCB1c2VyIGxvZ2dlZCBpbjonLCB1c2VyXG5cbiAgYXBwLmxvZ2luIHVzZXJcblxuY29ubmVjdGlvbi5hZGRDYWxsYmFjayAnbG9nb3V0JywgLT5cblxuICBjb25zb2xlLmluZm8gJyArIGxvY2F0aW9uIGNvbm5lY3Rpb24sIHVzZXIgbG9nZ2VkIG91dCdcblxuICBhcHAubG9nb3V0KClcblxubW9kdWxlLmV4cG9ydHMgPSBjb25uZWN0aW9uIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Q0FBQTtDQUFBLEdBQUEsV0FBQTs7QUFVQSxDQVZBLEVBVUEsSUFBTSxFQUFBOztBQUVOLENBWkEsRUFZaUIsQ0FBQSxNQUFqQixLQUFpQixHQUFBOztBQUNqQixDQWJBLEtBYUEsSUFBVTs7QUFFVixDQWZBLENBZWdDLENBQUEsQ0FBQSxHQUFoQyxFQUFrQyxDQUF4QixDQUFWO0NBRUUsQ0FBQSxFQUFBLEdBQU8sa0NBQVA7Q0FFSSxFQUFELENBQUgsQ0FBQSxJQUFBO0NBSjhCOztBQU1oQyxDQXJCQSxDQXFCaUMsQ0FBQSxLQUFqQyxDQUFpQyxDQUF2QixDQUFWO0NBRUUsQ0FBQSxFQUFBLEdBQU8sa0NBQVA7Q0FFSSxFQUFELEdBQUgsR0FBQTtDQUorQjs7QUFNakMsQ0EzQkEsRUEyQmlCLEdBQVgsQ0FBTixHQTNCQSJ9fSx7Im9mZnNldCI6eyJsaW5lIjo1Mzc5LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvY29udHJvbGxlcnMvbmF2aWdhdGlvbi5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsic2V0dGluZ3MgIFx0PSByZXF1aXJlICdhcHAvdXRpbHMvc2V0dGluZ3MnXG5oYXBwZW5zICBcdD0gcmVxdWlyZSAnaGFwcGVucydcbndheXMgICAgXHQ9IHJlcXVpcmUgJ3dheXMnXG53YXlzLnVzZSByZXF1aXJlICd3YXlzLWJyb3dzZXInXG5cbmNsYXNzIE5hdmlnYXRpb25cblxuXHRpbnN0YW5jZSA9IG51bGxcblx0Zmlyc3RfbG9hZGluZzogb25cblxuXHRjb25zdHJ1Y3RvcjogLT5cblxuXHRcdGlmIE5hdmlnYXRpb24uaW5zdGFuY2Vcblx0XHRcdGNvbnNvbGUuZXJyb3IgXCJZb3UgY2FuJ3QgaW5zdGFudGlhdGUgdGhpcyBOYXZpZ2F0aW9uIHR3aWNlXCJcdFxuXG5cdFx0XHRyZXR1cm5cblxuXHRcdE5hdmlnYXRpb24uaW5zdGFuY2UgPSBAXG5cdFx0QGNvbnRlbnRfc2VsZWN0b3IgPSAnI2NvbnRlbnQgLmlubmVyX2NvbnRlbnQnXG5cdFx0QGNvbnRlbnRfZGl2ID0gJCBAY29udGVudF9zZWxlY3RvclxuXG5cdFx0aGFwcGVucyBAXG5cdFxuXHRcdCMgZXhwb3J0IHRvIHdpbmRvd1xuXHRcdHdpbmRvdy53YXlzID0gd2F5cztcblx0XHRcblx0XHQjIHJvdXRpbmdcblx0XHR3YXlzICcqJywgQHVybF9jaGFuZ2VkXG5cblxuXHRcdCMgRm9yIHRoZSBmaXJzdCBzY3JlZW4sIGVtaXQgdGhlIGV2ZW50IGFmdGVyX3JlbmRlci5cblx0XHQjIGlmLCBpbiB0aGUgbWVhbnRpbWUsIHRoZSBuYXZpZ2F0aW9uIGdvZXMgdG8gYW5vdGhlciB1cmxcblx0XHQjIHdlIHdvbid0IGVtaXQgdGhpcyBmaXJzdCBldmVudC5cblx0XHRkZWxheSAyMDAsID0+XG5cdFx0XHRpZiBAZmlyc3RfbG9hZGluZyB0aGVuIEBlbWl0ICdhZnRlcl9yZW5kZXInXG5cblxuXHR1cmxfY2hhbmdlZDogKCByZXEgKSA9PlxuXG5cblx0XHRsb2cgXCJ1cmxfY2hhbmdlZFwiLCByZXEudXJsXG5cblx0XHQjIGllIGhhY2sgZm9yIGhhc2ggdXJsc1xuXHRcdHJlcS51cmwgPSByZXEudXJsLnJlcGxhY2UoIFwiLyNcIiwgJycgKVxuXG5cdFx0IyBsb2cgXCIgY29udHJvbGxlcnMvbmF2aWdhdGlvbi91cmxfY2hhbmdlZDo6ICN7cmVxLnVybH1cIlxuXHRcdCMgVE9ETzogXG5cdFx0IyAgLSBkb24ndCByZWxvYWQgaWYgdGhlIGNvbnRlbnQgaXMgYWxyZWFkeSBsb2FkZWRcblx0XHQjICAtIGltcGxlbWVudCB0cmFuc2l0aW9ucyBvdXRcblx0XHQjICAtIGltcGxlbWVudCB0cmFuc2l0aW9uICBpbiBcblxuXHRcdGRpdiA9ICQoICc8ZGl2PicgKVxuXG5cdFx0QGVtaXQgJ2JlZm9yZV9sb2FkJ1xuXG5cdFx0ZGl2LmxvYWQgcmVxLnVybCwgPT5cblxuXHRcdFx0QGVtaXQgJ29uX2xvYWQnXG5cblx0XHRcdGlmIGFwcC5ib2R5LnNjcm9sbFRvcCgpID4gMFxuXHRcdFx0XHRhcHAuYm9keS5hbmltYXRlIHNjcm9sbFRvcDogMFxuXG5cblx0XHRcdEBlbWl0ICdiZWZvcmVfZGVzdHJveSdcdFx0XG5cblx0XHRcdGRlbGF5IDQwMCwgPT5cdFx0XHRcblxuXHRcdFx0XHRuZXdfY29udGVudCA9IGRpdi5maW5kKCBAY29udGVudF9zZWxlY3RvciApLmNoaWxkcmVuKClcblx0XHRcdFx0XG5cdFx0XHRcdEBjb250ZW50X2RpdiA9ICQgQGNvbnRlbnRfc2VsZWN0b3JcblxuXHRcdFx0XHQjIFJlbW92ZSBvbGQgY29udGVudFxuXHRcdFx0XHRAY29udGVudF9kaXYuY2hpbGRyZW4oKS5yZW1vdmUoKVxuXG5cdFx0XHRcdCMgcG9wdWxhdGUgd2l0aCB0aGUgbG9hZGVkIGNvbnRlbnRcblx0XHRcdFx0QGNvbnRlbnRfZGl2LmFwcGVuZCBuZXdfY29udGVudFxuXHRcdFx0XHRkZWxheSAxMCwgPT5cblx0XHRcdFx0XHRsb2cgXCJbTmF2aWdhdGlvbl0gYWZ0ZXJfcmVuZGVyXCIsIHJlcS51cmxcblx0XHRcdFx0XHRAZW1pdCAnYWZ0ZXJfcmVuZGVyJ1xuXG5cdCMjXG5cdCMgTmF2aWdhdGVzIHRvIGEgZ2l2ZW4gVVJMIHVzaW5nIEh0bWwgNSBoaXN0b3J5IEFQSVxuXHQjI1xuXHRnbzogKCB1cmwgKSAtPlxuXG5cdFx0IyBJZiBpdCdzIGEgcG9wdXAsIGJ5cGFzcyB3YXlzIGFuZCBzZWFtbGVzcyBuYXZpZ2F0aW9uXG5cdFx0aWYgd2luZG93Lm9wZW5lcj9cblx0XHRcdHJldHVybiB0cnVlXG5cblx0XHRAZmlyc3RfbG9hZGluZyA9IG9mZlxuXG5cdFx0d2F5cy5nbyB1cmxcblxuXHRcdHJldHVybiBmYWxzZVxuXG5cdCMjXG5cdCMgTG9va3MgZm9yIGludGVybmFsIGxpbmtzIGFuZCBiaW5kIHRoZW4gdG8gY2xpZW50IHNpZGUgbmF2aWdhdGlvblxuXHQjIGFzIGluOiBodG1sIEhpc3RvcnkgYXBpXG5cdCMjXG5cdGJpbmQ6ICggc2NvcGUgPSAnYm9keScgKSAtPlxuXG5cdFx0JCggc2NvcGUgKS5maW5kKCAnYScgKS5lYWNoICggaW5kZXgsIGl0ZW0gKSAtPlxuXG5cdFx0XHQkaXRlbSA9ICQgaXRlbVxuXHRcdFx0aHJlZiA9ICRpdGVtLmF0dHIoICdocmVmJyApXG5cblx0XHRcdGlmICFocmVmPyB0aGVuIHJldHVybiBcblxuXHRcdFx0IyBpZiB0aGUgbGluayBoYXMgaHR0cCBhbmQgdGhlIGRvbWFpbiBpcyBkaWZmZXJlbnRcblx0XHRcdGlmIGhyZWYuaW5kZXhPZiggJ2h0dHAnICkgPj0gMCBhbmQgaHJlZi5pbmRleE9mKCBkb2N1bWVudC5kb21haW4gKSA8IDAgXG5cdFx0XHRcdHJldHVybiBcblxuXHRcdFx0aWYgaHJlZi5pbmRleE9mKCBcIiNcIiApIGlzIDBcblx0XHRcdFx0JGl0ZW0uY2xpY2sgLT4gcmV0dXJuIGZhbHNlXG5cblx0XHRcdGVsc2UgaWYgaHJlZi5pbmRleE9mKCBcImphdmFzY3JpcHRcIiApIGlzIDAgb3IgaHJlZi5pbmRleE9mKCBcInRlbDpcIiApIGlzIDBcblx0XHRcdFx0cmV0dXJuIHRydWVcblx0XHRcdGVsc2Vcblx0XHRcdFx0JGl0ZW0uY2xpY2sgLT4gXG5cdFx0XHRcdFx0cmV0dXJuIE5hdmlnYXRpb24uaW5zdGFuY2UuZ28gJCggQCApLmF0dHIgJ2hyZWYnXG5cblxuIyB3aWxsIGFsd2F5cyBleHBvcnQgdGhlIHNhbWUgaW5zdGFuY2Vcbm1vZHVsZS5leHBvcnRzID0gbmV3IE5hdmlnYXRpb24iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSwrQkFBQTtHQUFBLCtFQUFBOztBQUFBLENBQUEsRUFBYSxJQUFBLENBQWIsWUFBYTs7QUFDYixDQURBLEVBQ1ksSUFBWixFQUFZOztBQUNaLENBRkEsRUFFVyxDQUFYLEVBQVcsQ0FBQTs7QUFDWCxDQUhBLEVBR0EsQ0FBSSxHQUFLLE9BQUE7O0FBRUgsQ0FMTjtDQU9DLEtBQUEsRUFBQTs7Q0FBQSxDQUFBLENBQVcsQ0FBWCxJQUFBOztDQUFBLEVBQ2UsQ0FEZixTQUNBOztDQUVhLENBQUEsQ0FBQSxpQkFBQTtDQUVaLGdEQUFBO0NBQUEsT0FBQSxJQUFBO0NBQUEsR0FBQSxJQUFBLEVBQWE7Q0FDWixJQUFBLENBQUEsQ0FBTyxzQ0FBUDtDQUVBLFdBQUE7TUFIRDtDQUFBLEVBS3NCLENBQXRCLElBQUEsRUFBVTtDQUxWLEVBTW9CLENBQXBCLFlBQUEsU0FOQTtDQUFBLEVBT2UsQ0FBZixPQUFBLEtBQWU7Q0FQZixHQVNBLEdBQUE7Q0FUQSxFQVljLENBQWQsRUFBTTtDQVpOLENBZVUsQ0FBVixDQUFBLE9BQUE7Q0FmQSxDQXFCVyxDQUFYLENBQUEsQ0FBQSxJQUFXO0NBQ1YsR0FBRyxDQUFDLENBQUosT0FBQTtDQUF3QixHQUFELENBQUMsU0FBRCxDQUFBO1FBRGI7Q0FBWCxJQUFXO0NBMUJaLEVBR2E7O0NBSGIsRUE4QmEsTUFBRSxFQUFmO0NBR0MsRUFBQSxLQUFBO09BQUEsS0FBQTtDQUFBLENBQW1CLENBQW5CLENBQUEsU0FBQTtDQUFBLENBR2lDLENBQTlCLENBQUgsR0FBVTtDQUhWLEVBV0EsQ0FBQSxHQUFNO0NBWE4sR0FhQSxTQUFBO0NBRUksQ0FBYyxDQUFmLENBQUgsS0FBa0IsRUFBbEI7Q0FFQyxHQUFBLENBQUMsQ0FBRCxHQUFBO0NBRUEsRUFBTSxDQUFILEVBQUgsR0FBRztDQUNGLEVBQUcsQ0FBSyxHQUFSLENBQUE7Q0FBaUIsQ0FBVyxPQUFYLENBQUE7Q0FBakIsU0FBQTtRQUhEO0NBQUEsR0FNQSxDQUFDLENBQUQsVUFBQTtDQUVNLENBQUssQ0FBWCxFQUFBLElBQVcsSUFBWDtDQUVDLFVBQUEsQ0FBQTtDQUFBLEVBQWMsQ0FBQSxDQUFXLEdBQXpCLEdBQUEsS0FBYztDQUFkLEVBRWUsRUFBZCxHQUFELEdBQUEsS0FBZTtDQUZmLElBS0MsQ0FBRCxFQUFBLEdBQVk7Q0FMWixJQVFDLENBQUQsRUFBQSxHQUFZO0NBQ04sQ0FBTixDQUFVLEVBQVYsSUFBVSxNQUFWO0NBQ0MsQ0FBaUMsQ0FBakMsT0FBQSxpQkFBQTtDQUNDLEdBQUQsQ0FBQyxTQUFELEdBQUE7Q0FGRCxRQUFVO0NBWFgsTUFBVztDQVZaLElBQWtCO0NBaERuQixFQThCYTs7Q0E5QmIsQ0E0RUEsQ0FBSSxNQUFFO0NBR0wsR0FBQSxpQkFBQTtDQUNDLEdBQUEsU0FBTztNQURSO0NBQUEsRUFHaUIsQ0FBakIsQ0FIQSxRQUdBO0NBSEEsQ0FLQSxDQUFBLENBQUE7Q0FFQSxJQUFBLE1BQU87Q0F0RlIsRUE0RUk7O0NBNUVKLEVBNEZNLENBQU4sQ0FBTSxJQUFFOztHQUFRLEdBQVI7TUFFUDtDQUFBLENBQXFDLENBQXJDLENBQUEsQ0FBQSxJQUE4QixFQUE5QjtDQUVDLFNBQUEsQ0FBQTtDQUFBLEVBQVEsQ0FBQSxDQUFSLENBQUE7Q0FBQSxFQUNPLENBQVAsQ0FBWSxDQUFaO0NBRUEsR0FBSSxFQUFKLE1BQUE7Q0FBZSxhQUFBO1FBSGY7Q0FNQSxFQUFxRSxDQUFsRSxFQUFILENBQUcsQ0FBc0Q7Q0FDeEQsYUFBQTtRQVBEO0NBU0EsRUFBRyxDQUFBLENBQXVCLENBQTFCLENBQUc7Q0FDSSxFQUFNLEVBQVAsSUFBTyxNQUFaO0NBQWUsSUFBQSxZQUFPO0NBQXRCLFFBQVk7Q0FFQSxHQUFMLENBQWdDLENBSHhDLENBR1EsQ0FIUixJQUdRO0NBQ1AsR0FBQSxXQUFPO01BSlIsRUFBQTtDQU1PLEVBQU0sRUFBUCxJQUFPLE1BQVo7Q0FDQyxDQUFPLEVBQXVCLEVBQUEsRUFBSixFQUFULE9BQVY7Q0FEUixRQUFZO1FBakJjO0NBQTVCLElBQTRCO0NBOUY3QixFQTRGTTs7Q0E1Rk47O0NBUEQ7O0FBMkhBLENBM0hBLEVBMkhpQixHQUFYLENBQU4sR0EzSEEifX0seyJvZmZzZXQiOnsibGluZSI6NTQ5MSwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL2NvbnRyb2xsZXJzL3VzZXIuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbImhhcHBlbnMgPSByZXF1aXJlICdoYXBwZW5zJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IGhhcHBlbnNcblx0bG9nb3V0OiAoIGNhbGxiYWNrID0gLT4gKSAtPlxuXHRcdFxuXHRcdGlmIG5vdCBAaXNfbG9nZ2VkKCkgdGhlbiByZXR1cm4gY2FsbGJhY2sgZXJyb3I6IGNvZGU6ICdub2RlX2xvZ2dlZCdcblxuXHRcdGxvZyBcIltVc2VyXSB0cnlpbmcgdG8gbG9nb3V0Li4uXCJcblxuXHRcdCQucG9zdCAnL2FwaS92MS9sb2dvdXQnLCB7fSwgKGRhdGEpID0+XG5cdFx0XHRsb2cgXCJbVXNlcl0gbG9nb3V0IH4gc3VjY2Vzc1wiLCBkYXRhXG5cblx0XHRcdEBlbWl0ICd1c2VyOnVubG9nZ2VkJ1xuXG5cdFx0XHRhcHAuYm9keS5yZW1vdmVDbGFzcyBcImxvZ2dlZFwiXG5cblx0XHRcdGxvZyBcIltVc2VyIENvbnRyb2xsZXJdIGRlbGV0aW5nIHVzZXIgdmFyaWFibGVcIlxuXHRcdFx0ZGVsZXRlIGxvb3BjYXN0LnVzZXJcblxuXHRcdFx0Y2FsbGJhY2s/KClcblx0XG5cdGxvZ2luOiAoIHVzZXIgKSAtPlxuXG5cdFx0bG9vcGNhc3QudXNlciA9IHVzZXJcblxuXHRcdGFwcC5ib2R5LmFkZENsYXNzIFwibG9nZ2VkXCJcblxuXHRcdEBlbWl0ICd1c2VyOmxvZ2dlZCcsIGxvb3BjYXN0LnVzZXJcblxuXHRcdGxvZyBcIltVc2VyIENvbnRyb2xsZXJdIGxvZ2luXCIsIGxvb3BjYXN0LnVzZXJcblxuXHRjaGVja191c2VyOiAtPiBcblx0XHRpZiBAaXNfbG9nZ2VkKClcblx0XHRcdEBsb2dpbiBsb29wY2FzdC51c2VyXG5cdFx0ZWxzZVxuXHRcdFx0QGxvZ291dCgpXG5cblx0aXNfbG9nZ2VkOiAtPiBsb29wY2FzdC51c2VyPyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLEdBQUE7O0FBQUEsQ0FBQSxFQUFVLElBQVYsRUFBVTs7QUFFVixDQUZBLEVBRWlCLEdBQVgsQ0FBTjtDQUNDLENBQUEsQ0FBUSxHQUFSLEVBQVEsQ0FBRTtDQUVULE9BQUEsSUFBQTs7R0FGb0IsR0FBWCxHQUFXO01BRXBCO0FBQU8sQ0FBUCxHQUFBLEtBQU87Q0FBa0IsT0FBTyxLQUFBO0NBQVMsQ0FBTyxHQUFQLEdBQUE7Q0FBTyxDQUFNLEVBQU4sTUFBQSxHQUFBO1VBQVA7Q0FBaEIsT0FBTztNQUFoQztDQUFBLEVBRUEsQ0FBQSx3QkFBQTtDQUVDLENBQXdCLENBQUksQ0FBN0IsS0FBOEIsRUFBOUIsS0FBQTtDQUNDLENBQStCLENBQS9CLENBQUEsRUFBQSxtQkFBQTtDQUFBLEdBRUEsQ0FBQyxDQUFELFNBQUE7Q0FGQSxFQUlHLENBQUssRUFBUixFQUFBLEdBQUE7Q0FKQSxFQU1BLEdBQUEsb0NBQUE7QUFDQSxDQVBBLEdBQUEsRUFPQSxFQUFlO0NBUmEsRUFVNUI7Q0FWRCxJQUE2QjtDQU45QixFQUFRO0NBQVIsQ0FrQkEsQ0FBTyxDQUFBLENBQVAsSUFBUztDQUVSLEVBQWdCLENBQWhCLElBQVE7Q0FBUixFQUVHLENBQUgsSUFBQTtDQUZBLENBSXFCLEVBQXJCLElBQTZCLEtBQTdCO0NBRUksQ0FBMkIsQ0FBL0IsQ0FBQSxJQUF1QyxHQUF2QyxjQUFBO0NBMUJELEVBa0JPO0NBbEJQLENBNEJBLENBQVksTUFBQSxDQUFaO0NBQ0MsR0FBQSxLQUFHO0NBQ0QsR0FBQSxDQUFELEdBQWUsS0FBZjtNQUREO0NBR0UsR0FBQSxFQUFELE9BQUE7TUFKVTtDQTVCWixFQTRCWTtDQTVCWixDQWtDQSxDQUFXLE1BQVg7Q0FBVyxVQUFHO0NBbENkLEVBa0NXO0NBckNaLENBRWlCIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjU1MzgsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy9jb250cm9sbGVycy92aWV3cy5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiaGFwcGVucyA9IHJlcXVpcmUgJ2hhcHBlbnMnXG5cbmNsYXNzIFZpZXdcblxuXHRVTklRVUVfSUQgIFx0PSAwXG5cblxuXHQjIyNcblx0SGFzaCBNYXAgdG8gc3RvcmUgdGhlIHZpZXdzOlxuXG5cdGhhc2hfbW9kZWwgPSB7XG5cdFx0XCI8dmlld19uYW1lPlwiIDogWyA8dmlld19pbnN0YW5jZT4sIDx2aWV3X2luc3RhbmNlPiwgLi4gXSxcblx0XHRcIjx2aWV3X25hbWU+XCIgOiBbIDx2aWV3X2luc3RhbmNlPiwgPHZpZXdfaW5zdGFuY2U+LCAuLiBdXG5cdH1cblx0IyMjXG5cdGhhc2hfbW9kZWwgIDoge31cblxuXG5cdCMjI1xuXHRVaWQgTWFwLiBJbnRlcm5hbCBtYXAgdXNlZCBmb3IgZWFzaWx5IGdldCBhIHZpZXcgYnkgdWlkXG5cblx0dWlkX21hcCA9IHtcblx0XHRcIjxVTklRVUVfSUQ+XCIgOiB7IG5hbWUgOiA8dmlld19uYW1lPiwgaW5kZXg6IDx2aWV3X2luZGV4PiB9LFxuXHRcdFwiPFVOSVFVRV9JRD5cIiA6IHsgbmFtZSA6IDx2aWV3X25hbWU+LCBpbmRleDogPHZpZXdfaW5kZXg+IH0sXG5cdFx0ICAuLi5cblx0fVxuXHQjIyNcblx0dWlkX21hcDoge31cblxuXG5cblxuXG5cdCMgR2V0IHRoZSB2aWV3IGZyb20gdGhlIGhhc2ggbW9kZWxcblx0Z2V0OiAoIGlkLCBpbmRleCA9IDAgKSA9PlxuXHRcdHVubGVzcyBAaGFzaF9tb2RlbFsgaWQgXT9cblx0XHRcdCMgY29uc29sZS5lcnJvciBcIlZpZXcgI3tpZH0gI3tpbmRleH0gZG9lc24ndCBleGlzdHNcIlxuXHRcdFx0cmV0dXJuIGZhbHNlXG5cblx0XHRAaGFzaF9tb2RlbFsgaWQgXVsgaW5kZXggXVxuXG5cblxuXHRnZXRfYnlfdWlkOiAoIHVpZCApID0+XG5cdFx0aWYgQHVpZF9tYXBbIHVpZCBdP1xuXHRcdFx0bmFtZSA9IEB1aWRfbWFwWyB1aWQgXS5uYW1lXG5cdFx0XHRpbmRleCA9IEB1aWRfbWFwWyB1aWQgXS5pbmRleFxuXG5cdFx0XHRyZXR1cm4gQGdldCBuYW1lLCBpbmRleFxuXG5cdFx0cmV0dXJuIGZhbHNlXG5cblx0Z2V0X2J5X2RvbTogKCBzZWxlY3RvciApID0+IEBnZXRfYnlfdWlkICQoIHNlbGVjdG9yICkuZGF0YSAndWlkJ1xuXG5cblxuXHRiaW5kOiAoIHNjb3BlID0gJ2JvZHknLCB0b2xvZyA9IGZhbHNlICkgLT5cblxuXHRcdCMgY29uc29sZS5lcnJvciBcIkJpbmRpbmdzIHZpZXdzOiAje3Njb3BlfVwiXG5cdFx0JCggc2NvcGUgKS5maW5kKCAnW2RhdGEtdmlld10nICkuZWFjaCggKCBpbmRleCwgaXRlbSApID0+XG5cblx0XHRcdCRpdGVtID0gJCBpdGVtXG5cblx0XHRcdHZpZXdfbmFtZSA9ICRpdGVtLmRhdGEoICd2aWV3JyApXG5cblx0XHRcdCRpdGVtLnJlbW92ZUF0dHIgJ2RhdGEtdmlldydcblxuXHRcdFx0aWYgdmlld19uYW1lLnN1YnN0cmluZygwLCAxKSBpcyBcIltcIlxuXHRcdFx0XHRuYW1lcyA9IHZpZXdfbmFtZS5zdWJzdHJpbmcoMSwgdmlld19uYW1lLmxlbmd0aCAtIDEpLnNwbGl0KFwiLFwiKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRuYW1lcyA9IFt2aWV3X25hbWVdXG5cblx0XHRcdGZvciBuYW1lIGluIG5hbWVzXG5cdFx0XHRcdEBfYWRkX3ZpZXcgJGl0ZW0sIG5hbWVcblxuXHRcdFx0IyByZW1vdmUgdGhlIGRhdGEtdmlldyBhdHRyaWJ1dGUsIHNvIGl0IHdvbid0IGJlIGluc3RhbnRpYXRlZCB0d2ljZSFcblx0XHRcdCRpdGVtLnJlbW92ZUF0dHIgJ2RhdGEtdmlldydcblxuXHRcdCkucHJvbWlzZSgpLmRvbmUgPT4gQGVtaXQgXCJiaW5kZWRcIlxuXG5cdHVuYmluZDogKCBzY29wZSA9ICdib2R5JyApIC0+XG5cdFx0JCggc2NvcGUgKS5maW5kKCAnW2RhdGEtdWlkXScgKS5lYWNoKCAoIGluZGV4LCBpdGVtICkgPT5cblxuXHRcdFx0JGl0ZW0gPSAkIGl0ZW1cblxuXHRcdFx0aWQgPSAkaXRlbS5kYXRhICd1aWQnXG5cblx0XHRcdHYgPSB2aWV3LmdldF9ieV91aWQgaWRcblxuXHRcdFx0aWYgdlxuXHRcdFx0XHR2LmRlc3Ryb3k/KClcblx0XHRcdFx0dmlldy5vbl92aWV3X2Rlc3Ryb3llZCBpZFxuXG5cdFx0KS5wcm9taXNlKCkuZG9uZSA9PiBAZW1pdCBcInVuYmluZGVkXCJcblxuXG5cblx0X2FkZF92aWV3OiAoICRpdGVtLCB2aWV3X25hbWUgKSAtPlxuXG5cdFx0dHJ5XG5cdFx0XHR2aWV3ID0gcmVxdWlyZSBcImFwcC92aWV3cy8je3ZpZXdfbmFtZX1cIlxuXHRcdGNhdGNoIGVcblx0XHRcdGNvbnNvbGUud2FybiAnZSAtPicsIGUubWVzc2FnZVxuXHRcdFx0Y29uc29sZS5lcnJvciBcImFwcC92aWV3cy8je3ZpZXd9IG5vdCBmb3VuZCBmb3IgXCIsICRpdGVtXG5cblx0XHR2aWV3ID0gbmV3IHZpZXcgJGl0ZW1cblxuXHRcdCMgU2F2ZSB0aGUgdmlldyBpbiBhIGhhc2ggbW9kZWxcblx0XHRAaGFzaF9tb2RlbFsgdmlld19uYW1lIF0gPz0gW11cblxuXHRcdGwgPSBAaGFzaF9tb2RlbFsgdmlld19uYW1lIF0ubGVuZ3RoXG5cblx0XHRAaGFzaF9tb2RlbFsgdmlld19uYW1lIF1bIGwgXSA9IHZpZXdcblxuXG5cdFx0IyBTYXZlIHRoZSBpbmNyZW1lbnRhbCB1aWQgdG8gdGhlIGRvbSBhbmQgdG8gdGhlIGluc3RhbmNlXG5cdFx0dmlldy51aWQgPSBVTklRVUVfSURcblx0XHR2aWV3LnZpZXdfbmFtZSA9IHZpZXdfbmFtZVxuXG5cdFx0IyBsb2cgXCJbdmlld10gYWRkXCIsIHZpZXcudWlkLCB2aWV3LnZpZXdfbmFtZVxuXG5cdFx0JGl0ZW0uYXR0ciAnZGF0YS11aWQnLCBVTklRVUVfSURcblxuXHRcdCMgU2F2ZSB0aGUgdmlldyBpbiBhIGxpbmVhciBhcnJheSBtb2RlbFxuXHRcdEB1aWRfbWFwWyBVTklRVUVfSUQgXSA9XG5cdFx0XHRuYW1lICA6IHZpZXdfbmFtZVxuXHRcdFx0aW5kZXggOiBAaGFzaF9tb2RlbFsgdmlld19uYW1lIF0ubGVuZ3RoIC0gMVxuXG5cblx0XHRVTklRVUVfSUQrK1xuXG5cblxuXG5cdG9uX3ZpZXdfZGVzdHJveWVkOiAoIHVpZCApIC0+XG5cdFx0XG5cdFx0IyBsb2cgXCJbVmlld10gb25fdmlld19kZXN0cm95ZWRcIiwgdWlkXG5cdFx0aWYgQHVpZF9tYXBbIHVpZCBdP1xuXG5cdFx0XHQjIEdldCB0aGUgZGF0YSBmcm9tIHRoZSB1aWQgbWFwXG5cdFx0XHRuYW1lICA9IEB1aWRfbWFwWyB1aWQgXS5uYW1lXG5cdFx0XHRpbmRleCA9IEB1aWRfbWFwWyB1aWQgXS5pbmRleFxuXG5cdFx0XHQjIGRlbGV0ZSB0aGUgcmVmZXJlbmNlIGluIHRoZSBtb2RlbFxuXHRcdFx0aWYgQGhhc2hfbW9kZWxbIG5hbWUgXVsgaW5kZXggXT9cblxuXHRcdFx0XHQjIGRlbGV0ZSB0aGUgaXRlbSBmcm9tIHRoZSB1aWRfbWFwXG5cdFx0XHRcdGRlbGV0ZSBAdWlkX21hcFsgdWlkIF1cblxuXHRcdFx0XHQjIERlbGV0ZSB0aGUgaXRlbSBmcm9tIHRoZSBoYXNoX21vZGVsXG5cdFx0XHRcdEBoYXNoX21vZGVsWyBuYW1lIF0uc3BsaWNlIGluZGV4LCAxXG5cblx0XHRcdFx0IyBVcGRhdGUgdGhlIGluZGV4IG9uIHRoZSB1aWRfbWFwIGZvciB0aGUgdmlld3MgbGVmdCBvZiB0aGUgc2FtZSB0eXBlXG5cdFx0XHRcdGZvciBpdGVtLCBpIGluIEBoYXNoX21vZGVsWyBuYW1lIF1cblx0XHRcdFx0XHRAdWlkX21hcFsgaXRlbS51aWQgXS5pbmRleCA9IGlcblxuXG5cdFx0XHRcdFxuXG5cblxudmlldyA9IG5ldyBWaWV3XG5oYXBwZW5zIHZpZXdcblxubW9kdWxlLmV4cG9ydHMgPSB3aW5kb3cudmlldyA9IHZpZXdcblxuXG4jIGV4cG9ydGluZyBnZXQgbWV0aG9kIGZvciB3aW5kb3csIHNvIHlvdSBjYW4gcmV0cmlldmUgdmlld3MganVzdCB3aXRoIFZpZXcoIGlkIClcbndpbmRvdy5WaWV3ID0gdmlldyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGVBQUE7R0FBQSwrRUFBQTs7QUFBQSxDQUFBLEVBQVUsSUFBVixFQUFVOztBQUVKLENBRk47Q0FJQyxLQUFBLEdBQUE7Ozs7OztDQUFBOztDQUFBLENBQUEsQ0FBYyxNQUFkOztDQUdBOzs7Ozs7OztDQUhBOztDQUFBLENBQUEsQ0FXYyxPQUFkOztDQUdBOzs7Ozs7Ozs7Q0FkQTs7Q0FBQSxDQUFBLENBdUJTLElBQVQ7O0NBdkJBLENBOEJLLENBQUwsRUFBSyxJQUFFOztHQUFZLEdBQVI7TUFDVjtDQUFBLEdBQUEsdUJBQUE7Q0FFQyxJQUFBLFFBQU87TUFGUjtDQUlDLENBQVksRUFBWixDQUFrQixLQUFOLENBQWI7Q0FuQ0QsRUE4Qks7O0NBOUJMLEVBdUNZLE1BQUUsQ0FBZDtDQUNDLE9BQUEsR0FBQTtDQUFBLEdBQUEscUJBQUE7Q0FDQyxFQUFPLENBQVAsRUFBQSxDQUFpQjtDQUFqQixFQUNRLENBQUMsQ0FBVCxDQUFBLENBQWtCO0NBRWxCLENBQWtCLENBQVgsQ0FBQyxDQUFELFFBQUE7TUFKUjtDQU1BLElBQUEsTUFBTztDQTlDUixFQXVDWTs7Q0F2Q1osRUFnRFksS0FBQSxDQUFFLENBQWQ7Q0FBNkIsR0FBQSxDQUFXLEdBQUEsRUFBWixDQUFBO0NBaEQ1QixFQWdEWTs7Q0FoRFosQ0FvRHdCLENBQWxCLENBQU4sQ0FBTSxJQUFFO0NBR1AsT0FBQSxJQUFBOztHQUhlLEdBQVI7TUFHUDs7R0FIK0IsR0FBUjtNQUd2QjtDQUFBLENBQWdELENBQVQsQ0FBdkMsQ0FBQSxJQUF5QyxFQUF6QyxFQUFBO0NBRUMsU0FBQSw2QkFBQTtDQUFBLEVBQVEsQ0FBQSxDQUFSLENBQUE7Q0FBQSxFQUVZLENBQUEsQ0FBSyxDQUFqQixHQUFBO0NBRkEsSUFJSyxDQUFMLElBQUEsQ0FBQTtDQUVBLENBQTBCLENBQTFCLENBQUcsQ0FBNkIsQ0FBaEMsR0FBWTtDQUNYLENBQStCLENBQXZCLEVBQVIsQ0FBK0IsRUFBL0IsQ0FBaUI7TUFEbEIsRUFBQTtDQUdDLEVBQVEsRUFBUixHQUFBLENBQVE7UUFUVDtBQVdBLENBQUEsVUFBQSxpQ0FBQTswQkFBQTtDQUNDLENBQWtCLEVBQWxCLENBQUMsR0FBRCxDQUFBO0NBREQsTUFYQTtDQWVNLElBQUQsS0FBTCxDQUFBLEVBQUE7Q0FqQkQsRUFtQmlCLENBbkJqQixDQUF1QyxFQUF2QyxFQW1CaUI7Q0FBSSxHQUFELENBQUMsR0FBRCxLQUFBO0NBbkJwQixJQW1CaUI7Q0ExRWxCLEVBb0RNOztDQXBETixFQTRFUSxFQUFBLENBQVIsR0FBVTtDQUNULE9BQUEsSUFBQTs7R0FEaUIsR0FBUjtNQUNUO0NBQUEsQ0FBK0MsQ0FBVCxDQUF0QyxDQUFBLElBQXdDLEVBQXhDLENBQUE7Q0FFQyxTQUFBLEVBQUE7Q0FBQSxFQUFRLENBQUEsQ0FBUixDQUFBO0NBQUEsQ0FFQSxDQUFLLENBQUEsQ0FBSyxDQUFWO0NBRkEsQ0FJSSxDQUFBLENBQUksRUFBUixJQUFJO0NBRUosR0FBRyxFQUFIOztDQUNFLFNBQUQ7VUFBQTtDQUNLLENBQUwsRUFBSSxXQUFKLEVBQUE7UUFWb0M7Q0FBdEMsRUFZaUIsQ0FaakIsQ0FBc0MsRUFBdEMsRUFZaUI7Q0FBSSxHQUFELENBQUMsS0FBRCxHQUFBO0NBWnBCLElBWWlCO0NBekZsQixFQTRFUTs7Q0E1RVIsQ0E2Rm9CLENBQVQsRUFBQSxJQUFYO0NBRUMsT0FBQSxTQUFBO0NBQUE7Q0FDQyxFQUFPLENBQVAsRUFBQSxDQUFPLEVBQUEsR0FBUztNQURqQjtDQUdDLEtBREs7Q0FDTCxDQUFxQixFQUFyQixFQUFBLENBQU87Q0FBUCxDQUNrRCxDQUF4QixDQUFYLENBQWYsQ0FBQSxDQUFPLEtBQVEsS0FBZjtNQUpEO0NBQUEsRUFNVyxDQUFYLENBQVc7O0NBR0UsRUFBZSxFQUFmLElBQUE7TUFUYjtDQUFBLEVBV0ksQ0FBSixFQVhBLEdBV2lCLENBQUE7Q0FYakIsRUFhZ0MsQ0FBaEMsS0FBYSxDQUFBO0NBYmIsRUFpQkEsQ0FBQSxLQWpCQTtDQUFBLEVBa0JpQixDQUFqQixLQUFBO0NBbEJBLENBc0J1QixFQUF2QixDQUFLLElBQUwsQ0FBQTtDQXRCQSxFQTBCQyxDQURELEdBQVUsRUFBQTtDQUNULENBQVEsRUFBUixFQUFBLEdBQUE7Q0FBQSxDQUNRLENBQWtDLENBQWpDLENBQVQsQ0FBQSxHQUFxQixDQUFBO0NBM0J0QixLQUFBO0FBOEJBLENBaENVLFFBZ0NWLEVBQUE7Q0E3SEQsRUE2Rlc7O0NBN0ZYLEVBa0ltQixNQUFFLFFBQXJCO0NBR0MsT0FBQSxzQ0FBQTtDQUFBLEdBQUEscUJBQUE7Q0FHQyxFQUFRLENBQVIsRUFBQSxDQUFrQjtDQUFsQixFQUNRLENBQUMsQ0FBVCxDQUFBLENBQWtCO0NBR2xCLEdBQUcsRUFBSCw4QkFBQTtBQUdDLENBQUEsRUFBaUIsQ0FBVCxFQUFSLENBQWlCLENBQWpCO0NBQUEsQ0FHa0MsRUFBakMsQ0FBRCxDQUFBLEVBQUEsRUFBYTtDQUdiO0NBQUE7Y0FBQSxxQ0FBQTswQkFBQTtDQUNDLEVBQVUsQ0FBVCxDQUFELEVBQVU7Q0FEWDt5QkFURDtRQVBEO01BSGtCO0NBbEluQixFQWtJbUI7O0NBbEluQjs7Q0FKRDs7QUFpS0EsQ0FqS0EsRUFpS08sQ0FBUDs7QUFDQSxDQWxLQSxHQWtLQSxHQUFBOztBQUVBLENBcEtBLEVBb0tpQixDQUFBLEVBQVgsQ0FBTjs7QUFJQSxDQXhLQSxFQXdLYyxDQUFkLEVBQU0ifX0seyJvZmZzZXQiOnsibGluZSI6NTcxMCwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL2NvbnRyb2xsZXJzL3dpbmRvdy5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiaGFwcGVucyA9IHJlcXVpcmUgJ2hhcHBlbnMnXG5cbiMgY3JlYXRlIGFuZCBleHBvcnQgYSBuZXcgaGFwcGVucyBvYmplY3Rcbm1vZHVsZS5leHBvcnRzID0gaGFwcGVucyggd2luID0ge30gKVxuXG4jIGV2ZW50IGhhbmRsaW5nIGZvciB3aW5kb3cgcmVzaXplXG53aW4ub2JqID0gJCB3aW5kb3dcbndpbi5vYmoub24gJ3Jlc2l6ZScsIG9uX3Jlc2l6ZSA9IC0+XG5cdHdpbi53ID0gd2luLm9iai53aWR0aCgpXG5cdHdpbi5oID0gd2luLm9iai5oZWlnaHQoKVxuXHR3aW4uZW1pdCAncmVzaXplJ1xuXG4jIHRyaWdnZXIgcmVzaXplIGF1dG9tYXRpY2FsbHkgYWZ0ZXIgMTAwIG1zXG5kZWxheSAxMDAsIG9uX3Jlc2l6ZVxuXG4jIGdsb2JhbCBjbGljayBldmVudFxuJCggJ2h0bWwsYm9keScgKS5vbiAnY2xpY2snLCAtPiB3aW4uZW1pdCBcImJvZHk6Y2xpY2tlZFwiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsbUJBQUE7O0FBQUEsQ0FBQSxFQUFVLElBQVYsRUFBVTs7QUFHVixDQUhBLENBR2lCLENBQUEsR0FBWCxDQUFOOztBQUdBLENBTkEsRUFNRyxHQUFPOztBQUNWLENBUEEsQ0FPQSxDQUFHLEtBQUgsQ0FBcUI7Q0FDcEIsQ0FBQSxDQUFHLEVBQUs7Q0FBUixDQUNBLENBQUcsR0FBSztDQUNKLEVBQUQsQ0FBSCxJQUFBLENBQUE7Q0FIZ0M7O0FBTWpDLENBYkEsQ0FhVyxDQUFYLEVBQUEsSUFBQTs7QUFHQSxDQWhCQSxDQWdCQSxDQUE2QixJQUE3QixFQUE2QixFQUE3QjtDQUFvQyxFQUFELENBQUgsS0FBQSxLQUFBO0NBQUgifX0seyJvZmZzZXQiOnsibGluZSI6NTczMiwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL2dsb2JhbHMuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIyBvbiB0aGUgYnJvd3Nlciwgd2luZG93IGlzIHRoZSBnbG9iYWwgaG9sZGVyXG4jIyNcblxuIyB1dGlsc1xuXG53aW5kb3cuZGVsYXkgPSByZXF1aXJlICcuL2dsb2JhbHMvZGVsYXknXG5cbndpbmRvdy5pbnRlcnZhbCAgPSByZXF1aXJlICcuL2dsb2JhbHMvaW50ZXJ2YWwnXG5cbndpbmRvdy5sb2cgICA9IHJlcXVpcmUgJy4vZ2xvYmFscy9sb2cnXG5cbndpbmRvdy5tb3ZlciA9IHJlcXVpcmUgJy4vZ2xvYmFscy9tb3ZlcidcblxuIyB3aWRlbHkgdXNlZCBtb2R1bGVzXG5cbndpbmRvdy5oYXBwZW5zID0gcmVxdWlyZSAnaGFwcGVucydcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHdpbmRvdyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0NBQUE7QUFNQSxDQU5BLEVBTWUsRUFBZixDQUFNLENBQVMsVUFBQTs7QUFFZixDQVJBLEVBUW1CLEdBQWIsQ0FBYSxDQUFuQixZQUFtQjs7QUFFbkIsQ0FWQSxFQVVBLEdBQU0sQ0FBUyxRQUFBOztBQUVmLENBWkEsRUFZZSxFQUFmLENBQU0sQ0FBUyxVQUFBOztBQUlmLENBaEJBLEVBZ0JpQixHQUFYLENBQU4sRUFBaUI7O0FBR2pCLENBbkJBLEVBbUJpQixHQUFYLENBQU4ifX0seyJvZmZzZXQiOnsibGluZSI6NTc1MCwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL2dsb2JhbHMvZGVsYXkuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gKCBkZWxheSwgZnVuayApIC0+IHNldFRpbWVvdXQgZnVuaywgZGVsYXkiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsQ0FBTyxDQUFtQixDQUFULENBQUEsQ0FBQSxDQUFYLENBQU4sRUFBbUI7Q0FBNEIsQ0FBTSxFQUFqQixDQUFBLElBQUEsQ0FBQTtDQUFuQiJ9fSx7Im9mZnNldCI6eyJsaW5lIjo1NzU2LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvZ2xvYmFscy9pbnRlcnZhbC5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSAoIGludGVydmFsLCBmdW5rICkgLT4gc2V0SW50ZXJ2YWwgZnVuaywgaW50ZXJ2YWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsQ0FBTyxDQUFzQixDQUFaLENBQUEsRUFBWCxDQUFOLENBQWlCLENBQUU7Q0FBZ0MsQ0FBTSxFQUFsQixJQUFBLENBQUEsRUFBQTtDQUF0QiJ9fSx7Im9mZnNldCI6eyJsaW5lIjo1NzYyLCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvZ2xvYmFscy9sb2cuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gLT5cblx0bG9nLmhpc3RvcnkgPSBsb2cuaGlzdG9yeSBvciBbXSAjIHN0b3JlIGxvZ3MgdG8gYW4gYXJyYXkgZm9yIHJlZmVyZW5jZVxuXHRsb2cuaGlzdG9yeS5wdXNoIGFyZ3VtZW50c1xuXG5cdGlmIGNvbnNvbGU/XG5cdFx0Y29uc29sZS5sb2cgQXJyYXk6OnNsaWNlLmNhbGwoYXJndW1lbnRzKSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxDQUFPLEVBQVUsR0FBWCxDQUFOLEVBQWlCO0NBQ2hCLENBQUEsQ0FBRyxDQUEwQixHQUE3QjtDQUFBLENBQ0EsQ0FBRyxDQUFILEdBQVcsRUFBWDtDQUVBLENBQUEsRUFBRyw4Q0FBSDtDQUNTLEVBQVIsQ0FBWSxDQUFLLEVBQVYsRUFBWSxFQUFuQjtJQUxlO0NBQUEifX0seyJvZmZzZXQiOnsibGluZSI6NTc3MiwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL2dsb2JhbHMvbW92ZXIuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gXG5cdHNjcm9sbF90byA6IChlbCwgd2l0aF90b3BiYXIgPSBmYWxzZSwgc3BlZWQgPSAzMDApIC0+XG5cblx0XHR5ID0gZWwucG9zaXRpb24oKS50b3BcblxuXHRcdGxvZyBcIltNb3Zlcl0gc2Nyb2xsX3RvXCIsIHlcblx0XHRAc2Nyb2xsX3RvX3kgeSwgd2l0aF90b3BiYXIsIHNwZWVkXG5cdFx0XG5cblx0c2Nyb2xsX3RvX3k6ICh5LCB3aXRoX3RvcGJhciA9IHRydWUsIHNwZWVkID0gMzAwKSAtPlxuXHRcdGlmIHdpdGhfdG9wYmFyXG5cdFx0XHR5IC09IGFwcC5zZXR0aW5ncy5oZWFkZXJfaGVpZ2h0XG5cblx0XHRsb2cgXCJbbW92ZXJdIHNjcm9sbF90b195XCIsIHlcblx0XHRcblx0XHQkKCAnaHRtbCwgYm9keScgKS5hbmltYXRlIHNjcm9sbFRvcDogeSwgc3BlZWQiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsQ0FBTyxFQUNOLEdBREssQ0FBTjtDQUNDLENBQUEsQ0FBWSxFQUFBLElBQVosRUFBWTtDQUVYLE9BQUE7O0dBRjhCLEdBQWQ7TUFFaEI7O0dBRjZDLEdBQVI7TUFFckM7Q0FBQSxDQUFNLENBQUYsQ0FBSixJQUFJO0NBQUosQ0FFeUIsQ0FBekIsQ0FBQSxlQUFBO0NBQ0MsQ0FBZSxFQUFmLENBQUQsTUFBQTtDQUxELEVBQVk7Q0FBWixDQVFBLENBQWEsRUFBQSxJQUFDLEVBQWQ7O0dBQStCLEdBQWQ7TUFDaEI7O0dBRDRDLEdBQVI7TUFDcEM7Q0FBQSxHQUFBLE9BQUE7Q0FDQyxFQUFRLENBQUgsRUFBTCxFQUFpQixLQUFqQjtNQUREO0NBQUEsQ0FHMkIsQ0FBM0IsQ0FBQSxpQkFBQTtDQUVBLE1BQUEsSUFBQSxDQUFBO0NBQTBCLENBQVcsSUFBWCxHQUFBO0NBTmQsQ0FNNEIsR0FBeEMsQ0FBQTtDQWRELEVBUWE7Q0FUZCxDQUFBIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjU4MDQsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy91dGlscy9icm93c2VyLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJCcm93c2VyRGV0ZWN0ID1cblx0aW5pdDogKCApIC0+XG5cdFx0QGJyb3dzZXIgPSBAc2VhcmNoU3RyaW5nKEBkYXRhQnJvd3Nlcikgb3IgXCJBbiB1bmtub3duIGJyb3dzZXJcIlxuXHRcdEB2ZXJzaW9uID0gQHNlYXJjaFZlcnNpb24obmF2aWdhdG9yLnVzZXJBZ2VudCkgb3IgQHNlYXJjaFZlcnNpb24obmF2aWdhdG9yLmFwcFZlcnNpb24pIG9yIFwiYW4gdW5rbm93biB2ZXJzaW9uXCJcblx0XHRAT1MgPSBAc2VhcmNoU3RyaW5nKEBkYXRhT1MpIG9yIFwiYW4gdW5rbm93biBPU1wiXG5cblx0c2VhcmNoU3RyaW5nOiAoZGF0YSkgLT5cblx0XHRpID0gMFxuXG5cdFx0d2hpbGUgaSA8IGRhdGEubGVuZ3RoXG5cdFx0XHRkYXRhU3RyaW5nID0gZGF0YVtpXS5zdHJpbmdcblx0XHRcdGRhdGFQcm9wID0gZGF0YVtpXS5wcm9wXG5cdFx0XHRAdmVyc2lvblNlYXJjaFN0cmluZyA9IGRhdGFbaV0udmVyc2lvblNlYXJjaCBvciBkYXRhW2ldLmlkZW50aXR5XG5cdFx0XHRpZiBkYXRhU3RyaW5nXG5cdFx0XHRcdHJldHVybiBkYXRhW2ldLmlkZW50aXR5ICB1bmxlc3MgZGF0YVN0cmluZy5pbmRleE9mKGRhdGFbaV0uc3ViU3RyaW5nKSBpcyAtMVxuXHRcdFx0ZWxzZSByZXR1cm4gZGF0YVtpXS5pZGVudGl0eSAgaWYgZGF0YVByb3Bcblx0XHRcdGkrK1xuXHRcdHJldHVyblxuXG5cdHNlYXJjaFZlcnNpb246IChkYXRhU3RyaW5nKSAtPlxuXHRcdGluZGV4ID0gZGF0YVN0cmluZy5pbmRleE9mKEB2ZXJzaW9uU2VhcmNoU3RyaW5nKVxuXHRcdHJldHVybiAgaWYgaW5kZXggaXMgLTFcblx0XHRwYXJzZUZsb2F0IGRhdGFTdHJpbmcuc3Vic3RyaW5nKGluZGV4ICsgQHZlcnNpb25TZWFyY2hTdHJpbmcubGVuZ3RoICsgMSlcblxuXHRkYXRhQnJvd3NlcjogW1xuXHRcdHtcblx0XHRcdHN0cmluZzogbmF2aWdhdG9yLnVzZXJBZ2VudFxuXHRcdFx0c3ViU3RyaW5nOiBcIkNocm9tZVwiXG5cdFx0XHRpZGVudGl0eTogXCJDaHJvbWVcIlxuXHRcdH1cblx0XHR7XG5cdFx0XHRzdHJpbmc6IG5hdmlnYXRvci51c2VyQWdlbnRcblx0XHRcdHN1YlN0cmluZzogXCJPbW5pV2ViXCJcblx0XHRcdHZlcnNpb25TZWFyY2g6IFwiT21uaVdlYi9cIlxuXHRcdFx0aWRlbnRpdHk6IFwiT21uaVdlYlwiXG5cdFx0fVxuXHRcdHtcblx0XHRcdHN0cmluZzogbmF2aWdhdG9yLnZlbmRvclxuXHRcdFx0c3ViU3RyaW5nOiBcIkFwcGxlXCJcblx0XHRcdGlkZW50aXR5OiBcIlNhZmFyaVwiXG5cdFx0XHR2ZXJzaW9uU2VhcmNoOiBcIlZlcnNpb25cIlxuXHRcdH1cblx0XHR7XG5cdFx0XHRwcm9wOiB3aW5kb3cub3BlcmFcblx0XHRcdGlkZW50aXR5OiBcIk9wZXJhXCJcblx0XHRcdHZlcnNpb25TZWFyY2g6IFwiVmVyc2lvblwiXG5cdFx0fVxuXHRcdHtcblx0XHRcdHN0cmluZzogbmF2aWdhdG9yLnZlbmRvclxuXHRcdFx0c3ViU3RyaW5nOiBcImlDYWJcIlxuXHRcdFx0aWRlbnRpdHk6IFwiaUNhYlwiXG5cdFx0fVxuXHRcdHtcblx0XHRcdHN0cmluZzogbmF2aWdhdG9yLnZlbmRvclxuXHRcdFx0c3ViU3RyaW5nOiBcIktERVwiXG5cdFx0XHRpZGVudGl0eTogXCJLb25xdWVyb3JcIlxuXHRcdH1cblx0XHR7XG5cdFx0XHRzdHJpbmc6IG5hdmlnYXRvci51c2VyQWdlbnRcblx0XHRcdHN1YlN0cmluZzogXCJGaXJlZm94XCJcblx0XHRcdGlkZW50aXR5OiBcIkZpcmVmb3hcIlxuXHRcdH1cblx0XHR7XG5cdFx0XHRzdHJpbmc6IG5hdmlnYXRvci52ZW5kb3Jcblx0XHRcdHN1YlN0cmluZzogXCJDYW1pbm9cIlxuXHRcdFx0aWRlbnRpdHk6IFwiQ2FtaW5vXCJcblx0XHR9XG5cdFx0e1xuXHRcdFx0IyBmb3IgbmV3ZXIgTmV0c2NhcGVzICg2Kylcblx0XHRcdHN0cmluZzogbmF2aWdhdG9yLnVzZXJBZ2VudFxuXHRcdFx0c3ViU3RyaW5nOiBcIk5ldHNjYXBlXCJcblx0XHRcdGlkZW50aXR5OiBcIk5ldHNjYXBlXCJcblx0XHR9XG5cdFx0e1xuXHRcdFx0c3RyaW5nOiBuYXZpZ2F0b3IudXNlckFnZW50XG5cdFx0XHRzdWJTdHJpbmc6IFwiTVNJRVwiXG5cdFx0XHRpZGVudGl0eTogXCJFeHBsb3JlclwiXG5cdFx0XHR2ZXJzaW9uU2VhcmNoOiBcIk1TSUVcIlxuXHRcdH1cblx0XHR7XG5cdFx0XHRzdHJpbmc6IG5hdmlnYXRvci51c2VyQWdlbnRcblx0XHRcdHN1YlN0cmluZzogXCJHZWNrb1wiXG5cdFx0XHRpZGVudGl0eTogXCJNb3ppbGxhXCJcblx0XHRcdHZlcnNpb25TZWFyY2g6IFwicnZcIlxuXHRcdH1cblx0XHR7XG5cdFx0XHQjIGZvciBvbGRlciBOZXRzY2FwZXMgKDQtKVxuXHRcdFx0c3RyaW5nOiBuYXZpZ2F0b3IudXNlckFnZW50XG5cdFx0XHRzdWJTdHJpbmc6IFwiTW96aWxsYVwiXG5cdFx0XHRpZGVudGl0eTogXCJOZXRzY2FwZVwiXG5cdFx0XHR2ZXJzaW9uU2VhcmNoOiBcIk1vemlsbGFcIlxuXHRcdH1cblx0XVxuXHRkYXRhT1M6IFtcblx0XHR7XG5cdFx0XHRzdHJpbmc6IG5hdmlnYXRvci5wbGF0Zm9ybVxuXHRcdFx0c3ViU3RyaW5nOiBcIldpblwiXG5cdFx0XHRpZGVudGl0eTogXCJXaW5kb3dzXCJcblx0XHR9XG5cdFx0e1xuXHRcdFx0c3RyaW5nOiBuYXZpZ2F0b3IucGxhdGZvcm1cblx0XHRcdHN1YlN0cmluZzogXCJNYWNcIlxuXHRcdFx0aWRlbnRpdHk6IFwiTWFjXCJcblx0XHR9XG5cdFx0e1xuXHRcdFx0c3RyaW5nOiBuYXZpZ2F0b3IudXNlckFnZW50XG5cdFx0XHRzdWJTdHJpbmc6IFwiaVBob25lXCJcblx0XHRcdGlkZW50aXR5OiBcImlQaG9uZS9pUG9kXCJcblx0XHR9XG5cdFx0e1xuXHRcdFx0c3RyaW5nOiBuYXZpZ2F0b3IucGxhdGZvcm1cblx0XHRcdHN1YlN0cmluZzogXCJMaW51eFwiXG5cdFx0XHRpZGVudGl0eTogXCJMaW51eFwiXG5cdFx0fVxuXHRdXG5cbkJyb3dzZXJEZXRlY3QuaW5pdCgpXG5cbm1vZHVsZS5leHBvcnRzID0gQnJvd3NlckRldGVjdCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFNBQUE7O0FBQUEsQ0FBQSxFQUNDLFVBREQ7Q0FDQyxDQUFBLENBQU0sQ0FBTixLQUFNO0NBQ0wsRUFBVyxDQUFYLEdBQUEsSUFBVyxDQUFBLFFBQVg7Q0FBQSxFQUNXLENBQVgsR0FBQSxFQUFtQyxDQUFlLEdBQXZDLE9BRFg7Q0FFQyxDQUFELENBQU0sQ0FBTCxFQUFLLEtBQU4sQ0FBTTtDQUhQLEVBQU07Q0FBTixDQUtBLENBQWMsQ0FBQSxLQUFDLEdBQWY7Q0FDQyxPQUFBLGVBQUE7Q0FBQSxFQUFJLENBQUo7Q0FFQSxFQUFVLENBQUksRUFBZCxLQUFNO0NBQ0wsRUFBYSxDQUFLLEVBQWxCLElBQUE7Q0FBQSxFQUNXLENBQUssRUFBaEIsRUFBQTtDQURBLEVBRXVCLENBQXRCLEVBQUQsRUFGQSxLQUV1QixNQUF2QjtDQUNBLEdBQUcsRUFBSCxJQUFBO0FBQzJFLENBQTFFLEdBQWdDLENBQXlDLEVBQXpDLENBQWhDLENBQWdDLENBQVU7Q0FBMUMsR0FBWSxJQUFaLFNBQU87VUFEUjtNQUFBLEVBQUE7Q0FFSyxHQUE0QixJQUE1QjtDQUFBLEdBQVksSUFBWixTQUFPO1VBRlo7UUFIQTtBQU1BLENBTkEsQ0FBQSxJQU1BO0NBVlksSUFHYjtDQVJELEVBS2M7Q0FMZCxDQWtCQSxDQUFlLE1BQUMsQ0FBRCxHQUFmO0NBQ0MsSUFBQSxHQUFBO0NBQUEsRUFBUSxDQUFSLENBQUEsRUFBUSxHQUFVLFNBQVY7QUFDYSxDQUFyQixHQUFBLENBQVc7Q0FBWCxXQUFBO01BREE7Q0FFVyxFQUE2QixDQUFDLENBQVQsQ0FBQSxHQUFyQixDQUFYLENBQUEsUUFBNEQ7Q0FyQjdELEVBa0JlO0NBbEJmLENBdUJBLFNBQUE7S0FDQztDQUFBLENBQ1MsSUFBUixHQUFpQjtDQURsQixDQUVZLElBQVgsRUFGRCxDQUVDO0NBRkQsQ0FHVyxJQUFWLEVBQUE7RUFFRCxJQU5ZO0NBTVosQ0FDUyxJQUFSLEdBQWlCO0NBRGxCLENBRVksSUFBWCxHQUFBO0NBRkQsQ0FHZ0IsSUFBZixJQUhELEdBR0M7Q0FIRCxDQUlXLElBQVYsRUFBQSxDQUpEO0VBTUEsSUFaWTtDQVlaLENBQ1MsSUFBUixHQUFpQjtDQURsQixDQUVZLElBQVgsQ0FGRCxFQUVDO0NBRkQsQ0FHVyxJQUFWLEVBQUE7Q0FIRCxDQUlnQixJQUFmLEdBSkQsSUFJQztFQUVELElBbEJZO0NBa0JaLENBQ08sRUFBTixDQURELENBQ0M7Q0FERCxDQUVXLElBQVYsQ0FGRCxDQUVDO0NBRkQsQ0FHZ0IsSUFBZixHQUhELElBR0M7RUFFRCxJQXZCWTtDQXVCWixDQUNTLElBQVIsR0FBaUI7Q0FEbEIsQ0FFWSxJQUFYLEdBQUE7Q0FGRCxDQUdXLElBQVYsRUFBQTtFQUVELElBNUJZO0NBNEJaLENBQ1MsSUFBUixHQUFpQjtDQURsQixDQUVZLEdBRlosQ0FFQyxHQUFBO0NBRkQsQ0FHVyxJQUFWLEVBQUEsR0FIRDtFQUtBLElBakNZO0NBaUNaLENBQ1MsSUFBUixHQUFpQjtDQURsQixDQUVZLElBQVgsR0FBQTtDQUZELENBR1csSUFBVixFQUFBLENBSEQ7RUFLQSxJQXRDWTtDQXNDWixDQUNTLElBQVIsR0FBaUI7Q0FEbEIsQ0FFWSxJQUFYLEVBRkQsQ0FFQztDQUZELENBR1csSUFBVixFQUFBO0VBRUQsSUEzQ1k7Q0EyQ1osQ0FFUyxJQUFSLEdBQWlCO0NBRmxCLENBR1ksSUFBWCxHQUFBLENBSEQ7Q0FBQSxDQUlXLElBQVYsRUFBQSxFQUpEO0VBTUEsSUFqRFk7Q0FpRFosQ0FDUyxJQUFSLEdBQWlCO0NBRGxCLENBRVksSUFBWCxHQUFBO0NBRkQsQ0FHVyxJQUFWLEVBQUEsRUFIRDtDQUFBLENBSWdCLElBQWYsT0FBQTtFQUVELElBdkRZO0NBdURaLENBQ1MsSUFBUixHQUFpQjtDQURsQixDQUVZLElBQVgsQ0FGRCxFQUVDO0NBRkQsQ0FHVyxJQUFWLEVBQUEsQ0FIRDtDQUFBLENBSWdCLEVBSmhCLEVBSUMsT0FBQTtFQUVELElBN0RZO0NBNkRaLENBRVMsSUFBUixHQUFpQjtDQUZsQixDQUdZLElBQVgsR0FBQTtDQUhELENBSVcsSUFBVixFQUFBLEVBSkQ7Q0FBQSxDQUtnQixJQUFmLEdBTEQsSUFLQztNQWxFVztJQXZCYjtDQUFBLENBNEZBLElBQUE7S0FDQztDQUFBLENBQ1MsSUFBUixFQURELENBQ2tCO0NBRGxCLENBRVksR0FGWixDQUVDLEdBQUE7Q0FGRCxDQUdXLElBQVYsRUFBQSxDQUhEO0VBS0EsSUFOTztDQU1QLENBQ1MsSUFBUixFQURELENBQ2tCO0NBRGxCLENBRVksR0FGWixDQUVDLEdBQUE7Q0FGRCxDQUdXLEdBSFgsQ0FHQyxFQUFBO0VBRUQsSUFYTztDQVdQLENBQ1MsSUFBUixHQUFpQjtDQURsQixDQUVZLElBQVgsRUFGRCxDQUVDO0NBRkQsQ0FHVyxJQUFWLEVBQUEsS0FIRDtFQUtBLElBaEJPO0NBZ0JQLENBQ1MsSUFBUixFQURELENBQ2tCO0NBRGxCLENBRVksSUFBWCxDQUZELEVBRUM7Q0FGRCxDQUdXLElBQVYsQ0FIRCxDQUdDO01BbkJNO0lBNUZSO0NBREQsQ0FBQTs7QUFvSEEsQ0FwSEEsR0FvSEEsU0FBYTs7QUFFYixDQXRIQSxFQXNIaUIsR0FBWCxDQUFOLE1BdEhBIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjU5MjIsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy91dGlscy9vcGFjaXR5LmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJPcGFjaXR5ID0gXG5cdHNob3c6IChlbCwgdGltZSA9IDUwMCkgLT5cblx0XHQjIGxvZyBcIltPcGFjaXR5XSBzaG93XCJcblx0XHRlbC5mYWRlSW4gdGltZVxuXHRcdCMgdCA9IE9wYWNpdHkuZ2V0X3RpbWUoIHRpbWUgKVxuXHRcdCMgZWwuY3NzIFxuXHRcdCMgXHQndmlzaWJpbGl0eScgOiBcInZpc2libGVcIlxuXHRcdCMgXHQndHJhbnNpdGlvbicgOiBcIm9wYWNpdHkgI3t0fSBsaW5lYXJcIlxuXG5cdFx0IyBkZWxheSAxLCAtPlxuXHRcdCMgXHRlbC5jc3MgJ29wYWNpdHknLCAxXG5cblx0aGlkZTogKCBlbCwgdGltZSA9IDUwMCApIC0+XG5cdFx0IyBsb2cgXCJbT3BhY2l0eV0gaGlkZVwiXG5cdFx0ZWwuZmFkZU91dCB0aW1lXG5cblx0XHQjIHQgPSBPcGFjaXR5LmdldF90aW1lIHRpbWVcblx0XHQjIHQxID0gT3BhY2l0eS5nZXRfdGltZSggdGltZSArIDEwMCApXG5cblx0XHQjIGVsLmNzcyAndHJhbnNpdGlvbicsIFwib3BhY2l0eSAje3R9IGxpbmVhclwiXG5cdFx0IyBkZWxheSAxLCAtPiBlbC5jc3MgJ29wYWNpdHknLCAwXG5cdFx0IyBkZWxheSB0MSwgLT4gZWwuY3NzICd2aXNpYmlsaXR5JywgJ2hpZGRlbidcblxuXHRnZXRfdGltZTogKCB0aW1lICkgLT5cblx0XHRyZXR1cm4gKHRpbWUvMTAwMCkgKyBcInNcIlxuXG5tb2R1bGUuZXhwb3J0cyA9IE9wYWNpdHkiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxHQUFBOztBQUFBLENBQUEsRUFDQyxJQUREO0NBQ0MsQ0FBQSxDQUFNLENBQU4sS0FBTzs7R0FBVyxHQUFQO01BRVY7Q0FBRyxDQUFELEVBQUYsRUFBQSxLQUFBO0NBRkQsRUFBTTtDQUFOLENBV0EsQ0FBTSxDQUFOLEtBQVE7O0dBQVcsR0FBUDtNQUVYO0NBQUcsQ0FBRCxFQUFGLEdBQUEsSUFBQTtDQWJELEVBV007Q0FYTixDQXNCQSxDQUFVLENBQUEsSUFBVixDQUFZO0NBQ1gsRUFBYSxDQUFMLE9BQUQ7Q0F2QlIsRUFzQlU7Q0F2QlgsQ0FBQTs7QUEwQkEsQ0ExQkEsRUEwQmlCLEdBQVgsQ0FBTiJ9fSx7Im9mZnNldCI6eyJsaW5lIjo1OTQ2LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdXRpbHMvcHJlbG9hZC5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSAoaW1hZ2VzLCBjYWxsYmFjaykgLT5cblxuXHRjb3VudCA9IDBcblx0aW1hZ2VzX2xvYWRlZCA9IFtdXG5cblx0bG9hZCA9ICggc3JjLCBjYWxsYmFjayApIC0+XG5cdFx0XHRcblx0XHRpbWcgPSBuZXcgSW1hZ2UoKVxuXHRcdGltZy5vbmxvYWQgPSBjYWxsYmFja1xuXHRcdGltZy5zcmMgPSBzcmNcblxuXHRcdGltYWdlc19sb2FkZWQucHVzaCBpbWdcblxuXHRsb2FkZWQgPSAtPlxuXHRcdGNvdW50Kytcblx0XHRsb2cgXCJbUHJlbG9hZGVyXSBsb2FkX211bHRpcGxlIC0gbG9hZGVkXCIsIFwiI3tjb3VudH0gLyAje2ltYWdlcy5sZW5ndGh9XCJcblxuXHRcdGlmIGNvdW50IGlzIGltYWdlcy5sZW5ndGhcblx0XHRcdGxvZyBcIltQcmVsb2FkZXJdIGxvYWRfbXVsdGlwbGUgLSBsb2FkZWQgQUxMXCJcblx0XHRcdGNhbGxiYWNrKCBpbWFnZXNfbG9hZGVkIClcblxuXHRmb3IgaXRlbSBpbiBpbWFnZXNcblx0XHRsb2FkIGl0ZW0sIGxvYWRlZFxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLENBQU8sQ0FBbUIsQ0FBVCxHQUFYLENBQU4sQ0FBaUIsQ0FBQztDQUVqQixLQUFBLHNEQUFBO0NBQUEsQ0FBQSxDQUFRLEVBQVI7Q0FBQSxDQUNBLENBQWdCLFVBQWhCO0NBREEsQ0FHQSxDQUFPLENBQVAsSUFBTyxDQUFFO0NBRVIsRUFBQSxLQUFBO0NBQUEsRUFBQSxDQUFBLENBQVU7Q0FBVixFQUNHLENBQUgsRUFBQSxFQURBO0NBQUEsRUFFRyxDQUFIO0NBRWMsRUFBZCxDQUFBLE9BQUEsRUFBYTtDQVRkLEVBR087Q0FIUCxDQVdBLENBQVMsR0FBVCxHQUFTO0FBQ1IsQ0FBQSxDQUFBLEVBQUEsQ0FBQTtDQUFBLENBQzBDLENBQTFDLENBQUEsQ0FBMEMsQ0FBbUIsOEJBQTdEO0NBRUEsR0FBQSxDQUFHLENBQWU7Q0FDakIsRUFBQSxHQUFBLGtDQUFBO0NBQ1UsT0FBVixLQUFBO01BTk87Q0FYVCxFQVdTO0FBUVQsQ0FBQTtRQUFBLHFDQUFBO3VCQUFBO0NBQ0MsQ0FBVyxFQUFYLEVBQUE7Q0FERDttQkFyQmdCO0NBQUEifX0seyJvZmZzZXQiOnsibGluZSI6NTk3NSwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3V0aWxzL3NldHRpbmdzLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJCcm93c2VyRGV0ZWN0ID0gcmVxdWlyZSAnYXBwL3V0aWxzL2Jyb3dzZXInXG5cbnNldHRpbmdzID0gXG5cblx0IyBCcm93c2VyIGlkLCB2ZXJzaW9uLCBPU1xuXHRicm93c2VyOiB7XG5cblx0XHQjIElEIFtTdHJpbmddXG5cdFx0aWQ6IEJyb3dzZXJEZXRlY3QuYnJvd3NlclxuXG5cdFx0IyBWZXJzaW9uIFtTdHJpbmddXG5cdFx0dmVyc2lvbjogQnJvd3NlckRldGVjdC52ZXJzaW9uXG5cdFx0XG5cdFx0IyBPUyBbU3RyaW5nXVxuXHRcdE9TOiBCcm93c2VyRGV0ZWN0Lk9TXG5cdFx0XG5cdFx0IyBJcyBDaHJvbWU/IFtCb29sZWFuXVxuXHRcdGNocm9tZTogKG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5pbmRleE9mKCAnY2hyb21lJyApID4gLTEpXG5cblx0XHQjIElzIEZpcmVmb3ggW0Jvb2xlYW5dXG5cdFx0ZmlyZWZveDogKC9GaXJlZm94L2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSlcblxuXHRcdCMgSXMgSUU4PyBbQm9vbGVhbl1cblx0XHRpZTg6IGZhbHNlXG5cblx0XHQjIERldmljZSByYXRpbyBbTnVtYmVyXVxuXHRcdGRldmljZV9yYXRpbzogd2luZG93LmRldmljZVBpeGVsUmF0aW9cblxuXHRcdCMgSXMgYSBoYW5kaGVsZCBkZXZpY2U/IFtCb29sZWFuXVxuXHRcdGhhbmRoZWxkOiBmYWxzZVxuXG5cdFx0IyBJcyBhIHRhYmxldD8gW0Jvb2xlYW5dXG5cdFx0dGFibGV0OiBmYWxzZVxuXHRcdFxuXHRcdCMgSXMgYSBtb2JpbGU/IFtCb29sZWFuXVxuXHRcdG1vYmlsZTogZmFsc2VcblxuXHRcdCMgSXMgZGVza3RvcD8gU2V0IGFmdGVyIHRoZSBjbGFzcyBkZWZpbml0aW9uIFtCb29sZWFuXVxuXHRcdGRlc2t0b3A6IGZhbHNlXG5cblx0XHQjIElzIGEgdGFibGV0IG9yIG1vYmlsZT8gW0Jvb2xlYW5dXG5cdFx0ZGV2aWNlOiBmYWxzZVxuXG5cdFx0IyBEZWJ1ZyBtb2RlIC0gc2V0IGJ5IGVudiBpbiBpbmRleC5waHBcblx0XHRkZWJ1ZzogZmFsc2VcblxuXHRcdGNzc19jb3Zlcl9zdXBwb3J0ZWQ6IE1vZGVybml6ci5iYWNrZ3JvdW5kc2l6ZVxuXG5cdFx0bWluX3NpemU6XG5cdFx0XHR3OiA5MDBcblx0XHRcdGg6IDQwMFxuXHR9XG5cblx0IyBVc2UgdGhpcyBmbGFnIGlmIHdlcmUgZG9pbmcga2V5ZnJhbWUgYW5pbWF0aW9uc1xuXHQjIG90aGVyd2lzZSBpbXBsZW1lbnQgYSBqcyBmYWxsYmFja1xuXG5cdCMgV2VicCBzdXBwb3J0XG5cdHdlYnA6IGZhbHNlXG5cbnNldHRpbmdzLnRoZW1lID0gXCJkZXNrdG9wXCJcbnNldHRpbmdzLnRocmVzaG9sZF90aGVtZSA9IDkwMFxuXG5cbiMgUmV0aW5hIHN1cHBvcnRlZCBbQm9vbGVhbl1cbnNldHRpbmdzLmJyb3dzZXIucmV0aW5hID0gc2V0dGluZ3MuYnJvd3Nlci5kZXZpY2VfcmF0aW8gaXMgMlxuXG4jIFdlYnAgdGVzdFxuaWYgc2V0dGluZ3MuYnJvd3Nlci5jaHJvbWUgYW5kIHNldHRpbmdzLmJyb3dzZXIudmVyc2lvbiA+PSAzMFxuXHRzZXR0aW5ncy53ZWJwID0gdHJ1ZVxuXG4jIEZsYWdzIGZvciBJRVxuaWYgc2V0dGluZ3MuYnJvd3Nlci5pZCBpcyAnRXhwbG9yZXInIFxuXHRzZXR0aW5ncy5icm93c2VyLmllID0gdHJ1ZVxuXHRpZiBzZXR0aW5ncy5icm93c2VyLnZlcnNpb24gaXMgOFxuXHRcdHNldHRpbmdzLmJyb3dzZXIuaWU4ID0gdHJ1ZVxuXHRpZiBzZXR0aW5ncy5icm93c2VyLnZlcnNpb24gaXMgOVxuXHRcdHNldHRpbmdzLmJyb3dzZXIuaWU5ID0gdHJ1ZVxuXG5cbiMgSWYgaXQncyBhbiBoYW5kaGVsZCBkZXZpY2VcbnNldHRpbmdzLnZpZGVvX2FjdGl2ZSA9IHNldHRpbmdzLmJyb3dzZXIuaWQgaXNudCAnRXhwbG9yZXInXG5cblxuXG5pZiggL0FuZHJvaWR8d2ViT1N8aVBob25lfGlQYWR8aVBvZHxCbGFja0JlcnJ5fElFTW9iaWxlfE9wZXJhIE1pbmkvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpIClcblx0c2V0dGluZ3MuYnJvd3Nlci5oYW5kaGVsZCA9IHRydWVcblxuXHQjIENoZWNrIGlmIGl0J3MgbW9iaWxlIG9yIHRhYmxldCBjYWxjdWxhdGluZyByYXRpbyBhbmQgb3JpZW50YXRpb25cblx0cmF0aW8gPSAkKHdpbmRvdykud2lkdGgoKS8kKHdpbmRvdykuaGVpZ2h0KClcblx0c2V0dGluZ3MuYnJvd3Nlci5vcmllbnRhdGlvbiA9IGlmIHJhdGlvID4gMSB0aGVuIFwibGFuZHNjYXBlXCIgZWxzZSBcInBvcnRyYWl0XCJcblxuXHQjIGNoZWNrIG1heCB3aWR0aCBmb3IgbW9iaWxlIGRldmljZSAobmV4dXMgNyBpbmNsdWRlZClcblx0aWYgJCh3aW5kb3cpLndpZHRoKCkgPCA2MTAgb3IgKHNldHRpbmdzLmJyb3dzZXIub3JpZW50YXRpb24gaXMgXCJsYW5kc2NhcGVcIiBhbmQgcmF0aW8gPiAyLjEwIClcblx0XHRzZXR0aW5ncy5icm93c2VyLm1vYmlsZSA9IHRydWVcblx0XHRzZXR0aW5ncy5icm93c2VyLnRhYmxldCA9IGZhbHNlXG5cdGVsc2Vcblx0XHRzZXR0aW5ncy5icm93c2VyLm1vYmlsZSA9IGZhbHNlXG5cdFx0c2V0dGluZ3MuYnJvd3Nlci50YWJsZXQgPSB0cnVlXG5cbnNldHRpbmdzLmJyb3dzZXIuZGV2aWNlID0gKHNldHRpbmdzLmJyb3dzZXIudGFibGV0IG9yIHNldHRpbmdzLmJyb3dzZXIubW9iaWxlKVxuXG4jIFNldCBkZXNrdG9wIGZsYWdcbmlmIHNldHRpbmdzLmJyb3dzZXIudGFibGV0IGlzIGZhbHNlIGFuZCAgc2V0dGluZ3MuYnJvd3Nlci5tb2JpbGUgaXMgZmFsc2Vcblx0c2V0dGluZ3MuYnJvd3Nlci5kZXNrdG9wID0gdHJ1ZVxuXG5cbnNldHRpbmdzLmJyb3dzZXIud2luZG93c19waG9uZSA9IGZhbHNlXG5pZiBzZXR0aW5ncy5icm93c2VyLm1vYmlsZSBhbmQgc2V0dGluZ3MuYnJvd3Nlci5pZCBpcyAnRXhwbG9yZXInXG5cdHNldHRpbmdzLmJyb3dzZXIud2luZG93c19waG9uZSA9IHRydWVcblxuXG5zZXR0aW5ncy50b3VjaF9kZXZpY2UgPSBzZXR0aW5ncy5icm93c2VyLmhhbmRoZWxkXG5cbiMgUGxhdGZvcm0gc3BlY2lmaWMgZXZlbnRzIG1hcFxuc2V0dGluZ3MuZXZlbnRzX21hcCA9XG5cdCdkb3duJyA6ICdtb3VzZWRvd24nXG5cdCd1cCcgICA6ICdtb3VzZXVwJ1xuXHQnbW92ZScgOiAnbW91c2Vtb3ZlJ1xuXG5pZiBzZXR0aW5ncy5icm93c2VyLmRldmljZVxuXG5cdGlmIHNldHRpbmdzLmJyb3dzZXIud2luZG93c19waG9uZVxuXHRcdHNldHRpbmdzLmV2ZW50c19tYXAgPVxuXHRcdFx0J2Rvd24nIDogJ01TUG9pbnRlckRvd24nXG5cdFx0XHQndXAnICAgOiAnTVNQb2ludGVyVXAnXG5cdFx0XHQnbW92ZScgOiAnTVNQb2ludGVyTW92ZSdcblx0XHRcdFxuXHRlbHNlXG5cdFx0c2V0dGluZ3MuZXZlbnRzX21hcCA9XG5cdFx0XHQnZG93bicgOiAndG91Y2hzdGFydCdcblx0XHRcdCd1cCcgICA6ICd0b3VjaGVuZCdcblx0XHRcdCdtb3ZlJyA6ICd0b3VjaG1vdmUnXG5cblxuXG5cbiMgUGxhdGZvcm0gY2xhc3NcbmlmIHNldHRpbmdzLmJyb3dzZXIuZGVza3RvcFxuXHRwbGF0Zm9ybSA9ICdkZXNrdG9wJ1xuZWxzZSBpZiBzZXR0aW5ncy5icm93c2VyLnRhYmxldFxuXHRwbGF0Zm9ybSA9ICd0YWJsZXQnXG5lbHNlXG5cdHBsYXRmb3JtID0gJ21vYmlsZSdcblxuIyBCcm93c2VyIGNsYXNzIGZvciB0aGUgYm9keVxuc2V0dGluZ3MuYnJvd3Nlcl9jbGFzcyA9IHNldHRpbmdzLmJyb3dzZXIuaWQgKyAnXycgKyBzZXR0aW5ncy5icm93c2VyLnZlcnNpb25cblxuaGFzM2QgPSAtPlxuXHRlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpXG5cdGhhczNkID0gdW5kZWZpbmVkXG5cdHRyYW5zZm9ybXMgPVxuXHRcdHdlYmtpdFRyYW5zZm9ybTogXCItd2Via2l0LXRyYW5zZm9ybVwiXG5cdFx0T1RyYW5zZm9ybTogXCItby10cmFuc2Zvcm1cIlxuXHRcdG1zVHJhbnNmb3JtOiBcIi1tcy10cmFuc2Zvcm1cIlxuXHRcdE1velRyYW5zZm9ybTogXCItbW96LXRyYW5zZm9ybVwiXG5cdFx0dHJhbnNmb3JtOiBcInRyYW5zZm9ybVwiXG5cblxuXHQjIEFkZCBpdCB0byB0aGUgYm9keSB0byBnZXQgdGhlIGNvbXB1dGVkIHN0eWxlLlxuXHRkb2N1bWVudC5ib2R5Lmluc2VydEJlZm9yZSBlbCwgbnVsbFxuXHRmb3IgdCBvZiB0cmFuc2Zvcm1zXG5cdFx0aWYgZWwuc3R5bGVbdF0gaXNudCBgdW5kZWZpbmVkYFxuXHRcdFx0ZWwuc3R5bGVbdF0gPSBcInRyYW5zbGF0ZTNkKDFweCwxcHgsMXB4KVwiXG5cdFx0XHRoYXMzZCA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsKS5nZXRQcm9wZXJ0eVZhbHVlKHRyYW5zZm9ybXNbdF0pXG5cdGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQgZWxcblx0aGFzM2QgaXNudCBgdW5kZWZpbmVkYCBhbmQgaGFzM2QubGVuZ3RoID4gMCBhbmQgaGFzM2QgaXNudCBcIm5vbmVcIlxuXG5cbiMgc2V0dGluZ3MuaGFzM2QgPSBoYXMzZCgpXG5cblxuXG5zZXR0aW5ncy5iaW5kID0gKGJvZHkpLT5cblx0a2xhc3NlcyA9IFtdXG5cdGtsYXNzZXMucHVzaCBzZXR0aW5ncy5icm93c2VyX2NsYXNzXG5cdGtsYXNzZXMucHVzaCBzZXR0aW5ncy5icm93c2VyLk9TLnJlcGxhY2UoICcvJywgJ18nIClcblx0a2xhc3Nlcy5wdXNoIHNldHRpbmdzLmJyb3dzZXIuaWRcblxuXHRpZiBzZXR0aW5ncy50b3VjaF9kZXZpY2Vcblx0XHRrbGFzc2VzLnB1c2ggXCJ0b3VjaF9kZXZpY2VcIlxuXHRlbHNlXG5cdFx0a2xhc3Nlcy5wdXNoIFwibm9fdG91Y2hfZGV2aWNlXCJcblxuXHRpZiBzZXR0aW5ncy5icm93c2VyLmNzc19jb3Zlcl9zdXBwb3J0ZWRcblx0XHRrbGFzc2VzLnB1c2ggXCJjc3NfY292ZXJfc3VwcG9ydGVkXCJcblxuXHRib2R5LmFkZENsYXNzIGtsYXNzZXMuam9pbiggXCIgXCIgKS50b0xvd2VyQ2FzZSgpXG5cblx0c2V0dGluZ3MuaGVhZGVyX2hlaWdodCA9ICQoICdoZWFkZXInICkuaGVpZ2h0KClcblx0IyBib2R5LmNzcyBcblx0IyBcdCdtaW4td2lkdGgnICA6IHNldHRpbmdzLmJyb3dzZXIubWluX3NpemUud1xuXHQjIFx0J21pbi1oZWlnaHQnIDogc2V0dGluZ3MuYnJvd3Nlci5taW5fc2l6ZS5oXG5cblxuXG4jIFRFTVBcblxuIyBzZXR0aW5ncy52aWRlb19hY3RpdmUgPSBmYWxzZVxuIyBzZXR0aW5ncy5jc3NfY292ZXJfc3VwcG9ydGVkID0gZmFsc2VcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHNldHRpbmdzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsMkNBQUE7O0FBQUEsQ0FBQSxFQUFnQixJQUFBLE1BQWhCLE1BQWdCOztBQUVoQixDQUZBLEVBS0MsS0FIRDtDQUdDLENBQUEsS0FBQTtDQUFTLENBR1IsRUFBQSxHQUhRLE1BR1M7Q0FIVCxDQU1DLEVBQVQsR0FBQSxNQUFzQjtDQU5kLENBU1IsRUFBQSxTQUFpQjtBQUdpRCxDQVoxRCxDQVlDLENBQXdELENBQWpFLEVBQUEsQ0FBUyxDQUFBLENBQVMsRUFBVDtDQVpELENBZUUsRUFBVixHQUFBLEVBQW1DLENBQWY7Q0FmWixDQWtCSCxDQUFMLENBQUEsQ0FsQlE7Q0FBQSxDQXFCTSxFQUFkLEVBQW9CLE1BQXBCLElBckJRO0NBQUEsQ0F3QkUsRUFBVixDQXhCUSxHQXdCUjtDQXhCUSxDQTJCQSxFQUFSLENBM0JRLENBMkJSO0NBM0JRLENBOEJBLEVBQVIsQ0E5QlEsQ0E4QlI7Q0E5QlEsQ0FpQ0MsRUFBVCxDQWpDUSxFQWlDUjtDQWpDUSxDQW9DQSxFQUFSLENBcENRLENBb0NSO0NBcENRLENBdUNELEVBQVAsQ0FBQTtDQXZDUSxDQXlDYSxFQUFyQixLQUE4QixLQXpDdEIsS0F5Q1I7Q0F6Q1EsQ0E0Q1AsRUFERCxJQUFBO0NBQ0MsQ0FBRyxDQUFILEdBQUE7Q0FBQSxDQUNHLENBREgsR0FDQTtNQTdDTztJQUFUO0NBQUEsQ0FvREEsRUFBQSxDQXBEQTtDQUxELENBQUE7O0FBMkRBLENBM0RBLEVBMkRpQixFQUFqQixHQUFRLENBM0RSOztBQTREQSxDQTVEQSxFQTREMkIsS0FBbkIsT0FBUjs7QUFJQSxDQWhFQSxFQWdFMEIsRUFBaUMsQ0FBM0QsQ0FBZ0IsQ0FBUixJQUFrQjs7QUFHMUIsQ0FBQSxDQUFBLEVBQUcsRUFBQSxDQUFnQixDQUFSO0NBQ1YsQ0FBQSxDQUFnQixDQUFoQixJQUFRO0VBcEVUOztBQXVFQSxDQUFBLENBQUcsRUFBQSxDQUF1QixFQUFQLENBQVIsRUFBWDtDQUNDLENBQUEsQ0FBc0IsQ0FBdEIsR0FBZ0IsQ0FBUjtDQUNSLENBQUEsRUFBRyxDQUE0QixFQUFaLENBQVI7Q0FDVixFQUFBLENBQUEsR0FBZ0IsQ0FBUjtJQUZUO0NBR0EsQ0FBQSxFQUFHLENBQTRCLEVBQVosQ0FBUjtDQUNWLEVBQUEsQ0FBQSxHQUFnQixDQUFSO0lBTFY7RUF2RUE7O0FBZ0ZBLENBaEZBLENBZ0Z3QixDQUFBLEVBQXlCLEVBQVQsQ0FBaEMsRUFoRlIsRUFnRkE7O0FBSUEsQ0FBQSxHQUFJLEtBQStFLHVEQUFmO0NBQ25FLENBQUEsQ0FBNEIsQ0FBNUIsR0FBZ0IsQ0FBUjtDQUFSLENBR0EsQ0FBUSxFQUFSLENBQVE7Q0FIUixDQUlBLENBQWtDLEVBQUEsRUFBbEIsQ0FBUixFQUpSLENBSUE7Q0FHQSxDQUFBLENBQXVCLENBQXBCLENBQUEsQ0FBQSxDQUE0QyxDQUFSLEdBQVI7Q0FDOUIsRUFBMEIsQ0FBMUIsRUFBQSxDQUFnQixDQUFSO0NBQVIsRUFDMEIsQ0FBMUIsQ0FEQSxDQUNBLENBQWdCLENBQVI7SUFGVCxFQUFBO0NBSUMsRUFBMEIsQ0FBMUIsQ0FBQSxDQUFBLENBQWdCLENBQVI7Q0FBUixFQUMwQixDQUExQixFQUFBLENBQWdCLENBQVI7SUFiVjtFQXBGQTs7QUFtR0EsQ0FuR0EsRUFtRzJCLENBQTJCLEVBQXRELENBQWdCLENBQVI7O0FBR1IsQ0FBQSxHQUFHLENBQTJCLENBQTNCLENBQWdCLENBQVI7Q0FDVixDQUFBLENBQTJCLENBQTNCLEdBQWdCLENBQVI7RUF2R1Q7O0FBMEdBLENBMUdBLEVBMEdpQyxFQTFHakMsRUEwR2dCLENBQVIsS0FBUjs7QUFDQSxDQUFBLENBQStCLEVBQTVCLENBQW1ELENBQW5ELENBQWdCLENBQVIsRUFBWDtDQUNDLENBQUEsQ0FBaUMsQ0FBakMsR0FBZ0IsQ0FBUixLQUFSO0VBNUdEOztBQStHQSxDQS9HQSxFQStHd0IsSUFBZ0IsQ0FBaEMsSUFBUjs7QUFHQSxDQWxIQSxFQW1IQyxLQURPLEVBQVI7Q0FDQyxDQUFBLElBQUEsS0FBQTtDQUFBLENBQ0EsRUFBQSxLQURBO0NBQUEsQ0FFQSxJQUFBLEtBRkE7Q0FuSEQsQ0FBQTs7QUF1SEEsQ0FBQSxHQUFHLEVBQUgsQ0FBbUIsQ0FBUjtDQUVWLENBQUEsRUFBRyxHQUFnQixDQUFSLEtBQVg7Q0FDQyxFQUNDLENBREQsSUFBUSxFQUFSO0NBQ0MsQ0FBUyxJQUFULFNBQUE7Q0FBQSxDQUNTLEVBQVQsRUFBQSxPQURBO0NBQUEsQ0FFUyxJQUFULFNBRkE7Q0FGRixLQUNDO0lBREQsRUFBQTtDQU9DLEVBQ0MsQ0FERCxJQUFRLEVBQVI7Q0FDQyxDQUFTLElBQVQsTUFBQTtDQUFBLENBQ1MsRUFBVCxFQUFBLElBREE7Q0FBQSxDQUVTLElBQVQsS0FGQTtDQVJGLEtBT0M7SUFURjtFQXZIQTs7QUF5SUEsQ0FBQSxHQUFHLEdBQWdCLENBQVI7Q0FDVixDQUFBLENBQVcsS0FBWCxDQUFBO0NBQ2dCLENBRmpCLEVBRVEsRUFGUixDQUV3QixDQUFSO0NBQ2YsQ0FBQSxDQUFXLEtBQVg7RUFIRCxJQUFBO0NBS0MsQ0FBQSxDQUFXLEtBQVg7RUE5SUQ7O0FBaUpBLENBakpBLENBaUp5QixDQUFBLElBQWdCLENBQWpDLEtBQVI7O0FBRUEsQ0FuSkEsRUFtSlEsRUFBUixJQUFRO0NBQ1AsS0FBQSxXQUFBO0NBQUEsQ0FBQSxDQUFLLEtBQVEsS0FBUjtDQUFMLENBQ0EsQ0FBUSxFQUFSLENBREE7Q0FBQSxDQUVBLENBQ0MsT0FERDtDQUNDLENBQWlCLEVBQWpCLFdBQUEsSUFBQTtDQUFBLENBQ1ksRUFBWixNQUFBLElBREE7Q0FBQSxDQUVhLEVBQWIsT0FBQSxJQUZBO0NBQUEsQ0FHYyxFQUFkLFFBQUEsSUFIQTtDQUFBLENBSVcsRUFBWCxLQUFBLEVBSkE7Q0FIRCxHQUFBO0NBQUEsQ0FXQSxFQUFhLElBQUwsSUFBUjtBQUNBLENBQUEsRUFBQSxJQUFBLFFBQUE7Q0FDQyxDQUFLLEVBQUwsQ0FBWSxJQUFaO0NBQ0MsQ0FBRSxDQUFZLEVBQUwsQ0FBVCxvQkFBQTtDQUFBLENBQ1EsQ0FBQSxFQUFSLENBQUEsSUFBZ0UsTUFBeEQ7TUFIVjtDQUFBLEVBWkE7Q0FBQSxDQWdCQSxFQUFhLElBQUwsR0FBUjtDQUNpQyxFQUFTLENBQWYsQ0FBM0IsQ0FBMkIsR0FBM0I7Q0FsQk87O0FBeUJSLENBNUtBLEVBNEtnQixDQUFoQixJQUFRLENBQVM7Q0FDaEIsS0FBQSxDQUFBO0NBQUEsQ0FBQSxDQUFVLElBQVY7Q0FBQSxDQUNBLEVBQUEsR0FBTyxDQUFjLEtBQXJCO0NBREEsQ0FFQSxDQUFhLENBQWIsR0FBTyxDQUFjO0NBRnJCLENBR0EsRUFBQSxHQUFPLENBQWM7Q0FFckIsQ0FBQSxFQUFHLElBQVEsSUFBWDtDQUNDLEdBQUEsR0FBTyxPQUFQO0lBREQsRUFBQTtDQUdDLEdBQUEsR0FBTyxVQUFQO0lBUkQ7Q0FVQSxDQUFBLEVBQUcsR0FBZ0IsQ0FBUixXQUFYO0NBQ0MsR0FBQSxHQUFPLGNBQVA7SUFYRDtDQUFBLENBYUEsQ0FBYyxDQUFWLEdBQWlCLENBQXJCLEdBQWM7Q0FFTCxFQUFnQixHQUFBLEVBQWpCLENBQVIsSUFBQTtDQWhCZTs7QUE2QmhCLENBek1BLEVBeU1pQixHQUFYLENBQU4sQ0F6TUEifX0seyJvZmZzZXQiOnsibGluZSI6NjEyOCwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZlbmRvcnMuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbInZlbmRvcnMgPSBcbiAgIyBkb2N1bWVudGF0aW9uOiBodHRwOi8vbW9kZXJuaXpyLmNvbS9kb2NzL1xuICBNb2Rlcm5penIgICAgICAgICAgICA6IHJlcXVpcmUgJy4uL3ZlbmRvcnMvbW9kZXJuaXpyLmN1c3RvbS5qcydcblxuICAjIGRvY3VtZW50YXRpb246IGh0dHBzOi8vZ2l0aHViLmNvbS9qZXJlbXloYXJyaXMvTG9jYWxDb25uZWN0aW9uLmpzL3RyZWUvbWFzdGVyXG4gIExvY2FsQ29ubmVjdGlvbiAgICAgIDogcmVxdWlyZSAnLi4vdmVuZG9ycy9Mb2NhbENvbm5lY3Rpb24uanMnXG5cblxuICAjIGRvY3VtbnRhdGlvbjogaHR0cHM6Ly9naXRodWIuY29tL2pvZXdhbG5lcy9yZWNvbm5lY3Rpbmctd2Vic29ja2V0XG4gIFJlY29ubmVjdGluZ1dlYnNvY2tldDogcmVxdWlyZSAnLi4vdmVuZG9ycy9yZWNvbm5lY3Rpbmctd2Vic29ja2V0LmpzJ1xuXG4gICMgRG9jdW1lbnRhdGlvbjogaHR0cDovL2Nsb3VkaW5hcnkuY29tL2RvY3VtZW50YXRpb24vanF1ZXJ5X2ludGVncmF0aW9uXG4gIEpxdWVyeVVpV2lkZ2V0ICAgICAgIDogcmVxdWlyZSAnLi4vdmVuZG9ycy9qcXVlcnkudWkud2lkZ2V0LmpzJ1xuICBJZnJhbWVUcmFuc3BvcnQgICAgICA6IHJlcXVpcmUgJy4uL3ZlbmRvcnMvanF1ZXJ5LmlmcmFtZS10cmFuc3BvcnQuanMnXG4gIEZpbGVVcGxvYWQgICAgICAgICAgIDogcmVxdWlyZSAnLi4vdmVuZG9ycy9qcXVlcnkuZmlsZXVwbG9hZC5qcydcbiAgQ2xvdWRpbmFyeSAgICAgICAgICAgOiByZXF1aXJlICcuLi92ZW5kb3JzL2pxdWVyeS5jbG91ZGluYXJ5LmpzJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IHZlbmRvcnMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxHQUFBOztBQUFBLENBQUEsRUFFRSxJQUZGO0NBRUUsQ0FBQSxLQUF1QixFQUF2Qix1QkFBdUI7Q0FBdkIsQ0FHQSxLQUF1QixRQUF2QixnQkFBdUI7Q0FIdkIsQ0FPQSxLQUF1QixjQUF2QixpQkFBdUI7Q0FQdkIsQ0FVQSxLQUF1QixPQUF2QixrQkFBdUI7Q0FWdkIsQ0FXQSxLQUF1QixRQUF2Qix3QkFBdUI7Q0FYdkIsQ0FZQSxLQUF1QixHQUF2Qix1QkFBdUI7Q0FadkIsQ0FhQSxLQUF1QixHQUF2Qix1QkFBdUI7Q0FmekIsQ0FBQTs7QUFpQkEsQ0FqQkEsRUFpQmlCLEdBQVgsQ0FBTiJ9fSx7Im9mZnNldCI6eyJsaW5lIjo2MTQ0LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvYnV0dG9ucy9zdGFydF9yZWNvcmRpbmcuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbImFwcGNhc3QgPSByZXF1aXJlICdhcHAvY29udHJvbGxlcnMvYXBwY2FzdCdcblxubW9kdWxlLmV4cG9ydHMgPSAoIGRvbSApIC0+XG5cbiAgZG9tLmNsaWNrIC0+IFxuXG4gICAgaWYgbm90IGFwcGNhc3QuZ2V0ICdzdHJlYW1pbmc6b25saW5lJ1xuXG4gICAgICBjb25zb2xlLmVycm9yICctIGNhbnQgc3RhcnQgcmVjb3JkaW5nIGlmIG5vdCBzdHJlYW1pbmcnXG4gICAgICByZXR1cm5cblxuICAgIGNvbnNvbGUubG9nICcrIHN0YXJ0IHJlY29yZGluZycsIGFwcGNhc3QuZ2V0ICdpbnB1dF9kZXZpY2UnXG4gICAgXG4gICAgIyBwb3N0IHRvIGJhY2tlbmQgaW4gb3JkZXIgdG8gc3RhcnQgcmVjb3JkaW5nIHNldFxuXG4gICAgdXJsICA9IFwiL3RhcGUvc3RhcnQvcmVjb3JkaW5nXCJcbiAgICBkb25lID0gLT5cbiAgICAgIGNvbnNvbGUuaW5mbyAnKyByZWNvcmRpbmcgcG9zdCBkb25lIC0+JywgYXJndW1lbnRzXG4gICAgICBhcHBjYXN0LnNldCAncmVjb3JkaW5nJywgdHJ1ZVxuXG4gICAgZmFpbCA9IC0+XG4gICAgICBjb25zb2xlLmVycm9yICctIGZhaWxpbmcgdHJ5aW5nIHRvIHN0YXJ0IHJlY29yZGluZyAtPicsIGFyZ3VtZW50c1xuXG4gICAgIyBwb3N0IHRvIGJhY2tlbmQgaW4gb3JkZXIgdG8gc3RhcnQgcmVjb3JkaW5nXG4gICAgJC5wb3N0KCB1cmwgKS5kb25lKCBkb25lICkuZmFpbCggZmFpbCApIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsR0FBQTs7QUFBQSxDQUFBLEVBQVUsSUFBVixrQkFBVTs7QUFFVixDQUZBLEVBRWlCLEdBQVgsQ0FBTixFQUFtQjtDQUViLEVBQUQsRUFBSCxJQUFBO0NBRUUsT0FBQSxPQUFBO0FBQU8sQ0FBUCxFQUFPLENBQVAsR0FBYyxXQUFQO0NBRUwsSUFBQSxDQUFBLENBQU8sa0NBQVA7Q0FDQSxXQUFBO01BSEY7Q0FBQSxDQUtpQyxDQUFqQyxDQUFBLEdBQU8sT0FBMEIsS0FBakM7Q0FMQSxFQVNBLENBQUEsbUJBVEE7Q0FBQSxFQVVPLENBQVAsS0FBTztDQUNMLENBQXlDLEVBQXpDLEVBQUEsQ0FBTyxFQUFQLGlCQUFBO0NBQ1EsQ0FBaUIsQ0FBekIsQ0FBQSxHQUFPLElBQVAsRUFBQTtDQVpGLElBVU87Q0FWUCxFQWNPLENBQVAsS0FBTztDQUNHLENBQWdELEdBQXhELEVBQU8sRUFBUCxJQUFBLDJCQUFBO0NBZkYsSUFjTztDQUlOLEVBQUQsQ0FBQSxPQUFBO0NBcEJGLEVBQVU7Q0FGSyJ9fSx7Im9mZnNldCI6eyJsaW5lIjo2MTcwLCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvYnV0dG9ucy9zdGFydF9zdHJlYW0uY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbImFwcGNhc3QgPSByZXF1aXJlICdhcHAvY29udHJvbGxlcnMvYXBwY2FzdCdcblxubW9kdWxlLmV4cG9ydHMgPSAoIGRvbSApIC0+XG5cbiAgZG9tLmNsaWNrIC0+IFxuXG4gICAgaWYgbm90IGFwcGNhc3QuZ2V0ICdpbnB1dF9kZXZpY2UnXG5cbiAgICAgIGNvbnNvbGUuZXJyb3IgJy0gY2FudCBzdGFydCBzdHJlYW0gYmVmb3JlIHNlbGVjdGluZyBpbnB1dCBkZXZpY2UnXG4gICAgICByZXR1cm5cblxuICAgIGNvbnNvbGUubG9nICdzdGFydGluZyBzdHJlYW1pbmcgd2l0aCcsIGFwcGNhc3QuZ2V0ICdpbnB1dF9kZXZpY2UnXG4gICAgXG4gICAgYXBwY2FzdC5zdGFydF9zdHJlYW0gYXBwY2FzdC5nZXQgJ2lucHV0X2RldmljZSciXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxHQUFBOztBQUFBLENBQUEsRUFBVSxJQUFWLGtCQUFVOztBQUVWLENBRkEsRUFFaUIsR0FBWCxDQUFOLEVBQW1CO0NBRWIsRUFBRCxFQUFILElBQUE7QUFFUyxDQUFQLEVBQU8sQ0FBUCxHQUFjLE9BQVA7Q0FFTCxJQUFBLENBQUEsQ0FBTyw0Q0FBUDtDQUNBLFdBQUE7TUFIRjtDQUFBLENBS3VDLENBQXZDLENBQUEsR0FBTyxPQUFnQyxXQUF2QztDQUVRLEVBQWEsSUFBZCxJQUFQLENBQUEsRUFBcUI7Q0FUdkIsRUFBVTtDQUZLIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjYxODcsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9idXR0b25zL3N0b3BfcmVjb3JkaW5nLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJhcHBjYXN0ID0gcmVxdWlyZSAnYXBwL2NvbnRyb2xsZXJzL2FwcGNhc3QnXG5cbm1vZHVsZS5leHBvcnRzID0gKCBkb20gKSAtPlxuXG4gIGRvbS5jbGljayAtPiBcblxuICAgIGlmIG5vdCBhcHBjYXN0LmdldCAnc3RyZWFtOnJlY29yZGluZydcblxuICAgICAgY29uc29sZS5lcnJvciAnLSBjYW50IHN0b3AgcmVjb3JkaW5nIGlmIG5vdCByZWNvcmRpbmcnXG4gICAgICByZXR1cm5cblxuICAgIGNvbnNvbGUubG9nICcrIHN0b3BwaW5nIHRvIHJlY29yZCB3aXRoICcsIGFwcGNhc3QuZ2V0ICdpbnB1dF9kZXZpY2UnXG4gICAgXG4gICAgIyBwb3N0IHRvIGJhY2tlbmQgaW4gb3JkZXIgdG8gc3RhcnQgcmVjb3JkaW5nIHNldFxuXG4gICAgdXJsICA9IFwiL3RhcGUvc3RvcC9yZWNvcmRpbmdcIlxuICAgIGRvbmUgPSAtPlxuICAgICAgY29uc29sZS5pbmZvICcrIC90YXBlL3N0b3AvcmVjb3JkaW5nIHBvc3QgZG9uZSAtPicsIGFyZ3VtZW50c1xuXG4gICAgZmFpbCA9IC0+XG4gICAgICBjb25zb2xlLmVycm9yICctIC90YXBlL3N0b3AvcmVjb3JkaW5nIHBvc3QgZmFpbGVkIC0+JywgYXJndW1lbnRzXG5cbiAgICAjIHBvc3QgdG8gYmFja2VuZCBpbiBvcmRlciB0byBzdGFydCByZWNvcmRpbmdcbiAgICAkLnBvc3QoIHVybCApLmRvbmUoIGRvbmUgKS5mYWlsKCBmYWlsICkiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxHQUFBOztBQUFBLENBQUEsRUFBVSxJQUFWLGtCQUFVOztBQUVWLENBRkEsRUFFaUIsR0FBWCxDQUFOLEVBQW1CO0NBRWIsRUFBRCxFQUFILElBQUE7Q0FFRSxPQUFBLE9BQUE7QUFBTyxDQUFQLEVBQU8sQ0FBUCxHQUFjLFdBQVA7Q0FFTCxJQUFBLENBQUEsQ0FBTyxpQ0FBUDtDQUNBLFdBQUE7TUFIRjtDQUFBLENBSzBDLENBQTFDLENBQUEsR0FBTyxPQUFtQyxjQUExQztDQUxBLEVBU0EsQ0FBQSxrQkFUQTtDQUFBLEVBVU8sQ0FBUCxLQUFPO0NBQ0csQ0FBNEMsRUFBcEQsR0FBTyxFQUFQLElBQUEsd0JBQUE7Q0FYRixJQVVPO0NBVlAsRUFhTyxDQUFQLEtBQU87Q0FDRyxDQUErQyxHQUF2RCxFQUFPLEVBQVAsSUFBQSwwQkFBQTtDQWRGLElBYU87Q0FJTixFQUFELENBQUEsT0FBQTtDQW5CRixFQUFVO0NBRksifX0seyJvZmZzZXQiOnsibGluZSI6NjIxMiwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2J1dHRvbnMvc3RvcF9zdHJlYW0uY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbImFwcGNhc3QgPSByZXF1aXJlICdhcHAvY29udHJvbGxlcnMvYXBwY2FzdCdcblxubW9kdWxlLmV4cG9ydHMgPSAoIGRvbSApIC0+XG5cbiAgZG9tLmNsaWNrIC0+IFxuXG4gICAgaWYgbm90IGFwcGNhc3QuZ2V0ICdzdHJlYW1pbmc6b25saW5lJ1xuXG4gICAgICBjb25zb2xlLmVycm9yICctIGNhbnQgc3RvcCBzdHJlYW0gaWYgbm90IHN0cmVhbWluZydcbiAgICAgIHJldHVyblxuXG4gICAgY29uc29sZS5sb2cgJysgc3RvcGluZyBzdHJlYW1pbmcgd2l0aCcsIGFwcGNhc3QuZ2V0ICdpbnB1dF9kZXZpY2UnXG4gICAgXG4gICAgYXBwY2FzdC5zdG9wX3N0cmVhbSgpIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsR0FBQTs7QUFBQSxDQUFBLEVBQVUsSUFBVixrQkFBVTs7QUFFVixDQUZBLEVBRWlCLEdBQVgsQ0FBTixFQUFtQjtDQUViLEVBQUQsRUFBSCxJQUFBO0FBRVMsQ0FBUCxFQUFPLENBQVAsR0FBYyxXQUFQO0NBRUwsSUFBQSxDQUFBLENBQU8sOEJBQVA7Q0FDQSxXQUFBO01BSEY7Q0FBQSxDQUt3QyxDQUF4QyxDQUFBLEdBQU8sT0FBaUMsWUFBeEM7Q0FFUSxNQUFELElBQVA7Q0FURixFQUFVO0NBRksifX0seyJvZmZzZXQiOnsibGluZSI6NjIyOSwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2NvbXBvbmVudHMvY2xpY2tfdHJpZ2dlci5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiSG92ZXJUcmlnZ2VyID0gcmVxdWlyZSAnYXBwL3ZpZXdzL2NvbXBvbmVudHMvaG92ZXJfdHJpZ2dlcidcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBDbGlja1RyaWdnZXIgZXh0ZW5kcyBIb3ZlclRyaWdnZXJcblxuXHRzZXRfbGlzdGVuZXJzOiAoICkgLT5cblx0XHRAZG9tLm9uICdjbGljaycsIEB0b2dnbGVcblx0XHRhcHAud2luZG93Lm9uIFwiYm9keTpjbGlja2VkXCIsIEBjbG9zZVxuXG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSw0QkFBQTtHQUFBO2tTQUFBOztBQUFBLENBQUEsRUFBZSxJQUFBLEtBQWYsd0JBQWU7O0FBRWYsQ0FGQSxFQUV1QixHQUFqQixDQUFOO0NBRUM7Ozs7O0NBQUE7O0NBQUEsRUFBZSxNQUFBLElBQWY7Q0FDQyxDQUFBLENBQUksQ0FBSixFQUFBLENBQUE7Q0FDSSxDQUFKLENBQUcsQ0FBNEIsQ0FBL0IsQ0FBVSxLQUFWLEdBQUE7Q0FGRCxFQUFlOztDQUFmOztDQUYyQyJ9fSx7Im9mZnNldCI6eyJsaW5lIjo2MjU0LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvY29tcG9uZW50cy9mdWxsc2NyZWVuLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEZ1bGxzY3JlZW5cblx0ZmFjdG9yOiAxXG5cdGNvbnN0cnVjdG9yOiAoIEBkb20gKSAtPlxuXHRcdEBkb20uYWRkQ2xhc3MgJ2Z1bGxzY3JlZW4nXG5cdFx0aWYgQGRvbS5kYXRhICdmYWN0b3InXG5cdFx0XHRAZmFjdG9yID0gQGRvbS5kYXRhICdmYWN0b3InXG5cblx0XHRhcHAud2luZG93Lm9uICdyZXNpemUnLCBAb25fcmVzaXplXG5cdFx0ZG8gQG9uX3Jlc2l6ZVxuXG5cdG9uX3Jlc2l6ZTogKCApID0+XG5cdFx0QGRvbS5jc3NcbiBcdFx0XHQnd2lkdGgnIDogJzEwMCUnXG4gXHRcdFx0J2hlaWdodCcgOiAoYXBwLndpbmRvdy5oIC0gYXBwLnNldHRpbmdzLmhlYWRlcl9oZWlnaHQpKkBmYWN0b3JcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLE1BQUE7R0FBQSwrRUFBQTs7QUFBQSxDQUFBLEVBQXVCLEdBQWpCLENBQU47Q0FDQyxFQUFRLEdBQVI7O0NBQ2EsQ0FBQSxDQUFBLGlCQUFHO0NBQ2YsRUFEZSxDQUFEO0NBQ2QsNENBQUE7Q0FBQSxFQUFJLENBQUosSUFBQSxJQUFBO0NBQ0EsRUFBTyxDQUFQLElBQUc7Q0FDRixFQUFVLENBQVQsRUFBRCxFQUFVO01BRlg7Q0FBQSxDQUlBLENBQUcsQ0FBSCxFQUFVLEVBQVYsQ0FBQTtDQUpBLEdBS0csS0FBSDtDQVBELEVBQ2E7O0NBRGIsRUFTVyxNQUFYO0NBQ0UsRUFBRyxDQUFILE9BQUQ7Q0FDRSxDQUFVLElBQVYsQ0FBQTtDQUFBLENBQ1csQ0FBSSxDQUF5QyxFQUF4RCxFQUFBLEtBQVc7Q0FISCxLQUNWO0NBVkQsRUFTVzs7Q0FUWDs7Q0FERCJ9fSx7Im9mZnNldCI6eyJsaW5lIjo2Mjg0LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvY29tcG9uZW50cy9ob3Zlci5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiaGFwcGVucyA9IHJlcXVpcmUgJ2hhcHBlbnMnXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEhvdmVyXG5cdGNvbnN0cnVjdG9yOiAoIEBkb20gKSAtPlxuXHRcdHJldHVybiBpZiBhcHAuc2V0dGluZ3MudG91Y2hfZGV2aWNlXG5cblx0XHRoYXBwZW5zIEBcblx0XHRcblx0XHRAZG9tLm9uICdtb3VzZW92ZXInLCBAb25fbW91c2Vfb3ZlclxuXHRcdEBkb20ub24gJ21vdXNlbGVhdmUnLCBAb25fbW91c2VfbGVhdmVcblxuXHRcdEBkb20uYWRkQ2xhc3MgJ2hvdmVyX29iamVjdCdcblxuXHRvbl9tb3VzZV9vdmVyOiAoICkgPT5cblx0XHRAZG9tLmFkZENsYXNzICdob3ZlcmVkJ1xuXG5cdG9uX21vdXNlX2xlYXZlOiAoICkgPT5cblx0XHRAZG9tLnJlbW92ZUNsYXNzICdob3ZlcmVkJyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFVBQUE7R0FBQSwrRUFBQTs7QUFBQSxDQUFBLEVBQVUsSUFBVixFQUFVOztBQUNWLENBREEsRUFDdUIsR0FBakIsQ0FBTjtDQUNjLENBQUEsQ0FBQSxZQUFHO0NBQ2YsRUFEZSxDQUFEO0NBQ2Qsc0RBQUE7Q0FBQSxvREFBQTtDQUFBLEVBQWEsQ0FBYixJQUFzQixJQUF0QjtDQUFBLFdBQUE7TUFBQTtDQUFBLEdBRUEsR0FBQTtDQUZBLENBSUEsQ0FBSSxDQUFKLE9BQUEsRUFBQTtDQUpBLENBS0EsQ0FBSSxDQUFKLFFBQUEsRUFBQTtDQUxBLEVBT0ksQ0FBSixJQUFBLE1BQUE7Q0FSRCxFQUFhOztDQUFiLEVBVWUsTUFBQSxJQUFmO0NBQ0UsRUFBRyxDQUFILElBQUQsQ0FBQSxFQUFBO0NBWEQsRUFVZTs7Q0FWZixFQWFnQixNQUFBLEtBQWhCO0NBQ0UsRUFBRyxDQUFILEtBQUQsRUFBQTtDQWRELEVBYWdCOztDQWJoQjs7Q0FGRCJ9fSx7Im9mZnNldCI6eyJsaW5lIjo2MzE3LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvY29tcG9uZW50cy9ob3Zlcl90cmlnZ2VyLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbkFkZHMgdGhlIGNsYXNzICdob3ZlcmVkJyB0byB0aGUgZWxlbWVudCBhbmQgdG8gdGhlIHRhcmdldFxuVGhlIGNsYXNzIGlzIHRvZ2dsZWQgb24gbW91c2VvdmVyL21vdXNlbGVhdmUgZm9yIGRlc2t0b3BzXG5hbmQgb24gY2xpY2sgZm9yIHRvdWNoIGRldmljZXNcbiMjI1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEhvdmVyVHJpZ2dlclxuXHRvcGVuZWQ6IGZhbHNlXG5cdGtsYXNzOiBcImhvdmVyZWRcIlxuXG5cdGNvbnN0cnVjdG9yOiAoIEBkb20gKSAtPlxuXHRcdEB0YXJnZXQgPSAkIEBkb20uZGF0YSAndGFyZ2V0J1xuXG5cdFx0aWYgQHRhcmdldC5sZW5ndGggPD0gMFxuXHRcdFx0bG9nIFwiW0hvdmVyVHJpZ2dlcl0gZXJyb3IuIHRhcmdldCBub3QgZm91bmRcIiwgQGRvbS5kYXRhKCAndGFyZ2V0JyApXG5cdFx0XHRyZXR1cm5cblxuXHRcdEBkb20uYWRkQ2xhc3MgXCJob3Zlcl9kcm9wZG93bl90cmlnZ2VyXCJcblx0XHRAc2V0X2xpc3RlbmVycygpXG5cblx0XHRhcHAub24gXCJkcm9wZG93bjpvcGVuZWRcIiwgQG9uX2Ryb3Bkb3duX29wZW5lZFxuXHRcdGFwcC5vbiBcImRyb3Bkb3duOmNsb3NlZFwiLCBAb25fZHJvcGRvd25fY2xvc2VkXG5cblx0c2V0X2xpc3RlbmVyczogKCApIC0+XG5cblx0XHRpZiBhcHAuc2V0dGluZ3MudG91Y2hfZGV2aWNlXG5cdFx0XHRAZG9tLm9uICdjbGljaycsIEB0b2dnbGVcblx0XHRlbHNlXG5cdFx0XHRAZG9tLm9uICdtb3VzZW92ZXInLCBAb3BlblxuXHRcdFx0QHRhcmdldC5vbiAnbW91c2VsZWF2ZScsIEBjbG9zZVxuXG5cdFx0YXBwLndpbmRvdy5vbiBcImJvZHk6Y2xpY2tlZFwiLCBAY2xvc2VcblxuXHR0b2dnbGU6ICggZSApID0+XG5cdFx0aWYgQG9wZW5lZFxuXHRcdFx0ZG8gQGNsb3NlXG5cdFx0ZWxzZVxuXHRcdFx0ZG8gQG9wZW5cblxuXHRcdGUuc3RvcFByb3BhZ2F0aW9uKClcblxuXG5cblx0b3BlbjogKCApID0+XG5cdFx0cmV0dXJuIGlmIEBvcGVuZWRcblx0XHRAb3BlbmVkID0gdHJ1ZVxuXG5cdFx0QGRvbS5hZGRDbGFzcyBAa2xhc3Ncblx0XHRAdGFyZ2V0LmFkZENsYXNzIEBrbGFzc1xuXG5cdFx0YXBwLmVtaXQgXCJkcm9wZG93bjpvcGVuZWRcIiwgQHVpZFxuXG5cdGNsb3NlOiAoICkgPT5cblx0XHRyZXR1cm4gaWYgbm90IEBvcGVuZWRcblx0XHRAb3BlbmVkID0gZmFsc2VcblxuXHRcdEBkb20ucmVtb3ZlQ2xhc3MgQGtsYXNzXG5cdFx0QHRhcmdldC5yZW1vdmVDbGFzcyBAa2xhc3NcblxuXHRcdGFwcC5lbWl0IFwiZHJvcGRvd246Y2xvc2VkXCIsIEB1aWRcblxuXHRvbl9kcm9wZG93bl9vcGVuZWQ6ICggZGF0YSApID0+XG5cdFx0QGNsb3NlKCkgaWYgZGF0YSBpc250IEB1aWRcblxuXHRvbl9kcm9wZG93bl9jbG9zZWQ6ICggZGF0YSApID0+XG5cblxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztDQUFBO0NBQUEsR0FBQSxRQUFBO0dBQUEsK0VBQUE7O0FBTUEsQ0FOQSxFQU11QixHQUFqQixDQUFOO0NBQ0MsRUFBUSxFQUFSLENBQUE7O0NBQUEsRUFDTyxFQUFQLElBREE7O0NBR2EsQ0FBQSxDQUFBLG1CQUFHO0NBQ2YsRUFEZSxDQUFEO0NBQ2QsOERBQUE7Q0FBQSw4REFBQTtDQUFBLG9DQUFBO0NBQUEsa0NBQUE7Q0FBQSxzQ0FBQTtDQUFBLEVBQVUsQ0FBVixFQUFBLEVBQVk7Q0FFWixHQUFBLEVBQVU7Q0FDVCxDQUE4QyxDQUE5QyxDQUErQyxFQUEvQyxFQUE4QyxnQ0FBOUM7Q0FDQSxXQUFBO01BSkQ7Q0FBQSxFQU1JLENBQUosSUFBQSxnQkFBQTtDQU5BLEdBT0EsU0FBQTtDQVBBLENBU0EsQ0FBRyxDQUFILGFBQUEsQ0FBQTtDQVRBLENBVUEsQ0FBRyxDQUFILGFBQUEsQ0FBQTtDQWRELEVBR2E7O0NBSGIsRUFnQmUsTUFBQSxJQUFmO0NBRUMsRUFBTSxDQUFOLElBQWUsSUFBZjtDQUNDLENBQUEsQ0FBSSxDQUFILEVBQUQsQ0FBQTtNQUREO0NBR0MsQ0FBQSxDQUFJLENBQUgsRUFBRCxLQUFBO0NBQUEsQ0FDQSxFQUFDLENBQUQsQ0FBQSxNQUFBO01BSkQ7Q0FNSSxDQUFKLENBQUcsQ0FBNEIsQ0FBL0IsQ0FBVSxLQUFWLEdBQUE7Q0F4QkQsRUFnQmU7O0NBaEJmLEVBMEJRLEdBQVIsR0FBVTtDQUNULEdBQUEsRUFBQTtDQUNDLEdBQUksQ0FBSixDQUFHO01BREo7Q0FHQyxHQUFJLEVBQUQ7TUFISjtDQUtDLFVBQUQsSUFBQTtDQWhDRCxFQTBCUTs7Q0ExQlIsRUFvQ00sQ0FBTixLQUFNO0NBQ0wsR0FBQSxFQUFBO0NBQUEsV0FBQTtNQUFBO0NBQUEsRUFDVSxDQUFWLEVBQUE7Q0FEQSxFQUdJLENBQUosQ0FBQSxHQUFBO0NBSEEsR0FJQSxDQUFBLENBQU8sRUFBUDtDQUVJLENBQXdCLENBQXpCLENBQUgsT0FBQSxNQUFBO0NBM0NELEVBb0NNOztDQXBDTixFQTZDTyxFQUFQLElBQU87QUFDUSxDQUFkLEdBQUEsRUFBQTtDQUFBLFdBQUE7TUFBQTtDQUFBLEVBQ1UsQ0FBVixDQURBLENBQ0E7Q0FEQSxFQUdJLENBQUosQ0FBQSxNQUFBO0NBSEEsR0FJQSxDQUFBLENBQU8sS0FBUDtDQUVJLENBQXdCLENBQXpCLENBQUgsT0FBQSxNQUFBO0NBcERELEVBNkNPOztDQTdDUCxFQXNEb0IsQ0FBQSxLQUFFLFNBQXRCO0NBQ0MsRUFBQSxDQUFBLENBQXNCO0NBQXJCLEdBQUEsQ0FBRCxRQUFBO01BRG1CO0NBdERwQixFQXNEb0I7O0NBdERwQixFQXlEb0IsQ0FBQSxLQUFFLFNBQXRCOztDQXpEQTs7Q0FQRCJ9fSx7Im9mZnNldCI6eyJsaW5lIjo2NDAyLCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvY29tcG9uZW50cy9pbWFnZV91cGxvYWRlci5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsicmVxdWlyZSAnaGFwcGVucydcbkNsb3VkaW5hcnkgPSByZXF1aXJlICdhcHAvY29udHJvbGxlcnMvY2xvdWRpbmFyeSdcblxuIyMjXG5VbnNpZ25lZCB1cGxvYWQgdG8gQ2xvdWRpbmFyeVxuaHR0cDovL2Nsb3VkaW5hcnkuY29tL2Jsb2cvZGlyZWN0X3VwbG9hZF9tYWRlX2Vhc3lfZnJvbV9icm93c2VyX29yX21vYmlsZV9hcHBfdG9fdGhlX2Nsb3VkXG4jIyNcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEltYWdlVXBsb2FkZXIgXG5cdGNvbnN0cnVjdG9yOiAoZG9tKSAtPlxuXHRcdGhhcHBlbnMgQFxuXHRcdFxuXHRcdCMgR2V0IHRoZSBjb25maWcgdmFsdWVzIGZyb20gdGhlIGhpZGRlbiBmaWxlc1xuXHRcdGFwaV9rZXkgICAgID0gZG9tLmZpbmQoICcuYXBpX2tleScgKS52YWwoKVxuXHRcdGNsb3VkX25hbWUgID0gZG9tLmZpbmQoICcuY2xvdWRfbmFtZScgKS52YWwoKVxuXHRcdHVuc2lnbmVkX2lkID0gZG9tLmZpbmQoICcudW5zaWduZWRfaWQnICkudmFsKClcblxuXHRcdCMgU2V0IHRoZSBjb25maWcgb24gdGhlIGNvbnRyb2xsZXJcblx0XHRDbG91ZGluYXJ5LnNldF9jb25maWdcblx0XHRcdGNsb3VkX25hbWUgIDogY2xvdWRfbmFtZVxuXHRcdFx0YXBpX2tleSAgICAgOiBhcGlfa2V5XG5cdFx0XHR1bnNpZ25lZF9pZCA6IHVuc2lnbmVkX2lkXG5cblx0XHRwcm9ncmVzcyA9IGRvbS5maW5kICcucHJvZ3Jlc3MnXG5cblx0XHQjIEluaXRpYWxpc2UgdGhlIGZvcm0gd2l0aCBjbG91ZGluYXJ5XG5cdFx0Q2xvdWRpbmFyeS5pbml0aWFsaXNlX2Zvcm0gZG9tLmZpbmQoICdmb3JtJyApLCAoZm9ybSkgLT5cblx0XHRcdCMgTGlzdGVuIHRvIGV2ZW50c1xuXHRcdFx0Zm9ybS5vbiAnY2xvdWRpbmFyeWRvbmUnLCBvbl91cGxvYWRfY29tcGxldGVcblx0XHRcdGZvcm0ub24gJ2ZpbGV1cGxvYWRzdGFydCcsIG9uX3VwbG9hZF9zdGFydFxuXHRcdFx0Zm9ybS5vbiAnZmlsZXVwbG9hZHByb2dyZXNzJywgb25fdXBsb2FkX3Byb2dyZXNzXG5cdFx0XHRmb3JtLm9uICdmaWxldXBsb2FkZmFpbCcsIG9uX3VwbG9hZF9mYWlsXG5cblxuXHRcdHJlZiA9IEBcblx0XHRvbl91cGxvYWRfc3RhcnQgPSAoZSwgZGF0YSkgLT5cblx0XHRcdGxvZyBcIltDbG91ZGluYXJ5XSBvbl91cGxvYWRfc3RhcnRcIiwgZSwgZGF0YVxuXG5cdFx0XHRwcm9ncmVzcy5yZW1vdmVDbGFzcyAnaGlkZSdcblxuXHRcdFx0cmVmLmVtaXQgJ3N0YXJ0ZWQnLCBkYXRhXG5cblx0XHRcblx0XHRvbl91cGxvYWRfcHJvZ3Jlc3MgPSAoZSwgZGF0YSkgLT5cblx0XHRcdHBlcmNlbnQgPSBkYXRhLmxvYWRlZCAvIGRhdGEudG90YWwgKiAxMDBcblx0XHRcdGxvZyBcIltDbG91ZGluYXJ5XSBvbl91cGxvYWRfcHJvZ3Jlc3NcIiwgcGVyY2VudCArIFwiJVwiXG5cblx0XHRcdHByb2dyZXNzLmNzcyBcIndpZHRoXCIsIFwiI3twZXJjZW50fSVcIlxuXG5cdFx0XHRyZWYuZW1pdCAncHJvZ3Jlc3MnLCBwcm9ncmVzc1xuXG5cblx0XHRvbl91cGxvYWRfY29tcGxldGUgPSAoZSwgZGF0YSkgLT4gXG5cdFx0XHRsb2cgXCJbSW1hZ2VVcGxvYWRlcl0gb25fdXBsb2FkX2NvbXBsZXRlXCIsIGUsIGRhdGFcblx0XHRcdFxuXHRcdFx0cHJvZ3Jlc3MuYWRkQ2xhc3MgJ2hpZGUnXG5cblx0XHRcdHJlZi5lbWl0ICdjb21wbGV0ZWQnLCBkYXRhXG5cblxuXHRcdG9uX3VwbG9hZF9mYWlsID0gKGUsIGRhdGEpIC0+XG5cdFx0XHRsb2cgXCJbQ2xvdWRpbmFyeV0gb25fdXBsb2FkX2ZhaWxcIiwgZVxuXG5cdFx0XHRyZWYuZW1pdCAnZXJyb3InLCBlXG5cblxuXG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxxQkFBQTs7QUFBQSxDQUFBLE1BQUEsRUFBQTs7QUFDQSxDQURBLEVBQ2EsSUFBQSxHQUFiLGtCQUFhOztDQUViOzs7O0NBSEE7O0FBU0EsQ0FUQSxFQVN1QixHQUFqQixDQUFOO0NBQ2MsQ0FBQSxDQUFBLG9CQUFDO0NBQ2IsT0FBQSxnSEFBQTtDQUFBLEdBQUEsR0FBQTtDQUFBLEVBR2MsQ0FBZCxHQUFBLEdBQWM7Q0FIZCxFQUljLENBQWQsTUFBQSxHQUFjO0NBSmQsRUFLYyxDQUFkLE9BQUEsR0FBYztDQUxkLEdBUUEsTUFBVTtDQUNULENBQWMsSUFBZCxJQUFBO0NBQUEsQ0FDYyxJQUFkLENBQUE7Q0FEQSxDQUVjLElBQWQsS0FBQTtDQVhELEtBUUE7Q0FSQSxFQWFXLENBQVgsSUFBQSxHQUFXO0NBYlgsQ0FnQitDLENBQWpCLENBQTlCLEVBQTJCLEdBQXFCLENBQXRDLEtBQVY7Q0FFQyxDQUFBLEVBQUksRUFBSixVQUFBLEVBQUE7Q0FBQSxDQUNBLEVBQUksRUFBSixTQUFBLEVBQUE7Q0FEQSxDQUVBLEVBQUksRUFBSixZQUFBLEVBQUE7Q0FDSyxDQUFMLEVBQUksU0FBSixDQUFBLEVBQUE7Q0FMRCxJQUErQztDQWhCL0MsRUF3QkEsQ0FBQTtDQXhCQSxDQXlCc0IsQ0FBSixDQUFsQixLQUFtQixNQUFuQjtDQUNDLENBQW9DLENBQXBDLENBQUEsRUFBQSx3QkFBQTtDQUFBLEtBRUEsRUFBUSxHQUFSO0NBRUksQ0FBZ0IsQ0FBakIsQ0FBSCxLQUFBLElBQUE7Q0E5QkQsSUF5QmtCO0NBekJsQixDQWlDeUIsQ0FBSixDQUFyQixLQUFzQixTQUF0QjtDQUNDLE1BQUEsR0FBQTtDQUFBLEVBQVUsQ0FBSSxDQUFKLENBQVYsQ0FBQTtDQUFBLENBQ3VDLENBQXZDLEdBQUEsQ0FBdUMsMEJBQXZDO0NBREEsQ0FHc0IsQ0FBdEIsR0FBQSxDQUFBLENBQVE7Q0FFSixDQUFpQixDQUFsQixDQUFILElBQUEsRUFBQSxHQUFBO0NBdkNELElBaUNxQjtDQWpDckIsQ0EwQ3lCLENBQUosQ0FBckIsS0FBc0IsU0FBdEI7Q0FDQyxDQUEwQyxDQUExQyxDQUFBLEVBQUEsOEJBQUE7Q0FBQSxLQUVBLEVBQVE7Q0FFSixDQUFrQixDQUFuQixDQUFILE9BQUEsRUFBQTtDQS9DRCxJQTBDcUI7Q0ExQ3JCLENBa0RxQixDQUFKLENBQWpCLEtBQWtCLEtBQWxCO0NBQ0MsQ0FBbUMsQ0FBbkMsR0FBQSx1QkFBQTtDQUVJLENBQWMsQ0FBZixDQUFILEdBQUEsTUFBQTtDQXJERCxJQWtEaUI7Q0FuRGxCLEVBQWE7O0NBQWI7O0NBVkQifX0seyJvZmZzZXQiOnsibGluZSI6NjQ2MywiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2NvbXBvbmVudHMvaW5wdXRfZGV2aWNlcy5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiYXBwY2FzdCAgPSByZXF1aXJlICdhcHAvY29udHJvbGxlcnMvYXBwY2FzdCdcbmhhcHBlbnMgPSByZXF1aXJlICdoYXBwZW5zJ1xuXG5tb2R1bGUuZXhwb3J0cyA9ICggZG9tICkgLT5cblxuICBoYXBwZW5zIEBcblxuICBkb20ub24gJ2NoYW5nZScsIC0+XG5cbiAgICBhcHBjYXN0LnNldCAnaW5wdXRfZGV2aWNlJywgZG9tLnZhbCgpXG5cbiAgYXBwY2FzdC5vbiAnaW5wdXRfZGV2aWNlcycsICggZGV2aWNlcyApIC0+XG5cbiAgICAjIGNsZWFyIG9wdGlvbnNcbiAgICAjIFRPRE86IGtlZXAgdGhlIGNob29zZW4gb3B0aW9uIHNlbGVjdGVkXG4gICAgIyBUT0RPOiBsZXQgdGhlIHVzZXIga25vdyBpZiBwcmV2aW91bHkgc2VsZWN0ZWQgaXNuJ3QgYXZhaWxhYmxlIGFueW1vcmVcbiAgICBkb20uaHRtbCBcIiBcIlxuICAgIGZvciBkZXZpY2UgaW4gZGV2aWNlc1xuICAgICAgZG9tLmFwcGVuZCBcIjxvcHRpb24gdmFsdWU9JyN7ZGV2aWNlfSc+I3tkZXZpY2V9PC9vcHRpb24+XCIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxZQUFBOztBQUFBLENBQUEsRUFBVyxJQUFYLGtCQUFXOztBQUNYLENBREEsRUFDVSxJQUFWLEVBQVU7O0FBRVYsQ0FIQSxFQUdpQixHQUFYLENBQU4sRUFBbUI7Q0FFakIsQ0FBQSxFQUFBLEdBQUE7Q0FBQSxDQUVBLENBQUcsS0FBSCxDQUFpQjtDQUVQLENBQW9CLENBQTVCLElBQU8sSUFBUCxHQUFBO0NBRkYsRUFBaUI7Q0FJVCxDQUFSLENBQTRCLElBQXJCLEVBQVAsTUFBQTtDQUtFLE9BQUEsa0JBQUE7Q0FBQSxFQUFHLENBQUg7QUFDQSxDQUFBO1VBQUEsb0NBQUE7NEJBQUE7Q0FDRSxFQUFHLENBQVMsRUFBWixLQUFBLE1BQVk7Q0FEZDtxQkFOMEI7Q0FBNUIsRUFBNEI7Q0FSYiJ9fSx7Im9mZnNldCI6eyJsaW5lIjo2NDg4LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvY29tcG9uZW50cy9sb2dvdXRfbGluay5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsidXNlcl9jb250cm9sbGVyID0gcmVxdWlyZSAnYXBwL2NvbnRyb2xsZXJzL3VzZXInXG5cbm1vZHVsZS5leHBvcnRzID0gKCBkb20gKSAtPlxuXG5cdGRvbS5vbiAnY2xpY2snLCAoIGUgKSAtPlxuXHRcdGUucHJldmVudERlZmF1bHQoKVxuXHRcdGUuc3RvcFByb3BhZ2F0aW9uKClcblxuXHRcdHVzZXJfY29udHJvbGxlci5sb2dvdXQgKCBlcnJvciApIC0+XG5cbiAgICAgIGlmIGVycm9yIHRoZW4gY29uc29sZS5lcnJvciBlcnJvclxuICAgICAgXG5cdFx0XHRsb2cgXCJbTG9nb3V0TGlua10gbG9nb3V0IHN1Y2NlZGVlZC5cIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFdBQUE7O0FBQUEsQ0FBQSxFQUFrQixJQUFBLFFBQWxCLE9BQWtCOztBQUVsQixDQUZBLEVBRWlCLEdBQVgsQ0FBTixFQUFtQjtDQUVkLENBQUosQ0FBRyxJQUFILEVBQUE7Q0FDQyxHQUFBLFVBQUE7Q0FBQSxHQUNBLFdBQUE7Q0FEQSxFQUd1QixDQUF2QixDQUF1QixDQUF2QixHQUF5QixNQUFWO0NBRVgsR0FBRyxDQUFILENBQUE7Q0FBc0IsSUFBUixFQUFPLFFBQVA7UUFGSztDQUF2QixJQUF1QjtDQUlsQixFQUFKLFFBQUEscUJBQUE7Q0FSRixFQUFnQjtDQUZBIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjY1MDcsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9jb21wb25lbnRzL21vZGFsLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IGNsYXNzIE1vZGFsXG5cdG9wZW5lZDogZmFsc2Vcblx0Y29uc3RydWN0b3I6ICggQGRvbSApIC0+XG5cdFx0QG92ZXJsYXkgPSAkICcubWRfb3ZlcmxheSdcblxuXG5cdG9wZW46ICggKSAtPlxuXHRcdHJldHVybiBpZiBAb3BlbmVkXG5cdFx0QG9wZW5lZCA9IHRydWVcblxuXHRcdEBkb20uYWRkQ2xhc3MgJ21kX3Nob3cnXG5cblx0XHRAb3ZlcmxheS5vZmYoICdjbGljaycgKS5vbiggJ2NsaWNrJywgQGNsb3NlIClcblxuXHRjbG9zZTogKCApID0+XG5cdFx0cmV0dXJuIGlmIG5vdCBAb3BlbmVkXG5cdFx0QG9wZW5lZCA9IGZhbHNlXG5cblx0XHRAZG9tLnJlbW92ZUNsYXNzICdtZF9zaG93J1x0XHQiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxDQUFBO0dBQUEsK0VBQUE7O0FBQUEsQ0FBQSxFQUF1QixHQUFqQixDQUFOO0NBQ0MsRUFBUSxFQUFSLENBQUE7O0NBQ2EsQ0FBQSxDQUFBLFlBQUc7Q0FDZixFQURlLENBQUQ7Q0FDZCxvQ0FBQTtDQUFBLEVBQVcsQ0FBWCxHQUFBLE1BQVc7Q0FGWixFQUNhOztDQURiLEVBS00sQ0FBTixLQUFNO0NBQ0wsR0FBQSxFQUFBO0NBQUEsV0FBQTtNQUFBO0NBQUEsRUFDVSxDQUFWLEVBQUE7Q0FEQSxFQUdJLENBQUosSUFBQSxDQUFBO0NBRUMsQ0FBRCxDQUFBLENBQUMsQ0FBRCxFQUFRLElBQVI7Q0FYRCxFQUtNOztDQUxOLEVBYU8sRUFBUCxJQUFPO0FBQ1EsQ0FBZCxHQUFBLEVBQUE7Q0FBQSxXQUFBO01BQUE7Q0FBQSxFQUNVLENBQVYsQ0FEQSxDQUNBO0NBRUMsRUFBRyxDQUFILEtBQUQsRUFBQTtDQWpCRCxFQWFPOztDQWJQOztDQUREIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjY1NDIsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9jb21wb25lbnRzL21vZGFsX2hhbmRsZXIuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gY2xhc3MgTW9kYWxIYW5kbGVyXG5cdGNvbnN0cnVjdG9yOiAoIEBkb20gKSAtPlxuXHRcdHZpZXcub25jZSAnYmluZGVkJywgQG9uX3JlYWR5XG5cblx0b25fcmVhZHk6ICggKSA9PlxuXHRcdG1vZGFsX3RhcmdldCA9IHZpZXcuZ2V0X2J5X2RvbSBAZG9tLmRhdGEoICdtb2RhbCcgKVxuXHRcdEBkb20ub24gJ2NsaWNrJywgLT4gbW9kYWxfdGFyZ2V0Lm9wZW4oKSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFFBQUE7R0FBQSwrRUFBQTs7QUFBQSxDQUFBLEVBQXVCLEdBQWpCLENBQU47Q0FDYyxDQUFBLENBQUEsbUJBQUc7Q0FDZixFQURlLENBQUQ7Q0FDZCwwQ0FBQTtDQUFBLENBQW9CLEVBQXBCLElBQUE7Q0FERCxFQUFhOztDQUFiLEVBR1UsS0FBVixDQUFVO0NBQ1QsT0FBQSxJQUFBO0NBQUEsRUFBZSxDQUFmLEdBQStCLEdBQWhCLEVBQWY7Q0FDQyxDQUFELENBQUksQ0FBSCxHQUFELEVBQWlCLEVBQWpCO0NBQWlDLEdBQWIsUUFBWSxDQUFaO0NBQXBCLElBQWlCO0NBTGxCLEVBR1U7O0NBSFY7O0NBREQifX0seyJvZmZzZXQiOnsibGluZSI6NjU2NiwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2NvbXBvbmVudHMvcGxheWVyLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJhcHBjYXN0ICA9IHJlcXVpcmUgJ2FwcC9jb250cm9sbGVycy9hcHBjYXN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9ICggZG9tICkgLT5cblxuICAjIHNob3J0Y3V0IHRvIGRvbSB0YWdzXG4gIGF1ZGlvID0gZG9tLmZpbmQgJ2F1ZGlvJ1xuICB2dSAgICA9IGRvbS5maW5kICcudnUnXG4gIFxuICAjIGdyYWJzIHN0cmVhbSB1cmwgZnJvbSBET00gYXR0cmlidXRlXG4gIHN0cmVhbSA9IGF1ZGlvLmRhdGEgJ3NyYydcblxuICAjIGhpZGUgaXRlbXMgd2hlbiBpbml0aWFsaXppbmdcbiAgYXVkaW8uaGlkZSgpXG5cbiAgYXBwY2FzdC5vbiAnY29ubmVjdGVkJywgKCBzdGF0dXMgKSAtPlxuXG4gICAgaWYgc3RhdHVzXG4gICAgICBkb20uZmluZCggJy5zdGF0dXMnICkuaHRtbCAnLi4uIHdhaXRpbmcgc3RyZWFtIHRvIHN0YXJ0IC4uLidcbiAgICBlbHNlXG4gICAgICBkb20uZmluZCggJy5zdGF0dXMnICkuaHRtbCAnLi4uIHdhaXRpbmcgQXBwQ2FzdCB0byBzdGFydCAuLi4nXG5cbiAgYXBwY2FzdC5vbiBcInN0cmVhbTplcnJvclwiLCAoIGVycm9yICkgLT5cbiAgICBpZiBub3QgZXJyb3IgdGhlbiByZXR1cm5cblxuICAgIGRvbS5maW5kKCAnLnN0YXR1cycgKS5odG1sIFwiLi4uICN7ZXJyb3J9IC4uLlwiXG5cbiAgIyB0ZW1wb3Jhcnkgc29sdXRpb24gd2hpbGUgd2UgZG9uJ3QgaGF2ZSBhcHBjYXN0cyB0byB0aGUgd2Vic2VydmVyXG4gICMgY2hlY2sgc3RyZWFtIHN0YXR1cyBhbmQgcmV0cmllcyAxMDBtcyBhZnRlciByZXNwb25zZVxuICBjaGVja19zdHJlYW0gPSAtPlxuXG4gICAgJC5nZXQgc3RyZWFtLCAoIGVycm9yLCByZXNwb25zZSApIC0+XG5cbiAgICAgIGlmIGVycm9yXG5cbiAgICAgICAgIyB0cnkgYWdhaW5cbiAgICAgICAgZGVsYXkgMTAwLCBjaGVja19zdHJlYW1cblxuICAgICAgICByZXR1cm4gY29uc29sZS5lcnJvciAnLSBlcnJvciBsb2FkaW5nIHN0cmVhbWluZydcblxuICAgICAgY29uc29sZS53YXJuICcrIGFsbCBnb29kISdcblxuICAjIFRPRE86IFNldCBBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4gb24gc3RyZWFtaW5nIHNlcnZlciBzbyBqYXZhc2NyaXB0XG4gICMgd2lsbCBiZSBhYmxlIHRvIGNoZWNrIHN0cmVhbSBzdGF0dXNcblxuICAjIGRvIGNoZWNrX3N0cmVhbVxuXG5cbiAgIyByZWxvYWQgYXVkaW8gdGFnXG4gIHN0YXJ0X2F1ZGlvID0gLT4gXG4gICAgYXVkaW8uYXR0ciAnc3JjJywgYXVkaW8uZGF0YSAnc3JjJ1xuICAgIGF1ZGlvLnNob3coKVxuXG4gIHN0b3BfYXVkaW8gPSAtPlxuICAgIGF1ZGlvLnN0b3AoKVxuICAgIGF1ZGlvLmhpZGUoKVxuXG4gICMgdGVtcG9yYXJ5IGhhY2sgdG8gc3RhcnQgYXVkaW8gb25seSBhZnRlciBzdHJlYW0gc3RhcnRzXG4gIGFwcGNhc3Qub24gJ3N0cmVhbTpvbmxpbmUnLCAoIHN0YXR1cyApIC0+XG5cbiAgICBpZiBzdGF0dXNcbiAgICAgIHN0YXJ0X2F1ZGlvKClcbiAgICBlbHNlXG4gICAgICBzdG9wX2F1ZGlvKClcblxuICAjIGNvbnNvbGUud2FybiBcImxpc3RlbmluZyBmb3IgdnVcIlxuICAjIHRlbXBvcmFyeSBoYWNrIHRvIHN0YXJ0IGF1ZGlvIG9ubHkgYWZ0ZXIgc3RyZWFtIHN0YXJ0c1xuICBhcHBjYXN0Lm9uICdzdHJlYW06dnUnLCAoIG1ldGVyICkgLT5cblxuICAgIHZ1LmZpbmQoICcubWV0ZXJfbGVmdCcgKS53aWR0aCBtZXRlclswXSAqIDEwMDBcbiAgICB2dS5maW5kKCAnLm1ldGVyX3JpZ2h0JyApLndpZHRoIG1ldGVyWzFdICogMTAwMCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLEdBQUE7O0FBQUEsQ0FBQSxFQUFXLElBQVgsa0JBQVc7O0FBRVgsQ0FGQSxFQUVpQixHQUFYLENBQU4sRUFBbUI7Q0FHakIsS0FBQSxrREFBQTtDQUFBLENBQUEsQ0FBUSxDQUFBLENBQVIsRUFBUTtDQUFSLENBQ0EsQ0FBUSxDQUFBLENBQUE7Q0FEUixDQUlBLENBQVMsQ0FBQSxDQUFLLENBQWQ7Q0FKQSxDQU9BLEVBQUEsQ0FBSztDQVBMLENBU0EsQ0FBd0IsR0FBQSxDQUFqQixFQUFtQixFQUExQjtDQUVFLEdBQUEsRUFBQTtDQUNNLEVBQUQsQ0FBSCxLQUFBLElBQUEsb0JBQUE7TUFERjtDQUdNLEVBQUQsQ0FBSCxLQUFBLElBQUEscUJBQUE7TUFMb0I7Q0FBeEIsRUFBd0I7Q0FUeEIsQ0FnQkEsQ0FBMkIsRUFBQSxFQUFwQixFQUFzQixLQUE3QjtBQUNTLENBQVAsR0FBQSxDQUFBO0NBQWtCLFdBQUE7TUFBbEI7Q0FFSSxFQUFELENBQUgsQ0FBNEIsQ0FBQSxHQUE1QixFQUFBO0NBSEYsRUFBMkI7Q0FoQjNCLENBdUJBLENBQWUsTUFBQSxHQUFmO0NBRUcsQ0FBYSxDQUFkLEVBQWMsQ0FBZCxFQUFjLENBQUUsRUFBaEI7Q0FFRSxHQUFHLENBQUgsQ0FBQTtDQUdFLENBQVcsQ0FBWCxFQUFBLEdBQUEsSUFBQTtDQUVBLElBQU8sRUFBTyxRQUFQLFlBQUE7UUFMVDtDQU9RLEdBQVIsR0FBTyxNQUFQO0NBVEYsSUFBYztDQXpCaEIsRUF1QmU7Q0F2QmYsQ0EyQ0EsQ0FBYyxNQUFBLEVBQWQ7Q0FDRSxDQUFrQixFQUFsQixDQUFLO0NBQ0MsR0FBTixDQUFLLE1BQUw7Q0E3Q0YsRUEyQ2M7Q0EzQ2QsQ0ErQ0EsQ0FBYSxNQUFBLENBQWI7Q0FDRSxHQUFBLENBQUs7Q0FDQyxHQUFOLENBQUssTUFBTDtDQWpERixFQStDYTtDQS9DYixDQW9EQSxDQUE0QixHQUFBLENBQXJCLEVBQXVCLE1BQTlCO0NBRUUsR0FBQSxFQUFBO0NBQ0UsVUFBQSxFQUFBO01BREY7Q0FHRSxTQUFBLEdBQUE7TUFMd0I7Q0FBNUIsRUFBNEI7Q0FTcEIsQ0FBUixDQUF3QixFQUFBLEVBQWpCLEVBQVAsRUFBQTtDQUVFLENBQUUsQ0FBd0MsQ0FBMUMsQ0FBQSxRQUFBO0NBQ0csQ0FBRCxDQUF5QyxDQUEzQyxDQUFBLE1BQUEsR0FBQTtDQUhGLEVBQXdCO0NBaEVUIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjY2MjEsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9jb21wb25lbnRzL3BvcHVwX2hhbmRsZXIuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUG9wdXBIYW5kbGVyXG5cdGNvbnN0cnVjdG9yOiAoIEBkb20gKSAtPlxuXHRcdEB1cmwgICAgID0gQGRvbS5kYXRhICd1cmwnXG5cdFx0QHRpdGxlICAgPSBAZG9tLmRhdGEgJ3RpdGxlJ1xuXHRcdEB3ICAgICAgID0gQGRvbS5kYXRhICd3J1xuXHRcdEBoICAgICAgID0gQGRvbS5kYXRhICdoJ1xuXG5cdFx0QGRvbS5vbiAnY2xpY2snLCBAb3BlblxuXHRcdFxuXHRvcGVuOiAoICkgPT5cblx0XHRsZWZ0ID0gKGFwcC53aW5kb3cudy8yKS0oQHcvMik7XG5cdFx0dG9wID0gKGFwcC53aW5kb3cuaC8yKS0oQGgvMik7XG5cblx0XHRwYXJhbXMgPSAndG9vbGJhcj1ubywgbG9jYXRpb249bm8sIGRpcmVjdG9yaWVzPW5vLCBzdGF0dXM9bm8sIG1lbnViYXI9bm8sIHNjcm9sbGJhcnM9bm8sIHJlc2l6YWJsZT1ubywgY29weWhpc3Rvcnk9bm8sIHdpZHRoPScrQHcrJywgaGVpZ2h0PScrQGgrJywgdG9wPScrdG9wKycsIGxlZnQ9JytsZWZ0XG5cblx0XHRsb2cgXCJwYXJhbXNcIiwgcGFyYW1zXG5cdFx0bG9nIFwidXJsXCIsIEB1cmxcblx0XHRsb2cgXCJ0aXRsZVwiLCBAdGl0bGVcblxuXHRcdHJldHVybiB3aW5kb3cub3BlbihAdXJsLCBAdGl0bGUsIHBhcmFtcykuZm9jdXMoKTtcblxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsUUFBQTtHQUFBLCtFQUFBOztBQUFBLENBQUEsRUFBdUIsR0FBakIsQ0FBTjtDQUNjLENBQUEsQ0FBQSxtQkFBRztDQUNmLEVBRGUsQ0FBRDtDQUNkLGtDQUFBO0NBQUEsRUFBQSxDQUFBLENBQVc7Q0FBWCxFQUNXLENBQVgsQ0FBQSxFQUFXO0NBRFgsRUFFVyxDQUFYO0NBRkEsRUFHVyxDQUFYO0NBSEEsQ0FLQSxDQUFJLENBQUosR0FBQTtDQU5ELEVBQWE7O0NBQWIsRUFRTSxDQUFOLEtBQU07Q0FDTCxPQUFBLFNBQUE7Q0FBQSxFQUFPLENBQVAsRUFBa0I7Q0FBbEIsRUFDQSxDQUFBLEVBQWlCO0NBRGpCLEVBR1MsQ0FBVCxFQUFBLEVBQVMsQ0FBQSxFQUFBLDBHQUFBO0NBSFQsQ0FLYyxDQUFkLENBQUEsRUFBQSxFQUFBO0NBTEEsQ0FNVyxDQUFYLENBQUEsQ0FBQTtDQU5BLENBT2EsQ0FBYixDQUFBLENBQUEsRUFBQTtDQUVBLENBQXlCLENBQWxCLENBQUEsQ0FBQSxDQUFNLEtBQU47Q0FsQlIsRUFRTTs7Q0FSTjs7Q0FERCJ9fSx7Im9mZnNldCI6eyJsaW5lIjo2NjUyLCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvY29tcG9uZW50cy9zY3JvbGxfaGFuZGxlci5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBTY3JvbGxIYW5kbGVyXG5cdGNvbnN0cnVjdG9yOiAoIEBkb20gKSAtPlxuXG5cdFx0dGFyZ2V0ID0gJCBAZG9tLmRhdGEoICd0YXJnZXQnIClcblx0XHRyZXR1cm4gaWYgdGFyZ2V0Lmxlbmd0aCA8PSAwXG5cblx0XHRAZG9tLmFkZENsYXNzICdzY3JvbGxfaGFuZGxlcidcblx0XHRcblx0XHRAZG9tLm9uICdjbGljaycsIC0+XG5cdFx0XHRtb3Zlci5zY3JvbGxfdG8gdGFyZ2V0Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsU0FBQTs7QUFBQSxDQUFBLEVBQXVCLEdBQWpCLENBQU47Q0FDYyxDQUFBLENBQUEsb0JBQUc7Q0FFZixLQUFBLEVBQUE7Q0FBQSxFQUZlLENBQUQ7Q0FFZCxFQUFTLENBQVQsRUFBQSxFQUFXO0NBQ1gsR0FBQSxFQUFnQjtDQUFoQixXQUFBO01BREE7Q0FBQSxFQUdJLENBQUosSUFBQSxRQUFBO0NBSEEsQ0FLQSxDQUFJLENBQUosR0FBQSxFQUFpQjtDQUNWLElBQUQsQ0FBTCxHQUFBLElBQUE7Q0FERCxJQUFpQjtDQVBsQixFQUFhOztDQUFiOztDQUREIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjY2NzQsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9jb21wb25lbnRzL3N0cmVhbV9jb250cm9scy5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsidXNlcl9jb250cm9sbGVyID0gcmVxdWlyZSAnYXBwL2NvbnRyb2xsZXJzL3VzZXInXG5cbiMgVE9ETzogYW5pbWF0aW9uIGZvciBjb250cm9scyBpbiBhbmQgb3V0XG5cbm1vZHVsZS5leHBvcnRzID0gKCBkb20gKSAtPlxuXG4gICMgd2FpdHMgbW9kZWwgZ2V0IHVzZXIgbmFtZVxuICB1c2VyX2NvbnRyb2xsZXIub24gJ3VzZXI6bG9nZ2VkJywgKCB1c2VyICkgLT5cblxuICAgIGNvbnNvbGUubG9nICd1c2VyIGxvZ2dlZCAtPicsIHVzZXIudXNlcm5hbWVcblxuICAgIGlmIFwiLyN7dXNlci51c2VybmFtZX1cIiBpcyB3YXlzLnBhdGhuYW1lKClcbiAgICAgICQoICcuY29udHJvbHMnICkuc2hvdygpXG5cblxuICB1c2VyX2NvbnRyb2xsZXIub24gJ3VzZXI6dW5sb2dnZWQnLCAtPlxuICAgICQoICcuY29udHJvbHMnICkuaGlkZSgpXG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxXQUFBOztBQUFBLENBQUEsRUFBa0IsSUFBQSxRQUFsQixPQUFrQjs7QUFJbEIsQ0FKQSxFQUlpQixHQUFYLENBQU4sRUFBbUI7Q0FHakIsQ0FBQSxDQUFrQyxDQUFBLEtBQUUsSUFBcEMsRUFBZTtDQUViLENBQThCLENBQTlCLENBQUEsR0FBTyxDQUFQLFFBQUE7Q0FFQSxFQUFJLENBQUosQ0FBMEIsR0FBdkI7Q0FDRCxHQUFBLE9BQUEsRUFBQTtNQUw4QjtDQUFsQyxFQUFrQztDQVFsQixDQUFoQixDQUFvQyxNQUFwQyxNQUFlO0NBQ2IsR0FBQSxPQUFBO0NBREYsRUFBb0M7Q0FYckIifX0seyJvZmZzZXQiOnsibGluZSI6NjY5MiwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2V4cGxvcmUuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gY2xhc3MgRXhwbG9yZVxuXHRjb25zdHJ1Y3RvcjogKCBAZG9tICkgLT4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxHQUFBOztBQUFBLENBQUEsRUFBdUIsR0FBakIsQ0FBTjtDQUNjLENBQUEsQ0FBQSxjQUFHO0NBQU8sRUFBUCxDQUFEO0NBQWYsRUFBYTs7Q0FBYjs7Q0FERCJ9fSx7Im9mZnNldCI6eyJsaW5lIjo2NzA1LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvaGVhZGVyLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJuYXZpZ2F0aW9uICAgICAgPSByZXF1aXJlICdhcHAvY29udHJvbGxlcnMvbmF2aWdhdGlvbidcbnVzZXJfY29udHJvbGxlciA9IHJlcXVpcmUgJ2FwcC9jb250cm9sbGVycy91c2VyJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEhlYWRlclxuXG5cdGN1cnJlbnRfcGFnZTogXCJcIlxuXHR1c2VyX2xvZ2dlZDogZmFsc2VcblxuXHRjb25zdHJ1Y3RvcjogKCBAZG9tICkgLT5cblx0XHR1c2VyX2NvbnRyb2xsZXIub24gJ3VzZXI6bG9nZ2VkJywgQG9uX3VzZXJfbG9nZ2VkXG5cdFx0dXNlcl9jb250cm9sbGVyLm9uICd1c2VyOnVubG9nZ2VkJywgQG9uX3VzZXJfdW5sb2dnZWRcblxuXHRcdG5hdmlnYXRpb24ub24gJ2FmdGVyX3JlbmRlcicsIEBjaGVja19tZW51XG5cblx0Y2hlY2tfbWVudTogPT5cblx0XHRvYmogPSAkKCAnW2RhdGEtbWVudV0nIClcblx0XHRpZiBvYmoubGVuZ3RoID4gMFxuXHRcdFx0cGFnZSA9IG9iai5kYXRhICdtZW51J1xuXHRcdFx0bG9nIFwiW0hlYWRlcl0gY2hlY2tfbWVudVwiLCBwYWdlXG5cdFx0XHRcblx0XHRcdGlmIEBjdXJyZW50X3BhZ2UubGVuZ3RoID4gMFxuXHRcdFx0XHRAZG9tLmZpbmQoIFwiLiN7QGN1cnJlbnRfcGFnZX1faXRlbVwiICkucmVtb3ZlQ2xhc3MgXCJzZWxlY3RlZFwiXG5cdFx0XHRcdGFwcC5ib2R5LnJlbW92ZUNsYXNzIFwiI3tAY3VycmVudF9wYWdlfV9wYWdlXCJcblxuXHRcdFx0QGRvbS5maW5kKCBcIi4je3BhZ2V9X2l0ZW1cIiApLmFkZENsYXNzIFwic2VsZWN0ZWRcIlxuXHRcdFx0YXBwLmJvZHkuYWRkQ2xhc3MgXCIje3BhZ2V9X3BhZ2VcIlxuXG5cdFx0XHRAY3VycmVudF9wYWdlID0gcGFnZVxuXG5cblx0b25fdXNlcl9sb2dnZWQ6ICggZGF0YSApID0+XG5cblx0XHRyZXR1cm4gaWYgQHVzZXJfbG9nZ2VkXG5cdFx0QHVzZXJfbG9nZ2VkID0gdHJ1ZVxuXHRcdFxuXHRcdHdyYXBwZXIgPSBAZG9tLmZpbmQoICcudXNlcl9sb2dnZWQnIClcblx0XHR0bXBsICAgID0gcmVxdWlyZSAndGVtcGxhdGVzL3NoYXJlZC9oZWFkZXJfdXNlcl9sb2dnZWQnXG5cdFx0aHRtbCAgICA9IHRtcGwgZGF0YVxuXG5cdFx0bG9nIFwiW0hlYWRlcl0gb25fdXNlcl9sb2dnZWRcIiwgZGF0YSwgaHRtbFxuXG5cdFx0bG9nIFwid3JhcHBlclwiLCB3cmFwcGVyLmxlbmd0aCwgd3JhcHBlclxuXG5cdFx0d3JhcHBlci5lbXB0eSgpLmFwcGVuZCBodG1sXG5cblx0XHR2aWV3LmJpbmQgd3JhcHBlclxuXG5cblxuXHRvbl91c2VyX3VubG9nZ2VkOiAoIGRhdGEgKSA9PlxuXHRcdHJldHVybiBpZiBub3QgQHVzZXJfbG9nZ2VkXG5cdFx0QHVzZXJfbG9nZ2VkID0gZmFsc2Vcblx0XHRsb2cgXCJbSGVhZGVyXSBvbl91c2VyX3VubG9nZ2VkXCIsIGRhdGEiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSwrQkFBQTtHQUFBLCtFQUFBOztBQUFBLENBQUEsRUFBa0IsSUFBQSxHQUFsQixrQkFBa0I7O0FBQ2xCLENBREEsRUFDa0IsSUFBQSxRQUFsQixPQUFrQjs7QUFFbEIsQ0FIQSxFQUd1QixHQUFqQixDQUFOO0NBRUMsQ0FBQSxDQUFjLFNBQWQ7O0NBQUEsRUFDYSxFQURiLE1BQ0E7O0NBRWEsQ0FBQSxDQUFBLGFBQUc7Q0FDZixFQURlLENBQUQ7Q0FDZCwwREFBQTtDQUFBLHNEQUFBO0NBQUEsOENBQUE7Q0FBQSxDQUFBLEVBQUEsU0FBQSxDQUFBLENBQWU7Q0FBZixDQUNBLEVBQUEsV0FBZSxDQUFmO0NBREEsQ0FHQSxFQUFBLE1BQVUsSUFBVjtDQVBELEVBR2E7O0NBSGIsRUFTWSxNQUFBLENBQVo7Q0FDQyxPQUFBLENBQUE7Q0FBQSxFQUFBLENBQUEsU0FBTTtDQUNOLEVBQU0sQ0FBTixFQUFHO0NBQ0YsRUFBTyxDQUFQLEVBQUE7Q0FBQSxDQUMyQixDQUEzQixDQUFBLEVBQUEsZUFBQTtDQUVBLEVBQTBCLENBQXZCLEVBQUgsTUFBZ0I7Q0FDZixFQUFJLENBQUgsR0FBRCxDQUFBLEVBQUEsQ0FBQSxDQUFZO0NBQVosQ0FDcUIsQ0FBbEIsQ0FBSyxHQUFSLENBQUEsR0FBQSxDQUFxQjtRQUx0QjtDQUFBLEVBT0ksQ0FBSCxFQUFELENBQUEsQ0FBQSxFQUFBO0NBUEEsQ0FRa0IsQ0FBZixDQUFLLEVBQVIsQ0FBQSxDQUFBO0NBRUMsRUFBZSxDQUFmLFFBQUQsQ0FBQTtNQWJVO0NBVFosRUFTWTs7Q0FUWixFQXlCZ0IsQ0FBQSxLQUFFLEtBQWxCO0NBRUMsT0FBQSxXQUFBO0NBQUEsR0FBQSxPQUFBO0NBQUEsV0FBQTtNQUFBO0NBQUEsRUFDZSxDQUFmLE9BQUE7Q0FEQSxFQUdVLENBQVYsR0FBQSxPQUFVO0NBSFYsRUFJVSxDQUFWLEdBQVUsOEJBQUE7Q0FKVixFQUtVLENBQVY7Q0FMQSxDQU8rQixDQUEvQixDQUFBLHFCQUFBO0NBUEEsQ0FTZSxDQUFmLENBQUEsRUFBQSxDQUFzQixFQUF0QjtDQVRBLEdBV0EsQ0FBQSxDQUFBLENBQU87Q0FFRixHQUFELEdBQUosSUFBQTtDQXhDRCxFQXlCZ0I7O0NBekJoQixFQTRDa0IsQ0FBQSxLQUFFLE9BQXBCO0FBQ2UsQ0FBZCxHQUFBLE9BQUE7Q0FBQSxXQUFBO01BQUE7Q0FBQSxFQUNlLENBQWYsQ0FEQSxNQUNBO0NBQ0ksQ0FBNkIsQ0FBakMsQ0FBQSxPQUFBLGdCQUFBO0NBL0NELEVBNENrQjs7Q0E1Q2xCOztDQUxEIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjY3NzIsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9ob21lcGFnZS5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsicHJlbG9hZCA9IHJlcXVpcmUgJ2FwcC91dGlscy9wcmVsb2FkJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEhvbWVwYWdlXG5cdGNvbnN0cnVjdG9yOiAoQGRvbSkgLT5cblxuXHRcdGVsZW1lbnRzID0gW11cblx0XHRpbWFnZXMgPSBbXVxuXG5cdFx0QGRvbS5maW5kKCAnLnBhcmFsbGF4LWNvbnRhaW5lcicgKS5lYWNoIC0+XG5cdFx0XHRlbGVtZW50cy5wdXNoICQoIEAgKVxuXHRcdFx0aW1hZ2VzLnB1c2ggJCggQCApLmRhdGEoICdpbWFnZS1wYXJhbGxheCcgKVxuXG5cdFx0cHJlbG9hZCBpbWFnZXMsICggaW1hZ2VzX2xvYWRlZCApLT5cblxuXHRcdFx0Zm9yIGVsLCBpIGluIGVsZW1lbnRzXG5cdFx0XHRcdGVsLnBhcmFsbGF4XG5cdFx0XHRcdFx0aW1hZ2VTcmMgICAgIDogaW1hZ2VzX2xvYWRlZFsgaSBdLnNyY1xuXHRcdFx0XHRcdGJsZWVkICAgICAgICA6IDEwXG5cdFx0XHRcdFx0cGFyYWxsYXggICAgIDogJ3Njcm9sbCdcblx0XHRcdFx0XHRuYXR1cmFsV2lkdGggOiBpbWFnZXNfbG9hZGVkWyBpIF0ud2lkdGhcblx0XHRcdFx0XHRuYXR1cmFsaGVpZ2h0OiBpbWFnZXNfbG9hZGVkWyBpIF0uaGVpZ2h0XG5cblx0XHRcdGRlbGF5IDEwMCwgPT4gYXBwLndpbmRvdy5vYmoudHJpZ2dlciAncmVzaXplJ1xuXG5cblx0ZGVzdHJveTogKCApIC0+XG5cdFx0cCA9ICQoICcucGFyYWxsYXgtbWlycm9yJyApXG5cdFx0cC5hZGRDbGFzcyggJ2hpZGUnIClcblx0XHRkZWxheSAzMDAsIC0+IHAucmVtb3ZlKCkiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxhQUFBOztBQUFBLENBQUEsRUFBVSxJQUFWLFlBQVU7O0FBRVYsQ0FGQSxFQUV1QixHQUFqQixDQUFOO0NBQ2MsQ0FBQSxDQUFBLGVBQUU7Q0FFZCxPQUFBLFFBQUE7Q0FBQSxFQUZjLENBQUQ7Q0FFYixDQUFBLENBQVcsQ0FBWCxJQUFBO0NBQUEsQ0FBQSxDQUNTLENBQVQsRUFBQTtDQURBLEVBR0ksQ0FBSixLQUF3QyxZQUF4QztDQUNDLEdBQUEsRUFBQSxFQUFRO0NBQ0QsR0FBUCxFQUFNLE9BQU4sR0FBWTtDQUZiLElBQXdDO0NBSHhDLENBT2dCLENBQUEsQ0FBaEIsRUFBQSxDQUFBLEVBQWtCLElBQUY7Q0FFZixTQUFBLEtBQUE7U0FBQSxHQUFBO0FBQUEsQ0FBQSxVQUFBLDRDQUFBOzBCQUFBO0NBQ0MsQ0FBRSxNQUFGO0NBQ0MsQ0FBZSxDQUFmLEtBQUEsRUFBQSxHQUE4QjtDQUE5QixDQUNlLEdBQWYsS0FBQTtDQURBLENBRWUsTUFBZixFQUFBO0NBRkEsQ0FHZSxHQUhmLEtBR0EsRUFBQSxDQUE4QjtDQUg5QixDQUllLElBSmYsSUFJQSxHQUFBO0NBTEQsU0FBQTtDQURELE1BQUE7Q0FRTSxDQUFLLENBQVgsRUFBQSxJQUFXLElBQVg7Q0FBa0IsRUFBRCxHQUFPLENBQVYsQ0FBQSxPQUFBO0NBQWQsTUFBVztDQVZaLElBQWdCO0NBVGpCLEVBQWE7O0NBQWIsRUFzQlMsSUFBVCxFQUFTO0NBQ1IsT0FBQTtDQUFBLEVBQUksQ0FBSixjQUFJO0NBQUosR0FDQSxFQUFBLEVBQUE7Q0FDTSxDQUFLLENBQVgsRUFBQSxJQUFXLEVBQVg7Q0FBZSxLQUFELE9BQUE7Q0FBZCxJQUFXO0NBekJaLEVBc0JTOztDQXRCVDs7Q0FIRCJ9fSx7Im9mZnNldCI6eyJsaW5lIjo2ODIwLCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvbG9hZGluZy5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsibmF2aWdhdGlvbiAgICAgICAgXHQ9IHJlcXVpcmUgJ2FwcC9jb250cm9sbGVycy9uYXZpZ2F0aW9uJ1xuT3BhY2l0eSBcdFx0XHQ9IHJlcXVpcmUgJ2FwcC91dGlscy9vcGFjaXR5J1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIExvYWRpbmdcblx0Zmlyc3RfdGltZTogb25cblx0Y29uc3RydWN0b3I6ICggQGRvbSApIC0+XG5cdFx0bmF2aWdhdGlvbi5vbiAnYmVmb3JlX2Rlc3Ryb3knLCA9PlxuXHRcdFx0YXBwLmJvZHkuYWRkQ2xhc3MoICdsb2FkaW5nJyApLnJlbW92ZUNsYXNzKCAnbG9hZGVkJyApXG5cdFx0XHRPcGFjaXR5LnNob3cgQGRvbSwgMTAwXG5cblx0XHRuYXZpZ2F0aW9uLm9uICdhZnRlcl9yZW5kZXInLCA9PiBcblx0XHRcdGlmIEBmaXJzdF90aW1lXG5cdFx0XHRcdGFwcC5ib2R5LmFkZENsYXNzICdmaXJzdF9sb2FkZWQnXG5cdFx0XHRcdEBmaXJzdF90aW1lID0gb2ZmXG5cdFx0XHRhcHAuYm9keS5yZW1vdmVDbGFzcyggJ2xvYWRpbmcnICkuYWRkQ2xhc3MoICdsb2FkZWQnIClcblx0XHRcdE9wYWNpdHkuaGlkZSBAZG9tIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsd0JBQUE7O0FBQUEsQ0FBQSxFQUFxQixJQUFBLEdBQXJCLGtCQUFxQjs7QUFDckIsQ0FEQSxFQUNhLElBQWIsWUFBYTs7QUFFYixDQUhBLEVBR3VCLEdBQWpCLENBQU47Q0FDQyxFQUFZLENBQVosTUFBQTs7Q0FDYSxDQUFBLENBQUEsY0FBRztDQUNmLE9BQUEsSUFBQTtDQUFBLEVBRGUsQ0FBRDtDQUNkLENBQUEsQ0FBZ0MsQ0FBaEMsS0FBZ0MsQ0FBdEIsTUFBVjtDQUNDLEVBQUcsQ0FBSyxFQUFSLEVBQUEsQ0FBQSxFQUFBO0NBQ1EsQ0FBVyxDQUFuQixDQUFBLENBQWMsRUFBUCxNQUFQO0NBRkQsSUFBZ0M7Q0FBaEMsQ0FJQSxDQUE4QixDQUE5QixLQUE4QixDQUFwQixJQUFWO0NBQ0MsR0FBRyxDQUFDLENBQUosSUFBQTtDQUNDLEVBQUcsQ0FBSyxJQUFSLE1BQUE7Q0FBQSxFQUNjLEVBQWIsR0FBRCxFQUFBO1FBRkQ7Q0FBQSxFQUdHLENBQUssRUFBUixFQUFBLENBQUEsRUFBQTtDQUNRLEVBQVIsQ0FBQSxDQUFjLEVBQVAsTUFBUDtDQUxELElBQThCO0NBTi9CLEVBQ2E7O0NBRGI7O0NBSkQifX0seyJvZmZzZXQiOnsibGluZSI6Njg1MiwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2xvZ2luLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJOYXZpZ2F0aW9uID0gcmVxdWlyZSAnYXBwL2NvbnRyb2xsZXJzL25hdmlnYXRpb24nXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgTG9naW5cblx0Y29uc3RydWN0b3I6ICggQGRvbSApIC0+XG5cblx0XHR1bmxlc3Mgd2luZG93Lm9wZW5lcj9cblx0XHRcdGFwcC5ib2R5LnJlbW92ZUNsYXNzIFwibG9naW5fcGFnZVwiXG5cdFx0XHROYXZpZ2F0aW9uLmdvICcvJ1xuXHRcdFxuXHRcdEB1c2VybmFtZSA9IEBkb20uZmluZCggJy51c2VybmFtZScgKVxuXHRcdEBwYXNzd29yZCA9IEBkb20uZmluZCggJy5wYXNzd29yZCcgKVxuXG5cdFx0QGRvbS5maW5kKCAnLmZhY2Vib29rJyApLm9uICdjbGljaycsIEBfZmFjZWJvb2tfbG9naW5cblx0XHRAZG9tLmZpbmQoICcuc291bmRjbG91ZCcgKS5vbiAnY2xpY2snLCBAX3NvdW5kY2xvdWRfbG9naW5cblx0XHRAZG9tLmZpbmQoICcuZ29vZ2xlJyApLm9uICdjbGljaycsIEBfZ29vZ2xlX2xvZ2luXG5cblx0XHRcblx0XHQjIEBkb20uZmluZCggJy5zaWduaW4nICkub24gJ2NsaWNrJywgQF9jdXN0b21fbG9naW5cblxuXHRcdCMgQGRvbS5maW5kKCAnaW5wdXQnICkua2V5cHJlc3MgKGV2ZW50KSA9PlxuXHRcdCMgXHRpZiBldmVudC53aGljaCBpcyAxM1xuXHRcdCMgXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0IyBcdFx0QF9jdXN0b21fbG9naW4oKVxuXHRcdCMgXHRcdHJldHVybiBmYWxzZVxuXHRcdFx0XG5cblx0X2ZhY2Vib29rX2xvZ2luOiAoICkgPT5cblx0XHRsb2cgXCJbTG9naW5dIF9mYWNlYm9va19sb2dpblwiXG5cblx0X3NvdW5kY2xvdWRfbG9naW46ICggKSA9PlxuXHRcdGxvZyBcIltMb2dpbl0gX3NvdW5kY2xvdWRfbG9naW5cIlxuXG5cdF9nb29nbGVfbG9naW46ICggKSA9PlxuXHRcdGxvZyBcIltMb2dpbl0gX2dvb2dsZV9sb2dpblwiXG5cblx0IyBfY3VzdG9tX2xvZ2luOiAoICkgPT5cblx0IyBcdEBkb20ucmVtb3ZlQ2xhc3MgXCJlcnJvclwiXG5cdCMgXHRpZiBAdXNlcm5hbWUudmFsKCkubGVuZ3RoIDw9IDAgb3IgQHBhc3N3b3JkLnZhbCgpLmxlbmd0aCA8PSAwXG5cdCMgXHRcdGxvZyBcIltMb2dpbl0gZXJyb3JcIlxuXHQjIFx0XHRAZG9tLmFkZENsYXNzIFwiZXJyb3JcIlxuXHQjIFx0XHRyZXR1cm4gZmFsc2VcblxuXHQjIFx0ZGF0YTpcblx0IyBcdFx0dXNlcm5hbWU6IEB1c2VybmFtZS52YWwoKVxuXHQjIFx0XHRwYXNzd29yZDogQHBhc3N3b3JkLnZhbCgpXG5cblx0IyBcdGxvZyBcIltMb2dpbl0gc3VibWl0dGluZyBkYXRhXCIsIGRhdGFcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGFBQUE7R0FBQSwrRUFBQTs7QUFBQSxDQUFBLEVBQWEsSUFBQSxHQUFiLGtCQUFhOztBQUViLENBRkEsRUFFdUIsR0FBakIsQ0FBTjtDQUNjLENBQUEsQ0FBQSxZQUFHO0NBRWYsRUFGZSxDQUFEO0NBRWQsb0RBQUE7Q0FBQSw0REFBQTtDQUFBLHdEQUFBO0NBQUEsR0FBQSxpQkFBQTtDQUNDLEVBQUcsQ0FBSyxFQUFSLEtBQUEsQ0FBQTtDQUFBLENBQ0EsQ0FBQSxHQUFBLElBQVU7TUFGWDtDQUFBLEVBSVksQ0FBWixJQUFBLEdBQVk7Q0FKWixFQUtZLENBQVosSUFBQSxHQUFZO0NBTFosQ0FPQSxDQUFJLENBQUosR0FBQSxJQUFBLElBQUE7Q0FQQSxDQVFBLENBQUksQ0FBSixHQUFBLE1BQUEsSUFBQTtDQVJBLENBU0EsQ0FBSSxDQUFKLEdBQUEsRUFBQSxJQUFBO0NBWEQsRUFBYTs7Q0FBYixFQXVCaUIsTUFBQSxNQUFqQjtDQUNLLEVBQUosUUFBQSxjQUFBO0NBeEJELEVBdUJpQjs7Q0F2QmpCLEVBMEJtQixNQUFBLFFBQW5CO0NBQ0ssRUFBSixRQUFBLGdCQUFBO0NBM0JELEVBMEJtQjs7Q0ExQm5CLEVBNkJlLE1BQUEsSUFBZjtDQUNLLEVBQUosUUFBQSxZQUFBO0NBOUJELEVBNkJlOztDQTdCZjs7Q0FIRCJ9fSx7Im9mZnNldCI6eyJsaW5lIjo2ODkyLCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvcHJvZmlsZS5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiQ2xvdWRpbmFyeSA9IHJlcXVpcmUgJ2FwcC9jb250cm9sbGVycy9jbG91ZGluYXJ5J1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFByb2ZpbGUgXG5cdGVsZW1lbnRzOiBudWxsXG5cdGZvcm1fYmlvOiBudWxsXG5cblx0IyBUT0RPOiByZXBsYWNlIHRoaXMgZmFrZSBkYXRhIG9iamVjdFxuXHR1c2VyX2RhdGEgOlxuXHRcdHByb2ZpbGVfcGljdHVyZTogXCIvaW1hZ2VzL3Byb2ZpbGVfYmlnLnBuZ1wiXG5cdFx0Y292ZXJfcGljdHVyZTogXCIvaW1hZ2VzL2hvbWVwYWdlXzIuanBnXCJcblx0XHRsb2NhdGlvbjogXCJMb25kb24gLSBVS1wiXG5cdFx0YmlvOiBcIlRob21hcyBBbXVuZHNlbiBmcm9tIE9zbG8sIG5vdyBiYXNlZCBpbiBMb25kb24gaGFzIGZyb20gYW4gZWFybHkgYWdlIGxvdHMgb2YgbXVzaWNhbCBpbmZsdWVuY2VzLCBleHBlcmltZW50aW5nIGZyb20gYWNvdXN0aWMgaW5zdHJ1bWVudHMgdG8gZWxlY3Ryb25pYyBtdXNpYyBwcm9kdWN0aW9uIGFuZCBESmluZy48YnIvPjxici8+SGUgcmVsZWFzZWQgaGlzIGRlYnV0IEVQIOKAnEkgRmVlbOKAnSBvbiBGdXNpb24gcmVjb3JkaW5ncywgc3ViLWxhYmVsIG9mIERqIENlbnRlciBSZWNvcmRzLCBhbmQgaGFzIHNpbmNlIHJlbGVhc2VkIGZyZXF1ZW50bHkgb24gbGFiZWxzIHN1Y2ggYXM7IERvYmFyYSwgU3VzdXJyb3VzIE11c2ljLCBJbmNvZ25pdHVzIFJlY29yZGluZ3MsIEtvb2x3YXRlcnMgYW5kIGdhaW5lZCBzdXBwb3J0IGZyb20gdGhlIGxpa2VzIG9mIEFtaW5lIEVkZ2UsIFN0YWNleSBQdWxsZW4sIERldGxlZiwgU2xhbSwgTWFyYyBWZWRvLCBMb3ZlcmRvc2UsIEFzaGxleSBXaWxkLCBKb2JlIGFuZCBtYW55IG1vcmVcIlxuXHRcdGxpbmtzOiBbXG5cdFx0XHR7dHlwZTpcInNwb3RpZnlcIiwgdXJsOlwiaHR0cDovL3Nwb3RpZnkuY29tXCJ9LFxuXHRcdFx0e3R5cGU6XCJzb3VuZGNsb3VkXCIsIHVybDpcImh0dHA6Ly9zb3VuZGNsb3VkLmNvbVwifSxcblx0XHRcdHt0eXBlOlwiZmFjZWJvb2tcIiwgdXJsOlwiaHR0cDovL2ZhY2Vib29rLmNvbVwifVxuXHRcdF1cblxuXHRjb25zdHJ1Y3RvcjogKCBAZG9tICkgLT5cblxuXHRcdEBlbGVtZW50cyA9IFxuXHRcdFx0cHJvZmlsZV9waWN0dXJlOiBAZG9tLmZpbmQoICcucHJvZmlsZV9pbWFnZSBpbWcnIClcblx0XHRcdGNvdmVyX3BpY3R1cmU6IEBkb20uZmluZCggJy5jb3Zlcl9pbWFnZScgKVxuXHRcdFx0bG9jYXRpb246IEBkb20uZmluZCggJy5sb2NhdGlvbicgKVxuXHRcdFx0bG9jYXRpb25faW5wdXQ6IEBkb20uZmluZCggJy5sb2NhdGlvbl9pbnB1dCcgKVxuXHRcdFx0YmlvOiBAZG9tLmZpbmQoICcuYmlvJyApXG5cdFx0XHRiaW9faW5wdXQ6IEBkb20uZmluZCggJy5iaW9faW5wdXQnIClcblx0XHRcdGxpbmtzOiBbXG5cdFx0XHRcdHt0eXBlOlwic3BvdGlmeVwiLCBlbDpAZG9tLmZpbmQoICcuc3BvdGlmeV9saW5rJyApfSxcblx0XHRcdFx0e3R5cGU6XCJzb3VuZGNsb3VkXCIsIGVsOkBkb20uZmluZCggJy5zb3VuZGNsb3VkX2xpbmsnICl9LFxuXHRcdFx0XHR7dHlwZTpcImZhY2Vib29rXCIsIGVsOkBkb20uZmluZCggJy5mYWNlYm9va19saW5rJyApfVxuXHRcdFx0XVxuXHRcdFx0bGlua3NfaW5wdXQ6IFtcblx0XHRcdFx0e3R5cGU6XCJzcG90aWZ5XCIsIGVsOkBkb20uZmluZCggJy5zcG90aWZ5X2lucHV0JyApfSxcblx0XHRcdFx0e3R5cGU6XCJzb3VuZGNsb3VkXCIsIGVsOkBkb20uZmluZCggJy5zb3VuZGNsb3VkX2lucHV0JyApfSxcblx0XHRcdFx0e3R5cGU6XCJmYWNlYm9va1wiLCBlbDpAZG9tLmZpbmQoICcuZmFjZWJvb2tfaW5wdXQnICl9XG5cdFx0XHRdXG5cblxuXHRcdEBmb3JtX2JpbyA9IEBkb20uZmluZCggJy5wcm9maWxlX2Zvcm0nIClcblx0XHRAZm9ybV9iaW8ub24gJ3N1Ym1pdCcsIChlKSAtPiBlLnByZXZlbnREZWZhdWx0KClcblx0XHRAZm9ybV9iaW8uZmluZCggJ2lucHV0JyApLmtleXVwIChlKSA9PlxuXHRcdFx0aWYgZS5rZXlDb2RlIGlzIDEzXG5cdFx0XHRcdEByZWFkX21vZGUoKVxuXG5cdFx0cmVmID0gQFxuXG5cdFx0QGRvbS5maW5kKCAnW2RhdGEtcHJvZmlsZV0nICkub24gJ2NsaWNrJywgLT5cblxuXHRcdFx0dmFsdWUgPSAkKEApLmRhdGEgJ3Byb2ZpbGUnXG5cblx0XHRcdHN3aXRjaCB2YWx1ZVxuXHRcdFx0XHR3aGVuICdzZXQtd3JpdGUtbW9kZSdcblx0XHRcdFx0XHRkbyByZWYud3JpdGVfbW9kZVxuXHRcdFx0XHR3aGVuICdzZXQtcmVhZC1tb2RlJ1xuXHRcdFx0XHRcdGRvIHJlZi5yZWFkX21vZGVcblxuXG5cdFx0QHVwZGF0ZV9kb21fZnJvbV91c2VyX2RhdGEoKVxuXG5cdFx0dmlldy5vbiAnYmluZGVkJywgQG9uX3ZpZXdzX2JpbmRlZFxuXG5cdG9uX3ZpZXdzX2JpbmRlZDogPT5cblx0XHRjaGFuZ2VfY292ZXJfdXBsb2FkZXIgPSB2aWV3LmdldF9ieV9kb20gQGRvbS5maW5kKCAnLmNoYW5nZV9jb3ZlcicgKVxuXHRcdGNoYW5nZV9jb3Zlcl91cGxvYWRlci5vbiAnY29tcGxldGVkJywgKGRhdGEpID0+XG5cdFx0XHRAZG9tLmZpbmQoICcuY292ZXJfaW1hZ2UnICkuY3NzXG5cdFx0XHRcdCdiYWNrZ3JvdW5kLWltYWdlJzogXCJ1cmwoI3tkYXRhLnJlc3VsdC51cmx9KVwiXG5cblxuXHQjIE9wZW4gdGhlIHdyaXRlL2VkaXQgbW9kZVxuXHR3cml0ZV9tb2RlIDogLT5cblx0XHRhcHAuYm9keS5hZGRDbGFzcyAnd3JpdGVfbW9kZSdcblxuXHRcblx0XG5cdFxuXHRyZWFkX21vZGUgOiAtPlxuXHRcdCMgLSBVcGRhdGUgdGhlIHVzZXJfZGF0YSBmcm9tIHRoZSBpbnB1dHNcblx0XHRAdXBkYXRlX3VzZXJfZGF0YV9mcm9tX2RvbSgpXG5cblx0XHQjIC0gVXBkYXRlIHRoZSBkb20gKGxhYmVscyBhbmQgaW5wdXRzKSBmcm9tIHRoZSB1c2VyX2RhdGFcblx0XHQjIFx0VGhpcyBhY3Rpb24gaXMgbW9zdGx5IGRvbmUgZm9yIHVwZGF0aW5nIGxhYmVscyAoaW5wdXRzIGFyZSBhbHJlYWR5IHVwZGF0ZWQpXG5cdFx0QHVwZGF0ZV9kb21fZnJvbV91c2VyX2RhdGEoKVxuXG5cdFx0IyAtIFRPRE86IFNlbmQgdGhlIGRhdGEgdG8gdGhlIGJhY2tlbmRcblx0XHRAc2VuZF90b19zZXJ2ZXIoKVxuXG5cdFx0IyAtIGNsb3NlIHRoZSB3cml0ZS9lZGl0IG1vZGUgYW5kIHN3aXRjaCB0byByZWFkIG9ubHkgbW9kZVxuXHRcdGFwcC5ib2R5LnJlbW92ZUNsYXNzICd3cml0ZV9tb2RlJ1xuXG5cblxuXHR1cGRhdGVfdXNlcl9kYXRhX2Zyb21fZG9tOiAtPlxuXG5cdFx0IyAtIFRPRE86IFVwZGF0ZSB0aGUgaW1hZ2VzXG5cblx0XHRAdXNlcl9kYXRhLmxvY2F0aW9uID0gQGVsZW1lbnRzLmxvY2F0aW9uX2lucHV0LnZhbCgpXG5cdFx0QHVzZXJfZGF0YS5iaW8gPSBAZWxlbWVudHMuYmlvX2lucHV0LnZhbCgpXG5cblx0XHRAdXNlcl9kYXRhLmxpbmtzID0gW11cblx0XHRmb3IgbCwgaSBpbiBAZWxlbWVudHMubGlua3NfaW5wdXRcblx0XHRcdEB1c2VyX2RhdGEubGlua3MucHVzaFxuXHRcdFx0XHR0eXBlOiBsLnR5cGVcblx0XHRcdFx0dXJsOiBsLmVsLnZhbCgpXG5cblxuXHR1cGRhdGVfZG9tX2Zyb21fdXNlcl9kYXRhIDogLT5cblxuXHRcdCMgLSBUT0RPOiBVcGRhdGUgdGhlIGltYWdlc1xuXG5cdFx0ZSA9IEBlbGVtZW50c1xuXHRcdGQgPSBAdXNlcl9kYXRhXG5cblx0XHRlLnByb2ZpbGVfcGljdHVyZS5jc3MgJ2JhY2tncm91bmQtaW1hZ2UnLCBkLnByb2ZpbGVfcGljdHVyZVxuXHRcdGUuY292ZXJfcGljdHVyZS5jc3MgJ2JhY2tncm91bmQtaW1hZ2UnLCBkLmNvdmVyX3BpY3R1cmVcblxuXHRcdGUubG9jYXRpb24uaHRtbCBkLmxvY2F0aW9uXG5cdFx0ZS5sb2NhdGlvbl9pbnB1dC52YWwgZC5sb2NhdGlvblxuXG5cdFx0ZS5iaW8uaHRtbCBkLmJpb1xuXHRcdGUuYmlvX2lucHV0LnZhbCBAaHRtbF90b190ZXh0YXJlYSggZC5iaW8gKVxuXG5cdFx0Zm9yIGxpbmssIGkgaW4gZC5saW5rc1xuXHRcdFx0ZS5saW5rc1sgaSBdLmVsLmF0dHIgJ2hyZWYnLCBsaW5rLnVybFxuXHRcdFx0ZS5saW5rc19pbnB1dFsgaSBdLmVsLnZhbCBsaW5rLnVybFxuXG5cdGh0bWxfdG9fdGV4dGFyZWEgOiAoIHN0ciApIC0+XG5cdFx0dG9fZmluZCA9IFwiPGJyLz5cIlxuXHRcdHRvX3JlcGxhY2UgPSBcIlxcblwiXG5cdFx0cmUgPSBuZXcgUmVnRXhwIHRvX2ZpbmQsICdnJ1xuXG5cdFx0cmV0dXJuIHN0ci5yZXBsYWNlIHJlLCB0b19yZXBsYWNlXG5cblx0c2VuZF90b19zZXJ2ZXI6IC0+XG5cdFx0bG9nIFwiW1Byb2ZpbGVdIHNhdmVcIiwgQHVzZXJfZGF0YVxuXHRcdHJldHVyblxuXHRcdCQucG9zdCBcIi9hcGkvdjEvdXNlci9zYXZlXCIsIEB1c2VyX2RhdGEsIChkYXRhKSA9PlxuXHRcdFx0bG9nIFwiW1Byb2ZpbGVdIHNlcnZlciByZXNwb25zZVwiLCBkYXRhXG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxlQUFBO0dBQUEsK0VBQUE7O0FBQUEsQ0FBQSxFQUFhLElBQUEsR0FBYixrQkFBYTs7QUFFYixDQUZBLEVBRXVCLEdBQWpCLENBQU47Q0FDQyxFQUFVLENBQVYsSUFBQTs7Q0FBQSxFQUNVLENBRFYsSUFDQTs7Q0FEQSxFQUtDLE1BREQ7Q0FDQyxDQUFpQixFQUFqQixXQUFBLFVBQUE7Q0FBQSxDQUNlLEVBQWYsU0FBQSxXQURBO0NBQUEsQ0FFVSxFQUFWLElBQUEsS0FGQTtDQUFBLENBR0ssQ0FBTCxDQUFBLHFnQkFIQTtDQUFBLENBSU8sRUFBUCxDQUFBO09BQ0M7Q0FBQSxDQUFNLEVBQUwsSUFBQSxDQUFEO0NBQUEsQ0FBcUIsQ0FBSixLQUFBLFlBQWpCO0VBQ0EsTUFGTTtDQUVOLENBQU0sRUFBTCxJQUFBLElBQUQ7Q0FBQSxDQUF3QixDQUFKLEtBQUEsZUFBcEI7RUFDQSxNQUhNO0NBR04sQ0FBTSxFQUFMLElBQUEsRUFBRDtDQUFBLENBQXNCLENBQUosS0FBQSxhQUFsQjtRQUhNO01BSlA7Q0FMRCxHQUFBOztDQWVhLENBQUEsQ0FBQSxjQUFHO0NBRWYsRUFBQSxLQUFBO09BQUEsS0FBQTtDQUFBLEVBRmUsQ0FBRDtDQUVkLHdEQUFBO0NBQUEsRUFDQyxDQURELElBQUE7Q0FDQyxDQUFpQixDQUFJLENBQUgsRUFBbEIsU0FBQSxLQUFpQjtDQUFqQixDQUNlLENBQUksQ0FBSCxFQUFoQixPQUFBLENBQWU7Q0FEZixDQUVVLENBQUksQ0FBSCxFQUFYLEVBQUEsR0FBVTtDQUZWLENBR2dCLENBQUksQ0FBSCxFQUFqQixRQUFBLEdBQWdCO0NBSGhCLENBSUssQ0FBTCxDQUFNLEVBQU47Q0FKQSxDQUtXLENBQUksQ0FBSCxFQUFaLEdBQUEsR0FBVztDQUxYLENBTU8sR0FBUCxDQUFBO1NBQ0M7Q0FBQSxDQUFNLEVBQUwsS0FBRCxDQUFDO0NBQUQsQ0FBaUIsQ0FBTyxDQUFILE1BQUosS0FBRztFQUNwQixRQUZNO0NBRU4sQ0FBTSxFQUFMLE1BQUEsRUFBRDtDQUFBLENBQW9CLENBQU8sQ0FBSCxNQUFKLFFBQUc7RUFDdkIsUUFITTtDQUdOLENBQU0sRUFBTCxNQUFBO0NBQUQsQ0FBa0IsQ0FBTyxDQUFILE1BQUosTUFBRztVQUhmO1FBTlA7Q0FBQSxDQVdhLElBQWIsS0FBQTtTQUNDO0NBQUEsQ0FBTSxFQUFMLEtBQUQsQ0FBQztDQUFELENBQWlCLENBQU8sQ0FBSCxNQUFKLE1BQUc7RUFDcEIsUUFGWTtDQUVaLENBQU0sRUFBTCxNQUFBLEVBQUQ7Q0FBQSxDQUFvQixDQUFPLENBQUgsTUFBSixTQUFHO0VBQ3ZCLFFBSFk7Q0FHWixDQUFNLEVBQUwsTUFBQTtDQUFELENBQWtCLENBQU8sQ0FBSCxNQUFKLE9BQUc7VUFIVDtRQVhiO0NBREQsS0FBQTtDQUFBLEVBbUJZLENBQVosSUFBQSxPQUFZO0NBbkJaLENBb0JBLENBQXVCLENBQXZCLElBQVMsQ0FBZTtDQUFPLFlBQUQsQ0FBQTtDQUE5QixJQUF1QjtDQXBCdkIsRUFxQmdDLENBQWhDLENBQUEsRUFBQSxDQUFTLENBQXdCO0NBQ2hDLENBQUEsRUFBRyxDQUFhLENBQWhCLENBQUc7Q0FDRCxJQUFBLElBQUQsTUFBQTtRQUY4QjtDQUFoQyxJQUFnQztDQXJCaEMsRUF5QkEsQ0FBQTtDQXpCQSxDQTJCQSxDQUFJLENBQUosR0FBQSxFQUEwQyxPQUExQztDQUVDLElBQUEsS0FBQTtDQUFBLEVBQVEsQ0FBQSxDQUFSLENBQUEsR0FBUTtDQUVSLElBQUEsU0FBTztDQUFQLFlBQ00sR0FETjtDQUVTLEVBQUQsT0FBTixPQUFHO0NBRkwsWUFHTSxFQUhOO0NBSVMsRUFBRCxNQUFOLFFBQUc7Q0FKTCxNQUp5QztDQUExQyxJQUEwQztDQTNCMUMsR0FzQ0EscUJBQUE7Q0F0Q0EsQ0F3Q0EsRUFBQSxJQUFBLE9BQUE7Q0F6REQsRUFlYTs7Q0FmYixFQTJEaUIsTUFBQSxNQUFqQjtDQUNDLE9BQUEsYUFBQTtPQUFBLEtBQUE7Q0FBQSxFQUF3QixDQUF4QixNQUF3QixLQUFnQixNQUF4QztDQUNzQixDQUF0QixDQUFzQyxDQUFBLEtBQUMsRUFBdkMsVUFBcUI7Q0FDbkIsRUFBRyxDQUFKLENBQUMsUUFBRCxDQUFBO0NBQ0MsQ0FBcUIsQ0FBSyxDQUFJLEVBQVQsRUFBckIsVUFBQTtDQUZvQyxPQUNyQztDQURELElBQXNDO0NBN0R2QyxFQTJEaUI7O0NBM0RqQixFQW1FYSxNQUFBLENBQWI7Q0FDSyxFQUFELENBQUssSUFBUixHQUFBLENBQUE7Q0FwRUQsRUFtRWE7O0NBbkViLEVBeUVZLE1BQVo7Q0FFQyxHQUFBLHFCQUFBO0NBQUEsR0FJQSxxQkFBQTtDQUpBLEdBT0EsVUFBQTtDQUdJLEVBQUQsQ0FBSyxPQUFSLENBQUE7Q0FyRkQsRUF5RVk7O0NBekVaLEVBeUYyQixNQUFBLGdCQUEzQjtDQUlDLE9BQUEsc0JBQUE7Q0FBQSxFQUFzQixDQUF0QixJQUFBLENBQVUsS0FBb0M7Q0FBOUMsRUFDQSxDQUFBLElBQTBCLENBQWhCO0NBRFYsQ0FBQSxDQUdtQixDQUFuQixDQUFBLElBQVU7Q0FDVjtDQUFBO1VBQUEseUNBQUE7bUJBQUE7Q0FDQyxHQUFDLENBQWUsSUFBTjtDQUNULENBQU0sRUFBTixJQUFBO0NBQUEsQ0FDSyxDQUFMLEtBQUE7Q0FGRCxPQUFBO0NBREQ7cUJBUjBCO0NBekYzQixFQXlGMkI7O0NBekYzQixFQXVHNEIsTUFBQSxnQkFBNUI7Q0FJQyxPQUFBLCtCQUFBO0NBQUEsRUFBSSxDQUFKLElBQUE7Q0FBQSxFQUNJLENBQUosS0FEQTtDQUFBLENBRzBDLENBQTFDLENBQUEsV0FBaUIsR0FBakI7Q0FIQSxDQUl3QyxDQUF4QyxDQUFBLFNBQWUsS0FBZjtDQUpBLEdBTUEsSUFBVTtDQU5WLEVBT0EsQ0FBQSxJQUFBLE1BQWdCO0NBUGhCLEVBU0ssQ0FBTDtDQVRBLEVBVUEsQ0FBQSxLQUFXLE9BQUs7Q0FFaEI7Q0FBQTtVQUFBLHlDQUFBO3NCQUFBO0NBQ0MsQ0FBZSxDQUFmLENBQUEsQ0FBUyxDQUFUO0NBQUEsQ0FDcUIsQ0FBckIsQ0FBOEIsT0FBZjtDQUZoQjtxQkFoQjJCO0NBdkc1QixFQXVHNEI7O0NBdkc1QixFQTJIbUIsTUFBRSxPQUFyQjtDQUNDLE9BQUEsZUFBQTtDQUFBLEVBQVUsQ0FBVixHQUFBO0NBQUEsRUFDYSxDQUFiLE1BQUE7Q0FEQSxDQUVBLENBQVMsQ0FBVCxFQUFTLENBQUE7Q0FFVCxDQUFPLENBQUcsSUFBSCxHQUFBLENBQUE7Q0FoSVIsRUEySG1COztDQTNIbkIsRUFrSWdCLE1BQUEsS0FBaEI7Q0FDQyxPQUFBLElBQUE7Q0FBQSxDQUFzQixDQUF0QixDQUFBLEtBQUEsT0FBQTtDQUNBLFNBQUE7Q0FDQyxDQUEyQixDQUFZLENBQXhDLEtBQUEsRUFBQSxRQUFBO0NBQ0ssQ0FBNkIsQ0FBakMsQ0FBQSxTQUFBLGNBQUE7Q0FERCxJQUF3QztDQXJJekMsRUFrSWdCOztDQWxJaEI7O0NBSEQifX0seyJvZmZzZXQiOnsibGluZSI6NzA2NCwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL3Jvb20uY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUm9vbVxuXHRjb25zdHJ1Y3RvcjogKCBAZG9tICkgLT4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQTs7QUFBQSxDQUFBLEVBQXVCLEdBQWpCLENBQU47Q0FDYyxDQUFBLENBQUEsV0FBRztDQUFPLEVBQVAsQ0FBRDtDQUFmLEVBQWE7O0NBQWI7O0NBREQifX1dfQ==
*/})()