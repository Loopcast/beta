
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
var App, app, navigation, views,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

require('./globals');

require('./vendors');

views = require('./controllers/views');

navigation = require('./controllers/navigation');

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
      return navigation.bind('#content');
    });
  };

  App.prototype.login = function(user) {
    log("[logged]");
    return console.dir(user);
  };

  App.prototype.logout = function() {
    return log("[logged out]", user);
  };

  /*
  	# After the views have been rendered
  */


  App.prototype.after_render = function() {
    var _this = this;
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

}, {"./globals":"src/frontend/scripts/globals","./vendors":"src/frontend/scripts/vendors","./controllers/views":"src/frontend/scripts/controllers/views","./controllers/navigation":"src/frontend/scripts/controllers/navigation","app/controllers/local_connection":"src/frontend/scripts/controllers/local_connection","app/controllers/window":"src/frontend/scripts/controllers/window","app/utils/settings":"src/frontend/scripts/utils/settings"});
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
      return _this.emit('after_render');
    });
  }

  Navigation.prototype.url_changed = function(req) {
    var div,
      _this = this;
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
        return _this.emit('after_render');
      });
    });
  };

  Navigation.prototype.go = function(url) {
    if (req.url.indexOf('/login' === 0)) {
      return true;
    }
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
var happens, user;

happens = require('happens');

user = happens({
  logout: function(callback) {
    this.emit('user:logged_out');
    return callback();
  },
  login: function(callback) {
    user = {
      username: "Stefano Ortisi",
      thumb: "/images/profile.jpg",
      permalink: "/profile/stefanoortisi"
    };
    app.body.addClass("logged");
    return this.emit('user:logged', user);
  }
});

module.exports = window.user_controller = user;

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

window.log = require('./globals/log');

window.mover = require('./globals/mover');

window.happens = require('happens');

module.exports = window;

}, {"./globals/delay":"src/frontend/scripts/globals/delay","./globals/log":"src/frontend/scripts/globals/log","./globals/mover":"src/frontend/scripts/globals/mover","happens":"node_modules/happens/index"});
require.register('src/frontend/scripts/globals/delay', function(require, module, exports){
module.exports = function(delay, funk) {
  return setTimeout(funk, delay);
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
      time = 300;
    }
    return el.fadeIn(time);
  },
  hide: function(el, time) {
    if (time == null) {
      time = 300;
    }
    return el.fadeOut(time);
  },
  get_time: function(time) {
    return (time / 1000) + "s";
  }
};

module.exports = Opacity;

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
require('../vendors/modernizr.custom.js');

