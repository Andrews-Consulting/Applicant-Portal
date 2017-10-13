({

       // Define the picklist button
    getPicklistButton: function(component){
        var opts = [
              { class: "optionClass", label: "Add New Owner(s)", value: "0", selected: "true" },
               { class: "optionClass", label: "Add 1 New Owner", value: "1" },
               { class: "optionClass", label: "Add 2 New Owner", value: "2" },
               { class: "optionClass", label: "Add 3 New Owner", value: "3" },
               { class: "optionClass", label: "Add 4 New Owner", value: "4" },
               { class: "optionClass", label: "Add 5 New Owner", value: "5" },
               { class: "optionClass", label: "Add 6 New Owner", value: "6" },
               { class: "optionClass", label: "Add 7 New Owner", value: "7" },
               { class: "optionClass", label: "Add 8 New Owner", value: "8" },
               { class: "optionClass", label: "Add 9 New Owner", value: "9" }];
       component.find("numberAdd").set("v.options",opts);
               
    },
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
                        var app = response.getReturnValue();
                        component.set("v.app",app);       // get the data 
                        component.set("v.recordId",app.Id);
                        this.getOwnerList(component, event);
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

     getOwnerList: function(component, event) {
        try {
            console.log('Get Owner');
            var action = component.get("c.getOwnerList"); // Set the routine to call in the controller
            var Id = component.get("v.recordId");
            console.log(Id);
            action.setParams({"id": Id});
            action.setCallback(this, function(response) {
                try {            
                    var state = response.getState();
                    if (state === 'SUCCESS') {
                          var list = response.getReturnValue();
                        if (response.getReturnValue().length === 0) {
                            if (component.get("v.RecordIdIsApplication")) {
                                component.set("v.errorMessage", "Please enter an Owner");
                                component.set("v.showError",true);      
                            }
                        }
                        else {
                            for (var i = 0 ; i < list.length; i++) {
                                var o = list[i];
                                o.row = i;
                                if (!$A.util.isEmpty(o.owner)) {
                                    if (!$A.util.isEmpty(o.owner.abd_LicenseeBusinessType__c))  
                                        if (o.owner.abd_LicenseeBusinessType__c == 'Sole Proprietorship' || o.owner.abd_LicenseeBusinessType__c == 'Municipality' )
                                            component.set("v.NoAllocationsAllowed",true);
                                }
                            }
                        }
                        component.set("v.ownerlist",list);
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
            $A.enqueueAction(action);
        } catch (e) {
            alert(e);
        }
    },
   // Call the controller to update the record with the values collected on the screen.
    // We could do validation here on the client side to make this a little faster.

    UpdateApplication: function(component, event){
        try {
             
            component.set("v.showError",false);                 // clear the error message off of the screen
            var notAnswered = '--None--';
            var app = JSON.parse(JSON.stringify(component.get("v.app")));       // get the data from the component
            // validate the data here!  Check to see if the fields are completed.
            var errmsg = '';
            
            var ownerlist = component.get("v.ownerlist");
            var sum = 0;
            var count = 0;
            for(var o in ownerlist){
            if(!ownerlist[o].needDelete){
                   var owner = ownerlist[o].owner;
                    count += 1;
                   sum+=Number((isNaN(owner.of_Ownership__c))?0:owner.of_Ownership__c);
                   }
            }
            console.log(sum);
            if(sum>100)
            errmsg+=((errmsg!=='')?'<br/>':'')+'The Percent of Ownership cannot be greater than 100%';

            if (component.get("v.NoAllocationsAllowed") && count > 1) {
                errmsg = 'There can only be one owner for a Sole Proprietorship or only one responsible person listed for a Municipality';
            }

            var ownerString = JSON.stringify(component.get("v.ownerlist"));
            var licStart = component.get("v.app.abd_Effective_Date_of_Current_License__c");
            var licEnd = component.get("v.app.abd_Effective_End_Date_of_Current_Lic__c");
            var dtLicStart = new Date(new Date(licStart).getTime() + new Date(licStart).getTimezoneOffset()*60*1000);
            var dtLicEnd = new Date(new Date(licEnd).getTime() + new Date(licEnd).getTimezoneOffset()*60*1000);


            // Make sure that the start date is filled in and the end date if temporary.
            if ($A.util.isEmpty(app.abd_Effective_Date__c)) 
                errmsg = "Please enter a start date";
            else if ($A.localizationService.isBefore(app.abd_Effective_Date__c, licStart))
                errmsg = "The Start Date of the application cannot be before the license start date of " + dtLicStart.toLocaleDateString();
            else if ($A.localizationService.isAfter(app.abd_Effective_Date__c, licEnd))
                errmsg = "The Start Date of the application cannot be after the license end date of " + dtLicEnd.toLocaleDateString();
            
       
            if (app.Id === null) errmsg = 'It does not appear that you are still logged in or logged in as a valid user.';

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
                // copy the information into all of the date fields.

                var action = component.get("c.UpdateApplication");       // Set the routine to call in the controller
                app.sobjectType = "MUSW__Application2__c";
                action.setParams({"application": app ,"ownerString": ownerString});         // pass the data to the controller
                action.setCallback(this, function(response){
                    var action = component.getEvent("SaveCompleted");
                    try {            
                        var state = response.getState();
                                                                        // if we are successful, then we are provided
                        if (state === 'SUCCESS') {                      // the ID of the application.
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
        }
        catch(e) {      //development catch of typos and other dumb mistakes.
            alert(e.stack);
        }
    },
    getNewOwners: function(component, event){
       try {
            console.log('Get New Owners');
            var action = component.get("c.getNewOwners"); // Set the routine to call in the controller
            var Id = component.get("v.recordId");
            var num = component.get("v.numberAdd");
            action.setParams({"appId": Id,"amount":num});
            action.setCallback(this, function(response) {
                try {
                    var list = component.get("v.ownerlist");
                    var retList = response.getReturnValue();
                    var state = response.getState();
                    if (state === 'SUCCESS') {
                          for(var i=0; i<retList.length; i++){
                                 list.push(retList[i]);
                          }
                        component.set("v.ownerlist",list);
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
        } catch (e) {
            alert(e);
        }
    }
})