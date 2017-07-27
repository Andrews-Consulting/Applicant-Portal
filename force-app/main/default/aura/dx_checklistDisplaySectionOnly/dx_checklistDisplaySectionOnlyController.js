({
    init: function(component, event, helper) {  
        console.log('Init: checklistDisplaySectionOnly');
     		helper.getRecordsForPage(component);
    },    

    //  For all of the questions in this section, we need to create a 
	save : function(component, event, helper) {
        helper.doUpdate(component, event);
    },


    handleValueChange: function(component, event, helper) {
        helper.valueChange(component, event);
    }
})