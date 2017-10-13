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
        
        options = new string[]{};
        fieldResult = MUSW__Application2__c.abd_Start_Time__c.getDescribe();
        ple = fieldResult.getPicklistValues();
            options.add(notAnswered);
        for (Schema.PicklistEntry f: ple) {
            options.add(f.getLabel());
        }
        pickVals.put('time',options);
        
        options = new string[]{};
        fieldResult = MUSW__Application2__c.abd_Premise_County__c.getDescribe();
        ple = fieldResult.getPicklistValues();
        options.add(notAnswered);
        for (Schema.PicklistEntry f: ple) {
            options.add(f.getLabel());
        }
        pickVals.put('county',options);
        
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
    @AuraEnabled
    public static list<abd_Census__c> getPremiseCity(string county){
        list<abd_Census__c> temp = new list<abd_Census__c>();
        temp.add(new abd_Census__c(name='--None--'));
        for(abd_Census__c a:[Select Name,abd_Population__c from abd_Census__c where abd_County__c!=null and abd_County__c includes(:county) and abd_Type__c='City' order by Name]){
            temp.add(a);    
        } 
        return temp;
    }
    
    //Methods for dx_TransferLicense
    @AuraEnabled
    public static MUSW__Application2__c createApplicationfromLicense(ID licenseId){
        Savepoint sp = Database.setSavepoint();
        try{
        	Id devRecordTypeId = Schema.SObjectType.MUSW__Application2__c.getRecordTypeInfosByName().get('Transfer of License/Permit Application').getRecordTypeId();
            User u = [Select ContactId From User Where Id = :UserInfo.getUserId()];
            
            // if this fails (user timed out), then we need to 
            if (u == (User)null || u.ContactId == null) 
            	throw new AuraHandledException ('User does not appear to be logged in anymore');

            MUSW__Application2__c application = DX_Utils.CreateAppFromLicense(licenseId);
            application.MUSW__Status__c = 'Pending';
            //application.name='System Number';
            
            application.abd_Application_Type__c ='Transfer License';
            application.recordTypeId=devRecordTypeId;
            /*application.MUSW__Account__c=license.MUSW__Primary_Licensee__c;
            application.MUSW__Applicant__c=license.MUSW__Applicant__c;
            application.name='System Number';
            application.MUSW__Status__c='Pending';
            application.abd_Primary_License__c=license.Id;*/
            application.abd_Premise_Address__c = null;
            application.abd_Premise_Address_2__c = null;
            application.abd_Portal_Processed__c = true;
//            application.abd_Length__c=license.abd_Length__c;
            System.debug('Transfer Application' + application);
			insert application;
            
            list<BGCK__Answer__c> answerList = new list<BGCK__Answer__c>();

         	list<BGCK__Page_Question__c> questionList = [Select Id, BGCK__Question__c, application_type__c, license_type__c from BGCK__Page_Question__c where Application_Type__c includes (:application.abd_Application_Type__c) and License_Type__c includes (:application.abd_PortalWork_LicenseType__c)];
         									// TODO where bgck_checklist_version_status__c = 'Active'
         	System.debug('questionlist size = ' + questionList.size());
         	if (questionList.size() > 0) {
         		for (BGCK__Page_Question__c question: questionList) {
         				BGCK__Answer__c answerItem = new BGCK__Answer__c();
			           	answerItem.BGCK__Page_Question__c = question.Id; 
			           	answerItem.Name = 'Not Answered Yet'; 
			           	answerItem.BGCK__Question__c = question.BGCK__Question__c;
			           	answerItem.Application__c = application.Id;
			           	answerList.add(answerItem);
			        }
			    if (answerList.size() > 0) {
			    	insert answerList;
			    }
			}
	        return application;

        }catch (exception ex) {
            throw new AuraHandledException(ex.getLineNumber() + ex.getMessage() + ex.getTypeName());
        }
    }
    
    //Methods for dx_TransferLicense
    @AuraEnabled
    public static MUSW__Application2__c updateTransferApp(MUSW__Application2__c application){
        try{
        	update application;
            return application;

        }catch (exception ex) {
            throw new AuraHandledException(ex.getLineNumber() + ex.getMessage() + ex.getTypeName());
        }
    }
}