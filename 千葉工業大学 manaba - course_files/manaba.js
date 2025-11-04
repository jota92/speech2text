/**
 * @license Unless otherwise stated:
 * Copyright (C) 2013  ASAHI Net, Inc.  ALL RIGHTS RESERVED
 */
(function (window) {
 'use strict';

 /** @type {Object} */
 var manaba = window['manaba'];

 // temporary implementation
 manaba.addTextdefs({
  'submittedafterend':
     {'ja': '(受付終了後提出)', 'en': '(Submitted after the deadline)'}
 });

 var editatt = {
    /** @type {boolean} */
    ready: false
    /** @type {?string} */
  , gLang: null
    /**
     * @type {?{screenname: number, numid: number, postdate: number
     *  , atttype: number, memo: number}}
     */
  , colIndex: null
    /** @type {Object.<string, {id: number, func: function(boolean): boolean}>} */
  , fxproperties: {}
    /** @type {*} */
  , listData: null
    /** @type {*} */
  , targetSession: null
    /** @type {Object} */
  , params : {}
 };

 /**
  * @param {string} id
  * @param {number} interval
  * @param {function(boolean): boolean} func
  */
 editatt.fx = function (id, interval, func) {
  var prop = editatt.fxproperties[id];
  if (prop != null) {
   clearTimeout(prop.id);
   prop.func(true); // destroy
   delete editatt.fxproperties[id];
  }
  prop = {func: func};
  editatt.fxproperties[id] = prop;

  var fxloop = function () {
   clearTimeout(prop.id);
   if (func(false)) {
    prop.id = setTimeout(fxloop, interval);
   } else {
    func(true);
    delete editatt.fxproperties[id];
   }
  };
  prop.id = setTimeout(fxloop, interval);
 };

 /**
  * @param {HTMLElement} e
  * @param {{rgb: string, initial: number, diff: number}} params
  */
 editatt.highlight = function (e, params) {
  var a = params.initial
    , d = params.diff
    , id = e.id;
  /**
   * @param {boolean} destroy
   * @return {boolean}
   */
  var func = function (destroy) {
   if (destroy) {
    e = null;
    return false;
   }
   var val = a;
   if (val >= 1.0) {
    e.style.backgroundColor = '';
   } else {
    e.style.backgroundColor = 'rgba(255,255,0,' + (1.0 - val) + ')';
   }
   a += d;
   if (val < 1.0) {
    return true;
   }
   return false;
  };
  editatt.fx(id, 13, func);
 }

 /**
  * @const
  * @type {{dataId: string, rowTemplateId: string, renderedId: string
  *  , rowClassName: string, orderControllerId: string, deadlineInputId: string
  *  , messageBoxId: string, orderSelected: string, orderURIName: string
  *  , orderName: string, orderDefault: string
  *  , highlightParams: {rgb: string, initial: number, diff: number}}}
  */
 editatt.option = {
    dataId: 'attstudents'
  , targetSessionId: 'targetsession'
  , rowTemplateId: 'editattrow'
  , renderedId: 'editattheader'
  , rowClassName: 'editatt3-row'
  , orderControllerId: 'editattorder'
  , deadlineInputId: 'editattdeadline'
  , messageBoxId: 'editattmessage'
  , orderSelected: 'selected'
  , orderURIName: 'order'
  , orderName: 'queryorder'
  , orderDefault: 'normal'
  , highlightClassName: 'attend-hiliterow'
  , highlightParams: {rgb: '#FFFF00', initial: 0, diff: 0.033}
  , editAttParams : 'editattparams'
 };

 /**
  * @param {{closed: boolean, hasChild: boolean}} colopt
  */
 editatt.initColIndex = function (colopt) {
  var index = ((colopt['hasChild'] ? 1 : 0) << 1) + (colopt['closed'] ? 1 : 0);
  editatt.colIndex = [
  {
     screenname: 0
   , numid: 1
   , atttype: 2
   , memo: 3
  },
  {
     screenname: 0
   , numid: 1
   , postdate: 2
   , atttype: 3
   , memo: 4
  },
  {
     courseinfo: 0
   , screenname: 1
   , numid: 2
   , atttype: 3
   , memo: 4
  },
  {
     courseinfo: 0
   , screenname: 1
   , numid: 2
   , postdate: 3
   , atttype: 4
   , memo: 5
  }
  ][index];
 };

 /**
  * @param {HTMLElement} e
  * @param {string} atttype
  * @param {number} ser
  */
 editatt.makeAtttypeCol = function (e, atttype, ser) {
  var inputName = 'atttype' + ser;

  var children, child;
  var i, len;
  var inputids = [], inputid, value;

  children = e.getElementsByTagName('input');
  for (i = 0, len = children.length; i < len; i++) {
   child = children[i];
   child.name = inputName;
   value = child.value;
   inputid = inputName + '-' + value;
   if (value !== '') {
    inputids.push(inputid);
   }
   child.id = inputid;
   if (atttype === value || (atttype === '' && value === 'n')) {
    child.checked = true;
   }
  }
  children = e.getElementsByTagName('label');
  for (i = 0, len = children.length; i < len; i++) {
   child = children[i];
   inputid = inputids[i];
   child.id = inputid + '-label';
   child.htmlFor = inputid;
  }
 };

 /**
  * @param {HTMLElement} e
  * @param {string} memo
  * @param {number} ser
  */
 editatt.makeMemoCol = function (e, memo, ser) {
  var input = e.getElementsByTagName('input')[0];
  input.name = 'memo' + ser;
  input.value = memo;
 };

 /**
  * @param {string} json
  * @return {*}
  */
 function jsonParse (json) {
  var result;
  if (typeof(JSON) === 'object' && typeof(JSON.parse) === 'function') {
   result = JSON.parse(json);
  } else {
   result = manaba.json.parse(json);
  }
  return result;
 }

 /**
  * @return {Array.<HTMLElement>}
  */
 editatt.buildEditAttList = function () {
  var option = editatt.option;
  var dataId = option.dataId;
  var rowTemplateId = option.rowTemplateId;
  var renderedId = option.renderedId;
  var rowClassName = option.rowClassName;
  var orderControllerId = option.orderControllerId;
  var withicon = editatt.params['withicon'];
  var coursespan = editatt.params['coursespan'];
  var courseellipsis = editatt.params['courseellipsis'];

  // decoded JSON
  var hash = editatt.listData;
  /** @type {Array.<Object>} */
  var list = hash['List'];

  // get row template element
  var rowtemplate
    = document.getElementById(rowTemplateId).getElementsByTagName('tr')[0];

  // render
  var builtRows = [];
  var colIndex = editatt.colIndex;
  for (var i = 0, len = list.length; i < len; i++) {
   var e = list[i];
   var row = rowtemplate.cloneNode(true);
   var children = row.getElementsByTagName('td');
   /** @type {number} */
   var ser = i + 1;
   /** @type {Object.<string, string>} */
   var courseinfo = e['courseinfo'];
   /** @type {Object.<string, string>} */
   var userinfo = e['userinfo'];
   /** @type {Object.<string, string>} */
   var attdata = e['attdata']['List'][0] || {};
   /** @type {string} */
   var atttype = attdata['atttype'] || '';
   var text;

   if (colIndex.courseinfo != null) {
    if (courseinfo != null) {
     text = (editatt.gLang === 'ja' ? courseinfo['nameloc'] : courseinfo['nameint']);
    } else {
     text = '';
    }
    if (coursespan) {
     var cselem = document.createElement('span');
     if (courseellipsis) {
      manaba.addClass(cselem, 'courselink-coursetitle');
     }
     cselem.appendChild(
      document.createTextNode(text));
     children[colIndex.courseinfo].appendChild(cselem);
    } else {
     children[colIndex.courseinfo].appendChild(
      document.createTextNode(text));
    }
   }
   if (colIndex.screenname != null) {
    var screenname;
    if (userinfo['name']) {
     if (editatt.gLang == 'en' && userinfo['name_en']) {
      screenname = userinfo['name_en'];
     } else {
      screenname = userinfo['name'];
     }
    } else {
     if (editatt.gLang == 'en' && userinfo['screenname_en']) {
      screenname = userinfo['screenname_en'];
     } else {
      screenname = userinfo['screenname'];
     }
    }
    if (withicon == '1') {
     var icon = document.createElement('img');
     icon.setAttribute('src', 'user_'+userinfo['oid']+'_profileimage');
     icon.setAttribute('alt', screenname);
     icon.setAttribute('width', '40px');
     icon.setAttribute('height', '40px');
     children[colIndex.screenname].appendChild(icon);
    }
    children[colIndex.screenname].appendChild(
     document.createTextNode(screenname || ''));
    if (e["summonlog"] == '1') {
     var span = document.createElement('span');
     var summonlogtext;
     if (editatt.gLang == 'ja') {
      summonlogtext = ' 呼び出しあり'
     } else {
      summonlogtext = ' 呼び出しあり'
     }
	 span.appendChild(document.createTextNode(summonlogtext));
     span.style.color = 'red';
     children[colIndex.screenname].appendChild(span);
    }
   }
   if (colIndex.numid != null) {
    children[colIndex.numid].appendChild(
     document.createTextNode(userinfo['numid'] || ''));
   }
   if (colIndex.postdate != null) {
    text = (attdata['postdate'] || '')
     + (attdata['expired'] === '1' ? (' ' + manaba.getSD('submittedafterend')) : '');
    children[colIndex.postdate].appendChild(
     document.createTextNode(text));
    var appdata = attdata['appdata'];
    if (appdata && appdata['respon']) {
     children[colIndex.postdate].appendChild(document.createTextNode('[R]'));
    }
    if (appdata && appdata['gpslatitude'] && appdata['gpslongitude']) {
     var link = document.createElement('a');
     link.setAttribute('href', 'link_iframe_balloon?url='
      + encodeURIComponent('https://maps.google.com/maps?q='
       + appdata['gpslatitude'] + ','
       + appdata['gpslongitude']));
     link.addEventListener('click',
      function(e){e.preventDefault();return manaba.linkballoon(e)});
     link.appendChild(document.createTextNode('▼'));
     children[colIndex.postdate].appendChild(link);
    }
   }
   if (colIndex.atttype != null) {
    editatt.makeAtttypeCol(children[colIndex.atttype], atttype, ser);
   }
   if (colIndex.memo != null) {
    editatt.makeMemoCol(children[colIndex.memo], (attdata['memo'] || ''), ser);
   }

   var odd = (i % 2 ? true : false);
   row.className = (odd ? 'row1' : 'row0')
    + ' ' + (! atttype || atttype === 'n' ? 'not-attend' : '')
    + ' ' + rowClassName;

   var useroid = document.createElement('input');
   useroid.type = 'hidden';
   useroid.name = 'useroid' + ser;
   useroid.value = userinfo['oid'];
   row.appendChild(useroid);

   builtRows[i] = row;
  }

  return builtRows;
 };

 /**
  * @param {string} order
  */
 editatt.arrangeEditAttList = function (order) {
  var option = editatt.option;
  var dataId = option.dataId;
  var rowTemplateId = option.rowTemplateId;
  var renderedId = option.renderedId;
  var rowClassName = option.rowClassName;
  var orderControllerId = option.orderControllerId;
  var orderDefault = option.orderDefault;

  var topelem = document.getElementById(renderedId).parentNode;

  // retrieve previously rendered elements
  var nodeList = getElementsByClass(rowClassName, topelem, 'tr');

  // build list if empty
  if (nodeList.length === 0) {
    nodeList = editatt.buildEditAttList();
  }

  if (order === '') {
   var query = window.location.search;
   var queryReStr = "[\\?&]" + option.orderURIName + "=([^&#]*)";
   var orderResult = (new RegExp(queryReStr)).exec(query);
   if (orderResult === null) {
    order = orderDefault;
   } else {
    order = decodeURIComponent(orderResult[1].replace(/\+/g, ' '));
   }
  }

  // sort
  nodeList = editatt.sortEditAttList(nodeList, order);

  // append
  var df = document.createDocumentFragment();
  for (var i = 0, len = nodeList.length; i < len; i++) {
   df.appendChild(nodeList[i]);
  }
  topelem.appendChild(df);

  // update order control
  var orderelem = document.getElementById(orderControllerId);
  var children = orderelem.getElementsByTagName('a');
  var selectedClass = option.orderSelected;
  for (var i = 0, len = children.length; i < len; i++) {
   manaba.removeClass(children[i], selectedClass);
  }
  var selectedelem = document.getElementById(orderControllerId + '-' + order);
  if (! selectedelem) {
   order = orderDefault;
   selectedelem = document.getElementById(orderControllerId + '-' + order);
  }
  manaba.addClass(selectedelem, selectedClass);
 };

 /**
  * @param {HTMLElement} e
  * @return {number}
  */
 editatt.getIndex = function (e) {
  var input = e.getElementsByTagName('input').item(0);
  var matched = input.name.match(/^[^0-9]*([0-9]+)/);
  return parseInt(matched[1], 10);
 }

 /**
  * @param {(NodeList|Array.<HTMLElement>)} list
  * @param {string} order
  * @return {Array.<HTMLElement>}
  */
 editatt.sortEditAttList = function (list, order) {
  /** @type {Array.<HTMLElement>} */
  var array = Array.prototype.slice.call(list);
  /**
   * @dict
   * @type {Object.<number, string>}
   */
  var hash = {};
  var colIndex = editatt.colIndex;
  /** @type {number} */
  var col;
  /** @type {function(Array.<string>, Array.<number>): number} */
  var compareFunc;
  /**
   * @param {HTMLElement} a
   * @param {HTMLElement} b
   * @return {number}
   */
  var compareCommon = function (a, b) {
   /** @type {Array.<HTMLElement>} */
   var elems = [a, b];
   /** @type {Array.<number>} */
   var indices = [editatt.getIndex(a), editatt.getIndex(b)];
   /** @type {Array.<string>} */
   var vals = [];
   if (col != null) {
    for (var i = 0, len = indices.length; i < len; i++) {
     var v = hash[indices[i]];
     if (v == null) {
      v = elems[i].getElementsByTagName('td').item(col).innerHTML;
      hash[indices[i]] = v;
     }
     vals[i] = v;
    }
   }
   return compareFunc(vals, indices);
  };
  if (order === 'normal') {
   /**
    * @param {Array.<string>} vals
    * @param {Array.<number>} indices
    * @return {number}
    */
   compareFunc = function (vals, indices) {
    return indices[0] - indices[1];
   }
   array = array.sort(compareCommon);
  } else if (order === 'numid') {
   col = colIndex.numid;
   if (col == null) { throw '\'numid\' is missing' };
   /**
    * @param {Array.<string>} vals
    * @param {Array.<number>} indices
    * @return {number}
    */
   compareFunc = function (vals, indices) {
    if (vals[0] < vals[1]) {
     return -1;
    } else if (vals[0] > vals[1]) {
     return 1;
    } else {
     return indices[0] - indices[1];
    }
   }
   array = array.sort(compareCommon);
  } else if (order === 'postdate') {
   col = colIndex.postdate;
   if (col == null) { throw '\'postdate\' is missing' };
   /**
    * @param {Array.<string>} vals
    * @param {Array.<number>} indices
    * @return {number}
    */
   compareFunc = function (vals, indices) {
    if (vals[0] !== '' && (vals[1] === '' || vals[0] < vals[1])) {
     return -1;
    } else if (vals[1] !== '' && (vals[0] === '' || vals[0] > vals[1])) {
     return 1;
    } else {
     return indices[0] - indices[1];
    }
   }
   array = array.sort(compareCommon);
  }

  return array;
 };

 /**
  * @param {string} tag
  * @param {string} name
  * @return {Array.<Node>}
  */
 function getElementsByNameFix (tag, name) {
  var elems = document.getElementsByTagName(tag);
  var e, result = [];
  for (var i = 0, len = elems.length; i < len; i++) {
   e = elems[i];
   if (e.getAttribute('name') === name) {
    result.push(e);
   }
  }
  return result;
 }

 /**
  * @param {string} name
  * @return {?string}
  */
 editatt.getRadioValue = function (name) {
  var list = getElementsByNameFix('input', name);
  for (var i = 0, len = list.length; i < len; i++) {
   var radio = list[i];
   if (radio.checked) {
    return radio.value;
   }
  }
  return null;
 }

 editatt.editPivotal = function () {
  var option = editatt.option;
  var deadlineInputId = option.deadlineInputId;
  var renderedId = option.renderedId;
  var rowClassName = option.rowClassName;

  var topelem = document.getElementById(renderedId).parentNode;
  var nodeList = getElementsByClass(rowClassName, topelem, 'tr');
  if (nodeList.length === 0) {
   return;
  }

  var deadline = document.getElementById(deadlineInputId);
  var date = manaba.parseDate(deadline.value);
  if (! manaba.validateDate(date)) {
   return;
  }
  var dateStr = manaba.normalizeDate(date);
  deadline.value = dateStr;

  var useExpired = (editatt.targetSession['dateend'] === dateStr);
  var list = editatt.listData['List'];

  if (editatt.colIndex == null) { throw 'Not ready'; }
  var colIndex = editatt.colIndex;

  if (manaba['useOldEditPivotal'] !== '') {
   var e, ser, attdata, postdate, atttypename, atttype, memo, newatttype;
   for (var i = 0, len = nodeList.length; i < len; i++) {
    e = nodeList[i];
    ser = editatt.getIndex(e);
    attdata = list[ser-1]['attdata']['List'][0];
    atttypename = 'atttype' + ser;
    atttype = editatt.getRadioValue(atttypename);
    memo = getElementsByNameFix('input', 'memo' + ser)[0].value;
    newatttype = null;
    if (attdata != null && (atttype === 'a' || atttype === 'n') && memo === '') {
     postdate = (attdata['postdate'] || '');
     if (dateStr !== '' && postdate !== '') {
      if (dateStr > postdate
      || (dateStr === postdate && (useExpired && attdata['expired'] !== '1'))) {
        newatttype = 'a';
      } else {
       newatttype = 'n';
      }
     }
    }
    if (newatttype !== null && newatttype !== atttype) {
      document.getElementById(atttypename + '-' + newatttype).click();
    }
   }
  } else {
   var count = {'a': 0};
   var e, ser, attdata, postdate, atttype, newatttype;
   var name, prev;
   for (var i = 0, len = nodeList.length; i < len; i++) {
    e = nodeList[i];
    ser = editatt.getIndex(e);
    attdata = list[ser-1]['attdata']['List'][0];
    newatttype = null;
    if (attdata != null && attdata['meta']['preedited'] !== '1') {
     postdate = (attdata['postdate'] || '');
     atttype = (attdata['atttype'] || '');
     if (dateStr !== '' && postdate !== '') {
      if (dateStr > postdate) {
       newatttype = 'a';
      } else if (dateStr === postdate) {
       if (useExpired && attdata['expired'] !== '1') {
        newatttype = 'a';
       }
      }
      if (newatttype === null && atttype !== '') {
       newatttype = atttype;
      }
     }
    }

    if (newatttype !== null) {
     name = 'atttype' + ser;
     prev = editatt.getRadioValue(name);
     if (newatttype !== prev) {
      count[newatttype]++;
      document.getElementById(name + '-' + newatttype).click();
     }
    }
   }
  }
 }

 /**
  * @param {HTMLFormElement} e
  */
 editatt.onSubmit = function (e) {
  var option = editatt.option;
  var selectedClass = option.orderSelected;
  var orderelem = document.getElementById(option.orderControllerId);
  var selected = getElementsByClass(selectedClass, orderelem, 'a');
  if (selected.length === 0) {
   return true;
  }
  var order = (selected[0].id.match(/.*-(.*)/))[1];
  var input = document.createElement('input');
  input.type = 'hidden';
  input.name = option.orderName;
  input.value = order;
  e.appendChild(input);
  return true;
 };

 /**
  * @param {HTMLElement} e
  */
 editatt.checkData = function (e) {
  var option = editatt.option;
  var highlightClassName = option.highlightClassName;
  var list = editatt.listData;
  var ser = editatt.getIndex(e);
  var index = ser - 1;
  var attdata = list['List'][index]['attdata']['List'][0];
  var atttype = editatt.getRadioValue('atttype' + ser);
  var memo = getElementsByNameFix('input', 'memo' + ser)[0].value;

  if ((attdata != null && (attdata['atttype'] !== atttype || attdata['memo'] !== memo))
   || (attdata == null && (atttype !== 'n' || memo !== ''))) {
   manaba.addClass(e, highlightClassName);
  } else {
   manaba.removeClass(e, highlightClassName);
  }
 }

 editatt.reset = function () {
  editatt.ready = false;
 }

 // intended to move webat.js
 /**
  * @type {RegExp}
  */
 var date_re = new RegExp('^ *([0-9]+)-([0-9]+)-([0-9]+)'
    + '(?: +([0-9]+):([0-9]+)(?::([0-9]+))?)? *');

 /**
  * @param {string} text
  * @return {?Array.<number>}
  */
 manaba['parseDate'] = function (text) {
  var matched = text.match(date_re);
  var result = null;
  if (matched != null) {
   result = [];
   matched.shift();
   for (var i = 0, len = matched.length; i < len; i++) {
    var v = matched[i];
    result[i] = ((v != null && v !== '') ? parseInt(v, 10) : 0);
   }
  }
  return result;
 }

 /**
  * @param {Array.<number>} a
  * @return {boolean}
  */
 manaba['validateDate'] = function (a) {
  if (a == null) {
   return false;
  }
  var d = new Date(a[0], a[1] - 1, a[2], a[3], a[4], a[5]);
  var year = d.getFullYear();
  var month = d.getMonth() + 1;
  var date = d.getDate();
  var hour = d.getHours();
  var minutes = d.getMinutes();
  var seconds = d.getSeconds();
  if (year <= 9999 && a[0] === year && a[1] === month && a[2] === date
   && a[3] === hour && a[4] === minutes && a[5] === seconds) {
   return true;
  }
  return false;
 }

 /**
  * @param {Array.<number>} a
  * @return {string}
  */
 manaba['normalizeDate'] = function (a) {
  /** @type {Array.<string>} */
  var n = [];
  n[0] = ('000' + a[0]).slice(-4);
  for (var i = 1, len = a.length; i < len; i++) {
   n[i] = ('0' + a[i]).slice(-2);
  }
  var output = n[0] + '-' + n[1] + '-' + n[2]
   + ' ' + n[3] + ':' + n[4] + ':' + n[5];
  return output;
 }

 /**
  * @param {string} order
  * @param {{closed: boolean, hasChild: boolean}} colopt
  */
 manaba['editatt3'] = function (order, colopt) {
  if (! editatt.ready) {
   editatt.gLang = window['gLang'];
   editatt.initColIndex(colopt);
   editatt.listData = jsonParse(
    document.getElementById(editatt.option.dataId).value);
   editatt.targetSession = jsonParse(
    document.getElementById(editatt.option.targetSessionId).value);
   var paramselem = document.getElementById(editatt.option.editAttParams);
   if (paramselem) {
    editatt.params = jsonParse(paramselem.value);
   }
   editatt.ready = true;
  }
  editatt.arrangeEditAttList(order);
 };

 manaba['editattlistpivotal'] = function () {
  editatt.editPivotal();
 };

 /**
  * @param {HTMLFormElement} e
  */
 manaba['editattlistonsubmit'] = function (e) {
  editatt.onSubmit(e);
 };

 /**
  * @param {HTMLElement} e
  */
 manaba['editattlistcheckdata'] = function (e) {
  var row = manaba.findParentNode(e, 'tr');
  editatt.checkData(row);
 }

 manaba['editattlistreset'] = function () {
  editatt.reset();
 }

 /**
  * @param {string} id
  */
 manaba['emptyinputcheck'] = function (id) {
  var o = document.getElementById(id);
  if (o) {
   if (o.value == "") {
    o.value = "";
    o.focus();
    o.select();
    return false;
   }
  }
  return true;
 }
})(window);
