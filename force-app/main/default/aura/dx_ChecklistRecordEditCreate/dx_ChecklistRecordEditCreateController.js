({
    /*
    *
    * Initialization function.
    *
    */
	doInit : function(component, event, helper) {
		console.log('Called Child Init');
		helper.createForm(component);
	},

    /*
    * Resets the form to be referencing a blank object. Called when this component's resetForm method is called
    * by parent component.
    *
    *
    */
    resetForm : function(component, event, helper) {

        helper.createForm(component);
    },

    /*
    * Click handler for the cancel button and the close button on the top of the modal.
    * Hides the component.
    *
    *
    */

    closeModal : function(component, event, helper) {
    	 
    	component.set("v.isVisible", false);
    },

    /*
    * Click handler for the save button. Sets createNewAfter to false so that the parent component will close
    * the modal after saving the record.
    *
    *
    */
    clickSave: function(component, event, helper) {


    	helper.handleSave(component);

    },


    showErrorMessage : function(component, event, helper) {

        // $A.util.addClass(component.find("save-record-spinner"), "slds-hide");
        var params = event.getParams();
        var message = params.arguments.message;
        component.set("v.errorMessage", message);
    }
})