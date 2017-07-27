@IsTest(SeeAllData = true)
public with sharing class DX_LoginFormControllerTest {

 @IsTest
 static void testLoginWithInvalidCredentials() {
  System.assertEquals('Argument 1 cannot be null', DX_LoginFormController.login('testUser', 'fakepwd', null));
 }

 @IsTest
 static void DX_LoginFormControllerInstantiation() {
  DX_LoginFormController controller = new DX_LoginFormController();
  System.assertNotEquals(controller, null);
 }

 @IsTest
 static void testIsUsernamePasswordEnabled() {
  System.assertEquals(true, DX_LoginFormController.getIsUsernamePasswordEnabled());
 }

 @IsTest
 static void testIsSelfRegistrationEnabled() {
  System.assertEquals(false, DX_LoginFormController.getIsSelfRegistrationEnabled());
 }

 @IsTest
 static void testGetSelfRegistrationURL() {
  System.assertEquals(null, DX_LoginFormController.getSelfRegistrationUrl());
 }

 @IsTest
 static void testAuthConfig() {
  Auth.AuthConfiguration authConfig = DX_LoginFormController.getAuthConfig();
  System.assertNotEquals(null, authConfig);
 }
}