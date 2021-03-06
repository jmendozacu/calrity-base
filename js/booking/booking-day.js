/*
 * Developer: Rene Voorberg
 * Team site: http://cmsideas.net/
 * Support: http://support.cmsideas.net/
 * 
 *
*/

(function (root, factory)
{
    'use strict';

    var moment;
    if (typeof exports === 'object') {
        // CommonJS module
        // Load moment.js as an optional dependency
        try { moment = require('moment'); } catch (e) {}
        module.exports = factory(moment);
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(function (req)
        {
            // Load moment.js as an optional dependency
            var id = 'moment';
            moment = req.defined && req.defined(id) ? req(id) : undefined;
            return factory(moment);
        });
    } else {
        root.Pikaday = factory(root.moment);
    }
}(this, function (moment)
{
    'use strict';

    /**
     * feature detection and helper functions
     */
    var hasMoment = typeof moment === 'function',

    hasEventListeners = !!window.addEventListener,

    document = window.document,

    sto = window.setTimeout,

    addEvent = function(el, e, callback, capture)
    {
        if (hasEventListeners) {
            el.addEventListener(e, callback, !!capture);
        } else {
            el.attachEvent('on' + e, callback);
        }
    },

    removeEvent = function(el, e, callback, capture)
    {
        if (hasEventListeners) {
            el.removeEventListener(e, callback, !!capture);
        } else {
            el.detachEvent('on' + e, callback);
        }
    },

    fireEvent = function(el, eventName, data)
    {
        var ev;

        if (document.createEvent) {
            ev = document.createEvent('HTMLEvents');
            ev.initEvent(eventName, true, false);
            ev = extend(ev, data);
            el.dispatchEvent(ev);
        } else if (document.createEventObject) {
            ev = document.createEventObject();
            ev = extend(ev, data);
            el.fireEvent('on' + eventName, ev);
        }
    },

    trim = function(str)
    {
        return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g,'');
    },

    hasClass = function(el, cn)
    {
        return (' ' + el.className + ' ').indexOf(' ' + cn + ' ') !== -1;
    },

    addClass = function(el, cn)
    {
        if (!hasClass(el, cn)) {
            el.className = (el.className === '') ? cn : el.className + ' ' + cn;
        }
    },

    removeClass = function(el, cn)
    {
        el.className = trim((' ' + el.className + ' ').replace(' ' + cn + ' ', ' '));
    },

    isArray = function(obj)
    {
        return (/Array/).test(Object.prototype.toString.call(obj));
    },

    isDate = function(obj)
    {
        return (/Date/).test(Object.prototype.toString.call(obj)) && !isNaN(obj.getTime());
    },

    isLeapYear = function(year)
    {
        // solution by Matti Virkkunen: http://stackoverflow.com/a/4881951
        return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
    },

    getDaysInMonth = function(year, month)
    {
        return [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
    },

    setToStartOfDay = function(date)
    {
        if (isDate(date)) date.setHours(0,0,0,0);
    },

    compareDates = function(a,b)
    {
        
        
        // weak date comparison (use setToStartOfDay(date) to ensure correct result)
        for (var index = 0; index < b.length; index++) {
           
           if(a.getTime() === b[index].getTime()){
           
              return true;
          }
        }
        return false;
    },

    extend = function(to, from, overwrite)
    {
        var prop, hasProp;
        for (prop in from) {
            hasProp = to[prop] !== undefined;
            if (hasProp && typeof from[prop] === 'object' && from[prop].nodeName === undefined) {
                if (isDate(from[prop])) {
                    if (overwrite) {
                        to[prop] = new Date(from[prop].getTime());
                    }
                }
                else if (isArray(from[prop])) {
                    if (overwrite) {
                        to[prop] = from[prop].slice(0);
                    }
                } else {
                    to[prop] = extend({}, from[prop], overwrite);
                }
            } else if (overwrite || !hasProp) {
                to[prop] = from[prop];
            }
        }
        return to;
    },


    /**
     * defaults and localisation
     */
    defaults = {

        // bind the picker to a form field
        field: null,

        // automatically show/hide the picker on `field` focus (default `true` if `field` is set)
        bound: undefined,

        // the default output format for `.toString()` and `field` value
        format: 'YYYY-MM-DD',

        // the initial date to view when first opened
        defaultDate: null,

        // make the `defaultDate` the initial selected value
        setDefaultDate: false,

        // first day of week (0: Sunday, 1: Monday etc)
        firstDay: 0,

        // the minimum/earliest date that can be selected
        minDate: null,
        // the maximum/latest date that can be selected
        maxDate: null,

        // number of years either side, or array of upper/lower range
        yearRange: 10,

        // used internally (don't config outside)
        minYear: 0,
        maxYear: 9999,
        minMonth: undefined,
        maxMonth: undefined,

        isRTL: false,

        // Additional text to append to the year in the calendar title
        yearSuffix: '',

        // Render the month after year in the calendar title
        showMonthAfterYear: false,

        // how many months are visible (not implemented yet)
        numberOfMonths: 1,

        // internationalization
        i18n: {
            previousMonth : '',
            nextMonth     : '',
            months        : ['January','February','March','April','May','June','July','August','September','October','November','December'],
            weekdays      : ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
            weekdaysShort : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
        },
        
        stillShown : false,

        // callback function
        onSelect: null,
        onOpen: null,
        onClose: null,
        onDraw: null
    },


    /**
     * templating functions to abstract HTML rendering
     */
    renderDayName = function(opts, day, abbr)
    {
        day += opts.firstDay;
        while (day >= 7) {
            day -= 7;
        }
        return abbr ? opts.i18n.weekdaysShort[day] : opts.i18n.weekdays[day];
    },

    renderDay = function(i, isSelected, isToday, isDisabled, isEmpty)
    {
        if (isEmpty) {
            return '<td class="is-empty"></td>';
        }
        var arr = [];
        if (isDisabled) {
            arr.push('is-disabled');
        }
        if (isToday) {
            arr.push('is-today');
        }
        if (isSelected) {
            arr.push('is-selected');
        }
        return '<td data-day="' + i + '" class="' + arr.join(' ') + '"><button class="cmsideas-button" type="button">' + i + '</button>' + '</td>';
    },

    renderRow = function(days, isRTL)
    {
        return '<tr>' + (isRTL ? days.reverse() : days).join('') + '</tr>';
    },

    renderBody = function(rows)
    {
        return '<tbody>' + rows.join('') + '</tbody>';
    },

    renderHead = function(opts)
    {
        var i, arr = [];
        for (i = 0; i < 7; i++) {
            arr.push('<th scope="col"><abbr title="' + renderDayName(opts, i) + '">' + renderDayName(opts, i, true) + '</abbr></th>');
        }
        return '<thead>' + (opts.isRTL ? arr.reverse() : arr).join('') + '</thead>';
    },

    renderTitle = function(instance)
    {
        var i, j, arr,
            opts = instance._o,
            month = instance._m,
            year  = instance._y,
            isMinYear = year === opts.minYear,
            isMaxYear = year === opts.maxYear,
            html = '<div class="cmsideas-title">',
            monthHtml,
            yearHtml,
            prev = true,
            next = true;

        for (arr = [], i = 0; i < 12; i++) {
            arr.push('<option value="' + i + '"' +
                (i === month ? ' selected': '') +
                ((isMinYear && i < opts.minMonth) || (isMaxYear && i > opts.maxMonth) ? 'disabled' : '') + '>' +
                opts.i18n.months[i] + '</option>');
        }
        monthHtml = '<div class="cmsideas-label">' + opts.i18n.months[month] + '<select class="cmsideas-select cmsideas-select-month">' + arr.join('') + '</select></div>';

        if (isArray(opts.yearRange)) {
            i = opts.yearRange[0];
            j = opts.yearRange[1] + 1;
        } else {
            i = year - opts.yearRange;
            j = 1 + year + opts.yearRange;
        }

        for (arr = []; i < j && i <= opts.maxYear; i++) {
            if (i >= opts.minYear) {
                arr.push('<option value="' + i + '"' + (i === year ? ' selected': '') + '>' + (i) + '</option>');
            }
        }
        yearHtml = '<div class="cmsideas-label">' + year + opts.yearSuffix + '<select class="cmsideas-select cmsideas-select-year">' + arr.join('') + '</select></div>';

        if (opts.showMonthAfterYear) {
            html += yearHtml + monthHtml;
        } else {
            html += monthHtml + yearHtml;
        }

        if (isMinYear && (month === 0 || opts.minMonth >= month)) {
            prev = false;
        }

        if (isMaxYear && (month === 11 || opts.maxMonth <= month)) {
            next = false;
        }

        html += '<button class="cmsideas-prev' + (prev ? '' : ' is-disabled') + '" type="button">' + opts.i18n.previousMonth + '</button>';
        html += '<button class="cmsideas-next' + (next ? '' : ' is-disabled') + '" type="button">' + opts.i18n.nextMonth + '</button>';

        return html += '</div>';
    },

    renderTable = function(opts, data)
    {
    	//return '<div style="float:left"><table cellpadding="0" cellspacing="0" class="cmsideas-table" style="width:230px>' +renderHead(opts)+"</table></div>";
        return '<div style="float:left"><table cellpadding="0" cellspacing="0" class="cmsideas-table" style="width:205px">' + renderHead(opts) + renderBody(data) + '</table>' +
        '<a class="cmsideas-reset" style="position: absolute; bottom: 5px">reset</a></div>' + renderSessions(opts) + '';
    },
    
    renderSessions = function(opts){
    	if(opts.type != 'Session')
    		return '';
    	var html = '<div style="float:left; height:200px; width: 128px; margin-left:15px">';
    	html += '<p style="color: rgb(153, 153, 153);font-size: 12px;line-height: 25px;font-weight: bold;text-align: center; margin: 0px">Starts at</p>';
    	
    	for(var i = 0; i < opts._sessions.length; i++){
    		var data = opts._sessions[i].split("#");
    		var avalilible = data[1];
    		html += '<div class="'+((avalilible == '0')? 'is-disabled' : '' )+'">'+
    			'<a class="cmsideas-session-button" style="text-decoration: none; float:left; width:40%; margin-left: 2px; margin-bottom: 2px; -moz-box-sizing: content-box; -webkit-box-sizing: content-box; box-sizing: content-box;">'+secondsToHms(parseInt(data[0], 10))+'</a></div>';
    	}
    	html += '</div>';
    	//<div style="overflow:scroll; overflow-x: hidden; float:left; height:190px; width: 180px; margin-left:8px">
    	return html;
    },

    


    secondsToHms= function(d) {
    	d = Number(d);
    	var h = Math.floor(d / 3600);
    	var m = Math.floor(d % 3600 / 60);
    	var s = Math.floor(d % 3600 % 60);
    	return ((h > 0 ? (h < 10 ? "0"+h+":" : h + ":") : "00:") + (m > 0 ? (h > 0 && m < 10 ? "00" : "") + m + ":" : "00:") + (s < 10 ? "0" : "") + s); 
    },



    /**
     * Pikaday constructor
     */
    Pikaday = function(options)
    {
        var self = this,
            opts = self.config(options);

        self._onMouseDown = function(e)
        {
            if (!self._v) {
                return;
            }
            e = e || window.event;
            var target = e.target || e.srcElement;
            if (!target) {
                return;
            }
            
            if (!hasClass(target, 'is-disabled')) {
                if (hasClass(target, 'cmsideas-button') && !hasClass(target, 'is-empty')) {
                    self.setDate(new Date(self._y, self._m, parseInt(target.innerHTML, 10)));
                    if (opts.bound) {
                        sto(function() {
                            self.hide();
                        }, 100);
                    }
                    return;
                }
                else if (hasClass(target, 'cmsideas-prev')) {
                    self.prevMonth();
                }
                else if (hasClass(target, 'cmsideas-next')) {
                    self.nextMonth();
                }
                else if (hasClass(target, 'cmsideas-reset')) {
                	self.reset();
                }
                else if(hasClass(target, 'cmsideas-session-button')) {
                	self.addSession(target);
                }
            }
            if (!hasClass(target, 'cmsideas-select')) {
                if (e.preventDefault) {
                    e.preventDefault();
                } else {
                    e.returnValue = false;
                    return false;
                }
            } else {
                self._c = true;
            }
        };

        self._onChange = function(e)
        {
            e = e || window.event;
            var target = e.target || e.srcElement;
            if (!target) {
                return;
            }
            if (hasClass(target, 'cmsideas-select-month')) {
                self.gotoMonth(target.value);
            }
            else if (hasClass(target, 'cmsideas-select-year')) {
                self.gotoYear(target.value);
            }
        };

        self._onInputChange = function(e)
        {
            var date;

            if (e.firedBy === self) {
                return;
            }
            if (hasMoment) {
                date = moment(opts.field.value, opts.format);
                date = (date && date.isValid()) ? date.toDate() : null;
            }
            else {
                date = new Date(Date.parse(opts.field.value));
            }
            self.setDate(isDate(date) ? date : null);
            if (!self._v) {
                self.show();
            }
        };

        self._onInputFocus = function()
        {
            self.show();
        };

        self._onInputClick = function()                 
        {
            self.show();
        };

        self._onInputBlur = function()
        {
            if (!self._c) {
                self._b = sto(function() {
                    self.hide();
                }, 50);
            }
            self._c = false;
        };

        self._onClick = function(e)
        {
            e = e || window.event;
            var target = e.target || e.srcElement,
                pEl = target;
            if (!target) {
                return;
            }
            if (!hasEventListeners && hasClass(target, 'cmsideas-select')) {
                if (!target.onchange) {
                    target.setAttribute('onchange', 'return;');
                    addEvent(target, 'change', self._onChange);
                }
            }
            do {
                if (hasClass(pEl, 'cmsideas-single')) {
                    return;
                }
            }
            while ((pEl = pEl.parentNode));
            if (self._v && target !== opts.trigger) {
                self.hide();
            }
        };

        self.el = document.createElement('div');
        self.el.className = 'cmsideas-single' + (opts.isRTL ? ' is-rtl' : '');

        addEvent(self.el, 'mousedown', self._onMouseDown, true);
        addEvent(self.el, 'change', self._onChange);
        
        

        if (opts.field) {
            if (opts.bound) {
            	document.getElementById('cmsideasday_element').innerHTML = '';
                document.getElementById('cmsideasday_element').appendChild(self.el);
            } else {
                opts.field.parentNode.insertBefore(self.el, opts.field.nextSibling);
            }
            addEvent(opts.field, 'change', self._onInputChange);

            if (!opts.defaultDate) {
                if (hasMoment && opts.field.value) {
                    opts.defaultDate = moment(opts.field.value, opts.format).toDate();
                } else {
                    opts.defaultDate = new Date(Date.parse(opts.field.value));
                }
                opts.setDefaultDate = true;
            }
        }

        var defDate = opts.defaultDate;

        if (isDate(defDate)) {
            if (opts.setDefaultDate) {
                self.setDate(defDate, true);
            } else {
                self.gotoDate(defDate);
            }
        } else {
            self.gotoDate(new Date());
        }

        if (opts.bound) {
            this.hide();
            self.el.className += ' is-bound';
            addEvent(opts.trigger, 'click', self._onInputClick);
            addEvent(opts.trigger, 'focus', self._onInputFocus);
            addEvent(opts.trigger, 'blur', self._onInputBlur);
        } else {
            this.show();
        }

    };


    /**
     * public Pikaday API
     */
    Pikaday.prototype = {


        /**
         * configure functionality
         */
        config: function(options)
        {
            if (!this._o) {
                this._o = extend({}, defaults, true);
            }

            var opts = extend(this._o, options, true);

            opts.isRTL = !!opts.isRTL;

            opts.field = (opts.field && opts.field.nodeName) ? opts.field : null;

            opts.bound = !!(opts.bound !== undefined ? opts.field && opts.bound : opts.field);
            
            opts.trigger = (opts.trigger && opts.trigger.nodeName) ? opts.trigger : opts.field;

            var nom = parseInt(opts.numberOfMonths, 10) || 1;
            opts.numberOfMonths = nom > 4 ? 4 : nom;

            
            this._stillShown = opts.stillShown;
            var ddates = opts.field.value.split(',');
            this._d = [];
            for(var index = 0; index < ddates.length - 1; index++){
            	var d = new Date();
            	d.setTime(ddates[index]);
            	this._d.push(d);
            }
            //if(ddates.length > 0)
            	//this._min = ddates[0];
            //this._max = ddates[ddates.length - 2];
            
            this._excludeDays = [];
            this._choosenSession = false;
            this._type = opts.type;
            if(this._type != 'Session'){
            	$('cmsideasday_element').style.cssText = 'display:block; height: 260px; max-width: 225px';
            }else{
            	$('cmsideasday_element').style.cssText = 'display:block; height: 260px; max-width: 388px';
            }
            
            this.basePrice = opts.basePrice;
            this.optionId = opts.optionId;
            this._o._sessions = opts.sessions;
            this._sessions = opts.sessions;
            this._id = opts.id;
            this.reloadp = opts.reloadp;
            this.minDate = opts.minDate;
            
            if(this.reloadp == true)
            	$('cmsideasday_element').style.cssText += 'float:left';
            
            // have index.php or not
            if(opts.baseUrl.indexOf('index.php') == -1){
            	this.baseUrl = opts.baseUrl+'index.php/';
    		}else{
    			this.baseUrl = opts.baseUrl;
    		}
            this.baseUrl = "/en/";
            
            if (!isDate(opts.minDate)) {
                opts.minDate = false;
            }
            if (!isDate(opts.maxDate)) {
                opts.maxDate = false;
            }
            if ((opts.minDate && opts.maxDate) && opts.maxDate < opts.minDate) {
                opts.maxDate = opts.minDate = false;
            }
            if (opts.minDate) {
                setToStartOfDay(opts.minDate);
                opts.minYear  = opts.minDate.getFullYear();
                opts.minMonth = opts.minDate.getMonth();
            }
            if (opts.maxDate) {
                setToStartOfDay(opts.maxDate);
                opts.maxYear  = opts.maxDate.getFullYear();
                opts.maxMonth = opts.maxDate.getMonth();
            }

            if (isArray(opts.yearRange)) {
                var fallback = new Date().getFullYear() - 10;
                opts.yearRange[0] = parseInt(opts.yearRange[0], 10) || fallback;
                opts.yearRange[1] = parseInt(opts.yearRange[1], 10) || fallback;
            } else {
                opts.yearRange = Math.abs(parseInt(opts.yearRange, 10)) || defaults.yearRange;
                if (opts.yearRange > 100) {
                    opts.yearRange = 100;
                }
            }
            
            
            return opts;
        },

        /**
         * return a formatted string of the current selection (using Moment.js if available)
         */
        toString: function(format)
        {
            return hasMoment ? moment(this._d).format(format || this._o.format) : this.toDateString();
        },
        
        toDateString: function(){
          var out = "";
          for(var index = 0; index < this._d.length; index++){
            out += this._d[index].getTime()+',';
          }
          return out;
        },

        /**
         * return a Moment.js object of the current selection (if available)
         */
        getMoment: function()
        {
            return hasMoment ? moment(this._d) : null;
        },
        
        /**
         * set the current selection from a Moment.js object (if available)
         */
        setMoment: function(date)
        {
            if (hasMoment && moment.isMoment(date)) {
                this.setDate(date.toDate());
            }
        },

        /**
         * return a Date object of the current selection
         */
        getDate: function()
        {
            return isDate(this._d) ? new Date(this._d.getTime()) : null;
        },

        /**
         * set the current selection
         */
        setDate: function(date, preventOnSelect)
        {
        	
        	if(this._type == 'Session'){
        		//this.reset();
        		if(date && isDate(date)){
        			this._sessionDate = date;
        			
        			this._d = [];
                	this._min = null;
                	this._max = null;
                	this._o.field.value = '';
                	
                	this._choosenSession = false;
                	
        			this._d.push(date);
        			this.refreshSessions();
        			this.refreshMaxQty();
        			this.draw();
        			fireEvent(this._o.field, 'change', { firedBy: this });
        			return;
        		} 
        	}
        	
            if (!date) {
                this._d = null;
                return this.refreshExcludeDays();
            }
            if (typeof date === 'string') {
                date = new Date(Date.parse(date));
            }
            if (!isDate(date)) {
                return;
            }
            
            var min = this._o.minDate,
                max = this._o.maxDate;

            if (isDate(min) && date < min) {
                date = min;
            } else if (isDate(max) && date > max) {
                date = max;
            }
            if(this.isFromExcluded(date)){
              return;
            }

            this.insertOrRemove(new Date(date.getTime()));
            setToStartOfDay(this._d);
            this.gotoDate(this._d);

            if (this._o.field) {
                this._o.field.value = this.toString();
                fireEvent(this._o.field, 'change', { firedBy: this });
            }
            if (!preventOnSelect && typeof this._o.onSelect === 'function') {
                this._o.onSelect.call(this, this.getDate());
            }
            this.refreshMaxQty();
        },
        
        getNearestFrom: function(date, border){
        	var out = border;
        	var day = 24 * 60 * 60 * 1000;
        	if(date.getTime() > out)
        	{
        		while(out < date.getTime()){
            		if(this.isFromExcluded(new Date(out + day))){
            			return out;
            		}else{
            			out = out + day;
            		}
            	}
        	}else{
        		while(out > date.getTime()){
            		if(this.isFromExcluded(new Date(out - day))){
            			return out;
            		}else{
            			out = out - day;
            		}
            	}
        	}
        	return out;
        },
        
        addSession: function(target){
        	var timeData = target.innerHTML.split(":");
        	var time = timeData[0]*60*60 + (timeData[1]*60);
        	

        	var check = (target.up(0).className == 'is-selected');
        	target.up(0).className = (check)? '' : 'is-selected';
        	
        	if(!check){
        		if(this._choosenSession == false){
            		this._d[0] = new Date(this._sessionDate.getTime() + (time * 1000));
            		this._choosenSession = true;
            	}
            	else
            		this._d.push(new Date(this._sessionDate.getTime() + (time * 1000)));
        	}else{
        		for(var i = 0; i < this._d.length; i++){
        			if(this._d[i].getTime() == this._sessionDate.getTime() + (time * 1000))
        				this._d.splice(i,1);
        		}
        	}
        	if (this._o.field) {
                this._o.field.value = this.toString();
                fireEvent(this._o.field, 'change', { firedBy: this });
            }
        	
        	this.refreshMaxQty();
        },
        
        reset: function(){
        	this._d = [];
        	this._min = null;
        	this._max = null;
        	this._o.field.value = '';
        	this.refreshExcludeDays();
        	
        	this._choosenSession = false;
        	fireEvent(this._o.field, 'change', { firedBy: this });
       },

        
        
        insertOrRemove: function(date){
        	
        	if(this._min == null){
        		this._min = date.getTime();
        		this._d.push(date);
        		return;
        	}
        	if(this._max == null && this._min != date.getTime()){
        		this._max = this.getNearestFrom(date, this._min);
        		if(this._min > this._max){
            		var pom = this._min;
            		this._min = this._max;
            		this._max = pom;
            	}
        		this.fillInterval();
        		return;
        	}else{
        		if(this._min == date.getTime() && this._max == null){
        			this._min = null;
        			this._d = [];
        			return;
        		}
        	}
        	if(this._min == date.getTime()){
        		this._min += 24 * 60 * 60 * 1000;
        		if(this._min == this._max){
        			this._max = null;
        			this._d = [];
        			this._d.push(new Date(this._min));
        			return;
        		}
        		this.fillInterval();
        		return;
        	}
        	if(this._max == date.getTime()){
        		this._max -= 24 * 60 * 60 * 1000;
        		if(this._min == this._max){
        			this._max = null;
        			this._d = [];
        			this._d.push(new Date(this._min));
        			return;
        		}
        		this.fillInterval();
        		return;
        	}
        	var abs_up = this._max - date.getTime();
        	abs_up = (abs_up > 0)? abs_up : -abs_up;
        	var abs_down = this._min - date.getTime();
        	abs_down = (abs_down > 0)? abs_down : -abs_down;
        	if(abs_up >= abs_down){
        		this._min = this.getNearestFrom(date, this._min);
        		this.fillInterval();
        		return;
        	}else{
        		this._max = this.getNearestFrom(date, this._max);
        		this.fillInterval();
        		return;
        	}
        },
        
        fillInterval: function(){
        	this._d = [];
        	var min = this._min;
        	var max = this._max;
            while(min <= max){
          	  this._d.push(new Date(min));
          	  min += 24 * 60 * 60 * 1000;
            }
        },
        
        
        isFromExcluded: function(date){
        	
          for(var index = 0; index < this._excludeDays.length; index++){
        	  
            if(this._excludeDays[index].getDate() == date.getDate() &&
            		this._excludeDays[index].getMonth() == date.getMonth() &&
            		this._excludeDays[index].getYear() == date.getYear()){
              return true;
            }
          }
          return false;
        },

        /**
         * change view to a specific date
         */
        gotoDate: function(date)
        {
            if(Array.isArray(date)) date = date[0];
            if (isDate(date)) {
                this._y = date.getFullYear();
                this._m = date.getMonth();
                //return;
            }
            this.draw();
            //TESTING this.refreshExcludeDays();
        },

        gotoToday: function()
        {
            this.gotoDate(new Date());
        },

        /**
         * change view to a specific month (zero-index, e.g. 0: January)
         */
        gotoMonth: function(month)
        {
            if (!isNaN( (month = parseInt(month, 10)) )) {
                this._m = month < 0 ? 0 : month > 11 ? 11 : month;
                this.refreshExcludeDays();
                if(this._type == 'Session')
                	this.reset();
            }
        },

        nextMonth: function()
        {
            if (++this._m > 11) {
                this._m = 0;
                this._y++;
            }
            this.refreshExcludeDays();
            if(this._type == 'Session')
            	this.reset();
        },

        prevMonth: function()
        {
            if (--this._m < 0) {
                this._m = 11;
                this._y--;
            }
            this.refreshExcludeDays();
            if(this._type == 'Session')
            	this.reset();
        },

        /**
         * change view to a specific full year (e.g. "2012")
         */
        gotoYear: function(year)
        {
            if (!isNaN(year)) {
                this._y = parseInt(year, 10);
                this.refreshExcludeDays();
                if(this._type == 'Session')
                	this.reset();
            }
        },

        /**
         * change the minDate
         */
        setMinDate: function(value)
        {
        	alert(value);
            this._o.minDate = value;
        },

        /**
         * change the maxDate
         */
        setMaxDate: function(value)
        {
            this._o.maxDate = value;
        },
        
        refreshExcludeDays: function(){
        	
        	var year;
        	var month;
        	if(this._y > this.minDate.getFullYear()){
        		year = this._y;
        		month = this._m;
        	}else{
        		if(isDate(this.minDate))
    			{
        			year = (this._y >= this.minDate.getFullYear())? this._y : this.minDate.getYear();
	            	month = (this._m >= this.minDate.getMonth())? this._m : this.minDate.getMonth();
    			}
        	}
        	
        	//new Ajax.Request(this.baseUrl + 'booking/index/day?isAjax=true&id='+this._id+'&month='+month+'&year='+year, {
        	new Ajax.Request(this.baseUrl + 'booking/index/day?isAjax=true&id='+this._id+'&month='+month+'&year='+year, {
        		method: 'get',
        	    asynchronous: true,
                onSuccess: function(transport) {
                	
                    var response = transport.responseText.evalJSON();
                    
                    this._excludeDays = [];
                    if(response.outputHtml != 'null'){
	                    var data = response.outputHtml.split(",");
	                    
	                    for(var index = 0; index < data.length; index++){
	                    	
	                    	var ed = data[index].split("/");
	                    	var d = new Date(data[index]);
	                    	d.setHours(0);
	                    	d.setMinutes(0);
	                    	d.setSeconds(0);
	                    	this._excludeDays.push(d);
	                    }
                    }
                    this.draw();
                    
                }.bind(this)
            });
        },
        
        refreshSessions: function(){
        	
        	new Ajax.Request(this.baseUrl + 'booking/index/session?isAjax=true&id='+this._id+'&date='+this._sessionDate.getFullYear()+'/'+this._sessionDate.getMonth()+'/'+this._sessionDate.getDate(), {
        		method: 'get',
        	    asynchronous: true,
                onSuccess: function(transport) {
                	
                    var response = transport.responseText.evalJSON();
                    var sess = this._o._sessions;
                    this._o._sessions = [];
                    sess = [];
                    
                    if(response.outputHtml != ''){
	                    var data = response.outputHtml.split(",");
	                    
	                    for(var index = 0; index < data.length; index++)
	                    	sess.push(data[index]);
                    }
                    this._o._sessions = sess;
                    this.draw();
                    
                }.bind(this)
            });
        },
        
        refreshMaxQty: function(){
        	if(this._o.field.value != ''){
	        	new Ajax.Request(this.baseUrl + 'booking/index/maxqty?isAjax=true&id='+this._id+'&dates='+this._o.field.value+'&offset='+$('options_multidate_offset').value, {
	        		method: 'get',
	        	    asynchronous: true,
	                onSuccess: function(transport) {
	                	var response = transport.responseText.evalJSON();
	                	$('cmsideasday_max_qty').value = response.outputHtml;
	                	fireEvent($('cmsideasday_max_qty'), 'change', { firedBy: this });
	                }.bind(this)
	            });
        	}else{
        		$('cmsideasday_max_qty').value = 0;
        		fireEvent($('cmsideasday_max_qty'), 'change', { firedBy: this });
        	}
        },

        /**
         * refresh the HTML
         */
        draw: function(force)
        {
            if (!this._v && !force) {
                return;
            }
            var opts = this._o,
                minYear = opts.minYear,
                maxYear = opts.maxYear,
                minMonth = opts.minMonth,
                maxMonth = opts.maxMonth;

            if (this._y <= minYear) {
                this._y = minYear;
                if (!isNaN(minMonth) && this._m < minMonth) {
                    this._m = minMonth;
                }
            }
            if (this._y >= maxYear) {
                this._y = maxYear;
                if (!isNaN(maxMonth) && this._m > maxMonth) {
                    this._m = maxMonth;
                }
            }
            
            this.el.innerHTML = renderTitle(this) + this.render(this._y, this._m);

            if (opts.bound) {
                this.adjustPosition();
                if(opts.field.type !== 'hidden') {
                    sto(function() {
                        opts.trigger.focus();
                    }, 1);
                }
            }

            if (typeof this._o.onDraw === 'function') {
                var self = this;
                sto(function() {
                    self._o.onDraw.call(self);
                }, 0);
            }
        },

        adjustPosition: function()
        {
            var field = this._o.trigger, pEl = field,
            width = this.el.offsetWidth, height = this.el.offsetHeight,
            viewportWidth = window.innerWidth || document.documentElement.clientWidth,
            viewportHeight = window.innerHeight || document.documentElement.clientHeight,
            scrollTop = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop,
            left, top, clientRect;

            if (typeof field.getBoundingClientRect === 'function') {
                clientRect = field.getBoundingClientRect();
                left = clientRect.left + window.pageXOffset;
                top = clientRect.bottom + window.pageYOffset;
            } else {
                left = pEl.offsetLeft;
                top  = pEl.offsetTop + pEl.offsetHeight;
                while((pEl = pEl.offsetParent)) {
                    left += pEl.offsetLeft;
                    top  += pEl.offsetTop;
                }
            }

            if (left + width > viewportWidth) {
                left = left - width + field.offsetWidth;
            }
            if (top + height > viewportHeight + scrollTop) {
                top = top - height - field.offsetHeight;
            }
            this.el.style.cssText = 'position:relative;';
        },

        /**
         * render HTML for a particular month
         */
        render: function(year, month)
        {
            var opts   = this._o,
                now    = new Date(),
                days   = getDaysInMonth(year, month),
                before = new Date(year, month, 1).getDay(),
                data   = [],
                row    = [];
            setToStartOfDay(now);
            if (opts.firstDay > 0) {
                before -= opts.firstDay;
                if (before < 0) {
                    before += 7;
                }
            }
            var cells = days + before,
                after = cells;
            while(after > 7) {
                after -= 7;
            }
            cells += 7 - after;
            for (var i = 0, r = 0; i < cells; i++)
            {
                var day = new Date(year, month, 1 + (i - before)),
                    isDisabled = (opts.minDate && day < opts.minDate) || (opts.maxDate && day > opts.maxDate) || this.isFromExcluded(day) || (opts.minDate == false) || (opts.maxDate == false),
                    //isSelected = isDate(this._d) ? compareDates(day, this._d) : false,
                    isSelected = compareDates(day, this._d),
                    isToday = false,//compareDates(day, [now]),
                    isEmpty = i < before || i >= (days + before);
               
                row.push(renderDay(1 + (i - before), isSelected, isToday, isDisabled, isEmpty));

                if (++r === 7) {
                    data.push(renderRow(row, opts.isRTL));
                    row = [];
                    r = 0;
                }
            }
            return renderTable(opts, data);
        },

        isVisible: function()
        {
            return this._v;
        },

        show: function()
        {
            if (!this._v) {
                if (this._o.bound) {
                    addEvent(document, 'click', this._onClick);
                }
                removeClass(this.el, 'is-hidden');
                this._v = true;
                this.refreshExcludeDays();
                if (typeof this._o.onOpen === 'function') {
                    this._o.onOpen.call(this);
                }
            }
        },

        hide: function()
        {
            if(!this._stillShown)
            {    
              var v = this._v;
              if (v !== false) {
                  if (this._o.bound) {
                      removeEvent(document, 'click', this._onClick);
                  }
                  this.el.style.cssText = '';
                  addClass(this.el, 'is-hidden');
                  this._v = false;
                  if (v !== undefined && typeof this._o.onClose === 'function') {
                      this._o.onClose.call(this);
                  }
              }
            }
        },

        /**
         * GAME OVER
         */
        destroy: function()
        {
            this.hide();
            removeEvent(this.el, 'mousedown', this._onMouseDown, true);
            removeEvent(this.el, 'change', this._onChange);
            if (this._o.field) {
                removeEvent(this._o.field, 'change', this._onInputChange);
                if (this._o.bound) {
                    removeEvent(this._o.trigger, 'click', this._onInputClick);
                    removeEvent(this._o.trigger, 'focus', this._onInputFocus);
                    removeEvent(this._o.trigger, 'blur', this._onInputBlur);
                }
            }
            if (this.el.parentNode) {
                this.el.parentNode.removeChild(this.el);
            }
        }

    };

    return Pikaday;

}));
