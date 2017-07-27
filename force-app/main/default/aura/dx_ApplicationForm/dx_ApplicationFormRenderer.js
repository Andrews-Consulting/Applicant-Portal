({
	// Your renderer method overrides go here
	afterRender: function (component, helper) {
        this.superAfterRender();
        if(component.get("v.showError")==true)
        	component.find("error").getElement().focus();
        // interact with the DOM here
	}
})