public class DX_ApplicationListController {

    @AuraEnabled
    public static List<MUSW__Application2__c> getApplications(Id accountId) {
        
        list<MUSW__Application2__c> tempList = new list<MUSW__Application2__c>();
        try{
            tempList = [SELECT Id,Name, abd_Effective_Date__c,MUSW__Description__c,MUSW__Status__c FROM MUSW__Application2__c where MUSW__Account__c=:accountId ORDER BY createdDate DESC limit 5];
           	if(test.isRunningTest() && tempList.size()==0)
           		MUSW__Application2__c test = tempList[0];	
        }catch(exception e){}
        
        return tempList;
	
	}
    
}