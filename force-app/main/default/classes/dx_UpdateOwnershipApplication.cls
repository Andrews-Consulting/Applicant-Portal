public class dx_UpdateOwnershipApplication {
	static String notAnswered = '--None--';
	
     // FOR THE UPDATE OWNERSHIP application
    @AuraEnabled
    public static MUSW__Application2__c createApplicationfromLicense(ID licenseId) {
        try {
            User u = [Select ContactId From User Where Id = :UserInfo.getUserId()];
            
            // if this fails (user timed out), then we need to 
            if (u == (User)null || u.ContactId == null) 
            	throw new AuraHandledException ('User does not appear to be logged in anymore');
			Id OwnershipRecordType = Schema.SObjectType.MUSW__Application2__c.getRecordTypeInfosByName().get('Ownership Update').getRecordTypeId();
            MUSW__Application2__c application;
            //for(MUSW__Application2__c a:[Select Id,abd_Effective_End_Date_of_Current_Lic__c,abd_Effective_Date_of_Current_License__c,abd_Effective_Date__c from MUSW__Application2__c where abd_Primary_License__c=:licenseId 
            //								and RecordTypeId =: OwnershipRecordType and abd_Application_Type__c = 'Ownership Update']){
            //	application = a;	
            //}
            if(application == null){
	            application = DX_Utils.CreateAppFromLicense(licenseId);
	            application.MUSW__Status__c = 'Pending';
	            //application.name='System Number';
	            application.abd_Application_Type__c = 'Ownership Update'; 
				application.RecordTypeId = OwnershipRecordType;            
	            insert application;
				Integer numberofAnswers = DX_Utils.BuildEmptyAnswers(application.id, application.abd_Application_Type__c, application.abd_PortalWork_LicenseType__c);
            }
	        return application;

        }catch (exception ex) {
            System.debug(ex.getLineNumber() + ex.getMessage() + ex.getTypeName());
            throw new AuraHandledException(ex.getLineNumber() + ex.getMessage() + ex.getTypeName());
        }
    }   

    // Update the record - called from Lightning component.  The lightning component handles the validation now. 
    @AuraEnabled
    public static String UpdateApplication(MUSW__Application2__c application,string ownerString) {
        try{
			list<DX_OwnerList.OwnerInfo> ownerlist = (list<DX_OwnerList.OwnerInfo>) JSON.deserializeStrict(ownerString,list<DX_OwnerList.OwnerInfo>.class);
	        Application_Contact__c[] deletelist = new Application_Contact__c[]{};
	        Application_Contact__c[] updatelist = new Application_Contact__c[]{};
	        BGCK__Answer__c answer = [select Id, Name from BGCK__Answer__c where Application__c =: application.Id and BGCK__Question__r.Name='Owner Details' limit 1];
        	for(DX_OwnerList.OwnerInfo oi:ownerlist){
	        	if(oi.needDelete){
	        		if(oi.owner.Id!=null)
	        			deletelist.add(oi.owner);
	        	}else{
	        		if(oi.owner.U_S_Citizen__c == notAnswered)
	        			oi.owner.U_S_Citizen__c = null;
	        		if (answer != null)
			        	oi.owner.Answer__c = answer.Id;
			        updatelist.add(oi.owner);
	        	}
	        }
	        try{
	        	if(updatelist.size() > 0)
	        		upsert updatelist;
	        	if(deletelist.size() > 0)
	        		delete deletelist;
	        		
	        	answer.Name = string.valueOf([Select Count(Id) from Application_Contact__c where Answer__c=:answer.Id][0].get('expr0'))+' related record(s)';
	        	update answer;
	        
	        }catch(exception ex){
	            throw new AuraHandledException(ex.getLineNumber() + ex.getMessage() + ex.getTypeName());
	        }
        	// Set the record Type of the application
            application.MUSW__Status__c = 'In Progress';
            update application;
        }catch(exception ex){
            throw new AuraHandledException(ex.getLineNumber() + ex.getMessage() + ex.getTypeName());
        }

        return application.Id;
    }
    
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
	public static DX_OwnerList.OwnerInfo[] getOwnerList(Id id){
		DX_OwnerList.OwnerInfo[] ownerlist = new DX_OwnerList.OwnerInfo[]{};
		for(Application_Contact__c o:[Select  Id,Application__c,Business_Name__c,First_Name__c,Last_Name__c,Address__c,
										Address_2__c,City__c,State__c,Zip_Code__c,abd_State_of_Incorporation__c,abd_Primary_Owner__c,Position__c,SSN__c,
										abd_Federal_Gambling_Stamp__c,Date_of_Birth__c,U_S_Citizen__c,of_Ownership__c, abd_LicenseeBusinessType__c, abd_EIN__c
										from Application_Contact__c where Application__c=:id]){
			ownerlist.add(new DX_OwnerList.OwnerInfo(o));	
		}	 
		return ownerlist;
	}
    
    @AuraEnabled
	public static DX_OwnerList.OwnerInfo[] getNewOwners(Id appId,Integer amount){
		DX_OwnerList.OwnerInfo[] ownerlist = new DX_OwnerList.OwnerInfo[]{};

		for(integer i=0;i<amount;i++){
				ownerlist.add(new DX_OwnerList.OwnerInfo(new Application_Contact__c(Application__c = appId ,Business_Name__c='',First_Name__c='',Last_Name__c='',Address__c='',Address_2__c='',City__c='',Zip_Code__c='',
					Position__c='',SSN__c='')));
		}
		return ownerlist;
	}
}