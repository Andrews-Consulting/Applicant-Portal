({

	/*
	* Gets the Id of the current question and the API Name of its potential child objects.
	* Calls the getChildRecords() function on the apex controller.
	* Once that's successfully completed, sets the components childRecords attribute,
	* then handles getting the fieldset. 
	*
	* @param component Reference to component object
	* @return void
	*
	*/
	getChildRecords : function(component) {
		
		//var question = component.get("v.question");
		var answerId = component.get("v.response").Id;
		var apiName = component.get("v.APIName");
		var recordAction = component.get("c.getChildRecords");
		var childRecords = component.get("v.childRecords");
		if (!childRecords) {
			childRecords = [];
		}
		recordAction.setParams({ 'answerId' : answerId, 'childObjectName' : apiName });
		recordAction.setCallback(this, function(response){
			var state = response.getState();
			if (component.isValid() && state === 'SUCCESS') {
				childRecords.push(response.getReturnValue());
				component.set("v.childRecords", childRecords[0]);
				if (childRecords[0].length > 0) {
					var table = component.find("bgck-table");
					$A.util.removeClass(table, "slds-hide");
					console.log('Has Children');
				}
				
				this.getFieldset(component);
			}
		});

		$A.enqueueAction(recordAction);
	},
	
	/*
	* Passes the API names of the child object and its fieldset to the apex controller's 
	* getFieldSetFields() function. Once thta's successfully completed, sets the component's
	* view and full fieldset attributes.
	*
	* @param component
	* @param void
	*
	*/
	getFieldset : function(component) {


		//var question = component.get("v.question");
		var apiName = component.get("v.APIName");
		var fieldsetAPI = component.get("v.fieldsetAPI");
		var viewLength = component.get("v.viewLength");

		var fieldAction = component.get("c.getFieldSetFields");
		fieldAction.setParams({
			'objectAPIName' : apiName,
			'fieldSetName' : fieldsetAPI
		});
		fieldAction.setCallback(this, function(response){
			var state = response.getState();
			if(component.isValid() && state === 'SUCCESS') {

				component.set("v.APIName", apiName);
				component.set("v.fieldsetAPI", fieldsetAPI);
				var fieldset = response.getReturnValue();
				
				var viewFieldset = fieldset.slice(0, viewLength);
				component.set("v.fullFieldset", fieldset);
				component.set("v.viewFieldset", viewFieldset);
				
			}
		});
		$A.enqueueAction(fieldAction);
	},

	/*
	*
	* Event handler for Create/Edit event. Handles choosing whether it's a create event or an 
	* edit event (based on the parameters passed through the event). Once the record has been saved,
	* adds the returned record to the component's list of child records (so it renders in the view), 
	* then either closes the form or resets the form (depending on if user clicked Save or Save&New).
	* 
	* @param component
	* @param event
	*
	*/

	handleSaveRecord : function(component, event){
		
		var params = event.getParams();
		var mode = params.mode;
		var createNewAfter = params.createNewAfter;
		var record = params.record;
		console.log(record);
		var answer = component.get("v.response");
		record.Application__c = answer.Application__c;
		record.Application2__c = answer.Application__c;//Violation Application field
		record.Answer__c = answer.Id;
		var parsedRecord = this.parseRecord(component, record);
		var saveAction;
		var childRecords = component.get("v.childRecords");
		saveAction = component.get("c.createUpdateRecord");
		saveAction.setParams({'JSONRecord' : parsedRecord});
				
		saveAction.setCallback(this, function(response){

			var state = response.getState();
			if (component.isValid() && state === "SUCCESS") {
				if (mode === "CREATE") {
					if(response.getReturnValue()) {
						childRecords.push(response.getReturnValue());
					} else {
						this.handleError(component);
					}
					component.set("v.childRecords", childRecords);
					var table = component.find("bgck-table");
					$A.util.removeClass(table, "slds-hide");
				} else {
					this.handleEditingView(component, response);
				}

				if(createNewAfter) {
					this.resetForm(component);
				} else {
					this.closeForm(component);
				}
			} else {
				
				this.handleError(component, response.getError());
			}
			var aName = childRecords.length+' related record(s)';
			answer.Name = aName;
			answer.BGCK__Actual_Value__c = aName;
			answer.BGCK__Actual_Value2__c = aName;
			component.set("v.response",answer);
		});

		$A.enqueueAction(saveAction);
	},

	/*
	* Parses the record object into the format expected by the apex controller. Adds the parent 
	* object id's as parameters. 
	* @param component
	* @param record Object
	*
	*/

	parseRecord : function(component, record) {

		var stringRecord = "";
		var type = component.get("v.APIName");

		if (!record.attributes) {
			
			var attributes = '"attributes":{"type":"' + type +'"},';
			stringRecord = JSON.stringify(record);
			stringRecord = stringRecord.replace("{","{" + attributes);
			stringRecord = '{"Data": ' + stringRecord + '}';
		
		} else {
			stringRecord = '{"Data": ' + JSON.stringify(record) + '}';
		}
		
		return stringRecord;
		
	},

	/*
	* Sets the mode of the form component to CREATE then calls its reset method.
	* @param component
	*
	*/

	resetForm : function(component) {

		var form = component.find("bgck-record-form");
		form.set("v.mode", "CREATE");
		form.resetForm();
	},

	/*
	* Finds the form component and hides it.
	* @param component
	*/

	closeForm : function(component) {
		var form = component.find("bgck-record-form");
		form.set("v.isVisible", false);
	},

	/*
	*
	* If an error is returned when user tries to save a record, this finds the message and passes it to the form
	* so that it shows to the user.
	* @param component
	* @param errors Error object returned from salesforce
	*
	*
	*/

	handleError : function(component, errors) {

		var form = component.find("bgck-record-form");
		var message = "";
		if (errors) {
			if (errors[0] && errors[0].pageErrors[0] && errors[0].pageErrors[0].message) {
				message = errors[0].pageErrors[0].message;
			} else {
				message = "There was an error saving this record. Please check your inputs or contact your system administrator for assistance.";
			}
		}

		form.showError(message);
	},

	/*
	* Calls the apex controller's deleteRecord() function, passing the id of the record to be completed.
	* Upon successful deletion, calls a method to remove deleted record from the view.
	*
	*
	*
	*/

	handleDelete: function(component, event) {
		
		var params = event.getParams();
		var recordId = params.recordId;
		
		var deleteAction = component.get("c.deleteRecord");
		deleteAction.setParams({ 'recordID' : recordId });
		deleteAction.setCallback(this, function(response) {

			var state = response.getState();
			if (component.isValid() && state === 'SUCCESS') {
				
				this.removeRecordFromView(component, recordId);

			} else {
				
			}
		});
		$A.enqueueAction(deleteAction);
	},

	/*
	* Finds the deleted record and removes it from the local copy of child records
	* @param component
	* @param recordId String of the record that was deleted.
	*
	*
	*/
	removeRecordFromView : function(component, recordId) {
		var childRecords = component.get("v.childRecords");
		var updatedRecords = childRecords.filter(function(record) {
			
			var notDeleted;
			if (record.Id === recordId) {
				notDeleted = false;
			} else {
				notDeleted = true;
			}
			return notDeleted;
			
		});

		if (updatedRecords.length < 1) {
			var table = component.find("bgck-table");
			$A.util.addClass(table, "slds-hide");
		}
		var answer = component.get("v.response");
		answer.Name = updatedRecords.length+' related record(s)';
		component.set("v.response",answer); 
		component.set("v.childRecords", updatedRecords);
	},

	/*
	*
	* Sets up the ChecklistRecordEditCreate form with a record object to edit. 
	* @param component
	* @param event
	*
	*/
	handleEdit : function(component, event) {

		var recordId = event.getParams().recordId;
		var childRecords = component.get("v.childRecords");
		var recordToEdit = childRecords.find(function(rec){
			var isTheRecord = false;
			if (rec.Id === recordId) {
				isTheRecord = true;
			}
			return isTheRecord;
		});
		
		component.set("v.renderForm", true);
		var form = component.find("bgck-record-form");
		component.set("v.formMode", "EDIT");
		form.set("v.record", recordToEdit);
		form.set("v.mode", "EDIT");
		form.set("v.isVisible", true);
		form.resetForm();
	},

	/*
	* Sets the updated response into the view.
	* @param component
	* @param response Object from the callback
	*
	*
	*/
	handleEditingView : function(component, response) {
		
		var updatedRecord = response.getReturnValue();
		var childRecords = component.get("v.childRecords");
		var editedIndex = childRecords.findIndex(function(rec){
			var found = (rec.Id === updatedRecord.Id);
			return found;
		});
		childRecords[editedIndex] = updatedRecord;
		component.set("v.childRecords", childRecords);
	},
	/*
    * Handles putting questions into read mode by setting the isReadMode attribute to be true (this is then handled in markup)
    *
    */
    handleReadMode : function(component) {

        var mode = component.get("v.mode");

        if(mode === "read") {

            component.set("v.isReadMode", true);
        }

    }
})