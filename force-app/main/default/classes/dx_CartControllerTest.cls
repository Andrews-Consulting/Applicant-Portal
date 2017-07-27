/**
 *  Test Cases Object for testing cart controller. 
 *   
 *  @author     Tahsin Zulkarnine
 *  @version    1.0
 *  @since      2014-12-05
 *
 */
@isTest
private class dx_CartControllerTest {
private static Integer randomNum;

    @testSetup
    private static void setupTestData()
    {
        new BGBK.TestMock();
        insert new BGBK__CartSettings__c(Name='Default');
    }

    @isTest
    private static void testFromPermit()
    {
        BGBK.RulesEngineState.setLock();
                
        Contact c = new Contact(Lastname='TestUser123', Email='test@test.com');
        insert c;
        Contact cq = [select AccountId from Contact where Id=:c.Id];
        
        MUSW__Parcel__c par = new MUSW__Parcel__c(Name='xyz123abc');
        insert par;
        MUSW__Permit2__c perm = new MUSW__Permit2__c(MUSW__Type__c='Building', MUSW__Parcel__c=par.id, MUSW__Applicant__c=c.Id);
        insert perm;
        MUSW__Fee__c f1 = new MUSW__Fee__c(MUSW__Amount__C=20, MUSW__Permit2__c=perm.Id);
        MUSW__Fee__c f2 = new MUSW__Fee__c(MUSW__Amount__C=120, MUSW__Permit2__c=perm.Id);
        MUSW__Fee__c[] fees = new MUSW__Fee__c[]{f1,f2};
        insert fees;
        
        // set page 
        pageReference fp = Page.Cart;
        fp.getParameters().put('pid', perm.Id);
        Test.setCurrentPage(fp);
        
        // pass fees as selections to controller
        ApexPages.StandardSetController ssc = new ApexPages.StandardSetController(fees);
        ssc.setSelected(fees);
        dx_CartController fc = new dx_CartController(ssc);
        fc.initOrder();
        List<SelectOption> accs = fc.accounts;
        system.assert(fc.rs[0].MUSW__Receipt_Paid_by__c == c.Id);
        fc.cart.BGBK__Contact__c = c.Id;
        fc.rs[0].MUSW__Payment_Method__c = 'Check';
        fc.accountSelected = cq.AccountId;
        fc.checkout();
        fc.review();
        
        BGBK.RulesEngineState.releaseLock();
        
        fc.process();
        fc.sendPdf();
        fc.cancel();
        //fc.accountChanged();
    }

    @isTest
    private static void testFromInvoice()
    {
        // BGBK.RulesEngineState.setLock();                
        Account account = new Account(Name='Test Account');
        insert account;
                     
        Contact c = new Contact(LastName='Test Contact',FirstName='BasicGov', Email='test@basicgov.com',Account=account,MUSW__Account_Relationship__c='Owner');
        insert c;
       
        Contact cq = [select AccountId from Contact where Id=:c.Id];
        
        MUSW__Parcel__c par = new MUSW__Parcel__c(Name='xyz123abc');
        insert par;
        MUSW__Permit2__c perm = new MUSW__Permit2__c(MUSW__Type__c='Building', MUSW__Parcel__c=par.id, MUSW__Applicant__c=c.Id);
        insert perm;
        BGBK__Cart__c testCart = new BGBK__Cart__c(BGBK__Account__c= cq.AccountId, BGBK__Contact__c= cq.Id, BGBK__Expiration_DateTime__c=system.now().addDays(1));
        insert testCart;
        
        // add fees to cart
        
        randomNum = Math.round(Math.random()*100000);
        String InvoiceNum1 = 'BGT-'+randomNum.format();
                
        BGBK__Bill__c inv1 = new BGBK__Bill__c(BGBK__Tracking_Number__c=InvoiceNum1,BGBK__Total_Fees__c=25,BGBK__Total_Payments__c=0);
        insert inv1;
                
        MUSW__Fee__c f1 = new MUSW__Fee__c(MUSW__Amount__c=25, MUSW__Permit2__c=perm.Id, BGBK__Cart__c = testCart.Id,BGBK__Invoice__c=inv1.Id);
        insert f1;
       
        // set page 
        pageReference fp = Page.Cart;
        fp.getParameters().put('invoiceId', inv1.Id);
        Test.setCurrentPage(fp);
        
        dx_CartController fc = new dx_CartController(null);
        fc.initOrder();
        //system.assert(fc.cart.BGBK__Total_Amount__c== 140);
        List<SelectOption> accs = fc.accounts;
        fc.rs[0].MUSW__Payment_Method__c = 'Credit Card';
        fc.accountSelected = cq.AccountId ;
        fc.Checkout();
        fc.review();
        
        // BGBK.RulesEngineState.releaseLock();
        
        fc.process();
        system.assert(fc.cart.BGBK__Process_DateTime__c!= null);
        try { fc.sendPdf(); }
        catch (EmailException e) { if (e.getMessage().contains('Single email must be enabled')) {} }
        fc.cancel();
        //fc.accountChanged();
    }

