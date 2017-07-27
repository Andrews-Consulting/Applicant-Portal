({


	// We pass it in a license and it creates an application for us!
getApplication: function(component, event){
        try{
            console.log('Get Application');
            component.set("v.showError",false);                 // clear the error message display
        	var action = component.get("c.createApplicationfromLicense");         // Set the routine to call in the controller
            action.setParams({"licenseId": component.get("v.recordId")});            
            action.setCallback(this, function(response){        // and when it returns, perform ....
                try {            
                    var state = response.getState();
                    if (state === 'SUCCESS') {
                        var noshow = true;                      // flag for if nothing is shown.
                        component.set("v.app",response.getReturnValue().app);       // get the data 
                        component.set("v.lic",response.getReturnValue().license);
                        var lTypes = response.getReturnValue().lTypes;

                        for (var x in lTypes) {
                        	if (lTypes[x] == "BC")
                                $A.util.removeClass(component.find("BCQuestion"), "slds-hide");
                        	else if (lTypes[x] == "LE")
                        		$A.util.removeClass(component.find("LEQuestion"), "slds-hide");
                            else if (lTypes[x] == "P-OS")
                                $A.util.removeClass(component.find("OSQuestion"), "slds-hide");
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
    		$A.enqueueAction(action);                           // put this item on the queue to execute.
        }
        catch(e) {
            alert(e);
        }
     },


   // Call the controller to update the record with the values collected on the screen.
    // We could do validation here on the client side to make this a little faster.

    CreateApplication: function(component, event){
        try {
            component.set("v.showError",false);                 // clear the error message off of the screen
            var notAnswered = '--None--';
            var application = JSON.parse(JSON.stringify(component.get("v.app")));       // get the data from the component
            // validate the data here!  Check to see if the fields are completed.
            var errmsg = '';

            if ($A.util.isEmpty(component.get("v.lic"))) {
                errmsg = 'license component data is missing';
            }
            else {
                var lic = JSON.parse(JSON.stringify(component.get("v.lic")));
                var datecheck;

// validate start date 
                if ($A.util.isEmpty(application.abd_Effective_Date__c) || 
                    (application.abd_Effective_Date__c.length < 6) || 
                    (new Date(application.abd_Effective_Date__c) == 'Invalid Date') || 
                    (new Date(application.abd_Effective_Date__c).getTime() < 0) || 
                    (new Date(application.abd_Effective_Date__c).getTime() > new Date('2020-01-01').getTime()))
                        errmsg = 'A valid Start date for the application must be specified. ';
                else {
                    application.abd_Effective_Date__c = new Date(application.abd_Effective_Date__c).toJSON().substr(0,10);
// validate end dates if necessary
                    if (application.abd_Temporary_or_Permanent__c == 'Temporary') {
                        if ($A.util.isEmpty(application.abd_Effective_End_Date__c) || 
                            (application.abd_Effective_End_Date__c.length < 6) || 
                            (new Date(application.abd_Effective_End_Date__c) == 'Invalid Date') || 
                            (new Date(application.abd_Effective_End_Date__c).getTime() < 0) || 
                            (new Date(application.abd_Effective_End_Date__c).getTime() > new Date('2020-01-01').getTime()))
                                errmsg = 'A valid End date for the application must be specified. ';
                        else
                            application.abd_Effective_End_Date__c = new Date(application.abd_Effective_End_Date__c).toJSON().substr(0,10);
                    }
                    else 
                        application.abd_Effective_End_Date__c = null;
                }

                if (errmsg === '') {
                    if (application.abd_Effective_Date__c < lic.abd_Effective_Date__c) {
                        datecheck = new Date(new Date(lic.abd_Effective_Date__c).getTime() + new Date().getTimezoneOffset()*60*1000 );
                        errmsg = ('The Start Date of the application cannot be before the current/primary license start date of ' + datecheck.toLocaleDateString());
                    }
                }
                
                if (errmsg === '' && application.abd_Temporary_or_Permanent__c == 'Temporary') {
                    if (application.abd_Effective_End_Date__c > lic.abd_Effective_End_Date__c) {
                        datecheck = new Date(new Date(lic.abd_Effective_End_Date__c).getTime() + new Date().getTimezoneOffset()*60*1000 );
                        errmsg = ('The End Date of the application cannot be after the current/primary license end date of ' + datecheck.toLocaleDateString());
                    }
                    else {

                        if (application.abd_Effective_Date__c >= application.abd_Effective_End_Date__c) {
                            errmsg = 'The End Date must be later than the Start Date';
                        }
                    }
                }
                // don't try to update with bad values.

    			// if (application.abd_DRAM_shop__c === null || application.abd_DRAM_shop__c == notAnswered)  errmsg += 'Dram shop ';
                // If any fields were blank, fix up the message to be readable.
                
                if (application.Id === null) errmsg = 'It does not appear that you are still logged in or logged in as a valid user.';

                // If there is an error, then let's display it and leave.
                if (errmsg.length !== 0) {
                    component.set("v.errorMessage",errmsg);
                    component.set("v.showError",true);
                    console.log(errmsg);
                    var nextAction = component.getEvent("SaveCompleted");
                    nextAction.setParams({"Component" : component, "Action": "Fail" });
                    nextAction.fire();
                }
                // If all good, then let's call the controller and try to update the record.
                else {
                    // copy the information into all of the date fields.
                    application.abd_Premise_From__c = application.abd_Effective_Date__c;
                    application.abd_Premise_To__c   = application.abd_Effective_End_Date__c;

                    var action = component.get("c.CreateApplication");       // Set the routine to call in the controller
                    application.sobjectType = "MUSW__Application2__c";
                    action.setParams({"application": application });         // pass the data to the controller
                    action.setCallback(this, function(response){
                        var action = component.getEvent("SaveCompleted");
                        try {            
                            var state = response.getState();
                                                                            // if we are successful, then we are provided
                            if (state === 'SUCCESS') {                      // the ID of the application.
                                var applId = response.getReturnValue();     // So we switch to the application and continue on.
                                if (! $A.util.isUndefined(applId)) {
                                    component.set("v.recordId", applId);
                                    action.setParams({"Component" : component, "Action": "Saved" });
                                }
                                else {
                                    component.set("v.showError",true); 
                                    component.set("v.errorMessage", "Did not receive a valid application ID from Save function");
                                    action.setParams({"Component" : component, "Action": "Fail" });
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
        }
        catch(e) {      //development catch of typos and other dumb mistakes.
            alert(e.stack);
        }
    }
})