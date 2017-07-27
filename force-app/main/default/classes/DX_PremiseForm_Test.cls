/**
 * This class contains unit tests for validating the behavior of Apex classes
 * and triggers.
 *
 * Unit tests are class methods that verify whether a particular piece
 * of code is working properly. Unit test methods take no arguments,
 * commit no data to the database, and are flagged with the testMethod
 * keyword in the method definition.
 *
 * All test methods in an organization are executed whenever Apex code is deployed
 * to a production organization to confirm correctness, ensure code
 * coverage, and prevent regressions. All Apex classes are
 * required to have at least 75% code coverage in order to be deployed
 * to a production organization. In addition, all triggers must have some code coverage.
 * 
 * The @isTest class annotation indicates this class only contains test
 * methods. Classes defined with the @isTest annotation do not count against
 * the organization size limit for all Apex scripts.
 *
 * See the Apex Language Reference for more information about Testing and Code Coverage.
 */
@isTest
private class DX_PremiseForm_Test {

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
		System.assertNotEquals(null, DX_PremiseForm.getApplication(app.id));
	        
		System.RunAs(pu) {
        
	        // Get the app we created above
	        app = DX_PremiseForm.getApplication(app.id);
	        System.assertNotEquals(null, app.id);
	        
	        // validate the update for the previous app.
	        System.assertEquals('Update Successful', DX_PremiseForm.upRecordApex(app));
	        
	        // validate that an error message is returned on a null record update.
	        System.assertNotEquals(null, DX_PremiseForm.upRecordApex(new MUSW__Application2__c()));
	        
	        System.assertNotEquals(null,DX_PremiseForm.getLocalAuthority('Test'));
        
        	
        	Account testA = DX_PremiseForm.getAccount(app.id);
        	map<string,string[]> ls = DX_PremiseForm.getPicklistValues();
        }
    }
}