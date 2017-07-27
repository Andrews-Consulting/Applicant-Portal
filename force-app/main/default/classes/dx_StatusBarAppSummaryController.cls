public without sharing class dx_StatusBarAppSummaryController {
    
    
    @AuraEnabled
    public static MUSW__Application2__c getApplication(String applicationId) {
        
        if (applicationId == null || applicationId == '') return null;
        
        List<MUSW__Application2__c> appList = [SELECT Id, Name, CreatedDate, Primary_Lic_Type__c, MUSW__Status__c, abd_Primary_License__c, abd_Primary_License__r.MUSW__Class__c FROM MUSW__Application2__c WHERE Id = :applicationId ];
        
        if (appList == null || appList.isEmpty()) return null;
        
        return appList[0];
    }
    
    @AuraEnabled
    public static AppStatus getAppStatus (string objectId){
        AppStatus statusBlock = new AppStatus();
        
        if (!String.isEmpty(objectId))  {      // If we have a valid ID
            if (objectId.left(3) == Schema.SObjectType.MUSW__Application2__c.getKeyPrefix()) {
                statusBlock.isApplication = true;
                List<MUSW__Application2__c> appList = [SELECT Id, Name, CreatedDate, MUSW__Status__c, abd_Primary_License__c, abd_Primary_License__r.MUSW__Class__c 
                                                   		FROM MUSW__Application2__c 
                                                   		WHERE Id = :objectId ];
                if (appList.size() > 0) {           // and we have a record
                    statusBlock.Id = appList[0].Id;
                    statusBlock.name = appList[0].Name;
                    statusBlock.licClass = appList[0].abd_Primary_License__r.MUSW__Class__c;
                    statusBlock.status = appList[0].MUSW__Status__c;
                    statusBlock.created = applist[0].CreatedDate.format();
                    dx_ProgressAndReview_helper prh = new dx_ProgressAndReview_helper(objectId);
                    statusBlock.progressStatus = prh.getStatus();
                }
            }
            else if (objectId.left(3) == Schema.SObjectType.MUSW__License2__c.getKeyPrefix()) {
                statusBlock.isApplication = false;                
                 List<MUSW__License2__c> licList = [SELECT Id, Name, CreatedDate, MUSW__Status__c, MUSW__Class__c 
                                                        FROM MUSW__License2__c 
                                                        WHERE Id = :objectId ];
                    if (liclist.size() > 0) {
                        statusBlock.Id = licList[0].Id;
                        statusBlock.name = licList[0].Name;
                        statusBlock.licClass = licList[0].MUSW__Class__c;
                        statusBlock.status = licList[0].MUSW__Status__c;
                        statusBlock.created = licList[0].CreatedDate.format();
                        // dx_ProgressAndReview_helper prh = new dx_ProgressAndReview_helper(objectId);
                        // statusBlock.progressStatus = prh.getStatus();
                    }
            }
        }   
        
        
        return statusBlock;
    }
    
 public class AppStatus {
        @AuraEnabled  public Boolean isApplication {get;set;}
        @AuraEnabled  public String licClass {get;set;}
        @AuraEnabled  public String name {get;set;}
        @AuraEnabled  public String Id {get;set;}
        @AuraEnabled  public String status {get;set;}
        @AuraEnabled  public String created {get;set;}
        @Auraenabled list<dx_ProgressAndReview_helper.SectionStatus> progressStatus {get;set;}
        }
    
    
}