({
	doInit: function(component, event, helper) {
		console.log('Init: ApplicationAddPrivileges');
        helper.getLicense(component, event);
    },
    save: function (component, event, helper) {
    	helper.createAddApp(component);
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
						lTypes = lTypes.replace(' WBN',"");
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
			application.abd_Veterans_Organization__c = event.getSource().get("v.value");
		}
		if(event.getSource().get("v.name")=='clubMembers'){
			application.abd_More_Than_250_Members__c = event.getSource().get("v.value");
		}
		if(event.getSource().get("v.name")=='gas')
			application.abd_Sell_Gasoline__c = event.getSource().get("v.value");
		component.set("v.app",application);
		helper.getDependency(component);
		//helper.getFeeSchedule(component);
	}
})