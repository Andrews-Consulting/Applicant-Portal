public with sharing class dx_UpdatePremiseApplication {
     // FOR THE UPDATE PREMISE application
    @AuraEnabled
    public static MUSW__Application2__c createApplicationfromLicense(ID licenseId) {
        try {
            User u = [Select ContactId From User Where Id = :UserInfo.getUserId()];
            
            // if this fails (user timed out), then we need to 
            if (u == (User)null || u.ContactId == null) 
            	throw new AuraHandledException ('User does not appear to be logged in anymore');

            MUSW__Application2__c application = DX_Utils.CreateAppFromLicense(licenseId);
            application.MUSW__Status__c = 'Pending';
            application.name='System Number';
            application.abd_Application_Type__c = 'Premises Update'; 
			application.RecordTypeId = Schema.SObjectType.MUSW__Application2__c.getRecordTypeInfosByName().get('Premises Update Application').getRecordTypeId();            
            insert application;

            DX_Utils.BuildEmptyAnswers(application.Id, application.abd_Application_Type__c, application.abd_PortalWork_LicenseType__c);

	        return application;

        }catch (exception ex) {
            System.debug(ex.getLineNumber() + ex.getMessage() + ex.getTypeName());
            throw new AuraHandledException(ex.getLineNumber() + ex.getMessage() + ex.getTypeName());
        }
    }   

    // Update the record - called from Lightning component.  The lightning component handles the validation now. 
    @AuraEnabled
    public static String UpdateApplication(MUSW__Application2__c application) {
        try{
            // Set the record Type of the application
            application.MUSW__Status__c = 'In Progress';
            update application;
        }catch(exception ex){
            throw new AuraHandledException(ex.getLineNumber() + ex.getMessage() + ex.getTypeName());
        }

        return application.Id;
    }    
}