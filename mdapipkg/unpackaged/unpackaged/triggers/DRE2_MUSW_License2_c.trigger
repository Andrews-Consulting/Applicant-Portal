trigger DRE2_MUSW_License2_c on MUSW__License2__c (after insert, before update, before delete, after undelete) { BGCM.TriggerManager.execute('DRE2_MUSW_License2_c', new DRETriggerHandler()); }