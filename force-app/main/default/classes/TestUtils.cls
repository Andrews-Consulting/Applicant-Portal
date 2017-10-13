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
		       c = new Contact(Firstname='Test xyzzy', Lastname='Contact ' + i.format(), AccountID=acct.Id,MUSW__Account_Relationship__c='Applicant');
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

		String licName = 'XX000001';
		String appName = '17-0001';
		return CreateApplication(u, c, a, licenseTypeValue, licenseClassValue, licName, appName);
	}

		// Create an application (actually a license, an application and the junction object license application)
	//  This is a bare bones implementation of these three objects.
	//  The user is responsible for flushing out the objects in their tests.
	public static MUSW__Application2__c CreateApplication(User u, Contact c,Account a, String licenseTypeValue, String licenseClassValue, String licName, String appName) {

        system.runAs(u) {
		    MUSW__License2__c license = new MUSW__License2__c(Name=licName,MUSW__Primary_Licensee__c=a.Id, MUSW__Class__c=licenseClassValue,abd_License_Type__c=licenseTypeValue, MUSW__Applicant__c=c.Id, abd_Length__c='12 months');
		    system.debug(license);
		    insert license;
		    System.assertNotEquals(null, license);

		    MUSW__Application2__c app = new MUSW__Application2__c(abd_Application_Type__c ='New License',MUSW__Account__c=a.Id,MUSW__Applicant__c=c.Id,name=appName,MUSW__Status__c='Pending',abd_Primary_License__c=license.Id, abd_Length__c='12 months',abd_Portal_Processed__c = true);
		    system.debug(app);
			insert app;
		    System.assertNotEquals(null, app);

			abd_License_Application__c la = new abd_License_Application__c(abd_Application__c=app.Id,abd_License__c=license.Id, abd_Primary_License__c=true,abd_Portal_Processed__c = true);
		    system.debug(la);
		    insert la;
		    System.assertNotEquals(null, la);

	        return(app); 
	    }
	    // we'll never hit this, but the compiler doesn't know that.
	    return (new MUSW__Application2__c());
    }

    // Create an Add on license and attach it to the primary license. This isn't complete because we should connect it to the app as well
	public static MUSW__License2__c CreateAddOnLicense(User u, Contact c,Account a, String licenseTypeValue, String licenseClassValue, Id parentLicense) {
        system.runAs(u) {

		    MUSW__License2__c license = new MUSW__License2__c(Name='17-002',MUSW__Class__c=licenseClassValue,abd_License_Type__c=licenseTypeValue, MUSW__Primary_Licensee__c=a.Id, MUSW__Applicant__c=c.Id, MUSW__Type__c = licenseTypeValue,abd_Primary_License__c=parentLicense);
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

	//
	// Create License Type records  - built 9/18/17 - 
	//
	public static void CreateLicenseTypeRecords() {
		list<abd_License_Types__c> LicList = new list<abd_License_Types__c>(); 


		licList.add(new abd_License_Types__c(abd_License_Type__c='BCSS', abd_Class__c='BC Sunday Sales', Type_Of_Add_On__c='Privilege', Available_Term_Lengths__c='12 months',  canBePrimaryLicense__c=FALSE, Optional_Add_On_Privileges__c='BC', PremisesMustBeIowa__c=TRUE, abd_Requires_Bond__c=FALSE, abd_Requires_Dram__c=FALSE, StateIsLocalAuthority__c=FALSE, has68MonthRestriction__c=FALSE, hasSubmissions__c=TRUE, hasFees__c=TRUE, isCarryout__c=FALSE));
		licList.add(new abd_License_Types__c(abd_License_Type__c='OS', abd_Class__c='Outdoor Service', Type_Of_Add_On__c='Permit', Available_Term_Lengths__c='Permanent; 12 months; 8 months; 6 months; 14 days; 5 days; 36 hours',  canBePrimaryLicense__c=FALSE, PremisesMustBeIowa__c=TRUE, abd_Requires_Bond__c=FALSE, abd_Requires_Dram__c=FALSE, StateIsLocalAuthority__c=FALSE, has68MonthRestriction__c=FALSE, hasSubmissions__c=TRUE, hasFees__c=FALSE, isCarryout__c=FALSE));
		licList.add(new abd_License_Types__c(abd_License_Type__c='C', abd_Class__c='Catering', Type_Of_Add_On__c='Privilege', Available_Term_Lengths__c='12 months',  canBePrimaryLicense__c=FALSE, PremisesMustBeIowa__c=TRUE, abd_Requires_Bond__c=FALSE, abd_Requires_Dram__c=FALSE, StateIsLocalAuthority__c=FALSE, has68MonthRestriction__c=FALSE, hasSubmissions__c=FALSE, hasFees__c=FALSE, isCarryout__c=FALSE));
		licList.add(new abd_License_Types__c(abd_License_Type__c='BP', abd_Class__c='Brew Pub', Type_Of_Add_On__c='Permit', Available_Term_Lengths__c='Permanent; 12 months; 8 months; 6 months; 14 days; 5 days; 36 hours',  canBePrimaryLicense__c=FALSE, PremisesMustBeIowa__c=TRUE, abd_Requires_Bond__c=TRUE, abd_Requires_Dram__c=FALSE, StateIsLocalAuthority__c=FALSE, has68MonthRestriction__c=FALSE, hasSubmissions__c=TRUE, hasFees__c=TRUE, isCarryout__c=FALSE));
		licList.add(new abd_License_Types__c(abd_License_Type__c='LQ', abd_Class__c='Living Quarters', Type_Of_Add_On__c='Permit', Available_Term_Lengths__c='Permanent; 12 months; 8 months; 6 months; 14 days; 5 days; 36 hours',  canBePrimaryLicense__c=FALSE, PremisesMustBeIowa__c=TRUE, abd_Requires_Bond__c=FALSE, abd_Requires_Dram__c=FALSE, StateIsLocalAuthority__c=FALSE, has68MonthRestriction__c=FALSE, hasSubmissions__c=TRUE, hasFees__c=FALSE, isCarryout__c=FALSE));
		licList.add(new abd_License_Types__c(abd_License_Type__c='HPBP', abd_Class__c='High Proof Brew Pub', Type_Of_Add_On__c='Permit', Available_Term_Lengths__c='Permanent; 12 months; 8 months; 6 months; 14 days; 5 days; 36 hours',  canBePrimaryLicense__c=FALSE, PremisesMustBeIowa__c=TRUE, abd_Requires_Bond__c=TRUE, abd_Requires_Dram__c=FALSE, StateIsLocalAuthority__c=FALSE, has68MonthRestriction__c=FALSE, hasSubmissions__c=TRUE, hasFees__c=TRUE, isCarryout__c=FALSE));
		licList.add(new abd_License_Types__c(abd_License_Type__c='SS', abd_Class__c='Sunday Sales', Type_Of_Add_On__c='Privilege', Available_Term_Lengths__c='Permanent; 12 months; 8 months; 6 months; 14 days; 5 days; 36 hours',  canBePrimaryLicense__c=FALSE, PremisesMustBeIowa__c=TRUE, abd_Requires_Bond__c=FALSE, abd_Requires_Dram__c=FALSE, StateIsLocalAuthority__c=FALSE, has68MonthRestriction__c=FALSE, hasSubmissions__c=TRUE, hasFees__c=TRUE, isCarryout__c=FALSE));
		licList.add(new abd_License_Types__c(abd_License_Type__c='LE', abd_Class__c='Class E Liquor License', Type_Of_Add_On__c='NA', Available_Term_Lengths__c='12 months', abd_Available_Actions__c='AddPrivilege; Appeal; New; Refund; Renew; TransferLicense; UpdateOfficer; UpdateOwner; UpdatePremises',  canBePrimaryLicense__c=TRUE, abd_Default_Length__c='12 months', Optional_Add_On_Privileges__c='BC; WB; WBN; LQ; OS', PremisesMustBeIowa__c=TRUE, abd_Requires_Bond__c=FALSE, abd_Requires_Dram__c=FALSE, StateIsLocalAuthority__c=FALSE, has68MonthRestriction__c=TRUE, hasSubmissions__c=TRUE, hasFees__c=TRUE, Included_Add_On_Privileges__c='SS', isCarryout__c=TRUE));
		licList.add(new abd_License_Types__c(abd_License_Type__c='WBN', abd_Class__c='Class B Native Wine Permit', Type_Of_Add_On__c='Permit', Available_Term_Lengths__c='12 months', abd_Available_Actions__c='AddPrivilege; Appeal; New; Refund; Renew; TransferLicense; UpdateOfficer; UpdateOwner; UpdatePremises',  canBePrimaryLicense__c=TRUE, Does_Not_Allow__c='WB; WCN', Optional_Add_On_Privileges__c='BC; LQ; OS', PremisesMustBeIowa__c=TRUE, abd_Requires_Bond__c=FALSE, abd_Requires_Dram__c=FALSE, StateIsLocalAuthority__c=FALSE, has68MonthRestriction__c=TRUE, hasSubmissions__c=TRUE, hasFees__c=TRUE, Included_Add_On_Privileges__c='SS', isCarryout__c=TRUE));
		licList.add(new abd_License_Types__c(abd_License_Type__c='WA', abd_Class__c='Wholesale Wine Distributor', Type_Of_Add_On__c='NA', Available_Term_Lengths__c='12 months', abd_Available_Actions__c='AddPrivilege; Appeal; New; Refund; Renew; TransferLicense; UpdateOfficer; UpdateOwner; UpdatePremises',  canBePrimaryLicense__c=TRUE, abd_Default_Length__c='12 months', Optional_Add_On_Privileges__c='LQ', PremisesMustBeIowa__c=TRUE, abd_Requires_Bond__c=FALSE, abd_Requires_Dram__c=FALSE, StateIsLocalAuthority__c=TRUE, has68MonthRestriction__c=FALSE, hasSubmissions__c=TRUE, hasFees__c=TRUE, isCarryout__c=FALSE));
		licList.add(new abd_License_Types__c(abd_License_Type__c='BW', abd_Class__c='Special Class C Liquor', Type_Of_Add_On__c='NA', Available_Term_Lengths__c='12 months; 8 months; 6 months; 14 days; 5 days', abd_Available_Actions__c='AddPrivilege; Appeal; ChangeDramCarrier; New; KegRegistrationBooklet; Refund; Renew; TransferLicense; UpdateOfficer; UpdateOwner; UpdatePremises',  canBePrimaryLicense__c=TRUE, Optional_Add_On_Privileges__c='WB; WBN; LQ; OS; SS', PremisesMustBeIowa__c=TRUE, abd_Requires_Bond__c=FALSE, abd_Requires_Dram__c=TRUE, StateIsLocalAuthority__c=FALSE, has68MonthRestriction__c=TRUE, hasSubmissions__c=TRUE, hasFees__c=TRUE, isCarryout__c=FALSE));
		licList.add(new abd_License_Types__c(abd_License_Type__c='BAA', abd_Class__c='High Proof Wholesale Beer Distributor', Type_Of_Add_On__c='NA', Available_Term_Lengths__c='12 months', abd_Available_Actions__c='AddPrivilege; Appeal; New; Refund; Renew; TransferLicense; UpdateOfficer; UpdateOwner; UpdatePremises',  canBePrimaryLicense__c=TRUE, abd_Default_Length__c='12 months', Optional_Add_On_Privileges__c='LQ', PremisesMustBeIowa__c=TRUE, abd_Requires_Bond__c=FALSE, abd_Requires_Dram__c=FALSE, StateIsLocalAuthority__c=TRUE, has68MonthRestriction__c=FALSE, hasSubmissions__c=TRUE, hasFees__c=TRUE, isCarryout__c=FALSE));
		licList.add(new abd_License_Types__c(abd_License_Type__c='WAN', abd_Class__c='Native Wine Manufacturer', Type_Of_Add_On__c='NA', Available_Term_Lengths__c='12 months', abd_Available_Actions__c='AdditionalLocations; Appeal; New; Refund; Renew; TransferLicense; UpdateOfficer; UpdateOwner; UpdatePremises',  canBePrimaryLicense__c=TRUE, abd_Default_Length__c='12 months', Optional_Add_On_Privileges__c='LQ; OS', PremisesMustBeIowa__c=TRUE, abd_Requires_Bond__c=FALSE, abd_Requires_Dram__c=FALSE, StateIsLocalAuthority__c=TRUE, has68MonthRestriction__c=FALSE, hasSubmissions__c=TRUE, hasFees__c=TRUE, isCarryout__c=FALSE, Mandatory_Add_On_Privileges__c='CV'));
		licList.add(new abd_License_Types__c(abd_License_Type__c='SP', abd_Class__c='Broker\'s Permit', Type_Of_Add_On__c='NA', Available_Term_Lengths__c='12 months', abd_Available_Actions__c='AddPrivilege; Appeal; New; Refund; Renew; UpdateOfficer; UpdateOwner',  canBePrimaryLicense__c=TRUE, abd_Default_Length__c='12 months', PremisesMustBeIowa__c=FALSE, abd_Requires_Bond__c=FALSE, abd_Requires_Dram__c=FALSE, StateIsLocalAuthority__c=TRUE, has68MonthRestriction__c=FALSE, hasSubmissions__c=FALSE, hasFees__c=TRUE, isCarryout__c=FALSE));
		licList.add(new abd_License_Types__c(abd_License_Type__c='WCN', abd_Class__c='Class C Native Wine', Type_Of_Add_On__c='Permit', Available_Term_Lengths__c='12 months; 14 days; 5 days', abd_Available_Actions__c='AddPrivilege; Appeal; ChangeDramCarrier; New; Refund; Renew; TransferLicense; UpdateOfficer; UpdateOwner; UpdatePremises',  canBePrimaryLicense__c=TRUE, Does_Not_Allow__c='WBN', Optional_Add_On_Privileges__c='LQ; OS', PremisesMustBeIowa__c=TRUE, abd_Requires_Bond__c=FALSE, abd_Requires_Dram__c=TRUE, StateIsLocalAuthority__c=FALSE, has68MonthRestriction__c=TRUE, hasSubmissions__c=TRUE, hasFees__c=TRUE, Included_Add_On_Privileges__c='SS', isCarryout__c=FALSE));
		licList.add(new abd_License_Types__c(abd_License_Type__c='BAAN', abd_Class__c='High Proof Native Wholesale Beer Distributor', Type_Of_Add_On__c='NA', Available_Term_Lengths__c='12 months', abd_Available_Actions__c='AddPrivilege; Appeal; New; Refund; Renew; TransferLicense; UpdateOfficer; UpdateOwner; UpdatePremises',  canBePrimaryLicense__c=TRUE, abd_Default_Length__c='12 months', Optional_Add_On_Privileges__c='LQ', PremisesMustBeIowa__c=TRUE, abd_Requires_Bond__c=FALSE, abd_Requires_Dram__c=FALSE, StateIsLocalAuthority__c=TRUE, has68MonthRestriction__c=FALSE, hasSubmissions__c=TRUE, hasFees__c=TRUE, isCarryout__c=FALSE));
		licList.add(new abd_License_Types__c(abd_License_Type__c='CD', abd_Class__c='Distiller\'s Certificate of Compliance', Type_Of_Add_On__c='NA', Available_Term_Lengths__c='12 months', abd_Available_Actions__c='Appeal; New; Refund; Renew; TransferLicense; UpdateOfficer; UpdateOwner; UpdatePremises',  canBePrimaryLicense__c=TRUE, abd_Default_Length__c='12 months', PremisesMustBeIowa__c=FALSE, abd_Requires_Bond__c=FALSE, abd_Requires_Dram__c=FALSE, StateIsLocalAuthority__c=TRUE, has68MonthRestriction__c=FALSE, hasSubmissions__c=FALSE, hasFees__c=TRUE, isCarryout__c=FALSE));
		licList.add(new abd_License_Types__c(abd_License_Type__c='LA', abd_Class__c='Class A Liquor License', Type_Of_Add_On__c='NA', Available_Term_Lengths__c='12 months; 8 months; 6 months; 14 days; 5 days', abd_Available_Actions__c='Appeal; ChangeDramCarrier; New; Refund; Renew; TransferLicense; UpdateOfficer; UpdateOwner; UpdatePremises',  canBePrimaryLicense__c=TRUE, Optional_Add_On_Privileges__c='LQ; OS; SS', PremisesMustBeIowa__c=TRUE, abd_Requires_Bond__c=FALSE, abd_Requires_Dram__c=TRUE, StateIsLocalAuthority__c=FALSE, has68MonthRestriction__c=TRUE, hasSubmissions__c=TRUE, hasFees__c=TRUE, isCarryout__c=FALSE));
		licList.add(new abd_License_Types__c(abd_License_Type__c='BB', abd_Class__c='Class B Beer Permit', Type_Of_Add_On__c='NA', Available_Term_Lengths__c='12 months; 8 months; 6 months; 14 days; 5 days', abd_Available_Actions__c='AddPrivilege; Appeal; ChangeDramCarrier; New; KegRegistrationBooklet; Refund; Renew; TransferLicense; UpdateOfficer; UpdateOwner; UpdatePremises',  canBePrimaryLicense__c=TRUE, Optional_Add_On_Privileges__c='WBN; WCN; BP; HPBP; LQ; OS; SS', PremisesMustBeIowa__c=TRUE, abd_Requires_Bond__c=FALSE, abd_Requires_Dram__c=TRUE, StateIsLocalAuthority__c=FALSE, has68MonthRestriction__c=TRUE, hasSubmissions__c=TRUE, hasFees__c=TRUE, isCarryout__c=FALSE));
		licList.add(new abd_License_Types__c(abd_License_Type__c='CB', abd_Class__c='Brewer\'s Certificate of Compliance', Type_Of_Add_On__c='NA', Available_Term_Lengths__c='12 months', abd_Available_Actions__c='Appeal; LabelApproval; New; Refund; Renew; TransferLicense; UpdateOfficer; UpdateOwner; UpdatePremises',  canBePrimaryLicense__c=TRUE, abd_Default_Length__c='12 months', PremisesMustBeIowa__c=FALSE, abd_Requires_Bond__c=FALSE, abd_Requires_Dram__c=FALSE, StateIsLocalAuthority__c=TRUE, has68MonthRestriction__c=FALSE, hasSubmissions__c=FALSE, hasFees__c=TRUE, isCarryout__c=FALSE));
		licList.add(new abd_License_Types__c(abd_License_Type__c='DS', abd_Class__c='Direct Shipper License', Type_Of_Add_On__c='NA', Available_Term_Lengths__c='12 months', abd_Available_Actions__c='Appeal; New; Refund; Renew; TransferLicense; UpdateOfficer; UpdateOwner',  canBePrimaryLicense__c=TRUE, abd_Default_Length__c='12 months', PremisesMustBeIowa__c=FALSE, abd_Requires_Bond__c=FALSE, abd_Requires_Dram__c=FALSE, StateIsLocalAuthority__c=TRUE, has68MonthRestriction__c=FALSE, hasSubmissions__c=TRUE, hasFees__c=TRUE, isCarryout__c=FALSE));
		licList.add(new abd_License_Types__c(abd_License_Type__c='LC', abd_Class__c='Class C Liquor License', Type_Of_Add_On__c='NA', Available_Term_Lengths__c='12 months; 8 months; 6 months; 14 days; 5 days', abd_Available_Actions__c='AddPrivilege; Appeal; ChangeDramCarrier; New; KegRegistrationBooklet; Refund; Renew; TransferLicense; UpdateOfficer; UpdateOwner; UpdatePremises',  canBePrimaryLicense__c=TRUE, Optional_Add_On_Privileges__c='WB; WBN; WCN; BP; C; HPBP; LQ; OS; SS', PremisesMustBeIowa__c=TRUE, abd_Requires_Bond__c=FALSE, abd_Requires_Dram__c=TRUE, StateIsLocalAuthority__c=FALSE, has68MonthRestriction__c=TRUE, hasSubmissions__c=TRUE, hasFees__c=TRUE, isCarryout__c=FALSE));
		licList.add(new abd_License_Types__c(abd_License_Type__c='WB', abd_Class__c='Class B Wine Permit', Type_Of_Add_On__c='Permit', Available_Term_Lengths__c='12 months; 8 months; 6 months', abd_Available_Actions__c='AddPrivilege; Appeal; New; Refund; Renew; TransferLicense; UpdateOfficer; UpdateOwner; UpdatePremises',  canBePrimaryLicense__c=TRUE, Does_Not_Allow__c='WBN', Optional_Add_On_Privileges__c='BC; LQ; OS', PremisesMustBeIowa__c=TRUE, abd_Requires_Bond__c=FALSE, abd_Requires_Dram__c=FALSE, StateIsLocalAuthority__c=FALSE, has68MonthRestriction__c=TRUE, hasSubmissions__c=TRUE, hasFees__c=TRUE, Included_Add_On_Privileges__c='SS', isCarryout__c=TRUE));
		licList.add(new abd_License_Types__c(abd_License_Type__c='CM', abd_Class__c='Liquor Manufacturer', Type_Of_Add_On__c='NA', Available_Term_Lengths__c='12 months', abd_Available_Actions__c='AddPrivilege; Appeal; New; Refund; Renew; TransferLicense; UpdateOfficer; UpdateOwner; UpdatePremises',  canBePrimaryLicense__c=TRUE, abd_Default_Length__c='12 months', Optional_Add_On_Privileges__c='LQ', PremisesMustBeIowa__c=TRUE, abd_Requires_Bond__c=FALSE, abd_Requires_Dram__c=FALSE, StateIsLocalAuthority__c=TRUE, has68MonthRestriction__c=FALSE, hasSubmissions__c=TRUE, hasFees__c=TRUE, isCarryout__c=FALSE));
		licList.add(new abd_License_Types__c(abd_License_Type__c='BA', abd_Class__c='Wholesale Beer Distributor', Type_Of_Add_On__c='NA', Available_Term_Lengths__c='12 months', abd_Available_Actions__c='AddPrivilege; Appeal; New; Refund; Renew; TransferLicense; UpdateOfficer; UpdateOwner; UpdatePremises',  canBePrimaryLicense__c=TRUE, abd_Default_Length__c='12 months', Optional_Add_On_Privileges__c='LQ', PremisesMustBeIowa__c=TRUE, abd_Requires_Bond__c=FALSE, abd_Requires_Dram__c=FALSE, StateIsLocalAuthority__c=TRUE, has68MonthRestriction__c=FALSE, hasSubmissions__c=TRUE, hasFees__c=TRUE, isCarryout__c=FALSE));
		licList.add(new abd_License_Types__c(abd_License_Type__c='CP', abd_Class__c='Charity Beer Wine and Liquor Auction Permit', Type_Of_Add_On__c='NA', Available_Term_Lengths__c='36 hours', abd_Available_Actions__c='Appeal; New; Refund',  canBePrimaryLicense__c=TRUE, abd_Default_Length__c='36 Hours', PremisesMustBeIowa__c=TRUE, abd_Requires_Bond__c=FALSE, abd_Requires_Dram__c=FALSE, StateIsLocalAuthority__c=TRUE, has68MonthRestriction__c=FALSE, hasSubmissions__c=TRUE, hasFees__c=TRUE, isCarryout__c=TRUE));
		licList.add(new abd_License_Types__c(abd_License_Type__c='CV', abd_Class__c='Vintner\'s Certificate of Compliance', Type_Of_Add_On__c='NA', Available_Term_Lengths__c='12 months', abd_Available_Actions__c='Appeal; LabelApproval; New; Refund; Renew; TransferLicense; UpdateOfficer; UpdateOwner; UpdatePremises',  canBePrimaryLicense__c=TRUE, abd_Default_Length__c='12 months', PremisesMustBeIowa__c=FALSE, abd_Requires_Bond__c=FALSE, abd_Requires_Dram__c=FALSE, StateIsLocalAuthority__c=TRUE, has68MonthRestriction__c=FALSE, hasSubmissions__c=FALSE, hasFees__c=TRUE, isCarryout__c=FALSE));
		licList.add(new abd_License_Types__c(abd_License_Type__c='LB', abd_Class__c='Class B Liquor License', Type_Of_Add_On__c='NA', Available_Term_Lengths__c='12 months; 8 months; 6 months; 14 days; 5 days', abd_Available_Actions__c='AddPrivilege; Appeal; ChangeDramCarrier; New; KegRegistrationBooklet; Refund; Renew; TransferLicense; UpdateOfficer; UpdateOwner; UpdatePremises',  canBePrimaryLicense__c=TRUE, Optional_Add_On_Privileges__c='WB; WBN; WCN; C; LQ; OS; SS', PremisesMustBeIowa__c=TRUE, abd_Requires_Bond__c=FALSE, abd_Requires_Dram__c=TRUE, StateIsLocalAuthority__c=FALSE, has68MonthRestriction__c=TRUE, hasSubmissions__c=TRUE, hasFees__c=TRUE, isCarryout__c=FALSE));
		licList.add(new abd_License_Types__c(abd_License_Type__c='BC', abd_Class__c='Class C Beer Permit', Type_Of_Add_On__c='Permit', Available_Term_Lengths__c='12 months', abd_Available_Actions__c='AddPrivilege; Appeal; New; KegRegistrationBooklet; Refund; Renew; TransferLicense; UpdateOfficer; UpdateOwner; UpdatePremises',  canBePrimaryLicense__c=TRUE, abd_Default_Length__c='12 months', Optional_Add_On_Privileges__c='WB; WBN; LQ; OS; SS', PremisesMustBeIowa__c=TRUE, abd_Requires_Bond__c=FALSE, abd_Requires_Dram__c=FALSE, StateIsLocalAuthority__c=FALSE, has68MonthRestriction__c=TRUE, hasSubmissions__c=TRUE, hasFees__c=TRUE, isCarryout__c=TRUE));
		licList.add(new abd_License_Types__c(abd_License_Type__c='LD', abd_Class__c='Class D Liquor License', Type_Of_Add_On__c='NA', Available_Term_Lengths__c='12 months; 8 months; 6 months; 14 days; 5 days', abd_Available_Actions__c='AddPrivilege; Appeal; ChangeDramCarrier; New; Refund; Renew; TransferLicense; UpdateOfficer; UpdateOwner; UpdatePremises',  canBePrimaryLicense__c=TRUE, Optional_Add_On_Privileges__c='LQ; SS', Optional_Not_12Mo_Add_Ons_Privileges__c='OS', PremisesMustBeIowa__c=TRUE, abd_Requires_Bond__c=FALSE, abd_Requires_Dram__c=TRUE, StateIsLocalAuthority__c=TRUE, has68MonthRestriction__c=TRUE, hasSubmissions__c=TRUE, hasFees__c=TRUE, isCarryout__c=FALSE));
		licList.add(new abd_License_Types__c(abd_License_Type__c='MD', abd_Class__c='Micro-Distilled Spirits Permit', Type_Of_Add_On__c='NA', Available_Term_Lengths__c='12 months', abd_Available_Actions__c='AddPrivilege; Appeal; New; Refund; Renew; TransferLicense; UpdateOfficer; UpdateOwner; UpdatePremises',  canBePrimaryLicense__c=TRUE, abd_Default_Length__c='12 months', Optional_Add_On_Privileges__c='LQ', PremisesMustBeIowa__c=TRUE, abd_Requires_Bond__c=FALSE, abd_Requires_Dram__c=FALSE, StateIsLocalAuthority__c=FALSE, has68MonthRestriction__c=TRUE, hasSubmissions__c=TRUE, hasFees__c=TRUE, isCarryout__c=FALSE));
		licList.add(new abd_License_Types__c(abd_License_Type__c='AC', abd_Class__c='Carrier Permit', Type_Of_Add_On__c='NA', Available_Term_Lengths__c='Permanent', abd_Available_Actions__c='New',  canBePrimaryLicense__c=TRUE, abd_Default_Length__c='Permanent', PremisesMustBeIowa__c=FALSE, abd_Requires_Bond__c=FALSE, abd_Requires_Dram__c=FALSE, StateIsLocalAuthority__c=TRUE, has68MonthRestriction__c=FALSE, hasSubmissions__c=FALSE, hasFees__c=TRUE, isCarryout__c=FALSE));
		licList.add(new abd_License_Types__c(abd_License_Type__c='BAN', abd_Class__c='Native Wholesale Beer Distributor', Type_Of_Add_On__c='NA', Available_Term_Lengths__c='12 months', abd_Available_Actions__c='AddPrivilege; Appeal; New; Refund; Renew; TransferLicense; UpdateOfficer; UpdateOwner; UpdatePremises',  canBePrimaryLicense__c=TRUE, abd_Default_Length__c='12 months', Optional_Add_On_Privileges__c='LQ', PremisesMustBeIowa__c=TRUE, abd_Requires_Bond__c=FALSE, abd_Requires_Dram__c=FALSE, StateIsLocalAuthority__c=TRUE, has68MonthRestriction__c=FALSE, hasSubmissions__c=TRUE, hasFees__c=TRUE, isCarryout__c=FALSE));

		insert licList;
		System.assertNotEquals(null, licList[0].Id);

	}

}