public class DX_Application_StaticFields {
	
    static String notAnswered = '--None--';
	
    // get the values from the application record.
    @AuraEnabled
    public static MUSW__Application2__c getApplication(Id applicationId){
        
        return [Select Id, abd_Effective_Date__c,abd_Application_Date__c,MUSW__Description__c,abd_Premise_Address__c,abd_Premise_Address_2__c,abd_Premise_City__c,abd_Premise_County__c,abd_Premise_State__c,abd_Premise_Zip_Code__c,abd_Temporary_or_Permanent__c from MUSW__Application2__c where Id=:applicationId];
    }

    // Get the list of values for the picklist field and pass them back to the lightning component.
    // Add the -- not answered-- choice as the first value.  If we move to radial buttons, this can all change.
    @AuraEnabled
    public static List<List<String>> getPicklistValues(){
		List<List<String>> pickVals = new List<List<String>>();
        List<String> options = new List<String>();
        Schema.DescribeFieldResult fieldResult = MUSW__Application2__c.abd_Premise_County__c.getDescribe();
        List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
            options.add(notAnswered);
        for (Schema.PicklistEntry f: ple) {
            options.add(f.getLabel());
        }
        pickVals.add(options);
        options = new List<String>();
        fieldResult = MUSW__Application2__c.abd_Premise_State__c.getDescribe();
        ple = fieldResult.getPicklistValues();
            options.add(notAnswered);
        for (Schema.PicklistEntry f: ple) {
            options.add(f.getLabel());
        }
        pickVals.add(options);
        options = new List<String>();
        fieldResult = MUSW__Application2__c.abd_Temporary_or_Permanent__c.getDescribe();
        ple = fieldResult.getPicklistValues();
            options.add(notAnswered);
        for (Schema.PicklistEntry f: ple) {
            options.add(f.getLabel());
        }
        pickVals.add(options);
        return pickVals;
    }

    // Update the record - called from Lightning component.  The lightning component handles the validation now. 

    @AuraEnabled
    public static String upRecordApex(MUSW__Application2__c application,MUSW__Application2__c app2){
        system.debug(app2);
        Map<String, Schema.SObjectField> schemaFieldMap = Schema.SObjectType.MUSW__Application2__c.fields.getMap();
        for(String fieldName : schemaFieldMap.keySet()){
        	if(app2.get(fieldName)!=null)
                application.put(fieldName,app2.get(fieldName));
        }
        try{
            update application;
        }catch(exception ex){
            return ex.getMessage();
        }
        
        return 'Update Successful';
    }
}