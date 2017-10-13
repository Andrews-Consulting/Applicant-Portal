public class DX_DynamicChecklistQuestions {

    //  Given the id of a checklist version, this returns back the map of question types that are valid.
	//  The hope is that in general, the question types are somewhat static
	// 
	public static map<Id,BGCK__Question_Type__c> getQuestionTypes(Id i){
		map<Id,BGCK__Question_Type__c> temp;
		try{
			temp = new map<Id,BGCK__Question_Type__c>([Select BGCK__Default_Value__c,BGCK__Fieldset_Name__c,BGCK__hasChoices__c,BGCK__Maximum_Length__c,
												BGCK__Name_Number_Currency__c,BGCK__Name_Number_Integer__c,BGCK__Name_Number_Percent__c,
												BGCK__Object_Name__c,BGCK__Preview_Field_Count__c,BGCK__Type__c,(Select Name,BGCK__Display_Value__c, BGCK__Order__c From BGCK__Choices__r order by BGCK__Order__c)
												from BGCK__Question_Type__c where BGCK__Checklist_Version__c=:i]);
			return temp;
		}catch(exception e){
			return new map<Id,BGCK__Question_Type__c>();
		}
		
	}
	public static map<Id,BGCK__Answer__c> getResponses(set<Id> questions,Id aId){
		map<Id,BGCK__Answer__c> temp = new map<Id,BGCK__Answer__c>();
		list<BGCK__Answer__c> newAnswers = new list<BGCK__Answer__c>();
		list<BGCK__Answer__c> existingAnswers = new list<BGCK__Answer__c>();
		if(aId.getSObjectType().getDescribe().getName() == 'MUSW__Application2__c'){
			existingAnswers = [Select Id, Name, BGCK__Actual_Value__c, BGCK__Question__c, BGCK__Actual_Value2__c, BGCK__Page_Question__c, abd_Date_Value__c,Application__c 
								From BGCK__Answer__c b where BGCK__Page_Question__c IN:questions and Application__c=:aId];
		}else if(aId.getSObjectType().getDescribe().getName() == 'Contact'){
			existingAnswers = [Select Id, Name, BGCK__Actual_Value__c, BGCK__Question__c, BGCK__Actual_Value2__c, BGCK__Page_Question__c, abd_Date_Value__c,Application__c 
								From BGCK__Answer__c b where BGCK__Page_Question__c IN:questions and abd_Applicant__c=:aId];	
		}
		for(BGCK__Answer__c a:existingAnswers){
			temp.put(a.BGCK__Page_Question__c,a);											
		}
		for(Id i:questions){
			if(!temp.containsKey(i))
				newAnswers.add(newAnswer(i, aId));//new BGCK__Answer__c(BGCK__Page_Question__c=i, Name='Not Answered Yet',Application__c=aId));
		}
		if(newAnswers.size()>0){
			insert newAnswers;
			for(BGCK__Answer__c a:newAnswers){
				temp.put(a.BGCK__Page_Question__c,a);
			}
		}
		return temp;
	}
	
	public static BGCK__Answer__c newAnswer(Id pq, Id aId){
		if(aId.getSObjectType().getDescribe().getName() == 'MUSW__Application2__c'){
			return new BGCK__Answer__c(BGCK__Page_Question__c=pq, Name='Not Answered Yet',Application__c=aId, BGCK__Actual_Value__c='Not Answered Yet', BGCK__Actual_Value2__c = 'Not Answered Yet');
		}else if(aId.getSObjectType().getDescribe().getName() == 'Contact'){
			return new BGCK__Answer__c(BGCK__Page_Question__c=pq, Name='Not Answered Yet',abd_Applicant__c=aId, BGCK__Actual_Value__c='Not Answered Yet', BGCK__Actual_Value2__c = 'Not Answered Yet');
		}
		return null;
	}

    //	Given a license Type, an application type, the checklist version id, and the application ID 
	//	Return a list of checklist sections that appear on this version of the checklist.
	//  A page of questions is referred as both a page and a section.   This is because a page object is used to 
	//  segment similar questions into a section for the display and capture. 
	//
	//  So the checklist section object contains the page information and the questions for that page.
	//  
    @AuraEnabled
    public static Checklist getChecklist(String lType,String aType,Id rId,Id aId){
		list<ChecklistSection> lcs = new list<ChecklistSection>();
		if(rId==null)
			rId='a1T350000000c9e';
		for(BGCK__Page__c cs:[Select Name, Id, 
								(Select Id, Name, BGCK__Order__c, BGCK__Question__c,BGCK__Criteria__c, BGCK__IsRequired__c, BGCK__Parent_Page_Question__c, 
								BGCK__Question__r.BGCK__Body__c,BGCK__Question__r.BGCK__Question_Type__c
								From BGCK__Page_Questions__r
								where Application_Type__c =: aType and License_Type__c includes (:lType)
								order by BGCK__Order__c) 
								From BGCK__Page__c 
								where BGCK__Checklist_Version__c=:rId 
								order by BGCK__Order__c]){
			if(cs.BGCK__Page_Questions__r.size()>0)
				lcs.add(new ChecklistSection(cs,rId,aId));		
		
		}
		
		return new Checklist(lcs);
	}
	
 	//	Given the application ID and a pagename
	//	Return a single checklist page/section.  
	//  A page of questions is referred as both a page and a section.   This is because a page object is used to 
	//  segment similar questions into a section for the display and capture. 
	//  Since we have the application id, we'll go get the licensetype and the application type
	//
	@AuraEnabled
    public static ChecklistSection getSinglePage(String aId,String pName){
    
    	MUSW__Application2__c app;
    	if (aId.left(3) == Schema.SObjectType.MUSW__Application2__c.getKeyPrefix()) {
    		list<MUSW__Application2__c> applist = [Select Primary_Lic_Type__c, abd_Application_Type__c from MUSW__Application2__c where id =:aId];
    		if (applist.size() > 0) app = applist[0];
    	}
    	else if (aId.left(3) == Schema.SObjectType.MUSW__License2__c.getKeyPrefix()) {
            app =  DX_Utils.CreateAppFromLicense(aId);
        }

    	if (app == null)  
    	 	return null;



    	String lType = ('\''+app.Primary_Lic_Type__c+'\'');
    	String aType = app.abd_Application_Type__c;

		for(abd_License_Application__c la:[select abd_License_Type__c from abd_License_Application__c where abd_Application__c =: aId and abd_Primary_License__c=false]){
    		lType+=(',\' '+la.abd_License_Type__c+'\'');		
    	}
    	string query = 'Select Name, Id,BGCK__Checklist_Version__c, (Select Id, Name, BGCK__Order__c, BGCK__Question__c,BGCK__Criteria__c,'+
    					' BGCK__IsRequired__c, BGCK__Parent_Page_Question__c,BGCK__Question__r.BGCK__Body__c,BGCK__Question__r.BGCK__Question_Type__c'+
    					' From BGCK__Page_Questions__r where Application_Type__c includes (:aType) and License_Type__c includes ('+lType+
    					') order by BGCK__Order__c) From BGCK__Page__c where Name=:pName order by BGCK__Order__c';
    	
    	BGCK__Page__c cs = Database.query(query);
		
		if(cs.BGCK__Page_Questions__r.size()<=0)
			return null;
		return new ChecklistSection(cs,cs.BGCK__Checklist_Version__c,aId);
	}



	//This is used to grab a portion of the checklist
	@AuraEnabled
    public static ChecklistSection getPage(Id aId,String pName){
		BGCK__Page__c cs=[Select Name, Id,BGCK__Checklist_Version__c, 
								(Select Id, Name, BGCK__Order__c, BGCK__Question__c,BGCK__Criteria__c, BGCK__IsRequired__c, BGCK__Parent_Page_Question__c, 
								BGCK__Question__r.BGCK__Body__c,BGCK__Question__r.BGCK__Question_Type__c
								From BGCK__Page_Questions__r
								where Name LIKE '%you%' 
								order by BGCK__Order__c) 
								From BGCK__Page__c 
								where Name=:pName 
								order by BGCK__Order__c];
		return new ChecklistSection(cs,cs.BGCK__Checklist_Version__c,aId);
	}
	
	@AuraEnabled
    public static list<sObject> getChildRecords(Id answerId, String childObjectName){
    	String objectName = childObjectName;
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
        query += ' WHERE Answer__c=:answerId'; // modify as needed
        system.debug(query);
        try {
            list<sObject> returnList = database.query(query);
            return returnList;
        } catch (QueryException e){
            //perform exception handling
            return new list<sObject>();
        }
	}
	

	// This routine will save the answers and then return the context value passed in.  This will provide a 
	// mechanism for the call back routine to know what just completed when you are executing outside of the framework.
	@AuraEnabled
    public static string saveAnswersWithContext(String context, String answers){
    	system.debug(answers);
    	list<BGCK__Answer__c> saveList = (list<BGCK__Answer__c>) JSON.deserializeStrict(answers,list<BGCK__Answer__c>.class);
		string result;
		if(saveList.size()>0){
			try{
				for (BGCK__Answer__c sl : saveList) {
					if (sl.Name == '') {
						sl.Name = 'Not Answered Yet';
						sl.BGCK__Actual_Value2__c = 'Not Answered Yet';
					}
				}
				upsert saveList;
				result = context + ' SUCCESS';
			}catch(exception ex){
            	result = ex.getMessage();
        	}
		}else{
			result = context + ' ERROR No Answers were found';	
		}
		return result;
	}


	@AuraEnabled
    public static string saveAnswers(string answers){
    	system.debug(answers);
    	list<BGCK__Answer__c> saveList = (list<BGCK__Answer__c>) JSON.deserializeStrict(answers,list<BGCK__Answer__c>.class);
		//list<BGCK__Answer__c> saveList = new list<BGCK__Answer__c>();
		string result;
		/*system.debug(temp);
    	for(ChecklistSection cs :temp){
			for(QuestionBlock qb:cs.questionBlocks){
				saveList.add(qb.question.response);
			}
		}*/
		if(saveList.size()>0){
			try{
				upsert saveList;
				result = 'Checklist Saved Successfully';
			}catch(exception ex){
            	result = ex.getMessage();
        	}
		}else{
			result = 'No Answers were found';	
		}
		return result;
	}
	
	@AuraEnabled
    public static List<FieldSetMember> getFieldSetFields(string objectAPIName , string fieldSetName){
    	
    	Schema.SObjectType targetType = Schema.getGlobalDescribe().get(objectAPIName);
        Schema.DescribeSObjectResult d = targetType.getDescribe();
        Map<String, Schema.FieldSet> fsMap = d.fieldSets.getMap();
        Map<String,Schema.SObjectField> mapFields = d.fields.getMap();
        Schema.FieldSet fs = fsMap.get(fieldSetName);
        List<FieldSetMember> fsList = new List<FieldSetMember>();
        for(Schema.FieldSetMember fsm:fs.getFields()){
        	string[] options = new string[]{};
	        if(string.valueOf(fsm.getType())=='PICKLIST'){
	         	// Get the details for the field            
	           	Schema.DescribeFieldResult fieldDetails = mapFields.get(fsm.fieldPath).getDescribe();
	            List<Schema.PicklistEntry> ple = fieldDetails.getPicklistValues();
	        	//options.add('--None--');
	            for (Schema.PicklistEntry fpe: ple) {
	            	options.add(fpe.getLabel());
	            }
			}
			fsList.add(new FieldSetMember(fsm,options));
        }
        return fsList;
	}
	
	@AuraEnabled
    public static sObject createUpdateRecord(string JSONRecord/*, Id parentId, Id answerId*/){
    	system.debug(JSONRecord);
    	if(JSONRecord != null){
    		Map<String, Object> cObjMap = (Map<String, Object>) JSON.deserializeUntyped(JSONRecord);
			String cObjJson = JSON.serialize(cObjMap.get('Data'));
			// Why again :(
			Map<String, Object> cObjMapFurious = (Map<String, Object>) JSON.deserializeUntyped(cObjJson);
			String cObjJsonDrunk = JSON.serialize(cObjMapFurious);
    		sObject temp = (sObject)JSON.deserialize(cObjJsonDrunk, Sobject.class);
	    	upsert temp;
	    	return temp;
    	}
        return null;
	}
	
	@AuraEnabled
    public static string deleteRecord(Id recordID){
		
		return string.valueOf(Database.Delete(recordID));
	}
	
	public class Checklist{
        
        public Checklist(list<ChecklistSection> lcs) {
            this.sections = lcs;
        }

        @AuraEnabled
        public list<ChecklistSection> sections { get;set; }
        
    }
	
	public class ChecklistSection {

        public ChecklistSection(BGCK__Page__c p, Id rId,Id aId) {
            
            this.section = p;
            map<id,list<BGCK__Page_Question__c>> questions = new map<id,list<BGCK__Page_Question__c>>();
            this.questionBlocks = new list<QuestionBlock>();
            map<Id,BGCK__Page_Question__c> tempMap = new map<Id,BGCK__Page_Question__c>(p.BGCK__Page_Questions__r);
            map<Id,BGCK__Question_Type__c> qTypes = getQuestionTypes(rId);
            map<Id,BGCK__Answer__c> answers = getResponses(tempMap.keySet(),aId);
            set<Id> parents = new set<Id>();
            for(BGCK__Page_Question__c pq:p.BGCK__Page_Questions__r){
            	id key = pq.Id;
            	BGCK__Answer__c ba;
            	if(pq.BGCK__Parent_Page_Question__c!=null){
            		key = pq.BGCK__Parent_Page_Question__c;
            		ba = (answers.containsKey(key))?answers.get(key):newAnswer(key, aId);
            			// This is only necessary until Summer 17 locker service release #208
        			if (ba.Name == 'Not Answered Yet' && (ba.BGCK__Actual_Value__c == null || ba.BGCK__Actual_Value2__c == null)) {
        				ba.BGCK__Actual_Value__c = 'Not Answered Yet';
        				ba.BGCK__Actual_Value2__c = 'Not Answered Yet';
        			}
            		if(!parents.contains(key)){
            			parents.add(key);
            			questionBlocks.add(new QuestionBlock(new Question(tempMap.get(key),qTypes.get(tempMap.get(key).BGCK__Question__r.BGCK__Question_Type__c),ba)));	
            		}
            		if(!questions.containsKey(key))
            			questions.put(key,new list<BGCK__Page_Question__c>());
            		questions.get(key).add(pq);
            	}else{
            		if(!parents.contains(key)){
            			parents.add(key);
            			ba = (answers.containsKey(pq.Id))?answers.get(pq.Id):newAnswer(pq.Id, aId);
            			// This is only necessary until Summer 17 locker service release #208
	        			if (ba.Name == 'Not Answered Yet' && (ba.BGCK__Actual_Value__c == null || ba.BGCK__Actual_Value2__c == null)) {
	        				ba.BGCK__Actual_Value__c = 'Not Answered Yet';
	        				ba.BGCK__Actual_Value2__c = 'Not Answered Yet';
	        			}
            			questionBlocks.add(new QuestionBlock(new Question(pq,qTypes.get(pq.BGCK__Question__r.BGCK__Question_Type__c),ba)));	
            		}	
            	}
            		
            }
        	for(QuestionBlock qb:questionBlocks){
        		if(questions.containsKey(qb.question.q.Id)){
        			list<Question> subs = new list<Question>();
        			for(BGCK__Page_Question__c q:questions.get(qb.question.q.Id)){
        				BGCK__Answer__c ba = (answers.containsKey(q.Id))?answers.get(q.Id):newAnswer(q.Id, aId);
            			subs.add(new Question(q,qTypes.get(q.BGCK__Question__r.BGCK__Question_Type__c),ba));
        			}
        			qb.subQuestions = subs;
        		}
        	}
        }

        @AuraEnabled
        public BGCK__Page__c section { get;set; }

        //@AuraEnabled
        //public map<id,list<BGCK__Page_Question__c>> questions { get;set; }

	    @AuraEnabled
        public list<QuestionBlock> questionBlocks { get;set; }

	}
    
    public class QuestionBlock{
        
        public QuestionBlock(Question q) {
            this.question = q;
        }

        @AuraEnabled
        public Question question { get;set; }
        
        @AuraEnabled
        public list<Question> subQuestions { get;set; }
        
    }
    
    public class Question{
        
        public Question(BGCK__Page_Question__c pq,BGCK__Question_Type__c qt,BGCK__Answer__c a) {
            this.q = pq;
            this.qt = qt;
            this.response = a;
        }

        @AuraEnabled
        public BGCK__Page_Question__c q { get;set; }
        
        @AuraEnabled
        public BGCK__Question_Type__c qt { get;set; }
        
        @AuraEnabled
        public BGCK__Answer__c response { get;set; }
    
    }
    
    public class FieldSetMember {

	    public FieldSetMember(Schema.FieldSetMember f,String[] opts) {
	        this.DBRequired = f.DBRequired;
	        this.fieldPath = f.fieldPath;
	        this.label = f.label;
	        this.required = f.required;
	        this.type = string.valueOf(f.getType());
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
	    public String type { get; set; }
	    
	    @AuraEnabled
        public String[] options { get; set; }
	}
}