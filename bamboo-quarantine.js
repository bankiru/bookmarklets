(function(jQuery){
  if (!jQuery('.aui-header-logo-bamboo').length) {
    alert('You are not on the bamboo page =(');
    return;
  }
  
  var showMessage = function(type, title, body) {
    var msg = AJS.messages[type]('#bankiru-bookmarklets-bamboo-quarantine', {
      title: title,
      body: body,
      closable: true,
    });
    
    msg.css({width: '30em', right: '1em', top: '1em', position: 'absolute'});
        
    jQuery('section.aui-page-panel-content').append(msg);
    
    return msg;
  }
  
  var doRequests = function(action, tests) {
    var def = jQuery.Deferred();

    var totalCount = tests.length
    var processedCount = 0;
    var resolvedCount = 0;
    var rejectedCount = 0;

    jQuery.each(tests, function(i, test) {
      jQuery.ajax({
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

        var msgText = '<p>You should manually reload page to see changes!</p>';
        if (rejectedCount > 0) {
          msgText = AJS.format('<p>{0} of {1} api requests failed. See console log for details.</p>', rejectedCount, totalCount) + msgText;
        }

        showMessage(
          rejectedCount > 0 ? 'warning' : 'success',
          AJS.format('Finished {0} tests {1}', totalCount, action),
          msgText
        );
      });
  }
  
  var quarantined = [],
      newfailed = [];

  jQuery('td.actions').find('a.quarantine-action,a.unleash-test').each(function(){
    var test = {
      planKey: jQuery(this).data("plan-key"),
      testId: jQuery(this).data("test-id"),
    }
    
    if (jQuery(this).hasClass('quarantined') || jQuery(this).hasClass('unleash-test')) {
      quarantined.push(test);
    } else {
      newfailed.push(test);
    }
  })
  
  if (quarantined.length == 0 && newfailed.length == 0) {
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
