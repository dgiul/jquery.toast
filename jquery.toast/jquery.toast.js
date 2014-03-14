/**
*	A simple "toast" style message plugin for jQuery
*	Originally developed by Soldier-B (https://github.com/Soldier-B/)
*	Forked and modified by Dan Giulvezan (https://github.com/dgiul)
*
*	@param {Number} width The width of the notification (optional)
*	@param {Number} top The distance form the top of the screen in pixels (optional)
*	@param {String} align How to align the notification (options: left, right, center) (optional)
*	@param {Boolean} sticky Should the notification close automatically after a brief delay, or stick on the screen until the user closes it? (options: true, false)
*	@param {String} m The message to display, including any desired HTML markup (alternatively, can pass in 'title' and 'msg' to let this module determine which HTML to use
*	@param {String} valign Where to position the notification vertically on the screen (options: top, bottom)
*	@param {Boolean} solo Should the notification being created be the only one on the screen, and any others should be closed? (options: true, false)
*
*	@example $.toast({title:'Something went wrong',msg:'Oops, there was an error.',align:'center',valign:'bottom',bottom:40,type:'error'});
*	@example $.toast({title:'Yay!',msg:'Great! It worked!',align:'right',type:'success'});
*/
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else {
        // Browser globals
        factory(jQuery);
    }
}
(function($) {
	var isIE = (function() {
		// First part detects IE 10 and under, the second IE 10+
		if (new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})").exec(navigator.userAgent) != null || document.body.style.msTouchAction !== undefined) { 
			return true;
		} else { 
			return false; 
		} 
	})();
	var th = null, cf = null, iv = null, ic = null, css = null, fps = 30, animation = false, toast = function(m,o){
		// fix option type
		o = $.extend({}, ((!o) ? o = m : o = o)); // If m is empty use m as o so the code below works
		typeof o.duration === 'number' || (o.duration = 6000);
		typeof o.sticky === 'boolean' || (o.sticky = false);
		typeof o.type === 'string' || (o.type = 'default');
		typeof o.title === 'string' || (o.title = '');
		typeof o.msg === 'string' || (o.msg = '');
		typeof o.solo === 'boolean' || (o.solo = false);
		// create host on first call
		if(!th){ 
			// get/fix config
			cf = toast.config;
			th = $('<ul></ul>').addClass('toast').appendTo(document.body).hide();
			typeof cf.width === 'number' || (cf.width = 500);
			typeof cf.top === 'number' || (cf.top = 5);
			typeof cf.align === 'string' || (cf.align = 'center');
			typeof cf.solo === 'boolean' || (cf.solo = false);
			if (o.width) cf.width = o.width;
			if (o.align) cf.align = o.align;
			if (o.top) cf.top = o.top;
			if (o.bottom) cf.bottom = o.bottom;
			if (o.sticky) cf.sticky = o.sticky;
			if (o.solo) cf.solo = o.solo;
			th.width(cf.width);
			iv = 1000 / fps; // interval in ms
			//ic = (cf.width / (o.duration / 1000)) / fps; // step value
			ic = (cf.width / (40000 / 1000)) / fps; // step value
			(cf.align === 'left' || cf.align === 'right') && th.css('margin','5px').css(cf.align, '0') || th.css({left: '50%', margin: '5px 0 0 -' + (cf.width / 2) + 'px'});
			if (o.valign == 'bottom') {
				th.css('bottom', cf.bottom);
			} else {
				th.css('top', cf.top);
			};
		}

		// Close any existing notifications if solo is set to true
		if (cf.solo && $('.toast-message').length > 0) {
			$.each( $('.toast-message'), function() {
				//$(this).parent().trigger('click');
				$(this).parent().remove();
			});
		}
		
		// create toast
		if (o.title !== '' || o.msg !== '') {
			m = '<div class="toast-icon ' + o.type + '"></div><div class="toast-message"><p class="title">' + o.title + '</p><p class="msg">' + o.msg + '</p></div>';
		}
		if (o.sticky == false) {
			css = 'width:' + (cf.width - 22) + 'px;';

			if (!isIE) {
				css = 'transition-duration: ' + iv + 'ms;';
				css += '-webkit-' + css + '-moz-' + css + '-o-' + css;
			};
					
			m = m + '<div id="toast-progress" class="toast-progress ' + o.type + '" style="' + css + '">&nbsp;</div>';
		}
		var ti = $('<li class="' + o.type + '"></li>').hide().html(m).appendTo(th), to = null;
		// clicking anywhere on the notifiction will close it
		ti.click(function(){
			clearInterval(to);
			ti.animate({ height: 0, opacity: 0}, 'fast', function(){
				ti.remove();
				th.children().length || th.removeClass('active').hide();
			});
		});
		!o.sticky
		// add type class
		o.type !== '' && ti.addClass(o.type);
		// show host if necessary
		!th.hasClass('active') && th.addClass('active').show();

		if (!o.sticky && o.duration > 0) {
			// Test if this browser supports CSS animations without using any external libraries
			var animationstring = 'animation',
			keyframeprefix = '',
			domPrefixes = 'Webkit Moz O Khtml'.split(' '),
			pfx  = '';
			elm = document.createElement('div');

			if( elm.style.animationName ) { animation = true; }

			if( animation === false ) {
				for( var i = 0; i < domPrefixes.length; i++ ) {
					if( elm.style[ domPrefixes[i] + 'AnimationName' ] !== undefined ) {
						pfx = domPrefixes[ i ];
						animationstring = pfx + 'Animation';
						keyframeprefix = '-' + pfx.toLowerCase() + '-';
						animation = true;
						break;
					}
				}
			}

			if (animation) {
				// Setup the animation properties so we can trigger it in a moment
				$('#toast-progress').css('width', cf.width - 22 + 'px');

				$('#toast-progress').css(keyframeprefix + 'transition', 'width ' + o.duration/1000 + 's linear');

				$('#toast-progress').off().on('webkitTransitionEnd oTransitionEnd otransitionend transitionend', function() {
					$('#toast-progress').off();
					ti.click();
				});
			} else {
				// Use jQuery for the animation
				$('#toast-progress').animate({ width: 0}, o.duration, function(){
					ti.click();
				});
			}
		}

		// show toast
		ti.fadeIn('normal');

		if (animation) {
			// Start animating the countdown bar
			$('#toast-progress').css('width', '0px');
		}
	};

	toast.config = { width: 500, top: 5, bottom: 5, align: 'center', solo: false};
	$.extend({ toast: toast });
}));