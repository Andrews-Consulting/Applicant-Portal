({
    qsToEventMap: {
        'startURL'  : 'e.c:setStartUrl'
    },
    
    handleSelfRegister: function (component, event, helper) {
        console.log('handleSelfRegister');
        this.spinnerOn(component);
        
    	var accountId = component.get("v.accountId");
        var regConfirmUrl = component.get("v.regConfirmUrl");
        var firstname = component.find("firstname").get("v.value");
        var lastname = component.find("lastname").get("v.value");
        var email = component.find("email").get("v.value");
        var includePassword = component.get("v.includePasswordField");
        var password = component.find("password").get("v.value");
        var confirmPassword = component.find("confirmPassword").get("v.value");
        var action = component.get("c.selfRegister");
        var extraFields = JSON.stringify(component.get("v.extraFields"));   // somehow apex controllers refuse to deal with list of maps
        var startUrl = component.get("v.startUrl");//'/s/dx-legal-disclaimer/';
        var errmsg = '';
        
        if (email == null || email.length == 0) errmsg += 'Email, ';
        if (firstname == null || firstname.length == 0) errmsg += 'First Name, ';
        if (lastname == null || lastname.length == 0) errmsg += 'Last Name, ';
        
        if (errmsg.length !== 0) { 
            errmsg = 'The following fields are required and are missing data: ' + errmsg;
            if (errmsg.endsWith(', ')) errmsg = errmsg.substring(0,errmsg.length-2) + '. ';
        }
        // If there is an error, then let's display it and leave.
        if (errmsg.length !== 0) {
        	this.spinnerOff(component);
            component.set("v.errorMessage",errmsg);
            component.set("v.showError",true);
        }else {
	        startUrl = decodeURIComponent(startUrl);
	        
	        action.setParams({firstname:firstname,lastname:lastname,email:email,
	                password:password, confirmPassword:confirmPassword, accountId:accountId, regConfirmUrl:regConfirmUrl, extraFields:extraFields, startUrl:startUrl, includePassword:includePassword});
	        action.setCallback(this, function(a){
	        	var rtnValue = a.getReturnValue();
	        	if (rtnValue !== null) {
	        		component.set("v.errorMessage",rtnValue);
	            	component.set("v.showError",true);
	        	}
	        	this.spinnerOff(component);
	        });
	        $A.enqueueAction(action);
        }
	        
    },
    
    getExtraFields : function (component, event, helper) {
        var action = component.get("c.getExtraFields");
        action.setParam("extraFieldsFieldSet", component.get("v.extraFieldsFieldSet"));
        action.setCallback(this, function(a){
        var rtnValue = a.getReturnValue();
            if (rtnValue !== null) {
                component.set('v.extraFields',rtnValue);
            }
        });
        $A.enqueueAction(action);
    },

    spinnerOff: function (component) {
        var spinner = component.find("spinner");
        $A.util.addClass(spinner, "slds-hide");
    }, 
    // turn the spinner on (make it visible  by removing the hide class)
    spinnerOn: function (component) {
        var spinner = component.find("spinner");
        $A.util.removeClass(spinner, "slds-hide");
    }    
})