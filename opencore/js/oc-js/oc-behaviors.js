/* Behaviors */

/*
  #
  # OC object - black magic
  #
*/
// Singleton for use throughout
if (typeof OC == "undefined") { 
    var OC = {}
}

// where we'll store all our live elementshist
OC.liveElements = {};

/* 
   #
   # how we know which elements get which features
   # css or xpath selector : OC Object name (without OC.)
   #
*/

OC.liveElementKey = {};

OC.liveElementKey.Element = {
    'TEXTAREA'               : 'FocusField', 
    'INPUT_text'             : 'FocusField',
    'INPUT_password'         : 'FocusField',
    'INPUT_file'             : 'FocusField'
}
OC.liveElementKey.Class = {
    "oc-js-autoSelect"       : "AutoSelect",
    "oc-js-expander"         : "Expander",
    "oc-js-fieldClear"       : "FieldClear",
    "oc-widget-multiSearch"  : "SearchLinks",
    'oc-dropdown-container'  : "DropDown",
    "oc-autoFocus"           : "AutoFocus",
    "oc-js-toggler"          : "Toggler",
    "oc-js-featurelet-undelete-warner" : "FeatureletUndeleteWarner",
    'oc-checkAll'            : "CheckAll",
    'oc-js-liveEdit'         : "LiveEdit",
    'oc-js-actionLink'       : "ActionLink",
    'oc-js-actionPost'       : "ActionLink",
    'oc-js-actionButton'     : "ActionButton",
    'oc-js-actionSelect'     : "ActionSelect",
    'oc-js-liveValidate'     : "LiveValidatee",
    "oc-js-closeable"        : "CloseButton",
    "oc-directEdit"          : "DirectEdit",
    "oc-confirmProjectDelete": "ConfirmProjectDelete"
}
OC.liveElementKey.Id = {
    "version_compare_form"   : "HistoryList",
    'oc-project-create'      : "ProjectCreateForm",
    'oc-content-container'   : "AutoHeightContent"
}
    
/* 
   # breathes life (aka js behaviors) into HTML elements.  call this on
   # load w/ no argument to breathe life to entire document.  When adding
   # new nodes to the dom, call breatheLife(newItem) to activate that
   # element and its children.
*/

OC.breatheLife = function(newNode, force) {

    OC.time('breatheLife');

    // force re-up?
    if (typeof force == "undefined") { force = false }
  
    // set scope
    if (!newNode) {
      targetNode = document.body;
    } else {
      // accept HTML element or Ext Element
      if (newNode.dom)
          targetNode = newNode.dom;
      else 
          targetNode = newNode; 
    }
    
    // Build regexes out of our class list.  This allows
    // us to have one very quick lookup un elements to
    // prevent unnecessary processing.
    var classRegexString = '';
    for (var key in this.liveElementKey.Class) {
        if (classRegexString.length) {
            classRegexString += '|';
        }
        classRegexString += '\\b' + key + '\\b';
    }
    var classRegex = new RegExp(classRegexString);

    // get an array of elements
    var elements = Ext.query('*', targetNode);
    elements.push(targetNode);
    // loop through elements and match up against selectors
    for (var i = 0, len=elements.length; i<len; i++) {
      var element = elements[i];
    
      // which constructors will we add to this element?
      var constructorNames = new Array();
    
      // check if element matches anything in the Elements list
      if (this.liveElementKey.Element[element.tagName] != undefined) {
        constructorNames.push(this.liveElementKey.Element[element.tagName]);
      }
      
      var matcher = element.tagName + "_" + element.type;
            
      if (OC.liveElementKey.Element[matcher] != undefined ) {
        constructorNames.push(this.liveElementKey.Element[matcher]);
      }
      
      // check if class matches anything in the Classes list
      // We only do full class processing if the regex registers
      // a hit against the class list.
      if (element.className.match (classRegex)) {
        var classNames = element.className.split(' ');
        for (var j=0; j<classNames.length; j++) {
          if (this.liveElementKey.Class[classNames[j]] != undefined) {
            constructorNames.push(this.liveElementKey.Class[classNames[j]]); 
          }
        }
      }
      
      // check if ID matches anything in the IDs list
      if (this.liveElementKey.Id[element.getAttribute('id')] != undefined) {
        constructorNames.push(this.liveElementKey.Id[element.getAttribute('id')]);
      }
      
      // foreach match, check to see if it exists
      // we break out the element retrieve so we only perform one per element.
      if (constructorNames.length > 0) {
        var extEl = Ext.get(element);
        for (var j=0; j<constructorNames.length; j++) {
          var constructorName = constructorNames[j];
          if (typeof OC.liveElements[extEl.id] == "undefined") { OC.liveElements[extEl.id] = {} };
          var constructor = OC[constructorName];
          
          if (force || typeof OC.liveElements[extEl.id][constructorName] == "undefined" ) {
            OC.liveElements[extEl.id][constructorName] = new constructor(extEl);
          }
        }
      }
      
    } // end for each element
    
    OC.timeEnd('breatheLife');
    
}; // breatheLife()

/*
  #------------------------------------------------------------------------
  # Utilities
  #------------------------------------------------------------------------
*/

// Debug Function.  Turn off for live code or IE
OC.debug = function(string) {
    /*
    args = ""
    for (var i = 0; i < arguments.length; ++i) {
      args += " " + arguments[i]
    }
    */
    if( typeof console != 'undefined' ) {
	     console.log(string);
    }
};

