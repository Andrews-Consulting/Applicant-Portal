({
    // Code that is instantiated once

    // Call the controller to "Read the contact (applicant) information" and set the applicant data for this component instance. 

	getApplication: function(component){
        try{
            console.log('Get Application');
            component.set("v.showError",false);
            var application = component.get("v.record");
            // clear the error message display
        	var action = component.get("c.getApplication");         // Set the routine to call in the controller
            action.setParams({"applicationId": application.Id});
            action.setCallback(this, function(response){        // and when it returns, perform ....
                var rtnValue = response.getReturnValue();       // get the data and validate it, if null show an error
                if (rtnValue === null) {
                    component.set("v.errorMessage",response.getReturnValue());
                    component.set("v.showError",true);      
                }else{
                    component.set("v.record",rtnValue);      // but if it's good, set the applicant value to the result.
                }
            });
    		$A.enqueueAction(action);                           // put this item on the queue to execute.
        }
        catch(e) {
            alert(e);
        }
     },

    // Call the controller to get the Citizenship values for the drop down box.  (not the result, but all of the choices)
    getPicklistValues: function(component){
        try {
        	console.log('Get Picklist');
            var action = component.get("c.getPicklistValues");    // Set the routine to call in the controller
            action.setCallback(this, function(response){
                var rtnValue = response.getReturnValue();   
                if (rtnValue === null) {                        // validate that the controller succeeded in getting values.
                    component.set("v.errorMessage",response.getReturnValue());
                    component.set("v.showError",true);
                }else{
                    component.set("v.counties",rtnValue[0]);    // list of strings returned from controller
                    component.set("v.states",rtnValue[1]);
                    component.set("v.locationTypes",rtnValue[2]);
                }
            });
    		$A.enqueueAction(action);
        }
        catch(e) {
            alert(e);
        }
    },
	
    setPicklistValues: function(component){
        var application = component.get("v.application");
        if(application.abd_Temporary_or_Permanent__c!==null){
            component.find("lItems").set("v.value",application.abd_Temporary_or_Permanent__c);
        }
        if(application.abd_Premise_State__c!==null){
            component.find("sItems").set("v.value",application.abd_Premise_State__c);
        }
        if(application.abd_Premise_County__c!==null){
            component.find("cItems").set("v.value",application.abd_Premise_County__c);
        }
    },
    // Call the controller to update the record with the values collected on the screen.
    // We could do validation here on the client side to make this a little faster.

    doUpdate: function(component){
        console.log('Static Save');
        var dynamicC = component.find("dynamicC");
        var app2 = dynamicC.get("v.detailRecord");
        console.log(app2);
        try {
            component.set("v.showError",false);                 // clear the error message off of the screen
            var notAnswered = '--None--';
            var application = component.get("v.record");       // get the data from the component
			console.log(application);
            // validate the data here!  Check to see if the fields are completed.
            var errmsg = '';
            if (application.MUSW__Description__c == null || application.MUSW__Description__c.length == 0) errmsg += 'Description, ';
            if (application.abd_Premise_Address__c == null || application.abd_Premise_Address__c.length == 0)  errmsg += 'Premises Address, ';
            if (application.abd_Premise_City__c == null || application.abd_Premise_City__c.length == 0) errmsg += 'Premises City, ';
            if (application.abd_Premise_State__c == null || application.abd_Premise_State__c == notAnswered)  errmsg += 'Premises State, ';
            if (application.abd_Premise_Zip_Code__c == null || application.abd_Premise_Zip_Code__c.length == 0)  errmsg += 'Premises Postal (ZIP) Code, ';
            if (application.abd_Premise_State__c=='IA' && (application.abd_Premise_County__c == null || application.abd_Premise_County__c == notAnswered))  errmsg += 'Premises County, ';
            if (application.abd_Temporary_or_Permanent__c == null || application.abd_Temporary_or_Permanent__c == notAnswered) errmsg += 'Temporary or Permanent Address , ';
            // If any fields were blank, fix up the message to be readable.
            if (errmsg.length != 0) { 
                errmsg = 'The following fields are required and are missing data: ' + errmsg;
                if (errmsg.endsWith(', ')) errmsg = errmsg.substring(0,errmsg.length-2) + '. ';
            }
            if (application.Id == null) errmsg = 'It does not appear that you are still logged in or logged in as a valid user.';

            // If there is an error, then let's display it and leave.
            if (errmsg.length != 0) {
                component.set("v.errorMessage",errmsg);
                component.set("v.showError",true);
            }
            // If all good, then let's call the controller and try to update the record.
            else {
                var action = component.get("c.upRecordApex");       // Set the routine to call in the controller
                action.setParams({"application": application,"app2":app2});         // pass the data to the controller
                action.setCallback(this, function(response){
                    var rtnValue = response.getReturnValue();
                    if (rtnValue !== null) {                        // display any errors from the controller.
                        component.set("v.errorMessage",response.getReturnValue());
                        component.set("v.showError",true);
                    }
                    //this.spinnerOff(component, event);
                });
        		$A.enqueueAction(action);                            // put this item on the queue to execute.
            }
        }
        catch(e) {      //development catch of typos and other dumb mistakes.
            alert(e);
        }
    }, 

    // internal function to display/hide the spinner so that the user know's we are working.
       // turn the spinner off (hide it by adding the hide class)
    spinnerOff: function (cmp, event) {
        var spinner = cmp.find("spinner");
        $A.util.addClass(spinner, "slds-hide");
    }, 
    // turn the spinner on (make it visible  by removing the hide class)
    spinnerOn: function (cmp, event) {
        var spinner = cmp.find("spinner");
        $A.util.removeClass(spinner, "slds-hide");
    }
})