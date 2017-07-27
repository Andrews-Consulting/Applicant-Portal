({
	doInit: function(component, event, helper) {
		console.log('Init: AuthorizedAgentList');

        helper.getAgentList(component, event);
        if (component.get("v.RecordIdIsApplication") !== true) {
        	var newAgentButton = component.find("newAgentButton");
        	if (! $A.util.isEmpty(newAgentButton))
        		$A.util.addClass(newAgentButton,"slds-hide");
        }
        
	},
	
	// Save Button code
    save : function(component, event, helper) {
        helper.doUpdate(component, event);
    },
    addNew : function (component, event, helper) {
        for (i = 0; i < 10; i++) {
            action = component.getEvent("NextOnlyEvent");
            if ($A.util.isEmpty(action)) 
                component = component.getOwner();
            else break;
        }

        var actionString = "Detail";
        action.setParams({"Component" : component , "Action": actionString});
        action.fire();  

//	    var urlEvent = $A.get("e.force:navigateToURL");
//	    urlEvent.setParams({"url": "/dx-pc-authorizedagentform?recordId=" + component.get("v.recordId")});
//	    urlEvent.fire();
	}, 
      CommitButtonPressed : function(component, event, helper) {
        var action = component.getEvent("CommitChange");
        action.setParams({"Component" : component , "Action": "RefreshView"});          
        action.fire();
    },
})