public with sharing class DX_CreateRenewalApplication {

    //Methods for dx_CreateRenewalApplication
    @AuraEnabled
    public static ApplicationRenewalInit createRenewalApp(Id recordId){
        Savepoint sp = Database.setSavepoint();
        try{

            Boolean isApplication = false;
            Id devRecordTypeId = Schema.SObjectType.MUSW__Application2__c.getRecordTypeInfosByName().get('Renewal Application').getRecordTypeId();
			MUSW__Application2__c app = DX_Utils.CreateAppFromLicense(recordId);
            app.abd_Application_Type__c ='License Renewal';
            app.recordTypeId=devRecordTypeId;
            app.name='System Number';
            app.MUSW__Status__c='Pending';
            app.abd_Portal_Processed__c = true;

            app.abd_Effective_Date__c = app.abd_Effective_End_Date_of_Current_Lic__c.addDays(1);
            insert app;

            Integer numberofAnswers = DX_Utils.BuildEmptyAnswers(app.id, app.abd_Application_Type__c, app.abd_PortalWork_LicenseType__c);

            // Get Contact and Account info
            list<Contact> cl = [Select FirstName, LastName, Email, Phone from Contact where Id = :App.MUSW__Applicant__c];

            Contact licenseContact = new Contact();
            if (cl.size() > 0)
                licenseContact = cl[0];

            Account licenseAccount = new Account();
            list<Account> al = [Select Phone, abd_Account_Email_Address__c, Website, abd_Twitter__c, abd_Facebook__c, Business_Type__c, BillingStreet, BillingCity, BillingState, BillingPostalCode, BillingCountry from Account where Id = :App.MUSW__Account__c];
            if (al.size() > 0)
                licenseAccount = al[0];

            //
            //  OPTIONAL PERMITS/PRIVILEGE RETRIEVAL 
            //
            //

            // Get the related license
            list<MUSW__License2__c> relatedLicenses  = DX_Utils.GetRelatedLicenses(recordId);
            // get the list of license types that are valid for this primary license.
            list<abd_License_Types__c> possibleLicenseList = DX_Utils.GetQualifiedLicenseTypes(app.abd_Length__c);
            list<abd_License_Application__c> optionalLicenses = new list<abd_License_Application__c>(); // Already selected as "desired" for this license.

            // For a Renewal - all optional licenses - whether just added or brought over from the prior license 
            // appear as a selected license in the optional section.

            set<String> selectedLicTypes = new set<String>();
            for (integer i = 0; i < optionalLicenses.size(); i++) {                 // This is empty for now, on a return trip, we'll have data
                selectedLicTypes.add(optionalLicenses[i].abd_License_Type__c);
            }
            for (integer i = 0; i < relatedLicenses.size(); i++) {
                selectedLicTypes.add(relatedLicenses[i].abd_License_Type__c);
            }

      
            abd_License_Types__c primary = new abd_License_Types__c();
            map<string,abd_License_Types__c> lmap = new map<string,abd_License_Types__c>();

            // start to build out the licenseTypes structure to return 
            DX_Utils.LicenseTypeStructure licTypeStruct = new DX_Utils.LicenseTypeStructure(primary);

            // first build a map of the license type records and copy the primary value over.
            for(abd_License_Types__c ltype:possibleLicenseList){
                lmap.put(ltype.abd_License_Type__c,ltype);
                // Quick check for the primary license type record
                if(app.abd_PortalWork_LicenseType__c == ltype.abd_License_Type__c)
                    primary = ltype;   
            }


            // get the list of optionals - should have all mandatory and most included license types
            string opt = primary.Optional_Add_On_Privileges__c;
            if(app.abd_Length__c=='12 months'){
                opt+=(';'+primary.Optional_12Mo_Add_Ons_Privileges__c); 
            }else{
                opt+=(';'+primary.Optional_Not_12Mo_Add_Ons_Privileges__c);
            }


            if(opt!=null){
                for(string s:opt.split(';')){
                    // no blanks, must exist in the list of valid choices and not already exist
                    if(s != '' && lmap.containsKey(s)) {
                        if (s == 'WBN' && (selectedLicTypes.contains('WB') || selectedLicTypes.contains('WCN')))
                            continue;
                        if ((s == 'WB' || s == 'WCN') && selectedLicTypes.contains('WBN'))
                            continue;
                        Boolean selected = selectedLicTypes.contains(s);
                        if (lmap.get(s).Type_Of_Add_On__c == 'Sublicense' || lmap.get(s).Type_Of_Add_On__c == 'Permit')
                                licTypeStruct.optionalSLP.add(new DX_Utils.LicenseType(selected,false,isApplication,lmap.get(s)));   
                        else if (lmap.get(s).Type_Of_Add_On__c == 'Privilege') 
                                licTypeStruct.optionalPrv.add(new DX_Utils.LicenseType(selected,false,isApplication,lmap.get(s)));   
                    }
                }
            }

            // On the original license request, the user could have dropped an "Included" option (like sunday sales).
            // Since they may want to add it in again, we have to show these again.
            if(primary.Included_Add_On_Privileges__c!=null){
                for(string s:primary.Included_Add_On_Privileges__c.split(';')){
                    if(s!='' && lmap.containsKey(s) && !selectedLicTypes.contains(s))
                        if (lmap.get(s).Type_Of_Add_On__c == 'Sublicense' || lmap.get(s).Type_Of_Add_On__c == 'Permit')
                            licTypeStruct.optionalSLP.add(new DX_Utils.LicenseType(true,false,isApplication,lmap.get(s)));   
                        else if (lmap.get(s).Type_Of_Add_On__c == 'Privilege') 
                            licTypeStruct.optionalPrv.add(new DX_Utils.LicenseType(true,false,isApplication,lmap.get(s)));   

                }
            }
            if (primary.Included_Not_12Mo_Add_Ons_Privileges__c != null && (app.abd_Length__c !='12 months')) {
             for(string s:primary.Included_Not_12Mo_Add_Ons_Privileges__c.split(';')){
                    if(s!='' && lmap.containsKey(s) && !selectedLicTypes.contains(s))
                        if (lmap.get(s).Type_Of_Add_On__c == 'Sublicense' || lmap.get(s).Type_Of_Add_On__c == 'Permit')
                            licTypeStruct.optionalSLP.add(new DX_Utils.LicenseType(true,false,isApplication,lmap.get(s)));   
                        else if (lmap.get(s).Type_Of_Add_On__c == 'Privilege') 
                            licTypeStruct.optionalPrv.add(new DX_Utils.LicenseType(true,false,isApplication,lmap.get(s)));   

                }   
            }

            //
            //  OWNER RETRIEVAL 
            //
            list<Application_Contact__c> ownerlist = [Select Id, Business_Name__c, First_Name__c, Last_Name__c, Application__c, License__c, 
                                                      Address__c, City__c, State__c, Zip_Code__c
                                                      from Application_Contact__c where License__c = :recordId];
            list<Application_Contact__c> ownerSelectList = new list<Application_Contact__c>();
            for (Application_Contact__c ac: ownerlist) {
                if (ac.Business_Name__c == null)  {
                    Application_Contact__c temp_ac = ac.clone(false, true);
                    temp_ac.Application__c = app.Id;
                    temp_ac.License__c = null;
                    ownerSelectList.add(temp_ac);
                }
            }
            insert ownerSelectList;


            // I think we're all done, so let's build the container object to pass back to JS
            return new ApplicationRenewalInit (app, licTypeStruct, ownerSelectList, licenseContact, licenseAccount);



        }catch (Exception ex) {
            system.debug(ex);
            Database.rollback(sp);
            throw new AuraHandledException (ex.getMessage() + ex.getStackTraceString());
        }
    }

    // We need to write out the application, and all of the application contact records
    @AuraEnabled
    public static void updateRenewalApp(String appblockStr){
        Savepoint sp = Database.setSavepoint();
        try {
            ApplicationRenewalInit appblock = (ApplicationRenewalInit) JSON.deserialize(appblockStr, ApplicationRenewalInit.Class);

            System.debug('Block ' + appblock);
            System.debug('App '  + appblock.app);
            System.debug('Contact ' + appblock.licenseContact);
            System.debug('Account ' + appblock.licenseAccount);
            System.debug('owners ' + appblock.ownerlist);

            MUSW__Application2__c app = appblock.app;
            list<Application_Contact__c> appConList = appblock.ownerlist;
            Contact con = appblock.licenseContact;
            Account acc = appblock.licenseAccount;

            update acc;
            update con;
            update app;
            update appConList;

        }catch (Exception ex) {
            system.debug(ex);
            Database.rollback(sp);
            throw new AuraHandledException (ex.getMessage() + ex.getStackTraceString());
        }
    }


    // Just call the common code routine.
    @AuraEnabled
    public static string getFeeSchedule(String appInfo) {
        return DX_Utils.getFeeSchedule(appInfo);
    }


    // Here's the block we pass back and forth with the Javascript controller.
    public class ApplicationRenewalInit{

        @AuraEnabled public MUSW__Application2__c app {get;set;}
        @AuraEnabled public DX_Utils.LicenseTypeStructure licTypeList {get;set;}
        @AuraEnabled public list<Application_Contact__c> ownerlist {get;set;}
        @AuraEnabled public Contact licenseContact {get;set;}
        @AuraEnabled public Account licenseAccount {get;set;}
        // @AuraEnabled public list<String> ownerSelectList {get;set;}


        public ApplicationRenewalInit(MUSW__Application2__c app, DX_Utils.LicenseTypeStructure licTypeList, 
                                    list<Application_Contact__c> ownerlist, Contact licenseContact, Account licenseAccount) {
                                    // list<String> ownerSelectList) {
            this.app = app;        // a license object to return
            this.licTypeList = licTypeList;
            this.ownerlist = ownerlist;
            this.licenseContact = licenseContact;
            this.licenseAccount = licenseAccount;
            // this.ownerSelectList = ownerSelectList;
        }
    }

}