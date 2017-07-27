({
	// Call the controller to get the Citizenship values for the drop down box.  (not the result, but all of the choices)
    getPicklistValues: function(component){
        try {
        	console.log('Get Picklist');
            var action = component.get("c.getPicklistValues");    // Set the routine to call in the controller
            action.setCallback(this, function(response){
                var rtnValue = response.getReturnValue();   
                if (rtnValue === null) {                        // validate that the controller succeeded in getting values.
                    component.set("v.errorMessage",response.getReturnValue());
                    component.set("v.showError",true);
                }else{
                	var agent = JSON.parse(JSON.stringify(component.get("v.agent")));
                	var list = rtnValue;
                	var opts = [];
                	if(agent.abd_Auth_Agent_State__c==null)
                		agent.abd_Auth_Agent_State__c=list[0];
                	for(var i=0;i<list.length;i++){
                		var selected = (list[i] == agent.abd_Auth_Agent_State__c);
                		opts.push({label:list[i], value:list[i], selected:selected});
                	}
                	component.find("state").set("v.options",opts);
                	component.set("v.agent",agent);
                }
            });
    		$A.enqueueAction(action);
        }
        catch(e) {
            alert(e);
        }
    },

    CommitCheck: function(component){
        if (!$A.util.isEmpty(component.get("v.ShowCommit"))) {
            var commitflag = component.get("v.ShowCommit");
            if (!commitflag) {
                component.set("v.ShowCommit",true);
                alert('Press Confirm Change or Next Button to complete the Delete process.');
            }
        }
    }
})