    @isTest
    private static void testFromCart()
    {
        BGBK.RulesEngineState.setLock();                
        
        Contact c = new Contact(Lastname='TestUser123', Email='test@test.com');
        insert c;
        Contact cq = [select AccountId from Contact where Id=:c.Id];
        
        MUSW__Parcel__c par = new MUSW__Parcel__c(Name='xyz123abc');
        insert par;
        MUSW__Permit2__c perm = new MUSW__Permit2__c(MUSW__Type__c='Building', MUSW__Parcel__c=par.id, MUSW__Applicant__c=c.Id);
        insert perm;
        BGBK__Cart__c testCart = new BGBK__Cart__c(BGBK__Account__c= cq.AccountId, BGBK__Contact__c= cq.Id, BGBK__Expiration_DateTime__c=system.now().addDays(1));
        insert testCart;
        
        // add fees to cart
        MUSW__Fee__c f1 = new MUSW__Fee__c(MUSW__Amount__c=20, MUSW__Permit2__c=perm.Id, BGBK__Cart__c = testCart.Id);
        MUSW__Fee__c f2 = new MUSW__Fee__c(MUSW__Amount__c=120, MUSW__Permit2__c=perm.Id, BGBK__Cart__c = testCart.Id);
        MUSW__Fee__c[] fees = new MUSW__Fee__c[]{f1,f2};
        insert fees;
        
        // set page 
        pageReference fp = Page.Cart;
        fp.getParameters().put('Id', testCart.Id);
        Test.setCurrentPage(fp);
        
        dx_CartController fc = new dx_CartController(null);
        fc.initOrder();
        //system.assert(fc.cart.BGBK__Total_Amount__c== 140);
        List<SelectOption> accs = fc.accounts;
        fc.rs[0].MUSW__Payment_Method__c = 'Credit Card';
        fc.accountSelected = cq.AccountId ;
        fc.Checkout();
        fc.review();
        
        BGBK.RulesEngineState.releaseLock();
        
        fc.process();
        system.assert(fc.cart.BGBK__Process_DateTime__c!= null);
        try { fc.sendPdf(); }
        catch (EmailException e) { if (e.getMessage().contains('Single email must be enabled')) {} }
        fc.cancel();
        //fc.accountChanged();
    }
    
