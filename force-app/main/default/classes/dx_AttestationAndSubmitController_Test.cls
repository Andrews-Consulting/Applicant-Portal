@isTest
public class dx_AttestationAndSubmitController_Test {

    	@testSetup 
	static void setup() {
        TestUtils.Create_Citizen_Account();
        TestUtils.SetRoleForCurrentUser();
        Account a = TestUtils.Create_Account('Customer', 1)[0];
        Contact c = TestUtils.Create_Contacts(1, a)[0];
        User pu = TestUtils.CreatePortalUser(c);
        MUSW__Application2__c app = TestUtils.CreateApplication(pu,c,a,'LE','Class E Liquor License');
        
    }

    static testMethod void testAttestationAndSubmit() {
        User pu = [select id from user where username='tester@doextra.com'];
        MUSW__Application2__c app = [select id from MUSW__Application2__c where ownerId=:pu.Id];
        System.RunAs(pu) {
            dx_AttestationAndSubmitController dasc = new dx_AttestationAndSubmitController();
            dx_AttestationAndSubmitController.setAcknowledgmentFlag(app.Id);
            MUSW__Application2__c app2 = [select id, abd_Acknowledgement__c from MUSW__Application2__c where ownerId=:pu.Id];
            system.debug(app2);
        	dx_AttestationAndSubmitController.setAcknowledgmentFlag(pu.id);
            
        }
    }    
}