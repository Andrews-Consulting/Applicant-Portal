({
	// Call the controller to get the Citizenship values for the drop down box.  (not the result, but all of the choices)
    getPicklistValues: function(component){
        try {
        	console.log('Get Picklist');
            var action = component.get("c.getPicklistValues");    // Set the routine to call in the controller
            action.setCallback(this, function(response){
                var rtnValue = response.getReturnValue();   
                if (rtnValue === null) {                        // validate that the controller succeeded in getting values.
                    component.set("v.errorMessage",response.getReturnValue());
                    component.set("v.showError",true);
                }else{
                	var agent = JSON.parse(JSON.stringify(component.get("v.agent")));
                	var list = rtnValue;
                	var opts = [];
                	if(agent.abd_Auth_Agent_State__c===null)
                		agent.abd_Auth_Agent_State__c=list[0];
                	for(var i=0;i<list.length;i++){
                		var selected = (list[i] == agent.abd_Auth_Agent_State__c);
                		opts.push({label:list[i], value:list[i], selected:selected});
                	}
                	component.find("state").set("v.options",opts);
                	component.set("v.agent",agent);
                }
            });
    		$A.enqueueAction(action);
        }
        catch(e) {
            alert(e);
        }
    },
    getApplication: function(component,event){
    	try {
	    	console.log('Get Application');
	        var action = component.get("c.checkApplication");    // Set the routine to call in the controller
	        action.setParams({"appId": component.get("v.recordId")});
	        action.setCallback(this, function(response){
	        	try {
	                var state = response.getState();
	                if (state === 'SUCCESS') {
	                    console.log(response.getReturnValue());
	
	                    if (response.getReturnValue() === null) {
	                        var nextAction = component.getEvent("EmptyComponent");
                            console.log('Empty');
	                        nextAction.fire();
	                    }else{
	                    	component.set("v.isSP",response.getReturnValue());
	                    }
	                } else { // error or incomplete comes here
	                    var errors = response.getError();
	                    if (errors) {
	                        // get all error messages to display
	                        for (var erri = 0; erri < errors.length; erri++) {
	                            component.set("v.errorMessage", component.get("v.errorMessage") + " : " + errors[erri].message);
	                        }
	                        component.set("v.showError", true);
	                    }
	                }
	            } catch (e) {
	                alert(e.stack);
	            }
	        });
    		$A.enqueueAction(action);
        }
        catch(e) {
            alert(e.name + ': ' + e.message+ ' : '+e.lineNumber);
        }
    },
    getAgent: function(component,event){
    	try {
	    	console.log('Get Agent');
	        var action = component.get("c.getAA");    // Set the routine to call in the controller
	        var Id = component.get("v.agent.Id");
	        action.setParams({"agentId": Id});
	        action.setCallback(this, function(response){
	        	var rtnValue = response.getReturnValue();
	            if (rtnValue === null) {                        // display any errors from the controller.
	                component.set("v.errorMessage",response.getError()[0].message);
	                component.set("v.showError",true);
	            }else{
	            	rtnValue.sobjectType = 'abd_Authorized_Agent__c';
                    if (rtnValue.abd_Application__c === null) rtnValue.abd_Application__c = component.get("v.recordId");
	            	component.set("v.agent",rtnValue);
	            }
	        });
    		$A.enqueueAction(action);
        }
        catch(e) {
            alert(e.name + ': ' + e.message+ ' : '+e.lineNumber);
        }
    },
    // Call the controller to update the record with the values collected on the screen.
    // We could do validation here on the client side to make this a little faster.

    doUpdate: function(component){
        try {
            component.set("v.showError",false);                 // clear the error message off of the screen
            var notAnswered = '--None--';

            var action = component.getEvent("SaveCompleted");

            // If this isn't an application, then skip the Save for Now and tell everyone we're okay!
            if (!component.get("v.RecordIdIsApplication")) {
                action.setParams({"Component" : component, "Action": "Saved" });
                action.fire();
                return;
            }


            var agent = JSON.parse(JSON.stringify(component.get("v.agent")));       // get the data from the component
            console.log(agent);
            if (!agent.abd_Application__c) agent.abd_Application__c = component.get("v.recordId");
            if (!agent.abd_Application__c) alert('agent is not connect to the app');

            // validate the data here!  Check to see if the fields are completed.
            // If it's completely blank, then just skip ahead.
            if ($A.util.isEmpty(agent.abd_Auth_Agent_Name__c) && 
                $A.util.isEmpty(agent.abd_Auth_Agent_Address__c) && 
                $A.util.isEmpty(agent.abd_Auth_Agent_Address_2__c) && 
                $A.util.isEmpty(agent.abd_Auth_Agent_City__c) && 
                $A.util.isEmpty(agent.abd_Auth_Agent_State__c) && 
                $A.util.isEmpty(agent.abd_Auth_Agent_Zip__c) && 
                $A.util.isEmpty(agent.abd_Auth_Agent_Phone__c)) {
                    action.setParams({"Component" : component, "Action": "Saved" });
                    action.fire();
                    return;
                }
    

            var errmsg = '';

            if (!$A.util.isEmpty(component.find("phone"))) {
                var validity = component.find("phone").get("v.validity");
                if (!validity.valid) 
                    errmsg += 'Phone number, ';            
            }

            if (errmsg.length !== 0) { 
                errmsg = 'The following fields are required and are missing or have invalid data: ' + errmsg;
                if (errmsg.endsWith(', ')) errmsg = errmsg.substring(0,errmsg.length-2) + '. ';
            }

            // if(owner.Id == null)errmsg = 'It does not appear that you are still logged in or logged in as a valid user.';

            // If there is an error, then let's display it and leave.
            if (errmsg.length !== 0) {
                component.set("v.errorMessage",errmsg);
                component.set("v.showError",true);
                action.setParams({"Component" : component, "Action": "Fail" });
                action.fire();
            }
            // If all good, then let's call the controller and try to update the record.
            else {

                if (agent.abd_Auth_Agent_State__c == notAnswered) agent.abd_Auth_Agent_State__c = null;

            	console.log('Update Record');
                agent.sobjectType = 'abd_Authorized_Agent__c';
                action = component.get("c.upRecordApex");       // Set the routine to call in the controller
                action.setParams({"agent": agent});         // pass the data to the controller
                action.setCallback(this, function(response){

                    var action = component.getEvent("SaveCompleted");
                    try {            
                        var state = response.getState();
                        if (state === 'SUCCESS'  && !response.getReturnValue()) {
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
        	this.spinnerOff(component, event);
            alert(e.name + ': ' + e.message+ ' : '+e.lineNumber);
        }
    }, 


 // gotoURL : function (component, event, helper) {
 //        var agent = component.get("v.agent"); 
 //        // new_owner.sobjectType = 'Application_Contact__c';
 //        agent.Id = null;
 //        agent.abd_Application__c = null;
 //        agent.abd_Auth_Agent_Name__c = null;
 //        agent.abd_Auth_Agent_Address__c = null;
 //        agent.abd_Auth_Agent_Address_2__c = null;
 //        agent.abd_Auth_Agent_City__c = null;
 //        agent.abd_Auth_Agent_State__c = null;
 //        agent.abd_Auth_Agent_Zip__c = null;
 //        agent.abd_Auth_Agent_Phone__c = null;
 //        component.set("v.agent",agent);
 //        /*var urlEvent = $A.get("e.force:navigateToURL");
	//     urlEvent.setParams({"url": "/dx-authorizedagentform?recordId=" + component.get("v.recordId")});
	//     urlEvent.fire();*/
 //        $A.get("e.force:refreshView").fire();
 //        /*var urlEvent = $A.get("e.force:navigateToURL");
	//     urlEvent.setParams({
	//       "url": "/dx-ownerform?id="+component.get("v.appId"),
	//       "isredirect": true
	//     });
	//     //urlEvent.fire();
	//     window.location.assign("/Applicant/s/dx-ownerform?id="+component.get("v.appId"));*/
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
                    return sParameterName[1] === undefined ? true : sParameterName[1];
                }
            }
        };
        component.set("v.agent.Id", getUrlParameter('id'));
    }
})