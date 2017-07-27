({
	afterRender: function (component, helper) {
        this.superAfterRender();
        helper.getFieldDefinition(component);
        // interact with the DOM here
	}
})