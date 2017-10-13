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
private class DX_ApplicationCleanup_BatchTest {

    @testSetup 
	static void setup() {
        TestUtils.Create_Citizen_Account();
        TestUtils.SetRoleForCurrentUser();
    }
    
    static testMethod void myUnitTest() {
		
		Account acc = TestUtils.Create_Account('Customer', 1)[0];
        Contact c = TestUtils.Create_Contacts(1, acc)[0];
        User pu = TestUtils.CreatePortalUser(c);
        MUSW__Application2__c a = TestUtils.CreateApplication(pu,c,acc,'LE','Class E Liquor License');
		MUSW__License2__c l = [Select Id from MUSW__License2__c][0];
		abd_License_Application__c la= new abd_License_Application__c(abd_Application__c = a.Id, abd_License__c = l.Id);
		insert la;
		BGCK__Answer__c ans = new BGCK__Answer__c(Application__c = a.Id);
		insert ans;
		MUSW__Fee__c f= new MUSW__Fee__c(MUSW__Application2__c = a.Id);
		insert f;
		abd_Authorized_Agent__c aa = new abd_Authorized_Agent__c(abd_Application__c = a.Id);
		insert aa;
		MUSW__Submission__c sub = new MUSW__Submission__c(MUSW__Application2__c = a.Id);
		insert sub;
		
		Application_Contact__c ac = TestUtils.Create_ApplicationContact(a,c);
		
		System.AssertEquals(1,database.countquery('SELECT COUNT() FROM MUSW__Application2__c'));
		System.AssertEquals(1,database.countquery('SELECT COUNT() FROM BGCK__Answer__c'));
		System.AssertEquals(1,database.countquery('SELECT COUNT() FROM MUSW__Fee__c'));
		System.AssertEquals(1,database.countquery('SELECT COUNT() FROM abd_Authorized_Agent__c'));
		System.AssertEquals(1,database.countquery('SELECT COUNT() FROM MUSW__Submission__c'));
		System.AssertEquals(1,database.countquery('SELECT COUNT() FROM Application_Contact__c'));
		System.AssertEquals(1,database.countquery('SELECT COUNT() FROM MUSW__License2__c'));
		System.AssertEquals(1,database.countquery('SELECT COUNT() FROM abd_License_Application__c'));
		
		Test.StartTest();
		DX_ApplicationCleanup_Batch cleanup = new DX_ApplicationCleanup_Batch();
		ID batchprocessid = Database.executeBatch(cleanup,200);
		system.debug(batchprocessid);
		Test.StopTest();
	
		System.AssertEquals(0,database.countquery('SELECT COUNT() FROM MUSW__Application2__c'));  
		System.AssertEquals(0,database.countquery('SELECT COUNT() FROM BGCK__Answer__c'));
		System.AssertEquals(0,database.countquery('SELECT COUNT() FROM MUSW__Fee__c'));
		System.AssertEquals(0,database.countquery('SELECT COUNT() FROM abd_Authorized_Agent__c'));
		System.AssertEquals(0,database.countquery('SELECT COUNT() FROM MUSW__Submission__c'));
		System.AssertEquals(0,database.countquery('SELECT COUNT() FROM Application_Contact__c'));
		System.AssertEquals(0,database.countquery('SELECT COUNT() FROM MUSW__License2__c'));
		System.AssertEquals(0,database.countquery('SELECT COUNT() FROM abd_License_Application__c'));
		
	}
}