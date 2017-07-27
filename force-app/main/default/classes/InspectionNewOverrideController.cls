public with sharing class InspectionNewOverrideController {

    public InspectionNewOverrideController(ApexPages.StandardController controller) { }
    
    public void initSetIEMode()
    {
        ApexPages.currentPage().getHeaders().put('X-UA-Compatible', 'IE=10');
    }
    
    private static testmethod void testCon()
    {
        InspectionNewOverrideController c = new InspectionNewOverrideController(null);
        c.initSetIEMode();
    }
}