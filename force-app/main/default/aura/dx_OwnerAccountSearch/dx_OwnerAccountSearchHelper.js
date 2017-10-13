{
	setAccount : function(component,event){
        // it returns only first value of Id
        console.log('Should Redirect');
        var AcctId = component.get("v.accountId");
        if(AcctId=='')
        	AcctId = event.getSource().get("v.class");
        var Accts = component.get("v.accounts");
        var others = '';
        for(var acc = 0; acc < Accts.length; acc++){
        	console.log(Accts[acc]);
        	console.log(Accts[acc].Id);
        	if(Accts[acc].Id !== AcctId)
        		others += ((others!=='')?';':'')+Accts[acc].Id;
        }
        var action = component.get("c.updateUser");
        console.log('Before Action');
        console.log(AcctId);
        console.log(others);
        action.setParams({"accountId":AcctId,"others":others});
        action.setCallback(this, function(response){        // and when it returns, perform ....
        	var action = component.getEvent("SaveCompleted");
            try {            
                var state = response.getState();
                console.log('During Action');
                console.log(state);
                if (state === 'SUCCESS') {
                    
                	component.set("v.errorMessage", 'Contact record has been updated, there isn\'t a landing page so this page doesn\'t redirect.');
                	component.set("v.showError",true);
                	action.setParams({"Component" : component, "Action": "Saved" });
                }
                else {      // error or incomplete comes here
                    var errors = response.getError();
                    if (errors) {
                        for (var erri = 0; erri < errors.length; erri++) {
                            component.set("v.errorMessage", errors[erri].message + " : " + component.get("v.errorMessage"));
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
        $A.enqueueAction(action);
    }
}