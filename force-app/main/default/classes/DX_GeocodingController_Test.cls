@isTest
private class DX_GeocodingController_Test {

    @testSetup 
	static void setup() {
        TestUtils.Create_Citizen_Account();
        TestUtils.SetRoleForCurrentUser();
    }
    
    static testMethod void myUnitTest() {
        Account a = TestUtils.Create_Account('Customer', 1)[0];
        Contact c = TestUtils.Create_Contacts(1, a)[0];
        User pu = TestUtils.CreatePortalUser(c);
        MUSW__Application2__c app = TestUtils.CreateApplication(pu,c,a,'LE','Class E Liquor License');
        system.debug(app.id);
        
    	Test.startTest();
    	RestAPIMockImpl mockResponse = new RestAPIMockImpl();
        Test.setMock(HttpCalloutMock.class, mockResponse);
    	
    	PageReference pageRef = Page.DX_Geocoding;
        Test.setCurrentPage(pageRef);
    	
    	ApexPages.StandardController sc = new ApexPages.StandardController(app);
        DX_GeocodingController testGeoCont = new DX_GeocodingController(sc);
        
        testGeoCont.GeocodeAddress();
    	app.abd_Premise_Address__c = 'Test Address';
    	app.abd_Premise_City__c = 'Test City';
    	app.abd_Premise_State__c = 'IA';
    	app.abd_Premise_Zip_Code__c = '12345';
    	update app;
    	sc = new ApexPages.StandardController(app);
        testGeoCont = new DX_GeocodingController(sc);
    	testGeoCont.GeocodeAddress();
    	ArcGIS_RestAPI_Methods rm = new ArcGIS_RestAPI_Methods();
    	rm.GetLocationFromResponse('{"spatialReference": {"wkid": 1234,"latestWkid": 1234},"candidates": [{ "address": "1234 Test St, Mock, State, 12345", "location": {  "x": -75.453453453,  "y": 32.524545345 }, "score": 99, "attributes": {   }, "extent": {  "xmin": -75.453453453,  "ymin": 32.524545345,  "xmax": -75.453453453,  "ymax": 32.524545345 }},{ "address": "1234 Test St, Mock, State, 12345", "location": {  "x": -75.453453453,  "y": 32.524545345 }, "score": 100, "attributes": {   }, "extent": {  "xmin": -75.453453453,  "ymin": 32.524545345,  "xmax": -75.453453453,  "ymax": 32.524545345 }}]}');
    	Test.stopTest();
    }
}