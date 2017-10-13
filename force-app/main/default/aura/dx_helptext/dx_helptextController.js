({
    // Don't preload this - they may never need it.
    init: function(component, event, helper) {
     },

    // We need to build a component that lays on the page to show the help.    
    HelpClick: function(component, event, helper) {
        try {

            if ($A.util.isEmpty(component.get("v.isHelpShowing")))
                component.set("v.isHelpShowing",true);

            var cmpIcon = component.find("HelpIcon");
            var cmpText = component.find("HelpText");
            var isHelpShowing = component.get("v.isHelpShowing");

            if (isHelpShowing) {
                component.set("v.isHelpShowing",false);                 // set not showing help
                
                if (! $A.util.isEmpty(cmpIcon))                         // show the icon
                    $A.util.removeClass(cmpIcon, "slds-hide");

                if (! $A.util.isEmpty(cmpText))                         // hide the text
                    $A.util.addClass(cmpText, "slds-hide");
            }
            else {


                var action = component.get("c.getHelpText"); 
                action.setParams({"context": component.get("v.Context")}); 

                action.setCallback(this, function(response){
                    try {
                        var state = response.getState();
                        if (state === 'SUCCESS') {
                            if (! $A.util.isEmpty(response.getReturnValue())) {
                                component.set("v.isHelpShowing",true);                 // set showing help flag
                                
                                if (! $A.util.isEmpty(cmpIcon))                         // hide the icon
                                    $A.util.addClass(cmpIcon, "slds-hide");

                                if (! $A.util.isEmpty(cmpText))                         // show the text
                                    $A.util.removeClass(cmpText, "slds-hide");

                                component.set("v.HelpText",response.getReturnValue());
                            }
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
                $A.enqueueAction(action);                                           // queue the work.
            }
        }
        // handle browser errors 
        catch(e) {
            alert(e.stack);
        }
    }
})