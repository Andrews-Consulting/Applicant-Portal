({
    doInit: function(component, event, helper) {
        // the function that reads the url parameters
        
        var getUrlParameter = function getUrlParameter(sParam) {
            var sPageURL = decodeURIComponent(window.location.search.substring(1)),
                sURLVariables = sPageURL.split('&'),
                sParameterName,
                i;
            
            for (i = 0; i < sURLVariables.length; i++) {
                sParameterName = sURLVariables[i].split('=');
                
                if (sParameterName[0] === sParam) {
                    return sParameterName[1] === undefined ? true : sParameterName[1];
                }
            }
        };
        
        // lightning can't seem to get this value set on a consistent basis
        var recordId = getUrlParameter('recordId');
        //console.log(recordId);
        component.set("v.recordId", recordId);   
        //  FOR RENEE's TEST component.set("v.ShowNext", false);      
    },
    
     save : function(component, event, helper) {
        var action = component.getEvent("SaveCompleted");
        action.setParams({"Component" : component, "Action": "Saved" });
        action.fire();
    }, 
    handleInitiateFinalReview : function(component, event, helper) {
        var action = component.getEvent("spinnerOn");
        action.setParams({"Component" : component});
        action.fire();
        helper.initiateFinalReview(component, event, helper);
    }
})