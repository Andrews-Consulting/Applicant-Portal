trigger DRE2_BGCK_Answer_c on BGCK__Answer__c (after insert, before update, before delete, after undelete) { BGCM.TriggerManager.execute('DRE2_BGCK_Answer_c', new DRETriggerHandler()); }