({
    // routine to read an existing license and application.
    getApplication: function(component, event ) {
       try {
            var action = component.get("c.getExistingInfo");
            action.setParams({"recordId": component.get("v.recordId")}); // pass the data to the controller

            action.setCallback(this, function(response){
                try {
                    var state = response.getState();
                    if (state === 'SUCCESS') {
                        if (response.getReturnValue() !== null) {
                            component.set("v.app", response.getReturnValue().application);
                            component.set("v.license", response.getReturnValue().license);
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
            $A.enqueueAction(action);                                           // queue the work.
        }
        // handle browser errors 
        catch(e) {
            alert(e.stack);
        }

    },

    // helper routine to validate the data and then call the apex controller to write the records.
    createLicense: function(component) { 
        var license = component.get("v.license");
        var lt = component.get("v.LicenseTypes");
        var app = component.get("v.app");
        var ltype = component.get("v.lTypes");
        var stateOnly = (!ltype.includes('CB') && !ltype.includes('CV') && !ltype.includes('SP') && !ltype.includes('CD') && !ltype.includes('AC') && !ltype.includes('DS'));
        var action;
        try {
            component.set("v.showError", false); // clear the error message off of the screen
            var NONE = "--None--";

            var errmsg = '';
            // validate that a company name was specified
            var companyName = component.get("v.license.abd_Business_Name__c");
            var companyId = component.get("v.license.MUSW__Primary_Licensee__c");
            console.log(companyId);
            if (($A.util.isUndefined(companyName) || companyName.length === 0) && (!companyId)) errmsg = "An Existing Business must be selected or a company name must be provided.";

            if (errmsg.length === 0) {
                // validate that a license type was selected.
                var licenseType = component.get("v.license.MUSW__Class__c");
                if ($A.util.isUndefined(licenseType) || licenseType.length === 0 || licenseType == NONE) errmsg = "A valid license type must be selected";
            }

            // validate the county and city have a value.
            if (errmsg.length === 0 && stateOnly) {
            	if(app.abd_Premise_County__c == NONE)
            		errmsg = "Please select a Premises County.";
            	if(app.abd_Premise_City__c == NONE){
            		if(errmsg.length !== 0)
            			errmsg+='<br/>';
            		errmsg+= "Please select a Premises City.";
        		}
            }
            // validate required LE questions
            if (errmsg.length === 0 && component.get("v.showLE")) {
            	console.log(app.abd_Sell_Gasoline__c);
            	if(app.abd_Sell_Gasoline__c === undefined || app.abd_Sell_Gasoline__c === null)
            		errmsg = "Please choose Yes or No for the Selling Gas question.";
        		if(app.abd_Square_Footage__c === undefined || app.abd_Square_Footage__c === null){
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
            if(app.abd_Premises_Vehicle_Type__c == NONE)
            	app.abd_Premises_Vehicle_Type__c = null;
            if(app.abd_Premise_County__c == NONE)
            	app.abd_Premise_County__c = null;
        	if(app.abd_Premise_City__c == NONE)
        		app.abd_Premise_City__c = null;
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
                    "license": license,
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

//
//  Litems is the primary license type select list.  This routine populates that list.
//  AND If the class is already set (which means we're showing existing data), then we can build the license length and dependent questions list as well.
//  AND if the license length is set, we can display the add ons 

    getLicenseType: function(component){
        try {
            var action = component.get("c.getLicenseType");                     // apex controller routine
            action.setCallback(this, function(response){
                try {            
                    var state = response.getState();
                    if (state === 'SUCCESS') {
                        var i, selected;
                        var rtnValue = response.getReturnValue();
                        component.set("v.licenseTypeOptions",rtnValue);                    // return value
                        var lClass = component.get("v.license.MUSW__Class__c");
                        var opts = [];
                        // for each license type that we find.
                        for (i = 0; i < rtnValue.length; i++) {
                            selected = false;

                            // if we find the selected entry, save away, then build the license length list as well
                            // We could save away the selected record and build it later, but we might as well do it now.

                            if ((lClass !== null) && (rtnValue[i].name==lClass)) {
                                selected = true;   
                                // Length_options is build and used to populate the input select list
                                // Length_list is the returned list from the apex code
                                // license_length_value is the value in the current license (if one exists)
                                var length_options = [];
                                var length_list = rtnValue[i].lengths;
                                var license_length_value = component.get("v.license.abd_Length__c");
                                for (var j = 0; j < length_list.length; j++) {
                                    var License_selected = (license_length_value !== null) ? (length_list[j] == license_length_value) : false; 
                                    length_options.push({label: length_list[j], value: length_list[j], selected: License_selected });
                                }
                                component.find("licLengths").set("v.options", length_options);

                                // if the length is set, then we can show the addons at this time.
                                if (! $A.util.isUndefined(license_length_value)) {
                                    component.set("v.showRadio",false);
                                    this.getAddons(component);
                                }
                                else {  
                                    // We need to display the dependent questions and calc fees based upon primary type (which is all we know)
                                    this.getDependency(component);                       
                                }
                                        
                            }

                            // back to the list of the classes to display in the list

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


//
//
//
    getLicenseLength: function(component) {
        console.log('Get License Length');
        var licLength = component.get("v.license.abd_Length__c");
        try {
        	var lto = component.get("v.licenseTypeOptions");
        	var available = [];
            for (var i = 0; i < lto.length; i++) {
            	if (lto[i].name == component.get("v.license.MUSW__Class__c"))
                    available = lto[i].lengths;
            }
            var opts = [];
            
            for (var i = 0; i < available.length; i++) {
                var selected = (licLength !== null && licLength == available[i]);
                opts.push({
                    label: available[i],
                    value: available[i], 
                    selected: selected
                });
            } // return value
            component.find("licLengths").set("v.options", opts);
        }

        // handle browser errors 
        catch (e) {
            alert(e.stack);

        }
    },

    // Get the list of add on licenses and privilieges for this license type.component
    //

    getAddons: function(component) {
        try {
            var action = component.get("c.getAddons2"); // apex controller routine
            var license = component.get("v.license");
            action.setParams({"appId": component.get("v.recordId"), "licenseLength" : license.abd_Length__c, "licenseClass" : license.MUSW__Class__c });
            action.setCallback(this, function(response){
                try {            
                    var lTypes = '';
                    var state = response.getState();
                    if (state === 'SUCCESS') {
                        component.set("v.LicenseTypes",response.getReturnValue());                    // return value
                        component.set("v.showRadio",true);

                        lTypes += response.getReturnValue().primary.abd_License_Type__c;

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
                        component.set("v.lTypes",lTypes);

                        // now that we have a list of selected license types - show additional questions and recalc the fees.
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
                    var license = component.get("v.license");
                    if (state === 'SUCCESS') {
                        var list = response.getReturnValue();
                        var opts = [];
                        for (var i = 0; i < list.length; i++) {
                            var aid = (list[i].Id!==undefined)?list[i].Id:'new';
                            opts.push({
                                label: list[i].Name,
                                value: list[i].Id,
                                selected: (component.get("v.license.MUSW__Primary_Licensee__c") == list[i].Id)
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
                /*try {
                    var state = response.getState();
                    if (state === 'SUCCESS') {
                        component.set("v.existingAccounts",response.getReturnValue());                    // return value
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
                }*/
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
                        var appCounty = null; 
                        if (! $A.util.isUndefined(component.get("v.app"))) {
                            var application = JSON.parse(JSON.stringify(component.get("v.app")));
                            appCounty = application.abd_Premise_County__c;  
                        }

                        // populate the county list from the response
                        var list = response.getReturnValue().county;
                        var opts = [];
                        for (var i = 0; i < list.length; i++) {
                            var selected = appCounty !== null ? (list[i] == appCounty): false;
                            opts.push({label: list[i],value: list[i], selected: selected});
                        }
                        component.find("Counties").set("v.options", opts);

                        // If the county is set, then we can see about filling in the city list correctly.
                        if (appCounty !== null )
                            this.getPremiseCity(component);

                        // populate the vehicle types (plane, train, boat)
                        var appVehicle = component.get("v.app.abd_Premises_Vehicle_Type__c");
                        list = response.getReturnValue().pVType;
                        opts = [];
                        for(var i=0;i<list.length;i++){
                            var selected = (list[i] == appVehicle);
                            opts.push({label:list[i], value:list[i], selected: selected});
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
    getDependency: function(component) {
    	var ltype = component.get("v.lTypes");
        component.set("v.showLE", ltype.includes('LE'));
        component.set("v.showSQBC", ltype.includes('BC'));
        component.set("v.showVO", ltype.includes('LA'));
        component.set("v.showLD", ltype.includes('LD'));
        if(component.get("v.license.MUSW__Class__c")!==null && component.get("v.license.abd_Length__c")!==null)
        	this.getFeeSchedule(component);
    },

    // Call the controller to get the Citizenship values for the drop down box.  (not the result, but all of the choices)
    getFeeSchedule: function(component) {
    	var app = component.get("v.app");
        var ltype = component.get("v.lTypes");
        var pop = component.get("v.laPopulation")[app.abd_Premise_City__c];
        if((app.abd_Square_Footage__c===undefined || !isNaN(app.abd_Square_Footage__c)) && (app.Square_Footage_Retail_Area__c===undefined || !isNaN(app.Square_Footage_Retail_Area__c))){
	       var info = {"licenseTypes":ltype,"length":component.get("v.license.abd_Length__c"),"population":pop,
	                	"sqFt":app.abd_Square_Footage__c,"retailSqFt":app.Square_Footage_Retail_Area__c,
	                	"gas":(app.abd_Sell_Gasoline__c=='Yes'?'Sells Gas':(app.abd_Sell_Gasoline__c=='No'?'No Gas':null)),
	                	"vehicleType":(app.abd_Premises_Vehicle_Type__c!='--None--')?app.abd_Premises_Vehicle_Type__c:null,
	                	"members":(app.abd_More_Than_250_Members__c=='Yes')?true:(app.abd_More_Than_250_Members__c=='No')?false:null,"vo":(app.abd_Veterans_Organization__c=='Yes')?true:(app.abd_Veterans_Organization__c=='No')?false:null};
	        try {
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
	        } catch (e) {
	            alert(e);
	        }
        }
    },

    handleClassParam: function(component) {
        try {
    	// the function that reads the url parameters
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
            component.set("v.license.MUSW__Class__c", getUrlParameter('dLT'));
            // If the value isn't set, then go get it from the query string.
            var curRecId = component.get("v.recordId");
                if ($A.util.isUndefined(curRecId) || curRecId == '0') component.set("v.recordId", getUrlParameter('recordId'));

        } catch(e) {alert(e.stack);} 
    }
})