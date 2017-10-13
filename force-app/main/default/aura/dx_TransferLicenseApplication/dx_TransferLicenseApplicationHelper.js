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
                        var application = response.getReturnValue();
                        application.abd_Effective_Date__c = null;
                        application.abd_Effective_End_Date__c = null;
                        
                        component.set("v.app",application); 
                        component.set("v.recordId",application.Id);
                        component.set("v.isInitComplete",true);
                        this.getPremiseCity(component, event);
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

                        // Copy over these values
                        //var application = JSON.parse(JSON.stringify(component.get("v.app")));
                        //application.abd_Premise_County__c = license.abd_Premise_County__c;
                        //application.abd_Premise_State__c = license.abd_Premise_State__c;
                        //application.abd_Premise_City__c = license.abd_Premise_City__c;
                        if(license.abd_Premise_State__c!='IA')
                        	component.set("v.textCity",license.abd_Premise_City__c);
                        
                        //component.set("v.app",application);
            			
                        // Now figure out what else we can show / not show / need to lock down.
                        var lTypes = license.abd_License_Type__c;
                        if(license.Licenses__r!==null && license.Licenses__r!==undefined){
                            for(var i = 0;i<license.Licenses__r.length;i++){
                                lTypes = lTypes+' '+license.Licenses__r[i].abd_License_Type__c;
                            }
                        }
                        if(!lTypes.includes('CB') && !lTypes.includes('CV') && !lTypes.includes('SP') && !lTypes.includes('CD') && !lTypes.includes('AC') && !lTypes.includes('DS')){
                            component.set("v.stateOnly",true);
                        }
                        else {
                            component.set("v.stateOnly",false);
                            //var cnty = component.find("Counties");
                            //if (!$A.util.isEmpty(cnty))
                            //    $A.util.addClass(cnty,"slds-hide");
                        }
                        
                        component.set("v.laType",license.abd_Local_Authority_Type__c);
                        
                        this.getApplication(component, event);
                        //this.getPremiseCity(component, event);
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
     getPremiseCity: function(component) {

        try {
            var action = component.get("c.getPremiseCity"); // Set the routine to call in the controller
            console.log(component.get("v.app"));
            action.setParams({"county": component.get("v.app.abd_Premise_County__c")}); // pass the data to the controller

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
                        list = rtnValue.time;
                        opts = [];
                        for(i=0;i<list.length;i++){
                            opts.push({label:list[i], value:list[i], selected:(list[i]==component.get("v.app.abd_Start_Time__c"))});
                        }
                        component.find("time").set("v.options",opts);
                        
                        // populate the county list from the response
                        list = rtnValue.county;
                        opts = [];
                        for (var i = 0; i < list.length; i++) {
                            opts.push({label: list[i],value: list[i],selected:(list[i]==component.get("v.app.abd_Premise_County__c"))});
                        }
                        component.find("Counties").set("v.options", opts);
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
            if ($A.util.isEmpty(application.abd_Temporary_or_Permanent__c)) application.abd_Temporary_or_Permanent__c = 'Permanent';

            if ($A.util.isEmpty(application.abd_Premise_Address__c)) errmsg += 'Address, ';
            if ($A.util.isEmpty(application.abd_Premise_State__c) || application.abd_Premise_State__c == notAnswered) errmsg += 'State, ';
            if ($A.util.isEmpty(application.abd_Premise_Zip_Code__c))  errmsg += 'Zip, ';
          
// validate start dates ()

            var eYear;
            // IE & edge convert a two digit year to 1900 (!STILL), so add 100 years to all dates in the 1900 
            if (!$A.util.isEmpty(application.abd_Effective_Date__c) && new Date(application.abd_Effective_Date__c) != 'Invalid Date') {
                eYear = new Date(application.abd_Effective_Date__c).getFullYear();
                if (eYear  > 1900 && eYear < 2000) 
                    application.abd_Effective_Date__c = new Date(application.abd_Effective_Date__c).setFullYear(eYear+100);
            }


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


                    // IE & edge convert a two digit year to 1900 (!STILL), so add 100 years to all dates in the 1900 
                    if (!$A.util.isEmpty(application.abd_Effective_End_Date__c) && new Date(application.abd_Effective_End_Date__c) != 'Invalid Date') {
                        eYear = new Date(application.abd_Effective_End_Date__c).getFullYear();
                        if (eYear  > 1900 && eYear < 2000) 
                            application.abd_Effective_End_Date__c = new Date(application.abd_Effective_End_Date__c).setFullYear(eYear+100);
                    }

                    
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


            if (errmsg.length !== 0) {
                    errmsg = 'The following fields are required and are missing or have invalid data: ' + errmsg;
                if (errmsg.endsWith(', ')) errmsg = errmsg.substring(0,errmsg.length-2) + '. ';
            }
            else 
            {

                if (application.abd_Effective_Date__c < lic.abd_Effective_Date__c) {
                    var d = new Date(new Date(lic.abd_Effective_Date__c).getTime() + new Date(lic.abd_Effective_Date__c).getTimezoneOffset()*60*1000 );
                    errmsg = ('The Start Date of the application cannot be before the current/primary license start date of ' + d.toLocaleDateString('en-US', {timeZone: 'UTC'}));
                }
                
                if (application.abd_Effective_Date__c > lic.abd_Effective_End_Date__c) {
                    var d = new Date(new Date(lic.abd_Effective_End_Date__c).getTime() + new Date(lic.abd_Effective_End_Date__c).getTimezoneOffset()*60*1000 );
                    errmsg = ('The Start Date of the application cannot be after the current/primary license end date of ' + d.toLocaleDateString('en-US', {timeZone: 'UTC'}));
                }

                if (application.abd_Effective_End_Date__c > lic.abd_Effective_End_Date__c) {
                    var d = new Date(new Date(lic.abd_Effective_End_Date__c).getTime() + new Date(lic.abd_Effective_End_Date__c).getTimezoneOffset()*60*1000 );
                    errmsg = ('The End Date of the application cannot be after the current/primary license end date of ' + d.toLocaleDateString('en-US', {timeZone: 'UTC'}));
                }

                if (application.abd_Temporary_or_Permanent__c == 'Temporary' && application.abd_Effective_Date__c > application.abd_Effective_End_Date__c) {
                    errmsg = 'The application Start Date cannot be after than the End Date.';
                }

                var firstDate = new Date(application.abd_Effective_Date__c);
                var secondDate = new Date(application.abd_Effective_End_Date__c);
                
                var diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));
                if (errmsg == '' && application.abd_Temporary_or_Permanent__c == 'Temporary' && (diffDays<0 || diffDays>6))
                    errmsg = 'Temporary transfers must be between 1 and 7 days, please adjust the start and end date accordingly';
                // don't try to update with bad values.
                if (application.abd_Premise_State__c == notAnswered) application.abd_Premise_State__c = null;
            }            
            
            // Null values from picklists
            if (errmsg.length === 0) {
                if(application.abd_Premises_Vehicle_Type__c == notAnswered)
                	application.abd_Premises_Vehicle_Type__c = null;
                if(application.abd_Premise_County__c == notAnswered)
                	application.abd_Premise_County__c = null;
                if(application.abd_Premise_City__c == notAnswered){
            		var city = component.get("v.textCity");
            		if(city!=''){
            			application.abd_Premise_City__c = city;
            		}else{
	            		errmsg+= "Please select a Premises City.";
            		}
                }
                if(application.abd_Premise_State__c == notAnswered)
            		application.abd_Premise_State__c = null;
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
                console.log('dates are ' + application.abd_Effective_Date__c + ' & ' + application.abd_Effective_End_Date__c);
                var action = component.get("c.updateTransferApp");       // Set the routine to call in the controller
                action.setParams({"application": application});         // pass the data to the controller
                action.setCallback(this, function(response){
                    var action = component.getEvent("SaveCompleted");
                    try {            
                        var state = response.getState();
                        if (state === 'SUCCESS') {
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