// Timer
OC.time = function(name) {
  if (typeof console != 'undefined') {
    //un-comment the line below to turn on timing
    //console.time(name);
  }
}
OC.timeEnd = function(name) {
  if (typeof console != 'undefined') {
    //un-comment the line below to turn on timing
    //console.timeEnd(name);
  }
}

// Send a message to the user
OC.psm = function(text, tone) {
    
    var container = Ext.get('oc-statusMessage-container');
    var message = Ext.get(Ext.query('.oc-statusMessage')[0]);
    
    if (!message) {
        message = Ext.get(document.createElement('div'));
        message.addClass('oc-message');
        container.dom.appendChild(message.dom);
    }
    
    /* tone: oc-message-error, oc-message-success, oc-message-warn */
    message.removeClass(new Array('oc-message-error', 'oc-message-success', 'oc-message-warn'));
    
    if (tone) {
        message.addClass('oc-message-' + tone);
    }
    
    message.update(text);
    message.show();
};

/*
  #
  # DOM Utilities
  #
*/
OC.Dom = {};

// remove an item from the dom
OC.Dom.removeItem = function(id) {
    var extEl = Ext.get(id);
    if (!extEl) {
      OC.debug("Could not find an element #" + id);
      return;
    }
    extEl.fadeOut({remove: true, useDisplay: true});
    OC.debug(OC.liveElements[extEl.id]);
    OC.liveElements[extEl.id] = {};
    OC.debug(OC.liveElements[extEl.id]);
    
    // to do: send user message w/ undo link
};
    
/*
  #------------------------------------------------------------------------
  # Load Em up
  #------------------------------------------------------------------------
*/

Ext.onReady(function() {

  /* Short and Sweet */
  OC.breatheLife();

});

/*
  #------------------------------------------------------------------------
  # Callbacks - Static object with ajax callbacks
  #------------------------------------------------------------------------
*/
OC.Callbacks = {};

OC.Callbacks.afterAjaxSuccess = function(o) { 
    OC.debug('OC.Callbacks.afterAjaxSuccess');
    
    try {  
      this.indicator.hide();  
    } catch(err) { 
      OC.debug(err); 
    }
    try {  
      if (this.button.dom.innerHTML == "Please wait...") {
          OC.debug("link innerhtml: " + this.button.dom.innerHTML);
          OC.debug("link origValue: " + this.origButtonValue);
          this.button.dom.innerHTML = this.origButtonValue;
      }
      if (this.button.dom.value == "Please wait...") {
          OC.debug("button value:" + this.button.dom.value);
          OC.debug("button origvalue: " + this.origButtonValue);
        this.button.dom.value = this.origButtonValue;
      }
      if (this.button.dom.disabled) {
        this.button.dom.disabled = false;  
      }
    } catch(err) {
      OC.debug("couldn't restore button value");
       OC.debug(err); 
    }
    
    Ext.select('form').each(function(el) {
	    el.dom.target = "";
	   });
    OC.debug('o: ' + o);
    
    var response;
    // trim response text to avoid errors in IE
    OC.debug(o.responseText);
    var cleanedResponseText = o.responseText.replace(/[\r\n]/g, "");
    cleanedResponseText = cleanedResponseText.replace(/^\s*<html>.*?<body>/, "");
    cleanedResponseText = cleanedResponseText.replace(/<\/body>\s*<\/html>\s*$/, "")

    cleanedResponseText = cleanedResponseText.replace(/&lt;/g, "<");
    cleanedResponseText = cleanedResponseText.replace(/&gt;/g, ">");
    cleanedResponseText = cleanedResponseText.replace(/&amp;/g, "&");
    OC.debug(cleanedResponseText);
    
    try {
      response = eval( "(" + cleanedResponseText + ")" );
    } catch( e ) {
      OC.debug(e);
      OC.debug("Couldn't parse the response.  Bad JSON? (below): ");
	    OC.debug(cleanedResponseText);
	    //OC.psm('Sorry!  There was an error -- please contact support@openplans.org if this continues to happen.', 'bad')
    }
    
    if( response instanceof Array ) {
	// for backcompatibility with existing code. consider
	// deprecated.  we will translate the array into an object
	// with "delete" actions for each elId, since that's the only
	// case where we used to expect an array.
	var newResponse = {};
	for( var iter = 0; iter < response.length; ++iter ) {
	    newResponse[response[iter]] = {'action': 'delete'};
	}
	response = newResponse;
    }
    
  for( elId in response ) {
	var command = response[elId];
	var action = command.action;
	
	switch( action ) {
	case "error":
        var target = Ext.get(elId);
        target.frame();
        break;

	case "delete":
	    OC.debug("DELETE on " + elId);
	    OC.Dom.removeItem(elId);
	    break;
	    
	case "replace":
	    var html, effects;	    	    
	    if( typeof command == "string" ) { // for backcompability with existing code. consider deprecated.		
		html = command;
		if( action == "update" )
		    effects = "highlight";
      else if( action == "uploadAndUpdate" )
		    effects = "fadeIn";
	    } else if( typeof command == "object" ) {
        effects = command.effects;
        html = command.html;
	    }
	    OC.debug("REPLACE " + elId + " with " + html + " using effect " + effects);
	    
	    html = Ext.util.Format.trim(html);
	    var target = Ext.get(elId);
	    var newNode = Ext.DomHelper.insertHtml('beforeBegin', target.dom, html);
	    target.remove();

	    if( effects == "highlight") {
        Ext.get(newNode).highlight();
	    } else if( effects == "fadein" ) {
        Ext.get(newNode).fadeIn();
	    }
	    
	    OC.breatheLife(newNode, true);
	    OC.debug("done breathing");
	    
	    break;
	    
	case "copy":
	    var html = command.html;
	    var effects = command.effects;
	    
	    html = Ext.util.Format.trim(html);
	    var target = Ext.get(elId);
	    if(! target ) break;
	    
	    Ext.DomHelper.overwrite(target.dom, html);
	    var newNode = target;
	    if( effects == "highlight" ) {
		Ext.get(newNode).highlight();
	    }
	    //OC.breatheLife();
	    break;
	    
	case "append": // fill me in
	    var html = command.html;
	    var effects = command.effects;
	    
	    html = Ext.util.Format.trim(html);
	    var target = Ext.get(elId);
	    
	    var newNode = Ext.DomHelper.insertHtml("beforeend", target.dom, html);
	    if( effects == "highlight" ) {
		Ext.get(newNode).highlight();
	    }
	    OC.breatheLife();
	    break;
	    
	case "prepend": // fill me in
	    
	default:
	    OC.debug('_afterSuccess, task: default');
	    break;
	} // end switch on actio
    } // end for each element
}; // end OC.Callbacks.afterAjaxSuccess()

