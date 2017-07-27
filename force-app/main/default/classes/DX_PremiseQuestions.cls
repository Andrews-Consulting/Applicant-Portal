public with sharing class DX_PremiseQuestions {
	static String notAnswered = '--None--';

    // get the values from the Account record.  First we have to get the Account record id from the user record of the current user.
    // If we don't get anything back on the first SOQL, then the user is not logged on.  We're going to assume that they timed out, since
    // this should have been executed from an authorized page.
    @AuraEnabled
    public static MUSW__Application2__c getApplication(String objectId){
        
        User u = [Select ContactId From User Where Id = :UserInfo.getUserId()];
        // if this fails (user timed out), then we need to 
        if (u == (User)null || u.ContactId == null) return new MUSW__Application2__c();

        if (objectId.left(3) == Schema.SObjectType.MUSW__Application2__c.getKeyPrefix()) {
            list<MUSW__Application2__c> app = [Select Id,Name,Primary_Lic_Type__c,abd_Square_Footage__c,abd_Bond_Company__c,abd_DRAM_shop__c,abd_Veterans_Organization__c,
        		abd_Non_profit__c,abd_Dues_Member_Number__c,abd_Premises_Vehicle_Type__c,abd_Name_of_River_Lake__c,abd_Occupancy_Explination__c,
        		abd_Sell_Gasoline__c,abd_Occupancy_Over_200__c,abd_Premise_County__c,Square_Footage_Retail_Area__c,
        		(select id, abd_License_Type__c from License_Applications__r)		
        		from MUSW__Application2__c 
        		where ID =:objectId
        		order by Id DESC limit 1];
            if (app.size() == 0)  throw new AuraHandledException('No Application found for id ' + objectId + ' in DX_PremiseQuestions.GetApplication');
            return app[0];
        }
        else if (objectId.left(3) == Schema.SObjectType.MUSW__License2__c.getKeyPrefix()) {
            return DX_Utils.CreateAppFromLicense(objectId);
        }
        // safety catch.
        return new MUSW__Application2__c();
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
	
	// Get the list of values for the picklist field and pass them back to the lightning component.
    // Add the -- not answered-- choice as the first value.  If we move to radial buttons, this can all change.
    @AuraEnabled
    public static map<string,string[]> getPicklistValues(){
		map<string,string[]> pickVals = new map<string,string[]>();
        string[] options = new string[]{};
        Schema.DescribeFieldResult fieldResult = MUSW__Application2__c.abd_Bond_Company__c.getDescribe();
        List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
            options.add(notAnswered);
        for (Schema.PicklistEntry f: ple) {
            options.add(f.getLabel());
        }
        pickVals.put('bond',options);
        options = new List<String>();
        fieldResult = MUSW__Application2__c.abd_Premises_Vehicle_Type__c.getDescribe();
        ple = fieldResult.getPicklistValues();
            options.add(notAnswered);
        for (Schema.PicklistEntry f: ple) {
            options.add(f.getLabel());
        }
        pickVals.put('pVType',options);
        
        return pickVals;
    }

    // Update the record - called from Lightning component.  The lightning component handles the validation now. 

    @AuraEnabled
    public static String upRecordApex(MUSW__Application2__c application){
        
        try{
        	update application;
        }catch(exception ex){
            return ex.getMessage();
        }
        
        return 'Update Successful';
    }    
}