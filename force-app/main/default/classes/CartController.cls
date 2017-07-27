public with sharing class CartController
{
    public FeeVO[] feeVOs { get; set; }
    public InvoiceVO[] invoiceVOs { get; set; }
    public ReceiptVO[] receiptVOs { get; set; }
    public BGBK__Cart__c cart { get; set; }
    public MUSW__Receipt__c[] rs { get; set; } // public for CartConfirm
    public MUSW__Fee__c[] fees { get; private set; } // public for CartConfirm
    public BGBK__Bill__c[] invoices { get; private set; } // public for CartConfirm
    public Account a { get; set; }
    public Contact con { get; set; }
    public Id m_reconcileOriginalContact;
    public BGBK__Cart__c reconcileCart { get; private set;}
    public String email { get; set; }
    public String activeTab { get; set; }
    public Decimal totalSelected { get; set; }
    public String confirmMsg { get; set; }
    public String parentLabel { get; private set; }
    public Boolean isPortalUser { get; private set; }
    public string monexaSessionKey { get; set; }
    public boolean processSuccessful { get; set; }
    public String processResult { get; set; }
    public String processResultCode { get; set; }
    public string transactionId { get; set; }
    public String processStatus { get; private set; }
    public String cardMasked { get; set; }   
    public String accountSelected { get; set; }
    public Id feeSelected { get; set; }
    public Boolean canCreate { get; private set; }
    public Boolean canPayPartial { get; private set; }
    public Boolean canPayMulti { get; private set; }
    public Boolean canSelectReceipt { get; private set; }
    public String itemsUnselected { get;set;}
    public String feeIdsStr { get; set; }
    public String currURL { get; set; }
    public BGBK.Payable[] payables;
    private BGBK.CartService m_cs;
    private BGBK.PaymentService m_ps;
    private BGBK.ReceiptService m_rs;
    //private IPaymentGateway gateway;
    private Id m_pid;
    private Id m_cartId;
    private Id m_invoiceId;
    private Id m_feeId;
    private Map<Id, MUSW__Fee__c> m_selectedFees;
    private Decimal m_totalOwed;
    private BGBK__CartSettings__c m_settings;
    private String m_retURL;
    
    public CartController(ApexPages.StandardSetController c)
    {
        processSuccessful = false;
        activeTab = 'fees';
        totalSelected = 0;
        m_totalOwed = 0;
        isPortalUser = BGCM.UtilityUser.isPortalUser();
        currURL = String.valueOf(URL.getSalesforceBaseUrl().toExternalForm());
        
        m_pid = System.currentPageReference().getParameters().get('id');
        m_cartId = System.currentPageReference().getParameters().get('cartId');
        m_invoiceId = System.currentPageReference().getParameters().get('invoiceId');
        m_feeId = System.currentPageReference().getParameters().get('feeId');
        m_retURL = System.currentPageReference().getParameters().get('retURL');
        if (m_pid != null) m_pid = String.escapeSingleQuotes(m_pid);
        if (m_cartId != null) m_cartId = String.escapeSingleQuotes(m_cartId);
        if (m_invoiceId != null) m_invoiceId = String.escapeSingleQuotes(m_invoiceId);
        
        // instantiate service layer
        if (m_invoiceId != null)
        {
            BGBK__Bill__c inv = [select BGBK__Recipient2__c from BGBK__Bill__c where Id = :m_invoiceId];
            m_cs = new BGBK.CartService(inv.BGBK__Recipient2__c);
            
        }
        else
        {
            m_cs = (m_pid != null || m_cartId != null) ? new BGBK.CartService(m_pid, m_cartId) : new BGBK.CartService();
        }
        m_ps = new BGBK.PaymentService();
        m_rs = new BGBK.ReceiptService();
        
        canCreate = m_ps.canCreate();
        feeVOs = new FeeVO[]{};
        invoiceVOs = new InvoiceVO[]{};
        receiptVOs = new ReceiptVO[]{};
        // manual Add to Cart (add fees on parent to m_selectedFees list)
        if (m_pid != null)
        {
            m_selectedFees = new Map<Id, MUSW__Fee__c>((List<MUSW__Fee__c>)c.getSelected());
        }
        else if(m_feeId!=null)    // ELGIN-232
        {
            m_selectedFees = new Map<Id,MUSW__Fee__c>();
            m_selectedFees.put(m_feeId,new MUSW__Fee__c(Id=m_feeId));
        }
        
        // control parameters for internal users based on cart settings
        m_settings = BGBK__CartSettings__c.getValues('Default');
        if (m_settings != null)
        {
            canPayPartial = Boolean.valueOf(m_settings.BGBK__Allow_Partial_Payments__c) && !isPortalUser;
            canPayMulti = Boolean.valueOf(m_settings.BGBK__Allow_Multiple_Payment_Methods__c) && !isPortalUser;
            canSelectReceipt = Boolean.valueOf(m_settings.BGBK__Allow_Existing_Receipt__c) && !isPortalUser;
        }
        else
        {
            throw new BGCM.BGException('Default Cart Settings are missing.', true);
        }
    }
    
    public void initOrder()
    {
        ApexPages.currentPage().getHeaders().put('X-UA-Compatible', 'IE=10');
        // don't run if coming from Monexa
        if (m_pid == null && m_cartId == null && m_invoiceId == null && m_feeId==null && !UserInfo.getUserType().contains('CustomerSuccess') && UserInfo.getUserType() != 'CspLitePortal') return;
               
        con = m_cs.getActiveContact();
                    
        a = m_cs.getActiveAccount();
         cart = m_cs.getActiveCart();
        /* commented for a testing in elgin
        if(isPortalUser) cart = m_cs.getActiveCart();
        else    
        {
            cart = m_cs.getCart();
            if (cart.BGBK__Expiration_DateTime__c < System.now() || cart.BGBK__Status__c == 'Closed')
            {
                if (m_cartId != null)
                {
                    throw new BGCM.BGException('Cart is either closed or expired.', true);
                }
                else cart = m_cs.getActiveCart();
            }
        }
        */
        if (m_selectedFees != null) m_cs.addFeesToCart(m_selectedFees.values());
        if (m_invoiceId != null) m_cs.addInvoicesToCart(new BGBK__Bill__c[]{new BGBK__Bill__c(Id=m_invoiceId)});
        fees = m_cs.getCartFees(true);
        invoices = m_cs.getCartInvoices(true);
        accountSelected = a.Id;
        if (con != null) email = con.Email;
        
        // remove invoiced fees from cart
        Set<Id> feesToRemove = new Set<Id>();
        Map<Id, BGBK__Bill__c> invoicesToAdd = new Map<Id, BGBK__Bill__c>();
        String invoicedFees = '';
        for (MUSW__Fee__c f : fees)
        {
            if (f.BGBK__Invoice__c != null)
            {
                feesToRemove.add(f.Id);
                invoicedFees += (invoicedFees=='')? f.MUSW__Type__c + ' (' + f.Name + ')': ', ' + f.MUSW__Type__c + ' (' + f.Name + ')';
                if (!invoicesToAdd.containsKey(f.BGBK__Invoice__c))
                {
                    invoicesToAdd.put(f.BGBK__Invoice__c, new BGBK__Bill__c(Id=f.BGBK__Invoice__c));
                }
            }
        }
        
        if (invoicesToAdd.size() > 0)
        {
            m_cs.addInvoicesToCart(invoicesToAdd.values());
            m_cs.removeFeesFromCart(feesToRemove);
            
            fees = m_cs.getCartFees(true); // re-query for fees
            invoices = m_cs.getCartInvoices(true); // re-query for invoices
            ApexPages.Message myMsg = new ApexPages.Message(ApexPages.Severity.INFO, 'The following fee(s) are already invoiced:'+invoicedFees + '. The corresponding invoices have been added to your cart');
            ApexPages.addMessage(myMsg);
        }
        
        // add fees into VO objects
        
        for (MUSW__Fee__c f : fees)
        {
            Boolean selected = m_selectedFees == null || m_selectedFees.containsKey(f.Id);
            feeVOs.add(new FeeVO(f, selected));
            m_totalOwed += f.MUSW__Outstanding_Fee__c;
            
            if (selected)
            {
                totalSelected += f.MUSW__Outstanding_Fee__c;
            }
        }
        
        // add invoices into VO objects
        
        for (BGBK__Bill__c i : invoices)
        {
            invoiceVOs.add(new InvoiceVO(i));
            m_totalOwed += i.BGBK__Total_Fees__c;
            totalSelected += i.BGBK__Total_Fees__c;
        }
        
        // initialize receipt
        rs = new MUSW__Receipt__c[]{};
        
        addReceipt();
        if (!isPortalUser)
        {
            receiptVOs[0].pmtMethodSelected = 'Check';
        }
        else
        {
            receiptVOs[0].pmtMethodSelected = 'Credit Card';
        }
        
        // update cart amount
        cart.BGBK__Total_Amount__c = m_totalOwed;
        update cart;
          
        // set Process Date
        cart.BGBK__Process_DateTime__c = System.now();
        // set the payables that might be needed for portal users
        preparePayables();
    }
    
    /**
     * ELGIN-264: show total payment
     */    
    public Decimal totalPayment
    {
        get
        {
            Decimal total = 0;
            for (ReceiptVO rvo : receiptVOs)
            {
                  if(rvo.amount!=null)
                    total += rvo.amount;
            }
            return total;
        }
    }
    
    public Selectoption[] pmtMethods
    {
        get
        {
            pmtMethods = new Selectoption[]{};
            for (Schema.PicklistEntry pe : MUSW__Receipt__c.MUSW__Payment_Method__c.getDescribe().getPicklistValues())
            {
                if (pe.isActive())  {
                    if (pe.getValue().equals('Cash') || pe.getValue().equals('Check') ) {
                        if(!isPortalUser) pmtMethods.add(new Selectoption(pe.getValue(), pe.getLabel()));
                    }
                    else if(isPortalUser) pmtMethods.add(new Selectoption(pe.getValue(), pe.getLabel()));
                }
            }
            
            //comment out the old existing receipt part
            /*if (con != null && canSelectReceipt)
            {
                MUSW__Receipt__c[] exs = m_rs.getAvailableReceiptsFor(con.Id);
                if (exs.size() > 0)
                {
                    for (MUSW__Receipt__c r : exs)
                    {
                        pmtMethods.add(new Selectoption(r.Id, 'Existing: ' + r.Name + ': $' + r.MUSW__Amount_Available__c));
                    }
                }
            }*/
            
            //Add 'Exisiting Receipt' payment method
            if(!isPortalUser && canSelectReceipt)
            {
                pmtMethods.add(new Selectoption('Other', 'Existing Receipt'));
            }
            
            return pmtMethods;
        }
        set;
    }
    
    private Account[] m_accs = new Account[]{};
    public List<SelectOption> accounts
    {
        get
        {
            if (accounts == null)
            {
                accounts = new List<SelectOption>();
                m_accs = m_cs.getAccountList();
                for (Account acc : m_accs)
                {            
                    //throw new BGCM.BGException('Account : '+acc, true);
                    String addr = (acc.BillingStreet!= null) ? ' / ' + acc.BillingStreet: '';
                    accounts.add(new SelectOption(String.valueOf(acc.Id), acc.Name + addr));
                }    
            }
            
            return accounts;
        }
        set;
    }
    
    /*public void removeFee()
    {
         m_cs.removeFeeFromCart(feeSelected);
    }*/
    
    public void accountChanged()
    {
        for (Account acc : m_accs)
        {                
            if (acc.Id == accountSelected)
            {   
                a = acc;
                break;
            }
        }
    }
    
    public void checkout()
    {       
        if (String.isBlank(accountSelected))
        {
            ApexPages.Message myMsg = new ApexPages.Message(ApexPages.Severity.ERROR, 'Please select an Account first.');
            ApexPages.addMessage(myMsg);
            return;
        }
        
        if (totalSelected <= 0)
        {
            ApexPages.Message myMsg = new ApexPages.Message(ApexPages.Severity.ERROR, 'Cannot Checkout when Total Selected is zero or less. Select Fees to pay.');
            ApexPages.addMessage(myMsg);
            return;
        }
        
        activeTab = 'checkout';
        
        /*// we need to let user switch between Select Fee tab and Pay Fees tab, we need to requery fees
        fees = m_cs.getCartFees(true);*/
        
        // remove unselected fees (needed for CartConfirm)
        for (Integer i=0; i<fees.size(); i++)
        {
            for (FeeVO feeVo : feeVOs)
            {
               if (fees[i].Id == feeVo.f.Id && !feeVo.isSelected )
               {
                   fees.remove(i);
               }
            }
        }
        
        // remove unselected invoices (needed for CartConfirm)
        for (Integer i=0; i<invoices.size(); i++)
        {
            for (InvoiceVO invVo : invoiceVOs)
            {
               if (invoices[i].Id == invVo.i.Id && !invVo.isSelected )
               {
                   invoices.remove(i);
               }
            }
        }
        
        if(receiptVOs[0].amount == null)
        {
            // by default use one Receipt
            //rs[0].MUSW__Amount_Tendered__c = totalSelected;
            receiptVOs[0].amount = totalSelected;
        }    
    }
    
    public void review()
    {       
        if (String.isBlank(accountSelected))
        {
            ApexPages.Message myMsg = new ApexPages.Message(ApexPages.Severity.ERROR, 'Please select an Account first.');
            ApexPages.addMessage(myMsg);
            return;
        }
        activeTab = 'review';
         
        ApexPages.Message myMsg = new ApexPages.Message(ApexPages.Severity.ERROR, 'No payment gateway is integrated with the system for credit card payment. Please select other payment methods and proceed.');
        ApexPages.addMessage(myMsg);
        return;
       
       
        
        /* MONEXA
        for (MUSW__Receipt__c r : rs)
        {
            if (r.MUSW__Payment_Method__c == 'Credit Card' && !Test.isRunningTest())
            {
                gateway = new PaymentGateway();
                Boolean validLogin = gateway.authenticate(a.Id);
                if (!validLogin)
                {
                    ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.ERROR, 'Invalid login credentials for the Payment Gateway.'));
                }
                monexaSessionKey = gateway.getSessionKey(r.MUSW__Amount_Tendered__c);
            }
        }*/
    }
    
    public void addReceipt()
    {
        // default to Check eventho it's already defaulted on the field
        // VF page doesn't see the default field value
        Id conId = (con != null) ? con.Id : null;
        MUSW__Receipt__c r = new MUSW__Receipt__c(MUSW__Payment_Method__c='Check', MUSW__Paid_By__c=a.Id, MUSW__Receipt_Paid_by__c=conId, BGBK__Cart__c=cart.Id);
        rs.add(r);
        ReceiptVO newReceiptVO = new ReceiptVO(r, r.MUSW__Amount_Tendered__c, m_rs);
        newReceiptVO.pmtMethodSelected='Check';
        receiptVOs.add(newReceiptVO );
    }
    
     public void preparePayables(){
    
        payables = new BGBK.Payable[]{};
        
        for (FeeVO fvo : feeVos) if (fvo.isSelected) payables.add(new BGBK.Payable(fvo.f, fvo.paymentAmount));
        for (InvoiceVO ivo : invoiceVos) if (ivo.isSelected) payables.add(new BGBK.Payable(ivo.i));
        //ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.ERROR, 'Payables: '+payables));
    }
    
    public void process()
    {
        if (totalBalance > 0 && !canPayPartial)
        {
            ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.ERROR, 'Insufficient funds. Tender at least the Amount owing.'));
            return;
        }
        if (String.isBlank(accountSelected))
        {
            ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.ERROR, 'Please select an Account first.'));
            return;
        }
        
        // ELGIN-251: validation disallow underpay 
        Decimal tatalReceipt = 0;
        for (ReceiptVO rvo : receiptVOs)
        {
              if(rvo.amount!=null)
                tatalReceipt += rvo.amount;
              // DPS-70: validation for 'Other' payment method
              if(rvo.pmtMethodSelected == 'Other')
              {
                  if(rvo.existingPmt.BGBK__Receipt__c == null)
                  {
                      ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.ERROR, 'Please select a Receipt for your payment.'));
                      return;
                  }
                  
                  //set the receipt and payment method of "Other" payment method here
                  rvo.r = m_rs.getReceipt(rvo.existingPmt.BGBK__Receipt__c);
                  //rvo.r.MUSW__Payment_Method__c = rvo.pmtMethodSelected;
                  
                  if(rvo.r.MUSW__Amount_Available__c < rvo.amount)
                  {
                      ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.ERROR, 'The Receipt '+rvo.r.Name+' doesn\'t have enough money for allocation. Select another Payment Method.'));
                      return;
                  }
                  
              }
        }
        
        /*
        if(totalSelected > tatalReceipt)
        {
            ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.ERROR, 'You cannot underpay your cart. Please enter amounts equal to your selection and try again.'));
            return;
        }
        */
        activeTab = 'confirm';
        
        // apply waives
        update fees;
        
        // reset receipt list based on VO list
        rs.clear();
        Map<MUSW__Receipt__c, Decimal> rsAmt = new Map<MUSW__Receipt__c, Decimal>();
        for (ReceiptVO rvo : receiptVOs)
        {
            MUSW__Receipt__c receipt = rvo.r;
            // update only new receipts, leave exisiting receipts
            if(receipt.Id == null){
              if(receipt.MUSW__Amount_Tendered__c == null || receipt.MUSW__Amount_Tendered__c == 0){
                  receipt.MUSW__Amount_Tendered__c =   rvo.amount;
              }
              else{
                  receipt.MUSW__Amount_Tendered__c =  (receipt.MUSW__Amount_Tendered__c-(rvo.amount!=null?rvo.amount:0));           
              }
            }                       
            receipt.BGBK__Cart__c = cart.Id;
            rsAmt.put(receipt, rvo.amount);
            rs.add(receipt);
        }
        
        preparePayables();
        
        try
        {
            system.debug('**** RS: ' + rs);
            processSuccessful = m_ps.processPayment(payables, rsAmt, accountSelected, cart.BGBK__Process_DateTime__c);
            
            // ELGIN-237: re-query receipt in order to get the receipt numbers
            rs = m_cs.getCartReceipts();
            
            // Decimal pmtAmt = totalSelected; // - totalBalance;
            m_cs.closeCart(totalPayment, accountSelected, cart.BGBK__Contact__c, cart.BGBK__Process_DateTime__c);
        }
        catch (Exception e)
        {
            ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.ERROR, e.getMessage()));
            return;
        }
    }
    
    public void sendPdf()
    {
        if (!processSuccessful) return;
        
        Id[] feeIds = new List<Id>((new Map<Id, MUSW__Fee__c>(fees)).keySet());
        if (con == null) con = new Contact(Id=cart.BGBK__Contact__c,AccountId = a.Id,LastName = a.Name);
        con.Email = email;
        m_cs.sendConfirmEmail(feeIds, con, BGBK.CartService.AttachmentFormat.PDF, 'Cart Payment Receipt', null);
    }
    
    public pageReference abandon()
    {
        m_cs.abandonCart();
        pageReference  pr = (m_retURL!=null) ? new pageReference(m_retURL) : new pageReference('/apex/BGBK__CartSearch');
        pr.setredirect(true);
        return pr;
    }
    
    public pageReference cancel()
    {
        return getPageReference();
    }
    
    public Decimal totalBalance
    {
        get
        {
            Decimal totalr = 0;
            for (ReceiptVO rvo : receiptVOs)
            {
                Decimal ramt = (rvo.amount != null) ? rvo.amount : 0;
                totalr += ramt;
            }
            totalBalance = m_totalOwed - totalr;
            return totalBalance;
        }
        set;
    }
    
    /*
     *  Get the unselected item ids from page and refresh the total
     */
    public void refreshTotal()
    {
        for (FeeVo feeVo : feeVOs)
        {
            feeVo.isSelected = !itemsUnselected.contains(feeVo.f.Id);
        }
        
        for (InvoiceVo invVo : invoiceVOs)
        {
            invVo.isSelected = !itemsUnselected.contains(invVo.i.Id);
        }
        
        // reset itemsUnselected
        itemsUnselected = '';
        updateTotal();
    }
    
    /*
     *  Update fee total based on user input and check out
     */
    public void refreshTotalAndCheckout()
    {
        refreshTotal();
        Checkout();
    }
    
    /**
     * user changed contact
     */
    public void contactChanged()
    {
        reconcileCart = cart.BGBK__Contact__c!=null ? findActiveCartByContact(cart.BGBK__Contact__c) : null;
        
        if(reconcileCart == null)    // did not find active cart 
        {
            m_reconcileOriginalContact = cart.BGBK__Contact__c;
        }
    }
    
    
    /**
     * do reconcile, abandon current cart and navigate user to new reconciled cart
     */
    public PageReference doReconcile()
    {
       // System.debug('===============>doReconcile');
       MUSW__Fee__c[] updateFees = new List<MUSW__Fee__c>();
       for(FeeVO fvo : feeVOs)
       {
           MUSW__Fee__c fee = fvo.f;
           fee.BGBK__Cart__c = reconcileCart.id;
           updateFees.add(fee);
       }

       BGBK__Bill__c[] updateInvoices = new List<BGBK__Bill__c>();
       for(InvoiceVO ivo : invoiceVOs)
       {
           BGBK__Bill__c invoice = ivo.i;
           invoice.BGBK__Cart__c = reconcileCart.id;
           updateInvoices.add(invoice);
       }  
       
       update updateFees;
       update updateInvoices;
       
       // abandon current cart
       m_cs.abandonCart();
       
       // navigate to new cart
       pageReference  pr = new pageReference('/apex/Cart?cartId='+reconcileCart.id);
       pr.setredirect(true);
        
       return pr;
    }
    
    /**
     * cancel reconcile cart, restore previoius contact
     */
    public PageReference cancelReconcile()
    {
        reconcileCart = null;
        cart.BGBK__Contact__c = m_reconcileOriginalContact;
        return null;
    }
    
    
    private BGBK__Cart__c findActiveCartByContact(Id contactId)
    {
        BGBK__Cart__c[] cs = [select Id from BGBK__Cart__c where BGBK__Contact__r.id = :contactId and BGBK__Status__c = 'Open' and BGBK__Expiration_DateTime__c >= TODAY and id!=:m_cartId limit 1];
        return (cs!=null && cs.size()>0) ? cs[0] : null;
    }
        
    private void updateTotal()
    {
        totalSelected = 0;
        for (FeeVO feeVo : feeVOs)
        {
            if (feeVo.isSelected)
            {
                // DPS-265 override ELGIN-246
                // ELGIN-246
                // MUSW__Outstanding_Fee__c = If(MUSW__Amount__c - MUSW__Amount_Waived__c - MUSW__Amount_Paid__c - MUSW__Amended_Amount__c < 0, 0, MUSW__Amount__c - MUSW__Amount_Waived__c - MUSW__Amount_Paid__c - MUSW__Amended_Amount__c)
                /*
                if (feeVo.f.MUSW__Amount_Paid__c == null) feeVo.f.MUSW__Amount_Paid__c = 0;
                if (feeVo.f.MUSW__Amount_Waived__c == null) feeVo.f.MUSW__Amount_Waived__c = 0;
                if (feeVo.f.MUSW__Amount__c == null) feeVo.f.MUSW__Amount__c = 0;
                if (feeVo.f.MUSW__Amended_Amount__c == null) feeVo.f.MUSW__Amended_Amount__c = 0;
                Decimal outStandingFee = feeVo.f.MUSW__Amount__c - feeVo.f.MUSW__Amount_Waived__c - feeVo.f.MUSW__Amount_Paid__c - feeVo.f.MUSW__Amended_Amount__c; // can't use Outstanding Fee since it's a formula
                if(outStandingFee > 0)
                    totalSelected += outStandingFee ;                
                */
                Decimal paymentAmount = feeVo.paymentAmount;
                if(paymentAmount !=null){
                    totalSelected += paymentAmount ;
                }
            }
        }
        
        for (InvoiceVo invVo : invoiceVOs)
        {
            if (invVo.isSelected)
            {
                totalSelected += invVo.i.BGBK__Balance_Due__c; 
            }
        }
    }
    
    private pageReference getPageReference()
    {
        pageReference pr;
        if (m_retURL != null)
        {
            pr = new pageReference(m_retURL);
        }
        else if (m_pid != null)
        {
            pr = new pageReference('/'+ m_pid);
        }
        else
        {
             pr = new pageReference('/apex/BGBK__CartSearch');
        }
        pr.setredirect(true);
        return pr;
    }
    
    private class FeeVO
    {
        public MUSW__Fee__c f { get; set; }
        public Boolean isSelected { get; set; }
        public Decimal paymentAmount { get; set; }
        public FeeVO(MUSW__Fee__c fee, Boolean sel)
        {
            f = fee;
            isSelected = sel;
            paymentAmount = f.MUSW__Outstanding_Fee__c;
        }
    }
    
    private class InvoiceVO
    {
        public BGBK__Bill__c i { get; set; }
        public Boolean isSelected { get; set; }
        public InvoiceVO(BGBK__Bill__c inv)
        {
            i = inv;
            isSelected = true;
        }
    }
    
    private class ReceiptVO
    {
        public MUSW__Receipt__c r { get; set; }
        public Decimal amount { get; set; }
        public BGBK__Payment__c existingPmt { get; set; }
        private BGBK.ReceiptService m_rs;
        private MUSW__Receipt__c m_backR; // backup receipt (used when r is overriden by existing receipt and we want the original receipt back)
        
        public ReceiptVO(MUSW__Receipt__c rec, Decimal amt, BGBK.ReceiptService rsvc)
        {
            r = rec;
            amount = amt;
            r.MUSW__Amount_Tendered__c = (r.MUSW__Amount_Tendered__c == null ? amount: (r.MUSW__Amount_Tendered__c-amount));            
            existingPmt = new BGBK__Payment__c();
            m_backR = rec;
            m_rs = rsvc;
        }
        
        /*  can also be an ex receipt id  */
        public String pmtMethodSelected
        {
            get;
            set
            {
                pmtMethodSelected = value;
                if (pmtMethodSelected.startsWith('a0c'))
                {
                    r = m_rs.getReceipt((Id)pmtMethodSelected);
                }
                else
                {
                    r = m_backR;
                    r.MUSW__Payment_Method__c = pmtMethodSelected;
                }
            }
        }
    }

}