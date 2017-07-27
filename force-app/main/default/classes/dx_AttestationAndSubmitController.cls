public without sharing class dx_AttestationAndSubmitController {

    public dx_AttestationAndSubmitController() {
        
    }
    
    @AuraEnabled
    public static void setAcknowledgmentFlag(MUSW__Application2__c application){
        try{
            if (application.Id!=null){
                application.abd_Acknowledgement__c=true;
                update application;
            }
        }catch(exception ex){
            throw new AuraHandledException (ex.getStackTraceString());             
        }
        
        return;
    }
}