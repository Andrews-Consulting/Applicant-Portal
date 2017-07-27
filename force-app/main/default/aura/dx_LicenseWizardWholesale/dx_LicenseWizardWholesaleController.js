({

	navigateBeerDistributor: function(cmp, event, helper) {
      // In here, we need to get the code and call the 
      try {
      var action = cmp.get("c.getClass");         // Set the routine to call in the controller
      action.setParams({"code": cmp.get("v.beerDistributor_Code")}); // hard code the parm for now.
      
        action.setCallback(this, function(response){        // and when it returns, perform ....
            var rtnValue = response.getReturnValue();       // get the data and validate it, if null show an error
            if (rtnValue === null) {
                cmp.set("v.errorMessage",response.getReturnValue());
                cmp.set("v.showError",true);      
            }else
            {
               $A.get("e.force:navigateToURL").setParams({"url": cmp.get("v.beerDistributor_URL") + "?dLT=" + rtnValue  + "&recordId=0" }).fire();
            }
        });
        $A.enqueueAction(action);  

        }catch(e) {
            alert(e);
        }

    },

	navigateHighProofBeer: function(cmp, event, helper) {
      // In here, we need to get the code and call the 
      try {
      var action = cmp.get("c.getClass");         // Set the routine to call in the controller
      action.setParams({"code": cmp.get("v.highProofBeer_Code")}); // hard code the parm for now.
      
        action.setCallback(this, function(response){        // and when it returns, perform ....
            var rtnValue = response.getReturnValue();       // get the data and validate it, if null show an error
            if (rtnValue === null) {
                cmp.set("v.errorMessage",response.getReturnValue());
                cmp.set("v.showError",true);      
            }else
            {
               $A.get("e.force:navigateToURL").setParams({"url": cmp.get("v.highProofBeer_URL") + "?dLT=" + rtnValue  + "&recordId=0" }).fire();
            }
        });
        $A.enqueueAction(action);  

        }catch(e) {
            alert(e);
        }

    },

	navigateNativeBeer: function(cmp, event, helper) {
      // In here, we need to get the code and call the 
      try {
      var action = cmp.get("c.getClass");         // Set the routine to call in the controller
      action.setParams({"code": cmp.get("v.nativeBeer_Code")}); // hard code the parm for now.
      
        action.setCallback(this, function(response){        // and when it returns, perform ....
            var rtnValue = response.getReturnValue();       // get the data and validate it, if null show an error
            if (rtnValue === null) {
                cmp.set("v.errorMessage",response.getReturnValue());
                cmp.set("v.showError",true);      
            }else
            {
               $A.get("e.force:navigateToURL").setParams({"url": cmp.get("v.nativeBeer_URL") + "?dLT=" + rtnValue  + "&recordId=0" }).fire();
            }
        });
        $A.enqueueAction(action);  

        }catch(e) {
            alert(e);
        }

    },

	navigateHighProofNativeBeer: function(cmp, event, helper) {
      // In here, we need to get the code and call the 
      try {
      var action = cmp.get("c.getClass");         // Set the routine to call in the controller
      action.setParams({"code": cmp.get("v.highProofNativeBeer_Code")}); // hard code the parm for now.
      
        action.setCallback(this, function(response){        // and when it returns, perform ....
            var rtnValue = response.getReturnValue();       // get the data and validate it, if null show an error
            if (rtnValue === null) {
                cmp.set("v.errorMessage",response.getReturnValue());
                cmp.set("v.showError",true);      
            }else
            {
               $A.get("e.force:navigateToURL").setParams({"url": cmp.get("v.highProofNativeBeer_URL") + "?dLT=" + rtnValue  + "&recordId=0" }).fire();
            }
        });
        $A.enqueueAction(action);  

        }catch(e) {
            alert(e);
        }

    },

	navigateWine: function(cmp, event, helper) {
      // In here, we need to get the code and call the 
      try {
      var action = cmp.get("c.getClass");         // Set the routine to call in the controller
      action.setParams({"code": cmp.get("v.wineDistributor_Code")}); // hard code the parm for now.
      
        action.setCallback(this, function(response){        // and when it returns, perform ....
            var rtnValue = response.getReturnValue();       // get the data and validate it, if null show an error
            if (rtnValue === null) {
                cmp.set("v.errorMessage",response.getReturnValue());
                cmp.set("v.showError",true);      
            }else
            {
               $A.get("e.force:navigateToURL").setParams({"url": cmp.get("v.wineDistributor_URL") + "?dLT=" + rtnValue   + "&recordId=0"}).fire();
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
      action.setParams({"code": cmp.get("v.nativeWine_Code")}); // hard code the parm for now.
      
        action.setCallback(this, function(response){        // and when it returns, perform ....
            var rtnValue = response.getReturnValue();       // get the data and validate it, if null show an error
            if (rtnValue === null) {
                cmp.set("v.errorMessage",response.getReturnValue());
                cmp.set("v.showError",true);      
            }else
            {
               $A.get("e.force:navigateToURL").setParams({"url": cmp.get("v.nativeWine_URL") + "?dLT=" + rtnValue  + "&recordId=0" }).fire();
            }
        });
        $A.enqueueAction(action);  

        }catch(e) {
            alert(e);
        }

    },
    
	navigateDirectShipperOfWine: function(cmp, event, helper) {
      // In here, we need to get the code and call the 
      try {
      var action = cmp.get("c.getClass");         // Set the routine to call in the controller
      action.setParams({"code": cmp.get("v.directShipperofWine_Code")}); // hard code the parm for now.
      
        action.setCallback(this, function(response){        // and when it returns, perform ....
            var rtnValue = response.getReturnValue();       // get the data and validate it, if null show an error
            if (rtnValue === null) {
                cmp.set("v.errorMessage",response.getReturnValue());
                cmp.set("v.showError",true);      
            }else
            {
               $A.get("e.force:navigateToURL").setParams({"url": cmp.get("v.directShipperofWine_URL") + "?dLT=" + rtnValue  + "&recordId=0" }).fire();
            }
        });
        $A.enqueueAction(action);  

        }catch(e) {
            alert(e);
        }

    },

})