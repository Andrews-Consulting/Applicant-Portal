public with sharing class DX_FeeDisplay {
    @AuraEnabled
    public static string getFeeSchedule(String appInfo) {
       	System.debug(appInfo);
        return DX_Utils.getFeeSchedule(appInfo);
    }
}