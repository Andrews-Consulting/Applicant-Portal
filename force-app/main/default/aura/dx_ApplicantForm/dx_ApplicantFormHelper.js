({
    // Code that is instantiated once

    // Call the controller to "Read the contact (applicant) information" and set the applicant data for this component instance. 

	getContact: function(component){
        try{
            component.set("v.showError",false);                 // clear the error message display
        	var action = component.get("c.getContact");         // Set the routine to call in the controller
            action.setCallback(this, function(response){        // and when it returns, perform ....
                var rtnValue = response.getReturnValue();       // get the data and validate it, if null show an error
                if (rtnValue === null) {
                    component.set("v.errorMessage",response.getReturnValue());
                    component.set("v.showError",true);      
                }else{
                    component.set("v.applicant",rtnValue);      // but if it's good, set the applicant value to the result.
                    var arr = [];
                    arr.push(rtnValue);
                    component.set("v.records",arr);
                }
            });
    		$A.enqueueAction(action);                           // put this item on the queue to execute.
        }
        catch(e) {
            alert(e);
        }
     },

    // Call the controller to get the Citizenship values for the drop down box.  (not the result, but all of the choices)
    getCitizenType: function(component){
        try {
        	var action = component.get("c.getCitizenType");    // Set the routine to call in the controller
            action.setCallback(this, function(response){
                var rtnValue = response.getReturnValue();   
                if (rtnValue === null) {                        // validate that the controller succeeded in getting values.
                    component.set("v.errorMessage",response.getReturnValue());
                    component.set("v.showError",true);
                }else{
                    component.set("v.citizenType",rtnValue);    // list of strings returned from controller
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
            var notAnswered = '--Not Answered--';
            var applicant = component.get("v.applicant");       // get the data from the component

            // validate the data here!  Check to see if the fields are completed.
            var errmsg = '';
            if (applicant.Phone == null || applicant.Phone.length == 0) errmsg += 'Phone number, ';
            if (applicant.MobilePhone == null || applicant.MobilePhone.length == 0)  errmsg += 'Mobile Phone number, ';
            if (applicant.MailingStreet == null || applicant.MailingStreet.length == 0) errmsg += 'Street Address, ';
            if (applicant.MailingCity == null || applicant.MailingCity.length == 0)  errmsg += 'City, ';
            if (applicant.MailingState == null || applicant.MailingState.length == 0)  errmsg += 'State, ';
            if (applicant.MailingPostalCode == null || applicant.MailingPostalCode.length == 0)  errmsg += 'Postal (ZIP) Code, ';
            if (applicant.abd_Mailing_County__c == null || applicant.abd_Mailing_County__c.length == 0)  errmsg += 'County, ';
            if (applicant.abd_SSN__c == null || applicant.abd_SSN__c.length == 0) errmsg += 'Social Security Number, ';

            // If any fields were blank, fix up the message to be readable.
            if (errmsg.length != 0) { 
                errmsg = 'The following fields are required and are missing data: ' + errmsg;
                if (errmsg.endsWith(', ')) errmsg = errmsg.substring(0,errmsg.length-2) + '. ';
            }
            if (applicant.Id == null) errmsg = 'It does not appear that you are still logged in or logged in as a valid user.';

            // If there is an error, then let's display it and leave.
            if (errmsg.length != 0) {
                component.set("v.errorMessage",errmsg);
                component.set("v.showError",true);
                this.spinnerOff(component, event);
            }
            // If all good, then let's call the controller and try to update the record.
            else {
                var action = component.get("c.upRecordApex");       // Set the routine to call in the controller
                action.setParams({"applicant": applicant});         // pass the data to the controller
                action.setCallback(this, function(response){
                    var rtnValue = response.getReturnValue();
                    if (rtnValue !== null) {                        // display any errors from the controller.
                        component.set("v.errorMessage",response.getReturnValue());
                        component.set("v.showError",true);
                        this.spinnerOff(component, event);
                    }else{
                    	if(component.get("v.exit")){
                    		this.handleCancel(component);
                    	}else{
                    		this.navigateToNext(component);
                    	}
                    }
                    
                });
        		$A.enqueueAction(action);                            // put this item on the queue to execute.
            }
        }
        catch(e) {      //development catch of typos and other dumb mistakes.
            alert(e);
            this.spinnerOff(component, event);
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
    },
    
    navigateToNext : function(component,event) {
    	var evt = $A.get("e.force:navigateToURL");
        var urlValue = component.get("v.NextPageURL");
        evt.setParams({"url": urlValue});
    	evt.fire();    
	},
	handleCancel : function(component,event) {
    	var evt = $A.get("e.force:navigateToURL");
        var urlValue = component.get("v.prevPageURL");
        evt.setParams({"url": urlValue});
    	evt.fire();    
	}
})