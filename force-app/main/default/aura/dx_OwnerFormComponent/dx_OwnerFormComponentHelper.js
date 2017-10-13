({
	// Call the controller to get the Citizenship values for the drop down box.  (not the result, but all of the choices)
    getPicklistValues: function(component){
        try {
        	var firstTime = !component.get("v.isInitComplete");
        	console.log('Get Picklist');
            var action = component.get("c.getPicklistValues");    // Set the routine to call in the controller
            var i;
            action.setCallback(this, function(response){
                var rtnValue = response.getReturnValue();   
                if (rtnValue === null) {                        // validate that the controller succeeded in getting values.
                    component.set("v.errorMessage",response.getError()[0].message);
                    component.set("v.showError",true);
                }else{
                	var owner = JSON.parse(JSON.stringify(component.get("v.owner")));
                	var list = rtnValue;
                	var opts = [];
                	if(owner.State__c===null)
                		owner.State__c=list[0];
                	for(i=0;i<list.length;i++){
                		var selected = (list[i] == owner.State__c);
                		opts.push({label:(i===0)?'--':list[i], value:list[i], selected:selected});
                	}
                    if (!$A.util.isEmpty(component.find("state")))
                	   component.find("state").set("v.options",opts);

                    // don't even attempt on the short version of the form.
                    if (component.get("v.showShortForm") === false)  {
                    	list = ['--None--','Yes','No'];
                    	opts = [];
                        if(owner.U_S_Citizen__c === null && firstTime)
                    		owner.U_S_Citizen__c=list[0];
                    	for(i=0;i<list.length;i++){
                    		var selected = (list[i] == owner.U_S_Citizen__c);
                    		opts.push({label:list[i], value:list[i], selected:selected});
                    	}
                        if (!$A.util.isEmpty(component.find("citizen")))
                        	component.find("citizen").set("v.options",opts);
                    }
//                	component.set("v.owner",owner);
                	component.set("v.isInitComplete",true);
                }
            });
    		$A.enqueueAction(action);
        }
        catch(e) {
            alert(e);
        }
    },

    // If no owners exist, then we need to figure if we should allow a percentage to be entered or not.
    // We also need to disable the add another button.
    getType: function(component,event){
    	try {
	    	console.log('Get Type');
	        var action = component.get("c.getTypess");    // Set the routine to call in the controller
	        action.setParams({"appId" : component.get("v.recordId")});
	        action.setCallback(this, function(response){
	        	var rtnValue = response.getReturnValue();
	            if (rtnValue === null) {                        // display any errors from the controller.
	                var errors = response.getError();
                    if (errors) {
                        // get all error messages to display
                        for (var erri = 0; erri < errors.length; erri++) {
                            component.set("v.errorMessage", component.get("v.errorMessage") + " : " + errors[erri].message);
                        }
                        component.set("v.showError",true);      
                    }
	            }else{
                    // These can't be businesses 
                  	if(rtnValue == 'Sole Proprietorship' || rtnValue == 'Municipality' || rtnValue == 'General Partnership'){
                        // sole and municipality are single owner entities 
                        if (rtnValue != 'General Partnership') {
    	            		component.set("v.NoAllocationsAllowed",true);
    	            		var owner = component.get("v.owner");
    	            		owner.of_Ownership__c=100;
    	            		component.set("v.owner",owner);
                        }

                        component.set("v.isPersonName",true);   
                        component.set("v.isBusinessName",false);
                        component.set("v.noBusinessAllowed",true);
	            	}
	            }
	        });
    		$A.enqueueAction(action);
        }
        catch(e) {
            alert(e);
        }
    },
    // Call the controller to update the record with the values collected on the screen.
    // We could do validation here on the client side to make this a little faster.

    validateFields: function(component){
        try {
            component.set("v.showError",false);                 // clear the error message off of the screen
            var notAnswered = '--None--';
            var owner = JSON.parse(JSON.stringify(component.get("v.owner")));       // get the data from the component
            console.log(owner);
            // validate the data here!  Check to see if the fields are completed.
            var errmsg = '';
 
            owner.Application__c = component.get("v.recordId");
            
            //Required fields for all Owner records
            if ($A.util.isEmpty(owner.Address__c)) errmsg += 'Address Line 1, ';
            if ($A.util.isEmpty(owner.City__c)) errmsg += 'City, ';
            if ($A.util.isEmpty(owner.State__c) || owner.State__c == notAnswered) errmsg += 'State, ';
            if ($A.util.isEmpty(owner.Zip_Code__c)) errmsg += 'Zip, ';

            // required for all, but not shown on short form, so we can't validate it.
            if (component.get("v.showShortForm")  !== true)
                if ($A.util.isEmpty(owner.of_Ownership__c)) errmsg += '% Ownership, ';

                
            var isBusiness = component.get("v.isBusinessName");
            var isPerson = component.get("v.isPersonName");

            // Need to pick the fields that are required for each type of owner!
            if (isPerson) {
                if ($A.util.isEmpty(owner.First_Name__c)) errmsg += 'First Name, ';
                if ($A.util.isEmpty(owner.Last_Name__c)) errmsg += 'Last Name, ';

                // On short form, don't validate SSN, DOB, position, citizenship, % ownership

                if (component.get("v.showShortForm")  !== true) {

                    // Validate SSN 
                    var ssnValid = /[0-9]{3}-[0-9]{2}-[0-9]{4}/;
                    if($A.util.isEmpty(owner.SSN__c))
                        errmsg+='SSN, ';
                    else {
                        if (!ssnValid.test(owner.SSN__c)) {
                            owner.SSN__c = owner.SSN__c.replace(/[^0-9]/g,"");
                            if (owner.SSN__c.length == 9) {
                                owner.SSN__c = owner.SSN__c.substr(0,3) + "-" + owner.SSN__c.substr(3,2) + "-" + owner.SSN__c.substr(5,4);
                                component.set("v.owner.SSN__c",owner.SSN__c);
                            }
                        }
                    }

                    if (errmsg === '' && !ssnValid.test(owner.SSN__c))
                        errmsg += 'SSN, ';

                    if (!$A.util.isEmpty(owner.Date_of_Birth__c)) {
                        if ((owner.Date_of_Birth__c.length < 6) || (new Date(owner.Date_of_Birth__c) == 'Invalid Date') || (new Date(owner.Date_of_Birth__c).getTime() < new Date('1900-01-01').getTime()) || (new Date(owner.Date_of_Birth__c).getTime() > new Date().getTime()))
                            errmsg += 'Date of Birth, ';
                    }
    	            if ($A.util.isEmpty(owner.Position__c)) errmsg += 'Position, ';
    	            if ($A.util.isEmpty(owner.U_S_Citizen__c) || owner.U_S_Citizen__c == notAnswered) errmsg += 'US Citizen, ';
    	        } 
            }

            //
            if (isBusiness) {
                if ($A.util.isEmpty(owner.abd_EIN__c) || isNaN(owner.abd_EIN__c)) errmsg += 'Employer Identification Number (EIN), ';
                if ($A.util.isEmpty(owner.Business_Name__c)) errmsg += 'Business Name, ';
            }

            if (errmsg.length !== 0) { 
                errmsg = 'The following fields are required and are missing or have invalid data: ' + errmsg;
                if (errmsg.endsWith(', ')) errmsg = errmsg.substring(0,errmsg.length-2) + '. ';
            }

            // This message just trumps the others.
            if (isBusiness) {
                if (component.get("v.NoAllocationsAllowed"))
                    errmsg = 'Sole Proprietorship and Municipalities should have a person\'s name listed, not a business name';
            }

            // If there is an error, then let's display it and leave.
            if (errmsg.length !== 0) {
            	console.log(errmsg);
                component.set("v.errorMessage",errmsg);
                component.set("v.showError",true);
            }
            // If all good, then let's call the controller and try to update the record.
            else {
            	if(owner.U_S_Citizen__c == notAnswered)
            		owner.U_S_Citizen__c = null;
            	component.set("v.editRow",null);

                // BTW - I don't really have to pass all this information around.  The recieving program can get the component
                // via event.getSource() and then access the v.owner attribute.
                if (!$A.util.isEmpty(component.get("v.throwEventOnDone")) && component.get("v.throwEventOnDone") === true) {
                    var action = component.getEvent("ownerDone");
                    action.setParams({"Component" : component, "Action": "Saved", "AppId": owner.Id, "Other": JSON.stringify(owner) });
                    action.fire();
                }
                    
            }
        }
        catch(e) {      //development catch of typos and other dumb mistakes.
            alert(e.name + ': ' + e.message+ ' : '+e.lineNumber);
        }
    }
})