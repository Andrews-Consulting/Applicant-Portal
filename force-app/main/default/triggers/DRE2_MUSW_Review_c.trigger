trigger DRE2_MUSW_Review_c on MUSW__Review__c (after insert, before update, before delete, after undelete) { DRE.DREManager.runTrigger(); }