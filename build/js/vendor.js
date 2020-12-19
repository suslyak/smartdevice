
(function () {
  "use strict";
  /* Полифилы для IE - начало */

  //svgxuse https://github.com/Keyamoon/svgxuse
  if (typeof window !== "undefined" && window.addEventListener) {
      var cache = Object.create(null); // holds xhr objects to prevent multiple requests
      var checkUseElems;
      var tid; // timeout id
      var debouncedCheck = function () {
          clearTimeout(tid);
          tid = setTimeout(checkUseElems, 100);
      };
      var unobserveChanges = function () {
          return;
      };
      var observeChanges = function () {
          var observer;
          window.addEventListener("resize", debouncedCheck, false);
          window.addEventListener("orientationchange", debouncedCheck, false);
          if (window.MutationObserver) {
              observer = new MutationObserver(debouncedCheck);
              observer.observe(document.documentElement, {
                  childList: true,
                  subtree: true,
                  attributes: true
              });
              unobserveChanges = function () {
                  try {
                      observer.disconnect();
                      window.removeEventListener("resize", debouncedCheck, false);
                      window.removeEventListener("orientationchange", debouncedCheck, false);
                  } catch (ignore) {}
              };
          } else {
              document.documentElement.addEventListener("DOMSubtreeModified", debouncedCheck, false);
              unobserveChanges = function () {
                  document.documentElement.removeEventListener("DOMSubtreeModified", debouncedCheck, false);
                  window.removeEventListener("resize", debouncedCheck, false);
                  window.removeEventListener("orientationchange", debouncedCheck, false);
              };
          }
      };
      var createRequest = function (url) {
          // In IE 9, cross origin requests can only be sent using XDomainRequest.
          // XDomainRequest would fail if CORS headers are not set.
          // Therefore, XDomainRequest should only be used with cross origin requests.
          function getOrigin(loc) {
              var a;
              if (loc.protocol !== undefined) {
                  a = loc;
              } else {
                  a = document.createElement("a");
                  a.href = loc;
              }
              return a.protocol.replace(/:/g, "") + a.host;
          }
          var Request;
          var origin;
          var origin2;
          if (window.XMLHttpRequest) {
              Request = new XMLHttpRequest();
              origin = getOrigin(location);
              origin2 = getOrigin(url);
              if (Request.withCredentials === undefined && origin2 !== "" && origin2 !== origin) {
                  Request = XDomainRequest || undefined;
              } else {
                  Request = XMLHttpRequest;
              }
          }
          return Request;
      };
      var xlinkNS = "http://www.w3.org/1999/xlink";
      checkUseElems = function () {
          var base;
          var bcr;
          var fallback = ""; // optional fallback URL in case no base path to SVG file was given and no symbol definition was found.
          var hash;
          var href;
          var i;
          var inProgressCount = 0;
          var isHidden;
          var Request;
          var url;
          var uses;
          var xhr;
          function observeIfDone() {
              // If done with making changes, start watching for chagnes in DOM again
              inProgressCount -= 1;
              if (inProgressCount === 0) { // if all xhrs were resolved
                  unobserveChanges(); // make sure to remove old handlers
                  observeChanges(); // watch for changes to DOM
              }
          }
          function attrUpdateFunc(spec) {
              return function () {
                  if (cache[spec.base] !== true) {
                      spec.useEl.setAttributeNS(xlinkNS, "xlink:href", "#" + spec.hash);
                      if (spec.useEl.hasAttribute("href")) {
                          spec.useEl.setAttribute("href", "#" + spec.hash);
                      }
                  }
              };
          }
          function onloadFunc(xhr) {
              return function () {
                  var body = document.body;
                  var x = document.createElement("x");
                  var svg;
                  xhr.onload = null;
                  x.innerHTML = xhr.responseText;
                  svg = x.getElementsByTagName("svg")[0];
                  if (svg) {
                      svg.setAttribute("aria-hidden", "true");
                      svg.style.position = "absolute";
                      svg.style.width = 0;
                      svg.style.height = 0;
                      svg.style.overflow = "hidden";
                      body.insertBefore(svg, body.firstChild);
                  }
                  observeIfDone();
              };
          }
          function onErrorTimeout(xhr) {
              return function () {
                  xhr.onerror = null;
                  xhr.ontimeout = null;
                  observeIfDone();
              };
          }
          unobserveChanges(); // stop watching for changes to DOM
          // find all use elements
          uses = document.getElementsByTagName("use");
          for (i = 0; i < uses.length; i += 1) {
              try {
                  bcr = uses[i].getBoundingClientRect();
              } catch (ignore) {
                  // failed to get bounding rectangle of the use element
                  bcr = false;
              }
              href = uses[i].getAttribute("href")
                      || uses[i].getAttributeNS(xlinkNS, "href")
                      || uses[i].getAttribute("xlink:href");
              if (href && href.split) {
                  url = href.split("#");
              } else {
                  url = ["", ""];
              }
              base = url[0];
              hash = url[1];
              isHidden = bcr && bcr.left === 0 && bcr.right === 0 && bcr.top === 0 && bcr.bottom === 0;
              if (bcr && bcr.width === 0 && bcr.height === 0 && !isHidden) {
                  // the use element is empty
                  // if there is a reference to an external SVG, try to fetch it
                  // use the optional fallback URL if there is no reference to an external SVG
                  if (fallback && !base.length && hash && !document.getElementById(hash)) {
                      base = fallback;
                  }
                  if (uses[i].hasAttribute("href")) {
                      uses[i].setAttributeNS(xlinkNS, "xlink:href", href);
                  }
                  if (base.length) {
                      // schedule updating xlink:href
                      xhr = cache[base];
                      if (xhr !== true) {
                          // true signifies that prepending the SVG was not required
                          setTimeout(attrUpdateFunc({
                              useEl: uses[i],
                              base: base,
                              hash: hash
                          }), 0);
                      }
                      if (xhr === undefined) {
                          Request = createRequest(base);
                          if (Request !== undefined) {
                              xhr = new Request();
                              cache[base] = xhr;
                              xhr.onload = onloadFunc(xhr);
                              xhr.onerror = onErrorTimeout(xhr);
                              xhr.ontimeout = onErrorTimeout(xhr);
                              xhr.open("GET", base);
                              xhr.send();
                              inProgressCount += 1;
                          }
                      }
                  }
              } else {
                  if (!isHidden) {
                      if (cache[base] === undefined) {
                          // remember this URL if the use element was not empty and no request was sent
                          cache[base] = true;
                      } else if (cache[base].onload) {
                          // if it turns out that prepending the SVG is not necessary,
                          // abort the in-progress xhr.
                          cache[base].abort();
                          delete cache[base].onload;
                          cache[base] = true;
                      }
                  } else if (base.length && cache[base]) {
                      setTimeout(attrUpdateFunc({
                          useEl: uses[i],
                          base: base,
                          hash: hash
                      }), 0);
                  }
              }
          }
          uses = "";
          inProgressCount += 1;
          observeIfDone();
      };
      var winLoad;
      winLoad = function () {
          window.removeEventListener("load", winLoad, false); // to prevent memory leaks
          tid = setTimeout(checkUseElems, 0);
      };
      if (document.readyState !== "complete") {
          // The load event fires when all resources have finished loading, which allows detecting whether SVG use elements are empty.
          window.addEventListener("load", winLoad, false);
      } else {
          // No need to add a listener if the document is already loaded, initialize immediately.
          winLoad();
      }
  }


  //полифил для forEach в IE11
  if (typeof window !== 'undefined' && window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = function (callback, thisArg) {
      thisArg = thisArg || window;
      for (var i = 0; i < this.length; i++) {
        callback.call(thisArg, this[i], i, this);
      }
    };
  }

  /* Полифилы для IE - конец */


  //Плавный скролл - просто с JSFiddle
  function getElementY(query) {
    return window.pageYOffset + document.querySelector(query).getBoundingClientRect().top;
  }

  function doScrolling(element, duration) {
    var startingY = window.pageYOffset
    var elementY = getElementY(element)
    // If element is close to page's bottom then window will scroll only to some position above the element.
    var targetY = document.body.scrollHeight - elementY < window.innerHeight ? document.body.scrollHeight - window.innerHeight : elementY
    var diff = targetY - startingY
    // Easing function: easeInOutCubic
    // From: https://gist.github.com/gre/1650294
    var easing = function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 }
    var start;

    if (!diff) return

    // Bootstrap our animation - it will get called right before next frame shall be rendered.
    window.requestAnimationFrame(function step(timestamp) {
      if (!start) start = timestamp
      // Elapsed miliseconds since start of scrolling.
      var time = timestamp - start
      // Get percent of completion in range [0, 1].
      var percent = Math.min(time / duration, 1)
      // Apply the easing.
      // It can cause bad-looking slow frames in browser performance tool, so be careful.
      percent = easing(percent)

      window.scrollTo(0, startingY + diff * percent)

      // Proceed with animation as long as we wanted it to.
      if (time < duration) {
        window.requestAnimationFrame(step)
      }
    })
  }

  //Маска для телефона - просто с JSFiddle
  window.addEventListener("DOMContentLoaded", function() {
    [].forEach.call( document.querySelectorAll('input[type="tel"'), function(input) {
    var keyCode;
    function mask(event) {
        event.keyCode && (keyCode = event.keyCode);
        var pos = this.selectionStart;
        if (pos < 2) event.preventDefault();
        var matrix = "+7(___)_______",
            i = 0,
            def = matrix.replace(/\D/g, ""),
            val = this.value.replace(/\D/g, ""),
            new_value = matrix.replace(/[_\d]/g, function(a) {
                return i < val.length ? val.charAt(i++) || def.charAt(i) : a
            });
        i = new_value.indexOf("_");
        if (i != -1) {
            i < 4 && (i = 3);
            new_value = new_value.slice(0, i)
        }
        var reg = matrix.substr(0, this.value.length).replace(/_+/g,
            function(a) {
                return "\\d{1," + a.length + "}"
            }).replace(/[+()]/g, "\\$&");
        reg = new RegExp("^" + reg + "$");
        if (!reg.test(this.value) || this.value.length < 5 || keyCode > 47 && keyCode < 58) this.value = new_value;
        if (event.type == "blur" && this.value.length < 5)  this.value = ""
    }

      input.addEventListener("input", mask, false);
      input.addEventListener("focus", mask, false);
      input.addEventListener("blur", mask, false);
      input.addEventListener("keydown", mask, false)

    });
  });

  window.vendorScroll = {
    do: doScrolling
  };
}());
