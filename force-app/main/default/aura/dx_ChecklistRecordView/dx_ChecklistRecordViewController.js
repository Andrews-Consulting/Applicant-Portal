({
	/*
	*
	* Initialization function.
	*
	*/
	doInit : function(component, event, helper) {

		helper.createView(component);
	},

	/*
	* Click handler for the edit button
	*
	*
	*/
	editRecord: function(component, event, helper) {

		helper.handleEdit(component);
	},

	/*
	*
	* Click handler for the delete button.
	*
	*/
	deleteRecord: function(component, event, helper) {

		//fire Delete event (param is the record)
		helper.handleDelete(component);
	}
})