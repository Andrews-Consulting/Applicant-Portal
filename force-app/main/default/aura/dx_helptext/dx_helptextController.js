({
    init: function(component, event, helper) {
                console.log("help text controller init function");
        try{
        	var action = component.get("c.getHelpText");         // Set the routine to call in the controller
        	 action.setParams({"keyvalue": "Initial"});		// Hard code for testing.
            action.setCallback(this, function(response){        // and when it returns, perform ....
                var rtnValue = response.getReturnValue();       // get the data and validate it, if null show an error
                if (rtnValue === null) {
                    component.set("v.HelpText",response.getReturnValue());
                }else{
                    component.set("v.HelpText",rtnValue);      // but if it's good, set the applicant value to the result.
                }
            });
    		$A.enqueueAction(action);                           // put this item on the queue to execute.
        }
        catch(e) {
            alert(e);
        }
     },

    
    setHelpText: function(component, event, helper) {
        console.log("help text controller set help text");
        try{

            var keyvalue = event.getParam("HelpTextKey");         

            var action = component.get("c.getHelpText");         // Set the routine to call in the controller
            action.setParams({"keyvalue": keyvalue});      // but if it's good, set the applicant value to the result.
            action.setCallback(this, function(response){        // and when it returns, perform ....
                var rtnValue = response.getReturnValue();       // get the data and validate it, if null show an error
                if (rtnValue === null) {
                    component.set("v.HelpText",response.getReturnValue());
                }else{
                    component.set("v.HelpText",rtnValue);      // but if it's good, set the applicant value to the result.
                }
            });

            $A.enqueueAction(action);                           // put this item on the queue to execute.

        }
        catch(e) {
            alert(e); 
        }
    }
})