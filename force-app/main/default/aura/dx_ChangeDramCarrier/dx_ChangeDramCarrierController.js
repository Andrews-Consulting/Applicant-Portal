({
    doInit: function(component, event, helper) {
        helper.getApplication(component, event);
        helper.getDram(component, event);
    },

    // Save Button code
    save : function(component, event, helper) {
        helper.CreateApplication(component, event);
    },


})