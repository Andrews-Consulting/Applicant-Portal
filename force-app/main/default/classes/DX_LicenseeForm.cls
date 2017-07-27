public without sharing class DX_LicenseeForm {
    static String notAnswered = '--None--';

    // get the values from the Account record.  First we have to get the Account record id from the user record of the current user.
    // If we don't get anything back on the first SOQL, then the user is not logged on.  We're going to assume that they timed out, since
    // this should have been executed from an authorized page.
    @AuraEnabled
    public static Account getAccount(String appId){
        
        User u = [Select Contact.AccountId From User Where Id = :UserInfo.getUserId()];

        // if this fails (user timed out), then we need to 
        if (u == (User)null || u.ContactId == null || u.Contact.AccountId == null) return new Account();

        list<Account> a = new list<Account>();
        if (String.valueOf(appId).left(3) == Schema.SObjectType.MUSW__Application2__c.getKeyPrefix()) {
            a = [Select Id,Name, Phone,Business_Type__c,BillingStreet,BillingCity,BillingState,BillingPostalCode,abd_Corporate_ID_Number__c,abd_Account_Email_Address__c,abd_DBA__c from Account 
                        where Id in (select MUSW__Account__c from MUSW__Application2__c where ID =: appId)];
            }
        else 
        if (String.valueOf(appId).left(3) == Schema.SObjectType.MUSW__License2__c.getKeyPrefix()) {
            a = [Select Id,Name, Phone,Business_Type__c,BillingStreet,BillingCity,BillingState,BillingPostalCode,abd_Corporate_ID_Number__c,abd_Account_Email_Address__c,abd_DBA__c from Account 
                        where Id in (select MUSW__Primary_Licensee__c from MUSW__License2__c where ID =: appId) limit 1];
            }



        // if (String.isEmpty(a.Name)) a.Name = ' ';
        // if (String.isEmpty(a.Phone)) a.Phone = ' ';
        // if (String.isEmpty(a.BillingStreet)) a.BillingStreet = ' ';
        // if (String.isEmpty(a.BillingCity)) a.BillingCity = ' ';
        // if (String.isEmpty(a.BillingState)) a.BillingState = ' ';
        // if (String.isEmpty(a.BillingPostalCode)) a.BillingPostalCode = ' ';
        // if (String.isEmpty(a.abd_Corporate_ID_Number__c)) a.abd_Corporate_ID_Number__c = ' ';
        // if (String.isEmpty(a.abd_Account_Email_Address__c)) a.abd_Account_Email_Address__c = ' ';
        // if (String.isEmpty(a.abd_DBA__c)) a.abd_DBA__c = ' ';

        if (a.size() > 0)
            return a[0];
        else
            throw new AuraHandledException('No related Licensee (Account) record found for the record Id Provided ' + appId);
    }
	// get the values from the contact record.  First we have to get the contact record id from the user record of the current user.
    // If we don't get anything back on the first SOQL, then the user is not logged on.  We're going to assume that they timed out, since
    // this should have been executed from an authorized page.

    // appId could point to an application or a license.  First look to see if the applicant is set on either of those objects
    // If not, then we use the current user.
    @AuraEnabled
    public static Contact getContact(String appId){
        
        Id pc;
        if (String.valueOf(appId).left(3) == Schema.SObjectType.MUSW__Application2__c.getKeyPrefix()) {
            list<MUSW__Application2__c> alist = [Select MUSW__Applicant__c from MUSW__Application2__c where Id = :appid limit 1];
            if (alist.size() > 0) 
                pc = alist[0].MUSW__Applicant__c;
        }
        if (String.valueOf(appId).left(3) == Schema.SObjectType.MUSW__License2__c.getKeyPrefix()) {
            list<MUSW__License2__c> llist = [Select MUSW__Applicant__c from MUSW__License2__c where Id = :appid limit 1];
            if (llist.size() > 0) 
                pc = llist[0].MUSW__Applicant__c;
        }

        list<Contact> c = new list<Contact>();
        if (pc != null) {
            c = [Select Id, Phone,Email,FirstName,LastName from Contact where Id = :pc];
        }
        else 
        {            
            User u = [Select ContactId From User Where Id = :UserInfo.getUserId()];
            // if this fails (user timed out), then we need to 
            if (u != (User)null && u.ContactId != (Id)null) 
                c = [Select Id, Phone,Email,FirstName,LastName from Contact where Id=:u.ContactId];
        }
        
        // // remove this once the locker service is fixed to handle null values on the client side correctly.
        // if (String.isEmpty(c.Email)) c.Email = ' ';
        // if (String.isEmpty(c.MobilePhone)) c.MobilePhone = ' ';
        // if (String.isEmpty(c.FirstName)) c.FirstName = ' ';
        // if (String.isEmpty(c.LastName)) c.LastName = ' ';

        if (c.size() > 0)
            return c[0];
        else
            throw new AuraHandledException('No related Applicant (contact) record found for the record Id Provided ' + appId);

    }
    // Get the list of values for the picklist field and pass them back to the lightning component.
    // Add the -- not answered-- choice as the first value.  If we move to radial buttons, this can all change.
    @AuraEnabled
    public static map<string,string[]> getPicklistValues(Id objectId){
		map<string,string[]> pickVals = new map<string,string[]>();
        string[] options = new string[]{};
        Schema.DescribeFieldResult fieldResult = MUSW__Application2__c.abd_Premise_State__c.getDescribe();
        List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
            options.add(notAnswered);
        for (Schema.PicklistEntry f: ple) {
            options.add(f.getLabel());
        }
        pickVals.put('state',options);

        // for business types - Don't include municipality if this is an out of state license.

        Boolean showMunicip = true;
      
        list<MUSW__Application2__c> ooslist = [Select id, Primary_Lic_Type__c from  MUSW__Application2__c where Id = :objectId];
        if (ooslist.size() > 0) {
            String primLicenseType = ooslist[0].Primary_Lic_Type__c;
            list<abd_License_Types__c> ltlist = [Select abd_License_Type__c from abd_License_Types__c where PremisesMustBeIowa__c = false and abd_License_Type__c = :primLicenseType ];
            if (ltlist.size() > 0)
                showMunicip = false;
        }

        options = new List<String>();
        fieldResult = Account.Business_Type__c.getDescribe();
        ple = fieldResult.getPicklistValues();
            options.add(notAnswered);
        for (Schema.PicklistEntry f: ple) {
            if (f.getLabel() != 'Municipality')
                options.add(f.getLabel());
            else
                if (showMunicip)
                    options.add(f.getLabel());

        }
        pickVals.put('bType',options);
        return pickVals;
    }

    // Update the record - called from Lightning component.  The lightning component handles the validation now. 

    @AuraEnabled
    public static String upRecordApex(Account licensee,Contact applicant){
        
        try{
        	update applicant;
            update licensee;
        }catch(exception ex){
            throw new AuraHandledException(ex.getMessage());
        }
        
        return 'Update Successful';
    }
    // Get the current application 
    @AuraEnabled
    public static MUSW__Application2__c getApplication(String objectId){
        
        User u = [Select ContactId From User Where Id = :UserInfo.getUserId()];
        // if this fails (user timed out), then we need to 
        //if (u == (User)null || u.ContactId == null) return new MUSW__Application2__c();
        if (objectId.left(3) == Schema.SObjectType.MUSW__Application2__c.getKeyPrefix()) {
            list<MUSW__Application2__c> app =  [Select Id,Name,abd_Other_Criteria__c,abd_Premise_Address__c,abd_Premise_City__c,abd_Premise_State__c,
                abd_Premise_Zip_Code__c,abd_Premise_County__c,Premises_Type__c,abd_Temporary_or_Permanent__c,
                abd_Effective_Date__c,abd_Effective_End_Date__c,abd_Local_Authority__c,abd_Square_Footage__c,
                abd_Outdoor_Service_Area_Boundary_Info__c,Primary_Lic_Type__c,abd_Available_as_temporary_license__c,
                abd_Outdoor_Service_Endorsement__c,abd_Time_of_Auction_Beginning__c,
                abd_Time_of_Auction_Ending__c,abd_Use_Mailing__c,abd_DBA__c,abd_Premise_Address_2__c, abd_Local_Authority_Type__c,
                CreatedDate, abd_Charity_Business_Type__c, 
                (select id, abd_License_Type__c from License_Applications__r)
                from MUSW__Application2__c 
                where Id = :objectId
                order by Id DESC limit 1];
            if (app.size() == 0) throw new AuraHandledException('No records returned from Get Application in DX_Licensee Apex');
            return app[0];
        }
        else if (objectId.left(3) == Schema.SObjectType.MUSW__License2__c.getKeyPrefix()) {
            return DX_Utils.CreateAppFromLicense(objectId);
        }
        // Safety code we should never hit.
        return new MUSW__Application2__c();       
    }




    // There are lots of reasons why something isn't a new application, so it's a failure unless proven wrong.
    @AuraEnabled
    public static boolean isNewApplication(String appId){
        Boolean answer = false;
        try{
            if (String.valueOf(appId).left(3) == Schema.SObjectType.MUSW__Application2__c.getKeyPrefix()) {
                List<MUSW__Application2__c> al = [Select recordType.Name from MUSW__Application2__c where Id = :appid limit 1];
                if (al.size() > 0) {
                    String rtn = al[0].recordType.Name;
                    answer = (rtn == 'New Application' || rtn == 'Auction Application' || rtn == 'Keg Registration') ;
                }
            }
        }
        finally{}
        
        return answer;
    }
}