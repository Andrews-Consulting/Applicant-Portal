({
    // Code that is replicated for every instance (typically list views or when multiple instances are displayed on a screen)
    // initialization code to populate the component
    doInit: function(component, event, helper) {
        console.log('Init: LicenseeForm');
        	helper.isNewApplication(component, event);
            helper.CheckRecordId(component, event);
            helper.getAccount(component, event);
            helper.getContact(component, event);
    },

    // Save Button code
    save : function(component, event, helper) {
        helper.doUpdate(component, event);
    },
    // Handles when the selection on drop down for the Citizenship Question is changed
    // Get the selected value and set the value of the component.
    onSelectChange : function(component, event,helper) {
    	helper.dependency(component);        
	},
	onLicChange : function(component, event,helper) {
    	var licensee = JSON.parse(JSON.stringify(component.get("v.licensee")));
        var value = event.getSource().get("v.value");
        var name = event.getSource().get("v.name");
        licensee[name] = value;
        component.set("v.licensee",licensee);
                
	},
	gotoURL : function (component, event, helper) {
	    var urlEvent = $A.get("e.force:navigateToURL");
	    urlEvent.setParams({
	      "url": "https://sos.iowa.gov/search/business/(S(4iulmkfb5id3jjrvtvng1y45))/search.aspx"
	    });
	    urlEvent.fire();
	},
	closeMessage : function (component,event, helper){
		helper.hidePopupHelper(component, 'modaldialog', 'slds-fade-in-');
	    helper.hidePopupHelper(component,'backdrop','slds-backdrop--');
	},
	zipChange : function(component, event,helper) {
    	var zip = component.get("v.licensee.BillingPostalCode").substr(0,5);
    	component.set("v.licensee.BillingPostalCode",zip);        
	}, 
     validateAppPhone: function(component, event,helper) {
        if (!$A.util.isEmpty(component.find("appPhone"))) {
            var validity = component.find("appPhone").get("v.validity");
            if (validity.patternMismatch) {
                var phoneNum = component.get("v.applicant.Phone");
// if the phone number exists, then strip out the unusable characters and build it to match the right format.                
                if (!$A.util.isEmpty(phoneNum)) {
                    phoneNum = phoneNum.replace(/[^0-9]/g,"");
                    if (phoneNum.length == 10) {
                        phoneNum = "(" + phoneNum.substr(0,3) + ") " + phoneNum.substr(3,3) + "-" + phoneNum.substr(6,4);
                        component.set("v.applicant.Phone",phoneNum);
// This is not portable and will fail over time as lightning is enhanced.                        
// and is not working right not anyway.
                        // var appPhone = component.find("appPhone");
                        // for (var i = 0; i < appPhone.elements.length; i++) { 
                        //     var x = appPhone.elements[i];
                        //     if (!$A.util.isEmpty(x.classname))
                        //         if (x.classname.includes("slds-has-error")) 
                        //             $A.util.removeClass(x, "slds-has-error");
                        // }
                    }
                }
            }
        }
    },
     validateLicPhone: function(component, event,helper) {
        if (!$A.util.isEmpty(component.find("licPhone"))) {
            var validity = component.find("licPhone").get("v.validity");
            if (validity.patternMismatch) {
                var phoneNum = component.get("v.licensee.Phone");
                if (!$A.util.isEmpty(phoneNum)) {
                    phoneNum = phoneNum.replace(/[^0-9]/g,"");
                    if (phoneNum.length == 10) {
                        phoneNum = "(" + phoneNum.substr(0,3) + ") " + phoneNum.substr(3,3) + "-" + phoneNum.substr(6,4);
                        component.set("v.licensee.Phone",phoneNum);
                        // var licPhone = component.find("licPhone");
                        // for (var i = 0; i < licPhone.elements.length; i++) { 
                        //     var x = licPhone.elements[i];                        
                        //     if (!$A.util.isEmpty(x.classname))
                        //         if (x.classname.includes("slds-has-error")) 
                        //             $A.util.removeClass(x, "slds-has-error");
                        // }
                    }
                }
            }
        }
    }
})