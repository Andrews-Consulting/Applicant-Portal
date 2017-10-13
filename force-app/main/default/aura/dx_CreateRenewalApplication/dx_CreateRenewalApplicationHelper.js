({
    // Go get the existing license and turn it into an application
	getRenewalInfo: function(component){
        try{
            console.log('Get License ' + component.getLocalId()  + ':' + component.get("v.recordId")); 
            component.set("v.showError",false);                 // clear the error message display
        	var action = component.get("c.createRenewalApp");         // Set the routine to call in the controller
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
                                if (!$A.util.isEmpty(addInfo.app.Id)) {         // shouldn't be blank!
                                    component.set("v.recordId",addInfo.app.Id);
                                }
                            }
//
  if (!$A.util.isEmpty(addInfo.ownerlist)) 
component.set("v.owner",addInfo.ownerlist[0]);
//
                            if (!$A.util.isEmpty(addInfo.licTypeList)) {
                                licenseTypesToDisplay = addInfo.licTypeList;
                                component.set("v.LicenseTypes",licenseTypesToDisplay);

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
                                    this.getFeeSchedule(component);
                                }
                                component.set("v.showRadio",true);
                            }
                            if (!$A.util.isEmpty(addInfo.licenseContact)) {
                            	component.set("v.contact",addInfo.licenseContact);
                            }

                            if (!$A.util.isEmpty(addInfo.licenseAccount)) {
                            	component.set("v.account",addInfo.licenseAccount);
                            }

                            var ownerNameList = new Map();
                            var opts = [];
                            opts.push({label: "Select Owner", 
                                      value: "NONE",
                                      selected: true});

                            if (!$A.util.isEmpty(addInfo.ownerlist)) {
                                component.set("v.ownerlist",addInfo.ownerlist);
                                for (var i = 0; i < addInfo.ownerlist.length; i++) {
                                    ownerNameList.set(addInfo.ownerlist[i].Id, addInfo.ownerlist[i].First_Name__c + ' ' + addInfo.ownerlist[i].Last_Name__c);
                                    opts.push({
                                            label: addInfo.ownerlist[i].First_Name__c + ' ' + addInfo.ownerlist[i].Last_Name__c ,
                                            value: addInfo.ownerlist[i].Id,
                                            selected: false
                                            });
                                }
                            }
                            component.set("v.ownerNameList",ownerNameList);
                            component.find("OwnerItems").set("v.options", opts);
                        }
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
                finally {
                	component.set("v.isInitComplete",true);
                }
            });
            $A.enqueueAction(action);                           // put this item on the queue to execute.
        }
        catch(e) {
            alert(e.stack);
        }
     },

    // helper routine to validate the data and then call the apex controller to write the records.
    updateRenewalApp: function(component) { 
        var lt = component.get("v.LicenseTypes");
        var app = component.get("v.app");
        var OType = component.get("v.optionalTypeNames");
        var ownerlist = component.get("v.ownerlist") ;
        var NONE = '--None--';
        var action;
        try {
            component.set("v.showError", false); // clear the error message off of the screen
            var errmsg = '';
          
 
            // If there is an error message, then display the error message, clear the spinner and leave.
            if (errmsg.length !== 0) {
                component.set("v.errorMessage", errmsg);
                component.set("v.showError", true);
                action = component.getEvent("SaveCompleted");
                action.setParams({"Component" : component, "Action": "Fail" });
                action.fire();
            } else {
                // Else prepare to call the APEX controller to write the records out.
                var addinfo = JSON.parse(JSON.stringify({"app": app,
                                              "licTypeList" : {},
                                              "ownerlist": ownerlist, 
                                              "licenseContact" : component.get("v.contact"), 
                                              "licenseAccount" : component.get("v.account")}));
               
                addinfo.sobjectType = "ApplicationRenewalInit";
                action = component.get("c.updateRenewalApp");
                action.setParams({"appblockStr" : JSON.stringify(addinfo)});        // can't pass lists to Apex yet

                action.setCallback(this, function(response){
                    var action = component.getEvent("SaveCompleted");
                    try{                 
                        var state = response.getState();
                        // if call was successful and the function was successul
                        if (state === 'SUCCESS') {
                            // for later on, let's save application ID away for now.
                            action.setParams({"Component" : component, "Action": "Saved" });
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

    // This updates the external value, which triggers a recalculation by the fee component.
    getFeeSchedule: function(component) {
        try {
            var app = component.get("v.app");
            var OType = component.get("v.optionalTypeNames");
            var info = {"selectedLicenseTypes":OType, "app": app};
            // var appinfo = JSON.stringify(info);
            component.set("v.AppInfo",info);
        } 
        catch(e) {
            alert(e.stack);
        }
    },

    AddOwnerSection: function(component, event, ownerId) {
        try {
            var ownerNameList = component.get("v.ownerNameList");
            var ownerlist = component.get("v.ownerlist");
            if ($A.util.isEmpty(ownerNameList) || $A.util.isEmpty(ownerNameList))
                return;

            // Set v.owner to the person they just selected.  This is because the init code for the coponent needs this set.
            // The use of v.OWNER IS TEMPORARY.  The link is reset after component creation.
            //REMOVE the ownerName from the list for future select lists.
            for (var i = 0; i < ownerlist.length; i++) 
                if (ownerlist[i].Id == ownerId) {
                   // component.set("v.owner",ownerlist[i]);
                    ownerNameList.delete(ownerId); 
                    component.set("v.ownerNameList",ownerNameList);
                    break;
                }

            // We have to name inputSelect aura:id uniquely across invocations since we built the list of choices dynamically.
            var oCounter = component.get("v.oCounter")+1;
            component.set("v.oCounter",oCounter);

            // Create the components that we MIGHT show on the screen
            $A.createComponents([
            ["c:dx_OwnerFormComponent", { "owner": ownerlist[i],                // bi-directional reference
                                           "oldOwner": ownerlist[i],            // by value - read only reference.
                                           "recordId":component.get("v.recordId"),      // by value - read only reference.
                                           "showShortForm": true,
                                           "noBusinessAllowed":true,
                                           "throwEventOnDone" : true, 
                                           "ownerDone" : component.getReference("c.saveOwner") }],
            ["aura:HTML", {"tag": "br" }],
            ["aura:HTML", {"tag": "br" }],
            ["ui:outputText", {"value":"Do you need to update the mailing information for an owner? If so, select the owner from the list."}],
            ["ui:inputSelect", {"aura:id":"OwnerItems" + oCounter.toString(),
                                "value": "",
                                "change":component.getReference('c.onOwnerSelectEdit')}]
            ],function(newcmps,status,statusMessagesList){
                try {
                    console.log('components created');

                    if (status === "SUCCESS") {
                        // Save away a pointer to the input select list.
                        dynamicComponentsByAuraId = component.get("v.dynamicComponentsByAuraId");
                        dynamicComponentsByAuraId[newcmps[4].getLocalId()] = newcmps[4];
                        component.set("v.dynamicComponentsByAuraId",dynamicComponentsByAuraId);

                        var body;
                        // if the owner list is empty, then there is no one else to edit, so don't show the choice again, just the owner component
                        var ownerNameList = component.get("v.ownerNameList");
                        if (ownerNameList.size === 0) {
                            body = component.get("v.body");
                            body.push(newcmps[0], newcmps[1]);
                            component.set("v.body", body);
                        }
                        // This section handles displaying all of the built components
                        else {
                            body = component.get("v.body").concat(newcmps);
                            component.set("v.body", body);
                        }
                        // make sure that we can find the element and then disable the inputselect list that started invoked this routine.
                        var disable = event.getSource().get("v.disabled");
                        if (!$A.util.isEmpty(disable))      
                            event.getSource().set("v.disabled",true);
                    }
                    else if (status === "INCOMPLETE") {
                        console.log("No response from server or client is offline.");
                        // Show offline error
                    }
                    else if (status === "ERROR") {
                        console.log("Error: " + statusMessagesList);
                        // Show error message
                    }
                } catch(e) {alert(e);}
     
            });
        }
        catch(e) {alert(e);}

    }
})