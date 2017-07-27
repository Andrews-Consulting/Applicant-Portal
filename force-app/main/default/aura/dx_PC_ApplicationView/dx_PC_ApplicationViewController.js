({
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