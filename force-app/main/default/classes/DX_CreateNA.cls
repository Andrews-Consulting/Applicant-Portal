public without sharing class DX_CreateNA {
    static final string NONE = '--None--';
    static final string ACCOUNTOWNER = 'data.integration@abd.iowa.gov';


    @AuraEnabled
    public static list<LicenseTypeOption> getLicenseType(){
        
        list<LicenseTypeOption> options = new list<LicenseTypeOption>();
        abd_License_Types__c temp = new abd_License_Types__c(abd_Class__c=NONE, Available_Term_Lengths__c=NONE);
        options.add(new LicenseTypeOption(temp));
        for (abd_License_Types__c ltype:[Select Id,abd_Class__c,Available_Term_Lengths__c,abd_License_Type__c,Included_Add_On_Privileges__c,
        								Mandatory_Add_On_Privileges__c,Optional_12Mo_Add_Ons_Privileges__c,Optional_Not_12Mo_Add_Ons_Privileges__c,
        								Optional_Add_On_Privileges__c from abd_License_Types__c where Available_Term_Lengths__c!=null order by abd_Class__c]) {
            options.add(new LicenseTypeOption(ltype));
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
        fieldResult = MUSW__Application2__c.abd_Premises_Vehicle_Type__c.getDescribe();
        ple = fieldResult.getPicklistValues();
            options.add(NONE);
        for (Schema.PicklistEntry f: ple) {
            options.add(f.getLabel());
        }
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
            Account a = new Account(Id=license.MUSW__Primary_Licensee__c);
            if(a.Id==null){
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
	            	lic.abd_LicenseType__c = lt.ltype.Id;
	            	lic.MUSW__Class__c = lt.ltype.abd_Class__c;
	            	lic.abd_License_Type__c = lt.ltype.abd_License_Type__c;
	            	licenses.add(lic);
            	}   
            }
            license.abd_LicenseType__c = lTypes.primary.Id;
            insert license;
            insert licenses;
            //MUSW__Application2__c app = new MUSW__Application2__c(abd_Application_Type__c ='New License',MUSW__Account__c=a.Id,MUSW__Applicant__c=c.Id,name='System Number',MUSW__Status__c='Pending',abd_Primary_License__c=license.Id, abd_Length__c=license.abd_Length__c);
        	app.abd_Application_Type__c ='New License';
        	app.MUSW__Account__c=a.Id;
        	app.MUSW__Applicant__c=c.Id;
        	app.name='System Number';
        	app.MUSW__Status__c='Pending';
        	app.abd_Primary_License__c=license.Id;
        	app.abd_Length__c=license.abd_Length__c;
        	app.abd_Portal_Processed__c = true;
        	app.abd_Effective_Date__c = license.abd_Effective_Date__c;
        	string other = '';
        	if(app.abd_Veterans_Organization__c=='Yes')
        		other = 'Veteran’s organization open one day per week or 52 days or less per year';
        	if(app.abd_More_Than_250_Members__c!=null)
        		other = (app.abd_More_Than_250_Members__c=='Yes')?'Club has more than 250 members':'Club has less than 250 members';
        	if(app.abd_Sell_Gasoline__c!=null)
        		other = (app.abd_Sell_Gasoline__c=='Yes')?'Sells Gas':'No Gas';
        	if(app.abd_Premises_Vehicle_Type__c!=null && app.abd_Premises_Vehicle_Type__c!='')
        		other = app.abd_Premises_Vehicle_Type__c;
        	if(other!='')
        		app.abd_Other_Criteria__c = other;
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
        	return ex.getMessage();
        }
    }
	
	@AuraEnabled
    public static LicenseTypes getAddons(MUSW__License2__c license){
        
        try{
        	abd_License_Types__c primary = new abd_License_Types__c();
        	map<string,abd_License_Types__c> lmap = new map<string,abd_License_Types__c>();
            for(abd_License_Types__c ltype:[Select Id,abd_Class__c,abd_License_Type__c,Included_Add_On_Privileges__c,Mandatory_Add_On_Privileges__c,
            								Optional_12Mo_Add_Ons_Privileges__c,Optional_Not_12Mo_Add_Ons_Privileges__c,Optional_Add_On_Privileges__c,
            								Available_Term_Lengths__c 
            								from abd_License_Types__c]){// where Available_Term_Lengths__c includes(:license.abd_Length__c)]){
            	if(license.abd_Length__c==NONE || ltype.Available_Term_Lengths__c.contains(license.abd_Length__c)){
	            	lmap.put(ltype.abd_License_Type__c,ltype);
	            	if(license.MUSW__Class__c==ltype.abd_Class__c)
	            		primary = ltype;
            	}   
            }
            LicenseTypes lts = new LicenseTypes(primary);
            string opt = primary.Optional_Add_On_Privileges__c;
            system.debug(license.abd_Length__c);
            if(license.abd_Length__c==NONE){
            	opt+=(';'+primary.Optional_12Mo_Add_Ons_Privileges__c);
            	opt+=(';'+primary.Optional_Not_12Mo_Add_Ons_Privileges__c);	
            }else if(license.abd_Length__c=='12 months'){
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
            if(primary.Mandatory_Add_On_Privileges__c!=null){
	            for(string s:primary.Mandatory_Add_On_Privileges__c.split(';')){
	            	if(s!='' && lmap.containsKey(s))
	            		lts.included.add(new LicenseType(true,true,lmap.get(s)));	
	            }
            }
            system.debug(license.abd_Length__c);
            system.debug(opt);
            system.debug(lts);
            return lts;
        }catch (Exception ex) {
        	return new LicenseTypes(string.valueOf(ex.getLineNumber())+' '+ex.getMessage());
        }
    }
    
    @AuraEnabled
    public static string getFeeSchedule(string appInfo){
    	
    	ApplicationInfo ai = (ApplicationInfo) JSON.deserializeStrict(appInfo,ApplicationInfo.class);
    	//map<string,FeeSchedule> fsMap = new map<string,FeeSchedule>();
    	map<string,map<string,decimal>> msmsd = new map<string,map<string,decimal>>();
    	list<abd_Fee_Schedule_Global__c> lfs = new list<abd_Fee_Schedule_Global__c>();
    	boolean sunday = ai.licenseTypes.contains('P-SS');
    	string[] lTypes = ai.licenseTypes.split(' ');
    	if(ai.allTypes.contains('WB'))
    		ai.allTypes = ai.allTypes.replaceAll(' WBN','');
    	string[] allTypes = ai.allTypes.split(' ');
    	string len = '\''+ai.length.replaceAll(';','\',\'')+'\'';
    	string lena =ai.length.replaceAll(';',',');
    	system.debug(len);
    	system.debug(ai.length.split(';'));
    	string gas = ai.gas;
    	string vehicle = ai.vehicleType;
    	decimal retailSqFt = ai.retailSqFt;
    	decimal SqFt = ai.SqFt;
    	decimal population = ai.population;
    	decimal minfees = 0.00;
    	decimal maxfees = 0.00;
    	boolean veteran = ai.vo;
    	string arQuery = 'select max(abd_Total_Fees__c) max, abd_License_Type__c lt from abd_Fee_Schedule_Global__c where abd_License_Type__c IN:allTypes and abd_Active__c=true and abd_Length__c!=null and abd_Length__c includes('+len+') group by abd_License_Type__c,abd_Sunday_Fees__c';
    	for(AggregateResult ar:Database.query(arQuery)){
    		system.debug(ar);
    		maxfees+=(decimal)ar.get('max');
    	}
    	string query = 'Select abd_Total_Fees__c,Other_Criteria__c,abd_Sunday_Fees__c,abd_License_Type__c from abd_Fee_Schedule_Global__c where abd_License_Type__c IN:lTypes and abd_Length__c includes('+len+') and abd_Active__c=true';
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
    		//maxfees+=(msmsd.get(k).get('max')+msmsd.get(k).get('smax'));	
    	}
    	string minString = '$'+string.valueOf(minfees);
    	string maxString = '$'+string.valueOf(maxfees);
    	string retStr =(minfees!=maxfees)?minstring+' - '+maxString:minstring;
    	retStr+=(';'+minString);
    	return retStr;
    }
    
    //Method for dx_ApplicationAddPrivileges
    @AuraEnabled
    public static MUSW__License2__c getLicense(Id licenseId){
        
        return [Select abd_License_Type__c, MUSW__Primary_Licensee__c, MUSW__Applicant__c,abd_Length__c,abd_Veterans_Organization__c,abd_LicenseType__c,
        		abd_More_Than_250_Members__c,abd_Sell_Gasoline__c,abd_Premise_Vehicles_Type__c,abd_Square_Footage_Retail_Area__c,abd_Square_Footage__c, 
        		(Select abd_LicenseType__c, abd_License_Type__c From Licenses__r where abd_Active_Status__c=true) 
        		From MUSW__License2__c 
        		where id = :licenseId];
    }
	//Method for dx_ApplicationAddPrivileges
    @AuraEnabled
    public static LicenseTypes getAppAddons(MUSW__License2__c license, string existingIds){
        
        try{
        	set<id> existingLts = new set<Id>();
        	for(string s:existingIds.split(';')){
        		if(s!='')
        			existingLts.add((Id)s);
        	}
        	abd_License_Types__c primary = new abd_License_Types__c();
        	map<string,abd_License_Types__c> lmap = new map<string,abd_License_Types__c>();
        	list<LicenseType> existingList = new list<LicenseType>();
            system.debug(existingLts);
            for(abd_License_Types__c ltype:[Select Id,abd_Class__c,abd_License_Type__c,Included_Add_On_Privileges__c,Mandatory_Add_On_Privileges__c,
            								Optional_12Mo_Add_Ons_Privileges__c,Optional_Not_12Mo_Add_Ons_Privileges__c,Optional_Add_On_Privileges__c,
            								Available_Term_Lengths__c 
            								from abd_License_Types__c where Available_Term_Lengths__c includes(:license.abd_Length__c)]){
            	if(existingLts.contains(ltype.Id)){
            		existingList.add(new LicenseType(true,true,ltype));	
            	}else{
            		lmap.put(ltype.abd_License_Type__c,ltype);
            	}
	            if(license.abd_License_Type__c==ltype.abd_License_Type__c)
	            	primary = ltype;
            }
            LicenseTypes lts = new LicenseTypes(primary);
            lts.existing = existingList;
            system.debug(lmap);
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
    
	//Method for dx_ApplicationAddPrivileges
    @AuraEnabled
    public static string createAddApp(string lts, MUSW__License2__c license,string os){
        Savepoint sp = Database.setSavepoint();
        try{
            User u = [Select ContactId From User Where Id = :UserInfo.getUserId()];
            if(u.ContactId==null){
                throw new AuraHandledException ('It looks like you are no longer logged in to the system.  Unable to save the information');
                return null;
            }
            /*MUSW__License2__c license = new MUSW__License2__c(Id=app.abd_Primary_License__c,abd_Length__c = app.abd_Length__c,
            												MUSW__Applicant__c=app.abd_Primary_License__r.MUSW__Applicant__c,
            												MUSW__Primary_Licensee__c=app.abd_Primary_License__r.MUSW__Primary_Licensee__c);
			license.abd_Veterans_Organization__c = app.abd_Veterans_Organization__c;
        	license.abd_More_Than_250_Members__c = app.abd_More_Than_250_Members__c;
        	license.abd_Sell_Gasoline__c = app.abd_Sell_Gasoline__c;
        	license.abd_Premise_Vehicles_Type__c = app.abd_Premises_Vehicle_Type__c;
        	license.abd_Square_Footage_Retail_Area__c = app.Square_Footage_Retail_Area__c;
        	license.abd_Square_Footage__c = app.abd_Square_Footage__c;*/
        	update license;
			LicenseTypes lTypes = (LicenseTypes) JSON.deserializeStrict(lts,LicenseTypes.class);
            list<LicenseType> llt = new list<LicenseType>();
            llt.addAll(lTypes.optional);
            llt.addAll(lTypes.included);
            list<MUSW__License2__c> licenses = new list<MUSW__License2__c>();
            for(LicenseType lt:llt){
            	if(lt.selected){
	            	MUSW__License2__c lic = license.clone(false,false,false,false);
	            	license.name='System Number';
	            	lic.abd_LicenseType__c = lt.ltype.Id;
	            	lic.MUSW__Class__c = lt.ltype.abd_Class__c;
	            	lic.abd_License_Type__c = lt.ltype.abd_License_Type__c;
	            	licenses.add(lic);
            	}   
            }
            insert licenses;
            MUSW__Application2__c application = new MUSW__Application2__c(abd_Application_Type__c ='Add Privilege or License to Existing License',
            															MUSW__Account__c=license.MUSW__Primary_Licensee__c,MUSW__Applicant__c=license.MUSW__Applicant__c,
            															name='System Number',MUSW__Status__c='Pending',abd_Primary_License__c=license.Id,
            															abd_Length__c=license.abd_Length__c,abd_Portal_Processed__c = true,
            															abd_Outdoor_Service_Area_Boundary_Info__c=os);
			system.debug(application);
            insert application;
            list<abd_License_Application__c> lla = new list<abd_License_Application__c>();
            //lla.add(new abd_License_Application__c(abd_Application__c=app.Id,abd_License__c=license.Id,abd_Primary_License__c=true));
            for(MUSW__License2__c l:licenses){
            	lla.add(new abd_License_Application__c(abd_Application__c=application.Id,abd_License__c=l.Id,abd_Primary_License__c=false,abd_Portal_Processed__c = true));
            }
            insert lla;
            return 'SUCCESS: ' + String.valueOf(application.Id);
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
			this.existing = new list<LicenseType>();
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
		
		@AuraEnabled
		public list<LicenseType> existing{get;set;}
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
			this.code = lt.abd_License_Type__c;
			this.available = code;
			if(lt.Included_Add_On_Privileges__c!=null)
				available +=' '+lt.Included_Add_On_Privileges__c.replaceAll(';',' ');
			if(lt.Mandatory_Add_On_Privileges__c!=null)
				available +=' '+lt.Mandatory_Add_On_Privileges__c.replaceAll(';',' ');
			if(lt.Optional_12Mo_Add_Ons_Privileges__c!=null)
				available +=' '+lt.Optional_12Mo_Add_Ons_Privileges__c.replaceAll(';',' ');
			if(lt.Optional_Not_12Mo_Add_Ons_Privileges__c!=null)
				available +=' '+lt.Optional_Not_12Mo_Add_Ons_Privileges__c.replaceAll(';',' ');
            if(lt.Optional_Add_On_Privileges__c!=null)
				available +=' '+lt.Optional_Add_On_Privileges__c.replaceAll(';',' ');
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
		public string code {get;set;}
		
		@AuraEnabled
		public string available {get;set;}
		
		@AuraEnabled
		public string[] lengths {get;set;}
		
	}
	
	public class ApplicationInfo{
		
		public ApplicationInfo(){}
		
		@AuraEnabled
		public string licenseTypes{get;set;}
		
		@AuraEnabled
		public string allTypes{get;set;}
		
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