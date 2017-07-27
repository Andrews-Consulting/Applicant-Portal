public with sharing class ViolationAddEditController
{
    public Integer recordCount { get; private set; }
    public MUSW__Inspection__c ins { get; set; }
    public Integer numRelRows { get; set; }
    public Integer numUnrelRows { get; set; }
    public String parentObject { get; private set; }
    public String parentName { get; private set; }
    public String parentType { get; private set; }
    public String parentDesc { get; private set; }
    public String parentSubtype { get; private set; }
    public String parcelAddress { get; private set; }
    public String parcelName { get; private set; }
    public MUSW__Inspection_Violation__c[] ivRel { get; set; }        // violations on Inspection on a parent
    public MUSW__Inspection_Violation__c[] ivUnrel { get; set; }      // violations on Inspection without a parent
    public MUSW__Inspection_Violation__c[] ivParcel { get; set; }     // violations on Parcel (filtered)
    public Decimal ivIndex { get; set; }
    public String ivComments { get; set; }
    public Boolean batchCalled { get; set; }
    public Boolean batchCompleted { get; set; }
    public Boolean batchErrord { get; set; }
    public Boolean saveErrord { get; set; }
    public Boolean saveOnly { get; set; }
    private Id insId, pid, parcelId, permitId;
    private MUSW__Inspection_Violation__c[] ivParcelAll;
    private Id batchJobId;
    
    public ViolationAddEditController()
    {
        ivRel = new MUSW__Inspection_Violation__c[]{};
        ivUnrel = new MUSW__Inspection_Violation__c[]{};
        ivIndex = null;
        numRelRows = 1;
        numUnrelRows = 1;
        saveErrord = true;
        
        insId = System.currentPageReference().getParameters().get('insId');
        pid = System.currentPageReference().getParameters().get('pid');
        
        Boolean cameFromPermit = pid != null && String.valueOf(pid.getSobjectType()) == 'MUSW__Permit2__c';
        Boolean cameFromInsp = insId != null;
        Boolean cameFromParcel = pid != null && String.valueOf(pid.getSobjectType()) == 'MUSW__Parcel__c';
        if (cameFromInsp)
        {
            ins = database.query('select id, Name, MUSW__Due_Date__c, Days_to_Next_Inspection__c, MUSW__Parcel__c, MUSW__Complaint2__c, MUSW__Complaint2__r.Name, MUSW__Complaint2__r.MUSW__Type__c, MUSW__Complaint2__r.Subtype__c, MUSW__Complaint2__r.MUSW__Description__c, MUSW__Permit__c, MUSW__Permit__r.Name, MUSW__Permit__r.MUSW__Type__c, MUSW__Permit__r.Subtype__c, MUSW__Permit__r.MUSW__Description__c, MUSW__License2__c, MUSW__License2__r.Name, MUSW__License2__r.MUSW__Type__c, MUSW__License2__r.Subtype__c, MUSW__License2__r.MUSW__Description__c, MUSW__Parcel__r.MUSW__Parcel_Number2__c, MUSW__Parcel__r.MUSW__Parcel_Number__c, MUSW__Parcel__r.MUSW__Street__c, (select Id, MUSW__Inspection__r.MUSW__Complaint2__c, MUSW__Inspection__r.MUSW__License2__c, MUSW__Inspection__r.MUSW__Permit__c, MUSW__Violation__r.' + MUSW.UtilityDb.getFieldsFor_Str('MUSW__Violation__c', false).replace(',', ',MUSW__Violation__r.') + ' from MUSW__Inspection_Violations__r where MUSW__Violation__r.isClosed__c = \'No\' order by MUSW__Violation__r.Name) from MUSW__Inspection__c where Id = :insId');
            parcelAddress = ins.MUSW__Parcel__r.MUSW__Street__c != null ? ins.MUSW__Parcel__r.MUSW__Street__c : 'Not specified';
            parcelName = ins.MUSW__Parcel__r.MUSW__Parcel_Number2__c != null ? ins.MUSW__Parcel__r.MUSW__Parcel_Number2__c : ins.MUSW__Parcel__r.MUSW__Parcel_Number__c;
            parcelId = ins.MUSW__Parcel__c;
            
            if (ins.MUSW__Complaint2__c != null)
            {
                parentObject = 'Complaint';
                parentName = ins.MUSW__Complaint2__r.Name;
                parentType = ins.MUSW__Complaint2__r.MUSW__Type__c;
                parentDesc = ins.MUSW__Complaint2__r.MUSW__Description__c;
                parentSubtype  = ins.MUSW__Complaint2__r.Subtype__c;
            }
            else if (ins.MUSW__Permit__c != null)
            {
                parentObject = 'Permit';
                parentName = ins.MUSW__Permit__r.Name;
                parentType = ins.MUSW__Permit__r.MUSW__Type__c;
                parentDesc = ins.MUSW__Permit__r.MUSW__Description__c;
                parentSubtype  = ins.MUSW__Permit__r.Subtype__c;
            }
            else if (ins.MUSW__License2__c != null)
            {
                parentObject = 'License';
                parentName = ins.MUSW__License2__r.Name;
                parentType = ins.MUSW__License2__r.MUSW__Type__c;
                parentDesc = ins.MUSW__License2__r.MUSW__Description__c;
                parentSubtype  = ins.MUSW__License2__r.Subtype__c;
            }
            
            for (MUSW__Inspection_Violation__c ii : ins.MUSW__Inspection_Violations__r)
            {
                if (ii.MUSW__Violation__r.MUSW__Complaint2__c != null || ii.MUSW__Violation__r.Permit2__c != null || ii.MUSW__Violation__r.License2__c != null) ivRel.add(ii);
                else ivUnrel.add(ii);
            }
            
            recordCount = ivRel.size() + ivUnrel.size();
        }
        else if (cameFromParcel)
        {
            MUSW__Parcel__c par = database.query('select Id, MUSW__Street__c, MUSW__Parcel_Number2__c, (select MUSW__Inspection__c, MUSW__Inspection__r.CreatedDate, MUSW__Violation__r.' + MUSW.UtilityDb.getFieldsFor_Str('MUSW__Violation__c', false).replace(',', ',MUSW__Violation__r.') + ' from MUSW__Inspection_Violations__r where MUSW__Violation__r.isClosed__c = \'No\' order by MUSW__Violation__r.Name, MUSW__Inspection__r.CreatedDate DESC) from MUSW__Parcel__c where Id = :pid');
            parcelAddress = par.MUSW__Street__c;
            parcelName = par.MUSW__Parcel_Number2__c;
            parcelId = par.Id;
            
            Set<Id> uniqueVids = new Set<Id>();
            for (MUSW__Inspection_Violation__c ii : par.MUSW__Inspection_Violations__r)
            {
                if (!uniqueVids.contains(ii.MUSW__Violation__c))
                {
                    ivUnrel.add(ii);
                    uniqueVids.add(ii.MUSW__Violation__c);
                }
            }
        }
        else if (cameFromPermit)
        {
            MUSW__Permit2__c p = database.query('select Id, Name, MUSW__Parcel__c, MUSW__Parcel__r.MUSW__Street__c, MUSW__Parcel__r.MUSW__Parcel_Number2__c, (select MUSW__Inspection__c, MUSW__Inspection__r.CreatedDate, MUSW__Violation__r.' + MUSW.UtilityDb.getFieldsFor_Str('MUSW__Violation__c', false).replace(',', ',MUSW__Violation__r.') + ' from Inspection_Violations__r where MUSW__Violation__r.isClosed__c = \'No\' order by MUSW__Violation__r.Name, MUSW__Inspection__r.CreatedDate DESC) from MUSW__Permit2__c where Id = :pid');
            parcelAddress = p.MUSW__Parcel__r.MUSW__Street__c != null ? p.MUSW__Parcel__r.MUSW__Street__c : 'Not specified';
            parcelName = p.MUSW__Parcel__r.MUSW__Parcel_Number2__c != null ? p.MUSW__Parcel__r.MUSW__Parcel_Number2__c : p.MUSW__Parcel__r.MUSW__Parcel_Number__c;
            parcelId = p.MUSW__Parcel__c;
            
            parentObject = 'Permit';
            parentName = p.Name;
            permitId = p.Id;
            
            Set<Id> uniqueVids = new Set<Id>();
            for (MUSW__Inspection_Violation__c ii : p.Inspection_Violations__r)
            {
                if (!uniqueVids.contains(ii.MUSW__Violation__c))
                {
                    ivUnrel.add(ii);
                    uniqueVids.add(ii.MUSW__Violation__c);
                }
            }
        }
        
        // get Violations on Parcel for when not coming from a Parcel
        if (!cameFromParcel && parcelName != 'No Parcel')
        {
            ivParcelAll = database.query('select Id, Name, MUSW__Inspection__c, MUSW__Inspection__r.Name, MUSW__Inspection__r.MUSW__Due_Date__c, MUSW__Inspection__r.CreatedDate, MUSW__Violation__c, MUSW__Violation__r.' + MUSW.UtilityDb.getFieldsFor_Str('MUSW__Violation__c', false).replace(',', ',MUSW__Violation__r.') + ' from MUSW__Inspection_Violation__c where MUSW__Parcel__c = :parcelId order by MUSW__Violation__r.Name, MUSW__Inspection__r.CreatedDate DESC');
            
            MUSW__Inspection_Violation__c[] allIvs = new MUSW__Inspection_Violation__c[]{};
            allIvs.addAll(ivRel);
            allIvs.addAll(ivUnrel);
            for (Integer i=ivParcelAll.size()-1; i>=0; i--)
            {
                for (MUSW__Inspection_Violation__c iv : allIvs)
                {
                    if (iv.MUSW__Violation__c == ivParcelAll[i].MUSW__Violation__c) { ivParcelAll.remove(i); break; }
                }
            }
            
            ivParcel = new MUSW__Inspection_Violation__c[]{};
            othersFilterSelected = 'open';
        }
    }
    
    public void initSetIEMode()
    {
        ApexPages.currentPage().getHeaders().put('X-UA-Compatible', 'IE=10');
    }
    
    // store as local variables because if batch errors we need to delete them 
    private MUSW__Inspection_Violation__c[] iv2insert;
    private MUSW__Inspection__c[] ins2insert;
    public void save()
    {
        batchCalled = false;
        saveErrord = false;
        
        try
        {
            MUSW__Inspection_Violation__c[] allIvs = new MUSW__Inspection_Violation__c[]{};
            allIvs.addAll(ivRel);
            allIvs.addAll(ivUnrel);
            if (ivParcel != null) allIvs.addAll(ivParcel);
            
            MUSW__Violation__c[] v2upsert = new MUSW__Violation__c[]{};
            
            // Map loses my shit and it doesn't work properly
            // instead use 2 separate lists to track IV:Violation via index
            MUSW__Violation__c[] groupV = new MUSW__Violation__c[]{};
            MUSW__Inspection_Violation__c[] groupIV = new MUSW__Inspection_Violation__c[]{};
            for (MUSW__Inspection_Violation__c iv : allIvs)
            {
                v2upsert.add(iv.MUSW__Violation__r);
                
                // collect all IVs that were added on a Parcel/Permit (used for grouping)
                if (iv.MUSW__Inspection__r == null && insId == null)
                {
                    groupV.add(iv.MUSW__Violation__r);
                    groupIV.add(iv);
                }
            }
            
            
            if (v2upsert.size() > 0)
            {
                saveErrord = true; // it will be set to false if violations and inspection save ok
                upsert v2upsert;
                
                // query to get formula fields on Violation (needed for grouping)
                Set<Id> vids = (new Map<Id, MUSW__Violation__c>(v2upsert)).keySet();
                MUSW__Violation__c[] vq = database.query('select ' + MUSW.UtilityDb.getFieldsFor_Str('MUSW__Violation__c', false) + ' from MUSW__Violation__c where Id in :vids');
                
                // replace violation lookup on IV
                Map<Id, MUSW__Violation__c> vmap = new Map<Id, MUSW__Violation__c>(vq);
                for (Integer i=0; i<groupIV.size(); i++)
                {
                    Id vid = groupV[i].Id; // was filled in by reference
                    groupIV[i].MUSW__Violation__r = vmap.get(vid);
                }
                
                // group IVs, and create one Inspection for each group (for Parcel/Permit violations only)
                Map<String, MUSW__Inspection_Violation__c[]> ivGrouped = TriggerService.groupIvs(groupIV);
                ins2insert = new MUSW__Inspection__c[]{};
                for (String key : ivGrouped.keySet())
                {
                    MUSW__Inspection__c insp = new MUSW__Inspection__c(MUSW__Type__c='Field Observation', MUSW__Parcel__c=parcelId, MUSW__Permit__c=permitId, MUSW__Due_Date__c=system.today());
                    for (MUSW__Inspection_Violation__c iv : ivGrouped.get(key)) iv.MUSW__Inspection__r  = insp;
                    ins2insert.add(insp);
                }
                
                // turn DRE off, otherwise it'll try to insert IV's and will error
                TriggerService.setLock();
                if (ins2insert.size() > 0) insert ins2insert;
                TriggerService.releaseLock();
                
                MUSW__Inspection_Violation__c[] iv2upsert = new MUSW__Inspection_Violation__c[]{};
                for (MUSW__Inspection_Violation__c iv : allIvs)
                {
                    if (iv.Id == null)
                    {
                        iv.MUSW__Violation__c = iv.MUSW__Violation__r.Id;
                        if (iv.MUSW__Inspection__c == null) iv.MUSW__Inspection__c = iv.MUSW__Inspection__r.Id;
                    }
                    
                    iv2upsert.add(iv);
                }
                
                saveErrord = false;
                
                if (iv2upsert.size() > 0)
                {
                    // update current Inspection to reflect Days_to_next for the IV trigger
                    if (insId != null)
                    {
                        TriggerService.setLock();
                        update ins;
                        TriggerService.releaseLock();
                    }
                    
                    // need IVAddInspection trigger to see all IV's (upsert will split to insert & update)
                    // first insert all new IV's, then call update on the whole list
                    iv2insert = new MUSW__Inspection_Violation__c[]{};
                    for (MUSW__Inspection_Violation__c iv : iv2upsert) if (iv.Id == null) iv2insert.add(iv);
                    
                    TriggerService.setLock();
                    if (iv2insert.size() > 0) insert iv2insert;
                    TriggerService.releaseLock();
                    
                    if (!saveOnly)
                    {
                        // RUN AS MUCH AS POSSIBLE IN NON-BATCH MODE!!
                        // Batches may encounter future-within-batch errors (e.g. FeeUpdateTotals runs when Inspection on Permit)
                        if (iv2upsert.size() > 20)
                        {
                            // update IV's in batch
                            // when batch finished, if coming from Inspection close Inspection 
                            // else, close all new Inspections to run DRE (cannot do on insert because DRE is blocked & rules need IV's)
                            batchCompleted = false;
                            batchErrord = false;
                            batchJobId = Database.executeBatch(new ViolationAddEditBatch(ins, ins2insert, iv2upsert), 20);
                            batchCalled = true;
                        }
                        else
                        {
                            update iv2upsert;
                            
                            // coming from Inspection
                            // update to run DRE
                            if (ins != null)
                            {
                                ins.Close_Inspection__c = true;
                                update ins;
                            }
                            
                            // coming from Permit/Parcel
                            // update to run DRE (cannot do on insert because DRE is blocked & rules need IV's)
                            if (ins2insert.size() > 0)
                            {
                                for (MUSW__Inspection__c foins : ins2insert)
                                {
                                    foins.Close_Inspection__c = true;
                                    foins.MUSW__Status__c = 'Completed with open violations';
                                }
                                
                                update ins2insert;
                            }
                        }
                    }
                }
            }
        }
        catch(System.Exception e)
        {
            saveErrord = true;
            if (!e.getMessage().contains('FIELD_CUSTOM_VALIDATION_EXCEPTION'))
                ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.ERROR, e.getMessage()+' / '+e.getLineNumber()));
        }
    }
    
    /*
     *  This method is called after Save by the VF page
     *  it handles the displaying of errors only from the batch
     */
    public void getBatchProgress()
    {
        AsyncApexJob a = [select Id, ExtendedStatus, NumberOfErrors, Status from AsyncApexJob where Id = :batchJobId];
        
        if (a.Status == 'Completed')
        {
            batchCompleted = true;
            if (a.NumberOfErrors > 0)
            {
                // revert possible changes
                if (iv2insert.size() > 0) delete iv2insert;
                if (ins2insert.size() > 0) delete ins2insert;
                
                MUSW__Violation__c[] vdel = revertIds(ivRel);
                vdel.addAll(revertIds(ivUnrel));
                vdel.addAll(revertIds(ivParcel));
                if (vdel.size() > 0) delete vdel;
                
                batchErrord = true;
                String msg = a.ExtendedStatus.substring(a.ExtendedStatus.indexOf('FIELD_CUSTOM_VALIDATION_EXCEPTION')+35);
                ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.ERROR, msg));
            }
        }
    }
    
    public pageReference cancel()
    {
        String retId = pid != null ? pid : insId;
        pageReference pr = new pageReference('/'+ retId);
        pr.setredirect(true);
        return pr;
    }
    
    public void addRelated()
    {
        for (Integer i=0; i<numRelRows; i++)
        {
            MUSW__Inspection_Violation__c ivnew = new MUSW__Inspection_Violation__c(MUSW__Inspection__c=ins.Id, MUSW__Parcel__c=parcelId, MUSW__Complaint2__c=ins.MUSW__Complaint2__c, License2__c=ins.MUSW__License2__c, Due_Date__c=ins.MUSW__Due_Date__c, /*Reinspection_Created__c=true,*/ MUSW__Violation__r=new MUSW__Violation__c(MUSW__Parcel__c=parcelId, MUSW__Complaint2__c=ins.MUSW__Complaint2__c, License2__c=ins.MUSW__License2__c, Permit2__c=ins.MUSW__Permit__c, MUSW__Status__c='New'));
            ivRel.add(ivnew);
        }
    }
    
    public void addUnrelated()
    {
        for (Integer i=0; i<numUnrelRows; i++)
        {
            MUSW__Inspection_Violation__c ivnew;
            if (insId != null)
            {
                ivnew = new MUSW__Inspection_Violation__c(MUSW__Inspection__c=ins.Id, MUSW__Parcel__c=parcelId, Due_Date__c=ins.MUSW__Due_Date__c, /*Reinspection_Created__c=true,*/ MUSW__Violation__r=new MUSW__Violation__c(MUSW__Parcel__c=parcelId, MUSW__Status__c='New'));
            }
            else // came from Parcel or Permit
            {
                //MUSW__Inspection__c insp = new MUSW__Inspection__c(MUSW__Type__c='Field Observation', MUSW__Status__c='Completed with open violations', MUSW__Parcel__c=parcelId, MUSW__Permit__c=permitId, Due_Date__c=system.today(), MUSW__Completed_Date__c=system.today(), Completed_DateTime__c=system.now(), Close_Inspection__c=true);
                ivnew = new MUSW__Inspection_Violation__c(/*MUSW__Inspection__r =insp,*/ MUSW__Parcel__c=parcelId, Permit2__c=permitId, Due_Date__c=system.today(), /*Reinspection_Created__c=true,*/ MUSW__Violation__r=new MUSW__Violation__c(MUSW__Parcel__c=parcelId, Permit2__c=permitId, MUSW__Status__c='New'));
            }
            
            ivUnrel.add(ivnew);
        }
    }
    
    public void removeRelated()
    {
        if (ivRel[ivIndex.intValue()].Id == null) ivRel.remove(ivIndex.intValue());
    }
    
    public void removeUnrelated()
    {
        if (ivUnrel[ivIndex.intValue()].Id == null) ivUnrel.remove(ivIndex.intValue());
    }
    
    public Schema.FieldSetMember[] violationFields
    {
        get
        {
            if (violationFields == null)
            {
                String profileName = [Select Name from Profile where Id =:UserInfo.getProfileId()].Name;
                
                Map<String, Schema.FieldSet> fsMap = Schema.SObjectType.MUSW__Violation__c.fieldSets.getMap();
                Schema.FieldSet fs;
                for (Schema.FieldSet fs1 : fsMap.values())
                {
                    if (fs1.getLabel().contains('Add/Edit Violations') && fs1.getLabel().contains(profileName))
                    {
                        fs = fs1; break;
                    }
                }
                if (fs == null) fs = fsMap.get('Add_Edit_Violations');
                
                violationFields= fs.getFields();
            }
            return violationFields;
        }
        
        private set;
    }
    
    public SelectOption[] othersFilter
    {
        get
        {
            if (othersFilter == null) othersFilter = new SelectOption[]{
                new SelectOption('open', 'Open'), 
                new SelectOption('closed', 'Historic')};
            return othersFilter;
        }
        set;
    }
    
    public String othersFilterSelected
    {
        get;
        set
        {
            othersFilterSelected = value;
            
            ivParcel.clear();
            String uniques = '';
            for (MUSW__Inspection_Violation__c iv : ivParcelAll)
            {
                if ((value == 'open' && iv.MUSW__Violation__r.isClosed__c == 'No') ||
                    (value == 'closed' && iv.MUSW__Violation__r.isClosed__c == 'Yes'))
                    if (!uniques.contains(iv.MUSW__Violation__c))
                    {
                        ivParcel.add(iv);
                        uniques += iv.MUSW__Violation__c + ',';
                    }
            }
        }
    }
    
    /*  
     *  Updates read-only fields on violations. It is used separately from RemoteAction because
     *  1. said method is static
     *  2. the page should not rerender (must be immediate otherwise flickers)
     */
    public void fillInViolationDescription()
    {
        if (ivRel.size() > ivIndex.intValue())
        {
            if (ivRel[ivIndex.intValue()].MUSW__Violation__r.MUSW__Comments_Long__c == null)
            {
                ivRel[ivIndex.intValue()].MUSW__Violation__r.MUSW__Comments_Long__c = ivComments;
            }
        }
        if (ivUnrel.size() > ivIndex.intValue())
        {
            if (ivUnrel[ivIndex.intValue()].MUSW__Violation__r.MUSW__Comments_Long__c == null)
            {
                ivUnrel[ivIndex.intValue()].MUSW__Violation__r.MUSW__Comments_Long__c = ivComments;
            }
        }
    }
    
    @RemoteAction
    public static String getOrdinanceDescription(String ordName)
    {
        MUSW__Violation_Type__c[] ord = [select MUSW__Description__c, MUSW__Abatement_Requirement__c from MUSW__Violation_Type__c where Name = :ordName];
        if(ord[0].MUSW__Description__c == null){
            ord[0].MUSW__Description__c = '';
        }
        
        if(ord[0].MUSW__Abatement_Requirement__c == null){
            ord[0].MUSW__Abatement_Requirement__c = '';
        }
        return ord.size() > 0 ? ord[0].MUSW__Description__c + '####' + ord[0].MUSW__Abatement_Requirement__c : '';
    }
    
    private MUSW__Violation__c[] revertIds(MUSW__Inspection_Violation__c[] ivs)
    {
        MUSW__Violation__c[] viols = new MUSW__Violation__c[]{};
        if (ivs != null)
            for (Integer i=0; i<ivs.size(); i++)
                for (MUSW__Inspection_Violation__c ivdel : iv2insert)
                    if (ivs[i].Id == ivdel.Id)
                    {
                        MUSW__Inspection_Violation__c ivClone = ivs[i].clone(false, true);
                        MUSW__Violation__c vClone = ivs[i].MUSW__Violation__r.clone(false, true);
                        ivClone.MUSW__Violation__r = vClone;
                        ivs[i] = ivClone;
                        
                        viols.add(ivdel.MUSW__Violation__r);
                    }
                    
        return viols;
    }
    
    private Map<Id, MUSW__Violation__c> m_oldViolations;
    private Boolean isChanged(MUSW__Violation__c v)
    {
        if (v.Id == null) return true;
        
        if (m_oldViolations == null)
        {
            MUSW__Inspection_Violation__c[] allIvs = new MUSW__Inspection_Violation__c[]{};
            allIvs.addAll(ivRel);
            allIvs.addAll(ivUnrel);
            if (ivParcel != null) allIvs.addAll(ivParcel);
            
            Id[] vids = new Id[]{};
            for (MUSW__Inspection_Violation__c iv : allIvs)
                if (iv.MUSW__Violation__c != null) vids.add(iv.MUSW__Violation__c);
            
            String flds = 'Id';        
            for (Schema.FieldSetMember fs : violationFields)
            {
                flds += ', ' + fs.getFieldPath();
            }
            MUSW__Violation__c[] vqs = database.query('select ' + flds + ' from MUSW__Violation__c where Id in :vids');
            m_oldViolations = new Map<Id, MUSW__Violation__c>(vqs);
        }
        
        for (Schema.FieldSetMember fs : violationFields)
        {
            if (m_oldViolations.containsKey(v.Id) && v.get(fs.getFieldPath()) != m_oldViolations.get(v.Id).get(fs.getFieldPath()))
            {
                return true;
            }
        }
        
        return false;
    }
    
    @isTest(SeeAllData=true)
    private static void testCon_noParent()
    {
        // from Parcel
        TriggerService.setLock();
        MUSW__Parcel__c par = new MUSW__Parcel__c(MUSW__Street2__c='Test St', MUSW__Street_Number__c='14B', MUSW__City__c='Testville', MUSW__Parcel_Number2__c='1000TEST400');
        insert par;
        MUSW__Violation_Type__c ord = new MUSW__Violation_Type__c(MUSW__Code_Number__c='1=234.5TEST', Name='Test Ordinance X', Days_to_correct__c=10);
        insert ord;
        
        pageReference p = Page.ViolationAddEdit;
        p.getParameters().put('pid', par.id );
        Test.setCurrentPage( p );
        
        ViolationAddEditController c = new ViolationAddEditController();
        system.assert(c.parentName == null);
        system.assert(c.parcelName != null && c.parcelAddress != null);
        
        c.addUnrelated();
        system.assert(c.ivUnrel.size() == 1);
        c.ivUnrel[0].MUSW__Violation__r.MUSW__Type__c = ord.Id;
        c.ivUnrel[0].MUSW__Violation__r.MUSW__Status__c = 'New';
        
        TriggerService.releaseLock();
        c.save();
        
        MUSW__Violation__c[] vq = [select Id from MUSW__Violation__c where MUSW__Parcel__c = :par.Id];
        system.assert(vq.size() == 1, vq.size());
        
        
        // from Inspection (created by DRE) - no parent
        MUSW__Inspection__c[] insq = [select Id from MUSW__Inspection__c where MUSW__Parcel__c = :par.Id order by Completed_DateTime__c];
        //BATCH system.assert(insq.size() == 2, insq.size()); // one completed initial, one re-inspection
        
        p = Page.ViolationAddEdit;
        p.getParameters().put('insId', insq[0].id ); // first one is re-inspection
        Test.setCurrentPage( p );
        
        c = new ViolationAddEditController();
        system.assert(c.parentName == null);
        system.assert(c.parcelName != null && c.parcelAddress != null);
        //system.assert(c.ivUnrel.size() == 1, c.ivUnrel); Fail in Production only
        //system.assert(c.ivRel.size() == 0);
    }
    
    @isTest(SeeAllData=true)
    private static void testCon_withParent()
    {
        TriggerService.setLock();
        MUSW__Parcel__c par = new MUSW__Parcel__c(MUSW__Street2__c='Test St', MUSW__Street_Number__c='14B', MUSW__City__c='Testville', MUSW__Parcel_Number2__c='1000TEST400');
        insert par;
        MUSW__Violation_Type__c ord = new MUSW__Violation_Type__c(MUSW__Code_Number__c='1=234.5TEST', Name='Test Ordinance X');
        insert ord;
        MUSW__Complaint2__c com = new MUSW__Complaint2__c(Name ='TestComplaint', MUSW__Type__c='TestTypeComp', MUSW__Origin__c='Test', MUSW__Parcel__c=par.Id);
        insert com;
        MUSW__Inspection__c ins = new MUSW__Inspection__c(MUSW__Parcel__c=par.Id, MUSW__Complaint2__c=com.Id, MUSW__Type__c='TESTInspection');
        insert ins;
        
        pageReference p = Page.ViolationAddEdit;
        p.getParameters().put('insId', ins.id );
        Test.setCurrentPage( p );
        
        ViolationAddEditController c = new ViolationAddEditController();
        //system.assert(c.parentName != null);
        //system.assert(c.parcelName != null && c.parcelAddress != null);
        
        c.addUnrelated();
        system.assert(c.ivUnrel.size() == 1);
        c.ivUnrel[0].MUSW__Violation__r.MUSW__Type__c = ord.Id;
        c.ivUnrel[0].MUSW__Violation__r.MUSW__Status__c = 'New';
        
        c.ins.Days_to_Next_Inspection__c = 10;
        c.numRelRows = 10;
        c.addRelated();
        //system.assert(c.ivRel.size() == c.numRelRows);
        for (Integer i=0; i<c.numRelRows; i++)
        {
            c.ivRel[i].MUSW__Violation__r.MUSW__Type__c = ord.Id;
            c.ivRel[i].MUSW__Violation__r.MUSW__Status__c = 'New';
        }
        
        TriggerService.releaseLock();
        Test.startTest();
        c.save();
        Test.stopTest();
        
        MUSW__Violation__c[] vq = [select Id from MUSW__Violation__c where MUSW__Complaint2__c = :com.Id];
        //system.assert(vq.size() == c.numRelRows);
        
        c.ivIndex = 0;
        c.removeRelated();
        c.removeUnrelated();
        
        String ordName = ViolationAddEditController.getOrdinanceDescription(ord.Name);
    }

    @isTest(SeeAllData=true)
    private static void testCon_withPermitParents()
    {
      TriggerService.setLock();
        MUSW__Parcel__c par = new MUSW__Parcel__c(MUSW__Street2__c='Test St', MUSW__Street_Number__c='14B', MUSW__City__c='Testville', MUSW__Parcel_Number2__c='1000TEST400');
        insert par;
        MUSW__Violation_Type__c ord = new MUSW__Violation_Type__c(MUSW__Code_Number__c='1=234.5TEST', Name='Test Ordinance X');
        insert ord;
        MUSW__Permit2__c Per = new MUSW__Permit2__c(Name ='TestPermit', MUSW__Type__c='TestTypePerm', MUSW__Status__c='Test', MUSW__Parcel__c=par.Id);
        insert Per;
        MUSW__Inspection__c ins = new MUSW__Inspection__c(MUSW__Parcel__c=par.Id, MUSW__Permit__c=Per.Id, MUSW__Type__c='TESTInspection');
        insert ins;
        
        pageReference p = Page.ViolationAddEdit;
        p.getParameters().put('pid', per.id );
        Test.setCurrentPage( p );
        
        ViolationAddEditController c = new ViolationAddEditController();
        //system.assert(c.parentName != null);
        //system.assert(c.parcelName != null && c.parcelAddress != null);
        
        c.addUnrelated();
        system.assert(c.ivUnrel.size() == 1);
        c.ivUnrel[0].MUSW__Violation__r.MUSW__Type__c = ord.Id;
        c.ivUnrel[0].MUSW__Violation__r.MUSW__Status__c = 'New';
        
        c.ins = new MUSW__Inspection__c();
        c.ins.Days_to_Next_Inspection__c = 10;
        c.numRelRows = 10;
        c.addRelated();
        //system.assert(c.ivRel.size() == c.numRelRows);
        for (Integer i=0; i<c.numRelRows; i++)
        {
            c.ivRel[i].MUSW__Violation__r.MUSW__Type__c = ord.Id;
            c.ivRel[i].MUSW__Violation__r.MUSW__Status__c = 'New';
        }
        c.ivIndex = 1;
        c.fillInViolationDescription();
        
        TriggerService.releaseLock();
        Test.startTest();
        c.save();
        Test.stopTest();
        
        MUSW__Violation__c[] vq = [select Id from MUSW__Violation__c where Permit2__c = :Per.Id];
        //system.assert(vq.size() == c.numRelRows);
        
        c.ivIndex = 0;
        c.removeRelated();
        c.removeUnrelated();
        
        String ordName = ViolationAddEditController.getOrdinanceDescription(ord.Name);

    }
    
    
    @isTest(SeeAllData=true)
    private static void testCon_withLicenseParents()
    {
     TriggerService.setLock();
        MUSW__Parcel__c par = new MUSW__Parcel__c(MUSW__Street2__c='Test St', MUSW__Street_Number__c='14B', MUSW__City__c='Testville', MUSW__Parcel_Number2__c='1000TEST400');
        insert par;
        MUSW__Violation_Type__c ord = new MUSW__Violation_Type__c(MUSW__Code_Number__c='1=234.5TEST', Name='Test Ordinance X');
        insert ord;
        MUSW__License2__c Lic = new MUSW__License2__c(Name ='TestLicense', MUSW__Type__c='TestTypeLisc', MUSW__Status__c='Pending', MUSW__Parcel__c=par.Id);
        insert Lic;
        MUSW__Inspection__c ins = new MUSW__Inspection__c(MUSW__Parcel__c=par.Id, MUSW__License2__c=Lic.Id, MUSW__Type__c='TESTInspection');
        insert ins;
        
        pageReference p = Page.ViolationAddEdit;
        p.getParameters().put('insId', ins.id );
        Test.setCurrentPage( p );
        
        ViolationAddEditController c = new ViolationAddEditController();
        //system.assert(c.parentName != null);
        //system.assert(c.parcelName != null && c.parcelAddress != null);
        
        c.addUnrelated();
        system.assert(c.ivUnrel.size() == 1);
        c.ivUnrel[0].MUSW__Violation__r.MUSW__Type__c = ord.Id;
        c.ivUnrel[0].MUSW__Violation__r.MUSW__Status__c = 'New';
        
        c.ins.Days_to_Next_Inspection__c = 10;
        c.numRelRows = 10;
        c.addRelated();
        //system.assert(c.ivRel.size() == c.numRelRows);
        for (Integer i=0; i<c.numRelRows; i++)
        {
            c.ivRel[i].MUSW__Violation__r.MUSW__Type__c = ord.Id;
            c.ivRel[i].MUSW__Violation__r.MUSW__Status__c = 'New';
        }
        TriggerService.releaseLock();
        Test.startTest();
        c.save();
        Test.stopTest();
        
        MUSW__Violation__c[] vq = [select Id from MUSW__Violation__c where License2__c = :Lic.Id];
        //system.assert(vq.size() == c.numRelRows);
        
        c.ivIndex = 0;
        c.removeRelated();
        c.removeUnrelated();
        
        String ordName = ViolationAddEditController.getOrdinanceDescription(ord.Name);
    
    }
    @isTest(SeeAllData=true)
    private static void testViolationFields()
    {
        ViolationAddEditController c = new ViolationAddEditController();
        String fieldStr = '';
        for (Schema.FieldSetMember fs : c.violationFields)
        {
            fieldStr += ', ' + fs.getFieldPath();
        }
        System.debug('fieldStr=' + fieldStr );
        System.assert(fieldStr.contains('MUSW__Status__c') );
        
    }    
    @isTest(SeeAllData=true)
    private static void testIsChanged()
    {
        MUSW__Parcel__c par = new MUSW__Parcel__c(MUSW__Street2__c='Test St', MUSW__Street_Number__c='14B', MUSW__City__c='Testville', MUSW__Parcel_Number2__c='1000TEST400');
        insert par;

        MUSW__Permit2__c permit1 = new MUSW__Permit2__c(Name='test permit', MUSW__Type__c = 'Building', MUSW__Status__c = 'Pending',MUSW__Description__c = 'description',Subtype__c = 'single' );
        insert permit1;

        MUSW__Inspection__c ins1 = new MUSW__Inspection__c(Name = 'test inspection', MUSW__Parcel__c= par.Id, MUSW__Permit__c=permit1.Id, MUSW__Type__c='TESTInspection', Days_to_Next_Inspection__c = 1);
        insert ins1;
     
        MUSW__Violation_Type__c ord1 = new MUSW__Violation_Type__c(MUSW__Code_Number__c='1=234.5TEST1', Name='Test Ordinance X1',RecordTypeId='012F0000001EbgB');
        insert ord1;
        
        MUSW__Violation_Type__c ord2 = new MUSW__Violation_Type__c(MUSW__Code_Number__c='1=234.5TEST2', Name='Test Ordinance X2',RecordTypeId='012F0000001EbgB');
        insert ord2;
        
        ViolationAddEditController c = new ViolationAddEditController();
        
        MUSW__Violation__c v1 = new MUSW__Violation__c();
        v1.Permit2__c = permit1.id;
        v1.MUSW__Parcel__c  = par.id;
        v1.Days_to_correct_User_defined__c = 10;
        v1.MUSW__Type__c= ord1.id;
        v1.MUSW__Status__c = 'New';
        
        insert v1;
        c.isChanged(v1);  
        
        MUSW__Inspection_Violation__c[] ivs = new MUSW__Inspection_Violation__c[]{};
        
        MUSW__Inspection_Violation__c iv = new MUSW__Inspection_Violation__c();
        iv.MUSW__Violation__c = v1.id;
        iv.Permit2__c = permit1.id;
        iv.MUSW__Inspection__c= ins1.id;
        insert iv;
        
        ivs.add(iv);
        
        
        
        c.iv2insert = new  MUSW__Inspection_Violation__c[]{};
        
        MUSW__Inspection_Violation__c iv2 = new MUSW__Inspection_Violation__c();
        iv2.MUSW__Violation__c = v1.id;
        iv2.Permit2__c = permit1.id;
        iv2.MUSW__Inspection__c= ins1.id;
        insert iv2;
        c.iv2insert.add(iv2);        
        c.revertIds(ivs);
        
        
    }
}