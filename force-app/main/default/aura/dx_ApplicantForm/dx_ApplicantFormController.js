({
    // Code that is replicated for every instance (typically list views or when multiple instances are displayed on a screen)
    // initialization code to populate the component
    doInit: function(component, event, helper) {
        helper.getContact(component, event);
        helper.getCitizenType(component, event);
    },

    // Save Button code
    save : function(component, event, helper) {
        helper.spinnerOn(component, event);                    // Show the spinner
        helper.doUpdate(component, event);
    },
    handleCreate: function (component, event, helper) {
        helper.spinnerOn(component, event);
        helper.doUpdate(component);
    },
    handleCreateExit: function (component, event, helper) {
        component.set("v.exit",true);
        helper.spinnerOn(component, event);
        helper.doUpdate(component);
    },
    handleCancel: function (component, event, helper){
    	helper.handleCancel(component);
    },
    // Handles when the selection on drop down for the Citizenship Question is changed
    // Get the selected value and set the value of the component.
    onSelectChange : function(component, event) {
        var selected = component.find("lItems").get("v.value");
        component.set("v.applicant.abd_U_S_Citizen__c",selected);        
	}
})