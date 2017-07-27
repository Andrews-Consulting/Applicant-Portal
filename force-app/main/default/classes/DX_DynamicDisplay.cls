public class DX_DynamicDisplay {
    @AuraEnabled
    public static auraObject getFields(String typeName,String fsName,Id rId){
        String fieldsToShow = 'Id,Name';
        Schema.SObjectType targetType = Schema.getGlobalDescribe().get(typeName);
        Map<String,Schema.SObjectField> mapFields = targetType.getDescribe().fields.getMap();
        list<FieldSetMember> fset = new list<FieldSetMember>();

        integer maxCol=0;
        for(prtl_FieldDisplay__mdt field :[Select FieldName__c,ColumnOrder__c,Column__c,DeveloperName,MasterLabel,isRequired__c,IsReadOnly__c 
                                           from prtl_FieldDisplay__mdt 
                                           where ObjectName__c=:typeName and LicenseTypeCode__c=:fsName
                                          order by Column__c,ColumnOrder__c]){
            
            // convert referential notation.
            string fName = (!field.FieldName__c.contains('__r.'))?field.FieldName__c:field.FieldName__c.left(field.FieldName__c.indexOf('__r.'))+'__c';

            // Get the details for the field            
            Schema.DescribeFieldResult fieldDetails = mapFields.get(fName).getDescribe();

            // Build up the list of field names for a SOQL call
            fieldsToShow+=',';
            fieldsToShow+=field.FieldName__c;

            string[] options = new string[]{};
            
            // If we notice a picklist, then let's go get the list of values now.
            if(string.valueOf(fieldDetails.getType())=='PICKLIST' || string.valueOf(fieldDetails.getType())=='MULTIPICKLIST'){
                List<Schema.PicklistEntry> ple = fieldDetails.getPicklistValues();
                if(string.valueOf(fieldDetails.getType())!='MULTIPICKLIST')
                    options.add('--None--');
                for (Schema.PicklistEntry f: ple) {
                    options.add(f.getLabel());
                }
            }

            // Keep track of the maximum nuber of columns to display.
            if(field.Column__c > maxCol)
                maxCol=(integer)field.Column__c;

            // Build up the new field set to hold all of the information.
            fset.add(new FieldSetMember(field,fieldDetails.getType(),options));    
        }

        // All done with getting the source fields, let's go get the data.

        // Build an Empty record of the correct type
        sObject rec = Schema.getGlobalDescribe().get(string.valueOf(targetType)).newSObject();

        // Get the data and Populate the fields in the empty record.
        try{
            String soql = 'Select ' + fieldsToShow + ' from ' + targetType + ' where Id = :rId';
            // system.debug(soql);
            sObject temp = Database.query(soql);
            rec.Id = temp.Id;
            // For every field in the source string, get the fieldname and the value and plug them in.            
            for(String field : fieldsToShow.split(',')) {
                rec.put(field,temp.get(field));
                // system.debug(field+' : '+temp.get(field));
            }

        }catch(exception ex){}

        //system.debug(rec);

        // We have to spin through the fields one more time, looking for type of "Reference".  This is a record id to something else
        // We call another routine which will go read that record and return back the name on the record
        for (FieldSetMember fsm : fset) {
            if (fsm.type == 'REFERENCE') {
                String workingID = (String)rec.get(fsm.fieldPath);
                //system.debug(workingID);
                String refValue = DX_Utils.GetNamefromRecordID(workingID);
                //system.debug(refValue);
                rec.put(fsm.fieldPath, refValue);
            }
        }
        
        //system.debug(rec);
        
        // Build up our return object        
        auraObject tempOb = new auraObject(rec);
        tempOb.columns = maxCol;
        tempOb.fieldSetList = fset;

        //system.debug(tempOb);
        
        return tempOb;
    }

//            else if (string.valueOf(fieldDetails.getType()) == 'REFERENCE')


    @AuraEnabled
    public static string upRecordApex(sObject obj){
        try{
            system.debug(obj);
            update obj;
        }catch(exception ex){
            return ex.getMessage();
        }
        return 'Saved';
    }
        
    public class FieldSetMember {

        public FieldSetMember(prtl_FieldDisplay__mdt f, Schema.DisplayType dType,String[] opts) {
            this.fieldPath = f.FieldName__c;
            this.label = f.MasterLabel;
            this.required = f.isRequired__c;
            this.readOnly = f.IsReadOnly__c;
            this.type = '' + dType;
            this.sOrder = string.ValueOf(f.ColumnOrder__c);
            this.column = string.ValueOf(f.Column__c);
            this.options = opts;
        }

        public FieldSetMember(Boolean DBRequired) {
            this.DBRequired = DBRequired;
        }

        @AuraEnabled
        public Boolean DBRequired { get;set; }

        @AuraEnabled
        public String fieldPath { get;set; }

        @AuraEnabled
        public String label { get;set; }

        @AuraEnabled
        public Boolean required { get;set; }

        @AuraEnabled
        public Boolean readOnly { get;set; }

        @AuraEnabled
        public String type { get; set; }
        
        @AuraEnabled
        public String sOrder { get; set; }
        
        @AuraEnabled
        public String column { get; set; }
        
        @AuraEnabled
        public String[] options { get; set; }
        
    }
    
    public class auraObject{
        
        public auraObject(sObject ob) {
            this.obj = ob;
            this.columns = 1;
            this.fieldSetList = new list<FieldSetMember>();
        }

        @AuraEnabled
        public sObject obj { get;set; }
        
        @AuraEnabled
        // leveraging the field set object to pass information around.
        public list<FieldSetMember> fieldSetList { get;set; }
        
        @AuraEnabled
        // Holds the number of columns in the display
        public integer columns { get;set; }
        
        
    }
}