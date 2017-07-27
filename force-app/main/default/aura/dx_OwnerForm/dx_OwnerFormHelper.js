({
	// Call the controller to get the Citizenship values for the drop down box.  (not the result, but all of the choices)
    getPicklistValues: function(component){
        try {
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
                		opts.push({label:list[i], value:list[i], selected:selected});
                	}
                	component.find("state").set("v.options",opts);

                	list = ['--None--','Yes','No'];
                	opts = [];
                    if(owner.U_S_Citizen__c === null)
                		owner.U_S_Citizen__c=list[0];
                	for(i=0;i<list.length;i++){
                		var selected = (list[i] == owner.U_S_Citizen__c);
                		opts.push({label:list[i], value:list[i], selected:selected});
                	}
                	component.find("citizen").set("v.options",opts);
                	component.set("v.owner",owner);
                }
            });
    		$A.enqueueAction(action);
        }
        catch(e) {
            alert(e);
        }
    },
    getOwner: function(component,event){
    	try {
	    	console.log('Get Owner');
	        var action = component.get("c.getOwnerss");    // Set the routine to call in the controller
	        action.setParams({"ownerId": component.get("v.owner.Id"), "appId" : component.get("v.recordId")});
	        action.setCallback(this, function(response){
	        	var rtnValue = response.getReturnValue();
	            if (rtnValue === null) {                        // display any errors from the controller.
	                component.set("v.errorMessage",response.getReturnValue());
	                component.set("v.showError",true);
	            }else{
	            	rtnValue.sobjectType = 'Application_Contact__c';
                    // If this is a new object, the application ID reference isn't set
                    if (rtnValue.Application__c === null) rtnValue.Application__c = component.get("v.recordId");
	            	component.set("v.owner",rtnValue);
                    if ($A.util.isEmpty(component.get("v.recordId")) && !$A.util.isEmpty(rtnValue.Application__c))
                        component.set("v.recordId",rtnValue.Application__c);

                    // If one of these is set, turn the other off, otherwise both stay on until they enter a name.
                    if (!$A.util.isEmpty(rtnValue.Business_Name__c))
                        component.set("v.isPersonName",false);
                    if (!$A.util.isEmpty(rtnValue.First_Name__c) || !$A.util.isEmpty(rtnValue.Last_Name__c))
                        component.set("v.isBusinessName",false);

                    // single person entity check
                    if (rtnValue.abd_LicenseeBusinessType__c == 'Municipality' || 
                        rtnValue.abd_LicenseeBusinessType__c == 'Sole Proprietorship' ) {
                        component.set("v.NoAllocationsAllowed",true);
                        rtnValue.of_Ownership__c=100;
                        component.set("v.isBusinessName",false);
                        component.set("v.noBusinessAllowed",true);
                    }

                    // no businesses allowed
                    if (rtnValue.abd_LicenseeBusinessType__c == 'General Partnership') {
                        component.set("v.isBusinessName",false);
                        component.set("v.noBusinessAllowed",true);
                    }
                    // but If we get them both turned off, turn them both on
                    if (!component.get("v.isPersonName") && !component.get("v.isBusinessName")) {
                        component.set("v.isPersonName",true);   
                        component.set("v.isBusinessName",true);
                    }

                    if ($A.util.isEmpty(rtnValue.Id))
                        this.getType(component, event);
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

    doUpdate: function(component,doEvent){
        try {
            component.set("v.showError",false);                 // clear the error message off of the screen
            var notAnswered = '--None--';

            // If this isn't an application, then skip the Save for Now and tell everyone we're okay!
            if (!component.get("v.RecordIdIsApplication")) {
                var action = component.getEvent("SaveCompleted");
                action.setParams({"Component" : component, "Action": "Saved" });
                action.fire();
                return;
            }

            
            var owner = JSON.parse(JSON.stringify(component.get("v.owner")));       // get the data from the component
            console.log(owner);
            // validate the data here!  Check to see if the fields are completed.
            var errmsg = '';
 
            // if all of the fields are blank, then don't write this out, just leave
            if ($A.util.isEmpty(owner.Address_2__c) && 
                $A.util.isEmpty(owner.Address__c) && 
                $A.util.isEmpty(owner.Business_Name__c) && 
                $A.util.isEmpty(owner.City__c) && 
                $A.util.isEmpty(owner.First_Name__c) && 
                $A.util.isEmpty(owner.Last_Name__c) && 
                $A.util.isEmpty(owner.Position__c) && 
                $A.util.isEmpty(owner.SSN__c) && 
                ($A.util.isEmpty(owner.State__c) || (owner.State__c == notAnswered)) && 
                ($A.util.isEmpty(owner.U_S_Citizen__c) || (owner.U_S_Citizen__c == notAnswered)) && 
                $A.util.isEmpty(owner.Zip_Code__c)){
                	var action = component.getEvent("SaveCompleted");
                	action.setParams({"Component" : component, "Action": "Saved" });
                	action.fire();
                	return;
                }

            owner.Application__c = component.get("v.recordId");


            var isBusiness = component.get("v.isBusinessName");
            var isPerson = component.get("v.isPersonName");
            // Need to pick the fields that are required for each type of owner!
            if (isPerson) {
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
                        errmsg = 'Date of Birth, ';
                    else owner.Date_of_Birth__c = new Date(owner.Date_of_Birth__c).toJSON().substr(0,10);
                }
            } 
            if (isBusiness) {
//                if (!owner.abd_EIN__c) errmsg += 'Employer Identification Number (EIN)';
            }

            

            // General clean up of data before we attempt to write it
            if (owner.U_S_Citizen__c == notAnswered) owner.U_S_Citizen__c = null;
            if (owner.State__c == notAnswered) owner.State__c = null;


            if (errmsg.length !== 0) { 
                errmsg = 'The following fields are required and are missing or have invalid data: ' + errmsg;
                if (errmsg.endsWith(', ')) errmsg = errmsg.substring(0,errmsg.length-2) + '. ';
            }

            // This message just trumps the others.
            if (isBusiness) {
                if (component.get("v.NoAllocationsAllowed"))
                    errmsg = 'Sole Proprietorship and Municipalities should have a person\'s name listed, not a business name';
            }

            // if(owner.Id == null)errmsg = 'It does not appear that you are still logged in or logged in as a valid user.';

            // If there is an error, then let's display it and leave.
            if (errmsg.length !== 0) {
                component.set("v.errorMessage",errmsg);
                component.set("v.showError",true);
                var nextAction = component.getEvent("SaveCompleted");
                nextAction.setParams({"Component" : component, "Action": "Fail" });
                nextAction.fire();
            }
            // If all good, then let's call the controller and try to update the record.
            else {
            	console.log('Update Record');
                owner.sobjectType = 'Application_Contact__c';
                var action = component.get("c.upRecordApex");       // Set the routine to call in the controller
                action.setParams({"owner": owner});                 // pass the data to the controller
                action.setCallback(this, function(response){
                	var action = component.getEvent("SaveCompleted");
                    try {            
                        console.log(response);
                        var state = response.getState();
                        if (state === 'SUCCESS'  && !response.getReturnValue()) {
                            if(doEvent)
                            	action.setParams({"Component" : component, "Action": "Saved" });
                        }
                        else {      // error or incomplete comes here
                            var errors = response.getError();
                            if (errors) {
                                // get all error messages to display
                                for (var erri = 0; erri < errors.length; erri++) {
                                    component.set("v.errorMessage", component.get("v.errorMessage") + " : " + errors[erri].message);
                                }
                            }
                            else {      //validation errors and dml errors appear here.
                                    component.set("v.errorMessage", response.getReturnValue());
                            }
                            component.set("v.showError",true);      
                            action.setParams({"Component" : component, "Action": "Fail" });
                        }
                    } catch(e) {
                        alert(e.stack);
                        action.setParams({"Component" : component, "Action": "Fail" });
                    }
                    finally {
                    // always fire this action.  parms are set.                
                        action.fire();
                    }
                    
                });
        		$A.enqueueAction(action);                            // put this item on the queue to execute.
            }
        }
        catch(e) {      //development catch of typos and other dumb mistakes.
            alert(e.name + ': ' + e.message+ ' : '+e.lineNumber);
        }
    },
	// gotoURL : function (component, event, helper) {
 //        var owner = component.get("v.owner"); 
 //        // new_owner.sobjectType = 'Application_Contact__c';
 //        owner.Id = null;
 //        owner.Application__c = null;
 //        owner.Business_Name__c = null;
 //        owner.First_Name__c = null;
 //        owner.Last_Name__c = null;
 //        owner.Address__c = null;
 //        owner.Address_2__c = null;
 //        owner.City__c = null;
 //        owner.State__c = null;
 //        owner.Zip_Code__c = null;
 //        owner.Position__c = null;
 //        owner.SSN__c = null;
 //        owner.abd_Federal_Gambling_Stamp__c = null;
 //        owner.Date_of_Birth__c = null;
 //        owner.U_S_Citizen__c = null;
 //        owner.abd_Credit_Gift_Loan_Amount__c = null;
 //        owner.abd_Amount_Paid__c = null;
 //        owner.of_Ownership__c = null;
 //        component.set("v.owner",owner);
        
 //        $A.get("e.force:refreshView").fire();
	// },

	handleClassParam: function(component) {
    	// the function that reads the url parameters
        var getUrlParameter = function getUrlParameter(sParam) {
            var sPageURL = decodeURIComponent(window.location.search.substring(1)),
                sURLVariables = sPageURL.split('&'),
                sParameterName,
                i;

            for (i = 0; i < sURLVariables.length; i++) {
                sParameterName = sURLVariables[i].split('=');

                if (sParameterName[0] === sParam) {
                    return sParameterName[1] === undefined ? null : sParameterName[1];
                }
            }
        };
        var urlp = getUrlParameter('id');
        if (!$A.util.isEmpty(urlp))
            component.set("v.owner.Id",urlp );
    }
})