({
    navigate: function(cmp, event, helper) {
        $A.get("e.force:navigateToURL").setParams({"url": cmp.get("v.navURL")}).fire();
    }
})