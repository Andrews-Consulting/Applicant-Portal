public class DX_ApplicationForm {
    
    // get the values from the application record.
    @AuraEnabled
    public static MUSW__Application2__c getApplication(Id applicationId){
        
        String objectName = 'MUSW__Application2__c';
        String query = 'SELECT';
        Map<String, Schema.SObjectField> objectFields = Schema.getGlobalDescribe().get(objectName).getDescribe().fields.getMap();
        system.debug(objectFields);
        // Grab the fields from the describe method and append them to the queryString one by one.
        
        for(String s : objectFields.keySet()) {
            if(objectFields.get(s).getDescribe().isAccessible())
            	query += ' ' + s + ',';
        }
        
        // Manually add related object's fields that are needed.
        //query += 'Account.Name,'; // modify as needed
        
        // Strip off the last comma if it exists.
        if (query.subString(query.Length()-1,query.Length()) == ','){
            query = query.subString(0,query.Length()-1);
        }
        
        // Add FROM statement
        query += ' FROM ' + objectName;
        
        // Add on a WHERE/ORDER/LIMIT statement as needed
        query += ' WHERE id=:applicationId'; // modify as needed
        system.debug(query);
        try {
            MUSW__Application2__c app = database.query(query);
            return app;
        } catch (QueryException e){
            //perform exception handling
            return new MUSW__Application2__c();
        }
        //[Select Id, Primary_Lic_Type__c,abd_Application_Type__c,name from MUSW__Application2__c where Id=:applicationId];
    }
    @AuraEnabled
    public static String upRecordApex(MUSW__Application2__c application){
        
        try{
            update application;
        }catch(exception ex){
            return ex.getMessage();
        }
        
        return 'Update Successful';
    }
    @AuraEnabled
    public static map<string,boolean> getFieldVisibility(){
        map<string,boolean> FieldVisibility = new map<string,boolean>();
        String objectName = 'MUSW__Application2__c';
        Map<String, Schema.SObjectField> objectFields = Schema.getGlobalDescribe().get(objectName).getDescribe().fields.getMap();
        
        for(String s : objectFields.keySet()) {
            if(objectFields.get(s).getDescribe().isAccessible()){
            	FieldVisibility.put(s,!objectFields.get(s).getDescribe().isUpdateable());
                system.debug('Field: '+s+' readOnly: '+!objectFields.get(s).getDescribe().isUpdateable());
        
            }
        }
        return FieldVisibility;
    }
}