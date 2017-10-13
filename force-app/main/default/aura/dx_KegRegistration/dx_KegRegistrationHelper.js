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
        	if (application.abd_Number_of_Booklets__c == null || application.abd_Number_of_Booklets__c.length == 0 || application.abd_Number_of_Booklets__c.length <= 0) errmsg += 'Number of Booklets';
    		
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
            console.log(application);
                var action = component.get("c.saveKegApp");       // Set the routine to call in the controller
                application.sobjectType = "MUSW__Application2__c";
                action.setParams({"application": application});         // pass the data to the controller
                action.setCallback(this, function(response){
                    var action = component.getEvent("SaveCompleted");
                    try {            
                        var state = response.getState();
                        var rtValue = (response.getReturnValue()!==null)?response.getReturnValue().toString():null;
                        if (state === 'SUCCESS' && rtValue!==null && rtValue.substr(0,8) === 'SUCCESS:') {

                            // for later on, let's save application ID away for now.
                            component.set("v.recordId", rtValue.substr(9));
                            action.setParams({"Component" : component, "Action": "Saved", "AppId": rtValue.substr(9) });
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
    },
    getApplication: function(component){
    	try {
    		console.log('Get Application');
            var action = component.get("c.createKegApp");       // Set the routine to call in the controller
            action.setParams({"licenseId": component.get("v.recordId")});         // pass the data to the controller
            action.setCallback(this, function(response){
                try {            
                    var state = response.getState();
                    if (state === 'SUCCESS') {
                        var app = response.getReturnValue();
                        console.log(app);
                        component.set("v.app",app);       // get the data 
                        component.set("v.AppInfo",{"selectedLicenseTypes":'', "app": app});
                        component.set("v.isInitComplete",true);
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
            $A.enqueueAction(action);                            // put this item on the queue to execute.
        }
        catch(e) {      //development catch of typos and other dumb mistakes.

            alert(e.stack + ': ' + e.name + ': ' + e.message+ ' : '+e.lineNumber);
        }
    }
})