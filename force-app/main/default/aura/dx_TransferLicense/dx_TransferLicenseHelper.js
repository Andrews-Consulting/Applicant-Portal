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
                        
                        component.set("v.laType",license.abd_Local_Authority_Type__c);
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
                            opts.push({label:list[i], value:list[i], selected:(so && list[i]=='IA')});
                        }
                        component.find("States").set("v.options",opts);
                        if(so){
                            application.abd_Premise_State__c = 'IA';
                            component.set("v.app",application);
                        }
                        list = rtnValue.county;
                        opts = [];
                        for(i=0;i<list.length;i++){
                            opts.push({label:list[i], value:list[i]});
                        }
                        component.find("Counties").set("v.options",opts);
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
        	var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
			console.log('do update ' +    component.getLocalId()  + ':' +  component.get("v.recordId"));
            component.set("v.showError",false);                 // clear the error message off of the screen
            var notAnswered = '--None--';
            var application = JSON.parse(JSON.stringify(component.get("v.app")));       // get the data from the component
            var lic = JSON.parse(JSON.stringify(component.get("v.lic")));
            console.log(application);
            // validate the data here!  Check to see if the fields are completed.
            var errmsg = '';
        	if (application.abd_Premise_Address__c == null || application.abd_Premise_Address__c.length == 0) errmsg += 'Address, ';
    		if (application.abd_Premise_City__c == null || application.abd_Premise_City__c.length == 0)  errmsg += 'City, ';
    		if (application.abd_Premise_State__c == null || application.abd_Premise_State__c == notAnswered) errmsg += 'State, ';
			if (application.abd_Premise_Zip_Code__c == null || application.abd_Premise_Zip_Code__c.length == 0)  errmsg += 'Zip, ';
			if (application.abd_Effective_Date__c == null)  errmsg += 'Start Date, ';
			if (application.abd_Effective_End_Date__c == null && application.abd_Temporary_or_Permanent__c == 'Temporary')  errmsg += 'End Date, ';
			if (application.abd_Premise_State__c==='IA' && (application.abd_Premise_County__c == null || application.abd_Premise_County__c == notAnswered))  errmsg += 'County, ';
			if ($A.util.isEmpty(application.abd_Temporary_or_Permanent__c))
				application.abd_Temporary_or_Permanent__c = 'Permanent';
			if (application.abd_Effective_Date__c < lic.abd_Effective_Date__c) {
                var d = new Date(new Date(lic.abd_Effective_Date__c).getTime() + new Date().getTimezoneOffset()*60*1000 );
                errmsg = ('The Start Date of the application cannot be before the current/primary license start date of ' + lic.abd_Effective_Date__c);
                console.log(errmsg);
            }
            
			if (application.abd_Effective_End_Date__c < lic.abd_Effective_End_Date__c) {
                var d = new Date(new Date(lic.abd_Effective_End_Date__c).getTime() + new Date().getTimezoneOffset()*60*1000 );
                errmsg = ('The End Date of the application cannot be after the current/primary license end date of ' + d.toLocaleDateString('en-US', {timeZone: 'UTC'}));
                console.log(errmsg);
            }
            var firstDate = new Date(application.abd_Effective_Date__c);
			var secondDate = new Date(application.abd_Effective_End_Date__c);
			
			var diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));
            if (application.abd_Temporary_or_Permanent__c == 'Temporary' && (diffDays<1 || diffDays>7))
            	errmsg = ('Temporary transfers must be between 1 and 7 days, please adjust the start and end date accordingly');
			// don't try to update with bad values.
            if (application.abd_Premise_State__c == notAnswered) application.abd_Premise_State__c = null;
            if (application.abd_Premise_County__c == notAnswered)  application.abd_Premise_County__c = null;
            
            if (errmsg.length !== 0) {
            	if(!errmsg.startsWith('The'))
            		errmsg = 'The following fields are required and are missing data: ' + errmsg;
                if (errmsg.endsWith(', ')) errmsg = errmsg.substring(0,errmsg.length-2) + '. ';
            }
            
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
                var action = component.get("c.createTransferApp");       // Set the routine to call in the controller
                action.setParams({"application": application,"license": lic});         // pass the data to the controller
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
        }
    }
})