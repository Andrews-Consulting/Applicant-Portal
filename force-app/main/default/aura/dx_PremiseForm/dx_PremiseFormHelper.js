({
    // Code that is instantiated once

    // Call the controller to "Read the contact (applicant) information" and set the applicant data for this component instance. 

	getApplication: function(component){
        try{
            console.log('Get Application ' + component.getLocalId()  + ':' + component.get("v.recordId")); 
            component.set("v.showError",false);                 // clear the error message display
        	var action = component.get("c.getApplication");         // Set the routine to call in the controller
            action.setParams({"objectId": component.get("v.recordId")});
            action.setCallback(this, function(response){        // and when it returns, perform ....
                try {            
                    var state = response.getState();
                    if (state === 'SUCCESS') {
                    	var application = response.getReturnValue();

                        // 
                        var ltype = (! $A.util.isEmpty(application.Primary_Lic_Type__c)) ? application.Primary_Lic_Type__c:application.abd_PortalWork_LicenseType__c;

                        var lTypes = ltype;
                        if(! $A.util.isEmpty(application.License_Applications__r)){
                            for(var i=0;i<application.License_Applications__r.length;i++){
                                lTypes = lTypes+' '+application.License_Applications__r[i].abd_License_Type__c;
                            }
                        }
                        
                        // If the Local Authority Type is state, then just lock all of the choices down.
                        if (!$A.util.isEmpty(application.abd_Local_Authority_Type__c))
                            if (application.abd_Local_Authority_Type__c == 'State') 
                                component.set("v.LAChoiceIsLocked",true);
                            else
                                component.set("v.LAChoiceIsLocked",false);

                        // according to Nate, we don't need a premise type for a BA license.
                   
                        if (ltype == 'BA' || 
                            ltype == 'AC'  ||
                            ltype == 'BAA' ||
                            ltype == 'BAAN' ||
                            ltype == 'BAN' ||
                            ltype == 'CB' ||
                            ltype == 'CD' ||
                            ltype == 'CM' ||
                            ltype == 'CV' ||
                            ltype == 'DS' ||
                            ltype == 'MD' ||
                            ltype == 'SP' ||
                            ltype == 'WA' ||
                            ltype == 'WAN' ) 
                            component.set("v.renderPremiseTypeList",false);

                        if(ltype != 'CB' && ltype != 'CV' && ltype != 'SP' && ltype != 'CD' && ltype != 'AC' && ltype != 'DS'){
                            component.set("v.stateOnly",true);
                        }
                        else component.set("v.stateOnly",false);

                        if(! $A.util.isEmpty(lTypes) && lTypes.includes('P-OS'))
                        	component.set("v.showOutdoor",true);
                        component.set("v.app",application);      // but if it's good, set the applicant value to the result.
                        this.getLocalAuthority(component);
                        this.getPicklistValues(component, event);                        
                    }
                    else {      // error or incomplete comes here
                        var errors = response.getError();
                        if (errors) {
                            for (var erri = 0; erri < errors.length; erri++) {
                                component.set("v.errorMessage", component.get("v.errorMessage") + " : " + errors[erri].message );
                                component.set("v.showError",true);      
                            }
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

     getLocalAuthority: function(component){
        try{
            console.log('Get local Authority ' +   component.getLocalId()  + ':' + component.get("v.recordId") );
            var app = component.get("v.app");
            var action = component.get("c.getLocalAuthority");         // Set the routine to call in the controller
            action.setParams({"county": app.abd_Premise_County__c,"city":app.abd_Premise_City__c});         // pass the data to the controller
            action.setCallback(this, function(response){        // and when it returns, perform ....
                try {            
                    var state = response.getState();
                    if (state === 'SUCCESS') {
                        var list = response.getReturnValue();
                        var opts = [];
                        if($A.util.isEmpty(app.abd_Local_Authority__c) && list.length===1)
                        	app.abd_Local_Authority__c=list[0].Id;
                        for(var i=0;i<list.length;i++){
                        	var phone = ($A.util.isEmpty(list[i].Phone))?'':list[i].Phone;
                            if(list[i].Name.startsWith('City'))
                            	component.set("v.cityLA",list[i].Name+' - '+phone);
                        	else if(list[i].Name.startsWith('County'))
                        		component.set("v.countyLA",list[i].Name+' - '+phone);
                        }
                    }
                    else {      // error or incomplete comes here
                        var errors = response.getError();
                        if (errors) {
                            for (var erri = 0; erri < errors.length; erri++) {
                                component.set("v.errorMessage", component.get("v.errorMessage") + " : " + errors[erri].message);
                                component.set("v.showError",true);      
                            }
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

     getAccount: function(component){
        try{
            console.log('Get Account ' + component.getLocalId()  + ':' + component.get("v.recordId")); 
            var action = component.get("c.getAccount");         // Set the routine to call in the controller
            action.setParams({"appId": component.get("v.recordId")});
            action.setCallback(this, function(response){        // and when it returns, perform ....
                try {            
                    var state = response.getState();
                    if (state === 'SUCCESS') {
                        component.set("v.licensee",response.getReturnValue());      // but if it's good, set the applicant value to the result.
                        console.log(response.getReturnValue());
                    }
                    else {      // error or incomplete comes here
                        var errors = response.getError();
                        if (errors) {
                            for (var erri = 0; erri < errors.length; erri++) {
                                component.set("v.errorMessage", component.get("v.errorMessage") + " : " + errors[erri].message);
                                component.set("v.showError",true);      
                            }
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
    getPicklistValues: function(component){
        try {
            console.log('Get picklist ' +  component.getLocalId()  + ':' + component.get("v.recordId") );
            var action = component.get("c.getPicklistValues");    // Set the routine to call in the controller
            action.setCallback(this, function(response){
                try {            
                    var state = response.getState();
                    if (state === 'SUCCESS') {
                        var rtnValue = response.getReturnValue();   
                        var application = JSON.parse(JSON.stringify(component.get("v.app")));
                        var so = component.get("v.stateOnly");
                        var list = rtnValue.state;
                        var opts = [];
                        var i;
                        for(i=0;i<list.length;i++){
                            opts.push({label:list[i], value:list[i], selected:(so && list[i]=='IA')});
                        }
                        component.find("States").set("v.options",opts);
                        if(so){
                            application.abd_Premise_State__c = 'IA';
                            component.set("v.app",application);
                        }
                        // get the premises type
                        // Switch this to use and array and the every method, passing in this address
                        if (application.Primary_Lic_Type__c != 'BA' && 
                            application.Primary_Lic_Type__c != 'AC' && 
                            application.Primary_Lic_Type__c != 'BAA' && 
                            application.Primary_Lic_Type__c != 'BAAN' && 
                            application.Primary_Lic_Type__c != 'BAN' && 
                            application.Primary_Lic_Type__c != 'CB' && 
                            application.Primary_Lic_Type__c != 'CD' && 
                            application.Primary_Lic_Type__c != 'CM' && 
                            application.Primary_Lic_Type__c != 'CV' && 
                            application.Primary_Lic_Type__c != 'DS' && 
                            application.Primary_Lic_Type__c != 'MD' && 
                            application.Primary_Lic_Type__c != 'SP' && 
                            application.Primary_Lic_Type__c != 'WA' && 
                            application.Primary_Lic_Type__c != 'WAN' ) {
                            list = rtnValue.pType;
                            opts = [];
                            for(i=0;i<list.length;i++){
                                opts.push({label:list[i], value:list[i]});
                            }
                            if (!$A.util.isEmpty(component.find("pType")))
                                component.find("pType").set("v.options",opts);
                        }
                        // Get the county list
                        list = rtnValue.county;
                        opts = [];
                        for(i=0;i<list.length;i++){
                            opts.push({label:list[i], value:list[i]});
                        }
                        component.find("Counties").set("v.options",opts);
                        // Get the time list
                        list = rtnValue.time;
                        opts = [];
                        for(i=0;i<list.length;i++){
                            opts.push({label:list[i], value:list[i]});
                        }
                        component.find("auctionStart").set("v.options",opts);
                        component.find("auctionEnd").set("v.options",opts);
                        // get the auction business type
                        list = rtnValue.cbType;
                        opts = [];
                        for(i=0;i<list.length;i++){
                            opts.push({label:list[i], value:list[i]});
                        }
                        component.find("cbType").set("v.options",opts);


                    }
                    else {      // error or incomplete comes here
                        var errors = response.getError();
                        if (errors) {
                            for (var erri = 0; erri < errors.length; erri++) {
                                component.set("v.errorMessage", component.get("v.errorMessage") + " : " + errors[erri].message);
                                component.set("v.showError",true);      
                            }
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

   // Call the controller to update the record with the values collected on the screen.
    // We could do validation here on the client side to make this a little faster.

    doUpdate: function(component){
        try {
            console.log('do update ' +    component.getLocalId()  + ':' +  component.get("v.recordId"));
            component.set("v.showError",false);                 // clear the error message off of the screen
            var notAnswered = '--None--';

            // If this isn't an application, then skip the Save for Now and tell everyone we're okay!
            if (!component.get("v.RecordIdIsApplication")) {
                var action = component.getEvent("SaveCompleted");
                action.setParams({"Component" : component, "Action": "Saved" });
                action.fire();
                return;
            }

            var application = JSON.parse(JSON.stringify(component.get("v.app")));       // get the data from the component
            console.log(application);
            // validate the data here!  Check to see if the fields are completed.
            var errmsg = '';
            // If any fields were blank, fix up the message to be readable.

            // don't try to update with bad values.
            if (application.abd_Premise_State__c == notAnswered) application.abd_Premise_State__c = null;
            if (application.Premises_Type__c == notAnswered) application.Premises_Type__c  = null;
            if (application.abd_Premise_County__c == notAnswered)  application.abd_Premise_County__c = null;
            if (application.abd_Charity_Business_Type__c == notAnswered)  application.abd_Charity_Business_Type__c = null;

// validate the start dates (data entry)
            if ($A.util.isEmpty(application.abd_Effective_Date__c) || 
                (application.abd_Effective_Date__c.length < 6) || 
                (new Date(application.abd_Effective_Date__c) == 'Invalid Date') || 
                (new Date(application.abd_Effective_Date__c).getTime() < 0) || 
                (new Date(application.abd_Effective_Date__c).getTime() > new Date('2020-01-01').getTime()))
                    errmsg += 'Start Date, ';
            else {
                application.abd_Effective_Date__c = new Date(application.abd_Effective_Date__c).toJSON().substr(0,10);
// validate end dates if necessary
                if (application.abd_Temporary_or_Permanent__c == 'Temporary') {
                    if ($A.util.isEmpty(application.abd_Effective_End_Date__c) || 
                        (application.abd_Effective_End_Date__c.length < 6) || 
                        (new Date(application.abd_Effective_End_Date__c) == 'Invalid Date') || 
                        (new Date(application.abd_Effective_End_Date__c).getTime() < 0) || 
                        (new Date(application.abd_Effective_End_Date__c).getTime() > new Date('2020-01-01').getTime()))
                            errmsg += 'End Date, ';
                    else
                        application.abd_Effective_End_Date__c = new Date(application.abd_Effective_End_Date__c).toJSON().substr(0,10);
                }
                else 
                    application.abd_Effective_End_Date__c = null;
            }
          
            // If this is an auction application, the Start date comes from the Efective date above.
            if (application.Primary_Lic_Type__c ==='CP') {
                if ($A.util.isEmpty(application.abd_Time_of_Auction_Beginning__c))  errmsg += 'Auction Start Time, ';
            }

            if ($A.util.isEmpty(application.Id)) errmsg = 'It does not appear that you are still logged in or logged in as a valid user.';

            if (errmsg !== '') { 
                errmsg = 'The following fields are required and are missing or have invalid data: ' + errmsg;
                if (errmsg.endsWith(', ')) errmsg = errmsg.substring(0,errmsg.length-2) + '. ';
            }
            else {
// Buiness rules are here.
                // All messages below this point must be complete.
                if (application.abd_Effective_Date__c < application.CreatedDate.substr(0,10))  errmsg = 'The Start Date can\'t be earlier than the date you started the application.';

                if (application.abd_Temporary_or_Permanent__c == 'Temporary') 
                    if (application.abd_Effective_End_Date__c < application.abd_Effective_Date__c)
                        errmsg = 'The End Date of the application cannot be before the Start Date';
            }

            // If there is an error, then let's display it and leave.
            if (errmsg !== '') {
console.log(errmsg);
                component.set("v.errorMessage",errmsg);
                component.set("v.showError",true);
                var action = component.getEvent("SaveCompleted");
                action.setParams({"Component" : component, "Action": "Fail" });
                action.fire();
            }
            // If all good, then let's call the controller and try to update the record.
            else {
                var action = component.get("c.upRecordApex");       // Set the routine to call in the controller
                action.setParams({"application": application});         // pass the data to the controller
                action.setCallback(this, function(response){
                    var action = component.getEvent("SaveCompleted");
                    try {            
                        var state = response.getState();
                        if (state === 'SUCCESS' && response.getReturnValue() === "Update Successful") {
                            action.setParams({"Component" : component, "Action": "save" });
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
            var action = component.getEvent("SaveCompleted");
            action.setParams({"Component" : component, "Action": "Fail" });
            action.fire();

        }
    }
})