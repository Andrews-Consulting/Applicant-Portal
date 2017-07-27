({
	doAppeal : function(component, event, helper) {
		try{
			console.log('Do Appeal');
	        console.log(component.get("v.recordId"));
	        var action = component.get("c.setAppeal");
	        action.setParams({"license":component.get("v.license")});
	        action.setCallback(this, function(a) {
	            try {
	                    var state = response.getState();
	                    if (state === 'SUCCESS') {
	                        var license = response.getReturnValue();
	                        component.set("v.license",license);
	                    }
	                    else {      // error or incomplete comes here
	                        var errors = response.getError();
	                        if (errors) {
	                            for (var erri = 0; erri < errors.length; erri++) {
	                                component.set("v.errorMessage", component.get("v.errorMessage") + " : " + errors[erri].message );
	                            }
	                            component.set("v.showError",true);
	                        }
	                    }
	                } catch(e) {
	                    alert(e.stack);
	                }
            });
            $A.enqueueAction(action);                                           // queue the work.
	    }
        // handle browser errors 
        catch(e) {
            alert(e.stack);
        }
	},
	statusChange : function(component, event,helper) {
		var license = component.get("v.license");
		license.MUSW__Status__c = event.getSource().get("v.value");
		component.set("v.license",license);
	}
})