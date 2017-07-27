({

	/*
	* Takes the fieldset array and record object and creates a values object that has the label and value
	* to iterate through and create the view for the table. Values object is just a placeholder to simplify 
	* the frontend of this component.
	*
	*
	*/
	createView : function(component) {
		
	
			var record = component.get("v.record");
			var fieldset = component.get("v.fieldset");
			var values = [];
			var field = null;

			for (var i = 0; i < fieldset.length; i++) {
				field = fieldset[i];
				if (field.type == 'DATE') {
					var d = new Date(new Date(record[field.fieldPath]).getTime() + new Date().getTimezoneOffset()*60*1000 );
					values.push({ 'label': field.label, 'value': d.toLocaleDateString()});	
				}
				else
					values.push({ 'label': field.label, 'value': record[field.fieldPath]});
			}

			component.set("v.values", values);
	
		
	},

	/*
	*
	* This passes the Id of the record to be edited to the parent component via the editRecord event.
	* @param component
	* @return void
	*
	*/ 
	handleEdit : function(component){

		var recordId = component.get("v.record.Id");
		var evt = component.getEvent("editRecord");
		evt.setParams({ 'recordId' : recordId });
		evt.fire();
	},

	/*
	* This passes the Id of the record to be deleted to the parent component viat the deleteRecord event.
	* @param component
	* @return void
	*
	*
	*/
	handleDelete : function(component) {
	
		var record = component.get("v.record");
		var recordId = component.get("v.record.Id");
		var evt = component.getEvent("deleteRecord");
		evt.setParams({ 'recordId' : recordId });
		evt.fire();
	}
})