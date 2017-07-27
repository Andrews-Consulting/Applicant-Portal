({
    // Lightning:Button isn't working with the locker service yet (turned on with Spring 17 deployment)
    // when it is, we should be able to replace the event.currentTarget.name with event.getSource().get("v.name");
    //      
    //      var urlvalue = event.getSource().get("v.name");
    
// Common code with locker service turned off
    handleButtonClick : function(component, event, helper) {
        var urlEvent = $A.get("e.force:navigateToURL");
        var urlvalue = event.currentTarget.name;
        urlEvent.setParams({"url": urlvalue});
        urlEvent.fire();

    }

})