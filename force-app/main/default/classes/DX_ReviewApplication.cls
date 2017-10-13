public with sharing class DX_ReviewApplication {
    
    @AuraEnabled
    public static ReviewApplication getReviewApplication(Id rId) {
        MUSW__Review__c r = [select Id, MUSW__Application2__c, MUSW__Completed_DateTime__c, MUSW__Status__c, Comments__c, ABD_Reviewer_Name__c From MUSW__Review__c where Id=:rId];
        MUSW__Application2__c app = [Select abd_Other_Criteria__c, abd_Primary_License__r.MUSW__Class__c, MUSW__Applicant__r.LastName, abd_Premise_Address__c,  
                                    MUSW__Applicant__r.FirstName, MUSW__Applicant__r.Phone, MUSW__Applicant__r.Email, abd_Premise_Address_2__c,
                                    abd_Premise_Zip_Code__c, abd_Premise_State__c, abd_Premise_County__c, abd_Premise_City__c, abd_Outdoor_Service_Area_Boundary_Info__c,
                                    abd_Occupancy_Over_200__c, abd_Non_profit__c, abd_Name_of_River_Lake__c, abd_Length__c, abd_Effective_End_Date__c,
                                    abd_Effective_Date__c, abd_DRAM_shop__r.Name, Premises_Type__c, MUSW__Account__c, abd_Bond_Company__c,abd_Dues_Member_Number__c,
                                    abd_Occupancy_Explination__c,(Select abd_License__c,abd_License_Type__c,abd_Approval_Status__c,abd_License__r.MUSW__Class__c From License_Applications__r), 
                                    (Select abd_Auth_Agent_Name__c, abd_Auth_Agent_Address_2__c, abd_Auth_Agent_City__c, abd_Auth_Agent_State__c, abd_Auth_Agent_Zip__c, 
                                        abd_Auth_Agent_Phone__c, abd_Auth_Agent_Address__c From Authorized_Agents__r), 
                                    (Select Name, BGCK__Page_Question__r.BGCK__Question__r.BGCK__Body__c,BGCK__Page_Question__r.BGCK__Page__r.Name From Answers__r 
                                        where BGCK__Page_Question__r.BGCK__Page__r.Name!='Ownership Details' order by BGCK__Page_Question__r.BGCK__Page__r.Name), 
                                    (Select of_Ownership__c, Address__c, Address_2__c, City__c, Date_of_Birth__c, First_Name__c, Last_Name__c, Position__c, SSN__c, State__c, 
                                        U_S_Citizen__c, Zip_Code__c, Business_Name__c, abd_State_of_Incorporation__c, abd_Primary_Owner__c From Application_Contacts__r) 
                                    From MUSW__Application2__c where Id=:r.MUSW__Application2__c];
        ReviewApplication ra = new ReviewApplication(app,r);
        system.debug(ra);
        return ra;
    
    }
    
    @AuraEnabled
    public static MUSW__License2__c[] getLicenses(string s) {
        set<Id> si = new set<Id>();
        for(string st:s.split(',')){
            si.add((Id)st);
        }
        list<MUSW__License2__c> licenses = new list<MUSW__License2__c>();
        for(abd_License_Application__c la:[Select abd_License__c,abd_License_Type__c,abd_Approval_Status__c,abd_License__r.MUSW__Class__c From abd_License_Application__c where Id IN:si]){
            licenses.add(new MUSW__License2__c(Id=la.abd_License__c,MUSW__Class__c=la.abd_License__r.MUSW__Class__c,MUSW__Status__c=la.abd_Approval_Status__c));
        }
        return [Select Id, MUSW__Class__c, MUSW__Status__c From MUSW__License2__c]; 
    }
    
    @AuraEnabled
    public static string updateReview(MUSW__Review__c review, string licensesString) {
        Savepoint sp = Database.setSavepoint();
        try{
            list<abd_License_Application__c> licenses = new list<abd_License_Application__c>();
            map<Id,String> mis = new map<Id,String>();
            string status = '';
            if(review.MUSW__Status__c!='Additional Information Required'){
                for(MUSW__License2__c license:(list<MUSW__License2__c>) JSON.deserializeStrict(licensesString,list<MUSW__License2__c>.class)){
                    mis.put(license.Id,license.MUSW__Status__c);
                    if(license.MUSW__Status__c=='Approved')
                        status = ((status==''||status=='Approved'))?'Approved':'Partially Approved';
                    if(license.MUSW__Status__c=='Denied')
                        status = (status=='')?'Denied':'Partially Approved';
                }
                review.MUSW__Status__c=status;
                for(abd_License_Application__c la:[Select Id,abd_License__c,abd_Approval_Status__c From abd_License_Application__c where abd_License__c IN:mis.keySet() and abd_Application__c=:review.MUSW__Application2__c]){
                    la.abd_Approval_Status__c = mis.get(la.abd_License__c);
                    licenses.add(la);   
                }
                update licenses;
                system.debug(licenses);
            }
            update review;
            system.debug(review);
        }catch(exception ex){
            Database.rollback(sp);
            throw new AuraHandledException (ex.getMessage());
        }
        return null;    
    }
    
    public class ReviewApplication{
        
        @AuraEnabled 
        public Contact applicant {get;set;}
        @AuraEnabled 
        public Account licensee {get;set;}
        @AuraEnabled 
        public list<MUSW__License2__c> licenses {get;set;}
        @AuraEnabled 
        public MUSW__Application2__c application {get;set;}
        @AuraEnabled 
        public list<Question> premiseQuestions1 {get;set;}
        @AuraEnabled 
        public list<Question> premiseQuestions2 {get;set;}
        @AuraEnabled 
        public list<Question> ownerQuestions {get;set;}
        @AuraEnabled 
        public list<Question> chQuestions {get;set;}
        @AuraEnabled 
        public list<Question> auctionQuestions {get;set;}
        @AuraEnabled 
        public list<Application_Contact__c> owners {get;set;}
        @AuraEnabled 
        public list<abd_Authorized_Agent__c> agents {get;set;}
        @AuraEnabled 
        public MUSW__Review__c review {get;set;}
        @AuraEnabled 
        public string s {get;set;}
        @AuraEnabled 
        public string ltype {get;set;}
        
        public ReviewApplication(MUSW__Application2__c a,MUSW__Review__c r){
            this.application = a;
            this.owners = (a.Application_Contacts__r.size()<=0)?new list<Application_Contact__c>():a.Application_Contacts__r;
            this.agents = (a.Authorized_Agents__r.size()<=0)?new list<abd_Authorized_Agent__c>():a.Authorized_Agents__r;
            this.review = r;
            this.licensee = [Select abd_Verified_Active_in_Iowa__c, abd_Corporate_ID_Number__c, abd_Account_Email_Address__c,Phone, Name, 
                            Business_Type__c,BillingStreet,BillingCity,BillingState,BillingPostalCode From Account where Id=:a.MUSW__Account__c];
            this.applicant = new contact(firstName=a.MUSW__Applicant__r.firstName,lastName=a.MUSW__Applicant__r.lastName,
                                            phone=a.MUSW__Applicant__r.phone,email=a.MUSW__Applicant__r.email);
            this.s = '';
            this.ltype = '';
            this.licenses = new list<MUSW__License2__c>();
            for(abd_License_Application__c la:a.License_Applications__r){
                licenses.add(new MUSW__License2__c(Id=la.abd_License__c,MUSW__Class__c=la.abd_License__r.MUSW__Class__c,MUSW__Status__c=la.abd_Approval_Status__c));
                if(s!='')
                    s+=',';
                s+=string.valueOf(la.Id);
                if(ltype!='')
                    ltype+=' '; 
                ltype+=la.abd_License_Type__c;  
            }
            this.premiseQuestions1 = new list<Question>();
            this.premiseQuestions2 = new list<Question>();
            this.auctionQuestions = new list<Question>();
            this.ownerQuestions = new list<Question>();
            this.chQuestions = new list<Question>();
            for(BGCK__Answer__c ans:a.Answers__r){
                if(ans.BGCK__Page_Question__r.BGCK__Page__r.Name == 'Premises Information'){
                    premiseQuestions1.add(new Question(ans));
                }else if(ans.BGCK__Page_Question__r.BGCK__Page__r.Name == 'General Premises Information'){
                    premiseQuestions2.add(new Question(ans));
                }else if(ans.BGCK__Page_Question__r.BGCK__Page__r.Name == 'Ownership Interest'){
                    ownerQuestions.add(new Question(ans));
                }else if(ans.BGCK__Page_Question__r.BGCK__Page__r.Name == 'Auction'){
                    auctionQuestions.add(new Question(ans));
                }else if(ans.BGCK__Page_Question__r.BGCK__Page__r.Name == 'Criminal History'){
                    chQuestions.add(new Question(ans));
                }   
            }
        }
            
    }
    
    public class Question{
        
        public Question(BGCK__Answer__c a) {
            this.q = a.BGCK__Page_Question__r.BGCK__Question__r.BGCK__Body__c;
            this.response = a.Name;
        }

        @AuraEnabled
        public string q { get;set; }
        
        @AuraEnabled
        public string response { get;set; }
    
    }    
}