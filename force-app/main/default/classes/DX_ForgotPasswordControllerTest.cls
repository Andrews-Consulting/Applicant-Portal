@IsTest(SeeAllData = true)
public with sharing class DX_ForgotPasswordControllerTest {

 /* Verifies that ForgotPasswordController handles invalid usernames appropriately */
 @IsTest
 static void ForgotPasswordControllerInvalidUserName() {
  System.assertEquals(DX_ForgotPasswordController.forgotPassword('fakeUser', 'http://a.com'), Label.Site.invalid_email);
  System.assertEquals(DX_ForgotPasswordController.forgotPassword(null, 'http://a.com'), Label.Site.invalid_email);
  System.assertEquals(DX_ForgotPasswordController.forgotPassword('a', '/home/home.jsp'), Label.Site.invalid_email);
 }

 /* Verifies that null checkEmailRef url throws proper exception. */
 @IsTest
 static void ForgotPasswordControllerWithNullCheckEmailRef() {
  System.assertEquals(DX_ForgotPasswordController.forgotPassword('a', null), 'Argument 1 cannot be null');
  System.assertEquals(DX_ForgotPasswordController.forgotPassword('a@salesforce.com', null), 'Argument 1 cannot be null');
 }

 /* Verifies that DX_ForgotPasswordController object is instantiated correctly. */
 @IsTest
 static void ForgotPasswordControllerInstantiation() {
  DX_ForgotPasswordController controller = new DX_ForgotPasswordController();
  System.assertNotEquals(controller, null);
 }
}