    @isTest
    private static void testManyPermitsPayments()
    {
        BGBK.RulesEngineState.setLock();                
        
        Contact c = new Contact(Lastname='TestUser123', Email='test@test.com');
        insert c;
        Contact cq = [select AccountId from Contact where Id=:c.Id];
        
        MUSW__Parcel__c par = new MUSW__Parcel__c(Name='xyz123abc');
        insert par;
        BGBK__Cart__c testCart = new BGBK__Cart__c(BGBK__Account__c= cq.AccountId, BGBK__Contact__c= cq.Id, BGBK__Expiration_DateTime__c=system.now().addDays(1));
        insert testCart;
        
        MUSW__Permit2__c[] perms = new MUSW__Permit2__c[]{};
        for (Integer i=0; i<9; i++)
        {
            MUSW__Permit2__c perm = new MUSW__Permit2__c(MUSW__Type__c='Building', MUSW__Parcel__c=par.id, MUSW__Applicant__c=c.Id);
            perms.add(perm);
        }
        insert perms;
        
        // add fees to cart
        MUSW__Fee__c[] fees = new MUSW__Fee__c[]{};
        for (MUSW__Permit2__c p : perms)
        {
            MUSW__Fee__c f1 = new MUSW__Fee__c(MUSW__Amount__c=20, MUSW__Permit2__c=p.Id, BGBK__Cart__c = testCart.Id);
            fees.add(f1);
        }
        insert fees;
        
        // set page 
        pageReference fp = Page.Cart;
        fp.getParameters().put('Id',  testCart.Id );
        Test.setCurrentPage(fp);
        
        dx_CartController fc = new dx_CartController(null);
        fc.initOrder();
        //system.assert(fc.cart.BGBK__Total_Amount__c== 180);
        List<SelectOption> accs = fc.accounts;
        //add another receipt for multiple payments
        fc.addReceipt();
        fc.rs[0].MUSW__Payment_Method__c = 'Cash';
        fc.rs[1].MUSW__Payment_Method__c = 'Credit Card';
        fc.rs[0].MUSW__Amount_Tendered__c = 300;
        fc.rs[1].MUSW__Amount_Tendered__c = 100;
        fc.accountSelected = cq.AccountId;
        fc.Checkout();
        fc.review();
        fc.processResult = 'process_transaction_action_successful';
        
        BGBK.RulesEngineState.releaseLock();
        
        fc.process();
        system.assert(fc.cart.BGBK__Process_DateTime__c!= null);
        MUSW__Receipt__c[] rec = [select Id, Name from MUSW__Receipt__c where BGBK__Cart__c =: testCart.Id];
        Map<Id, MUSW__Receipt__c> recMap = new Map<Id, MUSW__Receipt__c>(rec);
        BGBK__Payment__c[] paym = [select Name from BGBK__Payment__c where BGBK__Receipt__c in : recMap.keySet()];
        //system.assert(paym.size() > 0);
    }

    private static Id setupData()
    {
        BGBK.RulesEngineState.setLock();                
    
        Contact c = new Contact(Lastname='TestUser123', Email='test@test.com');
        insert c;
        Contact cq = [select AccountId from Contact where Id=:c.Id];
        
        MUSW__Parcel__c par = new MUSW__Parcel__c(Name='xyz123abc');
        insert par;
        MUSW__Permit2__c perm = new MUSW__Permit2__c(MUSW__Type__c='Building', MUSW__Parcel__c=par.id, MUSW__Applicant__c=c.Id);
        insert perm;
        BGBK__Cart__c testCart = new BGBK__Cart__c(BGBK__Account__c= cq.AccountId, BGBK__Contact__c= cq.Id, BGBK__Expiration_DateTime__c=system.now().addDays(1));
        insert testCart;
        
        // add fees to cart
        MUSW__Fee__c f1 = new MUSW__Fee__c(MUSW__Amount__c=20, MUSW__Permit2__c=perm.Id, MUSW__Fee_Paid__c=false, BGBK__Cart__c = testCart.Id);
        MUSW__Fee__c f2 = new MUSW__Fee__c(MUSW__Amount__c=120, MUSW__Permit2__c=perm.Id, MUSW__Fee_Paid__c=false, BGBK__Cart__c = testCart.Id);
        MUSW__Fee__c[] fees = new MUSW__Fee__c[]{f1,f2};
        insert fees;

        BGBK.RulesEngineState.releaseLock();
        
        return testCart.id;
    }

