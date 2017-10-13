({
    // Go get the existing license or Application and turn it into an application
	getLicenseOrApp: function(component){
        try{
            console.log('Get License ' + component.getLocalId()  + ':' + component.get("v.recordId")); 
            component.set("v.showError",false);                 // clear the error message display
        	var action = component.get("c.getInfo");         // Set the routine to call in the controller
            action.setParams({"recordId": component.get("v.recordId")});
            action.setCallback(this, function(response){        // and when it returns, perform ....
                try {            
                    var state = response.getState();
                    if (state === 'SUCCESS') {
                    	var addInfo = response.getReturnValue();   // license, licensetypes segment

                        var licenseTypesToDisplay;
                        if (!$A.util.isEmpty(addInfo)) {
                            if (!$A.util.isEmpty(addInfo.app))  {
                                component.set("v.app",addInfo.app);
                                // if the ID is set, then we are updating the application and not creating one.
                                if (!$A.util.isEmpty(addInfo.app.Id)) {
                                    component.set("v.isInUpdateApplicationMode",true); 
                                }

                                component.set("v.os",addInfo.app.abd_Outdoor_Service_Area_Boundary_Info__c);

                            }
                            if (!$A.util.isEmpty(addInfo.licTypeList)) {
                                licenseTypesToDisplay = addInfo.licTypeList;
                                component.set("v.LicenseTypes",licenseTypesToDisplay);
                                component.set("v.showRadio",true);

                                // If updating, then we need to re-establish all of our values.
                                if (!$A.util.isEmpty(addInfo.app.Id)) {
                                    var OTypes = '';
                                    var i;
                                    // need to populate optionalTypeNames
                                    for (i=0; i < licenseTypesToDisplay.optionalSLP.length; i++) {
                                        if (licenseTypesToDisplay.optionalSLP[i].selected) {
                                            OTypes += (' ' + licenseTypesToDisplay.optionalSLP[i].ltype.abd_License_Type__c +' ');
                                        }
                                    }
                                    for (i=0; i < licenseTypesToDisplay.optionalPrv.length; i++) {
                                        if (licenseTypesToDisplay.optionalPrv[i].selected) {
                                            OTypes += (' ' + licenseTypesToDisplay.optionalPrv[i].ltype.abd_License_Type__c +' ');
                                        }
                                    }

                                    // turn on various subsections based upon optional Type Names value.
                                    component.set("v.optionalTypeNames",OTypes);
                                    this.getDependency(component);

                                    // only show temp date if we are a temporary request.
                                    if (addInfo.app.abd_Temporary_or_Permanent__c == 'Temporary') {
                                        component.set("v.showTempPerm",true);
                                        // and remove all other options if this is a temp outdoor service.
                                        if (component.get("v.showOutdoor"))
                                            this.hideAllOptionsExceptOS(component, licenseTypesToDisplay);
                                    }

                                    this.getFeeSchedule(component);
                                }
                            }

                        }
                        component.set("v.isInitComplete",true);
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

    // helper routine to validate the data and then call the apex controller to write the records.
    createAddApp: function(component) { 
        var lt = component.get("v.LicenseTypes");
        var app = component.get("v.app");
        var OType = component.get("v.optionalTypeNames");
        var os = component.get("v.os");
        var NONE = '--None--';
        var action;
        try {
            component.set("v.showError", false); // clear the error message off of the screen
            var errmsg = '';
          
             // validate required BC questions
            if (errmsg.length === 0 && component.get("v.showSQBC")) {
                if($A.util.isEmpty(app.Square_Footage_Retail_Area__c))
                    errmsg = "Please provide a value for the Retail Square Footage question.";
            }
 
            var licStart = app.abd_Effective_Date_of_Current_License__c;
            var licEnd = app.abd_Effective_End_Date_of_Current_Lic__c;
            var dtLicStart = new Date(new Date(licStart).getTime() + new Date(licStart).getTimezoneOffset()*60*1000);
            var dtLicEnd = new Date(new Date(licEnd).getTime() + new Date(licEnd).getTimezoneOffset()*60*1000);



            // Make sure that the start date is filled in and the end date if temporary.
            if ($A.util.isEmpty(OType))
                errmsg = "Please select an option to add to your existing license";
            else if ($A.util.isEmpty(app.abd_Effective_Date__c)) 
                errmsg = "Please enter a start date";
            else if ($A.localizationService.isBefore(app.abd_Effective_Date__c,licStart))
                errmsg = "Effective Date is before the license start date of " + dtLicStart.toLocaleDateString();
            else if ($A.localizationService.isAfter(app.abd_Effective_Date__c,licEnd))
                errmsg = "Effective Date is beyond license end date of " + dtLicEnd.toLocaleDateString();
            else if (app.abd_Temporary_or_Permanent__c == "Temporary") {
                    if ($A.util.isEmpty(app.abd_Effective_End_Date__c))
                        errmsg = "Please enter an end date";
                    else if ($A.localizationService.isAfter(app.abd_Effective_End_Date__c,licEnd) || 
                            $A.localizationService.isBefore(app.abd_Effective_End_Date__c,app.abd_Effective_Date__c)) {
                        var dtEff = new Date(new Date(app.abd_Effective_Date__c).getTime() + new Date(app.abd_Effective_Date__c).getTimezoneOffset()*60*1000);
                        errmsg = "The end date is not between the application start date (" + dtEff.toLocaleDateString() + ") and the license end dates ("  + dtLicEnd.toLocaleDateString() + ").";
                    }
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
                app.sobjectType = "MUSW__Application2__c";
                action = component.get("c.createAddApp");
                action.setParams({
                    "lts": JSON.stringify(lt),
                    "app": app,
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
                            action = component.get("c.updateLicenseApplicationRecords");
                            action.setParams({"appId" : rtValue.substr(9)});
                            action.setCallback(this, function(response) {
                                var action = component.getEvent("SaveCompleted");
                                try {
                                    var state = response.getState();
                                    if (state === 'SUCCESS') {
                                        action.setParams({"Component" : component, "Action": "Saved", "AppId": component.get("v.recordId")});
                                    }
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
                                        action.setParams({"Component" : component, "Action": "Fail" });
                                    }
                                } catch(e) {
                                    alert(e.stack);
                                    action.setParams({"Component" : component, "Action": "Fail" });
                                }finally{
                                // always fire this action.  parms are set.                
                                action.fire();
                                }
                            });
                            $A.enqueueAction(action); 
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

    getDependency: function(component) {
    	var OType = component.get("v.optionalTypeNames");
        component.set("v.showSQBC", OType.includes('BC'));
        component.set("v.showOutdoor",OType.includes('OS'));
    },

    isAnyPermLicenseSelected: function(licenseTypesToDisplay) {
       var answer = false;
       var i;
        for (i = 0; i < licenseTypesToDisplay.optionalSLP.length && !answer; i++)
            if (licenseTypesToDisplay.optionalSLP[i].selected && 
                licenseTypesToDisplay.optionalSLP[i].ltype.abd_License_Type__c !== 'OS')
                answer = true; 

        for (i = 0; i < licenseTypesToDisplay.optionalPrv.length && !answer; i++)
            if (licenseTypesToDisplay.optionalPrv[i].selected && 
                licenseTypesToDisplay.optionalPrv[i].ltype.abd_License_Type__c !== 'OS')
                answer = true; 
        return answer;
    },

    // for all of the license types that are permanent, disable them
    hideAllOptionsExceptOS: function(component, licenseTypesToDisplay) {
        for (var i = 0; i < licenseTypesToDisplay.optionalSLP.length; i++)
            if (licenseTypesToDisplay.optionalSLP[i].ltype.abd_License_Type__c !== 'OS')
                licenseTypesToDisplay.optionalSLP[i].hidden = true;  
        for (var i = 0; i < licenseTypesToDisplay.optionalPrv.length; i++)
            if (licenseTypesToDisplay.optionalPrv[i].ltype.abd_License_Type__c !== 'OS')
                licenseTypesToDisplay.optionalPrv[i].hidden = true;  
        component.set("v.LicenseTypes", licenseTypesToDisplay);

    },

    enableOutdoorService: function(component) { 
        component.set("v.showOutdoor",true);
        component.set("v.app.abd_Temporary_or_Permanent__c", 'Permanent');
    }, 

    disableOutdoorService: function(component) {
        component.set("v.showOutdoor",false);
        component.set("v.app.abd_Temporary_or_Permanent__c", 'Permanent');
    },

    enableAndShowAllOptions: function(component, licenseTypesToDisplay) { 
// for now, let's see if this routine is actually doing anything.        
        var change = false;
        var OTypes = component.get("v.optionalTypeNames");
        var WBon = OTypes.includes(' WB ');
        var WBNon = OTypes.includes(' WBN ');
        var WCNon = OTypes.includes(' WCN ');

        for (var i = 0; i < licenseTypesToDisplay.optionalSLP.length; i++) {
            var show = true;
            if (licenseTypesToDisplay.optionalSLP[i].ltype.abd_License_Type__c == 'WB' && WBNon) show = false;
            else if (licenseTypesToDisplay.optionalSLP[i].ltype.abd_License_Type__c == 'WCN' && WBNon) show = false;
            else if (licenseTypesToDisplay.optionalSLP[i].ltype.abd_License_Type__c == 'WBN' && (WBon || WCNon)) show = false;
            if (show) {
                if (licenseTypesToDisplay.optionalSLP[i].disabled || licenseTypesToDisplay.optionalSLP[i].hidden) change = true;
                licenseTypesToDisplay.optionalSLP[i].disabled = false;  
                licenseTypesToDisplay.optionalSLP[i].hidden = false;  
                }
            }
        for (var i = 0; i < licenseTypesToDisplay.optionalPrv.length; i++) {
            var show = true;
            if (licenseTypesToDisplay.optionalPrv[i].ltype.abd_License_Type__c == 'WB' && WBNon) show = false;
            else if (licenseTypesToDisplay.optionalPrv[i].ltype.abd_License_Type__c == 'WCN' && WBNon) show = false;
            else if (licenseTypesToDisplay.optionalPrv[i].ltype.abd_License_Type__c == 'WBN' && (WBon || WCNon)) show = false;
            if (show) {
                if (licenseTypesToDisplay.optionalPrv[i].disabled || licenseTypesToDisplay.optionalPrv[i].hidden) change = true;
                licenseTypesToDisplay.optionalPrv[i].disabled = false;  
                licenseTypesToDisplay.optionalPrv[i].hidden = false;  
                }
            }
        if (change) console.log('*** ENABLE AND SHOW CHANGE OCCURED ***');
            else console.log('*** NOTHING CHANGED IN ENABLE AND SHOW  ***');

        if (change)    
            component.set("v.LicenseTypes", licenseTypesToDisplay);            
    },
    // isWBon: function(component, licenseTypesToDisplay) { 
    //     for (var i = 0; i < licenseTypesToDisplay.optionalSLP.length; i++) {
    //         if (licenseTypesToDisplay.optionalSLP[i].ltype.abd_License_Type__c == 'WB' && licenseTypesToDisplay.optionalSLP[i].selected)
    //             return true;
    //     }
    //     return false;
    // },
    // isWBNon: function(component, licenseTypesToDisplay) { 
    //     for (var i = 0; i < licenseTypesToDisplay.optionalSLP.length; i++) {
    //         if (licenseTypesToDisplay.optionalSLP[i].ltype.abd_License_Type__c == 'WBN' && licenseTypesToDisplay.optionalSLP[i].selected)
    //             return true;
    //     }
    //     return false;
    // },
    // isWCNon: function(component, licenseTypesToDisplay) { 
    //     for (var i = 0; i < licenseTypesToDisplay.optionalSLP.length; i++) {
    //         if (licenseTypesToDisplay.optionalSLP[i].ltype.abd_License_Type__c == 'WCN' && licenseTypesToDisplay.optionalSLP[i].selected)
    //             return true;
    //     }
    //     return false;
    // },

    // Determine how much this license will cost.
    // This has to handle pro-rated changes.
    getFeeSchedule: function(component) {
        try {
                var app = component.get("v.app");
                var OType = component.get("v.optionalTypeNames");
                var info = {"selectedLicenseTypes":OType, "app": app};

            var estimateError = "";
            // validate that we have enough fields to proceeed and if we don't, save a call to the server.
      
            var licStart = app.abd_Effective_Date_of_Current_License__c;
            var licEnd = app.abd_Effective_End_Date_of_Current_Lic__c;
            var dtLicStart = new Date(new Date(licStart).getTime() + new Date(licStart).getTimezoneOffset()*60*1000);
            var dtLicEnd = new Date(new Date(licEnd).getTime() + new Date(licEnd).getTimezoneOffset()*60*1000);


            component.set("v.estimate"," -- ");
            // console.log(licEnd);
            
            // Make sure that the start date is filled in and the end date if temporary.
            if ($A.util.isEmpty(OType))
                estimateError = "DNS"; //"Please select an option to add to your existing license to calculate the fees";
            else if ($A.util.isEmpty(app.abd_Effective_Date__c)) 
                estimateError = "DNS"; //"Please fill in the start date to calculate the fees";
            else if ($A.localizationService.isBefore(app.abd_Effective_Date__c, licStart))
                estimateError = "Effective Date is before the license start date of " + dtLicStart.toLocaleDateString();
            else if ($A.localizationService.isAfter(app.abd_Effective_Date__c, licEnd))
                estimateError = "Effective Date is beyond license end date of " + dtLicEnd.toLocaleDateString();
            else if (app.abd_Temporary_or_Permanent__c == "Temporary") {
                    if ($A.util.isEmpty(app.abd_Effective_End_Date__c))
                        estimateError = "DNS"; //"Please fill in the end date to calculate the fees";
                    else if ($A.localizationService.isAfter(app.abd_Effective_End_Date__c,licEnd) || 
                             $A.localizationService.isBefore(app.abd_Effective_End_Date__c,app.abd_Effective_Date__c)) {
                        var dtEff = new Date(new Date(app.abd_Effective_Date__c).getTime() + new Date(app.abd_Effective_Date__c).getTimezoneOffset()*60*1000);
                        estimateError = "The end date is not between the application start date (" + dtEff.toLocaleDateString() + ") and the license end dates ("  + dtLicEnd.toLocaleDateString() + ").";
                    }
                }
            // Set the value for calculations
            // console.log(licEnd);
            if (app.abd_Temporary_or_Permanent__c !== "Temporary")
                app.abd_Effective_End_Date__c = licEnd;

            // sometimes we don't want to show a message, but we also don't want to call the calculation routine.
            // So we have a Do Not Show (DNS) value.
            if (estimateError !== "") {
                if (estimateError !== "DNS") {
                    component.set("v.errorMessage",estimateError);
                    component.set("v.showError",true);
                    // component.set("v.estimate",estimateError);
                }
            }
            else {
                component.set("v.showError",false);
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

    }

})