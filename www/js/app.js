
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

require.aliases = {"app":"src/frontend/scripts","api":"src/frontend/scripts/api","templates":"src/frontend/templates","vendors":"src/frontend/vendors"};
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
require.register('node_modules/isotope-layout/js/isotope', function(require, module, exports){
/*!
 * Isotope v2.2.0
 *
 * Licensed GPLv3 for open source use
 * or Isotope Commercial License for commercial use
 *
 * http://isotope.metafizzy.co
 * Copyright 2015 Metafizzy
 */

( function( window, factory ) {
  'use strict';
  // universal module definition

  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( [
        'outlayer/outlayer',
        'get-size/get-size',
        'matches-selector/matches-selector',
        'fizzy-ui-utils/utils',
        './item',
        './layout-mode',
        // include default layout modes
        './layout-modes/masonry',
        './layout-modes/fit-rows',
        './layout-modes/vertical'
      ],
      function( Outlayer, getSize, matchesSelector, utils, Item, LayoutMode ) {
        return factory( window, Outlayer, getSize, matchesSelector, utils, Item, LayoutMode );
      });
  } else if ( typeof exports == 'object' ) {
    // CommonJS
    module.exports = factory(
      window,
      require('outlayer'),
      require('get-size'),
      require('desandro-matches-selector'),
      require('fizzy-ui-utils'),
      require('./item'),
      require('./layout-mode'),
      // include default layout modes
      require('./layout-modes/masonry'),
      require('./layout-modes/fit-rows'),
      require('./layout-modes/vertical')
    );
  } else {
    // browser global
    window.Isotope = factory(
      window,
      window.Outlayer,
      window.getSize,
      window.matchesSelector,
      window.fizzyUIUtils,
      window.Isotope.Item,
      window.Isotope.LayoutMode
    );
  }

}( window, function factory( window, Outlayer, getSize, matchesSelector, utils,
  Item, LayoutMode ) {

'use strict';

// -------------------------- vars -------------------------- //

var jQuery = window.jQuery;

// -------------------------- helpers -------------------------- //

var trim = String.prototype.trim ?
  function( str ) {
    return str.trim();
  } :
  function( str ) {
    return str.replace( /^\s+|\s+$/g, '' );
  };

var docElem = document.documentElement;

var getText = docElem.textContent ?
  function( elem ) {
    return elem.textContent;
  } :
  function( elem ) {
    return elem.innerText;
  };

// -------------------------- isotopeDefinition -------------------------- //

  // create an Outlayer layout class
  var Isotope = Outlayer.create( 'isotope', {
    layoutMode: "masonry",
    isJQueryFiltering: true,
    sortAscending: true
  });

  Isotope.Item = Item;
  Isotope.LayoutMode = LayoutMode;

  Isotope.prototype._create = function() {
    this.itemGUID = 0;
    // functions that sort items
    this._sorters = {};
    this._getSorters();
    // call super
    Outlayer.prototype._create.call( this );

    // create layout modes
    this.modes = {};
    // start filteredItems with all items
    this.filteredItems = this.items;
    // keep of track of sortBys
    this.sortHistory = [ 'original-order' ];
    // create from registered layout modes
    for ( var name in LayoutMode.modes ) {
      this._initLayoutMode( name );
    }
  };

  Isotope.prototype.reloadItems = function() {
    // reset item ID counter
    this.itemGUID = 0;
    // call super
    Outlayer.prototype.reloadItems.call( this );
  };

  Isotope.prototype._itemize = function() {
    var items = Outlayer.prototype._itemize.apply( this, arguments );
    // assign ID for original-order
    for ( var i=0, len = items.length; i < len; i++ ) {
      var item = items[i];
      item.id = this.itemGUID++;
    }
    this._updateItemsSortData( items );
    return items;
  };


  // -------------------------- layout -------------------------- //

  Isotope.prototype._initLayoutMode = function( name ) {
    var Mode = LayoutMode.modes[ name ];
    // set mode options
    // HACK extend initial options, back-fill in default options
    var initialOpts = this.options[ name ] || {};
    this.options[ name ] = Mode.options ?
      utils.extend( Mode.options, initialOpts ) : initialOpts;
    // init layout mode instance
    this.modes[ name ] = new Mode( this );
  };


  Isotope.prototype.layout = function() {
    // if first time doing layout, do all magic
    if ( !this._isLayoutInited && this.options.isInitLayout ) {
      this.arrange();
      return;
    }
    this._layout();
  };

  // private method to be used in layout() & magic()
  Isotope.prototype._layout = function() {
    // don't animate first layout
    var isInstant = this._getIsInstant();
    // layout flow
    this._resetLayout();
    this._manageStamps();
    this.layoutItems( this.filteredItems, isInstant );

    // flag for initalized
    this._isLayoutInited = true;
  };

  // filter + sort + layout
  Isotope.prototype.arrange = function( opts ) {
    // set any options pass
    this.option( opts );
    this._getIsInstant();
    // filter, sort, and layout

    // filter
    var filtered = this._filter( this.items );
    this.filteredItems = filtered.matches;

    var _this = this;
    function hideReveal() {
      _this.reveal( filtered.needReveal );
      _this.hide( filtered.needHide );
    }

    this._bindArrangeComplete();

    if ( this._isInstant ) {
      this._noTransition( hideReveal );
    } else {
      hideReveal();
    }

    this._sort();
    this._layout();
  };
  // alias to _init for main plugin method
  Isotope.prototype._init = Isotope.prototype.arrange;

  // HACK
  // Don't animate/transition first layout
  // Or don't animate/transition other layouts
  Isotope.prototype._getIsInstant = function() {
    var isInstant = this.options.isLayoutInstant !== undefined ?
      this.options.isLayoutInstant : !this._isLayoutInited;
    this._isInstant = isInstant;
    return isInstant;
  };

  // listen for layoutComplete, hideComplete and revealComplete
  // to trigger arrangeComplete
  Isotope.prototype._bindArrangeComplete = function() {
    // listen for 3 events to trigger arrangeComplete
    var isLayoutComplete, isHideComplete, isRevealComplete;
    var _this = this;
    function arrangeParallelCallback() {
      if ( isLayoutComplete && isHideComplete && isRevealComplete ) {
        _this.emitEvent( 'arrangeComplete', [ _this.filteredItems ] );
      }
    }
    this.once( 'layoutComplete', function() {
      isLayoutComplete = true;
      arrangeParallelCallback();
    });
    this.once( 'hideComplete', function() {
      isHideComplete = true;
      arrangeParallelCallback();
    });
    this.once( 'revealComplete', function() {
      isRevealComplete = true;
      arrangeParallelCallback();
    });
  };

  // -------------------------- filter -------------------------- //

  Isotope.prototype._filter = function( items ) {
    var filter = this.options.filter;
    filter = filter || '*';
    var matches = [];
    var hiddenMatched = [];
    var visibleUnmatched = [];

    var test = this._getFilterTest( filter );

    // test each item
    for ( var i=0, len = items.length; i < len; i++ ) {
      var item = items[i];
      if ( item.isIgnored ) {
        continue;
      }
      // add item to either matched or unmatched group
      var isMatched = test( item );
      // item.isFilterMatched = isMatched;
      // add to matches if its a match
      if ( isMatched ) {
        matches.push( item );
      }
      // add to additional group if item needs to be hidden or revealed
      if ( isMatched && item.isHidden ) {
        hiddenMatched.push( item );
      } else if ( !isMatched && !item.isHidden ) {
        visibleUnmatched.push( item );
      }
    }

    // return collections of items to be manipulated
    return {
      matches: matches,
      needReveal: hiddenMatched,
      needHide: visibleUnmatched
    };
  };

  // get a jQuery, function, or a matchesSelector test given the filter
  Isotope.prototype._getFilterTest = function( filter ) {
    if ( jQuery && this.options.isJQueryFiltering ) {
      // use jQuery
      return function( item ) {
        return jQuery( item.element ).is( filter );
      };
    }
    if ( typeof filter == 'function' ) {
      // use filter as function
      return function( item ) {
        return filter( item.element );
      };
    }
    // default, use filter as selector string
    return function( item ) {
      return matchesSelector( item.element, filter );
    };
  };

  // -------------------------- sorting -------------------------- //

  /**
   * @params {Array} elems
   * @public
   */
  Isotope.prototype.updateSortData = function( elems ) {
    // get items
    var items;
    if ( elems ) {
      elems = utils.makeArray( elems );
      items = this.getItems( elems );
    } else {
      // update all items if no elems provided
      items = this.items;
    }

    this._getSorters();
    this._updateItemsSortData( items );
  };

  Isotope.prototype._getSorters = function() {
    var getSortData = this.options.getSortData;
    for ( var key in getSortData ) {
      var sorter = getSortData[ key ];
      this._sorters[ key ] = mungeSorter( sorter );
    }
  };

  /**
   * @params {Array} items - of Isotope.Items
   * @private
   */
  Isotope.prototype._updateItemsSortData = function( items ) {
    // do not update if no items
    var len = items && items.length;

    for ( var i=0; len && i < len; i++ ) {
      var item = items[i];
      item.updateSortData();
    }
  };

  // ----- munge sorter ----- //

  // encapsulate this, as we just need mungeSorter
  // other functions in here are just for munging
  var mungeSorter = ( function() {
    // add a magic layer to sorters for convienent shorthands
    // `.foo-bar` will use the text of .foo-bar querySelector
    // `[foo-bar]` will use attribute
    // you can also add parser
    // `.foo-bar parseInt` will parse that as a number
    function mungeSorter( sorter ) {
      // if not a string, return function or whatever it is
      if ( typeof sorter != 'string' ) {
        return sorter;
      }
      // parse the sorter string
      var args = trim( sorter ).split(' ');
      var query = args[0];
      // check if query looks like [an-attribute]
      var attrMatch = query.match( /^\[(.+)\]$/ );
      var attr = attrMatch && attrMatch[1];
      var getValue = getValueGetter( attr, query );
      // use second argument as a parser
      var parser = Isotope.sortDataParsers[ args[1] ];
      // parse the value, if there was a parser
      sorter = parser ? function( elem ) {
        return elem && parser( getValue( elem ) );
      } :
      // otherwise just return value
      function( elem ) {
        return elem && getValue( elem );
      };

      return sorter;
    }

    // get an attribute getter, or get text of the querySelector
    function getValueGetter( attr, query ) {
      var getValue;
      // if query looks like [foo-bar], get attribute
      if ( attr ) {
        getValue = function( elem ) {
          return elem.getAttribute( attr );
        };
      } else {
        // otherwise, assume its a querySelector, and get its text
        getValue = function( elem ) {
          var child = elem.querySelector( query );
          return child && getText( child );
        };
      }
      return getValue;
    }

    return mungeSorter;
  })();

  // parsers used in getSortData shortcut strings
  Isotope.sortDataParsers = {
    'parseInt': function( val ) {
      return parseInt( val, 10 );
    },
    'parseFloat': function( val ) {
      return parseFloat( val );
    }
  };

  // ----- sort method ----- //

  // sort filteredItem order
  Isotope.prototype._sort = function() {
    var sortByOpt = this.options.sortBy;
    if ( !sortByOpt ) {
      return;
    }
    // concat all sortBy and sortHistory
    var sortBys = [].concat.apply( sortByOpt, this.sortHistory );
    // sort magic
    var itemSorter = getItemSorter( sortBys, this.options.sortAscending );
    this.filteredItems.sort( itemSorter );
    // keep track of sortBy History
    if ( sortByOpt != this.sortHistory[0] ) {
      // add to front, oldest goes in last
      this.sortHistory.unshift( sortByOpt );
    }
  };

  // returns a function used for sorting
  function getItemSorter( sortBys, sortAsc ) {
    return function sorter( itemA, itemB ) {
      // cycle through all sortKeys
      for ( var i = 0, len = sortBys.length; i < len; i++ ) {
        var sortBy = sortBys[i];
        var a = itemA.sortData[ sortBy ];
        var b = itemB.sortData[ sortBy ];
        if ( a > b || a < b ) {
          // if sortAsc is an object, use the value given the sortBy key
          var isAscending = sortAsc[ sortBy ] !== undefined ? sortAsc[ sortBy ] : sortAsc;
          var direction = isAscending ? 1 : -1;
          return ( a > b ? 1 : -1 ) * direction;
        }
      }
      return 0;
    };
  }

  // -------------------------- methods -------------------------- //

  // get layout mode
  Isotope.prototype._mode = function() {
    var layoutMode = this.options.layoutMode;
    var mode = this.modes[ layoutMode ];
    if ( !mode ) {
      // TODO console.error
      throw new Error( 'No layout mode: ' + layoutMode );
    }
    // HACK sync mode's options
    // any options set after init for layout mode need to be synced
    mode.options = this.options[ layoutMode ];
    return mode;
  };

  Isotope.prototype._resetLayout = function() {
    // trigger original reset layout
    Outlayer.prototype._resetLayout.call( this );
    this._mode()._resetLayout();
  };

  Isotope.prototype._getItemLayoutPosition = function( item  ) {
    return this._mode()._getItemLayoutPosition( item );
  };

  Isotope.prototype._manageStamp = function( stamp ) {
    this._mode()._manageStamp( stamp );
  };

  Isotope.prototype._getContainerSize = function() {
    return this._mode()._getContainerSize();
  };

  Isotope.prototype.needsResizeLayout = function() {
    return this._mode().needsResizeLayout();
  };

  // -------------------------- adding & removing -------------------------- //

  // HEADS UP overwrites default Outlayer appended
  Isotope.prototype.appended = function( elems ) {
    var items = this.addItems( elems );
    if ( !items.length ) {
      return;
    }
    // filter, layout, reveal new items
    var filteredItems = this._filterRevealAdded( items );
    // add to filteredItems
    this.filteredItems = this.filteredItems.concat( filteredItems );
  };

  // HEADS UP overwrites default Outlayer prepended
  Isotope.prototype.prepended = function( elems ) {
    var items = this._itemize( elems );
    if ( !items.length ) {
      return;
    }
    // start new layout
    this._resetLayout();
    this._manageStamps();
    // filter, layout, reveal new items
    var filteredItems = this._filterRevealAdded( items );
    // layout previous items
    this.layoutItems( this.filteredItems );
    // add to items and filteredItems
    this.filteredItems = filteredItems.concat( this.filteredItems );
    this.items = items.concat( this.items );
  };

  Isotope.prototype._filterRevealAdded = function( items ) {
    var filtered = this._filter( items );
    this.hide( filtered.needHide );
    // reveal all new items
    this.reveal( filtered.matches );
    // layout new items, no transition
    this.layoutItems( filtered.matches, true );
    return filtered.matches;
  };

  /**
   * Filter, sort, and layout newly-appended item elements
   * @param {Array or NodeList or Element} elems
   */
  Isotope.prototype.insert = function( elems ) {
    var items = this.addItems( elems );
    if ( !items.length ) {
      return;
    }
    // append item elements
    var i, item;
    var len = items.length;
    for ( i=0; i < len; i++ ) {
      item = items[i];
      this.element.appendChild( item.element );
    }
    // filter new stuff
    var filteredInsertItems = this._filter( items ).matches;
    // set flag
    for ( i=0; i < len; i++ ) {
      items[i].isLayoutInstant = true;
    }
    this.arrange();
    // reset flag
    for ( i=0; i < len; i++ ) {
      delete items[i].isLayoutInstant;
    }
    this.reveal( filteredInsertItems );
  };

  var _remove = Isotope.prototype.remove;
  Isotope.prototype.remove = function( elems ) {
    elems = utils.makeArray( elems );
    var removeItems = this.getItems( elems );
    // do regular thing
    _remove.call( this, elems );
    // bail if no items to remove
    var len = removeItems && removeItems.length;
    if ( !len ) {
      return;
    }
    // remove elems from filteredItems
    for ( var i=0; i < len; i++ ) {
      var item = removeItems[i];
      // remove item from collection
      utils.removeFrom( this.filteredItems, item );
    }
  };

  Isotope.prototype.shuffle = function() {
    // update random sortData
    for ( var i=0, len = this.items.length; i < len; i++ ) {
      var item = this.items[i];
      item.sortData.random = Math.random();
    }
    this.options.sortBy = 'random';
    this._sort();
    this._layout();
  };

  /**
   * trigger fn without transition
   * kind of hacky to have this in the first place
   * @param {Function} fn
   * @returns ret
   * @private
   */
  Isotope.prototype._noTransition = function( fn ) {
    // save transitionDuration before disabling
    var transitionDuration = this.options.transitionDuration;
    // disable transition
    this.options.transitionDuration = 0;
    // do it
    var returnValue = fn.call( this );
    // re-enable transition for reveal
    this.options.transitionDuration = transitionDuration;
    return returnValue;
  };

  // ----- helper methods ----- //

  /**
   * getter method for getting filtered item elements
   * @returns {Array} elems - collection of item elements
   */
  Isotope.prototype.getFilteredItemElements = function() {
    var elems = [];
    for ( var i=0, len = this.filteredItems.length; i < len; i++ ) {
      elems.push( this.filteredItems[i].element );
    }
    return elems;
  };

  // -----  ----- //

  return Isotope;

}));

}, {"outlayer":"node_modules/isotope-layout/node_modules/outlayer/outlayer","get-size":"node_modules/isotope-layout/node_modules/get-size/get-size","desandro-matches-selector":"node_modules/isotope-layout/node_modules/desandro-matches-selector/matches-selector","fizzy-ui-utils":"node_modules/isotope-layout/node_modules/fizzy-ui-utils/utils","./item":"node_modules/isotope-layout/js/item","./layout-mode":"node_modules/isotope-layout/js/layout-mode","./layout-modes/masonry":"node_modules/isotope-layout/js/layout-modes/masonry","./layout-modes/fit-rows":"node_modules/isotope-layout/js/layout-modes/fit-rows","./layout-modes/vertical":"node_modules/isotope-layout/js/layout-modes/vertical"});
require.register('node_modules/isotope-layout/js/item', function(require, module, exports){
/**
 * Isotope Item
**/

( function( window, factory ) {
'use strict';
  // universal module definition
  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( [
        'outlayer/outlayer'
      ],
      factory );
  } else if ( typeof exports == 'object' ) {
    // CommonJS
    module.exports = factory(
      require('outlayer')
    );
  } else {
    // browser global
    window.Isotope = window.Isotope || {};
    window.Isotope.Item = factory(
      window.Outlayer
    );
  }

}( window, function factory( Outlayer ) {
'use strict';

// -------------------------- Item -------------------------- //

// sub-class Outlayer Item
function Item() {
  Outlayer.Item.apply( this, arguments );
}

Item.prototype = new Outlayer.Item();

Item.prototype._create = function() {
  // assign id, used for original-order sorting
  this.id = this.layout.itemGUID++;
  Outlayer.Item.prototype._create.call( this );
  this.sortData = {};
};

Item.prototype.updateSortData = function() {
  if ( this.isIgnored ) {
    return;
  }
  // default sorters
  this.sortData.id = this.id;
  // for backward compatibility
  this.sortData['original-order'] = this.id;
  this.sortData.random = Math.random();
  // go thru getSortData obj and apply the sorters
  var getSortData = this.layout.options.getSortData;
  var sorters = this.layout._sorters;
  for ( var key in getSortData ) {
    var sorter = sorters[ key ];
    this.sortData[ key ] = sorter( this.element, this );
  }
};

var _destroy = Item.prototype.destroy;
Item.prototype.destroy = function() {
  // call super
  _destroy.apply( this, arguments );
  // reset display, #741
  this.css({
    display: ''
  });
};

return Item;

}));

}, {"outlayer":"node_modules/isotope-layout/node_modules/outlayer/outlayer"});
require.register('node_modules/isotope-layout/js/layout-mode', function(require, module, exports){
/**
 * Isotope LayoutMode
 */

( function( window, factory ) {
  'use strict';
  // universal module definition

  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( [
        'get-size/get-size',
        'outlayer/outlayer'
      ],
      factory );
  } else if ( typeof exports == 'object' ) {
    // CommonJS
    module.exports = factory(
      require('get-size'),
      require('outlayer')
    );
  } else {
    // browser global
    window.Isotope = window.Isotope || {};
    window.Isotope.LayoutMode = factory(
      window.getSize,
      window.Outlayer
    );
  }

}( window, function factory( getSize, Outlayer ) {
  'use strict';

  // layout mode class
  function LayoutMode( isotope ) {
    this.isotope = isotope;
    // link properties
    if ( isotope ) {
      this.options = isotope.options[ this.namespace ];
      this.element = isotope.element;
      this.items = isotope.filteredItems;
      this.size = isotope.size;
    }
  }

  /**
   * some methods should just defer to default Outlayer method
   * and reference the Isotope instance as `this`
  **/
  ( function() {
    var facadeMethods = [
      '_resetLayout',
      '_getItemLayoutPosition',
      '_manageStamp',
      '_getContainerSize',
      '_getElementOffset',
      'needsResizeLayout'
    ];

    for ( var i=0, len = facadeMethods.length; i < len; i++ ) {
      var methodName = facadeMethods[i];
      LayoutMode.prototype[ methodName ] = getOutlayerMethod( methodName );
    }

    function getOutlayerMethod( methodName ) {
      return function() {
        return Outlayer.prototype[ methodName ].apply( this.isotope, arguments );
      };
    }
  })();

  // -----  ----- //

  // for horizontal layout modes, check vertical size
  LayoutMode.prototype.needsVerticalResizeLayout = function() {
    // don't trigger if size did not change
    var size = getSize( this.isotope.element );
    // check that this.size and size are there
    // IE8 triggers resize on body size change, so they might not be
    var hasSizes = this.isotope.size && size;
    return hasSizes && size.innerHeight != this.isotope.size.innerHeight;
  };

  // ----- measurements ----- //

  LayoutMode.prototype._getMeasurement = function() {
    this.isotope._getMeasurement.apply( this, arguments );
  };

  LayoutMode.prototype.getColumnWidth = function() {
    this.getSegmentSize( 'column', 'Width' );
  };

  LayoutMode.prototype.getRowHeight = function() {
    this.getSegmentSize( 'row', 'Height' );
  };

  /**
   * get columnWidth or rowHeight
   * segment: 'column' or 'row'
   * size 'Width' or 'Height'
  **/
  LayoutMode.prototype.getSegmentSize = function( segment, size ) {
    var segmentName = segment + size;
    var outerSize = 'outer' + size;
    // columnWidth / outerWidth // rowHeight / outerHeight
    this._getMeasurement( segmentName, outerSize );
    // got rowHeight or columnWidth, we can chill
    if ( this[ segmentName ] ) {
      return;
    }
    // fall back to item of first element
    var firstItemSize = this.getFirstItemSize();
    this[ segmentName ] = firstItemSize && firstItemSize[ outerSize ] ||
      // or size of container
      this.isotope.size[ 'inner' + size ];
  };

  LayoutMode.prototype.getFirstItemSize = function() {
    var firstItem = this.isotope.filteredItems[0];
    return firstItem && firstItem.element && getSize( firstItem.element );
  };

  // ----- methods that should reference isotope ----- //

  LayoutMode.prototype.layout = function() {
    this.isotope.layout.apply( this.isotope, arguments );
  };

  LayoutMode.prototype.getSize = function() {
    this.isotope.getSize();
    this.size = this.isotope.size;
  };

  // -------------------------- create -------------------------- //

  LayoutMode.modes = {};

  LayoutMode.create = function( namespace, options ) {

    function Mode() {
      LayoutMode.apply( this, arguments );
    }

    Mode.prototype = new LayoutMode();

    // default options
    if ( options ) {
      Mode.options = options;
    }

    Mode.prototype.namespace = namespace;
    // register in Isotope
    LayoutMode.modes[ namespace ] = Mode;

    return Mode;
  };

  return LayoutMode;

}));

}, {"get-size":"node_modules/isotope-layout/node_modules/get-size/get-size","outlayer":"node_modules/isotope-layout/node_modules/outlayer/outlayer"});
require.register('node_modules/isotope-layout/js/layout-modes/fit-rows', function(require, module, exports){
/**
 * fitRows layout mode
 */

( function( window, factory ) {
  'use strict';
  // universal module definition
  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( [
        '../layout-mode'
      ],
      factory );
  } else if ( typeof exports == 'object' ) {
    // CommonJS
    module.exports = factory(
      require('../layout-mode')
    );
  } else {
    // browser global
    factory(
      window.Isotope.LayoutMode
    );
  }

}( window, function factory( LayoutMode ) {
'use strict';

var FitRows = LayoutMode.create('fitRows');

FitRows.prototype._resetLayout = function() {
  this.x = 0;
  this.y = 0;
  this.maxY = 0;
  this._getMeasurement( 'gutter', 'outerWidth' );
};

FitRows.prototype._getItemLayoutPosition = function( item ) {
  item.getSize();

  var itemWidth = item.size.outerWidth + this.gutter;
  // if this element cannot fit in the current row
  var containerWidth = this.isotope.size.innerWidth + this.gutter;
  if ( this.x !== 0 && itemWidth + this.x > containerWidth ) {
    this.x = 0;
    this.y = this.maxY;
  }

  var position = {
    x: this.x,
    y: this.y
  };

  this.maxY = Math.max( this.maxY, this.y + item.size.outerHeight );
  this.x += itemWidth;

  return position;
};

FitRows.prototype._getContainerSize = function() {
  return { height: this.maxY };
};

return FitRows;

}));

}, {"../layout-mode":"node_modules/isotope-layout/js/layout-mode"});
require.register('node_modules/isotope-layout/js/layout-modes/masonry', function(require, module, exports){
/*!
 * Masonry layout mode
 * sub-classes Masonry
 * http://masonry.desandro.com
 */

( function( window, factory ) {
  'use strict';
  // universal module definition
  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( [
        '../layout-mode',
        'masonry/masonry'
      ],
      factory );
  } else if ( typeof exports == 'object' ) {
    // CommonJS
    module.exports = factory(
      require('../layout-mode'),
      require('masonry-layout')
    );
  } else {
    // browser global
    factory(
      window.Isotope.LayoutMode,
      window.Masonry
    );
  }

}( window, function factory( LayoutMode, Masonry ) {
'use strict';

// -------------------------- helpers -------------------------- //

// extend objects
function extend( a, b ) {
  for ( var prop in b ) {
    a[ prop ] = b[ prop ];
  }
  return a;
}

// -------------------------- masonryDefinition -------------------------- //

  // create an Outlayer layout class
  var MasonryMode = LayoutMode.create('masonry');

  // save on to these methods
  var _getElementOffset = MasonryMode.prototype._getElementOffset;
  var layout = MasonryMode.prototype.layout;
  var _getMeasurement = MasonryMode.prototype._getMeasurement;

  // sub-class Masonry
  extend( MasonryMode.prototype, Masonry.prototype );

  // set back, as it was overwritten by Masonry
  MasonryMode.prototype._getElementOffset = _getElementOffset;
  MasonryMode.prototype.layout = layout;
  MasonryMode.prototype._getMeasurement = _getMeasurement;

  var measureColumns = MasonryMode.prototype.measureColumns;
  MasonryMode.prototype.measureColumns = function() {
    // set items, used if measuring first item
    this.items = this.isotope.filteredItems;
    measureColumns.call( this );
  };

  // HACK copy over isOriginLeft/Top options
  var _manageStamp = MasonryMode.prototype._manageStamp;
  MasonryMode.prototype._manageStamp = function() {
    this.options.isOriginLeft = this.isotope.options.isOriginLeft;
    this.options.isOriginTop = this.isotope.options.isOriginTop;
    _manageStamp.apply( this, arguments );
  };

  return MasonryMode;

}));

}, {"../layout-mode":"node_modules/isotope-layout/js/layout-mode","masonry-layout":"node_modules/isotope-layout/node_modules/masonry-layout/masonry"});
require.register('node_modules/isotope-layout/js/layout-modes/vertical', function(require, module, exports){
/**
 * vertical layout mode
 */

( function( window, factory ) {
  'use strict';
  // universal module definition
  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( [
        '../layout-mode'
      ],
      factory );
  } else if ( typeof exports == 'object' ) {
    // CommonJS
    module.exports = factory(
      require('../layout-mode')
    );
  } else {
    // browser global
    factory(
      window.Isotope.LayoutMode
    );
  }

}( window, function factory( LayoutMode ) {
'use strict';

var Vertical = LayoutMode.create( 'vertical', {
  horizontalAlignment: 0
});

Vertical.prototype._resetLayout = function() {
  this.y = 0;
};

Vertical.prototype._getItemLayoutPosition = function( item ) {
  item.getSize();
  var x = ( this.isotope.size.innerWidth - item.size.outerWidth ) *
    this.options.horizontalAlignment;
  var y = this.y;
  this.y += item.size.outerHeight;
  return { x: x, y: y };
};

Vertical.prototype._getContainerSize = function() {
  return { height: this.y };
};

return Vertical;

}));

}, {"../layout-mode":"node_modules/isotope-layout/js/layout-mode"});
require.register('node_modules/isotope-layout/node_modules/desandro-matches-selector/matches-selector', function(require, module, exports){
/**
 * matchesSelector v1.0.3
 * matchesSelector( element, '.selector' )
 * MIT license
 */

/*jshint browser: true, strict: true, undef: true, unused: true */
/*global define: false, module: false */

( function( ElemProto ) {

  'use strict';

  var matchesMethod = ( function() {
    // check for the standard method name first
    if ( ElemProto.matches ) {
      return 'matches';
    }
    // check un-prefixed
    if ( ElemProto.matchesSelector ) {
      return 'matchesSelector';
    }
    // check vendor prefixes
    var prefixes = [ 'webkit', 'moz', 'ms', 'o' ];

    for ( var i=0, len = prefixes.length; i < len; i++ ) {
      var prefix = prefixes[i];
      var method = prefix + 'MatchesSelector';
      if ( ElemProto[ method ] ) {
        return method;
      }
    }
  })();

  // ----- match ----- //

  function match( elem, selector ) {
    return elem[ matchesMethod ]( selector );
  }

  // ----- appendToFragment ----- //

  function checkParent( elem ) {
    // not needed if already has parent
    if ( elem.parentNode ) {
      return;
    }
    var fragment = document.createDocumentFragment();
    fragment.appendChild( elem );
  }

  // ----- query ----- //

  // fall back to using QSA
  // thx @jonathantneal https://gist.github.com/3062955
  function query( elem, selector ) {
    // append to fragment if no parent
    checkParent( elem );

    // match elem with all selected elems of parent
    var elems = elem.parentNode.querySelectorAll( selector );
    for ( var i=0, len = elems.length; i < len; i++ ) {
      // return true if match
      if ( elems[i] === elem ) {
        return true;
      }
    }
    // otherwise return false
    return false;
  }

  // ----- matchChild ----- //

  function matchChild( elem, selector ) {
    checkParent( elem );
    return match( elem, selector );
  }

  // ----- matchesSelector ----- //

  var matchesSelector;

  if ( matchesMethod ) {
    // IE9 supports matchesSelector, but doesn't work on orphaned elems
    // check for that
    var div = document.createElement('div');
    var supportsOrphans = match( div, 'div' );
    matchesSelector = supportsOrphans ? match : matchChild;
  } else {
    matchesSelector = query;
  }

  // transport
  if ( typeof define === 'function' && define.amd ) {
    // AMD
    define( function() {
      return matchesSelector;
    });
  } else if ( typeof exports === 'object' ) {
    module.exports = matchesSelector;
  }
  else {
    // browser global
    window.matchesSelector = matchesSelector;
  }

})( Element.prototype );

}, {});
require.register('node_modules/isotope-layout/node_modules/fizzy-ui-utils/node_modules/doc-ready/doc-ready', function(require, module, exports){
/*!
 * docReady v1.0.3
 * Cross browser DOMContentLoaded event emitter
 * MIT license
 */

/*jshint browser: true, strict: true, undef: true, unused: true*/
/*global define: false, require: false, module: false */

( function( window ) {

'use strict';

var document = window.document;
// collection of functions to be triggered on ready
var queue = [];

function docReady( fn ) {
  // throw out non-functions
  if ( typeof fn !== 'function' ) {
    return;
  }

  if ( docReady.isReady ) {
    // ready now, hit it
    fn();
  } else {
    // queue function when ready
    queue.push( fn );
  }
}

docReady.isReady = false;

// triggered on various doc ready events
function init( event ) {
  // bail if IE8 document is not ready just yet
  var isIE8NotReady = event.type === 'readystatechange' && document.readyState !== 'complete';
  if ( docReady.isReady || isIE8NotReady ) {
    return;
  }
  docReady.isReady = true;

  // process queue
  for ( var i=0, len = queue.length; i < len; i++ ) {
    var fn = queue[i];
    fn();
  }
}

function defineDocReady( eventie ) {
  eventie.bind( document, 'DOMContentLoaded', init );
  eventie.bind( document, 'readystatechange', init );
  eventie.bind( window, 'load', init );

  return docReady;
}

// transport
if ( typeof define === 'function' && define.amd ) {
  // AMD
  // if RequireJS, then doc is already ready
  docReady.isReady = typeof requirejs === 'function';
  define( [ 'eventie/eventie' ], defineDocReady );
} else if ( typeof exports === 'object' ) {
  module.exports = defineDocReady( require('eventie') );
} else {
  // browser global
  window.docReady = defineDocReady( window.eventie );
}

})( window );

}, {"eventie":"node_modules/isotope-layout/node_modules/fizzy-ui-utils/node_modules/doc-ready/node_modules/eventie/eventie"});
require.register('node_modules/isotope-layout/node_modules/fizzy-ui-utils/node_modules/doc-ready/node_modules/eventie/eventie', function(require, module, exports){
/*!
 * eventie v1.0.6
 * event binding helper
 *   eventie.bind( elem, 'click', myFn )
 *   eventie.unbind( elem, 'click', myFn )
 * MIT license
 */

/*jshint browser: true, undef: true, unused: true */
/*global define: false, module: false */

( function( window ) {

'use strict';

var docElem = document.documentElement;

var bind = function() {};

function getIEEvent( obj ) {
  var event = window.event;
  // add event.target
  event.target = event.target || event.srcElement || obj;
  return event;
}

if ( docElem.addEventListener ) {
  bind = function( obj, type, fn ) {
    obj.addEventListener( type, fn, false );
  };
} else if ( docElem.attachEvent ) {
  bind = function( obj, type, fn ) {
    obj[ type + fn ] = fn.handleEvent ?
      function() {
        var event = getIEEvent( obj );
        fn.handleEvent.call( fn, event );
      } :
      function() {
        var event = getIEEvent( obj );
        fn.call( obj, event );
      };
    obj.attachEvent( "on" + type, obj[ type + fn ] );
  };
}

var unbind = function() {};

if ( docElem.removeEventListener ) {
  unbind = function( obj, type, fn ) {
    obj.removeEventListener( type, fn, false );
  };
} else if ( docElem.detachEvent ) {
  unbind = function( obj, type, fn ) {
    obj.detachEvent( "on" + type, obj[ type + fn ] );
    try {
      delete obj[ type + fn ];
    } catch ( err ) {
      // can't delete window object properties
      obj[ type + fn ] = undefined;
    }
  };
}

var eventie = {
  bind: bind,
  unbind: unbind
};

// ----- module definition ----- //

if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( eventie );
} else if ( typeof exports === 'object' ) {
  // CommonJS
  module.exports = eventie;
} else {
  // browser global
  window.eventie = eventie;
}

})( window );

}, {});
require.register('node_modules/isotope-layout/node_modules/fizzy-ui-utils/utils', function(require, module, exports){
/**
 * Fizzy UI utils v1.0.1
 * MIT license
 */

/*jshint browser: true, undef: true, unused: true, strict: true */

( function( window, factory ) {
  /*global define: false, module: false, require: false */
  'use strict';
  // universal module definition

  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( [
      'doc-ready/doc-ready',
      'matches-selector/matches-selector'
    ], function( docReady, matchesSelector ) {
      return factory( window, docReady, matchesSelector );
    });
  } else if ( typeof exports == 'object' ) {
    // CommonJS
    module.exports = factory(
      window,
      require('doc-ready'),
      require('desandro-matches-selector')
    );
  } else {
    // browser global
    window.fizzyUIUtils = factory(
      window,
      window.docReady,
      window.matchesSelector
    );
  }

}( window, function factory( window, docReady, matchesSelector ) {

'use strict';

var utils = {};

// ----- extend ----- //

// extends objects
utils.extend = function( a, b ) {
  for ( var prop in b ) {
    a[ prop ] = b[ prop ];
  }
  return a;
};

// ----- modulo ----- //

utils.modulo = function( num, div ) {
  return ( ( num % div ) + div ) % div;
};

// ----- isArray ----- //
  
var objToString = Object.prototype.toString;
utils.isArray = function( obj ) {
  return objToString.call( obj ) == '[object Array]';
};

// ----- makeArray ----- //

// turn element or nodeList into an array
utils.makeArray = function( obj ) {
  var ary = [];
  if ( utils.isArray( obj ) ) {
    // use object if already an array
    ary = obj;
  } else if ( obj && typeof obj.length == 'number' ) {
    // convert nodeList to array
    for ( var i=0, len = obj.length; i < len; i++ ) {
      ary.push( obj[i] );
    }
  } else {
    // array of single index
    ary.push( obj );
  }
  return ary;
};

// ----- indexOf ----- //

// index of helper cause IE8
utils.indexOf = Array.prototype.indexOf ? function( ary, obj ) {
    return ary.indexOf( obj );
  } : function( ary, obj ) {
    for ( var i=0, len = ary.length; i < len; i++ ) {
      if ( ary[i] === obj ) {
        return i;
      }
    }
    return -1;
  };

// ----- removeFrom ----- //

utils.removeFrom = function( ary, obj ) {
  var index = utils.indexOf( ary, obj );
  if ( index != -1 ) {
    ary.splice( index, 1 );
  }
};

// ----- isElement ----- //

// http://stackoverflow.com/a/384380/182183
utils.isElement = ( typeof HTMLElement == 'function' || typeof HTMLElement == 'object' ) ?
  function isElementDOM2( obj ) {
    return obj instanceof HTMLElement;
  } :
  function isElementQuirky( obj ) {
    return obj && typeof obj == 'object' &&
      obj.nodeType == 1 && typeof obj.nodeName == 'string';
  };

// ----- setText ----- //

utils.setText = ( function() {
  var setTextProperty;
  function setText( elem, text ) {
    // only check setTextProperty once
    setTextProperty = setTextProperty || ( document.documentElement.textContent !== undefined ? 'textContent' : 'innerText' );
    elem[ setTextProperty ] = text;
  }
  return setText;
})();

// ----- getParent ----- //

utils.getParent = function( elem, selector ) {
  while ( elem != document.body ) {
    elem = elem.parentNode;
    if ( matchesSelector( elem, selector ) ) {
      return elem;
    }
  }
};

// ----- getQueryElement ----- //

// use element as selector string
utils.getQueryElement = function( elem ) {
  if ( typeof elem == 'string' ) {
    return document.querySelector( elem );
  }
  return elem;
};

// ----- handleEvent ----- //

// enable .ontype to trigger from .addEventListener( elem, 'type' )
utils.handleEvent = function( event ) {
  var method = 'on' + event.type;
  if ( this[ method ] ) {
    this[ method ]( event );
  }
};

// ----- filterFindElements ----- //

utils.filterFindElements = function( elems, selector ) {
  // make array of elems
  elems = utils.makeArray( elems );
  var ffElems = [];

  for ( var i=0, len = elems.length; i < len; i++ ) {
    var elem = elems[i];
    // check that elem is an actual element
    if ( !utils.isElement( elem ) ) {
      continue;
    }
    // filter & find items if we have a selector
    if ( selector ) {
      // filter siblings
      if ( matchesSelector( elem, selector ) ) {
        ffElems.push( elem );
      }
      // find children
      var childElems = elem.querySelectorAll( selector );
      // concat childElems to filterFound array
      for ( var j=0, jLen = childElems.length; j < jLen; j++ ) {
        ffElems.push( childElems[j] );
      }
    } else {
      ffElems.push( elem );
    }
  }

  return ffElems;
};

// ----- debounceMethod ----- //

utils.debounceMethod = function( _class, methodName, threshold ) {
  // original method
  var method = _class.prototype[ methodName ];
  var timeoutName = methodName + 'Timeout';

  _class.prototype[ methodName ] = function() {
    var timeout = this[ timeoutName ];
    if ( timeout ) {
      clearTimeout( timeout );
    }
    var args = arguments;

    var _this = this;
    this[ timeoutName ] = setTimeout( function() {
      method.apply( _this, args );
      delete _this[ timeoutName ];
    }, threshold || 100 );
  };
};

// ----- htmlInit ----- //

// http://jamesroberts.name/blog/2010/02/22/string-functions-for-javascript-trim-to-camel-case-to-dashed-and-to-underscore/
utils.toDashed = function( str ) {
  return str.replace( /(.)([A-Z])/g, function( match, $1, $2 ) {
    return $1 + '-' + $2;
  }).toLowerCase();
};

var console = window.console;
/**
 * allow user to initialize classes via .js-namespace class
 * htmlInit( Widget, 'widgetName' )
 * options are parsed from data-namespace-option attribute
 */
utils.htmlInit = function( WidgetClass, namespace ) {
  docReady( function() {
    var dashedNamespace = utils.toDashed( namespace );
    var elems = document.querySelectorAll( '.js-' + dashedNamespace );
    var dataAttr = 'data-' + dashedNamespace + '-options';

    for ( var i=0, len = elems.length; i < len; i++ ) {
      var elem = elems[i];
      var attr = elem.getAttribute( dataAttr );
      var options;
      try {
        options = attr && JSON.parse( attr );
      } catch ( error ) {
        // log error, do not initialize
        if ( console ) {
          console.error( 'Error parsing ' + dataAttr + ' on ' +
            elem.nodeName.toLowerCase() + ( elem.id ? '#' + elem.id : '' ) + ': ' +
            error );
        }
        continue;
      }
      // initialize
      var instance = new WidgetClass( elem, options );
      // make available via $().data('layoutname')
      var jQuery = window.jQuery;
      if ( jQuery ) {
        jQuery.data( elem, namespace, instance );
      }
    }
  });
};

// -----  ----- //

return utils;

}));

}, {"doc-ready":"node_modules/isotope-layout/node_modules/fizzy-ui-utils/node_modules/doc-ready/doc-ready","desandro-matches-selector":"node_modules/isotope-layout/node_modules/desandro-matches-selector/matches-selector"});
require.register('node_modules/isotope-layout/node_modules/get-size/get-size', function(require, module, exports){
/*!
 * getSize v1.2.2
 * measure size of elements
 * MIT license
 */

/*jshint browser: true, strict: true, undef: true, unused: true */
/*global define: false, exports: false, require: false, module: false, console: false */

( function( window, undefined ) {

'use strict';

// -------------------------- helpers -------------------------- //

// get a number from a string, not a percentage
function getStyleSize( value ) {
  var num = parseFloat( value );
  // not a percent like '100%', and a number
  var isValid = value.indexOf('%') === -1 && !isNaN( num );
  return isValid && num;
}

function noop() {}

var logError = typeof console === 'undefined' ? noop :
  function( message ) {
    console.error( message );
  };

// -------------------------- measurements -------------------------- //

var measurements = [
  'paddingLeft',
  'paddingRight',
  'paddingTop',
  'paddingBottom',
  'marginLeft',
  'marginRight',
  'marginTop',
  'marginBottom',
  'borderLeftWidth',
  'borderRightWidth',
  'borderTopWidth',
  'borderBottomWidth'
];

function getZeroSize() {
  var size = {
    width: 0,
    height: 0,
    innerWidth: 0,
    innerHeight: 0,
    outerWidth: 0,
    outerHeight: 0
  };
  for ( var i=0, len = measurements.length; i < len; i++ ) {
    var measurement = measurements[i];
    size[ measurement ] = 0;
  }
  return size;
}



function defineGetSize( getStyleProperty ) {

// -------------------------- setup -------------------------- //

var isSetup = false;

var getStyle, boxSizingProp, isBoxSizeOuter;

/**
 * setup vars and functions
 * do it on initial getSize(), rather than on script load
 * For Firefox bug https://bugzilla.mozilla.org/show_bug.cgi?id=548397
 */
function setup() {
  // setup once
  if ( isSetup ) {
    return;
  }
  isSetup = true;

  var getComputedStyle = window.getComputedStyle;
  getStyle = ( function() {
    var getStyleFn = getComputedStyle ?
      function( elem ) {
        return getComputedStyle( elem, null );
      } :
      function( elem ) {
        return elem.currentStyle;
      };

      return function getStyle( elem ) {
        var style = getStyleFn( elem );
        if ( !style ) {
          logError( 'Style returned ' + style +
            '. Are you running this code in a hidden iframe on Firefox? ' +
            'See http://bit.ly/getsizebug1' );
        }
        return style;
      };
  })();

  // -------------------------- box sizing -------------------------- //

  boxSizingProp = getStyleProperty('boxSizing');

  /**
   * WebKit measures the outer-width on style.width on border-box elems
   * IE & Firefox measures the inner-width
   */
  if ( boxSizingProp ) {
    var div = document.createElement('div');
    div.style.width = '200px';
    div.style.padding = '1px 2px 3px 4px';
    div.style.borderStyle = 'solid';
    div.style.borderWidth = '1px 2px 3px 4px';
    div.style[ boxSizingProp ] = 'border-box';

    var body = document.body || document.documentElement;
    body.appendChild( div );
    var style = getStyle( div );

    isBoxSizeOuter = getStyleSize( style.width ) === 200;
    body.removeChild( div );
  }

}

// -------------------------- getSize -------------------------- //

function getSize( elem ) {
  setup();

  // use querySeletor if elem is string
  if ( typeof elem === 'string' ) {
    elem = document.querySelector( elem );
  }

  // do not proceed on non-objects
  if ( !elem || typeof elem !== 'object' || !elem.nodeType ) {
    return;
  }

  var style = getStyle( elem );

  // if hidden, everything is 0
  if ( style.display === 'none' ) {
    return getZeroSize();
  }

  var size = {};
  size.width = elem.offsetWidth;
  size.height = elem.offsetHeight;

  var isBorderBox = size.isBorderBox = !!( boxSizingProp &&
    style[ boxSizingProp ] && style[ boxSizingProp ] === 'border-box' );

  // get all measurements
  for ( var i=0, len = measurements.length; i < len; i++ ) {
    var measurement = measurements[i];
    var value = style[ measurement ];
    value = mungeNonPixel( elem, value );
    var num = parseFloat( value );
    // any 'auto', 'medium' value will be 0
    size[ measurement ] = !isNaN( num ) ? num : 0;
  }

  var paddingWidth = size.paddingLeft + size.paddingRight;
  var paddingHeight = size.paddingTop + size.paddingBottom;
  var marginWidth = size.marginLeft + size.marginRight;
  var marginHeight = size.marginTop + size.marginBottom;
  var borderWidth = size.borderLeftWidth + size.borderRightWidth;
  var borderHeight = size.borderTopWidth + size.borderBottomWidth;

  var isBorderBoxSizeOuter = isBorderBox && isBoxSizeOuter;

  // overwrite width and height if we can get it from style
  var styleWidth = getStyleSize( style.width );
  if ( styleWidth !== false ) {
    size.width = styleWidth +
      // add padding and border unless it's already including it
      ( isBorderBoxSizeOuter ? 0 : paddingWidth + borderWidth );
  }

  var styleHeight = getStyleSize( style.height );
  if ( styleHeight !== false ) {
    size.height = styleHeight +
      // add padding and border unless it's already including it
      ( isBorderBoxSizeOuter ? 0 : paddingHeight + borderHeight );
  }

  size.innerWidth = size.width - ( paddingWidth + borderWidth );
  size.innerHeight = size.height - ( paddingHeight + borderHeight );

  size.outerWidth = size.width + marginWidth;
  size.outerHeight = size.height + marginHeight;

  return size;
}

// IE8 returns percent values, not pixels
// taken from jQuery's curCSS
function mungeNonPixel( elem, value ) {
  // IE8 and has percent value
  if ( window.getComputedStyle || value.indexOf('%') === -1 ) {
    return value;
  }
  var style = elem.style;
  // Remember the original values
  var left = style.left;
  var rs = elem.runtimeStyle;
  var rsLeft = rs && rs.left;

  // Put in the new values to get a computed value out
  if ( rsLeft ) {
    rs.left = elem.currentStyle.left;
  }
  style.left = value;
  value = style.pixelLeft;

  // Revert the changed values
  style.left = left;
  if ( rsLeft ) {
    rs.left = rsLeft;
  }

  return value;
}

return getSize;

}

// transport
if ( typeof define === 'function' && define.amd ) {
  // AMD for RequireJS
  define( [ 'get-style-property/get-style-property' ], defineGetSize );
} else if ( typeof exports === 'object' ) {
  // CommonJS for Component
  module.exports = defineGetSize( require('desandro-get-style-property') );
} else {
  // browser global
  window.getSize = defineGetSize( window.getStyleProperty );
}

})( window );

}, {"desandro-get-style-property":"node_modules/isotope-layout/node_modules/get-size/node_modules/desandro-get-style-property/get-style-property"});
require.register('node_modules/isotope-layout/node_modules/get-size/node_modules/desandro-get-style-property/get-style-property', function(require, module, exports){
/*!
 * getStyleProperty v1.0.4
 * original by kangax
 * http://perfectionkills.com/feature-testing-css-properties/
 * MIT license
 */

/*jshint browser: true, strict: true, undef: true */
/*global define: false, exports: false, module: false */

( function( window ) {

'use strict';

var prefixes = 'Webkit Moz ms Ms O'.split(' ');
var docElemStyle = document.documentElement.style;

function getStyleProperty( propName ) {
  if ( !propName ) {
    return;
  }

  // test standard property first
  if ( typeof docElemStyle[ propName ] === 'string' ) {
    return propName;
  }

  // capitalize
  propName = propName.charAt(0).toUpperCase() + propName.slice(1);

  // test vendor specific properties
  var prefixed;
  for ( var i=0, len = prefixes.length; i < len; i++ ) {
    prefixed = prefixes[i] + propName;
    if ( typeof docElemStyle[ prefixed ] === 'string' ) {
      return prefixed;
    }
  }
}

// transport
if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( function() {
    return getStyleProperty;
  });
} else if ( typeof exports === 'object' ) {
  // CommonJS for Component
  module.exports = getStyleProperty;
} else {
  // browser global
  window.getStyleProperty = getStyleProperty;
}

})( window );

}, {});
require.register('node_modules/isotope-layout/node_modules/masonry-layout/masonry', function(require, module, exports){
/*!
 * Masonry v3.3.0
 * Cascading grid layout library
 * http://masonry.desandro.com
 * MIT License
 * by David DeSandro
 */

( function( window, factory ) {
  'use strict';
  // universal module definition
  if ( typeof define === 'function' && define.amd ) {
    // AMD
    define( [
        'outlayer/outlayer',
        'get-size/get-size',
        'fizzy-ui-utils/utils'
      ],
      factory );
  } else if ( typeof exports === 'object' ) {
    // CommonJS
    module.exports = factory(
      require('outlayer'),
      require('get-size'),
      require('fizzy-ui-utils')
    );
  } else {
    // browser global
    window.Masonry = factory(
      window.Outlayer,
      window.getSize,
      window.fizzyUIUtils
    );
  }

}( window, function factory( Outlayer, getSize, utils ) {

'use strict';

// -------------------------- masonryDefinition -------------------------- //

  // create an Outlayer layout class
  var Masonry = Outlayer.create('masonry');

  Masonry.prototype._resetLayout = function() {
    this.getSize();
    this._getMeasurement( 'columnWidth', 'outerWidth' );
    this._getMeasurement( 'gutter', 'outerWidth' );
    this.measureColumns();

    // reset column Y
    var i = this.cols;
    this.colYs = [];
    while (i--) {
      this.colYs.push( 0 );
    }

    this.maxY = 0;
  };

  Masonry.prototype.measureColumns = function() {
    this.getContainerWidth();
    // if columnWidth is 0, default to outerWidth of first item
    if ( !this.columnWidth ) {
      var firstItem = this.items[0];
      var firstItemElem = firstItem && firstItem.element;
      // columnWidth fall back to item of first element
      this.columnWidth = firstItemElem && getSize( firstItemElem ).outerWidth ||
        // if first elem has no width, default to size of container
        this.containerWidth;
    }

    var columnWidth = this.columnWidth += this.gutter;

    // calculate columns
    var containerWidth = this.containerWidth + this.gutter;
    var cols = containerWidth / columnWidth;
    // fix rounding errors, typically with gutters
    var excess = columnWidth - containerWidth % columnWidth;
    // if overshoot is less than a pixel, round up, otherwise floor it
    var mathMethod = excess && excess < 1 ? 'round' : 'floor';
    cols = Math[ mathMethod ]( cols );
    this.cols = Math.max( cols, 1 );
  };

  Masonry.prototype.getContainerWidth = function() {
    // container is parent if fit width
    var container = this.options.isFitWidth ? this.element.parentNode : this.element;
    // check that this.size and size are there
    // IE8 triggers resize on body size change, so they might not be
    var size = getSize( container );
    this.containerWidth = size && size.innerWidth;
  };

  Masonry.prototype._getItemLayoutPosition = function( item ) {
    item.getSize();
    // how many columns does this brick span
    var remainder = item.size.outerWidth % this.columnWidth;
    var mathMethod = remainder && remainder < 1 ? 'round' : 'ceil';
    // round if off by 1 pixel, otherwise use ceil
    var colSpan = Math[ mathMethod ]( item.size.outerWidth / this.columnWidth );
    colSpan = Math.min( colSpan, this.cols );

    var colGroup = this._getColGroup( colSpan );
    // get the minimum Y value from the columns
    var minimumY = Math.min.apply( Math, colGroup );
    var shortColIndex = utils.indexOf( colGroup, minimumY );

    // position the brick
    var position = {
      x: this.columnWidth * shortColIndex,
      y: minimumY
    };

    // apply setHeight to necessary columns
    var setHeight = minimumY + item.size.outerHeight;
    var setSpan = this.cols + 1 - colGroup.length;
    for ( var i = 0; i < setSpan; i++ ) {
      this.colYs[ shortColIndex + i ] = setHeight;
    }

    return position;
  };

  /**
   * @param {Number} colSpan - number of columns the element spans
   * @returns {Array} colGroup
   */
  Masonry.prototype._getColGroup = function( colSpan ) {
    if ( colSpan < 2 ) {
      // if brick spans only one column, use all the column Ys
      return this.colYs;
    }

    var colGroup = [];
    // how many different places could this brick fit horizontally
    var groupCount = this.cols + 1 - colSpan;
    // for each group potential horizontal position
    for ( var i = 0; i < groupCount; i++ ) {
      // make an array of colY values for that one group
      var groupColYs = this.colYs.slice( i, i + colSpan );
      // and get the max value of the array
      colGroup[i] = Math.max.apply( Math, groupColYs );
    }
    return colGroup;
  };

  Masonry.prototype._manageStamp = function( stamp ) {
    var stampSize = getSize( stamp );
    var offset = this._getElementOffset( stamp );
    // get the columns that this stamp affects
    var firstX = this.options.isOriginLeft ? offset.left : offset.right;
    var lastX = firstX + stampSize.outerWidth;
    var firstCol = Math.floor( firstX / this.columnWidth );
    firstCol = Math.max( 0, firstCol );
    var lastCol = Math.floor( lastX / this.columnWidth );
    // lastCol should not go over if multiple of columnWidth #425
    lastCol -= lastX % this.columnWidth ? 0 : 1;
    lastCol = Math.min( this.cols - 1, lastCol );
    // set colYs to bottom of the stamp
    var stampMaxY = ( this.options.isOriginTop ? offset.top : offset.bottom ) +
      stampSize.outerHeight;
    for ( var i = firstCol; i <= lastCol; i++ ) {
      this.colYs[i] = Math.max( stampMaxY, this.colYs[i] );
    }
  };

  Masonry.prototype._getContainerSize = function() {
    this.maxY = Math.max.apply( Math, this.colYs );
    var size = {
      height: this.maxY
    };

    if ( this.options.isFitWidth ) {
      size.width = this._getContainerFitWidth();
    }

    return size;
  };

  Masonry.prototype._getContainerFitWidth = function() {
    var unusedCols = 0;
    // count unused columns
    var i = this.cols;
    while ( --i ) {
      if ( this.colYs[i] !== 0 ) {
        break;
      }
      unusedCols++;
    }
    // fit container to columns that have been used
    return ( this.cols - unusedCols ) * this.columnWidth - this.gutter;
  };

  Masonry.prototype.needsResizeLayout = function() {
    var previousWidth = this.containerWidth;
    this.getContainerWidth();
    return previousWidth !== this.containerWidth;
  };

  return Masonry;

}));

}, {"outlayer":"node_modules/isotope-layout/node_modules/outlayer/outlayer","get-size":"node_modules/isotope-layout/node_modules/get-size/get-size","fizzy-ui-utils":"node_modules/isotope-layout/node_modules/fizzy-ui-utils/utils"});
require.register('node_modules/isotope-layout/node_modules/outlayer/item', function(require, module, exports){
/**
 * Outlayer Item
 */

( function( window, factory ) {
  'use strict';
  // universal module definition
  if ( typeof define === 'function' && define.amd ) {
    // AMD
    define( [
        'eventEmitter/EventEmitter',
        'get-size/get-size',
        'get-style-property/get-style-property',
        'fizzy-ui-utils/utils'
      ],
      function( EventEmitter, getSize, getStyleProperty, utils ) {
        return factory( window, EventEmitter, getSize, getStyleProperty, utils );
      }
    );
  } else if (typeof exports === 'object') {
    // CommonJS
    module.exports = factory(
      window,
      require('wolfy87-eventemitter'),
      require('get-size'),
      require('desandro-get-style-property'),
      require('fizzy-ui-utils')
    );
  } else {
    // browser global
    window.Outlayer = {};
    window.Outlayer.Item = factory(
      window,
      window.EventEmitter,
      window.getSize,
      window.getStyleProperty,
      window.fizzyUIUtils
    );
  }

}( window, function factory( window, EventEmitter, getSize, getStyleProperty, utils ) {
'use strict';

// ----- helpers ----- //

var getComputedStyle = window.getComputedStyle;
var getStyle = getComputedStyle ?
  function( elem ) {
    return getComputedStyle( elem, null );
  } :
  function( elem ) {
    return elem.currentStyle;
  };


function isEmptyObj( obj ) {
  for ( var prop in obj ) {
    return false;
  }
  prop = null;
  return true;
}

// -------------------------- CSS3 support -------------------------- //

var transitionProperty = getStyleProperty('transition');
var transformProperty = getStyleProperty('transform');
var supportsCSS3 = transitionProperty && transformProperty;
var is3d = !!getStyleProperty('perspective');

var transitionEndEvent = {
  WebkitTransition: 'webkitTransitionEnd',
  MozTransition: 'transitionend',
  OTransition: 'otransitionend',
  transition: 'transitionend'
}[ transitionProperty ];

// properties that could have vendor prefix
var prefixableProperties = [
  'transform',
  'transition',
  'transitionDuration',
  'transitionProperty'
];

// cache all vendor properties
var vendorProperties = ( function() {
  var cache = {};
  for ( var i=0, len = prefixableProperties.length; i < len; i++ ) {
    var prop = prefixableProperties[i];
    var supportedProp = getStyleProperty( prop );
    if ( supportedProp && supportedProp !== prop ) {
      cache[ prop ] = supportedProp;
    }
  }
  return cache;
})();

// -------------------------- Item -------------------------- //

function Item( element, layout ) {
  if ( !element ) {
    return;
  }

  this.element = element;
  // parent layout class, i.e. Masonry, Isotope, or Packery
  this.layout = layout;
  this.position = {
    x: 0,
    y: 0
  };

  this._create();
}

// inherit EventEmitter
utils.extend( Item.prototype, EventEmitter.prototype );

Item.prototype._create = function() {
  // transition objects
  this._transn = {
    ingProperties: {},
    clean: {},
    onEnd: {}
  };

  this.css({
    position: 'absolute'
  });
};

// trigger specified handler for event type
Item.prototype.handleEvent = function( event ) {
  var method = 'on' + event.type;
  if ( this[ method ] ) {
    this[ method ]( event );
  }
};

Item.prototype.getSize = function() {
  this.size = getSize( this.element );
};

/**
 * apply CSS styles to element
 * @param {Object} style
 */
Item.prototype.css = function( style ) {
  var elemStyle = this.element.style;

  for ( var prop in style ) {
    // use vendor property if available
    var supportedProp = vendorProperties[ prop ] || prop;
    elemStyle[ supportedProp ] = style[ prop ];
  }
};

 // measure position, and sets it
Item.prototype.getPosition = function() {
  var style = getStyle( this.element );
  var layoutOptions = this.layout.options;
  var isOriginLeft = layoutOptions.isOriginLeft;
  var isOriginTop = layoutOptions.isOriginTop;
  var x = parseInt( style[ isOriginLeft ? 'left' : 'right' ], 10 );
  var y = parseInt( style[ isOriginTop ? 'top' : 'bottom' ], 10 );

  // clean up 'auto' or other non-integer values
  x = isNaN( x ) ? 0 : x;
  y = isNaN( y ) ? 0 : y;
  // remove padding from measurement
  var layoutSize = this.layout.size;
  x -= isOriginLeft ? layoutSize.paddingLeft : layoutSize.paddingRight;
  y -= isOriginTop ? layoutSize.paddingTop : layoutSize.paddingBottom;

  this.position.x = x;
  this.position.y = y;
};

// set settled position, apply padding
Item.prototype.layoutPosition = function() {
  var layoutSize = this.layout.size;
  var layoutOptions = this.layout.options;
  var style = {};

  // x
  var xPadding = layoutOptions.isOriginLeft ? 'paddingLeft' : 'paddingRight';
  var xProperty = layoutOptions.isOriginLeft ? 'left' : 'right';
  var xResetProperty = layoutOptions.isOriginLeft ? 'right' : 'left';

  var x = this.position.x + layoutSize[ xPadding ];
  // set in percentage
  x = layoutOptions.percentPosition && !layoutOptions.isHorizontal ?
    ( ( x / layoutSize.width ) * 100 ) + '%' : x + 'px';
  style[ xProperty ] = x;
  // reset other property
  style[ xResetProperty ] = '';

  // y
  var yPadding = layoutOptions.isOriginTop ? 'paddingTop' : 'paddingBottom';
  var yProperty = layoutOptions.isOriginTop ? 'top' : 'bottom';
  var yResetProperty = layoutOptions.isOriginTop ? 'bottom' : 'top';

  var y = this.position.y + layoutSize[ yPadding ];
  // set in percentage
  y = layoutOptions.percentPosition && layoutOptions.isHorizontal ?
    ( ( y / layoutSize.height ) * 100 ) + '%' : y + 'px';
  style[ yProperty ] = y;
  // reset other property
  style[ yResetProperty ] = '';

  this.css( style );
  this.emitEvent( 'layout', [ this ] );
};


// transform translate function
var translate = is3d ?
  function( x, y ) {
    return 'translate3d(' + x + 'px, ' + y + 'px, 0)';
  } :
  function( x, y ) {
    return 'translate(' + x + 'px, ' + y + 'px)';
  };


Item.prototype._transitionTo = function( x, y ) {
  this.getPosition();
  // get current x & y from top/left
  var curX = this.position.x;
  var curY = this.position.y;

  var compareX = parseInt( x, 10 );
  var compareY = parseInt( y, 10 );
  var didNotMove = compareX === this.position.x && compareY === this.position.y;

  // save end position
  this.setPosition( x, y );

  // if did not move and not transitioning, just go to layout
  if ( didNotMove && !this.isTransitioning ) {
    this.layoutPosition();
    return;
  }

  var transX = x - curX;
  var transY = y - curY;
  var transitionStyle = {};
  // flip cooridinates if origin on right or bottom
  var layoutOptions = this.layout.options;
  transX = layoutOptions.isOriginLeft ? transX : -transX;
  transY = layoutOptions.isOriginTop ? transY : -transY;
  transitionStyle.transform = translate( transX, transY );

  this.transition({
    to: transitionStyle,
    onTransitionEnd: {
      transform: this.layoutPosition
    },
    isCleaning: true
  });
};

// non transition + transform support
Item.prototype.goTo = function( x, y ) {
  this.setPosition( x, y );
  this.layoutPosition();
};

// use transition and transforms if supported
Item.prototype.moveTo = supportsCSS3 ?
  Item.prototype._transitionTo : Item.prototype.goTo;

Item.prototype.setPosition = function( x, y ) {
  this.position.x = parseInt( x, 10 );
  this.position.y = parseInt( y, 10 );
};

// ----- transition ----- //

/**
 * @param {Object} style - CSS
 * @param {Function} onTransitionEnd
 */

// non transition, just trigger callback
Item.prototype._nonTransition = function( args ) {
  this.css( args.to );
  if ( args.isCleaning ) {
    this._removeStyles( args.to );
  }
  for ( var prop in args.onTransitionEnd ) {
    args.onTransitionEnd[ prop ].call( this );
  }
};

/**
 * proper transition
 * @param {Object} args - arguments
 *   @param {Object} to - style to transition to
 *   @param {Object} from - style to start transition from
 *   @param {Boolean} isCleaning - removes transition styles after transition
 *   @param {Function} onTransitionEnd - callback
 */
Item.prototype._transition = function( args ) {
  // redirect to nonTransition if no transition duration
  if ( !parseFloat( this.layout.options.transitionDuration ) ) {
    this._nonTransition( args );
    return;
  }

  var _transition = this._transn;
  // keep track of onTransitionEnd callback by css property
  for ( var prop in args.onTransitionEnd ) {
    _transition.onEnd[ prop ] = args.onTransitionEnd[ prop ];
  }
  // keep track of properties that are transitioning
  for ( prop in args.to ) {
    _transition.ingProperties[ prop ] = true;
    // keep track of properties to clean up when transition is done
    if ( args.isCleaning ) {
      _transition.clean[ prop ] = true;
    }
  }

  // set from styles
  if ( args.from ) {
    this.css( args.from );
    // force redraw. http://blog.alexmaccaw.com/css-transitions
    var h = this.element.offsetHeight;
    // hack for JSHint to hush about unused var
    h = null;
  }
  // enable transition
  this.enableTransition( args.to );
  // set styles that are transitioning
  this.css( args.to );

  this.isTransitioning = true;

};

var itemTransitionProperties = transformProperty && ( utils.toDashed( transformProperty ) +
  ',opacity' );

Item.prototype.enableTransition = function(/* style */) {
  // only enable if not already transitioning
  // bug in IE10 were re-setting transition style will prevent
  // transitionend event from triggering
  if ( this.isTransitioning ) {
    return;
  }

  // make transition: foo, bar, baz from style object
  // TODO uncomment this bit when IE10 bug is resolved
  // var transitionValue = [];
  // for ( var prop in style ) {
  //   // dash-ify camelCased properties like WebkitTransition
  //   transitionValue.push( toDash( prop ) );
  // }
  // enable transition styles
  // HACK always enable transform,opacity for IE10
  this.css({
    transitionProperty: itemTransitionProperties,
    transitionDuration: this.layout.options.transitionDuration
  });
  // listen for transition end event
  this.element.addEventListener( transitionEndEvent, this, false );
};

Item.prototype.transition = Item.prototype[ transitionProperty ? '_transition' : '_nonTransition' ];

// ----- events ----- //

Item.prototype.onwebkitTransitionEnd = function( event ) {
  this.ontransitionend( event );
};

Item.prototype.onotransitionend = function( event ) {
  this.ontransitionend( event );
};

// properties that I munge to make my life easier
var dashedVendorProperties = {
  '-webkit-transform': 'transform',
  '-moz-transform': 'transform',
  '-o-transform': 'transform'
};

Item.prototype.ontransitionend = function( event ) {
  // disregard bubbled events from children
  if ( event.target !== this.element ) {
    return;
  }
  var _transition = this._transn;
  // get property name of transitioned property, convert to prefix-free
  var propertyName = dashedVendorProperties[ event.propertyName ] || event.propertyName;

  // remove property that has completed transitioning
  delete _transition.ingProperties[ propertyName ];
  // check if any properties are still transitioning
  if ( isEmptyObj( _transition.ingProperties ) ) {
    // all properties have completed transitioning
    this.disableTransition();
  }
  // clean style
  if ( propertyName in _transition.clean ) {
    // clean up style
    this.element.style[ event.propertyName ] = '';
    delete _transition.clean[ propertyName ];
  }
  // trigger onTransitionEnd callback
  if ( propertyName in _transition.onEnd ) {
    var onTransitionEnd = _transition.onEnd[ propertyName ];
    onTransitionEnd.call( this );
    delete _transition.onEnd[ propertyName ];
  }

  this.emitEvent( 'transitionEnd', [ this ] );
};

Item.prototype.disableTransition = function() {
  this.removeTransitionStyles();
  this.element.removeEventListener( transitionEndEvent, this, false );
  this.isTransitioning = false;
};

/**
 * removes style property from element
 * @param {Object} style
**/
Item.prototype._removeStyles = function( style ) {
  // clean up transition styles
  var cleanStyle = {};
  for ( var prop in style ) {
    cleanStyle[ prop ] = '';
  }
  this.css( cleanStyle );
};

var cleanTransitionStyle = {
  transitionProperty: '',
  transitionDuration: ''
};

Item.prototype.removeTransitionStyles = function() {
  // remove transition
  this.css( cleanTransitionStyle );
};

// ----- show/hide/remove ----- //

// remove element from DOM
Item.prototype.removeElem = function() {
  this.element.parentNode.removeChild( this.element );
  // remove display: none
  this.css({ display: '' });
  this.emitEvent( 'remove', [ this ] );
};

Item.prototype.remove = function() {
  // just remove element if no transition support or no transition
  if ( !transitionProperty || !parseFloat( this.layout.options.transitionDuration ) ) {
    this.removeElem();
    return;
  }

  // start transition
  var _this = this;
  this.once( 'transitionEnd', function() {
    _this.removeElem();
  });
  this.hide();
};

Item.prototype.reveal = function() {
  delete this.isHidden;
  // remove display: none
  this.css({ display: '' });

  var options = this.layout.options;

  var onTransitionEnd = {};
  var transitionEndProperty = this.getHideRevealTransitionEndProperty('visibleStyle');
  onTransitionEnd[ transitionEndProperty ] = this.onRevealTransitionEnd;

  this.transition({
    from: options.hiddenStyle,
    to: options.visibleStyle,
    isCleaning: true,
    onTransitionEnd: onTransitionEnd
  });
};

Item.prototype.onRevealTransitionEnd = function() {
  // check if still visible
  // during transition, item may have been hidden
  if ( !this.isHidden ) {
    this.emitEvent('reveal');
  }
};

/**
 * get style property use for hide/reveal transition end
 * @param {String} styleProperty - hiddenStyle/visibleStyle
 * @returns {String}
 */
Item.prototype.getHideRevealTransitionEndProperty = function( styleProperty ) {
  var optionStyle = this.layout.options[ styleProperty ];
  // use opacity
  if ( optionStyle.opacity ) {
    return 'opacity';
  }
  // get first property
  for ( var prop in optionStyle ) {
    return prop;
  }
};

Item.prototype.hide = function() {
  // set flag
  this.isHidden = true;
  // remove display: none
  this.css({ display: '' });

  var options = this.layout.options;

  var onTransitionEnd = {};
  var transitionEndProperty = this.getHideRevealTransitionEndProperty('hiddenStyle');
  onTransitionEnd[ transitionEndProperty ] = this.onHideTransitionEnd;

  this.transition({
    from: options.visibleStyle,
    to: options.hiddenStyle,
    // keep hidden stuff hidden
    isCleaning: true,
    onTransitionEnd: onTransitionEnd
  });
};

Item.prototype.onHideTransitionEnd = function() {
  // check if still hidden
  // during transition, item may have been un-hidden
  if ( this.isHidden ) {
    this.css({ display: 'none' });
    this.emitEvent('hide');
  }
};

Item.prototype.destroy = function() {
  this.css({
    position: '',
    left: '',
    right: '',
    top: '',
    bottom: '',
    transition: '',
    transform: ''
  });
};

return Item;

}));

}, {"wolfy87-eventemitter":"node_modules/isotope-layout/node_modules/outlayer/node_modules/wolfy87-eventemitter/EventEmitter","get-size":"node_modules/isotope-layout/node_modules/get-size/get-size","desandro-get-style-property":"node_modules/isotope-layout/node_modules/outlayer/node_modules/desandro-get-style-property/get-style-property","fizzy-ui-utils":"node_modules/isotope-layout/node_modules/fizzy-ui-utils/utils"});
require.register('node_modules/isotope-layout/node_modules/outlayer/node_modules/desandro-get-style-property/get-style-property', function(require, module, exports){
/*!
 * getStyleProperty v1.0.4
 * original by kangax
 * http://perfectionkills.com/feature-testing-css-properties/
 * MIT license
 */

/*jshint browser: true, strict: true, undef: true */
/*global define: false, exports: false, module: false */

( function( window ) {

'use strict';

var prefixes = 'Webkit Moz ms Ms O'.split(' ');
var docElemStyle = document.documentElement.style;

function getStyleProperty( propName ) {
  if ( !propName ) {
    return;
  }

  // test standard property first
  if ( typeof docElemStyle[ propName ] === 'string' ) {
    return propName;
  }

  // capitalize
  propName = propName.charAt(0).toUpperCase() + propName.slice(1);

  // test vendor specific properties
  var prefixed;
  for ( var i=0, len = prefixes.length; i < len; i++ ) {
    prefixed = prefixes[i] + propName;
    if ( typeof docElemStyle[ prefixed ] === 'string' ) {
      return prefixed;
    }
  }
}

// transport
if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( function() {
    return getStyleProperty;
  });
} else if ( typeof exports === 'object' ) {
  // CommonJS for Component
  module.exports = getStyleProperty;
} else {
  // browser global
  window.getStyleProperty = getStyleProperty;
}

})( window );

}, {});
require.register('node_modules/isotope-layout/node_modules/outlayer/node_modules/eventie/eventie', function(require, module, exports){
/*!
 * eventie v1.0.6
 * event binding helper
 *   eventie.bind( elem, 'click', myFn )
 *   eventie.unbind( elem, 'click', myFn )
 * MIT license
 */

/*jshint browser: true, undef: true, unused: true */
/*global define: false, module: false */

( function( window ) {

'use strict';

var docElem = document.documentElement;

var bind = function() {};

function getIEEvent( obj ) {
  var event = window.event;
  // add event.target
  event.target = event.target || event.srcElement || obj;
  return event;
}

if ( docElem.addEventListener ) {
  bind = function( obj, type, fn ) {
    obj.addEventListener( type, fn, false );
  };
} else if ( docElem.attachEvent ) {
  bind = function( obj, type, fn ) {
    obj[ type + fn ] = fn.handleEvent ?
      function() {
        var event = getIEEvent( obj );
        fn.handleEvent.call( fn, event );
      } :
      function() {
        var event = getIEEvent( obj );
        fn.call( obj, event );
      };
    obj.attachEvent( "on" + type, obj[ type + fn ] );
  };
}

var unbind = function() {};

if ( docElem.removeEventListener ) {
  unbind = function( obj, type, fn ) {
    obj.removeEventListener( type, fn, false );
  };
} else if ( docElem.detachEvent ) {
  unbind = function( obj, type, fn ) {
    obj.detachEvent( "on" + type, obj[ type + fn ] );
    try {
      delete obj[ type + fn ];
    } catch ( err ) {
      // can't delete window object properties
      obj[ type + fn ] = undefined;
    }
  };
}

var eventie = {
  bind: bind,
  unbind: unbind
};

// ----- module definition ----- //

if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( eventie );
} else if ( typeof exports === 'object' ) {
  // CommonJS
  module.exports = eventie;
} else {
  // browser global
  window.eventie = eventie;
}

})( window );

}, {});
require.register('node_modules/isotope-layout/node_modules/outlayer/node_modules/wolfy87-eventemitter/EventEmitter', function(require, module, exports){
/*!
 * EventEmitter v4.2.11 - git.io/ee
 * Unlicense - http://unlicense.org/
 * Oliver Caldwell - http://oli.me.uk/
 * @preserve
 */

;(function () {
    'use strict';

    /**
     * Class for managing events.
     * Can be extended to provide event functionality in other classes.
     *
     * @class EventEmitter Manages event registering and emitting.
     */
    function EventEmitter() {}

    // Shortcuts to improve speed and size
    var proto = EventEmitter.prototype;
    var exports = this;
    var originalGlobalValue = exports.EventEmitter;

    /**
     * Finds the index of the listener for the event in its storage array.
     *
     * @param {Function[]} listeners Array of listeners to search through.
     * @param {Function} listener Method to look for.
     * @return {Number} Index of the specified listener, -1 if not found
     * @api private
     */
    function indexOfListener(listeners, listener) {
        var i = listeners.length;
        while (i--) {
            if (listeners[i].listener === listener) {
                return i;
            }
        }

        return -1;
    }

    /**
     * Alias a method while keeping the context correct, to allow for overwriting of target method.
     *
     * @param {String} name The name of the target method.
     * @return {Function} The aliased method
     * @api private
     */
    function alias(name) {
        return function aliasClosure() {
            return this[name].apply(this, arguments);
        };
    }

    /**
     * Returns the listener array for the specified event.
     * Will initialise the event object and listener arrays if required.
     * Will return an object if you use a regex search. The object contains keys for each matched event. So /ba[rz]/ might return an object containing bar and baz. But only if you have either defined them with defineEvent or added some listeners to them.
     * Each property in the object response is an array of listener functions.
     *
     * @param {String|RegExp} evt Name of the event to return the listeners from.
     * @return {Function[]|Object} All listener functions for the event.
     */
    proto.getListeners = function getListeners(evt) {
        var events = this._getEvents();
        var response;
        var key;

        // Return a concatenated array of all matching events if
        // the selector is a regular expression.
        if (evt instanceof RegExp) {
            response = {};
            for (key in events) {
                if (events.hasOwnProperty(key) && evt.test(key)) {
                    response[key] = events[key];
                }
            }
        }
        else {
            response = events[evt] || (events[evt] = []);
        }

        return response;
    };

    /**
     * Takes a list of listener objects and flattens it into a list of listener functions.
     *
     * @param {Object[]} listeners Raw listener objects.
     * @return {Function[]} Just the listener functions.
     */
    proto.flattenListeners = function flattenListeners(listeners) {
        var flatListeners = [];
        var i;

        for (i = 0; i < listeners.length; i += 1) {
            flatListeners.push(listeners[i].listener);
        }

        return flatListeners;
    };

    /**
     * Fetches the requested listeners via getListeners but will always return the results inside an object. This is mainly for internal use but others may find it useful.
     *
     * @param {String|RegExp} evt Name of the event to return the listeners from.
     * @return {Object} All listener functions for an event in an object.
     */
    proto.getListenersAsObject = function getListenersAsObject(evt) {
        var listeners = this.getListeners(evt);
        var response;

        if (listeners instanceof Array) {
            response = {};
            response[evt] = listeners;
        }

        return response || listeners;
    };

    /**
     * Adds a listener function to the specified event.
     * The listener will not be added if it is a duplicate.
     * If the listener returns true then it will be removed after it is called.
     * If you pass a regular expression as the event name then the listener will be added to all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to attach the listener to.
     * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.addListener = function addListener(evt, listener) {
        var listeners = this.getListenersAsObject(evt);
        var listenerIsWrapped = typeof listener === 'object';
        var key;

        for (key in listeners) {
            if (listeners.hasOwnProperty(key) && indexOfListener(listeners[key], listener) === -1) {
                listeners[key].push(listenerIsWrapped ? listener : {
                    listener: listener,
                    once: false
                });
            }
        }

        return this;
    };

    /**
     * Alias of addListener
     */
    proto.on = alias('addListener');

    /**
     * Semi-alias of addListener. It will add a listener that will be
     * automatically removed after its first execution.
     *
     * @param {String|RegExp} evt Name of the event to attach the listener to.
     * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.addOnceListener = function addOnceListener(evt, listener) {
        return this.addListener(evt, {
            listener: listener,
            once: true
        });
    };

    /**
     * Alias of addOnceListener.
     */
    proto.once = alias('addOnceListener');

    /**
     * Defines an event name. This is required if you want to use a regex to add a listener to multiple events at once. If you don't do this then how do you expect it to know what event to add to? Should it just add to every possible match for a regex? No. That is scary and bad.
     * You need to tell it what event names should be matched by a regex.
     *
     * @param {String} evt Name of the event to create.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.defineEvent = function defineEvent(evt) {
        this.getListeners(evt);
        return this;
    };

    /**
     * Uses defineEvent to define multiple events.
     *
     * @param {String[]} evts An array of event names to define.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.defineEvents = function defineEvents(evts) {
        for (var i = 0; i < evts.length; i += 1) {
            this.defineEvent(evts[i]);
        }
        return this;
    };

    /**
     * Removes a listener function from the specified event.
     * When passed a regular expression as the event name, it will remove the listener from all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to remove the listener from.
     * @param {Function} listener Method to remove from the event.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.removeListener = function removeListener(evt, listener) {
        var listeners = this.getListenersAsObject(evt);
        var index;
        var key;

        for (key in listeners) {
            if (listeners.hasOwnProperty(key)) {
                index = indexOfListener(listeners[key], listener);

                if (index !== -1) {
                    listeners[key].splice(index, 1);
                }
            }
        }

        return this;
    };

    /**
     * Alias of removeListener
     */
    proto.off = alias('removeListener');

    /**
     * Adds listeners in bulk using the manipulateListeners method.
     * If you pass an object as the second argument you can add to multiple events at once. The object should contain key value pairs of events and listeners or listener arrays. You can also pass it an event name and an array of listeners to be added.
     * You can also pass it a regular expression to add the array of listeners to all events that match it.
     * Yeah, this function does quite a bit. That's probably a bad thing.
     *
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add to multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to add.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.addListeners = function addListeners(evt, listeners) {
        // Pass through to manipulateListeners
        return this.manipulateListeners(false, evt, listeners);
    };

    /**
     * Removes listeners in bulk using the manipulateListeners method.
     * If you pass an object as the second argument you can remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
     * You can also pass it an event name and an array of listeners to be removed.
     * You can also pass it a regular expression to remove the listeners from all events that match it.
     *
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to remove from multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to remove.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.removeListeners = function removeListeners(evt, listeners) {
        // Pass through to manipulateListeners
        return this.manipulateListeners(true, evt, listeners);
    };

    /**
     * Edits listeners in bulk. The addListeners and removeListeners methods both use this to do their job. You should really use those instead, this is a little lower level.
     * The first argument will determine if the listeners are removed (true) or added (false).
     * If you pass an object as the second argument you can add/remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
     * You can also pass it an event name and an array of listeners to be added/removed.
     * You can also pass it a regular expression to manipulate the listeners of all events that match it.
     *
     * @param {Boolean} remove True if you want to remove listeners, false if you want to add.
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add/remove from multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to add/remove.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.manipulateListeners = function manipulateListeners(remove, evt, listeners) {
        var i;
        var value;
        var single = remove ? this.removeListener : this.addListener;
        var multiple = remove ? this.removeListeners : this.addListeners;

        // If evt is an object then pass each of its properties to this method
        if (typeof evt === 'object' && !(evt instanceof RegExp)) {
            for (i in evt) {
                if (evt.hasOwnProperty(i) && (value = evt[i])) {
                    // Pass the single listener straight through to the singular method
                    if (typeof value === 'function') {
                        single.call(this, i, value);
                    }
                    else {
                        // Otherwise pass back to the multiple function
                        multiple.call(this, i, value);
                    }
                }
            }
        }
        else {
            // So evt must be a string
            // And listeners must be an array of listeners
            // Loop over it and pass each one to the multiple method
            i = listeners.length;
            while (i--) {
                single.call(this, evt, listeners[i]);
            }
        }

        return this;
    };

    /**
     * Removes all listeners from a specified event.
     * If you do not specify an event then all listeners will be removed.
     * That means every event will be emptied.
     * You can also pass a regex to remove all events that match it.
     *
     * @param {String|RegExp} [evt] Optional name of the event to remove all listeners for. Will remove from every event if not passed.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.removeEvent = function removeEvent(evt) {
        var type = typeof evt;
        var events = this._getEvents();
        var key;

        // Remove different things depending on the state of evt
        if (type === 'string') {
            // Remove all listeners for the specified event
            delete events[evt];
        }
        else if (evt instanceof RegExp) {
            // Remove all events matching the regex.
            for (key in events) {
                if (events.hasOwnProperty(key) && evt.test(key)) {
                    delete events[key];
                }
            }
        }
        else {
            // Remove all listeners in all events
            delete this._events;
        }

        return this;
    };

    /**
     * Alias of removeEvent.
     *
     * Added to mirror the node API.
     */
    proto.removeAllListeners = alias('removeEvent');

    /**
     * Emits an event of your choice.
     * When emitted, every listener attached to that event will be executed.
     * If you pass the optional argument array then those arguments will be passed to every listener upon execution.
     * Because it uses `apply`, your array of arguments will be passed as if you wrote them out separately.
     * So they will not arrive within the array on the other side, they will be separate.
     * You can also pass a regular expression to emit to all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
     * @param {Array} [args] Optional array of arguments to be passed to each listener.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.emitEvent = function emitEvent(evt, args) {
        var listeners = this.getListenersAsObject(evt);
        var listener;
        var i;
        var key;
        var response;

        for (key in listeners) {
            if (listeners.hasOwnProperty(key)) {
                i = listeners[key].length;

                while (i--) {
                    // If the listener returns true then it shall be removed from the event
                    // The function is executed either with a basic call or an apply if there is an args array
                    listener = listeners[key][i];

                    if (listener.once === true) {
                        this.removeListener(evt, listener.listener);
                    }

                    response = listener.listener.apply(this, args || []);

                    if (response === this._getOnceReturnValue()) {
                        this.removeListener(evt, listener.listener);
                    }
                }
            }
        }

        return this;
    };

    /**
     * Alias of emitEvent
     */
    proto.trigger = alias('emitEvent');

    /**
     * Subtly different from emitEvent in that it will pass its arguments on to the listeners, as opposed to taking a single array of arguments to pass on.
     * As with emitEvent, you can pass a regex in place of the event name to emit to all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
     * @param {...*} Optional additional arguments to be passed to each listener.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.emit = function emit(evt) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.emitEvent(evt, args);
    };

    /**
     * Sets the current value to check against when executing listeners. If a
     * listeners return value matches the one set here then it will be removed
     * after execution. This value defaults to true.
     *
     * @param {*} value The new value to check for when executing listeners.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.setOnceReturnValue = function setOnceReturnValue(value) {
        this._onceReturnValue = value;
        return this;
    };

    /**
     * Fetches the current value to check against when executing listeners. If
     * the listeners return value matches this one then it should be removed
     * automatically. It will return true by default.
     *
     * @return {*|Boolean} The current value to check for or the default, true.
     * @api private
     */
    proto._getOnceReturnValue = function _getOnceReturnValue() {
        if (this.hasOwnProperty('_onceReturnValue')) {
            return this._onceReturnValue;
        }
        else {
            return true;
        }
    };

    /**
     * Fetches the events object and creates one if required.
     *
     * @return {Object} The events storage object.
     * @api private
     */
    proto._getEvents = function _getEvents() {
        return this._events || (this._events = {});
    };

    /**
     * Reverts the global {@link EventEmitter} to its previous value and returns a reference to this version.
     *
     * @return {Function} Non conflicting EventEmitter class.
     */
    EventEmitter.noConflict = function noConflict() {
        exports.EventEmitter = originalGlobalValue;
        return EventEmitter;
    };

    // Expose the class either via AMD, CommonJS or the global object
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return EventEmitter;
        });
    }
    else if (typeof module === 'object' && module.exports){
        module.exports = EventEmitter;
    }
    else {
        exports.EventEmitter = EventEmitter;
    }
}.call(this));

}, {});
require.register('node_modules/isotope-layout/node_modules/outlayer/outlayer', function(require, module, exports){
/*!
 * Outlayer v1.4.0
 * the brains and guts of a layout library
 * MIT license
 */

( function( window, factory ) {
  'use strict';
  // universal module definition

  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( [
        'eventie/eventie',
        'eventEmitter/EventEmitter',
        'get-size/get-size',
        'fizzy-ui-utils/utils',
        './item'
      ],
      function( eventie, EventEmitter, getSize, utils, Item ) {
        return factory( window, eventie, EventEmitter, getSize, utils, Item);
      }
    );
  } else if ( typeof exports == 'object' ) {
    // CommonJS
    module.exports = factory(
      window,
      require('eventie'),
      require('wolfy87-eventemitter'),
      require('get-size'),
      require('fizzy-ui-utils'),
      require('./item')
    );
  } else {
    // browser global
    window.Outlayer = factory(
      window,
      window.eventie,
      window.EventEmitter,
      window.getSize,
      window.fizzyUIUtils,
      window.Outlayer.Item
    );
  }

}( window, function factory( window, eventie, EventEmitter, getSize, utils, Item ) {
'use strict';

// ----- vars ----- //

var console = window.console;
var jQuery = window.jQuery;
var noop = function() {};

// -------------------------- Outlayer -------------------------- //

// globally unique identifiers
var GUID = 0;
// internal store of all Outlayer intances
var instances = {};


/**
 * @param {Element, String} element
 * @param {Object} options
 * @constructor
 */
function Outlayer( element, options ) {
  var queryElement = utils.getQueryElement( element );
  if ( !queryElement ) {
    if ( console ) {
      console.error( 'Bad element for ' + this.constructor.namespace +
        ': ' + ( queryElement || element ) );
    }
    return;
  }
  this.element = queryElement;
  // add jQuery
  if ( jQuery ) {
    this.$element = jQuery( this.element );
  }

  // options
  this.options = utils.extend( {}, this.constructor.defaults );
  this.option( options );

  // add id for Outlayer.getFromElement
  var id = ++GUID;
  this.element.outlayerGUID = id; // expando
  instances[ id ] = this; // associate via id

  // kick it off
  this._create();

  if ( this.options.isInitLayout ) {
    this.layout();
  }
}

// settings are for internal use only
Outlayer.namespace = 'outlayer';
Outlayer.Item = Item;

// default options
Outlayer.defaults = {
  containerStyle: {
    position: 'relative'
  },
  isInitLayout: true,
  isOriginLeft: true,
  isOriginTop: true,
  isResizeBound: true,
  isResizingContainer: true,
  // item options
  transitionDuration: '0.4s',
  hiddenStyle: {
    opacity: 0,
    transform: 'scale(0.001)'
  },
  visibleStyle: {
    opacity: 1,
    transform: 'scale(1)'
  }
};

// inherit EventEmitter
utils.extend( Outlayer.prototype, EventEmitter.prototype );

/**
 * set options
 * @param {Object} opts
 */
Outlayer.prototype.option = function( opts ) {
  utils.extend( this.options, opts );
};

Outlayer.prototype._create = function() {
  // get items from children
  this.reloadItems();
  // elements that affect layout, but are not laid out
  this.stamps = [];
  this.stamp( this.options.stamp );
  // set container style
  utils.extend( this.element.style, this.options.containerStyle );

  // bind resize method
  if ( this.options.isResizeBound ) {
    this.bindResize();
  }
};

// goes through all children again and gets bricks in proper order
Outlayer.prototype.reloadItems = function() {
  // collection of item elements
  this.items = this._itemize( this.element.children );
};


/**
 * turn elements into Outlayer.Items to be used in layout
 * @param {Array or NodeList or HTMLElement} elems
 * @returns {Array} items - collection of new Outlayer Items
 */
Outlayer.prototype._itemize = function( elems ) {

  var itemElems = this._filterFindItemElements( elems );
  var Item = this.constructor.Item;

  // create new Outlayer Items for collection
  var items = [];
  for ( var i=0, len = itemElems.length; i < len; i++ ) {
    var elem = itemElems[i];
    var item = new Item( elem, this );
    items.push( item );
  }

  return items;
};

/**
 * get item elements to be used in layout
 * @param {Array or NodeList or HTMLElement} elems
 * @returns {Array} items - item elements
 */
Outlayer.prototype._filterFindItemElements = function( elems ) {
  return utils.filterFindElements( elems, this.options.itemSelector );
};

/**
 * getter method for getting item elements
 * @returns {Array} elems - collection of item elements
 */
Outlayer.prototype.getItemElements = function() {
  var elems = [];
  for ( var i=0, len = this.items.length; i < len; i++ ) {
    elems.push( this.items[i].element );
  }
  return elems;
};

// ----- init & layout ----- //

/**
 * lays out all items
 */
Outlayer.prototype.layout = function() {
  this._resetLayout();
  this._manageStamps();

  // don't animate first layout
  var isInstant = this.options.isLayoutInstant !== undefined ?
    this.options.isLayoutInstant : !this._isLayoutInited;
  this.layoutItems( this.items, isInstant );

  // flag for initalized
  this._isLayoutInited = true;
};

// _init is alias for layout
Outlayer.prototype._init = Outlayer.prototype.layout;

/**
 * logic before any new layout
 */
Outlayer.prototype._resetLayout = function() {
  this.getSize();
};


Outlayer.prototype.getSize = function() {
  this.size = getSize( this.element );
};

/**
 * get measurement from option, for columnWidth, rowHeight, gutter
 * if option is String -> get element from selector string, & get size of element
 * if option is Element -> get size of element
 * else use option as a number
 *
 * @param {String} measurement
 * @param {String} size - width or height
 * @private
 */
Outlayer.prototype._getMeasurement = function( measurement, size ) {
  var option = this.options[ measurement ];
  var elem;
  if ( !option ) {
    // default to 0
    this[ measurement ] = 0;
  } else {
    // use option as an element
    if ( typeof option === 'string' ) {
      elem = this.element.querySelector( option );
    } else if ( utils.isElement( option ) ) {
      elem = option;
    }
    // use size of element, if element
    this[ measurement ] = elem ? getSize( elem )[ size ] : option;
  }
};

/**
 * layout a collection of item elements
 * @api public
 */
Outlayer.prototype.layoutItems = function( items, isInstant ) {
  items = this._getItemsForLayout( items );

  this._layoutItems( items, isInstant );

  this._postLayout();
};

/**
 * get the items to be laid out
 * you may want to skip over some items
 * @param {Array} items
 * @returns {Array} items
 */
Outlayer.prototype._getItemsForLayout = function( items ) {
  var layoutItems = [];
  for ( var i=0, len = items.length; i < len; i++ ) {
    var item = items[i];
    if ( !item.isIgnored ) {
      layoutItems.push( item );
    }
  }
  return layoutItems;
};

/**
 * layout items
 * @param {Array} items
 * @param {Boolean} isInstant
 */
Outlayer.prototype._layoutItems = function( items, isInstant ) {
  this._emitCompleteOnItems( 'layout', items );

  if ( !items || !items.length ) {
    // no items, emit event with empty array
    return;
  }

  var queue = [];

  for ( var i=0, len = items.length; i < len; i++ ) {
    var item = items[i];
    // get x/y object from method
    var position = this._getItemLayoutPosition( item );
    // enqueue
    position.item = item;
    position.isInstant = isInstant || item.isLayoutInstant;
    queue.push( position );
  }

  this._processLayoutQueue( queue );
};

/**
 * get item layout position
 * @param {Outlayer.Item} item
 * @returns {Object} x and y position
 */
Outlayer.prototype._getItemLayoutPosition = function( /* item */ ) {
  return {
    x: 0,
    y: 0
  };
};

/**
 * iterate over array and position each item
 * Reason being - separating this logic prevents 'layout invalidation'
 * thx @paul_irish
 * @param {Array} queue
 */
Outlayer.prototype._processLayoutQueue = function( queue ) {
  for ( var i=0, len = queue.length; i < len; i++ ) {
    var obj = queue[i];
    this._positionItem( obj.item, obj.x, obj.y, obj.isInstant );
  }
};

/**
 * Sets position of item in DOM
 * @param {Outlayer.Item} item
 * @param {Number} x - horizontal position
 * @param {Number} y - vertical position
 * @param {Boolean} isInstant - disables transitions
 */
Outlayer.prototype._positionItem = function( item, x, y, isInstant ) {
  if ( isInstant ) {
    // if not transition, just set CSS
    item.goTo( x, y );
  } else {
    item.moveTo( x, y );
  }
};

/**
 * Any logic you want to do after each layout,
 * i.e. size the container
 */
Outlayer.prototype._postLayout = function() {
  this.resizeContainer();
};

Outlayer.prototype.resizeContainer = function() {
  if ( !this.options.isResizingContainer ) {
    return;
  }
  var size = this._getContainerSize();
  if ( size ) {
    this._setContainerMeasure( size.width, true );
    this._setContainerMeasure( size.height, false );
  }
};

/**
 * Sets width or height of container if returned
 * @returns {Object} size
 *   @param {Number} width
 *   @param {Number} height
 */
Outlayer.prototype._getContainerSize = noop;

/**
 * @param {Number} measure - size of width or height
 * @param {Boolean} isWidth
 */
Outlayer.prototype._setContainerMeasure = function( measure, isWidth ) {
  if ( measure === undefined ) {
    return;
  }

  var elemSize = this.size;
  // add padding and border width if border box
  if ( elemSize.isBorderBox ) {
    measure += isWidth ? elemSize.paddingLeft + elemSize.paddingRight +
      elemSize.borderLeftWidth + elemSize.borderRightWidth :
      elemSize.paddingBottom + elemSize.paddingTop +
      elemSize.borderTopWidth + elemSize.borderBottomWidth;
  }

  measure = Math.max( measure, 0 );
  this.element.style[ isWidth ? 'width' : 'height' ] = measure + 'px';
};

/**
 * emit eventComplete on a collection of items events
 * @param {String} eventName
 * @param {Array} items - Outlayer.Items
 */
Outlayer.prototype._emitCompleteOnItems = function( eventName, items ) {
  var _this = this;
  function onComplete() {
    _this.emitEvent( eventName + 'Complete', [ items ] );
  }

  var count = items.length;
  if ( !items || !count ) {
    onComplete();
    return;
  }

  var doneCount = 0;
  function tick() {
    doneCount++;
    if ( doneCount === count ) {
      onComplete();
    }
  }

  // bind callback
  for ( var i=0, len = items.length; i < len; i++ ) {
    var item = items[i];
    item.once( eventName, tick );
  }
};

// -------------------------- ignore & stamps -------------------------- //


/**
 * keep item in collection, but do not lay it out
 * ignored items do not get skipped in layout
 * @param {Element} elem
 */
Outlayer.prototype.ignore = function( elem ) {
  var item = this.getItem( elem );
  if ( item ) {
    item.isIgnored = true;
  }
};

/**
 * return item to layout collection
 * @param {Element} elem
 */
Outlayer.prototype.unignore = function( elem ) {
  var item = this.getItem( elem );
  if ( item ) {
    delete item.isIgnored;
  }
};

/**
 * adds elements to stamps
 * @param {NodeList, Array, Element, or String} elems
 */
Outlayer.prototype.stamp = function( elems ) {
  elems = this._find( elems );
  if ( !elems ) {
    return;
  }

  this.stamps = this.stamps.concat( elems );
  // ignore
  for ( var i=0, len = elems.length; i < len; i++ ) {
    var elem = elems[i];
    this.ignore( elem );
  }
};

/**
 * removes elements to stamps
 * @param {NodeList, Array, or Element} elems
 */
Outlayer.prototype.unstamp = function( elems ) {
  elems = this._find( elems );
  if ( !elems ){
    return;
  }

  for ( var i=0, len = elems.length; i < len; i++ ) {
    var elem = elems[i];
    // filter out removed stamp elements
    utils.removeFrom( this.stamps, elem );
    this.unignore( elem );
  }

};

/**
 * finds child elements
 * @param {NodeList, Array, Element, or String} elems
 * @returns {Array} elems
 */
Outlayer.prototype._find = function( elems ) {
  if ( !elems ) {
    return;
  }
  // if string, use argument as selector string
  if ( typeof elems === 'string' ) {
    elems = this.element.querySelectorAll( elems );
  }
  elems = utils.makeArray( elems );
  return elems;
};

Outlayer.prototype._manageStamps = function() {
  if ( !this.stamps || !this.stamps.length ) {
    return;
  }

  this._getBoundingRect();

  for ( var i=0, len = this.stamps.length; i < len; i++ ) {
    var stamp = this.stamps[i];
    this._manageStamp( stamp );
  }
};

// update boundingLeft / Top
Outlayer.prototype._getBoundingRect = function() {
  // get bounding rect for container element
  var boundingRect = this.element.getBoundingClientRect();
  var size = this.size;
  this._boundingRect = {
    left: boundingRect.left + size.paddingLeft + size.borderLeftWidth,
    top: boundingRect.top + size.paddingTop + size.borderTopWidth,
    right: boundingRect.right - ( size.paddingRight + size.borderRightWidth ),
    bottom: boundingRect.bottom - ( size.paddingBottom + size.borderBottomWidth )
  };
};

/**
 * @param {Element} stamp
**/
Outlayer.prototype._manageStamp = noop;

/**
 * get x/y position of element relative to container element
 * @param {Element} elem
 * @returns {Object} offset - has left, top, right, bottom
 */
Outlayer.prototype._getElementOffset = function( elem ) {
  var boundingRect = elem.getBoundingClientRect();
  var thisRect = this._boundingRect;
  var size = getSize( elem );
  var offset = {
    left: boundingRect.left - thisRect.left - size.marginLeft,
    top: boundingRect.top - thisRect.top - size.marginTop,
    right: thisRect.right - boundingRect.right - size.marginRight,
    bottom: thisRect.bottom - boundingRect.bottom - size.marginBottom
  };
  return offset;
};

// -------------------------- resize -------------------------- //

// enable event handlers for listeners
// i.e. resize -> onresize
Outlayer.prototype.handleEvent = function( event ) {
  var method = 'on' + event.type;
  if ( this[ method ] ) {
    this[ method ]( event );
  }
};

/**
 * Bind layout to window resizing
 */
Outlayer.prototype.bindResize = function() {
  // bind just one listener
  if ( this.isResizeBound ) {
    return;
  }
  eventie.bind( window, 'resize', this );
  this.isResizeBound = true;
};

/**
 * Unbind layout to window resizing
 */
Outlayer.prototype.unbindResize = function() {
  if ( this.isResizeBound ) {
    eventie.unbind( window, 'resize', this );
  }
  this.isResizeBound = false;
};

// original debounce by John Hann
// http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/

// this fires every resize
Outlayer.prototype.onresize = function() {
  if ( this.resizeTimeout ) {
    clearTimeout( this.resizeTimeout );
  }

  var _this = this;
  function delayed() {
    _this.resize();
    delete _this.resizeTimeout;
  }

  this.resizeTimeout = setTimeout( delayed, 100 );
};

// debounced, layout on resize
Outlayer.prototype.resize = function() {
  // don't trigger if size did not change
  // or if resize was unbound. See #9
  if ( !this.isResizeBound || !this.needsResizeLayout() ) {
    return;
  }

  this.layout();
};

/**
 * check if layout is needed post layout
 * @returns Boolean
 */
Outlayer.prototype.needsResizeLayout = function() {
  var size = getSize( this.element );
  // check that this.size and size are there
  // IE8 triggers resize on body size change, so they might not be
  var hasSizes = this.size && size;
  return hasSizes && size.innerWidth !== this.size.innerWidth;
};

// -------------------------- methods -------------------------- //

/**
 * add items to Outlayer instance
 * @param {Array or NodeList or Element} elems
 * @returns {Array} items - Outlayer.Items
**/
Outlayer.prototype.addItems = function( elems ) {
  var items = this._itemize( elems );
  // add items to collection
  if ( items.length ) {
    this.items = this.items.concat( items );
  }
  return items;
};

/**
 * Layout newly-appended item elements
 * @param {Array or NodeList or Element} elems
 */
Outlayer.prototype.appended = function( elems ) {
  var items = this.addItems( elems );
  if ( !items.length ) {
    return;
  }
  // layout and reveal just the new items
  this.layoutItems( items, true );
  this.reveal( items );
};

/**
 * Layout prepended elements
 * @param {Array or NodeList or Element} elems
 */
Outlayer.prototype.prepended = function( elems ) {
  var items = this._itemize( elems );
  if ( !items.length ) {
    return;
  }
  // add items to beginning of collection
  var previousItems = this.items.slice(0);
  this.items = items.concat( previousItems );
  // start new layout
  this._resetLayout();
  this._manageStamps();
  // layout new stuff without transition
  this.layoutItems( items, true );
  this.reveal( items );
  // layout previous items
  this.layoutItems( previousItems );
};

/**
 * reveal a collection of items
 * @param {Array of Outlayer.Items} items
 */
Outlayer.prototype.reveal = function( items ) {
  this._emitCompleteOnItems( 'reveal', items );

  var len = items && items.length;
  for ( var i=0; len && i < len; i++ ) {
    var item = items[i];
    item.reveal();
  }
};

/**
 * hide a collection of items
 * @param {Array of Outlayer.Items} items
 */
Outlayer.prototype.hide = function( items ) {
  this._emitCompleteOnItems( 'hide', items );

  var len = items && items.length;
  for ( var i=0; len && i < len; i++ ) {
    var item = items[i];
    item.hide();
  }
};

/**
 * reveal item elements
 * @param {Array}, {Element}, {NodeList} items
 */
Outlayer.prototype.revealItemElements = function( elems ) {
  var items = this.getItems( elems );
  this.reveal( items );
};

/**
 * hide item elements
 * @param {Array}, {Element}, {NodeList} items
 */
Outlayer.prototype.hideItemElements = function( elems ) {
  var items = this.getItems( elems );
  this.hide( items );
};

/**
 * get Outlayer.Item, given an Element
 * @param {Element} elem
 * @param {Function} callback
 * @returns {Outlayer.Item} item
 */
Outlayer.prototype.getItem = function( elem ) {
  // loop through items to get the one that matches
  for ( var i=0, len = this.items.length; i < len; i++ ) {
    var item = this.items[i];
    if ( item.element === elem ) {
      // return item
      return item;
    }
  }
};

/**
 * get collection of Outlayer.Items, given Elements
 * @param {Array} elems
 * @returns {Array} items - Outlayer.Items
 */
Outlayer.prototype.getItems = function( elems ) {
  elems = utils.makeArray( elems );
  var items = [];
  for ( var i=0, len = elems.length; i < len; i++ ) {
    var elem = elems[i];
    var item = this.getItem( elem );
    if ( item ) {
      items.push( item );
    }
  }

  return items;
};

/**
 * remove element(s) from instance and DOM
 * @param {Array or NodeList or Element} elems
 */
Outlayer.prototype.remove = function( elems ) {
  var removeItems = this.getItems( elems );

  this._emitCompleteOnItems( 'remove', removeItems );

  // bail if no items to remove
  if ( !removeItems || !removeItems.length ) {
    return;
  }

  for ( var i=0, len = removeItems.length; i < len; i++ ) {
    var item = removeItems[i];
    item.remove();
    // remove item from collection
    utils.removeFrom( this.items, item );
  }
};

// ----- destroy ----- //

// remove and disable Outlayer instance
Outlayer.prototype.destroy = function() {
  // clean up dynamic styles
  var style = this.element.style;
  style.height = '';
  style.position = '';
  style.width = '';
  // destroy items
  for ( var i=0, len = this.items.length; i < len; i++ ) {
    var item = this.items[i];
    item.destroy();
  }

  this.unbindResize();

  var id = this.element.outlayerGUID;
  delete instances[ id ]; // remove reference to instance by id
  delete this.element.outlayerGUID;
  // remove data for jQuery
  if ( jQuery ) {
    jQuery.removeData( this.element, this.constructor.namespace );
  }

};

// -------------------------- data -------------------------- //

/**
 * get Outlayer instance from element
 * @param {Element} elem
 * @returns {Outlayer}
 */
Outlayer.data = function( elem ) {
  elem = utils.getQueryElement( elem );
  var id = elem && elem.outlayerGUID;
  return id && instances[ id ];
};


// -------------------------- create Outlayer class -------------------------- //

/**
 * create a layout class
 * @param {String} namespace
 */
Outlayer.create = function( namespace, options ) {
  // sub-class Outlayer
  function Layout() {
    Outlayer.apply( this, arguments );
  }
  // inherit Outlayer prototype, use Object.create if there
  if ( Object.create ) {
    Layout.prototype = Object.create( Outlayer.prototype );
  } else {
    utils.extend( Layout.prototype, Outlayer.prototype );
  }
  // set contructor, used for namespace and Item
  Layout.prototype.constructor = Layout;

  Layout.defaults = utils.extend( {}, Outlayer.defaults );
  // apply new options
  utils.extend( Layout.defaults, options );
  // keep prototype.settings for backwards compatibility (Packery v1.2.0)
  Layout.prototype.settings = {};

  Layout.namespace = namespace;

  Layout.data = Outlayer.data;

  // sub-class Item
  Layout.Item = function LayoutItem() {
    Item.apply( this, arguments );
  };

  Layout.Item.prototype = new Item();

  // -------------------------- declarative -------------------------- //

  utils.htmlInit( Layout, namespace );

  // -------------------------- jQuery bridge -------------------------- //

  // make into jQuery plugin
  if ( jQuery && jQuery.bridget ) {
    jQuery.bridget( namespace, Layout );
  }

  return Layout;
};

// ----- fin ----- //

// back in global
Outlayer.Item = Item;

return Outlayer;

}));


}, {"eventie":"node_modules/isotope-layout/node_modules/outlayer/node_modules/eventie/eventie","wolfy87-eventemitter":"node_modules/isotope-layout/node_modules/outlayer/node_modules/wolfy87-eventemitter/EventEmitter","get-size":"node_modules/isotope-layout/node_modules/get-size/get-size","fizzy-ui-utils":"node_modules/isotope-layout/node_modules/fizzy-ui-utils/utils","./item":"node_modules/isotope-layout/node_modules/outlayer/item"});
require.register('node_modules/page/index', function(require, module, exports){
  /* globals require, module */

  'use strict';

  /**
   * Module dependencies.
   */

  var pathtoRegexp = require('path-to-regexp');

  /**
   * Module exports.
   */

  module.exports = page;

  /**
   * Detect click event
   */
  var clickEvent = document.ontouchstart ? 'touchstart' : 'click';

  /**
   * To work properly with the URL
   * history.location generated polyfill in https://github.com/devote/HTML5-History-API
   */

  var location = ('undefined' !== typeof window) && (window.history.location || window.location);

  /**
   * Perform initial dispatch.
   */

  var dispatch = true;


  /**
   * Decode URL components (query string, pathname, hash).
   * Accommodates both regular percent encoding and x-www-form-urlencoded format.
   */
  var decodeURLComponents = true;

  /**
   * Base path.
   */

  var base = '';

  /**
   * Running flag.
   */

  var running;

  /**
   * HashBang option
   */

  var hashbang = false;

  /**
   * Previous context, for capturing
   * page exit events.
   */

  var prevContext;

  /**
   * Register `path` with callback `fn()`,
   * or route `path`, or redirection,
   * or `page.start()`.
   *
   *   page(fn);
   *   page('*', fn);
   *   page('/user/:id', load, user);
   *   page('/user/' + user.id, { some: 'thing' });
   *   page('/user/' + user.id);
   *   page('/from', '/to')
   *   page();
   *
   * @param {String|Function} path
   * @param {Function} fn...
   * @api public
   */

  function page(path, fn) {
    // <callback>
    if ('function' === typeof path) {
      return page('*', path);
    }

    // route <path> to <callback ...>
    if ('function' === typeof fn) {
      var route = new Route(path);
      for (var i = 1; i < arguments.length; ++i) {
        page.callbacks.push(route.middleware(arguments[i]));
      }
      // show <path> with [state]
    } else if ('string' === typeof path) {
      page['string' === typeof fn ? 'redirect' : 'show'](path, fn);
      // start [options]
    } else {
      page.start(path);
    }
  }

  /**
   * Callback functions.
   */

  page.callbacks = [];
  page.exits = [];

  /**
   * Current path being processed
   * @type {String}
   */
  page.current = '';

  /**
   * Number of pages navigated to.
   * @type {number}
   *
   *     page.len == 0;
   *     page('/login');
   *     page.len == 1;
   */

  page.len = 0;

  /**
   * Get or set basepath to `path`.
   *
   * @param {String} path
   * @api public
   */

  page.base = function(path) {
    if (0 === arguments.length) return base;
    base = path;
  };

  /**
   * Bind with the given `options`.
   *
   * Options:
   *
   *    - `click` bind to click events [true]
   *    - `popstate` bind to popstate [true]
   *    - `dispatch` perform initial dispatch [true]
   *
   * @param {Object} options
   * @api public
   */

  page.start = function(options) {
    options = options || {};
    if (running) return;
    running = true;
    if (false === options.dispatch) dispatch = false;
    if (false === options.decodeURLComponents) decodeURLComponents = false;
    if (false !== options.popstate) window.addEventListener('popstate', onpopstate, false);
    if (false !== options.click) {
      window.addEventListener(clickEvent, onclick, false);
    }
    if (true === options.hashbang) hashbang = true;
    if (!dispatch) return;
    var url = (hashbang && ~location.hash.indexOf('#!')) ? location.hash.substr(2) + location.search : location.pathname + location.search + location.hash;
    page.replace(url, null, true, dispatch);
  };

  /**
   * Unbind click and popstate event handlers.
   *
   * @api public
   */

  page.stop = function() {
    if (!running) return;
    page.current = '';
    page.len = 0;
    running = false;
    window.removeEventListener(clickEvent, onclick, false);
    window.removeEventListener('popstate', onpopstate, false);
  };

  /**
   * Show `path` with optional `state` object.
   *
   * @param {String} path
   * @param {Object} state
   * @param {Boolean} dispatch
   * @return {Context}
   * @api public
   */

  page.show = function(path, state, dispatch, push) {
    var ctx = new Context(path, state);
    page.current = ctx.path;
    if (false !== dispatch) page.dispatch(ctx);
    if (false !== ctx.handled && false !== push) ctx.pushState();
    return ctx;
  };

  /**
   * Goes back in the history
   * Back should always let the current route push state and then go back.
   *
   * @param {String} path - fallback path to go back if no more history exists, if undefined defaults to page.base
   * @param {Object} [state]
   * @api public
   */

  page.back = function(path, state) {
    if (page.len > 0) {
      // this may need more testing to see if all browsers
      // wait for the next tick to go back in history
      history.back();
      page.len--;
    } else if (path) {
      setTimeout(function() {
        page.show(path, state);
      });
    }else{
      setTimeout(function() {
        page.show(base, state);
      });
    }
  };


  /**
   * Register route to redirect from one path to other
   * or just redirect to another route
   *
   * @param {String} from - if param 'to' is undefined redirects to 'from'
   * @param {String} [to]
   * @api public
   */
  page.redirect = function(from, to) {
    // Define route from a path to another
    if ('string' === typeof from && 'string' === typeof to) {
      page(from, function(e) {
        setTimeout(function() {
          page.replace(to);
        }, 0);
      });
    }

    // Wait for the push state and replace it with another
    if ('string' === typeof from && 'undefined' === typeof to) {
      setTimeout(function() {
        page.replace(from);
      }, 0);
    }
  };

  /**
   * Replace `path` with optional `state` object.
   *
   * @param {String} path
   * @param {Object} state
   * @return {Context}
   * @api public
   */


  page.replace = function(path, state, init, dispatch) {
    var ctx = new Context(path, state);
    page.current = ctx.path;
    ctx.init = init;
    ctx.save(); // save before dispatching, which may redirect
    if (false !== dispatch) page.dispatch(ctx);
    return ctx;
  };

  /**
   * Dispatch the given `ctx`.
   *
   * @param {Object} ctx
   * @api private
   */

  page.dispatch = function(ctx) {
    var prev = prevContext,
      i = 0,
      j = 0;

    prevContext = ctx;

    function nextExit() {
      var fn = page.exits[j++];
      if (!fn) return nextEnter();
      fn(prev, nextExit);
    }

    function nextEnter() {
      var fn = page.callbacks[i++];

      if (ctx.path !== page.current) {
        ctx.handled = false;
        return;
      }
      if (!fn) return unhandled(ctx);
      fn(ctx, nextEnter);
    }

    if (prev) {
      nextExit();
    } else {
      nextEnter();
    }
  };

  /**
   * Unhandled `ctx`. When it's not the initial
   * popstate then redirect. If you wish to handle
   * 404s on your own use `page('*', callback)`.
   *
   * @param {Context} ctx
   * @api private
   */

  function unhandled(ctx) {
    if (ctx.handled) return;
    var current;

    if (hashbang) {
      current = base + location.hash.replace('#!', '');
    } else {
      current = location.pathname + location.search;
    }

    if (current === ctx.canonicalPath) return;
    page.stop();
    ctx.handled = false;
    location.href = ctx.canonicalPath;
  }

  /**
   * Register an exit route on `path` with
   * callback `fn()`, which will be called
   * on the previous context when a new
   * page is visited.
   */
  page.exit = function(path, fn) {
    if (typeof path === 'function') {
      return page.exit('*', path);
    }

    var route = new Route(path);
    for (var i = 1; i < arguments.length; ++i) {
      page.exits.push(route.middleware(arguments[i]));
    }
  };

  /**
   * Remove URL encoding from the given `str`.
   * Accommodates whitespace in both x-www-form-urlencoded
   * and regular percent-encoded form.
   *
   * @param {str} URL component to decode
   */
  function decodeURLEncodedURIComponent(val) {
    if (typeof val !== 'string') { return val; }
    return decodeURLComponents ? decodeURIComponent(val.replace(/\+/g, ' ')) : val;
  }

  /**
   * Initialize a new "request" `Context`
   * with the given `path` and optional initial `state`.
   *
   * @param {String} path
   * @param {Object} state
   * @api public
   */

  function Context(path, state) {
    if ('/' === path[0] && 0 !== path.indexOf(base)) path = base + (hashbang ? '#!' : '') + path;
    var i = path.indexOf('?');

    this.canonicalPath = path;
    this.path = path.replace(base, '') || '/';
    if (hashbang) this.path = this.path.replace('#!', '') || '/';

    this.title = document.title;
    this.state = state || {};
    this.state.path = path;
    this.querystring = ~i ? decodeURLEncodedURIComponent(path.slice(i + 1)) : '';
    this.pathname = decodeURLEncodedURIComponent(~i ? path.slice(0, i) : path);
    this.params = {};

    // fragment
    this.hash = '';
    if (!hashbang) {
      if (!~this.path.indexOf('#')) return;
      var parts = this.path.split('#');
      this.path = parts[0];
      this.hash = decodeURLEncodedURIComponent(parts[1]) || '';
      this.querystring = this.querystring.split('#')[0];
    }
  }

  /**
   * Expose `Context`.
   */

  page.Context = Context;

  /**
   * Push state.
   *
   * @api private
   */

  Context.prototype.pushState = function() {
    page.len++;
    history.pushState(this.state, this.title, hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
  };

  /**
   * Save the context state.
   *
   * @api public
   */

  Context.prototype.save = function() {
    history.replaceState(this.state, this.title, hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
  };

  /**
   * Initialize `Route` with the given HTTP `path`,
   * and an array of `callbacks` and `options`.
   *
   * Options:
   *
   *   - `sensitive`    enable case-sensitive routes
   *   - `strict`       enable strict matching for trailing slashes
   *
   * @param {String} path
   * @param {Object} options.
   * @api private
   */

  function Route(path, options) {
    options = options || {};
    this.path = (path === '*') ? '(.*)' : path;
    this.method = 'GET';
    this.regexp = pathtoRegexp(this.path,
      this.keys = [],
      options.sensitive,
      options.strict);
  }

  /**
   * Expose `Route`.
   */

  page.Route = Route;

  /**
   * Return route middleware with
   * the given callback `fn()`.
   *
   * @param {Function} fn
   * @return {Function}
   * @api public
   */

  Route.prototype.middleware = function(fn) {
    var self = this;
    return function(ctx, next) {
      if (self.match(ctx.path, ctx.params)) return fn(ctx, next);
      next();
    };
  };

  /**
   * Check if this route matches `path`, if so
   * populate `params`.
   *
   * @param {String} path
   * @param {Object} params
   * @return {Boolean}
   * @api private
   */

  Route.prototype.match = function(path, params) {
    var keys = this.keys,
      qsIndex = path.indexOf('?'),
      pathname = ~qsIndex ? path.slice(0, qsIndex) : path,
      m = this.regexp.exec(decodeURIComponent(pathname));

    if (!m) return false;

    for (var i = 1, len = m.length; i < len; ++i) {
      var key = keys[i - 1];
      var val = decodeURLEncodedURIComponent(m[i]);
      if (val !== undefined || !(hasOwnProperty.call(params, key.name))) {
        params[key.name] = val;
      }
    }

    return true;
  };


  /**
   * Handle "populate" events.
   */

  var onpopstate = (function () {
    // this hack resolves https://github.com/visionmedia/page.js/issues/213
    var loaded = false;
    window.addEventListener('load', function() {
      setTimeout(function() {
        loaded = true;
      }, 0);
    });
    return function onpopstate(e) {
      if (!loaded) return;
      if (e.state) {
        var path = e.state.path;
        page.replace(path, e.state);
      } else {
        page.show(location.pathname + location.hash, undefined, undefined, false);
      }
    };
  })();
  /**
   * Handle "click" events.
   */

  function onclick(e) {

    if (1 !== which(e)) return;

    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (e.defaultPrevented) return;



    // ensure link
    var el = e.target;
    while (el && 'A' !== el.nodeName) el = el.parentNode;
    if (!el || 'A' !== el.nodeName) return;



    // Ignore if tag has
    // 1. "download" attribute
    // 2. rel="external" attribute
    if (el.hasAttribute('download') || el.getAttribute('rel') === 'external') return;

    // ensure non-hash for the same path
    var link = el.getAttribute('href');
    if (!hashbang && el.pathname === location.pathname && (el.hash || '#' === link)) return;



    // Check for mailto: in the href
    if (link && link.indexOf('mailto:') > -1) return;

    // check target
    if (el.target) return;

    // x-origin
    if (!sameOrigin(el.href)) return;



    // rebuild path
    var path = el.pathname + el.search + (el.hash || '');

    // strip leading "/[drive letter]:" on NW.js on Windows
    if (typeof process !== 'undefined' && path.match(/^\/[a-zA-Z]:\//)) {
      path = path.replace(/^\/[a-zA-Z]:\//, '/');
    }

    // same page
    var orig = path;

    if (path.indexOf(base) === 0) {
      path = path.substr(base.length);
    }

    if (hashbang) path = path.replace('#!', '');

    if (base && orig === path) return;

    e.preventDefault();
    page.show(orig);
  }

  /**
   * Event button.
   */

  function which(e) {
    e = e || window.event;
    return null === e.which ? e.button : e.which;
  }

  /**
   * Check if `href` is the same origin.
   */

  function sameOrigin(href) {
    var origin = location.protocol + '//' + location.hostname;
    if (location.port) origin += ':' + location.port;
    return (href && (0 === href.indexOf(origin)));
  }

  page.sameOrigin = sameOrigin;

}, {"path-to-regexp":"node_modules/page/node_modules/path-to-regexp/index"});
require.register('node_modules/page/node_modules/path-to-regexp/index', function(require, module, exports){
var isArray = require('isarray');

/**
 * Expose `pathToRegexp`.
 */
module.exports = pathToRegexp;

/**
 * The main path matching regexp utility.
 *
 * @type {RegExp}
 */
var PATH_REGEXP = new RegExp([
  // Match escaped characters that would otherwise appear in future matches.
  // This allows the user to escape special characters that won't transform.
  '(\\\\.)',
  // Match Express-style parameters and un-named parameters with a prefix
  // and optional suffixes. Matches appear as:
  //
  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?"]
  // "/route(\\d+)" => [undefined, undefined, undefined, "\d+", undefined]
  '([\\/.])?(?:\\:(\\w+)(?:\\(((?:\\\\.|[^)])*)\\))?|\\(((?:\\\\.|[^)])*)\\))([+*?])?',
  // Match regexp special characters that are always escaped.
  '([.+*?=^!:${}()[\\]|\\/])'
].join('|'), 'g');

/**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {String} group
 * @return {String}
 */
function escapeGroup (group) {
  return group.replace(/([=!:$\/()])/g, '\\$1');
}

/**
 * Attach the keys as a property of the regexp.
 *
 * @param  {RegExp} re
 * @param  {Array}  keys
 * @return {RegExp}
 */
function attachKeys (re, keys) {
  re.keys = keys;
  return re;
}

/**
 * Get the flags for a regexp from the options.
 *
 * @param  {Object} options
 * @return {String}
 */
function flags (options) {
  return options.sensitive ? '' : 'i';
}

/**
 * Pull out keys from a regexp.
 *
 * @param  {RegExp} path
 * @param  {Array}  keys
 * @return {RegExp}
 */
function regexpToRegexp (path, keys) {
  // Use a negative lookahead to match only capturing groups.
  var groups = path.source.match(/\((?!\?)/g);

  if (groups) {
    for (var i = 0; i < groups.length; i++) {
      keys.push({
        name:      i,
        delimiter: null,
        optional:  false,
        repeat:    false
      });
    }
  }

  return attachKeys(path, keys);
}

/**
 * Transform an array into a regexp.
 *
 * @param  {Array}  path
 * @param  {Array}  keys
 * @param  {Object} options
 * @return {RegExp}
 */
function arrayToRegexp (path, keys, options) {
  var parts = [];

  for (var i = 0; i < path.length; i++) {
    parts.push(pathToRegexp(path[i], keys, options).source);
  }

  var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options));
  return attachKeys(regexp, keys);
}

/**
 * Replace the specific tags with regexp strings.
 *
 * @param  {String} path
 * @param  {Array}  keys
 * @return {String}
 */
function replacePath (path, keys) {
  var index = 0;

  function replace (_, escaped, prefix, key, capture, group, suffix, escape) {
    if (escaped) {
      return escaped;
    }

    if (escape) {
      return '\\' + escape;
    }

    var repeat   = suffix === '+' || suffix === '*';
    var optional = suffix === '?' || suffix === '*';

    keys.push({
      name:      key || index++,
      delimiter: prefix || '/',
      optional:  optional,
      repeat:    repeat
    });

    prefix = prefix ? ('\\' + prefix) : '';
    capture = escapeGroup(capture || group || '[^' + (prefix || '\\/') + ']+?');

    if (repeat) {
      capture = capture + '(?:' + prefix + capture + ')*';
    }

    if (optional) {
      return '(?:' + prefix + '(' + capture + '))?';
    }

    // Basic parameter support.
    return prefix + '(' + capture + ')';
  }

  return path.replace(PATH_REGEXP, replace);
}

/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 *
 * @param  {(String|RegExp|Array)} path
 * @param  {Array}                 [keys]
 * @param  {Object}                [options]
 * @return {RegExp}
 */
function pathToRegexp (path, keys, options) {
  keys = keys || [];

  if (!isArray(keys)) {
    options = keys;
    keys = [];
  } else if (!options) {
    options = {};
  }

  if (path instanceof RegExp) {
    return regexpToRegexp(path, keys, options);
  }

  if (isArray(path)) {
    return arrayToRegexp(path, keys, options);
  }

  var strict = options.strict;
  var end = options.end !== false;
  var route = replacePath(path, keys);
  var endsWithSlash = path.charAt(path.length - 1) === '/';

  // In non-strict mode we allow a slash at the end of match. If the path to
  // match already ends with a slash, we remove it for consistency. The slash
  // is valid at the end of a path match, not in the middle. This is important
  // in non-ending mode, where "/test/" shouldn't match "/test//route".
  if (!strict) {
    route = (endsWithSlash ? route.slice(0, -2) : route) + '(?:\\/(?=$))?';
  }

  if (end) {
    route += '$';
  } else {
    // In non-ending mode, we need the capturing groups to match as much as
    // possible by using a positive lookahead to the end or next path segment.
    route += strict && endsWithSlash ? '' : '(?=\\/|$)';
  }

  return attachKeys(new RegExp('^' + route, flags(options)), keys);
}

}, {"isarray":"node_modules/page/node_modules/path-to-regexp/node_modules/isarray/index"});
require.register('node_modules/page/node_modules/path-to-regexp/node_modules/isarray/index', function(require, module, exports){
module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

}, {});
require.register('node_modules/watchjs/src/watch', function(require, module, exports){
/**
 * DEVELOPED BY
 * GIL LOPES BUENO
 * gilbueno.mail@gmail.com
 *
 * WORKS WITH:
 * IE 9+, FF 4+, SF 5+, WebKit, CH 7+, OP 12+, BESEN, Rhino 1.7+
 *
 * FORK:
 * https://github.com/melanke/Watch.JS
 */

"use strict";
(function (factory) {
    if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else {
        // Browser globals
        window.WatchJS = factory();
        window.watch = window.WatchJS.watch;
        window.unwatch = window.WatchJS.unwatch;
        window.callWatchers = window.WatchJS.callWatchers;
    }
}(function () {

    var WatchJS = {
        noMore: false
    },
    defineWatcher,
    unwatchOne,
    callWatchers;

    var isFunction = function (functionToCheck) {
            var getType = {};
            return functionToCheck && getType.toString.call(functionToCheck) == '[object Function]';
    };

    var isInt = function (x) {
        return x % 1 === 0;
    };

    var isArray = function(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    };

    var isModernBrowser = function () {
        return Object.defineProperty || Object.prototype.__defineGetter__;
    };

    var defineGetAndSet = function (obj, propName, getter, setter) {
        try {
                Object.defineProperty(obj, propName, {
                        get: getter,
                        set: setter,
                        enumerable: true,
                        configurable: true
                });
        } catch(error) {
            try{
                Object.prototype.__defineGetter__.call(obj, propName, getter);
                Object.prototype.__defineSetter__.call(obj, propName, setter);
            }catch(error2){
                throw "watchJS error: browser not supported :/"
            }
        }
    };

    var defineProp = function (obj, propName, value) {
        try {
            Object.defineProperty(obj, propName, {
                enumerable: false,
                configurable: true,
                writable: false,
                value: value
            });
        } catch(error) {
            obj[propName] = value;
        }
    };

    var watch = function () {

        if (isFunction(arguments[1])) {
            watchAll.apply(this, arguments);
        } else if (isArray(arguments[1])) {
            watchMany.apply(this, arguments);
        } else {
            watchOne.apply(this, arguments);
        }

    };


    var watchAll = function (obj, watcher, level) {

        if (obj instanceof String || (!(obj instanceof Object) && !isArray(obj))) { //accepts only objects and array (not string)
            return;
        }

        var props = [];


        if(isArray(obj)) {
            for (var prop = 0; prop < obj.length; prop++) { //for each item if obj is an array
                props.push(prop); //put in the props
            }
        } else {
            for (var prop2 in obj) { //for each attribute if obj is an object
                props.push(prop2); //put in the props
            }
        }

        watchMany(obj, props, watcher, level); //watch all itens of the props
    };


    var watchMany = function (obj, props, watcher, level) {

        for (var prop in props) { //watch each attribute of "props" if is an object
            watchOne(obj, props[prop], watcher, level);
        }

    };

    var watchOne = function (obj, prop, watcher, level) {

        if(isFunction(obj[prop])) { //dont watch if it is a function
            return;
        }

        if(obj[prop] != null && (level === undefined || level > 0)){
            if(level !== undefined){
                level--;
            }
            watchAll(obj[prop], watcher, level); //recursively watch all attributes of this
        }

        defineWatcher(obj, prop, watcher);

    };

    var unwatch = function () {

        if (isFunction(arguments[1])) {
            unwatchAll.apply(this, arguments);
        } else if (isArray(arguments[1])) {
            unwatchMany.apply(this, arguments);
        } else {
            unwatchOne.apply(this, arguments);
        }

    };

    var unwatchAll = function (obj, watcher) {

        if (obj instanceof String || (!(obj instanceof Object) && !isArray(obj))) { //accepts only objects and array (not string)
            return;
        }

        var props = [];


        if (isArray(obj)) {
            for (var prop = 0; prop < obj.length; prop++) { //for each item if obj is an array
                props.push(prop); //put in the props
            }
        } else {
            for (var prop2 in obj) { //for each attribute if obj is an object
                props.push(prop2); //put in the props
            }
        }

        unwatchMany(obj, props, watcher); //watch all itens of the props
    };


    var unwatchMany = function (obj, props, watcher) {

        for (var prop2 in props) { //watch each attribute of "props" if is an object
            unwatchOne(obj, props[prop2], watcher);
        }
    };

    if(isModernBrowser()){

        defineWatcher = function (obj, prop, watcher) {

            var val = obj[prop];

            watchFunctions(obj, prop);

            if (!obj.watchers) {
                defineProp(obj, "watchers", {});
            }

            if (!obj.watchers[prop]) {
                obj.watchers[prop] = [];
            }


            obj.watchers[prop].push(watcher); //add the new watcher in the watchers array


            var getter = function () {
                return val;
            };


            var setter = function (newval) {
                var oldval = val;
                val = newval;

                if (obj[prop]){
                    watchAll(obj[prop], watcher);
                }

                watchFunctions(obj, prop);

                if (!WatchJS.noMore){
                    if (JSON.stringify(oldval) !== JSON.stringify(newval)) {
                        callWatchers(obj, prop, "set", newval, oldval);
                        WatchJS.noMore = false;
                    }
                }
            };

            defineGetAndSet(obj, prop, getter, setter);

        };

        callWatchers = function (obj, prop, action, newval, oldval) {

            for (var wr in obj.watchers[prop]) {
                if (isInt(wr)){
                    obj.watchers[prop][wr].call(obj, prop, action, newval, oldval);
                }
            }
        };

        // @todo code related to "watchFunctions" is certainly buggy
        var methodNames = ['pop', 'push', 'reverse', 'shift', 'sort', 'slice', 'unshift'];
        var defineArrayMethodWatcher = function (obj, prop, original, methodName) {
            defineProp(obj[prop], methodName, function () {
                var response = original.apply(obj[prop], arguments);
                watchOne(obj, obj[prop]);
                if (methodName !== 'slice') {
                    callWatchers(obj, prop, methodName,arguments);
                }
                return response;
            });
        };

        var watchFunctions = function(obj, prop) {

            if ((!obj[prop]) || (obj[prop] instanceof String) || (!isArray(obj[prop]))) {
                return;
            }

            for (var i = methodNames.length, methodName; i--;) {
                methodName = methodNames[i];
                defineArrayMethodWatcher(obj, prop, obj[prop][methodName], methodName);
            }

        };

        unwatchOne = function (obj, prop, watcher) {
            for(var i in obj.watchers[prop]){
                var w = obj.watchers[prop][i];

                if(w == watcher) {
                    obj.watchers[prop].splice(i, 1);
                }
            }
        };

    } else {
        //this implementation dont work because it cant handle the gap between "settings".
        //I mean, if you use a setter for an attribute after another setter of the same attribute it will only fire the second
        //but I think we could think something to fix it

        var subjects = [];

        defineWatcher = function(obj, prop, watcher){

            subjects.push({
                obj: obj,
                prop: prop,
                serialized: JSON.stringify(obj[prop]),
                watcher: watcher
            });

        };

        unwatchOne = function (obj, prop, watcher) {

            for (var i in subjects) {
                var subj = subjects[i];

                if (subj.obj == obj && subj.prop == prop && subj.watcher == watcher) {
                    subjects.splice(i, 1);
                }

            }

        };

        callWatchers = function (obj, prop, action, value) {

            for (var i in subjects) {
                var subj = subjects[i];

                if (subj.obj == obj && subj.prop == prop) {
                    subj.watcher.call(obj, prop, action, value);
                }

            }

        };

        var loop = function(){

            for(var i in subjects){

                var subj = subjects[i];
                var newSer = JSON.stringify(subj.obj[subj.prop]);
                if(newSer != subj.serialized){
                    subj.watcher.call(subj.obj, subj.prop, subj.obj[subj.prop], JSON.parse(subj.serialized));
                    subj.serialized = newSer;
                }

            }

        };

        setInterval(loop, 50);

    }

    WatchJS.watch = watch;
    WatchJS.unwatch = unwatch;
    WatchJS.callWatchers = callWatchers;

    return WatchJS;

}));

}, {});
require.register('src/frontend/scripts/api/loopcast/loopcast', function(require, module, exports){
var api_url, on_error;

api_url = "/api/v1/";

on_error = function(method, callback) {
  return function(error) {
    console.error("error calling " + method);
    console.error(error);
    return callback(error);
  };
};

module.exports = {
  genres: {
    all: function(callback) {
      var request;
      request = $.get(api_url + 'genres/all');
      request.error(on_error('genres', callback));
      return request.done(function(response) {
        return callback(null, response);
      });
    }
  },
  rooms: {
    create: function(data, callback) {
      var on_status_code, request;
      on_status_code = {
        401: function(response) {
          return callback('unauthorized, need log in!');
        }
      };
      request = $.post(api_url + 'rooms/create', data, on_status_code);
      request.error(on_error('rooms/create', callback));
      return request.done(function(response) {
        return callback(null, response);
      });
    },
    start_stream: function(room_id, callback) {
      var data, on_status_code, request;
      on_status_code = {
        401: function(response) {
          return callback('unauthorized, need log in!');
        }
      };
      data = {
        room_id: room_id
      };
      request = $.post(api_url + 'stream/start', data, on_status_code);
      request.error(on_error('stream/start', callback));
      return request.done(function(response) {
        return callback(null, response);
      });
    },
    stop_stream: function(room_id, callback) {
      var data, on_status_code, request;
      on_status_code = {
        401: function(response) {
          return callback('unauthorized, need log in!');
        },
        412: function(response) {
          return callback('Room not found or user not owner!');
        }
      };
      data = {
        room_id: room_id
      };
      request = $.post(api_url + 'stream/stop', data, on_status_code);
      request.error(on_error('stream/stop', callback));
      return request.done(function(response) {
        return callback(null, response);
      });
    },
    start_recording: function(room_id, callback) {
      var data, on_status_code, request;
      on_status_code = {
        401: function(response) {
          return callback('unauthorized, need log in!');
        },
        412: function(response) {
          return callback('Room not found or user not owner!');
        }
      };
      data = {
        room_id: room_id
      };
      request = $.post(api_url + 'tape/start', data, on_status_code);
      request.error(on_error('tape/start', callback));
      return request.done(function(response) {
        return callback(null, response);
      });
    },
    stop_recording: function(room_id, callback) {
      var data, on_status_code, request;
      on_status_code = {
        401: function(response) {
          return callback('unauthorized, need log in!');
        }
      };
      data = {
        room_id: room_id
      };
      request = $.post(api_url + 'tape/stop', data, on_status_code);
      request.error(on_error('tape/stop', callback));
      return request.done(function(response) {
        return callback(null, response);
      });
    }
  },
  chat: {
    message: function(user_id, room_id, message, callback) {
      var data, on_status_code, request;
      on_status_code = {
        400: function() {
          return callback('bad request');
        },
        401: function() {
          return callback('unauthorized');
        },
        500: function() {
          return callback('server error');
        }
      };
      data = {
        message: message,
        room_id: room_id,
        user_id: user_id
      };
      request = $.post(api_url + 'chat/message', data, on_status_code);
      request.error(on_error('tape/start', callback));
      return request.done(function(response) {
        return callback(null, response);
      });
    }
  },
  user: {
    edit: function(data, callback) {
      var on_status_code, request;
      on_status_code = {
        401: function(response) {
          return callback('unauthorized, need log in!');
        }
      };
      request = $.post(api_url + 'user/edit', data, on_status_code);
      request.error(on_error('user/edit', callback));
      return request.done(function(response) {
        return callback(null, response);
      });
    }
  }
};

}, {});
require.register('src/frontend/scripts/app', function(require, module, exports){
var App, GUI, app, appcast, cloudinary, navigation, views,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

require('./globals');

require('./vendors');

views = require('./controllers/views');

navigation = require('./controllers/navigation');

appcast = require('./controllers/appcast');

cloudinary = require('./controllers/cloudinary');

GUI = require('./controllers/gui');

App = (function() {
  App.prototype.window = null;

  App.prototype.settings = null;

  App.prototype.local = null;

  App.prototype.session = null;

  App.prototype.main_view_binded_counter = 0;

  function App() {
    this.on_views_binded = __bind(this.on_views_binded, this);
    happens(this);
  }

  App.prototype.start = function() {
    var first_render,
      _this = this;
    this.local = require('app/controllers/local_connection');
    this.session = require('app/controllers/storage');
    this.window = require('app/controllers/window');
    this.user = require('./controllers/user');
    this.gui = new GUI;
    this.body = $('body');
    this.settings = require('app/utils/settings');
    this.settings.bind(this.body);
    first_render = true;
    navigation.on('before_destroy', function() {
      _this.emit('loading:show');
      return views.unbind('#content');
    });
    navigation.on('after_render', function() {
      if (!first_render) {
        views.bind('#content');
      }
      navigation.bind('#content');
      _this.user.check_guest_owner();
      return first_render = false;
    });
    views.bind('body');
    return navigation.bind();
  };

  App.prototype.on_views_binded = function(scope) {
    var v, view_preloading,
      _this = this;
    if (!scope.main) {
      return;
    }
    this.main_view_binded_counter++;
    if ((window.opener != null) && this.main_view_binded_counter > 1) {
      return;
    }
    view_preloading = $(scope.scope).find('.request_preloading');
    if (view_preloading.length > 0) {
      v = views.get_by_dom(view_preloading);
      return v.once('ready', function() {
        return _this.emit('loading:hide');
      });
    } else {
      return this.emit('loading:hide');
    }
  };

  App.prototype.login = function(user_data) {
    var url;
    log("--------> login called from outside", user_data);
    if (this.settings.after_login_url.length > 0) {
      url = this.settings.after_login_url;
      this.settings.after_login_url = "";
    } else {
      url = "/" + user_data.username;
    }
    navigation.go(url);
    return this.user.login(user_data);
  };

  App.prototype.logout = function() {
    return this.user.logout();
  };

  return App;

})();

app = new App;

$(function() {
  return app.start();
});

module.exports = window.app = app;

}, {"./globals":"src/frontend/scripts/globals","./vendors":"src/frontend/scripts/vendors","./controllers/views":"src/frontend/scripts/controllers/views","./controllers/navigation":"src/frontend/scripts/controllers/navigation","./controllers/appcast":"src/frontend/scripts/controllers/appcast","./controllers/cloudinary":"src/frontend/scripts/controllers/cloudinary","./controllers/gui":"src/frontend/scripts/controllers/gui","app/controllers/local_connection":"src/frontend/scripts/controllers/local_connection","app/controllers/storage":"src/frontend/scripts/controllers/storage","app/controllers/window":"src/frontend/scripts/controllers/window","./controllers/user":"src/frontend/scripts/controllers/user","app/utils/settings":"src/frontend/scripts/utils/settings"});
require.register('src/frontend/scripts/controllers/appcast', function(require, module, exports){
/*
# Manages local connection to Appcast
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

appcast.start_stream = function(mount_point, device_name) {
  var password, payload;
  console.info(" START STRAEM!!!");
  if (appcast.get("stream:starting")) {
    console.error("waiting stream to start, cant start again");
    return;
  }
  if (appcast.get("stream:online")) {
    console.error("stream is already online, cant start again");
    return;
  }
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
    console.info("APPCAST REPLIED: STREAM STARTED!");
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

module.exports = window.appcast = appcast;

}, {"aware":"node_modules/aware/index","app/vendors":"src/frontend/scripts/vendors"});
require.register('src/frontend/scripts/controllers/cloudinary', function(require, module, exports){
var Cloudinary;

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

  return Cloudinary;

})();

module.exports = new Cloudinary;

}, {});
require.register('src/frontend/scripts/controllers/gui', function(require, module, exports){
var GUI, WatchJS, watch,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

WatchJS = require('watchjs');

watch = WatchJS.watch;

module.exports = GUI = (function() {
  GUI.prototype.opened = false;

  GUI.prototype.use_keys = true;

  GUI.prototype.use_click = false;

  GUI.prototype.toggle_key = 68;

  function GUI() {
    this.refresh = __bind(this.refresh, this);
    this.toggle = __bind(this.toggle, this);
    this.on_key_pressed = __bind(this.on_key_pressed, this);
    var html;
    html = require('templates/debug/gui');
    $('body').append(html());
    this.dom = $('#gui');
    this.content = this.dom.find('.content');
    if (this.use_click) {
      this.dom.addClass('clickable').on('click', this.toggle);
    }
    if (this.use_keys) {
      $(window).on('keyup', this.on_key_pressed);
    }
  }

  GUI.prototype.on_key_pressed = function(e) {
    if (e.keyCode === this.toggle_key) {
      return this.toggle();
    }
  };

  GUI.prototype.toggle = function() {
    if (this.opened) {
      return this.close();
    } else {
      return this.open();
    }
  };

  GUI.prototype.close = function() {
    if (!this.opened) {
      return;
    }
    this.opened = false;
    return this.dom.addClass('closed');
  };

  GUI.prototype.open = function() {
    if (this.opened) {
      return;
    }
    this.opened = true;
    return this.dom.removeClass('closed');
  };

  GUI.prototype.watch = function(obj) {
    this.obj = jQuery.extend(true, {}, obj);
    watch(this.obj, this.refresh);
    return this.refresh();
  };

  GUI.prototype.refresh = function() {
    var html;
    html = this.print(JSON.stringify(this.obj, void 0, 4));
    return this.content.html(html);
  };

  GUI.prototype.print = function(obj) {
    var json;
    json = obj.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function(match) {
      var cls;
      cls = 'number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'key';
        } else {
          cls = 'string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'boolean';
      } else if (/null/.test(match)) {
        cls = 'null';
      }
      return '<span class="' + cls + '">' + match + '</span>';
    });
  };

  return GUI;

})();

}, {"watchjs":"node_modules/watchjs/src/watch","templates/debug/gui":"src/frontend/templates/debug/gui"});
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
var Navigation, happens, page, settings, url_parser,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

settings = require('app/utils/settings');

happens = require('happens');

url_parser = require('app/utils/url_parser');

page = require('page');

Navigation = (function() {
  var instance;

  instance = null;

  Navigation.prototype.first_loading = true;

  Navigation.prototype.first_url_change = true;

  Navigation.prototype.first_same_path = true;

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
    page('*', this.url_changed);
    page();
    delay(200, function() {
      if (_this.first_loading) {
        return _this.emit('after_render');
      }
    });
  }

  Navigation.prototype.url_changed = function(req) {
    var div,
      _this = this;
    if (this.first_url_change) {
      this.first_url_change = false;
      return;
    }
    if (req.path === location.pathname) {
      if (this.first_same_path) {
        this.first_same_path = false;
        log("[Navigation] return same path ");
      }
    }
    req.url = req.path.replace("/#", '');
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
          return _this.emit('after_render');
        });
      });
    });
  };

  Navigation.prototype.go = function(url) {
    if (window.opener != null) {
      location.href = url;
      return true;
    }
    this.first_loading = false;
    log("[Navigates] go", url);
    page(url);
    return false;
  };

  Navigation.prototype.go_silent = function(url, title) {
    return page.replace(url, null, null, false);
  };

  Navigation.prototype.bind = function(scope) {
    if (scope == null) {
      scope = 'body';
    }
    return $(scope).find('a').on('click', function() {
      var $item, a, b, href;
      $item = $(this);
      href = $item.attr('href');
      if (href == null) {
        return false;
      }
      if (href.indexOf('http') >= 0 && href.indexOf(document.domain) < 0) {
        return true;
      }
      if (href.indexOf("javascript") === 0 || href.indexOf("tel:") === 0) {
        return true;
      }
      if ($item.attr('target') != null) {
        return true;
      }
      if (href.indexOf("#") === 0) {
        return false;
      }
      a = url_parser.get_pathname(href);
      b = url_parser.get_pathname(location.pathname);
      if (a === b) {
        return false;
      }
      return Navigation.instance.go(href);
    });
  };

  return Navigation;

})();

module.exports = new Navigation;

}, {"app/utils/settings":"src/frontend/scripts/utils/settings","happens":"node_modules/happens/index","app/utils/url_parser":"src/frontend/scripts/utils/url_parser","page":"node_modules/page/index"});
require.register('src/frontend/scripts/controllers/notify', function(require, module, exports){
module.exports = {
  info: function(msg) {
    return $.notify(msg, 'info');
  },
  error: function(msg) {
    return $.notify(msg, 'error');
  }
};

}, {});
require.register('src/frontend/scripts/controllers/storage', function(require, module, exports){
/*
Wrapper class for jStorage
https://github.com/andris9/jStorage
*/

var Session;

Session = {};

Session.set = function(key, value) {
  return $.jStorage.set(key, value);
};

Session.get = function(key, _default) {
  var value;
  if (_default == null) {
    _default = false;
  }
  value = $.jStorage.get(key, _default);
  return value;
};

Session["delete"] = function(key) {
  log("[Session] delete", key);
  return $.jStorage.deleteKey(key);
};

module.exports = Session;

}, {});
require.register('src/frontend/scripts/controllers/user', function(require, module, exports){
var UserController, happens, navigation, notify, transform;

transform = require('app/utils/images/transform');

happens = require('happens');

navigation = require('app/controllers/navigation');

notify = require('app/controllers/notify');

UserController = (function() {
  var USER_DEFAULT_AVATAR, USER_DEFAULT_COVER, instance;

  instance = null;

  USER_DEFAULT_AVATAR = "/images/profile-1.jpg";

  USER_DEFAULT_COVER = "/images/homepage.jpg";

  UserController.prototype.data = null;

  UserController.prototype.is_owner = false;

  function UserController() {
    var _this = this;
    if (UserController.instance) {
      console.error("You can't instantiate this UserController twice");
      return;
    }
    UserController.instance = this;
    happens(this);
    this.fetch_from_session();
    view.once('binded', function(scope) {
      if (!scope.main) {
        return;
      }
      if (_this.is_logged()) {
        return _this._dispatch_login();
      } else {
        return _this._dispatch_logout();
      }
    });
  }

  /*
  Called from the outside, when the user logs in
  */


  UserController.prototype.login = function(data) {
    this.data = data;
    log("[UserController] user:logged", this.data);
    this.create_images();
    this.write_to_session();
    this._dispatch_login();
    return notify.info("You've successufully logged in.");
  };

  /*
  Called from the outside, when the user logs out
  */


  UserController.prototype.logout = function(callback) {
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
    return $.post('/api/v1/logout', {}, function(data) {
      _this.delete_session();
      _this._dispatch_logout();
      navigation.go('/');
      notify.info("You've successufully logged out.");
      return typeof callback === "function" ? callback() : void 0;
    });
  };

  UserController.prototype.check_guest_owner = function() {
    if ((typeof owner_id !== "undefined" && owner_id !== null) && this.is_logged() && this.data.username === owner_id) {
      app.body.addClass('is_owner').removeClass('is_guest');
      return this.is_owner = true;
    } else {
      app.body.removeClass('is_owner').addClass('is_guest');
      return this.is_owner = false;
    }
  };

  UserController.prototype.create_images = function() {
    console.log("[UserController] NORMALIZE DATA before", this.data);
    if (this.data.avatar == null) {
      log("[User Controller] user.avatar is undefined. Setting default.");
      this.data.avatar = UserController.USER_DEFAULT_AVATAR;
    }
    console.log("[UserController] NORMALIZE DATA after", this.data);
    this.data.images = {
      top_bar: transform.top_bar(this.data.avatar),
      avatar: transform.avatar(this.data.avatar),
      cover: transform.cover(this.data.cover)
    };
    return this.emit('user:updated', this.data);
  };

  /*
  Private Methods
  */


  UserController.prototype._dispatch_login = function() {
    log("[====== USER LOGGED =======]");
    log("" + this.data.username + " / " + this.data.name);
    log(this.data);
    log("[==========================]");
    this.check_guest_owner();
    app.body.addClass("logged");
    return this.emit('user:logged', this.data);
  };

  UserController.prototype._dispatch_logout = function() {
    log("[====== USER NOT LOGGED =======]");
    log("[==========================]");
    this.check_guest_owner();
    app.body.removeClass("logged");
    return this.emit('user:unlogged');
  };

  /*
  Shortcut Methods
  */


  UserController.prototype.has_informations = function() {
    if (this.data && ((this.data.bio != null) || (this.data.location != null))) {
      return true;
    }
    return false;
  };

  UserController.prototype.is_logged = function() {
    return this.data;
  };

  /*
  Session (cookie) Methods
  */


  UserController.prototype.fetch_from_session = function() {
    return this.data = app.session.get('user', null);
  };

  UserController.prototype.write_to_session = function() {
    return app.session.set('user', this.data);
  };

  UserController.prototype.delete_session = function() {
    this.data = null;
    return app.session["delete"]('user');
  };

  return UserController;

})();

module.exports = new UserController;

}, {"app/utils/images/transform":"src/frontend/scripts/utils/images/transform","happens":"node_modules/happens/index","app/controllers/navigation":"src/frontend/scripts/controllers/navigation","app/controllers/notify":"src/frontend/scripts/controllers/notify"});
require.register('src/frontend/scripts/controllers/views', function(require, module, exports){
var View, happens, happens_destroy, view,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

happens = require('happens');

happens_destroy = require('app/utils/happens_destroy');

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
      if (tolog) {
        log("[views] binding", view_name);
      }
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
      var data;
      data = {
        scope: scope,
        main: scope === 'body' || scope === '#content'
      };
      _this.emit("binded", data);
      return app.on_views_binded(data);
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
        happens_destroy(v);
        if (typeof v.destroy === "function") {
          v.destroy();
        }
        v.view_name = null;
        return view.on_view_destroyed(id);
      }
    }).promise().done(function() {
      var data;
      data = {
        scope: scope,
        main: scope === 'body' || scope === '#content'
      };
      return _this.emit("unbinded", data);
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

}, {"happens":"node_modules/happens/index","app/utils/happens_destroy":"src/frontend/scripts/utils/happens_destroy"});
require.register('src/frontend/scripts/controllers/window', function(require, module, exports){
var happens, on_resize, on_scroll, win;

happens = require('happens');

win = {
  obj: Object,
  w: 0,
  h: 0,
  y: 0
};

module.exports = happens(win);

win.obj = $(window);

win.obj.on('resize', on_resize = function() {
  win.w = win.obj.width();
  win.h = win.obj.height();
  return win.emit('resize');
});

delay(100, on_resize);

$('body').on('click', function() {
  return win.emit("body:clicked");
});

win.obj.on('scroll', on_scroll = function() {
  win.y = win.obj.scrollTop();
  return win.emit('scroll', win.y);
});

delay(100, on_scroll);

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

window.api = {
  loopcast: require('./api/loopcast/loopcast')
};

module.exports = window;

}, {"./globals/delay":"src/frontend/scripts/globals/delay","./globals/interval":"src/frontend/scripts/globals/interval","./globals/log":"src/frontend/scripts/globals/log","./globals/mover":"src/frontend/scripts/globals/mover","happens":"node_modules/happens/index","./api/loopcast/loopcast":"src/frontend/scripts/api/loopcast/loopcast"});
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
    y += 20;
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
require.register('src/frontend/scripts/utils/happens_destroy', function(require, module, exports){
module.exports = function(obj) {
  if (obj.emit != null) {
    obj.on = null;
    obj.once = null;
    obj.off = null;
    obj.emit = null;
    obj.__listeners = null;
    return obj.__init = null;
  }
};

}, {});
require.register('src/frontend/scripts/utils/images/transform', function(require, module, exports){
module.exports = {
  top_bar: function(url) {
    if ((url == null) || url.indexOf("upload/") < 0) {
      return "/images/profile-49.jpg";
    } else {
      return url.replace("upload/", "upload/w_49,h_49,c_fill,g_north/");
    }
  },
  avatar: function(url) {
    if ((url == null) || url.indexOf("upload/") < 0) {
      return "/images/profile-150.jpg";
    } else {
      return url.replace("upload/", "upload/w_150,h_150,c_fill,g_north/");
    }
  },
  cover: function(url) {
    if ((url == null) || url.indexOf("upload/") < 0) {
      return "/images/profile-150.jpg";
    } else {
      return url.replace("upload/", "upload/w_1000,h_400,c_fill,g_north/");
    }
  }
};

}, {});
require.register('src/frontend/scripts/utils/login_popup', function(require, module, exports){
var popup;

popup = require('app/utils/popup');

module.exports = function() {
  return popup({
    url: '/login',
    title: 'Log In ~ Loopcast',
    w: 500,
    h: 540
  });
};

}, {"app/utils/popup":"src/frontend/scripts/utils/popup"});
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
require.register('src/frontend/scripts/utils/popup', function(require, module, exports){
module.exports = function(data) {
  var left, params, top;
  left = (app.window.w / 2) - (data.w / 2);
  top = (app.window.h / 2) - (data.h / 2);
  params = 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + data.w + ', height=' + data.h + ', top=' + top + ', left=' + left;
  return window.open(data.url, data.title, params).focus();
};

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
    if (count === images.length) {
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

settings.after_login_url = "";

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
require.register('src/frontend/scripts/utils/string', function(require, module, exports){
module.exports = {
  is_empty: function(str) {
    var s;
    s = str.replace(/\s+/g, '');
    return s.length <= 0;
  }
};

}, {});
require.register('src/frontend/scripts/utils/url_parser', function(require, module, exports){
module.exports = {
  get_pathname: function(url) {
    var find, re;
    find = location.origin;
    re = new RegExp(find, 'g');
    return url.replace(re, '');
  }
};

}, {});
require.register('src/frontend/scripts/vendors', function(require, module, exports){
var vendors;

vendors = {
  Modernizr: require('../vendors/modernizr.custom.js'),
  LocalConnection: require('../vendors/LocalConnection.js'),
  ReconnectingWebsocket: require('../vendors/reconnecting-websocket.js'),
  JqueryUiWidget: require('../vendors/jquery.ui.widget.js'),
  IframeTransport: require('../vendors/jquery.iframe-transport.js'),
  FileUpload: require('../vendors/jquery.fileupload.js'),
  Cloudinary: require('../vendors/jquery.cloudinary.js'),
  Jstorage: require('../vendors/jstorage.js'),
  Parallax: require('../vendors/parallax.min.js'),
  NotifyJs: require('../vendors/notify.min.js')
};

module.exports = vendors;

}, {"../vendors/modernizr.custom.js":"src/frontend/vendors/modernizr.custom","../vendors/LocalConnection.js":"src/frontend/vendors/LocalConnection","../vendors/reconnecting-websocket.js":"src/frontend/vendors/reconnecting-websocket","../vendors/jquery.ui.widget.js":"src/frontend/vendors/jquery.ui.widget","../vendors/jquery.iframe-transport.js":"src/frontend/vendors/jquery.iframe-transport","../vendors/jquery.fileupload.js":"src/frontend/vendors/jquery.fileupload","../vendors/jquery.cloudinary.js":"src/frontend/vendors/jquery.cloudinary","../vendors/jstorage.js":"src/frontend/vendors/jstorage","../vendors/parallax.min.js":"src/frontend/vendors/parallax.min","../vendors/notify.min.js":"src/frontend/vendors/notify.min"});
require.register('src/frontend/scripts/views/buttons/share', function(require, module, exports){
var Share,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

module.exports = Share = (function() {
  Share.prototype.opened = false;

  Share.prototype.handler = null;

  Share.prototype.black_box = null;

  Share.prototype.input = null;

  Share.prototype.copy_btn = null;

  function Share(dom) {
    var data, html, ref;
    this.dom = dom;
    this.open = __bind(this.open, this);
    this.close = __bind(this.close, this);
    this.toggle = __bind(this.toggle, this);
    this.on_copy_clicked = __bind(this.on_copy_clicked, this);
    this.on_share_opened = __bind(this.on_share_opened, this);
    ref = this;
    html = require('templates/buttons/share');
    data = {
      link: this.dom.data('permalink')
    };
    this.dom.append(html(data));
    this.handler = this.dom.find('.ss-action');
    this.black_box = this.dom.find('.share_box');
    this.input = this.dom.find('input');
    this.copy_btn = this.dom.find('.button');
    this.handler.on('click', this.toggle);
    this.dom.on('click', function(e) {
      return e.stopPropagation();
    });
    this.input.on('click', this.select);
    this.copy_btn.on('click', this.on_copy_clicked);
    app.on('share:opened', this.on_share_opened);
    app.window.on('body:clicked', this.close);
    app.window.on('scroll', this.close);
  }

  Share.prototype.on_share_opened = function(uid) {
    if (uid !== this.uid) {
      return this.close();
    }
  };

  Share.prototype.on_copy_clicked = function() {
    var text;
    this.input[0].select();
    if (app.settings.browser.OS === "Mac") {
      text = "Press CMD + C to copy the link";
    } else {
      text = "Press Ctrl + C to copy the link";
    }
    return alert(text);
  };

  Share.prototype.toggle = function(e) {
    if (this.opened) {
      this.close();
    } else {
      this.open();
    }
    return e.preventDefault();
  };

  Share.prototype.close = function() {
    if (!this.opened) {
      return;
    }
    this.opened = false;
    return this.dom.removeClass('opened');
  };

  Share.prototype.open = function() {
    var diff, h, top, y;
    if (this.opened) {
      return;
    }
    this.opened = true;
    app.emit('share:opened', this.uid);
    top = this.handler.offset().top;
    y = app.window.y;
    h = this.black_box.height();
    diff = top - y;
    log('position', diff, h + 100);
    if (diff < h + 100) {
      this.dom.addClass('on_bottom');
    } else {
      this.dom.removeClass('on_bottom');
    }
    return this.dom.addClass('opened');
  };

  Share.prototype.update_link = function(link) {
    return this.input.val(link);
  };

  Share.prototype.destroy = function() {
    this.handler.off('click', this.toggle);
    this.dom.off('click');
    this.input.off('click', this.select);
    this.copy_btn.off('click', this.on_copy_clicked);
    app.off('share:opened', this.on_share_opened);
    app.window.off('body:clicked', this.close);
    return app.window.off('scroll', this.close);
  };

  return Share;

})();

}, {"templates/buttons/share":"src/frontend/templates/buttons/share"});
require.register('src/frontend/scripts/views/buttons/start_stop', function(require, module, exports){
var StartStop, happens,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

happens = require('happens');

module.exports = StartStop = (function() {
  StartStop.prototype.started = false;

  StartStop.prototype.first_click = true;

  function StartStop(dom) {
    this.dom = dom;
    this.toggle = __bind(this.toggle, this);
    happens(this);
    this.dom.addClass('start_stop');
    this.dom.on('click', this.toggle);
    if (this.dom.data('width') === 'fixed') {
      this.lock_width();
    }
  }

  StartStop.prototype.lock_width = function() {
    var start_button, stop_button, w;
    start_button = this.dom.find('.start');
    stop_button = this.dom.find('.stop');
    w = Math.max(start_button.width(), stop_button.width()) + 2;
    start_button.width(w);
    return stop_button.width(w);
  };

  StartStop.prototype.toggle = function() {
    if (this.started) {
      this.stop();
    } else {
      this.start();
    }
    return this.first_click = false;
  };

  StartStop.prototype.stop = function() {
    if (!this.started) {
      return;
    }
    this.started = false;
    this.dom.removeClass("started");
    return this.emit('change', 'stop');
  };

  StartStop.prototype.start = function() {
    if (this.started) {
      return;
    }
    this.started = true;
    this.dom.addClass("started");
    return this.emit('change', 'start');
  };

  return StartStop;

})();

}, {"happens":"node_modules/happens/index"});
require.register('src/frontend/scripts/views/chat/messages', function(require, module, exports){
module.exports = function(dom) {
  var channel, chat, room_id, user_id;
  user_id = location.pathname.split("/")[1];
  room_id = location.pathname.split("/")[2];
  channel = pusher.subscribe("" + user_id + "." + room_id);
  chat = $('.chat_content');
  return channel.bind('message', function(data) {
    if (dom.find('.no-message').length) {
      dom.find('.no-message').remove();
    }
    dom.append("<div><img src='" + data.avatar + "' width='30' height='30'>" + data.message + "</div>");
    console.log('dom.scrollTop ->', dom.scrollTop);
    console.log('dom[0].scrollHeight ->', dom[0].scrollHeight);
    chat.scrollTop(chat[0].scrollHeight);
    return console.log("got data!!!", data);
  });
};

}, {});
require.register('src/frontend/scripts/views/chat/textarea', function(require, module, exports){
var L;

L = require('../../api/loopcast/loopcast');

module.exports = function(dom) {
  return dom.on('keyup', function(e) {
    var message, room_id, user_id;
    if (e.keyCode === 13) {
      message = dom.val();
      user_id = location.pathname.split("/")[1];
      room_id = location.pathname.split("/")[2];
      dom.val("");
      return L.chat.message(user_id, room_id, message, function(error, response) {
        if (error) {
          console.error("sending message: ", error);
          return;
        }
        return console.log("got response", response);
      });
    }
  });
};

}, {"../../api/loopcast/loopcast":"src/frontend/scripts/api/loopcast/loopcast"});
require.register('src/frontend/scripts/views/components/audio/player', function(require, module, exports){
var Player,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

module.exports = Player = (function() {
  function Player(dom) {
    this.dom = dom;
    this.on_views_binded = __bind(this.on_views_binded, this);
    this.cover = this.dom.find('.player_icon img');
    this.title = this.dom.find('.player_title');
    this.author = this.dom.find('.player_author');
    this.audio = this.dom.find('audio');
    view.once('binded', this.on_views_binded);
  }

  Player.prototype.on_views_binded = function(scope) {
    return this.share = view.get_by_dom(this.dom.find('.share_wrapper'));
  };

  Player.prototype.open = function(data) {
    if (data != null) {
      this.cover.attr('src', data.cover);
      this.title.html(data.title);
      this.author.html("By " + data.author);
      this.author.attr('title', data.title);
      this.title.attr('title', data.author);
      this.author.attr('href', data.author_link);
      this.title.attr('href', data.url);
      this.cover.parent().attr('href', data.url);
      this.cover.parent().attr('title', data.title);
      this.share.update_link(data.url);
    }
    return this.dom.addClass('visible');
  };

  Player.prototype.close = function() {
    return this.dom.removeClass('visible');
  };

  Player.prototype.play = function(mountpoint) {
    this.open();
    return this.audio.attr('src', "http://radio.loopcast.fm:8000/" + mountpoint);
  };

  return Player;

})();

}, {});
require.register('src/frontend/scripts/views/components/audio/player_preview', function(require, module, exports){
module.exports = function(dom) {
  var icon, init, is_playing, play, ref, stop, toggle;
  is_playing = false;
  icon = dom.find('.ss-play');
  if (icon.length <= 0) {
    icon = dom.find('.ss-pause');
    if (icon.length <= 0) {
      log("ERROR -> [PLAYER PREVIEW]. icon.length <= 0");
      return;
    }
  }
  ref = this;
  dom.addClass('player_preview');
  play = function() {
    if (is_playing) {
      return;
    }
    is_playing = true;
    dom.addClass('playing');
    icon.addClass('ss-pause').removeClass('ss-play');
    return app.emit('audio:started', ref.uid);
  };
  stop = function() {
    if (!is_playing) {
      return;
    }
    is_playing = false;
    dom.removeClass('playing');
    return icon.removeClass('ss-pause').addClass('ss-play');
  };
  toggle = function() {
    if (is_playing) {
      return stop();
    } else {
      return play();
    }
  };
  init = function() {
    icon.on('click', toggle);
    return app.on('audio:started', function(uid) {
      if (uid !== ref.uid) {
        return stop();
      }
    });
  };
  return init();
};

}, {});
require.register('src/frontend/scripts/views/components/click_trigger', function(require, module, exports){
var ClickTrigger, HoverTrigger, navigation, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

navigation = require('app/controllers/navigation');

HoverTrigger = require('app/views/components/hover_trigger');

module.exports = ClickTrigger = (function(_super) {
  __extends(ClickTrigger, _super);

  function ClickTrigger() {
    _ref = ClickTrigger.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  ClickTrigger.prototype.set_listeners = function() {
    this.dom.on('click', this.toggle);
    app.window.on("body:clicked", this.close);
    return navigation.on('after_render', this.close);
  };

  ClickTrigger.prototype.destroy = function() {
    ClickTrigger.__super__.destroy.call(this);
    this.dom.off('click', this.toggle);
    app.window.off("body:clicked", this.close);
    return navigation.off('after_render', this.close);
  };

  return ClickTrigger;

})(HoverTrigger);

}, {"app/controllers/navigation":"src/frontend/scripts/controllers/navigation","app/views/components/hover_trigger":"src/frontend/scripts/views/components/hover_trigger"});
require.register('src/frontend/scripts/views/components/editables/editable_profile_tags', function(require, module, exports){
var EditableProfileTags, EditableText,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

EditableText = require("./editable_text");

module.exports = EditableProfileTags = (function(_super) {
  __extends(EditableProfileTags, _super);

  function EditableProfileTags(dom) {
    this.dom = dom;
    this.close_read_mode = __bind(this.close_read_mode, this);
    this.open_edit_mode = __bind(this.open_edit_mode, this);
    this.on_binded = __bind(this.on_binded, this);
    this.on_ready = __bind(this.on_ready, this);
    EditableProfileTags.__super__.constructor.call(this, this.dom);
    this.dom.addClass('editable_profile_tags');
    this.text = this.dom.find('.text.values');
    this.empty_text = this.dom.find('.text.empty');
  }

  EditableProfileTags.prototype.on_ready = function(html) {
    this.dom.append(html);
    view.once('binded', this.on_binded);
    return view.bind(this.dom);
  };

  EditableProfileTags.prototype.on_binded = function() {
    var t,
      _this = this;
    this.tags = view.get_by_dom(this.dom.find('.tags_wrapper'));
    t = this.text.html();
    if (t.length > 0) {
      this.data = t.split(', ');
      this.tags.add_tags(this.data);
      this.default_state = false;
    } else {
      this.empty_text.show();
      this.default_state = true;
    }
    this.text.on('click', this.open_edit_mode);
    this.empty_text.on('click', this.open_edit_mode);
    return this.tags.on('change', function(data) {
      _this.data = data;
      if (_this.data.length > 1 || _this.data[0].length > 0) {
        _this.default_state = false;
      } else {
        _this.default_state = true;
      }
      return _this.emit('changed', {
        default_state: _this.default_state
      });
    });
  };

  EditableProfileTags.prototype.open_edit_mode = function(e) {
    if (!app.body.hasClass('write_mode')) {
      return;
    }
    if (e != null) {
      e.stopPropagation();
    }
    this.empty_text.hide();
    this.dom.addClass('edit_mode');
    return app.window.on('body:clicked', this.close_read_mode);
  };

  EditableProfileTags.prototype.close_read_mode = function() {
    var list;
    this.dom.removeClass('edit_mode');
    list = this.tags.get_tags();
    if (list.length === 0 || list[0].length === 0) {
      this.empty_text.show();
      this.text.html("");
    } else {
      this.text.html(list.join(', '));
    }
    return app.window.off('body:clicked', this.close_read_mode);
  };

  EditableProfileTags.prototype.get_template = function(callback) {
    return $.get('/api/v1/occupations/all', function(data) {
      var tmpl;
      tmpl = require('templates/components/editables/editable_profile_tags');
      return callback(tmpl({
        values: data
      }));
    });
  };

  EditableProfileTags.prototype.get_current_value = function() {
    if (this.default_state) {
      return [];
    } else {
      return this.data;
    }
  };

  EditableProfileTags.prototype.destroy = function() {
    this.text.off('click', this.open_edit_mode);
    this.empty_text.off('click', this.open_edit_mode);
    return EditableProfileTags.__super__.destroy.call(this);
  };

  return EditableProfileTags;

})(EditableText);

}, {"./editable_text":"src/frontend/scripts/views/components/editables/editable_text","templates/components/editables/editable_profile_tags":"src/frontend/templates/components/editables/editable_profile_tags"});
require.register('src/frontend/scripts/views/components/editables/editable_select', function(require, module, exports){
var EditableSelect, EditableText,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

EditableText = require("./editable_text");

module.exports = EditableSelect = (function(_super) {
  __extends(EditableSelect, _super);

  EditableSelect.prototype.default_text = String;

  function EditableSelect(dom) {
    this.dom = dom;
    this.close_read_mode = __bind(this.close_read_mode, this);
    this.on_ready = __bind(this.on_ready, this);
    EditableSelect.__super__.constructor.call(this, this.dom);
    this.dom.addClass('editable_select');
    this.current_value = this.dom.data('text');
    this.default_state = this.dom.data('default-selected');
  }

  EditableSelect.prototype.on_ready = function(html) {
    var ref;
    this.dom.append(html);
    this.text = this.dom.find('.text');
    this.select = this.dom.find('select');
    this.default_text = this.text.html();
    this.select.find(".default_value").html(this.default_text);
    ref = this;
    this.select.on('change', function(e) {
      var t, v;
      t = this.options[e.target.selectedIndex].text;
      v = this.options[e.target.selectedIndex].value;
      ref.default_state = v.length <= 0;
      return ref.update_text(t);
    });
    if (!this.default_state) {
      return this.update_text(this.current_value);
    }
  };

  EditableSelect.prototype.update_text = function(str) {
    this.text.text(str);
    this.dom.data('text', str);
    this.dom.data('default-selected', this.default_state);
    return this.emit('changed', {
      value: str,
      default_state: this.default_state
    });
  };

  EditableSelect.prototype.get_current_value = function() {
    if (this.default_state) {
      return "";
    } else {
      return this.text.text();
    }
  };

  EditableSelect.prototype.get_template = function(callback) {
    return $.get('/api/v1/occupations/all', function(data) {
      var tmpl;
      tmpl = require('templates/components/editables/editable_select');
      return callback(tmpl({
        values: data
      }));
    });
  };

  EditableSelect.prototype.close_read_mode = function() {};

  EditableSelect.prototype.destroy = function() {
    this.select.off('change');
    this.select = null;
    return EditableSelect.__super__.destroy.call(this);
  };

  return EditableSelect;

})(EditableText);

}, {"./editable_text":"src/frontend/scripts/views/components/editables/editable_text","templates/components/editables/editable_select":"src/frontend/templates/components/editables/editable_select"});
require.register('src/frontend/scripts/views/components/editables/editable_tags', function(require, module, exports){
var EditableTags, L,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

require('happens');

require('vendors/jquery.autocomplete.min.js');

require('vendors/jquery.tagsinput.js');

L = require('../../../api/loopcast/loopcast');

module.exports = EditableTags = (function() {
  EditableTags.prototype.current_data = [];

  EditableTags.prototype.ready = false;

  function EditableTags(dom) {
    var _this = this;
    this.dom = dom;
    this.on_remove_tag = __bind(this.on_remove_tag, this);
    this.on_add_tag = __bind(this.on_add_tag, this);
    happens(this);
    L.genres.all(function(error, list) {
      _this.dom.tagsInput({
        width: 'auto',
        height: 'auto',
        onAddTag: _this.on_add_tag,
        onRemoveTag: _this.on_remove_tag,
        autocomplete_url: list,
        defaultText: "Add new",
        autocomplete: {
          width: 200
        }
      });
      return delay(10, function() {
        _this.ready = true;
        return _this.emit('ready');
      });
    });
  }

  EditableTags.prototype.populate_tags = function(list) {};

  EditableTags.prototype.on_add_tag = function(tag) {
    log("[EditableTags] on_add_tag", tag);
    return this.emit('change', this.get_tags());
  };

  EditableTags.prototype.on_remove_tag = function(tag) {
    log("[EditableTags] on_remove_tag", tag);
    return this.emit('change', this.get_tags());
  };

  EditableTags.prototype.get_tags = function(as_string) {
    if (as_string == null) {
      as_string = false;
    }
    if (as_string) {
      return this.dom.val();
    } else {
      return this.dom.val().split(',');
    }
  };

  EditableTags.prototype.add_tags = function(tags) {
    var t, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = tags.length; _i < _len; _i++) {
      t = tags[_i];
      _results.push(this.dom.addTag(t + "", {
        focus: true,
        unique: true
      }));
    }
    return _results;
  };

  EditableTags.prototype.destroy = function() {
    this.dom.destroy_tagsinput();
    this.on = null;
    this.off = null;
    this.once = null;
    this.emit = null;
    this.on_add_tag = null;
    this.on_remove_tag = null;
    return this.dom = null;
  };

  return EditableTags;

})();

}, {"happens":"node_modules/happens/index","vendors/jquery.autocomplete.min.js":"src/frontend/vendors/jquery.autocomplete.min","vendors/jquery.tagsinput.js":"src/frontend/vendors/jquery.tagsinput","../../../api/loopcast/loopcast":"src/frontend/scripts/api/loopcast/loopcast"});
require.register('src/frontend/scripts/views/components/editables/editable_text', function(require, module, exports){
var EditableText, happens,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

happens = require('happens');

module.exports = EditableText = (function() {
  EditableText.prototype.default_state = true;

  EditableText.prototype.default_text = "";

  function EditableText(dom) {
    this.dom = dom;
    this.close_read_mode = __bind(this.close_read_mode, this);
    this.open_edit_mode = __bind(this.open_edit_mode, this);
    this.on_ready = __bind(this.on_ready, this);
    happens(this);
    this.dom.addClass('editable_text');
    this.dom.on('click', function(e) {
      return e.stopPropagation();
    });
    this.get_template(this.on_ready);
  }

  EditableText.prototype.on_ready = function(html) {
    var style, text;
    text = this.dom.text();
    this.dom.append(html);
    this.input = this.dom.find('input');
    this.input.val(text);
    this.text_el = this.dom.find('.text');
    style = {
      'font-size': '36px',
      'font-weight': this.text_el.css('font-weight'),
      'padding': '4px 10px 10px',
      'letter-spacing': this.text_el.css('letter-spacing'),
      'line-height': this.text_el.css('line-height'),
      'color': this.text_el.css('color')
    };
    this.input.css(style);
    return this.text_el.on('click', this.open_edit_mode);
  };

  EditableText.prototype.get_template = function(callback) {
    var tmpl;
    tmpl = require('templates/components/editables/editable_text');
    return callback(tmpl());
  };

  EditableText.prototype.open_edit_mode = function(e) {
    var _this = this;
    if (!app.body.hasClass('write_mode')) {
      return;
    }
    if (e != null) {
      e.stopPropagation();
    }
    log('open_edit_mode');
    this.dom.addClass('edit_mode');
    this.input.focus().select();
    this.input.on('keyup', function(e) {
      if (e.keyCode === 13) {
        return _this.close_read_mode();
      }
    });
    return app.window.on('body:clicked', this.close_read_mode);
  };

  EditableText.prototype.close_read_mode = function() {
    log('close_edit_mode');
    this.text_el.text(this.input.val());
    this.dom.removeClass('edit_mode');
    this.input.off('keyup');
    return app.window.off('body:clicked', this.close_read_mode);
  };

  EditableText.prototype.destroy = function() {};

  return EditableText;

})();

}, {"happens":"node_modules/happens/index","templates/components/editables/editable_text":"src/frontend/templates/components/editables/editable_text"});
require.register('src/frontend/scripts/views/components/editables/social_links', function(require, module, exports){
var SocialLinks, happens,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

happens = require('happens');

module.exports = SocialLinks = (function() {
  SocialLinks.prototype.default_state = true;

  SocialLinks.prototype.default_text = "";

  SocialLinks.prototype.data = [];

  SocialLinks.prototype.template_input = null;

  SocialLinks.prototype.read_template = "";

  function SocialLinks(dom) {
    var data;
    this.dom = dom;
    this.add_new = __bind(this.add_new, this);
    happens(this);
    this.dom.addClass('social_links');
    this.dom_read_mode = $('.social_read_mode');
    this.dom.on('click', function(e) {
      return e.stopPropagation();
    });
    this.read_template = require('templates/components/editables/social_link_read_mode');
    this.write_template = require('templates/components/editables/social_links');
    data = this.dom.data('links');
    if (data.length > 0) {
      this.data = this.string_to_social_data(data);
    }
    this.build_write_mode_from_data();
    this.build_read_mode_from_data();
    this.new_link_btn = this.dom.find('.add_new_link');
    this.template_input = this.dom.find('input').clone().val('');
    this.new_link_btn.on('click', this.add_new);
  }

  SocialLinks.prototype.close_read_mode = function() {
    var data, item, links, _i, _len;
    links = this.dom.find('input');
    this.data = [];
    for (_i = 0, _len = links.length; _i < _len; _i++) {
      item = links[_i];
      if (this.is_url(item.value)) {
        data = this.get_social_info_from_url(item.value);
        this.data.push(data);
      }
    }
    return this.build_read_mode_from_data();
  };

  SocialLinks.prototype.string_to_social_data = function(data) {
    var item, output, _i, _len;
    data = data.split(',');
    output = [];
    for (_i = 0, _len = data.length; _i < _len; _i++) {
      item = data[_i];
      output.push(this.get_social_info_from_url(item));
    }
    return output;
  };

  SocialLinks.prototype.social_data_to_string = function(data) {
    var item, output, _i, _len;
    output = [];
    for (_i = 0, _len = data.length; _i < _len; _i++) {
      item = data[_i];
      output.push(item.value);
    }
    return output.join(',');
  };

  SocialLinks.prototype.build_read_mode_from_data = function() {
    var html, item, _i, _len, _ref;
    html = "";
    _ref = this.data;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      html += this.read_template(item);
    }
    return this.dom_read_mode.html(html);
  };

  SocialLinks.prototype.build_write_mode_from_data = function() {
    var html;
    html = this.write_template({
      links: this.data
    });
    return this.dom.html(html);
  };

  SocialLinks.prototype.get_social_info_from_url = function(s) {
    var social, title;
    if (s.indexOf('facebook.com') > -1) {
      social = "facebook";
      title = "facebook";
    } else if (s.indexOf('spotify.com') > -1) {
      social = "spotify";
      title = "spotify";
    } else if (s.indexOf('soundcloud.com') > -1) {
      social = "soundcloud";
      title = "soundcloud";
    } else {
      social = "generic";
      title = "user link";
    }
    return {
      social: social,
      title: title,
      value: s
    };
  };

  SocialLinks.prototype.get_current_value = function() {
    return this.social_data_to_string(this.data);
  };

  SocialLinks.prototype.is_url = function(s) {
    var regexp;
    regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return regexp.test(s);
  };

  SocialLinks.prototype.add_new = function() {
    return this.new_link_btn.before(this.template_input.clone());
  };

  SocialLinks.prototype.get_template = function(callback) {
    var tmpl;
    tmpl = require('templates/components/editables/social_links');
    return callback(tmpl());
  };

  SocialLinks.prototype.destroy = function() {
    return this.new_link_btn.off('click', this.add_new);
  };

  return SocialLinks;

})();

}, {"happens":"node_modules/happens/index","templates/components/editables/social_link_read_mode":"src/frontend/templates/components/editables/social_link_read_mode","templates/components/editables/social_links":"src/frontend/templates/components/editables/social_links"});
require.register('src/frontend/scripts/views/components/fixed_bar', function(require, module, exports){
module.exports = function(dom) {
  var fixed, h;
  h = dom.height();
  fixed = false;
  return app.window.on('scroll', function(y) {
    if (y >= h && !fixed) {
      fixed = true;
      return dom.addClass('fixed');
    } else if (y < h && fixed) {
      fixed = false;
      return dom.removeClass('fixed');
    }
  });
};

}, {});
require.register('src/frontend/scripts/views/components/fullscreen', function(require, module, exports){
var Fullscreen,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

module.exports = Fullscreen = (function() {
  Fullscreen.prototype.factor = 1;

  Fullscreen.prototype.min_height = 500;

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
    var h;
    h = (app.window.h - app.settings.header_height) * this.factor;
    h = Math.max(this.min_height, h);
    this.dom.css({
      'width': '100%',
      'height': h
    });
    return {
      destroy: function() {
        return app.window.off('resize', this.on_resize);
      }
    };
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

  Hover.prototype.destroy = function() {
    this.dom.off('mouseover', this.on_mouse_over);
    return this.dom.off('mouseleave', this.on_mouse_leave);
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
    app.on("dropdown:opened", this.on_dropdown_opened);
    app.on("dropdown:closed", this.on_dropdown_closed);
    app.window.on("scroll", this.close);
    this.set_listeners();
  }

  HoverTrigger.prototype.set_listeners = function() {
    if (app.settings.touch_device) {
      return this.dom.on('click', this.toggle);
    } else {
      this.dom.on('mouseover', this.open);
      return this.target.on('mouseleave', this.close);
    }
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

  HoverTrigger.prototype.destroy = function() {
    if (app.settings.touch_device) {
      this.dom.off('click', this.toggle);
    } else {
      this.dom.off('mouseover', this.open);
      this.target.off('mouseleave', this.close);
    }
    app.window.off("scroll", this.close);
    app.off("dropdown:opened", this.on_dropdown_opened);
    return app.off("dropdown:closed", this.on_dropdown_closed);
  };

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
    var api_key, cloud_name, form, is_own_event, kill, on_upload_complete, on_upload_fail, on_upload_progress, on_upload_start, progress, ref, unsigned_id;
    happens(this);
    api_key = dom.find('.api_key').val();
    cloud_name = dom.find('.cloud_name').val();
    unsigned_id = dom.find('.unsigned_id').val();
    Cloudinary.set_config({
      cloud_name: cloud_name,
      api_key: api_key
    });
    progress = dom.find('.progress');
    ref = this;
    /*
    		Disable drag and drop feature because of a cloudinary bug:
    		when two input files are on the same page, when you drag an image on one input file, 
    		both inputs will upload the same image at the same time.
    */

    kill = function(e) {
      e.preventDefault();
      return e.stopPropagation();
    };
    dom.on({
      dragover: kill,
      drop: kill,
      dragenter: kill,
      dragleave: kill
    });
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
    is_own_event = function(e) {
      return e.currentTarget;
    };
    form = dom.find('form');
    form.append($.cloudinary.unsigned_upload_tag(unsigned_id, {
      cloud_name: cloud_name
    }, {
      cloudinary_field: unsigned_id
    }).on('cloudinarydone', on_upload_complete).on('fileuploadstart', on_upload_start).on('fileuploadprogress', on_upload_progress).on('fileuploadfail', on_upload_fail));
  }

  return ImageUploader;

})();

}, {"happens":"node_modules/happens/index","app/controllers/cloudinary":"src/frontend/scripts/controllers/cloudinary"});
require.register('src/frontend/scripts/views/components/logged_link', function(require, module, exports){
var login_popup, user_controller;

user_controller = require('app/controllers/user');

login_popup = require('app/utils/login_popup');

module.exports = function(dom) {
  var on_click, on_user_logged, on_user_unlogged, original_url;
  original_url = dom.attr('href');
  on_click = function() {
    app.settings.after_login_url = original_url;
    login_popup();
    return false;
  };
  on_user_logged = function(data) {
    dom.attr('href', original_url);
    return dom.off('click', on_click);
  };
  on_user_unlogged = function(data) {
    dom.attr('href', '#');
    return dom.on('click', on_click);
  };
  user_controller.on('user:logged', on_user_logged);
  user_controller.on('user:unlogged', on_user_unlogged);
  if (user_controller.is_logged()) {
    return on_user_logged();
  } else {
    return on_user_unlogged();
  }
};

}, {"app/controllers/user":"src/frontend/scripts/controllers/user","app/utils/login_popup":"src/frontend/scripts/utils/login_popup"});
require.register('src/frontend/scripts/views/components/login_popup_handler', function(require, module, exports){
var login_popup;

login_popup = require('app/utils/login_popup');

module.exports = function(dom) {
  return dom.on('click', function() {
    return login_popup();
  });
};

}, {"app/utils/login_popup":"src/frontend/scripts/utils/login_popup"});
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
var Modal, happens,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

happens = require('happens');

module.exports = Modal = (function() {
  Modal.prototype.opened = false;

  function Modal(dom) {
    this.dom = dom;
    this.close = __bind(this.close, this);
    happens(this);
    this.overlay = $('.md_overlay');
  }

  Modal.prototype.open = function() {
    var _this = this;
    if (this.opened) {
      return;
    }
    this.opened = true;
    this.dom.addClass('md_visible');
    delay(10, function() {
      return _this.dom.addClass('md_show');
    });
    if ((this.dom.data('modal-close') != null) && this.dom.data('modal-close') !== false) {
      this.close_on_click_outside();
    } else {
      this.disable_close_on_click_outside();
    }
    return this.emit('opened');
  };

  Modal.prototype.close_on_click_outside = function() {
    return this.overlay.off('click').on('click', this.close);
  };

  Modal.prototype.disable_close_on_click_outside = function() {
    return this.overlay.off('click');
  };

  Modal.prototype.close = function() {
    var _this = this;
    if (!this.opened) {
      log("[Modal] it's already closed!");
      return;
    }
    this.opened = false;
    this.dom.removeClass('md_show');
    return delay(400, function() {
      _this.dom.removeClass('md_visible');
      _this.hide_loading();
      return _this.emit('closed');
    });
  };

  Modal.prototype.show_loading = function() {
    return this.dom.addClass('loading');
  };

  Modal.prototype.hide_loading = function() {
    return this.dom.removeClass('loading');
  };

  Modal.prototype.destroy = function() {
    this.dom = null;
    this.on = null;
    this.off = null;
    return this.once = null;
  };

  return Modal;

})();

}, {"happens":"node_modules/happens/index"});
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
    ({
      destroy: function() {
        return this.dom.off('click');
      }
    });
  }

  return ScrollHandler;

})();

}, {});
require.register('src/frontend/scripts/views/components/select', function(require, module, exports){
var Select, happens;

happens = require('happens');

module.exports = Select = (function() {
  function Select(dom) {
    var handler, ref, select;
    this.dom = dom;
    happens(this);
    this.dom.addClass('select_wrapper');
    handler = this.dom.find('.handler .text');
    select = this.dom.find('select');
    ref = this;
    select.on('change', function() {
      handler.html(select.val());
      return ref.emit('changed', select.val());
    });
  }

  return Select;

})();

}, {"happens":"node_modules/happens/index"});
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
require.register('src/frontend/scripts/views/components/user_set', function(require, module, exports){
module.exports = function(dom) {
  var edit_modal, init, settings_handler, _cancel_delete, _confirm_delete, _download, _edit, _on_edit_submit, _on_views_binded, _to_delete;
  settings_handler = null;
  edit_modal = null;
  init = function() {
    dom.find('.download_button').on('click', _download);
    dom.find('.edit_button').on('click', _edit);
    dom.find('.delete_button').on('click', _to_delete);
    dom.find('.confirm_delete').on('click', _confirm_delete);
    dom.find('.cancel_delete').on('click', _cancel_delete);
    return view.once('binded', _on_views_binded);
  };
  _on_views_binded = function() {
    settings_handler = view.get_by_dom(dom.find('.settings_button'));
    return edit_modal = view.get_by_dom($('#room_modal'));
  };
  _download = function() {
    return log("[Set] download");
  };
  _edit = function() {
    settings_handler.close();
    edit_modal.open_with_data(dom.data('data'));
    return edit_modal.once('submit', _on_edit_submit);
  };
  _on_edit_submit = function(data) {
    var genre, genres, genres_dom, str, _i, _len;
    log("[User Set] edit submitted", data);
    dom.find('.session_title a').html(data.title);
    dom.find('.location .text').html(data.location);
    genres = data.genres.split(', ');
    genres_dom = dom.find('.genres');
    str = '';
    for (_i = 0, _len = genres.length; _i < _len; _i++) {
      genre = genres[_i];
      str += "<a class='tag' href='#' title='" + genre + "'>" + genre + "</a>";
    }
    genres_dom.html(str);
    edit_modal.hide_message();
    edit_modal.show_loading();
    return delay(1000, function() {
      return edit_modal.close();
    });
  };
  _to_delete = function() {
    dom.addClass('to_delete');
    return settings_handler.close();
  };
  _cancel_delete = function() {
    return dom.removeClass('to_delete');
  };
  _confirm_delete = function() {
    log("[Set] delete");
    return dom.slideUp();
  };
  return init();
};

}, {});
require.register('src/frontend/scripts/views/dashboard/appcast_instructions', function(require, module, exports){
var appcast;

appcast = require('../../controllers/appcast');

module.exports = function(dom) {
  return appcast.on('connected', function(is_connected) {
    if (is_connected) {
      return dom.hide();
    } else {
      return dom.show();
    }
  });
};

}, {"../../controllers/appcast":"src/frontend/scripts/controllers/appcast"});
require.register('src/frontend/scripts/views/dashboard/go_live', function(require, module, exports){
var L, appcast;

L = require('../../api/loopcast/loopcast');

appcast = require('../../controllers/appcast');

module.exports = function(dom) {
  var live, waiting_stream, while_streaming;
  live = false;
  while_streaming = function(status) {
    if (!status) {
      alert('streaming went offline while streaming');
      return;
    }
    if (status) {
      alert('streaming went online while streaming');
    }
  };
  waiting_stream = function(status) {
    if (!status) {
      return;
    }
    return L.rooms.start_stream($('#room_id').val(), function(error, result) {
      if (error) {
        dom.find('a').html("error");
        console.error(error);
        return;
      }
      appcast.off(waiting_stream);
      live = true;
      return dom.find('a').html("GO OFFLINE");
    });
  };
  return dom.find('a').click(function() {
    var user_id;
    user_id = location.pathname.split("/")[1];
    if (!live) {
      console.log("clicked go live!");
      if (!appcast.get('input_device')) {
        alert('select input device first');
        return;
      }
      dom.find('a').html("...");
      appcast.start_stream(user_id, appcast.get('input_device'));
      appcast.on('stream:online', waiting_stream);
    }
    if (live) {
      console.log("clicked go offline!");
      if (!appcast.get('stream:online')) {
        alert('- cant stop stream if not streaming');
        return;
      }
      dom.find('a').html("...");
      appcast.stop_stream();
      L.rooms.stop_stream($('#room_id').val(), function(error, callback) {
        if (error) {
          dom.find('a').html("error");
          console.error(error);
          return;
        }
        live = false;
        return dom.find('a').html("GO LIVE");
      });
    }
    return false;
  });
};

}, {"../../api/loopcast/loopcast":"src/frontend/scripts/api/loopcast/loopcast","../../controllers/appcast":"src/frontend/scripts/controllers/appcast"});
require.register('src/frontend/scripts/views/dashboard/input_devices', function(require, module, exports){
var InputDevices, Select, appcast, happens,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

appcast = require('app/controllers/appcast');

happens = require('happens');

Select = require('../components/select');

module.exports = InputDevices = (function(_super) {
  __extends(InputDevices, _super);

  function InputDevices(dom) {
    InputDevices.__super__.constructor.call(this, dom);
    appcast.on('input_devices', function(devices) {
      var device, _i, _len, _results;
      dom.find("select").html(" ");
      _results = [];
      for (_i = 0, _len = devices.length; _i < _len; _i++) {
        device = devices[_i];
        _results.push(dom.find("select").append("<option value='" + device + "'>" + device + "</option>"));
      }
      return _results;
    });
    this.on('changed', function(device) {
      return appcast.set('input_device', dom.find("select").val());
    });
  }

  return InputDevices;

})(Select);

}, {"app/controllers/appcast":"src/frontend/scripts/controllers/appcast","happens":"node_modules/happens/index","../components/select":"src/frontend/scripts/views/components/select"});
require.register('src/frontend/scripts/views/dashboard/meter', function(require, module, exports){
var Meter;

module.exports = Meter = (function() {
  function Meter(dom) {
    var _this = this;
    this.dom = dom;
    this.progress = this.dom.find('.meter span');
    this.is_left = this.dom.attr('class').indexOf("left") !== -1;
    appcast.on('stream:vu', function(meter) {
      if (_this.is_left) {
        return _this.set_volume(meter[0]);
      } else {
        return _this.set_volume(meter[1]);
      }
    });
  }

  Meter.prototype.set_volume = function(perc) {
    return this.progress.css('width', "" + (perc * 100) + "%");
  };

  return Meter;

})();

}, {});
require.register('src/frontend/scripts/views/dashboard/record', function(require, module, exports){
var L, appcast;

L = require('../../api/loopcast/loopcast');

appcast = require('../../controllers/appcast');

module.exports = function(dom) {
  var recording, start_recording;
  recording = false;
  start_recording = function(callback) {
    return L.rooms.start_recording($('#room_id').val(), function(error, response) {
      if (error) {
        console.error("error when recording room", error);
        dom.find('a').html("ERROR");
        return;
      }
      recording = true;
      return dom.find('a').html("STOP REC");
    });
  };
  return dom.find('a').click(function() {
    var user_id;
    if (!recording) {
      console.log("clicked go recording!");
      if (!appcast.get('input_device')) {
        alert('select input device first');
        return;
      }
      dom.find('a').html("...");
      if (appcast.get('stream:online')) {
        start_recording();
      } else {
        user_id = location.pathname.split("/")[1];
        appcast.start_stream(user_id, appcast.get('input_device'));
        appcast.on('stream:online', start_recording);
      }
    }
    if (recording) {
      console.log("clicked stop recording!");
      dom.find('a').html("...");
      user_id = location.pathname.split("/")[1];
      L.rooms.stop_recording($('#room_id').val(), function(error, callback) {
        var channel;
        if (error) {
          console.error("error while stopping recording");
          return;
        }
        recording = false;
        dom.find('a').html("RECORDED");
        channel = pusher.subscribe("tape." + user_id);
        channel.bind("upload:finished", function(file) {
          console.log("finished uploading file ->", file);
          return alert("Uploaded file! " + file);
        });
        channel.bind("upload:error", function(error) {
          console.error("failed uploading ->", error);
          return alert("Error uploading file :(");
        });
        return channel.bind("upload:failed", function(error) {
          console.log("failed uploading ->", error);
          return alert("Failed uploading file :(");
        });
      });
    }
    return false;
  });
};

}, {"../../api/loopcast/loopcast":"src/frontend/scripts/api/loopcast/loopcast","../../controllers/appcast":"src/frontend/scripts/controllers/appcast"});
require.register('src/frontend/scripts/views/explore', function(require, module, exports){
var Isotope;

Isotope = require('isotope-layout');

module.exports = function(dom) {
  var container_isotope, filters, isotope;
  container_isotope = dom.find('.rooms_grid')[0];
  isotope = new Isotope(container_isotope, {
    itemSelector: '.item',
    gutter: 30,
    layoutMode: 'masonry',
    masonry: {
      columnWidth: 210,
      gutter: 30
    }
  });
  filters = dom.find('.genres_list a');
  return dom.find('[data-genre-id]').on('click', function(e) {
    var genre_id;
    genre_id = $(e.currentTarget).data('genre-id');
    log("click", genre_id);
    filters.removeClass('selected');
    dom.find('.genres_list a[data-genre-id="' + genre_id + '"]').addClass('selected');
    return isotope.arrange({
      filter: ".item-" + genre_id
    });
  });
};

}, {"isotope-layout":"node_modules/isotope-layout/js/isotope"});
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
    this.on_user_updated = __bind(this.on_user_updated, this);
    this.on_user_logged = __bind(this.on_user_logged, this);
    this.check_menu = __bind(this.check_menu, this);
    user_controller.on('user:logged', this.on_user_logged);
    user_controller.on('user:unlogged', this.on_user_unlogged);
    user_controller.on('user:updated', this.on_user_updated);
    navigation.on('after_render', this.check_menu);
  }

  Header.prototype.check_menu = function() {
    var obj, page, submenu;
    obj = $('[data-menu]');
    if (obj.length > 0) {
      page = obj.data('menu');
      if (this.current_page.length > 0) {
        this.dom.find("." + this.current_page + "_item").removeClass("selected");
        app.body.removeClass("" + this.current_page + "_page");
      }
      this.dom.find("." + page + "_item").addClass("selected");
      app.body.addClass("" + page + "_page");
      this.current_page = page;
    }
    obj = $('[data-submenu]');
    if (obj.length > 0) {
      submenu = obj.data('submenu');
      $("." + submenu).addClass('selected');
    }
    obj = $('[data-menu-fixed]');
    if (obj.length > 0) {
      if (obj.data('menu-fixed') === false) {
        return app.body.addClass('unfixed');
      }
    } else {
      return app.body.removeClass('unfixed');
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
    wrapper.empty().append(html);
    view.bind(wrapper);
    return navigation.bind(wrapper);
  };

  Header.prototype.on_user_updated = function(data) {
    log("[Header] udpating image", data.images.top_bar);
    return this.dom.find('.top_bar_icon').attr('src', data.images.top_bar);
  };

  Header.prototype.on_user_unlogged = function(data) {
    if (!this.user_logged) {
      return;
    }
    return this.user_logged = false;
  };

  return Header;

})();

}, {"app/controllers/navigation":"src/frontend/scripts/controllers/navigation","app/controllers/user":"src/frontend/scripts/controllers/user","templates/shared/header_user_logged":"src/frontend/templates/shared/header_user_logged"});
require.register('src/frontend/scripts/views/homepage', function(require, module, exports){
var Homepage, happens, preload;

preload = require('app/utils/preload');

happens = require('happens');

module.exports = Homepage = (function() {
  function Homepage(dom) {
    var elements, images,
      _this = this;
    this.dom = dom;
    happens(this);
    this.dom.addClass('request_preloading');
    elements = [];
    images = [];
    this.dom.find('.parallax-container').each(function() {
      elements.push($(this));
      return images.push($(this).data('image-parallax'));
    });
    preload(images, function(images_loaded) {
      var el, i, _i, _len;
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
      return _this.ready();
    });
  }

  Homepage.prototype.ready = function() {
    var _this = this;
    delay(100, function() {
      return app.window.obj.trigger('resize');
    });
    return delay(200, function() {
      return _this.emit('ready');
    });
  };

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

}, {"app/utils/preload":"src/frontend/scripts/utils/preload","happens":"node_modules/happens/index"});
require.register('src/frontend/scripts/views/loading', function(require, module, exports){
var Loading, Opacity, navigation;

navigation = require('app/controllers/navigation');

Opacity = require('app/utils/opacity');

module.exports = Loading = (function() {
  Loading.prototype.first_time = true;

  function Loading(dom) {
    var _this = this;
    this.dom = dom;
    app.on('loading:show', function() {
      app.body.addClass('loading').removeClass('loaded');
      return Opacity.show(_this.dom, 100);
    });
    app.on('loading:hide', function() {
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
require.register('src/frontend/scripts/views/logged_view', function(require, module, exports){
var LoggedView, user_controller,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

user_controller = require('app/controllers/user');

module.exports = LoggedView = (function() {
  function LoggedView() {
    this.destroy = __bind(this.destroy, this);
    this.on_user_unlogged = __bind(this.on_user_unlogged, this);
    this.on_user_logged = __bind(this.on_user_logged, this);
    this.on_user_updated = __bind(this.on_user_updated, this);
    this.on_views_binded = __bind(this.on_views_binded, this);
    view.once('binded', this.on_views_binded);
  }

  LoggedView.prototype.on_views_binded = function(scope) {
    var user;
    if (!scope.main) {
      return;
    }
    user_controller.on('user:logged', this.on_user_logged);
    user_controller.on('user:unlogged', this.on_user_unlogged);
    user_controller.on('user:updated', this.on_user_updated);
    user = user_controller.data;
    if (user) {
      return this.on_user_logged(user);
    } else {
      return this.on_user_unlogged();
    }
  };

  LoggedView.prototype.on_user_updated = function(user_data) {
    this.user_data = user_data;
  };

  LoggedView.prototype.on_user_logged = function(user_data) {
    this.user_data = user_data;
  };

  LoggedView.prototype.on_user_unlogged = function() {};

  LoggedView.prototype.destroy = function() {
    user_controller.off('user:logged', this.on_user_logged);
    user_controller.off('user:unlogged', this.on_user_unlogged);
    return user_controller.off('user:updated', this.on_user_updated);
  };

  return LoggedView;

})();

}, {"app/controllers/user":"src/frontend/scripts/controllers/user"});
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
    $('#player').hide();
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
var Cloudinary, LoggedView, Profile, api, happens, notify, transform, user_controller,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Cloudinary = require('app/controllers/cloudinary');

transform = require('app/utils/images/transform');

notify = require('app/controllers/notify');

user_controller = require('app/controllers/user');

LoggedView = require('app/views/logged_view');

api = require('app/api/loopcast/loopcast');

happens = require('happens');

module.exports = Profile = (function(_super) {
  __extends(Profile, _super);

  Profile.prototype.elements = null;

  Profile.prototype.form_bio = null;

  Profile.prototype.cover_url = "";

  function Profile(dom) {
    var ref,
      _this = this;
    this.dom = dom;
    this.on_user_unlogged = __bind(this.on_user_unlogged, this);
    this.check_visibility_editables = __bind(this.check_visibility_editables, this);
    this.on_user_logged = __bind(this.on_user_logged, this);
    this.on_views_binded = __bind(this.on_views_binded, this);
    Profile.__super__.constructor.call(this);
    happens(this);
    log("[=== PAGE OWNER: " + owner_id + " ===]");
    console.log(profile_info);
    this.elements = {
      avatar: this.dom.find('.profile_image img'),
      cover_picture: this.dom.find('.cover_image'),
      location: this.dom.find('.profile_bio .location'),
      location_input: this.dom.find('.location_input'),
      about: this.dom.find('.bio'),
      about_input: this.dom.find('.bio_input'),
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
      ],
      occupation_input: null,
      genre_input: null
    };
    this.elements.avatar.attr('src', transform.avatar(profile_info.avatar));
    this.form_bio = this.dom.find('.profile_form');
    this.form_bio.on('submit', function(e) {
      return e.preventDefault();
    });
    this.form_bio.find('input').keyup(function(e) {
      if (e.keyCode === 13) {
        return _this.save_data();
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
          return ref.save_data();
      }
    });
    $('#room_modal').data('modal-close', true);
    this.check_informations();
    delay(100, function() {
      return _this.emit('ready');
    });
  }

  Profile.prototype.on_views_binded = function(scope) {
    var g, l, o;
    if (!scope.main) {
      return;
    }
    this.user_data = profile_info;
    this.update_dom_from_user_data();
    o = view.get_by_dom(this.dom.find('.cover h3.type'));
    g = view.get_by_dom(this.dom.find('.cover .genres'));
    l = view.get_by_dom(this.dom.find('.social_links'));
    if (o && g) {
      this.elements.occupation_input = o;
      this.elements.genre_input = g;
      this.elements.links_input = l;
    } else {
      console.error("[Profile] couldn't find occupation and genres component.");
    }
    return Profile.__super__.on_views_binded.call(this, scope);
  };

  Profile.prototype.on_user_logged = function(user_data) {
    var _this = this;
    this.user_data = user_data;
    Profile.__super__.on_user_logged.call(this, this.user_data);
    this.dom.addClass('user_logged');
    this.check_visibility_editables();
    if (!user_controller.is_owner) {
      return;
    }
    this.change_cover_uploader = view.get_by_dom(this.dom.find('.change_cover'));
    if (!this.change_cover_uploader) {
      return;
    }
    this.change_cover_uploader.on('completed', function(data) {
      log("[Cover uploader]", data.result.url);
      _this.cover_url = data.result.url;
      return _this.dom.find('.cover_image').css({
        'background-image': "url(" + data.result.url + ")"
      });
    });
    this.change_picture_uploader = view.get_by_dom(this.dom.find('.profile_image'));
    this.change_picture_uploader.on('completed', function(data) {
      var url;
      user_controller.data.avatar = data.result.url;
      user_controller.normalize_data();
      url = user_controller.data.images.avatar;
      return _this.dom.find('img').attr('src', url);
    });
    this.editables = [];
    this.editables.push(view.get_by_dom('.cover h1.name'));
    this.editables.push(view.get_by_dom('.cover h3.type'));
    this.editables.push(view.get_by_dom('.cover .genres'));
    return this.editables.push(view.get_by_dom('.social_links'));
  };

  Profile.prototype.check_visibility_editables = function() {
    if (user_controller.is_owner) {
      this.elements.occupation_input.dom.show();
      return this.elements.genre_input.dom.show();
    } else {
      if (this.elements.occupation_input.default_state) {
        this.elements.occupation_input.dom.hide();
      }
      if (this.elements.genre_input.default_state) {
        return this.elements.genre_input.dom.hide();
      }
    }
  };

  Profile.prototype.on_user_unlogged = function() {
    var _ref, _ref1,
      _this = this;
    Profile.__super__.on_user_unlogged.call(this);
    this.dom.removeClass('user_logged');
    if ((_ref = this.change_cover_uploader) != null) {
      _ref.off('completed');
    }
    if ((_ref1 = this.change_picture_uploader) != null) {
      _ref1.off('completed');
    }
    return delay(1, function() {
      return _this.check_visibility_editables();
    });
  };

  Profile.prototype.write_mode = function() {
    return app.body.addClass('write_mode');
  };

  Profile.prototype.save_data = function() {
    var item, _i, _len, _ref;
    _ref = this.editables;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      item.close_read_mode();
    }
    this.update_user_data_from_dom();
    this.update_dom_from_user_data();
    this.check_informations();
    this.send_to_server();
    return app.body.removeClass('write_mode');
  };

  Profile.prototype.update_user_data_from_dom = function() {
    this.user_data.location = this.elements.location_input.val();
    this.user_data.about = this.elements.about_input.val();
    this.user_data.occupation = this.elements.occupation_input.get_current_value();
    this.user_data.genres = this.elements.genre_input.get_current_value();
    log("[Profile] update_user_data_from_dom", this.elements.genre_input, this.user_data.genres);
    this.user_data.social = this.elements.links_input.get_current_value();
    if (user_controller.data.avatar != null) {
      this.user_data.avatar = user_controller.data.avatar;
    }
    if (this.cover_url.length > 0) {
      return this.user_data.cover = this.cover_url;
    }
  };

  Profile.prototype.update_dom_from_user_data = function() {
    var d, e;
    e = this.elements;
    d = this.user_data;
    e.avatar.css('background-image', d.avatar);
    e.cover_picture.css('background-image', d.cover_picture);
    if (d.location) {
      e.location.html(d.location);
      e.location_input.val(d.location);
    }
    if (d.about) {
      e.about.html(d.about);
      return e.about_input.val(this.html_to_textarea(d.about));
    }
  };

  Profile.prototype.html_to_textarea = function(str) {
    var re, to_find, to_replace;
    to_find = "<br/>";
    to_replace = "\n";
    re = new RegExp(to_find, 'g');
    return str.replace(re, to_replace);
  };

  Profile.prototype.check_informations = function() {
    var b, l;
    l = this.elements.location.html().length;
    b = this.elements.about.html().length;
    if (l > 0 || b > 0) {
      return this.dom.removeClass('no_information_yet');
    } else {
      return this.dom.addClass('no_information_yet');
    }
  };

  Profile.prototype.send_to_server = function() {
    var _this = this;
    log("[Profile] saving", this.user_data);
    return api.user.edit(this.user_data, function(error, response) {
      log("[Profile] fields updated", response.custom_attributes);
      if (error) {
        log("---> Error Profile edit user", error.statusText);
        return;
      }
      return user_controller.write_to_session();
    });
  };

  return Profile;

})(LoggedView);

}, {"app/controllers/cloudinary":"src/frontend/scripts/controllers/cloudinary","app/utils/images/transform":"src/frontend/scripts/utils/images/transform","app/controllers/notify":"src/frontend/scripts/controllers/notify","app/controllers/user":"src/frontend/scripts/controllers/user","app/views/logged_view":"src/frontend/scripts/views/logged_view","app/api/loopcast/loopcast":"src/frontend/scripts/api/loopcast/loopcast","happens":"node_modules/happens/index"});
require.register('src/frontend/scripts/views/room', function(require, module, exports){
var L, Room, Strings, navigation, notify, user_controller,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

L = require('api/loopcast/loopcast');

navigation = require('app/controllers/navigation');

Strings = require('app/utils/string');

user_controller = require('app/controllers/user');

notify = require('app/controllers/notify');

module.exports = Room = (function() {
  function Room(dom) {
    this.dom = dom;
    this.on_user_unlogged = __bind(this.on_user_unlogged, this);
    this.on_user_logged = __bind(this.on_user_logged, this);
    this.on_modal_submit = __bind(this.on_modal_submit, this);
    this.on_input_changed = __bind(this.on_input_changed, this);
    this.on_view_binded = __bind(this.on_view_binded, this);
    view.once('binded', this.on_view_binded);
    user_controller.on('user:logged', this.on_user_logged);
    user_controller.on('user:unlogged', this.on_user_unlogged);
    this.elements = {
      title: this.dom.find('.cover .name'),
      genre: this.dom.find('.cover .genres'),
      location: this.dom.find('.cover .location'),
      cover: this.dom.find('.cover .cover_image'),
      description: this.dom.find('.chat_header p')
    };
    if (Strings.is_empty(this.elements.title.html())) {
      this.elements.title.addClass('hidden');
    }
    if (Strings.is_empty(this.elements.genre.html())) {
      this.elements.genre.addClass('hidden');
    }
    if (Strings.is_empty(this.elements.location.html())) {
      this.elements.location.addClass('hidden');
    }
  }

  Room.prototype.on_view_binded = function() {
    var user;
    this.modal = view.get_by_dom('#room_modal');
    this.modal.on('input:changed', this.on_input_changed);
    this.modal.on('submit', this.on_modal_submit);
    if (this.is_create_page()) {
      this.modal.open();
    }
    this.check_guest();
    this.player = view.get_by_dom('#player');
    if (this.is_guest()) {
      user = location.pathname.split('/')[1];
      return this.player.play(user);
    }
  };

  Room.prototype.on_input_changed = function(data) {
    switch (data.name) {
      case 'title':
      case 'genre':
      case 'location':
      case 'description':
        this.elements[data.name].html(data.value);
        if (data.value.length > 0) {
          return this.elements[data.name].removeClass('hidden');
        } else {
          return this.elements[data.name].addClass('hidden');
        }
        break;
      case 'cover':
        return this.elements[data.name].css({
          'background-image': "url(" + data.value.secure_url + ")"
        });
    }
  };

  Room.prototype.on_modal_submit = function(data) {
    var m, ref;
    log("[Room] on_modal_submit", data);
    this.modal.hide_message();
    this.modal.show_loading();
    m = this.modal;
    ref = this;
    return L.rooms.create(data, function(error, data) {
      var _this = this;
      if (error != null) {
        notify.error(error.responseJSON.message);
        m.hide_loading();
        return false;
      }
      return delay(1000, function() {
        var hidden;
        hidden = "<input type='hidden' id='room_id' value='" + data._id + "'>";
        $('body').append(hidden);
        navigation.go_silent("/" + data.info.user + "/" + data.info.slug);
        ref.check_guest();
        m.close();
        return $('.create_room_item').removeClass('selected');
      });
    });
  };

  Room.prototype.on_user_logged = function(data) {
    return this.check_guest();
  };

  Room.prototype.on_user_unlogged = function(data) {
    return this.check_guest();
  };

  Room.prototype.check_guest = function() {
    /*
    		If the url path starts with /username, 
    		then the user is not a guest
    */

    if (this.is_guest()) {
      return app.body.addClass('guest');
    } else {
      app.body.removeClass('guest');
      return appcast.connect();
    }
  };

  Room.prototype.is_guest = function() {
    var guest, u;
    u = user_controller.data;
    return guest = location.pathname.indexOf("/" + u.username) !== 0;
  };

  Room.prototype.is_create_page = function() {
    return location.pathname === '/rooms/create';
  };

  Room.prototype.destroy = function() {
    user_controller.off('user:logged', this.on_user_logged);
    return user_controller.off('user:unlogged', this.on_user_unlogged);
  };

  return Room;

})();

}, {"api/loopcast/loopcast":"src/frontend/scripts/api/loopcast/loopcast","app/controllers/navigation":"src/frontend/scripts/controllers/navigation","app/utils/string":"src/frontend/scripts/utils/string","app/controllers/user":"src/frontend/scripts/controllers/user","app/controllers/notify":"src/frontend/scripts/controllers/notify"});
require.register('src/frontend/scripts/views/room/dashboard', function(require, module, exports){
module.exports = function(dom) {
  var init, on_broadcast_click, on_ready, on_recording_click, volume;
  volume = {
    left: null,
    right: null
  };
  init = function() {
    return view.once('binded', on_ready);
  };
  on_ready = function() {
    var broadcast_trigger, input_select, recording_trigger;
    broadcast_trigger = view.get_by_dom(dom.find('.broadcast_controls'));
    recording_trigger = view.get_by_dom(dom.find('.recording_controls'));
    if (broadcast_trigger.length > 0) {
      broadcast_trigger.on('change', on_broadcast_click);
    }
    volume.left = view.get_by_dom(dom.find('.meter_wrapper.left'));
    volume.right = view.get_by_dom(dom.find('.meter_wrapper.right'));
    volume.left.set_volume(0.7);
    volume.right.set_volume(0.78);
    input_select = view.get_by_dom(dom.find('.input_select'));
    return input_select.on('changed', function(data) {
      return log("[Dashboard] input changed", data);
    });
  };
  on_broadcast_click = function(data) {
    log("on_broadcast_click", data);
    if (data === "start") {

    } else {

    }
  };
  on_recording_click = function(data) {
    log("on_recording_click", data);
    if (data === "start") {

    } else {

    }
  };
  return init();
};

}, {});
require.register('src/frontend/scripts/views/room/room_modal', function(require, module, exports){
var Modal, RoomModal,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Modal = require('../components/modal');

module.exports = RoomModal = (function(_super) {
  __extends(RoomModal, _super);

  RoomModal.prototype.cover_uploaded = "";

  function RoomModal(dom) {
    this.dom = dom;
    this._submit = __bind(this._submit, this);
    this._on_description_changed = __bind(this._on_description_changed, this);
    this._on_location_changed = __bind(this._on_location_changed, this);
    this._on_genre_changed = __bind(this._on_genre_changed, this);
    this._on_title_changed = __bind(this._on_title_changed, this);
    this._on_cover_changed = __bind(this._on_cover_changed, this);
    this.on_views_binded = __bind(this.on_views_binded, this);
    RoomModal.__super__.constructor.call(this, this.dom);
    this.title = this.dom.find('.roomname');
    this.location = this.dom.find('.location');
    this.description = this.dom.find('.description');
    this.message = this.dom.find('.message');
    this.submit = this.dom.find('.submit_button');
    view.once('binded', this.on_views_binded);
  }

  RoomModal.prototype.on_views_binded = function(scope) {
    var room_image_uploader;
    if (!scope.main) {
      return;
    }
    room_image_uploader = view.get_by_dom(this.dom.find('.room_image'));
    if (!room_image_uploader) {
      log("[rooms/createModal] views not binded yet!!!");
      return;
    }
    this.genre = view.get_by_dom(this.dom.find('.genre'));
    room_image_uploader.on('completed', this._on_cover_changed);
    this.title.on('keyup', this._on_title_changed);
    this.location.on('keyup', this._on_location_changed);
    this.description.on('keyup', this._on_description_changed);
    this.genre.on('change', this._on_genre_changed);
    return this.submit.on('click', this._submit);
  };

  RoomModal.prototype._on_cover_changed = function(data) {
    this.cover_uploaded = data.result.url;
    return this.emit('input:changed', {
      name: 'cover',
      value: data.result
    });
  };

  RoomModal.prototype._on_title_changed = function() {
    this._check_length(this.title);
    return this.emit('input:changed', {
      name: 'title',
      value: this.title.val()
    });
  };

  RoomModal.prototype._on_genre_changed = function(data) {
    log("_on_genre_changed", data);
    return this.emit('input:changed', {
      name: 'genre',
      value: data.join(', ')
    });
  };

  RoomModal.prototype._on_location_changed = function() {
    return this.emit('input:changed', {
      name: 'location',
      value: this.location.val()
    });
  };

  RoomModal.prototype._on_description_changed = function() {
    return this.emit('input:changed', {
      name: 'description',
      value: this.description.val()
    });
  };

  RoomModal.prototype._check_length = function(el) {
    if (el.val().length > 0) {
      return el.removeClass('required');
    } else {
      return el.addClass('required');
    }
  };

  RoomModal.prototype._submit = function() {
    var data;
    if (!this.title.val()) {
      this.title.addClass('required').focus();
      return;
    }
    data = {
      title: this.title.val(),
      genres: this.genre.get_tags(true),
      location: this.location.val(),
      about: this.description.val(),
      cover: this.cover_uploaded
    };
    log("[Create Room]submit", data);
    return this.emit('submit', data);
  };

  RoomModal.prototype.show_message = function(msg) {
    return this.message.html(msg).show();
  };

  RoomModal.prototype.hide_message = function() {
    return this.message.hide();
  };

  RoomModal.prototype.open_with_data = function(data) {
    log("[RoomModal] open_with_data", data);
    this.dom.addClass('edit_modal');
    this.title.val(data.title);
    this.genre.add_tags(data.genres);
    this.location.hide();
    this.description.hide();
    this.open();
    return false;
  };

  RoomModal.prototype.destroy = function() {
    this.title.off('keyup', this._on_title_changed);
    this.location.off('keyup', this._on_location_changed);
    this.description.off('keyup', this._on_description_changed);
    this.genre.off('change', this._on_genre_changed);
    this.submit.off('click', this._submit);
    this.genre = null;
    return RoomModal.__super__.destroy.call(this);
  };

  return RoomModal;

})(Modal);

}, {"../components/modal":"src/frontend/scripts/views/components/modal"});
require.register('src/frontend/templates/buttons/share', function(require, module, exports){
module.exports = function anonymous(locals
/**/) {
jade.debug = [{ lineno: 1, filename: "/Volumes/backpack/git/loopcast/killer/src/frontend/templates/buttons/share.jade" }];
try {
var buf = [];
var locals_ = (locals || {}),link = locals_.link;jade.debug.unshift({ lineno: 1, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 1, filename: jade.debug[0].filename });
buf.push("<div class=\"share_box\">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 2, filename: jade.debug[0].filename });
buf.push("<h4>");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 2, filename: jade.debug[0].filename });
buf.push("Share");
jade.debug.shift();
jade.debug.shift();
buf.push("</h4>");
jade.debug.shift();
jade.debug.unshift({ lineno: 3, filename: jade.debug[0].filename });
buf.push("<div class=\"share_row\">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 4, filename: jade.debug[0].filename });
buf.push("<input" + (jade.attrs({ 'type':("text"), 'value':("" + (link) + ""), "class": [('link_input')] }, {"type":true,"value":true})) + "/>");
jade.debug.shift();
jade.debug.unshift({ lineno: 5, filename: jade.debug[0].filename });
buf.push("<a href=\"#\" title=\"Copy\" class=\"button yellow_button small_button_2\">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 5, filename: jade.debug[0].filename });
buf.push("Copy");
jade.debug.shift();
jade.debug.shift();
buf.push("</a>");
jade.debug.shift();
jade.debug.shift();
buf.push("</div>");
jade.debug.shift();
jade.debug.unshift({ lineno: 7, filename: jade.debug[0].filename });
buf.push("<div class=\"socials\">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 8, filename: jade.debug[0].filename });
buf.push("<a href=\"#\" title=\"Share on Facebook\" class=\"spritesheet share_popup_facebook\">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 8, filename: jade.debug[0].filename });
buf.push("Share on Facebook");
jade.debug.shift();
jade.debug.shift();
buf.push("</a>");
jade.debug.shift();
jade.debug.unshift({ lineno: 9, filename: jade.debug[0].filename });
buf.push("<a href=\"#\" title=\"Share on Twitter\" class=\"spritesheet share_popup_twitter\">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 9, filename: jade.debug[0].filename });
buf.push("Share on Twitter");
jade.debug.shift();
jade.debug.shift();
buf.push("</a>");
jade.debug.shift();
jade.debug.unshift({ lineno: 10, filename: jade.debug[0].filename });
buf.push("<a href=\"#\" title=\"Share on Google Plus\" class=\"spritesheet share_popup_google\">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 10, filename: jade.debug[0].filename });
buf.push("Share on Google Plus");
jade.debug.shift();
jade.debug.shift();
buf.push("</a>");
jade.debug.shift();
jade.debug.shift();
buf.push("</div>");
jade.debug.shift();
jade.debug.shift();
buf.push("</div>");
jade.debug.shift();
jade.debug.shift();;return buf.join("");
} catch (err) {
  jade.rethrow(err, jade.debug[0].filename, jade.debug[0].lineno,".share_box\n  h4 Share\n  .share_row\n    input.link_input(type=\"text\",  value=\"#{link}\")\n    a.button.yellow_button.small_button_2(href=\"#\", title=\"Copy\") Copy\n\n  .socials\n    a.spritesheet.share_popup_facebook(href=\"#\", title=\"Share on Facebook\") Share on Facebook\n    a.spritesheet.share_popup_twitter(href=\"#\", title=\"Share on Twitter\") Share on Twitter\n    a.spritesheet.share_popup_google(href=\"#\", title=\"Share on Google Plus\") Share on Google Plus");
}
}
}, {});
require.register('src/frontend/templates/components/editables/editable_profile_tags', function(require, module, exports){
module.exports = function anonymous(locals
/**/) {
jade.debug = [{ lineno: 1, filename: "/Volumes/backpack/git/loopcast/killer/src/frontend/templates/components/editables/editable_profile_tags.jade" }];
try {
var buf = [];
jade.debug.unshift({ lineno: 1, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 1, filename: jade.debug[0].filename });
buf.push("<span class=\"icon ss-write element_on_write_mode\">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.shift();
buf.push("</span>");
jade.debug.shift();
jade.debug.unshift({ lineno: 2, filename: jade.debug[0].filename });
buf.push("<div data-view=\"components/editables/editable_tags\" class=\"tags_wrapper\">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 3, filename: jade.debug[0].filename });
buf.push("<textarea id=\"genre_input\" rows=\"1\" style=\"width:310px\">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.shift();
buf.push("</textarea>");
jade.debug.shift();
jade.debug.shift();
buf.push("</div>");
jade.debug.shift();
jade.debug.shift();;return buf.join("");
} catch (err) {
  jade.rethrow(err, jade.debug[0].filename, jade.debug[0].lineno,"span.icon.ss-write.element_on_write_mode\n.tags_wrapper(data-view=\"components/editables/editable_tags\")\n  textarea( id=\"genre_input\", rows=\"1\", style=\"width:310px\")");
}
}
}, {});
require.register('src/frontend/templates/components/editables/editable_select', function(require, module, exports){
module.exports = function anonymous(locals
/**/) {
jade.debug = [{ lineno: 1, filename: "/Volumes/backpack/git/loopcast/killer/src/frontend/templates/components/editables/editable_select.jade" }];
try {
var buf = [];
var locals_ = (locals || {}),values = locals_.values;jade.debug.unshift({ lineno: 1, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 1, filename: jade.debug[0].filename });
buf.push("<span class=\"icon ss-write element_on_write_mode\">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.shift();
buf.push("</span>");
jade.debug.shift();
jade.debug.unshift({ lineno: 2, filename: jade.debug[0].filename });
buf.push("<select class=\"editable_input element_on_write_mode\">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 3, filename: jade.debug[0].filename });
buf.push("<option value=\"\" class=\"default_value\">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.shift();
buf.push("</option>");
jade.debug.shift();
jade.debug.unshift({ lineno: 4, filename: jade.debug[0].filename });
// iterate values
;(function(){
  var $$obj = values;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var val = $$obj[$index];

jade.debug.unshift({ lineno: 4, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 5, filename: jade.debug[0].filename });
buf.push("<option" + (jade.attrs({ 'value':("" + (val) + "") }, {"value":true})) + ">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 5, filename: jade.debug[0].filename });
buf.push("" + (jade.escape((jade.interp = val) == null ? '' : jade.interp)) + "");
jade.debug.shift();
jade.debug.shift();
buf.push("</option>");
jade.debug.shift();
jade.debug.shift();
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var val = $$obj[$index];

jade.debug.unshift({ lineno: 4, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 5, filename: jade.debug[0].filename });
buf.push("<option" + (jade.attrs({ 'value':("" + (val) + "") }, {"value":true})) + ">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 5, filename: jade.debug[0].filename });
buf.push("" + (jade.escape((jade.interp = val) == null ? '' : jade.interp)) + "");
jade.debug.shift();
jade.debug.shift();
buf.push("</option>");
jade.debug.shift();
jade.debug.shift();
    }

  }
}).call(this);

jade.debug.shift();
jade.debug.shift();
buf.push("</select>");
jade.debug.shift();
jade.debug.shift();;return buf.join("");
} catch (err) {
  jade.rethrow(err, jade.debug[0].filename, jade.debug[0].lineno,"span.icon.ss-write.element_on_write_mode\nselect.editable_input.element_on_write_mode\n  option.default_value(value=\"\")\n  each val in values\n    option(value=\"#{val}\") #{val}");
}
}
}, {});
require.register('src/frontend/templates/components/editables/editable_text', function(require, module, exports){
module.exports = function anonymous(locals
/**/) {
jade.debug = [{ lineno: 1, filename: "/Volumes/backpack/git/loopcast/killer/src/frontend/templates/components/editables/editable_text.jade" }];
try {
var buf = [];
jade.debug.unshift({ lineno: 1, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 1, filename: jade.debug[0].filename });
buf.push("<span class=\"icon ss-write element_on_write_mode\">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.shift();
buf.push("</span>");
jade.debug.shift();
jade.debug.unshift({ lineno: 2, filename: jade.debug[0].filename });
buf.push("<input type=\"text\" class=\"editable_input\"/>");
jade.debug.shift();
jade.debug.shift();;return buf.join("");
} catch (err) {
  jade.rethrow(err, jade.debug[0].filename, jade.debug[0].lineno,"span.icon.ss-write.element_on_write_mode\ninput.editable_input(type=\"text\")");
}
}
}, {});
require.register('src/frontend/templates/components/editables/social_link_read_mode', function(require, module, exports){
module.exports = function anonymous(locals
/**/) {
jade.debug = [{ lineno: 1, filename: "/Volumes/backpack/git/loopcast/killer/src/frontend/templates/components/editables/social_link_read_mode.jade" }];
try {
var buf = [];
var locals_ = (locals || {}),value = locals_.value,title = locals_.title,social = locals_.social;jade.debug.unshift({ lineno: 1, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 1, filename: jade.debug[0].filename });
buf.push("<a" + (jade.attrs({ 'href':("" + (value) + ""), 'title':("" + (title) + ""), 'target':("_blank"), "class": [("" + (social) + "_link")] }, {"class":true,"href":true,"title":true,"target":true})) + ">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 2, filename: jade.debug[0].filename });
buf.push("<div" + (jade.attrs({ "class": [('spritesheet'),("profile_" + (social) + "")] }, {"class":true})) + ">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.shift();
buf.push("</div>");
jade.debug.shift();
jade.debug.shift();
buf.push("</a>");
jade.debug.shift();
jade.debug.shift();;return buf.join("");
} catch (err) {
  jade.rethrow(err, jade.debug[0].filename, jade.debug[0].lineno,"a(class=\"#{social}_link\", href=\"#{value}\" title=\"#{title}\", target=\"_blank\")\n  .spritesheet(class=\"profile_#{social}\")");
}
}
}, {});
require.register('src/frontend/templates/components/editables/social_links', function(require, module, exports){
module.exports = function anonymous(locals
/**/) {
jade.debug = [{ lineno: 1, filename: "/Volumes/backpack/git/loopcast/killer/src/frontend/templates/components/editables/social_links.jade" }];
try {
var buf = [];
var locals_ = (locals || {}),links = locals_.links;jade.debug.unshift({ lineno: 1, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 2, filename: jade.debug[0].filename });
jade.debug.shift();
jade.debug.unshift({ lineno: 3, filename: jade.debug[0].filename });
jade.debug.shift();
jade.debug.unshift({ lineno: 4, filename: jade.debug[0].filename });
jade.debug.shift();
jade.debug.unshift({ lineno: 5, filename: jade.debug[0].filename });
jade.debug.shift();
jade.debug.unshift({ lineno: 6, filename: jade.debug[0].filename });
jade.debug.shift();
jade.debug.unshift({ lineno: 7, filename: jade.debug[0].filename });
jade.debug.shift();
jade.debug.unshift({ lineno: 7, filename: jade.debug[0].filename });
if ( links.length > 0)
{
jade.debug.unshift({ lineno: 8, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 8, filename: jade.debug[0].filename });
// iterate links
;(function(){
  var $$obj = links;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var item = $$obj[$index];

jade.debug.unshift({ lineno: 8, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 9, filename: jade.debug[0].filename });
buf.push("<input" + (jade.attrs({ 'placeholder':("http://"), 'type':("text"), 'value':("" + (item.value) + ""), "class": [('squared_input')] }, {"placeholder":true,"type":true,"value":true})) + "/>");
jade.debug.shift();
jade.debug.shift();
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var item = $$obj[$index];

jade.debug.unshift({ lineno: 8, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 9, filename: jade.debug[0].filename });
buf.push("<input" + (jade.attrs({ 'placeholder':("http://"), 'type':("text"), 'value':("" + (item.value) + ""), "class": [('squared_input')] }, {"placeholder":true,"type":true,"value":true})) + "/>");
jade.debug.shift();
jade.debug.shift();
    }

  }
}).call(this);

jade.debug.shift();
jade.debug.shift();
}
else
{
jade.debug.unshift({ lineno: 11, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 11, filename: jade.debug[0].filename });
buf.push("<input placeholder=\"http://\" type=\"text\" class=\"squared_input\"/>");
jade.debug.shift();
jade.debug.shift();
}
jade.debug.shift();
jade.debug.unshift({ lineno: 12, filename: jade.debug[0].filename });
buf.push("<a href=\"#\" class=\"button white_button small_button_4 add_new_link\">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 12, filename: jade.debug[0].filename });
buf.push("Add new link");
jade.debug.shift();
jade.debug.shift();
buf.push("</a>");
jade.debug.shift();
jade.debug.shift();;return buf.join("");
} catch (err) {
  jade.rethrow(err, jade.debug[0].filename, jade.debug[0].lineno,"//- a.spotify_link(href=\"#\" title=\"Spotify\", target=\"_blank\")\n//-   .spritesheet.profile_spotify\n//- a.soundcloud_link(href=\"#\" title=\"Soundcloud\", target=\"_blank\")\n//-   .spritesheet.profile_soundcloud\n//- a.facebook_link(href=\"#\" title=\"Facebook\", target=\"_blank\")\n//-   .spritesheet.profile_facebook\nif links.length > 0\n  for item in links\n    input.squared_input(placeholder=\"http://\", type=\"text\", value=\"#{item.value}\")\nelse\n  input.squared_input(placeholder=\"http://\", type=\"text\")\na.button.white_button.small_button_4.add_new_link(href=\"#\") Add new link");
}
}
}, {});
require.register('src/frontend/templates/debug/gui', function(require, module, exports){
module.exports = function anonymous(locals
/**/) {
jade.debug = [{ lineno: 1, filename: "/Volumes/backpack/git/loopcast/killer/src/frontend/templates/debug/gui.jade" }];
try {
var buf = [];
jade.debug.unshift({ lineno: 1, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 1, filename: jade.debug[0].filename });
buf.push("<div id=\"gui\" class=\"closed\">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 2, filename: jade.debug[0].filename });
buf.push("<span class=\"icon\">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 2, filename: jade.debug[0].filename });
buf.push("D");
jade.debug.shift();
jade.debug.shift();
buf.push("</span>");
jade.debug.shift();
jade.debug.unshift({ lineno: 4, filename: jade.debug[0].filename });
buf.push("<pre class=\"content\">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.shift();
buf.push("</pre>");
jade.debug.shift();
jade.debug.shift();
buf.push("</div>");
jade.debug.shift();
jade.debug.shift();;return buf.join("");
} catch (err) {
  jade.rethrow(err, jade.debug[0].filename, jade.debug[0].lineno,"#gui.closed\n  span.icon D\n\n  pre.content");
}
}
}, {});
require.register('src/frontend/templates/shared/header_user_logged', function(require, module, exports){
module.exports = function anonymous(locals
/**/) {
jade.debug = [{ lineno: 1, filename: "/Volumes/backpack/git/loopcast/killer/src/frontend/templates/shared/header_user_logged.jade" }];
try {
var buf = [];
var locals_ = (locals || {}),images = locals_.images,username = locals_.username;jade.debug.unshift({ lineno: 1, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 1, filename: jade.debug[0].filename });
buf.push("<div data-view=\"components/click_trigger\" data-target=\".user_dropdown\" class=\"thumb_wrapper\">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 2, filename: jade.debug[0].filename });
if ( images)
{
jade.debug.unshift({ lineno: 3, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 3, filename: jade.debug[0].filename });
buf.push("<img" + (jade.attrs({ 'src':("" + (images.top_bar) + ""), "class": [('top_bar_icon')] }, {"src":true})) + "/>");
jade.debug.shift();
jade.debug.shift();
}
jade.debug.shift();
jade.debug.unshift({ lineno: 4, filename: jade.debug[0].filename });
buf.push("<span class=\"icon ss-dropdown\">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.shift();
buf.push("</span>");
jade.debug.shift();
jade.debug.unshift({ lineno: 7, filename: jade.debug[0].filename });
jade.debug.shift();
jade.debug.unshift({ lineno: 7, filename: jade.debug[0].filename });
buf.push("<ul class=\"user_dropdown hover_dropdown\">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 9, filename: jade.debug[0].filename });
buf.push("<li>");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 9, filename: jade.debug[0].filename });
buf.push("<a" + (jade.attrs({ 'href':("/" + (username) + ""), 'title':("My Profile") }, {"href":true,"title":true})) + ">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 9, filename: jade.debug[0].filename });
buf.push("My Profile");
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
buf.push("<a href=\"#\" title=\"Feedback\">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 11, filename: jade.debug[0].filename });
buf.push("Feedback");
jade.debug.shift();
jade.debug.shift();
buf.push("</a>");
jade.debug.shift();
jade.debug.shift();
buf.push("</li>");
jade.debug.shift();
jade.debug.unshift({ lineno: 13, filename: jade.debug[0].filename });
buf.push("<li>");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 13, filename: jade.debug[0].filename });
buf.push("<a href=\"#\" title=\"Logout\" data-view=\"components/logout_link\" class=\"logout\">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 13, filename: jade.debug[0].filename });
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
jade.debug.unshift({ lineno: 17, filename: jade.debug[0].filename });
buf.push("<a href=\"#\" title=\"Messages\">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 18, filename: jade.debug[0].filename });
buf.push("<span class=\"icon ss-mail\">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 18, filename: jade.debug[0].filename });
buf.push("&nbsp;");
jade.debug.shift();
jade.debug.shift();
buf.push("</span>");
jade.debug.shift();
jade.debug.unshift({ lineno: 19, filename: jade.debug[0].filename });
jade.debug.shift();
jade.debug.shift();
buf.push("</a>");
jade.debug.shift();
jade.debug.shift();;return buf.join("");
} catch (err) {
  jade.rethrow(err, jade.debug[0].filename, jade.debug[0].lineno,".thumb_wrapper(data-view=\"components/click_trigger\" data-target=\".user_dropdown\")\n\tif images\n\t\timg.top_bar_icon(src=\"#{images.top_bar}\")\n\tspan.icon.ss-dropdown\n\t//- span.spritesheet.small_arrow_white\n\n\tul.user_dropdown.hover_dropdown\n\t\tli\n\t\t\ta(href=\"/#{username}\" title=\"My Profile\") My Profile\n\t\tli\n\t\t\ta(href=\"#\" title=\"Feedback\") Feedback\n\t\tli\n\t\t\ta.logout(href=\"#\" title=\"Logout\", data-view=\"components/logout_link\") Logout\n\n\n\na(href=\"#\", title=\"Messages\")\n\tspan.icon.ss-mail &nbsp;\n\t//- span.spritesheet.messages_icon");
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
require.register('src/frontend/vendors/jquery.autocomplete.min', function(require, module, exports){
/*
 * jQuery Autocomplete plugin 1.1
 *
 * Copyright (c) 2009 Jörn Zaefferer
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Revision: $Id: jquery.autocomplete.js 15 2009-08-22 10:30:27Z joern.zaefferer $
 */;(function($){
  var isOpera = false;
  var isMSIE = false;
  $.fn.extend({autocomplete:function(urlOrData,options){var isUrl=typeof urlOrData=="string";options=$.extend({},$.Autocompleter.defaults,{url:isUrl?urlOrData:null,data:isUrl?null:urlOrData,delay:isUrl?$.Autocompleter.defaults.delay:10,max:options&&!options.scroll?10:150},options);options.highlight=options.highlight||function(value){return value;};options.formatMatch=options.formatMatch||options.formatItem;return this.each(function(){new $.Autocompleter(this,options);});},result:function(handler){return this.bind("result",handler);},search:function(handler){return this.trigger("search",[handler]);},flushCache:function(){return this.trigger("flushCache");},setOptions:function(options){return this.trigger("setOptions",[options]);},unautocomplete:function(){return this.trigger("unautocomplete");}});$.Autocompleter=function(input,options){var KEY={UP:38,DOWN:40,DEL:46,TAB:9,RETURN:13,ESC:27,COMMA:188,PAGEUP:33,PAGEDOWN:34,BACKSPACE:8};var $input=$(input).attr("autocomplete","off").addClass(options.inputClass);var timeout;var previousValue="";var cache=$.Autocompleter.Cache(options);var hasFocus=0;var lastKeyPressCode;var config={mouseDownOnSelect:false};var select=$.Autocompleter.Select(options,input,selectCurrent,config);var blockSubmit;isOpera&&$(input.form).bind("submit.autocomplete",function(){if(blockSubmit){blockSubmit=false;return false;}});$input.bind((isOpera?"keypress":"keydown")+".autocomplete",function(event){hasFocus=1;lastKeyPressCode=event.keyCode;switch(event.keyCode){case KEY.UP:event.preventDefault();if(select.visible()){select.prev();}else{onChange(0,true);}break;case KEY.DOWN:event.preventDefault();if(select.visible()){select.next();}else{onChange(0,true);}break;case KEY.PAGEUP:event.preventDefault();if(select.visible()){select.pageUp();}else{onChange(0,true);}break;case KEY.PAGEDOWN:event.preventDefault();if(select.visible()){select.pageDown();}else{onChange(0,true);}break;case options.multiple&&$.trim(options.multipleSeparator)==","&&KEY.COMMA:case KEY.TAB:case KEY.RETURN:if(selectCurrent()){event.preventDefault();blockSubmit=true;return false;}break;case KEY.ESC:select.hide();break;default:clearTimeout(timeout);timeout=setTimeout(onChange,options.delay);break;}}).focus(function(){hasFocus++;}).blur(function(){hasFocus=0;if(!config.mouseDownOnSelect){hideResults();}}).click(function(){if(hasFocus++>1&&!select.visible()){onChange(0,true);}}).bind("search",function(){var fn=(arguments.length>1)?arguments[1]:null;function findValueCallback(q,data){var result;if(data&&data.length){for(var i=0;i<data.length;i++){if(data[i].result.toLowerCase()==q.toLowerCase()){result=data[i];break;}}}if(typeof fn=="function")fn(result);else $input.trigger("result",result&&[result.data,result.value]);}$.each(trimWords($input.val()),function(i,value){request(value,findValueCallback,findValueCallback);});}).bind("flushCache",function(){cache.flush();}).bind("setOptions",function(){$.extend(options,arguments[1]);if("data"in arguments[1])cache.populate();}).bind("unautocomplete",function(){select.unbind();$input.unbind();$(input.form).unbind(".autocomplete");});function selectCurrent(){var selected=select.selected();if(!selected)return false;var v=selected.result;previousValue=v;if(options.multiple){var words=trimWords($input.val());if(words.length>1){var seperator=options.multipleSeparator.length;var cursorAt=$(input).selection().start;var wordAt,progress=0;$.each(words,function(i,word){progress+=word.length;if(cursorAt<=progress){wordAt=i;return false;}progress+=seperator;});words[wordAt]=v;v=words.join(options.multipleSeparator);}v+=options.multipleSeparator;}$input.val(v);hideResultsNow();$input.trigger("result",[selected.data,selected.value]);return true;}function onChange(crap,skipPrevCheck){if(lastKeyPressCode==KEY.DEL){select.hide();return;}var currentValue=$input.val();if(!skipPrevCheck&&currentValue==previousValue)return;previousValue=currentValue;currentValue=lastWord(currentValue);if(currentValue.length>=options.minChars){$input.addClass(options.loadingClass);if(!options.matchCase)currentValue=currentValue.toLowerCase();request(currentValue,receiveData,hideResultsNow);}else{stopLoading();select.hide();}};function trimWords(value){if(!value)return[""];if(!options.multiple)return[$.trim(value)];return $.map(value.split(options.multipleSeparator),function(word){return $.trim(value).length?$.trim(word):null;});}function lastWord(value){if(!options.multiple)return value;var words=trimWords(value);if(words.length==1)return words[0];var cursorAt=$(input).selection().start;if(cursorAt==value.length){words=trimWords(value)}else{words=trimWords(value.replace(value.substring(cursorAt),""));}return words[words.length-1];}function autoFill(q,sValue){if(options.autoFill&&(lastWord($input.val()).toLowerCase()==q.toLowerCase())&&lastKeyPressCode!=KEY.BACKSPACE){$input.val($input.val()+sValue.substring(lastWord(previousValue).length));$(input).selection(previousValue.length,previousValue.length+sValue.length);}};function hideResults(){clearTimeout(timeout);timeout=setTimeout(hideResultsNow,200);};function hideResultsNow(){var wasVisible=select.visible();select.hide();clearTimeout(timeout);stopLoading();if(options.mustMatch){$input.search(function(result){if(!result){if(options.multiple){var words=trimWords($input.val()).slice(0,-1);$input.val(words.join(options.multipleSeparator)+(words.length?options.multipleSeparator:""));}else{$input.val("");$input.trigger("result",null);}}});}};function receiveData(q,data){if(data&&data.length&&hasFocus){stopLoading();select.display(data,q);autoFill(q,data[0].value);select.show();}else{hideResultsNow();}};function request(term,success,failure){if(!options.matchCase)term=term.toLowerCase();var data=cache.load(term);if(data&&data.length){success(term,data);}else if((typeof options.url=="string")&&(options.url.length>0)){var extraParams={timestamp:+new Date()};$.each(options.extraParams,function(key,param){extraParams[key]=typeof param=="function"?param():param;});$.ajax({mode:"abort",port:"autocomplete"+input.name,dataType:options.dataType,url:options.url,data:$.extend({q:lastWord(term),limit:options.max},extraParams),success:function(data){var parsed=options.parse&&options.parse(data)||parse(data);cache.add(term,parsed);success(term,parsed);}});}else{select.emptyList();failure(term);}};function parse(data){var parsed=[];var rows=data.split("\n");for(var i=0;i<rows.length;i++){var row=$.trim(rows[i]);if(row){row=row.split("|");parsed[parsed.length]={data:row,value:row[0],result:options.formatResult&&options.formatResult(row,row[0])||row[0]};}}return parsed;};function stopLoading(){$input.removeClass(options.loadingClass);};};$.Autocompleter.defaults={inputClass:"ac_input",resultsClass:"ac_results",loadingClass:"ac_loading",minChars:1,delay:400,matchCase:false,matchSubset:true,matchContains:false,cacheLength:10,max:100,mustMatch:false,extraParams:{},selectFirst:true,formatItem:function(row){return row[0];},formatMatch:null,autoFill:false,width:0,multiple:false,multipleSeparator:", ",highlight:function(value,term){return value.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)("+term.replace(/([\^\$\(\)\[\]\{\}\*\.\+\?\|\\])/gi,"\\$1")+")(?![^<>]*>)(?![^&;]+;)","gi"),"<strong>$1</strong>");},scroll:true,scrollHeight:180};$.Autocompleter.Cache=function(options){var data={};var length=0;function matchSubset(s,sub){if(!options.matchCase)s=s.toLowerCase();var i=s.indexOf(sub);if(options.matchContains=="word"){i=s.toLowerCase().search("\\b"+sub.toLowerCase());}if(i==-1)return false;return i==0||options.matchContains;};function add(q,value){if(length>options.cacheLength){flush();}if(!data[q]){length++;}data[q]=value;}function populate(){if(!options.data)return false;var stMatchSets={},nullData=0;if(!options.url)options.cacheLength=1;stMatchSets[""]=[];for(var i=0,ol=options.data.length;i<ol;i++){var rawValue=options.data[i];rawValue=(typeof rawValue=="string")?[rawValue]:rawValue;var value=options.formatMatch(rawValue,i+1,options.data.length);if(value===false)continue;var firstChar=value.charAt(0).toLowerCase();if(!stMatchSets[firstChar])stMatchSets[firstChar]=[];var row={value:value,data:rawValue,result:options.formatResult&&options.formatResult(rawValue)||value};stMatchSets[firstChar].push(row);if(nullData++<options.max){stMatchSets[""].push(row);}};$.each(stMatchSets,function(i,value){options.cacheLength++;add(i,value);});}setTimeout(populate,25);function flush(){data={};length=0;}return{flush:flush,add:add,populate:populate,load:function(q){if(!options.cacheLength||!length)return null;if(!options.url&&options.matchContains){var csub=[];for(var k in data){if(k.length>0){var c=data[k];$.each(c,function(i,x){if(matchSubset(x.value,q)){csub.push(x);}});}}return csub;}else
if(data[q]){return data[q];}else
if(options.matchSubset){for(var i=q.length-1;i>=options.minChars;i--){var c=data[q.substr(0,i)];if(c){var csub=[];$.each(c,function(i,x){if(matchSubset(x.value,q)){csub[csub.length]=x;}});return csub;}}}return null;}};};$.Autocompleter.Select=function(options,input,select,config){var CLASSES={ACTIVE:"ac_over"};var listItems,active=-1,data,term="",needsInit=true,element,list;function init(){if(!needsInit)return;element=$("<div/>").hide().addClass(options.resultsClass).css("position","absolute").appendTo(document.body);list=$("<ul/>").appendTo(element).mouseover(function(event){if(target(event).nodeName&&target(event).nodeName.toUpperCase()=='LI'){active=$("li",list).removeClass(CLASSES.ACTIVE).index(target(event));$(target(event)).addClass(CLASSES.ACTIVE);}}).click(function(event){$(target(event)).addClass(CLASSES.ACTIVE);select();input.focus();return false;}).mousedown(function(){config.mouseDownOnSelect=true;}).mouseup(function(){config.mouseDownOnSelect=false;});if(options.width>0)element.css("width",options.width);needsInit=false;}function target(event){var element=event.target;while(element&&element.tagName!="LI")element=element.parentNode;if(!element)return[];return element;}function moveSelect(step){listItems.slice(active,active+1).removeClass(CLASSES.ACTIVE);movePosition(step);var activeItem=listItems.slice(active,active+1).addClass(CLASSES.ACTIVE);if(options.scroll){var offset=0;listItems.slice(0,active).each(function(){offset+=this.offsetHeight;});if((offset+activeItem[0].offsetHeight-list.scrollTop())>list[0].clientHeight){list.scrollTop(offset+activeItem[0].offsetHeight-list.innerHeight());}else if(offset<list.scrollTop()){list.scrollTop(offset);}}};function movePosition(step){active+=step;if(active<0){active=listItems.size()-1;}else if(active>=listItems.size()){active=0;}}function limitNumberOfItems(available){return options.max&&options.max<available?options.max:available;}function fillList(){list.empty();var max=limitNumberOfItems(data.length);for(var i=0;i<max;i++){if(!data[i])continue;var formatted=options.formatItem(data[i].data,i+1,max,data[i].value,term);if(formatted===false)continue;var li=$("<li/>").html(options.highlight(formatted,term)).addClass(i%2==0?"ac_even":"ac_odd").appendTo(list)[0];$.data(li,"ac_data",data[i]);}listItems=list.find("li");if(options.selectFirst){listItems.slice(0,1).addClass(CLASSES.ACTIVE);active=0;}if($.fn.bgiframe)list.bgiframe();}return{display:function(d,q){init();data=d;term=q;fillList();},next:function(){moveSelect(1);},prev:function(){moveSelect(-1);},pageUp:function(){if(active!=0&&active-8<0){moveSelect(-active);}else{moveSelect(-8);}},pageDown:function(){if(active!=listItems.size()-1&&active+8>listItems.size()){moveSelect(listItems.size()-1-active);}else{moveSelect(8);}},hide:function(){element&&element.hide();listItems&&listItems.removeClass(CLASSES.ACTIVE);active=-1;},visible:function(){return element&&element.is(":visible");},current:function(){return this.visible()&&(listItems.filter("."+CLASSES.ACTIVE)[0]||options.selectFirst&&listItems[0]);},show:function(){var offset=$(input).offset();element.css({width:typeof options.width=="string"||options.width>0?options.width:$(input).width(),top:offset.top+input.offsetHeight,left:offset.left}).show();if(options.scroll){list.scrollTop(0);list.css({maxHeight:options.scrollHeight,overflow:'auto'});if(isMSIE&&typeof document.body.style.maxHeight==="undefined"){var listHeight=0;listItems.each(function(){listHeight+=this.offsetHeight;});var scrollbarsVisible=listHeight>options.scrollHeight;list.css('height',scrollbarsVisible?options.scrollHeight:listHeight);if(!scrollbarsVisible){listItems.width(list.width()-parseInt(listItems.css("padding-left"))-parseInt(listItems.css("padding-right")));}}}},selected:function(){var selected=listItems&&listItems.filter("."+CLASSES.ACTIVE).removeClass(CLASSES.ACTIVE);return selected&&selected.length&&$.data(selected[0],"ac_data");},emptyList:function(){list&&list.empty();},unbind:function(){element&&element.remove();}};};$.fn.selection=function(start,end){if(start!==undefined){return this.each(function(){if(this.createTextRange){var selRange=this.createTextRange();if(end===undefined||start==end){selRange.move("character",start);selRange.select();}else{selRange.collapse(true);selRange.moveStart("character",start);selRange.moveEnd("character",end);selRange.select();}}else if(this.setSelectionRange){this.setSelectionRange(start,end);}else if(this.selectionStart){this.selectionStart=start;this.selectionEnd=end;}});}var field=this[0];if(field.createTextRange){var range=document.selection.createRange(),orig=field.value,teststring="<->",textLength=range.text.length;range.text=teststring;var caretAt=field.value.indexOf(teststring);field.value=orig;this.selection(caretAt,caretAt+textLength);return{start:caretAt,end:caretAt+textLength}}else if(field.selectionStart!==undefined){return{start:field.selectionStart,end:field.selectionEnd}}};})(jQuery);
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
require.register('src/frontend/vendors/jquery.tagsinput', function(require, module, exports){
/*

	jQuery Tags Input Plugin 1.3.3
	
	Copyright (c) 2011 XOXCO, Inc
	
	Documentation for this plugin lives here:
	http://xoxco.com/clickable/jquery-tags-input
	
	Licensed under the MIT license:
	http://www.opensource.org/licenses/mit-license.php

	ben@xoxco.com

*/

(function($) {

	var delimiter = new Array();
	var tags_callbacks = new Array();
	$.fn.doAutosize = function(o){
	    var minWidth = $(this).data('minwidth'),
	        maxWidth = $(this).data('maxwidth'),
	        val = '',
	        input = $(this),
	        testSubject = $('#'+$(this).data('tester_id'));
	
	    if (val === (val = input.val())) {return;}
	
	    // Enter new content into testSubject
	    var escaped = val.replace(/&/g, '&amp;').replace(/\s/g,' ').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	    testSubject.html(escaped);
	    // Calculate new width + whether to change
	    var testerWidth = testSubject.width(),
	        newWidth = (testerWidth + o.comfortZone) >= minWidth ? testerWidth + o.comfortZone : minWidth,
	        currentWidth = input.width(),
	        isValidWidthChange = (newWidth < currentWidth && newWidth >= minWidth)
	                             || (newWidth > minWidth && newWidth < maxWidth);
	
	    // Animate width
	    if (isValidWidthChange) {
	        input.width(newWidth);
	    }


  };
  $.fn.resetAutosize = function(options){
    // alert(JSON.stringify(options));
    var minWidth =  $(this).data('minwidth') || options.minInputWidth || $(this).width(),
        maxWidth = $(this).data('maxwidth') || options.maxInputWidth || ($(this).closest('.tagsinput').width() - options.inputPadding),
        val = '',
        input = $(this),
        testSubject = $('<tester/>').css({
            position: 'absolute',
            top: -9999,
            left: -9999,
            width: 'auto',
            fontSize: input.css('fontSize'),
            fontFamily: input.css('fontFamily'),
            fontWeight: input.css('fontWeight'),
            letterSpacing: input.css('letterSpacing'),
            whiteSpace: 'nowrap'
        }),
        testerId = $(this).attr('id')+'_autosize_tester';
    if(! $('#'+testerId).length > 0){
      testSubject.attr('id', testerId);
      testSubject.appendTo('body');
    }

    input.data('minwidth', minWidth);
    input.data('maxwidth', maxWidth);
    input.data('tester_id', testerId);
    input.css('width', minWidth);
  };

  $.fn.destroy_tagsinput = function() { 
  	for( k in tags_callbacks ){
  		if( tags_callbacks[k] != undefined ){
  			
	  		if( tags_callbacks[k].onAddTag != undefined){
	  			tags_callbacks[k].onAddTag = null;
	  		}
	  		if( tags_callbacks[k].onChange != undefined){
	  			tags_callbacks[k].onChange = null;
	  		}
	  		if( tags_callbacks[k].onRemoveTag != undefined){
	  			tags_callbacks[k].onRemoveTag = null;
	  		}
  		}
  		tags_callbacks[k] = null;
  	}
	};
  
	$.fn.addTag = function(value,options) {
			options = jQuery.extend({focus:false,callback:true},options);
			this.each(function() { 
				var id = $(this).attr('id');

				var tagslist = $(this).val().split(delimiter[id]);
				if (tagslist[0] == '') { 
					tagslist = new Array();
				}

				value = jQuery.trim(value);
		
				if (options.unique) {
					var skipTag = $(this).tagExist(value);
					if(skipTag == true) {
					    //Marks fake input as not_valid to let styling it
    				    $('#'+id+'_tag').addClass('not_valid');
    				}
				} else {
					var skipTag = false; 
				}
				
				if (value !='' && skipTag != true) { 
                    $('<span>').addClass('tag').append(
                        $('<span>').text(value).append('&nbsp;&nbsp;'),
                        $('<a>', {
                            href  : '#',
                            title : 'Removing tag',
                            text  : 'x'
                        }).click(function () {
                            return $('#' + id).removeTag(escape(value));
                        })
                    ).insertBefore('#' + id + '_addTag');

					tagslist.push(value);
				
					$('#'+id+'_tag').val('');
					if (options.focus) {
						$('#'+id+'_tag').focus();
					} else {		
						$('#'+id+'_tag').blur();
					}
					
					$.fn.tagsInput.updateTagsField(this,tagslist);
					
					if (options.callback && tags_callbacks[id] && tags_callbacks[id]['onAddTag']) {
						var f = tags_callbacks[id]['onAddTag'];
						f.call(this, value);
					}
					if(tags_callbacks[id] && tags_callbacks[id]['onChange'])
					{
						var i = tagslist.length;
						var f = tags_callbacks[id]['onChange'];
						f.call(this, $(this), tagslist[i-1]);
					}					
				}
		
			});		
			
			return false;
		};
		
	$.fn.removeTag = function(value) { 
			value = unescape(value);
			this.each(function() { 
				var id = $(this).attr('id');
	
				var old = $(this).val().split(delimiter[id]);
					
				$('#'+id+'_tagsinput .tag').remove();
				str = '';
				for (i=0; i< old.length; i++) { 
					if (old[i]!=value) { 
						str = str + delimiter[id] +old[i];
					}
				}
				
				$.fn.tagsInput.importTags(this,str);

				if (tags_callbacks[id] && tags_callbacks[id]['onRemoveTag']) {
					var f = tags_callbacks[id]['onRemoveTag'];
					f.call(this, value);
				}
			});
					
			return false;
		};
	
	$.fn.tagExist = function(val) {
		var id = $(this).attr('id');
		var tagslist = $(this).val().split(delimiter[id]);
		return (jQuery.inArray(val, tagslist) >= 0); //true when tag exists, false when not
	};
	
	// clear all existing tags and import new ones from a string
	$.fn.importTags = function(str) {
                id = $(this).attr('id');
		$('#'+id+'_tagsinput .tag').remove();
		$.fn.tagsInput.importTags(this,str);
	}
		
	$.fn.tagsInput = function(options) { 
    var settings = jQuery.extend({
      interactive:true,
      defaultText:'add a tag',
      minChars:0,
      width:'300px',
      height:'100px',
      autocomplete: {selectFirst: false },
      'hide':true,
      'delimiter':',',
      'unique':true,
      removeWithBackspace:true,
      placeholderColor:'#666666',
      autosize: true,
      comfortZone: 20,
      inputPadding: 6*2
    },options);

		this.each(function() { 
			if (settings.hide) { 
				$(this).hide();				
			}
			var id = $(this).attr('id');
			if (!id || delimiter[$(this).attr('id')]) {
				id = $(this).attr('id', 'tags' + new Date().getTime()).attr('id');
			}
			
			var data = jQuery.extend({
				pid:id,
				real_input: '#'+id,
				holder: '#'+id+'_tagsinput',
				input_wrapper: '#'+id+'_addTag',
				fake_input: '#'+id+'_tag'
			},settings);
	
			delimiter[id] = data.delimiter;
			
			if (settings.onAddTag || settings.onRemoveTag || settings.onChange) {
				tags_callbacks[id] = new Array();
				tags_callbacks[id]['onAddTag'] = settings.onAddTag;
				tags_callbacks[id]['onRemoveTag'] = settings.onRemoveTag;
				tags_callbacks[id]['onChange'] = settings.onChange;
			}
	
			var markup = '<div id="'+id+'_tagsinput" class="tagsinput"><div id="'+id+'_addTag">';
			
			if (settings.interactive) {
				markup = markup + '<input id="'+id+'_tag" value="" data-default="'+settings.defaultText+'" />';
			}
			
			markup = markup + '</div><div class="tags_clear"></div></div>';
			
			$(markup).insertAfter(this);

			$(data.holder).css('width',settings.width);
			$(data.holder).css('min-height',settings.height);
			$(data.holder).css('height',settings.height);
	
			if ($(data.real_input).val()!='') { 
				$.fn.tagsInput.importTags($(data.real_input),$(data.real_input).val());
			}		
			if (settings.interactive) { 
				$(data.fake_input).val($(data.fake_input).attr('data-default'));
				$(data.fake_input).css('color',settings.placeholderColor);
		        $(data.fake_input).resetAutosize(settings);
		
				$(data.holder).bind('click',data,function(event) {
					$(event.data.fake_input).focus();
				});
			
				$(data.fake_input).bind('focus',data,function(event) {
					if ($(event.data.fake_input).val()==$(event.data.fake_input).attr('data-default')) { 
						$(event.data.fake_input).val('');
					}
					$(event.data.fake_input).css('color','#000000');		
				});
						
				if (settings.autocomplete_url != undefined) {
					autocomplete_options = {source: settings.autocomplete_url};
					for (attrname in settings.autocomplete) { 
						autocomplete_options[attrname] = settings.autocomplete[attrname]; 
					}
				
					if (jQuery.Autocompleter !== undefined) {
						$(data.fake_input).autocomplete(settings.autocomplete_url, settings.autocomplete);
						$(data.fake_input).bind('result',data,function(event,data,formatted) {
							if (data) {
								$('#'+id).addTag(data[0] + "",{focus:true,unique:(settings.unique)});
							}
					  	});
					} else if (jQuery.ui.autocomplete !== undefined) {
						$(data.fake_input).autocomplete(autocomplete_options);
						$(data.fake_input).bind('autocompleteselect',data,function(event,ui) {
							$(event.data.real_input).addTag(ui.item.value,{focus:true,unique:(settings.unique)});
							return false;
						});
					}
				
					
				} else {
						// if a user tabs out of the field, create a new tag
						// this is only available if autocomplete is not used.
						$(data.fake_input).bind('blur',data,function(event) { 
							var d = $(this).attr('data-default');
							if ($(event.data.fake_input).val()!='' && $(event.data.fake_input).val()!=d) { 
								if( (event.data.minChars <= $(event.data.fake_input).val().length) && (!event.data.maxChars || (event.data.maxChars >= $(event.data.fake_input).val().length)) )
									$(event.data.real_input).addTag($(event.data.fake_input).val(),{focus:true,unique:(settings.unique)});
							} else {
								$(event.data.fake_input).val($(event.data.fake_input).attr('data-default'));
								$(event.data.fake_input).css('color',settings.placeholderColor);
							}
							return false;
						});
				
				}
				// if user types a comma, create a new tag
				$(data.fake_input).bind('keypress',data,function(event) {
					if (event.which==event.data.delimiter.charCodeAt(0) || event.which==13 ) {
					    event.preventDefault();
						if( (event.data.minChars <= $(event.data.fake_input).val().length) && (!event.data.maxChars || (event.data.maxChars >= $(event.data.fake_input).val().length)) )
							$(event.data.real_input).addTag($(event.data.fake_input).val(),{focus:true,unique:(settings.unique)});
					  	$(event.data.fake_input).resetAutosize(settings);
						return false;
					} else if (event.data.autosize) {
			            $(event.data.fake_input).doAutosize(settings);
            
          			}
				});
				//Delete last tag on backspace
				data.removeWithBackspace && $(data.fake_input).bind('keydown', function(event)
				{
					if(event.keyCode == 8 && $(this).val() == '')
					{
						 event.preventDefault();
						 var last_tag = $(this).closest('.tagsinput').find('.tag:last').text();
						 var id = $(this).attr('id').replace(/_tag$/, '');
						 last_tag = last_tag.replace(/[\s]+x$/, '');
						 $('#' + id).removeTag(escape(last_tag));
						 $(this).trigger('focus');
					}
				});
				$(data.fake_input).blur();
				
				//Removes the not_valid class when user changes the value of the fake input
				if(data.unique) {
				    $(data.fake_input).keydown(function(event){
				        if(event.keyCode == 8 || String.fromCharCode(event.which).match(/\w+|[áéíóúÁÉÍÓÚñÑ,/]+/)) {
				            $(this).removeClass('not_valid');
				        }
				    });
				}
			} // if settings.interactive
		});
			
		return this;
	
	};

	$.fn.tagsInput.updateTagsField = function(obj,tagslist) { 
		var id = $(obj).attr('id');
		$(obj).val(tagslist.join(delimiter[id]));
	};
	
	$.fn.tagsInput.importTags = function(obj,val) {			
		$(obj).val('');
		var id = $(obj).attr('id');
		var tags = val.split(delimiter[id]);
		for (i=0; i<tags.length; i++) { 
			$(obj).addTag(tags[i],{focus:false,callback:false});
		}
		if(tags_callbacks[id] && tags_callbacks[id]['onChange'])
		{
			var f = tags_callbacks[id]['onChange'];
			f.call(obj, obj, tags[i]);
		}
	};

})(jQuery);

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
require.register('src/frontend/vendors/jstorage', function(require, module, exports){
/*
 * ----------------------------- JSTORAGE -------------------------------------
 * Simple local storage wrapper to save data on the browser side, supporting
 * all major browsers - IE6+, Firefox2+, Safari4+, Chrome4+ and Opera 10.5+
 *
 * Author: Andris Reinman, andris.reinman@gmail.com
 * Project homepage: www.jstorage.info
 *
 * Licensed under Unlicense:
 *
 * This is free and unencumbered software released into the public domain.
 *
 * Anyone is free to copy, modify, publish, use, compile, sell, or
 * distribute this software, either in source code form or as a compiled
 * binary, for any purpose, commercial or non-commercial, and by any
 * means.
 *
 * In jurisdictions that recognize copyright laws, the author or authors
 * of this software dedicate any and all copyright interest in the
 * software to the public domain. We make this dedication for the benefit
 * of the public at large and to the detriment of our heirs and
 * successors. We intend this dedication to be an overt act of
 * relinquishment in perpetuity of all present and future rights to this
 * software under copyright law.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
 * OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 *
 * For more information, please refer to <http://unlicense.org/>
 */

/* global ActiveXObject: false */
/* jshint browser: true */

(function() {
    'use strict';

    var
    /* jStorage version */
        JSTORAGE_VERSION = '0.4.12',

        /* detect a dollar object or create one if not found */
        $ = window.jQuery || window.$ || (window.$ = {}),

        /* check for a JSON handling support */
        JSON = {
            parse: window.JSON && (window.JSON.parse || window.JSON.decode) ||
                String.prototype.evalJSON && function(str) {
                    return String(str).evalJSON();
            } ||
                $.parseJSON ||
                $.evalJSON,
            stringify: Object.toJSON ||
                window.JSON && (window.JSON.stringify || window.JSON.encode) ||
                $.toJSON
        };

    // Break if no JSON support was found
    if (typeof JSON.parse !== 'function' || typeof JSON.stringify !== 'function') {
        throw new Error('No JSON support found, include //cdnjs.cloudflare.com/ajax/libs/json2/20110223/json2.js to page');
    }

    var
    /* This is the object, that holds the cached values */
        _storage = {
            __jstorage_meta: {
                CRC32: {}
            }
        },

        /* Actual browser storage (localStorage or globalStorage['domain']) */
        _storage_service = {
            jStorage: '{}'
        },

        /* DOM element for older IE versions, holds userData behavior */
        _storage_elm = null,

        /* How much space does the storage take */
        _storage_size = 0,

        /* which backend is currently used */
        _backend = false,

        /* onchange observers */
        _observers = {},

        /* timeout to wait after onchange event */
        _observer_timeout = false,

        /* last update time */
        _observer_update = 0,

        /* pubsub observers */
        _pubsub_observers = {},

        /* skip published items older than current timestamp */
        _pubsub_last = +new Date(),

        /* Next check for TTL */
        _ttl_timeout,

        /**
         * XML encoding and decoding as XML nodes can't be JSON'ized
         * XML nodes are encoded and decoded if the node is the value to be saved
         * but not if it's as a property of another object
         * Eg. -
         *   $.jStorage.set('key', xmlNode);        // IS OK
         *   $.jStorage.set('key', {xml: xmlNode}); // NOT OK
         */
        _XMLService = {

            /**
             * Validates a XML node to be XML
             * based on jQuery.isXML function
             */
            isXML: function(elm) {
                var documentElement = (elm ? elm.ownerDocument || elm : 0).documentElement;
                return documentElement ? documentElement.nodeName !== 'HTML' : false;
            },

            /**
             * Encodes a XML node to string
             * based on http://www.mercurytide.co.uk/news/article/issues-when-working-ajax/
             */
            encode: function(xmlNode) {
                if (!this.isXML(xmlNode)) {
                    return false;
                }
                try { // Mozilla, Webkit, Opera
                    return new XMLSerializer().serializeToString(xmlNode);
                } catch (E1) {
                    try { // IE
                        return xmlNode.xml;
                    } catch (E2) {}
                }
                return false;
            },

            /**
             * Decodes a XML node from string
             * loosely based on http://outwestmedia.com/jquery-plugins/xmldom/
             */
            decode: function(xmlString) {
                var dom_parser = ('DOMParser' in window && (new DOMParser()).parseFromString) ||
                    (window.ActiveXObject && function(_xmlString) {
                        var xml_doc = new ActiveXObject('Microsoft.XMLDOM');
                        xml_doc.async = 'false';
                        xml_doc.loadXML(_xmlString);
                        return xml_doc;
                    }),
                    resultXML;
                if (!dom_parser) {
                    return false;
                }
                resultXML = dom_parser.call('DOMParser' in window && (new DOMParser()) || window, xmlString, 'text/xml');
                return this.isXML(resultXML) ? resultXML : false;
            }
        };


    ////////////////////////// PRIVATE METHODS ////////////////////////

    /**
     * Initialization function. Detects if the browser supports DOM Storage
     * or userData behavior and behaves accordingly.
     */
    function _init() {
        /* Check if browser supports localStorage */
        var localStorageReallyWorks = false;
        if ('localStorage' in window) {
            try {
                window.localStorage.setItem('_tmptest', 'tmpval');
                localStorageReallyWorks = true;
                window.localStorage.removeItem('_tmptest');
            } catch (BogusQuotaExceededErrorOnIos5) {
                // Thanks be to iOS5 Private Browsing mode which throws
                // QUOTA_EXCEEDED_ERRROR DOM Exception 22.
            }
        }

        if (localStorageReallyWorks) {
            try {
                if (window.localStorage) {
                    _storage_service = window.localStorage;
                    _backend = 'localStorage';
                    _observer_update = _storage_service.jStorage_update;
                }
            } catch (E3) { /* Firefox fails when touching localStorage and cookies are disabled */ }
        }
        /* Check if browser supports globalStorage */
        else if ('globalStorage' in window) {
            try {
                if (window.globalStorage) {
                    if (window.location.hostname == 'localhost') {
                        _storage_service = window.globalStorage['localhost.localdomain'];
                    } else {
                        _storage_service = window.globalStorage[window.location.hostname];
                    }
                    _backend = 'globalStorage';
                    _observer_update = _storage_service.jStorage_update;
                }
            } catch (E4) { /* Firefox fails when touching localStorage and cookies are disabled */ }
        }
        /* Check if browser supports userData behavior */
        else {
            _storage_elm = document.createElement('link');
            if (_storage_elm.addBehavior) {

                /* Use a DOM element to act as userData storage */
                _storage_elm.style.behavior = 'url(#default#userData)';

                /* userData element needs to be inserted into the DOM! */
                document.getElementsByTagName('head')[0].appendChild(_storage_elm);

                try {
                    _storage_elm.load('jStorage');
                } catch (E) {
                    // try to reset cache
                    _storage_elm.setAttribute('jStorage', '{}');
                    _storage_elm.save('jStorage');
                    _storage_elm.load('jStorage');
                }

                var data = '{}';
                try {
                    data = _storage_elm.getAttribute('jStorage');
                } catch (E5) {}

                try {
                    _observer_update = _storage_elm.getAttribute('jStorage_update');
                } catch (E6) {}

                _storage_service.jStorage = data;
                _backend = 'userDataBehavior';
            } else {
                _storage_elm = null;
                return;
            }
        }

        // Load data from storage
        _load_storage();

        // remove dead keys
        _handleTTL();

        // start listening for changes
        _setupObserver();

        // initialize publish-subscribe service
        _handlePubSub();

        // handle cached navigation
        if ('addEventListener' in window) {
            window.addEventListener('pageshow', function(event) {
                if (event.persisted) {
                    _storageObserver();
                }
            }, false);
        }
    }

    /**
     * Reload data from storage when needed
     */
    function _reloadData() {
        var data = '{}';

        if (_backend == 'userDataBehavior') {
            _storage_elm.load('jStorage');

            try {
                data = _storage_elm.getAttribute('jStorage');
            } catch (E5) {}

            try {
                _observer_update = _storage_elm.getAttribute('jStorage_update');
            } catch (E6) {}

            _storage_service.jStorage = data;
        }

        _load_storage();

        // remove dead keys
        _handleTTL();

        _handlePubSub();
    }

    /**
     * Sets up a storage change observer
     */
    function _setupObserver() {
        if (_backend == 'localStorage' || _backend == 'globalStorage') {
            if ('addEventListener' in window) {
                window.addEventListener('storage', _storageObserver, false);
            } else {
                document.attachEvent('onstorage', _storageObserver);
            }
        } else if (_backend == 'userDataBehavior') {
            setInterval(_storageObserver, 1000);
        }
    }

    /**
     * Fired on any kind of data change, needs to check if anything has
     * really been changed
     */
    function _storageObserver() {
        var updateTime;
        // cumulate change notifications with timeout
        clearTimeout(_observer_timeout);
        _observer_timeout = setTimeout(function() {

            if (_backend == 'localStorage' || _backend == 'globalStorage') {
                updateTime = _storage_service.jStorage_update;
            } else if (_backend == 'userDataBehavior') {
                _storage_elm.load('jStorage');
                try {
                    updateTime = _storage_elm.getAttribute('jStorage_update');
                } catch (E5) {}
            }

            if (updateTime && updateTime != _observer_update) {
                _observer_update = updateTime;
                _checkUpdatedKeys();
            }

        }, 25);
    }

    /**
     * Reloads the data and checks if any keys are changed
     */
    function _checkUpdatedKeys() {
        var oldCrc32List = JSON.parse(JSON.stringify(_storage.__jstorage_meta.CRC32)),
            newCrc32List;

        _reloadData();
        newCrc32List = JSON.parse(JSON.stringify(_storage.__jstorage_meta.CRC32));

        var key,
            updated = [],
            removed = [];

        for (key in oldCrc32List) {
            if (oldCrc32List.hasOwnProperty(key)) {
                if (!newCrc32List[key]) {
                    removed.push(key);
                    continue;
                }
                if (oldCrc32List[key] != newCrc32List[key] && String(oldCrc32List[key]).substr(0, 2) == '2.') {
                    updated.push(key);
                }
            }
        }

        for (key in newCrc32List) {
            if (newCrc32List.hasOwnProperty(key)) {
                if (!oldCrc32List[key]) {
                    updated.push(key);
                }
            }
        }

        _fireObservers(updated, 'updated');
        _fireObservers(removed, 'deleted');
    }

    /**
     * Fires observers for updated keys
     *
     * @param {Array|String} keys Array of key names or a key
     * @param {String} action What happened with the value (updated, deleted, flushed)
     */
    function _fireObservers(keys, action) {
        keys = [].concat(keys || []);

        var i, j, len, jlen;

        if (action == 'flushed') {
            keys = [];
            for (var key in _observers) {
                if (_observers.hasOwnProperty(key)) {
                    keys.push(key);
                }
            }
            action = 'deleted';
        }
        for (i = 0, len = keys.length; i < len; i++) {
            if (_observers[keys[i]]) {
                for (j = 0, jlen = _observers[keys[i]].length; j < jlen; j++) {
                    _observers[keys[i]][j](keys[i], action);
                }
            }
            if (_observers['*']) {
                for (j = 0, jlen = _observers['*'].length; j < jlen; j++) {
                    _observers['*'][j](keys[i], action);
                }
            }
        }
    }

    /**
     * Publishes key change to listeners
     */
    function _publishChange() {
        var updateTime = (+new Date()).toString();

        if (_backend == 'localStorage' || _backend == 'globalStorage') {
            try {
                _storage_service.jStorage_update = updateTime;
            } catch (E8) {
                // safari private mode has been enabled after the jStorage initialization
                _backend = false;
            }
        } else if (_backend == 'userDataBehavior') {
            _storage_elm.setAttribute('jStorage_update', updateTime);
            _storage_elm.save('jStorage');
        }

        _storageObserver();
    }

    /**
     * Loads the data from the storage based on the supported mechanism
     */
    function _load_storage() {
        /* if jStorage string is retrieved, then decode it */
        if (_storage_service.jStorage) {
            try {
                _storage = JSON.parse(String(_storage_service.jStorage));
            } catch (E6) {
                _storage_service.jStorage = '{}';
            }
        } else {
            _storage_service.jStorage = '{}';
        }
        _storage_size = _storage_service.jStorage ? String(_storage_service.jStorage).length : 0;

        if (!_storage.__jstorage_meta) {
            _storage.__jstorage_meta = {};
        }
        if (!_storage.__jstorage_meta.CRC32) {
            _storage.__jstorage_meta.CRC32 = {};
        }
    }

    /**
     * This functions provides the 'save' mechanism to store the jStorage object
     */
    function _save() {
        _dropOldEvents(); // remove expired events
        try {
            _storage_service.jStorage = JSON.stringify(_storage);
            // If userData is used as the storage engine, additional
            if (_storage_elm) {
                _storage_elm.setAttribute('jStorage', _storage_service.jStorage);
                _storage_elm.save('jStorage');
            }
            _storage_size = _storage_service.jStorage ? String(_storage_service.jStorage).length : 0;
        } catch (E7) { /* probably cache is full, nothing is saved this way*/ }
    }

    /**
     * Function checks if a key is set and is string or numberic
     *
     * @param {String} key Key name
     */
    function _checkKey(key) {
        if (typeof key != 'string' && typeof key != 'number') {
            throw new TypeError('Key name must be string or numeric');
        }
        if (key == '__jstorage_meta') {
            throw new TypeError('Reserved key name');
        }
        return true;
    }

    /**
     * Removes expired keys
     */
    function _handleTTL() {
        var curtime, i, TTL, CRC32, nextExpire = Infinity,
            changed = false,
            deleted = [];

        clearTimeout(_ttl_timeout);

        if (!_storage.__jstorage_meta || typeof _storage.__jstorage_meta.TTL != 'object') {
            // nothing to do here
            return;
        }

        curtime = +new Date();
        TTL = _storage.__jstorage_meta.TTL;

        CRC32 = _storage.__jstorage_meta.CRC32;
        for (i in TTL) {
            if (TTL.hasOwnProperty(i)) {
                if (TTL[i] <= curtime) {
                    delete TTL[i];
                    delete CRC32[i];
                    delete _storage[i];
                    changed = true;
                    deleted.push(i);
                } else if (TTL[i] < nextExpire) {
                    nextExpire = TTL[i];
                }
            }
        }

        // set next check
        if (nextExpire != Infinity) {
            _ttl_timeout = setTimeout(_handleTTL, Math.min(nextExpire - curtime, 0x7FFFFFFF));
        }

        // save changes
        if (changed) {
            _save();
            _publishChange();
            _fireObservers(deleted, 'deleted');
        }
    }

    /**
     * Checks if there's any events on hold to be fired to listeners
     */
    function _handlePubSub() {
        var i, len;
        if (!_storage.__jstorage_meta.PubSub) {
            return;
        }
        var pubelm,
            _pubsubCurrent = _pubsub_last,
            needFired = [];

        for (i = len = _storage.__jstorage_meta.PubSub.length - 1; i >= 0; i--) {
            pubelm = _storage.__jstorage_meta.PubSub[i];
            if (pubelm[0] > _pubsub_last) {
                _pubsubCurrent = pubelm[0];
                needFired.unshift(pubelm);
            }
        }

        for (i = needFired.length - 1; i >= 0; i--) {
            _fireSubscribers(needFired[i][1], needFired[i][2]);
        }

        _pubsub_last = _pubsubCurrent;
    }

    /**
     * Fires all subscriber listeners for a pubsub channel
     *
     * @param {String} channel Channel name
     * @param {Mixed} payload Payload data to deliver
     */
    function _fireSubscribers(channel, payload) {
        if (_pubsub_observers[channel]) {
            for (var i = 0, len = _pubsub_observers[channel].length; i < len; i++) {
                // send immutable data that can't be modified by listeners
                try {
                    _pubsub_observers[channel][i](channel, JSON.parse(JSON.stringify(payload)));
                } catch (E) {}
            }
        }
    }

    /**
     * Remove old events from the publish stream (at least 2sec old)
     */
    function _dropOldEvents() {
        if (!_storage.__jstorage_meta.PubSub) {
            return;
        }

        var retire = +new Date() - 2000;

        for (var i = 0, len = _storage.__jstorage_meta.PubSub.length; i < len; i++) {
            if (_storage.__jstorage_meta.PubSub[i][0] <= retire) {
                // deleteCount is needed for IE6
                _storage.__jstorage_meta.PubSub.splice(i, _storage.__jstorage_meta.PubSub.length - i);
                break;
            }
        }

        if (!_storage.__jstorage_meta.PubSub.length) {
            delete _storage.__jstorage_meta.PubSub;
        }

    }

    /**
     * Publish payload to a channel
     *
     * @param {String} channel Channel name
     * @param {Mixed} payload Payload to send to the subscribers
     */
    function _publish(channel, payload) {
        if (!_storage.__jstorage_meta) {
            _storage.__jstorage_meta = {};
        }
        if (!_storage.__jstorage_meta.PubSub) {
            _storage.__jstorage_meta.PubSub = [];
        }

        _storage.__jstorage_meta.PubSub.unshift([+new Date(), channel, payload]);

        _save();
        _publishChange();
    }


    /**
     * JS Implementation of MurmurHash2
     *
     *  SOURCE: https://github.com/garycourt/murmurhash-js (MIT licensed)
     *
     * @author <a href='mailto:gary.court@gmail.com'>Gary Court</a>
     * @see http://github.com/garycourt/murmurhash-js
     * @author <a href='mailto:aappleby@gmail.com'>Austin Appleby</a>
     * @see http://sites.google.com/site/murmurhash/
     *
     * @param {string} str ASCII only
     * @param {number} seed Positive integer only
     * @return {number} 32-bit positive integer hash
     */

    function murmurhash2_32_gc(str, seed) {
        var
            l = str.length,
            h = seed ^ l,
            i = 0,
            k;

        while (l >= 4) {
            k =
                ((str.charCodeAt(i) & 0xff)) |
                ((str.charCodeAt(++i) & 0xff) << 8) |
                ((str.charCodeAt(++i) & 0xff) << 16) |
                ((str.charCodeAt(++i) & 0xff) << 24);

            k = (((k & 0xffff) * 0x5bd1e995) + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16));
            k ^= k >>> 24;
            k = (((k & 0xffff) * 0x5bd1e995) + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16));

            h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16)) ^ k;

            l -= 4;
            ++i;
        }

        switch (l) {
            case 3:
                h ^= (str.charCodeAt(i + 2) & 0xff) << 16;
                /* falls through */
            case 2:
                h ^= (str.charCodeAt(i + 1) & 0xff) << 8;
                /* falls through */
            case 1:
                h ^= (str.charCodeAt(i) & 0xff);
                h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16));
        }

        h ^= h >>> 13;
        h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16));
        h ^= h >>> 15;

        return h >>> 0;
    }

    ////////////////////////// PUBLIC INTERFACE /////////////////////////

    $.jStorage = {
        /* Version number */
        version: JSTORAGE_VERSION,

        /**
         * Sets a key's value.
         *
         * @param {String} key Key to set. If this value is not set or not
         *              a string an exception is raised.
         * @param {Mixed} value Value to set. This can be any value that is JSON
         *              compatible (Numbers, Strings, Objects etc.).
         * @param {Object} [options] - possible options to use
         * @param {Number} [options.TTL] - optional TTL value, in milliseconds
         * @return {Mixed} the used value
         */
        set: function(key, value, options) {
            _checkKey(key);

            options = options || {};

            // undefined values are deleted automatically
            if (typeof value == 'undefined') {
                this.deleteKey(key);
                return value;
            }

            if (_XMLService.isXML(value)) {
                value = {
                    _is_xml: true,
                    xml: _XMLService.encode(value)
                };
            } else if (typeof value == 'function') {
                return undefined; // functions can't be saved!
            } else if (value && typeof value == 'object') {
                // clone the object before saving to _storage tree
                value = JSON.parse(JSON.stringify(value));
            }

            _storage[key] = value;

            _storage.__jstorage_meta.CRC32[key] = '2.' + murmurhash2_32_gc(JSON.stringify(value), 0x9747b28c);

            this.setTTL(key, options.TTL || 0); // also handles saving and _publishChange

            _fireObservers(key, 'updated');
            return value;
        },

        /**
         * Looks up a key in cache
         *
         * @param {String} key - Key to look up.
         * @param {mixed} def - Default value to return, if key didn't exist.
         * @return {Mixed} the key value, default value or null
         */
        get: function(key, def) {
            _checkKey(key);
            if (key in _storage) {
                if (_storage[key] && typeof _storage[key] == 'object' && _storage[key]._is_xml) {
                    return _XMLService.decode(_storage[key].xml);
                } else {
                    return _storage[key];
                }
            }
            return typeof(def) == 'undefined' ? null : def;
        },

        /**
         * Deletes a key from cache.
         *
         * @param {String} key - Key to delete.
         * @return {Boolean} true if key existed or false if it didn't
         */
        deleteKey: function(key) {
            _checkKey(key);
            if (key in _storage) {
                delete _storage[key];
                // remove from TTL list
                if (typeof _storage.__jstorage_meta.TTL == 'object' &&
                    key in _storage.__jstorage_meta.TTL) {
                    delete _storage.__jstorage_meta.TTL[key];
                }

                delete _storage.__jstorage_meta.CRC32[key];

                _save();
                _publishChange();
                _fireObservers(key, 'deleted');
                return true;
            }
            return false;
        },

        /**
         * Sets a TTL for a key, or remove it if ttl value is 0 or below
         *
         * @param {String} key - key to set the TTL for
         * @param {Number} ttl - TTL timeout in milliseconds
         * @return {Boolean} true if key existed or false if it didn't
         */
        setTTL: function(key, ttl) {
            var curtime = +new Date();
            _checkKey(key);
            ttl = Number(ttl) || 0;
            if (key in _storage) {

                if (!_storage.__jstorage_meta.TTL) {
                    _storage.__jstorage_meta.TTL = {};
                }

                // Set TTL value for the key
                if (ttl > 0) {
                    _storage.__jstorage_meta.TTL[key] = curtime + ttl;
                } else {
                    delete _storage.__jstorage_meta.TTL[key];
                }

                _save();

                _handleTTL();

                _publishChange();
                return true;
            }
            return false;
        },

        /**
         * Gets remaining TTL (in milliseconds) for a key or 0 when no TTL has been set
         *
         * @param {String} key Key to check
         * @return {Number} Remaining TTL in milliseconds
         */
        getTTL: function(key) {
            var curtime = +new Date(),
                ttl;
            _checkKey(key);
            if (key in _storage && _storage.__jstorage_meta.TTL && _storage.__jstorage_meta.TTL[key]) {
                ttl = _storage.__jstorage_meta.TTL[key] - curtime;
                return ttl || 0;
            }
            return 0;
        },

        /**
         * Deletes everything in cache.
         *
         * @return {Boolean} Always true
         */
        flush: function() {
            _storage = {
                __jstorage_meta: {
                    CRC32: {}
                }
            };
            _save();
            _publishChange();
            _fireObservers(null, 'flushed');
            return true;
        },

        /**
         * Returns a read-only copy of _storage
         *
         * @return {Object} Read-only copy of _storage
         */
        storageObj: function() {
            function F() {}
            F.prototype = _storage;
            return new F();
        },

        /**
         * Returns an index of all used keys as an array
         * ['key1', 'key2',..'keyN']
         *
         * @return {Array} Used keys
         */
        index: function() {
            var index = [],
                i;
            for (i in _storage) {
                if (_storage.hasOwnProperty(i) && i != '__jstorage_meta') {
                    index.push(i);
                }
            }
            return index;
        },

        /**
         * How much space in bytes does the storage take?
         *
         * @return {Number} Storage size in chars (not the same as in bytes,
         *                  since some chars may take several bytes)
         */
        storageSize: function() {
            return _storage_size;
        },

        /**
         * Which backend is currently in use?
         *
         * @return {String} Backend name
         */
        currentBackend: function() {
            return _backend;
        },

        /**
         * Test if storage is available
         *
         * @return {Boolean} True if storage can be used
         */
        storageAvailable: function() {
            return !!_backend;
        },

        /**
         * Register change listeners
         *
         * @param {String} key Key name
         * @param {Function} callback Function to run when the key changes
         */
        listenKeyChange: function(key, callback) {
            _checkKey(key);
            if (!_observers[key]) {
                _observers[key] = [];
            }
            _observers[key].push(callback);
        },

        /**
         * Remove change listeners
         *
         * @param {String} key Key name to unregister listeners against
         * @param {Function} [callback] If set, unregister the callback, if not - unregister all
         */
        stopListening: function(key, callback) {
            _checkKey(key);

            if (!_observers[key]) {
                return;
            }

            if (!callback) {
                delete _observers[key];
                return;
            }

            for (var i = _observers[key].length - 1; i >= 0; i--) {
                if (_observers[key][i] == callback) {
                    _observers[key].splice(i, 1);
                }
            }
        },

        /**
         * Subscribe to a Publish/Subscribe event stream
         *
         * @param {String} channel Channel name
         * @param {Function} callback Function to run when the something is published to the channel
         */
        subscribe: function(channel, callback) {
            channel = (channel || '').toString();
            if (!channel) {
                throw new TypeError('Channel not defined');
            }
            if (!_pubsub_observers[channel]) {
                _pubsub_observers[channel] = [];
            }
            _pubsub_observers[channel].push(callback);
        },

        /**
         * Publish data to an event stream
         *
         * @param {String} channel Channel name
         * @param {Mixed} payload Payload to deliver
         */
        publish: function(channel, payload) {
            channel = (channel || '').toString();
            if (!channel) {
                throw new TypeError('Channel not defined');
            }

            _publish(channel, payload);
        },

        /**
         * Reloads the data from browser storage
         */
        reInit: function() {
            _reloadData();
        },

        /**
         * Removes reference from global objects and saves it as jStorage
         *
         * @param {Boolean} option if needed to save object as simple 'jStorage' in windows context
         */
        noConflict: function(saveInGlobal) {
            delete window.$.jStorage;

            if (saveInGlobal) {
                window.jStorage = this;
            }

            return this;
        }
    };

    // Initialize jStorage
    _init();

})();
}, {});
require.register('src/frontend/vendors/modernizr.custom', function(require, module, exports){
/* Modernizr 2.8.3 (Custom Build) | MIT & BSD
 * Build: http://modernizr.com/download/#-backgroundsize-csstransforms-csstransforms3d-video-input-inputtypes-shiv-cssclasses-teststyles-testprop-testallprops-prefixes-domprefixes
 */
;window.Modernizr=function(a,b,c){function A(a){j.cssText=a}function B(a,b){return A(n.join(a+";")+(b||""))}function C(a,b){return typeof a===b}function D(a,b){return!!~(""+a).indexOf(b)}function E(a,b){for(var d in a){var e=a[d];if(!D(e,"-")&&j[e]!==c)return b=="pfx"?e:!0}return!1}function F(a,b,d){for(var e in a){var f=b[a[e]];if(f!==c)return d===!1?a[e]:C(f,"function")?f.bind(d||b):f}return!1}function G(a,b,c){var d=a.charAt(0).toUpperCase()+a.slice(1),e=(a+" "+p.join(d+" ")+d).split(" ");return C(b,"string")||C(b,"undefined")?E(e,b):(e=(a+" "+q.join(d+" ")+d).split(" "),F(e,b,c))}function H(){e.input=function(c){for(var d=0,e=c.length;d<e;d++)t[c[d]]=c[d]in k;return t.list&&(t.list=!!b.createElement("datalist")&&!!a.HTMLDataListElement),t}("autocomplete autofocus list placeholder max min multiple pattern required step".split(" ")),e.inputtypes=function(a){for(var d=0,e,f,h,i=a.length;d<i;d++)k.setAttribute("type",f=a[d]),e=k.type!=="text",e&&(k.value=l,k.style.cssText="position:absolute;visibility:hidden;",/^range$/.test(f)&&k.style.WebkitAppearance!==c?(g.appendChild(k),h=b.defaultView,e=h.getComputedStyle&&h.getComputedStyle(k,null).WebkitAppearance!=="textfield"&&k.offsetHeight!==0,g.removeChild(k)):/^(search|tel)$/.test(f)||(/^(url|email)$/.test(f)?e=k.checkValidity&&k.checkValidity()===!1:e=k.value!=l)),s[a[d]]=!!e;return s}("search tel url email datetime date month week time datetime-local number range color".split(" "))}var d="2.8.3",e={},f=!0,g=b.documentElement,h="modernizr",i=b.createElement(h),j=i.style,k=b.createElement("input"),l=":)",m={}.toString,n=" -webkit- -moz- -o- -ms- ".split(" "),o="Webkit Moz O ms",p=o.split(" "),q=o.toLowerCase().split(" "),r={},s={},t={},u=[],v=u.slice,w,x=function(a,c,d,e){var f,i,j,k,l=b.createElement("div"),m=b.body,n=m||b.createElement("body");if(parseInt(d,10))while(d--)j=b.createElement("div"),j.id=e?e[d]:h+(d+1),l.appendChild(j);return f=["&#173;",'<style id="s',h,'">',a,"</style>"].join(""),l.id=h,(m?l:n).innerHTML+=f,n.appendChild(l),m||(n.style.background="",n.style.overflow="hidden",k=g.style.overflow,g.style.overflow="hidden",g.appendChild(n)),i=c(l,a),m?l.parentNode.removeChild(l):(n.parentNode.removeChild(n),g.style.overflow=k),!!i},y={}.hasOwnProperty,z;!C(y,"undefined")&&!C(y.call,"undefined")?z=function(a,b){return y.call(a,b)}:z=function(a,b){return b in a&&C(a.constructor.prototype[b],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(b){var c=this;if(typeof c!="function")throw new TypeError;var d=v.call(arguments,1),e=function(){if(this instanceof e){var a=function(){};a.prototype=c.prototype;var f=new a,g=c.apply(f,d.concat(v.call(arguments)));return Object(g)===g?g:f}return c.apply(b,d.concat(v.call(arguments)))};return e}),r.backgroundsize=function(){return G("backgroundSize")},r.csstransforms=function(){return!!G("transform")},r.csstransforms3d=function(){var a=!!G("perspective");return a&&"webkitPerspective"in g.style&&x("@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}",function(b,c){a=b.offsetLeft===9&&b.offsetHeight===3}),a},r.video=function(){var a=b.createElement("video"),c=!1;try{if(c=!!a.canPlayType)c=new Boolean(c),c.ogg=a.canPlayType('video/ogg; codecs="theora"').replace(/^no$/,""),c.h264=a.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/,""),c.webm=a.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/,"")}catch(d){}return c};for(var I in r)z(r,I)&&(w=I.toLowerCase(),e[w]=r[I](),u.push((e[w]?"":"no-")+w));return e.input||H(),e.addTest=function(a,b){if(typeof a=="object")for(var d in a)z(a,d)&&e.addTest(d,a[d]);else{a=a.toLowerCase();if(e[a]!==c)return e;b=typeof b=="function"?b():b,typeof f!="undefined"&&f&&(g.className+=" "+(b?"":"no-")+a),e[a]=b}return e},A(""),i=k=null,function(a,b){function l(a,b){var c=a.createElement("p"),d=a.getElementsByTagName("head")[0]||a.documentElement;return c.innerHTML="x<style>"+b+"</style>",d.insertBefore(c.lastChild,d.firstChild)}function m(){var a=s.elements;return typeof a=="string"?a.split(" "):a}function n(a){var b=j[a[h]];return b||(b={},i++,a[h]=i,j[i]=b),b}function o(a,c,d){c||(c=b);if(k)return c.createElement(a);d||(d=n(c));var g;return d.cache[a]?g=d.cache[a].cloneNode():f.test(a)?g=(d.cache[a]=d.createElem(a)).cloneNode():g=d.createElem(a),g.canHaveChildren&&!e.test(a)&&!g.tagUrn?d.frag.appendChild(g):g}function p(a,c){a||(a=b);if(k)return a.createDocumentFragment();c=c||n(a);var d=c.frag.cloneNode(),e=0,f=m(),g=f.length;for(;e<g;e++)d.createElement(f[e]);return d}function q(a,b){b.cache||(b.cache={},b.createElem=a.createElement,b.createFrag=a.createDocumentFragment,b.frag=b.createFrag()),a.createElement=function(c){return s.shivMethods?o(c,a,b):b.createElem(c)},a.createDocumentFragment=Function("h,f","return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&("+m().join().replace(/[\w\-]+/g,function(a){return b.createElem(a),b.frag.createElement(a),'c("'+a+'")'})+");return n}")(s,b.frag)}function r(a){a||(a=b);var c=n(a);return s.shivCSS&&!g&&!c.hasCSS&&(c.hasCSS=!!l(a,"article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}mark{background:#FF0;color:#000}template{display:none}")),k||q(a,c),a}var c="3.7.0",d=a.html5||{},e=/^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,f=/^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,g,h="_html5shiv",i=0,j={},k;(function(){try{var a=b.createElement("a");a.innerHTML="<xyz></xyz>",g="hidden"in a,k=a.childNodes.length==1||function(){b.createElement("a");var a=b.createDocumentFragment();return typeof a.cloneNode=="undefined"||typeof a.createDocumentFragment=="undefined"||typeof a.createElement=="undefined"}()}catch(c){g=!0,k=!0}})();var s={elements:d.elements||"abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output progress section summary template time video",version:c,shivCSS:d.shivCSS!==!1,supportsUnknownElements:k,shivMethods:d.shivMethods!==!1,type:"default",shivDocument:r,createElement:o,createDocumentFragment:p};a.html5=s,r(b)}(this,b),e._version=d,e._prefixes=n,e._domPrefixes=q,e._cssomPrefixes=p,e.testProp=function(a){return E([a])},e.testAllProps=G,e.testStyles=x,g.className=g.className.replace(/(^|\s)no-js(\s|$)/,"$1$2")+(f?" js "+u.join(" "):""),e}(this,this.document);
}, {});
require.register('src/frontend/vendors/notify.min', function(require, module, exports){
/** Notify.js - v0.3.1 - 2014/06/29
 * http://notifyjs.com/
 * Copyright (c) 2014 Jaime Pillora - MIT
 */
(function(t,i,n,e){"use strict";var r,o,s,a,l,h,c,p,u,d,f,A,m,w,g,y,b,v,x,C,S,E,M,k,H,D,F,T=[].indexOf||function(t){for(var i=0,n=this.length;n>i;i++)if(i in this&&this[i]===t)return i;return-1};S="notify",C=S+"js",s=S+"!blank",M={t:"top",m:"middle",b:"bottom",l:"left",c:"center",r:"right"},m=["l","c","r"],F=["t","m","b"],b=["t","b","l","r"],v={t:"b",m:null,b:"t",l:"r",c:null,r:"l"},x=function(t){var i;return i=[],n.each(t.split(/\W+/),function(t,n){var r;return r=n.toLowerCase().charAt(0),M[r]?i.push(r):e}),i},D={},a={name:"core",html:'<div class="'+C+'-wrapper">\n  <div class="'+C+'-arrow"></div>\n  <div class="'+C+'-container"></div>\n</div>',css:"."+C+"-corner {\n  position: fixed;\n  margin: 5px;\n  z-index: 1050;\n}\n\n."+C+"-corner ."+C+"-wrapper,\n."+C+"-corner ."+C+"-container {\n  position: relative;\n  display: block;\n  height: inherit;\n  width: inherit;\n  margin: 3px;\n}\n\n."+C+"-wrapper {\n  z-index: 1;\n  position: absolute;\n  display: inline-block;\n  height: 0;\n  width: 0;\n}\n\n."+C+"-container {\n  display: none;\n  z-index: 1;\n  position: absolute;\n}\n\n."+C+"-hidable {\n  cursor: pointer;\n}\n\n[data-notify-text],[data-notify-html] {\n  position: relative;\n}\n\n."+C+"-arrow {\n  position: absolute;\n  z-index: 2;\n  width: 0;\n  height: 0;\n}"},H={"border-radius":["-webkit-","-moz-"]},f=function(t){return D[t]},o=function(i,e){var r,o,s,a;if(!i)throw"Missing Style name";if(!e)throw"Missing Style definition";if(!e.html)throw"Missing Style HTML";return(null!=(a=D[i])?a.cssElem:void 0)&&(t.console&&console.warn(""+S+": overwriting style '"+i+"'"),D[i].cssElem.remove()),e.name=i,D[i]=e,r="",e.classes&&n.each(e.classes,function(t,i){return r+="."+C+"-"+e.name+"-"+t+" {\n",n.each(i,function(t,i){return H[t]&&n.each(H[t],function(n,e){return r+="  "+e+t+": "+i+";\n"}),r+="  "+t+": "+i+";\n"}),r+="}\n"}),e.css&&(r+="/* styles for "+e.name+" */\n"+e.css),r&&(e.cssElem=y(r),e.cssElem.attr("id","notify-"+e.name)),s={},o=n(e.html),u("html",o,s),u("text",o,s),e.fields=s},y=function(t){var i;i=l("style"),i.attr("type","text/css"),n("head").append(i);try{i.html(t)}catch(e){i[0].styleSheet.cssText=t}return i},u=function(t,i,e){var r;return"html"!==t&&(t="text"),r="data-notify-"+t,p(i,"["+r+"]").each(function(){var i;return i=n(this).attr(r),i||(i=s),e[i]=t})},p=function(t,i){return t.is(i)?t:t.find(i)},E={clickToHide:!0,autoHide:!0,autoHideDelay:5e3,arrowShow:!0,arrowSize:5,breakNewLines:!0,elementPosition:"bottom",globalPosition:"top right",style:"bootstrap",className:"error",showAnimation:"slideDown",showDuration:400,hideAnimation:"slideUp",hideDuration:200,gap:5},g=function(t,i){var e;return e=function(){},e.prototype=t,n.extend(!0,new e,i)},h=function(t){return n.extend(E,t)},l=function(t){return n("<"+t+"></"+t+">")},A={},d=function(t){var i;return t.is("[type=radio]")&&(i=t.parents("form:first").find("[type=radio]").filter(function(i,e){return n(e).attr("name")===t.attr("name")}),t=i.first()),t},w=function(t,i,n){var r,o;if("string"==typeof n)n=parseInt(n,10);else if("number"!=typeof n)return;if(!isNaN(n))return r=M[v[i.charAt(0)]],o=i,t[r]!==e&&(i=M[r.charAt(0)],n=-n),t[i]===e?t[i]=n:t[i]+=n,null},k=function(t,i,n){if("l"===t||"t"===t)return 0;if("c"===t||"m"===t)return n/2-i/2;if("r"===t||"b"===t)return n-i;throw"Invalid alignment"},c=function(t){return c.e=c.e||l("div"),c.e.text(t).html()},r=function(){function t(t,i,e){"string"==typeof e&&(e={className:e}),this.options=g(E,n.isPlainObject(e)?e:{}),this.loadHTML(),this.wrapper=n(a.html),this.options.clickToHide&&this.wrapper.addClass(""+C+"-hidable"),this.wrapper.data(C,this),this.arrow=this.wrapper.find("."+C+"-arrow"),this.container=this.wrapper.find("."+C+"-container"),this.container.append(this.userContainer),t&&t.length&&(this.elementType=t.attr("type"),this.originalElement=t,this.elem=d(t),this.elem.data(C,this),this.elem.before(this.wrapper)),this.container.hide(),this.run(i)}return t.prototype.loadHTML=function(){var t;return t=this.getStyle(),this.userContainer=n(t.html),this.userFields=t.fields},t.prototype.show=function(t,i){var n,r,o,s,a,l=this;if(r=function(){return t||l.elem||l.destroy(),i?i():e},a=this.container.parent().parents(":hidden").length>0,o=this.container.add(this.arrow),n=[],a&&t)s="show";else if(a&&!t)s="hide";else if(!a&&t)s=this.options.showAnimation,n.push(this.options.showDuration);else{if(a||t)return r();s=this.options.hideAnimation,n.push(this.options.hideDuration)}return n.push(r),o[s].apply(o,n)},t.prototype.setGlobalPosition=function(){var t,i,e,r,o,s,a,h;return h=this.getPosition(),a=h[0],s=h[1],o=M[a],t=M[s],r=a+"|"+s,i=A[r],i||(i=A[r]=l("div"),e={},e[o]=0,"middle"===t?e.top="45%":"center"===t?e.left="45%":e[t]=0,i.css(e).addClass(""+C+"-corner"),n("body").append(i)),i.prepend(this.wrapper)},t.prototype.setElementPosition=function(){var t,i,r,o,s,a,l,h,c,p,u,d,f,A,g,y,x,C,S,E,H,D,z,Q,B,R,N,P,U;for(z=this.getPosition(),E=z[0],C=z[1],S=z[2],u=this.elem.position(),h=this.elem.outerHeight(),d=this.elem.outerWidth(),c=this.elem.innerHeight(),p=this.elem.innerWidth(),Q=this.wrapper.position(),s=this.container.height(),a=this.container.width(),A=M[E],y=v[E],x=M[y],l={},l[x]="b"===E?h:"r"===E?d:0,w(l,"top",u.top-Q.top),w(l,"left",u.left-Q.left),U=["top","left"],B=0,N=U.length;N>B;B++)H=U[B],g=parseInt(this.elem.css("margin-"+H),10),g&&w(l,H,g);if(f=Math.max(0,this.options.gap-(this.options.arrowShow?r:0)),w(l,x,f),this.options.arrowShow){for(r=this.options.arrowSize,i=n.extend({},l),t=this.userContainer.css("border-color")||this.userContainer.css("background-color")||"white",R=0,P=b.length;P>R;R++)H=b[R],D=M[H],H!==y&&(o=D===A?t:"transparent",i["border-"+D]=""+r+"px solid "+o);w(l,M[y],r),T.call(b,C)>=0&&w(i,M[C],2*r)}else this.arrow.hide();return T.call(F,E)>=0?(w(l,"left",k(C,a,d)),i&&w(i,"left",k(C,r,p))):T.call(m,E)>=0&&(w(l,"top",k(C,s,h)),i&&w(i,"top",k(C,r,c))),this.container.is(":visible")&&(l.display="block"),this.container.removeAttr("style").css(l),i?this.arrow.removeAttr("style").css(i):e},t.prototype.getPosition=function(){var t,i,n,e,r,o,s,a;if(i=this.options.position||(this.elem?this.options.elementPosition:this.options.globalPosition),t=x(i),0===t.length&&(t[0]="b"),n=t[0],0>T.call(b,n))throw"Must be one of ["+b+"]";return(1===t.length||(e=t[0],T.call(F,e)>=0&&(r=t[1],0>T.call(m,r)))||(o=t[0],T.call(m,o)>=0&&(s=t[1],0>T.call(F,s))))&&(t[1]=(a=t[0],T.call(m,a)>=0?"m":"l")),2===t.length&&(t[2]=t[1]),t},t.prototype.getStyle=function(t){var i;if(t||(t=this.options.style),t||(t="default"),i=D[t],!i)throw"Missing style: "+t;return i},t.prototype.updateClasses=function(){var t,i;return t=["base"],n.isArray(this.options.className)?t=t.concat(this.options.className):this.options.className&&t.push(this.options.className),i=this.getStyle(),t=n.map(t,function(t){return""+C+"-"+i.name+"-"+t}).join(" "),this.userContainer.attr("class",t)},t.prototype.run=function(t,i){var r,o,a,l,h,u=this;if(n.isPlainObject(i)?n.extend(this.options,i):"string"===n.type(i)&&(this.options.className=i),this.container&&!t)return this.show(!1),e;if(this.container||t){o={},n.isPlainObject(t)?o=t:o[s]=t;for(a in o)r=o[a],l=this.userFields[a],l&&("text"===l&&(r=c(r),this.options.breakNewLines&&(r=r.replace(/\n/g,"<br/>"))),h=a===s?"":"="+a,p(this.userContainer,"[data-notify-"+l+h+"]").html(r));return this.updateClasses(),this.elem?this.setElementPosition():this.setGlobalPosition(),this.show(!0),this.options.autoHide?(clearTimeout(this.autohideTimer),this.autohideTimer=setTimeout(function(){return u.show(!1)},this.options.autoHideDelay)):e}},t.prototype.destroy=function(){return this.wrapper.remove()},t}(),n[S]=function(t,i,e){return t&&t.nodeName||t.jquery?n(t)[S](i,e):(e=i,i=t,new r(null,i,e)),t},n.fn[S]=function(t,i){return n(this).each(function(){var e;return e=d(n(this)).data(C),e?e.run(t,i):new r(n(this),t,i)}),this},n.extend(n[S],{defaults:h,addStyle:o,pluginOptions:E,getStyle:f,insertCSS:y}),n(function(){return y(a.css).attr("id","core-notify"),n(i).on("click","."+C+"-hidable",function(){return n(this).trigger("notify-hide")}),n(i).on("notify-hide","."+C+"-wrapper",function(){var t;return null!=(t=n(this).data(C))?t.show(!1):void 0})})})(window,document,jQuery),$.notify.addStyle("bootstrap",{html:"<div>\n<span data-notify-text></span>\n</div>",classes:{base:{"font-weight":"bold",padding:"8px 15px 8px 14px","text-shadow":"0 1px 0 rgba(255, 255, 255, 0.5)","background-color":"#fcf8e3",border:"1px solid #fbeed5","border-radius":"4px","white-space":"nowrap","padding-left":"25px","background-repeat":"no-repeat","background-position":"3px 7px"},error:{color:"#B94A48","background-color":"#F2DEDE","border-color":"#EED3D7","background-image":"url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAtRJREFUeNqkVc1u00AQHq+dOD+0poIQfkIjalW0SEGqRMuRnHos3DjwAH0ArlyQeANOOSMeAA5VjyBxKBQhgSpVUKKQNGloFdw4cWw2jtfMOna6JOUArDTazXi/b3dm55socPqQhFka++aHBsI8GsopRJERNFlY88FCEk9Yiwf8RhgRyaHFQpPHCDmZG5oX2ui2yilkcTT1AcDsbYC1NMAyOi7zTX2Agx7A9luAl88BauiiQ/cJaZQfIpAlngDcvZZMrl8vFPK5+XktrWlx3/ehZ5r9+t6e+WVnp1pxnNIjgBe4/6dAysQc8dsmHwPcW9C0h3fW1hans1ltwJhy0GxK7XZbUlMp5Ww2eyan6+ft/f2FAqXGK4CvQk5HueFz7D6GOZtIrK+srupdx1GRBBqNBtzc2AiMr7nPplRdKhb1q6q6zjFhrklEFOUutoQ50xcX86ZlqaZpQrfbBdu2R6/G19zX6XSgh6RX5ubyHCM8nqSID6ICrGiZjGYYxojEsiw4PDwMSL5VKsC8Yf4VRYFzMzMaxwjlJSlCyAQ9l0CW44PBADzXhe7xMdi9HtTrdYjFYkDQL0cn4Xdq2/EAE+InCnvADTf2eah4Sx9vExQjkqXT6aAERICMewd/UAp/IeYANM2joxt+q5VI+ieq2i0Wg3l6DNzHwTERPgo1ko7XBXj3vdlsT2F+UuhIhYkp7u7CarkcrFOCtR3H5JiwbAIeImjT/YQKKBtGjRFCU5IUgFRe7fF4cCNVIPMYo3VKqxwjyNAXNepuopyqnld602qVsfRpEkkz+GFL1wPj6ySXBpJtWVa5xlhpcyhBNwpZHmtX8AGgfIExo0ZpzkWVTBGiXCSEaHh62/PoR0p/vHaczxXGnj4bSo+G78lELU80h1uogBwWLf5YlsPmgDEd4M236xjm+8nm4IuE/9u+/PH2JXZfbwz4zw1WbO+SQPpXfwG/BBgAhCNZiSb/pOQAAAAASUVORK5CYII=)"},success:{color:"#468847","background-color":"#DFF0D8","border-color":"#D6E9C6","background-image":"url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAutJREFUeNq0lctPE0Ecx38zu/RFS1EryqtgJFA08YCiMZIAQQ4eRG8eDGdPJiYeTIwHTfwPiAcvXIwXLwoXPaDxkWgQ6islKlJLSQWLUraPLTv7Gme32zoF9KSTfLO7v53vZ3d/M7/fIth+IO6INt2jjoA7bjHCJoAlzCRw59YwHYjBnfMPqAKWQYKjGkfCJqAF0xwZjipQtA3MxeSG87VhOOYegVrUCy7UZM9S6TLIdAamySTclZdYhFhRHloGYg7mgZv1Zzztvgud7V1tbQ2twYA34LJmF4p5dXF1KTufnE+SxeJtuCZNsLDCQU0+RyKTF27Unw101l8e6hns3u0PBalORVVVkcaEKBJDgV3+cGM4tKKmI+ohlIGnygKX00rSBfszz/n2uXv81wd6+rt1orsZCHRdr1Imk2F2Kob3hutSxW8thsd8AXNaln9D7CTfA6O+0UgkMuwVvEFFUbbAcrkcTA8+AtOk8E6KiQiDmMFSDqZItAzEVQviRkdDdaFgPp8HSZKAEAL5Qh7Sq2lIJBJwv2scUqkUnKoZgNhcDKhKg5aH+1IkcouCAdFGAQsuWZYhOjwFHQ96oagWgRoUov1T9kRBEODAwxM2QtEUl+Wp+Ln9VRo6BcMw4ErHRYjH4/B26AlQoQQTRdHWwcd9AH57+UAXddvDD37DmrBBV34WfqiXPl61g+vr6xA9zsGeM9gOdsNXkgpEtTwVvwOklXLKm6+/p5ezwk4B+j6droBs2CsGa/gNs6RIxazl4Tc25mpTgw/apPR1LYlNRFAzgsOxkyXYLIM1V8NMwyAkJSctD1eGVKiq5wWjSPdjmeTkiKvVW4f2YPHWl3GAVq6ymcyCTgovM3FzyRiDe2TaKcEKsLpJvNHjZgPNqEtyi6mZIm4SRFyLMUsONSSdkPeFtY1n0mczoY3BHTLhwPRy9/lzcziCw9ACI+yql0VLzcGAZbYSM5CCSZg1/9oc/nn7+i8N9p/8An4JMADxhH+xHfuiKwAAAABJRU5ErkJggg==)"},info:{color:"#3A87AD","background-color":"#D9EDF7","border-color":"#BCE8F1","background-image":"url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3QYFAhkSsdes/QAAA8dJREFUOMvVlGtMW2UYx//POaWHXg6lLaW0ypAtw1UCgbniNOLcVOLmAjHZolOYlxmTGXVZdAnRfXQm+7SoU4mXaOaiZsEpC9FkiQs6Z6bdCnNYruM6KNBw6YWewzl9z+sHImEWv+vz7XmT95f/+3/+7wP814v+efDOV3/SoX3lHAA+6ODeUFfMfjOWMADgdk+eEKz0pF7aQdMAcOKLLjrcVMVX3xdWN29/GhYP7SvnP0cWfS8caSkfHZsPE9Fgnt02JNutQ0QYHB2dDz9/pKX8QjjuO9xUxd/66HdxTeCHZ3rojQObGQBcuNjfplkD3b19Y/6MrimSaKgSMmpGU5WevmE/swa6Oy73tQHA0Rdr2Mmv/6A1n9w9suQ7097Z9lM4FlTgTDrzZTu4StXVfpiI48rVcUDM5cmEksrFnHxfpTtU/3BFQzCQF/2bYVoNbH7zmItbSoMj40JSzmMyX5qDvriA7QdrIIpA+3cdsMpu0nXI8cV0MtKXCPZev+gCEM1S2NHPvWfP/hL+7FSr3+0p5RBEyhEN5JCKYr8XnASMT0xBNyzQGQeI8fjsGD39RMPk7se2bd5ZtTyoFYXftF6y37gx7NeUtJJOTFlAHDZLDuILU3j3+H5oOrD3yWbIztugaAzgnBKJuBLpGfQrS8wO4FZgV+c1IxaLgWVU0tMLEETCos4xMzEIv9cJXQcyagIwigDGwJgOAtHAwAhisQUjy0ORGERiELgG4iakkzo4MYAxcM5hAMi1WWG1yYCJIcMUaBkVRLdGeSU2995TLWzcUAzONJ7J6FBVBYIggMzmFbvdBV44Corg8vjhzC+EJEl8U1kJtgYrhCzgc/vvTwXKSib1paRFVRVORDAJAsw5FuTaJEhWM2SHB3mOAlhkNxwuLzeJsGwqWzf5TFNdKgtY5qHp6ZFf67Y/sAVadCaVY5YACDDb3Oi4NIjLnWMw2QthCBIsVhsUTU9tvXsjeq9+X1d75/KEs4LNOfcdf/+HthMnvwxOD0wmHaXr7ZItn2wuH2SnBzbZAbPJwpPx+VQuzcm7dgRCB57a1uBzUDRL4bfnI0RE0eaXd9W89mpjqHZnUI5Hh2l2dkZZUhOqpi2qSmpOmZ64Tuu9qlz/SEXo6MEHa3wOip46F1n7633eekV8ds8Wxjn37Wl63VVa+ej5oeEZ/82ZBETJjpJ1Rbij2D3Z/1trXUvLsblCK0XfOx0SX2kMsn9dX+d+7Kf6h8o4AIykuffjT8L20LU+w4AZd5VvEPY+XpWqLV327HR7DzXuDnD8r+ovkBehJ8i+y8YAAAAASUVORK5CYII=)"},warn:{color:"#C09853","background-color":"#FCF8E3","border-color":"#FBEED5","background-image":"url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAMAAAC6V+0/AAABJlBMVEXr6eb/2oD/wi7/xjr/0mP/ykf/tQD/vBj/3o7/uQ//vyL/twebhgD/4pzX1K3z8e349vK6tHCilCWbiQymn0jGworr6dXQza3HxcKkn1vWvV/5uRfk4dXZ1bD18+/52YebiAmyr5S9mhCzrWq5t6ufjRH54aLs0oS+qD751XqPhAybhwXsujG3sm+Zk0PTwG6Shg+PhhObhwOPgQL4zV2nlyrf27uLfgCPhRHu7OmLgAafkyiWkD3l49ibiAfTs0C+lgCniwD4sgDJxqOilzDWowWFfAH08uebig6qpFHBvH/aw26FfQTQzsvy8OyEfz20r3jAvaKbhgG9q0nc2LbZxXanoUu/u5WSggCtp1anpJKdmFz/zlX/1nGJiYmuq5Dx7+sAAADoPUZSAAAAAXRSTlMAQObYZgAAAAFiS0dEAIgFHUgAAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfdBgUBGhh4aah5AAAAlklEQVQY02NgoBIIE8EUcwn1FkIXM1Tj5dDUQhPU502Mi7XXQxGz5uVIjGOJUUUW81HnYEyMi2HVcUOICQZzMMYmxrEyMylJwgUt5BljWRLjmJm4pI1hYp5SQLGYxDgmLnZOVxuooClIDKgXKMbN5ggV1ACLJcaBxNgcoiGCBiZwdWxOETBDrTyEFey0jYJ4eHjMGWgEAIpRFRCUt08qAAAAAElFTkSuQmCC)"}}});
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
//@ sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic2VjdGlvbnMiOlt7Im9mZnNldCI6eyJsaW5lIjo5ODY1LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvYXBpL2xvb3BjYXN0L2xvb3BjYXN0LmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJhcGlfdXJsID0gXCIvYXBpL3YxL1wiXG5cbm9uX2Vycm9yID0gKCBtZXRob2QsIGNhbGxiYWNrICkgLT5cbiAgcmV0dXJuICggZXJyb3IgKSAtPlxuICAgIGNvbnNvbGUuZXJyb3IgXCJlcnJvciBjYWxsaW5nICN7bWV0aG9kfVwiXG4gICAgY29uc29sZS5lcnJvciBlcnJvclxuXG4gICAgY2FsbGJhY2sgZXJyb3IgICAgXG5cbm1vZHVsZS5leHBvcnRzID0gXG5cbiAgZ2VucmVzIDogXG4gICAgYWxsOiAoIGNhbGxiYWNrICkgLT5cbiAgICAgIHJlcXVlc3QgPSAkLmdldCBhcGlfdXJsICsgJ2dlbnJlcy9hbGwnXG5cbiAgICAgIHJlcXVlc3QuZXJyb3Igb25fZXJyb3IgJ2dlbnJlcycsIGNhbGxiYWNrXG5cbiAgICAgIHJlcXVlc3QuZG9uZSAoIHJlc3BvbnNlICkgLT5cblxuICAgICAgICBjYWxsYmFjayAgbnVsbCwgcmVzcG9uc2VcblxuICByb29tcyA6XG4gICAgY3JlYXRlOiAoIGRhdGEsIGNhbGxiYWNrICkgLT5cbiAgICAgIG9uX3N0YXR1c19jb2RlID1cbiAgICAgICAgNDAxOiAoIHJlc3BvbnNlICkgLT4gY2FsbGJhY2sgJ3VuYXV0aG9yaXplZCwgbmVlZCBsb2cgaW4hJ1xuXG4gICAgICByZXF1ZXN0ID0gJC5wb3N0IGFwaV91cmwgKyAncm9vbXMvY3JlYXRlJywgZGF0YSwgb25fc3RhdHVzX2NvZGVcblxuICAgICAgcmVxdWVzdC5lcnJvciBvbl9lcnJvciAncm9vbXMvY3JlYXRlJywgY2FsbGJhY2tcblxuICAgICAgcmVxdWVzdC5kb25lICggcmVzcG9uc2UgKSAtPlxuXG4gICAgICAgIGNhbGxiYWNrICBudWxsLCByZXNwb25zZVxuXG4gICAgc3RhcnRfc3RyZWFtOiAoIHJvb21faWQsIGNhbGxiYWNrICkgLT5cbiAgICAgIG9uX3N0YXR1c19jb2RlID1cbiAgICAgICAgNDAxOiAoIHJlc3BvbnNlICkgLT4gY2FsbGJhY2sgJ3VuYXV0aG9yaXplZCwgbmVlZCBsb2cgaW4hJ1xuXG4gICAgICBkYXRhID0gcm9vbV9pZDogcm9vbV9pZFxuXG4gICAgICByZXF1ZXN0ID0gJC5wb3N0IGFwaV91cmwgKyAnc3RyZWFtL3N0YXJ0JywgZGF0YSwgb25fc3RhdHVzX2NvZGVcblxuICAgICAgcmVxdWVzdC5lcnJvciBvbl9lcnJvciAnc3RyZWFtL3N0YXJ0JywgY2FsbGJhY2tcblxuICAgICAgcmVxdWVzdC5kb25lICggcmVzcG9uc2UgKSAtPlxuXG4gICAgICAgIGNhbGxiYWNrICBudWxsLCByZXNwb25zZVxuXG4gICAgc3RvcF9zdHJlYW06ICggcm9vbV9pZCwgY2FsbGJhY2sgKSAtPlxuICAgICAgb25fc3RhdHVzX2NvZGUgPVxuICAgICAgICA0MDE6ICggcmVzcG9uc2UgKSAtPiBjYWxsYmFjayAndW5hdXRob3JpemVkLCBuZWVkIGxvZyBpbiEnXG4gICAgICAgIDQxMjogKCByZXNwb25zZSApIC0+IGNhbGxiYWNrICdSb29tIG5vdCBmb3VuZCBvciB1c2VyIG5vdCBvd25lciEnXG5cbiAgICAgIGRhdGEgPSByb29tX2lkOiByb29tX2lkXG5cbiAgICAgIHJlcXVlc3QgPSAkLnBvc3QgYXBpX3VybCArICdzdHJlYW0vc3RvcCcsIGRhdGEsIG9uX3N0YXR1c19jb2RlXG5cbiAgICAgIHJlcXVlc3QuZXJyb3Igb25fZXJyb3IgJ3N0cmVhbS9zdG9wJywgY2FsbGJhY2tcblxuICAgICAgcmVxdWVzdC5kb25lICggcmVzcG9uc2UgKSAtPlxuXG4gICAgICAgIGNhbGxiYWNrICBudWxsLCByZXNwb25zZVxuXG4gICAgc3RhcnRfcmVjb3JkaW5nOiAoIHJvb21faWQsIGNhbGxiYWNrICkgLT5cbiAgICAgIG9uX3N0YXR1c19jb2RlID1cbiAgICAgICAgNDAxOiAoIHJlc3BvbnNlICkgLT4gY2FsbGJhY2sgJ3VuYXV0aG9yaXplZCwgbmVlZCBsb2cgaW4hJ1xuICAgICAgICA0MTI6ICggcmVzcG9uc2UgKSAtPiBjYWxsYmFjayAnUm9vbSBub3QgZm91bmQgb3IgdXNlciBub3Qgb3duZXIhJ1xuXG4gICAgICBkYXRhID0gcm9vbV9pZDogcm9vbV9pZFxuXG4gICAgICByZXF1ZXN0ID0gJC5wb3N0IGFwaV91cmwgKyAndGFwZS9zdGFydCcsIGRhdGEsIG9uX3N0YXR1c19jb2RlXG5cbiAgICAgIHJlcXVlc3QuZXJyb3Igb25fZXJyb3IgJ3RhcGUvc3RhcnQnLCBjYWxsYmFja1xuXG4gICAgICByZXF1ZXN0LmRvbmUgKCByZXNwb25zZSApIC0+XG5cbiAgICAgICAgY2FsbGJhY2sgIG51bGwsIHJlc3BvbnNlXG5cbiAgICBzdG9wX3JlY29yZGluZzogKCByb29tX2lkLCBjYWxsYmFjayApIC0+XG4gICAgICBvbl9zdGF0dXNfY29kZSA9XG4gICAgICAgIDQwMTogKCByZXNwb25zZSApIC0+IGNhbGxiYWNrICd1bmF1dGhvcml6ZWQsIG5lZWQgbG9nIGluISdcblxuICAgICAgZGF0YSA9IHJvb21faWQ6IHJvb21faWRcblxuICAgICAgcmVxdWVzdCA9ICQucG9zdCBhcGlfdXJsICsgJ3RhcGUvc3RvcCcsIGRhdGEsIG9uX3N0YXR1c19jb2RlXG5cbiAgICAgIHJlcXVlc3QuZXJyb3Igb25fZXJyb3IgJ3RhcGUvc3RvcCcsIGNhbGxiYWNrXG5cbiAgICAgIHJlcXVlc3QuZG9uZSAoIHJlc3BvbnNlICkgLT5cblxuICAgICAgICBjYWxsYmFjayAgbnVsbCwgcmVzcG9uc2VcblxuICBjaGF0OlxuICAgIG1lc3NhZ2U6ICggdXNlcl9pZCwgcm9vbV9pZCwgbWVzc2FnZSwgY2FsbGJhY2sgKSAtPlxuICAgICAgb25fc3RhdHVzX2NvZGUgPVxuICAgICAgICA0MDA6IC0+IGNhbGxiYWNrICdiYWQgcmVxdWVzdCdcbiAgICAgICAgNDAxOiAtPiBjYWxsYmFjayAndW5hdXRob3JpemVkJ1xuICAgICAgICA1MDA6IC0+IGNhbGxiYWNrICdzZXJ2ZXIgZXJyb3InXG5cbiAgICAgIGRhdGEgPSBcbiAgICAgICAgbWVzc2FnZSA6IG1lc3NhZ2VcbiAgICAgICAgcm9vbV9pZCA6IHJvb21faWRcbiAgICAgICAgdXNlcl9pZCA6IHVzZXJfaWRcblxuICAgICAgcmVxdWVzdCA9ICQucG9zdCBhcGlfdXJsICsgJ2NoYXQvbWVzc2FnZScsIGRhdGEsIG9uX3N0YXR1c19jb2RlXG5cbiAgICAgIHJlcXVlc3QuZXJyb3Igb25fZXJyb3IgJ3RhcGUvc3RhcnQnLCBjYWxsYmFja1xuXG4gICAgICByZXF1ZXN0LmRvbmUgKCByZXNwb25zZSApIC0+XG5cbiAgICAgICAgY2FsbGJhY2sgIG51bGwsIHJlc3BvbnNlXG5cbiAgdXNlcjpcbiAgICBlZGl0OiAoIGRhdGEsIGNhbGxiYWNrICkgLT5cbiAgICAgIG9uX3N0YXR1c19jb2RlID1cbiAgICAgICAgNDAxOiAoIHJlc3BvbnNlICkgLT4gY2FsbGJhY2sgJ3VuYXV0aG9yaXplZCwgbmVlZCBsb2cgaW4hJ1xuXG4gICAgICByZXF1ZXN0ID0gJC5wb3N0IGFwaV91cmwgKyAndXNlci9lZGl0JywgZGF0YSwgb25fc3RhdHVzX2NvZGVcblxuICAgICAgcmVxdWVzdC5lcnJvciBvbl9lcnJvciAndXNlci9lZGl0JywgY2FsbGJhY2tcblxuICAgICAgcmVxdWVzdC5kb25lICggcmVzcG9uc2UgKSAtPlxuXG4gICAgICAgIGNhbGxiYWNrICBudWxsLCByZXNwb25zZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGFBQUE7O0FBQUEsQ0FBQSxFQUFVLElBQVYsR0FBQTs7QUFFQSxDQUZBLENBRXFCLENBQVYsR0FBQSxFQUFYLENBQWE7Q0FDWCxFQUFPLEVBQUEsSUFBQTtDQUNMLEVBQThCLENBQTlCLENBQUEsQ0FBQSxDQUFPLFNBQVE7Q0FBZixHQUNBLENBQUEsRUFBTztDQUVFLElBQVQsR0FBQSxHQUFBO0NBSkYsRUFBTztDQURFOztBQU9YLENBVEEsRUFXRSxHQUZJLENBQU47Q0FFRSxDQUFBLElBQUE7Q0FDRSxDQUFLLENBQUwsQ0FBQSxJQUFLLENBQUU7Q0FDTCxNQUFBLEdBQUE7Q0FBQSxFQUFVLEdBQVYsQ0FBQSxLQUFVO0NBQVYsQ0FFaUMsR0FBakMsQ0FBQSxDQUFPLENBQU87Q0FFTixFQUFLLENBQWIsR0FBTyxDQUFNLENBQUUsSUFBZjtDQUVZLENBQU0sRUFBaEIsSUFBQSxPQUFBO0NBRkYsTUFBYTtDQUxmLElBQUs7SUFEUDtDQUFBLENBVUEsR0FBQTtDQUNFLENBQVEsQ0FBQSxDQUFSLEVBQUEsRUFBUSxDQUFFO0NBQ1IsU0FBQSxhQUFBO0NBQUEsRUFDRSxHQURGLFFBQUE7Q0FDRSxDQUFLLENBQUwsS0FBQSxDQUFPO0NBQXVCLE9BQVQsU0FBQSxXQUFBO0NBQXJCLFFBQUs7Q0FEUCxPQUFBO0NBQUEsQ0FHMkMsQ0FBakMsQ0FBQSxFQUFWLENBQUEsT0FBVTtDQUhWLENBS3VDLEdBQXZDLENBQUEsQ0FBTyxDQUFPLE1BQUE7Q0FFTixFQUFLLENBQWIsR0FBTyxDQUFNLENBQUUsSUFBZjtDQUVZLENBQU0sRUFBaEIsSUFBQSxPQUFBO0NBRkYsTUFBYTtDQVJmLElBQVE7Q0FBUixDQVljLENBQUEsQ0FBZCxHQUFjLENBQUEsQ0FBRSxHQUFoQjtDQUNFLFNBQUEsbUJBQUE7Q0FBQSxFQUNFLEdBREYsUUFBQTtDQUNFLENBQUssQ0FBTCxLQUFBLENBQU87Q0FBdUIsT0FBVCxTQUFBLFdBQUE7Q0FBckIsUUFBSztDQURQLE9BQUE7Q0FBQSxFQUdPLENBQVAsRUFBQTtDQUFPLENBQVMsS0FBVCxDQUFBO0NBSFAsT0FBQTtDQUFBLENBSzJDLENBQWpDLENBQUEsRUFBVixDQUFBLE9BQVU7Q0FMVixDQU91QyxHQUF2QyxDQUFBLENBQU8sQ0FBTyxNQUFBO0NBRU4sRUFBSyxDQUFiLEdBQU8sQ0FBTSxDQUFFLElBQWY7Q0FFWSxDQUFNLEVBQWhCLElBQUEsT0FBQTtDQUZGLE1BQWE7Q0F0QmYsSUFZYztDQVpkLENBMEJhLENBQUEsQ0FBYixHQUFhLENBQUEsQ0FBRSxFQUFmO0NBQ0UsU0FBQSxtQkFBQTtDQUFBLEVBQ0UsR0FERixRQUFBO0NBQ0UsQ0FBSyxDQUFMLEtBQUEsQ0FBTztDQUF1QixPQUFULFNBQUEsV0FBQTtDQUFyQixRQUFLO0NBQUwsQ0FDSyxDQUFMLEtBQUEsQ0FBTztDQUF1QixPQUFULFNBQUEsa0JBQUE7Q0FEckIsUUFDSztDQUZQLE9BQUE7Q0FBQSxFQUlPLENBQVAsRUFBQTtDQUFPLENBQVMsS0FBVCxDQUFBO0NBSlAsT0FBQTtDQUFBLENBTTBDLENBQWhDLENBQUEsRUFBVixDQUFBLE1BQVUsQ0FBQTtDQU5WLENBUXNDLEdBQXRDLENBQUEsQ0FBTyxDQUFPLEtBQUE7Q0FFTixFQUFLLENBQWIsR0FBTyxDQUFNLENBQUUsSUFBZjtDQUVZLENBQU0sRUFBaEIsSUFBQSxPQUFBO0NBRkYsTUFBYTtDQXJDZixJQTBCYTtDQTFCYixDQXlDaUIsQ0FBQSxDQUFqQixHQUFpQixDQUFBLENBQUUsTUFBbkI7Q0FDRSxTQUFBLG1CQUFBO0NBQUEsRUFDRSxHQURGLFFBQUE7Q0FDRSxDQUFLLENBQUwsS0FBQSxDQUFPO0NBQXVCLE9BQVQsU0FBQSxXQUFBO0NBQXJCLFFBQUs7Q0FBTCxDQUNLLENBQUwsS0FBQSxDQUFPO0NBQXVCLE9BQVQsU0FBQSxrQkFBQTtDQURyQixRQUNLO0NBRlAsT0FBQTtDQUFBLEVBSU8sQ0FBUCxFQUFBO0NBQU8sQ0FBUyxLQUFULENBQUE7Q0FKUCxPQUFBO0NBQUEsQ0FNeUMsQ0FBL0IsQ0FBQSxFQUFWLENBQUEsS0FBVSxFQUFBO0NBTlYsQ0FRcUMsR0FBckMsQ0FBQSxDQUFPLENBQU8sSUFBQTtDQUVOLEVBQUssQ0FBYixHQUFPLENBQU0sQ0FBRSxJQUFmO0NBRVksQ0FBTSxFQUFoQixJQUFBLE9BQUE7Q0FGRixNQUFhO0NBcERmLElBeUNpQjtDQXpDakIsQ0F3RGdCLENBQUEsQ0FBaEIsR0FBZ0IsQ0FBQSxDQUFFLEtBQWxCO0NBQ0UsU0FBQSxtQkFBQTtDQUFBLEVBQ0UsR0FERixRQUFBO0NBQ0UsQ0FBSyxDQUFMLEtBQUEsQ0FBTztDQUF1QixPQUFULFNBQUEsV0FBQTtDQUFyQixRQUFLO0NBRFAsT0FBQTtDQUFBLEVBR08sQ0FBUCxFQUFBO0NBQU8sQ0FBUyxLQUFULENBQUE7Q0FIUCxPQUFBO0NBQUEsQ0FLd0MsQ0FBOUIsQ0FBQSxFQUFWLENBQUEsSUFBVSxHQUFBO0NBTFYsQ0FPb0MsR0FBcEMsQ0FBQSxDQUFPLENBQU8sR0FBQTtDQUVOLEVBQUssQ0FBYixHQUFPLENBQU0sQ0FBRSxJQUFmO0NBRVksQ0FBTSxFQUFoQixJQUFBLE9BQUE7Q0FGRixNQUFhO0NBbEVmLElBd0RnQjtJQW5FbEI7Q0FBQSxDQWlGQSxFQUFBO0NBQ0UsQ0FBUyxDQUFBLENBQVQsR0FBQSxDQUFTLENBQUU7Q0FDVCxTQUFBLG1CQUFBO0NBQUEsRUFDRSxHQURGLFFBQUE7Q0FDRSxDQUFLLENBQUwsS0FBQSxDQUFLO0NBQVksT0FBVCxLQUFBLElBQUE7Q0FBUixRQUFLO0NBQUwsQ0FDSyxDQUFMLEtBQUEsQ0FBSztDQUFZLE9BQVQsTUFBQSxHQUFBO0NBRFIsUUFDSztDQURMLENBRUssQ0FBTCxLQUFBLENBQUs7Q0FBWSxPQUFULE1BQUEsR0FBQTtDQUZSLFFBRUs7Q0FIUCxPQUFBO0NBQUEsRUFNRSxDQURGLEVBQUE7Q0FDRSxDQUFVLEtBQVYsQ0FBQTtDQUFBLENBQ1UsS0FBVixDQUFBO0NBREEsQ0FFVSxLQUFWLENBQUE7Q0FSRixPQUFBO0NBQUEsQ0FVMkMsQ0FBakMsQ0FBQSxFQUFWLENBQUEsT0FBVTtDQVZWLENBWXFDLEdBQXJDLENBQUEsQ0FBTyxDQUFPLElBQUE7Q0FFTixFQUFLLENBQWIsR0FBTyxDQUFNLENBQUUsSUFBZjtDQUVZLENBQU0sRUFBaEIsSUFBQSxPQUFBO0NBRkYsTUFBYTtDQWZmLElBQVM7SUFsRlg7Q0FBQSxDQXFHQSxFQUFBO0NBQ0UsQ0FBTSxDQUFBLENBQU4sSUFBTSxDQUFFO0NBQ04sU0FBQSxhQUFBO0NBQUEsRUFDRSxHQURGLFFBQUE7Q0FDRSxDQUFLLENBQUwsS0FBQSxDQUFPO0NBQXVCLE9BQVQsU0FBQSxXQUFBO0NBQXJCLFFBQUs7Q0FEUCxPQUFBO0NBQUEsQ0FHd0MsQ0FBOUIsQ0FBQSxFQUFWLENBQUEsSUFBVSxHQUFBO0NBSFYsQ0FLb0MsR0FBcEMsQ0FBQSxDQUFPLENBQU8sR0FBQTtDQUVOLEVBQUssQ0FBYixHQUFPLENBQU0sQ0FBRSxJQUFmO0NBRVksQ0FBTSxFQUFoQixJQUFBLE9BQUE7Q0FGRixNQUFhO0NBUmYsSUFBTTtJQXRHUjtDQVhGLENBQUEifX0seyJvZmZzZXQiOnsibGluZSI6MTAwMTgsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy9hcHAuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbInJlcXVpcmUgJy4vZ2xvYmFscydcbnJlcXVpcmUgJy4vdmVuZG9ycydcblxudmlld3MgICAgICAgICAgID0gcmVxdWlyZSAnLi9jb250cm9sbGVycy92aWV3cydcbm5hdmlnYXRpb24gICAgICA9IHJlcXVpcmUgJy4vY29udHJvbGxlcnMvbmF2aWdhdGlvbidcbmFwcGNhc3QgICAgICAgICA9IHJlcXVpcmUgJy4vY29udHJvbGxlcnMvYXBwY2FzdCdcbmNsb3VkaW5hcnkgICAgICA9IHJlcXVpcmUgJy4vY29udHJvbGxlcnMvY2xvdWRpbmFyeSdcbkdVSSAgICAgICAgICAgICA9IHJlcXVpcmUgJy4vY29udHJvbGxlcnMvZ3VpJ1xuIyBtb3Rpb24gICA9IHJlcXVpcmUgJ2FwcC9jb250cm9sbGVycy9tb3Rpb24nXG5cblxuXG5cbmNsYXNzIEFwcFxuXG5cdCMgbGluayB0byB3aW5kb3dcblx0d2luZG93OiBudWxsXG5cblx0IyBsaW5rIHRvIHV0aWxzL3NldHRpbmdzXG5cdHNldHRpbmdzOiBudWxsXG5cblx0IyBsaW5rIHRvIGNvbnRyb2xsZXIvbG9jYWxfY29ubmVjdGlvblxuXHRsb2NhbDogbnVsbFxuXG5cdCMgbGluayB0byBjb250cm9sbGVyL3Nlc3Npb25cblx0c2Vzc2lvbjogbnVsbFxuXG5cdG1haW5fdmlld19iaW5kZWRfY291bnRlcjogMFxuXG5cdGNvbnN0cnVjdG9yOiAtPlxuXHRcdGhhcHBlbnMgQFxuXG5cdHN0YXJ0OiAtPlxuXHRcdFxuXHRcdEBsb2NhbCAgID0gcmVxdWlyZSAnYXBwL2NvbnRyb2xsZXJzL2xvY2FsX2Nvbm5lY3Rpb24nXG5cdFx0QHNlc3Npb24gPSByZXF1aXJlICdhcHAvY29udHJvbGxlcnMvc3RvcmFnZSdcblx0XHRAd2luZG93ICA9IHJlcXVpcmUgJ2FwcC9jb250cm9sbGVycy93aW5kb3cnXG5cdFx0QHVzZXIgICAgPSByZXF1aXJlICcuL2NvbnRyb2xsZXJzL3VzZXInXG5cdFx0QGd1aSAgICAgPSBuZXcgR1VJXG5cblx0XHRAYm9keSAgICA9ICQgJ2JvZHknXG5cdFx0XG5cdFx0IyB1ID0gU2Vzc2lvbi5nZXQoICd1c2VyJywgZmFsc2UgKVxuXHRcdCMgbG9nIFwiW1Nlc3Npb25dIHVzZXJcIiwgdVxuXHRcdFxuXHRcdEBzZXR0aW5ncyA9IHJlcXVpcmUgJ2FwcC91dGlscy9zZXR0aW5ncydcblx0XHRAc2V0dGluZ3MuYmluZCBAYm9keVxuXG5cdFx0IyBDb250cm9sbGVycyBiaW5kaW5nXG5cdFx0Zmlyc3RfcmVuZGVyID0gdHJ1ZVxuXG5cdFx0bmF2aWdhdGlvbi5vbiAnYmVmb3JlX2Rlc3Ryb3knLCA9PlxuXHRcdFx0QGVtaXQgJ2xvYWRpbmc6c2hvdydcblx0XHRcdHZpZXdzLnVuYmluZCAnI2NvbnRlbnQnXG5cblx0XHRuYXZpZ2F0aW9uLm9uICdhZnRlcl9yZW5kZXInLCA9PlxuXG5cdFx0XHRpZiBub3QgZmlyc3RfcmVuZGVyXG5cdFx0XHRcdHZpZXdzLmJpbmQgJyNjb250ZW50J1xuXG5cdFx0XHRuYXZpZ2F0aW9uLmJpbmQgJyNjb250ZW50J1xuXHRcdFx0QHVzZXIuY2hlY2tfZ3Vlc3Rfb3duZXIoKVxuXHRcblx0XHRcdGZpcnN0X3JlbmRlciA9IGZhbHNlXG5cblx0XHR2aWV3cy5iaW5kICdib2R5J1xuXHRcdG5hdmlnYXRpb24uYmluZCgpXG5cblx0b25fdmlld3NfYmluZGVkOiAoIHNjb3BlICkgPT5cblx0XHRpZiBub3Qgc2NvcGUubWFpblxuXHRcdFx0cmV0dXJuIFxuXG5cdFx0QG1haW5fdmlld19iaW5kZWRfY291bnRlcisrXG5cblx0XHRpZiB3aW5kb3cub3BlbmVyPyBhbmQgQG1haW5fdmlld19iaW5kZWRfY291bnRlciA+IDFcblx0XHRcdHJldHVyblxuXG5cdFx0IyBDaGVjayBpZiBzb21lIHZpZXcgaXMgcmVxdWVzdGluZyB0aGUgcHJlbG9hZFxuXHRcdHZpZXdfcHJlbG9hZGluZyA9ICQoIHNjb3BlLnNjb3BlICkuZmluZCggJy5yZXF1ZXN0X3ByZWxvYWRpbmcnIClcblxuXHRcdCMgSWYgc29tZSB2aWV3IGlzIHByZWxvYWRpbmcsIHdhaXQgZm9yIGl0cyByZWFkeSBldmVudFxuXHRcdGlmIHZpZXdfcHJlbG9hZGluZy5sZW5ndGggPiAwXG5cdFx0XHR2ID0gdmlld3MuZ2V0X2J5X2RvbSB2aWV3X3ByZWxvYWRpbmdcblx0XHRcdHYub25jZSAncmVhZHknLCA9PiBcblx0XHRcdFx0QGVtaXQgJ2xvYWRpbmc6aGlkZSdcblxuXHRcdCMgT3RoZXJ3aXNlIGp1c3QgaGlkZSB0aGUgbG9hZGluZyBzY3JlZW5cblx0XHRlbHNlXG5cdFx0XHRAZW1pdCAnbG9hZGluZzpoaWRlJ1xuXG5cdFxuXHQjIFVzZXIgUHJveGllc1xuXHRsb2dpbiA6ICggdXNlcl9kYXRhICkgLT4gXG5cdFx0bG9nIFwiLS0tLS0tLS0+IGxvZ2luIGNhbGxlZCBmcm9tIG91dHNpZGVcIiwgdXNlcl9kYXRhXG5cblx0XHRpZiBAc2V0dGluZ3MuYWZ0ZXJfbG9naW5fdXJsLmxlbmd0aCA+IDBcblx0XHRcdHVybCA9IEBzZXR0aW5ncy5hZnRlcl9sb2dpbl91cmxcblx0XHRcdEBzZXR0aW5ncy5hZnRlcl9sb2dpbl91cmwgPSBcIlwiXG5cdFx0ZWxzZVxuXHRcdFx0dXJsID0gXCIvI3t1c2VyX2RhdGEudXNlcm5hbWV9XCJcblx0XHRcdFxuXHRcdG5hdmlnYXRpb24uZ28gdXJsXG5cdFx0QHVzZXIubG9naW4gdXNlcl9kYXRhXG5cblx0bG9nb3V0OiAtPiBAdXNlci5sb2dvdXQoKVxuXG5cdFxuXG5cdFx0XG5hcHAgPSBuZXcgQXBwXG5cbiQgLT4gYXBwLnN0YXJ0KClcblxubW9kdWxlLmV4cG9ydHMgPSB3aW5kb3cuYXBwID0gYXBwIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsaURBQUE7R0FBQSwrRUFBQTs7QUFBQSxDQUFBLE1BQUEsSUFBQTs7QUFDQSxDQURBLE1BQ0EsSUFBQTs7QUFFQSxDQUhBLEVBR2tCLEVBQWxCLEVBQWtCLGNBQUE7O0FBQ2xCLENBSkEsRUFJa0IsSUFBQSxHQUFsQixnQkFBa0I7O0FBQ2xCLENBTEEsRUFLa0IsSUFBbEIsZ0JBQWtCOztBQUNsQixDQU5BLEVBTWtCLElBQUEsR0FBbEIsZ0JBQWtCOztBQUNsQixDQVBBLEVBT0EsSUFBa0IsWUFBQTs7QUFNWixDQWJOO0NBZ0JDLEVBQVEsQ0FBUixFQUFBOztDQUFBLEVBR1UsQ0FIVixJQUdBOztDQUhBLEVBTU8sQ0FOUCxDQU1BOztDQU5BLEVBU1MsQ0FUVCxHQVNBOztDQVRBLEVBVzBCLHFCQUExQjs7Q0FFYSxDQUFBLENBQUEsVUFBQTtDQUNaLHdEQUFBO0NBQUEsR0FBQSxHQUFBO0NBZEQsRUFhYTs7Q0FiYixFQWdCTyxFQUFQLElBQU87Q0FFTixPQUFBLElBQUE7T0FBQSxLQUFBO0NBQUEsRUFBVyxDQUFYLENBQUEsRUFBVywyQkFBQTtDQUFYLEVBQ1csQ0FBWCxHQUFBLGtCQUFXO0NBRFgsRUFFVyxDQUFYLEVBQUEsQ0FBVyxpQkFBQTtDQUZYLEVBR1csQ0FBWCxHQUFXLGFBQUE7QUFDQSxDQUpYLEVBSUEsQ0FBQTtDQUpBLEVBTVcsQ0FBWCxFQUFXO0NBTlgsRUFXWSxDQUFaLEdBQVksQ0FBWixZQUFZO0NBWFosR0FZQSxJQUFTO0NBWlQsRUFlZSxDQUFmLFFBQUE7Q0FmQSxDQWlCQSxDQUFnQyxDQUFoQyxLQUFnQyxDQUF0QixNQUFWO0NBQ0MsR0FBQSxDQUFDLENBQUQsUUFBQTtDQUNNLElBQUQsQ0FBTCxJQUFBLEdBQUE7Q0FGRCxJQUFnQztDQWpCaEMsQ0FxQkEsQ0FBOEIsQ0FBOUIsS0FBOEIsQ0FBcEIsSUFBVjtBQUVRLENBQVAsR0FBRyxFQUFILE1BQUE7Q0FDQyxHQUFBLENBQUssR0FBTCxFQUFBO1FBREQ7Q0FBQSxHQUdBLEVBQUEsSUFBVTtDQUhWLEdBSUssQ0FBSixDQUFELFdBQUE7Q0FONkIsRUFRZCxTQUFmLENBQUE7Q0FSRCxJQUE4QjtDQXJCOUIsR0ErQkEsQ0FBSyxDQUFMO0NBQ1csR0FBWCxNQUFVLENBQVY7Q0FsREQsRUFnQk87O0NBaEJQLEVBb0RpQixFQUFBLElBQUUsTUFBbkI7Q0FDQyxPQUFBLFVBQUE7T0FBQSxLQUFBO0FBQU8sQ0FBUCxHQUFBLENBQVk7Q0FDWCxXQUFBO01BREQ7QUFHQSxDQUhBLENBQUEsRUFHQSxvQkFBQTtDQUVBLEVBQWtELENBQWxELG1CQUFHLENBQW1CO0NBQ3JCLFdBQUE7TUFORDtDQUFBLEVBU2tCLENBQWxCLENBQTBCLFVBQTFCLE1BQWtCO0NBR2xCLEVBQTRCLENBQTVCLEVBQUcsU0FBZTtDQUNqQixFQUFJLEVBQUssQ0FBVCxJQUFJLEtBQUE7Q0FDSCxDQUFlLENBQUEsQ0FBaEIsR0FBQSxFQUFnQixJQUFoQjtDQUNFLEdBQUQsQ0FBQyxTQUFELENBQUE7Q0FERCxNQUFnQjtNQUZqQjtDQU9FLEdBQUEsU0FBRCxDQUFBO01BcEJlO0NBcERqQixFQW9EaUI7O0NBcERqQixFQTRFUSxFQUFSLElBQVU7Q0FDVCxFQUFBLEtBQUE7Q0FBQSxDQUEyQyxDQUEzQyxDQUFBLEtBQUEsNEJBQUE7Q0FFQSxFQUFzQyxDQUF0QyxFQUFHLEVBQVMsT0FBZ0I7Q0FDM0IsRUFBQSxDQUFPLEVBQVAsRUFBZSxPQUFmO0NBQUEsQ0FBQSxDQUM0QixDQUEzQixFQUFELEVBQVMsT0FBVDtNQUZEO0NBSUMsRUFBQSxHQUFBLEVBQUEsQ0FBa0I7TUFObkI7Q0FBQSxDQVFBLENBQUEsQ0FBQSxNQUFVO0NBQ1QsR0FBQSxDQUFELElBQUEsRUFBQTtDQXRGRCxFQTRFUTs7Q0E1RVIsRUF3RlEsR0FBUixHQUFRO0NBQUksR0FBQSxFQUFELEtBQUE7Q0F4RlgsRUF3RlE7O0NBeEZSOztDQWhCRDs7QUE2R0EsQ0E3R0EsRUE2R0E7O0FBRUEsQ0EvR0EsRUErR0UsTUFBQTtDQUFPLEVBQUQsRUFBSCxJQUFBO0NBQUg7O0FBRUYsQ0FqSEEsRUFpSGlCLEdBQVgsQ0FBTiJ9fSx7Im9mZnNldCI6eyJsaW5lIjoxMDEzMSwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL2NvbnRyb2xsZXJzL2FwcGNhc3QuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIyBNYW5hZ2VzIGxvY2FsIGNvbm5lY3Rpb24gdG8gQXBwY2FzdFxuIyMjXG5cbmF3YXJlICAgID0gcmVxdWlyZSAnYXdhcmUnXG4jIHNob3J0Y3V0IGZvciB2ZW5kb3Igc2NyaXB0c1xudiAgICAgICA9IHJlcXVpcmUgJ2FwcC92ZW5kb3JzJ1xuXG4jIHRoZSBjb250cm9sbGVyIGlzIHRoZSBtb2RlbCwgbW9kZXJuIGNvbmNlcHQgb2YgaGVybWFwaHJvZGl0ZSBmaWxlXG5hcHBjYXN0ID0gYXdhcmUge31cblxuIyBvbmx5IGVuYWJsZSBpZiBhdmFpbGFibGUgb24gd2luZG93XG5XZWJTb2NrZXQgPSB3aW5kb3cuV2ViU29ja2V0IHx8IG51bGxcblxuIyB3ZWJzb2NrZXQgY29ubmVjdGlvbnNcbmFwcGNhc3QubWVzc2FnZXMgPSB7fVxuYXBwY2FzdC52dSAgICAgICA9IHt9XG5cblxuYXBwY2FzdC5zZXQgJ2Nvbm5lY3RlZCcsIGZhbHNlXG4jIGNvbm5lY3RzIHRvIEFwcENhc3QncyBXZWJTb2NrZXQgc2VydmVyIGFuZCBsaXN0ZW4gZm9yIG1lc3NhZ2VzXG5hcHBjYXN0LmNvbm5lY3QgPSAtPlxuXG4gIGlmIG5vdCBXZWJTb2NrZXRcbiAgICByZXR1cm4gY29uc29sZS5pbmZvICcrIHNvY2tldCBjb250cm9sbGVyIHdvbnQgY29ubmVjdCdcblxuICBtZXNzYWdlc19zb2NrZXQgPSAnd3M6Ly9sb2NhbGhvc3Q6NTEyMzQvbG9vcGNhc3QvbWVzc2FnZXMnXG5cbiAgYXBwY2FzdC5tZXNzYWdlcyA9IG5ldyB2LlJlY29ubmVjdGluZ1dlYnNvY2tldCBtZXNzYWdlc19zb2NrZXRcblxuICBhcHBjYXN0Lm1lc3NhZ2VzLm9ub3BlbiA9IC0+XG4gICAgY29uc29sZS5pbmZvICctIHNvY2tldCBjb250cm9sbGVyIGNvbm5lY3Rpb24gb3BlbmVkJ1xuXG4gICAgYXBwY2FzdC5zZXQgJ2Nvbm5lY3RlZCcsIHRydWVcblxuICAgIGFwcGNhc3QubWVzc2FnZXMuc2VuZCBKU09OLnN0cmluZ2lmeSBbICdnZXRfaW5wdXRfZGV2aWNlcycgXVxuXG4gIGFwcGNhc3QubWVzc2FnZXMub25jbG9zZSA9IC0+XG4gICAgY29uc29sZS5pbmZvICctIEFwcENhc3QgaXNudCBPUEVOLCB3aWxsIHJldHJ5IHRvIGNvbm5lY3QnXG5cbiAgICBhcHBjYXN0LnNldCAnY29ubmVjdGVkJywgZmFsc2VcblxuXG4gICMgcm91dGUgaW5jb21pbmcgbWVzc2FnZXMgdG8gYXBwY2FzdC5jYWxsYmFja3MgaGFzaFxuICBhcHBjYXN0Lm1lc3NhZ2VzLm9ubWVzc2FnZSA9ICggZSApIC0+XG5cbiAgICBqc29uID0gZS5kYXRhXG5cbiAgICB0cnlcbiAgICAgIGZyb21fanNvbiA9IEpTT04ucGFyc2UganNvblxuICAgIGNhdGNoIGVycm9yXG4gICAgICBjb25zb2xlLmVycm9yIFwiLSBzb2NrZXQgY29udHJvbGxlciBlcnJvciBwYXJzaW5nIGpzb25cIlxuICAgICAgY29uc29sZS5lcnJvciBlcnJvclxuICAgICAgcmV0dXJuIGVycm9yXG5cbiAgICBtZXRob2QgPSBmcm9tX2pzb25bMF1cbiAgICBhcmdzICAgPSBmcm9tX2pzb25bMV1cbiAgICBcbiAgICBpZiAnZXJyb3InID09IG1ldGhvZFxuICAgICAgcmV0dXJuIGNvbnNvbGUubG9nICdlcnJvcicsIGFyZ3NcblxuICAgIGlmIHR5cGVvZiBhcHBjYXN0LmNhbGxiYWNrc1ttZXRob2RdIGlzICdmdW5jdGlvbidcbiAgICAgIGFwcGNhc3QuY2FsbGJhY2tzW21ldGhvZF0oIGFyZ3MgKVxuICAgIGVsc2UgXG4gICAgICBjb25zb2xlLmxvZyBcIiArIHNvY2tldCBjb250cm9sbGVyIGhhcyBubyBjYWxsYmFjayBmb3I6XCIsIG1ldGhvZFxuXG5cblxuICB2dV9zb2NrZXQgPSAnd3M6Ly9sb2NhbGhvc3Q6NTEyMzQvbG9vcGNhc3QvdnUnXG4gIGFwcGNhc3QudnUgPSBuZXcgdi5SZWNvbm5lY3RpbmdXZWJzb2NrZXQgdnVfc29ja2V0XG5cbiAgYXBwY2FzdC52dS5vbm9wZW4gPSAtPlxuICAgIGNvbnNvbGUuaW5mbyAnLSBzb2NrZXQgVlUgY29ubmVjdGlvbiBvcGVuZWQnXG5cbiAgICBhcHBjYXN0LnNldCAndnU6Y29ubmVjdGVkJywgdHJ1ZVxuXG4gIGFwcGNhc3QudnUub25jbG9zZSA9IC0+XG4gICAgY29uc29sZS5pbmZvICctIHNvY2tldCBWVSBjb25uZWN0aW9uIGNsb3NlZCdcblxuICAgIGFwcGNhc3Quc2V0ICd2dTpjb25uZWN0ZWQnLCBmYWxzZVxuXG4gICMgcm91dGUgaW5jb21pbmcgbWVzc2FnZXMgdG8gYXBwY2FzdC5jYWxsYmFja3MgaGFzaFxuICBhcHBjYXN0LnZ1Lm9ubWVzc2FnZSA9ICggZSApIC0+XG5cbiAgICByZWFkZXIgPSBuZXcgRmlsZVJlYWRlclxuXG4gICAgcmVhZGVyLm9ubG9hZCA9ICggZSApIC0+XG4gICAgICBidWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5IGUudGFyZ2V0LnJlc3VsdFxuXG4gICAgICBhcHBjYXN0LnNldCAnc3RyZWFtOnZ1JywgYnVmZmVyICBcblxuICAgIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlciBlLmRhdGFcblxuYXBwY2FzdC5zdGFydF9zdHJlYW0gPSAoIG1vdW50X3BvaW50LCBkZXZpY2VfbmFtZSApIC0+XG5cbiAgY29uc29sZS5pbmZvIFwiIFNUQVJUIFNUUkFFTSEhIVwiXG5cbiAgaWYgYXBwY2FzdC5nZXQoIFwic3RyZWFtOnN0YXJ0aW5nXCIgKVxuICAgIGNvbnNvbGUuZXJyb3IgXCJ3YWl0aW5nIHN0cmVhbSB0byBzdGFydCwgY2FudCBzdGFydCBhZ2FpblwiXG5cbiAgICByZXR1cm5cblxuICBpZiBhcHBjYXN0LmdldCggXCJzdHJlYW06b25saW5lXCIgKVxuICAgIGNvbnNvbGUuZXJyb3IgXCJzdHJlYW0gaXMgYWxyZWFkeSBvbmxpbmUsIGNhbnQgc3RhcnQgYWdhaW5cIlxuXG4gICAgcmV0dXJuXG5cbiAgcGFzc3dvcmQgICAgPSBcImxvb3BjYXN0MjAxNVwiXG5cbiAgcGF5bG9hZCA9IFxuICAgIGRldmljZV9uYW1lIDogZGV2aWNlX25hbWVcbiAgICBtb3VudF9wb2ludCA6IG1vdW50X3BvaW50XG4gICAgcGFzc3dvcmQgICAgOiBwYXNzd29yZFxuXG4gIGFwcGNhc3Quc2V0IFwic3RyZWFtOnN0YXJ0aW5nXCIsIHRydWVcbiAgYXBwY2FzdC5tZXNzYWdlcy5zZW5kIEpTT04uc3RyaW5naWZ5IFsgXCJzdGFydF9zdHJlYW1cIiwgcGF5bG9hZCBdXG5cbmFwcGNhc3Quc3RvcF9zdHJlYW0gPSAtPlxuXG4gIGFwcGNhc3Quc2V0IFwic3RyZWFtOnN0b3BwaW5nXCIsIHRydWVcbiAgYXBwY2FzdC5tZXNzYWdlcy5zZW5kIEpTT04uc3RyaW5naWZ5IFsgXCJzdG9wX3N0cmVhbVwiIF1cblxuXG4jIyNcbiMgY2FsbGJhY2tzIGFyZSBjYWxsZWQgYnkgXCJtZXNzYWdlc1wiIGNvbWluZyBmcm9tIHRoZSBXZWJzb2NrZXRTZXJ2ZXIgY3JlYXRlZFxuIyBieSB0aGUgZGVza3RvcCBhcHBsaWNhdGlvbiBBcHBDYXN0XG4jIyNcbmFwcGNhc3QuY2FsbGJhY2tzID1cbiAgaW5wdXRfZGV2aWNlcyAgOiAoIGFyZ3MgKSAtPlxuXG4gICAgIyBjb25zb2xlLmxvZyBcIisgc29ja2V0IGNvbnRyb2xsciBnb3QgaW5wdXQgZGV2aWNlc1wiLCBhcmdzLmRldmljZXNcblxuICAgICMgc2F2ZXMgbGlzdCBvZiBkZXZpY2VzIGFuZCBicm9hZGNhc3QgY2hhbmdlXG4gICAgYXBwY2FzdC5zZXQgJ2lucHV0X2RldmljZXMnLCBhcmdzLmRldmljZXNcblxuICAgICMgYXV0b21hdGljYWx5IHRlc3Rpbmcgc3RyZWFtXG4gICAgIyBhcHBjYXN0LnN0YXJ0X3N0cmVhbSBcIlNvdW5kZmxvd2VyICgyY2gpXCJcblxuICBzdHJlYW1fc3RhcnRlZCA6ICggYXJncyApIC0+XG5cbiAgICBpZiBhcmdzPyBhbmQgYXJncy5lcnJvcj9cblxuICAgICAgY29uc29sZS5lcnJvciBcIi0gc3RyZWFtX3N0YXJ0ZWQgZXJyb3I6XCIsIGFyZ3MuZXJyb3JcblxuICAgICAgYXBwY2FzdC5zZXQgXCJzdHJlYW06ZXJyb3JcIiwgYXJncy5lcnJvclxuXG4gICAgICByZXR1cm5cblxuICAgIGNvbnNvbGUuaW5mbyBcIkFQUENBU1QgUkVQTElFRDogU1RSRUFNIFNUQVJURUQhXCJcblxuICAgICMgc2F2ZSBjdXJyZW50IHN0cmVhbTpvbmxpbmUgc3RhdHVzXG4gICAgYXBwY2FzdC5zZXQgJ3N0cmVhbTpvbmxpbmUnLCB0cnVlXG5cbiAgICAjIHJlc2V0IG90aGVyIHN0cmFtaW5nIGZsYWdzXG4gICAgYXBwY2FzdC5zZXQgXCJzdHJlYW06c3RhcnRpbmdcIiwgbnVsbFxuICAgIGFwcGNhc3Quc2V0IFwic3RyZWFtOmVycm9yXCIgICAsIG51bGxcblxuICBzdHJlYW1fc3RvcHBlZDogLT5cblxuICAgICMgc2F2ZSBjdXJyZW50IHN0cmVhbTpvbmxpbmUgc3RhdHVzXG4gICAgYXBwY2FzdC5zZXQgJ3N0cmVhbTpvbmxpbmUnICAsIGZhbHNlXG4gICAgYXBwY2FzdC5zZXQgXCJzdHJlYW06c3RvcHBpbmdcIiwgbnVsbFxuXG4jIyNcbiMgTGlzdGVuaW5nIHRvIG1lc3NhZ2VzXG4jIyNcbmFwcGNhc3Qub24gJ2lucHV0X2RldmljZScsIC0+XG5cbiAgaWYgYXBwY2FzdC5nZXQgJ3N0cmVhbTpvbmxpbmUnXG4gICAgY29uc29sZS5lcnJvciAnLSBpbnB1dCBkZXZpY2UgY2hhbmdlZCB3aGlsZSBzdHJlYW06b25saW5lJ1xuICAgIGNvbnNvbGUuZXJyb3IgJz8gd2hhdCBzaG91bGQgd2UgZG8nXG5cbiMgc2hvdWxkIHRyeSB0byBjb25uZWN0IG9ubHkgb24gaXQncyBvd24gcHJvZmlsZSBwYWdlXG4jIGFwcGNhc3QuY29ubmVjdCgpXG5cbm1vZHVsZS5leHBvcnRzID0gd2luZG93LmFwcGNhc3QgPSBhcHBjYXN0Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Q0FBQTtDQUFBLEdBQUEsd0JBQUE7O0FBSUEsQ0FKQSxFQUlXLEVBQVgsRUFBVzs7QUFFWCxDQU5BLEVBTVUsSUFBQSxNQUFBOztBQUdWLENBVEEsQ0FTVSxDQUFBLEVBQUEsRUFBVjs7QUFHQSxDQVpBLEVBWVksQ0FBb0IsRUFBZCxHQUFsQjs7QUFHQSxDQWZBLENBQUEsQ0FlbUIsSUFBWixDQUFQOztBQUNBLENBaEJBLENBZ0JBLENBQW1CLElBQVo7O0FBR1AsQ0FuQkEsQ0FtQnlCLENBQXpCLEVBQUEsRUFBTyxJQUFQOztBQUVBLENBckJBLEVBcUJrQixJQUFYLEVBQVc7Q0FFaEIsS0FBQSxvQkFBQTtBQUFPLENBQVAsQ0FBQSxFQUFHLEtBQUg7Q0FDRSxHQUFPLEdBQU8sSUFBUCx1QkFBQTtJQURUO0NBQUEsQ0FHQSxDQUFrQixZQUFsQix5QkFIQTtDQUFBLENBS0EsQ0FBdUIsQ0FBQSxHQUFoQixDQUFQLE9BQXVCLE1BQUE7Q0FMdkIsQ0FPQSxDQUEwQixHQUExQixDQUFPLENBQVMsQ0FBVTtDQUN4QixHQUFBLEdBQU8sZ0NBQVA7Q0FBQSxDQUV5QixDQUF6QixDQUFBLEdBQU8sSUFBUDtDQUVRLEdBQVIsR0FBTyxDQUFTLENBQU0sRUFBdEIsUUFBcUM7Q0FadkMsRUFPMEI7Q0FQMUIsQ0FjQSxDQUEyQixJQUFwQixDQUFTLENBQVc7Q0FDekIsR0FBQSxHQUFPLHFDQUFQO0NBRVEsQ0FBaUIsQ0FBekIsRUFBQSxFQUFPLElBQVA7Q0FqQkYsRUFjMkI7Q0FkM0IsQ0FxQkEsQ0FBNkIsSUFBdEIsQ0FBUyxDQUFoQjtDQUVFLE9BQUEsNEJBQUE7Q0FBQSxFQUFPLENBQVA7Q0FFQTtDQUNFLEVBQVksQ0FBSSxDQUFKLENBQVosR0FBQTtNQURGO0NBR0UsS0FESTtDQUNKLElBQUEsQ0FBQSxDQUFPLGlDQUFQO0NBQUEsSUFDQSxDQUFBLENBQU87Q0FDUCxJQUFBLFFBQU87TUFQVDtDQUFBLEVBU1MsQ0FBVCxFQUFBLEdBQW1CO0NBVG5CLEVBVVMsQ0FBVCxLQUFtQjtDQUVuQixHQUFBLENBQWMsQ0FBZCxDQUFHO0NBQ0QsQ0FBNEIsQ0FBckIsQ0FBQSxHQUFPLE1BQVA7TUFiVDtBQWVHLENBQUgsR0FBQSxDQUF1QyxDQUFwQyxDQUFjLEVBQVcsQ0FBNUI7Q0FDVSxHQUFSLEVBQWtCLENBQVgsRUFBVyxJQUFsQjtNQURGO0NBR1UsQ0FBaUQsQ0FBekQsR0FBQSxDQUFPLE1BQVAsOEJBQUE7TUFwQnlCO0NBckI3QixFQXFCNkI7Q0FyQjdCLENBNkNBLENBQVksTUFBWix5QkE3Q0E7Q0FBQSxDQThDQSxDQUFpQixDQUFBLEdBQVYsRUFBVSxZQUFBO0NBOUNqQixDQWdEQSxDQUFvQixHQUFwQixDQUFPLEVBQWE7Q0FDbEIsR0FBQSxHQUFPLHdCQUFQO0NBRVEsQ0FBb0IsQ0FBNUIsQ0FBQSxHQUFPLElBQVAsR0FBQTtDQW5ERixFQWdEb0I7Q0FoRHBCLENBcURBLENBQXFCLElBQWQsRUFBYztDQUNuQixHQUFBLEdBQU8sd0JBQVA7Q0FFUSxDQUFvQixDQUE1QixFQUFBLEVBQU8sSUFBUCxHQUFBO0NBeERGLEVBcURxQjtDQU1iLENBQUUsQ0FBYSxJQUFoQixFQUFQO0NBRUUsS0FBQSxFQUFBO0FBQVMsQ0FBVCxFQUFTLENBQVQsRUFBQSxJQUFBO0NBQUEsRUFFZ0IsQ0FBaEIsRUFBTSxHQUFZO0NBQ2hCLEtBQUEsSUFBQTtDQUFBLEVBQWEsQ0FBQSxFQUFiLE1BQWE7Q0FFTCxDQUFpQixDQUF6QixHQUFBLENBQU8sSUFBUCxFQUFBO0NBTEYsSUFFZ0I7Q0FLVCxHQUFQLEVBQU0sS0FBTixNQUFBO0NBdEVjLEVBNkRPO0NBN0RQOztBQXdFbEIsQ0E3RkEsQ0E2RnNDLENBQWYsSUFBaEIsRUFBa0IsRUFBRixDQUF2QjtDQUVFLEtBQUEsV0FBQTtDQUFBLENBQUEsRUFBQSxHQUFPLFdBQVA7Q0FFQSxDQUFBLENBQUcsQ0FBQSxHQUFPLFVBQVA7Q0FDRCxHQUFBLENBQUEsRUFBTyxvQ0FBUDtDQUVBLFNBQUE7SUFMRjtDQU9BLENBQUEsQ0FBRyxDQUFBLEdBQU8sUUFBUDtDQUNELEdBQUEsQ0FBQSxFQUFPLHFDQUFQO0NBRUEsU0FBQTtJQVZGO0NBQUEsQ0FZQSxDQUFjLEtBQWQsTUFaQTtDQUFBLENBY0EsQ0FDRSxJQURGO0NBQ0UsQ0FBYyxFQUFkLE9BQUE7Q0FBQSxDQUNjLEVBQWQsT0FBQTtDQURBLENBRWMsRUFBZCxJQUFBO0NBakJGLEdBQUE7Q0FBQSxDQW1CQSxDQUFBLENBQUEsR0FBTyxVQUFQO0NBQ1EsQ0FBK0MsRUFBdkQsR0FBTyxDQUFTLENBQWhCLEtBQXFDO0NBdEJoQjs7QUF3QnZCLENBckhBLEVBcUhzQixJQUFmLEVBQWUsRUFBdEI7Q0FFRSxDQUFBLENBQUEsQ0FBQSxHQUFPLFVBQVA7Q0FDUSxHQUFSLEdBQU8sQ0FBUyxDQUFoQixJQUFxQztDQUhqQjs7Q0FNdEI7Ozs7Q0EzSEE7O0FBK0hBLENBL0hBLEVBZ0lFLElBREssRUFBUDtDQUNFLENBQUEsQ0FBaUIsQ0FBQSxLQUFFLElBQW5CO0NBS1UsQ0FBcUIsQ0FBN0IsQ0FBaUMsR0FBMUIsSUFBUCxJQUFBO0NBTEYsRUFBaUI7Q0FBakIsQ0FVQSxDQUFpQixDQUFBLEtBQUUsS0FBbkI7Q0FFRSxHQUFBLFVBQUcsTUFBSDtDQUVFLENBQXlDLEVBQUksQ0FBN0MsQ0FBQSxDQUFPLGtCQUFQO0NBQUEsQ0FFNEIsQ0FBNUIsQ0FBZ0MsQ0FBaEMsQ0FBQSxDQUFPLE9BQVA7Q0FFQSxXQUFBO01BTkY7Q0FBQSxHQVFBLEdBQU8sMkJBQVA7Q0FSQSxDQVc2QixDQUE3QixDQUFBLEdBQU8sUUFBUDtDQVhBLENBYytCLENBQS9CLENBQUEsR0FBTyxVQUFQO0NBQ1EsQ0FBdUIsQ0FBL0IsQ0FBQSxHQUFPLElBQVAsR0FBQTtDQTNCRixFQVVpQjtDQVZqQixDQTZCQSxDQUFnQixNQUFBLEtBQWhCO0NBR0UsQ0FBK0IsQ0FBL0IsQ0FBQSxDQUFBLEVBQU8sUUFBUDtDQUNRLENBQXVCLENBQS9CLENBQUEsR0FBTyxJQUFQLE1BQUE7Q0FqQ0YsRUE2QmdCO0NBN0psQixDQUFBOztDQW1LQTs7O0NBbktBOztBQXNLQSxDQXRLQSxDQXNLQSxDQUEyQixJQUFwQixFQUFvQixLQUEzQjtDQUVFLENBQUEsQ0FBRyxDQUFBLEdBQU8sUUFBUDtDQUNELEdBQUEsQ0FBQSxFQUFPLHFDQUFQO0NBQ1EsSUFBUixFQUFPLElBQVAsVUFBQTtJQUp1QjtDQUFBOztBQVMzQixDQS9LQSxFQStLaUIsR0FBWCxDQUFOIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjEwMjgwLCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvY29udHJvbGxlcnMvY2xvdWRpbmFyeS5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgQ2xvdWRpbmFyeVxuXHRpbnN0YW5jZSA9IG51bGxcblxuXHRjb25maWc6IFxuXHRcdGNsb3VkX25hbWU6IFwiXCJcblx0XHRhcGlfa2V5OiBcIlwiXG5cblxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRpZiBDbG91ZGluYXJ5Lmluc3RhbmNlXG5cdFx0XHRjb25zb2xlLmVycm9yIFwiWW91IGNhbid0IGluc3RhbnRpYXRlIHRoaXMgQ2xvdWRpbmFyeSB0d2ljZVwiXHRcblx0XHRcdHJldHVyblxuXG5cdFx0Q2xvdWRpbmFyeS5pbnN0YW5jZSA9IEBcblxuXHRzZXRfY29uZmlnOiAoIGRhdGEgKSAtPlxuXG5cdFx0IyBpZiBkYXRhIGlzIGRpZmZlcmVudCBmcm9tIHRoZSBjdXJyZW50IGNvbmZpZywgdXBkYXRlIGl0XG5cdFx0aWYgQGNvbmZpZy5jbG91ZF9uYW1lIGlzbnQgZGF0YS5jbG91ZF9uYW1lIG9yIEBjb25maWcuYXBpX2tleSBpc250IGRhdGEuYXBpX2tleVxuXHRcdFx0IyBVcGRhdGUgdGhlIGludGVybmFsIG9iamVjdFxuXHRcdFx0QGNvbmZpZyA9IGRhdGFcblxuXHRcdFx0IyBVcGRhdGUgdGhlIGpRdWVyeSBwbHVnaW4gY29uZmlnXG5cdFx0XHQkLmNsb3VkaW5hcnkuY29uZmlnXG5cdFx0XHRcdGNsb3VkX25hbWU6IEBjb25maWcuY2xvdWRfbmFtZSBcblx0XHRcdFx0YXBpX2tleSAgIDogQGNvbmZpZy5hcGlfa2V5XG5cblxuIyB3aWxsIGFsd2F5cyBleHBvcnQgdGhlIHNhbWUgaW5zdGFuY2Vcbm1vZHVsZS5leHBvcnRzID0gbmV3IENsb3VkaW5hcnlcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLE1BQUE7O0FBQU0sQ0FBTjtDQUNDLEtBQUEsRUFBQTs7Q0FBQSxDQUFBLENBQVcsQ0FBWCxJQUFBOztDQUFBLEVBR0MsR0FERDtDQUNDLENBQVksRUFBWixNQUFBO0NBQUEsQ0FDUyxFQUFULEdBQUE7Q0FKRCxHQUFBOztDQU9hLENBQUEsQ0FBQSxpQkFBQTtDQUNaLEdBQUEsSUFBQSxFQUFhO0NBQ1osSUFBQSxDQUFBLENBQU8sc0NBQVA7Q0FDQSxXQUFBO01BRkQ7Q0FBQSxFQUlzQixDQUF0QixJQUFBLEVBQVU7Q0FaWCxFQU9hOztDQVBiLEVBY1ksQ0FBQSxLQUFFLENBQWQ7Q0FHQyxHQUFBLENBQTJCLENBQWpCLENBQW9DLEdBQTNDO0NBRUYsRUFBVSxDQUFULEVBQUQ7Q0FHQyxLQUFELElBQVksR0FBWjtDQUNDLENBQVksRUFBQyxFQUFNLEVBQW5CLEVBQUE7Q0FBQSxDQUNZLEVBQUMsRUFBTSxDQUFuQixDQUFBO0NBUEYsT0FLQztNQVJVO0NBZFosRUFjWTs7Q0FkWjs7Q0FERDs7QUE2QkEsQ0E3QkEsRUE2QmlCLEdBQVgsQ0FBTixHQTdCQSJ9fSx7Im9mZnNldCI6eyJsaW5lIjoxMDMxOCwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL2NvbnRyb2xsZXJzL2d1aS5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiV2F0Y2hKUyA9IHJlcXVpcmUgJ3dhdGNoanMnXG53YXRjaCA9IFdhdGNoSlMud2F0Y2hcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBHVUlcbiAgb3BlbmVkOiBmYWxzZVxuICB1c2Vfa2V5czogdHJ1ZVxuICB1c2VfY2xpY2s6IGZhbHNlXG4gIHRvZ2dsZV9rZXk6IDY4XG5cbiAgY29uc3RydWN0b3I6IC0+XG4gICAgaHRtbCA9IHJlcXVpcmUgJ3RlbXBsYXRlcy9kZWJ1Zy9ndWknXG5cbiAgICAkKCAnYm9keScgKS5hcHBlbmQgaHRtbCgpXG5cbiAgICBAZG9tID0gJCggJyNndWknIClcbiAgICBAY29udGVudCA9IEBkb20uZmluZCAnLmNvbnRlbnQnXG5cbiAgICBpZiBAdXNlX2NsaWNrXG4gICAgICBAZG9tLmFkZENsYXNzKCAnY2xpY2thYmxlJyApLm9uICdjbGljaycsIEB0b2dnbGVcblxuICAgIGlmIEB1c2Vfa2V5c1xuICAgICAgJCh3aW5kb3cpLm9uICdrZXl1cCcsIEBvbl9rZXlfcHJlc3NlZFxuXG4gIG9uX2tleV9wcmVzc2VkOiAoIGUgKSA9PlxuICAgIGlmIGUua2V5Q29kZSBpcyBAdG9nZ2xlX2tleVxuICAgICAgQHRvZ2dsZSgpXG5cbiAgdG9nZ2xlOiA9PlxuICAgIGlmIEBvcGVuZWRcbiAgICAgIEBjbG9zZSgpXG4gICAgZWxzZVxuICAgICAgQG9wZW4oKVxuXG4gIGNsb3NlIDogLT5cbiAgICByZXR1cm4gaWYgbm90IEBvcGVuZWRcbiAgICBAb3BlbmVkID0gZmFsc2VcbiAgICBAZG9tLmFkZENsYXNzICdjbG9zZWQnXG5cbiAgb3BlbjogLT5cbiAgICByZXR1cm4gaWYgQG9wZW5lZFxuICAgIEBvcGVuZWQgPSB0cnVlXG4gICAgQGRvbS5yZW1vdmVDbGFzcyAnY2xvc2VkJ1xuXG4gIHdhdGNoOiAoIG9iaiApIC0+XG5cbiAgICBAb2JqID0galF1ZXJ5LmV4dGVuZCh0cnVlLCB7fSwgb2JqKTtcbiAgICAjIEBwcmludCBvYmpcbiAgICB3YXRjaCBAb2JqLCBAcmVmcmVzaFxuXG4gICAgQHJlZnJlc2goKVxuXG4gIHJlZnJlc2g6ID0+XG4gICAgaHRtbCA9IEBwcmludCggSlNPTi5zdHJpbmdpZnkoQG9iaiwgdW5kZWZpbmVkLCA0KSApXG4gICAgQGNvbnRlbnQuaHRtbCBodG1sXG5cbiAgcHJpbnQgOiAoIG9iaiApIC0+XG4gICAganNvbiA9IG9iai5yZXBsYWNlKC8mL2csICcmYW1wOycpLnJlcGxhY2UoLzwvZywgJyZsdDsnKS5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICBqc29uLnJlcGxhY2UgLyhcIihcXFxcdVthLXpBLVowLTldezR9fFxcXFxbXnVdfFteXFxcXFwiXSkqXCIoXFxzKjopP3xcXGIodHJ1ZXxmYWxzZXxudWxsKVxcYnwtP1xcZCsoPzpcXC5cXGQqKT8oPzpbZUVdWytcXC1dP1xcZCspPykvZywgKG1hdGNoKSAtPlxuICAgICAgY2xzID0gJ251bWJlcidcbiAgICAgIGlmIC9eXCIvLnRlc3QobWF0Y2gpXG4gICAgICAgIGlmIC86JC8udGVzdChtYXRjaClcbiAgICAgICAgICBjbHMgPSAna2V5J1xuICAgICAgICBlbHNlXG4gICAgICAgICAgY2xzID0gJ3N0cmluZydcbiAgICAgIGVsc2UgaWYgL3RydWV8ZmFsc2UvLnRlc3QobWF0Y2gpXG4gICAgICAgIGNscyA9ICdib29sZWFuJ1xuICAgICAgZWxzZSBpZiAvbnVsbC8udGVzdChtYXRjaClcbiAgICAgICAgY2xzID0gJ251bGwnXG4gICAgICAnPHNwYW4gY2xhc3M9XCInICsgY2xzICsgJ1wiPicgKyBtYXRjaCArICc8L3NwYW4+J1xuXG4gICAgXG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxlQUFBO0dBQUEsK0VBQUE7O0FBQUEsQ0FBQSxFQUFVLElBQVYsRUFBVTs7QUFDVixDQURBLEVBQ1EsRUFBUixFQUFlOztBQUVmLENBSEEsRUFHdUIsR0FBakIsQ0FBTjtDQUNFLEVBQVEsRUFBUixDQUFBOztDQUFBLEVBQ1UsQ0FEVixJQUNBOztDQURBLEVBRVcsRUFGWCxJQUVBOztDQUZBLENBQUEsQ0FHWSxPQUFaOztDQUVhLENBQUEsQ0FBQSxVQUFBO0NBQ1gsd0NBQUE7Q0FBQSxzQ0FBQTtDQUFBLHNEQUFBO0NBQUEsR0FBQSxJQUFBO0NBQUEsRUFBTyxDQUFQLEdBQU8sY0FBQTtDQUFQLEdBRUEsRUFBQTtDQUZBLEVBSUEsQ0FBQSxFQUFPO0NBSlAsRUFLVyxDQUFYLEdBQUEsR0FBVztDQUVYLEdBQUEsS0FBQTtDQUNFLENBQUEsQ0FBSSxDQUFILEVBQUQsQ0FBQSxDQUFBLEdBQUE7TUFSRjtDQVVBLEdBQUEsSUFBQTtDQUNFLENBQUEsRUFBdUIsRUFBdkIsQ0FBQSxPQUFBO01BWlM7Q0FMYixFQUthOztDQUxiLEVBbUJnQixNQUFFLEtBQWxCO0NBQ0UsR0FBQSxDQUFnQixFQUFiLEdBQUg7Q0FDRyxHQUFBLEVBQUQsT0FBQTtNQUZZO0NBbkJoQixFQW1CZ0I7O0NBbkJoQixFQXVCUSxHQUFSLEdBQVE7Q0FDTixHQUFBLEVBQUE7Q0FDRyxHQUFBLENBQUQsUUFBQTtNQURGO0NBR0csR0FBQSxTQUFEO01BSkk7Q0F2QlIsRUF1QlE7O0NBdkJSLEVBNkJRLEVBQVIsSUFBUTtBQUNRLENBQWQsR0FBQSxFQUFBO0NBQUEsV0FBQTtNQUFBO0NBQUEsRUFDVSxDQUFWLENBREEsQ0FDQTtDQUNDLEVBQUcsQ0FBSCxJQUFELEdBQUE7Q0FoQ0YsRUE2QlE7O0NBN0JSLEVBa0NNLENBQU4sS0FBTTtDQUNKLEdBQUEsRUFBQTtDQUFBLFdBQUE7TUFBQTtDQUFBLEVBQ1UsQ0FBVixFQUFBO0NBQ0MsRUFBRyxDQUFILElBQUQsR0FBQTtDQXJDRixFQWtDTTs7Q0FsQ04sRUF1Q08sRUFBUCxJQUFTO0NBRVAsQ0FBMkIsQ0FBM0IsQ0FBQSxFQUFhO0NBQWIsQ0FFWSxDQUFaLENBQUEsQ0FBQSxFQUFBO0NBRUMsR0FBQSxHQUFELElBQUE7Q0E3Q0YsRUF1Q087O0NBdkNQLEVBK0NTLElBQVQsRUFBUztDQUNQLEdBQUEsSUFBQTtDQUFBLENBQW9DLENBQTdCLENBQVAsQ0FBTyxDQUFRLEdBQUE7Q0FDZCxHQUFBLEdBQU8sSUFBUjtDQWpERixFQStDUzs7Q0EvQ1QsRUFtRFEsRUFBUixJQUFVO0NBQ1IsR0FBQSxJQUFBO0NBQUEsQ0FBeUIsQ0FBbEIsQ0FBUCxFQUFPLENBQUE7Q0FDRixDQUFrSCxDQUFBLENBQW5ILENBQW1ILEVBQXZILEVBQXdILEVBQXhILDZGQUFBO0NBQ0UsRUFBQSxPQUFBO0NBQUEsRUFBQSxHQUFBLEVBQUE7Q0FDQSxHQUFHLENBQUEsQ0FBSDtDQUNFLEdBQUcsQ0FBQSxHQUFIO0NBQ0UsRUFBQSxFQUFBLEtBQUE7TUFERixJQUFBO0NBR0UsRUFBQSxLQUFBLEVBQUE7VUFKSjtDQUtxQixHQUFiLENBQUEsQ0FMUixFQUFBLElBS29CO0NBQ2xCLEVBQUEsS0FBQSxDQUFBO0NBQ2EsR0FBUCxDQUFBLENBUFIsRUFBQTtDQVFFLEVBQUEsR0FBQSxFQUFBO1FBVEY7Q0FEcUgsRUFXbkcsQ0FBbEIsQ0FBQSxRQUFBLEVBQUE7Q0FYRixJQUF1SDtDQXJEekgsRUFtRFE7O0NBbkRSOztDQUpGIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjEwNDIwLCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvY29udHJvbGxlcnMvbG9jYWxfY29ubmVjdGlvbi5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4jXG4jIENvbnRyb2xsZXIgcmVzcG9uc2libGUgZm9yIGNvbW11bmljYXRpb24gd2l0aCBvdGhlciBpbnN0YW5jZXMgb2YgdGhlIGFwcFxuIyBmb3IgaW5zdGFuY2UgYW5vdGhlciB0YWIgb3IgcG9wIHVwIG9wZW5cbiNcbiMgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9qZXJlbXloYXJyaXMvTG9jYWxDb25uZWN0aW9uLmpzL3RyZWUvbWFzdGVyXG4jIGZvcmUgbW9yZSBpbmZvcm1hdGlvbiwgZm9yIGluc3RhbmNlIGludGVncmF0aW9uIHdpdGggSUU5XG4jXG4jIyNcblxuYXBwID0gcmVxdWlyZSAnYXBwL2FwcCdcblxuY29ubmVjdGlvbiA9IG5ldyBMb2NhbENvbm5lY3Rpb24gJ2JldGEubG9vcGNhc3QuZm0nXG5jb25uZWN0aW9uLmxpc3RlbigpXG5cbmNvbm5lY3Rpb24uYWRkQ2FsbGJhY2sgJ2xvZ2luJywgKCB1c2VyICkgLT5cblxuICBjb25zb2xlLmluZm8gJyArIGxvY2F0aW9uIGNvbm5lY3Rpb24sIHVzZXIgbG9nZ2VkIGluOicsIHVzZXJcblxuICBhcHAubG9naW4gdXNlclxuXG5jb25uZWN0aW9uLmFkZENhbGxiYWNrICdsb2dvdXQnLCAtPlxuXG4gIGNvbnNvbGUuaW5mbyAnICsgbG9jYXRpb24gY29ubmVjdGlvbiwgdXNlciBsb2dnZWQgb3V0J1xuXG4gIGFwcC5sb2dvdXQoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbm5lY3Rpb24iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztDQUFBO0NBQUEsR0FBQSxXQUFBOztBQVVBLENBVkEsRUFVQSxJQUFNLEVBQUE7O0FBRU4sQ0FaQSxFQVlpQixDQUFBLE1BQWpCLEtBQWlCLEdBQUE7O0FBQ2pCLENBYkEsS0FhQSxJQUFVOztBQUVWLENBZkEsQ0FlZ0MsQ0FBQSxDQUFBLEdBQWhDLEVBQWtDLENBQXhCLENBQVY7Q0FFRSxDQUFBLEVBQUEsR0FBTyxrQ0FBUDtDQUVJLEVBQUQsQ0FBSCxDQUFBLElBQUE7Q0FKOEI7O0FBTWhDLENBckJBLENBcUJpQyxDQUFBLEtBQWpDLENBQWlDLENBQXZCLENBQVY7Q0FFRSxDQUFBLEVBQUEsR0FBTyxrQ0FBUDtDQUVJLEVBQUQsR0FBSCxHQUFBO0NBSitCOztBQU1qQyxDQTNCQSxFQTJCaUIsR0FBWCxDQUFOLEdBM0JBIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjEwNDUyLCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvY29udHJvbGxlcnMvbmF2aWdhdGlvbi5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsic2V0dGluZ3MgIFx0PSByZXF1aXJlICdhcHAvdXRpbHMvc2V0dGluZ3MnXG5oYXBwZW5zICBcdD0gcmVxdWlyZSAnaGFwcGVucydcbiMgd2F5cyAgICBcdD0gcmVxdWlyZSAnd2F5cydcbiMgd2F5cy51c2UgcmVxdWlyZSAnd2F5cy1icm93c2VyJ1xudXJsX3BhcnNlciA9IHJlcXVpcmUgJ2FwcC91dGlscy91cmxfcGFyc2VyJ1xucGFnZSA9IHJlcXVpcmUgJ3BhZ2UnXG5cbmNsYXNzIE5hdmlnYXRpb25cblxuXHRpbnN0YW5jZSA9IG51bGxcblx0Zmlyc3RfbG9hZGluZzogb25cblx0Zmlyc3RfdXJsX2NoYW5nZTogdHJ1ZVxuXHRmaXJzdF9zYW1lX3BhdGg6IHRydWVcblxuXHRjb25zdHJ1Y3RvcjogLT5cblxuXHRcdGlmIE5hdmlnYXRpb24uaW5zdGFuY2Vcblx0XHRcdGNvbnNvbGUuZXJyb3IgXCJZb3UgY2FuJ3QgaW5zdGFudGlhdGUgdGhpcyBOYXZpZ2F0aW9uIHR3aWNlXCJcdFxuXG5cdFx0XHRyZXR1cm5cblxuXHRcdE5hdmlnYXRpb24uaW5zdGFuY2UgPSBAXG5cdFx0QGNvbnRlbnRfc2VsZWN0b3IgPSAnI2NvbnRlbnQgLmlubmVyX2NvbnRlbnQnXG5cdFx0QGNvbnRlbnRfZGl2ID0gJCBAY29udGVudF9zZWxlY3RvclxuXG5cdFx0aGFwcGVucyBAXG5cdFx0XG5cdFx0IyByb3V0aW5nXG5cdFx0cGFnZSAnKicsIEB1cmxfY2hhbmdlZFxuXHRcdHBhZ2UoKTtcblx0XHQjIHdheXMgJyonLCBAdXJsX2NoYW5nZWRcblxuXG5cdFx0IyBGb3IgdGhlIGZpcnN0IHNjcmVlbiwgZW1pdCB0aGUgZXZlbnQgYWZ0ZXJfcmVuZGVyLlxuXHRcdCMgaWYsIGluIHRoZSBtZWFudGltZSwgdGhlIG5hdmlnYXRpb24gZ29lcyB0byBhbm90aGVyIHVybFxuXHRcdCMgd2Ugd29uJ3QgZW1pdCB0aGlzIGZpcnN0IGV2ZW50LlxuXHRcdGRlbGF5IDIwMCwgPT5cblx0XHRcdGlmIEBmaXJzdF9sb2FkaW5nIHRoZW4gQGVtaXQgJ2FmdGVyX3JlbmRlcidcblxuXG5cdHVybF9jaGFuZ2VkOiAoIHJlcSApID0+XG5cblx0XHRpZiBAZmlyc3RfdXJsX2NoYW5nZVxuXHRcdFx0QGZpcnN0X3VybF9jaGFuZ2UgPSBvZmZcblx0XHRcdHJldHVyblxuXG5cdFx0aWYgcmVxLnBhdGggaXMgbG9jYXRpb24ucGF0aG5hbWVcblx0XHRcdGlmIEBmaXJzdF9zYW1lX3BhdGhcblx0XHRcdFx0QGZpcnN0X3NhbWVfcGF0aCA9IGZhbHNlXG5cdFx0XHRcdGxvZyBcIltOYXZpZ2F0aW9uXSByZXR1cm4gc2FtZSBwYXRoIFwiXG5cdFx0XHRcdCMgcmV0dXJuXG5cblx0XHQjIGllIGhhY2sgZm9yIGhhc2ggdXJsc1xuXHRcdHJlcS51cmwgPSByZXEucGF0aC5yZXBsYWNlKCBcIi8jXCIsICcnIClcblxuXHRcdCMgbG9nIFwiIGNvbnRyb2xsZXJzL25hdmlnYXRpb24vdXJsX2NoYW5nZWQ6OiAje3JlcS51cmx9XCJcblx0XHQjIFRPRE86IFxuXHRcdCMgIC0gZG9uJ3QgcmVsb2FkIGlmIHRoZSBjb250ZW50IGlzIGFscmVhZHkgbG9hZGVkXG5cdFx0IyAgLSBpbXBsZW1lbnQgdHJhbnNpdGlvbnMgb3V0XG5cdFx0IyAgLSBpbXBsZW1lbnQgdHJhbnNpdGlvbiAgaW4gXG5cblx0XHRkaXYgPSAkKCAnPGRpdj4nIClcblxuXHRcdEBlbWl0ICdiZWZvcmVfbG9hZCdcblxuXHRcdGRpdi5sb2FkIHJlcS51cmwsID0+XG5cblx0XHRcdEBlbWl0ICdvbl9sb2FkJ1xuXG5cdFx0XHRpZiBhcHAuYm9keS5zY3JvbGxUb3AoKSA+IDBcblx0XHRcdFx0YXBwLmJvZHkuYW5pbWF0ZSBzY3JvbGxUb3A6IDBcblxuXG5cdFx0XHRAZW1pdCAnYmVmb3JlX2Rlc3Ryb3knXHRcdFxuXG5cdFx0XHRkZWxheSA0MDAsID0+XHRcdFx0XG5cblx0XHRcdFx0bmV3X2NvbnRlbnQgPSBkaXYuZmluZCggQGNvbnRlbnRfc2VsZWN0b3IgKS5jaGlsZHJlbigpXG5cdFx0XHRcdFxuXHRcdFx0XHRAY29udGVudF9kaXYgPSAkIEBjb250ZW50X3NlbGVjdG9yXG5cblx0XHRcdFx0IyBSZW1vdmUgb2xkIGNvbnRlbnRcblx0XHRcdFx0QGNvbnRlbnRfZGl2LmNoaWxkcmVuKCkucmVtb3ZlKClcblxuXHRcdFx0XHQjIHBvcHVsYXRlIHdpdGggdGhlIGxvYWRlZCBjb250ZW50XG5cdFx0XHRcdEBjb250ZW50X2Rpdi5hcHBlbmQgbmV3X2NvbnRlbnRcblx0XHRcdFx0ZGVsYXkgMTAsID0+IEBlbWl0ICdhZnRlcl9yZW5kZXInXG5cblx0IyNcblx0IyBOYXZpZ2F0ZXMgdG8gYSBnaXZlbiBVUkwgdXNpbmcgSHRtbCA1IGhpc3RvcnkgQVBJXG5cdCMjXG5cdGdvOiAoIHVybCApIC0+XG5cblx0XHQjIElmIGl0J3MgYSBwb3B1cCwgYnlwYXNzIHdheXMgYW5kIHNlYW1sZXNzIG5hdmlnYXRpb25cblx0XHRpZiB3aW5kb3cub3BlbmVyP1xuXHRcdFx0bG9jYXRpb24uaHJlZiA9IHVybFxuXHRcdFx0cmV0dXJuIHRydWVcblxuXHRcdEBmaXJzdF9sb2FkaW5nID0gb2ZmXG5cblx0XHRsb2cgXCJbTmF2aWdhdGVzXSBnb1wiLCB1cmxcblx0XHRwYWdlIHVybFxuXHRcdCMgd2F5cy5nbyB1cmxcblxuXHRcdHJldHVybiBmYWxzZVxuXG5cdGdvX3NpbGVudDogKCB1cmwsIHRpdGxlICkgLT5cblx0XHRwYWdlLnJlcGxhY2UgdXJsLCBudWxsLCBudWxsLCBmYWxzZVxuXHRcdFxuXHQjI1xuXHQjIExvb2tzIGZvciBpbnRlcm5hbCBsaW5rcyBhbmQgYmluZCB0aGVuIHRvIGNsaWVudCBzaWRlIG5hdmlnYXRpb25cblx0IyBhcyBpbjogaHRtbCBIaXN0b3J5IGFwaVxuXHQjI1xuXHRiaW5kOiAoIHNjb3BlID0gJ2JvZHknICkgLT5cblxuXHRcdCQoIHNjb3BlICkuZmluZCggJ2EnICkub24gJ2NsaWNrJywgLT5cblx0XHRcdCRpdGVtID0gJCBAXG5cblx0XHRcdGhyZWYgPSAkaXRlbS5hdHRyICdocmVmJ1xuXG5cdFx0XHRpZiAhaHJlZj8gdGhlbiByZXR1cm4gZmFsc2VcblxuXHRcdFx0IyBpZiB0aGUgbGluayBoYXMgaHR0cCBhbmQgdGhlIGRvbWFpbiBpcyBkaWZmZXJlbnRcblx0XHRcdGlmIGhyZWYuaW5kZXhPZiggJ2h0dHAnICkgPj0gMCBhbmQgaHJlZi5pbmRleE9mKCBkb2N1bWVudC5kb21haW4gKSA8IDAgXG5cdFx0XHRcdHJldHVybiB0cnVlXG5cblx0XHRcdGlmIGhyZWYuaW5kZXhPZiggXCJqYXZhc2NyaXB0XCIgKSBpcyAwIG9yIGhyZWYuaW5kZXhPZiggXCJ0ZWw6XCIgKSBpcyAwXG5cdFx0XHRcdHJldHVybiB0cnVlXG5cblx0XHRcdGlmICRpdGVtLmF0dHIoICd0YXJnZXQnICk/XG5cdFx0XHRcdHJldHVybiB0cnVlXG5cblx0XHRcdGlmIGhyZWYuaW5kZXhPZiggXCIjXCIgKSBpcyAwXG5cdFx0XHRcdHJldHVybiBmYWxzZVxuXG5cdFx0XHQjIENoZWNrIGlmIHRoZSB1cmwgaXMgdGhlIHNhbWVcblx0XHRcdGEgPSB1cmxfcGFyc2VyLmdldF9wYXRobmFtZSBocmVmXG5cdFx0XHRiID0gdXJsX3BhcnNlci5nZXRfcGF0aG5hbWUgbG9jYXRpb24ucGF0aG5hbWVcblx0XHRcdGlmIGEgaXMgYlxuXHRcdFx0XHRyZXR1cm4gZmFsc2UgXG5cblx0XHRcdHJldHVybiBOYXZpZ2F0aW9uLmluc3RhbmNlLmdvIGhyZWZcblxuXG4jIHdpbGwgYWx3YXlzIGV4cG9ydCB0aGUgc2FtZSBpbnN0YW5jZVxubW9kdWxlLmV4cG9ydHMgPSBuZXcgTmF2aWdhdGlvbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLDJDQUFBO0dBQUEsK0VBQUE7O0FBQUEsQ0FBQSxFQUFhLElBQUEsQ0FBYixZQUFhOztBQUNiLENBREEsRUFDWSxJQUFaLEVBQVk7O0FBR1osQ0FKQSxFQUlhLElBQUEsR0FBYixZQUFhOztBQUNiLENBTEEsRUFLTyxDQUFQLEVBQU8sQ0FBQTs7QUFFRCxDQVBOO0NBU0MsS0FBQSxFQUFBOztDQUFBLENBQUEsQ0FBVyxDQUFYLElBQUE7O0NBQUEsRUFDZSxDQURmLFNBQ0E7O0NBREEsRUFFa0IsQ0FGbEIsWUFFQTs7Q0FGQSxFQUdpQixDQUhqQixXQUdBOztDQUVhLENBQUEsQ0FBQSxpQkFBQTtDQUVaLGdEQUFBO0NBQUEsT0FBQSxJQUFBO0NBQUEsR0FBQSxJQUFBLEVBQWE7Q0FDWixJQUFBLENBQUEsQ0FBTyxzQ0FBUDtDQUVBLFdBQUE7TUFIRDtDQUFBLEVBS3NCLENBQXRCLElBQUEsRUFBVTtDQUxWLEVBTW9CLENBQXBCLFlBQUEsU0FOQTtDQUFBLEVBT2UsQ0FBZixPQUFBLEtBQWU7Q0FQZixHQVNBLEdBQUE7Q0FUQSxDQVlVLENBQVYsQ0FBQSxPQUFBO0NBWkEsR0FhQTtDQWJBLENBb0JXLENBQVgsQ0FBQSxDQUFBLElBQVc7Q0FDVixHQUFHLENBQUMsQ0FBSixPQUFBO0NBQXdCLEdBQUQsQ0FBQyxTQUFELENBQUE7UUFEYjtDQUFYLElBQVc7Q0EzQlosRUFLYTs7Q0FMYixFQStCYSxNQUFFLEVBQWY7Q0FFQyxFQUFBLEtBQUE7T0FBQSxLQUFBO0NBQUEsR0FBQSxZQUFBO0NBQ0MsRUFBb0IsQ0FBbkIsQ0FBRCxDQUFBLFVBQUE7Q0FDQSxXQUFBO01BRkQ7Q0FJQSxFQUFNLENBQU4sQ0FBZSxHQUFRO0NBQ3RCLEdBQUcsRUFBSCxTQUFBO0NBQ0MsRUFBbUIsQ0FBbEIsQ0FBRCxHQUFBLE9BQUE7Q0FBQSxFQUNBLEtBQUEsd0JBQUE7UUFIRjtNQUpBO0NBQUEsQ0FXa0MsQ0FBL0IsQ0FBSCxHQUFVO0NBWFYsRUFtQkEsQ0FBQSxHQUFNO0NBbkJOLEdBcUJBLFNBQUE7Q0FFSSxDQUFjLENBQWYsQ0FBSCxLQUFrQixFQUFsQjtDQUVDLEdBQUEsQ0FBQyxDQUFELEdBQUE7Q0FFQSxFQUFNLENBQUgsRUFBSCxHQUFHO0NBQ0YsRUFBRyxDQUFLLEdBQVIsQ0FBQTtDQUFpQixDQUFXLE9BQVgsQ0FBQTtDQUFqQixTQUFBO1FBSEQ7Q0FBQSxHQU1BLENBQUMsQ0FBRCxVQUFBO0NBRU0sQ0FBSyxDQUFYLEVBQUEsSUFBVyxJQUFYO0NBRUMsVUFBQSxDQUFBO0NBQUEsRUFBYyxDQUFBLENBQVcsR0FBekIsR0FBQSxLQUFjO0NBQWQsRUFFZSxFQUFkLEdBQUQsR0FBQSxLQUFlO0NBRmYsSUFLQyxDQUFELEVBQUEsR0FBWTtDQUxaLElBUUMsQ0FBRCxFQUFBLEdBQVk7Q0FDTixDQUFOLENBQVUsRUFBVixJQUFVLE1BQVY7Q0FBYyxHQUFELENBQUMsU0FBRCxHQUFBO0NBQWIsUUFBVTtDQVhYLE1BQVc7Q0FWWixJQUFrQjtDQXhEbkIsRUErQmE7O0NBL0JiLENBa0ZBLENBQUksTUFBRTtDQUdMLEdBQUEsaUJBQUE7Q0FDQyxFQUFnQixDQUFoQixFQUFBLEVBQVE7Q0FDUixHQUFBLFNBQU87TUFGUjtDQUFBLEVBSWlCLENBQWpCLENBSkEsUUFJQTtDQUpBLENBTXNCLENBQXRCLENBQUEsWUFBQTtDQU5BLEVBT0EsQ0FBQTtDQUdBLElBQUEsTUFBTztDQS9GUixFQWtGSTs7Q0FsRkosQ0FpR2tCLENBQVAsRUFBQSxJQUFYO0NBQ00sQ0FBYSxDQUFsQixDQUFJLENBQUosRUFBQSxJQUFBO0NBbEdELEVBaUdXOztDQWpHWCxFQXdHTSxDQUFOLENBQU0sSUFBRTs7R0FBUSxHQUFSO01BRVA7Q0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsRUFBbUMsRUFBbkM7Q0FDQyxTQUFBLE9BQUE7Q0FBQSxFQUFRLENBQUEsQ0FBUixDQUFBO0NBQUEsRUFFTyxDQUFQLENBQVksQ0FBWjtDQUVBLEdBQUksRUFBSixNQUFBO0NBQWUsSUFBQSxVQUFPO1FBSnRCO0NBT0EsRUFBcUUsQ0FBbEUsRUFBSCxDQUFHLENBQXNEO0NBQ3hELEdBQUEsV0FBTztRQVJSO0NBVUEsR0FBRyxDQUFnQyxDQUFuQyxDQUFHLEtBQUE7Q0FDRixHQUFBLFdBQU87UUFYUjtDQWFBLEdBQUcsRUFBSCxzQkFBQTtDQUNDLEdBQUEsV0FBTztRQWRSO0NBZ0JBLEVBQUcsQ0FBQSxDQUF1QixDQUExQixDQUFHO0NBQ0YsSUFBQSxVQUFPO1FBakJSO0NBQUEsRUFvQkksQ0FBQSxFQUFKLElBQWMsRUFBVjtDQXBCSixFQXFCSSxHQUFKLEVBQW9DLEVBQXRCLEVBQVY7Q0FDSixHQUFHLENBQUssQ0FBUjtDQUNDLElBQUEsVUFBTztRQXZCUjtDQXlCQSxDQUFPLEVBQUEsSUFBbUIsRUFBVCxHQUFWO0NBMUJSLElBQW1DO0NBMUdwQyxFQXdHTTs7Q0F4R047O0NBVEQ7O0FBaUpBLENBakpBLEVBaUppQixHQUFYLENBQU4sR0FqSkEifX0seyJvZmZzZXQiOnsibGluZSI6MTA1ODYsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy9jb250cm9sbGVycy9ub3RpZnkuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIiMgJC5ub3RpZnkuZGVmYXVsdHNcbiMgICBhdXRvSGlkZTogZmFsc2VcblxubW9kdWxlLmV4cG9ydHMgPSBcbiAgaW5mbzogKG1zZykgLT5cbiAgICAkLm5vdGlmeSBtc2csICdpbmZvJ1xuXG4gIGVycm9yOiAobXNnKSAtPlxuICAgICQubm90aWZ5IG1zZywgJ2Vycm9yJ1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdBLENBQU8sRUFDTCxHQURJLENBQU47Q0FDRSxDQUFBLENBQU0sQ0FBTixLQUFPO0NBQ0osQ0FBYSxDQUFkLEdBQUEsS0FBQTtDQURGLEVBQU07Q0FBTixDQUdBLENBQU8sRUFBUCxJQUFRO0NBQ0wsQ0FBYSxDQUFkLEdBQUEsQ0FBQSxJQUFBO0NBSkYsRUFHTztDQUpULENBQUEifX0seyJvZmZzZXQiOnsibGluZSI6MTA1OTcsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy9jb250cm9sbGVycy9zdG9yYWdlLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbldyYXBwZXIgY2xhc3MgZm9yIGpTdG9yYWdlXG5odHRwczovL2dpdGh1Yi5jb20vYW5kcmlzOS9qU3RvcmFnZVxuIyMjXG5cblNlc3Npb24gPSB7fVxuXG5TZXNzaW9uLnNldCA9ICgga2V5LCB2YWx1ZSApIC0+XG4gICMgbG9nIFwiW1Nlc3Npb25dIHNldFwiLCBrZXksIHZhbHVlXG4gICQualN0b3JhZ2Uuc2V0IGtleSwgdmFsdWVcblxuU2Vzc2lvbi5nZXQgPSAoa2V5LCBfZGVmYXVsdCA9IGZhbHNlKSAtPlxuICB2YWx1ZSA9ICQualN0b3JhZ2UuZ2V0IGtleSwgX2RlZmF1bHRcbiAgIyBsb2cgXCJbU2Vzc2lvbl0gZ2V0XCIsIGtleSwgdmFsdWVcbiAgdmFsdWVcblxuU2Vzc2lvbi5kZWxldGUgPSAoa2V5KSAtPlxuICBsb2cgXCJbU2Vzc2lvbl0gZGVsZXRlXCIsIGtleVxuICAkLmpTdG9yYWdlLmRlbGV0ZUtleSBrZXlcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFNlc3Npb24iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Q0FBQTtDQUFBLEdBQUEsR0FBQTs7QUFLQSxDQUxBLENBQUEsQ0FLVSxJQUFWOztBQUVBLENBUEEsQ0FPcUIsQ0FBckIsRUFBYyxFQUFQLEVBQVM7Q0FFYixDQUFtQixDQUFwQixFQUFBLEdBQVUsQ0FBVjtDQUZZOztBQUlkLENBWEEsQ0FXb0IsQ0FBcEIsSUFBTyxDQUFPLENBQUM7Q0FDYixJQUFBLENBQUE7O0dBRDZCLENBQVg7SUFDbEI7Q0FBQSxDQUFBLENBQVEsRUFBUixHQUFrQjtDQUROLFFBR1o7Q0FIWTs7QUFLZCxDQWhCQSxFQWdCaUIsSUFBVixDQUFBLENBQVc7Q0FDaEIsQ0FBQSxDQUFBLGVBQUE7Q0FDQyxFQUFELEtBQVUsQ0FBVjtDQUZlOztBQUtqQixDQXJCQSxFQXFCaUIsR0FBWCxDQUFOIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjEwNjI4LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvY29udHJvbGxlcnMvdXNlci5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsidHJhbnNmb3JtID0gcmVxdWlyZSAnYXBwL3V0aWxzL2ltYWdlcy90cmFuc2Zvcm0nXG5oYXBwZW5zICAgPSByZXF1aXJlICdoYXBwZW5zJ1xubmF2aWdhdGlvbiA9IHJlcXVpcmUgJ2FwcC9jb250cm9sbGVycy9uYXZpZ2F0aW9uJ1xubm90aWZ5ID0gcmVxdWlyZSAnYXBwL2NvbnRyb2xsZXJzL25vdGlmeSdcblxuXG5jbGFzcyBVc2VyQ29udHJvbGxlclxuXG4gICMgQ2xhc3MgdmFyaWFibGVzXG4gIGluc3RhbmNlID0gbnVsbFxuICBVU0VSX0RFRkFVTFRfQVZBVEFSID0gXCIvaW1hZ2VzL3Byb2ZpbGUtMS5qcGdcIlxuICBVU0VSX0RFRkFVTFRfQ09WRVIgPSBcIi9pbWFnZXMvaG9tZXBhZ2UuanBnXCJcblxuICAjIE9iamVjdCB2YXJpYWJsZXNcbiAgZGF0YSA6IG51bGxcbiAgaXNfb3duZXI6IGZhbHNlXG5cblxuICBjb25zdHJ1Y3RvcjogLT5cblxuICAgIGlmIFVzZXJDb250cm9sbGVyLmluc3RhbmNlXG4gICAgICBjb25zb2xlLmVycm9yIFwiWW91IGNhbid0IGluc3RhbnRpYXRlIHRoaXMgVXNlckNvbnRyb2xsZXIgdHdpY2VcIiBcbiAgICAgIHJldHVyblxuXG4gICAgVXNlckNvbnRyb2xsZXIuaW5zdGFuY2UgPSBAXG4gICAgaGFwcGVucyBAXG5cbiAgICBAZmV0Y2hfZnJvbV9zZXNzaW9uKClcblxuICAgIHZpZXcub25jZSAnYmluZGVkJywgKHNjb3BlKSA9PiAgXG4gICAgICByZXR1cm4gdW5sZXNzIHNjb3BlLm1haW5cblxuICAgICAgaWYgQGlzX2xvZ2dlZCgpXG4gICAgICAgIEBfZGlzcGF0Y2hfbG9naW4oKVxuICAgICAgZWxzZVxuICAgICAgICBAX2Rpc3BhdGNoX2xvZ291dCgpXG5cbiAgIyMjXG4gIENhbGxlZCBmcm9tIHRoZSBvdXRzaWRlLCB3aGVuIHRoZSB1c2VyIGxvZ3MgaW5cbiAgIyMjXG4gIGxvZ2luOiAoIEBkYXRhICkgLT5cblxuICAgIGxvZyBcIltVc2VyQ29udHJvbGxlcl0gdXNlcjpsb2dnZWRcIiwgQGRhdGFcblxuICAgIEBjcmVhdGVfaW1hZ2VzKClcblxuICAgIEB3cml0ZV90b19zZXNzaW9uKClcblxuICAgIEBfZGlzcGF0Y2hfbG9naW4oKVxuXG4gICAgbm90aWZ5LmluZm8gXCJZb3UndmUgc3VjY2Vzc3VmdWxseSBsb2dnZWQgaW4uXCJcblxuICAjIyNcbiAgQ2FsbGVkIGZyb20gdGhlIG91dHNpZGUsIHdoZW4gdGhlIHVzZXIgbG9ncyBvdXRcbiAgIyMjXG4gIGxvZ291dDogKCBjYWxsYmFjayA9IC0+ICkgLT5cblxuICAgICMgbG9nIFwiW1VzZXJDb250cm9sbGVyXSBsb2dvdXRcIlxuICAgIFxuICAgIGlmIG5vdCBAaXNfbG9nZ2VkKCkgdGhlbiByZXR1cm4gY2FsbGJhY2sgZXJyb3I6IGNvZGU6ICdub2RlX2xvZ2dlZCdcblxuICAgICMgbG9nIFwiW1VzZXJdIHRyeWluZyB0byBsb2dvdXQuLi5cIlxuXG4gICAgJC5wb3N0ICcvYXBpL3YxL2xvZ291dCcsIHt9LCAoZGF0YSkgPT5cbiAgICAgICMgbG9nIFwiW1VzZXJdIGxvZ291dCB+IHN1Y2Nlc3NcIiwgZGF0YVxuICAgICAgXG4gICAgICBAZGVsZXRlX3Nlc3Npb24oKVxuXG4gICAgICBAX2Rpc3BhdGNoX2xvZ291dCgpXG5cbiAgICAgIG5hdmlnYXRpb24uZ28gJy8nXG5cbiAgICAgIG5vdGlmeS5pbmZvIFwiWW91J3ZlIHN1Y2Nlc3N1ZnVsbHkgbG9nZ2VkIG91dC5cIlxuXG4gICAgICBjYWxsYmFjaz8oKVxuXG4gIGNoZWNrX2d1ZXN0X293bmVyOiAtPlxuXG4gICAgaWYgb3duZXJfaWQ/IGFuZCBAaXNfbG9nZ2VkKCkgYW5kIEBkYXRhLnVzZXJuYW1lIGlzIG93bmVyX2lkXG4gICAgICBhcHAuYm9keS5hZGRDbGFzcyggJ2lzX293bmVyJyApLnJlbW92ZUNsYXNzKCAnaXNfZ3Vlc3QnIClcbiAgICAgIEBpc19vd25lciA9IHRydWVcbiAgICBlbHNlXG4gICAgICBhcHAuYm9keS5yZW1vdmVDbGFzcyggJ2lzX293bmVyJyApLmFkZENsYXNzKCAnaXNfZ3Vlc3QnIClcbiAgICAgIEBpc19vd25lciA9IGZhbHNlXG5cbiAgY3JlYXRlX2ltYWdlczogLT5cblxuICAgIGNvbnNvbGUubG9nIFwiW1VzZXJDb250cm9sbGVyXSBOT1JNQUxJWkUgREFUQSBiZWZvcmVcIiwgQGRhdGFcbiAgICBcbiAgICBpZiBub3QgQGRhdGEuYXZhdGFyP1xuICAgICAgbG9nIFwiW1VzZXIgQ29udHJvbGxlcl0gdXNlci5hdmF0YXIgaXMgdW5kZWZpbmVkLiBTZXR0aW5nIGRlZmF1bHQuXCJcbiAgICAgIEBkYXRhLmF2YXRhciA9IFVzZXJDb250cm9sbGVyLlVTRVJfREVGQVVMVF9BVkFUQVJcblxuICAgICMgaWYgbm90IEBkYXRhLmNvdmVyP1xuICAgICMgICBsb2cgXCJbVXNlciBDb250cm9sbGVyXSB1c2VyLmNvdmVyIGlzIHVuZGVmaW5lZC4gU2V0dGluZyBkZWZhdWx0LlwiXG4gICAgIyAgIEBkYXRhLmNvdmVyID0gVXNlckNvbnRyb2xsZXIuVVNFUl9ERUZBVUxUX0NPVkVSXG5cbiAgICBjb25zb2xlLmxvZyBcIltVc2VyQ29udHJvbGxlcl0gTk9STUFMSVpFIERBVEEgYWZ0ZXJcIiwgQGRhdGFcblxuICAgIEBkYXRhLmltYWdlcyA9XG4gICAgICB0b3BfYmFyOiB0cmFuc2Zvcm0udG9wX2JhciBAZGF0YS5hdmF0YXJcbiAgICAgIGF2YXRhcjogdHJhbnNmb3JtLmF2YXRhciBAZGF0YS5hdmF0YXJcbiAgICAgIGNvdmVyOiB0cmFuc2Zvcm0uY292ZXIgQGRhdGEuY292ZXJcblxuICAgIEBlbWl0ICd1c2VyOnVwZGF0ZWQnLCBAZGF0YVxuICBcbiAgIyMjXG4gIFByaXZhdGUgTWV0aG9kc1xuICAjIyNcbiAgX2Rpc3BhdGNoX2xvZ2luOiAtPlxuICAgIGxvZyBcIls9PT09PT0gVVNFUiBMT0dHRUQgPT09PT09PV1cIlxuICAgIGxvZyBcIiN7QGRhdGEudXNlcm5hbWV9IC8gI3tAZGF0YS5uYW1lfVwiXG4gICAgbG9nIEBkYXRhXG4gICAgbG9nIFwiWz09PT09PT09PT09PT09PT09PT09PT09PT09XVwiXG5cblxuICAgIEBjaGVja19ndWVzdF9vd25lcigpXG4gICAgYXBwLmJvZHkuYWRkQ2xhc3MgXCJsb2dnZWRcIlxuICAgIEBlbWl0ICd1c2VyOmxvZ2dlZCcsIEBkYXRhXG5cbiAgX2Rpc3BhdGNoX2xvZ291dDogLT5cbiAgICBsb2cgXCJbPT09PT09IFVTRVIgTk9UIExPR0dFRCA9PT09PT09XVwiXG4gICAgbG9nIFwiWz09PT09PT09PT09PT09PT09PT09PT09PT09XVwiXG5cbiAgICBAY2hlY2tfZ3Vlc3Rfb3duZXIoKVxuICAgIGFwcC5ib2R5LnJlbW92ZUNsYXNzIFwibG9nZ2VkXCJcbiAgICBAZW1pdCAndXNlcjp1bmxvZ2dlZCdcblxuICBcblxuXG4gICMjI1xuICBTaG9ydGN1dCBNZXRob2RzXG4gICMjI1xuICBoYXNfaW5mb3JtYXRpb25zOiAtPlxuICAgIGlmIEBkYXRhIGFuZCAoQGRhdGEuYmlvPyBvciBAZGF0YS5sb2NhdGlvbj8pXG4gICAgICByZXR1cm4gdHJ1ZVxuXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgaXNfbG9nZ2VkOiAtPlxuICAgIHJldHVybiBAZGF0YVxuXG5cbiAgIyMjXG4gIFNlc3Npb24gKGNvb2tpZSkgTWV0aG9kcyBcbiAgIyMjXG4gIGZldGNoX2Zyb21fc2Vzc2lvbjogLT5cbiAgICBAZGF0YSA9IGFwcC5zZXNzaW9uLmdldCAndXNlcicsIG51bGxcblxuICB3cml0ZV90b19zZXNzaW9uOiAgLT5cbiAgICBhcHAuc2Vzc2lvbi5zZXQgJ3VzZXInLCBAZGF0YVxuXG4gIGRlbGV0ZV9zZXNzaW9uOiAtPlxuICAgIEBkYXRhID0gbnVsbFxuICAgIGFwcC5zZXNzaW9uLmRlbGV0ZSAndXNlcidcbiMgd2lsbCBhbHdheXMgZXhwb3J0IHRoZSBzYW1lIGluc3RhbmNlXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBVc2VyQ29udHJvbGxlciJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGtEQUFBOztBQUFBLENBQUEsRUFBWSxJQUFBLEVBQVosbUJBQVk7O0FBQ1osQ0FEQSxFQUNZLElBQVosRUFBWTs7QUFDWixDQUZBLEVBRWEsSUFBQSxHQUFiLGtCQUFhOztBQUNiLENBSEEsRUFHUyxHQUFULENBQVMsaUJBQUE7O0FBR0gsQ0FOTjtDQVNFLEtBQUEsMkNBQUE7O0NBQUEsQ0FBQSxDQUFXLENBQVgsSUFBQTs7Q0FBQSxDQUNBLENBQXNCLGdCQUF0QixJQURBOztDQUFBLENBRUEsQ0FBcUIsZUFBckIsSUFGQTs7Q0FBQSxFQUtPLENBQVA7O0NBTEEsRUFNVSxFQU5WLEdBTUE7O0NBR2EsQ0FBQSxDQUFBLHFCQUFBO0NBRVgsT0FBQSxJQUFBO0NBQUEsR0FBQSxJQUFBLE1BQWlCO0NBQ2YsSUFBQSxDQUFBLENBQU8sMENBQVA7Q0FDQSxXQUFBO01BRkY7Q0FBQSxFQUkwQixDQUExQixJQUFBLE1BQWM7Q0FKZCxHQUtBLEdBQUE7Q0FMQSxHQU9BLGNBQUE7Q0FQQSxDQVNvQixDQUFBLENBQXBCLENBQW9CLEdBQXBCLENBQXFCO0FBQ0wsQ0FBZCxHQUFBLENBQW1CLENBQW5CO0NBQUEsYUFBQTtRQUFBO0NBRUEsR0FBRyxDQUFDLENBQUosR0FBRztDQUNBLElBQUEsVUFBRDtNQURGLEVBQUE7Q0FHRyxJQUFBLFVBQUQsQ0FBQTtRQU5nQjtDQUFwQixJQUFvQjtDQXBCdEIsRUFTYTs7Q0FtQmI7OztDQTVCQTs7Q0FBQSxFQStCTyxDQUFBLENBQVAsSUFBVTtDQUVSLEVBRlEsQ0FBRDtDQUVQLENBQW9DLENBQXBDLENBQUEsMEJBQUE7Q0FBQSxHQUVBLFNBQUE7Q0FGQSxHQUlBLFlBQUE7Q0FKQSxHQU1BLFdBQUE7Q0FFTyxHQUFQLEVBQU0sS0FBTixzQkFBQTtDQXpDRixFQStCTzs7Q0FZUDs7O0NBM0NBOztDQUFBLEVBOENRLEdBQVIsRUFBUSxDQUFFO0NBSVIsT0FBQSxJQUFBOztHQUptQixHQUFYLEdBQVc7TUFJbkI7QUFBTyxDQUFQLEdBQUEsS0FBTztDQUFrQixPQUFPLEtBQUE7Q0FBUyxDQUFPLEdBQVAsR0FBQTtDQUFPLENBQU0sRUFBTixNQUFBLEdBQUE7VUFBUDtDQUFoQixPQUFPO01BQWhDO0NBSUMsQ0FBd0IsQ0FBSSxDQUE3QixLQUE4QixFQUE5QixLQUFBO0NBR0UsSUFBQyxDQUFELFFBQUE7Q0FBQSxJQUVDLENBQUQsVUFBQTtDQUZBLENBSUEsQ0FBQSxHQUFBLElBQVU7Q0FKVixHQU1BLEVBQUEsNEJBQUE7Q0FUMkIsRUFXM0I7Q0FYRixJQUE2QjtDQXREL0IsRUE4Q1E7O0NBOUNSLEVBbUVtQixNQUFBLFFBQW5CO0NBRUUsR0FBQSxDQUFvRCxHQUFsQixDQUFqQiw2Q0FBZDtDQUNELEVBQUcsQ0FBSyxFQUFSLEVBQUEsRUFBQSxDQUFBO0NBQ0MsRUFBVyxDQUFYLElBQUQsS0FBQTtNQUZGO0NBSUUsRUFBRyxDQUFLLEVBQVIsRUFBQSxFQUFBLENBQUE7Q0FDQyxFQUFXLENBQVgsSUFBRCxLQUFBO01BUGU7Q0FuRW5CLEVBbUVtQjs7Q0FuRW5CLEVBNEVlLE1BQUEsSUFBZjtDQUVFLENBQXNELENBQXRELENBQUEsR0FBTyxpQ0FBUDtDQUVBLEdBQUEsb0JBQUE7Q0FDRSxFQUFBLEdBQUEsd0RBQUE7Q0FBQSxFQUNlLENBQWQsRUFBRCxRQUE2QixLQUQ3QjtNQUhGO0NBQUEsQ0FVcUQsQ0FBckQsQ0FBQSxHQUFPLGdDQUFQO0NBVkEsRUFhRSxDQURGLEVBQUE7Q0FDRSxDQUFTLEVBQW1CLEVBQTVCLENBQUEsRUFBa0I7Q0FBbEIsQ0FDUSxFQUFrQixFQUExQixHQUFpQjtDQURqQixDQUVPLEVBQWlCLENBQXhCLENBQUEsR0FBZ0I7Q0FmbEIsS0FBQTtDQWlCQyxDQUFxQixFQUFyQixPQUFELEdBQUE7Q0EvRkYsRUE0RWU7O0NBcUJmOzs7Q0FqR0E7O0NBQUEsRUFvR2lCLE1BQUEsTUFBakI7Q0FDRSxFQUFBLENBQUEsMEJBQUE7Q0FBQSxDQUNJLENBQUosQ0FBQSxDQUFJLEdBQUE7Q0FESixFQUVBLENBQUE7Q0FGQSxFQUdBLENBQUEsMEJBQUE7Q0FIQSxHQU1BLGFBQUE7Q0FOQSxFQU9HLENBQUgsSUFBQTtDQUNDLENBQW9CLEVBQXBCLE9BQUQsRUFBQTtDQTdHRixFQW9HaUI7O0NBcEdqQixFQStHa0IsTUFBQSxPQUFsQjtDQUNFLEVBQUEsQ0FBQSw4QkFBQTtDQUFBLEVBQ0EsQ0FBQSwwQkFBQTtDQURBLEdBR0EsYUFBQTtDQUhBLEVBSUcsQ0FBSCxJQUFBLEdBQUE7Q0FDQyxHQUFBLE9BQUQsSUFBQTtDQXJIRixFQStHa0I7O0NBV2xCOzs7Q0ExSEE7O0NBQUEsRUE2SGtCLE1BQUEsT0FBbEI7Q0FDRSxHQUFBLG1CQUFjLEtBQUQ7Q0FDWCxHQUFBLFNBQU87TUFEVDtDQUdBLElBQUEsTUFBTztDQWpJVCxFQTZIa0I7O0NBN0hsQixFQW1JVyxNQUFYO0NBQ0UsR0FBUSxPQUFEO0NBcElULEVBbUlXOztDQUlYOzs7Q0F2SUE7O0NBQUEsRUEwSW9CLE1BQUEsU0FBcEI7Q0FDRyxDQUErQixDQUF4QixDQUFQLEVBQU8sQ0FBVyxJQUFuQjtDQTNJRixFQTBJb0I7O0NBMUlwQixFQTZJbUIsTUFBQSxPQUFuQjtDQUNNLENBQW9CLENBQXJCLENBQXNCLEVBQXpCLENBQVcsSUFBWDtDQTlJRixFQTZJbUI7O0NBN0luQixFQWdKZ0IsTUFBQSxLQUFoQjtDQUNFLEVBQVEsQ0FBUjtDQUNJLEVBQUQsR0FBSCxDQUFXLENBQUEsR0FBWDtDQWxKRixFQWdKZ0I7O0NBaEpoQjs7Q0FURjs7QUE2SkEsQ0E3SkEsRUE2SmlCLEdBQVgsQ0FBTixPQTdKQSJ9fSx7Im9mZnNldCI6eyJsaW5lIjoxMDgwMiwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL2NvbnRyb2xsZXJzL3ZpZXdzLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJoYXBwZW5zID0gcmVxdWlyZSAnaGFwcGVucydcbmhhcHBlbnNfZGVzdHJveSA9IHJlcXVpcmUgJ2FwcC91dGlscy9oYXBwZW5zX2Rlc3Ryb3knXG5cbmNsYXNzIFZpZXdcblxuXHRVTklRVUVfSUQgIFx0PSAwXG5cblxuXHQjIyNcblx0SGFzaCBNYXAgdG8gc3RvcmUgdGhlIHZpZXdzOlxuXG5cdGhhc2hfbW9kZWwgPSB7XG5cdFx0XCI8dmlld19uYW1lPlwiIDogWyA8dmlld19pbnN0YW5jZT4sIDx2aWV3X2luc3RhbmNlPiwgLi4gXSxcblx0XHRcIjx2aWV3X25hbWU+XCIgOiBbIDx2aWV3X2luc3RhbmNlPiwgPHZpZXdfaW5zdGFuY2U+LCAuLiBdXG5cdH1cblx0IyMjXG5cdGhhc2hfbW9kZWwgIDoge31cblxuXG5cdCMjI1xuXHRVaWQgTWFwLiBJbnRlcm5hbCBtYXAgdXNlZCBmb3IgZWFzaWx5IGdldCBhIHZpZXcgYnkgdWlkXG5cblx0dWlkX21hcCA9IHtcblx0XHRcIjxVTklRVUVfSUQ+XCIgOiB7IG5hbWUgOiA8dmlld19uYW1lPiwgaW5kZXg6IDx2aWV3X2luZGV4PiB9LFxuXHRcdFwiPFVOSVFVRV9JRD5cIiA6IHsgbmFtZSA6IDx2aWV3X25hbWU+LCBpbmRleDogPHZpZXdfaW5kZXg+IH0sXG5cdFx0ICAuLi5cblx0fVxuXHQjIyNcblx0dWlkX21hcDoge31cblxuXG5cblxuXG5cdCMgR2V0IHRoZSB2aWV3IGZyb20gdGhlIGhhc2ggbW9kZWxcblx0Z2V0OiAoIGlkLCBpbmRleCA9IDAgKSA9PlxuXHRcdHVubGVzcyBAaGFzaF9tb2RlbFsgaWQgXT9cblx0XHRcdCMgY29uc29sZS5lcnJvciBcIlZpZXcgI3tpZH0gI3tpbmRleH0gZG9lc24ndCBleGlzdHNcIlxuXHRcdFx0cmV0dXJuIGZhbHNlXG5cblx0XHRAaGFzaF9tb2RlbFsgaWQgXVsgaW5kZXggXVxuXG5cblxuXHRnZXRfYnlfdWlkOiAoIHVpZCApID0+XG5cdFx0aWYgQHVpZF9tYXBbIHVpZCBdP1xuXHRcdFx0bmFtZSA9IEB1aWRfbWFwWyB1aWQgXS5uYW1lXG5cdFx0XHRpbmRleCA9IEB1aWRfbWFwWyB1aWQgXS5pbmRleFxuXG5cdFx0XHRyZXR1cm4gQGdldCBuYW1lLCBpbmRleFxuXG5cdFx0cmV0dXJuIGZhbHNlXG5cblx0Z2V0X2J5X2RvbTogKCBzZWxlY3RvciApID0+IEBnZXRfYnlfdWlkICQoIHNlbGVjdG9yICkuZGF0YSAndWlkJ1xuXG5cblxuXHRiaW5kOiAoIHNjb3BlID0gJ2JvZHknLCB0b2xvZyA9IGZhbHNlICkgLT5cblx0XHQjIGNvbnNvbGUuZXJyb3IgXCJbdmlld3NdIEJpbmRpbmdzIHZpZXdzOiAje3Njb3BlfVwiXG5cdFx0JCggc2NvcGUgKS5maW5kKCAnW2RhdGEtdmlld10nICkuZWFjaCggKCBpbmRleCwgaXRlbSApID0+XG5cblx0XHRcdCRpdGVtID0gJCBpdGVtXG5cblx0XHRcdHZpZXdfbmFtZSA9ICRpdGVtLmRhdGEoICd2aWV3JyApXG5cblx0XHRcdGlmIHRvbG9nXG5cdFx0XHRcdGxvZyBcIlt2aWV3c10gYmluZGluZ1wiLCB2aWV3X25hbWVcblxuXHRcdFx0JGl0ZW0ucmVtb3ZlQXR0ciAnZGF0YS12aWV3J1xuXG5cdFx0XHRpZiB2aWV3X25hbWUuc3Vic3RyaW5nKDAsIDEpIGlzIFwiW1wiXG5cdFx0XHRcdG5hbWVzID0gdmlld19uYW1lLnN1YnN0cmluZygxLCB2aWV3X25hbWUubGVuZ3RoIC0gMSkuc3BsaXQoXCIsXCIpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdG5hbWVzID0gW3ZpZXdfbmFtZV1cblxuXHRcdFx0Zm9yIG5hbWUgaW4gbmFtZXNcblx0XHRcdFx0QF9hZGRfdmlldyAkaXRlbSwgbmFtZVxuXG5cdFx0XHQjIHJlbW92ZSB0aGUgZGF0YS12aWV3IGF0dHJpYnV0ZSwgc28gaXQgd29uJ3QgYmUgaW5zdGFudGlhdGVkIHR3aWNlIVxuXHRcdFx0JGl0ZW0ucmVtb3ZlQXR0ciAnZGF0YS12aWV3J1xuXG5cdFx0KS5wcm9taXNlKCkuZG9uZSA9PiBcblx0XHRcdGRhdGEgPSBcblx0XHRcdFx0c2NvcGU6IHNjb3BlXG5cdFx0XHRcdG1haW46IHNjb3BlIGluIFsgJ2JvZHknLCAnI2NvbnRlbnQnIF1cblxuXHRcdFx0QGVtaXQgXCJiaW5kZWRcIiwgZGF0YVxuXHRcdFx0YXBwLm9uX3ZpZXdzX2JpbmRlZCBkYXRhXG5cblx0dW5iaW5kOiAoIHNjb3BlID0gJ2JvZHknICkgLT5cblx0XHQkKCBzY29wZSApLmZpbmQoICdbZGF0YS11aWRdJyApLmVhY2goICggaW5kZXgsIGl0ZW0gKSA9PlxuXG5cdFx0XHQkaXRlbSA9ICQgaXRlbVxuXG5cdFx0XHRpZCA9ICRpdGVtLmRhdGEgJ3VpZCdcblxuXHRcdFx0diA9IHZpZXcuZ2V0X2J5X3VpZCBpZFxuXG5cdFx0XHRpZiB2XG5cdFx0XHRcdGhhcHBlbnNfZGVzdHJveSB2XG5cdFx0XHRcdHYuZGVzdHJveT8oKVxuXHRcdFx0XHR2LnZpZXdfbmFtZSA9IG51bGxcblx0XHRcdFx0dmlldy5vbl92aWV3X2Rlc3Ryb3llZCBpZFxuXG5cdFx0KS5wcm9taXNlKCkuZG9uZSA9PiBcblx0XHRcdGRhdGEgPSBcblx0XHRcdFx0c2NvcGU6IHNjb3BlXG5cdFx0XHRcdG1haW46IHNjb3BlIGluIFsgJ2JvZHknLCAnI2NvbnRlbnQnIF1cblxuXHRcdFx0QGVtaXQgXCJ1bmJpbmRlZFwiLCBkYXRhXG5cblxuXG5cdF9hZGRfdmlldzogKCAkaXRlbSwgdmlld19uYW1lICkgLT5cblxuXHRcdHRyeVxuXHRcdFx0dmlldyA9IHJlcXVpcmUgXCJhcHAvdmlld3MvI3t2aWV3X25hbWV9XCJcblx0XHRjYXRjaCBlXG5cdFx0XHRjb25zb2xlLndhcm4gJ2UgLT4nLCBlLm1lc3NhZ2Vcblx0XHRcdGNvbnNvbGUuZXJyb3IgXCJhcHAvdmlld3MvI3t2aWV3fSBub3QgZm91bmQgZm9yIFwiLCAkaXRlbVxuXG5cdFx0dmlldyA9IG5ldyB2aWV3ICRpdGVtXG5cblx0XHQjIFNhdmUgdGhlIHZpZXcgaW4gYSBoYXNoIG1vZGVsXG5cdFx0QGhhc2hfbW9kZWxbIHZpZXdfbmFtZSBdID89IFtdXG5cblx0XHRsID0gQGhhc2hfbW9kZWxbIHZpZXdfbmFtZSBdLmxlbmd0aFxuXG5cdFx0QGhhc2hfbW9kZWxbIHZpZXdfbmFtZSBdWyBsIF0gPSB2aWV3XG5cblxuXHRcdCMgU2F2ZSB0aGUgaW5jcmVtZW50YWwgdWlkIHRvIHRoZSBkb20gYW5kIHRvIHRoZSBpbnN0YW5jZVxuXHRcdHZpZXcudWlkID0gVU5JUVVFX0lEXG5cdFx0dmlldy52aWV3X25hbWUgPSB2aWV3X25hbWVcblxuXHRcdCMgbG9nIFwiW3ZpZXddIGFkZFwiLCB2aWV3LnVpZCwgdmlldy52aWV3X25hbWVcblxuXHRcdCRpdGVtLmF0dHIgJ2RhdGEtdWlkJywgVU5JUVVFX0lEXG5cblx0XHQjIFNhdmUgdGhlIHZpZXcgaW4gYSBsaW5lYXIgYXJyYXkgbW9kZWxcblx0XHRAdWlkX21hcFsgVU5JUVVFX0lEIF0gPVxuXHRcdFx0bmFtZSAgOiB2aWV3X25hbWVcblx0XHRcdGluZGV4IDogQGhhc2hfbW9kZWxbIHZpZXdfbmFtZSBdLmxlbmd0aCAtIDFcblxuXG5cdFx0VU5JUVVFX0lEKytcblxuXG5cblxuXHRvbl92aWV3X2Rlc3Ryb3llZDogKCB1aWQgKSAtPlxuXHRcdFxuXHRcdCMgbG9nIFwiW1ZpZXddIG9uX3ZpZXdfZGVzdHJveWVkXCIsIHVpZFxuXHRcdGlmIEB1aWRfbWFwWyB1aWQgXT9cblxuXHRcdFx0IyBHZXQgdGhlIGRhdGEgZnJvbSB0aGUgdWlkIG1hcFxuXHRcdFx0bmFtZSAgPSBAdWlkX21hcFsgdWlkIF0ubmFtZVxuXHRcdFx0aW5kZXggPSBAdWlkX21hcFsgdWlkIF0uaW5kZXhcblxuXHRcdFx0IyBkZWxldGUgdGhlIHJlZmVyZW5jZSBpbiB0aGUgbW9kZWxcblx0XHRcdGlmIEBoYXNoX21vZGVsWyBuYW1lIF1bIGluZGV4IF0/XG5cblx0XHRcdFx0IyBkZWxldGUgdGhlIGl0ZW0gZnJvbSB0aGUgdWlkX21hcFxuXHRcdFx0XHRkZWxldGUgQHVpZF9tYXBbIHVpZCBdXG5cblx0XHRcdFx0IyBEZWxldGUgdGhlIGl0ZW0gZnJvbSB0aGUgaGFzaF9tb2RlbFxuXHRcdFx0XHRAaGFzaF9tb2RlbFsgbmFtZSBdLnNwbGljZSBpbmRleCwgMVxuXG5cdFx0XHRcdCMgVXBkYXRlIHRoZSBpbmRleCBvbiB0aGUgdWlkX21hcCBmb3IgdGhlIHZpZXdzIGxlZnQgb2YgdGhlIHNhbWUgdHlwZVxuXHRcdFx0XHRmb3IgaXRlbSwgaSBpbiBAaGFzaF9tb2RlbFsgbmFtZSBdXG5cdFx0XHRcdFx0QHVpZF9tYXBbIGl0ZW0udWlkIF0uaW5kZXggPSBpXG5cblxuXHRcdFx0XHRcblxuXG5cbnZpZXcgPSBuZXcgVmlld1xuaGFwcGVucyB2aWV3XG5cbm1vZHVsZS5leHBvcnRzID0gd2luZG93LnZpZXcgPSB2aWV3XG5cblxuIyBleHBvcnRpbmcgZ2V0IG1ldGhvZCBmb3Igd2luZG93LCBzbyB5b3UgY2FuIHJldHJpZXZlIHZpZXdzIGp1c3Qgd2l0aCBWaWV3KCBpZCApXG53aW5kb3cuVmlldyA9IHZpZXciXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxnQ0FBQTtHQUFBLCtFQUFBOztBQUFBLENBQUEsRUFBVSxJQUFWLEVBQVU7O0FBQ1YsQ0FEQSxFQUNrQixJQUFBLFFBQWxCLFlBQWtCOztBQUVaLENBSE47Q0FLQyxLQUFBLEdBQUE7Ozs7OztDQUFBOztDQUFBLENBQUEsQ0FBYyxNQUFkOztDQUdBOzs7Ozs7OztDQUhBOztDQUFBLENBQUEsQ0FXYyxPQUFkOztDQUdBOzs7Ozs7Ozs7Q0FkQTs7Q0FBQSxDQUFBLENBdUJTLElBQVQ7O0NBdkJBLENBOEJLLENBQUwsRUFBSyxJQUFFOztHQUFZLEdBQVI7TUFDVjtDQUFBLEdBQUEsdUJBQUE7Q0FFQyxJQUFBLFFBQU87TUFGUjtDQUlDLENBQVksRUFBWixDQUFrQixLQUFOLENBQWI7Q0FuQ0QsRUE4Qks7O0NBOUJMLEVBdUNZLE1BQUUsQ0FBZDtDQUNDLE9BQUEsR0FBQTtDQUFBLEdBQUEscUJBQUE7Q0FDQyxFQUFPLENBQVAsRUFBQSxDQUFpQjtDQUFqQixFQUNRLENBQUMsQ0FBVCxDQUFBLENBQWtCO0NBRWxCLENBQWtCLENBQVgsQ0FBQyxDQUFELFFBQUE7TUFKUjtDQU1BLElBQUEsTUFBTztDQTlDUixFQXVDWTs7Q0F2Q1osRUFnRFksS0FBQSxDQUFFLENBQWQ7Q0FBNkIsR0FBQSxDQUFXLEdBQUEsRUFBWixDQUFBO0NBaEQ1QixFQWdEWTs7Q0FoRFosQ0FvRHdCLENBQWxCLENBQU4sQ0FBTSxJQUFFO0NBRVAsT0FBQSxJQUFBOztHQUZlLEdBQVI7TUFFUDs7R0FGK0IsR0FBUjtNQUV2QjtDQUFBLENBQWdELENBQVQsQ0FBdkMsQ0FBQSxJQUF5QyxFQUF6QyxFQUFBO0NBRUMsU0FBQSw2QkFBQTtDQUFBLEVBQVEsQ0FBQSxDQUFSLENBQUE7Q0FBQSxFQUVZLENBQUEsQ0FBSyxDQUFqQixHQUFBO0NBRUEsR0FBRyxDQUFILENBQUE7Q0FDQyxDQUF1QixDQUF2QixLQUFBLENBQUEsUUFBQTtRQUxEO0NBQUEsSUFPSyxDQUFMLElBQUEsQ0FBQTtDQUVBLENBQTBCLENBQTFCLENBQUcsQ0FBNkIsQ0FBaEMsR0FBWTtDQUNYLENBQStCLENBQXZCLEVBQVIsQ0FBK0IsRUFBL0IsQ0FBaUI7TUFEbEIsRUFBQTtDQUdDLEVBQVEsRUFBUixHQUFBLENBQVE7UUFaVDtBQWNBLENBQUEsVUFBQSxpQ0FBQTswQkFBQTtDQUNDLENBQWtCLEVBQWxCLENBQUMsR0FBRCxDQUFBO0NBREQsTUFkQTtDQWtCTSxJQUFELEtBQUwsQ0FBQSxFQUFBO0NBcEJELEVBc0JpQixDQXRCakIsQ0FBdUMsRUFBdkMsRUFzQmlCO0NBQ2hCLEdBQUEsTUFBQTtDQUFBLEVBQ0MsQ0FERCxFQUFBO0NBQ0MsQ0FBTyxHQUFQLEdBQUE7Q0FBQSxDQUNNLEVBQU4sQ0FBTSxDQUFBLEVBQU4sRUFEQTtDQURELE9BQUE7Q0FBQSxDQUlnQixFQUFoQixDQUFDLENBQUQsRUFBQTtDQUNJLEVBQUQsQ0FBSCxTQUFBLEVBQUE7Q0E1QkQsSUFzQmlCO0NBNUVsQixFQW9ETTs7Q0FwRE4sRUFvRlEsRUFBQSxDQUFSLEdBQVU7Q0FDVCxPQUFBLElBQUE7O0dBRGlCLEdBQVI7TUFDVDtDQUFBLENBQStDLENBQVQsQ0FBdEMsQ0FBQSxJQUF3QyxFQUF4QyxDQUFBO0NBRUMsU0FBQSxFQUFBO0NBQUEsRUFBUSxDQUFBLENBQVIsQ0FBQTtDQUFBLENBRUEsQ0FBSyxDQUFBLENBQUssQ0FBVjtDQUZBLENBSUksQ0FBQSxDQUFJLEVBQVIsSUFBSTtDQUVKLEdBQUcsRUFBSDtDQUNDLE9BQUEsT0FBQTs7Q0FDQyxTQUFEO1VBREE7Q0FBQSxFQUVjLENBRmQsSUFFQSxDQUFBO0NBQ0ssQ0FBTCxFQUFJLFdBQUosRUFBQTtRQVpvQztDQUF0QyxFQWNpQixDQWRqQixDQUFzQyxFQUF0QyxFQWNpQjtDQUNoQixHQUFBLE1BQUE7Q0FBQSxFQUNDLENBREQsRUFBQTtDQUNDLENBQU8sR0FBUCxHQUFBO0NBQUEsQ0FDTSxFQUFOLENBQU0sQ0FBQSxFQUFOLEVBREE7Q0FERCxPQUFBO0NBSUMsQ0FBaUIsRUFBbEIsQ0FBQyxLQUFELEdBQUE7Q0FuQkQsSUFjaUI7Q0FuR2xCLEVBb0ZROztDQXBGUixDQTRHb0IsQ0FBVCxFQUFBLElBQVg7Q0FFQyxPQUFBLFNBQUE7Q0FBQTtDQUNDLEVBQU8sQ0FBUCxFQUFBLENBQU8sRUFBQSxHQUFTO01BRGpCO0NBR0MsS0FESztDQUNMLENBQXFCLEVBQXJCLEVBQUEsQ0FBTztDQUFQLENBQ2tELENBQXhCLENBQVgsQ0FBZixDQUFBLENBQU8sS0FBUSxLQUFmO01BSkQ7Q0FBQSxFQU1XLENBQVgsQ0FBVzs7Q0FHRSxFQUFlLEVBQWYsSUFBQTtNQVRiO0NBQUEsRUFXSSxDQUFKLEVBWEEsR0FXaUIsQ0FBQTtDQVhqQixFQWFnQyxDQUFoQyxLQUFhLENBQUE7Q0FiYixFQWlCQSxDQUFBLEtBakJBO0NBQUEsRUFrQmlCLENBQWpCLEtBQUE7Q0FsQkEsQ0FzQnVCLEVBQXZCLENBQUssSUFBTCxDQUFBO0NBdEJBLEVBMEJDLENBREQsR0FBVSxFQUFBO0NBQ1QsQ0FBUSxFQUFSLEVBQUEsR0FBQTtDQUFBLENBQ1EsQ0FBa0MsQ0FBakMsQ0FBVCxDQUFBLEdBQXFCLENBQUE7Q0EzQnRCLEtBQUE7QUE4QkEsQ0FoQ1UsUUFnQ1YsRUFBQTtDQTVJRCxFQTRHVzs7Q0E1R1gsRUFpSm1CLE1BQUUsUUFBckI7Q0FHQyxPQUFBLHNDQUFBO0NBQUEsR0FBQSxxQkFBQTtDQUdDLEVBQVEsQ0FBUixFQUFBLENBQWtCO0NBQWxCLEVBQ1EsQ0FBQyxDQUFULENBQUEsQ0FBa0I7Q0FHbEIsR0FBRyxFQUFILDhCQUFBO0FBR0MsQ0FBQSxFQUFpQixDQUFULEVBQVIsQ0FBaUIsQ0FBakI7Q0FBQSxDQUdrQyxFQUFqQyxDQUFELENBQUEsRUFBQSxFQUFhO0NBR2I7Q0FBQTtjQUFBLHFDQUFBOzBCQUFBO0NBQ0MsRUFBVSxDQUFULENBQUQsRUFBVTtDQURYO3lCQVREO1FBUEQ7TUFIa0I7Q0FqSm5CLEVBaUptQjs7Q0FqSm5COztDQUxEOztBQWlMQSxDQWpMQSxFQWlMTyxDQUFQOztBQUNBLENBbExBLEdBa0xBLEdBQUE7O0FBRUEsQ0FwTEEsRUFvTGlCLENBQUEsRUFBWCxDQUFOOztBQUlBLENBeExBLEVBd0xjLENBQWQsRUFBTSJ9fSx7Im9mZnNldCI6eyJsaW5lIjoxMDk5MiwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL2NvbnRyb2xsZXJzL3dpbmRvdy5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiaGFwcGVucyA9IHJlcXVpcmUgJ2hhcHBlbnMnXG5cbiMgY3JlYXRlIGFuZCBleHBvcnQgYSBuZXcgaGFwcGVucyBvYmplY3RcbndpbiA9XG4gIG9iaiA6IE9iamVjdFxuICB3ICAgOiAwXG4gIGggICA6IDBcbiAgeSAgIDogMFxuXG5tb2R1bGUuZXhwb3J0cyA9IGhhcHBlbnMoIHdpbiApXG5cblxuXG4jIGV2ZW50IGhhbmRsaW5nIGZvciB3aW5kb3cgcmVzaXplXG53aW4ub2JqID0gJCB3aW5kb3dcbndpbi5vYmoub24gJ3Jlc2l6ZScsIG9uX3Jlc2l6ZSA9IC0+XG5cdHdpbi53ID0gd2luLm9iai53aWR0aCgpXG5cdHdpbi5oID0gd2luLm9iai5oZWlnaHQoKVxuXHR3aW4uZW1pdCAncmVzaXplJ1xuXG4jIHRyaWdnZXIgcmVzaXplIGF1dG9tYXRpY2FsbHkgYWZ0ZXIgMTAwIG1zXG5kZWxheSAxMDAsIG9uX3Jlc2l6ZVxuXG4jIGdsb2JhbCBjbGljayBldmVudFxuJCggJ2JvZHknICkub24gJ2NsaWNrJywgLT4gd2luLmVtaXQgXCJib2R5OmNsaWNrZWRcIlxuXG5cbiMgc2Nyb2xsIGV2ZW50XG53aW4ub2JqLm9uICdzY3JvbGwnLCBvbl9zY3JvbGwgPSAtPlxuICB3aW4ueSA9IHdpbi5vYmouc2Nyb2xsVG9wKCk7XG4gIHdpbi5lbWl0ICdzY3JvbGwnLCB3aW4ueVxuXG4jIHRyaWdnZXIgc2Nyb2xsIGF1dG9tYXRpY2FsbHkgYWZ0ZXIgMTAwIG1zXG5kZWxheSAxMDAsIG9uX3Njcm9sbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLDhCQUFBOztBQUFBLENBQUEsRUFBVSxJQUFWLEVBQVU7O0FBR1YsQ0FIQSxFQUdBO0NBQ0UsQ0FBQSxDQUFBLEdBQUE7Q0FBQSxDQUNBO0NBREEsQ0FFQTtDQUZBLENBR0E7Q0FQRixDQUFBOztBQVNBLENBVEEsRUFTaUIsR0FBWCxDQUFOOztBQUtBLENBZEEsRUFjRyxHQUFPOztBQUNWLENBZkEsQ0FlQSxDQUFHLEtBQUgsQ0FBcUI7Q0FDcEIsQ0FBQSxDQUFHLEVBQUs7Q0FBUixDQUNBLENBQUcsR0FBSztDQUNKLEVBQUQsQ0FBSCxJQUFBLENBQUE7Q0FIZ0M7O0FBTWpDLENBckJBLENBcUJXLENBQVgsRUFBQSxJQUFBOztBQUdBLENBeEJBLENBd0JBLENBQXdCLEdBQXhCLENBQUEsRUFBd0I7Q0FBTyxFQUFELENBQUgsS0FBQSxLQUFBO0NBQUg7O0FBSXhCLENBNUJBLENBNEJBLENBQUcsS0FBSCxDQUFxQjtDQUNuQixDQUFBLENBQUcsTUFBSztDQUNKLENBQWUsQ0FBaEIsQ0FBSCxJQUFBLENBQUE7Q0FGK0I7O0FBS2pDLENBakNBLENBaUNXLENBQVgsRUFBQSxJQUFBIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjExMDI4LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvZ2xvYmFscy5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4jIG9uIHRoZSBicm93c2VyLCB3aW5kb3cgaXMgdGhlIGdsb2JhbCBob2xkZXJcbiMjI1xuXG4jIHV0aWxzXG5cbndpbmRvdy5kZWxheSA9IHJlcXVpcmUgJy4vZ2xvYmFscy9kZWxheSdcblxud2luZG93LmludGVydmFsICA9IHJlcXVpcmUgJy4vZ2xvYmFscy9pbnRlcnZhbCdcblxud2luZG93LmxvZyAgID0gcmVxdWlyZSAnLi9nbG9iYWxzL2xvZydcblxud2luZG93Lm1vdmVyID0gcmVxdWlyZSAnLi9nbG9iYWxzL21vdmVyJ1xuXG4jIHdpZGVseSB1c2VkIG1vZHVsZXNcblxud2luZG93LmhhcHBlbnMgPSByZXF1aXJlICdoYXBwZW5zJ1xuXG53aW5kb3cuYXBpID0gXG4gIGxvb3BjYXN0OiByZXF1aXJlICcuL2FwaS9sb29wY2FzdC9sb29wY2FzdCdcblxubW9kdWxlLmV4cG9ydHMgPSB3aW5kb3ciXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztDQUFBO0FBTUEsQ0FOQSxFQU1lLEVBQWYsQ0FBTSxDQUFTLFVBQUE7O0FBRWYsQ0FSQSxFQVFtQixHQUFiLENBQWEsQ0FBbkIsWUFBbUI7O0FBRW5CLENBVkEsRUFVQSxHQUFNLENBQVMsUUFBQTs7QUFFZixDQVpBLEVBWWUsRUFBZixDQUFNLENBQVMsVUFBQTs7QUFJZixDQWhCQSxFQWdCaUIsR0FBWCxDQUFOLEVBQWlCOztBQUVqQixDQWxCQSxFQWtCQSxHQUFNO0NBQ0osQ0FBQSxLQUFVLENBQVYsaUJBQVU7Q0FuQlosQ0FBQTs7QUFxQkEsQ0FyQkEsRUFxQmlCLEdBQVgsQ0FBTiJ9fSx7Im9mZnNldCI6eyJsaW5lIjoxMTA1MCwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL2dsb2JhbHMvZGVsYXkuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gKCBkZWxheSwgZnVuayApIC0+IHNldFRpbWVvdXQgZnVuaywgZGVsYXkiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsQ0FBTyxDQUFtQixDQUFULENBQUEsQ0FBQSxDQUFYLENBQU4sRUFBbUI7Q0FBNEIsQ0FBTSxFQUFqQixDQUFBLElBQUEsQ0FBQTtDQUFuQiJ9fSx7Im9mZnNldCI6eyJsaW5lIjoxMTA1NiwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL2dsb2JhbHMvaW50ZXJ2YWwuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gKCBpbnRlcnZhbCwgZnVuayApIC0+IHNldEludGVydmFsIGZ1bmssIGludGVydmFsIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLENBQU8sQ0FBc0IsQ0FBWixDQUFBLEVBQVgsQ0FBTixDQUFpQixDQUFFO0NBQWdDLENBQU0sRUFBbEIsSUFBQSxDQUFBLEVBQUE7Q0FBdEIifX0seyJvZmZzZXQiOnsibGluZSI6MTEwNjIsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy9nbG9iYWxzL2xvZy5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSAtPlxuXHRsb2cuaGlzdG9yeSA9IGxvZy5oaXN0b3J5IG9yIFtdICMgc3RvcmUgbG9ncyB0byBhbiBhcnJheSBmb3IgcmVmZXJlbmNlXG5cdGxvZy5oaXN0b3J5LnB1c2ggYXJndW1lbnRzXG5cblx0aWYgY29uc29sZT9cblx0XHRjb25zb2xlLmxvZyBBcnJheTo6c2xpY2UuY2FsbChhcmd1bWVudHMpIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLENBQU8sRUFBVSxHQUFYLENBQU4sRUFBaUI7Q0FDaEIsQ0FBQSxDQUFHLENBQTBCLEdBQTdCO0NBQUEsQ0FDQSxDQUFHLENBQUgsR0FBVyxFQUFYO0NBRUEsQ0FBQSxFQUFHLDhDQUFIO0NBQ1MsRUFBUixDQUFZLENBQUssRUFBVixFQUFZLEVBQW5CO0lBTGU7Q0FBQSJ9fSx7Im9mZnNldCI6eyJsaW5lIjoxMTA3MiwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL2dsb2JhbHMvbW92ZXIuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gXG5cdHNjcm9sbF90byA6IChlbCwgd2l0aF90b3BiYXIgPSBmYWxzZSwgc3BlZWQgPSAzMDApIC0+XG5cblx0XHR5ID0gZWwucG9zaXRpb24oKS50b3BcblxuXHRcdGxvZyBcIltNb3Zlcl0gc2Nyb2xsX3RvXCIsIHlcblx0XHRAc2Nyb2xsX3RvX3kgeSwgd2l0aF90b3BiYXIsIHNwZWVkXG5cdFx0XG5cblx0c2Nyb2xsX3RvX3k6ICh5LCB3aXRoX3RvcGJhciA9IHRydWUsIHNwZWVkID0gMzAwKSAtPlxuXHRcdGlmIHdpdGhfdG9wYmFyXG5cdFx0XHR5IC09IGFwcC5zZXR0aW5ncy5oZWFkZXJfaGVpZ2h0XG5cblx0XHRsb2cgXCJbbW92ZXJdIHNjcm9sbF90b195XCIsIHlcblxuXHRcdHkgKz0gMjBcblx0XHRcblx0XHQkKCAnaHRtbCwgYm9keScgKS5hbmltYXRlIHNjcm9sbFRvcDogeSwgc3BlZWQiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsQ0FBTyxFQUNOLEdBREssQ0FBTjtDQUNDLENBQUEsQ0FBWSxFQUFBLElBQVosRUFBWTtDQUVYLE9BQUE7O0dBRjhCLEdBQWQ7TUFFaEI7O0dBRjZDLEdBQVI7TUFFckM7Q0FBQSxDQUFNLENBQUYsQ0FBSixJQUFJO0NBQUosQ0FFeUIsQ0FBekIsQ0FBQSxlQUFBO0NBQ0MsQ0FBZSxFQUFmLENBQUQsTUFBQTtDQUxELEVBQVk7Q0FBWixDQVFBLENBQWEsRUFBQSxJQUFDLEVBQWQ7O0dBQStCLEdBQWQ7TUFDaEI7O0dBRDRDLEdBQVI7TUFDcEM7Q0FBQSxHQUFBLE9BQUE7Q0FDQyxFQUFRLENBQUgsRUFBTCxFQUFpQixLQUFqQjtNQUREO0NBQUEsQ0FHMkIsQ0FBM0IsQ0FBQSxpQkFBQTtDQUhBLENBQUEsRUFLQTtDQUVBLE1BQUEsSUFBQSxDQUFBO0NBQTBCLENBQVcsSUFBWCxHQUFBO0NBUmQsQ0FRNEIsR0FBeEMsQ0FBQTtDQWhCRCxFQVFhO0NBVGQsQ0FBQSJ9fSx7Im9mZnNldCI6eyJsaW5lIjoxMTEwNSwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3V0aWxzL2Jyb3dzZXIuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIkJyb3dzZXJEZXRlY3QgPVxuXHRpbml0OiAoICkgLT5cblx0XHRAYnJvd3NlciA9IEBzZWFyY2hTdHJpbmcoQGRhdGFCcm93c2VyKSBvciBcIkFuIHVua25vd24gYnJvd3NlclwiXG5cdFx0QHZlcnNpb24gPSBAc2VhcmNoVmVyc2lvbihuYXZpZ2F0b3IudXNlckFnZW50KSBvciBAc2VhcmNoVmVyc2lvbihuYXZpZ2F0b3IuYXBwVmVyc2lvbikgb3IgXCJhbiB1bmtub3duIHZlcnNpb25cIlxuXHRcdEBPUyA9IEBzZWFyY2hTdHJpbmcoQGRhdGFPUykgb3IgXCJhbiB1bmtub3duIE9TXCJcblxuXHRzZWFyY2hTdHJpbmc6IChkYXRhKSAtPlxuXHRcdGkgPSAwXG5cblx0XHR3aGlsZSBpIDwgZGF0YS5sZW5ndGhcblx0XHRcdGRhdGFTdHJpbmcgPSBkYXRhW2ldLnN0cmluZ1xuXHRcdFx0ZGF0YVByb3AgPSBkYXRhW2ldLnByb3Bcblx0XHRcdEB2ZXJzaW9uU2VhcmNoU3RyaW5nID0gZGF0YVtpXS52ZXJzaW9uU2VhcmNoIG9yIGRhdGFbaV0uaWRlbnRpdHlcblx0XHRcdGlmIGRhdGFTdHJpbmdcblx0XHRcdFx0cmV0dXJuIGRhdGFbaV0uaWRlbnRpdHkgIHVubGVzcyBkYXRhU3RyaW5nLmluZGV4T2YoZGF0YVtpXS5zdWJTdHJpbmcpIGlzIC0xXG5cdFx0XHRlbHNlIHJldHVybiBkYXRhW2ldLmlkZW50aXR5ICBpZiBkYXRhUHJvcFxuXHRcdFx0aSsrXG5cdFx0cmV0dXJuXG5cblx0c2VhcmNoVmVyc2lvbjogKGRhdGFTdHJpbmcpIC0+XG5cdFx0aW5kZXggPSBkYXRhU3RyaW5nLmluZGV4T2YoQHZlcnNpb25TZWFyY2hTdHJpbmcpXG5cdFx0cmV0dXJuICBpZiBpbmRleCBpcyAtMVxuXHRcdHBhcnNlRmxvYXQgZGF0YVN0cmluZy5zdWJzdHJpbmcoaW5kZXggKyBAdmVyc2lvblNlYXJjaFN0cmluZy5sZW5ndGggKyAxKVxuXG5cdGRhdGFCcm93c2VyOiBbXG5cdFx0e1xuXHRcdFx0c3RyaW5nOiBuYXZpZ2F0b3IudXNlckFnZW50XG5cdFx0XHRzdWJTdHJpbmc6IFwiQ2hyb21lXCJcblx0XHRcdGlkZW50aXR5OiBcIkNocm9tZVwiXG5cdFx0fVxuXHRcdHtcblx0XHRcdHN0cmluZzogbmF2aWdhdG9yLnVzZXJBZ2VudFxuXHRcdFx0c3ViU3RyaW5nOiBcIk9tbmlXZWJcIlxuXHRcdFx0dmVyc2lvblNlYXJjaDogXCJPbW5pV2ViL1wiXG5cdFx0XHRpZGVudGl0eTogXCJPbW5pV2ViXCJcblx0XHR9XG5cdFx0e1xuXHRcdFx0c3RyaW5nOiBuYXZpZ2F0b3IudmVuZG9yXG5cdFx0XHRzdWJTdHJpbmc6IFwiQXBwbGVcIlxuXHRcdFx0aWRlbnRpdHk6IFwiU2FmYXJpXCJcblx0XHRcdHZlcnNpb25TZWFyY2g6IFwiVmVyc2lvblwiXG5cdFx0fVxuXHRcdHtcblx0XHRcdHByb3A6IHdpbmRvdy5vcGVyYVxuXHRcdFx0aWRlbnRpdHk6IFwiT3BlcmFcIlxuXHRcdFx0dmVyc2lvblNlYXJjaDogXCJWZXJzaW9uXCJcblx0XHR9XG5cdFx0e1xuXHRcdFx0c3RyaW5nOiBuYXZpZ2F0b3IudmVuZG9yXG5cdFx0XHRzdWJTdHJpbmc6IFwiaUNhYlwiXG5cdFx0XHRpZGVudGl0eTogXCJpQ2FiXCJcblx0XHR9XG5cdFx0e1xuXHRcdFx0c3RyaW5nOiBuYXZpZ2F0b3IudmVuZG9yXG5cdFx0XHRzdWJTdHJpbmc6IFwiS0RFXCJcblx0XHRcdGlkZW50aXR5OiBcIktvbnF1ZXJvclwiXG5cdFx0fVxuXHRcdHtcblx0XHRcdHN0cmluZzogbmF2aWdhdG9yLnVzZXJBZ2VudFxuXHRcdFx0c3ViU3RyaW5nOiBcIkZpcmVmb3hcIlxuXHRcdFx0aWRlbnRpdHk6IFwiRmlyZWZveFwiXG5cdFx0fVxuXHRcdHtcblx0XHRcdHN0cmluZzogbmF2aWdhdG9yLnZlbmRvclxuXHRcdFx0c3ViU3RyaW5nOiBcIkNhbWlub1wiXG5cdFx0XHRpZGVudGl0eTogXCJDYW1pbm9cIlxuXHRcdH1cblx0XHR7XG5cdFx0XHQjIGZvciBuZXdlciBOZXRzY2FwZXMgKDYrKVxuXHRcdFx0c3RyaW5nOiBuYXZpZ2F0b3IudXNlckFnZW50XG5cdFx0XHRzdWJTdHJpbmc6IFwiTmV0c2NhcGVcIlxuXHRcdFx0aWRlbnRpdHk6IFwiTmV0c2NhcGVcIlxuXHRcdH1cblx0XHR7XG5cdFx0XHRzdHJpbmc6IG5hdmlnYXRvci51c2VyQWdlbnRcblx0XHRcdHN1YlN0cmluZzogXCJNU0lFXCJcblx0XHRcdGlkZW50aXR5OiBcIkV4cGxvcmVyXCJcblx0XHRcdHZlcnNpb25TZWFyY2g6IFwiTVNJRVwiXG5cdFx0fVxuXHRcdHtcblx0XHRcdHN0cmluZzogbmF2aWdhdG9yLnVzZXJBZ2VudFxuXHRcdFx0c3ViU3RyaW5nOiBcIkdlY2tvXCJcblx0XHRcdGlkZW50aXR5OiBcIk1vemlsbGFcIlxuXHRcdFx0dmVyc2lvblNlYXJjaDogXCJydlwiXG5cdFx0fVxuXHRcdHtcblx0XHRcdCMgZm9yIG9sZGVyIE5ldHNjYXBlcyAoNC0pXG5cdFx0XHRzdHJpbmc6IG5hdmlnYXRvci51c2VyQWdlbnRcblx0XHRcdHN1YlN0cmluZzogXCJNb3ppbGxhXCJcblx0XHRcdGlkZW50aXR5OiBcIk5ldHNjYXBlXCJcblx0XHRcdHZlcnNpb25TZWFyY2g6IFwiTW96aWxsYVwiXG5cdFx0fVxuXHRdXG5cdGRhdGFPUzogW1xuXHRcdHtcblx0XHRcdHN0cmluZzogbmF2aWdhdG9yLnBsYXRmb3JtXG5cdFx0XHRzdWJTdHJpbmc6IFwiV2luXCJcblx0XHRcdGlkZW50aXR5OiBcIldpbmRvd3NcIlxuXHRcdH1cblx0XHR7XG5cdFx0XHRzdHJpbmc6IG5hdmlnYXRvci5wbGF0Zm9ybVxuXHRcdFx0c3ViU3RyaW5nOiBcIk1hY1wiXG5cdFx0XHRpZGVudGl0eTogXCJNYWNcIlxuXHRcdH1cblx0XHR7XG5cdFx0XHRzdHJpbmc6IG5hdmlnYXRvci51c2VyQWdlbnRcblx0XHRcdHN1YlN0cmluZzogXCJpUGhvbmVcIlxuXHRcdFx0aWRlbnRpdHk6IFwiaVBob25lL2lQb2RcIlxuXHRcdH1cblx0XHR7XG5cdFx0XHRzdHJpbmc6IG5hdmlnYXRvci5wbGF0Zm9ybVxuXHRcdFx0c3ViU3RyaW5nOiBcIkxpbnV4XCJcblx0XHRcdGlkZW50aXR5OiBcIkxpbnV4XCJcblx0XHR9XG5cdF1cblxuQnJvd3NlckRldGVjdC5pbml0KClcblxubW9kdWxlLmV4cG9ydHMgPSBCcm93c2VyRGV0ZWN0Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsU0FBQTs7QUFBQSxDQUFBLEVBQ0MsVUFERDtDQUNDLENBQUEsQ0FBTSxDQUFOLEtBQU07Q0FDTCxFQUFXLENBQVgsR0FBQSxJQUFXLENBQUEsUUFBWDtDQUFBLEVBQ1csQ0FBWCxHQUFBLEVBQW1DLENBQWUsR0FBdkMsT0FEWDtDQUVDLENBQUQsQ0FBTSxDQUFMLEVBQUssS0FBTixDQUFNO0NBSFAsRUFBTTtDQUFOLENBS0EsQ0FBYyxDQUFBLEtBQUMsR0FBZjtDQUNDLE9BQUEsZUFBQTtDQUFBLEVBQUksQ0FBSjtDQUVBLEVBQVUsQ0FBSSxFQUFkLEtBQU07Q0FDTCxFQUFhLENBQUssRUFBbEIsSUFBQTtDQUFBLEVBQ1csQ0FBSyxFQUFoQixFQUFBO0NBREEsRUFFdUIsQ0FBdEIsRUFBRCxFQUZBLEtBRXVCLE1BQXZCO0NBQ0EsR0FBRyxFQUFILElBQUE7QUFDMkUsQ0FBMUUsR0FBZ0MsQ0FBeUMsRUFBekMsQ0FBaEMsQ0FBZ0MsQ0FBVTtDQUExQyxHQUFZLElBQVosU0FBTztVQURSO01BQUEsRUFBQTtDQUVLLEdBQTRCLElBQTVCO0NBQUEsR0FBWSxJQUFaLFNBQU87VUFGWjtRQUhBO0FBTUEsQ0FOQSxDQUFBLElBTUE7Q0FWWSxJQUdiO0NBUkQsRUFLYztDQUxkLENBa0JBLENBQWUsTUFBQyxDQUFELEdBQWY7Q0FDQyxJQUFBLEdBQUE7Q0FBQSxFQUFRLENBQVIsQ0FBQSxFQUFRLEdBQVUsU0FBVjtBQUNhLENBQXJCLEdBQUEsQ0FBVztDQUFYLFdBQUE7TUFEQTtDQUVXLEVBQTZCLENBQUMsQ0FBVCxDQUFBLEdBQXJCLENBQVgsQ0FBQSxRQUE0RDtDQXJCN0QsRUFrQmU7Q0FsQmYsQ0F1QkEsU0FBQTtLQUNDO0NBQUEsQ0FDUyxJQUFSLEdBQWlCO0NBRGxCLENBRVksSUFBWCxFQUZELENBRUM7Q0FGRCxDQUdXLElBQVYsRUFBQTtFQUVELElBTlk7Q0FNWixDQUNTLElBQVIsR0FBaUI7Q0FEbEIsQ0FFWSxJQUFYLEdBQUE7Q0FGRCxDQUdnQixJQUFmLElBSEQsR0FHQztDQUhELENBSVcsSUFBVixFQUFBLENBSkQ7RUFNQSxJQVpZO0NBWVosQ0FDUyxJQUFSLEdBQWlCO0NBRGxCLENBRVksSUFBWCxDQUZELEVBRUM7Q0FGRCxDQUdXLElBQVYsRUFBQTtDQUhELENBSWdCLElBQWYsR0FKRCxJQUlDO0VBRUQsSUFsQlk7Q0FrQlosQ0FDTyxFQUFOLENBREQsQ0FDQztDQURELENBRVcsSUFBVixDQUZELENBRUM7Q0FGRCxDQUdnQixJQUFmLEdBSEQsSUFHQztFQUVELElBdkJZO0NBdUJaLENBQ1MsSUFBUixHQUFpQjtDQURsQixDQUVZLElBQVgsR0FBQTtDQUZELENBR1csSUFBVixFQUFBO0VBRUQsSUE1Qlk7Q0E0QlosQ0FDUyxJQUFSLEdBQWlCO0NBRGxCLENBRVksR0FGWixDQUVDLEdBQUE7Q0FGRCxDQUdXLElBQVYsRUFBQSxHQUhEO0VBS0EsSUFqQ1k7Q0FpQ1osQ0FDUyxJQUFSLEdBQWlCO0NBRGxCLENBRVksSUFBWCxHQUFBO0NBRkQsQ0FHVyxJQUFWLEVBQUEsQ0FIRDtFQUtBLElBdENZO0NBc0NaLENBQ1MsSUFBUixHQUFpQjtDQURsQixDQUVZLElBQVgsRUFGRCxDQUVDO0NBRkQsQ0FHVyxJQUFWLEVBQUE7RUFFRCxJQTNDWTtDQTJDWixDQUVTLElBQVIsR0FBaUI7Q0FGbEIsQ0FHWSxJQUFYLEdBQUEsQ0FIRDtDQUFBLENBSVcsSUFBVixFQUFBLEVBSkQ7RUFNQSxJQWpEWTtDQWlEWixDQUNTLElBQVIsR0FBaUI7Q0FEbEIsQ0FFWSxJQUFYLEdBQUE7Q0FGRCxDQUdXLElBQVYsRUFBQSxFQUhEO0NBQUEsQ0FJZ0IsSUFBZixPQUFBO0VBRUQsSUF2RFk7Q0F1RFosQ0FDUyxJQUFSLEdBQWlCO0NBRGxCLENBRVksSUFBWCxDQUZELEVBRUM7Q0FGRCxDQUdXLElBQVYsRUFBQSxDQUhEO0NBQUEsQ0FJZ0IsRUFKaEIsRUFJQyxPQUFBO0VBRUQsSUE3RFk7Q0E2RFosQ0FFUyxJQUFSLEdBQWlCO0NBRmxCLENBR1ksSUFBWCxHQUFBO0NBSEQsQ0FJVyxJQUFWLEVBQUEsRUFKRDtDQUFBLENBS2dCLElBQWYsR0FMRCxJQUtDO01BbEVXO0lBdkJiO0NBQUEsQ0E0RkEsSUFBQTtLQUNDO0NBQUEsQ0FDUyxJQUFSLEVBREQsQ0FDa0I7Q0FEbEIsQ0FFWSxHQUZaLENBRUMsR0FBQTtDQUZELENBR1csSUFBVixFQUFBLENBSEQ7RUFLQSxJQU5PO0NBTVAsQ0FDUyxJQUFSLEVBREQsQ0FDa0I7Q0FEbEIsQ0FFWSxHQUZaLENBRUMsR0FBQTtDQUZELENBR1csR0FIWCxDQUdDLEVBQUE7RUFFRCxJQVhPO0NBV1AsQ0FDUyxJQUFSLEdBQWlCO0NBRGxCLENBRVksSUFBWCxFQUZELENBRUM7Q0FGRCxDQUdXLElBQVYsRUFBQSxLQUhEO0VBS0EsSUFoQk87Q0FnQlAsQ0FDUyxJQUFSLEVBREQsQ0FDa0I7Q0FEbEIsQ0FFWSxJQUFYLENBRkQsRUFFQztDQUZELENBR1csSUFBVixDQUhELENBR0M7TUFuQk07SUE1RlI7Q0FERCxDQUFBOztBQW9IQSxDQXBIQSxHQW9IQSxTQUFhOztBQUViLENBdEhBLEVBc0hpQixHQUFYLENBQU4sTUF0SEEifX0seyJvZmZzZXQiOnsibGluZSI6MTEyMjMsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy91dGlscy9oYXBwZW5zX2Rlc3Ryb3kuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gKCBvYmogKSAtPlxuICBpZiBvYmouZW1pdD9cbiAgICBvYmoub24gICAgICAgICAgPSBudWxsXG4gICAgb2JqLm9uY2UgICAgICAgID0gbnVsbFxuICAgIG9iai5vZmYgICAgICAgICA9IG51bGxcbiAgICBvYmouZW1pdCAgICAgICAgPSBudWxsXG4gICAgb2JqLl9fbGlzdGVuZXJzID0gbnVsbFxuICAgIG9iai5fX2luaXQgICAgICA9IG51bGwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsQ0FBTyxFQUFVLEdBQVgsQ0FBTixFQUFtQjtDQUNqQixDQUFBLEVBQUcsWUFBSDtDQUNFLENBQUEsQ0FBRyxDQUFIO0NBQUEsRUFDRyxDQUFIO0NBREEsRUFFRyxDQUFIO0NBRkEsRUFHRyxDQUFIO0NBSEEsRUFJRyxDQUFILE9BQUE7Q0FDSSxFQUFELEdBQUgsS0FBQTtJQVBhO0NBQUEifX0seyJvZmZzZXQiOnsibGluZSI6MTEyMzYsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy91dGlscy9pbWFnZXMvdHJhbnNmb3JtLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IFxuICB0b3BfYmFyOiAoIHVybCApIC0+IFxuXG4gICAgaWYgbm90IHVybD8gb3IgdXJsLmluZGV4T2YoIFwidXBsb2FkL1wiICkgPCAwXG4gICAgICByZXR1cm4gXCIvaW1hZ2VzL3Byb2ZpbGUtNDkuanBnXCJcbiAgICBlbHNlXG4gICAgICB1cmwucmVwbGFjZSBcInVwbG9hZC9cIiwgXCJ1cGxvYWQvd180OSxoXzQ5LGNfZmlsbCxnX25vcnRoL1wiXG5cbiAgYXZhdGFyOiAoIHVybCApIC0+IFxuICAgIGlmIG5vdCB1cmw/IG9yIHVybC5pbmRleE9mKCBcInVwbG9hZC9cIiApIDwgMFxuICAgICAgcmV0dXJuIFwiL2ltYWdlcy9wcm9maWxlLTE1MC5qcGdcIlxuICAgIGVsc2VcbiAgICAgIHVybC5yZXBsYWNlIFwidXBsb2FkL1wiLCBcInVwbG9hZC93XzE1MCxoXzE1MCxjX2ZpbGwsZ19ub3J0aC9cIlxuXG4gIGNvdmVyOiAoIHVybCApIC0+IFxuICAgIGlmIG5vdCB1cmw/IG9yIHVybC5pbmRleE9mKCBcInVwbG9hZC9cIiApIDwgMFxuICAgICAgcmV0dXJuIFwiL2ltYWdlcy9wcm9maWxlLTE1MC5qcGdcIlxuICAgIGVsc2VcbiAgICAgIHVybC5yZXBsYWNlIFwidXBsb2FkL1wiLCBcInVwbG9hZC93XzEwMDAsaF80MDAsY19maWxsLGdfbm9ydGgvXCJcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxDQUFPLEVBQ0wsR0FESSxDQUFOO0NBQ0UsQ0FBQSxDQUFTLElBQVQsRUFBVztDQUVULEVBQWtCLENBQWxCLEdBQWUsRUFBQSxJQUFaO0NBQ0QsWUFBTyxXQUFQO01BREY7Q0FHTSxDQUFtQixDQUFwQixJQUFILEVBQUEsSUFBQSxxQkFBQTtNQUxLO0NBQVQsRUFBUztDQUFULENBT0EsQ0FBUSxHQUFSLEdBQVU7Q0FDUixFQUFrQixDQUFsQixHQUFlLEVBQUEsSUFBWjtDQUNELFlBQU8sWUFBUDtNQURGO0NBR00sQ0FBbUIsQ0FBcEIsSUFBSCxFQUFBLElBQUEsdUJBQUE7TUFKSTtDQVBSLEVBT1E7Q0FQUixDQWFBLENBQU8sRUFBUCxJQUFTO0NBQ1AsRUFBa0IsQ0FBbEIsR0FBZSxFQUFBLElBQVo7Q0FDRCxZQUFPLFlBQVA7TUFERjtDQUdNLENBQW1CLENBQXBCLElBQUgsRUFBQSxJQUFBLHdCQUFBO01BSkc7Q0FiUCxFQWFPO0NBZFQsQ0FBQSJ9fSx7Im9mZnNldCI6eyJsaW5lIjoxMTI2MiwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3V0aWxzL2xvZ2luX3BvcHVwLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJwb3B1cCA9IHJlcXVpcmUgJ2FwcC91dGlscy9wb3B1cCdcbm1vZHVsZS5leHBvcnRzID0gLT5cblx0cG9wdXAgIFxuXHRcdHVybCAgICAgOiAnL2xvZ2luJ1xuXHRcdHRpdGxlICAgOiAnTG9nIEluIH4gTG9vcGNhc3QnXG5cdFx0dyAgICAgICA6IDUwMFxuXHRcdGggICAgICAgOiA1NDBcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLENBQUE7O0FBQUEsQ0FBQSxFQUFRLEVBQVIsRUFBUSxVQUFBOztBQUNSLENBREEsRUFDaUIsR0FBWCxDQUFOLEVBQWlCO0NBRWYsSUFERCxJQUFBO0NBQ0MsQ0FBVSxDQUFWLENBQUEsSUFBQTtDQUFBLENBQ1UsRUFBVixDQUFBLGNBREE7Q0FBQSxDQUVVLENBRlYsQ0FFQTtDQUZBLENBR1UsQ0FIVixDQUdBO0NBTGUsR0FDaEI7Q0FEZ0IifX0seyJvZmZzZXQiOnsibGluZSI6MTEyNzcsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy91dGlscy9vcGFjaXR5LmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJPcGFjaXR5ID0gXG5cdHNob3c6IChlbCwgdGltZSA9IDUwMCkgLT5cblx0XHQjIGxvZyBcIltPcGFjaXR5XSBzaG93XCJcblx0XHRlbC5mYWRlSW4gdGltZVxuXHRcdCMgdCA9IE9wYWNpdHkuZ2V0X3RpbWUoIHRpbWUgKVxuXHRcdCMgZWwuY3NzIFxuXHRcdCMgXHQndmlzaWJpbGl0eScgOiBcInZpc2libGVcIlxuXHRcdCMgXHQndHJhbnNpdGlvbicgOiBcIm9wYWNpdHkgI3t0fSBsaW5lYXJcIlxuXG5cdFx0IyBkZWxheSAxLCAtPlxuXHRcdCMgXHRlbC5jc3MgJ29wYWNpdHknLCAxXG5cblx0aGlkZTogKCBlbCwgdGltZSA9IDUwMCApIC0+XG5cdFx0IyBsb2cgXCJbT3BhY2l0eV0gaGlkZVwiXG5cdFx0ZWwuZmFkZU91dCB0aW1lXG5cblx0XHQjIHQgPSBPcGFjaXR5LmdldF90aW1lIHRpbWVcblx0XHQjIHQxID0gT3BhY2l0eS5nZXRfdGltZSggdGltZSArIDEwMCApXG5cblx0XHQjIGVsLmNzcyAndHJhbnNpdGlvbicsIFwib3BhY2l0eSAje3R9IGxpbmVhclwiXG5cdFx0IyBkZWxheSAxLCAtPiBlbC5jc3MgJ29wYWNpdHknLCAwXG5cdFx0IyBkZWxheSB0MSwgLT4gZWwuY3NzICd2aXNpYmlsaXR5JywgJ2hpZGRlbidcblxuXHRnZXRfdGltZTogKCB0aW1lICkgLT5cblx0XHRyZXR1cm4gKHRpbWUvMTAwMCkgKyBcInNcIlxuXG5tb2R1bGUuZXhwb3J0cyA9IE9wYWNpdHkiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxHQUFBOztBQUFBLENBQUEsRUFDQyxJQUREO0NBQ0MsQ0FBQSxDQUFNLENBQU4sS0FBTzs7R0FBVyxHQUFQO01BRVY7Q0FBRyxDQUFELEVBQUYsRUFBQSxLQUFBO0NBRkQsRUFBTTtDQUFOLENBV0EsQ0FBTSxDQUFOLEtBQVE7O0dBQVcsR0FBUDtNQUVYO0NBQUcsQ0FBRCxFQUFGLEdBQUEsSUFBQTtDQWJELEVBV007Q0FYTixDQXNCQSxDQUFVLENBQUEsSUFBVixDQUFZO0NBQ1gsRUFBYSxDQUFMLE9BQUQ7Q0F2QlIsRUFzQlU7Q0F2QlgsQ0FBQTs7QUEwQkEsQ0ExQkEsRUEwQmlCLEdBQVgsQ0FBTiJ9fSx7Im9mZnNldCI6eyJsaW5lIjoxMTMwMSwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3V0aWxzL3BvcHVwLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9ICggZGF0YSApIC0+XG5cdGxlZnQgPSAoYXBwLndpbmRvdy53LzIpLShkYXRhLncvMilcblx0dG9wID0gKGFwcC53aW5kb3cuaC8yKS0oZGF0YS5oLzIpXG5cblx0cGFyYW1zID0gJ3Rvb2xiYXI9bm8sIGxvY2F0aW9uPW5vLCBkaXJlY3Rvcmllcz1ubywgc3RhdHVzPW5vLCBtZW51YmFyPW5vLCBzY3JvbGxiYXJzPW5vLCByZXNpemFibGU9bm8sIGNvcHloaXN0b3J5PW5vLCB3aWR0aD0nK2RhdGEudysnLCBoZWlnaHQ9JytkYXRhLmgrJywgdG9wPScrdG9wKycsIGxlZnQ9JytsZWZ0XG5cblx0cmV0dXJuIHdpbmRvdy5vcGVuKGRhdGEudXJsLCBkYXRhLnRpdGxlLCBwYXJhbXMpLmZvY3VzKCk7Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLENBQU8sRUFBVSxDQUFBLEVBQVgsQ0FBTixFQUFtQjtDQUNsQixLQUFBLFdBQUE7Q0FBQSxDQUFBLENBQU8sQ0FBUCxFQUFrQjtDQUFsQixDQUNBLENBQUEsQ0FBNEIsRUFBWDtDQURqQixDQUdBLENBQVMsQ0FBMEgsRUFBbkksRUFBUyxDQUFBLEVBQUEsMEdBQUE7Q0FFVCxDQUE2QixDQUF0QixDQUFBLENBQUEsQ0FBTSxHQUFOO0NBTlMifX0seyJvZmZzZXQiOnsibGluZSI6MTEzMTEsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy91dGlscy9wcmVsb2FkLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IChpbWFnZXMsIGNhbGxiYWNrKSAtPlxuXG5cdGNvdW50ID0gMFxuXHRpbWFnZXNfbG9hZGVkID0gW11cblxuXHRsb2FkID0gKCBzcmMsIGNhbGxiYWNrICkgLT5cblx0XHRcdFxuXHRcdGltZyA9IG5ldyBJbWFnZSgpXG5cdFx0aW1nLm9ubG9hZCA9IGNhbGxiYWNrXG5cdFx0aW1nLnNyYyA9IHNyY1xuXG5cdFx0aW1hZ2VzX2xvYWRlZC5wdXNoIGltZ1xuXG5cdGxvYWRlZCA9IC0+XG5cdFx0Y291bnQrK1xuXHRcdCMgbG9nIFwiW1ByZWxvYWRlcl0gbG9hZF9tdWx0aXBsZSAtIGxvYWRlZFwiLCBcIiN7Y291bnR9IC8gI3tpbWFnZXMubGVuZ3RofVwiXG5cblx0XHRpZiBjb3VudCBpcyBpbWFnZXMubGVuZ3RoXG5cdFx0XHQjIGxvZyBcIltQcmVsb2FkZXJdIGxvYWRfbXVsdGlwbGUgLSBsb2FkZWQgQUxMXCJcblx0XHRcdGNhbGxiYWNrKCBpbWFnZXNfbG9hZGVkIClcblxuXHRmb3IgaXRlbSBpbiBpbWFnZXNcblx0XHRsb2FkIGl0ZW0sIGxvYWRlZFxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLENBQU8sQ0FBbUIsQ0FBVCxHQUFYLENBQU4sQ0FBaUIsQ0FBQztDQUVqQixLQUFBLHNEQUFBO0NBQUEsQ0FBQSxDQUFRLEVBQVI7Q0FBQSxDQUNBLENBQWdCLFVBQWhCO0NBREEsQ0FHQSxDQUFPLENBQVAsSUFBTyxDQUFFO0NBRVIsRUFBQSxLQUFBO0NBQUEsRUFBQSxDQUFBLENBQVU7Q0FBVixFQUNHLENBQUgsRUFBQSxFQURBO0NBQUEsRUFFRyxDQUFIO0NBRWMsRUFBZCxDQUFBLE9BQUEsRUFBYTtDQVRkLEVBR087Q0FIUCxDQVdBLENBQVMsR0FBVCxHQUFTO0FBQ1IsQ0FBQSxDQUFBLEVBQUEsQ0FBQTtDQUdBLEdBQUEsQ0FBRyxDQUFlO0NBRVAsT0FBVixLQUFBO01BTk87Q0FYVCxFQVdTO0FBUVQsQ0FBQTtRQUFBLHFDQUFBO3VCQUFBO0NBQ0MsQ0FBVyxFQUFYLEVBQUE7Q0FERDttQkFyQmdCO0NBQUEifX0seyJvZmZzZXQiOnsibGluZSI6MTEzMzgsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy91dGlscy9zZXR0aW5ncy5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiQnJvd3NlckRldGVjdCA9IHJlcXVpcmUgJ2FwcC91dGlscy9icm93c2VyJ1xuXG5zZXR0aW5ncyA9IFxuXG5cdCMgQnJvd3NlciBpZCwgdmVyc2lvbiwgT1Ncblx0YnJvd3Nlcjoge1xuXG5cdFx0IyBJRCBbU3RyaW5nXVxuXHRcdGlkOiBCcm93c2VyRGV0ZWN0LmJyb3dzZXJcblxuXHRcdCMgVmVyc2lvbiBbU3RyaW5nXVxuXHRcdHZlcnNpb246IEJyb3dzZXJEZXRlY3QudmVyc2lvblxuXHRcdFxuXHRcdCMgT1MgW1N0cmluZ11cblx0XHRPUzogQnJvd3NlckRldGVjdC5PU1xuXHRcdFxuXHRcdCMgSXMgQ2hyb21lPyBbQm9vbGVhbl1cblx0XHRjaHJvbWU6IChuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkuaW5kZXhPZiggJ2Nocm9tZScgKSA+IC0xKVxuXG5cdFx0IyBJcyBGaXJlZm94IFtCb29sZWFuXVxuXHRcdGZpcmVmb3g6ICgvRmlyZWZveC9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkpXG5cblx0XHQjIElzIElFOD8gW0Jvb2xlYW5dXG5cdFx0aWU4OiBmYWxzZVxuXG5cdFx0IyBEZXZpY2UgcmF0aW8gW051bWJlcl1cblx0XHRkZXZpY2VfcmF0aW86IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvXG5cblx0XHQjIElzIGEgaGFuZGhlbGQgZGV2aWNlPyBbQm9vbGVhbl1cblx0XHRoYW5kaGVsZDogZmFsc2VcblxuXHRcdCMgSXMgYSB0YWJsZXQ/IFtCb29sZWFuXVxuXHRcdHRhYmxldDogZmFsc2Vcblx0XHRcblx0XHQjIElzIGEgbW9iaWxlPyBbQm9vbGVhbl1cblx0XHRtb2JpbGU6IGZhbHNlXG5cblx0XHQjIElzIGRlc2t0b3A/IFNldCBhZnRlciB0aGUgY2xhc3MgZGVmaW5pdGlvbiBbQm9vbGVhbl1cblx0XHRkZXNrdG9wOiBmYWxzZVxuXG5cdFx0IyBJcyBhIHRhYmxldCBvciBtb2JpbGU/IFtCb29sZWFuXVxuXHRcdGRldmljZTogZmFsc2VcblxuXHRcdCMgRGVidWcgbW9kZSAtIHNldCBieSBlbnYgaW4gaW5kZXgucGhwXG5cdFx0ZGVidWc6IGZhbHNlXG5cblx0XHRjc3NfY292ZXJfc3VwcG9ydGVkOiBNb2Rlcm5penIuYmFja2dyb3VuZHNpemVcblxuXHRcdG1pbl9zaXplOlxuXHRcdFx0dzogOTAwXG5cdFx0XHRoOiA0MDBcblx0fVxuXG5cdCMgVXNlIHRoaXMgZmxhZyBpZiB3ZXJlIGRvaW5nIGtleWZyYW1lIGFuaW1hdGlvbnNcblx0IyBvdGhlcndpc2UgaW1wbGVtZW50IGEganMgZmFsbGJhY2tcblxuXHQjIFdlYnAgc3VwcG9ydFxuXHR3ZWJwOiBmYWxzZVxuXG5zZXR0aW5ncy50aGVtZSA9IFwiZGVza3RvcFwiXG5zZXR0aW5ncy50aHJlc2hvbGRfdGhlbWUgPSA5MDBcblxuXG4jIFJldGluYSBzdXBwb3J0ZWQgW0Jvb2xlYW5dXG5zZXR0aW5ncy5icm93c2VyLnJldGluYSA9IHNldHRpbmdzLmJyb3dzZXIuZGV2aWNlX3JhdGlvIGlzIDJcblxuIyBXZWJwIHRlc3RcbmlmIHNldHRpbmdzLmJyb3dzZXIuY2hyb21lIGFuZCBzZXR0aW5ncy5icm93c2VyLnZlcnNpb24gPj0gMzBcblx0c2V0dGluZ3Mud2VicCA9IHRydWVcblxuIyBGbGFncyBmb3IgSUVcbmlmIHNldHRpbmdzLmJyb3dzZXIuaWQgaXMgJ0V4cGxvcmVyJyBcblx0c2V0dGluZ3MuYnJvd3Nlci5pZSA9IHRydWVcblx0aWYgc2V0dGluZ3MuYnJvd3Nlci52ZXJzaW9uIGlzIDhcblx0XHRzZXR0aW5ncy5icm93c2VyLmllOCA9IHRydWVcblx0aWYgc2V0dGluZ3MuYnJvd3Nlci52ZXJzaW9uIGlzIDlcblx0XHRzZXR0aW5ncy5icm93c2VyLmllOSA9IHRydWVcblxuXG4jIElmIGl0J3MgYW4gaGFuZGhlbGQgZGV2aWNlXG5zZXR0aW5ncy52aWRlb19hY3RpdmUgPSBzZXR0aW5ncy5icm93c2VyLmlkIGlzbnQgJ0V4cGxvcmVyJ1xuXG5cblxuaWYoIC9BbmRyb2lkfHdlYk9TfGlQaG9uZXxpUGFkfGlQb2R8QmxhY2tCZXJyeXxJRU1vYmlsZXxPcGVyYSBNaW5pL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSApXG5cdHNldHRpbmdzLmJyb3dzZXIuaGFuZGhlbGQgPSB0cnVlXG5cblx0IyBDaGVjayBpZiBpdCdzIG1vYmlsZSBvciB0YWJsZXQgY2FsY3VsYXRpbmcgcmF0aW8gYW5kIG9yaWVudGF0aW9uXG5cdHJhdGlvID0gJCh3aW5kb3cpLndpZHRoKCkvJCh3aW5kb3cpLmhlaWdodCgpXG5cdHNldHRpbmdzLmJyb3dzZXIub3JpZW50YXRpb24gPSBpZiByYXRpbyA+IDEgdGhlbiBcImxhbmRzY2FwZVwiIGVsc2UgXCJwb3J0cmFpdFwiXG5cblx0IyBjaGVjayBtYXggd2lkdGggZm9yIG1vYmlsZSBkZXZpY2UgKG5leHVzIDcgaW5jbHVkZWQpXG5cdGlmICQod2luZG93KS53aWR0aCgpIDwgNjEwIG9yIChzZXR0aW5ncy5icm93c2VyLm9yaWVudGF0aW9uIGlzIFwibGFuZHNjYXBlXCIgYW5kIHJhdGlvID4gMi4xMCApXG5cdFx0c2V0dGluZ3MuYnJvd3Nlci5tb2JpbGUgPSB0cnVlXG5cdFx0c2V0dGluZ3MuYnJvd3Nlci50YWJsZXQgPSBmYWxzZVxuXHRlbHNlXG5cdFx0c2V0dGluZ3MuYnJvd3Nlci5tb2JpbGUgPSBmYWxzZVxuXHRcdHNldHRpbmdzLmJyb3dzZXIudGFibGV0ID0gdHJ1ZVxuXG5zZXR0aW5ncy5icm93c2VyLmRldmljZSA9IChzZXR0aW5ncy5icm93c2VyLnRhYmxldCBvciBzZXR0aW5ncy5icm93c2VyLm1vYmlsZSlcblxuIyBTZXQgZGVza3RvcCBmbGFnXG5pZiBzZXR0aW5ncy5icm93c2VyLnRhYmxldCBpcyBmYWxzZSBhbmQgIHNldHRpbmdzLmJyb3dzZXIubW9iaWxlIGlzIGZhbHNlXG5cdHNldHRpbmdzLmJyb3dzZXIuZGVza3RvcCA9IHRydWVcblxuXG5zZXR0aW5ncy5icm93c2VyLndpbmRvd3NfcGhvbmUgPSBmYWxzZVxuaWYgc2V0dGluZ3MuYnJvd3Nlci5tb2JpbGUgYW5kIHNldHRpbmdzLmJyb3dzZXIuaWQgaXMgJ0V4cGxvcmVyJ1xuXHRzZXR0aW5ncy5icm93c2VyLndpbmRvd3NfcGhvbmUgPSB0cnVlXG5cblxuc2V0dGluZ3MudG91Y2hfZGV2aWNlID0gc2V0dGluZ3MuYnJvd3Nlci5oYW5kaGVsZFxuXG4jIFBsYXRmb3JtIHNwZWNpZmljIGV2ZW50cyBtYXBcbnNldHRpbmdzLmV2ZW50c19tYXAgPVxuXHQnZG93bicgOiAnbW91c2Vkb3duJ1xuXHQndXAnICAgOiAnbW91c2V1cCdcblx0J21vdmUnIDogJ21vdXNlbW92ZSdcblxuaWYgc2V0dGluZ3MuYnJvd3Nlci5kZXZpY2VcblxuXHRpZiBzZXR0aW5ncy5icm93c2VyLndpbmRvd3NfcGhvbmVcblx0XHRzZXR0aW5ncy5ldmVudHNfbWFwID1cblx0XHRcdCdkb3duJyA6ICdNU1BvaW50ZXJEb3duJ1xuXHRcdFx0J3VwJyAgIDogJ01TUG9pbnRlclVwJ1xuXHRcdFx0J21vdmUnIDogJ01TUG9pbnRlck1vdmUnXG5cdFx0XHRcblx0ZWxzZVxuXHRcdHNldHRpbmdzLmV2ZW50c19tYXAgPVxuXHRcdFx0J2Rvd24nIDogJ3RvdWNoc3RhcnQnXG5cdFx0XHQndXAnICAgOiAndG91Y2hlbmQnXG5cdFx0XHQnbW92ZScgOiAndG91Y2htb3ZlJ1xuXG5cblxuXG4jIFBsYXRmb3JtIGNsYXNzXG5pZiBzZXR0aW5ncy5icm93c2VyLmRlc2t0b3Bcblx0cGxhdGZvcm0gPSAnZGVza3RvcCdcbmVsc2UgaWYgc2V0dGluZ3MuYnJvd3Nlci50YWJsZXRcblx0cGxhdGZvcm0gPSAndGFibGV0J1xuZWxzZVxuXHRwbGF0Zm9ybSA9ICdtb2JpbGUnXG5cblxuc2V0dGluZ3MuYWZ0ZXJfbG9naW5fdXJsID0gXCJcIlxuXG4jIEJyb3dzZXIgY2xhc3MgZm9yIHRoZSBib2R5XG5zZXR0aW5ncy5icm93c2VyX2NsYXNzID0gc2V0dGluZ3MuYnJvd3Nlci5pZCArICdfJyArIHNldHRpbmdzLmJyb3dzZXIudmVyc2lvblxuXG5oYXMzZCA9IC0+XG5cdGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIilcblx0aGFzM2QgPSB1bmRlZmluZWRcblx0dHJhbnNmb3JtcyA9XG5cdFx0d2Via2l0VHJhbnNmb3JtOiBcIi13ZWJraXQtdHJhbnNmb3JtXCJcblx0XHRPVHJhbnNmb3JtOiBcIi1vLXRyYW5zZm9ybVwiXG5cdFx0bXNUcmFuc2Zvcm06IFwiLW1zLXRyYW5zZm9ybVwiXG5cdFx0TW96VHJhbnNmb3JtOiBcIi1tb3otdHJhbnNmb3JtXCJcblx0XHR0cmFuc2Zvcm06IFwidHJhbnNmb3JtXCJcblxuXG5cdCMgQWRkIGl0IHRvIHRoZSBib2R5IHRvIGdldCB0aGUgY29tcHV0ZWQgc3R5bGUuXG5cdGRvY3VtZW50LmJvZHkuaW5zZXJ0QmVmb3JlIGVsLCBudWxsXG5cdGZvciB0IG9mIHRyYW5zZm9ybXNcblx0XHRpZiBlbC5zdHlsZVt0XSBpc250IGB1bmRlZmluZWRgXG5cdFx0XHRlbC5zdHlsZVt0XSA9IFwidHJhbnNsYXRlM2QoMXB4LDFweCwxcHgpXCJcblx0XHRcdGhhczNkID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWwpLmdldFByb3BlcnR5VmFsdWUodHJhbnNmb3Jtc1t0XSlcblx0ZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZCBlbFxuXHRoYXMzZCBpc250IGB1bmRlZmluZWRgIGFuZCBoYXMzZC5sZW5ndGggPiAwIGFuZCBoYXMzZCBpc250IFwibm9uZVwiXG5cblxuIyBzZXR0aW5ncy5oYXMzZCA9IGhhczNkKClcblxuXG5cbnNldHRpbmdzLmJpbmQgPSAoYm9keSktPlxuXHRrbGFzc2VzID0gW11cblx0a2xhc3Nlcy5wdXNoIHNldHRpbmdzLmJyb3dzZXJfY2xhc3Ncblx0a2xhc3Nlcy5wdXNoIHNldHRpbmdzLmJyb3dzZXIuT1MucmVwbGFjZSggJy8nLCAnXycgKVxuXHRrbGFzc2VzLnB1c2ggc2V0dGluZ3MuYnJvd3Nlci5pZFxuXG5cdGlmIHNldHRpbmdzLnRvdWNoX2RldmljZVxuXHRcdGtsYXNzZXMucHVzaCBcInRvdWNoX2RldmljZVwiXG5cdGVsc2Vcblx0XHRrbGFzc2VzLnB1c2ggXCJub190b3VjaF9kZXZpY2VcIlxuXG5cdGlmIHNldHRpbmdzLmJyb3dzZXIuY3NzX2NvdmVyX3N1cHBvcnRlZFxuXHRcdGtsYXNzZXMucHVzaCBcImNzc19jb3Zlcl9zdXBwb3J0ZWRcIlxuXG5cdGJvZHkuYWRkQ2xhc3Mga2xhc3Nlcy5qb2luKCBcIiBcIiApLnRvTG93ZXJDYXNlKClcblxuXHRzZXR0aW5ncy5oZWFkZXJfaGVpZ2h0ID0gJCggJ2hlYWRlcicgKS5oZWlnaHQoKVxuXHQjIGJvZHkuY3NzIFxuXHQjIFx0J21pbi13aWR0aCcgIDogc2V0dGluZ3MuYnJvd3Nlci5taW5fc2l6ZS53XG5cdCMgXHQnbWluLWhlaWdodCcgOiBzZXR0aW5ncy5icm93c2VyLm1pbl9zaXplLmhcblxuXG5cbiMgVEVNUFxuXG4jIHNldHRpbmdzLnZpZGVvX2FjdGl2ZSA9IGZhbHNlXG4jIHNldHRpbmdzLmNzc19jb3Zlcl9zdXBwb3J0ZWQgPSBmYWxzZVxuXG5cbm1vZHVsZS5leHBvcnRzID0gc2V0dGluZ3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSwyQ0FBQTs7QUFBQSxDQUFBLEVBQWdCLElBQUEsTUFBaEIsTUFBZ0I7O0FBRWhCLENBRkEsRUFLQyxLQUhEO0NBR0MsQ0FBQSxLQUFBO0NBQVMsQ0FHUixFQUFBLEdBSFEsTUFHUztDQUhULENBTUMsRUFBVCxHQUFBLE1BQXNCO0NBTmQsQ0FTUixFQUFBLFNBQWlCO0FBR2lELENBWjFELENBWUMsQ0FBd0QsQ0FBakUsRUFBQSxDQUFTLENBQUEsQ0FBUyxFQUFUO0NBWkQsQ0FlRSxFQUFWLEdBQUEsRUFBbUMsQ0FBZjtDQWZaLENBa0JILENBQUwsQ0FBQSxDQWxCUTtDQUFBLENBcUJNLEVBQWQsRUFBb0IsTUFBcEIsSUFyQlE7Q0FBQSxDQXdCRSxFQUFWLENBeEJRLEdBd0JSO0NBeEJRLENBMkJBLEVBQVIsQ0EzQlEsQ0EyQlI7Q0EzQlEsQ0E4QkEsRUFBUixDQTlCUSxDQThCUjtDQTlCUSxDQWlDQyxFQUFULENBakNRLEVBaUNSO0NBakNRLENBb0NBLEVBQVIsQ0FwQ1EsQ0FvQ1I7Q0FwQ1EsQ0F1Q0QsRUFBUCxDQUFBO0NBdkNRLENBeUNhLEVBQXJCLEtBQThCLEtBekN0QixLQXlDUjtDQXpDUSxDQTRDUCxFQURELElBQUE7Q0FDQyxDQUFHLENBQUgsR0FBQTtDQUFBLENBQ0csQ0FESCxHQUNBO01BN0NPO0lBQVQ7Q0FBQSxDQW9EQSxFQUFBLENBcERBO0NBTEQsQ0FBQTs7QUEyREEsQ0EzREEsRUEyRGlCLEVBQWpCLEdBQVEsQ0EzRFI7O0FBNERBLENBNURBLEVBNEQyQixLQUFuQixPQUFSOztBQUlBLENBaEVBLEVBZ0UwQixFQUFpQyxDQUEzRCxDQUFnQixDQUFSLElBQWtCOztBQUcxQixDQUFBLENBQUEsRUFBRyxFQUFBLENBQWdCLENBQVI7Q0FDVixDQUFBLENBQWdCLENBQWhCLElBQVE7RUFwRVQ7O0FBdUVBLENBQUEsQ0FBRyxFQUFBLENBQXVCLEVBQVAsQ0FBUixFQUFYO0NBQ0MsQ0FBQSxDQUFzQixDQUF0QixHQUFnQixDQUFSO0NBQ1IsQ0FBQSxFQUFHLENBQTRCLEVBQVosQ0FBUjtDQUNWLEVBQUEsQ0FBQSxHQUFnQixDQUFSO0lBRlQ7Q0FHQSxDQUFBLEVBQUcsQ0FBNEIsRUFBWixDQUFSO0NBQ1YsRUFBQSxDQUFBLEdBQWdCLENBQVI7SUFMVjtFQXZFQTs7QUFnRkEsQ0FoRkEsQ0FnRndCLENBQUEsRUFBeUIsRUFBVCxDQUFoQyxFQWhGUixFQWdGQTs7QUFJQSxDQUFBLEdBQUksS0FBK0UsdURBQWY7Q0FDbkUsQ0FBQSxDQUE0QixDQUE1QixHQUFnQixDQUFSO0NBQVIsQ0FHQSxDQUFRLEVBQVIsQ0FBUTtDQUhSLENBSUEsQ0FBa0MsRUFBQSxFQUFsQixDQUFSLEVBSlIsQ0FJQTtDQUdBLENBQUEsQ0FBdUIsQ0FBcEIsQ0FBQSxDQUFBLENBQTRDLENBQVIsR0FBUjtDQUM5QixFQUEwQixDQUExQixFQUFBLENBQWdCLENBQVI7Q0FBUixFQUMwQixDQUExQixDQURBLENBQ0EsQ0FBZ0IsQ0FBUjtJQUZULEVBQUE7Q0FJQyxFQUEwQixDQUExQixDQUFBLENBQUEsQ0FBZ0IsQ0FBUjtDQUFSLEVBQzBCLENBQTFCLEVBQUEsQ0FBZ0IsQ0FBUjtJQWJWO0VBcEZBOztBQW1HQSxDQW5HQSxFQW1HMkIsQ0FBMkIsRUFBdEQsQ0FBZ0IsQ0FBUjs7QUFHUixDQUFBLEdBQUcsQ0FBMkIsQ0FBM0IsQ0FBZ0IsQ0FBUjtDQUNWLENBQUEsQ0FBMkIsQ0FBM0IsR0FBZ0IsQ0FBUjtFQXZHVDs7QUEwR0EsQ0ExR0EsRUEwR2lDLEVBMUdqQyxFQTBHZ0IsQ0FBUixLQUFSOztBQUNBLENBQUEsQ0FBK0IsRUFBNUIsQ0FBbUQsQ0FBbkQsQ0FBZ0IsQ0FBUixFQUFYO0NBQ0MsQ0FBQSxDQUFpQyxDQUFqQyxHQUFnQixDQUFSLEtBQVI7RUE1R0Q7O0FBK0dBLENBL0dBLEVBK0d3QixJQUFnQixDQUFoQyxJQUFSOztBQUdBLENBbEhBLEVBbUhDLEtBRE8sRUFBUjtDQUNDLENBQUEsSUFBQSxLQUFBO0NBQUEsQ0FDQSxFQUFBLEtBREE7Q0FBQSxDQUVBLElBQUEsS0FGQTtDQW5IRCxDQUFBOztBQXVIQSxDQUFBLEdBQUcsRUFBSCxDQUFtQixDQUFSO0NBRVYsQ0FBQSxFQUFHLEdBQWdCLENBQVIsS0FBWDtDQUNDLEVBQ0MsQ0FERCxJQUFRLEVBQVI7Q0FDQyxDQUFTLElBQVQsU0FBQTtDQUFBLENBQ1MsRUFBVCxFQUFBLE9BREE7Q0FBQSxDQUVTLElBQVQsU0FGQTtDQUZGLEtBQ0M7SUFERCxFQUFBO0NBT0MsRUFDQyxDQURELElBQVEsRUFBUjtDQUNDLENBQVMsSUFBVCxNQUFBO0NBQUEsQ0FDUyxFQUFULEVBQUEsSUFEQTtDQUFBLENBRVMsSUFBVCxLQUZBO0NBUkYsS0FPQztJQVRGO0VBdkhBOztBQXlJQSxDQUFBLEdBQUcsR0FBZ0IsQ0FBUjtDQUNWLENBQUEsQ0FBVyxLQUFYLENBQUE7Q0FDZ0IsQ0FGakIsRUFFUSxFQUZSLENBRXdCLENBQVI7Q0FDZixDQUFBLENBQVcsS0FBWDtFQUhELElBQUE7Q0FLQyxDQUFBLENBQVcsS0FBWDtFQTlJRDs7QUFpSkEsQ0FqSkEsQ0FBQSxDQWlKMkIsS0FBbkIsT0FBUjs7QUFHQSxDQXBKQSxDQW9KeUIsQ0FBQSxJQUFnQixDQUFqQyxLQUFSOztBQUVBLENBdEpBLEVBc0pRLEVBQVIsSUFBUTtDQUNQLEtBQUEsV0FBQTtDQUFBLENBQUEsQ0FBSyxLQUFRLEtBQVI7Q0FBTCxDQUNBLENBQVEsRUFBUixDQURBO0NBQUEsQ0FFQSxDQUNDLE9BREQ7Q0FDQyxDQUFpQixFQUFqQixXQUFBLElBQUE7Q0FBQSxDQUNZLEVBQVosTUFBQSxJQURBO0NBQUEsQ0FFYSxFQUFiLE9BQUEsSUFGQTtDQUFBLENBR2MsRUFBZCxRQUFBLElBSEE7Q0FBQSxDQUlXLEVBQVgsS0FBQSxFQUpBO0NBSEQsR0FBQTtDQUFBLENBV0EsRUFBYSxJQUFMLElBQVI7QUFDQSxDQUFBLEVBQUEsSUFBQSxRQUFBO0NBQ0MsQ0FBSyxFQUFMLENBQVksSUFBWjtDQUNDLENBQUUsQ0FBWSxFQUFMLENBQVQsb0JBQUE7Q0FBQSxDQUNRLENBQUEsRUFBUixDQUFBLElBQWdFLE1BQXhEO01BSFY7Q0FBQSxFQVpBO0NBQUEsQ0FnQkEsRUFBYSxJQUFMLEdBQVI7Q0FDaUMsRUFBUyxDQUFmLENBQTNCLENBQTJCLEdBQTNCO0NBbEJPOztBQXlCUixDQS9LQSxFQStLZ0IsQ0FBaEIsSUFBUSxDQUFTO0NBQ2hCLEtBQUEsQ0FBQTtDQUFBLENBQUEsQ0FBVSxJQUFWO0NBQUEsQ0FDQSxFQUFBLEdBQU8sQ0FBYyxLQUFyQjtDQURBLENBRUEsQ0FBYSxDQUFiLEdBQU8sQ0FBYztDQUZyQixDQUdBLEVBQUEsR0FBTyxDQUFjO0NBRXJCLENBQUEsRUFBRyxJQUFRLElBQVg7Q0FDQyxHQUFBLEdBQU8sT0FBUDtJQURELEVBQUE7Q0FHQyxHQUFBLEdBQU8sVUFBUDtJQVJEO0NBVUEsQ0FBQSxFQUFHLEdBQWdCLENBQVIsV0FBWDtDQUNDLEdBQUEsR0FBTyxjQUFQO0lBWEQ7Q0FBQSxDQWFBLENBQWMsQ0FBVixHQUFpQixDQUFyQixHQUFjO0NBRUwsRUFBZ0IsR0FBQSxFQUFqQixDQUFSLElBQUE7Q0FoQmU7O0FBNkJoQixDQTVNQSxFQTRNaUIsR0FBWCxDQUFOLENBNU1BIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjExNDkzLCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdXRpbHMvc3RyaW5nLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IFxuICBpc19lbXB0eSA6ICggc3RyICkgLT5cbiAgICBzID0gc3RyLnJlcGxhY2UoL1xccysvZywgJycpXG4gICAgcmV0dXJuIHMubGVuZ3RoIDw9IDAiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsQ0FBTyxFQUNMLEdBREksQ0FBTjtDQUNFLENBQUEsQ0FBVyxLQUFYLENBQWE7Q0FDWCxPQUFBO0NBQUEsQ0FBd0IsQ0FBcEIsQ0FBSixFQUFJLENBQUE7Q0FDSixHQUFtQixFQUFaLEtBQUE7Q0FGVCxFQUFXO0NBRGIsQ0FBQSJ9fSx7Im9mZnNldCI6eyJsaW5lIjoxMTUwMywiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3V0aWxzL3VybF9wYXJzZXIuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gXG4gIGdldF9wYXRobmFtZTogKCB1cmwgKSAtPlxuICAgIGZpbmQgPSBsb2NhdGlvbi5vcmlnaW5cbiAgICByZSA9IG5ldyBSZWdFeHAgZmluZCwgJ2cnXG5cbiAgICB1cmwucmVwbGFjZSByZSwgJyciXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsQ0FBTyxFQUNMLEdBREksQ0FBTjtDQUNFLENBQUEsQ0FBYyxNQUFFLEdBQWhCO0NBQ0UsT0FBQTtDQUFBLEVBQU8sQ0FBUCxFQUFBLEVBQWU7Q0FBZixDQUNBLENBQVMsQ0FBVCxFQUFTO0NBRUwsQ0FBSixDQUFHLElBQUgsSUFBQTtDQUpGLEVBQWM7Q0FEaEIsQ0FBQSJ9fSx7Im9mZnNldCI6eyJsaW5lIjoxMTUxNCwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZlbmRvcnMuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbInZlbmRvcnMgPSBcbiAgIyBkb2N1bWVudGF0aW9uOiBodHRwOi8vbW9kZXJuaXpyLmNvbS9kb2NzL1xuICBNb2Rlcm5penIgICAgICAgICAgICA6IHJlcXVpcmUgJy4uL3ZlbmRvcnMvbW9kZXJuaXpyLmN1c3RvbS5qcydcblxuICAjIGRvY3VtZW50YXRpb246IGh0dHBzOi8vZ2l0aHViLmNvbS9qZXJlbXloYXJyaXMvTG9jYWxDb25uZWN0aW9uLmpzL3RyZWUvbWFzdGVyXG4gIExvY2FsQ29ubmVjdGlvbiAgICAgIDogcmVxdWlyZSAnLi4vdmVuZG9ycy9Mb2NhbENvbm5lY3Rpb24uanMnXG5cblxuICAjIGRvY3VtbnRhdGlvbjogaHR0cHM6Ly9naXRodWIuY29tL2pvZXdhbG5lcy9yZWNvbm5lY3Rpbmctd2Vic29ja2V0XG4gIFJlY29ubmVjdGluZ1dlYnNvY2tldDogcmVxdWlyZSAnLi4vdmVuZG9ycy9yZWNvbm5lY3Rpbmctd2Vic29ja2V0LmpzJ1xuXG4gICMgRG9jdW1lbnRhdGlvbjogaHR0cDovL2Nsb3VkaW5hcnkuY29tL2RvY3VtZW50YXRpb24vanF1ZXJ5X2ludGVncmF0aW9uXG4gIEpxdWVyeVVpV2lkZ2V0ICAgICAgIDogcmVxdWlyZSAnLi4vdmVuZG9ycy9qcXVlcnkudWkud2lkZ2V0LmpzJ1xuICBJZnJhbWVUcmFuc3BvcnQgICAgICA6IHJlcXVpcmUgJy4uL3ZlbmRvcnMvanF1ZXJ5LmlmcmFtZS10cmFuc3BvcnQuanMnXG4gIEZpbGVVcGxvYWQgICAgICAgICAgIDogcmVxdWlyZSAnLi4vdmVuZG9ycy9qcXVlcnkuZmlsZXVwbG9hZC5qcydcbiAgQ2xvdWRpbmFyeSAgICAgICAgICAgOiByZXF1aXJlICcuLi92ZW5kb3JzL2pxdWVyeS5jbG91ZGluYXJ5LmpzJ1xuXG4gICMgRG9jdW1lbnRhdGlvbjogaHR0cHM6Ly9naXRodWIuY29tL2FuZHJpczkvalN0b3JhZ2VcbiAgSnN0b3JhZ2UgICAgICAgICAgICAgOiByZXF1aXJlICcuLi92ZW5kb3JzL2pzdG9yYWdlLmpzJ1xuXG4gIFBhcmFsbGF4ICAgICAgICAgICAgIDogcmVxdWlyZSAnLi4vdmVuZG9ycy9wYXJhbGxheC5taW4uanMnXG5cbiAgIyBEb2N1bWVudGF0aW9uOiBodHRwOi8vbm90aWZ5anMuY29tL1xuICBOb3RpZnlKcyAgICAgICAgICAgICA6IHJlcXVpcmUgJy4uL3ZlbmRvcnMvbm90aWZ5Lm1pbi5qcydcblxubW9kdWxlLmV4cG9ydHMgPSB2ZW5kb3JzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsR0FBQTs7QUFBQSxDQUFBLEVBRUUsSUFGRjtDQUVFLENBQUEsS0FBdUIsRUFBdkIsdUJBQXVCO0NBQXZCLENBR0EsS0FBdUIsUUFBdkIsZ0JBQXVCO0NBSHZCLENBT0EsS0FBdUIsY0FBdkIsaUJBQXVCO0NBUHZCLENBVUEsS0FBdUIsT0FBdkIsa0JBQXVCO0NBVnZCLENBV0EsS0FBdUIsUUFBdkIsd0JBQXVCO0NBWHZCLENBWUEsS0FBdUIsR0FBdkIsdUJBQXVCO0NBWnZCLENBYUEsS0FBdUIsR0FBdkIsdUJBQXVCO0NBYnZCLENBZ0JBLEtBQXVCLENBQXZCLGdCQUF1QjtDQWhCdkIsQ0FrQkEsS0FBdUIsQ0FBdkIsb0JBQXVCO0NBbEJ2QixDQXFCQSxLQUF1QixDQUF2QixrQkFBdUI7Q0F2QnpCLENBQUE7O0FBeUJBLENBekJBLEVBeUJpQixHQUFYLENBQU4ifX0seyJvZmZzZXQiOnsibGluZSI6MTE1MzMsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9idXR0b25zL3NoYXJlLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFNoYXJlXG5cbiAgb3BlbmVkICAgIDogZmFsc2VcbiAgaGFuZGxlciAgIDogbnVsbFxuICBibGFja19ib3ggOiBudWxsXG4gIGlucHV0ICAgICA6IG51bGxcbiAgY29weV9idG4gIDogbnVsbFxuXG4gIGNvbnN0cnVjdG9yOiAoQGRvbSkgLT5cbiAgICByZWYgPSBAXG5cbiAgICBodG1sID0gcmVxdWlyZSAndGVtcGxhdGVzL2J1dHRvbnMvc2hhcmUnXG5cbiAgICBkYXRhID0gXG4gICAgICBsaW5rOiBAZG9tLmRhdGEgJ3Blcm1hbGluaydcbiAgICAgIFxuICAgIEBkb20uYXBwZW5kIGh0bWwoIGRhdGEgKVxuXG5cbiAgICBAaGFuZGxlciAgID0gQGRvbS5maW5kICcuc3MtYWN0aW9uJ1xuICAgIEBibGFja19ib3ggPSBAZG9tLmZpbmQgJy5zaGFyZV9ib3gnIFxuICAgIEBpbnB1dCAgICAgPSBAZG9tLmZpbmQgJ2lucHV0J1xuICAgIEBjb3B5X2J0biAgPSBAZG9tLmZpbmQgJy5idXR0b24nXG5cbiAgICBAaGFuZGxlci5vbiAnY2xpY2snLCBAdG9nZ2xlXG4gICAgQGRvbS5vbiAnY2xpY2snLCAgKGUpIC0+IGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICBAaW5wdXQub24gJ2NsaWNrJywgQHNlbGVjdFxuICAgIEBjb3B5X2J0bi5vbiAnY2xpY2snLCBAb25fY29weV9jbGlja2VkXG4gICAgYXBwLm9uICdzaGFyZTpvcGVuZWQnLCBAb25fc2hhcmVfb3BlbmVkXG4gICAgYXBwLndpbmRvdy5vbiAnYm9keTpjbGlja2VkJywgQGNsb3NlXG4gICAgYXBwLndpbmRvdy5vbiAnc2Nyb2xsJywgQGNsb3NlXG5cbiAgb25fc2hhcmVfb3BlbmVkOiAoIHVpZCApID0+XG4gICAgaWYgdWlkIGlzbnQgQHVpZFxuICAgICAgQGNsb3NlKClcblxuICBvbl9jb3B5X2NsaWNrZWQ6ID0+XG4gICAgQGlucHV0WyAwIF0uc2VsZWN0KClcbiAgICBpZiBhcHAuc2V0dGluZ3MuYnJvd3Nlci5PUyBpcyBcIk1hY1wiXG4gICAgICB0ZXh0ID0gXCJQcmVzcyBDTUQgKyBDIHRvIGNvcHkgdGhlIGxpbmtcIlxuICAgIGVsc2VcbiAgICAgIHRleHQgPSBcIlByZXNzIEN0cmwgKyBDIHRvIGNvcHkgdGhlIGxpbmtcIlxuICAgIGFsZXJ0IHRleHRcblxuXG4gIHRvZ2dsZSA6IChlKSA9PlxuICAgIGlmIEBvcGVuZWQgXG4gICAgICBAY2xvc2UoKVxuICAgIGVsc2VcbiAgICAgIEBvcGVuKClcblxuICAgIGUucHJldmVudERlZmF1bHQoKVxuXG4gIGNsb3NlIDogPT5cbiAgICByZXR1cm4gaWYgbm90IEBvcGVuZWRcbiAgICBAb3BlbmVkID0gZmFsc2VcbiAgICBAZG9tLnJlbW92ZUNsYXNzICdvcGVuZWQnXG5cbiAgb3BlbiA6ID0+XG4gICAgcmV0dXJuIGlmIEBvcGVuZWRcbiAgICBAb3BlbmVkID0gdHJ1ZVxuICAgIGFwcC5lbWl0ICdzaGFyZTpvcGVuZWQnLCBAdWlkXG5cbiAgICAjIENoZWNrIHRoZSBwb3NpdGlvbiBvZiB0aGUgaGFuZGxlclxuICAgIHRvcCA9IEBoYW5kbGVyLm9mZnNldCgpLnRvcFxuICAgIHkgPSBhcHAud2luZG93LnlcbiAgICBoID0gQGJsYWNrX2JveC5oZWlnaHQoKVxuICAgIGRpZmYgPSB0b3AgLSB5XG4gICAgbG9nICdwb3NpdGlvbicsIGRpZmYsIGgrMTAwXG5cbiAgICBpZiBkaWZmIDwgaCArIDEwMFxuICAgICAgQGRvbS5hZGRDbGFzcyAnb25fYm90dG9tJ1xuICAgIGVsc2VcbiAgICAgIEBkb20ucmVtb3ZlQ2xhc3MgJ29uX2JvdHRvbSdcblxuICAgIEBkb20uYWRkQ2xhc3MgJ29wZW5lZCdcblxuICB1cGRhdGVfbGluazogKCBsaW5rICkgLT5cbiAgICBAaW5wdXQudmFsIGxpbmtcblxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQGhhbmRsZXIub2ZmICdjbGljaycsIEB0b2dnbGVcbiAgICBAZG9tLm9mZiAnY2xpY2snXG4gICAgQGlucHV0Lm9mZiAnY2xpY2snLCBAc2VsZWN0XG4gICAgQGNvcHlfYnRuLm9mZiAnY2xpY2snLCBAb25fY29weV9jbGlja2VkXG4gICAgYXBwLm9mZiAnc2hhcmU6b3BlbmVkJywgQG9uX3NoYXJlX29wZW5lZFxuICAgIGFwcC53aW5kb3cub2ZmICdib2R5OmNsaWNrZWQnLCBAY2xvc2VcbiAgICBhcHAud2luZG93Lm9mZiAnc2Nyb2xsJywgQGNsb3NlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsQ0FBQTtHQUFBLCtFQUFBOztBQUFBLENBQUEsRUFBdUIsR0FBakIsQ0FBTjtDQUVFLEVBQVksRUFBWixDQUFBOztDQUFBLEVBQ1ksQ0FEWixHQUNBOztDQURBLEVBRVksQ0FGWixLQUVBOztDQUZBLEVBR1ksQ0FIWixDQUdBOztDQUhBLEVBSVksQ0FKWixJQUlBOztDQUVhLENBQUEsQ0FBQSxZQUFFO0NBQ2IsT0FBQSxPQUFBO0NBQUEsRUFEYSxDQUFEO0NBQ1osa0NBQUE7Q0FBQSxvQ0FBQTtDQUFBLHNDQUFBO0NBQUEsd0RBQUE7Q0FBQSx3REFBQTtDQUFBLEVBQUEsQ0FBQTtDQUFBLEVBRU8sQ0FBUCxHQUFPLGtCQUFBO0NBRlAsRUFLRSxDQURGO0NBQ0UsQ0FBTSxDQUFJLENBQVYsRUFBQSxLQUFNO0NBTFIsS0FBQTtDQUFBLEVBT0ksQ0FBSixFQUFBO0NBUEEsRUFVYSxDQUFiLEdBQUEsS0FBYTtDQVZiLEVBV2EsQ0FBYixLQUFBLEdBQWE7Q0FYYixFQVlhLENBQWIsQ0FBQSxFQUFhO0NBWmIsRUFhYSxDQUFiLElBQUEsQ0FBYTtDQWJiLENBZUEsRUFBQSxFQUFBLENBQVE7Q0FmUixDQWdCQSxDQUFJLENBQUosR0FBQSxFQUFtQjtDQUFPLFlBQUQsRUFBQTtDQUF6QixJQUFrQjtDQWhCbEIsQ0FpQkEsRUFBQSxDQUFNLENBQU4sQ0FBQTtDQWpCQSxDQWtCQSxFQUFBLEdBQUEsQ0FBUyxPQUFUO0NBbEJBLENBbUJBLENBQUcsQ0FBSCxVQUFBLENBQUE7Q0FuQkEsQ0FvQkEsQ0FBRyxDQUFILENBQUEsQ0FBVSxRQUFWO0NBcEJBLENBcUJBLENBQUcsQ0FBSCxDQUFBLENBQVUsRUFBVjtDQTVCRixFQU1hOztDQU5iLEVBOEJpQixNQUFFLE1BQW5CO0NBQ0UsRUFBRyxDQUFILENBQVk7Q0FDVCxHQUFBLENBQUQsUUFBQTtNQUZhO0NBOUJqQixFQThCaUI7O0NBOUJqQixFQWtDaUIsTUFBQSxNQUFqQjtDQUNFLEdBQUEsSUFBQTtDQUFBLEdBQUEsQ0FBUSxDQUFSO0NBQ0EsQ0FBRyxDQUFHLENBQU4sQ0FBOEIsRUFBUCxDQUFSO0NBQ2IsRUFBTyxDQUFQLEVBQUEsMEJBQUE7TUFERjtDQUdFLEVBQU8sQ0FBUCxFQUFBLDJCQUFBO01BSkY7Q0FLTSxHQUFOLENBQUEsTUFBQTtDQXhDRixFQWtDaUI7O0NBbENqQixFQTJDUyxHQUFULEdBQVU7Q0FDUixHQUFBLEVBQUE7Q0FDRSxHQUFDLENBQUQsQ0FBQTtNQURGO0NBR0UsR0FBQyxFQUFEO01BSEY7Q0FLQyxVQUFELEdBQUE7Q0FqREYsRUEyQ1M7O0NBM0NULEVBbURRLEVBQVIsSUFBUTtBQUNRLENBQWQsR0FBQSxFQUFBO0NBQUEsV0FBQTtNQUFBO0NBQUEsRUFDVSxDQUFWLENBREEsQ0FDQTtDQUNDLEVBQUcsQ0FBSCxJQUFELEdBQUE7Q0F0REYsRUFtRFE7O0NBbkRSLEVBd0RPLENBQVAsS0FBTztDQUNMLE9BQUEsT0FBQTtDQUFBLEdBQUEsRUFBQTtDQUFBLFdBQUE7TUFBQTtDQUFBLEVBQ1UsQ0FBVixFQUFBO0NBREEsQ0FFeUIsQ0FBdEIsQ0FBSCxVQUFBO0NBRkEsRUFLQSxDQUFBLEVBQU0sQ0FBUTtDQUxkLEVBTUksQ0FBSixFQUFjO0NBTmQsRUFPSSxDQUFKLEVBQUksR0FBVTtDQVBkLEVBUU8sQ0FBUDtDQVJBLENBU2dCLENBQWhCLENBQUEsTUFBQTtDQUVBLEVBQVUsQ0FBVjtDQUNFLEVBQUksQ0FBSCxFQUFELEVBQUEsR0FBQTtNQURGO0NBR0UsRUFBSSxDQUFILEVBQUQsS0FBQTtNQWRGO0NBZ0JDLEVBQUcsQ0FBSCxJQUFELEdBQUE7Q0F6RUYsRUF3RE87O0NBeERQLEVBMkVhLENBQUEsS0FBRSxFQUFmO0NBQ0csRUFBRCxDQUFDLENBQUssTUFBTjtDQTVFRixFQTJFYTs7Q0EzRWIsRUErRVMsSUFBVCxFQUFTO0NBQ1AsQ0FBc0IsQ0FBdEIsQ0FBQSxFQUFBLENBQVE7Q0FBUixFQUNJLENBQUosR0FBQTtDQURBLENBRW9CLENBQXBCLENBQUEsQ0FBTSxDQUFOLENBQUE7Q0FGQSxDQUd1QixDQUF2QixDQUFBLEdBQUEsQ0FBUyxPQUFUO0NBSEEsQ0FJd0IsQ0FBckIsQ0FBSCxVQUFBLENBQUE7Q0FKQSxDQUsrQixDQUE1QixDQUFILENBQUEsQ0FBVSxRQUFWO0NBQ0ksQ0FBcUIsQ0FBdEIsQ0FBdUIsQ0FBMUIsQ0FBVSxFQUFWLEdBQUE7Q0F0RkYsRUErRVM7O0NBL0VUOztDQUZGIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjExNjUwLCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvYnV0dG9ucy9zdGFydF9zdG9wLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJoYXBwZW5zID0gcmVxdWlyZSAnaGFwcGVucydcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBTdGFydFN0b3Bcblx0c3RhcnRlZCAgICAgOiBmYWxzZVxuXHRmaXJzdF9jbGljayA6IHRydWVcblxuXHRjb25zdHJ1Y3RvcjogKEBkb20pIC0+XG5cdFx0aGFwcGVucyBAXG5cdFxuXHRcdEBkb20uYWRkQ2xhc3MgJ3N0YXJ0X3N0b3AnXG5cdFx0QGRvbS5vbiAnY2xpY2snLCBAdG9nZ2xlXG5cblx0XHRpZiBAZG9tLmRhdGEoICd3aWR0aCcgKSBpcyAnZml4ZWQnXG5cdFx0XHRAbG9ja193aWR0aCgpXG5cblx0bG9ja193aWR0aDogLT5cblx0XHRzdGFydF9idXR0b24gPSBAZG9tLmZpbmQgJy5zdGFydCdcblx0XHRzdG9wX2J1dHRvbiAgPSBAZG9tLmZpbmQgJy5zdG9wJ1xuXG5cdFx0dyA9IE1hdGgubWF4KCBzdGFydF9idXR0b24ud2lkdGgoKSwgc3RvcF9idXR0b24ud2lkdGgoKSApICsgMlxuXHRcdHN0YXJ0X2J1dHRvbi53aWR0aCB3XG5cdFx0c3RvcF9idXR0b24ud2lkdGggd1xuXG5cblx0dG9nZ2xlIDogPT5cblxuXHRcdGlmIEBzdGFydGVkXG5cdFx0XHRAc3RvcCgpXG5cdFx0ZWxzZVxuXHRcdFx0QHN0YXJ0KClcblxuXHRcdEBmaXJzdF9jbGljayA9IGZhbHNlXG5cblx0c3RvcCA6IC0+XG5cdFx0cmV0dXJuIGlmIG5vdCBAc3RhcnRlZFxuXG5cdFx0QHN0YXJ0ZWQgPSBmYWxzZVxuXG5cdFx0QGRvbS5yZW1vdmVDbGFzcyBcInN0YXJ0ZWRcIlxuXG5cdFx0QGVtaXQgJ2NoYW5nZScsICdzdG9wJ1xuXG5cblx0c3RhcnQgOiAtPlxuXHRcdHJldHVybiBpZiBAc3RhcnRlZFxuXG5cdFx0QHN0YXJ0ZWQgPSB0cnVlXG5cblx0XHRAZG9tLmFkZENsYXNzIFwic3RhcnRlZFwiXG5cblx0XHRAZW1pdCAnY2hhbmdlJywgJ3N0YXJ0JyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGNBQUE7R0FBQSwrRUFBQTs7QUFBQSxDQUFBLEVBQVUsSUFBVixFQUFVOztBQUVWLENBRkEsRUFFdUIsR0FBakIsQ0FBTjtDQUNDLEVBQWMsRUFBZCxFQUFBOztDQUFBLEVBQ2MsQ0FEZCxPQUNBOztDQUVhLENBQUEsQ0FBQSxnQkFBRTtDQUNkLEVBRGMsQ0FBRDtDQUNiLHNDQUFBO0NBQUEsR0FBQSxHQUFBO0NBQUEsRUFFSSxDQUFKLElBQUEsSUFBQTtDQUZBLENBR0EsQ0FBSSxDQUFKLEVBQUEsQ0FBQTtDQUVBLEVBQU8sQ0FBUCxDQUEyQixFQUF4QjtDQUNGLEdBQUMsRUFBRCxJQUFBO01BUFc7Q0FIYixFQUdhOztDQUhiLEVBWVksTUFBQSxDQUFaO0NBQ0MsT0FBQSxvQkFBQTtDQUFBLEVBQWUsQ0FBZixJQUFlLElBQWY7Q0FBQSxFQUNlLENBQWYsR0FBZSxJQUFmO0NBREEsQ0FHb0MsQ0FBaEMsQ0FBSixDQUFjLE1BQWlDLENBQXJCO0NBSDFCLEdBSUEsQ0FBQSxPQUFZO0NBQ0EsSUFBWixNQUFBO0NBbEJELEVBWVk7O0NBWlosRUFxQlMsR0FBVCxHQUFTO0NBRVIsR0FBQSxHQUFBO0NBQ0MsR0FBQyxFQUFEO01BREQ7Q0FHQyxHQUFDLENBQUQsQ0FBQTtNQUhEO0NBS0MsRUFBYyxDQUFkLE9BQUQ7Q0E1QkQsRUFxQlM7O0NBckJULEVBOEJPLENBQVAsS0FBTztBQUNRLENBQWQsR0FBQSxHQUFBO0NBQUEsV0FBQTtNQUFBO0NBQUEsRUFFVyxDQUFYLENBRkEsRUFFQTtDQUZBLEVBSUksQ0FBSixLQUFBLEVBQUE7Q0FFQyxDQUFlLEVBQWYsRUFBRCxFQUFBLEdBQUE7Q0FyQ0QsRUE4Qk87O0NBOUJQLEVBd0NRLEVBQVIsSUFBUTtDQUNQLEdBQUEsR0FBQTtDQUFBLFdBQUE7TUFBQTtDQUFBLEVBRVcsQ0FBWCxHQUFBO0NBRkEsRUFJSSxDQUFKLElBQUEsQ0FBQTtDQUVDLENBQWUsRUFBZixHQUFELENBQUEsR0FBQTtDQS9DRCxFQXdDUTs7Q0F4Q1I7O0NBSEQifX0seyJvZmZzZXQiOnsibGluZSI6MTE3MTMsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9jaGF0L21lc3NhZ2VzLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9ICggZG9tICkgLT5cblxuICAjIFRPRE86IG1ha2UgaXQgc21hcnQsIHN1YnNjcmliZWQgd2hlbiBuZWVkZWQsIHVuc3VzY3JpYmUgd2hlbiBsZWF2aW5nXG4gICMgdGhlIHJvb20sIGV0Y3NcbiAgdXNlcl9pZCA9IGxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KCBcIi9cIiApWzFdIFxuICByb29tX2lkID0gbG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoIFwiL1wiIClbMl0gXG5cbiAgY2hhbm5lbCA9IHB1c2hlci5zdWJzY3JpYmUgXCIje3VzZXJfaWR9LiN7cm9vbV9pZH1cIlxuXG4gIGNoYXQgPSAkICcuY2hhdF9jb250ZW50J1xuXG4gIGNoYW5uZWwuYmluZCAnbWVzc2FnZScsICggZGF0YSApIC0+XG5cbiAgICBpZiBkb20uZmluZCggJy5uby1tZXNzYWdlJyApLmxlbmd0aFxuICAgICAgZG9tLmZpbmQoICcubm8tbWVzc2FnZScgKS5yZW1vdmUoKVxuXG4gICAgZG9tLmFwcGVuZCBcIjxkaXY+PGltZyBzcmM9JyN7ZGF0YS5hdmF0YXJ9JyB3aWR0aD0nMzAnIGhlaWdodD0nMzAnPiN7ZGF0YS5tZXNzYWdlfTwvZGl2PlwiXG5cbiAgICBjb25zb2xlLmxvZyAnZG9tLnNjcm9sbFRvcCAtPicsIGRvbS5zY3JvbGxUb3BcbiAgICBjb25zb2xlLmxvZyAnZG9tWzBdLnNjcm9sbEhlaWdodCAtPicsIGRvbVswXS5zY3JvbGxIZWlnaHRcblxuXG4gICAgY2hhdC5zY3JvbGxUb3AoIGNoYXRbMF0uc2Nyb2xsSGVpZ2h0IClcblxuICAgIGNvbnNvbGUubG9nIFwiZ290IGRhdGEhISFcIiwgZGF0YSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxDQUFPLEVBQVUsR0FBWCxDQUFOLEVBQW1CO0NBSWpCLEtBQUEseUJBQUE7Q0FBQSxDQUFBLENBQVUsRUFBQSxFQUFWLENBQWtCO0NBQWxCLENBQ0EsQ0FBVSxFQUFBLEVBQVYsQ0FBa0I7Q0FEbEIsQ0FHQSxDQUFVLEdBQU0sQ0FBaEIsRUFBVTtDQUhWLENBS0EsQ0FBTyxDQUFQLFdBQU87Q0FFQyxDQUFnQixDQUFBLENBQXhCLEdBQU8sRUFBUDtDQUVFLEVBQU0sQ0FBTixFQUFBLE9BQUc7Q0FDRCxFQUFHLENBQUgsRUFBQSxPQUFBO01BREY7Q0FBQSxFQUdHLENBQUgsRUFBQSxDQUFZLENBQVosU0FBWSxVQUFBO0NBSFosQ0FLZ0MsQ0FBaEMsQ0FBQSxHQUFPLEVBQVAsU0FBQTtDQUxBLENBTXNDLENBQXRDLENBQUEsR0FBTyxLQUFQLFlBQUE7Q0FOQSxHQVNBLEtBQUEsR0FBQTtDQUVRLENBQW1CLENBQTNCLENBQUEsR0FBTyxJQUFQLEVBQUE7Q0FiRixFQUF3QjtDQVhUIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjExNzMzLCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvY2hhdC90ZXh0YXJlYS5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiTCA9IHJlcXVpcmUgJy4uLy4uL2FwaS9sb29wY2FzdC9sb29wY2FzdCdcblxubW9kdWxlLmV4cG9ydHMgPSAoIGRvbSApIC0+XG5cbiAgZG9tLm9uICdrZXl1cCcsICggZSApIC0+XG5cbiAgICAjIHdoZW4gcHJlc3NpbmcgZW50ZXJcbiAgICBpZiBlLmtleUNvZGUgaXMgMTNcblxuICAgICAgIyBncmFicyB0aGUgbWVzc2FnZVxuICAgICAgbWVzc2FnZSA9IGRvbS52YWwoKVxuICAgICAgdXNlcl9pZCA9IGxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KCBcIi9cIiApWzFdXG4gICAgICByb29tX2lkID0gbG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoIFwiL1wiIClbMl0gIyBUT0RPOiBtYWtlIGl0IHNtYXJ0XG5cbiAgICAgICMgY2xlYXIgdGhlIGZpZWxkXG4gICAgICBkb20udmFsIFwiXCJcblxuICAgICAgTC5jaGF0Lm1lc3NhZ2UgdXNlcl9pZCwgcm9vbV9pZCwgbWVzc2FnZSwgKCBlcnJvciwgcmVzcG9uc2UgKSAtPlxuXG4gICAgICAgIGlmIGVycm9yXG5cbiAgICAgICAgICBjb25zb2xlLmVycm9yIFwic2VuZGluZyBtZXNzYWdlOiBcIiwgZXJyb3JcbiAgICAgICAgICByZXR1cm5cblxuICAgICAgICBjb25zb2xlLmxvZyBcImdvdCByZXNwb25zZVwiLCByZXNwb25zZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxDQUFBLEdBQUE7O0FBQUEsQ0FBQSxFQUFJLElBQUEsc0JBQUE7O0FBRUosQ0FGQSxFQUVpQixHQUFYLENBQU4sRUFBbUI7Q0FFYixDQUFKLENBQUcsSUFBSCxFQUFBO0NBR0UsT0FBQSxpQkFBQTtDQUFBLENBQUEsRUFBQSxDQUFnQixFQUFiO0NBR0QsRUFBVSxHQUFWLENBQUE7Q0FBQSxFQUNVLEVBQUEsQ0FBVixDQUFBLENBQWtCO0NBRGxCLEVBRVUsRUFBQSxDQUFWLENBQUEsQ0FBa0I7Q0FGbEIsQ0FLQSxDQUFHLEdBQUg7Q0FFQyxDQUF1QixDQUFrQixDQUFwQyxDQUFvQyxFQUExQyxDQUEwQyxDQUFFLElBQTVDO0NBRUUsR0FBRyxDQUFILEdBQUE7Q0FFRSxDQUFtQyxHQUFuQyxFQUFPLEdBQVAsU0FBQTtDQUNBLGVBQUE7VUFIRjtDQUtRLENBQW9CLENBQTVCLElBQU8sQ0FBUCxNQUFBLENBQUE7Q0FQRixNQUEwQztNQWI5QjtDQUFoQixFQUFnQjtDQUZEIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjExNzU4LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvY29tcG9uZW50cy9hdWRpby9wbGF5ZXIuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUGxheWVyXG4gIGNvbnN0cnVjdG9yOiAoIEBkb20gKSAtPlxuICAgIEBjb3ZlciAgPSBAZG9tLmZpbmQgJy5wbGF5ZXJfaWNvbiBpbWcnXG4gICAgQHRpdGxlICA9IEBkb20uZmluZCAnLnBsYXllcl90aXRsZSdcbiAgICBAYXV0aG9yID0gQGRvbS5maW5kICcucGxheWVyX2F1dGhvcidcbiAgICBAYXVkaW8gID0gQGRvbS5maW5kICdhdWRpbydcblxuICAgICMgZGVsYXkgMjAwMCwgPT5cbiAgICAjICAgQG9wZW4gXG4gICAgIyAgICAgY292ZXI6IFwiL2ltYWdlcy9wcm9maWxlX2JpZy5wbmdcIlxuICAgICMgICAgIHRpdGxlOiBcIkxpdmUgZnJvbSBTaXJhY3VzYVwiXG4gICAgIyAgICAgYXV0aG9yOiBcIlN0ZWZhbm8gT3J0aXNpXCJcbiAgICAjICAgICB1cmw6IFwiaHR0cDovL2xvb3BjYXN0LmNvbS9zdGVmYW5vb3J0aXNpL2xpdmVcIlxuICAgICMgICAgIGF1dGhvcl9saW5rOiBcImh0dHA6Ly9sb29wY2FzdC5jb20vc3RlZmFub29ydGlzaVwiXG5cbiAgICB2aWV3Lm9uY2UgJ2JpbmRlZCcsIEBvbl92aWV3c19iaW5kZWRcblxuICBvbl92aWV3c19iaW5kZWQ6IChzY29wZSkgPT5cbiAgICBAc2hhcmUgPSB2aWV3LmdldF9ieV9kb20gQGRvbS5maW5kKCAnLnNoYXJlX3dyYXBwZXInIClcbiAgICBcbiAgb3BlbjogKCBkYXRhICkgLT5cbiAgICBpZiBkYXRhP1xuICAgICAgQGNvdmVyLmF0dHIgJ3NyYycsIGRhdGEuY292ZXJcbiAgICAgIEB0aXRsZS5odG1sIGRhdGEudGl0bGVcbiAgICAgIEBhdXRob3IuaHRtbCBcIkJ5IFwiICsgZGF0YS5hdXRob3JcblxuICAgICAgQGF1dGhvci5hdHRyICd0aXRsZScsIGRhdGEudGl0bGVcbiAgICAgIEB0aXRsZS5hdHRyICd0aXRsZScsIGRhdGEuYXV0aG9yXG5cbiAgICAgIEBhdXRob3IuYXR0ciAnaHJlZicsIGRhdGEuYXV0aG9yX2xpbmtcbiAgICAgIEB0aXRsZS5hdHRyICdocmVmJywgZGF0YS51cmxcblxuICAgICAgQGNvdmVyLnBhcmVudCgpLmF0dHIgJ2hyZWYnLCBkYXRhLnVybFxuICAgICAgQGNvdmVyLnBhcmVudCgpLmF0dHIgJ3RpdGxlJywgZGF0YS50aXRsZVxuXG4gICAgICBAc2hhcmUudXBkYXRlX2xpbmsgZGF0YS51cmxcblxuICAgIEBkb20uYWRkQ2xhc3MgJ3Zpc2libGUnXG5cbiAgY2xvc2U6ICggKSAtPlxuICAgIEBkb20ucmVtb3ZlQ2xhc3MgJ3Zpc2libGUnXG5cbiAgcGxheTogKCBtb3VudHBvaW50ICkgLT5cbiAgICBAb3BlbigpXG5cbiAgICBAYXVkaW8uYXR0ciAnc3JjJywgXCJodHRwOi8vcmFkaW8ubG9vcGNhc3QuZm06ODAwMC8je21vdW50cG9pbnR9XCJcblxuXG5cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLEVBQUE7R0FBQSwrRUFBQTs7QUFBQSxDQUFBLEVBQXVCLEdBQWpCLENBQU47Q0FDZSxDQUFBLENBQUEsYUFBRztDQUNkLEVBRGMsQ0FBRDtDQUNiLHdEQUFBO0NBQUEsRUFBVSxDQUFWLENBQUEsYUFBVTtDQUFWLEVBQ1UsQ0FBVixDQUFBLFVBQVU7Q0FEVixFQUVVLENBQVYsRUFBQSxVQUFVO0NBRlYsRUFHVSxDQUFWLENBQUEsRUFBVTtDQUhWLENBYW9CLEVBQXBCLElBQUEsT0FBQTtDQWRGLEVBQWE7O0NBQWIsRUFnQmlCLEVBQUEsSUFBQyxNQUFsQjtDQUNHLEVBQVEsQ0FBUixDQUFELEtBQVMsQ0FBVCxLQUF5QjtDQWpCM0IsRUFnQmlCOztDQWhCakIsRUFtQk0sQ0FBTixLQUFRO0NBQ04sR0FBQSxRQUFBO0NBQ0UsQ0FBbUIsRUFBbEIsQ0FBSyxDQUFOO0NBQUEsR0FDQyxDQUFLLENBQU47Q0FEQSxFQUVxQixDQUFwQixDQUFZLENBQWI7Q0FGQSxDQUlzQixFQUFyQixDQUFELENBQUEsQ0FBQTtDQUpBLENBS3FCLEVBQXBCLENBQUssQ0FBTixDQUFBO0NBTEEsQ0FPcUIsRUFBcEIsRUFBRCxLQUFBO0NBUEEsQ0FRb0IsQ0FBcEIsQ0FBQyxDQUFLLENBQU47Q0FSQSxDQVU2QixDQUE3QixDQUFDLENBQUssQ0FBTjtDQVZBLENBVzhCLEVBQTdCLENBQUssQ0FBTixDQUFBO0NBWEEsRUFhQSxDQUFDLENBQUssQ0FBTixLQUFBO01BZEY7Q0FnQkMsRUFBRyxDQUFILElBQUQsQ0FBQSxFQUFBO0NBcENGLEVBbUJNOztDQW5CTixFQXNDTyxFQUFQLElBQU87Q0FDSixFQUFHLENBQUgsS0FBRCxFQUFBO0NBdkNGLEVBc0NPOztDQXRDUCxFQXlDTSxDQUFOLEtBQVEsQ0FBRjtDQUNKLEdBQUE7Q0FFQyxDQUFtQixDQUErQixDQUFsRCxDQUFLLEtBQU4sQ0FBQSxxQkFBb0I7Q0E1Q3RCLEVBeUNNOztDQXpDTjs7Q0FERiJ9fSx7Im9mZnNldCI6eyJsaW5lIjoxMTgwNywiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2NvbXBvbmVudHMvYXVkaW8vcGxheWVyX3ByZXZpZXcuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gKGRvbSkgLT5cbiAgXG4gIGlzX3BsYXlpbmcgPSBmYWxzZVxuICBpY29uICAgICAgID0gZG9tLmZpbmQgJy5zcy1wbGF5J1xuICBpZiBpY29uLmxlbmd0aCA8PSAwXG4gICAgaWNvbiAgICAgICA9IGRvbS5maW5kICcuc3MtcGF1c2UnXG5cbiAgICBpZiBpY29uLmxlbmd0aCA8PSAwXG4gICAgICBsb2cgXCJFUlJPUiAtPiBbUExBWUVSIFBSRVZJRVddLiBpY29uLmxlbmd0aCA8PSAwXCJcbiAgICAgIHJldHVyblxuXG4gIHJlZiA9IEBcblxuICBkb20uYWRkQ2xhc3MgJ3BsYXllcl9wcmV2aWV3J1xuXG4gIHBsYXkgPSAtPlxuICAgIHJldHVybiBpZiBpc19wbGF5aW5nXG5cbiAgICBpc19wbGF5aW5nID0gdHJ1ZVxuICAgIGRvbS5hZGRDbGFzcyAncGxheWluZydcbiAgICBpY29uLmFkZENsYXNzKCAnc3MtcGF1c2UnICkucmVtb3ZlQ2xhc3MoICdzcy1wbGF5JyApXG5cblxuICAgIGFwcC5lbWl0ICdhdWRpbzpzdGFydGVkJywgcmVmLnVpZFxuXG4gIHN0b3AgPSAtPlxuICAgIHJldHVybiBpZiBub3QgaXNfcGxheWluZ1xuXG4gICAgaXNfcGxheWluZyA9IGZhbHNlXG4gICAgZG9tLnJlbW92ZUNsYXNzICdwbGF5aW5nJ1xuICAgIGljb24ucmVtb3ZlQ2xhc3MoICdzcy1wYXVzZScgKS5hZGRDbGFzcyggJ3NzLXBsYXknIClcblxuXG4gIHRvZ2dsZSA9IC0+XG4gICAgaWYgaXNfcGxheWluZ1xuICAgICAgc3RvcCgpXG4gICAgZWxzZVxuICAgICAgcGxheSgpXG5cbiAgaW5pdCA9IC0+XG4gICAgaWNvbi5vbiAnY2xpY2snLCB0b2dnbGVcblxuICAgIGFwcC5vbiAnYXVkaW86c3RhcnRlZCcsICh1aWQpIC0+XG4gICAgICBpZiB1aWQgaXNudCByZWYudWlkXG4gICAgICAgIHN0b3AoKVxuXG5cbiAgaW5pdCgpIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLENBQU8sRUFBVSxHQUFYLENBQU4sRUFBa0I7Q0FFaEIsS0FBQSx5Q0FBQTtDQUFBLENBQUEsQ0FBYSxFQUFiLEtBQUE7Q0FBQSxDQUNBLENBQWEsQ0FBYixNQUFhO0NBQ2IsQ0FBQSxFQUFHLEVBQUE7Q0FDRCxFQUFhLENBQWIsT0FBYTtDQUViLEdBQUEsRUFBRztDQUNELEVBQUEsR0FBQSx1Q0FBQTtDQUNBLFdBQUE7TUFMSjtJQUZBO0NBQUEsQ0FTQSxDQUFBLENBVEE7Q0FBQSxDQVdBLENBQUcsS0FBSCxRQUFBO0NBWEEsQ0FhQSxDQUFPLENBQVAsS0FBTztDQUNMLEdBQUEsTUFBQTtDQUFBLFdBQUE7TUFBQTtDQUFBLEVBRWEsQ0FBYixNQUFBO0NBRkEsRUFHRyxDQUFILElBQUEsQ0FBQTtDQUhBLEdBSUEsSUFBQSxDQUFBLENBQUEsQ0FBQTtDQUdJLENBQXNCLENBQXZCLENBQUgsT0FBQSxJQUFBO0NBckJGLEVBYU87Q0FiUCxDQXVCQSxDQUFPLENBQVAsS0FBTztBQUNTLENBQWQsR0FBQSxNQUFBO0NBQUEsV0FBQTtNQUFBO0NBQUEsRUFFYSxDQUFiLENBRkEsS0FFQTtDQUZBLEVBR0csQ0FBSCxLQUFBLEVBQUE7Q0FDSyxHQUFELElBQUosQ0FBQSxDQUFBLENBQUE7Q0E1QkYsRUF1Qk87Q0F2QlAsQ0ErQkEsQ0FBUyxHQUFULEdBQVM7Q0FDUCxHQUFBLE1BQUE7Q0FDRSxHQUFBLFNBQUE7TUFERjtDQUdFLEdBQUEsU0FBQTtNQUpLO0NBL0JULEVBK0JTO0NBL0JULENBcUNBLENBQU8sQ0FBUCxLQUFPO0NBQ0wsQ0FBQSxFQUFBLEVBQUEsQ0FBQTtDQUVJLENBQUosQ0FBRyxNQUFzQixFQUF6QixJQUFBO0NBQ0UsRUFBRyxDQUFBLENBQVMsQ0FBWjtDQUNFLEdBQUEsV0FBQTtRQUZvQjtDQUF4QixJQUF3QjtDQXhDMUIsRUFxQ087Q0FRUCxHQUFBLEtBQUE7Q0EvQ2UifX0seyJvZmZzZXQiOnsibGluZSI6MTE4NTcsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9jb21wb25lbnRzL2NsaWNrX3RyaWdnZXIuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIm5hdmlnYXRpb24gPSByZXF1aXJlICdhcHAvY29udHJvbGxlcnMvbmF2aWdhdGlvbidcbkhvdmVyVHJpZ2dlciA9IHJlcXVpcmUgJ2FwcC92aWV3cy9jb21wb25lbnRzL2hvdmVyX3RyaWdnZXInXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgQ2xpY2tUcmlnZ2VyIGV4dGVuZHMgSG92ZXJUcmlnZ2VyXG5cbiAgc2V0X2xpc3RlbmVyczogKCApIC0+XG4gICAgQGRvbS5vbiAnY2xpY2snLCBAdG9nZ2xlXG4gICAgYXBwLndpbmRvdy5vbiBcImJvZHk6Y2xpY2tlZFwiLCBAY2xvc2VcbiAgICBuYXZpZ2F0aW9uLm9uICdhZnRlcl9yZW5kZXInLCBAY2xvc2VcblxuICBkZXN0cm95OiAtPlxuICAgIHN1cGVyKClcbiAgICBAZG9tLm9mZiAnY2xpY2snLCBAdG9nZ2xlXG4gICAgYXBwLndpbmRvdy5vZmYgXCJib2R5OmNsaWNrZWRcIiwgQGNsb3NlXG4gICAgbmF2aWdhdGlvbi5vZmYgJ2FmdGVyX3JlbmRlcicsIEBjbG9zZVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsd0NBQUE7R0FBQTtrU0FBQTs7QUFBQSxDQUFBLEVBQWEsSUFBQSxHQUFiLGtCQUFhOztBQUNiLENBREEsRUFDZSxJQUFBLEtBQWYsd0JBQWU7O0FBRWYsQ0FIQSxFQUd1QixHQUFqQixDQUFOO0NBRUU7Ozs7O0NBQUE7O0NBQUEsRUFBZSxNQUFBLElBQWY7Q0FDRSxDQUFBLENBQUksQ0FBSixFQUFBLENBQUE7Q0FBQSxDQUNBLENBQUcsQ0FBSCxDQUFBLENBQVUsUUFBVjtDQUNXLENBQVgsRUFBK0IsQ0FBL0IsS0FBVSxDQUFWLEdBQUE7Q0FIRixFQUFlOztDQUFmLEVBS1MsSUFBVCxFQUFTO0NBQ1AsR0FBQSxvQ0FBQTtDQUFBLENBQ2tCLENBQWQsQ0FBSixFQUFBLENBQUE7Q0FEQSxDQUUrQixDQUE1QixDQUFILENBQUEsQ0FBVSxRQUFWO0NBQ1csQ0FBb0IsQ0FBL0IsQ0FBZ0MsQ0FBaEMsS0FBVSxDQUFWLEdBQUE7Q0FURixFQUtTOztDQUxUOztDQUYwQyJ9fSx7Im9mZnNldCI6eyJsaW5lIjoxMTg5MiwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2NvbXBvbmVudHMvZWRpdGFibGVzL2VkaXRhYmxlX3Byb2ZpbGVfdGFncy5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiRWRpdGFibGVUZXh0ID0gcmVxdWlyZSBcIi4vZWRpdGFibGVfdGV4dFwiXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgRWRpdGFibGVQcm9maWxlVGFncyBleHRlbmRzIEVkaXRhYmxlVGV4dFxuXG4gIGNvbnN0cnVjdG9yOiAoIEBkb20gKSAtPlxuICAgIHN1cGVyIEBkb21cbiAgICBAZG9tLmFkZENsYXNzICdlZGl0YWJsZV9wcm9maWxlX3RhZ3MnXG4gICAgQHRleHQgPSBAZG9tLmZpbmQgJy50ZXh0LnZhbHVlcydcbiAgICBAZW1wdHlfdGV4dCA9IEBkb20uZmluZCAnLnRleHQuZW1wdHknXG4gICAgXG5cbiAgb25fcmVhZHk6ICggaHRtbCApID0+XG4gICAgQGRvbS5hcHBlbmQgaHRtbFxuXG4gICAgdmlldy5vbmNlICdiaW5kZWQnLCBAb25fYmluZGVkXG4gICAgdmlldy5iaW5kIEBkb21cblxuICBvbl9iaW5kZWQ6ID0+XG5cbiAgICBAdGFncyA9IHZpZXcuZ2V0X2J5X2RvbSBAZG9tLmZpbmQoICcudGFnc193cmFwcGVyJyApXG5cbiAgICB0ID0gQHRleHQuaHRtbCgpXG4gICAgIyBsb2cgXCJbRWRpdGFibGVQcm9maWxlVGFnc10gdGV4dFwiLCB0Lmxlbmd0aFxuICAgIGlmIHQubGVuZ3RoID4gMFxuICAgICAgQGRhdGEgPSB0LnNwbGl0ICcsICdcbiAgICAgIEB0YWdzLmFkZF90YWdzIEBkYXRhXG5cbiAgICAgIEBkZWZhdWx0X3N0YXRlID0gb2ZmXG4gICAgZWxzZVxuICAgICAgQGVtcHR5X3RleHQuc2hvdygpXG4gICAgICBAZGVmYXVsdF9zdGF0ZSA9IG9uXG5cbiAgICBAdGV4dC5vbiAnY2xpY2snLCBAb3Blbl9lZGl0X21vZGVcbiAgICBAZW1wdHlfdGV4dC5vbiAnY2xpY2snLCBAb3Blbl9lZGl0X21vZGVcblxuICAgIEB0YWdzLm9uICdjaGFuZ2UnLCAoQGRhdGEpPT5cbiAgICAgIGlmIEBkYXRhLmxlbmd0aCA+IDEgb3IgQGRhdGFbMF0ubGVuZ3RoID4gMFxuICAgICAgICBAZGVmYXVsdF9zdGF0ZSA9IG9mZlxuICAgICAgZWxzZVxuICAgICAgICBAZGVmYXVsdF9zdGF0ZSA9IG9uXG4gICAgICBcbiAgICAgIEBlbWl0ICdjaGFuZ2VkJywgZGVmYXVsdF9zdGF0ZTogQGRlZmF1bHRfc3RhdGVcblxuXG4gIG9wZW5fZWRpdF9tb2RlOiAoZSkgPT5cbiAgICByZXR1cm4gdW5sZXNzIGFwcC5ib2R5Lmhhc0NsYXNzKCAnd3JpdGVfbW9kZScgKVxuXG4gICAgZT8uc3RvcFByb3BhZ2F0aW9uKClcbiAgICAjIGxvZyAnb3Blbl9lZGl0X21vZGUnXG4gICAgQGVtcHR5X3RleHQuaGlkZSgpXG4gICAgQGRvbS5hZGRDbGFzcyAnZWRpdF9tb2RlJ1xuXG4gICAgYXBwLndpbmRvdy5vbiAnYm9keTpjbGlja2VkJywgQGNsb3NlX3JlYWRfbW9kZVxuXG4gIGNsb3NlX3JlYWRfbW9kZSA6ID0+XG4gICAgQGRvbS5yZW1vdmVDbGFzcyAnZWRpdF9tb2RlJ1xuICAgIGxpc3QgPSBAdGFncy5nZXRfdGFncygpXG5cbiAgICBpZiBsaXN0Lmxlbmd0aCBpcyAwIG9yIGxpc3RbIDAgXS5sZW5ndGggaXMgMFxuICAgICAgQGVtcHR5X3RleHQuc2hvdygpXG4gICAgICBAdGV4dC5odG1sIFwiXCJcbiAgICBlbHNlXG4gICAgICBAdGV4dC5odG1sIGxpc3Quam9pbiggJywgJyApXG5cbiAgICBhcHAud2luZG93Lm9mZiAnYm9keTpjbGlja2VkJywgQGNsb3NlX3JlYWRfbW9kZVxuXG5cbiAgZ2V0X3RlbXBsYXRlOiAoIGNhbGxiYWNrICkgLT5cbiAgICAkLmdldCAnL2FwaS92MS9vY2N1cGF0aW9ucy9hbGwnLCAoZGF0YSkgLT5cbiAgICAgIHRtcGwgPSByZXF1aXJlICd0ZW1wbGF0ZXMvY29tcG9uZW50cy9lZGl0YWJsZXMvZWRpdGFibGVfcHJvZmlsZV90YWdzJ1xuXG4gICAgICBjYWxsYmFjayB0bXBsKCB2YWx1ZXM6IGRhdGEgKVxuXG4gIGdldF9jdXJyZW50X3ZhbHVlOiAtPlxuICAgIGlmIEBkZWZhdWx0X3N0YXRlXG4gICAgICByZXR1cm4gW11cbiAgICBlbHNlXG4gICAgICByZXR1cm4gQGRhdGFcblxuICBkZXN0cm95OiAtPlxuICAgIEB0ZXh0Lm9mZiAnY2xpY2snLCBAb3Blbl9lZGl0X21vZGVcbiAgICBAZW1wdHlfdGV4dC5vZmYgJ2NsaWNrJywgQG9wZW5fZWRpdF9tb2RlXG4gICAgc3VwZXIoKVxuXG5cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLDZCQUFBO0dBQUE7O2tTQUFBOztBQUFBLENBQUEsRUFBZSxJQUFBLEtBQWYsS0FBZTs7QUFFZixDQUZBLEVBRXVCLEdBQWpCLENBQU47Q0FFRTs7Q0FBYSxDQUFBLENBQUEsMEJBQUc7Q0FDZCxFQURjLENBQUQ7Q0FDYix3REFBQTtDQUFBLHNEQUFBO0NBQUEsNENBQUE7Q0FBQSwwQ0FBQTtDQUFBLEVBQUEsQ0FBQSxpREFBTTtDQUFOLEVBQ0ksQ0FBSixJQUFBLGVBQUE7Q0FEQSxFQUVRLENBQVIsVUFBUTtDQUZSLEVBR2MsQ0FBZCxNQUFBLEdBQWM7Q0FKaEIsRUFBYTs7Q0FBYixFQU9VLENBQUEsSUFBVixDQUFZO0NBQ1YsRUFBSSxDQUFKLEVBQUE7Q0FBQSxDQUVvQixFQUFwQixJQUFBLENBQUE7Q0FDSyxFQUFMLENBQUksT0FBSjtDQVhGLEVBT1U7O0NBUFYsRUFhVyxNQUFYO0NBRUUsT0FBQTtPQUFBLEtBQUE7Q0FBQSxFQUFRLENBQVIsTUFBUSxLQUFnQjtDQUF4QixFQUVJLENBQUo7Q0FFQSxFQUFjLENBQWQsRUFBRztDQUNELEVBQVEsQ0FBUCxDQUFPLENBQVI7Q0FBQSxHQUNDLEVBQUQsRUFBQTtDQURBLEVBR2lCLENBQWhCLENBSEQsQ0FHQSxPQUFBO01BSkY7Q0FNRSxHQUFDLEVBQUQsSUFBVztDQUFYLEVBQ2lCLENBQWhCLEVBQUQsT0FBQTtNQVhGO0NBQUEsQ0FhQSxFQUFBLEdBQUEsT0FBQTtDQWJBLENBY0EsRUFBQSxHQUFBLEdBQVcsSUFBWDtDQUVDLENBQUQsQ0FBbUIsQ0FBbEIsSUFBRCxDQUFxQixFQUFyQjtDQUNFLEVBRG1CLENBQ25CLENBRG1CLENBQUQ7Q0FDbEIsRUFBa0IsQ0FBZixDQUFDLENBQUo7Q0FDRSxFQUFpQixFQUFoQixHQUFELEtBQUE7TUFERixFQUFBO0NBR0UsRUFBaUIsQ0FBakIsQ0FBQyxHQUFELEtBQUE7UUFIRjtDQUtDLENBQWdCLEVBQWpCLENBQUMsSUFBRCxJQUFBO0NBQWlCLENBQWUsR0FBQyxHQUFoQixLQUFBO0NBTkEsT0FNakI7Q0FORixJQUFtQjtDQS9CckIsRUFhVzs7Q0FiWCxFQXdDZ0IsTUFBQyxLQUFqQjtBQUNnQixDQUFkLEVBQWlCLENBQWpCLElBQWMsSUFBQTtDQUFkLFdBQUE7TUFBQTs7Q0FFQyxLQUFELFNBQUE7TUFGQTtDQUFBLEdBSUEsTUFBVztDQUpYLEVBS0ksQ0FBSixJQUFBLEdBQUE7Q0FFSSxDQUFKLENBQUcsQ0FBNEIsRUFBckIsS0FBVixHQUFBLENBQUE7Q0FoREYsRUF3Q2dCOztDQXhDaEIsRUFrRGtCLE1BQUEsTUFBbEI7Q0FDRSxHQUFBLElBQUE7Q0FBQSxFQUFJLENBQUosT0FBQTtDQUFBLEVBQ08sQ0FBUCxJQUFPO0NBRVAsR0FBQSxDQUFrQixDQUFmO0NBQ0QsR0FBQyxFQUFELElBQVc7Q0FBWCxDQUNBLEVBQUMsRUFBRDtNQUZGO0NBSUUsR0FBQyxFQUFEO01BUEY7Q0FTSSxDQUEyQixDQUE1QixDQUE2QixFQUF0QixLQUFWLEdBQUEsQ0FBQTtDQTVERixFQWtEa0I7O0NBbERsQixFQStEYyxLQUFBLENBQUUsR0FBaEI7Q0FDRyxDQUFnQyxDQUFqQyxDQUFpQyxLQUFDLEVBQWxDLGNBQUE7Q0FDRSxHQUFBLE1BQUE7Q0FBQSxFQUFPLENBQVAsRUFBQSxDQUFPLCtDQUFBO0NBRUUsR0FBQSxJQUFULEtBQUE7Q0FBZSxDQUFRLEVBQVIsRUFBQSxFQUFBO0NBQWYsT0FBUztDQUhYLElBQWlDO0NBaEVuQyxFQStEYzs7Q0EvRGQsRUFxRW1CLE1BQUEsUUFBbkI7Q0FDRSxHQUFBLFNBQUE7Q0FDRSxDQUFBLFdBQU87TUFEVDtDQUdFLEdBQVEsU0FBRDtNQUpRO0NBckVuQixFQXFFbUI7O0NBckVuQixFQTJFUyxJQUFULEVBQVM7Q0FDUCxDQUFtQixDQUFuQixDQUFBLEdBQUEsT0FBQTtDQUFBLENBQ3lCLENBQXpCLENBQUEsR0FBQSxHQUFXLElBQVg7Q0FGTyxVQUdQLG9DQUFBO0NBOUVGLEVBMkVTOztDQTNFVDs7Q0FGaUQifX0seyJvZmZzZXQiOnsibGluZSI6MTIwMDMsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9jb21wb25lbnRzL2VkaXRhYmxlcy9lZGl0YWJsZV9zZWxlY3QuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIkVkaXRhYmxlVGV4dCA9IHJlcXVpcmUgXCIuL2VkaXRhYmxlX3RleHRcIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEVkaXRhYmxlU2VsZWN0IGV4dGVuZHMgRWRpdGFibGVUZXh0XG5cblx0ZGVmYXVsdF90ZXh0OiBTdHJpbmdcblxuXHRjb25zdHJ1Y3RvcjogKCBAZG9tICkgLT5cblx0XHRzdXBlciBAZG9tXG5cdFx0QGRvbS5hZGRDbGFzcyAnZWRpdGFibGVfc2VsZWN0J1xuXG5cdFx0QGN1cnJlbnRfdmFsdWUgPSBAZG9tLmRhdGEgJ3RleHQnXG5cdFx0QGRlZmF1bHRfc3RhdGUgPSBAZG9tLmRhdGEgJ2RlZmF1bHQtc2VsZWN0ZWQnXG5cblxuXHRvbl9yZWFkeTogKCBodG1sICkgPT5cblx0XHRAZG9tLmFwcGVuZCBodG1sXG5cblx0XHRAdGV4dCA9IEBkb20uZmluZCAnLnRleHQnXG5cdFx0QHNlbGVjdCA9IEBkb20uZmluZCAnc2VsZWN0J1xuXG5cdFx0IyBTZXQgZGVmYXVsdCB0ZXh0XG5cdFx0QGRlZmF1bHRfdGV4dCA9IEB0ZXh0Lmh0bWwoKVxuXHRcdEBzZWxlY3QuZmluZChcIi5kZWZhdWx0X3ZhbHVlXCIpLmh0bWwgQGRlZmF1bHRfdGV4dFxuXG5cdFx0cmVmID0gQFxuXHRcdEBzZWxlY3Qub24gJ2NoYW5nZScsIChlKSAtPlxuXHRcdFx0dCA9IHRoaXMub3B0aW9uc1tlLnRhcmdldC5zZWxlY3RlZEluZGV4XS50ZXh0XG5cdFx0XHR2ID0gdGhpcy5vcHRpb25zW2UudGFyZ2V0LnNlbGVjdGVkSW5kZXhdLnZhbHVlXG5cblx0XHRcdHJlZi5kZWZhdWx0X3N0YXRlID0gdi5sZW5ndGggPD0gMFxuXHRcdFx0cmVmLnVwZGF0ZV90ZXh0IHRcblxuXG5cblxuXHRcdCMgQ2hlY2sgaWYgdGhlIGluaXRpYWwgdmFsdWUgaXMgbm90IHRoZSBkZWZhdWx0XG5cdFx0aWYgbm90IEBkZWZhdWx0X3N0YXRlXG5cdFx0XHRAdXBkYXRlX3RleHQgQGN1cnJlbnRfdmFsdWVcblxuXG5cdHVwZGF0ZV90ZXh0OiAoIHN0ciApIC0+XG5cdFx0IyBsb2cgXCJbRWRpdGFibGVTZWxlY3RdIHVwZGF0ZV90ZXh0XCIsIHN0ciwgQGRlZmF1bHRfc3RhdGVcblx0XHRAdGV4dC50ZXh0IHN0clxuXHRcdEBkb20uZGF0YSAndGV4dCcsIHN0clxuXHRcdEBkb20uZGF0YSAnZGVmYXVsdC1zZWxlY3RlZCcsIEBkZWZhdWx0X3N0YXRlXG5cblx0XHRAZW1pdCAnY2hhbmdlZCcsIFxuXHRcdFx0dmFsdWU6IHN0clxuXHRcdFx0ZGVmYXVsdF9zdGF0ZTogQGRlZmF1bHRfc3RhdGVcblxuXHRnZXRfY3VycmVudF92YWx1ZTogLT5cblx0XHRpZiBAZGVmYXVsdF9zdGF0ZVxuXHRcdFx0cmV0dXJuIFwiXCJcblx0XHRlbHNlXG5cdFx0XHRyZXR1cm4gQHRleHQudGV4dCgpXG5cblxuXHRnZXRfdGVtcGxhdGU6ICggY2FsbGJhY2sgKSAtPlxuXHRcdCQuZ2V0ICcvYXBpL3YxL29jY3VwYXRpb25zL2FsbCcsIChkYXRhKSAtPlxuXHRcdFx0dG1wbCA9IHJlcXVpcmUgJ3RlbXBsYXRlcy9jb21wb25lbnRzL2VkaXRhYmxlcy9lZGl0YWJsZV9zZWxlY3QnXG5cblx0XHRcdGNhbGxiYWNrIHRtcGwoIHZhbHVlczogZGF0YSApXG5cblx0Y2xvc2VfcmVhZF9tb2RlIDogPT4gIyBlbXB0eVxuXG5cdGRlc3Ryb3k6IC0+XG5cdFx0QHNlbGVjdC5vZmYgJ2NoYW5nZSdcblx0XHRAc2VsZWN0ID0gbnVsbFxuXG5cdFx0c3VwZXIoKVxuXG5cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLHdCQUFBO0dBQUE7O2tTQUFBOztBQUFBLENBQUEsRUFBZSxJQUFBLEtBQWYsS0FBZTs7QUFFZixDQUZBLEVBRXVCLEdBQWpCLENBQU47Q0FFQzs7Q0FBQSxFQUFjLEdBQWQsTUFBQTs7Q0FFYSxDQUFBLENBQUEscUJBQUc7Q0FDZixFQURlLENBQUQ7Q0FDZCx3REFBQTtDQUFBLDBDQUFBO0NBQUEsRUFBQSxDQUFBLDRDQUFNO0NBQU4sRUFDSSxDQUFKLElBQUEsU0FBQTtDQURBLEVBR2lCLENBQWpCLEVBQWlCLE9BQWpCO0NBSEEsRUFJaUIsQ0FBakIsU0FBQSxLQUFpQjtDQVBsQixFQUVhOztDQUZiLEVBVVUsQ0FBQSxJQUFWLENBQVk7Q0FDWCxFQUFBLEtBQUE7Q0FBQSxFQUFJLENBQUosRUFBQTtDQUFBLEVBRVEsQ0FBUixHQUFRO0NBRlIsRUFHVSxDQUFWLEVBQUEsRUFBVTtDQUhWLEVBTWdCLENBQWhCLFFBQUE7Q0FOQSxHQU9BLEVBQU8sTUFBUCxJQUFBO0NBUEEsRUFTQSxDQUFBO0NBVEEsQ0FVQSxDQUFxQixDQUFyQixFQUFPLEVBQVAsQ0FBc0I7Q0FDckIsR0FBQSxNQUFBO0NBQUEsRUFBSSxDQUFJLEVBQVIsQ0FBaUIsTUFBQTtDQUFqQixFQUNJLENBQUksQ0FEUixDQUNBLENBQWlCLE1BQUE7Q0FEakIsRUFHRyxDQUE2QixFQUFoQyxPQUFBO0NBQ0ksRUFBRCxRQUFILEVBQUE7Q0FMRCxJQUFxQjtBQVdkLENBQVAsR0FBQSxTQUFBO0NBQ0UsR0FBQSxPQUFELEVBQUE7TUF2QlE7Q0FWVixFQVVVOztDQVZWLEVBb0NhLE1BQUUsRUFBZjtDQUVDLEVBQUEsQ0FBQTtDQUFBLENBQ2tCLENBQWQsQ0FBSixFQUFBO0NBREEsQ0FFOEIsQ0FBMUIsQ0FBSixTQUFBLEtBQUE7Q0FFQyxDQUNBLEVBREEsS0FBRCxFQUFBO0NBQ0MsQ0FBTyxDQUFQLEVBQUEsQ0FBQTtDQUFBLENBQ2UsRUFBQyxFQUFoQixPQUFBO0NBUlcsS0FNWjtDQTFDRCxFQW9DYTs7Q0FwQ2IsRUE4Q21CLE1BQUEsUUFBbkI7Q0FDQyxHQUFBLFNBQUE7Q0FDQyxDQUFBLFdBQU87TUFEUjtDQUdDLEdBQVEsU0FBRDtNQUpVO0NBOUNuQixFQThDbUI7O0NBOUNuQixFQXFEYyxLQUFBLENBQUUsR0FBaEI7Q0FDRSxDQUFnQyxDQUFqQyxDQUFpQyxLQUFDLEVBQWxDLGNBQUE7Q0FDQyxHQUFBLE1BQUE7Q0FBQSxFQUFPLENBQVAsRUFBQSxDQUFPLHlDQUFBO0NBRUUsR0FBQSxJQUFULEtBQUE7Q0FBZSxDQUFRLEVBQVIsRUFBQSxFQUFBO0NBQWYsT0FBUztDQUhWLElBQWlDO0NBdERsQyxFQXFEYzs7Q0FyRGQsRUEyRGtCLE1BQUEsTUFBbEI7O0NBM0RBLEVBNkRTLElBQVQsRUFBUztDQUNSLEVBQUEsQ0FBQSxFQUFPLEVBQVA7Q0FBQSxFQUNVLENBQVYsRUFBQTtDQUZRLFVBSVIsK0JBQUE7Q0FqRUQsRUE2RFM7O0NBN0RUOztDQUY2QyJ9fSx7Im9mZnNldCI6eyJsaW5lIjoxMjA4NywiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2NvbXBvbmVudHMvZWRpdGFibGVzL2VkaXRhYmxlX3RhZ3MuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbInJlcXVpcmUgJ2hhcHBlbnMnXG5yZXF1aXJlICd2ZW5kb3JzL2pxdWVyeS5hdXRvY29tcGxldGUubWluLmpzJ1xucmVxdWlyZSAndmVuZG9ycy9qcXVlcnkudGFnc2lucHV0LmpzJ1xuXG5MID0gcmVxdWlyZSAnLi4vLi4vLi4vYXBpL2xvb3BjYXN0L2xvb3BjYXN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEVkaXRhYmxlVGFnc1xuICBjdXJyZW50X2RhdGE6IFtdXG4gIHJlYWR5OiBmYWxzZVxuXG4gIGNvbnN0cnVjdG9yOiAoIEBkb20gKSAtPlxuXG4gICAgaGFwcGVucyBAXG5cbiAgICBMLmdlbnJlcy5hbGwgKCBlcnJvciwgbGlzdCApID0+XG4gICAgICBcbiAgICAgIEBkb20udGFnc0lucHV0IFxuICAgICAgICB3aWR0aDonYXV0bydcbiAgICAgICAgaGVpZ2h0OiAnYXV0bydcbiAgICAgICAgb25BZGRUYWc6IEBvbl9hZGRfdGFnXG4gICAgICAgIG9uUmVtb3ZlVGFnOiBAb25fcmVtb3ZlX3RhZ1xuICAgICAgICBhdXRvY29tcGxldGVfdXJsOiBsaXN0XG4gICAgICAgIGRlZmF1bHRUZXh0OiBcIkFkZCBuZXdcIlxuICAgICAgICBhdXRvY29tcGxldGU6IFxuICAgICAgICAgIHdpZHRoOiAyMDBcblxuICAgICAgZGVsYXkgMTAsID0+XG4gICAgICAgIEByZWFkeSA9IHRydWVcbiAgICAgICAgQGVtaXQgJ3JlYWR5J1xuXG4gICAgXG4gIHBvcHVsYXRlX3RhZ3M6ICggbGlzdCApIC0+XG4gICAgXG4gICAgXG5cbiAgb25fYWRkX3RhZzogKCB0YWcgKSA9PlxuICAgIGxvZyBcIltFZGl0YWJsZVRhZ3NdIG9uX2FkZF90YWdcIiwgdGFnXG4gICAgQGVtaXQgJ2NoYW5nZScsIEBnZXRfdGFncygpXG5cblxuICBvbl9yZW1vdmVfdGFnOiAoIHRhZyApID0+XG4gICAgbG9nIFwiW0VkaXRhYmxlVGFnc10gb25fcmVtb3ZlX3RhZ1wiLCB0YWdcbiAgICBAZW1pdCAnY2hhbmdlJywgQGdldF90YWdzKClcblxuICBnZXRfdGFnczogKCBhc19zdHJpbmcgPSBmYWxzZSApIC0+IFxuICAgIGlmIGFzX3N0cmluZ1xuICAgICAgQGRvbS52YWwoKVxuICAgIGVsc2VcbiAgICAgIEBkb20udmFsKCkuc3BsaXQoJywnKVxuXG4gIGFkZF90YWdzOiAodGFncyktPlxuICAgIGZvciB0IGluIHRhZ3NcbiAgICAgIEBkb20uYWRkVGFnIHQgKyBcIlwiLCB7IGZvY3VzOnRydWUsIHVuaXF1ZTp0cnVlIH1cblxuICBkZXN0cm95OiAtPlxuICAgIEBkb20uZGVzdHJveV90YWdzaW5wdXQoKVxuICAgIEBvbiAgICAgICAgICAgID0gbnVsbFxuICAgIEBvZmYgICAgICAgICAgID0gbnVsbFxuICAgIEBvbmNlICAgICAgICAgID0gbnVsbFxuICAgIEBlbWl0ICAgICAgICAgID0gbnVsbFxuICAgIEBvbl9hZGRfdGFnICAgID0gbnVsbFxuICAgIEBvbl9yZW1vdmVfdGFnID0gbnVsbFxuICAgIEBkb20gICAgICAgICAgID0gbnVsbFxuICAgICMgc3VwZXIoKSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFdBQUE7R0FBQSwrRUFBQTs7QUFBQSxDQUFBLE1BQUEsRUFBQTs7QUFDQSxDQURBLE1BQ0EsNkJBQUE7O0FBQ0EsQ0FGQSxNQUVBLHNCQUFBOztBQUVBLENBSkEsRUFJSSxJQUFBLHlCQUFBOztBQUVKLENBTkEsRUFNdUIsR0FBakIsQ0FBTjtDQUNFLENBQUEsQ0FBYyxTQUFkOztDQUFBLEVBQ08sRUFBUDs7Q0FFYSxDQUFBLENBQUEsbUJBQUc7Q0FFZCxPQUFBLElBQUE7Q0FBQSxFQUZjLENBQUQ7Q0FFYixvREFBQTtDQUFBLDhDQUFBO0NBQUEsR0FBQSxHQUFBO0NBQUEsQ0FFc0IsQ0FBdEIsQ0FBQSxDQUFhLENBQUwsR0FBTztDQUViLEVBQUksRUFBSCxDQUFELEdBQUE7Q0FDRSxDQUFNLEdBQU4sQ0FBQSxFQUFBO0NBQUEsQ0FDUSxJQUFSLEVBQUE7Q0FEQSxDQUVVLEdBQUMsR0FBWCxFQUZBO0NBQUEsQ0FHYSxHQUFDLEdBQWQsR0FBQSxFQUhBO0NBQUEsQ0FJa0IsRUFKbEIsSUFJQSxRQUFBO0NBSkEsQ0FLYSxNQUFiLENBTEEsRUFLQTtDQUxBLENBT0UsTUFERixJQUFBO0NBQ0UsQ0FBTyxDQUFQLEVBQUEsS0FBQTtVQVBGO0NBREYsT0FBQTtDQVVNLENBQU4sQ0FBVSxFQUFWLElBQVUsSUFBVjtDQUNFLEVBQVMsQ0FBVCxDQUFDLEdBQUQ7Q0FDQyxHQUFELENBQUMsRUFBRCxRQUFBO0NBRkYsTUFBVTtDQVpaLElBQWE7Q0FQZixFQUdhOztDQUhiLEVBd0JlLENBQUEsS0FBRSxJQUFqQjs7Q0F4QkEsRUE0QlksTUFBRSxDQUFkO0NBQ0UsQ0FBaUMsQ0FBakMsQ0FBQSx1QkFBQTtDQUNDLENBQWUsRUFBZixJQUFELEdBQUE7Q0E5QkYsRUE0Qlk7O0NBNUJaLEVBaUNlLE1BQUUsSUFBakI7Q0FDRSxDQUFvQyxDQUFwQyxDQUFBLDBCQUFBO0NBQ0MsQ0FBZSxFQUFmLElBQUQsR0FBQTtDQW5DRixFQWlDZTs7Q0FqQ2YsRUFxQ1UsS0FBVixDQUFZOztHQUFZLEdBQVo7TUFDVjtDQUFBLEdBQUEsS0FBQTtDQUNHLEVBQUcsQ0FBSCxTQUFEO01BREY7Q0FHRyxFQUFHLENBQUgsQ0FBRCxRQUFBO01BSk07Q0FyQ1YsRUFxQ1U7O0NBckNWLEVBMkNVLENBQUEsSUFBVixDQUFXO0NBQ1QsT0FBQSxhQUFBO0FBQUEsQ0FBQTtVQUFBLGlDQUFBO29CQUFBO0NBQ0UsQ0FBQSxDQUFJLENBQUgsRUFBRDtDQUFvQixDQUFRLEVBQVIsQ0FBRSxHQUFBO0NBQUYsQ0FBcUIsRUFBckIsRUFBYyxFQUFBO0NBQWxDLE9BQUE7Q0FERjtxQkFEUTtDQTNDVixFQTJDVTs7Q0EzQ1YsRUErQ1MsSUFBVCxFQUFTO0NBQ1AsRUFBSSxDQUFKLGFBQUE7Q0FBQSxDQUNBLENBQWlCLENBQWpCO0NBREEsRUFFQSxDQUFBO0NBRkEsRUFHaUIsQ0FBakI7Q0FIQSxFQUlpQixDQUFqQjtDQUpBLEVBS2lCLENBQWpCLE1BQUE7Q0FMQSxFQU1pQixDQUFqQixTQUFBO0NBQ0MsRUFBRCxDQUFDLE9BQUQ7Q0F2REYsRUErQ1M7O0NBL0NUOztDQVBGIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjEyMTgxLCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvY29tcG9uZW50cy9lZGl0YWJsZXMvZWRpdGFibGVfdGV4dC5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiaGFwcGVucyA9IHJlcXVpcmUgJ2hhcHBlbnMnXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEVkaXRhYmxlVGV4dFxuXG5cdGRlZmF1bHRfc3RhdGUgOiBvblxuXHRkZWZhdWx0X3RleHQ6IFwiXCJcblxuXHRjb25zdHJ1Y3RvcjogKCBAZG9tICkgLT5cblx0XHRoYXBwZW5zIEBcblxuXHRcdEBkb20uYWRkQ2xhc3MgJ2VkaXRhYmxlX3RleHQnXG5cblx0XHRAZG9tLm9uICdjbGljaycsIChlKSAtPiBlLnN0b3BQcm9wYWdhdGlvbigpXG5cblx0XHRAZ2V0X3RlbXBsYXRlIEBvbl9yZWFkeVxuXG5cdG9uX3JlYWR5OiAoIGh0bWwgKSA9PlxuXG5cdFx0dGV4dCA9IEBkb20udGV4dCgpXG5cdFx0XG5cdFx0QGRvbS5hcHBlbmQgaHRtbFxuXG5cdFx0QGlucHV0ID0gQGRvbS5maW5kICdpbnB1dCdcblxuXHRcdEBpbnB1dC52YWwgdGV4dFxuXG5cdFx0QHRleHRfZWwgPSBAZG9tLmZpbmQgJy50ZXh0J1xuXG5cdFx0IyBjb3B5IHN0eWxlIHRvIGlucHV0XG5cblx0XHRzdHlsZSA9IFxuXHRcdFx0J2ZvbnQtc2l6ZScgICAgICA6ICczNnB4J1xuXHRcdFx0J2ZvbnQtd2VpZ2h0JyAgICA6IEB0ZXh0X2VsLmNzcyAnZm9udC13ZWlnaHQnXG5cdFx0XHQncGFkZGluZycgICAgICAgIDogJzRweCAxMHB4IDEwcHgnXG5cdFx0XHQnbGV0dGVyLXNwYWNpbmcnIDogQHRleHRfZWwuY3NzICdsZXR0ZXItc3BhY2luZydcblx0XHRcdCdsaW5lLWhlaWdodCcgICAgOiBAdGV4dF9lbC5jc3MgJ2xpbmUtaGVpZ2h0J1xuXHRcdFx0J2NvbG9yJyAgICAgICAgICA6IEB0ZXh0X2VsLmNzcyAnY29sb3InXG5cblx0XHRAaW5wdXQuY3NzIHN0eWxlXG5cblx0XHRAdGV4dF9lbC5vbiAnY2xpY2snLCBAb3Blbl9lZGl0X21vZGVcblxuXHRnZXRfdGVtcGxhdGU6ICggY2FsbGJhY2sgKSAtPlxuXG5cdFx0dG1wbCA9IHJlcXVpcmUgJ3RlbXBsYXRlcy9jb21wb25lbnRzL2VkaXRhYmxlcy9lZGl0YWJsZV90ZXh0J1xuXHRcdFxuXHRcdGNhbGxiYWNrIHRtcGwoKVxuXG5cdG9wZW5fZWRpdF9tb2RlIDogKGUpID0+XG5cdFx0cmV0dXJuIHVubGVzcyBhcHAuYm9keS5oYXNDbGFzcyggJ3dyaXRlX21vZGUnIClcblxuXHRcdGU/LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0bG9nICdvcGVuX2VkaXRfbW9kZSdcblx0XHRAZG9tLmFkZENsYXNzICdlZGl0X21vZGUnXG5cblx0XHRAaW5wdXQuZm9jdXMoKS5zZWxlY3QoKVxuXHRcdEBpbnB1dC5vbiAna2V5dXAnLCAoZSkgPT5cblx0XHRcdGlmIGUua2V5Q29kZSBpcyAxM1xuXHRcdFx0XHRAY2xvc2VfcmVhZF9tb2RlKClcblxuXHRcdGFwcC53aW5kb3cub24gJ2JvZHk6Y2xpY2tlZCcsIEBjbG9zZV9yZWFkX21vZGVcblxuXHRjbG9zZV9yZWFkX21vZGUgOiA9PlxuXHRcdGxvZyAnY2xvc2VfZWRpdF9tb2RlJ1xuXHRcdEB0ZXh0X2VsLnRleHQgQGlucHV0LnZhbCgpXG5cdFx0QGRvbS5yZW1vdmVDbGFzcyAnZWRpdF9tb2RlJ1xuXG5cdFx0QGlucHV0Lm9mZiAna2V5dXAnXG5cblx0XHRhcHAud2luZG93Lm9mZiAnYm9keTpjbGlja2VkJywgQGNsb3NlX3JlYWRfbW9kZVxuXG5cdGRlc3Ryb3k6IC0+XG5cdFx0IyBAdGV4dF9lbC5vZmYgJ2NsaWNrJywgQG9wZW5fZWRpdF9tb2RlXG5cblxuXG5cblx0XG5cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGlCQUFBO0dBQUEsK0VBQUE7O0FBQUEsQ0FBQSxFQUFVLElBQVYsRUFBVTs7QUFDVixDQURBLEVBQ3VCLEdBQWpCLENBQU47Q0FFQyxFQUFnQixDQUFoQixTQUFBOztDQUFBLENBQUEsQ0FDYyxTQUFkOztDQUVhLENBQUEsQ0FBQSxtQkFBRztDQUNmLEVBRGUsQ0FBRDtDQUNkLHdEQUFBO0NBQUEsc0RBQUE7Q0FBQSwwQ0FBQTtDQUFBLEdBQUEsR0FBQTtDQUFBLEVBRUksQ0FBSixJQUFBLE9BQUE7Q0FGQSxDQUlBLENBQUksQ0FBSixHQUFBLEVBQWtCO0NBQU8sWUFBRCxFQUFBO0NBQXhCLElBQWlCO0NBSmpCLEdBTUEsSUFBQSxJQUFBO0NBVkQsRUFHYTs7Q0FIYixFQVlVLENBQUEsSUFBVixDQUFZO0NBRVgsT0FBQSxHQUFBO0NBQUEsRUFBTyxDQUFQO0NBQUEsRUFFSSxDQUFKLEVBQUE7Q0FGQSxFQUlTLENBQVQsQ0FBQSxFQUFTO0NBSlQsRUFNQSxDQUFBLENBQU07Q0FOTixFQVFXLENBQVgsR0FBQTtDQVJBLEVBYUMsQ0FERCxDQUFBO0NBQ0MsQ0FBbUIsSUFBbkIsS0FBQTtDQUFBLENBQ21CLENBQUEsQ0FBQyxFQUFwQixDQUEyQixNQUEzQjtDQURBLENBRW1CLElBQW5CLEdBQUEsTUFGQTtDQUFBLENBR21CLENBQUEsQ0FBQyxFQUFwQixDQUEyQixTQUEzQjtDQUhBLENBSW1CLENBQUEsQ0FBQyxFQUFwQixDQUEyQixNQUEzQjtDQUpBLENBS21CLENBQUEsQ0FBQyxFQUFwQixDQUFBO0NBbEJELEtBQUE7Q0FBQSxFQW9CQSxDQUFBLENBQU07Q0FFTCxDQUFELEVBQUMsR0FBTyxJQUFSLEdBQUE7Q0FwQ0QsRUFZVTs7Q0FaVixFQXNDYyxLQUFBLENBQUUsR0FBaEI7Q0FFQyxHQUFBLElBQUE7Q0FBQSxFQUFPLENBQVAsR0FBTyx1Q0FBQTtDQUVFLEdBQUEsSUFBVCxHQUFBO0NBMUNELEVBc0NjOztDQXRDZCxFQTRDaUIsTUFBQyxLQUFsQjtDQUNDLE9BQUEsSUFBQTtBQUFjLENBQWQsRUFBaUIsQ0FBakIsSUFBYyxJQUFBO0NBQWQsV0FBQTtNQUFBOztDQUVDLEtBQUQsU0FBQTtNQUZBO0NBQUEsRUFHQSxDQUFBLFlBQUE7Q0FIQSxFQUlJLENBQUosSUFBQSxHQUFBO0NBSkEsR0FNQSxDQUFNLENBQU47Q0FOQSxDQU9BLENBQW1CLENBQW5CLENBQU0sRUFBTixFQUFvQjtDQUNuQixDQUFBLEVBQUcsQ0FBYSxDQUFoQixDQUFHO0NBQ0QsSUFBQSxVQUFEO1FBRmlCO0NBQW5CLElBQW1CO0NBSWYsQ0FBSixDQUFHLENBQTRCLEVBQXJCLEtBQVYsR0FBQSxDQUFBO0NBeERELEVBNENpQjs7Q0E1Q2pCLEVBMERrQixNQUFBLE1BQWxCO0NBQ0MsRUFBQSxDQUFBLGFBQUE7Q0FBQSxFQUNjLENBQWQsQ0FBb0IsRUFBWjtDQURSLEVBRUksQ0FBSixPQUFBO0NBRkEsRUFJQSxDQUFBLENBQU0sRUFBTjtDQUVJLENBQTJCLENBQTVCLENBQTZCLEVBQXRCLEtBQVYsR0FBQSxDQUFBO0NBakVELEVBMERrQjs7Q0ExRGxCLEVBbUVTLElBQVQsRUFBUzs7Q0FuRVQ7O0NBSEQifX0seyJvZmZzZXQiOnsibGluZSI6MTIyNjQsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9jb21wb25lbnRzL2VkaXRhYmxlcy9zb2NpYWxfbGlua3MuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbImhhcHBlbnMgPSByZXF1aXJlICdoYXBwZW5zJ1xubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBTb2NpYWxMaW5rc1xuXG4gIGRlZmF1bHRfc3RhdGUgOiBvblxuICBkZWZhdWx0X3RleHQ6IFwiXCJcblxuICBkYXRhOiBbXVxuICB0ZW1wbGF0ZV9pbnB1dDogbnVsbFxuICByZWFkX3RlbXBsYXRlOiBcIlwiXG4gIGNvbnN0cnVjdG9yOiAoIEBkb20gKSAtPlxuICAgIGhhcHBlbnMgQFxuXG4gICAgQGRvbS5hZGRDbGFzcyAnc29jaWFsX2xpbmtzJ1xuXG4gICAgQGRvbV9yZWFkX21vZGUgPSAkICcuc29jaWFsX3JlYWRfbW9kZSdcblxuICAgIEBkb20ub24gJ2NsaWNrJywgKGUpIC0+IGUuc3RvcFByb3BhZ2F0aW9uKClcblxuICAgIEByZWFkX3RlbXBsYXRlID0gcmVxdWlyZSAndGVtcGxhdGVzL2NvbXBvbmVudHMvZWRpdGFibGVzL3NvY2lhbF9saW5rX3JlYWRfbW9kZSdcbiAgICBAd3JpdGVfdGVtcGxhdGUgPSByZXF1aXJlICd0ZW1wbGF0ZXMvY29tcG9uZW50cy9lZGl0YWJsZXMvc29jaWFsX2xpbmtzJ1xuXG4gICAgZGF0YSA9IEBkb20uZGF0YSAnbGlua3MnXG5cbiAgICBpZiBkYXRhLmxlbmd0aCA+IDBcbiAgICAgIEBkYXRhID0gQHN0cmluZ190b19zb2NpYWxfZGF0YSBkYXRhXG5cbiAgICBAYnVpbGRfd3JpdGVfbW9kZV9mcm9tX2RhdGEoKVxuICAgICMgVEVNUFxuICAgIEBidWlsZF9yZWFkX21vZGVfZnJvbV9kYXRhKClcblxuXG5cbiAgICBAbmV3X2xpbmtfYnRuID0gQGRvbS5maW5kICcuYWRkX25ld19saW5rJ1xuICAgIEB0ZW1wbGF0ZV9pbnB1dCA9IEBkb20uZmluZCggJ2lucHV0JyApLmNsb25lKCkudmFsKCAnJyApXG5cbiAgICBAbmV3X2xpbmtfYnRuLm9uICdjbGljaycsIEBhZGRfbmV3XG5cbiAgY2xvc2VfcmVhZF9tb2RlOiAtPlxuICAgIGxpbmtzID0gQGRvbS5maW5kICdpbnB1dCdcbiAgICBAZGF0YSA9IFtdXG4gICAgIyBVcGRhdGUgdGhlIHJlYWQgbW9kZVxuICAgIGZvciBpdGVtIGluIGxpbmtzXG4gICAgICBpZiBAaXNfdXJsIGl0ZW0udmFsdWVcbiAgICAgICAgZGF0YSA9IEBnZXRfc29jaWFsX2luZm9fZnJvbV91cmwgaXRlbS52YWx1ZVxuICAgICAgICBAZGF0YS5wdXNoIGRhdGFcblxuICAgIEBidWlsZF9yZWFkX21vZGVfZnJvbV9kYXRhKClcbiAgICAgICAgXG5cbiAgc3RyaW5nX3RvX3NvY2lhbF9kYXRhOiAoIGRhdGEgKSAtPlxuICAgIGRhdGEgPSBkYXRhLnNwbGl0ICcsJ1xuICAgIG91dHB1dCA9IFtdXG4gICAgZm9yIGl0ZW0gaW4gZGF0YVxuICAgICAgb3V0cHV0LnB1c2ggQGdldF9zb2NpYWxfaW5mb19mcm9tX3VybCggaXRlbSApXG5cbiAgICByZXR1cm4gb3V0cHV0XG5cblxuICBzb2NpYWxfZGF0YV90b19zdHJpbmc6ICggZGF0YSApIC0+XG4gICAgb3V0cHV0ID0gW11cbiAgICBmb3IgaXRlbSBpbiBkYXRhXG4gICAgICBvdXRwdXQucHVzaCBpdGVtLnZhbHVlXG5cbiAgICByZXR1cm4gb3V0cHV0LmpvaW4gJywnXG5cbiAgYnVpbGRfcmVhZF9tb2RlX2Zyb21fZGF0YTogLT5cbiAgICBodG1sID0gXCJcIlxuICAgIGZvciBpdGVtIGluIEBkYXRhXG4gICAgICBodG1sICs9IEByZWFkX3RlbXBsYXRlKCBpdGVtIClcbiAgICBAZG9tX3JlYWRfbW9kZS5odG1sIGh0bWxcblxuICBidWlsZF93cml0ZV9tb2RlX2Zyb21fZGF0YTogLT5cbiAgICBodG1sID0gQHdyaXRlX3RlbXBsYXRlIGxpbmtzOiBAZGF0YVxuICAgIEBkb20uaHRtbCBodG1sXG5cblxuICBnZXRfc29jaWFsX2luZm9fZnJvbV91cmw6ICggcyApIC0+XG5cbiAgICAjIGZhY2Vib29rLCBzcG90aWZ5LCBzb3VuZGNsb3VkXG4gICAgaWYgcy5pbmRleE9mKCAnZmFjZWJvb2suY29tJyApID4gLTFcbiAgICAgIHNvY2lhbCA9IFwiZmFjZWJvb2tcIlxuICAgICAgdGl0bGUgPSBcImZhY2Vib29rXCJcblxuICAgIGVsc2UgaWYgcy5pbmRleE9mKCAnc3BvdGlmeS5jb20nICkgPiAtMVxuICAgICAgc29jaWFsID0gXCJzcG90aWZ5XCJcbiAgICAgIHRpdGxlID0gXCJzcG90aWZ5XCJcblxuICAgIGVsc2UgaWYgcy5pbmRleE9mKCAnc291bmRjbG91ZC5jb20nICkgPiAtMVxuICAgICAgc29jaWFsID0gXCJzb3VuZGNsb3VkXCJcbiAgICAgIHRpdGxlID0gXCJzb3VuZGNsb3VkXCJcblxuICAgIGVsc2VcbiAgICAgIHNvY2lhbCA9IFwiZ2VuZXJpY1wiXG4gICAgICB0aXRsZSA9IFwidXNlciBsaW5rXCJcblxuICAgIHJldHVybiB7XG4gICAgICBzb2NpYWw6IHNvY2lhbFxuICAgICAgdGl0bGU6IHRpdGxlXG4gICAgICB2YWx1ZTogc1xuICAgIH1cblxuICBnZXRfY3VycmVudF92YWx1ZTogLT5cbiAgICByZXR1cm4gQHNvY2lhbF9kYXRhX3RvX3N0cmluZyggQGRhdGEgKVxuXG4gIGlzX3VybDogKCBzICkgLT5cbiAgICByZWdleHAgPSAvKGZ0cHxodHRwfGh0dHBzKTpcXC9cXC8oXFx3Kzp7MCwxfVxcdypAKT8oXFxTKykoOlswLTldKyk/KFxcL3xcXC8oW1xcdyMhOi4/Kz0mJUAhXFwtXFwvXSkpPy9cbiAgICByZXR1cm4gcmVnZXhwLnRlc3QocylcblxuICBhZGRfbmV3OiA9PlxuICAgIEBuZXdfbGlua19idG4uYmVmb3JlIEB0ZW1wbGF0ZV9pbnB1dC5jbG9uZSgpXG5cblxuICBnZXRfdGVtcGxhdGU6ICggY2FsbGJhY2sgKSAtPlxuXG4gICAgdG1wbCA9IHJlcXVpcmUgJ3RlbXBsYXRlcy9jb21wb25lbnRzL2VkaXRhYmxlcy9zb2NpYWxfbGlua3MnXG4gICAgXG4gICAgY2FsbGJhY2sgdG1wbCgpXG5cblxuICBkZXN0cm95OiAtPlxuICAgIEBuZXdfbGlua19idG4ub2ZmICdjbGljaycsIEBhZGRfbmV3XG5cblxuXG5cbiAgXG5cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGdCQUFBO0dBQUEsK0VBQUE7O0FBQUEsQ0FBQSxFQUFVLElBQVYsRUFBVTs7QUFDVixDQURBLEVBQ3VCLEdBQWpCLENBQU47Q0FFRSxFQUFnQixDQUFoQixTQUFBOztDQUFBLENBQUEsQ0FDYyxTQUFkOztDQURBLENBQUEsQ0FHTSxDQUFOOztDQUhBLEVBSWdCLENBSmhCLFVBSUE7O0NBSkEsQ0FBQSxDQUtlLFVBQWY7O0NBQ2EsQ0FBQSxDQUFBLGtCQUFHO0NBQ2QsR0FBQSxJQUFBO0NBQUEsRUFEYyxDQUFEO0NBQ2Isd0NBQUE7Q0FBQSxHQUFBLEdBQUE7Q0FBQSxFQUVJLENBQUosSUFBQSxNQUFBO0NBRkEsRUFJaUIsQ0FBakIsU0FBQSxNQUFpQjtDQUpqQixDQU1BLENBQUksQ0FBSixHQUFBLEVBQWtCO0NBQU8sWUFBRCxFQUFBO0NBQXhCLElBQWlCO0NBTmpCLEVBUWlCLENBQWpCLEdBQWlCLE1BQWpCLHlDQUFpQjtDQVJqQixFQVNrQixDQUFsQixHQUFrQixPQUFsQiwrQkFBa0I7Q0FUbEIsRUFXTyxDQUFQLEdBQU87Q0FFUCxFQUFpQixDQUFqQixFQUFHO0NBQ0QsRUFBUSxDQUFQLEVBQUQsZUFBUTtNQWRWO0NBQUEsR0FnQkEsc0JBQUE7Q0FoQkEsR0FrQkEscUJBQUE7Q0FsQkEsRUFzQmdCLENBQWhCLFFBQUEsR0FBZ0I7Q0F0QmhCLENBdUJrQixDQUFBLENBQWxCLENBQWtCLEVBQUEsT0FBbEI7Q0F2QkEsQ0F5QkEsRUFBQSxHQUFBLEtBQWE7Q0FoQ2YsRUFNYTs7Q0FOYixFQWtDaUIsTUFBQSxNQUFqQjtDQUNFLE9BQUEsbUJBQUE7Q0FBQSxFQUFRLENBQVIsQ0FBQSxFQUFRO0NBQVIsQ0FBQSxDQUNRLENBQVI7QUFFQSxDQUFBLFFBQUEsbUNBQUE7d0JBQUE7Q0FDRSxHQUFHLENBQUEsQ0FBSDtDQUNFLEVBQU8sQ0FBUCxDQUFPLEdBQVAsZ0JBQU87Q0FBUCxHQUNDLElBQUQ7UUFISjtDQUFBLElBSEE7Q0FRQyxHQUFBLE9BQUQsY0FBQTtDQTNDRixFQWtDaUI7O0NBbENqQixFQThDdUIsQ0FBQSxLQUFFLFlBQXpCO0NBQ0UsT0FBQSxjQUFBO0NBQUEsRUFBTyxDQUFQLENBQU87Q0FBUCxDQUFBLENBQ1MsQ0FBVCxFQUFBO0FBQ0EsQ0FBQSxRQUFBLGtDQUFBO3VCQUFBO0NBQ0UsR0FBQSxFQUFBLGtCQUFZO0NBRGQsSUFGQTtDQUtBLEtBQUEsS0FBTztDQXBEVCxFQThDdUI7O0NBOUN2QixFQXVEdUIsQ0FBQSxLQUFFLFlBQXpCO0NBQ0UsT0FBQSxjQUFBO0NBQUEsQ0FBQSxDQUFTLENBQVQsRUFBQTtBQUNBLENBQUEsUUFBQSxrQ0FBQTt1QkFBQTtDQUNFLEdBQUEsQ0FBQSxDQUFBO0NBREYsSUFEQTtDQUlBLEVBQU8sQ0FBQSxFQUFNLEtBQU47Q0E1RFQsRUF1RHVCOztDQXZEdkIsRUE4RDJCLE1BQUEsZ0JBQTNCO0NBQ0UsT0FBQSxrQkFBQTtDQUFBLENBQUEsQ0FBTyxDQUFQO0NBQ0E7Q0FBQSxRQUFBLGtDQUFBO3VCQUFBO0NBQ0UsR0FBQSxFQUFBLE9BQVE7Q0FEVixJQURBO0NBR0MsR0FBQSxPQUFELEVBQWM7Q0FsRWhCLEVBOEQyQjs7Q0E5RDNCLEVBb0U0QixNQUFBLGlCQUE1QjtDQUNFLEdBQUEsSUFBQTtDQUFBLEVBQU8sQ0FBUCxVQUFPO0NBQWdCLENBQU8sRUFBQyxDQUFSLENBQUE7Q0FBdkIsS0FBTztDQUNOLEVBQUcsQ0FBSCxPQUFEO0NBdEVGLEVBb0U0Qjs7Q0FwRTVCLEVBeUUwQixNQUFFLGVBQTVCO0NBR0UsT0FBQSxLQUFBO0FBQWtDLENBQWxDLEVBQWlDLENBQWpDLEdBQUcsT0FBQTtDQUNELEVBQVMsR0FBVCxJQUFBO0NBQUEsRUFDUSxFQUFSLENBQUEsSUFEQTtBQUdvQyxDQUE3QixFQUE0QixDQUE3QixFQUpSLENBSVEsTUFBQTtDQUNOLEVBQVMsR0FBVCxHQUFBO0NBQUEsRUFDUSxFQUFSLENBQUEsR0FEQTtBQUd1QyxDQUFoQyxFQUErQixDQUFoQyxFQVJSLENBUVEsU0FBQTtDQUNOLEVBQVMsR0FBVCxNQUFBO0NBQUEsRUFDUSxFQUFSLENBQUEsTUFEQTtNQVRGO0NBYUUsRUFBUyxHQUFULEdBQUE7Q0FBQSxFQUNRLEVBQVIsQ0FBQSxLQURBO01BYkY7Q0FnQkEsVUFBTztDQUFBLENBQ0csSUFBUjtDQURLLENBRUUsR0FBUCxDQUFBO0NBRkssQ0FHRSxHQUFQLENBQUE7Q0F0QnNCLEtBbUJ4QjtDQTVGRixFQXlFMEI7O0NBekUxQixFQWtHbUIsTUFBQSxRQUFuQjtDQUNFLEdBQVEsT0FBRCxVQUFBO0NBbkdULEVBa0dtQjs7Q0FsR25CLEVBcUdRLEdBQVIsR0FBVTtDQUNSLEtBQUEsRUFBQTtDQUFBLEVBQVMsQ0FBVCxFQUFBLDZFQUFBO0NBQ0EsR0FBTyxFQUFNLEtBQU47Q0F2R1QsRUFxR1E7O0NBckdSLEVBeUdTLElBQVQsRUFBUztDQUNOLEdBQUEsQ0FBb0IsQ0FBckIsS0FBQSxDQUFhLEVBQXVCO0NBMUd0QyxFQXlHUzs7Q0F6R1QsRUE2R2MsS0FBQSxDQUFFLEdBQWhCO0NBRUUsR0FBQSxJQUFBO0NBQUEsRUFBTyxDQUFQLEdBQU8sc0NBQUE7Q0FFRSxHQUFBLElBQVQsR0FBQTtDQWpIRixFQTZHYzs7Q0E3R2QsRUFvSFMsSUFBVCxFQUFTO0NBQ04sQ0FBMEIsQ0FBM0IsQ0FBQyxHQUFELElBQUEsQ0FBYTtDQXJIZixFQW9IUzs7Q0FwSFQ7O0NBSEYifX0seyJvZmZzZXQiOnsibGluZSI6MTI0MDksImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9jb21wb25lbnRzL2ZpeGVkX2Jhci5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSAoIGRvbSApIC0+XG4gIGggPSBkb20uaGVpZ2h0KClcbiAgZml4ZWQgPSBmYWxzZVxuXG4gIGFwcC53aW5kb3cub24gJ3Njcm9sbCcsICggeSApIC0+XG5cbiAgICBpZiB5ID49IGggYW5kIG5vdCBmaXhlZFxuICAgICAgZml4ZWQgPSB0cnVlXG4gICAgICBkb20uYWRkQ2xhc3MgJ2ZpeGVkJ1xuXG4gICAgZWxzZSBpZiB5IDwgaCBhbmQgZml4ZWRcbiAgICAgIGZpeGVkID0gZmFsc2VcbiAgICAgIGRvbS5yZW1vdmVDbGFzcyAnZml4ZWQnIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLENBQU8sRUFBVSxHQUFYLENBQU4sRUFBbUI7Q0FDakIsS0FBQSxFQUFBO0NBQUEsQ0FBQSxDQUFJLEdBQUE7Q0FBSixDQUNBLENBQVEsRUFBUjtDQUVJLENBQUosQ0FBRyxHQUFPLEVBQVYsQ0FBQTtBQUVvQixDQUFsQixHQUFBLENBQUE7Q0FDRSxFQUFRLENBQVIsQ0FBQSxDQUFBO0NBQ0ksRUFBRCxJQUFILENBQUEsS0FBQTtDQUVNLEVBQUksQ0FBSixDQUpSLENBQUE7Q0FLRSxFQUFRLEVBQVIsQ0FBQTtDQUNJLEVBQUQsSUFBSCxJQUFBLEVBQUE7TUFSb0I7Q0FBeEIsRUFBd0I7Q0FKVCJ9fSx7Im9mZnNldCI6eyJsaW5lIjoxMjQyNiwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2NvbXBvbmVudHMvZnVsbHNjcmVlbi5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBGdWxsc2NyZWVuXG5cdGZhY3RvcjogMVxuXHRtaW5faGVpZ2h0OiA1MDBcblxuXHRjb25zdHJ1Y3RvcjogKCBAZG9tICkgLT5cblx0XHRAZG9tLmFkZENsYXNzICdmdWxsc2NyZWVuJ1xuXHRcdGlmIEBkb20uZGF0YSAnZmFjdG9yJ1xuXHRcdFx0QGZhY3RvciA9IEBkb20uZGF0YSAnZmFjdG9yJ1xuXG5cdFx0YXBwLndpbmRvdy5vbiAncmVzaXplJywgQG9uX3Jlc2l6ZVxuXHRcdGRvIEBvbl9yZXNpemVcblxuXHRvbl9yZXNpemU6ICggKSA9PlxuXHRcdGggPSAoYXBwLndpbmRvdy5oIC0gYXBwLnNldHRpbmdzLmhlYWRlcl9oZWlnaHQpKkBmYWN0b3JcblxuXHRcdGggPSBNYXRoLm1heCBAbWluX2hlaWdodCwgaFxuXHRcdEBkb20uY3NzXG4gXHRcdFx0J3dpZHRoJyA6ICcxMDAlJ1xuIFx0XHRcdCdoZWlnaHQnIDogaFxuXG5cbiAgZGVzdHJveTogLT5cbiAgICBhcHAud2luZG93Lm9mZiAncmVzaXplJywgQG9uX3Jlc2l6ZSAgICBcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLE1BQUE7R0FBQSwrRUFBQTs7QUFBQSxDQUFBLEVBQXVCLEdBQWpCLENBQU47Q0FDQyxFQUFRLEdBQVI7O0NBQUEsRUFDWSxPQUFaOztDQUVhLENBQUEsQ0FBQSxpQkFBRztDQUNmLEVBRGUsQ0FBRDtDQUNkLDRDQUFBO0NBQUEsRUFBSSxDQUFKLElBQUEsSUFBQTtDQUNBLEVBQU8sQ0FBUCxJQUFHO0NBQ0YsRUFBVSxDQUFULEVBQUQsRUFBVTtNQUZYO0NBQUEsQ0FJQSxDQUFHLENBQUgsRUFBVSxFQUFWLENBQUE7Q0FKQSxHQUtHLEtBQUg7Q0FURCxFQUdhOztDQUhiLEVBV1csTUFBWDtDQUNDLE9BQUE7Q0FBQSxFQUFJLENBQUosRUFBZSxFQUFpQixLQUE1QjtDQUFKLENBRTBCLENBQXRCLENBQUosTUFBSTtDQUZKLEVBR0ksQ0FBSjtDQUNFLENBQVUsSUFBVixDQUFBO0NBQUEsQ0FDVyxJQUFYLEVBQUE7Q0FMRixLQUdBO1dBS0E7Q0FBQSxDQUFTLENBQUEsR0FBVCxDQUFBLEVBQVM7Q0FDSCxDQUFxQixDQUF0QixDQUF1QixFQUFoQixFQUFWLENBQUEsTUFBQTtDQURGLE1BQVM7Q0FUQztDQVhYLEVBV1c7O0NBWFg7O0NBREQifX0seyJvZmZzZXQiOnsibGluZSI6MTI0NjYsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9jb21wb25lbnRzL2hvdmVyLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJoYXBwZW5zID0gcmVxdWlyZSAnaGFwcGVucydcbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgSG92ZXJcblx0Y29uc3RydWN0b3I6ICggQGRvbSApIC0+XG5cdFx0cmV0dXJuIGlmIGFwcC5zZXR0aW5ncy50b3VjaF9kZXZpY2VcblxuXHRcdGhhcHBlbnMgQFxuXHRcdFxuXHRcdEBkb20ub24gJ21vdXNlb3ZlcicsIEBvbl9tb3VzZV9vdmVyXG5cdFx0QGRvbS5vbiAnbW91c2VsZWF2ZScsIEBvbl9tb3VzZV9sZWF2ZVxuXG5cdFx0QGRvbS5hZGRDbGFzcyAnaG92ZXJfb2JqZWN0J1xuXG5cdG9uX21vdXNlX292ZXI6ICggKSA9PlxuXHRcdEBkb20uYWRkQ2xhc3MgJ2hvdmVyZWQnXG5cblx0b25fbW91c2VfbGVhdmU6ICggKSA9PlxuXHRcdEBkb20ucmVtb3ZlQ2xhc3MgJ2hvdmVyZWQnXG5cblx0ZGVzdHJveTogLT5cblx0XHRAZG9tLm9mZiAnbW91c2VvdmVyJywgQG9uX21vdXNlX292ZXJcblx0XHRAZG9tLm9mZiAnbW91c2VsZWF2ZScsIEBvbl9tb3VzZV9sZWF2ZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFVBQUE7R0FBQSwrRUFBQTs7QUFBQSxDQUFBLEVBQVUsSUFBVixFQUFVOztBQUNWLENBREEsRUFDdUIsR0FBakIsQ0FBTjtDQUNjLENBQUEsQ0FBQSxZQUFHO0NBQ2YsRUFEZSxDQUFEO0NBQ2Qsc0RBQUE7Q0FBQSxvREFBQTtDQUFBLEVBQWEsQ0FBYixJQUFzQixJQUF0QjtDQUFBLFdBQUE7TUFBQTtDQUFBLEdBRUEsR0FBQTtDQUZBLENBSUEsQ0FBSSxDQUFKLE9BQUEsRUFBQTtDQUpBLENBS0EsQ0FBSSxDQUFKLFFBQUEsRUFBQTtDQUxBLEVBT0ksQ0FBSixJQUFBLE1BQUE7Q0FSRCxFQUFhOztDQUFiLEVBVWUsTUFBQSxJQUFmO0NBQ0UsRUFBRyxDQUFILElBQUQsQ0FBQSxFQUFBO0NBWEQsRUFVZTs7Q0FWZixFQWFnQixNQUFBLEtBQWhCO0NBQ0UsRUFBRyxDQUFILEtBQUQsRUFBQTtDQWRELEVBYWdCOztDQWJoQixFQWdCUyxJQUFULEVBQVM7Q0FDUixDQUFzQixDQUFsQixDQUFKLE9BQUEsRUFBQTtDQUNDLENBQXNCLENBQW5CLENBQUgsT0FBRCxDQUFBLEVBQUE7Q0FsQkQsRUFnQlM7O0NBaEJUOztDQUZEIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjEyNTA0LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvY29tcG9uZW50cy9ob3Zlcl90cmlnZ2VyLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbkFkZHMgdGhlIGNsYXNzICdob3ZlcmVkJyB0byB0aGUgZWxlbWVudCBhbmQgdG8gdGhlIHRhcmdldFxuVGhlIGNsYXNzIGlzIHRvZ2dsZWQgb24gbW91c2VvdmVyL21vdXNlbGVhdmUgZm9yIGRlc2t0b3BzXG5hbmQgb24gY2xpY2sgZm9yIHRvdWNoIGRldmljZXNcbiMjI1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEhvdmVyVHJpZ2dlclxuXHRvcGVuZWQ6IGZhbHNlXG5cdGtsYXNzOiBcImhvdmVyZWRcIlxuXG5cdGNvbnN0cnVjdG9yOiAoIEBkb20gKSAtPlxuXG5cdFx0QHRhcmdldCA9ICQgQGRvbS5kYXRhICd0YXJnZXQnXG5cblx0XHRpZiBAdGFyZ2V0Lmxlbmd0aCA8PSAwXG5cdFx0XHRsb2cgXCJbSG92ZXJUcmlnZ2VyXSBlcnJvci4gdGFyZ2V0IG5vdCBmb3VuZFwiLCBAZG9tLmRhdGEoICd0YXJnZXQnIClcblx0XHRcdHJldHVyblxuXG5cdFx0QGRvbS5hZGRDbGFzcyBcImhvdmVyX2Ryb3Bkb3duX3RyaWdnZXJcIlxuXHRcdGFwcC5vbiBcImRyb3Bkb3duOm9wZW5lZFwiLCBAb25fZHJvcGRvd25fb3BlbmVkXG5cdFx0YXBwLm9uIFwiZHJvcGRvd246Y2xvc2VkXCIsIEBvbl9kcm9wZG93bl9jbG9zZWRcblx0XHRhcHAud2luZG93Lm9uIFwic2Nyb2xsXCIsIEBjbG9zZVxuXG5cdFx0QHNldF9saXN0ZW5lcnMoKVxuXG5cblxuXHRzZXRfbGlzdGVuZXJzOiAoICkgLT5cblxuXHRcdGlmIGFwcC5zZXR0aW5ncy50b3VjaF9kZXZpY2Vcblx0XHRcdEBkb20ub24gJ2NsaWNrJywgQHRvZ2dsZVxuXHRcdGVsc2Vcblx0XHRcdEBkb20ub24gJ21vdXNlb3ZlcicsIEBvcGVuXG5cdFx0XHRAdGFyZ2V0Lm9uICdtb3VzZWxlYXZlJywgQGNsb3NlXG5cblx0XHRcblx0XHRcblxuXHRcdFxuXHR0b2dnbGU6ICggZSApID0+XG5cdFx0aWYgQG9wZW5lZFxuXHRcdFx0ZG8gQGNsb3NlXG5cdFx0ZWxzZVxuXHRcdFx0ZG8gQG9wZW5cblxuXHRcdGUuc3RvcFByb3BhZ2F0aW9uKClcblxuXG5cblx0b3BlbjogKCApID0+XG5cdFx0cmV0dXJuIGlmIEBvcGVuZWRcblx0XHRAb3BlbmVkID0gdHJ1ZVxuXG5cdFx0QGRvbS5hZGRDbGFzcyBAa2xhc3Ncblx0XHRAdGFyZ2V0LmFkZENsYXNzIEBrbGFzc1xuXG5cdFx0YXBwLmVtaXQgXCJkcm9wZG93bjpvcGVuZWRcIiwgQHVpZFxuXG5cdGNsb3NlOiAoICkgPT5cblx0XHRyZXR1cm4gaWYgbm90IEBvcGVuZWRcblx0XHRAb3BlbmVkID0gZmFsc2VcblxuXHRcdEBkb20ucmVtb3ZlQ2xhc3MgQGtsYXNzXG5cdFx0QHRhcmdldC5yZW1vdmVDbGFzcyBAa2xhc3NcblxuXHRcdGFwcC5lbWl0IFwiZHJvcGRvd246Y2xvc2VkXCIsIEB1aWRcblxuXHRvbl9kcm9wZG93bl9vcGVuZWQ6ICggZGF0YSApID0+XG5cdFx0QGNsb3NlKCkgaWYgZGF0YSBpc250IEB1aWRcblxuXHRvbl9kcm9wZG93bl9jbG9zZWQ6ICggZGF0YSApID0+XG5cblxuXHRkZXN0cm95OiAtPlxuXHRcdGlmIGFwcC5zZXR0aW5ncy50b3VjaF9kZXZpY2Vcblx0XHRcdEBkb20ub2ZmICdjbGljaycsIEB0b2dnbGVcblx0XHRlbHNlXG5cdFx0XHRAZG9tLm9mZiAnbW91c2VvdmVyJywgQG9wZW5cblx0XHRcdEB0YXJnZXQub2ZmICdtb3VzZWxlYXZlJywgQGNsb3NlXG5cblx0XHRhcHAud2luZG93Lm9mZiBcInNjcm9sbFwiLCBAY2xvc2VcblxuXHRcdGFwcC5vZmYgXCJkcm9wZG93bjpvcGVuZWRcIiwgQG9uX2Ryb3Bkb3duX29wZW5lZFxuXHRcdGFwcC5vZmYgXCJkcm9wZG93bjpjbG9zZWRcIiwgQG9uX2Ryb3Bkb3duX2Nsb3NlZFxuXG5cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Q0FBQTtDQUFBLEdBQUEsUUFBQTtHQUFBLCtFQUFBOztBQU1BLENBTkEsRUFNdUIsR0FBakIsQ0FBTjtDQUNDLEVBQVEsRUFBUixDQUFBOztDQUFBLEVBQ08sRUFBUCxJQURBOztDQUdhLENBQUEsQ0FBQSxtQkFBRztDQUVmLEVBRmUsQ0FBRDtDQUVkLDhEQUFBO0NBQUEsOERBQUE7Q0FBQSxvQ0FBQTtDQUFBLGtDQUFBO0NBQUEsc0NBQUE7Q0FBQSxFQUFVLENBQVYsRUFBQSxFQUFZO0NBRVosR0FBQSxFQUFVO0NBQ1QsQ0FBOEMsQ0FBOUMsQ0FBK0MsRUFBL0MsRUFBOEMsZ0NBQTlDO0NBQ0EsV0FBQTtNQUpEO0NBQUEsRUFNSSxDQUFKLElBQUEsZ0JBQUE7Q0FOQSxDQU9BLENBQUcsQ0FBSCxhQUFBLENBQUE7Q0FQQSxDQVFBLENBQUcsQ0FBSCxhQUFBLENBQUE7Q0FSQSxDQVNBLENBQUcsQ0FBSCxDQUFBLENBQVUsRUFBVjtDQVRBLEdBV0EsU0FBQTtDQWhCRCxFQUdhOztDQUhiLEVBb0JlLE1BQUEsSUFBZjtDQUVDLEVBQU0sQ0FBTixJQUFlLElBQWY7Q0FDRSxDQUFELENBQUksQ0FBSCxFQUFELENBQUEsTUFBQTtNQUREO0NBR0MsQ0FBQSxDQUFJLENBQUgsRUFBRCxLQUFBO0NBQ0MsQ0FBRCxFQUFDLENBQUQsQ0FBTyxNQUFQLENBQUE7TUFOYTtDQXBCZixFQW9CZTs7Q0FwQmYsRUFnQ1EsR0FBUixHQUFVO0NBQ1QsR0FBQSxFQUFBO0NBQ0MsR0FBSSxDQUFKLENBQUc7TUFESjtDQUdDLEdBQUksRUFBRDtNQUhKO0NBS0MsVUFBRCxJQUFBO0NBdENELEVBZ0NROztDQWhDUixFQTBDTSxDQUFOLEtBQU07Q0FDTCxHQUFBLEVBQUE7Q0FBQSxXQUFBO01BQUE7Q0FBQSxFQUNVLENBQVYsRUFBQTtDQURBLEVBR0ksQ0FBSixDQUFBLEdBQUE7Q0FIQSxHQUlBLENBQUEsQ0FBTyxFQUFQO0NBRUksQ0FBd0IsQ0FBekIsQ0FBSCxPQUFBLE1BQUE7Q0FqREQsRUEwQ007O0NBMUNOLEVBbURPLEVBQVAsSUFBTztBQUNRLENBQWQsR0FBQSxFQUFBO0NBQUEsV0FBQTtNQUFBO0NBQUEsRUFDVSxDQUFWLENBREEsQ0FDQTtDQURBLEVBR0ksQ0FBSixDQUFBLE1BQUE7Q0FIQSxHQUlBLENBQUEsQ0FBTyxLQUFQO0NBRUksQ0FBd0IsQ0FBekIsQ0FBSCxPQUFBLE1BQUE7Q0ExREQsRUFtRE87O0NBbkRQLEVBNERvQixDQUFBLEtBQUUsU0FBdEI7Q0FDQyxFQUFBLENBQUEsQ0FBc0I7Q0FBckIsR0FBQSxDQUFELFFBQUE7TUFEbUI7Q0E1RHBCLEVBNERvQjs7Q0E1RHBCLEVBK0RvQixDQUFBLEtBQUUsU0FBdEI7O0NBL0RBLEVBa0VTLElBQVQsRUFBUztDQUNSLEVBQU0sQ0FBTixJQUFlLElBQWY7Q0FDQyxDQUFrQixDQUFkLENBQUgsRUFBRCxDQUFBO01BREQ7Q0FHQyxDQUFzQixDQUFsQixDQUFILEVBQUQsS0FBQTtDQUFBLENBQzBCLENBQTFCLENBQUMsQ0FBRCxDQUFBLE1BQUE7TUFKRDtDQUFBLENBTXlCLENBQXRCLENBQUgsQ0FBQSxDQUFVLEVBQVY7Q0FOQSxDQVEyQixDQUF4QixDQUFILGFBQUEsQ0FBQTtDQUNJLENBQXVCLENBQXhCLENBQXlCLE9BQTVCLE1BQUEsQ0FBQTtDQTVFRCxFQWtFUzs7Q0FsRVQ7O0NBUEQifX0seyJvZmZzZXQiOnsibGluZSI6MTI2MDEsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9jb21wb25lbnRzL2ltYWdlX3VwbG9hZGVyLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJyZXF1aXJlICdoYXBwZW5zJ1xuQ2xvdWRpbmFyeSA9IHJlcXVpcmUgJ2FwcC9jb250cm9sbGVycy9jbG91ZGluYXJ5J1xuXG4jIyNcblVuc2lnbmVkIHVwbG9hZCB0byBDbG91ZGluYXJ5XG5odHRwOi8vY2xvdWRpbmFyeS5jb20vYmxvZy9kaXJlY3RfdXBsb2FkX21hZGVfZWFzeV9mcm9tX2Jyb3dzZXJfb3JfbW9iaWxlX2FwcF90b190aGVfY2xvdWRcbiMjI1xuXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgSW1hZ2VVcGxvYWRlciBcblx0Y29uc3RydWN0b3I6IChkb20pIC0+XG5cdFx0aGFwcGVucyBAXG5cdFx0XG5cdFx0IyBHZXQgdGhlIGNvbmZpZyB2YWx1ZXMgZnJvbSB0aGUgaGlkZGVuIGZpbGVzXG5cdFx0YXBpX2tleSAgICAgPSBkb20uZmluZCggJy5hcGlfa2V5JyApLnZhbCgpXG5cdFx0Y2xvdWRfbmFtZSAgPSBkb20uZmluZCggJy5jbG91ZF9uYW1lJyApLnZhbCgpXG5cdFx0dW5zaWduZWRfaWQgPSBkb20uZmluZCggJy51bnNpZ25lZF9pZCcgKS52YWwoKVxuXG5cdFx0IyBTZXQgdGhlIGNvbmZpZyBvbiB0aGUgY29udHJvbGxlclxuXHRcdENsb3VkaW5hcnkuc2V0X2NvbmZpZ1xuXHRcdFx0Y2xvdWRfbmFtZSAgOiBjbG91ZF9uYW1lXG5cdFx0XHRhcGlfa2V5ICAgICA6IGFwaV9rZXlcblx0XG5cblx0XHRwcm9ncmVzcyA9IGRvbS5maW5kICcucHJvZ3Jlc3MnXG5cblx0XHRyZWYgPSBAXG5cblxuXHRcdCMjI1xuXHRcdERpc2FibGUgZHJhZyBhbmQgZHJvcCBmZWF0dXJlIGJlY2F1c2Ugb2YgYSBjbG91ZGluYXJ5IGJ1Zzpcblx0XHR3aGVuIHR3byBpbnB1dCBmaWxlcyBhcmUgb24gdGhlIHNhbWUgcGFnZSwgd2hlbiB5b3UgZHJhZyBhbiBpbWFnZSBvbiBvbmUgaW5wdXQgZmlsZSwgXG5cdFx0Ym90aCBpbnB1dHMgd2lsbCB1cGxvYWQgdGhlIHNhbWUgaW1hZ2UgYXQgdGhlIHNhbWUgdGltZS5cblx0XHQjIyNcblx0XHRraWxsID0gKGUpIC0+IFxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRlLnN0b3BQcm9wYWdhdGlvbigpXG5cblxuXHRcdGRvbS5vblxuXHRcdFx0ZHJhZ292ZXI6IGtpbGxcblx0XHRcdGRyb3A6IGtpbGxcblx0XHRcdGRyYWdlbnRlcjoga2lsbFxuXHRcdFx0ZHJhZ2xlYXZlOiBraWxsXG5cblx0XHRcdFxuXG5cblx0XHRvbl91cGxvYWRfc3RhcnQgPSAoZSwgZGF0YSkgLT5cblx0XHRcdFx0XHRcblx0XHRcdGxvZyBcIltDbG91ZGluYXJ5XSBvbl91cGxvYWRfc3RhcnRcIiwgZSwgZGF0YVxuXG5cdFx0XHRwcm9ncmVzcy5yZW1vdmVDbGFzcyAnaGlkZSdcblxuXHRcdFx0cmVmLmVtaXQgJ3N0YXJ0ZWQnLCBkYXRhXG5cblx0XHRcblx0XHRvbl91cGxvYWRfcHJvZ3Jlc3MgPSAoZSwgZGF0YSkgLT5cblx0XHRcdHBlcmNlbnQgPSBkYXRhLmxvYWRlZCAvIGRhdGEudG90YWwgKiAxMDBcblx0XHRcdGxvZyBcIltDbG91ZGluYXJ5XSBvbl91cGxvYWRfcHJvZ3Jlc3NcIiwgcGVyY2VudCArIFwiJVwiXG5cblx0XHRcdHByb2dyZXNzLmNzcyBcIndpZHRoXCIsIFwiI3twZXJjZW50fSVcIlxuXG5cdFx0XHRyZWYuZW1pdCAncHJvZ3Jlc3MnLCBwcm9ncmVzc1xuXG5cblx0XHRvbl91cGxvYWRfY29tcGxldGUgPSAoZSwgZGF0YSkgLT4gXG5cdFx0XHRsb2cgXCJbSW1hZ2VVcGxvYWRlcl0gb25fdXBsb2FkX2NvbXBsZXRlXCIsIGUsIGRhdGFcblx0XHRcdFxuXHRcdFx0cHJvZ3Jlc3MuYWRkQ2xhc3MgJ2hpZGUnXG5cblx0XHRcdHJlZi5lbWl0ICdjb21wbGV0ZWQnLCBkYXRhXG5cblxuXHRcdG9uX3VwbG9hZF9mYWlsID0gKGUsIGRhdGEpIC0+XG5cdFx0XHRsb2cgXCJbQ2xvdWRpbmFyeV0gb25fdXBsb2FkX2ZhaWxcIiwgZVxuXG5cdFx0XHRyZWYuZW1pdCAnZXJyb3InLCBlXG5cblxuXG5cdFx0aXNfb3duX2V2ZW50ID0gKGUpIC0+XG5cdFx0XHRyZXR1cm4gZS5jdXJyZW50VGFyZ2V0XG5cblxuXG5cdFx0IyBJbml0aWFsaXNlIHRoZSBmb3JtIHdpdGggY2xvdWRpbmFyeVxuXHRcdGZvcm0gPSBkb20uZmluZCggJ2Zvcm0nIClcblx0XHRmb3JtLmFwcGVuZCggJC5jbG91ZGluYXJ5LnVuc2lnbmVkX3VwbG9hZF90YWcoIHVuc2lnbmVkX2lkLCB7XG5cdFx0XHRjbG91ZF9uYW1lOiBjbG91ZF9uYW1lXG5cdFx0fSwge1xuXHRcdFx0Y2xvdWRpbmFyeV9maWVsZDogdW5zaWduZWRfaWRcblx0XHR9KS5vbiggJ2Nsb3VkaW5hcnlkb25lJywgb25fdXBsb2FkX2NvbXBsZXRlIClcblx0XHQgLm9uKCAnZmlsZXVwbG9hZHN0YXJ0Jywgb25fdXBsb2FkX3N0YXJ0IClcblx0XHQgLm9uKCAnZmlsZXVwbG9hZHByb2dyZXNzJywgb25fdXBsb2FkX3Byb2dyZXNzIClcblx0XHQgLm9uKCAnZmlsZXVwbG9hZGZhaWwnLCBvbl91cGxvYWRfZmFpbCApXG5cdFx0KVxuXHRcdFx0IyBMaXN0ZW4gdG8gZXZlbnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEscUJBQUE7O0FBQUEsQ0FBQSxNQUFBLEVBQUE7O0FBQ0EsQ0FEQSxFQUNhLElBQUEsR0FBYixrQkFBYTs7Q0FFYjs7OztDQUhBOztBQVNBLENBVEEsRUFTdUIsR0FBakIsQ0FBTjtDQUNjLENBQUEsQ0FBQSxvQkFBQztDQUNiLE9BQUEsMElBQUE7Q0FBQSxHQUFBLEdBQUE7Q0FBQSxFQUdjLENBQWQsR0FBQSxHQUFjO0NBSGQsRUFJYyxDQUFkLE1BQUEsR0FBYztDQUpkLEVBS2MsQ0FBZCxPQUFBLEdBQWM7Q0FMZCxHQVFBLE1BQVU7Q0FDVCxDQUFjLElBQWQsSUFBQTtDQUFBLENBQ2MsSUFBZCxDQUFBO0NBVkQsS0FRQTtDQVJBLEVBYVcsQ0FBWCxJQUFBLEdBQVc7Q0FiWCxFQWVBLENBQUE7Q0FHQTs7Ozs7Q0FsQkE7Q0FBQSxFQXVCTyxDQUFQLEtBQVE7Q0FDUCxLQUFBLFFBQUE7Q0FDQyxZQUFELEVBQUE7Q0F6QkQsSUF1Qk87Q0F2QlAsQ0E0QkEsQ0FBRyxDQUFIO0NBQ0MsQ0FBVSxFQUFWLEVBQUEsRUFBQTtDQUFBLENBQ00sRUFBTixFQUFBO0NBREEsQ0FFVyxFQUZYLEVBRUEsR0FBQTtDQUZBLENBR1csRUFIWCxFQUdBLEdBQUE7Q0FoQ0QsS0E0QkE7Q0E1QkEsQ0FxQ3NCLENBQUosQ0FBbEIsS0FBbUIsTUFBbkI7Q0FFQyxDQUFvQyxDQUFwQyxDQUFBLEVBQUEsd0JBQUE7Q0FBQSxLQUVBLEVBQVEsR0FBUjtDQUVJLENBQWdCLENBQWpCLENBQUgsS0FBQSxJQUFBO0NBM0NELElBcUNrQjtDQXJDbEIsQ0E4Q3lCLENBQUosQ0FBckIsS0FBc0IsU0FBdEI7Q0FDQyxNQUFBLEdBQUE7Q0FBQSxFQUFVLENBQUksQ0FBSixDQUFWLENBQUE7Q0FBQSxDQUN1QyxDQUF2QyxHQUFBLENBQXVDLDBCQUF2QztDQURBLENBR3NCLENBQXRCLEdBQUEsQ0FBQSxDQUFRO0NBRUosQ0FBaUIsQ0FBbEIsQ0FBSCxJQUFBLEVBQUEsR0FBQTtDQXBERCxJQThDcUI7Q0E5Q3JCLENBdUR5QixDQUFKLENBQXJCLEtBQXNCLFNBQXRCO0NBQ0MsQ0FBMEMsQ0FBMUMsQ0FBQSxFQUFBLDhCQUFBO0NBQUEsS0FFQSxFQUFRO0NBRUosQ0FBa0IsQ0FBbkIsQ0FBSCxPQUFBLEVBQUE7Q0E1REQsSUF1RHFCO0NBdkRyQixDQStEcUIsQ0FBSixDQUFqQixLQUFrQixLQUFsQjtDQUNDLENBQW1DLENBQW5DLEdBQUEsdUJBQUE7Q0FFSSxDQUFjLENBQWYsQ0FBSCxHQUFBLE1BQUE7Q0FsRUQsSUErRGlCO0NBL0RqQixFQXNFZSxDQUFmLEtBQWdCLEdBQWhCO0NBQ0MsWUFBTztDQXZFUixJQXNFZTtDQXRFZixFQTRFTyxDQUFQLEVBQU87Q0E1RVAsQ0E2RTRELEVBQTVELEVBQUEsSUFBeUIsQ0FBWixRQUFBO0NBQStDLENBQy9DLElBQVosSUFBQTtFQUNFLElBRlU7Q0FFVixDQUNnQixJQUFsQixLQURFLEtBQ0Y7Q0FDQyxDQUpXLElBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUE7Q0E5RWQsRUFBYTs7Q0FBYjs7Q0FWRCJ9fSx7Im9mZnNldCI6eyJsaW5lIjoxMjY4MCwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2NvbXBvbmVudHMvbG9nZ2VkX2xpbmsuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbInVzZXJfY29udHJvbGxlciA9IHJlcXVpcmUgJ2FwcC9jb250cm9sbGVycy91c2VyJ1xubG9naW5fcG9wdXAgPSByZXF1aXJlICdhcHAvdXRpbHMvbG9naW5fcG9wdXAnXG5cbm1vZHVsZS5leHBvcnRzID0gKGRvbSkgLT5cblxuXHRvcmlnaW5hbF91cmwgPSBkb20uYXR0ciAnaHJlZidcblxuXHRvbl9jbGljayA9IC0+IFxuXHRcdGFwcC5zZXR0aW5ncy5hZnRlcl9sb2dpbl91cmwgPSBvcmlnaW5hbF91cmxcblx0XHRkbyBsb2dpbl9wb3B1cFxuXHRcdHJldHVybiBmYWxzZVxuXG5cdG9uX3VzZXJfbG9nZ2VkID0gKGRhdGEpIC0+XG5cdFx0ZG9tLmF0dHIgJ2hyZWYnLCBvcmlnaW5hbF91cmxcblx0XHRkb20ub2ZmICdjbGljaycsIG9uX2NsaWNrXG5cblx0b25fdXNlcl91bmxvZ2dlZCA9IChkYXRhKSAtPlxuXHRcdGRvbS5hdHRyICdocmVmJywgJyMnXG5cdFx0ZG9tLm9uICdjbGljaycsIG9uX2NsaWNrXG5cblx0dXNlcl9jb250cm9sbGVyLm9uICd1c2VyOmxvZ2dlZCcsICAgb25fdXNlcl9sb2dnZWRcblx0dXNlcl9jb250cm9sbGVyLm9uICd1c2VyOnVubG9nZ2VkJywgb25fdXNlcl91bmxvZ2dlZFxuXG5cdGlmIHVzZXJfY29udHJvbGxlci5pc19sb2dnZWQoKVxuXHRcdGRvIG9uX3VzZXJfbG9nZ2VkXG5cdGVsc2Vcblx0XHRkbyBvbl91c2VyX3VubG9nZ2VkXG5cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLHdCQUFBOztBQUFBLENBQUEsRUFBa0IsSUFBQSxRQUFsQixPQUFrQjs7QUFDbEIsQ0FEQSxFQUNjLElBQUEsSUFBZCxZQUFjOztBQUVkLENBSEEsRUFHaUIsR0FBWCxDQUFOLEVBQWtCO0NBRWpCLEtBQUEsa0RBQUE7Q0FBQSxDQUFBLENBQWUsQ0FBQSxFQUFBLE1BQWY7Q0FBQSxDQUVBLENBQVcsS0FBWCxDQUFXO0NBQ1YsRUFBRyxDQUFILElBQVksSUFBWixHQUFBO0NBQUEsR0FDRyxPQUFIO0NBQ0EsSUFBQSxNQUFPO0NBTFIsRUFFVztDQUZYLENBT0EsQ0FBaUIsQ0FBQSxLQUFDLEtBQWxCO0NBQ0MsQ0FBaUIsQ0FBZCxDQUFILEVBQUEsTUFBQTtDQUNJLENBQWEsQ0FBZCxJQUFILENBQUEsR0FBQTtDQVRELEVBT2lCO0NBUGpCLENBV0EsQ0FBbUIsQ0FBQSxLQUFDLE9BQXBCO0NBQ0MsQ0FBaUIsQ0FBZCxDQUFILEVBQUE7Q0FDSSxDQUFKLENBQUcsSUFBSCxDQUFBLEdBQUE7Q0FiRCxFQVdtQjtDQVhuQixDQWVBLFdBQUEsQ0FBQSxDQUFlO0NBZmYsQ0FnQkEsYUFBZSxDQUFmO0NBRUEsQ0FBQSxFQUFHLEtBQUEsTUFBZTtDQUNqQixVQUFHLEdBQUg7SUFERCxFQUFBO0NBR0MsVUFBRyxLQUFIO0lBdkJlO0NBQUEifX0seyJvZmZzZXQiOnsibGluZSI6MTI3MTMsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9jb21wb25lbnRzL2xvZ2luX3BvcHVwX2hhbmRsZXIuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbImxvZ2luX3BvcHVwID0gcmVxdWlyZSAnYXBwL3V0aWxzL2xvZ2luX3BvcHVwJ1xuXG5tb2R1bGUuZXhwb3J0cyA9ICggZG9tICkgLT5cblx0ZG9tLm9uICdjbGljaycsIC0+IGRvIGxvZ2luX3BvcHVwXG5cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLE9BQUE7O0FBQUEsQ0FBQSxFQUFjLElBQUEsSUFBZCxZQUFjOztBQUVkLENBRkEsRUFFaUIsR0FBWCxDQUFOLEVBQW1CO0NBQ2QsQ0FBSixDQUFHLElBQUgsRUFBQTtDQUFtQixVQUFHO0NBQXRCLEVBQWdCO0NBREEifX0seyJvZmZzZXQiOnsibGluZSI6MTI3MjUsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9jb21wb25lbnRzL2xvZ291dF9saW5rLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJ1c2VyX2NvbnRyb2xsZXIgPSByZXF1aXJlICdhcHAvY29udHJvbGxlcnMvdXNlcidcblxubW9kdWxlLmV4cG9ydHMgPSAoIGRvbSApIC0+XG5cblx0ZG9tLm9uICdjbGljaycsICggZSApIC0+XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0ZS5zdG9wUHJvcGFnYXRpb24oKVxuXG5cdFx0dXNlcl9jb250cm9sbGVyLmxvZ291dCAoIGVycm9yICkgLT5cblxuICAgICAgaWYgZXJyb3IgdGhlbiBjb25zb2xlLmVycm9yIGVycm9yXG4gICAgICBcblx0XHRcdGxvZyBcIltMb2dvdXRMaW5rXSBsb2dvdXQgc3VjY2VkZWVkLlwiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsV0FBQTs7QUFBQSxDQUFBLEVBQWtCLElBQUEsUUFBbEIsT0FBa0I7O0FBRWxCLENBRkEsRUFFaUIsR0FBWCxDQUFOLEVBQW1CO0NBRWQsQ0FBSixDQUFHLElBQUgsRUFBQTtDQUNDLEdBQUEsVUFBQTtDQUFBLEdBQ0EsV0FBQTtDQURBLEVBR3VCLENBQXZCLENBQXVCLENBQXZCLEdBQXlCLE1BQVY7Q0FFWCxHQUFHLENBQUgsQ0FBQTtDQUFzQixJQUFSLEVBQU8sUUFBUDtRQUZLO0NBQXZCLElBQXVCO0NBSWxCLEVBQUosUUFBQSxxQkFBQTtDQVJGLEVBQWdCO0NBRkEifX0seyJvZmZzZXQiOnsibGluZSI6MTI3NDQsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9jb21wb25lbnRzL21vZGFsLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJoYXBwZW5zID0gcmVxdWlyZSAnaGFwcGVucydcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBNb2RhbFxuXHRvcGVuZWQ6IGZhbHNlXG5cdGNvbnN0cnVjdG9yOiAoIEBkb20gKSAtPlxuXHRcdGhhcHBlbnMgQFxuXG5cdFx0QG92ZXJsYXkgPSAkICcubWRfb3ZlcmxheSdcblxuXG5cdG9wZW46ICggKSAtPlxuXHRcdHJldHVybiBpZiBAb3BlbmVkXG5cdFx0QG9wZW5lZCA9IHRydWVcblxuXHRcdEBkb20uYWRkQ2xhc3MgJ21kX3Zpc2libGUnXG5cdFx0ZGVsYXkgMTAsID0+XG5cdFx0XHRAZG9tLmFkZENsYXNzICdtZF9zaG93J1xuXG5cblx0XHRpZiBAZG9tLmRhdGEoICdtb2RhbC1jbG9zZScgKT8gYW5kIEBkb20uZGF0YSggJ21vZGFsLWNsb3NlJyApIGlzbnQgZmFsc2Vcblx0XHRcdEBjbG9zZV9vbl9jbGlja19vdXRzaWRlKClcblx0XHRlbHNlXG5cdFx0XHRAZGlzYWJsZV9jbG9zZV9vbl9jbGlja19vdXRzaWRlKClcblxuXHRcdEBlbWl0ICdvcGVuZWQnXG5cblx0Y2xvc2Vfb25fY2xpY2tfb3V0c2lkZTogLT5cblx0XHRAb3ZlcmxheS5vZmYoICdjbGljaycgKS5vbiggJ2NsaWNrJywgQGNsb3NlIClcblxuXHRkaXNhYmxlX2Nsb3NlX29uX2NsaWNrX291dHNpZGU6IC0+XG5cdFx0QG92ZXJsYXkub2ZmKCAnY2xpY2snIClcblxuXHRjbG9zZTogKCApID0+XG5cdFx0aWYgbm90IEBvcGVuZWRcblx0XHRcdGxvZyBcIltNb2RhbF0gaXQncyBhbHJlYWR5IGNsb3NlZCFcIlxuXHRcdFx0cmV0dXJuXG5cblx0XHRAb3BlbmVkID0gZmFsc2VcblxuXHRcdEBkb20ucmVtb3ZlQ2xhc3MgJ21kX3Nob3cnXHRcdFxuXHRcdGRlbGF5IDQwMCwgPT5cblx0XHRcdEBkb20ucmVtb3ZlQ2xhc3MgJ21kX3Zpc2libGUnXG5cblx0XHRcdGRvIEBoaWRlX2xvYWRpbmdcblxuXHRcdFx0QGVtaXQgJ2Nsb3NlZCdcblxuXHRzaG93X2xvYWRpbmc6ICggKSAtPlx0XHRcblx0XHRAZG9tLmFkZENsYXNzICdsb2FkaW5nJ1xuXG5cdGhpZGVfbG9hZGluZzogKCApIC0+XG5cdFx0QGRvbS5yZW1vdmVDbGFzcyAnbG9hZGluZydcblxuXHRkZXN0cm95OiAtPlxuXHRcdEBkb20gPSBudWxsXG5cdFx0QG9uID0gbnVsbFxuXHRcdEBvZmYgPSBudWxsXG5cdFx0QG9uY2UgPSBudWxsXG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxVQUFBO0dBQUEsK0VBQUE7O0FBQUEsQ0FBQSxFQUFVLElBQVYsRUFBVTs7QUFFVixDQUZBLEVBRXVCLEdBQWpCLENBQU47Q0FDQyxFQUFRLEVBQVIsQ0FBQTs7Q0FDYSxDQUFBLENBQUEsWUFBRztDQUNmLEVBRGUsQ0FBRDtDQUNkLG9DQUFBO0NBQUEsR0FBQSxHQUFBO0NBQUEsRUFFVyxDQUFYLEdBQUEsTUFBVztDQUpaLEVBQ2E7O0NBRGIsRUFPTSxDQUFOLEtBQU07Q0FDTCxPQUFBLElBQUE7Q0FBQSxHQUFBLEVBQUE7Q0FBQSxXQUFBO01BQUE7Q0FBQSxFQUNVLENBQVYsRUFBQTtDQURBLEVBR0ksQ0FBSixJQUFBLElBQUE7Q0FIQSxDQUlBLENBQVUsQ0FBVixDQUFBLElBQVU7Q0FDUixFQUFHLEVBQUgsR0FBRCxDQUFBLElBQUE7Q0FERCxJQUFVO0NBSVYsRUFBdUMsQ0FBdkMsQ0FBbUUsUUFBaEMseUJBQWhDO0NBQ0YsR0FBQyxFQUFELGdCQUFBO01BREQ7Q0FHQyxHQUFDLEVBQUQsd0JBQUE7TUFYRDtDQWFDLEdBQUEsSUFBRCxHQUFBO0NBckJELEVBT007O0NBUE4sRUF1QndCLE1BQUEsYUFBeEI7Q0FDRSxDQUFELENBQUEsQ0FBQyxDQUFELEVBQVEsSUFBUjtDQXhCRCxFQXVCd0I7O0NBdkJ4QixFQTBCZ0MsTUFBQSxxQkFBaEM7Q0FDRSxFQUFELENBQUMsR0FBTyxJQUFSO0NBM0JELEVBMEJnQzs7Q0ExQmhDLEVBNkJPLEVBQVAsSUFBTztDQUNOLE9BQUEsSUFBQTtBQUFPLENBQVAsR0FBQSxFQUFBO0NBQ0MsRUFBQSxHQUFBLHdCQUFBO0NBQ0EsV0FBQTtNQUZEO0NBQUEsRUFJVSxDQUFWLENBSkEsQ0FJQTtDQUpBLEVBTUksQ0FBSixLQUFBLEVBQUE7Q0FDTSxDQUFLLENBQVgsRUFBQSxJQUFXLEVBQVg7Q0FDQyxFQUFJLEVBQUgsQ0FBRCxLQUFBLENBQUE7Q0FBQSxJQUVJLENBQUQsTUFBSDtDQUVDLEdBQUQsQ0FBQyxHQUFELEtBQUE7Q0FMRCxJQUFXO0NBckNaLEVBNkJPOztDQTdCUCxFQTRDYyxNQUFBLEdBQWQ7Q0FDRSxFQUFHLENBQUgsSUFBRCxDQUFBLEVBQUE7Q0E3Q0QsRUE0Q2M7O0NBNUNkLEVBK0NjLE1BQUEsR0FBZDtDQUNFLEVBQUcsQ0FBSCxLQUFELEVBQUE7Q0FoREQsRUErQ2M7O0NBL0NkLEVBa0RTLElBQVQsRUFBUztDQUNSLEVBQUEsQ0FBQTtDQUFBLENBQ0EsQ0FBTSxDQUFOO0NBREEsRUFFQSxDQUFBO0NBQ0MsRUFBTyxDQUFQLE9BQUQ7Q0F0REQsRUFrRFM7O0NBbERUOztDQUhEIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjEyODIxLCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvY29tcG9uZW50cy9tb2RhbF9oYW5kbGVyLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IGNsYXNzIE1vZGFsSGFuZGxlclxuXHRjb25zdHJ1Y3RvcjogKCBAZG9tICkgLT5cblx0XHR2aWV3Lm9uY2UgJ2JpbmRlZCcsIEBvbl9yZWFkeVxuXG5cdG9uX3JlYWR5OiAoICkgPT5cblx0XHRtb2RhbF90YXJnZXQgPSB2aWV3LmdldF9ieV9kb20gQGRvbS5kYXRhKCAnbW9kYWwnIClcblx0XHRAZG9tLm9uICdjbGljaycsIC0+IG1vZGFsX3RhcmdldC5vcGVuKCkiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxRQUFBO0dBQUEsK0VBQUE7O0FBQUEsQ0FBQSxFQUF1QixHQUFqQixDQUFOO0NBQ2MsQ0FBQSxDQUFBLG1CQUFHO0NBQ2YsRUFEZSxDQUFEO0NBQ2QsMENBQUE7Q0FBQSxDQUFvQixFQUFwQixJQUFBO0NBREQsRUFBYTs7Q0FBYixFQUdVLEtBQVYsQ0FBVTtDQUNULE9BQUEsSUFBQTtDQUFBLEVBQWUsQ0FBZixHQUErQixHQUFoQixFQUFmO0NBQ0MsQ0FBRCxDQUFJLENBQUgsR0FBRCxFQUFpQixFQUFqQjtDQUFpQyxHQUFiLFFBQVksQ0FBWjtDQUFwQixJQUFpQjtDQUxsQixFQUdVOztDQUhWOztDQUREIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjEyODQ1LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvY29tcG9uZW50cy9wbGF5ZXIuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbImFwcGNhc3QgID0gcmVxdWlyZSAnYXBwL2NvbnRyb2xsZXJzL2FwcGNhc3QnXG5cbm1vZHVsZS5leHBvcnRzID0gKCBkb20gKSAtPlxuXG4gICMgc2hvcnRjdXQgdG8gZG9tIHRhZ3NcbiAgYXVkaW8gPSBkb20uZmluZCAnYXVkaW8nXG4gIHZ1ICAgID0gZG9tLmZpbmQgJy52dSdcbiAgXG4gICMgZ3JhYnMgc3RyZWFtIHVybCBmcm9tIERPTSBhdHRyaWJ1dGVcbiAgc3RyZWFtID0gYXVkaW8uZGF0YSAnc3JjJ1xuXG4gICMgaGlkZSBpdGVtcyB3aGVuIGluaXRpYWxpemluZ1xuICBhdWRpby5oaWRlKClcblxuICBhcHBjYXN0Lm9uICdjb25uZWN0ZWQnLCAoIHN0YXR1cyApIC0+XG5cbiAgICBpZiBzdGF0dXNcbiAgICAgIGRvbS5maW5kKCAnLnN0YXR1cycgKS5odG1sICcuLi4gd2FpdGluZyBzdHJlYW0gdG8gc3RhcnQgLi4uJ1xuICAgIGVsc2VcbiAgICAgIGRvbS5maW5kKCAnLnN0YXR1cycgKS5odG1sICcuLi4gd2FpdGluZyBBcHBDYXN0IHRvIHN0YXJ0IC4uLidcblxuICBhcHBjYXN0Lm9uIFwic3RyZWFtOmVycm9yXCIsICggZXJyb3IgKSAtPlxuICAgIGlmIG5vdCBlcnJvciB0aGVuIHJldHVyblxuXG4gICAgZG9tLmZpbmQoICcuc3RhdHVzJyApLmh0bWwgXCIuLi4gI3tlcnJvcn0gLi4uXCJcblxuICAjIHRlbXBvcmFyeSBzb2x1dGlvbiB3aGlsZSB3ZSBkb24ndCBoYXZlIGFwcGNhc3RzIHRvIHRoZSB3ZWJzZXJ2ZXJcbiAgIyBjaGVjayBzdHJlYW0gc3RhdHVzIGFuZCByZXRyaWVzIDEwMG1zIGFmdGVyIHJlc3BvbnNlXG4gIGNoZWNrX3N0cmVhbSA9IC0+XG5cbiAgICAkLmdldCBzdHJlYW0sICggZXJyb3IsIHJlc3BvbnNlICkgLT5cblxuICAgICAgaWYgZXJyb3JcblxuICAgICAgICAjIHRyeSBhZ2FpblxuICAgICAgICBkZWxheSAxMDAsIGNoZWNrX3N0cmVhbVxuXG4gICAgICAgIHJldHVybiBjb25zb2xlLmVycm9yICctIGVycm9yIGxvYWRpbmcgc3RyZWFtaW5nJ1xuXG4gICAgICBjb25zb2xlLndhcm4gJysgYWxsIGdvb2QhJ1xuXG4gICMgVE9ETzogU2V0IEFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbiBvbiBzdHJlYW1pbmcgc2VydmVyIHNvIGphdmFzY3JpcHRcbiAgIyB3aWxsIGJlIGFibGUgdG8gY2hlY2sgc3RyZWFtIHN0YXR1c1xuXG4gICMgZG8gY2hlY2tfc3RyZWFtXG5cblxuICAjIHJlbG9hZCBhdWRpbyB0YWdcbiAgc3RhcnRfYXVkaW8gPSAtPiBcbiAgICBhdWRpby5hdHRyICdzcmMnLCBhdWRpby5kYXRhICdzcmMnXG4gICAgYXVkaW8uc2hvdygpXG5cbiAgc3RvcF9hdWRpbyA9IC0+XG4gICAgYXVkaW8uc3RvcCgpXG4gICAgYXVkaW8uaGlkZSgpXG5cbiAgIyB0ZW1wb3JhcnkgaGFjayB0byBzdGFydCBhdWRpbyBvbmx5IGFmdGVyIHN0cmVhbSBzdGFydHNcbiAgYXBwY2FzdC5vbiAnc3RyZWFtOm9ubGluZScsICggc3RhdHVzICkgLT5cblxuICAgIGlmIHN0YXR1c1xuICAgICAgc3RhcnRfYXVkaW8oKVxuICAgIGVsc2VcbiAgICAgIHN0b3BfYXVkaW8oKVxuXG4gICMgY29uc29sZS53YXJuIFwibGlzdGVuaW5nIGZvciB2dVwiXG4gICMgdGVtcG9yYXJ5IGhhY2sgdG8gc3RhcnQgYXVkaW8gb25seSBhZnRlciBzdHJlYW0gc3RhcnRzXG4gIGFwcGNhc3Qub24gJ3N0cmVhbTp2dScsICggbWV0ZXIgKSAtPlxuXG4gICAgdnUuZmluZCggJy5tZXRlcl9sZWZ0JyApLndpZHRoIG1ldGVyWzBdICogMTAwMFxuICAgIHZ1LmZpbmQoICcubWV0ZXJfcmlnaHQnICkud2lkdGggbWV0ZXJbMV0gKiAxMDAwIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsR0FBQTs7QUFBQSxDQUFBLEVBQVcsSUFBWCxrQkFBVzs7QUFFWCxDQUZBLEVBRWlCLEdBQVgsQ0FBTixFQUFtQjtDQUdqQixLQUFBLGtEQUFBO0NBQUEsQ0FBQSxDQUFRLENBQUEsQ0FBUixFQUFRO0NBQVIsQ0FDQSxDQUFRLENBQUEsQ0FBQTtDQURSLENBSUEsQ0FBUyxDQUFBLENBQUssQ0FBZDtDQUpBLENBT0EsRUFBQSxDQUFLO0NBUEwsQ0FTQSxDQUF3QixHQUFBLENBQWpCLEVBQW1CLEVBQTFCO0NBRUUsR0FBQSxFQUFBO0NBQ00sRUFBRCxDQUFILEtBQUEsSUFBQSxvQkFBQTtNQURGO0NBR00sRUFBRCxDQUFILEtBQUEsSUFBQSxxQkFBQTtNQUxvQjtDQUF4QixFQUF3QjtDQVR4QixDQWdCQSxDQUEyQixFQUFBLEVBQXBCLEVBQXNCLEtBQTdCO0FBQ1MsQ0FBUCxHQUFBLENBQUE7Q0FBa0IsV0FBQTtNQUFsQjtDQUVJLEVBQUQsQ0FBSCxDQUE0QixDQUFBLEdBQTVCLEVBQUE7Q0FIRixFQUEyQjtDQWhCM0IsQ0F1QkEsQ0FBZSxNQUFBLEdBQWY7Q0FFRyxDQUFhLENBQWQsRUFBYyxDQUFkLEVBQWMsQ0FBRSxFQUFoQjtDQUVFLEdBQUcsQ0FBSCxDQUFBO0NBR0UsQ0FBVyxDQUFYLEVBQUEsR0FBQSxJQUFBO0NBRUEsSUFBTyxFQUFPLFFBQVAsWUFBQTtRQUxUO0NBT1EsR0FBUixHQUFPLE1BQVA7Q0FURixJQUFjO0NBekJoQixFQXVCZTtDQXZCZixDQTJDQSxDQUFjLE1BQUEsRUFBZDtDQUNFLENBQWtCLEVBQWxCLENBQUs7Q0FDQyxHQUFOLENBQUssTUFBTDtDQTdDRixFQTJDYztDQTNDZCxDQStDQSxDQUFhLE1BQUEsQ0FBYjtDQUNFLEdBQUEsQ0FBSztDQUNDLEdBQU4sQ0FBSyxNQUFMO0NBakRGLEVBK0NhO0NBL0NiLENBb0RBLENBQTRCLEdBQUEsQ0FBckIsRUFBdUIsTUFBOUI7Q0FFRSxHQUFBLEVBQUE7Q0FDRSxVQUFBLEVBQUE7TUFERjtDQUdFLFNBQUEsR0FBQTtNQUx3QjtDQUE1QixFQUE0QjtDQVNwQixDQUFSLENBQXdCLEVBQUEsRUFBakIsRUFBUCxFQUFBO0NBRUUsQ0FBRSxDQUF3QyxDQUExQyxDQUFBLFFBQUE7Q0FDRyxDQUFELENBQXlDLENBQTNDLENBQUEsTUFBQSxHQUFBO0NBSEYsRUFBd0I7Q0FoRVQifX0seyJvZmZzZXQiOnsibGluZSI6MTI5MDAsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9jb21wb25lbnRzL3Njcm9sbF9oYW5kbGVyLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFNjcm9sbEhhbmRsZXJcblx0Y29uc3RydWN0b3I6ICggQGRvbSApIC0+XG5cblx0XHR0YXJnZXQgPSAkIEBkb20uZGF0YSggJ3RhcmdldCcgKVxuXHRcdHJldHVybiBpZiB0YXJnZXQubGVuZ3RoIDw9IDBcblxuXHRcdEBkb20uYWRkQ2xhc3MgJ3Njcm9sbF9oYW5kbGVyJ1xuXHRcdFxuXHRcdEBkb20ub24gJ2NsaWNrJywgLT5cblx0XHRcdG1vdmVyLnNjcm9sbF90byB0YXJnZXRcblxuICBkZXN0cm95OiAtPlxuICAgIEBkb20ub2ZmICdjbGljayciXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxTQUFBOztBQUFBLENBQUEsRUFBdUIsR0FBakIsQ0FBTjtDQUNjLENBQUEsQ0FBQSxvQkFBRztDQUVmLEtBQUEsRUFBQTtDQUFBLEVBRmUsQ0FBRDtDQUVkLEVBQVMsQ0FBVCxFQUFBLEVBQVc7Q0FDWCxHQUFBLEVBQWdCO0NBQWhCLFdBQUE7TUFEQTtDQUFBLEVBR0ksQ0FBSixJQUFBLFFBQUE7Q0FIQSxDQUtBLENBQUksQ0FBSixHQUFBLEVBQWlCO0NBQ1YsSUFBRCxDQUFMLEdBQUEsSUFBQTtDQURELElBQWlCO0NBTGpCLEdBUUE7Q0FBQSxDQUFTLENBQUEsR0FBVCxDQUFBLEVBQVM7Q0FDTixFQUFHLENBQUgsR0FBRCxRQUFBO0NBREYsTUFBUztDQVJULEtBUUE7Q0FWRCxFQUFhOztDQUFiOztDQUREIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjEyOTI3LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvY29tcG9uZW50cy9zZWxlY3QuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbImhhcHBlbnMgPSByZXF1aXJlICdoYXBwZW5zJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFNlbGVjdFxuXG4gIGNvbnN0cnVjdG9yOiAoIEBkb20gKSAtPlxuXG4gICAgaGFwcGVucyBAXG4gICAgQGRvbS5hZGRDbGFzcyAnc2VsZWN0X3dyYXBwZXInXG5cbiAgICBoYW5kbGVyID0gQGRvbS5maW5kICcuaGFuZGxlciAudGV4dCdcbiAgICBzZWxlY3QgPSBAZG9tLmZpbmQgJ3NlbGVjdCdcbiAgICBcbiAgICByZWYgPSBAXG5cbiAgICBzZWxlY3Qub24gJ2NoYW5nZScsIC0+XG4gICAgICBcbiAgICAgIGhhbmRsZXIuaHRtbCBzZWxlY3QudmFsKClcblxuICAgICAgcmVmLmVtaXQgJ2NoYW5nZWQnLCBzZWxlY3QudmFsKCkiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxXQUFBOztBQUFBLENBQUEsRUFBVSxJQUFWLEVBQVU7O0FBRVYsQ0FGQSxFQUV1QixHQUFqQixDQUFOO0NBRWUsQ0FBQSxDQUFBLGFBQUc7Q0FFZCxPQUFBLFlBQUE7Q0FBQSxFQUZjLENBQUQ7Q0FFYixHQUFBLEdBQUE7Q0FBQSxFQUNJLENBQUosSUFBQSxRQUFBO0NBREEsRUFHVSxDQUFWLEdBQUEsU0FBVTtDQUhWLEVBSVMsQ0FBVCxFQUFBLEVBQVM7Q0FKVCxFQU1BLENBQUE7Q0FOQSxDQVFBLENBQW9CLENBQXBCLEVBQU0sRUFBTixDQUFvQjtDQUVsQixFQUFhLENBQWIsRUFBQSxDQUFPO0NBRUgsQ0FBZ0IsQ0FBakIsQ0FBSCxFQUEwQixHQUExQixJQUFBO0NBSkYsSUFBb0I7Q0FWdEIsRUFBYTs7Q0FBYjs7Q0FKRiJ9fSx7Im9mZnNldCI6eyJsaW5lIjoxMjk1MiwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2NvbXBvbmVudHMvc3RyZWFtX2NvbnRyb2xzLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJ1c2VyX2NvbnRyb2xsZXIgPSByZXF1aXJlICdhcHAvY29udHJvbGxlcnMvdXNlcidcblxuIyBUT0RPOiBhbmltYXRpb24gZm9yIGNvbnRyb2xzIGluIGFuZCBvdXRcblxubW9kdWxlLmV4cG9ydHMgPSAoIGRvbSApIC0+XG5cbiAgIyB3YWl0cyBtb2RlbCBnZXQgdXNlciBuYW1lXG4gIHVzZXJfY29udHJvbGxlci5vbiAndXNlcjpsb2dnZWQnLCAoIHVzZXIgKSAtPlxuXG4gICAgY29uc29sZS5sb2cgJ3VzZXIgbG9nZ2VkIC0+JywgdXNlci51c2VybmFtZVxuXG4gICAgaWYgXCIvI3t1c2VyLnVzZXJuYW1lfVwiIGlzIHdheXMucGF0aG5hbWUoKVxuICAgICAgJCggJy5jb250cm9scycgKS5zaG93KClcblxuXG4gIHVzZXJfY29udHJvbGxlci5vbiAndXNlcjp1bmxvZ2dlZCcsIC0+XG4gICAgJCggJy5jb250cm9scycgKS5oaWRlKClcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFdBQUE7O0FBQUEsQ0FBQSxFQUFrQixJQUFBLFFBQWxCLE9BQWtCOztBQUlsQixDQUpBLEVBSWlCLEdBQVgsQ0FBTixFQUFtQjtDQUdqQixDQUFBLENBQWtDLENBQUEsS0FBRSxJQUFwQyxFQUFlO0NBRWIsQ0FBOEIsQ0FBOUIsQ0FBQSxHQUFPLENBQVAsUUFBQTtDQUVBLEVBQUksQ0FBSixDQUEwQixHQUF2QjtDQUNELEdBQUEsT0FBQSxFQUFBO01BTDhCO0NBQWxDLEVBQWtDO0NBUWxCLENBQWhCLENBQW9DLE1BQXBDLE1BQWU7Q0FDYixHQUFBLE9BQUE7Q0FERixFQUFvQztDQVhyQiJ9fSx7Im9mZnNldCI6eyJsaW5lIjoxMjk3MCwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2NvbXBvbmVudHMvdXNlcl9zZXQuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gKCBkb20gKSAtPlxuICBzZXR0aW5nc19oYW5kbGVyID0gbnVsbFxuICBlZGl0X21vZGFsICAgICAgID0gbnVsbFxuXG4gIGluaXQgPSAtPlxuICAgIGRvbS5maW5kKCAnLmRvd25sb2FkX2J1dHRvbicgKS5vbiAnY2xpY2snLCBfZG93bmxvYWRcbiAgICBkb20uZmluZCggJy5lZGl0X2J1dHRvbicgKS5vbiAnY2xpY2snLCBfZWRpdFxuICAgIGRvbS5maW5kKCAnLmRlbGV0ZV9idXR0b24nICkub24gJ2NsaWNrJywgX3RvX2RlbGV0ZVxuXG4gICAgZG9tLmZpbmQoICcuY29uZmlybV9kZWxldGUnICkub24gJ2NsaWNrJywgX2NvbmZpcm1fZGVsZXRlXG4gICAgZG9tLmZpbmQoICcuY2FuY2VsX2RlbGV0ZScgKS5vbiAnY2xpY2snLCBfY2FuY2VsX2RlbGV0ZVxuXG4gICAgdmlldy5vbmNlICdiaW5kZWQnLCBfb25fdmlld3NfYmluZGVkXG5cbiAgX29uX3ZpZXdzX2JpbmRlZCA9IC0+XG4gICAgc2V0dGluZ3NfaGFuZGxlciA9IHZpZXcuZ2V0X2J5X2RvbSBkb20uZmluZCggJy5zZXR0aW5nc19idXR0b24nIClcbiAgICBlZGl0X21vZGFsID0gdmlldy5nZXRfYnlfZG9tICQoICcjcm9vbV9tb2RhbCcgKVxuXG4gIF9kb3dubG9hZCA9IC0+XG4gICAgbG9nIFwiW1NldF0gZG93bmxvYWRcIlxuXG4gIF9lZGl0ID0gLT5cbiAgICBzZXR0aW5nc19oYW5kbGVyLmNsb3NlKClcblxuICAgIGVkaXRfbW9kYWwub3Blbl93aXRoX2RhdGEgZG9tLmRhdGEoICdkYXRhJyApXG4gICAgZWRpdF9tb2RhbC5vbmNlICdzdWJtaXQnLCBfb25fZWRpdF9zdWJtaXRcblxuICBfb25fZWRpdF9zdWJtaXQgPSAoZGF0YSkgLT5cblxuICAgIGxvZyBcIltVc2VyIFNldF0gZWRpdCBzdWJtaXR0ZWRcIiwgZGF0YVxuXG4gICAgIyBVcGRhdGUgVUlcbiAgICBkb20uZmluZCggJy5zZXNzaW9uX3RpdGxlIGEnICkuaHRtbCBkYXRhLnRpdGxlXG4gICAgZG9tLmZpbmQoICcubG9jYXRpb24gLnRleHQnICkuaHRtbCBkYXRhLmxvY2F0aW9uXG5cbiAgICBnZW5yZXMgPSBkYXRhLmdlbnJlcy5zcGxpdCAnLCAnXG4gICAgZ2VucmVzX2RvbSA9IGRvbS5maW5kKCAnLmdlbnJlcycgKVxuICAgIHN0ciA9ICcnXG4gICAgZm9yIGdlbnJlIGluIGdlbnJlc1xuICAgICAgc3RyICs9IFwiPGEgY2xhc3M9J3RhZycgaHJlZj0nIycgdGl0bGU9JyN7Z2VucmV9Jz4je2dlbnJlfTwvYT5cIlxuXG4gICAgZ2VucmVzX2RvbS5odG1sIHN0clxuXG5cbiAgICBlZGl0X21vZGFsLmhpZGVfbWVzc2FnZSgpXG4gICAgZWRpdF9tb2RhbC5zaG93X2xvYWRpbmcoKVxuXG4gICAgIyBUT0RPOiBDYWxsIHRoZSBhcGlcbiAgICBkZWxheSAxMDAwLCAtPlxuICAgICAgZWRpdF9tb2RhbC5jbG9zZSgpXG5cblxuICBfdG9fZGVsZXRlID0gLT5cbiAgICBkb20uYWRkQ2xhc3MgJ3RvX2RlbGV0ZSdcbiAgICBzZXR0aW5nc19oYW5kbGVyLmNsb3NlKClcblxuICBfY2FuY2VsX2RlbGV0ZSA9IC0+XG4gICAgZG9tLnJlbW92ZUNsYXNzICd0b19kZWxldGUnXG5cbiAgX2NvbmZpcm1fZGVsZXRlID0gLT5cbiAgICBsb2cgXCJbU2V0XSBkZWxldGVcIlxuICAgIGRvbS5zbGlkZVVwKClcblxuXG4gIGluaXQoKSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxDQUFPLEVBQVUsR0FBWCxDQUFOLEVBQW1CO0NBQ2pCLEtBQUEsOEhBQUE7Q0FBQSxDQUFBLENBQW1CLENBQW5CLFlBQUE7Q0FBQSxDQUNBLENBQW1CLENBRG5CLE1BQ0E7Q0FEQSxDQUdBLENBQU8sQ0FBUCxLQUFPO0NBQ0wsQ0FBQSxDQUFHLENBQUgsR0FBQSxFQUFBLFNBQUE7Q0FBQSxDQUNBLENBQUcsQ0FBSCxDQUFBLEVBQUEsT0FBQTtDQURBLENBRUEsQ0FBRyxDQUFILEdBQUEsR0FBQSxNQUFBO0NBRkEsQ0FJQSxDQUFHLENBQUgsR0FBQSxRQUFBLEVBQUE7Q0FKQSxDQUtBLENBQUcsQ0FBSCxHQUFBLE9BQUEsRUFBQTtDQUVLLENBQWUsRUFBaEIsSUFBSixHQUFBLEtBQUE7Q0FYRixFQUdPO0NBSFAsQ0FhQSxDQUFtQixNQUFBLE9BQW5CO0NBQ0UsRUFBbUIsQ0FBbkIsTUFBbUIsTUFBbkIsRUFBbUM7Q0FDakIsRUFBTCxDQUFJLE1BQWpCLENBQUEsRUFBNkI7Q0FmL0IsRUFhbUI7Q0FibkIsQ0FpQkEsQ0FBWSxNQUFaO0NBQ00sRUFBSixRQUFBLEtBQUE7Q0FsQkYsRUFpQlk7Q0FqQlosQ0FvQkEsQ0FBUSxFQUFSLElBQVE7Q0FDTixHQUFBLENBQUEsV0FBZ0I7Q0FBaEIsRUFFNkIsQ0FBN0IsRUFBMEIsSUFBaEIsSUFBVjtDQUNXLENBQWUsRUFBMUIsSUFBQSxFQUFVLENBQVYsSUFBQTtDQXhCRixFQW9CUTtDQXBCUixDQTBCQSxDQUFrQixDQUFBLEtBQUMsTUFBbkI7Q0FFRSxPQUFBLGdDQUFBO0NBQUEsQ0FBaUMsQ0FBakMsQ0FBQSx1QkFBQTtDQUFBLEVBR0csQ0FBSCxDQUFBLGFBQUE7Q0FIQSxFQUlHLENBQUgsSUFBQSxTQUFBO0NBSkEsRUFNUyxDQUFULENBQVMsQ0FBVDtDQU5BLEVBT2EsQ0FBYixLQUFhLENBQWI7Q0FQQSxDQUFBLENBUUEsQ0FBQTtBQUNBLENBQUEsUUFBQSxvQ0FBQTswQkFBQTtDQUNFLEVBQUEsQ0FBUSxDQUFBLENBQVIsMkJBQVE7Q0FEVixJQVRBO0NBQUEsRUFZQSxDQUFBLE1BQVU7Q0FaVixHQWVBLE1BQVUsRUFBVjtDQWZBLEdBZ0JBLE1BQVUsRUFBVjtDQUdNLENBQU0sQ0FBQSxDQUFaLENBQUEsSUFBWSxFQUFaO0NBQ2EsSUFBWCxLQUFVLEdBQVY7Q0FERixJQUFZO0NBL0NkLEVBMEJrQjtDQTFCbEIsQ0FtREEsQ0FBYSxNQUFBLENBQWI7Q0FDRSxFQUFHLENBQUgsSUFBQSxHQUFBO0NBQ2lCLElBQWpCLE1BQUEsS0FBZ0I7Q0FyRGxCLEVBbURhO0NBbkRiLENBdURBLENBQWlCLE1BQUEsS0FBakI7Q0FDTSxFQUFELFFBQUg7Q0F4REYsRUF1RGlCO0NBdkRqQixDQTBEQSxDQUFrQixNQUFBLE1BQWxCO0NBQ0UsRUFBQSxDQUFBLFVBQUE7Q0FDSSxFQUFELElBQUgsSUFBQTtDQTVERixFQTBEa0I7Q0FLbEIsR0FBQSxLQUFBO0NBaEVlIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjEzMDI5LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvZGFzaGJvYXJkL2FwcGNhc3RfaW5zdHJ1Y3Rpb25zLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJhcHBjYXN0ID0gcmVxdWlyZSAnLi4vLi4vY29udHJvbGxlcnMvYXBwY2FzdCdcblxubW9kdWxlLmV4cG9ydHMgPSAoIGRvbSApIC0+XG5cbiAgYXBwY2FzdC5vbiAnY29ubmVjdGVkJywgKCBpc19jb25uZWN0ZWQgKSAtPlxuXG4gICAgaWYgaXNfY29ubmVjdGVkXG5cbiAgICAgIGRvbS5oaWRlKClcblxuICAgIGVsc2VcblxuICAgICAgZG9tLnNob3coKSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLEdBQUE7O0FBQUEsQ0FBQSxFQUFVLElBQVYsb0JBQVU7O0FBRVYsQ0FGQSxFQUVpQixHQUFYLENBQU4sRUFBbUI7Q0FFVCxDQUFSLENBQXdCLElBQWpCLEVBQVAsRUFBQSxDQUF3QjtDQUV0QixHQUFBLFFBQUE7Q0FFTSxFQUFELENBQUgsU0FBQTtNQUZGO0NBTU0sRUFBRCxDQUFILFNBQUE7TUFSb0I7Q0FBeEIsRUFBd0I7Q0FGVCJ9fSx7Im9mZnNldCI6eyJsaW5lIjoxMzA0NSwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2Rhc2hib2FyZC9nb19saXZlLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJMICAgICAgID0gcmVxdWlyZSAnLi4vLi4vYXBpL2xvb3BjYXN0L2xvb3BjYXN0J1xuYXBwY2FzdCA9IHJlcXVpcmUgJy4uLy4uL2NvbnRyb2xsZXJzL2FwcGNhc3QnXG5cbm1vZHVsZS5leHBvcnRzID0gKCBkb20gKSAtPlxuXG4gICMgVE9ETzogZmV0Y2ggaW5mb3JtYXRpb24gZnJvbSBiYWNrZW5kXG4gIGxpdmUgPSBmYWxzZVxuXG4gICMgbGlzdGVucyBmb3IgYXBwY2FzdCBzdHJlYW1pbmcgc3RhdHVzIHdoaWxlIHN0cmVhbWluZ1xuICB3aGlsZV9zdHJlYW1pbmcgPSAoIHN0YXR1cyApIC0+XG5cbiAgICBpZiBub3Qgc3RhdHVzXG5cbiAgICAgIGFsZXJ0ICdzdHJlYW1pbmcgd2VudCBvZmZsaW5lIHdoaWxlIHN0cmVhbWluZydcblxuICAgICAgcmV0dXJuXG5cbiAgICBpZiBzdGF0dXNcbiAgICAgIGFsZXJ0ICdzdHJlYW1pbmcgd2VudCBvbmxpbmUgd2hpbGUgc3RyZWFtaW5nJ1xuXG4gICAgICByZXR1cm4gICAgICBcblxuICAjIGxpc3RlbnMgZm9yIGFwcGNhc3Qgc3RyZWFtaW5nIHN0YXR1cyB3aGVuIHN0YXJ0aW5nIHRoZSBzdHJlYW1cbiAgd2FpdGluZ19zdHJlYW0gPSAoIHN0YXR1cyApIC0+XG5cbiAgICBpZiBub3Qgc3RhdHVzIHRoZW4gcmV0dXJuXG5cbiAgICAjIGNhbGwgdGhlIGFwaVxuICAgIEwucm9vbXMuc3RhcnRfc3RyZWFtICQoICcjcm9vbV9pZCcgKS52YWwoKSwgKCBlcnJvciwgcmVzdWx0ICkgLT5cblxuICAgICAgaWYgZXJyb3JcbiAgICAgICAgZG9tLmZpbmQoJ2EnKS5odG1sIFwiZXJyb3JcIlxuXG4gICAgICAgIGNvbnNvbGUuZXJyb3IgZXJyb3JcblxuICAgICAgICAjIExBVEVSOiBDSEVDSyBJRiBVU0VSIElTIE9GRkxJTkUgQU5EIFdBSVQgRk9SIENPTk5FQ1RJT04/XG4gICAgICAgIHJldHVyblxuXG4gICAgICBhcHBjYXN0Lm9mZiB3YWl0aW5nX3N0cmVhbVxuXG4gICAgICAjIFRPRE86IGZpeCB0aGlzIGVycm9yIGJlaW5nIHRocm93blxuICAgICAgIyBhcHBjYXN0Lm9uIHdoaWxlX3N0cmVhbWluZ1xuXG4gICAgICBsaXZlID0gdHJ1ZVxuXG4gICAgICBkb20uZmluZCgnYScpLmh0bWwgXCJHTyBPRkZMSU5FXCJcblxuXG4gIGRvbS5maW5kKCdhJykuY2xpY2sgLT5cblxuICAgICMgVE9ETzogbWFrZSBpdCBjbGV2ZXJcbiAgICB1c2VyX2lkID0gbG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoXCIvXCIpWzFdXG5cbiAgICBpZiBub3QgbGl2ZVxuICAgICAgY29uc29sZS5sb2cgXCJjbGlja2VkIGdvIGxpdmUhXCJcblxuICAgICAgaWYgbm90IGFwcGNhc3QuZ2V0ICdpbnB1dF9kZXZpY2UnXG5cbiAgICAgICAgYWxlcnQgJ3NlbGVjdCBpbnB1dCBkZXZpY2UgZmlyc3QnXG5cbiAgICAgICAgcmV0dXJuXG5cblxuICAgICAgIyB3YWl0aW5nIHN0cmVhbSBzdGF0dXNcbiAgICAgIGRvbS5maW5kKCdhJykuaHRtbCBcIi4uLlwiXG5cbiAgICAgIGFwcGNhc3Quc3RhcnRfc3RyZWFtIHVzZXJfaWQsIGFwcGNhc3QuZ2V0ICdpbnB1dF9kZXZpY2UnXG5cbiAgICAgIGFwcGNhc3Qub24gJ3N0cmVhbTpvbmxpbmUnLCB3YWl0aW5nX3N0cmVhbVxuXG5cbiAgICBpZiBsaXZlXG4gICAgICBjb25zb2xlLmxvZyBcImNsaWNrZWQgZ28gb2ZmbGluZSFcIlxuXG4gICAgICBpZiBub3QgYXBwY2FzdC5nZXQgJ3N0cmVhbTpvbmxpbmUnXG5cbiAgICAgICAgYWxlcnQgJy0gY2FudCBzdG9wIHN0cmVhbSBpZiBub3Qgc3RyZWFtaW5nJ1xuXG4gICAgICAgIHJldHVyblxuXG4gICAgICBkb20uZmluZCgnYScpLmh0bWwgXCIuLi5cIlxuXG4gICAgICBhcHBjYXN0LnN0b3Bfc3RyZWFtKClcblxuICAgICAgIyBUT0RPOiBtYWtlIGl0IGNsZXZlclxuICAgICAgTC5yb29tcy5zdG9wX3N0cmVhbSAkKCAnI3Jvb21faWQnICkudmFsKCksICggZXJyb3IsIGNhbGxiYWNrICkgLT5cblxuICAgICAgICBpZiBlcnJvclxuICAgICAgICAgIGRvbS5maW5kKCdhJykuaHRtbCBcImVycm9yXCJcblxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IgZXJyb3JcblxuICAgICAgICAgICMgTEFURVI6IENIRUNLIElGIFVTRVIgSVMgT0ZGTElORSBBTkQgV0FJVCBGT1IgQ09OTkVDVElPTj9cbiAgICAgICAgICByZXR1cm5cblxuICAgICAgICBsaXZlID0gZmFsc2VcblxuICAgICAgICBkb20uZmluZCgnYScpLmh0bWwgXCJHTyBMSVZFXCJcblxuICAgICMgY2FuY2VscyBjbGljayBhY3Rpb25cbiAgICByZXR1cm4gZmFsc2UiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxNQUFBOztBQUFBLENBQUEsRUFBVSxJQUFBLHNCQUFBOztBQUNWLENBREEsRUFDVSxJQUFWLG9CQUFVOztBQUVWLENBSEEsRUFHaUIsR0FBWCxDQUFOLEVBQW1CO0NBR2pCLEtBQUEsK0JBQUE7Q0FBQSxDQUFBLENBQU8sQ0FBUCxDQUFBO0NBQUEsQ0FHQSxDQUFrQixHQUFBLEdBQUUsTUFBcEI7QUFFUyxDQUFQLEdBQUEsRUFBQTtDQUVFLElBQUEsQ0FBQSxrQ0FBQTtDQUVBLFdBQUE7TUFKRjtDQU1BLEdBQUEsRUFBQTtDQUNRLElBQU4sQ0FBQSxpQ0FBQTtNQVRjO0NBSGxCLEVBR2tCO0NBSGxCLENBaUJBLENBQWlCLEdBQUEsR0FBRSxLQUFuQjtBQUVTLENBQVAsR0FBQSxFQUFBO0NBQW1CLFdBQUE7TUFBbkI7Q0FHQyxDQUEyQyxDQUF2QixFQUFkLENBQXFDLEdBQUUsQ0FBekIsQ0FBckIsQ0FBQTtDQUVFLEdBQUcsQ0FBSCxDQUFBO0NBQ0UsRUFBRyxDQUFILEdBQUEsQ0FBQTtDQUFBLElBRUEsRUFBTyxDQUFQO0NBR0EsYUFBQTtRQU5GO0NBQUEsRUFRQSxHQUFBLENBQU8sT0FBUDtDQVJBLEVBYU8sQ0FBUCxFQUFBO0NBRUksRUFBRCxDQUFILFFBQUEsQ0FBQTtDQWpCRixJQUE0QztDQXRCOUMsRUFpQmlCO0NBeUJiLEVBQUQsQ0FBSCxDQUFBLElBQUE7Q0FHRSxNQUFBLENBQUE7Q0FBQSxFQUFVLENBQVYsQ0FBVSxFQUFWLENBQWtCO0FBRVgsQ0FBUCxHQUFBO0NBQ0UsRUFBQSxHQUFBLENBQU8sV0FBUDtBQUVPLENBQVAsRUFBTyxDQUFKLEVBQUgsQ0FBYyxPQUFQO0NBRUwsSUFBQSxHQUFBLG1CQUFBO0NBRUEsYUFBQTtRQU5GO0NBQUEsRUFVRyxDQUFILENBQUEsQ0FBQTtDQVZBLENBWThCLENBQUEsR0FBOUIsQ0FBTyxLQUFQLEVBQThCO0NBWjlCLENBY0EsSUFBQSxDQUFPLE9BQVAsQ0FBQTtNQWpCRjtDQW9CQSxHQUFBO0NBQ0UsRUFBQSxHQUFBLENBQU8sY0FBUDtBQUVPLENBQVAsRUFBTyxDQUFKLEVBQUgsQ0FBYyxRQUFQO0NBRUwsSUFBQSxHQUFBLDZCQUFBO0NBRUEsYUFBQTtRQU5GO0NBQUEsRUFRRyxDQUFILENBQUEsQ0FBQTtDQVJBLEtBVUEsQ0FBTyxJQUFQO0NBVkEsQ0FhMkMsQ0FBdkIsRUFBYixDQUFQLEVBQTJDLENBQUUsQ0FBekIsQ0FBcEI7Q0FFRSxHQUFHLENBQUgsR0FBQTtDQUNFLEVBQUcsQ0FBSCxHQUFBLEdBQUE7Q0FBQSxJQUVBLEVBQU8sR0FBUDtDQUdBLGVBQUE7VUFORjtDQUFBLEVBUU8sQ0FBUCxDQVJBLEdBUUE7Q0FFSSxFQUFELENBQUgsS0FBQSxNQUFBO0NBWkYsTUFBMkM7TUFsQzdDO0NBaURBLElBQUEsTUFBTztDQXBEVCxFQUFvQjtDQTdDTCJ9fSx7Im9mZnNldCI6eyJsaW5lIjoxMzExNSwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2Rhc2hib2FyZC9pbnB1dF9kZXZpY2VzLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJhcHBjYXN0ICA9IHJlcXVpcmUgJ2FwcC9jb250cm9sbGVycy9hcHBjYXN0J1xuaGFwcGVucyA9IHJlcXVpcmUgJ2hhcHBlbnMnXG5cblNlbGVjdCA9IHJlcXVpcmUgJy4uL2NvbXBvbmVudHMvc2VsZWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIElucHV0RGV2aWNlcyBleHRlbmRzIFNlbGVjdFxuXG4gIGNvbnN0cnVjdG9yOiAoIGRvbSApIC0+XG5cbiAgICBzdXBlciBkb21cblxuICAgIGFwcGNhc3Qub24gJ2lucHV0X2RldmljZXMnLCAoIGRldmljZXMgKSAtPlxuXG4gICAgICAjIGNsZWFyIG9wdGlvbnNcbiAgICAgICMgVE9ETzoga2VlcCB0aGUgY2hvb3NlbiBvcHRpb24gc2VsZWN0ZWRcbiAgICAgICMgVE9ETzogbGV0IHRoZSB1c2VyIGtub3cgaWYgcHJldmlvdWx5IHNlbGVjdGVkIGlzbid0IGF2YWlsYWJsZSBhbnltb3JlXG4gICAgICBkb20uZmluZCggXCJzZWxlY3RcIiApLmh0bWwgXCIgXCJcbiAgICAgIFxuICAgICAgZm9yIGRldmljZSBpbiBkZXZpY2VzXG4gICAgICAgIGRvbS5maW5kKCBcInNlbGVjdFwiICkuYXBwZW5kIFwiPG9wdGlvbiB2YWx1ZT0nI3tkZXZpY2V9Jz4je2RldmljZX08L29wdGlvbj5cIlxuXG4gICAgQG9uICdjaGFuZ2VkJywgKCBkZXZpY2UgKSAtPlxuXG4gICAgICBhcHBjYXN0LnNldCAnaW5wdXRfZGV2aWNlJywgZG9tLmZpbmQoIFwic2VsZWN0XCIgKS52YWwoKSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGtDQUFBO0dBQUE7a1NBQUE7O0FBQUEsQ0FBQSxFQUFXLElBQVgsa0JBQVc7O0FBQ1gsQ0FEQSxFQUNVLElBQVYsRUFBVTs7QUFFVixDQUhBLEVBR1MsR0FBVCxDQUFTLGVBQUE7O0FBRVQsQ0FMQSxFQUt1QixHQUFqQixDQUFOO0NBRUU7O0NBQWEsQ0FBQSxDQUFBLG1CQUFFO0NBRWIsRUFBQSxDQUFBLDBDQUFNO0NBQU4sQ0FFQSxDQUE0QixDQUE1QixHQUFPLEVBQXVCLE1BQTlCO0NBS0UsU0FBQSxnQkFBQTtDQUFBLEVBQUcsQ0FBSCxFQUFBLEVBQUE7QUFFQSxDQUFBO1lBQUEsa0NBQUE7OEJBQUE7Q0FDRSxFQUFHLENBQUgsRUFBQSxFQUFBLEdBQUEsTUFBNkI7Q0FEL0I7dUJBUDBCO0NBQTVCLElBQTRCO0NBRjVCLENBWUEsQ0FBZSxDQUFmLEVBQWUsR0FBZjtDQUVVLENBQW9CLENBQTVCLENBQTRCLEdBQXJCLENBQXFCLEtBQTVCLENBQUE7Q0FGRixJQUFlO0NBZGpCLEVBQWE7O0NBQWI7O0NBRjBDIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjEzMTUxLCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvZGFzaGJvYXJkL21ldGVyLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IGNsYXNzIE1ldGVyXG5cbiAgY29uc3RydWN0b3I6IChAZG9tKSAtPiAgXG4gICAgQHByb2dyZXNzID0gQGRvbS5maW5kICcubWV0ZXIgc3BhbidcblxuICAgIEBpc19sZWZ0ID0gQGRvbS5hdHRyKCAnY2xhc3MnICkuaW5kZXhPZiggXCJsZWZ0XCIgKSBpc250IC0xXG5cbiAgICBhcHBjYXN0Lm9uICdzdHJlYW06dnUnLCAoIG1ldGVyICkgPT5cblxuICAgICAgaWYgQGlzX2xlZnRcbiAgICAgICAgQHNldF92b2x1bWUgbWV0ZXJbMF1cbiAgICAgIGVsc2VcbiAgICAgICAgQHNldF92b2x1bWUgbWV0ZXJbMV1cblxuICBzZXRfdm9sdW1lOiAoIHBlcmMgKSAtPlxuXG4gICAgQHByb2dyZXNzLmNzcyAnd2lkdGgnLCBcIiN7cGVyYyAqIDEwMH0lXCJcblxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsQ0FBQTs7QUFBQSxDQUFBLEVBQXVCLEdBQWpCLENBQU47Q0FFZSxDQUFBLENBQUEsWUFBRTtDQUNiLE9BQUEsSUFBQTtDQUFBLEVBRGEsQ0FBRDtDQUNaLEVBQVksQ0FBWixJQUFBLEtBQVk7QUFFNEMsQ0FGeEQsRUFFVyxDQUFYLENBQXVELENBQTVDLENBQVg7Q0FGQSxDQUlBLENBQXdCLENBQXhCLENBQXdCLEVBQWpCLEVBQW1CLEVBQTFCO0NBRUUsR0FBRyxDQUFDLENBQUosQ0FBQTtDQUNHLElBQUEsS0FBRCxLQUFBO01BREYsRUFBQTtDQUdHLElBQUEsS0FBRCxLQUFBO1FBTG9CO0NBQXhCLElBQXdCO0NBTDFCLEVBQWE7O0NBQWIsRUFZWSxDQUFBLEtBQUUsQ0FBZDtDQUVHLENBQXNCLENBQXZCLENBQUMsR0FBRCxDQUFTLEdBQVQ7Q0FkRixFQVlZOztDQVpaOztDQUZGIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjEzMTc4LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvZGFzaGJvYXJkL3JlY29yZC5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiTCAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2FwaS9sb29wY2FzdC9sb29wY2FzdCdcbmFwcGNhc3QgPSByZXF1aXJlICcuLi8uLi9jb250cm9sbGVycy9hcHBjYXN0J1xuXG5cbm1vZHVsZS5leHBvcnRzID0gKCBkb20gKSAtPlxuXG4gICMgVE9ETzogZmV0Y2ggaW5mb3JtYXRpb24gZnJvbSBiYWNrZW5kXG4gIHJlY29yZGluZyA9IGZhbHNlXG5cbiAgc3RhcnRfcmVjb3JkaW5nID0gKCBjYWxsYmFjayApIC0+XG5cbiAgICBMLnJvb21zLnN0YXJ0X3JlY29yZGluZyAkKCAnI3Jvb21faWQnICkudmFsKCksICggZXJyb3IsIHJlc3BvbnNlICkgLT5cblxuICAgICAgaWYgZXJyb3JcblxuICAgICAgICBjb25zb2xlLmVycm9yIFwiZXJyb3Igd2hlbiByZWNvcmRpbmcgcm9vbVwiLCBlcnJvclxuXG4gICAgICAgIGRvbS5maW5kKCdhJykuaHRtbCBcIkVSUk9SXCJcblxuICAgICAgICByZXR1cm5cblxuICAgICAgcmVjb3JkaW5nID0gdHJ1ZVxuICAgICAgZG9tLmZpbmQoJ2EnKS5odG1sIFwiU1RPUCBSRUNcIlxuICAgIFxuICBkb20uZmluZCgnYScpLmNsaWNrIC0+XG5cbiAgICBpZiBub3QgcmVjb3JkaW5nXG4gICAgICBjb25zb2xlLmxvZyBcImNsaWNrZWQgZ28gcmVjb3JkaW5nIVwiXG5cbiAgICAgIGlmIG5vdCBhcHBjYXN0LmdldCAnaW5wdXRfZGV2aWNlJ1xuXG4gICAgICAgIGFsZXJ0ICdzZWxlY3QgaW5wdXQgZGV2aWNlIGZpcnN0J1xuXG4gICAgICAgIHJldHVyblxuXG4gICAgICBkb20uZmluZCgnYScpLmh0bWwgXCIuLi5cIlxuXG4gICAgICBpZiBhcHBjYXN0LmdldCAnc3RyZWFtOm9ubGluZSdcbiAgICAgICAgIyBpZiBzdHJlYW1pbmcsIHN0YXJ0IHJlY29yZGluZyFcblxuICAgICAgICBzdGFydF9yZWNvcmRpbmcoKVxuXG4gICAgICBlbHNlXG4gICAgICAjIFRPRE86IG1ha2UgaXQgY2xldmVyXG4gICAgICAgIHVzZXJfaWQgPSBsb2NhdGlvbi5wYXRobmFtZS5zcGxpdChcIi9cIilbMV1cbiAgICAgICAgXG4gICAgICAgICMgc3RhcnQgc3RyZWFtaW5nIHRoZW4gc3RhcnQgcmVjb3JkaW5nXG4gICAgICAgIGFwcGNhc3Quc3RhcnRfc3RyZWFtIHVzZXJfaWQsIGFwcGNhc3QuZ2V0ICdpbnB1dF9kZXZpY2UnXG5cbiAgICAgICAgYXBwY2FzdC5vbiAnc3RyZWFtOm9ubGluZScsIHN0YXJ0X3JlY29yZGluZ1xuXG4gICAgaWYgcmVjb3JkaW5nXG4gICAgICBjb25zb2xlLmxvZyBcImNsaWNrZWQgc3RvcCByZWNvcmRpbmchXCJcblxuICAgICAgZG9tLmZpbmQoJ2EnKS5odG1sIFwiLi4uXCJcblxuICAgICAgdXNlcl9pZCA9IGxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KFwiL1wiKVsxXVxuXG4gICAgICBMLnJvb21zLnN0b3BfcmVjb3JkaW5nICQoICcjcm9vbV9pZCcgKS52YWwoKSwgKCBlcnJvciwgY2FsbGJhY2sgKSAtPlxuXG4gICAgICAgIGlmIGVycm9yXG5cbiAgICAgICAgICBjb25zb2xlLmVycm9yIFwiZXJyb3Igd2hpbGUgc3RvcHBpbmcgcmVjb3JkaW5nXCJcblxuICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIHJlY29yZGluZyA9IGZhbHNlXG5cbiAgICAgICAgZG9tLmZpbmQoJ2EnKS5odG1sIFwiUkVDT1JERURcIlxuXG4gICAgICAgIGNoYW5uZWwgPSBwdXNoZXIuc3Vic2NyaWJlIFwidGFwZS4je3VzZXJfaWR9XCJcblxuICAgICAgICBjaGFubmVsLmJpbmQgXCJ1cGxvYWQ6ZmluaXNoZWRcIiwgKCBmaWxlICkgLT5cbiAgICAgICAgICBjb25zb2xlLmxvZyBcImZpbmlzaGVkIHVwbG9hZGluZyBmaWxlIC0+XCIsIGZpbGVcbiAgICAgICAgICBcbiAgICAgICAgICBhbGVydCBcIlVwbG9hZGVkIGZpbGUhICN7ZmlsZX1cIlxuXG4gICAgICAgIGNoYW5uZWwuYmluZCBcInVwbG9hZDplcnJvclwiLCAoIGVycm9yICkgLT5cbiAgICAgICAgICBjb25zb2xlLmVycm9yIFwiZmFpbGVkIHVwbG9hZGluZyAtPlwiLCBlcnJvclxuICAgICAgICAgIFxuICAgICAgICAgIGFsZXJ0IFwiRXJyb3IgdXBsb2FkaW5nIGZpbGUgOihcIlxuXG4gICAgICAgIGNoYW5uZWwuYmluZCBcInVwbG9hZDpmYWlsZWRcIiwgKCBlcnJvciApIC0+XG4gICAgICAgICAgY29uc29sZS5sb2cgXCJmYWlsZWQgdXBsb2FkaW5nIC0+XCIsIGVycm9yXG4gICAgICAgICAgXG4gICAgICAgICAgYWxlcnQgXCJGYWlsZWQgdXBsb2FkaW5nIGZpbGUgOihcIlxuXG4gICAgIyBjYW5jZWxzIGNsaWNrIGFjdGlvblxuICAgIHJldHVybiBmYWxzZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLE1BQUE7O0FBQUEsQ0FBQSxFQUFVLElBQUEsc0JBQUE7O0FBQ1YsQ0FEQSxFQUNVLElBQVYsb0JBQVU7O0FBR1YsQ0FKQSxFQUlpQixHQUFYLENBQU4sRUFBbUI7Q0FHakIsS0FBQSxvQkFBQTtDQUFBLENBQUEsQ0FBWSxFQUFaLElBQUE7Q0FBQSxDQUVBLENBQWtCLEtBQUEsQ0FBRSxNQUFwQjtDQUVHLENBQThDLENBQXZCLEVBQWpCLEdBQXdDLENBQUUsQ0FBekIsQ0FBeEIsSUFBQTtDQUVFLEdBQUcsQ0FBSCxDQUFBO0NBRUUsQ0FBMkMsR0FBM0MsRUFBTyxDQUFQLG1CQUFBO0NBQUEsRUFFRyxDQUFILEdBQUEsQ0FBQTtDQUVBLGFBQUE7UUFORjtDQUFBLEVBUVksQ0FSWixFQVFBLEdBQUE7Q0FDSSxFQUFELENBQUgsTUFBQSxHQUFBO0NBWEYsSUFBK0M7Q0FKakQsRUFFa0I7Q0FlZCxFQUFELENBQUgsQ0FBQSxJQUFBO0NBRUUsTUFBQSxDQUFBO0FBQU8sQ0FBUCxHQUFBLEtBQUE7Q0FDRSxFQUFBLEdBQUEsQ0FBTyxnQkFBUDtBQUVPLENBQVAsRUFBTyxDQUFKLEVBQUgsQ0FBYyxPQUFQO0NBRUwsSUFBQSxHQUFBLG1CQUFBO0NBRUEsYUFBQTtRQU5GO0NBQUEsRUFRRyxDQUFILENBQUEsQ0FBQTtDQUVBLEVBQUcsQ0FBQSxFQUFILENBQVUsUUFBUDtDQUdELE9BQUEsT0FBQTtNQUhGLEVBQUE7Q0FPRSxFQUFVLEVBQUEsRUFBVixDQUFBO0NBQUEsQ0FHOEIsQ0FBQSxJQUF2QixDQUFQLElBQUEsRUFBOEI7Q0FIOUIsQ0FLQSxLQUFPLENBQVAsT0FBQTtRQXZCSjtNQUFBO0NBeUJBLEdBQUEsS0FBQTtDQUNFLEVBQUEsR0FBQSxDQUFPLGtCQUFQO0NBQUEsRUFFRyxDQUFILENBQUEsQ0FBQTtDQUZBLEVBSVUsRUFBQSxDQUFWLENBQUEsQ0FBa0I7Q0FKbEIsQ0FNOEMsQ0FBdkIsRUFBaEIsQ0FBUCxFQUE4QyxDQUFFLENBQXpCLElBQXZCO0NBRUUsTUFBQSxLQUFBO0NBQUEsR0FBRyxDQUFILEdBQUE7Q0FFRSxJQUFBLEVBQU8sR0FBUCxzQkFBQTtDQUVBLGVBQUE7VUFKRjtDQUFBLEVBTVksRUFOWixHQU1BLENBQUE7Q0FOQSxFQVFHLENBQUgsSUFBQSxFQUFBO0NBUkEsRUFVVSxHQUFNLENBQWhCLENBQUEsQ0FBVTtDQVZWLENBWWdDLENBQUEsQ0FBaEMsR0FBTyxDQUFQLENBQWtDLFFBQWxDO0NBQ0UsQ0FBMEMsQ0FBMUMsQ0FBQSxHQUFPLEdBQVAsa0JBQUE7Q0FFTyxFQUFnQixDQUF2QixDQUFBLFlBQUE7Q0FIRixRQUFnQztDQVpoQyxDQWlCNkIsQ0FBQSxDQUE3QixDQUE2QixFQUF0QixDQUFQLENBQStCLEtBQS9CO0NBQ0UsQ0FBcUMsR0FBckMsRUFBTyxHQUFQLFdBQUE7Q0FFTSxJQUFOLFlBQUEsUUFBQTtDQUhGLFFBQTZCO0NBS3JCLENBQXNCLENBQUEsQ0FBOUIsQ0FBOEIsRUFBdkIsRUFBeUIsTUFBaEM7Q0FDRSxDQUFtQyxDQUFuQyxFQUFBLEVBQU8sR0FBUCxXQUFBO0NBRU0sSUFBTixZQUFBLFNBQUE7Q0FIRixRQUE4QjtDQXhCaEMsTUFBOEM7TUFoQ2hEO0NBOERBLElBQUEsTUFBTztDQWhFVCxFQUFvQjtDQXBCTCJ9fSx7Im9mZnNldCI6eyJsaW5lIjoxMzI0OCwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2V4cGxvcmUuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIklzb3RvcGUgPSByZXF1aXJlICdpc290b3BlLWxheW91dCdcbm1vZHVsZS5leHBvcnRzID0gKGRvbSkgLT5cblxuXHRjb250YWluZXJfaXNvdG9wZSA9IGRvbS5maW5kKCAnLnJvb21zX2dyaWQnIClbIDAgXVxuXG5cdGlzb3RvcGUgPSBuZXcgSXNvdG9wZSBjb250YWluZXJfaXNvdG9wZSxcblx0XHRpdGVtU2VsZWN0b3I6ICcuaXRlbScsXG5cdFx0Z3V0dGVyOiAzMFxuXHRcdGxheW91dE1vZGU6ICdtYXNvbnJ5J1xuXHRcdG1hc29ucnk6XG5cdFx0XHRjb2x1bW5XaWR0aDogMjEwLFxuXHRcdFx0Z3V0dGVyOiAzMFxuXHRcblx0ZmlsdGVycyA9IGRvbS5maW5kICcuZ2VucmVzX2xpc3QgYSdcblxuXHRkb20uZmluZCggJ1tkYXRhLWdlbnJlLWlkXScgKS5vbiAnY2xpY2snLCAoZSkgLT5cblx0XHQjIEZpbHRlciBieSBnZW5yZVxuXHRcdGdlbnJlX2lkID0gJChlLmN1cnJlbnRUYXJnZXQpLmRhdGEgJ2dlbnJlLWlkJ1xuXHRcdGxvZyBcImNsaWNrXCIsIGdlbnJlX2lkXG5cdFx0XG5cdFx0ZmlsdGVycy5yZW1vdmVDbGFzcyAnc2VsZWN0ZWQnXG5cdFx0ZG9tLmZpbmQoICcuZ2VucmVzX2xpc3QgYVtkYXRhLWdlbnJlLWlkPVwiJytnZW5yZV9pZCsnXCJdJyApLmFkZENsYXNzICdzZWxlY3RlZCdcblxuXHRcdGlzb3RvcGUuYXJyYW5nZSBmaWx0ZXI6IFwiLml0ZW0tI3tnZW5yZV9pZH1cIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLEdBQUE7O0FBQUEsQ0FBQSxFQUFVLElBQVYsU0FBVTs7QUFDVixDQURBLEVBQ2lCLEdBQVgsQ0FBTixFQUFrQjtDQUVqQixLQUFBLDZCQUFBO0NBQUEsQ0FBQSxDQUFvQixDQUFBLFNBQUEsSUFBcEI7Q0FBQSxDQUVBLENBQWMsQ0FBQSxHQUFkLFVBQWM7Q0FDYixDQUFjLEVBQWQsR0FBQSxLQUFBO0NBQUEsQ0FDUSxFQUFSLEVBQUE7Q0FEQSxDQUVZLEVBQVosS0FGQSxDQUVBO0NBRkEsQ0FJQyxFQURELEdBQUE7Q0FDQyxDQUFhLENBQWIsR0FBQSxLQUFBO0NBQUEsQ0FDUSxJQUFSO01BTEQ7Q0FIRCxHQUVjO0NBRmQsQ0FVQSxDQUFVLENBQUEsR0FBVixTQUFVO0NBRU4sQ0FBSixDQUFHLENBQUgsR0FBQSxFQUFBLFFBQUE7Q0FFQyxPQUFBO0NBQUEsRUFBVyxDQUFYLElBQUEsRUFBVyxHQUFBO0NBQVgsQ0FDYSxDQUFiLENBQUEsR0FBQSxDQUFBO0NBREEsR0FHQSxHQUFPLEdBQVAsQ0FBQTtDQUhBLEVBSUcsQ0FBSCxJQUFVLEVBQVYsc0JBQVU7Q0FFRixNQUFELElBQVA7Q0FBZ0IsQ0FBUyxDQUFPLEdBQWhCLEVBQVM7Q0FSZ0IsS0FRekM7Q0FSRCxFQUEwQztDQWQxQiJ9fSx7Im9mZnNldCI6eyJsaW5lIjoxMzI3OSwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2hlYWRlci5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsibmF2aWdhdGlvbiAgICAgID0gcmVxdWlyZSAnYXBwL2NvbnRyb2xsZXJzL25hdmlnYXRpb24nXG51c2VyX2NvbnRyb2xsZXIgPSByZXF1aXJlICdhcHAvY29udHJvbGxlcnMvdXNlcidcbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgSGVhZGVyXG5cblx0Y3VycmVudF9wYWdlOiBcIlwiXG5cdHVzZXJfbG9nZ2VkOiBmYWxzZVxuXG5cdGNvbnN0cnVjdG9yOiAoIEBkb20gKSAtPlxuXHRcdHVzZXJfY29udHJvbGxlci5vbiAndXNlcjpsb2dnZWQnLCBAb25fdXNlcl9sb2dnZWRcblx0XHR1c2VyX2NvbnRyb2xsZXIub24gJ3VzZXI6dW5sb2dnZWQnLCBAb25fdXNlcl91bmxvZ2dlZFxuXHRcdHVzZXJfY29udHJvbGxlci5vbiAndXNlcjp1cGRhdGVkJywgQG9uX3VzZXJfdXBkYXRlZFxuXG5cdFx0bmF2aWdhdGlvbi5vbiAnYWZ0ZXJfcmVuZGVyJywgQGNoZWNrX21lbnVcblxuXHRjaGVja19tZW51OiA9PlxuXHRcdFxuXHRcdG9iaiA9ICQoICdbZGF0YS1tZW51XScgKVxuXHRcdGlmIG9iai5sZW5ndGggPiAwXG5cdFx0XHRwYWdlID0gb2JqLmRhdGEgJ21lbnUnXG5cdFx0XHQjIGxvZyBcIltIZWFkZXJdIGNoZWNrX21lbnVcIiwgcGFnZVxuXHRcdFx0XG5cdFx0XHRpZiBAY3VycmVudF9wYWdlLmxlbmd0aCA+IDBcblx0XHRcdFx0QGRvbS5maW5kKCBcIi4je0BjdXJyZW50X3BhZ2V9X2l0ZW1cIiApLnJlbW92ZUNsYXNzIFwic2VsZWN0ZWRcIlxuXHRcdFx0XHRhcHAuYm9keS5yZW1vdmVDbGFzcyBcIiN7QGN1cnJlbnRfcGFnZX1fcGFnZVwiXG5cblx0XHRcdEBkb20uZmluZCggXCIuI3twYWdlfV9pdGVtXCIgKS5hZGRDbGFzcyBcInNlbGVjdGVkXCJcblx0XHRcdGFwcC5ib2R5LmFkZENsYXNzIFwiI3twYWdlfV9wYWdlXCJcblxuXHRcdFx0QGN1cnJlbnRfcGFnZSA9IHBhZ2VcblxuXG5cdFx0b2JqID0gJCggJ1tkYXRhLXN1Ym1lbnVdJyApXG5cdFx0aWYgb2JqLmxlbmd0aCA+IDBcblx0XHRcdHN1Ym1lbnUgPSBvYmouZGF0YSAnc3VibWVudSdcblx0XHRcdCQoIFwiLiN7c3VibWVudX1cIiApLmFkZENsYXNzICdzZWxlY3RlZCdcblxuXG5cdFx0b2JqID0gJCggJ1tkYXRhLW1lbnUtZml4ZWRdJyApXG5cdFx0aWYgb2JqLmxlbmd0aCA+IDBcblx0XHRcdGlmIG9iai5kYXRhKCAnbWVudS1maXhlZCcpIGlzIGZhbHNlXG5cdFx0XHRcdGFwcC5ib2R5LmFkZENsYXNzICd1bmZpeGVkJ1xuXHRcdGVsc2Vcblx0XHRcdGFwcC5ib2R5LnJlbW92ZUNsYXNzICd1bmZpeGVkJ1xuXG5cblxuXHRvbl91c2VyX2xvZ2dlZDogKCBkYXRhICkgPT5cblx0XHRyZXR1cm4gaWYgQHVzZXJfbG9nZ2VkXG5cdFx0QHVzZXJfbG9nZ2VkID0gdHJ1ZVxuXHRcdFxuXHRcdHdyYXBwZXIgPSBAZG9tLmZpbmQoICcudXNlcl9sb2dnZWQnIClcblx0XHR0bXBsICAgID0gcmVxdWlyZSAndGVtcGxhdGVzL3NoYXJlZC9oZWFkZXJfdXNlcl9sb2dnZWQnXG5cdFx0aHRtbCAgICA9IHRtcGwgZGF0YVxuXG5cdFx0d3JhcHBlci5lbXB0eSgpLmFwcGVuZCBodG1sXG5cblx0XHR2aWV3LmJpbmQgd3JhcHBlclxuXHRcdG5hdmlnYXRpb24uYmluZCB3cmFwcGVyXG5cblx0b25fdXNlcl91cGRhdGVkOiAoIGRhdGEgKSA9PlxuXHRcdGxvZyBcIltIZWFkZXJdIHVkcGF0aW5nIGltYWdlXCIsIGRhdGEuaW1hZ2VzLnRvcF9iYXJcblx0XHRAZG9tLmZpbmQoICcudG9wX2Jhcl9pY29uJyApLmF0dHIgJ3NyYycsIGRhdGEuaW1hZ2VzLnRvcF9iYXJcblxuXG5cblxuXHRvbl91c2VyX3VubG9nZ2VkOiAoIGRhdGEgKSA9PlxuXHRcdHJldHVybiBpZiBub3QgQHVzZXJfbG9nZ2VkXG5cdFx0QHVzZXJfbG9nZ2VkID0gZmFsc2UiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSwrQkFBQTtHQUFBLCtFQUFBOztBQUFBLENBQUEsRUFBa0IsSUFBQSxHQUFsQixrQkFBa0I7O0FBQ2xCLENBREEsRUFDa0IsSUFBQSxRQUFsQixPQUFrQjs7QUFDbEIsQ0FGQSxFQUV1QixHQUFqQixDQUFOO0NBRUMsQ0FBQSxDQUFjLFNBQWQ7O0NBQUEsRUFDYSxFQURiLE1BQ0E7O0NBRWEsQ0FBQSxDQUFBLGFBQUc7Q0FDZixFQURlLENBQUQ7Q0FDZCwwREFBQTtDQUFBLHdEQUFBO0NBQUEsc0RBQUE7Q0FBQSw4Q0FBQTtDQUFBLENBQUEsRUFBQSxTQUFBLENBQUEsQ0FBZTtDQUFmLENBQ0EsRUFBQSxXQUFlLENBQWY7Q0FEQSxDQUVBLEVBQUEsVUFBQSxDQUFlO0NBRmYsQ0FJQSxFQUFBLE1BQVUsSUFBVjtDQVJELEVBR2E7O0NBSGIsRUFVWSxNQUFBLENBQVo7Q0FFQyxPQUFBLFVBQUE7Q0FBQSxFQUFBLENBQUEsU0FBTTtDQUNOLEVBQU0sQ0FBTixFQUFHO0NBQ0YsRUFBTyxDQUFQLEVBQUE7Q0FHQSxFQUEwQixDQUF2QixFQUFILE1BQWdCO0NBQ2YsRUFBSSxDQUFILEdBQUQsQ0FBQSxFQUFBLENBQUEsQ0FBWTtDQUFaLENBQ3FCLENBQWxCLENBQUssR0FBUixDQUFBLEdBQUEsQ0FBcUI7UUFMdEI7Q0FBQSxFQU9JLENBQUgsRUFBRCxDQUFBLENBQUEsRUFBQTtDQVBBLENBUWtCLENBQWYsQ0FBSyxFQUFSLENBQUEsQ0FBQTtDQVJBLEVBVWdCLENBQWYsRUFBRCxNQUFBO01BWkQ7Q0FBQSxFQWVBLENBQUEsWUFBTTtDQUNOLEVBQU0sQ0FBTixFQUFHO0NBQ0YsRUFBVSxDQUFBLEVBQVYsQ0FBQSxFQUFVO0NBQVYsRUFDSSxHQUFKLENBQUEsQ0FBQSxFQUFBO01BbEJEO0NBQUEsRUFxQkEsQ0FBQSxlQUFNO0NBQ04sRUFBTSxDQUFOLEVBQUc7Q0FDRixFQUFNLENBQUgsQ0FBMkIsQ0FBOUIsTUFBRztDQUNFLEVBQUQsQ0FBSyxJQUFSLENBQUEsTUFBQTtRQUZGO01BQUE7Q0FJSyxFQUFELENBQUssS0FBUixFQUFBLEVBQUE7TUE1QlU7Q0FWWixFQVVZOztDQVZaLEVBMENnQixDQUFBLEtBQUUsS0FBbEI7Q0FDQyxPQUFBLFdBQUE7Q0FBQSxHQUFBLE9BQUE7Q0FBQSxXQUFBO01BQUE7Q0FBQSxFQUNlLENBQWYsT0FBQTtDQURBLEVBR1UsQ0FBVixHQUFBLE9BQVU7Q0FIVixFQUlVLENBQVYsR0FBVSw4QkFBQTtDQUpWLEVBS1UsQ0FBVjtDQUxBLEdBT0EsQ0FBQSxDQUFBLENBQU87Q0FQUCxHQVNBLEdBQUE7Q0FDVyxHQUFYLEdBQUEsR0FBVSxDQUFWO0NBckRELEVBMENnQjs7Q0ExQ2hCLEVBdURpQixDQUFBLEtBQUUsTUFBbkI7Q0FDQyxDQUErQixDQUEvQixDQUFBLEVBQTBDLENBQTFDLGtCQUFBO0NBQ0MsQ0FBd0MsQ0FBckMsQ0FBSCxDQUFELENBQW9ELENBQXBELElBQUEsSUFBQTtDQXpERCxFQXVEaUI7O0NBdkRqQixFQThEa0IsQ0FBQSxLQUFFLE9BQXBCO0FBQ2UsQ0FBZCxHQUFBLE9BQUE7Q0FBQSxXQUFBO01BQUE7Q0FDQyxFQUFjLENBQWQsT0FBRDtDQWhFRCxFQThEa0I7O0NBOURsQjs7Q0FKRCJ9fSx7Im9mZnNldCI6eyJsaW5lIjoxMzM2MywiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2hvbWVwYWdlLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJwcmVsb2FkID0gcmVxdWlyZSAnYXBwL3V0aWxzL3ByZWxvYWQnXG5oYXBwZW5zID0gcmVxdWlyZSAnaGFwcGVucydcbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgSG9tZXBhZ2Vcblx0Y29uc3RydWN0b3I6IChAZG9tKSAtPlxuXG5cdFx0aGFwcGVucyBAXG5cblx0XHRAZG9tLmFkZENsYXNzICdyZXF1ZXN0X3ByZWxvYWRpbmcnXG5cblx0XHRlbGVtZW50cyA9IFtdXG5cdFx0aW1hZ2VzID0gW11cblxuXHRcdEBkb20uZmluZCggJy5wYXJhbGxheC1jb250YWluZXInICkuZWFjaCAtPlxuXHRcdFx0ZWxlbWVudHMucHVzaCAkKCBAIClcblx0XHRcdGltYWdlcy5wdXNoICQoIEAgKS5kYXRhKCAnaW1hZ2UtcGFyYWxsYXgnIClcblxuXHRcdHByZWxvYWQgaW1hZ2VzLCAoIGltYWdlc19sb2FkZWQgKSA9PlxuXG5cdFx0XHRmb3IgZWwsIGkgaW4gZWxlbWVudHNcblx0XHRcdFx0ZWwucGFyYWxsYXhcblx0XHRcdFx0XHRpbWFnZVNyYyAgICAgOiBpbWFnZXNfbG9hZGVkWyBpIF0uc3JjXG5cdFx0XHRcdFx0YmxlZWQgICAgICAgIDogMTBcblx0XHRcdFx0XHRwYXJhbGxheCAgICAgOiAnc2Nyb2xsJ1xuXHRcdFx0XHRcdG5hdHVyYWxXaWR0aCA6IGltYWdlc19sb2FkZWRbIGkgXS53aWR0aFxuXHRcdFx0XHRcdG5hdHVyYWxoZWlnaHQ6IGltYWdlc19sb2FkZWRbIGkgXS5oZWlnaHRcblxuXHRcdFx0XG5cdFx0XHRAcmVhZHkoKVxuXG5cdHJlYWR5OiAtPlxuXHRcdGRlbGF5IDEwMCwgLT4gYXBwLndpbmRvdy5vYmoudHJpZ2dlciAncmVzaXplJ1xuXHRcdGRlbGF5IDIwMCwgPT4gQGVtaXQgJ3JlYWR5J1xuXG5cblx0ZGVzdHJveTogKCApIC0+XG5cdFx0cCA9ICQoICcucGFyYWxsYXgtbWlycm9yJyApXG5cdFx0cC5hZGRDbGFzcyggJ2hpZGUnIClcblx0XHRkZWxheSAzMDAsIC0+IHAucmVtb3ZlKCkiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxzQkFBQTs7QUFBQSxDQUFBLEVBQVUsSUFBVixZQUFVOztBQUNWLENBREEsRUFDVSxJQUFWLEVBQVU7O0FBQ1YsQ0FGQSxFQUV1QixHQUFqQixDQUFOO0NBQ2MsQ0FBQSxDQUFBLGVBQUU7Q0FFZCxPQUFBLFFBQUE7T0FBQSxLQUFBO0NBQUEsRUFGYyxDQUFEO0NBRWIsR0FBQSxHQUFBO0NBQUEsRUFFSSxDQUFKLElBQUEsWUFBQTtDQUZBLENBQUEsQ0FJVyxDQUFYLElBQUE7Q0FKQSxDQUFBLENBS1MsQ0FBVCxFQUFBO0NBTEEsRUFPSSxDQUFKLEtBQXdDLFlBQXhDO0NBQ0MsR0FBQSxFQUFBLEVBQVE7Q0FDRCxHQUFQLEVBQU0sT0FBTixHQUFZO0NBRmIsSUFBd0M7Q0FQeEMsQ0FXZ0IsQ0FBQSxDQUFoQixFQUFBLENBQUEsRUFBa0IsSUFBRjtDQUVmLFNBQUEsS0FBQTtBQUFBLENBQUEsVUFBQSw0Q0FBQTswQkFBQTtDQUNDLENBQUUsTUFBRjtDQUNDLENBQWUsQ0FBZixLQUFBLEVBQUEsR0FBOEI7Q0FBOUIsQ0FDZSxHQUFmLEtBQUE7Q0FEQSxDQUVlLE1BQWYsRUFBQTtDQUZBLENBR2UsR0FIZixLQUdBLEVBQUEsQ0FBOEI7Q0FIOUIsQ0FJZSxJQUpmLElBSUEsR0FBQTtDQUxELFNBQUE7Q0FERCxNQUFBO0NBU0MsSUFBQSxRQUFEO0NBWEQsSUFBZ0I7Q0FiakIsRUFBYTs7Q0FBYixFQTBCTyxFQUFQLElBQU87Q0FDTixPQUFBLElBQUE7Q0FBQSxDQUFXLENBQVgsQ0FBQSxDQUFBLElBQVc7Q0FBTyxFQUFELEdBQU8sQ0FBVixDQUFBLEtBQUE7Q0FBZCxJQUFXO0NBQ0wsQ0FBSyxDQUFYLEVBQUEsSUFBVyxFQUFYO0NBQWUsR0FBRCxDQUFDLEVBQUQsTUFBQTtDQUFkLElBQVc7Q0E1QlosRUEwQk87O0NBMUJQLEVBK0JTLElBQVQsRUFBUztDQUNSLE9BQUE7Q0FBQSxFQUFJLENBQUosY0FBSTtDQUFKLEdBQ0EsRUFBQSxFQUFBO0NBQ00sQ0FBSyxDQUFYLEVBQUEsSUFBVyxFQUFYO0NBQWUsS0FBRCxPQUFBO0NBQWQsSUFBVztDQWxDWixFQStCUzs7Q0EvQlQ7O0NBSEQifX0seyJvZmZzZXQiOnsibGluZSI6MTM0MjMsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9sb2FkaW5nLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJuYXZpZ2F0aW9uICAgICAgICBcdD0gcmVxdWlyZSAnYXBwL2NvbnRyb2xsZXJzL25hdmlnYXRpb24nXG5PcGFjaXR5IFx0XHRcdD0gcmVxdWlyZSAnYXBwL3V0aWxzL29wYWNpdHknXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgTG9hZGluZ1xuXHRmaXJzdF90aW1lOiBvblxuXHRjb25zdHJ1Y3RvcjogKCBAZG9tICkgLT5cblx0XHQjIG5hdmlnYXRpb24ub24gJ2JlZm9yZV9kZXN0cm95JywgPT5cblx0XHRhcHAub24gJ2xvYWRpbmc6c2hvdycsID0+XG5cdFx0XHRhcHAuYm9keS5hZGRDbGFzcyggJ2xvYWRpbmcnICkucmVtb3ZlQ2xhc3MoICdsb2FkZWQnIClcblx0XHRcdE9wYWNpdHkuc2hvdyBAZG9tLCAxMDBcblx0XHRcdCMgY29uc29sZS5lcnJvciBcIltMb2FkaW5nXSBzaG93XCJcblxuXHRcdCMgbmF2aWdhdGlvbi5vbiAnYWZ0ZXJfcmVuZGVyJywgPT4gXG5cdFx0YXBwLm9uICdsb2FkaW5nOmhpZGUnLCA9PlxuXHRcdFx0aWYgQGZpcnN0X3RpbWVcblx0XHRcdFx0YXBwLmJvZHkuYWRkQ2xhc3MgJ2ZpcnN0X2xvYWRlZCdcblx0XHRcdFx0QGZpcnN0X3RpbWUgPSBvZmZcblx0XHRcdGFwcC5ib2R5LnJlbW92ZUNsYXNzKCAnbG9hZGluZycgKS5hZGRDbGFzcyggJ2xvYWRlZCcgKVxuXHRcdFx0T3BhY2l0eS5oaWRlIEBkb21cdFxuXG5cdFx0XHQjIGNvbnNvbGUuZXJyb3IgXCJbTG9hZGluZ10gaGlkZVwiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsd0JBQUE7O0FBQUEsQ0FBQSxFQUFxQixJQUFBLEdBQXJCLGtCQUFxQjs7QUFDckIsQ0FEQSxFQUNhLElBQWIsWUFBYTs7QUFFYixDQUhBLEVBR3VCLEdBQWpCLENBQU47Q0FDQyxFQUFZLENBQVosTUFBQTs7Q0FDYSxDQUFBLENBQUEsY0FBRztDQUVmLE9BQUEsSUFBQTtDQUFBLEVBRmUsQ0FBRDtDQUVkLENBQUEsQ0FBRyxDQUFILEtBQXVCLEtBQXZCO0NBQ0MsRUFBRyxDQUFLLEVBQVIsRUFBQSxDQUFBLEVBQUE7Q0FDUSxDQUFXLENBQW5CLENBQUEsQ0FBYyxFQUFQLE1BQVA7Q0FGRCxJQUF1QjtDQUF2QixDQU1BLENBQUcsQ0FBSCxLQUF1QixLQUF2QjtDQUNDLEdBQUcsQ0FBQyxDQUFKLElBQUE7Q0FDQyxFQUFHLENBQUssSUFBUixNQUFBO0NBQUEsRUFDYyxFQUFiLEdBQUQsRUFBQTtRQUZEO0NBQUEsRUFHRyxDQUFLLEVBQVIsRUFBQSxDQUFBLEVBQUE7Q0FDUSxFQUFSLENBQUEsQ0FBYyxFQUFQLE1BQVA7Q0FMRCxJQUF1QjtDQVR4QixFQUNhOztDQURiOztDQUpEIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjEzNDU1LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvbG9nZ2VkX3ZpZXcuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbInVzZXJfY29udHJvbGxlciA9IHJlcXVpcmUgJ2FwcC9jb250cm9sbGVycy91c2VyJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIExvZ2dlZFZpZXdcblxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICB2aWV3Lm9uY2UgJ2JpbmRlZCcsIEBvbl92aWV3c19iaW5kZWRcblxuICBvbl92aWV3c19iaW5kZWQ6IChzY29wZSkgPT5cbiAgICByZXR1cm4gdW5sZXNzIHNjb3BlLm1haW5cblxuICAgIHVzZXJfY29udHJvbGxlci5vbiAndXNlcjpsb2dnZWQnLCBAb25fdXNlcl9sb2dnZWRcbiAgICB1c2VyX2NvbnRyb2xsZXIub24gJ3VzZXI6dW5sb2dnZWQnLCBAb25fdXNlcl91bmxvZ2dlZFxuICAgIHVzZXJfY29udHJvbGxlci5vbiAndXNlcjp1cGRhdGVkJywgQG9uX3VzZXJfdXBkYXRlZFxuXG4gICAgdXNlciA9IHVzZXJfY29udHJvbGxlci5kYXRhXG5cbiAgICBpZiB1c2VyXG4gICAgICBAb25fdXNlcl9sb2dnZWQgdXNlclxuICAgIGVsc2VcbiAgICAgIEBvbl91c2VyX3VubG9nZ2VkKClcblxuICBvbl91c2VyX3VwZGF0ZWQ6ICggQHVzZXJfZGF0YSApID0+XG5cbiAgb25fdXNlcl9sb2dnZWQ6ICggQHVzZXJfZGF0YSApID0+XG5cbiAgb25fdXNlcl91bmxvZ2dlZDogPT5cblxuICBkZXN0cm95OiA9PlxuICAgIHVzZXJfY29udHJvbGxlci5vZmYgJ3VzZXI6bG9nZ2VkJywgQG9uX3VzZXJfbG9nZ2VkXG4gICAgdXNlcl9jb250cm9sbGVyLm9mZiAndXNlcjp1bmxvZ2dlZCcsIEBvbl91c2VyX3VubG9nZ2VkICAgIFxuICAgIHVzZXJfY29udHJvbGxlci5vZmYgJ3VzZXI6dXBkYXRlZCcsIEBvbl91c2VyX3VwZGF0ZWQiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSx1QkFBQTtHQUFBLCtFQUFBOztBQUFBLENBQUEsRUFBa0IsSUFBQSxRQUFsQixPQUFrQjs7QUFFbEIsQ0FGQSxFQUV1QixHQUFqQixDQUFOO0NBRWUsQ0FBQSxDQUFBLGlCQUFBO0NBQ1gsd0NBQUE7Q0FBQSwwREFBQTtDQUFBLHNEQUFBO0NBQUEsd0RBQUE7Q0FBQSx3REFBQTtDQUFBLENBQW9CLEVBQXBCLElBQUEsT0FBQTtDQURGLEVBQWE7O0NBQWIsRUFHaUIsRUFBQSxJQUFDLE1BQWxCO0NBQ0UsR0FBQSxJQUFBO0FBQWMsQ0FBZCxHQUFBLENBQW1CO0NBQW5CLFdBQUE7TUFBQTtDQUFBLENBRUEsRUFBQSxTQUFBLENBQUEsQ0FBZTtDQUZmLENBR0EsRUFBQSxXQUFlLENBQWY7Q0FIQSxDQUlBLEVBQUEsVUFBQSxDQUFlO0NBSmYsRUFNTyxDQUFQLFdBQXNCO0NBRXRCLEdBQUE7Q0FDRyxHQUFBLFNBQUQsQ0FBQTtNQURGO0NBR0csR0FBQSxTQUFELEdBQUE7TUFaYTtDQUhqQixFQUdpQjs7Q0FIakIsRUFpQmlCLE1BQUcsTUFBcEI7Q0FBaUMsRUFBYixDQUFELEtBQWM7Q0FqQmpDLEVBaUJpQjs7Q0FqQmpCLEVBbUJnQixNQUFHLEtBQW5CO0NBQWdDLEVBQWIsQ0FBRCxLQUFjO0NBbkJoQyxFQW1CZ0I7O0NBbkJoQixFQXFCa0IsTUFBQSxPQUFsQjs7Q0FyQkEsRUF1QlMsSUFBVCxFQUFTO0NBQ1AsQ0FBbUMsQ0FBbkMsQ0FBQSxTQUFBLENBQUEsQ0FBZTtDQUFmLENBQ3FDLENBQXJDLENBQUEsV0FBZSxDQUFmO0NBQ2dCLENBQW9CLENBQXBDLENBQXFDLE9BQXJDLEdBQUEsQ0FBZTtDQTFCakIsRUF1QlM7O0NBdkJUOztDQUpGIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjEzNTA4LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvbG9naW4uY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIk5hdmlnYXRpb24gPSByZXF1aXJlICdhcHAvY29udHJvbGxlcnMvbmF2aWdhdGlvbidcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBMb2dpblxuXHRjb25zdHJ1Y3RvcjogKCBAZG9tICkgLT5cblxuXHRcdHVubGVzcyB3aW5kb3cub3BlbmVyP1xuXHRcdFx0YXBwLmJvZHkucmVtb3ZlQ2xhc3MgXCJsb2dpbl9wYWdlXCJcblx0XHRcdE5hdmlnYXRpb24uZ28gJy8nXG5cblx0XHQkKCcjcGxheWVyJykuaGlkZSgpXG5cdFx0XG5cdFx0QHVzZXJuYW1lID0gQGRvbS5maW5kKCAnLnVzZXJuYW1lJyApXG5cdFx0QHBhc3N3b3JkID0gQGRvbS5maW5kKCAnLnBhc3N3b3JkJyApXG5cblx0XHRAZG9tLmZpbmQoICcuZmFjZWJvb2snICkub24gJ2NsaWNrJywgQF9mYWNlYm9va19sb2dpblxuXHRcdEBkb20uZmluZCggJy5zb3VuZGNsb3VkJyApLm9uICdjbGljaycsIEBfc291bmRjbG91ZF9sb2dpblxuXHRcdEBkb20uZmluZCggJy5nb29nbGUnICkub24gJ2NsaWNrJywgQF9nb29nbGVfbG9naW5cblxuXHRcdFxuXHRcdCMgQGRvbS5maW5kKCAnLnNpZ25pbicgKS5vbiAnY2xpY2snLCBAX2N1c3RvbV9sb2dpblxuXG5cdFx0IyBAZG9tLmZpbmQoICdpbnB1dCcgKS5rZXlwcmVzcyAoZXZlbnQpID0+XG5cdFx0IyBcdGlmIGV2ZW50LndoaWNoIGlzIDEzXG5cdFx0IyBcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHQjIFx0XHRAX2N1c3RvbV9sb2dpbigpXG5cdFx0IyBcdFx0cmV0dXJuIGZhbHNlXG5cdFx0XHRcblxuXHRfZmFjZWJvb2tfbG9naW46ICggKSA9PlxuXHRcdGxvZyBcIltMb2dpbl0gX2ZhY2Vib29rX2xvZ2luXCJcblxuXHRfc291bmRjbG91ZF9sb2dpbjogKCApID0+XG5cdFx0bG9nIFwiW0xvZ2luXSBfc291bmRjbG91ZF9sb2dpblwiXG5cblx0X2dvb2dsZV9sb2dpbjogKCApID0+XG5cdFx0bG9nIFwiW0xvZ2luXSBfZ29vZ2xlX2xvZ2luXCJcblxuXHQjIF9jdXN0b21fbG9naW46ICggKSA9PlxuXHQjIFx0QGRvbS5yZW1vdmVDbGFzcyBcImVycm9yXCJcblx0IyBcdGlmIEB1c2VybmFtZS52YWwoKS5sZW5ndGggPD0gMCBvciBAcGFzc3dvcmQudmFsKCkubGVuZ3RoIDw9IDBcblx0IyBcdFx0bG9nIFwiW0xvZ2luXSBlcnJvclwiXG5cdCMgXHRcdEBkb20uYWRkQ2xhc3MgXCJlcnJvclwiXG5cdCMgXHRcdHJldHVybiBmYWxzZVxuXG5cdCMgXHRkYXRhOlxuXHQjIFx0XHR1c2VybmFtZTogQHVzZXJuYW1lLnZhbCgpXG5cdCMgXHRcdHBhc3N3b3JkOiBAcGFzc3dvcmQudmFsKClcblxuXHQjIFx0bG9nIFwiW0xvZ2luXSBzdWJtaXR0aW5nIGRhdGFcIiwgZGF0YVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsYUFBQTtHQUFBLCtFQUFBOztBQUFBLENBQUEsRUFBYSxJQUFBLEdBQWIsa0JBQWE7O0FBRWIsQ0FGQSxFQUV1QixHQUFqQixDQUFOO0NBQ2MsQ0FBQSxDQUFBLFlBQUc7Q0FFZixFQUZlLENBQUQ7Q0FFZCxvREFBQTtDQUFBLDREQUFBO0NBQUEsd0RBQUE7Q0FBQSxHQUFBLGlCQUFBO0NBQ0MsRUFBRyxDQUFLLEVBQVIsS0FBQSxDQUFBO0NBQUEsQ0FDQSxDQUFBLEdBQUEsSUFBVTtNQUZYO0NBQUEsR0FJQSxLQUFBO0NBSkEsRUFNWSxDQUFaLElBQUEsR0FBWTtDQU5aLEVBT1ksQ0FBWixJQUFBLEdBQVk7Q0FQWixDQVNBLENBQUksQ0FBSixHQUFBLElBQUEsSUFBQTtDQVRBLENBVUEsQ0FBSSxDQUFKLEdBQUEsTUFBQSxJQUFBO0NBVkEsQ0FXQSxDQUFJLENBQUosR0FBQSxFQUFBLElBQUE7Q0FiRCxFQUFhOztDQUFiLEVBeUJpQixNQUFBLE1BQWpCO0NBQ0ssRUFBSixRQUFBLGNBQUE7Q0ExQkQsRUF5QmlCOztDQXpCakIsRUE0Qm1CLE1BQUEsUUFBbkI7Q0FDSyxFQUFKLFFBQUEsZ0JBQUE7Q0E3QkQsRUE0Qm1COztDQTVCbkIsRUErQmUsTUFBQSxJQUFmO0NBQ0ssRUFBSixRQUFBLFlBQUE7Q0FoQ0QsRUErQmU7O0NBL0JmOztDQUhEIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjEzNTQ5LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvcHJvZmlsZS5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiQ2xvdWRpbmFyeSA9IHJlcXVpcmUgJ2FwcC9jb250cm9sbGVycy9jbG91ZGluYXJ5J1xudHJhbnNmb3JtICA9IHJlcXVpcmUgJ2FwcC91dGlscy9pbWFnZXMvdHJhbnNmb3JtJ1xubm90aWZ5ICAgICA9IHJlcXVpcmUgJ2FwcC9jb250cm9sbGVycy9ub3RpZnknXG51c2VyX2NvbnRyb2xsZXIgPSByZXF1aXJlICdhcHAvY29udHJvbGxlcnMvdXNlcidcbkxvZ2dlZFZpZXcgPSByZXF1aXJlICdhcHAvdmlld3MvbG9nZ2VkX3ZpZXcnXG5hcGkgPSByZXF1aXJlICdhcHAvYXBpL2xvb3BjYXN0L2xvb3BjYXN0J1xuaGFwcGVucyA9IHJlcXVpcmUgJ2hhcHBlbnMnXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUHJvZmlsZSBleHRlbmRzIExvZ2dlZFZpZXdcblx0ZWxlbWVudHM6IG51bGxcblx0Zm9ybV9iaW86IG51bGxcblx0Y292ZXJfdXJsOiBcIlwiXG5cblx0Y29uc3RydWN0b3I6ICggQGRvbSApIC0+XG5cdFx0c3VwZXIoKVxuXHRcdGhhcHBlbnMgQFxuXG5cdFx0bG9nIFwiWz09PSBQQUdFIE9XTkVSOiAje293bmVyX2lkfSA9PT1dXCJcblx0XHRjb25zb2xlLmxvZyBwcm9maWxlX2luZm9cblxuXHRcdEBlbGVtZW50cyA9IFxuXHRcdFx0YXZhdGFyICAgICAgICA6IEBkb20uZmluZCAnLnByb2ZpbGVfaW1hZ2UgaW1nJ1xuXHRcdFx0Y292ZXJfcGljdHVyZSA6IEBkb20uZmluZCAnLmNvdmVyX2ltYWdlJ1xuXHRcdFx0bG9jYXRpb24gICAgICA6IEBkb20uZmluZCAnLnByb2ZpbGVfYmlvIC5sb2NhdGlvbidcblx0XHRcdGxvY2F0aW9uX2lucHV0OiBAZG9tLmZpbmQgJy5sb2NhdGlvbl9pbnB1dCdcblx0XHRcdGFib3V0ICAgICAgICAgOiBAZG9tLmZpbmQgJy5iaW8nXG5cdFx0XHRhYm91dF9pbnB1dCAgIDogQGRvbS5maW5kICcuYmlvX2lucHV0J1xuXG5cdFx0XHRsaW5rczogW1xuXHRcdFx0XHR7IHR5cGU6XCJzcG90aWZ5XCIgICAsIGVsOkBkb20uZmluZCAnLnNwb3RpZnlfbGluaycgICAgfVxuXHRcdFx0XHR7IHR5cGU6XCJzb3VuZGNsb3VkXCIsIGVsOkBkb20uZmluZCAnLnNvdW5kY2xvdWRfbGluaycgfVxuXHRcdFx0XHR7IHR5cGU6XCJmYWNlYm9va1wiICAsIGVsOkBkb20uZmluZCAnLmZhY2Vib29rX2xpbmsnICAgfVxuXHRcdFx0XVxuXG5cdFx0XHRsaW5rc19pbnB1dDogW1xuXHRcdFx0XHR7IHR5cGU6IFwic3BvdGlmeVwiICAgLCBlbDpAZG9tLmZpbmQgJy5zcG90aWZ5X2lucHV0JyAgICB9XG5cdFx0XHRcdHsgdHlwZTogXCJzb3VuZGNsb3VkXCIsIGVsOkBkb20uZmluZCAnLnNvdW5kY2xvdWRfaW5wdXQnIH1cblx0XHRcdFx0eyB0eXBlOiBcImZhY2Vib29rXCIgICwgZWw6QGRvbS5maW5kICcuZmFjZWJvb2tfaW5wdXQnICAgfVxuXHRcdFx0XVxuXG5cdFx0XHRvY2N1cGF0aW9uX2lucHV0OiBudWxsXG5cdFx0XHRnZW5yZV9pbnB1dDogbnVsbFxuXG5cdFx0QGVsZW1lbnRzLmF2YXRhci5hdHRyICdzcmMnLCB0cmFuc2Zvcm0uYXZhdGFyKCBwcm9maWxlX2luZm8uYXZhdGFyIClcblxuXG5cdFx0QGZvcm1fYmlvID0gQGRvbS5maW5kKCAnLnByb2ZpbGVfZm9ybScgKVxuXHRcdEBmb3JtX2Jpby5vbiAnc3VibWl0JywgKGUpIC0+IGUucHJldmVudERlZmF1bHQoKVxuXHRcdEBmb3JtX2Jpby5maW5kKCAnaW5wdXQnICkua2V5dXAgKGUpID0+XG5cdFx0XHRpZiBlLmtleUNvZGUgaXMgMTNcblx0XHRcdFx0QHNhdmVfZGF0YSgpXG5cblx0XHRyZWYgPSBAXG5cblx0XHRAZG9tLmZpbmQoICdbZGF0YS1wcm9maWxlXScgKS5vbiAnY2xpY2snLCAtPlxuXG5cdFx0XHR2YWx1ZSA9ICQoQCkuZGF0YSAncHJvZmlsZSdcblxuXHRcdFx0c3dpdGNoIHZhbHVlXG5cdFx0XHRcdHdoZW4gJ3NldC13cml0ZS1tb2RlJ1xuXHRcdFx0XHRcdGRvIHJlZi53cml0ZV9tb2RlXG5cdFx0XHRcdHdoZW4gJ3NldC1yZWFkLW1vZGUnXG5cdFx0XHRcdFx0ZG8gcmVmLnNhdmVfZGF0YVxuXG5cblx0XHQkKCAnI3Jvb21fbW9kYWwnICkuZGF0YSggJ21vZGFsLWNsb3NlJywgdHJ1ZSApXG5cblx0XHQjIENoZWNrIHRoZSBpbmZvcm1hdGlvbiBvZiB0aGUgb3duZXIgb2YgdGhlIHBhZ2Vcblx0XHRAY2hlY2tfaW5mb3JtYXRpb25zKClcblxuXHRcdGRlbGF5IDEwMCwgPT4gXG5cdFx0XHRAZW1pdCAncmVhZHknXG5cblx0b25fdmlld3NfYmluZGVkOiAoc2NvcGUpID0+XG5cdFx0cmV0dXJuIGlmIG5vdCBzY29wZS5tYWluXG5cblx0XHRAdXNlcl9kYXRhID0gcHJvZmlsZV9pbmZvXG5cdFx0QHVwZGF0ZV9kb21fZnJvbV91c2VyX2RhdGEoKVxuXG5cdFx0byA9IHZpZXcuZ2V0X2J5X2RvbSBAZG9tLmZpbmQgJy5jb3ZlciBoMy50eXBlJ1xuXHRcdGcgPSB2aWV3LmdldF9ieV9kb20gQGRvbS5maW5kICcuY292ZXIgLmdlbnJlcydcblx0XHRsID0gdmlldy5nZXRfYnlfZG9tIEBkb20uZmluZCAnLnNvY2lhbF9saW5rcydcblxuXHRcdGlmIG8gYW5kIGdcblx0XHRcdEBlbGVtZW50cy5vY2N1cGF0aW9uX2lucHV0ID0gb1xuXHRcdFx0QGVsZW1lbnRzLmdlbnJlX2lucHV0ID0gZ1xuXHRcdFx0QGVsZW1lbnRzLmxpbmtzX2lucHV0ID0gbFxuXHRcdGVsc2Vcblx0XHRcdGNvbnNvbGUuZXJyb3IgXCJbUHJvZmlsZV0gY291bGRuJ3QgZmluZCBvY2N1cGF0aW9uIGFuZCBnZW5yZXMgY29tcG9uZW50LlwiXG5cblxuXG5cdFx0c3VwZXIgc2NvcGVcblx0XHRcblxuXG5cdG9uX3VzZXJfbG9nZ2VkOiAoIEB1c2VyX2RhdGEgKSA9PlxuXG5cdFx0c3VwZXIgQHVzZXJfZGF0YVxuXG5cdFx0QGRvbS5hZGRDbGFzcyAndXNlcl9sb2dnZWQnXG5cblx0XHRAY2hlY2tfdmlzaWJpbGl0eV9lZGl0YWJsZXMoKVxuXG5cdFx0aWYgbm90IHVzZXJfY29udHJvbGxlci5pc19vd25lclxuXHRcdFx0cmV0dXJuXG5cblx0XHQjIExpc3RlbiB0byBpbWFnZXMgdXBsb2FkIGV2ZW50c1xuXHRcdEBjaGFuZ2VfY292ZXJfdXBsb2FkZXIgPSB2aWV3LmdldF9ieV9kb20gQGRvbS5maW5kKCAnLmNoYW5nZV9jb3ZlcicgKVxuXG5cdFx0aWYgbm90IEBjaGFuZ2VfY292ZXJfdXBsb2FkZXJcblx0XHRcdHJldHVyblxuXG5cdFx0QGNoYW5nZV9jb3Zlcl91cGxvYWRlci5vbiAnY29tcGxldGVkJywgKGRhdGEpID0+XG5cdFx0XHRsb2cgXCJbQ292ZXIgdXBsb2FkZXJdXCIsIGRhdGEucmVzdWx0LnVybFxuXG5cdFx0XHRAY292ZXJfdXJsID0gZGF0YS5yZXN1bHQudXJsXG5cblxuXHRcdFx0XG5cdFx0XHRcblx0XHRcdEBkb20uZmluZCggJy5jb3Zlcl9pbWFnZScgKS5jc3Ncblx0XHRcdFx0J2JhY2tncm91bmQtaW1hZ2UnOiBcInVybCgje2RhdGEucmVzdWx0LnVybH0pXCJcblxuXHRcdEBjaGFuZ2VfcGljdHVyZV91cGxvYWRlciA9IHZpZXcuZ2V0X2J5X2RvbSBAZG9tLmZpbmQoICcucHJvZmlsZV9pbWFnZScgKVxuXHRcdEBjaGFuZ2VfcGljdHVyZV91cGxvYWRlci5vbiAnY29tcGxldGVkJywgKGRhdGEpID0+XG5cblx0XHRcdHVzZXJfY29udHJvbGxlci5kYXRhLmF2YXRhciA9IGRhdGEucmVzdWx0LnVybFxuXHRcdFx0dXNlcl9jb250cm9sbGVyLm5vcm1hbGl6ZV9kYXRhKClcblxuXHRcdFx0dXJsID0gdXNlcl9jb250cm9sbGVyLmRhdGEuaW1hZ2VzLmF2YXRhclxuXG5cdFx0XHRAZG9tLmZpbmQoICdpbWcnICkuYXR0ciAnc3JjJywgdXJsXG5cblx0XHRAZWRpdGFibGVzID0gW11cblx0XHRAZWRpdGFibGVzLnB1c2ggdmlldy5nZXRfYnlfZG9tKCAnLmNvdmVyIGgxLm5hbWUnIClcblx0XHRAZWRpdGFibGVzLnB1c2ggdmlldy5nZXRfYnlfZG9tKCAnLmNvdmVyIGgzLnR5cGUnIClcblx0XHRAZWRpdGFibGVzLnB1c2ggdmlldy5nZXRfYnlfZG9tKCAnLmNvdmVyIC5nZW5yZXMnIClcblx0XHRAZWRpdGFibGVzLnB1c2ggdmlldy5nZXRfYnlfZG9tKCAnLnNvY2lhbF9saW5rcycgKVxuXG5cdFx0XG5cblxuXHRjaGVja192aXNpYmlsaXR5X2VkaXRhYmxlczogPT5cblxuXHRcdGlmIHVzZXJfY29udHJvbGxlci5pc19vd25lclxuXG5cdFx0XHRAZWxlbWVudHMub2NjdXBhdGlvbl9pbnB1dC5kb20uc2hvdygpXG5cdFx0XHRAZWxlbWVudHMuZ2VucmVfaW5wdXQuZG9tLnNob3coKVxuXHRcdGVsc2VcblxuXHRcdFx0aWYgQGVsZW1lbnRzLm9jY3VwYXRpb25faW5wdXQuZGVmYXVsdF9zdGF0ZVxuXHRcdFx0XHRAZWxlbWVudHMub2NjdXBhdGlvbl9pbnB1dC5kb20uaGlkZSgpXG5cblx0XHRcdGlmIEBlbGVtZW50cy5nZW5yZV9pbnB1dC5kZWZhdWx0X3N0YXRlXG5cdFx0XHRcdEBlbGVtZW50cy5nZW5yZV9pbnB1dC5kb20uaGlkZSgpXG5cblx0XHRcdCMgQGVsZW1lbnRzLm9jY3VwYXRpb25faW5wdXRcblx0XHRcdCMgQGVsZW1lbnRzLmdlbnJlX2lucHV0XG5cblxuXHRvbl91c2VyX3VubG9nZ2VkOiA9PlxuXHRcdCMgbG9nIFwiW1Byb2ZpbGVdIG9uX3VzZXJfdW5sb2dnZWRcIlxuXHRcdHN1cGVyKClcblx0XHRAZG9tLnJlbW92ZUNsYXNzKCAndXNlcl9sb2dnZWQnIClcblxuXHRcdEBjaGFuZ2VfY292ZXJfdXBsb2FkZXI/Lm9mZiAnY29tcGxldGVkJ1xuXHRcdEBjaGFuZ2VfcGljdHVyZV91cGxvYWRlcj8ub2ZmICdjb21wbGV0ZWQnXG5cdFx0ZGVsYXkgMSwgPT4gQGNoZWNrX3Zpc2liaWxpdHlfZWRpdGFibGVzKClcblxuXG5cdCMgT3BlbiB0aGUgd3JpdGUvZWRpdCBtb2RlXG5cdHdyaXRlX21vZGUgOiAtPlxuXHRcdGFwcC5ib2R5LmFkZENsYXNzICd3cml0ZV9tb2RlJ1xuXHRcblx0XG5cdHNhdmVfZGF0YSA6IC0+XG5cdFx0IyAtIFVwZGF0ZSB0aGUgdXNlcl9kYXRhIGZyb20gdGhlIGlucHV0c1xuXG5cdFx0Zm9yIGl0ZW0gaW4gQGVkaXRhYmxlc1xuXHRcdFx0aXRlbS5jbG9zZV9yZWFkX21vZGUoKVxuXG5cdFx0QHVwZGF0ZV91c2VyX2RhdGFfZnJvbV9kb20oKVxuXG5cdFx0IyAtIFVwZGF0ZSB0aGUgZG9tIChsYWJlbHMgYW5kIGlucHV0cykgZnJvbSB0aGUgdXNlcl9kYXRhXG5cdFx0IyBcdFRoaXMgYWN0aW9uIGlzIG1vc3RseSBkb25lIGZvciB1cGRhdGluZyBsYWJlbHMgKGlucHV0cyBhcmUgYWxyZWFkeSB1cGRhdGVkKVxuXHRcdEB1cGRhdGVfZG9tX2Zyb21fdXNlcl9kYXRhKClcblxuXHRcdEBjaGVja19pbmZvcm1hdGlvbnMoKVxuXG5cdFx0IyAtIFRPRE86IFNlbmQgdGhlIGRhdGEgdG8gdGhlIGJhY2tlbmRcblx0XHRAc2VuZF90b19zZXJ2ZXIoKVxuXG5cdFx0IyAtIGNsb3NlIHRoZSB3cml0ZS9lZGl0IG1vZGUgYW5kIHN3aXRjaCB0byByZWFkIG9ubHkgbW9kZVxuXHRcdGFwcC5ib2R5LnJlbW92ZUNsYXNzICd3cml0ZV9tb2RlJ1xuXG5cblxuXHR1cGRhdGVfdXNlcl9kYXRhX2Zyb21fZG9tOiAtPlxuXG5cdFx0IyAtIFRPRE86IFVwZGF0ZSB0aGUgaW1hZ2VzXG5cdFx0QHVzZXJfZGF0YS5sb2NhdGlvbiA9IEBlbGVtZW50cy5sb2NhdGlvbl9pbnB1dC52YWwoKVxuXHRcdEB1c2VyX2RhdGEuYWJvdXQgPSBAZWxlbWVudHMuYWJvdXRfaW5wdXQudmFsKClcblxuXHRcdEB1c2VyX2RhdGEub2NjdXBhdGlvbiA9IEBlbGVtZW50cy5vY2N1cGF0aW9uX2lucHV0LmdldF9jdXJyZW50X3ZhbHVlKClcblx0XHRAdXNlcl9kYXRhLmdlbnJlcyA9IEBlbGVtZW50cy5nZW5yZV9pbnB1dC5nZXRfY3VycmVudF92YWx1ZSgpXG5cblx0XHRsb2cgXCJbUHJvZmlsZV0gdXBkYXRlX3VzZXJfZGF0YV9mcm9tX2RvbVwiLCBAZWxlbWVudHMuZ2VucmVfaW5wdXQsIEB1c2VyX2RhdGEuZ2VucmVzXG5cdFx0QHVzZXJfZGF0YS5zb2NpYWwgPSBAZWxlbWVudHMubGlua3NfaW5wdXQuZ2V0X2N1cnJlbnRfdmFsdWUoKVxuXG5cblx0XHRpZiB1c2VyX2NvbnRyb2xsZXIuZGF0YS5hdmF0YXI/XG5cdFx0XHRAdXNlcl9kYXRhLmF2YXRhciA9IHVzZXJfY29udHJvbGxlci5kYXRhLmF2YXRhclxuXHRcdGlmIEBjb3Zlcl91cmwubGVuZ3RoID4gMFxuXHRcdFx0QHVzZXJfZGF0YS5jb3ZlciA9IEBjb3Zlcl91cmxcblxuXG5cdHVwZGF0ZV9kb21fZnJvbV91c2VyX2RhdGEgOiAtPlxuXG5cdFx0ZSA9IEBlbGVtZW50c1xuXHRcdGQgPSBAdXNlcl9kYXRhXG5cblx0XHRlLmF2YXRhci5jc3MgJ2JhY2tncm91bmQtaW1hZ2UnLCBkLmF2YXRhclxuXHRcdGUuY292ZXJfcGljdHVyZS5jc3MgJ2JhY2tncm91bmQtaW1hZ2UnLCBkLmNvdmVyX3BpY3R1cmVcblxuXHRcdGlmIGQubG9jYXRpb25cblx0XHRcdGUubG9jYXRpb24uaHRtbCBkLmxvY2F0aW9uXG5cdFx0XHRlLmxvY2F0aW9uX2lucHV0LnZhbCBkLmxvY2F0aW9uXG5cblx0XHRpZiBkLmFib3V0XG5cdFx0XHRlLmFib3V0Lmh0bWwgZC5hYm91dFxuXHRcdFx0ZS5hYm91dF9pbnB1dC52YWwgQGh0bWxfdG9fdGV4dGFyZWEoIGQuYWJvdXQgKVxuXG5cblx0aHRtbF90b190ZXh0YXJlYSA6ICggc3RyICkgLT5cblx0XHR0b19maW5kID0gXCI8YnIvPlwiXG5cdFx0dG9fcmVwbGFjZSA9IFwiXFxuXCJcblx0XHRyZSA9IG5ldyBSZWdFeHAgdG9fZmluZCwgJ2cnXG5cblx0XHRyZXR1cm4gc3RyLnJlcGxhY2UgcmUsIHRvX3JlcGxhY2VcblxuXHRjaGVja19pbmZvcm1hdGlvbnM6IC0+XG5cdFx0bCA9IEBlbGVtZW50cy5sb2NhdGlvbi5odG1sKCkubGVuZ3RoXG5cdFx0YiA9IEBlbGVtZW50cy5hYm91dC5odG1sKCkubGVuZ3RoXG5cblx0XHQjIGxvZyBcIltQcm9maWxlXSBjaGVja19pbmZvcm1hdGlvbnNcIiwgbCwgYlxuXHRcdCMgbG9nIFwiLS0tPiBsb2NhdGlvblwiLCBAZWxlbWVudHMubG9jYXRpb24uaHRtbCgpLCBAZWxlbWVudHMubG9jYXRpb24uaHRtbCgpLmxlbmd0aFxuXHRcdCMgbG9nIFwiLS0tPiBsb2NhdGlvblwiLCBAZWxlbWVudHMuYmlvLmh0bWwoKSwgQGVsZW1lbnRzLmJpby5odG1sKCkubGVuZ3RoXG5cdFx0aWYgbCA+IDAgb3IgYiA+IDBcblx0XHRcdEBkb20ucmVtb3ZlQ2xhc3MgJ25vX2luZm9ybWF0aW9uX3lldCdcblx0XHRlbHNlXG5cdFx0XHRAZG9tLmFkZENsYXNzICdub19pbmZvcm1hdGlvbl95ZXQnXG5cblxuXG5cblx0c2VuZF90b19zZXJ2ZXI6IC0+XG5cdFx0bG9nIFwiW1Byb2ZpbGVdIHNhdmluZ1wiLCBAdXNlcl9kYXRhXG5cdFxuXHRcdCMgdXNlcl9pZFxuXHRcdCMgbmFtZTogU3RyaW5nXG5cdFx0IyBvY2N1cGF0aW9uOiBTdHJpbmdcblx0XHQjIGdlbnJlc1xuXHRcdCMgYWJvdXQ6IFN0cmluZ1xuXHRcdCMgbG9jYXRpb246IFN0cmluZ1xuXHRcdCMgc29jaWFsOiBBcnJheVxuXHRcdCMgYXZhdGFyOiBTdHJpbmdcblx0XHQjIGNvdmVyOiBTdHJpbmdcblxuXG5cdFx0YXBpLnVzZXIuZWRpdCBAdXNlcl9kYXRhLCAoIGVycm9yLCByZXNwb25zZSApID0+XG5cblx0XHRcdGxvZyBcIltQcm9maWxlXSBmaWVsZHMgdXBkYXRlZFwiLCByZXNwb25zZS5jdXN0b21fYXR0cmlidXRlc1xuXHRcdFx0aWYgZXJyb3Jcblx0XHRcdFx0bG9nIFwiLS0tPiBFcnJvciBQcm9maWxlIGVkaXQgdXNlclwiLCBlcnJvci5zdGF0dXNUZXh0XG5cdFx0XHRcdHJldHVyblxuXG5cdFx0XHR1c2VyX2NvbnRyb2xsZXIud3JpdGVfdG9fc2Vzc2lvbigpXG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSw2RUFBQTtHQUFBOztrU0FBQTs7QUFBQSxDQUFBLEVBQWEsSUFBQSxHQUFiLGtCQUFhOztBQUNiLENBREEsRUFDYSxJQUFBLEVBQWIsbUJBQWE7O0FBQ2IsQ0FGQSxFQUVhLEdBQWIsQ0FBYSxpQkFBQTs7QUFDYixDQUhBLEVBR2tCLElBQUEsUUFBbEIsT0FBa0I7O0FBQ2xCLENBSkEsRUFJYSxJQUFBLEdBQWIsYUFBYTs7QUFDYixDQUxBLEVBS0EsSUFBTSxvQkFBQTs7QUFDTixDQU5BLEVBTVUsSUFBVixFQUFVOztBQUVWLENBUkEsRUFRdUIsR0FBakIsQ0FBTjtDQUNDOztDQUFBLEVBQVUsQ0FBVixJQUFBOztDQUFBLEVBQ1UsQ0FEVixJQUNBOztDQURBLENBQUEsQ0FFVyxNQUFYOztDQUVhLENBQUEsQ0FBQSxjQUFHO0NBQ2YsRUFBQSxLQUFBO09BQUEsS0FBQTtDQUFBLEVBRGUsQ0FBRDtDQUNkLDBEQUFBO0NBQUEsOEVBQUE7Q0FBQSxzREFBQTtDQUFBLHdEQUFBO0NBQUEsR0FBQSxtQ0FBQTtDQUFBLEdBQ0EsR0FBQTtDQURBLEVBR0EsQ0FBQSxHQUFBLENBQUssV0FBQTtDQUhMLEVBSUEsQ0FBQSxHQUFPLEtBQVA7Q0FKQSxFQU9DLENBREQsSUFBQTtDQUNDLENBQWdCLENBQUksQ0FBSCxFQUFqQixjQUFnQjtDQUFoQixDQUNnQixDQUFJLENBQUgsRUFBakIsT0FBQSxDQUFnQjtDQURoQixDQUVnQixDQUFJLENBQUgsRUFBakIsRUFBQSxnQkFBZ0I7Q0FGaEIsQ0FHZ0IsQ0FBSSxDQUFILEVBQWpCLFFBQUEsR0FBZ0I7Q0FIaEIsQ0FJZ0IsQ0FBSSxDQUFILENBQWpCLENBQUE7Q0FKQSxDQUtnQixDQUFJLENBQUgsRUFBakIsS0FBQSxDQUFnQjtDQUxoQixDQU9PLEdBQVAsQ0FBQTtTQUNDO0NBQUEsQ0FBTyxFQUFMLEtBQUYsQ0FBRTtDQUFGLENBQXFCLENBQU8sQ0FBSCxNQUFKLEtBQUc7RUFDeEIsUUFGTTtDQUVOLENBQU8sRUFBTCxNQUFBLEVBQUY7Q0FBQSxDQUFxQixDQUFPLENBQUgsTUFBSixRQUFHO0VBQ3hCLFFBSE07Q0FHTixDQUFPLEVBQUwsTUFBQTtDQUFGLENBQXFCLENBQU8sQ0FBSCxNQUFKLE1BQUc7VUFIbEI7UUFQUDtDQUFBLENBYWEsSUFBYixLQUFBO1NBQ0M7Q0FBQSxDQUFRLEVBQU4sS0FBRixDQUFFO0NBQUYsQ0FBc0IsQ0FBTyxDQUFILE1BQUosTUFBRztFQUN6QixRQUZZO0NBRVosQ0FBUSxFQUFOLE1BQUEsRUFBRjtDQUFBLENBQXNCLENBQU8sQ0FBSCxNQUFKLFNBQUc7RUFDekIsUUFIWTtDQUdaLENBQVEsRUFBTixNQUFBO0NBQUYsQ0FBc0IsQ0FBTyxDQUFILE1BQUosT0FBRztVQUhiO1FBYmI7Q0FBQSxDQW1Ca0IsRUFuQmxCLEVBbUJBLFVBQUE7Q0FuQkEsQ0FvQmEsRUFwQmIsRUFvQkEsS0FBQTtDQTNCRCxLQUFBO0NBQUEsQ0E2QjZCLEVBQTdCLENBQUEsQ0FBZ0IsRUFBUCxDQUE2QixHQUFxQjtDQTdCM0QsRUFnQ1ksQ0FBWixJQUFBLE9BQVk7Q0FoQ1osQ0FpQ0EsQ0FBdUIsQ0FBdkIsSUFBUyxDQUFlO0NBQU8sWUFBRCxDQUFBO0NBQTlCLElBQXVCO0NBakN2QixFQWtDZ0MsQ0FBaEMsQ0FBQSxFQUFBLENBQVMsQ0FBd0I7Q0FDaEMsQ0FBQSxFQUFHLENBQWEsQ0FBaEIsQ0FBRztDQUNELElBQUEsSUFBRCxNQUFBO1FBRjhCO0NBQWhDLElBQWdDO0NBbENoQyxFQXNDQSxDQUFBO0NBdENBLENBd0NBLENBQUksQ0FBSixHQUFBLEVBQTBDLE9BQTFDO0NBRUMsSUFBQSxLQUFBO0NBQUEsRUFBUSxDQUFBLENBQVIsQ0FBQSxHQUFRO0NBRVIsSUFBQSxTQUFPO0NBQVAsWUFDTSxHQUROO0NBRVMsRUFBRCxPQUFOLE9BQUc7Q0FGTCxZQUdNLEVBSE47Q0FJUyxFQUFELE1BQU4sUUFBRztDQUpMLE1BSnlDO0NBQTFDLElBQTBDO0NBeEMxQyxDQW1Ed0MsRUFBeEMsU0FBQTtDQW5EQSxHQXNEQSxjQUFBO0NBdERBLENBd0RXLENBQVgsQ0FBQSxDQUFBLElBQVc7Q0FDVCxHQUFELENBQUMsRUFBRCxNQUFBO0NBREQsSUFBVztDQTdEWixFQUlhOztDQUpiLEVBZ0VpQixFQUFBLElBQUMsTUFBbEI7Q0FDQyxNQUFBLENBQUE7QUFBYyxDQUFkLEdBQUEsQ0FBbUI7Q0FBbkIsV0FBQTtNQUFBO0NBQUEsRUFFYSxDQUFiLEtBQUEsR0FGQTtDQUFBLEdBR0EscUJBQUE7Q0FIQSxFQUtJLENBQUosTUFBSSxNQUFnQjtDQUxwQixFQU1JLENBQUosTUFBSSxNQUFnQjtDQU5wQixFQU9JLENBQUosTUFBSSxLQUFnQjtDQUVwQixHQUFBO0NBQ0MsRUFBNkIsQ0FBNUIsRUFBRCxFQUFTLFFBQVQ7Q0FBQSxFQUN3QixDQUF2QixFQUFELEVBQVMsR0FBVDtDQURBLEVBRXdCLENBQXZCLEVBQUQsRUFBUyxHQUFUO01BSEQ7Q0FLQyxJQUFBLENBQUEsQ0FBTyxtREFBUDtNQWREO0NBRGdCLElBbUJoQixNQUFBLGtDQUFNO0NBbkZQLEVBZ0VpQjs7Q0FoRWpCLEVBdUZnQixNQUFHLEtBQW5CO0NBRUMsT0FBQSxJQUFBO0NBQUEsRUFGa0IsQ0FBRCxLQUVqQjtDQUFBLEdBQUEsS0FBQSxtQ0FBTTtDQUFOLEVBRUksQ0FBSixJQUFBLEtBQUE7Q0FGQSxHQUlBLHNCQUFBO0FBRU8sQ0FBUCxHQUFBLElBQUEsT0FBc0I7Q0FDckIsV0FBQTtNQVBEO0NBQUEsRUFVeUIsQ0FBekIsTUFBeUIsS0FBZ0IsTUFBekM7QUFFTyxDQUFQLEdBQUEsaUJBQUE7Q0FDQyxXQUFBO01BYkQ7Q0FBQSxDQWVBLENBQXVDLENBQXZDLEtBQXdDLEVBQXhDLFVBQXNCO0NBQ3JCLENBQXdCLENBQXhCLENBQTRCLEVBQTVCLFlBQUE7Q0FBQSxFQUVhLENBQUksQ0FBaEIsQ0FBRCxHQUFBO0NBS0MsRUFBRyxDQUFKLENBQUMsUUFBRCxDQUFBO0NBQ0MsQ0FBcUIsQ0FBSyxDQUFJLEVBQVQsRUFBckIsVUFBQTtDQVRxQyxPQVF0QztDQVJELElBQXVDO0NBZnZDLEVBMEIyQixDQUEzQixNQUEyQixNQUFnQixPQUEzQztDQTFCQSxDQTJCQSxDQUF5QyxDQUF6QyxLQUEwQyxFQUExQyxZQUF3QjtDQUV2QixFQUFBLE9BQUE7Q0FBQSxFQUE4QixDQUFWLEVBQXBCLFNBQWU7Q0FBZixLQUNBLFFBQUEsQ0FBZTtDQURmLEVBR0EsQ0FBMEIsRUFBMUIsU0FBcUI7Q0FFcEIsQ0FBOEIsQ0FBM0IsQ0FBSixDQUFDLFFBQUQ7Q0FQRCxJQUF5QztDQTNCekMsQ0FBQSxDQW9DYSxDQUFiLEtBQUE7Q0FwQ0EsR0FxQ0EsS0FBVSxDQUFNLE1BQUE7Q0FyQ2hCLEdBc0NBLEtBQVUsQ0FBTSxNQUFBO0NBdENoQixHQXVDQSxLQUFVLENBQU0sTUFBQTtDQUNmLEdBQUEsS0FBUyxDQUFNLENBQWhCLElBQWdCO0NBaklqQixFQXVGZ0I7O0NBdkZoQixFQXNJNEIsTUFBQSxpQkFBNUI7Q0FFQyxHQUFBLElBQUEsT0FBa0I7Q0FFakIsRUFBOEIsQ0FBN0IsRUFBRCxFQUFTLFFBQWlCO0NBQ3pCLEVBQXdCLENBQXhCLElBQVEsR0FBWSxFQUFyQjtNQUhEO0NBTUMsR0FBRyxFQUFILEVBQVksS0FBWixHQUE2QjtDQUM1QixFQUE4QixDQUE3QixJQUFELFFBQTBCO1FBRDNCO0NBR0EsR0FBRyxFQUFILEVBQVksR0FBWSxFQUF4QjtDQUNFLEVBQXdCLENBQXhCLElBQVEsR0FBWSxJQUFyQjtRQVZGO01BRjJCO0NBdEk1QixFQXNJNEI7O0NBdEk1QixFQXdKa0IsTUFBQSxPQUFsQjtDQUVDLE9BQUEsR0FBQTtPQUFBLEtBQUE7Q0FBQSxHQUFBLHdDQUFBO0NBQUEsRUFDSSxDQUFKLE9BQUEsRUFBQTs7Q0FFd0IsRUFBeEIsQ0FBc0IsT0FBdEI7TUFIQTs7Q0FJMEIsRUFBMUIsRUFBd0IsTUFBeEI7TUFKQTtDQUtNLENBQUcsQ0FBQSxFQUFULElBQVMsRUFBVDtDQUFhLElBQUEsUUFBRCxhQUFBO0NBQVosSUFBUztDQS9KVixFQXdKa0I7O0NBeEpsQixFQW1LYSxNQUFBLENBQWI7Q0FDSyxFQUFELENBQUssSUFBUixHQUFBLENBQUE7Q0FwS0QsRUFtS2E7O0NBbktiLEVBdUtZLE1BQVo7Q0FHQyxPQUFBLFlBQUE7Q0FBQTtDQUFBLFFBQUEsa0NBQUE7dUJBQUE7Q0FDQyxHQUFJLEVBQUosU0FBQTtDQURELElBQUE7Q0FBQSxHQUdBLHFCQUFBO0NBSEEsR0FPQSxxQkFBQTtDQVBBLEdBU0EsY0FBQTtDQVRBLEdBWUEsVUFBQTtDQUdJLEVBQUQsQ0FBSyxPQUFSLENBQUE7Q0F6TEQsRUF1S1k7O0NBdktaLEVBNkwyQixNQUFBLGdCQUEzQjtDQUdDLEVBQXNCLENBQXRCLElBQUEsQ0FBVSxLQUFvQztDQUE5QyxFQUNtQixDQUFuQixDQUFBLEdBQTRCLENBQWxCLEVBQThCO0NBRHhDLEVBR3dCLENBQXhCLElBQWlDLENBQXZCLENBQVYsTUFBa0QsQ0FBMUI7Q0FIeEIsRUFJb0IsQ0FBcEIsRUFBQSxFQUE2QixDQUFuQixFQUErQixNQUFyQjtDQUpwQixDQU0yQyxDQUEzQyxDQUFBLEVBQUEsRUFBb0QsQ0FBd0IsRUFBNUUsMEJBQUE7Q0FOQSxFQU9vQixDQUFwQixFQUFBLEVBQTZCLENBQW5CLEVBQStCLE1BQXJCO0NBR3BCLEdBQUEsK0JBQUE7Q0FDQyxFQUFvQixDQUFuQixFQUFELEdBQVUsTUFBeUI7TUFYcEM7Q0FZQSxFQUF1QixDQUF2QixFQUFHLEdBQVU7Q0FDWCxFQUFrQixDQUFsQixDQUFELElBQVUsSUFBVjtNQWhCeUI7Q0E3TDNCLEVBNkwyQjs7Q0E3TDNCLEVBZ040QixNQUFBLGdCQUE1QjtDQUVDLEdBQUEsSUFBQTtDQUFBLEVBQUksQ0FBSixJQUFBO0NBQUEsRUFDSSxDQUFKLEtBREE7Q0FBQSxDQUdpQyxDQUFqQyxDQUFBLEVBQVEsWUFBUjtDQUhBLENBSXdDLENBQXhDLENBQUEsU0FBZSxLQUFmO0NBRUEsR0FBQSxJQUFBO0NBQ0MsR0FBQSxFQUFBLEVBQVU7Q0FBVixFQUNBLEdBQUEsRUFBQSxNQUFnQjtNQVJqQjtDQVVBLEdBQUEsQ0FBQTtDQUNDLEdBQUEsQ0FBTyxDQUFQO0NBQ0MsRUFBRCxDQUFtQixDQUFELE1BQUwsRUFBYixHQUFrQjtNQWRRO0NBaE41QixFQWdONEI7O0NBaE41QixFQWlPbUIsTUFBRSxPQUFyQjtDQUNDLE9BQUEsZUFBQTtDQUFBLEVBQVUsQ0FBVixHQUFBO0NBQUEsRUFDYSxDQUFiLE1BQUE7Q0FEQSxDQUVBLENBQVMsQ0FBVCxFQUFTLENBQUE7Q0FFVCxDQUFPLENBQUcsSUFBSCxHQUFBLENBQUE7Q0F0T1IsRUFpT21COztDQWpPbkIsRUF3T29CLE1BQUEsU0FBcEI7Q0FDQyxHQUFBLElBQUE7Q0FBQSxFQUFJLENBQUosRUFBQSxFQUFhO0NBQWIsRUFDSSxDQUFKLENBQW1CLENBRG5CLEVBQ2E7Q0FLYixFQUFPLENBQVA7Q0FDRSxFQUFHLENBQUgsT0FBRCxFQUFBLE9BQUE7TUFERDtDQUdFLEVBQUcsQ0FBSCxJQUFELEtBQUEsT0FBQTtNQVZrQjtDQXhPcEIsRUF3T29COztDQXhPcEIsRUF1UGdCLE1BQUEsS0FBaEI7Q0FDQyxPQUFBLElBQUE7Q0FBQSxDQUF3QixDQUF4QixDQUFBLEtBQUEsU0FBQTtDQWFJLENBQXNCLENBQXZCLENBQUssQ0FBa0IsR0FBQSxDQUExQixFQUFBO0NBRUMsQ0FBZ0MsQ0FBaEMsR0FBQSxFQUF3QyxTQUF4QyxTQUFBO0NBQ0EsR0FBRyxDQUFILENBQUE7Q0FDQyxDQUFvQyxDQUFwQyxFQUF5QyxHQUF6QyxFQUFBLG9CQUFBO0NBQ0EsYUFBQTtRQUhEO0NBS2dCLFlBQWhCLEVBQWUsQ0FBZjtDQVBELElBQTBCO0NBclEzQixFQXVQZ0I7O0NBdlBoQjs7Q0FEc0MifX0seyJvZmZzZXQiOnsibGluZSI6MTM4MjMsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9yb29tLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJMICAgICAgICAgICAgICAgPSByZXF1aXJlICdhcGkvbG9vcGNhc3QvbG9vcGNhc3QnXG5uYXZpZ2F0aW9uICAgICAgPSByZXF1aXJlICdhcHAvY29udHJvbGxlcnMvbmF2aWdhdGlvbidcblN0cmluZ3MgICAgICAgICA9IHJlcXVpcmUgJ2FwcC91dGlscy9zdHJpbmcnXG51c2VyX2NvbnRyb2xsZXIgPSByZXF1aXJlICdhcHAvY29udHJvbGxlcnMvdXNlcidcbm5vdGlmeSAgICAgICAgICA9IHJlcXVpcmUgJ2FwcC9jb250cm9sbGVycy9ub3RpZnknXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUm9vbVxuXG5cdGNvbnN0cnVjdG9yOiAoIEBkb20gKSAtPlxuXHRcdHZpZXcub25jZSAnYmluZGVkJywgQG9uX3ZpZXdfYmluZGVkXG5cdFx0dXNlcl9jb250cm9sbGVyLm9uICd1c2VyOmxvZ2dlZCcsIEBvbl91c2VyX2xvZ2dlZFxuXHRcdHVzZXJfY29udHJvbGxlci5vbiAndXNlcjp1bmxvZ2dlZCcsIEBvbl91c2VyX3VubG9nZ2VkXG5cblx0XHRAZWxlbWVudHMgPSBcblx0XHRcdHRpdGxlICAgICAgIDogQGRvbS5maW5kICcuY292ZXIgLm5hbWUnXG5cdFx0XHRnZW5yZSAgICAgICA6IEBkb20uZmluZCAnLmNvdmVyIC5nZW5yZXMnXG5cdFx0XHRsb2NhdGlvbiAgICA6IEBkb20uZmluZCAnLmNvdmVyIC5sb2NhdGlvbidcblx0XHRcdGNvdmVyICAgICAgIDogQGRvbS5maW5kICcuY292ZXIgLmNvdmVyX2ltYWdlJ1xuXHRcdFx0ZGVzY3JpcHRpb24gOiBAZG9tLmZpbmQgJy5jaGF0X2hlYWRlciBwJ1xuXG5cdFx0aWYgU3RyaW5ncy5pc19lbXB0eSggQGVsZW1lbnRzLnRpdGxlLmh0bWwoKSApXG5cdFx0XHRAZWxlbWVudHMudGl0bGUuYWRkQ2xhc3MgJ2hpZGRlbidcblxuXHRcdGlmIFN0cmluZ3MuaXNfZW1wdHkoIEBlbGVtZW50cy5nZW5yZS5odG1sKCkgKVxuXHRcdFx0QGVsZW1lbnRzLmdlbnJlLmFkZENsYXNzICdoaWRkZW4nXG5cblx0XHRpZiBTdHJpbmdzLmlzX2VtcHR5KCBAZWxlbWVudHMubG9jYXRpb24uaHRtbCgpIClcblx0XHRcdEBlbGVtZW50cy5sb2NhdGlvbi5hZGRDbGFzcyAnaGlkZGVuJ1xuXG5cblxuXHRvbl92aWV3X2JpbmRlZDogKCApID0+XG5cdFx0QG1vZGFsID0gdmlldy5nZXRfYnlfZG9tICcjcm9vbV9tb2RhbCdcblx0XHRAbW9kYWwub24gJ2lucHV0OmNoYW5nZWQnLCBAb25faW5wdXRfY2hhbmdlZFxuXHRcdEBtb2RhbC5vbiAnc3VibWl0JywgQG9uX21vZGFsX3N1Ym1pdFxuXG5cdFx0aWYgQGlzX2NyZWF0ZV9wYWdlKClcblx0XHRcdEBtb2RhbC5vcGVuKClcblxuXHRcdCMgY2hlY2sgaWYgaXQncyBndWVzdCBvbmxvYWRcblx0XHRAY2hlY2tfZ3Vlc3QoKVxuXG5cdFx0QHBsYXllciA9IHZpZXcuZ2V0X2J5X2RvbSAnI3BsYXllcidcblxuXHRcdGlmIEBpc19ndWVzdCgpXG5cdFx0XHR1c2VyID0gbG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoICcvJyApWzFdXG5cblx0XHRcdEBwbGF5ZXIucGxheSggdXNlciApXG5cdFx0XG5cblx0b25faW5wdXRfY2hhbmdlZDogKCBkYXRhICkgPT5cblx0XHRzd2l0Y2ggZGF0YS5uYW1lXG5cdFx0XHR3aGVuICd0aXRsZScsICdnZW5yZScsICdsb2NhdGlvbicsICdkZXNjcmlwdGlvbidcblx0XHRcdFx0QGVsZW1lbnRzWyBkYXRhLm5hbWUgXS5odG1sIGRhdGEudmFsdWVcblxuXHRcdFx0XHRpZiBkYXRhLnZhbHVlLmxlbmd0aCA+IDBcblx0XHRcdFx0XHRAZWxlbWVudHNbIGRhdGEubmFtZSBdLnJlbW92ZUNsYXNzICdoaWRkZW4nXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRAZWxlbWVudHNbIGRhdGEubmFtZSBdLmFkZENsYXNzICdoaWRkZW4nXG5cdFx0XHR3aGVuICdjb3Zlcidcblx0XHRcdFx0QGVsZW1lbnRzWyBkYXRhLm5hbWUgXS5jc3Ncblx0XHRcdFx0XHQnYmFja2dyb3VuZC1pbWFnZSc6IFwidXJsKCN7ZGF0YS52YWx1ZS5zZWN1cmVfdXJsfSlcIlxuXG5cblx0b25fbW9kYWxfc3VibWl0OiAoIGRhdGEgKSA9PlxuXHRcdGxvZyBcIltSb29tXSBvbl9tb2RhbF9zdWJtaXRcIiwgZGF0YVxuXG5cdFx0QG1vZGFsLmhpZGVfbWVzc2FnZSgpXG5cdFx0QG1vZGFsLnNob3dfbG9hZGluZygpXG5cblx0XHRtID0gQG1vZGFsXG5cblx0XHRyZWYgPSBAXG5cdFx0TC5yb29tcy5jcmVhdGUgZGF0YSwgKCBlcnJvciwgZGF0YSApIC0+XG5cblx0XHRcdGlmIGVycm9yP1xuXG5cdFx0XHRcdG5vdGlmeS5lcnJvciBlcnJvci5yZXNwb25zZUpTT04ubWVzc2FnZVxuXG5cdFx0XHRcdG0uaGlkZV9sb2FkaW5nKClcblxuXHRcdFx0XHRyZXR1cm4gZmFsc2VcblxuXHRcdFx0ZGVsYXkgMTAwMCwgPT5cblxuXHRcdFx0XHQjIGFwcGVuZHMgcm9vbV9pZCB0byBib2R5IGluIG9yZGVyIHRvIGJlIGNvbXBhdGlibGUgd2l0aCBcblx0XHRcdFx0IyBzZXJ2ZXIgc2lkZSByZW5kZXJlZCB0ZW1wbGF0ZVxuXHRcdFx0XHRoaWRkZW4gPSBcIjxpbnB1dCB0eXBlPSdoaWRkZW4nIGlkPSdyb29tX2lkJyB2YWx1ZT0nI3tkYXRhLl9pZH0nPlwiXG5cdFx0XHRcdCQoICdib2R5JyApLmFwcGVuZCBoaWRkZW5cblxuXHRcdFx0XHRuYXZpZ2F0aW9uLmdvX3NpbGVudCBcIi8je2RhdGEuaW5mby51c2VyfS8je2RhdGEuaW5mby5zbHVnfVwiXG5cblx0XHRcdFx0cmVmLmNoZWNrX2d1ZXN0KClcblxuXHRcdFx0XHRtLmNsb3NlKClcblxuXHRcdFx0XHQkKCAnLmNyZWF0ZV9yb29tX2l0ZW0nICkucmVtb3ZlQ2xhc3MgJ3NlbGVjdGVkJ1xuXG5cdG9uX3VzZXJfbG9nZ2VkOiAoIGRhdGEgKSA9PlxuXHRcdEBjaGVja19ndWVzdCgpXG5cblx0b25fdXNlcl91bmxvZ2dlZDogKCBkYXRhICkgPT5cblx0XHRAY2hlY2tfZ3Vlc3QoKVxuXG5cblx0Y2hlY2tfZ3Vlc3Q6ICggKSAtPlxuXG5cdFx0IyMjXG5cdFx0SWYgdGhlIHVybCBwYXRoIHN0YXJ0cyB3aXRoIC91c2VybmFtZSwgXG5cdFx0dGhlbiB0aGUgdXNlciBpcyBub3QgYSBndWVzdFxuXHRcdCMjI1xuXHRcdGlmIEBpc19ndWVzdCgpXG5cdFx0XHRhcHAuYm9keS5hZGRDbGFzcyAnZ3Vlc3QnXG5cdFx0ZWxzZVxuXHRcdFx0YXBwLmJvZHkucmVtb3ZlQ2xhc3MgJ2d1ZXN0J1x0XHRcblx0XHRcdGFwcGNhc3QuY29ubmVjdCgpXG5cblx0aXNfZ3Vlc3Q6IC0+XG5cdFx0dSA9IHVzZXJfY29udHJvbGxlci5kYXRhXG5cdFx0Z3Vlc3QgPSBsb2NhdGlvbi5wYXRobmFtZS5pbmRleE9mKCBcIi8je3UudXNlcm5hbWV9XCIgKSBpc250IDBcblxuXHRpc19jcmVhdGVfcGFnZTogKCApIC0+XG5cdFx0bG9jYXRpb24ucGF0aG5hbWUgaXMgJy9yb29tcy9jcmVhdGUnXG5cblx0ZGVzdHJveTogLT5cblx0XHR1c2VyX2NvbnRyb2xsZXIub2ZmICd1c2VyOmxvZ2dlZCcsIEBvbl91c2VyX2xvZ2dlZFxuXHRcdHVzZXJfY29udHJvbGxlci5vZmYgJ3VzZXI6dW5sb2dnZWQnLCBAb25fdXNlcl91bmxvZ2dlZFxuXG5cdFx0XG5cdFx0XG5cdFx0Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsaURBQUE7R0FBQSwrRUFBQTs7QUFBQSxDQUFBLEVBQWtCLElBQUEsZ0JBQUE7O0FBQ2xCLENBREEsRUFDa0IsSUFBQSxHQUFsQixrQkFBa0I7O0FBQ2xCLENBRkEsRUFFa0IsSUFBbEIsV0FBa0I7O0FBQ2xCLENBSEEsRUFHa0IsSUFBQSxRQUFsQixPQUFrQjs7QUFDbEIsQ0FKQSxFQUlrQixHQUFsQixDQUFrQixpQkFBQTs7QUFFbEIsQ0FOQSxFQU11QixHQUFqQixDQUFOO0NBRWMsQ0FBQSxDQUFBLFdBQUc7Q0FDZixFQURlLENBQUQ7Q0FDZCwwREFBQTtDQUFBLHNEQUFBO0NBQUEsd0RBQUE7Q0FBQSwwREFBQTtDQUFBLHNEQUFBO0NBQUEsQ0FBb0IsRUFBcEIsSUFBQSxNQUFBO0NBQUEsQ0FDQSxFQUFBLFNBQUEsQ0FBQSxDQUFlO0NBRGYsQ0FFQSxFQUFBLFdBQWUsQ0FBZjtDQUZBLEVBS0MsQ0FERCxJQUFBO0NBQ0MsQ0FBYyxDQUFJLENBQUgsQ0FBZixDQUFBLFFBQWM7Q0FBZCxDQUNjLENBQUksQ0FBSCxDQUFmLENBQUEsVUFBYztDQURkLENBRWMsQ0FBSSxDQUFILEVBQWYsRUFBQSxVQUFjO0NBRmQsQ0FHYyxDQUFJLENBQUgsQ0FBZixDQUFBLGVBQWM7Q0FIZCxDQUljLENBQUksQ0FBSCxFQUFmLEtBQUEsS0FBYztDQVRmLEtBQUE7Q0FXQSxHQUFBLENBQW9DLEVBQTFCLENBQVA7Q0FDRixHQUFDLENBQWMsQ0FBZixFQUFTO01BWlY7Q0FjQSxHQUFBLENBQW9DLEVBQTFCLENBQVA7Q0FDRixHQUFDLENBQWMsQ0FBZixFQUFTO01BZlY7Q0FpQkEsR0FBQSxHQUFVLENBQVA7Q0FDRixHQUFDLEVBQUQsRUFBUztNQW5CRTtDQUFiLEVBQWE7O0NBQWIsRUF1QmdCLE1BQUEsS0FBaEI7Q0FDQyxHQUFBLElBQUE7Q0FBQSxFQUFTLENBQVQsQ0FBQSxLQUFTLEdBQUE7Q0FBVCxDQUNBLEVBQUEsQ0FBTSxVQUFOLENBQUE7Q0FEQSxDQUVBLEVBQUEsQ0FBTSxHQUFOLE9BQUE7Q0FFQSxHQUFBLFVBQUc7Q0FDRixHQUFDLENBQUssQ0FBTjtNQUxEO0NBQUEsR0FRQSxPQUFBO0NBUkEsRUFVVSxDQUFWLEVBQUEsR0FBVSxDQUFBO0NBRVYsR0FBQSxJQUFHO0NBQ0YsRUFBTyxDQUFQLENBQU8sQ0FBUCxFQUFlO0NBRWQsR0FBQSxFQUFNLE9BQVA7TUFoQmM7Q0F2QmhCLEVBdUJnQjs7Q0F2QmhCLEVBMENrQixDQUFBLEtBQUUsT0FBcEI7Q0FDQyxHQUFXLFFBQUo7Q0FBUCxNQUFBLElBQ007Q0FETixNQUFBLElBQ2U7Q0FEZixTQUFBLENBQ3dCO0NBRHhCLFVBQ29DLEVBRHBDO0NBRUUsR0FBQyxDQUFELEdBQUE7Q0FFQSxFQUF1QixDQUFwQixDQUFVLENBQVYsRUFBSDtDQUNFLEdBQUEsSUFBVSxHQUFYLE1BQUE7TUFERCxJQUFBO0NBR0UsR0FBQSxJQUFVLFNBQVg7VUFQSDtDQUNvQztDQURwQyxNQUFBLElBUU07Q0FDSCxFQUFELENBQUMsSUFBVSxPQUFYO0NBQ0MsQ0FBcUIsQ0FBSyxDQUFJLENBQU0sQ0FBZixJQUFyQixRQUFBO0NBVkgsU0FTRTtDQVRGLElBRGlCO0NBMUNsQixFQTBDa0I7O0NBMUNsQixFQXdEaUIsQ0FBQSxLQUFFLE1BQW5CO0NBQ0MsS0FBQSxFQUFBO0NBQUEsQ0FBOEIsQ0FBOUIsQ0FBQSxvQkFBQTtDQUFBLEdBRUEsQ0FBTSxPQUFOO0NBRkEsR0FHQSxDQUFNLE9BQU47Q0FIQSxFQUtJLENBQUosQ0FMQTtDQUFBLEVBT0EsQ0FBQTtDQUNDLENBQW9CLENBQUEsQ0FBckIsQ0FBTyxDQUFQLEdBQXVCLEVBQXZCO0NBRUMsU0FBQSxFQUFBO0NBQUEsR0FBRyxFQUFILE9BQUE7Q0FFQyxJQUFBLENBQU0sQ0FBTixDQUFBLElBQStCO0NBQS9CLE9BRUEsSUFBQTtDQUVBLElBQUEsVUFBTztRQU5SO0NBUU0sQ0FBTSxDQUFBLENBQVosQ0FBQSxJQUFZLElBQVo7Q0FJQyxLQUFBLE1BQUE7Q0FBQSxFQUFVLENBQThDLEVBQXhELEVBQUEsbUNBQVU7Q0FBVixLQUNBLEVBQUE7Q0FEQSxFQUdzQixDQUFNLElBQTVCLENBQUEsQ0FBVTtDQUhWLEVBS0csS0FBSCxHQUFBO0NBTEEsSUFPQSxHQUFBO0NBRUEsU0FBQSxDQUFBLElBQUEsSUFBQTtDQWJELE1BQVk7Q0FWYixJQUFxQjtDQWpFdEIsRUF3RGlCOztDQXhEakIsRUEwRmdCLENBQUEsS0FBRSxLQUFsQjtDQUNFLEdBQUEsT0FBRDtDQTNGRCxFQTBGZ0I7O0NBMUZoQixFQTZGa0IsQ0FBQSxLQUFFLE9BQXBCO0NBQ0UsR0FBQSxPQUFEO0NBOUZELEVBNkZrQjs7Q0E3RmxCLEVBaUdhLE1BQUEsRUFBYjtDQUVDOzs7O0NBQUE7Q0FJQSxHQUFBLElBQUc7Q0FDRSxFQUFELENBQUssR0FBUixDQUFBLEtBQUE7TUFERDtDQUdDLEVBQUcsQ0FBSyxFQUFSLENBQUEsSUFBQTtDQUNRLE1BQUQsTUFBUDtNQVZXO0NBakdiLEVBaUdhOztDQWpHYixFQTZHVSxLQUFWLENBQVU7Q0FDVCxPQUFBO0NBQUEsRUFBSSxDQUFKLFdBQW1CO0NBQ0YsRUFBVCxFQUFSLEVBQVEsQ0FBUSxHQUFoQjtDQS9HRCxFQTZHVTs7Q0E3R1YsRUFpSGdCLE1BQUEsS0FBaEI7Q0FDVSxJQUFZLEdBQWIsR0FBUjtDQWxIRCxFQWlIZ0I7O0NBakhoQixFQW9IUyxJQUFULEVBQVM7Q0FDUixDQUFtQyxDQUFuQyxDQUFBLFNBQUEsQ0FBQSxDQUFlO0NBQ0MsQ0FBcUIsQ0FBckMsQ0FBc0MsT0FBdEMsSUFBZSxDQUFmO0NBdEhELEVBb0hTOztDQXBIVDs7Q0FSRCJ9fSx7Im9mZnNldCI6eyJsaW5lIjoxMzk3MCwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL3Jvb20vZGFzaGJvYXJkLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyIjIGFwcGNhc3QgPSByZXF1aXJlICdhcHAvdXRpbHMvYXBwY2FzdCdcblxubW9kdWxlLmV4cG9ydHMgPSAoZG9tKSAtPlxuXG5cdHZvbHVtZSA9IFxuXHRcdGxlZnQgOiBudWxsXG5cdFx0cmlnaHQ6IG51bGxcblxuXG5cdGluaXQgPSAtPlxuXHRcdHZpZXcub25jZSAnYmluZGVkJywgb25fcmVhZHlcblxuXHRvbl9yZWFkeSA9IC0+XG5cdFx0YnJvYWRjYXN0X3RyaWdnZXIgPSB2aWV3LmdldF9ieV9kb20gZG9tLmZpbmQoICcuYnJvYWRjYXN0X2NvbnRyb2xzJyApXG5cdFx0cmVjb3JkaW5nX3RyaWdnZXIgPSB2aWV3LmdldF9ieV9kb20gZG9tLmZpbmQoICcucmVjb3JkaW5nX2NvbnRyb2xzJyApXG5cblx0XHRpZiBicm9hZGNhc3RfdHJpZ2dlci5sZW5ndGggPiAwIFxuXHRcdFx0YnJvYWRjYXN0X3RyaWdnZXIub24gJ2NoYW5nZScsIG9uX2Jyb2FkY2FzdF9jbGlja1xuXG5cdFx0dm9sdW1lLmxlZnQgPSB2aWV3LmdldF9ieV9kb20gZG9tLmZpbmQoICcubWV0ZXJfd3JhcHBlci5sZWZ0JyApXG5cdFx0dm9sdW1lLnJpZ2h0ID0gdmlldy5nZXRfYnlfZG9tIGRvbS5maW5kKCAnLm1ldGVyX3dyYXBwZXIucmlnaHQnIClcblxuXHRcdCMgRXhhbXBsZSBvZiBob3cgdG8gdXNlIHRoZSB2b2x1bWUgb2JqZWN0XG5cdFx0dm9sdW1lLmxlZnQuc2V0X3ZvbHVtZSAwLjdcblx0XHR2b2x1bWUucmlnaHQuc2V0X3ZvbHVtZSAwLjc4XG5cblx0XHRpbnB1dF9zZWxlY3QgPSB2aWV3LmdldF9ieV9kb20gZG9tLmZpbmQoICcuaW5wdXRfc2VsZWN0JyApXG5cdFx0aW5wdXRfc2VsZWN0Lm9uICdjaGFuZ2VkJywgKGRhdGEpIC0+XG5cdFx0XHRsb2cgXCJbRGFzaGJvYXJkXSBpbnB1dCBjaGFuZ2VkXCIsIGRhdGFcblxuXG5cblxuXHRvbl9icm9hZGNhc3RfY2xpY2sgPSAoZGF0YSkgLT5cblx0XHRsb2cgXCJvbl9icm9hZGNhc3RfY2xpY2tcIiwgZGF0YVxuXG5cdFx0aWYgZGF0YSBpcyBcInN0YXJ0XCJcblx0XHRcdCMgZG8gYXBwY2FzdC5zdGFydF9zdHJlYW1cblx0XHRlbHNlXG5cdFx0XHQjIGRvIGFwcGNhc3Quc3RvcF9zdHJlYW1cblxuXHRvbl9yZWNvcmRpbmdfY2xpY2sgPSAoZGF0YSkgLT5cblx0XHRsb2cgXCJvbl9yZWNvcmRpbmdfY2xpY2tcIiwgZGF0YVxuXG5cdFx0aWYgZGF0YSBpcyBcInN0YXJ0XCJcblx0XHRcdCMgZG8gYXBwY2FzdC5zdGFydF9yZWNvcmRpbmdcblx0XHRlbHNlXG5cdFx0XHQjIGRvIGFwcGNhc3Quc3RvcF9yZWNvcmRpbmdcblxuXG5cdGluaXQoKSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxDQUFPLEVBQVUsR0FBWCxDQUFOLEVBQWtCO0NBRWpCLEtBQUEsd0RBQUE7Q0FBQSxDQUFBLENBQ0MsR0FERDtDQUNDLENBQU8sRUFBUDtDQUFBLENBQ08sRUFBUCxDQUFBO0NBRkQsR0FBQTtDQUFBLENBS0EsQ0FBTyxDQUFQLEtBQU87Q0FDRCxDQUFlLEVBQWhCLElBQUosR0FBQTtDQU5ELEVBS087Q0FMUCxDQVFBLENBQVcsS0FBWCxDQUFXO0NBQ1YsT0FBQSwwQ0FBQTtDQUFBLEVBQW9CLENBQXBCLE1BQW9CLE9BQXBCLElBQW9DO0NBQXBDLEVBQ29CLENBQXBCLE1BQW9CLE9BQXBCLElBQW9DO0NBRXBDLEVBQThCLENBQTlCLEVBQUcsV0FBaUI7Q0FDbkIsQ0FBQSxJQUFBLEVBQUEsU0FBaUIsQ0FBakI7TUFKRDtDQUFBLEVBTWMsQ0FBZCxFQUFNLElBQVEsV0FBZ0I7Q0FOOUIsRUFPZSxDQUFmLENBQUEsQ0FBTSxJQUFTLFlBQWdCO0NBUC9CLEVBVUEsQ0FBQSxFQUFNLElBQU47Q0FWQSxHQVdBLENBQVksQ0FBTixJQUFOO0NBWEEsRUFhZSxDQUFmLE1BQWUsRUFBZixHQUErQjtDQUNsQixDQUFiLENBQTJCLENBQUEsS0FBM0IsRUFBQSxDQUFZO0NBQ1AsQ0FBNkIsQ0FBakMsQ0FBQSxTQUFBLGNBQUE7Q0FERCxJQUEyQjtDQXZCNUIsRUFRVztDQVJYLENBNkJBLENBQXFCLENBQUEsS0FBQyxTQUF0QjtDQUNDLENBQTBCLENBQTFCLENBQUEsZ0JBQUE7Q0FFQSxHQUFBLENBQVcsRUFBWDtDQUFBO01BQUE7Q0FBQTtNQUhvQjtDQTdCckIsRUE2QnFCO0NBN0JyQixDQXFDQSxDQUFxQixDQUFBLEtBQUMsU0FBdEI7Q0FDQyxDQUEwQixDQUExQixDQUFBLGdCQUFBO0NBRUEsR0FBQSxDQUFXLEVBQVg7Q0FBQTtNQUFBO0NBQUE7TUFIb0I7Q0FyQ3JCLEVBcUNxQjtDQVNyQixHQUFBLEtBQUE7Q0FoRGdCIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjE0MDE2LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3Mvcm9vbS9yb29tX21vZGFsLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJNb2RhbCA9IHJlcXVpcmUgJy4uL2NvbXBvbmVudHMvbW9kYWwnXG5cblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBSb29tTW9kYWwgZXh0ZW5kcyBNb2RhbFxuXG5cdGNvdmVyX3VwbG9hZGVkOiBcIlwiXG5cdGNvbnN0cnVjdG9yOiAoIEBkb20gKSAtPlxuXHRcdHN1cGVyIEBkb21cblxuXHRcdEB0aXRsZSA9IEBkb20uZmluZCAnLnJvb21uYW1lJ1xuXG5cdFx0XG5cdFx0XG5cdFx0QGxvY2F0aW9uID0gQGRvbS5maW5kICcubG9jYXRpb24nXG5cdFx0QGRlc2NyaXB0aW9uID0gQGRvbS5maW5kICcuZGVzY3JpcHRpb24nXG5cdFx0QG1lc3NhZ2UgPSBAZG9tLmZpbmQgJy5tZXNzYWdlJ1xuXG5cdFx0QHN1Ym1pdCA9IEBkb20uZmluZCAnLnN1Ym1pdF9idXR0b24nXG5cblx0XHR2aWV3Lm9uY2UgJ2JpbmRlZCcsIEBvbl92aWV3c19iaW5kZWRcblxuXHRvbl92aWV3c19iaW5kZWQ6ICggc2NvcGUgKSA9PlxuXHRcdHJldHVybiBpZiBub3Qgc2NvcGUubWFpblxuXG5cdFx0cm9vbV9pbWFnZV91cGxvYWRlciA9IHZpZXcuZ2V0X2J5X2RvbSBAZG9tLmZpbmQoICcucm9vbV9pbWFnZScgKVxuXG5cdFx0aWYgbm90IHJvb21faW1hZ2VfdXBsb2FkZXJcblx0XHRcdGxvZyBcIltyb29tcy9jcmVhdGVNb2RhbF0gdmlld3Mgbm90IGJpbmRlZCB5ZXQhISFcIlxuXHRcdFx0cmV0dXJuXG5cblx0XHQjIGxvZyBcIltSb29tIE1vZGFsXSByb29tX2ltYWdlX3VwbG9hZGVyXCIsIHJvb21faW1hZ2VfdXBsb2FkZXJcblxuXHRcdEBnZW5yZSA9IHZpZXcuZ2V0X2J5X2RvbSBAZG9tLmZpbmQoICcuZ2VucmUnIClcblxuXG5cdFx0cm9vbV9pbWFnZV91cGxvYWRlci5vbiAnY29tcGxldGVkJywgQF9vbl9jb3Zlcl9jaGFuZ2VkXG5cdFx0QHRpdGxlLm9uICdrZXl1cCcgICAgICAgICAgICAgICAgICwgQF9vbl90aXRsZV9jaGFuZ2VkXG5cdFx0QGxvY2F0aW9uLm9uICdrZXl1cCcgICAgICAgICAgICAgICwgQF9vbl9sb2NhdGlvbl9jaGFuZ2VkXG5cdFx0QGRlc2NyaXB0aW9uLm9uICdrZXl1cCcgICAgICAgICAgICwgQF9vbl9kZXNjcmlwdGlvbl9jaGFuZ2VkXG5cdFx0QGdlbnJlLm9uICdjaGFuZ2UnICAgICAgICAgICAgICAgICwgQF9vbl9nZW5yZV9jaGFuZ2VkXG5cdFx0QHN1Ym1pdC5vbiAnY2xpY2snICAgICAgICAgICAgICAgICwgQF9zdWJtaXRcblx0XHRcblxuXHRfb25fY292ZXJfY2hhbmdlZDogKGRhdGEpID0+XG5cdFx0QGNvdmVyX3VwbG9hZGVkID0gZGF0YS5yZXN1bHQudXJsXG5cdFx0QGVtaXQgJ2lucHV0OmNoYW5nZWQnLCB7IG5hbWU6ICdjb3ZlcicsIHZhbHVlOiBkYXRhLnJlc3VsdCB9XG5cblx0X29uX3RpdGxlX2NoYW5nZWQ6ICggKSA9PlxuXHRcdEBfY2hlY2tfbGVuZ3RoIEB0aXRsZVxuXHRcdEBlbWl0ICdpbnB1dDpjaGFuZ2VkJywgeyBuYW1lOiAndGl0bGUnLCB2YWx1ZTogQHRpdGxlLnZhbCgpIH1cblxuXHRfb25fZ2VucmVfY2hhbmdlZDogKCBkYXRhICkgPT5cblx0XHRsb2cgXCJfb25fZ2VucmVfY2hhbmdlZFwiLCBkYXRhXG5cdFx0QGVtaXQgJ2lucHV0OmNoYW5nZWQnLCB7IG5hbWU6ICdnZW5yZScsIHZhbHVlOiBkYXRhLmpvaW4oICcsICcgKSB9XG5cblx0X29uX2xvY2F0aW9uX2NoYW5nZWQ6ICggKSA9PlxuXHRcdEBlbWl0ICdpbnB1dDpjaGFuZ2VkJywgeyBuYW1lOiAnbG9jYXRpb24nLCB2YWx1ZTogQGxvY2F0aW9uLnZhbCgpIH1cblxuXHRfb25fZGVzY3JpcHRpb25fY2hhbmdlZDogKCApID0+XG5cdFx0QGVtaXQgJ2lucHV0OmNoYW5nZWQnLCB7IG5hbWU6ICdkZXNjcmlwdGlvbicsIHZhbHVlOiBAZGVzY3JpcHRpb24udmFsKCkgfVxuXG5cdF9jaGVja19sZW5ndGg6ICggZWwgKSAtPlxuXHRcdGlmIGVsLnZhbCgpLmxlbmd0aCA+IDBcblx0XHRcdGVsLnJlbW92ZUNsYXNzICdyZXF1aXJlZCdcblx0XHRlbHNlXG5cdFx0XHRlbC5hZGRDbGFzcyAncmVxdWlyZWQnXG5cblx0X3N1Ym1pdDogKCApID0+XG5cdFx0XG5cblx0XHQjIHF1aWNrIHZhbGlkYXRpb24gc2tldGNoXG5cdFx0aWYgbm90IEB0aXRsZS52YWwoKVxuXHRcdFx0QHRpdGxlLmFkZENsYXNzKCAncmVxdWlyZWQnICkuZm9jdXMoKVxuXHRcdFx0cmV0dXJuIFxuXG5cdFx0ZGF0YSA9IFxuXHRcdFx0dGl0bGUgICAgOiBAdGl0bGUudmFsKClcblx0XHRcdGdlbnJlcyAgIDogQGdlbnJlLmdldF90YWdzKCB0cnVlIClcblx0XHRcdGxvY2F0aW9uIDogQGxvY2F0aW9uLnZhbCgpXG5cdFx0XHRhYm91dCAgICA6IEBkZXNjcmlwdGlvbi52YWwoKVxuXHRcdFx0Y292ZXIgICAgOiBAY292ZXJfdXBsb2FkZWRcblxuXHRcdGxvZyBcIltDcmVhdGUgUm9vbV1zdWJtaXRcIiwgZGF0YVxuXG5cdFx0QGVtaXQgJ3N1Ym1pdCcsIGRhdGFcblxuXG5cdHNob3dfbWVzc2FnZTogKCBtc2cgKSAtPlxuXHRcdEBtZXNzYWdlLmh0bWwoIG1zZyApLnNob3coKVxuXG5cdGhpZGVfbWVzc2FnZTogKCApIC0+XG5cdFx0QG1lc3NhZ2UuaGlkZSgpXG5cblx0b3Blbl93aXRoX2RhdGE6ICggZGF0YSApIC0+XG5cdFx0bG9nIFwiW1Jvb21Nb2RhbF0gb3Blbl93aXRoX2RhdGFcIiwgZGF0YVxuXG5cdFx0QGRvbS5hZGRDbGFzcyAnZWRpdF9tb2RhbCdcblx0XHRAdGl0bGUudmFsIGRhdGEudGl0bGVcblx0XHRAZ2VucmUuYWRkX3RhZ3MgZGF0YS5nZW5yZXNcblx0XHQjIEBsb2NhdGlvbi52YWwgZGF0YS5sb2NhdGlvblxuXHRcdCMgQGRlc2NyaXB0aW9uLnZhbCBkYXRhLmFib3V0XG5cdFx0QGxvY2F0aW9uLmhpZGUoKVxuXHRcdEBkZXNjcmlwdGlvbi5oaWRlKClcblxuXHRcdEBvcGVuKClcblxuXHRcdHJldHVybiBmYWxzZVxuXG5cblx0ZGVzdHJveTogLT5cdFxuXHRcdEB0aXRsZS5vZmYgICAgICAgJ2tleXVwJyAgLCBAX29uX3RpdGxlX2NoYW5nZWRcblx0XHRAbG9jYXRpb24ub2ZmICAgICdrZXl1cCcgICwgQF9vbl9sb2NhdGlvbl9jaGFuZ2VkXG5cdFx0QGRlc2NyaXB0aW9uLm9mZiAna2V5dXAnICAsIEBfb25fZGVzY3JpcHRpb25fY2hhbmdlZFxuXHRcdEBnZW5yZS5vZmYgICAgICAgJ2NoYW5nZScgLCBAX29uX2dlbnJlX2NoYW5nZWRcblx0XHRAc3VibWl0Lm9mZiAgICAgICdjbGljaycgICwgQF9zdWJtaXRcblxuXHRcdEBnZW5yZSA9IG51bGxcblxuXHRcdHN1cGVyKClcblxuXG5cblx0XHRcblxuXG5cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFlBQUE7R0FBQTs7a1NBQUE7O0FBQUEsQ0FBQSxFQUFRLEVBQVIsRUFBUSxjQUFBOztBQUdSLENBSEEsRUFHdUIsR0FBakIsQ0FBTjtDQUVDOztDQUFBLENBQUEsQ0FBZ0IsV0FBaEI7O0NBQ2EsQ0FBQSxDQUFBLGdCQUFHO0NBQ2YsRUFEZSxDQUFEO0NBQ2Qsd0NBQUE7Q0FBQSx3RUFBQTtDQUFBLGtFQUFBO0NBQUEsNERBQUE7Q0FBQSw0REFBQTtDQUFBLDREQUFBO0NBQUEsd0RBQUE7Q0FBQSxFQUFBLENBQUEsdUNBQU07Q0FBTixFQUVTLENBQVQsQ0FBQSxNQUFTO0NBRlQsRUFNWSxDQUFaLElBQUEsR0FBWTtDQU5aLEVBT2UsQ0FBZixPQUFBLEdBQWU7Q0FQZixFQVFXLENBQVgsR0FBQSxHQUFXO0NBUlgsRUFVVSxDQUFWLEVBQUEsVUFBVTtDQVZWLENBWW9CLEVBQXBCLElBQUEsT0FBQTtDQWRELEVBQ2E7O0NBRGIsRUFnQmlCLEVBQUEsSUFBRSxNQUFuQjtDQUNDLE9BQUEsV0FBQTtBQUFjLENBQWQsR0FBQSxDQUFtQjtDQUFuQixXQUFBO01BQUE7Q0FBQSxFQUVzQixDQUF0QixNQUFzQixHQUFnQixNQUF0QztBQUVPLENBQVAsR0FBQSxlQUFBO0NBQ0MsRUFBQSxHQUFBLHVDQUFBO0NBQ0EsV0FBQTtNQU5EO0NBQUEsRUFVUyxDQUFULENBQUEsR0FBeUIsRUFBaEI7Q0FWVCxDQWFBLEVBQUEsT0FBQSxNQUFBLEVBQW1CO0NBYm5CLENBY0EsRUFBQSxDQUFNLEVBQU4sVUFBQTtDQWRBLENBZUEsRUFBQSxHQUFBLENBQVMsWUFBVDtDQWZBLENBZ0JBLEVBQUEsR0FBQSxJQUFZLFlBQVo7Q0FoQkEsQ0FpQkEsRUFBQSxDQUFNLEdBQU4sU0FBQTtDQUNDLENBQUQsRUFBQyxFQUFNLENBQVAsSUFBQTtDQW5DRCxFQWdCaUI7O0NBaEJqQixFQXNDbUIsQ0FBQSxLQUFDLFFBQXBCO0NBQ0MsRUFBa0IsQ0FBbEIsRUFBNkIsUUFBN0I7Q0FDQyxDQUFzQixFQUF0QixPQUFELElBQUE7Q0FBdUIsQ0FBUSxFQUFOLEVBQUEsQ0FBRjtDQUFBLENBQXdCLEVBQUksQ0FBWCxDQUFBO0NBRnRCLEtBRWxCO0NBeENELEVBc0NtQjs7Q0F0Q25CLEVBMENtQixNQUFBLFFBQW5CO0NBQ0MsR0FBQSxDQUFBLFFBQUE7Q0FDQyxDQUFzQixFQUF0QixPQUFELElBQUE7Q0FBdUIsQ0FBUSxFQUFOLEVBQUEsQ0FBRjtDQUFBLENBQXdCLENBQUEsQ0FBQyxDQUFSLENBQUE7Q0FGdEIsS0FFbEI7Q0E1Q0QsRUEwQ21COztDQTFDbkIsRUE4Q21CLENBQUEsS0FBRSxRQUFyQjtDQUNDLENBQXlCLENBQXpCLENBQUEsZUFBQTtDQUNDLENBQXNCLEVBQXRCLE9BQUQsSUFBQTtDQUF1QixDQUFRLEVBQU4sRUFBQSxDQUFGO0NBQUEsQ0FBd0IsRUFBSSxDQUFYLENBQUE7Q0FGdEIsS0FFbEI7Q0FoREQsRUE4Q21COztDQTlDbkIsRUFrRHNCLE1BQUEsV0FBdEI7Q0FDRSxDQUFzQixFQUF0QixPQUFELElBQUE7Q0FBdUIsQ0FBUSxFQUFOLEVBQUEsSUFBRjtDQUFBLENBQTJCLENBQUEsQ0FBQyxDQUFSLENBQUEsRUFBZ0I7Q0FEdEMsS0FDckI7Q0FuREQsRUFrRHNCOztDQWxEdEIsRUFxRHlCLE1BQUEsY0FBekI7Q0FDRSxDQUFzQixFQUF0QixPQUFELElBQUE7Q0FBdUIsQ0FBUSxFQUFOLEVBQUEsT0FBRjtDQUFBLENBQThCLENBQUEsQ0FBQyxDQUFSLENBQUEsS0FBbUI7Q0FEekMsS0FDeEI7Q0F0REQsRUFxRHlCOztDQXJEekIsQ0F3RGUsQ0FBQSxNQUFFLElBQWpCO0NBQ0MsQ0FBSyxDQUFGLENBQUgsRUFBRztDQUNDLENBQUQsUUFBRixDQUFBLEVBQUE7TUFERDtDQUdJLENBQUQsTUFBRixFQUFBLEdBQUE7TUFKYTtDQXhEZixFQXdEZTs7Q0F4RGYsRUE4RFMsSUFBVCxFQUFTO0NBSVIsR0FBQSxJQUFBO0FBQU8sQ0FBUCxFQUFPLENBQVAsQ0FBYTtDQUNaLEdBQUMsQ0FBSyxDQUFOLEVBQUEsRUFBQTtDQUNBLFdBQUE7TUFGRDtDQUFBLEVBS0MsQ0FERDtDQUNDLENBQVcsQ0FBQSxDQUFDLENBQVosQ0FBQTtDQUFBLENBQ1csRUFBQyxDQUFLLENBQWpCLEVBQVc7Q0FEWCxDQUVXLENBQUEsQ0FBQyxFQUFaLEVBQUE7Q0FGQSxDQUdXLENBQUEsQ0FBQyxDQUFaLENBQUEsS0FBdUI7Q0FIdkIsQ0FJVyxFQUFDLENBQVosQ0FBQSxRQUpBO0NBTEQsS0FBQTtDQUFBLENBVzJCLENBQTNCLENBQUEsaUJBQUE7Q0FFQyxDQUFlLEVBQWYsSUFBRCxHQUFBO0NBL0VELEVBOERTOztDQTlEVCxFQWtGYyxNQUFFLEdBQWhCO0NBQ0UsRUFBRCxDQUFDLEdBQU8sSUFBUjtDQW5GRCxFQWtGYzs7Q0FsRmQsRUFxRmMsTUFBQSxHQUFkO0NBQ0UsR0FBQSxHQUFPLElBQVI7Q0F0RkQsRUFxRmM7O0NBckZkLEVBd0ZnQixDQUFBLEtBQUUsS0FBbEI7Q0FDQyxDQUFrQyxDQUFsQyxDQUFBLHdCQUFBO0NBQUEsRUFFSSxDQUFKLElBQUEsSUFBQTtDQUZBLEVBR0EsQ0FBQSxDQUFNO0NBSE4sR0FJQSxDQUFNLENBQU4sRUFBQTtDQUpBLEdBT0EsSUFBUztDQVBULEdBUUEsT0FBWTtDQVJaLEdBVUE7Q0FFQSxJQUFBLE1BQU87Q0FyR1IsRUF3RmdCOztDQXhGaEIsRUF3R1MsSUFBVCxFQUFTO0NBQ1IsQ0FBNEIsQ0FBNUIsQ0FBQSxDQUFNLEVBQU4sVUFBQTtDQUFBLENBQzRCLENBQTVCLENBQUEsR0FBQSxDQUFTLFlBQVQ7Q0FEQSxDQUU0QixDQUE1QixDQUFBLEdBQUEsSUFBWSxZQUFaO0NBRkEsQ0FHNEIsQ0FBNUIsQ0FBQSxDQUFNLEdBQU4sU0FBQTtDQUhBLENBSTRCLENBQTVCLENBQUEsRUFBTyxDQUFQO0NBSkEsRUFNUyxDQUFULENBQUE7Q0FQUSxVQVNSLDBCQUFBO0NBakhELEVBd0dTOztDQXhHVDs7Q0FGd0MifX1dfQ==
*/})()