({
	doInit: function(component, event, helper) {
        helper.getApplication(component, event);
        helper.getPicklistButton(component, event);
    },

    // Save Button code
    save : function(component, event, helper) {
        helper.UpdateApplication(component, event);
    },
    addNew : function (component, event, helper) {
        var num = component.get("v.numberAdd");
        console.log(num);
        if (!$A.util.isEmpty(num) && num > 0) {
        	helper.getNewOwners(component);
        	component.set("v.numberAdd",0);
    	} 
	},
	radioChange : function(component, event,helper) {
		var application = JSON.parse(JSON.stringify(component.get("v.app")));
		application.abd_Temporary_or_Permanent__c = event.getSource().get("v.value");
		component.set("v.app",application);
	}
    
})