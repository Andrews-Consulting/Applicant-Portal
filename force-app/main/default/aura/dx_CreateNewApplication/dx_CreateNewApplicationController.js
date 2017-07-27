({
	doInit: function(component, event, helper) {
		console.log('Init: CreateNewApplication (orig)');
        helper.handleClassParam(component);
        helper.getHelpText(component);
        helper.getLicenseType(component, event);
        helper.getAccounts(component, event);
        helper.getPicklistValues(component, event);
        helper.getPremiseCity(component);
        component.find("clubMembersYes").set("v.checked",false);
		component.find("clubMembersNo").set("v.checked",false);
    },
    save: function (component, event, helper) {
    	helper.checkLicenseEligibility(component);
    },
    // primary license type just changed.
    onSelectChange : function(component, event,helper) {
    	component.set("v.newLicense.abd_Length__c",null);
    	component.set("v.showRadio",false);
    	component.set("v.lTypes","");
    	helper.getLicenseLength(component, event);		// reset the license length drop down list
    	helper.setValueDefaults(component);		// reset some checkbox values
    	//helper.getDependency(component);
    },
	onAccountChange : function(component, event,helper) {
    	var selected = component.find("aItems").get("v.value");
    	if(selected==='new')
    		selected=null;
    	component.set("v.newLicense.MUSW__Primary_Licensee__c",selected);
    },
	onLLChange : function(component, event,helper) {
        if(component.get("v.newLicense.MUSW__Class__c")!==null)
        	helper.getAddons(component);
    },

	handleRadioChange: function(component, event, helper){
		var selected = !event.getSource().get("v.value");
		var source = event.getSource();
		var lTypes = component.get("v.lTypes");
		source.set("v.value",selected);
		var index = source.get("v.name").substring(1);
		var lt = component.get("v.LicenseTypes");

		// If the item that changed was an optional license, then fix the optional list of licenses
		if(source.get("v.name").substring(0,1)==='O'){
			lt.optional[index].selected = selected;
			if(selected){
				lTypes += (' '+lt.optional[index].ltype.abd_License_Type__c+' ');
			}else{
				lTypes = lTypes.replace((' '+lt.optional[index].ltype.abd_License_Type__c+' ')," ");
			}

			// If we have a WB or WCN, then we need to unselect the WBN if it's selected
			if(lt.optional[index].ltype.abd_License_Type__c == 'WB' || lt.optional[index].ltype.abd_License_Type__c == 'WCN'){
				for(var i=0;i<lt.optional.length;i++){
					if(lt.optional[i].ltype.abd_License_Type__c == 'WBN'){
						lt.optional[i].selected = false;	// take it out of the fee calculation - just by touching the WB
						lt.optional[i].hidden = selected;	// Hide it if the WB is selected, else show it.
						lTypes = lTypes.replace((' WBN ')," ");

					}
				}
			
			}

			// If we have a WBN, then we need to unselect the WB if it's selected
			if(lt.optional[index].ltype.abd_License_Type__c == 'WBN'){
				for(var i=0;i<lt.optional.length;i++){
					if(lt.optional[i].ltype.abd_License_Type__c == 'WB'){
						lt.optional[i].selected = false;
						lt.optional[i].hidden = selected;
						lTypes = lTypes.replace((' WB ')," ");
					}
					if (lt.optional[i].ltype.abd_License_Type__c == 'WCN'){
						lt.optional[i].selected = false;
						lt.optional[i].hidden = selected;
						lTypes = lTypes.replace((' WCN ')," ");
					}
				}
			
			}
		}else{
			lt.included[index].selected = selected;
			if(selected){
				lTypes += (' '+lt.included[index].ltype.abd_License_Type__c+' ');
			}else{
				lTypes = lTypes.replace((' '+lt.included[index].ltype.abd_License_Type__c+' ')," ");
			}
		}
		component.set("v.LicenseTypes",lt);
		component.set("v.lTypes",lTypes);
		helper.getDependency(component);
		//helper.getFeeSchedule(component);
	},
	handleIncChange: function(component, event, helper){
		var radios = component.find("includedGroup");
		var sel = '';
		for(var i=0;i<radios.length;i++){
			sel+=(radios[i].get("v.label")+';');
		}
		component.set("v.inc",sel);
		
	},
	countyChange : function(component, event,helper) {
		var state = (component.get("v.app.abd_Premise_County__c")!='--None--')?'IA':'--None--';
		component.set("v.app.abd_Premise_State__c",state);
    	helper.getPremiseCity(component, event);        
	},
	cityChange: function(component, event,helper) {
    	helper.getDependency(component);        
	},

	vehicleChange : function(component, event,helper) {
		var vehicle = event.getSource().get("v.value");
		component.set("v.app.abd_Other_Criteria__c",vehicle);
    	helper.getDependency(component);        
	},
	handleSqChange : function(component, event,helper) {
		var field = event.getSource().get("v.name");
		var app = component.get("v.app");
		app[field] = event.getSource().get("v.value").trim();
		var lTypes = component.get("v.lTypes");

		// If an LE is not present, then copy the retail space size to the actual space.
		if (!$A.util.isEmpty(lTypes) && !lTypes.includes(" LE "))
			app.abd_Square_Footage__c = app.Square_Footage_Retail_Area__c;

		component.set("v.app",app);
    	helper.getDependency(component);        
	},
	radioChange : function(component, event,helper) {
		var application = JSON.parse(JSON.stringify(component.get("v.app")));
		if(event.getSource().get("v.name")=='VO'){
			application.abd_Veterans_Organization__c = event.getSource().get("v.value");

			if(event.getSource().get("v.value") =='Yes'){
				application.abd_Other_Criteria__c = 'Veteran’s organization open one day per week or 52 days or less per year';
				application.abd_More_Than_250_Members__c=null;
				component.find("clubMembersYes").set("v.checked",false);
				component.find("clubMembersNo").set("v.checked",false);
			}
			else 
			{
				if (application.abd_Other_Criteria__c == 'Veteran’s organization open one day per week or 52 days or less per year')
					application.abd_Other_Criteria__c = null;
				component.find("clubMembersYes").set("v.checked",false);
				component.find("clubMembersNo").set("v.checked",false);
			}
		}
		if(event.getSource().get("v.name")=='clubMembers'){
			component.find("VONo").set("v.checked",true);
			application.abd_More_Than_250_Members__c = event.getSource().get("v.value");
			if (event.getSource().get("v.value") == 'Yes')
				application.abd_Other_Criteria__c = 'Club has more than 250 members';
			else
				application.abd_Other_Criteria__c = 'Club has less than 250 members';
		}

		if(event.getSource().get("v.name")=='gas') {
			application.abd_Sell_Gasoline__c = event.getSource().get("v.value");
			if (event.getSource().get("v.value") == 'Yes')
				application.abd_Other_Criteria__c = 'Sells Gas';
			else 
				application.abd_Other_Criteria__c = 'No Gas';

	}
		component.set("v.app",application);
		helper.getDependency(component);
		//helper.getFeeSchedule(component);
	}

})