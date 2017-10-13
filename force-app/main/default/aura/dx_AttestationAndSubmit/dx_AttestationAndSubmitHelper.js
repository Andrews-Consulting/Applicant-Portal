({
    doAttest : function(component, event) {
        component.set("v.showError",false);                 // clear the error message off of the screen
        var app = component.get("v.app");       // get the data from the component
        var errmsg = '';

        if ($A.util.isEmpty(app.abd_Attestation_Name__c))
            errmsg = "Please enter your name to act as a signature.";

        //  The date is preloaded and locked down - 
        // if ($A.util.isEmpty(app.abd_Attestation_Date__c))
        //     app.abd_Attestation_Date__c = new Date();


        if (app.Id === null) errmsg = 'It does not appear that you are still logged in or logged in as a valid user.';

 
        // If there is an error, then let's display it and leave.
        if (errmsg.length !== 0) {
            component.set("v.errorMessage",errmsg);
            component.set("v.showError",true);
            var nextAction = component.getEvent("SaveCompleted");
            nextAction.setParams({"Component" : component, "Action": "Fail" });
            nextAction.fire();
        }
        else {
            var action = component.get("c.setAcknowledgmentFlag");       // Set the routine to call in the controller

            action.setParams({"application": app});         // pass the data to the controller
            action.setCallback(this, function(response){
                var action = component.getEvent("SaveCompleted");
                try {            
                    var state = response.getState();
                                                                    // if we are successful, then we are provided
                    if (state === 'SUCCESS')                       // the ID of the application.
                            action.setParams({"Component" : component, "Action": "Saved" });
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
    }
 //    goToNext : function (component, event) {
 //        $A.get("e.selfService:doLogout").setParams({"url": "/Licensing/secur/logout.jsp?retUrl=https%3A%2F%2Fabdstaging-iowaabd.cs33.force.com%2FApplicant%2FCommunitiesLanding"}).fire();

 //      $A.getEvt("markup: / / selfService:doLogout").setParams({url: a.get("m.url")}).fire();
 //        $A.get(markup: / /  salesforceIdentity:sessionTimeoutWarn)
 // Remove the spaces around the forward slashes if you need to use this.
	//     var urlEvent = $A.get("e.force:navigateToURL");
 //        urlEvent.setParams({"url": component.get("v.nextPageURL")  + "?recordId=" + component.get("v.recordId")});
	//     urlEvent.fire();
	// }
    
})