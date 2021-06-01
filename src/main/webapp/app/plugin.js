/* Add custom code here */
/* 
 * Refer : https://www.oxygenxml.com/maven/com/oxygenxml/oxygen-webapp/22.1.0.0/jsdoc/tutorial-customaction.html
 */
 
/**
 * The action that shows a dialog with information about the element at caret.
 *
 * @param {sync.api.Editor} editor The editor.
 */

//------------ Typefi Attach workflow -------------------------------
TypefiAttachWorkflowAction = function(editor) {  
  this.editor = editor;
  this.dialog = workspace.createDialog();
  this.dialog.setTitle('Attach workflow');
  this.dialog.setButtonConfiguration(sync.api.Dialog.ButtonConfiguration.OK);
  this.dialog.setContentPreferredSize(800, 400)
  this.dialog.setHasTitleCloseButton(true);
};

TypefiAttachWorkflowAction.prototype = Object.create(sync.actions.AbstractAction.prototype);
TypefiAttachWorkflowAction.prototype.constructor = TypefiAttachWorkflowAction;

/** The display name of the action */
TypefiAttachWorkflowAction.prototype.getDisplayName = function() {
  return 'Attach Typefi workflow';
};

TypefiAttachWorkflowAction.prototype.getSmallIcon = function() {
  return 'images/rocket-white-100.png'; //rocket100
};

/** The actual action execution. */
TypefiAttachWorkflowAction.prototype.actionPerformed = function(callback) {
		// read attach workflow from cookie 
        var wf = getCookie("typefi_workflow") === "null" || getCookie("typefi_workflow") === null ? '' : getCookie("typefi_workflow");
        // attach workflow modal body html
        this.dialog.getElement().innerHTML = 
                    "<b>Attached workflow</b> : <input id=\"typefi-workflow\" value=\""+wf
                    +"\" style=\"width: 80%;border: none;background: white;color: #969696;\" disabled />"+
                    "<div class=\"modal-body\" id=\"typefi-modal-body\">"+
                    "<ul class=\"breadcrumb\" id=\"typefi-filechooser-breadcrumb\">"+
                    "</ul>"+
                    "<div id=\"typefi-table-body\">"+
                    "</div>";	
        
        // initalise typefi modal tree view
        getFileList("", true, false);
        // show modal
        this.dialog.show();
};

//------------ Typefi publish workflow -------------------------------
// Typefi publish workflow action
TypefiPublishWorkflowAction = function(editor) {
    // set login details	
    $(".sep").css("display","none");
    $(".user-name").text(getCookie("user_name"));
    $(".ui-action-large-icon").removeClass("user-photo");	
    
    // run workflow	
    // shortcut is Meta+R on Mac and Ctrl+R on other platforms.
    sync.actions.AbstractAction.call(this, 'M1 R');
    
    this.editor = editor;
    
    // modal dialog settings
    this.dialog = workspace.createDialog();
    this.dialog.setTitle('Publish workflow'); // title
    
    // custom buttons
    var but = [
        {key: "PUBLISH", caption: "Publish", default: true, cancel: false}, 
        {key: "CANCEL", caption: "Cancel", default: false, cancel: true}
        //,{key: "CHANGE", caption: "Change", default: false, cancel: true}
    ]
    this.dialog.setButtonConfiguration(but); // yes no button
    this.dialog.setResizable(true);
    this.dialog.setPosition(350, 100);
};
TypefiPublishWorkflowAction.prototype = Object.create(sync.actions.AbstractAction.prototype);
TypefiPublishWorkflowAction.prototype.constructor = TypefiPublishWorkflowAction;

TypefiPublishWorkflowAction.prototype.getDisplayName = function() {
  return 'Publish Typefi workflow';
};

TypefiPublishWorkflowAction.prototype.getSmallIcon = function() {
  return 'images/print-white-100.png';
};

