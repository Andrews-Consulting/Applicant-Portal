global class DX_ApplicationCleanup_Batch implements Database.Batchable<sObject>{ 
	
	global Database.QueryLocator start(Database.BatchableContext BC){
   		string [] statuses = new string[]{'In Progress','Pending'};
   		decimal days = [Select Application_Cleanup_Timeframe__c from DX_Portal_General_Setting__mdt][0].Application_Cleanup_Timeframe__c;
   		date d = system.today();
   		d = d.addDays((!test.isRunningTest())?(integer.valueof(days)*-1):1);
   		string query = 'Select Id, (Select Id, abd_License__c From License_Applications__r), (Select Id From Authorized_Agents__r), (Select Id From MUSW__Submissions__r), (Select Id From MUSW__Fees__r), (Select Id From Answers__r), (Select Id From Application_Contacts__r) from MUSW__Application2__c where RecordType.Name != \'Renewal Application\' and MUSW__Status__c IN:statuses and lastmodifieddate<=:d';
		return Database.getQueryLocator(query); 
	}
	     
	global void execute(Database.BatchableContext BC, List<MUSW__Application2__c> scope){
		Id[] deleteList = new Id[]{};
		map<string,set<id>> mapIds = new map<string,set<id>>();
		
		for(MUSW__Application2__c a : scope){ 
			
			if(!mapIds.containskey('App'))
				mapIds.put('App',new set<id>());
			mapIds.get('App').add(a.Id);
			
			if(!mapIds.containskey('LicApp'))
				mapIds.put('LicApp',new set<id>());
			if(!mapIds.containskey('Lic'))
				mapIds.put('Lic',new set<id>());
			for(abd_License_Application__c la: a.License_Applications__r){
				mapIds.get('LicApp').add(la.Id);
				mapIds.get('Lic').add(la.abd_License__c);
			}
			if(!mapIds.containskey('Ans'))
				mapIds.put('Ans',new set<id>());
			for(BGCK__Answer__c ans: a.Answers__r) {	
				mapIds.get('Ans').add(ans.Id);
			}
			if(!mapIds.containskey('Fee'))
				mapIds.put('Fee',new set<id>());
			for(MUSW__Fee__c f : a.MUSW__Fees__r){	
				mapIds.get('Fee').add(f.Id);
			}
			if(!mapIds.containskey('Auth'))
				mapIds.put('Auth',new set<id>());
			for(abd_Authorized_Agent__c aa: a.Authorized_Agents__r){	
				mapIds.get('Auth').add(aa.Id);
			}
			if(!mapIds.containskey('Sub'))
				mapIds.put('Sub',new set<id>());
			for(MUSW__Submission__c sub: a.MUSW__Submissions__r){	
				mapIds.get('Sub').add(sub.Id);
			}
			if(!mapIds.containskey('Own'))
				mapIds.put('Own',new set<id>());
			for(Application_Contact__c ac: a.Application_Contacts__r){	
				mapIds.get('Own').add(ac.Id);
			}	 
		}
		deleteList.addAll(mapIds.get('Lic'));	
		deleteList.addAll(mapIds.get('Ans'));	
		deleteList.addAll(mapIds.get('Fee'));	
		deleteList.addAll(mapIds.get('Auth'));	
		deleteList.addAll(mapIds.get('Sub'));	
		deleteList.addAll(mapIds.get('Own'));	
		deleteList.addAll(mapIds.get('App'));	
		deleteList.addAll(mapIds.get('LicApp'));	
		
		Database.DeleteResult[] drList = Database.delete(deleteList, true);		 
		system.debug(mapIds);
		system.debug(deleteList);
		system.debug(drList);
	}
	     
	global void finish(Database.BatchableContext info){     
	} 

}