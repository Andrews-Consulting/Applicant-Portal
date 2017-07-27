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
private class DX_DynamicChecklistQuestions_Test {

    @testSetup 
	static void setup() {
        TestUtils.Create_Citizen_Account();
        TestUtils.SetRoleForCurrentUser();
    }
    
    static testMethod void myUnitTest() {
        
        //THIS WILL MOVE TO A METHOD IN TESTUTILS THEN BE CALLED IN THE SETUP()
        BGCK__Checklist_Version__c ch = new BGCK__Checklist_Version__c();
        insert ch;
        BGCK__Page__c p = new BGCK__Page__c(name='Test Page',BGCK__Order__c=1,BGCK__Checklist_Version__c=ch.Id );
        insert p;
        BGCK__Question_Type__c qt = new BGCK__Question_Type__c(Name = 'Test Type', BGCK__Type__c='Radio Button', BGCK__Checklist_Version__c = ch.Id);
        insert qt;
        BGCK__Question__c q = new BGCK__Question__c(Name = 'Test Question 1', BGCK__Checklist_Version__c = ch.Id, BGCK__Question_Type__c = qt.Id);
        insert q;
        BGCK__Page_Question__c ppq = new BGCK__Page_Question__c(Name = 'Test PQ 1', License_Type__c = 'CP', BGCK__Question__c = q.Id, BGCK__Page__c = p.Id, BGCK__Order__c = 1, Application_Type__c ='New License');
        insert ppq;
        qt = new BGCK__Question_Type__c(Name = 'Test Type', BGCK__Type__c='Text', BGCK__Checklist_Version__c = ch.Id);
        insert qt;
        q = new BGCK__Question__c(Name = 'Test Question 2', BGCK__Checklist_Version__c = ch.Id, BGCK__Question_Type__c = qt.Id);
        insert q;
        BGCK__Page_Question__c pq = new BGCK__Page_Question__c(Name = 'Test PQ 2', License_Type__c = 'CP', BGCK__Question__c = q.Id, BGCK__Parent_Page_Question__c = ppq.Id, BGCK__Page__c = p.Id, BGCK__Order__c = 2, Application_Type__c ='New License');
        insert pq;
        //END OF METHOD
        Account a = TestUtils.Create_Account('Customer', 1)[0];
        Contact c = TestUtils.Create_Contacts(1, a)[0];
        User pu = new User(Id=userInfo.getUserId());
        MUSW__Application2__c app = TestUtils.CreateApplication(pu,c,a,'LE','Class E Liquor License');
        test.startTest();
        DX_DynamicChecklistQuestions.getChecklist('CP','New License',ch.Id,app.Id);
        test.stopTest();
        
    }
}