@isTest
public class dx_FinalReviewController_Test {

    	@testSetup 
	static void setup() {
        TestUtils.Create_Citizen_Account();
        TestUtils.SetRoleForCurrentUser();
        Account a = TestUtils.Create_Account('Customer', 1)[0];
        Contact c = TestUtils.Create_Contacts(1, a)[0];
        User pu = TestUtils.CreatePortalUser(c);
        MUSW__Application2__c app = TestUtils.CreateApplication(pu,c,a,'LE','Class E Liquor License');
        
    }

    static testMethod void testFinalReview() {
        User pu = [select id from user where username='tester@doextra.com'];
        MUSW__Application2__c app = [select id from MUSW__Application2__c where ownerId=:pu.Id];
        System.RunAs(pu) {
            dx_FinalReviewController dfrc = new dx_FinalReviewController();
            string sError = dx_finalReviewController.finalReviewProcess(app.Id);
        }
    }    
}