({
    // Code that is instantiated once

    // Call the controller to "Read the contact (applicant) information" and set the applicant data for this component instance. 

    getAccount: function(component, event){
        try{
            console.log('Get Account ' + component.getGlobalId() + ':' + component.get("v.recordId"));
            var action = component.get("c.getAccount");         // Set the routine to call in the controller
            action.setParams({"appId": component.get("v.recordId")});    
            action.setCallback(this, function(response){        // and when it returns, perform ....
                try {            
                    var state = response.getState();
                    if (state === 'SUCCESS') {
                        component.set("v.licensee",response.getReturnValue());      // but if it's good, set the applicant value to the result.
                        this.getPicklistValues(component, event);
                    }
                    else {      // error or incomplete comes here
                        var errors = response.getError();
                        if (errors) {
                            for (var erri = 0; erri < errors.length; erri++) {
                                component.set("v.errorMessage", component.get("v.errorMessage") + " : " + errors[erri].message );
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
            alert(e.stack);
        }
     },
     getContact: function(component, event){
        try{
            console.log('Get Contact  ' + component.getGlobalId() + ':' + component.get("v.recordId"));
            var action = component.get("c.getContact");         // Set the routine to call in the controller
            action.setParams({"appId": component.get("v.recordId")});    
            action.setCallback(this, function(response){        // and when it returns, perform ....
                try {            
                    var state = response.getState();
                    if (state === 'SUCCESS') {
                        component.set("v.applicant",response.getReturnValue());      // but if it's good, set the applicant value to the result.
                        var arr = [];
                        arr.push(response.getReturnValue());
                        component.set("v.records",arr);
                    }
                    else {      // error or incomplete comes here
                        var errors = response.getError();
                        if (errors) {
                            for (var erri = 0; erri < errors.length; erri++) {
                                component.set("v.errorMessage", component.get("v.errorMessage") + " : " + errors[erri].message );
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
            alert(e.stack);
        }
     },


    // Call the controller to get the Citizenship values for the drop down box.  (not the result, but all of the choices)
    getPicklistValues: function(component, event){
        try {
            console.log('Get Picklist ' + component.getGlobalId() + ':' + component.get("v.recordId"));
            var account = JSON.parse(JSON.stringify(component.get("v.licensee")));
            //console.log(account);
            var action = component.get("c.getPicklistValues");    // Set the routine to call in the controller
            action.setParams({"objectId": component.get("v.recordId")});
            action.setCallback(this, function(response){
                try {            
                    var state = response.getState();
                    if (state === 'SUCCESS') {
                        var rtnValue = response.getReturnValue();   
                        var list = rtnValue.state;
                        var opts = [];
                        var i;
                        var selected;
                        if(account.BillingState === null || account.BillingState === undefined)
                        	account.BillingState=list[0];
                        for(i=0;i<list.length;i++){
                        	selected = (list[i] == account.BillingState);
                            opts.push({label:list[i], value:list[i], selected:selected});
                        }
                        component.find("state").set("v.options",opts);

                    // Business Types

                        list = rtnValue.bType;
                        opts = [];
                        if(account.Business_Type__c === null || account.Business_Type__c === undefined)
                        	account.Business_Type__c=list[0];
                		for(i=0;i < list.length;i++){
                			selected = (list[i] === account.Business_Type__c);
                            opts.push({label:list[i], value:list[i], selected:selected});
                        }
                        component.find("bTypeItems").set("v.options",opts);
                        component.set("v.licensee",account);
                        this.dependency(component);
                    }
                    else {      // error or incomplete comes here
                        var errors = response.getError();
                        if (errors) {
                            for (var erri = 0; erri < errors.length; erri++) {
                                component.set("v.errorMessage", component.get("v.errorMessage") + " : " + errors[erri].message );
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
            alert(e.stack);
        }
    },

    // Call the controller to update the record with the values collected on the screen.
    // We could do validation here on the client side to make this a little faster.

    doUpdate: function(component, event){
            console.log('Do Update ' + component.getGlobalId() + ':' + component.get("v.recordId"));
        try {
            var notAnswered = '--None--';
            var action;
            var validity;
            // If this isn't an application, then skip the Save for Now and tell everyone we're okay!
            if (!component.get("v.RecordIdIsApplication")) {
                action = component.getEvent("SaveCompleted");
                action.setParams({"Component" : component, "Action": "Saved" });
                action.fire();
                return;
            }

            var licensee = JSON.parse(JSON.stringify(component.get("v.licensee")));       // get the data from the component
            var applicant = JSON.parse(JSON.stringify(component.get("v.applicant")));
            // validate the data here!  Check to see if the fields are completed.
            var errmsg = '';
            // the --none-- isn't a valid choice, so we just set it to null.
            if(licensee.Business_Type__c == '--None--') licensee.Business_Type__c = null;   

            var emailpattern = new RegExp("\\S+@\\S+\\.\\S+");
            if (!$A.util.isEmpty(applicant.Email) && !emailpattern.test(applicant.Email)) {
                errmsg  = "The Applicant email doesn't appear to be valid.";
            }

            if (!$A.util.isEmpty(licensee.abd_Account_Email_Address__c) && !emailpattern.test(licensee.abd_Account_Email_Address__c)) errmsg  = "The Licensee email doesn't appear to be valid.";

           if (!$A.util.isEmpty(component.find("licPhone"))) {
                validity = component.find("licPhone").get("v.validity");
                if (validity.patternMismatch) 
                    errmsg += 'Licensee Phone number is invalid. ';            
            }

           if (!$A.util.isEmpty(component.find("appPhone"))) {
                validity = component.find("appPhone").get("v.validity");
                if (validity.patternMismatch) 
                    errmsg += 'Applicant Phone number is invalid. ';            
            }


            // If we're on the save and it's one of these types, then clear out any old info that might be hanging on
            if( !$A.util.isEmpty(licensee.Business_Type__c) && 
               (licensee.Business_Type__c ==  'Sole Proprietorship' ||
                licensee.Business_Type__c == 'General Partnership' || 
                licensee.Business_Type__c == 'Municipality')) {
                    licensee.abd_Corporate_ID_Number__c = null;
            }
            

            if (! $A.util.isEmpty(licensee.abd_Corporate_ID_Number__c)) {
                var numTest = new RegExp(/[^0-9]/);
                if (numTest.test(licensee.abd_Corporate_ID_Number__c) || licensee.abd_Corporate_ID_Number__c.length > 6)
                    errmsg += 'Business ID number should be numeric and no more than 6 digits long.';
            }

            if (licensee.Id === null) errmsg = 'It does not appear that you are still logged in or logged in as a valid user.';

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
                action = component.get("c.upRecordApex");       // Set the routine to call in the controller
                action.setParams({"licensee": licensee,"applicant":applicant});         // pass the data to the controller
                action.setCallback(this, function(response){
                    var action = component.getEvent("SaveCompleted");
                    try {            
                        var state = response.getState();
                        if (state === 'SUCCESS') {
                            action.setParams({"Component" : component, "Action": "Saved" });
                        }
                        else {      // error or incomplete comes here
                            var errors = response.getError();
                            if (errors) {
                                for (var erri = 0; erri < errors.length; erri++) {
                                    component.set("v.errorMessage", errors[erri].message + " : " + component.get("v.errorMessage"));
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

    dependency: function (component){
        var Account = JSON.parse(JSON.stringify(component.get("v.licensee")));
        console.log(Account);
        var hideShow = component.find("dependent");
        var i;
        if(component.get("v.isNewApp")){
	        if(Account.Business_Type__c !== null && 
                Account.Business_Type__c !== '--None--' && 
                Account.Business_Type__c !== 'Sole Proprietorship' && 
                Account.Business_Type__c !== 'General Partnership' && 
                Account.Business_Type__c !== 'Municipality' &&
                component.get("v.IsBusinessIdNeeded")){
	        	for (i = 0; i < hideShow.length; i++) {
	                $A.util.removeClass(hideShow[i], 'slds-hide');
	            }
	        }else{
	            for (i = 0; i < hideShow.length; i++) {
	                $A.util.addClass(hideShow[i], 'slds-hide');
	            }
	        }
	        if(Account.Business_Type__c == 'General Partnership'){
                if (!$A.util.isEmpty(component.get("v.SaveDisabled")) && component.get("v.SaveDisabled")) {
                    this.hidePopupHelper(component,'modaldialog','slds-');
                    this.hidePopupHelper(component,'backdrop','slds-');
                }
                else {
	               this.showPopupHelper(component, 'modaldialog', 'slds-fade-in-');
	               this.showPopupHelper(component,'backdrop','slds-backdrop--');
                }
	        }
        }
    },
    
    showPopupHelper: function(component, componentId, className){ 
        var modal = component.find(componentId); 
        $A.util.removeClass(modal, className+'hide'); 
        $A.util.addClass(modal, className+'open'); 
    },
    hidePopupHelper: function(component, componentId, className){ 
        var modal = component.find(componentId); 
        $A.util.addClass(modal, className+'hide'); 
        $A.util.removeClass(modal, className+'open'); 
    },
      // lightning with locker service on has problems getting the recordId
    CheckRecordId: function(component, event) {    
        //   the function that reads the url parameters
        try {
            var getUrlParameter = function getUrlParameter(sParam) {
             var sPageURL = decodeURIComponent(window.location.search.substring(1)),
                    sURLVariables = sPageURL.split('&'),
                    sParameterName,
                    i;

                for (i = 0; i < sURLVariables.length; i++) {
                    sParameterName = sURLVariables[i].split('=');

                    if (sParameterName[0] === sParam) {
                        return sParameterName[1] === undefined ? true : sParameterName[1];
                    }
                }
            };

            // If the value isn't set, then go get it from the query string.
            var curRecId = component.get("v.recordId");
            if (!$A.util.isUndefined(curRecId) || curRecId == '0') component.set("v.recordId", getUrlParameter('recordId'));
        } catch(e) {alert(e.stack);} 
    },
    isNewApplication: function(component, event) {    
        try{
            console.log('Check Is New Application ' + component.getGlobalId() + ':' + component.get("v.recordId"));
            var action = component.get("c.isNewApplication");         // Set the routine to call in the controller
            action.setParams({"appId": component.get("v.recordId")});    
            action.setCallback(this, function(response){        // and when it returns, perform ....
                try {            
                    var state = response.getState();
                    if (state === 'SUCCESS') {
                        component.set("v.isNewApp",response.getReturnValue());      // but if it's good, set the applicant value to the result.
                    }
                    else {      // error or incomplete comes here
                        var errors = response.getError();
                        if (errors) {
                            for (var erri = 0; erri < errors.length; erri++) {
                                component.set("v.errorMessage", component.get("v.errorMessage") + " : " + errors[erri].message );
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
            alert(e.stack);
        }
    }, 
      getApplication: function(component, event) {    
        try{
            console.log('get Application ' + ':' + component.get("v.recordId"));
            var action = component.get("c.getApplication");         // Set the routine to call in the controller
            action.setParams({"objectId": component.get("v.recordId")});    
            action.setCallback(this, function(response){        // and when it returns, perform ....
                try {            
                    var state = response.getState();
                    if (state === 'SUCCESS') { 
                        // If this is a special license located in Iowa, then we don't collect the Business ID
                        if (!$A.util.isEmpty(response.getReturnValue())) {
                            var app =  response.getReturnValue();
                            var specialLicenses = 'CB  CD  CV  DS  AC  SP';
                            if (specialLicenses.includes(app.Primary_Lic_Type__c) && 
                                app.abd_Premise_State__c !== 'IA') {
                                component.set("v.IsBusinessIdNeeded",false);

                                var hideShow = component.find("dependent");
                                for (var i = 0; i < hideShow.length; i++) {
                                    $A.util.addClass(hideShow[i], 'slds-hide');
                                }
                            }
                        }
                    }
                    else {      // error or incomplete comes here
                        var errors = response.getError();
                        if (errors) {
                            for (var erri = 0; erri < errors.length; erri++) {
                                component.set("v.errorMessage", component.get("v.errorMessage") + " : " + errors[erri].message );
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
            alert(e.stack);
        }
    }
})