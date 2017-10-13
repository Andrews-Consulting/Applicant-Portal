public without sharing class DX_Utils {

    // Passing in the key of any object, this routine returns the name from the record (could be from Name or DeveloperName field)

    public static string GetNamefromRecordID(String sourceID){
        if (sourceID == null || sourceID == '') return String.valueOf(-1);          // missing the Id
        if (sourceID.length() < 15) return String.valueOf(-2);      // invalid ID 

        // We need to resolve the name of the field to request and the object to request
        String idPrefix = sourceID.left(3);
        String objectName = ''; 
        Map<String,Schema.SObjectField> fieldMap;
        //Get schema information
        Map<String, Schema.SObjectType> gd =  Schema.getGlobalDescribe(); 
         
        //Loop through all the sObject types returned by Schema
        for(Schema.SObjectType stype : gd.values()){
            Schema.DescribeSObjectResult r = stype.getDescribe();
            String prefix = r.getKeyPrefix();
             
            //Check if the prefix matches with requested prefix
            if(prefix!=null && prefix.equals(idPrefix)){
                objectName = r.getLocalName();
                fieldMap = r.fields.getMap();
                break;
                }
            }

        if (objectName == '') return String.valueOf(-3);            // hmm couldn't find an object for the ID prefix.
        //  At this point, objectname is set and fieldmap has a list of the fields in the object.
        //  let's look for a "developername" and if that's not there, we'll use name.

        String keyName = '';
        //system.debug('SourceID = ' + sourceID);
        if (fieldmap.containsKey('DeveloperName')) {
            String sq = 'Select DeveloperName from ' + objectName + ' where ID = \'' + sourceID + '\' Limit 1 ';
            //System.debug(sq);
            List<sObject> sobjList = Database.query(sq);
            if (sobjList != null) keyName = (String)sobjList[0].get('DeveloperName');
            }
        else {
            String sq = 'Select Name from ' + objectName + ' where ID = \'' + sourceID + '\' Limit 1 ';
            //System.debug(sq);
            List<sObject> sobjList = Database.query(sq);
            if (sobjList != null) keyName = (String)sobjList[0].get('Name');
            }

        return keyName; 
    }

    // read a license and create an application record from the license record.
    // used for creating new applications from existing licenses.
    public static MUSW__Application2__c CreateAppFromLicense(ID licenseId) {

        list<MUSW__License2__c> activeLicense = [Select 
                                            abd_dram_shop__c, abd_effective_date__c, abd_effective_end_date__c, abd_length__c, abd_local_authority__c,
                                            abd_premise_address_2__c, abd_premise_address__c, abd_premise_city__c, abd_premise_state__c, abd_premise_zip__c,
                                            abd_primary_contact__c, abd_square_footage__c, musw__applicant__c, musw__primary__c, musw__primary_licensee__c,
                                            abd_application_id__c, abd_dram_policy_number__c, abd_dram_policy_effective_date__c, abd_dram_policy_expiration_date__c,
                                            abd_outdoor_service_endorsement__c, abd_premise_county__c, abd_city_population__c, abd_county_population__c,
                                            //abd_time_of_auction_beginning__c, abd_time_of_auction_ending__c, 
                                            abd_business_name__c, abd_dba__c,
                                            abd_business_operations__c, abd_business_type__c, abd_local_authority_is_state__c, abd_bond_number__c,
                                            abd_bond_company__c, bond_effective_date__c, abd_temporary_or_permanent__c, abd_premise_from__c, abd_premise_to__c,
                                            abd_primary_license__c, abd_continuous_until_cancelled__c, abd_square_footage_retail_area__c, abd_premises_type__c,
                                            abd_Other_Criteria__c, abd_License_Type__c from MUSW__License2__c where ID = :licenseId];

        if (activeLicense.size() <= 0) {
            throw new AuraHandledException('DX_Utils.CreateAppFromLicense was unable to find a license with the ID of ' + licenseId);

        }
        MUSW__Application2__c newApp = new MUSW__Application2__c();

        newApp.abd_DRAM_shop__c = activeLicense[0].abd_DRAM_Shop__c;
        newApp.abd_Effective_Date_of_Current_License__c = activeLicense[0].abd_Effective_Date__c;
        newApp.abd_Effective_End_Date_of_Current_Lic__c = activeLicense[0].abd_Effective_End_Date__c;
        newApp.abd_Length__c = activeLicense[0].abd_Length__c;
        newApp.abd_Local_Authority__c  = activeLicense[0].abd_Local_Authority__c;
        newApp.abd_Premise_Address_2__c = activeLicense[0].abd_Premise_Address_2__c;
        newApp.abd_Premise_Address__c = activeLicense[0].abd_Premise_Address__c;
        newApp.abd_Premise_City__c = activeLicense[0].abd_Premise_City__c;
        newApp.abd_Premise_State__c = activeLicense[0].abd_Premise_State__c;
        newApp.abd_Premise_Zip_Code__c = activeLicense[0].abd_Premise_Zip__c;
        newApp.abd_Primary_Contact__c = activeLicense[0].abd_Primary_Contact__c;
        newApp.abd_Square_Footage__c = activeLicense[0].abd_Square_Footage__c;
        newApp.MUSW__Applicant__c = activeLicense[0].MUSW__Applicant__c;
        newApp.MUSW__Account__c = activeLicense[0].MUSW__Primary_Licensee__c;
        newApp.abd_DRAM_Policy_Number__c = activeLicense[0].abd_DRAM_Policy_Number__c;
        newApp.abd_DRAM_Policy_Effective_Date__c = activeLicense[0].abd_DRAM_Policy_Effective_Date__c;
        newApp.abd_DRAM_Policy_Expiration_Date__c = activeLicense[0].abd_DRAM_Policy_Expiration_Date__c;
        newApp.abd_Outdoor_Service_Endorsement__c = activeLicense[0].abd_Outdoor_Service_Endorsement__c;
        newApp.abd_Premise_County__c = activeLicense[0].abd_Premise_County__c;
        newApp.abd_City_Population__c = activeLicense[0].abd_City_Population__c;
        newApp.abd_County_Population__c = activeLicense[0].abd_County_Population__c;
        newApp.abd_Business_Name__c = activeLicense[0].abd_Business_Name__c;
        newApp.abd_DBA__c = activeLicense[0].abd_DBA__c;
        newApp.abd_Business_Operations__c = activeLicense[0].abd_Business_Operations__c;
        newApp.abd_Business_Type__c = activeLicense[0].abd_Business_Type__c;
        newApp.abd_Local_Authority_is_State__c = activeLicense[0].abd_Local_Authority_is_State__c;
        newApp.abd_Bond_Number__c = activeLicense[0].abd_Bond_Number__c;
        newApp.abd_Bond_Company__c = activeLicense[0].abd_Bond_Company__c;
        newApp.abd_Bond_Effective_Date__c = activeLicense[0].Bond_Effective_Date__c;
        newApp.abd_Temporary_or_Permanent__c = activeLicense[0].abd_Temporary_or_Permanent__c;
        newApp.abd_Premise_From__c = activeLicense[0].abd_Premise_From__c;
        newApp.abd_Premise_To__c = activeLicense[0].abd_Premise_To__c;
//      newApp.abd_Primary_License__c = activeLicense[0].abd_Primary_License__c;
        newApp.ABD_Continuous_Until_Cancelled__c = activeLicense[0].ABD_Continuous_Until_Cancelled__c;
        newApp.Square_Footage_Retail_Area__c = activeLicense[0].abd_Square_Footage_Retail_Area__c;
        newApp.Premises_Type__c = activeLicense[0].abd_Premises_Type__c;
        newApp.abd_Other_Criteria__c  = activeLicense[0].abd_Other_Criteria__c;
        newApp.abd_Primary_License__c = activeLicense[0].Id;
        newApp.abd_PortalWork_LicenseType__c = activeLicense[0].abd_License_Type__c;
        newApp.abd_PortalWork_PsuedoApp__c = true;
        newApp.abd_Temporary_or_Permanent__c = 'Permanent';
        newApp.abd_DBA__c = activeLicense[0].abd_dba__c;
        newApp.abd_Business_Name__c = activeLicense[0].abd_business_name__c;


        newApp.recalculateFormulas();       // only recalculates formulas build on internal object fields (no cross object fields)

// These are the formulas which are empty (when I wrote this)
// newApp.abd_PortalWork_LicenseType__c
// newApp.abd_Business_Entity_Type_f__c
// newApp.abd_Calendar_Days__c
// newApp.Issue_Number__c
// newApp.abd_Number_for_Communication__c
// newApp.abd_Display_Premise_Address__c
// newApp.abd_Display_Premise_Zip_Code__c
// newApp.abd_Prorate_Percent__c
// newApp.MUSW__Total_Balance__c


        return newApp;
    }

    // return all of the license records that point to a specified primary license
    public static list<MUSW__License2__c> GetRelatedLicenses(ID licenseId) {
           
        list<MUSW__License2__c> relatedLicenses = [Select Id, abd_License_Type__c From MUSW__License2__c 
                            where abd_Active_Status__c=true and abd_Primary_License__c = :licenseId];

        return relatedLicenses;
    }

    // this returns a list of the related license types that are active based upon the dates of the licenses - 
    // TODO: why isn't the active flag sufficient for this as well?
    public static list<String> AllRelatedLicenseTypes(ID licenseId) {

        list<String> lt = new list<String>();

        list<MUSW__License2__c> q = [Select abd_License_Type__c, abd_effective_date__c, abd_effective_end_date__c from MUSW__License2__c where Id = :licenseId];

        if (q.size() > 0) {
            if ((q[0].abd_effective_date__c != null && q[0].abd_effective_date__c <= System.today()) || q[0].abd_effective_date__c == null)
                if ((q[0].abd_effective_end_date__c != null && q[0].abd_effective_end_date__c >= System.today()) || q[0].abd_effective_end_date__c == null)
                    lt.add(q[0].abd_License_Type__c);
        }

        for (MUSW__License2__c r : [Select abd_License_Type__c, abd_effective_date__c, abd_effective_end_date__c from MUSW__License2__c where abd_Primary_License__r.Id = :licenseId]) {
            if ((r.abd_effective_date__c != null && r.abd_effective_date__c <= System.today()) || r.abd_effective_date__c == null)
                if ((r.abd_effective_end_date__c != null && r.abd_effective_end_date__c >= System.today()) || r.abd_effective_end_date__c == null)
                    lt.add(r.abd_License_Type__c);
        }
        return lt;
    }

    //
    // return the list of qualified license types that match the length.
    //
        public static list<abd_License_Types__c> GetQualifiedLicenseTypes(String termLength) {

            // So we have a license and all of the related license records.  Let's go get a list of what is available
            list<abd_License_Types__c> possibleLicList = [Select Id,abd_Class__c,abd_License_Type__c,Included_Add_On_Privileges__c, 
                                                          Included_Not_12Mo_Add_Ons_Privileges__c, Mandatory_Add_On_Privileges__c,
                                                          Optional_12Mo_Add_Ons_Privileges__c,Optional_Not_12Mo_Add_Ons_Privileges__c,
                                                          Optional_Add_On_Privileges__c, Available_Term_Lengths__c, PremisesMustBeIowa__c, 
                                                          Does_Not_Allow__c,Type_Of_Add_On__c from abd_License_Types__c 
                                                          where Available_Term_Lengths__c includes(:termLength)];

            // If this is empty, then there's a real problem with the configuration
            if (possibleLicList.size() <= 0) {
                throw new AuraHandledException('Unable to find any license types with a term of ' + termLength);
            }
            return possibleLicList;
    }

    // return the list of qualified Add on license types that match the length 
    //   Be careful - This doesn't return the primary license which is needed in many screens.
        public static list<abd_License_Types__c> GetQualifiedAddOnLicenseTypes(String termLength) {

            // So we have a license and all of the related license records.  Let's go get a list of what is available
            list<abd_License_Types__c> possibleLicList = [Select Id,abd_Class__c,abd_License_Type__c,Included_Add_On_Privileges__c, 
                                                          Included_Not_12Mo_Add_Ons_Privileges__c, Mandatory_Add_On_Privileges__c,
                                                          Optional_12Mo_Add_Ons_Privileges__c,Optional_Not_12Mo_Add_Ons_Privileges__c,
                                                          Optional_Add_On_Privileges__c, Available_Term_Lengths__c, PremisesMustBeIowa__c, 
                                                          Does_Not_Allow__c,Type_Of_Add_On__c from abd_License_Types__c 
                                                          where Available_Term_Lengths__c includes(:termLength) and Type_Of_Add_On__c != 'NA'];

            // If this is empty, then there's a real problem with the configuration
            if (possibleLicList.size() <= 0) {
                throw new AuraHandledException('Unable to find any license types with a term of ' + termLength);
            }
            return possibleLicList;
    }



    // return back just a couple of the date fields in the license object.  This is used when we want to pass to the browser dates for validation.
    public static MUSW__License2__c GetLicenseDates(Id licenseId) {
        list<MUSW__License2__c> q = [Select abd_License_Type__c, abd_effective_date__c, abd_effective_end_date__c from MUSW__License2__c where Id = :licenseId];
        if (q.size() > 0) return q[0];
        else return new MUSW__License2__c();
    }

    // Calculate the fees for the screen
    @AuraEnabled
    public static string getFeeSchedule(string appInfo){
        System.debug(appInfo);
        try {        
            ApplicationInfo ai = (ApplicationInfo) JSON.deserializeStrict(appInfo,ApplicationInfo.class);

        System.debug(ai);
            system.debug('Fees is processing for ' + ai.selectedLicenseTypes);
            list<abd_Fee_Schedule_Global__c> lfs = new list<abd_Fee_Schedule_Global__c>();
            boolean sunday = ai.selectedLicenseTypes.contains('SS');
            list<String> lTypes = ai.selectedLicenseTypes.trim().split('[ ]+');
            if (sunday)
                lTypes.add(ai.app.abd_PortalWork_LicenseType__c);


    System.debug('ltypes - ' + lTypes + ' source = :' + ai.selectedLicenseTypes + ':');    

            // base query
            String FeeValueQuery = 'Select Name, abd_Total_Fees__c,abd_Sunday_Fees__c,abd_License_Type__c, abd_Multiplier_Field__c from abd_Fee_Schedule_Global__c where abd_Active__c=true ';

            FeeValueQuery += ' and abd_License_Type__c IN :lTypes ';

            String recTypeName = Schema.SObjectType.MUSW__Application2__c.getRecordTypeInfosById().get(ai.app.RecordTypeId).getName();
            System.debug(recTypeName);
            if (recTypeName == 'New Application')
                FeeValueQuery += ' and abd_Application_Type__c includes (\'New License\')';
            else if (recTypeName == 'Renewal Application')
                FeeValueQuery += ' and abd_Application_Type__c includes (\'License Renewal\')';
            else if (recTypeName == 'Dram Carrier Change Application')
                FeeValueQuery += ' and abd_Application_Type__c includes (\'Change DRAM\')';
            else if (recTypeName == 'Transfer of License/Permit Application')
                FeeValueQuery += ' and abd_Application_Type__c includes (\'Transfer License\')';
            else if (recTypeName == 'Premises Update Application')
                FeeValueQuery += ' and abd_Application_Type__c includes (\'Premises Update\')';
            else if (recTypeName == 'Additional Locations Application')
                FeeValueQuery += ' and abd_Application_Type__c includes (\'Additional Locations\')';
            else if (recTypeName == 'Auction Application')
                FeeValueQuery += ' and abd_Application_Type__c includes (\'New License\')';
            else FeeValueQuery += ' and abd_Application_Type__c includes (\'' + recTypeName + '\')';


            // Only use  sqft when we have an LE or BC license
            Decimal sqft = ai.app.abd_Square_Footage__c;
            if (ai.app.abd_Square_Footage__c != null)
            FeeValueQuery += ' and ((abd_Square_Footage_Min__c = null) or (abd_Square_Footage_Min__c <= :sqFt and abd_Square_Footage_Max__c >= :sqFt))';




            // Sunday Sales - lowvalue goes up and down with sunday privilege,
            // Sunday sales are only for BB, BC, BW, LA, LB, LC, LD, WB
            if (sunday)
                FeeValueQuery +=''; 
            else 
                FeeValueQuery +='  and (abd_License_Type__c not in (\'BB\', \'BC\', \'BW\', \'LA\', \'LB\', \'LC\', \'LD\', \'WB\') or (abd_License_Type__c in (\'BB\', \'BC\', \'BW\', \'LA\', \'LB\', \'LC\', \'LD\', \'WB\') and  abd_Sunday_Fees__c=false))';

            if (ai.app.abd_Length__c != null && ai.app.abd_Length__c != '--None--') {
                String licLength = ai.app.abd_Length__c;
                FeeValueQuery += ' and (abd_Length__c includes (:licLength ) or abd_Length__c = null)';
            }

            // These are used once we start processing the fee records.
            Date startDate = ai.app.abd_Effective_Date__c;
            Date endDate = ai.app.abd_Effective_End_Date__c;
            //String tempOrPerm = ai.app.abd_Temporary_or_Permanent__c;
            
            // System.debug(startDate);
            // System.debug(endDate);

            Decimal ls_Fee = 0;
            
            // If we get in here and the dates aren't right, that means that there is an error on the page.
            if (endDate != null && startDate != null) {
                // System.debug(ai.app.abd_Effective_Date__c.daysBetween(ai.app.abd_Effective_End_Date__c) + 1) ;

                // if the end date year is a leap year and the end date is > 2/28 (day 59 of the year), use 366 days
                // if the start date year is a leap year and the start date is <= 2/28, use 366 days

                Decimal numberOfDays = 365;
                if (Date.isLeapYear(ai.app.abd_Effective_End_Date__c.year()) && ai.app.abd_Effective_End_Date__c.dayOfYear() > 59)
                    numberOfDays = 366;
                if (Date.isLeapYear(ai.app.abd_Effective_Date__c.year()) && ai.app.abd_Effective_Date__c.dayOfYear() < 60)
                    numberOfDays = 366;

                // System.debug(' Number of Days ' + numberOfDays);
                // System.debug((ai.app.abd_Effective_Date__c.daysBetween(ai.app.abd_Effective_End_Date__c) + 1) / numberOfDays);
                Decimal prorateAmount = (ai.app.abd_Effective_Date__c.daysBetween(ai.app.abd_Effective_End_Date__c) + 1) / numberOfDays;


                System.debug('Fee Value Query');
                system.debug(FeeValueQuery);
                // Calculate fee with current selections.
               
                for(abd_Fee_Schedule_Global__c ls:Database.query(FeeValueQuery)) {
                    // System.Debug(ls);
                     Decimal totalFee = 0;
                    if (ls.abd_Multiplier_Field__c != null && ai.app.get(ls.abd_Multiplier_Field__c) != null)
                        try {
                        totalFee = Integer.valueOf(ai.app.get(ls.abd_Multiplier_Field__c)) * ls.abd_Total_Fees__c;
                    } catch(Exception e) {
                        totalFee = 0;
                    }   
                    else 
                        totalFee = ls.abd_Total_Fees__c;


                    Decimal tempVal = totalFee * prorateAmount;
                    tempVal = tempVal.setScale(2, RoundingMode.HALF_UP);
                    ls_Fee += tempVal;
                    // System.debug('Rounded prorated amount = ' + tempVal + ' Accumulated total = ' + ls_fee);
                
                }
            }
            // NOT PRORATED CALCULATION
            else {
                System.debug('Fee Value Query');
                system.debug(FeeValueQuery);

                 for(abd_Fee_Schedule_Global__c ls:Database.query(FeeValueQuery)) {
                    Decimal totalFee = 0;
                    if (ls.abd_Multiplier_Field__c != null && ai.app.get(ls.abd_Multiplier_Field__c) != null)
                        try {
                        totalFee = Integer.valueOf(ai.app.get(ls.abd_Multiplier_Field__c)) * ls.abd_Total_Fees__c;
                    } catch(Exception e) {
                        totalFee = 0;
                    }   
                    else 
                        totalFee = ls.abd_Total_Fees__c;
                    ls_Fee += totalFee;
                }
            }

            string retStr = '$ ' + String.valueOf(ls_Fee); 
            System.debug(retStr);
            return retStr;
        }
        catch (Exception ex) {
            throw new AuraHandledException(ex.getMessage() + ex.getStackTraceString());
        }

    }

    // Moved this into the DX Utils so it could run without sharing rules.  These objects are managed and permissions keep getting reset.

    public static Integer BuildEmptyAnswers (Id appId, String applicationType, String  licenseType) {
        // Insert Answer records for this application.
        list<BGCK__Answer__c> answerList = new list<BGCK__Answer__c>();
        Integer numberOfAnswersInserted = 0;

        list<BGCK__Page_Question__c> questionList = [Select Id, BGCK__Question__c, Application_Type__c, License_Type__c from BGCK__Page_Question__c where Application_Type__c includes (:applicationType) and License_Type__c includes (:licenseType)];
                                        // TODO where bgck_checklist_version_status__c = 'Active'
        System.debug('questionlist size = ' + questionList.size());
        if (questionList.size() > 0) {
            for (BGCK__Page_Question__c question: questionList) {
                    BGCK__Answer__c answerItem = new BGCK__Answer__c();
                    answerItem.BGCK__Page_Question__c = question.Id; 
                    answerItem.Name = 'Not Answered Yet'; 
                    answerItem.BGCK__Question__c = question.BGCK__Question__c;
                    answerItem.Application__c = appId;
                    answerList.add(answerItem);
                }
            if (answerList.size() > 0) {
                insert answerList;
                numberOfAnswersInserted = answerList.size();
            }
        }
        return numberOfAnswersInserted;
    }


    public class appFromLicense {
        MUSW__Application2__c app {get; set;}
    }
  

    // This is the stucture to define the possible, categorized licenses types to list on the portal screen.
    public class LicenseTypeStructure{
        
        @AuraEnabled public abd_License_Types__c primary{get;set;}
        @AuraEnabled public list<LicenseType> optionalSLP{get;set;}
        @AuraEnabled public list<LicenseType> optionalPrv{get;set;}
        @AuraEnabled public list<LicenseType> existingSLP{get;set;}
        @AuraEnabled public list<LicenseType> existingPrv{get;set;}

        public LicenseTypeStructure(abd_License_Types__c primary){
            this.primary = primary;
            this.optionalSLP = new list<LicenseType>();
            this.optionalPrv = new list<LicenseType>();
            this.existingSLP = new list<LicenseType>();
            this.existingPrv = new list<LicenseType>();
        }
    }
    

    // Here is the structure to define the license types within a single category (such as included vs optional)
    public class LicenseType{
        
        @AuraEnabled public boolean selected {get;set;}
        @AuraEnabled public boolean hidden {get;set;}
        @AuraEnabled public boolean disabled {get;set;}
        @AuraEnabled public abd_License_Types__c ltype{get;set;}

        public LicenseType(boolean selected, boolean hidden, boolean disabled,  abd_License_Types__c lt){
            this.selected = selected;       // Indicator to include this license.
            this.hidden = hidden;           // 
            this.ltype = lt;
            this.disabled = disabled;
        }
        
    }
    

   public class ApplicationInfo{
        
        public ApplicationInfo(){}
        
        @AuraEnabled
        public string selectedLicenseTypes{get;set;}
        
        @AuraEnabled
        public MUSW__Application2__c app{get;set;}
        
    }
}