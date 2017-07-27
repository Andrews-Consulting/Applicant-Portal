({
	setVisibility: function(component, event, helper){
        try{
        var action = component.get("c.getFieldVisibility");         // Set the routine to call in the controller
        action.setCallback(this, function(response){        // and when it returns, perform ....
            var rtnValue = response.getReturnValue();       // get the data and validate it, if null show an error
            if (rtnValue === null) {
                component.set("v.errorMessage",response.getReturnValue());
                component.set("v.showError",true);      
            }else{
                component.set("v.visibility",rtnValue);      // but if it's good, set the applicant value to the result.
            }
            console.log('Top Visibility');
            console.log(rtnValue);
        });
        $A.enqueueAction(action);  
        }catch(e) {
            alert(e);
        }
    },
    showToast : function(component, event, helper) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title":"",
            "message": component.get("v.errorMessage")
        });
        toastEvent.fire();
    }
})