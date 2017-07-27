public class testCon
{
    public string s1 { get; set; }
    public string s2 { get; set; }
    
    public testCon()
    {
        String baseUrl = URL.getSalesforceBaseUrl().toExternalForm();
        baseUrl = baseUrl.replace('visual.force', 'salesforce').replace('--c.', '.').replace('--dre.', '.').remove('c.').remove('dre.');
        
        s1 = baseUrl.replace('salesforce', 'my.salesforce');
    }
}