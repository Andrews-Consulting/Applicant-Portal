({
    // Code that is instantiated once

    // Call the controller to "Read the contact (applicant) information" and set the applicant data for this component instance. 

	getApplication: function(component){
        try{
            console.log('Get Application');
            component.set("v.showError",false);                 // clear the error message display
        	var action = component.get("c.getApplication");         // Set the routine to call in the controller
            action.setParams({"objectId": component.get("v.recordId")});            
            action.setCallback(this, function(response){        // and when it returns, perform ....
                try {            
                    var state = response.getState();
                    if (state === 'SUCCESS') {
                        var noshow = true;                      // flag for if nothing is shown.
                        var rtnValue = response.getReturnValue();       // get the data and validate it, if null show an error
                        var ltype = (! $A.util.isEmpty(rtnValue.Primary_Lic_Type__c)) ? rtnValue.Primary_Lic_Type__c : rtnValue.abd_PortalWork_LicenseType__c;

                        if(! $A.util.isEmpty(rtnValue.License_Applications__r)){
                            for(var i=0;i<rtnValue.License_Applications__r.length;i++){
                                ltype = ltype+' '+rtnValue.License_Applications__r[i].abd_License_Type__c;
                            }
                        }
                        
                        component.set("v.app",rtnValue);      // but if it's good, set the applicant value to the result.
                        
                        // polk county occupancy question
                        if(rtnValue.abd_Premise_County__c == 'Polk' && (ltype.includes('BB') || ltype.includes('BW') || ltype.includes('LA') || ltype.includes('LB') || ltype.includes('LC') || ltype.includes('WCN'))) {
                            component.set("v.showOcc",true);
                            noshow = false;
                        }

                        var needPicklistValues = false;
                        // show the bond question
                        if (! $A.util.isEmpty(ltype)) {

                            if(ltype.includes('BB') || ltype.includes('LC') || ltype.includes('LE') || ltype.includes('BA') || ltype.includes('BAA') || ltype.includes('BAN') || ltype.includes('BAAN') || ltype.includes('WA') || ltype.includes('WAN') || ltype.includes('DS')){
                                var show = true;
                                if((ltype.includes('BB') || ltype.includes('LC')) && (!ltype.includes('HPBP') && !ltype.includes('BP')))
                                    show = false;
                                component.set("v.showBond",show);
                                if(show){
                                	noshow = false;
                                	needPicklistValues = true;
                                }
                            }

                            // show Boat question
                            if(ltype.includes('LD') && rtnValue.abd_Other_Criteria__c==='Boat') {
                                component.set("v.showLD",true);
                                noshow = false;
                                //needPicklistValues = true;
                            }

                            // Only perform this call when we need one of the two lists.
                            if (needPicklistValues)
                                this.getPicklistValues(component, event);

                            // Show the dram insurance list
                            if(ltype.includes('BB') || ltype.includes('BW') || ltype.includes('LA') || ltype.includes('LB') || ltype.includes('LC') || ltype.includes('LD') || ltype.includes('WCN')) {
                                component.set("v.showDram",true);
                                noshow = false;
                                this.getDram(component);
                            }

                            // Class A veteran's org and non-profit question
                            if(ltype.includes('LA')) {
                                if(rtnValue.abd_Other_Criteria__c !=='Veteran’s organization open one day per week or 52 days or less per year')
                                    if (! $A.util.isEmpty(rtnValue.abd_Non_profit__c))
                                        if (! $A.util.isEmpty(component.find('nonProf'+rtnValue.abd_Non_profit__c)))
                                            component.find('nonProf'+rtnValue.abd_Non_profit__c).set("v.checked",true);
                            }
                         
                        }
                       // IF THERE IS NOTHING TO DISPLAY ON THIS PAGE, then Leave
                        
                        if (noshow)  {
                            var nextAction = component.getEvent("EmptyComponent");
                            nextAction.fire();
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

     getDram: function(component){
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


    // Call the controller to get the Bond companies and the trains, boats, planes values for the drop down box.
    getPicklistValues: function(component){
        try {
        	console.log('Get Picklist');
            var action = component.get("c.getPicklistValues");    // Set the routine to call in the controller
            action.setCallback(this, function(response){
                try {            
                    var state = response.getState();
                    if (state === 'SUCCESS') {                   // return is a list of bond companys and the plane, train, boat list
                        var application = JSON.parse(JSON.stringify(component.get("v.app")));
                        var list = response.getReturnValue().bond;
                        var opts = [];
                        if($A.util.isEmpty(application.abd_Bond_Company__c))
                            application.abd_Bond_Company__c=list[0];
                        for(var i=0;i<list.length;i++){
                        	var selected = (application.abd_Bond_Company__c===list[i]);
                            opts.push({label:list[i], value:list[i],selected:selected});
                        }
                        component.find("bond").set("v.options",opts);
                        /*list = response.getReturnValue().pVType;
                        opts = [];
                        for(i=0;i<list.length;i++){
                            opts.push({label:list[i], value:list[i]});
                        }
                        component.find("vehicle").set("v.options",opts);*/
                        component.set("v.app",application);
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

            if (component.get("v.showBond") && !application.abd_Bond_Company__c) errmsg += 'Bond Company, ';

            // If any fields were blank, fix up the message to be readable.
            if (errmsg.length !== 0) { 
                errmsg = 'The following fields are required and are missing data: ' + errmsg;
                if (errmsg.endsWith(', ')) errmsg = errmsg.substring(0,errmsg.length-2) + '. ';
            }

            if (!$A.util.isEmpty(application.abd_Occupancy__c))
                if (isNaN(application.abd_Occupancy__c))
                    errmsg = 'Occupancy must be a number';
                else if (!Number.isInteger(Number(application.abd_Occupancy__c)))
                    errmsg = 'Occupancy must be a whole number';
                else if (Number(application.abd_Occupancy__c) < 1)
                    errmsg = 'Occupancy must be a positive number';


            if ($A.util.isEmpty(application.Id)) errmsg = 'It does not appear that you are still logged in or logged in as a valid user.';

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
                var action = component.get("c.upRecordApex");       // Set the routine to call in the controller
                action.setParams({"application": application});         // pass the data to the controller
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