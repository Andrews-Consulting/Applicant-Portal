@isTest
public class RestAPIMockImpl implements HttpCalloutMock {
	
    public HTTPResponse respond(HTTPRequest req) {
        // Create a fake response
        HttpResponse res = new HttpResponse();
        res.setHeader('Content-Type', 'application/json');
        res.setBody('{"spatialReference": {"wkid": 1234,"latestWkid": 1234},"candidates": [{ "address": "1234 Test St, Mock, State, 12345", "location": {  "x": -75.453453453,  "y": 32.524545345 }, "score": 99, "attributes": {   }, "extent": {  "xmin": -75.453453453,  "ymin": 32.524545345,  "xmax": -75.453453453,  "ymax": 32.524545345 }},{ "address": "1234 Test St, Mock, State, 12345", "location": {  "x": -75.453453453,  "y": 32.524545345 }, "score": 100, "attributes": {   }, "extent": {  "xmin": -75.453453453,  "ymin": 32.524545345,  "xmax": -75.453453453,  "ymax": 32.524545345 }}]}');
        res.setStatusCode(200);
        return res;
    }
}