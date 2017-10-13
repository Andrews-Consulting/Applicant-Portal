({
	doInit: function(component, event, helper) {
		console.log('Init: ApplicationAddPrivileges');
        helper.getLicenseOrApp(component, event);
    },
    save: function (component, event, helper) {
    	helper.createAddApp(component);
    },
    handleRadioChange: function(component, event, helper){

    	try {
			var selected = !event.getSource().get("v.value");
			var source = event.getSource();
			var OTypes = component.get("v.optionalTypeNames");
			var index = source.get("v.name").substring(4);
			var lt = component.get("v.LicenseTypes");
			var change = false;

			// don't set this before lt is populated
			source.set("v.value",selected);

			component.set("v.showError",false);  
			
			// If the item that changed was an optional license, then fix the optional list of licenses
			var thisLType = "";
			if(source.get("v.name").substring(0,4)==='OSLP') {
				lt.optionalSLP[index].selected = selected;
				thisLType = lt.optionalSLP[index].ltype.abd_License_Type__c;
			}
			else if(source.get("v.name").substring(0,4)==='OPrv') {
				lt.optionalPrv[index].selected = selected;
				thisLType = lt.optionalPrv[index].ltype.abd_License_Type__c;
			}

			// Save away the changes we've made.
			component.set("v.LicenseTypes", lt); 

			if (thisLType !== "") {
				// Build up a list of added features for this application
				if(selected) {
					OTypes += (' '+ thisLType +' ');
				}
				else {
					OTypes = OTypes.replace((' ' + thisLType + ' '),' ');
				}
				component.set("v.optionalTypeNames",OTypes);

			}
			else console.log("a clickable item didn't have a name in handle radio change");

			// Let's assume that we're only on a useable item at this time.

			var isTemp = component.get("v.app.abd_Temporary_or_Permanent__c") == 'Temporary' ? true : false ;

			// if nothing is selected - our otypes string should be blank which is a faster test.
			if (OTypes.trim() === "") {
				component.set("v.showTempPerm",false);
				component.set("v.app.abd_Temporary_or_Permanent__c","Permanent");
				helper.enableAndShowAllOptions(component, lt);
			}
			else {
				if (thisLType === 'OS') {
					helper.enableAndShowAllOptions(component,lt);
					if (selected) {
						helper.enableOutdoorService(component);
						if (helper.isAnyPermLicenseSelected(lt)) {
							component.set("v.showTempPerm",false);
						}
						else {
							component.set("v.showTempPerm",true);
						}
					}
					else { 		// not selected
						component.set("v.showTempPerm",false);
						helper.disableOutdoorService(component);
					}
				}
				else {
					if (!helper.isAnyPermLicenseSelected(lt))
						component.set("v.showTempPerm",component.get("v.showOutdoor"));
					else 
						component.set("v.showTempPerm",false);
				}

				// Reset our values for this next section.
				change = false;
				lt = component.get("v.LicenseTypes");
				var i;
	// TODO - We should look through optionalPrv as well, but I know it's not there for now!!!!	

				// If we have a WB or WCN, then we need to unselect the WBN if it's selected
				// WCN (class C Native Wine Permit), WB (Class B Wine Permit), WBN (Class B Native Wine Permit)
				// however, if wb and wcn are both checked, don't let unchecking one mess up the other one.
   				var WBon = OTypes.includes(' WB ');
        		var WBNon = OTypes.includes(' WBN ');
        		var WCNon = OTypes.includes(' WCN ');				
				var WBNCanChange = true;
				if(thisLType == 'WB' && !selected) {
					if (WCNon)
						WBNCanChange = false;
					// for(i=0;i<lt.optionalSLP.length;i++) 
					// 	if (lt.optionalSLP[i].ltype.abd_License_Type__c == 'WCN')
					// 		WBNCanChange = false;
				}
				else {
					if(thisLType == 'WCN' && !selected) 
						if (WBon)
							WBNCanChange = false;
						// for(i=0;i<lt.optionalSLP.length;i++) 
						// 	if (lt.optionalSLP[i].ltype.abd_License_Type__c == 'WB')
						// 		WBNCanChange = false;
				}


				if((thisLType == 'WB' || thisLType == 'WCN') && WBNCanChange) {
					for(i=0;i<lt.optionalSLP.length;i++){
						if(lt.optionalSLP[i].ltype.abd_License_Type__c == 'WBN'){
							lt.optionalSLP[i].selected = false;	// take it out of the fee calculation - just by touching the WB
							lt.optionalSLP[i].hidden = selected;	// Hide it if the WB is selected, else show it.
							OTypes = OTypes.replace((' WBN ')," ");
							change = true;
						}
					}
				}

				// If we have a WBN, then we need to unselect the WB if it's selected
				if(thisLType == 'WBN') {
					for(i=0;i<lt.optionalSLP.length;i++) {
						if(lt.optionalSLP[i].ltype.abd_License_Type__c == 'WB'){
							lt.optionalSLP[i].selected = false;
							lt.optionalSLP[i].hidden = selected;
							OTypes = OTypes.replace((' WB ')," ");
							change = true;
						}
						if (lt.optionalSLP[i].ltype.abd_License_Type__c == 'WCN'){
							lt.optionalSLP[i].selected = false;
							lt.optionalSLP[i].hidden = selected;
							OTypes = OTypes.replace((' WCN ')," ");
							change = true;
						}
					}
				}
				if (change) {
					component.set("v.LicenseTypes",lt);
					component.set("v.optionalTypeNames",OTypes);
				}
			}

			
			
			helper.getDependency(component);
			helper.getFeeSchedule(component);
		}
		catch (e) {
            alert(e.stack);
        }
	},
	handleChange : function(component, event,helper) {
    	helper.getDependency(component);        
	},

	// Since the it's a change handler on the field, this is called even during setup before we are initialized.
	recalcFees: function(component, event,helper) {
		if (component.get("v.isInitComplete"))
			helper.getFeeSchedule(component);
	},
	
	handleSqChange : function(component, event,helper) {
    	helper.getDependency(component);        
	},
	permTempChange : function(component, event,helper) {
		try {
			component.set("v.showError",false);  
			var oldvalue = component.get("v.app.abd_Temporary_or_Permanent__c");
			if (!$A.util.isEmpty(event.getSource().get("v.value"))) {
				var tempOrPerm = event.getSource().get("v.value").trim();
				// ignore reclicks!
				if (tempOrPerm === oldvalue)
					return; 


				component.set("v.app.abd_Temporary_or_Permanent__c", tempOrPerm);

				if (tempOrPerm == 'Temporary') {
					helper.hideAllOptionsExceptOS(component, component.get("v.LicenseTypes"));
					component.set("v.app.abd_Effective_End_Date__c","");
				}
				else
					helper.enableAndShowAllOptions(component,component.get("v.LicenseTypes"));

				if (! component.get("v.showOutdoor"))
					helper.enableOutdoorService(component);


				helper.getDependency(component);
				helper.getFeeSchedule(component);
			}
		}
		catch (e) {
			alert(e.stack);
		}
	}
})