OC.Callbacks.afterAjaxFailure = function(o) {
    OC.debug('OC.Callbacks.afterAjaxFailure');
    OC.debug(o.responseText);
    //OC.psm('There was a problem with the AJAX Request.  Octopus!', 'error');
};

/*
  #------------------------------------------------------------------------
  # Classes - will become liveElement objects
  #------------------------------------------------------------------------
*/

/* 
   #
   # Action Links
   #
*/
OC.ActionLink = function(extEl) {
    // get refs
    link = extEl;
    this.button = link; /* for ajax callback */
    this.origButtonValue = this.button.dom.innerHTML; /* for ajax callback */
    
    if (!link) {
	     OC.debug("ActionLink: Could not get refs");
    } 

    if (link.hasClass('oc-js-actionPost')) {
        var method = "POST";
    } else {
        var method = "GET";
    }

    function _doAction(e, el, o) {
    	YAHOO.util.Event.stopEvent(e);
    	
    	// get action/href & split action from params
    	var action = el.href.split("?")[0];
    	var requestData = el.href.split("?")[1] + '&mode=async';
    	OC.debug("request data is " + requestData);
    	
    	this.button.dom.innerHTML = "Please wait..."; 
    	
    	// make connection
        if (method == "GET") {
        	var cObj = YAHOO.util.Connect.asyncRequest("GET", action + '?' + requestData, {
        		success: OC.Callbacks.afterAjaxSuccess, 
        		failure: OC.Callbacks.afterAjaxFailure,
        		scope: this 
        	    });
        } else if (method == "POST") {
        	var cObj = YAHOO.util.Connect.asyncRequest("POST", action, {
        		success: OC.Callbacks.afterAjaxSuccess, 
        		failure: OC.Callbacks.afterAjaxFailure,
        		scope: this 
        	    }, requestData);
        }
    }
    link.on('click', _doAction, this);
    
    // pass back element to OC.LiveElements
    return this;
};

/* 
   #
   # Action Select
   #
*/
OC.ActionSelect = function(extEl) {
    // get refs
    var container = extEl;
    var select = Ext.get(Ext.query('select',container.dom)[0]);
    var submit = Ext.get(Ext.query('input[type=submit]', container.dom)[0]);
    var hideFormLink = Ext.get(document.body);
    var form = select.up('form');
    var liveEdit = select.up('.oc-js-liveEdit');
    
    // get a reference to the liveElement that this is part of.
    if (liveEdit) { 
      var liveEdit = OC.liveElements[liveEdit.id]['LiveEdit'];
    }
    
    
    //check refs
    if (!select) {
      OC.debug("ActionSelect: Couldn't get refs");
    return;
    } 
    
    //settings
    var action = form.dom.action;
    var orig_task = submit.dom.name;
    var task = submit.dom.name;
    submit.setVisibilityMode(Ext.Element.DISPLAY);
    submit.hide();

    if (task.slice(0,5) != 'task|') {
        task = 'task|' + task;
    }
    var taskValue = submit.dom.value;
    
    function _doAction(e, el, o) {
        // if the actionSelectTask element doesn't begin w/ 'task|', we add it
        submit.dom.name = task;
        OC.debug("ActionSelect: submit.dom.name: " + submit.dom.name);
        YAHOO.util.Event.stopEvent(e);
        YAHOO.util.Connect.setForm(form.dom);
        var cObj = YAHOO.util.Connect.asyncRequest("POST", action, {
          success: OC.Callbacks.afterAjaxSuccess,
          failure: OC.Callbacks.afterAjaxFailure,
          scope: this
	    }, "mode=async&" + task + "=" + taskValue);
        // restore original task element name
        submit.dom.name = orig_task;
    }
    select.on('change', _doAction, this);
    
    function _hideParentForm(e, el) {
      if (liveEdit.isOpen()) {
        liveEdit.hideForm(e, el);
      }
    }
    if (hideFormLink) {
      hideFormLink.on('click', _hideParentForm, this);
    }
    
    
    // pass back element to OC.LiveElements
    return this;
};

