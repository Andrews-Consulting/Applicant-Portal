({
    // Code that is replicated for every instance (typically list views or when multiple instances are displayed on a screen)
    // initialization code to populate the component
    doInit: function(component, event, helper) {
    	console.log('Additional Location Init');
        helper.getLicense(component, event);
        helper.getPicklistValues(component, event);
        
                        
    },

    // Save Button code
    save : function(component, event, helper) {
        helper.doUpdate(component, event);
    },
	radioChange : function(component, event,helper) {
		var application = JSON.parse(JSON.stringify(component.get("v.app")));
		application.abd_Temporary_or_Permanent__c = event.getSource().get("v.value");
		component.set("v.app",application);
	},
	zipFormat: function(component, event,helper) {
		var zip = component.get("v.app.abd_Premise_Zip_Code__c");
		var zipLen = zip.length;
		zipLen = zip.length;
		if(!isNaN(zip)){
			switch (zipLen){
				case 9:
	    			zip = zip.substring(0,5)+'-'+zip.substring(5);
	    			break;
				default:
					break;
			}
		}
		component.set("v.app.abd_Premise_Zip_Code__c",zip);
	},
	daysChange : function(component, event,helper) {
		var oneDay = 24*60*60*1000;
		var sDate = new Date(component.get("v.app.abd_Effective_Date__c")).getTime();
		var nods = component.get("v.app.abd_Number_of_Days__c");
		console.log(sDate);
		console.log(nods);
		console.log(((nods*1)*oneDay));
		console.log(sDate+(nods*oneDay));
		var newDate = new Date(sDate+(nods*oneDay));
		//var curDate = sDate.getDate();
		console.log(newDate);
		console.log(sDate);
		console.log((nods*oneDay));
		console.log(sDate+(nods*oneDay));
		//sDate.setDate(sDate.getDate()+nods);
		//console.log(new Date(sDate.getFullYear(),sDate.getMonth(),sDate.getDate()+nods));
		component.set("v.app.abd_Effective_End_Date__c",newDate.toJSON().substr(0,10));
		component.set("v.app.abd_End_Time__c",component.get("v.app.abd_Start_Time__c"));
	},
	countyChange : function(component, event,helper) {
		var state = (component.get("v.app.abd_Premise_County__c")!='--None--')?'IA':'--None--';
		component.set("v.app.abd_Premise_State__c",state);
		if(state=='IA')
			helper.getPremiseCity(component, event);        
	},
	stateChange : function(component, event,helper) {
		var state = (component.get("v.app.abd_Premise_County__c")!='--None--')?'IA':'--None--';
		if(state!='IA' && state!='--None--')
			component.set("v.app.abd_Premise_County__c",'--None--');        
	}
})