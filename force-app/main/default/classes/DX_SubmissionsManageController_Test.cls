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
private class DX_SubmissionsManageController_Test {

    static testMethod void myUnitTest() {
        // TO DO: implement unit test
        BGBK.RulesEngineState.setLock();
        
        BGCM.TestMock tm = new BGCM.TestMock();
        
        MUSW__Parcel__c par = (MUSW__Parcel__c )tm.mk('MUSW__Parcel__c');
        MUSW__Permit2__c perm = (MUSW__Permit2__c )tm.mkc('MUSW__Permit2__c',par.Id);
        MUSW__Submission__c s = (MUSW__Submission__c)tm.mkc('MUSW__Submission__c',perm.Id);
        //this insert will have a CreatedDate date time.  
        FeedItem fi = (FeedItem)tm.mk('FeedItem',new Map<String, Object>{'ParentId' => s.id,'body' => 'abc'});
        FeedItem[] fs = [select CreatedDate from FeedItem where ParentId=:s.id order by CreatedDate DESC limit 1];
        
        BGBK.RulesEngineState.releaseLock();
        
        pageReference p = Page.DX_SubmissionsManage;
        p.getParameters().put('id', perm.Id);
        Test.setCurrentPage(p); 
        
        DX_SubmissionsManageController c= new DX_SubmissionsManageController ();
        c.currentSub  = s.id;
        c.publisher = true;
        c.save();
        
        MUSW__Submission__c s1 = [select id,MUSW__Submission_DateTime__c from MUSW__Submission__c  where id=:s.id limit 1];
        System.assert(s1.MUSW__Submission_DateTime__c != null);
        FeedItem fi2 = [select id,ParentId,CreatedDate from FeedItem where ParentId=:s.id order by CreatedDate DESC limit 1];
        System.assertEquals(true, fi2 != null);
        System.assertEquals(fs[0].CreatedDate , fi2.CreatedDate);
        System.assertEquals(s.id, fi2.ParentId);
    }
}