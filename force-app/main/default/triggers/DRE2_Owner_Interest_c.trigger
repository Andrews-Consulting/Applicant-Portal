trigger DRE2_Owner_Interest_c on Owner_Interest__c (after insert, before update, before delete, after undelete) { DRE.DREManager.runTrigger(); }