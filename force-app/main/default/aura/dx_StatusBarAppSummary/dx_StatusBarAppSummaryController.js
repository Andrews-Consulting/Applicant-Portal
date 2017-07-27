({
    doInit: function(component, event, helper) {
        console.log(component.get("v.recordId"));
        helper.CheckRecordId(component, event);
        var appId = component.get("v.recordId");
        if (appId !== null && appId != "0"){
            //var action = component.get("c.getApplication");
            //return packet with application and status
            var action = component.get("c.getAppStatus");
            action.setParams({"objectId": component.get("v.recordId")});
            
            action.setCallback(this, function(response) {
                
                try {            
                    var state = response.getState();
                    if (state === 'SUCCESS') {
                        
                        var appstatus = response.getReturnValue();
                        console.log(appstatus);
                        if (appstatus !== null) {
                            component.set("v.statusVisibility", "slds-show"); 
                            component.set("v.AppId", appstatus.Id);
                            component.set("v.AppName", appstatus.name);
                            component.set("v.AppClass", appstatus.licClass);
                            component.set("v.AppStatus", appstatus.status);
                            component.set("v.AppDate", appstatus.created);                            
                            // if (! $A.util.isEmpty(appstatus.progressStatus)) {
                                 // component.set("v.barVisibility", "slds-show");      TURNED OFF WHILE CHANGE CONTROL IS PENDING
                                 // component.set("v.AppSectionStatus",appstatus.progressStatus);
                                 // }
                            if (appstatus.isApplication) 
                                component.set("v.DateLabel","Application"); 
                            else 
                                component.set("v.DateLabel","License"); 

                        }
                        else component.set("v.statusVisibility", "slds-hide");
                        
                    }
                    else {      // error or incomplete comes here
                        var errors = response.getError();
                        if (errors) {
                            for (var erri = 0; erri < errors.length; erri++) {
                                component.set("v.errorMessage", 
                                              component.get("v.errorMessage") + " : " + errors[erri].message );
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
    }
})