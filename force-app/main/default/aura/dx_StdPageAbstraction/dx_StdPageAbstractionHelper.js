({
   
   // Do nothing in here that expects the page to be rendered.  Move that to the rendering classes.   		
   	init: function(component){
   		try {
   			this.CheckRecordId(component);
   			// go get our page configuration.
   	    	var action = component.get("c.getNavigationModel"); 
   	    	var recordId = component.get("v.recordId");

   	    	// TODO  *** DEVELOPMENT *** CODE *** Needs to be removed before go-live.
   	    	if ($A.util.isUndefined(recordId))
				if (!$A.util.isUndefined(component.get("v.DevRecordId"))) {
	   	    		recordId = component.get("v.DevRecordId");
	    			component.set("v.recordId",recordId);
	    			component.set("v.DevMode",true);
   	    			alert('*** WARNING **** You are viewing a development Record.  *** WARNING ***');
   	    		}
   	    	// TODO End


   	    	action.setParams({"objectId": recordId});
	        action.setCallback(this, 
	            function(response) { 
	            	try {
						var state = response.getState();
						if (state === 'SUCCESS') {
							if (! $A.util.isUndefined(response.getReturnValue().navigationModel)) component.set("v.Navigation", response.getReturnValue().navigationModel);
							if (! $A.util.isUndefined(response.getReturnValue().licenseType)) component.set("v.ActiveLicenseType", response.getReturnValue().licenseType);
							if (! $A.util.isUndefined(response.getReturnValue().isApplication)) component.set("v.RecordIdIsApplication",response.getReturnValue().isApplication);
							if (! $A.util.isUndefined(response.getReturnValue().recordType)) component.set("v.AppRecordType",response.getReturnValue().recordType);
							if (! $A.util.isUndefined(response.getReturnValue().recordType)) component.set("v.SitePrefix",response.getReturnValue().sitePrefix);

							
	      					if (this.buildCurrentComponent(component,component.get("v.ActiveCmp"))) return;
						}
						else {		// error or incomplete comes here
							component.set("v.errorMessage","");
			                var errors = response.getError();
			                if (errors) {
			                	for (var erri = 0; erri < errors.length; erri++) {
				                	component.set("v.errorMessage", errors[erri].stack + " : " + component.get("v.errorMessage"));
				                	component.set("v.showError",true);      
			            		}
			            	}
			            	// If we fail here, we shouldn't really proceed on, since we don't have values
			            	return;
			            }
			        }catch (e) {alert(e.stack);}
					//  At this point, the parent is initialized (or not as the case may be).
					// Let's call the inner component's init routine
		            var activecmp = component.find(component.get("v.ActiveCmp")); 

		            if ($A.util.isUndefined(activecmp)) {
		            	var concComponent = component.getConcreteComponent();
		            	activecmp = concComponent.find(component.get("v.ActiveCmp"));
		            }
		            if ($A.util.isUndefined(activecmp)) {
		                //All else fails
		                try {
		            	activecmp = component.find('stdPageAbs').get("v.body")[0].get("v.value")[0].get("v.body")[0].get("v.value")[0];
		                } catch(e){}
		            }

		            // if we end up with multiple components to process, then handle it
		            try {
		            if ($A.util.isArray(activecmp)) {
		                component.set("v.ActiveCmpCount",activecmp.length);
		                for (var i = 0; i < activecmp.length; i++ ) {
		                    activecmp[i].PerformInit(component, event);
		                }
		            }
		            else { 
		                component.set("v.ActiveCmpCount",1);
		                activecmp.PerformInit(component, event);

		            }
		        } catch(e){ console.log('no Init routine'); }
	            }
	        	);
	        $A.enqueueAction(action);    	
   		}
	    catch(e) {alert(e.stack);}
    },

    // Here we display the buttons and such for the active component
    // this routine returns true when an error occurs.
	buildCurrentComponent: function(component, activeNavigationCmp) {
		try {
	    	//	Process is to hide the components and then display the one we want to show
			var NavRecs = component.get("v.Navigation");
			if ($A.util.isUndefined(component.get( "v.Navigation" ))) {
				this.spinnerOff(component);
				return true;
			}
			// search for the next component's entry
			for (var i = 0; i < NavRecs.length && NavRecs[i].MasterLabel.toLowerCase() != activeNavigationCmp.toLowerCase(); i++) ;
			if (i >= NavRecs.length) {
				alert('Build Current Component : unable to find next component (' + activeNavigationCmp + ') entry in navigation model');
		    	this.spinnerOff(component);				
				return true;
			}

			component.set("v.ShowNext", NavRecs[i].ShowNextButton__c);
			component.set("v.ShowExitNoSave", NavRecs[i].ShowExitNoSaveButton__c);
			component.set("v.ShowSaveAdd", NavRecs[i].ShowSaveAddButton__c);
			component.set("v.ShowSkip", NavRecs[i].ShowSkipButton__c);
			component.set("v.ShowSaveExit", NavRecs[i].ShowSaveExitButton__c);
			component.set("v.SaveAddLabel", NavRecs[i].SaveAddLabel__c);
			component.set("v.SkipLabel", NavRecs[i].SkipLabel__c);
		    this.spinnerOff(component);	
		    return false;		
		}
		catch(e) {
			alert(e.stack); 
		    this.spinnerOff(component);
		    return true;
		}
    },

      //  This is the common routine that is called when we need to perform next navigation.
    commonNextprocess: function(component, event, nextAction) {
    	try {
    		var naParms = '';
    		if (!$A.util.isEmpty(nextAction) && nextAction.search(/\s/) > 0) {
    			naParms = nextAction.substr(nextAction.search(/\s/)+1);
    			nextAction = nextAction.substr(0,nextAction.search(/\s/));
    		}
	    	if (nextAction) {
	    		switch(nextAction) {
	    			case "RefreshView" : 
			    		this.spinnerOff(component);
			       		$A.get("e.force:refreshView").fire();
						break;
		    		case "Exit" : 
			    		this.spinnerOff(component);		    		
				     	var action = $A.get("e.force:navigateToURL");
			        	action.setParams({"url": "/"});
			    		action.fire();    
			    		break;
	    			case "Next" : 
	    				this.nextPage(component, naParms);
	    				break;
	    			case "Prev" : 
			    		this.prevPage(component, naParms);
			    		break;
	    			case "Detail" : 
			    		this.detailPage(component, naParms);
			    		break;
			    	case "Fail" : 
			    		this.spinnerOff(component);
			    		break;
			    	case "Direct" : 
			    		this.spinnerOff(component);
			    		var daction = $A.get("e.force:navigateToURL");
			    		var pagename = event.getParam("Other");
			    		if ($A.util.isUndefined(pagename)) alert(" common next process - unable to access pagename for direct command");
			    		daction.setParams({"url": "/" + pagename.toLowerCase() + "?recordId="  + component.get("v.recordId")});
			    		daction.fire();   
			    		break;
			    	default : 
			    		this.spinnerOff(component);
			    		alert(" common next process invoked for unsupported parm " + nextAction);
			    	}
				}
				else {
					alert(" common next process invoked for null parameter");
					this.spinnerOff(component);
				}
		}
		catch(e) {
			alert(e.stack); 
			this.spinnerOff(component);
		}
	},

	//  This version reads the configuration and turns that into a URL for navigation
	//  The asumes the ActiveCmp variable and the URL in communities align.
     nextPage: function(component, naParms) {
    	try {
  			// because communities use dashes and SF API names use underscores, we'll do a little conversion to convert the API names to page names
			var nextcmp = this.returnNextValidPage(component);
			if (!$A.util.isEmpty(nextcmp)) 
				nextcmp = nextcmp.replace(/_/g, "-").toLowerCase();
			else 
				nextcmp = '';

			// CHECK for Special LOGOUT phrase.      (btw - nextcmp was just converted to lowercase)
			if (nextcmp == "#logout#" && ! $A.util.isEmpty(component.get("v.SitePrefix"))) {
				var pfx = component.get("v.SitePrefix");
				var urlString = pfx + "/secur/logout.jsp?retUrl=" + encodeURIComponent(pfx + "/CommunitiesLanding");
				window.location.assign(urlString);
				//window.location.href=urlString;
		        return;
			}

			var action = $A.get("e.force:navigateToURL");
			action.setParams({"url": "/" + nextcmp + "?recordId="  + component.get("v.recordId") + naParms});
			action.fire();    

			}
		catch(e) {
			alert(e.stack);
			this.spinnerOff(component);
   		}
    },


	//  This version reads the configuration and turns that into a URL for navigation
	//  The asumes the ActiveCmp variable and the URL in communities align.
     prevPage: function(component, naParms) {
    	try {
  			// because communities use dashes and SF API names use underscores, we'll do a little conversion to convert the API names to page names
			var nextcmp = this.returnPrevValidPage(component);
			if (!$A.util.isEmpty(nextcmp)) nextcmp = nextcmp.replace(/_/g, "-").toLowerCase();

			var action = $A.get("e.force:navigateToURL");
			action.setParams({"url": "/" + nextcmp + "?recordId="  + component.get("v.recordId") + naParms});
			action.fire();    

			}
		catch(e) {
			alert(e.stack);
			this.spinnerOff(component);
   		}
    },

//  This version reads the configuration and turns that into a URL for navigation
	//  The asumes the ActiveCmp variable and the URL in communities align.
     detailPage: function(component, naParms) {
    	try {
  			// because communities use dashes and SF API names use underscores, we'll do a little conversion to convert the API names to page names
			var nextcmp = this.returnDetailPage(component);
			if (!$A.util.isEmpty(nextcmp)) nextcmp = nextcmp.replace(/_/g, "-").toLowerCase();

			var action = $A.get("e.force:navigateToURL");
			action.setParams({"url": "/" + nextcmp + "?recordId="  + component.get("v.recordId") + naParms});
			action.fire();    

			}
		catch(e) {
			alert(e.stack);
			this.spinnerOff(component);
   		}
    },
 
	// Based upon the component name specified, application record type, and license type 
	// Find the next valid page in the navigation model.
	returnNextValidPage: function(component) {

   		var NavRecs = component.get("v.Navigation");
		var componentName = component.get("v.ActiveCmp");
		var activeLT = component.get("v.ActiveLicenseType");

		console.log('ActiveLT - ' + activeLT + ', active component - ' + componentName + ', NavRecs - ' + NavRecs);
		if ($A.util.isEmpty(NavRecs) ||  $A.util.isEmpty(activeLT) || $A.util.isEmpty(componentName)) {
			console.log('We do not have the fields necessary to calculate the returnNextValidPage value');
		}
		// Find the current page record for the current license and application type
		for (var i = 0; i < NavRecs.length; i++) {
			if (NavRecs[i].MasterLabel.toLowerCase() != componentName.toLowerCase()) continue;

			// If this record doesn't work for this license type, then skip it 
			var validLTList = NavRecs[i].ValidLicenseTypeList__c;
			if (!$A.util.isEmpty(validLTList) && !this.isMemberOf(validLTList, activeLT)) continue;

			// we have a match on the name.  If no record type, then we're good. This could be a license record.
			if ($A.util.isEmpty(component.get("v.AppRecordType"))) break;

			// if this entry aligns with the recordtype, then break and use this entry.
			var rt = component.get("v.AppRecordType");
			if ($A.util.isEmpty(NavRecs[i].Valid_for_App_Record_Types__c) || this.isMemberOf(NavRecs[i].Valid_for_App_Record_Types__c,rt)) break;
		}

		if (i >= NavRecs.length) {
			console.log('returnNextValidPage - unable to find current component (' + componentName + ') in navigation model with LT and Recordtype of ' + component.get("v.ActiveLicenseType") + ' & ' + component.get("v.AppRecordType"));
			return null;
		}
		
		return  NavRecs[i].NextCmp__c;
	},

	// Based upon the page/component name specified.  If you can get to the list, then you can get to the detail, so the check is quicker.
	
	returnDetailPage: function(component) {

   		var NavRecs = component.get("v.Navigation");
		var componentName = component.get("v.ActiveCmp");
		var activeLT = component.get("v.ActiveLicenseType");

		console.log('ActiveLT - ' + activeLT + ', active component - ' + componentName + ', NavRecs - ' + NavRecs);
		if ($A.util.isEmpty(NavRecs) ||  $A.util.isEmpty(activeLT) || $A.util.isEmpty(componentName)) {
			console.log('We do not have the fields necessary to calculate the detail page value');
		}
		// Find the current page record for the current license and application type
		for (var i = 0; i < NavRecs.length; i++) {
			if (NavRecs[i].MasterLabel.toLowerCase() != componentName.toLowerCase()) continue;

			// If this record works for this license type (or no list exists) then exit the loop.
			var validLTList = NavRecs[i].ValidLicenseTypeList__c;
			if ($A.util.isEmpty(validLTList) ||  this.isMemberOf(validLTList, activeLT)) break;
		}

		// if we hit the end of the loop, we didn't find a match - so just sit here!
		if (i >= NavRecs.length) {
			console.log('returnDetailPage - unable to find current component (' + componentName + ') in navigation model with LT and Recordtype of ' + component.get("v.ActiveLicenseType") + ' & ' + component.get("v.AppRecordType"));
			return null;
		}
		
		return  NavRecs[i].DetailCmp__c;
	},

	// Based upon the component name specified, application record type, and license type 
	// Find the next valid page in the navigation model.
	returnPrevValidPage: function(component) {

   		var NavRecs = component.get("v.Navigation");
		var componentName = component.get("v.ActiveCmp");
		var activeLT = component.get("v.ActiveLicenseType");

		console.log('ActiveLT - ' + activeLT + ', active component - ' + componentName + ', NavRecs - ' + NavRecs);
		if ($A.util.isEmpty(NavRecs) ||  $A.util.isEmpty(activeLT) || $A.util.isEmpty(componentName)) {
			console.log('We do not have the fields necessary to calculate the returnPrevValidPage value');
		}
		// Find the current page record for the current license and application type
		for (var i = 0; i < NavRecs.length; i++) {
			if (NavRecs[i].MasterLabel.toLowerCase() != componentName.toLowerCase()) continue;

			// If this record doesn't work for this license type, then skip it 
			var validLTList = NavRecs[i].ValidLicenseTypeList__c;
			if (!$A.util.isEmpty(validLTList) && !this.isMemberOf(validLTList, activeLT)) continue;

			// we have a match on the name.  If no record type, then we're good. This could be a license record.
			if ($A.util.isEmpty(component.get("v.AppRecordType"))) break;

			// if this entry aligns with the recordtype, then break and use this entry.
			var rt = component.get("v.AppRecordType");
			if ($A.util.isEmpty(NavRecs[i].Valid_for_App_Record_Types__c) || this.isMemberOf(NavRecs[i].Valid_for_App_Record_Types__c,rt)) break;
		}

		if (i >= NavRecs.length) {
			console.log('returnNextValidPage - unable to find current component (' + componentName + ') in navigation model with LT and Recordtype of ' + component.get("v.ActiveLicenseType") + ' & ' + component.get("v.AppRecordType"));
			return null;
		}
		
		return  NavRecs[i].PrevCmp__c;
	},
	// Determine if entry is in the psudeo multi-select list msl
	isMemberOf: function(msl, entry) {
		if (!$A.util.isEmpty(msl) && !$A.util.isEmpty(entry)) {
			var splitMSL = msl.split(";");
			for (i = 0; i < splitMSL.length; i++)
				if (splitMSL[i].toLowerCase().trim() == entry.toLowerCase().trim())
					return true;
		}
		return false;
	},

    // lightning with locker service on has problems getting the recordId
	CheckRecordId: function(component) {    
        //   the function that reads the url parameters
        var getUrlParameter = function getUrlParameter(sParam) {
         var sPageURL = decodeURIComponent(window.location.search.substring(1)),
                sURLVariables = sPageURL.split('&'),
                sParameterName,
                i;

            for (i = 0; i < sURLVariables.length; i++) {
                sParameterName = sURLVariables[i].split('=');

                if (sParameterName[0] === sParam) {
                    return sParameterName[1] === undefined ? true : sParameterName[1];
                }
            }
        };

        // If the value isn't set, then go get it from the query string.
        if (!component.get("v.recordId")) component.set("v.recordId", getUrlParameter('recordId'));   
        },

    spinnerOff: function (component) {
    	var tryCount = 5;

		var spinner = component.find("spinner");    	
		while ($A.util.isEmpty(spinner) && tryCount-- > 0) {
		    if (component.isConcrete()) {
		    	if (!$A.util.isUndefined(component.getSuper().find))
		    		spinner = component.getSuper().find("spinner");
		    	else component = component.getConcreteComponent();
	    	}
    		else
    			component = component.getOwner();
		}
        if (!$A.util.isEmpty(spinner))
	        $A.util.addClass(spinner, "slds-hide");

        // var spinner = component.find("spinner");
        // if ($A.util.isUndefined(spinner)) spinner = component.getSuper().find("spinner");

    }, 
    // turn the spinner on (make it visible  by removing the hide class)
    spinnerOn: function (component) {
    	var tryCount = 5;

		var spinner = component.find("spinner");    	
		while ($A.util.isEmpty(spinner) && tryCount-- > 0) {
		    if (component.isConcrete()) {
		    	if (!$A.util.isUndefined(component.getSuper().find))
		    		spinner = component.getSuper().find("spinner");
		    	else component = component.getConcreteComponent();		    	
	    	}
    		else
    			component = component.getOwner();
		}
        if (!$A.util.isEmpty(spinner))
        	$A.util.removeClass(spinner, "slds-hide");
    }
})