//
// Unless otherwise stated:
// Copyright (C) 2005-2006  ASAHI Net, Inc.  ALL RIGHTS RESERVED
//

//IE の背景画像ロードバグ修正コード
try {
 document.execCommand ("BackgroundImageCache", false, true);
}
catch (e) {
}

// Compatibility
var manaba = new Object;
manaba.option = new Object;
manaba.alert = function(msg) {
 alert(msg + "(error reported by $Id$)");
};

// BrowserInfo - ブラウザ情報
function BrowserInfo() {
 var ua = navigator.userAgent.toLowerCase();
 var info = new Object();
 info.isIE = (ua.indexOf("msie") != -1 && ua.indexOf("opera") == -1);
 info.tridentVersion = false;
 if (navigator.appVersion.match(/Trident\/(\d+\.\d+)/)) {
	 info.tridentVersion = RegExp.$1;
 }
 info.isGecko = (navigator.product == "Gecko");
 info.isOpera = window.opera;
 if (navigator.userAgent.match (/Safari/)) {
  info.isSafari = true;
 } else {
  info.isSafari = false;
 }
 if (navigator.userAgent.match (/Chrome/)) {
  info.isChrome = true;
 } else {
  info.isChrome = false;
 }
 if (info.isGecko) {
  info.isNetscape = (ua.indexOf("netscape") != -1);
 }
 info.rteditable = false;
 info.fixRTEformatBlock = info.isIE;
 info.fixRTEload = info.isIE;
 info.fixRTEfocus = info.isIE;
 info.fixRTEsetEditable = info.isIE;
 info.fixChangeFontXCoord = !! document.all;
 info.disableNativeXHR = false;
 if (info.isIE && navigator.appVersion.match(/MSIE (\d+\.\d+)/)) {
  info.rteditable = (RegExp.$1 >= 5.5);
  info.disableNativeXHR = (RegExp.$1 < 8);
 } else if (info.tridentVersion) {
  info.rteditable = (info.tridentVersion >= 7.0);
  info.fixRTEformatBlock = (info.tridentVersion >= 7.0);
  info.fixRTEload = (info.tridentVersion >= 7.0);
  info.fixRTEfocus = (info.tridentVersion >= 7.0);
  info.fixRTEsetEditable = (info.tridentVersion >= 7.0);
  info.fixChangeFontXCoord = (info.tridentVersion >= 7.0);
 } else if (info.isSafari) {
  info.rteditable = true;
 } else if (info.isOpera) {
  try {
   if (window.opera.version () >= 9.5) {
    info.rteditable = true;
   }
  } catch (e) {}
 } else if (info.isGecko) {
  info.rteditable = (navigator.productSub >= 20030210);
 }
 return info;
}

// class functions
manaba.replaceClass = function(element, name, newname) {
 var className = "";
 if ("className" in element) {
  className = element.className;
  className = className.replace (new RegExp (" *" + name), "");
 }
 element.className = className + " " + newname;
};
manaba.addClass = function (element, name) {
 var className = "";
 if ("className" in element) {
  className = element.className;
  className = className.replace (new RegExp (" *" + name), "");
 }
 element.className = className + " " + name;
};
manaba.removeClass = function (element, name) {
 var className = "";
 if ("className" in element) {
  className = element.className;
  className = className.replace (new RegExp (" *" + name), "");
 }
 element.className = className;
};
manaba.hasClass = function (element, name) {
 if (!('className' in element)) {
  return false;
 }
 var className = element.className;
 var cs = className.split (/ +/);
 for (var i = 0; i < cs.length; i ++) {
  if (cs [i] == name) {
   return true;
  }
 }
 return false;
};
manaba.hasClass$ = function (element) {
	return function(name) {
		return manaba.hasClass(element, name);
	};
};
manaba.toggleClass = function (element, name) {
 if (manaba.hasClass(element, name)) {
  manaba.removeClass(element, name);
 } else {
  manaba.addClass(element, name);
 }
};

var gBrowser = BrowserInfo();
manaba.noHTMLElement = false;
try {
 HTMLElement;
} catch(err) { manaba.noHTMLElement = true; }

/* 汎用関数 */
manaba.escapeEntity = function (text) {
 text = text
  .replace (/&/g, "&amp;")
  .replace (/</g, "&lt;")
  .replace (/>/g, "&gt;")
  .replace (/\"/g, "&quot;");
 return text;
}

manaba.addevent = function(o, type, fn) {
 if ("addEventListener" in o) {
  o.addEventListener(type, fn, false);
  return true;
 } else if ("attachEvent" in o) {
  var r = o.attachEvent("on" + type, fn);
  return r;
 } else {
  return false;
 }
};

manaba.removeevent = function(o, type, fn) {
 if ("removeEventListener" in o) {
  o.removeEventListener(type, fn, false);
  return true;
 } else if ("detachEvent" in o) {
  var r = o.detachEvent("on" + type, fn);
  return r;
 } else {
  return false;
 }
};

manaba.findParentNode = function (node, nodeName) {
 while (node) {
  if (node.nodeName.toLowerCase () == nodeName) {
   return node;
  }
  node = node.parentNode;
 }
 return null;
};

manaba.stopPropagation = function (event) {
 if (event.stopPropagation) {
  event.stopPropagation();
 } else {
  event.cancelBubble = true;
 }
};

manaba.preventDefault = function (event) {
 if (!event) event = window.event;
 if (event.preventDefault) {
  event.preventDefault();
 } else {
  event.returnValue = false;
 }
 return false;
};

// DOM互換性ライブラリ- insertAdjacentHTML
if (! (document.body && document.body.insertAdjacentHTML) || manaba.noHTMLElement) {
 try {
  if (manaba.noHTMLElement) {
   document.createElement('html');
   HTMLElement = { prototype: window["[[DOMElement.prototype]]"] || {}};
  }
  HTMLElement.prototype.insertAdjacentHTML = function(where, text) {
   var r = this.ownerDocument.createRange();
   if (where == 'afterBegin' || where == 'beforeEnd') {
    r.selectNodeContents(this);
    r.collapse(where == 'afterBegin');
   } else {
    r.selectNode(this);
    r.collapse(where == 'beforeBegin');
   }
   var node;
   if (r.createContextualFragment) {
    node = r.createContextualFragment(text);
   } else { 
    var tmpdiv = document.createElement("div");
    var child; 
    tmpdiv.innerHTML = text;
    node = document.createDocumentFragment(); 
    while ( (child = tmpdiv.firstChild) ) { 
     node.appendChild(child); 
    } 
   }
   r.insertNode(node);
  }
  if (!gBrowser.isSafari && typeof(HTMLElement.prototype.addEventListener) == "undefined") {
   HTMLElement.prototype.addEventListener = function(name,func,dir) {
    this.attachEvent(name, func);
   }
  }
 } catch(err) {
 }
}

// nullfunc
function nullfunc() { return false; }

// getEventPageX - イベント発生時のXポジション
function getEventPageX(e,winpos){
 if (! e) var e = window.event;
 if (window.opera) {     // Opera
  return (document.documentElement ? window.pageXOffset : 0) + e.clientX;
 } else if (e.pageX) {
  return e.pageX + (winpos ? window.screenX - window.pageXOffset : 0);   // Mozilla, NN4, Safari
 } else if (e.clientX) { // IE, others
  var sl = 0;
  if (document.documentElement && document.documentElement.scrollLeft) {
   sl = document.documentElement.scrollLeft;
  } else if (document.body && document.body.scrollLeft) {
   sl = document.body.scrollLeft;
  } else if (window.scrollX || window.pageXOffset)  {
   sl = (window.scrollX || window.pageXOffset);
  }
  if (winpos) sl += window.screenLeft;
  return sl + e.clientX;         
 }
 return 0;
}

// getEventPageY - イベント発生時のYポジション
function getEventPageY(e,winpos){
 if (! e) var e = window.event;
 if (window.opera) {     // Opera
  return (document.documentElement ? window.pageYOffset : 0) + e.clientY;
 } else if (e.pageY) {
  return e.pageY + (winpos ? window.screenY - window.pageYOffset : 0);   // Mozilla, NN4, Safari
 } else if (e.clientY) { // IE, others
  var st = 0;
  if (document.documentElement && document.documentElement.scrollTop) {
   st = document.documentElement.scrollTop;
  } else if (document.body && document.body.scrollTop) {
   st = document.body.scrollTop;
  } else if (window.scrollY || window.pageYOffset) {
   st = (window.scrollY || window.pageYOffset);
  }
  if (winpos) st = window.screenTop;
  return st + e.clientY;         
 }
 return 0;
}

// nextSiblingNT - テキストノードのない nextSibling
function nextSiblingNT(e) {
 while (e.nextSibling.nodeType == 3) {
  e = e.nextSibling;
 }
 return e.nextSibling;
}

// previousSiblingNT - テキストノードのない previousSibling
function previousSiblingNT(e) {
 while (e.previousSibling.nodeType == 3) {
  e = e.previousSibling;
 }
 return e.previousSibling;
}

// getElementsByClass - クラスでエレメントを探索 (Copyright Dustin Diaz 2005)
function getElementsByClass(searchClass, node, tag) {
 var classElements = new Array();
 if ( node == null ) node = document;
 if ( tag == null ) tag = '*';
 var els = node.getElementsByTagName(tag);
 var elsLen = els.length;
 var pattern = new RegExp("(^|\\s)" + searchClass + "(\\s|$)");
 for (i = 0, j = 0;  i < elsLen;  i++) {
  if ( pattern.test(els[i].className) ) {
   classElements[j] = els[i];
   j++;
  }
 }
 return classElements;
}

// naturalSize - 画像の元のサイズを naturalWidth, naturalHeight に取得
function naturalSize(o) {
 var naturalwidth  = -1;
 var naturalheight = -1;
 if (o.naturalWidth != null) {
  return true;  // naturalWidth is supported, return immediately
 } else if (o.runtimeStyle) {
  o.runtimeStyle.width= 'auto';
  o.runtimeStyle.height= 'auto';
  o.runtimeStyle.borderWidth= '0';
  o.runtimeStyle.padding= '0';
  naturalwidth = o.offsetWidth;
  naturalheight = o.offsetHeight;
  o.runtimeStyle.width= '';
  o.runtimeStyle.height= '';
  o.runtimeStyle.borderWidth= '';
  o.runtimeStyle.padding= '';
 } else  {
  var oclone = o.cloneNode(true);
  o.className = '';
  o.style.width = 'auto !important';
  o.style.height = 'auto !important';
  o.style.borderWidth= '0 !important';
  o.style.padding= '0 !important';
  o.removeAttribute('width');
  o.removeAttribute('height');
  naturalwidth = o.width;
  naturalheight = o.height;
  o.setAttribute('width', oclone.getAttribute('width'));
  o.setAttribute('height', oclone.getAttribute('height'));
  o.style.width = oclone.style.width;
  o.style.height = oclone.style.height;
  o.style.padding = oclone.style.padding;
  o.style.borderWidth = oclone.style.borderWidth;
  o.style.className = oclone.style.className;
 }

 if (naturalwidth > 0) {
  o.naturalWidth = naturalwidth;
  o.naturalHeight = naturalheight;
  return true;
 } else {
  return false;  // not supported on this platform
 } 
}

// 画像自動リサイズ
function ImageResize(o, width) {
 if (naturalSize(o) && o.naturalWidth > width) {
  o.style.width = width + 'px';
  o.style.height = Math.floor(width / o.naturalWidth * o.naturalHeight) + 'px';
 } else {
  ; // not supported on this platform, or size is small enough
 }
}

// タイマライブラリ
var gTimer = new Array;
var gTimerOffset = 0;

// SetTimeoutEvent - タイムアウトイベントを設定する
function SetTimeoutEvent(func, arg, value, count) {
 var o = new Object;
 o.func = func;
 o.arg = arg;
 o.count = count || 1;
 o.id = setTimeout("TimeoutEvent(" + gTimerOffset + ")", value);
 gTimer[gTimerOffset++] = o;
}

// TimeoutEvent - タイムアウトイベント
function TimeoutEvent(arg) {
 var o = gTimer[arg];
 if (o) {
  o.func(o.arg);
  if (--o.count <= 0) {
   clearInterval(o.id);
   gTimer[arg] = null;
  }
 }
}

// イベントターゲット
function evtarget(e) {
 var targ;

 if (! e) var e = window.event;
 if (e.target) {
  targ = e.target;
 } else if (e.srcElement) {
  targ = e.srcElement;
 }
 if (targ.nodeType == 3) targ = targ.parentNode;
 return targ;
}

// タグ
function tagString(s, tag) {
 return '<' + tag + '>' + s + '</' + tag + '>';
}

/* button up/down */
function ButtonDown(e) {
 e.style.borderStyle = 'inset';
}

function ButtonUp(e) {
 e.style.borderStyle = 'outset';
}

/* language */
var Lang = 'ja';

function SetLang(n) {
 if (n == 'en' /* || n == 'de' */ ) {
  Lang = n;
 } else {
  Lang = 'ja';
 }
}

function TestLoc(e) {
 var t = "Left: " + e.scrollLeft+ "\n" +
  "Top: " + e.offsetY + "\n" +
  "Style left: " + e.style.left + "\n" +
  "Style top: " + e.style.top ;
 alert(t);
}

var prevfocus, prevhilite;

function texthilite(element) {
 var e;
 
 e = document.getElementById('t' + element);
 if (!e) return;
 if (e != prevhilite) {
  if (prevhilite) {
   manaba.removeClass (prevhilite, "texthilite");
  }
  manaba.addClass (e, "texthilite");
 }
 prevhilite = e;
}

function textfocus(element) {
 var e;
 
 e = document.getElementById('t' + element);
 if (!e) return;
 if (e != prevfocus) {
  if (prevfocus) {
   manaba.removeClass (prevhilite, "textfocus");
  }
  manaba.addClass (e, "textfocus");
 }
 document.getElementById(element).focus()
}

function textunfocus(element) {
 var e;
 
 e = document.getElementById('t' + element);
 if (!e) return;
 manaba.addClass (e, "textfocus");
 document.getElementById('b' + element).style.visibility = 'hidden';
}

function highlight(element) {
 var e = document.getElementById(element);
 if (!e) return;
 manaba.addClass (e, "highlight");
}

function dim(element) {
 var e = document.getElementById(element);
 if (!e) return;
 manaba.removeClass (e, "highlight");
}

function bgcolor(object, color) {
 object.style.backgroundColor = color;
}

function scrolldown() {
 window.scrollBy(0,400)
}

var prevhilite;

function hiliteById(id) {
 var e = document.getElementById(id);
 if (e) hilite(e, 1);
}

// hilite - most used highlight function
function hilite(element, dontmark, next) {
 if (prevhilite) {
  manaba.removeClass (prevhilite, "hilitecolor");
  if (next) {
   manaba.removeClass (nextSiblingNT(prevhilite), "hilitecolor");
  }
 }
 manaba.addClass (element, "hilitecolor");
 if (next) {
  manaba.addClass (nextSiblingNT(element), "hilitecolor");
 }
 
 prevhilite = element;
 if (! dontmark) {
  SetTimeoutEvent(MarkAsRead, element, 300, 1)
 }
}

// メンバーリスト用
function hilitemblsit(element, dontmark, next) {
 if (prevhilite) {
  manaba.removeClass (prevhilite, "hilitemblsit");
  if (next) {
   manaba.removeClass (nextSiblingNT(prevhilite), "hilitemblsit");
  }
 }
 manaba.addClass (element, "hilitemblsit");
 if (next) {
  manaba.addClass (nextSiblingNT(element), "hilitemblsit");
 }
 
 prevhilite = element;
 if (! dontmark) {
  SetTimeoutEvent(MarkAsRead, element, 300, 1)
 }
}

function unhilite(element) {
 /* no longer necessary */
}

var gArticleHilite = null;

// HiliteArticle - high light an article
function HiliteArticle(o) {
 if (gArticleHilite == o) return false;
 if (! o.className.match(/articlecontainer/)) return false;
 manaba.addClass (o, "hilitearticle");
 if (gArticleHilite) {
  manaba.removeClass (gArticleHilite, "hilitearticle");
 }
 gArticleHilite = o;
}

var prevhilite1, prevhilite2;

function hilite2(element1, element2) {
 if (element1 != prevhilite1) {
  if (prevhilite1) {
   manaba.removeClass (prevhilite1, "hilite2");
  }
  manaba.addClass (element1, "hilite2");
  prevhilite1 = element1;
 }
 if (element2 != prevhilite2) {
  if (prevhilite2) {
   manaba.removeClass (prevhilite2, "hilite2");
  }
  manaba.addClass (element2, "hilite2");
  prevhilite2 = element2;
 }
}
 
function textarea_wider(id) {
 var e;

 e = document.getElementById(id);
 e.cols = e.cols + 10;
}

function textarea_narrower(id) {
 var e;

 e = document.getElementById(id);
 e.cols = (e.cols - 10 < 30 ? 30 : e.cols - 10);
}

function textarea_taller(id) {
 var e;

 e = document.getElementById(id);
 e.rows = e.rows + 10;
}

function textarea_shorter(id) {
 var e;




 e = document.getElementById(id);
 e.rows = (e.rows - 10 < 10 ? 10 : e.rows - 10);
}

function textarea_savesize(id) {
 var e, r, c;

 e = document.getElementById(id);
 r = document.getElementById('cTextArea_rows');
 c = document.getElementById('cTextArea_cols');
 if (r) r.value = e.rows;
 if (c) c.value = e.cols;
}

// MakeVisible
function MakeVisible(o) {
 FlipDisplayObject(o,'hide');
 return false;
} 

function MakeVisibleById(id) {
 var o = document.getElementById(id);
 if (o) {
   return MakeVisible(o);
 }
}

// MakeHide
function MakeHide(o) {
 FlipDisplayObject(o,'visible');
 return false;
} 

function MakeHideById(id) {
 var o = document.getElementById(id);
 if (o) {
   return MakeHide(o);
 }
}

// SwitchVisibleElement - スイッチを押すと表示エレメントが変わる
function SwitchVisibleElement(swid, eid, display) {
 if (!display) display = 'block';
 var o = document.getElementById(swid);
 if (o) o.style.display = 'none';
 o = document.getElementById(eid);
 if (o) {
  o.style.display = display;
  o.style.visibility = 'visible';
 }
 return false;
}

var currentactive = 'section0';

function activate(element) {
 var o;

 if (element == currentactive) {
  return;
 }
 o = document.getElementById(currentactive);
 o.style.visibility = 'hidden';
 o.style.display = 'none';
 o = document.getElementById(element);
 o.style.visibility = 'visible';
 o.style.display = 'block';
 currentactive = element;
 o = document.getElementById('input_' + currentactive);
 if (o) {
  o.focus();
 } else {
  alert();
 }
}

/* FlipDisplayById - flip display or none */
function FlipDisplayObject(obj,notdo) {
  if ((!obj.style.visibility || obj.style.visibility == 'hidden' || obj.style.display == 'none') && notdo != 'visible') {
   obj.style.display = 'block';
   obj.style.visibility = 'visible';
   setTimeout (function () {
    var i, nodes;
    if (true) { //!gBrowser.isIE) {
     nodes = obj.getElementsByTagName ("iframe");
     for (i = 0; i < nodes.length; i ++) {
      try {
       nodes [i].contentWindow.focus ();
      } catch (e) {}
     }
    }
    nodes = obj.getElementsByTagName ("input");
    for (i = 0; i < nodes.length; i ++) {
     if (nodes [i].id.indexOf("Subject")>=0
         || nodes [i].id.indexOf("Text")>=0
         || nodes [i].id.indexOf("editbuffer")>=0
         || nodes [i].id.indexOf("AFHasNext")>=0
         || nodes [i].id.indexOf("AFSkip")>=0
         || nodes [i].id.indexOf("AFGoBack")>=0
         || nodes [i].id.indexOf("AFShowDetail")>=0
         || nodes [i].id.indexOf("AFFirstInput")>=0
         || nodes [i].id.indexOf("AFReturn")>=0) {
       try {
        nodes [i].focus ();
        break;
       } catch (e) {}
     }
    }
   }, 100);
  } else {
   if (notdo != 'hide') {
    obj.style.display = 'none';
    obj.style.visibility = 'hidden';
   }
  }
}

function FlipDisplayById(id) {
 var o = document.getElementById(id);
 if (o) {
   FlipDisplayObject(o);
 }
 return false;
}

function FlipDisplayFirstDiv(element) {
 var children = element.children;
 for (var i = 0;i < children.length;i++) {
   if (children[i].nodeName == 'DIV') {
     FlipDisplayObject(children[i]);
     break;
   }
 }
 return false;
}

function FlipDisplayByName(name, node, tag) {
 var els = getElementsByClass(name, node, tag);
 for (i = 0;i < els.length; i++) {
   FlipDisplay(els[i]);
 }
 return false;
}

function HideByName(name, node, tag) {
 var els = getElementsByClass(name, node, tag);
 for (i = 0;i < els.length; i++) {
   els[i].style.display = 'none';
 }
 return false;
}

/* FlipDisplayAndHide - flip display and hide myself */
function FlipDisplayAndHide(o, id) {
 o.style.display = 'none';
 return FlipDisplayById(id);
}

/* FlipOnDemandHelp - flip on-deman help */
function FlipOnDemandHelp() {
 var list = getElementsByClass('ondemandhelp', document, 'div');

 for (var i = 0;  i < list.length;  i++) {
  var current = list[i].style.display;
  list[i].style.display = (current == 'none' || current == '' ? 'block' : 'none');
 }
}

/* Open - open a URL */
function Open(url) {
 window.open(url,"_self");
}

/* findchildanchor(e) - find anchor from descending elements */
function findchildanchor(e, sibling) {
 while (e) {
  if (e.tagName == 'A') return e.href;
  if (e.firstChild) {
   var fca = findchildanchor(e.firstChild, 1);
   if (fca) return fca;
  }
  if (sibling) e = e.nextSibling;  else break;
 }
 return false;
}

/* OpenChildAnchor - open URL of the first anchor in the child nodes */
function OpenChildAnchor(e,opt) {
 var event = opt ? opt['event'] : null;
 var target = event ? evtarget(event) : null;
 if (target) {
  var a = manaba.findParentNode(target, "a");
  if (a) {
   return true;
  }
 }

 var href = findchildanchor(e, 0);
 if (href) window.open(href, "_self");
 return false;
}

/* MarkAsRead - change color from unread to recently read */
function MarkAsRead(e) {
 var o = e.firstChild;

 while (o) {
  if (o.className == 'GRIunread') {
   if (o.id != 'marked') {
    // bgs.src = '/marksound.wav';
    o.id = 'marked';
    manaba.addClass (o, "markasread");
   }
  } else {
   if (MarkAsRead(o)) return false;
  }
  o = o.nextSibling;
 }
 return false;
}

/* findobject */
function findobject(name) {
 var o;

 o = document.getElementById(name);
 if (o && ! o.disabled && o.style.display != "none" && o.focus && ! manaba.hasClass(o, 'nofocusonload')) {
  return o;
 }
 return null;
}

/* FocusOnLoad - focus on load */
function FocusOnLoad() {
 if (window.location.hash) return true;
 var o;
 try {
  if (o = findobject('Subject')) return o.focus();
  if (o = findobject('Text')) return o.focus();
  if (o = findobject('PageTitle')) return o.focus();
  if (o = findobject('PageText')) return o.focus();
  if (o = findobject('CollTitle')) return o.focus();
  if (o = findobject('CollData')) return o.focus();
  if (o = findobject('editbuffer')) return o.focus();
  if (o = findobject('AFHasNext')) return o.focus();
  if (o = findobject('AFSkip')) return o.focus();
  if (o = findobject('AFGoBack')) return o.focus();
  if (o = findobject('AFShowDetail')) return o.focus();
  if (o = findobject('AFFirstInput')) return o.focus();
  if (o = findobject('AFReturn')) return o.focus();
 }
 catch(err) {
 }
 return true;
}

/* OnLoadHandler - on load handler */
function OnLoadHandler() {
 try {
  // copy ALT attributes of IMG elements to TITLE attributes
  var el = document.getElementsByTagName("img");
  for (var i = 0;  i < el.length;  i++) {
   el[i].title = el[i].alt;
  }
  if (manaba.inputImageTitleFix) {
   el = document.getElementsByTagName("input");
   for (var i = 0;  i < el.length;  i++) {
    if (el[i].type == 'image') {
     if (!el[i].title) el[i].title = el[i].alt;
    }
   }
  }
 }
 catch(err) {
 }
 asahi_ellipsis_init ();
 ScrollAutoScrollList ();
 if (manaba.storeTableSortField) manaba.restoreTableSortField();
 updateResponsiveClass();
 if(manaba.adminreadonlyview && manaba.readonlyview != null) updateAdminReadonlyViewClass();
 return true;
}

function updateResponsiveClass() {
 var elem = document.body;
 var o = document.querySelector("meta[name='viewport']");
 if (manaba.pcviewresponsive) {
  if (manaba.elem("responsive=true",document.cookie.replace(/ /g,'').split(';'))) {	
   manaba.addClass(elem, "responsive");
	 if (o) o.content = "width=device-width, initial-scale=1";
  } else {
   manaba.removeClass(elem, "responsive");
	 if (o) o.content = "";
     if (manaba.useQueryResultResponsive) {
       manaba.queryresult.responsive.resizeGraphCanvas({'cancel':1}); 
     }
  }
 }
}



/* ScrollAutoScrollList - scroll down 'autoscrolllist' to current item */
function ScrollAutoScrollList () {
 var es = getElementsByClass('autoscrolllist');
 for (var i = 0; i < es.length; i++) {
  var elem = es[i];
  var item = getElementsByClass('autoscrolllist-current', elem)[0];
  if (item) {
   elem.scrollTop = item.offsetTop;
  }
  elem.style.visibility = 'visible';
 }
}

/* HiliteAsLink - highlight an element as link */
function HiliteAsLink(element) {
 manaba.addClass (element, "hiliteaslink");
}

/* UnhiliteAsLink - highlight an element as link */
function UnhiliteAsLink(element) {
 manaba.removeClass (element, "hiliteaslink");
}

/* InputFocus / InputBlur - focus/blur of input area (text/textarea) */
function InputFocus(element) {
 manaba.addClass (element, "inputfocus");
 return true;
}

function InputBlur(element) {
 manaba.removeClass (element, "inputfocus");
  return true;
}

/* CourseFocus / CourseBlur - course card focus/blur */
function CourseFocus(e) {
 if ("className" in e
     && e.className.match (/(studentstatus-[^ ]+)/)) {
  var className = RegExp.$1;
  className = className.replace (/-focus/g, "");
  manaba.addClass (e, className + "-focus");
 }
 else if ("className" in e
          && e.className.match (/(coursecard|communitycard)/)) {
  var className = RegExp.$1;
  className = className.replace (/-focus/g, "");
  manaba.addClass (e, className + "-focus");
 }
}

function CourseBlur(e) {
 if ("className" in e
     && e.className.match (/(studentstatus-[^ ]+)/)) {
  var className = RegExp.$1;
  className = className.replace (/-focus/g, "");
  manaba.removeClass (e, className + "-focus");
 }
 else if ("className" in e
          && e.className.match (/(coursecard|communitycard)/)) {
  var className = RegExp.$1;
  className = className.replace (/-focus/g, "");
  manaba.removeClass (e, className + "-focus");
 }
}

/* MenuFocus / MenuBlur - menu focus/blur */
function MenuFocus(element) {
 manaba.addClass (element, "menufocus");
 return true;
}

function MenuBlur(element) {
 manaba.removeClass (element, "menufocus");
 return true;
}

/* MenuBarFocus / MenuBarBlur - menubar focus/blur */
function MenuBarFocus(element) {
 manaba.addClass (element, "menubarfocus");
 return true;
}

function MenuBarBlur(element) {
 manaba.removeClass (element, "menubarfocus");
 return true;
}

/* PsLinkFocus / PsLinkBlur - Pseudo Links (non anchor) */
function PsLinkFocus(element) {
 element.style.cursor = 'hand';
 element.style.textDecoration = 'underline';
 return true;
}

function PsLinkBlur(element) {
 element.style.cursor = 'auto';
 element.style.textDecoration = 'none';
 return true;
}

// ImageFocus / ImageBlur - image rollover functions
function ImageFocus(o) {
 var img = o.src;
 if (img.match(/\.gif$/) || img.match(/\.gif\?/)) {
  if (! img.match(/-focus\.gif/)) {
   var t = img.replace(/\.gif/, '-focus.gif');
   o.src = t;
  }
 } else if (img.match(/\.png$/) || img.match(/\.png\?/)) {
  if (! img.match(/-focus\.png/)) {
   var t = img.replace(/\.png/, '-focus.png');
   o.src = t;
  }
 }
}

function ImageBlur(o) {
 var img = o.src;
 if (img.match(/-focus\.gif$/) || img.match(/-focus\.gif\?/)) {
  var t = img.replace(/-focus\.gif/, '.gif');
  o.src = t;
 } else if (img.match(/-focus\.png$/) || img.match(/-focus\.png\?/)) {
  var t = img.replace(/-focus\.png/, '.png');
  o.src = t;
 }
}

// BGFocus / BGBlur - background image rollover functions
function BGFocus(o,pixel) {
 o.style.backgroundPosition = 'bottom left';
}

function BGBlur(o) {
 o.style.backgroundPosition = 'top left';
}

function BGSelect(o) {
 o.style.backgroundPosition = 'top right';
}

function BGDisselect(o) {
 o.style.backgroundPosition = 'bottom right';
}

// TextKeyPress - key pressed
function TextKeyPress(buttonToClick,e) {
 var keycode;

 if (window.event) {
  keycode = window.event.keyCode;
 } else if (e) {
  keycode = e.which;
 } else {
  return true;
 }

 if (keycode == 13) {
  if (o = document.getElementById(buttonToClick)) {
   o.click();
   return false;
  }
 } else if (keycode == 33) {
  /* ESC is ignored */
  return false;
 }
 return true;
}

function EnterSubmit(form, e, button_name) {
 var keycode;

 if (window.event) {
  keycode = window.event.keyCode;
 } else if (e) {
  keycode = e.which;
 } else {
  return true;
 }

 if (keycode == 13) {
  if (button_name) {
   manaba.submit_with_button(form, button_name);
  } else {
   form.submit();
  }
  return false;
 } else {
  return true;
 }
}

function InnerHTMLEdit(e, ev) {
 var keycode;

 if (window.event) {
  keycode = window.event.keyCode;
 } else if (ev) {
  keycode = ev.which;
 } else {
  return true;


 }

 if (keycode >= 32) {
  e.innerHTML = e.innerHTML + "X";
 }
 return true;
}

var savedtext = new Array();

function FieldRecycle(element) {
 var o;

 o = document.getElementById(element); 
 if (o) {
  if (o.value == '') {
    if (savedtext[element]) {
     o.value = savedtext[element];
    }
  } else {
    savedtext[element] = o.value;
    o.value = '';
    o.focus();
  }
 }
}

(function () {
 var FormData = new Array;
 var FormDataStatus = 0;

 window.FormDataRecycle = function FormDataRecycle(element) {
  var o = document.getElementById(element);
  var e = o.elements;

  if (FormDataStatus) {
   for (i = 0;  i < e.length;  i++) {
    if (FormData[e[i].name]) {
     e[i].value = FormData[e[i].name];
    }
   }
   FormDataStatus = 0;
  } else {
   for (i = 0;  i < e.length;  i++) {
    FormData[e[i].name] = e[i].value;
   }
   o.reset();
   FormDataStatus = 1;
  }
 }
})();

/* NextWhenFull - skip to next field when maxlength is reached */
function NextWhenFull(e, content)
{
 /* Usage:
 **  <input tabindex=1 maxlength=3 onkeyup="NextWhenFull(this, this.value)">
 */
 if (content.length == e.maxLength) {
  next = e.tabIndex;
  if (next < document.forms[0].elements.length) {
   document.forms[0].elements[next].focus()
  }
 }
}

/* CopyValue - copy a value into an object */
function CopyValue(value, id)
{
 var o;

 o = document.getElementById(id);
 if (o) {
  o.value = value;
 }
}

/* CopyValueById - copy textarea */
function CopyValueById(srcid, dstid, append)
{
 var src = document.getElementById(srcid);
 if (! src) return false;

 var dst = document.getElementById(dstid);
 if (! dst) return false;

 if (append) {
  dst.value = dst.value + (dst.value ? "\n"  : "") + src.value;
 } else {
  dst.value = src.value;
 }
}

var gContextMenu = new Array;

/* ShowContextMenu(o,ev) - show menu */
function ShowContextMenu(o,ev) {
 var x, y, id;

 if (ev) {
  x = getEventPageX(ev,0);
  y = getEventPageY(ev,0);
 } else {
  x = o.style.left;
  y = o.style.top;
 }
 var id = showcontextmenu(o, 0, x, y);
 gContextMenu[id] = true;
 return false;
}

function showcontextmenu(o, recursive, x, y) {
 var id;

 while (o) {
  if (o.className == 'contextmenu') {
   if (gContextMenu[o.id]) return o.id;  /* already shown #1 */
   if (o.style.display == 'block') return o.id;  /* already shown #2 */
   o.style.position = 'absolute';
   o.style.top = y - 20;
   o.style.left = x - 20;
   o.style.display = 'block';
   return o.id;
  }
  if (id = showcontextmenu(o.firstChild, 1, x, y)) return id;
  if (recursive) o = o.nextSibling; else break;
 }
 return false;
}

/* HideContextMenu(element) - hide this menu */
function HideContextMenu(elem) {
 elem.style.display = 'none';
 SetTimeoutEvent(ClearContextMenu, elem, 100, 1);
}

/* ClearContextMenu(element) - hide this menu */
function ClearContextMenu(elem) {
 gContextMenu[elem.id] = false;
}

/* XMLHttpRequest wrapper */
function CreateXMLHttpRequest () {
 if (manaba.xhr_csrf_token) {
  var request = null;
  try {
   if (window.XMLHttpRequest && ! gBrowser.disableNativeXHR) {
    request = new XMLHttpRequest ();
   }
  } catch (e) {}
  try {
   if (! request && window.ActiveXObject) {
    request = new ActiveXObject ('Microsoft.XMLHTTP');
   }
  } catch (e) {}
  try {
   if (! request && window.ActiveXObject) {
    request = new ActiveXObject('Msxml2.XMLHTTP');
   }
  } catch (e) {}
  if (request) {
   try {
    var default_open = request.open;
    request.open = function() {
     var result = default_open.apply(request, arguments);
     request.setRequestHeader('X-Webat-CSRF-Token', manaba.xhr_csrf_token);
     return result;
    };
   } catch (e) {}
  }
  return request;
 } else {
  try {
   if (window.XMLHttpRequest) {
    return new XMLHttpRequest ();
   }
  } catch (e) {}
  try {
   if (window.ActiveXObject) {
    return new ActiveXObject ('Microsoft.XMLHTTP');
   }
  } catch (e) {}
  try {
   if (window.ActiveXObject) {
    return new ActiveXObject('Msxml2.XMLHTTP');
   }
  } catch (e) {}
  return null;
 }
}

/* XHR refresh counter */
manaba.ajaxcounter = 0;

/* QueryPanel */
manaba.panelFirst = true;
manaba.panel_getStringAction = function (o, action) {
 var oName = "";
 if (o) {
  oName = o.nodeName.toLowerCase ();
 }
 
 if (oName == "a") {
  var ok_url = action;
  if (!ok_url.match (/^https?:/)) {
   var base = document.location.href.replace (/\?.+$/, "").replace (/\/[^\/]*$/, "/");
   ok_url = base + ok_url;
  }
  return function () {
   if (ok_url) {
    document.location.href = ok_url;
   }
   try {
    var b = document.getElementById ("panel_blocker");
    var m = document.getElementById ("panel_modal");
    if (b && m) {
     b.parentNode.removeChild (b);
     m.parentNode.removeChild (m);
    }
   } catch (e) {}
  };
 }
 else if (oName == "input" && action == "_submit") {
  return function () {
   var node = document.createElement ("input");
   node.type = "hidden";
   node.name = o.name + ".x";
   node.value = "5";
   o.form.appendChild (node);
   var node = document.createElement ("input");
   node.type = "hidden";
   node.name = o.name + ".y";
   node.value = "5";
   o.form.appendChild (node);
   o.form.submit ();
   try {
    var b = document.getElementById ("panel_blocker");
    var m = document.getElementById ("panel_modal");
    if (b && m) {
     b.parentNode.removeChild (b);
     m.parentNode.removeChild (m);
    }
   } catch (e) {}
  };
 }
 else if (action == "_cancel") {
  return function () {
   try {
    var b = document.getElementById ("panel_blocker");
    var m = document.getElementById ("panel_modal");
    if (b && m) {
     b.parentNode.removeChild (b);
     m.parentNode.removeChild (m);
    }
   } catch (e) {}
  };
 }
 else if (action.match (/^_anchor:(.+)$/)) {
  var ok_url = RegExp.$1;
  if (!ok_url.match (/^https?:/)) {
   var base = document.location.href.replace (/\?.+$/, "").replace (/\/[^\/]*$/, "/");
   ok_url = base + ok_url;
  }
  return function () {
   document.location.href = ok_url;
   try {
    var b = document.getElementById ("panel_blocker");
    var m = document.getElementById ("panel_modal");
    if (b && m) {
     b.parentNode.removeChild (b);
     m.parentNode.removeChild (m);
    }
   } catch (e) {}
  };
 }
 else if (oName == "input" && action.match (/^\+(.+)$/)) {
  var name = o.name + RegExp.$1;
  return function () {
   o.name = name;
   var node = document.createElement ("input");
   node.type = "hidden";
   node.name = o.name + ".x";
   node.value = "5";
   o.form.appendChild (node);
   var node = document.createElement ("input");
   node.type = "hidden";
   node.name = o.name + ".y";
   node.value = "5";
   o.form.appendChild (node);
   o.form.submit ();
   try {
    var b = document.getElementById ("panel_blocker");
    var m = document.getElementById ("panel_modal");
    if (b && m) {
     b.parentNode.removeChild (b);
     m.parentNode.removeChild (m);
    }
   } catch (e) {}
  };
 }
 else if (oName == "input" && action.match (/^(.+)=(.+)$/)) {
  var key = RegExp.$1;
  var val = RegExp.$2;
  return function () {
   var node = document.createElement ("input");
   node.type = "hidden";
   node.name = o.name + ".x";
   node.value = "5";
   o.form.appendChild (node);
   var node = document.createElement ("input");
   node.type = "hidden";
   node.name = o.name + ".y";
   node.value = "5";
   o.form.appendChild (node);
   var node = document.createElement ("input");
   node.type = "hidden";
   node.name = key;
   node.value = val;
   o.form.appendChild (node);
   o.form.submit ();
   try {
    var b = document.getElementById ("panel_blocker");
    var m = document.getElementById ("panel_modal");
    if (b && m) {
     b.parentNode.removeChild (b);
     m.parentNode.removeChild (m);
    }
   } catch (e) {}
  };
 }
 else if (oName == "input") {
  var name = action;
  return function () {
   o.name = name;
   var node = document.createElement ("input");
   node.type = "hidden";
   node.name = o.name + ".x";
   node.value = "5";
   o.form.appendChild (node);
   var node = document.createElement ("input");
   node.type = "hidden";
   node.name = o.name + ".y";
   node.value = "5";
   o.form.appendChild (node);
   o.form.submit ();
   try {
    var b = document.getElementById ("panel_blocker");
    var m = document.getElementById ("panel_modal");
    if (b && m) {
     b.parentNode.removeChild (b);
     m.parentNode.removeChild (m);
    }
   } catch (e) {}
  };
 }
 
 return function () {};
};

manaba.panelCancelFunc = function () {};
manaba.panel_close = function (o) {
 var b = document.getElementById ("panel_blocker");
 var m = document.getElementById ("panel_modal");
 if (b && m) {
  b.parentNode.removeChild (b);
  m.parentNode.removeChild (m);
 }
};
manaba.panel_submit = function (o) {
 var node = document.createElement ("input");
 node.type = "hidden";
 node.name = o.name + ".x";
 node.value = "5";
 o.form.appendChild (node);
 var node = document.createElement ("input");
 node.type = "hidden";
 node.name = o.name + ".y";
 node.value = "5";
 o.form.appendChild (node);
 manaba.disable_submit_button(o.form);
 o.form.submit ();
};
manaba.panel = function (o, type, message) {
 if (!manaba.useHTMLPanel) {
  if (type == "alert") {
   return alert (message);
  }
  else if (type == "confirm") {
   return confirm (message);
  }
  else if (type == "commentpreview") {
      return false;
  }
  else {
   if (!confirm (message)) {
    return false;
   }
   var rem_message = "";
   if (gLang == "ja") {
    rem_message = "リマインダを送信しますか？";
   }
   else if (gLang == "en") {
    rem_message = "will be accessible to students.  send reminder?";
   }
   if (!confirm (rem_message)) {
    o.name = o.name.replace (/_noreminder$/, "") + "_noreminder";
   }
   return true;
  }
 }
 
 if (document.getElementById ("panel_blocker")) {
  return false;
 }
 var blocker = document.createElement ("span");
 blocker.id = "panel_blocker";
 document.body.appendChild (blocker);
 
 if (manaba.panelFirst) {
  manaba.panelFirst = false;
  var target = window;
  if (gBrowser.isIE) {
   target = document.body;
  }
  manaba.addevent
   (target, "keydown",
    function () {
     var event;
     if (gBrowser.isIE) {
      event = window.event;
     }
     else {
      event = arguments [0];
     }
     if (event.keyCode == 27) {
      var b = document.getElementById ("panel_blocker");
      if (b) {
       manaba.panelCancelFunc ();
      }
     }
    });
 }
 
 var modal = document.createElement ("div");
 modal.id = "panel_modal";
 modal.style.position = "absolute";
 modal.style.left = "0px";
 modal.style.top = "0px";
 modal.style.width = "100%";
 var height = 0;
 height = document.body.clientHeight;
 if (height < document.documentElement.clientHeight) {
  height = document.documentElement.clientHeight;
 }
 modal.style.height = height + "px";
 modal.style.zIndex = "100";
 
 var panelbackcancel = false;
 var back = document.createElement ("div");
 back.id = "panel_back";
 back.style.position = "absolute";
 back.style.left = "0px";
 back.style.top = "0px";
 back.style.width = "100%";
 back.style.height = height + "px";
 modal.appendChild (back);
 
 var panel = document.createElement ("div");
 panel.id = "panel_frame";
 panel.style.visibility = "hidden";
 panel.style.position = "absolute";
 panel.style.left = "0px";
 if (type == "commentpreview") {
  panel.style.width = "642px";
 }
 if (type == "icupanel") {
  panel.style.width = "950px";
 }
 var top = 0;
 if (document.body.scrollTop) {
  top = document.body.scrollTop;
 }
 else if (document.documentElement.scrollTop) {
  top = document.documentElement.scrollTop;
 }
 panel.style.top = top + "px";
 if ("cssFloat" in panel.style) {
  panel.style.cssFloat = "left";
 }
 else {
  panel.style.styleFloat = "left";
 }
 
 modal.appendChild (panel);
 
 document.body.appendChild (modal);
 
 var panelenv = {};
 var actions = {};
 var labels = {};
 if (type == "alert" || type == "confirm") {
  if (arguments.length >= 4) {
   if ((typeof arguments [3]) == "function") {
    var ok_func = arguments [3];
    actions ["ok"] = function () {
     ok_func ();
     try {
      blocker.parentNode.removeChild (blocker);
      modal.parentNode.removeChild (modal);
     } catch (e) {}
    };
   }
   else if ((typeof arguments [3]) == "string") {
    actions ["ok"] = manaba.panel_getStringAction (o, arguments [3]);
   }
  }
  else if (o) {
   if (o.nodeName.toLowerCase () == "a") {
    actions ["ok"] = function () {
     document.location.href = o.href;
     try {
      blocker.parentNode.removeChild (blocker);
      modal.parentNode.removeChild (modal);
     } catch (e) {}
    };
   }
   else if (o.nodeName.toLowerCase () == "input") {
    actions ["ok"] = function () {
     manaba.panel_submit(o);
     try {
      blocker.parentNode.removeChild (blocker);
      modal.parentNode.removeChild (modal);
     } catch (e) {}
    };
   }
   else {
    return false;
   }
  }
  else {
   return false;
  }
 }
 if (type == "confirm") {
  if (arguments.length >= 5) {
   if ((typeof arguments [4]) == "function") {
    var cancel_func = arguments [4];
    actions ["cancel"] = function () {
     cancel_func ();
     try {
      blocker.parentNode.removeChild (blocker);
      modal.parentNode.removeChild (modal);
     } catch (e) {}
    };
   }
   else if ((typeof arguments [4]) == "string") {
    actions ["cancel"] = manaba.panel_getStringAction (o, arguments [4]);
   }
  }
  else if (o) {
   if (o.nodeName.toLowerCase () == "a") {
    actions ["cancel"] = function () {
     try {
      blocker.parentNode.removeChild (blocker);
      modal.parentNode.removeChild (modal);
     } catch (e) {}
    };
   }
   else if (o.nodeName.toLowerCase () == "input") {
    actions ["cancel"] = function () {
     try {
      blocker.parentNode.removeChild (blocker);
      modal.parentNode.removeChild (modal);
     } catch (e) {}
    };
   }
   else {
    return false;
   }
  }
  else {
  return false;
  }
 }
 panelenv ["actions_rem"] = function () {
  manaba.panel_submit(o);
  try {
   blocker.parentNode.removeChild (blocker);
   modal.parentNode.removeChild (modal);
  } catch (e) {}
 };
 panelenv ["actions_norem"] = function () {
  try {
   o.name = o.name.replace (/_noreminder$/, "") + "_noreminder";
   manaba.panel_submit(o);
   blocker.parentNode.removeChild (blocker);
   modal.parentNode.removeChild (modal);
  } catch (e) {}
 };
 if (type == "reminder") {
  actions ["rem"] = panelenv ["actions_rem"];
  actions ["norem"] = panelenv ["actions_norem"];
  actions ["cancel"] = function () {
   try {
    blocker.parentNode.removeChild (blocker);
    modal.parentNode.removeChild (modal);
   } catch (e) {}
  };
 }
 panelenv ["actions_setrem"] = function (e) {
  try {
   var target = evtarget(e);
   var rslist = document.getElementsByName('ReminderSetting');
   var rstatus = '';
   for (var i = 0; i < rslist.length; i++) {
     if (rslist[i].checked) {
       rstatus = rslist[i].value;
       break;
     }
   }
   if (rstatus == 'noreminder' || rstatus == 'onstart') {
     o.name = o.name.replace (/_(noreminder|onstart)$/, "") + "_" + rstatus;
   }
   manaba.panel_submit(o);
   blocker.parentNode.removeChild (blocker);
   modal.parentNode.removeChild (modal);
  } catch (e) {}
 };
 if (type == "setreminder") {
  actions ["setrem"] = panelenv ["actions_setrem"];
  actions ["cancel"] = function () {
   try {
    blocker.parentNode.removeChild (blocker);
    modal.parentNode.removeChild (modal);
   } catch (e) {}
  };
 }
 if (type == "commentpreview") {
  actions ["submit"] = function () {
   manaba.panel_submit(o);
   try {
    blocker.parentNode.removeChild (blocker);
    modal.parentNode.removeChild (modal);
   } catch (e) {}
  };
  actions ["cancel"] = function () {
   try {
    blocker.parentNode.removeChild (blocker);
    modal.parentNode.removeChild (modal);
   } catch (e) {}
  };
  panelbackcancel = true;
 }
 
 var focusName = "";
 var queryString = "";
 var queryString_append = function(s) {
  if (queryString) {
   queryString += "&";
  }
  queryString += s;
 };
 if (typeof(message) == "object" && "manaba_refresh" in message && message["manaba_refresh"]) {
  queryString_append("refresh=" + manaba.SystemUnixTime);
 }
 var queryPost = false;
 if (type != "confirm" && type != "alert" && type != "reminder" && type != "commentpreview" && type != "setreminder") {
  var j = 1;
  for (;;) {
   if (arguments.length - 5 >= j * 2) {
    labels ["button" + j]= arguments [5 + (j - 1) * 2];
    if ((typeof arguments [5 + (j - 1) * 2 + 1]) == "function") {
     actions ["button" + j] = arguments [5 + (j - 1) * 2 + 1];
    }
    else if ((typeof arguments [5 + (j - 1) * 2 + 1]) == "string") {
     actions ["button" + j] = manaba.panel_getStringAction (o, arguments [5 + (j - 1) * 2 + 1]);
    }
    if (queryString) {
     queryString += "&";
    }
    queryString += "button=" + j;
    j ++;
   }
   else {
    break;
   }
  }
  queryString = "?" + queryString;
 } else if (type == "commentpreview") {
     var elsubj = document.getElementById(arguments[3]);
     var eltext = document.getElementById(arguments[4]);
     var typetext = document.getElementById(arguments[6]);
     var validation = arguments[7];
    
     var txsubj = (elsubj) ? elsubj.value : '';
     var txtext = (eltext) ? eltext.value : '';
     var aname = arguments[5];
     var ttype = (typetext) ? (typetext.value != '0' && typetext.value) : 0;
     
     queryString = 'Subject=' + encodeURIComponent(txsubj)
       + '&Text=' + encodeURIComponent(txtext)
       + '&AuthorName=' + encodeURIComponent(aname)
       + '&InlineSize=460'
       ;
     if (ttype) queryString += '&CreateTextComment=1';
     if (validation) queryString += '&InputValidationType=' + validation;
     queryPost = true;
 }
 
 if (type == "alert") {
  focusName = "ok";
  manaba.panelCancelFunc = actions ["ok"];
 }
 else if (type == "confirm") {
  focusName = "ok";
  manaba.panelCancelFunc = actions ["cancel"];
 }
 else if (type == "reminder") {
  focusName = "rem";
  manaba.panelCancelFunc = actions ["cancel"];
 }
 else if (type == "setreminder") {
  focusName = "setrem";
  manaba.panelCancelFunc = actions ["cancel"];
 }
 else if (type == "commentpreview") {
  focusName = "cancel";
  manaba.panelCancelFunc = actions ["cancel"];
 }
 else {
  focusName = "button" + arguments [3];
  manaba.panelCancelFunc = actions ["button" + arguments [4]];
 }

 if (typeof(message) == "object" && "manaba_append_query_parameter" in message && message["manaba_append_query_parameter"]) {
   queryString_append(message["manaba_append_query_parameter"]);
 }

 if (panelbackcancel) {
  manaba.addevent(back, "click", manaba.panelCancelFunc);
 }
 
 var panelposfunc = function() {
  var left = 0;
  if (document.body.scrollLeft) {
   left = document.body.scrollLeft;
  }
  else if (document.documentElement.scrollLeft) {
   left = document.documentElement.scrollLeft;
  }
  var width = document.documentElement.clientWidth;
  var height= document.documentElement.clientHeight;
  if (type == "commentpreview") {
   var maxph = height / 2;
   if (maxph < 80) maxph = 80;
   if (panel.clientHeight > maxph) {
    panel.style.height = maxph + "px";
    panel.style.overflow = "auto";
   }
  }
  var x, y;
  x = left + (width - panel.offsetWidth) / 2;
  y = top + (height - panel.offsetHeight) / 2;
  panel.style.left = x + "px";
  panel.style.top = y + "px";
  panel.style.visibility = "visible";
 }
 
 var request =  CreateXMLHttpRequest ();
 request.onreadystatechange = function () {
  if (request.readyState == 4
      && request.status == 200) {
   panel.innerHTML = request.responseText;

   panelenv["actions"] = actions;
   panelenv["panel"] = panel;

   if (typeof(message) == "function") {
    message(panel); // initialize panel
   } else if (typeof(message) == "object" && "manaba_panelbeforevisible" in message) {
    message.manaba_panelbeforevisible(panel, panelenv);
   } else {
    var messageblock = document.getElementById ("panel_message");
    if (!messageblock) {
     return;
    }
    if (typeof(message) == "string") {
     messageblock.innerHTML = manaba.escapeEntity (message);
    } else if (typeof(message) == "object") {
     if ("manaba_message" in message) {
      var message_message = message.manaba_message;
      if (typeof(message_message) == "string") {
       messageblock.innerHTML = manaba.escapeEntity (message_message);
      } else if (typeof(message_message) == "object") {
       messageblock.appendChild(message_message);
      }
      if ("manaba_panel_class" in message) {
       panel.className = message.manaba_panel_class;
      }
      if ("manaba_panel_buttonvalues" in message) {
        var buttonvalues = message.manaba_panel_buttonvalues;
        if ("panel_rem" in buttonvalues) {
          var panel_rem = document.getElementById ("panel_rem");
          if (panel_rem) panel_rem.value = buttonvalues.panel_rem;
        }
        if ("panel_norem" in buttonvalues) {
          var panel_norem = document.getElementById ("panel_norem");
          if (panel_norem) panel_norem.value = buttonvalues.panel_norem;
        }
      }
     } else {
      messageblock.appendChild(message);
     }
    }
   }
   
   var focusNode = null;
   var node;
   for (var name in actions) {
    node = document.getElementById ("panel_" + name);
    if (!node) {
     return;
    }
    manaba.addevent (node,"click", actions [name]);
    if (name == focusName) {
     focusNode = node;
    }
    if (name in labels
         && labels [name] != null) {
     node.value = labels [name];
    }
   }
   
   if (typeof(message) == "object" && "manaba_panel_non_interactive" in message && message["manaba_panel_non_interactive"]) {
    // do nothing
   } else {
    panelposfunc();
   }

   if (type == "commentpreview") {
    focusNode = null;
    //var imgelms = panel.getElementsByTagName("img");
    var imgelms = getElementsByClass("articleimage", panel, "img");
    var evlen = (imgelms && imgelms.length < 8) ? imgelms.length : 8;
    for (var iei = 0;  iei < imgelms.length;  iei++) {
     manaba.addevent(imgelms[iei], "load", panelposfunc);
    }
   }
   
   if (manaba.useMathJax) {
    MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
   }

   if (focusNode) {
    focusNode.focus ();
   }
   if (typeof(message) == "object" && "manaba_panelaftervisible" in message) {
    message.manaba_panelaftervisible(panel);
   }
  }
 };
 
 var suffix = "";
 if (typeof(message) == "object") {
  if ("manaba_panel_typesuffix" in message && message.manaba_panel_typesuffix != null) {
   suffix = message.manaba_panel_typesuffix;
  }
 }
 var base = document.location.href.replace (/\?.+$/, "").replace (/\/[^\/]*$/, "/");
 var panel_url = base + "panel_" + type + suffix;
 
 if (queryPost) {
  request.open ('POST', panel_url, true);
  request.setRequestHeader ('Content-Type', 'application/x-www-form-urlencoded');
  request.send (queryString);
 } else {
  request.open ('GET', panel_url + queryString, true); 
  request.send (null);
 }
 
 return false;
};

manaba.imageViewerStarted = false;
manaba.imageViewerDown = false;
manaba.imageViewerDownOutside = false;
manaba.imageViewerDrag = false;
manaba.imageViewerX = 0;
manaba.imageViewerY = 0;

/* OpenImageViewer() - open image viewer */
function OpenImageViewer(url,o,ev, comment) {
 var viewer = document.createElement ("div");
 viewer.id = "imageviewer_modal";
 viewer.style.position = "absolute";
 viewer.style.left = "0px";
 viewer.style.top = "0px";
 viewer.style.width = "100%";
 var height = 0;
 height = document.body.clientHeight;
 if (height < document.documentElement.clientHeight) {
  height = document.documentElement.clientHeight;
 }
 viewer.style.height = height + "px";
 viewer.style.zIndex = "100";
 manaba.addevent
  (viewer, "click",
   function () {
    if (!manaba.imageViewerStarted) {
     viewer.parentNode.removeChild (viewer);
    }
   });
 
 var back = document.createElement ("div");
 back.id = "imageviewer_back";
 back.style.position = "absolute";
 back.style.left = "0px";
 back.style.top = "0px";
 back.style.width = "100%";
 back.style.height = height + "px";
 viewer.appendChild (back);

 var imageDiv = document.createElement ("div");
 imageDiv.style.position = "absolute";
 imageDiv.style.left = "0px";
 var top = 0;
 if (document.body.scrollTop) {
  top = document.body.scrollTop;
 }
 else if (document.documentElement.scrollTop) {
  top = document.documentElement.scrollTop;
 }
 imageDiv.style.top = top+ 20 + "px";
 imageDiv.style.width = "100%";
 imageDiv.style.textAlign = "center";
 var loading = document.createElement ("div");
 loading.style.color = "white";
 loading.style.fontWeight = "bold";
 loading.style.marginTop = "10px";
 loading.style.marginBottom = "10px";
 loading.innerHTML = "loading...";
 imageDiv.appendChild (loading);
 var link = document.createElement ("div");
 link.style.marginTop = "10px";
 link.style.marginBottom = "10px";
 var anchor = document.createElement ("a");
 anchor.href = url;
 anchor.style.color = "#00ffff";
 anchor.innerHTML = "画像を開く";
 link.appendChild (anchor);
 imageDiv.appendChild (link);
 var close = document.createElement ("div");
 close.style.color = "white";
 close.style.fontWeight = "bold";
 close.style.marginBottom = "10px";
 close.innerHTML = "クリックで閉じる";
 imageDiv.appendChild (close);
 var image = document.createElement ("img");
 var enterDraggable = function () {
  manaba.imageViewerStarted = true;
  var x = 0; y = 0;
  var node = image;
  x += node.offsetLeft;
  y += node.offsetTop;
  image.style.cursor = "move";
  image.style.position = "absolute";
  image.style.left = x + "px";
  image.style.top = y + "px";
  manaba.addevent
   (viewer, "mousedown",
    function () {
     var event;
     var target;
     if (gBrowser.isIE) {
      event = window.event;
      target = event.srcElement;
     }
     else {
      event = arguments [0];
      target = event.target;
     }
     if (!gBrowser.isIE && event.button != 0) {
      return;
     }
     if (gBrowser.isIE && event.button != 1) {
      return;
     }
     var a = manaba.findParentNode (target, "a");
     if (a) {
      return;
     }
     var img = manaba.findParentNode (target, "img");
     if (!img) {
      manaba.imageViewerDownOutside = true;
      return;
     }
     manaba.imageViewerDown = true;
     manaba.imageViewerX = event.screenX;
     manaba.imageViewerY = event.screenY;
     
     try { event.preventBubble (); } catch (e) {}
     try { event.preventDefault (); } catch (e) {}
     try { event.stopPropagation (); } catch (e) {}
     return false;
    });
  manaba.addevent
   (viewer, "mousemove",
    function () {
     if (!manaba.imageViewerDown) {
      return;
     }
     var event;
     if (gBrowser.isIE) {
      event = window.event;
     }
     else {
      event = arguments [0];
     }
     manaba.imageViewerDrag = true;
     var x = parseInt (image.style.left);

     var y = parseInt (image.style.top);
     x += event.screenX - manaba.imageViewerX;
     y += event.screenY - manaba.imageViewerY;
     image.style.left = x + "px";
     image.style.top = y + "px";
     manaba.imageViewerX = event.screenX;
     manaba.imageViewerY = event.screenY;
     
     try { event.preventBubble (); } catch (e) {}
     try { event.preventDefault (); } catch (e) {}
     try { event.stopPropagation (); } catch (e) {}
     return false;
    });
  manaba.addevent
   (viewer, "mouseup",
    function () {
     var event;
     var target;
     if (gBrowser.isIE) {
      event = window.event;
      target = event.srcElement;
     }
     else {
      event = arguments [0];
      target = event.target;
     }
     if (!gBrowser.isIE && event.button != 0) {
      return;
     }
     if (gBrowser.isIE && event.button != 1) {
      return;
     }
     var a = manaba.findParentNode (target, "a");
     if (a) {
      return;
     }
     if (manaba.imageViewerDownOutside) {
      manaba.imageViewerDownOutside = false;
      viewer.parentNode.removeChild (viewer);
      manaba.imageViewerStarted = false;
      return;
     }
     if (!manaba.imageViewerDown) {
      return;
     }
     manaba.imageViewerDown = false;
     if (!manaba.imageViewerDrag) {
      viewer.parentNode.removeChild (viewer);
      manaba.imageViewerStarted = false;
     }
     manaba.imageViewerDrag = false;
     
     try { event.preventBubble (); } catch (e) {}
     try { event.preventDefault (); } catch (e) {}
     try { event.stopPropagation (); } catch (e) {}
     return false;
    });
 };
 manaba.addevent
  (image,
   "load",
   function () {
    try {
     loading.parentNode.removeChild (loading);
     setTimeout (function () {
       enterDraggable ();
      }, 100);
    } catch (e) {}
   });
 image.style.border = "8px solid white";
 image.style.margin = "0px";
 image.style.padding = "0px";
 image.src = url;
 //setTimeout (function () {image.src = url;}, 3000);
 imageDiv.appendChild (image);
 viewer.appendChild (imageDiv);
 
 document.body.appendChild (viewer);
 if (image.complete) {
  loading.parentNode.removeChild (loading);
  setTimeout (function () {
    enterDraggable ();
   }, 100);
 }

 return false;
}


/* OpenImageViewer2() - open image viewer - sanae design ver. */
function OpenImageViewer2(url_full,url_dl,url_dlicon,url_close,img_width,img_close_width,o,ev) {

 var viewer = document.createElement ("div");
 viewer.id = "imageviewer_modal";
 viewer.style.position = "absolute";
 viewer.style.left = "0px";
 viewer.style.top = "0px";
 viewer.style.width = "100%";
 var height = 0;
 height = Math.max(document.body.clientHeight, document.documentElement.clientHeight);
 viewer.style.height = height + "px";
 viewer.style.zIndex = "100";
 manaba.addevent
  (viewer, "click",
   function () {
    viewer.parentNode.removeChild (viewer);
   });

 var back = document.createElement ("div");
 back.id = "imageviewer_back";
 back.style.position = "absolute";
 back.style.left = "0px";
 back.style.top = "0px";
 back.style.width = "100%";
 back.style.height = height + "px";
 viewer.appendChild (back);

 var top = document.body.scrollTop ||
  document.documentElement.scrollTop ||
  0;
 
 var contentDiv = document.createElement ("div");
 contentDiv.style.position = "absolute";
 contentDiv.style.left = "0px";
 contentDiv.style.top = top+ 20 + "px";
 contentDiv.style.width = "100%";
 contentDiv.style.textAlign = "center";

 var link = document.createElement ("div");
 link.style.marginTop = "10px";
 link.style.marginBottom = "10px";

 var anchor = document.createElement ("a");
 anchor.href = url_dl;
 anchor.style.color = "#00ffff";
 link.appendChild (anchor);
 (function(){
  var img_dlicon = document.createElement ("img");
  img_dlicon.src = url_dlicon;
  anchor.appendChild (img_dlicon);
 })();

 contentDiv.appendChild (link);

 var frameDiv = document.createElement ("div");
 frameDiv.style.textAlign = "center";
 frameDiv.style.display = "inline-block";
 frameDiv.style.background = "white";
 frameDiv.style.paddingBottom = "8px";
 contentDiv.appendChild(frameDiv);

 var frameDiv_inner_width = 0;
 var setFrameDivWidth = function(inner_width) {
  frameDiv_inner_width = Math.max(frameDiv_inner_width, inner_width);
  frameDiv.style.width = (frameDiv_inner_width + 16) + "px";
 };
 setFrameDivWidth (img_width);
 setFrameDivWidth (img_close_width);

 (function(){
  var img_close = document.createElement ("img");
  img_close.src = url_close;
  frameDiv.appendChild (img_close);

  frameDiv.appendChild (document.createElement ("br"));

  var image = document.createElement ("img");
  image.style.border = "none";
  image.src = url_full;

  frameDiv.appendChild (image);
 })();
 viewer.appendChild (contentDiv);
 
 document.body.appendChild (viewer);
 return false;
}


/* OpenUsermemo() - open a user memo window */
function OpenUsermemo(url,o,ev,winname, isList) {
 var x;
 var y;

 if (gBrowser.isIE) {
  window.event.cancelBubble = true;
  if (event.stopPropagation) event.stopPropagation();
 }
 if (! winname) winname = "_blank";
 if (! url) url = findchildanchor(o, 0);
 if (! url) return false;

 if (ev) {
  x = getEventPageX(ev,1);
  y = getEventPageY(ev,1);
 } else {
  x = o.style.left;
  y = o.style.top;
 }

 if (manaba.useEmbeddedMemo ) {
   manaba.OpenEmbeddedMemo (url, o, isList, x, y);
   return false;
 }
 window.open(url,winname,"toolbar=no,directories=no,status=no,menubar=no,scrollbars=no,titlebar=no,resizable=no,copyhistory=no,width=512,height=230,top=" + y + ",left=" + x);
 return false;
}

/* OpenCalendar() - open a calendar window */
function OpenCalendar(url,ev,winname) {
 var x;
 var y;

 if (! winname) winname = "_blank";
 if (ev) {
  x = window.screenLeft + ev.clientX;
  y = window.screenTop + ev.clientY;
 } else {
  x = window.screenLeft + 100;
  y = window.screenTop + 100;
 }

 window.open(url,winname,"toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=no,titlebar=no,resizable=no,copyhistory=no,width=150,height=120,top=" + y + ",left=" + x);
 return false;
}

/* CopyValueToOpener - copy a value into the specified element */
function CopyValueToOpener(v,id,winclose) {
 var tt;

 var te = window.opener.document.getElementById(id);  /* target element */
 if (! te) return false;  /* not found, do nothing */

 tt = te.type;
 if (tt == "DIV" || tt == "P" || tt == "A" || tt == "TEXTAREA") {
  /* replace innerHTML if <div <p <a <textarea */
  te.innerHTML = v;
 } else {
  /* otherwise replace value */
  te.value = v;
 }

 if (winclose) window.close();
 return false;
}

// selectoptionvalue - find option value
function selectoptionvalue(o, dv) {
 if (! o) return dv;
 for (var e = o.firstChild;  e;  e = nextSiblingNT(e)) {
  if (e.tagName != 'OPTION') continue;
  if (o.selectedIndex == e.index) return e.value;
 }
 return dv;
}
manaba.selectoptionvalue = selectoptionvalue;

// TimeValue - construct time value from two id's
function TimeValue(idhour, idmin) {
 return selectoptionvalue(document.getElementById(idhour), '00') +
   ":" + selectoptionvalue(document.getElementById(idmin), '00');
}

// FullTimeValue - construct time value from two id's
function FullTimeValue(idhour, idmin, idsec) {
 return selectoptionvalue(document.getElementById(idhour), '00') +
   ":" + selectoptionvalue(document.getElementById(idmin), '00') +
   ":" + selectoptionvalue(document.getElementById(idsec), '00');
}

// DateValue - construct date value
function DateValue(iddate) {
 var e = document.getElementById(iddate);
 if (! e) return '2001-01-01';
 if (e.tagName == 'DIV') {
  return e.innerHTML;
 } else if (e.tagName == 'INPUT') {
  return e.value;
 }
}

/* CopyValueToOutframe */
function CopyValueToOutframe(v,id) {
 var tt;

 var te = window.parent.document.getElementById(id);  /* target element */
 if (! te) return false;  /* not found, do nothing */

 tt = te.type;
 if (tt == "DIV" || tt == "P" || tt == "A" || tt == "TEXTAREA") {
  /* replace innerHTML if <div <p <a <textarea */
  te.innerHTML = v;
 } else {
  /* otherwise replace value */
  te.value = v;
 }

 var e = window.parent.document.getElementById(id + '_iframe');
 if (e) e.style.display = 'none';
 return false;
}

var selecteddate = null;

/* SelectDate */
function SelectDate(o,iddate,value) {
 var e = document.getElementById(iddate);
 if (selecteddate) {
  manaba.removeClass (selecteddate, "selectdate");
 } else {
  var x = document.getElementById('initselected');
  if (x) {
   manaba.removeClass (x, "selectdate");
  }
 }
 if (e.tagName == 'DIV') {
  e.innerHTML = value;
 } else if (e.tagName == 'INPUT') {
  e.value = value;
 }
 manaba.addClass (o, "selectdate");
 selecteddate = o;
 return false;
}

var authFormEnabled = 0;

/* AuthFormEnable- enable authentication form */
function AuthFormEnable() {
 var e1, e2, e3;

 e1 = document.getElementById('huserid');
 e2 = document.getElementById('hpassword');
 e3 = document.getElementById('hlogin');
 e1.disabled = 0;
 e2.disabled = 0;
 e3.disabled = 0;
 if (! authFormEnabled) {
  e1.value = e2.value = '';
  e1.focus();
 }
 authFormEnabled = 1;
}

/* LinkWindow() - open a link window */
function LinkWindow(url,ev) {
 var x;
 var y;
 if (ev) {
  x = getEventPageX(ev,1);
  y = getEventPageY(ev,1);
 } else {
  x = window.screenLeft + 100;
  y = window.screenTop + 100;
 }

 window.open("link?url=" + url, "_blank","toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=no,titlebar=no,resizable=no,copyhistory=no,width=400,height=100,top=" + y + ",left=" + x);
 return false;
}

/* LinkWindowChildAnchor() - open a link window using an anchor in descending elements*/
function LinkWindowChildAnchor(o, ev) {
 var oo = o;
 var x, y;
 var url;

 if (o.tagName == 'A') {
  if (gBrowser.isIE) {
   url = o.getAttribute ("href", 2);
  }
  else {
   url = o.getAttribute ("href");
  }
 } else {
  o = o.firstChild;
  while (o) {
   if (o.tagName == 'A') {
    if (gBrowser.isIE) {
     url = o.getAttribute ("href", 2);
    }
    else {
     url = o.getAttribute ("href");
    }
    break;
   } else {
    if (OpenChildAnchor(o, ev)) return false;
   }
   o = o.nextSibling;
  }
 }
 if (! url) return false;

 url = escape(url);
 if (ev) {
  x = getEventPageX(ev,1);
  y = getEventPageY(ev,1);
 } else {
  x = oo.style.left;
  y = oo.style.top;
 }

 window.open("link?url=" + url, "_blank","toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=no,titlebar=no,resizable=no,copyhistory=no,width=400,height=100,top=" + y + ",left=" + x);
 return false;
}

/* LinkChildAnchor() - open a link using an anchor in descending elements*/
function LinkChildAnchor(o, ev) {
 var x, y;
 var url;

 if (o.tagName == 'A') {
  if (gBrowser.isIE) {
   url = o.getAttribute ("href", 2);
  }
  else {
   url = o.getAttribute ("href");
  }
 } else {
  o = o.firstChild;
  while (o) {
   if (o.tagName == 'A') {
    if (gBrowser.isIE) {
     url = o.getAttribute ("href", 2);
    }
    else {
     url = o.getAttribute ("href");
    }
    break;
   } else {
    if (OpenChildAnchor(o, ev)) return false;
   }
   o = o.nextSibling;
  }
 }
 if (! url) return false;

 window.open(url, "_self");
 return false;
}

/* PageTop() - jump to top of page */
function PageTop() {
 window.location.hash = "pagetop";
}

/* WindowClose() - window close */
function WindowClose() {
 window.close();
 return false;
}

/* OpenInParent() - open a URL in a opener window */
function OpenInParent(url) {
 window.opener.open(url, '_self');
 window.close();
 return false;
}

/* OpenInNew() - open a URL in a opener window */
function OpenInNew(url) {
 window.opener.open(url, '_blank');
 window.close();
 return false;
}

/* SetTitleColor() - set title colors */

function SetTitleColor(o,color) {
 o.style.color = color;
 o.style.borderBottomColor = color;
}

/* CopyTextToClipboard() - copy text to clipboard */
function CopyTextToClipboard(text) {
 window.clipboardData.setData('Text', text);
}

/* ImageURLToClipboard() - copy image URL to clipboard */
function ImageURLToClipboard(element) {
 window.clipboardData.setData('Text', element.src);
}

/*
  ラジオボタン(その他を input type=text または textarea で入力)

   <div id=RadioName1 onClick="RadioSelect(this)">
    <input type=button name=RadioName id=RadioName1Button onSelectStart="RadioWithoutText(this)">
   </div>
   <div id=RadioName1 onClick="RadioSelect(this)">
    <input type=button name=RadioName id=RadioName1Button onSelectStart="RadioWithText(this)">
   </div>
   <input type=text name=RadioNameText id=RadioNameText>
*/

/* RadioSelect(this) - select a radio button */
function RadioSelect(element) {
 var buttonid = element.id + 'Button';
 var e = getElementById(buttonid);
 if (e) e.select();
}

/* RadioWithoutText(this) - select a radio button */
function RadioWithoutText(element) {
 var textid = element.name + 'Text';
 var e = getElementById(textid);
 if (e) e.disabled = 1;
}

/* RadioWithText(this) - select a radio button */
function RadioWithText(element) {
 var textid = element.name + 'Text';
 var e = getElementById(textid);
 if (e) {
  e.disabled = 0;
  e.focus();
 }
}

/* EditStatus */
manaba.editstatus = 0;

/* EditInnerHTML(this) - edit inner HTML */
function EditInnerHTML(element) {
 var text = element.innerHTML;

 text = prompt("Enter text", text);
 text.replace(/&/g,'&amp;');
 text.replace(/</g,'&lt;');
 text.replace(/>/g,'&gt;');
 text.replace(/"/g,'&quot;');
 if (text) {
  element.innerHTML = text;
  manaba.editstatus = 1;
 }
}

/* CheckEditStatus - check edit status */
function CheckEditStatus() {
 if (manaba.editstatus) {
  var msg;

  if (Lang == 'en') {
   msg = "Reload/forward/backward is requested but text is being edited.  Proceed?";
  } else {
   /* default = 'ja' */
   msg = "リロードまたはページ移動が要求されましたが、テキストは編集中です。実行しますか？";
  }

  if (confirm(msg)) return;
 } else {
  return;
 }

 location = self.location;
}

/* CancelEditStatus() */
function CancelEditStatus() {
 manaba.editstatus = 0;
}

/* TestFillMessage */
function TestFillMessage() {
 var s = document.getElementById('Subject');
 var t = document.getElementById('Text');

 s.value = "テストメッセージ";
 t.value = 
"１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０\n" +
"１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０\n" +
"１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０\n" +
"１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０\n" +
"１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０\n" +
"１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０\n" +
"１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０\n" +
"１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０\n" +
"１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０\n" +
"１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０\n";
}

/* EditInPlace - その場で編集 */
function EditInPlace(e) {
 var text = e.innerHTML;
 var width = e.style.width;
 if (width == 0) width = 300;

 var html = "<form><textarea style='width: " + width + "px'>" + text + "</textarea></form>"
 e.innerHTML = html;
}

/* InPlaceConfirm - その場で確認 */
function InPlaceConfirm(o, text) {
 /* <a href=... onClick="return InPlaceConfirm(this, 'Click to delete')"> */
 if (text == o.innerHTML) {
  return true;
 } else {
  o.style.color = 'red';
  o.style.fontWeight = 'bold';
  o.innerHTML = text;
  return false;
 }
}

/* dropdown calendar */
function DDCalendar(inputid,yy,mm,fulldate,ddcaldateonly,fulldatetime) {
 var inp = document.getElementById(inputid);
 var calid = inputid + '_iframe';
 if (! inp || inp.tagName != 'INPUT') throw 'not an input tag';

 var e = document.getElementById(calid);
 if (e) {
  e.style.display = 'inline';
 } else {
  var url = 'calendar_' + yy + '_' + mm + '____' + inputid + (fulldate ? ('?date=' + encodeURIComponent(fulldate)) : '');
  if (ddcaldateonly) url += (fulldate ? '&' : '?') + 'ddcaldateonly=1';
  else if (fulldatetime) url += (fulldate ? '&' : '?') + 'fulldatetime=1';
  var text = '<iframe class="calendar" src="' + url + '" id="' + calid + '" width="195" height="240" style="position: absolute; margin-top: 22px; margin-left: 4px;"></iframe>';
  inp.insertAdjacentHTML('beforeBegin', text);
  e = document.getElementById(inputid);
  e.onkeydown = function () {
   var ev, k;
   if (window.event) {
    ev = window.event;
    k = ev.keyCode;
   } else {
    ev = arguments [0];
    k = ev.which;
   }
   if (k == 27) {
    HideIframe(inputid);
    if (ev.preventDefault) {
     ev.preventDefault();
    } else {
     ev.returnValue=false;
    }
   } 
  }
 }
}

/* hide an IFRAME document in this document */
function HideIframe(inputid) {
 var e = document.getElementById(inputid + '_iframe');
 e.style.display = 'none';
}

/* hide an IFRAME document in parent document */
function HideParentIframe(inputid) {
 var e = window.parent.document.getElementById(inputid + '_iframe');
 e.style.display = 'none';
}

/* focus parent's input area */
function FocusParentInput(inputid) {
 var e = window.parent.document.getElementById(inputid);
 e.focus();
}

/* タブ */
function TabClick(e) {
 var s = e.id.split("_");
 var tabsetid = s[0];
 var tabclicked = s[1];
 var tabbody = tabsetid + "_body_" + tabclicked;

 var el = document.getElementsByTagName("div");
 for (var i = 0;  i < el.length;  i++) {
  var d = el.item(i);
  if (d.id.match(tabsetid + "_body_")) {
   if (d.id == tabbody) {
    d.style.display = "block";
   } else {
    d.style.display = "none";
   }
  }
 }
 return true;
}

/* TabHilite - タブをハイライトする */
function TabHilite(element) {
 // element.style.fontWeight = 'bold';
 element.style.cursor = 'hand';
}

/* TabUnhilite - タブのハイライトを消す */
function TabUnhilite(element) {
 // element.style.fontWeight = 'normal';
 element.style.cursor = 'auto';
}

/* sample HTML for tab functions
<div id=tab1_a onClick="TabClick(this)" onMouseOver="TabHilite(this)" onMouseOut="TabUnhilite(this)">TAB A</div>
<div id=tab1_b onClick="TabClick(this)" onMouseOver="TabHilite(this)" onMouseOut="TabUnhilite(this)">TAB B</div>
<div id=tab1_body_a style="display: none">BODY A</div>
<div id=tab1_body_b style="display: none">BODY B</div>
*/

// DelayedWindowClose - close the window with a bit of wait
// - used in memo to give user better feeling of operation
function DelayedWindowClose(msec) {
  SetTimeoutEvent(WindowClose, null, msec, 1);
}


// ShowHelpIcon - show on-demand help icon

// - check existence of class=ondemandhelp and show icon if one exists.

function ShowHelpIcon(doshow) {
 var e = document.getElementsByTagName('div');
 var len = e.length;
 var found = 0;
 var foundicon = 0;
 for (var i = 0;  i < len;  i++) {
  if (e.item(i).className == 'myhelpicon') {
    foundicon = 1;
    break;
  }
  if (e.item(i).className == 'ondemandhelp') {
   found = 1;
   break;
  }
 }
 if (foundicon) {
  if (found) {
   e = document.getElementById('myhelpicon');
   if (e) {
    e.style.visibility = 'visible';
    if (doshow) {
     FlipOnDemandHelp();
    }
   }
  }
 }
}

// FlashWarn/FlashWarnEnd - flash letters to draw attention of the operator
var gFo = null;

function FlashWarnEnd() {
 if (gFo) {
  manaba.removeClass (gFo, "flashwarn");
 }
}

function FlashWarn(id) {
 var o = document.getElementById(id);
 if (! o) return;

 gFo = o;
 manaba.addClass (o, "flashwarn");

 SetTimeoutEvent(FlashWarnEnd, null, 100, 1);
}


// RadioClick - highlight label when a radio button is checked
function RadioClick(o) {
 var id = o.id;
 var name = o.name;
 if (! id || ! name) return;

 var els = document.getElementsByTagName('label');
 var elsLen = els.length;
 for (var i = 0;  i < elsLen;  i++) {
  var f = els[i].htmlFor;
  if (! f) continue;
  var ro = document.getElementById(f);
  if (! ro) continue;
  if (f == id) {
    els[i].className = 'radio-checked';
  } else if (ro.name == name) {
    els[i].className = 'radio-nocheck';
  }
 }
}

// WindowResizeToStandard - resize screen forcibly
// - used in login to enlarge smaller memo window.
function WindowResizeToStandard() {
 return 1;

 var minw = 760;
 var minh = 600;
 var w = window.innerWidth;
 if (! w) w = document.documentElement.clientWidth;
 var h = window.innerHeight;
 if (! h) h = document.documentElement.clientHeight;
 if (w >= minw && h >= minh) return;
 if (w < minw) w = minw;
 if (h < minh) h = minh;
 resizeTo(w, h);
}

// ChangeFontSize() - change font size, one-image version
// <div id="changefontsize" onClick="ChangeFontSize(this,event)"></div>
function ChangeFontSize(o, event, jump) {

 if (! event) event = window.event;
 var hx = gBrowser.fixChangeFontXCoord ? event.offsetX : event.layerX;
 if (0 <= hx && hx <= 15) {
  o.style.backgroundPosition = '0px 16px';
  if (jump) window.open("home_font_small","_self");
  return SetFontSize('8pt');  //- small
 } else if (20 <= hx && hx <= 35) {
  o.style.backgroundPosition = '0px 32px';
  if (jump) window.open("home_font_medium","_self");
  return SetFontSize('10pt');//- medium
 } else if (40 <= hx && hx <= 55) {
  o.style.backgroundPosition = '0px 48px';
  if (jump) window.open("home_font_large","_self");

  return SetFontSize('12pt');//- large
 }
}

// SetFontSize - set new font size of body element
function SetFontSize(newsize) {
 var els = document.getElementsByTagName('body');
 var elsLen = els.length;
 for (var i = 0;  i < elsLen;  i++) {


  els[i].style.fontSize = newsize;
 }
 asahi_ellipsis_rebuild ();
 return true;

}

// FontSizeX() - change font size
// - size must match the definitions in fontsize_X.css
function FontSizeL() { return FontSize('12pt', 'L'); }
function FontSizeM() { return FontSize('10pt', 'M'); }
function FontSizeS() { return FontSize('8pt', 'S'); }

function FontSize(newsize,scale) {
 var els = document.getElementsByTagName('body');
 var elsLen = els.length;
 for (var i = 0;  i < elsLen;  i++) {
  els[i].style.fontSize = newsize;
 }
 var sizelist = new Array("S", "M", "L");
 var x;
 for (x in sizelist) {
  var o, s;
  if (o = document.getElementById('fontsize' + sizelist[x])) {
   s = o.src;
   if (s.match(/-on\.gif/)) s = s.replace(/-on\.gif$/, '.gif');
   if (scale == sizelist[x]) s = s.replace(/\.gif$/, '-on.gif');
   if (o.src != s) o.src = s;
  }
 }
 return true;
}

// SPFontSizeX() - change spfont size
// - size must match the definitions in fontsize_X.css
function SPFontSizeL(jump) { return SPFontSize('18px', 'L', jump); }
function SPFontSizeM(jump) { return SPFontSize('15px', 'M', jump); }
function SPFontSizeS(jump) { return SPFontSize('12px', 'S', jump); }

function SPFontSize(newsize,scale,jump) {
 var els = document.getElementsByTagName('body');
 var elsLen = els.length;
 for (var i = 0;  i < elsLen;  i++) {
  els[i].style.fontSize = newsize;
 }
 if (jump) {
  var request = CreateXMLHttpRequest();
  request.onreadystatechange = function() {
   // 処理が必要になれば追加する
  };
  if (scale == 'S') request.open("GET", "home_spfont_small", true);
  else if (scale == 'M') request.open("GET", "home_spfont_medium", true);
  else if (scale == 'L') request.open("GET", "home_spfont_large", true);
  request.send(null);
 }
 return true;
}

// DisplayInFront() - display object in front
function DisplayInFront(o) {
 o.style.zIndex = 1;
}

// DisplayInNormal() - display object normal
function DisplayInBack(o) {
 o.style.zIndex = -1;
}

// DarkScreen() - dark screen
function DarkScreen() {
 var x = document.getElementById('darkscreen');
 if (!x) {
  var els = document.getElementsByTagName("body");
  els[0].insertAdjacentHTML('afterBegin', '<div id=darkscreen style="position:absolute;width:100%;height:100%;background-color:red;z-index:3;alpha(opacity=70);-moz-opacity:0.7;opacity:0.7;"></div>');
 }
}

// BBSConfirmThreadDeletion
function BBSConfirmThreadDeletion(threadtitle) {
 var msg;

 if (Lang == 'en') {
  msg = 'Thread "' + threadtitle + '" will be deleted.\nAll comments and attachments in this thread will be deleted and may not be viewed thereafter.\nThis is not a recoverable operation.\nPlease confirm.';
 } else {
  msg = "スレッド「" + threadtitle + "」を削除します。\nこのスレッドに書きこまれた全てのコメントや添付ファイルが\n削除されます。削除後は参照できなくなります。\nまた、削除したスレッドを復旧することもできません。\nよろしいですか？";
 }
 return confirm(msg);
}

/* 以下は使用禁止 */

/* Submitted() - submit operation completed */
function Submitted() {
 var e;

 e = getElementById('submitCount');
 if (e) {
  e.value = e.value + 1;
 }
 return true;
}

/* SubmitForm() - submit this form and disable the button */
function SubmitForm(button) {
 var f;

 f = button.form;
 if (! f) return false;  /* form property missing, stop processing! */

 f.submit();  /* ここで眠る必要がある? */
 button.disabled = 1;
 button.blur();
 return false;
}

function ShowLinkPane(o) {
 var paneid = o.id + "LinkPane";
 var paneobj = document.getElementById(paneid);
 var panetop = o.top + 10;
 var paneleft = o.left + 10;

 if (! paneobj) {
  var e = document.createElement("div");
  e.id = paneid;
  e.position = 'absolute';
  e.style.top = panetop;
  e.style.left = paneleft;
  e.style.backgroundColor = '#FF0000';
  e.style.color = '#FFFFFF';
  e.style.zIndex = 1;
  e.style.display = 'block';
  e.style.visibility = 'visible';
  var str = document.createTextNode("This is a TEST");
  e.appendChild(str);
  document.body.appendChild(e);
  paneobj = e;
 }
}

function CellUp(o) {
 var cellnum = o.id.replace("u","") * 1;
 var thiscell = document.getElementById("s" + cellnum);
 if (! thiscell) return false;
 var thistext = thiscell.innerHTML;
 if (cellnum == 1) return false;
 var prevcell = document.getElementById("s" + (cellnum - 1));
 if (! prevcell) return false;
 var prevtext = prevcell.innerHTML;
 var previnput = document.getElementById("o" + (cellnum - 1));
 var thisinput = document.getElementById("o" + cellnum);
 if (! previnput || ! thisinput) return false;
 var thisvalue = thisinput.value;
 var prevvalue = previnput.value;
 thisinput.value = prevvalue;
 previnput.value = thisvalue;
 prevcell.innerHTML = thistext;
 thiscell.innerHTML = prevtext;
 return true;
}
function CellDown(o) {
 var cellnum = o.id.replace("d","") * 1;
 var thiscell = document.getElementById("s" + cellnum);
 if (! thiscell) return false;
 var thistext = thiscell.innerHTML;
 var nextcell = document.getElementById("s" + (cellnum + 1));
 if (! nextcell) return false;
 var nexttext = nextcell.innerHTML;
 var nextinput = document.getElementById("o" + (cellnum + 1));
 var thisinput = document.getElementById("o" + cellnum);
 if (! nextinput || !thisinput) return false;
 var thisvalue = thisinput.value;
 var nextvalue = nextinput.value;
 thisinput.value = nextvalue;
 nextinput.value = thisvalue;
 nextcell.innerHTML = thistext;
 thiscell.innerHTML = nexttext;
 return true;
}

// rollover functions
manaba.rolloverOnMouseDown = function (o) {
 var x = 0;
 var height = parseInt (o.style.height);
 try {
  if (o.style.backgroundPosition.match (/^(\-?[0-9]+)px/)) {
   x = RegExp.$1;
  }
 }
 catch (e) {}
 o.style.backgroundPosition = x + "px " + (-height * 2) + "px";
};
manaba.rolloverOnMouseOver = function (o) {
 var x = 0;
 var height = parseInt (o.style.height);
 try {
  if (o.style.backgroundPosition.match (/^(\-?[0-9]+)px/)) {
   x = RegExp.$1;
  }
 }
 catch (e) {}
 o.style.backgroundPosition = x + "px " + (-height) + "px";
};
manaba.rolloverOnMouseOut = function (o) {
 var x = 0;
 try {
  if (o.style.backgroundPosition.match (/^(\-?[0-9]+)px/)) {
   x = RegExp.$1;
  }
 }
 catch (e) {}
 o.style.backgroundPosition = x + "px " + (0) + "px";
};

// embedded memo
manaba.OpenEmbeddedMemo = function (url, o, isList, x, y) {
 var id = escape (url).replace (/[\+\*]/g, "_");
 if (document.getElementById (id)) {
  return false;
 }
 var blocker = document.createElement ("span");
 blocker.id = id;
 document.body.appendChild (blocker);
 var i, nodes;
 
 if (!url.match (/^http(s):\/\//)) {
  var base = document.location.href.replace (/\?.+$/, "").replace (/\/[^\/]*$/, "/");
  url = base + url;
 }
 $expiredMessage = "有効期限が切れました。リロードして再度ログインしてください";
 embed_url = url + "?embed=" + (new Date ()).getTime ();
 var request =  CreateXMLHttpRequest ();
 request.onreadystatechange = function () {
 if (request.readyState == 4
     && request.status == 200) {
  var div= document.createElement ("div");
  div.className = "memo_embed";
  var responseText = request.responseText;
  var checkComment = "<!-- This is Embedded Memo -->";
  var commentStart= responseText.indexOf (checkComment);
  if (commentStart == -1) {
   alert ($expiredMessage);
   blocker.parentNode.removeChild (blocker);
   return false;
  }
  responseText = responseText.substr (0, commentStart)
    + responseText.substr (commentStart+ checkComment.length);
  var scriptStartTag = "<script>";
  var scriptEndTag = "</script>";
  var scriptStart = responseText.indexOf (scriptStartTag);
  var scriptEnd = responseText.indexOf (scriptEndTag);
  if (scriptStart != -1 && scriptEnd != -1 && scriptStart < scriptEnd) {
   var src = responseText.substr
    (scriptStart + scriptStartTag.length,
     scriptEnd - (scriptStart + scriptStartTag.length));
   eval (src);
   responseText = responseText.substr (0, scriptStart)
    + responseText.substr (scriptEnd + scriptEndTag.length);
  }
  var embedID = (new Date ()).getTime () + "-" + parseInt (Math.random ());
  responseText = responseText.replace (/\[embedID\]/g, embedID);
  div.innerHTML = responseText;
  var parentNode = o.parentNode;
  var hiddenObjects = new Array ();
  if (isList) {
   parentNode = o;
   while (parentNode) {
    if ("className" in parentNode
        && parentNode.className.match (/memo[0-9]/)) {
     break;
    }
    parentNode = parentNode.parentNode;
   }
   if (!parentNode) {
    blocker.parentNode.removeChild (blocker);

    return;
   }
   nodes = parentNode.getElementsByTagName ("img");
   for (i = 0; i < nodes.length; i ++) {
    hiddenObjects.push (nodes [i]);
   }
   nodes = parentNode.getElementsByTagName ("a");
   for (i = 0; i < nodes.length; i ++) {
    hiddenObjects.push (nodes [i]);
   }
   parentNode.appendChild(div);
  }
  else {
   parentNode.insertBefore (div, o.nextSibling);
   hiddenObjects.push (o);
  }
  for (i = 0; i < hiddenObjects.length; i ++) {
   hiddenObjects [i].style.display = "none";
  }
  // modify memo
  var memoNode = null;
  if (isList) {
   nodes = parentNode.getElementsByTagName ("div");
   for (i = 0; i < nodes.length; i ++) {
    if ("className" in nodes [i]
        && nodes [i].className == "memo_text") {
     memoNode = nodes [i];
    }
   }
  }
  else {
   nodes = parentNode.getElementsByTagName ("span");
   for (i = 0; i < nodes.length; i ++) {
    if ("className" in nodes [i]
        && nodes [i].className == "memo_text") {
     memoNode = nodes [i];
    }
   }
  }
  if (memoNode) {
   memoNode.style.display = "none";
  }
  var originalClassName = "";
  var className = "";
  if ("className" in parentNode) {
   className = parentNode.className;
  }
  originalClassName = className;
  
  var textarea = null;
  nodes = parentNode.getElementsByTagName ("textarea");
  for (i = 0; i < nodes.length; i ++) {
   if ("className" in nodes [i]) {
    textarea = nodes [i];
    className = className.replace (/memo[0-9]/, "");
    className += " " + nodes [i].className;
    className = className.replace (/^ /, "");
    parentNode.className = className;
    textarea.style.background = "transparent";
    textarea.style.padding = "0px";
    if (gBrowser.isOpera
        && window.opera.version () < 9.5) {
     textarea.rows = 6;
    }
    if (gBrowser.isGecko && !gBrowser.isSafari) {
     manaba.addevent
      (textarea,
       "overflow",
       function () {
        textarea.style.height = textarea.scrollHeight + "px";
       });
    }
    else {
     setInterval
      (function () {
        textarea.style.height = textarea.scrollHeight + "px";
       }, 500);
    }
    setTimeout
     (function () {
       textarea.style.height = textarea.scrollHeight + "px";
      }, 100);
    if ("setSelectionRange" in textarea) {
     textarea.setSelectionRange (textarea.value.length, textarea.value.length);
    }
    else {
     var range = textarea.createTextRange ();
     range.collapse (false);
     range.select ();
    }
    textarea.focus ();
   }
  }
  
  var addButton = null, editButton = null;
  nodes = parentNode.getElementsByTagName ("img");
  for (i = 0; i < nodes.length; i ++) {
   if ("className" in nodes [i]
       && nodes [i].className == "memobutton") {
    if (addButton == null) {
     addButton = nodes [i];
    }
    else {
     editButton = nodes [i];
     break;
    }
   }
  }
  // modify form
  nodes = div.getElementsByTagName ("a");
  for (i = 0; i < nodes.length; i ++) {
   if ("className" in nodes [i]
       && nodes [i].className == "memoclosebutton") {
    nodes [i].removeAttribute ("href");
    manaba.addevent
     (nodes [i],
      "click",
      function () {
        div.parentNode.removeChild (div);

        blocker.parentNode.removeChild (blocker);
        for (var j = 0; j < hiddenObjects.length; j ++) {
         hiddenObjects [j].style.display = "";
        }
        if (memoNode) {
         memoNode.style.display = "";
        }
        parentNode.className = originalClassName;
      });
   }
  }
  nodes = div.getElementsByTagName ("iframe");
  if (nodes.length > 0) {
   var iframe = nodes [0];
   manaba.addevent
    (iframe,
     "load",
     function () {
      if (iframe.contentWindow.document.location.href.indexOf ("usermemo") != -1) {
       setTimeout (function () {
        var memoonly_url = url + "?memoonly=" + (new Date ()).getTime ();
        var request2 = CreateXMLHttpRequest ();
        request2.open ('GET', memoonly_url, false); 
        request2.send (null);
        if (request2.status == 200) {
         var responseText = request2.responseText;
         var checkComment = "<!-- This is Embedded Memo -->";
         var commentStart= responseText.indexOf (checkComment);
         if (commentStart == -1) {
          alert ($expiredMessage);
          blocker.parentNode.removeChild (blocker);

          return false;
         }
         responseText = responseText.substr (0, commentStart)
           + responseText.substr (commentStart+ checkComment.length);
         if (memoNode) {
          memoNode.innerHTML = responseText;
          memoNode.style.display = "";
         }
        }
        div.parentNode.removeChild (div);
        blocker.parentNode.removeChild (blocker);
        for (var j = 0; j < hiddenObjects.length; j ++) {
         hiddenObjects [j].style.display = "";
        }
        var memoColor = -1;
        if (textarea && "className" in textarea
            && textarea.className.match (/memo([0-9])/)) {
         memoColor = RegExp.$1
        }

        if (memoColor == -1) {
         if (isList) {
          document.location.reload ();
         }
         else {
          if (addButton ) {
           addButton.style.display = "inline";
          }
          if (editButton ) {
           editButton.style.display = "none";
          }
          if (isList) {
           var tr = manaba.findParentNode (parentNode, "tr");
           if (tr) {
            tr.parentNode.removeChild (tr);
           }
          }
         }
        }
        else {
         if (addButton ) {
          addButton.style.display = "none";
         }
         if (editButton ) {
          editButton.style.display = "inline";

          editButton.src = editButton.src.replace (/-[0-9]/, "-" + memoColor);
         }
        }
       }, 100);
      }
     });
  }
 }
 };
 
 request.open ('GET', embed_url, true); 
 request.send (null);
};

// embedded calendar
manaba.calendarOnMoveToday = function (target) {
 var div = manaba.findParentNode (target, "div");
 if (!div) {
  return;
 }
 var v_yearNode = null;
 var v_monthNode = null;
 var nodes = div.getElementsByTagName ("input");
 for (var i = 0; i < nodes.length; i ++) {
  if (nodes [i].name == "v_year") {
   v_yearNode = nodes [i];
  }
  if (nodes [i].name == "v_month") {
   v_monthNode = nodes [i];
  }
 }
 var date = new Date();
 v_yearNode.value = date.getFullYear();
 v_monthNode.value = date.getMonth() + 1;
 manaba.calendarUpdate (target);
};
manaba.calendarOnMove = function (target, inc, inc_year) {
 var div= manaba.findParentNode (target, "div");
 if (!div) {
  return;
 }
 
 var v_year = 0;
 var v_month = 0;
 var v_yearNode = null;
 var v_monthNode = null;
 var nodes = div.getElementsByTagName ("input");
 for (var i = 0; i < nodes.length; i ++) {
  if (nodes [i].name == "v_year") {
   v_year = parseInt (nodes [i].value.replace (/^0+/, "") || "0");
   v_yearNode = nodes [i];
  }
  if (nodes [i].name == "v_month") {
   v_month = parseInt (nodes [i].value.replace (/^0+/, "") || "0");
   v_monthNode = nodes [i];
  }
 }

 if (inc_year) {
  v_year += inc_year;
 }
 
 v_month += inc;
 if (v_month == 0) {
  v_month = 12;
  v_year --;

 }

 if (v_month == 13) {
  v_month = 1;
  v_year ++;
 }
 
 v_yearNode.value = v_year;
 v_monthNode.value = v_month;
 
 manaba.calendarUpdate (target);
};
manaba.calendarOnMoveYear = function (target, inc) {
 var div= manaba.findParentNode (target, "div");
 if (!div) {
  return;
 }
 
 var v_year = 0;
 var v_month = 0;
 var v_yearNode = null;
 var v_monthNode = null;
 var nodes = div.getElementsByTagName ("input");
 for (var i = 0; i < nodes.length; i ++) {
  if (nodes [i].name == "v_year") {
   v_year = parseInt (nodes [i].value.replace (/^0+/, "") || "0");
   v_yearNode = nodes [i];
  }
  if (nodes [i].name == "v_month") {
   v_month = parseInt (nodes [i].value.replace (/^0+/, "") || "0");
   v_monthNode = nodes [i];
  }
 }
 
 v_year += inc;
 if (v_month == 0) {
  v_month = 12;
  v_year --;

 }

 if (v_month == 13) {
  v_month = 1;
  v_year ++;
 }
 
 v_yearNode.value = v_year;
 v_monthNode.value = v_month;
 
 manaba.calendarUpdate (target);
};
manaba.calendarOnDblClick = function (target) {
 var div = manaba.findParentNode (target, "div");
 if (!div) {
  return false;
 }
 var inp = document.getElementById (div.id.replace (/_iframe$/, ""));
 if (!inp) {
  return;
 }
 var inp2 = document.getElementById (div.id + "_ddinput");
 if (!inp2) {
  return;
 }
 if (manaba.calendarOnClick (target)) {
     InputBlur (inp);

     inp.value = inp2.value;
     div.style.display = "none";
     manaba.showSelectMenu ();
     if (manaba.timeLimitAlertMessage) {
      manaba.fireHTMLEvent(inp, "change")
     }
 }
};
manaba.calendarOnClick = function (target) {
 var target = manaba.findParentNode (target, "td");
 if (!target) {
  return false;
 }
 var span = target.getElementsByTagName ("span");
 var ok = false;
 var day = 0;
 if (span.length > 0) {
  var text = span [0].innerHTML;
  if (text.match (/([0-9]+)/)) {
   ok = true;
   day = RegExp.$1;
  }
 }
 if (!ok) {
  return false;
 }

 var table = manaba.findParentNode (target, "table");
 if (!table) {
  return false;
 }
 var nodes = table.getElementsByTagName ("td");
 for (var i = 0; i < nodes.length; i ++) {
  manaba.removeClass (nodes [i], "selectdate");
 }
 manaba.addClass (target, "selectdate");
 var div= manaba.findParentNode (target, "div");
 if (!div) {
  return false;
 }
 var v_year = 0;
 var v_month = 0;
 var nodes = div.getElementsByTagName ("input");
 for (var i = 0; i < nodes.length; i ++) {
  if (nodes [i].name == "v_year") {
   v_year = nodes [i].value;
  }
  if (nodes [i].name == "v_month") {

   v_month = nodes [i].value;
  }
 }

 nodes = div.getElementsByTagName ("input");

 for (var i = 0; i < nodes.length; i ++) {
  if (nodes [i].name == "day") {
   nodes [i].value = day;
  }
  if (nodes [i].name == "year") {
   nodes [i].value = v_year;
  }
  if (nodes [i].name == "month") {
   nodes [i].value = v_month;
  }
 }
 manaba.calendarToInput (target);
 return true;
};
manaba.calendarOnInput = function (target) {
 var div = manaba.findParentNode (target, "div");
 if (!div) {
  return;
 }
 var dateonly = div.className.match (/(^|\s)dateonly((\s|$))/);
 var fulldatetime = div.className.match (/(^|\s)fulldatetime((\s|$))/);
 var inp = document.getElementById (div.id.replace (/_iframe$/, ""));
 if (!inp) {
  return;
 }
 var inp2 = document.getElementById (div.id + "_ddinput");
 if (!inp2) {
  return;
 }
 var datetime_re;
 if (dateonly) {
  datetime_re = /([0-9]+)-([0-9]+)-([0-9]+)/;
 } else if (fulldatetime) {
  datetime_re = /([0-9]+)-([0-9]+)-([0-9]+) ([0-9]+):([0-9]+):([0-9]+)/;
 } else {
  datetime_re = /([0-9]+)-([0-9]+)-([0-9]+) ([0-9]+):([0-9]+)/;
 }
 if (inp2.value.match (datetime_re)) {

  year = RegExp.$1;
  month= RegExp.$2;
  day = RegExp.$3;
  hour = RegExp.$4;
  min = RegExp.$5;
  sec = RegExp.$6;
  year = parseInt (year.replace (/^0+/, "") || "0");
  month= parseInt (month.replace (/^0+/, "") || "0");
  day = parseInt (day.replace (/^0+/, "") || "0");
  hour = parseInt (hour.replace (/^0+/, "") || "0");
  min = parseInt (min.replace (/^0+/, "") || "0");
  sec = parseInt (sec.replace (/^0+/, "") || "0");
  inp.value = inp2.value;
 
  if (month <= 0 || month > 12) {
   return;
  }
  if (hour > 24 || min > 60 || sec > 60) {
   return;
  }
  
  var date = new Date ();

  date.setDate (1);
  date.setHours (0);
  date.setMinutes (0);
  date.setMonth (month - 1);
  date.setYear (year);
  var n = -date.getDay ();
  var maxday = 28;
  while (maxday < 32) {

   date.setDate (maxday);

   if (date.getMonth () != month - 1) {
    break;
   }
   maxday ++;
  }
  if (day <= 0 || day >= maxday) {
   return;
  }
  
  var nodes = div.getElementsByTagName ("input");
  for (var i = 0; i < nodes.length; i ++) {
   if (nodes [i].name == "year") {
    nodes [i].value = year;
   }
   if (nodes [i].name == "v_year") {
    nodes [i].value = year;
   }
   if (nodes [i].name == "month") {

    nodes [i].value = month;
   }
   if (nodes [i].name == "v_month") {
    nodes [i].value = month;
   }
   if (nodes [i].name == "day") {
    nodes [i].value = day;
   }
   if (nodes [i].name == "hour") {
    nodes [i].value = hour;

   }
   if (nodes [i].name == "min") {
    nodes [i].value = min;
   }
   if (nodes [i].name == "sec") {
    nodes [i].value = sec;
   }
  }
  manaba.calendarUpdate (inp2);
 }
};
manaba.calendarOnSelectHour = function (target) {
 var div = manaba.findParentNode (target, "div");
 if (!div) {
  return;
 }
 var nodes = div.getElementsByTagName ("input");
 for (var i = 0; i < nodes.length; i ++) {
  if (nodes [i].name == "hour") {
   nodes [i].value = target.value;
  }
 }
 manaba.calendarToInput (target);
};
manaba.calendarOnSelectMin = function (target) {
 var div = manaba.findParentNode (target, "div");
 if (!div) {
  return;
 }
 if (target.value == -1) {
  return;
 }
 var nodes = div.getElementsByTagName ("input");
 for (var i = 0; i < nodes.length; i ++) {
  if (nodes [i].name == "min") {
   nodes [i].value = target.value;


  }

 }
 manaba.calendarToInput (target);
};
manaba.calendarOnSelectSec = function (target) {
 var div = manaba.findParentNode (target, "div");
 if (!div) {
  return;
 }
 if (target.value == -1) {
  return;
 }
 var nodes = div.getElementsByTagName ("input");
 for (var i = 0; i < nodes.length; i ++) {
  if (nodes [i].name == "sec") {
   nodes [i].value = target.value;
  }
 }
 manaba.calendarToInput (target);
};
manaba.calendarToInput = function (target) {
 var div = manaba.findParentNode (target, "div");
 if (!div) {
  return;
 }
 var dateonly = div.className.match (/(^|\s)dateonly((\s|$))/);
 var fulldatetime = div.className.match (/(^|\s)fulldatetime((\s|$))/);
 var inp = document.getElementById (div.id.replace (/_iframe$/, ""));
 if (!inp) {
  return;
 }
 var inp2 = document.getElementById (div.id + "_ddinput");
 if (!inp2) {
  return;
 }
 var year = 0;
 var month = 0;
 var day = 0;
 var hour = 0;
 var min = 0;
 var sec = 0;
 var nodes = div.getElementsByTagName ("input");
 for (var i = 0; i < nodes.length; i ++) {
  if (nodes [i].name == "year") {
   year = nodes [i].value;
  }
  if (nodes [i].name == "month") {
   month= nodes [i].value;
  }
  if (nodes [i].name == "day") {
   day= nodes [i].value;
  }
  if (nodes [i].name == "hour") {
   hour = nodes [i].value;
  }
  if (nodes [i].name == "min") {
   min = nodes [i].value;
  }
  if (nodes [i].name == "sec") {
   sec = nodes [i].value;
  }
 }
 if (month < 10) {
  month = "0" + month;
 }
 if (day < 10) {
  day = "0" + day;
 }
 if (hour < 10) {
  hour = "0" + hour;
 }
 if (min < 10) {
  min = "0" + min;
 }
 if (sec < 10) {
  sec = "0" + sec;
 }
 if (dateonly) {
  inp.value = inp2.value = year + "-" + month + "-" + day;
 } else if (fulldatetime) {
  inp.value = inp2.value = year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
 } else {
  inp.value = inp2.value = year + "-" + month + "-" + day + " " + hour + ":" + min;
 }
};
manaba.calendarOnMouseOver = function (target) {
 var target = manaba.findParentNode (target, "td");
 if (!target) {
  return;
 }

 var span = target.getElementsByTagName ("span");
 if (span.length > 0) {
  var text = span [0].innerHTML;
  if (text.match (/([0-9]+)/)) {
   manaba.addClass (target, "hiliteaslink");
  }
 }
};
manaba.calendarMouseOut = function (target) {
 var target = manaba.findParentNode (target, "td");
 if (!target) {
  return;
 }
 var span = target.getElementsByTagName ("span");
 if (span.length > 0) {
  var text = span [0].innerHTML;
  if (text.match (/([0-9]+)/)) {
   manaba.removeClass (target, "hiliteaslink");
  }
 }
};

manaba.calendarUpdate = function (target) {
 var div= manaba.findParentNode (target, "div");
 if (!div) {
  return;
 }
 var fulldatetime = div.className.match (/(^|\s)fulldatetime((\s|$))/);
 var v_year = 0;
 var v_month = 0;
 var year = 0;
 var month = 0;
 var day = 0;
 var hour = 0;
 var min = 0;
 var sec = 0;
 
 var nodes = div.getElementsByTagName ("input");
 for (var i = 0; i < nodes.length; i ++) {
  if (nodes [i].name == "v_year") {
   v_year = parseInt (nodes [i].value.replace (/^0+/, "") || "0");
  }
  if (nodes [i].name == "v_month") {
   v_month = parseInt (nodes [i].value.replace (/^0+/, "") || "0");
  }
  if (nodes [i].name == "year") {
   year = parseInt (nodes [i].value.replace (/^0+/, "") || "0");
  }

  if (nodes [i].name == "month") {
   month = parseInt (nodes [i].value.replace (/^0+/, "") || "0");
  }
  if (nodes [i].name == "day") {
   day = parseInt (nodes [i].value.replace (/^0+/, "") || "0");
  }
  if (nodes [i].name == "hour") {
   hour = parseInt (nodes [i].value.replace (/^0+/, "") || "0");
  }
  if (nodes [i].name == "min") {
   min = parseInt (nodes [i].value.replace (/^0+/, "") || "0");
  }
  if (nodes [i].name == "sec") {
   sec = parseInt (nodes [i].value.replace (/^0+/, "") || "0");
  }
 }
 var nodes = div.getElementsByTagName ("td");
 var date = new Date ();
 var todayDate = date.getDate ();
 var isSameMonth = false;
 if (date.getFullYear () == v_year && date.getMonth () == v_month - 1) {
  isSameMonth = true;
 }
 
 date.setDate (1);
 date.setHours (0);
 date.setMinutes (0);
 date.setMonth (v_month - 1);
 date.setYear (v_year);
 var n = -date.getDay ();
 var maxday = 28;
 while (maxday < 32) {

  date.setDate (maxday);
  if (date.getMonth () != v_month - 1) {
   break;
  }
  maxday ++;
 }
 for (i = 0; i < nodes.length; i ++) {
  if ("className" in nodes [i]
      && nodes [i].className.match (/caldaybox/)) {
   manaba.removeClass (nodes [i], "selectdate");
   var span = nodes [i].getElementsByTagName ("span");
   if (span.length > 0) {
    n ++;
    nodes [i].style.border = "1px solid #FFFFFF";
    if (n > 0 && n < maxday) {
     if (v_year == year && v_month == month && n == day) {
      manaba.addClass (nodes [i], "selectdate");
     }
     span [0].innerHTML = n;
     var defClass = "";
     if ("className" in span [0]) {
      defClass = span [0].className.replace (/ caltoday/, "");
     }
     var todayClass = "";
     if (isSameMonth && n == todayDate) {
      todayClass = " caltoday";
     }
     span [0].className = defClass + todayClass;
    }
    else {
     span [0].innerHTML = "";
    }
   }
  }
 }
 
 nodes = div.getElementsByTagName ("div");
 for (var i = 0; i < nodes.length; i ++) {
  if ("className" in nodes [i]
      && nodes [i].className == "calheading") {
   nodes [i].innerHTML = v_year + "/" + v_month;
  }
 }
 
 nodes = div.getElementsByTagName ("select");
 for (var i = 0; i < nodes.length; i ++) {
  if (nodes [i].name == "Hour") {
   nodes [i].value = hour;

  }

  if (nodes [i].name == "Min") {
   if (fulldatetime) {
    nodes [i].value = min;
   } else {
    if (min % 5 == 0) {
     nodes [i].value = min;
    }
    else {
     nodes [i].value = -1;
    }
   }
  }

  if (nodes [i].name == "Sec") {
   nodes [i].value = sec;
  }
 }
};
function EmbeddedCalendar(inputid,yy,mm,fulldate,dateonly,fulldatetime,yearmove,closebutton, dayofweek) {
 if (inputid.match (/_ddinput/)) {
  return;
 }
 var inp = document.getElementById(inputid);
 var calid = inputid + '_iframe';
 if (! inp || inp.tagName != 'INPUT') throw 'not an input tag';

 var e = document.getElementById(calid);
 if (e) {
  if (e.style.display != "block") {
   e.style.display = "block";
   manaba.hideSelectMenu ();
   var inp2 = document.getElementById(calid + "_ddinput");
   if (inp2) {
    inp2.value = inp.value;
    if (gBrowser.isIE) {
     inp2.focus ();
    }
    else {
     inp2.focus ();
     inp2.selectionStart = inp.selectionStart;
     inp2.selectionEnd = inp.selectionEnd;
    }
    InputFocus(inp2);

    setTimeout (function () {
     inp2.focus ();
     InputFocus(inp2);
    }, 100);
   }
  }
 } else {
  var year = 0;
  var month = 0;
  var day = 0;
  var hour = 0;
  var min = 0;
  var sec = 0;
  var datetime_re;
  if (dateonly) {
   datetime_re = /([0-9]+)-([0-9]+)-([0-9]+)/;
  } else if (fulldatetime) {
   datetime_re = /([0-9]+)-([0-9]+)-([0-9]+) ([0-9]+):([0-9]+):([0-9]+)/;
  } else {
   datetime_re = /([0-9]+)-([0-9]+)-([0-9]+) ([0-9]+):([0-9]+)/;
  }
  if (inp.value.match (datetime_re)) {
   year = RegExp.$1;
   month= RegExp.$2;
   day = RegExp.$3;
   hour = RegExp.$4;
   min = RegExp.$5;
   sec = RegExp.$6;
   year = parseInt (year.replace (/^0+/, "") || "0");
   month= parseInt (month.replace (/^0+/, "") || "0");
   day = parseInt (day.replace (/^0+/, "") || "0");


   hour = parseInt (hour.replace (/^0+/, "") || "0");
   min = parseInt (min.replace (/^0+/, "") || "0");
   sec = parseInt (sec.replace (/^0+/, "") || "0");
  }
  else {
   var date = new Date ();
   year = date.getFullYear ();
   month= date.getMonth () + 1;
   day = date.getDate ();
   hour = date.getHours ();
   if (fulldatetime) {
    min = date.getMinutes ();
   } else {
    min = parseInt (date.getMinutes () / 5) * 5;
   }
   sec = date.getSeconds ();
  }
  var div = document.createElement ("div");
  div.id = calid;
  div.className = "calendar";
  if (dateonly) {
   manaba.addClass (div, "dateonly");
  } else if (fulldatetime) {
   manaba.addClass (div, "fulldatetime");
  }
  div.style.width = "195px";
  div.style.height = "250px";
  div.style.position = "absolute";
  div.style.zIndex = 200;
  div.style.visibility = "hidden";
  var inp2 = document.createElement ("input");
  inp2.className = "editable";
  inp2.type = "text";
  try {
   inp2.classname = inp.className;
  } catch (e) {}
  inp2.value = inp.value;
   inp2.id = calid + "_ddinput";
  inp2.onclick = "";
  inp2.onkeypress = "";
  inp2.style.marginLeft = "2px";
  inp2.style.marginTop = "2px";
  manaba.addevent
   (inp2,
    "focus",
    function () {
     var target;
     if (gBrowser.isIE) {
      target = window.event.srcElement;
     }
     else {
      target = arguments [0].target;
     }
     InputFocus (target);
    });
  manaba.addevent
   (inp2,
    "blur",
    function () {
     var target;
     if (gBrowser.isIE) {
      target = window.event.srcElement;
     }
     else {
      target = arguments [0].target;
     }
     InputBlur (target);
    });
  manaba.addevent
   (inp2,
    "input",
    function () {
     var target;
     if (gBrowser.isIE) {
      target = window.event.srcElement;
     }
     else {
      target = arguments [0].target;
     }
     manaba.calendarOnInput (target);
    });
  if (gBrowser.isIE) {
   manaba.addevent
    (inp2,
     "keyup",
     function () {
      var target;
      if (gBrowser.isIE) {
       target = window.event.srcElement;
      }
      else {
       target = arguments [0].target;
      }
      manaba.calendarOnInput (target);
     });
  }
  div.appendChild (inp2);

  var table = makeCalendarTable (div, inp, inp2, year, month, day, hour, min, dateonly, fulldatetime, sec, yearmove, closebutton, dayofweek);

  div.appendChild (table);
  manaba.hideSelectMenu ();
  inp.parentNode.insertBefore (div, inp);
  setTimeout (function () {
    var w = 0, h = 0;
    w = table.offsetLeft + table.offsetWidth + 8;
    h = table.offsetTop + table.offsetHeight + 8;
    div.style.width = w + "px";
    div.style.height = h + "px";
    div.style.visibility = "visible";
   }, 10);
  manaba.calendarUpdate (inp2);
  if (gBrowser.isIE) {
   inp2.focus ();
  }
  else {
   inp2.focus ();
   inp2.selectionStart = inp.selectionStart;
   inp2.selectionEnd = inp.selectionEnd;
  }
  InputFocus(inp2);

  var closeFunction = function () {
   var target;
   if (gBrowser.isIE) {
    target = window.event.srcElement;
   }
   else {
    var event = arguments [0];
    target = event.target;
   }
   var node = target;
   while (node) {
    if (node  == div || node == inp) {
     break;
    }
    node = node.parentNode;
   }
   if (!node) {
    InputBlur (inp);
    if (div.style.display != "none") {
     inp.value = inp2.value;
     div.style.display = "none";
     manaba.showSelectMenu ();
     if (manaba.timeLimitAlertMessage) {
      manaba.fireHTMLEvent(inp, "change");
     } 
    }
   }
  }
  setTimeout (function () {
   inp2.focus ();
   manaba.addevent (document.body, "click", closeFunction);
  }, 100);

  manaba.addevent
   (inp2, "keydown",
    function () {
     var ev, k;
     if (window.event) {
      ev = window.event;
      k = ev.keyCode;
     } else {
      ev = arguments [0];
      k = ev.which;
     }
     if (k == 27) {
      inp.value = inp2.value;
      if (div.style.display != "none") {
       div.style.display = "none";
       manaba.showSelectMenu ();
       if (manaba.timeLimitAlertMessage) {
        manaba.fireHTMLEvent(inp, "change");
       }      
      }
      inp.focus ();
      try {
       inp.selectionStart = inp2.selectionStart;
       inp.selectionEnd = inp2.selectionEnd;
      } catch (e) {};
      InputFocus(inp);

      setTimeout (function () {
       inp.focus ();
       InputFocus(inp);
      }, 100);

      if (ev.preventDefault) {
       ev.preventDefault();
      } else {
       ev.returnValue = false;
      }
     }
    });

  adjustCalendarPosition(div, inp, inp2);
 }
}
function adjustCalendarPosition(div, inp, inp2) {
  var divstyle = div.currentStyle || document.defaultView.getComputedStyle(div, "");
  var inpstyle = inp.currentStyle || document.defaultView.getComputedStyle(inp, "");
  var inp2style = inp2.currentStyle || document.defaultView.getComputedStyle(inp2, "");
  //var parentstyle = inp.currentStyle || document.defaultView.getComputedStyle(inp.parentNode, "");

  div.style.marginLeft = parseInt(inpstyle.marginLeft)
   - parseInt(divstyle.marginLeft)
   - parseInt(divstyle.borderLeftWidth)
   - parseInt(divstyle.paddingLeft)
   - parseInt(inp2style.marginLeft)
   + "px";
  div.style.marginTop = parseInt(inpstyle.marginTop)
   - parseInt(divstyle.marginTop)
   - parseInt(divstyle.borderTopWidth)
   - parseInt(divstyle.paddingTop)
   - parseInt(inp2style.marginTop)
   + "px";
}
function makeCalendarTable(div, inp, inp2, year, month, day, hour, min, dateonly, fulldatetime, sec, yearmove, closebutton, dayofweek) {
  var table = document.createElement ("table");
  var tbody = document.createElement ("tbody");
  if (yearmove || closebutton) {
   table.className = "caltable caltableV2";
  } else {
   table.className = "caltable";
  }
  var tr, td, a, img, div2, sel, opt, input;

  tr = document.createElement ("tr");
  tr.style.height = "auto";

  td = document.createElement ("td");
  td.style.padding = "0px";
  td.style.border = "1px solid #FFFFFF";
  a = document.createElement ("a");
  manaba.addevent
   (td,
    "click",
    function () {
     var target;
     if (gBrowser.isIE) {
      target = window.event.srcElement;
     }
     else {
      target = arguments [0].target;
     }
     if (yearmove) {
      manaba.calendarOnMoveYear (target, -1);
     } else {
      manaba.calendarOnMove (target, -1);
     }
    });
  img = document.createElement ("img");
  img.className = "icon-left";
  if (yearmove) {
   img.src = "/icon-left-d.gif";
  } else {
   img.src = "/icon-left.gif";
  }
  img.alt = "previous";
  img.border = 0;
  img.style.verticalAlign = "top";
  a.appendChild (img);
  td.appendChild (a);
  tr.appendChild (td);
  td = document.createElement ("td");
  td.style.padding = "0px";
  td.colSpan = 5;
  td.style.border = "1px solid #FFFFFF";
  div2 = document.createElement ("div");
  div2.className = "calheading";
  div2.innerHTML = year + "/" + month;
  if (yearmove) {
   a = document.createElement ("a");
   manaba.addevent
    (a,
     "click",
     function () {
      var target;
      if (gBrowser.isIE) {
       target = window.event.srcElement;
      }
      else {
       target = arguments [0].target;
      }
      manaba.calendarOnMove (target, -1);
     });
   img = document.createElement ("img");
   img.className = "icon-left";
   img.src = "/icon-left.gif";
   img.alt = "previous";
   img.border = 0;
   img.style.verticalAlign = "top";
   a.appendChild (img);
   td.appendChild(a);

   td.appendChild (div2);

   a = document.createElement ("a");
   manaba.addevent
    (a,
     "click",
     function () {
      var target;
      if (gBrowser.isIE) {
       target = window.event.srcElement;
      }
      else {
       target = arguments [0].target;
      }
      manaba.calendarOnMove (target, 1);
     });
   img = document.createElement ("img");
   img.className = "icon-right";
   img.src = "/icon-right.gif";
   img.alt = "next";
   img.border = 0;
   img.style.verticalAlign = "top";
   a.appendChild (img);
   td.appendChild (a);
  } else {
   td.appendChild (div2);
  }
  tr.appendChild (td);
  td = document.createElement ("td");
  td.style.padding = "0px";
  td.style.border = "1px solid #FFFFFF";
  a = document.createElement ("a");
  manaba.addevent
   (td,
    "click",
    function () {
     var target;
     if (gBrowser.isIE) {
      target = window.event.srcElement;
     }
     else {
      target = arguments [0].target;
     }
     if (yearmove) {
      manaba.calendarOnMoveYear (target, 1);
     } else {
      manaba.calendarOnMove (target, 1);
     }
    });
  img = document.createElement ("img");
  img.className = "icon-right";
  if (yearmove) {
   img.src = "/icon-right-d.gif";
  } else {
   img.src = "/icon-right.gif";
  }
  img.alt = "next";
  img.border = 0;
  img.style.verticalAlign = "top";
  a.appendChild (img);
  td.appendChild (a);
  tr.appendChild (td);

  tbody.appendChild (tr);

  if (dayofweek) {
   tr = document.createElement ("tr");
   tr.style.height = "auto";
   var str = [];
   if (dayofweek == 'ja') {
    str = ['日', '月', '火', '水', '木', '金', '土'];
   } else {
    str = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
   }
   for (var i = 0; i < str.length; i++) {
    td = document.createElement ("td");
    td.style.textAlign = "right";
    td.style.padding = "0px";
    td.className = "caldowbox";
      
    span = document.createElement ("span");
    span.innerHTML = str[i];
    if (i == 0) {
     span.className = "calholiday";
    }
    else {
     span.className = "calweekday";
    }
    td.appendChild (span);
    tr.appendChild (td);
   }
   tbody.appendChild (tr);
  }

  for (var i = 0; i < 6; i ++) {
   tr = document.createElement ("tr");
   tr.style.height = "auto";
   for (var j = 0; j < 7; j ++) {
    td = document.createElement ("td");
    td.style.textAlign = "right";
    td.style.padding = "0px";
    td.className = "caldaybox";
    td.border = "1px solid #ffffff";
    manaba.addevent
     (td,
      "click",
      function () {
       var target;
       if (gBrowser.isIE) {
        target = window.event.srcElement;
       }
       else {
        target = arguments [0].target;
       }
       manaba.calendarOnClick (target);
      });
    manaba.addevent
     (td,
      "dblclick",
      function () {
       var target;
       if (gBrowser.isIE) {
        target = window.event.srcElement;
       }
       else {
        target = arguments [0].target;

       }
       manaba.calendarOnDblClick (target);
      });
    manaba.addevent
     (td,
      "mouseover",
      function () {
       var target;
       if (gBrowser.isIE) {
        target = window.event.srcElement;
       }
       else {
         target = arguments [0].target;
       }
       manaba.calendarOnMouseOver (target);
      });
    manaba.addevent
     (td,
      "mouseout",
      function () {
       var target;
       if (gBrowser.isIE) {
        target = window.event.srcElement;
       }
       else {
        target = arguments [0].target;
       }
       manaba.calendarMouseOut (target);
      });
    span = document.createElement ("span");
    if (j == 0) {
     span.className = "calholiday";

    }
    else {
     span.className = "calweekday";
    }
    span.innerHTML = "0";
    td.appendChild (span);
    tr.appendChild (td);
   }
   tbody.appendChild (tr);
  }

  tr = document.createElement ("tr");
  tr.style.height = "auto";
  td = document.createElement ("td");
  td.style.padding = "0px";
  td.style.border = "1px solid #FFFFFF";
  td.colSpan = 7;
  td.align = "center";
  td.appendChild (document.createElement ("hr"));

  if (! dateonly) {
   sel = document.createElement ("select");
   manaba.addevent
    (sel,
     "change",
     function () {
      var target;
      if (gBrowser.isIE) {
       target = window.event.srcElement;
      }
      else {
        target = arguments [0].target;
      }
      manaba.calendarOnSelectHour (target);
     });
   sel.name = "Hour";
   for (var i = 0; i < 24; i ++) {
    var text;
    if (i < 10) {
     text = "0" + i;
    }
    else {
     text = "" + i;
    }
    opt = document.createElement ("option");
    opt.name = "Hour";
    opt.value = i;
    opt.innerHTML = text + "&nbsp;";
    sel.appendChild (opt);
   }
   td.appendChild (sel);
   td.appendChild (document.createTextNode (" : "));
   sel = document.createElement ("select");
   manaba.addevent
    (sel,
     "change",
     function () {
      var target;
      if (gBrowser.isIE) {
       target = window.event.srcElement;
      }
      else {
       target = arguments [0].target;
      }
      manaba.calendarOnSelectMin (target);
     });
   sel.name = "Min";
   var countup = 5;
   if (fulldatetime) {
    countup = 1;
   } else {
    opt = document.createElement ("option");
    opt.name = "Min";
    opt.value = "-1";
    opt.innerHTML = "--&nbsp;";
    sel.appendChild (opt);
   }
   for (var i = 0; i < 60; i += countup) {
    var text;
    if (i < 10) {
     text = "0" + i;
    }
    else {
     text = "" + i;
    }
    opt = document.createElement ("option");
    opt.name = "Min";
    opt.value = i;
    opt.innerHTML = text + "&nbsp;";
    sel.appendChild (opt);
   }
   td.appendChild (sel);

   if (fulldatetime) {
    td.appendChild (document.createTextNode (" : "));
    sel = document.createElement ("select");
    manaba.addevent
     (sel,
      "change",
      function () {
       var target;
       if (gBrowser.isIE) {
        target = window.event.srcElement;
       }
       else {
        target = arguments [0].target;
       }
       manaba.calendarOnSelectSec (target);
      });
    sel.name = "Sec";
    for (var i = 0; i < 60; i += 1) {
     var text;
     if (i < 10) {
      text = "0" + i;
     }
     else {
      text = "" + i;
     }
     opt = document.createElement ("option");
     opt.name = "Sec";
     opt.value = i;
     opt.innerHTML = text + "&nbsp;";
     sel.appendChild (opt);
    }
    td.appendChild (sel);
   }
  }

  input = document.createElement ("input");
  input.type = "hidden";
  input.name = "v_year";
  input.value = year;
  td.appendChild (input);
  input = document.createElement ("input");
  input.type = "hidden";
  input.name = "v_month";
  input.value = month;
  td.appendChild (input);
  input = document.createElement ("input");
  input.type = "hidden";
  input.name = "year";
  input.value = year;
  td.appendChild (input);

  input = document.createElement ("input");
  input.type = "hidden";

  input.name = "month";
  input.value = month;
  td.appendChild (input);
  input = document.createElement ("input");
  input.type = "hidden";
  input.name = "day";
  input.value = day;
  td.appendChild (input);
  input = document.createElement ("input");
  input.type = "hidden";
  input.name = "hour";
  input.value = hour;
  td.appendChild (input);
  input = document.createElement ("input");
  input.type = "hidden";
  input.name = "min";
  input.value = min;
  td.appendChild (input);
  if (fulldatetime) {
   input = document.createElement ("input");
   input.type = "hidden";
   input.name = "sec";
   input.value = sec;
   td.appendChild (input);
  }
  tr.appendChild (td);
  tbody.appendChild (tr);

  tr = document.createElement ("tr");
  tr.style.height = "auto";
  td = document.createElement ("td");
  td.style.padding = "0px";
  td.style.border = "1px solid #FFFFFF";
  td.colSpan = 7;
  td.align = "center";
  input = document.createElement ("input");
  input.type = "button";
  input.value = (gLang == "ja" ? "決定" : "OK");
  manaba.addevent
   (input,
    "click",
    function () {
     InputBlur (inp);
     manaba.calendarToInput ( evtarget(arguments [0]) );
     div.style.display = "none";
     manaba.showSelectMenu ();
     if (manaba.timeLimitAlertMessage) {
      manaba.fireHTMLEvent(inp, "change");
     }
    });
  td.appendChild (input);
  if (closebutton) {
   input = document.createElement ("input");
   input.type = "button";
   input.value = (gLang == "ja" ? "閉じる" : "Close");
   manaba.addevent
    (input,
     "click",
     function () {
      InputBlur (inp);
      div.style.display = "none";
      manaba.showSelectMenu ();
      if (manaba.timeLimitAlertMessage) {
       manaba.fireHTMLEvent(inp, "change");
      }
     });
   td.appendChild (input);
  }
  if (manaba.embeddedCalendarTodayButton) {
   var span = document.createElement ("span");
   span.className = "calendar-thismonth";
   img = document.createElement ("img");
   img.alt = "";
   img.className = "inline";
   img.src = "/icon_mypage_showmore.png";
   span.appendChild(img);
   span.appendChild(document.createTextNode(" "));
   a = document.createElement ("a");
   a.href = "javascript:void(0);";
   a.appendChild(document.createTextNode(gLang == "ja" ? "今月" : "This month"));
   span.appendChild(a);
   manaba.addevent
    (a,
     "click",
     function () {
     var target;
     if (gBrowser.isIE) {
      target = window.event.srcElement;
     } else {
      target = arguments [0].target;
     }
     manaba.calendarOnMoveToday(target);
     });
   td.appendChild (span);
  }
  tr.appendChild (td);
  tbody.appendChild (tr);

  table.appendChild (tbody);

  return(table);
}

// hide select on IE
manaba.hiddenTargets = {};
manaba.showSelectMenu = function () {
 if (!gBrowser.isIE) {
  return;
 }
 var nodes = document.getElementsByTagName ("select");
 for (var i = 0; i < nodes.length; i ++) {

  if ("className" in nodes [i]
      && nodes [i].className == "hiddentarget") {
   if (nodes [i] in manaba.hiddenTargets) {
    manaba.hiddenTargets [nodes [i]] --;
   }
   else {
    manaba.hiddenTargets [nodes [i]] = 0;
   }
  }
 }
 manaba.updateSelectMenu ();
};
manaba.hideSelectMenu = function () {
 if (!gBrowser.isIE) {
  return;
 }
 var nodes = document.getElementsByTagName ("select");
 for (var i = 0; i < nodes.length; i ++) {
  if ("className" in nodes [i]
      && nodes [i].className == "hiddentarget") {
   if (nodes [i] in manaba.hiddenTargets) {
    manaba.hiddenTargets [nodes [i]] ++;
   }
   else {
    manaba.hiddenTargets [nodes [i]] = 1;
   }
  }
 }
 manaba.updateSelectMenu ();
};
manaba.updateSelectMenu = function () {
 var nodes = document.getElementsByTagName ("select");
 for (var node in manaba.hiddenTargets) {
  for (var i = 0; i < nodes.length; i ++) {
   var node2 = node;
   if ("className" in nodes [i]
       && nodes [i].className == "hiddentarget") {
    if (nodes [i] == node) {
     node2 = nodes [i];
    }
   }
  }
  if (manaba.hiddenTargets [node] > 0) {
   node2.style.visibility = "hidden";
  }
  else {
   node2.style.visibility = "visible";
  }
 }
};

// ExpandImage - expand image
try {
 var ua = navigator.userAgent.toLowerCase();
 manaba.isOpera = ua.match('opera') ? true : false;
 // note: window.opera is available only during visualization

 manaba.isOpera7 = function() {
  return manaba.isOpera && typeof document.body.style.opacity == "undefined";
 };
 // note: body.style is available only during visualization
 manaba.isIE6 = function() {
  return document.all && typeof document.body.style.maxHeight == "undefined";
 };
 manaba.isSafari = ua.match('safari');
 manaba.isMacSafari = manaba.noHTMLElement;

 // DisplayImage - display image
 manaba.DisplayImage = function(o) {
  o.style.display = 'block';
  o.parentNode.style.backgroundPosition = '-100px -100px';
 };
} catch(err) {
 manaba.alert("Your browser is not supported: " + err);
}
manaba.ExpandImage = function (o, imgwidth, imgheight, origimgurl) {
 // o: A element that contains IMG element as its first child (thumbnail)
 var imgscr = document.getElementById('imagescreen');
 var height = document.height || document.documentElement.scrollHeight || document.body.scrollHeight;
 var width = document.documentElement.scrollWidth || document.body.scrollWidth;
 var yoffset = document.documentElement.scrollTop || document.body.scrollTop;
 if (! imgscr) {
  var fc = o.firstChild;
  if (fc.tagName != 'IMG') {
   // not IMG, this is not supported
   return true;

  }

  var htmlfragment = "<div id='imagescreen'><div class='imagebackground'><div></div></div><div class='imagefull'><img class='imagedata'><div class=imagecomment>" + (Lang == 'en' ? "Click to close" : "クリックで閉じる") + "</div></div></div>";

  document.body.style.width = null;


  document.body.insertAdjacentHTML("AfterBegin", htmlfragment);
  imgscr = document.getElementById('imagescreen');
 }





 var imgbg = imgscr.firstChild;
 var imgfull = imgbg.nextSibling;
 var imgdata = imgfull.firstChild;
 try {
  imgdata.owidth = imgwidth;
  imgdata.oheight = imgheight;
  if (manaba.wheelzoom) {
   imgdata.scale = 100;
   document.body.onmousewheel = function() {
    var x = document.getElementById('imagescreen');
    if (x) {
     x = x.firstChild.nextSibling.firstChild;
     x.scale += event.wheelDelta / 60;
     if (x.scale < 1) x.scale = 2;
     if (x.scale > 200) x.scale = 200;
     x.style.width = x.scale * x.owidth / 100;
     x.style.height = x.scale * x.oheight / 100;
    }
    return false;
   };
  }
 } catch(err) {
 }
 var clwidth = document.documentElement.clientWidth;
 if (clwidth > width || manaba.isIE6() || manaba.isOpera7()) {
  width = clwidth;
  imgscr.style.width = imgbg.style.width = imgfull.style.width = width + 'px';
 }
 var winheight = document.all ? document.documentElement.clientHeight || document.body.clientHeight : window.innerHeight;
 var winwidth = document.all ? document.documentElement.clientWidth || document.body.clientWidth : window.innerWidth;
 var minheight = height + yoffset;
 if (minheight < winheight) minheight = winheight; 

 imgscr.style.height = imgbg.style.height = minheight + 'px';
 imgfull.style.height = imgheight + 'px';
 imgfull.style.top = yoffset + 'px';
 imgdata.style.width = imgwidth + 'px';


 imgdata.style.height = imgheight + 'px';
 imgfull.style.backgroundPosition =
  (winwidth / 2) + 'px ' + (winheight / 2) + 'px';

 imgbg.onclick = imgfull.onclick = function(e) {
  var imgscr = document.getElementById('imagescreen');
  // hide imagescreen
  imgscr.style.display = 'none';
  // and imgdata
  imgscr.firstChild.nextSibling.firstChild.style.display = 'none';
  if (document.all) { event.cancelBubble = true; } else if (e) { e.stopPropagation(); }
  try {
   document.body.onmousewheel = null;
  } catch(err) {}
  return false;
 };
 imgdata.style.display = 'none';
 imgdata.onload = function() { manaba.DisplayImage(this); };


 var samedata = (imgdata.src == origimgurl);

 if (samedata) {
  imgdata.src = origimgurl;
  if (manaba.isMacSafari || manaba.isOpera || manaba.isSafari && imgdata.complete) {
   manaba.DisplayImage(imgdata);
  }
 } else {
  imgdata.src = origimgurl;
  if (manaba.isOpera7()) manaba.DisplayImage(imgdata);
 }

 imgscr.style.display = 'block';

 return false;
};

// manaba.listman
manaba.listman = new Object;
manaba.listman.up = function (e) {
 while (e) {
  if (e.tagName == 'li') {
   break;
  } else {
   e = e.parentNode;
  }
 }
 if (! e) return;
 var thisli = e;


 e = e.previousSibling;

 while (e) {

  if (e.tagName == 'li') {
   break;
  }
  e = e.previousSibling;
 }
 if (! e) return;
 var targetli = e;

 targetli.insertBefore(thisli.removeNode);
 return true;
};

// AnchorSanitize - sanitize anchor
function AnchorSanitize() {
 var list = getElementsByClass('articlebody', document, 'a');

 for (var i = 0;  i < list.length;  i++) {

alert(list[i].href);
  list[i].href = "link?url=" + list[i].href;
 }
}

// patrol
function PatrolFocus(element) {
 manaba.addClass (element, "patrolfocus");
}
function PatrolBlur(element) {
 manaba.removeClass (element, "patrolfocus");
}

manaba.FixedCheckBoxes = new Object;
function FixCheckBoxesById(id, value,save) {
 var e = document.getElementById(id);
 if (e) return FixCheckBoxes(e, value,save);
 return false; 
}
// FixCheckBoxes - fix checkboxes included in the element
function FixCheckBoxes(e, value, save) {
 for (var o = e.firstChild;  o;  o = o.nextSibling) {
  if (o.firstChild) FixCheckBoxes(o, value,save);
  if (o.tagName == 'INPUT' && o.type == 'checkbox') {
   if (save) {
    if (!manaba.FixedCheckBoxes[o.name]) manaba.FixedCheckBoxes[o.name] = new Object;
    manaba.FixedCheckBoxes[o.name][o.value] = o.checked;
   }
   o.checked = value;
  }
 }
 return false;
}
function RestoreCheckBoxesById(id) {
 var e = document.getElementById(id);
 if (e) return RestoreCheckBoxes(e);
 return false; 
}
// RestoreCheckBoxes - restore checkboxes included in the element
function RestoreCheckBoxes(e) {
 for (var o = e.firstChild;  o;  o = o.nextSibling) {
  if (o.firstChild) RestoreCheckBoxes(o);
  if (o.tagName == 'INPUT' && o.type == 'checkbox' && manaba.FixedCheckBoxes[o.name] && manaba.FixedCheckBoxes[o.name][o.value] != null) {
   o.checked = manaba.FixedCheckBoxes[o.name][o.value];
  }
 }
 return false;
}

// ReloadPage - reload page
function ReloadPage() {
 location.reload();
}

// diff button
manaba.showDiff = function (show) {
 var diffbox = document.getElementById ("diffbox");
 var newbox = document.getElementById ("newbox");
 var currentbox = document.getElementById ("currentbox");
 
 var textarea_n = null;
 var nodes = newbox.getElementsByTagName ("textarea");
 if (nodes.length > 0) {
  textarea_n = nodes [0];
 }
 var textarea_c = null;
 var nodes = currentbox.getElementsByTagName ("textarea");
 if (nodes.length > 0) {
  textarea_c = nodes [0];
 }
 var diffframe = document.getElementById ("diffframe");
 if (diffframe && textarea_n && textarea_n.offsetHeight) {
  diffframe.style.height = textarea_n.offsetHeight + "px";
 }
 if (diffframe && textarea_c && textarea_c.offsetHeight) {
  diffframe.style.height = textarea_c.offsetHeight + "px";
 }
 var currenttextarea = document.getElementById ("currenttextarea");
 if (currenttextarea && textarea_n) {
  currenttextarea.rows = textarea_n.rows;
 }
 if (show) {
  diffbox.style.display = "block";
  newbox.style.display = "none";
 }
}

manaba.onDiffButtonClick = function () {
 var diffbox = document.getElementById ("diffbox");
 var newbox= document.getElementById ("newbox");
 var currentbox= document.getElementById ("currentbox");
 
 diffbox.style.display = "block";
 newbox.style.display = "none";
 currentbox.style.display = "none";
};
manaba.onCurrentButtonClick = function () {
 var diffbox = document.getElementById ("diffbox");
 var newbox= document.getElementById ("newbox");
 var currentbox= document.getElementById ("currentbox");
 
 diffbox .style.display = "none";
 newbox .style.display = "none";
 currentbox.style.display = "block";
};
manaba.onNewButtonClick = function () {
 var diffbox = document.getElementById ("diffbox");
 var newbox= document.getElementById ("newbox");
 var currentbox= document.getElementById ("currentbox");
 
 diffbox .style.display = "none";
 newbox .style.display = "block";
 currentbox.style.display = "none";
};
manaba.compareRCSRevision = function (a, b) {
 if (a.match (/([0-9]+)\.([0-9]+)/)) {
  var a_rel = parseInt (RegExp.$1, 10);
  var a_ver = parseInt (RegExp.$2, 10);

  if (b.match (/([0-9]+)\.([0-9]+)/)) {
   var b_rel = parseInt (RegExp.$1, 10);
   var b_ver = parseInt (RegExp.$2, 10);

   if (a_rel < b_rel) {
    return -1;
   }
   else if (a_rel > b_rel) {
    return 1;
   }
   else {
    if (a_ver < b_ver) {
     return -1;
    }
    else if (a_ver > b_ver) {
     return 1;
    }
    else {
     return 0;
    }
   }
  }
 }
};
manaba.changeRevisionPopup = null;
manaba.changeRevision = function (head_rev, new_rev, old_rev, filename, directory) {
 if (manaba.changeRevisionPopup) {
  manaba.changeRevisionPopup.parentNode.removeChild
   (manaba.changeRevisionPopup);
  manaba.changeRevisionPopup = null;
 }
 
 var node = document.getElementById ("compare_label");
 var width = 320;
 var height = 48;
 
 if (new_rev == '') {
  new_rev = head_rev;
 }
 
 var popup = document.createElement ("div");
 popup.style.position = "absolute";
 popup.style.left = (node.offsetWidth - width) / 2 + "px";
 popup.style.top = node.offsetHeight + "px";
 popup.style.border = "2px solid #c0c0c0";
 popup.style.backgroundColor = "#ffffff";
 popup.style.width = width + "px";
 popup.style.height = height + "px";
 popup.style.textAlign = "center";
 
 var move = function (text, next, prev, rel, ver) {
  return function () {
   if (text.value.match (/([0-9]+)\.([0-9]+)/)) {
    var text_rel = parseInt (RegExp.$1, 10);
    var text_ver = parseInt (RegExp.$2, 10);
    
    text_rel += rel;
    text_ver += ver;
    if (text_rel == 0) {
     text_rel = 1;
    }
    if (text_ver == 0) {
     text_ver = 1;
    }
    
    text.value = text_rel + "." + text_ver;
   }
   else {
    text.value = '1.1';
   }
   
   if (manaba.compareRCSRevision (head_rev, text.value) <= 0) {
    text.value = head_rev;
    next.disabled = true;
   }
   else {
    next.disabled = false;
   }
   if (manaba.compareRCSRevision ("1.1", text.value) >= 0) {
    text.value = "1.1";
    prev.disabled = true;
   }
   else {
    prev.disabled = false;
   }
  };
 };
 
 var next, text, prev;
 var old_text, new_text;
 
 prev = document.createElement ("input");
 prev.type = "button";
 prev.value = "<";
 popup.appendChild (prev);
 text = document.createElement ("input");
 text.type = "text";
 text.size = "4";
 text.value = old_rev;
 popup.appendChild (text);
 next = document.createElement ("input");
 next.type = "button";
 next.value = ">";
 popup.appendChild (next);
 
 old_text = text;
 move (text, next, prev, 0, 0)();
 manaba.addevent
  (next, "click", move (text, next, prev, 0, 1));
 manaba.addevent
  (prev, "click", move (text, next, prev, 0, -1));
 
 popup.appendChild (document.createTextNode (" - "));
 
 prev = document.createElement ("input");
 prev.type = "button";
 prev.value = "<";
 popup.appendChild (prev);
 text = document.createElement ("input");
 text.type = "text";
 text.size = "4";
 text.value = new_rev;
 popup.appendChild (text);
 next = document.createElement ("input");
 next.type = "button";
 next.value = ">";
 popup.appendChild (next);
 
 new_text = text;
 move (text, next, prev, 0, 0)();
 manaba.addevent
  (next, "click", move (text, next, prev, 0, 1));
 manaba.addevent
  (prev, "click", move (text, next, prev, 0, -1));
 
 var moveFunc = (function (new_text, old_text) {
  return function () {
   var href = "admin_tempedit?action=diffrev&filename=" + filename + "&directory=" + directory + "&rev=" + old_text.value + "&new_rev=" + new_text.value;
   
   var node;
   node = document.getElementById ("currentbutton");
   if (node && node.checked) {
    href += "&showcurrentbox=1"
   }
   else {
    node = document.getElementById ("diffbutton");
    if (node && node.checked) {
     href += "&showdiffbox=1"
    }
    else {
     node = document.getElementById ("newbutton");
     if (node && node.checked) {
      href += "&shownewbox=1"
     }
     else {
     }
    }
   }
   
   document.location.href = href;
   
   manaba.changeRevisionPopup.parentNode.removeChild
    (manaba.changeRevisionPopup);
   manaba.changeRevisionPopup = null;
  };
 })(new_text, old_text);
 
 manaba.addevent (new_text, "keypress",
  function (event) {
   if (!event) {
    event = window.event;
   }
   if (event.keyCode == 13) {
    moveFunc ();
   }
  });
 manaba.addevent (old_text, "keypress",
  function (event) {
   if (!event) {
    event = window.event;
   }
   if (event.keyCode == 13) {
    moveFunc ();
   }
  });
 
 var br = document.createElement ("br");
 popup.appendChild (br);
 var move = document.createElement ("input");
 move.type = "button";
 move.value = "移動";
 popup.appendChild (move);
 manaba.addevent (move, "click", moveFunc);
 
 popup.appendChild (document.createTextNode (" "));
 var close = document.createElement ("input");
 close.type = "button";
 close.value = "閉じる";
 popup.appendChild (close);
 manaba.addevent
  (close, "click",
   function () {
    manaba.changeRevisionPopup.parentNode.removeChild
     (manaba.changeRevisionPopup);
    manaba.changeRevisionPopup = null;
   });
 
 node.appendChild (popup);
 
 manaba.changeRevisionPopup = popup;
};

/* ページバインダ */
manaba.openInSidePage = function (o) {
 try {
  if (window.name == "left_frame" || window.name == "right_frame") {
   var parentDocument = window.parent.document;
   var targetFrame;
   if (window.name == "left_frame") {
    targetFrame = parentDocument.getElementById ("right_frame");
   }
   else if (window.name == "right_frame") {
    targetFrame = parentDocument.getElementById ("left_frame");
   }
   targetFrame.contentWindow.document.location.href = o.href;
   return false;
  }
 }
 catch (e) {
 }
 return true;
};
manaba.deletePageBindingItem = function (oid, targetDocument) {
 var item = targetDocument.getElementById ("pagebinding" + oid);
 if (item == null) {
  return;
 }
 item.parentNode.removeChild (item);
 
 var pagebinding = targetDocument.getElementById ("pagebinding");
 if (pagebinding == null) {
  return;
 }
 var pagebindinglist = targetDocument.getElementById ("pagebindinglist");
 if (pagebindinglist == null) {
  return;
 }
 
 var nodes = pagebindinglist.getElementsByTagName ("li");
 if (nodes.length == 1) {
  pagebinding.style.display = "none";
 }
};
manaba.deletePageBinding = function (oid, targetDocument) {
 if (!confirm ("バインドを削除します")) {
  return;
 }
 var request = CreateXMLHttpRequest ();
 request.onreadystatechange = function () {
  if (request.readyState == 4
      && request.status == 200) {
   if (request.responseText.indexOf ("ok") != -1) {
    manaba.deletePageBindingItem (oid, targetDocument);
    
    var targetWindow = targetDocument.defaultView;
    try {
     if (targetWindow.name == "left_frame"
         || targetWindow.name == "right_frame") {
      var parentDocument = targetWindow.parent.document;
      var targetFrame;
      if (targetWindow.name == "left_frame") {
       targetFrame = parentDocument.getElementById ("right_frame");
      }
      else if (targetWindow.name == "right_frame") {
       targetFrame = parentDocument.getElementById ("left_frame");
      }
      targetDocument = targetFrame.contentWindow.document;
      manaba.deletePageBindingItem (oid, targetDocument);
     }
    }
    catch (e) {
    }
   }
  }
 };
 request.open ('GET', 'pagebinder_delete?oid=' + oid, true); 
 request.send (null);
};
manaba.pageBindingLocationUpdater = function (name) {
  return function () {
   var targetLocation = document.getElementById (name + "_location");
   var targetOID = document.getElementById (name + "_oid");
   var targetURI = document.getElementById (name + "_uri");
   var parentDocument = window.parent.document;
   var targetFrame = parentDocument.getElementById (name + "_frame");
   try {
    targetLocation.value = targetFrame.contentWindow.document.location.href;
    targetOID.value = targetFrame.contentWindow.manaba.defaultBindingOID;
    targetURI.value = targetFrame.contentWindow.manaba.webatURI;
    try {
     var form = targetFrame.contentWindow.document.getElementById ("pagebinder_form");
     if (form) {
      form.style.display = "none";
     }
    }
    catch (e) {
    }
   }
   catch (e) {
    targetLocation.value = "----";
    targetOID.value = "";
    targetURI.value = "";
   }
  };
};
manaba.updateBindingList = function (bindid, name, uri, id, type, desc) {
  try {
   var parentDocument = window.parent.document;
   var targetFrame = parentDocument.getElementById (id + "_frame");
   var targetDocument = targetFrame.contentWindow.document;
   
   var pagebinding = targetDocument.getElementById ("pagebinding");
   if (pagebinding == null) {
    return;
   }
   var pagebindinglist = targetDocument.getElementById ("pagebindinglist");
   if (pagebindinglist == null) {
    return;
   }
   
   pagebinding.style.display = "block";
   
   var item = targetDocument.getElementById ("pagebinding" + bindid);

   var tmpl = targetDocument.getElementById ("pagebinding_template");
   if (tmpl == null) {
    return;
   }
   
   var newItem = tmpl.cloneNode (true);
   newItem.id = "pagebinding" + bindid;
   
   if (item) {
     item.parentNode.replaceChild (newItem, item);
   }
   else {
     tmpl.parentNode.appendChild (newItem);
   }
   
   var i, nodes;
   nodes = newItem.getElementsByTagName ("a");
   for (i = 0; i < nodes.length; i ++) {
    if ("className" in nodes [i]
        && nodes [i].className == "pagebinding_link") {
     nodes [i].href = uri;
     nodes [i].innerHTML = name;
    }
   }
   nodes = newItem.getElementsByTagName ("div");
   for (i = 0; i < nodes.length; i ++) {
    if ("className" in nodes [i]
        && nodes [i].className == "pagebinding_desc") {
     if (desc) {
      nodes [i].style.display = "block";
     }
     nodes [i].innerHTML = desc;
    }
   }
   nodes = newItem.getElementsByTagName ("img");
   for (i = 0; i < nodes.length; i ++) {
    if ("className" in nodes [i]
        && nodes [i].className == "pagebinding_delete") {
     manaba.addevent (nodes [i], "click",
      (function (id, targetDocument) {
        return function () {
         manaba.deletePageBinding (id, targetDocument);
        };
       })(bindid, newItem.ownerDocument));
    }
   }
   
   newItem.style.display = "list-item";
 }
 catch (e) {
 }
};

manaba.stopEvent = function (event) {
 if (gBrowser.isIE) {
  try { event.returnValue = false; event.cancelBubble = true; }
  catch (e) {}
 }
 try { event.preventDefault (); } catch (e) {}
 try { event.stopPropagation (); } catch (e) {}
};

/* ==== アップローダー ==== */
manaba.json = new Object ();
manaba.json.parse = (function () {
  var at;     // The index of the current character
  var ch;     // The current character
  var escapee = {
   "\"":  "\"",
   "\\": "\\",
   "/":  "/",
   b:    "\b",
   f:    "\f",
   n:    "\n",
   r:    "\r",
   t:    "\t"
  };
  var text;

  var error = function (m) {
   throw {
    name:    "SyntaxError",
    message: m,
    at:      at,
    text:    text
   };
  };
  
  var next = function (c) {
   if (c && c !== ch) {
    error ("Expected \"" + c + "\" instead of \"" + ch + "\"");
   }

   ch = text.charAt (at);
   at += 1;
   return ch;
  };

  var number = function () {
   var number, string = "";
   
   if (ch === "-") {
    string = "-";
    next ("-");
   }
   while (ch >= "0" && ch <= "9") {
    string += ch;
    next ();
   }
   if (ch === ".") {
    string += ".";
    while (next () && ch >= "0" && ch <= "9") {
     string += ch;
    }
   }
   if (ch === "e" || ch === "E") {
    string += ch;
    next ();
    if (ch === "-" || ch === "+") {
     string += ch;
     next ();
    }
    while (ch >= "0" && ch <= "9") {
     string += ch;
     next ();
    }
   }
   number = +string;
   if (isNaN (number)) {
    error ("Bad number");
   }
   else {
    return number;
   }
   return null;
  };

  var string = function () {
   var hex, i, string = "", uffff;
   
   if (ch === "\"") {
    while (next ()) {
     if (ch === "\"") {
      next ();
      return string;
     }
     else if (ch === "\\") {
      next ();
      if (ch === "u") {
       uffff = 0;
       for (i = 0; i < 4; i += 1) {
        hex = parseInt (next (), 16);
        if (!isFinite (hex)) {
         break;
        }
        uffff = uffff * 16 + hex;
       }
       string += String.fromCharCode (uffff);
      }
      else if (typeof escapee [ch] === "string") {
       string += escapee [ch];
      }
      else {
       break;
      }
     }
     else {
      string += ch;
     }
    }
   }
   error ("Bad string");
   return null;
  };

  var white = function () {
   while (ch && ch <= " ") {
    next ();
   }
  };

  var word = function () {
   switch (ch) {
    case "t":
    next ("t");
    next ("r");
    next ("u");
    next ("e");
    return true;
    case "f":
    next ("f");
    next ("a");
    next ("l");
    next ("s");
    next ("e");
    return false;
    case "n":
    next ("n");
    next ("u");
    next ("l");
    next ("l");
    return null;
   }
   error ("Unexpected \"" + ch + "\"");
   return null;
  };

  var value; // Place holder for the value function.

  var array = function () {
   var array = [];

   if (ch === "[") {
    next ("[");
    white ();
    if (ch === "]") {
     next ("]");
     return array;   // empty array
    }
    while (ch) {
     array.push (value ());
     white ();
     if (ch === "]") {
      next ("]");
      return array;
     }
     next (",");
     white();
    }
   }
   error ("Bad array");
   return null;
  };

  var object = function () {
   var key, object = {};

   if (ch === "{") {
    next ("{");
    white ();
    if (ch === "}") {
     next ("}");
     return object;   // empty object
    }
    while (ch) {
     key = string ();
     white ();
     next (":");
     if (Object.hasOwnProperty.call (object, key)) {
      error ("Duplicate key \"" + key + "\"");
     }
     object [key] = value ();
     white ();
     if (ch === "}") {
      next ("}");
      return object;
     }
     next (",");
     white ();
    }
   }
   error ("Bad object");
   return null;
  };
  
  value = function () {
   white ();
   switch (ch) {
    case "{":
     return object ();
    case "[":
     return array ();
    case "\"":
     return string ();
    case "-":
     return number ();
    default:
     return ch >= "0" && ch <= "9" ? number () : word ();
   }
  };
  
  return function (source) {
   var result;
   
   if (manaba.usejsonparse == '1' && typeof(JSON) !== 'undefined' && JSON.parse) {
    try {
     result = JSON.parse(source);
    } catch (e) {
     throw {
      name:    e.name
     ,message: e.message
     ,at:      -1
     ,text:    ''
     };
    }
    return result;
   }
   text = source;
   at = 0;
   ch = " ";
   result = value ();
   white ();
   if (ch) {
    error ("Syntax error");
   }
   
   return result;
  };
 }());

manaba.ProgressiveFileUploader
= function (param) {
 if (!param) {
  return;
 }
 this.id = ("id" in param) ? (param.id) : null;
 this.image = ("imageURL" in param) ? (param.imageURL) : "";
 this.imageWidth = ("imageWidth" in param) ? (param.imageWidth) : 16;
 this.imageHeight = ("imageHeight" in param) ? (param.imageHeight) : 16;
 this.width = ("progressWidth" in param) ? (param.progressWidth) : 200;
 this.action = ("actionURL" in param) ? (param.actionURL) : "";
 this.callback = ("callback" in param) ? (param.callback) : null;
 this.onChoose = ("onChoose" in param) ? (param.onChoose) : null;
 this.multiple = ("multiple" in param) ? (param.multiple) : false;
 this.hasComment = ("hasComment" in param) ? (param.hasComment) : false;
 this.commentName = ("commentName" in param) ? (param.commentName) : "";
 this.no_form = ("hasNoForm" in param) ? (param.hasNoForm) : false;
 this.file_name = ("fileFieldName" in param) ? (param.fileFieldName) : "";
 this.submit_id = ("submitID" in param) ? (param.submitID) : "";
 this.form_params = ("formParams" in param) ? (param.formParams) : {};
 this.maxSize = ("maxSize" in param) ? (param.maxSize) : -1;
 this.maxCount = ("maxCount" in param) ? (param.maxCount) : -1;
 this.currentCount = ("currentCount" in param) ? (param.currentCount) : 0;
 this.filter = ("filter" in param) ? (param.filter) : null;
 this.outerForm = ("outerForm" in param) ? (param.outerForm) : null;
 
 this.files = new Array ();
 
 this.init ();
};
manaba.ProgressiveFileUploader.prototype = {
 id : "",
 imageURL : "",
 imageWidth : 0,
 imageHeight : 0,
 progressWidth : 0,
 actionURL : "",
 name : "",
 params : {},
 callback : null,
 onChoose : null,
 multiple : false,
 hasComment : false,
 commentName : "",
 
 maxSize : 0,
 maxCount : 0,
 currentCount : 0,
 count : 0,
 
 sent : false,
 
 files : null,
 
 filebox : null,
 originalSubmitButton : null,
 submitButton : null,
 
 obj : null,
 objNode : null,
 
 box : null,
 filePropBox : null,
 filePropBoxBody : null,
 
 progressBox : null,
 br : null,
 progressBarFrame : null,
 progressBarBack : null,
 progressBar : null,
 
 maxIndex : 0,
 
 startTime : -1,
 
 init : function () {
  var node;
  
  if (this.no_form) {
   this.filebox = document.getElementById (this.id);
   this.name = this.file_name;
   this.params = this.form_params;
   this.params ["UseProgressiveFileUploader"] = "1";
   this.originalSubmitButton = document.getElementById (this.submit_id);
  }
  else {
   this.filebox = document.getElementById (this.id);
   this.name = this.filebox.name;
   this.params = {};
   for (var i = 0; i < this.filebox.form.elements.length; i ++) {
    node = this.filebox.form.elements [i];
    if (node == this.filebox) {
     continue;
    }
    if (node.type == "submit") {
     this.originalSubmitButton = node;
    }
    this.params [node.name] = node;
   }
   this.params ["UseProgressiveFileUploader"] = "1";
  }
  
  if (!this.originalSubmitButton) {
   return;
  }
  
  this.box = document.createElement ("span");
  this.filebox.parentNode.insertBefore (this.box, this.filebox);
  
  this.obj
  = new manaba.deconcept.SWFObject
  ("/ProgressiveFileUploader.swf",
   this.id + "_obj", this.imageWidth, this.imageHeight, "8.0.0");
  if (!this.obj.write (this.box)) {
   this.box.parentNode.removeChild (this.box);
   return;
  }
  this.objNode = document.getElementById (this.id + "_obj");
  this.filePropBox = document.createElement ("div");
  this.filePropBox.className = "AttachmentFileBox";
  this.filePropBox.style.display = "none";
  this.filebox.parentNode.insertBefore (this.filePropBox, this.filebox);
  this.filebox.parentNode.removeChild (this.filebox);
  
  node = this.filePropBox.nextSibling;
  while (node
         && (node.nodeName.toLowerCase () == "#comment"
             || (node.nodeName.toLowerCase () == "#text"
                 && node.nodeValue.replace (/[ \t\r\n]+/, "") == ""))) {
   node = node.nextSibling;
  }
  if (node && node.nodeName.toLowerCase () == "br") {
   node.style.display = "none";
  }
  
  var table = document.createElement ("table");
  table.width = 480;
  table.className = "list";
  this.filePropBox.appendChild (table);
  this.filePropBoxBody = document.createElement ("tbody");
  table.appendChild (this.filePropBoxBody);
  var tr = document.createElement ("tr");
  var th = document.createElement ("th");
  th.colSpan = 2;
  th.className = "top";
  this.setText (th, (gLang == "ja"
                     ? ("アップロードするファイル")
                     : ("File(s) to upload")));
  this.filePropBoxBody.appendChild (tr);
  tr.appendChild (th);
  
  var br = document.createElement ("br");
  node = this.box.nextSibling;
  while (node
         && (node.nodeName.toLowerCase () == "#comment"
             || (node.nodeName.toLowerCase () == "#text"
                 && node.nodeValue.replace (/[ \t\r\n]+/, "") == ""))) {
   node = node.nextSibling;
  }
  if (node && node.nodeName.toLowerCase () != "br") {
   this.box.parentNode.insertBefore (br, node);
  }
  this.submitButton = document.createElement ("input");
  this.submitButton.type = "button";
  this.submitButton.name = this.originalSubmitButton.name || "";
  this.submitButton.value = this.originalSubmitButton.value || this.originalSubmitButton.innerHTML;
  if (gBrowser.isIE) {
   this.submitButton.style.styleFloat = "left";
  }
  else {
   this.submitButton.style.cssFloat = "left";
  }
  manaba.addevent
  (this.submitButton, "click",
   (function (self) {
    return function () {
     self.upload ();
    };
   })(this));
  
  this.originalSubmitButton.parentNode.insertBefore
  (this.submitButton, this.originalSubmitButton);
  
  this.progressBox = document.createElement ("div");
  this.progressBox.style.position = "relative";
  if (gBrowser.isIE) {
   this.progressBox.style.styleFloat = "left";
  }
  else {
   this.progressBox.style.cssFloat = "left";
  }
  this.progressBox.style.width = this.width + "px";
  this.progressBox.style.height = "24px";
  this.progressBox.style.backgroundColor = "white";
  this.originalSubmitButton.parentNode.insertBefore
  (this.progressBox, this.originalSubmitButton);
  
  this.progressBarFrame = document.createElement ("div");
  this.progressBarFrame.style.position = "absolute";
  this.progressBarFrame.style.left = "7px";
  this.progressBarFrame.style.top = "7px";
  this.progressBarFrame.style.width = (this.width - 18) + "px";
  this.progressBarFrame.style.height = "10px";
  this.progressBarFrame.style.background = "black";
  this.progressBarFrame.style.zIndex = "10";
  this.progressBox.appendChild (this.progressBarFrame);
  
  this.progressBarBack = document.createElement ("div");
  this.progressBarBack.style.position = "absolute";
  this.progressBarBack.style.left = "8px";
  this.progressBarBack.style.top = "8px";
  this.progressBarBack.style.width = (this.width - 20) + "px";
  this.progressBarBack.style.height = "8px";
  this.progressBarBack.style.backgroundColor = "white";
  this.progressBarBack.style.zIndex = "11";
  this.progressBox.appendChild (this.progressBarBack);
  
  this.progressBar = document.createElement ("div");
  this.progressBar.style.position = "absolute";
  this.progressBar.style.left = "8px";
  this.progressBar.style.top = "8px";
  this.progressBar.style.width = "0px";
  this.progressBar.style.height = "8px";
  this.progressBar.style.backgroundColor = "blue";
  this.progressBar.style.zIndex = "12";
  this.progressBox.appendChild (this.progressBar);
  
  this.statusField = document.createElement ("span");
  this.statusField.style.whiteSpace = "nowrap";
  this.originalSubmitButton.parentNode.insertBefore
  (this.statusField, this.originalSubmitButton);
  
  this.br = document.createElement ("br");
  this.br.style.clear = "left";
  this.originalSubmitButton.parentNode.insertBefore
  (this.br, this.originalSubmitButton);
  
  this.originalSubmitButton.parentNode.removeChild (this.originalSubmitButton);
  
  setTimeout
  ((function (self) {
    return function () {
     self.wait ();
    };
   })(this), 100);
 },
 
 reset : function () {
  this.objNode.reset ();
    
  this.setStatus ("");
  
  this.filePropBox.style.display = "none";
  while (this.filePropBoxBody.firstChild.nextSibling) {
   this.filePropBoxBody.removeChild
    (this.filePropBoxBody.firstChild.nextSibling);
  }
  this.progressBar.style.width = "0px";
  
  this.files = new Array ();
 },
 
 setText : function (node, text) {
  while (node.firstChild) {
   node.removeChild (node.firstChild);
  }
  node.appendChild (document.createTextNode (text));
 },
 
 addText : function (node, text) {
  node.appendChild (document.createTextNode (text));
 },
 
 setStatus : function (status) {
  this.setText (this.statusField, status);
 },
 
 readable : function (size) {
  if (size % (1024 * 1024) == 0) {
   return (size / (1024 * 1024)) + "MB";
  }
  if (size % (1024) == 0) {
   return (size / (1024)) + "kB";
  }
  return size + "B";
 },
 
 uploadFileHandler : function (index, name, size, ctime, mtime) {
  if (index == -1) {
   while (this.filePropBoxBody.firstChild.nextSibling) {
    this.filePropBoxBody.removeChild
    (this.filePropBoxBody.firstChild.nextSibling);
   }
   this.filePropBox.style.display = "";
    
   this.files = new Array ();
   this.submitButton.disabled = false;
   this.count = 0;
   return;
  }
  else if (index == -2) {
   if (this.onChoose) {
    this.onChoose ();
   }
    
   return;
  }
   
  this.maxIndex = index;
   
  var tr, td, em;
  
  if (this.maxCount != -1) {
   this.count ++;
   if (this.count + this.currentCount > this.maxCount + 1) {
    return;
   }
   else if (this.count + this.currentCount == this.maxCount + 1) {
    this.submitButton.disabled = true;
    
    tr = document.createElement ("tr");
    tr.height = 48;
    tr.onmouseover = "hilite(this)";
    tr.onmouseout = "unhilite(this)";
    td = document.createElement ("td");
    td.colSpan = 2;
    tr.appendChild (td);
    em = document.createElement ("em");
    em.style.color = "red";
    em.style.fontStyle = "normal";
    td.appendChild (em);
    this.setText
     (em,
      (gLang == "ja"
       ? ("ファイルは同時に " + this.maxCount + " 個しかアップロードできません")
       : ("You can upload ad most " + this.maxCount + " files at once.")));
    this.filePropBoxBody.appendChild (tr);
    
    return;
   }
  }
  
  tr = document.createElement ("tr");
  tr.setAttribute ("height", 48);
  tr.setAttribute ("onmouseover", "hilite(this)");
  tr.setAttribute ("onmouseout", "unhilite(this)");
  td = document.createElement ("td");
  td.width = 48;
  var img = document.createElement ("img");
  img.src = "/icon-file.gif";
  img.border = "0";
  td.appendChild (img);
  tr.appendChild (td);
  td = document.createElement ("td");
  td.className = "uploadstatus-a";
  tr.appendChild (td);
  
  var div;
  div = document.createElement ("div");
  div.className = "uploadfilename";
  this.setText (div, name);
  td.appendChild (div);
  
  div = document.createElement ("div");
  div.className = "uploadsize";
  this.setText (div, size
                + (gLang == "ja"
                   ? (" バイト")
                   : (" bytes")));
  td.appendChild (div);
  if (this.maxSize != -1
      && size > this.maxSize) {
   div = document.createElement ("div");
   div.style.clear = "left";
   em = document.createElement ("em");
   em.style.color = "red";
   em.style.fontStyle = "normal";
   div.appendChild (em);
   this.setText
    (em,
     (gLang == "ja"
      ? ("アップロードできるのは " + this.readable (this.maxSize) + " までです")
      : ("Due to upload limit (" + this.readable (this.maxSize) + "), file was not uploaded.")));
   this.submitButton.disabled = true;
   td.appendChild (div);
  }
   
  if (this.hasComment) {
   div = document.createElement ("div");
   div.className = "uploadcomment";
   var input = document.createElement ("input");
   input.type = "text";
   input.className = "editable";
   input.id = this.id + "_commentbox_" + index;
   input.onfocus = "InputFocus(this)";
   input.onblur = "InputBlur(this)";
   div.appendChild (input);
   td.appendChild (div);
   
   manaba.addevent
   (input, "keypress",
    (function (self) {
     return function (event) {
      if (gBrowser.isIE) {
       event = window.event;
      }
      if (event.keyCode == 13) {
       self.upload ();
       manaba.stopEvent (event);
      }
     };
    })(this));
  }
  this.filePropBoxBody.appendChild (tr);
  
  var f = {
   name: name,
   size: size,
   ctime: ctime,
   mtime: mtime
  }
  this.files.push (f);
 },
 
 uploadProgressHandler : function (type, current, total) {
  if (!this.sent && type == 1) {
   this.progressBar.style.width
   = Math.floor ((this.width - 20) * current / total) + "px";
   var now = (new Date ()).getTime ();
   var t = (now - this.startTime) * total / current + this.startTime - now;
   var s = (gLang == "ja"
            ? ("残り " + Math.ceil (t / 1000) + " 秒")
            : (Math.ceil (t / 1000) + " seconds remaining"))
   this.setStatus (s);
   
   if (current == total && !this.sent) {
    this.sent = true;

    this.setStatus ((gLang == "ja"
                     ? ("送信完了, 応答を待っています")
                     : ("Complete. Now processing.")));
   }
  }
  else if (type == 0) {
   this.startTime = (new Date ()).getTime ();
   this.submitButton.disabled = true;
  }
  else if (type == 2) {
   if (!this.sent) {
    this.sent = true;
    this.setStatus ((gLang == "ja"
                     ? ("送信完了, 応答を待っています")
                     : ("Complete. Now processing.")));
   }
  }
  else if (type == 3) {
   this.submitButton.disabled = false;
   
   if (this.callback) {
    this.callback (this, current);
   }
  }
  else if (type == 5) {
   this.files [total].response = current;
  }
  else if (type == -1) {
   this.submitButton.disabled = false;
   
   this.setStatus ((gLang == "ja"
                    ? ("アップロードに失敗しました")
                    : ("Upload failed")));
  }
  else if (type == -2) {
   this.submitButton.disabled = false;
   
   this.setStatus ((gLang == "ja"
                    ? ("ファイルを選んでください")
                    : ("Please choose file(s)")));
  }
 },
 
 wait : function () {
  if (this.objNode.setProgressHandler) {
   window ["manaba_ProgressiveFileUploader_" + this.id] = this;
   
   this.objNode.setProgressHandler
   ("window.manaba_ProgressiveFileUploader_" + this.id
    + ".uploadProgressHandler");
   this.objNode.setFileHandler
   ("window.manaba_ProgressiveFileUploader_" + this.id
    + ".uploadFileHandler");
   this.objNode.setAction (this.action);
   this.objNode.setImage (this.image, this.imageWidth, this.imageHeight);
   if (this.multiple) {
    this.objNode.enableMulti (true);
   }
   if (this.filter) {
    for (var i = 0; i < this.filter.length; i ++) {
     this.objNode.addFilter (this.filter [i][0], this.filter [i][1]);
    }
   }
    
   if (this.outerForm) {
    manaba.addevent
    (this.outerForm, "submit",
     (function (self) {
      return function (event) {
       if (gBrowser.isIE) {
        event = window.event;
       }
       if (self.files
           && self.files.length > 0) {
        if (!confirm ((gLang == "ja"
                       ? "まだアップロードしていないファイルがあります。これらを無視して送信しますか?"
                       : "Some files are not uploaded yet. Are you sure to submit?"))) {
         manaba.stopEvent (event);
        }
       }
      };
     })(this));
   }
  }
  else {
   setTimeout
   ((function (self) {
     return function () {
      self.wait ();
     };
    })(this), 100);
  }
 },
 
 upload : function () {
  if (!this.objNode.addParam) {
   return;
  } 
  
  var s = "";
  for (var n in this.params) {
   if (typeof (this.params [n]) == "string") {
    s += n + "=" + this.params [n] + "\n";
    this.objNode.addParam (n, this.params [n]);
   }
   else {
    s += n + "=" + this.params [n].value + "\n";
    this.objNode.addParam (n, this.params [n].value);
   }
  }
  
  if (this.hasComment) {
   this.objNode.enableComment (this.commentName);
   for (var i = 0; i <= this.maxIndex; i ++) {
    var input = document.getElementById (this.id + "_commentbox_" + i);
    if (input) {
     var comment = input.value;
     if (!comment) {
      comment = "";
     }
     this.objNode.setComment (i, comment);
    }
   }
  }
  
  this.startTime = -1;
  this.sent = false;
  this.objNode.upload (this.name);
 }
};

/**
 * SWFObject v1.4.4: Flash Player detection and embed - http://blog.deconcept.com/swfobject/
 *
 * SWFObject is (c) 2006 Geoff Stearns and is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * **SWFObject is the SWF embed script formerly known as FlashObject. The name was changed for
 *   legal reasons.
 */

manaba.deconcept = new Object ();
manaba.deconcept.util = new Object ();
manaba.deconcept.SWFObjectUtil = new Object ();

manaba.deconcept.SWFObject = function (_1,id,w,h,_5,c,_7,_8,_9,_a,_b) {
 if(!document.getElementById){return;}
 this.DETECT_KEY=_b?_b:"detectflash";
 this.skipDetect=manaba.deconcept.util.getRequestParameter(this.DETECT_KEY);
 this.params=new Object();
 this.variables=new Object();
 this.attributes=new Array();
 if(_1){this.setAttribute("swf",_1);}
 if(id){this.setAttribute("id",id);}
 if(w){this.setAttribute("width",w);}
 if(h){this.setAttribute("height",h);}
 if(_5){this.setAttribute("version",new manaba.deconcept.PlayerVersion(_5.toString().split(".")));}
 this.installedVer=manaba.deconcept.SWFObjectUtil.getPlayerVersion();
 if(c){this.addParam("bgcolor",c);}
 var q=_8?_8:"high";
 this.addParam("quality",q);
 this.setAttribute("useExpressInstall",_7);
 this.setAttribute("doExpressInstall",false);
 var _d=(_9)?_9:window.location;
 this.setAttribute("xiRedirectUrl",_d);
 this.setAttribute("redirectUrl","");
 if(_a){this.setAttribute("redirectUrl",_a);}
};
manaba.deconcept.SWFObject.prototype = {
 setAttribute:function(_e,_f){
  this.attributes[_e]=_f;
 },
 getAttribute:function(_10){
  return this.attributes[_10];
 },
 addParam:function(_11,_12){
  this.params[_11]=_12;
 },
 getParams:function(){
  return this.params;
 },
 addVariable:function(_13,_14){
  this.variables[_13]=_14;
 },
 getVariable:function(_15){
  return this.variables[_15];
 },
 getVariables:function(){
  return this.variables;
 },
 getVariablePairs:function(){
  var _16=new Array();
  var key;
  var _18=this.getVariables();
  for(key in _18){_16.push(key+"="+_18[key]);}
  return _16;}
 ,getSWFHTML:function(){
  var _19="";
  if(navigator.plugins&&navigator.mimeTypes&&navigator.mimeTypes.length){
   if(this.getAttribute("doExpressInstall")){
    this.addVariable("MMplayerType","PlugIn");}
   _19="<embed allowScriptAccess=\"always\" type=\"application/x-shockwave-flash\" src=\""+this.getAttribute("swf")+"\" width=\""+this.getAttribute("width")+"\" height=\""+this.getAttribute("height")+"\"";
   _19+=" id=\""+this.getAttribute("id")+"\" name=\""+this.getAttribute("id")+"\" ";
   var _1a=this.getParams();
   for(var key in _1a){_19+=[key]+"=\""+_1a[key]+"\" ";}
   var _1c=this.getVariablePairs().join("&");
   if(_1c.length>0){_19+="flashvars=\""+_1c+"\"";}_19+="/>";
  }else{if(this.getAttribute("doExpressInstall")){this.addVariable("MMplayerType","ActiveX");}
        _19="<object id=\""+this.getAttribute("id")+"\" classid=\"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000\" width=\""+this.getAttribute("width")+"\" height=\""+this.getAttribute("height")+"\">";
        _19+="<param name=\"movie\" value=\""+this.getAttribute("swf")+"\" />";
        _19+="<param name=\"allowScriptAccess\" value=\"always\" />";
        var _1d=this.getParams();
        for(var key in _1d){_19+="<param name=\""+key+"\" value=\""+_1d[key]+"\" />";}
        var _1f=this.getVariablePairs().join("&");
        if(_1f.length>0){_19+="<param name=\"flashvars\" value=\""+_1f+"\" />";}_19+="</object>";}
  return _19;
 },
 write:function(_20){
  if(this.getAttribute("useExpressInstall")){
   var _21=new manaba.deconcept.PlayerVersion([6,0,65]);
   if(this.installedVer.versionIsValid(_21)&&!this.installedVer.versionIsValid(this.getAttribute("version"))){
    this.setAttribute("doExpressInstall",true);
    this.addVariable("MMredirectURL",escape(this.getAttribute("xiRedirectUrl")));
    document.title=document.title.slice(0,47)+" - Flash Player Installation";
    this.addVariable("MMdoctitle",document.title);}}
  if(this.skipDetect||this.getAttribute("doExpressInstall")||this.installedVer.versionIsValid(this.getAttribute("version"))){
   var n=(typeof _20=="string")?document.getElementById(_20):_20;
   n.innerHTML=this.getSWFHTML();return true;
  }else{if(this.getAttribute("redirectUrl")!=""){document.location.replace(this.getAttribute("redirectUrl"));}}
  return false;
 }
};

manaba.deconcept.SWFObjectUtil.getPlayerVersion = function () {
 var _23=new manaba.deconcept.PlayerVersion([0,0,0]);
 if(navigator.plugins&&navigator.mimeTypes.length){
  var x=navigator.plugins["Shockwave Flash"];
  if(x&&x.description){_23=new manaba.deconcept.PlayerVersion(x.description.replace(/([a-zA-Z]|\s)+/,"").replace(/(\s+r|\s+b[0-9]+)/,".").split("."));}
 }else{try{var axo=new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");}
  catch(e){try{var axo=new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");
               _23=new manaba.deconcept.PlayerVersion([6,0,21]);axo.AllowScriptAccess="always";}
   catch(e){if(_23.major==6){return _23;}}try{axo=new ActiveXObject("ShockwaveFlash.ShockwaveFlash");}
   catch(e){}}if(axo!=null){_23=new manaba.deconcept.PlayerVersion(axo.GetVariable("$version").split(" ")[1].split(","));}}
 return _23;
};

manaba.deconcept.PlayerVersion = function (_27) {
 this.major=_27[0]!=null?parseInt(_27[0]):0;
 this.minor=_27[1]!=null?parseInt(_27[1]):0;
 this.rev=_27[2]!=null?parseInt(_27[2]):0;
};
manaba.deconcept.PlayerVersion.prototype.versionIsValid = function (fv) {
 if(this.major<fv.major){return false;}
 if(this.major>fv.major){return true;}
 if(this.minor<fv.minor){return false;}
 if(this.minor>fv.minor){return true;}
 if(this.rev<fv.rev){
  return false;
 }return true;
};

manaba.deconcept.util = {
 getRequestParameter:function(_29){
  var q=document.location.search||document.location.hash;
  if(q){var _2b=q.substring(1).split("&");
   for(var i=0;i<_2b.length;i++){
    if(_2b[i].substring(0,_2b[i].indexOf("="))==_29){
     return _2b[i].substring((_2b[i].indexOf("=")+1));}}}
  return "";
 }
};

manaba.deconcept.SWFObjectUtil.cleanupSWFs = function () {
 if(("opera" in window && window.opera)||!document.all){return;}
 var _2d=document.getElementsByTagName("OBJECT");
 for(var i=0;i<_2d.length;i++){_2d[i].style.display="none";for(var x in _2d[i]){
   if(typeof _2d[i][x]=="function"){_2d[i][x]=function(){};}}}
};

manaba.deconcept.SWFObjectUtil.prepUnload = function () {
 var __flash_unloadHandler=function(){};
 var __flash_savedUnloadHandler=function(){};
 if("onunload" in window
    && typeof window.onunload == "function"){
  var _30 = window.onunload;
  window.onunload = function(){
   manaba.deconcept.SWFObjectUtil.cleanupSWFs();_30();};
 }else{window.onunload=manaba.deconcept.SWFObjectUtil.cleanupSWFs;}
};

if ("onbeforeunload" in window
    && typeof window.onbeforeunload == "function") {
 var oldBeforeUnload = window.onbeforeunload;
 window.onbeforeunload = function(){
  manaba.deconcept.SWFObjectUtil.prepUnload();
  oldBeforeUnload();};
}
else {
 window.onbeforeunload = manaba.deconcept.SWFObjectUtil.prepUnload;
}

/**
 * 省略表示
 */
(function () {
var asahi = {};
asahi.util = {
 addEventListener : function (node, type, fn) {
  if (typeof node.addEventListener != "undefined") {
   node.addEventListener (type, fn, false);
   return true;
  }
  else if (typeof node.attachEvent != "undefined") {
   return node.attachEvent ("on" + type, fn);
  }
  else {
   return false;
  }
 }
};

/**
 * スタイル管理
 */
asahi.style = {
 /**
  * ルールを追加する
  *
  * @param  selector: String
  *         セレクタ
  * @param  style: String
  *         スタイル
  */
 addRule : function (selector, style) {
  try {
   if (document.styleSheets.length == 0) {
    var nodes = document.getElementsByTagName ("head");
    if (nodes.length) {
     var s = document.createElement ("style");
     nodes [0].appendChild (s);
    }
   }
   document.styleSheets [0].addRule (selector, style);
  }
  catch (e) {
   var nodes = document.getElementsByTagName ("head");
   if (nodes.length) {
    var s = document.createElement ("style");
    s.appendChild (document.createTextNode (selector + "{" + style + "}"));
    nodes [0].appendChild (s);
   }
  }
 }
};

/**
 * テキスト省略
 *   onload イベント以降に init を呼び出して起動する事で
 *   div で ellipsis で始まるクラス名を持つものについて省略する
 *   ellipsis 以降に _ 区切りでコマンドを指定できる
 *     begin: 先頭を省略
 *     center: 文字数において中央を省略
 *     end: 末尾を省略
 *     Ca: 対象の要素の子要素の中で最初の a 要素を対象にする
 *     B: 対象の要素を変更した場合でも変更前の対象の高さを計測する
 *     P: 対象の要素を変更した場合でも変更前の対象の親の高さを計測する
 *     X: contentstitle 特別対応, 表示サイズの制限を外す
 *     L2: 2 行を越える場合に省略する
 */
asahi.ellipsis = {
 //mark: "...",
 mark: "…",   /* String  省略記号 */
 
 targets : [], /* Array  省略対象 */
 
 /**
  * テキストを省略する
  *
  * @param  params: Object
  *         省略のパラメータ
  * @return Boolean
  *         省略する箇所が見付かったかどうか
  */
 doText : function (params) {
  var i;
  try {
   if (params.text) {
    params.textNode.nodeValue = params.text;
   }
   var text = params.textNode.nodeValue;
  }
  catch (e) {
   return false;
  }
  
  var len = text.length;
  
  if (len <= 1) {
   return false;
  }
  
  /* 指定行数の高さを取得する */
  var addnodes = [];
  var n;
  
  if (params.xnode) {
   params.xnode.style.height = "auto";
   params.xnode.style.width = "auto";
   params.xnode.style.maxWidth = "1000px";
  }
  if (params.ynode1 && params.ynode2) {
   params.ynode1.style.width = "auto";
   params.ynode2.style.width = "auto";
   try { params.ynode2.style.cssFloat = "right"; } catch (e) {}
   try { params.ynode2.style.styleFloat = "right"; } catch (e) {}
  }
  
  placeholder = document.createElement ("span");
  params.textParent.replaceChild (placeholder, params.textNode);
  
  for (i = 0; i < params.lines; i ++) {
   if (i > 0) {
    n = document.createElement ("br");
    addnodes.push (n);
    params.textParent.insertBefore (n, placeholder);
   }
   n = document.createTextNode ("X");
   addnodes.push (n);
   params.textParent.insertBefore (n, placeholder);
  }
  var okHeight = params.box.offsetHeight;
  
  n = document.createElement ("br");
  addnodes.push (n);
  params.textParent.insertBefore (n, placeholder);
  n = document.createTextNode ("X");
  addnodes.push (n);
  params.textParent.insertBefore (n, placeholder);
  var ngHeight = params.box.offsetHeight;
  var maxHeight = (ngHeight + okHeight) / 2;

  for (i = 0; i < addnodes.length; i ++) {
   params.textParent.removeChild (addnodes [i]);
  }
  
  /* 長い単語でも折り返しするためにソフトハイフンを入れておく  */
  var shy = "\xad";
  if (gBrowser.isChrome) {
   if (!text.substr (0, 1).match(/[A-Za-z]/)
       || !text.substr (1, 1).match(/[A-Za-z]/)) {
    shy = "";
   }
  }
  var pre = document.createTextNode (text.substr (0, 1) + shy + text.substr (1));
  params.textParent.insertBefore (pre, placeholder);
  
  /* 全体のサイズを取得する */
  if (params.box.offsetHeight > maxHeight) {
   /* 最大行数を越えている */
   
   var hidden = document.createElement ("span");
   hidden.className = "ellipsis-hidden";
   hidden.style.display = "none";
   
   var mark = document.createElement ("span");
   mark.className = "ellipsis-mark";
   mark.appendChild (document.createTextNode (this.mark + " a"));
   
   var post = document.createTextNode (".");
   
   params.textParent.insertBefore (hidden, placeholder);
   params.textParent.insertBefore (mark, placeholder);
   params.textParent.insertBefore (post, placeholder);
   
   params.textParent.removeChild (placeholder);
   
   var beginPos, endPos;
   /* 省略表示を更新する */
   var updateEllipsis = function (ellipsisCount) {
    if (params.mode == 1) {
     beginPos = 0;
     endPos = ellipsisCount;
    }
    else if (params.mode == 2) {
     beginPos = Math.ceil ((len - ellipsisCount) / 2.0);
     endPos = beginPos + ellipsisCount;
    }
    else {
     beginPos = len - ellipsisCount;
     endPos = len;
    }
    pre.nodeValue = text.substr (0, beginPos);
    post.nodeValue = text.substr (endPos);
   };
   
   var step = Math.ceil (len / 2.0);
   var ellipsisCount = 0;
   var over = {}; /* 省略文字数と文字数オーバーのマップ */
   over [ellipsisCount] = true;
   /* 文字数オーバーになるギリギリを探す */
   for (;;) {
    if (ellipsisCount >= len) {
     ellipsisCount = len;
    }
    if (ellipsisCount < 0) {
     if (params.xnode) {
       try { params.xnode.style.height = ""; } catch (e) {}
     }
     params.textParent.insertBefore (params.textNode, post);
     params.textParent.removeChild (pre);
     params.textParent.removeChild (hidden);
     params.textParent.removeChild (mark);
     params.textParent.removeChild (post);
     params.pre = null;
     params.hidden = null;
     params.mark = null;
     params.post = null;
     return;
    }
    
    if (over [ellipsisCount]) {
     ellipsisCount += step;
    }
    else {
     ellipsisCount -= step;
    }
    step = Math.ceil (step / 2.0);
    
    updateEllipsis (ellipsisCount);
    
    if (params.box.offsetHeight > maxHeight) {
     over [ellipsisCount] = true;
     if ((ellipsisCount + 1) in over
         && !over [ellipsisCount + 1]) {
      updateEllipsis (ellipsisCount + 1);
      break;
     }
    }
    else {
     over [ellipsisCount] = false;
     if ((ellipsisCount - 1) in over
         && over [ellipsisCount + 1]) {
      break;
     }
    }
    
    if (ellipsisCount == len) {
     break;
    }
   }
   
   /* 省略記号のタイトルに省略されたテキストを埋める */
   var hiddenText = text.substr (beginPos, endPos - beginPos)
   hidden.appendChild (document.createTextNode (hiddenText));
   mark.firstChild.nodeValue = this.mark;
   if (params.settitle) {
    params.box.title = text;
   }
   
   if (params.xnode) {
     try { params.xnode.style.height = ""; } catch (e) {}
   }

   params.pre = pre;
   params.hidden = hidden;
   params.mark = mark;
   params.post = post;
   
   return true;
  }
  if (params.xnode) {
    try { params.xnode.style.height = ""; } catch (e) {}
  }
  params.textParent.insertBefore (params.textNode, placeholder);
  params.textParent.removeChild (pre);
  params.pre = null;
  params.hidden = null;
  params.mark = null;
  params.post = null;
  
  return false;
 },
 
 /**
  * 省略を解除する
  *
  * @param  params: Object
  *         省略のパラメータ
  */
 undoElement : function (params) {
  if (params.pre) {
   params.textParent.insertBefore (params.textNode, params.pre);
   params.textParent.removeChild (params.pre);
   params.textParent.removeChild (params.hidden);
   params.textParent.removeChild (params.mark);
   params.textParent.removeChild (params.post);
   params.pre = null;
   params.hidden = null;
   params.mark = null;
   params.post = null;
  }
 },

 /**
  * 全ての対象を省略する
  */
 init : function () {
  asahi.util.addEventListener
  (window, "resize",
   (function (self) {
    return function () {
     if (self.lastWidth != document.body.offsetWidth) {
      self.lastWidth = document.body.offsetWidth;
      self.rebuild ();
     }
    };
   })(this));
  
  this.lastWidth = document.body.offsetWidth
  
  var tmp = document.getElementsByTagName ("div");
  var nodes = [];
  for (var i = 0; i < tmp.length; i ++) {
   nodes.push (tmp [i]);
  }
  for (var i = 0; i < nodes.length; i ++) {
   if ("className" in nodes [i]
       && nodes [i].className.match (/(^|\s)ellipsis(_[A-Za-z0-9_]+)?((\s|$))/)) {
    var commands = RegExp.$2;
    var params = {};
    
    params.box = nodes [i];
    params.textNode = nodes [i].firstChild;
    params.lines = 1;
    params.mode = 3;
    params.box = null;
    params.xnode = null;
    params.ynode1 = null;
    params.ynode2 = null;
    params.text = null;
    params.settitle = true;

    if (commands) {
     commands = commands.split (/_/);
     for (var j = 0; j < commands.length; j ++) {
      var command = commands [j];
      if (command.match (/L([0-9]+)/)) {
       params.lines = parseInt (RegExp.$1, 10);
      }
      else if (command == "B") {
       params.box = nodes [i];
      }
      else if (command == "P") {
       params.box = nodes [i].parentNode;
      }
      else if (command == "T") {
       params.text = nodes [i].title;
      }
      else if (command == "N") {
       params.settitle = false;
      }
      else if (command == "X") {
       var ns = params.box.getElementsByTagName ("div");
       for (var k = 0; k < ns.length; k ++) {
        if ("className" in ns [k] && ns [k].className.match (/(^|\s)contentstitle((\s|$))/)) {
         params.xnode = ns [k];
         break;
        }
       }
      }
      else if (command == "Y") {
       var ns = params.box.getElementsByTagName ("div");
       for (var k = 0; k < ns.length; k ++) {
        if ("className" in ns [k] && ns [k].className.match (/(^|\s)info-list-card-title((\s|$))/)) {
         params.ynode1 = ns [k];
        }
        if ("className" in ns [k] && ns [k].className.match (/(^|\s)info-list-card-subtitle((\s|$))/)) {
         params.ynode2 = ns [k];
        }
       }
      }
      else if (command.match (/C([a-z0-9]+)/)) {
       var name = RegExp.$1;
       var nodes2 = nodes [i].getElementsByTagName (name);
       if (nodes2.length) {
        params.textNode = nodes2 [0].firstChild;
       }
      }
      else if (command == "begin") {
       params.mode = 1;
      }
      else if (command == "center") {
       params.mode = 2;
      }
      else if (command == "end") {
       params.mode = 3;
      }
     }
    }
    if (!params.textNode) {
     continue;
    }
    if (params.textNode.nodeName.toLowerCase () != "#text") {
     continue;
    }
    params.textParent = params.textNode.parentNode;
    if (!params.box) {
     params.box = params.textParent;
    }
    this.doText (params);
    this.targets.push (params);
   }
  }
 },
 
 /**
  * 全ての省略対象を更新する
  */
 rebuild : function () {
  for (var i = 0; i < this.targets.length; i ++) {
   var params = this.targets [i];
   this.undoElement (params);
   this.doText (params);
  }
 }
};

window.asahi_ellipsis_init = function () {
    asahi.ellipsis.init ();
};
window.asahi_ellipsis_rebuild = function () {
    asahi.ellipsis.rebuild ();
};

})();

function callExtendFrame (id) {
 var node = document.getElementById(id);
 if (node) {
  var nodes = node.getElementsByTagName ("iframe");
  for (var i = 0; i < nodes.length; i ++) {
   if (nodes [i].id == 'afform') {
    nodes [i].contentWindow.extendFrame ();
   }
  }
 }
}

manaba.wordCountOfString = function (str) {
	var in_word = false;
	var result = 0;

	for (var i = 0; i < str.length; ++i) {

		var c = str.charAt(i);
		if (" \t\r\n,".indexOf(c) >= 0) { // TODO: この空白文字判定が適切かどうか
			if (in_word) {
				in_word = false;
			}
		}
		else {
			if (! in_word) {
				in_word = true;
				++result;
			}
		}
	};
	return result;
};

manaba.getTextareaWordCount = function (textareaNode) {
	return manaba.wordCountOfString(textareaNode.value);
};

manaba.getTextareaCharCount = function (textareaNode, skip) {
  const useSegmenter = (manaba.textareaCounterUseIntlSegmenter && 
    typeof Intl !== 'undefined' && Intl.Segmenter);
  if (useSegmenter) {
    var str = textareaNode.value.replace(/\r\n/g, "\r");
    const segmenter = new Intl.Segmenter();
    var grp = Array.from(segmenter.segment(str));
    if (skip) {
      return grp
        .filter(function(s) { return s.segment !=='\n' && s.segement !=='\r'})
        .length;
    } else {
      return grp.length;
    }
  } else {
    var str = textareaNode.value;
    if (skip) {
      var result = 0;
      for (var i = 0; i < str.length; ++i) {
        if (str.charAt(i).match(/[\r\n]/)) {
          // d\newlines are ignored
        }
        else {
          ++result;
        }
      }
      return result;
    } else if (gBrowser.isIE) {
      var result = 0;
      var prev_is_cr = false;
      for (var i = 0; i < str.length; ++i) {
        if (prev_is_cr && '\n' == str.charAt(i)) {
          // CRLF here.
        }
        else {
          ++result;
        }

        prev_is_cr = ('\r' == str.charAt(i));
      }
      return result;
    } else {
      return str.length;
    }
  }
};

manaba.insertAfter = function (existingNode, newNode) {
	existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
};

manaba.forEach = function (callback, arr) {
	for (var i = 0; i < arr.length; ++i) {
		callback(arr[i]);
	}
};
manaba.forEach2 = function (callback, arr0, arr1) {
	var imax = Math.min( arr0.length, arr1.length );
	for (var i = 0; i < imax; ++i) {
		callback(arr0[i], arr1[i]);
	}
};
manaba.map = function (callback, arr) {
	var result = new Array(arr.length);
	for (var i = 0; i < arr.length; ++i) {
		result[i] = callback(arr[i]);
	}
	return result;
};

manaba.fold = function (binop, initv, arr) {
	for (var i = 0; i < arr.length; ++i) {
		initv = binop(arr[i], initv);
	}
	return initv;
};

manaba.foldl = function (op, e, xs) {
	return manaba.fold(function (a, b) { return op(b, a); }, e, xs);
}

manaba.all = function (p, xs) {
	return manaba.foldl(function (e, x) { return e && p(x); }, true, xs);
};

manaba.any = function (p, xs) {
	return manaba.foldl(function (e, x) { return e || p(x); }, false, xs);
};

manaba.elem = function (e, xs) {
	return manaba.any(function (x) { return x == e; }, xs);
};

manaba.concatMap = function (f, xs) {
	return manaba.foldl(function (e, x) { return e.concat(f(x)); }, [], xs);
};

manaba.grep = function (p, xs) {
 var result = [];
 manaba.forEach( function(x) {
  if(p(x)) { result.push(x); }
 }, xs);
 return result;
};

manaba.arrayLast = function (a) {
 return a[a.length - 1];
};

manaba.currentScriptElement = function () {
 return manaba.arrayLast(document.scripts);
};

manaba.scriptattr = function (attr) {
 return manaba.currentScriptElement().getAttribute("data-webat-" + attr);
};

/**
 * 選択問題のクリックイベントハンドラ
 */
manaba.qv4checktoggle = function(ev, elem) {
	return manaba.qv4check_update(ev, elem, function(v) { return ! v; });
};
manaba.qv4checktrue = function(ev, elem) {
	return manaba.qv4check_update(ev, elem, function(v) { return true; });
};
manaba.qv4check_update = function(ev, elem, updater) {
	if (evtarget(ev) == elem) {
		return true;
	} else {
		elem.checked = updater(elem.checked);
		return false;
	}
};

/**
 * textareaNode のイベントを監視して、自身の内容を更新するような新しい要素を
 * textareaNode の直後に追加する。
 * @param
 *   valueGetter: textareaNodeを引数に呼ばれるコールバック。
 *                文字数や単語数を返すことを意図。
 *   formatter:   valueGetterの返値を引数に呼ばれるコールバック。
 *                この返値が表示内容になる。
 *                ローカライズやヒューリスティクスはここに埋めることを意図。
 *   eventns:     監視するイベント名の配列。
 */
manaba.appendTextareaCounter = function (textareaNode, valueGetter, formatter, events, valueGetterArgs, divClass) {
	var counterNode = document.createElement('div');
	if (divClass) manaba.addClass(counterNode, divClass);
	var updater = function() {
		counterNode.innerHTML = formatter(valueGetter.apply(null, [textareaNode].concat(valueGetterArgs)));
	};
	manaba.forEach(function(event_type) {
			// alert("adding event: " + event_type);
			manaba.addevent(textareaNode, event_type, updater);
	}, events);
	manaba.insertAfter(textareaNode, counterNode);
	if (manaba.ExportTextAreaCounterUpdater) {
		var updaters;
		if (textareaNode['manaba_textarea_counter_updaters']) {
			updaters = textareaNode['manaba_textarea_counter_updaters'];
		} else {
			updaters = textareaNode['manaba_textarea_counter_updaters'] = [];
		}
		updaters.push(updater);
	}
	updater();
};

manaba.appendTextareaWordCounter = function (textareaNode, divClass) {
	return manaba.appendTextareaCounter(
		textareaNode,
		manaba.getTextareaWordCount,
		function(words) {
			return '<span class="textarea_wordcount">'
				+ words
				+ '</span>'
				+ (words == 1 ? ' word' : ' words')
				;
		},
		["keyup", "change"], null, divClass);
};

manaba.appendTextareaCharCounter = function (textareaNode, skip, divClass) {
	return manaba.appendTextareaCounter(
		textareaNode,
		manaba.getTextareaCharCount,
		function(words) {
                        var countchars = (gLang == 'ja') ? '文字' : ' characters';
			return '<span class="textarea_charcount">'
				+ words
				+ '</span>'
				+ countchars;
		},
		["keyup", "change"],
		[skip], divClass );
};

manaba.domattr_props = {
	'className': 1,
	'defaultChecked': 1
};
manaba.dom = function (name, attr) {
	var node = document.createElement(name);
	for (var key in attr) {
		if (key in manaba.domattr_props) {
			node[key] = attr[key];
		} else if (key.match(/^on/) && typeof(attr[key]) == "function") {
			manaba.addevent(node, key.replace(/^on/, ""), attr[key]);
		} else {
			node.setAttribute(key, attr[key]);
		}
	}
	for (var i = 2; i < arguments.length; ++i) {
		var child = arguments[i];
		node.appendChild(
			typeof(child) == "string"
			? document.createTextNode(child) : child);
	}
	return node;
};

manaba.paddingEdgeFromBody = function(node) {
 var x = 0;
 var y = 0;
 while (node) {
  x += node.offsetLeft;
  y += node.offsetTop;
  node = node.offsetParent;
 }
 return { "x": x, "y": y };
};
manaba.boundingClientRectI = function(node, considerscroll) {
 var rc = node.getBoundingClientRect();
 var scrollx = 0;
 var scrolly = 0;
 if (considerscroll) {
  if (manaba.fixChromeScroll) {
   if ("documentElement" in document && "scrollLeft" in document.documentElement && "scrollTop" in document.documentElement) {
    scrollx = scrollx || document.documentElement.scrollLeft;
    scrolly = scrolly || document.documentElement.scrollTop;
   }
   if ("body" in document && "scrollLeft" in document.body && "scrollTop" in document.body) {
    scrollx = scrollx || document.body.scrollLeft;
    scrolly = scrolly || document.body.scrollTop;
   }
   if ("scrollX" in window && "scrollY" in window) {
    scrollx = scrollx || window.scrollX;
    scrolly = scrolly || window.scrollY;
   }
  } else {
   if ("documentElement" in document && "scrollLeft" in document.documentElement && "scrollTop" in document.documentElement) {
    scrollx = document.documentElement.scrollLeft;
    scrolly = document.documentElement.scrollTop;
   } else if ("body" in document && "scrollLeft" in document.body && "scrollTop" in document.body) {
    scrollx = document.body.scrollLeft;
    scrolly = document.body.scrollTop;
   } else if ("scrollX" in window && "scrollY" in window) {
    scrollx = window.scrollX;
    scrolly = window.scrollY;
   }
  }
 }
 var rcwidth = ("width" in rc) ? rc.width : (rc.right - rc.left);
 var rcheight = ("height" in rc) ? rc.height : (rc.bottom - rc.top);

 var left = rc.left + scrollx;
 var top = rc.top + scrolly;
 var ileft = Math.floor(left);
 var itop = Math.floor(top);
 var iright = Math.ceil(left + rcwidth);
 var ibottom = Math.ceil(top + rcheight);
 var icenterh = Math.round(left + rcwidth * 0.5);
 var icenterv = Math.round(top + rcheight * 0.5);
 return {
  "left": ileft,
  "top": itop,
  "right": iright,
  "bottom": ibottom,
  "width": iright - ileft,
  "height": ibottom - itop,
  "centerh": icenterh,
  "centerv": icenterv
 };
};
manaba.EditBox2BFocus = function(node) {
 manaba.addClass(node, "hover");
};
manaba.EditBox2BBlur = function(node) {
 manaba.removeClass(node, "hover");
};

manaba.isAncestor = function(maybe_descendant, maybe_ancestor) {
 while (maybe_descendant) {
  if (maybe_descendant == maybe_ancestor) {
   break;
  }
  maybe_descendant = maybe_descendant.parentNode;
 }
 return maybe_descendant;
};

manaba.descendants_foreach = function(root,cb) {
 if (! root) {
  return;
 }
 cb(root);
 var o = root.firstChild;
 for ( ; o; o = o.nextSibling) {
  manaba.descendants_foreach(o, cb);
 }
};
manaba.checked_chekbox_foreach = function(form,cb) {
 manaba.descendants_foreach(form, function(o) {
  if (o.tagName == 'INPUT' && o.type == 'checkbox' && o.checked) {
   cb(o);
  }
 });
};
manaba.join_checked_value_foreach = function(form,glue) {
 if (glue == null) { glue = ','; }
 var result = '';
 manaba.checked_chekbox_foreach(form, function(o) {
  if (result == '') {
   result += o.value;
  } else {
   result += ',' + o.value;
  }
 });
 return result;
};
manaba.disable_submit_button= function (form) {
 if (! manaba.disable_submit_button_active) return;
 var inputs = form.getElementsByTagName('input');
 for (var i = 0; i < inputs.length; i++) {
  var inputtype = inputs[i].getAttribute('type');
  if (inputtype.match(new RegExp('^(submit|image)$', 'i'))) {
   inputs[i].onclick = function(){return false};
  }
 }
};

manaba.submit_with_button = function(form, button_name) {
 // TODO: document == form.document
 var hidden = document.createElement('input');
 hidden.type = 'hidden';
 hidden.name = button_name;
 hidden.value = 1;
 manaba.disable_submit_button(form);
 form.appendChild(hidden)
 form.submit();
};

manaba.disableClasses = function(className, status, root, hiddencontainer) {
 if (typeof(root)=='string') {
  root = document.getElementById(root);
 }
 if (typeof(hiddencontainer)=='string') {
  hiddencontainer = document.getElementById(hiddencontainer);
 }
 if (hiddencontainer) {
  hiddencontainer.innerHTML = '';
 }
 manaba.descendants_foreach(root, function(elem) {
  if (manaba.hasClass(elem, className)) {
   if (elem.tagName == 'INPUT' && elem.type == 'radio') {
    elem.disabled = status;
   }
   if (hiddencontainer && status) {
    if (elem.tagName == 'INPUT' && elem.type == 'radio' && elem.checked) {
     var hidden = document.createElement('input');
     hidden.type = 'hidden';
     hidden.name = elem.name;
     hidden.value = elem.value;
     hiddencontainer.appendChild(hidden);
    }
   }
  }
 });
};
// add class to elements which has specified class
manaba.addClassToClass = function(root, classNameExisting, classNameToAdd) {
 if (typeof(root)=='string') {
  root = document.getElementById(root);
 }
 manaba.descendants_foreach(root, function(elem) {
  if (manaba.hasClass(elem, classNameExisting)) {
   manaba.addClass(elem, classNameToAdd);
  }
 });
};
// remove class from elements which has specified class
manaba.removeClassFromClass = function(root, classNameExisting, classNameToRemove) {
 if (typeof(root)=='string') {
  root = document.getElementById(root);
 }
 manaba.descendants_foreach(root, function(elem) {
  if (manaba.hasClass(elem, classNameExisting)) {
   manaba.removeClass(elem, classNameToRemove);
  }
 });
};

// ここから tpanel 関連
manaba.tpanel_get = function(suffix) {
 if (suffix == null) suffix = ''; 
 return document.getElementById ("tpanel_frame" + suffix);
};

manaba.tpanel_close = function(suffix) {
 if (suffix == null) suffix = '';
 var back = document.getElementById ("tpanel_back" + suffix);
 var screen = document.getElementById ("tpanel_screen" + suffix);
 if (back && screen){
  back.parentNode.removeChild (back);
  screen.parentNode.removeChild (screen);
  return false;
 }
 return true;
}

manaba.tpanel_make = function(suffix,opt) {
 if (suffix == null) suffix = '';
 if (!opt) opt = {};
 if (document.getElementById ("panel_blocker") && !opt.overpanel) {
  return false;
 }
 var noouterclick = opt['noouterclick'];

 var back = document.createElement ("div");
 back.className = "tpanel_back";
 back.id = back.className + suffix;
 if (opt.overpanel) {
   back.style.zIndex = 110;
 }
 if (opt.nowloading) {
   back.style.zIndex = 910;
 }
 if (! noouterclick) {
  manaba.addevent(back,"click",function(){manaba.tpanel_close(suffix);});
 }

 var screen = document.createElement ("div");
 screen.className = "tpanel_screen";
 screen.id =  screen.className + suffix;
 if (opt.overpanel) {
   screen.style.zIndex = 200;
 }
 if (opt.nowloading) {
   screen.style.zIndex = 1000;
 }

 if (document.body.scrollTop) {
  screen.style.top = document.body.scrollTop + "px";
 }
 else if (document.documentElement.scrollTop) {
  screen.style.top = document.documentElement.scrollTop + "px";
 }
 if (document.body.scrollLeft) {
  screen.style.left = document.body.scrollLeft + "px";
 }
 else if (document.documentElement.scrollLeft) {
  screen.style.left = document.documentElement.scrollLeft + "px";
 }
 document.body.appendChild (screen);

 var panel = document.createElement ("div");
 panel.className = "tpanel_frame";
 panel.id = panel.className + suffix;
 screen.appendChild (panel);

 if (opt.framewidth) {
  panel.style.setProperty('width' , opt.framewidth + "px" , 'important');
 }
 if (! noouterclick) {
  manaba.addevent(screen,"click",function(event){
   var target = evtarget(event);
   if (manaba.isAncestor(target, panel)) {
    return;
   }
   manaba.tpanel_close(suffix);
  });
 }

 document.body.appendChild (back);

 return panel;
};

manaba.tpanel_show = function(element,suffix,opt){
 if (!opt) opt = {};
 var domelement = opt['domelement'];
 var panel = manaba.tpanel_get(suffix);
 if (panel) {
  while (panel.firstChild)
   panel.removeChild(panel.firstChild);
 } else {
  panel = manaba.tpanel_make(suffix,opt);
 }
 if (panel) {
  if (domelement) {
   panel.appendChild(element);
  } else {
   panel.innerHTML = element;
  }
  var panel_event = document.getElementById('tpanel_onload');
  if (panel_event){
   if (panel_event.click)panel_event.click();
   else if (panel_event.onclick)panel_event.onclick();
   panel_event.parentNode.removeChild(panel_event);
  }
  var panel_movable = document.getElementById('tpanel_movable');
  if (panel_movable) {
   manaba.addevent(panel_movable,'mousedown',manaba.tpanel_onMouseDown);
  }
  var loadcallback = opt["loadcallback"];
  if (loadcallback)loadcallback();
  if (manaba.useMathJax) {
   MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
  }
  if (manaba.tpanelblockchattering) {
   manaba.unblock_chattering();
  }
  if (manaba.tpanel_aftershow) {
   manaba.tpanel_aftershow();
  }
 }
};

manaba.tpanel_iframe = function(element,suffix){
 if (suffix == null) suffix = "";
 var iframe = document.getElementById("hiddeniframe" + suffix);
 if (iframe == null) {
  iframe = document.createElement("iframe");
  iframe.name = "hiddeniframe" + suffix;
  iframe.id = "hiddeniframe" + suffix;
  iframe.style.height = "1px";
  iframe.style.width = "1px";
  iframe.style.border = "none";
  manaba.addevent(iframe,"load",function () {
   manaba.tpanel_show(iframe.contentDocument.body.innerHTML,suffix);
  });
  document.body.appendChild(iframe);
 }
 if (element.parentNode.onlybody == null){
  var o=document.createElement('input');
  o.id = 'onlybody'
  o.name ='onlybody';
  o.value=1;
  o.type = "hidden";
  element.parentNode.appendChild(o);
  var form = manaba.findParentNode(element, "form");
  form.target = "hiddeniframe" + suffix;
 }
 return true;
}

manaba.moveparent = new Array();
manaba.resetmoveelement = function(srcid) {
 var src = document.getElementById(srcid);
 if (manaba.moveparent[srcid]) {
  manaba.moveparent[srcid].style.display = 'none';
 }
 manaba.moveparent[srcid] = null;
 MakeHide(src);
 return false;
}
manaba.moveelement = function(srcid,destid) {
 var src = document.getElementById(srcid);
 var dest = document.getElementById(destid);
 if (src && dest) {
  if (manaba.moveparent[srcid]) {
   manaba.moveparent[srcid].style.display = 'none';
  }
  src.style.position = 'absolute';
  MakeVisible(src);
  MakeVisible(dest);
  src.style.top = '' + 0 + 'px';
  src.style.left = '' + 0 + 'px';
  var possrc = manaba.boundingClientRectI(src, true);
  var posdest = manaba.boundingClientRectI(dest, true);
  src.style.top = '' + (posdest.top - possrc.top) + 'px';
  src.style.left = '' + (posdest.left - possrc.left) + 'px';
  dest.style.height = '' + possrc.height + 'px';
  manaba.moveparent[srcid] = dest;
  return false;
 }
 return true;
}

manaba.cleanmovedelement = function(srcid) {
 var src = document.getElementById(srcid);
 if (src) {
  if (manaba.moveparent[srcid]) {
   manaba.moveparent[srcid].style.display = 'none';
  }
  MakeHide(src);
  return false;
 }
 return true;
}
manaba.changeparent = function(srcid,destid) {
 var src = document.getElementById (srcid);
 var dest = document.getElementById (destid);
 dest.appendChild(src);
 return false;
}

manaba.onelementcache = {};
manaba.onelement = function(element,id,callback,opt) {
 if (!opt) opt = {};
 var target = document.getElementById (id);
 if (opt['removeid']) target.id = '';
 var url = opt ? opt['url'] : null;
 if (url == null && element.href != null) url = "" + element.href;
 if (url) {
  var cachename = opt.cache;
  var ajaxcallback = function(text){
   while (target.firstChild)
    target.removeChild(target.firstChild);
   if (!opt.nostyle) {
    target.style.display = 'block';
    target.style.visibility = 'visible';
   }
   target.innerHTML = text;
   if(callback) callback();
   var ajax_script = document.getElementById('ajax_onload');
   if (ajax_script){
    eval (ajax_script.innerHTML);
    ajax_script.parentNode.removeChild(ajax_script);
   }
   if (manaba.useMathJax) {
    MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
   }
   if (cachename) manaba.onelementcache[cachename] = text;
   return false;
  };
  if (cachename && (cachename in manaba.onelementcache)) {
    return ajaxcallback(manaba.onelementcache[cachename]);
  }
  return manaba.ajaxgetbody(url,ajaxcallback,"onlyelement=1");
 }
}

manaba.onelement_post = function(element,id,callback,opt) {
 if (!opt) opt = {};
 var target = document.getElementById (id);
 var form = manaba.findParentNode(element, "form");
 if (form == null) return true;
 var url = opt.url;
 if (url == null) {
  url = form.action;
 }
 var queryString = manaba.getFormDataString("onlyelement",1);
 if (element.name) queryString += manaba.getFormDataString(element.name,element.value);
 if (url) {
  return manaba.postFormData(form,queryString,function(queryString) {
   return manaba.ajaxgetbody(url,function(text){
    if (opt.nodest) {
     if(callback) callback();
    } else {
     while (target.firstChild)
      target.removeChild(target.firstChild);
     if (!opt.nostyle) {
      target.style.display = 'block';
      target.style.visibility = 'visible';
     }
     target.innerHTML = text;
     if(callback) callback();
     var ajax_script = document.getElementById('ajax_onload');
     if (ajax_script){
      eval (ajax_script.innerHTML);
      ajax_script.parentNode.removeChild(ajax_script);
     }
     if (manaba.useMathJax) {
      MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
     }
    }
   },queryString,'POST');
  },opt.files);
 }
}

manaba.ontpanel_post = function(element,opt) {
 if (!opt) opt = {};
 var panel = manaba.tpanel_get(opt.suffix);
 if (panel) {
  manaba.tpanel_post(element,opt);
  return false;
 }
 return true;
}

manaba.ontpanel = function(element,opt) {
 if (!opt) opt = {};
 var panel = manaba.tpanel_get(opt.suffix);
 if (panel) {
  opt.bytpanel = 1;
  manaba.tpanel(element,opt);
  return false;
 }
 return true;
}

manaba.tpanel_post = function(element,opt) {
 if (manaba.tpanelblockchattering) {
  if (!manaba.block_button_chattering(element)) return false;
 }
 if (!opt) opt = {};
 var form = manaba.findParentNode(element, "form");
 if (form == null) return true;
 var url = opt.url;
 if (url == null) {
  url = form.action;
 }
 var queryString = manaba.getFormDataString("showintpanel",1);
 if (element.name) queryString += manaba.getFormDataString(element.name,element.value);
 var extHeader= {};
 if (manaba.enableExtraHTTPHeaders) extHeader = {'X-Requested-For' : 'tpanel'};

 if (opt.responloader) {
  manaba.respon_showloader(opt);
 } else if (opt.responloader2) {
  manaba.respon_showloader(opt);
 } else if (manaba.tpanelnowloading) {
  manaba.tpanel_nowloading(opt);
 }

 return manaba.postFormData(form,queryString,function(queryString) {
  return manaba.ajaxgetbody(url,function(text){
   if (opt.responloader) {
    manaba.respon_hideloader();
   } else if (opt.responloader2) {
    manaba.respon_hideloader();
    manaba.tpanel_close();
   } else if (manaba.tpanelnowloading) {
    manaba.tpanel_close('nowloading');
   }
   manaba.tpanel_show(text,opt.suffix,opt);
  },queryString,'POST',extHeader);
 });
}

manaba.tpanel_nowloading = function(opt) {
  if (!opt) opt = {};
  var lang = gLang ? gLang : 'ja';
  var close = '閉じる';
  if (lang == 'en') close = 'Close';
  var nlopt = {noouterclick:1, nowloading:1};
  manaba.tpanel_show(
    '<div class="nowloading-panel"><p>Now Loading..</p><p><img src="/now_loading.gif" alt=""></p><span><a href="#" onclick="return manaba.tpanel_close(\'nowloading\');">' + close + '</span></div>','nowloading',nlopt);
  return false;
}

manaba.tpanel = function(url_or_element,opt) {
 var url = null;
 var ignore_a_descendant = false;

 if (typeof(url_or_element) == 'string') {
  url = url_or_element;
  ignore_a_descendant = true;
 } else if ('href' in url_or_element) {
  url = "" + url_or_element['href'];
 }

 if (url == null) {
  return true;
 }

 var event = opt ? opt['event'] : null;
 var target = event ? evtarget(event) : null;

 if (target && ignore_a_descendant) {
  var a = manaba.findParentNode(target, "a");
  if (a) {
   return true;
  }
 }

 var suffix = opt ? opt['suffix'] : null;
 if (suffix == null) suffix = '';

 var callback = opt ? opt['callback'] : null;
 if (callback != null) {
  manaba.tpanel_callback = callback;
 }

 var aftershow = opt ? opt['aftershow'] : null;
 if (aftershow != null) {
  manaba.tpanel_aftershow = aftershow;
 }

 var loadcallback = opt ? opt['loadcallback'] : null;

 if(url.indexOf("?") == -1) url += "?";
 else url += "&";
 url += "showintpanel=1";

 if (manaba.tpanelnowloading) {
  manaba.tpanel_nowloading(opt);
 }

 return manaba.ajaxgetbody(url,function(text){
  if (manaba.tpanelnowloading) {
   manaba.tpanel_close('nowloading');
  }
  manaba.tpanel_show(text,suffix,opt);
 });
}
manaba.tpanel_obj = null;
manaba.tpanel_offsetX = null;
manaba.tpanel_offsetY = null;
manaba.tpanel_onMouseDown = function(e) {
 var target = evtarget(e);
 var self = document.getElementById('tpanel_movable');
 if (target != self) return true;
 manaba.tpanel_obj = self;
 if (document.all) {
  if (self.style.left == "") self.style.left = "0px";
  manaba.tpanel_offsetX = event.clientX + document.body.scrollLeft - parseInt(self.style.left);
  if (self.style.top == "") self.style.top = "0px";
  manaba.tpanel_offsetY = event.clientY + document.body.scrollTop - parseInt(self.style.top);
 } else if (self.getElementsByTagName) {
  if (self.style.left == "") self.style.left = "0px";
  manaba.tpanel_offsetX = e.pageX - parseInt(self.style.left);
  if (self.style.top == "") self.style.top = "0px";
  manaba.tpanel_offsetY = e.pageY - parseInt(self.style.top);
 }
 return false;
}
manaba.tpanel_onMouseMove = function(e) {
 if (!manaba.tpanel_obj) {
  return true;
 }
 if (document.all) {
  manaba.tpanel_obj.style.left = event.clientX - manaba.tpanel_offsetX + document.body.scrollLeft;
  manaba.tpanel_obj.style.top = event.clientY - manaba.tpanel_offsetY + document.body.scrollTop;
 } else if (manaba.tpanel_obj.getElementsByTagName) {
  manaba.tpanel_obj.style.left = (e.pageX - manaba.tpanel_offsetX) + "px";
  manaba.tpanel_obj.style.top = (e.pageY - manaba.tpanel_offsetY) + "px";
 }
 return false;
}
manaba.tpanel_onMouseUp = function(e) {
 manaba.tpanel_obj = null;
}
if (manaba.enableMovablePanel) {
 document.onmousemove = manaba.tpanel_onMouseMove;
 document.onmouseup = manaba.tpanel_onMouseUp;
}
// ここまでtpanel関連

manaba.ajaxgetbody = function(url,ajax_function,queryString,method,extheader,opt) {
 if (method == null) method = 'GET';
 var request = CreateXMLHttpRequest();
 request.onreadystatechange = function () {
   if (request.readyState == 4) {
    if (request.responseText.indexOf('<!-- MARKER_NOT_LOGGED_IN  -->') >= 0){
     alert(gLang == 'ja' ? 'ログアウトしました。' : 'Logged out.');
    } else {
     if(ajax_function) ajax_function(request.responseText);
    }
   }
  };
  if(url.indexOf("?") == -1) url += "?";
  else url += "&";
  url += "onlybody=1&refresh=" + manaba.SystemUnixTime + (manaba.ajaxcounter++);

  if (method == 'FormDataPOST') { //FormDataによるPost queryStringがStringじゃないので注意
   request.open('POST', url , true);
   request.send(queryString);
  } else if (method == 'POST') {
   request.open(method, url , true);
   if (opt == 'urlencode') {
    request.setRequestHeader('Content-Type' , 'application/x-www-form-urlencoded');
   } else {
    request.setRequestHeader('Content-Type', 'multipart/form-data; boundary=' + manaba.formboundary);
   }
   if (extheader) {
    for (var key in extheader) {
     request.setRequestHeader(key,extheader[key]);
    }
   }
   request.send(queryString);
  } else {
   if (queryString) url += "&" + queryString;
   request.open(method, url , true);
   if (extheader) {
    for (var key in extheader) {
     request.setRequestHeader(key,extheader[key]);
    }
   }
   request.send(null);
  }
  return false;
}

manaba.formboundary = '-------------------------------------------------manababoundary';
manaba.getFormDataString = function(name,value) {
 var ret = "--" + manaba.formboundary + "\r\n";
 ret += "Content-Disposition: form-data; name=\""+name+"\"\r\n";  
 ret += "\r\n";
 ret += value + "\r\n";
 return ret;
}

manaba.sendfile = function(element,files,url) {
 var form = manaba.findParentNode(element, "form");
 if (url == null) {
  url = form.action;
 }
 var queryString = manaba.getFormDataString(element.name,element.value);
  return manaba.postFormData(form,queryString,function(queryString) {
   return manaba.ajaxgetbody(url,function(text){
    var afform = document.getElementById('afform');
    if(afform) { afform.contentWindow.location.reload(); }
    var destdiv = document.getElementById('sendfiledest');
    if(destdiv) { destdiv.innerHTML = text; }
   },queryString,'POST');
  },files);
}

manaba.sendfileByFormData = function(element,file,opt) {
 if (!opt) opt = {};
 var url = opt['url'];
 var callback = opt['callback'];
 var params = opt['params'] || [];
 var form = manaba.findParentNode(element, "form");
 if (url == null) {
  url = form.action;
 }
 var formData = new FormData(form);
 formData.append('UploadFile',file);
 for (var j = 0; j < params.length; j++) {
  formData.append(params[j][0],params[j][1]);
 }
 return manaba.ajaxgetbody(url,function(text){
  if (callback) callback(text);
 },formData,'FormDataPOST');
}

manaba.postFormData = function(form,queryString,postFunction,files) {
 var flag = 1;
 var elems;
 if (files) {
  elems = new Array(1);
  elems[0] = { 'type' : 'file', 'files' : files, 'name' : 'UploadFile' };
 } else {
  elems = form.getElementsByTagName('input');
 }
 for (var i = 0; i < elems.length; i++){
    if (elems[i].type == 'checkbox' && !elems[i].checked) continue;
    if (elems[i].type == 'radio' && !elems[i].checked) continue;
    if (elems[i].type == 'file') {
     var files = elems[i].files;
     if (!files) {
      alert('お使いのブラウザはFile APIをサポートしていません。');
      return true;
     }
     for (var j = 0; j < files.length; j++) {
      var file = files[j];
      var formname = elems[i].name;
      var fileName = file.name,
       fileSize = file.size,
       fileType = file.type;
      var reader = new FileReader();
      flag++;
      if (reader.readAsBinaryString) {
       reader.readAsBinaryString(file);
       reader.onload = function(event)
       {
        var fileData;
        fileData = event.target.result;
        var ret = "--" + manaba.formboundary + "\r\n";
        ret += "Content-Disposition: form-data; name=\""+formname+"\"; filename=\"" + fileName + "\"\r\n";
        ret += "Content-Type: " + fileType + "\r\n";
        ret += "Content-Transfer-Encoding: base64\r\n"
        ret += "\r\n"
        ret += manaba.encode_base64(fileData) + "\r\n";
        queryString += ret;
        flag--;
        if (flag == 0) {
         queryString += "--" + manaba.formboundary + "--";
         return postFunction(queryString);
        }
       }
      } else {
       reader.readAsArrayBuffer(file);
       reader.onload = function(event)
       {
        var buf = event.target.result;
        buf = new Uint8Array(buf);
        var fileData;
        for (var i = 0; i < buf.length; i++) {
         fileData += String.fromCharCode( buf[ i ] )
        }
        var ret = "--" + manaba.formboundary + "\r\n";
        ret += "Content-Disposition: form-data; name=\""+formname+"\"; filename=\"" + fileName + "\"\r\n";
        ret += "Content-Type: " + fileType + "\r\n";
        ret += "Content-Transfer-Encoding: base64\r\n"
        ret += "\r\n"
        ret += manaba.encode_base64(fileData) + "\r\n";
        queryString += ret;
        flag--;
        if (flag == 0) {
         queryString += "--" + manaba.formboundary + "--";
         return postFunction(queryString);
        }
       }
      }
     }
    } else if (elems[i].name && elems[i].type != 'submit' &&  elems[i].type != 'image') {
     queryString += manaba.getFormDataString(elems[i].name,elems[i].value);
    }
 }
 elems = form.getElementsByTagName('textarea');
 for (var i = 0; i < elems.length; i++){
    if (elems[i].name) queryString += manaba.getFormDataString(elems[i].name,elems[i].value);
 }
 elems = form.getElementsByTagName('select');
 for (var i = 0; i < elems.length; i++){
    if (elems[i].name) queryString += manaba.getFormDataString(elems[i].name,elems[i].value);
 }
 flag--;
 if (flag == 0) {
  queryString += "--" + manaba.formboundary + "--";  
  return postFunction(queryString);
 }
 return false;
}

manaba.gauges = new Array();
manaba.countupgauge = function (tdid,spanid,until) {
 var td = document.getElementById(tdid);
 if (td) {
  var span = document.getElementById(spanid);
  td.style.width = '1%';
  span.innerHTML = '1';
  if (!manaba.gauges.length) {
   var cnt = 1;
   var func = function () {
    cnt+=2;
    for (var i = 0;i < manaba.gauges.length;i++) {
     var gauge = manaba.gauges[i];
     if (cnt > gauge.until) {
      gauge.td.style.width = gauge.until + '%';
      gauge.span.innerHTML = gauge.until;
      manaba.gauges.splice(i,1);
      i--;
     } else {
      gauge.td.style.width = cnt + '%';
      gauge.span.innerHTML = cnt;
     }
    }
    if (manaba.gauges.length) {
     setTimeout(func,40);
    }
   };
   manaba.addevent(window,'load',func);
  }
  manaba.gauges[manaba.gauges.length] = ({'td' : td, 'span' : span, 'until' : until});
 }
 return false;
}

manaba.filedragenter = function(evt) {
    manaba.stopEvent(evt);
}
manaba.filedragover = function(evt) {
    manaba.stopEvent(evt);
}
manaba.filedrop = function(evt,buttonid,destid,loadcallback) {
    manaba.stopEvent(evt);
    var button;
    button = document.getElementById(buttonid);
    return manaba.onelement_post(button,destid,loadcallback,{ files : evt.dataTransfer.files});
}

//テーブル関連
manaba.sortrows = function(element){
 var target = manaba.findParentNode(element, "table");
 var cellindex = element.cellIndex;
 var tbody = target.getElementsByTagName('tbody')[0];
 var records = tbody.rows;
 var array = [];
 var nowc = records[0].cells[cellindex].className;
 for(i=0;i<records[0].cells.length;i++){
  var c=records[0].cells[i];
  if(c.className!='nosort'){c.className='head'}
 }
 if (nowc == 'asc') {
  records[0].cells[cellindex].className = 'desc';
 } else {
  records[0].cells[cellindex].className = 'asc';
 }
 var newtbody=document.createElement('tbody');
 newtbody.appendChild(records[0]);

 for(var i=0;i<records.length;i++){
  array[i] = {};
  array[i].o=records[i];
  var v=records[i].cells[cellindex].firstChild;
  array[i].value=(v!=null)?v.innerHTML:'';
 }

 array.sort(manaba.cellcompare);
 if (nowc == 'asc') array.reverse();
 for(i=0;i<array.length;i++){
  newtbody.appendChild(array[i].o);
  array[i].o.className=(i%2==0)?'even':'odd';
 }
 target.replaceChild(newtbody,tbody);
 return false;
}

manaba.cellcompare = function (f,c){
   f=f.value,c=c.value;
    return (f>c?1:(f<c?-1:0))
}

manaba.excelhiddenset = function(tableid) {
 var table = document.getElementById(tableid);
 var tbody = table.getElementsByTagName('tbody')[0];
 var records = tbody.rows;
 var json = new Array();
 for(var i=1;i<records.length;i++){
  var cells=records[i].cells;
  var row = new Object();
  for (var j=1;j<cells.length;j++){
   var cell = cells[j];
   if (cell.name) {
    row[cell.name] = cell.firstChild.innerHTML;
   }
  }
  json[i - 1] = row;
 }
 tbody.appendChild(manaba.createHidden(tableid,JSON.stringify(json)));
 return true;
}

manaba.insertnext = function (cell,fields) {
 var target = manaba.findParentNode(cell, "table");
 return manaba.addrow(target,fields,{},cell.parentNode.rowIndex + 1);
}

manaba.addrow = function (table,fields,values,addindex) {
 var id = table.id;
 index = table.rows.length;
 var row = table.insertRow(addindex);
 manaba.addevent(row,'mouseover',function (e) {
  manaba.oneobjdragover(e,row,id,function (e,t) {
   manaba.rowswap(row,t);
  });
 });
 var mcell = row.insertCell(-1);
 mcell.style.cursor = 'move';
 mcell.appendChild(document.createTextNode('●'));
 manaba.addevent(mcell,'dblclick',function (e) {return manaba.insertnext(evtarget(e),fields);});
 manaba.addevent(mcell,'mousedown',function (e) {manaba.stopEvent(e);manaba.oneobjdragstart(e,mcell.parentNode,id);return false;});
 for (var i = 0; i < fields.length;i++) {
 for ( var k in fields[i] ) {
  var cell = row.insertCell(-1);
  var div = document.createElement('div');
  div.contentEditable = true;
  div.appendChild(document.createTextNode((values[k]!=null)?values[k]:''));
  cell.name = k;
  cell.appendChild(div);
 }
 }
 return false;
}

manaba.maketable = function(records,fields,tableid) {
 var table = document.getElementById(tableid);
 if (records.length && table) {
  var row = table.insertRow(-1);
  var mcell = document.createElement('th');
  mcell.className='nosort';
  manaba.addevent(mcell,'dblclick',function (e) {return manaba.insertnext(evtarget(e),fields);});
  row.appendChild(mcell);
  for (var i = 0; i < fields.length;i++) {
  for (var k in fields[i]) {
   var cell = document.createElement('th');
   cell.innerHTML = fields[i][k];
   cell.className = 'head';
   manaba.addevent(cell,'click',function (e) {return manaba.sortrows(evtarget(e));});
   row.appendChild(cell);
  }
  }
  for (var i = 0; i < records.length; i++) {
   manaba.addrow(table,fields,records[i],-1);
  }
 }
 return table;
}

manaba.createHidden = function(name,value,id) {
  var hidden = document.createElement('input');
  hidden.type = 'hidden';
  hidden.id =  id
  hidden.name = name;
  hidden.value = value; 
  return hidden;
}

manaba.appendHidden = function(form,name,value) {
  var hidden = document.createElement('input');
  hidden.type = 'hidden';
  hidden.name = name;
  hidden.value = value;
  form.appendChild(hidden);
  return hidden;
}

manaba.oneobjdragobj = new Array();
manaba.oneobjdragcb = new Array();
manaba.oneobjdragstart = function(event,dragobj,id) {
 if (dragobj == manaba.oneobjdragobj[id]) return false;
 manaba.oneobjdragend(event,dragobj,id);
 manaba.oneobjdragobj[id] = dragobj;
 manaba.oneobjdragcb[id] = function (e) {manaba.oneobjdragend(e,null,id)};
 manaba.addevent(document,'mouseup',manaba.oneobjdragcb[id])
 return false;
};
manaba.oneobjdragover = function(event,dragobj,id,callback){
 if(!manaba.oneobjdragobj[id] || manaba.oneobjdragobj[id] == dragobj) return true;
 if (callback) callback(event,manaba.oneobjdragobj[id]);
 return false;
};
manaba.oneobjdragend = function(event,dragobj,id,callback) {
 if(!manaba.oneobjdragobj[id] || manaba.oneobjdragobj[id] == dragobj) return true;
 if (callback) callback(event,manaba.oneobjdragobj[id]);
 delete manaba.oneobjdragobj[id];
 manaba.removeevent(document,'mouseup',manaba.oneobjdragcb[id]);
 delete manaba.oneobjdragcb[id];
 return false;
}

manaba.rowswap= function(ea, eb){
 var ra = manaba.findParentNode(ea, 'tr');
 var rb = manaba.findParentNode(eb, 'tr');
 var table = manaba.findParentNode(ra, "table");
 var ria = ra.rowIndex;
 var rsa = table.insertRow(ria);
 var rib = rb.rowIndex;
 var rsb = table.insertRow(rib);
 rsa.parentNode.replaceChild( rb, rsa );
 rsb.parentNode.replaceChild( ra, rsb );
}

manaba.base64chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

manaba.encode_base64 = function (str) {
 var slen = str.length;
 var base64 = '';
 var cnt = 0;
 var b = 0;
 for (var i = 0; i < slen; i++) {
  cnt+=2;
  b = b | str.charCodeAt(i) & 0xff;
  base64  += manaba.base64chars.charAt(b >> cnt);
  b = b & (0xff >> (8 - cnt));
  if (cnt == 6) {
   cnt = 0;
   base64  += manaba.base64chars.charAt(b);
   b = 0;
  }
  b = b << 8;
 }
 if (cnt) {
  cnt+=2;
  base64  += manaba.base64chars.charAt(b >> cnt);
  for (;cnt < 8; cnt+=2) {
   base64 += '=';
  }
 }
 return base64;
}

manaba.extractMathJax = function (inputNode, outputNode, in_marker) {
 if (inputNode.nodeType == 3) {
  var t = inputNode.textContent ? inputNode.textContent : inputNode.innerText ? inputNode.innerText : inputNode.data ? inputNode.data : '';
  outputNode.appendChild(document.createTextNode(t));
  return false;
 } else {
  var stop = false;
  var has_marker = false;
  var marker_open = false;
  var marker_close = false;
  if (manaba.hasClass(inputNode, "embedded-mathjax")) {
   var newOutputNode = document.createElement('span');
   newOutputNode.className = "embedded-mathjax";
   outputNode.appendChild(newOutputNode);
   outputNode = newOutputNode;
   in_marker = true;
  } else if (in_marker && inputNode.id && inputNode.id.match('^MathJax-')) {
   if (inputNode.tagName == 'SCRIPT') {
    var type = inputNode.type;
    if (type && type.match('math/tex')) {
     if (type.match('mode.*display')) {
      marker_open = "\\[";
      marker_close = "\\]";
     } else {
      marker_open = "\\(";
      marker_close = "\\)";
     }
    } else {
     stop = true;
    }
   } else {
    stop = true;
   }
  } else if (inputNode.className && inputNode.className.match('^MathJax_')) {
   stop = true;
  }

  if (! stop) {
   if (marker_open) { outputNode.appendChild(document.createTextNode(marker_open)); }
   var cs = inputNode.childNodes;
   if (cs) {
    manaba.forEach(function(c) {
     has_marker = manaba.extractMathJax(c, outputNode, in_marker) || has_marker;
    }, cs);
   }
   if (marker_close) { outputNode.appendChild(document.createTextNode(marker_close)); }
  }
  return in_marker || has_marker;
 }
};

/* permutation query */
manaba.selectPermutation = function (qid, li,val) {
  if(!li.className.match('unchosen'))return;
  var c = document.getElementById(qid);
  var a = c.getElementsByTagName('li');
  var n = -1;
  var defmsg = document.getElementById(qid + '-response').firstChild;
  defmsg.style.display = 'none';
  for(var i=0;i<a.length;i++){
    if(li==a[i]){n=i+1;break;}
  }
  var appendInput = function (id, v) {
    var p = document.getElementById(id);
    if(!p.value){p.value=v}else{p.value+=','+v};
  };
  appendInput(qid + '-input',n);
  appendInput(qid + '-hidden',val);
  li.className = li.className.replace('unchosen', 'chosen');
  var d = document.createElement('div');

  var has_mathjax_marker = false;
  if (manaba.useMathJax) {
   manaba.forEach(function(l) {
    has_mathjax_marker = manaba.extractMathJax(l, d) || has_mathjax_marker;
   }, li.getElementsByTagName('label') || []);
  } else {
   var t = '';
   var lb = li.getElementsByTagName('label');
   var te = lb[lb.length - 1].childNodes;
   for (var i=0;i<te.length;i++) {
     if (te[i].tagName != 'LABEL') {
       t += te[i].textContent ? te[i].textContent :
         (te[i].innerText ? te[i].innerText : 
           (te[i].data ? te[i].data : '' ) );
     }
   }
   d.appendChild(document.createTextNode(t));
  }

  d.className = 'permutation-response-field';
  document.getElementById(qid + '-response').appendChild(d);
  if (has_mathjax_marker) {
   MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
  }
}
manaba.resetPermutation = function (qid) {
  var c = document.getElementById(qid);
  var r = document.getElementById(qid + '-response');
  document.getElementById(qid + '-input').value = '';
  document.getElementById(qid + '-hidden').value = '';
  var defmsg = document.getElementById(qid + '-response').firstChild;
  defmsg.style.display = 'block';
  var a = c.getElementsByTagName('li');
  for(var i=0;i<a.length;i++){
    if(!a[i].className.match('unchosen')){
      a[i].className = a[i].className.replace('chosen', 'unchosen');
    }
  }
  var b = r.getElementsByTagName('div');
  while(b.length > 1){
    var k = b[1];
    k.parentNode.removeChild(k);
  }
}
manaba.undoPermutation = function (qid) {
  var c = document.getElementById(qid);
  var r = document.getElementById(qid + '-response');
  var rForm = document.getElementById(qid + '-input');
  var hForm = document.getElementById(qid + '-hidden');
  var rValue = rForm.value.match(/[1-9][0-9]*$/);
  if (!rValue) {return;}
  rValue = rValue[0];
  rForm.value = rForm.value.replace(/,?[1-9][0-9]*$/, '');
  hForm.value = hForm.value.replace(/,?[1-9][0-9]*$/, '');
  if (hForm.value == '') {
    var defmsg = document.getElementById(qid + '-response').firstChild;
    defmsg.style.display = 'block';
  }
  var a = c.getElementsByTagName('li');
  if(!a[rValue - 1].className.match('unchosen')){
    a[rValue - 1].className = a[rValue - 1].className.replace('chosen', 'unchosen');
  }
  var b = r.getElementsByTagName('div');
  if (manaba.useMathJax) {
   b = manaba.grep(function(e){return manaba.hasClass(e, 'permutation-response-field');}, b);
  }
  b[b.length -1].parentNode.removeChild(b[b.length -1]);
}

manaba.form_submitted = 0;
manaba.unblock_chattering = function() {
  manaba.form_submitted = 0;
}
manaba.block_chattering = function() {
 if(!manaba.form_submitted){
  manaba.form_submitted = 1;
  return true;
 } else {
  return false;
 }
}
manaba.block_button_chattering = function(button) {
 if(!manaba.form_submitted){
  button.blur();
  manaba.form_submitted = 1;
  return true;
 } else {
  return false;
 }
}

if (!manaba.textdefs) manaba.textdefs = {};

manaba.addTextdefs = function (def) {
 if (typeof(def) == 'object') {
  for (var id in def) {
   manaba.textdefs[id] = def[id];
  }
 }
}

manaba.getSD = function (id, defaultText) {
 var lang = gLang ? gLang : 'ja';
 var textdef;
 if (manaba.textdefs[id]) {
  textdef = manaba.textdefs[id][lang];
 }
 var str = '';
 if (!textdef) {
  if (defaultText) {
   if (typeof(defaultText) == 'object') {
    if (defaultText[gLang]) textdef = defaultText[gLang];
   } else {
    textdef = defaultText;
   }
  }
 }
 if (!textdef) return '';
 if (typeof(textdef) == 'function') {
  var args = [];
  if (arguments.length > 2) {
   args = Array.prototype.slice.call(arguments).slice(2);
  }
  str = textdef.apply(null,args);
 } else {
  str = textdef;
 }
 return str;
}

// should be called in event handler.
manaba.userballoon = function(useroid, e) {
 return manaba.balloon('userpanel_' + useroid + '_profile', e, {
  "uniqueclass":"user" + useroid,
  "offset_top": 15,
  "offset_left": -36,
  "origin_left":"centerh",
  "init_id":"userballoon_loading_skelton",
  "className": "userballoon"
 });
};

// should be called in event handler.
manaba.contentsballoon = function(url, e, errorurl) {
 return manaba.balloon(url, e, {
  "uniqueclass":"contents",
  "className": "contentsballoon",
  "errorurl" : errorurl
 });
};

// should be called in event handler.
manaba.bbsballoon = function(url, e, errorurl) {
 return manaba.balloon(url, e, {
  "uniqueclass":"bbs",
  "className": "bbsballoon",
  "typesetMathJax": manaba.useMathJax,
  "errorurl" : errorurl
 });
};

// should be called in event handler.
manaba.linkballoon = function(e) {

 var aelem=manaba.findParentNode(evtarget(e), "a");
 if (aelem && ("href" in aelem)) {
  var url = aelem.href;
  return manaba.balloon(url, e, {
   "className":"linkballoon",
   "uniqueclass":"link",
   "ondisplay": function(balloonnode) {
    var forms = balloonnode.getElementsByTagName('form');
    forms.length > 0 && forms[0].submit();
   }
  });
 }
};

// should be called in event handler.
manaba.onlinehelpballoon = function(e) {
 var root = evtarget(e);
 var divelem=manaba.findFirstChildNode(root, "div", {
  "test":function(c) { return manaba.hasClass(c, "help-box-panel") }
 });
 return manaba.flipballoon(divelem, e, {
  "uniqueclass":"onlinehelp"
 ,"uniquetoggleex":true
 });
};

// existing balloons
manaba.gballoons = {};

// helper function for balloons
manaba.balloon = function(url, e, opt) {

 var target=(opt && ("override_target" in opt)) ? opt.override_target : evtarget(e);
 var pos = manaba.boundingClientRectI(target, true);
 var top = (opt && ("origin_top" in opt)) ? pos[opt.origin_top] :  pos.bottom;
 var left = (opt && ("origin_left" in opt)) ? pos[opt.origin_left] :  pos.left;
 if (opt && ("offset_top" in opt)) { top += opt.offset_top; }
 if (opt && ("offset_left" in opt)) { left += opt.offset_left; }

 var uniqueclass = opt && ("uniqueclass" in opt) && opt.uniqueclass;
 var closeonbodyclick = true;
 if (opt && ("closeonbodyclick" in opt)) {
  closeonbodyclick = opt.closeonbodyclick;
 }

 var balloonnode = document.createElement('div');
 if (opt && ("className" in opt)) { balloonnode.className = opt.className; }

 balloonnode.style.position = "absolute";
 //balloonnode.style.overflow = "scroll";
 balloonnode.style.top = "" + top + "px";
 balloonnode.style.left = "" + left + "px";

 if (url != null) {
  var init_node = null;
  if (opt && ("init_id" in opt)) {
   init_node = document.getElementById(opt["init_id"]);
  }
  balloonnode.innerHTML = init_node ? init_node.innerHTML : '<p>NOW LOADING...</p>';
 } else if (opt && ("content_node" in opt) && opt["content_node"]) {
  balloonnode.appendChild(opt["content_node"]);
 }

 var bodynode = document.body;

 var balloon_closer;
 var cleanup = function() {
  if (uniqueclass && manaba.gballoons[uniqueclass] == balloonnode) {
   manaba.gballoons[uniqueclass] = null;
  }
  manaba.removeevent(bodynode, 'click', balloon_closer);
  bodynode.removeChild(balloonnode);
 };

 balloon_closer = function(e) {
  var ctarget = evtarget(e);
  // this balloon is just opened now.
  if (ctarget == target) {
   return;
  }
  // clicked inside this balloon.
  if (manaba.isAncestor(ctarget, balloonnode)) {
   return;
  }
  cleanup();
 };

 try {
  balloonnode["manaba_balloon_cleanup"] = cleanup;
 } catch (ex) {
 }

 if (uniqueclass) {
  var closeonly = false;
  if (opt && "uniquetoggle" in opt && opt["uniquetoggle"] && manaba.gballoons[uniqueclass]) {
   closeonly = true;
  }
  manaba.balloon_close_by_target(manaba.gballoons[uniqueclass]);
  if (closeonly) {
   return false;
  }
  manaba.gballoons[uniqueclass] = balloonnode;
 }

 bodynode.appendChild(balloonnode);
 closeonbodyclick && manaba.addevent(bodynode, 'click', balloon_closer);

 if (url == null) {
  return false;
 }

 var handle_response = function(req) {
  if (req.readyState == 4
      && req.status == 200) {
   var responseText = req.responseText;
   if (req.responseText.indexOf('<!-- MARKER_NOT_LOGGED_IN  -->') >= 0){
    cleanup();
    alert(gLang == 'ja' ? 'ログアウトしました。' : 'Logged out.');
   } else {
    balloonnode.innerHTML = responseText;
    if (opt && ("ondisplay" in opt)) {
     opt.ondisplay(balloonnode);
    }
    if (opt && ("typesetMathJax" in opt) && opt['typesetMathJax']) {
	 MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
    }
   }
   return true;
  } else {
   return false;
  }
 };

 var request = CreateXMLHttpRequest();
 request.onreadystatechange = function () {
  if (handle_response(request)) {
  } else if (request.readyState == 4 && opt && ("errorurl" in opt)) {
   var request2 = CreateXMLHttpRequest();
   request2.onreadystatechange = function () {
    handle_response(request2);
   };
   request2.open ('GET', opt.errorurl, true); 
   request2.send (null);
  }
 };

 request.open ('GET', url, true); 
 request.send (null);
 return false;
};

// helper function for balloons (display flip version)
manaba.flipballoon = function(balloonnode, e, opt) {

 var target=(opt && ("override_target" in opt)) ? opt.override_target : evtarget(e);
 var uniqueclass = opt && ("uniqueclass" in opt) && opt.uniqueclass;
 var closeonbodyclick = true;
 if (opt && ("closeonbodyclick" in opt)) {
  closeonbodyclick = opt.closeonbodyclick;
 }
 var display_on_show = (opt && ("display_on_show" in opt)) ? opt.display_on_show : "block";
 var display_on_hide = (opt && ("display_on_hide" in opt)) ? opt.display_on_show : "none";

 var bodynode = document.body;

 var balloon_closer;
 var cleanup = function() {
  if (uniqueclass && manaba.gballoons[uniqueclass] == balloonnode) {
   manaba.gballoons[uniqueclass] = null;
  }
  manaba.removeevent(bodynode, 'click', balloon_closer);
  balloonnode.style.display = display_on_hide;
 };

 balloon_closer = function(e) {
  var ctarget = evtarget(e);
  // this balloon is just opened now.
  if (ctarget == target) {
   return;
  }
  // clicked inside this balloon.
  if (manaba.isAncestor(ctarget, balloonnode)) {
   return;
  }
  cleanup();
 };

 try {
  balloonnode["manaba_balloon_cleanup"] = cleanup;
 } catch (ex) {
 }

 if (uniqueclass) {
  var closeonly = false;
  if (opt && "uniquetoggle" in opt && opt["uniquetoggle"] && manaba.gballoons[uniqueclass]) {
   closeonly = true;
  }
  if (opt && "uniquetoggleex" in opt && opt["uniquetoggleex"] && manaba.gballoons[uniqueclass] === balloonnode) {
   closeonly = true;
  }
  manaba.balloon_close_by_target(manaba.gballoons[uniqueclass]);
  if (closeonly) {
   return false;
  }
  manaba.gballoons[uniqueclass] = balloonnode;
 }

 balloonnode.style.display = display_on_show;
 closeonbodyclick && manaba.addevent(bodynode, 'click', balloon_closer);
};
manaba.balloon_close = function(e) {
 return manaba.balloon_close_by_target(evtarget(e));
};
manaba.userballoon_close = manaba.balloon_close;

manaba.balloon_close_by_target = function(target) {
 while (target) {
  var cleanup = target["manaba_balloon_cleanup"];
  if (cleanup) {
   cleanup(); return false;
  } else {
   target = target.parentNode;
  }
 }
 return false;
};

manaba.toggleClassTGLPortfolio = function (element, name, id) {
 var chknode = document.getElementById(id);
 if (chknode.style.display == 'none') {
  if (manaba.hasClass(element, name)) {
   manaba.removeClass(element, name);
  } else {
   manaba.addClass(element, name);
  }
  return true;
 }
 return false;
};

manaba.tglportfolio = function(useroid, e) {
 return manaba.tglportfoliolist('user_' + useroid + '_tglportfoliolist?onlybody=1', e, {
  'loading_id':'tglportfolio_loading_id',
  'result_id':'tglportfolio_result_id'
 });
};

manaba.tglportfoliolist = function(url, e, opt) {
 var loadingnode = null;
 var resultnode = null;

 if (opt && ('loading_id' in opt)) {
  loadingnode = document.getElementById(opt['loading_id']);
 }
 if (opt && ('result_id' in opt)) {
  resultnode = document.getElementById(opt['result_id']);
 }
 if (resultnode.innerHTML != '') {
  resultnode.innerHTML = '';
  resultnode.style.display = 'none';
  loadingnode.style.display = 'none';
  return false;
 }
 loadingnode.style.display = 'block';

 if (url == null) {
  return false;
 }

 var handle_response = function(req) {
  if (req.readyState == 4
      && req.status == 200) {
   var responseText = req.responseText;
   if (req.responseText.indexOf('<!-- MARKER_NOT_LOGGED_IN  -->') >= 0){
    alert(gLang == 'ja' ? 'ログアウトしました。' : 'Logged out.');
    resultnode.style.display = 'none';
    loadingnode.style.display = 'none';
   } else {
    resultnode.innerHTML = responseText;
    resultnode.style.display = 'block';
    loadingnode.style.display = 'none';
   }
   return true;
  } else {
   return false;
  }
 };

 var request = CreateXMLHttpRequest();
 request.onreadystatechange = function () {
  if (handle_response(request)) {
  } else if (request.readyState == 4 && opt && ('errorurl' in opt)) {
   var request2 = CreateXMLHttpRequest();
   request2.onreadystatechange = function () {
    handle_response(request2);
   };
   request2.open ('GET', opt.errorurl, true); 
   request2.send (null);
  }
 };

 request.open ('GET', url, true); 
 request.send (null);
 return false;
};

manaba.UpdateInnerHTMLFromURL = function (node, src) {
 var req = CreateXMLHttpRequest();
 req.onreadystatechange = function () {
  if (req.readyState == 4) {
   if (req.status != 200) {
    node.innerHTML = 'load failed';
    return;
   }
   try {
    var ret = JSON.parse(req.responseText);
   } catch (e) {
    ret = {};
   }
   if (ret.status != 'ok') {
    node.innerHTML = 'load failed';
    return;
   }
   node.innerHTML = ret.html;
   return;
  }
 };
 req.open ('GET', src + '?uihfutime=' + parseInt(new Date()/1000), true);
 req.send (null);
}

manaba.XHRCallWithParsedJSON = function (uri,onsuccess,onfail) {
 var req = CreateXMLHttpRequest();
 req.onreadystatechange = function () {
  if (req.readyState == 4) {
   if (req.status != 200) {
    alert(gLang == 'ja' ? 'エラー' : 'Request Error');
    if (onfail) { onfail(req) };
    return;
   }
   var ret;
   try {
    ret = JSON.parse(req.responseText);
   } catch (e) {
    try {
     if (req.responseText.indexOf('<!-- MARKER_NOT_LOGGED_IN  -->') >= 0){
      alert(gLang == 'ja' ? 'ログアウトしました。' : 'Logged out.');
     }
    } catch (e) {
    }
   }
   if (ret) {
    if (onsuccess) { onsuccess(ret); }
   } else {
    if (onfail) { onfail(req) };
   }
   return;
  }
 };
 req.open ('GET', uri + ( uri.indexOf('?') >= 0 ? '&' : '?') +
  'refresh=' + manaba.SystemUnixTime + (manaba.ajaxcounter++), true);
 req.send (null);
};

manaba.spentclock_init = function(node, base, callback, basedate){
 var ret = new Object;
 var format02d = function(x) { return x < 10 ? ("0" + x) : x; }
 var currenttime = function() { var d = new Date(); return d.getTime(); }
 var loadtime = basedate ? basedate.getTime() : currenttime();
 var doupdate = true;
 var spent;
 base = parseInt(base) || 0;

 ret.start = function() {
  if (doupdate) {
   ret.update();
   setTimeout(ret.start, 1000);
  }
 };

 ret.update = function(freeze){
  var spenttmp;
  if (freeze) {
   spenttmp = base;
  } else {
   var diff = currenttime() - loadtime;
   spenttmp = spent = base + Math.round(diff / 1000);
  }
  var ss = format02d(spenttmp % 60);
  spenttmp = Math.floor(spenttmp / 60);
  var mm = format02d(spenttmp % 60);
  spenttmp = Math.floor(spenttmp / 60);
  var hh = format02d(spenttmp);

  while (node.firstChild) {
   node.removeChild (node.firstChild);
  }
  node.appendChild(document.createTextNode(
   hh + ":" + mm + ":" + ss
  ));
  if (callback) doupdate = callback(spent);
  return spent;
 };

 ret.stop = function() {
  doupdate = false;
  return spent;
 };

 return ret;
};

manaba.confirmObject = (function(divObj) {
 return function (id) {
  if (!divObj[id]) {
   divObj[id] = document.getElementById(id);
   if (!divObj[id]) return;
   divObj[id].parentNode.removeChild(divObj[id]);
  }
  var clone = divObj[id].cloneNode(true);
  clone.style.display = 'block';
  return clone;
 };
})({});

if (! manaba.initializedOnMessage) {
 manaba.initializedOnMessage = 1;
 var onevent = function(e) {
  var validorigin = manaba.fold(function(origin, valid) {
   return valid || (origin != '' && origin == e.origin);
  }, false, manaba.postMessageOrigin ? manaba.postMessageOrigin.split(',') : []);
  var data = e.data;
  if (typeof(data) == 'string') {
   return;
  }
  if ('callbackName' in data && 'callbackArg' in data) {
   if (validorigin) {
    manaba.callback_functions[data['callbackName']](data['callbackArg']);
   } else {
    alert("postMessage from bad origin: " + e.origin);
   }
  }
 };
 if (window.postMessage) {
  manaba.addevent(window, 'message', onevent);
 } else if (window.document.postMessage) {
  manaba.addevent(window.document, 'message', onevent);
 }
}

manaba.dialogSessionLoggedout = function(msg) {
 if (!msg) {
  if (manaba.sessioncheck_dialogmessageV2) {
   msg = (gLang == "ja" ?
     "セッションが無効になりました。入力内容は保存されていません。\n「OK」をクリックしてログイン画面を開き、再度ログインしてください。\n※ログイン後、再びこの画面に戻ると操作を続行できます。" :
     "Your session is invalid. The content you entered is not saved.\nClick \"OK\" to open the login screen and login again.\n* After logging in, you can continue operation by returning to this screen again.");
  } else {
   msg = (gLang == "ja" ?
     "ログアウトしています。入力内容は保存されていません。\n「OK」をクリックしてログイン画面を開き、再度ログインしてください。\n※ログイン後、再びこの画面に戻ると操作を続行できます。" :
     "Your account is logged out. The content you entered is not saved.\nClick \"OK\" to open the login screen and login again.\n* After logging in, you can continue operation by returning to this screen again.");
  }
 }
 if (confirm(msg)) {
  window.open("home", "_blank"); 
 }
};

manaba.dialogSessionOffline = function(msg) {
 if (!msg) {
  msg = (gLang == "ja" ?
    "端末がオフライン状態です。" :
    (manaba.reproduct444313 ? 'No internet connection.' : 'No Internet connection.')
  );
 }
 alert(msg);
};

manaba.sessionalert = {};
manaba.sessionalert.formupdater_use = false;
manaba.sessionalert.dialogdisplayed = false;
manaba.sessionalert.banner_added = false;
manaba.sessionalert.state_active = false;
manaba.sessionalert.seschk_errwait = 30000;
manaba.sessionalert.seschk_use = null;
manaba.sessionalert.seschk_activelimittime = null;
manaba.sessionalert.seschk_interval = null;
manaba.sessionalert.timeid = null;

manaba.sessionalert.getNow = function() {
 return Math.ceil((new Date()).getTime() / 1000);
} 

manaba.sessionalert.setActiveLimitTime = function() {
 this.seschk_activelimittime = (this.state_active && manaba.sessionalert_active_limit) ?
   this.getNow() + manaba.sessionalert_active_limit : 0;
};

manaba.sessionalert.addevent = function() {
 var mybody = document.getElementsByTagName('body')[0];
 var state_focus = true;
 manaba.addevent(window, 'focus', function() {
  state_focus = true;
  manaba.sessionalert.activate();
 });
 manaba.addevent(window, 'blur', function() {
  state_focus = false;
  manaba.sessionalert.deactivate();
 });
 manaba.addevent(mybody, 'mouseenter', function() {
  manaba.sessionalert.activate();
 });
 manaba.addevent(mybody, 'mouseleave', function() {
  if (!state_focus) {
   manaba.sessionalert.deactivate();
  }
 });
};

manaba.sessionalert.activate = function() {
 if (this.state_active) return;
 this.state_active = true;
 this.seschk_interval = manaba.sessionalert_active_interval;
 if (this.timeid) {
  clearTimeout(this.timeid);
  this.timeid = null;
 }
 if (manaba.hasClass(document.body, manaba.sessionalert_loggedoutclass)) {
  this.setActiveLimitTime();
  this.timeid = window.setTimeout(manaba.sessionalert.sessionCheck, 1000);
 } else {
  this.seschk_activelimittime = 0;
 }
};

manaba.sessionalert.deactivate = function() {
 if (!this.state_active) return;
 this.state_active = false;
 this.seschk_activelimittime = 0;
 this.seschk_interval = this.formupdater_use ? 0 : manaba.sessionalert_passive_interval;
};

manaba.sessionalert.setNextCheck = function(addwait) {
 if (!addwait) {
  addwait = 0;
 }
 if (this.seschk_activelimittime && this.getNow() > this.seschk_activelimittime) {
  // passive と同じ条件に値変更
  this.seschk_activelimittime = 0;
  this.seschk_interval = this.formupdater_use ? 0 : manaba.sessionalert_passive_interval;
 }
 if (this.seschk_interval) {
  if (this.timeid) {
   clearTimeout(this.timeid);
   this.timeid = null;
  }
  this.timeid = window.setTimeout(manaba.sessionalert.sessionCheck, this.seschk_interval + addwait);
 }
}

manaba.sessionalert.dispSessionLoggedout = function(msg) {
 if (manaba.hasClass(document.body, manaba.sessionalert_loggedoutclass)) return;

 manaba.addClass(document.body, manaba.sessionalert_loggedoutclass);
 if (!this.dialogdisplayed) { // dialog 初回時のみ実行
  manaba.dialogSessionLoggedout(msg);
  this.dialogdisplayed = true;
 }
 if (this.seschk_use === null) { // 初回時のみ実行
  if (manaba.sessionalert_active_interval && (this.formupdater_use || manaba.sessionalert_passive_interval)) {
   this.seschk_use = true;
   this.addevent();
  } else {
   this.seschk_use = false;
  }
 }
 if (this.seschk_use) {
  this.setActiveLimitTime();
  this.setNextCheck();
 }
};

manaba.sessionalert.sessionCheck = function() {
 var myself = manaba.sessionalert;
 myself.timeid = null;
 if (document.visibilityState !== 'visible') return;

 var dispbanner = manaba.hasClass(document.body, manaba.sessionalert_loggedoutclass);
 if (manaba.sessionalert_offlineclass && !navigator.onLine) {
  myself.dispSessionOffline();
  if (dispbanner) {
   myself.setNextCheck();
  }
  return;
 }
 if (!dispbanner) return;

 var request = CreateXMLHttpRequest();
 request.onreadystatechange = function() {
  if (request.readyState == 4) {
   if (request.status == 200) {
    try {
     var jsonobj = JSON.parse(request.responseText);
     if ("MyOID" in jsonobj && jsonobj["MyOID"]) {
      manaba.removeClass(document.body, manaba.sessionalert_loggedoutclass);
      return;
     }
    } catch(e) {
     //console.log(e);
    }
   }

   var redirected = false;
   var e_other = false;
   if (manaba.sessionalert_offlineclass && !navigator.onLine) {
    myself.dispSessionOffline();
   } else if (manaba.sessioncheck_checkredirect) {
    if (request.responseURL) {
     if (request.responseURL.indexOf(requesturl) == -1) {
      redirected = true;
     }
    } else {
     redirected = true; // unknown
    }
    if (!redirected) {
     e_other = true;
    }
   } else {
    e_other = true;
   }

   var addwait = 0;
   if (redirected) {
    // assume logged out
   } else if (request.status >= 400) {
    addwait = myself.seschk_errwait;
   }
   myself.setNextCheck(addwait);
  }
 };
 
 var requesturl = 'schk_?refresh=' + myself.getNow();
 request.open('GET', requesturl, true);
 request.send(null);
};

manaba.sessionalert.dispSessionOffline = function(msg) {
 if (manaba.hasClass(document.body, manaba.sessionalert_offlineclass)) return;
 manaba.addClass(document.body, manaba.sessionalert_offlineclass);
 if (!this.dialogdisplayed) {
  manaba.dialogSessionOffline(msg);
  this.dialogdisplayed = true;
 }
};

manaba.sessionalert.addBanner = function() { 
 if (this.banner_added) return; 

 var prefix = 'alertbanner_';
 var addblock = function(bodyclass, content) {
  var id = prefix + bodyclass;
  if (bodyclass && !document.getElementById(id)) {
   var obj = document.createElement('div');
   obj.setAttribute('id', id);
   obj.innerHTML = content;
   document.body.appendChild(obj);
  }
 };

 // バナー追加
 addblock(
   manaba.sessionalert_loggedoutclass, gLang == "ja" ?
   '<p>セッションが無効になっています。<br>回答を保存するために再度ログインしてください。<br>※ポップアップウィンドウが開きます。<br>'
     + '<a href="home" target="_blank">ログインする</a></p>' :
   '<p>Your session is invalid or has expired.<br>Please log in again to save your answers.<br>* A popup will appear.<br>'
     + '<a href="home" target="_blank">Log in</a></p>'
 );
 addblock(
   manaba.sessionalert_offlineclass, gLang == "ja" ?
   '<p>端末がオフライン状態です。<br>インターネットへの接続状態を確認してください。</p>' :
   (manaba.reproduct444313 ?
     '<p>No internet connection.<br>Pleas check your Internet connection.</p>' :
     '<p>No Internet connection.<br>Please check your Internet connection.</p>') 
 );
 // イベント追加
 if (manaba.sessionalert_offlineclass) {
  manaba.addevent(window, 'online', function() {
   manaba.removeClass(document.body, manaba.sessionalert_offlineclass);
  });
 }

 this.banner_added = true;
};

manaba.sessioncheck_opt = {};
manaba.sessioncheck_opt.banner_use = null;

manaba.sessioncheck = function(opt) {
 var sessioncheck_required = true;
 var ses_alert = manaba.sessionalert;
 if (manaba.sessioncheck_opt.banner_use === null) { // 初回時のみ実施
  if (manaba.sessionalert_loggedoutclass) {
   manaba.sessioncheck_opt.banner_use =
     (ses_alert.formupdater_use || (manaba.sessionalert_active_interval && manaba.sessionalert_passive_interval)) ?
      true : false;
  } else {
   manaba.sessioncheck_opt.banner_use = false;  
  }
  if (manaba.sessioncheck_opt.banner_use || manaba.sessionalert_offlineclass) {
   ses_alert.addBanner();
  }
 }

 var now = Math.ceil((new Date()).getTime() / 1000);
 if (manaba.sessioncheck_opt.banner_use &&
   (manaba.hasClass(document.body, manaba.sessionalert_loggedoutclass) || manaba.hasClass(document.body, manaba.sessionalert_offlineclass)) ) {
  sessioncheck_required = true;
 } else if (manaba.sessioncheck_last && manaba.sessioncheck_interval) {
  var sessioncheck_skipto = parseInt( manaba.sessioncheck_last, 16 ) + manaba.sessioncheck_interval;
  sessioncheck_required = now > sessioncheck_skipto;
 }
 if (! sessioncheck_required) {
  return true;
 }
 var requesturl = 'schk?refresh='+now;
 var request = CreateXMLHttpRequest ();
 request.open('GET', requesturl, false);
 var redirected = false;
 try {
  request.send(null);
 } catch (e) {
  if (manaba.sessionalert_offlineclass && !navigator.onLine) {
   ses_alert.dispSessionOffline();
   return false;
  } else if (manaba.sessioncheck_skipontimeout && e.name && e.name == 'TimeoutError') {
   return true;
  } else if (manaba.sessioncheck_checkredirect) {
   if (request.responseURL) {
    if (request.responseURL.indexOf(requesturl) == -1) {
     redirected = true;
    }
   } else {
    // unknown
    redirected = true;
   }
   if (!redirected) {
    throw e;
   }
  } else {
   throw e;
  }
 }
 var ok = false;
 var jsonobj;
 if (request.status == 200) {
  var jsonsrc = request.responseText;
  jsonobj = manaba.json.parse(jsonsrc);
  if ("MyOID" in jsonobj && jsonobj["MyOID"]) {
   ok = true;
   manaba.sessioncheck_last = jsonobj["sessioncheck_last"];
  }
 } else if (redirected) {
  // assume logged out
 } else {
  if (opt && "onerr" in opt) {
   return opt["onerr"]();
  } else {
   alert(gLang == "ja" ? "ネットワークエラー" : "Networking Error");
   return false;
  }
 }

 if (ok) {
  if (manaba.sessioncheck_opt.banner_use) {
   manaba.removeClass(document.body, manaba.sessionalert_loggedoutclass);
  }
  if (opt && "onok" in opt) {
   return opt["onok"]();
  } else {
   return true;
  }
 } else {
  if (opt && "onng" in opt) {
   return opt["onng"]();
  } else {
   if (manaba.sessioncheck_opt.banner_use) {
    ses_alert.dispSessionLoggedout();
   } else {
    manaba.dialogSessionLoggedout();
   }
   return false;
  }
 }
};

manaba.childrenWithClasses = function (parentId, classNames) {
 return manaba.map(
  function (c) {
   var names = c.className.split(/ +/);
   var p = function (e) { return manaba.elem(e, names); };
   return { element: c, withClasses: manaba.all(p, classNames) };
  },
  document.getElementById(parentId).children
 );
};

manaba.filterChildrenByValues = function (parentId, valueToClassNamesAndValueIds) {
 manaba.map(
  function (x) { x.element.style.display = x.withClasses ? 'block' : 'none'; },
  manaba.childrenWithClasses(
   parentId,
   manaba.concatMap(
    function (x) {
     return x.valueToClassNames(document.getElementById(x.valueId).value);
    },
    valueToClassNamesAndValueIds
   )
  )
 );
 return false;
};

manaba.checkAllFilteredChildrenByValues = function (check, parentId, valueToClassNamesAndValueIds) {
 manaba.map(
  function (x) {
   if (x.element.style.display == 'block') {
    manaba.map(
     function (x) {
      if (x.tagName.toLowerCase() == 'input' &&
          x.type.toLowerCase() == 'checkbox') {
       x.checked = check;
      }
     },
     x.element.children
    )
   }
  },
  manaba.childrenWithClasses(
   parentId,
   manaba.concatMap(
    function (x) {
     return x.valueToClassNames(document.getElementById(x.valueId).value);
    },
    valueToClassNamesAndValueIds
   )
  )
 );
 return false;
};

manaba.fireMouseEvent = function(elem, evname) {
 if (elem.fireEvent) {
  return elem.fireEvent("on" + evname);
 } else {
  var e = document.createEvent("MouseEvents");
  e.initEvent(evname, false, true);
  elem.dispatchEvent(e);
 }
};
manaba.fireHTMLEvent = function(elem, evname) {
 if (elem.fireEvent) {
  return elem.fireEvent("on" + evname);
 }
 var evt;
 try {
  evt = new Event(evname, {"bubbles":false, "cancelable":true});
 } catch(e) {
  evt = document.createEvent("HTMLEvents");
  evt.initEvent(evname, false, true);
 }
 return elem.dispatchEvent(evt);
};

manaba.findFirstChild = function(elem, pred) {
 if (pred(elem)) {
  return elem;
 } else {
  return manaba.any( function(c) { return manaba.findFirstChild(c, pred); }, elem.childNodes || [] );
 }
};

manaba.findFirstChild2 = function(root, pred) {
 var stack = [ root ];
 while (stack.length) {
  var elem = stack.pop();
  if (pred(elem)) {
   return elem;
  }
  if (elem.childNodes) {
   for (var i1 = elem.childNodes.length; i1 > 0; --i1) {
    stack.push(elem.childNodes[i1 - 1]);
   }
  }
 }
 return false;
};

manaba.findFirstChildNode = function(elem, nodeName, opt) {
 return manaba.findFirstChild2(elem, function(c) {
  if (c.nodeName.toLowerCase () == nodeName) {
   if (opt && opt['test'] && ! opt['test'](c)) {
    return false;
   } else {
    return c;
   }
  } else {
   return false;
  }
 });
};

manaba.clickElement = function(elem) {
 return manaba.fireMouseEvent(elem, "click");
};

manaba.clickChildAnchor = function(elem,opt) {
 var event = opt ? opt['event'] : null;
 var target = event ? evtarget(event) : null;

 var panchor = manaba.findParentNode(target, "a")
 if (panchor) {
  return true;
 }

 var opt2 = {};
 if (opt && opt['href']) {
  opt2['test'] = function(a){
   var href=a.getAttribute('href',2);
   return href && href==opt['href'];
  };
 }

 var canchor = manaba.findFirstChildNode(elem, "a", opt2);
 if (canchor) {
  return manaba.clickElement(canchor);
 } else {
  return false;
 }
};

manaba.register_parsedjson_callback = function(cbname, opt) {
 if (typeof manaba.callback_functions != "object") {
  manaba.callback_functions = {};
 }
 var cb_begin = opt['begin'];
 var cb_end = opt['end'];
 manaba.callback_functions[cbname] = function(json) {
  var resobj;
  try {
   resobj = manaba.json.parse(json);
  } catch (e) {
    alert("json parse error.\n" + e.name + ": " + e.message + "\nresponseText: " + json);
  }
  if (resobj && cb_begin && cb_begin(resobj)) {
   // do nothing
  } else if (resobj['err']) {
   var text = manaba.fold( function(msg, accum) {
    return accum + msg + "\n";
   }, '', resobj['err']);
   alert(text);
  }
  if (cb_end) {
   cb_end(resobj);
  }
 };
};

manaba.restoreTableSortField = function () {
	if (!localStorage) return false;
	var tables;
	if (document.getElementsByClassName) {
		tables = document.getElementsByClassName('sorttable');
	} else {
		tables = new Array();
		var candidate = document.getElementsByTagName('table');
		for (var i = 0; i < candidate.length; i++) {
			if (manaba.hasClass(candidate[i],'sorttable')) tables.push(candidate[i]);
		}
	}
	var href = new String(window.location.href);
	href = href.match(/[^/]+$/);
	if (href) href = new String(href[0]);
	else return false;
	href = href.match(/^[^?#]+/);
	if (href) href = new String(href[0]);
	else return false;
	for (var i = 0; i < tables.length; i++) {
		var table = tables[i];
		var suffix = table.id || 'manabatablesort';
		suffix = suffix.replace(/^manabatablesort/,'');
		var lskey = 'manaba.tablesort.' + suffix + '.' + href;
		var lsvalue = localStorage.getItem(lskey);
		var targetcell;
		var asc;
		if (lsvalue && table.tagName == 'TABLE') {
			lsvalue = lsvalue.split(',');
			if (lsvalue.length == 3) {
				asc = lsvalue[0];
				var tr = table.rows[lsvalue[1]];
				if (tr) {
					targetcell = tr.cells[lsvalue[2]];
				}
			}
		}
		if (targetcell) {
			manaba.clickElement(targetcell);
			if (asc == 0) manaba.clickElement(targetcell);
		} else {
			localStorage.removeItem(lskey);
		}
	}
};

manaba.tableSort = function (self, sortfunc, count, suffix, rowoffset) {
  if (!suffix) suffix = '';
  var tmpcurrent = document.getElementById('tablesortcurrent' + suffix);
  var asc = 1;
  if (tmpcurrent == self) {
    if (manaba.hasClass(self,'manabats_asc')) {
      manaba.replaceClass(self,'manabats_asc','manabats_desc');
      asc = 0;
    } else {
      manaba.removeClass(self,'manabats_desc');
      manaba.addClass(self,'manabats_asc');
    }
  } else {
    if (tmpcurrent) {
      manaba.removeClass(tmpcurrent,'manabats_asc');
      manaba.removeClass(tmpcurrent,'manabats_desc');
      tmpcurrent.id='';
    }
    manaba.addClass(self,'manabats_asc');
  }
  self.id = "tablesortcurrent" + suffix;
  var td = self;
  while (td) {
   if (td.nodeName.toLowerCase () == 'td' || td.nodeName.toLowerCase () == 'th') {
    break;
   }
   td = td.parentNode;
  }
  if (!td) return false;
  var tr = manaba.findParentNode(td, 'tr');
  var table = manaba.findParentNode(tr, 'table');
  var tbody = table.getElementsByTagName('tbody')[0];
  var start = tr.rowIndex + (td.rowSpan || 1) + (rowoffset || 0);
  var end = table.rows.length;
  if (!count) count = 0;
  count = parseInt(count);
  if (count > 0) end = start + count;
  else if (count < 0) end = end + count;
  if (start >= end) return false;
  var sort = new Array();
  var after = new Array();
  var targetIndex = 0;
  for( var i = 0; i < td.cellIndex; i++ ) {
    targetIndex += table.rows[tr.rowIndex].cells[i].colSpan || 1;
  }
  for( var i = 0; i < targetIndex; i++ ) {
    targetIndex -= (table.rows[start].cells[i].colSpan || 1) - 1;
  }
  var targetIndexes = new Array();
  var tdcolSpan = table.rows[tr.rowIndex].cells[td.cellIndex].colSpan || 1;
  for( var i = 0; i < tdcolSpan; ) {
    targetIndexes.push(targetIndex + i);
    var newindex = targetIndex + i;
    i += table.rows[start].cells[newindex].colSpan || 1;
  }
  for( var i = start; i < table.rows.length; i++ ) {
    if (i < end) {
      var cell = table.rows[i].cells[targetIndex];
      if (cell) {
        var text = '';
        for( var j = 0; j < targetIndexes.length; j++ ) {
          var nowc = table.rows[i].cells[targetIndexes[j]];
          var t = nowc.textContent ? nowc.textContent : nowc.innerText ? nowc.innerText : nowc.data ? nowc.data : '';
          text += t.replace(/^(\s|　)+|(\s|　)+$/g, '');
        }
        if (sortfunc == 'number' || sortfunc == 'numberdescfirst') {
          text = text.match(/-?[0-9]+/);
          if(!text) text = "0";
        }
        sort.push({innerText : text, row : table.rows[i], index : i});
      } else {
        after.push({row : table.rows[i]});
      }
    } else {
      after.push({row : table.rows[i]});
    }
  }
  sort = sort.sort(function (a,b) {
    var cmp;
    if (sortfunc == 'number') {
      var v1 = parseInt(a.innerText);
      var v2 = parseInt(b.innerText);
      var cmp = v1 == v2 ? 0 : v1 > v2 ? 1 : -1;
    } else if (sortfunc == 'numberdescfirst') {
      var v1 = parseInt(a.innerText);
      var v2 = parseInt(b.innerText);
      var cmp = v1 == v2 ? 0 : v1 > v2 ? -1 : 1;
    } else { // 'string'
      var v1 = String(a.innerText);
      var v2 = String(b.innerText);
      cmp = v1.localeCompare(v2);
    }
    if (!asc) cmp = -cmp;
    if (!cmp) cmp = a.index > b.index ? 1 : -1;
    return cmp;
  });
  var newtbody=document.createElement('tbody');
  for( var i = 0; i < start; i++ ) {
    newtbody.appendChild(table.rows[0]);
  }
  for( var i = 0; i < sort.length; i++ ) {
    var row = sort[i].row;
    if ((i + 1) % 2) {
      if (manaba.hasClass(row,'row0')) manaba.replaceClass(row,'row0','row1');
      if (manaba.hasClass(row,'row')) manaba.replaceClass(row,'row','row1');
    } else {
      if (manaba.hasClass(row,'row1')) manaba.replaceClass(row,'row1','row0');
      if (manaba.hasClass(row,'row')) manaba.replaceClass(row,'row','row0');
    }
    newtbody.appendChild(row);
  }
  for( var i = 0; i < after.length; i++ ) {
    newtbody.appendChild(after[i].row);
  }
  table.replaceChild(newtbody,tbody);
  if (manaba.storeTableSortField && localStorage) {
    var href = new String(window.location.href);
    href = href.match(/[^/]+$/);
    if (href) href = new String(href[0]);
    else return false;
    href = href.match(/^[^?#]+/);
    if (href) href = new String(href[0]);
    else return false;
    var lskey = 'manaba.tablesort.' + suffix + '.' + href;
    localStorage.setItem(lskey,asc + ',' + tr.rowIndex + ',' + td.cellIndex);
  }
  return false;
};

manaba.newsDialog = {
		show : function () {
			manaba.tpanel('home_unreadnewslist_showdialog');	
		} ,
		close : function () {
			manaba.tpanel_close();
		} ,
    setHide : function () {
			manaba.ajaxgetbody('home' , function () {manaba.tpanel_close();} , 'postedHideFlag=1' , 'POST' , null , 'urlencode');
    } ,
    unsetHide : function () {
			manaba.ajaxgetbody('home' , function () {manaba.tpanel_close();} , 'postedHideFlag=0' , 'POST' , null , 'urlencode');
    }
}

manaba.MatrixSelector = (function () {

    function MatrixSelector(element, name, cols, rows, options) {
        this._element = element;
        this._name = name;
        this._cols = cols;
        this._rows = rows;
        this._cells = new Object();
        var cells = this._cells;
        forM_(cols, function (col) { cells[col.value] = new Object(); });
        forM_ (element.childNodes, function (child) { element.removeChild(child); });
        manaba.addClass(element, 'matrix_selector');
        var tbody = document.createElement('tbody');
        manaba.addClass(tbody, 'matrix_selector__body');
        {
            var tr = document.createElement('tr');
            manaba.addClass(tr, 'matrix_selector__col');
            {
                var th = document.createElement('th');
                manaba.addClass(th, 'matrix_selector__toggle_all');
                if (options && options['labelall']) {
                 th.appendChild(document.createTextNode('All'));
                }
                tr.appendChild(th);
                th.onclick = function () {
                    var selected_all = all(function (row) { return all(function (col) { return manaba.hasClass(cells[col.value][row.value].td, 'selected');}, cols);}, rows);
                    forM_(cols, function (col) { forM_(rows, function (row) { (selected_all ? deselectCell : selectCell)(cells[col.value][row.value]);});});
                };
            }
            forM_(cols, function (col) {
                var th = document.createElement('th');
                manaba.addClass(th, 'matrix_selector__toggle_rows');
                tr.appendChild(th);
                th.appendChild(document.createTextNode(col.label));
                th.onclick = function () {
                    var selected_all = all(function (row) { return manaba.hasClass(cells[col.value][row.value].td, 'selected'); }, rows);
                    forM_ (rows, function (row) { (selected_all ? deselectCell : selectCell)(cells[col.value][row.value]); });
                };
            });
            tbody.appendChild(tr);
        }
        forM_(rows, function (row) {
            var tr = document.createElement('tr');
            manaba.addClass(tr, 'matrix_selector__col');
            {
                var th = document.createElement('th');
                manaba.addClass(th, 'matrix_selector__toggle_cols');
                tr.appendChild(th);
                th.appendChild(document.createTextNode(row.label));
                th.onclick = function () {
                    var selected_all = all(function (col) { return manaba.hasClass(cells[col.value][row.value].td, 'selected'); }, cols);
                    forM_ (cols, function (col) { (selected_all ? deselectCell : selectCell)(cells[col.value][row.value]); });
                };
            }
            forM_(cols, function (col) {
                var td = document.createElement('td');
                manaba.addClass(td, 'matrix_selector__cell');
                tr.appendChild(td);
                var input = document.createElement('input');
                manaba.addClass(input, 'matrix_selector__input');
                input.setAttribute('type', 'hidden');
                input.setAttribute('name', name+'['+col.value+']['+row.value+']');
                input.setAttribute('disabled', true);
                td.appendChild(input);
                td.onclick = function () { toggleCell({ td : td, input : input }); };
                cells[col.value][row.value] = { td : td, input : input };
            });
            tbody.appendChild(tr);
        });
        var table = document.createElement('table');
        table.setAttribute('unselectable', 'on');
        manaba.addClass(table, 'matrix_selector__table');
        table.appendChild(tbody);
        element.appendChild(table);
    }

    function enableInput (input) {
        input.removeAttribute('disabled');
        input.setAttribute('value', '✓');
    }

    function disableInput (input) {
        input.setAttribute('disabled', true);
        input.removeAttribute('value');
    }

    function toggleInput (input) {
        input.getAttribute('disabled') ? enableInput(input) : disableInput(input);
    }

    function selectCell (cell) {
        manaba.addClass(cell.td, 'selected');
        enableInput(cell.input);
    }

    function deselectCell (cell) {
        manaba.removeClass(cell.td, 'selected');
        disableInput(cell.input);
    }

    function toggleCell (cell) {
        manaba.toggleClass(cell.td, 'selected');
        toggleInput(cell.input);
    }

    function mapM_ (f, xs) {
        for (var i = 0; i < xs.length; ++i) f(xs[i]);
    }

    function forM_ (xs, f) {
        mapM_(f, xs);
    }

    function foldl (f, e, xs) {
        var result = e;
        for (var i = 0; i < xs.length; ++i) result = f(result, xs[i]);
        return result;
    }

    function all (f, xs) {
        return foldl(function (e, x) { return e && f(x); }, true, xs);
    }

    function select (col, row) {
        selectCell(this._cells[col][row]);
    }

    function deselect (col, row) {
        deselectCell(this._cells[col][row]);
    }

    function toggle (col, row) {
        toggleCell(this._cells[col][row]);
    }

    MatrixSelector.prototype = {
        constructor: MatrixSelector,
        toggle: toggle,
        select: select,
        deselect: deselect
    };

    return MatrixSelector;
} () );

manaba.FlipElementValueById = function (id_value) {
 var e_value = document.getElementById(id_value);

 if (e_value) {
  e_value.value = (e_value.value == "1") ? "0" : "1";
 }

 return false;
};


manaba.d3_generated = {};

manaba.d3dataCache = new Map();
manaba.d3data = function(id, usecache) {
  if (!usecache) {
    var obj = document.getElementById(id);
    return JSON.parse(obj.getAttribute('data-webat-data'));
  }
  if (!manaba.d3dataCache.has(id)) {
    var json = this.d3data(id);
    manaba.d3dataCache.set(id, json);
  }
  return manaba.d3dataCache.get(id);
}

manaba.d3_dispatch_toggle = function (id, chartarg) {
 if(! d3) {
  return;
 }
 if (manaba.d3_generated[id]) {
  manaba.d3chart_cleanup_svg(id);
  manaba.d3_generated[id] = false;
 } else {
  manaba.d3_dispatch(id, chartarg);
 }
};

manaba.d3_dispatch_toggle2 = function (o, id, chartarg) {
 if(! d3) {
  return;
 }
 var img = o.src;
 if (manaba.d3_generated[id]) {
  if (img.match(/button_on-wide-focus\.png$/)) {
   var t = img.replace(/_on/, '_off');
   o.src = t;
  }
  var charttype = chartarg['type'];
  if (manaba.queryresultmask && charttype == 'textarealist') {
    d3.select('#' + id).node().style.display = "none";
  } else {
    manaba.d3chart_cleanup_svg(id);
  }
  manaba.d3_generated[id] = false;
 } else {
  if (img.match(/button_off-wide-focus\.png$/)) {
   var t = img.replace(/_off/, '_on');
   o.src = t;
  }
  var charttype = chartarg['type'];
  if (manaba.queryresultmask && charttype == 'textarealist') {
    manaba.d3chart_cleanup_svg(id);
    d3.select('#' + id).node().style.display = "block";
  }
  manaba.d3_dispatch(id, chartarg);
  if (manaba.useQueryResultResponsive && manaba.hasClass(document.body, 'responsive')) {
    if (manaba.queryresult.responsive.resized) {
      manaba.queryresult.responsive.resized = false;
      manaba.queryresult.responsive.resizeGraphCanvas();
    }
  }
 }
};

manaba.d3_dispatch_on = function (id, chartarg) {
 if(! d3) {
  return;
 }
 if (manaba.d3_generated[id]) {
  return;
 }
 manaba.d3_dispatch(id, chartarg);
};

manaba.d3_chartarg_cache = {};

manaba.d3_dispatch = function (id, chartarg) {
 if(! d3) {
  return;
 }
 var charttype = chartarg['type'];
 if (charttype == 'uri') {
  var chartarg_from_cache = manaba.d3_chartarg_cache[id];
  if (chartarg_from_cache) {
   manaba.d3_dispatch(id, chartarg_from_cache);
  } else {
   var uri = chartarg['uri']
   if (uri) {
    manaba.XHRCallWithParsedJSON(uri,
    function(res) {
     var idlist = res['idlist'];
     manaba.forEach(function(id_in_list) {
      manaba.d3_chartarg_cache[id_in_list] = res['chartargs'][id_in_list];
     }, idlist);
     chartarg_from_cache = manaba.d3_chartarg_cache[id];
     manaba.d3_dispatch(id, chartarg_from_cache);
     if (chartarg['finally']) {
      chartarg['finally']();
     }
    },
    function(req) {
     if (chartarg['finally']) {
      chartarg['finally']();
     }
    });
   }
  }
 } else if (charttype == 'bar') {
  manaba.d3_chart_bar(id, chartarg);
  manaba.d3_generated[id] = true;
 } else if (charttype == 'bar2') {
  manaba.d3_chart_bar2(id, chartarg);
  manaba.d3_generated[id] = true;
 } else if (charttype == 'bar3') {
  manaba.d3_chart_bar3(id, chartarg);
  manaba.d3_generated[id] = true;
 } else if (charttype == 'pie') {
  manaba.d3_chart_pie(id, chartarg);
  manaba.d3_generated[id] = true;
 } else if (charttype == 'line') {
  manaba.d3_chart_line(id, chartarg);
  manaba.d3_generated[id] = true;
 } else if (charttype == 'textarealist') {
  manaba.d3_textarealist(id, chartarg);
  manaba.d3_generated[id] = true;
 }

 if (manaba.queryresultmask && manaba.d3_generated[id]) {
  var masknode = document.getElementById(id.replace('chart','c'));
  if(masknode && masknode.checked) {
    manaba.queryresultmask(masknode);
  }
  if (charttype == 'textarealist') {
    var textmasknode = document.getElementById(id).querySelectorAll("input:checked");
    if (0 < textmasknode.length) {
      for (var i = 0; i < textmasknode.length; ++i) {
        manaba.queryresultmask(textmasknode[i]);
      }
    }
  }
 }
};

manaba.d3chart_cleanup_svg = function (id) {
 var container = d3.select('#' + id);
 var c = container.node();
 while (c.firstChild) {
  c.removeChild (c.firstChild);
 }
 return container;
};

manaba.d3chart_setup_svg = function (id, chartarg) {
 var container = manaba.d3chart_cleanup_svg(id);

 var svg_width = manaba.default_value(chartarg['width'], 200);
 var svg_height = manaba.default_value(chartarg['height'], 200);
 var svg_class = "";
 if (chartarg['kind'] == "queryresult" || chartarg['kind'] == "submitters") {
    svg_class = "webat-chartbox2 webat-chartbox-" + chartarg['type'];
 } else if (chartarg['kind'] == "login" || chartarg['kind'] == "access" || chartarg['kind'] == "collection" ) {
    svg_class = "webat-chartbox-mp webat-chartbox-" + chartarg['type'];
 } else {
    svg_class = "webat-chartbox webat-chartbox-" + chartarg['type'];
 }
 var svg = container.append("svg")
  .attr("width",svg_width).attr("height",svg_height)
  .attr("class",svg_class)
  .attr("viewBox", "0 0 " + svg_width + " " + svg_height)
  //.attr("shape-rendering", "crispEdges")
  ;
 return svg;
};

manaba.d3_change = function (fid, tid) {
 var fnode = document.getElementById(fid);
 var tnode = document.getElementById(tid);
 fnode.style.display = "none"; 
 tnode.style.display = "block"; 
}

manaba.d3stroke_color = function() {
return "#BABFC4";
};

manaba.default_value = function (v, defv) {
 return v == null ? defv : v;
};

manaba.fillpatterns = [
  'url(#fillpat1)'
 ,'url(#fillpat2)'
 ,'url(#fillpat3)'
 ,'url(#fillpat4)'
 ,'url(#fillpat5)'
 ,'url(#fillpat6)'
 ,'url(#fillpat7)'
 ,'url(#fillpat8)'
 ,'url(#fillpat9)'
 ,'url(#fillpat10)'
 ,'url(#fillpat11)'
 ,'url(#fillpat12)'
 ,'url(#fillpat13)'
 ,'url(#fillpat14)'
 ,'url(#fillpat15)'
 ,'url(#fillpat16)'
 ,'url(#fillpat17)'
 ,'url(#fillpat18)'
 ,'url(#fillpat19)'
 ,'url(#fillpat20)'
];

manaba.myfillpatterns = [
  'url(#myfillpat1)'
 ,'url(#myfillpat2)'
 ,'url(#myfillpat3)'
 ,'url(#myfillpat4)'
 ,'url(#myfillpat5)'
 ,'url(#myfillpat6)'
 ,'url(#myfillpat7)'
 ,'url(#myfillpat8)'
 ,'url(#myfillpat9)'
 ,'url(#myfillpat10)'
 ,'url(#myfillpat11)'
 ,'url(#myfillpat12)'
 ,'url(#myfillpat13)'
 ,'url(#myfillpat14)'
 ,'url(#myfillpat15)'
 ,'url(#myfillpat16)'
 ,'url(#myfillpat17)'
 ,'url(#myfillpat18)'
 ,'url(#myfillpat19)'
 ,'url(#myfillpat20)'
];

manaba.grayfillpatterns = [
  'url(#grayfillpat1)'
 ,'url(#grayfillpat2)'
 ,'url(#grayfillpat3)'
 ,'url(#grayfillpat4)'
 ,'url(#grayfillpat5)'
 ,'url(#grayfillpat6)'
 ,'url(#grayfillpat7)'
 ,'url(#grayfillpat8)'
 ,'url(#grayfillpat9)'
 ,'url(#grayfillpat10)'
 ,'url(#grayfillpat11)'
 ,'url(#grayfillpat12)'
 ,'url(#grayfillpat13)'
 ,'url(#grayfillpat14)'
 ,'url(#grayfillpat15)'
 ,'url(#grayfillpat16)'
 ,'url(#grayfillpat17)'
 ,'url(#grayfillpat18)'
 ,'url(#grayfillpat19)'
 ,'url(#grayfillpat20)'
];

manaba.colorpatterns = [
 "#80AA00"
,"#F18D00"
,"#43A0DD"
,"#ED6B8D"
,"#8565AF"
,"#E8B400"
,"#268A68"
,"#CD504D"
,"#0272C1"
,"#8C8C8C"
];

manaba.circlednumbers = [
 "\u2460"
,"\u2461"
,"\u2462"
,"\u2463"
,"\u2464"
,"\u2465"
,"\u2466"
,"\u2467"
,"\u2468"
,"\u2469"
,"\u246A"
,"\u246B"
,"\u246C"
,"\u246D"
,"\u246E"
,"\u246F"
,"\u2470"
,"\u2471"
,"\u2472"
,"\u2473"
];

manaba.queryresult = {};
manaba.queryresult.responsive = {};
manaba.queryresult.responsive.resized = false;

manaba.queryresult.responsive.limitWidth = 540;
manaba.queryresult.responsive.legendMarginLeft = 10;
manaba.queryresult.responsive.pieOffsetY = -10;
manaba.queryresult.responsive.barOffsetY = 10;

manaba.queryresult.responsive.parseviewbox = function(str) {
  var buf = str.split(/ +/);
  return {sx:buf[0], sy:buf[1], ex:buf[2], ey:buf[3]};
};

manaba.queryresult.responsive.addviewboxsetting = function (svg, rheight) {
  var v = svg.attr('viewBox');
  var vb = this.parseviewbox(v);
  svg.attr('wviewBox', v).attr('rviewBox', '0 0 ' + vb.ex + ' ' + rheight); // wide-view, responsive-view
};

manaba.d3_chart_bar = function (id, chartarg) {
 var svg = manaba.d3chart_setup_svg(id, chartarg);
 var svg_width = manaba.default_value(chartarg['width'], 200);
 var display_width = svg_width;

 var svg_height = manaba.default_value(chartarg['height'], 200);
 var padding_top = manaba.default_value(chartarg['padding_top'], 10);
 var padding_bottom = manaba.default_value(chartarg['padding_bottom'], 10);
 var display_height = svg_height - padding_top - padding_bottom;
 var display_bottom = svg_height - padding_bottom;

 var data_array = chartarg['data'];
 var value_key = manaba.default_value(chartarg['value_key'], 'score');

 var thickness = manaba.default_value(chartarg['bar_thickness'], 0.75);
 var maxscore = manaba.default_value(chartarg['maxdata'][value_key],
   d3.max(data_array, function(d){return d[value_key];}));

 var scale_x = d3.scale.linear()
  .domain([0, data_array.length]).range([0, display_width]);
 var scale_y = d3.scale.linear()
  .domain([0, maxscore]).range([0, display_height]);

 svg.selectAll("rect")
  .data(data_array).enter().append("rect")
  .attr("x", function(d, i){return scale_x(i) + display_width * (1 - thickness) * 0.5 / data_array.length})
  .attr("y", function(d, i){return display_bottom - scale_y(d[value_key])})
  .attr("width", function(d, i){return display_width * thickness / data_array.length})
  .attr("height", function(d, i){return scale_y(d[value_key])})
  .attr("fill", function(d, i){return manaba.fillpatterns[i % manaba.fillpatterns.length]});
};

manaba.d3_chart_bar2 = function (id, chartarg, options) {
 var redraw = options && options.redraw ? 1 : 0;
 var svg = redraw ? d3.select('#' + id).select('svg')
   : manaba.d3chart_setup_svg(id, chartarg);
 var svg_width = manaba.default_value(chartarg['width'], 200);
 var padding_left = manaba.default_value(chartarg['padding_left'], 10);
 var padding_right = manaba.default_value(chartarg['padding_right'], 10);

 var svg_height = manaba.default_value(chartarg['height'], 200);
 var padding_top = manaba.default_value(chartarg['padding_top'], 5);
 var padding_bottom = manaba.default_value(chartarg['padding_bottom'], 5);

 var rectlegend_width = manaba.default_value(chartarg['rectlegend_width'], 10);
 var rectlegend_height = manaba.default_value(chartarg['rectlegend_height'], 10);
 var legendvalue_width = manaba.default_value(chartarg['legendvalue_width'], 80);
 var correct_choice = manaba.default_value(chartarg['correct_choice'], 0);
 var use_ellipsis = manaba.default_value(chartarg['use_ellipsis'], 0);

 var data_array = chartarg['data'];
 var value_key = manaba.default_value(chartarg['value_key'], 'score');
 var label_key = manaba.default_value(chartarg['label_key'], 'altdata');
 var point_key = manaba.default_value(chartarg['point_key'], 'point');
 var myans_key = manaba.default_value(chartarg['myans_key'], 'myanswer');

 var thickness = manaba.default_value(chartarg['bar2_thickness'], 10);
 var padding_bar = manaba.default_value(chartarg['bar2_padding'], 2);
 var markersize = manaba.default_value(chartarg['bar2_markersize'], 10);
 var maxscore = manaba.default_value(chartarg['maxdata'][value_key],
   d3.max(data_array, function(d){return d[value_key];}));

 var legendtop = 10;
 var legend_margin = 10;
 var legend_padding = 10;
 var legend_width = legend_margin + rectlegend_width + legend_padding + legendvalue_width;
 var display_left = padding_left;
 var display_right = svg_width - padding_right;
 var display_width = svg_width - legend_width - padding_left - padding_right;
 var display_height = svg_height - padding_top - padding_bottom;
 var display_bottom = svg_height - padding_bottom;
 var display_top = padding_top;

 var scale_x = d3.scale.linear()
  .domain([0, maxscore]).range([0, display_width]);
 var scale_y = d3.scale.linear()
  .domain([0, data_array.length]).range([0, display_height]);

 var textheight = 20;
 var labeloffsetx = 20;
 var labeloffsety = 15;
 var baroffsety = 25;
 var markeroffsety = 0;

 var n_ticks = (maxscore <= 4) ? maxscore : 4;
 var x_axis = d3.svg.axis()
               .scale(scale_x)
               .orient("bottom")
               .ticks(n_ticks)
               .tickFormat(d3.format("01d"))
 ;

 if (redraw) {
   svg.selectAll('rect.databar')
    .data(data_array)
    .transition().duration(1000)
      .attr('width', function(d, i){return scale_x(d[value_key]) + 1})
   ;
   svg.select('.axis').call(x_axis);
   return;
 }

 svg.selectAll("rect.databar")
  .data(data_array).enter().append("rect")
  .attr("class", "databar")
  .attr("x", function(d, i){return display_left})
  .attr("y", function(d, i){return display_top + (thickness + padding_bar)*i})
  .attr("width", function(d, i){return scale_x(d[value_key]) + 1})
  .attr("height", function(d, i){return thickness})
  .attr("fill", function(d, i){
   var fillpatterns = manaba.fillpatterns;
   if (data_array[i][myans_key] === 1) { fillpatterns = manaba.myfillpatterns; }
   if (data_array[i][myans_key] === 0) { fillpatterns = manaba.grayfillpatterns; }
   return fillpatterns[i % fillpatterns.length];
   })
  .attr("stroke", manaba.d3stroke_color())
  .attr("stroke-width", 1)
  ;

 svg.append("g")
  .attr("class", "axis")
  .attr("transform", "translate("+padding_left+","+(svg_height-padding_bottom)+")")
  .call(x_axis);

 var legendleft = display_left + display_width + legend_margin;
 var rectlegend_x = legendleft;
 var legendbox = manaba.useQueryResultResponsive ?
   svg.append("g").attr("class", "legendbox_bar") : svg;
 legendbox.selectAll("rect.legend")
  .data(data_array)
  .enter()
  .append("rect")
  .attr("class", "legend")
  .attr("x", rectlegend_x)
  .attr("y", function(d,i){return legendtop + (rectlegend_height+legend_padding) * i})
  .attr("width", rectlegend_width)
  .attr("height", rectlegend_height)
  .attr("fill",function(d,i){return manaba.colorpatterns[i % manaba.colorpatterns.length]})
  ;

 var correct_str = "";
 if (correct_choice) {
  correct_str = gLang == "en" ? "(Correct)" : "(正解)";
 }
 var legendvalue_x = rectlegend_x + rectlegend_width + legend_padding;
 legendbox.selectAll("text.legendvalue")
  .data(data_array)
  .enter()
  .append("text").attr("class","legendvalue")
  .text(function(d){ return d[point_key] ? correct_str + d[label_key] : "" + d[label_key]; })
  .attr("text-anchor", "start")
  .attr("font-family", "Arial")
  .attr("font-weight", "bold")
  .attr("width", legendvalue_width)
  .attr("fill",function(d,i){return manaba.colorpatterns[i % manaba.colorpatterns.length]})
  .attr("x", legendvalue_x)
  .attr("y", function(d,i){return legendtop + rectlegend_height + (rectlegend_height+legend_padding) * i})
  .each(function(d){
    var self = d3.select(this);
    var choicetext = self.text();
    while (self.node().getComputedTextLength() > legendvalue_width) {
      choicetext = choicetext.slice(0, -1);
      self.text(use_ellipsis ? choicetext + '..' : choicetext);
    }
  })
  ;

  if (manaba.useQueryResultResponsive) {
    var rheight = manaba.default_value(chartarg['height'], 200)
      + (rectlegend_height+legend_padding) * data_array.length
      + manaba.queryresult.responsive.barOffsetY;
    manaba.queryresult.responsive.addviewboxsetting(svg, rheight);
  }
/*
 svg.selectAll("circle.datamarker")
  .data(data_array).enter().append("circle")
  .attr("class", "datamarker")
  .attr("cx", function(d, i){return display_left + markersize * 0.5})
  .attr("cy", function(d, i){return display_top + scale_y(i) + markeroffsety + markersize * 0.5})
  .attr("r", function(d, i){return markersize * 0.5})
  .attr("fill", function(d, i){return manaba.fillpatterns[i % manaba.fillpatterns.length]})
  ;
 svg.selectAll("text.datalabel")
  .data(data_array).enter().append("text")
  .attr("class", "datalabel")
  .text(function(d, i){ return "" + (i+1) + ". " +  d[label_key]})
  .attr("text-anchor", "start")
  .attr("x", display_left + labeloffsetx)
  .attr("y", function(d, i){ return display_top + scale_y(i) + markeroffsety + markersize})
  ;
 svg.selectAll("text.datavalue")
  .data(data_array).enter().append("text")
  .attr("class", "datavalue")
  .text(function(d, i){ return d[value_key]})
  .attr("text-anchor", "start")
  .attr("x", function(d, i){ return display_left + scale_x(d[value_key]) + 10})
  .attr("y", function(d, i){ return display_top + scale_y(i) + baroffsety + thickness})
  ;
*/
};

manaba.d3_chart_pie = function (id, chartarg, options) {
 var redraw = options && options.redraw ? 1 : 0;
 var svg = redraw ? d3.select('#' + id).select('svg')
   : manaba.d3chart_setup_svg(id, chartarg);
 var svg_width = manaba.default_value(chartarg['width'], 200);
 var padding_left = manaba.default_value(chartarg['padding_left'], 10);
 var padding_right = manaba.default_value(chartarg['padding_right'], 10);
 var display_width = svg_width - padding_left - padding_right;
 var display_left = padding_left;
 var display_right = svg_width - padding_right;

 var svg_height = manaba.default_value(chartarg['height'], 200);
 var padding_top = manaba.default_value(chartarg['padding_top'], 5);
 var padding_bottom = manaba.default_value(chartarg['padding_bottom'], 5);
 var display_height = svg_height - padding_top - padding_bottom;
 var display_bottom = svg_height - padding_bottom;
 var display_top = padding_top;

 var inner_radius = manaba.default_value(chartarg['inner_radius'], 50);
 var outer_radius = manaba.default_value(chartarg['outer_radius'], 100);
 var add_radius_myans = manaba.default_value(chartarg['add_radius_myans'], 10);
 var outer_radius_myans = outer_radius + add_radius_myans;
 var full_radius = inner_radius + outer_radius;
 var stroke_width = manaba.default_value(chartarg['stroke_width'], 1);
 var stroke_width0 = manaba.default_value(chartarg['stroke_width0'], 1);

 var rectlegend_width = manaba.default_value(chartarg['rectlegend_width'], 10);
 var rectlegend_height = manaba.default_value(chartarg['rectlegend_height'], 10);
 var legendratio_width = manaba.default_value(chartarg['legendratio_width'], 40);
 var legendscore_width = manaba.default_value(chartarg['legendscore_width'], 36);
 var legend_font_size = manaba.default_value(chartarg['legend_font_size'], '14px');
 var legend_padding = manaba.default_value(chartarg['legend_padding'], 10);
 var legendvalue_width = manaba.default_value(chartarg['legendvalue_width'], 50);
 var choice_in_legend = manaba.default_value(chartarg['choice_in_legend'], 0);
 var correct_choice = manaba.default_value(chartarg['correct_choice'], 0);
 var use_ellipsis = manaba.default_value(chartarg['use_ellipsis'], 0);
 var no_fillpattern = manaba.default_value(chartarg['no_fillpattern'], 0);

 var cx = display_left + outer_radius;
 var cy = display_top + outer_radius;

 var data_array = chartarg['data'];
 var value_key = manaba.default_value(chartarg['value_key'], 'score');
 var label_key = manaba.default_value(chartarg['label_key'], 'name');
 var altdata_key = manaba.default_value(chartarg['altdata_key'], 'altdata');
 var point_key = manaba.default_value(chartarg['point_key'], 'point');
 var myans_key = manaba.default_value(chartarg['myans_key'], 'myanswer');

 var value_sum = d3.sum(data_array, function(d) { return d[value_key] });
 var start_angle = 0;
 var end_angle = start_angle + Math.PI * 2;

 var pie = d3.layout.pie()
  .startAngle(start_angle)
  .endAngle(end_angle)
  .value(function(d){return d[value_key]}).sort(null);
 var arc = d3.svg.arc()
  .innerRadius(inner_radius)
  .outerRadius(function(d,i){return data_array[i][myans_key] ? outer_radius_myans : outer_radius});

 var getfillpattern = function(i) {
   var fillpatterns = manaba.fillpatterns;
   if (no_fillpattern)                 { fillpatterns = manaba.colorpatterns }
   if (data_array[i][myans_key] === 1) { fillpatterns = manaba.myfillpatterns }
   return fillpatterns[i % fillpatterns.length]
 };

 if (redraw) {
   var arctween = function(a, i) {
     a.data = a.value;
     var ip = d3.interpolate(this._current, a);
     this._current = a;
     return function(t) { return arc(ip(t), i) };
   };
   svg.selectAll('path.datapie')
     .data(pie(data_array))
     .transition().duration(1000)
       .attrTween('d', arctween)
       .attr('stroke-width', function(d,i){return data_array[i][value_key] > 0 ? stroke_width : stroke_width0; })
   ;
   svg.selectAll('text.legendratio')
     .data(data_array)
     .text(function(d,i){return value_sum ? ( "" + Math.round(100 * d[value_key] / value_sum) + "%" ) : "-" })
   ;
   svg.selectAll('text.legendscore')
     .data(data_array)
     .text(function(d,i){return '(' + d[value_key] + ')' })
   ;
   return;
 }

 svg.selectAll("path.datapie")
  .data(pie(data_array))
  .enter()
  .append("path")
  .attr("class", "datapie")
  .attr("d", arc)
  .attr("fill",function(d,i){return getfillpattern(i) })
  .attr("stroke","white")
  .attr("stroke-width", function(d,i){return data_array[i][value_key] > 0 ? stroke_width : stroke_width0; })
  .attr("transform", "translate(" + cx + "," + cy + ")")
  .each(function(d){
     if (manaba.useQueryResultAutoCheckInterval) { d.data = d.value; this._current = d }
   })
  ;

 var legend_margin = 30;
 var legendleft = cx + outer_radius + legend_margin;
 var legendtop = cy - outer_radius;
 var rectlegend_x = legendleft + 4;

 var legendbox = manaba.useQueryResultResponsive ?
   svg.append("g").attr("class", "legendbox_pie") : svg;
 legendbox.selectAll("rect.legend")
  .data(data_array)
  .enter()
  .append("rect")
  .attr("class", "legend")
  .attr("x", rectlegend_x)
  .attr("y", function(d,i){return legendtop + 2 + (rectlegend_height+legend_padding) * i})
  .attr("width", rectlegend_width)
  .attr("height", rectlegend_height)
  .attr("fill",function(d,i){return manaba.colorpatterns[i % manaba.colorpatterns.length]})
  ;

 var correct_str = "";
 if (correct_choice) {
  correct_str = gLang == "en" ? "(Correct)" : "(正解)";
 }
 var legendvalue_x = rectlegend_x + rectlegend_width + legend_padding; 
 legendbox.selectAll("text.legendvalue")
  .data(data_array)
  .enter()
  .append("text").attr("class","legendvalue")
  .text(function(d,i){
    var txt = choice_in_legend ? d[altdata_key] : d[label_key];
    if (d[point_key]) { txt = correct_str + txt; } 
    return txt;
   })
  .attr("text-anchor", "start")
  .attr("font-size", legend_font_size)
  .attr("font-family", "Arial")
  .attr("font-weight", "bold")
  .attr("width", legendvalue_width)
  .attr("fill",function(d,i){return manaba.colorpatterns[i % manaba.colorpatterns.length]})
  .attr("x", legendvalue_x)
  .attr("y", function(d,i){return legendtop + 2 + rectlegend_height + (rectlegend_height+legend_padding) * i})
  .each(function(d){
    var self = d3.select(this);
    var choicetext = self.text();
    while (self.node().getComputedTextLength() > legendvalue_width) {
      choicetext = choicetext.slice(0, -1);
      self.text(use_ellipsis ? choicetext + '..' : choicetext);
    }
  }) 
  ;

 var legendratio_x = legendvalue_x + legendvalue_width + legendratio_width; // text-anchor:end を指定している為 
 legendbox.selectAll("text.legendratio")
  .data(data_array)
  .enter()
  .append("text").attr("class","legendratio")
  .text(function(d,i){return value_sum ? ( "" + Math.round(100 * d[value_key] / value_sum) + "%" ) : "-" })
  .attr("text-anchor", "end")
  .attr("font-size", legend_font_size)
  .attr("font-weight", function(d,i){return d[myans_key] ? "bold" : "normal"})
  .attr("x", legendratio_x)
  .attr("y",function(d,i){return legendtop + 2 + rectlegend_height + (rectlegend_height+legend_padding) * i})
  ;

 var legendscore_x = legendratio_x + legendscore_width; // text-anchor:end を指定している為
 legendbox.selectAll("text.legendscore")
  .data(data_array)
  .enter()
  .append("text").attr("class","legendscore")
  .text(function(d,i){return "(" + d[value_key] + ")" })
  .attr("text-anchor", "end")
  .attr("font-size", legend_font_size)
  .attr("font-weight", function(d,i){return d[myans_key] ? "bold" : "normal"})
  .attr("x", legendscore_x)
  .attr("y",function(d,i){return legendtop + 2 + rectlegend_height + (rectlegend_height+legend_padding) * i})
  ;

  if (manaba.useQueryResultResponsive) {
    var rheight = manaba.default_value(chartarg['height'], 200)
      + (rectlegend_height + legend_padding) * data_array.length
      + manaba.queryresult.responsive.pieOffsetY;
    manaba.queryresult.responsive.addviewboxsetting(svg, rheight);
  }
};

manaba.d3_chart_pie2 = function (id, chartarg) {
 var svg = manaba.d3chart_setup_svg(id, chartarg);
 var svg_width = manaba.default_value(chartarg['width'], 200);
 var padding_left = manaba.default_value(chartarg['padding_left'], 10);
 var padding_right = manaba.default_value(chartarg['padding_right'], 10);
 var display_width = svg_width - padding_left - padding_right;
 var display_left = padding_left;
 var display_right = svg_width - padding_right;

 var svg_height = manaba.default_value(chartarg['height'], 200);
 var padding_top = manaba.default_value(chartarg['padding_top'], 5);
 var padding_bottom = manaba.default_value(chartarg['padding_bottom'], 5);
 var display_height = svg_height - padding_top - padding_bottom;
 var display_bottom = svg_height - padding_bottom;
 var display_top = padding_top;

 var inner_radius = manaba.default_value(chartarg['inner_radius'], 50);
 var outer_radius = manaba.default_value(chartarg['outer_radius'], 100);
 var full_radius = inner_radius + outer_radius;

 var cx = display_left + display_width * 0.5;
 var cy = display_top + display_height * 0.5;

 var data_array = chartarg['data'];
 var value_key = manaba.default_value(chartarg['value_key'], 'score');
 var label_key = manaba.default_value(chartarg['label_key'], 'altdata');
 var value_sum = d3.sum(data_array, function(d) { return d[value_key] });

 var quadrant_indices = { "1":0, "2":0, "3":0, "4":0 };

 var datasummary = [];
 (function() {
  var acc = 0;
  for (var i = 0; i < data_array.length; ++i) {
   var d = data_array[i];
   var ds = { };
   ds['i'] = i;
   var v = d[value_key];
   if (v) {
    ds['value'] = v;
    var ds_start = acc;
    var ds_end = acc + v;
    var ds_mid = (ds_start + ds_end) * 0.5;
    ds['start'] = ds_start;
    ds['end'] = ds_end;
    if (value_sum) {
     var ds_rvalue = v / value_sum;
     var ds_rstart = ds_start / value_sum;
     var ds_rend = ds_end / value_sum;
     var ds_rmid = ds_mid / value_sum;
     ds['rvalue'] = ds_rvalue;
     ds['rstart'] = ds_rstart;
     ds['rend'] = ds_rend;
     ds['rmid'] = ds_rmid;
     ds['radvalue'] = Math.PI * 2 * ds_rvalue;
     ds['radstart'] = Math.PI * 2 * ds_rstart;
     ds['radend'] = Math.PI * 2 * ds_rend;
     ds['radmid'] = Math.PI * 2 * ds_rmid;
     var quadrant
      = (ds_rmid <= 0.25) ? 1
      : (ds_rmid <= 0.50) ? 2
      : (ds_rmid <= 0.75) ? 3
      : 4
      ;
     ds['quadrant'] = quadrant;
     ds['text-anchor'] = quadrant > 2 ? "end" : "start";
     ds['quadrant_index'] = quadrant_indices[quadrant]++;
    }
    acc = ds_end;
    datasummary.push(ds);
   }
  }
 }());

 var labeltext_height = 12;
 var textbox_height = 20;
 var textbox_margin_hori = 30;
 var textbox_xedge_of = function (nth, q) {
  if (q > 2) {
   return cx - outer_radius - textbox_margin_hori;
  } else {
   return cx + outer_radius + textbox_margin_hori;
  }
 };

 var textbox_ymiddle_of = function (nth, q) {
  if (q == 1) {
   return cy - outer_radius + textbox_height * nth;
  } else if (q == 2) {
   return cy + outer_radius - textbox_height * (quadrant_indices[q] - 1 - nth);
  } else if (q == 3) {
   return cy + outer_radius - textbox_height * nth;
  } else if (q == 4) {
   return cy - outer_radius + textbox_height * (quadrant_indices[q] - 1 - nth);
  }
 };

 var start_angle = 0;
 var end_angle = start_angle + Math.PI * 2;

 var pie = d3.layout.pie()
  .startAngle(start_angle)
  .endAngle(end_angle)
  .value(function(d){return d[value_key]}).sort(null);
 var arc = d3.svg.arc().innerRadius(inner_radius).outerRadius(outer_radius);
 svg.selectAll("path.datapie")
  .data(pie(data_array))
  .enter()
  .append("path")
  .attr("class", "datapie")
  .attr("d", arc)
  .attr("fill",function(d,i){return manaba.fillpatterns[i % manaba.fillpatterns.length]})
  .attr("stroke",manaba.d3stroke_color())
  .attr("stroke-width",1)
  .attr("transform", "translate(" + cx + "," + cy + ")");

 var dsx = function(ds){return textbox_xedge_of(ds['quadrant_index'], ds['quadrant'])};
 var dsy = function(ds){return textbox_ymiddle_of(ds['quadrant_index'], ds['quadrant'])};
 var dsy1 = function(ds){return textbox_ymiddle_of(ds['quadrant_index'], ds['quadrant']) + labeltext_height * 0.5};

 var label_height = 30;
 svg.selectAll("text.datalabel")
  .data(datasummary)
  .enter().append("text")
  .attr("class", "datalabel")
  .text(function(ds){ var i = ds['i']; var d = data_array[i]; return "" + (i+1) + "."})
  .attr("text-anchor", function(ds){return ds['text-anchor']})
  .attr("x", dsx)
  .attr("y", dsy1)
  ;

 svg.selectAll("line.datalabel")
  .data(datasummary)
  .enter().append("line")
  .attr("class", "datalabel")
  .attr("x1",dsx)
  .attr("y1",dsy)
  .attr("x2",function(ds){return cx + outer_radius * Math.sin(ds.radmid)})
  .attr("y2",function(ds){return cy - outer_radius * Math.cos(ds.radmid)})
  .attr("stroke",manaba.d3stroke_color())
  .attr("stroke-width",1)
  ;
};

manaba.d3_chart_bar3 = function(id, chartarg) {
 var svg = manaba.d3chart_setup_svg(id, chartarg);
 var data_set = chartarg['data'];
 var total = chartarg['total'];
 var year_key = manaba.default_value(chartarg['year_key'], 'year');
 var cnt_key = manaba.default_value(chartarg['cnt_key'], 'cnt');
 var maxcnt = manaba.default_value(chartarg['maxcnt'], 100);
 var xdomain = chartarg['xdomain'];
 var margin = {top:10, right:20, bottom:30, left:30};
 var width = +svg.attr("width") - margin.left - margin.right;
 var height = +svg.attr("height") - margin.top - margin.bottom;
 var outerpadding = (xdomain.length == 1) ? 0.5 : 0.1;
 if (maxcnt < 10) { maxcnt = 10; }
 var stack = d3.layout.stack()
  .values(function(d) {return d;})
  .x(function(d) { return d[year_key];})
  .y(function(d) { return d[cnt_key];});
 var scale_x = d3.scale.ordinal()
  .domain(xdomain)
  .rangeRoundBands([0, width], .3, outerpadding);
 var scale_y = d3.scale.linear()
  .domain([0, maxcnt])
  .rangeRound([height, 0]);
 var x_axis = d3.svg.axis().scale(scale_x).orient("bottom").ticks(xdomain.length);
 var y_axis = d3.svg.axis().scale(scale_y).orient("left").tickSize(-width)
 var colors = ["#7cba63","#abcd60","#d4dc68","#20ae93","#7bcada"];
  //X軸
  svg.append("g")
   .attr("class", "x axis")
   .attr("transform", "translate("+margin.left+","+(height+margin.top)+")")
   .call(x_axis)
  ;
  //Y軸
  svg.append("g")
   .attr("class", "y axis")
   .attr("transform", "translate("+margin.left+","+margin.top+")")
   .attr("stroke-width",1)
   .call(y_axis)
  ;
  // Vertical Bar Chart
 svg.selectAll("databar3")
  .data(stack(data_set))
  .enter()
  .append("g")
   .attr("class", "databar3")
   .attr("fill", function(d,i) {return colors[i%5];})
  .selectAll("rect")
   .data(function(d) {return d;})
   .enter()
   .append("rect")
    .attr("x", function(d) {return margin.left + scale_x(d.year);})
    .attr("y", function(d) {return margin.top + scale_y(d.y0) + scale_y(d.y) - height ;})
    .attr("width", scale_x.rangeBand()) 
    .attr("height", function(d) {return height - scale_y(d.y);})
    .on("mouseover", function() {tooltip.style("display", null);})
    .on("mouseout", function() {tooltip.style("display", "none");})
    .on("mousemove", function(d) {
      var xpos = d3.mouse(this)[0] - 15;
      var ypos = d3.mouse(this)[1] - 25;
      tooltip.attr("transform", "translate("+xpos+","+ypos+")");
      tooltip.select("text").text(d.y);
     })
  ;
 var tooltip = svg.append("g")
  .attr("class", "tooltip")
  .style("display", "none")
 ;
 tooltip.append("rect")
  .attr("width", 30)
  .attr("height", 18)
  .attr("fill", "#fff")
  .attr("rx", 3)
  .attr("ry", 3)
  .style("opacity", 0.8)
 ;
 tooltip.append("text")
  .attr("x", 15)
  .attr("dy", "1.2em")
  .attr("text-anchor", "middle")
 ;
 var total = svg.selectAll("total")
  .data(total)
  .enter()
  .append("g")
  .attr("class", "total")
 ;
 total.append("text")
  .attr({
    "x":function(d,i) {return margin.left + scale_x(d.year) + scale_x.rangeBand()/2;},
    "y":function(d,i) {return margin.top + scale_y(d.total) - 1 ;}
   })
  .attr("text-anchor", "middle")
  .text(function(d) {return d.total;})
 ;
}

manaba.d3_chart_line = function(id, chartarg) {
 var svg = manaba.d3chart_setup_svg(id, chartarg);
 var data_set = chartarg['data'];
 var date_key = manaba.default_value(chartarg['date_key'], 'date');
 var cnt_key = manaba.default_value(chartarg['cnt_key'], 'cnt');
 var period = manaba.default_value(chartarg['period'], 14);
 var margin = {top:10, right:20, bottom:30, left:30};
 var width = +svg.attr("width") - margin.left - margin.right;
 var height = +svg.attr("height") - margin.top - margin.bottom;
 var maxcnt = d3.max(data_set, function(d) {return parseInt(d[cnt_key]);}) + 1;
 if (maxcnt < 10) { maxcnt = 10; }
 data_set.forEach(function(d) {
  d.date = d3.time.format("%Y-%m-%d").parse(d.date);
  d.cnt = +d.cnt;
 });
 var bisectDate = d3.bisector(function(d) {return d.date; }).left;
 var scale_x = d3.time.scale()
  .domain(d3.extent(data_set,function(d) {return d[date_key];}))
  .range([0, width])
 ;
 var scale_y = d3.scale.linear()
  .domain([0, maxcnt])
  .range([height, 0])
 ;
 var line = d3.svg.line()
  .x(function(d) {return scale_x(d[date_key]);})
  .y(function(d) {return scale_y(d[cnt_key]);})
 ;
 var x_axis = d3.svg.axis()
               .scale(scale_x)
               .orient("bottom")
               .tickFormat(d3.time.format("%m/%d"))
               .ticks(7)
 ;
 var y_axis = d3.svg.axis()
               .scale(scale_y)
               .orient("left")
               .ticks(10)
               .tickSize(-width)
 ;
 //X軸
 svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate("+margin.left+","+(height+margin.top)+")")
  .call(x_axis)
  .selectAll("text")
 ;
 //Y軸
 svg.append("g")
  .attr("class", "y axis")
  .attr("transform", "translate("+margin.left+","+margin.top+")")
  .attr("stroke-width",1)
  .call(y_axis)
 ;
 // line chart
 svg.append("path")
  .datum(data_set)
  .attr("d", line)
  .attr("class", "line")
  .attr("fill", "none")
  .attr("stroke", "#8cc62b")
  .attr("stroke-width", 2)
  .attr("transform", "translate("+margin.left+","+margin.top+")")
 ;
 svg.selectAll("circle")
  .data(data_set)
  .enter()
  .append("circle")
  .attr("transform", "translate("+margin.left+","+margin.top+")")
  .attr("cx", function(d) {return scale_x(d.date);})
  .attr("cy", function(d) {return scale_y(d.cnt);})
  .attr("r", 3)
  .attr("fill", "#8cc62b")
  .on("mouseover", function() {tooltip.style("display", null);})
  .on("mouseout", function() {tooltip.style("display", "none");})
  .on("mousemove", function(d) {
    var xpos = d3.mouse(this)[0];
    var ypos = d3.mouse(this)[1] - 2;
    tooltip.attr("transform", "translate("+xpos+","+ypos+")");
    tooltip.select("text").text(d.cnt);
   })
 ;
 var tooltip = svg.append("g")
  .attr("class", "tooltip")
  .style("display", "none")
 ;
 tooltip.append("rect")
  .attr("width", 30)
  .attr("height", 18)
  .attr("fill", "#000")
  .attr("rx", 3)
  .attr("ry", 3)
  .style("opacity", 0.1)
 ;
 tooltip.append("text")
  .attr("x", 15)
  .attr("dy", "1.2em")
  .attr("text-anchor", "middle")
 ;
}

manaba.qtsettotalpointevent = function(querytotalpoint) {
 var querytotal = new Object();
 querytotal.point_es = getElementsByClass("point",  null,  "input");
 querytotal.calcpoint_es = getElementsByClass("calcpoint", null, "input");
 querytotal.calcpoint_dic = new Object();

 querytotal.qidregex = /qid(\d*)/;
 querytotal.qidfrom = function(namestr) {
	 return querytotal.qidregex.exec(namestr)[1];
 };

 querytotal.foreach = function(proc, arr) {
	 for (var i = 0; i < arr.length; ++i) {
		 proc(arr[i]);
	 }
 };

 querytotal.settotal = function() {
	// document.title = (new Date()).getTime();
	 var calcedtotal = querytotal.calctotal();
	 querytotalpoint.innerHTML = isNaN(calcedtotal) ? '?' : calcedtotal;
 }
 querytotal.init = function() {
	 querytotal.foreach(
			 function(elem) { querytotal.calcpoint_dic[elem.name] = elem; },
			 querytotal.calcpoint_es);
	querytotal.foreach(
			function(elem) { querytotal.foreach(function(event_name) {
				manaba.addevent(elem, event_name, querytotal.settotal);
				},
				["blur"/*, "keyup"*/]);
			},
			querytotal.point_es);
 };

 querytotal.init();
 querytotal.calctotal = function() {
	 var result = 0;
	 querytotal.foreach(
			 function(elem) {
				 var qid = querytotal.qidfrom(elem.name);
				 var calcelem = querytotal.calcpoint_dic["qid" + qid + "totalpoint"];
				 var valuestr = ((calcelem ? calcelem : elem).value);
				 if (valuestr) { result += parseInt(valuestr, 10); }
			 },
			 querytotal.point_es);
	 return result;
 };
 querytotal.settotal();
};

manaba.d3_textarealist = function(id, chartarg) {
  var width = chartarg['width'];
  var height = chartarg['height'];
  var box = document.getElementById(id);
  var box_ul = box.querySelector('ul');

  //-- rewrite with diffdata
  if (box_ul && manaba.useQueryResultAutoCheckInterval) {
    var box_lis = box_ul.getElementsByTagName('li');
    var doneqdid = {};
    //-- check newline
    var df = document.createDocumentFragment();
    var newrows = 0; // for ie11
    for (var i in chartarg['data']) {
      var qdiff = chartarg['data'][i];
      var qdli = box_ul.querySelector('li[qdid="' + qdiff['qdid'] + '"]');
      var chkadd = 0;
      if (!qdli) {
        chkadd = 1;
      } else if (qdli.getAttribute('mtime') !== qdiff['mtime']) {
        box_ul.removeChild(qdli);
        chkadd = 1;
      }
	  if (chkadd) {
        if (qdiff['submitted']) {
          var li = document.createElement('li');
          li.setAttribute('qdid', qdiff['qdid']);
          li.setAttribute('mtime', qdiff['mtime']);
          li.innerHTML = qdiff['name'];
          df.appendChild(li);
          newrows++;
        }
      }
      doneqdid[qdiff['qdid']] = 1;
    }
    if (newrows) {
      box_ul.insertBefore(df, box_ul.firstChild);
    }
    //-- check deleteline
    var len = box_lis.length;
    if (len) {
      for (var i = len - 1; i >= 0; i--) {
        var qdid = box_lis[i].getAttribute('qdid');
        if (!doneqdid[qdid]) {
          box_lis[i].parentNode.removeChild(box_lis[i]);
        }
      }
    }

  //-- existing process
  } else {
    box.innerHTML = '';
    var ul = document.createElement('ul');
    for (var i in chartarg['data']) {
      var li = document.createElement('li');
      if (manaba.useQueryResultAutoCheckInterval) {
        li.setAttribute('qdid', chartarg['data'][i]['qdid']);
        li.setAttribute('mtime', chartarg['data'][i]['mtime']);
      }
      li.innerHTML = chartarg['data'][i]['name'];
      ul.appendChild(li);
    }
    box.appendChild(ul);
  }
}

manaba.collect_input_by_keyattr = function(root, keyattr, inputname) {
	var dict = {};
	var keys = [];
	var stack = [];

	stack.push({ node: root, pkey: null });

	while( stack.length > 0 ) {
		var frame = stack.pop();
		var node = frame['node'];
		var pkey = frame['pkey'];

		if (! node.getAttribute) {
			continue;
		}

		var key = node.getAttribute(keyattr);
		if (typeof(key) != "string") {
			key = pkey;
		}
		if (typeof(key) == "string" && node.nodeType == 1
		&&	node.nodeName.toLowerCase() == "input"
		&&	node.name == inputname
		) {
			var stkey = "webat-" + key; // ensure my own property
			if (! dict[stkey]) {
				dict[stkey] = [];
				keys.push(key);
			}
			dict[stkey].push(node);
		}

		if (node.childNodes) {
			for (var i1 = node.childNodes.length; i1 > 0; --i1) {
				var i = i1 - 1;
				stack.push({ node: node.childNodes[i], pkey: key });
			}
		}
	}

	var result_foreach = function(cb) {
		for (var i = 0; i < keys.length; ++i) {
			var key = keys[i];
			var stkey = "webat-" + key;
			var val = dict[stkey];
			cb(key, val);
		}
	};

	return {
	  dict: dict
	, foreach: result_foreach
	};
};

manaba.bulkcheckboxballoon = function(e, root, keyattr, inputname, opt) {
	if (!opt) opt = {};
	var res = manaba.collect_input_by_keyattr(root, keyattr, inputname);
	var content_node = document.createElement('table');

	var representative_checkboxs = [];
	var idcnt = 1;
	res.foreach(function(key, associated_checkboxes) {
		var tr_node = document.createElement('tr');
		content_node.appendChild(tr_node);
		var td1_node = document.createElement('td');
		tr_node.appendChild(td1_node);
		var td1_label_node = document.createElement('label');
		td1_label_node.htmlFor = keyattr + "-id-" + idcnt;
		td1_node.appendChild(td1_label_node);
		var td1_text_node = document.createTextNode(key);
		td1_label_node.appendChild(td1_text_node);
		var td2_node = document.createElement('td');
		tr_node.appendChild(td2_node);
		var representative_checkbox = document.createElement('input');
		representative_checkbox.type = 'checkbox';
		representative_checkbox.id = keyattr + "-id-" + idcnt;
		td2_node.appendChild(representative_checkbox);
		representative_checkboxs.push(representative_checkbox);
		idcnt++;

		var checked_all = true;
		var unchecked_all = true;
		manaba.forEach(function(associated_checkbox){
			if (associated_checkbox.checked) {
				unchecked_all = false;
			} else {
				checked_all = false;
			}
		}, associated_checkboxes);

		if (! checked_all && ! unchecked_all) {
			representative_checkbox.indeterminate = true;
		} else if (checked_all) {
			representative_checkbox.checked = true;
		}

		manaba.addevent(representative_checkbox, 'click', function(e) {
			manaba.forEach(function(associated_checkbox) {
				associated_checkbox.checked = representative_checkbox.checked;
			}, associated_checkboxes);
		});
	});

	if (!opt["noselectall"]) {
		// 仕切り
		if (representative_checkboxs.length) {
			var tr_node = document.createElement('tr');
			content_node.insertBefore(tr_node,content_node.firstChild);
			var td1_node = document.createElement('td');
			td1_node.colSpan = 2;
			tr_node.appendChild(td1_node);
			var hr_node = document.createElement('hr');
			td1_node.appendChild(hr_node);
		}
		// 全選択
		// ラベル
		var tr_node = document.createElement('tr');
		content_node.insertBefore(tr_node,content_node.firstChild);
		var td1_node = document.createElement('td');
		td1_node.style.minWidth = '40px';
		tr_node.appendChild(td1_node);
		var td1_label_node = document.createElement('label');
		td1_label_node.htmlFor = keyattr + "-id-0";
		td1_node.appendChild(td1_label_node);
		var lang = gLang ? gLang : 'ja';
		var td1_text_node = document.createTextNode(lang == 'ja' ? '全選択' : 'Select All');
		td1_label_node.appendChild(td1_text_node);
		// input
		var td2_node = document.createElement('td');
		tr_node.appendChild(td2_node);
		var representative_checkbox = document.createElement('input');
		representative_checkbox.type = 'checkbox';
		representative_checkbox.id = keyattr + "-id-0";
		td2_node.appendChild(representative_checkbox);
		var allcheckbox = [];
		res.foreach(function(key, associated_checkboxes) {
			manaba.forEach(function(associated_checkbox){
				allcheckbox.push(associated_checkbox);
			}, associated_checkboxes);
		});
		var checked_all = true;
		var unchecked_all = true;
		manaba.forEach(function(associated_checkbox){
			if (associated_checkbox.checked) {
				unchecked_all = false;
			} else {
				checked_all = false;
			}
		}, allcheckbox);
		if (! checked_all && ! unchecked_all) {
			representative_checkbox.indeterminate = true;
		} else if (checked_all) {
			representative_checkbox.checked = true;
		}
		manaba.addevent(representative_checkbox, 'click', function(e) {
			manaba.forEach(function(associated_checkbox) {
				associated_checkbox.checked = representative_checkbox.checked;
			}, allcheckbox);
			manaba.forEach(function(associated_checkbox) {
				associated_checkbox.checked = representative_checkbox.checked;
			}, representative_checkboxs);
		});
	}

	return manaba.balloon(null, e, {
	  "content_node":content_node
	, "origin_top":"bottom"
	, "origin_left":"left"
	, "className":opt["className"]
	, "uniqueclass":opt["uniqueclass"]
	, "uniquetoggle":opt["uniqueclass"]
	});
};

manaba.formaccessor = function(theform, opt) {

	var local_QueryStartUnix = Date.now ? Date.now() : (new Date().getTime());

	var formtypemap = {};

	var changeeventhandlers = [];
	var addchangeevent = function(callback) {
		changeeventhandlers.push(callback);
	};
	var firechangeevent$ = function(name) {
		return function(e) {
			manaba.forEach(function(callback) {
				callback(name, e);
			}, changeeventhandlers);
		};
	};

	var useinputfile = opt && opt['useinputfile'];

	var formmap_inputtext = {}; // webat-$qid => inputtext
	var formmap_textarea = {}; // webat-$qid => textarea
	var formlist_radio = {}; // webat-$qid => [ radio ]
	var formlist_checkbox = {}; // webat-$qid => [ checkbox ]
	var formlist_select = {}; // webat-$qid => [ select ]
	var formmap_permutation_hidden = {}; // webat-$qid => hidden
	var formmap_permutation_li = {}; // webat-$qid => webat-$value => li
	var formlist_inputfile_hidden = {}; // $webat-$qid => [ hidden ]

	var getvalue_inputtext = function(name) {
		var input = formmap_inputtext['webat-' + name];
		return input.value;
	};

	var setvalue_inputtext = function(name, value) {
		var input = formmap_inputtext['webat-' + name];
		input.value = value;
	};

	var getvalue_textarea = function(name) {
		var textarea = formmap_textarea['webat-' + name];
		return textarea.value;
	};

	var setvalue_textarea = function(name, value) {
		var textarea = formmap_textarea['webat-' + name];
		textarea.value = value;
		manaba.forEach(function(updater) {
			updater();
		}, textarea['manaba_textarea_counter_updaters'] || []);
	};

	var getvalue_radio = function(name) {
		var radiolist = formlist_radio['webat-' + name];
		var value = null;
		manaba.forEach(function(input) {
			if (input.checked) {
				value = input.value;
			}
		}, radiolist);
		return value;
	};

	var setvalue_radio = function(name, value) {
		var radiolist = formlist_radio['webat-' + name];
		manaba.forEach(function(input) {
			if (input.value == value) {
				input.checked = true;
			}
		}, radiolist);
	};

	var getvalue_checkbox = function(name) {
		var checkboxlist = formlist_checkbox['webat-' + name];
		var value = null;
		var valuecount = 0;
		manaba.forEach(function(input) {
			if (input.checked) {
				if (valuecount == 0) {
					value = input.value;
				} else if (valuecount == 1) {
					value = [ value, input.value ];
				} else {
					value.push( input.value );
				}
				++valuecount;
			}
		}, checkboxlist);
		return value;
	};

	var setvalue_checkbox = function(name, value) {
		var checkboxlist = formlist_checkbox['webat-' + name];
		if (typeof(value) != "object") {
			value = [value];
		}
		var checkedmap = {};
		manaba.forEach(function(v) {
			checkedmap['webat-' + v] = true;
		}, value);

		manaba.forEach(function(checkbox) {
			var v = checkbox.value;
			if (('webat-' + v) in checkedmap) {
				checkbox.checked = true;
			} else {
				checkbox.checked = false;
			}
		}, checkboxlist);
	};

	var getvalue_select = function(name) {
		var selectlist = formlist_select['webat-' + name];
		var value = null;
		var valuecount = 0;
		manaba.forEach(function(select) {
			var v = manaba.selectoptionvalue(select);
			if (valuecount == 0) {
				value = v;
			} else if (valuecount == 1) {
				value = [ value, v ];
			} else {
				value.push( v );
			}
			++valuecount;
		}, selectlist);
		return value;
	};

	var setvalue_select = function(name, value) {
		var selectlist = formlist_select['webat-' + name];
		if (typeof(value) != "object") {
			value = [value];
		}
		manaba.forEach2(function(select, v) {
			manaba.forEach(function(option) {
				if (v == option.value) {
					option.selected = true;
				} else {
					option.selected = false;
				}
			}, select.getElementsByTagName("option"));
		}, selectlist, value);
	};

	var getvalue_permutation = function(name) {
		var hidden = formmap_permutation_hidden['webat-' + name];
		return hidden.value;
	};

	var setvalue_permutation = function(name, value) {
		manaba.resetPermutation(name);
		if (value) {
			manaba.forEach(function(v) {
				var li =
					formmap_permutation_li['webat-' + name] &&
					formmap_permutation_li['webat-' + name]['webat-' + v];
				manaba.selectPermutation(name, li, v);
			}, value.split(','));
		}
	};

	var getvalue_inputfile = function(name) {
		var inputlist = formlist_inputfile_hidden['webat-' + name];
		return inputlist ? manaba.map(function(input) {
			return input.value;
			}, inputlist) : null;
	};

	var setvalue_inputfile = function(name, value) {
		var inputlist = formlist_inputfile_hidden['webat-' + name];
		if (inputlist) {
			manaba.map(function(input){input.parentNode.removeChild(input);
			}, inputlist);
		}

		if (! value) {
			formlist_inputfile_hidden['webat-' + name] = null;
			return;
		}

		if (typeof(value) != "object") {
			value = [value];
		}
		formlist_inputfile_hidden['webat-' + name] = inputlist = [];

		manaba.forEach( function(v) {
			input = document.createElement('input');
			input.type = 'hidden';
			input.name = name;
			input.value = v;
			theform.appendChild(input);
			inputlist.push(input)
		}, value);
	};

	var table_getvalue =
	{	"webat-inputtext":getvalue_inputtext
	,	"webat-textarea":getvalue_textarea
	,	"webat-radio":getvalue_radio
	,	"webat-checkbox":getvalue_checkbox
	,	"webat-select":getvalue_select
	,	"webat-permutation":getvalue_permutation
	,	"webat-inputfile":getvalue_inputfile
	};

	var getvalue = function(name, cont) {
		var type = formtypemap['webat-' + name];
		if (type) {
			var valuegetter = table_getvalue['webat-' + type];
			if (valuegetter) {
				if (cont) {
					return cont(valuegetter(name));
				} else {
					return valuegetter(name);
				}
			}
		}
	};

	var table_setvalue =
	{	"webat-inputtext":setvalue_inputtext
	,	"webat-textarea":setvalue_textarea
	,	"webat-radio":setvalue_radio
	,	"webat-checkbox":setvalue_checkbox
	,	"webat-select":setvalue_select
	,	"webat-permutation":setvalue_permutation
	,	"webat-inputfile":setvalue_inputfile
	};

	var setvalue = function(name, value) {
		var type = formtypemap['webat-' + name];
		if (type) {
			var valuesetter = table_setvalue['webat-' + type];
			if (valuesetter) {
				return valuesetter(name, value);
			}
		}
	};

	manaba.forEach(function(input) {
		var name = input.name;
		var sch = name && firechangeevent$(name);
		if (sch) {
			if (input.type == 'text') {
				formtypemap['webat-' + name] = "inputtext";
				formmap_inputtext['webat-' + name] = input;
				manaba.addevent(input, 'change', sch);
				manaba.addevent(input, 'keyup', sch);
			} else if (input.type == 'radio') {
				formtypemap['webat-' + name] = "radio";
				var value = input.value;
				if (! formlist_radio['webat-' + name]) {
					formlist_radio['webat-' + name] = [];
				}
				formlist_radio['webat-' + name].push(input);
				manaba.addevent(input, 'change', sch);
			} else if (input.type == 'checkbox') {
				formtypemap['webat-' + name] = "checkbox";
				var value = input.value;
				if (! formlist_checkbox['webat-' + name]) {
					formlist_checkbox['webat-' + name] = [];
				}
				formlist_checkbox['webat-' + name].push(input);
				manaba.addevent(input, 'change', sch);
			} else if (input.type == 'file' && useinputfile == 1) {
				var match;
				if (match = name.match(/(.*)upload$/)) {
					var formname = match[1];
					formtypemap['webat-' + formname] = "inputfile";
				}
			}
		}
	}, theform.getElementsByTagName("input"));

	manaba.forEach(function(select) {
		var name = select.name;
		var sch = name && firechangeevent$(name);
		if (sch) {
			formtypemap['webat-' + name] = "select";
			if (! formlist_select['webat-' + name]) {
				formlist_select['webat-' + name] = [];
			}
			formlist_select['webat-' + name].push(select);
			manaba.addevent(select, 'change', sch);
		}
	}, theform.getElementsByTagName("select"));

	manaba.forEach(function(textarea) {
		var name = textarea.name;
		var sch = name && firechangeevent$(name);
		if (sch) {
			formtypemap['webat-' + name] = "textarea";
			formmap_textarea['webat-' + name] = textarea;
			manaba.addevent(textarea, 'change', sch);
			manaba.addevent(textarea, 'keyup', sch);
		}
	}, theform.getElementsByTagName("textarea"));

	manaba.forEach(function(ol) {
		if (manaba.any( manaba.hasClass$(ol)
		, ["queryselection", "multiselection", "powerselection"]
		)) {
			manaba.forEach(function(li) {
				manaba.forEach(function(input) {
					var name = input.name;
					var sch = name && firechangeevent$(name);
					if (sch) {
						manaba.addevent(li, 'click', sch);
					}
				}, li.getElementsByTagName('input'));
			}, manaba.grep(function(maybe_li) {
				if (manaba.reproduct95908) {
					return true;
				}
				return maybe_li.nodeType == 1 && maybe_li.nodeName.toLowerCase() == 'li';
			}, (function(maybe_lis) {
				if (manaba.reproduct227112) {
					return maybe_lis;
				}
				var is_ul = function(e) { return e && e.nodeType == 1 && e.nodeName.toLowerCase() == 'ul' };
				return maybe_lis && is_ul(maybe_lis[0]) && manaba.all(is_ul, maybe_lis) ? manaba.concatMap(function(e) { return manaba.map(function(i){return i}, e.childNodes) }, maybe_lis) : maybe_lis;
			})(ol.childNodes)));
		} else if (manaba.hasClass(ol, "permutation")) {
			var name = ol.id;
			var sch = name && firechangeevent$(name);
			if (sch) {
				formtypemap['webat-' + name] = "permutation";
				manaba.forEach(function(li) {
					manaba.addevent(li, 'click', sch);
					var value = li.getAttribute('data-webat-formvalue-permutation');
					if (value) {
						if (! formmap_permutation_li['webat-' + name]) {
							formmap_permutation_li['webat-' + name] = {};
						}
						formmap_permutation_li['webat-' + name]['webat-' + value] = li;
					}
				}, manaba.grep(function(maybe_li) {
					return maybe_li.nodeType == 1 && maybe_li.nodeName.toLowerCase() == 'li';
				}, (function(maybe_lis) {
					if (manaba.reproduct227112) {
						return maybe_lis;
					}
					var is_ul = function(e) { return e && e.nodeType == 1 && e.nodeName.toLowerCase() == 'ul' };
					return maybe_lis && is_ul(maybe_lis[0]) && manaba.all(is_ul, maybe_lis) ? manaba.concatMap(function(e) { return manaba.map(function(i){return i}, e.childNodes) }, maybe_lis) : maybe_lis;
				})(ol.childNodes)));
				var undoelem = document.getElementById("" + name + "-permutation-undo");
				if (undoelem) {
					manaba.addevent(undoelem, 'click', sch);
				}
			}
		}
	}, theform.getElementsByTagName("ol"));

	var hidden_querystartunix;

	// after formmap built
	manaba.forEach(function(input) {
		var name = input.name;
		if (input.type == 'hidden') {
			if (formtypemap['webat-' + name] == "permutation") {
				formmap_permutation_hidden['webat-' + name] = input;
			}
			if (formtypemap['webat-' + name] == "inputfile") {
				if (! formlist_inputfile_hidden['webat-' + name] ) {
					formlist_inputfile_hidden['webat-' + name] = [];
				}
				formlist_inputfile_hidden['webat-' + name].push(input);
			}
			if (name === "QueryStartUnix") {
				hidden_querystartunix = input;
			}
		}
	}, theform.getElementsByTagName("input"));

	var getquerystartunix = function(cont) {
		if (hidden_querystartunix) {
			if (cont) {
				return cont(hidden_querystartunix.value);
			} else {
				return hidden_querystartunix.value;
			}
		}
	};

	var updatequerystartunix = function() {
		var local_QueryStartUnix2 = Date.now ? Date.now() : (new Date().getTime());
		var diffmsec = local_QueryStartUnix2 - local_QueryStartUnix;

		if (hidden_querystartunix) {
			hidden_querystartunix.value = String(
			  parseInt(hidden_querystartunix.value) + Math.round(diffmsec / 1000)
			  );
		}

		local_QueryStartUnix = local_QueryStartUnix2;
	};

	var listnames = function() {
		return manaba.map(function(k) {
			return k.substring(6 //'webat-'.length
			);
		}, manaba.grep(function(k) {
			return k.indexOf('webat-') == 0;
		}, Object.keys(formtypemap)));
	};

	var valuemap = function() {
		var ret = {};
		manaba.forEach(function(name) {
			getvalue(name, function(v) {
				ret[name] = v;
			});
		}, listnames());
		return ret;
	};

	return {
		"getValue":getvalue
	,	"setValue":setvalue
	,	"addChangeEvent":addchangeevent
	,	"listNames": listnames
	,	"valueMap": valuemap
	,	"formType":function(name) { return formtypemap['webat-' + name]; }
	,	"getQueryStartUnix":getquerystartunix
	,	"updateQueryStartUnix":updatequerystartunix
	};
};

manaba.wsbindformtochannel = function(theform, channel) {
	if (! theform) { return; }

	var formaccessor = manaba.formaccessor(theform);

	var scheduled_at = {};

	var sendid = 1;
	var send_by_namelist = function(channel,namelist) {
		if (namelist.length == 0) {
			return;
		}
		var now = Date.now ? Date.now() : (new Date().getTime());
		manaba.ws.send(JSON.stringify(
		{	"cmd":"send"
		,	"sendid":sendid
		,	"channel":channel
		,	"formvalues":manaba.map(function(name) {
				var past = scheduled_at['webat-' + name];
				return {
					"name":name
				,	"value":formaccessor.getValue(name)
				,	"age":( past ? now - past : null )
				};
			}, namelist)
		}));
		++sendid;
	};

	var send_by_name = function(channel,name) {
		return send_by_namelist(channel, [name]);
	};

	var scheduled_names = {};
	var inprocess_names = {};
	var send_scheduled_names = function() {
		if (manaba.ws.readyState != 1) {
			return;
		}
		var names = manaba.map(function(k) {
			return k.substring(6 //'webat-'.length
			);
		}, manaba.grep(function(k) {
			return k.indexOf('webat-') == 0;
		}, Object.keys(scheduled_names)));
		manaba.forEach(function(name) {
			inprocess_names['webat-' + name] = scheduled_names['webat-' + name];
			delete scheduled_names['webat-' + name];
		}, names);
		send_by_namelist(channel, names);
	};

	var schedule_name = function(name, e) {
		scheduled_names['webat-' + name] = sendid;
		scheduled_at['webat-' + name] = Date.now ? Date.now() : (new Date().getTime());
	};

	var reschedule_inprocess = function() {
		manaba.forEach(function(k) {
			if (k.indexOf('webat-') == 0) {
				scheduled_names[k] = sendid;
				delete inprocess_names[k];
			}
		}, Object.keys(inprocess_names));
	};

	formaccessor.addChangeEvent( schedule_name );

	manaba.WebSocketSubscriptionHandlers['webat-' + channel] = function(m) {
		console.log(m.data);
		var data = JSON.parse(m.data);
		if (data['cmd'] == 'send') {
			if (data['echo']) {
				var sendid = data['sendid'];
				manaba.forEach(function(formvalue) {
					var name = formvalue['name'];
					// var value = formvalue['value'];
					var sendid_inprocess = inprocess_names['webat-' + name];
					if (sendid && sendid_inprocess && sendid == sendid_inprocess) {
						delete inprocess_names['webat-' + name];
					}
				}, data['formvalues']);
			} else {
				var now = Date.now ? Date.now() : (new Date().getTime());
				manaba.forEach(function(formvalue) {
					var name = formvalue['name'];
					var value = formvalue['value'];
					var age_remote = formvalue['age'];
					var age_local;
					if (scheduled_at['webat-' + name]) {
						age_local = now - scheduled_at['webat-' + name];
					}

					if (typeof(age_local) != 'number'
					|| (typeof(age_remote) == 'number' && age_remote < age_local)
					) {
						formaccessor.setValue(name, value);
					}
				}, data['formvalues']);
			}
		}
	};

	manaba.WebSocketSubscriberIntervalHandlers.push(send_scheduled_names);
	manaba.WebSocketSubscriberErrorHandlers.push(reschedule_inprocess);
	manaba.WebSocketSubscriberConnectionErrorHandlers.push(reschedule_inprocess);
};

manaba.alertballoon = function(msg, e, opt) {
	var content_node = document.createTextNode(msg);

	return manaba.balloon(null, e, {
		"content_node":content_node
	,   "origin_top":"top"
	,   "origin_left":"right"
	,	"offset_top":-30
	,	"className":opt["className"]
	,	"uniqueclass":opt["uniqueclass"]
	,	"override_target":opt["override_target"]
	,	"closeonbodyclick":false
	});
};

manaba.wsalertchannel = function(channel) {
	manaba.WebSocketSubscriptionHandlers['webat-' + channel] = function(m) {
		var data = JSON.parse(m.data);
		console.log(data);
		if (typeof(data['content']) == 'string') {
			var msg = data['content'];
			manaba.alertballoon(msg, null, {
				"override_target":manaba.wsindicator
			,	"uniqueclass":"wsalertballoon"
			});
		}
	};
};

manaba.sendbrowsertimeonsubmit = function(form, names) {
 var hiddens = manaba.map(function(name) {
  var hidden = document.createElement('input');
  hidden.type = 'hidden';
  hidden.name = name;
  var now = Date.now ? Date.now() : (new Date().getTime());
  hidden.value = now.toString();
  return hidden;
 }, names);

 manaba.forEach(function(hidden){
  form.appendChild(hidden);
 }, hiddens);

 manaba.addevent(form, 'submit', function() {
  var now = Date.now ? Date.now() : (new Date().getTime());
  manaba.forEach(function(hidden) {
   hidden.value = now.toString();
  }, hiddens);
  return true;
 });
};

manaba.xhrformupdater = function(form, action, button, interval) {
	var fa = manaba.formaccessor(form);

	var updater = function() {
		var obj = fa.valueMap();
		fa.getQueryStartUnix(function(v){ obj['QueryStartUnix'] = v; });
		// fa.updateQueryStartUnix();
		var json = JSON.stringify(obj);
		var now = Date.now ? Date.now() : (new Date().getTime());
		var requestbody =
		"JSON=" + encodeURIComponent(json)
		+ "&" + encodeURIComponent(button) + "=1"
		+ "&" + "RefBrowserTime=" + encodeURIComponent(now.toString())
		;

		var request = CreateXMLHttpRequest();
		request.onreadystatechange = function () {
			if (request.readyState == 4) {

				console.log(request.status);
				console.log(request.responseText);
			}
		};
		request.open('POST', action , true);
		request.setRequestHeader ('Content-Type', 'application/x-www-form-urlencoded');
		request.send(requestbody);

		if (interval) { window.setTimeout(updater, interval); }
	};
	if (interval) { window.setTimeout(updater, interval); }

	return updater;
};

manaba.dict = function() {
 var d = {};
 var keys = function() {
  return manaba.map(function(k) {
   return k.substring(2 /* 'd-'.length */);
  }, manaba.grep(function(k) {
   return k.indexOf('d-') == 0;
  }, Object.keys(d)));
 };
 var has = function(k) { return ('d-' + k) in d; };
 var get = function(k, v0) { return has(k) ? d['d-' + k] : v0; };
 var put = function(k, v1) {
  var v0 = d['d-' + k];
  d['d-' + k] = v1;
  return v0;
 };
 var del = function(k) {
  var v0 = d['d-' + k];
  delete d['d-' + k];
  return v0;
 };
 d['keys'] = keys;
 d['has'] = has;
 d['get'] = get;
 d['put'] = put;
 d['del'] = del;
 d['forEach'] = function(cb) {
  manaba.forEach(function(k) {
   cb(k, get(k));
  }, keys());
 };
 return d;
};

manaba.xhrformupdater2 = function(form, action, button, interval) {
 manaba.sessionalert.formupdater_use = true;
 if (manaba.sessionalert_loggedoutclass || manaba.sessionalert_offlineclass) {
  manaba.sessionalert.addBanner();
 } 

 var fa = manaba.formaccessor(form, {
  'useinputfile':1
 });

 var sendid = 1;

 var scheduled_names = manaba.dict();
 var inprocess_names = manaba.dict();

 var schedule_name = function(name, e) {
  scheduled_names.put(name, [sendid, Date.now ? Date.now() : (new Date().getTime())]);
 };

 fa.addChangeEvent( schedule_name );

 var updater = function() {
  scheduled_names.forEach(function(k, s) {
   scheduled_names.del(k);
   inprocess_names.put(k, s);
  });
  var now = Date.now ? Date.now() : (new Date().getTime());
  var obj = {};
  var msecago = {};
  var obj_meta =
  { 'msecago': msecago
  };

  manaba.forEach(function(k) {
   obj[k] = null;
   msecago[k] = 'GET';
  }, fa.listNames());

  inprocess_names.forEach(function(k, s) {
   var input_at = s[1];
   obj[k] = fa.getValue(k);
   msecago[k] = Math.max(0, now - input_at);
  });
  fa.getQueryStartUnix(function(v){ obj['QueryStartUnix'] = v; });
  // fa.updateQueryStartUnix();
  var json = JSON.stringify(obj);
  var json_meta = JSON.stringify(obj_meta);

  var requestbody =
  "JSON=" + encodeURIComponent(json)
  + "&" + "JSONMeta=" + encodeURIComponent(json_meta)
  + "&" + "sendid=" + encodeURIComponent(sendid++)
  + "&" + encodeURIComponent(button) + "=1"
  ;

  var checkloggedout = function(req, action) {
   var ret;
   if (req.responseURL.indexOf(action) != -1) {
    if (req.responseText.indexOf('<!-- MARKER_NOT_LOGGED_IN  -->') != -1) {
     ret = 'loggedout';
    }
// } else if (manaba.sessioncheck_checkredirect) {
//  ret = 'redirect'; // ドメイン内リダイレクトならば何もしない
   }
   return ret;
  }

  var request = CreateXMLHttpRequest();
  request.onreadystatechange = function () {
   if (request.readyState == 4) {
    if (request.status == 200) {
     try {
      var res = JSON.parse(request.responseText);
      if (res['status'] === 'ok') {
       console.log(res);
       var sendid1 = res['sendid'];
       var res_output = res['output'];
       var output_olddata = res_output && res_output['olddata'];
       var output_newdata = res_output && res_output['newdata'];
       var output_names = res_output && res_output['names'];

       inprocess_names.forEach(function(k, s) {
        var sendid0 = s[0];
        if (sendid0 <= sendid1) {
         // inprocess data successfully saved
         inprocess_names.del(k);
        }
       });
       manaba.forEach(function(k) {
        if (scheduled_names.has(k)) {
         // user already input new data
        } else if (inprocess_names.has(k)) {
         // inprocess data still exists
        } else if (output_newdata && k in output_newdata) {
         // saved data is newer
        } else if (output_olddata && k in output_olddata) {
         // remote data is newer
         fa.setValue(k, output_olddata[k]);
        }
        }, fa.listNames());
       if (manaba.sessionalert_loggedoutclass) {
        manaba.removeClass(document.body, manaba.sessionalert_loggedoutclass);
       }
      } else {
       console.log(request.responseText);
      }
     } catch(e) {
      // ここでの exception は通信後の処理に対してのもの
      if (manaba.sessionalert_loggedoutclass && checkloggedout(request, action)) {
       manaba.sessionalert.dispSessionLoggedout();
      } else {
       throw e;
      }
     } finally { };
    } else {
     console.log(request.status);
     console.log(request.responseText);
    }
   }
  };

  if (manaba.sessionalert_loggedoutclass || manaba.sessionalert_offlineclass) {
   request.onerror = function(evt) {
    if (manaba.sessionalert_offlineclass && !navigator.onLine) {
     manaba.sessionalert.dispSessionOffline();
    } else if (manaba.sessioncheck_checkredirect) {
     if (manaba.sessionalert_loggedoutclass) {
      manaba.sessionalert.dispSessionLoggedout();
     }
    }
   };
  }

  request.open('POST', action , true);
  request.setRequestHeader ('Content-Type', 'application/x-www-form-urlencoded');
  request.send(requestbody);

  if (interval) { window.setTimeout(updater, interval); }
 };
 if (interval) { window.setTimeout(updater, interval); }

 return updater;
};

manaba.spentclockupdater = function(opt) {
 var nodeid = opt['nodeid'];
 var base = opt['base'];
 var freeze = opt['freeze'];

 var node = document.getElementById(nodeid);
 if (! node) {
  return;
 }

 var loadtime = manaba.dateLoaded.getTime();

 var format02d = function(x) { return x < 10 ? ("0" + x) : x; }
 var updater;
 updater = function() {
  var spent = base;
  if (! freeze) {
   var currentdate = new Date();
   var diff = currentdate.getTime() - loadtime;
   spent = base + Math.round(diff / 1000);
  }

  if (! manaba.reproduct239249) {
    node = document.getElementById(nodeid);
  }

  var r = spent;

  var ss = format02d(r % 60);
  r = Math.floor(r / 60);
  var mm = format02d(r % 60);
  r = Math.floor(r / 60);
  var hh = format02d(r);

  while (node.firstChild) {
   node.removeChild (node.firstChild);
  }
  node.appendChild(document.createTextNode(
   hh + ":" + mm + ":" + ss
   ));

  if (! freeze) {
   setTimeout(updater, 1000);
  }
 };
 return updater;
};

manaba.restclockupdater = function(opt) {

 var nodeid = opt['nodeid'];
 var base = opt['base'];
 var freeze = opt['freeze'];
 var proceedbutton = opt['proceedbutton'];
 var classredontimescarce = opt['classredontimescarce'];
 var classbgredontimeup = opt['classbgredontimeup'];
 var classdisableontimeup = opt['classdisableontimeup'];

 var node = document.getElementById(nodeid);
 if (! node) {
  return;
 }

 var nodesredontimescarce = [ node ];
 if (classredontimescarce) {
  manaba.forEach(function(e){nodesredontimescarce.push(e);}, document.getElementsByClassName(classredontimescarce));
 }
 var nodesbgredontimeup = [ node ];
 if (classbgredontimeup) {
  manaba.forEach(function(e){nodesbgredontimeup.push(e);}, document.getElementsByClassName(classbgredontimeup));
 }
 var nodesdisableontimeup = [];
 if (classdisableontimeup) {
  manaba.forEach(function(e){nodesdisableontimeup.push(e);}, document.getElementsByClassName(classdisableontimeup));
 }

 var loadtime = manaba.dateLoaded.getTime();

 var format02d = function(x) { return x < 10 ? ("0" + x) : x; }
 var updater;
 updater = function() {
  var rest = base;
  if (! freeze) {
   var currentdate = new Date();
   var diff = currentdate.getTime() - loadtime;
   rest = base - Math.round(diff / 1000);
  }

  if (! manaba.reproduct239249) {
    node = document.getElementById(nodeid);
  }

  var r;
  if (rest <= 0) {
   r = 0;

   manaba.forEach(function(e) {
    e.style.color = 'white';
    e.style.backgroundColor = 'red';
   }, nodesbgredontimeup);

   manaba.forEach(function(e) {
    e.disabled = true;
   }, nodesdisableontimeup);

  } else if (rest < 600) {
   r = rest;
   manaba.forEach(function(e) {
    e.style.color = 'red';
   }, nodesredontimescarce);
  } else {
   r = rest;
  }

  var ss = format02d(r % 60);
  r = Math.floor(r / 60);
  var mm = format02d(r % 60);
  r = Math.floor(r / 60);
  var hh = format02d(r);

  while (node.firstChild) {
   node.removeChild (node.firstChild);
  }
  node.appendChild(document.createTextNode(
   hh + ":" + mm + ":" + ss
   ));

  if (! freeze && proceedbutton && rest <= 0) {
   var form = manaba.findParentNode(node, "form");
   manaba.submit_with_button(form, proceedbutton);
   if (! manaba.reproduct111596) {
    freeze = 1;
   }
  }

  if (! freeze) {
   setTimeout(updater, 1000);
  }
 };
 return updater;
};

manaba.setURLQuery = function (key, value) {
 location.search = manaba.setURLQueryProcess(location.search, key, value);
}

manaba.setURLQueryProcess = function (loc, key, value) {
 var r = new RegExp('([\\?&])'+key+'=[^&]*(&|$)', 'g');
 var v = encodeURIComponent(value);
 var l = loc;
 if (loc.match(r)) {
  l = loc.replace(r, '$1'+key+'='+v+'$2');
 } else {
  if (loc == null || loc == '') {
   l = '?'+key+'='+v;
  } else {
   l = l+'&'+key+'='+v;
  }
 }
 return l;
}

manaba.offsetHideLevel = function(root, offset, opt) {
 var attr_hidelevel = opt['attr-hidelevel'];
 var attr_display_on_show = opt['attr-display-on-show'];
 var class_hidelevel_lez = opt && 'class-hidelevel-lez' in opt && opt['class-hidelevel-lez'];
 var class_hidelevel_eqz = opt && 'class-hidelevel-eqz' in opt && opt['class-hidelevel-eqz'];
 if (root) {
  var node_lez = class_hidelevel_lez ? getElementsByClass(class_hidelevel_lez, root) : [];
  var node_eqz = class_hidelevel_eqz ? getElementsByClass(class_hidelevel_eqz, root) : [];
  manaba.forEach( function(node) {
   var lv = node.getAttribute(attr_hidelevel);
   try {
    lv = parseInt(lv);
    lv += offset;
    node.setAttribute(attr_hidelevel, String(lv))
   } finally { };
  }, node_lez.concat(node_eqz));
  manaba.forEach( function(node) {
   var lv = node.getAttribute(attr_hidelevel);
   try {
    lv = parseInt(lv);
    if (lv <= 0) {
     node.style.display = node.getAttribute(attr_display_on_show);
    } else {
     node.style.display = "none";
    }
   } finally { };
  }, node_lez);
  manaba.forEach( function(node) {
   var lv = node.getAttribute(attr_hidelevel);
   try {
    lv = parseInt(lv);
    if (lv == 0) {
     node.style.display = node.getAttribute(attr_display_on_show);
    } else {
     node.style.display = "none";
    }
   } finally { };
  }, node_eqz);
 }
};

manaba.ajax = function(url, option, callback) {
  var method = option.method || 'GET';
  var header = option.header || [];
  var data   = option.data || {};
  var checksso = option.checksso;
  var isFormData = (data.toString().indexOf('FormData') > 0);
  var request = new XMLHttpRequest();
  // readyState 属性が変更する都度呼び出されるイベントリスナー | send()より前に設定すること
  request.onreadystatechange = function () {
    if (this.readyState == 4) { // 一連の動作が完了した。
      var type = this.getResponseHeader('content-type');
      if (checksso && !type) {} // including sso redirect
      else if (type.indexOf('application/json') > -1) type = 'json';
      else if (type.indexOf('text/html') > -1) type = 'text';
      var data = this.responseText;
      // レスポンスJSONをオブジェクトに変換
      if (type === 'json') {
        if (checksso) {
          try { data = JSON.parse(data) }
          catch (e) { console.log(e); data = null; } // i.e. parse error
        } else {
          data = JSON.parse(data);
        }
      }
      callback(this.status, data, type);
    // } else if (this.readyState == 3) { // ダウンロード中。responseText は断片的なデータを保持
    // } else if (this.readyState == 2) { // send() が呼び出し済みで、ヘッダーとステータスが利用可能。
    // } else if (this.readyState == 1) { // open() が呼び出し済み。
    }
  }
  // データとURLの設定
  if (method === 'GET') { // GETの場合は、データはurlに付加
    data._ = Date.now(); // IE対応 キャッシュ無効化
    url = manaba.queryString(data, url);
    data = null;
  } else { // GET以外は、urlにはキャッシュ無効化クリエのみ付加
    url = manaba.queryString({ _: Date.now}, url);
    if (!isFormData) { // データがFormDataではない場合は、クエリ文字列に変換する
      data = manaba.queryString(data);
    }
  }
  // ヘッダーの設定
  header['Accept'] = 'application/json, text/javascript, */*; q=0.01'; //JSON形式を優先受入
  if (method !== 'GET' && !isFormData) {
    header['Content-Type'] = 'application/x-www-form-urlencoded';
  }
  // リクエストを初期化
  request.open(method, url);
  // リクエストヘッダーセット
  for (var key in header) {
    request.setRequestHeader(key, header[key]);
  }
  // request.timeout = 20000;
  // リクエストを送信
  request.send(data);
}

manaba.queryString = function(data, url) {
  var queryString = '', sep = '';
  for (var key in data) {
    queryString += sep+key+'='+ encodeURIComponent(data[key]);
    sep = '&';
  }
  if (url) {
    if (queryString) {
      url += ((url.indexOf('?') > 0)? '&' : '?') + queryString;
    }
    return url
  }
  return queryString;
}

// ファイルサイズを数値に直す
// 6B | 102KB | 2,500KB | 800MB ような文字列を変換できる
manaba.filesize = function(sizestr) {
  var s   = sizestr.split(',').join('');
  var suf = ( (s.match(/(B|KB|MB|GB|TB)$/gi) || [])[0] || 'B' ).toUpperCase();
  var num = parseFloat(s.match(new RegExp(/^[0-9]+(\.[0-9]+)?/))[0]);
  var mul = 1024;
  switch (suf) {
    case 'B':  return num;
    case 'KB': return num * Math.pow(mul, 1);
    case 'MB': return num * Math.pow(mul, 2);
    case 'GB': return num * Math.pow(mul, 3);
    case 'TB': return num * Math.pow(mul, 4);
  }
}

manaba.dragger = function(el, drag){
  drag = drag || el;
  var move_flg = false;
  var x, y; // 相対位置
  var rect = el.getBoundingClientRect();// 位置座標
  var root = document.documentElement;
  var left = window.pageXOffset || root.scrollLeft;
  var top  = window.pageYOffset || root.scrollTop;
  el.style.position = 'absolute';
  el.style.left = (rect.left + left) + 'px';
  el.style.top  = (rect.top  + top ) + 'px';

  drag.onmousedown = function(e) {
    e = e || window.event;
    if((e.target || e.srcElement) === drag) {
      move_flg = true;
      var rect = el.getBoundingClientRect();
      var left = window.pageXOffset || root.scrollLeft;
      var top  = window.pageYOffset || root.scrollTop;
      x = e.offsetX || e.layerX;
      y = e.offsetY || e.layerY;
      el.style.left = (left + rect.left) + 'px';
      el.style.top  = (top  + rect.top ) + 'px';
      //el.style.position = 'absolute'; // ドラッグ中はabsoluteに
      return false;
    }
  };
  document.onmouseup = function(e) {
    move_flg = false;
    var rect = el.getBoundingClientRect();
    el.style.left = rect.left + 'px';
    el.style.top  = rect.top  + 'px';
   // el.style.position = 'relative'; // ドラッグが終わったらfixedに
  };
  document.onmousemove = function(e) {
    e = e || window.event;
    if(move_flg) {
      var left = window.pageXOffset || root.scrollLeft;
      var top  = window.pageYOffset || root.scrollTop;
      el.style.left = (left + e.clientX - x) + 'px';
      el.style.top  = (top  + e.clientY - y) + 'px';
      return false;
    }
  };
};

manaba.tpanel_qrbox = function(self) {
  return manaba.tpanel(self, {loadcallback: function(){
    var qrbox = document.getElementById('attend-qr-content');
    var dragg = document.getElementsByClassName('course-name')[0];
    dragg.style.cursor = 'move';
    dragg.onclick = function(e) {
      e.stopPropagation();
      return false;
    };
    manaba.dragger(qrbox, dragg);
  }});
};

manaba.respon_showloader = function(opt){
  var $tpanel = document.getElementById('tpanel_frame');
  if (! $tpanel) {
	$tpanel = manaba.tpanel_make();
  }

  var $loaderBg = document.createElement('div');
  $loaderBg.id = 'loader_bg';
  $loaderBg.style.background = 'rgb(0,0,0,0)';
  $loaderBg.style.position = 'fixed';
  $loaderBg.style.height = '100%';
  $loaderBg.style.width = '100%';
  $loaderBg.style.top = '0px';
  $loaderBg.style.left = '0px';
  $loaderBg.style.textAlign = 'center';
  $loaderBg.style.zIndex = '9999';
  document.body.appendChild($loaderBg);

  var $loaderTxt = document.createElement('p');
  $loaderTxt.style.fontSize = '24px';
  $loaderTxt.style.color = 'white';
  $loaderTxt.style.marginTop = '25%';
  $loaderTxt.style.opacity = 0;
  $loaderTxt.innerHTML = (gLang == "ja" ? '処理中です。お待ちください。' : 'Operation in progress, please wait.');
  $loaderBg.appendChild($loaderTxt);

  var pos = 0;
  manaba.respon_showloader_id = setInterval(function () {
    if (pos >= 100) {
      clearInterval(manaba.respon_showloader_id);
    } else {
      pos += 10;
      if (pos > 50) {
        if ($tpanel) {
          $tpanel.style.opacity = 1 - pos / 100;
        }
		$loaderTxt.style.opacity = pos / 100;
      }
    }
  }, 10);
}

manaba.respon_hideloader = function() {
  clearInterval(manaba.respon_showloader_id);
  var $loaderBg = document.getElementById('loader_bg');
  if ($loaderBg) {
    $loaderBg.parentNode.removeChild($loaderBg);
  }
}

manaba.copyText = function(element) {
 if (! element) return false;
 if (! document.execCommand) return false;
 var type = typeof(element);
 if (type.match(/^string$/i)) {
  var tmp = document.createElement('div');
  tmp.appendChild(document.createElement('pre')).textContent = element;
  tmp.style.position = 'fixed';
  tmp.style.left = '-100%';
  document.body.appendChild(tmp);
  document.getSelection().selectAllChildren(tmp);
  var result = document.execCommand('copy');
  document.body.removeChild(tmp);
  return result;
 } else if (element.tagName && element.tagName.match(/^(input|textarea)$/i)) {
  element.select();
  return document.execCommand('copy');
 }
 return false;
}

manaba.checkTimeLimit = function(nmstarttime,nmendtime,nmtimelimit) {
 var starttime = document.getElementsByName(nmstarttime)[0].value.trim();
 var endtime = document.getElementsByName(nmendtime)[0].value.trim();
 var otl = document.getElementsByName(nmtimelimit)[0];
 var timelimit = otl.value.trim();
 if (!starttime || !endtime || !timelimit) {
  otl.style.backgroundColor='';
  return;
 }
 var ds = new Date(starttime.replace(/\s/, "T"));
 var de = new Date(endtime.replace(/\s/, "T"));
 var ntl = Number(timelimit);
 var interval = (de.getTime() - ds.getTime())/1000;
 if (ntl > 0 && interval > 0 && ntl*60 >= interval) {
  if (otl.style.backgroundColor != 'red') {
   otl.style.backgroundColor='red';
   var alertmsg = (gLang == "ja" ? '制限時間は受付期間より短く設定して下さい。' 
                                 : 'Please set "Time Limit" shorter than the period.');
   return alert(alertmsg);
  }
 } else {
  otl.style.backgroundColor='';
 }
}

manaba.checkPublishEndTime = function(nmstarttime, nmendtime) {
 var starttime = document.getElementsByName(nmstarttime)[0].value.trim();
 var endtime = document.getElementsByName(nmendtime)[0].value.trim();
 var errMsgOpposite = (gLang == "ja" ? '公開終了日時が公開開始日時より前に設定されています。よろしいですか？'
                                      : '"Start time" and "End time" are opposite. Are you sure to publish?');
 var errMsgPast = (gLang == "ja" ? '公開終了日時が過去の日時に設定されています。よろしいですか？'
                                  : '"End time" has been set in the past. Are you sure to publish?');
 return manaba.checkEndTime(endtime, starttime, errMsgOpposite, errMsgPast);
}

manaba.checkEndTime = function(endtime, starttime, errMsgOpposite, errMsgPast) {
 var et = new Date(endtime.replace(/\s/, "T"));
 if (starttime) {
  var st = new Date(starttime.replace(/\s/, "T"));
  if ( et.getTime() < st.getTime() ) {
   var confirmmsg = errMsgOpposite || (gLang == "ja" ? '受付終了日時が受付開始日時より前に設定されています。公開しますか？'
                                                     : '"Start time" and "End time" are opposite. Are you sure to publish?');
   var ret = confirm(confirmmsg);
   if (!ret) { return false; }
  }
 }
 var current = new Date();
 if ( current.getTime() > et.getTime() ) {
  var confirmmsg = errMsgPast || (gLang == "ja" ? '受付終了日時が過去の日時に設定されています。公開しますか？'
                                                : '"End time" has been set in the past. Are you sure to publish?');
   return confirm(confirmmsg);
 }
 return true;
}

manaba.checkReceiptDuration = function(nmstarttime, nmendtime) {
 var starttime = document.getElementsByName(nmstarttime)[0].value.trim();
 var endtime = document.getElementsByName(nmendtime)[0].value.trim();
 var errMsgOpposite = (gLang == "ja" ? '受付終了日時が受付開始日時より前に設定されています。よろしいですか？'
                                     : '"Start time" and "End time" are opposite. Are you sure to continue?');
 var errMsgPast = (gLang == "ja" ? '受付終了日が過去の日時に設定されています。よろしいですか？'
                                 : '"End time" has been set in the past. Are you sure to continue?');
 return manaba.checkEndTime(endtime, starttime, errMsgOpposite, errMsgPast);
}


manaba.checkExtension = function(nmsubmitfile, ext) {
 var submitfn = document.getElementsByName(nmsubmitfile)[0].value.trim();
 if (!submitfn) {
  return true;
 }
 var regexp = new RegExp('^.*\.'+ext+'$', 'i');
 if (!submitfn.match(regexp)) {
  var alertmsg = (gLang == "ja" ? 'このファイルは'+ext+'ファイルではありません。'
                                : 'Only '+ext+' files can be uploaded.');
  window.alert(alertmsg);
  return false;
 }
 return true;
}

function foldUnfoldAll(a,foldbtn,allopen,closed) {
 var arr = document.getElementsByClassName(foldbtn);
 for (i = 0; i < arr.length; i ++) {
  if(manaba.hasClass(a,allopen) == manaba.hasClass(arr[i],closed)) arr[i].click();
 }
 return true;
}

manaba.action_post = function(action, form) {
 form.action = action;
 form.method = "POST";

 document.body.appendChild(form);
 form.submit();
 document.body.removeChild(form);
}

manaba.action_post_ltidl = function(deploymentid, courseoid) {
 var ltiform, form2ltidl;
 if (ltiform = document.forms["qaddinlinefile"]) {
  form2ltidl = {
   "title_local": "title",
   "custom_local": "custom"
  };
 } else if (ltiform = document.forms["examlti"]) {
  form2ltidl = {
   "QuerySetNameLoc": "title",
   "Predescription": "text",
   "custom_local": "custom"
  };
 } else {
  // 想定しているformがない
  return;
 }

 const form = document.createElement("form");
 form.target = "ltidl";

 Object.keys(form2ltidl).map(function(formname) {
  var value = ltiform[formname].value;
  var newinput = document.createElement("input");
  newinput.type = "hidden";
  newinput.name = form2ltidl[formname];
  newinput.value = value;
  form.appendChild(newinput);
 });

 return manaba.action_post("rpc_lti_dl_d" + deploymentid + "c" + courseoid, form);
}

manaba.ltiswitchview_to_student = function(obj) {
 manaba.ltiswitchview_to(obj, 'student');
}

manaba.ltiswitchview_to_teacher = function(obj) {
 manaba.ltiswitchview_to(obj, 'teacher');
}

manaba.ltiswitchview_to = function(obj, role) {
 var outerdiv = obj.parentNode.parentNode.parentNode;
 var blocks_to_teacher = outerdiv.getElementsByClassName('buttonarea_switchview_teacher');
 if (blocks_to_teacher.length) {
  blocks_to_teacher[0].style.display = ((role == 'teacher') ? 'inline' : 'none');
 }
 var blocks_to_student = outerdiv.getElementsByClassName('buttonarea_switchview_student');
 if (blocks_to_student.length) {
  blocks_to_student[0].style.display = ((role == 'student') ? 'inline' : 'none');
 }

 var newurl = obj.getAttribute('data-webat-url');
 var ltiinlineiframeobj = outerdiv.getElementsByClassName('ltiinlineiframe');
 if (ltiinlineiframeobj.length) {
  ltiinlineiframeobj[0].contentWindow.location.replace(newurl);
 } else {
  var ltiinlinelinkobj = outerdiv.getElementsByClassName('ltiinlinelink');
  if (ltiinlinelinkobj.length) {
   ltiinlinelinkobj[0].setAttribute('href', newurl);
  }
 }
}

manaba.queryresult.autocheck = {};
manaba.queryresult.autocheck.qids = [];
manaba.queryresult.autocheck.lastcheck = null;
manaba.queryresult.autocheck.interval = 0;
manaba.queryresult.autocheck.tmid = null;
manaba.queryresult.autocheck.pause = false;
manaba.queryresult.autocheck.notopen = false;

manaba.queryresult.autocheck.getResultsLatest = function (swelm, url) {
  if (!manaba.useQueryResultAutoCheckInterval) return;
  if (!swelm || !url) return;
  if (manaba.hasClass(swelm.parentNode, 'swdisabled')) return;

  var qids = this.qids;
  if (!qids) return;
  var lastcheck = this.lastcheck;
  if (!lastcheck) return;

  var merge_textarealist = function(dataid, diffdata) {
    var currdata = manaba.d3data(dataid, true);
    var qrdata = currdata['data'];
    var addlist = [];
    for (var i in diffdata['data']) {
      var data = diffdata['data'][i];
      var qdid = data['qdid'];
      var add = true;
      for (var j in qrdata) {
        if (qrdata[j]['qdid'] === data['qdid']) {
          qrdata.splice(j, 1);
          if (!data['submitted']) add = false;
          break;
        }
      }
      if (add) addlist.push(data);
    }
    currdata['data'] = addlist.length ? addlist.concat(qrdata) : qrdata;
    return currdata;
  };
  var emsg = {
    default: (gLang == 'ja' ? '通信エラーが発生しました。' : 'A network error has occurred.'),
    logout: (gLang == 'ja' ? 'ログアウトしています。' : 'Logged out.'),
    timeout: (gLang == 'ja' ? '接続がタイムアウトしました。' : 'Timeout has occurred.'),
    offline: (gLang == 'ja' ? 'オフライン状態です。' : 'No Internet connection.'),
    turnoff: (gLang == 'ja' ? '自動更新が停止しました。' : 'Auto update is stopped.'),
  };

  var data = [];
  if(document.getElementById('autocheckintervaleditmode')) { 
    data = {lastcheck:lastcheck,editmode:1};
  } else {
    data = {lastcheck:lastcheck};
  }
  var opt = { data:data, checksso:true };

  manaba.ajax(url, opt, function(status, data, type) {
    var e, em;
    if (status != 200) {
      e = 'status = ' + status;
      if (!status) {
        if (!navigator.onLine) {
          e += ' : offline';
          em = emsg.offline;
        }
      } else if (status == 504) {
        em = emsg.timeout;
      }
    } else if (type !== 'json') { // impossible error
      if (type === 'text') {
        if (data && data.indexOf('<!-- MARKER_NOT_LOGGED_IN  -->') >= 0) {
          e = 'not logged in';
          em = emsg.logout;
        } else {
          e = 'type = text: unknow'; // view probrem ?
        }
      } else {
        e = 'type = ' + type;
      }
    } else if (!data || !data.status) {
        e = 'json data error';
    } else {
      var json = data;
      if (json.status !== 'ok') {
        if (json.status === 'nc') {
          if (json.lastcheck) manaba.queryresult.autocheck.lastcheck = json.lastcheck;
        } else {
          e = 'json.status = ' + json.status;
        }
      } else if (!json.lastcheck || !json.data) {
        e = 'json format error';
      } else {

        //-- set latest data
        for (var i in qids) {
          var qid = qids[i];
          var dataid = 'queryresult-' + qid;
          var newdata = json.data[qid];
          var qdata = (newdata['type'] === 'textarealist')
            ? merge_textarealist(dataid, newdata)
            : newdata;
          manaba.d3dataCache.set(dataid, qdata);
          manaba.queryresult.rewriteQidResult(qid, qdata['type']);
        }
        var respondents = document.getElementById('num_respondents');
        respondents.innerHTML = json.rows;
        manaba.queryresult.autocheck.lastcheck = json.lastcheck;
        manaba.queryresult.responsive.resized = false;
        if (manaba.useQueryResultResponsive && manaba.hasClass(document.body, 'responsive')) {
          manaba.queryresult.responsive.resizeGraphCanvas();
        }
      }
    }

    var stopautocheck;
    if (e) {
      console.log('ajax error: ' + e);
      manaba.queryresult.autocheck.turnOff(swelm);
      stopautocheck = true;
      var estr = em || emsg.default;
      alert(estr + "\n" + emsg.turnoff);
    } else if (data.notopen) {
      manaba.queryresult.autocheck.notopen = true;
      manaba.queryresult.autocheck.turnOff(swelm);
      manaba.addClass(swelm.parentNode, 'swdisabled');
      stopautocheck = true;
    }
    if (stopautocheck || manaba.queryresult.autocheck.pause) {
      manaba.queryresult.autocheck.tmid = null;
      return;
    }

    manaba.queryresult.autocheck.tmid = setTimeout(
      function() { manaba.queryresult.autocheck.getResultsLatest(swelm, url) },
      manaba.queryresult.autocheck.interval
    );
  });
}

manaba.queryresult.autocheck.turnOff = function(elm) {
  elm.src = (gLang == 'ja') ? '/button_auto_update_off-ja.png' : '/button_auto_update_off-en.png';
  elm.alt = (gLang == 'ja') ? '自動更新しない' : 'Disable auto update';
  elm.title = elm.alt;
  manaba.removeClass(elm, 'autochecklatest');
  this.interval = 0;
  if (this.tmid) clearTimeout(this.tmid);
  this.tmid = null;
}

manaba.queryresult.autocheck.turnOn = function(elm) {
  elm.src = (gLang == 'ja') ? '/button_auto_update_on-ja.png' : '/button_auto_update_on-en.png';
  elm.alt = (gLang == 'ja') ? '自動更新中' : 'Auto update enabled';
  elm.title = elm.alt;
  manaba.addClass(elm, 'autochecklatest');
  this.interval = manaba.useQueryResultAutoCheckInterval * 1000;
}

manaba.queryresult.rewriteQidResult = function(qid, type) {
  if (type == null) type = '';
  var dataid = 'queryresult-' + qid;
  var qbtn = document.querySelector('#queryresult-' + qid + ' + div.button-switchview input[type="image"]');
  if (!qbtn) {
    return false;
  }
  var qbtnimg = qbtn.src.split('/').pop();
  var options = {redraw:1};
  if (qbtnimg.indexOf('button_on') == -1) {
    return false;
  } else if (type === 'textarealist') {
    manaba.d3_dispatch(qid + 'textarealist', manaba.d3data(dataid, true));
  } else if (type === 'pie') {
    manaba.d3_chart_pie(qid + 'chart', manaba.d3data(dataid, true), options);
  } else if (type === 'bar2') {
    manaba.d3_chart_bar2(qid + 'chart', manaba.d3data(dataid, true), options);
  } else {
    qbtn.click();
    qbtn.click();
  }
  return true;
}

manaba.queryresult.responsive.resizeGraphCanvas = function (mode) {
  var mqr = this;
  var resizeToPCMode = function() {
    var ret = 0;
    var elms_qp = document.getElementsByClassName('webat-chartbox2');
    for (var i = 0; i < elms_qp.length; i++) {
      if (!elms_qp[i].getElementsByClassName) { continue; }
      ret = 1;
      var wvb = elms_qp[i].getAttribute('wviewBox');
      elms_qp[i].setAttribute('viewBox', wvb);
      var vb = mqr.parseviewbox(wvb);
      elms_qp[i].setAttribute('height', vb.ey);

      var elms_b = elms_qp[i].getElementsByClassName('legendbox_bar');
      var elms_p = elms_qp[i].getElementsByClassName('legendbox_pie');
      for (var j = 0; j < elms_b.length; j++) {
        elms_b[j].removeAttribute('transform');
      }
      for (var j = 0; j < elms_p.length; j++) {
        elms_p[j].removeAttribute('transform');
      }
    }
    return ret;
  };
  var resizeToSPMode = function() {
    var ret = 0;
    var elms_qp = document.getElementsByClassName('webat-chartbox2');
    for (var i = 0; i < elms_qp.length; i++) {
      if (!elms_qp[i].getElementsByClassName) { continue; }
      ret = 1;
      var rvb = elms_qp[i].getAttribute('rviewBox');
      elms_qp[i].setAttribute('viewBox', rvb);
      var vb = mqr.parseviewbox(rvb);
      elms_qp[i].setAttribute('height', vb.ey);
      var wvb = elms_qp[i].getAttribute('wviewBox');
      vb = mqr.parseviewbox(wvb);

      var elms_b = elms_qp[i].getElementsByClassName('legendbox_bar');
      var elms_p = elms_qp[i].getElementsByClassName('legendbox_pie');
      for (var j = 0; j < elms_b.length; j++) {
        var rect = elms_b[j].getElementsByClassName('legend');
        var tx = parseInt(rect[0].getAttribute('x')) * -1 + mqr.legendMarginLeft;
        var ty = parseInt(vb.ey) + mqr.barOffsetY - parseInt(rect[0].getAttribute('y'));
        elms_b[j].setAttribute('transform','translate(' + tx + ','+ ty +')');
      }
      for (var j = 0; j < elms_p.length; j++) {
        var rect = elms_p[j].getElementsByClassName('legend');
        var tx = parseInt(rect[0].getAttribute('x')) * -1 + mqr.legendMarginLeft;
        var ty = parseInt(vb.ey) + mqr.pieOffsetY - parseInt(rect[0].getAttribute('y'));
        elms_p[j].setAttribute('transform','translate('+ tx + ','+ ty +')');
      }
    }
    return ret;
  };

  if (mode && mode.cancel && this.resized) {
    resizeToPCMode();
    this.resized = false;
  } else if (manaba.hasClass(document.body, 'responsive')) {
    var w = window.innerWidth;
    if (w < this.limitWidth && !this.resized) {
      if (resizeToSPMode()) {
        this.resized = true;
      }
    } else if (w >= this.limitWidth && this.resized) {
      resizeToPCMode();
      this.resized = false;
    }
  }
}

manaba.releaseNotes = {
  show : function () {
    manaba.tpanel('home_releasenotes');
  },
  close : function () {
    manaba.tpanel_close();
  },
  hide : function () {
    manaba.ajaxgetbody('home', function () { manaba.tpanel_close() }, 'hidereleasenotes=1', 'POST', null, 'urlencode');
  },
  view : function (as) {
    manaba.tpanel('home_releasenotes_view' + as);
  }
};
