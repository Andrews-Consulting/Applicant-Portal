({
doInit: function(component, event, helper) {
		console.log('Init: CreateRenewalApplication');
        helper.getRenewalInfo(component, event);
    },
    save: function (component, event, helper) {
    	helper.updateRenewalApp(component);
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
			}
			else console.log("a clickable item didn't have a name in handle radio change");

			// Reset our values for this next section.
			change = false;
			lt = component.get("v.LicenseTypes");
			var i;
			// TODO - We should look through optionalPrv as well, but I know it's not there for now!!!!	

			// If we have a WB or WCN, then we need to unselect the WBN if it's selected
			// WCN (class C Native Wine Permit), WB (Class B Wine Permit), WBN (Class B Native Wine Permit)
			// however, if wb and wcn are both checked, don't let unchecking one mess up the other one.
			var WBNCanChange = true;
			if(thisLType == 'WB' && !selected) {
				for(i=0;i<lt.optionalSLP.length;i++) 
					if (lt.optionalSLP[i].ltype.abd_License_Type__c == 'WCN')
						WBNCanChange = false;
			}
			else {
				if(thisLType == 'WCN' && !selected) 
					for(i=0;i<lt.optionalSLP.length;i++) 
						if (lt.optionalSLP[i].ltype.abd_License_Type__c == 'WB')
							WBNCanChange = false;
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
			if (change)
			component.set("v.LicenseTypes",lt);
			component.set("v.optionalTypeNames",OTypes);
			helper.getFeeSchedule(component);
		}
		catch (e) {
            alert(e.stack);
        }
	}, 

    onOwnerSelectEdit: function(component, event, helper) {

    	var ownerId = event.getSource().get("v.value");
    	if (!$A.util.isEmpty(ownerId))
	    	helper.AddOwnerSection(component,event, ownerId);
    },

    // get the modified record from the component and save it away -- Since we are building components dynamically, we can't use
    // the out of the box parameter to property binding that component communication supports.
    saveOwner: function (component, event, helper) {
    	//var xx = event.getSource();
    	var params = event.getParams();
    	var ownerId = params.AppId;
    	
    	if (!$A.util.isEmpty(params.Other)) {
    		var ownerRec = JSON.parse(params.Other);
	    	var ownerlist = component.get("v.ownerlist");
	    	for (i = 0; i < ownerlist.length; i++ ) {
	    		if (ownerlist[i].Id == ownerId) {
	    			ownerlist.splice(i,1,ownerRec);
	    			component.set("v.ownerlist",ownerlist);
	    			break;
	    		}
	    	}
    	}



    },
	test: function (component, event, helper) { 
		dynamicComponentsByAuraId = component.get("v.dynamicComponentsByAuraId");
        var OwnerItems = dynamicComponentsByAuraId["OwnerItems"+ oCounter.toString()];
        var ownerNameList = component.get("v.ownerNameList");
	}

})