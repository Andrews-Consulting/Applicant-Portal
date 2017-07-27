public class DX_userInfoHelper {
	
	@AuraEnabled
    public static string getBaseUrl(){
    	//Fetching the resource
        List<StaticResource> resourceList = [SELECT Name, NamespacePrefix, SystemModStamp FROM StaticResource WHERE Name = 'sldsSvg'];
                            
        //Checking if the result is returned or not
        if(resourceList.size() == 1)
        {
           //Getting namespace
           String namespace = resourceList[0].NamespacePrefix;
           //Resource URL
           return '/resource/' + resourceList[0].SystemModStamp.getTime() + '/' + (namespace != null && namespace != '' ? namespace + '__' : '') + 'sldsSvg'; 
        }
        else return '';
    }
    
}