/* 
   #
   # Action Buttons
   #
*/
OC.ActionButton = function(extEl) {
    // get refs
    this.button = extEl;
    var form = this.button.up('form');
    var name = this.button.dom.name.replace('task|', "");

    // In order to have good performance, actionButtons
    // must be tagged if they actually have an indicator.  This
    // prevents really expensive whole page searches otherwise.
    if (extEl.hasClass('oc-has-indicator')) {
      this.indicator = Ext.get('indicator|' + name);
    }
        
    // check refs
    if (!this.button || !form) {
      OC.debug("ActionButton: Couldn't get refs");
      return;
        } 
    
    // settings
    var action = form.dom.action;
    var task = this.button.dom.name;
    var taskValue = this.button.dom.value;
    var isUpload = false;
    this.origButtonValue = this.button.dom.value;
    if (this.indicator) {
      this.indicator.setVisibilityMode(Ext.Element.DISPLAY);
      this.indicator.hide();
    }
    
    if (form.dom.enctype == "multipart/form-data") {
      OC.debug("is upload ...");
      isUpload = true;
    }
  
    function _actionButtonClick(e, el, o) {
    
     try { this.indicator.show(); } catch(err) { OC.debug(err); }
     
     try { this.button.dom.value = "Please wait..."; this.button.dom.disabled = true; } catch(err) { OC.debug(err); }
	   
	   OC.debug("_actionButtonClick");
    
     YAHOO.util.Event.stopEvent(e);
      if (isUpload) {
          YAHOO.util.Connect.setForm(form.dom, true);
      } else {
          YAHOO.util.Connect.setForm(form.dom);
      }
      OC.debug("...........task is " + task);
     var cObj = YAHOO.util.Connect.asyncRequest("POST", action, {
	     success: OC.Callbacks.afterAjaxSuccess,
	     upload: OC.Callbacks.afterAjaxSuccess,
	     failure: OC.Callbacks.afterAjaxFailure,
	     scope: this
	 }, "mode=async&" + task + "=" + taskValue);

     if( task == "task|upload-attachment" ) {
     
       // can't cross-browser clear a file input.  Recreate it and delete the original
       var oldInput = Ext.get("attachmentFile");
       var inputHTML = oldInput.dom.parentNode.innerHTML;       
       var newInput = Ext.DomHelper.insertHtml('beforeBegin', oldInput.dom, inputHTML);
       oldInput.remove();
       
       // clear title field
       Ext.get("attachmentTitle").dom.value = "";

     }

    }
    this.button.on('click', _actionButtonClick, this);
    
    // pass back element to OC.LiveElements
    return this;
};

/* 
   #
   # CheckAll
   #
*/
OC.CheckAll = function(extEl) {
    // get refs
    var checkAll = extEl;
    var form = checkAll.up('form');  
    OC.debug(checkAll);
    OC.debug(form);
    var allBoxes = Ext.select(Ext.query('input[type=checkbox]:not(.oc-js-checkAll-never)', form.dom));
    
    OC.debug(allBoxes);
    // check refs
    if (!checkAll || !form || !allBoxes) {
	OC.debug("CheckAll: Couldn't get refs");
    } 
    
    function _toggleCheckBoxes(e, el, o) {
	OC.debug('_checkAllClick');
	if (el.checked) {
	    allBoxes.set({checked: true}, false);
	} else {
	    allBoxes.set({checked: false}, false);
	}
    }
    
    checkAll.on('click', _toggleCheckBoxes, this); 
    
    // pass back element to OC.LiveElements
    return this;
};

/*
  #
  # Live Validatee
  #
*/
OC.LiveValidatee = function(extEl) {
    // get refs
    var field = extEl;
    var form = field.up('form');
    
    function _validateField(e, el, o) {
	
	var request = "";
	for (var i=0; i<form.dom.elements.length; i++) {
	    var input = form.dom.elements[i];
	    if (input.value && input.type != 'submit') {
		OC.debug(form.dom.elements[i]);
		request += form.dom.elements[i].name + "=" + form.dom.elements[i].value + "&";
	    }
	}      
	
	// send ajax request
	var action = form.dom.action;
	
	var cObj = YAHOO.util.Connect.asyncRequest("POST", action, {
		success: OC.Callbacks.afterAjaxSuccess, 
		failure: OC.Callbacks.afterAjaxFailure, 
		scope: this 
	    }, request + "task|validate=validate&mode=async");
	
    }
    
    field.on('blur', _validateField, this);
    
    function _afterValidateFailure(o) {
	
    }
    
    // pass back element to OC.LiveElements
    return this;
    
};

/* 
   #
   # Auto Focus
   # 
*/
OC.AutoFocus = function(extEl) {
    // get refs
    extEl.dom.focus();
    
    // pass back element to OC.LiveElements
    return this;
};

