public without sharing class DX_AddPrivilegeApplication {

    static final string NONE = '--None--';

    //Method for DX_AddPrivilegeApplication

    // Because the ADD privilege has NO application questions that need to appear on the application screen, we DON'T have to 
    // insert the app record at this time. (No questions/answers need to be associated to the new application).
    @AuraEnabled
    public static ApplicationAddInit getInfo(String recordId){
        
		try{
			
			MUSW__Application2__c app;
			Boolean isApplication = false;
			list<MUSW__License2__c> relatedLicenses = new list<MUSW__License2__c>();	// Already existing on the license.
			list<abd_License_Application__c> optionalLicenses = new list<abd_License_Application__c>();	// Already selected as "desired" for this license.
			// If they pass us a license ID, then we are coming in for the first time
			if (recordId.left(3) == Schema.SObjectType.MUSW__License2__c.getKeyPrefix()) {
			    list<MUSW__License2__c> liclist = [Select abd_License_Type__c, MUSW__Primary_Licensee__c, MUSW__Applicant__r.Id,abd_Length__c,
			    		    abd_Other_Criteria__c, abd_Square_Footage_Retail_Area__c,abd_Square_Footage__c, abd_Effective_Date__c, abd_Effective_End_Date__c,
			        		(Select Id, abd_License_Type__c From Licenses__r where abd_Active_Status__c=true) 
			        		From MUSW__License2__c where id = :recordId];

			    // if it's no good, then just leave.
			    if (liclist.size() <= 0) {
			    	throw new AuraHandledException('No license found with the ID of ' + recordId);
			    	return null;
			    }
			    
			    app = new MUSW__Application2__c();
				MUSW__License2__c primaryLicense = liclist[0];
				relatedLicenses = primaryLicense.Licenses__r;
				System.debug('Primary license ' + primaryLicense);

	            app.name='System Number';
	            app.MUSW__Status__c='Pending';
				app.abd_Portal_Processed__c = true;		    
				app.abd_Primary_License__c = primaryLicense.Id;
			    app.abd_Length__c = primaryLicense.abd_Length__c;
			    app.abd_Square_Footage__c = primaryLicense.abd_Square_Footage__c;
			    app.Square_Footage_Retail_Area__c = primaryLicense.abd_Square_Footage_Retail_Area__c;
			    app.abd_PortalWork_LicenseType__c = primaryLicense.abd_License_Type__c;
			    app.abd_Effective_Date_of_Current_License__c = primaryLicense.abd_Effective_Date__c;
			    app.abd_Effective_End_Date_of_Current_Lic__c = primaryLicense.abd_Effective_End_Date__c;
			    app.abd_Effective_Date__c = null;
			    app.abd_Effective_End_Date__c = null;
			    app.abd_Temporary_or_Permanent__c = 'Permanent';
			    app.MUSW__Account__c = primaryLicense.MUSW__Primary_Licensee__c;
			    app.MUSW__Applicant__c = primaryLicense.MUSW__Applicant__r.Id;
			    app.RecordTypeId = Schema.SObjectType.MUSW__Application2__c.getRecordTypeInfosByName().get('Add Privilege or License to Existing License').getRecordTypeId();
			}

			// If it's an existing application, it gets a little more complicated.
			// Get the record and fields
			// Get the related - already existing licenses
			// Get the related - optional - previously selected licenses.
			if (recordId.left(3) == Schema.SObjectType.MUSW__Application2__c.getKeyPrefix()) {
				list<MUSW__Application2__c> applist = [Select Id, MUSW__Status__c, abd_Portal_Processed__c, abd_Primary_License__c, 
						abd_Length__c, abd_Square_Footage__c, Square_Footage_Retail_Area__c, abd_PortalWork_LicenseType__c, 
						abd_Effective_Date_of_Current_License__c, abd_Effective_End_Date_of_Current_Lic__c, abd_Effective_Date__c, 
						abd_Effective_End_Date__c, abd_Temporary_or_Permanent__c, MUSW__Account__c, MUSW__Applicant__c, RecordTypeId, 
						MUSW__Description__c, abd_Outdoor_Service_Area_Boundary_Info__c
						From MUSW__Application2__c a where ID = :recordId];

			    // if it's no good, then just leave.
			    if (applist.size() <= 0) {
			    	throw new AuraHandledException('No application found with the ID of ' + recordId);
			    	return null;
			    }
			    
			    isApplication = true;
			    app = applist[0];
			    relatedLicenses = [Select Id, abd_License_Type__c From MUSW__License2__c where abd_Active_Status__c=true and 
										abd_Primary_License__c = :app.abd_Primary_License__c];
				optionalLicenses = [Select Id, abd_License_Type__c From abd_License_Application__c where abd_Application__c = :app.Id];
			}

		    // So we have a license and all of the related license records.  Let's go get a list of what is available
		    list<abd_License_Types__c> possibleLicList = DX_Utils.GetQualifiedLicenseTypes(app.abd_Length__c);

       		// convert the list of existing add ons into a set
	        set<String> selectedLicTypes = new set<String>();
	        for (integer i = 0; i < optionalLicenses.size(); i++) {
	        	selectedLicTypes.add(optionalLicenses[i].abd_License_Type__c);
	        }

       		// convert the list of selected optional add ons into a set
	        set<String> existingLicTypes = new set<String>();
	        for (integer i = 0; i < relatedLicenses.size(); i++) {
	        	existingLicTypes.add(relatedLicenses[i].abd_License_Type__c);
	        }

	        // so now, we go through the list of license types that they could add, and seperate them into three piles
	        // what they have (existing), what is optional.  There shouldn't ever be any more requireds
	        // 

           	abd_License_Types__c primary = new abd_License_Types__c();
        	map<string,abd_License_Types__c> lmap = new map<string,abd_License_Types__c>();

        	// start to build out the licenseTypes structure to return 
            DX_Utils.LicenseTypeStructure licTypeStruct = new DX_Utils.LicenseTypeStructure(primary);

        	// first build a map of the license type records and copy the primary and existing records when we see them.
            for(abd_License_Types__c ltype:possibleLicList){
            	lmap.put(ltype.abd_License_Type__c,ltype);
            	// Quick check for the primary license type record
            	if(app.abd_PortalWork_LicenseType__c == ltype.abd_License_Type__c)
            		primary = ltype;   
            	//and if these exist on the license, then add them to the existing set
	            if (existingLicTypes.contains(ltype.abd_License_Type__c))
	            	if (ltype.Type_Of_Add_On__c == 'Sublicense' || ltype.Type_Of_Add_On__c == 'Permit')
		            	licTypeStruct.existingSLP.add(new DX_Utils.LicenseType(true,false,true,ltype));	
		            else if (ltype.Type_Of_Add_On__c == 'Privilege') 
		            	licTypeStruct.existingPrv.add(new DX_Utils.LicenseType(true,false,true,ltype));	

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
	            	if(s != '' && lmap.containsKey(s) && !existingLicTypes.contains(s)) {
	            		if (s == 'WBN' && (existingLicTypes.contains('WB') ||  existingLicTypes.contains('WCN') ||
	            							selectedLicTypes.contains('WB') || selectedLicTypes.contains('WCN')))
	            			continue;
	            		if ((s == 'WB' || s == 'WCN') && (existingLicTypes.contains('WBN') || selectedLicTypes.contains('WBN')))
	            			continue;
	            		Boolean selected = selectedLicTypes.contains(s);
		            	if (lmap.get(s).Type_Of_Add_On__c == 'Sublicense' || lmap.get(s).Type_Of_Add_On__c == 'Permit')
				            	licTypeStruct.optionalSLP.add(new DX_Utils.LicenseType(selected,false,isApplication,lmap.get(s)));	
			            else if (lmap.get(s).Type_Of_Add_On__c == 'Privilege') 
				            	licTypeStruct.optionalPrv.add(new DX_Utils.LicenseType(selected,false,isApplication,lmap.get(s)));	
	            	}
	            }
            }


            // Since the user could have unselected an included option, we have to show these again.
            // But let's add these to the optional list now, since they aren't mandatory.
            if(primary.Included_Add_On_Privileges__c!=null){
	            for(string s:primary.Included_Add_On_Privileges__c.split(';')){
	            	if(s!='' && lmap.containsKey(s) && !existingLicTypes.contains(s))
		            	if (lmap.get(s).Type_Of_Add_On__c == 'Sublicense' || lmap.get(s).Type_Of_Add_On__c == 'Permit')
			            	licTypeStruct.optionalSLP.add(new DX_Utils.LicenseType(true,false,isApplication,lmap.get(s)));	
			            else if (lmap.get(s).Type_Of_Add_On__c == 'Privilege') 
			            	licTypeStruct.optionalPrv.add(new DX_Utils.LicenseType(true,false,isApplication,lmap.get(s)));	

	            }
            }
            if (primary.Included_Not_12Mo_Add_Ons_Privileges__c != null && (app.abd_Length__c !='12 months')) {
             for(string s:primary.Included_Not_12Mo_Add_Ons_Privileges__c.split(';')){
                    if(s!='' && lmap.containsKey(s) && !existingLicTypes.contains(s))
		            	if (lmap.get(s).Type_Of_Add_On__c == 'Sublicense' || lmap.get(s).Type_Of_Add_On__c == 'Permit')
			            	licTypeStruct.optionalSLP.add(new DX_Utils.LicenseType(true,false,isApplication,lmap.get(s)));	
			            else if (lmap.get(s).Type_Of_Add_On__c == 'Privilege') 
			            	licTypeStruct.optionalPrv.add(new DX_Utils.LicenseType(true,false,isApplication,lmap.get(s)));	

                }   
            }

            // I think we're all done, so let's build the container object to pass back to JS

            return new ApplicationAddInit (app, licTypeStruct);


        }catch (Exception ex) {
        	system.debug(ex.getMessage() + ex.getStackTraceString());
        	throw new AuraHandledException(ex.getMessage() + ex.getStackTraceString());
        }
    }
    
	//Method for DX_AddPrivilegeApplication
    @AuraEnabled
    public static string createAddApp(string lts, MUSW__Application2__c app,string os){
        Savepoint sp = Database.setSavepoint();
        try{
            User u = [Select ContactId From User Where Id = :UserInfo.getUserId()];
            if(u.ContactId==null){
                throw new AuraHandledException ('It looks like you are no longer logged in to the system.  Unable to save the information');
                return null;
            }

            // Build a list of all of the selected options 
			DX_Utils.LicenseTypeStructure lTypes = (DX_Utils.LicenseTypeStructure) JSON.deserializeStrict(lts,DX_Utils.LicenseTypeStructure.class);
            list<DX_Utils.LicenseType> llt = new list<DX_Utils.LicenseType>();
            llt.addAll(lTypes.optionalSLP);
            llt.addAll(lTypes.optionalPrv);
            list<MUSW__License2__c> licenses = new list<MUSW__License2__c>();


            // LICENSE OBJECT - for everything they selected for options.
            for(DX_Utils.LicenseType lt:llt){
            	if(lt.selected){
	            	MUSW__License2__c lic = new MUSW__License2__c();
	            	lic.MUSW__Applicant__c = app.MUSW__Applicant__r.Id;
	            	lic.name='System Number';
	            	lic.MUSW__Class__c = lt.ltype.abd_Class__c;
	            	lic.abd_License_Type__c = lt.ltype.abd_License_Type__c;
	            	licenses.add(lic);
            	}   
            }
            insert licenses;

            // APPLICATION OBJECT - built early and passed around before we actually write it out.
			app.abd_Outdoor_Service_Area_Boundary_Info__c=os;
			system.debug(app);
            insert app;

            // LICENSE APPLICATION OBJECTS (one per each license record added)
            list<abd_License_Application__c> lla = new list<abd_License_Application__c>();
            for(MUSW__License2__c l:licenses){
            	lla.add(new abd_License_Application__c(abd_Application__c=app.Id,abd_License__c=l.Id,abd_Primary_License__c=false,abd_Application_Status__c='Pending',abd_Portal_Processed__c = true));
            }
            insert lla;


            return 'SUCCESS: ' + String.valueOf(app.Id);
        }catch (Exception ex) {
            Database.rollback(sp);
            System.debug(ex.getMessage() + ex.getStackTraceString());
        	throw new AuraHandledException(ex.getMessage() + ex.getStackTraceString());
        }
    }

    // WE need to manage moving from a pending to in progress state to get the DRE rules to fire.
 	@AuraEnabled
    public static void updateLicenseApplicationRecords(Id appId ){
    	try {
	    	list<abd_License_Application__c> lla = [Select ID, abd_Application_Status__c from abd_License_Application__c where abd_Application__c=:appId];
	    	if (lla.size() > 0) {
	    		for (abd_License_Application__c la : lla) {
	    			la.abd_Application_Status__c = 'In Progress';
	    		}
	    		
	    		// update them all
	    		update lla;
	    	}
    	} catch (Exception ex) {
    		throw new AuraHandledException (ex.getMessage() + ex.getStackTraceString());
    	}
    }
	   
 
    @AuraEnabled
    public static string getFeeSchedule(string appInfo){
	        return DX_Utils.getFeeSchedule(appInfo);
    }
    
    public class ApplicationAddInit{

		@AuraEnabled public MUSW__Application2__c app {get;set;}
		@AuraEnabled public DX_Utils.LicenseTypeStructure licTypeList {get;set;}

		public ApplicationAddInit(MUSW__Application2__c app, DX_Utils.LicenseTypeStructure licTypeList) {
			this.app = app;        // a license object to return
			this.licTypeList = licTypeList;
		}
		

	}
}