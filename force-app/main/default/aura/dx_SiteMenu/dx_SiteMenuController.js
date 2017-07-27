({

   //  doInit: function(component, event, helper) {

   //  	var bAuth = component.get("v.isAuthenticated");

   //  	if (!bAuth) {
	  //       var btnToRemove = component.find("SearchButton");
			// $A.util.toggleClass(btnToRemove, "slds-hide");				
   //  	}
   //  },

	showHideABDMenuSmall: function(component, event, helper) {
		var hideShowText = component.find("ABDIconMenu");
        //$A.util.toggleClass(hideShowText, "slds-is-open");
		$A.util.toggleClass(hideShowText, "slds-is-collapsed");
		$A.util.toggleClass(hideShowText, "slds-is-expanded");        
	},

	showHideABDMenuNotSmall: function(component, event, helper) {
		var hideShowText = component.find("ABDIconNotSmall");
        $A.util.toggleClass(hideShowText, "slds-is-open");
	},	

	showHideMasterMenu: function(component, event, helper) {
		var hideShowText = component.find("MasterMenu");
		$A.util.toggleClass(hideShowText, "slds-is-open");
	},
	showHideMasterMenu1: function(component, event, helper) {
		var hideShowText = component.find("MasterMenu1");
		$A.util.toggleClass(hideShowText, "slds-is-collapsed");
		$A.util.toggleClass(hideShowText, "slds-is-expanded");
	},
	showHideMasterMenu2: function(component, event, helper) {
		var hideShowText = component.find("MasterMenu2");
		$A.util.toggleClass(hideShowText, "slds-is-collapsed");
		$A.util.toggleClass(hideShowText, "slds-is-expanded");
	},
	showHideMasterMenu3: function(component, event, helper) {
		var hideShowText = component.find("MasterMenu3");
		$A.util.toggleClass(hideShowText, "slds-is-collapsed");
		$A.util.toggleClass(hideShowText, "slds-is-expanded");
	},

// looks like the getEvt is being replaced with just a get function.
    logMeOut:function(cmp, event, helper) {

        // Apex code to match the current site.
        // // Site sites = [SELECT Subdomain, UrlPathPrefix FROM Site];
        // for (Site s:[SELECT Subdomain, UrlPathPrefix FROM Site]) { 
        //     String mySitename = URL.getSalesforceBaseUrl().toExternalForm() + '/' + s.UrlPathPrefix;
        //     System.debug('SiteName : ' + mySitename);
        //     if (System.Url.getCurrentRequestUrl().toExternalForm().startsWithIgnoreCase(mySitename)) 
        //         System.debug('Have a match');
        //     else
        //         System.debug('Not Yet');

        // }
        
        $A.get("e.selfService:doLogout").setParams({"url": "/Licensing/secur/logout.jsp?retUrl=https%3A%2F%2Fabdstaging-iowaabd.cs33.force.com%2FApplicant%2FCommunitiesLanding"}).fire();
    },


    UserSettings:function(cmp, event, helper) {
        try {
        	var action = cmp.get("c.getUserId");    // Set the routine to call in the controller
            action.setCallback(this, function(response){
                var rtnValue = response.getReturnValue();   
		   		var urlEvent = $A.get("e.force:navigateToURL");
		    	urlEvent.setParams({"url": "/settings/" + rtnValue}).fire();
            });
    		$A.enqueueAction(action);
        }
        catch(e) {
            alert(e);
        }
    },

    ChangePassword:function(cmp, event, helper) {
        try {
        	var action = cmp.get("c.getUserId");    // Set the routine to call in the controller
            action.setCallback(this, function(response){
                var rtnValue = response.getReturnValue();   
		   		var urlEvent = $A.get("e.force:navigateToURL");
		    	urlEvent.setParams({"url": "/settings/" + rtnValue}).fire();
            });
    		$A.enqueueAction(action);
        }
        catch(e) {
            alert(e);
        }

    }

})