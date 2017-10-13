public without sharing class DX_AuthorizedAgentForm {
	static String notAnswered = '--None--';
	
	@AuraEnabled
	public static string[] getPicklistValues(){
		List<String> options = new List<String>();
        Schema.DescribeFieldResult fieldResult = abd_Authorized_Agent__c.abd_Auth_Agent_State__c.getDescribe();
        List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
            options.add(notAnswered);
        for (Schema.PicklistEntry f: ple) {
            options.add(f.getLabel());
        }
        
        return options;
	}
    
    @AuraEnabled
	public static abd_Authorized_Agent__c getAA(Id agentId){

		abd_Authorized_Agent__c agent;
		if (agentId != null) {
			list<abd_Authorized_Agent__c> agentlist = [Select Id,abd_Application__c,abd_Auth_Agent_Name__c,abd_Auth_Agent_Address__c,abd_Auth_Agent_Address_2__c,
					abd_Auth_Agent_City__c,abd_Auth_Agent_State__c,abd_Auth_Agent_Zip__c,abd_Auth_Agent_Phone__c
					from abd_Authorized_Agent__c where Id=:agentId];	 

			if (agentlist.size() > 0) agent = agentlist[0];
		}

		if (agent == null)
			agent = new abd_Authorized_Agent__c(abd_Application__c = null,abd_Auth_Agent_Name__c='',abd_Auth_Agent_Address__c='',
												abd_Auth_Agent_Address_2__c='',abd_Auth_Agent_City__c='',abd_Auth_Agent_Zip__c='');
		return agent;
	}
	
	/*@AuraEnabled
	public static MUSW__Application2__c getApplication(Id appId){
		MUSW__Application2__c app = [Select Id,(select id, abd_License_Type__c from License_Applications__r) from MUSW__Application2__c where Id=:appId];
		set<string> ss = new set<string>{'CB', 'CD', 'CV'};	 
		for(abd_License_Application__c la:app.License_Applications__r){
			if(ss.contains(la.abd_License_Type__c))
				return app;
		}
		return null;
	}*/
	
	@AuraEnabled
	public static boolean checkApplication(Id appId){
		MUSW__Application2__c app = [Select Id,(select id, abd_License_Type__c from License_Applications__r) from MUSW__Application2__c where Id=:appId];
		set<string> ss = new set<string>{'CB', 'CD', 'CV', 'SP'};	 
		for(abd_License_Application__c la:app.License_Applications__r){
			if(la.abd_License_Type__c=='SP')
				return true;
			if(ss.contains(la.abd_License_Type__c))
				return false;
		}
		return null;
	}
	
	// Update the record - called from Lightning component.  The lightning component handles the validation now. 

    @AuraEnabled
    public static String upRecordApex(abd_Authorized_Agent__c agent){
        system.debug('Agent Update');
        try{
        	upsert agent;
        }catch(exception ex){
            return ex.getMessage();
        }
        
        return null;
    }    
}