({

	navigateShipBeerIntoIA: function(cmp, event, helper) {
      // In here, we need to get the code and call the 
      try {
      var action = cmp.get("c.getClass");         // Set the routine to call in the controller
      action.setParams({"code": cmp.get("v.shipBeerIntoIA_Code")}); // hard code the parm for now.
      
        action.setCallback(this, function(response){        // and when it returns, perform ....
            var rtnValue = response.getReturnValue();       // get the data and validate it, if null show an error
            if (rtnValue === null) {
                cmp.set("v.errorMessage",response.getReturnValue());
                cmp.set("v.showError",true);      
            }else
            {
               $A.get("e.force:navigateToURL").setParams({"url": cmp.get("v.shipBeerIntoIA_URL") + "?dLT=" + rtnValue  + "&recordId=0" }).fire();
            }
        });
        $A.enqueueAction(action);  

        }catch(e) {
            alert(e);
        }

    },
    
	navigateShipWineIntoIA: function(cmp, event, helper) {
      // In here, we need to get the code and call the 
      try {
      var action = cmp.get("c.getClass");         // Set the routine to call in the controller
      action.setParams({"code": cmp.get("v.shipWineIntoIA_Code")}); // hard code the parm for now.
      
        action.setCallback(this, function(response){        // and when it returns, perform ....
            var rtnValue = response.getReturnValue();       // get the data and validate it, if null show an error
            if (rtnValue === null) {
                cmp.set("v.errorMessage",response.getReturnValue());
                cmp.set("v.showError",true);      
            }else
            {
               $A.get("e.force:navigateToURL").setParams({"url": cmp.get("v.shipWineIntoIA_URL") + "?dLT=" + rtnValue  + "&recordId=0" }).fire();
            }
        });
        $A.enqueueAction(action);  

        }catch(e) {
            alert(e);
        }

    },
    
	navigateShipSpiritsIntoIA: function(cmp, event, helper) {
      // In here, we need to get the code and call the 
      try {
      var action = cmp.get("c.getClass");         // Set the routine to call in the controller
      action.setParams({"code": cmp.get("v.shipSpiritsIntoIA_Code")}); // hard code the parm for now.
      
        action.setCallback(this, function(response){        // and when it returns, perform ....
            var rtnValue = response.getReturnValue();       // get the data and validate it, if null show an error
            if (rtnValue === null) {
                cmp.set("v.errorMessage",response.getReturnValue());
                cmp.set("v.showError",true);      
            }else
            {
               $A.get("e.force:navigateToURL").setParams({"url": cmp.get("v.shipSpiritsIntoIA_URL") + "?dLT=" + rtnValue  + "&recordId=0" }).fire();
            }
        });
        $A.enqueueAction(action);  

        }catch(e) {
            alert(e);
        }

    },
    
	navigateDistillSpiritsAndSampleInIA: function(cmp, event, helper) {
      // In here, we need to get the code and call the 
      try {
      var action = cmp.get("c.getClass");         // Set the routine to call in the controller
      action.setParams({"code": cmp.get("v.distillSpiritsAndSampleInIA_Code")}); // hard code the parm for now.
      
        action.setCallback(this, function(response){        // and when it returns, perform ....
            var rtnValue = response.getReturnValue();       // get the data and validate it, if null show an error
            if (rtnValue === null) {
                cmp.set("v.errorMessage",response.getReturnValue());
                cmp.set("v.showError",true);      
            }else
            {
               $A.get("e.force:navigateToURL").setParams({"url": cmp.get("v.distillSpiritsAndSampleInIA_URL") + "?dLT=" + rtnValue   + "&recordId=0"}).fire();
            }
        });
        $A.enqueueAction(action);  

        }catch(e) {
            alert(e);
        }

    },
    
	navigateDistillSpiritsAndSellOutsideIA: function(cmp, event, helper) {
      // In here, we need to get the code and call the 
      try {
      var action = cmp.get("c.getClass");         // Set the routine to call in the controller
      action.setParams({"code": cmp.get("v.distillSpiritsAndSellOutsideIA_Code")}); // hard code the parm for now.
      
        action.setCallback(this, function(response){        // and when it returns, perform ....
            var rtnValue = response.getReturnValue();       // get the data and validate it, if null show an error
            if (rtnValue === null) {
                cmp.set("v.errorMessage",response.getReturnValue());
                cmp.set("v.showError",true);      
            }else
            {
               $A.get("e.force:navigateToURL").setParams({"url": cmp.get("v.distillSpiritsAndSellOutsideIA_URL") + "?dLT=" + rtnValue  + "&recordId=0" }).fire();
            }
        });
        $A.enqueueAction(action);  

        }catch(e) {
            alert(e);
        }

    },
    
	navigateShipWineToPersonalAddress: function(cmp, event, helper) {
      // In here, we need to get the code and call the 
      try {
      var action = cmp.get("c.getClass");         // Set the routine to call in the controller
      action.setParams({"code": cmp.get("v.shipWineToPersonalAddress_Code")}); // hard code the parm for now.
      
        action.setCallback(this, function(response){        // and when it returns, perform ....
            var rtnValue = response.getReturnValue();       // get the data and validate it, if null show an error
            if (rtnValue === null) {
                cmp.set("v.errorMessage",response.getReturnValue());
                cmp.set("v.showError",true);      
            }else
            {
               $A.get("e.force:navigateToURL").setParams({"url": cmp.get("v.shipWineToPersonalAddress_URL") + "?dLT=" + rtnValue  + "&recordId=0" }).fire();
            }
        });
        $A.enqueueAction(action);  

        }catch(e) {
            alert(e);
        }

    },
    
	navigatePromoteLiquorInIA: function(cmp, event, helper) {
      // In here, we need to get the code and call the 
      try {
      var action = cmp.get("c.getClass");         // Set the routine to call in the controller
      action.setParams({"code": cmp.get("v.promoteLiquorInIA_Code")}); // hard code the parm for now.
      
        action.setCallback(this, function(response){        // and when it returns, perform ....
            var rtnValue = response.getReturnValue();       // get the data and validate it, if null show an error
            if (rtnValue === null) {
                cmp.set("v.errorMessage",response.getReturnValue());
                cmp.set("v.showError",true);      
            }else
            {
               $A.get("e.force:navigateToURL").setParams({"url": cmp.get("v.promoteLiquorInIA_URL") + "?dLT=" + rtnValue  + "&recordId=0" }).fire();
            }
        });
        $A.enqueueAction(action);  

        }catch(e) {
            alert(e);
        }

    },
    

})