public class MetadataService
{
    private String m_reqUrl;
    private final String TRIGGERPREFIX = 'DRE2';
    private final String TESTCLASSPREFIX = 'DRE2Test';
    
	public MetadataService()
    {
        String baseUrl = 'https://iowaabd--abdstaging.cs33.my.salesforce.com';
        m_reqUrl = baseUrl + '/services/data/v38.0/sobjects/';
    }
    
    /**
     * 	Creates a trigger for the object called DRE2 + objectName
     */
    public void createDRETrigger(String objectName)
    {
        String triggerName = getDRETriggerName(objectName);
        String methodCall = 'DREManager.runTrigger();';
        methodCall = 'DRE.' + methodCall;
        
        String body = 'trigger ' + triggerName + ' on ' + objectName + ' (after insert, before update, before delete, after undelete) { ' + methodCall + ' }';
        
        String reqBody = buildRequestBody(new Map<String, String>{
            'Name' => triggerName,
            'Body' => body,
            'Status' => 'Active',
            'TableEnumOrId' => objectName,
            'UsageAfterInsert' => 'true',
            'UsageBeforeUpdate' => 'true',
            'UsageBeforeDelete' => 'true'
        });
        
        sendRequest('ApexTrigger', 'POST', reqBody, null);
    }
    
    /**
     * 	Deletes the trigger
     */
    public void deleteDRETrigger(Id triggerId)
    {
        sendRequest('ApexTrigger', 'DELETE', null, triggerId);
    }
    
    /**
     * 	Creates a test class for the object called DRE2Test_ObjectName
     */
    public void createDRETestClass(String objectName)
    {
        String testClass = getDRETestClassName(objectName);
        ApexClass c = null;
        if (c == null)
        {
            String methodCall = 'DRETestExternalManager.run(\'' + objectName + '\');';
            methodCall = 'DRE.' + methodCall;
            String body = 
                '@isTest private class ' + testClass + 
                ' { ' + 
                	'@isTest static void insertUpdateDelete() { ' + methodCall + ' }' +
                ' }';
            
            String reqBody = buildRequestBody(new Map<String, String>{
                'Name' => testClass,
                'Body' => body,
                'Status' => 'Active'
            });
            
            sendRequest('ApexClass', 'POST', reqBody, null);
        }
    }
    
    /**
     * 	Creates a Static Resource (max 5MB)
     */
    public void createStaticResource(String name, String body)
    {
        String reqBody = buildRequestBody(new Map<String, String>{
            'Name' => name,
            'Body' => EncodingUtil.base64Encode(Blob.valueOf(body)),
            'ContentType' => 'text/plain',
            'CacheControl' => 'Private'
        });
        
        if (!Test.isRunningTest())
        {
        	sendRequest('StaticResource', 'POST', reqBody, null);
        }
    }
    
    /**
     * 	Sends an Http Request and returns the response
     * 	@param objectType ApexTrigger, ApexClass, etc
     * 	@param method POST or DELETE
     * 	@param body Body of the request
     * 	@param objectId Trigger/Class Id (used for delete only)
     */
    private void sendRequest(String objectType, String method, String body, Id objectId)
    {
        String endpoint = m_reqUrl + objectType + (objectId != null ? '/' + objectId : '');
        
        HttpRequest req = new HttpRequest();
        req.setMethod(method);
        req.setEndpoint(endpoint);
        req.setHeader('Content-type', 'application/json');
        req.setHeader('Authorization', 'Bearer ' + UserInfo.getSessionId());
        req.setTimeout(30000);
        
        if (body != null) req.setBody(body);
        
        HttpResponse res;
        if (!Test.isRunningTest())
        {
            Http http = new Http();
            try
            {
                res = http.send(req);
            }
            catch (Exception e)
            {
                // try myDomain
                String myDomainReqUrl = 'https://iowaabd--abdstaging.cs33.my.salesforce.com' + '/services/data/v38.0/sobjects/';
                endpoint = myDomainReqUrl + objectType + (objectId != null ? '/' + objectId : '');
                req.setEndpoint(endpoint);
                req.setHeader('Authorization', 'Bearer ' + UserInfo.getSessionId());
                
                //res = http.send(req);
            }
        }
        else
        {
            res = new HttpResponse();
            res.setStatusCode(200);
        }
        
        if (!isHttpResponseOk(res))
            system.debug('>> ERROR: '+res.getStatusCode() + ': ' + res.getStatus() + ': ' + res.getBody());
    }
    
    private String getDRETriggerName(String objectName)
    {
        return TRIGGERPREFIX + '_' + objectName.replace('__', '_');
    }
    
    private String getDRETestClassName(String objectName)
    {
        return TESTCLASSPREFIX + '_' + objectName.replace('__', '_');
    }
    
    private String buildRequestBody(Map<String, String> values)
    {
        JSONGenerator gen = JSON.createGenerator(true);
        gen.writeStartObject();
        for (String key : values.keySet()) gen.writeStringField(key, values.get(key));
        gen.writeEndObject();
        return gen.getAsString();
    }
    
    private Boolean isHttpResponseOk(HttpResponse res)
    {
        return res != null && (res.getStatusCode() == 200 || res.getStatusCode() == 201 || res.getStatusCode() == 204);
    }
}