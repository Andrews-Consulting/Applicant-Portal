({

    // helper routine to validate the data and then call the apex controller to write the records.
    createLicense: function(component) { 
        var newLicense = component.get("v.newLicense");
        var lt = component.get("v.LicenseTypes");
        var app = component.get("v.app");
        var ltype = component.get("v.lTypes");
        var action;
        try {
            component.set("v.showError", false); // clear the error message off of the screen
            var NONE = "--None--";

            var errmsg = '';
            // validate that a company name was specified
            var companyName = component.get("v.newLicense.abd_Business_Name__c");
            var companyId = component.get("v.newLicense.MUSW__Primary_Licensee__c");
            console.log(companyId);
            if ((companyName === null || companyName.length === 0) && (!companyId)) errmsg = "An Existing Business must be selected or a company name must be provided.";

            var licenseType = component.get("v.newLicense.MUSW__Class__c");
            if (errmsg.length === 0) {
                // validate that a license type was selected.
                if (licenseType === null || licenseType.length === 0 || licenseType == NONE) errmsg = "A valid license type must be selected";
            }


            var alertcnt = component.get("v.alertcnt");
            var licenselength = component.get("v.newLicense.abd_Length__c");
            if (errmsg.length === 0 && (licenselength ==='6 months' || licenselength ==='8 months') && ltype.has68MonthRestriction && alertcnt == 0) {
                var alertmsg = 'Please note that this type of license has a mandatory two month waiting period '; 
                    alertmsg += 'before another similar license can be issued for the same location. ';
                    alertmsg += 'Please consider a 12 month license if this is not a seasonal location.';
                    alert(alertmsg);
                    errmsg = "Please make changes needed and press Next to continue";
                    component.set("v.alertcnt",1);
            }

            //got to have these values to move forward.
            if ($A.util.isEmpty(lt) || $A.util.isEmpty(ltype)) {
                errmsg ="Please Select a valid license length";
            }

            
            // validate the county and city have a value.
            if (errmsg.length === 0 && !$A.util.isEmpty(lt.primary.PremisesMustBeIowa__c) && lt.primary.PremisesMustBeIowa__c) {
            	if(app.abd_Premise_County__c == NONE)
            		errmsg+= "Please select a Premises County.";
            	if(app.abd_Premise_City__c == NONE){
            		if(errmsg.length !== 0)
            			errmsg+='<br/>';
            		errmsg+= "Please select a Premises City.";
        		}
            }
            if (errmsg.length === 0) {
            	if(app.abd_Premise_State__c == NONE)
            		errmsg = "Please select a Premises State.";
        	}
            // validate required LE questions
            if (errmsg.length === 0 && component.get("v.showLE")) {
            	if($A.util.isEmpty(app.abd_Other_Criteria__c) || (app.abd_Other_Criteria__c != 'Sells Gas' && app.abd_Other_Criteria__c != 'No Gas' )) {
                    if(errmsg.length !== 0)
                        errmsg+='<br/>';
            		errmsg = "Please choose Yes or No for the Selling Gas question.";
                }
            }


            if (errmsg.length === 0 && component.get("v.showSQLE")) {
        		if($A.util.isEmpty(app.abd_Square_Footage__c)) {
        			if(errmsg.length !== 0)
            			errmsg+='<br/>';
            		errmsg+= "Please provide a value for the Square Footage question.";
        		}
            }
            // validate required BC questions
            if (errmsg.length === 0 && component.get("v.showSQBC")) {
            	if(app.Square_Footage_Retail_Area__c === null)
            		errmsg = "Please provide a value for the Retail Square Footage question.";
            }
            // validate required LA questions
            if (errmsg.length === 0 && component.get("v.showVO")) {
            	if(app.abd_Veterans_Organization__c === null)
            		errmsg = "Please choose Yes or No for the Veteran's Organization question.";
        		if(app.abd_Veterans_Organization__c === 'No' && (app.abd_More_Than_250_Members__c === undefined || app.abd_More_Than_250_Members__c === null)){
        			if(errmsg.length !== 0)
            			errmsg+='<br/>';
            		errmsg+= "Please choose Yes or No for the Club Members question.";
        		}
            }
            // validate required LD questions
            if (errmsg.length === 0 && component.get("v.showLD")) {
            	if(app.abd_Premises_Vehicle_Type__c == NONE)
            		errmsg = "Please select a Premises Vehicle Type.";
            }
            
            // Null values from picklists
            if (errmsg.length === 0) {
                if(app.abd_Premises_Vehicle_Type__c == NONE)
                	app.abd_Premises_Vehicle_Type__c = null;
                if(app.abd_Premise_County__c == NONE)
                	app.abd_Premise_County__c = null;
            	if(app.abd_Premise_City__c == NONE)
            		app.abd_Premise_City__c = null;
                if(app.abd_Premise_State__c == NONE)
            		app.abd_Premise_State__c = null;
            }
                // If there is an error message, then display the error message, clear the spinner and leave.
            if (errmsg.length !== 0) {
                component.set("v.errorMessage", errmsg);
                component.set("v.showError", true);
                action = component.getEvent("SaveCompleted");
                action.setParams({"Component" : component, "Action": "Fail" });
                action.fire();
            } else {
                // Else prepare to call the APEX controller to write the records out.
                action = component.get("c.createNewL");
                action.setParams({
                    "license": newLicense,
                    "lts": JSON.stringify(lt),
                    "app": app
                });

                action.setCallback(this, function(response){
                    try{                 
                        var state = response.getState();
                        // if call was successful and the function was successul
                        if (state === 'SUCCESS' && response.getReturnValue().substr(0,8) === 'SUCCESS:') {

                            // for later on, let's save application ID away for now.
                            component.set("v.recordId", response.getReturnValue().substr(9));

                            // INSERT IS COMPLETE, NOW TO CHANGE THE STATUS
                            var InnerAction = component.get("c.UpdateLicenseStatus");
                            InnerAction.setParams({"appId": component.get("v.recordId")});
                            InnerAction.setCallback(this, function(response){
                                var InnerCBAction = component.getEvent("SaveCompleted");
                                try {
                                    if (state === 'SUCCESS') InnerCBAction.setParams({"Component" : component, "Action": "Saved", "AppId":component.get("v.recordId") });
                                    else {
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
                                        InnerCBAction.setParams({"Component" : component, "Action": "Fail" });
                                    }
                                } catch(e) {
                                    alert(e.stack);
                                    InnerCBAction.setParams({"Component" : component, "Action": "Fail" });
                                }
                                finally {
                                    // always fire this action.  parms are set.                
                                    InnerCBAction.fire();
                                }
                            });
                            $A.enqueueAction(InnerAction);  
                         
                        // ELSE FOR THE First CallBack Routine
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
                            var CBAction = component.getEvent("SaveCompleted");
                            component.set("v.showError",true);
                            CBAction.setParams({"Component" : component, "Action": "Fail" });
                            CBAction.fire();
                        }
                    } catch(e) {
                        var CBAction = component.getEvent("SaveCompleted");
                        alert(e.stack);
                        CBAction.setParams({"Component" : component, "Action": "Fail" });
                        CBAction.fire();
                    }
                    finally {
                        // We only fire on error conditions in this case            
                        
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

    getLicenseType: function(component){
        try {
            var NONE = "--None--";
            var action = component.get("c.getLicenseType");                     // apex controller routine

            action.setCallback(this, function(response){
                try {            
                    var state = response.getState();
                    if (state === 'SUCCESS') {
                        var i, selected;
                        var lt = 0;     // number of items in the length drop downs - may not change if no license type is selected
                        var rtnValue = response.getReturnValue();
                        component.set("v.licenseTypeOptions",rtnValue);                    // return value
                        var lClass = component.get("v.newLicense.MUSW__Class__c");
                        // build the dropdown list for all of the valid license types
                        var opts = [];
                        for (i = 0; i < rtnValue.length; i++) {
                            selected = false;
                            // if class exists, then if we find the matching entry, mark it as selected (Prefill the dropdown)
                            if(!$A.util.isEmpty(lClass) ){
                                if((rtnValue[i].name==lClass)){
                                    selected = true;
                                    // We can start to set all sorts of things
                                    this.setLicenseLengthOptions(component, rtnValue, lClass);   
                                    // chained event, since I need the license type 
                                    this.setValueDefaults(component);
                                }
                            }
                            else    // if class is null, then just select the first entry (--none--)
                                selected = (i === 0);
                            
                            opts.push({
                                label: rtnValue[i].name,
                                value: rtnValue[i].name,
                                selected: selected
                            });
                        }
                        component.find("lItems").set("v.options", opts);

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


    // this routine is called when they change the license type drop down and we need to reset some fields.
    setValueDefaults: function(component){

        var activeTypes = component.get("v.lTypes");
        var application = component.get("v.app");
 
        if (activeTypes.includes(" LA ")) {
           this.TestAndClear(component.find("VOYes"));
           this.TestAndClear(component.find("VONo"));
           this.TestAndClear(component.find("clubMembersYes"));
           this.TestAndClear(component.find("clubMembersNo"));
        }
        if (activeTypes.includes(" LE ")) {
            if (application.abd_Other_Criteria__c == 'Sells Gas')
                this.TestAndCheck(component.find("gasYes"));
            else 
                this.TestAndClear(component.find("gasYes"));
            if (application.abd_Other_Criteria__c == 'No Gas')
                this.TestAndCheck(component.find("gasNo"));
            else 
                this.TestAndClear(component.find("gasNo"));            
        }

        if (activeTypes.includes(" LD ")) {
            var opts = component.find("vehicle").get("v.options");
            var selected = false;
            for (i=0; i < opts.length; i++) {
                if (opts[i].label == application.abd_Other_Criteria__c) 
                    selected = true;
                opts[i].selected = (opts[i].label == application.abd_Other_Criteria__c);
            }
            if (!selected)
                opts[0].selected = true;
            component.find("vehicle").set("v.options",opts);
       }

    },


   setLicenseLengthOptions: function(component, licenseTypeOptions, classValue) {
        console.log('Set License Length');
        var i;
        var NONE = "--None--";
        component.set("v.app.abd_Other_Criteria__c",null);       // clear this out
        try {
            var available = [];
            for (i = 0; i < licenseTypeOptions.length; i++) {
                if (licenseTypeOptions[i].name == classValue){
                    available = licenseTypeOptions[i].lengths;
                    component.set("v.lTypes"," "+licenseTypeOptions[i].ltype+" ");
                    if (licenseTypeOptions[i].premisesMustBeIowa)
                            component.set("v.StateMustBeIowa",true);
                    else
                            component.set("v.StateMustBeIowa",false);
                    break;
                }
            }
            var opts = [];
            for (i = 0; i < available.length; i++) {
                opts.push({
                    label: available[i],
                    value: available[i]
                });
            } // return value
            component.find("licLengths").set("v.options", opts);

            // if there is only one length, then go get the addons for this license.
            if (available.length == 1 && available[0] != NONE) {
                this.getAddons(component);
            }
            else
                this.getDependency(component);


        }
        catch (e) {
            alert(e.stack);
        }
   },

   // call the common routine
    getLicenseLength: function(component) {
        this.setLicenseLengthOptions(component, component.get("v.licenseTypeOptions"), component.get("v.newLicense.MUSW__Class__c"));
    },
    getAddons: function(component) {
        try {
            var newLicense = component.get("v.newLicense");
            var lTypes = '';
            var action = component.get("c.getAddons"); // apex controller routine
            action.setParams({"license": newLicense});
            action.setCallback(this, function(response){
                try {            
                    var state = response.getState();
                    if (state === 'SUCCESS') {
                        component.set("v.LicenseTypes",response.getReturnValue());                    // return value
                        component.set("v.showRadio",true);

                        if (response.getReturnValue().primary.PremisesMustBeIowa__c)
                            component.set("v.StateMustBeIowa",true);
                        else
                            component.set("v.StateMustBeIowa",false);

                        lTypes += ' '+response.getReturnValue().primary.abd_License_Type__c;


                        // get the optional licenses
                        var opp = response.getReturnValue().optional;
                        for (var i = 0; i < opp.length; i++) {
                            if (opp[i].selected)
                                lTypes += (' ' + opp[i].ltype.abd_License_Type__c);
                        }
                        // get the included licenses 
                        var inc = response.getReturnValue().included;
                        for (var i = 0; i < inc.length; i++) {
                            if (inc[i].selected)
                                lTypes += (' ' + inc[i].ltype.abd_License_Type__c);
                        }
                        component.set("v.lTypes",lTypes+' ');
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
    getAccounts: function(component){
        try {
            var action = component.get("c.getAccounts");                     // apex controller routine
            action.setCallback(this, function(response){
            	try {
                    var state = response.getState();
                    var newLicense = component.get("v.newLicense");
                    if (state === 'SUCCESS') {
                        var list = response.getReturnValue();
                        if ($A.util.isEmpty(list)) {
                            alert('This user is not set up correctly.');
                            return;
                        }
                        var opts = [];
                        for (var i = 0; i < list.length; i++) {
                            var aid = (list[i].Id!==undefined)?list[i].Id:'new';
                            opts.push({
                                label: list[i].Name,
                                value: list[i].Id,
                                selected: (component.get("v.newLicense.MUSW__Primary_Licensee__c") == list[i].Id)
                            });
                            console.log(aid);
                        }
                        component.find("accountName").set("v.options", opts);
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


    getPremiseCity: function(component) {
        try {
            var action = component.get("c.getPremiseCity"); // Set the routine to call in the controller
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
                           map[list[i].Name] = list[i].abd_Population__c;
                        }
                        component.find("city").set("v.options", opts);
                        component.set("v.laPopulation",map);
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
    getPicklistValues: function(component) {
        try {
            var action = component.get("c.getPicklistValues"); // Set the routine to call in the controller
            action.setCallback(this, function(response) {
                try {            
                    var state = response.getState();
                    if (state === 'SUCCESS') {
                        var application = JSON.parse(JSON.stringify(component.get("v.app")));

                        // populate the county list from the response
                        var list = response.getReturnValue().county;
                        var opts = [];
                        for (var i = 0; i < list.length; i++) {
                            opts.push({label: list[i],value: list[i]});
                        }
                        component.find("Counties").set("v.options", opts);

                        // populate the vehicle types (plane, train, boat)
                        list = response.getReturnValue().pVType;
                        opts = [];
                        for(var i=0;i<list.length;i++){
                            opts.push({label:list[i], value:list[i]});
                        }
                        component.find("vehicle").set("v.options",opts);
                    	list = response.getReturnValue().state;
                        opts = [];
                        for(var i=0;i<list.length;i++){
                            opts.push({label:list[i], value:list[i]});
                        }
                        component.find("States").set("v.options",opts);
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
    // Call the controller to get the Citizenship values for the drop down box.  (not the result, but all of the choices)
    getHelpText: function(component) {
        try {
            var action = component.get("c.getHelpText"); // Set the routine to call in the controller
            action.setCallback(this, function(response) {
                try {            
                    var state = response.getState();
                    if (state === 'SUCCESS') {
                        component.set("v.helpText",response.getReturnValue());
                        console.log(response.getReturnValue());
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

    // TODO: replace with looking through configuration instead of hard coding for premise state - component.get("v.licenseTypeOptions")
    getDependency: function(component) {
        if (!$A.util.isEmpty(component.get("v.lTypes"))) {
        	var ltype = component.get("v.lTypes");
            component.set("v.showLE", ltype.includes('LE'));
            component.set("v.showSQBC", ltype.includes('BC'));
            component.set("v.showSQLE", ltype.includes('LE'));
            component.set("v.showVO", ltype.includes('LA'));
            component.set("v.showLD", ltype.includes('LD'));
            if (component.get("v.StateMustBeIowa")) {
                component.set("v.app.abd_Premise_State__c",'IA');
            }
            else
                component.set("v.app.abd_Premise_State__c",'--None--');

            if(component.get("v.newLicense.MUSW__Class__c")!==null && component.get("v.newLicense.MUSW__Class__c")!== '--None--' ){
    	        // if(component.get("v.newLicense.abd_Length__c") !==null && component.get("v.newLicense.abd_Length__c") != '--None--')
    	        	this.getFeeSchedule(component);
            }
        }
    },

    // Call the controller to get the Citizenship values for the drop down box.  (not the result, but all of the choices)
    getFeeSchedule: function(component) {
        try {
        	var app = component.get("v.app");
            var ltype = component.get("v.lTypes");
            // var possibleLicenseTypes = component.get("v.LicenseTypes");     // Add ons
            // if ($A.util.isEmpty(possibleLicenseTypes))
            //     possibleLicenseTypes = null;                

            var pop = component.get("v.laPopulation")[app.abd_Premise_City__c];
            var sqftValue = 1;

            if (ltype.includes(" LE ") || ltype.includes(" BC "))
                if(!$A.util.isEmpty(app.abd_Square_Footage__c) && Number.isInteger(Number(app.abd_Square_Footage__c)))
                    sqftValue = Number(app.abd_Square_Footage__c);
            
	        var info = {"selectedLicenseTypes":ltype,"length":component.get("v.newLicense.abd_Length__c"),"population":pop,
	                	"sqFt":sqftValue, "otherCriteria": app.abd_Other_Criteria__c};
                        // "possibleLicenseTypes": possibleLicenseTypes};

            var estimateError = "";
            // validate that we have enough fields to proceeed and if we don't, save a call to the server.
            if (sqftValue == 1 && (ltype.includes(" LE ") || ltype.includes(" BC ")))
                estimateError = "Enter square foot value to display cost.";
            else 
                if ($A.util.isEmpty(pop) && (ltype.includes(" LA ") || 
                                             ltype.includes(" LB ") ||  
                                             ltype.includes(" LC ") || 
                                             ltype.includes(" LE ") || 
                                             ltype.includes(" BB ") || 
                                             ltype.includes(" BW ")))
                estimateError = "Select a City and County to display cost.";
                else
                    if ($A.util.isEmpty(component.get("v.newLicense.abd_Length__c")) || component.get("v.newLicense.abd_Length__c") == '--None--')
                        estimateError = "Select length of license to display cost";
                    else
                        if ($A.util.isEmpty(app.abd_Other_Criteria__c)) {
                            if (ltype.includes(" LA "))
                                estimateError = "Please answer the Veterans and/or Membership questions to display cost";
                            if (ltype.includes(" LD "))
                                estimateError = "Please Select the vehicle type to display cost";
                            if (ltype.includes(" LE "))
                                estimateError = "Please answer the \'Sells Gas\' question to display cost";
                        }

            if (estimateError !== "") {
                component.set("v.estimate",estimateError);
            }
            else {
                var action = component.get("c.getFeeSchedule"); // Set the routine to call in the controller
                action.setParams({
                    "appInfo": JSON.stringify(info)
                });action.setCallback(this, function(response) {
                    try {            
                        var state = response.getState();
                        if (state === 'SUCCESS') {
                            // good!
                            component.set("v.estimate",response.getReturnValue());
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
        } catch (e) {
            alert(e.stack);
        }
    },
    handleClassParam: function(component) {
    	// the function that reads the url parameters
        var getUrlParameter = function getUrlParameter(sParam) {
            var sPageURL = decodeURIComponent(window.location.search.substring(1)),
                sURLVariables = sPageURL.split('&'),
                sParameterName,
                i;

            for (i = 0; i < sURLVariables.length; i++) {
                sParameterName = sURLVariables[i].split('=');

                if (sParameterName[0] === sParam) {
                    return sParameterName[1] === undefined ? true : sParameterName[1].replace(/\+/g,' ');
                }
            }
        };
        component.set("v.newLicense.MUSW__Class__c", getUrlParameter('dLT'));
    },
    checkLicenseEligibility: function(component){
    	var accId = component.get("v.newLicense.MUSW__Primary_Licensee__c");
    	var length = component.get("v.newLicense.abd_Length__c");
        var ltype = component.get("v.lTypes");
        var rightType = (ltype.includes('WCN') || ltype.includes('LA') || ltype.includes('LD') || ltype.includes('MD') || ltype.includes('LE') || 
        				ltype.includes('LB') || ltype.includes('LC') || ltype.includes('BW') || ltype.includes('BB') || ltype.includes('WB') || 
        				ltype.includes('WBN') || ltype.includes('BC'));
		if(accId!==null && ((length==='6 months' || length==='8 months') && rightType)){
        	try {
	            var action = component.get("c.isEligible"); // Set the routine to call in the controller
	            action.setParams({"AccountId": component.get("v.newLicense.MUSW__Primary_Licensee__c"),"LicenseTypes":ltype});
	            action.setCallback(this, function(response) {
	                try {            
	                    var state = response.getState();
	                    if (state === 'SUCCESS') {
	                    	if(response.getReturnValue()===true){
	                    		this.createLicense(component);
	                    	}
	                    	else{
                                var msg = "If you are applying for a license for the same location that had a similar 6 or 8 month license and you haven't met the two month waiting period requirement, the application process will not be allowed to complete.  The validation will occur prior to paying fees.  If you know the waiting period requirement has not been met, please don't proceed any further.";
	                    		component.set("v.errorMessage",msg );
	                    		component.set("v.showError",true);
	                    		action = component.getEvent("SaveCompleted");
				                action.setParams({"Component" : component, "Action": "Fail" });
				                action.fire();
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
	                            action = component.getEvent("SaveCompleted");
				                action.setParams({"Component" : component, "Action": "Fail" });
				                action.fire();      
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
        }else{
        	this.createLicense(component);
        }
    },

    TestAndCheck: function (component) {
        if (!$A.util.isEmpty(component)) 
            component.set("v.checked",true);
    },
        TestAndClear: function (component) {
        if (!$A.util.isEmpty(component)) 
            component.set("v.checked",false);
    }
})