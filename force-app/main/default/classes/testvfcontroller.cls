Public Class testvfcontroller {

public void testone() {

string q = 'select id, Location__Latitude__s, Location__Longitude__s';
q += ' from testobj__c';
q += ' where DISTANCE(Location__c, GEOLOCATION(1,2),\'mi\') < 20 ';
q += ' order by DISTANCE(Location__c, GEOLOCATION( 1,2), \'mi\')';
q += ' limit 10';

system.debug('******************* q: ' + q);
list<testobj__c> seList = Database.query(q);
return;
}
}