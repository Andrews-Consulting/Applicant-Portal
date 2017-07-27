({
	afterRender: function (component, helper) {
        this.superAfterRender();
        helper.setPicklistValues(component);
        // interact with the DOM here
	}
})