if (window.location.host != 'bamboo.devbanki.ru') {
  alert('Domain ' + window.location.host + ' unsupported');
} else if (window.location.pathname.match(/^\/browse\/[A-Z0-9-]+\/test$/)) {
  (function($){
    alert('Tests page'); 
  })(jQuery);
} else if (window.location.pathname.match(/^\/browse\/[A-Z0-9-]+\/quarantine$/)) {
  (function($){
    alert('Quaratine page'); 
  })(jQuery);
} else {
  alert('Location ' + window.location.pathname + ' unsupported');
}
