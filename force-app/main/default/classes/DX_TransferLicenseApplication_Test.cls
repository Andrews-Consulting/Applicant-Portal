@isTest
private class DX_TransferLicenseApplication_Test {

    @testSetup 
	static void setup() {
        TestUtils.Create_Citizen_Account();
        TestUtils.SetRoleForCurrentUser();
    }

    static testMethod void myUnitTest() {
        
        Account a = TestUtils.Create_Account('Customer', 1)[0];
        Contact c = TestUtils.Create_Contacts(1, a)[0];
        User pu = TestUtils.CreatePortalUser(c);
        // MUSW__Application2__c app = TestUtils.CreateApplication(pu,c,a,'LE','Class E Liquor License');
		
		// try to get an non existant app - returns an empty app
		// System.assertNotEquals(null, DX_TransferLicenseApplication.getLicense(app.id));
	        
		System.RunAs(pu) {
        
	        // Get the app we created above
        	map<string,string[]> ls = DX_TransferLicenseApplication.getPicklistValues();
        }

    }
}