require('../vendors/LocalConnection.js');

}, {"../vendors/modernizr.custom.js":"src/frontend/vendors/modernizr.custom","../vendors/LocalConnection.js":"src/frontend/vendors/LocalConnection"});
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
  function Fullscreen(dom) {
    this.dom = dom;
    this.on_resize = __bind(this.on_resize, this);
    this.dom.addClass('fullscreen');
    app.window.on('resize', this.on_resize);
    this.on_resize();
  }

  Fullscreen.prototype.on_resize = function() {
    return this.dom.css({
      'width': '100%',
      'height': app.window.h - app.settings.header_height
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
require.register('src/frontend/scripts/views/components/logout_link', function(require, module, exports){
var LogoutLink;

module.exports = LogoutLink = (function() {
  function LogoutLink(dom) {
    this.dom = dom;
    this.dom.on('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      return user_controller.logout(function() {});
    });
  }

  return LogoutLink;

})();

}, {});
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
require.register('src/frontend/scripts/views/components/popup_handler', function(require, module, exports){
var PopupHandler;

module.exports = PopupHandler = (function() {
  function PopupHandler(dom) {
    var h, title, url, w;
    this.dom = dom;
    url = this.dom.data('url');
    title = this.dom.data('title');
    w = this.dom.data('w');
    h = this.dom.data('h');
    this.dom.on('click', function() {
      var left, top;
      left = (app.window.w / 2) - (w / 2);
      top = (app.window.h / 2) - (h / 2);
      return window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left).focus();
    });
  }

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
var Header, navigation,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

navigation = require('app/controllers/navigation');

module.exports = Header = (function() {
  Header.prototype.current_page = "";

  function Header(dom) {
    this.dom = dom;
    this.on_user_unlogged = __bind(this.on_user_unlogged, this);
    this.on_user_logged = __bind(this.on_user_logged, this);
    this.check_menu = __bind(this.check_menu, this);
    app.on('user:logged', this.on_user_logged);
    navigation.on('after_render', this.check_menu);
  }

  Header.prototype.check_menu = function() {
    var obj, page;
    obj = $('[data-menu]');
    if (obj.length > 0) {
      page = obj.data('menu');
      if (this.current_page.length > 0) {
        this.dom.find('.#{@current_page}_item').removeClass("selected");
        app.body.removeClass("" + this.current_page + "_page");
      }
      this.dom.find("." + page + "_item").addClass("selected");
      app.body.addClass("" + page + "_page");
      return this.current_page = page;
    }
  };

  Header.prototype.on_user_logged = function(data) {
    var html, tmpl, wrapper;
    wrapper = this.dom.find('.user_logged');
    tmpl = require('templates/shared/header_user_logged');
    html = tmpl(data);
    wrapper.empty().append(html);
    return view.bind(wrapper);
  };

  Header.prototype.on_user_unlogged = function(data) {};

  return Header;

})();

}, {"app/controllers/navigation":"src/frontend/scripts/controllers/navigation","templates/shared/header_user_logged":"src/frontend/templates/shared/header_user_logged"});
require.register('src/frontend/scripts/views/loading', function(require, module, exports){
var Loading, Opacity, navigation;

navigation = require('app/controllers/navigation');

Opacity = require('app/utils/opacity');

module.exports = Loading = (function() {
  function Loading(dom) {
    var _this = this;
    this.dom = dom;
    navigation.on('before_destroy', function() {
      app.body.addClass('loading');
      return Opacity.show(_this.dom);
    });
    navigation.on('after_render', function() {
      app.body.removeClass('loading');
      return Opacity.hide(_this.dom);
    });
  }

  return Loading;

})();

}, {"app/controllers/navigation":"src/frontend/scripts/controllers/navigation","app/utils/opacity":"src/frontend/scripts/utils/opacity"});
require.register('src/frontend/scripts/views/login', function(require, module, exports){
var Login,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

module.exports = Login = (function() {
  function Login(dom) {
    this.dom = dom;
    this._google_login = __bind(this._google_login, this);
    this._soundcloud_login = __bind(this._soundcloud_login, this);
    this._facebook_login = __bind(this._facebook_login, this);
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
var locals_ = (locals || {}),thumb = locals_.thumb;jade.debug.unshift({ lineno: 1, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 1, filename: jade.debug[0].filename });
buf.push("<div data-view=\"components/click_trigger\" data-target=\".user_dropdown\" class=\"thumb_wrapper\">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 2, filename: jade.debug[0].filename });
buf.push("<img" + (jade.attrs({ 'width':("42"), 'src':("" + (thumb) + "") }, {"width":true,"src":true})) + "/>");
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
buf.push("<a href=\"#\" title=\"My Profile\">");
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
buf.push("<a href=\"javascript:;\" title=\"Messages\">");
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
  jade.rethrow(err, jade.debug[0].filename, jade.debug[0].lineno,".thumb_wrapper(data-view=\"components/click_trigger\" data-target=\".user_dropdown\")\n\timg(width=\"42\", src=\"#{thumb}\")\n\tspan.spritesheet.small_arrow_white\n\n\tul.user_dropdown.hover_dropdown\n\t\tli\n\t\t\ta(href=\"#\" title=\"My Profile\") My Profile\n\t\tli\n\t\t\ta(href=\"#\" title=\"Feedback\") Feedback\n\t\tli\n\t\t\ta.logout(href=\"#\" title=\"Logout\", data-view=\"components/logout_link\") Logout\n\n\n\na(href=\"javascript:;\" title=\"Messages\")\n\tspan.spritesheet.messages_icon");
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
// POLVO :: INITIALIZER
require('src/frontend/scripts/app');
/*
//@ sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic2VjdGlvbnMiOlt7Im9mZnNldCI6eyJsaW5lIjo0ODgyLCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvYXBwLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJyZXF1aXJlICcuL2dsb2JhbHMnXG5yZXF1aXJlICcuL3ZlbmRvcnMnXG5cbnZpZXdzICAgICAgPSByZXF1aXJlICcuL2NvbnRyb2xsZXJzL3ZpZXdzJ1xubmF2aWdhdGlvbiA9IHJlcXVpcmUgJy4vY29udHJvbGxlcnMvbmF2aWdhdGlvbidcbiMgbW90aW9uICAgPSByZXF1aXJlICdhcHAvY29udHJvbGxlcnMvbW90aW9uJ1xuXG5jbGFzcyBBcHBcblxuXHQjIGxpbmsgdG8gY29udHJvbGxlci9sb2NhbF9jb25uZWN0aW9uXG5cdHdpbmRvdzogbnVsbFxuXG5cdCMgbGluayB0byB1dGlscy9zZXR0aW5nc1xuXHRzZXR0aW5nczogbnVsbFxuXG5cdCMgbGluayB0byBjb250cm9sbGVyL2xvY2FsX2Nvbm5lY3Rpb25cblx0bG9jYWw6IG51bGxcblxuXHRjb25zdHJ1Y3RvcjogLT4gXHRcblxuXHRcdGhhcHBlbnMgQFxuXG5cdFx0IyBhcmUgd2UgdXNpbmcgdGhpcz9cblx0XHRAb24gJ3JlYWR5JywgQGFmdGVyX3JlbmRlclxuXG5cdHN0YXJ0OiAtPlxuXG5cdFx0QGxvY2FsICA9IHJlcXVpcmUgJ2FwcC9jb250cm9sbGVycy9sb2NhbF9jb25uZWN0aW9uJ1xuXHRcdEB3aW5kb3cgPSByZXF1aXJlICdhcHAvY29udHJvbGxlcnMvd2luZG93J1xuXHRcdEBib2R5ICAgPSAkICdib2R5J1xuXHRcdFxuXHRcdEBzZXR0aW5ncyA9IHJlcXVpcmUgJ2FwcC91dGlscy9zZXR0aW5ncydcblx0XHRAc2V0dGluZ3MuYmluZCBAYm9keVxuXG5cdFx0IyBDb250cm9sbGVycyBiaW5kaW5nXG5cdFx0ZG8gdmlld3MuYmluZFxuXHRcdGRvIG5hdmlnYXRpb24uYmluZFxuXG5cdFx0IyB3aGVuIHRoZSBuZXcgYXJlIGlzIHJlbmRlcmVkLCBkbyB0aGUgc2FtZSB3aXRoIHRoZSBuZXcgY29udGVudFxuXG5cdFx0bmF2aWdhdGlvbi5vbiAnYmVmb3JlX2Rlc3Ryb3knLCA9PlxuXHRcdFx0bG9nIFwiLS0tLS0tLS0tIEJFRk9SRSBERVNUUk9ZXCJcblx0XHRcdHZpZXdzLnVuYmluZCAnI2NvbnRlbnQnXG5cblxuXHRcdG5hdmlnYXRpb24ub24gJ2FmdGVyX3JlbmRlcicsID0+IFxuXHRcdFx0dmlld3MuYmluZCAgICAgICAnI2NvbnRlbnQnXG5cdFx0XHRuYXZpZ2F0aW9uLmJpbmQgJyNjb250ZW50J1xuXHRcdFx0XG5cdFx0XHRcdFxuXHRsb2dpbiA6ICggdXNlciApIC0+XG5cdFx0bG9nIFwiW2xvZ2dlZF1cIlxuXHRcdGNvbnNvbGUuZGlyIHVzZXJcblxuXHRsb2dvdXQ6IC0+XG5cdFx0bG9nIFwiW2xvZ2dlZCBvdXRdXCIsIHVzZXJcblxuXG5cdCMjI1xuXHQjIEFmdGVyIHRoZSB2aWV3cyBoYXZlIGJlZW4gcmVuZGVyZWRcblx0IyMjXG5cdGFmdGVyX3JlbmRlcjogKCApID0+XG5cdFx0IyBIaWRlIHRoZSBsb2FkaW5nXG5cdFx0ZGVsYXkgMTAsID0+IEBib2R5LmFkZENsYXNzIFwibG9hZGVkXCJcblxuXHRcdFxuYXBwID0gbmV3IEFwcFxuXG4kIC0+IGFwcC5zdGFydCgpXG5cbm1vZHVsZS5leHBvcnRzID0gd2luZG93LmFwcCA9IGFwcCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLHVCQUFBO0dBQUEsK0VBQUE7O0FBQUEsQ0FBQSxNQUFBLElBQUE7O0FBQ0EsQ0FEQSxNQUNBLElBQUE7O0FBRUEsQ0FIQSxFQUdhLEVBQWIsRUFBYSxjQUFBOztBQUNiLENBSkEsRUFJYSxJQUFBLEdBQWIsZ0JBQWE7O0FBR1AsQ0FQTjtDQVVDLEVBQVEsQ0FBUixFQUFBOztDQUFBLEVBR1UsQ0FIVixJQUdBOztDQUhBLEVBTU8sQ0FOUCxDQU1BOztDQUVhLENBQUEsQ0FBQSxVQUFBO0NBRVosa0RBQUE7Q0FBQSxHQUFBLEdBQUE7Q0FBQSxDQUdBLEVBQUEsR0FBQSxLQUFBO0NBYkQsRUFRYTs7Q0FSYixFQWVPLEVBQVAsSUFBTztDQUVOLE9BQUEsSUFBQTtDQUFBLEVBQVUsQ0FBVixDQUFBLEVBQVUsMkJBQUE7Q0FBVixFQUNVLENBQVYsRUFBQSxDQUFVLGlCQUFBO0NBRFYsRUFFVSxDQUFWLEVBQVU7Q0FGVixFQUlZLENBQVosR0FBWSxDQUFaLFlBQVk7Q0FKWixHQUtBLElBQVM7Q0FMVCxHQVFHLENBQUs7Q0FSUixHQVNHLE1BQVU7Q0FUYixDQWFBLENBQWdDLENBQWhDLEtBQWdDLENBQXRCLE1BQVY7Q0FDQyxFQUFBLEdBQUEsb0JBQUE7Q0FDTSxJQUFELENBQUwsSUFBQSxHQUFBO0NBRkQsSUFBZ0M7Q0FLckIsQ0FBWCxDQUE4QixNQUFBLENBQXBCLENBQVYsR0FBQTtDQUNDLEdBQUEsQ0FBSyxDQUFMLElBQUE7Q0FDVyxHQUFYLE1BQVUsR0FBVjtDQUZELElBQThCO0NBbkMvQixFQWVPOztDQWZQLEVBd0NRLENBQUEsQ0FBUixJQUFVO0NBQ1QsRUFBQSxDQUFBLE1BQUE7Q0FDUSxFQUFSLENBQUEsR0FBTyxJQUFQO0NBMUNELEVBd0NROztDQXhDUixFQTRDUSxHQUFSLEdBQVE7Q0FDSCxDQUFnQixDQUFwQixDQUFBLE9BQUEsR0FBQTtDQTdDRCxFQTRDUTs7Q0FJUjs7O0NBaERBOztDQUFBLEVBbURjLE1BQUEsR0FBZDtDQUVDLE9BQUEsSUFBQTtDQUFNLENBQU4sQ0FBVSxFQUFWLElBQVUsRUFBVjtDQUFjLEdBQUksQ0FBSixHQUFELEtBQUE7Q0FBYixJQUFVO0NBckRYLEVBbURjOztDQW5EZDs7Q0FWRDs7QUFrRUEsQ0FsRUEsRUFrRUE7O0FBRUEsQ0FwRUEsRUFvRUUsTUFBQTtDQUFPLEVBQUQsRUFBSCxJQUFBO0NBQUg7O0FBRUYsQ0F0RUEsRUFzRWlCLEdBQVgsQ0FBTiJ9fSx7Im9mZnNldCI6eyJsaW5lIjo0OTYwLCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvY29udHJvbGxlcnMvbG9jYWxfY29ubmVjdGlvbi5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4jXG4jIENvbnRyb2xsZXIgcmVzcG9uc2libGUgZm9yIGNvbW11bmljYXRpb24gd2l0aCBvdGhlciBpbnN0YW5jZXMgb2YgdGhlIGFwcFxuIyBmb3IgaW5zdGFuY2UgYW5vdGhlciB0YWIgb3IgcG9wIHVwIG9wZW5cbiNcbiMgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9qZXJlbXloYXJyaXMvTG9jYWxDb25uZWN0aW9uLmpzL3RyZWUvbWFzdGVyXG4jIGZvcmUgbW9yZSBpbmZvcm1hdGlvbiwgZm9yIGluc3RhbmNlIGludGVncmF0aW9uIHdpdGggSUU5XG4jXG4jIyNcblxuYXBwID0gcmVxdWlyZSAnYXBwL2FwcCdcblxuY29ubmVjdGlvbiA9IG5ldyBMb2NhbENvbm5lY3Rpb24gJ2JldGEubG9vcGNhc3QuZm0nXG5jb25uZWN0aW9uLmxpc3RlbigpXG5cbmNvbm5lY3Rpb24uYWRkQ2FsbGJhY2sgJ2xvZ2luJywgKCB1c2VyICkgLT5cblxuICBjb25zb2xlLmluZm8gJyArIGxvY2F0aW9uIGNvbm5lY3Rpb24sIHVzZXIgbG9nZ2VkIGluOicsIHVzZXJcblxuICBhcHAubG9naW4gdXNlclxuXG5jb25uZWN0aW9uLmFkZENhbGxiYWNrICdsb2dvdXQnLCAtPlxuXG4gIGNvbnNvbGUuaW5mbyAnICsgbG9jYXRpb24gY29ubmVjdGlvbiwgdXNlciBsb2dnZWQgb3V0J1xuXG4gIGFwcC5sb2dvdXQoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbm5lY3Rpb24iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztDQUFBO0NBQUEsR0FBQSxXQUFBOztBQVVBLENBVkEsRUFVQSxJQUFNLEVBQUE7O0FBRU4sQ0FaQSxFQVlpQixDQUFBLE1BQWpCLEtBQWlCLEdBQUE7O0FBQ2pCLENBYkEsS0FhQSxJQUFVOztBQUVWLENBZkEsQ0FlZ0MsQ0FBQSxDQUFBLEdBQWhDLEVBQWtDLENBQXhCLENBQVY7Q0FFRSxDQUFBLEVBQUEsR0FBTyxrQ0FBUDtDQUVJLEVBQUQsQ0FBSCxDQUFBLElBQUE7Q0FKOEI7O0FBTWhDLENBckJBLENBcUJpQyxDQUFBLEtBQWpDLENBQWlDLENBQXZCLENBQVY7Q0FFRSxDQUFBLEVBQUEsR0FBTyxrQ0FBUDtDQUVJLEVBQUQsR0FBSCxHQUFBO0NBSitCOztBQU1qQyxDQTNCQSxFQTJCaUIsR0FBWCxDQUFOLEdBM0JBIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjQ5OTIsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy9jb250cm9sbGVycy9uYXZpZ2F0aW9uLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJzZXR0aW5ncyAgXHQ9IHJlcXVpcmUgJ2FwcC91dGlscy9zZXR0aW5ncydcbmhhcHBlbnMgIFx0PSByZXF1aXJlICdoYXBwZW5zJ1xud2F5cyAgICBcdD0gcmVxdWlyZSAnd2F5cydcbndheXMudXNlIHJlcXVpcmUgJ3dheXMtYnJvd3NlcidcblxuY2xhc3MgTmF2aWdhdGlvblxuXG5cdGluc3RhbmNlID0gbnVsbFxuXHRcblxuXHRjb25zdHJ1Y3RvcjogLT5cblxuXHRcdGlmIE5hdmlnYXRpb24uaW5zdGFuY2Vcblx0XHRcdGNvbnNvbGUuZXJyb3IgXCJZb3UgY2FuJ3QgaW5zdGFudGlhdGUgdGhpcyBOYXZpZ2F0aW9uIHR3aWNlXCJcdFxuXG5cdFx0XHRyZXR1cm5cblxuXHRcdE5hdmlnYXRpb24uaW5zdGFuY2UgPSBAXG5cdFx0QGNvbnRlbnRfc2VsZWN0b3IgPSAnI2NvbnRlbnQgLmlubmVyX2NvbnRlbnQnXG5cdFx0QGNvbnRlbnRfZGl2ID0gJCBAY29udGVudF9zZWxlY3RvclxuXG5cdFx0aGFwcGVucyBAXG5cdFxuXHRcdCMgZXhwb3J0IHRvIHdpbmRvd1xuXHRcdHdpbmRvdy53YXlzID0gd2F5cztcblx0XHRcblx0XHQjIHJvdXRpbmdcblx0XHR3YXlzICcqJywgQHVybF9jaGFuZ2VkXG5cblxuXHRcdGRlbGF5IDIwMCwgPT4gQGVtaXQgJ2FmdGVyX3JlbmRlcidcblxuXHR1cmxfY2hhbmdlZDogKCByZXEgKSA9PlxuXG5cdFx0IyBpZSBoYWNrIGZvciBoYXNoIHVybHNcblx0XHRyZXEudXJsID0gcmVxLnVybC5yZXBsYWNlKCBcIi8jXCIsICcnIClcblxuXHRcdCMgbG9nIFwiIGNvbnRyb2xsZXJzL25hdmlnYXRpb24vdXJsX2NoYW5nZWQ6OiAje3JlcS51cmx9XCJcblx0XHQjIFRPRE86IFxuXHRcdCMgIC0gZG9uJ3QgcmVsb2FkIGlmIHRoZSBjb250ZW50IGlzIGFscmVhZHkgbG9hZGVkXG5cdFx0IyAgLSBpbXBsZW1lbnQgdHJhbnNpdGlvbnMgb3V0XG5cdFx0IyAgLSBpbXBsZW1lbnQgdHJhbnNpdGlvbiAgaW4gXG5cblx0XHRkaXYgPSAkKCAnPGRpdj4nIClcblxuXHRcdEBlbWl0ICdiZWZvcmVfbG9hZCdcblxuXHRcdGRpdi5sb2FkIHJlcS51cmwsID0+XG5cblx0XHRcdEBlbWl0ICdvbl9sb2FkJ1xuXG5cdFx0XHRpZiBhcHAuYm9keS5zY3JvbGxUb3AoKSA+IDBcblx0XHRcdFx0YXBwLmJvZHkuYW5pbWF0ZSBzY3JvbGxUb3A6IDBcblxuXG5cdFx0XHRAZW1pdCAnYmVmb3JlX2Rlc3Ryb3knXHRcdFxuXG5cdFx0XHRkZWxheSA0MDAsID0+XHRcdFx0XG5cblx0XHRcdFx0bmV3X2NvbnRlbnQgPSBkaXYuZmluZCggQGNvbnRlbnRfc2VsZWN0b3IgKS5jaGlsZHJlbigpXG5cdFx0XHRcdFxuXHRcdFx0XHRAY29udGVudF9kaXYgPSAkIEBjb250ZW50X3NlbGVjdG9yXG5cblx0XHRcdFx0IyBSZW1vdmUgb2xkIGNvbnRlbnRcblx0XHRcdFx0QGNvbnRlbnRfZGl2LmNoaWxkcmVuKCkucmVtb3ZlKClcblxuXHRcdFx0XHQjIHBvcHVsYXRlIHdpdGggdGhlIGxvYWRlZCBjb250ZW50XG5cdFx0XHRcdEBjb250ZW50X2Rpdi5hcHBlbmQgbmV3X2NvbnRlbnRcblxuXHRcdFx0XHRAZW1pdCAnYWZ0ZXJfcmVuZGVyJ1xuXG5cdCMjXG5cdCMgTmF2aWdhdGVzIHRvIGEgZ2l2ZW4gVVJMIHVzaW5nIEh0bWwgNSBoaXN0b3J5IEFQSVxuXHQjI1xuXHRnbzogKCB1cmwgKSAtPlxuXG5cdFx0IyBkb24ndCBoaWphY2sgbG9naW4gYWN0aW9uc1xuXHRcdGlmIHJlcS51cmwuaW5kZXhPZiAnL2xvZ2luJyBpcyAwIHRoZW4gcmV0dXJuIHRydWVcblxuXHRcdHdheXMuZ28gdXJsXG5cblx0XHRyZXR1cm4gZmFsc2VcblxuXHQjI1xuXHQjIExvb2tzIGZvciBpbnRlcm5hbCBsaW5rcyBhbmQgYmluZCB0aGVuIHRvIGNsaWVudCBzaWRlIG5hdmlnYXRpb25cblx0IyBhcyBpbjogaHRtbCBIaXN0b3J5IGFwaVxuXHQjI1xuXHRiaW5kOiAoIHNjb3BlID0gJ2JvZHknICkgLT5cblxuXHRcdCQoIHNjb3BlICkuZmluZCggJ2EnICkuZWFjaCAoIGluZGV4LCBpdGVtICkgLT5cblxuXHRcdFx0JGl0ZW0gPSAkIGl0ZW1cblx0XHRcdGhyZWYgPSAkaXRlbS5hdHRyKCAnaHJlZicgKVxuXG5cdFx0XHRpZiAhaHJlZj8gdGhlbiByZXR1cm4gXG5cblx0XHRcdCMgaWYgdGhlIGxpbmsgaGFzIGh0dHAgYW5kIHRoZSBkb21haW4gaXMgZGlmZmVyZW50XG5cdFx0XHRpZiBocmVmLmluZGV4T2YoICdodHRwJyApID49IDAgYW5kIGhyZWYuaW5kZXhPZiggZG9jdW1lbnQuZG9tYWluICkgPCAwIFxuXHRcdFx0XHRyZXR1cm4gXG5cblx0XHRcdGlmIGhyZWYuaW5kZXhPZiggXCIjXCIgKSBpcyAwXG5cdFx0XHRcdCRpdGVtLmNsaWNrIC0+IHJldHVybiBmYWxzZVxuXG5cdFx0XHRlbHNlIGlmIGhyZWYuaW5kZXhPZiggXCJqYXZhc2NyaXB0XCIgKSBpcyAwIG9yIGhyZWYuaW5kZXhPZiggXCJ0ZWw6XCIgKSBpcyAwXG5cdFx0XHRcdHJldHVybiB0cnVlXG5cdFx0XHRlbHNlXG5cdFx0XHRcdCRpdGVtLmNsaWNrIC0+IFxuXHRcdFx0XHRcdHJldHVybiBOYXZpZ2F0aW9uLmluc3RhbmNlLmdvICQoIEAgKS5hdHRyICdocmVmJ1xuXG5cbiMgd2lsbCBhbHdheXMgZXhwb3J0IHRoZSBzYW1lIGluc3RhbmNlXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBOYXZpZ2F0aW9uIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsK0JBQUE7R0FBQSwrRUFBQTs7QUFBQSxDQUFBLEVBQWEsSUFBQSxDQUFiLFlBQWE7O0FBQ2IsQ0FEQSxFQUNZLElBQVosRUFBWTs7QUFDWixDQUZBLEVBRVcsQ0FBWCxFQUFXLENBQUE7O0FBQ1gsQ0FIQSxFQUdBLENBQUksR0FBSyxPQUFBOztBQUVILENBTE47Q0FPQyxLQUFBLEVBQUE7O0NBQUEsQ0FBQSxDQUFXLENBQVgsSUFBQTs7Q0FHYSxDQUFBLENBQUEsaUJBQUE7Q0FFWixnREFBQTtDQUFBLE9BQUEsSUFBQTtDQUFBLEdBQUEsSUFBQSxFQUFhO0NBQ1osSUFBQSxDQUFBLENBQU8sc0NBQVA7Q0FFQSxXQUFBO01BSEQ7Q0FBQSxFQUtzQixDQUF0QixJQUFBLEVBQVU7Q0FMVixFQU1vQixDQUFwQixZQUFBLFNBTkE7Q0FBQSxFQU9lLENBQWYsT0FBQSxLQUFlO0NBUGYsR0FTQSxHQUFBO0NBVEEsRUFZYyxDQUFkLEVBQU07Q0FaTixDQWVVLENBQVYsQ0FBQSxPQUFBO0NBZkEsQ0FrQlcsQ0FBWCxDQUFBLENBQUEsSUFBVztDQUFJLEdBQUQsQ0FBQyxRQUFELENBQUE7Q0FBZCxJQUFXO0NBdkJaLEVBR2E7O0NBSGIsRUF5QmEsTUFBRSxFQUFmO0NBR0MsRUFBQSxLQUFBO09BQUEsS0FBQTtDQUFBLENBQWlDLENBQTlCLENBQUgsR0FBVTtDQUFWLEVBUUEsQ0FBQSxHQUFNO0NBUk4sR0FVQSxTQUFBO0NBRUksQ0FBYyxDQUFmLENBQUgsS0FBa0IsRUFBbEI7Q0FFQyxHQUFBLENBQUMsQ0FBRCxHQUFBO0NBRUEsRUFBTSxDQUFILEVBQUgsR0FBRztDQUNGLEVBQUcsQ0FBSyxHQUFSLENBQUE7Q0FBaUIsQ0FBVyxPQUFYLENBQUE7Q0FBakIsU0FBQTtRQUhEO0NBQUEsR0FNQSxDQUFDLENBQUQsVUFBQTtDQUVNLENBQUssQ0FBWCxFQUFBLElBQVcsSUFBWDtDQUVDLFVBQUEsQ0FBQTtDQUFBLEVBQWMsQ0FBQSxDQUFXLEdBQXpCLEdBQUEsS0FBYztDQUFkLEVBRWUsRUFBZCxHQUFELEdBQUEsS0FBZTtDQUZmLElBS0MsQ0FBRCxFQUFBLEdBQVk7Q0FMWixJQVFDLENBQUQsRUFBQSxHQUFZO0NBRVgsR0FBRCxDQUFDLFNBQUQsQ0FBQTtDQVpELE1BQVc7Q0FWWixJQUFrQjtDQXhDbkIsRUF5QmE7O0NBekJiLENBbUVBLENBQUksTUFBRTtDQUdMLEVBQU0sQ0FBTixDQUErQixFQUE1QixDQUFnQjtDQUFtQixHQUFBLFNBQU87TUFBN0M7Q0FBQSxDQUVBLENBQUEsQ0FBQTtDQUVBLElBQUEsTUFBTztDQTFFUixFQW1FSTs7Q0FuRUosRUFnRk0sQ0FBTixDQUFNLElBQUU7O0dBQVEsR0FBUjtNQUVQO0NBQUEsQ0FBcUMsQ0FBckMsQ0FBQSxDQUFBLElBQThCLEVBQTlCO0NBRUMsU0FBQSxDQUFBO0NBQUEsRUFBUSxDQUFBLENBQVIsQ0FBQTtDQUFBLEVBQ08sQ0FBUCxDQUFZLENBQVo7Q0FFQSxHQUFJLEVBQUosTUFBQTtDQUFlLGFBQUE7UUFIZjtDQU1BLEVBQXFFLENBQWxFLEVBQUgsQ0FBRyxDQUFzRDtDQUN4RCxhQUFBO1FBUEQ7Q0FTQSxFQUFHLENBQUEsQ0FBdUIsQ0FBMUIsQ0FBRztDQUNJLEVBQU0sRUFBUCxJQUFPLE1BQVo7Q0FBZSxJQUFBLFlBQU87Q0FBdEIsUUFBWTtDQUVBLEdBQUwsQ0FBZ0MsQ0FIeEMsQ0FHUSxDQUhSLElBR1E7Q0FDUCxHQUFBLFdBQU87TUFKUixFQUFBO0NBTU8sRUFBTSxFQUFQLElBQU8sTUFBWjtDQUNDLENBQU8sRUFBdUIsRUFBQSxFQUFKLEVBQVQsT0FBVjtDQURSLFFBQVk7UUFqQmM7Q0FBNUIsSUFBNEI7Q0FsRjdCLEVBZ0ZNOztDQWhGTjs7Q0FQRDs7QUErR0EsQ0EvR0EsRUErR2lCLEdBQVgsQ0FBTixHQS9HQSJ9fSx7Im9mZnNldCI6eyJsaW5lIjo1MDk1LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvY29udHJvbGxlcnMvdXNlci5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiaGFwcGVucyA9IHJlcXVpcmUgJ2hhcHBlbnMnXG5cbnVzZXIgPSBoYXBwZW5zXG5cdGxvZ291dDogKCBjYWxsYmFjayApIC0+XG5cdFx0QGVtaXQgJ3VzZXI6bG9nZ2VkX291dCdcblx0XHRkbyBjYWxsYmFja1xuXHRcblx0bG9naW46ICggY2FsbGJhY2sgKSAtPlxuXHRcdHVzZXIgPSBcblx0XHRcdHVzZXJuYW1lIDogXCJTdGVmYW5vIE9ydGlzaVwiXG5cdFx0XHR0aHVtYiAgICA6IFwiL2ltYWdlcy9wcm9maWxlLmpwZ1wiXG5cdFx0XHRwZXJtYWxpbms6IFwiL3Byb2ZpbGUvc3RlZmFub29ydGlzaVwiXG5cblx0XHRhcHAuYm9keS5hZGRDbGFzcyBcImxvZ2dlZFwiXG5cdFx0QGVtaXQgJ3VzZXI6bG9nZ2VkJywgdXNlclxuXG5tb2R1bGUuZXhwb3J0cyA9IHdpbmRvdy51c2VyX2NvbnRyb2xsZXIgPSB1c2VyIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsU0FBQTs7QUFBQSxDQUFBLEVBQVUsSUFBVixFQUFVOztBQUVWLENBRkEsRUFFTyxDQUFQLEdBQU87Q0FDTixDQUFBLENBQVEsR0FBUixFQUFRLENBQUU7Q0FDVCxHQUFBLGFBQUE7Q0FDQSxPQUFBLEdBQUc7Q0FGSixFQUFRO0NBQVIsQ0FJQSxDQUFPLEVBQVAsR0FBTyxDQUFFO0NBQ1IsRUFDQyxDQUREO0NBQ0MsQ0FBVyxJQUFYLEVBQUEsUUFBQTtDQUFBLENBQ1csR0FBWCxDQUFBLGVBREE7Q0FBQSxDQUVXLElBQVgsR0FBQSxlQUZBO0NBREQsS0FBQTtDQUFBLEVBS0csQ0FBSCxJQUFBO0NBQ0MsQ0FBb0IsRUFBcEIsT0FBRCxFQUFBO0NBWEQsRUFJTztDQVBSLENBRU87O0FBY1AsQ0FoQkEsRUFnQmlCLENBaEJqQixFQWdCTSxDQUFOLFFBQWlCIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjUxMTksImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy9jb250cm9sbGVycy92aWV3cy5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiaGFwcGVucyA9IHJlcXVpcmUgJ2hhcHBlbnMnXG5cbmNsYXNzIFZpZXdcblxuXHRVTklRVUVfSUQgIFx0PSAwXG5cblxuXHQjIyNcblx0SGFzaCBNYXAgdG8gc3RvcmUgdGhlIHZpZXdzOlxuXG5cdGhhc2hfbW9kZWwgPSB7XG5cdFx0XCI8dmlld19uYW1lPlwiIDogWyA8dmlld19pbnN0YW5jZT4sIDx2aWV3X2luc3RhbmNlPiwgLi4gXSxcblx0XHRcIjx2aWV3X25hbWU+XCIgOiBbIDx2aWV3X2luc3RhbmNlPiwgPHZpZXdfaW5zdGFuY2U+LCAuLiBdXG5cdH1cblx0IyMjXG5cdGhhc2hfbW9kZWwgIDoge31cblxuXG5cdCMjI1xuXHRVaWQgTWFwLiBJbnRlcm5hbCBtYXAgdXNlZCBmb3IgZWFzaWx5IGdldCBhIHZpZXcgYnkgdWlkXG5cblx0dWlkX21hcCA9IHtcblx0XHRcIjxVTklRVUVfSUQ+XCIgOiB7IG5hbWUgOiA8dmlld19uYW1lPiwgaW5kZXg6IDx2aWV3X2luZGV4PiB9LFxuXHRcdFwiPFVOSVFVRV9JRD5cIiA6IHsgbmFtZSA6IDx2aWV3X25hbWU+LCBpbmRleDogPHZpZXdfaW5kZXg+IH0sXG5cdFx0ICAuLi5cblx0fVxuXHQjIyNcblx0dWlkX21hcDoge31cblxuXG5cblxuXG5cdCMgR2V0IHRoZSB2aWV3IGZyb20gdGhlIGhhc2ggbW9kZWxcblx0Z2V0OiAoIGlkLCBpbmRleCA9IDAgKSA9PlxuXHRcdHVubGVzcyBAaGFzaF9tb2RlbFsgaWQgXT9cblx0XHRcdCMgY29uc29sZS5lcnJvciBcIlZpZXcgI3tpZH0gI3tpbmRleH0gZG9lc24ndCBleGlzdHNcIlxuXHRcdFx0cmV0dXJuIGZhbHNlXG5cblx0XHRAaGFzaF9tb2RlbFsgaWQgXVsgaW5kZXggXVxuXG5cblxuXHRnZXRfYnlfdWlkOiAoIHVpZCApID0+XG5cdFx0aWYgQHVpZF9tYXBbIHVpZCBdP1xuXHRcdFx0bmFtZSA9IEB1aWRfbWFwWyB1aWQgXS5uYW1lXG5cdFx0XHRpbmRleCA9IEB1aWRfbWFwWyB1aWQgXS5pbmRleFxuXG5cdFx0XHRyZXR1cm4gQGdldCBuYW1lLCBpbmRleFxuXG5cdFx0cmV0dXJuIGZhbHNlXG5cblx0Z2V0X2J5X2RvbTogKCBzZWxlY3RvciApID0+IEBnZXRfYnlfdWlkICQoIHNlbGVjdG9yICkuZGF0YSAndWlkJ1xuXG5cblxuXHRiaW5kOiAoIHNjb3BlID0gJ2JvZHknLCB0b2xvZyA9IGZhbHNlICkgLT5cblxuXHRcdCMgY29uc29sZS5lcnJvciBcIkJpbmRpbmdzIHZpZXdzOiAje3Njb3BlfVwiXG5cdFx0JCggc2NvcGUgKS5maW5kKCAnW2RhdGEtdmlld10nICkuZWFjaCggKCBpbmRleCwgaXRlbSApID0+XG5cblx0XHRcdCRpdGVtID0gJCBpdGVtXG5cblx0XHRcdHZpZXdfbmFtZSA9ICRpdGVtLmRhdGEoICd2aWV3JyApXG5cblx0XHRcdCRpdGVtLnJlbW92ZUF0dHIgJ2RhdGEtdmlldydcblxuXHRcdFx0aWYgdmlld19uYW1lLnN1YnN0cmluZygwLCAxKSBpcyBcIltcIlxuXHRcdFx0XHRuYW1lcyA9IHZpZXdfbmFtZS5zdWJzdHJpbmcoMSwgdmlld19uYW1lLmxlbmd0aCAtIDEpLnNwbGl0KFwiLFwiKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRuYW1lcyA9IFt2aWV3X25hbWVdXG5cblx0XHRcdGZvciBuYW1lIGluIG5hbWVzXG5cdFx0XHRcdEBfYWRkX3ZpZXcgJGl0ZW0sIG5hbWVcblxuXHRcdFx0IyByZW1vdmUgdGhlIGRhdGEtdmlldyBhdHRyaWJ1dGUsIHNvIGl0IHdvbid0IGJlIGluc3RhbnRpYXRlZCB0d2ljZSFcblx0XHRcdCRpdGVtLnJlbW92ZUF0dHIgJ2RhdGEtdmlldydcblxuXHRcdCkucHJvbWlzZSgpLmRvbmUgPT4gQGVtaXQgXCJiaW5kZWRcIlxuXG5cdHVuYmluZDogKCBzY29wZSA9ICdib2R5JyApIC0+XG5cdFx0JCggc2NvcGUgKS5maW5kKCAnW2RhdGEtdWlkXScgKS5lYWNoKCAoIGluZGV4LCBpdGVtICkgPT5cblxuXHRcdFx0JGl0ZW0gPSAkIGl0ZW1cblxuXHRcdFx0aWQgPSAkaXRlbS5kYXRhICd1aWQnXG5cblx0XHRcdHYgPSB2aWV3LmdldF9ieV91aWQgaWRcblxuXHRcdFx0aWYgdlxuXHRcdFx0XHR2LmRlc3Ryb3k/KClcblx0XHRcdFx0dmlldy5vbl92aWV3X2Rlc3Ryb3llZCBpZFxuXG5cdFx0KS5wcm9taXNlKCkuZG9uZSA9PiBAZW1pdCBcInVuYmluZGVkXCJcblxuXG5cblx0X2FkZF92aWV3OiAoICRpdGVtLCB2aWV3X25hbWUgKSAtPlxuXG5cdFx0dHJ5XG5cdFx0XHR2aWV3ID0gcmVxdWlyZSBcImFwcC92aWV3cy8je3ZpZXdfbmFtZX1cIlxuXHRcdGNhdGNoIGVcblx0XHRcdGNvbnNvbGUud2FybiAnZSAtPicsIGUubWVzc2FnZVxuXHRcdFx0Y29uc29sZS5lcnJvciBcImFwcC92aWV3cy8je3ZpZXd9IG5vdCBmb3VuZCBmb3IgXCIsICRpdGVtXG5cblx0XHR2aWV3ID0gbmV3IHZpZXcgJGl0ZW1cblxuXHRcdCMgU2F2ZSB0aGUgdmlldyBpbiBhIGhhc2ggbW9kZWxcblx0XHRAaGFzaF9tb2RlbFsgdmlld19uYW1lIF0gPz0gW11cblxuXHRcdGwgPSBAaGFzaF9tb2RlbFsgdmlld19uYW1lIF0ubGVuZ3RoXG5cblx0XHRAaGFzaF9tb2RlbFsgdmlld19uYW1lIF1bIGwgXSA9IHZpZXdcblxuXG5cdFx0IyBTYXZlIHRoZSBpbmNyZW1lbnRhbCB1aWQgdG8gdGhlIGRvbSBhbmQgdG8gdGhlIGluc3RhbmNlXG5cdFx0dmlldy51aWQgPSBVTklRVUVfSURcblx0XHR2aWV3LnZpZXdfbmFtZSA9IHZpZXdfbmFtZVxuXG5cdFx0IyBsb2cgXCJbdmlld10gYWRkXCIsIHZpZXcudWlkLCB2aWV3LnZpZXdfbmFtZVxuXG5cdFx0JGl0ZW0uYXR0ciAnZGF0YS11aWQnLCBVTklRVUVfSURcblxuXHRcdCMgU2F2ZSB0aGUgdmlldyBpbiBhIGxpbmVhciBhcnJheSBtb2RlbFxuXHRcdEB1aWRfbWFwWyBVTklRVUVfSUQgXSA9XG5cdFx0XHRuYW1lICA6IHZpZXdfbmFtZVxuXHRcdFx0aW5kZXggOiBAaGFzaF9tb2RlbFsgdmlld19uYW1lIF0ubGVuZ3RoIC0gMVxuXG5cblx0XHRVTklRVUVfSUQrK1xuXG5cblxuXG5cdG9uX3ZpZXdfZGVzdHJveWVkOiAoIHVpZCApIC0+XG5cdFx0XG5cdFx0IyBsb2cgXCJbVmlld10gb25fdmlld19kZXN0cm95ZWRcIiwgdWlkXG5cdFx0aWYgQHVpZF9tYXBbIHVpZCBdP1xuXG5cdFx0XHQjIEdldCB0aGUgZGF0YSBmcm9tIHRoZSB1aWQgbWFwXG5cdFx0XHRuYW1lICA9IEB1aWRfbWFwWyB1aWQgXS5uYW1lXG5cdFx0XHRpbmRleCA9IEB1aWRfbWFwWyB1aWQgXS5pbmRleFxuXG5cdFx0XHQjIGRlbGV0ZSB0aGUgcmVmZXJlbmNlIGluIHRoZSBtb2RlbFxuXHRcdFx0aWYgQGhhc2hfbW9kZWxbIG5hbWUgXVsgaW5kZXggXT9cblxuXHRcdFx0XHQjIGRlbGV0ZSB0aGUgaXRlbSBmcm9tIHRoZSB1aWRfbWFwXG5cdFx0XHRcdGRlbGV0ZSBAdWlkX21hcFsgdWlkIF1cblxuXHRcdFx0XHQjIERlbGV0ZSB0aGUgaXRlbSBmcm9tIHRoZSBoYXNoX21vZGVsXG5cdFx0XHRcdEBoYXNoX21vZGVsWyBuYW1lIF0uc3BsaWNlIGluZGV4LCAxXG5cblx0XHRcdFx0IyBVcGRhdGUgdGhlIGluZGV4IG9uIHRoZSB1aWRfbWFwIGZvciB0aGUgdmlld3MgbGVmdCBvZiB0aGUgc2FtZSB0eXBlXG5cdFx0XHRcdGZvciBpdGVtLCBpIGluIEBoYXNoX21vZGVsWyBuYW1lIF1cblx0XHRcdFx0XHRAdWlkX21hcFsgaXRlbS51aWQgXS5pbmRleCA9IGlcblxuXG5cdFx0XHRcdFxuXG5cblxudmlldyA9IG5ldyBWaWV3XG5oYXBwZW5zIHZpZXdcblxubW9kdWxlLmV4cG9ydHMgPSB3aW5kb3cudmlldyA9IHZpZXdcblxuXG4jIGV4cG9ydGluZyBnZXQgbWV0aG9kIGZvciB3aW5kb3csIHNvIHlvdSBjYW4gcmV0cmlldmUgdmlld3MganVzdCB3aXRoIFZpZXcoIGlkIClcbndpbmRvdy5WaWV3ID0gdmlldyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGVBQUE7R0FBQSwrRUFBQTs7QUFBQSxDQUFBLEVBQVUsSUFBVixFQUFVOztBQUVKLENBRk47Q0FJQyxLQUFBLEdBQUE7Ozs7OztDQUFBOztDQUFBLENBQUEsQ0FBYyxNQUFkOztDQUdBOzs7Ozs7OztDQUhBOztDQUFBLENBQUEsQ0FXYyxPQUFkOztDQUdBOzs7Ozs7Ozs7Q0FkQTs7Q0FBQSxDQUFBLENBdUJTLElBQVQ7O0NBdkJBLENBOEJLLENBQUwsRUFBSyxJQUFFOztHQUFZLEdBQVI7TUFDVjtDQUFBLEdBQUEsdUJBQUE7Q0FFQyxJQUFBLFFBQU87TUFGUjtDQUlDLENBQVksRUFBWixDQUFrQixLQUFOLENBQWI7Q0FuQ0QsRUE4Qks7O0NBOUJMLEVBdUNZLE1BQUUsQ0FBZDtDQUNDLE9BQUEsR0FBQTtDQUFBLEdBQUEscUJBQUE7Q0FDQyxFQUFPLENBQVAsRUFBQSxDQUFpQjtDQUFqQixFQUNRLENBQUMsQ0FBVCxDQUFBLENBQWtCO0NBRWxCLENBQWtCLENBQVgsQ0FBQyxDQUFELFFBQUE7TUFKUjtDQU1BLElBQUEsTUFBTztDQTlDUixFQXVDWTs7Q0F2Q1osRUFnRFksS0FBQSxDQUFFLENBQWQ7Q0FBNkIsR0FBQSxDQUFXLEdBQUEsRUFBWixDQUFBO0NBaEQ1QixFQWdEWTs7Q0FoRFosQ0FvRHdCLENBQWxCLENBQU4sQ0FBTSxJQUFFO0NBR1AsT0FBQSxJQUFBOztHQUhlLEdBQVI7TUFHUDs7R0FIK0IsR0FBUjtNQUd2QjtDQUFBLENBQWdELENBQVQsQ0FBdkMsQ0FBQSxJQUF5QyxFQUF6QyxFQUFBO0NBRUMsU0FBQSw2QkFBQTtDQUFBLEVBQVEsQ0FBQSxDQUFSLENBQUE7Q0FBQSxFQUVZLENBQUEsQ0FBSyxDQUFqQixHQUFBO0NBRkEsSUFJSyxDQUFMLElBQUEsQ0FBQTtDQUVBLENBQTBCLENBQTFCLENBQUcsQ0FBNkIsQ0FBaEMsR0FBWTtDQUNYLENBQStCLENBQXZCLEVBQVIsQ0FBK0IsRUFBL0IsQ0FBaUI7TUFEbEIsRUFBQTtDQUdDLEVBQVEsRUFBUixHQUFBLENBQVE7UUFUVDtBQVdBLENBQUEsVUFBQSxpQ0FBQTswQkFBQTtDQUNDLENBQWtCLEVBQWxCLENBQUMsR0FBRCxDQUFBO0NBREQsTUFYQTtDQWVNLElBQUQsS0FBTCxDQUFBLEVBQUE7Q0FqQkQsRUFtQmlCLENBbkJqQixDQUF1QyxFQUF2QyxFQW1CaUI7Q0FBSSxHQUFELENBQUMsR0FBRCxLQUFBO0NBbkJwQixJQW1CaUI7Q0ExRWxCLEVBb0RNOztDQXBETixFQTRFUSxFQUFBLENBQVIsR0FBVTtDQUNULE9BQUEsSUFBQTs7R0FEaUIsR0FBUjtNQUNUO0NBQUEsQ0FBK0MsQ0FBVCxDQUF0QyxDQUFBLElBQXdDLEVBQXhDLENBQUE7Q0FFQyxTQUFBLEVBQUE7Q0FBQSxFQUFRLENBQUEsQ0FBUixDQUFBO0NBQUEsQ0FFQSxDQUFLLENBQUEsQ0FBSyxDQUFWO0NBRkEsQ0FJSSxDQUFBLENBQUksRUFBUixJQUFJO0NBRUosR0FBRyxFQUFIOztDQUNFLFNBQUQ7VUFBQTtDQUNLLENBQUwsRUFBSSxXQUFKLEVBQUE7UUFWb0M7Q0FBdEMsRUFZaUIsQ0FaakIsQ0FBc0MsRUFBdEMsRUFZaUI7Q0FBSSxHQUFELENBQUMsS0FBRCxHQUFBO0NBWnBCLElBWWlCO0NBekZsQixFQTRFUTs7Q0E1RVIsQ0E2Rm9CLENBQVQsRUFBQSxJQUFYO0NBRUMsT0FBQSxTQUFBO0NBQUE7Q0FDQyxFQUFPLENBQVAsRUFBQSxDQUFPLEVBQUEsR0FBUztNQURqQjtDQUdDLEtBREs7Q0FDTCxDQUFxQixFQUFyQixFQUFBLENBQU87Q0FBUCxDQUNrRCxDQUF4QixDQUFYLENBQWYsQ0FBQSxDQUFPLEtBQVEsS0FBZjtNQUpEO0NBQUEsRUFNVyxDQUFYLENBQVc7O0NBR0UsRUFBZSxFQUFmLElBQUE7TUFUYjtDQUFBLEVBV0ksQ0FBSixFQVhBLEdBV2lCLENBQUE7Q0FYakIsRUFhZ0MsQ0FBaEMsS0FBYSxDQUFBO0NBYmIsRUFpQkEsQ0FBQSxLQWpCQTtDQUFBLEVBa0JpQixDQUFqQixLQUFBO0NBbEJBLENBc0J1QixFQUF2QixDQUFLLElBQUwsQ0FBQTtDQXRCQSxFQTBCQyxDQURELEdBQVUsRUFBQTtDQUNULENBQVEsRUFBUixFQUFBLEdBQUE7Q0FBQSxDQUNRLENBQWtDLENBQWpDLENBQVQsQ0FBQSxHQUFxQixDQUFBO0NBM0J0QixLQUFBO0FBOEJBLENBaENVLFFBZ0NWLEVBQUE7Q0E3SEQsRUE2Rlc7O0NBN0ZYLEVBa0ltQixNQUFFLFFBQXJCO0NBR0MsT0FBQSxzQ0FBQTtDQUFBLEdBQUEscUJBQUE7Q0FHQyxFQUFRLENBQVIsRUFBQSxDQUFrQjtDQUFsQixFQUNRLENBQUMsQ0FBVCxDQUFBLENBQWtCO0NBR2xCLEdBQUcsRUFBSCw4QkFBQTtBQUdDLENBQUEsRUFBaUIsQ0FBVCxFQUFSLENBQWlCLENBQWpCO0NBQUEsQ0FHa0MsRUFBakMsQ0FBRCxDQUFBLEVBQUEsRUFBYTtDQUdiO0NBQUE7Y0FBQSxxQ0FBQTswQkFBQTtDQUNDLEVBQVUsQ0FBVCxDQUFELEVBQVU7Q0FEWDt5QkFURDtRQVBEO01BSGtCO0NBbEluQixFQWtJbUI7O0NBbEluQjs7Q0FKRDs7QUFpS0EsQ0FqS0EsRUFpS08sQ0FBUDs7QUFDQSxDQWxLQSxHQWtLQSxHQUFBOztBQUVBLENBcEtBLEVBb0tpQixDQUFBLEVBQVgsQ0FBTjs7QUFJQSxDQXhLQSxFQXdLYyxDQUFkLEVBQU0ifX0seyJvZmZzZXQiOnsibGluZSI6NTI5MSwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL2NvbnRyb2xsZXJzL3dpbmRvdy5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiaGFwcGVucyA9IHJlcXVpcmUgJ2hhcHBlbnMnXG5cbiMgY3JlYXRlIGFuZCBleHBvcnQgYSBuZXcgaGFwcGVucyBvYmplY3Rcbm1vZHVsZS5leHBvcnRzID0gaGFwcGVucyggd2luID0ge30gKVxuXG4jIGV2ZW50IGhhbmRsaW5nIGZvciB3aW5kb3cgcmVzaXplXG53aW4ub2JqID0gJCB3aW5kb3dcbndpbi5vYmoub24gJ3Jlc2l6ZScsIG9uX3Jlc2l6ZSA9IC0+XG5cdHdpbi53ID0gd2luLm9iai53aWR0aCgpXG5cdHdpbi5oID0gd2luLm9iai5oZWlnaHQoKVxuXHR3aW4uZW1pdCAncmVzaXplJ1xuXG4jIHRyaWdnZXIgcmVzaXplIGF1dG9tYXRpY2FsbHkgYWZ0ZXIgMTAwIG1zXG5kZWxheSAxMDAsIG9uX3Jlc2l6ZVxuXG4jIGdsb2JhbCBjbGljayBldmVudFxuJCggJ2h0bWwsYm9keScgKS5vbiAnY2xpY2snLCAtPiB3aW4uZW1pdCBcImJvZHk6Y2xpY2tlZFwiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsbUJBQUE7O0FBQUEsQ0FBQSxFQUFVLElBQVYsRUFBVTs7QUFHVixDQUhBLENBR2lCLENBQUEsR0FBWCxDQUFOOztBQUdBLENBTkEsRUFNRyxHQUFPOztBQUNWLENBUEEsQ0FPQSxDQUFHLEtBQUgsQ0FBcUI7Q0FDcEIsQ0FBQSxDQUFHLEVBQUs7Q0FBUixDQUNBLENBQUcsR0FBSztDQUNKLEVBQUQsQ0FBSCxJQUFBLENBQUE7Q0FIZ0M7O0FBTWpDLENBYkEsQ0FhVyxDQUFYLEVBQUEsSUFBQTs7QUFHQSxDQWhCQSxDQWdCQSxDQUE2QixJQUE3QixFQUE2QixFQUE3QjtDQUFvQyxFQUFELENBQUgsS0FBQSxLQUFBO0NBQUgifX0seyJvZmZzZXQiOnsibGluZSI6NTMxMywiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL2dsb2JhbHMuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIyBvbiB0aGUgYnJvd3Nlciwgd2luZG93IGlzIHRoZSBnbG9iYWwgaG9sZGVyXG4jIyNcblxuIyB1dGlsc1xuXG53aW5kb3cuZGVsYXkgPSByZXF1aXJlICcuL2dsb2JhbHMvZGVsYXknXG5cbndpbmRvdy5sb2cgICA9IHJlcXVpcmUgJy4vZ2xvYmFscy9sb2cnXG5cbndpbmRvdy5tb3ZlciA9IHJlcXVpcmUgJy4vZ2xvYmFscy9tb3ZlcidcblxuIyB3aWRlbHkgdXNlZCBtb2R1bGVzXG5cbndpbmRvdy5oYXBwZW5zID0gcmVxdWlyZSAnaGFwcGVucydcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHdpbmRvdyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0NBQUE7QUFNQSxDQU5BLEVBTWUsRUFBZixDQUFNLENBQVMsVUFBQTs7QUFFZixDQVJBLEVBUUEsR0FBTSxDQUFTLFFBQUE7O0FBRWYsQ0FWQSxFQVVlLEVBQWYsQ0FBTSxDQUFTLFVBQUE7O0FBSWYsQ0FkQSxFQWNpQixHQUFYLENBQU4sRUFBaUI7O0FBR2pCLENBakJBLEVBaUJpQixHQUFYLENBQU4ifX0seyJvZmZzZXQiOnsibGluZSI6NTMyOSwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL2dsb2JhbHMvZGVsYXkuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gKCBkZWxheSwgZnVuayApIC0+IHNldFRpbWVvdXQgZnVuaywgZGVsYXkiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsQ0FBTyxDQUFtQixDQUFULENBQUEsQ0FBQSxDQUFYLENBQU4sRUFBbUI7Q0FBNEIsQ0FBTSxFQUFqQixDQUFBLElBQUEsQ0FBQTtDQUFuQiJ9fSx7Im9mZnNldCI6eyJsaW5lIjo1MzM1LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvZ2xvYmFscy9sb2cuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gLT5cblx0bG9nLmhpc3RvcnkgPSBsb2cuaGlzdG9yeSBvciBbXSAjIHN0b3JlIGxvZ3MgdG8gYW4gYXJyYXkgZm9yIHJlZmVyZW5jZVxuXHRsb2cuaGlzdG9yeS5wdXNoIGFyZ3VtZW50c1xuXG5cdGlmIGNvbnNvbGU/XG5cdFx0Y29uc29sZS5sb2cgQXJyYXk6OnNsaWNlLmNhbGwoYXJndW1lbnRzKSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxDQUFPLEVBQVUsR0FBWCxDQUFOLEVBQWlCO0NBQ2hCLENBQUEsQ0FBRyxDQUEwQixHQUE3QjtDQUFBLENBQ0EsQ0FBRyxDQUFILEdBQVcsRUFBWDtDQUVBLENBQUEsRUFBRyw4Q0FBSDtDQUNTLEVBQVIsQ0FBWSxDQUFLLEVBQVYsRUFBWSxFQUFuQjtJQUxlO0NBQUEifX0seyJvZmZzZXQiOnsibGluZSI6NTM0NSwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL2dsb2JhbHMvbW92ZXIuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gXG5cdHNjcm9sbF90byA6IChlbCwgd2l0aF90b3BiYXIgPSBmYWxzZSwgc3BlZWQgPSAzMDApIC0+XG5cblx0XHR5ID0gZWwucG9zaXRpb24oKS50b3BcblxuXHRcdGxvZyBcIltNb3Zlcl0gc2Nyb2xsX3RvXCIsIHlcblx0XHRAc2Nyb2xsX3RvX3kgeSwgd2l0aF90b3BiYXIsIHNwZWVkXG5cdFx0XG5cblx0c2Nyb2xsX3RvX3k6ICh5LCB3aXRoX3RvcGJhciA9IHRydWUsIHNwZWVkID0gMzAwKSAtPlxuXHRcdGlmIHdpdGhfdG9wYmFyXG5cdFx0XHR5IC09IGFwcC5zZXR0aW5ncy5oZWFkZXJfaGVpZ2h0XG5cblx0XHRsb2cgXCJbbW92ZXJdIHNjcm9sbF90b195XCIsIHlcblx0XHRcblx0XHQkKCAnaHRtbCwgYm9keScgKS5hbmltYXRlIHNjcm9sbFRvcDogeSwgc3BlZWQiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsQ0FBTyxFQUNOLEdBREssQ0FBTjtDQUNDLENBQUEsQ0FBWSxFQUFBLElBQVosRUFBWTtDQUVYLE9BQUE7O0dBRjhCLEdBQWQ7TUFFaEI7O0dBRjZDLEdBQVI7TUFFckM7Q0FBQSxDQUFNLENBQUYsQ0FBSixJQUFJO0NBQUosQ0FFeUIsQ0FBekIsQ0FBQSxlQUFBO0NBQ0MsQ0FBZSxFQUFmLENBQUQsTUFBQTtDQUxELEVBQVk7Q0FBWixDQVFBLENBQWEsRUFBQSxJQUFDLEVBQWQ7O0dBQStCLEdBQWQ7TUFDaEI7O0dBRDRDLEdBQVI7TUFDcEM7Q0FBQSxHQUFBLE9BQUE7Q0FDQyxFQUFRLENBQUgsRUFBTCxFQUFpQixLQUFqQjtNQUREO0NBQUEsQ0FHMkIsQ0FBM0IsQ0FBQSxpQkFBQTtDQUVBLE1BQUEsSUFBQSxDQUFBO0NBQTBCLENBQVcsSUFBWCxHQUFBO0NBTmQsQ0FNNEIsR0FBeEMsQ0FBQTtDQWRELEVBUWE7Q0FUZCxDQUFBIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjUzNzcsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy91dGlscy9icm93c2VyLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJCcm93c2VyRGV0ZWN0ID1cblx0aW5pdDogKCApIC0+XG5cdFx0QGJyb3dzZXIgPSBAc2VhcmNoU3RyaW5nKEBkYXRhQnJvd3Nlcikgb3IgXCJBbiB1bmtub3duIGJyb3dzZXJcIlxuXHRcdEB2ZXJzaW9uID0gQHNlYXJjaFZlcnNpb24obmF2aWdhdG9yLnVzZXJBZ2VudCkgb3IgQHNlYXJjaFZlcnNpb24obmF2aWdhdG9yLmFwcFZlcnNpb24pIG9yIFwiYW4gdW5rbm93biB2ZXJzaW9uXCJcblx0XHRAT1MgPSBAc2VhcmNoU3RyaW5nKEBkYXRhT1MpIG9yIFwiYW4gdW5rbm93biBPU1wiXG5cblx0c2VhcmNoU3RyaW5nOiAoZGF0YSkgLT5cblx0XHRpID0gMFxuXG5cdFx0d2hpbGUgaSA8IGRhdGEubGVuZ3RoXG5cdFx0XHRkYXRhU3RyaW5nID0gZGF0YVtpXS5zdHJpbmdcblx0XHRcdGRhdGFQcm9wID0gZGF0YVtpXS5wcm9wXG5cdFx0XHRAdmVyc2lvblNlYXJjaFN0cmluZyA9IGRhdGFbaV0udmVyc2lvblNlYXJjaCBvciBkYXRhW2ldLmlkZW50aXR5XG5cdFx0XHRpZiBkYXRhU3RyaW5nXG5cdFx0XHRcdHJldHVybiBkYXRhW2ldLmlkZW50aXR5ICB1bmxlc3MgZGF0YVN0cmluZy5pbmRleE9mKGRhdGFbaV0uc3ViU3RyaW5nKSBpcyAtMVxuXHRcdFx0ZWxzZSByZXR1cm4gZGF0YVtpXS5pZGVudGl0eSAgaWYgZGF0YVByb3Bcblx0XHRcdGkrK1xuXHRcdHJldHVyblxuXG5cdHNlYXJjaFZlcnNpb246IChkYXRhU3RyaW5nKSAtPlxuXHRcdGluZGV4ID0gZGF0YVN0cmluZy5pbmRleE9mKEB2ZXJzaW9uU2VhcmNoU3RyaW5nKVxuXHRcdHJldHVybiAgaWYgaW5kZXggaXMgLTFcblx0XHRwYXJzZUZsb2F0IGRhdGFTdHJpbmcuc3Vic3RyaW5nKGluZGV4ICsgQHZlcnNpb25TZWFyY2hTdHJpbmcubGVuZ3RoICsgMSlcblxuXHRkYXRhQnJvd3NlcjogW1xuXHRcdHtcblx0XHRcdHN0cmluZzogbmF2aWdhdG9yLnVzZXJBZ2VudFxuXHRcdFx0c3ViU3RyaW5nOiBcIkNocm9tZVwiXG5cdFx0XHRpZGVudGl0eTogXCJDaHJvbWVcIlxuXHRcdH1cblx0XHR7XG5cdFx0XHRzdHJpbmc6IG5hdmlnYXRvci51c2VyQWdlbnRcblx0XHRcdHN1YlN0cmluZzogXCJPbW5pV2ViXCJcblx0XHRcdHZlcnNpb25TZWFyY2g6IFwiT21uaVdlYi9cIlxuXHRcdFx0aWRlbnRpdHk6IFwiT21uaVdlYlwiXG5cdFx0fVxuXHRcdHtcblx0XHRcdHN0cmluZzogbmF2aWdhdG9yLnZlbmRvclxuXHRcdFx0c3ViU3RyaW5nOiBcIkFwcGxlXCJcblx0XHRcdGlkZW50aXR5OiBcIlNhZmFyaVwiXG5cdFx0XHR2ZXJzaW9uU2VhcmNoOiBcIlZlcnNpb25cIlxuXHRcdH1cblx0XHR7XG5cdFx0XHRwcm9wOiB3aW5kb3cub3BlcmFcblx0XHRcdGlkZW50aXR5OiBcIk9wZXJhXCJcblx0XHRcdHZlcnNpb25TZWFyY2g6IFwiVmVyc2lvblwiXG5cdFx0fVxuXHRcdHtcblx0XHRcdHN0cmluZzogbmF2aWdhdG9yLnZlbmRvclxuXHRcdFx0c3ViU3RyaW5nOiBcImlDYWJcIlxuXHRcdFx0aWRlbnRpdHk6IFwiaUNhYlwiXG5cdFx0fVxuXHRcdHtcblx0XHRcdHN0cmluZzogbmF2aWdhdG9yLnZlbmRvclxuXHRcdFx0c3ViU3RyaW5nOiBcIktERVwiXG5cdFx0XHRpZGVudGl0eTogXCJLb25xdWVyb3JcIlxuXHRcdH1cblx0XHR7XG5cdFx0XHRzdHJpbmc6IG5hdmlnYXRvci51c2VyQWdlbnRcblx0XHRcdHN1YlN0cmluZzogXCJGaXJlZm94XCJcblx0XHRcdGlkZW50aXR5OiBcIkZpcmVmb3hcIlxuXHRcdH1cblx0XHR7XG5cdFx0XHRzdHJpbmc6IG5hdmlnYXRvci52ZW5kb3Jcblx0XHRcdHN1YlN0cmluZzogXCJDYW1pbm9cIlxuXHRcdFx0aWRlbnRpdHk6IFwiQ2FtaW5vXCJcblx0XHR9XG5cdFx0e1xuXHRcdFx0IyBmb3IgbmV3ZXIgTmV0c2NhcGVzICg2Kylcblx0XHRcdHN0cmluZzogbmF2aWdhdG9yLnVzZXJBZ2VudFxuXHRcdFx0c3ViU3RyaW5nOiBcIk5ldHNjYXBlXCJcblx0XHRcdGlkZW50aXR5OiBcIk5ldHNjYXBlXCJcblx0XHR9XG5cdFx0e1xuXHRcdFx0c3RyaW5nOiBuYXZpZ2F0b3IudXNlckFnZW50XG5cdFx0XHRzdWJTdHJpbmc6IFwiTVNJRVwiXG5cdFx0XHRpZGVudGl0eTogXCJFeHBsb3JlclwiXG5cdFx0XHR2ZXJzaW9uU2VhcmNoOiBcIk1TSUVcIlxuXHRcdH1cblx0XHR7XG5cdFx0XHRzdHJpbmc6IG5hdmlnYXRvci51c2VyQWdlbnRcblx0XHRcdHN1YlN0cmluZzogXCJHZWNrb1wiXG5cdFx0XHRpZGVudGl0eTogXCJNb3ppbGxhXCJcblx0XHRcdHZlcnNpb25TZWFyY2g6IFwicnZcIlxuXHRcdH1cblx0XHR7XG5cdFx0XHQjIGZvciBvbGRlciBOZXRzY2FwZXMgKDQtKVxuXHRcdFx0c3RyaW5nOiBuYXZpZ2F0b3IudXNlckFnZW50XG5cdFx0XHRzdWJTdHJpbmc6IFwiTW96aWxsYVwiXG5cdFx0XHRpZGVudGl0eTogXCJOZXRzY2FwZVwiXG5cdFx0XHR2ZXJzaW9uU2VhcmNoOiBcIk1vemlsbGFcIlxuXHRcdH1cblx0XVxuXHRkYXRhT1M6IFtcblx0XHR7XG5cdFx0XHRzdHJpbmc6IG5hdmlnYXRvci5wbGF0Zm9ybVxuXHRcdFx0c3ViU3RyaW5nOiBcIldpblwiXG5cdFx0XHRpZGVudGl0eTogXCJXaW5kb3dzXCJcblx0XHR9XG5cdFx0e1xuXHRcdFx0c3RyaW5nOiBuYXZpZ2F0b3IucGxhdGZvcm1cblx0XHRcdHN1YlN0cmluZzogXCJNYWNcIlxuXHRcdFx0aWRlbnRpdHk6IFwiTWFjXCJcblx0XHR9XG5cdFx0e1xuXHRcdFx0c3RyaW5nOiBuYXZpZ2F0b3IudXNlckFnZW50XG5cdFx0XHRzdWJTdHJpbmc6IFwiaVBob25lXCJcblx0XHRcdGlkZW50aXR5OiBcImlQaG9uZS9pUG9kXCJcblx0XHR9XG5cdFx0e1xuXHRcdFx0c3RyaW5nOiBuYXZpZ2F0b3IucGxhdGZvcm1cblx0XHRcdHN1YlN0cmluZzogXCJMaW51eFwiXG5cdFx0XHRpZGVudGl0eTogXCJMaW51eFwiXG5cdFx0fVxuXHRdXG5cbkJyb3dzZXJEZXRlY3QuaW5pdCgpXG5cbm1vZHVsZS5leHBvcnRzID0gQnJvd3NlckRldGVjdCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFNBQUE7O0FBQUEsQ0FBQSxFQUNDLFVBREQ7Q0FDQyxDQUFBLENBQU0sQ0FBTixLQUFNO0NBQ0wsRUFBVyxDQUFYLEdBQUEsSUFBVyxDQUFBLFFBQVg7Q0FBQSxFQUNXLENBQVgsR0FBQSxFQUFtQyxDQUFlLEdBQXZDLE9BRFg7Q0FFQyxDQUFELENBQU0sQ0FBTCxFQUFLLEtBQU4sQ0FBTTtDQUhQLEVBQU07Q0FBTixDQUtBLENBQWMsQ0FBQSxLQUFDLEdBQWY7Q0FDQyxPQUFBLGVBQUE7Q0FBQSxFQUFJLENBQUo7Q0FFQSxFQUFVLENBQUksRUFBZCxLQUFNO0NBQ0wsRUFBYSxDQUFLLEVBQWxCLElBQUE7Q0FBQSxFQUNXLENBQUssRUFBaEIsRUFBQTtDQURBLEVBRXVCLENBQXRCLEVBQUQsRUFGQSxLQUV1QixNQUF2QjtDQUNBLEdBQUcsRUFBSCxJQUFBO0FBQzJFLENBQTFFLEdBQWdDLENBQXlDLEVBQXpDLENBQWhDLENBQWdDLENBQVU7Q0FBMUMsR0FBWSxJQUFaLFNBQU87VUFEUjtNQUFBLEVBQUE7Q0FFSyxHQUE0QixJQUE1QjtDQUFBLEdBQVksSUFBWixTQUFPO1VBRlo7UUFIQTtBQU1BLENBTkEsQ0FBQSxJQU1BO0NBVlksSUFHYjtDQVJELEVBS2M7Q0FMZCxDQWtCQSxDQUFlLE1BQUMsQ0FBRCxHQUFmO0NBQ0MsSUFBQSxHQUFBO0NBQUEsRUFBUSxDQUFSLENBQUEsRUFBUSxHQUFVLFNBQVY7QUFDYSxDQUFyQixHQUFBLENBQVc7Q0FBWCxXQUFBO01BREE7Q0FFVyxFQUE2QixDQUFDLENBQVQsQ0FBQSxHQUFyQixDQUFYLENBQUEsUUFBNEQ7Q0FyQjdELEVBa0JlO0NBbEJmLENBdUJBLFNBQUE7S0FDQztDQUFBLENBQ1MsSUFBUixHQUFpQjtDQURsQixDQUVZLElBQVgsRUFGRCxDQUVDO0NBRkQsQ0FHVyxJQUFWLEVBQUE7RUFFRCxJQU5ZO0NBTVosQ0FDUyxJQUFSLEdBQWlCO0NBRGxCLENBRVksSUFBWCxHQUFBO0NBRkQsQ0FHZ0IsSUFBZixJQUhELEdBR0M7Q0FIRCxDQUlXLElBQVYsRUFBQSxDQUpEO0VBTUEsSUFaWTtDQVlaLENBQ1MsSUFBUixHQUFpQjtDQURsQixDQUVZLElBQVgsQ0FGRCxFQUVDO0NBRkQsQ0FHVyxJQUFWLEVBQUE7Q0FIRCxDQUlnQixJQUFmLEdBSkQsSUFJQztFQUVELElBbEJZO0NBa0JaLENBQ08sRUFBTixDQURELENBQ0M7Q0FERCxDQUVXLElBQVYsQ0FGRCxDQUVDO0NBRkQsQ0FHZ0IsSUFBZixHQUhELElBR0M7RUFFRCxJQXZCWTtDQXVCWixDQUNTLElBQVIsR0FBaUI7Q0FEbEIsQ0FFWSxJQUFYLEdBQUE7Q0FGRCxDQUdXLElBQVYsRUFBQTtFQUVELElBNUJZO0NBNEJaLENBQ1MsSUFBUixHQUFpQjtDQURsQixDQUVZLEdBRlosQ0FFQyxHQUFBO0NBRkQsQ0FHVyxJQUFWLEVBQUEsR0FIRDtFQUtBLElBakNZO0NBaUNaLENBQ1MsSUFBUixHQUFpQjtDQURsQixDQUVZLElBQVgsR0FBQTtDQUZELENBR1csSUFBVixFQUFBLENBSEQ7RUFLQSxJQXRDWTtDQXNDWixDQUNTLElBQVIsR0FBaUI7Q0FEbEIsQ0FFWSxJQUFYLEVBRkQsQ0FFQztDQUZELENBR1csSUFBVixFQUFBO0VBRUQsSUEzQ1k7Q0EyQ1osQ0FFUyxJQUFSLEdBQWlCO0NBRmxCLENBR1ksSUFBWCxHQUFBLENBSEQ7Q0FBQSxDQUlXLElBQVYsRUFBQSxFQUpEO0VBTUEsSUFqRFk7Q0FpRFosQ0FDUyxJQUFSLEdBQWlCO0NBRGxCLENBRVksSUFBWCxHQUFBO0NBRkQsQ0FHVyxJQUFWLEVBQUEsRUFIRDtDQUFBLENBSWdCLElBQWYsT0FBQTtFQUVELElBdkRZO0NBdURaLENBQ1MsSUFBUixHQUFpQjtDQURsQixDQUVZLElBQVgsQ0FGRCxFQUVDO0NBRkQsQ0FHVyxJQUFWLEVBQUEsQ0FIRDtDQUFBLENBSWdCLEVBSmhCLEVBSUMsT0FBQTtFQUVELElBN0RZO0NBNkRaLENBRVMsSUFBUixHQUFpQjtDQUZsQixDQUdZLElBQVgsR0FBQTtDQUhELENBSVcsSUFBVixFQUFBLEVBSkQ7Q0FBQSxDQUtnQixJQUFmLEdBTEQsSUFLQztNQWxFVztJQXZCYjtDQUFBLENBNEZBLElBQUE7S0FDQztDQUFBLENBQ1MsSUFBUixFQURELENBQ2tCO0NBRGxCLENBRVksR0FGWixDQUVDLEdBQUE7Q0FGRCxDQUdXLElBQVYsRUFBQSxDQUhEO0VBS0EsSUFOTztDQU1QLENBQ1MsSUFBUixFQURELENBQ2tCO0NBRGxCLENBRVksR0FGWixDQUVDLEdBQUE7Q0FGRCxDQUdXLEdBSFgsQ0FHQyxFQUFBO0VBRUQsSUFYTztDQVdQLENBQ1MsSUFBUixHQUFpQjtDQURsQixDQUVZLElBQVgsRUFGRCxDQUVDO0NBRkQsQ0FHVyxJQUFWLEVBQUEsS0FIRDtFQUtBLElBaEJPO0NBZ0JQLENBQ1MsSUFBUixFQURELENBQ2tCO0NBRGxCLENBRVksSUFBWCxDQUZELEVBRUM7Q0FGRCxDQUdXLElBQVYsQ0FIRCxDQUdDO01BbkJNO0lBNUZSO0NBREQsQ0FBQTs7QUFvSEEsQ0FwSEEsR0FvSEEsU0FBYTs7QUFFYixDQXRIQSxFQXNIaUIsR0FBWCxDQUFOLE1BdEhBIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjU0OTUsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy91dGlscy9vcGFjaXR5LmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJPcGFjaXR5ID0gXG5cdHNob3c6IChlbCwgdGltZSA9IDMwMCkgLT5cblx0XHQjIGxvZyBcIltPcGFjaXR5XSBzaG93XCJcblx0XHRlbC5mYWRlSW4gdGltZVxuXHRcdCMgdCA9IE9wYWNpdHkuZ2V0X3RpbWUoIHRpbWUgKVxuXHRcdCMgZWwuY3NzIFxuXHRcdCMgXHQndmlzaWJpbGl0eScgOiBcInZpc2libGVcIlxuXHRcdCMgXHQndHJhbnNpdGlvbicgOiBcIm9wYWNpdHkgI3t0fSBsaW5lYXJcIlxuXG5cdFx0IyBkZWxheSAxLCAtPlxuXHRcdCMgXHRlbC5jc3MgJ29wYWNpdHknLCAxXG5cblx0aGlkZTogKCBlbCwgdGltZSA9IDMwMCApIC0+XG5cdFx0IyBsb2cgXCJbT3BhY2l0eV0gaGlkZVwiXG5cdFx0ZWwuZmFkZU91dCB0aW1lXG5cblx0XHQjIHQgPSBPcGFjaXR5LmdldF90aW1lIHRpbWVcblx0XHQjIHQxID0gT3BhY2l0eS5nZXRfdGltZSggdGltZSArIDEwMCApXG5cblx0XHQjIGVsLmNzcyAndHJhbnNpdGlvbicsIFwib3BhY2l0eSAje3R9IGxpbmVhclwiXG5cdFx0IyBkZWxheSAxLCAtPiBlbC5jc3MgJ29wYWNpdHknLCAwXG5cdFx0IyBkZWxheSB0MSwgLT4gZWwuY3NzICd2aXNpYmlsaXR5JywgJ2hpZGRlbidcblxuXHRnZXRfdGltZTogKCB0aW1lICkgLT5cblx0XHRyZXR1cm4gKHRpbWUvMTAwMCkgKyBcInNcIlxuXG5tb2R1bGUuZXhwb3J0cyA9IE9wYWNpdHkiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxHQUFBOztBQUFBLENBQUEsRUFDQyxJQUREO0NBQ0MsQ0FBQSxDQUFNLENBQU4sS0FBTzs7R0FBVyxHQUFQO01BRVY7Q0FBRyxDQUFELEVBQUYsRUFBQSxLQUFBO0NBRkQsRUFBTTtDQUFOLENBV0EsQ0FBTSxDQUFOLEtBQVE7O0dBQVcsR0FBUDtNQUVYO0NBQUcsQ0FBRCxFQUFGLEdBQUEsSUFBQTtDQWJELEVBV007Q0FYTixDQXNCQSxDQUFVLENBQUEsSUFBVixDQUFZO0NBQ1gsRUFBYSxDQUFMLE9BQUQ7Q0F2QlIsRUFzQlU7Q0F2QlgsQ0FBQTs7QUEwQkEsQ0ExQkEsRUEwQmlCLEdBQVgsQ0FBTiJ9fSx7Im9mZnNldCI6eyJsaW5lIjo1NTE5LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdXRpbHMvc2V0dGluZ3MuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIkJyb3dzZXJEZXRlY3QgPSByZXF1aXJlICdhcHAvdXRpbHMvYnJvd3Nlcidcblxuc2V0dGluZ3MgPSBcblxuXHQjIEJyb3dzZXIgaWQsIHZlcnNpb24sIE9TXG5cdGJyb3dzZXI6IHtcblxuXHRcdCMgSUQgW1N0cmluZ11cblx0XHRpZDogQnJvd3NlckRldGVjdC5icm93c2VyXG5cblx0XHQjIFZlcnNpb24gW1N0cmluZ11cblx0XHR2ZXJzaW9uOiBCcm93c2VyRGV0ZWN0LnZlcnNpb25cblx0XHRcblx0XHQjIE9TIFtTdHJpbmddXG5cdFx0T1M6IEJyb3dzZXJEZXRlY3QuT1Ncblx0XHRcblx0XHQjIElzIENocm9tZT8gW0Jvb2xlYW5dXG5cdFx0Y2hyb21lOiAobmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpLmluZGV4T2YoICdjaHJvbWUnICkgPiAtMSlcblxuXHRcdCMgSXMgRmlyZWZveCBbQm9vbGVhbl1cblx0XHRmaXJlZm94OiAoL0ZpcmVmb3gvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpKVxuXG5cdFx0IyBJcyBJRTg/IFtCb29sZWFuXVxuXHRcdGllODogZmFsc2VcblxuXHRcdCMgRGV2aWNlIHJhdGlvIFtOdW1iZXJdXG5cdFx0ZGV2aWNlX3JhdGlvOiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpb1xuXG5cdFx0IyBJcyBhIGhhbmRoZWxkIGRldmljZT8gW0Jvb2xlYW5dXG5cdFx0aGFuZGhlbGQ6IGZhbHNlXG5cblx0XHQjIElzIGEgdGFibGV0PyBbQm9vbGVhbl1cblx0XHR0YWJsZXQ6IGZhbHNlXG5cdFx0XG5cdFx0IyBJcyBhIG1vYmlsZT8gW0Jvb2xlYW5dXG5cdFx0bW9iaWxlOiBmYWxzZVxuXG5cdFx0IyBJcyBkZXNrdG9wPyBTZXQgYWZ0ZXIgdGhlIGNsYXNzIGRlZmluaXRpb24gW0Jvb2xlYW5dXG5cdFx0ZGVza3RvcDogZmFsc2VcblxuXHRcdCMgSXMgYSB0YWJsZXQgb3IgbW9iaWxlPyBbQm9vbGVhbl1cblx0XHRkZXZpY2U6IGZhbHNlXG5cblx0XHQjIERlYnVnIG1vZGUgLSBzZXQgYnkgZW52IGluIGluZGV4LnBocFxuXHRcdGRlYnVnOiBmYWxzZVxuXG5cdFx0Y3NzX2NvdmVyX3N1cHBvcnRlZDogTW9kZXJuaXpyLmJhY2tncm91bmRzaXplXG5cblx0XHRtaW5fc2l6ZTpcblx0XHRcdHc6IDkwMFxuXHRcdFx0aDogNDAwXG5cdH1cblxuXHQjIFVzZSB0aGlzIGZsYWcgaWYgd2VyZSBkb2luZyBrZXlmcmFtZSBhbmltYXRpb25zXG5cdCMgb3RoZXJ3aXNlIGltcGxlbWVudCBhIGpzIGZhbGxiYWNrXG5cblx0IyBXZWJwIHN1cHBvcnRcblx0d2VicDogZmFsc2Vcblxuc2V0dGluZ3MudGhlbWUgPSBcImRlc2t0b3BcIlxuc2V0dGluZ3MudGhyZXNob2xkX3RoZW1lID0gOTAwXG5cblxuIyBSZXRpbmEgc3VwcG9ydGVkIFtCb29sZWFuXVxuc2V0dGluZ3MuYnJvd3Nlci5yZXRpbmEgPSBzZXR0aW5ncy5icm93c2VyLmRldmljZV9yYXRpbyBpcyAyXG5cbiMgV2VicCB0ZXN0XG5pZiBzZXR0aW5ncy5icm93c2VyLmNocm9tZSBhbmQgc2V0dGluZ3MuYnJvd3Nlci52ZXJzaW9uID49IDMwXG5cdHNldHRpbmdzLndlYnAgPSB0cnVlXG5cbiMgRmxhZ3MgZm9yIElFXG5pZiBzZXR0aW5ncy5icm93c2VyLmlkIGlzICdFeHBsb3JlcicgXG5cdHNldHRpbmdzLmJyb3dzZXIuaWUgPSB0cnVlXG5cdGlmIHNldHRpbmdzLmJyb3dzZXIudmVyc2lvbiBpcyA4XG5cdFx0c2V0dGluZ3MuYnJvd3Nlci5pZTggPSB0cnVlXG5cdGlmIHNldHRpbmdzLmJyb3dzZXIudmVyc2lvbiBpcyA5XG5cdFx0c2V0dGluZ3MuYnJvd3Nlci5pZTkgPSB0cnVlXG5cblxuIyBJZiBpdCdzIGFuIGhhbmRoZWxkIGRldmljZVxuc2V0dGluZ3MudmlkZW9fYWN0aXZlID0gc2V0dGluZ3MuYnJvd3Nlci5pZCBpc250ICdFeHBsb3JlcidcblxuXG5cbmlmKCAvQW5kcm9pZHx3ZWJPU3xpUGhvbmV8aVBhZHxpUG9kfEJsYWNrQmVycnl8SUVNb2JpbGV8T3BlcmEgTWluaS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkgKVxuXHRzZXR0aW5ncy5icm93c2VyLmhhbmRoZWxkID0gdHJ1ZVxuXG5cdCMgQ2hlY2sgaWYgaXQncyBtb2JpbGUgb3IgdGFibGV0IGNhbGN1bGF0aW5nIHJhdGlvIGFuZCBvcmllbnRhdGlvblxuXHRyYXRpbyA9ICQod2luZG93KS53aWR0aCgpLyQod2luZG93KS5oZWlnaHQoKVxuXHRzZXR0aW5ncy5icm93c2VyLm9yaWVudGF0aW9uID0gaWYgcmF0aW8gPiAxIHRoZW4gXCJsYW5kc2NhcGVcIiBlbHNlIFwicG9ydHJhaXRcIlxuXG5cdCMgY2hlY2sgbWF4IHdpZHRoIGZvciBtb2JpbGUgZGV2aWNlIChuZXh1cyA3IGluY2x1ZGVkKVxuXHRpZiAkKHdpbmRvdykud2lkdGgoKSA8IDYxMCBvciAoc2V0dGluZ3MuYnJvd3Nlci5vcmllbnRhdGlvbiBpcyBcImxhbmRzY2FwZVwiIGFuZCByYXRpbyA+IDIuMTAgKVxuXHRcdHNldHRpbmdzLmJyb3dzZXIubW9iaWxlID0gdHJ1ZVxuXHRcdHNldHRpbmdzLmJyb3dzZXIudGFibGV0ID0gZmFsc2Vcblx0ZWxzZVxuXHRcdHNldHRpbmdzLmJyb3dzZXIubW9iaWxlID0gZmFsc2Vcblx0XHRzZXR0aW5ncy5icm93c2VyLnRhYmxldCA9IHRydWVcblxuc2V0dGluZ3MuYnJvd3Nlci5kZXZpY2UgPSAoc2V0dGluZ3MuYnJvd3Nlci50YWJsZXQgb3Igc2V0dGluZ3MuYnJvd3Nlci5tb2JpbGUpXG5cbiMgU2V0IGRlc2t0b3AgZmxhZ1xuaWYgc2V0dGluZ3MuYnJvd3Nlci50YWJsZXQgaXMgZmFsc2UgYW5kICBzZXR0aW5ncy5icm93c2VyLm1vYmlsZSBpcyBmYWxzZVxuXHRzZXR0aW5ncy5icm93c2VyLmRlc2t0b3AgPSB0cnVlXG5cblxuc2V0dGluZ3MuYnJvd3Nlci53aW5kb3dzX3Bob25lID0gZmFsc2VcbmlmIHNldHRpbmdzLmJyb3dzZXIubW9iaWxlIGFuZCBzZXR0aW5ncy5icm93c2VyLmlkIGlzICdFeHBsb3Jlcidcblx0c2V0dGluZ3MuYnJvd3Nlci53aW5kb3dzX3Bob25lID0gdHJ1ZVxuXG5cbnNldHRpbmdzLnRvdWNoX2RldmljZSA9IHNldHRpbmdzLmJyb3dzZXIuaGFuZGhlbGRcblxuIyBQbGF0Zm9ybSBzcGVjaWZpYyBldmVudHMgbWFwXG5zZXR0aW5ncy5ldmVudHNfbWFwID1cblx0J2Rvd24nIDogJ21vdXNlZG93bidcblx0J3VwJyAgIDogJ21vdXNldXAnXG5cdCdtb3ZlJyA6ICdtb3VzZW1vdmUnXG5cbmlmIHNldHRpbmdzLmJyb3dzZXIuZGV2aWNlXG5cblx0aWYgc2V0dGluZ3MuYnJvd3Nlci53aW5kb3dzX3Bob25lXG5cdFx0c2V0dGluZ3MuZXZlbnRzX21hcCA9XG5cdFx0XHQnZG93bicgOiAnTVNQb2ludGVyRG93bidcblx0XHRcdCd1cCcgICA6ICdNU1BvaW50ZXJVcCdcblx0XHRcdCdtb3ZlJyA6ICdNU1BvaW50ZXJNb3ZlJ1xuXHRcdFx0XG5cdGVsc2Vcblx0XHRzZXR0aW5ncy5ldmVudHNfbWFwID1cblx0XHRcdCdkb3duJyA6ICd0b3VjaHN0YXJ0J1xuXHRcdFx0J3VwJyAgIDogJ3RvdWNoZW5kJ1xuXHRcdFx0J21vdmUnIDogJ3RvdWNobW92ZSdcblxuXG5cblxuIyBQbGF0Zm9ybSBjbGFzc1xuaWYgc2V0dGluZ3MuYnJvd3Nlci5kZXNrdG9wXG5cdHBsYXRmb3JtID0gJ2Rlc2t0b3AnXG5lbHNlIGlmIHNldHRpbmdzLmJyb3dzZXIudGFibGV0XG5cdHBsYXRmb3JtID0gJ3RhYmxldCdcbmVsc2Vcblx0cGxhdGZvcm0gPSAnbW9iaWxlJ1xuXG4jIEJyb3dzZXIgY2xhc3MgZm9yIHRoZSBib2R5XG5zZXR0aW5ncy5icm93c2VyX2NsYXNzID0gc2V0dGluZ3MuYnJvd3Nlci5pZCArICdfJyArIHNldHRpbmdzLmJyb3dzZXIudmVyc2lvblxuXG5oYXMzZCA9IC0+XG5cdGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIilcblx0aGFzM2QgPSB1bmRlZmluZWRcblx0dHJhbnNmb3JtcyA9XG5cdFx0d2Via2l0VHJhbnNmb3JtOiBcIi13ZWJraXQtdHJhbnNmb3JtXCJcblx0XHRPVHJhbnNmb3JtOiBcIi1vLXRyYW5zZm9ybVwiXG5cdFx0bXNUcmFuc2Zvcm06IFwiLW1zLXRyYW5zZm9ybVwiXG5cdFx0TW96VHJhbnNmb3JtOiBcIi1tb3otdHJhbnNmb3JtXCJcblx0XHR0cmFuc2Zvcm06IFwidHJhbnNmb3JtXCJcblxuXG5cdCMgQWRkIGl0IHRvIHRoZSBib2R5IHRvIGdldCB0aGUgY29tcHV0ZWQgc3R5bGUuXG5cdGRvY3VtZW50LmJvZHkuaW5zZXJ0QmVmb3JlIGVsLCBudWxsXG5cdGZvciB0IG9mIHRyYW5zZm9ybXNcblx0XHRpZiBlbC5zdHlsZVt0XSBpc250IGB1bmRlZmluZWRgXG5cdFx0XHRlbC5zdHlsZVt0XSA9IFwidHJhbnNsYXRlM2QoMXB4LDFweCwxcHgpXCJcblx0XHRcdGhhczNkID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWwpLmdldFByb3BlcnR5VmFsdWUodHJhbnNmb3Jtc1t0XSlcblx0ZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZCBlbFxuXHRoYXMzZCBpc250IGB1bmRlZmluZWRgIGFuZCBoYXMzZC5sZW5ndGggPiAwIGFuZCBoYXMzZCBpc250IFwibm9uZVwiXG5cblxuIyBzZXR0aW5ncy5oYXMzZCA9IGhhczNkKClcblxuXG5cbnNldHRpbmdzLmJpbmQgPSAoYm9keSktPlxuXHRrbGFzc2VzID0gW11cblx0a2xhc3Nlcy5wdXNoIHNldHRpbmdzLmJyb3dzZXJfY2xhc3Ncblx0a2xhc3Nlcy5wdXNoIHNldHRpbmdzLmJyb3dzZXIuT1MucmVwbGFjZSggJy8nLCAnXycgKVxuXHRrbGFzc2VzLnB1c2ggc2V0dGluZ3MuYnJvd3Nlci5pZFxuXG5cdGlmIHNldHRpbmdzLnRvdWNoX2RldmljZVxuXHRcdGtsYXNzZXMucHVzaCBcInRvdWNoX2RldmljZVwiXG5cdGVsc2Vcblx0XHRrbGFzc2VzLnB1c2ggXCJub190b3VjaF9kZXZpY2VcIlxuXG5cdGlmIHNldHRpbmdzLmJyb3dzZXIuY3NzX2NvdmVyX3N1cHBvcnRlZFxuXHRcdGtsYXNzZXMucHVzaCBcImNzc19jb3Zlcl9zdXBwb3J0ZWRcIlxuXG5cdGJvZHkuYWRkQ2xhc3Mga2xhc3Nlcy5qb2luKCBcIiBcIiApLnRvTG93ZXJDYXNlKClcblxuXHRzZXR0aW5ncy5oZWFkZXJfaGVpZ2h0ID0gJCggJ2hlYWRlcicgKS5oZWlnaHQoKVxuXHQjIGJvZHkuY3NzIFxuXHQjIFx0J21pbi13aWR0aCcgIDogc2V0dGluZ3MuYnJvd3Nlci5taW5fc2l6ZS53XG5cdCMgXHQnbWluLWhlaWdodCcgOiBzZXR0aW5ncy5icm93c2VyLm1pbl9zaXplLmhcblxuXG5cbiMgVEVNUFxuXG4jIHNldHRpbmdzLnZpZGVvX2FjdGl2ZSA9IGZhbHNlXG4jIHNldHRpbmdzLmNzc19jb3Zlcl9zdXBwb3J0ZWQgPSBmYWxzZVxuXG5cbm1vZHVsZS5leHBvcnRzID0gc2V0dGluZ3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSwyQ0FBQTs7QUFBQSxDQUFBLEVBQWdCLElBQUEsTUFBaEIsTUFBZ0I7O0FBRWhCLENBRkEsRUFLQyxLQUhEO0NBR0MsQ0FBQSxLQUFBO0NBQVMsQ0FHUixFQUFBLEdBSFEsTUFHUztDQUhULENBTUMsRUFBVCxHQUFBLE1BQXNCO0NBTmQsQ0FTUixFQUFBLFNBQWlCO0FBR2lELENBWjFELENBWUMsQ0FBd0QsQ0FBakUsRUFBQSxDQUFTLENBQUEsQ0FBUyxFQUFUO0NBWkQsQ0FlRSxFQUFWLEdBQUEsRUFBbUMsQ0FBZjtDQWZaLENBa0JILENBQUwsQ0FBQSxDQWxCUTtDQUFBLENBcUJNLEVBQWQsRUFBb0IsTUFBcEIsSUFyQlE7Q0FBQSxDQXdCRSxFQUFWLENBeEJRLEdBd0JSO0NBeEJRLENBMkJBLEVBQVIsQ0EzQlEsQ0EyQlI7Q0EzQlEsQ0E4QkEsRUFBUixDQTlCUSxDQThCUjtDQTlCUSxDQWlDQyxFQUFULENBakNRLEVBaUNSO0NBakNRLENBb0NBLEVBQVIsQ0FwQ1EsQ0FvQ1I7Q0FwQ1EsQ0F1Q0QsRUFBUCxDQUFBO0NBdkNRLENBeUNhLEVBQXJCLEtBQThCLEtBekN0QixLQXlDUjtDQXpDUSxDQTRDUCxFQURELElBQUE7Q0FDQyxDQUFHLENBQUgsR0FBQTtDQUFBLENBQ0csQ0FESCxHQUNBO01BN0NPO0lBQVQ7Q0FBQSxDQW9EQSxFQUFBLENBcERBO0NBTEQsQ0FBQTs7QUEyREEsQ0EzREEsRUEyRGlCLEVBQWpCLEdBQVEsQ0EzRFI7O0FBNERBLENBNURBLEVBNEQyQixLQUFuQixPQUFSOztBQUlBLENBaEVBLEVBZ0UwQixFQUFpQyxDQUEzRCxDQUFnQixDQUFSLElBQWtCOztBQUcxQixDQUFBLENBQUEsRUFBRyxFQUFBLENBQWdCLENBQVI7Q0FDVixDQUFBLENBQWdCLENBQWhCLElBQVE7RUFwRVQ7O0FBdUVBLENBQUEsQ0FBRyxFQUFBLENBQXVCLEVBQVAsQ0FBUixFQUFYO0NBQ0MsQ0FBQSxDQUFzQixDQUF0QixHQUFnQixDQUFSO0NBQ1IsQ0FBQSxFQUFHLENBQTRCLEVBQVosQ0FBUjtDQUNWLEVBQUEsQ0FBQSxHQUFnQixDQUFSO0lBRlQ7Q0FHQSxDQUFBLEVBQUcsQ0FBNEIsRUFBWixDQUFSO0NBQ1YsRUFBQSxDQUFBLEdBQWdCLENBQVI7SUFMVjtFQXZFQTs7QUFnRkEsQ0FoRkEsQ0FnRndCLENBQUEsRUFBeUIsRUFBVCxDQUFoQyxFQWhGUixFQWdGQTs7QUFJQSxDQUFBLEdBQUksS0FBK0UsdURBQWY7Q0FDbkUsQ0FBQSxDQUE0QixDQUE1QixHQUFnQixDQUFSO0NBQVIsQ0FHQSxDQUFRLEVBQVIsQ0FBUTtDQUhSLENBSUEsQ0FBa0MsRUFBQSxFQUFsQixDQUFSLEVBSlIsQ0FJQTtDQUdBLENBQUEsQ0FBdUIsQ0FBcEIsQ0FBQSxDQUFBLENBQTRDLENBQVIsR0FBUjtDQUM5QixFQUEwQixDQUExQixFQUFBLENBQWdCLENBQVI7Q0FBUixFQUMwQixDQUExQixDQURBLENBQ0EsQ0FBZ0IsQ0FBUjtJQUZULEVBQUE7Q0FJQyxFQUEwQixDQUExQixDQUFBLENBQUEsQ0FBZ0IsQ0FBUjtDQUFSLEVBQzBCLENBQTFCLEVBQUEsQ0FBZ0IsQ0FBUjtJQWJWO0VBcEZBOztBQW1HQSxDQW5HQSxFQW1HMkIsQ0FBMkIsRUFBdEQsQ0FBZ0IsQ0FBUjs7QUFHUixDQUFBLEdBQUcsQ0FBMkIsQ0FBM0IsQ0FBZ0IsQ0FBUjtDQUNWLENBQUEsQ0FBMkIsQ0FBM0IsR0FBZ0IsQ0FBUjtFQXZHVDs7QUEwR0EsQ0ExR0EsRUEwR2lDLEVBMUdqQyxFQTBHZ0IsQ0FBUixLQUFSOztBQUNBLENBQUEsQ0FBK0IsRUFBNUIsQ0FBbUQsQ0FBbkQsQ0FBZ0IsQ0FBUixFQUFYO0NBQ0MsQ0FBQSxDQUFpQyxDQUFqQyxHQUFnQixDQUFSLEtBQVI7RUE1R0Q7O0FBK0dBLENBL0dBLEVBK0d3QixJQUFnQixDQUFoQyxJQUFSOztBQUdBLENBbEhBLEVBbUhDLEtBRE8sRUFBUjtDQUNDLENBQUEsSUFBQSxLQUFBO0NBQUEsQ0FDQSxFQUFBLEtBREE7Q0FBQSxDQUVBLElBQUEsS0FGQTtDQW5IRCxDQUFBOztBQXVIQSxDQUFBLEdBQUcsRUFBSCxDQUFtQixDQUFSO0NBRVYsQ0FBQSxFQUFHLEdBQWdCLENBQVIsS0FBWDtDQUNDLEVBQ0MsQ0FERCxJQUFRLEVBQVI7Q0FDQyxDQUFTLElBQVQsU0FBQTtDQUFBLENBQ1MsRUFBVCxFQUFBLE9BREE7Q0FBQSxDQUVTLElBQVQsU0FGQTtDQUZGLEtBQ0M7SUFERCxFQUFBO0NBT0MsRUFDQyxDQURELElBQVEsRUFBUjtDQUNDLENBQVMsSUFBVCxNQUFBO0NBQUEsQ0FDUyxFQUFULEVBQUEsSUFEQTtDQUFBLENBRVMsSUFBVCxLQUZBO0NBUkYsS0FPQztJQVRGO0VBdkhBOztBQXlJQSxDQUFBLEdBQUcsR0FBZ0IsQ0FBUjtDQUNWLENBQUEsQ0FBVyxLQUFYLENBQUE7Q0FDZ0IsQ0FGakIsRUFFUSxFQUZSLENBRXdCLENBQVI7Q0FDZixDQUFBLENBQVcsS0FBWDtFQUhELElBQUE7Q0FLQyxDQUFBLENBQVcsS0FBWDtFQTlJRDs7QUFpSkEsQ0FqSkEsQ0FpSnlCLENBQUEsSUFBZ0IsQ0FBakMsS0FBUjs7QUFFQSxDQW5KQSxFQW1KUSxFQUFSLElBQVE7Q0FDUCxLQUFBLFdBQUE7Q0FBQSxDQUFBLENBQUssS0FBUSxLQUFSO0NBQUwsQ0FDQSxDQUFRLEVBQVIsQ0FEQTtDQUFBLENBRUEsQ0FDQyxPQUREO0NBQ0MsQ0FBaUIsRUFBakIsV0FBQSxJQUFBO0NBQUEsQ0FDWSxFQUFaLE1BQUEsSUFEQTtDQUFBLENBRWEsRUFBYixPQUFBLElBRkE7Q0FBQSxDQUdjLEVBQWQsUUFBQSxJQUhBO0NBQUEsQ0FJVyxFQUFYLEtBQUEsRUFKQTtDQUhELEdBQUE7Q0FBQSxDQVdBLEVBQWEsSUFBTCxJQUFSO0FBQ0EsQ0FBQSxFQUFBLElBQUEsUUFBQTtDQUNDLENBQUssRUFBTCxDQUFZLElBQVo7Q0FDQyxDQUFFLENBQVksRUFBTCxDQUFULG9CQUFBO0NBQUEsQ0FDUSxDQUFBLEVBQVIsQ0FBQSxJQUFnRSxNQUF4RDtNQUhWO0NBQUEsRUFaQTtDQUFBLENBZ0JBLEVBQWEsSUFBTCxHQUFSO0NBQ2lDLEVBQVMsQ0FBZixDQUEzQixDQUEyQixHQUEzQjtDQWxCTzs7QUF5QlIsQ0E1S0EsRUE0S2dCLENBQWhCLElBQVEsQ0FBUztDQUNoQixLQUFBLENBQUE7Q0FBQSxDQUFBLENBQVUsSUFBVjtDQUFBLENBQ0EsRUFBQSxHQUFPLENBQWMsS0FBckI7Q0FEQSxDQUVBLENBQWEsQ0FBYixHQUFPLENBQWM7Q0FGckIsQ0FHQSxFQUFBLEdBQU8sQ0FBYztDQUVyQixDQUFBLEVBQUcsSUFBUSxJQUFYO0NBQ0MsR0FBQSxHQUFPLE9BQVA7SUFERCxFQUFBO0NBR0MsR0FBQSxHQUFPLFVBQVA7SUFSRDtDQVVBLENBQUEsRUFBRyxHQUFnQixDQUFSLFdBQVg7Q0FDQyxHQUFBLEdBQU8sY0FBUDtJQVhEO0NBQUEsQ0FhQSxDQUFjLENBQVYsR0FBaUIsQ0FBckIsR0FBYztDQUVMLEVBQWdCLEdBQUEsRUFBakIsQ0FBUixJQUFBO0NBaEJlOztBQTZCaEIsQ0F6TUEsRUF5TWlCLEdBQVgsQ0FBTixDQXpNQSJ9fSx7Im9mZnNldCI6eyJsaW5lIjo1NjcyLCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmVuZG9ycy5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsicmVxdWlyZSAnLi4vdmVuZG9ycy9tb2Rlcm5penIuY3VzdG9tLmpzJ1xucmVxdWlyZSAnLi4vdmVuZG9ycy9Mb2NhbENvbm5lY3Rpb24uanMnIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLENBQVEsTUFBUix5QkFBQTs7QUFDQSxDQURBLE1BQ0Esd0JBQUEifX0seyJvZmZzZXQiOnsibGluZSI6NTY3OCwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2NvbXBvbmVudHMvY2xpY2tfdHJpZ2dlci5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiSG92ZXJUcmlnZ2VyID0gcmVxdWlyZSAnYXBwL3ZpZXdzL2NvbXBvbmVudHMvaG92ZXJfdHJpZ2dlcidcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBDbGlja1RyaWdnZXIgZXh0ZW5kcyBIb3ZlclRyaWdnZXJcblxuXHRzZXRfbGlzdGVuZXJzOiAoICkgLT5cblx0XHRAZG9tLm9uICdjbGljaycsIEB0b2dnbGVcblx0XHRhcHAud2luZG93Lm9uIFwiYm9keTpjbGlja2VkXCIsIEBjbG9zZVxuXG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSw0QkFBQTtHQUFBO2tTQUFBOztBQUFBLENBQUEsRUFBZSxJQUFBLEtBQWYsd0JBQWU7O0FBRWYsQ0FGQSxFQUV1QixHQUFqQixDQUFOO0NBRUM7Ozs7O0NBQUE7O0NBQUEsRUFBZSxNQUFBLElBQWY7Q0FDQyxDQUFBLENBQUksQ0FBSixFQUFBLENBQUE7Q0FDSSxDQUFKLENBQUcsQ0FBNEIsQ0FBL0IsQ0FBVSxLQUFWLEdBQUE7Q0FGRCxFQUFlOztDQUFmOztDQUYyQyJ9fSx7Im9mZnNldCI6eyJsaW5lIjo1NzAzLCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvY29tcG9uZW50cy9mdWxsc2NyZWVuLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEZ1bGxzY3JlZW5cblx0Y29uc3RydWN0b3I6ICggQGRvbSApIC0+XG5cdFx0QGRvbS5hZGRDbGFzcyAnZnVsbHNjcmVlbidcblx0XHRhcHAud2luZG93Lm9uICdyZXNpemUnLCBAb25fcmVzaXplXG5cdFx0ZG8gQG9uX3Jlc2l6ZVxuXG5cdG9uX3Jlc2l6ZTogKCApID0+XG5cdFx0QGRvbS5jc3NcbiBcdFx0XHQnd2lkdGgnIDogJzEwMCUnXG4gXHRcdFx0J2hlaWdodCcgOiBhcHAud2luZG93LmggLSBhcHAuc2V0dGluZ3MuaGVhZGVyX2hlaWdodFxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsTUFBQTtHQUFBLCtFQUFBOztBQUFBLENBQUEsRUFBdUIsR0FBakIsQ0FBTjtDQUNjLENBQUEsQ0FBQSxpQkFBRztDQUNmLEVBRGUsQ0FBRDtDQUNkLDRDQUFBO0NBQUEsRUFBSSxDQUFKLElBQUEsSUFBQTtDQUFBLENBQ0EsQ0FBRyxDQUFILEVBQVUsRUFBVixDQUFBO0NBREEsR0FFRyxLQUFIO0NBSEQsRUFBYTs7Q0FBYixFQUtXLE1BQVg7Q0FDRSxFQUFHLENBQUgsT0FBRDtDQUNFLENBQVUsSUFBVixDQUFBO0NBQUEsQ0FDVyxDQUFHLEdBQWQsRUFBQSxLQURBO0NBRlEsS0FDVjtDQU5ELEVBS1c7O0NBTFg7O0NBREQifX0seyJvZmZzZXQiOnsibGluZSI6NTcyOCwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2NvbXBvbmVudHMvaG92ZXIuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbImhhcHBlbnMgPSByZXF1aXJlICdoYXBwZW5zJ1xubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBIb3ZlclxuXHRjb25zdHJ1Y3RvcjogKCBAZG9tICkgLT5cblx0XHRyZXR1cm4gaWYgYXBwLnNldHRpbmdzLnRvdWNoX2RldmljZVxuXG5cdFx0aGFwcGVucyBAXG5cdFx0XG5cdFx0QGRvbS5vbiAnbW91c2VvdmVyJywgQG9uX21vdXNlX292ZXJcblx0XHRAZG9tLm9uICdtb3VzZWxlYXZlJywgQG9uX21vdXNlX2xlYXZlXG5cblx0XHRAZG9tLmFkZENsYXNzICdob3Zlcl9vYmplY3QnXG5cblx0b25fbW91c2Vfb3ZlcjogKCApID0+XG5cdFx0QGRvbS5hZGRDbGFzcyAnaG92ZXJlZCdcblxuXHRvbl9tb3VzZV9sZWF2ZTogKCApID0+XG5cdFx0QGRvbS5yZW1vdmVDbGFzcyAnaG92ZXJlZCciXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxVQUFBO0dBQUEsK0VBQUE7O0FBQUEsQ0FBQSxFQUFVLElBQVYsRUFBVTs7QUFDVixDQURBLEVBQ3VCLEdBQWpCLENBQU47Q0FDYyxDQUFBLENBQUEsWUFBRztDQUNmLEVBRGUsQ0FBRDtDQUNkLHNEQUFBO0NBQUEsb0RBQUE7Q0FBQSxFQUFhLENBQWIsSUFBc0IsSUFBdEI7Q0FBQSxXQUFBO01BQUE7Q0FBQSxHQUVBLEdBQUE7Q0FGQSxDQUlBLENBQUksQ0FBSixPQUFBLEVBQUE7Q0FKQSxDQUtBLENBQUksQ0FBSixRQUFBLEVBQUE7Q0FMQSxFQU9JLENBQUosSUFBQSxNQUFBO0NBUkQsRUFBYTs7Q0FBYixFQVVlLE1BQUEsSUFBZjtDQUNFLEVBQUcsQ0FBSCxJQUFELENBQUEsRUFBQTtDQVhELEVBVWU7O0NBVmYsRUFhZ0IsTUFBQSxLQUFoQjtDQUNFLEVBQUcsQ0FBSCxLQUFELEVBQUE7Q0FkRCxFQWFnQjs7Q0FiaEI7O0NBRkQifX0seyJvZmZzZXQiOnsibGluZSI6NTc2MSwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2NvbXBvbmVudHMvaG92ZXJfdHJpZ2dlci5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiIyMjXG5BZGRzIHRoZSBjbGFzcyAnaG92ZXJlZCcgdG8gdGhlIGVsZW1lbnQgYW5kIHRvIHRoZSB0YXJnZXRcblRoZSBjbGFzcyBpcyB0b2dnbGVkIG9uIG1vdXNlb3Zlci9tb3VzZWxlYXZlIGZvciBkZXNrdG9wc1xuYW5kIG9uIGNsaWNrIGZvciB0b3VjaCBkZXZpY2VzXG4jIyNcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBIb3ZlclRyaWdnZXJcblx0b3BlbmVkOiBmYWxzZVxuXHRrbGFzczogXCJob3ZlcmVkXCJcblxuXHRjb25zdHJ1Y3RvcjogKCBAZG9tICkgLT5cblx0XHRAdGFyZ2V0ID0gJCBAZG9tLmRhdGEgJ3RhcmdldCdcblxuXHRcdGlmIEB0YXJnZXQubGVuZ3RoIDw9IDBcblx0XHRcdGxvZyBcIltIb3ZlclRyaWdnZXJdIGVycm9yLiB0YXJnZXQgbm90IGZvdW5kXCIsIEBkb20uZGF0YSggJ3RhcmdldCcgKVxuXHRcdFx0cmV0dXJuXG5cblx0XHRAZG9tLmFkZENsYXNzIFwiaG92ZXJfZHJvcGRvd25fdHJpZ2dlclwiXG5cdFx0QHNldF9saXN0ZW5lcnMoKVxuXG5cdFx0YXBwLm9uIFwiZHJvcGRvd246b3BlbmVkXCIsIEBvbl9kcm9wZG93bl9vcGVuZWRcblx0XHRhcHAub24gXCJkcm9wZG93bjpjbG9zZWRcIiwgQG9uX2Ryb3Bkb3duX2Nsb3NlZFxuXG5cdHNldF9saXN0ZW5lcnM6ICggKSAtPlxuXG5cdFx0aWYgYXBwLnNldHRpbmdzLnRvdWNoX2RldmljZVxuXHRcdFx0QGRvbS5vbiAnY2xpY2snLCBAdG9nZ2xlXG5cdFx0ZWxzZVxuXHRcdFx0QGRvbS5vbiAnbW91c2VvdmVyJywgQG9wZW5cblx0XHRcdEB0YXJnZXQub24gJ21vdXNlbGVhdmUnLCBAY2xvc2VcblxuXHRcdGFwcC53aW5kb3cub24gXCJib2R5OmNsaWNrZWRcIiwgQGNsb3NlXG5cblx0dG9nZ2xlOiAoIGUgKSA9PlxuXHRcdGlmIEBvcGVuZWRcblx0XHRcdGRvIEBjbG9zZVxuXHRcdGVsc2Vcblx0XHRcdGRvIEBvcGVuXG5cblx0XHRlLnN0b3BQcm9wYWdhdGlvbigpXG5cblxuXG5cdG9wZW46ICggKSA9PlxuXHRcdHJldHVybiBpZiBAb3BlbmVkXG5cdFx0QG9wZW5lZCA9IHRydWVcblxuXHRcdEBkb20uYWRkQ2xhc3MgQGtsYXNzXG5cdFx0QHRhcmdldC5hZGRDbGFzcyBAa2xhc3NcblxuXHRcdGFwcC5lbWl0IFwiZHJvcGRvd246b3BlbmVkXCIsIEB1aWRcblxuXHRjbG9zZTogKCApID0+XG5cdFx0cmV0dXJuIGlmIG5vdCBAb3BlbmVkXG5cdFx0QG9wZW5lZCA9IGZhbHNlXG5cblx0XHRAZG9tLnJlbW92ZUNsYXNzIEBrbGFzc1xuXHRcdEB0YXJnZXQucmVtb3ZlQ2xhc3MgQGtsYXNzXG5cblx0XHRhcHAuZW1pdCBcImRyb3Bkb3duOmNsb3NlZFwiLCBAdWlkXG5cblx0b25fZHJvcGRvd25fb3BlbmVkOiAoIGRhdGEgKSA9PlxuXHRcdEBjbG9zZSgpIGlmIGRhdGEgaXNudCBAdWlkXG5cblx0b25fZHJvcGRvd25fY2xvc2VkOiAoIGRhdGEgKSA9PlxuXG5cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Q0FBQTtDQUFBLEdBQUEsUUFBQTtHQUFBLCtFQUFBOztBQU1BLENBTkEsRUFNdUIsR0FBakIsQ0FBTjtDQUNDLEVBQVEsRUFBUixDQUFBOztDQUFBLEVBQ08sRUFBUCxJQURBOztDQUdhLENBQUEsQ0FBQSxtQkFBRztDQUNmLEVBRGUsQ0FBRDtDQUNkLDhEQUFBO0NBQUEsOERBQUE7Q0FBQSxvQ0FBQTtDQUFBLGtDQUFBO0NBQUEsc0NBQUE7Q0FBQSxFQUFVLENBQVYsRUFBQSxFQUFZO0NBRVosR0FBQSxFQUFVO0NBQ1QsQ0FBOEMsQ0FBOUMsQ0FBK0MsRUFBL0MsRUFBOEMsZ0NBQTlDO0NBQ0EsV0FBQTtNQUpEO0NBQUEsRUFNSSxDQUFKLElBQUEsZ0JBQUE7Q0FOQSxHQU9BLFNBQUE7Q0FQQSxDQVNBLENBQUcsQ0FBSCxhQUFBLENBQUE7Q0FUQSxDQVVBLENBQUcsQ0FBSCxhQUFBLENBQUE7Q0FkRCxFQUdhOztDQUhiLEVBZ0JlLE1BQUEsSUFBZjtDQUVDLEVBQU0sQ0FBTixJQUFlLElBQWY7Q0FDQyxDQUFBLENBQUksQ0FBSCxFQUFELENBQUE7TUFERDtDQUdDLENBQUEsQ0FBSSxDQUFILEVBQUQsS0FBQTtDQUFBLENBQ0EsRUFBQyxDQUFELENBQUEsTUFBQTtNQUpEO0NBTUksQ0FBSixDQUFHLENBQTRCLENBQS9CLENBQVUsS0FBVixHQUFBO0NBeEJELEVBZ0JlOztDQWhCZixFQTBCUSxHQUFSLEdBQVU7Q0FDVCxHQUFBLEVBQUE7Q0FDQyxHQUFJLENBQUosQ0FBRztNQURKO0NBR0MsR0FBSSxFQUFEO01BSEo7Q0FLQyxVQUFELElBQUE7Q0FoQ0QsRUEwQlE7O0NBMUJSLEVBb0NNLENBQU4sS0FBTTtDQUNMLEdBQUEsRUFBQTtDQUFBLFdBQUE7TUFBQTtDQUFBLEVBQ1UsQ0FBVixFQUFBO0NBREEsRUFHSSxDQUFKLENBQUEsR0FBQTtDQUhBLEdBSUEsQ0FBQSxDQUFPLEVBQVA7Q0FFSSxDQUF3QixDQUF6QixDQUFILE9BQUEsTUFBQTtDQTNDRCxFQW9DTTs7Q0FwQ04sRUE2Q08sRUFBUCxJQUFPO0FBQ1EsQ0FBZCxHQUFBLEVBQUE7Q0FBQSxXQUFBO01BQUE7Q0FBQSxFQUNVLENBQVYsQ0FEQSxDQUNBO0NBREEsRUFHSSxDQUFKLENBQUEsTUFBQTtDQUhBLEdBSUEsQ0FBQSxDQUFPLEtBQVA7Q0FFSSxDQUF3QixDQUF6QixDQUFILE9BQUEsTUFBQTtDQXBERCxFQTZDTzs7Q0E3Q1AsRUFzRG9CLENBQUEsS0FBRSxTQUF0QjtDQUNDLEVBQUEsQ0FBQSxDQUFzQjtDQUFyQixHQUFBLENBQUQsUUFBQTtNQURtQjtDQXREcEIsRUFzRG9COztDQXREcEIsRUF5RG9CLENBQUEsS0FBRSxTQUF0Qjs7Q0F6REE7O0NBUEQifX0seyJvZmZzZXQiOnsibGluZSI6NTg0NiwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2NvbXBvbmVudHMvbG9nb3V0X2xpbmsuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gY2xhc3MgTG9nb3V0TGlua1xuXHRjb25zdHJ1Y3RvcjogKCBAZG9tICkgLT5cblx0XHRAZG9tLm9uICdjbGljaycsIChlKSAtPlxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRlLnN0b3BQcm9wYWdhdGlvbigpXG5cblx0XHRcdHVzZXJfY29udHJvbGxlci5sb2dvdXQgLT5cblx0XHRcdFx0XG5cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLE1BQUE7O0FBQUEsQ0FBQSxFQUF1QixHQUFqQixDQUFOO0NBQ2MsQ0FBQSxDQUFBLGlCQUFHO0NBQ2YsRUFEZSxDQUFEO0NBQ2QsQ0FBQSxDQUFJLENBQUosR0FBQSxFQUFrQjtDQUNqQixLQUFBLFFBQUE7Q0FBQSxLQUNBLFNBQUE7Q0FFZ0IsRUFBTyxHQUF2QixHQUF1QixJQUF2QixFQUFlO0NBSmhCLElBQWlCO0NBRGxCLEVBQWE7O0NBQWI7O0NBREQifX0seyJvZmZzZXQiOnsibGluZSI6NTg2NCwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2NvbXBvbmVudHMvbW9kYWwuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gY2xhc3MgTW9kYWxcblx0b3BlbmVkOiBmYWxzZVxuXHRjb25zdHJ1Y3RvcjogKCBAZG9tICkgLT5cblx0XHRAb3ZlcmxheSA9ICQgJy5tZF9vdmVybGF5J1xuXG5cblx0b3BlbjogKCApIC0+XG5cdFx0cmV0dXJuIGlmIEBvcGVuZWRcblx0XHRAb3BlbmVkID0gdHJ1ZVxuXG5cdFx0QGRvbS5hZGRDbGFzcyAnbWRfc2hvdydcblxuXHRcdEBvdmVybGF5Lm9mZiggJ2NsaWNrJyApLm9uKCAnY2xpY2snLCBAY2xvc2UgKVxuXG5cdGNsb3NlOiAoICkgPT5cblx0XHRyZXR1cm4gaWYgbm90IEBvcGVuZWRcblx0XHRAb3BlbmVkID0gZmFsc2VcblxuXHRcdEBkb20ucmVtb3ZlQ2xhc3MgJ21kX3Nob3cnXHRcdCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLENBQUE7R0FBQSwrRUFBQTs7QUFBQSxDQUFBLEVBQXVCLEdBQWpCLENBQU47Q0FDQyxFQUFRLEVBQVIsQ0FBQTs7Q0FDYSxDQUFBLENBQUEsWUFBRztDQUNmLEVBRGUsQ0FBRDtDQUNkLG9DQUFBO0NBQUEsRUFBVyxDQUFYLEdBQUEsTUFBVztDQUZaLEVBQ2E7O0NBRGIsRUFLTSxDQUFOLEtBQU07Q0FDTCxHQUFBLEVBQUE7Q0FBQSxXQUFBO01BQUE7Q0FBQSxFQUNVLENBQVYsRUFBQTtDQURBLEVBR0ksQ0FBSixJQUFBLENBQUE7Q0FFQyxDQUFELENBQUEsQ0FBQyxDQUFELEVBQVEsSUFBUjtDQVhELEVBS007O0NBTE4sRUFhTyxFQUFQLElBQU87QUFDUSxDQUFkLEdBQUEsRUFBQTtDQUFBLFdBQUE7TUFBQTtDQUFBLEVBQ1UsQ0FBVixDQURBLENBQ0E7Q0FFQyxFQUFHLENBQUgsS0FBRCxFQUFBO0NBakJELEVBYU87O0NBYlA7O0NBREQifX0seyJvZmZzZXQiOnsibGluZSI6NTg5OSwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2NvbXBvbmVudHMvbW9kYWxfaGFuZGxlci5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBNb2RhbEhhbmRsZXJcblx0Y29uc3RydWN0b3I6ICggQGRvbSApIC0+XG5cdFx0dmlldy5vbmNlICdiaW5kZWQnLCBAb25fcmVhZHlcblxuXHRvbl9yZWFkeTogKCApID0+XG5cdFx0bW9kYWxfdGFyZ2V0ID0gdmlldy5nZXRfYnlfZG9tIEBkb20uZGF0YSggJ21vZGFsJyApXG5cdFx0QGRvbS5vbiAnY2xpY2snLCAtPiBtb2RhbF90YXJnZXQub3BlbigpIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsUUFBQTtHQUFBLCtFQUFBOztBQUFBLENBQUEsRUFBdUIsR0FBakIsQ0FBTjtDQUNjLENBQUEsQ0FBQSxtQkFBRztDQUNmLEVBRGUsQ0FBRDtDQUNkLDBDQUFBO0NBQUEsQ0FBb0IsRUFBcEIsSUFBQTtDQURELEVBQWE7O0NBQWIsRUFHVSxLQUFWLENBQVU7Q0FDVCxPQUFBLElBQUE7Q0FBQSxFQUFlLENBQWYsR0FBK0IsR0FBaEIsRUFBZjtDQUNDLENBQUQsQ0FBSSxDQUFILEdBQUQsRUFBaUIsRUFBakI7Q0FBaUMsR0FBYixRQUFZLENBQVo7Q0FBcEIsSUFBaUI7Q0FMbEIsRUFHVTs7Q0FIVjs7Q0FERCJ9fSx7Im9mZnNldCI6eyJsaW5lIjo1OTIzLCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvY29tcG9uZW50cy9wb3B1cF9oYW5kbGVyLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFBvcHVwSGFuZGxlclxuXHRjb25zdHJ1Y3RvcjogKCBAZG9tICkgLT5cblx0XHR1cmwgICBcdD0gQGRvbS5kYXRhICd1cmwnXG5cdFx0dGl0bGUgIFx0PSBAZG9tLmRhdGEgJ3RpdGxlJ1xuXHRcdHcgIFx0XHQ9IEBkb20uZGF0YSAndydcblx0XHRoICBcdFx0PSBAZG9tLmRhdGEgJ2gnXG5cblx0XHRAZG9tLm9uICdjbGljaycsIC0+XG5cdFx0XHRsZWZ0ID0gKGFwcC53aW5kb3cudy8yKS0ody8yKTtcblx0XHRcdHRvcCA9IChhcHAud2luZG93LmgvMiktKGgvMik7XG5cdFx0XHRyZXR1cm4gd2luZG93Lm9wZW4odXJsLCB0aXRsZSwgJ3Rvb2xiYXI9bm8sIGxvY2F0aW9uPW5vLCBkaXJlY3Rvcmllcz1ubywgc3RhdHVzPW5vLCBtZW51YmFyPW5vLCBzY3JvbGxiYXJzPW5vLCByZXNpemFibGU9bm8sIGNvcHloaXN0b3J5PW5vLCB3aWR0aD0nK3crJywgaGVpZ2h0PScraCsnLCB0b3A9Jyt0b3ArJywgbGVmdD0nK2xlZnQpLmZvY3VzKCk7XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxRQUFBOztBQUFBLENBQUEsRUFBdUIsR0FBakIsQ0FBTjtDQUNjLENBQUEsQ0FBQSxtQkFBRztDQUNmLE9BQUEsUUFBQTtDQUFBLEVBRGUsQ0FBRDtDQUNkLEVBQUEsQ0FBQSxDQUFTO0NBQVQsRUFDVSxDQUFWLENBQUEsRUFBVTtDQURWLEVBRU8sQ0FBUDtDQUZBLEVBR08sQ0FBUDtDQUhBLENBS0EsQ0FBSSxDQUFKLEdBQUEsRUFBaUI7Q0FDaEIsUUFBQSxDQUFBO0NBQUEsRUFBTyxDQUFQLEVBQUE7Q0FBQSxFQUNBLEdBQUE7Q0FDQSxDQUF3QixDQUFqQixDQUFBLENBQUEsQ0FBTSxFQUFrQixDQUFBLEVBQUEsRUFBeEIsd0dBQXdCO0NBSGhDLElBQWlCO0NBTmxCLEVBQWE7O0NBQWI7O0NBREQifX0seyJvZmZzZXQiOnsibGluZSI6NTk0NywiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2NvbXBvbmVudHMvc2Nyb2xsX2hhbmRsZXIuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gY2xhc3MgU2Nyb2xsSGFuZGxlclxuXHRjb25zdHJ1Y3RvcjogKCBAZG9tICkgLT5cblxuXHRcdHRhcmdldCA9ICQgQGRvbS5kYXRhKCAndGFyZ2V0JyApXG5cdFx0cmV0dXJuIGlmIHRhcmdldC5sZW5ndGggPD0gMFxuXG5cdFx0QGRvbS5hZGRDbGFzcyAnc2Nyb2xsX2hhbmRsZXInXG5cdFx0XG5cdFx0QGRvbS5vbiAnY2xpY2snLCAtPlxuXHRcdFx0bW92ZXIuc2Nyb2xsX3RvIHRhcmdldCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFNBQUE7O0FBQUEsQ0FBQSxFQUF1QixHQUFqQixDQUFOO0NBQ2MsQ0FBQSxDQUFBLG9CQUFHO0NBRWYsS0FBQSxFQUFBO0NBQUEsRUFGZSxDQUFEO0NBRWQsRUFBUyxDQUFULEVBQUEsRUFBVztDQUNYLEdBQUEsRUFBZ0I7Q0FBaEIsV0FBQTtNQURBO0NBQUEsRUFHSSxDQUFKLElBQUEsUUFBQTtDQUhBLENBS0EsQ0FBSSxDQUFKLEdBQUEsRUFBaUI7Q0FDVixJQUFELENBQUwsR0FBQSxJQUFBO0NBREQsSUFBaUI7Q0FQbEIsRUFBYTs7Q0FBYjs7Q0FERCJ9fSx7Im9mZnNldCI6eyJsaW5lIjo1OTY5LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvZXhwbG9yZS5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBFeHBsb3JlXG5cdGNvbnN0cnVjdG9yOiAoIEBkb20gKSAtPiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLEdBQUE7O0FBQUEsQ0FBQSxFQUF1QixHQUFqQixDQUFOO0NBQ2MsQ0FBQSxDQUFBLGNBQUc7Q0FBTyxFQUFQLENBQUQ7Q0FBZixFQUFhOztDQUFiOztDQUREIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjU5ODIsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9oZWFkZXIuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIm5hdmlnYXRpb24gPSByZXF1aXJlICdhcHAvY29udHJvbGxlcnMvbmF2aWdhdGlvbidcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBIZWFkZXJcblx0Y3VycmVudF9wYWdlOiBcIlwiXG5cdGNvbnN0cnVjdG9yOiAoIEBkb20gKSAtPlxuXHRcdGFwcC5vbiAndXNlcjpsb2dnZWQnLCBAb25fdXNlcl9sb2dnZWRcblx0XHRuYXZpZ2F0aW9uLm9uICdhZnRlcl9yZW5kZXInLCBAY2hlY2tfbWVudVxuXG5cdGNoZWNrX21lbnU6ICggKSA9PlxuXHRcdG9iaiA9ICQoICdbZGF0YS1tZW51XScgKVxuXHRcdGlmIG9iai5sZW5ndGggPiAwXG5cdFx0XHRwYWdlID0gb2JqLmRhdGEgJ21lbnUnXG5cdFx0XHRcblx0XHRcdGlmIEBjdXJyZW50X3BhZ2UubGVuZ3RoID4gMFxuXHRcdFx0XHRAZG9tLmZpbmQoICcuI3tAY3VycmVudF9wYWdlfV9pdGVtJyApLnJlbW92ZUNsYXNzIFwic2VsZWN0ZWRcIlxuXHRcdFx0XHRhcHAuYm9keS5yZW1vdmVDbGFzcyBcIiN7QGN1cnJlbnRfcGFnZX1fcGFnZVwiXG5cblx0XHRcdEBkb20uZmluZCggXCIuI3twYWdlfV9pdGVtXCIgKS5hZGRDbGFzcyBcInNlbGVjdGVkXCJcblx0XHRcdGFwcC5ib2R5LmFkZENsYXNzIFwiI3twYWdlfV9wYWdlXCJcblxuXHRcdFx0QGN1cnJlbnRfcGFnZSA9IHBhZ2VcblxuXG5cblx0b25fdXNlcl9sb2dnZWQ6ICggZGF0YSApID0+XG5cdFx0XG5cdFx0d3JhcHBlciA9IEBkb20uZmluZCggJy51c2VyX2xvZ2dlZCcgKVxuXHRcdHRtcGwgICAgPSByZXF1aXJlICd0ZW1wbGF0ZXMvc2hhcmVkL2hlYWRlcl91c2VyX2xvZ2dlZCdcblx0XHRodG1sICAgID0gdG1wbCBkYXRhXG5cblx0XHR3cmFwcGVyLmVtcHR5KCkuYXBwZW5kIGh0bWxcblxuXHRcdHZpZXcuYmluZCB3cmFwcGVyXG5cblxuXG5cdG9uX3VzZXJfdW5sb2dnZWQ6ICggZGF0YSApID0+XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxjQUFBO0dBQUEsK0VBQUE7O0FBQUEsQ0FBQSxFQUFhLElBQUEsR0FBYixrQkFBYTs7QUFFYixDQUZBLEVBRXVCLEdBQWpCLENBQU47Q0FDQyxDQUFBLENBQWMsU0FBZDs7Q0FDYSxDQUFBLENBQUEsYUFBRztDQUNmLEVBRGUsQ0FBRDtDQUNkLDBEQUFBO0NBQUEsc0RBQUE7Q0FBQSw4Q0FBQTtDQUFBLENBQUEsQ0FBRyxDQUFILFNBQUEsQ0FBQTtDQUFBLENBQ0EsRUFBQSxNQUFVLElBQVY7Q0FIRCxFQUNhOztDQURiLEVBS1ksTUFBQSxDQUFaO0NBQ0MsT0FBQSxDQUFBO0NBQUEsRUFBQSxDQUFBLFNBQU07Q0FDTixFQUFNLENBQU4sRUFBRztDQUNGLEVBQU8sQ0FBUCxFQUFBO0NBRUEsRUFBMEIsQ0FBdkIsRUFBSCxNQUFnQjtDQUNmLEVBQUksQ0FBSCxJQUFELEVBQUEsQ0FBQSxhQUFBO0NBQUEsQ0FDcUIsQ0FBbEIsQ0FBSyxHQUFSLENBQUEsR0FBQSxDQUFxQjtRQUp0QjtDQUFBLEVBTUksQ0FBSCxFQUFELENBQUEsQ0FBQSxFQUFBO0NBTkEsQ0FPa0IsQ0FBZixDQUFLLEVBQVIsQ0FBQSxDQUFBO0NBRUMsRUFBZSxDQUFmLFFBQUQsQ0FBQTtNQVpVO0NBTFosRUFLWTs7Q0FMWixFQXFCZ0IsQ0FBQSxLQUFFLEtBQWxCO0NBRUMsT0FBQSxXQUFBO0NBQUEsRUFBVSxDQUFWLEdBQUEsT0FBVTtDQUFWLEVBQ1UsQ0FBVixHQUFVLDhCQUFBO0NBRFYsRUFFVSxDQUFWO0NBRkEsR0FJQSxDQUFBLENBQUEsQ0FBTztDQUVGLEdBQUQsR0FBSixJQUFBO0NBN0JELEVBcUJnQjs7Q0FyQmhCLEVBaUNrQixDQUFBLEtBQUUsT0FBcEI7O0NBakNBOztDQUhEIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjYwMzEsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9sb2FkaW5nLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJuYXZpZ2F0aW9uICAgICAgICBcdD0gcmVxdWlyZSAnYXBwL2NvbnRyb2xsZXJzL25hdmlnYXRpb24nXG5PcGFjaXR5IFx0XHRcdD0gcmVxdWlyZSAnYXBwL3V0aWxzL29wYWNpdHknXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgTG9hZGluZ1xuXHRjb25zdHJ1Y3RvcjogKCBAZG9tICkgLT5cblx0XHRuYXZpZ2F0aW9uLm9uICdiZWZvcmVfZGVzdHJveScsID0+XG5cdFx0XHRhcHAuYm9keS5hZGRDbGFzcyAnbG9hZGluZydcblx0XHRcdE9wYWNpdHkuc2hvdyBAZG9tXG5cblx0XHRuYXZpZ2F0aW9uLm9uICdhZnRlcl9yZW5kZXInLCA9PiBcblx0XHRcdGFwcC5ib2R5LnJlbW92ZUNsYXNzICdsb2FkaW5nJ1xuXHRcdFx0T3BhY2l0eS5oaWRlIEBkb20iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSx3QkFBQTs7QUFBQSxDQUFBLEVBQXFCLElBQUEsR0FBckIsa0JBQXFCOztBQUNyQixDQURBLEVBQ2EsSUFBYixZQUFhOztBQUViLENBSEEsRUFHdUIsR0FBakIsQ0FBTjtDQUNjLENBQUEsQ0FBQSxjQUFHO0NBQ2YsT0FBQSxJQUFBO0NBQUEsRUFEZSxDQUFEO0NBQ2QsQ0FBQSxDQUFnQyxDQUFoQyxLQUFnQyxDQUF0QixNQUFWO0NBQ0MsRUFBRyxDQUFLLEVBQVIsRUFBQSxDQUFBO0NBQ1EsRUFBUixDQUFBLENBQWMsRUFBUCxNQUFQO0NBRkQsSUFBZ0M7Q0FBaEMsQ0FJQSxDQUE4QixDQUE5QixLQUE4QixDQUFwQixJQUFWO0NBQ0MsRUFBRyxDQUFLLEVBQVIsR0FBQSxFQUFBO0NBQ1EsRUFBUixDQUFBLENBQWMsRUFBUCxNQUFQO0NBRkQsSUFBOEI7Q0FML0IsRUFBYTs7Q0FBYjs7Q0FKRCJ9fSx7Im9mZnNldCI6eyJsaW5lIjo2MDU3LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvbG9naW4uY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gY2xhc3MgTG9naW5cblx0Y29uc3RydWN0b3I6ICggQGRvbSApIC0+XG5cblx0XHRAdXNlcm5hbWUgPSBAZG9tLmZpbmQoICcudXNlcm5hbWUnIClcblx0XHRAcGFzc3dvcmQgPSBAZG9tLmZpbmQoICcucGFzc3dvcmQnIClcblxuXHRcdEBkb20uZmluZCggJy5mYWNlYm9vaycgKS5vbiAnY2xpY2snLCBAX2ZhY2Vib29rX2xvZ2luXG5cdFx0QGRvbS5maW5kKCAnLnNvdW5kY2xvdWQnICkub24gJ2NsaWNrJywgQF9zb3VuZGNsb3VkX2xvZ2luXG5cdFx0QGRvbS5maW5kKCAnLmdvb2dsZScgKS5vbiAnY2xpY2snLCBAX2dvb2dsZV9sb2dpblxuXG5cdFx0XG5cdFx0IyBAZG9tLmZpbmQoICcuc2lnbmluJyApLm9uICdjbGljaycsIEBfY3VzdG9tX2xvZ2luXG5cblx0XHQjIEBkb20uZmluZCggJ2lucHV0JyApLmtleXByZXNzIChldmVudCkgPT5cblx0XHQjIFx0aWYgZXZlbnQud2hpY2ggaXMgMTNcblx0XHQjIFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdCMgXHRcdEBfY3VzdG9tX2xvZ2luKClcblx0XHQjIFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcdFxuXG5cdF9mYWNlYm9va19sb2dpbjogKCApID0+XG5cdFx0bG9nIFwiW0xvZ2luXSBfZmFjZWJvb2tfbG9naW5cIlxuXG5cdF9zb3VuZGNsb3VkX2xvZ2luOiAoICkgPT5cblx0XHRsb2cgXCJbTG9naW5dIF9zb3VuZGNsb3VkX2xvZ2luXCJcblxuXHRfZ29vZ2xlX2xvZ2luOiAoICkgPT5cblx0XHRsb2cgXCJbTG9naW5dIF9nb29nbGVfbG9naW5cIlxuXG5cdCMgX2N1c3RvbV9sb2dpbjogKCApID0+XG5cdCMgXHRAZG9tLnJlbW92ZUNsYXNzIFwiZXJyb3JcIlxuXHQjIFx0aWYgQHVzZXJuYW1lLnZhbCgpLmxlbmd0aCA8PSAwIG9yIEBwYXNzd29yZC52YWwoKS5sZW5ndGggPD0gMFxuXHQjIFx0XHRsb2cgXCJbTG9naW5dIGVycm9yXCJcblx0IyBcdFx0QGRvbS5hZGRDbGFzcyBcImVycm9yXCJcblx0IyBcdFx0cmV0dXJuIGZhbHNlXG5cblx0IyBcdGRhdGE6XG5cdCMgXHRcdHVzZXJuYW1lOiBAdXNlcm5hbWUudmFsKClcblx0IyBcdFx0cGFzc3dvcmQ6IEBwYXNzd29yZC52YWwoKVxuXG5cdCMgXHRsb2cgXCJbTG9naW5dIHN1Ym1pdHRpbmcgZGF0YVwiLCBkYXRhXG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxDQUFBO0dBQUEsK0VBQUE7O0FBQUEsQ0FBQSxFQUF1QixHQUFqQixDQUFOO0NBQ2MsQ0FBQSxDQUFBLFlBQUc7Q0FFZixFQUZlLENBQUQ7Q0FFZCxvREFBQTtDQUFBLDREQUFBO0NBQUEsd0RBQUE7Q0FBQSxFQUFZLENBQVosSUFBQSxHQUFZO0NBQVosRUFDWSxDQUFaLElBQUEsR0FBWTtDQURaLENBR0EsQ0FBSSxDQUFKLEdBQUEsSUFBQSxJQUFBO0NBSEEsQ0FJQSxDQUFJLENBQUosR0FBQSxNQUFBLElBQUE7Q0FKQSxDQUtBLENBQUksQ0FBSixHQUFBLEVBQUEsSUFBQTtDQVBELEVBQWE7O0NBQWIsRUFtQmlCLE1BQUEsTUFBakI7Q0FDSyxFQUFKLFFBQUEsY0FBQTtDQXBCRCxFQW1CaUI7O0NBbkJqQixFQXNCbUIsTUFBQSxRQUFuQjtDQUNLLEVBQUosUUFBQSxnQkFBQTtDQXZCRCxFQXNCbUI7O0NBdEJuQixFQXlCZSxNQUFBLElBQWY7Q0FDSyxFQUFKLFFBQUEsWUFBQTtDQTFCRCxFQXlCZTs7Q0F6QmY7O0NBREQifX0seyJvZmZzZXQiOnsibGluZSI6NjA5MSwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL3Jvb20uY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUm9vbVxuXHRjb25zdHJ1Y3RvcjogKCBAZG9tICkgLT4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQTs7QUFBQSxDQUFBLEVBQXVCLEdBQWpCLENBQU47Q0FDYyxDQUFBLENBQUEsV0FBRztDQUFPLEVBQVAsQ0FBRDtDQUFmLEVBQWE7O0NBQWI7O0NBREQifX1dfQ==
*/})()