({
    navigateBeerWithWineCoolers: function(cmp, event, helper) {
      // In here, we need to get the code and call the 
      try {
      var action = cmp.get("c.getClass");         // Set the routine to call in the controller
      action.setParams({"code": cmp.get("v.beerWithWineCoolers_Code")});
      
        action.setCallback(this, function(response){        // and when it returns, perform ....
            var rtnValue = response.getReturnValue();       // get the data and validate it, if null show an error
            if (rtnValue === null) {
                cmp.set("v.errorMessage",response.getReturnValue());
                cmp.set("v.showError",true);      
            }else
            {
               $A.get("e.force:navigateToURL").setParams({"url": cmp.get("v.serveBeerWithWineCoolers_URL") + "?dLT=" + rtnValue  + "&recordId=0"}).fire();
            }
        });
        $A.enqueueAction(action);  

        }catch(e) {
            alert(e);
        }

    },

	navigateBeerWineOnly: function(cmp, event, helper) {
      // In here, we need to get the code and call the 
      try {
      var action = cmp.get("c.getClass");         // Set the routine to call in the controller
      action.setParams({"code": cmp.get("v.serveBeerWineOnly_Code")});
      
        action.setCallback(this, function(response){        // and when it returns, perform ....
            var rtnValue = response.getReturnValue();       // get the data and validate it, if null show an error
            if (rtnValue === null) {
                cmp.set("v.errorMessage",response.getReturnValue());
                cmp.set("v.showError",true);      
            }else
            {
               $A.get("e.force:navigateToURL").setParams({"url": cmp.get("v.serveBeerWineOnly_URL") + "?dLT=" + rtnValue  + "&recordId=0" }).fire();
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
      action.setParams({"code": cmp.get("v.serveNativeWine_Code")});
      
        action.setCallback(this, function(response){        // and when it returns, perform ....
            var rtnValue = response.getReturnValue();       // get the data and validate it, if null show an error
            if (rtnValue === null) {
                cmp.set("v.errorMessage",response.getReturnValue());
                cmp.set("v.showError",true);      
            }else
            {
               $A.get("e.force:navigateToURL").setParams({"url": cmp.get("v.serveNativeWine_URL") + "?dLT=" + rtnValue  + "&recordId=0" }).fire();
            }
        });
        $A.enqueueAction(action);  

        }catch(e) {
            alert(e);
        }

    },

	navigateLiquorClub: function(cmp, event, helper) {
      // In here, we need to get the code and call the 
      try {
      var action = cmp.get("c.getClass");         // Set the routine to call in the controller
      action.setParams({"code": cmp.get("v.serveLiquorClub_Code")});
      
        action.setCallback(this, function(response){        // and when it returns, perform ....
            var rtnValue = response.getReturnValue();       // get the data and validate it, if null show an error
            if (rtnValue === null) {
                cmp.set("v.errorMessage",response.getReturnValue());
                cmp.set("v.showError",true);      
            }else
            {
               $A.get("e.force:navigateToURL").setParams({"url": cmp.get("v.serveLiquorClub_URL") + "?dLT=" + rtnValue + "&recordId=0"}).fire();
            }
        });
        $A.enqueueAction(action);  

        }catch(e) {
            alert(e);
        }

    },

	navigateLiquorHotel: function(cmp, event, helper) {
      // In here, we need to get the code and call the 
      try {
      var action = cmp.get("c.getClass");         // Set the routine to call in the controller
      action.setParams({"code": cmp.get("v.serveLiquorHotel_Code")});
      
        action.setCallback(this, function(response){        // and when it returns, perform ....
            var rtnValue = response.getReturnValue();       // get the data and validate it, if null show an error
            if (rtnValue === null) {
                cmp.set("v.errorMessage",response.getReturnValue());
                cmp.set("v.showError",true);      
            }else
            {
               $A.get("e.force:navigateToURL").setParams({"url": cmp.get("v.serveLiquorHotel_URL") + "?dLT=" + rtnValue  + "&recordId=0" }).fire();
            }
        });
        $A.enqueueAction(action);  

        }catch(e) {
            alert(e);
        }

    },

	navigateLiquorVehicle: function(cmp, event, helper) {
      // In here, we need to get the code and call the 
      try {
      var action = cmp.get("c.getClass");         // Set the routine to call in the controller
      action.setParams({"code": cmp.get("v.serveLiquorVehicle_Code")});
      
        action.setCallback(this, function(response){        // and when it returns, perform ....
            var rtnValue = response.getReturnValue();       // get the data and validate it, if null show an error
            if (rtnValue === null) {
                cmp.set("v.errorMessage",response.getReturnValue());
                cmp.set("v.showError",true);      
            }else
            {
               $A.get("e.force:navigateToURL").setParams({"url": cmp.get("v.serveLiquorVehicle_URL") + "?dLT=" + rtnValue  + "&recordId=0" }).fire();
            }
        });
        $A.enqueueAction(action);  

        }catch(e) {
            alert(e);
        }

    },

	navigateBeerWineLiquor: function(cmp, event, helper) {
      // In here, we need to get the code and call the 
      try {
      var action = cmp.get("c.getClass");         // Set the routine to call in the controller
      action.setParams({"code": cmp.get("v.serveBeerWineLiquor_Code")});
      
        action.setCallback(this, function(response){        // and when it returns, perform ....
            var rtnValue = response.getReturnValue();       // get the data and validate it, if null show an error
            if (rtnValue === null) {
                cmp.set("v.errorMessage",response.getReturnValue());
                cmp.set("v.showError",true);      
            }else
            {
               $A.get("e.force:navigateToURL").setParams({"url": cmp.get("v.serveBeerWineLiquor_URL") + "?dLT=" + rtnValue   + "&recordId=0"}).fire();
            }
        });
        $A.enqueueAction(action);  

        }catch(e) {
            alert(e);
        }

    }

})