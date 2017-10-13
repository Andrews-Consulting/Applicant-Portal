public without sharing class dx_AttestationAndSubmitController {

    public dx_AttestationAndSubmitController() {
        
    }
    
    @AuraEnabled
    public static void setAcknowledgmentFlag(MUSW__Application2__c application){
        try{
            if (application.Id!=null){
            	application.abd_Acknowledgement__c=true;
				MUSW__Application2__c app = [select abd_Premises_SingleLine_Address__c,abd_Premises_Geolocation__latitude__s,abd_Premises_Geolocation__longitude__s from MUSW__Application2__c where id=:application.Id];
               	if(app.abd_Premises_SingleLine_Address__c!='INCOMPLETE'){
					ArcGIS_RestAPI_Methods rm = new ArcGIS_RestAPI_Methods();
					ArcGIS_RestAPI_Methods.Location loc;
					try{
						loc = rm.GetCandidateAddress(app.abd_Premises_SingleLine_Address__c);
					}catch(exception e){}
					if(loc != null){
						application.abd_Premises_Geolocation__latitude__s = loc.y;
						application.abd_Premises_Geolocation__longitude__s = loc.x;
					}
				}
				update application;
            }
        }catch(exception ex){
            throw new AuraHandledException (ex.getMessage() + ex.getStackTraceString());             
        }
        
        return;
    }
}