public class dx_ProgressAndReview_Helper {
    public MUSW__Application2__c App {get;set;}
    public Id aId {get;set;}
    public list<prtl_SectionDisplay__mdt> Sections {get;set;}
    public list<SectionStatus> CurrentStatus {get;set;}
    public map<string, SectionStatus> CurrentStatusMap {get;set;}
    public list<SectionDetail> CurrentDetail {get;set;}
    public map<string, SectionDetail> CurrentDetailMap {get;set;}
    public map<string, list<PortalFieldCfg__c>> fieldsByObject {get;set;}
    public map<string, set<string>> fieldsForQuery {get;set;}
    public map<string, set<string>> validationByObject {get;set;}
        
    public class SectionStatus{
        @AuraEnabled public string Name {get;set;}
        @AuraEnabled public string Status {get;set;}
        public SectionStatus(string name, string status){
            this.Name = name;
            this.Status = status;
        }
    }
    public class MissingField{
        @AuraEnabled public string Name {get;set;}
        @AuraEnabled public string Page {get;set;}
        public MissingField(string name, string page){
            this.Name = name;
            this.Page = page;
        }
    }
    public class SectionDetail{
        @AuraEnabled public string Name {get;set;}
        @AuraEnabled public string Status {get;set;}
        @AuraEnabled public list<string> fieldsMissing {get;set;}
        @AuraEnabled public list<MissingField> fieldMissingPage {get;set;}
        public SectionDetail(string name, string status){
            this.Name = name;
            this.Status = status;
            this.fieldsMissing = new list<string>();
            this.fieldMissingPage = new list<MissingField>();
        }
    }

    public static map<string,string>PageMapping=new map<string,string>{
        'NewApplication'=>'dx-pc-createnewapplication',
        'Licensee'=>'dx-pc-licenseeform',
        'Premise'=>'dx-pc-premiseform',
        'PremiseQuestions'=>'dx-premisequestions',
        'PremiseApplicationQuestions'=>'dx-pc-applicationquestions-premise',
        'Owner'=>'dx-pc-ownerform',
        'OwnerList'=>'dx-pc-ownerlist', 
        'OwnerApplicationQuestions'=>'dx-pc-applicationquestions-owner'
        };
        
    public dx_ProgressAndReview_Helper(Id ApplicationId){
        aId = ApplicationId;
        list<PortalFieldCfg__c> portalFields = [select id, Field_Label__c, FieldName__c, isRequired__c, ObjectName__c, Progress_section__c, Conditional_Validation_Field__c, Conditional_Validation_Value__c, LicenseTypeCode__c, PageName__c    from PortalFieldCfg__c];
        fieldsByObject = new map<string, list<PortalFieldCfg__c>>();
        fieldsForQuery = new map<string, set<string>>();
        CurrentStatus  = new list<SectionStatus>();
        CurrentStatusMap = new map<string,SectionStatus>();
        CurrentDetail  = new list<SectionDetail>();
        CurrentDetailMap = new map<string,SectionDetail>();
        Sections = [select label, applicationStatus__c, order__c, Final_Review__c  from prtl_SectionDisplay__mdt order by order__c];
        system.debug(applicationId);
        if (applicationId!=null){
            app = [select id, MUSW__Status__c  from MUSW__Application2__c where id=:applicationId];
            
            validationByObject = new map<string, set<string>>();
            for (PortalFieldCfg__c pfc: portalFields){
                if (pfc.Conditional_Validation_Field__c !=null || (pfc.ObjectName__c=='MUSW__Application2__c' && pfc.LicenseTypeCode__c  !=null)){
                    set<string> clauses;
                    if (!validationByObject.containskey(pfc.ObjectName__c)){
                        clauses = new set<string>();
                        validationByObject.put(pfc.ObjectName__c,clauses);
                    } else {
                        clauses = validationByObject.get(pfc.ObjectName__c);
                    }
                    if (pfc.ObjectName__c=='MUSW__Application2__c' && pfc.LicenseTypeCode__c  !=null){
                        clauses.add('Primary_Lic_Type__c');
                    }
                    if (pfc.Conditional_Validation_Field__c !=null){
                        clauses.add(pfc.Conditional_Validation_Field__c );
                    }
                }
            }
            
            integer StatusFoundAt = null;
            for (prtl_SectionDisplay__mdt sd: Sections){
                SectionStatus ss = new SectionStatus(sd.label, 'NA');
                CurrentStatus.add (ss);
                CurrentStatusMap.put(sd.label, ss);
                
                if (sd.Final_Review__c==true){
                    SectionDetail ssd = new SectionDetail(sd.label, 'NA');
                    CurrentDetail.add (ssd);
                    CurrentDetailMap.put(sd.label, ssd);
                }
                if (sd.applicationStatus__c!=null && sd.applicationStatus__c.contains(app.MUSW__Status__c)){
                    StatusFoundAt=integer.valueOf(sd.order__c);
                }
                
            }        
            if (statusFoundAt!=null){
                for (integer i=0;i<CurrentStatus.size();i++){
                    if (i<StatusFoundAt){
                        CurrentStatus[i].status='Complete';
                        if (CurrentDetail.size()>i){
                            CurrentDetail[i].status='Complete';
                        }
                    } else {
                        CurrentStatus[i].status='Incomplete';
                        if (CurrentDetail.size()>i){
                            CurrentDetail[i].status='Incomplete';
                        }    
                    }
                }
            } else {
                
                for (PortalFieldCfg__c pfc:portalfields){
                    list<PortalFieldCfg__c> objFields;
                    set<string> fieldList;
                    if (!fieldsByObject.containskey(pfc.ObjectName__c)){
                        objFields = new list<PortalFieldCfg__c>();
                        fieldList = new set<string>();
                        fieldsByObject.put(pfc.ObjectName__c, objFields);
                        fieldsForQuery.put(pfc.ObjectName__c, fieldList);
                    } else {
                        objFields = fieldsbyobject.get(pfc.ObjectName__c);
                        fieldList = fieldsForQuery.get(pfc.objectName__c);
                    }
                    objFields.add(pfc);
                    fieldList.add(pfc.FieldName__c);
                    if (pfc.Conditional_Validation_Field__c !=null){
                        fieldList.add(pfc.Conditional_Validation_Field__c );
                    }
                    if (pfc.ObjectName__c=='MUSW__Application2__c' && pfc.LicenseTypeCode__c  !=null){
                        fieldList.add('Primary_Lic_Type__c');
                    }
                }
                system.debug(fieldsForQuery);
                getFields();
            }
        }
    }
    
