public with sharing class DX_SiteMenuController {
    

      @AuraEnabled
    public static Id getUserId(){
        return UserInfo.getUserId();
	}
}