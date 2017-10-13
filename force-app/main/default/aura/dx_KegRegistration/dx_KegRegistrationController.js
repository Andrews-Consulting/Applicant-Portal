({
	// Save Button code
    save : function(component, event, helper) {
        helper.doUpdate(component, event);
    },
    doInit : function(component, event, helper) {
        helper.getApplication(component);
        
    },
    getFee : function(component, event, helper) {
    	console.log('Get Fee');
        var info = component.get("v.AppInfo");
        info.app = component.get("v.app");
        component.set("v.AppInfo",info);
        console.log(component.get("v.AppInfo"));
    }
})