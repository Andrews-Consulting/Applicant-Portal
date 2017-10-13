({
    doInit: function(component, event, helper) {
        helper.getCookie(component);
        try {
            var action = component.get("c.getTutorials"); // apex controller routine
            action.setCallback(this, function(response) {
                var rtnValue = response.getReturnValue();
                console.log(response);
                if (rtnValue == null) {
                    component.set("v.errorMessage", 'No Files Found');
                    component.set("v.showError", true);
                } else {
                    component.set("v.documents", rtnValue); // return value
                    helper.showSlides(component);
                }
            });
            $A.enqueueAction(action); // queue the work.
        }

        // handle browser errors 
        catch (e) {
            alert(e);

        }

    },
    currentSlide: function(component, event, helper) {
    	component.set("v.slideIndex",event.target.attributes.title["value"]);
		helper.showSlides(component);
    },
    plusSlides: function(component, event, helper) {
    	var length = component.get("v.documents").length;
    	var index = component.get("v.slideIndex")+1;
    	if(index >= length)
    		index = 0;
    	component.set("v.slideIndex",index);
		helper.showSlides(component);
    },
    minusSlides: function(component, event, helper) {
    	var length = component.get("v.documents").length;
    	var index = component.get("v.slideIndex")-1;
    	if(index < 0)
    		index = length-1;
    	component.set("v.slideIndex",index);
		helper.showSlides(component);
    },
    setCookie: function(component, event, helper) {
    	console.log('Set Cookie');
    	console.log(component.find("skip").get("v.checked"));
    	var cookie = "skip="+component.find("skip").get("v.checked")+";";
	    console.log(cookie);
	    var d = new Date();
	    d.setTime(d.getTime() + (365*24*60*60*1000));//Currently setting cookie for 1 year
	    document.cookie = cookie+"expires="+d.toUTCString()+"; path=/";
	    //helper.gotoURL(component);
	}
})