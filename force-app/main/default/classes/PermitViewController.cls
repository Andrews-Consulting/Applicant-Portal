public with sharing class PermitViewController
{
    private Id m_pid;
    
    public PermitViewController(ApexPages.StandardController con)
    {
        m_pid = con.getRecord().Id;
    }
    
    /** Fill in Total Fees on Permit **/
    public void init()
    {
        if(m_pid != null)
        {
            Decimal oldTotalFees = 0;
            Decimal totalFees = 0;
            
            MUSW__Permit2__c per  = [select Id, MUSW__Total_Fees__c from MUSW__Permit2__c where Id=:m_pid];
            
            if(per.MUSW__Total_Fees__c != null)
            {
                oldTotalFees = per.MUSW__Total_Fees__c;
            }
            
            MUSW__Fee__c[] fees = [select Id, MUSW__Amount__c, MUSW__Amount_Waived__c, MUSW__Amended_Amount__c from MUSW__Fee__c where MUSW__Permit2__c =: m_pid];
                        
            for(MUSW__Fee__c fee: fees)
            {                
                if(fee.MUSW__Amount__c != null){
                    Decimal otherAmount = 0;
                    if (fee.MUSW__Amount_Waived__c != null) otherAmount -= fee.MUSW__Amount_Waived__c;
                    if (fee.MUSW__Amended_Amount__c != null) otherAmount -= fee.MUSW__Amended_Amount__c;
                    
                    totalFees += fee.MUSW__Amount__c + otherAmount; 
                }
            }
                        
            if(totalFees != oldTotalFees)
            {
                per.MUSW__Total_Fees__c = totalFees;
                try{
                    update per;
                } catch (DmlException e)
                {
                    if(!e.getMessage().contains('ENTITY_IS_LOCKED')) throw e;
                }
            }
        }
    }
    
    @isTest(seeAllData=true)
    static void testLicenseView()
    {
        MUSW__Parcel__c p = new MUSW__Parcel__c(Name = '123 Ork Street');
        insert p;
        Contact c = new Contact(Firstname = 'User', Lastname='Test', Email='abc@basicgov.com');
        insert c;
                
        BGBK.RulesEngineState.setLock();
        
        MUSW__Permit2__c per = new MUSW__Permit2__c(Name= '0001', MUSW__Applicant__c = c.id, MUSW__Type__c = 'Electrical', MUSW__Parcel__c = p.id, MUSW__Status__c = 'Pending', MUSW__Work_Type__c = 'New Service', MUSW__Valuation__c = 1000);
        insert per;
        
        MUSW__Fee__c fee1 = new MUSW__Fee__c(MUSW__Type__c = 'Electrical - Permit Fee', MUSW__Permit2__c = per.Id, MUSW__Amount__c = 80);
        insert fee1;
        
        MUSW__Fee__c fee2 = new MUSW__Fee__c(MUSW__Type__c = 'Electrical - Permit Fee Assessment', MUSW__Permit2__c = per.Id, MUSW__Amount__c = 1040);
        insert fee2;
        
        BGBK.RulesEngineState.releaseLock();
        
        ApexPages.StandardController sc = new ApexPages.StandardController(per);
        PermitViewController pvc = new PermitViewController(sc);
        pvc.init();
        MUSW__Permit2__c per1 = [select MUSW__Total_Fees__c from MUSW__Permit2__c where id =: per.id];
        system.assert(per1.MUSW__Total_Fees__c == 1120 , per1.MUSW__Total_Fees__c);  
    }
}