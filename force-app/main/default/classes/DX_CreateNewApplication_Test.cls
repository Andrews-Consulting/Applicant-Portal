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
private class DX_CreateNewApplication_Test {

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
        
        DX_CreateNewApplication.createNewL(new MUSW__License2__c(abd_Business_Name__c='Test Business',MUSW__Class__c=DX_CreateNewApplication.getLicenseType()[0].name),'',app);
    		
        System.RunAs(pu) {
        	DX_CreateNewApplication.createNewL(new MUSW__License2__c(abd_Business_Name__c='Test Business',MUSW__Class__c=DX_CreateNewApplication.getLicenseType()[0].name, name='1223'),'',app);
    		DX_CreateNewApplication.createNewL(new MUSW__License2__c(abd_Business_Name__c='Test Business'),'',app);
        }
    }
}