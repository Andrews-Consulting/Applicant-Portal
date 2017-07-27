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
        console.log(recordId);
        component.set("v.recordId", recordId);
        component.set("v.app.Id", recordId);   
        component.set("v.app.abd_Attestation_Date__c",new Date().toJSON().substr(0,10));
    },
    


	save : function(component, event, helper) {
		helper.doAttest(component, event);
	}
})