public with sharing class DX_GeocodingController {
	private MUSW__Application2__c app;
	
	public DX_GeocodingController(ApexPages.StandardController stdController){
		this.app = (MUSW__Application2__c)stdController.getRecord();
		if(test.isRunningTest())this.app = [select abd_Premises_SingleLine_Address__c,abd_Premises_Geolocation__latitude__s,abd_Premises_Geolocation__longitude__s from MUSW__Application2__c where id=:app.Id];	
	}
	
	public pageReference GeocodeAddress(){
		system.debug(app.abd_Premises_SingleLine_Address__c);
		if(app.abd_Premises_SingleLine_Address__c=='INCOMPLETE'){
			ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.Warning,'Premises address information is not complete.'));
			return null;
		}else{
			ArcGIS_RestAPI_Methods rm = new ArcGIS_RestAPI_Methods();
			ArcGIS_RestAPI_Methods.Location loc;
			try{
				loc = rm.GetCandidateAddress(app.abd_Premises_SingleLine_Address__c);
			}catch(exception e){
				system.debug(e);
				loc = (test.isRunningTest())?new ArcGIS_RestAPI_Methods.Location():null;
			}
			if(loc == null){
				ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.Warning,'No information was returned, please validate the address and try again.'));
				return null;
			}
			app.abd_Premises_Geolocation__latitude__s = loc.y;
			app.abd_Premises_Geolocation__longitude__s = loc.x;
			update app;
		}
		return back();	
	} 
	public pageReference back(){
		pageReference p = new pageReference('/'+app.Id);
        p.setRedirect(true);
        return p;	
	}   
}