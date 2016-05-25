(function(jQuery){
  if (!jQuery('.aui-header-logo-bamboo').length) {
    alert('You are not on the bamboo page =(');
    return;
  }
  
  jQuery.getScript(AJS.format('//aui-cdn.atlassian.com/aui-adg/{0}/js/aui-experimental.js', AJS.version))
  
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
  
  var confirmDialog = function(title, body, buttons) {
    var dialog = new AJS.Dialog({
        width: 400,
        height: 200,
        id: 'bankiru-bookmarklets-bamboo-quarantine-confirm-dialog',
        closeOnOutsideClick: true
    });
    
    dialog.addHeader(title);
    dialog.addPanel('Body', body, "panel-body");
    
    var cancelCallback = function(dialog) {
        dialog.hide();
        dialog.remove();
    }
    
    jQuery.each(buttons, function(i, button){
      if (typeof button == 'string') {
        button = {title: button, callback: null, cssclass: null} 
      }
      
      var callback = function (dialog) {
        cancelCallback(dialog)
        if (typeof button.callback == 'function') {
          button.callback(button);
        }
      }
      
      dialog.addButton(button.title, callback, button.cssclass);
    });

    dialog.addCancel('Cancel', cancelCallback, '');
    
    dialog.show();
    
    return dialog;
  }
  
  var doRequests = function(action, tests) {
    var def = jQuery.Deferred();

    var totalCount = tests.length
    var processedCount = 0;
    var resolvedCount = 0;
    var rejectedCount = 0;
    
    var progressMsgEl = showMessage(
      'generic',
      action.replace(/e$/, '') + 'ing progress',
      AJS.format('<p><span class="value">{0}</span> of {1}</p>', 0, totalCount)
    );
    
    var updateProgress = AJS.debounce(function(processedCount){
        progressMsgEl.find('span.value').text(processedCount);
    }, 200)

    jQuery.each(tests, function(i, test) {
      jQuery.ajax({
        url: window.location.origin + '/rest/api/latest/plan/' + test.planKey + '/test/' + test.testId + '/' + action,
        type:"POST",
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        data:"{}",
      })
        .always(function(_, state, _) {
          console.debug('ajax.always', arguments);
          ++processedCount;
          if (state == 'success') {
            ++resolvedCount;
          }
          if (state == 'error') {
            ++rejectedCount;
          }

          def.notify(test, processedCount, totalCount)

          if (processedCount == totalCount) {
            def.resolve(totalCount, resolvedCount, rejectedCount);
          }
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
          console.error('ajax.fail', arguments);
        })
        .done(function(result) {
          console.debug('ajax.done', arguments);
        })
    })

    def
      .progress(function(test, processedCount, totalCount) {
        console.debug('PROGRESS', arguments);
        updateProgress(processedCount);
      })
      .done(function(totalCount, resolvedCount, rejectedCount) {
        console.debug('DONE', arguments);
        progressMsgEl.hide();
        progressMsgEl.detach();

        var msgText = AJS.format('<p>You should manually reload page to see changes!</p><p><a href="{0}">Reload</a></p>', window.location.href);
        if (rejectedCount > 0) {
          msgText = AJS.format('<p>{0} of {1} api requests failed. See console log for details.</p>', rejectedCount, totalCount) + msgText;
        }

        showMessage(
          rejectedCount > 0 ? 'warning' : 'success',
          AJS.format('Finished. {0} tests {1}', totalCount, action.replace(/e$/, '') + 'ed'),
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
    showMessage('warning', 'No tests found on this page!');
    return;
  }
  
  var confirmText = '<p>Found:</p><ul>';
  var buttons     = [];
  
  if (newfailed.length > 0) {
    confirmText += AJS.format('<li>{0} new failed tests.</li>', newfailed.length);
    buttons.push({
      title: AJS.format('Quarantine {0} tests', newfailed.length),
      callback: function(){ doRequests('quarantine', newfailed); }
    });
  }

  if (quarantined.length > 0) {
    confirmText += AJS.format('<li>{0} quarantined tests.</li>', quarantined.length)  
    buttons.push({
      title: AJS.format('Unleash {0} tests', quarantined.length),
      callback: function(){ doRequests('unleash', quarantined); }
    });
  }
  
  confirmText += '</ul>';
  
  confirmDialog('Tests found', confirmText, buttons);
})(jQuery);
