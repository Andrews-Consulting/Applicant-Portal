//TODO need to reduce the number of round trips (initialization has 5 already).


({
	doInit: function(component, event, helper) {
		console.log('Init: CreateNewApplication (orig)');
        helper.handleClassParam(component);

        helper.getApplication(component, event);
        helper.getHelpText(component);
        helper.getLicenseType(component, event);
        if (component.get("v.ReadOnly") === false)
	        helper.getAccounts(component, event);
        helper.getPicklistValues(component, event);
        helper.getPremiseCity(component);
    },
    save: function (component, event, helper) {
        helper.createLicense(component);
    },
    onSelectChange : function(component, event,helper) {
    	component.set("v.license.abd_Length__c",null);
    	component.set("v.showRadio",false);
    	component.set("v.lTypes","");
    	helper.getLicenseLength(component, event);
    	helper.getDependency(component);
    },
	onAccountChange : function(component, event,helper) {
    	var selected = component.find("aItems").get("v.value");
    	if(selected==='new')
    		selected=null;
    	component.set("v.license.MUSW__Primary_Licensee__c",selected);
    },
	onLLChange : function(component, event,helper) {
        if(component.get("v.license.MUSW__Class__c")!==null) 
        	helper.getAddons(component);
    },

	vehicleChange : function(component, event,helper) {
		var vehicle = event.getSource().get("v.value");
		component.set("v.app.abd_Other_Criteria__c",vehicle);
    	helper.getDependency(component);        
	},
	handleRadioChange: function(component, event, helper){
		var selected = !event.getSource().get("v.value");
		var source = event.getSource();
		var lTypes = component.get("v.lTypes");
		source.set("v.value",selected);
		var index = source.get("v.name").substring(1);
		var lt = component.get("v.LicenseTypes");
		if(source.get("v.name").substring(0,1)==='O'){
			lt.optional[index].selected = selected;
			if(selected){
				lTypes += (' '+lt.optional[index].ltype.abd_License_Type__c);
			}else{
				lTypes = lTypes.replace((' '+lt.optional[index].ltype.abd_License_Type__c),"");
			}
			if(lt.optional[index].ltype.abd_License_Type__c == 'WB'){
				for(var i=0;i<lt.optional.length;i++){
					if(lt.optional[i].ltype.abd_License_Type__c == 'WBN'){
						lt.optional[i].selected = false;
						lt.optional[i].required = selected;
					}
				}
			
			}
		}else{
			lt.included[index].selected = selected;
			if(selected){
				lTypes += (' '+lt.included[index].ltype.abd_License_Type__c);
			}else{
				lTypes = lTypes.replace((' '+lt.included[index].ltype.abd_License_Type__c),"");
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
    	helper.getPremiseCity(component, event);        
	},
	handleChange : function(component, event,helper) {
    	helper.getDependency(component);        
	},
	handleSqChange : function(component, event,helper) {
		var field = event.getSource().get("v.name");
		var app = component.get("v.app");
		app[field] = event.getSource().get("v.value").trim();
		component.set("v.app",app);
    	helper.getDependency(component);        
	},
	radioChange : function(component, event,helper) {
		var application = JSON.parse(JSON.stringify(component.get("v.app")));
		if(event.getSource().get("v.name")=='VO'){
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
			application.abd_More_Than_250_Members__c = event.getSource().get("v.value");
		}
		if(event.getSource().get("v.name")=='gas') {
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