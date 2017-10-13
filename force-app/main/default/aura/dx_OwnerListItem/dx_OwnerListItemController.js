({
	doInit: function(component, event, helper){
		if (!$A.util.isEmpty(component.get("v.owner.abd_LicenseeBusinessType__c"))) {
			var o = component.get("v.owner.abd_LicenseeBusinessType__c");
			if (o == 'Sole Proprietorship' || o == 'Municipality' ) {
				// component.set("v.owner.abd_Primary_Owner__c",true);
	            component.set("v.owner.of_Ownership__c",100);
            }
        }
        console.log('OLI Init');
		// var check = component.find("checkbox");
		// check.set("v.checked",component.get("v.owner.abd_Primary_Owner__c"));
      
	},
	removeOwner: function(component, event, helper){
		component.set("v.delete",true);
		if(component.get("v.row") == component.get("v.editRow"))
			component.set("v.editRow",null);
		helper.CommitCheck(component);		
	},
	handleChange: function(component, event, helper){
		var owner = JSON.parse(JSON.stringify(component.get("v.owner")));
		var name = event.getSource().get("v.name");
		// var value = (name=='abd_Primary_Owner__c')?event.getSource().get("v.checked"):event.getSource().get("v.value");
		var value = event.getSource().get("v.value");
		owner[name] = value;
		component.set("v.owner",owner);
		helper.CommitCheck(component);		
	},
	navigateToOwner: function(component, event, helper){
		var owner = JSON.parse(JSON.stringify(component.get("v.owner")));
		if(!component.get("v.readOnly")){
			for (i = 0; i < 10; i++) {
				action = component.getEvent("NextOnlyEvent");
				if ($A.util.isEmpty(action)) 
					component = component.getOwner();
				else break;
			}
	        var actionString = "Detail \&id=" + owner.Id;
	        action.setParams({"Component" : component , "Action": actionString});
	        action.fire();
        }else{
        	console.log(owner);
        	console.log(component.get("v.row"));
        	component.set("v.editRow",component.get("v.row"));
        } 		
	}
})