({
	doInit : function(component, event, helper) {		
		if(component.get("v.recordId")){
			try {
	            console.log('do update ' +    component.getLocalId()  + ':' +  component.get("v.recordId"));
	            component.set("v.showError",false);                 // clear the error message off of the screen
	            var notAnswered = '--None--';
	            
	            component.getOwner().spinnerOn();
	            
	            // validate the data here!  Check to see if the fields are completed.
	            var errmsg = '';
	        	
	        	// If there is an error, then let's display it and leave.
	            if (errmsg.length !== 0) {
	                component.set("v.errorMessage",errmsg);
	                component.set("v.showError",true);
	            }
	            // If all good, then let's call the controller and try to update the record.
	            else {
	                var action = component.get("c.createRenewalApp");       // Set the routine to call in the controller
	                action.setParams({"licenseId": component.get("v.recordId")});         // pass the data to the controller
	                action.setCallback(this, function(response){
	                    var action = component.getEvent("NextOnlyEvent");
	                    try {            
	                        var state = response.getState();
	                        if (state === 'SUCCESS') {
	                        	component.set("v.recordId",response.getReturnValue());
	                            action.setParams({"Component" : component, "Action": "Next" });
	                        }
	                        else {      // error or incomplete comes here
	                            var errors = response.getError();
	                            if (errors.length > 0) {
	                                for (var erri = 0; erri < errors.length; erri++) {
	                                    component.set("v.errorMessage", component.get("v.errorMessage") + " : " + errors[erri].message);
	                                }
	                            }
	                            else {
	                                component.set("v.errorMessage", response.getReturnValue());
	                            }
	                            component.set("v.showError",true);
	                            action.setParams({"Component" : component, "Action": "Fail" });
	                        }
	                    } catch(e) {
	                        alert(e.stack);
	                        action.setParams({"Component" : component, "Action": "Fail" });
	                    }
	                    finally {
	                        // always fire this action.  parms are set.                
	                        action.fire();
	                    }                    
	                });
	                $A.enqueueAction(action);                            // put this item on the queue to execute.
	            }
	        }
	        catch(e) {      //development catch of typos and other dumb mistakes.
	
	            alert(e.stack + ': ' + e.name + ': ' + e.message+ ' : '+e.lineNumber);
	        }
        }
	}
})