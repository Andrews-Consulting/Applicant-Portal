public without sharing class DX_DynamicRecordListController {
	
	@AuraEnabled
    public static auraObjectList getObjectList(String typeName,String fsName,Id rId,integer fieldNums){
        system.debug('TYPE NAME: '+typeName);
        system.debug('Field Set NAME: '+fsName);
        system.debug('Record Id: '+rId);
        //system.debug('Length: '+fieldNums);
        Schema.SObjectType targetType = Schema.getGlobalDescribe().get(typeName);
        Schema.DescribeSObjectResult d = targetType.getDescribe();
        Map<String, Schema.FieldSet> fsMap = d.fieldSets.getMap();
        Map<String,Schema.SObjectField> mapFields = d.fields.getMap();
        Schema.FieldSet fs = fsMap.get(fsName);
        List<Schema.FieldSetMember> fieldSet = fs.getFields();
        List<FSetMember> fset = new List<FSetMember>();
        set<string> fieldsToShow = new set<string>();
        for (integer i=0;i<integer.valueOf(fieldNums);i++){
        	if(i<fieldSet.size()){
	        	Schema.FieldSetMember f = fieldSet[i];
	            fieldsToShow.add(f.fieldPath);
	            string[] options = new string[]{};
	            
	            if(string.valueOf(f.getType())=='PICKLIST' || string.valueOf(f.getType())=='MULTIPICKLIST'){
	            	// Get the details for the field            
	            	Schema.DescribeFieldResult fieldDetails = mapFields.get(f.fieldPath).getDescribe();
	                List<Schema.PicklistEntry> ple = fieldDetails.getPicklistValues();
	                if(string.valueOf(f.getType())!='MULTIPICKLIST')
	                    options.add('--None--');
	                for (Schema.PicklistEntry fpe: ple) {
	                    options.add(fpe.getLabel());
	                }
	            }
	            fset.add(new FSetMember(f,options));
        	}
        }
        // All done with getting the source fields, let's go get the data.
		list<sObject> tempList = new list<sObject>();
            
        // Get the data and Populate the fields in the empty record.
        try{
        	list<string> tempStringList = new list<string>();
        	tempStringList.addAll(fieldsToShow);
            String soql = 'Select ' + String.join(tempStringList, ' , ') + ' from ' + targetType + ' where Application__c = :rId';
            // system.debug(soql);
            for(sObject temp:Database.query(soql)){
            	// Build an Empty record of the correct type
        		//sObject rec = Schema.getGlobalDescribe().get(string.valueOf(targetType)).newSObject();
            	
	            //rec.Id = temp.Id;
	            // For every field in the source string, get the fieldname and the value and plug them in.            
	            //for(String field : fieldsToShow) {
	            //    rec.put(field,temp.get(field));
	                // system.debug(field+' : '+temp.get(field));
	            //}
	            tempList.add(temp);
            }

        }catch(exception ex){}

        //system.debug(rec);

        // We have to spin through the fields one more time, looking for type of "Reference".  This is a record id to something else
        // We call another routine which will go read that record and return back the name on the record
        /*for (FieldSetMember fsm : fset) {
            if (fsm.type == 'REFERENCE') {
                String workingID = (String)rec.get(fsm.fieldPath);
                //system.debug(workingID);
                String refValue = DX_Utils.GetNamefromRecordID(workingID);
                //system.debug(refValue);
                rec.put(fsm.fieldPath, refValue);
            }
        }*/
        
        //system.debug(rec);
        
        // Build up our return object        
        auraObjectList tempObList = new auraObjectList(tempList);
        tempObList.fieldSetList = fset;

        //system.debug(tempOb);
        
        return tempObList;
    }
    
    public class FSetMember {

    public FSetMember(Schema.FieldSetMember f,String[] opts) {
        this.DBRequired = f.DBRequired;
        this.fieldPath = f.fieldPath;
        this.label = f.label;
        this.required = f.required;
        this.type = '' + f.getType();
	        this.options = opts;
		}
	
	    public FSetMember(Boolean DBRequired) {
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
	    public String type { get; set; }
	    
	    @AuraEnabled
        public String[] options { get; set; }
	}
	
	
    public class auraObjectList{
        
        public auraObjectList(list<sObject> lob) {
            this.lobj = lob;
            this.fieldSetList = new list<FSetMember>();
        }

        @AuraEnabled
        public list<sObject> lobj { get;set; }
        
        @AuraEnabled
        // leveraging the field set object to pass information around.
        public list<FSetMember> fieldSetList { get;set; }
        
        
    }
}