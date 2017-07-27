({
	doInit : function(component, event, helper) {
		var pdfData = component.get("v.pdfData");
		var base = component.get("v.base");
		
		$A.createComponent(
            "c:pdfViewer",
            	{
                	"pdfData": pdfData,
                	"baseUrl": base
            	},
            	function(pdfViewer, status, errorMessage){
                	if (status === "SUCCESS") {
                  		var pdfContainer = component.get("v.pdfContainer");
                   		pdfContainer.push(pdfViewer);
                   		component.set("v.pdfContainer", pdfContainer);
                	}
                	else if (status === "INCOMPLETE") {
                    	console.log("No response from server or client is offline.")
                	}
                	else if (status === "ERROR") {
                    	console.log("Error: " + errorMessage);
	                }
       			}
    	);
	}
})