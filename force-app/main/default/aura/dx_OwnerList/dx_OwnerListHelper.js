({
    getOwnerList: function(component, event) {
        try {
            console.log('Get Owner');
            var action = component.get("c.getOwnerList"); // Set the routine to call in the controller
            var Id = component.get("v.recordId");
            console.log(Id);
            action.setParams({"id": Id});
            action.setCallback(this, function(response) {
                try {            
                    var state = response.getState();
                    if (state === 'SUCCESS') {
                        component.set("v.ownerlist",response.getReturnValue());
                        if (response.getReturnValue().length === 0) {
                            if (component.get("v.RecordIdIsApplication")) {
                                component.set("v.errorMessage", "Please enter an Owner");
                                component.set("v.showError",true);      
                            }
                        }
                        else {
                            for (var i = 0 ; i < response.getReturnValue().length; i++) {
                                var o = response.getReturnValue()[i];
                                if (!$A.util.isEmpty(o.owner)) {
                                    if (!$A.util.isEmpty(o.owner.abd_LicenseeBusinessType__c))  
                                        if (o.owner.abd_LicenseeBusinessType__c == 'Sole Proprietorship' || o.owner.abd_LicenseeBusinessType__c == 'Municipality' )
                                            component.set("v.NoAllocationsAllowed",true);
                                }
                            }
                        }
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
            });
            $A.enqueueAction(action);
        } catch (e) {
            alert(e);
        }
    },
    // Call the controller to update the record with the values collected on the screen.
    // We could do validation here on the client side to make this a little faster.

    doUpdate: function(component) {
        try {
            component.set("v.showError", false); // clear the error message off of the screen
            var notAnswered = '--None--';

            // If this isn't an application, then skip the Save for Now and tell everyone we're okay!
            if (!component.get("v.RecordIdIsApplication")) {
                var action = component.getEvent("SaveCompleted");
                action.setParams({"Component" : component, "Action": "Saved" });
                action.fire();
                return;
            }

            var ownerlist = component.get("v.ownerlist");
            var sum = 0;
            var count = 0;
            // var hasPrimary = false;
            var errmsg = '';
            for(var o in ownerlist){
            	if(!ownerlist[o].needDelete){
	            	var owner = ownerlist[o].owner;
                    count += 1;
	            	sum+=Number((isNaN(owner.of_Ownership__c))?0:owner.of_Ownership__c);
	            	// if(owner.abd_Primary_Owner__c){
	            		// if(hasPrimary){
	            			// errmsg+='There can be only one Primary Owner.';
	            		// }else{
	            			// hasPrimary = true;
	            		// }
	            	// }
            	}
            }
            console.log(sum);
            if(sum>100)
            	errmsg+=((errmsg!=='')?'<br/>':'')+'The Percent of Ownership cannot be greater than 100%';

            if (component.get("v.NoAllocationsAllowed") && count > 1) {
                errmsg = 'There can only be one owner for a Sole Proprietorship or only one responsible person listed for a Municipality';
            }

            var ownerString = JSON.stringify(component.get("v.ownerlist")); // get the data from the component
            // validate the data here!  Check to see if the fields are completed.
            

            // If there is an error, then let's display it and leave.
            if (errmsg.length !==- 0) {
                component.set("v.errorMessage", errmsg);
                component.set("v.showError", true);
                var nextAction = component.getEvent("SaveCompleted");
                nextAction.setParams({"Component" : component, "Action": "Fail" });
                nextAction.fire();

            }
            // If all good, then let's call the controller and try to update the record.
            else {
                console.log('Update Record');
                var action = component.get("c.upRecordApex"); // Set the routine to call in the controller
                action.setParams({
                    "ownerString": ownerString
                }); // pass the data to the controller
                action.setCallback(this, function(response) {

                    var action = component.getEvent("SaveCompleted");
                    try {            
                        var state = response.getState();
                        if (state === 'SUCCESS' && response.getReturnValue() === 'Update Successful') {
                            action.setParams({"Component" : component, "Action": "Saved" });
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
                        action.setParams({"Component" : component, "Action": "Fail" });
                        }
                    } catch(e) {
                        alert(e.stack);
                        action.setParams({"Component" : component, "Action": "Fail" });
                    }
                    finally {
                    // always fire this action.  parms are set.                
                        action.fire();
                    }        
                });
                $A.enqueueAction(action); // put this item on the queue to execute.
            }
        } catch (e) { //development catch of typos and other dumb mistakes.
            alert(e.name + ': ' + e.message + ' : ' + e.lineNumber);
        }
    }
})