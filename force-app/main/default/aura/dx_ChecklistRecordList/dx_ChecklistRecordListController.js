({
	/*
	* On initialization of the component, checks to see if the question has been answered already.
	* If there are answers, runs a function to get the child records (and then child records). 
	* If there aren't answers, runs a function to get just the fieldset.
	* 
	*/
	doInit : function(component, event, helper) {
		if (component.get("v.isRendered")){
			var answer = component.get("v.response");
			
			//if (answer.Name !== "Not Answered Yet") { 
				helper.getChildRecords(component);
			//} else {
				//helper.getFieldset(component);
			//}
		}
		//helper.handleReadMode(component);

	},

	/*
	* Event handler for the Create/Edit event passed by the form component. 
	* Stops further propagation of the event (in case of dependent questions), then
	* passes things off to the helper method.
	*
	*/

	saveRecord : function(component, event, helper) {

		event.stopPropagation(); // in case there are other RecordList cmps higher up
		helper.handleSaveRecord(component, event);

	},

	/*
	* This function gets called when the rest of the section gets saved. It handles saving 
	* information into the Answer object, does not save the child records. That is handled by the 
	* saveRecord function.
	* If has child records, sets response status to done and the response.Name to "Has Child Records",
	* then calls helper method (in ChecklistQuestions).
	*
	*
	*/
	saveAnswer : function(component, event, helper) {
		
		if (helper.isInCurrentSection(component, event)) {
			var childRecords = component.get("v.childRecords");
			var response = "";
			if (childRecords) {

				if (childRecords.length > 0) {

					response = childRecords.length + " related record(s)";
				}
				
				
			} 
 
			helper.handleResponse(component, response);
		}
		

	},

	/*
	* Click handler for the Add button. Set's the form's mode to create, then calls its method to
	* reset itself for a new record.
	*
	*/

	addNewRecord : function(component, event, helper) {
		console.log('Called Add New Record');
		component.set("v.formMode", "CREATE");
		component.set("v.renderForm", true);
		var form = component.find("bgck-record-form");
		form.set("v.mode", "CREATE");
		form.set("v.errorMessage", "");
		form.resetForm();
		form.set("v.isVisible", true);

	},

	/*
	*
	* This is still in progress. Out of scope for current JIRA ticket.
	*
	*/
	editRecord : function(component, event, helper) {
		
		helper.handleEdit(component, event);

		

	},

	/*
	* Event handler for the ChecklistRecordDeleteEvent. 
	*
	*
	*
	*/

	deleteRecordById : function(component, event, helper) {

		helper.handleDelete(component, event);
	},

	/*
	* Shows/Hides a small spinner in the question body, to show when the component is awaiting a response
	* from the server (loading exisiting child records, saving/editing records).
	*
	*/
	toggleSpinner : function(component, event, helper) {

		
		var spinner = component.find("record-spinner");
		$A.util.toggleClass(spinner, "slds-hide");
	}
})