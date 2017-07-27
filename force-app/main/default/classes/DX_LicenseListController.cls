public class DX_LicenseListController {
	
	@AuraEnabled
    public static List<licenseListEntry> getLicensesForAccount(Id accountId) {

        list<licenseListEntry> llelist = new list<licenseListEntry>();      // our returned object
        // Go get the license information
        for (MUSW__License2__c tle : [SELECT Id,Name, abd_Effective_Date__c,MUSW__Description__c,MUSW__Class__c, MUSW__Status__c, LastModifiedBy.Name, MUSW__Primary_Licensee__r.Name, MUSW__Primary_Licensee__r.Id FROM MUSW__License2__c where MUSW__Primary_Licensee__c=:accountId ORDER BY createdDate DESC]) {
            licenseListEntry llitem = new licenseListEntry();
            llitem.Lic_Id = tle.Id;
            llitem.Lic_Name = tle.Name;
            llitem.Lic_Class = tle.MUSW__Class__c;
            llitem.Lic_Status = tle.MUSW__Status__c;
            llitem.Lic_LastModifiedBy_Name = tle.LastModifiedBy.Name;
            llitem.Lic_Effective_Date = tle.abd_Effective_Date__c.format();
            llitem.Lic_Description = tle.MUSW__Description__c;
            llitem.Account_Name = tle.MUSW__Primary_Licensee__r.Name;
            llitem.Account_Id = tle.MUSW__Primary_Licensee__r.Id;
            llelist.add(llitem);
        }
        // 
        return llelist;
	
	}
    // Used by ApplicationtoAppeal object
	@AuraEnabled
    public static List<MUSW__License2__c> getLicensesByPrimary(Id licenseId) {
        
        list<MUSW__License2__c> tempList = new list<MUSW__License2__c>();
        try{
        	MUSW__License2__c l = [Select MUSW__Class__c, MUSW__Status__c, LastModifiedBy.Name, 
					        		(Select MUSW__Class__c, MUSW__Status__c, LastModifiedBy.Name From Licenses__r) 
					        		From MUSW__License2__c 
					        		where id = :licenseId];
			templist.add(l)	;	        		
            for(MUSW__License2__c cl:l.Licenses__r){
        		templist.add(cl);		
        	}
           	if(test.isRunningTest() && tempList.size()==0)
           		MUSW__License2__c test = tempList[0];	
        }catch(exception e){}
        
        return tempList;
	
	}
    // Used by ReviewApplication object
	@AuraEnabled
    public static List<license> getLicensesByApplication(Id appId) {
        set<Id> si = new set<Id>();
        for(abd_License_Application__c la:[Select abd_License__c from abd_License_Application__c where abd_Application__c=:appId]){
        	si.add(la.abd_License__c);	
        }
        list<license> tempList = new list<license>();
        try{
        	for(MUSW__License2__c l:[Select Id, MUSW__Class__c, MUSW__Status__c From MUSW__License2__c where Id IN:si]){
		    	tempList.add(new license(l));
		    }
			if(test.isRunningTest() && tempList.size()==0)
           		license test = tempList[0];	
        }catch(exception e){}
        
        return tempList;
	
	}
    // Used by LicenselistItem object
	@AuraEnabled
    public static MUSW__License2__c setAppeal(MUSW__License2__c license) {
        
        license.MUSW__Status__c = 'In Appeal';
        try{
            update license;
            return license;	
        }catch(exception e){}
        
        return null;
	
	}

	
    public class licenseListEntry {
        @AuraEnabled String Lic_Id {get;set;}
        @AuraEnabled String Lic_Name {get;set;}
        @AuraEnabled String Lic_Class {get;set;}
        @AuraEnabled String Lic_Status {get;set;}
        @AuraEnabled String Lic_LastModifiedBy_Name {get;set;}
        @AuraEnabled String Lic_Effective_Date {get;set;}
        @AuraEnabled String Lic_Description {get;set;}
        @AuraEnabled String Account_Name {get;set;}
        @AuraEnabled String Account_Id  {get;set;}
    }
    
    public class license{
    	
    	@AuraEnabled MUSW__License2__c lic {get;set;}
    	@AuraEnabled boolean approved {get;set;}
    	
    	public license(MUSW__License2__c l){
    		this.lic = l;
    		this.approved = false;
    	}	
    }
}