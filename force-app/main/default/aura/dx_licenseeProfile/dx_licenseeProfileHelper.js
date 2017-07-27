({
	getAccount: function(component){
        try{
            console.log('Get Account');
            component.set("v.showError",false);                 // clear the error message display
        	var ids = [];
        	var action = component.get("c.getAccount");         // Set the routine to call in the controller
            action.setCallback(this, function(response){        // and when it returns, perform ....
                var rtnValue = response.getReturnValue();       // get the data and validate it, if null show an error
                if (rtnValue === null) {
                    component.set("v.errorMessage",response.getReturnValue());
                    component.set("v.showError",true);      
                }else{
                    ids.push(rtnValue.Id);      // but if it's good, set the applicant value to the result.
                    component.set("v.licensee",rtnValue);
                    component.set("v.ids",ids);
                }
                console.log(rtnValue);
            });
    		$A.enqueueAction(action);                           // put this item on the queue to execute.
        }
        catch(e) {
            alert(e);
        }
     },
     setLoaded: function(component){
    	 component.set("v.isLoaded",true);
     }
})