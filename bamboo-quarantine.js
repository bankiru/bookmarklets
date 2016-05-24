(function($){
  var mapEl = function(){
    return {
      planKey: $(this).data("plan-key"),
      testId: $(this).data("test-id")
    }
  }
  
  var doRequest = function(action, tests) {
    $.each(tests, function(i, test){
      console.log(action, test.planKey, test.testId);
      // $.ajax({
      console.log('ajax', {
        url: window.location.origin + '/rest/api/latest/plan/' + test.planKey + '/test/' + test.testId + '/' + action,
        type:"POST",
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        data:"{}",
      });
    });
  }
  
  var quarantine = function(tests) {
    doRequest('quarantine', tests)
  }
  
  var resume = function(tests) {
    doRequest('resume', tests)
  }
  
  if (!window.location.host.match(/^bamboo\.(dev)?banki\.ru$/)) {
    alert('Domain ' + window.location.host + ' unsupported');
  } else if (window.location.pathname.match(/^\/browse\/[A-Z0-9-]+\/test$/)) {
      var quarantined = $('td.actions a.quarantine-action.quarantined').map(mapEl).toArray()
      var faileded = $('td.actions a.quarantine-action:not(.quarantined)').map(mapEl).toArray()
      
      if (failed.length > 0 && window.confirm('Found ' + failed.length + ' new failed test(s). Quarantine all?')) {
        quarantine(failed);
      }
      
      if (quarantined.length > 0 && window.confirm('Found ' + quarantined.length + ' quarantined test(s). Resume all?')) {
        resume(quarantined);
      }
  } else if (window.location.pathname.match(/^\/browse\/[A-Z0-9-]+\/quarantine$/)) {
      var quarantined = $('td.actions a.unleash-test').map(mapEl).toArray()
      
      if (quarantined.length > 0 && window.confirm('Found ' + quarantined.length + ' quarantined test(s). Resume all?')) {
        resume(quarantined);
      }
  } else {
    alert('Location ' + window.location.pathname + ' unsupported');
  }
})(jQuery);
