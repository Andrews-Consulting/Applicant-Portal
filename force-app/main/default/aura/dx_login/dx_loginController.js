({
    initialize: function(component, event, helper) {
        $A.get("e.siteforce:registerQueryEventMap").setParams({"qsToEvent" : helper.qsToEventMap}).fire();    
        component.set('v.isUsernamePasswordEnabled', helper.getIsUsernamePasswordEnabled(component, event, helper));
        component.set("v.isSelfRegistrationEnabled", helper.getIsSelfRegistrationEnabled(component, event, helper));
        component.set("v.communityForgotPasswordUrl", helper.getCommunityForgotPasswordUrl(component, event, helper));
        component.set("v.communitySelfRegisterUrl", helper.getCommunitySelfRegisterUrl(component, event, helper));
    },
    
    handleLogin: function (component, event, helpler) {
        var defRegUrl = component.get("v.defaultStartURL");        
    	component.set("v.startUrl", defRegUrl);
        helpler.handleLogin(component, event, helpler);

        // var urlEvent = $A.get("e.force:navigateToURL");
        // urlEvent.setParams({"url": "/legal-disclaimer"});
        // urlEvent.fire();
    },
    
    setStartUrl: function (component, event, helpler) {
        var startUrl = event.getParam('startURL');
        if(startUrl) {
            component.set("v.startUrl", startUrl);
        }
    },
    onKeyUp: function(component, event, helpler){
        //checks for "enter" key
        if (event.getParam('keyCode')===13) {
            var defRegUrl = component.get("v.defaultStartURL");
            component.set("v.startUrl", defRegUrl);
            helpler.handleLogin(component, event, helpler);
        }
    },
    
    navigateToForgotPassword: function(component, event, helper) {
        var forgotPwdUrl = component.get("v.communityForgotPasswordUrl");
        if ($A.util.isUndefinedOrNull(forgotPwdUrl)) {
            forgotPwdUrl = component.get("v.forgotPasswordUrl");
        }
        var attributes = { url: forgotPwdUrl };
        $A.get("e.force:navigateToURL").setParams(attributes).fire();
    },
    
    navigateToSelfRegister: function(component, event, helper) {
        var selrRegUrl = component.get("v.communitySelfRegisterUrl");
        if (selrRegUrl === null) {
            selrRegUrl = component.get("v.selfRegisterUrl");
        }
    
        var attributes = { url: selrRegUrl };
        $A.get("e.force:navigateToURL").setParams(attributes).fire();
    }
})