({
    // Code that is replicated for every instance (typically list views or when multiple instances are displayed on a screen)
    // initialization code to populate the component
    doInit: function(component, event, helper) {
    	console.log('Init: OwnerForm');
	    //component.set("v.oldOwner",component.get("v.owner"));
	    helper.getPicklistValues(component, event);
        
        var person = true;
        var business = true;

        //  if something is in these or we don't allow businesses, then turn off the business name field. 
        if (!$A.util.isEmpty(component.get("v.owner.First_Name__c")) || 
            !$A.util.isEmpty(component.get("v.owner.Last_Name__c")) || 
            component.get("v.noBusinessAllowed")) {
            business = false;
            }
        else if (!$A.util.isEmpty(component.get("v.owner.Business_Name__c")))    
            person = false;

        // Set them once at the end to prevent change handlers from firing multiple times.
        component.set("v.isPersonName",person); 
        component.set("v.isBusinessName",business);
	},

    // Save Button code
    CommitButtonPressed : function(component, event, helper) {
        helper.validateFields(component);
    },
    // Handles when the selection on drop down for the Citizenship Question is changed
    // Get the selected value and set the value of the component.
    onSelectChange : function(component, event,helper) {
    	//helper.dependency(component);        
	},
	ssnFormat : function(component, event,helper) {
    	var ssn = component.get("v.owner.SSN__c");
    	var ssLen = ssn.length;
    	if(isNaN(ssn.substring(ssLen-1)))
    		ssn = ssn.substring(0,ssLen-1);
    	ssLen = ssn.length;
    	switch (ssLen){
    		case 3: case 6:
    			ssn+='-';
    			break;
			default:
				break;
    	}
    	component.set("v.owner.SSN__c",ssn);        
	},
    // handles entry in the business name or first name/last name field.
    onNameChange : function(component, event,helper) {
        var fieldname = event.getSource().get("v.name");

        var person = true;
        var business = true;

        //  if something is in these or we don't allow businesses, then turn off the business name field. 
        if (!$A.util.isEmpty(component.get("v.owner.First_Name__c")) || 
            !$A.util.isEmpty(component.get("v.owner.Last_Name__c")) || 
            component.get("v.noBusinessAllowed")) {
            business = false;
            }
        else if (!$A.util.isEmpty(component.get("v.owner.Business_Name__c")))    
            person = false;

        // Set them once at the end and only if changing to prevent change handlers from firing multiple times.
        if (component.get("v.isPersonName") != person)
            component.set("v.isPersonName",person); 

        if (component.get("v.isBusinessName") != business)
            component.set("v.isBusinessName",business);

    },
	
	CancelButtonPressed : function (component,event, helper){
		var oldOwner = component.get("v.oldOwner");
		component.set("v.owner",oldOwner);
		component.set("v.editRow",null);
	},
	zipFormat: function(component, event,helper) {
		var zip = component.get("v.owner.Zip_Code__c");
		var zipLen = zip.length;
		zipLen = zip.length;
		if(!isNaN(zip)){
			switch (zipLen){
				case 9:
	    			zip = zip.substring(0,5)+'-'+zip.substring(5);
	    			break;
				default:
					break;
			}
		}
		component.set("v.owner.Zip_Code__c",zip);
	}
})