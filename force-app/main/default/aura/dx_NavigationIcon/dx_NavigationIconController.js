({
    navigate : function(component, event, helper) {
    	var action = component.getEvent("NextOnlyEvent");
        action.setParams({"Component" : component , "Action": "Direct", "Other": component.get("v.URL") });
        action.fire();    
    }
})