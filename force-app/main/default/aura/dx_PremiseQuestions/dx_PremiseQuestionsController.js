({
    // Code that is replicated for every instance (typically list views or when multiple instances are displayed on a screen)
    // initialization code to populate the component
    doInit: function(component, event, helper) {
        helper.getApplication(component, event);
    },

    // Save Button code
    save : function(component, event, helper) {
        helper.doUpdate(component, event);
    },

	radioChange : function(component, event,helper) {
		var application = JSON.parse(JSON.stringify(component.get("v.app")));
		if(event.getSource().get("v.name")=='nonProf')
			application.abd_Non_profit__c = event.getSource().get("v.value");
		if(event.getSource().get("v.name")=='gas') {
			if (event.getSource().get("v.value") == 'Yes')
				application.abd_Other_Criteria__c = 'Sells Gas';
			else 
				application.abd_Other_Criteria__c = 'No Gas';
		}
		console.log(application);
		component.set("v.app",application);
	},
	countyChange : function(component, event,helper) {
		/*var temp = component.get("v.app.abd_Bond_Company__c");
		var application = JSON.parse(JSON.stringify(component.get("v.app")));
		application.abd_Bond_Company__c = temp;
		component.set("v.app",application);
    	console.log(component.get("v.app.abd_Bond_Company__c"));
    	console.log(component.get("v.app"));*/        
	}
})