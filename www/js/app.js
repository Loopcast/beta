
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
      _this.user_data.profile_picture = data.result.url;
      return _this.dom.find('img').attr('src', data.result.url);
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
//@ sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic2VjdGlvbnMiOlt7Im9mZnNldCI6eyJsaW5lIjo1MDY4LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvYXBwLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJyZXF1aXJlICcuL2dsb2JhbHMnXG5yZXF1aXJlICcuL3ZlbmRvcnMnXG5yZXF1aXJlICcuLi92ZW5kb3JzL3BhcmFsbGF4Lm1pbi5qcydcblxuXG52aWV3cyAgICAgICAgICAgPSByZXF1aXJlICcuL2NvbnRyb2xsZXJzL3ZpZXdzJ1xubmF2aWdhdGlvbiAgICAgID0gcmVxdWlyZSAnLi9jb250cm9sbGVycy9uYXZpZ2F0aW9uJ1xudXNlcl9jb250cm9sbGVyID0gcmVxdWlyZSAnLi9jb250cm9sbGVycy91c2VyJ1xuY2xvdWRpbmFyeSAgICAgID0gcmVxdWlyZSAnLi9jb250cm9sbGVycy9jbG91ZGluYXJ5J1xuIyBtb3Rpb24gICA9IHJlcXVpcmUgJ2FwcC9jb250cm9sbGVycy9tb3Rpb24nXG5cbmNsYXNzIEFwcFxuXG5cdCMgbGluayB0byB3aW5kb3dcblx0d2luZG93OiBudWxsXG5cblx0IyBsaW5rIHRvIHV0aWxzL3NldHRpbmdzXG5cdHNldHRpbmdzOiBudWxsXG5cblx0IyBsaW5rIHRvIGNvbnRyb2xsZXIvbG9jYWxfY29ubmVjdGlvblxuXHRsb2NhbDogbnVsbFxuXG5cdGNvbnN0cnVjdG9yOiAtPiBcdFxuXG5cdFx0aGFwcGVucyBAXG5cblx0XHQjIGFyZSB3ZSB1c2luZyB0aGlzP1xuXHRcdEBvbiAncmVhZHknLCBAYWZ0ZXJfcmVuZGVyXG5cblx0c3RhcnQ6IC0+XG5cdFx0XG5cdFx0QGxvY2FsICA9IHJlcXVpcmUgJ2FwcC9jb250cm9sbGVycy9sb2NhbF9jb25uZWN0aW9uJ1xuXHRcdEB3aW5kb3cgPSByZXF1aXJlICdhcHAvY29udHJvbGxlcnMvd2luZG93J1xuXG5cdFx0QGJvZHkgICA9ICQgJ2JvZHknXG5cblx0XHRcblx0XHRAc2V0dGluZ3MgPSByZXF1aXJlICdhcHAvdXRpbHMvc2V0dGluZ3MnXG5cdFx0QHNldHRpbmdzLmJpbmQgQGJvZHlcblxuXHRcdCMgQ29udHJvbGxlcnMgYmluZGluZ1xuXHRcdGRvIHZpZXdzLmJpbmRcblx0XHRkbyBuYXZpZ2F0aW9uLmJpbmRcblxuXHRcdCMgd2hlbiB0aGUgbmV3IGFyZSBpcyByZW5kZXJlZCwgZG8gdGhlIHNhbWUgd2l0aCB0aGUgbmV3IGNvbnRlbnRcblxuXHRcdG5hdmlnYXRpb24ub24gJ2JlZm9yZV9kZXN0cm95JywgPT5cblx0XHRcdGxvZyBcIi0tLS0tLS0tLSBCRUZPUkUgREVTVFJPWVwiXG5cdFx0XHR2aWV3cy51bmJpbmQgJyNjb250ZW50J1xuXG5cdFx0bmF2aWdhdGlvbi5vbiAnYWZ0ZXJfcmVuZGVyJywgPT4gXG5cdFx0XHR2aWV3cy5iaW5kICAgICAgICcjY29udGVudCdcblx0XHRcdG5hdmlnYXRpb24uYmluZCAnI2NvbnRlbnQnXG5cdFx0XHRkbyB1c2VyX2NvbnRyb2xsZXIuY2hlY2tfdXNlclxuXG5cdFx0XHRcblx0XG5cdCMgVXNlciBQcm94aWVzXG5cdGxvZ2luIDogKCB1c2VyICkgLT4gXG5cdFx0bG9nIFwiLS0tLS0tLS0+IGxvZ2luIGNhbGxlZCBmcm9tIG91dHNpZGVcIlxuXHRcdG5hdmlnYXRpb24uZ28gXCIvI3t1c2VyLnVzZXJuYW1lfVwiXG5cdFx0dXNlcl9jb250cm9sbGVyLmxvZ2luIHVzZXJcblxuXHRsb2dvdXQ6IC0+IFxuXHRcdGxvZyBcIltsb2dnZWQgb3V0XVwiLCB1c2VyXG5cdFx0XG5cdFx0dXNlcl9jb250cm9sbGVyLmxvZ291dCgpXG5cblxuXHQjIyNcblx0IyBBZnRlciB0aGUgdmlld3MgaGF2ZSBiZWVuIHJlbmRlcmVkXG5cdCMjI1xuXHRhZnRlcl9yZW5kZXI6ICggKSA9PlxuXHRcdGxvZyBcImFmdGVyX3JlbmRlclwiXG5cdFx0IyBIaWRlIHRoZSBsb2FkaW5nXG5cdFx0ZGVsYXkgMTAsID0+IEBib2R5LmFkZENsYXNzIFwibG9hZGVkXCJcblxuXHRcdFxuYXBwID0gbmV3IEFwcFxuXG4kIC0+IGFwcC5zdGFydCgpXG5cbm1vZHVsZS5leHBvcnRzID0gd2luZG93LmFwcCA9IGFwcCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLG9EQUFBO0dBQUEsK0VBQUE7O0FBQUEsQ0FBQSxNQUFBLElBQUE7O0FBQ0EsQ0FEQSxNQUNBLElBQUE7O0FBQ0EsQ0FGQSxNQUVBLHFCQUFBOztBQUdBLENBTEEsRUFLa0IsRUFBbEIsRUFBa0IsY0FBQTs7QUFDbEIsQ0FOQSxFQU1rQixJQUFBLEdBQWxCLGdCQUFrQjs7QUFDbEIsQ0FQQSxFQU9rQixJQUFBLFFBQWxCLEtBQWtCOztBQUNsQixDQVJBLEVBUWtCLElBQUEsR0FBbEIsZ0JBQWtCOztBQUdaLENBWE47Q0FjQyxFQUFRLENBQVIsRUFBQTs7Q0FBQSxFQUdVLENBSFYsSUFHQTs7Q0FIQSxFQU1PLENBTlAsQ0FNQTs7Q0FFYSxDQUFBLENBQUEsVUFBQTtDQUVaLGtEQUFBO0NBQUEsR0FBQSxHQUFBO0NBQUEsQ0FHQSxFQUFBLEdBQUEsS0FBQTtDQWJELEVBUWE7O0NBUmIsRUFlTyxFQUFQLElBQU87Q0FFTixPQUFBLElBQUE7Q0FBQSxFQUFVLENBQVYsQ0FBQSxFQUFVLDJCQUFBO0NBQVYsRUFDVSxDQUFWLEVBQUEsQ0FBVSxpQkFBQTtDQURWLEVBR1UsQ0FBVixFQUFVO0NBSFYsRUFNWSxDQUFaLEdBQVksQ0FBWixZQUFZO0NBTlosR0FPQSxJQUFTO0NBUFQsR0FVRyxDQUFLO0NBVlIsR0FXRyxNQUFVO0NBWGIsQ0FlQSxDQUFnQyxDQUFoQyxLQUFnQyxDQUF0QixNQUFWO0NBQ0MsRUFBQSxHQUFBLG9CQUFBO0NBQ00sSUFBRCxDQUFMLElBQUEsR0FBQTtDQUZELElBQWdDO0NBSXJCLENBQVgsQ0FBOEIsTUFBQSxDQUFwQixDQUFWLEdBQUE7Q0FDQyxHQUFBLENBQUssQ0FBTCxJQUFBO0NBQUEsR0FDQSxFQUFBLElBQVU7Q0FDUyxTQUFuQixHQUFHLEVBQWU7Q0FIbkIsSUFBOEI7Q0FwQy9CLEVBZU87O0NBZlAsRUE0Q1EsQ0FBQSxDQUFSLElBQVU7Q0FDVCxFQUFBLENBQUEsaUNBQUE7Q0FBQSxDQUNBLENBQWUsQ0FBZixJQUFBLEVBQVU7Q0FDTSxHQUFoQixDQUFBLE1BQUEsSUFBZTtDQS9DaEIsRUE0Q1E7O0NBNUNSLEVBaURRLEdBQVIsR0FBUTtDQUNQLENBQW9CLENBQXBCLENBQUEsVUFBQTtDQUVnQixLQUFoQixLQUFBLElBQWU7Q0FwRGhCLEVBaURROztDQU1SOzs7Q0F2REE7O0NBQUEsRUEwRGMsTUFBQSxHQUFkO0NBQ0MsT0FBQSxJQUFBO0NBQUEsRUFBQSxDQUFBLFVBQUE7Q0FFTSxDQUFOLENBQVUsRUFBVixJQUFVLEVBQVY7Q0FBYyxHQUFJLENBQUosR0FBRCxLQUFBO0NBQWIsSUFBVTtDQTdEWCxFQTBEYzs7Q0ExRGQ7O0NBZEQ7O0FBOEVBLENBOUVBLEVBOEVBOztBQUVBLENBaEZBLEVBZ0ZFLE1BQUE7Q0FBTyxFQUFELEVBQUgsSUFBQTtDQUFIOztBQUVGLENBbEZBLEVBa0ZpQixHQUFYLENBQU4ifX0seyJvZmZzZXQiOnsibGluZSI6NTE1NiwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL2NvbnRyb2xsZXJzL2FwcGNhc3QuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIyBTb2NrZXQgY29udHJvbGxlciB3aWxsIGJlIHVzZWQgdG8gY29tbXVuaWNhdGUgd2l0aCBkZXNrdG9wIGFwcCBBcHBDYXN0XG4jIyNcblxuYXdhcmUgICAgPSByZXF1aXJlICdhd2FyZSdcbiMgc2hvcnRjdXQgZm9yIHZlbmRvciBzY3JpcHRzXG52ICAgICAgID0gcmVxdWlyZSAnYXBwL3ZlbmRvcnMnXG5cbiMgdGhlIGNvbnRyb2xsZXIgaXMgdGhlIG1vZGVsLCBtb2Rlcm4gY29uY2VwdCBvZiBoZXJtYXBocm9kaXRlIGZpbGVcbmFwcGNhc3QgPSBhd2FyZSB7fVxuXG4jIG9ubHkgZW5hYmxlIGlmIGF2YWlsYWJsZSBvbiB3aW5kb3dcbldlYlNvY2tldCA9IHdpbmRvdy5XZWJTb2NrZXQgfHwgbnVsbFxuXG4jIHdlYnNvY2tldCBjb25uZWN0aW9uc1xuYXBwY2FzdC5tZXNzYWdlcyA9IHt9XG5hcHBjYXN0LnZ1ICAgICAgID0ge31cblxuXG5hcHBjYXN0LnNldCAnY29ubmVjdGVkJywgZmFsc2VcbiMgY29ubmVjdHMgdG8gQXBwQ2FzdCdzIFdlYlNvY2tldCBzZXJ2ZXIgYW5kIGxpc3RlbiBmb3IgbWVzc2FnZXNcbmFwcGNhc3QuY29ubmVjdCA9IC0+XG5cbiAgaWYgbm90IFdlYlNvY2tldFxuICAgIHJldHVybiBjb25zb2xlLmluZm8gJysgc29ja2V0IGNvbnRyb2xsZXIgd29udCBjb25uZWN0J1xuXG4gIG1lc3NhZ2VzX3NvY2tldCA9ICd3czovL2xvY2FsaG9zdDo1MTIzNC9sb29wY2FzdC9tZXNzYWdlcydcbiAgYXBwY2FzdC5tZXNzYWdlcyA9IG5ldyB2LlJlY29ubmVjdGluZ1dlYnNvY2tldCBtZXNzYWdlc19zb2NrZXRcblxuICBhcHBjYXN0Lm1lc3NhZ2VzLm9ub3BlbiA9IC0+XG4gICAgY29uc29sZS5pbmZvICctIHNvY2tldCBjb250cm9sbGVyIGNvbm5lY3Rpb24gb3BlbmVkJ1xuXG4gICAgYXBwY2FzdC5zZXQgJ2Nvbm5lY3RlZCcsIHRydWVcblxuICAgIGFwcGNhc3QubWVzc2FnZXMuc2VuZCBKU09OLnN0cmluZ2lmeSBbICdnZXRfaW5wdXRfZGV2aWNlcycgXVxuXG4gIGFwcGNhc3QubWVzc2FnZXMub25jbG9zZSA9IC0+XG4gICAgY29uc29sZS5pbmZvICctIEFwcENhc3QgaXNudCBPUEVOLCB3aWxsIHJldHJ5IHRvIGNvbm5lY3QnXG5cbiAgICBhcHBjYXN0LnNldCAnY29ubmVjdGVkJywgZmFsc2VcblxuXG4gICMgcm91dGUgaW5jb21pbmcgbWVzc2FnZXMgdG8gYXBwY2FzdC5jYWxsYmFja3MgaGFzaFxuICBhcHBjYXN0Lm1lc3NhZ2VzLm9ubWVzc2FnZSA9ICggZSApIC0+XG5cbiAgICBqc29uID0gZS5kYXRhXG5cbiAgICB0cnlcbiAgICAgIGZyb21fanNvbiA9IEpTT04ucGFyc2UganNvblxuICAgIGNhdGNoIGVycm9yXG4gICAgICBjb25zb2xlLmVycm9yIFwiLSBzb2NrZXQgY29udHJvbGxlciBlcnJvciBwYXJzaW5nIGpzb25cIlxuICAgICAgY29uc29sZS5lcnJvciBlcnJvclxuICAgICAgcmV0dXJuIGVycm9yXG5cbiAgICBtZXRob2QgPSBmcm9tX2pzb25bMF1cbiAgICBhcmdzICAgPSBmcm9tX2pzb25bMV1cbiAgICBcbiAgICBpZiAnZXJyb3InID09IG1ldGhvZFxuICAgICAgcmV0dXJuIGNvbnNvbGUubG9nICdlcnJvcicsIGFyZ3NcblxuICAgIGlmIHR5cGVvZiBhcHBjYXN0LmNhbGxiYWNrc1ttZXRob2RdIGlzICdmdW5jdGlvbidcbiAgICAgIGFwcGNhc3QuY2FsbGJhY2tzW21ldGhvZF0oIGFyZ3MgKVxuICAgIGVsc2UgXG4gICAgICBjb25zb2xlLmxvZyBcIiArIHNvY2tldCBjb250cm9sbGVyIGhhcyBubyBjYWxsYmFjayBmb3I6XCIsIG1ldGhvZFxuXG5cblxuICB2dV9zb2NrZXQgPSAnd3M6Ly9sb2NhbGhvc3Q6NTEyMzQvbG9vcGNhc3QvdnUnXG4gIGFwcGNhc3QudnUgPSBuZXcgdi5SZWNvbm5lY3RpbmdXZWJzb2NrZXQgdnVfc29ja2V0XG5cbiAgYXBwY2FzdC52dS5vbm9wZW4gPSAtPlxuICAgIGNvbnNvbGUuaW5mbyAnLSBzb2NrZXQgVlUgY29ubmVjdGlvbiBvcGVuZWQnXG5cbiAgICBhcHBjYXN0LnNldCAndnU6Y29ubmVjdGVkJywgdHJ1ZVxuXG4gIGFwcGNhc3QudnUub25jbG9zZSA9IC0+XG4gICAgY29uc29sZS5pbmZvICctIHNvY2tldCBWVSBjb25uZWN0aW9uIGNsb3NlZCdcblxuICAgIGFwcGNhc3Quc2V0ICd2dTpjb25uZWN0ZWQnLCBmYWxzZVxuXG4gICMgcm91dGUgaW5jb21pbmcgbWVzc2FnZXMgdG8gYXBwY2FzdC5jYWxsYmFja3MgaGFzaFxuICBhcHBjYXN0LnZ1Lm9ubWVzc2FnZSA9ICggZSApIC0+XG5cbiAgICByZWFkZXIgPSBuZXcgRmlsZVJlYWRlclxuXG4gICAgcmVhZGVyLm9ubG9hZCA9ICggZSApIC0+XG4gICAgICBidWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5IGUudGFyZ2V0LnJlc3VsdFxuXG4gICAgICBhcHBjYXN0LnNldCAnc3RyZWFtOnZ1JywgYnVmZmVyICBcblxuICAgIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlciBlLmRhdGFcblxuYXBwY2FzdC5zdGFydF9zdHJlYW0gPSAoIGRldmljZV9uYW1lICkgLT5cblxuICBtb3VudF9wb2ludCA9IFwiaGVtc1wiXG4gIHBhc3N3b3JkICAgID0gXCJsb29wY2FzdDIwMTVcIlxuXG4gIHBheWxvYWQgPSBcbiAgICBkZXZpY2VfbmFtZSA6IGRldmljZV9uYW1lXG4gICAgbW91bnRfcG9pbnQgOiBtb3VudF9wb2ludFxuICAgIHBhc3N3b3JkICAgIDogcGFzc3dvcmRcblxuICBhcHBjYXN0LnNldCBcInN0cmVhbTpzdGFydGluZ1wiLCB0cnVlXG4gIGFwcGNhc3QubWVzc2FnZXMuc2VuZCBKU09OLnN0cmluZ2lmeSBbIFwic3RhcnRfc3RyZWFtXCIsIHBheWxvYWQgXVxuXG5hcHBjYXN0LnN0b3Bfc3RyZWFtID0gLT5cblxuICBhcHBjYXN0LnNldCBcInN0cmVhbTpzdG9wcGluZ1wiLCB0cnVlXG4gIGFwcGNhc3QubWVzc2FnZXMuc2VuZCBKU09OLnN0cmluZ2lmeSBbIFwic3RvcF9zdHJlYW1cIiBdXG5cblxuIyMjXG4jIGNhbGxiYWNrcyBhcmUgY2FsbGVkIGJ5IFwibWVzc2FnZXNcIiBjb21pbmcgZnJvbSB0aGUgV2Vic29ja2V0U2VydmVyIGNyZWF0ZWRcbiMgYnkgdGhlIGRlc2t0b3AgYXBwbGljYXRpb24gQXBwQ2FzdFxuIyMjXG5hcHBjYXN0LmNhbGxiYWNrcyA9XG4gIGlucHV0X2RldmljZXMgIDogKCBhcmdzICkgLT5cblxuICAgICMgY29uc29sZS5sb2cgXCIrIHNvY2tldCBjb250cm9sbHIgZ290IGlucHV0IGRldmljZXNcIiwgYXJncy5kZXZpY2VzXG5cbiAgICAjIHNhdmVzIGxpc3Qgb2YgZGV2aWNlcyBhbmQgYnJvYWRjYXN0IGNoYW5nZVxuICAgIGFwcGNhc3Quc2V0ICdpbnB1dF9kZXZpY2VzJywgYXJncy5kZXZpY2VzXG5cbiAgICAjIGF1dG9tYXRpY2FseSB0ZXN0aW5nIHN0cmVhbVxuICAgICMgYXBwY2FzdC5zdGFydF9zdHJlYW0gXCJTb3VuZGZsb3dlciAoMmNoKVwiXG5cbiAgc3RyZWFtX3N0YXJ0ZWQgOiAoIGFyZ3MgKSAtPlxuXG4gICAgaWYgYXJncz8gYW5kIGFyZ3MuZXJyb3I/XG5cbiAgICAgIGNvbnNvbGUuZXJyb3IgXCItIHN0cmVhbV9zdGFydGVkIGVycm9yOlwiLCBhcmdzLmVycm9yXG5cbiAgICAgIGFwcGNhc3Quc2V0IFwic3RyZWFtOmVycm9yXCIsIGFyZ3MuZXJyb3JcblxuICAgICAgcmV0dXJuXG5cbiAgICAjIHNhdmUgY3VycmVudCBzdHJlYW06b25saW5lIHN0YXR1c1xuICAgIGFwcGNhc3Quc2V0ICdzdHJlYW06b25saW5lJywgdHJ1ZVxuXG4gICAgIyByZXNldCBvdGhlciBzdHJhbWluZyBmbGFnc1xuICAgIGFwcGNhc3Quc2V0IFwic3RyZWFtOnN0YXJ0aW5nXCIsIG51bGxcbiAgICBhcHBjYXN0LnNldCBcInN0cmVhbTplcnJvclwiICAgLCBudWxsXG5cbiAgc3RyZWFtX3N0b3BwZWQ6IC0+XG5cbiAgICAjIHNhdmUgY3VycmVudCBzdHJlYW06b25saW5lIHN0YXR1c1xuICAgIGFwcGNhc3Quc2V0ICdzdHJlYW06b25saW5lJyAgLCBmYWxzZVxuICAgIGFwcGNhc3Quc2V0IFwic3RyZWFtOnN0b3BwaW5nXCIsIG51bGxcblxuIyMjXG4jIExpc3RlbmluZyB0byBtZXNzYWdlc1xuIyMjXG5hcHBjYXN0Lm9uICdpbnB1dF9kZXZpY2UnLCAtPlxuXG4gIGlmIGFwcGNhc3QuZ2V0ICdzdHJlYW06b25saW5lJ1xuICAgIGNvbnNvbGUuZXJyb3IgJy0gaW5wdXQgZGV2aWNlIGNoYW5nZWQgd2hpbGUgc3RyZWFtOm9ubGluZSdcbiAgICBjb25zb2xlLmVycm9yICc/IHdoYXQgc2hvdWxkIHdlIGRvJ1xuXG4jIHNob3VsZCB0cnkgdG8gY29ubmVjdCBvbmx5IG9uIGl0J3Mgb3duIHByb2ZpbGUgcGFnZVxuYXBwY2FzdC5jb25uZWN0KClcblxubW9kdWxlLmV4cG9ydHMgPSBhcHBjYXN0Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Q0FBQTtDQUFBLEdBQUEsd0JBQUE7O0FBSUEsQ0FKQSxFQUlXLEVBQVgsRUFBVzs7QUFFWCxDQU5BLEVBTVUsSUFBQSxNQUFBOztBQUdWLENBVEEsQ0FTVSxDQUFBLEVBQUEsRUFBVjs7QUFHQSxDQVpBLEVBWVksQ0FBb0IsRUFBZCxHQUFsQjs7QUFHQSxDQWZBLENBQUEsQ0FlbUIsSUFBWixDQUFQOztBQUNBLENBaEJBLENBZ0JBLENBQW1CLElBQVo7O0FBR1AsQ0FuQkEsQ0FtQnlCLENBQXpCLEVBQUEsRUFBTyxJQUFQOztBQUVBLENBckJBLEVBcUJrQixJQUFYLEVBQVc7Q0FFaEIsS0FBQSxvQkFBQTtBQUFPLENBQVAsQ0FBQSxFQUFHLEtBQUg7Q0FDRSxHQUFPLEdBQU8sSUFBUCx1QkFBQTtJQURUO0NBQUEsQ0FHQSxDQUFrQixZQUFsQix5QkFIQTtDQUFBLENBSUEsQ0FBdUIsQ0FBQSxHQUFoQixDQUFQLE9BQXVCLE1BQUE7Q0FKdkIsQ0FNQSxDQUEwQixHQUExQixDQUFPLENBQVMsQ0FBVTtDQUN4QixHQUFBLEdBQU8sZ0NBQVA7Q0FBQSxDQUV5QixDQUF6QixDQUFBLEdBQU8sSUFBUDtDQUVRLEdBQVIsR0FBTyxDQUFTLENBQU0sRUFBdEIsUUFBcUM7Q0FYdkMsRUFNMEI7Q0FOMUIsQ0FhQSxDQUEyQixJQUFwQixDQUFTLENBQVc7Q0FDekIsR0FBQSxHQUFPLHFDQUFQO0NBRVEsQ0FBaUIsQ0FBekIsRUFBQSxFQUFPLElBQVA7Q0FoQkYsRUFhMkI7Q0FiM0IsQ0FvQkEsQ0FBNkIsSUFBdEIsQ0FBUyxDQUFoQjtDQUVFLE9BQUEsNEJBQUE7Q0FBQSxFQUFPLENBQVA7Q0FFQTtDQUNFLEVBQVksQ0FBSSxDQUFKLENBQVosR0FBQTtNQURGO0NBR0UsS0FESTtDQUNKLElBQUEsQ0FBQSxDQUFPLGlDQUFQO0NBQUEsSUFDQSxDQUFBLENBQU87Q0FDUCxJQUFBLFFBQU87TUFQVDtDQUFBLEVBU1MsQ0FBVCxFQUFBLEdBQW1CO0NBVG5CLEVBVVMsQ0FBVCxLQUFtQjtDQUVuQixHQUFBLENBQWMsQ0FBZCxDQUFHO0NBQ0QsQ0FBNEIsQ0FBckIsQ0FBQSxHQUFPLE1BQVA7TUFiVDtBQWVHLENBQUgsR0FBQSxDQUF1QyxDQUFwQyxDQUFjLEVBQVcsQ0FBNUI7Q0FDVSxHQUFSLEVBQWtCLENBQVgsRUFBVyxJQUFsQjtNQURGO0NBR1UsQ0FBaUQsQ0FBekQsR0FBQSxDQUFPLE1BQVAsOEJBQUE7TUFwQnlCO0NBcEI3QixFQW9CNkI7Q0FwQjdCLENBNENBLENBQVksTUFBWix5QkE1Q0E7Q0FBQSxDQTZDQSxDQUFpQixDQUFBLEdBQVYsRUFBVSxZQUFBO0NBN0NqQixDQStDQSxDQUFvQixHQUFwQixDQUFPLEVBQWE7Q0FDbEIsR0FBQSxHQUFPLHdCQUFQO0NBRVEsQ0FBb0IsQ0FBNUIsQ0FBQSxHQUFPLElBQVAsR0FBQTtDQWxERixFQStDb0I7Q0EvQ3BCLENBb0RBLENBQXFCLElBQWQsRUFBYztDQUNuQixHQUFBLEdBQU8sd0JBQVA7Q0FFUSxDQUFvQixDQUE1QixFQUFBLEVBQU8sSUFBUCxHQUFBO0NBdkRGLEVBb0RxQjtDQU1iLENBQUUsQ0FBYSxJQUFoQixFQUFQO0NBRUUsS0FBQSxFQUFBO0FBQVMsQ0FBVCxFQUFTLENBQVQsRUFBQSxJQUFBO0NBQUEsRUFFZ0IsQ0FBaEIsRUFBTSxHQUFZO0NBQ2hCLEtBQUEsSUFBQTtDQUFBLEVBQWEsQ0FBQSxFQUFiLE1BQWE7Q0FFTCxDQUFpQixDQUF6QixHQUFBLENBQU8sSUFBUCxFQUFBO0NBTEYsSUFFZ0I7Q0FLVCxHQUFQLEVBQU0sS0FBTixNQUFBO0NBckVjLEVBNERPO0NBNURQOztBQXVFbEIsQ0E1RkEsRUE0RnVCLElBQWhCLEVBQWtCLEVBQUYsQ0FBdkI7Q0FFRSxLQUFBLHdCQUFBO0NBQUEsQ0FBQSxDQUFjLEdBQWQsS0FBQTtDQUFBLENBQ0EsQ0FBYyxLQUFkLE1BREE7Q0FBQSxDQUdBLENBQ0UsSUFERjtDQUNFLENBQWMsRUFBZCxPQUFBO0NBQUEsQ0FDYyxFQUFkLE9BQUE7Q0FEQSxDQUVjLEVBQWQsSUFBQTtDQU5GLEdBQUE7Q0FBQSxDQVFBLENBQUEsQ0FBQSxHQUFPLFVBQVA7Q0FDUSxDQUErQyxFQUF2RCxHQUFPLENBQVMsQ0FBaEIsS0FBcUM7Q0FYaEI7O0FBYXZCLENBekdBLEVBeUdzQixJQUFmLEVBQWUsRUFBdEI7Q0FFRSxDQUFBLENBQUEsQ0FBQSxHQUFPLFVBQVA7Q0FDUSxHQUFSLEdBQU8sQ0FBUyxDQUFoQixJQUFxQztDQUhqQjs7Q0FNdEI7Ozs7Q0EvR0E7O0FBbUhBLENBbkhBLEVBb0hFLElBREssRUFBUDtDQUNFLENBQUEsQ0FBaUIsQ0FBQSxLQUFFLElBQW5CO0NBS1UsQ0FBcUIsQ0FBN0IsQ0FBaUMsR0FBMUIsSUFBUCxJQUFBO0NBTEYsRUFBaUI7Q0FBakIsQ0FVQSxDQUFpQixDQUFBLEtBQUUsS0FBbkI7Q0FFRSxHQUFBLFVBQUcsTUFBSDtDQUVFLENBQXlDLEVBQUksQ0FBN0MsQ0FBQSxDQUFPLGtCQUFQO0NBQUEsQ0FFNEIsQ0FBNUIsQ0FBZ0MsQ0FBaEMsQ0FBQSxDQUFPLE9BQVA7Q0FFQSxXQUFBO01BTkY7Q0FBQSxDQVM2QixDQUE3QixDQUFBLEdBQU8sUUFBUDtDQVRBLENBWStCLENBQS9CLENBQUEsR0FBTyxVQUFQO0NBQ1EsQ0FBdUIsQ0FBL0IsQ0FBQSxHQUFPLElBQVAsR0FBQTtDQXpCRixFQVVpQjtDQVZqQixDQTJCQSxDQUFnQixNQUFBLEtBQWhCO0NBR0UsQ0FBK0IsQ0FBL0IsQ0FBQSxDQUFBLEVBQU8sUUFBUDtDQUNRLENBQXVCLENBQS9CLENBQUEsR0FBTyxJQUFQLE1BQUE7Q0EvQkYsRUEyQmdCO0NBL0lsQixDQUFBOztDQXFKQTs7O0NBckpBOztBQXdKQSxDQXhKQSxDQXdKQSxDQUEyQixJQUFwQixFQUFvQixLQUEzQjtDQUVFLENBQUEsQ0FBRyxDQUFBLEdBQU8sUUFBUDtDQUNELEdBQUEsQ0FBQSxFQUFPLHFDQUFQO0NBQ1EsSUFBUixFQUFPLElBQVAsVUFBQTtJQUp1QjtDQUFBOztBQU8zQixDQS9KQSxNQStKTzs7QUFFUCxDQWpLQSxFQWlLaUIsR0FBWCxDQUFOIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjUyOTgsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy9jb250cm9sbGVycy9jbG91ZGluYXJ5LmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBDbG91ZGluYXJ5XG5cdGluc3RhbmNlID0gbnVsbFxuXG5cdGNvbmZpZzogXG5cdFx0Y2xvdWRfbmFtZTogXCJcIlxuXHRcdGFwaV9rZXk6IFwiXCJcblxuXG5cdGNvbnN0cnVjdG9yOiAtPlxuXHRcdGlmIENsb3VkaW5hcnkuaW5zdGFuY2Vcblx0XHRcdGNvbnNvbGUuZXJyb3IgXCJZb3UgY2FuJ3QgaW5zdGFudGlhdGUgdGhpcyBDbG91ZGluYXJ5IHR3aWNlXCJcdFxuXHRcdFx0cmV0dXJuXG5cblx0XHRDbG91ZGluYXJ5Lmluc3RhbmNlID0gQFxuXG5cdHNldF9jb25maWc6ICggZGF0YSApIC0+XG5cblx0XHQjIGlmIGRhdGEgaXMgZGlmZmVyZW50IGZyb20gdGhlIGN1cnJlbnQgY29uZmlnLCB1cGRhdGUgaXRcblx0XHRpZiBAY29uZmlnLmNsb3VkX25hbWUgaXNudCBkYXRhLmNsb3VkX25hbWUgb3IgQGNvbmZpZy5hcGlfa2V5IGlzbnQgZGF0YS5hcGlfa2V5XG5cdFx0XHQjIFVwZGF0ZSB0aGUgaW50ZXJuYWwgb2JqZWN0XG5cdFx0XHRAY29uZmlnID0gZGF0YVxuXG5cdFx0XHQjIFVwZGF0ZSB0aGUgalF1ZXJ5IHBsdWdpbiBjb25maWdcblx0XHRcdCQuY2xvdWRpbmFyeS5jb25maWdcblx0XHRcdFx0Y2xvdWRfbmFtZTogQGNvbmZpZy5jbG91ZF9uYW1lIFxuXHRcdFx0XHRhcGlfa2V5ICAgOiBAY29uZmlnLmFwaV9rZXlcblxuXG4jIHdpbGwgYWx3YXlzIGV4cG9ydCB0aGUgc2FtZSBpbnN0YW5jZVxubW9kdWxlLmV4cG9ydHMgPSBuZXcgQ2xvdWRpbmFyeVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsTUFBQTs7QUFBTSxDQUFOO0NBQ0MsS0FBQSxFQUFBOztDQUFBLENBQUEsQ0FBVyxDQUFYLElBQUE7O0NBQUEsRUFHQyxHQUREO0NBQ0MsQ0FBWSxFQUFaLE1BQUE7Q0FBQSxDQUNTLEVBQVQsR0FBQTtDQUpELEdBQUE7O0NBT2EsQ0FBQSxDQUFBLGlCQUFBO0NBQ1osR0FBQSxJQUFBLEVBQWE7Q0FDWixJQUFBLENBQUEsQ0FBTyxzQ0FBUDtDQUNBLFdBQUE7TUFGRDtDQUFBLEVBSXNCLENBQXRCLElBQUEsRUFBVTtDQVpYLEVBT2E7O0NBUGIsRUFjWSxDQUFBLEtBQUUsQ0FBZDtDQUdDLEdBQUEsQ0FBMkIsQ0FBakIsQ0FBb0MsR0FBM0M7Q0FFRixFQUFVLENBQVQsRUFBRDtDQUdDLEtBQUQsSUFBWSxHQUFaO0NBQ0MsQ0FBWSxFQUFDLEVBQU0sRUFBbkIsRUFBQTtDQUFBLENBQ1ksRUFBQyxFQUFNLENBQW5CLENBQUE7Q0FQRixPQUtDO01BUlU7Q0FkWixFQWNZOztDQWRaOztDQUREOztBQTZCQSxDQTdCQSxFQTZCaUIsR0FBWCxDQUFOLEdBN0JBIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjUzMzYsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy9jb250cm9sbGVycy9sb2NhbF9jb25uZWN0aW9uLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiNcbiMgQ29udHJvbGxlciByZXNwb25zaWJsZSBmb3IgY29tbXVuaWNhdGlvbiB3aXRoIG90aGVyIGluc3RhbmNlcyBvZiB0aGUgYXBwXG4jIGZvciBpbnN0YW5jZSBhbm90aGVyIHRhYiBvciBwb3AgdXAgb3BlblxuI1xuIyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2plcmVteWhhcnJpcy9Mb2NhbENvbm5lY3Rpb24uanMvdHJlZS9tYXN0ZXJcbiMgZm9yZSBtb3JlIGluZm9ybWF0aW9uLCBmb3IgaW5zdGFuY2UgaW50ZWdyYXRpb24gd2l0aCBJRTlcbiNcbiMjI1xuXG5hcHAgPSByZXF1aXJlICdhcHAvYXBwJ1xuXG5jb25uZWN0aW9uID0gbmV3IExvY2FsQ29ubmVjdGlvbiAnYmV0YS5sb29wY2FzdC5mbSdcbmNvbm5lY3Rpb24ubGlzdGVuKClcblxuY29ubmVjdGlvbi5hZGRDYWxsYmFjayAnbG9naW4nLCAoIHVzZXIgKSAtPlxuXG4gIGNvbnNvbGUuaW5mbyAnICsgbG9jYXRpb24gY29ubmVjdGlvbiwgdXNlciBsb2dnZWQgaW46JywgdXNlclxuXG4gIGFwcC5sb2dpbiB1c2VyXG5cbmNvbm5lY3Rpb24uYWRkQ2FsbGJhY2sgJ2xvZ291dCcsIC0+XG5cbiAgY29uc29sZS5pbmZvICcgKyBsb2NhdGlvbiBjb25uZWN0aW9uLCB1c2VyIGxvZ2dlZCBvdXQnXG5cbiAgYXBwLmxvZ291dCgpXG5cbm1vZHVsZS5leHBvcnRzID0gY29ubmVjdGlvbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0NBQUE7Q0FBQSxHQUFBLFdBQUE7O0FBVUEsQ0FWQSxFQVVBLElBQU0sRUFBQTs7QUFFTixDQVpBLEVBWWlCLENBQUEsTUFBakIsS0FBaUIsR0FBQTs7QUFDakIsQ0FiQSxLQWFBLElBQVU7O0FBRVYsQ0FmQSxDQWVnQyxDQUFBLENBQUEsR0FBaEMsRUFBa0MsQ0FBeEIsQ0FBVjtDQUVFLENBQUEsRUFBQSxHQUFPLGtDQUFQO0NBRUksRUFBRCxDQUFILENBQUEsSUFBQTtDQUo4Qjs7QUFNaEMsQ0FyQkEsQ0FxQmlDLENBQUEsS0FBakMsQ0FBaUMsQ0FBdkIsQ0FBVjtDQUVFLENBQUEsRUFBQSxHQUFPLGtDQUFQO0NBRUksRUFBRCxHQUFILEdBQUE7Q0FKK0I7O0FBTWpDLENBM0JBLEVBMkJpQixHQUFYLENBQU4sR0EzQkEifX0seyJvZmZzZXQiOnsibGluZSI6NTM2OCwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL2NvbnRyb2xsZXJzL25hdmlnYXRpb24uY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbInNldHRpbmdzICBcdD0gcmVxdWlyZSAnYXBwL3V0aWxzL3NldHRpbmdzJ1xuaGFwcGVucyAgXHQ9IHJlcXVpcmUgJ2hhcHBlbnMnXG53YXlzICAgIFx0PSByZXF1aXJlICd3YXlzJ1xud2F5cy51c2UgcmVxdWlyZSAnd2F5cy1icm93c2VyJ1xuXG5jbGFzcyBOYXZpZ2F0aW9uXG5cblx0aW5zdGFuY2UgPSBudWxsXG5cdGZpcnN0X2xvYWRpbmc6IG9uXG5cblx0Y29uc3RydWN0b3I6IC0+XG5cblx0XHRpZiBOYXZpZ2F0aW9uLmluc3RhbmNlXG5cdFx0XHRjb25zb2xlLmVycm9yIFwiWW91IGNhbid0IGluc3RhbnRpYXRlIHRoaXMgTmF2aWdhdGlvbiB0d2ljZVwiXHRcblxuXHRcdFx0cmV0dXJuXG5cblx0XHROYXZpZ2F0aW9uLmluc3RhbmNlID0gQFxuXHRcdEBjb250ZW50X3NlbGVjdG9yID0gJyNjb250ZW50IC5pbm5lcl9jb250ZW50J1xuXHRcdEBjb250ZW50X2RpdiA9ICQgQGNvbnRlbnRfc2VsZWN0b3JcblxuXHRcdGhhcHBlbnMgQFxuXHRcblx0XHQjIGV4cG9ydCB0byB3aW5kb3dcblx0XHR3aW5kb3cud2F5cyA9IHdheXM7XG5cdFx0XG5cdFx0IyByb3V0aW5nXG5cdFx0d2F5cyAnKicsIEB1cmxfY2hhbmdlZFxuXG5cblx0XHQjIEZvciB0aGUgZmlyc3Qgc2NyZWVuLCBlbWl0IHRoZSBldmVudCBhZnRlcl9yZW5kZXIuXG5cdFx0IyBpZiwgaW4gdGhlIG1lYW50aW1lLCB0aGUgbmF2aWdhdGlvbiBnb2VzIHRvIGFub3RoZXIgdXJsXG5cdFx0IyB3ZSB3b24ndCBlbWl0IHRoaXMgZmlyc3QgZXZlbnQuXG5cdFx0ZGVsYXkgMjAwLCA9PlxuXHRcdFx0aWYgQGZpcnN0X2xvYWRpbmcgdGhlbiBAZW1pdCAnYWZ0ZXJfcmVuZGVyJ1xuXG5cblx0dXJsX2NoYW5nZWQ6ICggcmVxICkgPT5cblxuXG5cdFx0bG9nIFwidXJsX2NoYW5nZWRcIiwgcmVxLnVybFxuXG5cdFx0IyBpZSBoYWNrIGZvciBoYXNoIHVybHNcblx0XHRyZXEudXJsID0gcmVxLnVybC5yZXBsYWNlKCBcIi8jXCIsICcnIClcblxuXHRcdCMgbG9nIFwiIGNvbnRyb2xsZXJzL25hdmlnYXRpb24vdXJsX2NoYW5nZWQ6OiAje3JlcS51cmx9XCJcblx0XHQjIFRPRE86IFxuXHRcdCMgIC0gZG9uJ3QgcmVsb2FkIGlmIHRoZSBjb250ZW50IGlzIGFscmVhZHkgbG9hZGVkXG5cdFx0IyAgLSBpbXBsZW1lbnQgdHJhbnNpdGlvbnMgb3V0XG5cdFx0IyAgLSBpbXBsZW1lbnQgdHJhbnNpdGlvbiAgaW4gXG5cblx0XHRkaXYgPSAkKCAnPGRpdj4nIClcblxuXHRcdEBlbWl0ICdiZWZvcmVfbG9hZCdcblxuXHRcdGRpdi5sb2FkIHJlcS51cmwsID0+XG5cblx0XHRcdEBlbWl0ICdvbl9sb2FkJ1xuXG5cdFx0XHRpZiBhcHAuYm9keS5zY3JvbGxUb3AoKSA+IDBcblx0XHRcdFx0YXBwLmJvZHkuYW5pbWF0ZSBzY3JvbGxUb3A6IDBcblxuXG5cdFx0XHRAZW1pdCAnYmVmb3JlX2Rlc3Ryb3knXHRcdFxuXG5cdFx0XHRkZWxheSA0MDAsID0+XHRcdFx0XG5cblx0XHRcdFx0bmV3X2NvbnRlbnQgPSBkaXYuZmluZCggQGNvbnRlbnRfc2VsZWN0b3IgKS5jaGlsZHJlbigpXG5cdFx0XHRcdFxuXHRcdFx0XHRAY29udGVudF9kaXYgPSAkIEBjb250ZW50X3NlbGVjdG9yXG5cblx0XHRcdFx0IyBSZW1vdmUgb2xkIGNvbnRlbnRcblx0XHRcdFx0QGNvbnRlbnRfZGl2LmNoaWxkcmVuKCkucmVtb3ZlKClcblxuXHRcdFx0XHQjIHBvcHVsYXRlIHdpdGggdGhlIGxvYWRlZCBjb250ZW50XG5cdFx0XHRcdEBjb250ZW50X2Rpdi5hcHBlbmQgbmV3X2NvbnRlbnRcblx0XHRcdFx0ZGVsYXkgMTAsID0+XG5cdFx0XHRcdFx0bG9nIFwiW05hdmlnYXRpb25dIGFmdGVyX3JlbmRlclwiLCByZXEudXJsXG5cdFx0XHRcdFx0QGVtaXQgJ2FmdGVyX3JlbmRlcidcblxuXHQjI1xuXHQjIE5hdmlnYXRlcyB0byBhIGdpdmVuIFVSTCB1c2luZyBIdG1sIDUgaGlzdG9yeSBBUElcblx0IyNcblx0Z286ICggdXJsICkgLT5cblxuXHRcdCMgSWYgaXQncyBhIHBvcHVwLCBieXBhc3Mgd2F5cyBhbmQgc2VhbWxlc3MgbmF2aWdhdGlvblxuXHRcdGlmIHdpbmRvdy5vcGVuZXI/XG5cdFx0XHRyZXR1cm4gdHJ1ZVxuXG5cdFx0QGZpcnN0X2xvYWRpbmcgPSBvZmZcblxuXHRcdHdheXMuZ28gdXJsXG5cblx0XHRyZXR1cm4gZmFsc2VcblxuXHQjI1xuXHQjIExvb2tzIGZvciBpbnRlcm5hbCBsaW5rcyBhbmQgYmluZCB0aGVuIHRvIGNsaWVudCBzaWRlIG5hdmlnYXRpb25cblx0IyBhcyBpbjogaHRtbCBIaXN0b3J5IGFwaVxuXHQjI1xuXHRiaW5kOiAoIHNjb3BlID0gJ2JvZHknICkgLT5cblxuXHRcdCQoIHNjb3BlICkuZmluZCggJ2EnICkuZWFjaCAoIGluZGV4LCBpdGVtICkgLT5cblxuXHRcdFx0JGl0ZW0gPSAkIGl0ZW1cblx0XHRcdGhyZWYgPSAkaXRlbS5hdHRyKCAnaHJlZicgKVxuXG5cdFx0XHRpZiAhaHJlZj8gdGhlbiByZXR1cm4gXG5cblx0XHRcdCMgaWYgdGhlIGxpbmsgaGFzIGh0dHAgYW5kIHRoZSBkb21haW4gaXMgZGlmZmVyZW50XG5cdFx0XHRpZiBocmVmLmluZGV4T2YoICdodHRwJyApID49IDAgYW5kIGhyZWYuaW5kZXhPZiggZG9jdW1lbnQuZG9tYWluICkgPCAwIFxuXHRcdFx0XHRyZXR1cm4gXG5cblx0XHRcdGlmIGhyZWYuaW5kZXhPZiggXCIjXCIgKSBpcyAwXG5cdFx0XHRcdCRpdGVtLmNsaWNrIC0+IHJldHVybiBmYWxzZVxuXG5cdFx0XHRlbHNlIGlmIGhyZWYuaW5kZXhPZiggXCJqYXZhc2NyaXB0XCIgKSBpcyAwIG9yIGhyZWYuaW5kZXhPZiggXCJ0ZWw6XCIgKSBpcyAwXG5cdFx0XHRcdHJldHVybiB0cnVlXG5cdFx0XHRlbHNlXG5cdFx0XHRcdCRpdGVtLmNsaWNrIC0+IFxuXHRcdFx0XHRcdHJldHVybiBOYXZpZ2F0aW9uLmluc3RhbmNlLmdvICQoIEAgKS5hdHRyICdocmVmJ1xuXG5cbiMgd2lsbCBhbHdheXMgZXhwb3J0IHRoZSBzYW1lIGluc3RhbmNlXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBOYXZpZ2F0aW9uIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsK0JBQUE7R0FBQSwrRUFBQTs7QUFBQSxDQUFBLEVBQWEsSUFBQSxDQUFiLFlBQWE7O0FBQ2IsQ0FEQSxFQUNZLElBQVosRUFBWTs7QUFDWixDQUZBLEVBRVcsQ0FBWCxFQUFXLENBQUE7O0FBQ1gsQ0FIQSxFQUdBLENBQUksR0FBSyxPQUFBOztBQUVILENBTE47Q0FPQyxLQUFBLEVBQUE7O0NBQUEsQ0FBQSxDQUFXLENBQVgsSUFBQTs7Q0FBQSxFQUNlLENBRGYsU0FDQTs7Q0FFYSxDQUFBLENBQUEsaUJBQUE7Q0FFWixnREFBQTtDQUFBLE9BQUEsSUFBQTtDQUFBLEdBQUEsSUFBQSxFQUFhO0NBQ1osSUFBQSxDQUFBLENBQU8sc0NBQVA7Q0FFQSxXQUFBO01BSEQ7Q0FBQSxFQUtzQixDQUF0QixJQUFBLEVBQVU7Q0FMVixFQU1vQixDQUFwQixZQUFBLFNBTkE7Q0FBQSxFQU9lLENBQWYsT0FBQSxLQUFlO0NBUGYsR0FTQSxHQUFBO0NBVEEsRUFZYyxDQUFkLEVBQU07Q0FaTixDQWVVLENBQVYsQ0FBQSxPQUFBO0NBZkEsQ0FxQlcsQ0FBWCxDQUFBLENBQUEsSUFBVztDQUNWLEdBQUcsQ0FBQyxDQUFKLE9BQUE7Q0FBd0IsR0FBRCxDQUFDLFNBQUQsQ0FBQTtRQURiO0NBQVgsSUFBVztDQTFCWixFQUdhOztDQUhiLEVBOEJhLE1BQUUsRUFBZjtDQUdDLEVBQUEsS0FBQTtPQUFBLEtBQUE7Q0FBQSxDQUFtQixDQUFuQixDQUFBLFNBQUE7Q0FBQSxDQUdpQyxDQUE5QixDQUFILEdBQVU7Q0FIVixFQVdBLENBQUEsR0FBTTtDQVhOLEdBYUEsU0FBQTtDQUVJLENBQWMsQ0FBZixDQUFILEtBQWtCLEVBQWxCO0NBRUMsR0FBQSxDQUFDLENBQUQsR0FBQTtDQUVBLEVBQU0sQ0FBSCxFQUFILEdBQUc7Q0FDRixFQUFHLENBQUssR0FBUixDQUFBO0NBQWlCLENBQVcsT0FBWCxDQUFBO0NBQWpCLFNBQUE7UUFIRDtDQUFBLEdBTUEsQ0FBQyxDQUFELFVBQUE7Q0FFTSxDQUFLLENBQVgsRUFBQSxJQUFXLElBQVg7Q0FFQyxVQUFBLENBQUE7Q0FBQSxFQUFjLENBQUEsQ0FBVyxHQUF6QixHQUFBLEtBQWM7Q0FBZCxFQUVlLEVBQWQsR0FBRCxHQUFBLEtBQWU7Q0FGZixJQUtDLENBQUQsRUFBQSxHQUFZO0NBTFosSUFRQyxDQUFELEVBQUEsR0FBWTtDQUNOLENBQU4sQ0FBVSxFQUFWLElBQVUsTUFBVjtDQUNDLENBQWlDLENBQWpDLE9BQUEsaUJBQUE7Q0FDQyxHQUFELENBQUMsU0FBRCxHQUFBO0NBRkQsUUFBVTtDQVhYLE1BQVc7Q0FWWixJQUFrQjtDQWhEbkIsRUE4QmE7O0NBOUJiLENBNEVBLENBQUksTUFBRTtDQUdMLEdBQUEsaUJBQUE7Q0FDQyxHQUFBLFNBQU87TUFEUjtDQUFBLEVBR2lCLENBQWpCLENBSEEsUUFHQTtDQUhBLENBS0EsQ0FBQSxDQUFBO0NBRUEsSUFBQSxNQUFPO0NBdEZSLEVBNEVJOztDQTVFSixFQTRGTSxDQUFOLENBQU0sSUFBRTs7R0FBUSxHQUFSO01BRVA7Q0FBQSxDQUFxQyxDQUFyQyxDQUFBLENBQUEsSUFBOEIsRUFBOUI7Q0FFQyxTQUFBLENBQUE7Q0FBQSxFQUFRLENBQUEsQ0FBUixDQUFBO0NBQUEsRUFDTyxDQUFQLENBQVksQ0FBWjtDQUVBLEdBQUksRUFBSixNQUFBO0NBQWUsYUFBQTtRQUhmO0NBTUEsRUFBcUUsQ0FBbEUsRUFBSCxDQUFHLENBQXNEO0NBQ3hELGFBQUE7UUFQRDtDQVNBLEVBQUcsQ0FBQSxDQUF1QixDQUExQixDQUFHO0NBQ0ksRUFBTSxFQUFQLElBQU8sTUFBWjtDQUFlLElBQUEsWUFBTztDQUF0QixRQUFZO0NBRUEsR0FBTCxDQUFnQyxDQUh4QyxDQUdRLENBSFIsSUFHUTtDQUNQLEdBQUEsV0FBTztNQUpSLEVBQUE7Q0FNTyxFQUFNLEVBQVAsSUFBTyxNQUFaO0NBQ0MsQ0FBTyxFQUF1QixFQUFBLEVBQUosRUFBVCxPQUFWO0NBRFIsUUFBWTtRQWpCYztDQUE1QixJQUE0QjtDQTlGN0IsRUE0Rk07O0NBNUZOOztDQVBEOztBQTJIQSxDQTNIQSxFQTJIaUIsR0FBWCxDQUFOLEdBM0hBIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjU0ODAsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy9jb250cm9sbGVycy91c2VyLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJoYXBwZW5zID0gcmVxdWlyZSAnaGFwcGVucydcblxubW9kdWxlLmV4cG9ydHMgPSBoYXBwZW5zXG5cdGxvZ291dDogKCBjYWxsYmFjayA9IC0+ICkgLT5cblx0XHRcblx0XHRpZiBub3QgQGlzX2xvZ2dlZCgpIHRoZW4gcmV0dXJuIGNhbGxiYWNrIGVycm9yOiBjb2RlOiAnbm9kZV9sb2dnZWQnXG5cblx0XHRsb2cgXCJbVXNlcl0gdHJ5aW5nIHRvIGxvZ291dC4uLlwiXG5cblx0XHQkLnBvc3QgJy9hcGkvdjEvbG9nb3V0Jywge30sIChkYXRhKSA9PlxuXHRcdFx0bG9nIFwiW1VzZXJdIGxvZ291dCB+IHN1Y2Nlc3NcIiwgZGF0YVxuXG5cdFx0XHRAZW1pdCAndXNlcjp1bmxvZ2dlZCdcblxuXHRcdFx0YXBwLmJvZHkucmVtb3ZlQ2xhc3MgXCJsb2dnZWRcIlxuXG5cdFx0XHRsb2cgXCJbVXNlciBDb250cm9sbGVyXSBkZWxldGluZyB1c2VyIHZhcmlhYmxlXCJcblx0XHRcdGRlbGV0ZSBsb29wY2FzdC51c2VyXG5cblx0XHRcdGNhbGxiYWNrPygpXG5cdFxuXHRsb2dpbjogKCB1c2VyICkgLT5cblxuXHRcdGxvb3BjYXN0LnVzZXIgPSB1c2VyXG5cblx0XHRhcHAuYm9keS5hZGRDbGFzcyBcImxvZ2dlZFwiXG5cblx0XHRAZW1pdCAndXNlcjpsb2dnZWQnLCBsb29wY2FzdC51c2VyXG5cblx0XHRsb2cgXCJbVXNlciBDb250cm9sbGVyXSBsb2dpblwiLCBsb29wY2FzdC51c2VyXG5cblx0Y2hlY2tfdXNlcjogLT4gXG5cdFx0aWYgQGlzX2xvZ2dlZCgpXG5cdFx0XHRAbG9naW4gbG9vcGNhc3QudXNlclxuXHRcdGVsc2Vcblx0XHRcdEBsb2dvdXQoKVxuXG5cdGlzX2xvZ2dlZDogLT4gbG9vcGNhc3QudXNlcj8iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxHQUFBOztBQUFBLENBQUEsRUFBVSxJQUFWLEVBQVU7O0FBRVYsQ0FGQSxFQUVpQixHQUFYLENBQU47Q0FDQyxDQUFBLENBQVEsR0FBUixFQUFRLENBQUU7Q0FFVCxPQUFBLElBQUE7O0dBRm9CLEdBQVgsR0FBVztNQUVwQjtBQUFPLENBQVAsR0FBQSxLQUFPO0NBQWtCLE9BQU8sS0FBQTtDQUFTLENBQU8sR0FBUCxHQUFBO0NBQU8sQ0FBTSxFQUFOLE1BQUEsR0FBQTtVQUFQO0NBQWhCLE9BQU87TUFBaEM7Q0FBQSxFQUVBLENBQUEsd0JBQUE7Q0FFQyxDQUF3QixDQUFJLENBQTdCLEtBQThCLEVBQTlCLEtBQUE7Q0FDQyxDQUErQixDQUEvQixDQUFBLEVBQUEsbUJBQUE7Q0FBQSxHQUVBLENBQUMsQ0FBRCxTQUFBO0NBRkEsRUFJRyxDQUFLLEVBQVIsRUFBQSxHQUFBO0NBSkEsRUFNQSxHQUFBLG9DQUFBO0FBQ0EsQ0FQQSxHQUFBLEVBT0EsRUFBZTtDQVJhLEVBVTVCO0NBVkQsSUFBNkI7Q0FOOUIsRUFBUTtDQUFSLENBa0JBLENBQU8sQ0FBQSxDQUFQLElBQVM7Q0FFUixFQUFnQixDQUFoQixJQUFRO0NBQVIsRUFFRyxDQUFILElBQUE7Q0FGQSxDQUlxQixFQUFyQixJQUE2QixLQUE3QjtDQUVJLENBQTJCLENBQS9CLENBQUEsSUFBdUMsR0FBdkMsY0FBQTtDQTFCRCxFQWtCTztDQWxCUCxDQTRCQSxDQUFZLE1BQUEsQ0FBWjtDQUNDLEdBQUEsS0FBRztDQUNELEdBQUEsQ0FBRCxHQUFlLEtBQWY7TUFERDtDQUdFLEdBQUEsRUFBRCxPQUFBO01BSlU7Q0E1QlosRUE0Qlk7Q0E1QlosQ0FrQ0EsQ0FBVyxNQUFYO0NBQVcsVUFBRztDQWxDZCxFQWtDVztDQXJDWixDQUVpQiJ9fSx7Im9mZnNldCI6eyJsaW5lIjo1NTI3LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvY29udHJvbGxlcnMvdmlld3MuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbImhhcHBlbnMgPSByZXF1aXJlICdoYXBwZW5zJ1xuXG5jbGFzcyBWaWV3XG5cblx0VU5JUVVFX0lEICBcdD0gMFxuXG5cblx0IyMjXG5cdEhhc2ggTWFwIHRvIHN0b3JlIHRoZSB2aWV3czpcblxuXHRoYXNoX21vZGVsID0ge1xuXHRcdFwiPHZpZXdfbmFtZT5cIiA6IFsgPHZpZXdfaW5zdGFuY2U+LCA8dmlld19pbnN0YW5jZT4sIC4uIF0sXG5cdFx0XCI8dmlld19uYW1lPlwiIDogWyA8dmlld19pbnN0YW5jZT4sIDx2aWV3X2luc3RhbmNlPiwgLi4gXVxuXHR9XG5cdCMjI1xuXHRoYXNoX21vZGVsICA6IHt9XG5cblxuXHQjIyNcblx0VWlkIE1hcC4gSW50ZXJuYWwgbWFwIHVzZWQgZm9yIGVhc2lseSBnZXQgYSB2aWV3IGJ5IHVpZFxuXG5cdHVpZF9tYXAgPSB7XG5cdFx0XCI8VU5JUVVFX0lEPlwiIDogeyBuYW1lIDogPHZpZXdfbmFtZT4sIGluZGV4OiA8dmlld19pbmRleD4gfSxcblx0XHRcIjxVTklRVUVfSUQ+XCIgOiB7IG5hbWUgOiA8dmlld19uYW1lPiwgaW5kZXg6IDx2aWV3X2luZGV4PiB9LFxuXHRcdCAgLi4uXG5cdH1cblx0IyMjXG5cdHVpZF9tYXA6IHt9XG5cblxuXG5cblxuXHQjIEdldCB0aGUgdmlldyBmcm9tIHRoZSBoYXNoIG1vZGVsXG5cdGdldDogKCBpZCwgaW5kZXggPSAwICkgPT5cblx0XHR1bmxlc3MgQGhhc2hfbW9kZWxbIGlkIF0/XG5cdFx0XHQjIGNvbnNvbGUuZXJyb3IgXCJWaWV3ICN7aWR9ICN7aW5kZXh9IGRvZXNuJ3QgZXhpc3RzXCJcblx0XHRcdHJldHVybiBmYWxzZVxuXG5cdFx0QGhhc2hfbW9kZWxbIGlkIF1bIGluZGV4IF1cblxuXG5cblx0Z2V0X2J5X3VpZDogKCB1aWQgKSA9PlxuXHRcdGlmIEB1aWRfbWFwWyB1aWQgXT9cblx0XHRcdG5hbWUgPSBAdWlkX21hcFsgdWlkIF0ubmFtZVxuXHRcdFx0aW5kZXggPSBAdWlkX21hcFsgdWlkIF0uaW5kZXhcblxuXHRcdFx0cmV0dXJuIEBnZXQgbmFtZSwgaW5kZXhcblxuXHRcdHJldHVybiBmYWxzZVxuXG5cdGdldF9ieV9kb206ICggc2VsZWN0b3IgKSA9PiBAZ2V0X2J5X3VpZCAkKCBzZWxlY3RvciApLmRhdGEgJ3VpZCdcblxuXG5cblx0YmluZDogKCBzY29wZSA9ICdib2R5JywgdG9sb2cgPSBmYWxzZSApIC0+XG5cblx0XHQjIGNvbnNvbGUuZXJyb3IgXCJCaW5kaW5ncyB2aWV3czogI3tzY29wZX1cIlxuXHRcdCQoIHNjb3BlICkuZmluZCggJ1tkYXRhLXZpZXddJyApLmVhY2goICggaW5kZXgsIGl0ZW0gKSA9PlxuXG5cdFx0XHQkaXRlbSA9ICQgaXRlbVxuXG5cdFx0XHR2aWV3X25hbWUgPSAkaXRlbS5kYXRhKCAndmlldycgKVxuXG5cdFx0XHQkaXRlbS5yZW1vdmVBdHRyICdkYXRhLXZpZXcnXG5cblx0XHRcdGlmIHZpZXdfbmFtZS5zdWJzdHJpbmcoMCwgMSkgaXMgXCJbXCJcblx0XHRcdFx0bmFtZXMgPSB2aWV3X25hbWUuc3Vic3RyaW5nKDEsIHZpZXdfbmFtZS5sZW5ndGggLSAxKS5zcGxpdChcIixcIilcblx0XHRcdGVsc2Vcblx0XHRcdFx0bmFtZXMgPSBbdmlld19uYW1lXVxuXG5cdFx0XHRmb3IgbmFtZSBpbiBuYW1lc1xuXHRcdFx0XHRAX2FkZF92aWV3ICRpdGVtLCBuYW1lXG5cblx0XHRcdCMgcmVtb3ZlIHRoZSBkYXRhLXZpZXcgYXR0cmlidXRlLCBzbyBpdCB3b24ndCBiZSBpbnN0YW50aWF0ZWQgdHdpY2UhXG5cdFx0XHQkaXRlbS5yZW1vdmVBdHRyICdkYXRhLXZpZXcnXG5cblx0XHQpLnByb21pc2UoKS5kb25lID0+IEBlbWl0IFwiYmluZGVkXCJcblxuXHR1bmJpbmQ6ICggc2NvcGUgPSAnYm9keScgKSAtPlxuXHRcdCQoIHNjb3BlICkuZmluZCggJ1tkYXRhLXVpZF0nICkuZWFjaCggKCBpbmRleCwgaXRlbSApID0+XG5cblx0XHRcdCRpdGVtID0gJCBpdGVtXG5cblx0XHRcdGlkID0gJGl0ZW0uZGF0YSAndWlkJ1xuXG5cdFx0XHR2ID0gdmlldy5nZXRfYnlfdWlkIGlkXG5cblx0XHRcdGlmIHZcblx0XHRcdFx0di5kZXN0cm95PygpXG5cdFx0XHRcdHZpZXcub25fdmlld19kZXN0cm95ZWQgaWRcblxuXHRcdCkucHJvbWlzZSgpLmRvbmUgPT4gQGVtaXQgXCJ1bmJpbmRlZFwiXG5cblxuXG5cdF9hZGRfdmlldzogKCAkaXRlbSwgdmlld19uYW1lICkgLT5cblxuXHRcdHRyeVxuXHRcdFx0dmlldyA9IHJlcXVpcmUgXCJhcHAvdmlld3MvI3t2aWV3X25hbWV9XCJcblx0XHRjYXRjaCBlXG5cdFx0XHRjb25zb2xlLndhcm4gJ2UgLT4nLCBlLm1lc3NhZ2Vcblx0XHRcdGNvbnNvbGUuZXJyb3IgXCJhcHAvdmlld3MvI3t2aWV3fSBub3QgZm91bmQgZm9yIFwiLCAkaXRlbVxuXG5cdFx0dmlldyA9IG5ldyB2aWV3ICRpdGVtXG5cblx0XHQjIFNhdmUgdGhlIHZpZXcgaW4gYSBoYXNoIG1vZGVsXG5cdFx0QGhhc2hfbW9kZWxbIHZpZXdfbmFtZSBdID89IFtdXG5cblx0XHRsID0gQGhhc2hfbW9kZWxbIHZpZXdfbmFtZSBdLmxlbmd0aFxuXG5cdFx0QGhhc2hfbW9kZWxbIHZpZXdfbmFtZSBdWyBsIF0gPSB2aWV3XG5cblxuXHRcdCMgU2F2ZSB0aGUgaW5jcmVtZW50YWwgdWlkIHRvIHRoZSBkb20gYW5kIHRvIHRoZSBpbnN0YW5jZVxuXHRcdHZpZXcudWlkID0gVU5JUVVFX0lEXG5cdFx0dmlldy52aWV3X25hbWUgPSB2aWV3X25hbWVcblxuXHRcdCMgbG9nIFwiW3ZpZXddIGFkZFwiLCB2aWV3LnVpZCwgdmlldy52aWV3X25hbWVcblxuXHRcdCRpdGVtLmF0dHIgJ2RhdGEtdWlkJywgVU5JUVVFX0lEXG5cblx0XHQjIFNhdmUgdGhlIHZpZXcgaW4gYSBsaW5lYXIgYXJyYXkgbW9kZWxcblx0XHRAdWlkX21hcFsgVU5JUVVFX0lEIF0gPVxuXHRcdFx0bmFtZSAgOiB2aWV3X25hbWVcblx0XHRcdGluZGV4IDogQGhhc2hfbW9kZWxbIHZpZXdfbmFtZSBdLmxlbmd0aCAtIDFcblxuXG5cdFx0VU5JUVVFX0lEKytcblxuXG5cblxuXHRvbl92aWV3X2Rlc3Ryb3llZDogKCB1aWQgKSAtPlxuXHRcdFxuXHRcdCMgbG9nIFwiW1ZpZXddIG9uX3ZpZXdfZGVzdHJveWVkXCIsIHVpZFxuXHRcdGlmIEB1aWRfbWFwWyB1aWQgXT9cblxuXHRcdFx0IyBHZXQgdGhlIGRhdGEgZnJvbSB0aGUgdWlkIG1hcFxuXHRcdFx0bmFtZSAgPSBAdWlkX21hcFsgdWlkIF0ubmFtZVxuXHRcdFx0aW5kZXggPSBAdWlkX21hcFsgdWlkIF0uaW5kZXhcblxuXHRcdFx0IyBkZWxldGUgdGhlIHJlZmVyZW5jZSBpbiB0aGUgbW9kZWxcblx0XHRcdGlmIEBoYXNoX21vZGVsWyBuYW1lIF1bIGluZGV4IF0/XG5cblx0XHRcdFx0IyBkZWxldGUgdGhlIGl0ZW0gZnJvbSB0aGUgdWlkX21hcFxuXHRcdFx0XHRkZWxldGUgQHVpZF9tYXBbIHVpZCBdXG5cblx0XHRcdFx0IyBEZWxldGUgdGhlIGl0ZW0gZnJvbSB0aGUgaGFzaF9tb2RlbFxuXHRcdFx0XHRAaGFzaF9tb2RlbFsgbmFtZSBdLnNwbGljZSBpbmRleCwgMVxuXG5cdFx0XHRcdCMgVXBkYXRlIHRoZSBpbmRleCBvbiB0aGUgdWlkX21hcCBmb3IgdGhlIHZpZXdzIGxlZnQgb2YgdGhlIHNhbWUgdHlwZVxuXHRcdFx0XHRmb3IgaXRlbSwgaSBpbiBAaGFzaF9tb2RlbFsgbmFtZSBdXG5cdFx0XHRcdFx0QHVpZF9tYXBbIGl0ZW0udWlkIF0uaW5kZXggPSBpXG5cblxuXHRcdFx0XHRcblxuXG5cbnZpZXcgPSBuZXcgVmlld1xuaGFwcGVucyB2aWV3XG5cbm1vZHVsZS5leHBvcnRzID0gd2luZG93LnZpZXcgPSB2aWV3XG5cblxuIyBleHBvcnRpbmcgZ2V0IG1ldGhvZCBmb3Igd2luZG93LCBzbyB5b3UgY2FuIHJldHJpZXZlIHZpZXdzIGp1c3Qgd2l0aCBWaWV3KCBpZCApXG53aW5kb3cuVmlldyA9IHZpZXciXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxlQUFBO0dBQUEsK0VBQUE7O0FBQUEsQ0FBQSxFQUFVLElBQVYsRUFBVTs7QUFFSixDQUZOO0NBSUMsS0FBQSxHQUFBOzs7Ozs7Q0FBQTs7Q0FBQSxDQUFBLENBQWMsTUFBZDs7Q0FHQTs7Ozs7Ozs7Q0FIQTs7Q0FBQSxDQUFBLENBV2MsT0FBZDs7Q0FHQTs7Ozs7Ozs7O0NBZEE7O0NBQUEsQ0FBQSxDQXVCUyxJQUFUOztDQXZCQSxDQThCSyxDQUFMLEVBQUssSUFBRTs7R0FBWSxHQUFSO01BQ1Y7Q0FBQSxHQUFBLHVCQUFBO0NBRUMsSUFBQSxRQUFPO01BRlI7Q0FJQyxDQUFZLEVBQVosQ0FBa0IsS0FBTixDQUFiO0NBbkNELEVBOEJLOztDQTlCTCxFQXVDWSxNQUFFLENBQWQ7Q0FDQyxPQUFBLEdBQUE7Q0FBQSxHQUFBLHFCQUFBO0NBQ0MsRUFBTyxDQUFQLEVBQUEsQ0FBaUI7Q0FBakIsRUFDUSxDQUFDLENBQVQsQ0FBQSxDQUFrQjtDQUVsQixDQUFrQixDQUFYLENBQUMsQ0FBRCxRQUFBO01BSlI7Q0FNQSxJQUFBLE1BQU87Q0E5Q1IsRUF1Q1k7O0NBdkNaLEVBZ0RZLEtBQUEsQ0FBRSxDQUFkO0NBQTZCLEdBQUEsQ0FBVyxHQUFBLEVBQVosQ0FBQTtDQWhENUIsRUFnRFk7O0NBaERaLENBb0R3QixDQUFsQixDQUFOLENBQU0sSUFBRTtDQUdQLE9BQUEsSUFBQTs7R0FIZSxHQUFSO01BR1A7O0dBSCtCLEdBQVI7TUFHdkI7Q0FBQSxDQUFnRCxDQUFULENBQXZDLENBQUEsSUFBeUMsRUFBekMsRUFBQTtDQUVDLFNBQUEsNkJBQUE7Q0FBQSxFQUFRLENBQUEsQ0FBUixDQUFBO0NBQUEsRUFFWSxDQUFBLENBQUssQ0FBakIsR0FBQTtDQUZBLElBSUssQ0FBTCxJQUFBLENBQUE7Q0FFQSxDQUEwQixDQUExQixDQUFHLENBQTZCLENBQWhDLEdBQVk7Q0FDWCxDQUErQixDQUF2QixFQUFSLENBQStCLEVBQS9CLENBQWlCO01BRGxCLEVBQUE7Q0FHQyxFQUFRLEVBQVIsR0FBQSxDQUFRO1FBVFQ7QUFXQSxDQUFBLFVBQUEsaUNBQUE7MEJBQUE7Q0FDQyxDQUFrQixFQUFsQixDQUFDLEdBQUQsQ0FBQTtDQURELE1BWEE7Q0FlTSxJQUFELEtBQUwsQ0FBQSxFQUFBO0NBakJELEVBbUJpQixDQW5CakIsQ0FBdUMsRUFBdkMsRUFtQmlCO0NBQUksR0FBRCxDQUFDLEdBQUQsS0FBQTtDQW5CcEIsSUFtQmlCO0NBMUVsQixFQW9ETTs7Q0FwRE4sRUE0RVEsRUFBQSxDQUFSLEdBQVU7Q0FDVCxPQUFBLElBQUE7O0dBRGlCLEdBQVI7TUFDVDtDQUFBLENBQStDLENBQVQsQ0FBdEMsQ0FBQSxJQUF3QyxFQUF4QyxDQUFBO0NBRUMsU0FBQSxFQUFBO0NBQUEsRUFBUSxDQUFBLENBQVIsQ0FBQTtDQUFBLENBRUEsQ0FBSyxDQUFBLENBQUssQ0FBVjtDQUZBLENBSUksQ0FBQSxDQUFJLEVBQVIsSUFBSTtDQUVKLEdBQUcsRUFBSDs7Q0FDRSxTQUFEO1VBQUE7Q0FDSyxDQUFMLEVBQUksV0FBSixFQUFBO1FBVm9DO0NBQXRDLEVBWWlCLENBWmpCLENBQXNDLEVBQXRDLEVBWWlCO0NBQUksR0FBRCxDQUFDLEtBQUQsR0FBQTtDQVpwQixJQVlpQjtDQXpGbEIsRUE0RVE7O0NBNUVSLENBNkZvQixDQUFULEVBQUEsSUFBWDtDQUVDLE9BQUEsU0FBQTtDQUFBO0NBQ0MsRUFBTyxDQUFQLEVBQUEsQ0FBTyxFQUFBLEdBQVM7TUFEakI7Q0FHQyxLQURLO0NBQ0wsQ0FBcUIsRUFBckIsRUFBQSxDQUFPO0NBQVAsQ0FDa0QsQ0FBeEIsQ0FBWCxDQUFmLENBQUEsQ0FBTyxLQUFRLEtBQWY7TUFKRDtDQUFBLEVBTVcsQ0FBWCxDQUFXOztDQUdFLEVBQWUsRUFBZixJQUFBO01BVGI7Q0FBQSxFQVdJLENBQUosRUFYQSxHQVdpQixDQUFBO0NBWGpCLEVBYWdDLENBQWhDLEtBQWEsQ0FBQTtDQWJiLEVBaUJBLENBQUEsS0FqQkE7Q0FBQSxFQWtCaUIsQ0FBakIsS0FBQTtDQWxCQSxDQXNCdUIsRUFBdkIsQ0FBSyxJQUFMLENBQUE7Q0F0QkEsRUEwQkMsQ0FERCxHQUFVLEVBQUE7Q0FDVCxDQUFRLEVBQVIsRUFBQSxHQUFBO0NBQUEsQ0FDUSxDQUFrQyxDQUFqQyxDQUFULENBQUEsR0FBcUIsQ0FBQTtDQTNCdEIsS0FBQTtBQThCQSxDQWhDVSxRQWdDVixFQUFBO0NBN0hELEVBNkZXOztDQTdGWCxFQWtJbUIsTUFBRSxRQUFyQjtDQUdDLE9BQUEsc0NBQUE7Q0FBQSxHQUFBLHFCQUFBO0NBR0MsRUFBUSxDQUFSLEVBQUEsQ0FBa0I7Q0FBbEIsRUFDUSxDQUFDLENBQVQsQ0FBQSxDQUFrQjtDQUdsQixHQUFHLEVBQUgsOEJBQUE7QUFHQyxDQUFBLEVBQWlCLENBQVQsRUFBUixDQUFpQixDQUFqQjtDQUFBLENBR2tDLEVBQWpDLENBQUQsQ0FBQSxFQUFBLEVBQWE7Q0FHYjtDQUFBO2NBQUEscUNBQUE7MEJBQUE7Q0FDQyxFQUFVLENBQVQsQ0FBRCxFQUFVO0NBRFg7eUJBVEQ7UUFQRDtNQUhrQjtDQWxJbkIsRUFrSW1COztDQWxJbkI7O0NBSkQ7O0FBaUtBLENBaktBLEVBaUtPLENBQVA7O0FBQ0EsQ0FsS0EsR0FrS0EsR0FBQTs7QUFFQSxDQXBLQSxFQW9LaUIsQ0FBQSxFQUFYLENBQU47O0FBSUEsQ0F4S0EsRUF3S2MsQ0FBZCxFQUFNIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjU2OTksImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy9jb250cm9sbGVycy93aW5kb3cuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbImhhcHBlbnMgPSByZXF1aXJlICdoYXBwZW5zJ1xuXG4jIGNyZWF0ZSBhbmQgZXhwb3J0IGEgbmV3IGhhcHBlbnMgb2JqZWN0XG5tb2R1bGUuZXhwb3J0cyA9IGhhcHBlbnMoIHdpbiA9IHt9IClcblxuIyBldmVudCBoYW5kbGluZyBmb3Igd2luZG93IHJlc2l6ZVxud2luLm9iaiA9ICQgd2luZG93XG53aW4ub2JqLm9uICdyZXNpemUnLCBvbl9yZXNpemUgPSAtPlxuXHR3aW4udyA9IHdpbi5vYmoud2lkdGgoKVxuXHR3aW4uaCA9IHdpbi5vYmouaGVpZ2h0KClcblx0d2luLmVtaXQgJ3Jlc2l6ZSdcblxuIyB0cmlnZ2VyIHJlc2l6ZSBhdXRvbWF0aWNhbGx5IGFmdGVyIDEwMCBtc1xuZGVsYXkgMTAwLCBvbl9yZXNpemVcblxuIyBnbG9iYWwgY2xpY2sgZXZlbnRcbiQoICdodG1sLGJvZHknICkub24gJ2NsaWNrJywgLT4gd2luLmVtaXQgXCJib2R5OmNsaWNrZWRcIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLG1CQUFBOztBQUFBLENBQUEsRUFBVSxJQUFWLEVBQVU7O0FBR1YsQ0FIQSxDQUdpQixDQUFBLEdBQVgsQ0FBTjs7QUFHQSxDQU5BLEVBTUcsR0FBTzs7QUFDVixDQVBBLENBT0EsQ0FBRyxLQUFILENBQXFCO0NBQ3BCLENBQUEsQ0FBRyxFQUFLO0NBQVIsQ0FDQSxDQUFHLEdBQUs7Q0FDSixFQUFELENBQUgsSUFBQSxDQUFBO0NBSGdDOztBQU1qQyxDQWJBLENBYVcsQ0FBWCxFQUFBLElBQUE7O0FBR0EsQ0FoQkEsQ0FnQkEsQ0FBNkIsSUFBN0IsRUFBNkIsRUFBN0I7Q0FBb0MsRUFBRCxDQUFILEtBQUEsS0FBQTtDQUFIIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjU3MjEsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy9nbG9iYWxzLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiMgb24gdGhlIGJyb3dzZXIsIHdpbmRvdyBpcyB0aGUgZ2xvYmFsIGhvbGRlclxuIyMjXG5cbiMgdXRpbHNcblxud2luZG93LmRlbGF5ID0gcmVxdWlyZSAnLi9nbG9iYWxzL2RlbGF5J1xuXG53aW5kb3cuaW50ZXJ2YWwgID0gcmVxdWlyZSAnLi9nbG9iYWxzL2ludGVydmFsJ1xuXG53aW5kb3cubG9nICAgPSByZXF1aXJlICcuL2dsb2JhbHMvbG9nJ1xuXG53aW5kb3cubW92ZXIgPSByZXF1aXJlICcuL2dsb2JhbHMvbW92ZXInXG5cbiMgd2lkZWx5IHVzZWQgbW9kdWxlc1xuXG53aW5kb3cuaGFwcGVucyA9IHJlcXVpcmUgJ2hhcHBlbnMnXG5cblxubW9kdWxlLmV4cG9ydHMgPSB3aW5kb3ciXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztDQUFBO0FBTUEsQ0FOQSxFQU1lLEVBQWYsQ0FBTSxDQUFTLFVBQUE7O0FBRWYsQ0FSQSxFQVFtQixHQUFiLENBQWEsQ0FBbkIsWUFBbUI7O0FBRW5CLENBVkEsRUFVQSxHQUFNLENBQVMsUUFBQTs7QUFFZixDQVpBLEVBWWUsRUFBZixDQUFNLENBQVMsVUFBQTs7QUFJZixDQWhCQSxFQWdCaUIsR0FBWCxDQUFOLEVBQWlCOztBQUdqQixDQW5CQSxFQW1CaUIsR0FBWCxDQUFOIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjU3MzksImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy9nbG9iYWxzL2RlbGF5LmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9ICggZGVsYXksIGZ1bmsgKSAtPiBzZXRUaW1lb3V0IGZ1bmssIGRlbGF5Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLENBQU8sQ0FBbUIsQ0FBVCxDQUFBLENBQUEsQ0FBWCxDQUFOLEVBQW1CO0NBQTRCLENBQU0sRUFBakIsQ0FBQSxJQUFBLENBQUE7Q0FBbkIifX0seyJvZmZzZXQiOnsibGluZSI6NTc0NSwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL2dsb2JhbHMvaW50ZXJ2YWwuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gKCBpbnRlcnZhbCwgZnVuayApIC0+IHNldEludGVydmFsIGZ1bmssIGludGVydmFsIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLENBQU8sQ0FBc0IsQ0FBWixDQUFBLEVBQVgsQ0FBTixDQUFpQixDQUFFO0NBQWdDLENBQU0sRUFBbEIsSUFBQSxDQUFBLEVBQUE7Q0FBdEIifX0seyJvZmZzZXQiOnsibGluZSI6NTc1MSwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL2dsb2JhbHMvbG9nLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IC0+XG5cdGxvZy5oaXN0b3J5ID0gbG9nLmhpc3Rvcnkgb3IgW10gIyBzdG9yZSBsb2dzIHRvIGFuIGFycmF5IGZvciByZWZlcmVuY2Vcblx0bG9nLmhpc3RvcnkucHVzaCBhcmd1bWVudHNcblxuXHRpZiBjb25zb2xlP1xuXHRcdGNvbnNvbGUubG9nIEFycmF5OjpzbGljZS5jYWxsKGFyZ3VtZW50cykiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsQ0FBTyxFQUFVLEdBQVgsQ0FBTixFQUFpQjtDQUNoQixDQUFBLENBQUcsQ0FBMEIsR0FBN0I7Q0FBQSxDQUNBLENBQUcsQ0FBSCxHQUFXLEVBQVg7Q0FFQSxDQUFBLEVBQUcsOENBQUg7Q0FDUyxFQUFSLENBQVksQ0FBSyxFQUFWLEVBQVksRUFBbkI7SUFMZTtDQUFBIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjU3NjEsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy9nbG9iYWxzL21vdmVyLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IFxuXHRzY3JvbGxfdG8gOiAoZWwsIHdpdGhfdG9wYmFyID0gZmFsc2UsIHNwZWVkID0gMzAwKSAtPlxuXG5cdFx0eSA9IGVsLnBvc2l0aW9uKCkudG9wXG5cblx0XHRsb2cgXCJbTW92ZXJdIHNjcm9sbF90b1wiLCB5XG5cdFx0QHNjcm9sbF90b195IHksIHdpdGhfdG9wYmFyLCBzcGVlZFxuXHRcdFxuXG5cdHNjcm9sbF90b195OiAoeSwgd2l0aF90b3BiYXIgPSB0cnVlLCBzcGVlZCA9IDMwMCkgLT5cblx0XHRpZiB3aXRoX3RvcGJhclxuXHRcdFx0eSAtPSBhcHAuc2V0dGluZ3MuaGVhZGVyX2hlaWdodFxuXG5cdFx0bG9nIFwiW21vdmVyXSBzY3JvbGxfdG9feVwiLCB5XG5cdFx0XG5cdFx0JCggJ2h0bWwsIGJvZHknICkuYW5pbWF0ZSBzY3JvbGxUb3A6IHksIHNwZWVkIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLENBQU8sRUFDTixHQURLLENBQU47Q0FDQyxDQUFBLENBQVksRUFBQSxJQUFaLEVBQVk7Q0FFWCxPQUFBOztHQUY4QixHQUFkO01BRWhCOztHQUY2QyxHQUFSO01BRXJDO0NBQUEsQ0FBTSxDQUFGLENBQUosSUFBSTtDQUFKLENBRXlCLENBQXpCLENBQUEsZUFBQTtDQUNDLENBQWUsRUFBZixDQUFELE1BQUE7Q0FMRCxFQUFZO0NBQVosQ0FRQSxDQUFhLEVBQUEsSUFBQyxFQUFkOztHQUErQixHQUFkO01BQ2hCOztHQUQ0QyxHQUFSO01BQ3BDO0NBQUEsR0FBQSxPQUFBO0NBQ0MsRUFBUSxDQUFILEVBQUwsRUFBaUIsS0FBakI7TUFERDtDQUFBLENBRzJCLENBQTNCLENBQUEsaUJBQUE7Q0FFQSxNQUFBLElBQUEsQ0FBQTtDQUEwQixDQUFXLElBQVgsR0FBQTtDQU5kLENBTTRCLEdBQXhDLENBQUE7Q0FkRCxFQVFhO0NBVGQsQ0FBQSJ9fSx7Im9mZnNldCI6eyJsaW5lIjo1NzkzLCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdXRpbHMvYnJvd3Nlci5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiQnJvd3NlckRldGVjdCA9XG5cdGluaXQ6ICggKSAtPlxuXHRcdEBicm93c2VyID0gQHNlYXJjaFN0cmluZyhAZGF0YUJyb3dzZXIpIG9yIFwiQW4gdW5rbm93biBicm93c2VyXCJcblx0XHRAdmVyc2lvbiA9IEBzZWFyY2hWZXJzaW9uKG5hdmlnYXRvci51c2VyQWdlbnQpIG9yIEBzZWFyY2hWZXJzaW9uKG5hdmlnYXRvci5hcHBWZXJzaW9uKSBvciBcImFuIHVua25vd24gdmVyc2lvblwiXG5cdFx0QE9TID0gQHNlYXJjaFN0cmluZyhAZGF0YU9TKSBvciBcImFuIHVua25vd24gT1NcIlxuXG5cdHNlYXJjaFN0cmluZzogKGRhdGEpIC0+XG5cdFx0aSA9IDBcblxuXHRcdHdoaWxlIGkgPCBkYXRhLmxlbmd0aFxuXHRcdFx0ZGF0YVN0cmluZyA9IGRhdGFbaV0uc3RyaW5nXG5cdFx0XHRkYXRhUHJvcCA9IGRhdGFbaV0ucHJvcFxuXHRcdFx0QHZlcnNpb25TZWFyY2hTdHJpbmcgPSBkYXRhW2ldLnZlcnNpb25TZWFyY2ggb3IgZGF0YVtpXS5pZGVudGl0eVxuXHRcdFx0aWYgZGF0YVN0cmluZ1xuXHRcdFx0XHRyZXR1cm4gZGF0YVtpXS5pZGVudGl0eSAgdW5sZXNzIGRhdGFTdHJpbmcuaW5kZXhPZihkYXRhW2ldLnN1YlN0cmluZykgaXMgLTFcblx0XHRcdGVsc2UgcmV0dXJuIGRhdGFbaV0uaWRlbnRpdHkgIGlmIGRhdGFQcm9wXG5cdFx0XHRpKytcblx0XHRyZXR1cm5cblxuXHRzZWFyY2hWZXJzaW9uOiAoZGF0YVN0cmluZykgLT5cblx0XHRpbmRleCA9IGRhdGFTdHJpbmcuaW5kZXhPZihAdmVyc2lvblNlYXJjaFN0cmluZylcblx0XHRyZXR1cm4gIGlmIGluZGV4IGlzIC0xXG5cdFx0cGFyc2VGbG9hdCBkYXRhU3RyaW5nLnN1YnN0cmluZyhpbmRleCArIEB2ZXJzaW9uU2VhcmNoU3RyaW5nLmxlbmd0aCArIDEpXG5cblx0ZGF0YUJyb3dzZXI6IFtcblx0XHR7XG5cdFx0XHRzdHJpbmc6IG5hdmlnYXRvci51c2VyQWdlbnRcblx0XHRcdHN1YlN0cmluZzogXCJDaHJvbWVcIlxuXHRcdFx0aWRlbnRpdHk6IFwiQ2hyb21lXCJcblx0XHR9XG5cdFx0e1xuXHRcdFx0c3RyaW5nOiBuYXZpZ2F0b3IudXNlckFnZW50XG5cdFx0XHRzdWJTdHJpbmc6IFwiT21uaVdlYlwiXG5cdFx0XHR2ZXJzaW9uU2VhcmNoOiBcIk9tbmlXZWIvXCJcblx0XHRcdGlkZW50aXR5OiBcIk9tbmlXZWJcIlxuXHRcdH1cblx0XHR7XG5cdFx0XHRzdHJpbmc6IG5hdmlnYXRvci52ZW5kb3Jcblx0XHRcdHN1YlN0cmluZzogXCJBcHBsZVwiXG5cdFx0XHRpZGVudGl0eTogXCJTYWZhcmlcIlxuXHRcdFx0dmVyc2lvblNlYXJjaDogXCJWZXJzaW9uXCJcblx0XHR9XG5cdFx0e1xuXHRcdFx0cHJvcDogd2luZG93Lm9wZXJhXG5cdFx0XHRpZGVudGl0eTogXCJPcGVyYVwiXG5cdFx0XHR2ZXJzaW9uU2VhcmNoOiBcIlZlcnNpb25cIlxuXHRcdH1cblx0XHR7XG5cdFx0XHRzdHJpbmc6IG5hdmlnYXRvci52ZW5kb3Jcblx0XHRcdHN1YlN0cmluZzogXCJpQ2FiXCJcblx0XHRcdGlkZW50aXR5OiBcImlDYWJcIlxuXHRcdH1cblx0XHR7XG5cdFx0XHRzdHJpbmc6IG5hdmlnYXRvci52ZW5kb3Jcblx0XHRcdHN1YlN0cmluZzogXCJLREVcIlxuXHRcdFx0aWRlbnRpdHk6IFwiS29ucXVlcm9yXCJcblx0XHR9XG5cdFx0e1xuXHRcdFx0c3RyaW5nOiBuYXZpZ2F0b3IudXNlckFnZW50XG5cdFx0XHRzdWJTdHJpbmc6IFwiRmlyZWZveFwiXG5cdFx0XHRpZGVudGl0eTogXCJGaXJlZm94XCJcblx0XHR9XG5cdFx0e1xuXHRcdFx0c3RyaW5nOiBuYXZpZ2F0b3IudmVuZG9yXG5cdFx0XHRzdWJTdHJpbmc6IFwiQ2FtaW5vXCJcblx0XHRcdGlkZW50aXR5OiBcIkNhbWlub1wiXG5cdFx0fVxuXHRcdHtcblx0XHRcdCMgZm9yIG5ld2VyIE5ldHNjYXBlcyAoNispXG5cdFx0XHRzdHJpbmc6IG5hdmlnYXRvci51c2VyQWdlbnRcblx0XHRcdHN1YlN0cmluZzogXCJOZXRzY2FwZVwiXG5cdFx0XHRpZGVudGl0eTogXCJOZXRzY2FwZVwiXG5cdFx0fVxuXHRcdHtcblx0XHRcdHN0cmluZzogbmF2aWdhdG9yLnVzZXJBZ2VudFxuXHRcdFx0c3ViU3RyaW5nOiBcIk1TSUVcIlxuXHRcdFx0aWRlbnRpdHk6IFwiRXhwbG9yZXJcIlxuXHRcdFx0dmVyc2lvblNlYXJjaDogXCJNU0lFXCJcblx0XHR9XG5cdFx0e1xuXHRcdFx0c3RyaW5nOiBuYXZpZ2F0b3IudXNlckFnZW50XG5cdFx0XHRzdWJTdHJpbmc6IFwiR2Vja29cIlxuXHRcdFx0aWRlbnRpdHk6IFwiTW96aWxsYVwiXG5cdFx0XHR2ZXJzaW9uU2VhcmNoOiBcInJ2XCJcblx0XHR9XG5cdFx0e1xuXHRcdFx0IyBmb3Igb2xkZXIgTmV0c2NhcGVzICg0LSlcblx0XHRcdHN0cmluZzogbmF2aWdhdG9yLnVzZXJBZ2VudFxuXHRcdFx0c3ViU3RyaW5nOiBcIk1vemlsbGFcIlxuXHRcdFx0aWRlbnRpdHk6IFwiTmV0c2NhcGVcIlxuXHRcdFx0dmVyc2lvblNlYXJjaDogXCJNb3ppbGxhXCJcblx0XHR9XG5cdF1cblx0ZGF0YU9TOiBbXG5cdFx0e1xuXHRcdFx0c3RyaW5nOiBuYXZpZ2F0b3IucGxhdGZvcm1cblx0XHRcdHN1YlN0cmluZzogXCJXaW5cIlxuXHRcdFx0aWRlbnRpdHk6IFwiV2luZG93c1wiXG5cdFx0fVxuXHRcdHtcblx0XHRcdHN0cmluZzogbmF2aWdhdG9yLnBsYXRmb3JtXG5cdFx0XHRzdWJTdHJpbmc6IFwiTWFjXCJcblx0XHRcdGlkZW50aXR5OiBcIk1hY1wiXG5cdFx0fVxuXHRcdHtcblx0XHRcdHN0cmluZzogbmF2aWdhdG9yLnVzZXJBZ2VudFxuXHRcdFx0c3ViU3RyaW5nOiBcImlQaG9uZVwiXG5cdFx0XHRpZGVudGl0eTogXCJpUGhvbmUvaVBvZFwiXG5cdFx0fVxuXHRcdHtcblx0XHRcdHN0cmluZzogbmF2aWdhdG9yLnBsYXRmb3JtXG5cdFx0XHRzdWJTdHJpbmc6IFwiTGludXhcIlxuXHRcdFx0aWRlbnRpdHk6IFwiTGludXhcIlxuXHRcdH1cblx0XVxuXG5Ccm93c2VyRGV0ZWN0LmluaXQoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJyb3dzZXJEZXRlY3QiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxTQUFBOztBQUFBLENBQUEsRUFDQyxVQUREO0NBQ0MsQ0FBQSxDQUFNLENBQU4sS0FBTTtDQUNMLEVBQVcsQ0FBWCxHQUFBLElBQVcsQ0FBQSxRQUFYO0NBQUEsRUFDVyxDQUFYLEdBQUEsRUFBbUMsQ0FBZSxHQUF2QyxPQURYO0NBRUMsQ0FBRCxDQUFNLENBQUwsRUFBSyxLQUFOLENBQU07Q0FIUCxFQUFNO0NBQU4sQ0FLQSxDQUFjLENBQUEsS0FBQyxHQUFmO0NBQ0MsT0FBQSxlQUFBO0NBQUEsRUFBSSxDQUFKO0NBRUEsRUFBVSxDQUFJLEVBQWQsS0FBTTtDQUNMLEVBQWEsQ0FBSyxFQUFsQixJQUFBO0NBQUEsRUFDVyxDQUFLLEVBQWhCLEVBQUE7Q0FEQSxFQUV1QixDQUF0QixFQUFELEVBRkEsS0FFdUIsTUFBdkI7Q0FDQSxHQUFHLEVBQUgsSUFBQTtBQUMyRSxDQUExRSxHQUFnQyxDQUF5QyxFQUF6QyxDQUFoQyxDQUFnQyxDQUFVO0NBQTFDLEdBQVksSUFBWixTQUFPO1VBRFI7TUFBQSxFQUFBO0NBRUssR0FBNEIsSUFBNUI7Q0FBQSxHQUFZLElBQVosU0FBTztVQUZaO1FBSEE7QUFNQSxDQU5BLENBQUEsSUFNQTtDQVZZLElBR2I7Q0FSRCxFQUtjO0NBTGQsQ0FrQkEsQ0FBZSxNQUFDLENBQUQsR0FBZjtDQUNDLElBQUEsR0FBQTtDQUFBLEVBQVEsQ0FBUixDQUFBLEVBQVEsR0FBVSxTQUFWO0FBQ2EsQ0FBckIsR0FBQSxDQUFXO0NBQVgsV0FBQTtNQURBO0NBRVcsRUFBNkIsQ0FBQyxDQUFULENBQUEsR0FBckIsQ0FBWCxDQUFBLFFBQTREO0NBckI3RCxFQWtCZTtDQWxCZixDQXVCQSxTQUFBO0tBQ0M7Q0FBQSxDQUNTLElBQVIsR0FBaUI7Q0FEbEIsQ0FFWSxJQUFYLEVBRkQsQ0FFQztDQUZELENBR1csSUFBVixFQUFBO0VBRUQsSUFOWTtDQU1aLENBQ1MsSUFBUixHQUFpQjtDQURsQixDQUVZLElBQVgsR0FBQTtDQUZELENBR2dCLElBQWYsSUFIRCxHQUdDO0NBSEQsQ0FJVyxJQUFWLEVBQUEsQ0FKRDtFQU1BLElBWlk7Q0FZWixDQUNTLElBQVIsR0FBaUI7Q0FEbEIsQ0FFWSxJQUFYLENBRkQsRUFFQztDQUZELENBR1csSUFBVixFQUFBO0NBSEQsQ0FJZ0IsSUFBZixHQUpELElBSUM7RUFFRCxJQWxCWTtDQWtCWixDQUNPLEVBQU4sQ0FERCxDQUNDO0NBREQsQ0FFVyxJQUFWLENBRkQsQ0FFQztDQUZELENBR2dCLElBQWYsR0FIRCxJQUdDO0VBRUQsSUF2Qlk7Q0F1QlosQ0FDUyxJQUFSLEdBQWlCO0NBRGxCLENBRVksSUFBWCxHQUFBO0NBRkQsQ0FHVyxJQUFWLEVBQUE7RUFFRCxJQTVCWTtDQTRCWixDQUNTLElBQVIsR0FBaUI7Q0FEbEIsQ0FFWSxHQUZaLENBRUMsR0FBQTtDQUZELENBR1csSUFBVixFQUFBLEdBSEQ7RUFLQSxJQWpDWTtDQWlDWixDQUNTLElBQVIsR0FBaUI7Q0FEbEIsQ0FFWSxJQUFYLEdBQUE7Q0FGRCxDQUdXLElBQVYsRUFBQSxDQUhEO0VBS0EsSUF0Q1k7Q0FzQ1osQ0FDUyxJQUFSLEdBQWlCO0NBRGxCLENBRVksSUFBWCxFQUZELENBRUM7Q0FGRCxDQUdXLElBQVYsRUFBQTtFQUVELElBM0NZO0NBMkNaLENBRVMsSUFBUixHQUFpQjtDQUZsQixDQUdZLElBQVgsR0FBQSxDQUhEO0NBQUEsQ0FJVyxJQUFWLEVBQUEsRUFKRDtFQU1BLElBakRZO0NBaURaLENBQ1MsSUFBUixHQUFpQjtDQURsQixDQUVZLElBQVgsR0FBQTtDQUZELENBR1csSUFBVixFQUFBLEVBSEQ7Q0FBQSxDQUlnQixJQUFmLE9BQUE7RUFFRCxJQXZEWTtDQXVEWixDQUNTLElBQVIsR0FBaUI7Q0FEbEIsQ0FFWSxJQUFYLENBRkQsRUFFQztDQUZELENBR1csSUFBVixFQUFBLENBSEQ7Q0FBQSxDQUlnQixFQUpoQixFQUlDLE9BQUE7RUFFRCxJQTdEWTtDQTZEWixDQUVTLElBQVIsR0FBaUI7Q0FGbEIsQ0FHWSxJQUFYLEdBQUE7Q0FIRCxDQUlXLElBQVYsRUFBQSxFQUpEO0NBQUEsQ0FLZ0IsSUFBZixHQUxELElBS0M7TUFsRVc7SUF2QmI7Q0FBQSxDQTRGQSxJQUFBO0tBQ0M7Q0FBQSxDQUNTLElBQVIsRUFERCxDQUNrQjtDQURsQixDQUVZLEdBRlosQ0FFQyxHQUFBO0NBRkQsQ0FHVyxJQUFWLEVBQUEsQ0FIRDtFQUtBLElBTk87Q0FNUCxDQUNTLElBQVIsRUFERCxDQUNrQjtDQURsQixDQUVZLEdBRlosQ0FFQyxHQUFBO0NBRkQsQ0FHVyxHQUhYLENBR0MsRUFBQTtFQUVELElBWE87Q0FXUCxDQUNTLElBQVIsR0FBaUI7Q0FEbEIsQ0FFWSxJQUFYLEVBRkQsQ0FFQztDQUZELENBR1csSUFBVixFQUFBLEtBSEQ7RUFLQSxJQWhCTztDQWdCUCxDQUNTLElBQVIsRUFERCxDQUNrQjtDQURsQixDQUVZLElBQVgsQ0FGRCxFQUVDO0NBRkQsQ0FHVyxJQUFWLENBSEQsQ0FHQztNQW5CTTtJQTVGUjtDQURELENBQUE7O0FBb0hBLENBcEhBLEdBb0hBLFNBQWE7O0FBRWIsQ0F0SEEsRUFzSGlCLEdBQVgsQ0FBTixNQXRIQSJ9fSx7Im9mZnNldCI6eyJsaW5lIjo1OTExLCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdXRpbHMvb3BhY2l0eS5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiT3BhY2l0eSA9IFxuXHRzaG93OiAoZWwsIHRpbWUgPSA1MDApIC0+XG5cdFx0IyBsb2cgXCJbT3BhY2l0eV0gc2hvd1wiXG5cdFx0ZWwuZmFkZUluIHRpbWVcblx0XHQjIHQgPSBPcGFjaXR5LmdldF90aW1lKCB0aW1lIClcblx0XHQjIGVsLmNzcyBcblx0XHQjIFx0J3Zpc2liaWxpdHknIDogXCJ2aXNpYmxlXCJcblx0XHQjIFx0J3RyYW5zaXRpb24nIDogXCJvcGFjaXR5ICN7dH0gbGluZWFyXCJcblxuXHRcdCMgZGVsYXkgMSwgLT5cblx0XHQjIFx0ZWwuY3NzICdvcGFjaXR5JywgMVxuXG5cdGhpZGU6ICggZWwsIHRpbWUgPSA1MDAgKSAtPlxuXHRcdCMgbG9nIFwiW09wYWNpdHldIGhpZGVcIlxuXHRcdGVsLmZhZGVPdXQgdGltZVxuXG5cdFx0IyB0ID0gT3BhY2l0eS5nZXRfdGltZSB0aW1lXG5cdFx0IyB0MSA9IE9wYWNpdHkuZ2V0X3RpbWUoIHRpbWUgKyAxMDAgKVxuXG5cdFx0IyBlbC5jc3MgJ3RyYW5zaXRpb24nLCBcIm9wYWNpdHkgI3t0fSBsaW5lYXJcIlxuXHRcdCMgZGVsYXkgMSwgLT4gZWwuY3NzICdvcGFjaXR5JywgMFxuXHRcdCMgZGVsYXkgdDEsIC0+IGVsLmNzcyAndmlzaWJpbGl0eScsICdoaWRkZW4nXG5cblx0Z2V0X3RpbWU6ICggdGltZSApIC0+XG5cdFx0cmV0dXJuICh0aW1lLzEwMDApICsgXCJzXCJcblxubW9kdWxlLmV4cG9ydHMgPSBPcGFjaXR5Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsR0FBQTs7QUFBQSxDQUFBLEVBQ0MsSUFERDtDQUNDLENBQUEsQ0FBTSxDQUFOLEtBQU87O0dBQVcsR0FBUDtNQUVWO0NBQUcsQ0FBRCxFQUFGLEVBQUEsS0FBQTtDQUZELEVBQU07Q0FBTixDQVdBLENBQU0sQ0FBTixLQUFROztHQUFXLEdBQVA7TUFFWDtDQUFHLENBQUQsRUFBRixHQUFBLElBQUE7Q0FiRCxFQVdNO0NBWE4sQ0FzQkEsQ0FBVSxDQUFBLElBQVYsQ0FBWTtDQUNYLEVBQWEsQ0FBTCxPQUFEO0NBdkJSLEVBc0JVO0NBdkJYLENBQUE7O0FBMEJBLENBMUJBLEVBMEJpQixHQUFYLENBQU4ifX0seyJvZmZzZXQiOnsibGluZSI6NTkzNSwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3V0aWxzL3ByZWxvYWQuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gKGltYWdlcywgY2FsbGJhY2spIC0+XG5cblx0Y291bnQgPSAwXG5cdGltYWdlc19sb2FkZWQgPSBbXVxuXG5cdGxvYWQgPSAoIHNyYywgY2FsbGJhY2sgKSAtPlxuXHRcdFx0XG5cdFx0aW1nID0gbmV3IEltYWdlKClcblx0XHRpbWcub25sb2FkID0gY2FsbGJhY2tcblx0XHRpbWcuc3JjID0gc3JjXG5cblx0XHRpbWFnZXNfbG9hZGVkLnB1c2ggaW1nXG5cblx0bG9hZGVkID0gLT5cblx0XHRjb3VudCsrXG5cdFx0bG9nIFwiW1ByZWxvYWRlcl0gbG9hZF9tdWx0aXBsZSAtIGxvYWRlZFwiLCBcIiN7Y291bnR9IC8gI3tpbWFnZXMubGVuZ3RofVwiXG5cblx0XHRpZiBjb3VudCBpcyBpbWFnZXMubGVuZ3RoXG5cdFx0XHRsb2cgXCJbUHJlbG9hZGVyXSBsb2FkX211bHRpcGxlIC0gbG9hZGVkIEFMTFwiXG5cdFx0XHRjYWxsYmFjayggaW1hZ2VzX2xvYWRlZCApXG5cblx0Zm9yIGl0ZW0gaW4gaW1hZ2VzXG5cdFx0bG9hZCBpdGVtLCBsb2FkZWRcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxDQUFPLENBQW1CLENBQVQsR0FBWCxDQUFOLENBQWlCLENBQUM7Q0FFakIsS0FBQSxzREFBQTtDQUFBLENBQUEsQ0FBUSxFQUFSO0NBQUEsQ0FDQSxDQUFnQixVQUFoQjtDQURBLENBR0EsQ0FBTyxDQUFQLElBQU8sQ0FBRTtDQUVSLEVBQUEsS0FBQTtDQUFBLEVBQUEsQ0FBQSxDQUFVO0NBQVYsRUFDRyxDQUFILEVBQUEsRUFEQTtDQUFBLEVBRUcsQ0FBSDtDQUVjLEVBQWQsQ0FBQSxPQUFBLEVBQWE7Q0FUZCxFQUdPO0NBSFAsQ0FXQSxDQUFTLEdBQVQsR0FBUztBQUNSLENBQUEsQ0FBQSxFQUFBLENBQUE7Q0FBQSxDQUMwQyxDQUExQyxDQUFBLENBQTBDLENBQW1CLDhCQUE3RDtDQUVBLEdBQUEsQ0FBRyxDQUFlO0NBQ2pCLEVBQUEsR0FBQSxrQ0FBQTtDQUNVLE9BQVYsS0FBQTtNQU5PO0NBWFQsRUFXUztBQVFULENBQUE7UUFBQSxxQ0FBQTt1QkFBQTtDQUNDLENBQVcsRUFBWCxFQUFBO0NBREQ7bUJBckJnQjtDQUFBIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjU5NjQsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy91dGlscy9zZXR0aW5ncy5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiQnJvd3NlckRldGVjdCA9IHJlcXVpcmUgJ2FwcC91dGlscy9icm93c2VyJ1xuXG5zZXR0aW5ncyA9IFxuXG5cdCMgQnJvd3NlciBpZCwgdmVyc2lvbiwgT1Ncblx0YnJvd3Nlcjoge1xuXG5cdFx0IyBJRCBbU3RyaW5nXVxuXHRcdGlkOiBCcm93c2VyRGV0ZWN0LmJyb3dzZXJcblxuXHRcdCMgVmVyc2lvbiBbU3RyaW5nXVxuXHRcdHZlcnNpb246IEJyb3dzZXJEZXRlY3QudmVyc2lvblxuXHRcdFxuXHRcdCMgT1MgW1N0cmluZ11cblx0XHRPUzogQnJvd3NlckRldGVjdC5PU1xuXHRcdFxuXHRcdCMgSXMgQ2hyb21lPyBbQm9vbGVhbl1cblx0XHRjaHJvbWU6IChuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkuaW5kZXhPZiggJ2Nocm9tZScgKSA+IC0xKVxuXG5cdFx0IyBJcyBGaXJlZm94IFtCb29sZWFuXVxuXHRcdGZpcmVmb3g6ICgvRmlyZWZveC9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkpXG5cblx0XHQjIElzIElFOD8gW0Jvb2xlYW5dXG5cdFx0aWU4OiBmYWxzZVxuXG5cdFx0IyBEZXZpY2UgcmF0aW8gW051bWJlcl1cblx0XHRkZXZpY2VfcmF0aW86IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvXG5cblx0XHQjIElzIGEgaGFuZGhlbGQgZGV2aWNlPyBbQm9vbGVhbl1cblx0XHRoYW5kaGVsZDogZmFsc2VcblxuXHRcdCMgSXMgYSB0YWJsZXQ/IFtCb29sZWFuXVxuXHRcdHRhYmxldDogZmFsc2Vcblx0XHRcblx0XHQjIElzIGEgbW9iaWxlPyBbQm9vbGVhbl1cblx0XHRtb2JpbGU6IGZhbHNlXG5cblx0XHQjIElzIGRlc2t0b3A/IFNldCBhZnRlciB0aGUgY2xhc3MgZGVmaW5pdGlvbiBbQm9vbGVhbl1cblx0XHRkZXNrdG9wOiBmYWxzZVxuXG5cdFx0IyBJcyBhIHRhYmxldCBvciBtb2JpbGU/IFtCb29sZWFuXVxuXHRcdGRldmljZTogZmFsc2VcblxuXHRcdCMgRGVidWcgbW9kZSAtIHNldCBieSBlbnYgaW4gaW5kZXgucGhwXG5cdFx0ZGVidWc6IGZhbHNlXG5cblx0XHRjc3NfY292ZXJfc3VwcG9ydGVkOiBNb2Rlcm5penIuYmFja2dyb3VuZHNpemVcblxuXHRcdG1pbl9zaXplOlxuXHRcdFx0dzogOTAwXG5cdFx0XHRoOiA0MDBcblx0fVxuXG5cdCMgVXNlIHRoaXMgZmxhZyBpZiB3ZXJlIGRvaW5nIGtleWZyYW1lIGFuaW1hdGlvbnNcblx0IyBvdGhlcndpc2UgaW1wbGVtZW50IGEganMgZmFsbGJhY2tcblxuXHQjIFdlYnAgc3VwcG9ydFxuXHR3ZWJwOiBmYWxzZVxuXG5zZXR0aW5ncy50aGVtZSA9IFwiZGVza3RvcFwiXG5zZXR0aW5ncy50aHJlc2hvbGRfdGhlbWUgPSA5MDBcblxuXG4jIFJldGluYSBzdXBwb3J0ZWQgW0Jvb2xlYW5dXG5zZXR0aW5ncy5icm93c2VyLnJldGluYSA9IHNldHRpbmdzLmJyb3dzZXIuZGV2aWNlX3JhdGlvIGlzIDJcblxuIyBXZWJwIHRlc3RcbmlmIHNldHRpbmdzLmJyb3dzZXIuY2hyb21lIGFuZCBzZXR0aW5ncy5icm93c2VyLnZlcnNpb24gPj0gMzBcblx0c2V0dGluZ3Mud2VicCA9IHRydWVcblxuIyBGbGFncyBmb3IgSUVcbmlmIHNldHRpbmdzLmJyb3dzZXIuaWQgaXMgJ0V4cGxvcmVyJyBcblx0c2V0dGluZ3MuYnJvd3Nlci5pZSA9IHRydWVcblx0aWYgc2V0dGluZ3MuYnJvd3Nlci52ZXJzaW9uIGlzIDhcblx0XHRzZXR0aW5ncy5icm93c2VyLmllOCA9IHRydWVcblx0aWYgc2V0dGluZ3MuYnJvd3Nlci52ZXJzaW9uIGlzIDlcblx0XHRzZXR0aW5ncy5icm93c2VyLmllOSA9IHRydWVcblxuXG4jIElmIGl0J3MgYW4gaGFuZGhlbGQgZGV2aWNlXG5zZXR0aW5ncy52aWRlb19hY3RpdmUgPSBzZXR0aW5ncy5icm93c2VyLmlkIGlzbnQgJ0V4cGxvcmVyJ1xuXG5cblxuaWYoIC9BbmRyb2lkfHdlYk9TfGlQaG9uZXxpUGFkfGlQb2R8QmxhY2tCZXJyeXxJRU1vYmlsZXxPcGVyYSBNaW5pL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSApXG5cdHNldHRpbmdzLmJyb3dzZXIuaGFuZGhlbGQgPSB0cnVlXG5cblx0IyBDaGVjayBpZiBpdCdzIG1vYmlsZSBvciB0YWJsZXQgY2FsY3VsYXRpbmcgcmF0aW8gYW5kIG9yaWVudGF0aW9uXG5cdHJhdGlvID0gJCh3aW5kb3cpLndpZHRoKCkvJCh3aW5kb3cpLmhlaWdodCgpXG5cdHNldHRpbmdzLmJyb3dzZXIub3JpZW50YXRpb24gPSBpZiByYXRpbyA+IDEgdGhlbiBcImxhbmRzY2FwZVwiIGVsc2UgXCJwb3J0cmFpdFwiXG5cblx0IyBjaGVjayBtYXggd2lkdGggZm9yIG1vYmlsZSBkZXZpY2UgKG5leHVzIDcgaW5jbHVkZWQpXG5cdGlmICQod2luZG93KS53aWR0aCgpIDwgNjEwIG9yIChzZXR0aW5ncy5icm93c2VyLm9yaWVudGF0aW9uIGlzIFwibGFuZHNjYXBlXCIgYW5kIHJhdGlvID4gMi4xMCApXG5cdFx0c2V0dGluZ3MuYnJvd3Nlci5tb2JpbGUgPSB0cnVlXG5cdFx0c2V0dGluZ3MuYnJvd3Nlci50YWJsZXQgPSBmYWxzZVxuXHRlbHNlXG5cdFx0c2V0dGluZ3MuYnJvd3Nlci5tb2JpbGUgPSBmYWxzZVxuXHRcdHNldHRpbmdzLmJyb3dzZXIudGFibGV0ID0gdHJ1ZVxuXG5zZXR0aW5ncy5icm93c2VyLmRldmljZSA9IChzZXR0aW5ncy5icm93c2VyLnRhYmxldCBvciBzZXR0aW5ncy5icm93c2VyLm1vYmlsZSlcblxuIyBTZXQgZGVza3RvcCBmbGFnXG5pZiBzZXR0aW5ncy5icm93c2VyLnRhYmxldCBpcyBmYWxzZSBhbmQgIHNldHRpbmdzLmJyb3dzZXIubW9iaWxlIGlzIGZhbHNlXG5cdHNldHRpbmdzLmJyb3dzZXIuZGVza3RvcCA9IHRydWVcblxuXG5zZXR0aW5ncy5icm93c2VyLndpbmRvd3NfcGhvbmUgPSBmYWxzZVxuaWYgc2V0dGluZ3MuYnJvd3Nlci5tb2JpbGUgYW5kIHNldHRpbmdzLmJyb3dzZXIuaWQgaXMgJ0V4cGxvcmVyJ1xuXHRzZXR0aW5ncy5icm93c2VyLndpbmRvd3NfcGhvbmUgPSB0cnVlXG5cblxuc2V0dGluZ3MudG91Y2hfZGV2aWNlID0gc2V0dGluZ3MuYnJvd3Nlci5oYW5kaGVsZFxuXG4jIFBsYXRmb3JtIHNwZWNpZmljIGV2ZW50cyBtYXBcbnNldHRpbmdzLmV2ZW50c19tYXAgPVxuXHQnZG93bicgOiAnbW91c2Vkb3duJ1xuXHQndXAnICAgOiAnbW91c2V1cCdcblx0J21vdmUnIDogJ21vdXNlbW92ZSdcblxuaWYgc2V0dGluZ3MuYnJvd3Nlci5kZXZpY2VcblxuXHRpZiBzZXR0aW5ncy5icm93c2VyLndpbmRvd3NfcGhvbmVcblx0XHRzZXR0aW5ncy5ldmVudHNfbWFwID1cblx0XHRcdCdkb3duJyA6ICdNU1BvaW50ZXJEb3duJ1xuXHRcdFx0J3VwJyAgIDogJ01TUG9pbnRlclVwJ1xuXHRcdFx0J21vdmUnIDogJ01TUG9pbnRlck1vdmUnXG5cdFx0XHRcblx0ZWxzZVxuXHRcdHNldHRpbmdzLmV2ZW50c19tYXAgPVxuXHRcdFx0J2Rvd24nIDogJ3RvdWNoc3RhcnQnXG5cdFx0XHQndXAnICAgOiAndG91Y2hlbmQnXG5cdFx0XHQnbW92ZScgOiAndG91Y2htb3ZlJ1xuXG5cblxuXG4jIFBsYXRmb3JtIGNsYXNzXG5pZiBzZXR0aW5ncy5icm93c2VyLmRlc2t0b3Bcblx0cGxhdGZvcm0gPSAnZGVza3RvcCdcbmVsc2UgaWYgc2V0dGluZ3MuYnJvd3Nlci50YWJsZXRcblx0cGxhdGZvcm0gPSAndGFibGV0J1xuZWxzZVxuXHRwbGF0Zm9ybSA9ICdtb2JpbGUnXG5cbiMgQnJvd3NlciBjbGFzcyBmb3IgdGhlIGJvZHlcbnNldHRpbmdzLmJyb3dzZXJfY2xhc3MgPSBzZXR0aW5ncy5icm93c2VyLmlkICsgJ18nICsgc2V0dGluZ3MuYnJvd3Nlci52ZXJzaW9uXG5cbmhhczNkID0gLT5cblx0ZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicFwiKVxuXHRoYXMzZCA9IHVuZGVmaW5lZFxuXHR0cmFuc2Zvcm1zID1cblx0XHR3ZWJraXRUcmFuc2Zvcm06IFwiLXdlYmtpdC10cmFuc2Zvcm1cIlxuXHRcdE9UcmFuc2Zvcm06IFwiLW8tdHJhbnNmb3JtXCJcblx0XHRtc1RyYW5zZm9ybTogXCItbXMtdHJhbnNmb3JtXCJcblx0XHRNb3pUcmFuc2Zvcm06IFwiLW1vei10cmFuc2Zvcm1cIlxuXHRcdHRyYW5zZm9ybTogXCJ0cmFuc2Zvcm1cIlxuXG5cblx0IyBBZGQgaXQgdG8gdGhlIGJvZHkgdG8gZ2V0IHRoZSBjb21wdXRlZCBzdHlsZS5cblx0ZG9jdW1lbnQuYm9keS5pbnNlcnRCZWZvcmUgZWwsIG51bGxcblx0Zm9yIHQgb2YgdHJhbnNmb3Jtc1xuXHRcdGlmIGVsLnN0eWxlW3RdIGlzbnQgYHVuZGVmaW5lZGBcblx0XHRcdGVsLnN0eWxlW3RdID0gXCJ0cmFuc2xhdGUzZCgxcHgsMXB4LDFweClcIlxuXHRcdFx0aGFzM2QgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbCkuZ2V0UHJvcGVydHlWYWx1ZSh0cmFuc2Zvcm1zW3RdKVxuXHRkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkIGVsXG5cdGhhczNkIGlzbnQgYHVuZGVmaW5lZGAgYW5kIGhhczNkLmxlbmd0aCA+IDAgYW5kIGhhczNkIGlzbnQgXCJub25lXCJcblxuXG4jIHNldHRpbmdzLmhhczNkID0gaGFzM2QoKVxuXG5cblxuc2V0dGluZ3MuYmluZCA9IChib2R5KS0+XG5cdGtsYXNzZXMgPSBbXVxuXHRrbGFzc2VzLnB1c2ggc2V0dGluZ3MuYnJvd3Nlcl9jbGFzc1xuXHRrbGFzc2VzLnB1c2ggc2V0dGluZ3MuYnJvd3Nlci5PUy5yZXBsYWNlKCAnLycsICdfJyApXG5cdGtsYXNzZXMucHVzaCBzZXR0aW5ncy5icm93c2VyLmlkXG5cblx0aWYgc2V0dGluZ3MudG91Y2hfZGV2aWNlXG5cdFx0a2xhc3Nlcy5wdXNoIFwidG91Y2hfZGV2aWNlXCJcblx0ZWxzZVxuXHRcdGtsYXNzZXMucHVzaCBcIm5vX3RvdWNoX2RldmljZVwiXG5cblx0aWYgc2V0dGluZ3MuYnJvd3Nlci5jc3NfY292ZXJfc3VwcG9ydGVkXG5cdFx0a2xhc3Nlcy5wdXNoIFwiY3NzX2NvdmVyX3N1cHBvcnRlZFwiXG5cblx0Ym9keS5hZGRDbGFzcyBrbGFzc2VzLmpvaW4oIFwiIFwiICkudG9Mb3dlckNhc2UoKVxuXG5cdHNldHRpbmdzLmhlYWRlcl9oZWlnaHQgPSAkKCAnaGVhZGVyJyApLmhlaWdodCgpXG5cdCMgYm9keS5jc3MgXG5cdCMgXHQnbWluLXdpZHRoJyAgOiBzZXR0aW5ncy5icm93c2VyLm1pbl9zaXplLndcblx0IyBcdCdtaW4taGVpZ2h0JyA6IHNldHRpbmdzLmJyb3dzZXIubWluX3NpemUuaFxuXG5cblxuIyBURU1QXG5cbiMgc2V0dGluZ3MudmlkZW9fYWN0aXZlID0gZmFsc2VcbiMgc2V0dGluZ3MuY3NzX2NvdmVyX3N1cHBvcnRlZCA9IGZhbHNlXG5cblxubW9kdWxlLmV4cG9ydHMgPSBzZXR0aW5ncyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLDJDQUFBOztBQUFBLENBQUEsRUFBZ0IsSUFBQSxNQUFoQixNQUFnQjs7QUFFaEIsQ0FGQSxFQUtDLEtBSEQ7Q0FHQyxDQUFBLEtBQUE7Q0FBUyxDQUdSLEVBQUEsR0FIUSxNQUdTO0NBSFQsQ0FNQyxFQUFULEdBQUEsTUFBc0I7Q0FOZCxDQVNSLEVBQUEsU0FBaUI7QUFHaUQsQ0FaMUQsQ0FZQyxDQUF3RCxDQUFqRSxFQUFBLENBQVMsQ0FBQSxDQUFTLEVBQVQ7Q0FaRCxDQWVFLEVBQVYsR0FBQSxFQUFtQyxDQUFmO0NBZlosQ0FrQkgsQ0FBTCxDQUFBLENBbEJRO0NBQUEsQ0FxQk0sRUFBZCxFQUFvQixNQUFwQixJQXJCUTtDQUFBLENBd0JFLEVBQVYsQ0F4QlEsR0F3QlI7Q0F4QlEsQ0EyQkEsRUFBUixDQTNCUSxDQTJCUjtDQTNCUSxDQThCQSxFQUFSLENBOUJRLENBOEJSO0NBOUJRLENBaUNDLEVBQVQsQ0FqQ1EsRUFpQ1I7Q0FqQ1EsQ0FvQ0EsRUFBUixDQXBDUSxDQW9DUjtDQXBDUSxDQXVDRCxFQUFQLENBQUE7Q0F2Q1EsQ0F5Q2EsRUFBckIsS0FBOEIsS0F6Q3RCLEtBeUNSO0NBekNRLENBNENQLEVBREQsSUFBQTtDQUNDLENBQUcsQ0FBSCxHQUFBO0NBQUEsQ0FDRyxDQURILEdBQ0E7TUE3Q087SUFBVDtDQUFBLENBb0RBLEVBQUEsQ0FwREE7Q0FMRCxDQUFBOztBQTJEQSxDQTNEQSxFQTJEaUIsRUFBakIsR0FBUSxDQTNEUjs7QUE0REEsQ0E1REEsRUE0RDJCLEtBQW5CLE9BQVI7O0FBSUEsQ0FoRUEsRUFnRTBCLEVBQWlDLENBQTNELENBQWdCLENBQVIsSUFBa0I7O0FBRzFCLENBQUEsQ0FBQSxFQUFHLEVBQUEsQ0FBZ0IsQ0FBUjtDQUNWLENBQUEsQ0FBZ0IsQ0FBaEIsSUFBUTtFQXBFVDs7QUF1RUEsQ0FBQSxDQUFHLEVBQUEsQ0FBdUIsRUFBUCxDQUFSLEVBQVg7Q0FDQyxDQUFBLENBQXNCLENBQXRCLEdBQWdCLENBQVI7Q0FDUixDQUFBLEVBQUcsQ0FBNEIsRUFBWixDQUFSO0NBQ1YsRUFBQSxDQUFBLEdBQWdCLENBQVI7SUFGVDtDQUdBLENBQUEsRUFBRyxDQUE0QixFQUFaLENBQVI7Q0FDVixFQUFBLENBQUEsR0FBZ0IsQ0FBUjtJQUxWO0VBdkVBOztBQWdGQSxDQWhGQSxDQWdGd0IsQ0FBQSxFQUF5QixFQUFULENBQWhDLEVBaEZSLEVBZ0ZBOztBQUlBLENBQUEsR0FBSSxLQUErRSx1REFBZjtDQUNuRSxDQUFBLENBQTRCLENBQTVCLEdBQWdCLENBQVI7Q0FBUixDQUdBLENBQVEsRUFBUixDQUFRO0NBSFIsQ0FJQSxDQUFrQyxFQUFBLEVBQWxCLENBQVIsRUFKUixDQUlBO0NBR0EsQ0FBQSxDQUF1QixDQUFwQixDQUFBLENBQUEsQ0FBNEMsQ0FBUixHQUFSO0NBQzlCLEVBQTBCLENBQTFCLEVBQUEsQ0FBZ0IsQ0FBUjtDQUFSLEVBQzBCLENBQTFCLENBREEsQ0FDQSxDQUFnQixDQUFSO0lBRlQsRUFBQTtDQUlDLEVBQTBCLENBQTFCLENBQUEsQ0FBQSxDQUFnQixDQUFSO0NBQVIsRUFDMEIsQ0FBMUIsRUFBQSxDQUFnQixDQUFSO0lBYlY7RUFwRkE7O0FBbUdBLENBbkdBLEVBbUcyQixDQUEyQixFQUF0RCxDQUFnQixDQUFSOztBQUdSLENBQUEsR0FBRyxDQUEyQixDQUEzQixDQUFnQixDQUFSO0NBQ1YsQ0FBQSxDQUEyQixDQUEzQixHQUFnQixDQUFSO0VBdkdUOztBQTBHQSxDQTFHQSxFQTBHaUMsRUExR2pDLEVBMEdnQixDQUFSLEtBQVI7O0FBQ0EsQ0FBQSxDQUErQixFQUE1QixDQUFtRCxDQUFuRCxDQUFnQixDQUFSLEVBQVg7Q0FDQyxDQUFBLENBQWlDLENBQWpDLEdBQWdCLENBQVIsS0FBUjtFQTVHRDs7QUErR0EsQ0EvR0EsRUErR3dCLElBQWdCLENBQWhDLElBQVI7O0FBR0EsQ0FsSEEsRUFtSEMsS0FETyxFQUFSO0NBQ0MsQ0FBQSxJQUFBLEtBQUE7Q0FBQSxDQUNBLEVBQUEsS0FEQTtDQUFBLENBRUEsSUFBQSxLQUZBO0NBbkhELENBQUE7O0FBdUhBLENBQUEsR0FBRyxFQUFILENBQW1CLENBQVI7Q0FFVixDQUFBLEVBQUcsR0FBZ0IsQ0FBUixLQUFYO0NBQ0MsRUFDQyxDQURELElBQVEsRUFBUjtDQUNDLENBQVMsSUFBVCxTQUFBO0NBQUEsQ0FDUyxFQUFULEVBQUEsT0FEQTtDQUFBLENBRVMsSUFBVCxTQUZBO0NBRkYsS0FDQztJQURELEVBQUE7Q0FPQyxFQUNDLENBREQsSUFBUSxFQUFSO0NBQ0MsQ0FBUyxJQUFULE1BQUE7Q0FBQSxDQUNTLEVBQVQsRUFBQSxJQURBO0NBQUEsQ0FFUyxJQUFULEtBRkE7Q0FSRixLQU9DO0lBVEY7RUF2SEE7O0FBeUlBLENBQUEsR0FBRyxHQUFnQixDQUFSO0NBQ1YsQ0FBQSxDQUFXLEtBQVgsQ0FBQTtDQUNnQixDQUZqQixFQUVRLEVBRlIsQ0FFd0IsQ0FBUjtDQUNmLENBQUEsQ0FBVyxLQUFYO0VBSEQsSUFBQTtDQUtDLENBQUEsQ0FBVyxLQUFYO0VBOUlEOztBQWlKQSxDQWpKQSxDQWlKeUIsQ0FBQSxJQUFnQixDQUFqQyxLQUFSOztBQUVBLENBbkpBLEVBbUpRLEVBQVIsSUFBUTtDQUNQLEtBQUEsV0FBQTtDQUFBLENBQUEsQ0FBSyxLQUFRLEtBQVI7Q0FBTCxDQUNBLENBQVEsRUFBUixDQURBO0NBQUEsQ0FFQSxDQUNDLE9BREQ7Q0FDQyxDQUFpQixFQUFqQixXQUFBLElBQUE7Q0FBQSxDQUNZLEVBQVosTUFBQSxJQURBO0NBQUEsQ0FFYSxFQUFiLE9BQUEsSUFGQTtDQUFBLENBR2MsRUFBZCxRQUFBLElBSEE7Q0FBQSxDQUlXLEVBQVgsS0FBQSxFQUpBO0NBSEQsR0FBQTtDQUFBLENBV0EsRUFBYSxJQUFMLElBQVI7QUFDQSxDQUFBLEVBQUEsSUFBQSxRQUFBO0NBQ0MsQ0FBSyxFQUFMLENBQVksSUFBWjtDQUNDLENBQUUsQ0FBWSxFQUFMLENBQVQsb0JBQUE7Q0FBQSxDQUNRLENBQUEsRUFBUixDQUFBLElBQWdFLE1BQXhEO01BSFY7Q0FBQSxFQVpBO0NBQUEsQ0FnQkEsRUFBYSxJQUFMLEdBQVI7Q0FDaUMsRUFBUyxDQUFmLENBQTNCLENBQTJCLEdBQTNCO0NBbEJPOztBQXlCUixDQTVLQSxFQTRLZ0IsQ0FBaEIsSUFBUSxDQUFTO0NBQ2hCLEtBQUEsQ0FBQTtDQUFBLENBQUEsQ0FBVSxJQUFWO0NBQUEsQ0FDQSxFQUFBLEdBQU8sQ0FBYyxLQUFyQjtDQURBLENBRUEsQ0FBYSxDQUFiLEdBQU8sQ0FBYztDQUZyQixDQUdBLEVBQUEsR0FBTyxDQUFjO0NBRXJCLENBQUEsRUFBRyxJQUFRLElBQVg7Q0FDQyxHQUFBLEdBQU8sT0FBUDtJQURELEVBQUE7Q0FHQyxHQUFBLEdBQU8sVUFBUDtJQVJEO0NBVUEsQ0FBQSxFQUFHLEdBQWdCLENBQVIsV0FBWDtDQUNDLEdBQUEsR0FBTyxjQUFQO0lBWEQ7Q0FBQSxDQWFBLENBQWMsQ0FBVixHQUFpQixDQUFyQixHQUFjO0NBRUwsRUFBZ0IsR0FBQSxFQUFqQixDQUFSLElBQUE7Q0FoQmU7O0FBNkJoQixDQXpNQSxFQXlNaUIsR0FBWCxDQUFOLENBek1BIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjYxMTcsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92ZW5kb3JzLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJ2ZW5kb3JzID0gXG4gICMgZG9jdW1lbnRhdGlvbjogaHR0cDovL21vZGVybml6ci5jb20vZG9jcy9cbiAgTW9kZXJuaXpyICAgICAgICAgICAgOiByZXF1aXJlICcuLi92ZW5kb3JzL21vZGVybml6ci5jdXN0b20uanMnXG5cbiAgIyBkb2N1bWVudGF0aW9uOiBodHRwczovL2dpdGh1Yi5jb20vamVyZW15aGFycmlzL0xvY2FsQ29ubmVjdGlvbi5qcy90cmVlL21hc3RlclxuICBMb2NhbENvbm5lY3Rpb24gICAgICA6IHJlcXVpcmUgJy4uL3ZlbmRvcnMvTG9jYWxDb25uZWN0aW9uLmpzJ1xuXG5cbiAgIyBkb2N1bW50YXRpb246IGh0dHBzOi8vZ2l0aHViLmNvbS9qb2V3YWxuZXMvcmVjb25uZWN0aW5nLXdlYnNvY2tldFxuICBSZWNvbm5lY3RpbmdXZWJzb2NrZXQ6IHJlcXVpcmUgJy4uL3ZlbmRvcnMvcmVjb25uZWN0aW5nLXdlYnNvY2tldC5qcydcblxuICAjIERvY3VtZW50YXRpb246IGh0dHA6Ly9jbG91ZGluYXJ5LmNvbS9kb2N1bWVudGF0aW9uL2pxdWVyeV9pbnRlZ3JhdGlvblxuICBKcXVlcnlVaVdpZGdldCAgICAgICA6IHJlcXVpcmUgJy4uL3ZlbmRvcnMvanF1ZXJ5LnVpLndpZGdldC5qcydcbiAgSWZyYW1lVHJhbnNwb3J0ICAgICAgOiByZXF1aXJlICcuLi92ZW5kb3JzL2pxdWVyeS5pZnJhbWUtdHJhbnNwb3J0LmpzJ1xuICBGaWxlVXBsb2FkICAgICAgICAgICA6IHJlcXVpcmUgJy4uL3ZlbmRvcnMvanF1ZXJ5LmZpbGV1cGxvYWQuanMnXG4gIENsb3VkaW5hcnkgICAgICAgICAgIDogcmVxdWlyZSAnLi4vdmVuZG9ycy9qcXVlcnkuY2xvdWRpbmFyeS5qcydcblxubW9kdWxlLmV4cG9ydHMgPSB2ZW5kb3JzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsR0FBQTs7QUFBQSxDQUFBLEVBRUUsSUFGRjtDQUVFLENBQUEsS0FBdUIsRUFBdkIsdUJBQXVCO0NBQXZCLENBR0EsS0FBdUIsUUFBdkIsZ0JBQXVCO0NBSHZCLENBT0EsS0FBdUIsY0FBdkIsaUJBQXVCO0NBUHZCLENBVUEsS0FBdUIsT0FBdkIsa0JBQXVCO0NBVnZCLENBV0EsS0FBdUIsUUFBdkIsd0JBQXVCO0NBWHZCLENBWUEsS0FBdUIsR0FBdkIsdUJBQXVCO0NBWnZCLENBYUEsS0FBdUIsR0FBdkIsdUJBQXVCO0NBZnpCLENBQUE7O0FBaUJBLENBakJBLEVBaUJpQixHQUFYLENBQU4ifX0seyJvZmZzZXQiOnsibGluZSI6NjEzMywiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2J1dHRvbnMvc3RhcnRfcmVjb3JkaW5nLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJhcHBjYXN0ID0gcmVxdWlyZSAnYXBwL2NvbnRyb2xsZXJzL2FwcGNhc3QnXG5cbm1vZHVsZS5leHBvcnRzID0gKCBkb20gKSAtPlxuXG4gIGRvbS5jbGljayAtPiBcblxuICAgIGlmIG5vdCBhcHBjYXN0LmdldCAnc3RyZWFtaW5nOm9ubGluZSdcblxuICAgICAgY29uc29sZS5lcnJvciAnLSBjYW50IHN0YXJ0IHJlY29yZGluZyBpZiBub3Qgc3RyZWFtaW5nJ1xuICAgICAgcmV0dXJuXG5cbiAgICBjb25zb2xlLmxvZyAnKyBzdGFydCByZWNvcmRpbmcnLCBhcHBjYXN0LmdldCAnaW5wdXRfZGV2aWNlJ1xuICAgIFxuICAgICMgcG9zdCB0byBiYWNrZW5kIGluIG9yZGVyIHRvIHN0YXJ0IHJlY29yZGluZyBzZXRcblxuICAgIHVybCAgPSBcIi90YXBlL3N0YXJ0L3JlY29yZGluZ1wiXG4gICAgZG9uZSA9IC0+XG4gICAgICBjb25zb2xlLmluZm8gJysgcmVjb3JkaW5nIHBvc3QgZG9uZSAtPicsIGFyZ3VtZW50c1xuICAgICAgYXBwY2FzdC5zZXQgJ3JlY29yZGluZycsIHRydWVcblxuICAgIGZhaWwgPSAtPlxuICAgICAgY29uc29sZS5lcnJvciAnLSBmYWlsaW5nIHRyeWluZyB0byBzdGFydCByZWNvcmRpbmcgLT4nLCBhcmd1bWVudHNcblxuICAgICMgcG9zdCB0byBiYWNrZW5kIGluIG9yZGVyIHRvIHN0YXJ0IHJlY29yZGluZ1xuICAgICQucG9zdCggdXJsICkuZG9uZSggZG9uZSApLmZhaWwoIGZhaWwgKSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLEdBQUE7O0FBQUEsQ0FBQSxFQUFVLElBQVYsa0JBQVU7O0FBRVYsQ0FGQSxFQUVpQixHQUFYLENBQU4sRUFBbUI7Q0FFYixFQUFELEVBQUgsSUFBQTtDQUVFLE9BQUEsT0FBQTtBQUFPLENBQVAsRUFBTyxDQUFQLEdBQWMsV0FBUDtDQUVMLElBQUEsQ0FBQSxDQUFPLGtDQUFQO0NBQ0EsV0FBQTtNQUhGO0NBQUEsQ0FLaUMsQ0FBakMsQ0FBQSxHQUFPLE9BQTBCLEtBQWpDO0NBTEEsRUFTQSxDQUFBLG1CQVRBO0NBQUEsRUFVTyxDQUFQLEtBQU87Q0FDTCxDQUF5QyxFQUF6QyxFQUFBLENBQU8sRUFBUCxpQkFBQTtDQUNRLENBQWlCLENBQXpCLENBQUEsR0FBTyxJQUFQLEVBQUE7Q0FaRixJQVVPO0NBVlAsRUFjTyxDQUFQLEtBQU87Q0FDRyxDQUFnRCxHQUF4RCxFQUFPLEVBQVAsSUFBQSwyQkFBQTtDQWZGLElBY087Q0FJTixFQUFELENBQUEsT0FBQTtDQXBCRixFQUFVO0NBRksifX0seyJvZmZzZXQiOnsibGluZSI6NjE1OSwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2J1dHRvbnMvc3RhcnRfc3RyZWFtLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJhcHBjYXN0ID0gcmVxdWlyZSAnYXBwL2NvbnRyb2xsZXJzL2FwcGNhc3QnXG5cbm1vZHVsZS5leHBvcnRzID0gKCBkb20gKSAtPlxuXG4gIGRvbS5jbGljayAtPiBcblxuICAgIGlmIG5vdCBhcHBjYXN0LmdldCAnaW5wdXRfZGV2aWNlJ1xuXG4gICAgICBjb25zb2xlLmVycm9yICctIGNhbnQgc3RhcnQgc3RyZWFtIGJlZm9yZSBzZWxlY3RpbmcgaW5wdXQgZGV2aWNlJ1xuICAgICAgcmV0dXJuXG5cbiAgICBjb25zb2xlLmxvZyAnc3RhcnRpbmcgc3RyZWFtaW5nIHdpdGgnLCBhcHBjYXN0LmdldCAnaW5wdXRfZGV2aWNlJ1xuICAgIFxuICAgIGFwcGNhc3Quc3RhcnRfc3RyZWFtIGFwcGNhc3QuZ2V0ICdpbnB1dF9kZXZpY2UnIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsR0FBQTs7QUFBQSxDQUFBLEVBQVUsSUFBVixrQkFBVTs7QUFFVixDQUZBLEVBRWlCLEdBQVgsQ0FBTixFQUFtQjtDQUViLEVBQUQsRUFBSCxJQUFBO0FBRVMsQ0FBUCxFQUFPLENBQVAsR0FBYyxPQUFQO0NBRUwsSUFBQSxDQUFBLENBQU8sNENBQVA7Q0FDQSxXQUFBO01BSEY7Q0FBQSxDQUt1QyxDQUF2QyxDQUFBLEdBQU8sT0FBZ0MsV0FBdkM7Q0FFUSxFQUFhLElBQWQsSUFBUCxDQUFBLEVBQXFCO0NBVHZCLEVBQVU7Q0FGSyJ9fSx7Im9mZnNldCI6eyJsaW5lIjo2MTc2LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvYnV0dG9ucy9zdG9wX3JlY29yZGluZy5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiYXBwY2FzdCA9IHJlcXVpcmUgJ2FwcC9jb250cm9sbGVycy9hcHBjYXN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9ICggZG9tICkgLT5cblxuICBkb20uY2xpY2sgLT4gXG5cbiAgICBpZiBub3QgYXBwY2FzdC5nZXQgJ3N0cmVhbTpyZWNvcmRpbmcnXG5cbiAgICAgIGNvbnNvbGUuZXJyb3IgJy0gY2FudCBzdG9wIHJlY29yZGluZyBpZiBub3QgcmVjb3JkaW5nJ1xuICAgICAgcmV0dXJuXG5cbiAgICBjb25zb2xlLmxvZyAnKyBzdG9wcGluZyB0byByZWNvcmQgd2l0aCAnLCBhcHBjYXN0LmdldCAnaW5wdXRfZGV2aWNlJ1xuICAgIFxuICAgICMgcG9zdCB0byBiYWNrZW5kIGluIG9yZGVyIHRvIHN0YXJ0IHJlY29yZGluZyBzZXRcblxuICAgIHVybCAgPSBcIi90YXBlL3N0b3AvcmVjb3JkaW5nXCJcbiAgICBkb25lID0gLT5cbiAgICAgIGNvbnNvbGUuaW5mbyAnKyAvdGFwZS9zdG9wL3JlY29yZGluZyBwb3N0IGRvbmUgLT4nLCBhcmd1bWVudHNcblxuICAgIGZhaWwgPSAtPlxuICAgICAgY29uc29sZS5lcnJvciAnLSAvdGFwZS9zdG9wL3JlY29yZGluZyBwb3N0IGZhaWxlZCAtPicsIGFyZ3VtZW50c1xuXG4gICAgIyBwb3N0IHRvIGJhY2tlbmQgaW4gb3JkZXIgdG8gc3RhcnQgcmVjb3JkaW5nXG4gICAgJC5wb3N0KCB1cmwgKS5kb25lKCBkb25lICkuZmFpbCggZmFpbCApIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsR0FBQTs7QUFBQSxDQUFBLEVBQVUsSUFBVixrQkFBVTs7QUFFVixDQUZBLEVBRWlCLEdBQVgsQ0FBTixFQUFtQjtDQUViLEVBQUQsRUFBSCxJQUFBO0NBRUUsT0FBQSxPQUFBO0FBQU8sQ0FBUCxFQUFPLENBQVAsR0FBYyxXQUFQO0NBRUwsSUFBQSxDQUFBLENBQU8saUNBQVA7Q0FDQSxXQUFBO01BSEY7Q0FBQSxDQUswQyxDQUExQyxDQUFBLEdBQU8sT0FBbUMsY0FBMUM7Q0FMQSxFQVNBLENBQUEsa0JBVEE7Q0FBQSxFQVVPLENBQVAsS0FBTztDQUNHLENBQTRDLEVBQXBELEdBQU8sRUFBUCxJQUFBLHdCQUFBO0NBWEYsSUFVTztDQVZQLEVBYU8sQ0FBUCxLQUFPO0NBQ0csQ0FBK0MsR0FBdkQsRUFBTyxFQUFQLElBQUEsMEJBQUE7Q0FkRixJQWFPO0NBSU4sRUFBRCxDQUFBLE9BQUE7Q0FuQkYsRUFBVTtDQUZLIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjYyMDEsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9idXR0b25zL3N0b3Bfc3RyZWFtLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJhcHBjYXN0ID0gcmVxdWlyZSAnYXBwL2NvbnRyb2xsZXJzL2FwcGNhc3QnXG5cbm1vZHVsZS5leHBvcnRzID0gKCBkb20gKSAtPlxuXG4gIGRvbS5jbGljayAtPiBcblxuICAgIGlmIG5vdCBhcHBjYXN0LmdldCAnc3RyZWFtaW5nOm9ubGluZSdcblxuICAgICAgY29uc29sZS5lcnJvciAnLSBjYW50IHN0b3Agc3RyZWFtIGlmIG5vdCBzdHJlYW1pbmcnXG4gICAgICByZXR1cm5cblxuICAgIGNvbnNvbGUubG9nICcrIHN0b3Bpbmcgc3RyZWFtaW5nIHdpdGgnLCBhcHBjYXN0LmdldCAnaW5wdXRfZGV2aWNlJ1xuICAgIFxuICAgIGFwcGNhc3Quc3RvcF9zdHJlYW0oKSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLEdBQUE7O0FBQUEsQ0FBQSxFQUFVLElBQVYsa0JBQVU7O0FBRVYsQ0FGQSxFQUVpQixHQUFYLENBQU4sRUFBbUI7Q0FFYixFQUFELEVBQUgsSUFBQTtBQUVTLENBQVAsRUFBTyxDQUFQLEdBQWMsV0FBUDtDQUVMLElBQUEsQ0FBQSxDQUFPLDhCQUFQO0NBQ0EsV0FBQTtNQUhGO0NBQUEsQ0FLd0MsQ0FBeEMsQ0FBQSxHQUFPLE9BQWlDLFlBQXhDO0NBRVEsTUFBRCxJQUFQO0NBVEYsRUFBVTtDQUZLIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjYyMTgsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9jb21wb25lbnRzL2NsaWNrX3RyaWdnZXIuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIkhvdmVyVHJpZ2dlciA9IHJlcXVpcmUgJ2FwcC92aWV3cy9jb21wb25lbnRzL2hvdmVyX3RyaWdnZXInXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgQ2xpY2tUcmlnZ2VyIGV4dGVuZHMgSG92ZXJUcmlnZ2VyXG5cblx0c2V0X2xpc3RlbmVyczogKCApIC0+XG5cdFx0QGRvbS5vbiAnY2xpY2snLCBAdG9nZ2xlXG5cdFx0YXBwLndpbmRvdy5vbiBcImJvZHk6Y2xpY2tlZFwiLCBAY2xvc2VcblxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsNEJBQUE7R0FBQTtrU0FBQTs7QUFBQSxDQUFBLEVBQWUsSUFBQSxLQUFmLHdCQUFlOztBQUVmLENBRkEsRUFFdUIsR0FBakIsQ0FBTjtDQUVDOzs7OztDQUFBOztDQUFBLEVBQWUsTUFBQSxJQUFmO0NBQ0MsQ0FBQSxDQUFJLENBQUosRUFBQSxDQUFBO0NBQ0ksQ0FBSixDQUFHLENBQTRCLENBQS9CLENBQVUsS0FBVixHQUFBO0NBRkQsRUFBZTs7Q0FBZjs7Q0FGMkMifX0seyJvZmZzZXQiOnsibGluZSI6NjI0MywiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2NvbXBvbmVudHMvZnVsbHNjcmVlbi5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBGdWxsc2NyZWVuXG5cdGZhY3RvcjogMVxuXHRjb25zdHJ1Y3RvcjogKCBAZG9tICkgLT5cblx0XHRAZG9tLmFkZENsYXNzICdmdWxsc2NyZWVuJ1xuXHRcdGlmIEBkb20uZGF0YSAnZmFjdG9yJ1xuXHRcdFx0QGZhY3RvciA9IEBkb20uZGF0YSAnZmFjdG9yJ1xuXG5cdFx0YXBwLndpbmRvdy5vbiAncmVzaXplJywgQG9uX3Jlc2l6ZVxuXHRcdGRvIEBvbl9yZXNpemVcblxuXHRvbl9yZXNpemU6ICggKSA9PlxuXHRcdEBkb20uY3NzXG4gXHRcdFx0J3dpZHRoJyA6ICcxMDAlJ1xuIFx0XHRcdCdoZWlnaHQnIDogKGFwcC53aW5kb3cuaCAtIGFwcC5zZXR0aW5ncy5oZWFkZXJfaGVpZ2h0KSpAZmFjdG9yXG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxNQUFBO0dBQUEsK0VBQUE7O0FBQUEsQ0FBQSxFQUF1QixHQUFqQixDQUFOO0NBQ0MsRUFBUSxHQUFSOztDQUNhLENBQUEsQ0FBQSxpQkFBRztDQUNmLEVBRGUsQ0FBRDtDQUNkLDRDQUFBO0NBQUEsRUFBSSxDQUFKLElBQUEsSUFBQTtDQUNBLEVBQU8sQ0FBUCxJQUFHO0NBQ0YsRUFBVSxDQUFULEVBQUQsRUFBVTtNQUZYO0NBQUEsQ0FJQSxDQUFHLENBQUgsRUFBVSxFQUFWLENBQUE7Q0FKQSxHQUtHLEtBQUg7Q0FQRCxFQUNhOztDQURiLEVBU1csTUFBWDtDQUNFLEVBQUcsQ0FBSCxPQUFEO0NBQ0UsQ0FBVSxJQUFWLENBQUE7Q0FBQSxDQUNXLENBQUksQ0FBeUMsRUFBeEQsRUFBQSxLQUFXO0NBSEgsS0FDVjtDQVZELEVBU1c7O0NBVFg7O0NBREQifX0seyJvZmZzZXQiOnsibGluZSI6NjI3MywiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2NvbXBvbmVudHMvaG92ZXIuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbImhhcHBlbnMgPSByZXF1aXJlICdoYXBwZW5zJ1xubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBIb3ZlclxuXHRjb25zdHJ1Y3RvcjogKCBAZG9tICkgLT5cblx0XHRyZXR1cm4gaWYgYXBwLnNldHRpbmdzLnRvdWNoX2RldmljZVxuXG5cdFx0aGFwcGVucyBAXG5cdFx0XG5cdFx0QGRvbS5vbiAnbW91c2VvdmVyJywgQG9uX21vdXNlX292ZXJcblx0XHRAZG9tLm9uICdtb3VzZWxlYXZlJywgQG9uX21vdXNlX2xlYXZlXG5cblx0XHRAZG9tLmFkZENsYXNzICdob3Zlcl9vYmplY3QnXG5cblx0b25fbW91c2Vfb3ZlcjogKCApID0+XG5cdFx0QGRvbS5hZGRDbGFzcyAnaG92ZXJlZCdcblxuXHRvbl9tb3VzZV9sZWF2ZTogKCApID0+XG5cdFx0QGRvbS5yZW1vdmVDbGFzcyAnaG92ZXJlZCciXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxVQUFBO0dBQUEsK0VBQUE7O0FBQUEsQ0FBQSxFQUFVLElBQVYsRUFBVTs7QUFDVixDQURBLEVBQ3VCLEdBQWpCLENBQU47Q0FDYyxDQUFBLENBQUEsWUFBRztDQUNmLEVBRGUsQ0FBRDtDQUNkLHNEQUFBO0NBQUEsb0RBQUE7Q0FBQSxFQUFhLENBQWIsSUFBc0IsSUFBdEI7Q0FBQSxXQUFBO01BQUE7Q0FBQSxHQUVBLEdBQUE7Q0FGQSxDQUlBLENBQUksQ0FBSixPQUFBLEVBQUE7Q0FKQSxDQUtBLENBQUksQ0FBSixRQUFBLEVBQUE7Q0FMQSxFQU9JLENBQUosSUFBQSxNQUFBO0NBUkQsRUFBYTs7Q0FBYixFQVVlLE1BQUEsSUFBZjtDQUNFLEVBQUcsQ0FBSCxJQUFELENBQUEsRUFBQTtDQVhELEVBVWU7O0NBVmYsRUFhZ0IsTUFBQSxLQUFoQjtDQUNFLEVBQUcsQ0FBSCxLQUFELEVBQUE7Q0FkRCxFQWFnQjs7Q0FiaEI7O0NBRkQifX0seyJvZmZzZXQiOnsibGluZSI6NjMwNiwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2NvbXBvbmVudHMvaG92ZXJfdHJpZ2dlci5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiIyMjXG5BZGRzIHRoZSBjbGFzcyAnaG92ZXJlZCcgdG8gdGhlIGVsZW1lbnQgYW5kIHRvIHRoZSB0YXJnZXRcblRoZSBjbGFzcyBpcyB0b2dnbGVkIG9uIG1vdXNlb3Zlci9tb3VzZWxlYXZlIGZvciBkZXNrdG9wc1xuYW5kIG9uIGNsaWNrIGZvciB0b3VjaCBkZXZpY2VzXG4jIyNcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBIb3ZlclRyaWdnZXJcblx0b3BlbmVkOiBmYWxzZVxuXHRrbGFzczogXCJob3ZlcmVkXCJcblxuXHRjb25zdHJ1Y3RvcjogKCBAZG9tICkgLT5cblx0XHRAdGFyZ2V0ID0gJCBAZG9tLmRhdGEgJ3RhcmdldCdcblxuXHRcdGlmIEB0YXJnZXQubGVuZ3RoIDw9IDBcblx0XHRcdGxvZyBcIltIb3ZlclRyaWdnZXJdIGVycm9yLiB0YXJnZXQgbm90IGZvdW5kXCIsIEBkb20uZGF0YSggJ3RhcmdldCcgKVxuXHRcdFx0cmV0dXJuXG5cblx0XHRAZG9tLmFkZENsYXNzIFwiaG92ZXJfZHJvcGRvd25fdHJpZ2dlclwiXG5cdFx0QHNldF9saXN0ZW5lcnMoKVxuXG5cdFx0YXBwLm9uIFwiZHJvcGRvd246b3BlbmVkXCIsIEBvbl9kcm9wZG93bl9vcGVuZWRcblx0XHRhcHAub24gXCJkcm9wZG93bjpjbG9zZWRcIiwgQG9uX2Ryb3Bkb3duX2Nsb3NlZFxuXG5cdHNldF9saXN0ZW5lcnM6ICggKSAtPlxuXG5cdFx0aWYgYXBwLnNldHRpbmdzLnRvdWNoX2RldmljZVxuXHRcdFx0QGRvbS5vbiAnY2xpY2snLCBAdG9nZ2xlXG5cdFx0ZWxzZVxuXHRcdFx0QGRvbS5vbiAnbW91c2VvdmVyJywgQG9wZW5cblx0XHRcdEB0YXJnZXQub24gJ21vdXNlbGVhdmUnLCBAY2xvc2VcblxuXHRcdGFwcC53aW5kb3cub24gXCJib2R5OmNsaWNrZWRcIiwgQGNsb3NlXG5cblx0dG9nZ2xlOiAoIGUgKSA9PlxuXHRcdGlmIEBvcGVuZWRcblx0XHRcdGRvIEBjbG9zZVxuXHRcdGVsc2Vcblx0XHRcdGRvIEBvcGVuXG5cblx0XHRlLnN0b3BQcm9wYWdhdGlvbigpXG5cblxuXG5cdG9wZW46ICggKSA9PlxuXHRcdHJldHVybiBpZiBAb3BlbmVkXG5cdFx0QG9wZW5lZCA9IHRydWVcblxuXHRcdEBkb20uYWRkQ2xhc3MgQGtsYXNzXG5cdFx0QHRhcmdldC5hZGRDbGFzcyBAa2xhc3NcblxuXHRcdGFwcC5lbWl0IFwiZHJvcGRvd246b3BlbmVkXCIsIEB1aWRcblxuXHRjbG9zZTogKCApID0+XG5cdFx0cmV0dXJuIGlmIG5vdCBAb3BlbmVkXG5cdFx0QG9wZW5lZCA9IGZhbHNlXG5cblx0XHRAZG9tLnJlbW92ZUNsYXNzIEBrbGFzc1xuXHRcdEB0YXJnZXQucmVtb3ZlQ2xhc3MgQGtsYXNzXG5cblx0XHRhcHAuZW1pdCBcImRyb3Bkb3duOmNsb3NlZFwiLCBAdWlkXG5cblx0b25fZHJvcGRvd25fb3BlbmVkOiAoIGRhdGEgKSA9PlxuXHRcdEBjbG9zZSgpIGlmIGRhdGEgaXNudCBAdWlkXG5cblx0b25fZHJvcGRvd25fY2xvc2VkOiAoIGRhdGEgKSA9PlxuXG5cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Q0FBQTtDQUFBLEdBQUEsUUFBQTtHQUFBLCtFQUFBOztBQU1BLENBTkEsRUFNdUIsR0FBakIsQ0FBTjtDQUNDLEVBQVEsRUFBUixDQUFBOztDQUFBLEVBQ08sRUFBUCxJQURBOztDQUdhLENBQUEsQ0FBQSxtQkFBRztDQUNmLEVBRGUsQ0FBRDtDQUNkLDhEQUFBO0NBQUEsOERBQUE7Q0FBQSxvQ0FBQTtDQUFBLGtDQUFBO0NBQUEsc0NBQUE7Q0FBQSxFQUFVLENBQVYsRUFBQSxFQUFZO0NBRVosR0FBQSxFQUFVO0NBQ1QsQ0FBOEMsQ0FBOUMsQ0FBK0MsRUFBL0MsRUFBOEMsZ0NBQTlDO0NBQ0EsV0FBQTtNQUpEO0NBQUEsRUFNSSxDQUFKLElBQUEsZ0JBQUE7Q0FOQSxHQU9BLFNBQUE7Q0FQQSxDQVNBLENBQUcsQ0FBSCxhQUFBLENBQUE7Q0FUQSxDQVVBLENBQUcsQ0FBSCxhQUFBLENBQUE7Q0FkRCxFQUdhOztDQUhiLEVBZ0JlLE1BQUEsSUFBZjtDQUVDLEVBQU0sQ0FBTixJQUFlLElBQWY7Q0FDQyxDQUFBLENBQUksQ0FBSCxFQUFELENBQUE7TUFERDtDQUdDLENBQUEsQ0FBSSxDQUFILEVBQUQsS0FBQTtDQUFBLENBQ0EsRUFBQyxDQUFELENBQUEsTUFBQTtNQUpEO0NBTUksQ0FBSixDQUFHLENBQTRCLENBQS9CLENBQVUsS0FBVixHQUFBO0NBeEJELEVBZ0JlOztDQWhCZixFQTBCUSxHQUFSLEdBQVU7Q0FDVCxHQUFBLEVBQUE7Q0FDQyxHQUFJLENBQUosQ0FBRztNQURKO0NBR0MsR0FBSSxFQUFEO01BSEo7Q0FLQyxVQUFELElBQUE7Q0FoQ0QsRUEwQlE7O0NBMUJSLEVBb0NNLENBQU4sS0FBTTtDQUNMLEdBQUEsRUFBQTtDQUFBLFdBQUE7TUFBQTtDQUFBLEVBQ1UsQ0FBVixFQUFBO0NBREEsRUFHSSxDQUFKLENBQUEsR0FBQTtDQUhBLEdBSUEsQ0FBQSxDQUFPLEVBQVA7Q0FFSSxDQUF3QixDQUF6QixDQUFILE9BQUEsTUFBQTtDQTNDRCxFQW9DTTs7Q0FwQ04sRUE2Q08sRUFBUCxJQUFPO0FBQ1EsQ0FBZCxHQUFBLEVBQUE7Q0FBQSxXQUFBO01BQUE7Q0FBQSxFQUNVLENBQVYsQ0FEQSxDQUNBO0NBREEsRUFHSSxDQUFKLENBQUEsTUFBQTtDQUhBLEdBSUEsQ0FBQSxDQUFPLEtBQVA7Q0FFSSxDQUF3QixDQUF6QixDQUFILE9BQUEsTUFBQTtDQXBERCxFQTZDTzs7Q0E3Q1AsRUFzRG9CLENBQUEsS0FBRSxTQUF0QjtDQUNDLEVBQUEsQ0FBQSxDQUFzQjtDQUFyQixHQUFBLENBQUQsUUFBQTtNQURtQjtDQXREcEIsRUFzRG9COztDQXREcEIsRUF5RG9CLENBQUEsS0FBRSxTQUF0Qjs7Q0F6REE7O0NBUEQifX0seyJvZmZzZXQiOnsibGluZSI6NjM5MSwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2NvbXBvbmVudHMvaW1hZ2VfdXBsb2FkZXIuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbInJlcXVpcmUgJ2hhcHBlbnMnXG5DbG91ZGluYXJ5ID0gcmVxdWlyZSAnYXBwL2NvbnRyb2xsZXJzL2Nsb3VkaW5hcnknXG5cbiMjI1xuVW5zaWduZWQgdXBsb2FkIHRvIENsb3VkaW5hcnlcbmh0dHA6Ly9jbG91ZGluYXJ5LmNvbS9ibG9nL2RpcmVjdF91cGxvYWRfbWFkZV9lYXN5X2Zyb21fYnJvd3Nlcl9vcl9tb2JpbGVfYXBwX3RvX3RoZV9jbG91ZFxuIyMjXG5cblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBJbWFnZVVwbG9hZGVyIFxuXHRjb25zdHJ1Y3RvcjogKGRvbSkgLT5cblx0XHRoYXBwZW5zIEBcblx0XHRcblx0XHQjIEdldCB0aGUgY29uZmlnIHZhbHVlcyBmcm9tIHRoZSBoaWRkZW4gZmlsZXNcblx0XHRhcGlfa2V5ICAgICA9IGRvbS5maW5kKCAnLmFwaV9rZXknICkudmFsKClcblx0XHRjbG91ZF9uYW1lICA9IGRvbS5maW5kKCAnLmNsb3VkX25hbWUnICkudmFsKClcblx0XHR1bnNpZ25lZF9pZCA9IGRvbS5maW5kKCAnLnVuc2lnbmVkX2lkJyApLnZhbCgpXG5cblx0XHQjIFNldCB0aGUgY29uZmlnIG9uIHRoZSBjb250cm9sbGVyXG5cdFx0Q2xvdWRpbmFyeS5zZXRfY29uZmlnXG5cdFx0XHRjbG91ZF9uYW1lICA6IGNsb3VkX25hbWVcblx0XHRcdGFwaV9rZXkgICAgIDogYXBpX2tleVxuXHRcblxuXHRcdHByb2dyZXNzID0gZG9tLmZpbmQgJy5wcm9ncmVzcydcblxuXHRcdHJlZiA9IEBcblxuXG5cdFx0IyMjXG5cdFx0RGlzYWJsZSBkcmFnIGFuZCBkcm9wIGZlYXR1cmUgYmVjYXVzZSBvZiBhIGNsb3VkaW5hcnkgYnVnOlxuXHRcdHdoZW4gdHdvIGlucHV0IGZpbGVzIGFyZSBvbiB0aGUgc2FtZSBwYWdlLCB3aGVuIHlvdSBkcmFnIGFuIGltYWdlIG9uIG9uZSBpbnB1dCBmaWxlLCBcblx0XHRib3RoIGlucHV0cyB3aWxsIHVwbG9hZCB0aGUgc2FtZSBpbWFnZSBhdCB0aGUgc2FtZSB0aW1lLlxuXHRcdCMjI1xuXHRcdGtpbGwgPSAoZSkgLT4gXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KClcblx0XHRcdGUuc3RvcFByb3BhZ2F0aW9uKClcblxuXG5cdFx0ZG9tLm9uXG5cdFx0XHRkcmFnb3Zlcjoga2lsbFxuXHRcdFx0ZHJvcDoga2lsbFxuXHRcdFx0ZHJhZ2VudGVyOiBraWxsXG5cdFx0XHRkcmFnbGVhdmU6IGtpbGxcblxuXHRcdFx0XG5cblxuXHRcdG9uX3VwbG9hZF9zdGFydCA9IChlLCBkYXRhKSAtPlxuXHRcdFx0XHRcdFxuXHRcdFx0bG9nIFwiW0Nsb3VkaW5hcnldIG9uX3VwbG9hZF9zdGFydFwiLCBlLCBkYXRhXG5cblx0XHRcdHByb2dyZXNzLnJlbW92ZUNsYXNzICdoaWRlJ1xuXG5cdFx0XHRyZWYuZW1pdCAnc3RhcnRlZCcsIGRhdGFcblxuXHRcdFxuXHRcdG9uX3VwbG9hZF9wcm9ncmVzcyA9IChlLCBkYXRhKSAtPlxuXHRcdFx0cGVyY2VudCA9IGRhdGEubG9hZGVkIC8gZGF0YS50b3RhbCAqIDEwMFxuXHRcdFx0bG9nIFwiW0Nsb3VkaW5hcnldIG9uX3VwbG9hZF9wcm9ncmVzc1wiLCBwZXJjZW50ICsgXCIlXCJcblxuXHRcdFx0cHJvZ3Jlc3MuY3NzIFwid2lkdGhcIiwgXCIje3BlcmNlbnR9JVwiXG5cblx0XHRcdHJlZi5lbWl0ICdwcm9ncmVzcycsIHByb2dyZXNzXG5cblxuXHRcdG9uX3VwbG9hZF9jb21wbGV0ZSA9IChlLCBkYXRhKSAtPiBcblx0XHRcdGxvZyBcIltJbWFnZVVwbG9hZGVyXSBvbl91cGxvYWRfY29tcGxldGVcIiwgZSwgZGF0YVxuXHRcdFx0XG5cdFx0XHRwcm9ncmVzcy5hZGRDbGFzcyAnaGlkZSdcblxuXHRcdFx0cmVmLmVtaXQgJ2NvbXBsZXRlZCcsIGRhdGFcblxuXG5cdFx0b25fdXBsb2FkX2ZhaWwgPSAoZSwgZGF0YSkgLT5cblx0XHRcdGxvZyBcIltDbG91ZGluYXJ5XSBvbl91cGxvYWRfZmFpbFwiLCBlXG5cblx0XHRcdHJlZi5lbWl0ICdlcnJvcicsIGVcblxuXG5cblx0XHRpc19vd25fZXZlbnQgPSAoZSkgLT5cblx0XHRcdHJldHVybiBlLmN1cnJlbnRUYXJnZXRcblxuXG5cdFx0IyBJbml0aWFsaXNlIHRoZSBmb3JtIHdpdGggY2xvdWRpbmFyeVxuXHRcdGZvcm0gPSBkb20uZmluZCggJ2Zvcm0nIClcblx0XHRmb3JtLmFwcGVuZCggJC5jbG91ZGluYXJ5LnVuc2lnbmVkX3VwbG9hZF90YWcoIHVuc2lnbmVkX2lkLCB7XG5cdFx0XHRjbG91ZF9uYW1lOiBjbG91ZF9uYW1lXG5cdFx0fSwge1xuXHRcdFx0Y2xvdWRpbmFyeV9maWVsZDogdW5zaWduZWRfaWRcblx0XHR9KS5vbiggJ2Nsb3VkaW5hcnlkb25lJywgb25fdXBsb2FkX2NvbXBsZXRlIClcblx0XHQgLm9uKCAnZmlsZXVwbG9hZHN0YXJ0Jywgb25fdXBsb2FkX3N0YXJ0IClcblx0XHQgLm9uKCAnZmlsZXVwbG9hZHByb2dyZXNzJywgb25fdXBsb2FkX3Byb2dyZXNzIClcblx0XHQgLm9uKCAnZmlsZXVwbG9hZGZhaWwnLCBvbl91cGxvYWRfZmFpbCApXG5cdFx0KVxuXHRcdFx0IyBMaXN0ZW4gdG8gZXZlbnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEscUJBQUE7O0FBQUEsQ0FBQSxNQUFBLEVBQUE7O0FBQ0EsQ0FEQSxFQUNhLElBQUEsR0FBYixrQkFBYTs7Q0FFYjs7OztDQUhBOztBQVNBLENBVEEsRUFTdUIsR0FBakIsQ0FBTjtDQUNjLENBQUEsQ0FBQSxvQkFBQztDQUNiLE9BQUEsMElBQUE7Q0FBQSxHQUFBLEdBQUE7Q0FBQSxFQUdjLENBQWQsR0FBQSxHQUFjO0NBSGQsRUFJYyxDQUFkLE1BQUEsR0FBYztDQUpkLEVBS2MsQ0FBZCxPQUFBLEdBQWM7Q0FMZCxHQVFBLE1BQVU7Q0FDVCxDQUFjLElBQWQsSUFBQTtDQUFBLENBQ2MsSUFBZCxDQUFBO0NBVkQsS0FRQTtDQVJBLEVBYVcsQ0FBWCxJQUFBLEdBQVc7Q0FiWCxFQWVBLENBQUE7Q0FHQTs7Ozs7Q0FsQkE7Q0FBQSxFQXVCTyxDQUFQLEtBQVE7Q0FDUCxLQUFBLFFBQUE7Q0FDQyxZQUFELEVBQUE7Q0F6QkQsSUF1Qk87Q0F2QlAsQ0E0QkEsQ0FBRyxDQUFIO0NBQ0MsQ0FBVSxFQUFWLEVBQUEsRUFBQTtDQUFBLENBQ00sRUFBTixFQUFBO0NBREEsQ0FFVyxFQUZYLEVBRUEsR0FBQTtDQUZBLENBR1csRUFIWCxFQUdBLEdBQUE7Q0FoQ0QsS0E0QkE7Q0E1QkEsQ0FxQ3NCLENBQUosQ0FBbEIsS0FBbUIsTUFBbkI7Q0FFQyxDQUFvQyxDQUFwQyxDQUFBLEVBQUEsd0JBQUE7Q0FBQSxLQUVBLEVBQVEsR0FBUjtDQUVJLENBQWdCLENBQWpCLENBQUgsS0FBQSxJQUFBO0NBM0NELElBcUNrQjtDQXJDbEIsQ0E4Q3lCLENBQUosQ0FBckIsS0FBc0IsU0FBdEI7Q0FDQyxNQUFBLEdBQUE7Q0FBQSxFQUFVLENBQUksQ0FBSixDQUFWLENBQUE7Q0FBQSxDQUN1QyxDQUF2QyxHQUFBLENBQXVDLDBCQUF2QztDQURBLENBR3NCLENBQXRCLEdBQUEsQ0FBQSxDQUFRO0NBRUosQ0FBaUIsQ0FBbEIsQ0FBSCxJQUFBLEVBQUEsR0FBQTtDQXBERCxJQThDcUI7Q0E5Q3JCLENBdUR5QixDQUFKLENBQXJCLEtBQXNCLFNBQXRCO0NBQ0MsQ0FBMEMsQ0FBMUMsQ0FBQSxFQUFBLDhCQUFBO0NBQUEsS0FFQSxFQUFRO0NBRUosQ0FBa0IsQ0FBbkIsQ0FBSCxPQUFBLEVBQUE7Q0E1REQsSUF1RHFCO0NBdkRyQixDQStEcUIsQ0FBSixDQUFqQixLQUFrQixLQUFsQjtDQUNDLENBQW1DLENBQW5DLEdBQUEsdUJBQUE7Q0FFSSxDQUFjLENBQWYsQ0FBSCxHQUFBLE1BQUE7Q0FsRUQsSUErRGlCO0NBL0RqQixFQXNFZSxDQUFmLEtBQWdCLEdBQWhCO0NBQ0MsWUFBTztDQXZFUixJQXNFZTtDQXRFZixFQTJFTyxDQUFQLEVBQU87Q0EzRVAsQ0E0RTRELEVBQTVELEVBQUEsSUFBeUIsQ0FBWixRQUFBO0NBQStDLENBQy9DLElBQVosSUFBQTtFQUNFLElBRlU7Q0FFVixDQUNnQixJQUFsQixLQURFLEtBQ0Y7Q0FDQyxDQUpXLElBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUE7Q0E3RWQsRUFBYTs7Q0FBYjs7Q0FWRCJ9fSx7Im9mZnNldCI6eyJsaW5lIjo2NDcwLCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvY29tcG9uZW50cy9pbnB1dF9kZXZpY2VzLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJhcHBjYXN0ICA9IHJlcXVpcmUgJ2FwcC9jb250cm9sbGVycy9hcHBjYXN0J1xuaGFwcGVucyA9IHJlcXVpcmUgJ2hhcHBlbnMnXG5cbm1vZHVsZS5leHBvcnRzID0gKCBkb20gKSAtPlxuXG4gIGhhcHBlbnMgQFxuXG4gIGRvbS5vbiAnY2hhbmdlJywgLT5cblxuICAgIGFwcGNhc3Quc2V0ICdpbnB1dF9kZXZpY2UnLCBkb20udmFsKClcblxuICBhcHBjYXN0Lm9uICdpbnB1dF9kZXZpY2VzJywgKCBkZXZpY2VzICkgLT5cblxuICAgICMgY2xlYXIgb3B0aW9uc1xuICAgICMgVE9ETzoga2VlcCB0aGUgY2hvb3NlbiBvcHRpb24gc2VsZWN0ZWRcbiAgICAjIFRPRE86IGxldCB0aGUgdXNlciBrbm93IGlmIHByZXZpb3VseSBzZWxlY3RlZCBpc24ndCBhdmFpbGFibGUgYW55bW9yZVxuICAgIGRvbS5odG1sIFwiIFwiXG4gICAgZm9yIGRldmljZSBpbiBkZXZpY2VzXG4gICAgICBkb20uYXBwZW5kIFwiPG9wdGlvbiB2YWx1ZT0nI3tkZXZpY2V9Jz4je2RldmljZX08L29wdGlvbj5cIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFlBQUE7O0FBQUEsQ0FBQSxFQUFXLElBQVgsa0JBQVc7O0FBQ1gsQ0FEQSxFQUNVLElBQVYsRUFBVTs7QUFFVixDQUhBLEVBR2lCLEdBQVgsQ0FBTixFQUFtQjtDQUVqQixDQUFBLEVBQUEsR0FBQTtDQUFBLENBRUEsQ0FBRyxLQUFILENBQWlCO0NBRVAsQ0FBb0IsQ0FBNUIsSUFBTyxJQUFQLEdBQUE7Q0FGRixFQUFpQjtDQUlULENBQVIsQ0FBNEIsSUFBckIsRUFBUCxNQUFBO0NBS0UsT0FBQSxrQkFBQTtDQUFBLEVBQUcsQ0FBSDtBQUNBLENBQUE7VUFBQSxvQ0FBQTs0QkFBQTtDQUNFLEVBQUcsQ0FBUyxFQUFaLEtBQUEsTUFBWTtDQURkO3FCQU4wQjtDQUE1QixFQUE0QjtDQVJiIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjY0OTUsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9jb21wb25lbnRzL2xvZ291dF9saW5rLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJ1c2VyX2NvbnRyb2xsZXIgPSByZXF1aXJlICdhcHAvY29udHJvbGxlcnMvdXNlcidcblxubW9kdWxlLmV4cG9ydHMgPSAoIGRvbSApIC0+XG5cblx0ZG9tLm9uICdjbGljaycsICggZSApIC0+XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0ZS5zdG9wUHJvcGFnYXRpb24oKVxuXG5cdFx0dXNlcl9jb250cm9sbGVyLmxvZ291dCAoIGVycm9yICkgLT5cblxuICAgICAgaWYgZXJyb3IgdGhlbiBjb25zb2xlLmVycm9yIGVycm9yXG4gICAgICBcblx0XHRcdGxvZyBcIltMb2dvdXRMaW5rXSBsb2dvdXQgc3VjY2VkZWVkLlwiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsV0FBQTs7QUFBQSxDQUFBLEVBQWtCLElBQUEsUUFBbEIsT0FBa0I7O0FBRWxCLENBRkEsRUFFaUIsR0FBWCxDQUFOLEVBQW1CO0NBRWQsQ0FBSixDQUFHLElBQUgsRUFBQTtDQUNDLEdBQUEsVUFBQTtDQUFBLEdBQ0EsV0FBQTtDQURBLEVBR3VCLENBQXZCLENBQXVCLENBQXZCLEdBQXlCLE1BQVY7Q0FFWCxHQUFHLENBQUgsQ0FBQTtDQUFzQixJQUFSLEVBQU8sUUFBUDtRQUZLO0NBQXZCLElBQXVCO0NBSWxCLEVBQUosUUFBQSxxQkFBQTtDQVJGLEVBQWdCO0NBRkEifX0seyJvZmZzZXQiOnsibGluZSI6NjUxNCwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2NvbXBvbmVudHMvbW9kYWwuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gY2xhc3MgTW9kYWxcblx0b3BlbmVkOiBmYWxzZVxuXHRjb25zdHJ1Y3RvcjogKCBAZG9tICkgLT5cblx0XHRAb3ZlcmxheSA9ICQgJy5tZF9vdmVybGF5J1xuXG5cblx0b3BlbjogKCApIC0+XG5cdFx0cmV0dXJuIGlmIEBvcGVuZWRcblx0XHRAb3BlbmVkID0gdHJ1ZVxuXG5cdFx0QGRvbS5hZGRDbGFzcyAnbWRfc2hvdydcblxuXHRcdEBvdmVybGF5Lm9mZiggJ2NsaWNrJyApLm9uKCAnY2xpY2snLCBAY2xvc2UgKVxuXG5cdGNsb3NlOiAoICkgPT5cblx0XHRyZXR1cm4gaWYgbm90IEBvcGVuZWRcblx0XHRAb3BlbmVkID0gZmFsc2VcblxuXHRcdEBkb20ucmVtb3ZlQ2xhc3MgJ21kX3Nob3cnXHRcdCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLENBQUE7R0FBQSwrRUFBQTs7QUFBQSxDQUFBLEVBQXVCLEdBQWpCLENBQU47Q0FDQyxFQUFRLEVBQVIsQ0FBQTs7Q0FDYSxDQUFBLENBQUEsWUFBRztDQUNmLEVBRGUsQ0FBRDtDQUNkLG9DQUFBO0NBQUEsRUFBVyxDQUFYLEdBQUEsTUFBVztDQUZaLEVBQ2E7O0NBRGIsRUFLTSxDQUFOLEtBQU07Q0FDTCxHQUFBLEVBQUE7Q0FBQSxXQUFBO01BQUE7Q0FBQSxFQUNVLENBQVYsRUFBQTtDQURBLEVBR0ksQ0FBSixJQUFBLENBQUE7Q0FFQyxDQUFELENBQUEsQ0FBQyxDQUFELEVBQVEsSUFBUjtDQVhELEVBS007O0NBTE4sRUFhTyxFQUFQLElBQU87QUFDUSxDQUFkLEdBQUEsRUFBQTtDQUFBLFdBQUE7TUFBQTtDQUFBLEVBQ1UsQ0FBVixDQURBLENBQ0E7Q0FFQyxFQUFHLENBQUgsS0FBRCxFQUFBO0NBakJELEVBYU87O0NBYlA7O0NBREQifX0seyJvZmZzZXQiOnsibGluZSI6NjU0OSwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2NvbXBvbmVudHMvbW9kYWxfaGFuZGxlci5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBNb2RhbEhhbmRsZXJcblx0Y29uc3RydWN0b3I6ICggQGRvbSApIC0+XG5cdFx0dmlldy5vbmNlICdiaW5kZWQnLCBAb25fcmVhZHlcblxuXHRvbl9yZWFkeTogKCApID0+XG5cdFx0bW9kYWxfdGFyZ2V0ID0gdmlldy5nZXRfYnlfZG9tIEBkb20uZGF0YSggJ21vZGFsJyApXG5cdFx0QGRvbS5vbiAnY2xpY2snLCAtPiBtb2RhbF90YXJnZXQub3BlbigpIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsUUFBQTtHQUFBLCtFQUFBOztBQUFBLENBQUEsRUFBdUIsR0FBakIsQ0FBTjtDQUNjLENBQUEsQ0FBQSxtQkFBRztDQUNmLEVBRGUsQ0FBRDtDQUNkLDBDQUFBO0NBQUEsQ0FBb0IsRUFBcEIsSUFBQTtDQURELEVBQWE7O0NBQWIsRUFHVSxLQUFWLENBQVU7Q0FDVCxPQUFBLElBQUE7Q0FBQSxFQUFlLENBQWYsR0FBK0IsR0FBaEIsRUFBZjtDQUNDLENBQUQsQ0FBSSxDQUFILEdBQUQsRUFBaUIsRUFBakI7Q0FBaUMsR0FBYixRQUFZLENBQVo7Q0FBcEIsSUFBaUI7Q0FMbEIsRUFHVTs7Q0FIVjs7Q0FERCJ9fSx7Im9mZnNldCI6eyJsaW5lIjo2NTczLCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvY29tcG9uZW50cy9wbGF5ZXIuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbImFwcGNhc3QgID0gcmVxdWlyZSAnYXBwL2NvbnRyb2xsZXJzL2FwcGNhc3QnXG5cbm1vZHVsZS5leHBvcnRzID0gKCBkb20gKSAtPlxuXG4gICMgc2hvcnRjdXQgdG8gZG9tIHRhZ3NcbiAgYXVkaW8gPSBkb20uZmluZCAnYXVkaW8nXG4gIHZ1ICAgID0gZG9tLmZpbmQgJy52dSdcbiAgXG4gICMgZ3JhYnMgc3RyZWFtIHVybCBmcm9tIERPTSBhdHRyaWJ1dGVcbiAgc3RyZWFtID0gYXVkaW8uZGF0YSAnc3JjJ1xuXG4gICMgaGlkZSBpdGVtcyB3aGVuIGluaXRpYWxpemluZ1xuICBhdWRpby5oaWRlKClcblxuICBhcHBjYXN0Lm9uICdjb25uZWN0ZWQnLCAoIHN0YXR1cyApIC0+XG5cbiAgICBpZiBzdGF0dXNcbiAgICAgIGRvbS5maW5kKCAnLnN0YXR1cycgKS5odG1sICcuLi4gd2FpdGluZyBzdHJlYW0gdG8gc3RhcnQgLi4uJ1xuICAgIGVsc2VcbiAgICAgIGRvbS5maW5kKCAnLnN0YXR1cycgKS5odG1sICcuLi4gd2FpdGluZyBBcHBDYXN0IHRvIHN0YXJ0IC4uLidcblxuICBhcHBjYXN0Lm9uIFwic3RyZWFtOmVycm9yXCIsICggZXJyb3IgKSAtPlxuICAgIGlmIG5vdCBlcnJvciB0aGVuIHJldHVyblxuXG4gICAgZG9tLmZpbmQoICcuc3RhdHVzJyApLmh0bWwgXCIuLi4gI3tlcnJvcn0gLi4uXCJcblxuICAjIHRlbXBvcmFyeSBzb2x1dGlvbiB3aGlsZSB3ZSBkb24ndCBoYXZlIGFwcGNhc3RzIHRvIHRoZSB3ZWJzZXJ2ZXJcbiAgIyBjaGVjayBzdHJlYW0gc3RhdHVzIGFuZCByZXRyaWVzIDEwMG1zIGFmdGVyIHJlc3BvbnNlXG4gIGNoZWNrX3N0cmVhbSA9IC0+XG5cbiAgICAkLmdldCBzdHJlYW0sICggZXJyb3IsIHJlc3BvbnNlICkgLT5cblxuICAgICAgaWYgZXJyb3JcblxuICAgICAgICAjIHRyeSBhZ2FpblxuICAgICAgICBkZWxheSAxMDAsIGNoZWNrX3N0cmVhbVxuXG4gICAgICAgIHJldHVybiBjb25zb2xlLmVycm9yICctIGVycm9yIGxvYWRpbmcgc3RyZWFtaW5nJ1xuXG4gICAgICBjb25zb2xlLndhcm4gJysgYWxsIGdvb2QhJ1xuXG4gICMgVE9ETzogU2V0IEFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbiBvbiBzdHJlYW1pbmcgc2VydmVyIHNvIGphdmFzY3JpcHRcbiAgIyB3aWxsIGJlIGFibGUgdG8gY2hlY2sgc3RyZWFtIHN0YXR1c1xuXG4gICMgZG8gY2hlY2tfc3RyZWFtXG5cblxuICAjIHJlbG9hZCBhdWRpbyB0YWdcbiAgc3RhcnRfYXVkaW8gPSAtPiBcbiAgICBhdWRpby5hdHRyICdzcmMnLCBhdWRpby5kYXRhICdzcmMnXG4gICAgYXVkaW8uc2hvdygpXG5cbiAgc3RvcF9hdWRpbyA9IC0+XG4gICAgYXVkaW8uc3RvcCgpXG4gICAgYXVkaW8uaGlkZSgpXG5cbiAgIyB0ZW1wb3JhcnkgaGFjayB0byBzdGFydCBhdWRpbyBvbmx5IGFmdGVyIHN0cmVhbSBzdGFydHNcbiAgYXBwY2FzdC5vbiAnc3RyZWFtOm9ubGluZScsICggc3RhdHVzICkgLT5cblxuICAgIGlmIHN0YXR1c1xuICAgICAgc3RhcnRfYXVkaW8oKVxuICAgIGVsc2VcbiAgICAgIHN0b3BfYXVkaW8oKVxuXG4gICMgY29uc29sZS53YXJuIFwibGlzdGVuaW5nIGZvciB2dVwiXG4gICMgdGVtcG9yYXJ5IGhhY2sgdG8gc3RhcnQgYXVkaW8gb25seSBhZnRlciBzdHJlYW0gc3RhcnRzXG4gIGFwcGNhc3Qub24gJ3N0cmVhbTp2dScsICggbWV0ZXIgKSAtPlxuXG4gICAgdnUuZmluZCggJy5tZXRlcl9sZWZ0JyApLndpZHRoIG1ldGVyWzBdICogMTAwMFxuICAgIHZ1LmZpbmQoICcubWV0ZXJfcmlnaHQnICkud2lkdGggbWV0ZXJbMV0gKiAxMDAwIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsR0FBQTs7QUFBQSxDQUFBLEVBQVcsSUFBWCxrQkFBVzs7QUFFWCxDQUZBLEVBRWlCLEdBQVgsQ0FBTixFQUFtQjtDQUdqQixLQUFBLGtEQUFBO0NBQUEsQ0FBQSxDQUFRLENBQUEsQ0FBUixFQUFRO0NBQVIsQ0FDQSxDQUFRLENBQUEsQ0FBQTtDQURSLENBSUEsQ0FBUyxDQUFBLENBQUssQ0FBZDtDQUpBLENBT0EsRUFBQSxDQUFLO0NBUEwsQ0FTQSxDQUF3QixHQUFBLENBQWpCLEVBQW1CLEVBQTFCO0NBRUUsR0FBQSxFQUFBO0NBQ00sRUFBRCxDQUFILEtBQUEsSUFBQSxvQkFBQTtNQURGO0NBR00sRUFBRCxDQUFILEtBQUEsSUFBQSxxQkFBQTtNQUxvQjtDQUF4QixFQUF3QjtDQVR4QixDQWdCQSxDQUEyQixFQUFBLEVBQXBCLEVBQXNCLEtBQTdCO0FBQ1MsQ0FBUCxHQUFBLENBQUE7Q0FBa0IsV0FBQTtNQUFsQjtDQUVJLEVBQUQsQ0FBSCxDQUE0QixDQUFBLEdBQTVCLEVBQUE7Q0FIRixFQUEyQjtDQWhCM0IsQ0F1QkEsQ0FBZSxNQUFBLEdBQWY7Q0FFRyxDQUFhLENBQWQsRUFBYyxDQUFkLEVBQWMsQ0FBRSxFQUFoQjtDQUVFLEdBQUcsQ0FBSCxDQUFBO0NBR0UsQ0FBVyxDQUFYLEVBQUEsR0FBQSxJQUFBO0NBRUEsSUFBTyxFQUFPLFFBQVAsWUFBQTtRQUxUO0NBT1EsR0FBUixHQUFPLE1BQVA7Q0FURixJQUFjO0NBekJoQixFQXVCZTtDQXZCZixDQTJDQSxDQUFjLE1BQUEsRUFBZDtDQUNFLENBQWtCLEVBQWxCLENBQUs7Q0FDQyxHQUFOLENBQUssTUFBTDtDQTdDRixFQTJDYztDQTNDZCxDQStDQSxDQUFhLE1BQUEsQ0FBYjtDQUNFLEdBQUEsQ0FBSztDQUNDLEdBQU4sQ0FBSyxNQUFMO0NBakRGLEVBK0NhO0NBL0NiLENBb0RBLENBQTRCLEdBQUEsQ0FBckIsRUFBdUIsTUFBOUI7Q0FFRSxHQUFBLEVBQUE7Q0FDRSxVQUFBLEVBQUE7TUFERjtDQUdFLFNBQUEsR0FBQTtNQUx3QjtDQUE1QixFQUE0QjtDQVNwQixDQUFSLENBQXdCLEVBQUEsRUFBakIsRUFBUCxFQUFBO0NBRUUsQ0FBRSxDQUF3QyxDQUExQyxDQUFBLFFBQUE7Q0FDRyxDQUFELENBQXlDLENBQTNDLENBQUEsTUFBQSxHQUFBO0NBSEYsRUFBd0I7Q0FoRVQifX0seyJvZmZzZXQiOnsibGluZSI6NjYyOCwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2NvbXBvbmVudHMvcG9wdXBfaGFuZGxlci5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBQb3B1cEhhbmRsZXJcblx0Y29uc3RydWN0b3I6ICggQGRvbSApIC0+XG5cdFx0QHVybCAgICAgPSBAZG9tLmRhdGEgJ3VybCdcblx0XHRAdGl0bGUgICA9IEBkb20uZGF0YSAndGl0bGUnXG5cdFx0QHcgICAgICAgPSBAZG9tLmRhdGEgJ3cnXG5cdFx0QGggICAgICAgPSBAZG9tLmRhdGEgJ2gnXG5cblx0XHRAZG9tLm9uICdjbGljaycsIEBvcGVuXG5cdFx0XG5cdG9wZW46ICggKSA9PlxuXHRcdGxlZnQgPSAoYXBwLndpbmRvdy53LzIpLShAdy8yKTtcblx0XHR0b3AgPSAoYXBwLndpbmRvdy5oLzIpLShAaC8yKTtcblxuXHRcdHBhcmFtcyA9ICd0b29sYmFyPW5vLCBsb2NhdGlvbj1ubywgZGlyZWN0b3JpZXM9bm8sIHN0YXR1cz1ubywgbWVudWJhcj1ubywgc2Nyb2xsYmFycz1ubywgcmVzaXphYmxlPW5vLCBjb3B5aGlzdG9yeT1ubywgd2lkdGg9JytAdysnLCBoZWlnaHQ9JytAaCsnLCB0b3A9Jyt0b3ArJywgbGVmdD0nK2xlZnRcblxuXHRcdGxvZyBcInBhcmFtc1wiLCBwYXJhbXNcblx0XHRsb2cgXCJ1cmxcIiwgQHVybFxuXHRcdGxvZyBcInRpdGxlXCIsIEB0aXRsZVxuXG5cdFx0cmV0dXJuIHdpbmRvdy5vcGVuKEB1cmwsIEB0aXRsZSwgcGFyYW1zKS5mb2N1cygpO1xuXG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxRQUFBO0dBQUEsK0VBQUE7O0FBQUEsQ0FBQSxFQUF1QixHQUFqQixDQUFOO0NBQ2MsQ0FBQSxDQUFBLG1CQUFHO0NBQ2YsRUFEZSxDQUFEO0NBQ2Qsa0NBQUE7Q0FBQSxFQUFBLENBQUEsQ0FBVztDQUFYLEVBQ1csQ0FBWCxDQUFBLEVBQVc7Q0FEWCxFQUVXLENBQVg7Q0FGQSxFQUdXLENBQVg7Q0FIQSxDQUtBLENBQUksQ0FBSixHQUFBO0NBTkQsRUFBYTs7Q0FBYixFQVFNLENBQU4sS0FBTTtDQUNMLE9BQUEsU0FBQTtDQUFBLEVBQU8sQ0FBUCxFQUFrQjtDQUFsQixFQUNBLENBQUEsRUFBaUI7Q0FEakIsRUFHUyxDQUFULEVBQUEsRUFBUyxDQUFBLEVBQUEsMEdBQUE7Q0FIVCxDQUtjLENBQWQsQ0FBQSxFQUFBLEVBQUE7Q0FMQSxDQU1XLENBQVgsQ0FBQSxDQUFBO0NBTkEsQ0FPYSxDQUFiLENBQUEsQ0FBQSxFQUFBO0NBRUEsQ0FBeUIsQ0FBbEIsQ0FBQSxDQUFBLENBQU0sS0FBTjtDQWxCUixFQVFNOztDQVJOOztDQUREIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjY2NTksImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9jb21wb25lbnRzL3Njcm9sbF9oYW5kbGVyLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFNjcm9sbEhhbmRsZXJcblx0Y29uc3RydWN0b3I6ICggQGRvbSApIC0+XG5cblx0XHR0YXJnZXQgPSAkIEBkb20uZGF0YSggJ3RhcmdldCcgKVxuXHRcdHJldHVybiBpZiB0YXJnZXQubGVuZ3RoIDw9IDBcblxuXHRcdEBkb20uYWRkQ2xhc3MgJ3Njcm9sbF9oYW5kbGVyJ1xuXHRcdFxuXHRcdEBkb20ub24gJ2NsaWNrJywgLT5cblx0XHRcdG1vdmVyLnNjcm9sbF90byB0YXJnZXQiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxTQUFBOztBQUFBLENBQUEsRUFBdUIsR0FBakIsQ0FBTjtDQUNjLENBQUEsQ0FBQSxvQkFBRztDQUVmLEtBQUEsRUFBQTtDQUFBLEVBRmUsQ0FBRDtDQUVkLEVBQVMsQ0FBVCxFQUFBLEVBQVc7Q0FDWCxHQUFBLEVBQWdCO0NBQWhCLFdBQUE7TUFEQTtDQUFBLEVBR0ksQ0FBSixJQUFBLFFBQUE7Q0FIQSxDQUtBLENBQUksQ0FBSixHQUFBLEVBQWlCO0NBQ1YsSUFBRCxDQUFMLEdBQUEsSUFBQTtDQURELElBQWlCO0NBUGxCLEVBQWE7O0NBQWI7O0NBREQifX0seyJvZmZzZXQiOnsibGluZSI6NjY4MSwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2NvbXBvbmVudHMvc3RyZWFtX2NvbnRyb2xzLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJ1c2VyX2NvbnRyb2xsZXIgPSByZXF1aXJlICdhcHAvY29udHJvbGxlcnMvdXNlcidcblxuIyBUT0RPOiBhbmltYXRpb24gZm9yIGNvbnRyb2xzIGluIGFuZCBvdXRcblxubW9kdWxlLmV4cG9ydHMgPSAoIGRvbSApIC0+XG5cbiAgIyB3YWl0cyBtb2RlbCBnZXQgdXNlciBuYW1lXG4gIHVzZXJfY29udHJvbGxlci5vbiAndXNlcjpsb2dnZWQnLCAoIHVzZXIgKSAtPlxuXG4gICAgY29uc29sZS5sb2cgJ3VzZXIgbG9nZ2VkIC0+JywgdXNlci51c2VybmFtZVxuXG4gICAgaWYgXCIvI3t1c2VyLnVzZXJuYW1lfVwiIGlzIHdheXMucGF0aG5hbWUoKVxuICAgICAgJCggJy5jb250cm9scycgKS5zaG93KClcblxuXG4gIHVzZXJfY29udHJvbGxlci5vbiAndXNlcjp1bmxvZ2dlZCcsIC0+XG4gICAgJCggJy5jb250cm9scycgKS5oaWRlKClcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFdBQUE7O0FBQUEsQ0FBQSxFQUFrQixJQUFBLFFBQWxCLE9BQWtCOztBQUlsQixDQUpBLEVBSWlCLEdBQVgsQ0FBTixFQUFtQjtDQUdqQixDQUFBLENBQWtDLENBQUEsS0FBRSxJQUFwQyxFQUFlO0NBRWIsQ0FBOEIsQ0FBOUIsQ0FBQSxHQUFPLENBQVAsUUFBQTtDQUVBLEVBQUksQ0FBSixDQUEwQixHQUF2QjtDQUNELEdBQUEsT0FBQSxFQUFBO01BTDhCO0NBQWxDLEVBQWtDO0NBUWxCLENBQWhCLENBQW9DLE1BQXBDLE1BQWU7Q0FDYixHQUFBLE9BQUE7Q0FERixFQUFvQztDQVhyQiJ9fSx7Im9mZnNldCI6eyJsaW5lIjo2Njk5LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvZXhwbG9yZS5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBFeHBsb3JlXG5cdGNvbnN0cnVjdG9yOiAoIEBkb20gKSAtPiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLEdBQUE7O0FBQUEsQ0FBQSxFQUF1QixHQUFqQixDQUFOO0NBQ2MsQ0FBQSxDQUFBLGNBQUc7Q0FBTyxFQUFQLENBQUQ7Q0FBZixFQUFhOztDQUFiOztDQUREIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjY3MTIsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9oZWFkZXIuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIm5hdmlnYXRpb24gICAgICA9IHJlcXVpcmUgJ2FwcC9jb250cm9sbGVycy9uYXZpZ2F0aW9uJ1xudXNlcl9jb250cm9sbGVyID0gcmVxdWlyZSAnYXBwL2NvbnRyb2xsZXJzL3VzZXInXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgSGVhZGVyXG5cblx0Y3VycmVudF9wYWdlOiBcIlwiXG5cdHVzZXJfbG9nZ2VkOiBmYWxzZVxuXG5cdGNvbnN0cnVjdG9yOiAoIEBkb20gKSAtPlxuXHRcdHVzZXJfY29udHJvbGxlci5vbiAndXNlcjpsb2dnZWQnLCBAb25fdXNlcl9sb2dnZWRcblx0XHR1c2VyX2NvbnRyb2xsZXIub24gJ3VzZXI6dW5sb2dnZWQnLCBAb25fdXNlcl91bmxvZ2dlZFxuXG5cdFx0bmF2aWdhdGlvbi5vbiAnYWZ0ZXJfcmVuZGVyJywgQGNoZWNrX21lbnVcblxuXHRjaGVja19tZW51OiA9PlxuXHRcdG9iaiA9ICQoICdbZGF0YS1tZW51XScgKVxuXHRcdGlmIG9iai5sZW5ndGggPiAwXG5cdFx0XHRwYWdlID0gb2JqLmRhdGEgJ21lbnUnXG5cdFx0XHRsb2cgXCJbSGVhZGVyXSBjaGVja19tZW51XCIsIHBhZ2Vcblx0XHRcdFxuXHRcdFx0aWYgQGN1cnJlbnRfcGFnZS5sZW5ndGggPiAwXG5cdFx0XHRcdEBkb20uZmluZCggXCIuI3tAY3VycmVudF9wYWdlfV9pdGVtXCIgKS5yZW1vdmVDbGFzcyBcInNlbGVjdGVkXCJcblx0XHRcdFx0YXBwLmJvZHkucmVtb3ZlQ2xhc3MgXCIje0BjdXJyZW50X3BhZ2V9X3BhZ2VcIlxuXG5cdFx0XHRAZG9tLmZpbmQoIFwiLiN7cGFnZX1faXRlbVwiICkuYWRkQ2xhc3MgXCJzZWxlY3RlZFwiXG5cdFx0XHRhcHAuYm9keS5hZGRDbGFzcyBcIiN7cGFnZX1fcGFnZVwiXG5cblx0XHRcdEBjdXJyZW50X3BhZ2UgPSBwYWdlXG5cblxuXHRvbl91c2VyX2xvZ2dlZDogKCBkYXRhICkgPT5cblxuXHRcdHJldHVybiBpZiBAdXNlcl9sb2dnZWRcblx0XHRAdXNlcl9sb2dnZWQgPSB0cnVlXG5cdFx0XG5cdFx0d3JhcHBlciA9IEBkb20uZmluZCggJy51c2VyX2xvZ2dlZCcgKVxuXHRcdHRtcGwgICAgPSByZXF1aXJlICd0ZW1wbGF0ZXMvc2hhcmVkL2hlYWRlcl91c2VyX2xvZ2dlZCdcblx0XHRodG1sICAgID0gdG1wbCBkYXRhXG5cblx0XHRsb2cgXCJbSGVhZGVyXSBvbl91c2VyX2xvZ2dlZFwiLCBkYXRhLCBodG1sXG5cblx0XHRsb2cgXCJ3cmFwcGVyXCIsIHdyYXBwZXIubGVuZ3RoLCB3cmFwcGVyXG5cblx0XHR3cmFwcGVyLmVtcHR5KCkuYXBwZW5kIGh0bWxcblxuXHRcdHZpZXcuYmluZCB3cmFwcGVyXG5cblxuXG5cdG9uX3VzZXJfdW5sb2dnZWQ6ICggZGF0YSApID0+XG5cdFx0cmV0dXJuIGlmIG5vdCBAdXNlcl9sb2dnZWRcblx0XHRAdXNlcl9sb2dnZWQgPSBmYWxzZVxuXHRcdGxvZyBcIltIZWFkZXJdIG9uX3VzZXJfdW5sb2dnZWRcIiwgZGF0YSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLCtCQUFBO0dBQUEsK0VBQUE7O0FBQUEsQ0FBQSxFQUFrQixJQUFBLEdBQWxCLGtCQUFrQjs7QUFDbEIsQ0FEQSxFQUNrQixJQUFBLFFBQWxCLE9BQWtCOztBQUVsQixDQUhBLEVBR3VCLEdBQWpCLENBQU47Q0FFQyxDQUFBLENBQWMsU0FBZDs7Q0FBQSxFQUNhLEVBRGIsTUFDQTs7Q0FFYSxDQUFBLENBQUEsYUFBRztDQUNmLEVBRGUsQ0FBRDtDQUNkLDBEQUFBO0NBQUEsc0RBQUE7Q0FBQSw4Q0FBQTtDQUFBLENBQUEsRUFBQSxTQUFBLENBQUEsQ0FBZTtDQUFmLENBQ0EsRUFBQSxXQUFlLENBQWY7Q0FEQSxDQUdBLEVBQUEsTUFBVSxJQUFWO0NBUEQsRUFHYTs7Q0FIYixFQVNZLE1BQUEsQ0FBWjtDQUNDLE9BQUEsQ0FBQTtDQUFBLEVBQUEsQ0FBQSxTQUFNO0NBQ04sRUFBTSxDQUFOLEVBQUc7Q0FDRixFQUFPLENBQVAsRUFBQTtDQUFBLENBQzJCLENBQTNCLENBQUEsRUFBQSxlQUFBO0NBRUEsRUFBMEIsQ0FBdkIsRUFBSCxNQUFnQjtDQUNmLEVBQUksQ0FBSCxHQUFELENBQUEsRUFBQSxDQUFBLENBQVk7Q0FBWixDQUNxQixDQUFsQixDQUFLLEdBQVIsQ0FBQSxHQUFBLENBQXFCO1FBTHRCO0NBQUEsRUFPSSxDQUFILEVBQUQsQ0FBQSxDQUFBLEVBQUE7Q0FQQSxDQVFrQixDQUFmLENBQUssRUFBUixDQUFBLENBQUE7Q0FFQyxFQUFlLENBQWYsUUFBRCxDQUFBO01BYlU7Q0FUWixFQVNZOztDQVRaLEVBeUJnQixDQUFBLEtBQUUsS0FBbEI7Q0FFQyxPQUFBLFdBQUE7Q0FBQSxHQUFBLE9BQUE7Q0FBQSxXQUFBO01BQUE7Q0FBQSxFQUNlLENBQWYsT0FBQTtDQURBLEVBR1UsQ0FBVixHQUFBLE9BQVU7Q0FIVixFQUlVLENBQVYsR0FBVSw4QkFBQTtDQUpWLEVBS1UsQ0FBVjtDQUxBLENBTytCLENBQS9CLENBQUEscUJBQUE7Q0FQQSxDQVNlLENBQWYsQ0FBQSxFQUFBLENBQXNCLEVBQXRCO0NBVEEsR0FXQSxDQUFBLENBQUEsQ0FBTztDQUVGLEdBQUQsR0FBSixJQUFBO0NBeENELEVBeUJnQjs7Q0F6QmhCLEVBNENrQixDQUFBLEtBQUUsT0FBcEI7QUFDZSxDQUFkLEdBQUEsT0FBQTtDQUFBLFdBQUE7TUFBQTtDQUFBLEVBQ2UsQ0FBZixDQURBLE1BQ0E7Q0FDSSxDQUE2QixDQUFqQyxDQUFBLE9BQUEsZ0JBQUE7Q0EvQ0QsRUE0Q2tCOztDQTVDbEI7O0NBTEQifX0seyJvZmZzZXQiOnsibGluZSI6Njc3OSwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2hvbWVwYWdlLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJwcmVsb2FkID0gcmVxdWlyZSAnYXBwL3V0aWxzL3ByZWxvYWQnXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgSG9tZXBhZ2Vcblx0Y29uc3RydWN0b3I6IChAZG9tKSAtPlxuXG5cdFx0ZWxlbWVudHMgPSBbXVxuXHRcdGltYWdlcyA9IFtdXG5cblx0XHRAZG9tLmZpbmQoICcucGFyYWxsYXgtY29udGFpbmVyJyApLmVhY2ggLT5cblx0XHRcdGVsZW1lbnRzLnB1c2ggJCggQCApXG5cdFx0XHRpbWFnZXMucHVzaCAkKCBAICkuZGF0YSggJ2ltYWdlLXBhcmFsbGF4JyApXG5cblx0XHRwcmVsb2FkIGltYWdlcywgKCBpbWFnZXNfbG9hZGVkICktPlxuXG5cdFx0XHRmb3IgZWwsIGkgaW4gZWxlbWVudHNcblx0XHRcdFx0ZWwucGFyYWxsYXhcblx0XHRcdFx0XHRpbWFnZVNyYyAgICAgOiBpbWFnZXNfbG9hZGVkWyBpIF0uc3JjXG5cdFx0XHRcdFx0YmxlZWQgICAgICAgIDogMTBcblx0XHRcdFx0XHRwYXJhbGxheCAgICAgOiAnc2Nyb2xsJ1xuXHRcdFx0XHRcdG5hdHVyYWxXaWR0aCA6IGltYWdlc19sb2FkZWRbIGkgXS53aWR0aFxuXHRcdFx0XHRcdG5hdHVyYWxoZWlnaHQ6IGltYWdlc19sb2FkZWRbIGkgXS5oZWlnaHRcblxuXHRcdFx0ZGVsYXkgMTAwLCA9PiBhcHAud2luZG93Lm9iai50cmlnZ2VyICdyZXNpemUnXG5cblxuXHRkZXN0cm95OiAoICkgLT5cblx0XHRwID0gJCggJy5wYXJhbGxheC1taXJyb3InIClcblx0XHRwLmFkZENsYXNzKCAnaGlkZScgKVxuXHRcdGRlbGF5IDMwMCwgLT4gcC5yZW1vdmUoKSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGFBQUE7O0FBQUEsQ0FBQSxFQUFVLElBQVYsWUFBVTs7QUFFVixDQUZBLEVBRXVCLEdBQWpCLENBQU47Q0FDYyxDQUFBLENBQUEsZUFBRTtDQUVkLE9BQUEsUUFBQTtDQUFBLEVBRmMsQ0FBRDtDQUViLENBQUEsQ0FBVyxDQUFYLElBQUE7Q0FBQSxDQUFBLENBQ1MsQ0FBVCxFQUFBO0NBREEsRUFHSSxDQUFKLEtBQXdDLFlBQXhDO0NBQ0MsR0FBQSxFQUFBLEVBQVE7Q0FDRCxHQUFQLEVBQU0sT0FBTixHQUFZO0NBRmIsSUFBd0M7Q0FIeEMsQ0FPZ0IsQ0FBQSxDQUFoQixFQUFBLENBQUEsRUFBa0IsSUFBRjtDQUVmLFNBQUEsS0FBQTtTQUFBLEdBQUE7QUFBQSxDQUFBLFVBQUEsNENBQUE7MEJBQUE7Q0FDQyxDQUFFLE1BQUY7Q0FDQyxDQUFlLENBQWYsS0FBQSxFQUFBLEdBQThCO0NBQTlCLENBQ2UsR0FBZixLQUFBO0NBREEsQ0FFZSxNQUFmLEVBQUE7Q0FGQSxDQUdlLEdBSGYsS0FHQSxFQUFBLENBQThCO0NBSDlCLENBSWUsSUFKZixJQUlBLEdBQUE7Q0FMRCxTQUFBO0NBREQsTUFBQTtDQVFNLENBQUssQ0FBWCxFQUFBLElBQVcsSUFBWDtDQUFrQixFQUFELEdBQU8sQ0FBVixDQUFBLE9BQUE7Q0FBZCxNQUFXO0NBVlosSUFBZ0I7Q0FUakIsRUFBYTs7Q0FBYixFQXNCUyxJQUFULEVBQVM7Q0FDUixPQUFBO0NBQUEsRUFBSSxDQUFKLGNBQUk7Q0FBSixHQUNBLEVBQUEsRUFBQTtDQUNNLENBQUssQ0FBWCxFQUFBLElBQVcsRUFBWDtDQUFlLEtBQUQsT0FBQTtDQUFkLElBQVc7Q0F6QlosRUFzQlM7O0NBdEJUOztDQUhEIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjY4MjcsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9sb2FkaW5nLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJuYXZpZ2F0aW9uICAgICAgICBcdD0gcmVxdWlyZSAnYXBwL2NvbnRyb2xsZXJzL25hdmlnYXRpb24nXG5PcGFjaXR5IFx0XHRcdD0gcmVxdWlyZSAnYXBwL3V0aWxzL29wYWNpdHknXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgTG9hZGluZ1xuXHRmaXJzdF90aW1lOiBvblxuXHRjb25zdHJ1Y3RvcjogKCBAZG9tICkgLT5cblx0XHRuYXZpZ2F0aW9uLm9uICdiZWZvcmVfZGVzdHJveScsID0+XG5cdFx0XHRhcHAuYm9keS5hZGRDbGFzcyggJ2xvYWRpbmcnICkucmVtb3ZlQ2xhc3MoICdsb2FkZWQnIClcblx0XHRcdE9wYWNpdHkuc2hvdyBAZG9tLCAxMDBcblxuXHRcdG5hdmlnYXRpb24ub24gJ2FmdGVyX3JlbmRlcicsID0+IFxuXHRcdFx0aWYgQGZpcnN0X3RpbWVcblx0XHRcdFx0YXBwLmJvZHkuYWRkQ2xhc3MgJ2ZpcnN0X2xvYWRlZCdcblx0XHRcdFx0QGZpcnN0X3RpbWUgPSBvZmZcblx0XHRcdGFwcC5ib2R5LnJlbW92ZUNsYXNzKCAnbG9hZGluZycgKS5hZGRDbGFzcyggJ2xvYWRlZCcgKVxuXHRcdFx0T3BhY2l0eS5oaWRlIEBkb20iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSx3QkFBQTs7QUFBQSxDQUFBLEVBQXFCLElBQUEsR0FBckIsa0JBQXFCOztBQUNyQixDQURBLEVBQ2EsSUFBYixZQUFhOztBQUViLENBSEEsRUFHdUIsR0FBakIsQ0FBTjtDQUNDLEVBQVksQ0FBWixNQUFBOztDQUNhLENBQUEsQ0FBQSxjQUFHO0NBQ2YsT0FBQSxJQUFBO0NBQUEsRUFEZSxDQUFEO0NBQ2QsQ0FBQSxDQUFnQyxDQUFoQyxLQUFnQyxDQUF0QixNQUFWO0NBQ0MsRUFBRyxDQUFLLEVBQVIsRUFBQSxDQUFBLEVBQUE7Q0FDUSxDQUFXLENBQW5CLENBQUEsQ0FBYyxFQUFQLE1BQVA7Q0FGRCxJQUFnQztDQUFoQyxDQUlBLENBQThCLENBQTlCLEtBQThCLENBQXBCLElBQVY7Q0FDQyxHQUFHLENBQUMsQ0FBSixJQUFBO0NBQ0MsRUFBRyxDQUFLLElBQVIsTUFBQTtDQUFBLEVBQ2MsRUFBYixHQUFELEVBQUE7UUFGRDtDQUFBLEVBR0csQ0FBSyxFQUFSLEVBQUEsQ0FBQSxFQUFBO0NBQ1EsRUFBUixDQUFBLENBQWMsRUFBUCxNQUFQO0NBTEQsSUFBOEI7Q0FOL0IsRUFDYTs7Q0FEYjs7Q0FKRCJ9fSx7Im9mZnNldCI6eyJsaW5lIjo2ODU5LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvbG9naW4uY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIk5hdmlnYXRpb24gPSByZXF1aXJlICdhcHAvY29udHJvbGxlcnMvbmF2aWdhdGlvbidcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBMb2dpblxuXHRjb25zdHJ1Y3RvcjogKCBAZG9tICkgLT5cblxuXHRcdHVubGVzcyB3aW5kb3cub3BlbmVyP1xuXHRcdFx0YXBwLmJvZHkucmVtb3ZlQ2xhc3MgXCJsb2dpbl9wYWdlXCJcblx0XHRcdE5hdmlnYXRpb24uZ28gJy8nXG5cdFx0XG5cdFx0QHVzZXJuYW1lID0gQGRvbS5maW5kKCAnLnVzZXJuYW1lJyApXG5cdFx0QHBhc3N3b3JkID0gQGRvbS5maW5kKCAnLnBhc3N3b3JkJyApXG5cblx0XHRAZG9tLmZpbmQoICcuZmFjZWJvb2snICkub24gJ2NsaWNrJywgQF9mYWNlYm9va19sb2dpblxuXHRcdEBkb20uZmluZCggJy5zb3VuZGNsb3VkJyApLm9uICdjbGljaycsIEBfc291bmRjbG91ZF9sb2dpblxuXHRcdEBkb20uZmluZCggJy5nb29nbGUnICkub24gJ2NsaWNrJywgQF9nb29nbGVfbG9naW5cblxuXHRcdFxuXHRcdCMgQGRvbS5maW5kKCAnLnNpZ25pbicgKS5vbiAnY2xpY2snLCBAX2N1c3RvbV9sb2dpblxuXG5cdFx0IyBAZG9tLmZpbmQoICdpbnB1dCcgKS5rZXlwcmVzcyAoZXZlbnQpID0+XG5cdFx0IyBcdGlmIGV2ZW50LndoaWNoIGlzIDEzXG5cdFx0IyBcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHQjIFx0XHRAX2N1c3RvbV9sb2dpbigpXG5cdFx0IyBcdFx0cmV0dXJuIGZhbHNlXG5cdFx0XHRcblxuXHRfZmFjZWJvb2tfbG9naW46ICggKSA9PlxuXHRcdGxvZyBcIltMb2dpbl0gX2ZhY2Vib29rX2xvZ2luXCJcblxuXHRfc291bmRjbG91ZF9sb2dpbjogKCApID0+XG5cdFx0bG9nIFwiW0xvZ2luXSBfc291bmRjbG91ZF9sb2dpblwiXG5cblx0X2dvb2dsZV9sb2dpbjogKCApID0+XG5cdFx0bG9nIFwiW0xvZ2luXSBfZ29vZ2xlX2xvZ2luXCJcblxuXHQjIF9jdXN0b21fbG9naW46ICggKSA9PlxuXHQjIFx0QGRvbS5yZW1vdmVDbGFzcyBcImVycm9yXCJcblx0IyBcdGlmIEB1c2VybmFtZS52YWwoKS5sZW5ndGggPD0gMCBvciBAcGFzc3dvcmQudmFsKCkubGVuZ3RoIDw9IDBcblx0IyBcdFx0bG9nIFwiW0xvZ2luXSBlcnJvclwiXG5cdCMgXHRcdEBkb20uYWRkQ2xhc3MgXCJlcnJvclwiXG5cdCMgXHRcdHJldHVybiBmYWxzZVxuXG5cdCMgXHRkYXRhOlxuXHQjIFx0XHR1c2VybmFtZTogQHVzZXJuYW1lLnZhbCgpXG5cdCMgXHRcdHBhc3N3b3JkOiBAcGFzc3dvcmQudmFsKClcblxuXHQjIFx0bG9nIFwiW0xvZ2luXSBzdWJtaXR0aW5nIGRhdGFcIiwgZGF0YVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsYUFBQTtHQUFBLCtFQUFBOztBQUFBLENBQUEsRUFBYSxJQUFBLEdBQWIsa0JBQWE7O0FBRWIsQ0FGQSxFQUV1QixHQUFqQixDQUFOO0NBQ2MsQ0FBQSxDQUFBLFlBQUc7Q0FFZixFQUZlLENBQUQ7Q0FFZCxvREFBQTtDQUFBLDREQUFBO0NBQUEsd0RBQUE7Q0FBQSxHQUFBLGlCQUFBO0NBQ0MsRUFBRyxDQUFLLEVBQVIsS0FBQSxDQUFBO0NBQUEsQ0FDQSxDQUFBLEdBQUEsSUFBVTtNQUZYO0NBQUEsRUFJWSxDQUFaLElBQUEsR0FBWTtDQUpaLEVBS1ksQ0FBWixJQUFBLEdBQVk7Q0FMWixDQU9BLENBQUksQ0FBSixHQUFBLElBQUEsSUFBQTtDQVBBLENBUUEsQ0FBSSxDQUFKLEdBQUEsTUFBQSxJQUFBO0NBUkEsQ0FTQSxDQUFJLENBQUosR0FBQSxFQUFBLElBQUE7Q0FYRCxFQUFhOztDQUFiLEVBdUJpQixNQUFBLE1BQWpCO0NBQ0ssRUFBSixRQUFBLGNBQUE7Q0F4QkQsRUF1QmlCOztDQXZCakIsRUEwQm1CLE1BQUEsUUFBbkI7Q0FDSyxFQUFKLFFBQUEsZ0JBQUE7Q0EzQkQsRUEwQm1COztDQTFCbkIsRUE2QmUsTUFBQSxJQUFmO0NBQ0ssRUFBSixRQUFBLFlBQUE7Q0E5QkQsRUE2QmU7O0NBN0JmOztDQUhEIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjY4OTksImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9wcm9maWxlLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJDbG91ZGluYXJ5ID0gcmVxdWlyZSAnYXBwL2NvbnRyb2xsZXJzL2Nsb3VkaW5hcnknXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUHJvZmlsZSBcblx0ZWxlbWVudHM6IG51bGxcblx0Zm9ybV9iaW86IG51bGxcblxuXHQjIFRPRE86IHJlcGxhY2UgdGhpcyBmYWtlIGRhdGEgb2JqZWN0XG5cdHVzZXJfZGF0YSA6XG5cdFx0cHJvZmlsZV9waWN0dXJlOiBcIi9pbWFnZXMvcHJvZmlsZV9iaWcucG5nXCJcblx0XHRjb3Zlcl9waWN0dXJlOiBcIi9pbWFnZXMvaG9tZXBhZ2VfMi5qcGdcIlxuXHRcdGxvY2F0aW9uOiBcIkxvbmRvbiAtIFVLXCJcblx0XHRiaW86IFwiVGhvbWFzIEFtdW5kc2VuIGZyb20gT3Nsbywgbm93IGJhc2VkIGluIExvbmRvbiBoYXMgZnJvbSBhbiBlYXJseSBhZ2UgbG90cyBvZiBtdXNpY2FsIGluZmx1ZW5jZXMsIGV4cGVyaW1lbnRpbmcgZnJvbSBhY291c3RpYyBpbnN0cnVtZW50cyB0byBlbGVjdHJvbmljIG11c2ljIHByb2R1Y3Rpb24gYW5kIERKaW5nLjxici8+PGJyLz5IZSByZWxlYXNlZCBoaXMgZGVidXQgRVAg4oCcSSBGZWVs4oCdIG9uIEZ1c2lvbiByZWNvcmRpbmdzLCBzdWItbGFiZWwgb2YgRGogQ2VudGVyIFJlY29yZHMsIGFuZCBoYXMgc2luY2UgcmVsZWFzZWQgZnJlcXVlbnRseSBvbiBsYWJlbHMgc3VjaCBhczsgRG9iYXJhLCBTdXN1cnJvdXMgTXVzaWMsIEluY29nbml0dXMgUmVjb3JkaW5ncywgS29vbHdhdGVycyBhbmQgZ2FpbmVkIHN1cHBvcnQgZnJvbSB0aGUgbGlrZXMgb2YgQW1pbmUgRWRnZSwgU3RhY2V5IFB1bGxlbiwgRGV0bGVmLCBTbGFtLCBNYXJjIFZlZG8sIExvdmVyZG9zZSwgQXNobGV5IFdpbGQsIEpvYmUgYW5kIG1hbnkgbW9yZVwiXG5cdFx0bGlua3M6IFtcblx0XHRcdHt0eXBlOlwic3BvdGlmeVwiLCB1cmw6XCJodHRwOi8vc3BvdGlmeS5jb21cIn0sXG5cdFx0XHR7dHlwZTpcInNvdW5kY2xvdWRcIiwgdXJsOlwiaHR0cDovL3NvdW5kY2xvdWQuY29tXCJ9LFxuXHRcdFx0e3R5cGU6XCJmYWNlYm9va1wiLCB1cmw6XCJodHRwOi8vZmFjZWJvb2suY29tXCJ9XG5cdFx0XVxuXG5cdGNvbnN0cnVjdG9yOiAoIEBkb20gKSAtPlxuXG5cdFx0QGVsZW1lbnRzID0gXG5cdFx0XHRwcm9maWxlX3BpY3R1cmU6IEBkb20uZmluZCggJy5wcm9maWxlX2ltYWdlIGltZycgKVxuXHRcdFx0Y292ZXJfcGljdHVyZTogQGRvbS5maW5kKCAnLmNvdmVyX2ltYWdlJyApXG5cdFx0XHRsb2NhdGlvbjogQGRvbS5maW5kKCAnLmxvY2F0aW9uJyApXG5cdFx0XHRsb2NhdGlvbl9pbnB1dDogQGRvbS5maW5kKCAnLmxvY2F0aW9uX2lucHV0JyApXG5cdFx0XHRiaW86IEBkb20uZmluZCggJy5iaW8nIClcblx0XHRcdGJpb19pbnB1dDogQGRvbS5maW5kKCAnLmJpb19pbnB1dCcgKVxuXHRcdFx0bGlua3M6IFtcblx0XHRcdFx0e3R5cGU6XCJzcG90aWZ5XCIsIGVsOkBkb20uZmluZCggJy5zcG90aWZ5X2xpbmsnICl9LFxuXHRcdFx0XHR7dHlwZTpcInNvdW5kY2xvdWRcIiwgZWw6QGRvbS5maW5kKCAnLnNvdW5kY2xvdWRfbGluaycgKX0sXG5cdFx0XHRcdHt0eXBlOlwiZmFjZWJvb2tcIiwgZWw6QGRvbS5maW5kKCAnLmZhY2Vib29rX2xpbmsnICl9XG5cdFx0XHRdXG5cdFx0XHRsaW5rc19pbnB1dDogW1xuXHRcdFx0XHR7dHlwZTpcInNwb3RpZnlcIiwgZWw6QGRvbS5maW5kKCAnLnNwb3RpZnlfaW5wdXQnICl9LFxuXHRcdFx0XHR7dHlwZTpcInNvdW5kY2xvdWRcIiwgZWw6QGRvbS5maW5kKCAnLnNvdW5kY2xvdWRfaW5wdXQnICl9LFxuXHRcdFx0XHR7dHlwZTpcImZhY2Vib29rXCIsIGVsOkBkb20uZmluZCggJy5mYWNlYm9va19pbnB1dCcgKX1cblx0XHRcdF1cblxuXG5cdFx0QGZvcm1fYmlvID0gQGRvbS5maW5kKCAnLnByb2ZpbGVfZm9ybScgKVxuXHRcdEBmb3JtX2Jpby5vbiAnc3VibWl0JywgKGUpIC0+IGUucHJldmVudERlZmF1bHQoKVxuXHRcdEBmb3JtX2Jpby5maW5kKCAnaW5wdXQnICkua2V5dXAgKGUpID0+XG5cdFx0XHRpZiBlLmtleUNvZGUgaXMgMTNcblx0XHRcdFx0QHJlYWRfbW9kZSgpXG5cblx0XHRyZWYgPSBAXG5cblx0XHRAZG9tLmZpbmQoICdbZGF0YS1wcm9maWxlXScgKS5vbiAnY2xpY2snLCAtPlxuXG5cdFx0XHR2YWx1ZSA9ICQoQCkuZGF0YSAncHJvZmlsZSdcblxuXHRcdFx0c3dpdGNoIHZhbHVlXG5cdFx0XHRcdHdoZW4gJ3NldC13cml0ZS1tb2RlJ1xuXHRcdFx0XHRcdGRvIHJlZi53cml0ZV9tb2RlXG5cdFx0XHRcdHdoZW4gJ3NldC1yZWFkLW1vZGUnXG5cdFx0XHRcdFx0ZG8gcmVmLnJlYWRfbW9kZVxuXG5cblx0XHRAdXBkYXRlX2RvbV9mcm9tX3VzZXJfZGF0YSgpXG5cblx0XHR2aWV3Lm9uICdiaW5kZWQnLCBAb25fdmlld3NfYmluZGVkXG5cblxuXG5cdG9uX3ZpZXdzX2JpbmRlZDogPT5cblxuXG5cdFx0bG9nIFwiW1Byb2ZpbGVdIG9uX3ZpZXdzX2JpbmRlZFwiXG5cdFx0IyBMaXN0ZW4gdG8gaW1hZ2VzIHVwbG9hZCBldmVudHNcblx0XHRjaGFuZ2VfY292ZXJfdXBsb2FkZXIgPSB2aWV3LmdldF9ieV9kb20gQGRvbS5maW5kKCAnLmNoYW5nZV9jb3ZlcicgKVxuXG5cdFx0aWYgbm90IGNoYW5nZV9jb3Zlcl91cGxvYWRlclxuXHRcdFx0bG9nIFwiW1Byb2ZpbGVdIHZpZXdzIG5vdCBiaW5kZWQgeWV0ISEhXCJcblx0XHRcdHJldHVyblxuXG5cdFx0Y2hhbmdlX2NvdmVyX3VwbG9hZGVyLm9uICdjb21wbGV0ZWQnLCAoZGF0YSkgPT5cblxuXHRcdFx0QHVzZXJfZGF0YS5jb3Zlcl9waWN0dXJlID0gZGF0YS5yZXN1bHQudXJsXG5cblx0XHRcdEBkb20uZmluZCggJy5jb3Zlcl9pbWFnZScgKS5jc3Ncblx0XHRcdFx0J2JhY2tncm91bmQtaW1hZ2UnOiBcInVybCgje2RhdGEucmVzdWx0LnVybH0pXCJcblxuXHRcdGNoYW5nZV9waWN0dXJlX3VwbG9hZGVyID0gdmlldy5nZXRfYnlfZG9tIEBkb20uZmluZCggJy5wcm9maWxlX2ltYWdlJyApXG5cdFx0Y2hhbmdlX3BpY3R1cmVfdXBsb2FkZXIub24gJ2NvbXBsZXRlZCcsIChkYXRhKSA9PlxuXG5cdFx0XHRAdXNlcl9kYXRhLnByb2ZpbGVfcGljdHVyZSA9IGRhdGEucmVzdWx0LnVybFxuXG5cdFx0XHRAZG9tLmZpbmQoICdpbWcnICkuYXR0ciAnc3JjJywgZGF0YS5yZXN1bHQudXJsXG5cblxuXHQjIE9wZW4gdGhlIHdyaXRlL2VkaXQgbW9kZVxuXHR3cml0ZV9tb2RlIDogLT5cblx0XHRhcHAuYm9keS5hZGRDbGFzcyAnd3JpdGVfbW9kZSdcblxuXHRcblx0XG5cdFxuXHRyZWFkX21vZGUgOiAtPlxuXHRcdCMgLSBVcGRhdGUgdGhlIHVzZXJfZGF0YSBmcm9tIHRoZSBpbnB1dHNcblx0XHRAdXBkYXRlX3VzZXJfZGF0YV9mcm9tX2RvbSgpXG5cblx0XHQjIC0gVXBkYXRlIHRoZSBkb20gKGxhYmVscyBhbmQgaW5wdXRzKSBmcm9tIHRoZSB1c2VyX2RhdGFcblx0XHQjIFx0VGhpcyBhY3Rpb24gaXMgbW9zdGx5IGRvbmUgZm9yIHVwZGF0aW5nIGxhYmVscyAoaW5wdXRzIGFyZSBhbHJlYWR5IHVwZGF0ZWQpXG5cdFx0QHVwZGF0ZV9kb21fZnJvbV91c2VyX2RhdGEoKVxuXG5cdFx0IyAtIFRPRE86IFNlbmQgdGhlIGRhdGEgdG8gdGhlIGJhY2tlbmRcblx0XHRAc2VuZF90b19zZXJ2ZXIoKVxuXG5cdFx0IyAtIGNsb3NlIHRoZSB3cml0ZS9lZGl0IG1vZGUgYW5kIHN3aXRjaCB0byByZWFkIG9ubHkgbW9kZVxuXHRcdGFwcC5ib2R5LnJlbW92ZUNsYXNzICd3cml0ZV9tb2RlJ1xuXG5cblxuXHR1cGRhdGVfdXNlcl9kYXRhX2Zyb21fZG9tOiAtPlxuXG5cdFx0IyAtIFRPRE86IFVwZGF0ZSB0aGUgaW1hZ2VzXG5cblx0XHRAdXNlcl9kYXRhLmxvY2F0aW9uID0gQGVsZW1lbnRzLmxvY2F0aW9uX2lucHV0LnZhbCgpXG5cdFx0QHVzZXJfZGF0YS5iaW8gPSBAZWxlbWVudHMuYmlvX2lucHV0LnZhbCgpXG5cblx0XHRAdXNlcl9kYXRhLmxpbmtzID0gW11cblx0XHRmb3IgbCwgaSBpbiBAZWxlbWVudHMubGlua3NfaW5wdXRcblx0XHRcdEB1c2VyX2RhdGEubGlua3MucHVzaFxuXHRcdFx0XHR0eXBlOiBsLnR5cGVcblx0XHRcdFx0dXJsOiBsLmVsLnZhbCgpXG5cblxuXHR1cGRhdGVfZG9tX2Zyb21fdXNlcl9kYXRhIDogLT5cblxuXHRcdGUgPSBAZWxlbWVudHNcblx0XHRkID0gQHVzZXJfZGF0YVxuXG5cdFx0ZS5wcm9maWxlX3BpY3R1cmUuY3NzICdiYWNrZ3JvdW5kLWltYWdlJywgZC5wcm9maWxlX3BpY3R1cmVcblx0XHRlLmNvdmVyX3BpY3R1cmUuY3NzICdiYWNrZ3JvdW5kLWltYWdlJywgZC5jb3Zlcl9waWN0dXJlXG5cblx0XHRlLmxvY2F0aW9uLmh0bWwgZC5sb2NhdGlvblxuXHRcdGUubG9jYXRpb25faW5wdXQudmFsIGQubG9jYXRpb25cblxuXHRcdGUuYmlvLmh0bWwgZC5iaW9cblx0XHRlLmJpb19pbnB1dC52YWwgQGh0bWxfdG9fdGV4dGFyZWEoIGQuYmlvIClcblxuXHRcdGZvciBsaW5rLCBpIGluIGQubGlua3Ncblx0XHRcdGUubGlua3NbIGkgXS5lbC5hdHRyICdocmVmJywgbGluay51cmxcblx0XHRcdGUubGlua3NfaW5wdXRbIGkgXS5lbC52YWwgbGluay51cmxcblxuXHRodG1sX3RvX3RleHRhcmVhIDogKCBzdHIgKSAtPlxuXHRcdHRvX2ZpbmQgPSBcIjxici8+XCJcblx0XHR0b19yZXBsYWNlID0gXCJcXG5cIlxuXHRcdHJlID0gbmV3IFJlZ0V4cCB0b19maW5kLCAnZydcblxuXHRcdHJldHVybiBzdHIucmVwbGFjZSByZSwgdG9fcmVwbGFjZVxuXG5cdHNlbmRfdG9fc2VydmVyOiAtPlxuXHRcdGxvZyBcIltQcm9maWxlXSBzYXZlXCIsIEB1c2VyX2RhdGFcblx0XHRyZXR1cm5cblx0XHQkLnBvc3QgXCIvYXBpL3YxL3VzZXIvc2F2ZVwiLCBAdXNlcl9kYXRhLCAoZGF0YSkgPT5cblx0XHRcdGxvZyBcIltQcm9maWxlXSBzZXJ2ZXIgcmVzcG9uc2VcIiwgZGF0YVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsZUFBQTtHQUFBLCtFQUFBOztBQUFBLENBQUEsRUFBYSxJQUFBLEdBQWIsa0JBQWE7O0FBRWIsQ0FGQSxFQUV1QixHQUFqQixDQUFOO0NBQ0MsRUFBVSxDQUFWLElBQUE7O0NBQUEsRUFDVSxDQURWLElBQ0E7O0NBREEsRUFLQyxNQUREO0NBQ0MsQ0FBaUIsRUFBakIsV0FBQSxVQUFBO0NBQUEsQ0FDZSxFQUFmLFNBQUEsV0FEQTtDQUFBLENBRVUsRUFBVixJQUFBLEtBRkE7Q0FBQSxDQUdLLENBQUwsQ0FBQSxxZ0JBSEE7Q0FBQSxDQUlPLEVBQVAsQ0FBQTtPQUNDO0NBQUEsQ0FBTSxFQUFMLElBQUEsQ0FBRDtDQUFBLENBQXFCLENBQUosS0FBQSxZQUFqQjtFQUNBLE1BRk07Q0FFTixDQUFNLEVBQUwsSUFBQSxJQUFEO0NBQUEsQ0FBd0IsQ0FBSixLQUFBLGVBQXBCO0VBQ0EsTUFITTtDQUdOLENBQU0sRUFBTCxJQUFBLEVBQUQ7Q0FBQSxDQUFzQixDQUFKLEtBQUEsYUFBbEI7UUFITTtNQUpQO0NBTEQsR0FBQTs7Q0FlYSxDQUFBLENBQUEsY0FBRztDQUVmLEVBQUEsS0FBQTtPQUFBLEtBQUE7Q0FBQSxFQUZlLENBQUQ7Q0FFZCx3REFBQTtDQUFBLEVBQ0MsQ0FERCxJQUFBO0NBQ0MsQ0FBaUIsQ0FBSSxDQUFILEVBQWxCLFNBQUEsS0FBaUI7Q0FBakIsQ0FDZSxDQUFJLENBQUgsRUFBaEIsT0FBQSxDQUFlO0NBRGYsQ0FFVSxDQUFJLENBQUgsRUFBWCxFQUFBLEdBQVU7Q0FGVixDQUdnQixDQUFJLENBQUgsRUFBakIsUUFBQSxHQUFnQjtDQUhoQixDQUlLLENBQUwsQ0FBTSxFQUFOO0NBSkEsQ0FLVyxDQUFJLENBQUgsRUFBWixHQUFBLEdBQVc7Q0FMWCxDQU1PLEdBQVAsQ0FBQTtTQUNDO0NBQUEsQ0FBTSxFQUFMLEtBQUQsQ0FBQztDQUFELENBQWlCLENBQU8sQ0FBSCxNQUFKLEtBQUc7RUFDcEIsUUFGTTtDQUVOLENBQU0sRUFBTCxNQUFBLEVBQUQ7Q0FBQSxDQUFvQixDQUFPLENBQUgsTUFBSixRQUFHO0VBQ3ZCLFFBSE07Q0FHTixDQUFNLEVBQUwsTUFBQTtDQUFELENBQWtCLENBQU8sQ0FBSCxNQUFKLE1BQUc7VUFIZjtRQU5QO0NBQUEsQ0FXYSxJQUFiLEtBQUE7U0FDQztDQUFBLENBQU0sRUFBTCxLQUFELENBQUM7Q0FBRCxDQUFpQixDQUFPLENBQUgsTUFBSixNQUFHO0VBQ3BCLFFBRlk7Q0FFWixDQUFNLEVBQUwsTUFBQSxFQUFEO0NBQUEsQ0FBb0IsQ0FBTyxDQUFILE1BQUosU0FBRztFQUN2QixRQUhZO0NBR1osQ0FBTSxFQUFMLE1BQUE7Q0FBRCxDQUFrQixDQUFPLENBQUgsTUFBSixPQUFHO1VBSFQ7UUFYYjtDQURELEtBQUE7Q0FBQSxFQW1CWSxDQUFaLElBQUEsT0FBWTtDQW5CWixDQW9CQSxDQUF1QixDQUF2QixJQUFTLENBQWU7Q0FBTyxZQUFELENBQUE7Q0FBOUIsSUFBdUI7Q0FwQnZCLEVBcUJnQyxDQUFoQyxDQUFBLEVBQUEsQ0FBUyxDQUF3QjtDQUNoQyxDQUFBLEVBQUcsQ0FBYSxDQUFoQixDQUFHO0NBQ0QsSUFBQSxJQUFELE1BQUE7UUFGOEI7Q0FBaEMsSUFBZ0M7Q0FyQmhDLEVBeUJBLENBQUE7Q0F6QkEsQ0EyQkEsQ0FBSSxDQUFKLEdBQUEsRUFBMEMsT0FBMUM7Q0FFQyxJQUFBLEtBQUE7Q0FBQSxFQUFRLENBQUEsQ0FBUixDQUFBLEdBQVE7Q0FFUixJQUFBLFNBQU87Q0FBUCxZQUNNLEdBRE47Q0FFUyxFQUFELE9BQU4sT0FBRztDQUZMLFlBR00sRUFITjtDQUlTLEVBQUQsTUFBTixRQUFHO0NBSkwsTUFKeUM7Q0FBMUMsSUFBMEM7Q0EzQjFDLEdBc0NBLHFCQUFBO0NBdENBLENBd0NBLEVBQUEsSUFBQSxPQUFBO0NBekRELEVBZWE7O0NBZmIsRUE2RGlCLE1BQUEsTUFBakI7Q0FHQyxPQUFBLHNDQUFBO09BQUEsS0FBQTtDQUFBLEVBQUEsQ0FBQSx1QkFBQTtDQUFBLEVBRXdCLENBQXhCLE1BQXdCLEtBQWdCLE1BQXhDO0FBRU8sQ0FBUCxHQUFBLGlCQUFBO0NBQ0MsRUFBQSxHQUFBLDZCQUFBO0NBQ0EsV0FBQTtNQU5EO0NBQUEsQ0FRQSxDQUFzQyxDQUF0QyxLQUF1QyxFQUF2QyxVQUFxQjtDQUVwQixFQUEyQixDQUFJLENBQTlCLENBQUQsR0FBVSxJQUFWO0NBRUMsRUFBRyxDQUFKLENBQUMsUUFBRCxDQUFBO0NBQ0MsQ0FBcUIsQ0FBSyxDQUFJLEVBQVQsRUFBckIsVUFBQTtDQUxvQyxPQUlyQztDQUpELElBQXNDO0NBUnRDLEVBZTBCLENBQTFCLE1BQTBCLE1BQWdCLE9BQTFDO0NBQ3dCLENBQXhCLENBQXdDLENBQUEsS0FBQyxFQUF6QyxZQUF1QjtDQUV0QixFQUE2QixDQUFJLENBQWhDLENBQUQsR0FBVSxNQUFWO0NBRUMsQ0FBOEIsQ0FBM0IsQ0FBSixDQUFDLENBQXlDLE9BQTFDO0NBSkQsSUFBd0M7Q0FoRnpDLEVBNkRpQjs7Q0E3RGpCLEVBd0ZhLE1BQUEsQ0FBYjtDQUNLLEVBQUQsQ0FBSyxJQUFSLEdBQUEsQ0FBQTtDQXpGRCxFQXdGYTs7Q0F4RmIsRUE4RlksTUFBWjtDQUVDLEdBQUEscUJBQUE7Q0FBQSxHQUlBLHFCQUFBO0NBSkEsR0FPQSxVQUFBO0NBR0ksRUFBRCxDQUFLLE9BQVIsQ0FBQTtDQTFHRCxFQThGWTs7Q0E5RlosRUE4RzJCLE1BQUEsZ0JBQTNCO0NBSUMsT0FBQSxzQkFBQTtDQUFBLEVBQXNCLENBQXRCLElBQUEsQ0FBVSxLQUFvQztDQUE5QyxFQUNBLENBQUEsSUFBMEIsQ0FBaEI7Q0FEVixDQUFBLENBR21CLENBQW5CLENBQUEsSUFBVTtDQUNWO0NBQUE7VUFBQSx5Q0FBQTttQkFBQTtDQUNDLEdBQUMsQ0FBZSxJQUFOO0NBQ1QsQ0FBTSxFQUFOLElBQUE7Q0FBQSxDQUNLLENBQUwsS0FBQTtDQUZELE9BQUE7Q0FERDtxQkFSMEI7Q0E5RzNCLEVBOEcyQjs7Q0E5RzNCLEVBNEg0QixNQUFBLGdCQUE1QjtDQUVDLE9BQUEsK0JBQUE7Q0FBQSxFQUFJLENBQUosSUFBQTtDQUFBLEVBQ0ksQ0FBSixLQURBO0NBQUEsQ0FHMEMsQ0FBMUMsQ0FBQSxXQUFpQixHQUFqQjtDQUhBLENBSXdDLENBQXhDLENBQUEsU0FBZSxLQUFmO0NBSkEsR0FNQSxJQUFVO0NBTlYsRUFPQSxDQUFBLElBQUEsTUFBZ0I7Q0FQaEIsRUFTSyxDQUFMO0NBVEEsRUFVQSxDQUFBLEtBQVcsT0FBSztDQUVoQjtDQUFBO1VBQUEseUNBQUE7c0JBQUE7Q0FDQyxDQUFlLENBQWYsQ0FBQSxDQUFTLENBQVQ7Q0FBQSxDQUNxQixDQUFyQixDQUE4QixPQUFmO0NBRmhCO3FCQWQyQjtDQTVINUIsRUE0SDRCOztDQTVINUIsRUE4SW1CLE1BQUUsT0FBckI7Q0FDQyxPQUFBLGVBQUE7Q0FBQSxFQUFVLENBQVYsR0FBQTtDQUFBLEVBQ2EsQ0FBYixNQUFBO0NBREEsQ0FFQSxDQUFTLENBQVQsRUFBUyxDQUFBO0NBRVQsQ0FBTyxDQUFHLElBQUgsR0FBQSxDQUFBO0NBbkpSLEVBOEltQjs7Q0E5SW5CLEVBcUpnQixNQUFBLEtBQWhCO0NBQ0MsT0FBQSxJQUFBO0NBQUEsQ0FBc0IsQ0FBdEIsQ0FBQSxLQUFBLE9BQUE7Q0FDQSxTQUFBO0NBQ0MsQ0FBMkIsQ0FBWSxDQUF4QyxLQUFBLEVBQUEsUUFBQTtDQUNLLENBQTZCLENBQWpDLENBQUEsU0FBQSxjQUFBO0NBREQsSUFBd0M7Q0F4SnpDLEVBcUpnQjs7Q0FySmhCOztDQUhEIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjcwODIsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9yb29tLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFJvb21cblx0Y29uc3RydWN0b3I6ICggQGRvbSApIC0+Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUE7O0FBQUEsQ0FBQSxFQUF1QixHQUFqQixDQUFOO0NBQ2MsQ0FBQSxDQUFBLFdBQUc7Q0FBTyxFQUFQLENBQUQ7Q0FBZixFQUFhOztDQUFiOztDQUREIn19XX0=
*/})()