public with sharing class DRETriggerHandler implements BGCM.ITriggerHandler
{
    /*
    public void onBeforeInsert() {}
    public void onBeforeUpdate() { executeDRE(); }
    public void onBeforeDelete() { executeDRE(); }
    public void onBeforeUndelete() {}
    public void onAfterInsert() { executeDRE(); }
    public void onAfterUpdate() {}
    public void onAfterDelete() {}
    public void onAfterUndelete() { executeDRE(); }
     
    private void executeDRE()
    {
        DRE.DREOutput output = DRE.DREManager.runTrigger(false);
        Boolean commitUpserts = false,
            commitDeletes = true,
            commitCustomResults = true,
            sendEmails = true;
         
        DRE.DREManager.commitResults(output, commitUpserts, commitDeletes, commitCustomResults, sendEmails);
         
        BGCM.DMLManager.upsertRecords(output.getSObjectsForUpsert());
    }
	*/
    
    public void onBeforeInsert() {}
    public void onBeforeUpdate() { executeDRE(); }
    public void onBeforeDelete() { executeDRE(); }
    public void onBeforeUndelete() {}
    public void onAfterInsert() { executeDRE(); }
    public void onAfterUpdate() {}
    public void onAfterDelete() {}
    public void onAfterUndelete() { executeDRE(); }
    
    private void executeDRE()
    {
        Boolean commitResults = false;
        DRE.DREOutput output = DRE.DREManager.runTrigger(commitResults);
        
        if (output == null) return;
        
        Boolean commitUpserts = false, 
            commitDeletes = true, 
            commitCustomResults = true, 
            sendEmails = true;
        
        DRE.DREManager.commitResults(output, commitUpserts, commitDeletes, commitCustomResults, sendEmails);
        
        BGCM.DMLManager.upsertRecords(output.getSObjectsForUpsert());
    } 
}