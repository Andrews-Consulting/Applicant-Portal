({
   	getFee: function(component, event, helper) {
    	helper.getFees(component, event); 
},

	handleComponentCoordination: function(component, event, helper) {
		var ccParms = event.getParams();
		// Must be complete to process
		if ($A.util.isEmpty(ccParms) || $A.util.isEmpty(ccParms.Scope) || $A.util.isEmpty(ccParms.Action) || $A.util.isEmpty(ccParms.ComponentName))
			return;
		// must be for our component
		if (ccParms.ComponentName != 'dx_FeeDisplay') 
			return;
		if (ccParms.Scope == 'nonMaster' && !component.get("v.isMaster")) {
			if (ccParms.Action == 'Update') {
				component.set("v.estimate",ccParms.Value);
			}
		}
		else if (ccParms.Scope == 'Master'  && component.get("v.isMaster"))  {


		}


	}

})