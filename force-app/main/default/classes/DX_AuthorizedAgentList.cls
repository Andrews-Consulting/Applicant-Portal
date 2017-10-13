public without sharing class DX_AuthorizedAgentList {
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

    // ID might be a license id (BTW)
    
    @AuraEnabled
	public static boolean checkApplication(Id appId){
		list<MUSW__Application2__c> app = [Select Id,(select id, abd_License_Type__c from License_Applications__r) from MUSW__Application2__c where Id=:appId];
		set<string> ss = new set<string>{'CB', 'CV', 'SP'};	 
		if (app.size() > 0) {
			for(abd_License_Application__c la:app[0].License_Applications__r){
				if(la.abd_License_Type__c=='SP')
					return true;
				if(ss.contains(la.abd_License_Type__c))
					return false;
			}
		}
		return null;
	}
	
    @AuraEnabled
	public static AgentInfo[] getAgentList(Id id){
        boolean skip = true;   
        Boolean inState = false;
		list<MUSW__Application2__c> applist = [Select Id, abd_Premise_State__c, (select id, abd_License_Type__c from License_Applications__r) from MUSW__Application2__c where Id=:id];
        if (applist.size() > 0) {
            MUSW__Application2__c app = applist[0];
            if (app.abd_Premise_State__c == 'IA')
                inState = true;

    		set<string> ss = new set<string>{'CB', 'CV', 'SP'}; 
    		for(abd_License_Application__c la:app.License_Applications__r){
    			if(ss.contains(la.abd_License_Type__c))
    				skip = false;
    		}
        }

        AgentInfo[] agentlist = new AgentInfo[]{};

		if(!skip) {
    		for(abd_Authorized_Agent__c a:[Select Id,abd_Auth_Agent_Name__c, abd_Auth_Agent_City__c,abd_Auth_Agent_State__c,abd_Auth_Agent_Phone__c,
    										abd_Application__c
    										from abd_Authorized_Agent__c where abd_Application__c=:id]){
    			agentlist.add(new AgentInfo(a, inState, true));	
    		}	 
        }

        // If no agents, then send back the state indicator
        if (agentlist.size() < 1)
            agentlist.add(new AgentInfo(new abd_Authorized_Agent__c() , inState, false));

		return agentlist;
	}
    
    @AuraEnabled
    public static String upRecordApex(string agentString){
    	list<AgentInfo> agentlist = (list<AgentInfo>) JSON.deserializeStrict(agentString,list<AgentInfo>.class);
        abd_Authorized_Agent__c[] deletelist = new abd_Authorized_Agent__c[]{};
        abd_Authorized_Agent__c[] updatelist = new abd_Authorized_Agent__c[]{};
        for(AgentInfo ai:agentlist){
        	if(ai.agent.abd_Auth_Agent_State__c == notAnswered)ai.agent.abd_Auth_Agent_State__c = null;
        	if(ai.needDelete){
        		deletelist.add(ai.agent);
        	}else{
        		updatelist.add(ai.agent);
        	}
        }
        try{
        	if(updatelist.size() > 0)
        		update updatelist;
        	if(deletelist.size() > 0)
        		delete deletelist;
        }catch(exception ex){
            return ex.getMessage();
        }
        
        return 'Update Successful';
    }   
    





    public class AgentInfo{
    	
    	@AuraEnabled
        public Boolean inState;
        @AuraEnabled
        public Boolean agentExists;
        @AuraEnabled
	    public abd_Authorized_Agent__c agent{get;set;}
    	@AuraEnabled
	    public boolean needDelete{get;set;}
    	
    	public AgentInfo(abd_Authorized_Agent__c aa, Boolean inState, Boolean agentExists){
    		this.agent = aa;
    		this.needDelete = false;	
            this.inState = inState;
            this.agentExists = agentExists;
    	}
    }    
}