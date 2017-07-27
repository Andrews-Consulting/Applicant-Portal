({
    // Code that is replicated for every instance (typically list views or when multiple instances are displayed on a screen)
    // initialization code to populate the component
    doInit: function(component, event, helper) {
    	console.log('Init: OwnerForm');
    	helper.handleClassParam(component);
        helper.getOwner(component, event);
        helper.getPicklistValues(component, event);

        // we only need this when an owner doesn't exist. But this is the wrong place to check for it.
    	// helper.getType(component);      
	},

    // Save Button code
    save : function(component, event, helper) {
        helper.doUpdate(component, true);
    },
    // Handles when the selection on drop down for the Citizenship Question is changed
    // Get the selected value and set the value of the component.
    onSelectChange : function(component, event,helper) {
    	//helper.dependency(component);        
	},
	// onCheckChange : function(component, event,helper) {
 //    	component.set("v.owner.abd_Primary_Owner__c",event.getSource().get("v.checked"));
 //    },
    // handles entry in the business name or first name/last name field.
    onNameChange : function(component, event,helper) {
        var fieldname = event.getSource().get("v.name");

        if (fieldname == "BusinessName") {
            if (!$A.util.isEmpty(component.get("v.owner.Business_Name__c")))    // if something exists in the field, 
                component.set("v.isPersonName",false);                    // then turn off the other fields
            else
                component.set("v.isPersonName",true); 
        }
        else {      // If it's not the bus name field, it has to be the person's name
            if (!$A.util.isEmpty(component.get("v.owner.First_Name__c")) || 
                !$A.util.isEmpty(component.get("v.owner.Last_Name__c")) || 
                component.get("v.noBusinessAllowed"))
                component.set("v.isBusinessName",false);
            else
                component.set("v.isBusinessName",true);
        }

    },
	
	closeMessage : function (component,event, helper){
		/*helper.hidePopupHelper(component, 'modaldialog', 'slds-fade-in-');
	    helper.hidePopupHelper(component,'backdrop','slds-backdrop--');*/
	}
})