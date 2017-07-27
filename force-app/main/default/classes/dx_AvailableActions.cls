public without sharing class dx_AvailableActions {
    
    @AuraEnabled
	public static list<dx_IconManagement__mdt> getAvailbleIcons(String recordId){
		system.debug(recordId);
		list<dx_IconManagement__mdt> imList = new list<dx_IconManagement__mdt>();

		// Null parameters are not allowed.
		if (String.isBlank(recordId)) 
			throw new AuraHandledException('Record Id parameter was null.');
		else {
			list<String> ltlist = new list<String>();
			// If this is an application
			if (recordId.left(3) == Schema.SObjectType.MUSW__Application2__c.getKeyPrefix()) {
				for (abd_License_Application__c la :  [Select abd_License_Type__c from abd_License_Application__c where abd_Application__r.Id = :recordId]) {
					if (!String.isBlank(la.abd_License_Type__c))
						ltlist.add(la.abd_License_Type__c);
				}
			}
			// If this is an license - Only will retreive one row by the way.
 			else if (recordId.left(3) == Schema.SObjectType.MUSW__License2__c.getKeyPrefix()) {
				for (MUSW__License2__c la :  [Select abd_License_Type__c from MUSW__License2__c where Id = :recordId]) {
					if (!String.isBlank(la.abd_License_Type__c))
						ltlist.add(la.abd_License_Type__c);
				}
			}

			if (ltlist.isEmpty())
				throw new AuraHandledException('No license types found for record id: ' + recordId);

			System.debug('ltlist - ' + ltlist);

			list<String> aalist = new list<String>();
			// Get the available actions
			for (abd_License_Types__c lt : [Select abd_Available_Actions__c from abd_License_Types__c where abd_License_Type__c in :ltlist]) {
				if (!String.isBlank(lt.abd_Available_Actions__c))
					aalist.addAll(lt.abd_Available_Actions__c.split(';'));		
			}

			if (aalist.isEmpty())
				throw new AuraHandledException('No available actions exist for license types ' + ltlist + ' on record Id ' + recordId);
			System.debug('aalist - ' + aalist + ' first item ' + aalist[0]);
			imList = [Select DeveloperName, MasterLabel, AltText__c, Title__c, Page_URL__c, IconFileName__c 
											from dx_IconManagement__mdt where DeveloperName in :aalist ];

			// Since we shouldn't even try to display a list for the AC license (which can only be creted), this 
			// should be an error if we get here.  But for UAT1, we need to disable this message.
			//TODO: re-enable these lines after UAT1
			// if (imlist.isEmpty())
				//throw new AuraHandledException('No available icons found for available actions ' + aalist + ' on record id ' + recordId);	

		}
		return imList;
	}

}