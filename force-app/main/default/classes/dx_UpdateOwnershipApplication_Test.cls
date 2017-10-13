@isTest
private class dx_UpdateOwnershipApplication_Test {
	
    @testSetup 
	static void setup() {
		TestUtils.Create_Citizen_Account();
		TestUtils.SetRoleForCurrentUser();
	}
    
    static testMethod void myUnitTest() {
        TestUtils.Create_Citizen_Account();
        TestUtils.SetRoleForCurrentUser();
        Account a = TestUtils.Create_Account('Customer', 1)[0];
        Contact c = TestUtils.Create_Contacts(1, a)[0];
        User pu = TestUtils.CreatePortalUser(c);

        System.runAs(pu) {
            MUSW__Application2__c app = TestUtils.CreateApplication(pu,c,a,'LE','Class E Liquor License');

            ID licenseId = app.abd_Primary_License__c;
            System.assertNotEquals(licenseId, null);

            MUSW__Application2__c updApp = dx_UpdateOwnershipApplication.createApplicationfromLicense(licenseId);
            updApp.MUSW__Description__c = 'test';
            dx_UpdateOwnershipApplication.UpdateApplication(updApp);
        }        
    }
}