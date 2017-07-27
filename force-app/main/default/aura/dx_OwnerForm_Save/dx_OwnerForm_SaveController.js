({
    // Code that is replicated for every instance (typically list views or when multiple instances are displayed on a screen)
    // initialization code to populate the component
    doInit: function(component, event, helper) {
        //helper.getAccount(component, event);
        console.log('Init');
        helper.getOwner(component, event);
        helper.getPicklistValues(component, event);
	    helper.getType(component);
	},

    // Save Button code
    handleCreate : function(component, event, helper) {
    	helper.spinnerOn(component, event);                    // Show the spinner
        helper.doUpdate(component, event);
    },
    handleSkip : function (component, event, helper) {
	    helper.goToNext(component,event);
	},
    handleCreateExit : function(component, event, helper) {
        helper.spinnerOn(component, event);                    // Show the spinner
        helper.doUpdate(component, event);
        helper.handleCancel(component);
    },
    handleCreateNext : function(component, event, helper) {
        helper.spinnerOn(component, event);                    // Show the spinner
        helper.doUpdate(component, event);
        if(!component.get("v.showError"));
			helper.goToNext(component);
    },
    handleCancel: function (component, event, helper){
    	helper.handleCancel(component);
    },
    // Handles when the selection on drop down for the Citizenship Question is changed
    // Get the selected value and set the value of the component.
    onSelectChange : function(component, event,helper) {
    	//helper.dependency(component);        
	},
	onCheckChange : function(component, event,helper) {
    	component.set("v.owner.abd_Primary_Owner__c",event.getSource().get("v.checked"));
    },
	gotoURL : function (component, event, helper) {
		helper.doUpdate(component, event);
		if(!component.get("v.showError"));
			helper.gotoURL(component,event);
    },
	closeMessage : function (component,event, helper){
		/*helper.hidePopupHelper(component, 'modaldialog', 'slds-fade-in-');
	    helper.hidePopupHelper(component,'backdrop','slds-backdrop--');*/
	}
})