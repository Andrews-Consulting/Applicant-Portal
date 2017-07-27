@isTest
public class TestUtils {
    
    public static void Generate_DX_HelpText() {
    	DX_HelpText__c ht = new DX_HelpText__c();
    	ht.Name = 'Test';
    	ht.HelpText__c = 'Test1 Text.';
    	insert ht;
    }

    // Create the required citizen account
    public static Account Create_Citizen_Account(){
	    Account a = new Account(Name='Citizen');
	    insert a;
	    return a;
    }

	//
	//  Create one or more account records.  Depending upon validation rules in place, you may or may not need to supply a PIC contact.
	//
	public static list<Account> Create_Account(String typeOfAccounts, Integer numberofAccounts) {
	    //Build up data

	    Account a;
	    list<Account> accountList = new list<Account>();
	    For (integer i = 0; i < numberofAccounts; i++) {
		       a = new Account(Name='Test xyzzy ' + typeOfAccounts + ' Account ' + i.format(),Type=typeOfAccounts,MUSW__Person_Account__c=false);
		   accountList.add(a);
		}
		System.debug(accountList);
		insert accountList;
		return accountList;
	}


	// overloaded instance that sets the record type -- don't enable this routine unless  recordtypes exist
	// public static list<Account> Create_Account(String typeOfAccounts, String role, Integer numberofAccounts, String recordtypeVal) {

	//     list<RecordType> rtlist = [Select Id from RecordType where SobjectType = 'Account' and Name = :recordtypeVal];
	//     System.assertNotEquals(0, rtlist.size());
	//     Id rtID = rtlist[0].Id;

	//     Account a;
	//     list<Account> accountList = new list<Account>();
	//     For (integer i = 0; i < numberofAccounts; i++) {
	// 	       a = new Account(Name='Test Role xyzzy ' + typeOfAccounts + ' Account ' + i.format(),Type=typeOfAccounts, RecordTypeId=rtID);
	// 	   accountList.add(a);
	// 	}
	// 	insert accountList;
	// 	return accountList;
	// }


	//
	// Create n number of contacts and return the list of contacts to the requestor.
	//
	public static list<Contact> Create_Contacts(Integer numberofContacts, Account acct) {
	    Contact c;
	    list<Contact> contactList = new list<Contact>();
	    For (integer i = 0; i < numberofContacts; i++) {
            if(acct != null){
		       c = new Contact(Firstname='Test xyzzy', Lastname='Contact ' + i.format(), AccountID=acct.Id,MUSW__Account_Relationship__c='Owner');
            }else{
               c = new Contact(Firstname='Test xyzzy', Lastname='Contact ' + i.format()); 
            }
		   contactList.add(c);
		}
		insert contactList;
		return contactList;
	}

	//
	//  Create an account contact role
	//
	public static AccountContactRole Create_AccountContactRole(Account a, Contact c, String r) {
		AccountContactRole acr = new AccountContactRole(AccountId = a.Id, ContactId = c.Id, Role = r);
		insert acr;
		return acr;
		}
    //
	
	//
	// Create n number of Opportunities and return the list of opportunities to the requestor.
	//  The close months is to support forecasting 
	//
	public static list<Opportunity> CreateOpportunity(Integer numberofOptys, String Stage, Integer closeMonths, Account acct) {
	    Opportunity o;
	    list<Opportunity> optyList = new list<Opportunity>();
	    For (integer i = 0; i < numberofOptys; i++) {
		       o = new Opportunity(Name='Test xyzzy Opty ' + i.format(), Stagename=stage, LeadSource='Client upgrade', 
		       					   Amount=((i+1)*10000), Type='New Client', AccountID=acct.Id, 
		       					   CloseDate=system.today()+(closeMonths*30));
		   optyList.add(o);
		}
		insert optyList;
		return optyList;
	}


	//
	// Create n number of Tasks attached to the ACCOUNT and return the list of Tasks to the requestor.
	//
	public static list<Task> CreateTask(Integer numberofTasks, Account whatvalue) {
		Task t;
		list<Task> tasklist = new list<Task>();
		for (Integer i = 0; i < numberofTasks; i++) {
			t = new Task(Subject='Sample Task ' + i.format(), Status='Open', Priority='High', ActivityDate=System.today()+i, Whatid=whatvalue.Id);
			tasklist.add(t);
		}
		insert tasklist;
		return tasklist;
	}
	//
	// Create n number of Tasks attached to the Opportunity and return the list of Tasks to the requestor.
	//
	public static list<Task> CreateTask(Integer numberofTasks, Opportunity whatvalue) {
		Task t;
		list<Task> tasklist = new list<Task>();
		for (Integer i = 0; i < numberofTasks; i++) {
			t = new Task(Subject='Sample Task ' + i.format(), Status='Open', Priority='High', ActivityDate=System.today()+i, Whatid=whatvalue.Id);
			tasklist.add(t);
		}
		insert tasklist;
		return tasklist;
	}	
	//
	// Create n number of Tasks attached to the Contact and return the list of Tasks to the requestor.
	//
	public static list<Task> CreateTask(Integer numberofTasks, Contact whatvalue) {
		Task t;
		list<Task> tasklist = new list<Task>();
		for (Integer i = 0; i < numberofTasks; i++) {
			t = new Task(Subject='Sample Task ' + i.format(), Status='Open', Priority='High', ActivityDate=System.today()+i, Whatid=whatvalue.Id);
			tasklist.add(t);
		}
		insert tasklist;
		return tasklist;
	}	
	//
	// Create n number of Tasks attached to the Case and return the list of Tasks to the requestor.
	//
	public static list<Task> CreateTask(Integer numberofTasks, Case whatvalue) {
		Task t;
		list<Task> tasklist = new list<Task>();
		for (Integer i = 0; i < numberofTasks; i++) {
			t = new Task(Subject='Sample Task ' + i.format(), Status='Open', Priority='High', ActivityDate=System.today()+i, Whatid=whatvalue.Id);
			tasklist.add(t);
		}
		insert tasklist;
		return tasklist;
	}	


