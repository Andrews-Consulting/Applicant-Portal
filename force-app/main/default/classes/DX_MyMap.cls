public class DX_MyMap {
    
    @AuraEnabled
    public static list<mapPoint> getPremises(){
        system.debug('Apex is Called');
        list<mapPoint> lm = new list<mapPoint>();
        for(MUSW__Application2__c a:[Select Id,abd_DBA__c,abd_Premises_Geolocation__latitude__s,abd_Premises_Geolocation__longitude__s,
										MUSW__Account__r.Name	 
										from MUSW__Application2__c where abd_Premises_Geolocation__latitude__s!=null]){
        	lm.add(new mapPoint(a));                                 
        }
        if(lm.size()<=0)
            lm.add(new mapPoint('Home of Dreamforce',37.784173, -122.401557));
    	return lm;	    
    }
	
    public class mapPoint{
        
        public mapPoint(MUSW__Application2__c app){
        	this.label = (app.abd_DBA__c!=null)?app.abd_DBA__c:app.MUSW__Account__r.Name;
            this.y = app.abd_Premises_Geolocation__latitude__s;
            this.x = app.abd_Premises_Geolocation__Longitude__s;    
        }
        public mapPoint(string l, decimal y, decimal x){
        	this.label = l;
            this.y = y;
            this.x = x;    
        }
        
        @AuraEnabled
        public string label {get;set;}
        @AuraEnabled
        public decimal y {get;set;}
        @AuraEnabled
        public decimal x {get;set;}
    }
}