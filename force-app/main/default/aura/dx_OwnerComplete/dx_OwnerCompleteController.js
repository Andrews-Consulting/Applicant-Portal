({
	// Init routine called
    doInit : function(component, event, helper) {
		//  At this point, the parent is initialized (or not as the case may be).
		// Let's call the inner component's init routine
        var activecmp = component.find(component.get("v.ActiveCmp")); 

        if (! $A.util.isUndefined(activecmp)) {
		    if ($A.util.isArray(activecmp)) {
	            component.set("v.ActiveCmpCount",activecmp.length);
	            for (var i = 0; i < activecmp.length; i++ ) {
	                activecmp[i].PerformInit(component, event);
	            }
	        }
	        else { 
	            component.set("v.ActiveCmpCount",1);
	            activecmp.PerformInit(component, event);
		    }
		}
	}, 
	EmptyComponent: function(component, event, helper) {
		// If we are dispalying a license, then just skip this function, 
		// otherwise call the version attached to the abstract
		if (component.get("v.RecordIdIsApplication") === true) {
			var cmp = component;
			var i = 5; 	// don't go more than 5 levels away
			var found = false;
			while (i-- > 0 && !found) {
				// check on this element
				if (! $A.util.isEmpty(cmp.EmptyComponent)) {
					cmp.EmptyComponent();
					found = true;
				}
				// check the base class
				if (! $A.util.isEmpty(cmp.getSuper))
					if (! $A.util.isEmpty(cmp.getSuper().EmptyComponent)) {
						cmp.getSuper().EmptyComponent();
						found = true;
					}
				// if we didn't find our routine, go for the parent component
				if (!found) cmp = cmp.getOwner();
				}
			}
		}
})