
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
 * Isotope v2.1.1
 * Filter & sort magical layouts
 * http://isotope.metafizzy.co
 */

( function( window ) {

'use strict';

// -------------------------- vars -------------------------- //

var jQuery = window.jQuery;

// -------------------------- helpers -------------------------- //

// extend objects
function extend( a, b ) {
  for ( var prop in b ) {
    a[ prop ] = b[ prop ];
  }
  return a;
}

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

var objToString = Object.prototype.toString;
function isArray( obj ) {
  return objToString.call( obj ) === '[object Array]';
}

// index of helper cause IE8
var indexOf = Array.prototype.indexOf ? function( ary, obj ) {
    return ary.indexOf( obj );
  } : function( ary, obj ) {
    for ( var i=0, len = ary.length; i < len; i++ ) {
      if ( ary[i] === obj ) {
        return i;
      }
    }
    return -1;
  };

// turn element or nodeList into an array
function makeArray( obj ) {
  var ary = [];
  if ( isArray( obj ) ) {
    // use object if already an array
    ary = obj;
  } else if ( obj && typeof obj.length === 'number' ) {
    // convert nodeList to array
    for ( var i=0, len = obj.length; i < len; i++ ) {
      ary.push( obj[i] );
    }
  } else {
    // array of single index
    ary.push( obj );
  }
  return ary;
}

function removeFrom( obj, ary ) {
  var index = indexOf( ary, obj );
  if ( index !== -1 ) {
    ary.splice( index, 1 );
  }
}

// -------------------------- isotopeDefinition -------------------------- //

// used for AMD definition and requires
function isotopeDefinition( Outlayer, getSize, matchesSelector, Item, LayoutMode ) {
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
      extend( Mode.options, initialOpts ) : initialOpts;
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
    if ( typeof filter === 'function' ) {
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
      elems = makeArray( elems );
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
      if ( typeof sorter !== 'string' ) {
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
    if ( sortByOpt !== this.sortHistory[0] ) {
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
    elems = makeArray( elems );
    var removeItems = this.getItems( elems );
    // do regular thing
    _remove.call( this, elems );
    // bail if no items to remove
    if ( !removeItems || !removeItems.length ) {
      return;
    }
    // remove elems from filteredItems
    for ( var i=0, len = removeItems.length; i < len; i++ ) {
      var item = removeItems[i];
      // remove item from collection
      removeFrom( item, this.filteredItems );
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
}

// -------------------------- transport -------------------------- //

if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( [
      'outlayer/outlayer',
      'get-size/get-size',
      'matches-selector/matches-selector',
      './item',
      './layout-mode',
      // include default layout modes
      './layout-modes/masonry',
      './layout-modes/fit-rows',
      './layout-modes/vertical'
    ],
    isotopeDefinition );
} else if ( typeof exports === 'object' ) {
  // CommonJS
  module.exports = isotopeDefinition(
    require('outlayer'),
    require('get-size'),
    require('desandro-matches-selector'),
    require('./item'),
    require('./layout-mode'),
    // include default layout modes
    require('./layout-modes/masonry'),
    require('./layout-modes/fit-rows'),
    require('./layout-modes/vertical')
  );
} else {
  // browser global
  window.Isotope = isotopeDefinition(
    window.Outlayer,
    window.getSize,
    window.matchesSelector,
    window.Isotope.Item,
    window.Isotope.LayoutMode
  );
}

})( window );

}, {"outlayer":"node_modules/isotope-layout/node_modules/outlayer/outlayer","get-size":"node_modules/isotope-layout/node_modules/get-size/get-size","desandro-matches-selector":"node_modules/isotope-layout/node_modules/desandro-matches-selector/matches-selector","./item":"node_modules/isotope-layout/js/item","./layout-mode":"node_modules/isotope-layout/js/layout-mode","./layout-modes/masonry":"node_modules/isotope-layout/js/layout-modes/masonry","./layout-modes/fit-rows":"node_modules/isotope-layout/js/layout-modes/fit-rows","./layout-modes/vertical":"node_modules/isotope-layout/js/layout-modes/vertical"});
require.register('node_modules/isotope-layout/js/item', function(require, module, exports){
/**
 * Isotope Item
**/

( function( window ) {

'use strict';

// -------------------------- Item -------------------------- //

function itemDefinition( Outlayer ) {

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

}

// -------------------------- transport -------------------------- //

if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( [
      'outlayer/outlayer'
    ],
    itemDefinition );
} else if ( typeof exports === 'object' ) {
  // CommonJS
  module.exports = itemDefinition(
    require('outlayer')
  );
} else {
  // browser global
  window.Isotope = window.Isotope || {};
  window.Isotope.Item = itemDefinition(
    window.Outlayer
  );
}

})( window );

}, {"outlayer":"node_modules/isotope-layout/node_modules/outlayer/outlayer"});
require.register('node_modules/isotope-layout/js/layout-mode', function(require, module, exports){
( function( window ) {

'use strict';

// --------------------------  -------------------------- //

function layoutModeDefinition( getSize, Outlayer ) {

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
    return hasSizes && size.innerHeight !== this.isotope.size.innerHeight;
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

}

if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( [
      'get-size/get-size',
      'outlayer/outlayer'
    ],
    layoutModeDefinition );
} else if ( typeof exports === 'object' ) {
  // CommonJS
  module.exports = layoutModeDefinition(
    require('get-size'),
    require('outlayer')
  );
} else {
  // browser global
  window.Isotope = window.Isotope || {};
  window.Isotope.LayoutMode = layoutModeDefinition(
    window.getSize,
    window.Outlayer
  );
}


})( window );

}, {"get-size":"node_modules/isotope-layout/node_modules/get-size/get-size","outlayer":"node_modules/isotope-layout/node_modules/outlayer/outlayer"});
require.register('node_modules/isotope-layout/js/layout-modes/fit-rows', function(require, module, exports){
( function( window ) {

'use strict';

function fitRowsDefinition( LayoutMode ) {

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

}

if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( [
      '../layout-mode'
    ],
    fitRowsDefinition );
} else if ( typeof exports === 'object' ) {
  // CommonJS
  module.exports = fitRowsDefinition(
    require('../layout-mode')
  );
} else {
  // browser global
  fitRowsDefinition(
    window.Isotope.LayoutMode
  );
}

})( window );

}, {"../layout-mode":"node_modules/isotope-layout/js/layout-mode"});
require.register('node_modules/isotope-layout/js/layout-modes/masonry', function(require, module, exports){
/*!
 * Masonry layout mode
 * sub-classes Masonry
 * http://masonry.desandro.com
 */

( function( window ) {

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

// used for AMD definition and requires
function masonryDefinition( LayoutMode, Masonry ) {
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
}

// -------------------------- transport -------------------------- //

if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( [
      '../layout-mode',
      'masonry/masonry'
    ],
    masonryDefinition );
} else if ( typeof exports === 'object' ) {
  // CommonJS
  module.exports = masonryDefinition(
    require('../layout-mode'),
    require('masonry-layout')
  );
} else {
  // browser global
  masonryDefinition(
    window.Isotope.LayoutMode,
    window.Masonry
  );
}

})( window );

}, {"../layout-mode":"node_modules/isotope-layout/js/layout-mode","masonry-layout":"node_modules/isotope-layout/node_modules/masonry-layout/masonry"});
require.register('node_modules/isotope-layout/js/layout-modes/vertical', function(require, module, exports){
( function( window ) {

'use strict';

function verticalDefinition( LayoutMode ) {

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

}

if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( [
      '../layout-mode'
    ],
    verticalDefinition );
} else if ( typeof exports === 'object' ) {
  // CommonJS
  module.exports = verticalDefinition(
    require('../layout-mode')
  );
} else {
  // browser global
  verticalDefinition(
    window.Isotope.LayoutMode
  );
}

})( window );

}, {"../layout-mode":"node_modules/isotope-layout/js/layout-mode"});
require.register('node_modules/isotope-layout/node_modules/desandro-matches-selector/matches-selector', function(require, module, exports){
/**
 * matchesSelector v1.0.2
 * matchesSelector( element, '.selector' )
 * MIT license
 */

/*jshint browser: true, strict: true, undef: true, unused: true */
/*global define: false, module: false */

( function( ElemProto ) {

  'use strict';

  var matchesMethod = ( function() {
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
 * Masonry v3.2.2
 * Cascading grid layout library
 * http://masonry.desandro.com
 * MIT License
 * by David DeSandro
 */

( function( window ) {

'use strict';

// -------------------------- helpers -------------------------- //

var indexOf = Array.prototype.indexOf ?
  function( items, value ) {
    return items.indexOf( value );
  } :
  function ( items, value ) {
    for ( var i=0, len = items.length; i < len; i++ ) {
      var item = items[i];
      if ( item === value ) {
        return i;
      }
    }
    return -1;
  };

// -------------------------- masonryDefinition -------------------------- //

// used for AMD definition and requires
function masonryDefinition( Outlayer, getSize ) {
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

    this.columnWidth += this.gutter;

    this.cols = Math.floor( ( this.containerWidth + this.gutter ) / this.columnWidth );
    this.cols = Math.max( this.cols, 1 );
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
    var shortColIndex = indexOf( colGroup, minimumY );

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
}

// -------------------------- transport -------------------------- //

if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( [
      'outlayer/outlayer',
      'get-size/get-size'
    ],
    masonryDefinition );
} else if ( typeof exports === 'object' ) {
  // CommonJS
  module.exports = masonryDefinition(
    require('outlayer'),
    require('get-size')
  );
} else {
  // browser global
  window.Masonry = masonryDefinition(
    window.Outlayer,
    window.getSize
  );
}

})( window );

}, {"outlayer":"node_modules/isotope-layout/node_modules/outlayer/outlayer","get-size":"node_modules/isotope-layout/node_modules/get-size/get-size"});
require.register('node_modules/isotope-layout/node_modules/outlayer/item', function(require, module, exports){
/**
 * Outlayer Item
 */

( function( window ) {

'use strict';

// ----- get style ----- //

var getComputedStyle = window.getComputedStyle;
var getStyle = getComputedStyle ?
  function( elem ) {
    return getComputedStyle( elem, null );
  } :
  function( elem ) {
    return elem.currentStyle;
  };


// extend objects
function extend( a, b ) {
  for ( var prop in b ) {
    a[ prop ] = b[ prop ];
  }
  return a;
}

function isEmptyObj( obj ) {
  for ( var prop in obj ) {
    return false;
  }
  prop = null;
  return true;
}

// http://jamesroberts.name/blog/2010/02/22/string-functions-for-javascript-trim-to-camel-case-to-dashed-and-to-underscore/
function toDash( str ) {
  return str.replace( /([A-Z])/g, function( $1 ){
    return '-' + $1.toLowerCase();
  });
}

// -------------------------- Outlayer definition -------------------------- //

function outlayerItemDefinition( EventEmitter, getSize, getStyleProperty ) {

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
extend( Item.prototype, EventEmitter.prototype );

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

  if ( layoutOptions.isOriginLeft ) {
    style.left = ( this.position.x + layoutSize.paddingLeft ) + 'px';
    // reset other property
    style.right = '';
  } else {
    style.right = ( this.position.x + layoutSize.paddingRight ) + 'px';
    style.left = '';
  }

  if ( layoutOptions.isOriginTop ) {
    style.top = ( this.position.y + layoutSize.paddingTop ) + 'px';
    style.bottom = '';
  } else {
    style.bottom = ( this.position.y + layoutSize.paddingBottom ) + 'px';
    style.top = '';
  }

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

var itemTransitionProperties = transformProperty && ( toDash( transformProperty ) +
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
  this.on( 'transitionEnd', function() {
    _this.removeElem();
    return true; // bind once
  });
  this.hide();
};

Item.prototype.reveal = function() {
  delete this.isHidden;
  // remove display: none
  this.css({ display: '' });

  var options = this.layout.options;
  this.transition({
    from: options.hiddenStyle,
    to: options.visibleStyle,
    isCleaning: true
  });
};

Item.prototype.hide = function() {
  // set flag
  this.isHidden = true;
  // remove display: none
  this.css({ display: '' });

  var options = this.layout.options;
  this.transition({
    from: options.visibleStyle,
    to: options.hiddenStyle,
    // keep hidden stuff hidden
    isCleaning: true,
    onTransitionEnd: {
      opacity: function() {
        // check if still hidden
        // during transition, item may have been un-hidden
        if ( this.isHidden ) {
          this.css({ display: 'none' });
        }
      }
    }
  });
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

}

// -------------------------- transport -------------------------- //

if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( [
      'eventEmitter/EventEmitter',
      'get-size/get-size',
      'get-style-property/get-style-property'
    ],
    outlayerItemDefinition );
} else if (typeof exports === 'object') {
  // CommonJS
  module.exports = outlayerItemDefinition(
    require('wolfy87-eventemitter'),
    require('get-size'),
    require('desandro-get-style-property')
  );
} else {
  // browser global
  window.Outlayer = {};
  window.Outlayer.Item = outlayerItemDefinition(
    window.EventEmitter,
    window.getSize,
    window.getStyleProperty
  );
}

})( window );

}, {"wolfy87-eventemitter":"node_modules/isotope-layout/node_modules/outlayer/node_modules/wolfy87-eventemitter/EventEmitter","get-size":"node_modules/isotope-layout/node_modules/get-size/get-size","desandro-get-style-property":"node_modules/isotope-layout/node_modules/outlayer/node_modules/desandro-get-style-property/get-style-property"});
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
require.register('node_modules/isotope-layout/node_modules/outlayer/node_modules/doc-ready/doc-ready', function(require, module, exports){
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

}, {"eventie":"node_modules/isotope-layout/node_modules/outlayer/node_modules/eventie/eventie"});
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
 * Outlayer v1.3.0
 * the brains and guts of a layout library
 * MIT license
 */

( function( window ) {

'use strict';

// ----- vars ----- //

var document = window.document;
var console = window.console;
var jQuery = window.jQuery;
var noop = function() {};

// -------------------------- helpers -------------------------- //

// extend objects
function extend( a, b ) {
  for ( var prop in b ) {
    a[ prop ] = b[ prop ];
  }
  return a;
}


var objToString = Object.prototype.toString;
function isArray( obj ) {
  return objToString.call( obj ) === '[object Array]';
}

// turn element or nodeList into an array
function makeArray( obj ) {
  var ary = [];
  if ( isArray( obj ) ) {
    // use object if already an array
    ary = obj;
  } else if ( obj && typeof obj.length === 'number' ) {
    // convert nodeList to array
    for ( var i=0, len = obj.length; i < len; i++ ) {
      ary.push( obj[i] );
    }
  } else {
    // array of single index
    ary.push( obj );
  }
  return ary;
}

// http://stackoverflow.com/a/384380/182183
var isElement = ( typeof HTMLElement === 'function' || typeof HTMLElement === 'object' ) ?
  function isElementDOM2( obj ) {
    return obj instanceof HTMLElement;
  } :
  function isElementQuirky( obj ) {
    return obj && typeof obj === 'object' &&
      obj.nodeType === 1 && typeof obj.nodeName === 'string';
  };

// index of helper cause IE8
var indexOf = Array.prototype.indexOf ? function( ary, obj ) {
    return ary.indexOf( obj );
  } : function( ary, obj ) {
    for ( var i=0, len = ary.length; i < len; i++ ) {
      if ( ary[i] === obj ) {
        return i;
      }
    }
    return -1;
  };

function removeFrom( obj, ary ) {
  var index = indexOf( ary, obj );
  if ( index !== -1 ) {
    ary.splice( index, 1 );
  }
}

// http://jamesroberts.name/blog/2010/02/22/string-functions-for-javascript-trim-to-camel-case-to-dashed-and-to-underscore/
function toDashed( str ) {
  return str.replace( /(.)([A-Z])/g, function( match, $1, $2 ) {
    return $1 + '-' + $2;
  }).toLowerCase();
}


function outlayerDefinition( eventie, docReady, EventEmitter, getSize, matchesSelector, Item ) {

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
  // use element as selector string
  if ( typeof element === 'string' ) {
    element = document.querySelector( element );
  }

  // bail out if not proper element
  if ( !element || !isElement( element ) ) {
    if ( console ) {
      console.error( 'Bad ' + this.constructor.namespace + ' element: ' + element );
    }
    return;
  }

  this.element = element;

  // options
  this.options = extend( {}, this.constructor.defaults );
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
extend( Outlayer.prototype, EventEmitter.prototype );

/**
 * set options
 * @param {Object} opts
 */
Outlayer.prototype.option = function( opts ) {
  extend( this.options, opts );
};

Outlayer.prototype._create = function() {
  // get items from children
  this.reloadItems();
  // elements that affect layout, but are not laid out
  this.stamps = [];
  this.stamp( this.options.stamp );
  // set container style
  extend( this.element.style, this.options.containerStyle );

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
  // make array of elems
  elems = makeArray( elems );
  var itemSelector = this.options.itemSelector;
  var itemElems = [];

  for ( var i=0, len = elems.length; i < len; i++ ) {
    var elem = elems[i];
    // check that elem is an actual element
    if ( !isElement( elem ) ) {
      continue;
    }
    // filter & find items if we have an item selector
    if ( itemSelector ) {
      // filter siblings
      if ( matchesSelector( elem, itemSelector ) ) {
        itemElems.push( elem );
      }
      // find children
      var childElems = elem.querySelectorAll( itemSelector );
      // concat childElems to filterFound array
      for ( var j=0, jLen = childElems.length; j < jLen; j++ ) {
        itemElems.push( childElems[j] );
      }
    } else {
      itemElems.push( elem );
    }
  }

  return itemElems;
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
    } else if ( isElement( option ) ) {
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
  var _this = this;
  function onItemsLayout() {
    _this.emitEvent( 'layoutComplete', [ _this, items ] );
  }

  if ( !items || !items.length ) {
    // no items, emit event with empty array
    onItemsLayout();
    return;
  }

  // emit layoutComplete when done
  this._itemsOn( items, 'layout', onItemsLayout );

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
 * trigger a callback for a collection of items events
 * @param {Array} items - Outlayer.Items
 * @param {String} eventName
 * @param {Function} callback
 */
Outlayer.prototype._itemsOn = function( items, eventName, callback ) {
  var doneCount = 0;
  var count = items.length;
  // event callback
  var _this = this;
  function tick() {
    doneCount++;
    if ( doneCount === count ) {
      callback.call( _this );
    }
    return true; // bind once
  }
  // bind callback
  for ( var i=0, len = items.length; i < len; i++ ) {
    var item = items[i];
    item.on( eventName, tick );
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
    removeFrom( elem, this.stamps );
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
  elems = makeArray( elems );
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
  var len = items && items.length;
  if ( !len ) {
    return;
  }
  for ( var i=0; i < len; i++ ) {
    var item = items[i];
    item.reveal();
  }
};

/**
 * hide a collection of items
 * @param {Array of Outlayer.Items} items
 */
Outlayer.prototype.hide = function( items ) {
  var len = items && items.length;
  if ( !len ) {
    return;
  }
  for ( var i=0; i < len; i++ ) {
    var item = items[i];
    item.hide();
  }
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
  if ( !elems || !elems.length ) {
    return;
  }
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
  elems = makeArray( elems );

  var removeItems = this.getItems( elems );
  // bail if no items to remove
  if ( !removeItems || !removeItems.length ) {
    return;
  }

  this._itemsOn( removeItems, 'remove', function() {
    this.emitEvent( 'removeComplete', [ this, removeItems ] );
  });

  for ( var i=0, len = removeItems.length; i < len; i++ ) {
    var item = removeItems[i];
    item.remove();
    // remove item from collection
    removeFrom( item, this.items );
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
    extend( Layout.prototype, Outlayer.prototype );
  }
  // set contructor, used for namespace and Item
  Layout.prototype.constructor = Layout;

  Layout.defaults = extend( {}, Outlayer.defaults );
  // apply new options
  extend( Layout.defaults, options );
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

  /**
   * allow user to initialize Outlayer via .js-namespace class
   * options are parsed from data-namespace-option attribute
   */
  docReady( function() {
    var dashedNamespace = toDashed( namespace );
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
      var instance = new Layout( elem, options );
      // make available via $().data('layoutname')
      if ( jQuery ) {
        jQuery.data( elem, namespace, instance );
      }
    }
  });

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

}

// -------------------------- transport -------------------------- //

if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( [
      'eventie/eventie',
      'doc-ready/doc-ready',
      'eventEmitter/EventEmitter',
      'get-size/get-size',
      'matches-selector/matches-selector',
      './item'
    ],
    outlayerDefinition );
} else if ( typeof exports === 'object' ) {
  // CommonJS
  module.exports = outlayerDefinition(
    require('eventie'),
    require('doc-ready'),
    require('wolfy87-eventemitter'),
    require('get-size'),
    require('desandro-matches-selector'),
    require('./item')
  );
} else {
  // browser global
  window.Outlayer = outlayerDefinition(
    window.eventie,
    window.docReady,
    window.EventEmitter,
    window.getSize,
    window.matchesSelector,
    window.Outlayer.Item
  );
}

})( window );

}, {"eventie":"node_modules/isotope-layout/node_modules/outlayer/node_modules/eventie/eventie","doc-ready":"node_modules/isotope-layout/node_modules/outlayer/node_modules/doc-ready/doc-ready","wolfy87-eventemitter":"node_modules/isotope-layout/node_modules/outlayer/node_modules/wolfy87-eventemitter/EventEmitter","get-size":"node_modules/isotope-layout/node_modules/get-size/get-size","desandro-matches-selector":"node_modules/isotope-layout/node_modules/desandro-matches-selector/matches-selector","./item":"node_modules/isotope-layout/node_modules/outlayer/item"});
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
    if (false !== options.click) window.addEventListener('click', onclick, false);
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
    window.removeEventListener('click', onclick, false);
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

  function onpopstate(e) {
    if (e.state) {
      var path = e.state.path;
      page.replace(path, e.state);
    } else {
      page.show(location.pathname + location.hash, undefined, undefined, false);
    }
  }

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
    if (el.getAttribute('download') || el.getAttribute('rel') === 'external') return;

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

    // same page
    var orig = path;

    path = path.replace(base, '');
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
require.register('src/frontend/scripts/api/loopcast/loopcast', function(require, module, exports){
var api_url;

api_url = "/api/v1/";

module.exports = {
  genres: {
    all: function(callback) {
      var request;
      request = $.get(api_url + 'genres/all');
      request.error(function(error) {
        console.error('error fetching genres');
        console.error(error);
        return callback(error);
      });
      return request.done(function(response) {
        if (response.error) {
          return callback(response.error);
        }
        return callback(null, response);
      });
    }
  },
  rooms: {
    create: function(data, callback) {
      var request;
      request = $.post(api_url + 'rooms/create', data);
      request.error(function(error) {
        console.error('error creating calling create/room');
        console.error(error);
        return callback(error);
      });
      return request.done(function(response) {
        if (response.error) {
          return callback(response.error);
        }
        return callback(null, response);
      });
    },
    start_stream: function(room_id, callback) {
      var data, request;
      data = {
        room_id: room_id
      };
      request = $.post(api_url + 'stream/start', data);
      request.error(function(error) {
        console.error('error creating calling stream/start');
        console.error(error);
        return callback(error);
      });
      return request.done(function(response) {
        if (response.error) {
          return callback(response.error);
        }
        return callback(null, response);
      });
    },
    stop_stream: function(room_id, callback) {
      var data, request;
      data = {
        room_id: room_id
      };
      request = $.post(api_url + 'stream/stop', data);
      request.error(function(error) {
        console.error('error creating calling stream/stop');
        console.error(error);
        return callback(error);
      });
      return request.done(function(response) {
        if (response.error) {
          return callback(response.error);
        }
        return callback(null, response);
      });
    },
    start_recording: function(callback) {
      var data, request;
      data = {
        room_id: room_id
      };
      request = $.post(api_url + 'tape/start', data);
      request.error(function(error) {
        console.error('error creating calling tape/start');
        console.error(error);
        return callback(error);
      });
      return request.done(function(response) {
        if (response.error) {
          return callback(response.error);
        }
        return callback(null, response);
      });
    },
    stop_recording: function(room_id, callback) {
      var data, request;
      data = {
        room_id: room_id
      };
      request = $.post(api_url + 'stape/stop', data);
      request.error(function(error) {
        console.error('error creating calling stape/stop');
        console.error(error);
        return callback(error);
      });
      return request.done(function(response) {
        if (response.error) {
          return callback(response.error);
        }
        return callback(null, response);
      });
    }
  }
};

}, {});
require.register('src/frontend/scripts/app', function(require, module, exports){
var App, app, appcast, cloudinary, navigation, user_controller, views,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

require('./globals');

require('./vendors');

require('../vendors/parallax.min.js');

views = require('./controllers/views');

navigation = require('./controllers/navigation');

appcast = require('./controllers/appcast');

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
    var url;
    log("--------> login called from outside");
    if (this.settings.after_login_url.length > 0) {
      url = this.settings.after_login_url;
      this.settings.after_login_url = "";
    } else {
      url = "/" + user.username;
    }
    navigation.go(url);
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

}, {"./globals":"src/frontend/scripts/globals","./vendors":"src/frontend/scripts/vendors","../vendors/parallax.min.js":"src/frontend/vendors/parallax.min","./controllers/views":"src/frontend/scripts/controllers/views","./controllers/navigation":"src/frontend/scripts/controllers/navigation","./controllers/appcast":"src/frontend/scripts/controllers/appcast","./controllers/user":"src/frontend/scripts/controllers/user","./controllers/cloudinary":"src/frontend/scripts/controllers/cloudinary","app/controllers/local_connection":"src/frontend/scripts/controllers/local_connection","app/controllers/window":"src/frontend/scripts/controllers/window","app/utils/settings":"src/frontend/scripts/utils/settings"});
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

appcast.start_stream = function(username, device_name) {
  var mount_point, password, payload;
  console.info(" START STRAEM!!!");
  if (appcast.get("stream:starting")) {
    console.error("waiting stream to start, cant start again");
    return;
  }
  if (appcast.get("stream:online")) {
    console.error("stream is already online, cant start again");
    return;
  }
  mount_point = "hems";
  mount_point = username;
  password = "loopcast2015";
  payload = {
    device_name: device_name,
    mount_point: mount_point,
    password: password
  };
  console.info("SENDING START STREAM TO APPCAST");
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
    log("url_changed", req, req.path);
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
require.register('src/frontend/scripts/controllers/user', function(require, module, exports){
var happens, navigation, transform;

transform = require('app/utils/images/transform');

happens = require('happens');

navigation = require('app/controllers/navigation');

module.exports = happens({
  USER_DEFAULT_AVATAR: "/images/profile-1.jpg",
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
      navigation.go('/');
      return typeof callback === "function" ? callback() : void 0;
    });
  },
  login: function(user) {
    loopcast.user = user;
    log("login", user);
    if (user.avatar == null) {
      user.avatar = this.USER_DEFAULT_AVATAR;
    }
    loopcast.user.images = {
      top_bar: transform.top_bar(user.avatar),
      avatar: transform.avatar(user.avatar)
    };
    app.body.addClass("logged");
    this.emit('user:logged', this.get_user());
    return log("[User Controller] login", this.get_user());
  },
  check_user: function() {
    log('[User Controller] check_user', loopcast);
    if (this.is_logged()) {
      return this.login(this.get_user());
    } else {
      return this.logout();
    }
  },
  is_logged: function() {
    return this.get_user() != null;
  },
  get_user: function() {
    return loopcast.user;
  },
  set_user: function(user) {
    return loopcast.user = user;
  }
});

}, {"app/utils/images/transform":"src/frontend/scripts/utils/images/transform","happens":"node_modules/happens/index","app/controllers/navigation":"src/frontend/scripts/controllers/navigation"});
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
        happens_destroy(v);
        if (typeof v.destroy === "function") {
          v.destroy();
        }
        v.view_name = null;
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

log("one");

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
    y += 20;
    return $('html, body').animate({
      scrollTop: y
    }, speed);
  }
};

}, {});
require.register('src/frontend/scripts/utils/appcast', function(require, module, exports){
var appcast;

appcast = require('app/controllers/appcast');

module.exports = {
  start_recording: function() {
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
  },
  stop_recording: function() {
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
  },
  start_stream: function() {
    if (!appcast.get('input_device')) {
      console.error('- cant start stream before selecting input device');
      return;
    }
    console.log('starting streaming with', appcast.get('input_device'));
    return appcast.start_stream(appcast.get('input_device'));
  },
  stop_stream: function() {
    if (!appcast.get('streaming:online')) {
      console.error('- cant stop stream if not streaming');
      return;
    }
    console.log('+ stoping streaming with', appcast.get('input_device'));
    return appcast.stop_stream();
  }
};

}, {"app/controllers/appcast":"src/frontend/scripts/controllers/appcast"});
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
    if (url.indexOf("upload/") < 0) {
      return "/images/profile-49.jpg";
    } else {
      return url.replace("upload/", "upload/w_49,h_49,c_fill,g_north/");
    }
  },
  avatar: function(url) {
    if (url.indexOf("upload/") < 0) {
      return "/images/profile-150.jpg";
    } else {
      return url.replace("upload/", "upload/w_150,h_150,c_fill,g_north/");
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
    w: 400,
    h: 440
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
  Cloudinary: require('../vendors/jquery.cloudinary.js')
};

module.exports = vendors;

}, {"../vendors/modernizr.custom.js":"src/frontend/vendors/modernizr.custom","../vendors/LocalConnection.js":"src/frontend/vendors/LocalConnection","../vendors/reconnecting-websocket.js":"src/frontend/vendors/reconnecting-websocket","../vendors/jquery.ui.widget.js":"src/frontend/vendors/jquery.ui.widget","../vendors/jquery.iframe-transport.js":"src/frontend/vendors/jquery.iframe-transport","../vendors/jquery.fileupload.js":"src/frontend/vendors/jquery.fileupload","../vendors/jquery.cloudinary.js":"src/frontend/vendors/jquery.cloudinary"});
require.register('src/frontend/scripts/views/appcast_instructions', function(require, module, exports){
var appcast;

appcast = require('../controllers/appcast');

module.exports = function(dom) {
  return appcast.on('connected', function(is_connected) {
    if (is_connected) {
      return dom.hide();
    } else {
      return dom.show();
    }
  });
};

}, {"../controllers/appcast":"src/frontend/scripts/controllers/appcast"});
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
require.register('src/frontend/scripts/views/components/audio/meter', function(require, module, exports){
var Meter;

module.exports = Meter = (function() {
  function Meter(dom) {
    var _this = this;
    this.dom = dom;
    this.progress = this.dom.find('.meter span');
    this.is_left = this.dom.attr('class').indexOf("left") !== -1;
    appcast.on('stream:vu', function(meter) {
      if (_this.is_left) {
        return _this.set_volume(meter[0] * 5);
      } else {
        return _this.set_volume(meter[1] * 5);
      }
    });
  }

  Meter.prototype.set_volume = function(perc) {
    return this.progress.css('width', "" + (perc * 100) + "%");
  };

  return Meter;

})();

}, {});
require.register('src/frontend/scripts/views/components/audio/player', function(require, module, exports){
var Player,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

module.exports = Player = (function() {
  function Player(dom) {
    var _this = this;
    this.dom = dom;
    this.on_views_binded = __bind(this.on_views_binded, this);
    this.cover = this.dom.find('.player_icon img');
    this.title = this.dom.find('.player_title');
    this.author = this.dom.find('.player_author');
    delay(2000, function() {
      return _this.open({
        cover: "/images/profile_big.png",
        title: "Live from Siracusa",
        author: "Stefano Ortisi",
        url: "http://loopcast.com/stefanoortisi/live",
        author_link: "http://loopcast.com/stefanoortisi"
      });
    });
    view.once('binded', this.on_views_binded);
  }

  Player.prototype.on_views_binded = function() {
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
require.register('src/frontend/scripts/views/components/buttons/go_live', function(require, module, exports){
var L, appcast;

L = require('../../../api/loopcast/loopcast');

appcast = require('../../../controllers/appcast');

module.exports = function(dom) {
  return dom.find('a').click(function() {
    var username;
    console.log("clicked go live!");
    if (!appcast.get('input_device')) {
      console.error("can't got live without selecting input device");
      return;
    }
    username = location.pathname.split("/")[1];
    appcast.start_stream(username, appcast.get('input_device'));
    dom.find('a').html("WAITING APPCAST");
    appcast.on('stream:online', function(status) {
      var room_id;
      if (!status) {
        dom.find('a').html("WENT OFFLINE : (");
        return;
      }
      dom.find('a').html("APPCAST IS STREAMING! ");
      room_id = location.pathname.split("/")[2];
      return L.rooms.start_stream(room_id, function(error) {
        if (error) {
          console.error(error);
        }
      });
    });
    return false;
  });
};

}, {"../../../api/loopcast/loopcast":"src/frontend/scripts/api/loopcast/loopcast","../../../controllers/appcast":"src/frontend/scripts/controllers/appcast"});
require.register('src/frontend/scripts/views/components/buttons/record', function(require, module, exports){
var appcast;

appcast = require('../../../controllers/appcast');

module.exports = function(dom) {
  return dom.find('a').click(function() {
    console.log("clicked record!");
    return false;
  });
};

}, {"../../../controllers/appcast":"src/frontend/scripts/controllers/appcast"});
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
require.register('src/frontend/scripts/views/components/editables/editable_select', function(require, module, exports){
var EditableSelect, EditableText,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

EditableText = require("./editable_text");

module.exports = EditableSelect = (function(_super) {
  __extends(EditableSelect, _super);

  function EditableSelect(dom) {
    this.dom = dom;
    this.on_ready = __bind(this.on_ready, this);
    EditableSelect.__super__.constructor.call(this, this.dom);
  }

  EditableSelect.prototype.on_ready = function(html) {
    var text;
    this.dom.append(html);
    text = this.dom.find('.text');
    this.select = this.dom.find('select');
    return this.select.on('change', function(e) {
      var t;
      t = this.options[e.target.selectedIndex].text;
      log("text", t);
      return text.text(t);
    });
  };

  EditableSelect.prototype.get_template = function(callback) {
    return $.get('/api/v1/occupations/all', function(data) {
      var tmpl;
      tmpl = require('templates/components/editables/editable_select');
      log("get_template", data);
      return callback(tmpl({
        values: data
      }));
    });
  };

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

  function EditableTags(dom) {
    var _this = this;
    this.dom = dom;
    this.on_remove_tag = __bind(this.on_remove_tag, this);
    this.on_add_tag = __bind(this.on_add_tag, this);
    happens(this);
    L.genres.all(function(error, list) {
      return _this.dom.tagsInput({
        width: 'auto',
        height: 'auto',
        onAddTag: _this.on_add_tag,
        onRemoveTag: _this.on_remove_tag,
        autocomplete_url: list,
        autocomplete: {
          width: 200
        }
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
    log("[EditableTags] destroy");
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
var EditableText,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

module.exports = EditableText = (function() {
  function EditableText(dom) {
    this.dom = dom;
    this.open_edit_mode = __bind(this.open_edit_mode, this);
    this.close_read_mode = __bind(this.close_read_mode, this);
    this.on_ready = __bind(this.on_ready, this);
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

  EditableText.prototype.close_read_mode = function() {
    log('close_edit_mode');
    this.text_el.text(this.input.val());
    this.dom.removeClass('edit_mode');
    return this.input.off('keyup');
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
    return app.window.once('body:clicked', this.close_read_mode);
  };

  EditableText.prototype.destroy = function() {};

  return EditableText;

})();

}, {"templates/components/editables/editable_text":"src/frontend/templates/components/editables/editable_text"});
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
    log("HOVER TRIGGER!!!!!");
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
    log("[Trigger] open");
    this.dom.addClass(this.klass);
    this.target.addClass(this.klass);
    return app.emit("dropdown:opened", this.uid);
  };

  HoverTrigger.prototype.close = function() {
    if (!this.opened) {
      return;
    }
    this.opened = false;
    log("[Trigger] close");
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
require.register('src/frontend/scripts/views/components/input_devices', function(require, module, exports){
var InputDevices, Select, appcast, happens,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

appcast = require('app/controllers/appcast');

happens = require('happens');

Select = require('./select');

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

}, {"app/controllers/appcast":"src/frontend/scripts/controllers/appcast","happens":"node_modules/happens/index","./select":"src/frontend/scripts/views/components/select"});
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
    log("[Logged Link] on_user_logged", data);
    dom.attr('href', original_url);
    return dom.off('click', on_click);
  };
  on_user_unlogged = function(data) {
    log("[Logged Link] on_user_unlogged", data);
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
    log("[Modal] removed");
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
    this.on_user_logged = __bind(this.on_user_logged, this);
    this.check_menu = __bind(this.check_menu, this);
    user_controller.on('user:logged', this.on_user_logged);
    user_controller.on('user:unlogged', this.on_user_unlogged);
    navigation.on('after_render', this.check_menu);
  }

  Header.prototype.check_menu = function() {
    var obj, page, submenu;
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
    log("[Header] on_user_logged", data, html);
    log("wrapper", wrapper.length, wrapper);
    wrapper.empty().append(html);
    view.bind(wrapper);
    return navigation.bind(wrapper);
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
var Cloudinary, Profile, transform,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Cloudinary = require('app/controllers/cloudinary');

transform = require('app/utils/images/transform');

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
      location: this.dom.find('.profile_bio .location'),
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
    $('#room_modal').data('modal-close', true);
    view.once('binded', this.on_views_binded);
  }

  Profile.prototype.on_views_binded = function() {
    var change_cover_uploader, change_picture_uploader,
      _this = this;
    log("[Profile] on_views_binded");
    change_cover_uploader = view.get_by_dom(this.dom.find('.change_cover'));
    if (!change_cover_uploader) {
      log("[Profile] views not binded yet!!!");
      return;
    }
    change_cover_uploader.on('completed', function(data) {
      _this.user_data.cover_picture = data.result.url;
      return _this.dom.find('.cover_image').css({
        'background-image': "url(" + data.result.url + ")"
      });
    });
    change_picture_uploader = view.get_by_dom(this.dom.find('.profile_image'));
    return change_picture_uploader.on('completed', function(data) {
      var url;
      _this.user_data.profile_picture = data.result.url;
      url = transform.avatar(data.result.url);
      return _this.dom.find('img').attr('src', url);
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

}, {"app/controllers/cloudinary":"src/frontend/scripts/controllers/cloudinary","app/utils/images/transform":"src/frontend/scripts/utils/images/transform"});
require.register('src/frontend/scripts/views/room', function(require, module, exports){
var L, Room, Strings, navigation, user_controller,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

L = require('api/loopcast/loopcast');

navigation = require('app/controllers/navigation');

Strings = require('app/utils/string');

user_controller = require('app/controllers/user');

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
    this.modal = view.get_by_dom('#room_modal');
    this.modal.on('input:changed', this.on_input_changed);
    this.modal.on('submit', this.on_modal_submit);
    if (this.is_create_page()) {
      return this.modal.open();
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
    var m;
    log("[Room] on_modal_submit", data);
    this.modal.hide_message();
    this.modal.show_loading();
    m = this.modal;
    return L.rooms.create(data, function(error, room) {
      var msg,
        _this = this;
      if (error) {
        msg = "Error. Try again.";
        if (error === "cant_have_two_live_rooms_with_same_url") {
          console.error("Cant have two live rooms with same url");
          msg = "Cant have two live rooms with same url";
        }
        m.hide_loading();
        m.show_message(msg);
        return console.error(error);
      }
      return delay(1000, function() {
        navigation.go_silent("/" + room.url);
        _this.check_guest();
        return m.close();
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
      return app.body.removeClass('guest');
    }
  };

  Room.prototype.is_guest = function() {
    var guest, u;
    u = user_controller.get_user();
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

}, {"api/loopcast/loopcast":"src/frontend/scripts/api/loopcast/loopcast","app/controllers/navigation":"src/frontend/scripts/controllers/navigation","app/utils/string":"src/frontend/scripts/utils/string","app/controllers/user":"src/frontend/scripts/controllers/user"});
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

  RoomModal.prototype.on_views_binded = function() {
    var room_image_uploader;
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
    this.cover_uploaded = data.result;
    console.log("got image result ->", data.result);
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
    log("submit");
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
    log("[RoomModal] removed");
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
jade.debug = [{ lineno: 1, filename: "/Users/stefanoortisi/Workspace/Sites/personal/loopcast/beta/src/frontend/templates/buttons/share.jade" }];
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
require.register('src/frontend/templates/components/editables/editable_select', function(require, module, exports){
module.exports = function anonymous(locals
/**/) {
jade.debug = [{ lineno: 1, filename: "/Users/stefanoortisi/Workspace/Sites/personal/loopcast/beta/src/frontend/templates/components/editables/editable_select.jade" }];
try {
var buf = [];
var locals_ = (locals || {}),values = locals_.values;jade.debug.unshift({ lineno: 1, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 1, filename: jade.debug[0].filename });
buf.push("<span class=\"spritesheet edit_icon element_on_write_mode\">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.shift();
buf.push("</span>");
jade.debug.shift();
jade.debug.unshift({ lineno: 2, filename: jade.debug[0].filename });
buf.push("<select class=\"editable_input\">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 3, filename: jade.debug[0].filename });
// iterate values
;(function(){
  var $$obj = values;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var val = $$obj[$index];

jade.debug.unshift({ lineno: 3, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 4, filename: jade.debug[0].filename });
buf.push("<option" + (jade.attrs({ 'value':("" + (val) + "") }, {"value":true})) + ">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 4, filename: jade.debug[0].filename });
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

jade.debug.unshift({ lineno: 3, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 4, filename: jade.debug[0].filename });
buf.push("<option" + (jade.attrs({ 'value':("" + (val) + "") }, {"value":true})) + ">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 4, filename: jade.debug[0].filename });
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
  jade.rethrow(err, jade.debug[0].filename, jade.debug[0].lineno,"span.spritesheet.edit_icon.element_on_write_mode\nselect.editable_input\n\teach val in values\n\t\toption(value=\"#{val}\") #{val}");
}
}
}, {});
require.register('src/frontend/templates/components/editables/editable_text', function(require, module, exports){
module.exports = function anonymous(locals
/**/) {
jade.debug = [{ lineno: 1, filename: "/Users/stefanoortisi/Workspace/Sites/personal/loopcast/beta/src/frontend/templates/components/editables/editable_text.jade" }];
try {
var buf = [];
jade.debug.unshift({ lineno: 1, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 1, filename: jade.debug[0].filename });
buf.push("<span class=\"spritesheet edit_icon element_on_write_mode\">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.shift();
buf.push("</span>");
jade.debug.shift();
jade.debug.unshift({ lineno: 2, filename: jade.debug[0].filename });
buf.push("<input type=\"text\" class=\"editable_input\"/>");
jade.debug.shift();
jade.debug.shift();;return buf.join("");
} catch (err) {
  jade.rethrow(err, jade.debug[0].filename, jade.debug[0].lineno,"span.spritesheet.edit_icon.element_on_write_mode\ninput.editable_input(type=\"text\")");
}
}
}, {});
require.register('src/frontend/templates/shared/header_user_logged', function(require, module, exports){
module.exports = function anonymous(locals
/**/) {
jade.debug = [{ lineno: 1, filename: "/Users/stefanoortisi/Workspace/Sites/personal/loopcast/beta/src/frontend/templates/shared/header_user_logged.jade" }];
try {
var buf = [];
var locals_ = (locals || {}),images = locals_.images,username = locals_.username;jade.debug.unshift({ lineno: 1, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 1, filename: jade.debug[0].filename });
buf.push("<div data-view=\"components/click_trigger\" data-target=\".user_dropdown\" class=\"thumb_wrapper\">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 2, filename: jade.debug[0].filename });
buf.push("<img" + (jade.attrs({ 'src':("" + (images.top_bar) + "") }, {"src":true})) + "/>");
jade.debug.shift();
jade.debug.unshift({ lineno: 3, filename: jade.debug[0].filename });
buf.push("<span class=\"icon ss-dropdown\">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.shift();
buf.push("</span>");
jade.debug.shift();
jade.debug.unshift({ lineno: 6, filename: jade.debug[0].filename });
jade.debug.shift();
jade.debug.unshift({ lineno: 6, filename: jade.debug[0].filename });
buf.push("<ul class=\"user_dropdown hover_dropdown\">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 8, filename: jade.debug[0].filename });
buf.push("<li>");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 8, filename: jade.debug[0].filename });
buf.push("<a" + (jade.attrs({ 'href':("/" + (username) + ""), 'title':("My Profile") }, {"href":true,"title":true})) + ">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 8, filename: jade.debug[0].filename });
buf.push("My Profile");
jade.debug.shift();
jade.debug.shift();
buf.push("</a>");
jade.debug.shift();
jade.debug.shift();
buf.push("</li>");
jade.debug.shift();
jade.debug.unshift({ lineno: 10, filename: jade.debug[0].filename });
buf.push("<li>");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 10, filename: jade.debug[0].filename });
buf.push("<a href=\"#\" title=\"Feedback\">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 10, filename: jade.debug[0].filename });
buf.push("Feedback");
jade.debug.shift();
jade.debug.shift();
buf.push("</a>");
jade.debug.shift();
jade.debug.shift();
buf.push("</li>");
jade.debug.shift();
jade.debug.unshift({ lineno: 12, filename: jade.debug[0].filename });
buf.push("<li>");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 12, filename: jade.debug[0].filename });
buf.push("<a href=\"#\" title=\"Logout\" data-view=\"components/logout_link\" class=\"logout\">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 12, filename: jade.debug[0].filename });
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
jade.debug.unshift({ lineno: 16, filename: jade.debug[0].filename });
buf.push("<a href=\"#\" title=\"Messages\">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 17, filename: jade.debug[0].filename });
buf.push("<span class=\"icon ss-mail\">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 17, filename: jade.debug[0].filename });
buf.push("&nbsp;");
jade.debug.shift();
jade.debug.shift();
buf.push("</span>");
jade.debug.shift();
jade.debug.unshift({ lineno: 18, filename: jade.debug[0].filename });
jade.debug.shift();
jade.debug.shift();
buf.push("</a>");
jade.debug.shift();
jade.debug.shift();;return buf.join("");
} catch (err) {
  jade.rethrow(err, jade.debug[0].filename, jade.debug[0].lineno,".thumb_wrapper(data-view=\"components/click_trigger\" data-target=\".user_dropdown\")\n\timg(src=\"#{images.top_bar}\")\n\tspan.icon.ss-dropdown\n\t//- span.spritesheet.small_arrow_white\n\n\tul.user_dropdown.hover_dropdown\n\t\tli\n\t\t\ta(href=\"/#{username}\" title=\"My Profile\") My Profile\n\t\tli\n\t\t\ta(href=\"#\" title=\"Feedback\") Feedback\n\t\tli\n\t\t\ta.logout(href=\"#\" title=\"Logout\", data-view=\"components/logout_link\") Logout\n\n\n\na(href=\"#\", title=\"Messages\")\n\tspan.icon.ss-mail &nbsp;\n\t//- span.spritesheet.messages_icon");
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
//@ sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic2VjdGlvbnMiOlt7Im9mZnNldCI6eyJsaW5lIjo5MjM0LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvYXBpL2xvb3BjYXN0L2xvb3BjYXN0LmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJhcGlfdXJsID0gXCIvYXBpL3YxL1wiXG5cbm1vZHVsZS5leHBvcnRzID0gXG5cbiAgZ2VucmVzIDogXG4gICAgYWxsOiAoIGNhbGxiYWNrICkgLT5cbiAgICAgIHJlcXVlc3QgPSAkLmdldCBhcGlfdXJsICsgJ2dlbnJlcy9hbGwnXG5cbiAgICAgIHJlcXVlc3QuZXJyb3IgKCBlcnJvciApIC0+XG5cbiAgICAgICAgY29uc29sZS5lcnJvciAnZXJyb3IgZmV0Y2hpbmcgZ2VucmVzJ1xuICAgICAgICBjb25zb2xlLmVycm9yIGVycm9yXG5cbiAgICAgICAgY2FsbGJhY2sgZXJyb3JcblxuICAgICAgcmVxdWVzdC5kb25lICggcmVzcG9uc2UgKSAtPlxuXG4gICAgICAgIGlmIHJlc3BvbnNlLmVycm9yIHRoZW4gcmV0dXJuIGNhbGxiYWNrIHJlc3BvbnNlLmVycm9yXG5cbiAgICAgICAgY2FsbGJhY2sgIG51bGwsIHJlc3BvbnNlXG5cbiAgcm9vbXMgOlxuICAgIGNyZWF0ZTogKCBkYXRhLCBjYWxsYmFjayApIC0+XG4gICAgICByZXF1ZXN0ID0gJC5wb3N0IGFwaV91cmwgKyAncm9vbXMvY3JlYXRlJywgZGF0YVxuXG4gICAgICByZXF1ZXN0LmVycm9yICggZXJyb3IgKSAtPlxuXG4gICAgICAgIGNvbnNvbGUuZXJyb3IgJ2Vycm9yIGNyZWF0aW5nIGNhbGxpbmcgY3JlYXRlL3Jvb20nXG4gICAgICAgIGNvbnNvbGUuZXJyb3IgZXJyb3JcblxuICAgICAgICBjYWxsYmFjayBlcnJvclxuXG4gICAgICByZXF1ZXN0LmRvbmUgKCByZXNwb25zZSApIC0+XG5cbiAgICAgICAgaWYgcmVzcG9uc2UuZXJyb3IgdGhlbiByZXR1cm4gY2FsbGJhY2sgcmVzcG9uc2UuZXJyb3JcblxuICAgICAgICBjYWxsYmFjayAgbnVsbCwgcmVzcG9uc2VcblxuICAgIHN0YXJ0X3N0cmVhbTogKCByb29tX2lkLCBjYWxsYmFjayApIC0+XG5cbiAgICAgIGRhdGEgPSByb29tX2lkOiByb29tX2lkXG5cbiAgICAgIHJlcXVlc3QgPSAkLnBvc3QgYXBpX3VybCArICdzdHJlYW0vc3RhcnQnLCBkYXRhXG5cbiAgICAgIHJlcXVlc3QuZXJyb3IgKCBlcnJvciApIC0+XG5cbiAgICAgICAgY29uc29sZS5lcnJvciAnZXJyb3IgY3JlYXRpbmcgY2FsbGluZyBzdHJlYW0vc3RhcnQnXG4gICAgICAgIGNvbnNvbGUuZXJyb3IgZXJyb3JcblxuICAgICAgICBjYWxsYmFjayBlcnJvclxuXG4gICAgICByZXF1ZXN0LmRvbmUgKCByZXNwb25zZSApIC0+XG5cbiAgICAgICAgaWYgcmVzcG9uc2UuZXJyb3IgdGhlbiByZXR1cm4gY2FsbGJhY2sgcmVzcG9uc2UuZXJyb3JcblxuICAgICAgICBjYWxsYmFjayAgbnVsbCwgcmVzcG9uc2VcblxuICAgIHN0b3Bfc3RyZWFtOiAoIHJvb21faWQsIGNhbGxiYWNrICkgLT5cblxuICAgICAgZGF0YSA9IHJvb21faWQ6IHJvb21faWRcblxuICAgICAgcmVxdWVzdCA9ICQucG9zdCBhcGlfdXJsICsgJ3N0cmVhbS9zdG9wJywgZGF0YVxuXG4gICAgICByZXF1ZXN0LmVycm9yICggZXJyb3IgKSAtPlxuXG4gICAgICAgIGNvbnNvbGUuZXJyb3IgJ2Vycm9yIGNyZWF0aW5nIGNhbGxpbmcgc3RyZWFtL3N0b3AnXG4gICAgICAgIGNvbnNvbGUuZXJyb3IgZXJyb3JcblxuICAgICAgICBjYWxsYmFjayBlcnJvclxuXG4gICAgICByZXF1ZXN0LmRvbmUgKCByZXNwb25zZSApIC0+XG5cbiAgICAgICAgaWYgcmVzcG9uc2UuZXJyb3IgdGhlbiByZXR1cm4gY2FsbGJhY2sgcmVzcG9uc2UuZXJyb3JcblxuICAgICAgICBjYWxsYmFjayAgbnVsbCwgcmVzcG9uc2VcblxuICAgIHN0YXJ0X3JlY29yZGluZzogKCBjYWxsYmFjayApIC0+XG5cbiAgICAgIGRhdGEgPSByb29tX2lkOiByb29tX2lkXG5cbiAgICAgIHJlcXVlc3QgPSAkLnBvc3QgYXBpX3VybCArICd0YXBlL3N0YXJ0JywgZGF0YVxuXG4gICAgICByZXF1ZXN0LmVycm9yICggZXJyb3IgKSAtPlxuXG4gICAgICAgIGNvbnNvbGUuZXJyb3IgJ2Vycm9yIGNyZWF0aW5nIGNhbGxpbmcgdGFwZS9zdGFydCdcbiAgICAgICAgY29uc29sZS5lcnJvciBlcnJvclxuXG4gICAgICAgIGNhbGxiYWNrIGVycm9yXG5cbiAgICAgIHJlcXVlc3QuZG9uZSAoIHJlc3BvbnNlICkgLT5cblxuICAgICAgICBpZiByZXNwb25zZS5lcnJvciB0aGVuIHJldHVybiBjYWxsYmFjayByZXNwb25zZS5lcnJvclxuXG4gICAgICAgIGNhbGxiYWNrICBudWxsLCByZXNwb25zZVxuXG4gICAgc3RvcF9yZWNvcmRpbmc6ICggcm9vbV9pZCwgY2FsbGJhY2sgKSAtPlxuXG4gICAgICBkYXRhID0gcm9vbV9pZDogcm9vbV9pZFxuXG4gICAgICByZXF1ZXN0ID0gJC5wb3N0IGFwaV91cmwgKyAnc3RhcGUvc3RvcCcsIGRhdGFcblxuICAgICAgcmVxdWVzdC5lcnJvciAoIGVycm9yICkgLT5cblxuICAgICAgICBjb25zb2xlLmVycm9yICdlcnJvciBjcmVhdGluZyBjYWxsaW5nIHN0YXBlL3N0b3AnXG4gICAgICAgIGNvbnNvbGUuZXJyb3IgZXJyb3JcblxuICAgICAgICBjYWxsYmFjayBlcnJvclxuXG4gICAgICByZXF1ZXN0LmRvbmUgKCByZXNwb25zZSApIC0+XG5cbiAgICAgICAgaWYgcmVzcG9uc2UuZXJyb3IgdGhlbiByZXR1cm4gY2FsbGJhY2sgcmVzcG9uc2UuZXJyb3JcblxuICAgICAgICBjYWxsYmFjayAgbnVsbCwgcmVzcG9uc2UiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxHQUFBOztBQUFBLENBQUEsRUFBVSxJQUFWLEdBQUE7O0FBRUEsQ0FGQSxFQUlFLEdBRkksQ0FBTjtDQUVFLENBQUEsSUFBQTtDQUNFLENBQUssQ0FBTCxDQUFBLElBQUssQ0FBRTtDQUNMLE1BQUEsR0FBQTtDQUFBLEVBQVUsR0FBVixDQUFBLEtBQVU7Q0FBVixFQUVjLEVBQWQsQ0FBQSxDQUFPLEVBQVM7Q0FFZCxJQUFBLEVBQU8sQ0FBUCxlQUFBO0NBQUEsSUFDQSxFQUFPLENBQVA7Q0FFUyxJQUFULEdBQUEsT0FBQTtDQUxGLE1BQWM7Q0FPTixFQUFLLENBQWIsR0FBTyxDQUFNLENBQUUsSUFBZjtDQUVFLEdBQUcsQ0FBSCxHQUFBO0NBQXVCLElBQU8sR0FBQSxTQUFBO1VBQTlCO0NBRVUsQ0FBTSxFQUFoQixJQUFBLE9BQUE7Q0FKRixNQUFhO0NBVmYsSUFBSztJQURQO0NBQUEsQ0FpQkEsR0FBQTtDQUNFLENBQVEsQ0FBQSxDQUFSLEVBQUEsRUFBUSxDQUFFO0NBQ1IsTUFBQSxHQUFBO0NBQUEsQ0FBMkMsQ0FBakMsQ0FBQSxFQUFWLENBQUEsT0FBVTtDQUFWLEVBRWMsRUFBZCxDQUFBLENBQU8sRUFBUztDQUVkLElBQUEsRUFBTyxDQUFQLDRCQUFBO0NBQUEsSUFDQSxFQUFPLENBQVA7Q0FFUyxJQUFULEdBQUEsT0FBQTtDQUxGLE1BQWM7Q0FPTixFQUFLLENBQWIsR0FBTyxDQUFNLENBQUUsSUFBZjtDQUVFLEdBQUcsQ0FBSCxHQUFBO0NBQXVCLElBQU8sR0FBQSxTQUFBO1VBQTlCO0NBRVUsQ0FBTSxFQUFoQixJQUFBLE9BQUE7Q0FKRixNQUFhO0NBVmYsSUFBUTtDQUFSLENBZ0JjLENBQUEsQ0FBZCxHQUFjLENBQUEsQ0FBRSxHQUFoQjtDQUVFLFNBQUEsR0FBQTtDQUFBLEVBQU8sQ0FBUCxFQUFBO0NBQU8sQ0FBUyxLQUFULENBQUE7Q0FBUCxPQUFBO0NBQUEsQ0FFMkMsQ0FBakMsQ0FBQSxFQUFWLENBQUEsT0FBVTtDQUZWLEVBSWMsRUFBZCxDQUFBLENBQU8sRUFBUztDQUVkLElBQUEsRUFBTyxDQUFQLDZCQUFBO0NBQUEsSUFDQSxFQUFPLENBQVA7Q0FFUyxJQUFULEdBQUEsT0FBQTtDQUxGLE1BQWM7Q0FPTixFQUFLLENBQWIsR0FBTyxDQUFNLENBQUUsSUFBZjtDQUVFLEdBQUcsQ0FBSCxHQUFBO0NBQXVCLElBQU8sR0FBQSxTQUFBO1VBQTlCO0NBRVUsQ0FBTSxFQUFoQixJQUFBLE9BQUE7Q0FKRixNQUFhO0NBN0JmLElBZ0JjO0NBaEJkLENBbUNhLENBQUEsQ0FBYixHQUFhLENBQUEsQ0FBRSxFQUFmO0NBRUUsU0FBQSxHQUFBO0NBQUEsRUFBTyxDQUFQLEVBQUE7Q0FBTyxDQUFTLEtBQVQsQ0FBQTtDQUFQLE9BQUE7Q0FBQSxDQUUwQyxDQUFoQyxDQUFBLEVBQVYsQ0FBQSxNQUFVO0NBRlYsRUFJYyxFQUFkLENBQUEsQ0FBTyxFQUFTO0NBRWQsSUFBQSxFQUFPLENBQVAsNEJBQUE7Q0FBQSxJQUNBLEVBQU8sQ0FBUDtDQUVTLElBQVQsR0FBQSxPQUFBO0NBTEYsTUFBYztDQU9OLEVBQUssQ0FBYixHQUFPLENBQU0sQ0FBRSxJQUFmO0NBRUUsR0FBRyxDQUFILEdBQUE7Q0FBdUIsSUFBTyxHQUFBLFNBQUE7VUFBOUI7Q0FFVSxDQUFNLEVBQWhCLElBQUEsT0FBQTtDQUpGLE1BQWE7Q0FoRGYsSUFtQ2E7Q0FuQ2IsQ0FzRGlCLENBQUEsQ0FBakIsSUFBaUIsQ0FBRSxNQUFuQjtDQUVFLFNBQUEsR0FBQTtDQUFBLEVBQU8sQ0FBUCxFQUFBO0NBQU8sQ0FBUyxLQUFULENBQUE7Q0FBUCxPQUFBO0NBQUEsQ0FFeUMsQ0FBL0IsQ0FBQSxFQUFWLENBQUEsS0FBVTtDQUZWLEVBSWMsRUFBZCxDQUFBLENBQU8sRUFBUztDQUVkLElBQUEsRUFBTyxDQUFQLDJCQUFBO0NBQUEsSUFDQSxFQUFPLENBQVA7Q0FFUyxJQUFULEdBQUEsT0FBQTtDQUxGLE1BQWM7Q0FPTixFQUFLLENBQWIsR0FBTyxDQUFNLENBQUUsSUFBZjtDQUVFLEdBQUcsQ0FBSCxHQUFBO0NBQXVCLElBQU8sR0FBQSxTQUFBO1VBQTlCO0NBRVUsQ0FBTSxFQUFoQixJQUFBLE9BQUE7Q0FKRixNQUFhO0NBbkVmLElBc0RpQjtDQXREakIsQ0F5RWdCLENBQUEsQ0FBaEIsR0FBZ0IsQ0FBQSxDQUFFLEtBQWxCO0NBRUUsU0FBQSxHQUFBO0NBQUEsRUFBTyxDQUFQLEVBQUE7Q0FBTyxDQUFTLEtBQVQsQ0FBQTtDQUFQLE9BQUE7Q0FBQSxDQUV5QyxDQUEvQixDQUFBLEVBQVYsQ0FBQSxLQUFVO0NBRlYsRUFJYyxFQUFkLENBQUEsQ0FBTyxFQUFTO0NBRWQsSUFBQSxFQUFPLENBQVAsMkJBQUE7Q0FBQSxJQUNBLEVBQU8sQ0FBUDtDQUVTLElBQVQsR0FBQSxPQUFBO0NBTEYsTUFBYztDQU9OLEVBQUssQ0FBYixHQUFPLENBQU0sQ0FBRSxJQUFmO0NBRUUsR0FBRyxDQUFILEdBQUE7Q0FBdUIsSUFBTyxHQUFBLFNBQUE7VUFBOUI7Q0FFVSxDQUFNLEVBQWhCLElBQUEsT0FBQTtDQUpGLE1BQWE7Q0F0RmYsSUF5RWdCO0lBM0ZsQjtDQUpGLENBQUEifX0seyJvZmZzZXQiOnsibGluZSI6OTM0OSwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL2FwcC5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsicmVxdWlyZSAnLi9nbG9iYWxzJ1xucmVxdWlyZSAnLi92ZW5kb3JzJ1xucmVxdWlyZSAnLi4vdmVuZG9ycy9wYXJhbGxheC5taW4uanMnXG5cblxudmlld3MgICAgICAgICAgID0gcmVxdWlyZSAnLi9jb250cm9sbGVycy92aWV3cydcbm5hdmlnYXRpb24gICAgICA9IHJlcXVpcmUgJy4vY29udHJvbGxlcnMvbmF2aWdhdGlvbidcbmFwcGNhc3QgICAgICAgICA9IHJlcXVpcmUgJy4vY29udHJvbGxlcnMvYXBwY2FzdCdcbnVzZXJfY29udHJvbGxlciA9IHJlcXVpcmUgJy4vY29udHJvbGxlcnMvdXNlcidcbmNsb3VkaW5hcnkgICAgICA9IHJlcXVpcmUgJy4vY29udHJvbGxlcnMvY2xvdWRpbmFyeSdcbiMgbW90aW9uICAgPSByZXF1aXJlICdhcHAvY29udHJvbGxlcnMvbW90aW9uJ1xuXG5jbGFzcyBBcHBcblxuXHQjIGxpbmsgdG8gd2luZG93XG5cdHdpbmRvdzogbnVsbFxuXG5cdCMgbGluayB0byB1dGlscy9zZXR0aW5nc1xuXHRzZXR0aW5nczogbnVsbFxuXG5cdCMgbGluayB0byBjb250cm9sbGVyL2xvY2FsX2Nvbm5lY3Rpb25cblx0bG9jYWw6IG51bGxcblxuXHRjb25zdHJ1Y3RvcjogLT4gXHRcblxuXHRcdGhhcHBlbnMgQFxuXG5cdFx0IyBhcmUgd2UgdXNpbmcgdGhpcz9cblx0XHRAb24gJ3JlYWR5JywgQGFmdGVyX3JlbmRlclxuXG5cdHN0YXJ0OiAtPlxuXHRcdFxuXHRcdEBsb2NhbCAgPSByZXF1aXJlICdhcHAvY29udHJvbGxlcnMvbG9jYWxfY29ubmVjdGlvbidcblx0XHRAd2luZG93ID0gcmVxdWlyZSAnYXBwL2NvbnRyb2xsZXJzL3dpbmRvdydcblxuXHRcdEBib2R5ICAgPSAkICdib2R5J1xuXG5cdFx0XG5cdFx0QHNldHRpbmdzID0gcmVxdWlyZSAnYXBwL3V0aWxzL3NldHRpbmdzJ1xuXHRcdEBzZXR0aW5ncy5iaW5kIEBib2R5XG5cblx0XHQjIENvbnRyb2xsZXJzIGJpbmRpbmdcblx0XHRkbyB2aWV3cy5iaW5kXG5cdFx0ZG8gbmF2aWdhdGlvbi5iaW5kXG5cblx0XHQjIHdoZW4gdGhlIG5ldyBhcmUgaXMgcmVuZGVyZWQsIGRvIHRoZSBzYW1lIHdpdGggdGhlIG5ldyBjb250ZW50XG5cblx0XHRuYXZpZ2F0aW9uLm9uICdiZWZvcmVfZGVzdHJveScsID0+XG5cdFx0XHRsb2cgXCItLS0tLS0tLS0gQkVGT1JFIERFU1RST1lcIlxuXHRcdFx0dmlld3MudW5iaW5kICcjY29udGVudCdcblxuXHRcdG5hdmlnYXRpb24ub24gJ2FmdGVyX3JlbmRlcicsID0+IFxuXHRcdFx0dmlld3MuYmluZCAgICAgICAnI2NvbnRlbnQnXG5cdFx0XHRuYXZpZ2F0aW9uLmJpbmQgJyNjb250ZW50J1xuXHRcdFx0ZG8gdXNlcl9jb250cm9sbGVyLmNoZWNrX3VzZXJcblxuXG5cdFx0XHRcblx0XG5cdCMgVXNlciBQcm94aWVzXG5cdGxvZ2luIDogKCB1c2VyICkgLT4gXG5cdFx0bG9nIFwiLS0tLS0tLS0+IGxvZ2luIGNhbGxlZCBmcm9tIG91dHNpZGVcIlxuXG5cdFx0aWYgQHNldHRpbmdzLmFmdGVyX2xvZ2luX3VybC5sZW5ndGggPiAwXG5cdFx0XHR1cmwgPSBAc2V0dGluZ3MuYWZ0ZXJfbG9naW5fdXJsXG5cdFx0XHRAc2V0dGluZ3MuYWZ0ZXJfbG9naW5fdXJsID0gXCJcIlxuXHRcdGVsc2Vcblx0XHRcdHVybCA9IFwiLyN7dXNlci51c2VybmFtZX1cIlxuXHRcdFx0XG5cdFx0bmF2aWdhdGlvbi5nbyB1cmxcblx0XHR1c2VyX2NvbnRyb2xsZXIubG9naW4gdXNlclxuXG5cdGxvZ291dDogLT4gXG5cdFx0bG9nIFwiW2xvZ2dlZCBvdXRdXCIsIHVzZXJcblx0XHRcblx0XHR1c2VyX2NvbnRyb2xsZXIubG9nb3V0KClcblxuXG5cdCMjI1xuXHQjIEFmdGVyIHRoZSB2aWV3cyBoYXZlIGJlZW4gcmVuZGVyZWRcblx0IyMjXG5cdGFmdGVyX3JlbmRlcjogKCApID0+XG5cdFx0bG9nIFwiYWZ0ZXJfcmVuZGVyXCJcblx0XHQjIEhpZGUgdGhlIGxvYWRpbmdcblx0XHRkZWxheSAxMCwgPT4gQGJvZHkuYWRkQ2xhc3MgXCJsb2FkZWRcIlxuXG5cdFx0XG5hcHAgPSBuZXcgQXBwXG5cbiQgLT4gYXBwLnN0YXJ0KClcblxubW9kdWxlLmV4cG9ydHMgPSB3aW5kb3cuYXBwID0gYXBwIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsNkRBQUE7R0FBQSwrRUFBQTs7QUFBQSxDQUFBLE1BQUEsSUFBQTs7QUFDQSxDQURBLE1BQ0EsSUFBQTs7QUFDQSxDQUZBLE1BRUEscUJBQUE7O0FBR0EsQ0FMQSxFQUtrQixFQUFsQixFQUFrQixjQUFBOztBQUNsQixDQU5BLEVBTWtCLElBQUEsR0FBbEIsZ0JBQWtCOztBQUNsQixDQVBBLEVBT2tCLElBQWxCLGdCQUFrQjs7QUFDbEIsQ0FSQSxFQVFrQixJQUFBLFFBQWxCLEtBQWtCOztBQUNsQixDQVRBLEVBU2tCLElBQUEsR0FBbEIsZ0JBQWtCOztBQUdaLENBWk47Q0FlQyxFQUFRLENBQVIsRUFBQTs7Q0FBQSxFQUdVLENBSFYsSUFHQTs7Q0FIQSxFQU1PLENBTlAsQ0FNQTs7Q0FFYSxDQUFBLENBQUEsVUFBQTtDQUVaLGtEQUFBO0NBQUEsR0FBQSxHQUFBO0NBQUEsQ0FHQSxFQUFBLEdBQUEsS0FBQTtDQWJELEVBUWE7O0NBUmIsRUFlTyxFQUFQLElBQU87Q0FFTixPQUFBLElBQUE7Q0FBQSxFQUFVLENBQVYsQ0FBQSxFQUFVLDJCQUFBO0NBQVYsRUFDVSxDQUFWLEVBQUEsQ0FBVSxpQkFBQTtDQURWLEVBR1UsQ0FBVixFQUFVO0NBSFYsRUFNWSxDQUFaLEdBQVksQ0FBWixZQUFZO0NBTlosR0FPQSxJQUFTO0NBUFQsR0FVRyxDQUFLO0NBVlIsR0FXRyxNQUFVO0NBWGIsQ0FlQSxDQUFnQyxDQUFoQyxLQUFnQyxDQUF0QixNQUFWO0NBQ0MsRUFBQSxHQUFBLG9CQUFBO0NBQ00sSUFBRCxDQUFMLElBQUEsR0FBQTtDQUZELElBQWdDO0NBSXJCLENBQVgsQ0FBOEIsTUFBQSxDQUFwQixDQUFWLEdBQUE7Q0FDQyxHQUFBLENBQUssQ0FBTCxJQUFBO0NBQUEsR0FDQSxFQUFBLElBQVU7Q0FDUyxTQUFuQixHQUFHLEVBQWU7Q0FIbkIsSUFBOEI7Q0FwQy9CLEVBZU87O0NBZlAsRUE2Q1EsQ0FBQSxDQUFSLElBQVU7Q0FDVCxFQUFBLEtBQUE7Q0FBQSxFQUFBLENBQUEsaUNBQUE7Q0FFQSxFQUFzQyxDQUF0QyxFQUFHLEVBQVMsT0FBZ0I7Q0FDM0IsRUFBQSxDQUFPLEVBQVAsRUFBZSxPQUFmO0NBQUEsQ0FBQSxDQUM0QixDQUEzQixFQUFELEVBQVMsT0FBVDtNQUZEO0NBSUMsRUFBQSxDQUFhLEVBQWIsRUFBQTtNQU5EO0NBQUEsQ0FRQSxDQUFBLENBQUEsTUFBVTtDQUNNLEdBQWhCLENBQUEsTUFBQSxJQUFlO0NBdkRoQixFQTZDUTs7Q0E3Q1IsRUF5RFEsR0FBUixHQUFRO0NBQ1AsQ0FBb0IsQ0FBcEIsQ0FBQSxVQUFBO0NBRWdCLEtBQWhCLEtBQUEsSUFBZTtDQTVEaEIsRUF5RFE7O0NBTVI7OztDQS9EQTs7Q0FBQSxFQWtFYyxNQUFBLEdBQWQ7Q0FDQyxPQUFBLElBQUE7Q0FBQSxFQUFBLENBQUEsVUFBQTtDQUVNLENBQU4sQ0FBVSxFQUFWLElBQVUsRUFBVjtDQUFjLEdBQUksQ0FBSixHQUFELEtBQUE7Q0FBYixJQUFVO0NBckVYLEVBa0VjOztDQWxFZDs7Q0FmRDs7QUF1RkEsQ0F2RkEsRUF1RkE7O0FBRUEsQ0F6RkEsRUF5RkUsTUFBQTtDQUFPLEVBQUQsRUFBSCxJQUFBO0NBQUg7O0FBRUYsQ0EzRkEsRUEyRmlCLEdBQVgsQ0FBTiJ9fSx7Im9mZnNldCI6eyJsaW5lIjo5NDQ2LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvY29udHJvbGxlcnMvYXBwY2FzdC5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4jIFNvY2tldCBjb250cm9sbGVyIHdpbGwgYmUgdXNlZCB0byBjb21tdW5pY2F0ZSB3aXRoIGRlc2t0b3AgYXBwIEFwcENhc3RcbiMjI1xuXG5hd2FyZSAgICA9IHJlcXVpcmUgJ2F3YXJlJ1xuIyBzaG9ydGN1dCBmb3IgdmVuZG9yIHNjcmlwdHNcbnYgICAgICAgPSByZXF1aXJlICdhcHAvdmVuZG9ycydcblxuIyB0aGUgY29udHJvbGxlciBpcyB0aGUgbW9kZWwsIG1vZGVybiBjb25jZXB0IG9mIGhlcm1hcGhyb2RpdGUgZmlsZVxuYXBwY2FzdCA9IGF3YXJlIHt9XG5cbiMgb25seSBlbmFibGUgaWYgYXZhaWxhYmxlIG9uIHdpbmRvd1xuV2ViU29ja2V0ID0gd2luZG93LldlYlNvY2tldCB8fCBudWxsXG5cbiMgd2Vic29ja2V0IGNvbm5lY3Rpb25zXG5hcHBjYXN0Lm1lc3NhZ2VzID0ge31cbmFwcGNhc3QudnUgICAgICAgPSB7fVxuXG5cbmFwcGNhc3Quc2V0ICdjb25uZWN0ZWQnLCBmYWxzZVxuIyBjb25uZWN0cyB0byBBcHBDYXN0J3MgV2ViU29ja2V0IHNlcnZlciBhbmQgbGlzdGVuIGZvciBtZXNzYWdlc1xuYXBwY2FzdC5jb25uZWN0ID0gLT5cblxuICBpZiBub3QgV2ViU29ja2V0XG4gICAgcmV0dXJuIGNvbnNvbGUuaW5mbyAnKyBzb2NrZXQgY29udHJvbGxlciB3b250IGNvbm5lY3QnXG5cbiAgbWVzc2FnZXNfc29ja2V0ID0gJ3dzOi8vbG9jYWxob3N0OjUxMjM0L2xvb3BjYXN0L21lc3NhZ2VzJ1xuXG4gIGFwcGNhc3QubWVzc2FnZXMgPSBuZXcgdi5SZWNvbm5lY3RpbmdXZWJzb2NrZXQgbWVzc2FnZXNfc29ja2V0XG5cbiAgYXBwY2FzdC5tZXNzYWdlcy5vbm9wZW4gPSAtPlxuICAgIGNvbnNvbGUuaW5mbyAnLSBzb2NrZXQgY29udHJvbGxlciBjb25uZWN0aW9uIG9wZW5lZCdcblxuICAgIGFwcGNhc3Quc2V0ICdjb25uZWN0ZWQnLCB0cnVlXG5cbiAgICBhcHBjYXN0Lm1lc3NhZ2VzLnNlbmQgSlNPTi5zdHJpbmdpZnkgWyAnZ2V0X2lucHV0X2RldmljZXMnIF1cblxuICBhcHBjYXN0Lm1lc3NhZ2VzLm9uY2xvc2UgPSAtPlxuICAgIGNvbnNvbGUuaW5mbyAnLSBBcHBDYXN0IGlzbnQgT1BFTiwgd2lsbCByZXRyeSB0byBjb25uZWN0J1xuXG4gICAgYXBwY2FzdC5zZXQgJ2Nvbm5lY3RlZCcsIGZhbHNlXG5cblxuICAjIHJvdXRlIGluY29taW5nIG1lc3NhZ2VzIHRvIGFwcGNhc3QuY2FsbGJhY2tzIGhhc2hcbiAgYXBwY2FzdC5tZXNzYWdlcy5vbm1lc3NhZ2UgPSAoIGUgKSAtPlxuXG4gICAganNvbiA9IGUuZGF0YVxuXG4gICAgdHJ5XG4gICAgICBmcm9tX2pzb24gPSBKU09OLnBhcnNlIGpzb25cbiAgICBjYXRjaCBlcnJvclxuICAgICAgY29uc29sZS5lcnJvciBcIi0gc29ja2V0IGNvbnRyb2xsZXIgZXJyb3IgcGFyc2luZyBqc29uXCJcbiAgICAgIGNvbnNvbGUuZXJyb3IgZXJyb3JcbiAgICAgIHJldHVybiBlcnJvclxuXG4gICAgbWV0aG9kID0gZnJvbV9qc29uWzBdXG4gICAgYXJncyAgID0gZnJvbV9qc29uWzFdXG4gICAgXG4gICAgaWYgJ2Vycm9yJyA9PSBtZXRob2RcbiAgICAgIHJldHVybiBjb25zb2xlLmxvZyAnZXJyb3InLCBhcmdzXG5cbiAgICBpZiB0eXBlb2YgYXBwY2FzdC5jYWxsYmFja3NbbWV0aG9kXSBpcyAnZnVuY3Rpb24nXG4gICAgICBhcHBjYXN0LmNhbGxiYWNrc1ttZXRob2RdKCBhcmdzIClcbiAgICBlbHNlIFxuICAgICAgY29uc29sZS5sb2cgXCIgKyBzb2NrZXQgY29udHJvbGxlciBoYXMgbm8gY2FsbGJhY2sgZm9yOlwiLCBtZXRob2RcblxuXG5cbiAgdnVfc29ja2V0ID0gJ3dzOi8vbG9jYWxob3N0OjUxMjM0L2xvb3BjYXN0L3Z1J1xuICBhcHBjYXN0LnZ1ID0gbmV3IHYuUmVjb25uZWN0aW5nV2Vic29ja2V0IHZ1X3NvY2tldFxuXG4gIGFwcGNhc3QudnUub25vcGVuID0gLT5cbiAgICBjb25zb2xlLmluZm8gJy0gc29ja2V0IFZVIGNvbm5lY3Rpb24gb3BlbmVkJ1xuXG4gICAgYXBwY2FzdC5zZXQgJ3Z1OmNvbm5lY3RlZCcsIHRydWVcblxuICBhcHBjYXN0LnZ1Lm9uY2xvc2UgPSAtPlxuICAgIGNvbnNvbGUuaW5mbyAnLSBzb2NrZXQgVlUgY29ubmVjdGlvbiBjbG9zZWQnXG5cbiAgICBhcHBjYXN0LnNldCAndnU6Y29ubmVjdGVkJywgZmFsc2VcblxuICAjIHJvdXRlIGluY29taW5nIG1lc3NhZ2VzIHRvIGFwcGNhc3QuY2FsbGJhY2tzIGhhc2hcbiAgYXBwY2FzdC52dS5vbm1lc3NhZ2UgPSAoIGUgKSAtPlxuXG4gICAgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXJcblxuICAgIHJlYWRlci5vbmxvYWQgPSAoIGUgKSAtPlxuICAgICAgYnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheSBlLnRhcmdldC5yZXN1bHRcblxuICAgICAgYXBwY2FzdC5zZXQgJ3N0cmVhbTp2dScsIGJ1ZmZlciAgXG5cbiAgICByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIgZS5kYXRhXG5cbmFwcGNhc3Quc3RhcnRfc3RyZWFtID0gKCB1c2VybmFtZSwgZGV2aWNlX25hbWUgKSAtPlxuXG4gIGNvbnNvbGUuaW5mbyBcIiBTVEFSVCBTVFJBRU0hISFcIlxuXG4gIGlmIGFwcGNhc3QuZ2V0KCBcInN0cmVhbTpzdGFydGluZ1wiIClcbiAgICBjb25zb2xlLmVycm9yIFwid2FpdGluZyBzdHJlYW0gdG8gc3RhcnQsIGNhbnQgc3RhcnQgYWdhaW5cIlxuXG4gICAgcmV0dXJuXG5cbiAgaWYgYXBwY2FzdC5nZXQoIFwic3RyZWFtOm9ubGluZVwiIClcbiAgICBjb25zb2xlLmVycm9yIFwic3RyZWFtIGlzIGFscmVhZHkgb25saW5lLCBjYW50IHN0YXJ0IGFnYWluXCJcblxuICAgIHJldHVyblxuXG4gIG1vdW50X3BvaW50ID0gXCJoZW1zXCJcbiAgbW91bnRfcG9pbnQgPSB1c2VybmFtZVxuICBwYXNzd29yZCAgICA9IFwibG9vcGNhc3QyMDE1XCJcblxuICBwYXlsb2FkID0gXG4gICAgZGV2aWNlX25hbWUgOiBkZXZpY2VfbmFtZVxuICAgIG1vdW50X3BvaW50IDogbW91bnRfcG9pbnRcbiAgICBwYXNzd29yZCAgICA6IHBhc3N3b3JkXG5cbiAgY29uc29sZS5pbmZvIFwiU0VORElORyBTVEFSVCBTVFJFQU0gVE8gQVBQQ0FTVFwiXG5cbiAgYXBwY2FzdC5zZXQgXCJzdHJlYW06c3RhcnRpbmdcIiwgdHJ1ZVxuICBhcHBjYXN0Lm1lc3NhZ2VzLnNlbmQgSlNPTi5zdHJpbmdpZnkgWyBcInN0YXJ0X3N0cmVhbVwiLCBwYXlsb2FkIF1cblxuYXBwY2FzdC5zdG9wX3N0cmVhbSA9IC0+XG5cbiAgYXBwY2FzdC5zZXQgXCJzdHJlYW06c3RvcHBpbmdcIiwgdHJ1ZVxuICBhcHBjYXN0Lm1lc3NhZ2VzLnNlbmQgSlNPTi5zdHJpbmdpZnkgWyBcInN0b3Bfc3RyZWFtXCIgXVxuXG5cbiMjI1xuIyBjYWxsYmFja3MgYXJlIGNhbGxlZCBieSBcIm1lc3NhZ2VzXCIgY29taW5nIGZyb20gdGhlIFdlYnNvY2tldFNlcnZlciBjcmVhdGVkXG4jIGJ5IHRoZSBkZXNrdG9wIGFwcGxpY2F0aW9uIEFwcENhc3RcbiMjI1xuYXBwY2FzdC5jYWxsYmFja3MgPVxuICBpbnB1dF9kZXZpY2VzICA6ICggYXJncyApIC0+XG5cbiAgICAjIGNvbnNvbGUubG9nIFwiKyBzb2NrZXQgY29udHJvbGxyIGdvdCBpbnB1dCBkZXZpY2VzXCIsIGFyZ3MuZGV2aWNlc1xuXG4gICAgIyBzYXZlcyBsaXN0IG9mIGRldmljZXMgYW5kIGJyb2FkY2FzdCBjaGFuZ2VcbiAgICBhcHBjYXN0LnNldCAnaW5wdXRfZGV2aWNlcycsIGFyZ3MuZGV2aWNlc1xuXG4gICAgIyBhdXRvbWF0aWNhbHkgdGVzdGluZyBzdHJlYW1cbiAgICAjIGFwcGNhc3Quc3RhcnRfc3RyZWFtIFwiU291bmRmbG93ZXIgKDJjaClcIlxuXG4gIHN0cmVhbV9zdGFydGVkIDogKCBhcmdzICkgLT5cblxuICAgIGlmIGFyZ3M/IGFuZCBhcmdzLmVycm9yP1xuXG4gICAgICBjb25zb2xlLmVycm9yIFwiLSBzdHJlYW1fc3RhcnRlZCBlcnJvcjpcIiwgYXJncy5lcnJvclxuXG4gICAgICBhcHBjYXN0LnNldCBcInN0cmVhbTplcnJvclwiLCBhcmdzLmVycm9yXG5cbiAgICAgIHJldHVyblxuXG4gICAgY29uc29sZS5pbmZvIFwiQVBQQ0FTVCBSRVBMSUVEOiBTVFJFQU0gU1RBUlRFRCFcIlxuXG4gICAgIyBzYXZlIGN1cnJlbnQgc3RyZWFtOm9ubGluZSBzdGF0dXNcbiAgICBhcHBjYXN0LnNldCAnc3RyZWFtOm9ubGluZScsIHRydWVcblxuICAgICMgcmVzZXQgb3RoZXIgc3RyYW1pbmcgZmxhZ3NcbiAgICBhcHBjYXN0LnNldCBcInN0cmVhbTpzdGFydGluZ1wiLCBudWxsXG4gICAgYXBwY2FzdC5zZXQgXCJzdHJlYW06ZXJyb3JcIiAgICwgbnVsbFxuXG4gIHN0cmVhbV9zdG9wcGVkOiAtPlxuXG4gICAgIyBzYXZlIGN1cnJlbnQgc3RyZWFtOm9ubGluZSBzdGF0dXNcbiAgICBhcHBjYXN0LnNldCAnc3RyZWFtOm9ubGluZScgICwgZmFsc2VcbiAgICBhcHBjYXN0LnNldCBcInN0cmVhbTpzdG9wcGluZ1wiLCBudWxsXG5cbiMjI1xuIyBMaXN0ZW5pbmcgdG8gbWVzc2FnZXNcbiMjI1xuYXBwY2FzdC5vbiAnaW5wdXRfZGV2aWNlJywgLT5cblxuICBpZiBhcHBjYXN0LmdldCAnc3RyZWFtOm9ubGluZSdcbiAgICBjb25zb2xlLmVycm9yICctIGlucHV0IGRldmljZSBjaGFuZ2VkIHdoaWxlIHN0cmVhbTpvbmxpbmUnXG4gICAgY29uc29sZS5lcnJvciAnPyB3aGF0IHNob3VsZCB3ZSBkbydcblxuIyBzaG91bGQgdHJ5IHRvIGNvbm5lY3Qgb25seSBvbiBpdCdzIG93biBwcm9maWxlIHBhZ2VcbiMgYXBwY2FzdC5jb25uZWN0KClcblxubW9kdWxlLmV4cG9ydHMgPSB3aW5kb3cuYXBwY2FzdCA9IGFwcGNhc3QiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztDQUFBO0NBQUEsR0FBQSx3QkFBQTs7QUFJQSxDQUpBLEVBSVcsRUFBWCxFQUFXOztBQUVYLENBTkEsRUFNVSxJQUFBLE1BQUE7O0FBR1YsQ0FUQSxDQVNVLENBQUEsRUFBQSxFQUFWOztBQUdBLENBWkEsRUFZWSxDQUFvQixFQUFkLEdBQWxCOztBQUdBLENBZkEsQ0FBQSxDQWVtQixJQUFaLENBQVA7O0FBQ0EsQ0FoQkEsQ0FnQkEsQ0FBbUIsSUFBWjs7QUFHUCxDQW5CQSxDQW1CeUIsQ0FBekIsRUFBQSxFQUFPLElBQVA7O0FBRUEsQ0FyQkEsRUFxQmtCLElBQVgsRUFBVztDQUVoQixLQUFBLG9CQUFBO0FBQU8sQ0FBUCxDQUFBLEVBQUcsS0FBSDtDQUNFLEdBQU8sR0FBTyxJQUFQLHVCQUFBO0lBRFQ7Q0FBQSxDQUdBLENBQWtCLFlBQWxCLHlCQUhBO0NBQUEsQ0FLQSxDQUF1QixDQUFBLEdBQWhCLENBQVAsT0FBdUIsTUFBQTtDQUx2QixDQU9BLENBQTBCLEdBQTFCLENBQU8sQ0FBUyxDQUFVO0NBQ3hCLEdBQUEsR0FBTyxnQ0FBUDtDQUFBLENBRXlCLENBQXpCLENBQUEsR0FBTyxJQUFQO0NBRVEsR0FBUixHQUFPLENBQVMsQ0FBTSxFQUF0QixRQUFxQztDQVp2QyxFQU8wQjtDQVAxQixDQWNBLENBQTJCLElBQXBCLENBQVMsQ0FBVztDQUN6QixHQUFBLEdBQU8scUNBQVA7Q0FFUSxDQUFpQixDQUF6QixFQUFBLEVBQU8sSUFBUDtDQWpCRixFQWMyQjtDQWQzQixDQXFCQSxDQUE2QixJQUF0QixDQUFTLENBQWhCO0NBRUUsT0FBQSw0QkFBQTtDQUFBLEVBQU8sQ0FBUDtDQUVBO0NBQ0UsRUFBWSxDQUFJLENBQUosQ0FBWixHQUFBO01BREY7Q0FHRSxLQURJO0NBQ0osSUFBQSxDQUFBLENBQU8saUNBQVA7Q0FBQSxJQUNBLENBQUEsQ0FBTztDQUNQLElBQUEsUUFBTztNQVBUO0NBQUEsRUFTUyxDQUFULEVBQUEsR0FBbUI7Q0FUbkIsRUFVUyxDQUFULEtBQW1CO0NBRW5CLEdBQUEsQ0FBYyxDQUFkLENBQUc7Q0FDRCxDQUE0QixDQUFyQixDQUFBLEdBQU8sTUFBUDtNQWJUO0FBZUcsQ0FBSCxHQUFBLENBQXVDLENBQXBDLENBQWMsRUFBVyxDQUE1QjtDQUNVLEdBQVIsRUFBa0IsQ0FBWCxFQUFXLElBQWxCO01BREY7Q0FHVSxDQUFpRCxDQUF6RCxHQUFBLENBQU8sTUFBUCw4QkFBQTtNQXBCeUI7Q0FyQjdCLEVBcUI2QjtDQXJCN0IsQ0E2Q0EsQ0FBWSxNQUFaLHlCQTdDQTtDQUFBLENBOENBLENBQWlCLENBQUEsR0FBVixFQUFVLFlBQUE7Q0E5Q2pCLENBZ0RBLENBQW9CLEdBQXBCLENBQU8sRUFBYTtDQUNsQixHQUFBLEdBQU8sd0JBQVA7Q0FFUSxDQUFvQixDQUE1QixDQUFBLEdBQU8sSUFBUCxHQUFBO0NBbkRGLEVBZ0RvQjtDQWhEcEIsQ0FxREEsQ0FBcUIsSUFBZCxFQUFjO0NBQ25CLEdBQUEsR0FBTyx3QkFBUDtDQUVRLENBQW9CLENBQTVCLEVBQUEsRUFBTyxJQUFQLEdBQUE7Q0F4REYsRUFxRHFCO0NBTWIsQ0FBRSxDQUFhLElBQWhCLEVBQVA7Q0FFRSxLQUFBLEVBQUE7QUFBUyxDQUFULEVBQVMsQ0FBVCxFQUFBLElBQUE7Q0FBQSxFQUVnQixDQUFoQixFQUFNLEdBQVk7Q0FDaEIsS0FBQSxJQUFBO0NBQUEsRUFBYSxDQUFBLEVBQWIsTUFBYTtDQUVMLENBQWlCLENBQXpCLEdBQUEsQ0FBTyxJQUFQLEVBQUE7Q0FMRixJQUVnQjtDQUtULEdBQVAsRUFBTSxLQUFOLE1BQUE7Q0F0RWMsRUE2RE87Q0E3RFA7O0FBd0VsQixDQTdGQSxDQTZGbUMsQ0FBWixJQUFoQixDQUFnQixDQUFFLEVBQUYsQ0FBdkI7Q0FFRSxLQUFBLHdCQUFBO0NBQUEsQ0FBQSxFQUFBLEdBQU8sV0FBUDtDQUVBLENBQUEsQ0FBRyxDQUFBLEdBQU8sVUFBUDtDQUNELEdBQUEsQ0FBQSxFQUFPLG9DQUFQO0NBRUEsU0FBQTtJQUxGO0NBT0EsQ0FBQSxDQUFHLENBQUEsR0FBTyxRQUFQO0NBQ0QsR0FBQSxDQUFBLEVBQU8scUNBQVA7Q0FFQSxTQUFBO0lBVkY7Q0FBQSxDQVlBLENBQWMsR0FaZCxLQVlBO0NBWkEsQ0FhQSxDQUFjLEtBYmQsR0FhQTtDQWJBLENBY0EsQ0FBYyxLQUFkLE1BZEE7Q0FBQSxDQWdCQSxDQUNFLElBREY7Q0FDRSxDQUFjLEVBQWQsT0FBQTtDQUFBLENBQ2MsRUFBZCxPQUFBO0NBREEsQ0FFYyxFQUFkLElBQUE7Q0FuQkYsR0FBQTtDQUFBLENBcUJBLEVBQUEsR0FBTywwQkFBUDtDQXJCQSxDQXVCQSxDQUFBLENBQUEsR0FBTyxVQUFQO0NBQ1EsQ0FBK0MsRUFBdkQsR0FBTyxDQUFTLENBQWhCLEtBQXFDO0NBMUJoQjs7QUE0QnZCLENBekhBLEVBeUhzQixJQUFmLEVBQWUsRUFBdEI7Q0FFRSxDQUFBLENBQUEsQ0FBQSxHQUFPLFVBQVA7Q0FDUSxHQUFSLEdBQU8sQ0FBUyxDQUFoQixJQUFxQztDQUhqQjs7Q0FNdEI7Ozs7Q0EvSEE7O0FBbUlBLENBbklBLEVBb0lFLElBREssRUFBUDtDQUNFLENBQUEsQ0FBaUIsQ0FBQSxLQUFFLElBQW5CO0NBS1UsQ0FBcUIsQ0FBN0IsQ0FBaUMsR0FBMUIsSUFBUCxJQUFBO0NBTEYsRUFBaUI7Q0FBakIsQ0FVQSxDQUFpQixDQUFBLEtBQUUsS0FBbkI7Q0FFRSxHQUFBLFVBQUcsTUFBSDtDQUVFLENBQXlDLEVBQUksQ0FBN0MsQ0FBQSxDQUFPLGtCQUFQO0NBQUEsQ0FFNEIsQ0FBNUIsQ0FBZ0MsQ0FBaEMsQ0FBQSxDQUFPLE9BQVA7Q0FFQSxXQUFBO01BTkY7Q0FBQSxHQVFBLEdBQU8sMkJBQVA7Q0FSQSxDQVc2QixDQUE3QixDQUFBLEdBQU8sUUFBUDtDQVhBLENBYytCLENBQS9CLENBQUEsR0FBTyxVQUFQO0NBQ1EsQ0FBdUIsQ0FBL0IsQ0FBQSxHQUFPLElBQVAsR0FBQTtDQTNCRixFQVVpQjtDQVZqQixDQTZCQSxDQUFnQixNQUFBLEtBQWhCO0NBR0UsQ0FBK0IsQ0FBL0IsQ0FBQSxDQUFBLEVBQU8sUUFBUDtDQUNRLENBQXVCLENBQS9CLENBQUEsR0FBTyxJQUFQLE1BQUE7Q0FqQ0YsRUE2QmdCO0NBaktsQixDQUFBOztDQXVLQTs7O0NBdktBOztBQTBLQSxDQTFLQSxDQTBLQSxDQUEyQixJQUFwQixFQUFvQixLQUEzQjtDQUVFLENBQUEsQ0FBRyxDQUFBLEdBQU8sUUFBUDtDQUNELEdBQUEsQ0FBQSxFQUFPLHFDQUFQO0NBQ1EsSUFBUixFQUFPLElBQVAsVUFBQTtJQUp1QjtDQUFBOztBQVMzQixDQW5MQSxFQW1MaUIsR0FBWCxDQUFOIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjk1OTgsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy9jb250cm9sbGVycy9jbG91ZGluYXJ5LmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBDbG91ZGluYXJ5XG5cdGluc3RhbmNlID0gbnVsbFxuXG5cdGNvbmZpZzogXG5cdFx0Y2xvdWRfbmFtZTogXCJcIlxuXHRcdGFwaV9rZXk6IFwiXCJcblxuXG5cdGNvbnN0cnVjdG9yOiAtPlxuXHRcdGlmIENsb3VkaW5hcnkuaW5zdGFuY2Vcblx0XHRcdGNvbnNvbGUuZXJyb3IgXCJZb3UgY2FuJ3QgaW5zdGFudGlhdGUgdGhpcyBDbG91ZGluYXJ5IHR3aWNlXCJcdFxuXHRcdFx0cmV0dXJuXG5cblx0XHRDbG91ZGluYXJ5Lmluc3RhbmNlID0gQFxuXG5cdHNldF9jb25maWc6ICggZGF0YSApIC0+XG5cblx0XHQjIGlmIGRhdGEgaXMgZGlmZmVyZW50IGZyb20gdGhlIGN1cnJlbnQgY29uZmlnLCB1cGRhdGUgaXRcblx0XHRpZiBAY29uZmlnLmNsb3VkX25hbWUgaXNudCBkYXRhLmNsb3VkX25hbWUgb3IgQGNvbmZpZy5hcGlfa2V5IGlzbnQgZGF0YS5hcGlfa2V5XG5cdFx0XHQjIFVwZGF0ZSB0aGUgaW50ZXJuYWwgb2JqZWN0XG5cdFx0XHRAY29uZmlnID0gZGF0YVxuXG5cdFx0XHQjIFVwZGF0ZSB0aGUgalF1ZXJ5IHBsdWdpbiBjb25maWdcblx0XHRcdCQuY2xvdWRpbmFyeS5jb25maWdcblx0XHRcdFx0Y2xvdWRfbmFtZTogQGNvbmZpZy5jbG91ZF9uYW1lIFxuXHRcdFx0XHRhcGlfa2V5ICAgOiBAY29uZmlnLmFwaV9rZXlcblxuXG4jIHdpbGwgYWx3YXlzIGV4cG9ydCB0aGUgc2FtZSBpbnN0YW5jZVxubW9kdWxlLmV4cG9ydHMgPSBuZXcgQ2xvdWRpbmFyeVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsTUFBQTs7QUFBTSxDQUFOO0NBQ0MsS0FBQSxFQUFBOztDQUFBLENBQUEsQ0FBVyxDQUFYLElBQUE7O0NBQUEsRUFHQyxHQUREO0NBQ0MsQ0FBWSxFQUFaLE1BQUE7Q0FBQSxDQUNTLEVBQVQsR0FBQTtDQUpELEdBQUE7O0NBT2EsQ0FBQSxDQUFBLGlCQUFBO0NBQ1osR0FBQSxJQUFBLEVBQWE7Q0FDWixJQUFBLENBQUEsQ0FBTyxzQ0FBUDtDQUNBLFdBQUE7TUFGRDtDQUFBLEVBSXNCLENBQXRCLElBQUEsRUFBVTtDQVpYLEVBT2E7O0NBUGIsRUFjWSxDQUFBLEtBQUUsQ0FBZDtDQUdDLEdBQUEsQ0FBMkIsQ0FBakIsQ0FBb0MsR0FBM0M7Q0FFRixFQUFVLENBQVQsRUFBRDtDQUdDLEtBQUQsSUFBWSxHQUFaO0NBQ0MsQ0FBWSxFQUFDLEVBQU0sRUFBbkIsRUFBQTtDQUFBLENBQ1ksRUFBQyxFQUFNLENBQW5CLENBQUE7Q0FQRixPQUtDO01BUlU7Q0FkWixFQWNZOztDQWRaOztDQUREOztBQTZCQSxDQTdCQSxFQTZCaUIsR0FBWCxDQUFOLEdBN0JBIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjk2MzYsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy9jb250cm9sbGVycy9sb2NhbF9jb25uZWN0aW9uLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiNcbiMgQ29udHJvbGxlciByZXNwb25zaWJsZSBmb3IgY29tbXVuaWNhdGlvbiB3aXRoIG90aGVyIGluc3RhbmNlcyBvZiB0aGUgYXBwXG4jIGZvciBpbnN0YW5jZSBhbm90aGVyIHRhYiBvciBwb3AgdXAgb3BlblxuI1xuIyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2plcmVteWhhcnJpcy9Mb2NhbENvbm5lY3Rpb24uanMvdHJlZS9tYXN0ZXJcbiMgZm9yZSBtb3JlIGluZm9ybWF0aW9uLCBmb3IgaW5zdGFuY2UgaW50ZWdyYXRpb24gd2l0aCBJRTlcbiNcbiMjI1xuXG5hcHAgPSByZXF1aXJlICdhcHAvYXBwJ1xuXG5jb25uZWN0aW9uID0gbmV3IExvY2FsQ29ubmVjdGlvbiAnYmV0YS5sb29wY2FzdC5mbSdcbmNvbm5lY3Rpb24ubGlzdGVuKClcblxuY29ubmVjdGlvbi5hZGRDYWxsYmFjayAnbG9naW4nLCAoIHVzZXIgKSAtPlxuXG4gIGNvbnNvbGUuaW5mbyAnICsgbG9jYXRpb24gY29ubmVjdGlvbiwgdXNlciBsb2dnZWQgaW46JywgdXNlclxuXG4gIGFwcC5sb2dpbiB1c2VyXG5cbmNvbm5lY3Rpb24uYWRkQ2FsbGJhY2sgJ2xvZ291dCcsIC0+XG5cbiAgY29uc29sZS5pbmZvICcgKyBsb2NhdGlvbiBjb25uZWN0aW9uLCB1c2VyIGxvZ2dlZCBvdXQnXG5cbiAgYXBwLmxvZ291dCgpXG5cbm1vZHVsZS5leHBvcnRzID0gY29ubmVjdGlvbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0NBQUE7Q0FBQSxHQUFBLFdBQUE7O0FBVUEsQ0FWQSxFQVVBLElBQU0sRUFBQTs7QUFFTixDQVpBLEVBWWlCLENBQUEsTUFBakIsS0FBaUIsR0FBQTs7QUFDakIsQ0FiQSxLQWFBLElBQVU7O0FBRVYsQ0FmQSxDQWVnQyxDQUFBLENBQUEsR0FBaEMsRUFBa0MsQ0FBeEIsQ0FBVjtDQUVFLENBQUEsRUFBQSxHQUFPLGtDQUFQO0NBRUksRUFBRCxDQUFILENBQUEsSUFBQTtDQUo4Qjs7QUFNaEMsQ0FyQkEsQ0FxQmlDLENBQUEsS0FBakMsQ0FBaUMsQ0FBdkIsQ0FBVjtDQUVFLENBQUEsRUFBQSxHQUFPLGtDQUFQO0NBRUksRUFBRCxHQUFILEdBQUE7Q0FKK0I7O0FBTWpDLENBM0JBLEVBMkJpQixHQUFYLENBQU4sR0EzQkEifX0seyJvZmZzZXQiOnsibGluZSI6OTY2OCwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL2NvbnRyb2xsZXJzL25hdmlnYXRpb24uY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbInNldHRpbmdzICBcdD0gcmVxdWlyZSAnYXBwL3V0aWxzL3NldHRpbmdzJ1xuaGFwcGVucyAgXHQ9IHJlcXVpcmUgJ2hhcHBlbnMnXG4jIHdheXMgICAgXHQ9IHJlcXVpcmUgJ3dheXMnXG4jIHdheXMudXNlIHJlcXVpcmUgJ3dheXMtYnJvd3NlcidcbnVybF9wYXJzZXIgPSByZXF1aXJlICdhcHAvdXRpbHMvdXJsX3BhcnNlcidcbnBhZ2UgPSByZXF1aXJlICdwYWdlJ1xuXG5jbGFzcyBOYXZpZ2F0aW9uXG5cblx0aW5zdGFuY2UgPSBudWxsXG5cdGZpcnN0X2xvYWRpbmc6IG9uXG5cdGZpcnN0X3VybF9jaGFuZ2U6IHRydWVcblxuXHRjb25zdHJ1Y3RvcjogLT5cblxuXHRcdGlmIE5hdmlnYXRpb24uaW5zdGFuY2Vcblx0XHRcdGNvbnNvbGUuZXJyb3IgXCJZb3UgY2FuJ3QgaW5zdGFudGlhdGUgdGhpcyBOYXZpZ2F0aW9uIHR3aWNlXCJcdFxuXG5cdFx0XHRyZXR1cm5cblxuXHRcdE5hdmlnYXRpb24uaW5zdGFuY2UgPSBAXG5cdFx0QGNvbnRlbnRfc2VsZWN0b3IgPSAnI2NvbnRlbnQgLmlubmVyX2NvbnRlbnQnXG5cdFx0QGNvbnRlbnRfZGl2ID0gJCBAY29udGVudF9zZWxlY3RvclxuXG5cdFx0aGFwcGVucyBAXG5cdFxuXHRcdCMgZXhwb3J0IHRvIHdpbmRvd1xuXHRcdCMgd2luZG93LndheXMgPSB3YXlzO1xuXHRcdFxuXHRcdCMgcm91dGluZ1xuXHRcdHBhZ2UgJyonLCBAdXJsX2NoYW5nZWRcblx0XHRwYWdlKCk7XG5cdFx0IyB3YXlzICcqJywgQHVybF9jaGFuZ2VkXG5cblxuXHRcdCMgRm9yIHRoZSBmaXJzdCBzY3JlZW4sIGVtaXQgdGhlIGV2ZW50IGFmdGVyX3JlbmRlci5cblx0XHQjIGlmLCBpbiB0aGUgbWVhbnRpbWUsIHRoZSBuYXZpZ2F0aW9uIGdvZXMgdG8gYW5vdGhlciB1cmxcblx0XHQjIHdlIHdvbid0IGVtaXQgdGhpcyBmaXJzdCBldmVudC5cblx0XHRkZWxheSAyMDAsID0+XG5cdFx0XHRpZiBAZmlyc3RfbG9hZGluZyB0aGVuIEBlbWl0ICdhZnRlcl9yZW5kZXInXG5cblxuXHR1cmxfY2hhbmdlZDogKCByZXEgKSA9PlxuXHRcdGlmIEBmaXJzdF91cmxfY2hhbmdlXG5cdFx0XHRAZmlyc3RfdXJsX2NoYW5nZSA9IG9mZlxuXHRcdFx0cmV0dXJuXG5cblx0XHRsb2cgXCJ1cmxfY2hhbmdlZFwiLCByZXEsIHJlcS5wYXRoXG5cblxuXHRcdCMgaWUgaGFjayBmb3IgaGFzaCB1cmxzXG5cdFx0cmVxLnVybCA9IHJlcS5wYXRoLnJlcGxhY2UoIFwiLyNcIiwgJycgKVxuXG5cdFx0IyBsb2cgXCIgY29udHJvbGxlcnMvbmF2aWdhdGlvbi91cmxfY2hhbmdlZDo6ICN7cmVxLnVybH1cIlxuXHRcdCMgVE9ETzogXG5cdFx0IyAgLSBkb24ndCByZWxvYWQgaWYgdGhlIGNvbnRlbnQgaXMgYWxyZWFkeSBsb2FkZWRcblx0XHQjICAtIGltcGxlbWVudCB0cmFuc2l0aW9ucyBvdXRcblx0XHQjICAtIGltcGxlbWVudCB0cmFuc2l0aW9uICBpbiBcblxuXHRcdGRpdiA9ICQoICc8ZGl2PicgKVxuXG5cdFx0QGVtaXQgJ2JlZm9yZV9sb2FkJ1xuXG5cdFx0ZGl2LmxvYWQgcmVxLnVybCwgPT5cblxuXHRcdFx0QGVtaXQgJ29uX2xvYWQnXG5cblx0XHRcdGlmIGFwcC5ib2R5LnNjcm9sbFRvcCgpID4gMFxuXHRcdFx0XHRhcHAuYm9keS5hbmltYXRlIHNjcm9sbFRvcDogMFxuXG5cblx0XHRcdEBlbWl0ICdiZWZvcmVfZGVzdHJveSdcdFx0XG5cblx0XHRcdGRlbGF5IDQwMCwgPT5cdFx0XHRcblxuXHRcdFx0XHRuZXdfY29udGVudCA9IGRpdi5maW5kKCBAY29udGVudF9zZWxlY3RvciApLmNoaWxkcmVuKClcblx0XHRcdFx0XG5cdFx0XHRcdEBjb250ZW50X2RpdiA9ICQgQGNvbnRlbnRfc2VsZWN0b3JcblxuXHRcdFx0XHQjIFJlbW92ZSBvbGQgY29udGVudFxuXHRcdFx0XHRAY29udGVudF9kaXYuY2hpbGRyZW4oKS5yZW1vdmUoKVxuXG5cdFx0XHRcdCMgcG9wdWxhdGUgd2l0aCB0aGUgbG9hZGVkIGNvbnRlbnRcblx0XHRcdFx0QGNvbnRlbnRfZGl2LmFwcGVuZCBuZXdfY29udGVudFxuXHRcdFx0XHRkZWxheSAxMCwgPT4gQGVtaXQgJ2FmdGVyX3JlbmRlcidcblxuXHQjI1xuXHQjIE5hdmlnYXRlcyB0byBhIGdpdmVuIFVSTCB1c2luZyBIdG1sIDUgaGlzdG9yeSBBUElcblx0IyNcblx0Z286ICggdXJsICkgLT5cblxuXHRcdCMgSWYgaXQncyBhIHBvcHVwLCBieXBhc3Mgd2F5cyBhbmQgc2VhbWxlc3MgbmF2aWdhdGlvblxuXHRcdGlmIHdpbmRvdy5vcGVuZXI/XG5cdFx0XHRsb2NhdGlvbi5ocmVmID0gdXJsXG5cdFx0XHRyZXR1cm4gdHJ1ZVxuXG5cdFx0QGZpcnN0X2xvYWRpbmcgPSBvZmZcblxuXHRcdGxvZyBcIltOYXZpZ2F0ZXNdIGdvXCIsIHVybFxuXHRcdHBhZ2UgdXJsXG5cdFx0IyB3YXlzLmdvIHVybFxuXG5cdFx0cmV0dXJuIGZhbHNlXG5cblx0Z29fc2lsZW50OiAoIHVybCwgdGl0bGUgKSAtPlxuXHRcdHBhZ2UucmVwbGFjZSB1cmwsIG51bGwsIG51bGwsIGZhbHNlXG5cdFx0XG5cdCMjXG5cdCMgTG9va3MgZm9yIGludGVybmFsIGxpbmtzIGFuZCBiaW5kIHRoZW4gdG8gY2xpZW50IHNpZGUgbmF2aWdhdGlvblxuXHQjIGFzIGluOiBodG1sIEhpc3RvcnkgYXBpXG5cdCMjXG5cdGJpbmQ6ICggc2NvcGUgPSAnYm9keScgKSAtPlxuXG5cdFx0JCggc2NvcGUgKS5maW5kKCAnYScgKS5vbiAnY2xpY2snLCAtPlxuXHRcdFx0JGl0ZW0gPSAkIEBcblxuXHRcdFx0aHJlZiA9ICRpdGVtLmF0dHIgJ2hyZWYnXG5cblx0XHRcdGlmICFocmVmPyB0aGVuIHJldHVybiBmYWxzZVxuXG5cdFx0XHQjIGlmIHRoZSBsaW5rIGhhcyBodHRwIGFuZCB0aGUgZG9tYWluIGlzIGRpZmZlcmVudFxuXHRcdFx0aWYgaHJlZi5pbmRleE9mKCAnaHR0cCcgKSA+PSAwIGFuZCBocmVmLmluZGV4T2YoIGRvY3VtZW50LmRvbWFpbiApIDwgMCBcblx0XHRcdFx0cmV0dXJuIHRydWVcblxuXHRcdFx0aWYgaHJlZi5pbmRleE9mKCBcImphdmFzY3JpcHRcIiApIGlzIDAgb3IgaHJlZi5pbmRleE9mKCBcInRlbDpcIiApIGlzIDBcblx0XHRcdFx0cmV0dXJuIHRydWVcblxuXHRcdFx0aWYgJGl0ZW0uYXR0ciggJ3RhcmdldCcgKT9cblx0XHRcdFx0cmV0dXJuIHRydWVcblxuXHRcdFx0aWYgaHJlZi5pbmRleE9mKCBcIiNcIiApIGlzIDBcblx0XHRcdFx0cmV0dXJuIGZhbHNlXG5cblx0XHRcdCMgQ2hlY2sgaWYgdGhlIHVybCBpcyB0aGUgc2FtZVxuXHRcdFx0YSA9IHVybF9wYXJzZXIuZ2V0X3BhdGhuYW1lIGhyZWZcblx0XHRcdGIgPSB1cmxfcGFyc2VyLmdldF9wYXRobmFtZSBsb2NhdGlvbi5wYXRobmFtZVxuXHRcdFx0aWYgYSBpcyBiXG5cdFx0XHRcdHJldHVybiBmYWxzZSBcblxuXHRcdFx0cmV0dXJuIE5hdmlnYXRpb24uaW5zdGFuY2UuZ28gaHJlZlxuXG5cbiMgd2lsbCBhbHdheXMgZXhwb3J0IHRoZSBzYW1lIGluc3RhbmNlXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBOYXZpZ2F0aW9uIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsMkNBQUE7R0FBQSwrRUFBQTs7QUFBQSxDQUFBLEVBQWEsSUFBQSxDQUFiLFlBQWE7O0FBQ2IsQ0FEQSxFQUNZLElBQVosRUFBWTs7QUFHWixDQUpBLEVBSWEsSUFBQSxHQUFiLFlBQWE7O0FBQ2IsQ0FMQSxFQUtPLENBQVAsRUFBTyxDQUFBOztBQUVELENBUE47Q0FTQyxLQUFBLEVBQUE7O0NBQUEsQ0FBQSxDQUFXLENBQVgsSUFBQTs7Q0FBQSxFQUNlLENBRGYsU0FDQTs7Q0FEQSxFQUVrQixDQUZsQixZQUVBOztDQUVhLENBQUEsQ0FBQSxpQkFBQTtDQUVaLGdEQUFBO0NBQUEsT0FBQSxJQUFBO0NBQUEsR0FBQSxJQUFBLEVBQWE7Q0FDWixJQUFBLENBQUEsQ0FBTyxzQ0FBUDtDQUVBLFdBQUE7TUFIRDtDQUFBLEVBS3NCLENBQXRCLElBQUEsRUFBVTtDQUxWLEVBTW9CLENBQXBCLFlBQUEsU0FOQTtDQUFBLEVBT2UsQ0FBZixPQUFBLEtBQWU7Q0FQZixHQVNBLEdBQUE7Q0FUQSxDQWVVLENBQVYsQ0FBQSxPQUFBO0NBZkEsR0FnQkE7Q0FoQkEsQ0F1QlcsQ0FBWCxDQUFBLENBQUEsSUFBVztDQUNWLEdBQUcsQ0FBQyxDQUFKLE9BQUE7Q0FBd0IsR0FBRCxDQUFDLFNBQUQsQ0FBQTtRQURiO0NBQVgsSUFBVztDQTdCWixFQUlhOztDQUpiLEVBaUNhLE1BQUUsRUFBZjtDQUNDLEVBQUEsS0FBQTtPQUFBLEtBQUE7Q0FBQSxHQUFBLFlBQUE7Q0FDQyxFQUFvQixDQUFuQixDQUFELENBQUEsVUFBQTtDQUNBLFdBQUE7TUFGRDtDQUFBLENBSW1CLENBQW5CLENBQUEsU0FBQTtDQUpBLENBUWtDLENBQS9CLENBQUgsR0FBVTtDQVJWLEVBZ0JBLENBQUEsR0FBTTtDQWhCTixHQWtCQSxTQUFBO0NBRUksQ0FBYyxDQUFmLENBQUgsS0FBa0IsRUFBbEI7Q0FFQyxHQUFBLENBQUMsQ0FBRCxHQUFBO0NBRUEsRUFBTSxDQUFILEVBQUgsR0FBRztDQUNGLEVBQUcsQ0FBSyxHQUFSLENBQUE7Q0FBaUIsQ0FBVyxPQUFYLENBQUE7Q0FBakIsU0FBQTtRQUhEO0NBQUEsR0FNQSxDQUFDLENBQUQsVUFBQTtDQUVNLENBQUssQ0FBWCxFQUFBLElBQVcsSUFBWDtDQUVDLFVBQUEsQ0FBQTtDQUFBLEVBQWMsQ0FBQSxDQUFXLEdBQXpCLEdBQUEsS0FBYztDQUFkLEVBRWUsRUFBZCxHQUFELEdBQUEsS0FBZTtDQUZmLElBS0MsQ0FBRCxFQUFBLEdBQVk7Q0FMWixJQVFDLENBQUQsRUFBQSxHQUFZO0NBQ04sQ0FBTixDQUFVLEVBQVYsSUFBVSxNQUFWO0NBQWMsR0FBRCxDQUFDLFNBQUQsR0FBQTtDQUFiLFFBQVU7Q0FYWCxNQUFXO0NBVlosSUFBa0I7Q0F0RG5CLEVBaUNhOztDQWpDYixDQWdGQSxDQUFJLE1BQUU7Q0FHTCxHQUFBLGlCQUFBO0NBQ0MsRUFBZ0IsQ0FBaEIsRUFBQSxFQUFRO0NBQ1IsR0FBQSxTQUFPO01BRlI7Q0FBQSxFQUlpQixDQUFqQixDQUpBLFFBSUE7Q0FKQSxDQU1zQixDQUF0QixDQUFBLFlBQUE7Q0FOQSxFQU9BLENBQUE7Q0FHQSxJQUFBLE1BQU87Q0E3RlIsRUFnRkk7O0NBaEZKLENBK0ZrQixDQUFQLEVBQUEsSUFBWDtDQUNNLENBQWEsQ0FBbEIsQ0FBSSxDQUFKLEVBQUEsSUFBQTtDQWhHRCxFQStGVzs7Q0EvRlgsRUFzR00sQ0FBTixDQUFNLElBQUU7O0dBQVEsR0FBUjtNQUVQO0NBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxFQUFBLEVBQW1DLEVBQW5DO0NBQ0MsU0FBQSxPQUFBO0NBQUEsRUFBUSxDQUFBLENBQVIsQ0FBQTtDQUFBLEVBRU8sQ0FBUCxDQUFZLENBQVo7Q0FFQSxHQUFJLEVBQUosTUFBQTtDQUFlLElBQUEsVUFBTztRQUp0QjtDQU9BLEVBQXFFLENBQWxFLEVBQUgsQ0FBRyxDQUFzRDtDQUN4RCxHQUFBLFdBQU87UUFSUjtDQVVBLEdBQUcsQ0FBZ0MsQ0FBbkMsQ0FBRyxLQUFBO0NBQ0YsR0FBQSxXQUFPO1FBWFI7Q0FhQSxHQUFHLEVBQUgsc0JBQUE7Q0FDQyxHQUFBLFdBQU87UUFkUjtDQWdCQSxFQUFHLENBQUEsQ0FBdUIsQ0FBMUIsQ0FBRztDQUNGLElBQUEsVUFBTztRQWpCUjtDQUFBLEVBb0JJLENBQUEsRUFBSixJQUFjLEVBQVY7Q0FwQkosRUFxQkksR0FBSixFQUFvQyxFQUF0QixFQUFWO0NBQ0osR0FBRyxDQUFLLENBQVI7Q0FDQyxJQUFBLFVBQU87UUF2QlI7Q0F5QkEsQ0FBTyxFQUFBLElBQW1CLEVBQVQsR0FBVjtDQTFCUixJQUFtQztDQXhHcEMsRUFzR007O0NBdEdOOztDQVREOztBQStJQSxDQS9JQSxFQStJaUIsR0FBWCxDQUFOLEdBL0lBIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjk3OTUsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy9jb250cm9sbGVycy91c2VyLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJ0cmFuc2Zvcm0gPSByZXF1aXJlICdhcHAvdXRpbHMvaW1hZ2VzL3RyYW5zZm9ybSdcbmhhcHBlbnMgICA9IHJlcXVpcmUgJ2hhcHBlbnMnXG5uYXZpZ2F0aW9uID0gcmVxdWlyZSAnYXBwL2NvbnRyb2xsZXJzL25hdmlnYXRpb24nXG5cbm1vZHVsZS5leHBvcnRzID0gaGFwcGVuc1xuXHRcblx0VVNFUl9ERUZBVUxUX0FWQVRBUjogXCIvaW1hZ2VzL3Byb2ZpbGUtMS5qcGdcIlxuXG5cblx0bG9nb3V0OiAoIGNhbGxiYWNrID0gLT4gKSAtPlxuXHRcdFxuXHRcdGlmIG5vdCBAaXNfbG9nZ2VkKCkgdGhlbiByZXR1cm4gY2FsbGJhY2sgZXJyb3I6IGNvZGU6ICdub2RlX2xvZ2dlZCdcblxuXHRcdGxvZyBcIltVc2VyXSB0cnlpbmcgdG8gbG9nb3V0Li4uXCJcblxuXHRcdCQucG9zdCAnL2FwaS92MS9sb2dvdXQnLCB7fSwgKGRhdGEpID0+XG5cdFx0XHRsb2cgXCJbVXNlcl0gbG9nb3V0IH4gc3VjY2Vzc1wiLCBkYXRhXG5cblx0XHRcdEBlbWl0ICd1c2VyOnVubG9nZ2VkJ1xuXG5cdFx0XHRhcHAuYm9keS5yZW1vdmVDbGFzcyBcImxvZ2dlZFwiXG5cblx0XHRcdGxvZyBcIltVc2VyIENvbnRyb2xsZXJdIGRlbGV0aW5nIHVzZXIgdmFyaWFibGVcIlxuXHRcdFx0ZGVsZXRlIGxvb3BjYXN0LnVzZXJcblxuXHRcdFx0bmF2aWdhdGlvbi5nbyAnLydcblxuXHRcdFx0Y2FsbGJhY2s/KClcblx0XG5cdGxvZ2luOiAoIHVzZXIgKSAtPlxuXG5cdFx0bG9vcGNhc3QudXNlciA9IHVzZXJcblxuXHRcdGxvZyBcImxvZ2luXCIsIHVzZXJcblx0XHQjIEFkZCBpbWFnZXMgdXJsc1xuXG5cdFx0aWYgbm90IHVzZXIuYXZhdGFyP1xuXHRcdFx0dXNlci5hdmF0YXIgPSB0aGlzLlVTRVJfREVGQVVMVF9BVkFUQVJcblx0XHRcblx0XHRcdFxuXHRcdGxvb3BjYXN0LnVzZXIuaW1hZ2VzID1cblx0XHRcdHRvcF9iYXI6IHRyYW5zZm9ybS50b3BfYmFyIHVzZXIuYXZhdGFyXG5cdFx0XHRhdmF0YXI6IHRyYW5zZm9ybS5hdmF0YXIgdXNlci5hdmF0YXJcblxuXHRcdGFwcC5ib2R5LmFkZENsYXNzIFwibG9nZ2VkXCJcblxuXHRcdEBlbWl0ICd1c2VyOmxvZ2dlZCcsIEBnZXRfdXNlcigpXG5cblx0XHRsb2cgXCJbVXNlciBDb250cm9sbGVyXSBsb2dpblwiLCBAZ2V0X3VzZXIoKVxuXG5cdGNoZWNrX3VzZXI6IC0+IFxuXHRcdGxvZyAnW1VzZXIgQ29udHJvbGxlcl0gY2hlY2tfdXNlcicsIGxvb3BjYXN0XG5cdFx0aWYgQGlzX2xvZ2dlZCgpXG5cdFx0XHRAbG9naW4gQGdldF91c2VyKClcblx0XHRlbHNlXG5cdFx0XHRAbG9nb3V0KClcblxuXHRpc19sb2dnZWQ6IC0+IEBnZXRfdXNlcigpP1xuXG5cdGdldF91c2VyOiAtPiBsb29wY2FzdC51c2VyXG5cblx0c2V0X3VzZXI6ICh1c2VyKSAtPiBsb29wY2FzdC51c2VyID0gdXNlciJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLDBCQUFBOztBQUFBLENBQUEsRUFBWSxJQUFBLEVBQVosbUJBQVk7O0FBQ1osQ0FEQSxFQUNZLElBQVosRUFBWTs7QUFDWixDQUZBLEVBRWEsSUFBQSxHQUFiLGtCQUFhOztBQUViLENBSkEsRUFJaUIsR0FBWCxDQUFOO0NBRUMsQ0FBQSxpQkFBQSxJQUFBO0NBQUEsQ0FHQSxDQUFRLEdBQVIsRUFBUSxDQUFFO0NBRVQsT0FBQSxJQUFBOztHQUZvQixHQUFYLEdBQVc7TUFFcEI7QUFBTyxDQUFQLEdBQUEsS0FBTztDQUFrQixPQUFPLEtBQUE7Q0FBUyxDQUFPLEdBQVAsR0FBQTtDQUFPLENBQU0sRUFBTixNQUFBLEdBQUE7VUFBUDtDQUFoQixPQUFPO01BQWhDO0NBQUEsRUFFQSxDQUFBLHdCQUFBO0NBRUMsQ0FBd0IsQ0FBSSxDQUE3QixLQUE4QixFQUE5QixLQUFBO0NBQ0MsQ0FBK0IsQ0FBL0IsQ0FBQSxFQUFBLG1CQUFBO0NBQUEsR0FFQSxDQUFDLENBQUQsU0FBQTtDQUZBLEVBSUcsQ0FBSyxFQUFSLEVBQUEsR0FBQTtDQUpBLEVBTUEsR0FBQSxvQ0FBQTtBQUNBLENBUEEsR0FBQSxFQU9BLEVBQWU7Q0FQZixDQVNBLENBQUEsR0FBQSxJQUFVO0NBVmtCLEVBWTVCO0NBWkQsSUFBNkI7Q0FUOUIsRUFHUTtDQUhSLENBdUJBLENBQU8sQ0FBQSxDQUFQLElBQVM7Q0FFUixFQUFnQixDQUFoQixJQUFRO0NBQVIsQ0FFYSxDQUFiLENBQUEsR0FBQTtDQUdBLEdBQUEsZUFBQTtDQUNDLEVBQWMsQ0FBVixFQUFKLGFBQUE7TUFORDtDQUFBLEVBVUMsQ0FERCxFQUFBLEVBQVE7Q0FDUCxDQUFTLEVBQXNCLEVBQS9CLENBQUEsRUFBa0I7Q0FBbEIsQ0FDUSxFQUFxQixFQUE3QixHQUFpQjtDQVhsQixLQUFBO0NBQUEsRUFhRyxDQUFILElBQUE7Q0FiQSxDQWVxQixFQUFyQixJQUFxQixLQUFyQjtDQUVJLENBQTJCLENBQS9CLENBQWdDLElBQUQsR0FBL0IsY0FBQTtDQTFDRCxFQXVCTztDQXZCUCxDQTRDQSxDQUFZLE1BQUEsQ0FBWjtDQUNDLENBQW9DLENBQXBDLENBQUEsSUFBQSxzQkFBQTtDQUNBLEdBQUEsS0FBRztDQUNELEdBQUEsQ0FBRCxHQUFPLEtBQVA7TUFERDtDQUdFLEdBQUEsRUFBRCxPQUFBO01BTFU7Q0E1Q1osRUE0Q1k7Q0E1Q1osQ0FtREEsQ0FBVyxNQUFYO0NBQVcsVUFBRztDQW5EZCxFQW1EVztDQW5EWCxDQXFEQSxDQUFVLEtBQVYsQ0FBVTtDQUFZLE9BQUQsR0FBUjtDQXJEYixFQXFEVTtDQXJEVixDQXVEQSxDQUFVLENBQUEsSUFBVixDQUFXO0NBQWtCLEVBQU8sQ0FBaEIsSUFBUSxHQUFSO0NBdkRwQixFQXVEVTtDQTdEWCxDQUlpQiJ9fSx7Im9mZnNldCI6eyJsaW5lIjo5ODYzLCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvY29udHJvbGxlcnMvdmlld3MuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbImhhcHBlbnMgPSByZXF1aXJlICdoYXBwZW5zJ1xuaGFwcGVuc19kZXN0cm95ID0gcmVxdWlyZSAnYXBwL3V0aWxzL2hhcHBlbnNfZGVzdHJveSdcblxuY2xhc3MgVmlld1xuXG5cdFVOSVFVRV9JRCAgXHQ9IDBcblxuXG5cdCMjI1xuXHRIYXNoIE1hcCB0byBzdG9yZSB0aGUgdmlld3M6XG5cblx0aGFzaF9tb2RlbCA9IHtcblx0XHRcIjx2aWV3X25hbWU+XCIgOiBbIDx2aWV3X2luc3RhbmNlPiwgPHZpZXdfaW5zdGFuY2U+LCAuLiBdLFxuXHRcdFwiPHZpZXdfbmFtZT5cIiA6IFsgPHZpZXdfaW5zdGFuY2U+LCA8dmlld19pbnN0YW5jZT4sIC4uIF1cblx0fVxuXHQjIyNcblx0aGFzaF9tb2RlbCAgOiB7fVxuXG5cblx0IyMjXG5cdFVpZCBNYXAuIEludGVybmFsIG1hcCB1c2VkIGZvciBlYXNpbHkgZ2V0IGEgdmlldyBieSB1aWRcblxuXHR1aWRfbWFwID0ge1xuXHRcdFwiPFVOSVFVRV9JRD5cIiA6IHsgbmFtZSA6IDx2aWV3X25hbWU+LCBpbmRleDogPHZpZXdfaW5kZXg+IH0sXG5cdFx0XCI8VU5JUVVFX0lEPlwiIDogeyBuYW1lIDogPHZpZXdfbmFtZT4sIGluZGV4OiA8dmlld19pbmRleD4gfSxcblx0XHQgIC4uLlxuXHR9XG5cdCMjI1xuXHR1aWRfbWFwOiB7fVxuXG5cblxuXG5cblx0IyBHZXQgdGhlIHZpZXcgZnJvbSB0aGUgaGFzaCBtb2RlbFxuXHRnZXQ6ICggaWQsIGluZGV4ID0gMCApID0+XG5cdFx0dW5sZXNzIEBoYXNoX21vZGVsWyBpZCBdP1xuXHRcdFx0IyBjb25zb2xlLmVycm9yIFwiVmlldyAje2lkfSAje2luZGV4fSBkb2Vzbid0IGV4aXN0c1wiXG5cdFx0XHRyZXR1cm4gZmFsc2VcblxuXHRcdEBoYXNoX21vZGVsWyBpZCBdWyBpbmRleCBdXG5cblxuXG5cdGdldF9ieV91aWQ6ICggdWlkICkgPT5cblx0XHRpZiBAdWlkX21hcFsgdWlkIF0/XG5cdFx0XHRuYW1lID0gQHVpZF9tYXBbIHVpZCBdLm5hbWVcblx0XHRcdGluZGV4ID0gQHVpZF9tYXBbIHVpZCBdLmluZGV4XG5cblx0XHRcdHJldHVybiBAZ2V0IG5hbWUsIGluZGV4XG5cblx0XHRyZXR1cm4gZmFsc2VcblxuXHRnZXRfYnlfZG9tOiAoIHNlbGVjdG9yICkgPT4gQGdldF9ieV91aWQgJCggc2VsZWN0b3IgKS5kYXRhICd1aWQnXG5cblxuXG5cdGJpbmQ6ICggc2NvcGUgPSAnYm9keScsIHRvbG9nID0gZmFsc2UgKSAtPlxuXG5cdFx0IyBjb25zb2xlLmVycm9yIFwiQmluZGluZ3Mgdmlld3M6ICN7c2NvcGV9XCJcblx0XHQkKCBzY29wZSApLmZpbmQoICdbZGF0YS12aWV3XScgKS5lYWNoKCAoIGluZGV4LCBpdGVtICkgPT5cblxuXHRcdFx0JGl0ZW0gPSAkIGl0ZW1cblxuXHRcdFx0dmlld19uYW1lID0gJGl0ZW0uZGF0YSggJ3ZpZXcnIClcblxuXHRcdFx0JGl0ZW0ucmVtb3ZlQXR0ciAnZGF0YS12aWV3J1xuXG5cdFx0XHRpZiB2aWV3X25hbWUuc3Vic3RyaW5nKDAsIDEpIGlzIFwiW1wiXG5cdFx0XHRcdG5hbWVzID0gdmlld19uYW1lLnN1YnN0cmluZygxLCB2aWV3X25hbWUubGVuZ3RoIC0gMSkuc3BsaXQoXCIsXCIpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdG5hbWVzID0gW3ZpZXdfbmFtZV1cblxuXHRcdFx0Zm9yIG5hbWUgaW4gbmFtZXNcblx0XHRcdFx0QF9hZGRfdmlldyAkaXRlbSwgbmFtZVxuXG5cdFx0XHQjIHJlbW92ZSB0aGUgZGF0YS12aWV3IGF0dHJpYnV0ZSwgc28gaXQgd29uJ3QgYmUgaW5zdGFudGlhdGVkIHR3aWNlIVxuXHRcdFx0JGl0ZW0ucmVtb3ZlQXR0ciAnZGF0YS12aWV3J1xuXG5cdFx0KS5wcm9taXNlKCkuZG9uZSA9PiBAZW1pdCBcImJpbmRlZFwiXG5cblx0dW5iaW5kOiAoIHNjb3BlID0gJ2JvZHknICkgLT5cblx0XHQkKCBzY29wZSApLmZpbmQoICdbZGF0YS11aWRdJyApLmVhY2goICggaW5kZXgsIGl0ZW0gKSA9PlxuXG5cdFx0XHQkaXRlbSA9ICQgaXRlbVxuXG5cdFx0XHRpZCA9ICRpdGVtLmRhdGEgJ3VpZCdcblxuXHRcdFx0diA9IHZpZXcuZ2V0X2J5X3VpZCBpZFxuXG5cdFx0XHRpZiB2XG5cdFx0XHRcdGhhcHBlbnNfZGVzdHJveSB2XG5cdFx0XHRcdHYuZGVzdHJveT8oKVxuXHRcdFx0XHR2LnZpZXdfbmFtZSA9IG51bGxcblx0XHRcdFx0dmlldy5vbl92aWV3X2Rlc3Ryb3llZCBpZFxuXG5cdFx0KS5wcm9taXNlKCkuZG9uZSA9PiBAZW1pdCBcInVuYmluZGVkXCJcblxuXG5cblx0X2FkZF92aWV3OiAoICRpdGVtLCB2aWV3X25hbWUgKSAtPlxuXG5cdFx0dHJ5XG5cdFx0XHR2aWV3ID0gcmVxdWlyZSBcImFwcC92aWV3cy8je3ZpZXdfbmFtZX1cIlxuXHRcdGNhdGNoIGVcblx0XHRcdGNvbnNvbGUud2FybiAnZSAtPicsIGUubWVzc2FnZVxuXHRcdFx0Y29uc29sZS5lcnJvciBcImFwcC92aWV3cy8je3ZpZXd9IG5vdCBmb3VuZCBmb3IgXCIsICRpdGVtXG5cblx0XHR2aWV3ID0gbmV3IHZpZXcgJGl0ZW1cblxuXHRcdCMgU2F2ZSB0aGUgdmlldyBpbiBhIGhhc2ggbW9kZWxcblx0XHRAaGFzaF9tb2RlbFsgdmlld19uYW1lIF0gPz0gW11cblxuXHRcdGwgPSBAaGFzaF9tb2RlbFsgdmlld19uYW1lIF0ubGVuZ3RoXG5cblx0XHRAaGFzaF9tb2RlbFsgdmlld19uYW1lIF1bIGwgXSA9IHZpZXdcblxuXG5cdFx0IyBTYXZlIHRoZSBpbmNyZW1lbnRhbCB1aWQgdG8gdGhlIGRvbSBhbmQgdG8gdGhlIGluc3RhbmNlXG5cdFx0dmlldy51aWQgPSBVTklRVUVfSURcblx0XHR2aWV3LnZpZXdfbmFtZSA9IHZpZXdfbmFtZVxuXG5cdFx0IyBsb2cgXCJbdmlld10gYWRkXCIsIHZpZXcudWlkLCB2aWV3LnZpZXdfbmFtZVxuXG5cdFx0JGl0ZW0uYXR0ciAnZGF0YS11aWQnLCBVTklRVUVfSURcblxuXHRcdCMgU2F2ZSB0aGUgdmlldyBpbiBhIGxpbmVhciBhcnJheSBtb2RlbFxuXHRcdEB1aWRfbWFwWyBVTklRVUVfSUQgXSA9XG5cdFx0XHRuYW1lICA6IHZpZXdfbmFtZVxuXHRcdFx0aW5kZXggOiBAaGFzaF9tb2RlbFsgdmlld19uYW1lIF0ubGVuZ3RoIC0gMVxuXG5cblx0XHRVTklRVUVfSUQrK1xuXG5cblxuXG5cdG9uX3ZpZXdfZGVzdHJveWVkOiAoIHVpZCApIC0+XG5cdFx0XG5cdFx0IyBsb2cgXCJbVmlld10gb25fdmlld19kZXN0cm95ZWRcIiwgdWlkXG5cdFx0aWYgQHVpZF9tYXBbIHVpZCBdP1xuXG5cdFx0XHQjIEdldCB0aGUgZGF0YSBmcm9tIHRoZSB1aWQgbWFwXG5cdFx0XHRuYW1lICA9IEB1aWRfbWFwWyB1aWQgXS5uYW1lXG5cdFx0XHRpbmRleCA9IEB1aWRfbWFwWyB1aWQgXS5pbmRleFxuXG5cdFx0XHQjIGRlbGV0ZSB0aGUgcmVmZXJlbmNlIGluIHRoZSBtb2RlbFxuXHRcdFx0aWYgQGhhc2hfbW9kZWxbIG5hbWUgXVsgaW5kZXggXT9cblxuXHRcdFx0XHQjIGRlbGV0ZSB0aGUgaXRlbSBmcm9tIHRoZSB1aWRfbWFwXG5cdFx0XHRcdGRlbGV0ZSBAdWlkX21hcFsgdWlkIF1cblxuXHRcdFx0XHQjIERlbGV0ZSB0aGUgaXRlbSBmcm9tIHRoZSBoYXNoX21vZGVsXG5cdFx0XHRcdEBoYXNoX21vZGVsWyBuYW1lIF0uc3BsaWNlIGluZGV4LCAxXG5cblx0XHRcdFx0IyBVcGRhdGUgdGhlIGluZGV4IG9uIHRoZSB1aWRfbWFwIGZvciB0aGUgdmlld3MgbGVmdCBvZiB0aGUgc2FtZSB0eXBlXG5cdFx0XHRcdGZvciBpdGVtLCBpIGluIEBoYXNoX21vZGVsWyBuYW1lIF1cblx0XHRcdFx0XHRAdWlkX21hcFsgaXRlbS51aWQgXS5pbmRleCA9IGlcblxuXG5cdFx0XHRcdFxuXG5cblxudmlldyA9IG5ldyBWaWV3XG5oYXBwZW5zIHZpZXdcblxubW9kdWxlLmV4cG9ydHMgPSB3aW5kb3cudmlldyA9IHZpZXdcblxuXG4jIGV4cG9ydGluZyBnZXQgbWV0aG9kIGZvciB3aW5kb3csIHNvIHlvdSBjYW4gcmV0cmlldmUgdmlld3MganVzdCB3aXRoIFZpZXcoIGlkIClcbndpbmRvdy5WaWV3ID0gdmlldyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGdDQUFBO0dBQUEsK0VBQUE7O0FBQUEsQ0FBQSxFQUFVLElBQVYsRUFBVTs7QUFDVixDQURBLEVBQ2tCLElBQUEsUUFBbEIsWUFBa0I7O0FBRVosQ0FITjtDQUtDLEtBQUEsR0FBQTs7Ozs7O0NBQUE7O0NBQUEsQ0FBQSxDQUFjLE1BQWQ7O0NBR0E7Ozs7Ozs7O0NBSEE7O0NBQUEsQ0FBQSxDQVdjLE9BQWQ7O0NBR0E7Ozs7Ozs7OztDQWRBOztDQUFBLENBQUEsQ0F1QlMsSUFBVDs7Q0F2QkEsQ0E4QkssQ0FBTCxFQUFLLElBQUU7O0dBQVksR0FBUjtNQUNWO0NBQUEsR0FBQSx1QkFBQTtDQUVDLElBQUEsUUFBTztNQUZSO0NBSUMsQ0FBWSxFQUFaLENBQWtCLEtBQU4sQ0FBYjtDQW5DRCxFQThCSzs7Q0E5QkwsRUF1Q1ksTUFBRSxDQUFkO0NBQ0MsT0FBQSxHQUFBO0NBQUEsR0FBQSxxQkFBQTtDQUNDLEVBQU8sQ0FBUCxFQUFBLENBQWlCO0NBQWpCLEVBQ1EsQ0FBQyxDQUFULENBQUEsQ0FBa0I7Q0FFbEIsQ0FBa0IsQ0FBWCxDQUFDLENBQUQsUUFBQTtNQUpSO0NBTUEsSUFBQSxNQUFPO0NBOUNSLEVBdUNZOztDQXZDWixFQWdEWSxLQUFBLENBQUUsQ0FBZDtDQUE2QixHQUFBLENBQVcsR0FBQSxFQUFaLENBQUE7Q0FoRDVCLEVBZ0RZOztDQWhEWixDQW9Ed0IsQ0FBbEIsQ0FBTixDQUFNLElBQUU7Q0FHUCxPQUFBLElBQUE7O0dBSGUsR0FBUjtNQUdQOztHQUgrQixHQUFSO01BR3ZCO0NBQUEsQ0FBZ0QsQ0FBVCxDQUF2QyxDQUFBLElBQXlDLEVBQXpDLEVBQUE7Q0FFQyxTQUFBLDZCQUFBO0NBQUEsRUFBUSxDQUFBLENBQVIsQ0FBQTtDQUFBLEVBRVksQ0FBQSxDQUFLLENBQWpCLEdBQUE7Q0FGQSxJQUlLLENBQUwsSUFBQSxDQUFBO0NBRUEsQ0FBMEIsQ0FBMUIsQ0FBRyxDQUE2QixDQUFoQyxHQUFZO0NBQ1gsQ0FBK0IsQ0FBdkIsRUFBUixDQUErQixFQUEvQixDQUFpQjtNQURsQixFQUFBO0NBR0MsRUFBUSxFQUFSLEdBQUEsQ0FBUTtRQVRUO0FBV0EsQ0FBQSxVQUFBLGlDQUFBOzBCQUFBO0NBQ0MsQ0FBa0IsRUFBbEIsQ0FBQyxHQUFELENBQUE7Q0FERCxNQVhBO0NBZU0sSUFBRCxLQUFMLENBQUEsRUFBQTtDQWpCRCxFQW1CaUIsQ0FuQmpCLENBQXVDLEVBQXZDLEVBbUJpQjtDQUFJLEdBQUQsQ0FBQyxHQUFELEtBQUE7Q0FuQnBCLElBbUJpQjtDQTFFbEIsRUFvRE07O0NBcEROLEVBNEVRLEVBQUEsQ0FBUixHQUFVO0NBQ1QsT0FBQSxJQUFBOztHQURpQixHQUFSO01BQ1Q7Q0FBQSxDQUErQyxDQUFULENBQXRDLENBQUEsSUFBd0MsRUFBeEMsQ0FBQTtDQUVDLFNBQUEsRUFBQTtDQUFBLEVBQVEsQ0FBQSxDQUFSLENBQUE7Q0FBQSxDQUVBLENBQUssQ0FBQSxDQUFLLENBQVY7Q0FGQSxDQUlJLENBQUEsQ0FBSSxFQUFSLElBQUk7Q0FFSixHQUFHLEVBQUg7Q0FDQyxPQUFBLE9BQUE7O0NBQ0MsU0FBRDtVQURBO0NBQUEsRUFFYyxDQUZkLElBRUEsQ0FBQTtDQUNLLENBQUwsRUFBSSxXQUFKLEVBQUE7UUFab0M7Q0FBdEMsRUFjaUIsQ0FkakIsQ0FBc0MsRUFBdEMsRUFjaUI7Q0FBSSxHQUFELENBQUMsS0FBRCxHQUFBO0NBZHBCLElBY2lCO0NBM0ZsQixFQTRFUTs7Q0E1RVIsQ0ErRm9CLENBQVQsRUFBQSxJQUFYO0NBRUMsT0FBQSxTQUFBO0NBQUE7Q0FDQyxFQUFPLENBQVAsRUFBQSxDQUFPLEVBQUEsR0FBUztNQURqQjtDQUdDLEtBREs7Q0FDTCxDQUFxQixFQUFyQixFQUFBLENBQU87Q0FBUCxDQUNrRCxDQUF4QixDQUFYLENBQWYsQ0FBQSxDQUFPLEtBQVEsS0FBZjtNQUpEO0NBQUEsRUFNVyxDQUFYLENBQVc7O0NBR0UsRUFBZSxFQUFmLElBQUE7TUFUYjtDQUFBLEVBV0ksQ0FBSixFQVhBLEdBV2lCLENBQUE7Q0FYakIsRUFhZ0MsQ0FBaEMsS0FBYSxDQUFBO0NBYmIsRUFpQkEsQ0FBQSxLQWpCQTtDQUFBLEVBa0JpQixDQUFqQixLQUFBO0NBbEJBLENBc0J1QixFQUF2QixDQUFLLElBQUwsQ0FBQTtDQXRCQSxFQTBCQyxDQURELEdBQVUsRUFBQTtDQUNULENBQVEsRUFBUixFQUFBLEdBQUE7Q0FBQSxDQUNRLENBQWtDLENBQWpDLENBQVQsQ0FBQSxHQUFxQixDQUFBO0NBM0J0QixLQUFBO0FBOEJBLENBaENVLFFBZ0NWLEVBQUE7Q0EvSEQsRUErRlc7O0NBL0ZYLEVBb0ltQixNQUFFLFFBQXJCO0NBR0MsT0FBQSxzQ0FBQTtDQUFBLEdBQUEscUJBQUE7Q0FHQyxFQUFRLENBQVIsRUFBQSxDQUFrQjtDQUFsQixFQUNRLENBQUMsQ0FBVCxDQUFBLENBQWtCO0NBR2xCLEdBQUcsRUFBSCw4QkFBQTtBQUdDLENBQUEsRUFBaUIsQ0FBVCxFQUFSLENBQWlCLENBQWpCO0NBQUEsQ0FHa0MsRUFBakMsQ0FBRCxDQUFBLEVBQUEsRUFBYTtDQUdiO0NBQUE7Y0FBQSxxQ0FBQTswQkFBQTtDQUNDLEVBQVUsQ0FBVCxDQUFELEVBQVU7Q0FEWDt5QkFURDtRQVBEO01BSGtCO0NBcEluQixFQW9JbUI7O0NBcEluQjs7Q0FMRDs7QUFvS0EsQ0FwS0EsRUFvS08sQ0FBUDs7QUFDQSxDQXJLQSxHQXFLQSxHQUFBOztBQUVBLENBdktBLEVBdUtpQixDQUFBLEVBQVgsQ0FBTjs7QUFJQSxDQTNLQSxFQTJLYyxDQUFkLEVBQU0ifX0seyJvZmZzZXQiOnsibGluZSI6MTAwMzksImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy9jb250cm9sbGVycy93aW5kb3cuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbImhhcHBlbnMgPSByZXF1aXJlICdoYXBwZW5zJ1xuXG4jIGNyZWF0ZSBhbmQgZXhwb3J0IGEgbmV3IGhhcHBlbnMgb2JqZWN0XG53aW4gPVxuICBvYmogOiBPYmplY3RcbiAgdyAgIDogMFxuICBoICAgOiAwXG4gIHkgICA6IDBcblxubW9kdWxlLmV4cG9ydHMgPSBoYXBwZW5zKCB3aW4gKVxuXG5cblxuIyBldmVudCBoYW5kbGluZyBmb3Igd2luZG93IHJlc2l6ZVxud2luLm9iaiA9ICQgd2luZG93XG53aW4ub2JqLm9uICdyZXNpemUnLCBvbl9yZXNpemUgPSAtPlxuXHR3aW4udyA9IHdpbi5vYmoud2lkdGgoKVxuXHR3aW4uaCA9IHdpbi5vYmouaGVpZ2h0KClcblx0d2luLmVtaXQgJ3Jlc2l6ZSdcblxuIyB0cmlnZ2VyIHJlc2l6ZSBhdXRvbWF0aWNhbGx5IGFmdGVyIDEwMCBtc1xuZGVsYXkgMTAwLCBvbl9yZXNpemVcblxubG9nIFwib25lXCJcblxuXG4jIGdsb2JhbCBjbGljayBldmVudFxuJCggJ2JvZHknICkub24gJ2NsaWNrJywgLT4gd2luLmVtaXQgXCJib2R5OmNsaWNrZWRcIlxuXG5cbiMgc2Nyb2xsIGV2ZW50XG53aW4ub2JqLm9uICdzY3JvbGwnLCBvbl9zY3JvbGwgPSAtPlxuICB3aW4ueSA9IHdpbi5vYmouc2Nyb2xsVG9wKCk7XG4gIHdpbi5lbWl0ICdzY3JvbGwnLCB3aW4ueVxuXG4jIHRyaWdnZXIgc2Nyb2xsIGF1dG9tYXRpY2FsbHkgYWZ0ZXIgMTAwIG1zXG5kZWxheSAxMDAsIG9uX3Njcm9sbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLDhCQUFBOztBQUFBLENBQUEsRUFBVSxJQUFWLEVBQVU7O0FBR1YsQ0FIQSxFQUdBO0NBQ0UsQ0FBQSxDQUFBLEdBQUE7Q0FBQSxDQUNBO0NBREEsQ0FFQTtDQUZBLENBR0E7Q0FQRixDQUFBOztBQVNBLENBVEEsRUFTaUIsR0FBWCxDQUFOOztBQUtBLENBZEEsRUFjRyxHQUFPOztBQUNWLENBZkEsQ0FlQSxDQUFHLEtBQUgsQ0FBcUI7Q0FDcEIsQ0FBQSxDQUFHLEVBQUs7Q0FBUixDQUNBLENBQUcsR0FBSztDQUNKLEVBQUQsQ0FBSCxJQUFBLENBQUE7Q0FIZ0M7O0FBTWpDLENBckJBLENBcUJXLENBQVgsRUFBQSxJQUFBOztBQUVBLENBdkJBLEVBdUJBLEVBQUE7O0FBSUEsQ0EzQkEsQ0EyQkEsQ0FBd0IsR0FBeEIsQ0FBQSxFQUF3QjtDQUFPLEVBQUQsQ0FBSCxLQUFBLEtBQUE7Q0FBSDs7QUFJeEIsQ0EvQkEsQ0ErQkEsQ0FBRyxLQUFILENBQXFCO0NBQ25CLENBQUEsQ0FBRyxNQUFLO0NBQ0osQ0FBZSxDQUFoQixDQUFILElBQUEsQ0FBQTtDQUYrQjs7QUFLakMsQ0FwQ0EsQ0FvQ1csQ0FBWCxFQUFBLElBQUEifX0seyJvZmZzZXQiOnsibGluZSI6MTAwNzcsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy9nbG9iYWxzLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiMgb24gdGhlIGJyb3dzZXIsIHdpbmRvdyBpcyB0aGUgZ2xvYmFsIGhvbGRlclxuIyMjXG5cbiMgdXRpbHNcblxud2luZG93LmRlbGF5ID0gcmVxdWlyZSAnLi9nbG9iYWxzL2RlbGF5J1xuXG53aW5kb3cuaW50ZXJ2YWwgID0gcmVxdWlyZSAnLi9nbG9iYWxzL2ludGVydmFsJ1xuXG53aW5kb3cubG9nICAgPSByZXF1aXJlICcuL2dsb2JhbHMvbG9nJ1xuXG53aW5kb3cubW92ZXIgPSByZXF1aXJlICcuL2dsb2JhbHMvbW92ZXInXG5cbiMgd2lkZWx5IHVzZWQgbW9kdWxlc1xuXG53aW5kb3cuaGFwcGVucyA9IHJlcXVpcmUgJ2hhcHBlbnMnXG5cblxubW9kdWxlLmV4cG9ydHMgPSB3aW5kb3ciXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztDQUFBO0FBTUEsQ0FOQSxFQU1lLEVBQWYsQ0FBTSxDQUFTLFVBQUE7O0FBRWYsQ0FSQSxFQVFtQixHQUFiLENBQWEsQ0FBbkIsWUFBbUI7O0FBRW5CLENBVkEsRUFVQSxHQUFNLENBQVMsUUFBQTs7QUFFZixDQVpBLEVBWWUsRUFBZixDQUFNLENBQVMsVUFBQTs7QUFJZixDQWhCQSxFQWdCaUIsR0FBWCxDQUFOLEVBQWlCOztBQUdqQixDQW5CQSxFQW1CaUIsR0FBWCxDQUFOIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjEwMDk1LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvZ2xvYmFscy9kZWxheS5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSAoIGRlbGF5LCBmdW5rICkgLT4gc2V0VGltZW91dCBmdW5rLCBkZWxheSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxDQUFPLENBQW1CLENBQVQsQ0FBQSxDQUFBLENBQVgsQ0FBTixFQUFtQjtDQUE0QixDQUFNLEVBQWpCLENBQUEsSUFBQSxDQUFBO0NBQW5CIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjEwMTAxLCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvZ2xvYmFscy9pbnRlcnZhbC5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSAoIGludGVydmFsLCBmdW5rICkgLT4gc2V0SW50ZXJ2YWwgZnVuaywgaW50ZXJ2YWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsQ0FBTyxDQUFzQixDQUFaLENBQUEsRUFBWCxDQUFOLENBQWlCLENBQUU7Q0FBZ0MsQ0FBTSxFQUFsQixJQUFBLENBQUEsRUFBQTtDQUF0QiJ9fSx7Im9mZnNldCI6eyJsaW5lIjoxMDEwNywiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL2dsb2JhbHMvbG9nLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IC0+XG5cdGxvZy5oaXN0b3J5ID0gbG9nLmhpc3Rvcnkgb3IgW10gIyBzdG9yZSBsb2dzIHRvIGFuIGFycmF5IGZvciByZWZlcmVuY2Vcblx0bG9nLmhpc3RvcnkucHVzaCBhcmd1bWVudHNcblxuXHRpZiBjb25zb2xlP1xuXHRcdGNvbnNvbGUubG9nIEFycmF5OjpzbGljZS5jYWxsKGFyZ3VtZW50cykiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsQ0FBTyxFQUFVLEdBQVgsQ0FBTixFQUFpQjtDQUNoQixDQUFBLENBQUcsQ0FBMEIsR0FBN0I7Q0FBQSxDQUNBLENBQUcsQ0FBSCxHQUFXLEVBQVg7Q0FFQSxDQUFBLEVBQUcsOENBQUg7Q0FDUyxFQUFSLENBQVksQ0FBSyxFQUFWLEVBQVksRUFBbkI7SUFMZTtDQUFBIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjEwMTE3LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvZ2xvYmFscy9tb3Zlci5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSBcblx0c2Nyb2xsX3RvIDogKGVsLCB3aXRoX3RvcGJhciA9IGZhbHNlLCBzcGVlZCA9IDMwMCkgLT5cblxuXHRcdHkgPSBlbC5wb3NpdGlvbigpLnRvcFxuXG5cdFx0bG9nIFwiW01vdmVyXSBzY3JvbGxfdG9cIiwgeVxuXHRcdEBzY3JvbGxfdG9feSB5LCB3aXRoX3RvcGJhciwgc3BlZWRcblx0XHRcblxuXHRzY3JvbGxfdG9feTogKHksIHdpdGhfdG9wYmFyID0gdHJ1ZSwgc3BlZWQgPSAzMDApIC0+XG5cdFx0aWYgd2l0aF90b3BiYXJcblx0XHRcdHkgLT0gYXBwLnNldHRpbmdzLmhlYWRlcl9oZWlnaHRcblxuXHRcdGxvZyBcIlttb3Zlcl0gc2Nyb2xsX3RvX3lcIiwgeVxuXG5cdFx0eSArPSAyMFxuXHRcdFxuXHRcdCQoICdodG1sLCBib2R5JyApLmFuaW1hdGUgc2Nyb2xsVG9wOiB5LCBzcGVlZCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxDQUFPLEVBQ04sR0FESyxDQUFOO0NBQ0MsQ0FBQSxDQUFZLEVBQUEsSUFBWixFQUFZO0NBRVgsT0FBQTs7R0FGOEIsR0FBZDtNQUVoQjs7R0FGNkMsR0FBUjtNQUVyQztDQUFBLENBQU0sQ0FBRixDQUFKLElBQUk7Q0FBSixDQUV5QixDQUF6QixDQUFBLGVBQUE7Q0FDQyxDQUFlLEVBQWYsQ0FBRCxNQUFBO0NBTEQsRUFBWTtDQUFaLENBUUEsQ0FBYSxFQUFBLElBQUMsRUFBZDs7R0FBK0IsR0FBZDtNQUNoQjs7R0FENEMsR0FBUjtNQUNwQztDQUFBLEdBQUEsT0FBQTtDQUNDLEVBQVEsQ0FBSCxFQUFMLEVBQWlCLEtBQWpCO01BREQ7Q0FBQSxDQUcyQixDQUEzQixDQUFBLGlCQUFBO0NBSEEsQ0FBQSxFQUtBO0NBRUEsTUFBQSxJQUFBLENBQUE7Q0FBMEIsQ0FBVyxJQUFYLEdBQUE7Q0FSZCxDQVE0QixHQUF4QyxDQUFBO0NBaEJELEVBUWE7Q0FUZCxDQUFBIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjEwMTUwLCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdXRpbHMvYXBwY2FzdC5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiYXBwY2FzdCA9IHJlcXVpcmUgJ2FwcC9jb250cm9sbGVycy9hcHBjYXN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5cbiAgc3RhcnRfcmVjb3JkaW5nIDogLT5cbiAgICBpZiBub3QgYXBwY2FzdC5nZXQgJ3N0cmVhbWluZzpvbmxpbmUnXG5cbiAgICAgIGNvbnNvbGUuZXJyb3IgJy0gY2FudCBzdGFydCByZWNvcmRpbmcgaWYgbm90IHN0cmVhbWluZydcbiAgICAgIHJldHVyblxuXG4gICAgY29uc29sZS5sb2cgJysgc3RhcnQgcmVjb3JkaW5nJywgYXBwY2FzdC5nZXQgJ2lucHV0X2RldmljZSdcbiAgICBcbiAgICAjIHBvc3QgdG8gYmFja2VuZCBpbiBvcmRlciB0byBzdGFydCByZWNvcmRpbmcgc2V0XG5cbiAgICB1cmwgID0gXCIvdGFwZS9zdGFydC9yZWNvcmRpbmdcIlxuICAgIGRvbmUgPSAtPlxuICAgICAgY29uc29sZS5pbmZvICcrIHJlY29yZGluZyBwb3N0IGRvbmUgLT4nLCBhcmd1bWVudHNcbiAgICAgIGFwcGNhc3Quc2V0ICdyZWNvcmRpbmcnLCB0cnVlXG5cbiAgICBmYWlsID0gLT5cbiAgICAgIGNvbnNvbGUuZXJyb3IgJy0gZmFpbGluZyB0cnlpbmcgdG8gc3RhcnQgcmVjb3JkaW5nIC0+JywgYXJndW1lbnRzXG5cbiAgICAjIHBvc3QgdG8gYmFja2VuZCBpbiBvcmRlciB0byBzdGFydCByZWNvcmRpbmdcbiAgICAkLnBvc3QoIHVybCApLmRvbmUoIGRvbmUgKS5mYWlsKCBmYWlsIClcblxuICBzdG9wX3JlY29yZGluZyA6IC0+XG4gICAgaWYgbm90IGFwcGNhc3QuZ2V0ICdzdHJlYW06cmVjb3JkaW5nJ1xuXG4gICAgICBjb25zb2xlLmVycm9yICctIGNhbnQgc3RvcCByZWNvcmRpbmcgaWYgbm90IHJlY29yZGluZydcbiAgICAgIHJldHVyblxuXG4gICAgY29uc29sZS5sb2cgJysgc3RvcHBpbmcgdG8gcmVjb3JkIHdpdGggJywgYXBwY2FzdC5nZXQgJ2lucHV0X2RldmljZSdcbiAgICBcbiAgICAjIHBvc3QgdG8gYmFja2VuZCBpbiBvcmRlciB0byBzdGFydCByZWNvcmRpbmcgc2V0XG5cbiAgICB1cmwgID0gXCIvdGFwZS9zdG9wL3JlY29yZGluZ1wiXG4gICAgZG9uZSA9IC0+XG4gICAgICBjb25zb2xlLmluZm8gJysgL3RhcGUvc3RvcC9yZWNvcmRpbmcgcG9zdCBkb25lIC0+JywgYXJndW1lbnRzXG5cbiAgICBmYWlsID0gLT5cbiAgICAgIGNvbnNvbGUuZXJyb3IgJy0gL3RhcGUvc3RvcC9yZWNvcmRpbmcgcG9zdCBmYWlsZWQgLT4nLCBhcmd1bWVudHNcblxuICAgICMgcG9zdCB0byBiYWNrZW5kIGluIG9yZGVyIHRvIHN0YXJ0IHJlY29yZGluZ1xuICAgICQucG9zdCggdXJsICkuZG9uZSggZG9uZSApLmZhaWwoIGZhaWwgKVxuXG5cblxuICBzdGFydF9zdHJlYW0gOiAtPlxuICAgIGlmIG5vdCBhcHBjYXN0LmdldCAnaW5wdXRfZGV2aWNlJ1xuXG4gICAgICBjb25zb2xlLmVycm9yICctIGNhbnQgc3RhcnQgc3RyZWFtIGJlZm9yZSBzZWxlY3RpbmcgaW5wdXQgZGV2aWNlJ1xuICAgICAgcmV0dXJuXG5cbiAgICBjb25zb2xlLmxvZyAnc3RhcnRpbmcgc3RyZWFtaW5nIHdpdGgnLCBhcHBjYXN0LmdldCAnaW5wdXRfZGV2aWNlJ1xuICAgIFxuICAgIGFwcGNhc3Quc3RhcnRfc3RyZWFtIGFwcGNhc3QuZ2V0ICdpbnB1dF9kZXZpY2UnXG5cblxuXG4gIHN0b3Bfc3RyZWFtIDogLT4gXG4gICAgaWYgbm90IGFwcGNhc3QuZ2V0ICdzdHJlYW1pbmc6b25saW5lJ1xuXG4gICAgICBjb25zb2xlLmVycm9yICctIGNhbnQgc3RvcCBzdHJlYW0gaWYgbm90IHN0cmVhbWluZydcbiAgICAgIHJldHVyblxuXG4gICAgY29uc29sZS5sb2cgJysgc3RvcGluZyBzdHJlYW1pbmcgd2l0aCcsIGFwcGNhc3QuZ2V0ICdpbnB1dF9kZXZpY2UnXG4gICAgXG4gICAgYXBwY2FzdC5zdG9wX3N0cmVhbSgpIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsR0FBQTs7QUFBQSxDQUFBLEVBQVUsSUFBVixrQkFBVTs7QUFFVixDQUZBLEVBSUUsR0FGSSxDQUFOO0NBRUUsQ0FBQSxDQUFrQixNQUFBLE1BQWxCO0NBQ0UsT0FBQSxPQUFBO0FBQU8sQ0FBUCxFQUFPLENBQVAsR0FBYyxXQUFQO0NBRUwsSUFBQSxDQUFBLENBQU8sa0NBQVA7Q0FDQSxXQUFBO01BSEY7Q0FBQSxDQUtpQyxDQUFqQyxDQUFBLEdBQU8sT0FBMEIsS0FBakM7Q0FMQSxFQVNBLENBQUEsbUJBVEE7Q0FBQSxFQVVPLENBQVAsS0FBTztDQUNMLENBQXlDLEVBQXpDLEVBQUEsQ0FBTyxFQUFQLGlCQUFBO0NBQ1EsQ0FBaUIsQ0FBekIsQ0FBQSxHQUFPLElBQVAsRUFBQTtDQVpGLElBVU87Q0FWUCxFQWNPLENBQVAsS0FBTztDQUNHLENBQWdELEdBQXhELEVBQU8sRUFBUCxJQUFBLDJCQUFBO0NBZkYsSUFjTztDQUlOLEVBQUQsQ0FBQSxPQUFBO0NBbkJGLEVBQWtCO0NBQWxCLENBcUJBLENBQWlCLE1BQUEsS0FBakI7Q0FDRSxPQUFBLE9BQUE7QUFBTyxDQUFQLEVBQU8sQ0FBUCxHQUFjLFdBQVA7Q0FFTCxJQUFBLENBQUEsQ0FBTyxpQ0FBUDtDQUNBLFdBQUE7TUFIRjtDQUFBLENBSzBDLENBQTFDLENBQUEsR0FBTyxPQUFtQyxjQUExQztDQUxBLEVBU0EsQ0FBQSxrQkFUQTtDQUFBLEVBVU8sQ0FBUCxLQUFPO0NBQ0csQ0FBNEMsRUFBcEQsR0FBTyxFQUFQLElBQUEsd0JBQUE7Q0FYRixJQVVPO0NBVlAsRUFhTyxDQUFQLEtBQU87Q0FDRyxDQUErQyxHQUF2RCxFQUFPLEVBQVAsSUFBQSwwQkFBQTtDQWRGLElBYU87Q0FJTixFQUFELENBQUEsT0FBQTtDQXZDRixFQXFCaUI7Q0FyQmpCLENBMkNBLENBQWUsTUFBQSxHQUFmO0FBQ1MsQ0FBUCxFQUFPLENBQVAsR0FBYyxPQUFQO0NBRUwsSUFBQSxDQUFBLENBQU8sNENBQVA7Q0FDQSxXQUFBO01BSEY7Q0FBQSxDQUt1QyxDQUF2QyxDQUFBLEdBQU8sT0FBZ0MsV0FBdkM7Q0FFUSxFQUFhLElBQWQsSUFBUCxDQUFBLEVBQXFCO0NBbkR2QixFQTJDZTtDQTNDZixDQXVEQSxDQUFjLE1BQUEsRUFBZDtBQUNTLENBQVAsRUFBTyxDQUFQLEdBQWMsV0FBUDtDQUVMLElBQUEsQ0FBQSxDQUFPLDhCQUFQO0NBQ0EsV0FBQTtNQUhGO0NBQUEsQ0FLd0MsQ0FBeEMsQ0FBQSxHQUFPLE9BQWlDLFlBQXhDO0NBRVEsTUFBRCxJQUFQO0NBL0RGLEVBdURjO0NBM0RoQixDQUFBIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjEwMjA4LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdXRpbHMvYnJvd3Nlci5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiQnJvd3NlckRldGVjdCA9XG5cdGluaXQ6ICggKSAtPlxuXHRcdEBicm93c2VyID0gQHNlYXJjaFN0cmluZyhAZGF0YUJyb3dzZXIpIG9yIFwiQW4gdW5rbm93biBicm93c2VyXCJcblx0XHRAdmVyc2lvbiA9IEBzZWFyY2hWZXJzaW9uKG5hdmlnYXRvci51c2VyQWdlbnQpIG9yIEBzZWFyY2hWZXJzaW9uKG5hdmlnYXRvci5hcHBWZXJzaW9uKSBvciBcImFuIHVua25vd24gdmVyc2lvblwiXG5cdFx0QE9TID0gQHNlYXJjaFN0cmluZyhAZGF0YU9TKSBvciBcImFuIHVua25vd24gT1NcIlxuXG5cdHNlYXJjaFN0cmluZzogKGRhdGEpIC0+XG5cdFx0aSA9IDBcblxuXHRcdHdoaWxlIGkgPCBkYXRhLmxlbmd0aFxuXHRcdFx0ZGF0YVN0cmluZyA9IGRhdGFbaV0uc3RyaW5nXG5cdFx0XHRkYXRhUHJvcCA9IGRhdGFbaV0ucHJvcFxuXHRcdFx0QHZlcnNpb25TZWFyY2hTdHJpbmcgPSBkYXRhW2ldLnZlcnNpb25TZWFyY2ggb3IgZGF0YVtpXS5pZGVudGl0eVxuXHRcdFx0aWYgZGF0YVN0cmluZ1xuXHRcdFx0XHRyZXR1cm4gZGF0YVtpXS5pZGVudGl0eSAgdW5sZXNzIGRhdGFTdHJpbmcuaW5kZXhPZihkYXRhW2ldLnN1YlN0cmluZykgaXMgLTFcblx0XHRcdGVsc2UgcmV0dXJuIGRhdGFbaV0uaWRlbnRpdHkgIGlmIGRhdGFQcm9wXG5cdFx0XHRpKytcblx0XHRyZXR1cm5cblxuXHRzZWFyY2hWZXJzaW9uOiAoZGF0YVN0cmluZykgLT5cblx0XHRpbmRleCA9IGRhdGFTdHJpbmcuaW5kZXhPZihAdmVyc2lvblNlYXJjaFN0cmluZylcblx0XHRyZXR1cm4gIGlmIGluZGV4IGlzIC0xXG5cdFx0cGFyc2VGbG9hdCBkYXRhU3RyaW5nLnN1YnN0cmluZyhpbmRleCArIEB2ZXJzaW9uU2VhcmNoU3RyaW5nLmxlbmd0aCArIDEpXG5cblx0ZGF0YUJyb3dzZXI6IFtcblx0XHR7XG5cdFx0XHRzdHJpbmc6IG5hdmlnYXRvci51c2VyQWdlbnRcblx0XHRcdHN1YlN0cmluZzogXCJDaHJvbWVcIlxuXHRcdFx0aWRlbnRpdHk6IFwiQ2hyb21lXCJcblx0XHR9XG5cdFx0e1xuXHRcdFx0c3RyaW5nOiBuYXZpZ2F0b3IudXNlckFnZW50XG5cdFx0XHRzdWJTdHJpbmc6IFwiT21uaVdlYlwiXG5cdFx0XHR2ZXJzaW9uU2VhcmNoOiBcIk9tbmlXZWIvXCJcblx0XHRcdGlkZW50aXR5OiBcIk9tbmlXZWJcIlxuXHRcdH1cblx0XHR7XG5cdFx0XHRzdHJpbmc6IG5hdmlnYXRvci52ZW5kb3Jcblx0XHRcdHN1YlN0cmluZzogXCJBcHBsZVwiXG5cdFx0XHRpZGVudGl0eTogXCJTYWZhcmlcIlxuXHRcdFx0dmVyc2lvblNlYXJjaDogXCJWZXJzaW9uXCJcblx0XHR9XG5cdFx0e1xuXHRcdFx0cHJvcDogd2luZG93Lm9wZXJhXG5cdFx0XHRpZGVudGl0eTogXCJPcGVyYVwiXG5cdFx0XHR2ZXJzaW9uU2VhcmNoOiBcIlZlcnNpb25cIlxuXHRcdH1cblx0XHR7XG5cdFx0XHRzdHJpbmc6IG5hdmlnYXRvci52ZW5kb3Jcblx0XHRcdHN1YlN0cmluZzogXCJpQ2FiXCJcblx0XHRcdGlkZW50aXR5OiBcImlDYWJcIlxuXHRcdH1cblx0XHR7XG5cdFx0XHRzdHJpbmc6IG5hdmlnYXRvci52ZW5kb3Jcblx0XHRcdHN1YlN0cmluZzogXCJLREVcIlxuXHRcdFx0aWRlbnRpdHk6IFwiS29ucXVlcm9yXCJcblx0XHR9XG5cdFx0e1xuXHRcdFx0c3RyaW5nOiBuYXZpZ2F0b3IudXNlckFnZW50XG5cdFx0XHRzdWJTdHJpbmc6IFwiRmlyZWZveFwiXG5cdFx0XHRpZGVudGl0eTogXCJGaXJlZm94XCJcblx0XHR9XG5cdFx0e1xuXHRcdFx0c3RyaW5nOiBuYXZpZ2F0b3IudmVuZG9yXG5cdFx0XHRzdWJTdHJpbmc6IFwiQ2FtaW5vXCJcblx0XHRcdGlkZW50aXR5OiBcIkNhbWlub1wiXG5cdFx0fVxuXHRcdHtcblx0XHRcdCMgZm9yIG5ld2VyIE5ldHNjYXBlcyAoNispXG5cdFx0XHRzdHJpbmc6IG5hdmlnYXRvci51c2VyQWdlbnRcblx0XHRcdHN1YlN0cmluZzogXCJOZXRzY2FwZVwiXG5cdFx0XHRpZGVudGl0eTogXCJOZXRzY2FwZVwiXG5cdFx0fVxuXHRcdHtcblx0XHRcdHN0cmluZzogbmF2aWdhdG9yLnVzZXJBZ2VudFxuXHRcdFx0c3ViU3RyaW5nOiBcIk1TSUVcIlxuXHRcdFx0aWRlbnRpdHk6IFwiRXhwbG9yZXJcIlxuXHRcdFx0dmVyc2lvblNlYXJjaDogXCJNU0lFXCJcblx0XHR9XG5cdFx0e1xuXHRcdFx0c3RyaW5nOiBuYXZpZ2F0b3IudXNlckFnZW50XG5cdFx0XHRzdWJTdHJpbmc6IFwiR2Vja29cIlxuXHRcdFx0aWRlbnRpdHk6IFwiTW96aWxsYVwiXG5cdFx0XHR2ZXJzaW9uU2VhcmNoOiBcInJ2XCJcblx0XHR9XG5cdFx0e1xuXHRcdFx0IyBmb3Igb2xkZXIgTmV0c2NhcGVzICg0LSlcblx0XHRcdHN0cmluZzogbmF2aWdhdG9yLnVzZXJBZ2VudFxuXHRcdFx0c3ViU3RyaW5nOiBcIk1vemlsbGFcIlxuXHRcdFx0aWRlbnRpdHk6IFwiTmV0c2NhcGVcIlxuXHRcdFx0dmVyc2lvblNlYXJjaDogXCJNb3ppbGxhXCJcblx0XHR9XG5cdF1cblx0ZGF0YU9TOiBbXG5cdFx0e1xuXHRcdFx0c3RyaW5nOiBuYXZpZ2F0b3IucGxhdGZvcm1cblx0XHRcdHN1YlN0cmluZzogXCJXaW5cIlxuXHRcdFx0aWRlbnRpdHk6IFwiV2luZG93c1wiXG5cdFx0fVxuXHRcdHtcblx0XHRcdHN0cmluZzogbmF2aWdhdG9yLnBsYXRmb3JtXG5cdFx0XHRzdWJTdHJpbmc6IFwiTWFjXCJcblx0XHRcdGlkZW50aXR5OiBcIk1hY1wiXG5cdFx0fVxuXHRcdHtcblx0XHRcdHN0cmluZzogbmF2aWdhdG9yLnVzZXJBZ2VudFxuXHRcdFx0c3ViU3RyaW5nOiBcImlQaG9uZVwiXG5cdFx0XHRpZGVudGl0eTogXCJpUGhvbmUvaVBvZFwiXG5cdFx0fVxuXHRcdHtcblx0XHRcdHN0cmluZzogbmF2aWdhdG9yLnBsYXRmb3JtXG5cdFx0XHRzdWJTdHJpbmc6IFwiTGludXhcIlxuXHRcdFx0aWRlbnRpdHk6IFwiTGludXhcIlxuXHRcdH1cblx0XVxuXG5Ccm93c2VyRGV0ZWN0LmluaXQoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJyb3dzZXJEZXRlY3QiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxTQUFBOztBQUFBLENBQUEsRUFDQyxVQUREO0NBQ0MsQ0FBQSxDQUFNLENBQU4sS0FBTTtDQUNMLEVBQVcsQ0FBWCxHQUFBLElBQVcsQ0FBQSxRQUFYO0NBQUEsRUFDVyxDQUFYLEdBQUEsRUFBbUMsQ0FBZSxHQUF2QyxPQURYO0NBRUMsQ0FBRCxDQUFNLENBQUwsRUFBSyxLQUFOLENBQU07Q0FIUCxFQUFNO0NBQU4sQ0FLQSxDQUFjLENBQUEsS0FBQyxHQUFmO0NBQ0MsT0FBQSxlQUFBO0NBQUEsRUFBSSxDQUFKO0NBRUEsRUFBVSxDQUFJLEVBQWQsS0FBTTtDQUNMLEVBQWEsQ0FBSyxFQUFsQixJQUFBO0NBQUEsRUFDVyxDQUFLLEVBQWhCLEVBQUE7Q0FEQSxFQUV1QixDQUF0QixFQUFELEVBRkEsS0FFdUIsTUFBdkI7Q0FDQSxHQUFHLEVBQUgsSUFBQTtBQUMyRSxDQUExRSxHQUFnQyxDQUF5QyxFQUF6QyxDQUFoQyxDQUFnQyxDQUFVO0NBQTFDLEdBQVksSUFBWixTQUFPO1VBRFI7TUFBQSxFQUFBO0NBRUssR0FBNEIsSUFBNUI7Q0FBQSxHQUFZLElBQVosU0FBTztVQUZaO1FBSEE7QUFNQSxDQU5BLENBQUEsSUFNQTtDQVZZLElBR2I7Q0FSRCxFQUtjO0NBTGQsQ0FrQkEsQ0FBZSxNQUFDLENBQUQsR0FBZjtDQUNDLElBQUEsR0FBQTtDQUFBLEVBQVEsQ0FBUixDQUFBLEVBQVEsR0FBVSxTQUFWO0FBQ2EsQ0FBckIsR0FBQSxDQUFXO0NBQVgsV0FBQTtNQURBO0NBRVcsRUFBNkIsQ0FBQyxDQUFULENBQUEsR0FBckIsQ0FBWCxDQUFBLFFBQTREO0NBckI3RCxFQWtCZTtDQWxCZixDQXVCQSxTQUFBO0tBQ0M7Q0FBQSxDQUNTLElBQVIsR0FBaUI7Q0FEbEIsQ0FFWSxJQUFYLEVBRkQsQ0FFQztDQUZELENBR1csSUFBVixFQUFBO0VBRUQsSUFOWTtDQU1aLENBQ1MsSUFBUixHQUFpQjtDQURsQixDQUVZLElBQVgsR0FBQTtDQUZELENBR2dCLElBQWYsSUFIRCxHQUdDO0NBSEQsQ0FJVyxJQUFWLEVBQUEsQ0FKRDtFQU1BLElBWlk7Q0FZWixDQUNTLElBQVIsR0FBaUI7Q0FEbEIsQ0FFWSxJQUFYLENBRkQsRUFFQztDQUZELENBR1csSUFBVixFQUFBO0NBSEQsQ0FJZ0IsSUFBZixHQUpELElBSUM7RUFFRCxJQWxCWTtDQWtCWixDQUNPLEVBQU4sQ0FERCxDQUNDO0NBREQsQ0FFVyxJQUFWLENBRkQsQ0FFQztDQUZELENBR2dCLElBQWYsR0FIRCxJQUdDO0VBRUQsSUF2Qlk7Q0F1QlosQ0FDUyxJQUFSLEdBQWlCO0NBRGxCLENBRVksSUFBWCxHQUFBO0NBRkQsQ0FHVyxJQUFWLEVBQUE7RUFFRCxJQTVCWTtDQTRCWixDQUNTLElBQVIsR0FBaUI7Q0FEbEIsQ0FFWSxHQUZaLENBRUMsR0FBQTtDQUZELENBR1csSUFBVixFQUFBLEdBSEQ7RUFLQSxJQWpDWTtDQWlDWixDQUNTLElBQVIsR0FBaUI7Q0FEbEIsQ0FFWSxJQUFYLEdBQUE7Q0FGRCxDQUdXLElBQVYsRUFBQSxDQUhEO0VBS0EsSUF0Q1k7Q0FzQ1osQ0FDUyxJQUFSLEdBQWlCO0NBRGxCLENBRVksSUFBWCxFQUZELENBRUM7Q0FGRCxDQUdXLElBQVYsRUFBQTtFQUVELElBM0NZO0NBMkNaLENBRVMsSUFBUixHQUFpQjtDQUZsQixDQUdZLElBQVgsR0FBQSxDQUhEO0NBQUEsQ0FJVyxJQUFWLEVBQUEsRUFKRDtFQU1BLElBakRZO0NBaURaLENBQ1MsSUFBUixHQUFpQjtDQURsQixDQUVZLElBQVgsR0FBQTtDQUZELENBR1csSUFBVixFQUFBLEVBSEQ7Q0FBQSxDQUlnQixJQUFmLE9BQUE7RUFFRCxJQXZEWTtDQXVEWixDQUNTLElBQVIsR0FBaUI7Q0FEbEIsQ0FFWSxJQUFYLENBRkQsRUFFQztDQUZELENBR1csSUFBVixFQUFBLENBSEQ7Q0FBQSxDQUlnQixFQUpoQixFQUlDLE9BQUE7RUFFRCxJQTdEWTtDQTZEWixDQUVTLElBQVIsR0FBaUI7Q0FGbEIsQ0FHWSxJQUFYLEdBQUE7Q0FIRCxDQUlXLElBQVYsRUFBQSxFQUpEO0NBQUEsQ0FLZ0IsSUFBZixHQUxELElBS0M7TUFsRVc7SUF2QmI7Q0FBQSxDQTRGQSxJQUFBO0tBQ0M7Q0FBQSxDQUNTLElBQVIsRUFERCxDQUNrQjtDQURsQixDQUVZLEdBRlosQ0FFQyxHQUFBO0NBRkQsQ0FHVyxJQUFWLEVBQUEsQ0FIRDtFQUtBLElBTk87Q0FNUCxDQUNTLElBQVIsRUFERCxDQUNrQjtDQURsQixDQUVZLEdBRlosQ0FFQyxHQUFBO0NBRkQsQ0FHVyxHQUhYLENBR0MsRUFBQTtFQUVELElBWE87Q0FXUCxDQUNTLElBQVIsR0FBaUI7Q0FEbEIsQ0FFWSxJQUFYLEVBRkQsQ0FFQztDQUZELENBR1csSUFBVixFQUFBLEtBSEQ7RUFLQSxJQWhCTztDQWdCUCxDQUNTLElBQVIsRUFERCxDQUNrQjtDQURsQixDQUVZLElBQVgsQ0FGRCxFQUVDO0NBRkQsQ0FHVyxJQUFWLENBSEQsQ0FHQztNQW5CTTtJQTVGUjtDQURELENBQUE7O0FBb0hBLENBcEhBLEdBb0hBLFNBQWE7O0FBRWIsQ0F0SEEsRUFzSGlCLEdBQVgsQ0FBTixNQXRIQSJ9fSx7Im9mZnNldCI6eyJsaW5lIjoxMDMyNiwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3V0aWxzL2hhcHBlbnNfZGVzdHJveS5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSAoIG9iaiApIC0+XG4gIGlmIG9iai5lbWl0P1xuICAgIG9iai5vbiAgICAgICAgICA9IG51bGxcbiAgICBvYmoub25jZSAgICAgICAgPSBudWxsXG4gICAgb2JqLm9mZiAgICAgICAgID0gbnVsbFxuICAgIG9iai5lbWl0ICAgICAgICA9IG51bGxcbiAgICBvYmouX19saXN0ZW5lcnMgPSBudWxsXG4gICAgb2JqLl9faW5pdCAgICAgID0gbnVsbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxDQUFPLEVBQVUsR0FBWCxDQUFOLEVBQW1CO0NBQ2pCLENBQUEsRUFBRyxZQUFIO0NBQ0UsQ0FBQSxDQUFHLENBQUg7Q0FBQSxFQUNHLENBQUg7Q0FEQSxFQUVHLENBQUg7Q0FGQSxFQUdHLENBQUg7Q0FIQSxFQUlHLENBQUgsT0FBQTtDQUNJLEVBQUQsR0FBSCxLQUFBO0lBUGE7Q0FBQSJ9fSx7Im9mZnNldCI6eyJsaW5lIjoxMDMzOSwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3V0aWxzL2ltYWdlcy90cmFuc2Zvcm0uY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gXG4gIHRvcF9iYXI6ICggdXJsICkgLT4gXG4gICAgaWYgdXJsLmluZGV4T2YoIFwidXBsb2FkL1wiICkgPCAwXG4gICAgICByZXR1cm4gXCIvaW1hZ2VzL3Byb2ZpbGUtNDkuanBnXCJcbiAgICBlbHNlXG4gICAgICB1cmwucmVwbGFjZSBcInVwbG9hZC9cIiwgXCJ1cGxvYWQvd180OSxoXzQ5LGNfZmlsbCxnX25vcnRoL1wiXG5cbiAgYXZhdGFyOiAoIHVybCApIC0+IFxuICAgIGlmIHVybC5pbmRleE9mKCBcInVwbG9hZC9cIiApIDwgMFxuICAgICAgcmV0dXJuIFwiL2ltYWdlcy9wcm9maWxlLTE1MC5qcGdcIlxuICAgIGVsc2VcbiAgICAgIHVybC5yZXBsYWNlIFwidXBsb2FkL1wiLCBcInVwbG9hZC93XzE1MCxoXzE1MCxjX2ZpbGwsZ19ub3J0aC9cIlxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLENBQU8sRUFDTCxHQURJLENBQU47Q0FDRSxDQUFBLENBQVMsSUFBVCxFQUFXO0NBQ1QsRUFBTSxDQUFOLEdBQUcsRUFBQTtDQUNELFlBQU8sV0FBUDtNQURGO0NBR00sQ0FBbUIsQ0FBcEIsSUFBSCxFQUFBLElBQUEscUJBQUE7TUFKSztDQUFULEVBQVM7Q0FBVCxDQU1BLENBQVEsR0FBUixHQUFVO0NBQ1IsRUFBTSxDQUFOLEdBQUcsRUFBQTtDQUNELFlBQU8sWUFBUDtNQURGO0NBR00sQ0FBbUIsQ0FBcEIsSUFBSCxFQUFBLElBQUEsdUJBQUE7TUFKSTtDQU5SLEVBTVE7Q0FQVixDQUFBIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjEwMzU4LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdXRpbHMvbG9naW5fcG9wdXAuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbInBvcHVwID0gcmVxdWlyZSAnYXBwL3V0aWxzL3BvcHVwJ1xubW9kdWxlLmV4cG9ydHMgPSAtPlxuXHRwb3B1cCAgXG5cdFx0dXJsICAgICA6ICcvbG9naW4nXG5cdFx0dGl0bGUgICA6ICdMb2cgSW4gfiBMb29wY2FzdCdcblx0XHR3ICAgICAgIDogNDAwXG5cdFx0aCAgICAgICA6IDQ0MFxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsQ0FBQTs7QUFBQSxDQUFBLEVBQVEsRUFBUixFQUFRLFVBQUE7O0FBQ1IsQ0FEQSxFQUNpQixHQUFYLENBQU4sRUFBaUI7Q0FFZixJQURELElBQUE7Q0FDQyxDQUFVLENBQVYsQ0FBQSxJQUFBO0NBQUEsQ0FDVSxFQUFWLENBQUEsY0FEQTtDQUFBLENBRVUsQ0FGVixDQUVBO0NBRkEsQ0FHVSxDQUhWLENBR0E7Q0FMZSxHQUNoQjtDQURnQiJ9fSx7Im9mZnNldCI6eyJsaW5lIjoxMDM3MywiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3V0aWxzL29wYWNpdHkuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIk9wYWNpdHkgPSBcblx0c2hvdzogKGVsLCB0aW1lID0gNTAwKSAtPlxuXHRcdCMgbG9nIFwiW09wYWNpdHldIHNob3dcIlxuXHRcdGVsLmZhZGVJbiB0aW1lXG5cdFx0IyB0ID0gT3BhY2l0eS5nZXRfdGltZSggdGltZSApXG5cdFx0IyBlbC5jc3MgXG5cdFx0IyBcdCd2aXNpYmlsaXR5JyA6IFwidmlzaWJsZVwiXG5cdFx0IyBcdCd0cmFuc2l0aW9uJyA6IFwib3BhY2l0eSAje3R9IGxpbmVhclwiXG5cblx0XHQjIGRlbGF5IDEsIC0+XG5cdFx0IyBcdGVsLmNzcyAnb3BhY2l0eScsIDFcblxuXHRoaWRlOiAoIGVsLCB0aW1lID0gNTAwICkgLT5cblx0XHQjIGxvZyBcIltPcGFjaXR5XSBoaWRlXCJcblx0XHRlbC5mYWRlT3V0IHRpbWVcblxuXHRcdCMgdCA9IE9wYWNpdHkuZ2V0X3RpbWUgdGltZVxuXHRcdCMgdDEgPSBPcGFjaXR5LmdldF90aW1lKCB0aW1lICsgMTAwIClcblxuXHRcdCMgZWwuY3NzICd0cmFuc2l0aW9uJywgXCJvcGFjaXR5ICN7dH0gbGluZWFyXCJcblx0XHQjIGRlbGF5IDEsIC0+IGVsLmNzcyAnb3BhY2l0eScsIDBcblx0XHQjIGRlbGF5IHQxLCAtPiBlbC5jc3MgJ3Zpc2liaWxpdHknLCAnaGlkZGVuJ1xuXG5cdGdldF90aW1lOiAoIHRpbWUgKSAtPlxuXHRcdHJldHVybiAodGltZS8xMDAwKSArIFwic1wiXG5cbm1vZHVsZS5leHBvcnRzID0gT3BhY2l0eSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLEdBQUE7O0FBQUEsQ0FBQSxFQUNDLElBREQ7Q0FDQyxDQUFBLENBQU0sQ0FBTixLQUFPOztHQUFXLEdBQVA7TUFFVjtDQUFHLENBQUQsRUFBRixFQUFBLEtBQUE7Q0FGRCxFQUFNO0NBQU4sQ0FXQSxDQUFNLENBQU4sS0FBUTs7R0FBVyxHQUFQO01BRVg7Q0FBRyxDQUFELEVBQUYsR0FBQSxJQUFBO0NBYkQsRUFXTTtDQVhOLENBc0JBLENBQVUsQ0FBQSxJQUFWLENBQVk7Q0FDWCxFQUFhLENBQUwsT0FBRDtDQXZCUixFQXNCVTtDQXZCWCxDQUFBOztBQTBCQSxDQTFCQSxFQTBCaUIsR0FBWCxDQUFOIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjEwMzk3LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdXRpbHMvcG9wdXAuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gKCBkYXRhICkgLT5cblx0bGVmdCA9IChhcHAud2luZG93LncvMiktKGRhdGEudy8yKVxuXHR0b3AgPSAoYXBwLndpbmRvdy5oLzIpLShkYXRhLmgvMilcblxuXHRwYXJhbXMgPSAndG9vbGJhcj1ubywgbG9jYXRpb249bm8sIGRpcmVjdG9yaWVzPW5vLCBzdGF0dXM9bm8sIG1lbnViYXI9bm8sIHNjcm9sbGJhcnM9bm8sIHJlc2l6YWJsZT1ubywgY29weWhpc3Rvcnk9bm8sIHdpZHRoPScrZGF0YS53KycsIGhlaWdodD0nK2RhdGEuaCsnLCB0b3A9Jyt0b3ArJywgbGVmdD0nK2xlZnRcblxuXHRyZXR1cm4gd2luZG93Lm9wZW4oZGF0YS51cmwsIGRhdGEudGl0bGUsIHBhcmFtcykuZm9jdXMoKTsiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsQ0FBTyxFQUFVLENBQUEsRUFBWCxDQUFOLEVBQW1CO0NBQ2xCLEtBQUEsV0FBQTtDQUFBLENBQUEsQ0FBTyxDQUFQLEVBQWtCO0NBQWxCLENBQ0EsQ0FBQSxDQUE0QixFQUFYO0NBRGpCLENBR0EsQ0FBUyxDQUEwSCxFQUFuSSxFQUFTLENBQUEsRUFBQSwwR0FBQTtDQUVULENBQTZCLENBQXRCLENBQUEsQ0FBQSxDQUFNLEdBQU47Q0FOUyJ9fSx7Im9mZnNldCI6eyJsaW5lIjoxMDQwNywiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3V0aWxzL3ByZWxvYWQuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gKGltYWdlcywgY2FsbGJhY2spIC0+XG5cblx0Y291bnQgPSAwXG5cdGltYWdlc19sb2FkZWQgPSBbXVxuXG5cdGxvYWQgPSAoIHNyYywgY2FsbGJhY2sgKSAtPlxuXHRcdFx0XG5cdFx0aW1nID0gbmV3IEltYWdlKClcblx0XHRpbWcub25sb2FkID0gY2FsbGJhY2tcblx0XHRpbWcuc3JjID0gc3JjXG5cblx0XHRpbWFnZXNfbG9hZGVkLnB1c2ggaW1nXG5cblx0bG9hZGVkID0gLT5cblx0XHRjb3VudCsrXG5cdFx0bG9nIFwiW1ByZWxvYWRlcl0gbG9hZF9tdWx0aXBsZSAtIGxvYWRlZFwiLCBcIiN7Y291bnR9IC8gI3tpbWFnZXMubGVuZ3RofVwiXG5cblx0XHRpZiBjb3VudCBpcyBpbWFnZXMubGVuZ3RoXG5cdFx0XHRsb2cgXCJbUHJlbG9hZGVyXSBsb2FkX211bHRpcGxlIC0gbG9hZGVkIEFMTFwiXG5cdFx0XHRjYWxsYmFjayggaW1hZ2VzX2xvYWRlZCApXG5cblx0Zm9yIGl0ZW0gaW4gaW1hZ2VzXG5cdFx0bG9hZCBpdGVtLCBsb2FkZWRcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxDQUFPLENBQW1CLENBQVQsR0FBWCxDQUFOLENBQWlCLENBQUM7Q0FFakIsS0FBQSxzREFBQTtDQUFBLENBQUEsQ0FBUSxFQUFSO0NBQUEsQ0FDQSxDQUFnQixVQUFoQjtDQURBLENBR0EsQ0FBTyxDQUFQLElBQU8sQ0FBRTtDQUVSLEVBQUEsS0FBQTtDQUFBLEVBQUEsQ0FBQSxDQUFVO0NBQVYsRUFDRyxDQUFILEVBQUEsRUFEQTtDQUFBLEVBRUcsQ0FBSDtDQUVjLEVBQWQsQ0FBQSxPQUFBLEVBQWE7Q0FUZCxFQUdPO0NBSFAsQ0FXQSxDQUFTLEdBQVQsR0FBUztBQUNSLENBQUEsQ0FBQSxFQUFBLENBQUE7Q0FBQSxDQUMwQyxDQUExQyxDQUFBLENBQTBDLENBQW1CLDhCQUE3RDtDQUVBLEdBQUEsQ0FBRyxDQUFlO0NBQ2pCLEVBQUEsR0FBQSxrQ0FBQTtDQUNVLE9BQVYsS0FBQTtNQU5PO0NBWFQsRUFXUztBQVFULENBQUE7UUFBQSxxQ0FBQTt1QkFBQTtDQUNDLENBQVcsRUFBWCxFQUFBO0NBREQ7bUJBckJnQjtDQUFBIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjEwNDM2LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdXRpbHMvc2V0dGluZ3MuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIkJyb3dzZXJEZXRlY3QgPSByZXF1aXJlICdhcHAvdXRpbHMvYnJvd3Nlcidcblxuc2V0dGluZ3MgPSBcblxuXHQjIEJyb3dzZXIgaWQsIHZlcnNpb24sIE9TXG5cdGJyb3dzZXI6IHtcblxuXHRcdCMgSUQgW1N0cmluZ11cblx0XHRpZDogQnJvd3NlckRldGVjdC5icm93c2VyXG5cblx0XHQjIFZlcnNpb24gW1N0cmluZ11cblx0XHR2ZXJzaW9uOiBCcm93c2VyRGV0ZWN0LnZlcnNpb25cblx0XHRcblx0XHQjIE9TIFtTdHJpbmddXG5cdFx0T1M6IEJyb3dzZXJEZXRlY3QuT1Ncblx0XHRcblx0XHQjIElzIENocm9tZT8gW0Jvb2xlYW5dXG5cdFx0Y2hyb21lOiAobmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpLmluZGV4T2YoICdjaHJvbWUnICkgPiAtMSlcblxuXHRcdCMgSXMgRmlyZWZveCBbQm9vbGVhbl1cblx0XHRmaXJlZm94OiAoL0ZpcmVmb3gvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpKVxuXG5cdFx0IyBJcyBJRTg/IFtCb29sZWFuXVxuXHRcdGllODogZmFsc2VcblxuXHRcdCMgRGV2aWNlIHJhdGlvIFtOdW1iZXJdXG5cdFx0ZGV2aWNlX3JhdGlvOiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpb1xuXG5cdFx0IyBJcyBhIGhhbmRoZWxkIGRldmljZT8gW0Jvb2xlYW5dXG5cdFx0aGFuZGhlbGQ6IGZhbHNlXG5cblx0XHQjIElzIGEgdGFibGV0PyBbQm9vbGVhbl1cblx0XHR0YWJsZXQ6IGZhbHNlXG5cdFx0XG5cdFx0IyBJcyBhIG1vYmlsZT8gW0Jvb2xlYW5dXG5cdFx0bW9iaWxlOiBmYWxzZVxuXG5cdFx0IyBJcyBkZXNrdG9wPyBTZXQgYWZ0ZXIgdGhlIGNsYXNzIGRlZmluaXRpb24gW0Jvb2xlYW5dXG5cdFx0ZGVza3RvcDogZmFsc2VcblxuXHRcdCMgSXMgYSB0YWJsZXQgb3IgbW9iaWxlPyBbQm9vbGVhbl1cblx0XHRkZXZpY2U6IGZhbHNlXG5cblx0XHQjIERlYnVnIG1vZGUgLSBzZXQgYnkgZW52IGluIGluZGV4LnBocFxuXHRcdGRlYnVnOiBmYWxzZVxuXG5cdFx0Y3NzX2NvdmVyX3N1cHBvcnRlZDogTW9kZXJuaXpyLmJhY2tncm91bmRzaXplXG5cblx0XHRtaW5fc2l6ZTpcblx0XHRcdHc6IDkwMFxuXHRcdFx0aDogNDAwXG5cdH1cblxuXHQjIFVzZSB0aGlzIGZsYWcgaWYgd2VyZSBkb2luZyBrZXlmcmFtZSBhbmltYXRpb25zXG5cdCMgb3RoZXJ3aXNlIGltcGxlbWVudCBhIGpzIGZhbGxiYWNrXG5cblx0IyBXZWJwIHN1cHBvcnRcblx0d2VicDogZmFsc2Vcblxuc2V0dGluZ3MudGhlbWUgPSBcImRlc2t0b3BcIlxuc2V0dGluZ3MudGhyZXNob2xkX3RoZW1lID0gOTAwXG5cblxuIyBSZXRpbmEgc3VwcG9ydGVkIFtCb29sZWFuXVxuc2V0dGluZ3MuYnJvd3Nlci5yZXRpbmEgPSBzZXR0aW5ncy5icm93c2VyLmRldmljZV9yYXRpbyBpcyAyXG5cbiMgV2VicCB0ZXN0XG5pZiBzZXR0aW5ncy5icm93c2VyLmNocm9tZSBhbmQgc2V0dGluZ3MuYnJvd3Nlci52ZXJzaW9uID49IDMwXG5cdHNldHRpbmdzLndlYnAgPSB0cnVlXG5cbiMgRmxhZ3MgZm9yIElFXG5pZiBzZXR0aW5ncy5icm93c2VyLmlkIGlzICdFeHBsb3JlcicgXG5cdHNldHRpbmdzLmJyb3dzZXIuaWUgPSB0cnVlXG5cdGlmIHNldHRpbmdzLmJyb3dzZXIudmVyc2lvbiBpcyA4XG5cdFx0c2V0dGluZ3MuYnJvd3Nlci5pZTggPSB0cnVlXG5cdGlmIHNldHRpbmdzLmJyb3dzZXIudmVyc2lvbiBpcyA5XG5cdFx0c2V0dGluZ3MuYnJvd3Nlci5pZTkgPSB0cnVlXG5cblxuIyBJZiBpdCdzIGFuIGhhbmRoZWxkIGRldmljZVxuc2V0dGluZ3MudmlkZW9fYWN0aXZlID0gc2V0dGluZ3MuYnJvd3Nlci5pZCBpc250ICdFeHBsb3JlcidcblxuXG5cbmlmKCAvQW5kcm9pZHx3ZWJPU3xpUGhvbmV8aVBhZHxpUG9kfEJsYWNrQmVycnl8SUVNb2JpbGV8T3BlcmEgTWluaS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkgKVxuXHRzZXR0aW5ncy5icm93c2VyLmhhbmRoZWxkID0gdHJ1ZVxuXG5cdCMgQ2hlY2sgaWYgaXQncyBtb2JpbGUgb3IgdGFibGV0IGNhbGN1bGF0aW5nIHJhdGlvIGFuZCBvcmllbnRhdGlvblxuXHRyYXRpbyA9ICQod2luZG93KS53aWR0aCgpLyQod2luZG93KS5oZWlnaHQoKVxuXHRzZXR0aW5ncy5icm93c2VyLm9yaWVudGF0aW9uID0gaWYgcmF0aW8gPiAxIHRoZW4gXCJsYW5kc2NhcGVcIiBlbHNlIFwicG9ydHJhaXRcIlxuXG5cdCMgY2hlY2sgbWF4IHdpZHRoIGZvciBtb2JpbGUgZGV2aWNlIChuZXh1cyA3IGluY2x1ZGVkKVxuXHRpZiAkKHdpbmRvdykud2lkdGgoKSA8IDYxMCBvciAoc2V0dGluZ3MuYnJvd3Nlci5vcmllbnRhdGlvbiBpcyBcImxhbmRzY2FwZVwiIGFuZCByYXRpbyA+IDIuMTAgKVxuXHRcdHNldHRpbmdzLmJyb3dzZXIubW9iaWxlID0gdHJ1ZVxuXHRcdHNldHRpbmdzLmJyb3dzZXIudGFibGV0ID0gZmFsc2Vcblx0ZWxzZVxuXHRcdHNldHRpbmdzLmJyb3dzZXIubW9iaWxlID0gZmFsc2Vcblx0XHRzZXR0aW5ncy5icm93c2VyLnRhYmxldCA9IHRydWVcblxuc2V0dGluZ3MuYnJvd3Nlci5kZXZpY2UgPSAoc2V0dGluZ3MuYnJvd3Nlci50YWJsZXQgb3Igc2V0dGluZ3MuYnJvd3Nlci5tb2JpbGUpXG5cbiMgU2V0IGRlc2t0b3AgZmxhZ1xuaWYgc2V0dGluZ3MuYnJvd3Nlci50YWJsZXQgaXMgZmFsc2UgYW5kICBzZXR0aW5ncy5icm93c2VyLm1vYmlsZSBpcyBmYWxzZVxuXHRzZXR0aW5ncy5icm93c2VyLmRlc2t0b3AgPSB0cnVlXG5cblxuc2V0dGluZ3MuYnJvd3Nlci53aW5kb3dzX3Bob25lID0gZmFsc2VcbmlmIHNldHRpbmdzLmJyb3dzZXIubW9iaWxlIGFuZCBzZXR0aW5ncy5icm93c2VyLmlkIGlzICdFeHBsb3Jlcidcblx0c2V0dGluZ3MuYnJvd3Nlci53aW5kb3dzX3Bob25lID0gdHJ1ZVxuXG5cbnNldHRpbmdzLnRvdWNoX2RldmljZSA9IHNldHRpbmdzLmJyb3dzZXIuaGFuZGhlbGRcblxuIyBQbGF0Zm9ybSBzcGVjaWZpYyBldmVudHMgbWFwXG5zZXR0aW5ncy5ldmVudHNfbWFwID1cblx0J2Rvd24nIDogJ21vdXNlZG93bidcblx0J3VwJyAgIDogJ21vdXNldXAnXG5cdCdtb3ZlJyA6ICdtb3VzZW1vdmUnXG5cbmlmIHNldHRpbmdzLmJyb3dzZXIuZGV2aWNlXG5cblx0aWYgc2V0dGluZ3MuYnJvd3Nlci53aW5kb3dzX3Bob25lXG5cdFx0c2V0dGluZ3MuZXZlbnRzX21hcCA9XG5cdFx0XHQnZG93bicgOiAnTVNQb2ludGVyRG93bidcblx0XHRcdCd1cCcgICA6ICdNU1BvaW50ZXJVcCdcblx0XHRcdCdtb3ZlJyA6ICdNU1BvaW50ZXJNb3ZlJ1xuXHRcdFx0XG5cdGVsc2Vcblx0XHRzZXR0aW5ncy5ldmVudHNfbWFwID1cblx0XHRcdCdkb3duJyA6ICd0b3VjaHN0YXJ0J1xuXHRcdFx0J3VwJyAgIDogJ3RvdWNoZW5kJ1xuXHRcdFx0J21vdmUnIDogJ3RvdWNobW92ZSdcblxuXG5cblxuIyBQbGF0Zm9ybSBjbGFzc1xuaWYgc2V0dGluZ3MuYnJvd3Nlci5kZXNrdG9wXG5cdHBsYXRmb3JtID0gJ2Rlc2t0b3AnXG5lbHNlIGlmIHNldHRpbmdzLmJyb3dzZXIudGFibGV0XG5cdHBsYXRmb3JtID0gJ3RhYmxldCdcbmVsc2Vcblx0cGxhdGZvcm0gPSAnbW9iaWxlJ1xuXG5cbnNldHRpbmdzLmFmdGVyX2xvZ2luX3VybCA9IFwiXCJcblxuIyBCcm93c2VyIGNsYXNzIGZvciB0aGUgYm9keVxuc2V0dGluZ3MuYnJvd3Nlcl9jbGFzcyA9IHNldHRpbmdzLmJyb3dzZXIuaWQgKyAnXycgKyBzZXR0aW5ncy5icm93c2VyLnZlcnNpb25cblxuaGFzM2QgPSAtPlxuXHRlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpXG5cdGhhczNkID0gdW5kZWZpbmVkXG5cdHRyYW5zZm9ybXMgPVxuXHRcdHdlYmtpdFRyYW5zZm9ybTogXCItd2Via2l0LXRyYW5zZm9ybVwiXG5cdFx0T1RyYW5zZm9ybTogXCItby10cmFuc2Zvcm1cIlxuXHRcdG1zVHJhbnNmb3JtOiBcIi1tcy10cmFuc2Zvcm1cIlxuXHRcdE1velRyYW5zZm9ybTogXCItbW96LXRyYW5zZm9ybVwiXG5cdFx0dHJhbnNmb3JtOiBcInRyYW5zZm9ybVwiXG5cblxuXHQjIEFkZCBpdCB0byB0aGUgYm9keSB0byBnZXQgdGhlIGNvbXB1dGVkIHN0eWxlLlxuXHRkb2N1bWVudC5ib2R5Lmluc2VydEJlZm9yZSBlbCwgbnVsbFxuXHRmb3IgdCBvZiB0cmFuc2Zvcm1zXG5cdFx0aWYgZWwuc3R5bGVbdF0gaXNudCBgdW5kZWZpbmVkYFxuXHRcdFx0ZWwuc3R5bGVbdF0gPSBcInRyYW5zbGF0ZTNkKDFweCwxcHgsMXB4KVwiXG5cdFx0XHRoYXMzZCA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsKS5nZXRQcm9wZXJ0eVZhbHVlKHRyYW5zZm9ybXNbdF0pXG5cdGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQgZWxcblx0aGFzM2QgaXNudCBgdW5kZWZpbmVkYCBhbmQgaGFzM2QubGVuZ3RoID4gMCBhbmQgaGFzM2QgaXNudCBcIm5vbmVcIlxuXG5cbiMgc2V0dGluZ3MuaGFzM2QgPSBoYXMzZCgpXG5cblxuXG5zZXR0aW5ncy5iaW5kID0gKGJvZHkpLT5cblx0a2xhc3NlcyA9IFtdXG5cdGtsYXNzZXMucHVzaCBzZXR0aW5ncy5icm93c2VyX2NsYXNzXG5cdGtsYXNzZXMucHVzaCBzZXR0aW5ncy5icm93c2VyLk9TLnJlcGxhY2UoICcvJywgJ18nIClcblx0a2xhc3Nlcy5wdXNoIHNldHRpbmdzLmJyb3dzZXIuaWRcblxuXHRpZiBzZXR0aW5ncy50b3VjaF9kZXZpY2Vcblx0XHRrbGFzc2VzLnB1c2ggXCJ0b3VjaF9kZXZpY2VcIlxuXHRlbHNlXG5cdFx0a2xhc3Nlcy5wdXNoIFwibm9fdG91Y2hfZGV2aWNlXCJcblxuXHRpZiBzZXR0aW5ncy5icm93c2VyLmNzc19jb3Zlcl9zdXBwb3J0ZWRcblx0XHRrbGFzc2VzLnB1c2ggXCJjc3NfY292ZXJfc3VwcG9ydGVkXCJcblxuXHRib2R5LmFkZENsYXNzIGtsYXNzZXMuam9pbiggXCIgXCIgKS50b0xvd2VyQ2FzZSgpXG5cblx0c2V0dGluZ3MuaGVhZGVyX2hlaWdodCA9ICQoICdoZWFkZXInICkuaGVpZ2h0KClcblx0IyBib2R5LmNzcyBcblx0IyBcdCdtaW4td2lkdGgnICA6IHNldHRpbmdzLmJyb3dzZXIubWluX3NpemUud1xuXHQjIFx0J21pbi1oZWlnaHQnIDogc2V0dGluZ3MuYnJvd3Nlci5taW5fc2l6ZS5oXG5cblxuXG4jIFRFTVBcblxuIyBzZXR0aW5ncy52aWRlb19hY3RpdmUgPSBmYWxzZVxuIyBzZXR0aW5ncy5jc3NfY292ZXJfc3VwcG9ydGVkID0gZmFsc2VcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHNldHRpbmdzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsMkNBQUE7O0FBQUEsQ0FBQSxFQUFnQixJQUFBLE1BQWhCLE1BQWdCOztBQUVoQixDQUZBLEVBS0MsS0FIRDtDQUdDLENBQUEsS0FBQTtDQUFTLENBR1IsRUFBQSxHQUhRLE1BR1M7Q0FIVCxDQU1DLEVBQVQsR0FBQSxNQUFzQjtDQU5kLENBU1IsRUFBQSxTQUFpQjtBQUdpRCxDQVoxRCxDQVlDLENBQXdELENBQWpFLEVBQUEsQ0FBUyxDQUFBLENBQVMsRUFBVDtDQVpELENBZUUsRUFBVixHQUFBLEVBQW1DLENBQWY7Q0FmWixDQWtCSCxDQUFMLENBQUEsQ0FsQlE7Q0FBQSxDQXFCTSxFQUFkLEVBQW9CLE1BQXBCLElBckJRO0NBQUEsQ0F3QkUsRUFBVixDQXhCUSxHQXdCUjtDQXhCUSxDQTJCQSxFQUFSLENBM0JRLENBMkJSO0NBM0JRLENBOEJBLEVBQVIsQ0E5QlEsQ0E4QlI7Q0E5QlEsQ0FpQ0MsRUFBVCxDQWpDUSxFQWlDUjtDQWpDUSxDQW9DQSxFQUFSLENBcENRLENBb0NSO0NBcENRLENBdUNELEVBQVAsQ0FBQTtDQXZDUSxDQXlDYSxFQUFyQixLQUE4QixLQXpDdEIsS0F5Q1I7Q0F6Q1EsQ0E0Q1AsRUFERCxJQUFBO0NBQ0MsQ0FBRyxDQUFILEdBQUE7Q0FBQSxDQUNHLENBREgsR0FDQTtNQTdDTztJQUFUO0NBQUEsQ0FvREEsRUFBQSxDQXBEQTtDQUxELENBQUE7O0FBMkRBLENBM0RBLEVBMkRpQixFQUFqQixHQUFRLENBM0RSOztBQTREQSxDQTVEQSxFQTREMkIsS0FBbkIsT0FBUjs7QUFJQSxDQWhFQSxFQWdFMEIsRUFBaUMsQ0FBM0QsQ0FBZ0IsQ0FBUixJQUFrQjs7QUFHMUIsQ0FBQSxDQUFBLEVBQUcsRUFBQSxDQUFnQixDQUFSO0NBQ1YsQ0FBQSxDQUFnQixDQUFoQixJQUFRO0VBcEVUOztBQXVFQSxDQUFBLENBQUcsRUFBQSxDQUF1QixFQUFQLENBQVIsRUFBWDtDQUNDLENBQUEsQ0FBc0IsQ0FBdEIsR0FBZ0IsQ0FBUjtDQUNSLENBQUEsRUFBRyxDQUE0QixFQUFaLENBQVI7Q0FDVixFQUFBLENBQUEsR0FBZ0IsQ0FBUjtJQUZUO0NBR0EsQ0FBQSxFQUFHLENBQTRCLEVBQVosQ0FBUjtDQUNWLEVBQUEsQ0FBQSxHQUFnQixDQUFSO0lBTFY7RUF2RUE7O0FBZ0ZBLENBaEZBLENBZ0Z3QixDQUFBLEVBQXlCLEVBQVQsQ0FBaEMsRUFoRlIsRUFnRkE7O0FBSUEsQ0FBQSxHQUFJLEtBQStFLHVEQUFmO0NBQ25FLENBQUEsQ0FBNEIsQ0FBNUIsR0FBZ0IsQ0FBUjtDQUFSLENBR0EsQ0FBUSxFQUFSLENBQVE7Q0FIUixDQUlBLENBQWtDLEVBQUEsRUFBbEIsQ0FBUixFQUpSLENBSUE7Q0FHQSxDQUFBLENBQXVCLENBQXBCLENBQUEsQ0FBQSxDQUE0QyxDQUFSLEdBQVI7Q0FDOUIsRUFBMEIsQ0FBMUIsRUFBQSxDQUFnQixDQUFSO0NBQVIsRUFDMEIsQ0FBMUIsQ0FEQSxDQUNBLENBQWdCLENBQVI7SUFGVCxFQUFBO0NBSUMsRUFBMEIsQ0FBMUIsQ0FBQSxDQUFBLENBQWdCLENBQVI7Q0FBUixFQUMwQixDQUExQixFQUFBLENBQWdCLENBQVI7SUFiVjtFQXBGQTs7QUFtR0EsQ0FuR0EsRUFtRzJCLENBQTJCLEVBQXRELENBQWdCLENBQVI7O0FBR1IsQ0FBQSxHQUFHLENBQTJCLENBQTNCLENBQWdCLENBQVI7Q0FDVixDQUFBLENBQTJCLENBQTNCLEdBQWdCLENBQVI7RUF2R1Q7O0FBMEdBLENBMUdBLEVBMEdpQyxFQTFHakMsRUEwR2dCLENBQVIsS0FBUjs7QUFDQSxDQUFBLENBQStCLEVBQTVCLENBQW1ELENBQW5ELENBQWdCLENBQVIsRUFBWDtDQUNDLENBQUEsQ0FBaUMsQ0FBakMsR0FBZ0IsQ0FBUixLQUFSO0VBNUdEOztBQStHQSxDQS9HQSxFQStHd0IsSUFBZ0IsQ0FBaEMsSUFBUjs7QUFHQSxDQWxIQSxFQW1IQyxLQURPLEVBQVI7Q0FDQyxDQUFBLElBQUEsS0FBQTtDQUFBLENBQ0EsRUFBQSxLQURBO0NBQUEsQ0FFQSxJQUFBLEtBRkE7Q0FuSEQsQ0FBQTs7QUF1SEEsQ0FBQSxHQUFHLEVBQUgsQ0FBbUIsQ0FBUjtDQUVWLENBQUEsRUFBRyxHQUFnQixDQUFSLEtBQVg7Q0FDQyxFQUNDLENBREQsSUFBUSxFQUFSO0NBQ0MsQ0FBUyxJQUFULFNBQUE7Q0FBQSxDQUNTLEVBQVQsRUFBQSxPQURBO0NBQUEsQ0FFUyxJQUFULFNBRkE7Q0FGRixLQUNDO0lBREQsRUFBQTtDQU9DLEVBQ0MsQ0FERCxJQUFRLEVBQVI7Q0FDQyxDQUFTLElBQVQsTUFBQTtDQUFBLENBQ1MsRUFBVCxFQUFBLElBREE7Q0FBQSxDQUVTLElBQVQsS0FGQTtDQVJGLEtBT0M7SUFURjtFQXZIQTs7QUF5SUEsQ0FBQSxHQUFHLEdBQWdCLENBQVI7Q0FDVixDQUFBLENBQVcsS0FBWCxDQUFBO0NBQ2dCLENBRmpCLEVBRVEsRUFGUixDQUV3QixDQUFSO0NBQ2YsQ0FBQSxDQUFXLEtBQVg7RUFIRCxJQUFBO0NBS0MsQ0FBQSxDQUFXLEtBQVg7RUE5SUQ7O0FBaUpBLENBakpBLENBQUEsQ0FpSjJCLEtBQW5CLE9BQVI7O0FBR0EsQ0FwSkEsQ0FvSnlCLENBQUEsSUFBZ0IsQ0FBakMsS0FBUjs7QUFFQSxDQXRKQSxFQXNKUSxFQUFSLElBQVE7Q0FDUCxLQUFBLFdBQUE7Q0FBQSxDQUFBLENBQUssS0FBUSxLQUFSO0NBQUwsQ0FDQSxDQUFRLEVBQVIsQ0FEQTtDQUFBLENBRUEsQ0FDQyxPQUREO0NBQ0MsQ0FBaUIsRUFBakIsV0FBQSxJQUFBO0NBQUEsQ0FDWSxFQUFaLE1BQUEsSUFEQTtDQUFBLENBRWEsRUFBYixPQUFBLElBRkE7Q0FBQSxDQUdjLEVBQWQsUUFBQSxJQUhBO0NBQUEsQ0FJVyxFQUFYLEtBQUEsRUFKQTtDQUhELEdBQUE7Q0FBQSxDQVdBLEVBQWEsSUFBTCxJQUFSO0FBQ0EsQ0FBQSxFQUFBLElBQUEsUUFBQTtDQUNDLENBQUssRUFBTCxDQUFZLElBQVo7Q0FDQyxDQUFFLENBQVksRUFBTCxDQUFULG9CQUFBO0NBQUEsQ0FDUSxDQUFBLEVBQVIsQ0FBQSxJQUFnRSxNQUF4RDtNQUhWO0NBQUEsRUFaQTtDQUFBLENBZ0JBLEVBQWEsSUFBTCxHQUFSO0NBQ2lDLEVBQVMsQ0FBZixDQUEzQixDQUEyQixHQUEzQjtDQWxCTzs7QUF5QlIsQ0EvS0EsRUErS2dCLENBQWhCLElBQVEsQ0FBUztDQUNoQixLQUFBLENBQUE7Q0FBQSxDQUFBLENBQVUsSUFBVjtDQUFBLENBQ0EsRUFBQSxHQUFPLENBQWMsS0FBckI7Q0FEQSxDQUVBLENBQWEsQ0FBYixHQUFPLENBQWM7Q0FGckIsQ0FHQSxFQUFBLEdBQU8sQ0FBYztDQUVyQixDQUFBLEVBQUcsSUFBUSxJQUFYO0NBQ0MsR0FBQSxHQUFPLE9BQVA7SUFERCxFQUFBO0NBR0MsR0FBQSxHQUFPLFVBQVA7SUFSRDtDQVVBLENBQUEsRUFBRyxHQUFnQixDQUFSLFdBQVg7Q0FDQyxHQUFBLEdBQU8sY0FBUDtJQVhEO0NBQUEsQ0FhQSxDQUFjLENBQVYsR0FBaUIsQ0FBckIsR0FBYztDQUVMLEVBQWdCLEdBQUEsRUFBakIsQ0FBUixJQUFBO0NBaEJlOztBQTZCaEIsQ0E1TUEsRUE0TWlCLEdBQVgsQ0FBTixDQTVNQSJ9fSx7Im9mZnNldCI6eyJsaW5lIjoxMDU5MSwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3V0aWxzL3N0cmluZy5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSBcbiAgaXNfZW1wdHkgOiAoIHN0ciApIC0+XG4gICAgcyA9IHN0ci5yZXBsYWNlKC9cXHMrL2csICcnKVxuICAgIHJldHVybiBzLmxlbmd0aCA8PSAwIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLENBQU8sRUFDTCxHQURJLENBQU47Q0FDRSxDQUFBLENBQVcsS0FBWCxDQUFhO0NBQ1gsT0FBQTtDQUFBLENBQXdCLENBQXBCLENBQUosRUFBSSxDQUFBO0NBQ0osR0FBbUIsRUFBWixLQUFBO0NBRlQsRUFBVztDQURiLENBQUEifX0seyJvZmZzZXQiOnsibGluZSI6MTA2MDEsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy91dGlscy91cmxfcGFyc2VyLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IFxuICBnZXRfcGF0aG5hbWU6ICggdXJsICkgLT5cbiAgICBmaW5kID0gbG9jYXRpb24ub3JpZ2luXG4gICAgcmUgPSBuZXcgUmVnRXhwIGZpbmQsICdnJ1xuXG4gICAgdXJsLnJlcGxhY2UgcmUsICcnIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLENBQU8sRUFDTCxHQURJLENBQU47Q0FDRSxDQUFBLENBQWMsTUFBRSxHQUFoQjtDQUNFLE9BQUE7Q0FBQSxFQUFPLENBQVAsRUFBQSxFQUFlO0NBQWYsQ0FDQSxDQUFTLENBQVQsRUFBUztDQUVMLENBQUosQ0FBRyxJQUFILElBQUE7Q0FKRixFQUFjO0NBRGhCLENBQUEifX0seyJvZmZzZXQiOnsibGluZSI6MTA2MTIsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92ZW5kb3JzLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJ2ZW5kb3JzID0gXG4gICMgZG9jdW1lbnRhdGlvbjogaHR0cDovL21vZGVybml6ci5jb20vZG9jcy9cbiAgTW9kZXJuaXpyICAgICAgICAgICAgOiByZXF1aXJlICcuLi92ZW5kb3JzL21vZGVybml6ci5jdXN0b20uanMnXG5cbiAgIyBkb2N1bWVudGF0aW9uOiBodHRwczovL2dpdGh1Yi5jb20vamVyZW15aGFycmlzL0xvY2FsQ29ubmVjdGlvbi5qcy90cmVlL21hc3RlclxuICBMb2NhbENvbm5lY3Rpb24gICAgICA6IHJlcXVpcmUgJy4uL3ZlbmRvcnMvTG9jYWxDb25uZWN0aW9uLmpzJ1xuXG5cbiAgIyBkb2N1bW50YXRpb246IGh0dHBzOi8vZ2l0aHViLmNvbS9qb2V3YWxuZXMvcmVjb25uZWN0aW5nLXdlYnNvY2tldFxuICBSZWNvbm5lY3RpbmdXZWJzb2NrZXQ6IHJlcXVpcmUgJy4uL3ZlbmRvcnMvcmVjb25uZWN0aW5nLXdlYnNvY2tldC5qcydcblxuICAjIERvY3VtZW50YXRpb246IGh0dHA6Ly9jbG91ZGluYXJ5LmNvbS9kb2N1bWVudGF0aW9uL2pxdWVyeV9pbnRlZ3JhdGlvblxuICBKcXVlcnlVaVdpZGdldCAgICAgICA6IHJlcXVpcmUgJy4uL3ZlbmRvcnMvanF1ZXJ5LnVpLndpZGdldC5qcydcbiAgSWZyYW1lVHJhbnNwb3J0ICAgICAgOiByZXF1aXJlICcuLi92ZW5kb3JzL2pxdWVyeS5pZnJhbWUtdHJhbnNwb3J0LmpzJ1xuICBGaWxlVXBsb2FkICAgICAgICAgICA6IHJlcXVpcmUgJy4uL3ZlbmRvcnMvanF1ZXJ5LmZpbGV1cGxvYWQuanMnXG4gIENsb3VkaW5hcnkgICAgICAgICAgIDogcmVxdWlyZSAnLi4vdmVuZG9ycy9qcXVlcnkuY2xvdWRpbmFyeS5qcydcblxubW9kdWxlLmV4cG9ydHMgPSB2ZW5kb3JzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsR0FBQTs7QUFBQSxDQUFBLEVBRUUsSUFGRjtDQUVFLENBQUEsS0FBdUIsRUFBdkIsdUJBQXVCO0NBQXZCLENBR0EsS0FBdUIsUUFBdkIsZ0JBQXVCO0NBSHZCLENBT0EsS0FBdUIsY0FBdkIsaUJBQXVCO0NBUHZCLENBVUEsS0FBdUIsT0FBdkIsa0JBQXVCO0NBVnZCLENBV0EsS0FBdUIsUUFBdkIsd0JBQXVCO0NBWHZCLENBWUEsS0FBdUIsR0FBdkIsdUJBQXVCO0NBWnZCLENBYUEsS0FBdUIsR0FBdkIsdUJBQXVCO0NBZnpCLENBQUE7O0FBaUJBLENBakJBLEVBaUJpQixHQUFYLENBQU4ifX0seyJvZmZzZXQiOnsibGluZSI6MTA2MjgsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9hcHBjYXN0X2luc3RydWN0aW9ucy5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiYXBwY2FzdCA9IHJlcXVpcmUgJy4uL2NvbnRyb2xsZXJzL2FwcGNhc3QnXG5cbm1vZHVsZS5leHBvcnRzID0gKCBkb20gKSAtPlxuXG4gIGFwcGNhc3Qub24gJ2Nvbm5lY3RlZCcsICggaXNfY29ubmVjdGVkICkgLT5cblxuICAgIGlmIGlzX2Nvbm5lY3RlZFxuXG4gICAgICBkb20uaGlkZSgpXG5cbiAgICBlbHNlXG5cbiAgICAgIGRvbS5zaG93KCkiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxHQUFBOztBQUFBLENBQUEsRUFBVSxJQUFWLGlCQUFVOztBQUVWLENBRkEsRUFFaUIsR0FBWCxDQUFOLEVBQW1CO0NBRVQsQ0FBUixDQUF3QixJQUFqQixFQUFQLEVBQUEsQ0FBd0I7Q0FFdEIsR0FBQSxRQUFBO0NBRU0sRUFBRCxDQUFILFNBQUE7TUFGRjtDQU1NLEVBQUQsQ0FBSCxTQUFBO01BUm9CO0NBQXhCLEVBQXdCO0NBRlQifX0seyJvZmZzZXQiOnsibGluZSI6MTA2NDQsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9idXR0b25zL3NoYXJlLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFNoYXJlXG5cbiAgb3BlbmVkICAgIDogZmFsc2VcbiAgaGFuZGxlciAgIDogbnVsbFxuICBibGFja19ib3ggOiBudWxsXG4gIGlucHV0ICAgICA6IG51bGxcbiAgY29weV9idG4gIDogbnVsbFxuXG4gIGNvbnN0cnVjdG9yOiAoQGRvbSkgLT5cbiAgICByZWYgPSBAXG5cbiAgICBodG1sID0gcmVxdWlyZSAndGVtcGxhdGVzL2J1dHRvbnMvc2hhcmUnXG5cbiAgICBkYXRhID0gXG4gICAgICBsaW5rOiBAZG9tLmRhdGEgJ3Blcm1hbGluaydcbiAgICAgIFxuICAgIEBkb20uYXBwZW5kIGh0bWwoIGRhdGEgKVxuXG5cbiAgICBAaGFuZGxlciAgID0gQGRvbS5maW5kICcuc3MtYWN0aW9uJ1xuICAgIEBibGFja19ib3ggPSBAZG9tLmZpbmQgJy5zaGFyZV9ib3gnIFxuICAgIEBpbnB1dCAgICAgPSBAZG9tLmZpbmQgJ2lucHV0J1xuICAgIEBjb3B5X2J0biAgPSBAZG9tLmZpbmQgJy5idXR0b24nXG5cbiAgICBAaGFuZGxlci5vbiAnY2xpY2snLCBAdG9nZ2xlXG4gICAgQGRvbS5vbiAnY2xpY2snLCAgKGUpIC0+IGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICBAaW5wdXQub24gJ2NsaWNrJywgQHNlbGVjdFxuICAgIEBjb3B5X2J0bi5vbiAnY2xpY2snLCBAb25fY29weV9jbGlja2VkXG4gICAgYXBwLm9uICdzaGFyZTpvcGVuZWQnLCBAb25fc2hhcmVfb3BlbmVkXG4gICAgYXBwLndpbmRvdy5vbiAnYm9keTpjbGlja2VkJywgQGNsb3NlXG4gICAgYXBwLndpbmRvdy5vbiAnc2Nyb2xsJywgQGNsb3NlXG5cbiAgb25fc2hhcmVfb3BlbmVkOiAoIHVpZCApID0+XG4gICAgaWYgdWlkIGlzbnQgQHVpZFxuICAgICAgQGNsb3NlKClcblxuICBvbl9jb3B5X2NsaWNrZWQ6ID0+XG4gICAgQGlucHV0WyAwIF0uc2VsZWN0KClcbiAgICBpZiBhcHAuc2V0dGluZ3MuYnJvd3Nlci5PUyBpcyBcIk1hY1wiXG4gICAgICB0ZXh0ID0gXCJQcmVzcyBDTUQgKyBDIHRvIGNvcHkgdGhlIGxpbmtcIlxuICAgIGVsc2VcbiAgICAgIHRleHQgPSBcIlByZXNzIEN0cmwgKyBDIHRvIGNvcHkgdGhlIGxpbmtcIlxuICAgIGFsZXJ0IHRleHRcblxuXG4gIHRvZ2dsZSA6IChlKSA9PlxuICAgIGlmIEBvcGVuZWQgXG4gICAgICBAY2xvc2UoKVxuICAgIGVsc2VcbiAgICAgIEBvcGVuKClcblxuICAgIGUucHJldmVudERlZmF1bHQoKVxuXG4gIGNsb3NlIDogPT5cbiAgICByZXR1cm4gaWYgbm90IEBvcGVuZWRcbiAgICBAb3BlbmVkID0gZmFsc2VcbiAgICBAZG9tLnJlbW92ZUNsYXNzICdvcGVuZWQnXG5cbiAgb3BlbiA6ID0+XG4gICAgcmV0dXJuIGlmIEBvcGVuZWRcbiAgICBAb3BlbmVkID0gdHJ1ZVxuICAgIGFwcC5lbWl0ICdzaGFyZTpvcGVuZWQnLCBAdWlkXG5cbiAgICAjIENoZWNrIHRoZSBwb3NpdGlvbiBvZiB0aGUgaGFuZGxlclxuICAgIHRvcCA9IEBoYW5kbGVyLm9mZnNldCgpLnRvcFxuICAgIHkgPSBhcHAud2luZG93LnlcbiAgICBoID0gQGJsYWNrX2JveC5oZWlnaHQoKVxuICAgIGRpZmYgPSB0b3AgLSB5XG4gICAgbG9nICdwb3NpdGlvbicsIGRpZmYsIGgrMTAwXG5cbiAgICBpZiBkaWZmIDwgaCArIDEwMFxuICAgICAgQGRvbS5hZGRDbGFzcyAnb25fYm90dG9tJ1xuICAgIGVsc2VcbiAgICAgIEBkb20ucmVtb3ZlQ2xhc3MgJ29uX2JvdHRvbSdcblxuICAgIEBkb20uYWRkQ2xhc3MgJ29wZW5lZCdcblxuICB1cGRhdGVfbGluazogKCBsaW5rICkgLT5cbiAgICBAaW5wdXQudmFsIGxpbmtcblxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQGhhbmRsZXIub2ZmICdjbGljaycsIEB0b2dnbGVcbiAgICBAZG9tLm9mZiAnY2xpY2snXG4gICAgQGlucHV0Lm9mZiAnY2xpY2snLCBAc2VsZWN0XG4gICAgQGNvcHlfYnRuLm9mZiAnY2xpY2snLCBAb25fY29weV9jbGlja2VkXG4gICAgYXBwLm9mZiAnc2hhcmU6b3BlbmVkJywgQG9uX3NoYXJlX29wZW5lZFxuICAgIGFwcC53aW5kb3cub2ZmICdib2R5OmNsaWNrZWQnLCBAY2xvc2VcbiAgICBhcHAud2luZG93Lm9mZiAnc2Nyb2xsJywgQGNsb3NlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsQ0FBQTtHQUFBLCtFQUFBOztBQUFBLENBQUEsRUFBdUIsR0FBakIsQ0FBTjtDQUVFLEVBQVksRUFBWixDQUFBOztDQUFBLEVBQ1ksQ0FEWixHQUNBOztDQURBLEVBRVksQ0FGWixLQUVBOztDQUZBLEVBR1ksQ0FIWixDQUdBOztDQUhBLEVBSVksQ0FKWixJQUlBOztDQUVhLENBQUEsQ0FBQSxZQUFFO0NBQ2IsT0FBQSxPQUFBO0NBQUEsRUFEYSxDQUFEO0NBQ1osa0NBQUE7Q0FBQSxvQ0FBQTtDQUFBLHNDQUFBO0NBQUEsd0RBQUE7Q0FBQSx3REFBQTtDQUFBLEVBQUEsQ0FBQTtDQUFBLEVBRU8sQ0FBUCxHQUFPLGtCQUFBO0NBRlAsRUFLRSxDQURGO0NBQ0UsQ0FBTSxDQUFJLENBQVYsRUFBQSxLQUFNO0NBTFIsS0FBQTtDQUFBLEVBT0ksQ0FBSixFQUFBO0NBUEEsRUFVYSxDQUFiLEdBQUEsS0FBYTtDQVZiLEVBV2EsQ0FBYixLQUFBLEdBQWE7Q0FYYixFQVlhLENBQWIsQ0FBQSxFQUFhO0NBWmIsRUFhYSxDQUFiLElBQUEsQ0FBYTtDQWJiLENBZUEsRUFBQSxFQUFBLENBQVE7Q0FmUixDQWdCQSxDQUFJLENBQUosR0FBQSxFQUFtQjtDQUFPLFlBQUQsRUFBQTtDQUF6QixJQUFrQjtDQWhCbEIsQ0FpQkEsRUFBQSxDQUFNLENBQU4sQ0FBQTtDQWpCQSxDQWtCQSxFQUFBLEdBQUEsQ0FBUyxPQUFUO0NBbEJBLENBbUJBLENBQUcsQ0FBSCxVQUFBLENBQUE7Q0FuQkEsQ0FvQkEsQ0FBRyxDQUFILENBQUEsQ0FBVSxRQUFWO0NBcEJBLENBcUJBLENBQUcsQ0FBSCxDQUFBLENBQVUsRUFBVjtDQTVCRixFQU1hOztDQU5iLEVBOEJpQixNQUFFLE1BQW5CO0NBQ0UsRUFBRyxDQUFILENBQVk7Q0FDVCxHQUFBLENBQUQsUUFBQTtNQUZhO0NBOUJqQixFQThCaUI7O0NBOUJqQixFQWtDaUIsTUFBQSxNQUFqQjtDQUNFLEdBQUEsSUFBQTtDQUFBLEdBQUEsQ0FBUSxDQUFSO0NBQ0EsQ0FBRyxDQUFHLENBQU4sQ0FBOEIsRUFBUCxDQUFSO0NBQ2IsRUFBTyxDQUFQLEVBQUEsMEJBQUE7TUFERjtDQUdFLEVBQU8sQ0FBUCxFQUFBLDJCQUFBO01BSkY7Q0FLTSxHQUFOLENBQUEsTUFBQTtDQXhDRixFQWtDaUI7O0NBbENqQixFQTJDUyxHQUFULEdBQVU7Q0FDUixHQUFBLEVBQUE7Q0FDRSxHQUFDLENBQUQsQ0FBQTtNQURGO0NBR0UsR0FBQyxFQUFEO01BSEY7Q0FLQyxVQUFELEdBQUE7Q0FqREYsRUEyQ1M7O0NBM0NULEVBbURRLEVBQVIsSUFBUTtBQUNRLENBQWQsR0FBQSxFQUFBO0NBQUEsV0FBQTtNQUFBO0NBQUEsRUFDVSxDQUFWLENBREEsQ0FDQTtDQUNDLEVBQUcsQ0FBSCxJQUFELEdBQUE7Q0F0REYsRUFtRFE7O0NBbkRSLEVBd0RPLENBQVAsS0FBTztDQUNMLE9BQUEsT0FBQTtDQUFBLEdBQUEsRUFBQTtDQUFBLFdBQUE7TUFBQTtDQUFBLEVBQ1UsQ0FBVixFQUFBO0NBREEsQ0FFeUIsQ0FBdEIsQ0FBSCxVQUFBO0NBRkEsRUFLQSxDQUFBLEVBQU0sQ0FBUTtDQUxkLEVBTUksQ0FBSixFQUFjO0NBTmQsRUFPSSxDQUFKLEVBQUksR0FBVTtDQVBkLEVBUU8sQ0FBUDtDQVJBLENBU2dCLENBQWhCLENBQUEsTUFBQTtDQUVBLEVBQVUsQ0FBVjtDQUNFLEVBQUksQ0FBSCxFQUFELEVBQUEsR0FBQTtNQURGO0NBR0UsRUFBSSxDQUFILEVBQUQsS0FBQTtNQWRGO0NBZ0JDLEVBQUcsQ0FBSCxJQUFELEdBQUE7Q0F6RUYsRUF3RE87O0NBeERQLEVBMkVhLENBQUEsS0FBRSxFQUFmO0NBQ0csRUFBRCxDQUFDLENBQUssTUFBTjtDQTVFRixFQTJFYTs7Q0EzRWIsRUErRVMsSUFBVCxFQUFTO0NBQ1AsQ0FBc0IsQ0FBdEIsQ0FBQSxFQUFBLENBQVE7Q0FBUixFQUNJLENBQUosR0FBQTtDQURBLENBRW9CLENBQXBCLENBQUEsQ0FBTSxDQUFOLENBQUE7Q0FGQSxDQUd1QixDQUF2QixDQUFBLEdBQUEsQ0FBUyxPQUFUO0NBSEEsQ0FJd0IsQ0FBckIsQ0FBSCxVQUFBLENBQUE7Q0FKQSxDQUsrQixDQUE1QixDQUFILENBQUEsQ0FBVSxRQUFWO0NBQ0ksQ0FBcUIsQ0FBdEIsQ0FBdUIsQ0FBMUIsQ0FBVSxFQUFWLEdBQUE7Q0F0RkYsRUErRVM7O0NBL0VUOztDQUZGIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjEwNzYxLCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvYnV0dG9ucy9zdGFydF9zdG9wLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJoYXBwZW5zID0gcmVxdWlyZSAnaGFwcGVucydcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBTdGFydFN0b3Bcblx0c3RhcnRlZCAgICAgOiBmYWxzZVxuXHRmaXJzdF9jbGljayA6IHRydWVcblxuXHRjb25zdHJ1Y3RvcjogKEBkb20pIC0+XG5cdFx0aGFwcGVucyBAXG5cdFxuXHRcdEBkb20uYWRkQ2xhc3MgJ3N0YXJ0X3N0b3AnXG5cdFx0QGRvbS5vbiAnY2xpY2snLCBAdG9nZ2xlXG5cblx0XHRpZiBAZG9tLmRhdGEoICd3aWR0aCcgKSBpcyAnZml4ZWQnXG5cdFx0XHRAbG9ja193aWR0aCgpXG5cblx0bG9ja193aWR0aDogLT5cblx0XHRzdGFydF9idXR0b24gPSBAZG9tLmZpbmQgJy5zdGFydCdcblx0XHRzdG9wX2J1dHRvbiAgPSBAZG9tLmZpbmQgJy5zdG9wJ1xuXG5cdFx0dyA9IE1hdGgubWF4KCBzdGFydF9idXR0b24ud2lkdGgoKSwgc3RvcF9idXR0b24ud2lkdGgoKSApICsgMlxuXHRcdHN0YXJ0X2J1dHRvbi53aWR0aCB3XG5cdFx0c3RvcF9idXR0b24ud2lkdGggd1xuXG5cblx0dG9nZ2xlIDogPT5cblxuXHRcdGlmIEBzdGFydGVkXG5cdFx0XHRAc3RvcCgpXG5cdFx0ZWxzZVxuXHRcdFx0QHN0YXJ0KClcblxuXHRcdEBmaXJzdF9jbGljayA9IGZhbHNlXG5cblx0c3RvcCA6IC0+XG5cdFx0cmV0dXJuIGlmIG5vdCBAc3RhcnRlZFxuXG5cdFx0QHN0YXJ0ZWQgPSBmYWxzZVxuXG5cdFx0QGRvbS5yZW1vdmVDbGFzcyBcInN0YXJ0ZWRcIlxuXG5cdFx0QGVtaXQgJ2NoYW5nZScsICdzdG9wJ1xuXG5cblx0c3RhcnQgOiAtPlxuXHRcdHJldHVybiBpZiBAc3RhcnRlZFxuXG5cdFx0QHN0YXJ0ZWQgPSB0cnVlXG5cblx0XHRAZG9tLmFkZENsYXNzIFwic3RhcnRlZFwiXG5cblx0XHRAZW1pdCAnY2hhbmdlJywgJ3N0YXJ0JyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGNBQUE7R0FBQSwrRUFBQTs7QUFBQSxDQUFBLEVBQVUsSUFBVixFQUFVOztBQUVWLENBRkEsRUFFdUIsR0FBakIsQ0FBTjtDQUNDLEVBQWMsRUFBZCxFQUFBOztDQUFBLEVBQ2MsQ0FEZCxPQUNBOztDQUVhLENBQUEsQ0FBQSxnQkFBRTtDQUNkLEVBRGMsQ0FBRDtDQUNiLHNDQUFBO0NBQUEsR0FBQSxHQUFBO0NBQUEsRUFFSSxDQUFKLElBQUEsSUFBQTtDQUZBLENBR0EsQ0FBSSxDQUFKLEVBQUEsQ0FBQTtDQUVBLEVBQU8sQ0FBUCxDQUEyQixFQUF4QjtDQUNGLEdBQUMsRUFBRCxJQUFBO01BUFc7Q0FIYixFQUdhOztDQUhiLEVBWVksTUFBQSxDQUFaO0NBQ0MsT0FBQSxvQkFBQTtDQUFBLEVBQWUsQ0FBZixJQUFlLElBQWY7Q0FBQSxFQUNlLENBQWYsR0FBZSxJQUFmO0NBREEsQ0FHb0MsQ0FBaEMsQ0FBSixDQUFjLE1BQWlDLENBQXJCO0NBSDFCLEdBSUEsQ0FBQSxPQUFZO0NBQ0EsSUFBWixNQUFBO0NBbEJELEVBWVk7O0NBWlosRUFxQlMsR0FBVCxHQUFTO0NBRVIsR0FBQSxHQUFBO0NBQ0MsR0FBQyxFQUFEO01BREQ7Q0FHQyxHQUFDLENBQUQsQ0FBQTtNQUhEO0NBS0MsRUFBYyxDQUFkLE9BQUQ7Q0E1QkQsRUFxQlM7O0NBckJULEVBOEJPLENBQVAsS0FBTztBQUNRLENBQWQsR0FBQSxHQUFBO0NBQUEsV0FBQTtNQUFBO0NBQUEsRUFFVyxDQUFYLENBRkEsRUFFQTtDQUZBLEVBSUksQ0FBSixLQUFBLEVBQUE7Q0FFQyxDQUFlLEVBQWYsRUFBRCxFQUFBLEdBQUE7Q0FyQ0QsRUE4Qk87O0NBOUJQLEVBd0NRLEVBQVIsSUFBUTtDQUNQLEdBQUEsR0FBQTtDQUFBLFdBQUE7TUFBQTtDQUFBLEVBRVcsQ0FBWCxHQUFBO0NBRkEsRUFJSSxDQUFKLElBQUEsQ0FBQTtDQUVDLENBQWUsRUFBZixHQUFELENBQUEsR0FBQTtDQS9DRCxFQXdDUTs7Q0F4Q1I7O0NBSEQifX0seyJvZmZzZXQiOnsibGluZSI6MTA4MjQsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9jb21wb25lbnRzL2F1ZGlvL21ldGVyLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IGNsYXNzIE1ldGVyXG5cbiAgY29uc3RydWN0b3I6IChAZG9tKSAtPiAgXG4gICAgQHByb2dyZXNzID0gQGRvbS5maW5kICcubWV0ZXIgc3BhbidcblxuICAgIEBpc19sZWZ0ID0gQGRvbS5hdHRyKCAnY2xhc3MnICkuaW5kZXhPZiggXCJsZWZ0XCIgKSBpc250IC0xXG5cbiAgICBhcHBjYXN0Lm9uICdzdHJlYW06dnUnLCAoIG1ldGVyICkgPT5cblxuICAgICAgaWYgQGlzX2xlZnRcbiAgICAgICAgQHNldF92b2x1bWUgbWV0ZXJbMF0gKiA1XG4gICAgICBlbHNlXG4gICAgICAgIEBzZXRfdm9sdW1lIG1ldGVyWzFdICogNVxuXG4gIHNldF92b2x1bWU6ICggcGVyYyApIC0+XG5cbiAgICBAcHJvZ3Jlc3MuY3NzICd3aWR0aCcsIFwiI3twZXJjICogMTAwfSVcIlxuXG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxDQUFBOztBQUFBLENBQUEsRUFBdUIsR0FBakIsQ0FBTjtDQUVlLENBQUEsQ0FBQSxZQUFFO0NBQ2IsT0FBQSxJQUFBO0NBQUEsRUFEYSxDQUFEO0NBQ1osRUFBWSxDQUFaLElBQUEsS0FBWTtBQUU0QyxDQUZ4RCxFQUVXLENBQVgsQ0FBdUQsQ0FBNUMsQ0FBWDtDQUZBLENBSUEsQ0FBd0IsQ0FBeEIsQ0FBd0IsRUFBakIsRUFBbUIsRUFBMUI7Q0FFRSxHQUFHLENBQUMsQ0FBSixDQUFBO0NBQ0csRUFBc0IsRUFBdEIsS0FBRCxLQUFBO01BREYsRUFBQTtDQUdHLEVBQXNCLEVBQXRCLEtBQUQsS0FBQTtRQUxvQjtDQUF4QixJQUF3QjtDQUwxQixFQUFhOztDQUFiLEVBWVksQ0FBQSxLQUFFLENBQWQ7Q0FFRyxDQUFzQixDQUF2QixDQUFDLEdBQUQsQ0FBUyxHQUFUO0NBZEYsRUFZWTs7Q0FaWjs7Q0FGRiJ9fSx7Im9mZnNldCI6eyJsaW5lIjoxMDg1MSwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2NvbXBvbmVudHMvYXVkaW8vcGxheWVyLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFBsYXllclxuICBjb25zdHJ1Y3RvcjogKCBAZG9tICkgLT5cbiAgICBAY292ZXIgPSBAZG9tLmZpbmQgJy5wbGF5ZXJfaWNvbiBpbWcnXG4gICAgQHRpdGxlID0gQGRvbS5maW5kICcucGxheWVyX3RpdGxlJ1xuICAgIEBhdXRob3IgPSBAZG9tLmZpbmQgJy5wbGF5ZXJfYXV0aG9yJ1xuXG4gICAgZGVsYXkgMjAwMCwgPT5cbiAgICAgIEBvcGVuIFxuICAgICAgICBjb3ZlcjogXCIvaW1hZ2VzL3Byb2ZpbGVfYmlnLnBuZ1wiXG4gICAgICAgIHRpdGxlOiBcIkxpdmUgZnJvbSBTaXJhY3VzYVwiXG4gICAgICAgIGF1dGhvcjogXCJTdGVmYW5vIE9ydGlzaVwiXG4gICAgICAgIHVybDogXCJodHRwOi8vbG9vcGNhc3QuY29tL3N0ZWZhbm9vcnRpc2kvbGl2ZVwiXG4gICAgICAgIGF1dGhvcl9saW5rOiBcImh0dHA6Ly9sb29wY2FzdC5jb20vc3RlZmFub29ydGlzaVwiXG5cbiAgICB2aWV3Lm9uY2UgJ2JpbmRlZCcsIEBvbl92aWV3c19iaW5kZWRcblxuICBvbl92aWV3c19iaW5kZWQ6ID0+XG4gICAgQHNoYXJlID0gdmlldy5nZXRfYnlfZG9tIEBkb20uZmluZCggJy5zaGFyZV93cmFwcGVyJyApXG4gICAgXG4gIG9wZW46ICggZGF0YSApIC0+XG4gICAgaWYgZGF0YT9cbiAgICAgIEBjb3Zlci5hdHRyICdzcmMnLCBkYXRhLmNvdmVyXG4gICAgICBAdGl0bGUuaHRtbCBkYXRhLnRpdGxlXG4gICAgICBAYXV0aG9yLmh0bWwgXCJCeSBcIiArIGRhdGEuYXV0aG9yXG5cbiAgICAgIEBhdXRob3IuYXR0ciAndGl0bGUnLCBkYXRhLnRpdGxlXG4gICAgICBAdGl0bGUuYXR0ciAndGl0bGUnLCBkYXRhLmF1dGhvclxuXG4gICAgICBAYXV0aG9yLmF0dHIgJ2hyZWYnLCBkYXRhLmF1dGhvcl9saW5rXG4gICAgICBAdGl0bGUuYXR0ciAnaHJlZicsIGRhdGEudXJsXG5cbiAgICAgIEBjb3Zlci5wYXJlbnQoKS5hdHRyICdocmVmJywgZGF0YS51cmxcbiAgICAgIEBjb3Zlci5wYXJlbnQoKS5hdHRyICd0aXRsZScsIGRhdGEudGl0bGVcblxuICAgICAgQHNoYXJlLnVwZGF0ZV9saW5rIGRhdGEudXJsXG5cbiAgICBAZG9tLmFkZENsYXNzICd2aXNpYmxlJ1xuXG4gIGNsb3NlOiAoICkgLT5cbiAgICBAZG9tLnJlbW92ZUNsYXNzICd2aXNpYmxlJ1xuXG5cblxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsRUFBQTtHQUFBLCtFQUFBOztBQUFBLENBQUEsRUFBdUIsR0FBakIsQ0FBTjtDQUNlLENBQUEsQ0FBQSxhQUFHO0NBQ2QsT0FBQSxJQUFBO0NBQUEsRUFEYyxDQUFEO0NBQ2Isd0RBQUE7Q0FBQSxFQUFTLENBQVQsQ0FBQSxhQUFTO0NBQVQsRUFDUyxDQUFULENBQUEsVUFBUztDQURULEVBRVUsQ0FBVixFQUFBLFVBQVU7Q0FGVixDQUlZLENBQUEsQ0FBWixDQUFBLElBQVk7Q0FDVCxHQUFELENBQUMsUUFBRDtDQUNFLENBQU8sR0FBUCxHQUFBLGlCQUFBO0NBQUEsQ0FDTyxHQUFQLEdBQUEsWUFEQTtDQUFBLENBRVEsSUFBUixFQUFBLFFBRkE7Q0FBQSxDQUdLLENBQUwsS0FBQSxnQ0FIQTtDQUFBLENBSWEsTUFBYixHQUFBLHdCQUpBO0NBRlEsT0FDVjtDQURGLElBQVk7Q0FKWixDQVlvQixFQUFwQixJQUFBLE9BQUE7Q0FiRixFQUFhOztDQUFiLEVBZWlCLE1BQUEsTUFBakI7Q0FDRyxFQUFRLENBQVIsQ0FBRCxLQUFTLENBQVQsS0FBeUI7Q0FoQjNCLEVBZWlCOztDQWZqQixFQWtCTSxDQUFOLEtBQVE7Q0FDTixHQUFBLFFBQUE7Q0FDRSxDQUFtQixFQUFsQixDQUFLLENBQU47Q0FBQSxHQUNDLENBQUssQ0FBTjtDQURBLEVBRXFCLENBQXBCLENBQVksQ0FBYjtDQUZBLENBSXNCLEVBQXJCLENBQUQsQ0FBQSxDQUFBO0NBSkEsQ0FLcUIsRUFBcEIsQ0FBSyxDQUFOLENBQUE7Q0FMQSxDQU9xQixFQUFwQixFQUFELEtBQUE7Q0FQQSxDQVFvQixDQUFwQixDQUFDLENBQUssQ0FBTjtDQVJBLENBVTZCLENBQTdCLENBQUMsQ0FBSyxDQUFOO0NBVkEsQ0FXOEIsRUFBN0IsQ0FBSyxDQUFOLENBQUE7Q0FYQSxFQWFBLENBQUMsQ0FBSyxDQUFOLEtBQUE7TUFkRjtDQWdCQyxFQUFHLENBQUgsSUFBRCxDQUFBLEVBQUE7Q0FuQ0YsRUFrQk07O0NBbEJOLEVBcUNPLEVBQVAsSUFBTztDQUNKLEVBQUcsQ0FBSCxLQUFELEVBQUE7Q0F0Q0YsRUFxQ087O0NBckNQOztDQURGIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjEwOTA0LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvY29tcG9uZW50cy9hdWRpby9wbGF5ZXJfcHJldmlldy5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSAoZG9tKSAtPlxuICBcbiAgaXNfcGxheWluZyA9IGZhbHNlXG4gIGljb24gICAgICAgPSBkb20uZmluZCAnLnNzLXBsYXknXG4gIGlmIGljb24ubGVuZ3RoIDw9IDBcbiAgICBpY29uICAgICAgID0gZG9tLmZpbmQgJy5zcy1wYXVzZSdcblxuICAgIGlmIGljb24ubGVuZ3RoIDw9IDBcbiAgICAgIGxvZyBcIkVSUk9SIC0+IFtQTEFZRVIgUFJFVklFV10uIGljb24ubGVuZ3RoIDw9IDBcIlxuICAgICAgcmV0dXJuXG5cbiAgcmVmID0gQFxuXG4gIGRvbS5hZGRDbGFzcyAncGxheWVyX3ByZXZpZXcnXG5cbiAgcGxheSA9IC0+XG4gICAgcmV0dXJuIGlmIGlzX3BsYXlpbmdcblxuICAgIGlzX3BsYXlpbmcgPSB0cnVlXG4gICAgZG9tLmFkZENsYXNzICdwbGF5aW5nJ1xuICAgIGljb24uYWRkQ2xhc3MoICdzcy1wYXVzZScgKS5yZW1vdmVDbGFzcyggJ3NzLXBsYXknIClcblxuXG4gICAgYXBwLmVtaXQgJ2F1ZGlvOnN0YXJ0ZWQnLCByZWYudWlkXG5cbiAgc3RvcCA9IC0+XG4gICAgcmV0dXJuIGlmIG5vdCBpc19wbGF5aW5nXG5cbiAgICBpc19wbGF5aW5nID0gZmFsc2VcbiAgICBkb20ucmVtb3ZlQ2xhc3MgJ3BsYXlpbmcnXG4gICAgaWNvbi5yZW1vdmVDbGFzcyggJ3NzLXBhdXNlJyApLmFkZENsYXNzKCAnc3MtcGxheScgKVxuXG5cbiAgdG9nZ2xlID0gLT5cbiAgICBpZiBpc19wbGF5aW5nXG4gICAgICBzdG9wKClcbiAgICBlbHNlXG4gICAgICBwbGF5KClcblxuICBpbml0ID0gLT5cbiAgICBpY29uLm9uICdjbGljaycsIHRvZ2dsZVxuXG4gICAgYXBwLm9uICdhdWRpbzpzdGFydGVkJywgKHVpZCkgLT5cbiAgICAgIGlmIHVpZCBpc250IHJlZi51aWRcbiAgICAgICAgc3RvcCgpXG5cblxuICBpbml0KCkiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsQ0FBTyxFQUFVLEdBQVgsQ0FBTixFQUFrQjtDQUVoQixLQUFBLHlDQUFBO0NBQUEsQ0FBQSxDQUFhLEVBQWIsS0FBQTtDQUFBLENBQ0EsQ0FBYSxDQUFiLE1BQWE7Q0FDYixDQUFBLEVBQUcsRUFBQTtDQUNELEVBQWEsQ0FBYixPQUFhO0NBRWIsR0FBQSxFQUFHO0NBQ0QsRUFBQSxHQUFBLHVDQUFBO0NBQ0EsV0FBQTtNQUxKO0lBRkE7Q0FBQSxDQVNBLENBQUEsQ0FUQTtDQUFBLENBV0EsQ0FBRyxLQUFILFFBQUE7Q0FYQSxDQWFBLENBQU8sQ0FBUCxLQUFPO0NBQ0wsR0FBQSxNQUFBO0NBQUEsV0FBQTtNQUFBO0NBQUEsRUFFYSxDQUFiLE1BQUE7Q0FGQSxFQUdHLENBQUgsSUFBQSxDQUFBO0NBSEEsR0FJQSxJQUFBLENBQUEsQ0FBQSxDQUFBO0NBR0ksQ0FBc0IsQ0FBdkIsQ0FBSCxPQUFBLElBQUE7Q0FyQkYsRUFhTztDQWJQLENBdUJBLENBQU8sQ0FBUCxLQUFPO0FBQ1MsQ0FBZCxHQUFBLE1BQUE7Q0FBQSxXQUFBO01BQUE7Q0FBQSxFQUVhLENBQWIsQ0FGQSxLQUVBO0NBRkEsRUFHRyxDQUFILEtBQUEsRUFBQTtDQUNLLEdBQUQsSUFBSixDQUFBLENBQUEsQ0FBQTtDQTVCRixFQXVCTztDQXZCUCxDQStCQSxDQUFTLEdBQVQsR0FBUztDQUNQLEdBQUEsTUFBQTtDQUNFLEdBQUEsU0FBQTtNQURGO0NBR0UsR0FBQSxTQUFBO01BSks7Q0EvQlQsRUErQlM7Q0EvQlQsQ0FxQ0EsQ0FBTyxDQUFQLEtBQU87Q0FDTCxDQUFBLEVBQUEsRUFBQSxDQUFBO0NBRUksQ0FBSixDQUFHLE1BQXNCLEVBQXpCLElBQUE7Q0FDRSxFQUFHLENBQUEsQ0FBUyxDQUFaO0NBQ0UsR0FBQSxXQUFBO1FBRm9CO0NBQXhCLElBQXdCO0NBeEMxQixFQXFDTztDQVFQLEdBQUEsS0FBQTtDQS9DZSJ9fSx7Im9mZnNldCI6eyJsaW5lIjoxMDk1NCwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2NvbXBvbmVudHMvYnV0dG9ucy9nb19saXZlLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJMICAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vYXBpL2xvb3BjYXN0L2xvb3BjYXN0J1xuYXBwY2FzdCA9IHJlcXVpcmUgJy4uLy4uLy4uL2NvbnRyb2xsZXJzL2FwcGNhc3QnXG5cbm1vZHVsZS5leHBvcnRzID0gKCBkb20gKSAtPlxuXG4gIGRvbS5maW5kKCdhJykuY2xpY2sgLT5cblxuICAgIGNvbnNvbGUubG9nIFwiY2xpY2tlZCBnbyBsaXZlIVwiXG5cbiAgICBpZiBub3QgYXBwY2FzdC5nZXQoICdpbnB1dF9kZXZpY2UnIClcblxuICAgICAgY29uc29sZS5lcnJvciBcImNhbid0IGdvdCBsaXZlIHdpdGhvdXQgc2VsZWN0aW5nIGlucHV0IGRldmljZVwiXG5cbiAgICAgIHJldHVyblxuXG4gICAgIyBUT0RPOiBtYWtlIGl0IGNsZXZlclxuICAgIHVzZXJuYW1lID0gbG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoXCIvXCIpWzFdXG5cbiAgICAjIHN0YXJ0IEFwcGNhc3Qgc3RyZWFtaW5nXG4gICAgYXBwY2FzdC5zdGFydF9zdHJlYW0gdXNlcm5hbWUsIGFwcGNhc3QuZ2V0KCAnaW5wdXRfZGV2aWNlJyApXG5cbiAgICBkb20uZmluZCgnYScpLmh0bWwgXCJXQUlUSU5HIEFQUENBU1RcIlxuXG4gICAgIyB3YWl0IEFwcGNhc3QgdG8gYmUgbGl2ZSwgc28gdGhlbiB3ZSBjYW4gdXBkYXRlXG4gICAgIyB0aGUgYmFja2VuZFxuICAgIGFwcGNhc3Qub24gJ3N0cmVhbTpvbmxpbmUnLCAoIHN0YXR1cyApIC0+XG5cbiAgICAgIGlmIG5vdCBzdGF0dXNcblxuICAgICAgICBkb20uZmluZCgnYScpLmh0bWwgXCJXRU5UIE9GRkxJTkUgOiAoXCJcblxuICAgICAgICByZXR1cm5cblxuICAgICAgZG9tLmZpbmQoJ2EnKS5odG1sIFwiQVBQQ0FTVCBJUyBTVFJFQU1JTkchIFwiXG5cbiAgICAgICMgZ2V0cyB0aGUgaWQgb2YgdGhlIHJvb20gZnJvbSB0aGUgdXJsXG4gICAgICByb29tX2lkID0gbG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoXCIvXCIpWzJdXG5cbiAgICAgIEwucm9vbXMuc3RhcnRfc3RyZWFtIHJvb21faWQsICggZXJyb3IgKSAtPlxuXG4gICAgICAgIGlmIGVycm9yIFxuXG4gICAgICAgICAgY29uc29sZS5lcnJvciBlcnJvclxuXG4gICAgICAgICAgcmV0dXJuXG5cbiAgICByZXR1cm4gZmFsc2UiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxNQUFBOztBQUFBLENBQUEsRUFBVSxJQUFBLHlCQUFBOztBQUNWLENBREEsRUFDVSxJQUFWLHVCQUFVOztBQUVWLENBSEEsRUFHaUIsR0FBWCxDQUFOLEVBQW1CO0NBRWIsRUFBRCxDQUFILENBQUEsSUFBQTtDQUVFLE9BQUE7Q0FBQSxFQUFBLENBQUEsR0FBTyxXQUFQO0FBRU8sQ0FBUCxFQUFPLENBQVAsR0FBYyxPQUFQO0NBRUwsSUFBQSxDQUFBLENBQU8sd0NBQVA7Q0FFQSxXQUFBO01BTkY7Q0FBQSxFQVNXLENBQVgsQ0FBVyxHQUFYO0NBVEEsQ0FZK0IsQ0FBQSxDQUEvQixHQUFPLENBQVAsSUFBQSxFQUErQjtDQVovQixFQWNHLENBQUgsYUFBQTtDQWRBLENBa0JBLENBQTRCLENBQTVCLEVBQTRCLENBQXJCLEVBQXVCLE1BQTlCO0NBRUUsTUFBQSxHQUFBO0FBQU8sQ0FBUCxHQUFHLEVBQUg7Q0FFRSxFQUFHLENBQUgsSUFBQSxVQUFBO0NBRUEsYUFBQTtRQUpGO0NBQUEsRUFNRyxDQUFILEVBQUEsa0JBQUE7Q0FOQSxFQVNVLEVBQUEsQ0FBVixDQUFBLENBQWtCO0NBRWpCLENBQTZCLENBQUEsRUFBdkIsRUFBUCxFQUFnQyxHQUFoQyxDQUFBO0NBRUUsR0FBRyxDQUFILEdBQUE7Q0FFVSxJQUFSLEVBQU8sR0FBUDtVQUowQjtDQUE5QixNQUE4QjtDQWJoQyxJQUE0QjtDQXFCNUIsSUFBQSxNQUFPO0NBekNULEVBQW9CO0NBRkwifX0seyJvZmZzZXQiOnsibGluZSI6MTA5OTEsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9jb21wb25lbnRzL2J1dHRvbnMvcmVjb3JkLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJhcHBjYXN0ID0gcmVxdWlyZSAnLi4vLi4vLi4vY29udHJvbGxlcnMvYXBwY2FzdCdcblxubW9kdWxlLmV4cG9ydHMgPSAoIGRvbSApIC0+XG5cbiAgZG9tLmZpbmQoICdhJyApLmNsaWNrIC0+XG5cbiAgICBjb25zb2xlLmxvZyBcImNsaWNrZWQgcmVjb3JkIVwiXG4gICAgXG4gICAgcmV0dXJuIGZhbHNlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsR0FBQTs7QUFBQSxDQUFBLEVBQVUsSUFBVix1QkFBVTs7QUFFVixDQUZBLEVBRWlCLEdBQVgsQ0FBTixFQUFtQjtDQUViLEVBQUQsQ0FBSCxDQUFBLElBQUE7Q0FFRSxFQUFBLENBQUEsR0FBTyxVQUFQO0NBRUEsSUFBQSxNQUFPO0NBSlQsRUFBc0I7Q0FGUCJ9fSx7Im9mZnNldCI6eyJsaW5lIjoxMTAwNCwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2NvbXBvbmVudHMvY2xpY2tfdHJpZ2dlci5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsibmF2aWdhdGlvbiA9IHJlcXVpcmUgJ2FwcC9jb250cm9sbGVycy9uYXZpZ2F0aW9uJ1xuSG92ZXJUcmlnZ2VyID0gcmVxdWlyZSAnYXBwL3ZpZXdzL2NvbXBvbmVudHMvaG92ZXJfdHJpZ2dlcidcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBDbGlja1RyaWdnZXIgZXh0ZW5kcyBIb3ZlclRyaWdnZXJcblxuICBzZXRfbGlzdGVuZXJzOiAoICkgLT5cbiAgICBAZG9tLm9uICdjbGljaycsIEB0b2dnbGVcbiAgICBhcHAud2luZG93Lm9uIFwiYm9keTpjbGlja2VkXCIsIEBjbG9zZVxuICAgIG5hdmlnYXRpb24ub24gJ2FmdGVyX3JlbmRlcicsIEBjbG9zZVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgc3VwZXIoKVxuICAgIEBkb20ub2ZmICdjbGljaycsIEB0b2dnbGVcbiAgICBhcHAud2luZG93Lm9mZiBcImJvZHk6Y2xpY2tlZFwiLCBAY2xvc2VcbiAgICBuYXZpZ2F0aW9uLm9mZiAnYWZ0ZXJfcmVuZGVyJywgQGNsb3NlXG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSx3Q0FBQTtHQUFBO2tTQUFBOztBQUFBLENBQUEsRUFBYSxJQUFBLEdBQWIsa0JBQWE7O0FBQ2IsQ0FEQSxFQUNlLElBQUEsS0FBZix3QkFBZTs7QUFFZixDQUhBLEVBR3VCLEdBQWpCLENBQU47Q0FFRTs7Ozs7Q0FBQTs7Q0FBQSxFQUFlLE1BQUEsSUFBZjtDQUNFLENBQUEsQ0FBSSxDQUFKLEVBQUEsQ0FBQTtDQUFBLENBQ0EsQ0FBRyxDQUFILENBQUEsQ0FBVSxRQUFWO0NBQ1csQ0FBWCxFQUErQixDQUEvQixLQUFVLENBQVYsR0FBQTtDQUhGLEVBQWU7O0NBQWYsRUFLUyxJQUFULEVBQVM7Q0FDUCxHQUFBLG9DQUFBO0NBQUEsQ0FDa0IsQ0FBZCxDQUFKLEVBQUEsQ0FBQTtDQURBLENBRStCLENBQTVCLENBQUgsQ0FBQSxDQUFVLFFBQVY7Q0FDVyxDQUFvQixDQUEvQixDQUFnQyxDQUFoQyxLQUFVLENBQVYsR0FBQTtDQVRGLEVBS1M7O0NBTFQ7O0NBRjBDIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjExMDM5LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvY29tcG9uZW50cy9lZGl0YWJsZXMvZWRpdGFibGVfc2VsZWN0LmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJFZGl0YWJsZVRleHQgPSByZXF1aXJlIFwiLi9lZGl0YWJsZV90ZXh0XCJcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBFZGl0YWJsZVNlbGVjdCBleHRlbmRzIEVkaXRhYmxlVGV4dFxuXG5cblx0Y29uc3RydWN0b3I6ICggQGRvbSApIC0+XG5cdFx0c3VwZXIgQGRvbVxuXG5cdG9uX3JlYWR5OiAoIGh0bWwgKSA9PlxuXHRcdEBkb20uYXBwZW5kIGh0bWxcblxuXHRcdHRleHQgPSBAZG9tLmZpbmQgJy50ZXh0J1xuXHRcdEBzZWxlY3QgPSBAZG9tLmZpbmQgJ3NlbGVjdCdcblxuXHRcdEBzZWxlY3Qub24gJ2NoYW5nZScsIChlKS0+XG5cdFx0XHR0ID0gdGhpcy5vcHRpb25zW2UudGFyZ2V0LnNlbGVjdGVkSW5kZXhdLnRleHRcblx0XHRcdGxvZyBcInRleHRcIiwgdFxuXHRcdFx0dGV4dC50ZXh0IHRcblxuXHRnZXRfdGVtcGxhdGU6ICggY2FsbGJhY2sgKSAtPlxuXHRcdCQuZ2V0ICcvYXBpL3YxL29jY3VwYXRpb25zL2FsbCcsIChkYXRhKSAtPlxuXHRcdFx0dG1wbCA9IHJlcXVpcmUgJ3RlbXBsYXRlcy9jb21wb25lbnRzL2VkaXRhYmxlcy9lZGl0YWJsZV9zZWxlY3QnXG5cblx0XHRcdGxvZyBcImdldF90ZW1wbGF0ZVwiLCBkYXRhXG5cblx0XHRcdGNhbGxiYWNrIHRtcGwoIHZhbHVlczogZGF0YSApXG5cblx0ZGVzdHJveTogLT5cblx0XHRAc2VsZWN0Lm9mZiAnY2hhbmdlJ1xuXHRcdEBzZWxlY3QgPSBudWxsXG5cblx0XHRzdXBlcigpXG5cblxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsd0JBQUE7R0FBQTs7a1NBQUE7O0FBQUEsQ0FBQSxFQUFlLElBQUEsS0FBZixLQUFlOztBQUVmLENBRkEsRUFFdUIsR0FBakIsQ0FBTjtDQUdDOztDQUFhLENBQUEsQ0FBQSxxQkFBRztDQUNmLEVBRGUsQ0FBRDtDQUNkLDBDQUFBO0NBQUEsRUFBQSxDQUFBLDRDQUFNO0NBRFAsRUFBYTs7Q0FBYixFQUdVLENBQUEsSUFBVixDQUFZO0NBQ1gsR0FBQSxJQUFBO0NBQUEsRUFBSSxDQUFKLEVBQUE7Q0FBQSxFQUVPLENBQVAsR0FBTztDQUZQLEVBR1UsQ0FBVixFQUFBLEVBQVU7Q0FFVCxDQUFELENBQXFCLENBQXBCLEVBQU0sRUFBUCxDQUFzQixFQUF0QjtDQUNDLFNBQUE7Q0FBQSxFQUFJLENBQUksRUFBUixDQUFpQixNQUFBO0NBQWpCLENBQ1ksQ0FBWixHQUFBO0NBQ0ssR0FBRCxTQUFKO0NBSEQsSUFBcUI7Q0FUdEIsRUFHVTs7Q0FIVixFQWNjLEtBQUEsQ0FBRSxHQUFoQjtDQUNFLENBQWdDLENBQWpDLENBQWlDLEtBQUMsRUFBbEMsY0FBQTtDQUNDLEdBQUEsTUFBQTtDQUFBLEVBQU8sQ0FBUCxFQUFBLENBQU8seUNBQUE7Q0FBUCxDQUVvQixDQUFwQixDQUFBLEVBQUEsUUFBQTtDQUVTLEdBQUEsSUFBVCxLQUFBO0NBQWUsQ0FBUSxFQUFSLEVBQUEsRUFBQTtDQUFmLE9BQVM7Q0FMVixJQUFpQztDQWZsQyxFQWNjOztDQWRkLEVBc0JTLElBQVQsRUFBUztDQUNSLEVBQUEsQ0FBQSxFQUFPLEVBQVA7Q0FBQSxFQUNVLENBQVYsRUFBQTtDQUZRLFVBSVIsK0JBQUE7Q0ExQkQsRUFzQlM7O0NBdEJUOztDQUg2QyJ9fSx7Im9mZnNldCI6eyJsaW5lIjoxMTA5MSwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2NvbXBvbmVudHMvZWRpdGFibGVzL2VkaXRhYmxlX3RhZ3MuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbInJlcXVpcmUgJ2hhcHBlbnMnXG5yZXF1aXJlICd2ZW5kb3JzL2pxdWVyeS5hdXRvY29tcGxldGUubWluLmpzJ1xucmVxdWlyZSAndmVuZG9ycy9qcXVlcnkudGFnc2lucHV0LmpzJ1xuXG5MID0gcmVxdWlyZSAnLi4vLi4vLi4vYXBpL2xvb3BjYXN0L2xvb3BjYXN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEVkaXRhYmxlVGFnc1xuICBjdXJyZW50X2RhdGE6IFtdXG5cbiAgY29uc3RydWN0b3I6ICggQGRvbSApIC0+XG5cbiAgICBoYXBwZW5zIEBcblxuICAgIEwuZ2VucmVzLmFsbCAoIGVycm9yLCBsaXN0ICkgPT5cblxuICAgICAgQGRvbS50YWdzSW5wdXQgXG4gICAgICAgIHdpZHRoOidhdXRvJ1xuICAgICAgICBoZWlnaHQ6ICdhdXRvJ1xuICAgICAgICBvbkFkZFRhZzogQG9uX2FkZF90YWdcbiAgICAgICAgb25SZW1vdmVUYWc6IEBvbl9yZW1vdmVfdGFnXG4gICAgICAgIGF1dG9jb21wbGV0ZV91cmw6IGxpc3RcbiAgICAgICAgYXV0b2NvbXBsZXRlOiBcbiAgICAgICAgICB3aWR0aDogMjAwXG5cbiAgICBcbiAgcG9wdWxhdGVfdGFnczogKCBsaXN0ICkgLT5cbiAgICBcbiAgICBcblxuICBvbl9hZGRfdGFnOiAoIHRhZyApID0+XG4gICAgbG9nIFwiW0VkaXRhYmxlVGFnc10gb25fYWRkX3RhZ1wiLCB0YWdcbiAgICBAZW1pdCAnY2hhbmdlJywgQGdldF90YWdzKClcblxuXG4gIG9uX3JlbW92ZV90YWc6ICggdGFnICkgPT5cbiAgICBsb2cgXCJbRWRpdGFibGVUYWdzXSBvbl9yZW1vdmVfdGFnXCIsIHRhZ1xuICAgIEBlbWl0ICdjaGFuZ2UnLCBAZ2V0X3RhZ3MoKVxuXG4gIGdldF90YWdzOiAoIGFzX3N0cmluZyA9IGZhbHNlICkgLT4gXG4gICAgaWYgYXNfc3RyaW5nXG4gICAgICBAZG9tLnZhbCgpXG4gICAgZWxzZVxuICAgICAgQGRvbS52YWwoKS5zcGxpdCgnLCcpXG5cbiAgYWRkX3RhZ3M6ICh0YWdzKS0+XG4gICAgZm9yIHQgaW4gdGFnc1xuICAgICAgQGRvbS5hZGRUYWcgdCArIFwiXCIsIHsgZm9jdXM6dHJ1ZSwgdW5pcXVlOnRydWUgfVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgbG9nIFwiW0VkaXRhYmxlVGFnc10gZGVzdHJveVwiXG4gICAgQGRvbS5kZXN0cm95X3RhZ3NpbnB1dCgpXG4gICAgQG9uICAgICAgICAgICAgPSBudWxsXG4gICAgQG9mZiAgICAgICAgICAgPSBudWxsXG4gICAgQG9uY2UgICAgICAgICAgPSBudWxsXG4gICAgQGVtaXQgICAgICAgICAgPSBudWxsXG4gICAgQG9uX2FkZF90YWcgICAgPSBudWxsXG4gICAgQG9uX3JlbW92ZV90YWcgPSBudWxsXG4gICAgQGRvbSAgICAgICAgICAgPSBudWxsXG4gICAgIyBzdXBlcigpIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsV0FBQTtHQUFBLCtFQUFBOztBQUFBLENBQUEsTUFBQSxFQUFBOztBQUNBLENBREEsTUFDQSw2QkFBQTs7QUFDQSxDQUZBLE1BRUEsc0JBQUE7O0FBRUEsQ0FKQSxFQUlJLElBQUEseUJBQUE7O0FBRUosQ0FOQSxFQU11QixHQUFqQixDQUFOO0NBQ0UsQ0FBQSxDQUFjLFNBQWQ7O0NBRWEsQ0FBQSxDQUFBLG1CQUFHO0NBRWQsT0FBQSxJQUFBO0NBQUEsRUFGYyxDQUFEO0NBRWIsb0RBQUE7Q0FBQSw4Q0FBQTtDQUFBLEdBQUEsR0FBQTtDQUFBLENBRXNCLENBQXRCLENBQUEsQ0FBYSxDQUFMLEdBQU87Q0FFWixFQUFHLEVBQUgsSUFBRCxJQUFBO0NBQ0UsQ0FBTSxHQUFOLENBQUEsRUFBQTtDQUFBLENBQ1EsSUFBUixFQUFBO0NBREEsQ0FFVSxHQUFDLEdBQVgsRUFGQTtDQUFBLENBR2EsR0FBQyxHQUFkLEdBQUEsRUFIQTtDQUFBLENBSWtCLEVBSmxCLElBSUEsUUFBQTtDQUpBLENBTUUsTUFERixJQUFBO0NBQ0UsQ0FBTyxDQUFQLEVBQUEsS0FBQTtVQU5GO0NBSFMsT0FFWDtDQUZGLElBQWE7Q0FOZixFQUVhOztDQUZiLEVBa0JlLENBQUEsS0FBRSxJQUFqQjs7Q0FsQkEsRUFzQlksTUFBRSxDQUFkO0NBQ0UsQ0FBaUMsQ0FBakMsQ0FBQSx1QkFBQTtDQUNDLENBQWUsRUFBZixJQUFELEdBQUE7Q0F4QkYsRUFzQlk7O0NBdEJaLEVBMkJlLE1BQUUsSUFBakI7Q0FDRSxDQUFvQyxDQUFwQyxDQUFBLDBCQUFBO0NBQ0MsQ0FBZSxFQUFmLElBQUQsR0FBQTtDQTdCRixFQTJCZTs7Q0EzQmYsRUErQlUsS0FBVixDQUFZOztHQUFZLEdBQVo7TUFDVjtDQUFBLEdBQUEsS0FBQTtDQUNHLEVBQUcsQ0FBSCxTQUFEO01BREY7Q0FHRyxFQUFHLENBQUgsQ0FBRCxRQUFBO01BSk07Q0EvQlYsRUErQlU7O0NBL0JWLEVBcUNVLENBQUEsSUFBVixDQUFXO0NBQ1QsT0FBQSxhQUFBO0FBQUEsQ0FBQTtVQUFBLGlDQUFBO29CQUFBO0NBQ0UsQ0FBQSxDQUFJLENBQUgsRUFBRDtDQUFvQixDQUFRLEVBQVIsQ0FBRSxHQUFBO0NBQUYsQ0FBcUIsRUFBckIsRUFBYyxFQUFBO0NBQWxDLE9BQUE7Q0FERjtxQkFEUTtDQXJDVixFQXFDVTs7Q0FyQ1YsRUF5Q1MsSUFBVCxFQUFTO0NBQ1AsRUFBQSxDQUFBLG9CQUFBO0NBQUEsRUFDSSxDQUFKLGFBQUE7Q0FEQSxDQUVBLENBQWlCLENBQWpCO0NBRkEsRUFHQSxDQUFBO0NBSEEsRUFJaUIsQ0FBakI7Q0FKQSxFQUtpQixDQUFqQjtDQUxBLEVBTWlCLENBQWpCLE1BQUE7Q0FOQSxFQU9pQixDQUFqQixTQUFBO0NBQ0MsRUFBRCxDQUFDLE9BQUQ7Q0FsREYsRUF5Q1M7O0NBekNUOztDQVBGIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjExMTc5LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvY29tcG9uZW50cy9lZGl0YWJsZXMvZWRpdGFibGVfdGV4dC5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBFZGl0YWJsZVRleHRcblxuXHRjb25zdHJ1Y3RvcjogKCBAZG9tICkgLT5cblx0XHRcblxuXHRcdEBkb20uYWRkQ2xhc3MgJ2VkaXRhYmxlX3RleHQnXG5cblx0XHRAZG9tLm9uICdjbGljaycsIChlKSAtPiBlLnN0b3BQcm9wYWdhdGlvbigpXG5cblx0XHRAZ2V0X3RlbXBsYXRlIEBvbl9yZWFkeVxuXG5cdG9uX3JlYWR5OiAoIGh0bWwgKSA9PlxuXG5cdFx0dGV4dCA9IEBkb20udGV4dCgpXG5cdFx0XG5cdFx0QGRvbS5hcHBlbmQgaHRtbFxuXG5cdFx0QGlucHV0ID0gQGRvbS5maW5kICdpbnB1dCdcblxuXHRcdEBpbnB1dC52YWwgdGV4dFxuXG5cdFx0QHRleHRfZWwgPSBAZG9tLmZpbmQgJy50ZXh0J1xuXG5cdFx0IyBjb3B5IHN0eWxlIHRvIGlucHV0XG5cblx0XHRzdHlsZSA9IFxuXHRcdFx0IyAnZm9udC1zaXplJyAgICAgIDogdGV4dF9lbC5jc3MgJ2ZvbnQtc2l6ZSdcblx0XHRcdCMgJ2ZvbnQtd2VpZ2h0JyAgICA6IHRleHRfZWwuY3NzICdmb250LXdlaWdodCdcblx0XHRcdCMgJ3BhZGRpbmcnICAgICAgICA6IHRleHRfZWwucGFyZW50KCkuY3NzICdwYWRkaW5nJ1xuXHRcdFx0IyAnbGV0dGVyLXNwYWNpbmcnIDogdGV4dF9lbC5jc3MgJ2xldHRlci1zcGFjaW5nJ1xuXHRcdFx0IyAnbGluZS1oZWlnaHQnICAgIDogdGV4dF9lbC5jc3MgJ2xpbmUtaGVpZ2h0J1xuXHRcdFx0J2NvbG9yJyAgICAgICAgICA6IEB0ZXh0X2VsLmNzcyAnY29sb3InXG5cblx0XHRAaW5wdXQuY3NzIHN0eWxlXG5cblx0XHRAdGV4dF9lbC5vbiAnY2xpY2snLCBAb3Blbl9lZGl0X21vZGVcblxuXHRnZXRfdGVtcGxhdGU6ICggY2FsbGJhY2sgKSAtPlxuXG5cdFx0dG1wbCA9IHJlcXVpcmUgJ3RlbXBsYXRlcy9jb21wb25lbnRzL2VkaXRhYmxlcy9lZGl0YWJsZV90ZXh0J1xuXHRcdFxuXHRcdGNhbGxiYWNrIHRtcGwoKVxuXG5cdGNsb3NlX3JlYWRfbW9kZSA6ID0+XG5cdFx0bG9nICdjbG9zZV9lZGl0X21vZGUnXG5cdFx0QHRleHRfZWwudGV4dCBAaW5wdXQudmFsKClcblx0XHRAZG9tLnJlbW92ZUNsYXNzICdlZGl0X21vZGUnXG5cblx0XHRAaW5wdXQub2ZmICdrZXl1cCdcblxuXHRvcGVuX2VkaXRfbW9kZSA6IChlKSA9PlxuXHRcdHJldHVybiB1bmxlc3MgYXBwLmJvZHkuaGFzQ2xhc3MoICd3cml0ZV9tb2RlJyApXG5cblx0XHRlPy5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdGxvZyAnb3Blbl9lZGl0X21vZGUnXG5cdFx0QGRvbS5hZGRDbGFzcyAnZWRpdF9tb2RlJ1xuXG5cdFx0QGlucHV0LmZvY3VzKCkuc2VsZWN0KClcblx0XHRAaW5wdXQub24gJ2tleXVwJywgKGUpID0+XG5cdFx0XHRpZiBlLmtleUNvZGUgaXMgMTNcblx0XHRcdFx0QGNsb3NlX3JlYWRfbW9kZSgpXG5cblx0XHRhcHAud2luZG93Lm9uY2UgJ2JvZHk6Y2xpY2tlZCcsIEBjbG9zZV9yZWFkX21vZGVcblxuXHRkZXN0cm95OiAtPlxuXHRcdCMgQHRleHRfZWwub2ZmICdjbGljaycsIEBvcGVuX2VkaXRfbW9kZVxuXG5cblxuXG5cdFxuXG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxRQUFBO0dBQUEsK0VBQUE7O0FBQUEsQ0FBQSxFQUF1QixHQUFqQixDQUFOO0NBRWMsQ0FBQSxDQUFBLG1CQUFHO0NBR2YsRUFIZSxDQUFEO0NBR2Qsc0RBQUE7Q0FBQSx3REFBQTtDQUFBLDBDQUFBO0NBQUEsRUFBSSxDQUFKLElBQUEsT0FBQTtDQUFBLENBRUEsQ0FBSSxDQUFKLEdBQUEsRUFBa0I7Q0FBTyxZQUFELEVBQUE7Q0FBeEIsSUFBaUI7Q0FGakIsR0FJQSxJQUFBLElBQUE7Q0FQRCxFQUFhOztDQUFiLEVBU1UsQ0FBQSxJQUFWLENBQVk7Q0FFWCxPQUFBLEdBQUE7Q0FBQSxFQUFPLENBQVA7Q0FBQSxFQUVJLENBQUosRUFBQTtDQUZBLEVBSVMsQ0FBVCxDQUFBLEVBQVM7Q0FKVCxFQU1BLENBQUEsQ0FBTTtDQU5OLEVBUVcsQ0FBWCxHQUFBO0NBUkEsRUFrQkMsQ0FORCxDQUFBO0NBTUMsQ0FBbUIsQ0FBQSxDQUFDLEVBQXBCLENBQUE7Q0FsQkQsS0FBQTtDQUFBLEVBb0JBLENBQUEsQ0FBTTtDQUVMLENBQUQsRUFBQyxHQUFPLElBQVIsR0FBQTtDQWpDRCxFQVNVOztDQVRWLEVBbUNjLEtBQUEsQ0FBRSxHQUFoQjtDQUVDLEdBQUEsSUFBQTtDQUFBLEVBQU8sQ0FBUCxHQUFPLHVDQUFBO0NBRUUsR0FBQSxJQUFULEdBQUE7Q0F2Q0QsRUFtQ2M7O0NBbkNkLEVBeUNrQixNQUFBLE1BQWxCO0NBQ0MsRUFBQSxDQUFBLGFBQUE7Q0FBQSxFQUNjLENBQWQsQ0FBb0IsRUFBWjtDQURSLEVBRUksQ0FBSixPQUFBO0NBRUMsRUFBRCxDQUFDLENBQUssRUFBTixJQUFBO0NBOUNELEVBeUNrQjs7Q0F6Q2xCLEVBZ0RpQixNQUFDLEtBQWxCO0NBQ0MsT0FBQSxJQUFBO0FBQWMsQ0FBZCxFQUFpQixDQUFqQixJQUFjLElBQUE7Q0FBZCxXQUFBO01BQUE7O0NBRUMsS0FBRCxTQUFBO01BRkE7Q0FBQSxFQUdBLENBQUEsWUFBQTtDQUhBLEVBSUksQ0FBSixJQUFBLEdBQUE7Q0FKQSxHQU1BLENBQU0sQ0FBTjtDQU5BLENBT0EsQ0FBbUIsQ0FBbkIsQ0FBTSxFQUFOLEVBQW9CO0NBQ25CLENBQUEsRUFBRyxDQUFhLENBQWhCLENBQUc7Q0FDRCxJQUFBLFVBQUQ7UUFGaUI7Q0FBbkIsSUFBbUI7Q0FJZixDQUE0QixDQUE3QixDQUFILEVBQVUsS0FBVixHQUFBLENBQUE7Q0E1REQsRUFnRGlCOztDQWhEakIsRUE4RFMsSUFBVCxFQUFTOztDQTlEVDs7Q0FGRCJ9fSx7Im9mZnNldCI6eyJsaW5lIjoxMTI0OSwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2NvbXBvbmVudHMvZml4ZWRfYmFyLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9ICggZG9tICkgLT5cbiAgaCA9IGRvbS5oZWlnaHQoKVxuICBmaXhlZCA9IGZhbHNlXG5cbiAgYXBwLndpbmRvdy5vbiAnc2Nyb2xsJywgKCB5ICkgLT5cblxuICAgIGlmIHkgPj0gaCBhbmQgbm90IGZpeGVkXG4gICAgICBmaXhlZCA9IHRydWVcbiAgICAgIGRvbS5hZGRDbGFzcyAnZml4ZWQnXG5cbiAgICBlbHNlIGlmIHkgPCBoIGFuZCBmaXhlZFxuICAgICAgZml4ZWQgPSBmYWxzZVxuICAgICAgZG9tLnJlbW92ZUNsYXNzICdmaXhlZCciXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsQ0FBTyxFQUFVLEdBQVgsQ0FBTixFQUFtQjtDQUNqQixLQUFBLEVBQUE7Q0FBQSxDQUFBLENBQUksR0FBQTtDQUFKLENBQ0EsQ0FBUSxFQUFSO0NBRUksQ0FBSixDQUFHLEdBQU8sRUFBVixDQUFBO0FBRW9CLENBQWxCLEdBQUEsQ0FBQTtDQUNFLEVBQVEsQ0FBUixDQUFBLENBQUE7Q0FDSSxFQUFELElBQUgsQ0FBQSxLQUFBO0NBRU0sRUFBSSxDQUFKLENBSlIsQ0FBQTtDQUtFLEVBQVEsRUFBUixDQUFBO0NBQ0ksRUFBRCxJQUFILElBQUEsRUFBQTtNQVJvQjtDQUF4QixFQUF3QjtDQUpUIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjExMjY2LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvY29tcG9uZW50cy9mdWxsc2NyZWVuLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEZ1bGxzY3JlZW5cblx0ZmFjdG9yOiAxXG5cdG1pbl9oZWlnaHQ6IDUwMFxuXG5cdGNvbnN0cnVjdG9yOiAoIEBkb20gKSAtPlxuXHRcdEBkb20uYWRkQ2xhc3MgJ2Z1bGxzY3JlZW4nXG5cdFx0aWYgQGRvbS5kYXRhICdmYWN0b3InXG5cdFx0XHRAZmFjdG9yID0gQGRvbS5kYXRhICdmYWN0b3InXG5cblx0XHRhcHAud2luZG93Lm9uICdyZXNpemUnLCBAb25fcmVzaXplXG5cdFx0ZG8gQG9uX3Jlc2l6ZVxuXG5cdG9uX3Jlc2l6ZTogKCApID0+XG5cdFx0aCA9IChhcHAud2luZG93LmggLSBhcHAuc2V0dGluZ3MuaGVhZGVyX2hlaWdodCkqQGZhY3RvclxuXG5cdFx0aCA9IE1hdGgubWF4IEBtaW5faGVpZ2h0LCBoXG5cdFx0QGRvbS5jc3NcbiBcdFx0XHQnd2lkdGgnIDogJzEwMCUnXG4gXHRcdFx0J2hlaWdodCcgOiBoXG5cblxuICBkZXN0cm95OiAtPlxuICAgIGFwcC53aW5kb3cub2ZmICdyZXNpemUnLCBAb25fcmVzaXplICAgIFxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsTUFBQTtHQUFBLCtFQUFBOztBQUFBLENBQUEsRUFBdUIsR0FBakIsQ0FBTjtDQUNDLEVBQVEsR0FBUjs7Q0FBQSxFQUNZLE9BQVo7O0NBRWEsQ0FBQSxDQUFBLGlCQUFHO0NBQ2YsRUFEZSxDQUFEO0NBQ2QsNENBQUE7Q0FBQSxFQUFJLENBQUosSUFBQSxJQUFBO0NBQ0EsRUFBTyxDQUFQLElBQUc7Q0FDRixFQUFVLENBQVQsRUFBRCxFQUFVO01BRlg7Q0FBQSxDQUlBLENBQUcsQ0FBSCxFQUFVLEVBQVYsQ0FBQTtDQUpBLEdBS0csS0FBSDtDQVRELEVBR2E7O0NBSGIsRUFXVyxNQUFYO0NBQ0MsT0FBQTtDQUFBLEVBQUksQ0FBSixFQUFlLEVBQWlCLEtBQTVCO0NBQUosQ0FFMEIsQ0FBdEIsQ0FBSixNQUFJO0NBRkosRUFHSSxDQUFKO0NBQ0UsQ0FBVSxJQUFWLENBQUE7Q0FBQSxDQUNXLElBQVgsRUFBQTtDQUxGLEtBR0E7V0FLQTtDQUFBLENBQVMsQ0FBQSxHQUFULENBQUEsRUFBUztDQUNILENBQXFCLENBQXRCLENBQXVCLEVBQWhCLEVBQVYsQ0FBQSxNQUFBO0NBREYsTUFBUztDQVRDO0NBWFgsRUFXVzs7Q0FYWDs7Q0FERCJ9fSx7Im9mZnNldCI6eyJsaW5lIjoxMTMwNiwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2NvbXBvbmVudHMvaG92ZXIuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbImhhcHBlbnMgPSByZXF1aXJlICdoYXBwZW5zJ1xubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBIb3ZlclxuXHRjb25zdHJ1Y3RvcjogKCBAZG9tICkgLT5cblx0XHRyZXR1cm4gaWYgYXBwLnNldHRpbmdzLnRvdWNoX2RldmljZVxuXG5cdFx0aGFwcGVucyBAXG5cdFx0XG5cdFx0QGRvbS5vbiAnbW91c2VvdmVyJywgQG9uX21vdXNlX292ZXJcblx0XHRAZG9tLm9uICdtb3VzZWxlYXZlJywgQG9uX21vdXNlX2xlYXZlXG5cblx0XHRAZG9tLmFkZENsYXNzICdob3Zlcl9vYmplY3QnXG5cblx0b25fbW91c2Vfb3ZlcjogKCApID0+XG5cdFx0QGRvbS5hZGRDbGFzcyAnaG92ZXJlZCdcblxuXHRvbl9tb3VzZV9sZWF2ZTogKCApID0+XG5cdFx0QGRvbS5yZW1vdmVDbGFzcyAnaG92ZXJlZCdcblxuXHRkZXN0cm95OiAtPlxuXHRcdEBkb20ub2ZmICdtb3VzZW92ZXInLCBAb25fbW91c2Vfb3ZlclxuXHRcdEBkb20ub2ZmICdtb3VzZWxlYXZlJywgQG9uX21vdXNlX2xlYXZlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsVUFBQTtHQUFBLCtFQUFBOztBQUFBLENBQUEsRUFBVSxJQUFWLEVBQVU7O0FBQ1YsQ0FEQSxFQUN1QixHQUFqQixDQUFOO0NBQ2MsQ0FBQSxDQUFBLFlBQUc7Q0FDZixFQURlLENBQUQ7Q0FDZCxzREFBQTtDQUFBLG9EQUFBO0NBQUEsRUFBYSxDQUFiLElBQXNCLElBQXRCO0NBQUEsV0FBQTtNQUFBO0NBQUEsR0FFQSxHQUFBO0NBRkEsQ0FJQSxDQUFJLENBQUosT0FBQSxFQUFBO0NBSkEsQ0FLQSxDQUFJLENBQUosUUFBQSxFQUFBO0NBTEEsRUFPSSxDQUFKLElBQUEsTUFBQTtDQVJELEVBQWE7O0NBQWIsRUFVZSxNQUFBLElBQWY7Q0FDRSxFQUFHLENBQUgsSUFBRCxDQUFBLEVBQUE7Q0FYRCxFQVVlOztDQVZmLEVBYWdCLE1BQUEsS0FBaEI7Q0FDRSxFQUFHLENBQUgsS0FBRCxFQUFBO0NBZEQsRUFhZ0I7O0NBYmhCLEVBZ0JTLElBQVQsRUFBUztDQUNSLENBQXNCLENBQWxCLENBQUosT0FBQSxFQUFBO0NBQ0MsQ0FBc0IsQ0FBbkIsQ0FBSCxPQUFELENBQUEsRUFBQTtDQWxCRCxFQWdCUzs7Q0FoQlQ7O0NBRkQifX0seyJvZmZzZXQiOnsibGluZSI6MTEzNDQsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9jb21wb25lbnRzL2hvdmVyX3RyaWdnZXIuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIiMjI1xuQWRkcyB0aGUgY2xhc3MgJ2hvdmVyZWQnIHRvIHRoZSBlbGVtZW50IGFuZCB0byB0aGUgdGFyZ2V0XG5UaGUgY2xhc3MgaXMgdG9nZ2xlZCBvbiBtb3VzZW92ZXIvbW91c2VsZWF2ZSBmb3IgZGVza3RvcHNcbmFuZCBvbiBjbGljayBmb3IgdG91Y2ggZGV2aWNlc1xuIyMjXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgSG92ZXJUcmlnZ2VyXG5cdG9wZW5lZDogZmFsc2Vcblx0a2xhc3M6IFwiaG92ZXJlZFwiXG5cblx0Y29uc3RydWN0b3I6ICggQGRvbSApIC0+XG5cblx0XHRsb2cgXCJIT1ZFUiBUUklHR0VSISEhISFcIlxuXHRcdEB0YXJnZXQgPSAkIEBkb20uZGF0YSAndGFyZ2V0J1xuXG5cdFx0aWYgQHRhcmdldC5sZW5ndGggPD0gMFxuXHRcdFx0bG9nIFwiW0hvdmVyVHJpZ2dlcl0gZXJyb3IuIHRhcmdldCBub3QgZm91bmRcIiwgQGRvbS5kYXRhKCAndGFyZ2V0JyApXG5cdFx0XHRyZXR1cm5cblxuXHRcdEBkb20uYWRkQ2xhc3MgXCJob3Zlcl9kcm9wZG93bl90cmlnZ2VyXCJcblx0XHRhcHAub24gXCJkcm9wZG93bjpvcGVuZWRcIiwgQG9uX2Ryb3Bkb3duX29wZW5lZFxuXHRcdGFwcC5vbiBcImRyb3Bkb3duOmNsb3NlZFwiLCBAb25fZHJvcGRvd25fY2xvc2VkXG5cdFx0YXBwLndpbmRvdy5vbiBcInNjcm9sbFwiLCBAY2xvc2VcblxuXHRcdEBzZXRfbGlzdGVuZXJzKClcblxuXG5cblx0c2V0X2xpc3RlbmVyczogKCApIC0+XG5cblx0XHRpZiBhcHAuc2V0dGluZ3MudG91Y2hfZGV2aWNlXG5cdFx0XHRAZG9tLm9uICdjbGljaycsIEB0b2dnbGVcblx0XHRlbHNlXG5cdFx0XHRAZG9tLm9uICdtb3VzZW92ZXInLCBAb3BlblxuXHRcdFx0QHRhcmdldC5vbiAnbW91c2VsZWF2ZScsIEBjbG9zZVxuXG5cdFx0XG5cdFx0XG5cblx0XHRcblx0dG9nZ2xlOiAoIGUgKSA9PlxuXHRcdGlmIEBvcGVuZWRcblx0XHRcdGRvIEBjbG9zZVxuXHRcdGVsc2Vcblx0XHRcdGRvIEBvcGVuXG5cblx0XHRlLnN0b3BQcm9wYWdhdGlvbigpXG5cblxuXG5cdG9wZW46ICggKSA9PlxuXHRcdHJldHVybiBpZiBAb3BlbmVkXG5cdFx0QG9wZW5lZCA9IHRydWVcblxuXHRcdGxvZyBcIltUcmlnZ2VyXSBvcGVuXCJcblxuXHRcdEBkb20uYWRkQ2xhc3MgQGtsYXNzXG5cdFx0QHRhcmdldC5hZGRDbGFzcyBAa2xhc3NcblxuXHRcdGFwcC5lbWl0IFwiZHJvcGRvd246b3BlbmVkXCIsIEB1aWRcblxuXHRjbG9zZTogKCApID0+XG5cdFx0cmV0dXJuIGlmIG5vdCBAb3BlbmVkXG5cdFx0QG9wZW5lZCA9IGZhbHNlXG5cblx0XHRsb2cgXCJbVHJpZ2dlcl0gY2xvc2VcIlxuXG5cdFx0QGRvbS5yZW1vdmVDbGFzcyBAa2xhc3Ncblx0XHRAdGFyZ2V0LnJlbW92ZUNsYXNzIEBrbGFzc1xuXG5cdFx0YXBwLmVtaXQgXCJkcm9wZG93bjpjbG9zZWRcIiwgQHVpZFxuXG5cdG9uX2Ryb3Bkb3duX29wZW5lZDogKCBkYXRhICkgPT5cblx0XHRAY2xvc2UoKSBpZiBkYXRhIGlzbnQgQHVpZFxuXG5cdG9uX2Ryb3Bkb3duX2Nsb3NlZDogKCBkYXRhICkgPT5cblxuXG5cdGRlc3Ryb3k6IC0+XG5cdFx0aWYgYXBwLnNldHRpbmdzLnRvdWNoX2RldmljZVxuXHRcdFx0QGRvbS5vZmYgJ2NsaWNrJywgQHRvZ2dsZVxuXHRcdGVsc2Vcblx0XHRcdEBkb20ub2ZmICdtb3VzZW92ZXInLCBAb3BlblxuXHRcdFx0QHRhcmdldC5vZmYgJ21vdXNlbGVhdmUnLCBAY2xvc2VcblxuXHRcdGFwcC53aW5kb3cub2ZmIFwic2Nyb2xsXCIsIEBjbG9zZVxuXG5cdFx0YXBwLm9mZiBcImRyb3Bkb3duOm9wZW5lZFwiLCBAb25fZHJvcGRvd25fb3BlbmVkXG5cdFx0YXBwLm9mZiBcImRyb3Bkb3duOmNsb3NlZFwiLCBAb25fZHJvcGRvd25fY2xvc2VkXG5cblxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztDQUFBO0NBQUEsR0FBQSxRQUFBO0dBQUEsK0VBQUE7O0FBTUEsQ0FOQSxFQU11QixHQUFqQixDQUFOO0NBQ0MsRUFBUSxFQUFSLENBQUE7O0NBQUEsRUFDTyxFQUFQLElBREE7O0NBR2EsQ0FBQSxDQUFBLG1CQUFHO0NBRWYsRUFGZSxDQUFEO0NBRWQsOERBQUE7Q0FBQSw4REFBQTtDQUFBLG9DQUFBO0NBQUEsa0NBQUE7Q0FBQSxzQ0FBQTtDQUFBLEVBQUEsQ0FBQSxnQkFBQTtDQUFBLEVBQ1UsQ0FBVixFQUFBLEVBQVk7Q0FFWixHQUFBLEVBQVU7Q0FDVCxDQUE4QyxDQUE5QyxDQUErQyxFQUEvQyxFQUE4QyxnQ0FBOUM7Q0FDQSxXQUFBO01BTEQ7Q0FBQSxFQU9JLENBQUosSUFBQSxnQkFBQTtDQVBBLENBUUEsQ0FBRyxDQUFILGFBQUEsQ0FBQTtDQVJBLENBU0EsQ0FBRyxDQUFILGFBQUEsQ0FBQTtDQVRBLENBVUEsQ0FBRyxDQUFILENBQUEsQ0FBVSxFQUFWO0NBVkEsR0FZQSxTQUFBO0NBakJELEVBR2E7O0NBSGIsRUFxQmUsTUFBQSxJQUFmO0NBRUMsRUFBTSxDQUFOLElBQWUsSUFBZjtDQUNFLENBQUQsQ0FBSSxDQUFILEVBQUQsQ0FBQSxNQUFBO01BREQ7Q0FHQyxDQUFBLENBQUksQ0FBSCxFQUFELEtBQUE7Q0FDQyxDQUFELEVBQUMsQ0FBRCxDQUFPLE1BQVAsQ0FBQTtNQU5hO0NBckJmLEVBcUJlOztDQXJCZixFQWlDUSxHQUFSLEdBQVU7Q0FDVCxHQUFBLEVBQUE7Q0FDQyxHQUFJLENBQUosQ0FBRztNQURKO0NBR0MsR0FBSSxFQUFEO01BSEo7Q0FLQyxVQUFELElBQUE7Q0F2Q0QsRUFpQ1E7O0NBakNSLEVBMkNNLENBQU4sS0FBTTtDQUNMLEdBQUEsRUFBQTtDQUFBLFdBQUE7TUFBQTtDQUFBLEVBQ1UsQ0FBVixFQUFBO0NBREEsRUFHQSxDQUFBLFlBQUE7Q0FIQSxFQUtJLENBQUosQ0FBQSxHQUFBO0NBTEEsR0FNQSxDQUFBLENBQU8sRUFBUDtDQUVJLENBQXdCLENBQXpCLENBQUgsT0FBQSxNQUFBO0NBcERELEVBMkNNOztDQTNDTixFQXNETyxFQUFQLElBQU87QUFDUSxDQUFkLEdBQUEsRUFBQTtDQUFBLFdBQUE7TUFBQTtDQUFBLEVBQ1UsQ0FBVixDQURBLENBQ0E7Q0FEQSxFQUdBLENBQUEsYUFBQTtDQUhBLEVBS0ksQ0FBSixDQUFBLE1BQUE7Q0FMQSxHQU1BLENBQUEsQ0FBTyxLQUFQO0NBRUksQ0FBd0IsQ0FBekIsQ0FBSCxPQUFBLE1BQUE7Q0EvREQsRUFzRE87O0NBdERQLEVBaUVvQixDQUFBLEtBQUUsU0FBdEI7Q0FDQyxFQUFBLENBQUEsQ0FBc0I7Q0FBckIsR0FBQSxDQUFELFFBQUE7TUFEbUI7Q0FqRXBCLEVBaUVvQjs7Q0FqRXBCLEVBb0VvQixDQUFBLEtBQUUsU0FBdEI7O0NBcEVBLEVBdUVTLElBQVQsRUFBUztDQUNSLEVBQU0sQ0FBTixJQUFlLElBQWY7Q0FDQyxDQUFrQixDQUFkLENBQUgsRUFBRCxDQUFBO01BREQ7Q0FHQyxDQUFzQixDQUFsQixDQUFILEVBQUQsS0FBQTtDQUFBLENBQzBCLENBQTFCLENBQUMsQ0FBRCxDQUFBLE1BQUE7TUFKRDtDQUFBLENBTXlCLENBQXRCLENBQUgsQ0FBQSxDQUFVLEVBQVY7Q0FOQSxDQVEyQixDQUF4QixDQUFILGFBQUEsQ0FBQTtDQUNJLENBQXVCLENBQXhCLENBQXlCLE9BQTVCLE1BQUEsQ0FBQTtDQWpGRCxFQXVFUzs7Q0F2RVQ7O0NBUEQifX0seyJvZmZzZXQiOnsibGluZSI6MTE0NDQsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9jb21wb25lbnRzL2ltYWdlX3VwbG9hZGVyLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJyZXF1aXJlICdoYXBwZW5zJ1xuQ2xvdWRpbmFyeSA9IHJlcXVpcmUgJ2FwcC9jb250cm9sbGVycy9jbG91ZGluYXJ5J1xuXG4jIyNcblVuc2lnbmVkIHVwbG9hZCB0byBDbG91ZGluYXJ5XG5odHRwOi8vY2xvdWRpbmFyeS5jb20vYmxvZy9kaXJlY3RfdXBsb2FkX21hZGVfZWFzeV9mcm9tX2Jyb3dzZXJfb3JfbW9iaWxlX2FwcF90b190aGVfY2xvdWRcbiMjI1xuXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgSW1hZ2VVcGxvYWRlciBcblx0Y29uc3RydWN0b3I6IChkb20pIC0+XG5cdFx0aGFwcGVucyBAXG5cdFx0XG5cdFx0IyBHZXQgdGhlIGNvbmZpZyB2YWx1ZXMgZnJvbSB0aGUgaGlkZGVuIGZpbGVzXG5cdFx0YXBpX2tleSAgICAgPSBkb20uZmluZCggJy5hcGlfa2V5JyApLnZhbCgpXG5cdFx0Y2xvdWRfbmFtZSAgPSBkb20uZmluZCggJy5jbG91ZF9uYW1lJyApLnZhbCgpXG5cdFx0dW5zaWduZWRfaWQgPSBkb20uZmluZCggJy51bnNpZ25lZF9pZCcgKS52YWwoKVxuXG5cdFx0IyBTZXQgdGhlIGNvbmZpZyBvbiB0aGUgY29udHJvbGxlclxuXHRcdENsb3VkaW5hcnkuc2V0X2NvbmZpZ1xuXHRcdFx0Y2xvdWRfbmFtZSAgOiBjbG91ZF9uYW1lXG5cdFx0XHRhcGlfa2V5ICAgICA6IGFwaV9rZXlcblx0XG5cblx0XHRwcm9ncmVzcyA9IGRvbS5maW5kICcucHJvZ3Jlc3MnXG5cblx0XHRyZWYgPSBAXG5cblxuXHRcdCMjI1xuXHRcdERpc2FibGUgZHJhZyBhbmQgZHJvcCBmZWF0dXJlIGJlY2F1c2Ugb2YgYSBjbG91ZGluYXJ5IGJ1Zzpcblx0XHR3aGVuIHR3byBpbnB1dCBmaWxlcyBhcmUgb24gdGhlIHNhbWUgcGFnZSwgd2hlbiB5b3UgZHJhZyBhbiBpbWFnZSBvbiBvbmUgaW5wdXQgZmlsZSwgXG5cdFx0Ym90aCBpbnB1dHMgd2lsbCB1cGxvYWQgdGhlIHNhbWUgaW1hZ2UgYXQgdGhlIHNhbWUgdGltZS5cblx0XHQjIyNcblx0XHRraWxsID0gKGUpIC0+IFxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRlLnN0b3BQcm9wYWdhdGlvbigpXG5cblxuXHRcdGRvbS5vblxuXHRcdFx0ZHJhZ292ZXI6IGtpbGxcblx0XHRcdGRyb3A6IGtpbGxcblx0XHRcdGRyYWdlbnRlcjoga2lsbFxuXHRcdFx0ZHJhZ2xlYXZlOiBraWxsXG5cblx0XHRcdFxuXG5cblx0XHRvbl91cGxvYWRfc3RhcnQgPSAoZSwgZGF0YSkgLT5cblx0XHRcdFx0XHRcblx0XHRcdGxvZyBcIltDbG91ZGluYXJ5XSBvbl91cGxvYWRfc3RhcnRcIiwgZSwgZGF0YVxuXG5cdFx0XHRwcm9ncmVzcy5yZW1vdmVDbGFzcyAnaGlkZSdcblxuXHRcdFx0cmVmLmVtaXQgJ3N0YXJ0ZWQnLCBkYXRhXG5cblx0XHRcblx0XHRvbl91cGxvYWRfcHJvZ3Jlc3MgPSAoZSwgZGF0YSkgLT5cblx0XHRcdHBlcmNlbnQgPSBkYXRhLmxvYWRlZCAvIGRhdGEudG90YWwgKiAxMDBcblx0XHRcdGxvZyBcIltDbG91ZGluYXJ5XSBvbl91cGxvYWRfcHJvZ3Jlc3NcIiwgcGVyY2VudCArIFwiJVwiXG5cblx0XHRcdHByb2dyZXNzLmNzcyBcIndpZHRoXCIsIFwiI3twZXJjZW50fSVcIlxuXG5cdFx0XHRyZWYuZW1pdCAncHJvZ3Jlc3MnLCBwcm9ncmVzc1xuXG5cblx0XHRvbl91cGxvYWRfY29tcGxldGUgPSAoZSwgZGF0YSkgLT4gXG5cdFx0XHRsb2cgXCJbSW1hZ2VVcGxvYWRlcl0gb25fdXBsb2FkX2NvbXBsZXRlXCIsIGUsIGRhdGFcblx0XHRcdFxuXHRcdFx0cHJvZ3Jlc3MuYWRkQ2xhc3MgJ2hpZGUnXG5cblx0XHRcdHJlZi5lbWl0ICdjb21wbGV0ZWQnLCBkYXRhXG5cblxuXHRcdG9uX3VwbG9hZF9mYWlsID0gKGUsIGRhdGEpIC0+XG5cdFx0XHRsb2cgXCJbQ2xvdWRpbmFyeV0gb25fdXBsb2FkX2ZhaWxcIiwgZVxuXG5cdFx0XHRyZWYuZW1pdCAnZXJyb3InLCBlXG5cblxuXG5cdFx0aXNfb3duX2V2ZW50ID0gKGUpIC0+XG5cdFx0XHRyZXR1cm4gZS5jdXJyZW50VGFyZ2V0XG5cblxuXHRcdCMgSW5pdGlhbGlzZSB0aGUgZm9ybSB3aXRoIGNsb3VkaW5hcnlcblx0XHRmb3JtID0gZG9tLmZpbmQoICdmb3JtJyApXG5cdFx0Zm9ybS5hcHBlbmQoICQuY2xvdWRpbmFyeS51bnNpZ25lZF91cGxvYWRfdGFnKCB1bnNpZ25lZF9pZCwge1xuXHRcdFx0Y2xvdWRfbmFtZTogY2xvdWRfbmFtZVxuXHRcdH0sIHtcblx0XHRcdGNsb3VkaW5hcnlfZmllbGQ6IHVuc2lnbmVkX2lkXG5cdFx0fSkub24oICdjbG91ZGluYXJ5ZG9uZScsIG9uX3VwbG9hZF9jb21wbGV0ZSApXG5cdFx0IC5vbiggJ2ZpbGV1cGxvYWRzdGFydCcsIG9uX3VwbG9hZF9zdGFydCApXG5cdFx0IC5vbiggJ2ZpbGV1cGxvYWRwcm9ncmVzcycsIG9uX3VwbG9hZF9wcm9ncmVzcyApXG5cdFx0IC5vbiggJ2ZpbGV1cGxvYWRmYWlsJywgb25fdXBsb2FkX2ZhaWwgKVxuXHRcdClcblx0XHRcdCMgTGlzdGVuIHRvIGV2ZW50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLHFCQUFBOztBQUFBLENBQUEsTUFBQSxFQUFBOztBQUNBLENBREEsRUFDYSxJQUFBLEdBQWIsa0JBQWE7O0NBRWI7Ozs7Q0FIQTs7QUFTQSxDQVRBLEVBU3VCLEdBQWpCLENBQU47Q0FDYyxDQUFBLENBQUEsb0JBQUM7Q0FDYixPQUFBLDBJQUFBO0NBQUEsR0FBQSxHQUFBO0NBQUEsRUFHYyxDQUFkLEdBQUEsR0FBYztDQUhkLEVBSWMsQ0FBZCxNQUFBLEdBQWM7Q0FKZCxFQUtjLENBQWQsT0FBQSxHQUFjO0NBTGQsR0FRQSxNQUFVO0NBQ1QsQ0FBYyxJQUFkLElBQUE7Q0FBQSxDQUNjLElBQWQsQ0FBQTtDQVZELEtBUUE7Q0FSQSxFQWFXLENBQVgsSUFBQSxHQUFXO0NBYlgsRUFlQSxDQUFBO0NBR0E7Ozs7O0NBbEJBO0NBQUEsRUF1Qk8sQ0FBUCxLQUFRO0NBQ1AsS0FBQSxRQUFBO0NBQ0MsWUFBRCxFQUFBO0NBekJELElBdUJPO0NBdkJQLENBNEJBLENBQUcsQ0FBSDtDQUNDLENBQVUsRUFBVixFQUFBLEVBQUE7Q0FBQSxDQUNNLEVBQU4sRUFBQTtDQURBLENBRVcsRUFGWCxFQUVBLEdBQUE7Q0FGQSxDQUdXLEVBSFgsRUFHQSxHQUFBO0NBaENELEtBNEJBO0NBNUJBLENBcUNzQixDQUFKLENBQWxCLEtBQW1CLE1BQW5CO0NBRUMsQ0FBb0MsQ0FBcEMsQ0FBQSxFQUFBLHdCQUFBO0NBQUEsS0FFQSxFQUFRLEdBQVI7Q0FFSSxDQUFnQixDQUFqQixDQUFILEtBQUEsSUFBQTtDQTNDRCxJQXFDa0I7Q0FyQ2xCLENBOEN5QixDQUFKLENBQXJCLEtBQXNCLFNBQXRCO0NBQ0MsTUFBQSxHQUFBO0NBQUEsRUFBVSxDQUFJLENBQUosQ0FBVixDQUFBO0NBQUEsQ0FDdUMsQ0FBdkMsR0FBQSxDQUF1QywwQkFBdkM7Q0FEQSxDQUdzQixDQUF0QixHQUFBLENBQUEsQ0FBUTtDQUVKLENBQWlCLENBQWxCLENBQUgsSUFBQSxFQUFBLEdBQUE7Q0FwREQsSUE4Q3FCO0NBOUNyQixDQXVEeUIsQ0FBSixDQUFyQixLQUFzQixTQUF0QjtDQUNDLENBQTBDLENBQTFDLENBQUEsRUFBQSw4QkFBQTtDQUFBLEtBRUEsRUFBUTtDQUVKLENBQWtCLENBQW5CLENBQUgsT0FBQSxFQUFBO0NBNURELElBdURxQjtDQXZEckIsQ0ErRHFCLENBQUosQ0FBakIsS0FBa0IsS0FBbEI7Q0FDQyxDQUFtQyxDQUFuQyxHQUFBLHVCQUFBO0NBRUksQ0FBYyxDQUFmLENBQUgsR0FBQSxNQUFBO0NBbEVELElBK0RpQjtDQS9EakIsRUFzRWUsQ0FBZixLQUFnQixHQUFoQjtDQUNDLFlBQU87Q0F2RVIsSUFzRWU7Q0F0RWYsRUEyRU8sQ0FBUCxFQUFPO0NBM0VQLENBNEU0RCxFQUE1RCxFQUFBLElBQXlCLENBQVosUUFBQTtDQUErQyxDQUMvQyxJQUFaLElBQUE7RUFDRSxJQUZVO0NBRVYsQ0FDZ0IsSUFBbEIsS0FERSxLQUNGO0NBQ0MsQ0FKVyxJQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxFQUFBO0NBN0VkLEVBQWE7O0NBQWI7O0NBVkQifX0seyJvZmZzZXQiOnsibGluZSI6MTE1MjMsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9jb21wb25lbnRzL2lucHV0X2RldmljZXMuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbImFwcGNhc3QgID0gcmVxdWlyZSAnYXBwL2NvbnRyb2xsZXJzL2FwcGNhc3QnXG5oYXBwZW5zID0gcmVxdWlyZSAnaGFwcGVucydcblxuU2VsZWN0ID0gcmVxdWlyZSAnLi9zZWxlY3QnXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgSW5wdXREZXZpY2VzIGV4dGVuZHMgU2VsZWN0XG5cbiAgY29uc3RydWN0b3I6ICggZG9tICkgLT5cblxuICAgIHN1cGVyIGRvbVxuXG4gICAgYXBwY2FzdC5vbiAnaW5wdXRfZGV2aWNlcycsICggZGV2aWNlcyApIC0+XG5cbiAgICAgICMgY2xlYXIgb3B0aW9uc1xuICAgICAgIyBUT0RPOiBrZWVwIHRoZSBjaG9vc2VuIG9wdGlvbiBzZWxlY3RlZFxuICAgICAgIyBUT0RPOiBsZXQgdGhlIHVzZXIga25vdyBpZiBwcmV2aW91bHkgc2VsZWN0ZWQgaXNuJ3QgYXZhaWxhYmxlIGFueW1vcmVcbiAgICAgIGRvbS5maW5kKCBcInNlbGVjdFwiICkuaHRtbCBcIiBcIlxuICAgICAgXG4gICAgICBmb3IgZGV2aWNlIGluIGRldmljZXNcbiAgICAgICAgZG9tLmZpbmQoIFwic2VsZWN0XCIgKS5hcHBlbmQgXCI8b3B0aW9uIHZhbHVlPScje2RldmljZX0nPiN7ZGV2aWNlfTwvb3B0aW9uPlwiXG5cbiAgICBAb24gJ2NoYW5nZWQnLCAoIGRldmljZSApIC0+XG5cbiAgICAgIGFwcGNhc3Quc2V0ICdpbnB1dF9kZXZpY2UnLCBkb20uZmluZCggXCJzZWxlY3RcIiApLnZhbCgpIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsa0NBQUE7R0FBQTtrU0FBQTs7QUFBQSxDQUFBLEVBQVcsSUFBWCxrQkFBVzs7QUFDWCxDQURBLEVBQ1UsSUFBVixFQUFVOztBQUVWLENBSEEsRUFHUyxHQUFULENBQVMsR0FBQTs7QUFFVCxDQUxBLEVBS3VCLEdBQWpCLENBQU47Q0FFRTs7Q0FBYSxDQUFBLENBQUEsbUJBQUU7Q0FFYixFQUFBLENBQUEsMENBQU07Q0FBTixDQUVBLENBQTRCLENBQTVCLEdBQU8sRUFBdUIsTUFBOUI7Q0FLRSxTQUFBLGdCQUFBO0NBQUEsRUFBRyxDQUFILEVBQUEsRUFBQTtBQUVBLENBQUE7WUFBQSxrQ0FBQTs4QkFBQTtDQUNFLEVBQUcsQ0FBSCxFQUFBLEVBQUEsR0FBQSxNQUE2QjtDQUQvQjt1QkFQMEI7Q0FBNUIsSUFBNEI7Q0FGNUIsQ0FZQSxDQUFlLENBQWYsRUFBZSxHQUFmO0NBRVUsQ0FBb0IsQ0FBNUIsQ0FBNEIsR0FBckIsQ0FBcUIsS0FBNUIsQ0FBQTtDQUZGLElBQWU7Q0FkakIsRUFBYTs7Q0FBYjs7Q0FGMEMifX0seyJvZmZzZXQiOnsibGluZSI6MTE1NTksImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9jb21wb25lbnRzL2xvZ2dlZF9saW5rLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJ1c2VyX2NvbnRyb2xsZXIgPSByZXF1aXJlICdhcHAvY29udHJvbGxlcnMvdXNlcidcbmxvZ2luX3BvcHVwID0gcmVxdWlyZSAnYXBwL3V0aWxzL2xvZ2luX3BvcHVwJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IChkb20pIC0+XG5cblx0b3JpZ2luYWxfdXJsID0gZG9tLmF0dHIgJ2hyZWYnXG5cblx0b25fY2xpY2sgPSAtPiBcblx0XHRhcHAuc2V0dGluZ3MuYWZ0ZXJfbG9naW5fdXJsID0gb3JpZ2luYWxfdXJsXG5cdFx0ZG8gbG9naW5fcG9wdXBcblx0XHRyZXR1cm4gZmFsc2VcblxuXHRvbl91c2VyX2xvZ2dlZCA9IChkYXRhKSAtPlxuXHRcdGxvZyBcIltMb2dnZWQgTGlua10gb25fdXNlcl9sb2dnZWRcIiwgZGF0YVxuXHRcdGRvbS5hdHRyICdocmVmJywgb3JpZ2luYWxfdXJsXG5cdFx0ZG9tLm9mZiAnY2xpY2snLCBvbl9jbGlja1xuXG5cdG9uX3VzZXJfdW5sb2dnZWQgPSAoZGF0YSkgLT5cblx0XHRsb2cgXCJbTG9nZ2VkIExpbmtdIG9uX3VzZXJfdW5sb2dnZWRcIiwgZGF0YVxuXHRcdGRvbS5hdHRyICdocmVmJywgJyMnXG5cdFx0ZG9tLm9uICdjbGljaycsIG9uX2NsaWNrXG5cblx0dXNlcl9jb250cm9sbGVyLm9uICd1c2VyOmxvZ2dlZCcsICAgb25fdXNlcl9sb2dnZWRcblx0dXNlcl9jb250cm9sbGVyLm9uICd1c2VyOnVubG9nZ2VkJywgb25fdXNlcl91bmxvZ2dlZFxuXG5cdGlmIHVzZXJfY29udHJvbGxlci5pc19sb2dnZWQoKVxuXHRcdGRvIG9uX3VzZXJfbG9nZ2VkXG5cdGVsc2Vcblx0XHRkbyBvbl91c2VyX3VubG9nZ2VkXG5cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLHdCQUFBOztBQUFBLENBQUEsRUFBa0IsSUFBQSxRQUFsQixPQUFrQjs7QUFDbEIsQ0FEQSxFQUNjLElBQUEsSUFBZCxZQUFjOztBQUVkLENBSEEsRUFHaUIsR0FBWCxDQUFOLEVBQWtCO0NBRWpCLEtBQUEsa0RBQUE7Q0FBQSxDQUFBLENBQWUsQ0FBQSxFQUFBLE1BQWY7Q0FBQSxDQUVBLENBQVcsS0FBWCxDQUFXO0NBQ1YsRUFBRyxDQUFILElBQVksSUFBWixHQUFBO0NBQUEsR0FDRyxPQUFIO0NBQ0EsSUFBQSxNQUFPO0NBTFIsRUFFVztDQUZYLENBT0EsQ0FBaUIsQ0FBQSxLQUFDLEtBQWxCO0NBQ0MsQ0FBb0MsQ0FBcEMsQ0FBQSwwQkFBQTtDQUFBLENBQ2lCLENBQWQsQ0FBSCxFQUFBLE1BQUE7Q0FDSSxDQUFhLENBQWQsSUFBSCxDQUFBLEdBQUE7Q0FWRCxFQU9pQjtDQVBqQixDQVlBLENBQW1CLENBQUEsS0FBQyxPQUFwQjtDQUNDLENBQXNDLENBQXRDLENBQUEsNEJBQUE7Q0FBQSxDQUNpQixDQUFkLENBQUgsRUFBQTtDQUNJLENBQUosQ0FBRyxJQUFILENBQUEsR0FBQTtDQWZELEVBWW1CO0NBWm5CLENBaUJBLFdBQUEsQ0FBQSxDQUFlO0NBakJmLENBa0JBLGFBQWUsQ0FBZjtDQUVBLENBQUEsRUFBRyxLQUFBLE1BQWU7Q0FDakIsVUFBRyxHQUFIO0lBREQsRUFBQTtDQUdDLFVBQUcsS0FBSDtJQXpCZTtDQUFBIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjExNTk0LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvY29tcG9uZW50cy9sb2dpbl9wb3B1cF9oYW5kbGVyLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJsb2dpbl9wb3B1cCA9IHJlcXVpcmUgJ2FwcC91dGlscy9sb2dpbl9wb3B1cCdcblxubW9kdWxlLmV4cG9ydHMgPSAoIGRvbSApIC0+XG5cdGRvbS5vbiAnY2xpY2snLCAtPiBkbyBsb2dpbl9wb3B1cFxuXG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxPQUFBOztBQUFBLENBQUEsRUFBYyxJQUFBLElBQWQsWUFBYzs7QUFFZCxDQUZBLEVBRWlCLEdBQVgsQ0FBTixFQUFtQjtDQUNkLENBQUosQ0FBRyxJQUFILEVBQUE7Q0FBbUIsVUFBRztDQUF0QixFQUFnQjtDQURBIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjExNjA2LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvY29tcG9uZW50cy9sb2dvdXRfbGluay5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsidXNlcl9jb250cm9sbGVyID0gcmVxdWlyZSAnYXBwL2NvbnRyb2xsZXJzL3VzZXInXG5cbm1vZHVsZS5leHBvcnRzID0gKCBkb20gKSAtPlxuXG5cdGRvbS5vbiAnY2xpY2snLCAoIGUgKSAtPlxuXHRcdGUucHJldmVudERlZmF1bHQoKVxuXHRcdGUuc3RvcFByb3BhZ2F0aW9uKClcblxuXHRcdHVzZXJfY29udHJvbGxlci5sb2dvdXQgKCBlcnJvciApIC0+XG5cbiAgICAgIGlmIGVycm9yIHRoZW4gY29uc29sZS5lcnJvciBlcnJvclxuICAgICAgXG5cdFx0XHRsb2cgXCJbTG9nb3V0TGlua10gbG9nb3V0IHN1Y2NlZGVlZC5cIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFdBQUE7O0FBQUEsQ0FBQSxFQUFrQixJQUFBLFFBQWxCLE9BQWtCOztBQUVsQixDQUZBLEVBRWlCLEdBQVgsQ0FBTixFQUFtQjtDQUVkLENBQUosQ0FBRyxJQUFILEVBQUE7Q0FDQyxHQUFBLFVBQUE7Q0FBQSxHQUNBLFdBQUE7Q0FEQSxFQUd1QixDQUF2QixDQUF1QixDQUF2QixHQUF5QixNQUFWO0NBRVgsR0FBRyxDQUFILENBQUE7Q0FBc0IsSUFBUixFQUFPLFFBQVA7UUFGSztDQUF2QixJQUF1QjtDQUlsQixFQUFKLFFBQUEscUJBQUE7Q0FSRixFQUFnQjtDQUZBIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjExNjI1LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvY29tcG9uZW50cy9tb2RhbC5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiaGFwcGVucyA9IHJlcXVpcmUgJ2hhcHBlbnMnXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgTW9kYWxcblx0b3BlbmVkOiBmYWxzZVxuXHRjb25zdHJ1Y3RvcjogKCBAZG9tICkgLT5cblx0XHRoYXBwZW5zIEBcblxuXHRcdEBvdmVybGF5ID0gJCAnLm1kX292ZXJsYXknXG5cblxuXHRvcGVuOiAoICkgLT5cblx0XHRyZXR1cm4gaWYgQG9wZW5lZFxuXHRcdEBvcGVuZWQgPSB0cnVlXG5cblx0XHRAZG9tLmFkZENsYXNzICdtZF92aXNpYmxlJ1xuXHRcdGRlbGF5IDEwLCA9PlxuXHRcdFx0QGRvbS5hZGRDbGFzcyAnbWRfc2hvdydcblxuXG5cdFx0aWYgQGRvbS5kYXRhKCAnbW9kYWwtY2xvc2UnICk/IGFuZCBAZG9tLmRhdGEoICdtb2RhbC1jbG9zZScgKSBpc250IGZhbHNlXG5cdFx0XHRAY2xvc2Vfb25fY2xpY2tfb3V0c2lkZSgpXG5cdFx0ZWxzZVxuXHRcdFx0QGRpc2FibGVfY2xvc2Vfb25fY2xpY2tfb3V0c2lkZSgpXG5cblx0XHRAZW1pdCAnb3BlbmVkJ1xuXG5cdGNsb3NlX29uX2NsaWNrX291dHNpZGU6IC0+XG5cdFx0QG92ZXJsYXkub2ZmKCAnY2xpY2snICkub24oICdjbGljaycsIEBjbG9zZSApXG5cblx0ZGlzYWJsZV9jbG9zZV9vbl9jbGlja19vdXRzaWRlOiAtPlxuXHRcdEBvdmVybGF5Lm9mZiggJ2NsaWNrJyApXG5cblx0Y2xvc2U6ICggKSA9PlxuXHRcdGlmIG5vdCBAb3BlbmVkXG5cdFx0XHRsb2cgXCJbTW9kYWxdIGl0J3MgYWxyZWFkeSBjbG9zZWQhXCJcblx0XHRcdHJldHVyblxuXG5cdFx0QG9wZW5lZCA9IGZhbHNlXG5cblx0XHRAZG9tLnJlbW92ZUNsYXNzICdtZF9zaG93J1x0XHRcblx0XHRkZWxheSA0MDAsID0+XG5cdFx0XHRAZG9tLnJlbW92ZUNsYXNzICdtZF92aXNpYmxlJ1xuXG5cdFx0XHRkbyBAaGlkZV9sb2FkaW5nXG5cblx0XHRcdEBlbWl0ICdjbG9zZWQnXG5cblx0c2hvd19sb2FkaW5nOiAoICkgLT5cdFx0XG5cdFx0QGRvbS5hZGRDbGFzcyAnbG9hZGluZydcblxuXHRoaWRlX2xvYWRpbmc6ICggKSAtPlxuXHRcdEBkb20ucmVtb3ZlQ2xhc3MgJ2xvYWRpbmcnXG5cblx0ZGVzdHJveTogLT5cblx0XHRsb2cgXCJbTW9kYWxdIHJlbW92ZWRcIlxuXHRcdEBkb20gPSBudWxsXG5cdFx0QG9uID0gbnVsbFxuXHRcdEBvZmYgPSBudWxsXG5cdFx0QG9uY2UgPSBudWxsXG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxVQUFBO0dBQUEsK0VBQUE7O0FBQUEsQ0FBQSxFQUFVLElBQVYsRUFBVTs7QUFFVixDQUZBLEVBRXVCLEdBQWpCLENBQU47Q0FDQyxFQUFRLEVBQVIsQ0FBQTs7Q0FDYSxDQUFBLENBQUEsWUFBRztDQUNmLEVBRGUsQ0FBRDtDQUNkLG9DQUFBO0NBQUEsR0FBQSxHQUFBO0NBQUEsRUFFVyxDQUFYLEdBQUEsTUFBVztDQUpaLEVBQ2E7O0NBRGIsRUFPTSxDQUFOLEtBQU07Q0FDTCxPQUFBLElBQUE7Q0FBQSxHQUFBLEVBQUE7Q0FBQSxXQUFBO01BQUE7Q0FBQSxFQUNVLENBQVYsRUFBQTtDQURBLEVBR0ksQ0FBSixJQUFBLElBQUE7Q0FIQSxDQUlBLENBQVUsQ0FBVixDQUFBLElBQVU7Q0FDUixFQUFHLEVBQUgsR0FBRCxDQUFBLElBQUE7Q0FERCxJQUFVO0NBSVYsRUFBdUMsQ0FBdkMsQ0FBbUUsUUFBaEMseUJBQWhDO0NBQ0YsR0FBQyxFQUFELGdCQUFBO01BREQ7Q0FHQyxHQUFDLEVBQUQsd0JBQUE7TUFYRDtDQWFDLEdBQUEsSUFBRCxHQUFBO0NBckJELEVBT007O0NBUE4sRUF1QndCLE1BQUEsYUFBeEI7Q0FDRSxDQUFELENBQUEsQ0FBQyxDQUFELEVBQVEsSUFBUjtDQXhCRCxFQXVCd0I7O0NBdkJ4QixFQTBCZ0MsTUFBQSxxQkFBaEM7Q0FDRSxFQUFELENBQUMsR0FBTyxJQUFSO0NBM0JELEVBMEJnQzs7Q0ExQmhDLEVBNkJPLEVBQVAsSUFBTztDQUNOLE9BQUEsSUFBQTtBQUFPLENBQVAsR0FBQSxFQUFBO0NBQ0MsRUFBQSxHQUFBLHdCQUFBO0NBQ0EsV0FBQTtNQUZEO0NBQUEsRUFJVSxDQUFWLENBSkEsQ0FJQTtDQUpBLEVBTUksQ0FBSixLQUFBLEVBQUE7Q0FDTSxDQUFLLENBQVgsRUFBQSxJQUFXLEVBQVg7Q0FDQyxFQUFJLEVBQUgsQ0FBRCxLQUFBLENBQUE7Q0FBQSxJQUVJLENBQUQsTUFBSDtDQUVDLEdBQUQsQ0FBQyxHQUFELEtBQUE7Q0FMRCxJQUFXO0NBckNaLEVBNkJPOztDQTdCUCxFQTRDYyxNQUFBLEdBQWQ7Q0FDRSxFQUFHLENBQUgsSUFBRCxDQUFBLEVBQUE7Q0E3Q0QsRUE0Q2M7O0NBNUNkLEVBK0NjLE1BQUEsR0FBZDtDQUNFLEVBQUcsQ0FBSCxLQUFELEVBQUE7Q0FoREQsRUErQ2M7O0NBL0NkLEVBa0RTLElBQVQsRUFBUztDQUNSLEVBQUEsQ0FBQSxhQUFBO0NBQUEsRUFDQSxDQUFBO0NBREEsQ0FFQSxDQUFNLENBQU47Q0FGQSxFQUdBLENBQUE7Q0FDQyxFQUFPLENBQVAsT0FBRDtDQXZERCxFQWtEUzs7Q0FsRFQ7O0NBSEQifX0seyJvZmZzZXQiOnsibGluZSI6MTE3MDMsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9jb21wb25lbnRzL21vZGFsX2hhbmRsZXIuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gY2xhc3MgTW9kYWxIYW5kbGVyXG5cdGNvbnN0cnVjdG9yOiAoIEBkb20gKSAtPlxuXHRcdHZpZXcub25jZSAnYmluZGVkJywgQG9uX3JlYWR5XG5cblx0b25fcmVhZHk6ICggKSA9PlxuXHRcdG1vZGFsX3RhcmdldCA9IHZpZXcuZ2V0X2J5X2RvbSBAZG9tLmRhdGEoICdtb2RhbCcgKVxuXHRcdEBkb20ub24gJ2NsaWNrJywgLT4gbW9kYWxfdGFyZ2V0Lm9wZW4oKSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFFBQUE7R0FBQSwrRUFBQTs7QUFBQSxDQUFBLEVBQXVCLEdBQWpCLENBQU47Q0FDYyxDQUFBLENBQUEsbUJBQUc7Q0FDZixFQURlLENBQUQ7Q0FDZCwwQ0FBQTtDQUFBLENBQW9CLEVBQXBCLElBQUE7Q0FERCxFQUFhOztDQUFiLEVBR1UsS0FBVixDQUFVO0NBQ1QsT0FBQSxJQUFBO0NBQUEsRUFBZSxDQUFmLEdBQStCLEdBQWhCLEVBQWY7Q0FDQyxDQUFELENBQUksQ0FBSCxHQUFELEVBQWlCLEVBQWpCO0NBQWlDLEdBQWIsUUFBWSxDQUFaO0NBQXBCLElBQWlCO0NBTGxCLEVBR1U7O0NBSFY7O0NBREQifX0seyJvZmZzZXQiOnsibGluZSI6MTE3MjcsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9jb21wb25lbnRzL3BsYXllci5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiYXBwY2FzdCAgPSByZXF1aXJlICdhcHAvY29udHJvbGxlcnMvYXBwY2FzdCdcblxubW9kdWxlLmV4cG9ydHMgPSAoIGRvbSApIC0+XG5cbiAgIyBzaG9ydGN1dCB0byBkb20gdGFnc1xuICBhdWRpbyA9IGRvbS5maW5kICdhdWRpbydcbiAgdnUgICAgPSBkb20uZmluZCAnLnZ1J1xuICBcbiAgIyBncmFicyBzdHJlYW0gdXJsIGZyb20gRE9NIGF0dHJpYnV0ZVxuICBzdHJlYW0gPSBhdWRpby5kYXRhICdzcmMnXG5cbiAgIyBoaWRlIGl0ZW1zIHdoZW4gaW5pdGlhbGl6aW5nXG4gIGF1ZGlvLmhpZGUoKVxuXG4gIGFwcGNhc3Qub24gJ2Nvbm5lY3RlZCcsICggc3RhdHVzICkgLT5cblxuICAgIGlmIHN0YXR1c1xuICAgICAgZG9tLmZpbmQoICcuc3RhdHVzJyApLmh0bWwgJy4uLiB3YWl0aW5nIHN0cmVhbSB0byBzdGFydCAuLi4nXG4gICAgZWxzZVxuICAgICAgZG9tLmZpbmQoICcuc3RhdHVzJyApLmh0bWwgJy4uLiB3YWl0aW5nIEFwcENhc3QgdG8gc3RhcnQgLi4uJ1xuXG4gIGFwcGNhc3Qub24gXCJzdHJlYW06ZXJyb3JcIiwgKCBlcnJvciApIC0+XG4gICAgaWYgbm90IGVycm9yIHRoZW4gcmV0dXJuXG5cbiAgICBkb20uZmluZCggJy5zdGF0dXMnICkuaHRtbCBcIi4uLiAje2Vycm9yfSAuLi5cIlxuXG4gICMgdGVtcG9yYXJ5IHNvbHV0aW9uIHdoaWxlIHdlIGRvbid0IGhhdmUgYXBwY2FzdHMgdG8gdGhlIHdlYnNlcnZlclxuICAjIGNoZWNrIHN0cmVhbSBzdGF0dXMgYW5kIHJldHJpZXMgMTAwbXMgYWZ0ZXIgcmVzcG9uc2VcbiAgY2hlY2tfc3RyZWFtID0gLT5cblxuICAgICQuZ2V0IHN0cmVhbSwgKCBlcnJvciwgcmVzcG9uc2UgKSAtPlxuXG4gICAgICBpZiBlcnJvclxuXG4gICAgICAgICMgdHJ5IGFnYWluXG4gICAgICAgIGRlbGF5IDEwMCwgY2hlY2tfc3RyZWFtXG5cbiAgICAgICAgcmV0dXJuIGNvbnNvbGUuZXJyb3IgJy0gZXJyb3IgbG9hZGluZyBzdHJlYW1pbmcnXG5cbiAgICAgIGNvbnNvbGUud2FybiAnKyBhbGwgZ29vZCEnXG5cbiAgIyBUT0RPOiBTZXQgQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luIG9uIHN0cmVhbWluZyBzZXJ2ZXIgc28gamF2YXNjcmlwdFxuICAjIHdpbGwgYmUgYWJsZSB0byBjaGVjayBzdHJlYW0gc3RhdHVzXG5cbiAgIyBkbyBjaGVja19zdHJlYW1cblxuXG4gICMgcmVsb2FkIGF1ZGlvIHRhZ1xuICBzdGFydF9hdWRpbyA9IC0+IFxuICAgIGF1ZGlvLmF0dHIgJ3NyYycsIGF1ZGlvLmRhdGEgJ3NyYydcbiAgICBhdWRpby5zaG93KClcblxuICBzdG9wX2F1ZGlvID0gLT5cbiAgICBhdWRpby5zdG9wKClcbiAgICBhdWRpby5oaWRlKClcblxuICAjIHRlbXBvcmFyeSBoYWNrIHRvIHN0YXJ0IGF1ZGlvIG9ubHkgYWZ0ZXIgc3RyZWFtIHN0YXJ0c1xuICBhcHBjYXN0Lm9uICdzdHJlYW06b25saW5lJywgKCBzdGF0dXMgKSAtPlxuXG4gICAgaWYgc3RhdHVzXG4gICAgICBzdGFydF9hdWRpbygpXG4gICAgZWxzZVxuICAgICAgc3RvcF9hdWRpbygpXG5cbiAgIyBjb25zb2xlLndhcm4gXCJsaXN0ZW5pbmcgZm9yIHZ1XCJcbiAgIyB0ZW1wb3JhcnkgaGFjayB0byBzdGFydCBhdWRpbyBvbmx5IGFmdGVyIHN0cmVhbSBzdGFydHNcbiAgYXBwY2FzdC5vbiAnc3RyZWFtOnZ1JywgKCBtZXRlciApIC0+XG5cbiAgICB2dS5maW5kKCAnLm1ldGVyX2xlZnQnICkud2lkdGggbWV0ZXJbMF0gKiAxMDAwXG4gICAgdnUuZmluZCggJy5tZXRlcl9yaWdodCcgKS53aWR0aCBtZXRlclsxXSAqIDEwMDAiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxHQUFBOztBQUFBLENBQUEsRUFBVyxJQUFYLGtCQUFXOztBQUVYLENBRkEsRUFFaUIsR0FBWCxDQUFOLEVBQW1CO0NBR2pCLEtBQUEsa0RBQUE7Q0FBQSxDQUFBLENBQVEsQ0FBQSxDQUFSLEVBQVE7Q0FBUixDQUNBLENBQVEsQ0FBQSxDQUFBO0NBRFIsQ0FJQSxDQUFTLENBQUEsQ0FBSyxDQUFkO0NBSkEsQ0FPQSxFQUFBLENBQUs7Q0FQTCxDQVNBLENBQXdCLEdBQUEsQ0FBakIsRUFBbUIsRUFBMUI7Q0FFRSxHQUFBLEVBQUE7Q0FDTSxFQUFELENBQUgsS0FBQSxJQUFBLG9CQUFBO01BREY7Q0FHTSxFQUFELENBQUgsS0FBQSxJQUFBLHFCQUFBO01BTG9CO0NBQXhCLEVBQXdCO0NBVHhCLENBZ0JBLENBQTJCLEVBQUEsRUFBcEIsRUFBc0IsS0FBN0I7QUFDUyxDQUFQLEdBQUEsQ0FBQTtDQUFrQixXQUFBO01BQWxCO0NBRUksRUFBRCxDQUFILENBQTRCLENBQUEsR0FBNUIsRUFBQTtDQUhGLEVBQTJCO0NBaEIzQixDQXVCQSxDQUFlLE1BQUEsR0FBZjtDQUVHLENBQWEsQ0FBZCxFQUFjLENBQWQsRUFBYyxDQUFFLEVBQWhCO0NBRUUsR0FBRyxDQUFILENBQUE7Q0FHRSxDQUFXLENBQVgsRUFBQSxHQUFBLElBQUE7Q0FFQSxJQUFPLEVBQU8sUUFBUCxZQUFBO1FBTFQ7Q0FPUSxHQUFSLEdBQU8sTUFBUDtDQVRGLElBQWM7Q0F6QmhCLEVBdUJlO0NBdkJmLENBMkNBLENBQWMsTUFBQSxFQUFkO0NBQ0UsQ0FBa0IsRUFBbEIsQ0FBSztDQUNDLEdBQU4sQ0FBSyxNQUFMO0NBN0NGLEVBMkNjO0NBM0NkLENBK0NBLENBQWEsTUFBQSxDQUFiO0NBQ0UsR0FBQSxDQUFLO0NBQ0MsR0FBTixDQUFLLE1BQUw7Q0FqREYsRUErQ2E7Q0EvQ2IsQ0FvREEsQ0FBNEIsR0FBQSxDQUFyQixFQUF1QixNQUE5QjtDQUVFLEdBQUEsRUFBQTtDQUNFLFVBQUEsRUFBQTtNQURGO0NBR0UsU0FBQSxHQUFBO01BTHdCO0NBQTVCLEVBQTRCO0NBU3BCLENBQVIsQ0FBd0IsRUFBQSxFQUFqQixFQUFQLEVBQUE7Q0FFRSxDQUFFLENBQXdDLENBQTFDLENBQUEsUUFBQTtDQUNHLENBQUQsQ0FBeUMsQ0FBM0MsQ0FBQSxNQUFBLEdBQUE7Q0FIRixFQUF3QjtDQWhFVCJ9fSx7Im9mZnNldCI6eyJsaW5lIjoxMTc4MiwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2NvbXBvbmVudHMvc2Nyb2xsX2hhbmRsZXIuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gY2xhc3MgU2Nyb2xsSGFuZGxlclxuXHRjb25zdHJ1Y3RvcjogKCBAZG9tICkgLT5cblxuXHRcdHRhcmdldCA9ICQgQGRvbS5kYXRhKCAndGFyZ2V0JyApXG5cdFx0cmV0dXJuIGlmIHRhcmdldC5sZW5ndGggPD0gMFxuXG5cdFx0QGRvbS5hZGRDbGFzcyAnc2Nyb2xsX2hhbmRsZXInXG5cdFx0XG5cdFx0QGRvbS5vbiAnY2xpY2snLCAtPlxuXHRcdFx0bW92ZXIuc2Nyb2xsX3RvIHRhcmdldFxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQGRvbS5vZmYgJ2NsaWNrJyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFNBQUE7O0FBQUEsQ0FBQSxFQUF1QixHQUFqQixDQUFOO0NBQ2MsQ0FBQSxDQUFBLG9CQUFHO0NBRWYsS0FBQSxFQUFBO0NBQUEsRUFGZSxDQUFEO0NBRWQsRUFBUyxDQUFULEVBQUEsRUFBVztDQUNYLEdBQUEsRUFBZ0I7Q0FBaEIsV0FBQTtNQURBO0NBQUEsRUFHSSxDQUFKLElBQUEsUUFBQTtDQUhBLENBS0EsQ0FBSSxDQUFKLEdBQUEsRUFBaUI7Q0FDVixJQUFELENBQUwsR0FBQSxJQUFBO0NBREQsSUFBaUI7Q0FMakIsR0FRQTtDQUFBLENBQVMsQ0FBQSxHQUFULENBQUEsRUFBUztDQUNOLEVBQUcsQ0FBSCxHQUFELFFBQUE7Q0FERixNQUFTO0NBUlQsS0FRQTtDQVZELEVBQWE7O0NBQWI7O0NBREQifX0seyJvZmZzZXQiOnsibGluZSI6MTE4MDksImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9jb21wb25lbnRzL3NlbGVjdC5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiaGFwcGVucyA9IHJlcXVpcmUgJ2hhcHBlbnMnXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgU2VsZWN0XG5cbiAgY29uc3RydWN0b3I6ICggQGRvbSApIC0+XG5cbiAgICBoYXBwZW5zIEBcbiAgICBAZG9tLmFkZENsYXNzICdzZWxlY3Rfd3JhcHBlcidcblxuICAgIGhhbmRsZXIgPSBAZG9tLmZpbmQgJy5oYW5kbGVyIC50ZXh0J1xuICAgIHNlbGVjdCA9IEBkb20uZmluZCAnc2VsZWN0J1xuICAgIFxuICAgIHJlZiA9IEBcblxuICAgIHNlbGVjdC5vbiAnY2hhbmdlJywgLT5cbiAgICAgIFxuICAgICAgaGFuZGxlci5odG1sIHNlbGVjdC52YWwoKVxuXG4gICAgICByZWYuZW1pdCAnY2hhbmdlZCcsIHNlbGVjdC52YWwoKSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFdBQUE7O0FBQUEsQ0FBQSxFQUFVLElBQVYsRUFBVTs7QUFFVixDQUZBLEVBRXVCLEdBQWpCLENBQU47Q0FFZSxDQUFBLENBQUEsYUFBRztDQUVkLE9BQUEsWUFBQTtDQUFBLEVBRmMsQ0FBRDtDQUViLEdBQUEsR0FBQTtDQUFBLEVBQ0ksQ0FBSixJQUFBLFFBQUE7Q0FEQSxFQUdVLENBQVYsR0FBQSxTQUFVO0NBSFYsRUFJUyxDQUFULEVBQUEsRUFBUztDQUpULEVBTUEsQ0FBQTtDQU5BLENBUUEsQ0FBb0IsQ0FBcEIsRUFBTSxFQUFOLENBQW9CO0NBRWxCLEVBQWEsQ0FBYixFQUFBLENBQU87Q0FFSCxDQUFnQixDQUFqQixDQUFILEVBQTBCLEdBQTFCLElBQUE7Q0FKRixJQUFvQjtDQVZ0QixFQUFhOztDQUFiOztDQUpGIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjExODM0LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvY29tcG9uZW50cy9zdHJlYW1fY29udHJvbHMuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbInVzZXJfY29udHJvbGxlciA9IHJlcXVpcmUgJ2FwcC9jb250cm9sbGVycy91c2VyJ1xuXG4jIFRPRE86IGFuaW1hdGlvbiBmb3IgY29udHJvbHMgaW4gYW5kIG91dFxuXG5tb2R1bGUuZXhwb3J0cyA9ICggZG9tICkgLT5cblxuICAjIHdhaXRzIG1vZGVsIGdldCB1c2VyIG5hbWVcbiAgdXNlcl9jb250cm9sbGVyLm9uICd1c2VyOmxvZ2dlZCcsICggdXNlciApIC0+XG5cbiAgICBjb25zb2xlLmxvZyAndXNlciBsb2dnZWQgLT4nLCB1c2VyLnVzZXJuYW1lXG5cbiAgICBpZiBcIi8je3VzZXIudXNlcm5hbWV9XCIgaXMgd2F5cy5wYXRobmFtZSgpXG4gICAgICAkKCAnLmNvbnRyb2xzJyApLnNob3coKVxuXG5cbiAgdXNlcl9jb250cm9sbGVyLm9uICd1c2VyOnVubG9nZ2VkJywgLT5cbiAgICAkKCAnLmNvbnRyb2xzJyApLmhpZGUoKVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsV0FBQTs7QUFBQSxDQUFBLEVBQWtCLElBQUEsUUFBbEIsT0FBa0I7O0FBSWxCLENBSkEsRUFJaUIsR0FBWCxDQUFOLEVBQW1CO0NBR2pCLENBQUEsQ0FBa0MsQ0FBQSxLQUFFLElBQXBDLEVBQWU7Q0FFYixDQUE4QixDQUE5QixDQUFBLEdBQU8sQ0FBUCxRQUFBO0NBRUEsRUFBSSxDQUFKLENBQTBCLEdBQXZCO0NBQ0QsR0FBQSxPQUFBLEVBQUE7TUFMOEI7Q0FBbEMsRUFBa0M7Q0FRbEIsQ0FBaEIsQ0FBb0MsTUFBcEMsTUFBZTtDQUNiLEdBQUEsT0FBQTtDQURGLEVBQW9DO0NBWHJCIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjExODUyLCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvY29tcG9uZW50cy91c2VyX3NldC5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSAoIGRvbSApIC0+XG4gIHNldHRpbmdzX2hhbmRsZXIgPSBudWxsXG4gIGVkaXRfbW9kYWwgICAgICAgPSBudWxsXG5cbiAgaW5pdCA9IC0+XG4gICAgZG9tLmZpbmQoICcuZG93bmxvYWRfYnV0dG9uJyApLm9uICdjbGljaycsIF9kb3dubG9hZFxuICAgIGRvbS5maW5kKCAnLmVkaXRfYnV0dG9uJyApLm9uICdjbGljaycsIF9lZGl0XG4gICAgZG9tLmZpbmQoICcuZGVsZXRlX2J1dHRvbicgKS5vbiAnY2xpY2snLCBfdG9fZGVsZXRlXG5cbiAgICBkb20uZmluZCggJy5jb25maXJtX2RlbGV0ZScgKS5vbiAnY2xpY2snLCBfY29uZmlybV9kZWxldGVcbiAgICBkb20uZmluZCggJy5jYW5jZWxfZGVsZXRlJyApLm9uICdjbGljaycsIF9jYW5jZWxfZGVsZXRlXG5cbiAgICB2aWV3Lm9uY2UgJ2JpbmRlZCcsIF9vbl92aWV3c19iaW5kZWRcblxuICBfb25fdmlld3NfYmluZGVkID0gLT5cbiAgICBzZXR0aW5nc19oYW5kbGVyID0gdmlldy5nZXRfYnlfZG9tIGRvbS5maW5kKCAnLnNldHRpbmdzX2J1dHRvbicgKVxuICAgIGVkaXRfbW9kYWwgPSB2aWV3LmdldF9ieV9kb20gJCggJyNyb29tX21vZGFsJyApXG5cbiAgX2Rvd25sb2FkID0gLT5cbiAgICBsb2cgXCJbU2V0XSBkb3dubG9hZFwiXG5cbiAgX2VkaXQgPSAtPlxuICAgIHNldHRpbmdzX2hhbmRsZXIuY2xvc2UoKVxuXG4gICAgZWRpdF9tb2RhbC5vcGVuX3dpdGhfZGF0YSBkb20uZGF0YSggJ2RhdGEnIClcbiAgICBlZGl0X21vZGFsLm9uY2UgJ3N1Ym1pdCcsIF9vbl9lZGl0X3N1Ym1pdFxuXG4gIF9vbl9lZGl0X3N1Ym1pdCA9IChkYXRhKSAtPlxuXG4gICAgbG9nIFwiW1VzZXIgU2V0XSBlZGl0IHN1Ym1pdHRlZFwiLCBkYXRhXG5cbiAgICAjIFVwZGF0ZSBVSVxuICAgIGRvbS5maW5kKCAnLnNlc3Npb25fdGl0bGUgYScgKS5odG1sIGRhdGEudGl0bGVcbiAgICBkb20uZmluZCggJy5sb2NhdGlvbiAudGV4dCcgKS5odG1sIGRhdGEubG9jYXRpb25cblxuICAgIGdlbnJlcyA9IGRhdGEuZ2VucmVzLnNwbGl0ICcsICdcbiAgICBnZW5yZXNfZG9tID0gZG9tLmZpbmQoICcuZ2VucmVzJyApXG4gICAgc3RyID0gJydcbiAgICBmb3IgZ2VucmUgaW4gZ2VucmVzXG4gICAgICBzdHIgKz0gXCI8YSBjbGFzcz0ndGFnJyBocmVmPScjJyB0aXRsZT0nI3tnZW5yZX0nPiN7Z2VucmV9PC9hPlwiXG5cbiAgICBnZW5yZXNfZG9tLmh0bWwgc3RyXG5cblxuICAgIGVkaXRfbW9kYWwuaGlkZV9tZXNzYWdlKClcbiAgICBlZGl0X21vZGFsLnNob3dfbG9hZGluZygpXG5cbiAgICAjIFRPRE86IENhbGwgdGhlIGFwaVxuICAgIGRlbGF5IDEwMDAsIC0+XG4gICAgICBlZGl0X21vZGFsLmNsb3NlKClcblxuXG4gIF90b19kZWxldGUgPSAtPlxuICAgIGRvbS5hZGRDbGFzcyAndG9fZGVsZXRlJ1xuICAgIHNldHRpbmdzX2hhbmRsZXIuY2xvc2UoKVxuXG4gIF9jYW5jZWxfZGVsZXRlID0gLT5cbiAgICBkb20ucmVtb3ZlQ2xhc3MgJ3RvX2RlbGV0ZSdcblxuICBfY29uZmlybV9kZWxldGUgPSAtPlxuICAgIGxvZyBcIltTZXRdIGRlbGV0ZVwiXG4gICAgZG9tLnNsaWRlVXAoKVxuXG5cbiAgaW5pdCgpIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLENBQU8sRUFBVSxHQUFYLENBQU4sRUFBbUI7Q0FDakIsS0FBQSw4SEFBQTtDQUFBLENBQUEsQ0FBbUIsQ0FBbkIsWUFBQTtDQUFBLENBQ0EsQ0FBbUIsQ0FEbkIsTUFDQTtDQURBLENBR0EsQ0FBTyxDQUFQLEtBQU87Q0FDTCxDQUFBLENBQUcsQ0FBSCxHQUFBLEVBQUEsU0FBQTtDQUFBLENBQ0EsQ0FBRyxDQUFILENBQUEsRUFBQSxPQUFBO0NBREEsQ0FFQSxDQUFHLENBQUgsR0FBQSxHQUFBLE1BQUE7Q0FGQSxDQUlBLENBQUcsQ0FBSCxHQUFBLFFBQUEsRUFBQTtDQUpBLENBS0EsQ0FBRyxDQUFILEdBQUEsT0FBQSxFQUFBO0NBRUssQ0FBZSxFQUFoQixJQUFKLEdBQUEsS0FBQTtDQVhGLEVBR087Q0FIUCxDQWFBLENBQW1CLE1BQUEsT0FBbkI7Q0FDRSxFQUFtQixDQUFuQixNQUFtQixNQUFuQixFQUFtQztDQUNqQixFQUFMLENBQUksTUFBakIsQ0FBQSxFQUE2QjtDQWYvQixFQWFtQjtDQWJuQixDQWlCQSxDQUFZLE1BQVo7Q0FDTSxFQUFKLFFBQUEsS0FBQTtDQWxCRixFQWlCWTtDQWpCWixDQW9CQSxDQUFRLEVBQVIsSUFBUTtDQUNOLEdBQUEsQ0FBQSxXQUFnQjtDQUFoQixFQUU2QixDQUE3QixFQUEwQixJQUFoQixJQUFWO0NBQ1csQ0FBZSxFQUExQixJQUFBLEVBQVUsQ0FBVixJQUFBO0NBeEJGLEVBb0JRO0NBcEJSLENBMEJBLENBQWtCLENBQUEsS0FBQyxNQUFuQjtDQUVFLE9BQUEsZ0NBQUE7Q0FBQSxDQUFpQyxDQUFqQyxDQUFBLHVCQUFBO0NBQUEsRUFHRyxDQUFILENBQUEsYUFBQTtDQUhBLEVBSUcsQ0FBSCxJQUFBLFNBQUE7Q0FKQSxFQU1TLENBQVQsQ0FBUyxDQUFUO0NBTkEsRUFPYSxDQUFiLEtBQWEsQ0FBYjtDQVBBLENBQUEsQ0FRQSxDQUFBO0FBQ0EsQ0FBQSxRQUFBLG9DQUFBOzBCQUFBO0NBQ0UsRUFBQSxDQUFRLENBQUEsQ0FBUiwyQkFBUTtDQURWLElBVEE7Q0FBQSxFQVlBLENBQUEsTUFBVTtDQVpWLEdBZUEsTUFBVSxFQUFWO0NBZkEsR0FnQkEsTUFBVSxFQUFWO0NBR00sQ0FBTSxDQUFBLENBQVosQ0FBQSxJQUFZLEVBQVo7Q0FDYSxJQUFYLEtBQVUsR0FBVjtDQURGLElBQVk7Q0EvQ2QsRUEwQmtCO0NBMUJsQixDQW1EQSxDQUFhLE1BQUEsQ0FBYjtDQUNFLEVBQUcsQ0FBSCxJQUFBLEdBQUE7Q0FDaUIsSUFBakIsTUFBQSxLQUFnQjtDQXJEbEIsRUFtRGE7Q0FuRGIsQ0F1REEsQ0FBaUIsTUFBQSxLQUFqQjtDQUNNLEVBQUQsUUFBSDtDQXhERixFQXVEaUI7Q0F2RGpCLENBMERBLENBQWtCLE1BQUEsTUFBbEI7Q0FDRSxFQUFBLENBQUEsVUFBQTtDQUNJLEVBQUQsSUFBSCxJQUFBO0NBNURGLEVBMERrQjtDQUtsQixHQUFBLEtBQUE7Q0FoRWUifX0seyJvZmZzZXQiOnsibGluZSI6MTE5MTEsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9leHBsb3JlLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJJc290b3BlID0gcmVxdWlyZSAnaXNvdG9wZS1sYXlvdXQnXG5tb2R1bGUuZXhwb3J0cyA9IChkb20pIC0+XG5cblx0Y29udGFpbmVyX2lzb3RvcGUgPSBkb20uZmluZCggJy5yb29tc19ncmlkJyApWyAwIF1cblxuXHRpc290b3BlID0gbmV3IElzb3RvcGUgY29udGFpbmVyX2lzb3RvcGUsXG5cdFx0aXRlbVNlbGVjdG9yOiAnLml0ZW0nLFxuXHRcdGd1dHRlcjogMzBcblx0XHRsYXlvdXRNb2RlOiAnbWFzb25yeSdcblx0XHRtYXNvbnJ5OlxuXHRcdFx0Y29sdW1uV2lkdGg6IDIxMCxcblx0XHRcdGd1dHRlcjogMzBcblx0XG5cdGZpbHRlcnMgPSBkb20uZmluZCAnLmdlbnJlc19saXN0IGEnXG5cblx0ZG9tLmZpbmQoICdbZGF0YS1nZW5yZS1pZF0nICkub24gJ2NsaWNrJywgKGUpIC0+XG5cdFx0IyBGaWx0ZXIgYnkgZ2VucmVcblx0XHRnZW5yZV9pZCA9ICQoZS5jdXJyZW50VGFyZ2V0KS5kYXRhICdnZW5yZS1pZCdcblx0XHRsb2cgXCJjbGlja1wiLCBnZW5yZV9pZFxuXHRcdFxuXHRcdGZpbHRlcnMucmVtb3ZlQ2xhc3MgJ3NlbGVjdGVkJ1xuXHRcdGRvbS5maW5kKCAnLmdlbnJlc19saXN0IGFbZGF0YS1nZW5yZS1pZD1cIicrZ2VucmVfaWQrJ1wiXScgKS5hZGRDbGFzcyAnc2VsZWN0ZWQnXG5cblx0XHRpc290b3BlLmFycmFuZ2UgZmlsdGVyOiBcIi5pdGVtLSN7Z2VucmVfaWR9XCIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxHQUFBOztBQUFBLENBQUEsRUFBVSxJQUFWLFNBQVU7O0FBQ1YsQ0FEQSxFQUNpQixHQUFYLENBQU4sRUFBa0I7Q0FFakIsS0FBQSw2QkFBQTtDQUFBLENBQUEsQ0FBb0IsQ0FBQSxTQUFBLElBQXBCO0NBQUEsQ0FFQSxDQUFjLENBQUEsR0FBZCxVQUFjO0NBQ2IsQ0FBYyxFQUFkLEdBQUEsS0FBQTtDQUFBLENBQ1EsRUFBUixFQUFBO0NBREEsQ0FFWSxFQUFaLEtBRkEsQ0FFQTtDQUZBLENBSUMsRUFERCxHQUFBO0NBQ0MsQ0FBYSxDQUFiLEdBQUEsS0FBQTtDQUFBLENBQ1EsSUFBUjtNQUxEO0NBSEQsR0FFYztDQUZkLENBVUEsQ0FBVSxDQUFBLEdBQVYsU0FBVTtDQUVOLENBQUosQ0FBRyxDQUFILEdBQUEsRUFBQSxRQUFBO0NBRUMsT0FBQTtDQUFBLEVBQVcsQ0FBWCxJQUFBLEVBQVcsR0FBQTtDQUFYLENBQ2EsQ0FBYixDQUFBLEdBQUEsQ0FBQTtDQURBLEdBR0EsR0FBTyxHQUFQLENBQUE7Q0FIQSxFQUlHLENBQUgsSUFBVSxFQUFWLHNCQUFVO0NBRUYsTUFBRCxJQUFQO0NBQWdCLENBQVMsQ0FBTyxHQUFoQixFQUFTO0NBUmdCLEtBUXpDO0NBUkQsRUFBMEM7Q0FkMUIifX0seyJvZmZzZXQiOnsibGluZSI6MTE5NDIsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9oZWFkZXIuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIm5hdmlnYXRpb24gICAgICA9IHJlcXVpcmUgJ2FwcC9jb250cm9sbGVycy9uYXZpZ2F0aW9uJ1xudXNlcl9jb250cm9sbGVyID0gcmVxdWlyZSAnYXBwL2NvbnRyb2xsZXJzL3VzZXInXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEhlYWRlclxuXG5cdGN1cnJlbnRfcGFnZTogXCJcIlxuXHR1c2VyX2xvZ2dlZDogZmFsc2VcblxuXHRjb25zdHJ1Y3RvcjogKCBAZG9tICkgLT5cblx0XHR1c2VyX2NvbnRyb2xsZXIub24gJ3VzZXI6bG9nZ2VkJywgQG9uX3VzZXJfbG9nZ2VkXG5cdFx0dXNlcl9jb250cm9sbGVyLm9uICd1c2VyOnVubG9nZ2VkJywgQG9uX3VzZXJfdW5sb2dnZWRcblxuXHRcdG5hdmlnYXRpb24ub24gJ2FmdGVyX3JlbmRlcicsIEBjaGVja19tZW51XG5cblx0Y2hlY2tfbWVudTogPT5cblx0XHRvYmogPSAkKCAnW2RhdGEtbWVudV0nIClcblx0XHRpZiBvYmoubGVuZ3RoID4gMFxuXHRcdFx0cGFnZSA9IG9iai5kYXRhICdtZW51J1xuXHRcdFx0bG9nIFwiW0hlYWRlcl0gY2hlY2tfbWVudVwiLCBwYWdlXG5cdFx0XHRcblx0XHRcdGlmIEBjdXJyZW50X3BhZ2UubGVuZ3RoID4gMFxuXHRcdFx0XHRAZG9tLmZpbmQoIFwiLiN7QGN1cnJlbnRfcGFnZX1faXRlbVwiICkucmVtb3ZlQ2xhc3MgXCJzZWxlY3RlZFwiXG5cdFx0XHRcdGFwcC5ib2R5LnJlbW92ZUNsYXNzIFwiI3tAY3VycmVudF9wYWdlfV9wYWdlXCJcblxuXHRcdFx0QGRvbS5maW5kKCBcIi4je3BhZ2V9X2l0ZW1cIiApLmFkZENsYXNzIFwic2VsZWN0ZWRcIlxuXHRcdFx0YXBwLmJvZHkuYWRkQ2xhc3MgXCIje3BhZ2V9X3BhZ2VcIlxuXG5cdFx0XHRAY3VycmVudF9wYWdlID0gcGFnZVxuXG5cblx0XHRvYmogPSAkKCAnW2RhdGEtc3VibWVudV0nIClcblx0XHRpZiBvYmoubGVuZ3RoID4gMFxuXHRcdFx0c3VibWVudSA9IG9iai5kYXRhICdzdWJtZW51J1xuXHRcdFx0JCggXCIuI3tzdWJtZW51fVwiICkuYWRkQ2xhc3MgJ3NlbGVjdGVkJ1xuXG5cblx0XHRvYmogPSAkKCAnW2RhdGEtbWVudS1maXhlZF0nIClcblx0XHRpZiBvYmoubGVuZ3RoID4gMFxuXHRcdFx0aWYgb2JqLmRhdGEoICdtZW51LWZpeGVkJykgaXMgZmFsc2Vcblx0XHRcdFx0YXBwLmJvZHkuYWRkQ2xhc3MgJ3VuZml4ZWQnXG5cdFx0ZWxzZVxuXHRcdFx0YXBwLmJvZHkucmVtb3ZlQ2xhc3MgJ3VuZml4ZWQnXG5cblxuXG5cdG9uX3VzZXJfbG9nZ2VkOiAoIGRhdGEgKSA9PlxuXG5cdFx0cmV0dXJuIGlmIEB1c2VyX2xvZ2dlZFxuXHRcdEB1c2VyX2xvZ2dlZCA9IHRydWVcblx0XHRcblx0XHR3cmFwcGVyID0gQGRvbS5maW5kKCAnLnVzZXJfbG9nZ2VkJyApXG5cdFx0dG1wbCAgICA9IHJlcXVpcmUgJ3RlbXBsYXRlcy9zaGFyZWQvaGVhZGVyX3VzZXJfbG9nZ2VkJ1xuXG5cdFx0aHRtbCAgICA9IHRtcGwgZGF0YVxuXG5cblx0XHRsb2cgXCJbSGVhZGVyXSBvbl91c2VyX2xvZ2dlZFwiLCBkYXRhLCBodG1sXG5cblx0XHRsb2cgXCJ3cmFwcGVyXCIsIHdyYXBwZXIubGVuZ3RoLCB3cmFwcGVyXG5cblx0XHR3cmFwcGVyLmVtcHR5KCkuYXBwZW5kIGh0bWxcblxuXHRcdHZpZXcuYmluZCB3cmFwcGVyXG5cdFx0bmF2aWdhdGlvbi5iaW5kIHdyYXBwZXJcblxuXG5cblx0b25fdXNlcl91bmxvZ2dlZDogKCBkYXRhICkgPT5cblx0XHRyZXR1cm4gaWYgbm90IEB1c2VyX2xvZ2dlZFxuXHRcdEB1c2VyX2xvZ2dlZCA9IGZhbHNlXG5cdFx0bG9nIFwiW0hlYWRlcl0gb25fdXNlcl91bmxvZ2dlZFwiLCBkYXRhIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsK0JBQUE7R0FBQSwrRUFBQTs7QUFBQSxDQUFBLEVBQWtCLElBQUEsR0FBbEIsa0JBQWtCOztBQUNsQixDQURBLEVBQ2tCLElBQUEsUUFBbEIsT0FBa0I7O0FBQ2xCLENBRkEsRUFFdUIsR0FBakIsQ0FBTjtDQUVDLENBQUEsQ0FBYyxTQUFkOztDQUFBLEVBQ2EsRUFEYixNQUNBOztDQUVhLENBQUEsQ0FBQSxhQUFHO0NBQ2YsRUFEZSxDQUFEO0NBQ2QsMERBQUE7Q0FBQSxzREFBQTtDQUFBLDhDQUFBO0NBQUEsQ0FBQSxFQUFBLFNBQUEsQ0FBQSxDQUFlO0NBQWYsQ0FDQSxFQUFBLFdBQWUsQ0FBZjtDQURBLENBR0EsRUFBQSxNQUFVLElBQVY7Q0FQRCxFQUdhOztDQUhiLEVBU1ksTUFBQSxDQUFaO0NBQ0MsT0FBQSxVQUFBO0NBQUEsRUFBQSxDQUFBLFNBQU07Q0FDTixFQUFNLENBQU4sRUFBRztDQUNGLEVBQU8sQ0FBUCxFQUFBO0NBQUEsQ0FDMkIsQ0FBM0IsQ0FBQSxFQUFBLGVBQUE7Q0FFQSxFQUEwQixDQUF2QixFQUFILE1BQWdCO0NBQ2YsRUFBSSxDQUFILEdBQUQsQ0FBQSxFQUFBLENBQUEsQ0FBWTtDQUFaLENBQ3FCLENBQWxCLENBQUssR0FBUixDQUFBLEdBQUEsQ0FBcUI7UUFMdEI7Q0FBQSxFQU9JLENBQUgsRUFBRCxDQUFBLENBQUEsRUFBQTtDQVBBLENBUWtCLENBQWYsQ0FBSyxFQUFSLENBQUEsQ0FBQTtDQVJBLEVBVWdCLENBQWYsRUFBRCxNQUFBO01BWkQ7Q0FBQSxFQWVBLENBQUEsWUFBTTtDQUNOLEVBQU0sQ0FBTixFQUFHO0NBQ0YsRUFBVSxDQUFBLEVBQVYsQ0FBQSxFQUFVO0NBQVYsRUFDSSxHQUFKLENBQUEsQ0FBQSxFQUFBO01BbEJEO0NBQUEsRUFxQkEsQ0FBQSxlQUFNO0NBQ04sRUFBTSxDQUFOLEVBQUc7Q0FDRixFQUFNLENBQUgsQ0FBMkIsQ0FBOUIsTUFBRztDQUNFLEVBQUQsQ0FBSyxJQUFSLENBQUEsTUFBQTtRQUZGO01BQUE7Q0FJSyxFQUFELENBQUssS0FBUixFQUFBLEVBQUE7TUEzQlU7Q0FUWixFQVNZOztDQVRaLEVBd0NnQixDQUFBLEtBQUUsS0FBbEI7Q0FFQyxPQUFBLFdBQUE7Q0FBQSxHQUFBLE9BQUE7Q0FBQSxXQUFBO01BQUE7Q0FBQSxFQUNlLENBQWYsT0FBQTtDQURBLEVBR1UsQ0FBVixHQUFBLE9BQVU7Q0FIVixFQUlVLENBQVYsR0FBVSw4QkFBQTtDQUpWLEVBTVUsQ0FBVjtDQU5BLENBUytCLENBQS9CLENBQUEscUJBQUE7Q0FUQSxDQVdlLENBQWYsQ0FBQSxFQUFBLENBQXNCLEVBQXRCO0NBWEEsR0FhQSxDQUFBLENBQUEsQ0FBTztDQWJQLEdBZUEsR0FBQTtDQUNXLEdBQVgsR0FBQSxHQUFVLENBQVY7Q0ExREQsRUF3Q2dCOztDQXhDaEIsRUE4RGtCLENBQUEsS0FBRSxPQUFwQjtBQUNlLENBQWQsR0FBQSxPQUFBO0NBQUEsV0FBQTtNQUFBO0NBQUEsRUFDZSxDQUFmLENBREEsTUFDQTtDQUNJLENBQTZCLENBQWpDLENBQUEsT0FBQSxnQkFBQTtDQWpFRCxFQThEa0I7O0NBOURsQjs7Q0FKRCJ9fSx7Im9mZnNldCI6eyJsaW5lIjoxMjAyMywiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2hvbWVwYWdlLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJwcmVsb2FkID0gcmVxdWlyZSAnYXBwL3V0aWxzL3ByZWxvYWQnXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgSG9tZXBhZ2Vcblx0Y29uc3RydWN0b3I6IChAZG9tKSAtPlxuXG5cdFx0ZWxlbWVudHMgPSBbXVxuXHRcdGltYWdlcyA9IFtdXG5cblx0XHRAZG9tLmZpbmQoICcucGFyYWxsYXgtY29udGFpbmVyJyApLmVhY2ggLT5cblx0XHRcdGVsZW1lbnRzLnB1c2ggJCggQCApXG5cdFx0XHRpbWFnZXMucHVzaCAkKCBAICkuZGF0YSggJ2ltYWdlLXBhcmFsbGF4JyApXG5cblx0XHRwcmVsb2FkIGltYWdlcywgKCBpbWFnZXNfbG9hZGVkICktPlxuXG5cdFx0XHRmb3IgZWwsIGkgaW4gZWxlbWVudHNcblx0XHRcdFx0ZWwucGFyYWxsYXhcblx0XHRcdFx0XHRpbWFnZVNyYyAgICAgOiBpbWFnZXNfbG9hZGVkWyBpIF0uc3JjXG5cdFx0XHRcdFx0YmxlZWQgICAgICAgIDogMTBcblx0XHRcdFx0XHRwYXJhbGxheCAgICAgOiAnc2Nyb2xsJ1xuXHRcdFx0XHRcdG5hdHVyYWxXaWR0aCA6IGltYWdlc19sb2FkZWRbIGkgXS53aWR0aFxuXHRcdFx0XHRcdG5hdHVyYWxoZWlnaHQ6IGltYWdlc19sb2FkZWRbIGkgXS5oZWlnaHRcblxuXHRcdFx0ZGVsYXkgMTAwLCA9PiBhcHAud2luZG93Lm9iai50cmlnZ2VyICdyZXNpemUnXG5cblxuXHRkZXN0cm95OiAoICkgLT5cblx0XHRwID0gJCggJy5wYXJhbGxheC1taXJyb3InIClcblx0XHRwLmFkZENsYXNzKCAnaGlkZScgKVxuXHRcdGRlbGF5IDMwMCwgLT4gcC5yZW1vdmUoKSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGFBQUE7O0FBQUEsQ0FBQSxFQUFVLElBQVYsWUFBVTs7QUFFVixDQUZBLEVBRXVCLEdBQWpCLENBQU47Q0FDYyxDQUFBLENBQUEsZUFBRTtDQUVkLE9BQUEsUUFBQTtDQUFBLEVBRmMsQ0FBRDtDQUViLENBQUEsQ0FBVyxDQUFYLElBQUE7Q0FBQSxDQUFBLENBQ1MsQ0FBVCxFQUFBO0NBREEsRUFHSSxDQUFKLEtBQXdDLFlBQXhDO0NBQ0MsR0FBQSxFQUFBLEVBQVE7Q0FDRCxHQUFQLEVBQU0sT0FBTixHQUFZO0NBRmIsSUFBd0M7Q0FIeEMsQ0FPZ0IsQ0FBQSxDQUFoQixFQUFBLENBQUEsRUFBa0IsSUFBRjtDQUVmLFNBQUEsS0FBQTtTQUFBLEdBQUE7QUFBQSxDQUFBLFVBQUEsNENBQUE7MEJBQUE7Q0FDQyxDQUFFLE1BQUY7Q0FDQyxDQUFlLENBQWYsS0FBQSxFQUFBLEdBQThCO0NBQTlCLENBQ2UsR0FBZixLQUFBO0NBREEsQ0FFZSxNQUFmLEVBQUE7Q0FGQSxDQUdlLEdBSGYsS0FHQSxFQUFBLENBQThCO0NBSDlCLENBSWUsSUFKZixJQUlBLEdBQUE7Q0FMRCxTQUFBO0NBREQsTUFBQTtDQVFNLENBQUssQ0FBWCxFQUFBLElBQVcsSUFBWDtDQUFrQixFQUFELEdBQU8sQ0FBVixDQUFBLE9BQUE7Q0FBZCxNQUFXO0NBVlosSUFBZ0I7Q0FUakIsRUFBYTs7Q0FBYixFQXNCUyxJQUFULEVBQVM7Q0FDUixPQUFBO0NBQUEsRUFBSSxDQUFKLGNBQUk7Q0FBSixHQUNBLEVBQUEsRUFBQTtDQUNNLENBQUssQ0FBWCxFQUFBLElBQVcsRUFBWDtDQUFlLEtBQUQsT0FBQTtDQUFkLElBQVc7Q0F6QlosRUFzQlM7O0NBdEJUOztDQUhEIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjEyMDcxLCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvbG9hZGluZy5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsibmF2aWdhdGlvbiAgICAgICAgXHQ9IHJlcXVpcmUgJ2FwcC9jb250cm9sbGVycy9uYXZpZ2F0aW9uJ1xuT3BhY2l0eSBcdFx0XHQ9IHJlcXVpcmUgJ2FwcC91dGlscy9vcGFjaXR5J1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIExvYWRpbmdcblx0Zmlyc3RfdGltZTogb25cblx0Y29uc3RydWN0b3I6ICggQGRvbSApIC0+XG5cdFx0bmF2aWdhdGlvbi5vbiAnYmVmb3JlX2Rlc3Ryb3knLCA9PlxuXHRcdFx0YXBwLmJvZHkuYWRkQ2xhc3MoICdsb2FkaW5nJyApLnJlbW92ZUNsYXNzKCAnbG9hZGVkJyApXG5cdFx0XHRPcGFjaXR5LnNob3cgQGRvbSwgMTAwXG5cblx0XHRuYXZpZ2F0aW9uLm9uICdhZnRlcl9yZW5kZXInLCA9PiBcblx0XHRcdGlmIEBmaXJzdF90aW1lXG5cdFx0XHRcdGFwcC5ib2R5LmFkZENsYXNzICdmaXJzdF9sb2FkZWQnXG5cdFx0XHRcdEBmaXJzdF90aW1lID0gb2ZmXG5cdFx0XHRhcHAuYm9keS5yZW1vdmVDbGFzcyggJ2xvYWRpbmcnICkuYWRkQ2xhc3MoICdsb2FkZWQnIClcblx0XHRcdE9wYWNpdHkuaGlkZSBAZG9tIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsd0JBQUE7O0FBQUEsQ0FBQSxFQUFxQixJQUFBLEdBQXJCLGtCQUFxQjs7QUFDckIsQ0FEQSxFQUNhLElBQWIsWUFBYTs7QUFFYixDQUhBLEVBR3VCLEdBQWpCLENBQU47Q0FDQyxFQUFZLENBQVosTUFBQTs7Q0FDYSxDQUFBLENBQUEsY0FBRztDQUNmLE9BQUEsSUFBQTtDQUFBLEVBRGUsQ0FBRDtDQUNkLENBQUEsQ0FBZ0MsQ0FBaEMsS0FBZ0MsQ0FBdEIsTUFBVjtDQUNDLEVBQUcsQ0FBSyxFQUFSLEVBQUEsQ0FBQSxFQUFBO0NBQ1EsQ0FBVyxDQUFuQixDQUFBLENBQWMsRUFBUCxNQUFQO0NBRkQsSUFBZ0M7Q0FBaEMsQ0FJQSxDQUE4QixDQUE5QixLQUE4QixDQUFwQixJQUFWO0NBQ0MsR0FBRyxDQUFDLENBQUosSUFBQTtDQUNDLEVBQUcsQ0FBSyxJQUFSLE1BQUE7Q0FBQSxFQUNjLEVBQWIsR0FBRCxFQUFBO1FBRkQ7Q0FBQSxFQUdHLENBQUssRUFBUixFQUFBLENBQUEsRUFBQTtDQUNRLEVBQVIsQ0FBQSxDQUFjLEVBQVAsTUFBUDtDQUxELElBQThCO0NBTi9CLEVBQ2E7O0NBRGI7O0NBSkQifX0seyJvZmZzZXQiOnsibGluZSI6MTIxMDMsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9sb2dpbi5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiTmF2aWdhdGlvbiA9IHJlcXVpcmUgJ2FwcC9jb250cm9sbGVycy9uYXZpZ2F0aW9uJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIExvZ2luXG5cdGNvbnN0cnVjdG9yOiAoIEBkb20gKSAtPlxuXG5cdFx0dW5sZXNzIHdpbmRvdy5vcGVuZXI/XG5cdFx0XHRhcHAuYm9keS5yZW1vdmVDbGFzcyBcImxvZ2luX3BhZ2VcIlxuXHRcdFx0TmF2aWdhdGlvbi5nbyAnLydcblxuXHRcdCQoJyNwbGF5ZXInKS5oaWRlKClcblx0XHRcblx0XHRAdXNlcm5hbWUgPSBAZG9tLmZpbmQoICcudXNlcm5hbWUnIClcblx0XHRAcGFzc3dvcmQgPSBAZG9tLmZpbmQoICcucGFzc3dvcmQnIClcblxuXHRcdEBkb20uZmluZCggJy5mYWNlYm9vaycgKS5vbiAnY2xpY2snLCBAX2ZhY2Vib29rX2xvZ2luXG5cdFx0QGRvbS5maW5kKCAnLnNvdW5kY2xvdWQnICkub24gJ2NsaWNrJywgQF9zb3VuZGNsb3VkX2xvZ2luXG5cdFx0QGRvbS5maW5kKCAnLmdvb2dsZScgKS5vbiAnY2xpY2snLCBAX2dvb2dsZV9sb2dpblxuXG5cdFx0XG5cdFx0IyBAZG9tLmZpbmQoICcuc2lnbmluJyApLm9uICdjbGljaycsIEBfY3VzdG9tX2xvZ2luXG5cblx0XHQjIEBkb20uZmluZCggJ2lucHV0JyApLmtleXByZXNzIChldmVudCkgPT5cblx0XHQjIFx0aWYgZXZlbnQud2hpY2ggaXMgMTNcblx0XHQjIFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdCMgXHRcdEBfY3VzdG9tX2xvZ2luKClcblx0XHQjIFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcdFxuXG5cdF9mYWNlYm9va19sb2dpbjogKCApID0+XG5cdFx0bG9nIFwiW0xvZ2luXSBfZmFjZWJvb2tfbG9naW5cIlxuXG5cdF9zb3VuZGNsb3VkX2xvZ2luOiAoICkgPT5cblx0XHRsb2cgXCJbTG9naW5dIF9zb3VuZGNsb3VkX2xvZ2luXCJcblxuXHRfZ29vZ2xlX2xvZ2luOiAoICkgPT5cblx0XHRsb2cgXCJbTG9naW5dIF9nb29nbGVfbG9naW5cIlxuXG5cdCMgX2N1c3RvbV9sb2dpbjogKCApID0+XG5cdCMgXHRAZG9tLnJlbW92ZUNsYXNzIFwiZXJyb3JcIlxuXHQjIFx0aWYgQHVzZXJuYW1lLnZhbCgpLmxlbmd0aCA8PSAwIG9yIEBwYXNzd29yZC52YWwoKS5sZW5ndGggPD0gMFxuXHQjIFx0XHRsb2cgXCJbTG9naW5dIGVycm9yXCJcblx0IyBcdFx0QGRvbS5hZGRDbGFzcyBcImVycm9yXCJcblx0IyBcdFx0cmV0dXJuIGZhbHNlXG5cblx0IyBcdGRhdGE6XG5cdCMgXHRcdHVzZXJuYW1lOiBAdXNlcm5hbWUudmFsKClcblx0IyBcdFx0cGFzc3dvcmQ6IEBwYXNzd29yZC52YWwoKVxuXG5cdCMgXHRsb2cgXCJbTG9naW5dIHN1Ym1pdHRpbmcgZGF0YVwiLCBkYXRhXG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxhQUFBO0dBQUEsK0VBQUE7O0FBQUEsQ0FBQSxFQUFhLElBQUEsR0FBYixrQkFBYTs7QUFFYixDQUZBLEVBRXVCLEdBQWpCLENBQU47Q0FDYyxDQUFBLENBQUEsWUFBRztDQUVmLEVBRmUsQ0FBRDtDQUVkLG9EQUFBO0NBQUEsNERBQUE7Q0FBQSx3REFBQTtDQUFBLEdBQUEsaUJBQUE7Q0FDQyxFQUFHLENBQUssRUFBUixLQUFBLENBQUE7Q0FBQSxDQUNBLENBQUEsR0FBQSxJQUFVO01BRlg7Q0FBQSxHQUlBLEtBQUE7Q0FKQSxFQU1ZLENBQVosSUFBQSxHQUFZO0NBTlosRUFPWSxDQUFaLElBQUEsR0FBWTtDQVBaLENBU0EsQ0FBSSxDQUFKLEdBQUEsSUFBQSxJQUFBO0NBVEEsQ0FVQSxDQUFJLENBQUosR0FBQSxNQUFBLElBQUE7Q0FWQSxDQVdBLENBQUksQ0FBSixHQUFBLEVBQUEsSUFBQTtDQWJELEVBQWE7O0NBQWIsRUF5QmlCLE1BQUEsTUFBakI7Q0FDSyxFQUFKLFFBQUEsY0FBQTtDQTFCRCxFQXlCaUI7O0NBekJqQixFQTRCbUIsTUFBQSxRQUFuQjtDQUNLLEVBQUosUUFBQSxnQkFBQTtDQTdCRCxFQTRCbUI7O0NBNUJuQixFQStCZSxNQUFBLElBQWY7Q0FDSyxFQUFKLFFBQUEsWUFBQTtDQWhDRCxFQStCZTs7Q0EvQmY7O0NBSEQifX0seyJvZmZzZXQiOnsibGluZSI6MTIxNDQsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9wcm9maWxlLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJDbG91ZGluYXJ5ID0gcmVxdWlyZSAnYXBwL2NvbnRyb2xsZXJzL2Nsb3VkaW5hcnknXG50cmFuc2Zvcm0gID0gcmVxdWlyZSAnYXBwL3V0aWxzL2ltYWdlcy90cmFuc2Zvcm0nXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUHJvZmlsZSBcblx0ZWxlbWVudHM6IG51bGxcblx0Zm9ybV9iaW86IG51bGxcblxuXHQjIFRPRE86IHJlcGxhY2UgdGhpcyBmYWtlIGRhdGEgb2JqZWN0XG5cdHVzZXJfZGF0YSA6XG5cdFx0cHJvZmlsZV9waWN0dXJlOiBcIi9pbWFnZXMvcHJvZmlsZV9iaWcucG5nXCJcblx0XHRjb3Zlcl9waWN0dXJlOiBcIi9pbWFnZXMvaG9tZXBhZ2VfMi5qcGdcIlxuXHRcdGxvY2F0aW9uOiBcIkxvbmRvbiAtIFVLXCJcblx0XHRiaW86IFwiVGhvbWFzIEFtdW5kc2VuIGZyb20gT3Nsbywgbm93IGJhc2VkIGluIExvbmRvbiBoYXMgZnJvbSBhbiBlYXJseSBhZ2UgbG90cyBvZiBtdXNpY2FsIGluZmx1ZW5jZXMsIGV4cGVyaW1lbnRpbmcgZnJvbSBhY291c3RpYyBpbnN0cnVtZW50cyB0byBlbGVjdHJvbmljIG11c2ljIHByb2R1Y3Rpb24gYW5kIERKaW5nLjxici8+PGJyLz5IZSByZWxlYXNlZCBoaXMgZGVidXQgRVAg4oCcSSBGZWVs4oCdIG9uIEZ1c2lvbiByZWNvcmRpbmdzLCBzdWItbGFiZWwgb2YgRGogQ2VudGVyIFJlY29yZHMsIGFuZCBoYXMgc2luY2UgcmVsZWFzZWQgZnJlcXVlbnRseSBvbiBsYWJlbHMgc3VjaCBhczsgRG9iYXJhLCBTdXN1cnJvdXMgTXVzaWMsIEluY29nbml0dXMgUmVjb3JkaW5ncywgS29vbHdhdGVycyBhbmQgZ2FpbmVkIHN1cHBvcnQgZnJvbSB0aGUgbGlrZXMgb2YgQW1pbmUgRWRnZSwgU3RhY2V5IFB1bGxlbiwgRGV0bGVmLCBTbGFtLCBNYXJjIFZlZG8sIExvdmVyZG9zZSwgQXNobGV5IFdpbGQsIEpvYmUgYW5kIG1hbnkgbW9yZVwiXG5cdFx0bGlua3M6IFtcblx0XHRcdHt0eXBlOlwic3BvdGlmeVwiLCB1cmw6XCJodHRwOi8vc3BvdGlmeS5jb21cIn0sXG5cdFx0XHR7dHlwZTpcInNvdW5kY2xvdWRcIiwgdXJsOlwiaHR0cDovL3NvdW5kY2xvdWQuY29tXCJ9LFxuXHRcdFx0e3R5cGU6XCJmYWNlYm9va1wiLCB1cmw6XCJodHRwOi8vZmFjZWJvb2suY29tXCJ9XG5cdFx0XVxuXG5cdGNvbnN0cnVjdG9yOiAoIEBkb20gKSAtPlxuXG5cblxuXHRcdEBlbGVtZW50cyA9IFxuXHRcdFx0cHJvZmlsZV9waWN0dXJlOiBAZG9tLmZpbmQoICcucHJvZmlsZV9pbWFnZSBpbWcnIClcblx0XHRcdGNvdmVyX3BpY3R1cmU6IEBkb20uZmluZCggJy5jb3Zlcl9pbWFnZScgKVxuXHRcdFx0bG9jYXRpb246IEBkb20uZmluZCggJy5wcm9maWxlX2JpbyAubG9jYXRpb24nIClcblx0XHRcdGxvY2F0aW9uX2lucHV0OiBAZG9tLmZpbmQoICcubG9jYXRpb25faW5wdXQnIClcblx0XHRcdGJpbzogQGRvbS5maW5kKCAnLmJpbycgKVxuXHRcdFx0YmlvX2lucHV0OiBAZG9tLmZpbmQoICcuYmlvX2lucHV0JyApXG5cdFx0XHRsaW5rczogW1xuXHRcdFx0XHR7dHlwZTpcInNwb3RpZnlcIiwgZWw6QGRvbS5maW5kKCAnLnNwb3RpZnlfbGluaycgKX0sXG5cdFx0XHRcdHt0eXBlOlwic291bmRjbG91ZFwiLCBlbDpAZG9tLmZpbmQoICcuc291bmRjbG91ZF9saW5rJyApfSxcblx0XHRcdFx0e3R5cGU6XCJmYWNlYm9va1wiLCBlbDpAZG9tLmZpbmQoICcuZmFjZWJvb2tfbGluaycgKX1cblx0XHRcdF1cblx0XHRcdGxpbmtzX2lucHV0OiBbXG5cdFx0XHRcdHt0eXBlOlwic3BvdGlmeVwiLCBlbDpAZG9tLmZpbmQoICcuc3BvdGlmeV9pbnB1dCcgKX0sXG5cdFx0XHRcdHt0eXBlOlwic291bmRjbG91ZFwiLCBlbDpAZG9tLmZpbmQoICcuc291bmRjbG91ZF9pbnB1dCcgKX0sXG5cdFx0XHRcdHt0eXBlOlwiZmFjZWJvb2tcIiwgZWw6QGRvbS5maW5kKCAnLmZhY2Vib29rX2lucHV0JyApfVxuXHRcdFx0XVxuXG5cblx0XHRAZm9ybV9iaW8gPSBAZG9tLmZpbmQoICcucHJvZmlsZV9mb3JtJyApXG5cdFx0QGZvcm1fYmlvLm9uICdzdWJtaXQnLCAoZSkgLT4gZS5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0QGZvcm1fYmlvLmZpbmQoICdpbnB1dCcgKS5rZXl1cCAoZSkgPT5cblx0XHRcdGlmIGUua2V5Q29kZSBpcyAxM1xuXHRcdFx0XHRAcmVhZF9tb2RlKClcblxuXHRcdHJlZiA9IEBcblxuXHRcdEBkb20uZmluZCggJ1tkYXRhLXByb2ZpbGVdJyApLm9uICdjbGljaycsIC0+XG5cblx0XHRcdHZhbHVlID0gJChAKS5kYXRhICdwcm9maWxlJ1xuXG5cdFx0XHRzd2l0Y2ggdmFsdWVcblx0XHRcdFx0d2hlbiAnc2V0LXdyaXRlLW1vZGUnXG5cdFx0XHRcdFx0ZG8gcmVmLndyaXRlX21vZGVcblx0XHRcdFx0d2hlbiAnc2V0LXJlYWQtbW9kZSdcblx0XHRcdFx0XHRkbyByZWYucmVhZF9tb2RlXG5cblxuXHRcdEB1cGRhdGVfZG9tX2Zyb21fdXNlcl9kYXRhKClcblxuXHRcdCQoICcjcm9vbV9tb2RhbCcgKS5kYXRhKCAnbW9kYWwtY2xvc2UnLCB0cnVlIClcblxuXHRcdHZpZXcub25jZSAnYmluZGVkJywgQG9uX3ZpZXdzX2JpbmRlZFxuXG5cblxuXHRvbl92aWV3c19iaW5kZWQ6ID0+XG5cblx0XHRsb2cgXCJbUHJvZmlsZV0gb25fdmlld3NfYmluZGVkXCJcblx0XHQjIExpc3RlbiB0byBpbWFnZXMgdXBsb2FkIGV2ZW50c1xuXHRcdGNoYW5nZV9jb3Zlcl91cGxvYWRlciA9IHZpZXcuZ2V0X2J5X2RvbSBAZG9tLmZpbmQoICcuY2hhbmdlX2NvdmVyJyApXG5cblx0XHRpZiBub3QgY2hhbmdlX2NvdmVyX3VwbG9hZGVyXG5cdFx0XHRsb2cgXCJbUHJvZmlsZV0gdmlld3Mgbm90IGJpbmRlZCB5ZXQhISFcIlxuXHRcdFx0cmV0dXJuXG5cblx0XHRjaGFuZ2VfY292ZXJfdXBsb2FkZXIub24gJ2NvbXBsZXRlZCcsIChkYXRhKSA9PlxuXG5cdFx0XHRAdXNlcl9kYXRhLmNvdmVyX3BpY3R1cmUgPSBkYXRhLnJlc3VsdC51cmxcblxuXHRcdFx0QGRvbS5maW5kKCAnLmNvdmVyX2ltYWdlJyApLmNzc1xuXHRcdFx0XHQnYmFja2dyb3VuZC1pbWFnZSc6IFwidXJsKCN7ZGF0YS5yZXN1bHQudXJsfSlcIlxuXG5cdFx0Y2hhbmdlX3BpY3R1cmVfdXBsb2FkZXIgPSB2aWV3LmdldF9ieV9kb20gQGRvbS5maW5kKCAnLnByb2ZpbGVfaW1hZ2UnIClcblx0XHRjaGFuZ2VfcGljdHVyZV91cGxvYWRlci5vbiAnY29tcGxldGVkJywgKGRhdGEpID0+XG5cblx0XHRcdEB1c2VyX2RhdGEucHJvZmlsZV9waWN0dXJlID0gZGF0YS5yZXN1bHQudXJsXG5cblx0XHRcdHVybCA9IHRyYW5zZm9ybS5hdmF0YXIgZGF0YS5yZXN1bHQudXJsXG5cblx0XHRcdEBkb20uZmluZCggJ2ltZycgKS5hdHRyICdzcmMnLCB1cmxcblxuXG5cdCMgT3BlbiB0aGUgd3JpdGUvZWRpdCBtb2RlXG5cdHdyaXRlX21vZGUgOiAtPlxuXHRcdGFwcC5ib2R5LmFkZENsYXNzICd3cml0ZV9tb2RlJ1xuXG5cdFxuXHRcblx0XG5cdHJlYWRfbW9kZSA6IC0+XG5cdFx0IyAtIFVwZGF0ZSB0aGUgdXNlcl9kYXRhIGZyb20gdGhlIGlucHV0c1xuXHRcdEB1cGRhdGVfdXNlcl9kYXRhX2Zyb21fZG9tKClcblxuXHRcdCMgLSBVcGRhdGUgdGhlIGRvbSAobGFiZWxzIGFuZCBpbnB1dHMpIGZyb20gdGhlIHVzZXJfZGF0YVxuXHRcdCMgXHRUaGlzIGFjdGlvbiBpcyBtb3N0bHkgZG9uZSBmb3IgdXBkYXRpbmcgbGFiZWxzIChpbnB1dHMgYXJlIGFscmVhZHkgdXBkYXRlZClcblx0XHRAdXBkYXRlX2RvbV9mcm9tX3VzZXJfZGF0YSgpXG5cblx0XHQjIC0gVE9ETzogU2VuZCB0aGUgZGF0YSB0byB0aGUgYmFja2VuZFxuXHRcdEBzZW5kX3RvX3NlcnZlcigpXG5cblx0XHQjIC0gY2xvc2UgdGhlIHdyaXRlL2VkaXQgbW9kZSBhbmQgc3dpdGNoIHRvIHJlYWQgb25seSBtb2RlXG5cdFx0YXBwLmJvZHkucmVtb3ZlQ2xhc3MgJ3dyaXRlX21vZGUnXG5cblxuXG5cdHVwZGF0ZV91c2VyX2RhdGFfZnJvbV9kb206IC0+XG5cblx0XHQjIC0gVE9ETzogVXBkYXRlIHRoZSBpbWFnZXNcblxuXHRcdEB1c2VyX2RhdGEubG9jYXRpb24gPSBAZWxlbWVudHMubG9jYXRpb25faW5wdXQudmFsKClcblx0XHRAdXNlcl9kYXRhLmJpbyA9IEBlbGVtZW50cy5iaW9faW5wdXQudmFsKClcblxuXHRcdEB1c2VyX2RhdGEubGlua3MgPSBbXVxuXHRcdGZvciBsLCBpIGluIEBlbGVtZW50cy5saW5rc19pbnB1dFxuXHRcdFx0QHVzZXJfZGF0YS5saW5rcy5wdXNoXG5cdFx0XHRcdHR5cGU6IGwudHlwZVxuXHRcdFx0XHR1cmw6IGwuZWwudmFsKClcblxuXG5cdHVwZGF0ZV9kb21fZnJvbV91c2VyX2RhdGEgOiAtPlxuXG5cdFx0ZSA9IEBlbGVtZW50c1xuXHRcdGQgPSBAdXNlcl9kYXRhXG5cblx0XHRlLnByb2ZpbGVfcGljdHVyZS5jc3MgJ2JhY2tncm91bmQtaW1hZ2UnLCBkLnByb2ZpbGVfcGljdHVyZVxuXHRcdGUuY292ZXJfcGljdHVyZS5jc3MgJ2JhY2tncm91bmQtaW1hZ2UnLCBkLmNvdmVyX3BpY3R1cmVcblxuXHRcdGUubG9jYXRpb24uaHRtbCBkLmxvY2F0aW9uXG5cdFx0ZS5sb2NhdGlvbl9pbnB1dC52YWwgZC5sb2NhdGlvblxuXG5cdFx0ZS5iaW8uaHRtbCBkLmJpb1xuXHRcdGUuYmlvX2lucHV0LnZhbCBAaHRtbF90b190ZXh0YXJlYSggZC5iaW8gKVxuXG5cdFx0Zm9yIGxpbmssIGkgaW4gZC5saW5rc1xuXHRcdFx0ZS5saW5rc1sgaSBdLmVsLmF0dHIgJ2hyZWYnLCBsaW5rLnVybFxuXHRcdFx0ZS5saW5rc19pbnB1dFsgaSBdLmVsLnZhbCBsaW5rLnVybFxuXG5cdGh0bWxfdG9fdGV4dGFyZWEgOiAoIHN0ciApIC0+XG5cdFx0dG9fZmluZCA9IFwiPGJyLz5cIlxuXHRcdHRvX3JlcGxhY2UgPSBcIlxcblwiXG5cdFx0cmUgPSBuZXcgUmVnRXhwIHRvX2ZpbmQsICdnJ1xuXG5cdFx0cmV0dXJuIHN0ci5yZXBsYWNlIHJlLCB0b19yZXBsYWNlXG5cblx0c2VuZF90b19zZXJ2ZXI6IC0+XG5cdFx0bG9nIFwiW1Byb2ZpbGVdIHNhdmVcIiwgQHVzZXJfZGF0YVxuXHRcdHJldHVyblxuXHRcdCQucG9zdCBcIi9hcGkvdjEvdXNlci9zYXZlXCIsIEB1c2VyX2RhdGEsIChkYXRhKSA9PlxuXHRcdFx0bG9nIFwiW1Byb2ZpbGVdIHNlcnZlciByZXNwb25zZVwiLCBkYXRhXG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSwwQkFBQTtHQUFBLCtFQUFBOztBQUFBLENBQUEsRUFBYSxJQUFBLEdBQWIsa0JBQWE7O0FBQ2IsQ0FEQSxFQUNhLElBQUEsRUFBYixtQkFBYTs7QUFFYixDQUhBLEVBR3VCLEdBQWpCLENBQU47Q0FDQyxFQUFVLENBQVYsSUFBQTs7Q0FBQSxFQUNVLENBRFYsSUFDQTs7Q0FEQSxFQUtDLE1BREQ7Q0FDQyxDQUFpQixFQUFqQixXQUFBLFVBQUE7Q0FBQSxDQUNlLEVBQWYsU0FBQSxXQURBO0NBQUEsQ0FFVSxFQUFWLElBQUEsS0FGQTtDQUFBLENBR0ssQ0FBTCxDQUFBLHFnQkFIQTtDQUFBLENBSU8sRUFBUCxDQUFBO09BQ0M7Q0FBQSxDQUFNLEVBQUwsSUFBQSxDQUFEO0NBQUEsQ0FBcUIsQ0FBSixLQUFBLFlBQWpCO0VBQ0EsTUFGTTtDQUVOLENBQU0sRUFBTCxJQUFBLElBQUQ7Q0FBQSxDQUF3QixDQUFKLEtBQUEsZUFBcEI7RUFDQSxNQUhNO0NBR04sQ0FBTSxFQUFMLElBQUEsRUFBRDtDQUFBLENBQXNCLENBQUosS0FBQSxhQUFsQjtRQUhNO01BSlA7Q0FMRCxHQUFBOztDQWVhLENBQUEsQ0FBQSxjQUFHO0NBSWYsRUFBQSxLQUFBO09BQUEsS0FBQTtDQUFBLEVBSmUsQ0FBRDtDQUlkLHdEQUFBO0NBQUEsRUFDQyxDQURELElBQUE7Q0FDQyxDQUFpQixDQUFJLENBQUgsRUFBbEIsU0FBQSxLQUFpQjtDQUFqQixDQUNlLENBQUksQ0FBSCxFQUFoQixPQUFBLENBQWU7Q0FEZixDQUVVLENBQUksQ0FBSCxFQUFYLEVBQUEsZ0JBQVU7Q0FGVixDQUdnQixDQUFJLENBQUgsRUFBakIsUUFBQSxHQUFnQjtDQUhoQixDQUlLLENBQUwsQ0FBTSxFQUFOO0NBSkEsQ0FLVyxDQUFJLENBQUgsRUFBWixHQUFBLEdBQVc7Q0FMWCxDQU1PLEdBQVAsQ0FBQTtTQUNDO0NBQUEsQ0FBTSxFQUFMLEtBQUQsQ0FBQztDQUFELENBQWlCLENBQU8sQ0FBSCxNQUFKLEtBQUc7RUFDcEIsUUFGTTtDQUVOLENBQU0sRUFBTCxNQUFBLEVBQUQ7Q0FBQSxDQUFvQixDQUFPLENBQUgsTUFBSixRQUFHO0VBQ3ZCLFFBSE07Q0FHTixDQUFNLEVBQUwsTUFBQTtDQUFELENBQWtCLENBQU8sQ0FBSCxNQUFKLE1BQUc7VUFIZjtRQU5QO0NBQUEsQ0FXYSxJQUFiLEtBQUE7U0FDQztDQUFBLENBQU0sRUFBTCxLQUFELENBQUM7Q0FBRCxDQUFpQixDQUFPLENBQUgsTUFBSixNQUFHO0VBQ3BCLFFBRlk7Q0FFWixDQUFNLEVBQUwsTUFBQSxFQUFEO0NBQUEsQ0FBb0IsQ0FBTyxDQUFILE1BQUosU0FBRztFQUN2QixRQUhZO0NBR1osQ0FBTSxFQUFMLE1BQUE7Q0FBRCxDQUFrQixDQUFPLENBQUgsTUFBSixPQUFHO1VBSFQ7UUFYYjtDQURELEtBQUE7Q0FBQSxFQW1CWSxDQUFaLElBQUEsT0FBWTtDQW5CWixDQW9CQSxDQUF1QixDQUF2QixJQUFTLENBQWU7Q0FBTyxZQUFELENBQUE7Q0FBOUIsSUFBdUI7Q0FwQnZCLEVBcUJnQyxDQUFoQyxDQUFBLEVBQUEsQ0FBUyxDQUF3QjtDQUNoQyxDQUFBLEVBQUcsQ0FBYSxDQUFoQixDQUFHO0NBQ0QsSUFBQSxJQUFELE1BQUE7UUFGOEI7Q0FBaEMsSUFBZ0M7Q0FyQmhDLEVBeUJBLENBQUE7Q0F6QkEsQ0EyQkEsQ0FBSSxDQUFKLEdBQUEsRUFBMEMsT0FBMUM7Q0FFQyxJQUFBLEtBQUE7Q0FBQSxFQUFRLENBQUEsQ0FBUixDQUFBLEdBQVE7Q0FFUixJQUFBLFNBQU87Q0FBUCxZQUNNLEdBRE47Q0FFUyxFQUFELE9BQU4sT0FBRztDQUZMLFlBR00sRUFITjtDQUlTLEVBQUQsTUFBTixRQUFHO0NBSkwsTUFKeUM7Q0FBMUMsSUFBMEM7Q0EzQjFDLEdBc0NBLHFCQUFBO0NBdENBLENBd0N3QyxFQUF4QyxTQUFBO0NBeENBLENBMENvQixFQUFwQixJQUFBLE9BQUE7Q0E3REQsRUFlYTs7Q0FmYixFQWlFaUIsTUFBQSxNQUFqQjtDQUVDLE9BQUEsc0NBQUE7T0FBQSxLQUFBO0NBQUEsRUFBQSxDQUFBLHVCQUFBO0NBQUEsRUFFd0IsQ0FBeEIsTUFBd0IsS0FBZ0IsTUFBeEM7QUFFTyxDQUFQLEdBQUEsaUJBQUE7Q0FDQyxFQUFBLEdBQUEsNkJBQUE7Q0FDQSxXQUFBO01BTkQ7Q0FBQSxDQVFBLENBQXNDLENBQXRDLEtBQXVDLEVBQXZDLFVBQXFCO0NBRXBCLEVBQTJCLENBQUksQ0FBOUIsQ0FBRCxHQUFVLElBQVY7Q0FFQyxFQUFHLENBQUosQ0FBQyxRQUFELENBQUE7Q0FDQyxDQUFxQixDQUFLLENBQUksRUFBVCxFQUFyQixVQUFBO0NBTG9DLE9BSXJDO0NBSkQsSUFBc0M7Q0FSdEMsRUFlMEIsQ0FBMUIsTUFBMEIsTUFBZ0IsT0FBMUM7Q0FDd0IsQ0FBeEIsQ0FBd0MsQ0FBQSxLQUFDLEVBQXpDLFlBQXVCO0NBRXRCLEVBQUEsT0FBQTtDQUFBLEVBQTZCLENBQUksQ0FBaEMsQ0FBRCxHQUFVLE1BQVY7Q0FBQSxFQUVBLENBQTJCLEVBQTNCLEdBQWU7Q0FFZCxDQUE4QixDQUEzQixDQUFKLENBQUMsUUFBRDtDQU5ELElBQXdDO0NBbkZ6QyxFQWlFaUI7O0NBakVqQixFQTZGYSxNQUFBLENBQWI7Q0FDSyxFQUFELENBQUssSUFBUixHQUFBLENBQUE7Q0E5RkQsRUE2RmE7O0NBN0ZiLEVBbUdZLE1BQVo7Q0FFQyxHQUFBLHFCQUFBO0NBQUEsR0FJQSxxQkFBQTtDQUpBLEdBT0EsVUFBQTtDQUdJLEVBQUQsQ0FBSyxPQUFSLENBQUE7Q0EvR0QsRUFtR1k7O0NBbkdaLEVBbUgyQixNQUFBLGdCQUEzQjtDQUlDLE9BQUEsc0JBQUE7Q0FBQSxFQUFzQixDQUF0QixJQUFBLENBQVUsS0FBb0M7Q0FBOUMsRUFDQSxDQUFBLElBQTBCLENBQWhCO0NBRFYsQ0FBQSxDQUdtQixDQUFuQixDQUFBLElBQVU7Q0FDVjtDQUFBO1VBQUEseUNBQUE7bUJBQUE7Q0FDQyxHQUFDLENBQWUsSUFBTjtDQUNULENBQU0sRUFBTixJQUFBO0NBQUEsQ0FDSyxDQUFMLEtBQUE7Q0FGRCxPQUFBO0NBREQ7cUJBUjBCO0NBbkgzQixFQW1IMkI7O0NBbkgzQixFQWlJNEIsTUFBQSxnQkFBNUI7Q0FFQyxPQUFBLCtCQUFBO0NBQUEsRUFBSSxDQUFKLElBQUE7Q0FBQSxFQUNJLENBQUosS0FEQTtDQUFBLENBRzBDLENBQTFDLENBQUEsV0FBaUIsR0FBakI7Q0FIQSxDQUl3QyxDQUF4QyxDQUFBLFNBQWUsS0FBZjtDQUpBLEdBTUEsSUFBVTtDQU5WLEVBT0EsQ0FBQSxJQUFBLE1BQWdCO0NBUGhCLEVBU0ssQ0FBTDtDQVRBLEVBVUEsQ0FBQSxLQUFXLE9BQUs7Q0FFaEI7Q0FBQTtVQUFBLHlDQUFBO3NCQUFBO0NBQ0MsQ0FBZSxDQUFmLENBQUEsQ0FBUyxDQUFUO0NBQUEsQ0FDcUIsQ0FBckIsQ0FBOEIsT0FBZjtDQUZoQjtxQkFkMkI7Q0FqSTVCLEVBaUk0Qjs7Q0FqSTVCLEVBbUptQixNQUFFLE9BQXJCO0NBQ0MsT0FBQSxlQUFBO0NBQUEsRUFBVSxDQUFWLEdBQUE7Q0FBQSxFQUNhLENBQWIsTUFBQTtDQURBLENBRUEsQ0FBUyxDQUFULEVBQVMsQ0FBQTtDQUVULENBQU8sQ0FBRyxJQUFILEdBQUEsQ0FBQTtDQXhKUixFQW1KbUI7O0NBbkpuQixFQTBKZ0IsTUFBQSxLQUFoQjtDQUNDLE9BQUEsSUFBQTtDQUFBLENBQXNCLENBQXRCLENBQUEsS0FBQSxPQUFBO0NBQ0EsU0FBQTtDQUNDLENBQTJCLENBQVksQ0FBeEMsS0FBQSxFQUFBLFFBQUE7Q0FDSyxDQUE2QixDQUFqQyxDQUFBLFNBQUEsY0FBQTtDQURELElBQXdDO0NBN0p6QyxFQTBKZ0I7O0NBMUpoQjs7Q0FKRCJ9fSx7Im9mZnNldCI6eyJsaW5lIjoxMjMzMiwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL3Jvb20uY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIkwgICAgICAgICAgID0gcmVxdWlyZSAnYXBpL2xvb3BjYXN0L2xvb3BjYXN0J1xubmF2aWdhdGlvbiAgPSByZXF1aXJlICdhcHAvY29udHJvbGxlcnMvbmF2aWdhdGlvbidcblN0cmluZ3MgICAgID0gcmVxdWlyZSAnYXBwL3V0aWxzL3N0cmluZydcbnVzZXJfY29udHJvbGxlciA9IHJlcXVpcmUgJ2FwcC9jb250cm9sbGVycy91c2VyJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFJvb21cblx0Y29uc3RydWN0b3I6ICggQGRvbSApIC0+XG5cdFx0dmlldy5vbmNlICdiaW5kZWQnLCBAb25fdmlld19iaW5kZWRcblx0XHR1c2VyX2NvbnRyb2xsZXIub24gJ3VzZXI6bG9nZ2VkJywgQG9uX3VzZXJfbG9nZ2VkXG5cdFx0dXNlcl9jb250cm9sbGVyLm9uICd1c2VyOnVubG9nZ2VkJywgQG9uX3VzZXJfdW5sb2dnZWRcblxuXHRcdEBlbGVtZW50cyA9IFxuXHRcdFx0dGl0bGUgICAgICAgOiBAZG9tLmZpbmQgJy5jb3ZlciAubmFtZSdcblx0XHRcdGdlbnJlICAgICAgIDogQGRvbS5maW5kICcuY292ZXIgLmdlbnJlcydcblx0XHRcdGxvY2F0aW9uICAgIDogQGRvbS5maW5kICcuY292ZXIgLmxvY2F0aW9uJ1xuXHRcdFx0Y292ZXIgICAgICAgOiBAZG9tLmZpbmQgJy5jb3ZlciAuY292ZXJfaW1hZ2UnXG5cdFx0XHRkZXNjcmlwdGlvbiA6IEBkb20uZmluZCAnLmNoYXRfaGVhZGVyIHAnXG5cblx0XHRpZiBTdHJpbmdzLmlzX2VtcHR5KCBAZWxlbWVudHMudGl0bGUuaHRtbCgpIClcblx0XHRcdEBlbGVtZW50cy50aXRsZS5hZGRDbGFzcyAnaGlkZGVuJ1xuXG5cdFx0aWYgU3RyaW5ncy5pc19lbXB0eSggQGVsZW1lbnRzLmdlbnJlLmh0bWwoKSApXG5cdFx0XHRAZWxlbWVudHMuZ2VucmUuYWRkQ2xhc3MgJ2hpZGRlbidcblxuXHRcdGlmIFN0cmluZ3MuaXNfZW1wdHkoIEBlbGVtZW50cy5sb2NhdGlvbi5odG1sKCkgKVxuXHRcdFx0QGVsZW1lbnRzLmxvY2F0aW9uLmFkZENsYXNzICdoaWRkZW4nXG5cblxuXG5cdG9uX3ZpZXdfYmluZGVkOiAoICkgPT5cblx0XHRAbW9kYWwgPSB2aWV3LmdldF9ieV9kb20gJyNyb29tX21vZGFsJ1xuXHRcdEBtb2RhbC5vbiAnaW5wdXQ6Y2hhbmdlZCcsIEBvbl9pbnB1dF9jaGFuZ2VkXG5cdFx0QG1vZGFsLm9uICdzdWJtaXQnLCBAb25fbW9kYWxfc3VibWl0XG5cblx0XHRpZiBAaXNfY3JlYXRlX3BhZ2UoKVxuXHRcdFx0QG1vZGFsLm9wZW4oKVxuXHRcdFxuXG5cdG9uX2lucHV0X2NoYW5nZWQ6ICggZGF0YSApID0+XG5cdFx0c3dpdGNoIGRhdGEubmFtZVxuXHRcdFx0d2hlbiAndGl0bGUnLCAnZ2VucmUnLCAnbG9jYXRpb24nLCAnZGVzY3JpcHRpb24nXG5cdFx0XHRcdEBlbGVtZW50c1sgZGF0YS5uYW1lIF0uaHRtbCBkYXRhLnZhbHVlXG5cblx0XHRcdFx0aWYgZGF0YS52YWx1ZS5sZW5ndGggPiAwXG5cdFx0XHRcdFx0QGVsZW1lbnRzWyBkYXRhLm5hbWUgXS5yZW1vdmVDbGFzcyAnaGlkZGVuJ1xuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0QGVsZW1lbnRzWyBkYXRhLm5hbWUgXS5hZGRDbGFzcyAnaGlkZGVuJ1xuXHRcdFx0d2hlbiAnY292ZXInXG5cdFx0XHRcdEBlbGVtZW50c1sgZGF0YS5uYW1lIF0uY3NzXG5cdFx0XHRcdFx0J2JhY2tncm91bmQtaW1hZ2UnOiBcInVybCgje2RhdGEudmFsdWUuc2VjdXJlX3VybH0pXCJcblxuXG5cdG9uX21vZGFsX3N1Ym1pdDogKCBkYXRhICkgPT5cblx0XHRsb2cgXCJbUm9vbV0gb25fbW9kYWxfc3VibWl0XCIsIGRhdGFcblxuXHRcdEBtb2RhbC5oaWRlX21lc3NhZ2UoKVxuXHRcdEBtb2RhbC5zaG93X2xvYWRpbmcoKVxuXG5cdFx0bSA9IEBtb2RhbFxuXG5cdFx0TC5yb29tcy5jcmVhdGUgZGF0YSwgKCBlcnJvciwgcm9vbSApIC0+XG5cblx0XHRcdGlmIGVycm9yXG5cblx0XHRcdFx0bXNnID0gXCJFcnJvci4gVHJ5IGFnYWluLlwiXG5cdFx0XHRcdGlmIGVycm9yIGlzIFwiY2FudF9oYXZlX3R3b19saXZlX3Jvb21zX3dpdGhfc2FtZV91cmxcIlxuXHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IgXCJDYW50IGhhdmUgdHdvIGxpdmUgcm9vbXMgd2l0aCBzYW1lIHVybFwiXG5cdFx0XHRcdFx0bXNnID0gXCJDYW50IGhhdmUgdHdvIGxpdmUgcm9vbXMgd2l0aCBzYW1lIHVybFwiXG5cdFx0XHRcdG0uaGlkZV9sb2FkaW5nKClcblx0XHRcdFx0bS5zaG93X21lc3NhZ2UgbXNnXG5cdFx0XHRcdHJldHVybiBjb25zb2xlLmVycm9yIGVycm9yXG5cblx0XHRcdGRlbGF5IDEwMDAsID0+XG5cblx0XHRcdFx0bmF2aWdhdGlvbi5nb19zaWxlbnQgXCIvI3tyb29tLnVybH1cIlxuXG5cdFx0XHRcdEBjaGVja19ndWVzdCgpXG5cblx0XHRcdFx0bS5jbG9zZSgpXG5cblx0b25fdXNlcl9sb2dnZWQ6ICggZGF0YSApID0+XG5cdFx0QGNoZWNrX2d1ZXN0KClcblxuXHRvbl91c2VyX3VubG9nZ2VkOiAoIGRhdGEgKSA9PlxuXHRcdEBjaGVja19ndWVzdCgpXG5cblxuXHRjaGVja19ndWVzdDogKCApIC0+XG5cblx0XHQjIyNcblx0XHRJZiB0aGUgdXJsIHBhdGggc3RhcnRzIHdpdGggL3VzZXJuYW1lLCBcblx0XHR0aGVuIHRoZSB1c2VyIGlzIG5vdCBhIGd1ZXN0XG5cdFx0IyMjXG5cdFx0aWYgQGlzX2d1ZXN0KClcblx0XHRcdGFwcC5ib2R5LmFkZENsYXNzICdndWVzdCdcblx0XHRlbHNlXG5cdFx0XHRhcHAuYm9keS5yZW1vdmVDbGFzcyAnZ3Vlc3QnXHRcdFxuXHRcdFx0IyBhcHBjYXN0LmNvbm5lY3QoKVxuXG5cdGlzX2d1ZXN0OiAoICkgLT5cblx0XHR1ID0gdXNlcl9jb250cm9sbGVyLmdldF91c2VyKClcblx0XHRndWVzdCA9IGxvY2F0aW9uLnBhdGhuYW1lLmluZGV4T2YoIFwiLyN7dS51c2VybmFtZX1cIiApIGlzbnQgMFxuXG5cdGlzX2NyZWF0ZV9wYWdlOiAoICkgLT5cblx0XHRsb2NhdGlvbi5wYXRobmFtZSBpcyAnL3Jvb21zL2NyZWF0ZSdcblxuXHRkZXN0cm95OiAtPlxuXHRcdHVzZXJfY29udHJvbGxlci5vZmYgJ3VzZXI6bG9nZ2VkJywgQG9uX3VzZXJfbG9nZ2VkXG5cdFx0dXNlcl9jb250cm9sbGVyLm9mZiAndXNlcjp1bmxvZ2dlZCcsIEBvbl91c2VyX3VubG9nZ2VkXG5cblx0XHRcblx0XHRcblx0XHQiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSx5Q0FBQTtHQUFBLCtFQUFBOztBQUFBLENBQUEsRUFBYyxJQUFBLGdCQUFBOztBQUNkLENBREEsRUFDYyxJQUFBLEdBQWQsa0JBQWM7O0FBQ2QsQ0FGQSxFQUVjLElBQWQsV0FBYzs7QUFDZCxDQUhBLEVBR2tCLElBQUEsUUFBbEIsT0FBa0I7O0FBRWxCLENBTEEsRUFLdUIsR0FBakIsQ0FBTjtDQUNjLENBQUEsQ0FBQSxXQUFHO0NBQ2YsRUFEZSxDQUFEO0NBQ2QsMERBQUE7Q0FBQSxzREFBQTtDQUFBLHdEQUFBO0NBQUEsMERBQUE7Q0FBQSxzREFBQTtDQUFBLENBQW9CLEVBQXBCLElBQUEsTUFBQTtDQUFBLENBQ0EsRUFBQSxTQUFBLENBQUEsQ0FBZTtDQURmLENBRUEsRUFBQSxXQUFlLENBQWY7Q0FGQSxFQUtDLENBREQsSUFBQTtDQUNDLENBQWMsQ0FBSSxDQUFILENBQWYsQ0FBQSxRQUFjO0NBQWQsQ0FDYyxDQUFJLENBQUgsQ0FBZixDQUFBLFVBQWM7Q0FEZCxDQUVjLENBQUksQ0FBSCxFQUFmLEVBQUEsVUFBYztDQUZkLENBR2MsQ0FBSSxDQUFILENBQWYsQ0FBQSxlQUFjO0NBSGQsQ0FJYyxDQUFJLENBQUgsRUFBZixLQUFBLEtBQWM7Q0FUZixLQUFBO0NBV0EsR0FBQSxDQUFvQyxFQUExQixDQUFQO0NBQ0YsR0FBQyxDQUFjLENBQWYsRUFBUztNQVpWO0NBY0EsR0FBQSxDQUFvQyxFQUExQixDQUFQO0NBQ0YsR0FBQyxDQUFjLENBQWYsRUFBUztNQWZWO0NBaUJBLEdBQUEsR0FBVSxDQUFQO0NBQ0YsR0FBQyxFQUFELEVBQVM7TUFuQkU7Q0FBYixFQUFhOztDQUFiLEVBdUJnQixNQUFBLEtBQWhCO0NBQ0MsRUFBUyxDQUFULENBQUEsS0FBUyxHQUFBO0NBQVQsQ0FDQSxFQUFBLENBQU0sVUFBTixDQUFBO0NBREEsQ0FFQSxFQUFBLENBQU0sR0FBTixPQUFBO0NBRUEsR0FBQSxVQUFHO0NBQ0QsR0FBQSxDQUFLLFFBQU47TUFOYztDQXZCaEIsRUF1QmdCOztDQXZCaEIsRUFnQ2tCLENBQUEsS0FBRSxPQUFwQjtDQUNDLEdBQVcsUUFBSjtDQUFQLE1BQUEsSUFDTTtDQUROLE1BQUEsSUFDZTtDQURmLFNBQUEsQ0FDd0I7Q0FEeEIsVUFDb0MsRUFEcEM7Q0FFRSxHQUFDLENBQUQsR0FBQTtDQUVBLEVBQXVCLENBQXBCLENBQVUsQ0FBVixFQUFIO0NBQ0UsR0FBQSxJQUFVLEdBQVgsTUFBQTtNQURELElBQUE7Q0FHRSxHQUFBLElBQVUsU0FBWDtVQVBIO0NBQ29DO0NBRHBDLE1BQUEsSUFRTTtDQUNILEVBQUQsQ0FBQyxJQUFVLE9BQVg7Q0FDQyxDQUFxQixDQUFLLENBQUksQ0FBTSxDQUFmLElBQXJCLFFBQUE7Q0FWSCxTQVNFO0NBVEYsSUFEaUI7Q0FoQ2xCLEVBZ0NrQjs7Q0FoQ2xCLEVBOENpQixDQUFBLEtBQUUsTUFBbkI7Q0FDQyxPQUFBO0NBQUEsQ0FBOEIsQ0FBOUIsQ0FBQSxvQkFBQTtDQUFBLEdBRUEsQ0FBTSxPQUFOO0NBRkEsR0FHQSxDQUFNLE9BQU47Q0FIQSxFQUtJLENBQUosQ0FMQTtDQU9DLENBQW9CLENBQUEsQ0FBckIsQ0FBTyxDQUFQLEdBQXVCLEVBQXZCO0NBRUMsRUFBQSxPQUFBO1NBQUEsR0FBQTtDQUFBLEdBQUcsQ0FBSCxDQUFBO0NBRUMsRUFBQSxLQUFBLFdBQUE7Q0FDQSxHQUFHLENBQUEsR0FBSCxnQ0FBQTtDQUNDLElBQUEsRUFBTyxHQUFQLDhCQUFBO0NBQUEsRUFDQSxPQUFBLDhCQURBO1VBRkQ7Q0FBQSxPQUlBLElBQUE7Q0FKQSxFQUtBLEtBQUEsSUFBQTtDQUNBLElBQU8sRUFBTyxRQUFQO1FBUlI7Q0FVTSxDQUFNLENBQUEsQ0FBWixDQUFBLElBQVksSUFBWjtDQUVDLEVBQXNCLENBQU0sSUFBNUIsQ0FBQSxDQUFVO0NBQVYsSUFFQyxHQUFELEdBQUE7Q0FFQyxJQUFELFVBQUE7Q0FORCxNQUFZO0NBWmIsSUFBcUI7Q0F0RHRCLEVBOENpQjs7Q0E5Q2pCLEVBMEVnQixDQUFBLEtBQUUsS0FBbEI7Q0FDRSxHQUFBLE9BQUQ7Q0EzRUQsRUEwRWdCOztDQTFFaEIsRUE2RWtCLENBQUEsS0FBRSxPQUFwQjtDQUNFLEdBQUEsT0FBRDtDQTlFRCxFQTZFa0I7O0NBN0VsQixFQWlGYSxNQUFBLEVBQWI7Q0FFQzs7OztDQUFBO0NBSUEsR0FBQSxJQUFHO0NBQ0UsRUFBRCxDQUFLLEdBQVIsQ0FBQSxLQUFBO01BREQ7Q0FHSyxFQUFELENBQUssR0FBUixJQUFBLEVBQUE7TUFUVztDQWpGYixFQWlGYTs7Q0FqRmIsRUE2RlUsS0FBVixDQUFVO0NBQ1QsT0FBQTtDQUFBLEVBQUksQ0FBSixJQUFJLE9BQWU7Q0FDRixFQUFULEVBQVIsRUFBUSxDQUFRLEdBQWhCO0NBL0ZELEVBNkZVOztDQTdGVixFQWlHZ0IsTUFBQSxLQUFoQjtDQUNVLElBQVksR0FBYixHQUFSO0NBbEdELEVBaUdnQjs7Q0FqR2hCLEVBb0dTLElBQVQsRUFBUztDQUNSLENBQW1DLENBQW5DLENBQUEsU0FBQSxDQUFBLENBQWU7Q0FDQyxDQUFxQixDQUFyQyxDQUFzQyxPQUF0QyxJQUFlLENBQWY7Q0F0R0QsRUFvR1M7O0NBcEdUOztDQU5EIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjEyNDcwLCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3Mvcm9vbS9kYXNoYm9hcmQuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIiMgYXBwY2FzdCA9IHJlcXVpcmUgJ2FwcC91dGlscy9hcHBjYXN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IChkb20pIC0+XG5cblx0dm9sdW1lID0gXG5cdFx0bGVmdCA6IG51bGxcblx0XHRyaWdodDogbnVsbFxuXG5cblx0aW5pdCA9IC0+XG5cdFx0dmlldy5vbmNlICdiaW5kZWQnLCBvbl9yZWFkeVxuXG5cdG9uX3JlYWR5ID0gLT5cblx0XHRicm9hZGNhc3RfdHJpZ2dlciA9IHZpZXcuZ2V0X2J5X2RvbSBkb20uZmluZCggJy5icm9hZGNhc3RfY29udHJvbHMnIClcblx0XHRyZWNvcmRpbmdfdHJpZ2dlciA9IHZpZXcuZ2V0X2J5X2RvbSBkb20uZmluZCggJy5yZWNvcmRpbmdfY29udHJvbHMnIClcblxuXHRcdGlmIGJyb2FkY2FzdF90cmlnZ2VyLmxlbmd0aCA+IDAgXG5cdFx0XHRicm9hZGNhc3RfdHJpZ2dlci5vbiAnY2hhbmdlJywgb25fYnJvYWRjYXN0X2NsaWNrXG5cblx0XHR2b2x1bWUubGVmdCA9IHZpZXcuZ2V0X2J5X2RvbSBkb20uZmluZCggJy5tZXRlcl93cmFwcGVyLmxlZnQnIClcblx0XHR2b2x1bWUucmlnaHQgPSB2aWV3LmdldF9ieV9kb20gZG9tLmZpbmQoICcubWV0ZXJfd3JhcHBlci5yaWdodCcgKVxuXG5cdFx0IyBFeGFtcGxlIG9mIGhvdyB0byB1c2UgdGhlIHZvbHVtZSBvYmplY3Rcblx0XHR2b2x1bWUubGVmdC5zZXRfdm9sdW1lIDAuN1xuXHRcdHZvbHVtZS5yaWdodC5zZXRfdm9sdW1lIDAuNzhcblxuXHRcdGlucHV0X3NlbGVjdCA9IHZpZXcuZ2V0X2J5X2RvbSBkb20uZmluZCggJy5pbnB1dF9zZWxlY3QnIClcblx0XHRpbnB1dF9zZWxlY3Qub24gJ2NoYW5nZWQnLCAoZGF0YSkgLT5cblx0XHRcdGxvZyBcIltEYXNoYm9hcmRdIGlucHV0IGNoYW5nZWRcIiwgZGF0YVxuXG5cblxuXG5cdG9uX2Jyb2FkY2FzdF9jbGljayA9IChkYXRhKSAtPlxuXHRcdGxvZyBcIm9uX2Jyb2FkY2FzdF9jbGlja1wiLCBkYXRhXG5cblx0XHRpZiBkYXRhIGlzIFwic3RhcnRcIlxuXHRcdFx0IyBkbyBhcHBjYXN0LnN0YXJ0X3N0cmVhbVxuXHRcdGVsc2Vcblx0XHRcdCMgZG8gYXBwY2FzdC5zdG9wX3N0cmVhbVxuXG5cdG9uX3JlY29yZGluZ19jbGljayA9IChkYXRhKSAtPlxuXHRcdGxvZyBcIm9uX3JlY29yZGluZ19jbGlja1wiLCBkYXRhXG5cblx0XHRpZiBkYXRhIGlzIFwic3RhcnRcIlxuXHRcdFx0IyBkbyBhcHBjYXN0LnN0YXJ0X3JlY29yZGluZ1xuXHRcdGVsc2Vcblx0XHRcdCMgZG8gYXBwY2FzdC5zdG9wX3JlY29yZGluZ1xuXG5cblx0aW5pdCgpIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLENBQU8sRUFBVSxHQUFYLENBQU4sRUFBa0I7Q0FFakIsS0FBQSx3REFBQTtDQUFBLENBQUEsQ0FDQyxHQUREO0NBQ0MsQ0FBTyxFQUFQO0NBQUEsQ0FDTyxFQUFQLENBQUE7Q0FGRCxHQUFBO0NBQUEsQ0FLQSxDQUFPLENBQVAsS0FBTztDQUNELENBQWUsRUFBaEIsSUFBSixHQUFBO0NBTkQsRUFLTztDQUxQLENBUUEsQ0FBVyxLQUFYLENBQVc7Q0FDVixPQUFBLDBDQUFBO0NBQUEsRUFBb0IsQ0FBcEIsTUFBb0IsT0FBcEIsSUFBb0M7Q0FBcEMsRUFDb0IsQ0FBcEIsTUFBb0IsT0FBcEIsSUFBb0M7Q0FFcEMsRUFBOEIsQ0FBOUIsRUFBRyxXQUFpQjtDQUNuQixDQUFBLElBQUEsRUFBQSxTQUFpQixDQUFqQjtNQUpEO0NBQUEsRUFNYyxDQUFkLEVBQU0sSUFBUSxXQUFnQjtDQU45QixFQU9lLENBQWYsQ0FBQSxDQUFNLElBQVMsWUFBZ0I7Q0FQL0IsRUFVQSxDQUFBLEVBQU0sSUFBTjtDQVZBLEdBV0EsQ0FBWSxDQUFOLElBQU47Q0FYQSxFQWFlLENBQWYsTUFBZSxFQUFmLEdBQStCO0NBQ2xCLENBQWIsQ0FBMkIsQ0FBQSxLQUEzQixFQUFBLENBQVk7Q0FDUCxDQUE2QixDQUFqQyxDQUFBLFNBQUEsY0FBQTtDQURELElBQTJCO0NBdkI1QixFQVFXO0NBUlgsQ0E2QkEsQ0FBcUIsQ0FBQSxLQUFDLFNBQXRCO0NBQ0MsQ0FBMEIsQ0FBMUIsQ0FBQSxnQkFBQTtDQUVBLEdBQUEsQ0FBVyxFQUFYO0NBQUE7TUFBQTtDQUFBO01BSG9CO0NBN0JyQixFQTZCcUI7Q0E3QnJCLENBcUNBLENBQXFCLENBQUEsS0FBQyxTQUF0QjtDQUNDLENBQTBCLENBQTFCLENBQUEsZ0JBQUE7Q0FFQSxHQUFBLENBQVcsRUFBWDtDQUFBO01BQUE7Q0FBQTtNQUhvQjtDQXJDckIsRUFxQ3FCO0NBU3JCLEdBQUEsS0FBQTtDQWhEZ0IifX0seyJvZmZzZXQiOnsibGluZSI6MTI1MTYsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9yb29tL3Jvb21fbW9kYWwuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIk1vZGFsID0gcmVxdWlyZSAnLi4vY29tcG9uZW50cy9tb2RhbCdcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFJvb21Nb2RhbCBleHRlbmRzIE1vZGFsXG5cblx0Y292ZXJfdXBsb2FkZWQ6IFwiXCJcblx0Y29uc3RydWN0b3I6ICggQGRvbSApIC0+XG5cdFx0c3VwZXIgQGRvbVxuXG5cdFx0QHRpdGxlID0gQGRvbS5maW5kICcucm9vbW5hbWUnXG5cblx0XHRcblx0XHRcblx0XHRAbG9jYXRpb24gPSBAZG9tLmZpbmQgJy5sb2NhdGlvbidcblx0XHRAZGVzY3JpcHRpb24gPSBAZG9tLmZpbmQgJy5kZXNjcmlwdGlvbidcblx0XHRAbWVzc2FnZSA9IEBkb20uZmluZCAnLm1lc3NhZ2UnXG5cblx0XHRAc3VibWl0ID0gQGRvbS5maW5kICcuc3VibWl0X2J1dHRvbidcblxuXHRcdHZpZXcub25jZSAnYmluZGVkJywgQG9uX3ZpZXdzX2JpbmRlZFxuXG5cdG9uX3ZpZXdzX2JpbmRlZDogKCApID0+XG5cblx0XHRyb29tX2ltYWdlX3VwbG9hZGVyID0gdmlldy5nZXRfYnlfZG9tIEBkb20uZmluZCggJy5yb29tX2ltYWdlJyApXG5cblx0XHRpZiBub3Qgcm9vbV9pbWFnZV91cGxvYWRlclxuXHRcdFx0bG9nIFwiW3Jvb21zL2NyZWF0ZU1vZGFsXSB2aWV3cyBub3QgYmluZGVkIHlldCEhIVwiXG5cdFx0XHRyZXR1cm5cblxuXG5cdFx0QGdlbnJlID0gdmlldy5nZXRfYnlfZG9tIEBkb20uZmluZCggJy5nZW5yZScgKVxuXG5cblx0XHRyb29tX2ltYWdlX3VwbG9hZGVyLm9uICdjb21wbGV0ZWQnLCBAX29uX2NvdmVyX2NoYW5nZWRcblx0XHRAdGl0bGUub24gJ2tleXVwJyAgICAgICAgICAgICAgICAgLCBAX29uX3RpdGxlX2NoYW5nZWRcblx0XHRAbG9jYXRpb24ub24gJ2tleXVwJyAgICAgICAgICAgICAgLCBAX29uX2xvY2F0aW9uX2NoYW5nZWRcblx0XHRAZGVzY3JpcHRpb24ub24gJ2tleXVwJyAgICAgICAgICAgLCBAX29uX2Rlc2NyaXB0aW9uX2NoYW5nZWRcblx0XHRAZ2VucmUub24gJ2NoYW5nZScgICAgICAgICAgICAgICAgLCBAX29uX2dlbnJlX2NoYW5nZWRcblx0XHRAc3VibWl0Lm9uICdjbGljaycgICAgICAgICAgICAgICAgLCBAX3N1Ym1pdFxuXHRcdFxuXG5cdF9vbl9jb3Zlcl9jaGFuZ2VkOiAoZGF0YSkgPT5cblx0XHRAY292ZXJfdXBsb2FkZWQgPSBkYXRhLnJlc3VsdFxuXG5cdFx0Y29uc29sZS5sb2cgXCJnb3QgaW1hZ2UgcmVzdWx0IC0+XCIsIGRhdGEucmVzdWx0XG5cblx0XHRAZW1pdCAnaW5wdXQ6Y2hhbmdlZCcsIHsgbmFtZTogJ2NvdmVyJywgdmFsdWU6IGRhdGEucmVzdWx0IH1cblxuXHRfb25fdGl0bGVfY2hhbmdlZDogKCApID0+XG5cdFx0QF9jaGVja19sZW5ndGggQHRpdGxlXG5cdFx0QGVtaXQgJ2lucHV0OmNoYW5nZWQnLCB7IG5hbWU6ICd0aXRsZScsIHZhbHVlOiBAdGl0bGUudmFsKCkgfVxuXG5cdF9vbl9nZW5yZV9jaGFuZ2VkOiAoIGRhdGEgKSA9PlxuXHRcdGxvZyBcIl9vbl9nZW5yZV9jaGFuZ2VkXCIsIGRhdGFcblx0XHRAZW1pdCAnaW5wdXQ6Y2hhbmdlZCcsIHsgbmFtZTogJ2dlbnJlJywgdmFsdWU6IGRhdGEuam9pbiggJywgJyApIH1cblxuXHRfb25fbG9jYXRpb25fY2hhbmdlZDogKCApID0+XG5cdFx0QGVtaXQgJ2lucHV0OmNoYW5nZWQnLCB7IG5hbWU6ICdsb2NhdGlvbicsIHZhbHVlOiBAbG9jYXRpb24udmFsKCkgfVxuXG5cdF9vbl9kZXNjcmlwdGlvbl9jaGFuZ2VkOiAoICkgPT5cblx0XHRAZW1pdCAnaW5wdXQ6Y2hhbmdlZCcsIHsgbmFtZTogJ2Rlc2NyaXB0aW9uJywgdmFsdWU6IEBkZXNjcmlwdGlvbi52YWwoKSB9XG5cblx0X2NoZWNrX2xlbmd0aDogKCBlbCApIC0+XG5cdFx0aWYgZWwudmFsKCkubGVuZ3RoID4gMFxuXHRcdFx0ZWwucmVtb3ZlQ2xhc3MgJ3JlcXVpcmVkJ1xuXHRcdGVsc2Vcblx0XHRcdGVsLmFkZENsYXNzICdyZXF1aXJlZCdcblxuXHRfc3VibWl0OiAoICkgPT5cblx0XHRsb2cgXCJzdWJtaXRcIlxuXG5cdFx0IyBxdWljayB2YWxpZGF0aW9uIHNrZXRjaFxuXHRcdGlmIG5vdCBAdGl0bGUudmFsKClcblx0XHRcdEB0aXRsZS5hZGRDbGFzcyggJ3JlcXVpcmVkJyApLmZvY3VzKClcblx0XHRcdHJldHVybiBcblxuXHRcdGRhdGEgPSBcblx0XHRcdHRpdGxlICAgIDogQHRpdGxlLnZhbCgpXG5cdFx0XHRnZW5yZXMgICA6IEBnZW5yZS5nZXRfdGFncyggdHJ1ZSApXG5cdFx0XHRsb2NhdGlvbiA6IEBsb2NhdGlvbi52YWwoKVxuXHRcdFx0YWJvdXQgICAgOiBAZGVzY3JpcHRpb24udmFsKClcblx0XHRcdGNvdmVyICAgIDogQGNvdmVyX3VwbG9hZGVkXG5cblx0XHRAZW1pdCAnc3VibWl0JywgZGF0YVxuXG5cblx0c2hvd19tZXNzYWdlOiAoIG1zZyApIC0+XG5cdFx0QG1lc3NhZ2UuaHRtbCggbXNnICkuc2hvdygpXG5cblx0aGlkZV9tZXNzYWdlOiAoICkgLT5cblx0XHRAbWVzc2FnZS5oaWRlKClcblxuXHRvcGVuX3dpdGhfZGF0YTogKCBkYXRhICkgLT5cblx0XHRsb2cgXCJbUm9vbU1vZGFsXSBvcGVuX3dpdGhfZGF0YVwiLCBkYXRhXG5cblx0XHRAZG9tLmFkZENsYXNzICdlZGl0X21vZGFsJ1xuXHRcdEB0aXRsZS52YWwgZGF0YS50aXRsZVxuXHRcdEBnZW5yZS5hZGRfdGFncyBkYXRhLmdlbnJlc1xuXHRcdCMgQGxvY2F0aW9uLnZhbCBkYXRhLmxvY2F0aW9uXG5cdFx0IyBAZGVzY3JpcHRpb24udmFsIGRhdGEuYWJvdXRcblx0XHRAbG9jYXRpb24uaGlkZSgpXG5cdFx0QGRlc2NyaXB0aW9uLmhpZGUoKVxuXG5cdFx0QG9wZW4oKVxuXG5cdFx0cmV0dXJuIGZhbHNlXG5cblxuXHRkZXN0cm95OiAtPlxuXHRcdGxvZyBcIltSb29tTW9kYWxdIHJlbW92ZWRcIlxuXHRcdEB0aXRsZS5vZmYgJ2tleXVwJyAgICAgICAgICAgICAgICAgLCBAX29uX3RpdGxlX2NoYW5nZWRcblx0XHRAbG9jYXRpb24ub2ZmICdrZXl1cCcgICAgICAgICAgICAgICwgQF9vbl9sb2NhdGlvbl9jaGFuZ2VkXG5cdFx0QGRlc2NyaXB0aW9uLm9mZiAna2V5dXAnICAgICAgICAgICAsIEBfb25fZGVzY3JpcHRpb25fY2hhbmdlZFxuXHRcdEBnZW5yZS5vZmYgJ2NoYW5nZScgICAgICAgICAgICAgICAgLCBAX29uX2dlbnJlX2NoYW5nZWRcblx0XHRAc3VibWl0Lm9mZiAnY2xpY2snICAgICAgICAgICAgICAgICwgQF9zdWJtaXRcblxuXHRcdEBnZW5yZSA9IG51bGxcblxuXHRcdHN1cGVyKClcblxuXG5cblx0XHRcblxuXG5cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFlBQUE7R0FBQTs7a1NBQUE7O0FBQUEsQ0FBQSxFQUFRLEVBQVIsRUFBUSxjQUFBOztBQUdSLENBSEEsRUFHdUIsR0FBakIsQ0FBTjtDQUVDOztDQUFBLENBQUEsQ0FBZ0IsV0FBaEI7O0NBQ2EsQ0FBQSxDQUFBLGdCQUFHO0NBQ2YsRUFEZSxDQUFEO0NBQ2Qsd0NBQUE7Q0FBQSx3RUFBQTtDQUFBLGtFQUFBO0NBQUEsNERBQUE7Q0FBQSw0REFBQTtDQUFBLDREQUFBO0NBQUEsd0RBQUE7Q0FBQSxFQUFBLENBQUEsdUNBQU07Q0FBTixFQUVTLENBQVQsQ0FBQSxNQUFTO0NBRlQsRUFNWSxDQUFaLElBQUEsR0FBWTtDQU5aLEVBT2UsQ0FBZixPQUFBLEdBQWU7Q0FQZixFQVFXLENBQVgsR0FBQSxHQUFXO0NBUlgsRUFVVSxDQUFWLEVBQUEsVUFBVTtDQVZWLENBWW9CLEVBQXBCLElBQUEsT0FBQTtDQWRELEVBQ2E7O0NBRGIsRUFnQmlCLE1BQUEsTUFBakI7Q0FFQyxPQUFBLFdBQUE7Q0FBQSxFQUFzQixDQUF0QixNQUFzQixHQUFnQixNQUF0QztBQUVPLENBQVAsR0FBQSxlQUFBO0NBQ0MsRUFBQSxHQUFBLHVDQUFBO0NBQ0EsV0FBQTtNQUpEO0NBQUEsRUFPUyxDQUFULENBQUEsR0FBeUIsRUFBaEI7Q0FQVCxDQVVBLEVBQUEsT0FBQSxNQUFBLEVBQW1CO0NBVm5CLENBV0EsRUFBQSxDQUFNLEVBQU4sVUFBQTtDQVhBLENBWUEsRUFBQSxHQUFBLENBQVMsWUFBVDtDQVpBLENBYUEsRUFBQSxHQUFBLElBQVksWUFBWjtDQWJBLENBY0EsRUFBQSxDQUFNLEdBQU4sU0FBQTtDQUNDLENBQUQsRUFBQyxFQUFNLENBQVAsSUFBQTtDQWpDRCxFQWdCaUI7O0NBaEJqQixFQW9DbUIsQ0FBQSxLQUFDLFFBQXBCO0NBQ0MsRUFBa0IsQ0FBbEIsRUFBQSxRQUFBO0NBQUEsQ0FFbUMsQ0FBbkMsQ0FBQSxFQUFBLENBQU8sY0FBUDtDQUVDLENBQXNCLEVBQXRCLE9BQUQsSUFBQTtDQUF1QixDQUFRLEVBQU4sRUFBQSxDQUFGO0NBQUEsQ0FBd0IsRUFBSSxDQUFYLENBQUE7Q0FMdEIsS0FLbEI7Q0F6Q0QsRUFvQ21COztDQXBDbkIsRUEyQ21CLE1BQUEsUUFBbkI7Q0FDQyxHQUFBLENBQUEsUUFBQTtDQUNDLENBQXNCLEVBQXRCLE9BQUQsSUFBQTtDQUF1QixDQUFRLEVBQU4sRUFBQSxDQUFGO0NBQUEsQ0FBd0IsQ0FBQSxDQUFDLENBQVIsQ0FBQTtDQUZ0QixLQUVsQjtDQTdDRCxFQTJDbUI7O0NBM0NuQixFQStDbUIsQ0FBQSxLQUFFLFFBQXJCO0NBQ0MsQ0FBeUIsQ0FBekIsQ0FBQSxlQUFBO0NBQ0MsQ0FBc0IsRUFBdEIsT0FBRCxJQUFBO0NBQXVCLENBQVEsRUFBTixFQUFBLENBQUY7Q0FBQSxDQUF3QixFQUFJLENBQVgsQ0FBQTtDQUZ0QixLQUVsQjtDQWpERCxFQStDbUI7O0NBL0NuQixFQW1Ec0IsTUFBQSxXQUF0QjtDQUNFLENBQXNCLEVBQXRCLE9BQUQsSUFBQTtDQUF1QixDQUFRLEVBQU4sRUFBQSxJQUFGO0NBQUEsQ0FBMkIsQ0FBQSxDQUFDLENBQVIsQ0FBQSxFQUFnQjtDQUR0QyxLQUNyQjtDQXBERCxFQW1Ec0I7O0NBbkR0QixFQXNEeUIsTUFBQSxjQUF6QjtDQUNFLENBQXNCLEVBQXRCLE9BQUQsSUFBQTtDQUF1QixDQUFRLEVBQU4sRUFBQSxPQUFGO0NBQUEsQ0FBOEIsQ0FBQSxDQUFDLENBQVIsQ0FBQSxLQUFtQjtDQUR6QyxLQUN4QjtDQXZERCxFQXNEeUI7O0NBdER6QixDQXlEZSxDQUFBLE1BQUUsSUFBakI7Q0FDQyxDQUFLLENBQUYsQ0FBSCxFQUFHO0NBQ0MsQ0FBRCxRQUFGLENBQUEsRUFBQTtNQUREO0NBR0ksQ0FBRCxNQUFGLEVBQUEsR0FBQTtNQUphO0NBekRmLEVBeURlOztDQXpEZixFQStEUyxJQUFULEVBQVM7Q0FDUixHQUFBLElBQUE7Q0FBQSxFQUFBLENBQUEsSUFBQTtBQUdPLENBQVAsRUFBTyxDQUFQLENBQWE7Q0FDWixHQUFDLENBQUssQ0FBTixFQUFBLEVBQUE7Q0FDQSxXQUFBO01BTEQ7Q0FBQSxFQVFDLENBREQ7Q0FDQyxDQUFXLENBQUEsQ0FBQyxDQUFaLENBQUE7Q0FBQSxDQUNXLEVBQUMsQ0FBSyxDQUFqQixFQUFXO0NBRFgsQ0FFVyxDQUFBLENBQUMsRUFBWixFQUFBO0NBRkEsQ0FHVyxDQUFBLENBQUMsQ0FBWixDQUFBLEtBQXVCO0NBSHZCLENBSVcsRUFBQyxDQUFaLENBQUEsUUFKQTtDQVJELEtBQUE7Q0FjQyxDQUFlLEVBQWYsSUFBRCxHQUFBO0NBOUVELEVBK0RTOztDQS9EVCxFQWlGYyxNQUFFLEdBQWhCO0NBQ0UsRUFBRCxDQUFDLEdBQU8sSUFBUjtDQWxGRCxFQWlGYzs7Q0FqRmQsRUFvRmMsTUFBQSxHQUFkO0NBQ0UsR0FBQSxHQUFPLElBQVI7Q0FyRkQsRUFvRmM7O0NBcEZkLEVBdUZnQixDQUFBLEtBQUUsS0FBbEI7Q0FDQyxDQUFrQyxDQUFsQyxDQUFBLHdCQUFBO0NBQUEsRUFFSSxDQUFKLElBQUEsSUFBQTtDQUZBLEVBR0EsQ0FBQSxDQUFNO0NBSE4sR0FJQSxDQUFNLENBQU4sRUFBQTtDQUpBLEdBT0EsSUFBUztDQVBULEdBUUEsT0FBWTtDQVJaLEdBVUE7Q0FFQSxJQUFBLE1BQU87Q0FwR1IsRUF1RmdCOztDQXZGaEIsRUF1R1MsSUFBVCxFQUFTO0NBQ1IsRUFBQSxDQUFBLGlCQUFBO0NBQUEsQ0FDcUMsQ0FBckMsQ0FBQSxDQUFNLEVBQU4sVUFBQTtDQURBLENBRXFDLENBQXJDLENBQUEsR0FBQSxDQUFTLFlBQVQ7Q0FGQSxDQUdxQyxDQUFyQyxDQUFBLEdBQUEsSUFBWSxZQUFaO0NBSEEsQ0FJcUMsQ0FBckMsQ0FBQSxDQUFNLEdBQU4sU0FBQTtDQUpBLENBS3FDLENBQXJDLENBQUEsRUFBTyxDQUFQO0NBTEEsRUFPUyxDQUFULENBQUE7Q0FSUSxVQVVSLDBCQUFBO0NBakhELEVBdUdTOztDQXZHVDs7Q0FGd0MifX1dfQ==
*/})()