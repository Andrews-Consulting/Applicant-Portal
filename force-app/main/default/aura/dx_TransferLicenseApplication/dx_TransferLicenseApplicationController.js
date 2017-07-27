({
    // Code that is replicated for every instance (typically list views or when multiple instances are displayed on a screen)
    // initialization code to populate the component
    doInit: function(component, event, helper) {
    	console.log('Additional Location Init');
        helper.getLicense(component, event);
        helper.getPicklistValues(component, event);
    },

    // Save Button code
    save : function(component, event, helper) {
        helper.doUpdate(component, event);
    },
	radioChange : function(component, event,helper) {
		var application = JSON.parse(JSON.stringify(component.get("v.app")));
		application.abd_Temporary_or_Permanent__c = event.getSource().get("v.value");
		component.set("v.app",application);
	},
	zipChange : function(component, event,helper) {
    	var zip = component.get("v.app.abd_Premise_Zip_Code__c").substr(0,5);
    	component.set("v.app.abd_Premise_Zip_Code__c",zip);        
	}
})