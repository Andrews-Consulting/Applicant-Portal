({
    doInit: function(component, event, helper) {
        helper.getApplication(component, event);
    },

    // Save Button code
    save : function(component, event, helper) {
        helper.UpdateApplication(component, event);
    },
    
	radioChange : function(component, event,helper) {
		var application = JSON.parse(JSON.stringify(component.get("v.app")));
		application.abd_Temporary_or_Permanent__c = event.getSource().get("v.value");
		component.set("v.app",application);
	}

})