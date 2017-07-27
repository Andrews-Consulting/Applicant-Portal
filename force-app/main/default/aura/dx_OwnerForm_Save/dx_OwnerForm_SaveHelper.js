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
                	var owner = JSON.parse(JSON.stringify(component.get("v.owner")));
                	var list = rtnValue;
                	var opts = [];
                	if(owner.State__c==null)
                		owner.State__c=list[0];
                	for(var i=0;i<list.length;i++){
                		var selected = (list[i] == owner.State__c);
                		opts.push({label:list[i], value:list[i], selected:selected});
                	}
                	component.find("state").set("v.options",opts);
                	opts = [];
                	if(owner.abd_State_of_Incorporation__c==null)
                		owner.abd_State_of_Incorporation__c=list[0];
                	for(var i=0;i<list.length;i++){
                		var selected = (list[i] == owner.abd_State_of_Incorporation__c);
                		opts.push({label:list[i], value:list[i], selected:selected});
                	}
                	component.find("incState").set("v.options",opts);
                	list = ['--None--','Yes','No'];
                	opts = [];
                    if(owner.abd_Federal_Gambling_Stamp__c==null)
                		owner.abd_Federal_Gambling_Stamp__c=list[0];
                	for(var i=0;i<list.length;i++){
                		var selected = (list[i] == owner.abd_Federal_Gambling_Stamp__c);
                		opts.push({label:list[i], value:list[i], selected:selected});
                	}
                	component.find("stamp").set("v.options",opts);
                	opts = [];
                    if(owner.U_S_Citizen__c==null)
                		owner.U_S_Citizen__c=list[0];
                	for(var i=0;i<list.length;i++){
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
	        var action = component.get("c.getOwner");    // Set the routine to call in the controller
	        var Id = component.get("v.recordId");
	        action.setParams({"id": Id});
	        action.setCallback(this, function(response){
	        	var rtnValue = response.getReturnValue();
	            if (rtnValue == null) {                        // display any errors from the controller.
	                component.set("v.errorMessage",response.getReturnValue());
	                component.set("v.showError",true);
	            }else{
	            	rtnValue.sobjectType = 'Application_Contact__c';
	            	component.set("v.owner",rtnValue);
	            	component.set("v.appId",rtnValue.Application__c);
	            }
	        });
    		$A.enqueueAction(action);
        }
        catch(e) {
            alert(e);
        }
    },
    getType: function(component,event){
    	try {
	    	console.log('Get Type');
	        var action = component.get("c.getType");    // Set the routine to call in the controller
	        action.setCallback(this, function(response){
	        	var rtnValue = response.getReturnValue();
	            if (rtnValue == null) {                        // display any errors from the controller.
	                component.set("v.errorMessage",response.getReturnValue());
	                component.set("v.showError",true);
	            }else{
	            	if(rtnValue == 'Sole Proprietorship')
	            		component.set("v.showSSN",true);
	            	component.set("v.owner",rtnValue);
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

    doUpdate: function(component){
        try {
            component.set("v.showError",false);                 // clear the error message off of the screen
            var notAnswered = '--None--';
            var appId = component.get("v.appId");       // get the data from the component
            var owner = JSON.parse(JSON.stringify(component.get("v.owner")));       // get the data from the component
            console.log(owner);
            // validate the data here!  Check to see if the fields are completed.
            var errmsg = '';
            // If any fields were blank, fix up the message to be readable.
            if (errmsg.length != 0) { 
                errmsg = 'The following fields are required and are missing data: ' + errmsg;
                if (errmsg.endsWith(', ')) errmsg = errmsg.substring(0,errmsg.length-2) + '. ';
            }
            if (appId == null) 
            	if(owner.Id == null)errmsg = 'It does not appear that you are still logged in or logged in as a valid user.';

            // If there is an error, then let's display it and leave.
            if (errmsg.length != 0) {
                component.set("v.errorMessage",errmsg);
                component.set("v.showError",true);
                this.spinnerOff(component, event);
            }
            // If all good, then let's call the controller and try to update the record.
            else {
            	console.log('Update Record');
                owner.sobjectType = 'Application_Contact__c';
                var action = component.get("c.upRecordApex");       // Set the routine to call in the controller
                action.setParams({"owner": owner});         // pass the data to the controller
                action.setCallback(this, function(response){
                	console.log(response.getError());
                    var rtnValue = response.getReturnValue();
                    this.spinnerOff(component, event);
                    if (rtnValue !== null) {                        // display any errors from the controller.
                        component.set("v.errorMessage",response.getReturnValue());
                        component.set("v.showError",true);
                    }else{
                    	//this.gotoURL(component,event);
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

    // internal function to display/hide the spinner so that the user know's we are working.
       // turn the spinner off (hide it by adding the hide class)
    spinnerOff: function (cmp, event) {
        var spinner = cmp.find("spinner");
        $A.util.addClass(spinner, "slds-hide");
    }, 
    // turn the spinner on (make it visible  by removing the hide class)
    spinnerOn: function (cmp, event) {
        var spinner = cmp.find("spinner");
        $A.util.removeClass(spinner, "slds-hide");
    },
	
	goToNext : function (component, event, helper) {
	    var urlEvent = $A.get("e.force:navigateToURL");
	    urlEvent.setParams({
	      "url": component.get("v.NextPageURL")
	    });
	    urlEvent.fire();
	},
	handleCancel : function(component,event) {
		var evt = $A.get("e.force:navigateToURL");
        var urlValue = component.get("v.prevPageURL");
        evt.setParams({"url": urlValue});
    	evt.fire();    
	},
	gotoURL : function (component, event, helper) {
		var urlEvent = $A.get("e.force:navigateToURL");
	    urlEvent.setParams({
	      "url": "/dx-ownerform?id="+component.get("v.appId"),
	      "isredirect": true
	    });
	    //urlEvent.fire();
	    window.location.assign("/Applicant/s/dx-ownerform?id="+component.get("v.appId"));
	}
})