    public boolean fieldIsPresent(Map<String, Schema.SObjectField> fieldDescribe, string fieldName){
        boolean bOut = false;
        list<string> fieldPath = fieldName.split('\\.');
        system.debug(fieldDescribe.keyset());
        system.debug('Checking fieldisPresent for ' + fieldName + ' ' + fieldPath);
        string fielditem = fieldpath[0].replace('__r', '__c');
        if (fieldDescribe.containskey(fieldItem)){
            bOut=true;
            system.debug('Found ' + fieldItem);
        }
        system.debug(fieldDescribe.containskey(fieldItem));
        
        return bOut;
    }
    public string getFieldValue(string fieldName, sObject targetObject){
        string sOut = null;
        list<string> fieldPath = fieldName.split('\\.');
        sObject currentObject = targetObject;
        integer i=0;
        for (string fieldItem:fieldPath){
            if (i<fieldPath.size()-1){
            system.debug(json.serializepretty(currentObject));
        currentObject = (sObject)currentObject.getSObject(fieldItem);
            } else {
                sOut = string.valueOf(currentObject.get(fieldItem));
            }
            i++;
        }
        return sOut;
    }
    
    public void checkObject(string sObjectType, sObject testObject, Map<String, Schema.SObjectField> fieldDescribe){
        list<PortalFieldCfg__c> objFields = fieldsByObject.get(sObjectType);
        set<string> conditionalValidation = (validationByObject.containskey(sObjectType))?validationByObject.get(sObjectType):(new set<string>());
            for (PortalFieldCfg__c pfc:objFields){
                boolean bCheck = true;
                boolean bLicenseType = true;
                system.debug(JSON.serializepretty(pfc));
                if (pfc.Conditional_Validation_Field__c !=null || pfc.LicenseTypeCode__c!=null){
                    
                    if (pfc.LicenseTypeCode__c !=null && pfc.ObjectName__c=='MUSW__Application2__c') {
                        list<string> validationArray = pfc.LicenseTypeCode__c.split(';');
                        set<string> validationSet = new set<string>();
                        validationSet.addAll(validationArray);
                        system.debug(validationSet);
                        if (!validationSet.contains((string)testObject.get('Primary_Lic_Type__c' ))){
                            bCheck=false;
                            bLicenseType=false;
                            system.debug('Application Type not found' + testObject.get('Primary_Lic_Type__c' ));
                        }
                    }
                    if (bLicenseType==true && pfc.Conditional_Validation_Field__c!=null && fieldIsPresent(fieldDescribe,pfc.Conditional_Validation_Field__c)){
                        
                        
                        //Schema.SObjectField field = fieldDescribe.get(pfc.Conditional_Validation_Field__c);
	                    //Schema.DisplayType validationType = field.getDescribe().getType();
						

                        /*if (validationType== Schema.DisplayType.BOOLEAN){
                            if (testObject.get(pfc.Conditional_Validation_Field__c )!=boolean.valueOf(pfc.Conditional_Validation_Value__c ) ){
                                system.debug('Boolean Check ' + boolean.valueOf(pfc.Conditional_Validation_Value__c ));
                                bCheck=false;
                            }
                        } else {*/
                            string testValue = getFieldValue(pfc.Conditional_Validation_Field__c,testObject );
                            system.debug('Checking' + pfc.Conditional_Validation_Field__c + testValue);
                            if (testValue!=pfc.Conditional_Validation_Value__c ){
                                system.debug('Non Boolean Check ' + pfc.Conditional_Validation_Value__c + testValue);
                                bCheck=false;
                            } 
                            
                            
                        //}
                    }
                }
                
                if (bCheck && pfc.isRequired__c && testObject.get(pfc.FieldName__c)==null){
                    CurrentStatusMap.get(pfc.Progress_Section__c).status='Incomplete';
                    SectionDetail ssd = CurrentDetailMap.get(pfc.Progress_Section__c);
                    ssd.status='Incomplete';
                    ssd.fieldsMissing.add(pfc.Field_Label__c);
                    string sUrl = '';
                    if (PageMapping.containsKey(pfc.PageName__c)){
                        string sId = (pfc.ObjectName__c=='MUSW__Application2__c')?('?recordId='):('?id='+testObject.Id + '&recordId=');
                        sUrl = '/' + PageMapping.get(pfc.PageName__c) + sId;//'?recordId=';
                    }
                    ssd.fieldMissingPage.add(new MissingField(pfc.Field_Label__c, sUrl));
                    //ssd.fieldPageMap.put(pfc.Field_Label__c,pfc.PageName__c);
                } else if (CurrentStatusMap.get(pfc.Progress_Section__c).status=='NA') {
                    CurrentStatusMap.get(pfc.Progress_Section__c).status='Tested';
                    CurrentDetailMap.get(pfc.Progress_Section__c).status='Tested';
                    
                }
            }
    }
    public void getFields(){
        if (aId!=null){
            list<string> ApplicantFields = new list<string>();
            ApplicantFields.addall(fieldsForQuery.get('Contact'));
            User u = [Select ContactId From User Where Id = :UserInfo.getUserId()];
        	string qContact = 'select id, ' + string.join(ApplicantFields, ',') + ' from Contact where id =\''+ u.contactid +'\'';
            
            Contact applicant = (Contact)database.query(qContact);
            checkObject('Contact', applicant, Schema.SObjectType.Contact.fields.getMap());
 
            
            
            string sObj = 'MUSW__Application2__c';
            list<string> appFields = new list<string>();
            appFields.addAll(fieldsForQuery.get(sObj));
            string qApp = 'select id, ' + string.join(appfields, ',') + ' from MUSW__Application2__c where id=\''+ aid +'\'';
            //system.debug(q);
            
            app = (MUSW__Application2__c) database.query(qApp);
            //system.debug(app);
            checkObject(sObj, app, Schema.SObjectType.MUSW__Application2__c.fields.getMap());

            list<string> ownerFields = new list<string>();
            ownerFields.addall(fieldsForQuery.get('Application_Contact__c'));
            string qOwner = 'select id, ' + string.join(ownerFields, ',') + ' from Application_Contact__c where Application__c =\''+ aid +'\' and abd_Primary_Owner__c=true limit 1';
            system.debug(qOwner);
            list<Application_Contact__c> applicationOwner = (list<Application_Contact__c>)database.query(qOwner);
            if (applicationOwner.size()>0){
                checkObject('Application_Contact__c', applicationOwner[0], Schema.SObjectType.Application_Contact__c.fields.getMap());
            }
        }
        for (string sectionLabel:CurrentStatusMap.keyset()){
            if (CurrentStatusMap.get(sectionLabel).status=='Tested'){
                CurrentStatusMap.get(sectionLabel).status='Complete';
				CurrentDetailMap.get(sectionLabel).status='Complete';
            }
        }
    }
    
    public list<SectionStatus> getStatus(){
        return Currentstatus;
    }
    

    public list<SectionDetail> getDetail(){
        return Currentdetail;
    }
    

    
    
}