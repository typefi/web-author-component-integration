/* Add custom code here */
/* 
 * Refer : https://www.oxygenxml.com/maven/com/oxygenxml/oxygen-webapp/22.1.0.0/jsdoc/tutorial-customaction.html
 */

/**
 * The action that shows a popup and then inserts the text in the pop-up.
 */
WebLinkAction = function(editor) {
  // shortcut is Meta+L on Mac and Ctrl+L on other platforms.
  sync.actions.AbstractAction.call(this, 'M1 L');
  this.editor = editor;
};
WebLinkAction.prototype = Object.create(sync.actions.AbstractAction.prototype);
WebLinkAction.prototype.constructor = WebLinkAction;

WebLinkAction.prototype.getDisplayName = function() {
  return 'Convert to Web Link';
};

// The action is enabled only if there is some content selected.
WebLinkAction.prototype.isEnabled = function() {
  return !this.editor.getSelectionManager().getSelection().isEmpty();
};

// The actual action execution.
WebLinkAction.prototype.actionPerformed = function(callback) {
  var text = window.prompt("Please enter the link attribute");
  if (text) {
    this.editor.getActionsManager().invokeOperation(
      'ro.sync.ecss.extensions.commons.operations.SurroundWithFragmentOperation', {
        fragment: '&lt;' + 'xref href="' + text + '"/>'
      }, callback);
  } else {
    callback && callback();
  }
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
