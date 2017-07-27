({
	doInit: function(component, event, helper){
		helper.getPicklistValues(component, event);
	},
	removeAgent: function(component, event, helper){
		component.set("v.delete",true);
		helper.CommitCheck(component);
	},
	
	// This routine is not in use
	// handleChange: function(component, event, helper){
	// 	var agent = JSON.parse(JSON.stringify(component.get("v.agent")));
	// 	var name = event.getSource().get("v.name");
	// 	agent[name] = event.getSource().get("v.value");
	// 	component.set("v.agent",agent);
	// 	helper.CommitCheck(component);
	// },
	// onSelectChange: function(component, event, helper){
	// 	var state = component.find("state");
	// 	if (!$A.util.isEmpty(state)) {
	// 		var selected = state.get("v.value");
	// 		if (selected != '--NONE--')
	// 			component.set("v.agent.abd_Auth_Agent_State__c",selected);
	// 		else
	// 			component.set("v.agent.abd_Auth_Agent_State__c",null);
	// 		helper.CommitCheck(component);
	// 	}
	// },
	navigateToAuthorizedagent: function(component, event, helper){
		var agent = JSON.parse(JSON.stringify(component.get("v.agent")));
		for (i = 0; i < 10; i++) {
			action = component.getEvent("NextOnlyEvent");
			if ($A.util.isEmpty(action)) 
				component = component.getOwner();
			else break;
		}
        var actionString = "Detail \&id=" + agent.Id;
        action.setParams({"Component" : component , "Action": actionString});
        action.fire(); 		
	}
})