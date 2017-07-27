@isTest
private class DX_Application_StaticFields_Test {
    static testMethod void testMethod1() {
        
		DX_Application_StaticFields.getPicklistValues();

		TestUtils.SetRoleForCurrentUser();
		TestUtils.Create_Citizen_Account();
		list<Account> al = TestUtils.Create_Account('Customer', 1);
		list<Contact> cl = TestUtils.Create_Contacts(1, al[0]);
		User u = TestUtils.CreatePortalUser(cl[0]);
		System.assertNotEquals(null, u);
		MUSW__Application2__c app = TestUtils.CreateApplication(u, cl[0], al[0], 'LE','Class E Liquor License');
		MUSW__Application2__c app2 = TestUtils.CreateApplication(u, cl[0], al[0], 'LE','Class E Liquor License');

		DX_Application_StaticFields.getApplication(app.Id);
		System.assertEquals('Update Successful',DX_Application_StaticFields.upRecordApex(app, app2));

    }
}