    @isTest
    private static void testMisc()
    {
        Test.startTest();
        Id cartId = setupData();
        
        MUSW__Fee__c[] fees = [select id from MUSW__Fee__c where BGBK__Cart__c = :cartId];
        
        // set page 
        pageReference fp = Page.Cart;
        fp.getParameters().put('Id', cartId );
        Test.setCurrentPage(fp);
        
        ApexPages.StandardSetController ssc = new ApexPages.StandardSetController(fees);
        ssc.setSelected(fees);
        dx_CartController fc = new dx_CartController(ssc);
        fc.initOrder();
        // System.debug('==============> fee size ===>'+fc.fees.size());
        System.assert(fc.pmtMethods!=null && fc.pmtMethods.size()>0);
        System.assert(fc.totalPayment == 0);
        
        fc.accountChanged();
        
        Contact c1 = new Contact(Lastname='newTestUser123', Email='test1@test1.com');
        insert c1;
        fc.cart.BGBK__Contact__c = c1.id;
        fc.contactChanged();
        fc.cancelReconcile();
        
        fc.itemsUnselected = '';
        fc.refreshTotalAndCheckout();
        Test.stopTest();
    }
    
    @isTest
    private static void testAbandon()
    {
        Test.startTest();
        Id cartId = setupData();
        
        MUSW__Fee__c[] fees = [select id from MUSW__Fee__c where BGBK__Cart__c = :cartId];
        
        // set page 
        pageReference fp = Page.Cart;
        fp.getParameters().put('Id', cartId );
        Test.setCurrentPage(fp);
        
        ApexPages.StandardSetController ssc = new ApexPages.StandardSetController(fees);
        ssc.setSelected(fees);
        dx_CartController fc = new dx_CartController(ssc);
        fc.initOrder();
        System.assert(fc.abandon()!=null);
        fc.cancel();
        Test.stopTest();
    }
    
    @isTest
    private static void testReconcile()
    {
        Test.startTest();
        
        BGBK.RulesEngineState.setLock();                
    
        Contact c = new Contact(Lastname='reconcileUser', Email='test1@test1.com');
        insert c;
        Contact cq = [select AccountId from Contact where Id=:c.Id];
        
        MUSW__Parcel__c par = new MUSW__Parcel__c(Name='reconcileParcel');
        insert par;
        MUSW__Permit2__c perm = new MUSW__Permit2__c(MUSW__Type__c='Building', MUSW__Parcel__c=par.id, MUSW__Applicant__c=c.Id);
        insert perm;
        BGBK__Cart__c testCart = new BGBK__Cart__c(BGBK__Account__c= cq.AccountId, BGBK__Contact__c= cq.Id, BGBK__Expiration_DateTime__c=system.now().addDays(1));
        insert testCart;
        
        // add fees to cart
        MUSW__Fee__c f1 = new MUSW__Fee__c(MUSW__Amount__c=20, MUSW__Permit2__c=perm.Id, MUSW__Fee_Paid__c=false, BGBK__Cart__c = testCart.Id);
        MUSW__Fee__c f2 = new MUSW__Fee__c(MUSW__Amount__c=120, MUSW__Permit2__c=perm.Id, MUSW__Fee_Paid__c=false, BGBK__Cart__c = testCart.Id);
        MUSW__Fee__c[] fees = new MUSW__Fee__c[]{f1,f2};
        insert fees;

        BGBK.RulesEngineState.releaseLock();
        
        Id cartId = setupData();
        
        MUSW__Fee__c[] fees1 = [select id from MUSW__Fee__c where BGBK__Cart__c = :cartId];
        
        // set page 
        pageReference fp = Page.Cart;
        fp.getParameters().put('Id', cartId );
        Test.setCurrentPage(fp);
        
        ApexPages.StandardSetController ssc = new ApexPages.StandardSetController(fees1);
        ssc.setSelected(fees1);
        dx_CartController fc = new dx_CartController(ssc);
        fc.initOrder();
        
        fc.cart.BGBK__Contact__c = cq.id;
        fc.contactChanged();
        fc.doReconcile();
        Test.stopTest();
    }
}