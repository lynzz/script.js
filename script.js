/*!
 * $script.js v 1.0
 * http://dustindiaz.com/scriptjs
 * Copyright: Dustin Diaz 2011
 * License: Creative Commons Attribution: http://creativecommons.org/licenses/by/3.0/
 */
(function(win, doc) {
  var script = doc.getElementsByTagName("script")[0],
      list = {}, ids = {}, delay = {}, f = false, noop = function(){},
      scripts = {}, s = 'string',
      every = function() {
        return Array.every || function(ar, fn) {
          for (var i=0, j=ar.length; i < j; ++i) {
            if (!fn(ar[i], i, ar)) {
              return f;
            }
          }
          return 1;
        };
      }(),
      each = function(ar, fn) {
        every(ar, function(el, i, a) {
          fn(el, i, a);
          return 1;
        });
      };
  if (!doc.readyState && doc.addEventListener) {
    doc.addEventListener("DOMContentLoaded", function fn() {
      doc.removeEventListener("DOMContentLoaded", fn, f);
      doc.readyState = "complete";
    }, f);
    doc.readyState = "loading";
  }
  win.$script = function(paths, idOrDone, optDone) {
    var done = typeof idOrDone == 'function' ? idOrDone : (optDone || noop),
        paths = typeof paths == s ? [paths] : paths,
        id = typeof idOrDone == s ? idOrDone : paths.join(''),
        queue = paths.length,
        callback = function() {
          if (!--queue) {
            list[id] = 1;
            done();
            for (dset in delay) {
              every(dset.split('|'), function(file) {
                return (file in list);
              }) && every(delay[dset], function(fn) {
                fn();
                delay[dset].shift();
              });
            }
          }
        };
    if (ids[id]) {
      return;
    }
    each(paths, function(path) {
      if (scripts[path]) {
        return;
      } else {
        scripts[path] = ids[id] = 1;
      }
      var el = doc.createElement("script"),
          loaded = f;
      setTimeout(function() {
        el.onload = el.onreadystatechange = function () {
          if ((el.readyState && !(/loaded|complete/.test(el.readyState))) || loaded) {
            return f;
          }
          el.onload = el.onreadystatechange = null;
          loaded = 1;
          callback();
        };
        el.async = 1;
        el.src = path;
        script.parentNode.insertBefore(el, script);
      }, 0);
    });
    return win;
  }
  $script.ready = function(deps, ready, req) {
    req = req || noop;
    deps = (typeof deps == s) ? [deps] : deps;
    var missing = [];
    each(deps, function(dep) {
      (dep in list) || missing.push(dep);
    }) && every(deps, function(dep) {
      return (dep in list);
    }) ? ready() : (function(key) {
      delay[key] = delay[key] || [];
      delay[key].push(ready);
      req(missing);
    }(deps.join('|')));
    return $script;
  };
}(window, document));