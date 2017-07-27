@isTest
private class DX_ApplicationForm_Test {
	
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

        // try to get an non existant app - returns an empty app
		System.assertNotEquals(null, DX_ApplicationForm.getApplication(null));
        
        // Get the app we created above and validate that the primary license was set
        app = DX_ApplicationForm.getApplication(app.Id);
        System.assertNotEquals(null, app.abd_Primary_License__c);
        
        // validate the update for the previous app.
        System.assertEquals('Update Successful', DX_ApplicationForm.upRecordApex(app));
        
        // validate that an error message is returned on a null record update.
        System.assertNotEquals(null, DX_ApplicationForm.upRecordApex(new MUSW__Application2__c()));
        
        System.assertNotEquals(null,DX_ApplicationForm.getFieldVisibility());
    }
}