public with sharing class DX_TransferLicenseApplication {
 
	static String notAnswered = '--None--';

	// Get the list of values for the picklist field and pass them back to the lightning component.
    // Add the -- not answered-- choice as the first value.  If we move to radial buttons, this can all change.
    @AuraEnabled
    public static map<string,string[]> getPicklistValues(){
		map<string,string[]> pickVals = new map<string,string[]>();
        string[] options = new string[]{};
        Schema.DescribeFieldResult fieldResult = MUSW__Application2__c.abd_Premise_State__c.getDescribe();
        List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
            options.add(notAnswered);
        for (Schema.PicklistEntry f: ple) {
            options.add(f.getLabel());
        }
        pickVals.put('state',options);
        return pickVals;
    }


    @AuraEnabled
    public static MUSW__License2__c getLicense(Id licenseId){
    
        return [Select abd_License_Type__c, MUSW__Primary_Licensee__c, MUSW__Applicant__c, abd_Effective_Date__c,abd_Effective_End_Date__c,
                        abd_Local_Authority_Type__c, abd_Premise_City__c, abd_Premise_County__c,  abd_Length__c, 
        		(Select abd_License_Type__c From Licenses__r where abd_Active_Status__c=true) 
        		From MUSW__License2__c 
        		where id = :licenseId];
    }
    
    //Methods for dx_TransferLicense
    @AuraEnabled
    public static string createTransferApp(MUSW__Application2__c application, MUSW__License2__c license){
        Savepoint sp = Database.setSavepoint();
        try{
        	Id devRecordTypeId = Schema.SObjectType.MUSW__Application2__c.getRecordTypeInfosByName().get('Transfer of License/Permit Application').getRecordTypeId();
            User u = [Select ContactId From User Where Id = :UserInfo.getUserId()];
            if(u.ContactId==null){
                throw new AuraHandledException('It looks like you are no longer logged in to the system.  Unable to save the information');
            }
            
            application.abd_Application_Type__c ='Transfer License';
            application.recordTypeId=devRecordTypeId;
            application.MUSW__Account__c=license.MUSW__Primary_Licensee__c;
            application.MUSW__Applicant__c=license.MUSW__Applicant__c;
            application.name='System Number';
            application.MUSW__Status__c='Pending';
            application.abd_Primary_License__c=license.Id;
            application.abd_Portal_Processed__c = true;
//            application.abd_Length__c=license.abd_Length__c;
            System.debug('Transfer Application' + application);
			insert application;
            return String.valueOf(application.Id);
        }catch (Exception ex) {
        	system.debug(ex.getMessage());
            Database.rollback(sp);
        	throw new AuraHandledException (ex.getMessage());
        }
    }
}