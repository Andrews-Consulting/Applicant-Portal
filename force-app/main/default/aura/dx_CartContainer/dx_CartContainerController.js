({
	 doInit : function(component) {
        var vfOrigin = "https://" + component.get("v.vfHost");
        window.addEventListener("message", function(event) {
            if (event.origin !== vfOrigin) {
                // Not the expected origin: Reject the message!
                console.log(event.origin);
                console.log(vfOrigin);
                return;
            }
            // Handle the message
            console.log(event.data);
            var nextAction = component.getEvent("EmptyComponent");
            nextAction.fire();
        }, false);
    },
    save : function(component, event, helper) {
      	var action = component.getEvent("SaveCompleted");
        action.setParams({"Component" : component, "Action": "Saved" });
	    action.fire();
	}
})