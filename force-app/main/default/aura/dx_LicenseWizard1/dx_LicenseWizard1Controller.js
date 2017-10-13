({
    navigateBar: function(cmp, event, helper) {
        $A.get("e.force:navigateToURL").setParams({"url": cmp.get("v.barClubRestaurant_URL")}).fire();
    },

    navigateRetail: function(cmp, event, helper) {
        $A.get("e.force:navigateToURL").setParams({"url": cmp.get("v.retailStore_URL")}).fire();
    },

    navigateWholesale: function(cmp, event, helper) {
        $A.get("e.force:navigateToURL").setParams({"url": cmp.get("v.wholesalerOrCarrier_URL")}).fire();
    },
    navigateImporter: function(cmp, event, helper) {
        $A.get("e.force:navigateToURL").setParams({"url": cmp.get("v.importerOrManufacturer_URL")}).fire();
    },       

    navigateCharity: function(cmp, event, helper) {
      // In here, we need to get the code and call the 
      try {
      var action = cmp.get("c.getClass");         // Set the routine to call in the controller
      action.setParams({"code": cmp.get("v.charityAuction_Code")}); // hard code the parm for now.
      
        action.setCallback(this, function(response){        // and when it returns, perform ....
            var rtnValue = response.getReturnValue();       // get the data and validate it, if null show an error
            if (rtnValue === null) {
                cmp.set("v.errorMessage",response.getReturnValue());
                cmp.set("v.showError",true);      
            }else
            {
               $A.get("e.force:navigateToURL").setParams({"url": cmp.get("v.charityAuction_URL") + "?dLT=" + encodeURIComponent(rtnValue)  + "&recordId=0"}).fire();
            }
        });
        $A.enqueueAction(action);  

        }catch(e) {
            alert(e);
        }

    },
})