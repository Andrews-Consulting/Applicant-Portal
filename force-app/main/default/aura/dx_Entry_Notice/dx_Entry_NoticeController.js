({

    doInit: function (component, event, helper) {
    	var action = component.get("c.getStartUrl");
    	action.setCallback(this, function(response){
    		var state = response.getState();
        	if (state === "SUCCESS") {
        		component.set("v.NextPage", response.getReturnValue());
        		console.log(response.getReturnValue());
        	}
    	});
    	$A.enqueueAction(action);
    },
    CloseWindow: function(component, event, helper) {

        //Find the text value of the component with aura:id set to "address"
        var address = component.find("AgreeButton").get("v.value");
        var urlEvent = $A.get("e.force:navigateToURL");
        address = address.replace("/s/s","/s");
        urlEvent.setParams({
            "url": address,
            "isredirect": false
        });
        urlEvent.fire();
    }
    
})