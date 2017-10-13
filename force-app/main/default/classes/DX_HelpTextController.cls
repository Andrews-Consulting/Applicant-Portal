public without sharing class DX_HelpTextController {

    
    @AuraEnabled
    public static String getHelpText(String context){
    	list<DX_HelpText__c> htlist = [Select HelpText__c from DX_HelpText__c where Name = :context];
    	if (htlist.size() > 0)
	    	return htlist[0].HelpText__c;
	    return null;
    	}
}