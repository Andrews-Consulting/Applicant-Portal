({
    // Code that is replicated for every instance (typically list views or when multiple instances are displayed on a screen)
    // initialization code to populate the component
    doInit: function(component, event, helper) {
        console.log('Init: AuthorizedAgentForm');        
        //helper.getAccount(component, event);
        
        helper.handleClassParam(component);
        helper.getApplication(component, event);
        helper.getAgent(component, event);
        helper.getPicklistValues(component, event);
	},

    // Save Button code
    save : function(component, event, helper) {
        helper.doUpdate(component, event);
    },
    // Handles when the selection on drop down for the Citizenship Question is changed
    // Get the selected value and set the value of the component.
    onSelectChange : function(component, event,helper) {
    	//helper.dependency(component);        
	},
    validatePhone: function(component, event,helper) {
        if (!$A.util.isEmpty(component.find("phone"))) {
            var validity = component.find("phone").get("v.validity");
            if (validity.patternMismatch) {
                var phoneNum = component.get("v.agent.abd_Auth_Agent_Phone__c");
                if (!$A.util.isEmpty(phoneNum)) {
                    phoneNum = phoneNum.replace(/[^0-9]/g,"");
                    if (phoneNum.length == 10) {
                        phoneNum = "(" + phoneNum.substr(0,3) + ") " + phoneNum.substr(3,3) + "-" + phoneNum.substr(6,4);
                        component.set("v.agent.abd_Auth_Agent_Phone__c",phoneNum);
                    }
                }
            }
        }
    }
  
	// gotoURL : function (component, event, helper) {
	// 	helper.doUpdate(component, event);
	// 	if(!component.get("v.showError"));
	// 		helper.gotoURL(component,event);
 //    }
})