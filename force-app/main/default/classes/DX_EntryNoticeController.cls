public with sharing class DX_EntryNoticeController {

	@AuraEnabled
	public static String getStartUrl() {
		
		return [Select abd_StartUrl__c From User Where Id = :UserInfo.getUserId() limit 1].abd_StartUrl__c;
	
	}    
}