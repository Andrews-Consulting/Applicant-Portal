({
	navigateBeerOptionalWine: function(cmp, event, helper) {
      // In here, we need to get the code and call the 
      try {
      var action = cmp.get("c.getClass");         // Set the routine to call in the controller
      action.setParams({"code": cmp.get("v.sellBeerOptionalWine_Code")}); // hard code the parm for now.
      
        action.setCallback(this, function(response){        // and when it returns, perform ....
            var rtnValue = response.getReturnValue();       // get the data and validate it, if null show an error
            if (rtnValue === null) {
                cmp.set("v.errorMessage",response.getReturnValue());
                cmp.set("v.showError",true);      
            }else
            {
               $A.get("e.force:navigateToURL").setParams({"url": cmp.get("v.sellBeerOptionalWine_URL") + "?dLT=" + rtnValue  + "&recordId=0" }).fire();
            }
        });
        $A.enqueueAction(action);  

        }catch(e) {
            alert(e);
        }

    },
    
	navigateWineOptionalBeer: function(cmp, event, helper) {
      // In here, we need to get the code and call the 
      try {
      var action = cmp.get("c.getClass");         // Set the routine to call in the controller
      action.setParams({"code": cmp.get("v.sellWineOptionalBeer_Code")}); // hard code the parm for now.
      
        action.setCallback(this, function(response){        // and when it returns, perform ....
            var rtnValue = response.getReturnValue();       // get the data and validate it, if null show an error
            if (rtnValue === null) {
                cmp.set("v.errorMessage",response.getReturnValue());
                cmp.set("v.showError",true);      
            }else
            {
               $A.get("e.force:navigateToURL").setParams({"url": cmp.get("v.sellWineOptionalBeer_URL") + "?dLT=" + rtnValue  + "&recordId=0" }).fire();
            }
        });
        $A.enqueueAction(action);  

        }catch(e) {
            alert(e);
        }

    },

	navigateLiquorOptionalMore: function(cmp, event, helper) {
      // In here, we need to get the code and call the 
      try {
      var action = cmp.get("c.getClass");         // Set the routine to call in the controller
      action.setParams({"code": cmp.get("v.sellLiquorOptionalMore_Code")}); // hard code the parm for now.
      
        action.setCallback(this, function(response){        // and when it returns, perform ....
            var rtnValue = response.getReturnValue();       // get the data and validate it, if null show an error
            if (rtnValue === null) {
                cmp.set("v.errorMessage",response.getReturnValue());
                cmp.set("v.showError",true);      
            }else
            {
               $A.get("e.force:navigateToURL").setParams({"url": cmp.get("v.sellLiquorOptionalMore_URL") + "?dLT=" + rtnValue   + "&recordId=0" }).fire();
            }
        });
        $A.enqueueAction(action);  

        }catch(e) {
            alert(e);
        }

    },

	navigateNativeWine: function(cmp, event, helper) {
      // In here, we need to get the code and call the 
      try {
      var action = cmp.get("c.getClass");         // Set the routine to call in the controller
      action.setParams({"code": cmp.get("v.sellNativeWineOptionalBeer_Code")}); // hard code the parm for now.
      
        action.setCallback(this, function(response){        // and when it returns, perform ....
            var rtnValue = response.getReturnValue();       // get the data and validate it, if null show an error
            if (rtnValue === null) {
                cmp.set("v.errorMessage",response.getReturnValue());
                cmp.set("v.showError",true);      
            }else
            {
               $A.get("e.force:navigateToURL").setParams({"url": cmp.get("v.sellNativeWineOptionalBeer_URL") + "?dLT=" + rtnValue  + "&recordId=0" }).fire();
            }
        });
        $A.enqueueAction(action);  

        }catch(e) {
            alert(e);
        }

    }

})