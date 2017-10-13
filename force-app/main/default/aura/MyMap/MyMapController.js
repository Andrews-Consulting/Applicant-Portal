({
    init: function(component, event, helper) {
        console.log('init');
        var planes = [];
        try {
            console.log('Get Premises');
            var action = component.get("c.getPremises");    // Set the routine to call in the controller
            //action.setParams({"ownerId": component.get("v.owner.Id"), "appId" : component.get("v.recordId")});
            action.setCallback(this, function(response){
            	var rtnValue = response.getReturnValue();
                if (rtnValue === null) {                        // display any errors from the controller.
                    component.set("v.errorMessage",response.getReturnValue());
                    component.set("v.showError",true);
                }else{
                    for(var i in rtnValue){
                        planes.push(rtnValue[i]);
                    }
                }
                console.log(planes);
                component.set("v.planes",planes);
                helper.jsLoaded(component);
            });
            $A.enqueueAction(action);
        }
        catch(e) {
            alert(e);
        }
        
        
    }
})