public with sharing class DX_AdditionalLocation {
    // This routine is used by the premise form and the update premise form	


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



        options = new List<String>();
        fieldResult = MUSW__Application2__c.abd_Premise_County__c.getDescribe();
        ple = fieldResult.getPicklistValues();
            options.add(notAnswered);
        for (Schema.PicklistEntry f: ple) {
            options.add(f.getLabel());
        }
        pickVals.put('county',options);
        options = new List<String>();
        fieldResult = MUSW__Application2__c.abd_Start_Time__c.getDescribe();
        ple = fieldResult.getPicklistValues();
            options.add(notAnswered);
        for (Schema.PicklistEntry f: ple) {
            options.add(f.getLabel());
        }
        pickVals.put('time',options);
        return pickVals;
    }
	//Methods for dx_AdditionalLocation
    @AuraEnabled
    public static MUSW__License2__c getLicense(Id licenseId){
        
        return [Select abd_License_Type__c, MUSW__Primary_Licensee__c, MUSW__Applicant__c, abd_Effective_Date__c,abd_Effective_End_Date__c,
                        abd_Local_Authority_Type__c, abd_Premise_City__c, abd_Premise_County__c,  abd_Length__c, 
        		(Select abd_License_Type__c From Licenses__r where abd_Active_Status__c=true) 
        		From MUSW__License2__c 
        		where id = :licenseId];
    }
	@AuraEnabled
    public static list<abd_Census__c> getPremiseCity(string county){
    	list<abd_Census__c> temp = new list<abd_Census__c>();
    	temp.add(new abd_Census__c(name='--None--'));
       	for(abd_Census__c a:[Select Name,abd_Population__c from abd_Census__c where abd_County__c!=null and abd_County__c includes(:county) and abd_Type__c='City' order by Name]){
       		temp.add(a);	
       	} 
       	return temp;
    }
	@AuraEnabled
    public static string createAddApp(MUSW__Application2__c application, MUSW__License2__c license){
        Savepoint sp = Database.setSavepoint();
        try{
        	Id devRecordTypeId = Schema.SObjectType.MUSW__Application2__c.getRecordTypeInfosByName().get('Additional Locations Application').getRecordTypeId();
            User u = [Select ContactId From User Where Id = :UserInfo.getUserId()];
            if(u.ContactId==null){
                return 'The logged in User does not have an Applicant record';
            }
            system.debug(application);
            system.debug(devRecordTypeId);
            system.debug(license);
            
            application.abd_Application_Type__c ='Additional Locations';
            application.recordTypeId=devRecordTypeId;
            application.MUSW__Account__c=license.MUSW__Primary_Licensee__c;  // DRE replaces it.
            application.MUSW__Applicant__c=license.MUSW__Applicant__c;
            application.name='System Number';
            application.MUSW__Status__c='Pending';
            application.abd_Primary_License__c=license.Id;
            application.abd_Portal_Processed__c = true;
			system.debug(application);
            insert application;
            return 'SUCCESS: ' + String.valueOf(application.Id);
        }catch (Exception ex) {
        	system.debug(ex.getMessage());
            Database.rollback(sp);
        	throw new AuraHandledException(ex.getMessage());
        }
    }
    
}