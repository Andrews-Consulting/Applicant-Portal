public class ArcGIS_RestAPI_Methods {
	public string endpoint = 'https://geoservices.iowa.gov/arcgis/rest/services/location/UnitedStates/GeocodeServer/';
    
    public Location GetCandidateAddress(string address) {
    	Http httpProtocol = new Http();
        address = address.replaceAll(' ', '+');
        HttpRequest request = getRequest('findAddressCandidates/?Address='+address+'&f=json','GET');
        HttpResponse response = httpProtocol.send(request);
        return GetLocationFromResponse(response.getBody());
    }
    
    public Location GetLocationFromResponse(String response) {
    	ArcGIS results = (ArcGIS)JSON.deserialize(response,ArcGIS.Class);
        Candidates closest = new Candidates();
        closest.score=0.0;
        for(Candidates c: results.candidates){
            system.debug(c);
            system.debug(closest);
            if(c.score==100)
                return c.location;
            if(c.score > closest.score)
            	closest = c;
        }
        return closest.Location;	
    }
    
    public HttpRequest getRequest(string endP,string method){
    	
        // Create HTTP request to send.
        HttpRequest request = new HttpRequest();
        request.setEndPoint(endpoint+endP);
        request.setHeader('Content-Type','application/json');//Set the Proper Header
        request.setHeader('Accept','application/json');
        request.setMethod(method);
        request.setTimeout(30000);
        return request;
    }
    
    public class ArcGIS{
        public SpatialReference spatialReference;
		public List<Candidates> candidates;
    }
    public class SpatialReference{
        public Integer wkid;
		public Integer latestWkid;
    }
    public class Candidates {
		public String address;
		public Location location;
		public Double score;
		public Attributes attributes;
		public Extent extent;
	}
    public class Location {
		public Double x;
		public Double y;
	}
    public class Extent{
        public Double xmin;
		public Double ymin;
		public Double xmax;
		public Double ymax;
    }
    public class Attributes {
	}
}