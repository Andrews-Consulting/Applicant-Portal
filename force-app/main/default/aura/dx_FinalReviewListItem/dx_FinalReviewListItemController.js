({
    goToPage: function(component, event, helper) {
        var itm = component.get("v.item");
        var rId = component.get("v.recordId");
        console.log(itm);
        console.log('/' + itm.Page+rId);
        if (itm.Page!=''){
        	$A.get("e.force:navigateToURL").setParams({"url": itm.Page+rId}).fire();
        }

	}
})