/*
  #
  # Focus Field
  #
*/
OC.FocusField = function(extEl) {
    // get refs
    var field = extEl;
    
    // check refs
    if (!field) {
	OC.debug("FocusField: Could not get refs");
	return;
    }
    
    function _highlightField(e, el, o) {
	var container = Ext.get(el).up('.oc-fieldBlock'); 
	if (container) {
	    container.addClass('oc-fieldBlock-focused');
	}
	Ext.get(el).addClass('oc-fieldBlock-focused');
    }
    function _unHighlightField (e, el, o) {
	var container = Ext.get(el).up('.oc-fieldBlock'); 
	if (container) {
	    container.removeClass('oc-fieldBlock-focused');
	}
	Ext.get(el).removeClass('oc-fieldBlock-focused');
    }
    field.on('focus', _highlightField, this);
    field.on('blur', _unHighlightField, this);
    
    // pass back element to OC.LiveElements
    return this;
};

/* 
   #
   # OC Upload Form
   # FIXME: Re-do this so it works as a LiveForm
   # 
*/
OC.UploadForm = function(extEl) {
    //get references
    var form = extEl;
    var targetId = Ext.get(Ext.query('input[name=oc-target]',form.dom)[0]).dom.value;
    var target = Ext.get(targetId);
    var indicator = Ext.get(Ext.query('.oc-indicator',form.dom)[0]);
    var submit = Ext.get(Ext.query('input[type=submit]',form.dom)[0])
    
    //check refs
    if (!form || !target || !indicator || !submit) {
        OC.debug('UploadForm: element missing');
        return;
    }
    
    //vars & settings
    var isUpload = false;
    if (form.dom.enctype)
        isUpload = true;
    OC.debug("Enctype: " + form.dom.enctype);
    indicator.setVisibilityMode(Ext.Element.DISPLAY);
    indicator.hide();
    
    // loading
    function _startLoading() {
        indicator.show();
        submit.dom.disabled = true;
        submit.originalValue = submit.dom.value;
        submit.dom.value = "Please wait..."
	    }
    function _stopLoading() {
        indicator.hide();
        submit.dom.disabled = false;
        submit.dom.value = submit.originalValue;
        form.dom.reset();
    }
    
    //ajax request
    function _formSubmit(e, el, o) {
        YAHOO.util.Event.stopEvent(e);
        
        if (isUpload)
            YAHOO.util.Connect.setForm(el, true);
        else 
            YAHOO.util.Connect.setForm(el);
	
        var callback = {
	    success: _afterSuccess,
	    upload: _afterUpload,
	    failure: _afterFailure,
	    scope: this
        }
	OC.debug("Action: " + form.dom.action);
        var cObj = YAHOO.util.Connect.asyncRequest("POST", form.dom.action, callback);
        _startLoading(); 
	
    }
    form.on('submit', _formSubmit, this);
    
    // after request
    function _afterUpload(o) {
        _stopLoading(); 
        
        // response object will be { status : success }  or { status : failure }
        var response = eval( '(' + o.responseText + ')' );
        
        switch (response.status) {
	case "success" :
            _afterUploadSuccess(response);
	    break;
	case "failure" :
            _afterUploadFailure(response);
	    break;
	default:
            OC.debug('_afterUpload response.status: default');
        } 
    }
    function _afterUploadSuccess(response) {
	OC.debug('_afterUploadSuccess');
	
	//2nd ajax request
	var cObj = YAHOO.util.Connect.asyncRequest("GET", response.updateURL, { 
		success: function(o) {
		    
		    // insert new - DomHelper.insertHtml converts string to DOM nodes
		    o.responseText = Ext.util.Format.trim(o.responseText);
		    var newNode = Ext.DomHelper.insertHtml('beforeEnd', target.dom, o.responseText);
		    Ext.get(newNode).highlight("ffffcc", { endColor: "eeeeee"});
		    
		    //re-up behaviors on new element
		    OC.breatheLife(newNode);
		}, 
		failure: function(o) {
		    OC.debug('upload failed');
		},
		scope: this 
	    });
	
      
    }
    
    function _afterFailure(o) {
        OC.debug('_afterFailure RESPONSE BELOW:\n\n');
        for (prop in o) {
	    OC.debug(prop + ":");
	    OC.debug(o["" + prop + ""]);
        }
    }
    function _afterSuccess(o) {
        OC.debug('_afterSuccess RESPONSE BELOW:\n\n'); 
        for (prop in o) {
	    OC.debug(prop + ":");
	    OC.debug(o["" + prop + ""]);
        }
    }
    
    return this;
};

/*
  #
  # DropDown
  #
*/
OC.DropDown  = function(extEl) {
    // get refs
    var container = extEl;
    var topLink = Ext.get(Ext.query("#" + container.id + " > a")[0]);
    var submenu = Ext.get(Ext.query('ul', container.dom)[0]);
    var unclickArea = Ext.get(document.body);
    
    // check refs
    if (!container || !submenu || !unclickArea) {
      OC.debug("TopNav: couldn't get refs");
      return;
        } 
    
    // settings
    var overrideHide = false;
    
    function _toggleMenu(e) {
      if (submenu.isVisible()) {
        _hideMenu();          
      } else {
        _showMenu();
      }
    }
    
    function _showMenu() {
      _hideMenu();
      submenu.show();
      overrideHide = true;
      container.addClass('oc-selected');
    }
    
    function _hideMenu() {
      if (!overrideHide) {
          submenu.hide();
          container.removeClass('oc-selected');
      }
      overrideHide = false;
    }
    
    function _toggleMenuPreview() {
      if (container.hasClass('oc-hover')) {
          container.removeClass('oc-hover');
      } else {
          container.addClass('oc-hover');
      }
    } 
  
    container.on('mouseover', _toggleMenuPreview, this);
    container.on('mouseout', _toggleMenuPreview, this);
    container.on('click', _toggleMenu, this);
    
    if (topLink) {
      topLink.on('click', function(e, el) {
        YAHOO.util.Event.preventDefault(e);
      });
    }
    
    unclickArea.on('click', _hideMenu, this );
    
    // pass back element to OC.LiveElements
    return this;
};

