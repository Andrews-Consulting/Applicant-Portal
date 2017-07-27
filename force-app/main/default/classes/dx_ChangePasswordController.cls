public with sharing class dx_ChangePasswordController {
    
    public String changePassword(String oldPassword, String newPassword, String verifyNewPassword) {
    	try {
        	Site.changePassword(newPassword, verifyNewPassword, oldpassword);
	    }
        catch (Exception e) {
        	return e.getMessage();
        }

        return null;
    }     
    
}