@isTest
private class DX_HelpTextController_Test {

    static testMethod void testMethod1() {
        TestUtils.Generate_DX_HelpText(); 

        System.assertEquals(DX_HelpTextController.getHelpText('Test'), 'Test1 Text.');
    }
}