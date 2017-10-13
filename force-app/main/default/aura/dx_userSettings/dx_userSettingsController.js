({
	closeModal : function(component, event, helper) {
    	//var url = window.location.href; 
            //var value = url.substr(0,url.lastIndexOf('/') + 1);
            window.history.back();
            //return false; 
    	//$A.get("e.selfService:doLogout").setParams({"url": "/Licensing/secur/logout.jsp?retUrl=https%3A%2F%2Fabdstaging-iowaabd.cs33.force.com%2FApplicant%2FCommunitiesLanding"}).fire();
    }
})