/* 
  #
  # Auto Height Content
  #
*/
OC.AutoHeightContent = function(extEl) {
  // get refs
  var content = extEl;
  
  // check refs
  if (!content) {
    OC.debug("AutoHeightContent: couldn't get refs");
  }
  
  // settings
  var currentHeight = content.dom.offsetHeight;
  
  if (currentHeight < 430) {
    content.dom.style.height = "430px";
  }  
  
  return this;
}

/* 
   #
   #  Project Create Form
   #
*/
OC.ProjectCreateForm = function(extEl) {
    // get refs
    var form = extEl;
    var nameField = Ext.get(Ext.query('#title')[0], form.dom);
    var urlField = Ext.get(Ext.query('#projid')[0], form.dom);
    
    // check refs
    if (!form || !nameField || !urlField) {
	     OC.debug("ProjectCreateForm: couldn't get refs");
    }
    
    // settings & properties
    /* has the user manually overridden our suggested url? */
    var customUrl = false;
    
    // suggested URL
    var suggestedUrl = "";
    
    function _urlize(e, el, o) {
      if (!customUrl) {
          suggestedUrl = Ext.util.Format.trim(el.value).toLowerCase().replace(/[^a-zA-Z0-9\s_-]/gi, "").replace(/\s+/g, "-");
          urlField.dom.value = suggestedUrl;
      } else {
          OC.debug('custom URL: will not suggest'); 
      }
    }
    nameField.on('keyup', _urlize, this);
    urlField.on('keyup', _urlize, this);
    
    function _checkForCustomUrl(e, el, o) {
      if (el.value != suggestedUrl) {
          customUrl = true;
          OC.debug('custom url')
        }
      OC.debug('customUrl: ' + customUrl)
    }
    urlField.on('keyup', _checkForCustomUrl, this);
    
    /* TO DO: Validate project url via Ajax
       #  title field: onblur
       #  url field: onkeyup
       #
    */  
    
    // pass back element to OC.LiveElements
    return this;
    
}; // end OC.ProjectCreateForm()

/* 
   #
   # Live Edit
   # Show/hide editable version of a value.  
   #
*/
OC.LiveEdit = function(extEl) {
    
    // get references
    var container = extEl;
    var value = Ext.get(Ext.query('.oc-js-liveEdit-value', container.dom)[0]); 
    var editForm = Ext.get(Ext.query('.oc-js-liveEdit-editForm', container.dom)[0]);  
      
    var showFormLink = Ext.select(Ext.query('.oc-js-liveEdit_showForm', container.dom));
    var hoverShowFormLink = Ext.select(Ext.query('.oc-js-liveEdit_hoverShowForm', container.dom));
    var hideFormLink = Ext.select(Ext.query('.oc-js-liveEdit_hideForm', container.dom));
    //if (hideFormLink.elements.length == 0) hideFormLink = Ext.get(document.body);
        
    if (!value || !editForm) {
        OC.debug("liveEdit: Couldn't get element refs");
        return;
    }
    
    // settings
    value.setVisibilityMode(Ext.Element.DISPLAY);
    editForm.setVisibilityMode(Ext.Element.DISPLAY);
    editForm.hide();
    var hideThisForm = false;
    var directEdit = false;
    if (value.hasClass('oc-directEdit')) {
      directEdit = true;
    }
    
    // make sure a click on the container doesn't close the form.  stop the event bubbling.
    container.on('click', _stopEvent, this)
    function _stopEvent(e) {
      OC.debug("stopEvent");
      e.stopPropagation();
    }

    function _toggleForm(e) {
        if (editForm.isVisible()) {
          _hideForm(e);
        } else {
          _showForm(e);
        }
    }
    
    function _hideForm(e, el) {
        if (hideThisForm) {
          if (Ext.get(el)) {
            if (Ext.get(el).hasClass('oc-js-liveEdit_hideForm')) {
              e.preventDefault();
            }
          }
          value.show();
          editForm.hide();
        }
        hideThisForm = false;
    }

    function _showForm(e) {
        e.stopEvent();
        value.hide();
        editForm.show();
        hideThisForm = true;
        var form = Ext.get(Ext.query('input[type=text]', editForm.dom)[0]) || Ext.get(Ext.query('select', editForm.dom)[0]);
        if (form) { form.focus(); }
    }
    
    if (showFormLink) {
      showFormLink.on('click', _showForm, this, {stopPropagation: true});
    }
    if (hoverShowFormLink) { 
      hoverShowFormLink.on('click', _toggleForm, this);
    }
    if (hideFormLink) {
        hideFormLink.on('click', _hideForm, this);
    }
    
    if (directEdit) {
      // liveEdit value behaviors
      function _valueMouseover(e, el, o) {
          value.addClass('oc-directEdit-hover');
      }
      value.on('mouseover', _valueMouseover, this);
      
      function _valueMouseout(e, el, o) {
          value.removeClass('oc-directEdit-hover');
      }
      value.on('mouseout', _valueMouseout, this);
    }
    
    
    // Public properties & methods
    this.toggleForm = function(e) {
      _toggleForm(e);
    }
    this.hideForm = function(e) {
      _hideForm(e);
    }
    this.isOpen = function() {
      if (!value.isVisible() && editForm.isVisible()) {
        return true;
      } else {
        return false;
      }
    }
    
    return this;
};

