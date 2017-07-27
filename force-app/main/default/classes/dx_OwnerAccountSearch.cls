public without sharing class dx_OwnerAccountSearch {
    
    @AuraEnabled
    public static list<Account> getAccounts(string qfs){
        list<Account> la  = new list<Account>();
        map<string,AccountContactRelation> lacr  = new map<string,AccountContactRelation>();
        User u = [Select ContactId From User Where Id = :UserInfo.getUserId()];
        system.debug(qfs);
        QueryFields qf = (QueryFields)JSON.deserializeStrict(qfs,QueryFields.class);
        system.debug(qf);
        for(Application_Contact__c ac:[Select Application__r.MUSW__Account__r.Name,Application__r.MUSW__Account__c, SSN__c 
                                       from Application_Contact__c where First_Name__c =:qf.firstname and Last_Name__c=:qf.lastName]){
            System.debug('OAS: ' + ac);
            if (qf.ssn.contains('-')) qf.ssn = qf.ssn.replace('-','');
            System.debug('OAS: ssn fixed' + qf.ssn);
        	if(qf.ssn == ac.SSN__c){
            System.debug('OAS: ssn Match');
                la.add(new Account(Id=ac.Application__r.MUSW__Account__c,Name=ac.Application__r.MUSW__Account__r.Name));
                string key = string.valueOf(ac.Application__r.MUSW__Account__c)+string.valueOf(u.ContactId);
                System.debug('OAS: key ' + key);
                if(u.ContactId!=null && !lacr.containsKey(key)) {
                    System.debug('OAS: ready to put LACR');
                	lacr.put(key,new AccountContactRelation(AccountId=ac.Application__r.MUSW__Account__c,ContactId=u.ContactId));

                }
        	}
        }
        for(AccountContactRelation acr:[Select Id, AccountId,ContactId from AccountContactRelation where ContactId=:u.ContactId]){
            System.debug('OAS ACR: ' + acr);
        	string key = string.valueOf(acr.AccountId)+string.valueOf(acr.ContactId);
        	if(lacr.containskey(key))
        		lacr.put(key,acr);
        }
        if(lacr.size()>0){
        	upsert lacr.values();	
        }
        
        return la;
    }
	
    @AuraEnabled
    public static string updateUser(Id accountId){
        system.debug(accountId);
        User u = [Select ContactId From User Where Id = :UserInfo.getUserId()];
        Contact c = new Contact(Id=u.ContactId,AccountId=accountId);
        update c;
        return null;
    }
	
    public class QueryFields{
        
        public QueryFields() {}

        @AuraEnabled
        public string firstName { get;set; }
        
        @AuraEnabled
        public string lastName { get;set; }
        
        @AuraEnabled
        public string ssn { get;set; }
        
    }
}