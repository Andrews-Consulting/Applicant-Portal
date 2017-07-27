({
    // Code that is replicated for every instance (typically list views or when multiple instances are displayed on a screen)
    // initialization code to populate the component
    doInit: function(component, event, helper) {
    	console.log('PremiseForm Init');
        helper.getApplication(component, event);
        helper.getAccount(component, event);
        if (component.get("v.RecordIdIsApplication") !== true)
        	if (component.find("UseMailingButton"))
        		$A.util.addClass(component.find("UseMailingButton"),'slds-hide');
        	
    },

    // Save Button code
    save : function(component, event, helper) {
        helper.doUpdate(component, event);
    },
	radioChange : function(component, event,helper) {
		//TODO: Only do this if something changes
		var application = JSON.parse(JSON.stringify(component.get("v.app")));
		application.abd_Temporary_or_Permanent__c = event.getSource().get("v.value");
		component.set("v.app",application);
	},
	laChange : function(component, event,helper) {
		if (!$A.util.isEmpty(component.get("v.LAChoiceIsLocked")))
			if (component.get("v.LAChoiceIsLocked"))
				return;
		// TODO: Should only do this if something changes!

		var application = JSON.parse(JSON.stringify(component.get("v.app")));
		application.abd_Local_Authority_Type__c = event.getSource().get("v.value");
		component.set("v.app",application);
		console.log(application);
	},
	countyChange : function(component, event,helper) {
    	helper.getLocalAuthority(component, event);        
	},
	zipChange : function(component, event,helper) {
    	var zip = component.get("v.app.abd_Premise_Zip_Code__c").substr(0,5);
    	component.set("v.app.abd_Premise_Zip_Code__c",zip);        
	},

	// Whenever the start date and time are adjusted, recalculate the end date.
	onAdjustAuctionDates : function(component, event,helper) {
		if (event.getParam("oldValue") !== event.getParam("value")) {
			var application = JSON.parse(JSON.stringify(component.get("v.app")));
			if (!$A.util.isEmpty(application.abd_Effective_Date__c) && !$A.util.isEmpty(application.abd_Time_of_Auction_Beginning__c)) {
				// Get the start date and time, adjust for the Timezone and add 36 hours of milliseconds in.
				var newEndDate = new Date(new Date(application.abd_Effective_Date__c + ' ' + application.abd_Time_of_Auction_Beginning__c).getTime() - 
											( new Date(application.abd_Effective_Date__c).getTimezoneOffset()*60*1000 ) + (36*60*60*1000 ));

				application.abd_Effective_End_Date__c = newEndDate.toJSON().substr(0,10);
				var selectstr;
				if ((newEndDate.getUTCHours() % 12) === 0)
					selectstr = '12';
				else 
					selectstr = (newEndDate.getUTCHours() % 12).toString();
				selectstr += ':';
				if (newEndDate.getMinutes() === 0)		// only check for on the hour, everything else is on the half hour.
					selectstr += '00 ';
				else
					selectstr += '30 ' ;
				if (newEndDate.getUTCHours() > 11)	
					selectstr += 'PM';
				else
					selectstr += 'AM';
				var ae = component.find("auctionEnd");
				// UI input Select list needs a new object to change it's values.
				if (!$A.util.isEmpty(ae)) {
					var opts = [];
					var selectlist = ae.get("v.options");
					for (var i=0 ; i < selectlist.length; i++ ) {
						selectlist[i].selected = selectlist[i].value === selectstr ? true : false;
						opts.push({label:selectlist[i].label, value:selectlist[i].value, selected:selectlist[i].selected});
						}
					ae.set("v.options",opts);
					}
				application.abd_Time_of_Auction_Ending__c = selectstr;					
				component.set("v.app.abd_Effective_End_Date__c",application.abd_Effective_End_Date__c);
				component.set("v.app.abd_Time_of_Auction_Ending__c",application.abd_Time_of_Auction_Ending__c);
				// component.set("v.app",application);
			}
		}
	},

	setMailing : function(component, event,helper) {
		
		try {
			// clear out the error message
			component.set("v.showError",false); 
			component.set("v.errorMessage"," ");

			// get the data to manipulate
			var application = JSON.parse(JSON.stringify(component.get("v.app")));
			var licensee = component.get("v.licensee");

			// validate that we should allow this operation to occur
			if (licensee.BillingState != 'IA' && component.get("v.stateOnly")) {
				component.set("v.errorMessage","This license can only be issued for a premises in the State of Iowa.  Your Mailing Address is not in Iowa.");
				component.set("v.showError",true); 
			}
			else 
				if ( !$A.util.isUndefined(licensee.BillingState) && !$A.util.isUndefined(application.abd_Premise_State__c) && (application.abd_Premise_State__c != licensee.BillingState)) { 
					component.set("v.errorMessage","Your Mailing State doesn't match the Premises State provided.");
					component.set("v.showError",true); 
				}
				else if ( !$A.util.isUndefined(licensee.BillingCity) && !$A.util.isUndefined(application.abd_Premise_City__c) && (application.abd_Premise_City__c != licensee.BillingCity)) { 
					component.set("v.errorMessage","Your Mailing City doesn't match the Premises city provided at the beginning of the application");
					component.set("v.showError",true); 
				}
				else {
					// it's all good, let's copy it in.
					application.abd_Premise_City__c = licensee.BillingCity;
					if (! $A.util.isUndefined(licensee.BillingStreet)) application.abd_Premise_Address__c = licensee.BillingStreet;
					if (! $A.util.isUndefined(licensee.BillingPostalCode) && licensee.BillingPostalCode.length >= 5) application.abd_Premise_Zip_Code__c = licensee.BillingPostalCode.substr(0,5);
					if (! $A.util.isUndefined(licensee.BillingState)) application.abd_Premise_State__c = licensee.BillingState;

					var opts = component.find("States").get("v.options");
			        for( var i=0;i < opts.length; i++){
			        	opts[i].selected = (application.abd_Premise_State__c == opts[i]);
			        }
					component.set("v.app",application);
					console.log(application);
			        //helper.getLocalAuthority(component, event);       
			    }

	    } catch(e) {alert(e.stack);}
	}
})