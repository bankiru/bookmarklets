(function($){
  var mapEl = function(){
    return {
      planKey: $(this).data("plan-key"),
      testId: $(this).data("test-id")
    }
  }

  var doRequests = function(action, tests) {
    var def = $.Deferred();

    var totalCount = tests.length
    var processedCount = 0;
    var resolvedCount = 0;
    var rejectedCount = 0;

    $.each(tests, function(i, test) {
      $.ajax({
        url: window.location.origin + '/rest/api/latest/plan/' + test.planKey + '/test/' + test.testId + '/' + action,
        type:"POST",
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        data:"{}",
      })
        .always(function() {
          console.debug('ajax.always', arguments);
          processedCount++;

          def.notify(arg, processedCount, totalCount)

          if (processedCount == totalCount) {
            def.resolve(totalCount, resolvedCount, rejectedCount);
          }
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
          console.error('ajax.fail', arguments);
          rejectedCount++;
        })
        .done(function(result) {
          console.debug('ajax.done', arguments);
          resolvedCount++;
        })
    })

    def
      .progress(function() {
        console.debug('PROGRESS', arguments)
      })
      .done(function(totalCount, resolvedCount, rejectedCount) {
        console.debug('DONE', arguments);
        alert("" + totalCount + " test(s) " + action + " finished.\n" + (rejectedCount > 0 ? 'Some api requests failed. See console log.' : ''));
      });
  }

  if (!window.location.host.match(/^bamboo\.(dev)?banki\.ru$/)) {
    alert('Domain ' + window.location.host + ' unsupported');
  } else if (window.location.pathname.match(/^\/browse\/[A-Z0-9-]+\/test$/)) {
      var quarantined = $('td.actions a.quarantine-action.quarantined').map(mapEl).toArray()
      var failed = $('td.actions a.quarantine-action:not(.quarantined)').map(mapEl).toArray()
      
      if (failed.length > 0 && window.confirm('Found ' + failed.length + ' new failed test(s). Quarantine all?')) {
        doRequests('quarantine', failed);
      }
      
      if (quarantined.length > 0 && window.confirm('Found ' + quarantined.length + ' quarantined test(s). Resume all?')) {
        doRequests('unleash', quarantined);
      }
  } else if (window.location.pathname.match(/^\/browse\/[A-Z0-9-]+\/quarantine$/)) {
      var quarantined = $('td.actions a.unleash-test').map(mapEl).toArray()
      
      if (quarantined.length > 0 && window.confirm('Found ' + quarantined.length + ' quarantined test(s). Resume all?')) {
        doRequests('unleash', quarantined);
      }
  } else {
    alert('Location ' + window.location.pathname + ' unsupported');
  }
})(jQuery);