OC.DirectEdit = function(extEl) {
    

}

/* 
   #
   # Search Links
   #
*/
OC.SearchLinks = function(extEl) {
    // get references
    var form = extEl.dom.getElementsByTagName('form')[0];
    var links = Ext.select(Ext.query('a' ,form));
    var text = Ext.get(Ext.query('input[type=text]', form)[0]);
    
    // check refs
    if (!form || !links || !text) {
	OC.debug("SearchLinks: could not get element refs");
    } 
    
    // find current value
    var url = window.location.toString();
    var urlBase = url.split('?')[0];
    var querystring = url.split('?')[1] || "";
    if (querystring) {  
	var param_groups = querystring.split('&');
	var params = {}
	for (var i=0; i<param_groups.length; i++) {
	    var key = param_groups[i].split("=")[0];
	    var value = param_groups[i].split("=")[1];
	    params[key] = value;
	}
    }
    
    function _linksMouseover(e, el, o) {
	var el_urlBase = el.href.split('?')[0];
	
	if (text.dom.value) {
	    // get form value
	    var newQuery = YAHOO.util.Connect.setForm(form);
	    // replace link 
	    el.href = el_urlBase + "?" + newQuery;    
	} else {
	    el.href = el_urlBase + "?" + querystring;
	}
	
    }
    links.on('mouseover', _linksMouseover, this);
    
    // pass back element to OC.LiveElements
    return this;
    
}; // end OC.SearchLinks();

/* 
   #
   # Close Buttons
   #
*/
OC.CloseButton = function(extEl) {
    // get references.  No ID naming scheme.  just use parent node.
    var container = extEl;
    var close_button = Ext.get(document.createElement('a'));
    close_button.dom.innerHTML = '&times;';
    close_button.dom.href = '#';
    close_button.dom.title = 'close';
    close_button.addClass('oc-closeButton');
    container.dom.appendChild(close_button.dom);
    container.setVisibilityMode(Ext.Element.DISPLAY);
    
    //behaviors
    function _closeButtonClick(e, el, o) {
        container.fadeOut({});
        YAHOO.util.Event.stopEvent(e);
    }
    close_button.on('click', _closeButtonClick, this);
    
    return this;
};

/*
  #
  # Warn Popups
  #  -- THIS IS DUMB AND SHOULD BE LOOKED OVER BY NICK TO MAKE BETTER
*/
OC.FeatureletUndeleteWarner = function(extEl) {

  //get refs
  var container = extEl;
  var checkbox = Ext.get(container.dom.getElementsByTagName('input')[0]);
  var warning = Ext.get(Ext.query('.oc-warning', container.dom)[0]);
  
  //check refs
  if (!checkbox || !container || !warning) {
    return;
  } 

  // we only want to display the error message
  // if the element wasn't already selected by default
  // in other words, only display the warning if the user is taking away
  // the featurelet, not if they added it and took it away
  if (checkbox.dom.checked) {
    checkbox.on('click', function(e, el) { 
      if (!el.checked) {
        warning.show();
      } else {
        warning.hide();
      }
    });
  }
};

/* 
   #
   # Select Box Auto Links
   #
*/
OC.AutoSelect = function(extEl) {
    // get references.  No ID naming scheme yet.  just use parent node.
    var select = extEl;
    var form = select.dom.parentNode;
    var submit = Ext.get(Ext.query('input[type=submit]', form)[0]) || Ext.get(Ext.query('button[type=submit]', form)[0]);
    
    
    if (!select || !submit || !form) {
	OC.debug('AutoSelect: couldnt get refs;');
	return;
    } else {
	OC.debug("AutoSelect: got refs");
    }
    
    //submit 
    submit.setVisibilityMode(Ext.Element.DISPLAY);
    submit.hide();
    
    //behaviors
    function _selectChange(e, el, o) {
        form.submit();
    } 
    select.on('change', _selectChange, this);
    
    return this;
};

/* 
   #
   # Expanders
   #
*/
OC.Expander = function(extEl) {
    // get references.
    var container = extEl;
    var expanderLink = Ext.select(Ext.query(".oc-js-expander_open", container.dom));
    var content = Ext.get(Ext.query(".oc-js-expander-content",  container.dom)[0]);
    var closeLink = Ext.select(Ext.query(".oc-js-expander_close", container.dom));
    
    // check to make sure we have everything
    if(!container || !expanderLink || !content) {
	     OC.debug('OC.Expander: couldn\'t get element references');
        return;
    }
    
    // settings
    content.setVisibilityMode(Ext.Element.DISPLAY);	
    
    function _expand() {
	   content.slideIn('t',{duration: .1});
	   container.addClass('oc-expander-open');
	   expanderLink.addClass('oc-expanderLink-open');
	   if (closeLink) closeLink.show();
    }
    function _contract() {
    content.slideOut('t',{duration: .1});
    container.removeClass('oc-expander-open');
    expanderLink.removeClass('oc-expanderLink-open');
    if (closeLink) closeLink.hide();
    }
    
    //link
    function _linkClick(e, el, o) {
        if (!content.isVisible()) {
            _expand();
        } else {
            _contract();
        } 
        YAHOO.util.Event.stopEvent(e);
    }
    expanderLink.on('click', _linkClick, this);
    if (closeLink) closeLink.on('click', _linkClick, this);
        
    // init (when breatheLife is called)
    if (!container.hasClass('oc-expander-open')) {
	_contract();
    }
    
    return this;
};


