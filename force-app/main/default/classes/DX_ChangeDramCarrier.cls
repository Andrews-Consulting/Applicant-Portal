public without sharing class DX_ChangeDramCarrier {
    

    @AuraEnabled
    public static MUSW__Application2__c createApplicationfromLicense(ID licenseId) {
        try {
	        User u = [Select ContactId From User Where Id = :UserInfo.getUserId()];
	        
	        // if this fails (user timed out), then we need to 
	        if (u == (User)null || u.ContactId == null) return new MUSW__Application2__c();

	        // Create a populate application object .  NOTE THIS DOES NOT HAVE AN ID YET.
	        MUSW__Application2__c newApp = DX_Utils.CreateAppFromLicense(licenseId);
	        return newApp;
	    }catch (exception ex) {
	    	throw new AuraHandledException(ex.getLineNumber() + ex.getMessage() + ex.getTypeName());
	    }
	}	


 	@AuraEnabled
    public static list<Account> getDram(){
    	list<Account> temp = new list<Account>();
    	temp.add(new Account(name='--None--'));
       	for(Account a:[Select Id, Name from Account where Type='DRAM Shop' order by Name]){
       		temp.add(a);	
       	} 
       	return temp;
    }

    // insert the record - called from Lightning component.
    @AuraEnabled
    public static String CreateApplication(MUSW__Application2__c application) {
        try{
          // Set the record Type of the application
        application.MUSW__Status__c = 'Pending';
        application.name='System Number';
        application.abd_Application_Type__c = 'Change DRAM';
        application.abd_Portal_Processed__c = true;
        application.RecordTypeId = Schema.SObjectType.MUSW__Application2__c.getRecordTypeInfosByName().get('Dram Carrier Change Application').getRecordTypeId();

        insert application;
        }catch(exception ex){
            throw new AuraHandledException(ex.getLineNumber() + ex.getMessage() + ex.getTypeName());
        }

        return application.Id;
    }    
}