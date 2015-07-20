function is_browser_supported() {
  var ua = window.navigator.userAgent;
  var msie = ua.indexOf("MSIE ");
  var v = 11;
  if (msie > 0) {
    v = parseInt(ua.substring(msie + 5, ua.indexOf(".", msie)));
  }
  
  return v > 9;
}