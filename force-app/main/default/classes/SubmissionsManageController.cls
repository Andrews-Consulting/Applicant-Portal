public with sharing class SubmissionsManageController
{
    public String parentName { get; set; }
    public String parentLabel { get; set; }
    public MUSW__Submission__c[] subs { get; set; }
    
    public String currentSub { get; set; }    // current selected submission
    public Boolean publisher { get; set; }    // publisher or not
    public Boolean submissionDateFilled { get; set; } // if the submission date filled for the current sub
    public  boolean allowMultipleSubmissions { get; set; } 
    
    private String pid;  // parent id
    private String retURL;   
    
    /*
     * ctor
     */
    public SubmissionsManageController()
    {
        pid = System.currentPageReference().getParameters().get('pid');
        retURL= System.currentPageReference().getParameters().get('retURL');
        
        String pObj = BGCM.UtilitySObject.getObjectNameFromId(pid);
        parentLabel = BGCM.UtilitySObject.getObjectLabelFromId(pid);

        Map<String,Schema.FieldSet> fsMap = Schema.SObjectType.MUSW__Submission__c.fieldSets.getMap();
        Schema.FieldSet fs;
        for (Schema.FieldSet fs1 : fsMap.values())
        {
            if (fs1.getLabel().contains('Manage Submissions') && fs1.getLabel().contains(pObj))
            {
                fs = fs1; break;
            }
        }
        if (fs == null) fs = Schema.SObjectType.MUSW__Submission__c.fieldSets.MUSW__Manage_Submissions_List; // default if nothing found​
        
        List<Schema.FieldSetMember> fsFields = fs.getFields();
        String subFields = 'Id,Name';
        for(Schema.FieldSetMember f : fsFields)
        {
            if (!subFields.toLowerCase().contains(f.getFieldPath().toLowerCase()))
                subFields += ', ' + f.getFieldPath();
        }

        String subsRelName; //'MUSW__Submissions__r'
        Map<String, String> children = BGCM.UtilitySObject.getChildrenMap(pObj);
        for (String cname : children.keySet()) if (cname.contains('Submission__c')) { subsRelName = children.get(cname); break; }
        
        if(subsRelName.contains('Submissions_'))subFields += ' ,Hardcopy__c ';
        Sobject p = database.query('select Name, (select ' + subFields + ' from ' + subsRelName + ' order by MUSW__Submission_DateTime__c) from ' + pObj + ' where Id = :pid ');
        parentName = String.valueOf(p.get('Name'));
        subs = (List<MUSW__Submission__c>)p.getSobjects(subsRelName);
        
        submissionDateFilled = false;
        
        MUSW__GlobalSettings__c gs = MUSW__GlobalSettings__c.getOrgDefaults();
        allowMultipleSubmissions = gs.Allow_Multiple_Submission_Files__c;
    }
    
    /**
     * user clicks 'Done' button ===> update submissions and get user back to parent page
     */
    public PageReference save()
    {
        // need to update one by one for DRE to work
        if(subs.size()>0)
            for (MUSW__Submission__c s : subs) {
                s.MUSW__Submission_DateTime__c = getLastCreatedDate(s);
                update s;
            }
        
        pageReference pr = new pageReference(retURL!=null?retURL:('/' + pid));
        pr.setRedirect(true);
        return pr;
     }
     
    /**
     * is current user the portal user?
     */
     public boolean getPortalUser()
     {
        // return true;
        return BGCM.UtilityUser.isPortalUser();
     }
    
        
     /** 
      * is current sub allowing multiple submission?
      */    
     public boolean getBlockChangeAfterSubmit()
     {
         return allowMultipleSubmissions==false && submissionDateFilled==true;
     }
    
     /*
      * get the latest created date of uploaded file assoicated with submission
      */
     private Datetime getLastCreatedDate(MUSW__Submission__c  s)
     {
         try{
             FeedItem fi = [select id,ParentId,CreatedDate from FeedItem where ParentId=:s.id order by CreatedDate DESC limit 1];
             return fi!=null ? fi.CreatedDate : null;
         }
         catch(Exception e){
              return null;
         }
     }
   
    @isTest
    private static void testController()
    {
        BGBK.RulesEngineState.setLock();
        
        BGCM.TestMock tm = new BGCM.TestMock();
        
        MUSW__Parcel__c par = (MUSW__Parcel__c )tm.mk('MUSW__Parcel__c');
        MUSW__Permit2__c perm = (MUSW__Permit2__c )tm.mkc('MUSW__Permit2__c',par.Id);
        MUSW__Submission__c s = (MUSW__Submission__c)tm.mkc('MUSW__Submission__c',perm.Id);
        //this insert will have a CreatedDate date time.  
        FeedItem fi = (FeedItem)tm.mk('FeedItem',new Map<String, Object>{'ParentId' => s.id,'body' => 'abc'});
        FeedItem[] fs = [select CreatedDate from FeedItem where ParentId=:s.id order by CreatedDate DESC limit 1];
        
        BGBK.RulesEngineState.releaseLock();
        
        pageReference p = Page.SubmissionsManage;
        p.getParameters().put('pid', perm.Id);
        Test.setCurrentPage(p); 
        
        SubmissionsManageController c= new SubmissionsManageController ();
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