public without sharing class DX_OwnerList {
	
	@AuraEnabled
	public static OwnerInfo[] getOwnerList(Id id){
		OwnerInfo[] ownerlist = new OwnerInfo[]{};
		for(Application_Contact__c o:[Select Id,Application__c,First_Name__c,Last_Name__c,abd_Primary_Owner__c,
										of_Ownership__c, Business_Name__c, abd_LicenseeBusinessType__c
										from Application_Contact__c where Application__c=:id]){
			ownerlist.add(new OwnerInfo(o));	
		}	 
		return ownerlist;
	}
    
    @AuraEnabled
    public static String upRecordApex(string ownerString){
    	list<OwnerInfo> ownerlist = (list<OwnerInfo>) JSON.deserializeStrict(ownerString,list<OwnerInfo>.class);
        Application_Contact__c[] deletelist = new Application_Contact__c[]{};
        Application_Contact__c[] updatelist = new Application_Contact__c[]{};
        Id appId;
        for(OwnerInfo oi:ownerlist){
        	if(appId==null)
        		appId = oi.owner.Application__c;
        	if(oi.needDelete){
        		deletelist.add(oi.owner);
        	}else{
        		updatelist.add(oi.owner);
        	}
        }
        try{
        	if(updatelist.size() > 0)
        		update updatelist;
        	if(deletelist.size() > 0)
        		delete deletelist;
        		
        	BGCK__Answer__c answer = [select Id, Name from BGCK__Answer__c where Application__c =: appId and BGCK__Question__r.Name='Owner Details' limit 1];
        	answer.Name = string.valueOf([Select Count(Id) from Application_Contact__c where Answer__c=:answer.Id][0].get('expr0'))+' related record(s)';
        	update answer;
        
        }catch(exception ex){
            return ex.getMessage();
        }
        
        return 'Update Successful';
    }   
    
    public class OwnerInfo{
    	
    	@AuraEnabled
	    public Application_Contact__c owner{get;set;}
    	@AuraEnabled
	    public boolean needDelete{get;set;}
    	
    	public OwnerInfo(Application_Contact__c ac){
    		this.owner = ac;
    		this.needDelete = false;	
    	}
    }
}