	// if we are creating portal users, then we need to make sure the current running user has a role.
	// So just set a dummy one if it's empty.
	public static void SetRoleForCurrentUser() {
		if(UserInfo.getUserRoleId() == null) {
			UserRole r = new UserRole(name = 'TEST ROLE');
			User u = [Select UserRoleID from User where id =: UserInfo.getUserId()];
			u.UserRoleID = r.Id;
			update u;
		}
	}

	// This routine creates a portal user  -- It currently only creates one and the license type is hardcoded.
	//  **TODO** enhance this routine to create multiple users and set the profile/license type
	public static User CreatePortalUser(Contact c){

		if(UserInfo.getUserRoleId() == null) {
			UserRole r = new UserRole(name = 'TEST ROLE');
			User u = [Select UserRoleID from User where id =: UserInfo.getUserId()];
			u.UserRoleID = r.Id;
			update u;
		}

		// create a portal user
		string pName = 'Customer Community Plus Login User';
        if(c.Title != null)
            pName = c.Title;
		Id p = [select id from profile where name=:pName].id;
     
        User user = new User(alias = 'test123', email='test123@doextra.com',
                emailencodingkey='UTF-8', lastname='Testing', languagelocalekey='en_US',
                localesidkey='en_US', profileid = p, country='United States',IsActive =true,
                ContactId = c.Id,
                timezonesidkey='America/Los_Angeles', username='tester@doextra.com');
       
        insert user;
        return user;

	}

	// Create an application (actually a license, an application and the junction object license application)
	//  This is a bare bones implementation of these three objects.
	//  The user is responsible for flushing out the objects in their tests.
	public static MUSW__Application2__c CreateApplication(User u, Contact c,Account a, String licenseTypeValue, String licenseClassValue) {


        system.runAs(u) {

		    MUSW__License2__c license = new MUSW__License2__c(Name='17-001',MUSW__Class__c=licenseClassValue,abd_License_Type__c=licenseTypeValue, MUSW__Primary_Licensee__c=a.Id, MUSW__Applicant__c=c.Id, MUSW__Type__c = 'Business');
		    insert license;
		    System.assertNotEquals(null, license);

		    MUSW__Application2__c app = new MUSW__Application2__c(abd_Application_Type__c ='New License',MUSW__Account__c=a.Id,MUSW__Applicant__c=c.Id,name='17-001',MUSW__Status__c='Pending',abd_Primary_License__c=license.Id, abd_Length__c='12 months');
			insert app;
		    System.assertNotEquals(null, app);

		    // abd_License_Application__c la = new abd_License_Application__c(abd_Application__c=app.Id,abd_License__c=license.Id);
		    // insert la;
		    // System.assertNotEquals(null, la);

	        return(app); 
	    }
	    // we'll never hit this, but the compiler doesn't know that.
	    return (new MUSW__Application2__c());
    }

    // Create an Add on license and attach it to the primary license. This isn't complete because we should connect it to the app as well
	public static MUSW__License2__c CreateAddOnLicense(User u, Contact c,Account a, String licenseTypeValue, String licenseClassValue, Id parentLicense) {
        system.runAs(u) {

		    MUSW__License2__c license = new MUSW__License2__c(Name='17-002',MUSW__Class__c=licenseClassValue,abd_License_Type__c=licenseTypeValue, MUSW__Primary_Licensee__c=a.Id, MUSW__Applicant__c=c.Id, MUSW__Type__c = 'Business',abd_Primary_License__c=parentLicense);
		    insert license;
		    System.assertNotEquals(null, license);

			// abd_License_Application__c la = new abd_License_Application__c(abd_Application__c=app.Id,abd_License__c=license.Id);
		 //    insert la;
		 //    System.assertNotEquals(null, la);		    

		    return license;
		}
		// We'll never hit this code, but the compiler doesn't know that.
		return (new MUSW__License2__c());
	}

    
    public static User getTestUserWithRole(){
        
        User userWithRole;
        if(UserInfo.getUserRoleId() == null) {
    
            UserRole r = new UserRole(name = 'TEST ROLE');
            Database.insert(r);
            
            userWithRole = new User(alias = 'hasrole', email='userwithrole@roletest1.com', userroleid = r.id,
                                emailencodingkey='UTF-8', lastname='Testing', languagelocalekey='en_US', 
                                localesidkey='en_US', profileid = UserInfo.getProfileId(), 
                                timezonesidkey='America/Los_Angeles', username='userwithrole@testorg.com');
            Database.insert(userWithRole);
        } else {
            userWithRole = new User(Id = UserInfo.getUserId(), UserRoleId = UserInfo.getUserRoleId());
        }
        return userWithRole;
    }
    
    //
	//  Create an account contact role
	//
	public static Application_Contact__c Create_ApplicationContact(MUSW__Application2__c a, Contact c) {
		Application_Contact__c ac = new Application_Contact__c(Contact__c = c.Id, Application__c = a.Id,SSN__c='123-45-6789',First_Name__c=c.firstName,Last_Name__c=c.lastName);
		insert ac;
		return ac;
	}
}