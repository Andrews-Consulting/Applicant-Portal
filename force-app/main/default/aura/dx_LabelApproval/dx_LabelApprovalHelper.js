({
	// Call the controller to update the record with the values collected on the screen.
    // We could do validation here on the client side to make this a little faster.

    doUpdate: function(component){
        try {
            console.log('do update ' +    component.getLocalId()  + ':' +  component.get("v.recordId"));
            component.set("v.showError",false);                 // clear the error message off of the screen
            var notAnswered = '--None--';
            var application = JSON.parse(JSON.stringify(component.get("v.app")));       // get the data from the component
            // validate the data here!  Check to see if the fields are completed.
            var errmsg = '';
        	if (application.abd_Product_name__c == null || application.abd_Product_name__c.length == 0) errmsg += 'Product Name';
    		if (application.abd_ABV_Alcohol_BY_Volume__c == null || application.abd_ABV_Alcohol_BY_Volume__c<= 0) errmsg += 'Alcohol BY Volume';
    		if (application.TTB_ID__c == null || application.TTB_ID__c.length == 0) errmsg += 'TTB ID #';
    		
			
			if (errmsg.length !== 0) { 
                errmsg = 'The following fields are required and are missing data: ' + errmsg;
                if (errmsg.endsWith(', ')) errmsg = errmsg.substring(0,errmsg.length-2) + '. ';
            }
            
            // If there is an error, then let's display it and leave.
            if (errmsg.length !== 0) {
                component.set("v.errorMessage",errmsg);
                component.set("v.showError",true);
            }
            // If all good, then let's call the controller and try to update the record.
            else {
                var action = component.get("c.createLabelApp");       // Set the routine to call in the controller
                action.setParams({"application": application,"licenseId": component.get("v.recordId")});         // pass the data to the controller
                action.setCallback(this, function(response){
                    var action = component.getEvent("SaveCompleted");
                    try {            
                        var state = response.getState();
                            if (state === 'SUCCESS' && response.getReturnValue().substr(0,8) === "SUCCESS:") {
                            var recid = response.getReturnValue().substr(9);
                            if (!$A.util.isEmpty(recid)) component.set("v.recordId",recid);
                            action.setParams({"Component" : component, "Action": "save" });
                        }                        else {      // error or incomplete comes here
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
})