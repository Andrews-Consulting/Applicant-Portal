({
    Init : function(component, event, helper) {
        console.log('stdPageDefinition');        
    	// To dynamically create our component - 
    	// Build the string for the create component
    	// Create the components
    	// On the call back from the create finalize the component definition.
        //try {
    	if (!component.get("v.ComponentName")) {
    		alert("Component Name was not defined.  This is a required field");
    		return;
    	}
        console.log("navigation name = " + component.get("v.NavigationName"));
        //component.set("v.ActiveCmp", component.get("v.ComponentName")); 

    	var compString = "c:" + component.get("v.ComponentName");
    	var attrList = {
//    		"recordId" : "{!v.recordId}",
    		"SaveCompleted" : "{!c.SaveComplete}",
    		"EmptyComponent" : "{!c.EmptyComponent}",
    		"showError" : "{!v.parent_showError}",                   // This cause an infinite loop in the framework when the 
    		"errorMessage" : "{!v.parent_errorMessage}",             // values have the same name in the child and the parent component.
    		"aura:id" : component.get("v.NavigationName")};


	    $A.createComponent(compString, attrList,
            function(newComp, status, errorMessage){
                //Add the new button to the body array
                if (status === "SUCCESS") {
                    var body = component.get("v.body");
                    body.push(newComp);
                    component.set("v.body", body);
                }
                else if (status === "INCOMPLETE") {
                    console.log("No response from server or client is offline.");
                    // Show offline error
                }
                else if (status === "ERROR") {
                    console.log("Error: " + errorMessage);
                    // Show error message
                }
            }
        );
    //}
    // catch(e) {alert(e.stack);}
	}
})