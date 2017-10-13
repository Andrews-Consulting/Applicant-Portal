public without sharing class DX_PremiseForm {
    // This routine is used by the premise form and the update premise form 


    static String notAnswered = '--None--';

    // get the values from the Account record.  First we have to get the Account record id from the user record of the current user.
    // If we don't get anything back on the first SOQL, then the user is not logged on.  We're going to assume that they timed out, since
    // this should have been executed from an authorized page.
    @AuraEnabled
    public static MUSW__Application2__c getApplication(String objectId){
        
        User u = [Select ContactId From User Where Id = :UserInfo.getUserId()];
        // if this fails (user timed out), then we need to 
        //if (u == (User)null || u.ContactId == null) return new MUSW__Application2__c();
        if (objectId.left(3) == Schema.SObjectType.MUSW__Application2__c.getKeyPrefix()) {
            list<MUSW__Application2__c> app =  [Select Id,Name,abd_Premise_Address__c,abd_Premise_City__c,abd_Premise_State__c,
                abd_Premise_Zip_Code__c,abd_Premise_County__c,Premises_Type__c,abd_Temporary_or_Permanent__c,
                abd_Effective_Date__c,abd_Effective_End_Date__c,abd_Local_Authority__c,abd_Square_Footage__c,
                abd_Outdoor_Service_Area_Boundary_Info__c,Primary_Lic_Type__c,
                abd_Outdoor_Service_Endorsement__c,abd_Start_Time__c,
                abd_End_Time__c,abd_Use_Mailing__c,abd_DBA__c,abd_Premise_Address_2__c, abd_Local_Authority_Type__c,
                CreatedDate, abd_Charity_Business_Type__c, 
                (select id, abd_License_Type__c from License_Applications__r)
                from MUSW__Application2__c 
                where Id = :objectId
                order by Id DESC limit 1];
            if (app.size() == 0) throw new AuraHandledException('No records returned from Get Application in DX_PremiseForm Apex');
            return app[0];
        }
        else if (objectId.left(3) == Schema.SObjectType.MUSW__License2__c.getKeyPrefix()) {
            return DX_Utils.CreateAppFromLicense(objectId);
        }
        // Safety code we should never hit.
        return new MUSW__Application2__c();       
    }

    @AuraEnabled
    public static list<Account> getLocalAuthority(string county,string city){
        list<Account> temp = new list<Account>();
        string cityname = 'City of '+city;
        string countyname = 'County of '+county;
        for(Account a:[Select Id, Name,Phone from Account where Type='Local Authority' and (Name =:cityname or Name =:countyname) order by Name]){
            temp.add(a);    
        } 
        return temp;
    }

    @AuraEnabled
    public static map<string,PortalFieldCfg__c> getFieldRequirements(string[] objs){
        map<string,PortalFieldCfg__c> temp = new map<string,PortalFieldCfg__c>();
        
        for(PortalFieldCfg__c p:[Select Id, FieldName__c,ObjectName__c,isRequired__c from PortalFieldCfg__c where ObjectName__c IN:objs]){
            temp.put(p.FieldName__c,p); 
        } 
        return temp;
    }
    // get the values from the Account record.  First we have to get the Account record id from the user record of the current user.
    // If we don't get anything back on the first SOQL, then the user is not logged on.  We're going to assume that they timed out, since
    // this should have been executed from an authorized page.
    @AuraEnabled
    public static Account getAccount(Id appId){
        
        User u = [Select Contact.AccountId From User Where Id = :UserInfo.getUserId()];
        // if this fails (user timed out), then we need to 
        //if (u == (User)null || u.ContactId == null || u.Contact.AccountId == null) return new Account();

        list<Account> a = [Select BillingStreet,BillingCity,BillingState,BillingPostalCode from Account 
                    where Id in (Select MUSW__Account__c from MUSW__Application2__c where Id = :appId) limit 1];

        if (a.size() > 0) return a[0];
        return new Account();
    }
    // Get the list of values for the picklist field and pass them back to the lightning component.
    // Add the -- not answered-- choice as the first value.  If we move to radial buttons, this can all change.
    @AuraEnabled
    public static map<string,string[]> getPicklistValues(){
        map<string,string[]> pickVals = new map<string,string[]>();

        // list of the states
        string[] options = new string[]{};
        Schema.DescribeFieldResult fieldResult = MUSW__Application2__c.abd_Premise_State__c.getDescribe();
        List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
            options.add(notAnswered);
        for (Schema.PicklistEntry f: ple) {
            options.add(f.getLabel());
        }
        pickVals.put('state',options);

        // list of the premises type
        options = new List<String>();
        fieldResult = MUSW__Application2__c.Premises_Type__c.getDescribe();
        ple = fieldResult.getPicklistValues();
            options.add(notAnswered);
        for (Schema.PicklistEntry f: ple) {
            options.add(f.getLabel());
        }
        pickVals.put('pType',options);

        // list of counties
        options = new List<String>();
        fieldResult = MUSW__Application2__c.abd_Premise_County__c.getDescribe();
        ple = fieldResult.getPicklistValues();
            options.add(notAnswered);
        for (Schema.PicklistEntry f: ple) {
            options.add(f.getLabel());
        }
        pickVals.put('county',options);

        // list of times for the auction
        options = new List<String>();
        fieldResult = MUSW__Application2__c.abd_Start_Time__c.getDescribe();
        ple = fieldResult.getPicklistValues();
            options.add(notAnswered);
        for (Schema.PicklistEntry f: ple) {
            options.add(f.getLabel());
        }
        pickVals.put('time',options);

        // list of the charity business types (for the auction)
        options = new List<String>();
        fieldResult = MUSW__Application2__c.abd_Charity_Business_Type__c.getDescribe();
        ple = fieldResult.getPicklistValues();
            options.add(notAnswered);
        for (Schema.PicklistEntry f: ple) {
            options.add(f.getLabel());
        }
        pickVals.put('cbType',options);

        return pickVals;
    }

    // Update the record - called from Lightning component.  The lightning component handles the validation now. 

    @AuraEnabled
    public static String upRecordApex(MUSW__Application2__c application){
        
        try{
            list<Account> ac;
            String dQuery;
            // If the state is the Local Authority, then find the account id and set it for the user.
            if (application.abd_Local_Authority_Type__c == 'State') {
                ac = [Select Id from Account where LocalAuthorityIsState__c = true];
                if (ac.size() > 0) {
                    application.abd_Local_Authority__c = ac[0].id;    
                }
            }
            else if (application.abd_Local_Authority_Type__c == 'City') {
                System.debug('query is Select Id from Account where type = "Local Authority" and name like "City of% ' + application.abd_Premise_City__c);
                dQuery = 'Select Id from Account where type = \'Local Authority\' and name like \'City of%' + application.abd_Premise_City__c + '\''; 
                ac = database.query(dQuery);
                if (ac.size() > 0) {
                    application.abd_Local_Authority__c = ac[0].id;    
                }
            }
            else if (application.abd_Local_Authority_Type__c == 'County') {
                System.debug('query is Select Id from Account where type = "Local Authority" and name like "County of% ' + application.abd_Premise_County__c);
                dQuery = 'Select Id from Account where type = \'Local Authority\' and name like \'County of%' + application.abd_Premise_County__c + '\''; 
                ac = Database.query(dQuery);
                if (ac.size() > 0) {
                    application.abd_Local_Authority__c = ac[0].id;    
                }
            }
           
            update application;

            // if the local authority is specified, then align the local authority type on the licenses and the applications.
            if (application.abd_Local_Authority_Type__c != null) {

                list<MUSW__License2__c> ll = new list<MUSW__License2__c>();
                for(abd_License_Application__c la: [Select abd_License__c from abd_License_Application__c where abd_Application__c=:application.Id
                                                    and abd_License__r.abd_Local_Authority_Type__c!=:application.abd_Local_Authority_Type__c]){
                    ll.add(new MUSW__License2__c(Id=la.abd_License__c,abd_Local_Authority_Type__c=application.abd_Local_Authority_Type__c));    
                }
                if(ll.size()>0)
                    update ll;
            }
        }catch(exception ex){
            return ex.getMessage();
        }
        
        return 'Update Successful';
    }    


    // FOR THE UPDATE PREMISE application
    @AuraEnabled
    public static UpdatePremiseApplication createApplicationfromLicense(ID licenseId) {
        try {
            User u = [Select ContactId From User Where Id = :UserInfo.getUserId()];
            
            // if this fails (user timed out), then we need to 
            if (u == (User)null || u.ContactId == null) return new UpdatePremiseApplication(null, null,null);

            MUSW__Application2__c application = DX_Utils.CreateAppFromLicense(licenseId);
            MUSW__License2__c license = DX_Utils.GetLicenseDates(licenseId);
            list<String> licenseTypeList = DX_Utils.AllRelatedLicenseTypes(licenseId);

           
            System.debug('UPA lt ' + licenseTypeList);
            UpdatePremiseApplication upa = new UpdatePremiseApplication(application, licenseTypeList, license);
            // Create and populate application object and the list of related licensetypes.  NOTE THIS DOES NOT HAVE AN ID YET.
            return upa;

        }catch (exception ex) {
            throw new AuraHandledException(ex.getLineNumber() + ex.getMessage() + ex.getTypeName());
        }
    }   



    // Update the record - called from Lightning component.  The lightning component handles the validation now. 
    @AuraEnabled
    public static String CreateApplication(MUSW__Application2__c application) {
        try{
            // Set the record Type of the application
            application.MUSW__Status__c = 'Pending';
            application.name='System Number';
            application.abd_Application_Type__c = 'Premises Update';
            application.abd_Portal_Processed__c = true;
            application.RecordTypeId = Schema.SObjectType.MUSW__Application2__c.getRecordTypeInfosByName().get('Premises Update Application').getRecordTypeId();
    
            insert application;
        }catch(exception ex){
            throw new AuraHandledException(ex.getLineNumber() + ex.getMessage() + ex.getTypeName());
        }

        return application.Id;
    }    


    // class to return to lightning for the create new application process
    public class UpdatePremiseApplication {
        
        @AuraEnabled MUSW__Application2__c app {get;set;}  
        @AuraEnabled MUSW__License2__c license {get;set;} 
        @AuraEnabled list<String> lTypes {get; set;} 

        public UpdatePremiseApplication (MUSW__Application2__c a, list<String> lt, MUSW__License2__c lic) {
            this.app = a;
            this.lTypes = lt;
            this.license = lic;
        }
    }
    //Methods for dx_AdditionalLocation
    @AuraEnabled
    public static MUSW__License2__c getLicense(Id licenseId){
        
        return [Select abd_License_Type__c, MUSW__Primary_Licensee__c, MUSW__Applicant__c, abd_Effective_Date__c,abd_Effective_End_Date__c,
                        abd_Local_Authority_Type__c, abd_Premise_City__c, abd_Premise_County__c,  abd_Length__c, 
                (Select abd_License_Type__c From Licenses__r where abd_Active_Status__c=true) 
                From MUSW__License2__c 
                where id = :licenseId];
    }
    // @AuraEnabled
 //    public static string createAddApp(MUSW__Application2__c application, MUSW__License2__c license){
 //        Savepoint sp = Database.setSavepoint();
 //        try{
 //         Id devRecordTypeId = Schema.SObjectType.MUSW__Application2__c.getRecordTypeInfosByName().get('Additional Locations Application').getRecordTypeId();
 //            User u = [Select ContactId From User Where Id = :UserInfo.getUserId()];
 //            if(u.ContactId==null){
 //                return 'The logged in User does not have an Applicant record';
 //            }
 //            system.debug(application);
 //            system.debug(devRecordTypeId);
 //            system.debug(license);
            
 //            application.abd_Application_Type__c ='Additional Locations';
 //            application.recordTypeId=devRecordTypeId;
 //            application.MUSW__Account__c=license.MUSW__Primary_Licensee__c;  // DRE replaces it.
 //            application.MUSW__Applicant__c=license.MUSW__Applicant__c;
 //            application.name='System Number';
 //            application.MUSW__Status__c='Pending';
 //            application.abd_Primary_License__c=license.Id;
 //            application.abd_Portal_Processed__c = true;
    //      system.debug(application);
 //            insert application;
 //            return 'SUCCESS: ' + String.valueOf(application.Id);
 //        }catch (Exception ex) {
 //         system.debug(ex.getMessage());
 //            Database.rollback(sp);
 //         return ex.getMessage();
 //        }
 //    }
    
    //Methods for dx_KegRegistration
    @AuraEnabled
    public static MUSW__Application2__c createKegApp(Id licenseId){
        try{
	        MUSW__Application2__c application = DX_Utils.CreateAppFromLicense(licenseId);
	        application.abd_Application_Type__c ='Keg Registration';
	        application.recordTypeId = Schema.SObjectType.MUSW__Application2__c.getRecordTypeInfosByName().get('Keg Registration').getRecordTypeId();
	        application.MUSW__Status__c = 'Pending';
	        application.abd_Number_of_Booklets__c = 1;
	        application.abd_portal_processed__c = true;
		    return application;
        }catch (Exception ex) {
            throw new AuraHandledException (ex.getMessage());
            return null;
        }
    }
    
    //Methods for dx_KegRegistration
    @AuraEnabled
    public static string saveKegApp(MUSW__Application2__c application){
        Savepoint sp = Database.setSavepoint();
        try{
        	system.debug(application);
            insert application;
            return 'SUCCESS: ' + String.valueOf(application.Id);
        }catch (Exception ex) {
            system.debug(ex.getMessage());
            Database.rollback(sp);
            throw new AuraHandledException (ex.getMessage());
            return null;
        }
    }
    //Methods for dx_LabelApproval
    @AuraEnabled
    public static string createLabelApp(MUSW__Application2__c application, Id licenseId){
        Savepoint sp = Database.setSavepoint();
        try{
            MUSW__License2__c license = getLicense(licenseId);
            Id devRecordTypeId = Schema.SObjectType.MUSW__Application2__c.getRecordTypeInfosByName().get('Label Approval').getRecordTypeId();
            User u = [Select ContactId From User Where Id = :UserInfo.getUserId()];
            if(u.ContactId==null){
                throw new AuraHandledException ('It looks like you are no longer logged in to the system.  Unable to save the information');
                return null;
            }
            
            application.abd_Application_Type__c ='Label Approval';
            application.recordTypeId=devRecordTypeId;
            application.MUSW__Account__c=license.MUSW__Primary_Licensee__c;
            application.MUSW__Applicant__c=license.MUSW__Applicant__c;
            application.name='System Number';
            application.MUSW__Status__c='Pending';
            application.abd_Primary_License__c=license.Id;
            application.abd_Portal_Processed__c = true;
            application.abd_Length__c=license.abd_Length__c;
            insert application;
            return 'SUCCESS: ' + String.valueOf(application.Id);
        }catch (Exception ex) {
            system.debug(ex.getMessage());
            Database.rollback(sp);
            return ex.getMessage();
        }
    }
    
    //Methods for dx_TransferLicense
   //  @AuraEnabled
   //  public static string createTransferApp(MUSW__Application2__c application, MUSW__License2__c license){
   //      Savepoint sp = Database.setSavepoint();
   //      try{
   //       Id devRecordTypeId = Schema.SObjectType.MUSW__Application2__c.getRecordTypeInfosByName().get('Transfer of License/Permit Application').getRecordTypeId();
   //          User u = [Select ContactId From User Where Id = :UserInfo.getUserId()];
   //          if(u.ContactId==null){
   //              return 'The logged in User does not have an Applicant record';
   //          }
            
   //          application.abd_Application_Type__c ='Transfer License';
   //          application.recordTypeId=devRecordTypeId;
   //          application.MUSW__Account__c=license.MUSW__Primary_Licensee__c;
   //          application.MUSW__Applicant__c=license.MUSW__Applicant__c;
   //          application.name='System Number';
   //          application.MUSW__Status__c='Pending';
   //          application.abd_Primary_License__c=license.Id;
   //          application.abd_Portal_Processed__c = true;
            
   //          application.abd_Length__c=license.abd_Length__c;
            // insert application;
   //          return 'SUCCESS: ' + String.valueOf(application.Id);
   //      }catch (Exception ex) {
   //       system.debug(ex.getMessage());
   //          Database.rollback(sp);
   //       return ex.getMessage();
   //      }
   //  }
}