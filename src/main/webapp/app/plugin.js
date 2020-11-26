/* Add custom code here */
/* 
 * Refer : https://www.oxygenxml.com/maven/com/oxygenxml/oxygen-webapp/22.1.0.0/jsdoc/tutorial-customaction.html
 */

/**
 * The action that shows a popup and then inserts the text in the pop-up.
 */
WebLinkAction = function(editor) {
  // set login details	
  $(".sep").css("display","none");
  $(".user-name").text(getCookie("user_name"));
  $(".ui-action-large-icon").removeClass("user-photo");	
  
  // run workflow	
  // shortcut is Meta+R on Mac and Ctrl+R on other platforms.
  sync.actions.AbstractAction.call(this, 'M1 R');
  this.editor = editor;
};
WebLinkAction.prototype = Object.create(sync.actions.AbstractAction.prototype);
WebLinkAction.prototype.constructor = WebLinkAction;

WebLinkAction.prototype.getDisplayName = function() {
  return 'Run with Typefi';
};

// The action is enabled only if there is some content selected.
//WebLinkAction.prototype.isEnabled = function() {
//  return !this.editor.getSelectionManager().getSelection().isEmpty();
//};

// The actual action execution.
WebLinkAction.prototype.actionPerformed = function(callback) {
  var search   = window.location.search;  
  
  // open new page to browse workflow and run job
  window.open('/oxygenrun'+search, 'typefi'); 
};


goog.events.listen(workspace, sync.api.Workspace.EventType.EDITOR_LOADED, function(e) {
  var editor = e.editor;
  // Register the newly created action.
  editor.getActionsManager().registerAction('insert.link', new WebLinkAction(editor));
  addToDitaToolbar(editor, 'insert.link');
  addToContextMenu(editor, 'insert.link');
  
  // Refresh the action enabled/disabled status when the selection changes.
  goog.events.listen(editor.getSelectionManager(), 
      sync.api.SelectionManager.EventType.SELECTION_CHANGED, function() {
    editor.getActionsManager().refreshActionsStatus('insert.link')
  });    
});


function addToDitaToolbar(editor, actionId) {
  goog.events.listen(editor, sync.api.Editor.EventTypes.ACTIONS_LOADED, function(e) {
    var actionsConfig = e.actionsConfiguration;

    var ditaToolbar = null;
    if (actionsConfig.toolbars) {
      for (var i = 0; i < actionsConfig.toolbars.length; i++) {
        var toolbar = actionsConfig.toolbars[i];
        if (toolbar.name === "DITA") {
          ditaToolbar = toolbar;
        }
      }
    }

    if (ditaToolbar) {
      ditaToolbar.children.push({
        id: actionId,
        type: "action"
      });
    }
  });
}


function addToContextMenu(editor, actionId) {
  goog.events.listen(editor, sync.api.Editor.EventTypes.ACTIONS_LOADED, function(e) {
    var contextualItems = e.actionsConfiguration.contextualItems;
    if (contextualItems) {
      contextualItems.push({
        id: actionId,
        type: "action"
      });
    }
  });
}

/**
 * Get user from cookie
 * @param cname
 * @returns
 */
function getCookie(cname) {
	  var name = cname + "=";
	  var decodedCookie = decodeURIComponent(document.cookie);
	  var ca = decodedCookie.split(';');
	  for(var i = 0; i <ca.length; i++) {
	    var c = ca[i];
	    while (c.charAt(0) == ' ') {
	      c = c.substring(1);
	    }
	    if (c.indexOf(name) == 0) {
	      return c.substring(name.length, c.length);
	    }
	  }
	  return "";
}
