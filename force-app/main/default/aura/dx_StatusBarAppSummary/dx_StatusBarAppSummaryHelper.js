({
    // lightning has problems getting the recordId  (locker service on or off!)
    CheckRecordId: function(component, event) {    
        //   the function that reads the url parameters
        try {
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

            // If the value isn't set, then go get it from the query string.
            var curRecId = component.get("v.recordId");
            if (!$A.util.isUndefined(curRecId) || curRecId == '0') component.set("v.recordId", getUrlParameter('recordId'));

            //component.set("v.recordId", getUrlParameter('recordId'));
            console.log(component.get("v.recordId"));
        } catch(e) {alert(e.stack);} 
    }
})