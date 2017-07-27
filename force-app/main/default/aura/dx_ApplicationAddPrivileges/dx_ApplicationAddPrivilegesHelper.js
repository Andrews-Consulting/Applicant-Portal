({
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
                        this.getAppAddons(component);
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
     getAppAddons: function(component) {
        try {
            var lic = component.get("v.lic");
            var lTypes = '';
            var action = component.get("c.getAppAddons"); // apex controller routine
            var existing = '';
            if(lic.Licenses__r){
	            for(var i = 0;i<lic.Licenses__r.length;i++){
	            	if(existing !== '')
	            		existing+=';';
	            	existing+=lic.Licenses__r[i].abd_LicenseType__c;	
	            }
            }
            action.setParams({"license": lic,"existingIds":existing});
            action.setCallback(this, function(response){
                try {            
                    var state = response.getState();
                    if (state === 'SUCCESS') {
                        var lt = response.getReturnValue();                    // return value
                        console.log(lt);
                        console.log(lt.existing);
                        // get the optional licenses
                        var opp = (lt.optional !== null && lt.optional !== undefined)?lt.optional:[];
                        for (var i = 0; i < opp.length; i++) {
                            if(opp[i].selected)
                            	lTypes+=(lTypes==='')?opp[i].ltype.abd_License_Type__c:(' '+opp[i].ltype.abd_License_Type__c);
                            if(lTypes.includes('WB') && opp[i].ltype.abd_License_Type__c==='WBN')
                            	opp[i].required = true;
                        }
                        // get the included licenses 
                        var inc = (lt.included !== null && lt.included !== undefined)?lt.included:[];
                        for (var i = 0; i < inc.length; i++) {
                            if(inc[i].selected)
                            	lTypes+=(lTypes==='')?inc[i].ltype.abd_License_Type__c:(' '+inc[i].ltype.abd_License_Type__c);
                        }
                        component.set("v.LicenseTypes",lt);
                        component.set("v.showRadio",true);
                        component.set("v.lTypes",lTypes);
                        this.getDependency(component);                    
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
            $A.enqueueAction(action); // queue the work.
        }

        // handle browser errors 
        catch (e) {
            alert(e);
        }
    },
    // helper routine to validate the data and then call the apex controller to write the records.
    createAddApp: function(component) { 
        var lt = component.get("v.LicenseTypes");
        var lic = component.get("v.lic");
        var os = component.get("v.os");
        var NONE = '--None--';
        var action;
        try {
            component.set("v.showError", false); // clear the error message off of the screen
            var errmsg = '';
            // validate required LE questions
            if (errmsg.length === 0 && component.get("v.showLE")) {
            	if(lic.abd_Sell_Gasoline__c === undefined || lic.abd_Sell_Gasoline__c === null)
            		errmsg = "Please choose Yes or No for the Selling Gas question.";
        		if(lic.abd_Square_Footage__c === undefined || lic.abd_Square_Footage__c === null){
        			if(errmsg.length !== 0)
            			errmsg+='<br/>';
            		errmsg+= "Please provide a value for the Square Footage question.";
        		}
            }
            // validate required BC questions
            if (errmsg.length === 0 && component.get("v.showSQBC")) {
            	if(lic.abd_Square_Footage_Retail_Area__c === undefined || lic.abd_Square_Footage_Retail_Area__c === null)
            		errmsg = "Please provide a value for the Retail Square Footage question.";
            }
            // validate required LA questions
            if (errmsg.length === 0 && component.get("v.showVO")) {
            	if(lic.abd_Veterans_Organization__c === undefined || lic.abd_Veterans_Organization__c === null)
            		errmsg = "Please choose Yes or No for the Veteran's Organization question.";
        		if(lic.abd_Veterans_Organization__c === 'No' && (lic.abd_More_Than_250_Members__c === undefined || lic.abd_More_Than_250_Members__c === null)){
        			if(errmsg.length !== 0)
            			errmsg+='<br/>';
            		errmsg+= "Please choose Yes or No for the Club Members question.";
        		}
            }
            // validate required LD questions
            if (errmsg.length === 0 && component.get("v.showLD")) {
            	if(lic.abd_Premise_Vehicles_Type__c == NONE)
            		errmsg = "Please select a Premises Vehicle Type.";
            }
            
            // Null values from picklists
            if(lic.abd_Premise_Vehicles_Type__c == NONE)
            	lic.abd_Premise_Vehicles_Type__c = null;
            
            // If there is an error message, then display the error message, clear the spinner and leave.
            if (errmsg.length !== 0) {
                component.set("v.errorMessage", errmsg);
                component.set("v.showError", true);
                action = component.getEvent("SaveCompleted");
                action.setParams({"Component" : component, "Action": "Fail" });
                action.fire();
            } else {
                // Else prepare to call the APEX controller to write the records out.
                action = component.get("c.createAddApp");
                action.setParams({
                    "lts": JSON.stringify(lt),
                    "license": lic,
                    "os": os
                });

                action.setCallback(this, function(response){
                    var action = component.getEvent("SaveCompleted");
                    try{                 
                        var state = response.getState();
                        var rtValue = (response.getReturnValue()!==null)?response.getReturnValue().toString():null;
                        console.log(response.getReturnValue());
                        // if call was successful and the function was successul
                        if (state === 'SUCCESS' && rtValue!==null && rtValue.substr(0,8) === 'SUCCESS:') {

                            // for later on, let's save application ID away for now.
                            component.set("v.recordId", rtValue.substr(9));
                            action.setParams({"Component" : component, "Action": "Saved", "AppId": rtValue.substr(9) });
                        }
                        else {      // error or incomplete comes here
                            var errors = response.getError();
                            if (errors && errors.length) {
                                for (var erri = 0; erri < errors.length; erri++) {
                                    component.set("v.errorMessage", component.get("v.errorMessage") + " : " + errors[erri].message );
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
                $A.enqueueAction(action);                                             // enqueue the call 
            }
        }
        // handle browser errors by turning off the spinner and displaying the message
        catch (e) {
            alert(e.stack);
            action = component.getEvent("SaveCompleted");
            action.setParams({"Component" : component, "Action": "Fail" });
            action.fire();            
        }
    },
    // Call the controller to get the Citizenship values for the drop down box.  (not the result, but all of the choices)
    getPicklistValues: function(component) {
        try {
            var action = component.get("c.getPicklistValues"); // Set the routine to call in the controller
            action.setCallback(this, function(response) {
                try {            
                    var state = response.getState();
                    if (state === 'SUCCESS') {
                        // populate the vehicle types (plane, train, boat)
                        var list = response.getReturnValue().pVType;
                        var opts = [];
                        for(var i=0;i<list.length;i++){
                            opts.push({label:list[i], value:list[i]});
                        }
                        component.find("vehicle").set("v.options",opts);
     
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
    getDependency: function(component) {
    	var ltype = component.get("v.lTypes");
        component.set("v.showLE", ltype.includes('LE'));
        component.set("v.showSQBC", ltype.includes('BC'));
        component.set("v.showVO", ltype.includes('LA'));
        component.set("v.showLD", ltype.includes('LD'));
        component.set("v.showOutdoor",ltype.includes('P-OS'));
        if(ltype.includes('LD'))
        	this.getPicklistValues(component);
    }
})