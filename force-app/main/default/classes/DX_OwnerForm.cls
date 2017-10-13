public without sharing class DX_OwnerForm {
	static String notAnswered = '--None--';
	
	@AuraEnabled
	public static string[] getPicklistValues(){
		List<String> options = new List<String>();
        Schema.DescribeFieldResult fieldResult = Application_Contact__c.State__c.getDescribe();
        List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
            options.add(notAnswered);
        for (Schema.PicklistEntry f: ple) {
            options.add(f.getLabel());
        }
        system.debug(options);
        return options;
	}
    
    @AuraEnabled
	public static Application_Contact__c getOwnerss(Id ownerId, Id appId){
		Application_Contact__c owner;

		if (ownerId != null) {
			list<Application_Contact__c> ownerlist = [Select Id,Application__c,Business_Name__c,First_Name__c,Last_Name__c,Address__c,
					Address_2__c,City__c,State__c,Zip_Code__c,abd_State_of_Incorporation__c,abd_Primary_Owner__c,Position__c,SSN__c,
					abd_Federal_Gambling_Stamp__c,Date_of_Birth__c,U_S_Citizen__c,of_Ownership__c, abd_LicenseeBusinessType__c, abd_EIN__c
					from Application_Contact__c where Id=:ownerId];	 
			if (ownerlist.size() > 0)
				owner = ownerlist[0];
		}

		if (owner == null)
				owner = new Application_Contact__c(Application__c = appId ,Business_Name__c='',First_Name__c='',Last_Name__c='',Address__c='',Address_2__c='',City__c='',Zip_Code__c='',
					abd_Primary_Owner__c=false,Position__c='',SSN__c='');

		return owner;
	}
	
	@AuraEnabled
    public static string getTypess(ID appId){
        
        User u = [Select Contact.AccountId From User Where Id = :UserInfo.getUserId()];
        // if this fails (user timed out), then we need to 
        if (u == (User)null || u.ContactId == null || u.Contact.AccountId == null) return null;

        list<Account> ac = [Select Business_Type__c from Account where Id in (select MUSW__Account__c from MUSW__Application2__c where ID =: appId) limit 1];
        if (ac.size() > 0) {
        	return ac[0].Business_Type__c;
        }
        return null;
    }
    
    // Update the record - called from Lightning component.  The lightning component handles the validation now. 


    @AuraEnabled
    public static String upRecordApex(Application_Contact__c owner){
        try{
        	list<BGCK__Answer__c> answer = [select Id, Name from BGCK__Answer__c where Application__c =: owner.Application__c and BGCK__Question__r.Name='Owner Details' limit 1];
        	if (answer.size() > 0) {
	        	owner.Answer__c = answer[0].Id;
	        	upsert owner;
	        	list<AggregateResult> AnsCountRecs = [Select Count(Id) from Application_Contact__c where Answer__c=:answer[0].Id];
	        	Object ansCount = AnsCountRecs[0].get('expr0');
	        	answer[0].Name = string.valueOf(ansCount) +' related record(s)';
	        	update answer;
			}
       	}
        catch(exception ex){
            throw new AuraHandledException (ex.getMessage());
        }
        
        return null;
    }  
 
}