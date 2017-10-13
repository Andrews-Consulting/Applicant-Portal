public with sharing class DX_ApplicationBasics {
    static final string NONE = '--None--';
    static final string ACCOUNTOWNER = 'data.integration@abd.iowa.gov';


    @AuraEnabled
    public static list<LicenseTypeOption> getLicenseType(){
        
        list<LicenseTypeOption> options = new list<LicenseTypeOption>();
        abd_License_Types__c temp = new abd_License_Types__c(abd_Class__c=NONE, Available_Term_Lengths__c=NONE);
        options.add(new LicenseTypeOption(temp));
        for (abd_License_Types__c ltype:[Select Id,abd_Class__c,Available_Term_Lengths__c from abd_License_Types__c where Available_Term_Lengths__c!=null order by abd_Class__c]) {
            options.add(new LicenseTypeOption(ltype));
        }
        
        return options;
    }
    @AuraEnabled
    public static map<string,string> getHelpText(){
        Map<String, Schema.SObjectField> schemaFieldMap = Schema.SObjectType.MUSW__License2__c.fields.getMap();
        map<string,string> options = new map<string,string>();
        for(string s:schemaFieldMap.keySet()){
            Schema.DescribeFieldResult dfr = schemaFieldMap.get(s).getDescribe();
            options.put(dfr.getName(),dfr.getInlineHelpText());
        }
        return options;
    }
    @AuraEnabled
    public static list<Account> getAccounts(){
        try{
            list<Account> la = new list<Account>();
            la.add(new Account(name='--None--'));
            User u = [Select ContactId From User Where Id = :UserInfo.getUserId()];
            if(u.ContactId==null){
                return null;
            }
            for(AccountContactRelation acr:[Select AccountId, Account.Name from AccountContactRelation where ContactId=:u.ContactId and Account.Name!='Registered Users']){
                la.add(new Account(Id=acr.AccountId,Name=acr.Account.Name));
            }
            return la;
        }catch(exception e){
            return null;
        }
    }
    @AuraEnabled
    public static List<String> getLicenseLength(){
        
        List<String> options = new List<String>();
        Schema.DescribeFieldResult fieldResult = MUSW__License2__c.abd_Length__c.getDescribe();
        List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
        options.add(NONE);
        for (Schema.PicklistEntry f: ple) {
            options.add(f.getLabel());
        }
        
        return options;
    }
    @AuraEnabled
    public static list<abd_Census__c> getPremiseCity(string county){
        list<abd_Census__c> temp = new list<abd_Census__c>();
        temp.add(new abd_Census__c(name='--None--'));
        for(abd_Census__c a:[Select Name,abd_Population__c from abd_Census__c where abd_County__c!=null and abd_County__c includes(:county) and abd_Type__c='City' order by Name]){
            temp.add(a);    
        } 
        return temp;
    }
    @AuraEnabled
    public static map<string,string[]> getPicklistValues(){
        map<string,string[]> pickVals = new map<string,string[]>();
        string[] options = new string[]{};
        Schema.DescribeFieldResult fieldResult = MUSW__Application2__c.abd_Premise_County__c.getDescribe();
        List<Schema.PicklistEntry>ple = fieldResult.getPicklistValues();
        options.add(NONE);
        for (Schema.PicklistEntry f: ple) {
            options.add(f.getLabel());
        }
        pickVals.put('county',options);
        options = new List<String>();
        options.add(NONE);
        options.add('Plane');       // These are 3 of the 8 selections in the other Criteria picklist
        options.add('Train');       // so we'll just hard code them for now.
        options.add('Boat');
        pickVals.put('pVType',options);
        return pickVals;
    }

    // return back an existing application and license to the server
    @AuraEnabled
    public static map<String, Object> getExistingInfo(String recordId){

        map<String, Object> retVals = new map<String, Object>();

        //  If we are passed an invalid ID, then just leave;
        if (recordId == null || recordId.length() < 15)
            return retVals;

        // 
        //  APPLICATION ID WAS PASSED IN.
        //
        if (recordId.left(3) == Schema.SObjectType.MUSW__Application2__c.getKeyPrefix()) {        
            list<MUSW__Application2__c> applist = [Select abd_Premise_City__c, abd_Square_Footage__c, Square_Footage_Retail_Area__c,
                                                   	abd_More_Than_250_Members__c, abd_Primary_License__c, 
                                            		abd_Premise_County__c 
                                            		from MUSW__Application2__c where Id = :recordId Limit 1];

            // if successful, save it away and try to get the license information
            if (applist.size() > 0) {
                retVals.put('application', applist[0]);

            list<MUSW__License2__c> license = new list<MUSW__License2__c>();                                        
            if (applist[0].abd_Primary_License__c != null)
                license = [Select Id, abd_Business_Name__c, MUSW__Primary_Licensee__c, MUSW__Class__c, abd_Effective_Date__c, abd_Length__c 
                              from MUSW__License2__c where Id = :applist[0].abd_Primary_License__c Limit 1];
            
            // If an app exists, then a license must exist, so define one in either case.
            if (license.size() > 0)
                retVals.put('license', license[0]);
            else 
                retVals.put('license', new MUSW__License2__c());
            }

        }
        //
        //  LICENSE ID PASSED IN
        else if (recordId.left(3) == Schema.SObjectType.MUSW__License2__c.getKeyPrefix()) {            
            MUSW__Application2__c app =  DX_Utils.CreateAppFromLicense(recordId);
            if (app != null) {
                retVals.put('application', DX_Utils.CreateAppFromLicense(recordId));
                list<MUSW__License2__c> license = [Select Id, abd_Business_Name__c, MUSW__Primary_Licensee__c, MUSW__Class__c, 
                                                    abd_Effective_Date__c, abd_Length__c from MUSW__License2__c where Id = :recordId Limit 1];
                if (license.size() > 0)
                    retVals.put('license', license[0]);
                else 
                    retVals.put('license', new MUSW__License2__c());
            }
        }

        return retVals;

    }

    @AuraEnabled
    public static string createNewL(MUSW__License2__c license,string lts, MUSW__Application2__c app){
        Savepoint sp = Database.setSavepoint();
        try{
            User u = [Select ContactId From User Where Id = :UserInfo.getUserId()];
            if(u.ContactId==null){
                throw new AuraHandledException ('It looks like you are no longer logged in to the system.  Unable to save the information');
                return null;
            }
            LicenseTypes lTypes = (LicenseTypes) JSON.deserializeStrict(lts,LicenseTypes.class);
            User u2 = [Select ID from user Where username = :ACCOUNTOWNER];
            Account a;
            try{
                a = new Account(Id=license.MUSW__Primary_Licensee__c);
            }catch(exception e){}
            if(a==null){
                a = new Account(Name=license.abd_Business_Name__c,MUSW__Person_Account__c=false, Ownerid=u2.id, Type='Licensee');
                insert a;
                license.MUSW__Primary_Licensee__c=a.Id;
            }
            Contact c = new Contact(Id=u.Contactid,AccountId = a.Id,MUSW__Account_Relationship__c='Applicant');
            update c;
            list<LicenseType> llt = new list<LicenseType>();
            llt.addAll(lTypes.optional);
            llt.addAll(lTypes.included);
            list<MUSW__License2__c> licenses = new list<MUSW__License2__c>();
            license.MUSW__Applicant__c=c.Id;
            license.name='System Number';
            for(LicenseType lt:llt){
                if(lt.selected){
                    MUSW__License2__c lic = license.clone(false,false,false,false);
//                    lic.abd_LicenseType__c = lt.ltype.Id;
                    lic.MUSW__Class__c = lt.ltype.abd_Class__c;
                    lic.abd_License_Type__c = lt.ltype.abd_License_Type__c;
                    licenses.add(lic);
                }   
            }
            // license.abd_LicenseType__c = lTypes.primary.Id;
            insert license;
            insert licenses;
            //MUSW__Application2__c app = new MUSW__Application2__c(abd_Application_Type__c ='New License',MUSW__Account__c=a.Id,MUSW__Applicant__c=c.Id,name='System Number',MUSW__Status__c='Pending',abd_Primary_License__c=license.Id, abd_Length__c=license.abd_Length__c);
            app.abd_Application_Type__c ='New License';
            app.abd_Premise_State__c='IA';
            app.abd_Business_Name__c = license.abd_Business_Name__c;
            app.MUSW__Account__c=a.Id;
            app.MUSW__Applicant__c=c.Id;
            app.abd_Primary_Contact__c=c.Id;
            app.name='System Number';
            app.MUSW__Status__c='Pending';
            app.abd_Primary_License__c=license.Id;
            app.abd_Length__c=license.abd_Length__c;
            app.abd_Portal_Processed__c = true;
            app.abd_Effective_Date__c = license.abd_Effective_Date__c;
            //string other = '';
            //if(app.abd_Veterans_Organization__c=='Yes')
            //    other = 'Veteran’s organization open one day per week or 52 days or less per year';
            //if(app.abd_More_Than_250_Members__c!=null)
            //    other = (app.abd_More_Than_250_Members__c=='Yes')?'Club has more than 250 members':'Club has less than 250 members';
            //if(app.abd_Premises_Vehicle_Type__c!=null && app.abd_Premises_Vehicle_Type__c!='')
            //    other = app.abd_Premises_Vehicle_Type__c;
            //if(other!='')
            //   app.abd_Other_Criteria__c = other;
            insert app;
            list<abd_License_Application__c> lla = new list<abd_License_Application__c>();
            lla.add(new abd_License_Application__c(abd_Application__c=app.Id,abd_License__c=license.Id,abd_Primary_License__c=true,abd_Portal_Processed__c = true));
            for(MUSW__License2__c l:licenses){
                lla.add(new abd_License_Application__c(abd_Application__c=app.Id,abd_License__c=l.Id,abd_Primary_License__c=false,abd_Portal_Processed__c = true));
            }
            insert lla;
            return 'SUCCESS: ' + String.valueOf(app.Id);
        }catch (Exception ex) {
            system.debug(ex.getMessage());
            Database.rollback(sp);
            throw new AuraHandledException(ex.getMessage());
            return null;
        }
    }

    @AuraEnabled
    public static void UpdateLicenseStatus(Id appId) {
        MUSW__Application2__c app = [Select Id, MUSW__Status__c from MUSW__Application2__c where ID = :appId limit 1]; 
        if (app == null) throw new AuraHandledException('Unable to Change status to In Progress on newly created application');
        app.MUSW__Status__c = 'In Progress';
        try {
            update app;
        } catch(Exception ex) { 
            throw new AuraHandledException(ex.getMessage() + ex.getStackTraceString()); 
        }

    }
    
       // Get the addons that are possible for a specific primary license (and the License applications already on the application)
    @AuraEnabled
    public static LicenseTypes getAddons2(String appId, String licenseLength, String licenseClass){
        
        try{
            String primaryClass;
            String primaryLicenseLength;
            set<String> license_app_set = new set<String>();
            // If an application is specifid, we need to determine the active license length and class from the app
            // Otherwise we use the values passed in.
         
            if (appId != null  && appId != '0') {

                //  object id can be an application ID, or a license ID at this time. 
                if (appId.left(3) == Schema.SObjectType.MUSW__Application2__c.getKeyPrefix()) {
                    list<abd_License_Application__c> applist = [Select abd_License_Type__c, abd_Primary_License__c, abd_License__c, Class__c, abd_length__c 
                                                                        from abd_License_Application__c where abd_Application__r.Id = :appId];

                    if (applist.size() == 0) throw new AuraHandledException('No Application License objects found for application ' + appId);

                    // Grab some info about the primary license from the list of license applications.
                    ID primaryLicenseId;

                    // Build a set of the license types on this application
                    for (abd_License_Application__c al : applist) {
                        license_app_set.add(al.abd_License_Type__c);
                        if (al.abd_Primary_License__c) {
                            primaryLicenseId = al.abd_License__c;
                            primaryClass = al.Class__c;
                            primaryLicenseLength = al.abd_length__c;
                        }
                    }

                    if (primaryLicenseId == null) throw new AuraHandledException('A primary license was not found for the application ' + appId);
                }
                // LICENSE
                else if (appId.left(3) == Schema.SObjectType.MUSW__License2__c.getKeyPrefix()) {
                    list<abd_License_Application__c> applist = [Select abd_License_Type__c, abd_Primary_License__c, abd_License__c, Class__c, abd_length__c 
                                                                        from abd_License_Application__c where abd_License__r.Id = :appId];

                    if (applist.size() == 0) throw new AuraHandledException('No Application License objects found for license ' + appId);
                    
                    license_app_set.add(applist[0].abd_License_Type__c);
                    primaryClass = applist[0].Class__c;
                    primaryLicenseLength = applist[0].abd_length__c;

                    applist = [Select abd_License_Type__c, abd_Primary_License__c, abd_License__c, Class__c, abd_length__c 
                                                                        from abd_License_Application__c where abd_License__r.Id = :appId
                                                                        and abd_License__r.abd_Primary_License__c = :appId];

                    for (abd_License_Application__c al : applist) {
                        license_app_set.add(al.abd_License_Type__c);
                    }


                }                    
            } 
            else 
            {
                primaryClass = licenseClass; 
                primaryLicenseLength = licenseLength;
            }


            // Get the list of addons and privileges for all of the license types that are valid for this length
            abd_License_Types__c primary = new abd_License_Types__c();
            map<string,abd_License_Types__c> lmap = new map<string,abd_License_Types__c>();
            for(abd_License_Types__c ltype:[Select Id,abd_Class__c,abd_License_Type__c,Included_Add_On_Privileges__c,Mandatory_Add_On_Privileges__c,
                                            Optional_12Mo_Add_Ons_Privileges__c,Optional_Not_12Mo_Add_Ons_Privileges__c,Optional_Add_On_Privileges__c,
                                            Available_Term_Lengths__c 
                                            from abd_License_Types__c where Available_Term_Lengths__c includes(:primaryLicenseLength)]){
                lmap.put(ltype.abd_License_Type__c,ltype);
                // when we find a match for our primary class, save the record.
                if(primaryClass == ltype.abd_Class__c)
                    primary = ltype;   
            }


            // Build up the object of license types to display as add ons - optional, included, and mandatory 
            LicenseTypes lts = new LicenseTypes(primary);

            // Grab the optional (both kinds) add ons
            string opt = primary.Optional_Add_On_Privileges__c;
            if(licenseLength == '12 months'){
                opt+=(';'+primary.Optional_12Mo_Add_Ons_Privileges__c); 
            }else{
                opt+=(';'+primary.Optional_Not_12Mo_Add_Ons_Privileges__c);
            }

            // For each optional license type, if it's in the map (valid for this license length) then include the type in the list
            // If the type is already on this application (in the license_app_set), then set the selected flag true.
            if(opt!=null){
                for(string s:opt.split(';')) {
                    if(s!='' && lmap.containsKey(s))
                        if (license_app_set.contains(s))                                    // must init for normal call
                            lts.optional.add(new LicenseType(true,false,lmap.get(s))); 
                        else
                            lts.optional.add(new LicenseType(false,false,lmap.get(s))); 
                }
            }

            // The list of included add ons
            if(primary.Included_Add_On_Privileges__c!=null){
                for(string s:primary.Included_Add_On_Privileges__c.split(';')){
                    if(s!='' && lmap.containsKey(s))
                            lts.included.add(new LicenseType(true,false,lmap.get(s)));  
                }
            }
            // and the list of the mandatory (all one of them)
            if(primary.Mandatory_Add_On_Privileges__c!=null){
                for(string s:primary.Mandatory_Add_On_Privileges__c.split(';')){
                    if(s!='' && lmap.containsKey(s))
                        lts.included.add(new LicenseType(true,true,lmap.get(s)));   
                }
            }
            return lts;
        }catch (Exception ex) {
            throw new AuraHandledException (ex.getMessage() + ex.getStackTraceString());
        }
    }



    @AuraEnabled
    public static string getFeeSchedule(string appInfo){
        
        ApplicationInfo ai = (ApplicationInfo) JSON.deserializeStrict(appInfo,ApplicationInfo.class);
        //map<string,FeeSchedule> fsMap = new map<string,FeeSchedule>();
        map<string,map<string,decimal>> msmsd = new map<string,map<string,decimal>>();
        list<abd_Fee_Schedule_Global__c> lfs = new list<abd_Fee_Schedule_Global__c>();
        boolean sunday = ai.licenseTypes.contains('SS');
        string[] lTypes = ai.licenseTypes.split(' ');
        string len = ai.length;
        string gas = ai.gas;
        string vehicle = ai.vehicleType;
        decimal retailSqFt = ai.retailSqFt;
        decimal SqFt = ai.SqFt;
        decimal population = ai.population;
        decimal minfees = 0.00;
        decimal maxfees = 0.00;
        boolean veteran = ai.vo;
        string query = 'Select abd_Total_Fees__c,Other_Criteria__c,abd_Sunday_Fees__c,abd_License_Type__c from abd_Fee_Schedule_Global__c where abd_License_Type__c IN:lTypes and abd_Length__c includes(:len) and abd_Active__c=true';
        if(ai.population!=null && ai.population>0)
            query+=' and ((abd_Population_Min__c=null) or (abd_Population_Min__c<=:population and abd_Population_Max__c>=:population))';
        if((ai.retailSqFt!=null && ai.retailSqFt>0) || (ai.SqFt!=null || ai.SqFt>0))
            query+=' and ((abd_Square_Footage_Min__c=null) or ((abd_License_Type__c=\'BC\' and (abd_Square_Footage_Min__c<=:retailSqFt and abd_Square_Footage_Max__c>=:retailSqFt)) or (abd_License_Type__c=\'LE\' and (abd_Square_Footage_Min__c<=:sqFt and abd_Square_Footage_Max__c>=:sqFt))))';
        if(!sunday)
            query+=' and abd_Sunday_Fees__c=false';
        if(ai.gas!=null)
            query+=' and (abd_License_Type__c!=\'LE\' or (abd_License_Type__c=\'LE\' and Other_Criteria__c=:gas))';
        if(ai.vehicleType!=null)
            query+=' and (abd_License_Type__c!=\'LD\' or (abd_License_Type__c=\'LD\' and Other_Criteria__c=:vehicle))'; 
        if(ai.vo!=null)
            query+=' and (abd_License_Type__c!=\'LA\' or (abd_License_Type__c=\'LA\' and Other_Criteria__c'+(ai.vo?'':'!')+'=\'Veteran’s organization open one day per week or 52 days or less per year\'))';
        if(ai.members!=null){
            string mem =(ai.members)?'Club has more than 250 members':'Club has less than 250 members';
            query+=' and (abd_License_Type__c!=\'LA\' or (abd_License_Type__c=\'LA\' and Other_Criteria__c=:mem))';
        }
        system.debug(query);
        system.debug(ai);
        for(abd_Fee_Schedule_Global__c fs:Database.query(query)){
            string key = fs.abd_License_Type__c;
            if(!msmsd.containsKey(key))
                msmsd.put(key,new map<string,decimal>());
            if(!msmsd.get(key).containsKey('min'))
                msmsd.get(key).put('min',999999.00);                                    
            if(!msmsd.get(key).containsKey('max'))
                msmsd.get(key).put('max',0.00);
            if(!msmsd.get(key).containsKey('smin'))
                msmsd.get(key).put('smin',999999.00);                                   
            if(!msmsd.get(key).containsKey('smax'))
                msmsd.get(key).put('smax',0.00);
            if(fs.abd_Sunday_Fees__c){
                if(fs.abd_Total_Fees__c < msmsd.get(key).get('smin'))
                    msmsd.get(key).put('smin',fs.abd_Total_Fees__c);                                        
                if(fs.abd_Total_Fees__c > msmsd.get(key).get('smax'))
                    msmsd.get(key).put('smax',fs.abd_Total_Fees__c);    
            }else{
                if(fs.abd_Total_Fees__c < msmsd.get(key).get('min'))
                    msmsd.get(key).put('min',fs.abd_Total_Fees__c);                                     
                if(fs.abd_Total_Fees__c > msmsd.get(key).get('max'))
                    msmsd.get(key).put('max',fs.abd_Total_Fees__c);
            }                                       
            system.debug(fs);
                                                    
        }
        for(string k:msmsd.keySet()){
            if(msmsd.get(k).get('min')==999999.00)
                msmsd.get(k).put('min',0.00);   
            if(msmsd.get(k).get('smin')==999999.00)
                msmsd.get(k).put('smin',0.00);  
            minfees+=(msmsd.get(k).get('min')+msmsd.get(k).get('smin'));
            maxfees+=(msmsd.get(k).get('max')+msmsd.get(k).get('smax'));    
        }
        string retStr =(minfees!=maxfees)?'$'+string.valueOf(minfees)+' - $'+string.valueOf(maxfees):'$'+string.valueOf(minfees);
        return retStr;
    }
    
    //Methods for dx_CreateRenewalApplication
    @AuraEnabled
    public static string createRenewalApp(Id licenseId){
        Savepoint sp = Database.setSavepoint();
        try{
            Id devRecordTypeId = Schema.SObjectType.MUSW__Application2__c.getRecordTypeInfosByName().get('Renewal Application').getRecordTypeId();
            MUSW__Application2__c app = new MUSW__Application2__c(abd_Application_Type__c ='License Renewal',recordTypeId=devRecordTypeId,abd_Primary_License__c=licenseId,name='System Number',MUSW__Status__c='Pending',abd_Portal_Processed__c = true);
            insert app;
            
            return 'SUCCESS: ' + String.valueOf(app.Id);
        }catch (Exception ex) {
            system.debug(ex.getMessage());
            Database.rollback(sp);
            return ex.getMessage();
        }
    }

    public class LicenseTypes{
        
        public LicenseTypes(abd_License_Types__c primary){
            this.primary = primary;
            this.optional = new list<LicenseType>();
            this.included = new list<LicenseType>();
            
        }
        public LicenseTypes(string err){
            this.error = err;
        }
        
        @AuraEnabled
        public string error{get;set;}
        
        @AuraEnabled
        public abd_License_Types__c primary{get;set;}
        
        @AuraEnabled
        public list<LicenseType> optional{get;set;}
        
        @AuraEnabled
        public list<LicenseType> included{get;set;}
    }
    
    public class LicenseType{
        
        public LicenseType(boolean selected, boolean required, abd_License_Types__c lt){
        
            this.selected = selected;
            this.required = required;
            this.ltype = lt;
        }
        
        @AuraEnabled
        public boolean selected {get;set;}
        
        @AuraEnabled
        public boolean required {get;set;}
        
        @AuraEnabled
        public abd_License_Types__c ltype{get;set;}
    }
    
    public class LicenseTypeOption{
        
        public LicenseTypeOption(abd_License_Types__c lt){
        
            this.name = lt.abd_Class__c;
            this.lengths = new string[]{};
            if(name != NONE)
                lengths.add(NONE);
            for(string s:lt.Available_Term_Lengths__c.split(';')){
                lengths.add(s);
            }
            system.debug(lengths);
        }
        
        @AuraEnabled
        public string name {get;set;}
        
        @AuraEnabled
        public string[] lengths {get;set;}
        
    }
    
    public class ApplicationInfo{
        
        public ApplicationInfo(){}
        
        @AuraEnabled
        public string licenseTypes{get;set;}
        
        @AuraEnabled
        public string length{get;set;}
        
        @AuraEnabled
        public string vehicleType{get;set;}
        
        @AuraEnabled
        public string gas{get;set;}
        
        @AuraEnabled
        public boolean vo{get;set;}
        
        @AuraEnabled
        public decimal population{get;set;}
        
        @AuraEnabled
        public decimal sqFt{get;set;}
        
        @AuraEnabled
        public decimal retailSqFt{get;set;}
        
        @AuraEnabled
        public boolean members{get;set;}
    }
    
}