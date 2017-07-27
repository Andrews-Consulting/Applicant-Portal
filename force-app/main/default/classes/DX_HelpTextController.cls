public without sharing class DX_HelpTextController {

    // Get the values from the metadata based upon the value passed in.
    // We could read all of the text and hold it here, instead of doing round trips.  Need to think about that one.

    @AuraEnabled
    public static String getHelpText(String keyvalue){
    	DX_HelpText__c ht = [Select HelpText__c from DX_HelpText__c where Name = :keyvalue];
    	if (ht == null) return null;
    	return ht.HelpText__c;
    }
}