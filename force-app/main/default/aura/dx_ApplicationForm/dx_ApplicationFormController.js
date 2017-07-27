({
    doInit: function(component,event,helper){
        try{
            console.log('Get Application');
            component.set("v.showError",false);
            //helper.setVisibility(component,event);
            var action = component.get("c.getFieldVisibility");         // Set the routine to call in the controller
            action.setCallback(this, function(response){        // and when it returns, perform ....
                var rtnValue = response.getReturnValue();       // get the data and validate it, if null show an error
                if (rtnValue === null) {
                    component.set("v.errorMessage",response.getReturnValue());
                    component.set("v.showError",true);      
                }else{
                    component.set("v.visibility",rtnValue);      // but if it's good, set the applicant value to the result.
                }
                console.log('Top Visibility');
                console.log(rtnValue);
            });
            $A.enqueueAction(action);
            var recordId = component.get("v.recordId");
            var idArr = [];
            idArr.push(recordId);
            component.set("v.Ids",idArr);
            var visibility = component.get("v.visibility");
            // clear the error message display
            console.log('Second Visibility');
            console.log(visibility);
            
            action = component.get("c.getApplication");         // Set the routine to call in the controller
            action.setParams({"applicationId": recordId});
            action.setCallback(this, function(response){        // and when it returns, perform ....
                var rtnValue = response.getReturnValue();       // get the data and validate it, if null show an error
                if (rtnValue === null) {
                    component.set("v.errorMessage",response.getReturnValue());
                    component.set("v.showError",true);      
                }else{
                    component.set("v.application",rtnValue);      // but if it's good, set the applicant value to the result.
                    console.log(rtnValue);
                    var evt = $A.get("e.c:dx_PassApplication");
                    evt.setParams({"Pass_App":rtnValue,"Pass_Visibility":visibility});
                    evt.fire();
                }
            });
            $A.enqueueAction(action);                           // put this item on the queue to execute.
            
        }
        catch(e) {
            alert(e);
        }
    },
    save: function(component, event,helper){
        var spinner = component.find("spinner");
        $A.util.toggleClass(spinner, "slds-hide");
        
        try {
        	var child = component.find("checklist");
        	child.saveChecklist();
            component.set("v.showError",false);                 // clear the error message off of the screen
            var notAnswered = '--None--';
            var application = component.get("v.application");       // get the data from the component
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
                $A.util.toggleClass(spinner, "slds-hide");
                helper.showToast(component, event);
                //component.find("error").getElement().focus();
            }
            // If all good, then let's call the controller and try to update the record.
            else {
                if(application.abd_Premise_County__c == notAnswered)
                    application.abd_Premise_County__c = null;
                var action = component.get("c.upRecordApex");       // Set the routine to call in the controller
                action.setParams({"application": application});         // pass the data to the controller
                action.setCallback(this, function(response){
                    var rtnValue = response.getReturnValue();
                    if (rtnValue !== null) {                        // display any errors from the controller.
                        component.set("v.errorMessage",response.getReturnValue());
                        component.set("v.showError",true);
                        $A.util.toggleClass(spinner, "slds-hide");
                        helper.showToast(component, event);
                    }
                    
                });
                $A.enqueueAction(action);                            // put this item on the queue to execute.
            }
        }
        catch(e) {      //development catch of typos and other dumb mistakes.
            $A.util.toggleClass(spinner, "slds-hide");
            alert(e);
        }
        
    }
})