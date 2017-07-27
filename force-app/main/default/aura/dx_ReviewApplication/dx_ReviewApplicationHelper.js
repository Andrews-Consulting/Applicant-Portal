({
	getReviewApplication : function(component, event, helper) {
		try{
			var action = component.get("c.getReviewApplication");
	        action.setParams({"rId":component.get("v.recordId")});
	        action.setCallback(this, function(response) {
	            try {            
	                var state = response.getState();
		            if (state === 'SUCCESS') {
		            	var ret = response.getReturnValue();
		                var rtnValue = ret.application;
		                var ltype = ret.ltype;
		                
		                component.set("v.licenses",ret.licenses);
		                component.set("v.review",ret.review);
		                component.set("v.reviewApplication",ret);
		                
		                if(rtnValue.abd_Premise_County__c == 'Polk' && (ltype.includes('BB') || ltype.includes('BW') || ltype.includes('LA') || ltype.includes('LB') || ltype.includes('LC') || ltype.includes('WCN'))) {
                            component.set("v.showOcc",true);
                        }
		                if(ltype.includes('BB') || ltype.includes('LC') || ltype.includes('LE') || ltype.includes('BA') || ltype.includes('BAA') || ltype.includes('BAN') || ltype.includes('BAAN') || ltype.includes('WA') || ltype.includes('WAN') || ltype.includes('DS')){
                            var show = true;
                            if((ltype.includes('BB') || ltype.includes('LC')) && (!ltype.includes('P-HPBP') && !ltype.includes('P-BP')))
                                show = false;
                        }
	                	// show Boat question
                        if(ltype.includes('LD') && rtnValue.abd_Premises_Vehicle_Type__c==='Boat') {
                            component.set("v.showLD",true);
                        }
                        // Show the dram insurance list
                        if(ltype.includes('BB') || ltype.includes('BW') || ltype.includes('LA') || ltype.includes('LB') || ltype.includes('LC') || ltype.includes('LD') || ltype.includes('WCN')) {
                            component.set("v.showDram",true);
                        }
                        // Class A veteran's org and non-profit question
                        if(ltype.includes('LA')) {
                            component.set("v.showVO",true);
                        }
                        var pKeys = component.get("v.reviewApplication.premiseKeys");
                        var map = component.get("v.reviewApplication.premiseQuestions");
                    	component.set("v.pq",map);
                    	for(var i in pKeys){
                        	var key = pKeys[i];
                        }
                        console.log('RA recieved'); 
                    }
		            else {      // error or incomplete comes here
		            	var errors = response.getError();
		                if (errors) {
		                    for (var erri = 0; erri < errors.length; erri++) {
		                        component.set("v.errorMessage", component.get("v.errorMessage") + " : " + errors[erri].message );
		                    }
		                    component.set("v.showError",true);
		                }
		            }
	            } catch(e) {
	                alert(e.stack);
	            }
	        });
	        $A.enqueueAction(action);
        }
        catch(e) {
            alert(e.stack);
        }
	},
	getLicenses : function(component, event, helper) {
		try{
			var action = component.get("c.getLicenses");
	        action.setParams({"s":component.get("v.reviewApplication.s")});
	        action.setCallback(this, function(response) {
	            try {            
	                var state = response.getState();
		            if (state === 'SUCCESS') {
		            	var ret = response.getReturnValue();
		                component.set("v.licenses",ret);
		                console.log('Licenses Recieved');
		            }
		            else {      // error or incomplete comes here
		            	var errors = response.getError();
		                if (errors) {
		                    for (var erri = 0; erri < errors.length; erri++) {
		                        component.set("v.errorMessage", component.get("v.errorMessage") + " : " + errors[erri].message );
		                    }
		                    component.set("v.showError",true);
		                }
		            }
	            } catch(e) {
	                alert(e.stack);
	            }
	        });
	        $A.enqueueAction(action);
        }
        catch(e) {
            alert(e.stack);
        }
	},
	doUpdate : function(component, event, helper) {
		console.log('Do Update');
		try{
			var action = component.get("c.updateReview");
			console.log(component.get("v.review"));
			console.log(component.get("v.licenses"));
			var licenses = JSON.stringify(component.get("v.licenses"));
			console.log(licenses);

			var review = component.get("v.review");

			errmsg = '';
            if  ($A.util.isEmpty(review.MUSW__Completed_DateTime__c) || 
				(review.MUSW__Completed_DateTime__c.length < 6) || 
                (new Date(review.MUSW__Completed_DateTime__c) == 'Invalid Date') || 
                (new Date(review.MUSW__Completed_DateTime__c).getTime() < 0) || 
                (new Date(review.MUSW__Completed_DateTime__c).getTime() > new Date().getTime()))
                    errmsg += 'Review Date ';
  
            if (errmsg.length !== 0) { 
                errmsg = 'The following fields are required and are missing or have invalid data: ' + errmsg;
                if (errmsg.endsWith(', ')) errmsg = errmsg.substring(0,errmsg.length-2) + '. ';
            }

            // If there is an error, then let's display it and leave.
            if (errmsg.length !== 0) {
                component.set("v.errorMessage",errmsg);
                component.set("v.showError",true);
                var nextAction = component.getEvent("SaveCompleted");
                nextAction.setParams({"Component" : component, "Action": "Fail" });
                nextAction.fire();
            }
            else {

				action.setParams({"review":component.get("v.review"),"licensesString":licenses});
		        action.setCallback(this, function(response) {
		            try {
		            	var nextAction = component.getEvent("SaveCompleted");
	                    var state = response.getState();
		                if (state === 'SUCCESS') {
	                        nextAction.setParams({"Component" : component, "Action": "Saved" });
	                        console.log('Successfull Update');
	                    }
	                    else {      // error or incomplete comes here
	                    	console.log('Something Wrong');
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
	                        nextAction.setParams({"Component" : component, "Action": "Fail" });
	                    }
		            } catch(e) {
		                alert(e.stack);
		            }
	                finally {
	                    // always fire this action.  parms are set.                
	                    nextAction.fire();
	                }
		        });
		        $A.enqueueAction(action);
		    }
        }
        catch(e) {
            alert(e.stack);
        }
	
	}
})