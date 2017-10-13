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
	phoneFormat: function(component, event,helper) {
		var phoneNum = component.get("v.agent.abd_Auth_Agent_Phone__c");
		var phoneLen = phoneNum.length;
		
        if(!phoneNum.startsWith('+')){
			if(isNaN(phoneNum.substring(phoneLen-1)) && phoneLen<15)
                phoneNum = phoneNum.substring(0,phoneLen-1);
            phoneLen = phoneNum.length;
            switch (phoneLen){
				case 3:
					if(!phoneNum.startsWith('('))
						phoneNum = '('+phoneNum+') ';
					break;
				case 9:
	    			phoneNum+='-';
	    			break;
				case 15:
	    			phoneNum = phoneNum.substring(0,14)+' '+phoneNum.substring(14);
	    			break;
				default:
					break;
			}
		}
		component.set("v.agent.abd_Auth_Agent_Phone__c",phoneNum);
	},
	zipFormat: function(component, event,helper) {
		var zip = component.get("v.agent.abd_Auth_Agent_Zip__c");
		var zipLen = zip.length;
		zipLen = zip.length;
		if(!isNaN(zip)){
			switch (zipLen){
				case 9:
	    			zip = zip.substring(0,5)+'-'+zip.substring(5);
	    			break;
				default:
					break;
			}
		}
		component.set("v.agent.abd_Auth_Agent_Zip__c",zip);
	}
    /*validatePhone: function(component, event,helper) {
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
    }*/
  
	// gotoURL : function (component, event, helper) {
	// 	helper.doUpdate(component, event);
	// 	if(!component.get("v.showError"));
	// 		helper.gotoURL(component,event);
 //    }
})