/** The actual action execution. */
TypefiPublishWorkflowAction.prototype.actionPerformed = function(callback) {
		var wf = getCookie("typefi_workflow") === "null" || getCookie("typefi_workflow") === null ? '' : getCookie("typefi_workflow");
		
		this.dialog.getElement().innerHTML = 'Do you want to run this workflow : ' +wf
		+'   <button class=\"button-change\" type=\"button\" onclick=\"changeWorkflow()\">Change</button>'+  
		"<div style=\"display: none;\" id=\"typefi-file-browser\">"+
		"<b>Attached workflow</b> : <input id=\"typefi-workflow\" value=\""+wf
		+"\" style=\"width: 80%;border: none;background: white;color: #969696;\" disabled />"+
		"<div class=\"modal-body\" id=\"typefi-modal-body\">"+
		"<ul class=\"breadcrumb\" id=\"typefi-filechooser-breadcrumb\">"+
		"</ul>"+
		"<div id=\"typefi-table-body\">"+
		"</div>"+
		"</div>";
		
		   
		// initalise typefi modal tree view
		getFileList("", true, false);
		
		this.dialog.setPosition(350, 100);
		this.dialog.onSelect(onSelectCallback, this); // Alwas need to register call back each time
		this.dialog.show();
};


//------------ Common event handling -------------------------------
// bind with toolbar
goog.events.listen(workspace, sync.api.Workspace.EventType.EDITOR_LOADED, function(e) {
    // set login details	
    $(".sep").css("display","none");
    $(".user-name").text(getCookie("user_name"));
    $(".ui-action-large-icon").removeClass("user-photo");	
    
    var editor = e.editor;
    // Register the newly created action.
    editor.getActionsManager().registerAction('insert.printlink', new TypefiAttachWorkflowAction(editor));
    addToDitaToolbar(editor, 'insert.printlink');
    addToContextMenu(editor, 'insert.printlink');
    
    // Register the newly created action.
    editor.getActionsManager().registerAction('insert.workflowlink', new TypefiPublishWorkflowAction(editor));
    addToDitaToolbar(editor, 'insert.workflowlink');
    addToContextMenu(editor, 'insert.workflowlink');
    
    // Refresh the action enabled/disabled status when the selection changes.
    goog.events.listen(editor.getSelectionManager(), sync.api.SelectionManager.EventType.SELECTION_CHANGED, function() {
        editor.getActionsManager().refreshActionsStatus('insert.printlink')
        editor.getActionsManager().refreshActionsStatus('insert.workflowlink')
    });      
});



/**
 * button select callback
 */
function onSelectCallback(key, event) {
    switch(key) {
      case "PUBLISH":
            runJob(); // run job
            workspace.getNotificationManager().showInfo("Publish Typefi job.."); // show message
        break;
      case "CANCEL":
            workspace.getNotificationManager().showInfo("Publish Typefi job canceled");
        break;
      default:
        // code block
    }
}

/**
 * Change worklfow 
 */
function changeWorkflow(){
     $(".button-change").css("display", "none");
     $("#typefi-file-browser").css("height", "400px");
     $("#typefi-file-browser").css("width", "800px");
     $("#typefi-file-browser").css("display", "");
     $("#typefi-file-browser").parent().parent().parent('div').css("left", "15%");
     $("#typefi-file-browser").parent().parent().parent('div').css("top", "5%");
}

/**
 * Add to dita toolbar
 */
