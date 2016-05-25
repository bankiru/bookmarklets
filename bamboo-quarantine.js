(function($){
  if (!$('.aui-header-logo-bamboo').length) {
    alert('You are not on the bamboo page =(');
    return;
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

          def.notify(test, processedCount, totalCount)

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
        
        var msgConstructor = rejectedCount > 0 ? AJS.messages.warning : AJS.messages.success;
        
        var msgText = '<p>You should manually reload page to see changes!</p>';
        if (rejectedCount > 0) {
          msgText = AJS.format('<p>{0} of {1} api requests failed. See console log for details.</p>', rejectedCount, totalCount) + msgText;
        }
        
        var msg = msgConstructor('section.aui-page-panel-content', {
          title: AJS.format('Finished {0} tests {1}', totalCount, action),
          body: msgText,
          closable: true,
        });
        
        msg.css({width: '30em', right: '1em', top: '1em', position: 'absolute'});
        
        $('section.aui-page-panel-content').append(msg);
      });
  }
  
  var quarantined = [],
      newfailed = [];

  $('td.actions').find('a.quarantine-action,a.unleash-test').each(function(){
    var test = {
      planKey: $(this).data("plan-key"),
      testId: $(this).data("test-id"),
    }
    
    if ($(this).hasClass('quarantined') || $(this).hasClass('unleash-test')) {
      quarantined.push(test);
    } else {
      newfailed.push(test);
    }
  })
  
  if (!quarantined.length && !newfailed.length) {
    alert('No tests found on this page');
    return;
  }
    
  if (newfailed.length > 0 && window.confirm('Found ' + newfailed.length + ' new failed test(s). Quarantine all?')) {
    doRequests('quarantine', newfailed);
  }
      
  if (quarantined.length > 0 && window.confirm('Found ' + quarantined.length + ' quarantined test(s). Resume all?')) {
    doRequests('unleash', quarantined);
  }
})(jQuery);
