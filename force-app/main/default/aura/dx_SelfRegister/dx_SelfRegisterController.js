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
    	component.set("v.startUrl", "/dx-owneraccountsearch");
    	helper.handleSelfRegister(component, event, helper);
    }   
})