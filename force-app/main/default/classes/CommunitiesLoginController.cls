/**
 * An apex page controller that exposes the site login functionality
 */
global with sharing class CommunitiesLoginController {

    global CommunitiesLoginController () {}
    
    // Code we will invoke on page load.
    global PageReference forwardToAuthPage() {
    	String startUrl = '/s/'; //URL.getCurrentRequestUrl().toExternalForm()+'/dx-home';//System.currentPageReference().getParameters().get('startURL');
    	String displayType = System.currentPageReference().getParameters().get('display');
    	PageReference p = new PageReference(startUrl);
    	p.setRedirect(true);
        return p;//Network.forwardToAuthPage(startUrl, displayType);
    }
}