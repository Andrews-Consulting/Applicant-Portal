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
                        component.set("v.app",response.getReturnValue());       // get the data 
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


// Call the server to get the list of Dram shops.

     getDram: function(component, event){
        try{
            component.set("v.showError",false);                 // clear the error message display
        	var action = component.get("c.getDram");         // Set the routine to call in the controller
        	action.setCallback(this, function(response){        // and when it returns, perform ....
                try {            
                    var state = response.getState();
                    if (state === 'SUCCESS') {
                        var list = response.getReturnValue();   
                        var opts = [];
                        for(var i=0;i<list.length;i++){
                            opts.push({label:list[i].Name, value:list[i].Id, selected:(component.get("v.app.abd_DRAM_shop__c")==list[i].Id)});
                        }
                        component.find("dramins").set("v.options",opts);
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
            console.log(application);
            // validate the data here!  Check to see if the fields are completed.
            var errmsg = '';


			if (application.abd_DRAM_shop__c === null || application.abd_DRAM_shop__c == notAnswered)  errmsg += 'Dram shop ';
            // If any fields were blank, fix up the message to be readable.
            if (errmsg.length !== 0) { 
                errmsg = 'The following fields are required and are missing data: ' + errmsg;
                if (errmsg.endsWith(', ')) errmsg = errmsg.substring(0,errmsg.length-2) + '. ';
            }
            if (application.Id === null) errmsg = 'It does not appear that you are still logged in or logged in as a valid user.';

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
        catch(e) {      //development catch of typos and other dumb mistakes.
            alert(e.stack);
        }
    }
})