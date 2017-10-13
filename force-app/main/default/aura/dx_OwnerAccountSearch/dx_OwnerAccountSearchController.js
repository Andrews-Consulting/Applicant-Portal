({
    doInit : function(component){
        
        var owner = {lastName:"",ssn:""};
        component.set("v.owner",owner);
        component.set("v.accounts",[]);
        component.set("v.accountId",'');
        component.set("v.isInitComplete",true);
    },
	// Search Button code
    findAccounts : function(component, event, helper) {
        var onlyOne = false;
        try{
            console.log('Get Accounts');
            component.set("v.showError",false);
            var owner = component.get("v.owner");
            var accounts = component.get("v.accounts");
            // clear the error message display
        	var action = component.get("c.getAccounts");         // Set the routine to call in the controller
            console.log(owner);
            action.setParams({"qfs":JSON.stringify(owner)});
            action.setCallback(this, function(response){        // and when it returns, perform ....
                var rtnValue = response.getReturnValue();       // get the data and validate it, if null show an error
                if (rtnValue === null || rtnValue.length<=0) {
                    component.set("v.errorMessage",'No Records Found');
                    component.set("v.showError",true);      
                }else{
                	console.log(rtnValue.length);
                	if(rtnValue.length==1){
                		component.set("v.accountId",rtnValue[0].Id);
                		onlyOne = true;
                	}
                    component.set("v.accounts",rtnValue);      // but if it's good, set the applicant value to the result.
                }
                if(onlyOne)
                    helper.setAccount(component,event);
            });
    		$A.enqueueAction(action);                           // put this item on the queue to execute.
        }
        catch(e) {
            alert(e);
        }
    },
    navigateToAccount : function(component,event,helper){
        helper.setAccount(component,event);
    },
    resetAccounts : function(component){
        
        var evt = $A.get("e.force:navigateToURL");
        evt.setParams({
        	"url": "/componentpreview",
        });
        evt.fire();
    },
	ssnFormat : function(component, event,helper) {
    	var ssn = component.get("v.owner.ssn");
    	var ssLen = ssn.length;
    	if(isNaN(ssn.substring(ssLen-1)))
    		ssn = ssn.substring(0,ssLen-1);
    	/*ssLen = ssn.length;
    	switch (ssLen){
    		case 3: case 6:
    			ssn+='-';
    			break;
			default:
				break;
    	}*/
    	component.set("v.owner.ssn",ssn);        
	}
    
})