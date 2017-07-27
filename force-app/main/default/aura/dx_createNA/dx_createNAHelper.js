({

    // helper routine to validate the data and then call the apex controller to write the records.
    createLicense: function(component) { 
        var newLicense = component.get("v.newLicense");
        var lt = component.get("v.LicenseTypes");
        var app = component.get("v.app");
        var ltype = component.get("v.lTypes");
        var stateOnly = (!ltype.startsWith('CB') && !ltype.startsWith('CV') && !ltype.startsWith('SP') && !ltype.startsWith('CD') && !ltype.startsWith('AC') && !ltype.startsWith('DS'));
        var action;
        try {
            component.set("v.showError", false); // clear the error message off of the screen
            var NONE = "--None--";

            var errmsg = '';
            // validate that a company name was specified
            var companyName = component.get("v.newLicense.abd_Business_Name__c");
            var companyId = component.get("v.newLicense.MUSW__Primary_Licensee__c");
            if ((companyName === null || companyName.length === 0) && (!companyId)) errmsg = "An Existing Business must be selected or a company name must be provided.";

            if (errmsg.length === 0) {
                // validate that a license type was selected.
                var licenseType = component.get("v.newLicense.MUSW__Class__c");
                if (licenseType === null || licenseType.length === 0 || licenseType == NONE) errmsg = "A valid license type must be selected";
            }

            // validate that a date was specified and that it's for today or in the future.
            /*if (errmsg.length === 0) {
                var effectiveDate = component.get("v.newLicense.abd_Effective_Date__c");
                if (effectiveDate === null || effectiveDate.length === 0) errmsg = "An effective date must be provided.";
                var dt = new Date();
                dt.setMonth(dt.getMonth() - 1);
                var todaycmp = (dt).toISOString().substring(0, 10);
                dt = new Date();
                dt.setMonth(dt.getMonth() + 12);
                var future = (dt).toISOString().substring(0, 10);
                if (effectiveDate < todaycmp) errmsg = "The effective date must not be older than 1 month ago.";
                if (effectiveDate > future) errmsg = "The effective date must be no more than 12 months from now.";
            }*/
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
            if (errmsg.length === 0) {
            	if(app.abd_Premise_State__c == NONE)
            		errmsg = "Please select a Premises State.";
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
            	if(app.Square_Footage_Retail_Area__c === undefined || app.Square_Footage_Retail_Area__c === null)
            		errmsg = "Please provide a value for the Retail Square Footage question.";
            }
            // validate required LA questions
            if (errmsg.length === 0 && component.get("v.showVO")) {
            	if(app.abd_Veterans_Organization__c === undefined || app.abd_Veterans_Organization__c === null)
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
                    var action = component.getEvent("SaveCompleted");
                    try{                 
                        var state = response.getState();
                        // if call was successful and the function was successul
                        if (state === 'SUCCESS' && response.getReturnValue().substr(0,8) === 'SUCCESS:') {

                            // for later on, let's save application ID away for now.
                            component.set("v.recordId", response.getReturnValue().substr(9));
                            action.setParams({"Component" : component, "Action": "Saved", "AppId": response.getReturnValue().substr(9) });
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

    getLicenseType: function(component){
        try {
            var action = component.get("c.getLicenseType");                     // apex controller routine
            var lClass = component.get("v.newLicense.MUSW__Class__c");
            var index = 0;

            action.setCallback(this, function(response){
                try {            
                    var state = response.getState();
                    if (state === 'SUCCESS') {
                        var i, selected;
                        var rtnValue = response.getReturnValue();
                        component.set("v.licenseTypeOptions",rtnValue);                    // return value
                        var opts = [];
                        for (var i = 0; i < rtnValue.length; i++) {
                            var selected = false;
                            if(lClass !== null){
                                if((rtnValue[i].name==lClass)){
                                    selected = true;
                                    index = i;
                                }
                            }else{
                                selected = (i === 0);
                            }
                            var selected = (lClass !== null)?(rtnValue[i].name==lClass):(i === 0);
                            opts.push({
                                label: rtnValue[i].name,
                                value: rtnValue[i].name,
                                selected: selected
                            });
                        }
                        component.find("lItems").set("v.options", opts);
                        opts = [];
                        var lt = rtnValue[index].lengths;
                        for (var i = 0; i < lt.length; i++) {
                            var selected = (i === 0);
                            opts.push({
                                label: lt[i],
                                value: lt[i],
                                selected: selected
                            });
                        }
                        component.find("licLengths").set("v.options", opts);
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

    getLicenseLength: function(component) {
        console.log('Get License Length');
        try {
        	var lto = component.get("v.licenseTypeOptions");
        	var available = [];
        	var aT = '';
        	var ltype='';
            for (var i = 0; i < lto.length; i++) {
            	if (lto[i].name == component.get("v.newLicense.MUSW__Class__c")){
                    available = lto[i].lengths;
                    aT = lto[i].available;
                    ltype = lto[i].code;
                    break;
                }
            }
            var opts = [];
            var aL = '';
            for (var i = 0; i < available.length; i++) {
            	if(i !== 0){
            		if(i !== 1)
            			aL += ';';
            		aL += available[i];
            	}
                opts.push({
                    label: available[i],
                    value: available[i]
                });
            } // return value
            component.find("licLengths").set("v.options", opts);
            component.set("v.availableLength",aL);
            component.set("v.availableType",aT);
            component.set("v.lTypes",ltype);
        }

        // handle browser errors 
        catch (e) {
            alert(e.stack);

        }
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
                    if (state === 'SUCCESS') {
                        var list = response.getReturnValue();
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
    getDependency: function(component) {
    	var ltype = component.get("v.lTypes");
        component.set("v.showLE", ltype.includes('LE'));
        component.set("v.showSQBC", ltype.includes('BC'));
        component.set("v.showVO", ltype.includes('LA'));
        component.set("v.showLD", ltype.includes('LD'));
        if(component.get("v.newLicense.MUSW__Class__c")!=='--None--')
        	this.getFeeSchedule(component);
    },

    // Call the controller to get the Citizenship values for the drop down box.  (not the result, but all of the choices)
    getFeeSchedule: function(component) {
    	var app = component.get("v.app");
    	var pop = component.get("v.laPopulation")[app.abd_Premise_City__c];
        var length = (component.get("v.newLicense.abd_Length__c")==null || component.get("v.newLicense.abd_Length__c")=='--None--')?component.get("v.availableLength"):component.get("v.newLicense.abd_Length__c");
        console.log(app.abd_Square_Footage__c);
        console.log(app.Square_Footage_Retail_Area__c);
        console.log((app.abd_Square_Footage__c===undefined || !isNaN(app.abd_Square_Footage__c)) && (app.Square_Footage_Retail_Area__c===undefined || !isNaN(app.Square_Footage_Retail_Area__c)));
        if((app.abd_Square_Footage__c===undefined || !isNaN(app.abd_Square_Footage__c)) && (app.Square_Footage_Retail_Area__c===undefined || !isNaN(app.Square_Footage_Retail_Area__c))){
	       var info = {"licenseTypes":component.get("v.lTypes"),"length":length,"population":pop,"members":(app.abd_More_Than_250_Members__c=='Yes')?true:(app.abd_More_Than_250_Members__c=='No')?false:null,
	                	"sqFt":(app.abd_Square_Footage__c!=='')?app.abd_Square_Footage__c:0,"retailSqFt":(app.Square_Footage_Retail_Area__c!=='')?app.Square_Footage_Retail_Area__c:0,
	                	"gas":(app.abd_Sell_Gasoline__c=='Yes'?'Sells Gas':(app.abd_Sell_Gasoline__c=='No'?'No Gas':null)),
	                	"vehicleType":(app.abd_Premises_Vehicle_Type__c!='--None--')?app.abd_Premises_Vehicle_Type__c:null,
	                	"vo":(app.abd_Veterans_Organization__c=='Yes')?true:(app.abd_Veterans_Organization__c=='No')?false:null,
	                	"allTypes":component.get("v.availableType")};
	        try {
	            var action = component.get("c.getFeeSchedule"); // Set the routine to call in the controller
	            action.setParams({
	                "appInfo": JSON.stringify(info)
	            });action.setCallback(this, function(response) {
	                try {            
	                    var state = response.getState();
	                    if (state === 'SUCCESS') {
	                        // good!
	                        var rtnValue = response.getReturnValue().split(';');
	                        component.set("v.estimate",rtnValue[0]);
	                        component.set("v.cost",rtnValue[1]);
	                        this.handleUndoCalculate(component);
	                    	
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
        component.set("v.newLicense.MUSW__Class__c", getUrlParameter('dLT'));
    },
	handleUndoCalculate : function(component, event,helper) {
		var cost = component.find('currentCost');
		$A.util.addClass(cost, 'slds-hide');
		var estimate = component.find('estimatedCost');
		$A.util.removeClass(estimate, 'slds-hide');
	}
})