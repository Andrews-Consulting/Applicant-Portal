public with sharing class dx_StdPageAbstraction {
    
@AuraEnabled
  public static Navigation_Information getNavigationModel(String objectId) {
// System.debug('STDPageAbstraction ObjectId ' + objectId);

    list<dx_cmpNavigation__mdt> navRecs = [Select MasterLabel, NextCmp__c, PrevCmp__c, DetailCmp__c, ShowNextButton__c, ShowSaveExitButton__c, 
    										    ShowExitNoSaveButton__c, ShowSkipButton__c, SkipLabel__c, ShowSaveAddButton__c, SaveAddLabel__c, 
    										    CmpHome__c, ValidLicenseTypeList__c, Valid_for_App_Record_Types__c from dx_cmpNavigation__mdt];

    String lt = null;
    String recordType = null;
    Boolean isApplication = false;
    //  We can be called with an invalid record id which should just fall through.                                          
    	if (!String.isBlank(objectId) && objectId.length() >= 15) {
			
			//  object id can be an application ID, or a license ID at this time. 
            if (objectId.left(3) == Schema.SObjectType.MUSW__Application2__c.getKeyPrefix()) {
                isApplication = true;
                list<MUSW__Application2__c> app_ltList = [Select Primary_Lic_Type__c, RecordType.Name, abd_Application_Type__c from MUSW__Application2__c where id = :objectId limit 1];
        	    if (app_ltList.size() > 0) {
                    lt = app_ltList[0].Primary_Lic_Type__c;
                    recordType = app_ltList[0].RecordType.Name;
                    if (recordType == 'New Application' && app_ltList[0].abd_Application_Type__c == 'Add Privilege or License to Existing License')
                        recordType = 'Add Privilege';
//                    'Ownership Update';
                }
            }
            else {      
            // if this is a license object, then grab the type and the primary license.  If it points to another record (really another record), then go
            // get the license type from the other record (should be the primary, since we don't allow more than 1 level)
                if (objectId.left(3) == Schema.SObjectType.MUSW__License2__c.getKeyPrefix()) {
                    list<MUSW__License2__c> lic_ltList = [Select abd_License_Type__c, abd_Primary_License__r.Id from MUSW__License2__c where id = :objectId limit 1];
                    if (lic_ltList.size() > 0 && lic_ltList[0].abd_Primary_License__r.Id != null)
                        if (lic_ltList[0].abd_Primary_License__r.Id != objectId)
                            lic_ltList = [Select abd_License_Type__c from  MUSW__License2__c where id = :lic_ltList[0].abd_Primary_License__r.Id limit 1];
                    if (lic_ltList.size() > 0)
                        lt = lic_ltList[0].abd_License_Type__c;
                }
                else if (objectId.left(3) == Schema.SObjectType.MUSW__Review__c.getKeyPrefix()){
					Id appId = [select MUSW__Application2__c from MUSW__Review__c where Id=:objectId].MUSW__Application2__c;
					list<MUSW__Application2__c> app_ltList = [Select Primary_Lic_Type__c, RecordType.Name, abd_Application_Type__c from MUSW__Application2__c where id = :appId limit 1];
	        	    if (app_ltList.size() > 0) {
	                    lt = app_ltList[0].Primary_Lic_Type__c;
	                    recordType = app_ltList[0].RecordType.Name;
                        if (recordType == 'New Application' && app_ltList[0].abd_Application_Type__c == 'Add Privilege or License to Existing License')
                            recordType = 'Add Privilege';
	                }
				}
				   
            }
        }
        return new Navigation_Information(lt, navRecs, isApplication, recordType, Site.getBaseUrl());
    }

    // Special class to return to the lightning component.

    public class Navigation_Information {


    	public Navigation_Information(String licenseType, List<dx_cmpNavigation__mdt> navigationModel, Boolean isApplication, String recordType, String sitePrefix) {
            this.licenseType = licenseType;
            this.navigationModel = navigationModel;
            this.isApplication = isApplication;
            this.recordType = recordType;
            this.sitePrefix = sitePrefix;
        }
    	@AuraEnabled public String licenseType {get; set;}

		@AuraEnabled public List<dx_cmpNavigation__mdt> navigationModel {get; set;}

        @AuraEnabled public Boolean isApplication {get; set;}

        @AuraEnabled public String recordType {get; set;}

        @AuraEnabled public String sitePrefix {get; set;}
    }
}