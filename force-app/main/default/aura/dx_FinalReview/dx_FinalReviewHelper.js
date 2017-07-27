({
    initiateFinalReview : function(component, event, helper) {
        
        var recordId = component.get("v.recordId");
        
        var action = component.get("c.finalReviewProcess");
        action.setParams({ApplicationId:recordId});
        action.setCallback(this, function(response){
            try {            
                var state = response.getState();
                if (state === 'SUCCESS') {
                    var rtnValue = response.getReturnValue();
                    console.log(rtnValue);
                    if (rtnValue !== null) {
                        component.set("v.reviewReturn",rtnValue);
                        var incompletes = 0;
                        for (var i in rtnValue){
                            if (rtnValue[i].Status=="Incomplete"){
                                incompletes++;
                            }
                            console.log(rtnValue[i]);
                        }
                        if (incompletes===0){
                            console.log("Review Complete");
                            component.set("v.ShowNext", true);
                        } else {
                            //  FOR RENEE's TEST component.set("v.ShowNext", false);
                        }
                    }
                }
                else {      // error or incomplete comes here
                    var errors = response.getError();
                    if (errors) {
                        for (var erri = 0; erri < errors.length; erri++) {
                            component.set("v.errorMessage", 
                            component.get("v.errorMessage") + " : " + errors[erri].message );
                        }
                    }
                    else {
                        component.set("v.errorMessage", response.getReturnValue());
                    }
                    component.set("v.showError",true);                                  
                }
            } catch(e) {
                    alert(e.stack);
            }
            var nextAction = component.getEvent("spinnerOff");
            nextAction.setParams({"Component" : component});
            nextAction.fire();
        });
        $A.enqueueAction(action);
    }
})