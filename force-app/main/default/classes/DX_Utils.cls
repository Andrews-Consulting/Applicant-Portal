public class DX_Utils {

	// Passing in the key of any object, this routine returns the name from the record (could be from Name or DeveloperName field)

	public static string GetNamefromRecordID(String sourceID){
		if (sourceID == null || sourceID == '') return String.valueOf(-1);			// missing the Id
		if (sourceID.length() < 15) return String.valueOf(-2);		// invalid ID 

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

        if (objectName == '') return String.valueOf(-3);			// hmm couldn't find an object for the ID prefix.
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

        MUSW__License2__c activeLicense = [Select 
											abd_dram_shop__c, abd_effective_date__c, abd_effective_end_date__c, abd_length__c, abd_local_authority__c,
											abd_premise_address_2__c, abd_premise_address__c, abd_premise_city__c, abd_premise_state__c, abd_premise_zip__c,
											abd_primary_contact__c, abd_square_footage__c, musw__applicant__c, musw__primary__c, musw__primary_licensee__c,
											abd_application_id__c, abd_dram_policy_number__c, abd_dram_policy_effective_date__c, abd_dram_policy_expiration_date__c,
											abd_outdoor_service_endorsement__c, abd_premise_county__c, abd_city_population__c, abd_county_population__c,
											abd_time_of_auction_beginning__c, abd_time_of_auction_ending__c, abd_business_name__c, abd_dba__c,
											abd_business_operations__c, abd_business_type__c, abd_local_authority_is_state__c, abd_bond_number__c,
											abd_bond_company__c, bond_effective_date__c, abd_temporary_or_permanent__c, abd_premise_from__c, abd_premise_to__c,
											abd_primary_license__c, abd_continuous_until_cancelled__c, abd_square_footage_retail_area__c, abd_premises_type__c,
											abd_dues_member_number__c, abd_premise_vehicles_type__c, abd_sell_gasoline__c, abd_veterans_organization__c, abd_Other_Criteria__c,
											abd_License_Type__c from MUSW__License2__c where ID = :licenseId];

        MUSW__Application2__c newApp = new MUSW__Application2__c();

		newApp.abd_DRAM_shop__c = activeLicense.abd_DRAM_Shop__c;
		newApp.abd_Effective_Date_of_Current_License__c = activeLicense.abd_Effective_Date__c;
		newApp.abd_Effective_End_Date_of_Current_Lic__c = activeLicense.abd_Effective_End_Date__c;
		newApp.abd_Length__c = activeLicense.abd_Length__c;
		newApp.abd_Local_Authority__c  = activeLicense.abd_Local_Authority__c;
		newApp.abd_Premise_Address_2__c = activeLicense.abd_Premise_Address_2__c;
		newApp.abd_Premise_Address__c = activeLicense.abd_Premise_Address__c;
		newApp.abd_Premise_City__c = activeLicense.abd_Premise_City__c;
		newApp.abd_Premise_State__c = activeLicense.abd_Premise_State__c;
		newApp.abd_Premise_Zip_Code__c = activeLicense.abd_Premise_Zip__c;
		newApp.abd_Primary_Contact__c = activeLicense.abd_Primary_Contact__c;
		newApp.abd_Square_Footage__c = activeLicense.abd_Square_Footage__c;
		newApp.MUSW__Applicant__c = activeLicense.MUSW__Applicant__c;
		newApp.MUSW__Account__c = activeLicense.MUSW__Primary_Licensee__c;
		newApp.abd_DRAM_Policy_Number__c = activeLicense.abd_DRAM_Policy_Number__c;
		newApp.abd_DRAM_Policy_Effective_Date__c = activeLicense.abd_DRAM_Policy_Effective_Date__c;
		newApp.abd_DRAM_Policy_Expiration_Date__c = activeLicense.abd_DRAM_Policy_Expiration_Date__c;
		newApp.abd_Outdoor_Service_Endorsement__c = activeLicense.abd_Outdoor_Service_Endorsement__c;
		newApp.abd_Premise_County__c = activeLicense.abd_Premise_County__c;
		newApp.abd_City_Population__c = activeLicense.abd_City_Population__c;
		newApp.abd_County_Population__c = activeLicense.abd_County_Population__c;
		newApp.abd_Time_of_Auction_Beginning__c = activeLicense.abd_Time_of_Auction_Beginning__c;
		newApp.abd_Time_of_Auction_Ending__c = activeLicense.abd_Time_of_Auction_Ending__c;
		newApp.abd_Business_Name__c = activeLicense.abd_Business_Name__c;
		newApp.abd_DBA__c = activeLicense.abd_DBA__c;
		newApp.abd_Business_Operations__c = activeLicense.abd_Business_Operations__c;
		newApp.abd_Business_Type__c = activeLicense.abd_Business_Type__c;
		newApp.abd_Local_Authority_is_State__c = activeLicense.abd_Local_Authority_is_State__c;
		newApp.abd_Bond_Number__c = activeLicense.abd_Bond_Number__c;
		newApp.abd_Bond_Company__c = activeLicense.abd_Bond_Company__c;
		newApp.abd_Bond_Effective_Date__c = activeLicense.Bond_Effective_Date__c;
		newApp.abd_Temporary_or_Permanent__c = activeLicense.abd_Temporary_or_Permanent__c;
		newApp.abd_Premise_From__c = activeLicense.abd_Premise_From__c;
		newApp.abd_Premise_To__c = activeLicense.abd_Premise_To__c;
//		newApp.abd_Primary_License__c = activeLicense.abd_Primary_License__c;
		newApp.ABD_Continuous_Until_Cancelled__c = activeLicense.ABD_Continuous_Until_Cancelled__c;
		newApp.Square_Footage_Retail_Area__c = activeLicense.abd_Square_Footage_Retail_Area__c;
		newApp.Premises_Type__c = activeLicense.abd_Premises_Type__c;
//		newApp.abd_Dues_Member_Number__c = activeLicense.abd_Dues_Member_Number__c;
//		newApp.abd_Premises_Vehicle_Type__c = activeLicense.abd_Premise_Vehicles_Type__c;
//		newApp.abd_Sell_Gasoline__c = activeLicense.abd_Sell_Gasoline__c;
//		newApp.abd_Veterans_Organization__c = activeLicense.abd_Veterans_Organization__c;
		newApp.abd_Other_Criteria__c  = activeLicense.abd_Other_Criteria__c;
		newApp.abd_Primary_License__c = activeLicense.Id;
		newApp.abd_PortalWork_LicenseType__c = activeLicense.abd_License_Type__c;
		newApp.abd_PortalWork_PsuedoApp__c = true;
		newApp.recalculateFormulas();		// only recalculates formulas build on internal object fields (no cross object fields)

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

	// Provides a list of the primary and related license types for the specified (primary) license.
	public static list<String> AllRelatedLicenseTypes(ID licenseId) {

		list<String> lt = new list<String>();
// System.debug('0. lt size = ' + lt.size());

		list<MUSW__License2__c> q = [Select abd_License_Type__c, abd_effective_date__c, abd_effective_end_date__c from MUSW__License2__c where Id = :licenseId];

       	if (q.size() > 0) {
// System.debug('q[0].abd_effective_date__c - ' + q[0].abd_effective_date__c + ' System.Today() ' + System.today());
// System.debug('q[0].abd_effective_end_date__c - ' + q[0].abd_effective_end_date__c + ' System.Today() ' + System.today());
       		if ((q[0].abd_effective_date__c != null && q[0].abd_effective_date__c <= System.today()) || q[0].abd_effective_date__c == null)
       			if ((q[0].abd_effective_end_date__c != null && q[0].abd_effective_end_date__c >= System.today()) || q[0].abd_effective_end_date__c == null)
	       			lt.add(q[0].abd_License_Type__c);
       	}

// System.debug('1. lt size = ' + lt.size());

        for (MUSW__License2__c r : [Select abd_License_Type__c, abd_effective_date__c, abd_effective_end_date__c from MUSW__License2__c where abd_Primary_License__r.Id = :licenseId]) {
        	if ((r.abd_effective_date__c != null && r.abd_effective_date__c <= System.today()) || r.abd_effective_date__c == null)
        		if ((r.abd_effective_end_date__c != null && r.abd_effective_end_date__c >= System.today()) || r.abd_effective_end_date__c == null)
		        	lt.add(r.abd_License_Type__c);
	    }
// System.debug('2. lt size = ' + lt.size());
        return lt;
	}


	// return back just a couple of the date fields in the license object.  This is used when we want to pass to the browser dates for validation.
	public static MUSW__License2__c GetLicenseDates(Id licenseId) {
		list<MUSW__License2__c> q = [Select abd_License_Type__c, abd_effective_date__c, abd_effective_end_date__c from MUSW__License2__c where Id = :licenseId];
		if (q.size() > 0) return q[0];
		else return new MUSW__License2__c();
	}


	public class appFromLicense {
		MUSW__Application2__c app {get; set;}
	}
}