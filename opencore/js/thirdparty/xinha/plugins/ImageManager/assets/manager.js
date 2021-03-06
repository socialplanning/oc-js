/**
 * Functions for the ImageManager, used by manager.php only	
 * @author $Author: ray $
 * @version $Id: manager.js 704 2007-01-29 13:53:12Z ray $
 * @package ImageManager
 */
	
//Translation
function i18n(str) {
        return HTMLArea._lc(str, 'ImageManager');
}


//set the alignment options
function setAlign(align) 
{
    var selection = document.getElementById('f_align');
    for(var i = 0; i < selection.length; i++)
	{
	    if(selection.options[i].value == align)
		{
		    selection.selectedIndex = i;
		    break;
		}
	}
}

	//initialise the form
init = function () 
{
    __dlg_init(null, {width:600,height:460});
    
    __dlg_translate('ImageManager');
    
    // This is so the translated string shows up in the drop down.
    document.getElementById("f_align").selectedIndex = 1;
    document.getElementById("f_align").selectedIndex = 0;
    
    
    var uploadForm = document.getElementById('uploadForm');
    if(uploadForm) uploadForm.target = 'imgManager';
    
    var param = window.dialogArguments;
    if (param) 
    {
	var image_regex = new RegExp( '(https?://[^/]*)?' + base_url.replace(/\/$/, '') );
	param.f_url = param.f_url.replace( image_regex, "" );
	
	// The image URL may reference one of the automatically resized images 
	// (when the user alters the dimensions in the picker), clean that up
	// so it looks right and we get back to a normal f_url
	var rd = (_resized_dir) ? _resized_dir.replace(Xinha.RE_Specials, '\\$1') + '/' : '';
	var rp = _resized_prefix.replace(Xinha.RE_Specials, '\\$1');
	var dreg = new RegExp('^(.*/)' + rd + rp + '_([0-9]+)x([0-9]+)_([^/]+)$');
	
	if(dreg.test(param.f_url))
	    {
		param.f_url    = RegExp.$1 + RegExp.$4;
		param.f_width  = RegExp.$2;
		param.f_height = RegExp.$3;
	    }
	
	for (var id in param)
	    {
		if(id == 'f_align') continue;
		if(document.getElementById(id))
		    {
			document.getElementById(id).value = param[id];
		    }
	    }
	
	
	
	document.getElementById("orginal_width").value = param["f_width"];
	document.getElementById("orginal_height").value = param["f_height"];
	setAlign(param["f_align"]);
	
    }
    
    document.getElementById("f_alt").focus();
    
    // For some reason dialog is not shrinkwrapping correctly in IE so we have to explicitly size it for now.
    // if(HTMLArea.is_ie) window.resizeTo(600, 460);
};


function onCancel() 
{
    __dlg_close(null);
    return false;
}

function onOK() 
{
    // pass data back to the calling window
    var fields = ["f_url", "f_alt", "f_align", "f_width", "f_height", "f_padding", "f_margin", "f_border"];
    var param = new Object();
    for (var i in fields) 
	{
	    var id = fields[i];
	    var el = document.getElementById(id);
	    if(id == "f_url" && el.value.indexOf('://') < 0 )
		{
		    
		    if ( el.value == "" )
			{
			    alert( i18n("No Image selected.") );
			    return( false );
			}
		    
		    param[id] = makeURL(base_url,el.value);
		}
	    else if (el)
		param[id] = el.value;
	    else alert("Missing " + fields[i]);
	    
	}
    

    __dlg_close(param);
    return false;
}

//similar to the Files::makeFile() in Files.php
function makeURL(pathA, pathB) 
{
    if(pathA.substring(pathA.length-1) != '/')
	pathA += '/';
    
    if(pathB.charAt(0) == '/');	
    pathB = pathB.substring(1);
    
    return pathA+pathB;
}


function toggleConstrains(constrains) 
{
    var lockImage = document.getElementById('imgLock');
    var constrains = document.getElementById('constrain_prop');
    
    if(constrains.checked) 
	{
	    lockImage.src = "img/locked.gif";	
	    checkConstrains('width') ;
	}
    else
	{
	    lockImage.src = "img/unlocked.gif";	
	}
}

function checkConstrains(changed) 
{
    //alert(document.form1.constrain_prop);
    var constrains = document.getElementById('constrain_prop');
    
    if(constrains.checked) 
	{
	    var obj = document.getElementById('orginal_width');
	    var orginal_width = parseInt(obj.value);
	    var obj = document.getElementById('orginal_height');
	    var orginal_height = parseInt(obj.value);
	    
	    var widthObj = document.getElementById('f_width');
	    var heightObj = document.getElementById('f_height');
	    
	    var width = parseInt(widthObj.value);
	    var height = parseInt(heightObj.value);
	    
	    if(orginal_width > 0 && orginal_height > 0) 
		{
		    if(changed == 'width' && width > 0) {
			heightObj.value = parseInt((width/orginal_width)*orginal_height);
		    }
		    
		    if(changed == 'height' && height > 0) {
			widthObj.value = parseInt((height/orginal_height)*orginal_width);
		    }
		}			
	}
}

function showMessage(newMessage) 
{
    var message = document.getElementById('message');
    var messages = document.getElementById('messages');
    if(message.firstChild)
	message.removeChild(message.firstChild);
    
    message.appendChild(document.createTextNode(i18n(newMessage)));
    
    messages.style.display = '';
}

function addEvent(obj, evType, fn)
{ 
    if (obj.addEventListener) { obj.addEventListener(evType, fn, true); return true; } 
    else if (obj.attachEvent) {  var r = obj.attachEvent("on"+evType, fn);  return r;  } 
    else {  return false; } 
} 

function doUpload() 
{
    
    var uploadForm = document.getElementById('uploadForm');
    if(uploadForm)
	showMessage('Uploading');
}
addEvent(window, 'load', init);
