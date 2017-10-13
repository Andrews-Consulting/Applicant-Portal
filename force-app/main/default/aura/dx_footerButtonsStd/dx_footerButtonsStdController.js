({
    // just tell them to head off to the next URL
    SkipButtonPressed : function(component, event, helper) {
        var action = component.getEvent("dx_NextOnlyInvoked");
        action.setParams({"Component" : component , "Action": "Next"});
        action.fire();    
    },
    // For this one, Fire the save event 
    NextButtonPressed : function(component, event, helper) {
        var action = component.getEvent("dx_SaveInvoked");
        action.setParams({"Component" : component, "Action": "Next"});
        action.fire();
    },
    // In this case, fire the save event and if successful, force a navigation to the same page we're on.
    // This rebuilds the URL as a clean URL, not pointing to the previous record.
    SaveAddButtonPressed : function(component, event, helper) {
        var action = component.getEvent("dx_SaveInvoked");
        action.setParams({"Component" : component , "Action": "Same"});          
        action.fire();
    },
    // in this case, we're going to save and then exit
    SaveExitButtonPressed : function(component, event, helper) {
        var action = component.getEvent("dx_SaveInvoked");
        action.setParams({"Component" : component , "Action": "Exit"});  
        action.fire();        
    },
    ExitNoSaveButtonPressed : function(component, event, helper) {
        var action = component.getEvent("dx_NextOnlyInvoked");
        action.setParams({"Component" : component , "Action": "Exit"});    
        action.fire();    
    }  
})