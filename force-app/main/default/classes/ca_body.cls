public with sharing class ca_body {
    
@AuraEnabled
    public static list<dx_cmpNavigation__mdt> getNavigationModel() {
    	system.debug('getNavigtionModel invoked');
    	list<dx_cmpNavigation__mdt> navRecs = [Select DeveloperName, MasterLabel, NextCmp__c, PrevCmp__c, ShowNextButton__c, ShowSaveExitButton__c, 
    										    ShowExitNoSaveButton__c, ShowSkipButton__c, SkipLabel__c, ShowSaveAddButton__c, SaveAddLabel__c, 
    										    CmpHome__c from dx_cmpNavigation__mdt];

    	return navRecs;
    }
}