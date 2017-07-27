({
	doInit: function(component, event, helper) {
		console.log('Init: OwnerList');
		helper.getOwnerList(component, event);
        // If this isn't an application, then let's hide the new button as well.
        if (component.get("v.RecordIdIsApplication") !== true){
            component.set("v.NoAllocationsAllowed",true);
            }

    },

    // Save Button code
    save : function(component, event, helper) {
        helper.doUpdate(component, event);
    },

    addNew : function (component, event, helper) {
        for (i = 0; i < 10; i++) {
            action = component.getEvent("NextOnlyEvent");
            if ($A.util.isEmpty(action)) 
                component = component.getOwner();
            else break;
        }

        var actionString = "Detail";
        action.setParams({"Component" : component , "Action": actionString});
        action.fire();  
	},

    CommitButtonPressed : function(component, event, helper) {
        var action = component.getEvent("CommitChange");
        action.setParams({"Component" : component , "Action": "RefreshView"});          
        action.fire();
    },    
})