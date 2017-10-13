({
    // Code that is instantiated once

    getLicense: function(component){
        try{
            console.log('Get License ' + component.getLocalId()  + ':' + component.get("v.recordId")); 
            component.set("v.showError",false);                 // clear the error message display
        	var action = component.get("c.getLicense");         // Set the routine to call in the controller
            action.setParams({"licenseId": component.get("v.recordId")});
            action.setCallback(this, function(response){        // and when it returns, perform ....
                try {            
                    var state = response.getState();
                    if (state === 'SUCCESS') {
                    	var license = response.getReturnValue();
                    	component.set("v.lic",license);      // but if it's good, set the applicant value to the result.
                        var lTypes = license.abd_License_Type__c;
                        if(license.Licenses__r!==null && license.Licenses__r!==undefined){
                            for(var i = 0;i<license.Licenses__r.length;i++){
                                lTypes = lTypes+' '+license.Licenses__r[i].abd_License_Type__c;
                            }
                        }
                        if(!lTypes.includes('CB') && !lTypes.includes('CV') && !lTypes.includes('SP') && !lTypes.includes('CD') && !lTypes.includes('AC') && !lTypes.includes('DS')){
                            component.set("v.stateOnly",true);
                        }
                        else component.set("v.stateOnly",false);
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
                            opts.push({label:list[i], value:list[i], selected:(list[i]=='IA')});
                        }
                        component.find("States").set("v.options",opts);
                        application.abd_Premise_State__c = 'IA';
                        component.set("v.app",application);
                        
                        list = rtnValue.county;
                        opts = [];
                        for(i=0;i<list.length;i++){
                            opts.push({label:list[i], value:list[i]});
                        }
                        component.find("Counties").set("v.options",opts);
                        component.set("v.isInitComplete",true);
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
    getPremiseCity: function(component) {
    	try {
            var action = component.get("c.getPremiseCity"); // Set the routine to call in the controller
            action.setParams({"county": component.get("v.app.County__c")}); // pass the data to the controller

            action.setCallback(this, function(response){
                try {
                    var state = response.getState();
                    if (state === 'SUCCESS') {
                        var list = response.getReturnValue();
                        var opts = [];
                        var map = {};
                        for (var i = 0; i < list.length; i++) {
                            opts.push({
                                label: list[i].Name,
                                value: list[i].Name,
                                selected: (component.get("v.app.abd_Premise_City__c") == list[i].Name)
                            });
                           map[list[i].Name] = list[i].abd_Population__c;
                        }
                        component.find("city").set("v.options", opts);
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
            $A.enqueueAction(action);                                           // queue the work.
        }
        // handle browser errors 
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
            var application = JSON.parse(JSON.stringify(component.get("v.app")));       // get the data from the component
            var lic = JSON.parse(JSON.stringify(component.get("v.lic")));
            console.log(application);
            // validate the data here!  Check to see if the fields are completed.
            var errmsg = '';
        	if ($A.util.isEmpty(application.abd_Premise_Address__c) || application.abd_Premise_Address__c.length === 0) errmsg += 'Address, ';
    		if ($A.util.isEmpty(application.abd_Premise_City__c) || application.abd_Premise_City__c.length == notAnswered)  errmsg += 'City, ';
    		if ($A.util.isEmpty(application.abd_Premise_State__c)  || application.abd_Premise_State__c == notAnswered) errmsg += 'State, ';
			if ($A.util.isEmpty(application.abd_Premise_Zip_Code__c) || application.abd_Premise_Zip_Code__c.length === 0)  errmsg += 'Zip, ';
            if (application.abd_Premise_State__c==='IA' && ($A.util.isEmpty(application.County__c) || application.County__c == notAnswered))  errmsg += 'County, ';

// validate start date 
            if ($A.util.isEmpty(application.abd_Effective_Date__c) || 
                (application.abd_Effective_Date__c.length < 6) || 
                (new Date(application.abd_Effective_Date__c) == 'Invalid Date'))
                    errmsg += 'Start Date, ';
            else {
// validate end dates if necessary
                if (application.abd_Temporary_or_Permanent__c == 'Temporary') {
                    if ($A.util.isEmpty(application.abd_Effective_End_Date__c) || 
                        (application.abd_Effective_End_Date__c.length < 6) || 
                        (new Date(application.abd_Effective_End_Date__c) == 'Invalid Date'))
                            errmsg += 'End Date, ';
                }
                else // If it's not needed now, wipe it out since it could have bad data in it.
                    application.abd_Effective_End_Date__c = null;
            }


            // Date Validation 
			if ($A.util.isEmpty(errmsg) && $A.localizationService.isBefore(application.abd_Effective_Date__c, lic.abd_Effective_Date__c)) {
                var d = new Date(new Date(lic.abd_Effective_Date__c).getTime() + new Date(lic.abd_Effective_Date__c).getTimezoneOffset()*60*1000 );
                errmsg = ('The Start Date of the application cannot be before the current/primary license start date of ' + d.toLocaleDateString());
                console.log(errmsg);
            }

            if ($A.util.isEmpty(errmsg) && $A.localizationService.isBefore(application.abd_Effective_End_Date__c,application.abd_Effective_Date__c)) {
                errmsg = 'The End Date of the application cannot be before the Start Date';
                console.log(errmsg);
            }

			if ($A.util.isEmpty(errmsg) && $A.localizationService.isBefore(lic.abd_Effective_End_Date__c, application.abd_Effective_End_Date__c)) {
                var d = new Date(new Date(lic.abd_Effective_End_Date__c).getTime() + new Date(lic.abd_Effective_End_Date__c).getTimezoneOffset()*60*1000 );
                if(errmsg.startsWith('The'))
                	errmsg += '<br/>';
                errmsg += ('The End Date of the application cannot be after the current/primary license end date of ' + d.toLocaleDateString());
                console.log(errmsg);
            }
            
            if (errmsg.length !== 0) {
            	if(!errmsg.startsWith('The'))
            		errmsg = 'The following fields are missing or have invalid data: ' + errmsg;
                if (errmsg.endsWith(', ')) errmsg = errmsg.substring(0,errmsg.length-2) + '. ';
            }
            
            var action;
            // If there is an error, then let's display it and leave.
            if (errmsg.length !== 0) {
                component.set("v.errorMessage",errmsg);
                component.set("v.showError",true);
                action = component.getEvent("SaveCompleted");
                action.setParams({"Component" : component, "Action": "Fail" });
                action.fire();
            }
            // If all good, then let's call the controller and try to update the record.
            else {
                // don't try to update with bad values.
                if (application.abd_Premise_State__c == notAnswered) application.abd_Premise_State__c = null;
                if (application.County__c == notAnswered)  application.County__c = null;


                action = component.get("c.createAddApp");       // Set the routine to call in the controller
                action.setParams({"application": application,"license": lic});         // pass the data to the controller
                action.setCallback(this, function(response){
                    var action = component.getEvent("SaveCompleted");
                    try {            
                        var state = response.getState();
                            if (state === 'SUCCESS' && response.getReturnValue().substr(0,8) === "SUCCESS:") {
                            var recid = response.getReturnValue().substr(9);
                            if (!$A.util.isEmpty(recid)) component.set("v.recordId",recid);
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