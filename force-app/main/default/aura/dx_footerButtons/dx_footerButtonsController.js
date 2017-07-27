({
	handleLeft: function(cmp, event, helper) {
        var attributes = { url: cmp.get("v.leftButtonUrl")};
        $A.get("e.force:navigateToURL").setParams(attributes).fire();
    },
    
    handleCenter: function(cmp, event, helper) {
        var attributes = { url: cmp.get("v.centerButtonUrl")};
        $A.get("e.force:navigateToURL").setParams(attributes).fire();
    },
    
    handleRight: function(cmp, event, helper) {
        var attributes = { url: cmp.get("v.rightButtonUrl")};
        $A.get("e.force:navigateToURL").setParams(attributes).fire();
    }
})