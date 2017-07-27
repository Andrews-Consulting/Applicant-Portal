public class DX_ApplicantForm {
    static String notAnswered = '--Not Answered--';

    // get the values from the contact record.  First we have to get the contact record id from the user record of the current user.
    // If we don't get anything back on the first SOQL, then the user is not logged on.  We're going to assume that they timed out, since
    // this should have been executed from an authorized page.
    @AuraEnabled
    public static Contact getContact(){
        
        User u = [Select ContactId From User Where Id = :UserInfo.getUserId()];
        // if this fails (user timed out), then we need to 
        if (u === (User)null) return new Contact();

        return [Select Id, Phone,MobilePhone,MailingStreet,MailingCity,MailingState,MailingPostalCode,abd_Mailing_County__c,FirstName,LastName from Contact where Id=:u.ContactId];
    }

    // Get the list of values for the picklist field and pass them back to the lightning component.
    // Add the -- not answered-- choice as the first value.  If we move to radial buttons, this can all change.
    @AuraEnabled
    public static List<String> getCitizenType(){

        List<String> options = new List<String>();
        Schema.DescribeFieldResult fieldResult = Contact.abd_U_S_Citizen__c.getDescribe();
        List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
            options.add(notAnswered);
        for (Schema.PicklistEntry f: ple) {
            options.add(f.getLabel());
        }
        
        return options;
    }

    // Update the record - called from Lightning component.  The lightning component handles the validation now. 

    @AuraEnabled
    public static String upRecordApex(Contact applicant){
        
        try{
            update applicant;
        }catch(exception ex){
            return ex.getMessage();
        }
        
        return 'Update Successful';
    }
}