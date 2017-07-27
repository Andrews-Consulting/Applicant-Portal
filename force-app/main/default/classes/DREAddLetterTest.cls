@isTest
private class DREAddLetterTest
{
    @isTest
    static void addLetter_noChildIterate()
    {
        BGBK.TestMock tm = new BGBK.TestMock();
        
        // create records
        MUSW__Application2__c p = (MUSW__Application2__c)tm.mk('MUSW__Application2__c', new Map<String, Object>{'Name' => 'Test MUSW__Application2__c'});
        tm.mk('bgbl__batch_letter__c', new Map<String, Object>{'Name' => 'Test Letter', 'BGBL__Output_Type__c' => 'Word 2007 (.docx)'});
        
        // create rule
        DRE__DRE_Rule__c r = new DRE__DRE_Rule__c(DRE__Object_Name__c='MUSW__Application2__c', DRE__Event__c='Edited', Name='MUSW__Application2__c edited - Add letter', DRE__Order__c = 999);
        insert r;
        
        DRE__DRE_Result_Group__c rgroupA = new DRE__DRE_Result_Group__c(DRE__Action_Type__c='AddLetter', DRE__DRE_Rule__c=r.Id);
        insert rgroupA;
        DRE__DRE_Result__c rgroupA_result1 = new DRE__DRE_Result__c(DRE__Attribute__c='letterName', DRE__Value__c='Test Letter', DRE__DRE_Group__c=rgroupA.Id, DRE__DRE_Rule__c=r.Id);
        DRE__DRE_Result__c rgroupA_result2 = new DRE__DRE_Result__c(DRE__Attribute__c='letterParentId', DRE__Value__c='{!MUSW__Application2__c.Id}', DRE__DRE_Group__c=rgroupA.Id, DRE__DRE_Rule__c=r.Id);
        DRE__DRE_Result__c rgroupA_result3 = new DRE__DRE_Result__c(DRE__Attribute__c='letterOutputType', DRE__Value__c='Pdf', DRE__DRE_Group__c=rgroupA.Id, DRE__DRE_Rule__c=r.Id);
        insert new DRE__DRE_Result__c[]{rgroupA_result1, rgroupA_result2, rgroupA_result3};
        
        // create settings
        DRE__DRESettings__c s = new DRE__DRESettings__c();
        insert s;
        DRE__DREObjectSettings__c ts = new DRE__DREObjectSettings__c(Name='MUSW__Application2__c', DRE__Trigger_Enabled__c=true);
        insert ts;
        
        // trigger DRE
        Test.startTest();
        update p;
        Test.stopTest();
        
        SObject[] blr = Database.query('SELECT Id from BGBL__Batch_Letter_Job__c');
        System.assertEquals(1, blr.size(), blr);
    }
}