({
	getAgentList: function(component,event){
    	try {
	    	console.log('Get Agents');
	        var action = component.get("c.getAgentList");    // Set the routine to call in the controller
	        var Id = component.get("v.recordId");
	        action.setParams({"id": Id});
	        action.setCallback(this, function(response){
                try {            
                    var state = response.getState();
                    if (state === 'SUCCESS') {
                        if (!$A.util.isEmpty(response.getReturnValue())) {
                            // The response could be a single row with no data or one or more with data.
                            var agentcheck = response.getReturnValue();
                            var agentexists = false;
                            var inState = false;
                            if ($A.util.isArray(agentcheck)) {
                                agentexists = agentcheck[0].agentExists;
                                inState = agentcheck[0].inState;
                            }
                            else  {
                                agentexists = agentcheck.agentExists;
                                inState = agentcheck.inState;
                            }

                            // First check is if in state, if so, then we don't need an authorized agent, so leave.
                            if (inState) {
                                var action = component.getEvent("EmptyComponent");
                                action.fire();
                            }
                            else if (agentexists)   // not in state, so is there an existing list?
                                component.set("v.agentlist",response.getReturnValue());
                        }
                    }
                    else {      // error or incomplete comes here
                        var errors = response.getError();
                        if (errors) {
                            // get all error messages to display
                            for (var erri = 0; erri < errors.length; erri++) {
                                component.set("v.errorMessage", component.get("v.errorMessage") + " : " + errors[erri].message);
                            }
                            component.set("v.showError",true);      
                        }
                    }
                } catch(e) {
                    alert(e.stack);
                }
	        });
    		$A.enqueueAction(action);
        }
        catch(e) {
            alert(e);
        }
    },
    // Call the controller to update the record with the values collected on the screen.
    // We could do validation here on the client side to make this a little faster.

    doUpdate: function(component){
        try {
            component.set("v.showError",false);                 // clear the error message off of the screen
            var notAnswered = '--None--';

            // If this isn't an application, then skip the Save for Now and tell everyone we're okay!
            if (!component.get("v.RecordIdIsApplication")) {
                var action = component.getEvent("SaveCompleted");
                action.setParams({"Component" : component, "Action": "Saved" });
                action.fire();
                return;
            }

            
            var agentString = JSON.stringify(component.get("v.agentlist"));       // get the data from the component
            // validate the data here!  Check to see if the fields are completed.
            var errmsg = '';
            
            
            // If there is an error, then let's display it and leave.
            if (errmsg.length !== 0) {
                component.set("v.errorMessage",errmsg);
                component.set("v.showError",true);
                var nextAction = component.getEvent("SaveCompleted");
                nextAction.setParams({"Component" : component, "Action": "Fail" });
                nextAction.fire();

            }
            // If all good, then let's call the controller and try to update the record.
            else {
            	console.log('Update Record');
                var action = component.get("c.upRecordApex");       // Set the routine to call in the controller
                action.setParams({"agentString": agentString});         // pass the data to the controller
                action.setCallback(this, function(response){
                	var action = component.getEvent("SaveCompleted");
                    try {            
                        var state = response.getState();
                        if (state === 'SUCCESS'  && response.getReturnValue() ==='Update Successful') {
                            action.setParams({"Component" : component, "Action": "Saved" });
                        }
                        else {      // error or incomplete comes here
                            var errors = response.getError();
                            if (errors) {
                                // get all error messages to display
                                for (var erri = 0; erri < errors.length; erri++) {
                                    component.set("v.errorMessage", component.get("v.errorMessage") + " : " + errors[erri].message);
                                }
                                component.set("v.showError",true);      
                            }
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
        } catch (e) { //development catch of typos and other dumb mistakes.
            alert(e.name + ': ' + e.message + ' : ' + e.lineNumber);
        }
    }
})