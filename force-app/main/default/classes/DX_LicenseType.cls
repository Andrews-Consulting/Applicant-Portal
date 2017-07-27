public without sharing class DX_LicenseType {
	
	@AuraEnabled
    public static string getClass(String code) {

    	// Using the code passed in, go read the license type object and return the class (abd_License_Types__c.abd_Class__c)
    	// If there's an error, set the first word as error - so the client controller can tell the difference
    	// between something working and dying

    	//The code passed in here is defined as an attribute on the Community builder for the component.
    	//It *should* be sourced from: 'abd_License_Types__c.abd_License_Type__c'

    	if (code == null || code == '') return 'ERROR 01: Missing required field.';

    	List<abd_License_Types__c> ltList = [SELECT Id, Name, abd_Class__c, abd_License_Type__c FROM abd_License_Types__c WHERE abd_License_Type__c = :code];

    	if (ltList.isEmpty()) return 'ERROR 05: Unable to locate license type.';

    	return ltList[0].abd_Class__c;

    }
}