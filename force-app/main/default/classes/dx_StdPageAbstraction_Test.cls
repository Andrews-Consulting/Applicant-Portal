@isTest
private class dx_StdPageAbstraction_Test {
    static testMethod void testMethod1() {
    	// Create an MUSW application and an MUSW license record
		TestUtils.Create_Citizen_Account();
		list<Account> alist = TestUtils.Create_Account('Licensee', 1);
		System.assertNotEquals(0, alist.size());

		list<Contact> clist = TestUtils.Create_Contacts(1, alist[0]);
		System.assertNotEquals(0, clist.size());
		
		User C = TestUtils.CreatePortalUser(clist[0]);
		System.assertNotEquals(null, C);

    	User U = TestUtils.getTestUserWithRole();
		System.assertNotEquals(null, U);    	

    	MUSW__Application2__c app = TestUtils.CreateApplication(U, clist[0],alist[0], 'BC','Class C Beer Permit');
		System.assertNotEquals(null, app);

    	Id applicationId = app.Id;

    	Id licenseId = app.abd_Primary_License__c;
		System.assertNotEquals(null, licenseId);    	


    	MUSW__License2__c addon = TestUtils.CreateAddOnLicense(U, clist[0],alist[0], 'OS','Outdoor Service',licenseId);
    	Id addOnId = addon.Id;
		System.assertNotEquals(null, addon);    	


    	dx_StdPageAbstraction.getNavigationModel(licenseId);
    	dx_StdPageAbstraction.getNavigationModel(applicationId);
    	dx_StdPageAbstraction.getNavigationModel(addOnId);
        
    }
}