({
    initialize: function(component, event, helper) {
        $A.get("e.siteforce:registerQueryEventMap").setParams({"qsToEvent" : helper.qsToEventMap}).fire();
        component.set('v.extraFields', helper.getExtraFields(component, event, helper));
    },
    
    handleSelfRegister: function (component, event, helper) {
        helpler.handleSelfRegister(component, event, helper);
    },
    
    setStartUrl: function (component, event, helper) {
        var startUrl = event.getParam('startURL');
        if(startUrl) {
            component.set("v.startUrl", startUrl);
        }
    },
    onKeyUp: function(component, event, helper){
        //checks for "enter" key
        if (event.getParam('keyCode')===13) {
            helpler.handleSelfRegister(component, event, helper);
        }
    },
    handleLeft: function(component, event, helper) {
    	console.log('Handle Left');
    	component.set("v.startUrl", "/dx-licensewizard1");
    	helper.handleSelfRegister(component, event, helper);
    },
    handleRight: function(component, event, helper) {
    	console.log('Handle Right');
    	component.set("v.startUrl", "/dx-pc-owneraccountsearch");
    	helper.handleSelfRegister(component, event, helper);
    },
	phoneFormat: function(component, event,helper) {
		var phone = component.find("phone");
		var phoneNum = phone.get("v.value");
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
		phone.set("v.value",phoneNum);
	}   
})