public class DX_ForgotUsernameController {

    @AuraEnabled
    public static String forgotUsername(String email) {
        try {
            
            if(!Site.isValidUsername(email)) {
                return Label.Site.invalid_email;
            }else{
            system.debug(email);
                boolean userNameFound = false;
                Messaging.SingleEmailMessage message = new Messaging.SingleEmailMessage();
                message.toAddresses = new String[] {email};
                message.subject = 'Forgot Username Request';
                message.plainTextBody = 'The below Usernames are associated to this email address:\n\n\t';
                for(User u:[select username from User where Email=:email]){
                    userNameFound = true;
                    message.plainTextBody+=(u.username+'\n\t');
                }
                Messaging.SingleEmailMessage[] messages = new List<Messaging.SingleEmailMessage> {message};
                if(userNameFound){
                    Messaging.SendEmailResult[] results = Messaging.sendEmail(messages);
                    if (results[0].success) {}
                    else{
                        return 'There was an error with the email.';
                    }
                }
            }
            return 'A message will be sent to the Email address provided if a Username is found';
        }
        catch (Exception ex) {
            return ex.getMessage();
        }
    }
    
}