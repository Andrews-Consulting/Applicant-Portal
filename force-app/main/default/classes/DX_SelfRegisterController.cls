global class DX_SelfRegisterController {

    public DX_SelfRegisterController() {

    }

    @TestVisible 
    private static boolean isValidPassword(String password, String confirmPassword) {
        return password == confirmPassword;
    }
    
    @TestVisible 
    private static boolean siteAsContainerEnabled(Id networkId) {
        Auth.AuthConfiguration authConfig = new Auth.AuthConfiguration(networkId,'');
        return authConfig.isCommunityUsingSiteAsContainer();
    }
    
    @TestVisible 
    private static void validatePassword(User u, String password, String confirmPassword) {
        if(!Test.isRunningTest()) {
        Site.validatePassword(u, password, confirmPassword);
        }
        return;
    }
    
    @AuraEnabled
    public static String selfRegister(User user, String password, String confirmPassword, String accountId, String regConfirmUrl, String startUrl, Boolean includePassword) {
        Savepoint sp = null;
        try {
            //for(user u:[Select Id from User where Username=:email])
            sp = Database.setSavepoint();
            
            if (user.lastname == null || String.isEmpty(user.lastname)) {
                return Label.Site.lastname_is_required;
            }
            
            if (user.email == null || String.isEmpty(user.email)) {
                return Label.Site.email_is_required;
            }
            
            if (user.phone == null || String.isEmpty(user.phone)) {
                return 'Please include a valid phone number.';
            }else{
                for(user u:[Select Id from User where Username=:user.email]){
                	return 'E-mail already has been used to create an account. Lost your password? <a href="dx-forgotpassword" style="color:blue">Click here</a>';    
                }
                for(Contact c:[Select Id from Contact where email=:user.email]){
                	return 'E-mail already has been used to create an account. Lost your password? <a href="dx-forgotpassword" style="color:blue">Click here</a>';    
                }    
            }
            
            User u = user;//new User();
            u.Username = user.email;
            //u.put('Email',email);
            
            //u.FirstName = firstname;
            //u.LastName = lastname;
            //u.Phone = phone;
            u.abd_StartUrl__c = startUrl;
            startUrl = '/s/dx-legal-disclaimer/';
            
            String networkId = Network.getNetworkId();

            // If using site to host the community the user should not hit s1 after logging in from mobile.
            if(networkId != null && siteAsContainerEnabled(networkId)) {
                u.put('UserPreferencesHideS1BrowserUI',true);
            }
            
            String nickname = ((user.firstname != null && user.firstname.length() > 0) ? user.firstname.substring(0,1) : '' ) + user.lastname.substring(0,1);
            nickname += String.valueOf(Crypto.getRandomInteger()).substring(1,7);
            u.put('CommunityNickname', nickname);
                     
            /*if (extraFields != null) {
                List<Object> extraFieldsList = (List<Object>) JSON.deserializeUntyped(extraFields);        
                for (Object thisFieldObject : extraFieldsList) {
                    Map<String,Object> thisField = (Map<String,Object>) thisFieldObject;
                    Schema.SObjectField sof = Schema.SObjectType.User.fields.getMap().get((String) thisField.get('fieldPath'));
                    u.put(sof, thisField.get('value'));
                }
            }*/
                        
            if (includePassword) {    
                if (!isValidPassword(password, confirmPassword)) {
                    return Label.site.passwords_dont_match;
                }
             validatePassword(u, password, confirmPassword);
            }
            else {
                password = null;
            }
            
            // lastName is a required field on user, but if it isn't specified, we'll default it to the username
            String userId = Site.createPortalUser(u, accountId, password);
            // create a fake userId for test.
            if (Test.isRunningTest()) {
                userId = 'fakeUserId';           
            }
            if (userId != null) { 
                if (password != null && password.length() > 1) {
                    ApexPages.PageReference lgn = Site.login(u.email, password, startUrl);
                    if(!Test.isRunningTest()) {
                    	aura.redirect(lgn);
                    }
                }
                else {
                    ApexPages.PageReference confirmRef = new PageReference(regConfirmUrl);
                    if(!Test.isRunningTest()) {
                    	aura.redirect(confirmRef);
                   	}

                }
            }
            return null;
        }
        catch (Exception ex) {
            if (sp != null) Database.rollback(sp);
            return ex.getMessage();            
        }
    }
    
    @AuraEnabled
    public static List<Map<String,Object>> getExtraFields(String extraFieldsFieldSet) { 
        List<Map<String,Object>> extraFields = new List<Map<String,Object>>();
        Schema.FieldSet fieldSet = Schema.SObjectType.User.fieldSets.getMap().get(extraFieldsFieldSet);
        if(!Test.isRunningTest()) {
        if (fieldSet != null) {
            for (Schema.FieldSetMember f : fieldSet.getFields()) {
                Map<String, Object> fieldDetail = new Map<String, Object>();
                fieldDetail.put('dbRequired', f.getDBRequired());
                fieldDetail.put('fieldPath', f.getFieldPath());
                fieldDetail.put('label', f.getLabel());
                fieldDetail.put('required', f.getRequired());
                fieldDetail.put('type', f.getType());
                fieldDetail.put('value', '');   // client will populate
                extraFields.add(fieldDetail);
            }}}
        return extraFields;
    }
}