({ 
    // Do nothing in here that expects the page to be rendered.  Move that to the rendering classes.
   init : function(component, event, helper) {
        console.log('Init: stdPageAbstraction');
        component.set("v.showError",false);         // should be this way already.
        //
        //  Not sure if this is what we want.  The concrete instance could have an preinit routine that needs to run before the component init routines.
        //  
        //
        if (! $A.util.isUndefined(component.getConcreteComponent))
            if (! $A.util.isUndefined(component.getConcreteComponent().controller))
                if (! $A.util.isUndefined(component.getConcreteComponent().controller.preinit))
                    component.getConcreteComponent().controller.preinit();
        //
        //  queue up the component initialization routines
        //
        helper.init(component, event);
        
        
    }, 

    //  This is the routine that is called when the button routine tells us that a "save" was invokved.
    //  We need to circle through all of the embedded components and force a save on each
    //
    // The component is the abstract class (super) of the stdPageAbstraction.
    saveInvoked: function(component, event, helper) {
        try {
            var concComponent = component.isConcrete() ? component.getConcreteComponent() : component;


            component.set("v.showError",false);                 // reset for the save event
            component.set("v.errorMessage","");
            // save away the next action to perform 
            component.set("v.Action",event.getParam("Action"));
            // var cmp = event.getParam("Component");

            // If the save function is disabled (we're in read only mode)
            var disabled = component.get("v.SaveDisabled");
            // If we're disabled, then just process the next action
            if (disabled === true ) {
                if (!component.get("v.DevMode"))    // and not in dev mode, go next
                    helper.commonNextprocess(component,event, component.get("v.Action"));
                return;
            }


            // If we're proceeding, we can turn on the spinner.
            helper.spinnerOn(component);

            var activecmp;
            if ($A.util.isEmpty(activecmp = helper.getActiveCmp(component))) {
                alert('Internal Error - Unable to find an active component on this page');
                return; 
            }

            // if we end up with multiple components to process, then handle it
            if ($A.util.isArray(activecmp)) {
                component.set("v.ActiveCmpCount",activecmp.length);
                for (var i = 0; i < activecmp.length; i++ ) {
                    activecmp[i].PerformSave(component, event);
                }
            }
            else { 
                component.set("v.ActiveCmpCount",1);
                activecmp.PerformSave(component, event);

            }

        }
        catch (e) {alert(e.stack);}
    },

    //  This is the routine that is called when the button routine tells us that a "next (without a save)" was invokved.
    nextOnlyInvoked: function(component, event, helper) {
        var concComponent = component.isConcrete() ? component.getConcreteComponent() : component;

        helper.spinnerOff(component);
        component.set("v.showError",false);                 // reset for the save event
        component.set("v.errorMessage","");
        if (!component.get("v.DevMode"))        // If we're not in development mode, then we can navigate away....
            helper.commonNextprocess(component, event, event.getParam("Action"));
    },

    
    // This condition is raised when we've tried to display the component and it has nothing to display
    // based upon the last navigation, we need to move to the next page.  TODO: force forward movement for now
    // 
    // Because the inner component can be called before the std page component, we could land on an empty page and need to navigate forward
    EmptyComponent: function(component, event, helper) {
        try {
            var concComponent = component.isConcrete() ? component.getConcreteComponent() : component;
            var compCount = component.get("v.ActiveCmpCount");
            if (compCount) {
                compCount--;
                if (compCount === 0) {
                    helper.spinnerOff(component);
                    if (!component.get("v.DevMode"))        // If we're not in development mode, then we can navigate away....
                        helper.commonNextprocess(component, event, "Next");
                }
            }
        } catch(e) {alert (e.stack);}
    },

 
    // When ever a section completes a save, it calls this routine.
    // We need to determine what the next action to take is
    // The choices should be Exit, Next, Prev, and RefreshView.   
    // before we invoked the save, we stored away the next action from the caller.  Now get it back and use it to navigate.
    //
    // Component here is a concrete component.
    SaveComplete: function(component, event, helper) {
        try {
            var concComponent = component.isConcrete() ? component.getConcreteComponent() : component;

            var appId = event.getParam("AppId");
            if (!$A.util.isEmpty(appId)) component.set("v.recordId", appId);

            // We should check and see if we should change the context.
            // var cmp = event.getParam("Component");

            // If we are told that the routine failed, then we need to preserve the screen.
            var actionParm = event.getParam("Action"); 
            if (actionParm && actionParm === "Fail") component.set("v.Action","Fail");

            var compCount = component.get("v.ActiveCmpCount");
            if (compCount) {
                compCount--;
                component.set("v.ActiveCmpCount",compCount);
                // If we're navigating, we should turn off the spinner first
                if (compCount === 0) {
                    helper.spinnerOff(component);
                    if (!component.get("v.DevMode"))         // If we're not in development mode, then we can navigate away....
                        helper.commonNextprocess(component, event, component.get("v.Action"));
                }
            }
        } catch(e) {alert (e.stack);}
    }, 

    ErrorMsgChanged: function(component, event, helper) {
        try {
            if (!$A.util.isEmpty(component.get("v.errorMessage"))) {
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title": "Error",
                    "message": component.get("v.errorMessage")
                });
                    toastEvent.fire();
                }
        } catch(e) {alert (e.stack);}
    },

    // keep this flag current.
    RecordIdChanged: function(component, event, helper) {
        try {
            var recordId = component.get("v.recordId");
            if (recordId.substr(0,3) == 'a03')
                component.set("v.RecordIdIsApplication",true);
            else 
                component.set("v.RecordIdIsApplication",false);
        } catch(e) {alert (e.stack);}            
    },

    spinnerOn: function(component, event, helper) {
        // if (!$A.util.isEmpty(event) && !$A.util.isEmpty(event.getParam("Component"))) component = event.getParam("Component");
        helper.spinnerOn(component);
    },
    
    spinnerOff: function(component, event, helper) {
        // if (!$A.util.isEmpty(event) && !$A.util.isEmpty(event.getParam("Component"))) component = event.getParam("Component");
        helper.spinnerOff(component);
    }
   
})