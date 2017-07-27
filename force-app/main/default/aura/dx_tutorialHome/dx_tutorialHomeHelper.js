({
	showSlides: function(component) {
        console.log('ShowSlide');
        var index = component.get("v.slideIndex");
        var slide = component.find("mySlides");
        console.log(typeof slide !== 'undefined');
        console.log(slide);
        var slides = [];
        if(typeof slide !== 'undefined'){
	        if(slide.length){
	        	slides = slide;
	        }else{
	        	slides.push(slide);
	        }
	        console.log(slides);
	    }
        var dot = component.find("dot");
        if(typeof dot !== 'undefined'){
	        var dots = [];
	        if(dot.length){
	        	dots = dot;
	        }else{
	        	dots.push(dot);
	        }
        }
        for (var i = 0; i < slides.length; i++) {
            $A.util.addClass(slides[i], 'mySlides');
            console.log(slides[i]);
        }
        for (var i = 0; i < dots.length; i++) {
            $A.util.removeClass(dots[i], 'active');
        }
        $A.util.removeClass(slides[index], 'mySlides');
        $A.util.addClass(dots[index], 'active');
    },
    getCookie: function(component, event, helper) {
    	console.log('Get Cookie');
    	var name = "skip=";
	    var decodedCookie = decodeURIComponent(document.cookie);
	    var ca = decodedCookie.split(';');
	    for(var i = 0; i <ca.length; i++) {
	        var c = ca[i];
	        while (c.charAt(0) == ' ') {
	            c = c.substring(1);
	        }
	        if (c.indexOf(name) == 0) {
	            if(c.substring(name.length, c.length)!=true)
	            	this.gotoURL(component);
	        }
	    }
	    
    },
    gotoURL : function (component, event, helper) {
    	console.log('Go to Url');
	    var urlEvent = $A.get("e.force:navigateToURL");
	    urlEvent.setParams({
	      "url": "/dx-login"
	    });
	    urlEvent.fire();
	}
})