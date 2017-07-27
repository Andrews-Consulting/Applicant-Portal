global with sharing class TriggerService
{
    private static Boolean locked = false;
    private static Integer counter = 0;
    
    public static void setLock()
    {
        BGBK.RulesEngineState.setLock();
        counter++;
        locked = true;
    }
    
    public static void releaseLock()
    {
        counter--;
        if (counter == 0)
        {
            BGBK.RulesEngineState.releaseLock();
            locked = false;
        }
    }
    
    public static Boolean isLocked()
    {
        return locked;
    }
    
    public static Boolean isRulesEngineActive()
    {
        Boolean active = false;
        Map<String, BGBK__GlobalSettings__c> gsMap = BGBK__GlobalSettings__c.getAll();
        if (gsMap.containsKey('Default'))
        {
            BGBK__GlobalSettings__c gs = BGBK__GlobalSettings__c.getValues('Default');
            active = Boolean.valueOf(gs.BGBK__rulesEngineActive__c);
        }
        
        return active;
    }
    
    @future
    public static void updateSubmissionTotals(Id[] subIds)
    {
        if (subIds.size() > 0)
        {
            MUSW__Submission__c[] subs = [select Id, MUSW__Total_Approved_Reviews__c, MUSW__Total_Failed_Reviews__c, MUSW__Total_Reviews__c, (select Id, Status2__c from MUSW__Reviews__r) from MUSW__Submission__c where Id in :subIds];
            
            for (MUSW__Submission__c s : subs)
            {
                Integer countTotal = 0, countFailed = 0, countApproved = 0;
                for (MUSW__Review__c r : s.MUSW__Reviews__r)
                {
                    countTotal++;
                    if (r.Status2__c == 'Approved') countApproved++;
                    else if (r.Status2__c == 'Failed') countFailed++;
                }
                
                s.MUSW__Total_Reviews__c = countTotal;
                s.MUSW__Total_Approved_Reviews__c = countApproved;
                s.MUSW__Total_Failed_Reviews__c = countFailed;
            }
            
            //TriggerService.setLock();
            update subs;
            //TriggerService.releaseLock();
        }
    }
    
        
    /*
     *  Groups IV's by whatever criteria if Inspection.Days_to_next is blank
     */
    public static Map<String, MUSW__Inspection_Violation__c[]> groupIVs(MUSW__Inspection_Violation__c[] ivs)
    {
        Map<String, MUSW__Inspection_Violation__c[]> ivGrouped = new Map<String, MUSW__Inspection_Violation__c[]>(); // <days_to_correct, IVs>
        String key;
        for (MUSW__Inspection_Violation__c iv : ivs)
        {
            // true if Inspection already there (for reinspections)
            if (iv.Days_to_correct__c != null) key = iv.Days_to_correct__c.toPlainString();
            else key = iv.MUSW__Violation__r.Days_to_correct__c.toPlainString();
            
            if (ivGrouped.containsKey(key)) ivGrouped.get(key).add(iv);
            else ivGrouped.put(key, new MUSW__Inspection_Violation__c[]{iv});
        }
        
        return ivGrouped;
    }
    
    public static MUSW__Inspection__c createReinspectionFromIV(MUSW__Inspection__c initInsp, MUSW__Violation__c v, MUSW__Inspection_Violation__c iv)
    {
        MUSW__Inspection__c ins = initInsp.clone(false, true);
                    
        ins.Name = null;
        ins.MUSW__Type__c = (v.MUSW__Status__c == 'Contractor Completed') ? 'Re-inspection Contractor Completion' : 'Re-inspection';
        ins.MUSW__Status__c = 'Pending';
        ins.Close_Inspection__c = false;
        ins.MUSW__On_Itinerary__c = false;
        ins.Letter_Generated__c = false;
        ins.MUSW__Scheduled_Start_Date__c = null;
        ins.Requested_DateTime__c = null;
        ins.MUSW__Completed_Date__c = null;

        ins.MUSW__Due_Date__c = 
            (iv.Due_Date__c != null) 
            ? Date.newInstance(iv.Due_Date__c.year(), iv.Due_Date__c.month(), iv.Due_Date__c.day())
            : null;
        ins.MUSW__Previous_Inspection__c = initInsp.Id;
        ins.RecordTypeId = initInsp.RecordTypeId;
        
        if (ins.Group__c == 'Fire') ins.OwnerId = UserInfo.getUserId();
        
        // MOS: this was causing re-inspection to be created with no parent while SOME violations had a parent
        //      therefore those violations wouldn't show up on New/Edit Violations page
        // comment obsolete: prior inspection may be on parent but IV may be unrelated (i.e. no parents)
        ins.MUSW__Permit__c = initInsp.MUSW__Permit__c; //v.Permit2__c;
        ins.MUSW__Complaint2__c = initInsp.MUSW__Complaint2__c; //v.MUSW__Complaint2__c;
        
        return ins;
    }
    
    @isTest(SeeAllData=true)
    private static void testSubTotals()
    {
        MUSW__Parcel__c par = new MUSW__Parcel__c(Name='zsdfsf');
        insert par;
        MUSW__Permit2__c p = new MUSW__Permit2__c(MUSW__Type__c='Building', MUSW__Parcel__c=par.Id);
        insert p;
        MUSW__Submission__c s = new MUSW__Submission__c(MUSW__Permit2__c=p.Id);
        insert s;
        MUSW__Review__c r = new MUSW__Review__c(MUSW__Submission__c=s.Id, MUSW__Due_Date__c=system.today());
        insert r;
    }
    
    @isTest(SeeAllData=true)
    private static void testSubTotals1()
    {
        
        
           MUSW__Parcel__c par = new MUSW__Parcel__c(Name='zsdfsf');
           insert par;
           MUSW__Permit2__c p = new MUSW__Permit2__c(MUSW__Type__c='Building', MUSW__Parcel__c=par.Id);
           insert p;
           MUSW__Submission__c s = new MUSW__Submission__c(MUSW__Permit2__c=p.Id, MUSW__Total_Approved_Reviews__c = 3, MUSW__Total_Failed_Reviews__c = 2);
           insert s;
           MUSW__Review__c r = new MUSW__Review__c(MUSW__Submission__c=s.Id, MUSW__Status__c = ' ',  MUSW__Due_Date__c=system.today());
           insert r;
        
    }
    
    @isTest(SeeAllData=true)  
    private static void testFinalPerm()
    {
        MUSW__Parcel__c par = new MUSW__Parcel__c(Name='zsdfsf');
        insert par;
        MUSW__Permit2__c p = new MUSW__Permit2__c(MUSW__Type__c='Building', MUSW__Parcel__c=par.Id);
        insert p;
        
        MUSW__Permit2__c[] subs = [select id from MUSW__Permit2__c where Permit2__c = :p.Id];
        if (subs.size() > 0)
        {
            for (MUSW__Permit2__c pp : subs)
            {
                pp.MUSW__Status__c = 'Finaled';
            }
            update subs;
        }
        
        p.MUSW__Status__c = 'Finaled';
        update p;
    }
    @isTest(SeeAllData=true)
    private static void testIsRulesEngineActive()
    {
        if (isRulesEngineActive())
            System.assert(isRulesEngineActive()==true);
        else
        {
            BGBK__GlobalSettings__c[] bkglobalsettings = [select BGBK__rulesEngineActive__c from BGBK__GlobalSettings__c where name = 'Default'];
            if (bkglobalsettings.size() != 1)
            {
                BGBK__GlobalSettings__c bkglob = new BGBK__GlobalSettings__c(BGBK__rulesEngineActive__c = true, name = 'Default');
                insert bkglob;
                System.assert(isRulesEngineActive()==true);
            }
            else if (bkglobalsettings.size() == 1)
            {
                System.assert(isRulesEngineActive()==false);
            }
        }
    }
    
    @isTest(SeeAllData = true)
    private static void testUpdateSubmissionTotals(){

        MUSW__Parcel__c par = new MUSW__Parcel__c(Name='81238123');
        insert par;
        MUSW__Permit2__c p = new MUSW__Permit2__c(MUSW__Type__c='Building', MUSW__Parcel__c=par.Id);
        insert p;  
        MUSW__Submission__c s = new MUSW__Submission__c( MUSW__Total_Approved_Reviews__c = 3, MUSW__Total_Failed_Reviews__c = 2, MUSW__Total_Reviews__c = 5, MUSW__Permit2__c =p.id );
        insert s;
        MUSW__Review__c r = new MUSW__Review__c(MUSW__Submission__c=s.Id, MUSW__Due_Date__c=system.today());
        insert r; 
        List<id> subIds = new List<Id>();
        subIds.add(s.id);

        if(!isLocked()){
            setLock();
        } 
        UpdateSubmissionTotals(subIds);       
        releaseLock();
    }    

    @isTest(SeeAllData = true)
    private static void testCreateReinspectionFromIV(){
        
        
        MUSW__Parcel__c par = new MUSW__Parcel__c(Name='zsdfsf');
        insert par;
        TriggerService.setLock();    
        MUSW__Complaint2__c c = new MUSW__Complaint2__c();
        c.MUSW__Type__c = 'Other';
        c.MUSW__Status__c = 'New';
        c.MUSW__Parcel__c = par.id;
        insert c;

        MUSW__Violation__c v = new MUSW__Violation__c();
        v.MUSW__Status__c = 'Open';
        v.MUSW__Complaint2__c = c.id;
        insert v;
        
        MUSW__Inspection__c ins = new MUSW__Inspection__c();
                
        ins.Name = null;
        ins.MUSW__Type__c = 'Mechanical';
        ins.MUSW__Priority__c= '2 Normal';
        ins.MUSW__Status__c = 'Pending';
        ins.Close_Inspection__c = false;
        ins.MUSW__On_Itinerary__c = false;
        ins.Letter_Generated__c = false;
        ins.MUSW__Scheduled_Start_Date__c = null;
        ins.Requested_DateTime__c = null;
        ins.MUSW__Completed_Date__c = null;
        
        insert ins;

        MUSW__Inspection_Violation__c  iv = new MUSW__Inspection_Violation__c();
        iv.MUSW__Inspection__c = ins.id;
        iv.MUSW__Violation__c = v.id;
        
        createReinspectionFromIV(ins,v, iv);
    }     
}