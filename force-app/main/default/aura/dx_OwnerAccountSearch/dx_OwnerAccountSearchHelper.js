{
	setAccount : function(component,event){
        // it returns only first value of Id
        /*console.log('Should Redirect');
        var AcctId = component.get("v.accountId");
        if(AcctId=='')
        	AcctId = event.getSource().get("v.class");
        var action = component.get("c.updateUser");
        action.setParams({"accountId":AcctId});
        action.setCallback(this, function(response){        // and when it returns, perform ....
            var rtnValue = response.getReturnValue();       // get the data and validate it, if null show an error
            if (rtnValue !== null) {
                component.set("v.errorMessage",rtnValue);
                component.set("v.showError",true);      
            }else{
                
            }
        });
        $A.enqueueAction(action);
        if(!component.get("v.showError")){*/
            /*console.log('Fire Event');
            var evt = $A.get("e.force:navigateToComponent");
            evt.setParams({
                componentDef : "c:dx-licenseeprofile",
                componentAttributes: {}
                
            });
            evt.fire();*/
            console.log('Fire Event');
            var evt = $A.get("e.force:navigateToURL");
            evt.setParams({
                 "url": "/dx-licenseeprofile",
            });
            evt.fire();
        //} 
    }
}