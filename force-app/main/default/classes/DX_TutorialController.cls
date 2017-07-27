global without sharing class DX_TutorialController {
	
	@AuraEnabled
	global static mediaFile[] getTutorials(){
		mediaFile[] mfa = new mediaFile[]{};
		Id folderId = [select id from Folder where name ='Tutorial Storage' limit 1].Id;
		for(Document d:[Select id,url,ContentType,Body from Document where FolderId=:folderid order by name]){
			mfa.add(new mediaFile(d));	
		}
		return mfa;
	}
    
    global class mediaFile{
    	
    	@AuraEnabled
    	global string dtype{get;set;}
    	
    	@AuraEnabled
    	global string surl{get;set;}
    	
    	@AuraEnabled
    	global string burl{get;set;}
    	
    	@AuraEnabled
    	global string dbody{get;set;}
    	
    	global mediaFile(Document d){
    		this.dtype = d.ContentType;
    		this.dbody = EncodingUtil.base64Encode(d.body);
    		this.burl = 'https://iowaabd--Abdstaging.cs33.my.salesforce.com';//'https://'+URL.getSalesforceBaseUrl().getHost();
    		if(d.url==null){
				this.surl = burl+'/servlet/servlet.FileDownload?file='+d.id;
			}else{
				this.surl = d.url;
			}	
    	}
    }
}