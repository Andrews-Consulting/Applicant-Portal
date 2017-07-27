({
    doInit : function(component, event, helper) {

        var recordId = component.get("v.recordId");
        var lTypes = '';
        var action = component.get("c.getAvailbleIcons"); // apex controller routine
        action.setParams({"recordId": recordId});
        action.setCallback(this, function(response){
            try {            
                var state = response.getState();
                if (state === 'SUCCESS') {
                    component.set("v.Icons",response.getReturnValue());                    // return value
                }
                else {      // error or incomplete comes here
                    var errors = response.getError();
                    if (errors) {
                        for (var erri = 0; erri < errors.length; erri++) {
                            component.set("v.errorMessage", component.get("v.errorMessage") + " : " + errors[erri].message );   
                        }
                        component.set("v.showError",true);
                    }
                }

            } catch(e) {
                alert(e.stack);

            }
        });
        $A.enqueueAction(action); // queue the work.
    }
})