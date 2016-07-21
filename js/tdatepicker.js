/*
	TDatePicker
	- Author: Tola Veng
	- Email: vengtola@gmail.com
	- Website: tola.ws
	- Created: 2015-03-10
	- Updated: 2016-01-30
 	- Usage:
 		tDatePicker('htmlID',{options});
 	- Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
*/
var tDatePicker = (function(id,opts){
	var settingList = []; /* store all individules settings */
	var defaults = {'minDate':null, 'maxDate':null, 'startDate':null, 'defaultDate':null, 'format':'YYYY-MM-DD'};
	var isOpen = false;
	// calendare properties
	var monthName = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	var monthNameFull = ['January','February','March','April','May','June','July','August','September','October','November','December'];
	var dayName = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
	var dayNameFull = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
	var calDate = null; /* current calendar date */
	// html properties
	var selectedDate = null; /* selected date from input text */
	var curEleId = null; /* ID of current html element */
	var tdatepickerbox; /* datepicker element div */

	/* create html element from calendar object */
	var createCalendar = function(d){
		var thead, tbody, tfoot, date, year, month, prevMonth, nextMonth;
		var toDay = new Date();
		// create date object start from the 1st of the month
		if(d){
			date = new Date(d.getFullYear(),d.getMonth(), 1);
		}else{
			date = new Date();
			date.setDate(1);
		}
		calDate = new Date(date.getTime());
		year = date.getFullYear();
		month = date.getMonth();
		prevMonth = new Date(date.getTime());
		prevMonth.setMonth(month-1);
		nextMonth = new Date(date.getTime());
		nextMonth.setMonth(month+1);
		
		var weekDay = date.getDay();
		if(weekDay==0){ weekDay=7; } // make Sunday is 7
		weekDay-=1; // make Monday is 0
		// Calculate the day of previous month need to be included, how many days before the start day
		if(weekDay==0){ //if the 1th is Monday, display the prev week
			date.setDate(date.getDate()-7);
		}else{
			date.setDate(date.getDate()-weekDay);
		}

		// create html element
		var table = document.createElement('table');
		// head
		thead = addElement('thead',null,null,table);
		var tr = addElement('tr',null,null,thead);
		
		// controls
		var minDate = isDate(settingList[curEleId].minDate);
		var maxDate = isDate(settingList[curEleId].maxDate);
		// previous
		if(minDate && calDate.getFullYear()<=minDate.getFullYear()){
			var td = addElement('td',null,null,tr,'&nbsp;');
		}else{
			var td = addElement('td',null,'tdatepicker-prev year',tr,'&nbsp;',year-1);
			addEvent(td,'click',tDatePicker.prevYear);	
		}
		
		if(minDate && ( calDate.getFullYear()<minDate.getFullYear() || (calDate.getFullYear()==minDate.getFullYear() && calDate.getMonth()<=minDate.getMonth()) ) ){
			td = addElement('td',null,null,tr,'&nbsp;');
		}else{
			td = addElement('td',null,'tdatepicker-prev',tr,'&nbsp;',monthNameFull[prevMonth.getMonth()]);
			addEvent(td,'click',tDatePicker.prevMonth);	
		}
		

		td = addElement('td',null,null,tr,monthNameFull[month]+' '+year);
		td.colSpan = 3;

		// next
		if(maxDate && ( calDate.getFullYear()>maxDate.getFullYear() || (calDate.getFullYear()==maxDate.getFullYear() && calDate.getMonth()>=maxDate.getMonth()) ) ){
			td = addElement('td',null,null,tr,'&nbsp;');
		}else{
			td = addElement('td',null,'tdatepicker-next',tr,'&nbsp;',monthNameFull[nextMonth.getMonth()]);
			addEvent(td,'click',tDatePicker.nextMonth);	
		}
		
		if(maxDate && calDate.getFullYear()>=maxDate.getFullYear()){
			td = addElement('td',null,null,tr,'&nbsp;');
		}else{
			td = addElement('td',null,'tdatepicker-next year',tr,'&nbsp;',year+1);
			addEvent(td,'click',tDatePicker.nextYear);	
		}		

		// name of the week
		tr = addElement('tr',null,null,thead);
		for(var i=1; i<dayName.length; i++){
			addElement('td',null,'tdatepicker-dayname',tr,dayName[i]);
		}
		addElement('td',null,'tdatepicker-dayname',tr,dayName[0]);
		
		// body
		tbody = addElement('tbody',null,null,table);
		tr = addElement('tr',null,null,tbody);
		// loop through the month
		var className = "";
		var disabled = false;
		for(var i=0; i<42; i++){ // 7days*6row
			if(month!=date.getMonth()){className ='tdatepicker-day othermonth'; }else{ className = "tdatepicker-day"; }
			if(date.getDay()==0 || date.getDay()==6){className +=' weekend'; }
			if(selectedDate && date.getFullYear()==selectedDate.getFullYear() && date.getMonth()==selectedDate.getMonth() && date.getDate()==selectedDate.getDate()){
				className +=' selectedday';
			}
			if(date.getFullYear()==toDay.getFullYear() && date.getMonth()==toDay.getMonth() && date.getDate()==toDay.getDate()){
				className +=' today';
			}

			disabled = false;
			if(minDate && ( date.getFullYear()<minDate.getFullYear() || ( date.getFullYear()==minDate.getFullYear() && date.getMonth()<minDate.getMonth()) || (date.getFullYear()==minDate.getFullYear() && date.getMonth()==minDate.getMonth() && date.getDate()<minDate.getDate()) ) ){
				className +=' disabled';
				disabled = true;
			}
			if(maxDate && ( date.getFullYear()>maxDate.getFullYear() || ( date.getFullYear()==maxDate.getFullYear() && date.getMonth()>maxDate.getMonth()) || (date.getFullYear()==maxDate.getFullYear() && date.getMonth()==maxDate.getMonth() && date.getDate()>maxDate.getDate()) ) ){
				className +=' disabled';
				disabled = true;
			}
			
			if(i%7==0){
				tr = addElement('tr',null,null,tbody);	
			}			
			td = addElement('td',null,className,tr,date.getDate(),dateToFormat(date));			
			if(disabled){
				td.setAttribute('title','disabled');
			}else{
				td.setAttribute('data-date',dateToISO(date));
				addEvent(td,'click',tDatePicker.selectDate);
			}		
			// increasing one day
			date.setDate(date.getDate()+1);
		}

		// foot
		tfoot = addElement('tfoot',null,null,table);
		tr = addElement('tr',null,null,tfoot);
		td = addElement('td',null,null,tr,'&nbsp;');
		td.colSpan = 7;

		// 
		tdatepickerbox = document.getElementById('tdatepickerbox');
		if(tdatepickerbox){
			tdatepickerbox.innerHTML = "";
			tdatepickerbox.appendChild(table);
		}else{
			tdatepickerbox = addElement('div','tdatepickerbox','tdatepicker-box',document.body);
			tdatepickerbox.appendChild(table);
		}
	}; /* end create calendar */

	/* ------ format date -----
	   ------ Tola Veng ------
	   ------ Request review ------
	*/
	var dateToFormat = function(date){
		var strDate = '';
		var dates = [];
		dates['d'] = date.getDate();
		dates['dd'] = dates['d']>9?dates['d']:'0'+dates['d'];
		dates['ddd'] = dayName[date.getDay()];
		dates['dddd'] = dayNameFull[date.getDay()];
		dates['m'] = date.getMonth()+1;
		dates['mm'] = dates['m']>9?dates['m']:'0'+dates['m'];
		dates['mmm'] = monthName[date.getMonth()];
		dates['mmmm'] = monthNameFull[date.getMonth()];
		dates['yyyy'] = date.getFullYear().toString();
		dates['yyy'] = dates['yyyy'];
		dates['yy'] = dates['yyyy'].substr(2);
		dates['y'] = dates['yy'];

		var format = 'YYYY-MM-DD';
		if(settingList[curEleId]){
			format = settingList[curEleId].format;
		}
		format = format.toLowerCase();
		strDate = format.replace(/yyyy|yyy|yy|y|mmmm|mmm|mm|m|dddd|ddd|dd|d/gi, function(str){
			return dates[str];
		});
		
		return strDate;
	};
	var dateFromFormat = function(strDate){
		if(strDate=='' || strDate==null){
			return null;
		}
		var unknown = false;
		var dates = [];
		var date, year, month, day;
		var format = 'YYYY-MM-DD';
		if(settingList[curEleId]){
			format = settingList[curEleId].format;
		}
		format = format.toLowerCase();
		// clean string and replace everything with space dd /mmm-yyyy -> dd mmm yyyy
		format = format.replace(/([^a-z0-9]+)/gi,' ');
		strDate = strDate.replace(/([^a-z0-9]+)/gi,' ');
		//console.log(format+' '+strDate);
		// what if there no space in format ddmmmmyyyy
		// split to array
		formats = format.split(' ');
		dates = strDate.split(' ');
		// get date from string by matching strDate to pattern
		if(formats.length!=dates.length){
			unknown = true;
		}else{
			for(var i=0; i<formats.length; i++){
				switch(formats[i]){
					case 'd': case 'dd':
						day = parseInt(dates[i],10);
						if(isNaN(day) || day==0 || day>31){
							unknown = true;
						}
						break;
					case 'm': case 'mm':
						month = parseInt(dates[i],10)-1;
						if(isNaN(month) || month<=0 || month>12){
							unknown = true;
						}
						break;
					case 'mmm': case 'mmmm':
						var mmm = dates[i];
						month = null;
						if(typeof(mmm)==='string' && mmm.length>0){
							// loop find the index of the month
							for(var j=0; j<monthName.length; j++){
								if(mmm==monthName[j]){
									month = j;
									break;
								}
							}
							if(month===null){ // not found
								// loop again with the long name of the month
								for(var j=0; j<monthNameFull.length; j++){
									if(mmm==monthNameFull[j]){
										month = j;
										break;
									}
								}	
							}
						}
						if(month===null){
							unknown = true;
						}					
						break;
					case 'y': case 'yy':
						year = parseInt(dates[i],10);
						if(isNaN(year) || year<1900 || year>99){
							unknown = true;
						}else{
							year = 1900+year;
						}
						break;
					case 'yyy': case 'yyyy':
						year = parseInt(dates[i]);
						if(isNaN(year) || year<1900 || year>2999){
							unknown = true;
						}
						break;
				}//swtich
			}//for
		}
		// end get date from string
		if(unknown){
			//console.log('unknown');
			// unknown format
			var test = Date.parse(strDate);
			if (!isNaN(test)){
				try{
					date = new Date(strDate);
				}catch(e){
					date = null;
				}
			}else{
				date = null;
			}
		}else{
			date = new Date();
			if(day){ date.setDate(day); }
			if(month){ date.setMonth(month); }
			if(year){ date.setYear(year); }
		}
		return date;
	};
	/* end  format date */

	/* ------ public methods ------ */

	this.isOpen = function(){
		return isOpen;
	};

	this.init = function(){
		// create DIV to hold calendar
		tdatepickerbox = document.getElementById('tdatepickerbox');
		if(tdatepickerbox){
			tdatepickerbox.innerHTML = "";
		}else{
			tdatepickerbox = addElement('div','tdatepickerbox','tdatepicker-box',document.body);
		}
		// Add event to document, close calendar when click outside
		addEvent(document,'click',function(evt){
			var e = evt || window.event;
			var target = e.target || e.srcElement;
			
			if(tDatePicker.isOpen){
				var outside = true;
				// check target if the current element
				if(curEleId){
					var tarId = target.getAttribute('id');
					if(curEleId == tarId){
						outside = false;
					}
				}
				
				// loop to find the target is inside the div id='tdatepickerbox'
				while(target!==null && outside){
					var tarId = target.getAttribute('id');
					if(tarId && (tarId=='tdatepickerbox')){
						outside = false;
						break;
					}
					target = target.parentElement;
				}
				// hide if outside click
				if(outside){
					tDatePicker.hide();
				}
			}
		})
	};/* end init */

	this.show = function(id){
		var ele = document.getElementById(id);
		if(!ele){
			return null;
		}
		curEleId = id;
		if(ele.value){
			selectedDate = dateFromFormat(ele.value);
			if(selectedDate===null){
				if(isDate(settingList[curEleId].startDate)){
					selectedDate = isDate(settingList[curEleId].startDate);
				}else{
					selectedDate = new Date();
				}
			}
		}else{
			if(isDate(settingList[curEleId].defaultDate)){
				selectedDate = isDate(settingList[curEleId].defaultDate);
				ele.value = dateToFormat(selectedDate);
			}else{
				selectedDate = new Date();
			}
		}
		
		// create calendare
		createCalendar(selectedDate);

		var xy = getOffset(ele);
		tdatepickerbox.style.display = 'block';
		tdatepickerbox.style.left = xy.x+'px';
		tdatepickerbox.style.top = (xy.y+xy.h)+'px';
		isOpen = true;
	};/* end show */

	this.hide = function(){
		tdatepickerbox.style.display = 'none';
		isOpen = false;
	};

	// adding html input element to datepicker object
	this.add = function(id,opts){
		var ele = document.getElementById(id);
		if(!ele){
			return null;
		}
		// clone setting from default
		settingList[id] = {};
		for(var i in defaults){
			if(defaults.hasOwnProperty(i)){
				if(opts && opts.hasOwnProperty(i)){
					settingList[id][i] = opts[i];
				}else{
					settingList[id][i] = defaults[i];
				}
			}
		}
		addEvent(ele,'click',function(){
			tDatePicker.show(id);
		});
	};/* end add */

	/* update date*/
	this.updateDate = function(evt){
		var e = evt || window.event;
		stopAllEvents(e);
		var strDate = this.getAttribute('data-date');
		if(strDate){
			var date = isDate(strDate);
			if(date){
				createCalendar(date);
			}
		}
	}; /* end update date */

	this.selectDate = function(evt){
		var e = evt || window.event;
		stopAllEvents(e);
		var strDate = this.getAttribute('data-date');
		if(strDate){
			var date = isDate(strDate);
			if(date){
				selectedDate = date;
				document.getElementById(curEleId).value = dateToFormat(date);
				document.getElementById(curEleId).focus();
				// 20160229 Update className
				if(this.classList){
					var allE = this.parentNode.parentNode.getElementsByClassName('selectedday');
					if(allE && allE.length>0){
						allE[0].classList.remove('selectedday');
					}
					// add class			
					this.classList.add('selectedday');

				}
			}
		}
	}; /* end select date */
	/* calendar navigation */
	this.prevYear = function(evt){
		var e = evt || window.event;
		stopAllEvents(e);
		if(false!=(minDate=isDate(settingList[curEleId].minDate))){
			if(calDate.getFullYear()<=minDate.getFullYear()){
				return false;
			}
		}
		calDate.setYear(calDate.getFullYear()-1);
		createCalendar(calDate);
	}
	this.prevMonth = function(evt){
		var e = evt || window.event;
		stopAllEvents(e);
		if(false!=(minDate=isDate(settingList[curEleId].minDate))){
			if(calDate.getMonth()<=minDate.getMonth() && calDate.getFullYear()<=minDate.getFullYear()){
				return false;
			}
		}
		calDate.setMonth(calDate.getMonth()-1);
		createCalendar(calDate);
	}
	this.nextYear = function(evt){
		var e = evt || window.event;
		stopAllEvents(e);
		if(false!=(maxDate=isDate(settingList[curEleId].maxDate))){
			if(calDate.getFullYear()>=maxDate.getFullYear()){
				return false;
			}
		}
		calDate.setYear(calDate.getFullYear()+1);
		createCalendar(calDate);
	}
	this.nextMonth = function(evt){
		var e = evt || window.event;
		stopAllEvents(e);
		if(false!=(maxDate=isDate(settingList[curEleId].maxDate))){
			if(calDate.getMonth()>=maxDate.getMonth() && calDate.getFullYear()>=maxDate.getFullYear()){
				return false;
			}
		}
		calDate.setMonth(calDate.getMonth()+1);
		createCalendar(calDate);
	}
	/* end calendar navigation */

	/* ------ helper function ------ */
	function isDate(d){
		if(d==null || d=='' || typeof(d)=='undefined'){
			return false;
		}
		if(typeof(d)==='object'){
			if(typeof(d.getTime)==='function'){
				return d;
			}
		}else{ //string
			var ts = Date.parse(d);
			if (!isNaN(ts)){
				// create date object
				try{
					var date = new Date(d);
					return date;
				}catch(e){
				}
			}
		}
		return false;
	}// isDate

	function dateFromISO(str){
		var match = [];
		if(str.length<=10){// 2010-01-02
			match = str.match(/^(\d{4})[\/\-\.\_](\d{1,2})[\/\-\.\_](\d{1,2})$/i);
		}else{ // 2010-01-02T01:01:01.555 or 2010/01/02 01:01:01.555
			match = str.match(/^(\d{4})[\/\-\.\_](\d{1,2})[\/\-\.\_](\d{1,2})[T? ](\d{1,2}):(\d{1,2}):(\d{1,2}).(\d{1,2})$/i);
		}
		if(match && match.length>0){
			var date = new Date(parseInt(match[1], 10), parseInt(match[2], 10)-1, parseInt(match[3], 10));
			if(match[4]){
				date.setHours(parseInt(match[4], 10));
			}
			if(match[5]){
				date.setMinutes(parseInt(match[5], 10));
			}
			if(match[6]){
				date.setSeconds(parseInt(match[6], 10));
			}
			if(match[7]){
				date.setMilliseconds(parseInt(match[7], 10));
			}
			return date;
		}
		return null;
	}

	function dateToISO(d){
		return d.getFullYear()+'-'+(d.getMonth()<9?'0'+(d.getMonth()+1):(d.getMonth()+1))+'-'+(d.getDate()<10?'0'+d.getDate():d.getDate())+'T'+(d.getHours()<10?'0'+d.getHours():d.getHours())+':'+(d.getMinutes()<10?'0'+d.getMinutes():d.getMinutes())+':'+(d.getSeconds()<10?'0'+d.getSeconds():d.getSeconds())+'.'+(d.getMilliseconds());
	}

	function addElement(type,id,classname,parent,html,title){
		var el = document.createElement(type);
		if(id!==null && typeof(id)!='undefined'){ el.setAttribute("id",id); }
		if(classname!==null && typeof(classname)!='undefined'){ el.className = classname; }
		if(parent!==null && typeof(parent)!='undefined'){ parent.appendChild(el); }
		if(html!==null && typeof(html)!='undefined'){
			if(type=='a'){
				var txt = document.createTextNode(html);
				el.appendChild(txt);
			}else{
				el.innerHTML=html; 
			}
		}
		if(title!==null && typeof(title)!='undefined'){
			el.setAttribute('title',title);
		}
		return el;
	}

	function addEvent(el, evt, handler, capture) {
        if (el.addEventListener) {
            el.addEventListener(evt, handler, capture || false);
        } else if (el.attachEvent) {
            el.attachEvent('on' + evt, handler);
        }
    }

    function getOffset(el){
    	var x=0, y=0, w=0, h=0;

    	w = el.offsetWidth;
    	h = el.offsetHeight;
    	// loop through to parents
    	while( el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop) ){
        	x += el.offsetLeft - el.scrollLeft;
        	y += el.offsetTop - el.scrollTop;
        	el = el.offsetParent;
    	}
    	

    	return {'x':Math.floor(x), 'y':Math.floor(y), 'w':Math.floor(w), 'h':Math.floor(h)};
    }
    function stopAllEvents(evt) {
        if (evt.stopPropagation){ evt.stopPropagation(); }
        if (evt.preventDefault){ evt.preventDefault(); }
        if (evt.cancelBubble){ evt.cancelBubble=true; }
        if (evt.returnValue){ evt.returnValue = false; }
    }
    /* end helper function */

	/* ------ return this object ------ */
	return this;
})();

window.addEventListener('load',function(){tDatePicker.init();});