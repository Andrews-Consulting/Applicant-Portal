({
    handleForgotUsername: function (component, event, helpler) {
        var email = component.find("email").get("v.value");
        console.log(email);
        var action = component.get("c.forgotUsername");
        action.setParams({email:email});
        action.setCallback(this, function(a) {
            var rtnValue = a.getReturnValue();
            if (rtnValue != null) {
               component.set("v.errorMessage",rtnValue);
               component.set("v.showError",true);
            }
       });
        $A.enqueueAction(action);
    }
})