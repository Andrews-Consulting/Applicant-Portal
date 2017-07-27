({
    // Code that is replicated for every instance (typically list views or when multiple instances are displayed on a screen)
    // initialization code to populate the component
    doInit1: function(component, event, helper) {
        //console.log(component.get('v.application'));
        //helper.getApplication(component, event);
        //helper.getPicklistValues(component, event);
    },
    setApp: function(component, event, helper) {
        var application = event.getParam("Pass_App");
        var visibility = event.getParam("Pass_Visibility");
        component.set("v.application",application);
        component.set("v.visibility",visibility);
        console.log('Visibility');
        console.log(visibility);
        //helper.getApplication(component, event);
        helper.getPicklistValues(component, event);
    },
    // Save Button code
    save : function(component, event, helper) {
        //helper.spinnerOn(component, event);                    // Show the spinner
        helper.doUpdate(component, event);
    },

    // Handles when the selection on drop down for the Citizenship Question is changed
    // Get the selected value and set the value of the component.
    onSelectChange : function(component, event) {
        var selected = component.find("lItems").get("v.value");
        console.log('lItems : '+component.find("lItems"));
        console.log('lItems Selected: '+selected);
        component.set("v.application.abd_Temporary_or_Permanent__c",selected);
		selected = component.find("sItems").get("v.value");
        console.log('sItems : '+selected);
        if(selected!=='IA'){
            component.find("cItems").set("v.value","--None--");
        }
        component.set("v.application.abd_Premise_State__c",selected);
		selected = component.find("cItems").get("v.value");
        console.log('cItems : '+selected);
        component.set("v.application.abd_Premise_County__c",selected);        
	}
})