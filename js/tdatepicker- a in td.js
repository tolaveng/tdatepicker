/*
	TDatePicker
	- Author: Tola Veng
	- Email: vengtola@gmail.com
	- Website: tola.ws
	- Created: 2015-09-10
	- Updated: 2016-01-30
 	- Usage:
 		tDatePicker('htmlID',{options});
 	- Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
*/
var tDatePicker = (function(id,opts){
	var settingList = []; /* store all individules settings */
	var setting = {}; /* current setting */	
	var defaults = {'minDate':null, 'maxDate':null, 'format':'YYYY-MM-DD'};
	var isOpen = false;

	var monthName = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	var monthNameFull = ['January','February','March','April','May','June','July','August','September','October','November','December'];
	var dayName = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
	var dayNameFull = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
	
	var curDate = new Date();	
	var curEle = null; /* current html id */
	var tdatepickerbox; /* datepicker element div */

	/* create html element from calendar object */
	var createCalendar = function(d){
		var header, body, footer, date, month, prevMonth, nextMonth, year;
		var toDay = new Date();

		if(d){
			date = new Date(d.getFullYear(),d.getMonth(), 1, 0, 0, 0, 0);
		}else{
			date = new Date();
			date.setDate(1);
		}
		month = date.getMonth();
		prevMonth = new Date(date.getTime());
		prevMonth.setMonth(month-1);
		nextMonth = new Date(date.getTime());
		nextMonth.setMonth(month+1);
		year = date.getFullYear();
		prevYear = new Date(date.getTime());
		prevYear.setFullYear(year-1);
		nextYear = new Date(date.getTime());
		nextYear.setFullYear(year+1);


		var weekDay = date.getDay();
		if(weekDay==0){ weekDay=7; } // make Sunday is 7
		weekDay-=1; // make Monday is 0
		// Calc the day of previou month need to be included, how many days
		if(weekDay==0){ //if the 1th is Monday, display the prev week
			date.setDate(date.getDate()-7);
		}else{
			date.setDate(date.getDate()-weekDay);
		}
		body = '<tbody><tr>';
		// the day name of the week
		for(var i=1; i<dayName.length; i++){
		body+= '<td><span class="tdatepicker-dayname">'+dayName[i]+'</span></td>';
		}
		body+= '<td><span class="tdatepicker-dayname">'+dayName[0]+'</span></td></tr><tr>';
		// loop through the month
		var className = "tdatepicker-day"
		for(var i=0; i<42; i++){ // 7days*6row
			if(month!=date.getMonth()){className ='tdatepicker-day othermonth'; }else{ className = "tdatepicker-day"; }
			if(date.getFullYear()==curDate.getFullYear() && date.getMonth()==curDate.getMonth() && date.getDate()==curDate.getDate()){
				className +=' currentday';
			}
			if(date.getFullYear()==toDay.getFullYear() && date.getMonth()==toDay.getMonth() && date.getDate()==toDay.getDate()){
				className +=' today';	
			}
			if(date.getDay()==0 || date.getDay()==6){className +=' weekend'; }
			body+= '<td><a href="#" onclick="tDatePicker.selectDate(\''+dateToISO(date)+'\'); return false;" class="'+className+'" title="'+(date.toString())+'" >'+date.getDate()+'</a></td>';
			if((i+1)%7==0){
				body+= '</tr><tr>';
			}
			date.setDate(date.getDate()+1);
		}
		body+= '</tr></tbody>';
		// create html element
		header = '<table><thead><tr>';
		header+= '<td><a href="#" class="tdatepicker-prev" title="'+(year-1)+'" onclick="tDatePicker.changeDate(\''+dateToISO(prevYear)+'\'); return false;">&lt;&lt;</a></td> <td><a href="#" class="tdatepicker-prev" title="'+monthNameFull[prevMonth.getMonth()]+'" onclick="tDatePicker.changeDate(\''+dateToISO(prevMonth)+'\'); return false;">&lt;</a></td>';
		header+= '<td colspan="3"> '+monthNameFull[month]+' '+year+' </td>';
		header+= '<td><a href="#" class="tdatepicker-next" title="'+monthNameFull[nextMonth.getMonth()]+'" onclick="tDatePicker.changeDate(\''+dateToISO(nextMonth)+'\'); return false;">&gt;</a></td> <td><a href="#" class="tdatepicker-next" title="'+(year+1)+'" onclick="tDatePicker.changeDate(\''+dateToISO(nextYear)+'\');return false;">&gt;&gt;</a></td></tr></thead>';

		footer = '<tfoot><tr><td colspan="7"><a href="#" onclick="tDatePicker.changeDate(\''+dateToISO(toDay)+'\'); return false;">Today</a></td></tr></tfoot></table>';

		tdatepickerbox = document.getElementById('tdatepickerbox');
		if(tdatepickerbox){
		}else{
			tdatepickerbox = addElement('div','tdatepickerbox','tdatepicker-box',document.body);
		}
		tdatepickerbox.innerHTML = header+body+footer;
	}; /* end create calendar */

	/* public */

	this.isOpen = function(){
		return isOpen;
	};

	this.init = function(){
		createCalendar();

		// Add event to document, close calendar when click outside
		addEvent(document,'click',function(e){
			var evt = e || window.event;
			var target = evt.target || evt.srcElement;
			if(tDatePicker.isOpen){
				var outside = true;
				// loop to find the target is inside the div
				while(target!==null){
					id = target.getAttribute('id');
					if(id && (id=='tdatepickerbox' || id==curEle)){
						outside = false;
						break;
					}
					target = target.parentElement;
				}
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
		curEle = id;
		var xy = getOffset(ele);
		tdatepickerbox.style.display = 'block';
		tdatepickerbox.style.left = xy.x+'px';
		tdatepickerbox.style.top = (xy.y+xy.h)+'px';
		isOpen = true;
	};/* end show */

	this.hide = function(){
		if(isOpen){
			tdatepickerbox.style.display = 'none';
			isOpen = false;
		}
	};

	this.add = function(id,opt){
		var ele = document.getElementById(id);
		if(!ele){
			return null;
		}
		addEvent(ele,'click',function(){
			tDatePicker.show(id);
		});
	};/* end add */

	/* change date*/
	this.changeDate = function(strDate){
		var date = isDate(strDate);
		if(date){
			createCalendar(date);
		}
	}; /* end change date */

	this.selectDate = function(strDate){
		var date = isDate(strDate);
		if(date){
			document.getElementById(curEle).value = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate();
		}
	}; /* end select date */

	/* ------ helper function ------ */
	function isDate(d){
		if(typeof(d)==='object'){
			if(typeof(d.getTime)==='function'){
				return d;
			}
		}else{ //string
			var ts = Date.parse(d);
			if (!isNaN(ts)){
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
			match = str.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/i);
		}else{ // 2010-01-02T01:01:01.555 or 2010/01/02 01:01:01.555
			match = str.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})[T? ](\d{1,2}):(\d{1,2}):(\d{1,2}).(\d{1,2})$/i);
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

	/* ------ return this object ------ */
	return this;
})();

window.addEventListener('load',function(){tDatePicker.init();});