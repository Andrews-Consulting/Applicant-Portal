({
	doInit : function(component, event, helper) {
        console.log('DOINIT');
        console.log(component.get("v.recordId"));
        var action = component.get("c.getLicenses");
        action.setParams({"accountId":component.get("v.recordId")});
        action.setCallback(this, function(a) {
            var rtnValue = a.getReturnValue();
            console.log(rtnValue);
            if(rtnValue.length>0)
            	component.set("v.showEmpty",false);  
            component.set("v.licenses",rtnValue);
            if (rtnValue === null) {
               component.set("v.errorMessage","Something went wrong!");
               component.set("v.showError",true);
            }
       });
       $A.enqueueAction(action);
	}
})