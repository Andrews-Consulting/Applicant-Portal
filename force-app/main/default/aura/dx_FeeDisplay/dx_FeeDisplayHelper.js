({
      getFees: function(component, event) {
        try {

            if (component.get("v.isActive"))
                return; 
            else component.set("v.isActive",true);


 			var appinfo = component.get("v.AppInfo");
            var isMaster = component.get("v.isMaster");
            var estimateError = "";

            component.set("v.estimate"," -- ");

            // if this isn't set, just return -- probably an initialization call.
			if (!$A.util.isEmpty(appinfo) && 
            // Make sure that the selected license string is not empty as well as the application
                // !$A.util.isEmpty(appinfo.selectedLicenseTypes) &&  
                !$A.util.isEmpty(appinfo.app) && 
            // if this isn't the master copy, then leave
                 isMaster)
                {

                // sometimes we don't want to show a message, but we also don't want to call the calculation routine.
                // So we have a Do Not Show (DNS) value.
                if (estimateError !== "") {
                    if (estimateError !== "DNS") {
                        component.set("v.errorMessage",estimateError);
                        component.set("v.showError",true);
                    }
                }
                else {
                    component.set("v.showError",false);
                    var action = component.get("c.getFeeSchedule"); // Set the routine to call in the controller
                    action.setParams({"appInfo":  JSON.stringify(appinfo)} );
                    action.setCallback(this, function(response) {
                        try {            
                            var state = response.getState();
                            if (state === 'SUCCESS') {
                                // good!
                                component.set("v.estimate",response.getReturnValue());
// Communicate this to all non-master copies of this component - We've already comfirmed that we are the master.
                                var ccEvent = $A.get("e.c:dx_ComponentCoordination");
                                ccEvent.setParams({"ComponentName": "dx_FeeDisplay", "Action": "Update", "Value" : response.getReturnValue(),"Scope" : "nonMaster"});
                                ccEvent.fire();
                            }
                            else {      // error or incomplete comes here
                                var errors = response.getError();
                                if (errors) {
                                    // get all error messages to display
                                    for (var erri = 0; erri < errors.length; erri++) {
                                        component.set("v.errorMessage", component.get("v.errorMessage") + " : " + errors[erri].message);
                                    }
                                    component.set("v.showError",true);      
                                }
                            }
                        } catch(e) {
                            alert(e.stack);
                        }
                        finally {
                            component.set("v.isActive",false);
                        }
                    });
                    $A.enqueueAction(action,false);
                }    
            } 
            else {  // didn't meet the basic criteria to calculate a fee.
                component.set("v.isActive",false);
            }
        } catch (e) {
            alert(e.stack);
            component.set("v.isActive",false);
        }

    }

})