({
	doInit : function(component, event, helper) {
        helper.getReviewApplication(component);
	},
	
	// Save Button code
    save : function(component, event, helper) {
    	console.log('Save Called');
        helper.doUpdate(component, event);
    },
    
    selectChange : function(component, event, helper) {
        component.set("v.review.MUSW__Status__c",(event.getSource().get("v.checked"))?'Additional Information Required':'');
        helper.getLicenses(component);
    },
    ClickButton: function (component, event, helper) {

 		var compName;
		var source = event.getSource();
		if (source) {
			compName = source.get("v.label");
			cmp = component.find(compName);
			if (cmp) 
			 	$A.util.toggleClass(cmp,'slds-is-open');
	 	}
    }
})