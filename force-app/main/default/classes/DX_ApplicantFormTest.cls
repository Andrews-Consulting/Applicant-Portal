@isTest
private class DX_ApplicantFormTest {
    static testMethod void testMethod1() {

    	// Set up the environment
    	TestUtils.Create_Citizen_Account();
        TestUtils.SetRoleForCurrentUser();
    	list<Account> al = TestUtils.Create_Account('Customer', 1);
		list<Contact> cl = TestUtils.Create_Contacts(1, al[0]);
		User u = TestUtils.CreatePortalUser(cl[0]);

		System.assertNotEquals(null, u);

		// This piece of code doesn't care about who is executing it
    	DX_ApplicantForm.getCitizenType();	// Don't validate any response from this

		// The getcontact routine assumes the running user is a portal user.
		System.runas(u) {
    		DX_ApplicantForm.getContact();			// Don't validate any response from this
	    	DX_ApplicantForm.upRecordApex(cl[0]);	// Don't validate any response from this
    	}  
    }
}