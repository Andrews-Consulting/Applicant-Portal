({
/* toggle the display of the menu */
	OpenSearchForm : function(component, event, helper) {
        var hideShowText = component.find("iowa_sliver_search_form");
        $A.util.toggleClass(hideShowText, "HideSearchForm");
    }
})