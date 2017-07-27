({
    init : function(component, event, helper) {
    
    },

    //  The button routine invoked a save function
    // We need to circle through all of the embedded components and force a save on each
    saveInvoked: function(component, event, helper) {
    	try {
	 	  	var nextParameter = event.getParam("NextAction");
	 	  	component.set("v.SectionCounts",0);

	 	  	// find all of the display sections -- ALL MUST HAVE AN AURA:ID of PageSection
	 	  	// for each one of them, call the save function.
	 	  	// 
    		var cmplist = component.find("PageSection");
    		for (var i = 0; i < cmplist.length; i++) {
		    	cmplist[i].PerformSave(component, event);
   				}
	    	component.set("v.ParmHold", nextParameter); 

		}
        catch (e) { alert(e); }
    },

    //  The button routine invoked a next function, just head there.
    nextOnlyInvoked: function(component, event, helper) {
        try {
            var evt = $A.get("e.force:navigateToURL");
            evt.setParams({"url": event.getParam("url")});  // get our parm and push it to the next call.
            evt.fire();    
        }
        catch(e) {alert(e);}
    },

    // When ever a section completes a save, it calls this routine.
    // WE know how many components were called to perform a save (SectionCounts)
    // so we'll use that number to know if everyone was successful.
    // 
    SaveComplete: function(component, event, helper) {
    	try {

    		
    		var sc = component.get("v.SectionCounts"); 
    		sc--;
			component.set("v.SectionCounts",sc); 
			if (sc != 0) return;

			var nextParameter = component.get("v.ParmHold");
	    	// Parse the next action
	    	var nextAction;
	    	//  In the source, we have to use a semi-colon in the pair designation, since the colon is handled 
	    	//  elsewhere in the environment.  This is only used for he NextPage command at this time.
	    	if (nextParameter.search(';') > -1) {
	    		var parms = nextParameter.split(';');
	    		nextAction = parms[0];
				var urlValue = parms[1];
	    	}
	    	else nextAction = nextParameter;
	    	
	    	if (nextAction == "NextPage") {
				var nextEvt = $A.get("e.force:navigateToURL");
				nextEvt.setParams({"url": urlValue + "?recordId=" + component.get("v.recordId")});
				nextEvt.fire(); 
	    	}

	    	if (nextAction == "RefreshView") {
	       		$A.get("e.force:refreshView").fire();
	    	}

	    	if (nextAction == "Exit") {
				var nextEvt = $A.get("e.force:navigateToURL");
				nextEvt.setParams({"url": "/"});
				nextEvt.fire(); 
	    	}


    	}
        catch (e) { alert(e); }
    }
})