function addToDitaToolbar(editor, actionId) {
  goog.events.listen(editor, sync.api.Editor.EventTypes.ACTIONS_LOADED, function(e) {
    var actionsConfig = e.actionsConfiguration;

    var ditaToolbar = null;
    if (actionsConfig.toolbars) {
      for (var i = 0; i < actionsConfig.toolbars.length; i++) {
        var toolbar = actionsConfig.toolbars[i];        
        //Builtin
        if (toolbar.name === "Builtin") {
          ditaToolbar = toolbar;
        }       
      }
    }

    if (ditaToolbar) {
        var children = ditaToolbar.children;
        var newChild = [];
        for (var key in children){
             if(children[key].id === "Author/FindReplace"){
                  newChild.push(children[key]);
                  newChild.push({
                    id: actionId,
                    type: "action"
                  });
             }
             else if(children[key].name === "More..."){
                   var child = children[key].children;
                   var x = 0;
                   for (var keyChild in child){
                        if(child[keyChild].id === "Author/ShowXML"){
                            newChild.push({
                                id: child[keyChild].id,
                                type: "action"
                              });
                        
                            child.splice(x, 1);
                        }
                        x++;
                   }

                   children[key].children = child;
                   newChild.push(children[key]);
             }
            
             else{
                   newChild.push(children[key]);
             }
        }
        
        ditaToolbar.children = newChild;
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


function changeWf(cthis){    
    var oxyNode = cthis.editor.getSelectionManager().getSelection().getNodeAtCaret();
    if (oxyNode) {
        var wf = getCookie("typefi_workflow") === "null" || getCookie("typefi_workflow") === null ? '' : getCookie("typefi_workflow");
  
        cthis.dialog.getElement().innerHTML = 'Do you want to run this workflow : ' +wf+
        '   <button class=\"button-change\" type=\"button\" onclick=\"changeWf('+this+')\">Change</button>';
        cthis.dialog.onSelect(onSelectCallback); // Alwas need to register call back each time
        cthis.dialog.show();
        // run handled by the event handler onSelectCallback
    }
}

//------------ GET/POST handling -------------------------------

function runJob(){
    var wf = getCookie("typefi_workflow") === "null" || getCookie("typefi_workflow") === null ? '' : getCookie("typefi_workflow");
    var workflow = httpGetWf("/oxygenrun/override"); //oxygenrun
    //console.log(workflow);    
    sendPost("/api/v1/workflows/"+wf, workflow)
}
    
    
/**
 * Function to get workflow
 */
function getWorkflow(wf){
    // workflow API
    var workflowApi = "/api/v1/workflows/";
    // get the workflow
    var workflow = httpGet(workflowApi+wf);
    return workflow;
}

//'/api/v1/cms/folders?url=rest://cms/'
function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false);
    // false for synchronous request
    xmlHttp.send(null);
    
    // convert to object
    var obj = JSON.parse(xmlHttp.responseText);
    return obj;
}

function httpGetWf(theUrl) {
    var wf = getCookie("typefi_workflow") === "null" || getCookie("typefi_workflow") === null ? '' : getCookie("typefi_workflow");
    var urlParams = new URLSearchParams(window.location.search);
	var file = urlParams.get('url').split("?")[0].replace("rest://cms","");

    var paramUrl = "input="+file+"&workflow=/"+wf;
    var http = new XMLHttpRequest();
    
    http.open("GET", theUrl+"?"+paramUrl, false);
    http.onreadystatechange = function()
    {
        if(http.readyState == 4 && http.status == 200) {
            //console.log(http.responseText);
        	console.log("Get request success");
        }
    }
    
    http.send(null);
    var obj = JSON.parse(http.responseText);
    return obj;
}

function sendPost(url, workflow) {
    var fileName = "override.typefi_workflow"
    var xhr = new XMLHttpRequest();

    xhr.open("POST", url, true);
    var boundary = '---------------------------7da24f2e50046';
    xhr.setRequestHeader("Content-Type", "multipart/form-data; boundary=" + boundary);

    var body = "" +     
        '--' + boundary + '\r\n' + 
        'Content-Disposition: form-data; name="file[]"; filename="' + fileName + '"' + '\r\n' + 
        'Content-Type: application/json' + '\r\n' + 
        '' + '\r\n' + 
        JSON.stringify(workflow) + '\r\n' + 
        '--' + boundary + '--' + 
        ''; 

    xhr.onreadystatechange = function ()
    {
        if (xhr.readyState == 4 && xhr.status == 200)
        {
            //console.log(xhr.responseText);
        	console.log("Post request success");
        }
    }
   console.log(body);
   xhr.send(body);
   return true;
}
    
//------------------ JSON Util ----------------------    
function isJson(str) {
    try {
        return JSON.parse(str);
    } catch (e) {
        return false;
    }
}

function isArray(what) {
   return Object.prototype.toString.call(what) === '[object Array]';
}
   
//------------------ typefi file chooser----------------------
   
function clickFile(path, type, link) {
	if (type === true || type === "true") {
		getFileList(path, type, link);
	} else {
		document.getElementById("typefi-workflow").value = path;
		setCookie("typefi_workflow", path, 30)
		workspace.getNotificationManager().showInfo("Workflow ("+path+") selected");
	}
}

function clickBreadCrumb(path) {
    getFileList(path, true, true);
}
	
function displayBreadCrumb (path, type, link) { 
    // Create an anchor which, when clicked, triggers updating of
    // breadcrumbs and file list
    var html = '<li><a href=\"javascript:clickBreadCrumb(\'\')\">Files</a></li>';
    var i;
    var breadcrumbs =[];
    
    // Decodes the path from encodeURIComponent
    var decodedPath = decodeURIComponent(encodeSpecialCharacters(path));
    
    // Split the decoded path on folder separator if non-empty
    if (decodedPath != "") {
        breadcrumbs = decodedPath.split('/');
    }
    
    // For files, omit the final item in the path
    //var count = (type == 'file' ? (breadcrumbs.length - 1): breadcrumbs.length);
    var count = (type == true || type == "true" ? (breadcrumbs.length - 1): breadcrumbs.length);
    var url = '';
    
    for (i = 0; i <= count; i++) {
        // Prepend with / unless this is the first item in the path
        url += (i != 0 ? '/': '') + breadcrumbs[i];
        
        // If the url is non-empty then add the item to the breadcrumbs
        // along with an anchor
        // which, when clicked, triggers updating of breadcrumbs and file
        // list
        if (url != "") {
            html += '<li><a href=\'javascript:clickBreadCrumb(\"' + encodeSpecialCharacters(url) + '\")\'>' + escapeHtml(breadcrumbs[i]) + '</a></li>';
        }
    }
    
    // Update breadcrumbs with the html created    
    var modalbody = document.getElementById("typefi-filechooser-breadcrumb");
    
    if(link){
        modalbody.innerHTML = "";
        modalbody.innerHTML = modalbody.innerHTML + html;
    }
    else
        modalbody.innerHTML = modalbody.innerHTML + html;
}

function getFileList(path, folder, link){
    var tableHtml = '<table class=\"table table-hover\" id=\"typefi-filechooser-file\">' +'<tr>' 
                    +'<th class=\"typefi-tight-col typefi-right-col col-xs-1\">' + "" + '</th>' 
                    +'<th style=\"text-align: left;\" class=\"typefi-left-colx col-xs-6\">' + "Name" + '</th>' 
                    + '</th>' + '<th style=\"text-align: right;\" class=\"typefi-right-col col-xs-3\">' + '<div>' + "Size" + '</div>' + '</th>' 
                    + '<th style=\"text-align: right;\" class=\"typefi-right-col col-xs-3\">' + "Modified" + '</th>' + '</tr>';
    
    displayBreadCrumb(path, folder, link);
    var treeData = httpGet("/api/v1/cms/folders?url=rest://cms/"+path );
    
    var typefiFilestoreLocation =  httpGet("/api/v1/filestoreproperties");
    typefiFilestoreLocation = typefiFilestoreLocation.filestoreLocation;
	
	// for windows
	//C:/APPS/DATA/Typefi
	//typefiFilestoreLocation = typefiFilestoreLocation.replaceAll("/","\\")


    for (var key in treeData){
        var file = treeData[key];
        

        
        var pathWithFolderSeparator = file.path.replace(typefiFilestoreLocation, "");
		
		//for windows
		//pathWithFolderSeparator = pathWithFolderSeparator.replaceAll("\\","/")

        
					if( file.folder === true || file.name.indexOf(".typefi_workflow") !== -1 )	{				
        				tableHtml = tableHtml + '<tr>'
        				// File icon
        				+ '<td><i class=\"'
        				+ (file.folder === true ? "ft-folder-o"
        						: (file.name.indexOf(".typefi_workflow") !== -1) ? "ft-rocket":"ft-file-o")
        				+ '\"></i></td>'
        				+ '<td data-file-name-lower-case="'+file.folder+'" class="typefi-files-name">'
        				+ ( file.folder === true || file.name.indexOf(".typefi_workflow") !== -1 ? ('<a class=\"'+file.folder+'\"'+' href=\'javascript:clickFile(\"'
        						+ decodeURIComponent(encodeSpecialCharacters(pathWithFolderSeparator))
        						+ '\", \"' + file.folder +'\", \"'+file.folder+ '\")\'>')
        						: '' )
        				+ escapeHtml(getFileName(file.name, file.folder))
        				+ ($('#typefi-file-filter').val() != 'folder'
        						|| item.type == 'folder' ? '</a>'
        						: '')
        				+ '</td>'
        				+ '<td style=\"text-align: right;\" class=\"typefi-right-col\">'
        				+  (file.folder === true ? '--' : formatFileSize(file.size))		
        				+ '</td>'
        				+ '<td style=\"text-align: right;\" class=\"typefi-right-col\">'
        				+ compactDate(file.modified)
        				+ '</td>'
        				+ '</tr>';
    				}
    				
    }
    
    var modalbody = document.getElementById("typefi-table-body");
    if(link){
        modalbody.innerHTML = "";
        modalbody.innerHTML = modalbody.innerHTML + tableHtml;
    }
    else
        modalbody.innerHTML = modalbody.innerHTML + tableHtml;
}


function encodeSpecialCharacters(string) {
    // regular expression to ingnore /
    return String(string).replace(
    /[^\/]/g,
    function (s) {
        return encodeURIComponent(s).replace(/[~!*'()]/g,
        '%' + s.charCodeAt(0).toString(16));
        // encodeURIComponent() will not encode: ~!*()'
    });
}

//------------ File chooser util -------------------------------

// display Html space
function escapeHtml(string) {
    return string.replace(/[\s]/g, "&nbsp;");
}

function appendFolderSeparator (filename) {
	return endsWith(filename, "/") ? filename : filename + "/";
}

function endsWith(text, suffix) {
	return text.slice(text.length - 1) === suffix;
}

function getPathExtension(filename, folder) {
    if(!folder){
   	var extensionIndex = filename.lastIndexOf(".");
   	return extensionIndex === -1 ? "" : filename.slice(extensionIndex + 1);
	}
	
	return "";
}

function getFileName (fileName, folder) {
   if(!folder){
   	var typefiExtensions = [ ".typefi_workflow", ".typefi_action",
   			".typefi_project" ], extension = '.'
   			+ getPathExtension(fileName, folder);

   	if (typefiExtensions.indexOf(extension) !== -1) {
   		return fileName.substr(0, (fileName.length - extension.length));
   	}
	}
	return fileName;
}

//------------ Cookie util -------------------------------
	
/**
 * Set cookie
 * @param name
 * @param value
 * @param days
 * @returns
 */	
function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

/**
 * Get data from cookie
 * @param name
 * @returns cookie
 */
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

/**
 * Erase cookie
 * @param name
 * @returns
 */
function eraseCookie(name) {   
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}
	
	
/**
 * Get user from cookie
 * @param cname
 * @returns
 */
function getCookiex(cname) {
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



function parseIso8601Date(s) {
	return new Date(Date.UTC(s.substr(0, 4), // year
	s.substr(5, 2) - 1, // month (0-11)
	s.substr(8, 2), // day
	s.substr(11, 2), // hour
	s.substr(14, 2), // minute
	s.substr(17, 2))); // second
}

function compactDate(d) {
	if (isBeforeThisYear(d)) {
		return monthName(d.getMonth()) + ' ' + d.getDate()
				+ ', ' + d.getFullYear();
	}

	if (isBeforeToday(d)) {
		return monthName(d.getMonth()) + ' ' + d.getDate();
	}

	return compactTime(d, false);
}

/**
 * Closure to convert month index to 3 letter month name. e.g.
 * 
 * 0 => "Jan", 1 => "Feb", etc
 * 
 * http://youtu.be/hQVTIJBZook?t=25m42s
 * 
 * @memberOf TYPEFI
 */
function monthName() {
	var months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug',
			'Sep', 'Oct', 'Nov', 'Dec' ];
	return function(n) {
		return months[n];
	};
}

function isBeforeThisYear(date) {
	var now = new Date(), jan1 = new Date(now.getFullYear(), 0, 1);
	return date < jan1;
}



/**
 * Compact time only format, e.g. "3:27 pm". If includeSeconds is true then
 * seconds are also included
 * 
 * @memberOf TYPEFI
 */
 function compactTime(date, includeSeconds) {
    date = new Date(date);
	var result, hour = date.getHours(), mins = pad2(date.getMinutes()), ampm = (hour < 12) ? 'am' : 'pm', secs;
	// 24 hour to 12 hour time
	hour = (hour < 12) ? hour : (hour - 12);
	// special case for 0 hour, convert to 12
	hour = (hour === 0) ? 12 : hour;
	result = hour + ':' + mins;
	if (includeSeconds) {
		secs = pad2(date.getSeconds());
		result += ':' + secs;
	}
	result += '&nbsp;' + ampm;
	return result;
}

function pad2(n) {
	return (n < 10) ? ('0' + n) : n;
}

/**
 * Returns whether date occurs before today
 * 
 * @memberOf TYPEFI
 */
function isBeforeToday(date) {
	var now = new Date(), midnight = new Date(now.getFullYear(), now
			.getMonth(), now.getDate());
	return date < midnight;
}

function formatFileSize(size) {
	if (size === '0') {
		return ('0');
	}
	var i = Math.floor(Math.log(size) / Math.log(1024));
	return (size / Math.pow(1024, i)).toFixed(1) + ' '
			+ [ 'B', 'KB', 'MB', 'GB', 'TB' ][i];
}