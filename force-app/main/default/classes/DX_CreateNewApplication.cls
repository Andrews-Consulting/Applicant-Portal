public without sharing class DX_CreateNewApplication {
    static final string NONE = '--None--';
    static final string ACCOUNTOWNER = 'data.integration@abd.iowa.gov';


    @AuraEnabled
    public static list<LicenseTypeOption> getLicenseType(){
        
        list<LicenseTypeOption> options = new list<LicenseTypeOption>();
        abd_License_Types__c temp = new abd_License_Types__c(abd_Class__c=NONE, Available_Term_Lengths__c=NONE, StateIsLocalAuthority__c=false, 
                                                              has68MonthRestriction__c=false, PremisesMustBeIowa__c=false);
        options.add(new LicenseTypeOption(temp));
        for (abd_License_Types__c ltype:[Select Id,abd_Class__c,abd_License_Type__c,Available_Term_Lengths__c, StateIsLocalAuthority__c, 
                                         has68MonthRestriction__c, PremisesMustBeIowa__c, Does_Not_Allow__c from abd_License_Types__c where canBePrimaryLicense__c = true order by abd_Class__c]) {
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

        options = new List<String>();
        fieldResult = MUSW__Application2__c.abd_Premise_State__c.getDescribe();
        ple = fieldResult.getPicklistValues();
            options.add(NONE);
        for (Schema.PicklistEntry f: ple) {
            options.add(f.getLabel());
        }
        pickVals.put('state',options);
        return pickVals;
    }

    // return back an existing application and license to the server
    @AuraEnabled
    public static map<String, Object> getExistingInfo(Id recordId){

    map<String, Object> retVals = new map<String, Object>();
    MUSW__Application2__c app = [Select abd_Premise_City__c, abd_Square_Footage__c, Square_Footage_Retail_Area__c, abd_Primary_License__c, 
                                        abd_Premise_County__c, abd_Other_Criteria__c
                                        from MUSW__Application2__c where Id = :recordId Limit 1];

    MUSW__License2__c license = new MUSW__License2__c();                                        
    if (app != null && app.abd_Primary_License__c != null)
        license = [Select Id, abd_Business_Name__c, MUSW__Primary_Licensee__c, MUSW__Class__c, abd_Effective_Date__c, abd_Length__c 
                          from MUSW__License2__c where Id = :app.abd_Primary_License__c Limit 1];
    
    retVals.put('application', app);
    retVals.put('license', license);
    return retVals;

    }

    @AuraEnabled

    // TODO : CP license has a different record Type

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
           for(LicenseType lt:llt){
            	if(lt.selected){
	            	MUSW__License2__c lic = license.clone(false,false,false,false);
	            	lic.abd_LicenseType__c = lt.ltype.Id;
	            	lic.MUSW__Class__c = lt.ltype.abd_Class__c;
	            	lic.abd_License_Type__c = lt.ltype.abd_License_Type__c;
	            	licenses.add(lic);
            	}   
            }
            license.MUSW__Applicant__c=c.Id;
            license.name='System Number';
            license.abd_License_Type__c = lTypes.primary.abd_License_Type__c;
            insert license;
            insert licenses;
            // if (lTypes.primary.abd_License_Type__c == 'CP') 
            //MUSW__Application2__c app = new MUSW__Application2__c(abd_Application_Type__c ='New License',MUSW__Account__c=a.Id,MUSW__Applicant__c=c.Id,name='System Number',MUSW__Status__c='Pending',abd_Primary_License__c=license.Id, abd_Length__c=license.abd_Length__c);
        	app.abd_Application_Type__c ='New License';
        	if(app.abd_Premise_County__c != null)
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

            list<abd_License_Types__c> lTypeForStateCheck = [Select Id, StateIsLocalAuthority__c from abd_License_Types__c where abd_License_Type__c = :lTypes.primary.abd_License_Type__c limit 1];
            
            if (lTypeForStateCheck.size() > 0) 
                if (lTypeForStateCheck[0].StateIsLocalAuthority__c) 
                    app.abd_Local_Authority_Type__c = 'State';
            System.debug('Local Authority ' + app.abd_Local_Authority_Type__c);

            if (license.abd_License_Type__c == 'CP') 
                app.RecordTypeID = Schema.SObjectType.MUSW__Application2__c.getRecordTypeInfosByName().get('Auction Application').getRecordTypeId();
            else
                app.RecordTypeID = Schema.SObjectType.MUSW__Application2__c.getRecordTypeInfosByName().get('New Application').getRecordTypeId();

        	// string other = '';
        	// if(app.abd_Other_Criteria__c =='Yes')
        	// 	other = 'Veteran’s organization open one day per week or 52 days or less per year';
        	// if(app.abd_More_Than_250_Members__c!=null)
        	// 	other = (app.abd_More_Than_250_Members__c=='Yes')?'Club has more than 250 members':'Club has less than 250 members';
        	// if(app.abd_Sell_Gasoline__c!=null)
        	// 	other = (app.abd_Sell_Gasoline__c=='Yes')?'Sells Gas':'No Gas';
        	// if(app.abd_Premises_Vehicle_Type__c!=null && app.abd_Premises_Vehicle_Type__c!='')
        	// 	other = app.abd_Premises_Vehicle_Type__c;
        	// if(other!='')
        	// 	app.abd_Other_Criteria__c = other;
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
        	throw new AuraHandledException (ex.getMessage());
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
            throw new AuraHandledException(ex.getStackTraceString()); 
        }

    }
	
	@AuraEnabled
    public static LicenseTypes getAddons(MUSW__License2__c license){
        
        try{
        	abd_License_Types__c primary = new abd_License_Types__c();
        	map<string,abd_License_Types__c> lmap = new map<string,abd_License_Types__c>();
            for(abd_License_Types__c ltype:[Select Id,abd_Class__c,abd_License_Type__c,Included_Add_On_Privileges__c, Included_Not_12Mo_Add_Ons_Privileges__c, Mandatory_Add_On_Privileges__c,
            								Optional_12Mo_Add_Ons_Privileges__c,Optional_Not_12Mo_Add_Ons_Privileges__c,Optional_Add_On_Privileges__c,
            								Available_Term_Lengths__c, PremisesMustBeIowa__c, Does_Not_Allow__c
            								from abd_License_Types__c where Available_Term_Lengths__c includes(:license.abd_Length__c)]){
            	lmap.put(ltype.abd_License_Type__c,ltype);
            	if(license.MUSW__Class__c==ltype.abd_Class__c)
            		primary = ltype;   
            }
            LicenseTypes lts = new LicenseTypes(primary);
            string opt = primary.Optional_Add_On_Privileges__c;
            if(license.abd_Length__c=='12 months'){
            	opt+=(';'+primary.Optional_12Mo_Add_Ons_Privileges__c);	
            }else{
            	opt+=(';'+primary.Optional_Not_12Mo_Add_Ons_Privileges__c);
            }
            if(opt!=null){
	            for(string s:opt.split(';')){
	            	if(s!='' && lmap.containsKey(s))
	            		lts.optional.add(new LicenseType(false,false,lmap.get(s)));	
	            }
            }
            if(primary.Included_Add_On_Privileges__c!=null){
	            for(string s:primary.Included_Add_On_Privileges__c.split(';')){
	            	if(s!='' && lmap.containsKey(s))
	            		lts.included.add(new LicenseType(true,false,lmap.get(s)));	
	            }
            }
            if (primary.Included_Not_12Mo_Add_Ons_Privileges__c != null && (license.abd_Length__c !='12 months')) {
             for(string s:primary.Included_Not_12Mo_Add_Ons_Privileges__c.split(';')){
                    if(s!='' && lmap.containsKey(s))
                        lts.included.add(new LicenseType(true,false,lmap.get(s)));  
                }   
            }

            if(primary.Mandatory_Add_On_Privileges__c!=null){
	            for(string s:primary.Mandatory_Add_On_Privileges__c.split(';')){
	            	if(s!='' && lmap.containsKey(s))
	            		lts.included.add(new LicenseType(true,true,lmap.get(s)));	
	            }
            }
            return lts;
        }catch (Exception ex) {
        	return new LicenseTypes(string.valueOf(ex.getLineNumber())+' '+ex.getMessage());
        }
    }
     


    // Get the addons that are possible for a specific primary license (and the License applications already on the application)
    @AuraEnabled
    public static LicenseTypes getAddons2(Id appId, String licenseLength){
        
        try{

            list<abd_License_Application__c> applist = [Select abd_License_Type__c, abd_Primary_License__c, abd_License__c, Class__c  
                                                                from abd_License_Application__c where abd_Application__r.Id = :appId];

            if (applist.size() == 0) throw new AuraHandledException('No Application License objects found for application ' + appId);

            // Grab some info about the primary license from the list of license applications.
            ID primaryLicenseId;
            String primaryClass;

            // Build a set of the license types on this application
            set<String> license_app_set = new set<String>();
            for (abd_License_Application__c al : applist) {
                license_app_set.add(al.abd_License_Type__c);
                if (al.abd_Primary_License__c) {
                    primaryLicenseId = al.abd_License__c;
                    primaryClass = al.Class__c;
                }
            }

            if (primaryLicenseId == null) throw new AuraHandledException('A primary license was not found for the application ' + appId);

            // Get the list of addons and privileges for all of the license types that are valid for this length
            abd_License_Types__c primary = new abd_License_Types__c();
            map<string,abd_License_Types__c> lmap = new map<string,abd_License_Types__c>();
            for(abd_License_Types__c ltype:[Select Id,abd_Class__c,abd_License_Type__c,Included_Add_On_Privileges__c,Mandatory_Add_On_Privileges__c,
                                            Optional_12Mo_Add_Ons_Privileges__c,Optional_Not_12Mo_Add_Ons_Privileges__c,Optional_Add_On_Privileges__c,
                                            Available_Term_Lengths__c, Does_Not_Allow__c 
                                            from abd_License_Types__c where Available_Term_Lengths__c includes(:licenseLength)]){
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
                        if (license_app_set.contains(s))
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
            throw new AuraHandledException (ex.getStackTraceString());
        }
    }



    @AuraEnabled
    public static string getFeeSchedule(string appInfo){
    	
    	ApplicationInfo ai = (ApplicationInfo) JSON.deserializeStrict(appInfo,ApplicationInfo.class);
    	//map<string,FeeSchedule> fsMap = new map<string,FeeSchedule>();
    	map<string,map<string,decimal>> msmsd = new map<string,map<string,decimal>>();
    	list<abd_Fee_Schedule_Global__c> lfs = new list<abd_Fee_Schedule_Global__c>();
    	boolean sunday = ai.selectedLicenseTypes.contains('P-SS');
    	list<String> lTypes = ai.selectedLicenseTypes.trim().split('[ ]+');

System.debug('ltypes - ' + lTypes + ' source = :' + ai.selectedLicenseTypes + ':');    

    	string primary = lTypes[0];

    	// base query
        String lowValueQuery = 'Select Name, abd_Total_Fees__c,Other_Criteria__c,abd_Sunday_Fees__c,abd_License_Type__c from abd_Fee_Schedule_Global__c where abd_Active__c=true ';
        // String highValueQuery = 'Select Name, abd_Total_Fees__c,Other_Criteria__c,abd_Sunday_Fees__c,abd_License_Type__c from abd_Fee_Schedule_Global__c where abd_Active__c=true '; 

        lowValueQuery += ' and abd_License_Type__c IN :lTypes ';
        lowValueQuery += ' and abd_Application_Type__c includes (\'New License\')';

        // Sunday Sales - lowvalue goes up and down with sunday privilege, highvalue assumes its on
        // Sunday sales are only for BB, BC, BW, LA, LB, LC, LD, WB
        if (sunday)
            lowValueQuery +=''; 
        else 
            lowValueQuery +='  and (abd_License_Type__c not in (\'BB\', \'BC\', \'BW\', \'LA\', \'LB\', \'LC\', \'LD\', \'WB\') or (abd_License_Type__c in (\'BB\', \'BC\', \'BW\', \'LA\', \'LB\', \'LC\', \'LD\', \'WB\') and  abd_Sunday_Fees__c=false))';

        // both exclude the free add ons, if they match
        lowValueQuery += ' and abd_No_Fee_With_Primary_License_Type__c excludes(:primary)';
        System.debug(' primary ' + primary);

        // keep the population if we have any of these licenses 
        //         LA and vo = no
        //         LB, LC, BW, BB, LE, 
        Decimal population = ai.population;
        if (ai.population != null)
        lowValueQuery += ' and ((abd_Population_Min__c=null) or (abd_Population_Min__c<=:population and abd_Population_Max__c>=:population))';
       
        // Only use  sqft when we have an LE or BC license
        Decimal sqft = ai.SqFt;
        if (ai.SqFt != null)
        lowValueQuery += ' and ((abd_Square_Footage_Min__c = null) or (abd_Square_Footage_Min__c <= :sqFt and abd_Square_Footage_Max__c >= :sqFt))';

        // LA, LD, and LE must have an other criteria specified.
        String otherCriteria = ai.otherCriteria;
        if (ai.otherCriteria != null)        
        lowValueQuery += ' and (abd_License_Type__c not in (\'LE\',\'LD\',\'LA\')  or (abd_License_Type__c in (\'LE\',\'LD\',\'LA\') and Other_Criteria__c=:otherCriteria))';

        if (ai.length != null && ai.length != '--None--') {
            String licLength = ai.length;
            lowValueQuery += ' and (abd_Length__c includes (:licLength ) or abd_Length__c = null)';
        }

        System.debug('primary - ' + primary);
        System.debug('population - ' + ai.population);
        System.debug('sqft - ' + ai.SqFt);
        System.debug('length - ' + ai.length);
        System.debug('other criteria - ' + ai.otherCriteria);
        System.debug('length - ' + ai.length);

        System.debug('low side Query');
        system.debug(lowValueQuery);
        Decimal ls_Fee = 0;
        // Calculate Low Side
        for(abd_Fee_Schedule_Global__c ls:Database.query(lowValueQuery)) {
            System.Debug(ls);
            ls_Fee += ls.abd_Total_Fees__c;
        }

    	string retStr = 'Amount with selections:'+String.valueOf(ls_Fee);  //+ ' HS:' +String.valueOf(hs_Fee);
    	return retStr;
    }
    
    @AuraEnabled
    public static boolean isEligible(string AccountId,string LicenseTypes){
    	// boolean found = false;
    	// string retString = 'You are ineligible for applying for the following Licenses for this term: ';
    	if(LicenseTypes!=null && LicenseTypes!=''){
	    	string[] ltypes = LicenseTypes.split(' ');
            list<MUSW__License2__c> ll = [Select MUSW__Class__c From MUSW__License2__c where MUSW__Primary_Licensee__c=:AccountId 
                                    and License_Makes_Owner_Ineligible__c=true and abd_License_Type__c IN:ltypes];
            if (ll.size() > 0)
                return false;
        }
	   //  	for(MUSW__License2__c l:[Select MUSW__Class__c From MUSW__License2__c where MUSW__Primary_Licensee__c=:AccountId 
	   //  							and License_Makes_Owner_Ineligible__c=true and abd_License_Type__c IN:ltypes]){
	   //  		if(found)
	   //  			retString+=', '	;
				// retString+=l.MUSW__Class__c;
				// found=true;				
	    //     }
        // }
    	// if(found)
    	// 	return retString;
    	return true;
    }
    //Methods for dx_CreateRenewalApplication
    @AuraEnabled
    public static string createRenewalApp(Id licenseId){
        Savepoint sp = Database.setSavepoint();
        try{
            Id devRecordTypeId = Schema.SObjectType.MUSW__Application2__c.getRecordTypeInfosByName().get('Renewal Application').getRecordTypeId();
            MUSW__Application2__c app = new MUSW__Application2__c(abd_Application_Type__c ='License Renewal',recordTypeId=devRecordTypeId,abd_Primary_License__c=licenseId,name='System Number',MUSW__Status__c='Pending',abd_Portal_Processed__c = true);
        	insert app;
            
            return String.valueOf(app.Id);
        }catch (Exception ex) {
        	system.debug(ex.getMessage());
            Database.rollback(sp);
        	throw new AuraHandledException (ex.getStackTraceString());
        }
    }

    // This is the stucture to define the possible, categorized licenses types to list on the portal screen.
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
	

    // Here is the structure to define the license types within a single category (such as included vs optional)
	public class LicenseType{
		
		public LicenseType(boolean selected, boolean hidden, abd_License_Types__c lt){
		
			this.selected = selected;        // Indicator to include this license.
			this.hidden = hidden;        // 
			this.ltype = lt;
		}
		
		@AuraEnabled
		public boolean selected {get;set;}
		
		@AuraEnabled
		public boolean hidden {get;set;}
		
		@AuraEnabled
		public abd_License_Types__c ltype{get;set;}
	}
	
	public class LicenseTypeOption{
		
		public LicenseTypeOption(abd_License_Types__c lt){
		
			this.name = lt.abd_Class__c;
			this.ltype = lt.abd_License_Type__c;
            this.stateIsLocalAuthority = lt.StateIsLocalAuthority__c;
            this.has68MonthRestriction = lt.has68MonthRestriction__c;
            this.premisesMustBeIowa = lt.PremisesMustBeIowa__c;
			this.lengths = new string[]{};
            this.doesNotAllowTypes = lt.Does_Not_Allow__c;
			if(name != NONE && lt.Available_Term_Lengths__c.split(';').size() > 1)
				lengths.add(NONE);
			for(string s:lt.Available_Term_Lengths__c.split(';')){
				lengths.add(s);
			}
			system.debug(lengths);
		}
		
		@AuraEnabled public string name {get;set;}
		@AuraEnabled public string ltype {get;set;}
		@AuraEnabled public string[] lengths {get;set;}
        @AuraEnabled public Boolean stateIsLocalAuthority {get;set;}
        @AuraEnabled public Boolean has68MonthRestriction {get;set;}
        @AuraEnabled public Boolean premisesMustBeIowa {get;set;}
		@AuraEnabled public string doesNotAllowTypes {get;set;}
	}
	
	public class ApplicationInfo{
		
		public ApplicationInfo(){}
		
		@AuraEnabled
		public string selectedLicenseTypes{get;set;}
		
		@AuraEnabled
		public string length{get;set;}
		
		@AuraEnabled
		public decimal population{get;set;}
		
		@AuraEnabled
		public decimal sqFt{get;set;}

        @AuraEnabled
        public string otherCriteria{get;set;}
	}
	
 }