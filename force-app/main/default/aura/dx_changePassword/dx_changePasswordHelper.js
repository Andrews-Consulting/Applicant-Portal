({
    handleChangePassword :  function (component, event, helpler) {
        var action = component.get("c.changePassword");
        action.setParams({"oldPassword":component.get("v.oldpassword"), "newPassword":component.get("v.newpassword") ,"verifyNewPassword":component.get("v.verifypassword") , "pageURL":component.get("v.nextPageUrl") });
        action.setCallback(this, function(a) {
            var rtnValue = a.getReturnValue();
            if (rtnValue != null) {
               component.set("v.errorMessage",rtnValue);
               component.set("v.showError",true);
            }
            else {
			// PageReference p = new PageReference(pageURL);
   //      	p.setRedirect(true);
	  //       return p;        

            }
       });
        $A.enqueueAction(action);
    }
})