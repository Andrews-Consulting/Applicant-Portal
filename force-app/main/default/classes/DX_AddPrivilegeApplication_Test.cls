@isTest(SeeAllData=true)
private class DX_AddPrivilegeApplication_Test {
    // @testSetup 
	// static void setup() {
 //        TestUtils.Create_Citizen_Account();
 //        TestUtils.SetRoleForCurrentUser();
 //        TestUtils.CreateLicenseTypeRecords();
 //    }
    
    static testMethod void myUnitTest() {
        TestUtils.Create_Citizen_Account();
        TestUtils.SetRoleForCurrentUser();
        //TestUtils.CreateLicenseTypeRecords();
        Account a = TestUtils.Create_Account('Customer', 1)[0];
        Contact c = TestUtils.Create_Contacts(1, a)[0];
        User pu = TestUtils.CreatePortalUser(c);

        System.runAs(pu) {
	
	        MUSW__Application2__c app = TestUtils.CreateApplication(pu,c,a,'LE','Class E Liquor License','System Number','System Number');

	        ID licenseId = app.abd_Primary_License__c;
	        System.assertNotEquals(licenseId, Null);

	        DX_AddPrivilegeApplication.ApplicationAddInit appAddPriv = DX_AddPrivilegeApplication.getInfo(licenseId);
	        
	        for (DX_Utils.LicenseType llt:appAddPriv.licTypeList.optionalSLP) {
	        	if (llt.ltype.abd_License_Type__c == 'BC') llt.selected = true;
	        	if (llt.ltype.abd_License_Type__c == 'OS') llt.selected = true;
	        }
		        
	        appAddPriv.app.abd_Temporary_or_Permanent__c = 'Permanent';
	        appAddPriv.app.abd_Effective_Date__c = System.today()+10;
	        appAddPriv.app.abd_Effective_End_Date__c = app.abd_Effective_End_Date_of_Current_Lic__c;
	        appAddPriv.app.MUSW__Description__c = 'Description of recurring event';
	        appAddPriv.app.Square_Footage_Retail_Area__c = 4000;
	        // appAddPriv.app.abd_Outdoor_Service_Area_Boundary_Info__c = 'Fences';

	        String lts = JSON.serialize(appAddPriv.licTypeList);

	        String responsestring = DX_AddPrivilegeApplication.createAddApp(lts, appAddPriv.app ,'Fences');
	        System.assertEquals('SUCCESS: ', responsestring.left(9));
	        ID appId = responsestring.substring(10);
	        MUSW__Application2__c insertedApp = [Select abd_Outdoor_Service_Area_Boundary_Info__c from MUSW__Application2__c where Id = :appId];
	        System.assertEquals('Fences', insertedApp.abd_Outdoor_Service_Area_Boundary_Info__c);
	    }
        
    }
}