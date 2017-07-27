({
	 save : function(component, event, helper) {
      	var action = component.getEvent("SaveCompleted");
        action.setParams({"Component" : component, "Action": "Saved" });
	    action.fire();
	}
})