/*
  #
  # Clear all inputs of the form this element appears in
  #
*/
OC.FieldClear = function(extEl) {
    // get references
    var link = extEl;
    var fieldname = link.dom.getAttribute("oc:target");
    var field = document.getElementById(fieldname);
    
    // check references
    if (!link || !field) {
        OC.debug("OC.FieldClear could not get references");
        return;
    }

    function _clearField() {
        OC.debug("in clearField");
        field.value = "";
    }

    link.on("click", _clearField, this, {preventDefault: true});
};


/*
  #
  # History List
  #
*/
OC.HistoryList = function(extEl) {
    // setup references
    var form = extEl;
    var compareButtons = Ext.select('#' + form.dom.id + ' input[type=submit]');
    var versions  = Ext.get(Ext.select('#' + form.dom.id + ' li'));
    var checkboxes = Ext.get(Ext.select('#' + form.dom.id + ' input[type=checkbox]'));
    var userMessage = Ext.get(Ext.query('.oc-message', form.dom)[0]);
    
    //check references
    if (!form || !compareButtons || !versions || !userMessage) {
        OC.debug("OC.historyList couldn't get all element references.");   
        return;
    }
    
    //validator
    userMessage.setVisibilityMode(Ext.Element.DISPLAY);
    userMessage.hide();
    
    //compare buttons
    var enableCompareButtons = true;
    function _compareButtonClick(e, el, o) {
	if (!enableCompareButtons) {
	    YAHOO.util.Event.stopEvent(e);
	    userMessage.update("Please select exactly two versions to compare.");
	    userMessage.addClass('oc-message-error');
	    userMessage.show();
	}
    }
    compareButtons.on('click', _compareButtonClick, this);
    
    //checkboxes
    function _clearCheckboxes() {
	checkboxes.each(function(extEl) {
		extEl.dom.checked = false;
		Ext.get(extEl.dom.parentNode).removeClass('oc-selected');
	    });
    }
    function _countChecked() {
	//count # checked
	var numChecked = 0;
	checkboxes.each(function(extEl) {
		if (extEl.dom.checked) {
		    numChecked++;
		}
	    });
	OC.debug(numChecked);
	return numChecked;
    }
    function _setList() {
	//if exactly 2, enable compare buttons
	if (_countChecked() == 2) {
	    enableCompareButtons = true;
	    userMessage.fadeOut();
	} else {
	    enableCompareButtons = false;   
	}
	
	checkboxes.each(function(extEl) {
		//highlight this checkbox's parent
		if (extEl.dom.checked) 
		    Ext.get(extEl.dom.parentNode).addClass('oc-selected');
		else
		    Ext.get(extEl.dom.parentNode).removeClass('oc-selected');
	    }, this);
    }
    
    function _checkboxClick(e, el, o) {
	var checkMe = false;
	if (el.checked) {
	    checkMe = true;
	}
	//if more than 2, clear all and check currentStyle
	if (_countChecked() > 2) {
	    _clearCheckboxes();
	} 
	if (checkMe) {
	    // re-check since checklist clears it
	    el.checked = true;
	}
	_setList();
    }
    checkboxes.on('click', _checkboxClick, this)
    
    //Init
    _setList();
    
    OC.debug(form.dom.elements);
    
    return this;
};

OC.Toggler = function(extEl) {
    var checkbox = extEl;
    var label = Ext.get(checkbox.dom.id.replace('toggler', 'togglee'));
    var radio = Ext.get(label.dom.getElementsByTagName('input')[0]);
    var wiki = Ext.get(Ext.get('oc-js-togglee-wiki').dom.getElementsByTagName('input')[0]);
    // check references
    if (!checkbox || !radio || !wiki || !label) {
        OC.debug('Error getting references for toggler');
        return false;
    }
    _handle_toggle();
    function _handle_toggle() {
        if (checkbox.dom.checked) {
            radio.dom.disabled = false;
            label.removeClass('oc-disabled');
        } else {
            radio.dom.disabled = true;
            label.addClass('oc-disabled');
            if (radio.dom.checked) {
                wiki.dom.checked = true;
            }
        }
    }
    checkbox.on('click', _handle_toggle, this);
};

/*
#  Confirmation for Project Deletion
*/

OC.ConfirmProjectDelete = function(extEl) {

  //get refs
  var button = extEl;
  
  //check refs
  if (!button) {
    return;
  }
  
  extEl.on('click', function(e, el) { 
          //YAHOO.util.Event.preventDefault(e);
          var msg = "Project deletion is permanent and irreversible <br /><br /> Are you sure you want to remove this project?<br />";
          Ext.MessageBox.confirm('Confirm', msg, _callback(e));
   });

  function _callback(e) {
      return function (conf_id) {
          if (conf_id != 'yes'){
              YAHOO.util.Event.preventDefault(e);
          }
      }
  }

}
