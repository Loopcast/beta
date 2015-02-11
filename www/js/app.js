
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
var App, Window, app, happens, navigation, views,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

window.delay = require('./utils/delay');

window.log = require('./utils/log');

Window = require('./utils/window');

require('../vendors/modernizr.custom.js');

require('./utils/mover');

happens = require('happens');

views = require('./controllers/views');

navigation = require('./controllers/navigation');

App = (function() {
  App.prototype.win = {
    obj: null,
    w: 0,
    h: 0
  };

  function App() {
    this.after_render = __bind(this.after_render, this);
    happens(this);
    this.on('ready', this.after_render);
  }

  App.prototype.start = function() {
    var _this = this;
    this.body = $('body');
    this.settings = require('app/utils/settings');
    this.settings.bind(this.body);
    this.window = new Window;
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

}, {"./utils/delay":"src/frontend/scripts/utils/delay","./utils/log":"src/frontend/scripts/utils/log","./utils/window":"src/frontend/scripts/utils/window","../vendors/modernizr.custom.js":"src/frontend/vendors/modernizr.custom","./utils/mover":"src/frontend/scripts/utils/mover","happens":"node_modules/happens/index","./controllers/views":"src/frontend/scripts/controllers/views","./controllers/navigation":"src/frontend/scripts/controllers/navigation","app/utils/settings":"src/frontend/scripts/utils/settings"});
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
require.register('src/frontend/scripts/utils/delay', function(require, module, exports){
module.exports = function(delay, funk) {
  return setTimeout(funk, delay);
};

}, {});
require.register('src/frontend/scripts/utils/log', function(require, module, exports){
module.exports = function() {
  log.history = log.history || [];
  log.history.push(arguments);
  if (typeof console !== "undefined" && console !== null) {
    return console.log(Array.prototype.slice.call(arguments));
  }
};

}, {});
require.register('src/frontend/scripts/utils/mover', function(require, module, exports){
var Mover, mover;

Mover = (function() {
  function Mover() {}

  Mover.prototype.scroll_to = function(el, with_topbar, speed) {
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
  };

  Mover.prototype.scroll_to_y = function(y, with_topbar, speed) {
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
  };

  return Mover;

})();

mover = new Mover;

module.exports = window.mover = mover;

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
require.register('src/frontend/scripts/utils/window', function(require, module, exports){
var Window, happens,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

happens = require('happens');

module.exports = Window = (function() {
  Window.prototype.obj = null;

  Window.prototype.w = 0;

  Window.prototype.h = 0;

  function Window() {
    this.on_resize = __bind(this.on_resize, this);
    happens(this);
    this.obj = $(window);
    this.obj.on('resize', this.on_resize);
    delay(100, this.on_resize);
  }

  Window.prototype.on_resize = function() {
    this.w = this.obj.width();
    this.h = this.obj.height();
    return this.emit('resize');
  };

  return Window;

})();

}, {"happens":"node_modules/happens/index"});
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
var HoverTrigger,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

module.exports = HoverTrigger = (function() {
  HoverTrigger.prototype.opened = false;

  function HoverTrigger(dom) {
    this.dom = dom;
    this.on_mouse_leave = __bind(this.on_mouse_leave, this);
    this.on_mouse_over = __bind(this.on_mouse_over, this);
    this.toggle = __bind(this.toggle, this);
    this.target = $(this.dom.data('target'));
    if (this.target.length <= 0) {
      log("[HoverTrigger] error. target not found", this.dom.data('target'));
      return;
    }
    if (app.settings.touch_device) {
      this.dom.on('click', this.toggle);
      $('html,body').on('click', this.on_mouse_leave);
    } else {
      this.dom.on('mouseover', this.on_mouse_over);
      this.target.on('mouseleave', this.on_mouse_leave);
    }
  }

  HoverTrigger.prototype.toggle = function(e) {
    if (this.opened) {
      this.on_mouse_leave();
    } else {
      this.on_mouse_over();
    }
    return e.stopPropagation();
  };

  HoverTrigger.prototype.on_mouse_over = function() {
    if (this.opened) {
      return;
    }
    this.opened = true;
    this.dom.addClass("hovered");
    return this.target.addClass("hovered");
  };

  HoverTrigger.prototype.on_mouse_leave = function() {
    if (!this.opened) {
      return;
    }
    this.opened = false;
    this.dom.removeClass("hovered");
    return this.target.removeClass("hovered");
  };

  return HoverTrigger;

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
      return window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
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
var Header,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

module.exports = Header = (function() {
  function Header(dom) {
    this.dom = dom;
    this.on_user_unlogged = __bind(this.on_user_unlogged, this);
    this.on_user_logged = __bind(this.on_user_logged, this);
    app.on('user:logged', this.on_user_logged);
  }

  Header.prototype.on_user_logged = function(data) {
    var html, tmpl;
    tmpl = require('templates/shared/header_user_logged');
    html = tmpl(data);
    log('[Header] on_user_logged', data, html);
    return this.dom.find('.user_logged').empty().append(html);
  };

  Header.prototype.on_user_unlogged = function(data) {};

  return Header;

})();

}, {"templates/shared/header_user_logged":"src/frontend/templates/shared/header_user_logged"});
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
buf.push("<div class=\"thumb_wrapper\">");
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
jade.debug.shift();
buf.push("</div>");
jade.debug.shift();
jade.debug.unshift({ lineno: 5, filename: jade.debug[0].filename });
buf.push("<a href=\"javascript:;\" title=\"Messages\">");
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 6, filename: jade.debug[0].filename });
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
  jade.rethrow(err, jade.debug[0].filename, jade.debug[0].lineno,".thumb_wrapper\n\timg(width=\"42\", src=\"#{thumb}\")\n\tspan.spritesheet.small_arrow_white\n\na(href=\"javascript:;\" title=\"Messages\")\n\tspan.spritesheet.messages_icon");
}
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
//@ sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic2VjdGlvbnMiOlt7Im9mZnNldCI6eyJsaW5lIjo0ODgyLCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvYXBwLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyIjIHV0aWxzIC8gaGVscGVyc1xud2luZG93LmRlbGF5ICBcdFx0PSByZXF1aXJlICcuL3V0aWxzL2RlbGF5J1xud2luZG93LmxvZyAgXHRcdD0gcmVxdWlyZSAnLi91dGlscy9sb2cnXG5XaW5kb3cgXHRcdFx0XHQ9IHJlcXVpcmUgJy4vdXRpbHMvd2luZG93J1xucmVxdWlyZSAnLi4vdmVuZG9ycy9tb2Rlcm5penIuY3VzdG9tLmpzJ1xucmVxdWlyZSAnLi91dGlscy9tb3ZlcidcblxuIyBldmVudHNcblxuaGFwcGVucyAgICAgICAgIFx0PSByZXF1aXJlICdoYXBwZW5zJ1xuXG4jIGNvbnRyb2xsZXJzXG52aWV3cyAgICAgICAgIFx0XHQ9IHJlcXVpcmUgJy4vY29udHJvbGxlcnMvdmlld3MnXG5uYXZpZ2F0aW9uICAgICAgICBcdD0gcmVxdWlyZSAnLi9jb250cm9sbGVycy9uYXZpZ2F0aW9uJ1xuIyBtb3Rpb24gICAgICAgIFx0XHQ9IHJlcXVpcmUgJ2FwcC9jb250cm9sbGVycy9tb3Rpb24nXG5cbmNsYXNzIEFwcFxuXG5cdHdpbjpcblx0XHRvYmo6IG51bGxcblx0XHR3OiAwXG5cdFx0aDogMFxuXG5cblx0Y29uc3RydWN0b3I6IC0+IFx0XG5cblx0XHRoYXBwZW5zIEBcblxuXHRcdEBvbiAncmVhZHknLCBAYWZ0ZXJfcmVuZGVyXG5cblx0c3RhcnQ6IC0+XG5cblx0XHRAYm9keSAgID0gJCAnYm9keSdcblx0XHRcblx0XHRAc2V0dGluZ3MgPSByZXF1aXJlICdhcHAvdXRpbHMvc2V0dGluZ3MnXG5cdFx0QHNldHRpbmdzLmJpbmQgQGJvZHlcblxuXHRcdCMgUmVzaXplIG1hbmFnZW1lbnRcblx0XHRAd2luZG93ID0gbmV3IFdpbmRvd1xuXG5cblx0XHQjIENvbnRyb2xsZXJzIGJpbmRpbmdcblx0XHRkbyB2aWV3cy5iaW5kXG5cdFx0ZG8gbmF2aWdhdGlvbi5iaW5kXG5cblx0XHQjIHdoZW4gdGhlIG5ldyBhcmUgaXMgcmVuZGVyZWQsIGRvIHRoZSBzYW1lIHdpdGggdGhlIG5ldyBjb250ZW50XG5cblx0XHRuYXZpZ2F0aW9uLm9uICdiZWZvcmVfZGVzdHJveScsID0+XG5cdFx0XHRsb2cgXCItLS0tLS0tLS0gQkVGT1JFIERFU1RST1lcIlxuXHRcdFx0dmlld3MudW5iaW5kICcjY29udGVudCdcblxuXG5cdFx0bmF2aWdhdGlvbi5vbiAnYWZ0ZXJfcmVuZGVyJywgPT4gXG5cdFx0XHR2aWV3cy5iaW5kICAgICAgICcjY29udGVudCdcblx0XHRcdG5hdmlnYXRpb24uYmluZCAnI2NvbnRlbnQnXG5cdFx0XG5cblx0XHQjIFNpbXVsYXRlIHRoZSBsb2cgaW4gYWN0aW9uIGZyb20gYSBmYWtlIHVzZXJcblx0XHQjIGRlbGF5IDQwMCwgPT5cblx0XHQjIFx0dXNlciA9IFxuXHRcdCMgXHRcdHVzZXJuYW1lOiBcIlN0ZWZhbm8gT3J0aXNpXCJcblx0XHQjIFx0XHR0aHVtYjogXCIvaW1hZ2VzL3Byb2ZpbGUuanBnXCJcblx0XHQjIFx0XHRwZXJtYWxpbms6IFwiL3Byb2ZpbGUvc3RlZmFub29ydGlzaVwiXG5cblx0XHQjIFx0YXBwLmJvZHkuYWRkQ2xhc3MgXCJsb2dnZWRcIlxuXHRcdCMgXHRhcHAuZW1pdCAndXNlcjpsb2dnZWQnLCB1c2VyXG5cdFx0XHRcdFxuXG5cblx0IyMjXG5cdCMgQWZ0ZXIgdGhlIHZpZXdzIGhhdmUgYmVlbiByZW5kZXJlZFxuXHQjIyNcblx0YWZ0ZXJfcmVuZGVyOiAoICkgPT5cblx0XHQjIEhpZGUgdGhlIGxvYWRpbmdcblx0XHRkZWxheSAxMCwgPT4gXG5cdFx0XHRAYm9keS5hZGRDbGFzcyBcImxvYWRlZFwiXG5cblxuXHRcdFxuYXBwID0gbmV3IEFwcFxuXG4kIC0+IGFwcC5zdGFydCgpXG5cbm1vZHVsZS5leHBvcnRzID0gd2luZG93LmFwcCA9IGFwcCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxJQUFBLHdDQUFBO0dBQUEsK0VBQUE7O0FBQUEsQ0FBQSxFQUFrQixFQUFsQixDQUFNLENBQVksUUFBQTs7QUFDbEIsQ0FEQSxFQUNBLEdBQU0sQ0FBVSxNQUFBOztBQUNoQixDQUZBLEVBRWEsR0FBYixDQUFhLFNBQUE7O0FBQ2IsQ0FIQSxNQUdBLHlCQUFBOztBQUNBLENBSkEsTUFJQSxRQUFBOztBQUlBLENBUkEsRUFRbUIsSUFBbkIsRUFBbUI7O0FBR25CLENBWEEsRUFXa0IsRUFBbEIsRUFBa0IsY0FBQTs7QUFDbEIsQ0FaQSxFQVlxQixJQUFBLEdBQXJCLGdCQUFxQjs7QUFHZixDQWZOO0NBaUJDLEVBQUE7Q0FDQyxDQUFLLENBQUwsQ0FBQTtDQUFBLENBQ0csRUFBSDtDQURBLENBRUcsRUFBSDtDQUhELEdBQUE7O0NBTWEsQ0FBQSxDQUFBLFVBQUE7Q0FFWixrREFBQTtDQUFBLEdBQUEsR0FBQTtDQUFBLENBRUEsRUFBQSxHQUFBLEtBQUE7Q0FWRCxFQU1hOztDQU5iLEVBWU8sRUFBUCxJQUFPO0NBRU4sT0FBQSxJQUFBO0NBQUEsRUFBVSxDQUFWLEVBQVU7Q0FBVixFQUVZLENBQVosR0FBWSxDQUFaLFlBQVk7Q0FGWixHQUdBLElBQVM7QUFHQyxDQU5WLEVBTVUsQ0FBVixFQUFBO0NBTkEsR0FVRyxDQUFLO0NBVlIsR0FXRyxNQUFVO0NBWGIsQ0FlQSxDQUFnQyxDQUFoQyxLQUFnQyxDQUF0QixNQUFWO0NBQ0MsRUFBQSxHQUFBLG9CQUFBO0NBQ00sSUFBRCxDQUFMLElBQUEsR0FBQTtDQUZELElBQWdDO0NBS3JCLENBQVgsQ0FBOEIsTUFBQSxDQUFwQixDQUFWLEdBQUE7Q0FDQyxHQUFBLENBQUssQ0FBTCxJQUFBO0NBQ1csR0FBWCxNQUFVLEdBQVY7Q0FGRCxJQUE4QjtDQWxDL0IsRUFZTzs7Q0F1Q1A7OztDQW5EQTs7Q0FBQSxFQXNEYyxNQUFBLEdBQWQ7Q0FFQyxPQUFBLElBQUE7Q0FBTSxDQUFOLENBQVUsRUFBVixJQUFVLEVBQVY7Q0FDRSxHQUFJLENBQUosR0FBRCxLQUFBO0NBREQsSUFBVTtDQXhEWCxFQXNEYzs7Q0F0RGQ7O0NBakJEOztBQThFQSxDQTlFQSxFQThFQTs7QUFFQSxDQWhGQSxFQWdGRSxNQUFBO0NBQU8sRUFBRCxFQUFILElBQUE7Q0FBSDs7QUFFRixDQWxGQSxFQWtGaUIsR0FBWCxDQUFOIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjQ5NTgsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy9jb250cm9sbGVycy9uYXZpZ2F0aW9uLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJzZXR0aW5ncyAgXHQ9IHJlcXVpcmUgJ2FwcC91dGlscy9zZXR0aW5ncydcbmhhcHBlbnMgIFx0PSByZXF1aXJlICdoYXBwZW5zJ1xud2F5cyAgICBcdD0gcmVxdWlyZSAnd2F5cydcbndheXMudXNlIHJlcXVpcmUgJ3dheXMtYnJvd3NlcidcblxuY2xhc3MgTmF2aWdhdGlvblxuXG5cdGluc3RhbmNlID0gbnVsbFxuXHRcblxuXHRjb25zdHJ1Y3RvcjogLT5cblxuXHRcdGlmIE5hdmlnYXRpb24uaW5zdGFuY2Vcblx0XHRcdGNvbnNvbGUuZXJyb3IgXCJZb3UgY2FuJ3QgaW5zdGFudGlhdGUgdGhpcyBOYXZpZ2F0aW9uIHR3aWNlXCJcdFxuXG5cdFx0XHRyZXR1cm5cblxuXHRcdE5hdmlnYXRpb24uaW5zdGFuY2UgPSBAXG5cdFx0QGNvbnRlbnRfc2VsZWN0b3IgPSAnI2NvbnRlbnQgLmlubmVyX2NvbnRlbnQnXG5cdFx0QGNvbnRlbnRfZGl2ID0gJCBAY29udGVudF9zZWxlY3RvclxuXG5cdFx0aGFwcGVucyBAXG5cdFxuXHRcdCMgcm91dGluZ1xuXHRcdHdheXMgJyonLCBAdXJsX2NoYW5nZWRcblxuXHRcdGRlbGF5IDIwMCwgPT4gQGVtaXQgJ2FmdGVyX3JlbmRlcidcblxuXHR1cmxfY2hhbmdlZDogKCByZXEgKSA9PlxuXG5cdFx0IyBpZSBoYWNrIGZvciBoYXNoIHVybHNcblx0XHRyZXEudXJsID0gcmVxLnVybC5yZXBsYWNlKCBcIi8jXCIsICcnIClcblxuXHRcdCMgbG9nIFwiIGNvbnRyb2xsZXJzL25hdmlnYXRpb24vdXJsX2NoYW5nZWQ6OiAje3JlcS51cmx9XCJcblx0XHQjIFRPRE86IFxuXHRcdCMgIC0gZG9uJ3QgcmVsb2FkIGlmIHRoZSBjb250ZW50IGlzIGFscmVhZHkgbG9hZGVkXG5cdFx0IyAgLSBpbXBsZW1lbnQgdHJhbnNpdGlvbnMgb3V0XG5cdFx0IyAgLSBpbXBsZW1lbnQgdHJhbnNpdGlvbiAgaW4gXG5cblx0XHRkaXYgPSAkKCAnPGRpdj4nIClcblxuXHRcdEBlbWl0ICdiZWZvcmVfbG9hZCdcblxuXHRcdGRpdi5sb2FkIHJlcS51cmwsID0+XG5cblx0XHRcdEBlbWl0ICdvbl9sb2FkJ1xuXG5cdFx0XHRpZiBhcHAuYm9keS5zY3JvbGxUb3AoKSA+IDBcblx0XHRcdFx0YXBwLmJvZHkuYW5pbWF0ZSBzY3JvbGxUb3A6IDBcblxuXG5cdFx0XHRAZW1pdCAnYmVmb3JlX2Rlc3Ryb3knXHRcdFxuXG5cdFx0XHRkZWxheSA0MDAsID0+XHRcdFx0XG5cblx0XHRcdFx0bmV3X2NvbnRlbnQgPSBkaXYuZmluZCggQGNvbnRlbnRfc2VsZWN0b3IgKS5jaGlsZHJlbigpXG5cdFx0XHRcdFxuXHRcdFx0XHRAY29udGVudF9kaXYgPSAkIEBjb250ZW50X3NlbGVjdG9yXG5cblx0XHRcdFx0IyBSZW1vdmUgb2xkIGNvbnRlbnRcblx0XHRcdFx0QGNvbnRlbnRfZGl2LmNoaWxkcmVuKCkucmVtb3ZlKClcblxuXHRcdFx0XHQjIHBvcHVsYXRlIHdpdGggdGhlIGxvYWRlZCBjb250ZW50XG5cdFx0XHRcdEBjb250ZW50X2Rpdi5hcHBlbmQgbmV3X2NvbnRlbnRcblxuXHRcdFx0XHRAZW1pdCAnYWZ0ZXJfcmVuZGVyJ1xuXG5cdCMjXG5cdCMgTmF2aWdhdGVzIHRvIGEgZ2l2ZW4gVVJMIHVzaW5nIEh0bWwgNSBoaXN0b3J5IEFQSVxuXHQjI1xuXHRnbzogKCB1cmwgKSAtPlxuXG5cdFx0d2F5cy5nbyB1cmxcblxuXHRcdHJldHVybiBmYWxzZVxuXG5cdCMjXG5cdCMgTG9va3MgZm9yIGludGVybmFsIGxpbmtzIGFuZCBiaW5kIHRoZW4gdG8gY2xpZW50IHNpZGUgbmF2aWdhdGlvblxuXHQjIGFzIGluOiBodG1sIEhpc3RvcnkgYXBpXG5cdCMjXG5cdGJpbmQ6ICggc2NvcGUgPSAnYm9keScgKSAtPlxuXG5cdFx0JCggc2NvcGUgKS5maW5kKCAnYScgKS5lYWNoICggaW5kZXgsIGl0ZW0gKSAtPlxuXG5cdFx0XHQkaXRlbSA9ICQgaXRlbVxuXHRcdFx0aHJlZiA9ICRpdGVtLmF0dHIoICdocmVmJyApXG5cblx0XHRcdGlmICFocmVmPyB0aGVuIHJldHVybiBcblxuXHRcdFx0IyBpZiB0aGUgbGluayBoYXMgaHR0cCBhbmQgdGhlIGRvbWFpbiBpcyBkaWZmZXJlbnRcblx0XHRcdGlmIGhyZWYuaW5kZXhPZiggJ2h0dHAnICkgPj0gMCBhbmQgaHJlZi5pbmRleE9mKCBkb2N1bWVudC5kb21haW4gKSA8IDAgXG5cdFx0XHRcdHJldHVybiBcblxuXHRcdFx0aWYgaHJlZi5pbmRleE9mKCBcIiNcIiApIGlzIDBcblx0XHRcdFx0JGl0ZW0uY2xpY2sgLT4gcmV0dXJuIGZhbHNlXG5cblx0XHRcdGVsc2UgaWYgaHJlZi5pbmRleE9mKCBcImphdmFzY3JpcHRcIiApIGlzIDAgb3IgaHJlZi5pbmRleE9mKCBcInRlbDpcIiApIGlzIDBcblx0XHRcdFx0cmV0dXJuIHRydWVcblx0XHRcdGVsc2Vcblx0XHRcdFx0JGl0ZW0uY2xpY2sgLT4gXG5cdFx0XHRcdFx0cmV0dXJuIE5hdmlnYXRpb24uaW5zdGFuY2UuZ28gJCggQCApLmF0dHIgJ2hyZWYnXG5cblxuIyB3aWxsIGFsd2F5cyBleHBvcnQgdGhlIHNhbWUgaW5zdGFuY2Vcbm1vZHVsZS5leHBvcnRzID0gbmV3IE5hdmlnYXRpb24iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSwrQkFBQTtHQUFBLCtFQUFBOztBQUFBLENBQUEsRUFBYSxJQUFBLENBQWIsWUFBYTs7QUFDYixDQURBLEVBQ1ksSUFBWixFQUFZOztBQUNaLENBRkEsRUFFVyxDQUFYLEVBQVcsQ0FBQTs7QUFDWCxDQUhBLEVBR0EsQ0FBSSxHQUFLLE9BQUE7O0FBRUgsQ0FMTjtDQU9DLEtBQUEsRUFBQTs7Q0FBQSxDQUFBLENBQVcsQ0FBWCxJQUFBOztDQUdhLENBQUEsQ0FBQSxpQkFBQTtDQUVaLGdEQUFBO0NBQUEsT0FBQSxJQUFBO0NBQUEsR0FBQSxJQUFBLEVBQWE7Q0FDWixJQUFBLENBQUEsQ0FBTyxzQ0FBUDtDQUVBLFdBQUE7TUFIRDtDQUFBLEVBS3NCLENBQXRCLElBQUEsRUFBVTtDQUxWLEVBTW9CLENBQXBCLFlBQUEsU0FOQTtDQUFBLEVBT2UsQ0FBZixPQUFBLEtBQWU7Q0FQZixHQVNBLEdBQUE7Q0FUQSxDQVlVLENBQVYsQ0FBQSxPQUFBO0NBWkEsQ0FjVyxDQUFYLENBQUEsQ0FBQSxJQUFXO0NBQUksR0FBRCxDQUFDLFFBQUQsQ0FBQTtDQUFkLElBQVc7Q0FuQlosRUFHYTs7Q0FIYixFQXFCYSxNQUFFLEVBQWY7Q0FHQyxFQUFBLEtBQUE7T0FBQSxLQUFBO0NBQUEsQ0FBaUMsQ0FBOUIsQ0FBSCxHQUFVO0NBQVYsRUFRQSxDQUFBLEdBQU07Q0FSTixHQVVBLFNBQUE7Q0FFSSxDQUFjLENBQWYsQ0FBSCxLQUFrQixFQUFsQjtDQUVDLEdBQUEsQ0FBQyxDQUFELEdBQUE7Q0FFQSxFQUFNLENBQUgsRUFBSCxHQUFHO0NBQ0YsRUFBRyxDQUFLLEdBQVIsQ0FBQTtDQUFpQixDQUFXLE9BQVgsQ0FBQTtDQUFqQixTQUFBO1FBSEQ7Q0FBQSxHQU1BLENBQUMsQ0FBRCxVQUFBO0NBRU0sQ0FBSyxDQUFYLEVBQUEsSUFBVyxJQUFYO0NBRUMsVUFBQSxDQUFBO0NBQUEsRUFBYyxDQUFBLENBQVcsR0FBekIsR0FBQSxLQUFjO0NBQWQsRUFFZSxFQUFkLEdBQUQsR0FBQSxLQUFlO0NBRmYsSUFLQyxDQUFELEVBQUEsR0FBWTtDQUxaLElBUUMsQ0FBRCxFQUFBLEdBQVk7Q0FFWCxHQUFELENBQUMsU0FBRCxDQUFBO0NBWkQsTUFBVztDQVZaLElBQWtCO0NBcENuQixFQXFCYTs7Q0FyQmIsQ0ErREEsQ0FBSSxNQUFFO0NBRUwsQ0FBQSxDQUFBLENBQUE7Q0FFQSxJQUFBLE1BQU87Q0FuRVIsRUErREk7O0NBL0RKLEVBeUVNLENBQU4sQ0FBTSxJQUFFOztHQUFRLEdBQVI7TUFFUDtDQUFBLENBQXFDLENBQXJDLENBQUEsQ0FBQSxJQUE4QixFQUE5QjtDQUVDLFNBQUEsQ0FBQTtDQUFBLEVBQVEsQ0FBQSxDQUFSLENBQUE7Q0FBQSxFQUNPLENBQVAsQ0FBWSxDQUFaO0NBRUEsR0FBSSxFQUFKLE1BQUE7Q0FBZSxhQUFBO1FBSGY7Q0FNQSxFQUFxRSxDQUFsRSxFQUFILENBQUcsQ0FBc0Q7Q0FDeEQsYUFBQTtRQVBEO0NBU0EsRUFBRyxDQUFBLENBQXVCLENBQTFCLENBQUc7Q0FDSSxFQUFNLEVBQVAsSUFBTyxNQUFaO0NBQWUsSUFBQSxZQUFPO0NBQXRCLFFBQVk7Q0FFQSxHQUFMLENBQWdDLENBSHhDLENBR1EsQ0FIUixJQUdRO0NBQ1AsR0FBQSxXQUFPO01BSlIsRUFBQTtDQU1PLEVBQU0sRUFBUCxJQUFPLE1BQVo7Q0FDQyxDQUFPLEVBQXVCLEVBQUEsRUFBSixFQUFULE9BQVY7Q0FEUixRQUFZO1FBakJjO0NBQTVCLElBQTRCO0NBM0U3QixFQXlFTTs7Q0F6RU47O0NBUEQ7O0FBd0dBLENBeEdBLEVBd0dpQixHQUFYLENBQU4sR0F4R0EifX0seyJvZmZzZXQiOnsibGluZSI6NTA1NywiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL2NvbnRyb2xsZXJzL3ZpZXdzLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJoYXBwZW5zID0gcmVxdWlyZSAnaGFwcGVucydcblxuY2xhc3MgVmlld1xuXG5cdFVOSVFVRV9JRCAgXHQ9IDBcblxuXG5cdCMjI1xuXHRIYXNoIE1hcCB0byBzdG9yZSB0aGUgdmlld3M6XG5cblx0aGFzaF9tb2RlbCA9IHtcblx0XHRcIjx2aWV3X25hbWU+XCIgOiBbIDx2aWV3X2luc3RhbmNlPiwgPHZpZXdfaW5zdGFuY2U+LCAuLiBdLFxuXHRcdFwiPHZpZXdfbmFtZT5cIiA6IFsgPHZpZXdfaW5zdGFuY2U+LCA8dmlld19pbnN0YW5jZT4sIC4uIF1cblx0fVxuXHQjIyNcblx0aGFzaF9tb2RlbCAgOiB7fVxuXG5cblx0IyMjXG5cdFVpZCBNYXAuIEludGVybmFsIG1hcCB1c2VkIGZvciBlYXNpbHkgZ2V0IGEgdmlldyBieSB1aWRcblxuXHR1aWRfbWFwID0ge1xuXHRcdFwiPFVOSVFVRV9JRD5cIiA6IHsgbmFtZSA6IDx2aWV3X25hbWU+LCBpbmRleDogPHZpZXdfaW5kZXg+IH0sXG5cdFx0XCI8VU5JUVVFX0lEPlwiIDogeyBuYW1lIDogPHZpZXdfbmFtZT4sIGluZGV4OiA8dmlld19pbmRleD4gfSxcblx0XHQgIC4uLlxuXHR9XG5cdCMjI1xuXHR1aWRfbWFwOiB7fVxuXG5cblxuXG5cblx0IyBHZXQgdGhlIHZpZXcgZnJvbSB0aGUgaGFzaCBtb2RlbFxuXHRnZXQ6ICggaWQsIGluZGV4ID0gMCApID0+XG5cdFx0dW5sZXNzIEBoYXNoX21vZGVsWyBpZCBdP1xuXHRcdFx0IyBjb25zb2xlLmVycm9yIFwiVmlldyAje2lkfSAje2luZGV4fSBkb2Vzbid0IGV4aXN0c1wiXG5cdFx0XHRyZXR1cm4gZmFsc2VcblxuXHRcdEBoYXNoX21vZGVsWyBpZCBdWyBpbmRleCBdXG5cblxuXG5cdGdldF9ieV91aWQ6ICggdWlkICkgPT5cblx0XHRpZiBAdWlkX21hcFsgdWlkIF0/XG5cdFx0XHRuYW1lID0gQHVpZF9tYXBbIHVpZCBdLm5hbWVcblx0XHRcdGluZGV4ID0gQHVpZF9tYXBbIHVpZCBdLmluZGV4XG5cblx0XHRcdHJldHVybiBAZ2V0IG5hbWUsIGluZGV4XG5cblx0XHRyZXR1cm4gZmFsc2VcblxuXHRnZXRfYnlfZG9tOiAoIHNlbGVjdG9yICkgPT4gQGdldF9ieV91aWQgJCggc2VsZWN0b3IgKS5kYXRhICd1aWQnXG5cblxuXG5cdGJpbmQ6ICggc2NvcGUgPSAnYm9keScsIHRvbG9nID0gZmFsc2UgKSAtPlxuXG5cdFx0IyBjb25zb2xlLmVycm9yIFwiQmluZGluZ3Mgdmlld3M6ICN7c2NvcGV9XCJcblx0XHQkKCBzY29wZSApLmZpbmQoICdbZGF0YS12aWV3XScgKS5lYWNoKCAoIGluZGV4LCBpdGVtICkgPT5cblxuXHRcdFx0JGl0ZW0gPSAkIGl0ZW1cblxuXHRcdFx0dmlld19uYW1lID0gJGl0ZW0uZGF0YSggJ3ZpZXcnIClcblxuXHRcdFx0JGl0ZW0ucmVtb3ZlQXR0ciAnZGF0YS12aWV3J1xuXG5cdFx0XHRpZiB2aWV3X25hbWUuc3Vic3RyaW5nKDAsIDEpIGlzIFwiW1wiXG5cdFx0XHRcdG5hbWVzID0gdmlld19uYW1lLnN1YnN0cmluZygxLCB2aWV3X25hbWUubGVuZ3RoIC0gMSkuc3BsaXQoXCIsXCIpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdG5hbWVzID0gW3ZpZXdfbmFtZV1cblxuXHRcdFx0Zm9yIG5hbWUgaW4gbmFtZXNcblx0XHRcdFx0QF9hZGRfdmlldyAkaXRlbSwgbmFtZVxuXG5cdFx0XHQjIHJlbW92ZSB0aGUgZGF0YS12aWV3IGF0dHJpYnV0ZSwgc28gaXQgd29uJ3QgYmUgaW5zdGFudGlhdGVkIHR3aWNlIVxuXHRcdFx0JGl0ZW0ucmVtb3ZlQXR0ciAnZGF0YS12aWV3J1xuXG5cdFx0KS5wcm9taXNlKCkuZG9uZSA9PiBAZW1pdCBcImJpbmRlZFwiXG5cblx0dW5iaW5kOiAoIHNjb3BlID0gJ2JvZHknICkgLT5cblx0XHQkKCBzY29wZSApLmZpbmQoICdbZGF0YS11aWRdJyApLmVhY2goICggaW5kZXgsIGl0ZW0gKSA9PlxuXG5cdFx0XHQkaXRlbSA9ICQgaXRlbVxuXG5cdFx0XHRpZCA9ICRpdGVtLmRhdGEgJ3VpZCdcblxuXHRcdFx0diA9IHZpZXcuZ2V0X2J5X3VpZCBpZFxuXG5cdFx0XHRpZiB2XG5cdFx0XHRcdHYuZGVzdHJveT8oKVxuXHRcdFx0XHR2aWV3Lm9uX3ZpZXdfZGVzdHJveWVkIGlkXG5cblx0XHQpLnByb21pc2UoKS5kb25lID0+IEBlbWl0IFwidW5iaW5kZWRcIlxuXG5cblxuXHRfYWRkX3ZpZXc6ICggJGl0ZW0sIHZpZXdfbmFtZSApIC0+XG5cblx0XHR0cnlcblx0XHRcdHZpZXcgPSByZXF1aXJlIFwiYXBwL3ZpZXdzLyN7dmlld19uYW1lfVwiXG5cdFx0Y2F0Y2ggZVxuXHRcdFx0Y29uc29sZS53YXJuICdlIC0+JywgZS5tZXNzYWdlXG5cdFx0XHRjb25zb2xlLmVycm9yIFwiYXBwL3ZpZXdzLyN7dmlld30gbm90IGZvdW5kIGZvciBcIiwgJGl0ZW1cblxuXHRcdHZpZXcgPSBuZXcgdmlldyAkaXRlbVxuXG5cdFx0IyBTYXZlIHRoZSB2aWV3IGluIGEgaGFzaCBtb2RlbFxuXHRcdEBoYXNoX21vZGVsWyB2aWV3X25hbWUgXSA/PSBbXVxuXG5cdFx0bCA9IEBoYXNoX21vZGVsWyB2aWV3X25hbWUgXS5sZW5ndGhcblxuXHRcdEBoYXNoX21vZGVsWyB2aWV3X25hbWUgXVsgbCBdID0gdmlld1xuXG5cblx0XHQjIFNhdmUgdGhlIGluY3JlbWVudGFsIHVpZCB0byB0aGUgZG9tIGFuZCB0byB0aGUgaW5zdGFuY2Vcblx0XHR2aWV3LnVpZCA9IFVOSVFVRV9JRFxuXHRcdHZpZXcudmlld19uYW1lID0gdmlld19uYW1lXG5cblx0XHQjIGxvZyBcIlt2aWV3XSBhZGRcIiwgdmlldy51aWQsIHZpZXcudmlld19uYW1lXG5cblx0XHQkaXRlbS5hdHRyICdkYXRhLXVpZCcsIFVOSVFVRV9JRFxuXG5cdFx0IyBTYXZlIHRoZSB2aWV3IGluIGEgbGluZWFyIGFycmF5IG1vZGVsXG5cdFx0QHVpZF9tYXBbIFVOSVFVRV9JRCBdID1cblx0XHRcdG5hbWUgIDogdmlld19uYW1lXG5cdFx0XHRpbmRleCA6IEBoYXNoX21vZGVsWyB2aWV3X25hbWUgXS5sZW5ndGggLSAxXG5cblxuXHRcdFVOSVFVRV9JRCsrXG5cblxuXG5cblx0b25fdmlld19kZXN0cm95ZWQ6ICggdWlkICkgLT5cblx0XHRcblx0XHQjIGxvZyBcIltWaWV3XSBvbl92aWV3X2Rlc3Ryb3llZFwiLCB1aWRcblx0XHRpZiBAdWlkX21hcFsgdWlkIF0/XG5cblx0XHRcdCMgR2V0IHRoZSBkYXRhIGZyb20gdGhlIHVpZCBtYXBcblx0XHRcdG5hbWUgID0gQHVpZF9tYXBbIHVpZCBdLm5hbWVcblx0XHRcdGluZGV4ID0gQHVpZF9tYXBbIHVpZCBdLmluZGV4XG5cblx0XHRcdCMgZGVsZXRlIHRoZSByZWZlcmVuY2UgaW4gdGhlIG1vZGVsXG5cdFx0XHRpZiBAaGFzaF9tb2RlbFsgbmFtZSBdWyBpbmRleCBdP1xuXG5cdFx0XHRcdCMgZGVsZXRlIHRoZSBpdGVtIGZyb20gdGhlIHVpZF9tYXBcblx0XHRcdFx0ZGVsZXRlIEB1aWRfbWFwWyB1aWQgXVxuXG5cdFx0XHRcdCMgRGVsZXRlIHRoZSBpdGVtIGZyb20gdGhlIGhhc2hfbW9kZWxcblx0XHRcdFx0QGhhc2hfbW9kZWxbIG5hbWUgXS5zcGxpY2UgaW5kZXgsIDFcblxuXHRcdFx0XHQjIFVwZGF0ZSB0aGUgaW5kZXggb24gdGhlIHVpZF9tYXAgZm9yIHRoZSB2aWV3cyBsZWZ0IG9mIHRoZSBzYW1lIHR5cGVcblx0XHRcdFx0Zm9yIGl0ZW0sIGkgaW4gQGhhc2hfbW9kZWxbIG5hbWUgXVxuXHRcdFx0XHRcdEB1aWRfbWFwWyBpdGVtLnVpZCBdLmluZGV4ID0gaVxuXG5cblx0XHRcdFx0XG5cblxuXG52aWV3ID0gbmV3IFZpZXdcbmhhcHBlbnMgdmlld1xuXG5tb2R1bGUuZXhwb3J0cyA9IHdpbmRvdy52aWV3ID0gdmlld1xuXG5cbiMgZXhwb3J0aW5nIGdldCBtZXRob2QgZm9yIHdpbmRvdywgc28geW91IGNhbiByZXRyaWV2ZSB2aWV3cyBqdXN0IHdpdGggVmlldyggaWQgKVxud2luZG93LlZpZXcgPSB2aWV3Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsZUFBQTtHQUFBLCtFQUFBOztBQUFBLENBQUEsRUFBVSxJQUFWLEVBQVU7O0FBRUosQ0FGTjtDQUlDLEtBQUEsR0FBQTs7Ozs7O0NBQUE7O0NBQUEsQ0FBQSxDQUFjLE1BQWQ7O0NBR0E7Ozs7Ozs7O0NBSEE7O0NBQUEsQ0FBQSxDQVdjLE9BQWQ7O0NBR0E7Ozs7Ozs7OztDQWRBOztDQUFBLENBQUEsQ0F1QlMsSUFBVDs7Q0F2QkEsQ0E4QkssQ0FBTCxFQUFLLElBQUU7O0dBQVksR0FBUjtNQUNWO0NBQUEsR0FBQSx1QkFBQTtDQUVDLElBQUEsUUFBTztNQUZSO0NBSUMsQ0FBWSxFQUFaLENBQWtCLEtBQU4sQ0FBYjtDQW5DRCxFQThCSzs7Q0E5QkwsRUF1Q1ksTUFBRSxDQUFkO0NBQ0MsT0FBQSxHQUFBO0NBQUEsR0FBQSxxQkFBQTtDQUNDLEVBQU8sQ0FBUCxFQUFBLENBQWlCO0NBQWpCLEVBQ1EsQ0FBQyxDQUFULENBQUEsQ0FBa0I7Q0FFbEIsQ0FBa0IsQ0FBWCxDQUFDLENBQUQsUUFBQTtNQUpSO0NBTUEsSUFBQSxNQUFPO0NBOUNSLEVBdUNZOztDQXZDWixFQWdEWSxLQUFBLENBQUUsQ0FBZDtDQUE2QixHQUFBLENBQVcsR0FBQSxFQUFaLENBQUE7Q0FoRDVCLEVBZ0RZOztDQWhEWixDQW9Ed0IsQ0FBbEIsQ0FBTixDQUFNLElBQUU7Q0FHUCxPQUFBLElBQUE7O0dBSGUsR0FBUjtNQUdQOztHQUgrQixHQUFSO01BR3ZCO0NBQUEsQ0FBZ0QsQ0FBVCxDQUF2QyxDQUFBLElBQXlDLEVBQXpDLEVBQUE7Q0FFQyxTQUFBLDZCQUFBO0NBQUEsRUFBUSxDQUFBLENBQVIsQ0FBQTtDQUFBLEVBRVksQ0FBQSxDQUFLLENBQWpCLEdBQUE7Q0FGQSxJQUlLLENBQUwsSUFBQSxDQUFBO0NBRUEsQ0FBMEIsQ0FBMUIsQ0FBRyxDQUE2QixDQUFoQyxHQUFZO0NBQ1gsQ0FBK0IsQ0FBdkIsRUFBUixDQUErQixFQUEvQixDQUFpQjtNQURsQixFQUFBO0NBR0MsRUFBUSxFQUFSLEdBQUEsQ0FBUTtRQVRUO0FBV0EsQ0FBQSxVQUFBLGlDQUFBOzBCQUFBO0NBQ0MsQ0FBa0IsRUFBbEIsQ0FBQyxHQUFELENBQUE7Q0FERCxNQVhBO0NBZU0sSUFBRCxLQUFMLENBQUEsRUFBQTtDQWpCRCxFQW1CaUIsQ0FuQmpCLENBQXVDLEVBQXZDLEVBbUJpQjtDQUFJLEdBQUQsQ0FBQyxHQUFELEtBQUE7Q0FuQnBCLElBbUJpQjtDQTFFbEIsRUFvRE07O0NBcEROLEVBNEVRLEVBQUEsQ0FBUixHQUFVO0NBQ1QsT0FBQSxJQUFBOztHQURpQixHQUFSO01BQ1Q7Q0FBQSxDQUErQyxDQUFULENBQXRDLENBQUEsSUFBd0MsRUFBeEMsQ0FBQTtDQUVDLFNBQUEsRUFBQTtDQUFBLEVBQVEsQ0FBQSxDQUFSLENBQUE7Q0FBQSxDQUVBLENBQUssQ0FBQSxDQUFLLENBQVY7Q0FGQSxDQUlJLENBQUEsQ0FBSSxFQUFSLElBQUk7Q0FFSixHQUFHLEVBQUg7O0NBQ0UsU0FBRDtVQUFBO0NBQ0ssQ0FBTCxFQUFJLFdBQUosRUFBQTtRQVZvQztDQUF0QyxFQVlpQixDQVpqQixDQUFzQyxFQUF0QyxFQVlpQjtDQUFJLEdBQUQsQ0FBQyxLQUFELEdBQUE7Q0FacEIsSUFZaUI7Q0F6RmxCLEVBNEVROztDQTVFUixDQTZGb0IsQ0FBVCxFQUFBLElBQVg7Q0FFQyxPQUFBLFNBQUE7Q0FBQTtDQUNDLEVBQU8sQ0FBUCxFQUFBLENBQU8sRUFBQSxHQUFTO01BRGpCO0NBR0MsS0FESztDQUNMLENBQXFCLEVBQXJCLEVBQUEsQ0FBTztDQUFQLENBQ2tELENBQXhCLENBQVgsQ0FBZixDQUFBLENBQU8sS0FBUSxLQUFmO01BSkQ7Q0FBQSxFQU1XLENBQVgsQ0FBVzs7Q0FHRSxFQUFlLEVBQWYsSUFBQTtNQVRiO0NBQUEsRUFXSSxDQUFKLEVBWEEsR0FXaUIsQ0FBQTtDQVhqQixFQWFnQyxDQUFoQyxLQUFhLENBQUE7Q0FiYixFQWlCQSxDQUFBLEtBakJBO0NBQUEsRUFrQmlCLENBQWpCLEtBQUE7Q0FsQkEsQ0FzQnVCLEVBQXZCLENBQUssSUFBTCxDQUFBO0NBdEJBLEVBMEJDLENBREQsR0FBVSxFQUFBO0NBQ1QsQ0FBUSxFQUFSLEVBQUEsR0FBQTtDQUFBLENBQ1EsQ0FBa0MsQ0FBakMsQ0FBVCxDQUFBLEdBQXFCLENBQUE7Q0EzQnRCLEtBQUE7QUE4QkEsQ0FoQ1UsUUFnQ1YsRUFBQTtDQTdIRCxFQTZGVzs7Q0E3RlgsRUFrSW1CLE1BQUUsUUFBckI7Q0FHQyxPQUFBLHNDQUFBO0NBQUEsR0FBQSxxQkFBQTtDQUdDLEVBQVEsQ0FBUixFQUFBLENBQWtCO0NBQWxCLEVBQ1EsQ0FBQyxDQUFULENBQUEsQ0FBa0I7Q0FHbEIsR0FBRyxFQUFILDhCQUFBO0FBR0MsQ0FBQSxFQUFpQixDQUFULEVBQVIsQ0FBaUIsQ0FBakI7Q0FBQSxDQUdrQyxFQUFqQyxDQUFELENBQUEsRUFBQSxFQUFhO0NBR2I7Q0FBQTtjQUFBLHFDQUFBOzBCQUFBO0NBQ0MsRUFBVSxDQUFULENBQUQsRUFBVTtDQURYO3lCQVREO1FBUEQ7TUFIa0I7Q0FsSW5CLEVBa0ltQjs7Q0FsSW5COztDQUpEOztBQWlLQSxDQWpLQSxFQWlLTyxDQUFQOztBQUNBLENBbEtBLEdBa0tBLEdBQUE7O0FBRUEsQ0FwS0EsRUFvS2lCLENBQUEsRUFBWCxDQUFOOztBQUlBLENBeEtBLEVBd0tjLENBQWQsRUFBTSJ9fSx7Im9mZnNldCI6eyJsaW5lIjo1MjI5LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdXRpbHMvYnJvd3Nlci5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiQnJvd3NlckRldGVjdCA9XG5cdGluaXQ6ICggKSAtPlxuXHRcdEBicm93c2VyID0gQHNlYXJjaFN0cmluZyhAZGF0YUJyb3dzZXIpIG9yIFwiQW4gdW5rbm93biBicm93c2VyXCJcblx0XHRAdmVyc2lvbiA9IEBzZWFyY2hWZXJzaW9uKG5hdmlnYXRvci51c2VyQWdlbnQpIG9yIEBzZWFyY2hWZXJzaW9uKG5hdmlnYXRvci5hcHBWZXJzaW9uKSBvciBcImFuIHVua25vd24gdmVyc2lvblwiXG5cdFx0QE9TID0gQHNlYXJjaFN0cmluZyhAZGF0YU9TKSBvciBcImFuIHVua25vd24gT1NcIlxuXG5cdHNlYXJjaFN0cmluZzogKGRhdGEpIC0+XG5cdFx0aSA9IDBcblxuXHRcdHdoaWxlIGkgPCBkYXRhLmxlbmd0aFxuXHRcdFx0ZGF0YVN0cmluZyA9IGRhdGFbaV0uc3RyaW5nXG5cdFx0XHRkYXRhUHJvcCA9IGRhdGFbaV0ucHJvcFxuXHRcdFx0QHZlcnNpb25TZWFyY2hTdHJpbmcgPSBkYXRhW2ldLnZlcnNpb25TZWFyY2ggb3IgZGF0YVtpXS5pZGVudGl0eVxuXHRcdFx0aWYgZGF0YVN0cmluZ1xuXHRcdFx0XHRyZXR1cm4gZGF0YVtpXS5pZGVudGl0eSAgdW5sZXNzIGRhdGFTdHJpbmcuaW5kZXhPZihkYXRhW2ldLnN1YlN0cmluZykgaXMgLTFcblx0XHRcdGVsc2UgcmV0dXJuIGRhdGFbaV0uaWRlbnRpdHkgIGlmIGRhdGFQcm9wXG5cdFx0XHRpKytcblx0XHRyZXR1cm5cblxuXHRzZWFyY2hWZXJzaW9uOiAoZGF0YVN0cmluZykgLT5cblx0XHRpbmRleCA9IGRhdGFTdHJpbmcuaW5kZXhPZihAdmVyc2lvblNlYXJjaFN0cmluZylcblx0XHRyZXR1cm4gIGlmIGluZGV4IGlzIC0xXG5cdFx0cGFyc2VGbG9hdCBkYXRhU3RyaW5nLnN1YnN0cmluZyhpbmRleCArIEB2ZXJzaW9uU2VhcmNoU3RyaW5nLmxlbmd0aCArIDEpXG5cblx0ZGF0YUJyb3dzZXI6IFtcblx0XHR7XG5cdFx0XHRzdHJpbmc6IG5hdmlnYXRvci51c2VyQWdlbnRcblx0XHRcdHN1YlN0cmluZzogXCJDaHJvbWVcIlxuXHRcdFx0aWRlbnRpdHk6IFwiQ2hyb21lXCJcblx0XHR9XG5cdFx0e1xuXHRcdFx0c3RyaW5nOiBuYXZpZ2F0b3IudXNlckFnZW50XG5cdFx0XHRzdWJTdHJpbmc6IFwiT21uaVdlYlwiXG5cdFx0XHR2ZXJzaW9uU2VhcmNoOiBcIk9tbmlXZWIvXCJcblx0XHRcdGlkZW50aXR5OiBcIk9tbmlXZWJcIlxuXHRcdH1cblx0XHR7XG5cdFx0XHRzdHJpbmc6IG5hdmlnYXRvci52ZW5kb3Jcblx0XHRcdHN1YlN0cmluZzogXCJBcHBsZVwiXG5cdFx0XHRpZGVudGl0eTogXCJTYWZhcmlcIlxuXHRcdFx0dmVyc2lvblNlYXJjaDogXCJWZXJzaW9uXCJcblx0XHR9XG5cdFx0e1xuXHRcdFx0cHJvcDogd2luZG93Lm9wZXJhXG5cdFx0XHRpZGVudGl0eTogXCJPcGVyYVwiXG5cdFx0XHR2ZXJzaW9uU2VhcmNoOiBcIlZlcnNpb25cIlxuXHRcdH1cblx0XHR7XG5cdFx0XHRzdHJpbmc6IG5hdmlnYXRvci52ZW5kb3Jcblx0XHRcdHN1YlN0cmluZzogXCJpQ2FiXCJcblx0XHRcdGlkZW50aXR5OiBcImlDYWJcIlxuXHRcdH1cblx0XHR7XG5cdFx0XHRzdHJpbmc6IG5hdmlnYXRvci52ZW5kb3Jcblx0XHRcdHN1YlN0cmluZzogXCJLREVcIlxuXHRcdFx0aWRlbnRpdHk6IFwiS29ucXVlcm9yXCJcblx0XHR9XG5cdFx0e1xuXHRcdFx0c3RyaW5nOiBuYXZpZ2F0b3IudXNlckFnZW50XG5cdFx0XHRzdWJTdHJpbmc6IFwiRmlyZWZveFwiXG5cdFx0XHRpZGVudGl0eTogXCJGaXJlZm94XCJcblx0XHR9XG5cdFx0e1xuXHRcdFx0c3RyaW5nOiBuYXZpZ2F0b3IudmVuZG9yXG5cdFx0XHRzdWJTdHJpbmc6IFwiQ2FtaW5vXCJcblx0XHRcdGlkZW50aXR5OiBcIkNhbWlub1wiXG5cdFx0fVxuXHRcdHtcblx0XHRcdCMgZm9yIG5ld2VyIE5ldHNjYXBlcyAoNispXG5cdFx0XHRzdHJpbmc6IG5hdmlnYXRvci51c2VyQWdlbnRcblx0XHRcdHN1YlN0cmluZzogXCJOZXRzY2FwZVwiXG5cdFx0XHRpZGVudGl0eTogXCJOZXRzY2FwZVwiXG5cdFx0fVxuXHRcdHtcblx0XHRcdHN0cmluZzogbmF2aWdhdG9yLnVzZXJBZ2VudFxuXHRcdFx0c3ViU3RyaW5nOiBcIk1TSUVcIlxuXHRcdFx0aWRlbnRpdHk6IFwiRXhwbG9yZXJcIlxuXHRcdFx0dmVyc2lvblNlYXJjaDogXCJNU0lFXCJcblx0XHR9XG5cdFx0e1xuXHRcdFx0c3RyaW5nOiBuYXZpZ2F0b3IudXNlckFnZW50XG5cdFx0XHRzdWJTdHJpbmc6IFwiR2Vja29cIlxuXHRcdFx0aWRlbnRpdHk6IFwiTW96aWxsYVwiXG5cdFx0XHR2ZXJzaW9uU2VhcmNoOiBcInJ2XCJcblx0XHR9XG5cdFx0e1xuXHRcdFx0IyBmb3Igb2xkZXIgTmV0c2NhcGVzICg0LSlcblx0XHRcdHN0cmluZzogbmF2aWdhdG9yLnVzZXJBZ2VudFxuXHRcdFx0c3ViU3RyaW5nOiBcIk1vemlsbGFcIlxuXHRcdFx0aWRlbnRpdHk6IFwiTmV0c2NhcGVcIlxuXHRcdFx0dmVyc2lvblNlYXJjaDogXCJNb3ppbGxhXCJcblx0XHR9XG5cdF1cblx0ZGF0YU9TOiBbXG5cdFx0e1xuXHRcdFx0c3RyaW5nOiBuYXZpZ2F0b3IucGxhdGZvcm1cblx0XHRcdHN1YlN0cmluZzogXCJXaW5cIlxuXHRcdFx0aWRlbnRpdHk6IFwiV2luZG93c1wiXG5cdFx0fVxuXHRcdHtcblx0XHRcdHN0cmluZzogbmF2aWdhdG9yLnBsYXRmb3JtXG5cdFx0XHRzdWJTdHJpbmc6IFwiTWFjXCJcblx0XHRcdGlkZW50aXR5OiBcIk1hY1wiXG5cdFx0fVxuXHRcdHtcblx0XHRcdHN0cmluZzogbmF2aWdhdG9yLnVzZXJBZ2VudFxuXHRcdFx0c3ViU3RyaW5nOiBcImlQaG9uZVwiXG5cdFx0XHRpZGVudGl0eTogXCJpUGhvbmUvaVBvZFwiXG5cdFx0fVxuXHRcdHtcblx0XHRcdHN0cmluZzogbmF2aWdhdG9yLnBsYXRmb3JtXG5cdFx0XHRzdWJTdHJpbmc6IFwiTGludXhcIlxuXHRcdFx0aWRlbnRpdHk6IFwiTGludXhcIlxuXHRcdH1cblx0XVxuXG5Ccm93c2VyRGV0ZWN0LmluaXQoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJyb3dzZXJEZXRlY3QiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxTQUFBOztBQUFBLENBQUEsRUFDQyxVQUREO0NBQ0MsQ0FBQSxDQUFNLENBQU4sS0FBTTtDQUNMLEVBQVcsQ0FBWCxHQUFBLElBQVcsQ0FBQSxRQUFYO0NBQUEsRUFDVyxDQUFYLEdBQUEsRUFBbUMsQ0FBZSxHQUF2QyxPQURYO0NBRUMsQ0FBRCxDQUFNLENBQUwsRUFBSyxLQUFOLENBQU07Q0FIUCxFQUFNO0NBQU4sQ0FLQSxDQUFjLENBQUEsS0FBQyxHQUFmO0NBQ0MsT0FBQSxlQUFBO0NBQUEsRUFBSSxDQUFKO0NBRUEsRUFBVSxDQUFJLEVBQWQsS0FBTTtDQUNMLEVBQWEsQ0FBSyxFQUFsQixJQUFBO0NBQUEsRUFDVyxDQUFLLEVBQWhCLEVBQUE7Q0FEQSxFQUV1QixDQUF0QixFQUFELEVBRkEsS0FFdUIsTUFBdkI7Q0FDQSxHQUFHLEVBQUgsSUFBQTtBQUMyRSxDQUExRSxHQUFnQyxDQUF5QyxFQUF6QyxDQUFoQyxDQUFnQyxDQUFVO0NBQTFDLEdBQVksSUFBWixTQUFPO1VBRFI7TUFBQSxFQUFBO0NBRUssR0FBNEIsSUFBNUI7Q0FBQSxHQUFZLElBQVosU0FBTztVQUZaO1FBSEE7QUFNQSxDQU5BLENBQUEsSUFNQTtDQVZZLElBR2I7Q0FSRCxFQUtjO0NBTGQsQ0FrQkEsQ0FBZSxNQUFDLENBQUQsR0FBZjtDQUNDLElBQUEsR0FBQTtDQUFBLEVBQVEsQ0FBUixDQUFBLEVBQVEsR0FBVSxTQUFWO0FBQ2EsQ0FBckIsR0FBQSxDQUFXO0NBQVgsV0FBQTtNQURBO0NBRVcsRUFBNkIsQ0FBQyxDQUFULENBQUEsR0FBckIsQ0FBWCxDQUFBLFFBQTREO0NBckI3RCxFQWtCZTtDQWxCZixDQXVCQSxTQUFBO0tBQ0M7Q0FBQSxDQUNTLElBQVIsR0FBaUI7Q0FEbEIsQ0FFWSxJQUFYLEVBRkQsQ0FFQztDQUZELENBR1csSUFBVixFQUFBO0VBRUQsSUFOWTtDQU1aLENBQ1MsSUFBUixHQUFpQjtDQURsQixDQUVZLElBQVgsR0FBQTtDQUZELENBR2dCLElBQWYsSUFIRCxHQUdDO0NBSEQsQ0FJVyxJQUFWLEVBQUEsQ0FKRDtFQU1BLElBWlk7Q0FZWixDQUNTLElBQVIsR0FBaUI7Q0FEbEIsQ0FFWSxJQUFYLENBRkQsRUFFQztDQUZELENBR1csSUFBVixFQUFBO0NBSEQsQ0FJZ0IsSUFBZixHQUpELElBSUM7RUFFRCxJQWxCWTtDQWtCWixDQUNPLEVBQU4sQ0FERCxDQUNDO0NBREQsQ0FFVyxJQUFWLENBRkQsQ0FFQztDQUZELENBR2dCLElBQWYsR0FIRCxJQUdDO0VBRUQsSUF2Qlk7Q0F1QlosQ0FDUyxJQUFSLEdBQWlCO0NBRGxCLENBRVksSUFBWCxHQUFBO0NBRkQsQ0FHVyxJQUFWLEVBQUE7RUFFRCxJQTVCWTtDQTRCWixDQUNTLElBQVIsR0FBaUI7Q0FEbEIsQ0FFWSxHQUZaLENBRUMsR0FBQTtDQUZELENBR1csSUFBVixFQUFBLEdBSEQ7RUFLQSxJQWpDWTtDQWlDWixDQUNTLElBQVIsR0FBaUI7Q0FEbEIsQ0FFWSxJQUFYLEdBQUE7Q0FGRCxDQUdXLElBQVYsRUFBQSxDQUhEO0VBS0EsSUF0Q1k7Q0FzQ1osQ0FDUyxJQUFSLEdBQWlCO0NBRGxCLENBRVksSUFBWCxFQUZELENBRUM7Q0FGRCxDQUdXLElBQVYsRUFBQTtFQUVELElBM0NZO0NBMkNaLENBRVMsSUFBUixHQUFpQjtDQUZsQixDQUdZLElBQVgsR0FBQSxDQUhEO0NBQUEsQ0FJVyxJQUFWLEVBQUEsRUFKRDtFQU1BLElBakRZO0NBaURaLENBQ1MsSUFBUixHQUFpQjtDQURsQixDQUVZLElBQVgsR0FBQTtDQUZELENBR1csSUFBVixFQUFBLEVBSEQ7Q0FBQSxDQUlnQixJQUFmLE9BQUE7RUFFRCxJQXZEWTtDQXVEWixDQUNTLElBQVIsR0FBaUI7Q0FEbEIsQ0FFWSxJQUFYLENBRkQsRUFFQztDQUZELENBR1csSUFBVixFQUFBLENBSEQ7Q0FBQSxDQUlnQixFQUpoQixFQUlDLE9BQUE7RUFFRCxJQTdEWTtDQTZEWixDQUVTLElBQVIsR0FBaUI7Q0FGbEIsQ0FHWSxJQUFYLEdBQUE7Q0FIRCxDQUlXLElBQVYsRUFBQSxFQUpEO0NBQUEsQ0FLZ0IsSUFBZixHQUxELElBS0M7TUFsRVc7SUF2QmI7Q0FBQSxDQTRGQSxJQUFBO0tBQ0M7Q0FBQSxDQUNTLElBQVIsRUFERCxDQUNrQjtDQURsQixDQUVZLEdBRlosQ0FFQyxHQUFBO0NBRkQsQ0FHVyxJQUFWLEVBQUEsQ0FIRDtFQUtBLElBTk87Q0FNUCxDQUNTLElBQVIsRUFERCxDQUNrQjtDQURsQixDQUVZLEdBRlosQ0FFQyxHQUFBO0NBRkQsQ0FHVyxHQUhYLENBR0MsRUFBQTtFQUVELElBWE87Q0FXUCxDQUNTLElBQVIsR0FBaUI7Q0FEbEIsQ0FFWSxJQUFYLEVBRkQsQ0FFQztDQUZELENBR1csSUFBVixFQUFBLEtBSEQ7RUFLQSxJQWhCTztDQWdCUCxDQUNTLElBQVIsRUFERCxDQUNrQjtDQURsQixDQUVZLElBQVgsQ0FGRCxFQUVDO0NBRkQsQ0FHVyxJQUFWLENBSEQsQ0FHQztNQW5CTTtJQTVGUjtDQURELENBQUE7O0FBb0hBLENBcEhBLEdBb0hBLFNBQWE7O0FBRWIsQ0F0SEEsRUFzSGlCLEdBQVgsQ0FBTixNQXRIQSJ9fSx7Im9mZnNldCI6eyJsaW5lIjo1MzQ3LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdXRpbHMvZGVsYXkuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gKCBkZWxheSwgZnVuayApIC0+IHNldFRpbWVvdXQgZnVuaywgZGVsYXkiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsQ0FBTyxDQUFtQixDQUFULENBQUEsQ0FBQSxDQUFYLENBQU4sRUFBbUI7Q0FBNEIsQ0FBTSxFQUFqQixDQUFBLElBQUEsQ0FBQTtDQUFuQiJ9fSx7Im9mZnNldCI6eyJsaW5lIjo1MzUzLCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdXRpbHMvbG9nLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IC0+XG5cdGxvZy5oaXN0b3J5ID0gbG9nLmhpc3Rvcnkgb3IgW10gIyBzdG9yZSBsb2dzIHRvIGFuIGFycmF5IGZvciByZWZlcmVuY2Vcblx0bG9nLmhpc3RvcnkucHVzaCBhcmd1bWVudHNcblxuXHRpZiBjb25zb2xlP1xuXHRcdGNvbnNvbGUubG9nIEFycmF5OjpzbGljZS5jYWxsKGFyZ3VtZW50cykiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsQ0FBTyxFQUFVLEdBQVgsQ0FBTixFQUFpQjtDQUNoQixDQUFBLENBQUcsQ0FBMEIsR0FBN0I7Q0FBQSxDQUNBLENBQUcsQ0FBSCxHQUFXLEVBQVg7Q0FFQSxDQUFBLEVBQUcsOENBQUg7Q0FDUyxFQUFSLENBQVksQ0FBSyxFQUFWLEVBQVksRUFBbkI7SUFMZTtDQUFBIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjUzNjMsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy91dGlscy9tb3Zlci5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgTW92ZXJcblx0c2Nyb2xsX3RvIDogKGVsLCB3aXRoX3RvcGJhciA9IGZhbHNlLCBzcGVlZCA9IDMwMCkgLT5cblxuXHRcdHkgPSBlbC5wb3NpdGlvbigpLnRvcFxuXG5cdFx0bG9nIFwiW01vdmVyXSBzY3JvbGxfdG9cIiwgeVxuXHRcdEBzY3JvbGxfdG9feSB5LCB3aXRoX3RvcGJhciwgc3BlZWRcblx0XHRcblxuXHRzY3JvbGxfdG9feTogKHksIHdpdGhfdG9wYmFyID0gdHJ1ZSwgc3BlZWQgPSAzMDApIC0+XG5cdFx0aWYgd2l0aF90b3BiYXJcblx0XHRcdHkgLT0gYXBwLnNldHRpbmdzLmhlYWRlcl9oZWlnaHRcblxuXHRcdGxvZyBcIlttb3Zlcl0gc2Nyb2xsX3RvX3lcIiwgeVxuXHRcdFxuXHRcdCQoICdodG1sLCBib2R5JyApLmFuaW1hdGUgc2Nyb2xsVG9wOiB5LCBzcGVlZFxuXG5tb3ZlciA9IG5ldyBNb3ZlclxuXG5tb2R1bGUuZXhwb3J0cyA9IHdpbmRvdy5tb3ZlciA9IG1vdmVyIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsUUFBQTs7QUFBTSxDQUFOO0NBQ0M7O0NBQUEsQ0FBWSxDQUFBLEVBQUEsSUFBWixFQUFZO0NBRVgsT0FBQTs7R0FGOEIsR0FBZDtNQUVoQjs7R0FGNkMsR0FBUjtNQUVyQztDQUFBLENBQU0sQ0FBRixDQUFKLElBQUk7Q0FBSixDQUV5QixDQUF6QixDQUFBLGVBQUE7Q0FDQyxDQUFlLEVBQWYsQ0FBRCxNQUFBO0NBTEQsRUFBWTs7Q0FBWixDQVFpQixDQUFKLEVBQUEsSUFBQyxFQUFkOztHQUErQixHQUFkO01BQ2hCOztHQUQ0QyxHQUFSO01BQ3BDO0NBQUEsR0FBQSxPQUFBO0NBQ0MsRUFBUSxDQUFILEVBQUwsRUFBaUIsS0FBakI7TUFERDtDQUFBLENBRzJCLENBQTNCLENBQUEsaUJBQUE7Q0FFQSxNQUFBLElBQUEsQ0FBQTtDQUEwQixDQUFXLElBQVgsR0FBQTtDQU5kLENBTTRCLEdBQXhDLENBQUE7Q0FkRCxFQVFhOztDQVJiOztDQUREOztBQWlCQSxDQWpCQSxFQWlCUSxFQUFSOztBQUVBLENBbkJBLEVBbUJpQixFQUFBLENBQVgsQ0FBTiJ9fSx7Im9mZnNldCI6eyJsaW5lIjo1NDA3LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdXRpbHMvb3BhY2l0eS5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiT3BhY2l0eSA9IFxuXHRzaG93OiAoZWwsIHRpbWUgPSAzMDApIC0+XG5cdFx0IyBsb2cgXCJbT3BhY2l0eV0gc2hvd1wiXG5cdFx0ZWwuZmFkZUluIHRpbWVcblx0XHQjIHQgPSBPcGFjaXR5LmdldF90aW1lKCB0aW1lIClcblx0XHQjIGVsLmNzcyBcblx0XHQjIFx0J3Zpc2liaWxpdHknIDogXCJ2aXNpYmxlXCJcblx0XHQjIFx0J3RyYW5zaXRpb24nIDogXCJvcGFjaXR5ICN7dH0gbGluZWFyXCJcblxuXHRcdCMgZGVsYXkgMSwgLT5cblx0XHQjIFx0ZWwuY3NzICdvcGFjaXR5JywgMVxuXG5cdGhpZGU6ICggZWwsIHRpbWUgPSAzMDAgKSAtPlxuXHRcdCMgbG9nIFwiW09wYWNpdHldIGhpZGVcIlxuXHRcdGVsLmZhZGVPdXQgdGltZVxuXG5cdFx0IyB0ID0gT3BhY2l0eS5nZXRfdGltZSB0aW1lXG5cdFx0IyB0MSA9IE9wYWNpdHkuZ2V0X3RpbWUoIHRpbWUgKyAxMDAgKVxuXG5cdFx0IyBlbC5jc3MgJ3RyYW5zaXRpb24nLCBcIm9wYWNpdHkgI3t0fSBsaW5lYXJcIlxuXHRcdCMgZGVsYXkgMSwgLT4gZWwuY3NzICdvcGFjaXR5JywgMFxuXHRcdCMgZGVsYXkgdDEsIC0+IGVsLmNzcyAndmlzaWJpbGl0eScsICdoaWRkZW4nXG5cblx0Z2V0X3RpbWU6ICggdGltZSApIC0+XG5cdFx0cmV0dXJuICh0aW1lLzEwMDApICsgXCJzXCJcblxubW9kdWxlLmV4cG9ydHMgPSBPcGFjaXR5Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsR0FBQTs7QUFBQSxDQUFBLEVBQ0MsSUFERDtDQUNDLENBQUEsQ0FBTSxDQUFOLEtBQU87O0dBQVcsR0FBUDtNQUVWO0NBQUcsQ0FBRCxFQUFGLEVBQUEsS0FBQTtDQUZELEVBQU07Q0FBTixDQVdBLENBQU0sQ0FBTixLQUFROztHQUFXLEdBQVA7TUFFWDtDQUFHLENBQUQsRUFBRixHQUFBLElBQUE7Q0FiRCxFQVdNO0NBWE4sQ0FzQkEsQ0FBVSxDQUFBLElBQVYsQ0FBWTtDQUNYLEVBQWEsQ0FBTCxPQUFEO0NBdkJSLEVBc0JVO0NBdkJYLENBQUE7O0FBMEJBLENBMUJBLEVBMEJpQixHQUFYLENBQU4ifX0seyJvZmZzZXQiOnsibGluZSI6NTQzMSwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3V0aWxzL3NldHRpbmdzLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJCcm93c2VyRGV0ZWN0ID0gcmVxdWlyZSAnYXBwL3V0aWxzL2Jyb3dzZXInXG5cbnNldHRpbmdzID0gXG5cblx0IyBCcm93c2VyIGlkLCB2ZXJzaW9uLCBPU1xuXHRicm93c2VyOiB7XG5cblx0XHQjIElEIFtTdHJpbmddXG5cdFx0aWQ6IEJyb3dzZXJEZXRlY3QuYnJvd3NlclxuXG5cdFx0IyBWZXJzaW9uIFtTdHJpbmddXG5cdFx0dmVyc2lvbjogQnJvd3NlckRldGVjdC52ZXJzaW9uXG5cdFx0XG5cdFx0IyBPUyBbU3RyaW5nXVxuXHRcdE9TOiBCcm93c2VyRGV0ZWN0Lk9TXG5cdFx0XG5cdFx0IyBJcyBDaHJvbWU/IFtCb29sZWFuXVxuXHRcdGNocm9tZTogKG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5pbmRleE9mKCAnY2hyb21lJyApID4gLTEpXG5cblx0XHQjIElzIEZpcmVmb3ggW0Jvb2xlYW5dXG5cdFx0ZmlyZWZveDogKC9GaXJlZm94L2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSlcblxuXHRcdCMgSXMgSUU4PyBbQm9vbGVhbl1cblx0XHRpZTg6IGZhbHNlXG5cblx0XHQjIERldmljZSByYXRpbyBbTnVtYmVyXVxuXHRcdGRldmljZV9yYXRpbzogd2luZG93LmRldmljZVBpeGVsUmF0aW9cblxuXHRcdCMgSXMgYSBoYW5kaGVsZCBkZXZpY2U/IFtCb29sZWFuXVxuXHRcdGhhbmRoZWxkOiBmYWxzZVxuXG5cdFx0IyBJcyBhIHRhYmxldD8gW0Jvb2xlYW5dXG5cdFx0dGFibGV0OiBmYWxzZVxuXHRcdFxuXHRcdCMgSXMgYSBtb2JpbGU/IFtCb29sZWFuXVxuXHRcdG1vYmlsZTogZmFsc2VcblxuXHRcdCMgSXMgZGVza3RvcD8gU2V0IGFmdGVyIHRoZSBjbGFzcyBkZWZpbml0aW9uIFtCb29sZWFuXVxuXHRcdGRlc2t0b3A6IGZhbHNlXG5cblx0XHQjIElzIGEgdGFibGV0IG9yIG1vYmlsZT8gW0Jvb2xlYW5dXG5cdFx0ZGV2aWNlOiBmYWxzZVxuXG5cdFx0IyBEZWJ1ZyBtb2RlIC0gc2V0IGJ5IGVudiBpbiBpbmRleC5waHBcblx0XHRkZWJ1ZzogZmFsc2VcblxuXHRcdGNzc19jb3Zlcl9zdXBwb3J0ZWQ6IE1vZGVybml6ci5iYWNrZ3JvdW5kc2l6ZVxuXG5cdFx0bWluX3NpemU6XG5cdFx0XHR3OiA5MDBcblx0XHRcdGg6IDQwMFxuXHR9XG5cblx0IyBVc2UgdGhpcyBmbGFnIGlmIHdlcmUgZG9pbmcga2V5ZnJhbWUgYW5pbWF0aW9uc1xuXHQjIG90aGVyd2lzZSBpbXBsZW1lbnQgYSBqcyBmYWxsYmFja1xuXG5cdCMgV2VicCBzdXBwb3J0XG5cdHdlYnA6IGZhbHNlXG5cbnNldHRpbmdzLnRoZW1lID0gXCJkZXNrdG9wXCJcbnNldHRpbmdzLnRocmVzaG9sZF90aGVtZSA9IDkwMFxuXG5cbiMgUmV0aW5hIHN1cHBvcnRlZCBbQm9vbGVhbl1cbnNldHRpbmdzLmJyb3dzZXIucmV0aW5hID0gc2V0dGluZ3MuYnJvd3Nlci5kZXZpY2VfcmF0aW8gaXMgMlxuXG4jIFdlYnAgdGVzdFxuaWYgc2V0dGluZ3MuYnJvd3Nlci5jaHJvbWUgYW5kIHNldHRpbmdzLmJyb3dzZXIudmVyc2lvbiA+PSAzMFxuXHRzZXR0aW5ncy53ZWJwID0gdHJ1ZVxuXG4jIEZsYWdzIGZvciBJRVxuaWYgc2V0dGluZ3MuYnJvd3Nlci5pZCBpcyAnRXhwbG9yZXInIFxuXHRzZXR0aW5ncy5icm93c2VyLmllID0gdHJ1ZVxuXHRpZiBzZXR0aW5ncy5icm93c2VyLnZlcnNpb24gaXMgOFxuXHRcdHNldHRpbmdzLmJyb3dzZXIuaWU4ID0gdHJ1ZVxuXHRpZiBzZXR0aW5ncy5icm93c2VyLnZlcnNpb24gaXMgOVxuXHRcdHNldHRpbmdzLmJyb3dzZXIuaWU5ID0gdHJ1ZVxuXG5cbiMgSWYgaXQncyBhbiBoYW5kaGVsZCBkZXZpY2VcbnNldHRpbmdzLnZpZGVvX2FjdGl2ZSA9IHNldHRpbmdzLmJyb3dzZXIuaWQgaXNudCAnRXhwbG9yZXInXG5cblxuXG5pZiggL0FuZHJvaWR8d2ViT1N8aVBob25lfGlQYWR8aVBvZHxCbGFja0JlcnJ5fElFTW9iaWxlfE9wZXJhIE1pbmkvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpIClcblx0c2V0dGluZ3MuYnJvd3Nlci5oYW5kaGVsZCA9IHRydWVcblxuXHQjIENoZWNrIGlmIGl0J3MgbW9iaWxlIG9yIHRhYmxldCBjYWxjdWxhdGluZyByYXRpbyBhbmQgb3JpZW50YXRpb25cblx0cmF0aW8gPSAkKHdpbmRvdykud2lkdGgoKS8kKHdpbmRvdykuaGVpZ2h0KClcblx0c2V0dGluZ3MuYnJvd3Nlci5vcmllbnRhdGlvbiA9IGlmIHJhdGlvID4gMSB0aGVuIFwibGFuZHNjYXBlXCIgZWxzZSBcInBvcnRyYWl0XCJcblxuXHQjIGNoZWNrIG1heCB3aWR0aCBmb3IgbW9iaWxlIGRldmljZSAobmV4dXMgNyBpbmNsdWRlZClcblx0aWYgJCh3aW5kb3cpLndpZHRoKCkgPCA2MTAgb3IgKHNldHRpbmdzLmJyb3dzZXIub3JpZW50YXRpb24gaXMgXCJsYW5kc2NhcGVcIiBhbmQgcmF0aW8gPiAyLjEwIClcblx0XHRzZXR0aW5ncy5icm93c2VyLm1vYmlsZSA9IHRydWVcblx0XHRzZXR0aW5ncy5icm93c2VyLnRhYmxldCA9IGZhbHNlXG5cdGVsc2Vcblx0XHRzZXR0aW5ncy5icm93c2VyLm1vYmlsZSA9IGZhbHNlXG5cdFx0c2V0dGluZ3MuYnJvd3Nlci50YWJsZXQgPSB0cnVlXG5cbnNldHRpbmdzLmJyb3dzZXIuZGV2aWNlID0gKHNldHRpbmdzLmJyb3dzZXIudGFibGV0IG9yIHNldHRpbmdzLmJyb3dzZXIubW9iaWxlKVxuXG4jIFNldCBkZXNrdG9wIGZsYWdcbmlmIHNldHRpbmdzLmJyb3dzZXIudGFibGV0IGlzIGZhbHNlIGFuZCAgc2V0dGluZ3MuYnJvd3Nlci5tb2JpbGUgaXMgZmFsc2Vcblx0c2V0dGluZ3MuYnJvd3Nlci5kZXNrdG9wID0gdHJ1ZVxuXG5cbnNldHRpbmdzLmJyb3dzZXIud2luZG93c19waG9uZSA9IGZhbHNlXG5pZiBzZXR0aW5ncy5icm93c2VyLm1vYmlsZSBhbmQgc2V0dGluZ3MuYnJvd3Nlci5pZCBpcyAnRXhwbG9yZXInXG5cdHNldHRpbmdzLmJyb3dzZXIud2luZG93c19waG9uZSA9IHRydWVcblxuXG5zZXR0aW5ncy50b3VjaF9kZXZpY2UgPSBzZXR0aW5ncy5icm93c2VyLmhhbmRoZWxkXG5cbiMgUGxhdGZvcm0gc3BlY2lmaWMgZXZlbnRzIG1hcFxuc2V0dGluZ3MuZXZlbnRzX21hcCA9XG5cdCdkb3duJyA6ICdtb3VzZWRvd24nXG5cdCd1cCcgICA6ICdtb3VzZXVwJ1xuXHQnbW92ZScgOiAnbW91c2Vtb3ZlJ1xuXG5pZiBzZXR0aW5ncy5icm93c2VyLmRldmljZVxuXG5cdGlmIHNldHRpbmdzLmJyb3dzZXIud2luZG93c19waG9uZVxuXHRcdHNldHRpbmdzLmV2ZW50c19tYXAgPVxuXHRcdFx0J2Rvd24nIDogJ01TUG9pbnRlckRvd24nXG5cdFx0XHQndXAnICAgOiAnTVNQb2ludGVyVXAnXG5cdFx0XHQnbW92ZScgOiAnTVNQb2ludGVyTW92ZSdcblx0XHRcdFxuXHRlbHNlXG5cdFx0c2V0dGluZ3MuZXZlbnRzX21hcCA9XG5cdFx0XHQnZG93bicgOiAndG91Y2hzdGFydCdcblx0XHRcdCd1cCcgICA6ICd0b3VjaGVuZCdcblx0XHRcdCdtb3ZlJyA6ICd0b3VjaG1vdmUnXG5cblxuXG5cbiMgUGxhdGZvcm0gY2xhc3NcbmlmIHNldHRpbmdzLmJyb3dzZXIuZGVza3RvcFxuXHRwbGF0Zm9ybSA9ICdkZXNrdG9wJ1xuZWxzZSBpZiBzZXR0aW5ncy5icm93c2VyLnRhYmxldFxuXHRwbGF0Zm9ybSA9ICd0YWJsZXQnXG5lbHNlXG5cdHBsYXRmb3JtID0gJ21vYmlsZSdcblxuIyBCcm93c2VyIGNsYXNzIGZvciB0aGUgYm9keVxuc2V0dGluZ3MuYnJvd3Nlcl9jbGFzcyA9IHNldHRpbmdzLmJyb3dzZXIuaWQgKyAnXycgKyBzZXR0aW5ncy5icm93c2VyLnZlcnNpb25cblxuaGFzM2QgPSAtPlxuXHRlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpXG5cdGhhczNkID0gdW5kZWZpbmVkXG5cdHRyYW5zZm9ybXMgPVxuXHRcdHdlYmtpdFRyYW5zZm9ybTogXCItd2Via2l0LXRyYW5zZm9ybVwiXG5cdFx0T1RyYW5zZm9ybTogXCItby10cmFuc2Zvcm1cIlxuXHRcdG1zVHJhbnNmb3JtOiBcIi1tcy10cmFuc2Zvcm1cIlxuXHRcdE1velRyYW5zZm9ybTogXCItbW96LXRyYW5zZm9ybVwiXG5cdFx0dHJhbnNmb3JtOiBcInRyYW5zZm9ybVwiXG5cblxuXHQjIEFkZCBpdCB0byB0aGUgYm9keSB0byBnZXQgdGhlIGNvbXB1dGVkIHN0eWxlLlxuXHRkb2N1bWVudC5ib2R5Lmluc2VydEJlZm9yZSBlbCwgbnVsbFxuXHRmb3IgdCBvZiB0cmFuc2Zvcm1zXG5cdFx0aWYgZWwuc3R5bGVbdF0gaXNudCBgdW5kZWZpbmVkYFxuXHRcdFx0ZWwuc3R5bGVbdF0gPSBcInRyYW5zbGF0ZTNkKDFweCwxcHgsMXB4KVwiXG5cdFx0XHRoYXMzZCA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsKS5nZXRQcm9wZXJ0eVZhbHVlKHRyYW5zZm9ybXNbdF0pXG5cdGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQgZWxcblx0aGFzM2QgaXNudCBgdW5kZWZpbmVkYCBhbmQgaGFzM2QubGVuZ3RoID4gMCBhbmQgaGFzM2QgaXNudCBcIm5vbmVcIlxuXG5cbiMgc2V0dGluZ3MuaGFzM2QgPSBoYXMzZCgpXG5cblxuXG5zZXR0aW5ncy5iaW5kID0gKGJvZHkpLT5cblx0a2xhc3NlcyA9IFtdXG5cdGtsYXNzZXMucHVzaCBzZXR0aW5ncy5icm93c2VyX2NsYXNzXG5cdGtsYXNzZXMucHVzaCBzZXR0aW5ncy5icm93c2VyLk9TLnJlcGxhY2UoICcvJywgJ18nIClcblx0a2xhc3Nlcy5wdXNoIHNldHRpbmdzLmJyb3dzZXIuaWRcblxuXHRpZiBzZXR0aW5ncy50b3VjaF9kZXZpY2Vcblx0XHRrbGFzc2VzLnB1c2ggXCJ0b3VjaF9kZXZpY2VcIlxuXHRlbHNlXG5cdFx0a2xhc3Nlcy5wdXNoIFwibm9fdG91Y2hfZGV2aWNlXCJcblxuXHRpZiBzZXR0aW5ncy5icm93c2VyLmNzc19jb3Zlcl9zdXBwb3J0ZWRcblx0XHRrbGFzc2VzLnB1c2ggXCJjc3NfY292ZXJfc3VwcG9ydGVkXCJcblxuXHRib2R5LmFkZENsYXNzIGtsYXNzZXMuam9pbiggXCIgXCIgKS50b0xvd2VyQ2FzZSgpXG5cblx0c2V0dGluZ3MuaGVhZGVyX2hlaWdodCA9ICQoICdoZWFkZXInICkuaGVpZ2h0KClcblx0IyBib2R5LmNzcyBcblx0IyBcdCdtaW4td2lkdGgnICA6IHNldHRpbmdzLmJyb3dzZXIubWluX3NpemUud1xuXHQjIFx0J21pbi1oZWlnaHQnIDogc2V0dGluZ3MuYnJvd3Nlci5taW5fc2l6ZS5oXG5cblxuXG4jIFRFTVBcblxuIyBzZXR0aW5ncy52aWRlb19hY3RpdmUgPSBmYWxzZVxuIyBzZXR0aW5ncy5jc3NfY292ZXJfc3VwcG9ydGVkID0gZmFsc2VcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHNldHRpbmdzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsMkNBQUE7O0FBQUEsQ0FBQSxFQUFnQixJQUFBLE1BQWhCLE1BQWdCOztBQUVoQixDQUZBLEVBS0MsS0FIRDtDQUdDLENBQUEsS0FBQTtDQUFTLENBR1IsRUFBQSxHQUhRLE1BR1M7Q0FIVCxDQU1DLEVBQVQsR0FBQSxNQUFzQjtDQU5kLENBU1IsRUFBQSxTQUFpQjtBQUdpRCxDQVoxRCxDQVlDLENBQXdELENBQWpFLEVBQUEsQ0FBUyxDQUFBLENBQVMsRUFBVDtDQVpELENBZUUsRUFBVixHQUFBLEVBQW1DLENBQWY7Q0FmWixDQWtCSCxDQUFMLENBQUEsQ0FsQlE7Q0FBQSxDQXFCTSxFQUFkLEVBQW9CLE1BQXBCLElBckJRO0NBQUEsQ0F3QkUsRUFBVixDQXhCUSxHQXdCUjtDQXhCUSxDQTJCQSxFQUFSLENBM0JRLENBMkJSO0NBM0JRLENBOEJBLEVBQVIsQ0E5QlEsQ0E4QlI7Q0E5QlEsQ0FpQ0MsRUFBVCxDQWpDUSxFQWlDUjtDQWpDUSxDQW9DQSxFQUFSLENBcENRLENBb0NSO0NBcENRLENBdUNELEVBQVAsQ0FBQTtDQXZDUSxDQXlDYSxFQUFyQixLQUE4QixLQXpDdEIsS0F5Q1I7Q0F6Q1EsQ0E0Q1AsRUFERCxJQUFBO0NBQ0MsQ0FBRyxDQUFILEdBQUE7Q0FBQSxDQUNHLENBREgsR0FDQTtNQTdDTztJQUFUO0NBQUEsQ0FvREEsRUFBQSxDQXBEQTtDQUxELENBQUE7O0FBMkRBLENBM0RBLEVBMkRpQixFQUFqQixHQUFRLENBM0RSOztBQTREQSxDQTVEQSxFQTREMkIsS0FBbkIsT0FBUjs7QUFJQSxDQWhFQSxFQWdFMEIsRUFBaUMsQ0FBM0QsQ0FBZ0IsQ0FBUixJQUFrQjs7QUFHMUIsQ0FBQSxDQUFBLEVBQUcsRUFBQSxDQUFnQixDQUFSO0NBQ1YsQ0FBQSxDQUFnQixDQUFoQixJQUFRO0VBcEVUOztBQXVFQSxDQUFBLENBQUcsRUFBQSxDQUF1QixFQUFQLENBQVIsRUFBWDtDQUNDLENBQUEsQ0FBc0IsQ0FBdEIsR0FBZ0IsQ0FBUjtDQUNSLENBQUEsRUFBRyxDQUE0QixFQUFaLENBQVI7Q0FDVixFQUFBLENBQUEsR0FBZ0IsQ0FBUjtJQUZUO0NBR0EsQ0FBQSxFQUFHLENBQTRCLEVBQVosQ0FBUjtDQUNWLEVBQUEsQ0FBQSxHQUFnQixDQUFSO0lBTFY7RUF2RUE7O0FBZ0ZBLENBaEZBLENBZ0Z3QixDQUFBLEVBQXlCLEVBQVQsQ0FBaEMsRUFoRlIsRUFnRkE7O0FBSUEsQ0FBQSxHQUFJLEtBQStFLHVEQUFmO0NBQ25FLENBQUEsQ0FBNEIsQ0FBNUIsR0FBZ0IsQ0FBUjtDQUFSLENBR0EsQ0FBUSxFQUFSLENBQVE7Q0FIUixDQUlBLENBQWtDLEVBQUEsRUFBbEIsQ0FBUixFQUpSLENBSUE7Q0FHQSxDQUFBLENBQXVCLENBQXBCLENBQUEsQ0FBQSxDQUE0QyxDQUFSLEdBQVI7Q0FDOUIsRUFBMEIsQ0FBMUIsRUFBQSxDQUFnQixDQUFSO0NBQVIsRUFDMEIsQ0FBMUIsQ0FEQSxDQUNBLENBQWdCLENBQVI7SUFGVCxFQUFBO0NBSUMsRUFBMEIsQ0FBMUIsQ0FBQSxDQUFBLENBQWdCLENBQVI7Q0FBUixFQUMwQixDQUExQixFQUFBLENBQWdCLENBQVI7SUFiVjtFQXBGQTs7QUFtR0EsQ0FuR0EsRUFtRzJCLENBQTJCLEVBQXRELENBQWdCLENBQVI7O0FBR1IsQ0FBQSxHQUFHLENBQTJCLENBQTNCLENBQWdCLENBQVI7Q0FDVixDQUFBLENBQTJCLENBQTNCLEdBQWdCLENBQVI7RUF2R1Q7O0FBMEdBLENBMUdBLEVBMEdpQyxFQTFHakMsRUEwR2dCLENBQVIsS0FBUjs7QUFDQSxDQUFBLENBQStCLEVBQTVCLENBQW1ELENBQW5ELENBQWdCLENBQVIsRUFBWDtDQUNDLENBQUEsQ0FBaUMsQ0FBakMsR0FBZ0IsQ0FBUixLQUFSO0VBNUdEOztBQStHQSxDQS9HQSxFQStHd0IsSUFBZ0IsQ0FBaEMsSUFBUjs7QUFHQSxDQWxIQSxFQW1IQyxLQURPLEVBQVI7Q0FDQyxDQUFBLElBQUEsS0FBQTtDQUFBLENBQ0EsRUFBQSxLQURBO0NBQUEsQ0FFQSxJQUFBLEtBRkE7Q0FuSEQsQ0FBQTs7QUF1SEEsQ0FBQSxHQUFHLEVBQUgsQ0FBbUIsQ0FBUjtDQUVWLENBQUEsRUFBRyxHQUFnQixDQUFSLEtBQVg7Q0FDQyxFQUNDLENBREQsSUFBUSxFQUFSO0NBQ0MsQ0FBUyxJQUFULFNBQUE7Q0FBQSxDQUNTLEVBQVQsRUFBQSxPQURBO0NBQUEsQ0FFUyxJQUFULFNBRkE7Q0FGRixLQUNDO0lBREQsRUFBQTtDQU9DLEVBQ0MsQ0FERCxJQUFRLEVBQVI7Q0FDQyxDQUFTLElBQVQsTUFBQTtDQUFBLENBQ1MsRUFBVCxFQUFBLElBREE7Q0FBQSxDQUVTLElBQVQsS0FGQTtDQVJGLEtBT0M7SUFURjtFQXZIQTs7QUF5SUEsQ0FBQSxHQUFHLEdBQWdCLENBQVI7Q0FDVixDQUFBLENBQVcsS0FBWCxDQUFBO0NBQ2dCLENBRmpCLEVBRVEsRUFGUixDQUV3QixDQUFSO0NBQ2YsQ0FBQSxDQUFXLEtBQVg7RUFIRCxJQUFBO0NBS0MsQ0FBQSxDQUFXLEtBQVg7RUE5SUQ7O0FBaUpBLENBakpBLENBaUp5QixDQUFBLElBQWdCLENBQWpDLEtBQVI7O0FBRUEsQ0FuSkEsRUFtSlEsRUFBUixJQUFRO0NBQ1AsS0FBQSxXQUFBO0NBQUEsQ0FBQSxDQUFLLEtBQVEsS0FBUjtDQUFMLENBQ0EsQ0FBUSxFQUFSLENBREE7Q0FBQSxDQUVBLENBQ0MsT0FERDtDQUNDLENBQWlCLEVBQWpCLFdBQUEsSUFBQTtDQUFBLENBQ1ksRUFBWixNQUFBLElBREE7Q0FBQSxDQUVhLEVBQWIsT0FBQSxJQUZBO0NBQUEsQ0FHYyxFQUFkLFFBQUEsSUFIQTtDQUFBLENBSVcsRUFBWCxLQUFBLEVBSkE7Q0FIRCxHQUFBO0NBQUEsQ0FXQSxFQUFhLElBQUwsSUFBUjtBQUNBLENBQUEsRUFBQSxJQUFBLFFBQUE7Q0FDQyxDQUFLLEVBQUwsQ0FBWSxJQUFaO0NBQ0MsQ0FBRSxDQUFZLEVBQUwsQ0FBVCxvQkFBQTtDQUFBLENBQ1EsQ0FBQSxFQUFSLENBQUEsSUFBZ0UsTUFBeEQ7TUFIVjtDQUFBLEVBWkE7Q0FBQSxDQWdCQSxFQUFhLElBQUwsR0FBUjtDQUNpQyxFQUFTLENBQWYsQ0FBM0IsQ0FBMkIsR0FBM0I7Q0FsQk87O0FBeUJSLENBNUtBLEVBNEtnQixDQUFoQixJQUFRLENBQVM7Q0FDaEIsS0FBQSxDQUFBO0NBQUEsQ0FBQSxDQUFVLElBQVY7Q0FBQSxDQUNBLEVBQUEsR0FBTyxDQUFjLEtBQXJCO0NBREEsQ0FFQSxDQUFhLENBQWIsR0FBTyxDQUFjO0NBRnJCLENBR0EsRUFBQSxHQUFPLENBQWM7Q0FFckIsQ0FBQSxFQUFHLElBQVEsSUFBWDtDQUNDLEdBQUEsR0FBTyxPQUFQO0lBREQsRUFBQTtDQUdDLEdBQUEsR0FBTyxVQUFQO0lBUkQ7Q0FVQSxDQUFBLEVBQUcsR0FBZ0IsQ0FBUixXQUFYO0NBQ0MsR0FBQSxHQUFPLGNBQVA7SUFYRDtDQUFBLENBYUEsQ0FBYyxDQUFWLEdBQWlCLENBQXJCLEdBQWM7Q0FFTCxFQUFnQixHQUFBLEVBQWpCLENBQVIsSUFBQTtDQWhCZTs7QUE2QmhCLENBek1BLEVBeU1pQixHQUFYLENBQU4sQ0F6TUEifX0seyJvZmZzZXQiOnsibGluZSI6NTU4NCwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3V0aWxzL3dpbmRvdy5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiaGFwcGVucyA9IHJlcXVpcmUgJ2hhcHBlbnMnXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgV2luZG93XG5cdG9iajogbnVsbFxuXHR3OiAwXG5cdGg6IDBcblx0Y29uc3RydWN0b3I6ICggKSAtPlxuXHRcdGhhcHBlbnMgQFxuXHRcdEBvYmogPSAkIHdpbmRvd1xuXHRcdEBvYmoub24gJ3Jlc2l6ZScsIEBvbl9yZXNpemVcblx0XHRkZWxheSAxMDAsIEBvbl9yZXNpemVcblxuXHRvbl9yZXNpemU6ICggKSA9PlxuXHRcdEB3ID0gQG9iai53aWR0aCgpXG5cdFx0QGggPSBAb2JqLmhlaWdodCgpXG5cblx0XHRAZW1pdCAncmVzaXplJyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFdBQUE7R0FBQSwrRUFBQTs7QUFBQSxDQUFBLEVBQVUsSUFBVixFQUFVOztBQUVWLENBRkEsRUFFdUIsR0FBakIsQ0FBTjtDQUNDLEVBQUEsQ0FBQTs7Q0FBQSxFQUNHOztDQURILEVBRUc7O0NBQ1UsQ0FBQSxDQUFBLGFBQUE7Q0FDWiw0Q0FBQTtDQUFBLEdBQUEsR0FBQTtDQUFBLEVBQ0EsQ0FBQSxFQUFPO0NBRFAsQ0FFQSxDQUFJLENBQUosSUFBQSxDQUFBO0NBRkEsQ0FHVyxDQUFYLENBQUEsQ0FBQSxJQUFBO0NBUEQsRUFHYTs7Q0FIYixFQVNXLE1BQVg7Q0FDQyxFQUFLLENBQUwsQ0FBSztDQUFMLEVBQ0ssQ0FBTCxFQUFLO0NBRUosR0FBQSxJQUFELEdBQUE7Q0FiRCxFQVNXOztDQVRYOztDQUhEIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjU2MTYsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9jb21wb25lbnRzL2Z1bGxzY3JlZW4uY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gY2xhc3MgRnVsbHNjcmVlblxuXHRjb25zdHJ1Y3RvcjogKCBAZG9tICkgLT5cblx0XHRAZG9tLmFkZENsYXNzICdmdWxsc2NyZWVuJ1xuXHRcdGFwcC53aW5kb3cub24gJ3Jlc2l6ZScsIEBvbl9yZXNpemVcblx0XHRkbyBAb25fcmVzaXplXG5cblx0b25fcmVzaXplOiAoICkgPT5cblx0XHRAZG9tLmNzc1xuIFx0XHRcdCd3aWR0aCcgOiAnMTAwJSdcbiBcdFx0XHQnaGVpZ2h0JyA6IGFwcC53aW5kb3cuaCAtIGFwcC5zZXR0aW5ncy5oZWFkZXJfaGVpZ2h0XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxNQUFBO0dBQUEsK0VBQUE7O0FBQUEsQ0FBQSxFQUF1QixHQUFqQixDQUFOO0NBQ2MsQ0FBQSxDQUFBLGlCQUFHO0NBQ2YsRUFEZSxDQUFEO0NBQ2QsNENBQUE7Q0FBQSxFQUFJLENBQUosSUFBQSxJQUFBO0NBQUEsQ0FDQSxDQUFHLENBQUgsRUFBVSxFQUFWLENBQUE7Q0FEQSxHQUVHLEtBQUg7Q0FIRCxFQUFhOztDQUFiLEVBS1csTUFBWDtDQUNFLEVBQUcsQ0FBSCxPQUFEO0NBQ0UsQ0FBVSxJQUFWLENBQUE7Q0FBQSxDQUNXLENBQUcsR0FBZCxFQUFBLEtBREE7Q0FGUSxLQUNWO0NBTkQsRUFLVzs7Q0FMWDs7Q0FERCJ9fSx7Im9mZnNldCI6eyJsaW5lIjo1NjQxLCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvY29tcG9uZW50cy9ob3Zlci5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiaGFwcGVucyA9IHJlcXVpcmUgJ2hhcHBlbnMnXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEhvdmVyXG5cdGNvbnN0cnVjdG9yOiAoIEBkb20gKSAtPlxuXHRcdHJldHVybiBpZiBhcHAuc2V0dGluZ3MudG91Y2hfZGV2aWNlXG5cblx0XHRoYXBwZW5zIEBcblx0XHRcblx0XHRAZG9tLm9uICdtb3VzZW92ZXInLCBAb25fbW91c2Vfb3ZlclxuXHRcdEBkb20ub24gJ21vdXNlbGVhdmUnLCBAb25fbW91c2VfbGVhdmVcblxuXHRcdEBkb20uYWRkQ2xhc3MgJ2hvdmVyX29iamVjdCdcblxuXHRvbl9tb3VzZV9vdmVyOiAoICkgPT5cblx0XHRAZG9tLmFkZENsYXNzICdob3ZlcmVkJ1xuXG5cdG9uX21vdXNlX2xlYXZlOiAoICkgPT5cblx0XHRAZG9tLnJlbW92ZUNsYXNzICdob3ZlcmVkJyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFVBQUE7R0FBQSwrRUFBQTs7QUFBQSxDQUFBLEVBQVUsSUFBVixFQUFVOztBQUNWLENBREEsRUFDdUIsR0FBakIsQ0FBTjtDQUNjLENBQUEsQ0FBQSxZQUFHO0NBQ2YsRUFEZSxDQUFEO0NBQ2Qsc0RBQUE7Q0FBQSxvREFBQTtDQUFBLEVBQWEsQ0FBYixJQUFzQixJQUF0QjtDQUFBLFdBQUE7TUFBQTtDQUFBLEdBRUEsR0FBQTtDQUZBLENBSUEsQ0FBSSxDQUFKLE9BQUEsRUFBQTtDQUpBLENBS0EsQ0FBSSxDQUFKLFFBQUEsRUFBQTtDQUxBLEVBT0ksQ0FBSixJQUFBLE1BQUE7Q0FSRCxFQUFhOztDQUFiLEVBVWUsTUFBQSxJQUFmO0NBQ0UsRUFBRyxDQUFILElBQUQsQ0FBQSxFQUFBO0NBWEQsRUFVZTs7Q0FWZixFQWFnQixNQUFBLEtBQWhCO0NBQ0UsRUFBRyxDQUFILEtBQUQsRUFBQTtDQWRELEVBYWdCOztDQWJoQjs7Q0FGRCJ9fSx7Im9mZnNldCI6eyJsaW5lIjo1Njc0LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvY29tcG9uZW50cy9ob3Zlcl90cmlnZ2VyLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEhvdmVyVHJpZ2dlclxuXHRvcGVuZWQ6IGZhbHNlXG5cblx0Y29uc3RydWN0b3I6ICggQGRvbSApIC0+XG5cdFx0QHRhcmdldCA9ICQgQGRvbS5kYXRhICd0YXJnZXQnXG5cblx0XHRpZiBAdGFyZ2V0Lmxlbmd0aCA8PSAwXG5cdFx0XHRsb2cgXCJbSG92ZXJUcmlnZ2VyXSBlcnJvci4gdGFyZ2V0IG5vdCBmb3VuZFwiLCBAZG9tLmRhdGEoICd0YXJnZXQnIClcblx0XHRcdHJldHVyblxuXG5cdFx0aWYgYXBwLnNldHRpbmdzLnRvdWNoX2RldmljZVxuXHRcdFx0QGRvbS5vbiAnY2xpY2snLCBAdG9nZ2xlXG5cdFx0XHQkKCdodG1sLGJvZHknKS5vbiAnY2xpY2snLCBAb25fbW91c2VfbGVhdmVcblx0XHRlbHNlXG5cdFx0XHRAZG9tLm9uICdtb3VzZW92ZXInLCBAb25fbW91c2Vfb3ZlclxuXHRcdFx0QHRhcmdldC5vbiAnbW91c2VsZWF2ZScsIEBvbl9tb3VzZV9sZWF2ZVxuXG5cdHRvZ2dsZTogKCBlICkgPT5cblx0XHRpZiBAb3BlbmVkXG5cdFx0XHRkbyBAb25fbW91c2VfbGVhdmVcblx0XHRlbHNlXG5cdFx0XHRkbyBAb25fbW91c2Vfb3ZlclxuXG5cdFx0ZS5zdG9wUHJvcGFnYXRpb24oKVxuXG5cdG9uX21vdXNlX292ZXI6ICggKSA9PlxuXHRcdHJldHVybiBpZiBAb3BlbmVkXG5cdFx0QG9wZW5lZCA9IHRydWVcblxuXHRcdEBkb20uYWRkQ2xhc3MgXCJob3ZlcmVkXCJcblx0XHRAdGFyZ2V0LmFkZENsYXNzIFwiaG92ZXJlZFwiXG5cblx0b25fbW91c2VfbGVhdmU6ICggKSA9PlxuXHRcdHJldHVybiBpZiBub3QgQG9wZW5lZFxuXHRcdEBvcGVuZWQgPSBmYWxzZVxuXG5cdFx0QGRvbS5yZW1vdmVDbGFzcyBcImhvdmVyZWRcIlxuXHRcdEB0YXJnZXQucmVtb3ZlQ2xhc3MgXCJob3ZlcmVkXCJcblxuXG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxRQUFBO0dBQUEsK0VBQUE7O0FBQUEsQ0FBQSxFQUF1QixHQUFqQixDQUFOO0NBQ0MsRUFBUSxFQUFSLENBQUE7O0NBRWEsQ0FBQSxDQUFBLG1CQUFHO0NBQ2YsRUFEZSxDQUFEO0NBQ2Qsc0RBQUE7Q0FBQSxvREFBQTtDQUFBLHNDQUFBO0NBQUEsRUFBVSxDQUFWLEVBQUEsRUFBWTtDQUVaLEdBQUEsRUFBVTtDQUNULENBQThDLENBQTlDLENBQStDLEVBQS9DLEVBQThDLGdDQUE5QztDQUNBLFdBQUE7TUFKRDtDQU1BLEVBQU0sQ0FBTixJQUFlLElBQWY7Q0FDQyxDQUFBLENBQUksQ0FBSCxFQUFELENBQUE7Q0FBQSxDQUNBLEVBQTRCLEVBQTVCLENBQUEsSUFBQSxHQUFBO01BRkQ7Q0FJQyxDQUFBLENBQUksQ0FBSCxFQUFELEtBQUEsRUFBQTtDQUFBLENBQ0EsRUFBQyxFQUFELE1BQUEsRUFBQTtNQVpXO0NBRmIsRUFFYTs7Q0FGYixFQWdCUSxHQUFSLEdBQVU7Q0FDVCxHQUFBLEVBQUE7Q0FDQyxHQUFJLEVBQUQsUUFBSDtNQUREO0NBR0MsR0FBSSxFQUFELE9BQUg7TUFIRDtDQUtDLFVBQUQsSUFBQTtDQXRCRCxFQWdCUTs7Q0FoQlIsRUF3QmUsTUFBQSxJQUFmO0NBQ0MsR0FBQSxFQUFBO0NBQUEsV0FBQTtNQUFBO0NBQUEsRUFDVSxDQUFWLEVBQUE7Q0FEQSxFQUdJLENBQUosSUFBQSxDQUFBO0NBQ0MsR0FBQSxFQUFNLEVBQVAsQ0FBQSxFQUFBO0NBN0JELEVBd0JlOztDQXhCZixFQStCZ0IsTUFBQSxLQUFoQjtBQUNlLENBQWQsR0FBQSxFQUFBO0NBQUEsV0FBQTtNQUFBO0NBQUEsRUFDVSxDQUFWLENBREEsQ0FDQTtDQURBLEVBR0ksQ0FBSixLQUFBLEVBQUE7Q0FDQyxHQUFBLEVBQU0sR0FBUCxFQUFBO0NBcENELEVBK0JnQjs7Q0EvQmhCOztDQUREIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjU3MzIsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9jb21wb25lbnRzL21vZGFsLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IGNsYXNzIE1vZGFsXG5cdG9wZW5lZDogZmFsc2Vcblx0Y29uc3RydWN0b3I6ICggQGRvbSApIC0+XG5cdFx0QG92ZXJsYXkgPSAkICcubWRfb3ZlcmxheSdcblxuXG5cdG9wZW46ICggKSAtPlxuXHRcdHJldHVybiBpZiBAb3BlbmVkXG5cdFx0QG9wZW5lZCA9IHRydWVcblxuXHRcdEBkb20uYWRkQ2xhc3MgJ21kX3Nob3cnXG5cblx0XHRAb3ZlcmxheS5vZmYoICdjbGljaycgKS5vbiggJ2NsaWNrJywgQGNsb3NlIClcblxuXHRjbG9zZTogKCApID0+XG5cdFx0cmV0dXJuIGlmIG5vdCBAb3BlbmVkXG5cdFx0QG9wZW5lZCA9IGZhbHNlXG5cblx0XHRAZG9tLnJlbW92ZUNsYXNzICdtZF9zaG93J1x0XHQiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxDQUFBO0dBQUEsK0VBQUE7O0FBQUEsQ0FBQSxFQUF1QixHQUFqQixDQUFOO0NBQ0MsRUFBUSxFQUFSLENBQUE7O0NBQ2EsQ0FBQSxDQUFBLFlBQUc7Q0FDZixFQURlLENBQUQ7Q0FDZCxvQ0FBQTtDQUFBLEVBQVcsQ0FBWCxHQUFBLE1BQVc7Q0FGWixFQUNhOztDQURiLEVBS00sQ0FBTixLQUFNO0NBQ0wsR0FBQSxFQUFBO0NBQUEsV0FBQTtNQUFBO0NBQUEsRUFDVSxDQUFWLEVBQUE7Q0FEQSxFQUdJLENBQUosSUFBQSxDQUFBO0NBRUMsQ0FBRCxDQUFBLENBQUMsQ0FBRCxFQUFRLElBQVI7Q0FYRCxFQUtNOztDQUxOLEVBYU8sRUFBUCxJQUFPO0FBQ1EsQ0FBZCxHQUFBLEVBQUE7Q0FBQSxXQUFBO01BQUE7Q0FBQSxFQUNVLENBQVYsQ0FEQSxDQUNBO0NBRUMsRUFBRyxDQUFILEtBQUQsRUFBQTtDQWpCRCxFQWFPOztDQWJQOztDQUREIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjU3NjcsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9jb21wb25lbnRzL21vZGFsX2hhbmRsZXIuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gY2xhc3MgTW9kYWxIYW5kbGVyXG5cdGNvbnN0cnVjdG9yOiAoIEBkb20gKSAtPlxuXHRcdHZpZXcub25jZSAnYmluZGVkJywgQG9uX3JlYWR5XG5cblx0b25fcmVhZHk6ICggKSA9PlxuXHRcdG1vZGFsX3RhcmdldCA9IHZpZXcuZ2V0X2J5X2RvbSBAZG9tLmRhdGEoICdtb2RhbCcgKVxuXHRcdEBkb20ub24gJ2NsaWNrJywgLT4gbW9kYWxfdGFyZ2V0Lm9wZW4oKSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFFBQUE7R0FBQSwrRUFBQTs7QUFBQSxDQUFBLEVBQXVCLEdBQWpCLENBQU47Q0FDYyxDQUFBLENBQUEsbUJBQUc7Q0FDZixFQURlLENBQUQ7Q0FDZCwwQ0FBQTtDQUFBLENBQW9CLEVBQXBCLElBQUE7Q0FERCxFQUFhOztDQUFiLEVBR1UsS0FBVixDQUFVO0NBQ1QsT0FBQSxJQUFBO0NBQUEsRUFBZSxDQUFmLEdBQStCLEdBQWhCLEVBQWY7Q0FDQyxDQUFELENBQUksQ0FBSCxHQUFELEVBQWlCLEVBQWpCO0NBQWlDLEdBQWIsUUFBWSxDQUFaO0NBQXBCLElBQWlCO0NBTGxCLEVBR1U7O0NBSFY7O0NBREQifX0seyJvZmZzZXQiOnsibGluZSI6NTc5MSwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2NvbXBvbmVudHMvcG9wdXBfaGFuZGxlci5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBQb3B1cEhhbmRsZXJcblx0Y29uc3RydWN0b3I6ICggQGRvbSApIC0+XG5cdFx0dXJsICAgXHQ9IEBkb20uZGF0YSAndXJsJ1xuXHRcdHRpdGxlICBcdD0gQGRvbS5kYXRhICd0aXRsZSdcblx0XHR3ICBcdFx0PSBAZG9tLmRhdGEgJ3cnXG5cdFx0aCAgXHRcdD0gQGRvbS5kYXRhICdoJ1xuXG5cdFx0QGRvbS5vbiAnY2xpY2snLCAtPlxuXHRcdFx0bGVmdCA9IChhcHAud2luZG93LncvMiktKHcvMik7XG5cdFx0XHR0b3AgPSAoYXBwLndpbmRvdy5oLzIpLShoLzIpO1xuXHRcdFx0cmV0dXJuIHdpbmRvdy5vcGVuKHVybCwgdGl0bGUsICd0b29sYmFyPW5vLCBsb2NhdGlvbj1ubywgZGlyZWN0b3JpZXM9bm8sIHN0YXR1cz1ubywgbWVudWJhcj1ubywgc2Nyb2xsYmFycz1ubywgcmVzaXphYmxlPW5vLCBjb3B5aGlzdG9yeT1ubywgd2lkdGg9Jyt3KycsIGhlaWdodD0nK2grJywgdG9wPScrdG9wKycsIGxlZnQ9JytsZWZ0KTtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFFBQUE7O0FBQUEsQ0FBQSxFQUF1QixHQUFqQixDQUFOO0NBQ2MsQ0FBQSxDQUFBLG1CQUFHO0NBQ2YsT0FBQSxRQUFBO0NBQUEsRUFEZSxDQUFEO0NBQ2QsRUFBQSxDQUFBLENBQVM7Q0FBVCxFQUNVLENBQVYsQ0FBQSxFQUFVO0NBRFYsRUFFTyxDQUFQO0NBRkEsRUFHTyxDQUFQO0NBSEEsQ0FLQSxDQUFJLENBQUosR0FBQSxFQUFpQjtDQUNoQixRQUFBLENBQUE7Q0FBQSxFQUFPLENBQVAsRUFBQTtDQUFBLEVBQ0EsR0FBQTtDQUNBLENBQXdCLENBQWpCLENBQUEsQ0FBQSxDQUFNLEVBQWtCLENBQUEsRUFBQSxFQUF4Qix3R0FBd0I7Q0FIaEMsSUFBaUI7Q0FObEIsRUFBYTs7Q0FBYjs7Q0FERCJ9fSx7Im9mZnNldCI6eyJsaW5lIjo1ODE1LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3MvY29tcG9uZW50cy9zY3JvbGxfaGFuZGxlci5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBTY3JvbGxIYW5kbGVyXG5cdGNvbnN0cnVjdG9yOiAoIEBkb20gKSAtPlxuXG5cdFx0dGFyZ2V0ID0gJCBAZG9tLmRhdGEoICd0YXJnZXQnIClcblx0XHRyZXR1cm4gaWYgdGFyZ2V0Lmxlbmd0aCA8PSAwXG5cblx0XHRAZG9tLmFkZENsYXNzICdzY3JvbGxfaGFuZGxlcidcblx0XHRcblx0XHRAZG9tLm9uICdjbGljaycsIC0+XG5cdFx0XHRtb3Zlci5zY3JvbGxfdG8gdGFyZ2V0Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsU0FBQTs7QUFBQSxDQUFBLEVBQXVCLEdBQWpCLENBQU47Q0FDYyxDQUFBLENBQUEsb0JBQUc7Q0FFZixLQUFBLEVBQUE7Q0FBQSxFQUZlLENBQUQ7Q0FFZCxFQUFTLENBQVQsRUFBQSxFQUFXO0NBQ1gsR0FBQSxFQUFnQjtDQUFoQixXQUFBO01BREE7Q0FBQSxFQUdJLENBQUosSUFBQSxRQUFBO0NBSEEsQ0FLQSxDQUFJLENBQUosR0FBQSxFQUFpQjtDQUNWLElBQUQsQ0FBTCxHQUFBLElBQUE7Q0FERCxJQUFpQjtDQVBsQixFQUFhOztDQUFiOztDQUREIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjU4MzcsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9leHBsb3JlLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEV4cGxvcmVcblx0Y29uc3RydWN0b3I6ICggQGRvbSApIC0+Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsR0FBQTs7QUFBQSxDQUFBLEVBQXVCLEdBQWpCLENBQU47Q0FDYyxDQUFBLENBQUEsY0FBRztDQUFPLEVBQVAsQ0FBRDtDQUFmLEVBQWE7O0NBQWI7O0NBREQifX0seyJvZmZzZXQiOnsibGluZSI6NTg1MCwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2hlYWRlci5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBIZWFkZXJcblx0Y29uc3RydWN0b3I6ICggQGRvbSApIC0+XG5cdFx0YXBwLm9uICd1c2VyOmxvZ2dlZCcsIEBvbl91c2VyX2xvZ2dlZFxuXG5cblx0b25fdXNlcl9sb2dnZWQ6ICggZGF0YSApID0+XG5cdFx0dG1wbCA9IHJlcXVpcmUgJ3RlbXBsYXRlcy9zaGFyZWQvaGVhZGVyX3VzZXJfbG9nZ2VkJ1xuXHRcdGh0bWwgPSB0bXBsIGRhdGFcblx0XHRsb2cgJ1tIZWFkZXJdIG9uX3VzZXJfbG9nZ2VkJywgZGF0YSwgaHRtbFxuXHRcdEBkb20uZmluZCggJy51c2VyX2xvZ2dlZCcgKS5lbXB0eSgpLmFwcGVuZCBodG1sXG5cblxuXG5cdG9uX3VzZXJfdW5sb2dnZWQ6ICggZGF0YSApID0+XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxFQUFBO0dBQUEsK0VBQUE7O0FBQUEsQ0FBQSxFQUF1QixHQUFqQixDQUFOO0NBQ2MsQ0FBQSxDQUFBLGFBQUc7Q0FDZixFQURlLENBQUQ7Q0FDZCwwREFBQTtDQUFBLHNEQUFBO0NBQUEsQ0FBQSxDQUFHLENBQUgsU0FBQSxDQUFBO0NBREQsRUFBYTs7Q0FBYixFQUlnQixDQUFBLEtBQUUsS0FBbEI7Q0FDQyxPQUFBLEVBQUE7Q0FBQSxFQUFPLENBQVAsR0FBTyw4QkFBQTtDQUFQLEVBQ08sQ0FBUDtDQURBLENBRStCLENBQS9CLENBQUEscUJBQUE7Q0FDQyxFQUFHLENBQUgsQ0FBRCxDQUFBLEtBQUEsR0FBQTtDQVJELEVBSWdCOztDQUpoQixFQVlrQixDQUFBLEtBQUUsT0FBcEI7O0NBWkE7O0NBREQifX0seyJvZmZzZXQiOnsibGluZSI6NTg3NywiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9mcm9udGVuZC9zY3JpcHRzL3ZpZXdzL2xvYWRpbmcuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIm5hdmlnYXRpb24gICAgICAgIFx0PSByZXF1aXJlICdhcHAvY29udHJvbGxlcnMvbmF2aWdhdGlvbidcbk9wYWNpdHkgXHRcdFx0PSByZXF1aXJlICdhcHAvdXRpbHMvb3BhY2l0eSdcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBMb2FkaW5nXG5cdGNvbnN0cnVjdG9yOiAoIEBkb20gKSAtPlxuXHRcdG5hdmlnYXRpb24ub24gJ2JlZm9yZV9kZXN0cm95JywgPT5cblx0XHRcdGFwcC5ib2R5LmFkZENsYXNzICdsb2FkaW5nJ1xuXHRcdFx0T3BhY2l0eS5zaG93IEBkb21cblxuXHRcdG5hdmlnYXRpb24ub24gJ2FmdGVyX3JlbmRlcicsID0+IFxuXHRcdFx0YXBwLmJvZHkucmVtb3ZlQ2xhc3MgJ2xvYWRpbmcnXG5cdFx0XHRPcGFjaXR5LmhpZGUgQGRvbSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLHdCQUFBOztBQUFBLENBQUEsRUFBcUIsSUFBQSxHQUFyQixrQkFBcUI7O0FBQ3JCLENBREEsRUFDYSxJQUFiLFlBQWE7O0FBRWIsQ0FIQSxFQUd1QixHQUFqQixDQUFOO0NBQ2MsQ0FBQSxDQUFBLGNBQUc7Q0FDZixPQUFBLElBQUE7Q0FBQSxFQURlLENBQUQ7Q0FDZCxDQUFBLENBQWdDLENBQWhDLEtBQWdDLENBQXRCLE1BQVY7Q0FDQyxFQUFHLENBQUssRUFBUixFQUFBLENBQUE7Q0FDUSxFQUFSLENBQUEsQ0FBYyxFQUFQLE1BQVA7Q0FGRCxJQUFnQztDQUFoQyxDQUlBLENBQThCLENBQTlCLEtBQThCLENBQXBCLElBQVY7Q0FDQyxFQUFHLENBQUssRUFBUixHQUFBLEVBQUE7Q0FDUSxFQUFSLENBQUEsQ0FBYyxFQUFQLE1BQVA7Q0FGRCxJQUE4QjtDQUwvQixFQUFhOztDQUFiOztDQUpEIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjU5MDMsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvZnJvbnRlbmQvc2NyaXB0cy92aWV3cy9sb2dpbi5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBMb2dpblxuXHRjb25zdHJ1Y3RvcjogKCBAZG9tICkgLT5cblxuXHRcdEB1c2VybmFtZSA9IEBkb20uZmluZCggJy51c2VybmFtZScgKVxuXHRcdEBwYXNzd29yZCA9IEBkb20uZmluZCggJy5wYXNzd29yZCcgKVxuXG5cdFx0QGRvbS5maW5kKCAnLmZhY2Vib29rJyApLm9uICdjbGljaycsIEBfZmFjZWJvb2tfbG9naW5cblx0XHRAZG9tLmZpbmQoICcuc291bmRjbG91ZCcgKS5vbiAnY2xpY2snLCBAX3NvdW5kY2xvdWRfbG9naW5cblx0XHRAZG9tLmZpbmQoICcuZ29vZ2xlJyApLm9uICdjbGljaycsIEBfZ29vZ2xlX2xvZ2luXG5cblx0XHRcblx0XHQjIEBkb20uZmluZCggJy5zaWduaW4nICkub24gJ2NsaWNrJywgQF9jdXN0b21fbG9naW5cblxuXHRcdCMgQGRvbS5maW5kKCAnaW5wdXQnICkua2V5cHJlc3MgKGV2ZW50KSA9PlxuXHRcdCMgXHRpZiBldmVudC53aGljaCBpcyAxM1xuXHRcdCMgXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0IyBcdFx0QF9jdXN0b21fbG9naW4oKVxuXHRcdCMgXHRcdHJldHVybiBmYWxzZVxuXHRcdFx0XG5cblx0X2ZhY2Vib29rX2xvZ2luOiAoICkgPT5cblx0XHRsb2cgXCJbTG9naW5dIF9mYWNlYm9va19sb2dpblwiXG5cblx0X3NvdW5kY2xvdWRfbG9naW46ICggKSA9PlxuXHRcdGxvZyBcIltMb2dpbl0gX3NvdW5kY2xvdWRfbG9naW5cIlxuXG5cdF9nb29nbGVfbG9naW46ICggKSA9PlxuXHRcdGxvZyBcIltMb2dpbl0gX2dvb2dsZV9sb2dpblwiXG5cblx0IyBfY3VzdG9tX2xvZ2luOiAoICkgPT5cblx0IyBcdEBkb20ucmVtb3ZlQ2xhc3MgXCJlcnJvclwiXG5cdCMgXHRpZiBAdXNlcm5hbWUudmFsKCkubGVuZ3RoIDw9IDAgb3IgQHBhc3N3b3JkLnZhbCgpLmxlbmd0aCA8PSAwXG5cdCMgXHRcdGxvZyBcIltMb2dpbl0gZXJyb3JcIlxuXHQjIFx0XHRAZG9tLmFkZENsYXNzIFwiZXJyb3JcIlxuXHQjIFx0XHRyZXR1cm4gZmFsc2VcblxuXHQjIFx0ZGF0YTpcblx0IyBcdFx0dXNlcm5hbWU6IEB1c2VybmFtZS52YWwoKVxuXHQjIFx0XHRwYXNzd29yZDogQHBhc3N3b3JkLnZhbCgpXG5cblx0IyBcdGxvZyBcIltMb2dpbl0gc3VibWl0dGluZyBkYXRhXCIsIGRhdGFcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLENBQUE7R0FBQSwrRUFBQTs7QUFBQSxDQUFBLEVBQXVCLEdBQWpCLENBQU47Q0FDYyxDQUFBLENBQUEsWUFBRztDQUVmLEVBRmUsQ0FBRDtDQUVkLG9EQUFBO0NBQUEsNERBQUE7Q0FBQSx3REFBQTtDQUFBLEVBQVksQ0FBWixJQUFBLEdBQVk7Q0FBWixFQUNZLENBQVosSUFBQSxHQUFZO0NBRFosQ0FHQSxDQUFJLENBQUosR0FBQSxJQUFBLElBQUE7Q0FIQSxDQUlBLENBQUksQ0FBSixHQUFBLE1BQUEsSUFBQTtDQUpBLENBS0EsQ0FBSSxDQUFKLEdBQUEsRUFBQSxJQUFBO0NBUEQsRUFBYTs7Q0FBYixFQW1CaUIsTUFBQSxNQUFqQjtDQUNLLEVBQUosUUFBQSxjQUFBO0NBcEJELEVBbUJpQjs7Q0FuQmpCLEVBc0JtQixNQUFBLFFBQW5CO0NBQ0ssRUFBSixRQUFBLGdCQUFBO0NBdkJELEVBc0JtQjs7Q0F0Qm5CLEVBeUJlLE1BQUEsSUFBZjtDQUNLLEVBQUosUUFBQSxZQUFBO0NBMUJELEVBeUJlOztDQXpCZjs7Q0FERCJ9fSx7Im9mZnNldCI6eyJsaW5lIjo1OTM3LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2Zyb250ZW5kL3NjcmlwdHMvdmlld3Mvcm9vbS5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBSb29tXG5cdGNvbnN0cnVjdG9yOiAoIEBkb20gKSAtPiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBOztBQUFBLENBQUEsRUFBdUIsR0FBakIsQ0FBTjtDQUNjLENBQUEsQ0FBQSxXQUFHO0NBQU8sRUFBUCxDQUFEO0NBQWYsRUFBYTs7Q0FBYjs7Q0FERCJ9fV19
*/})()