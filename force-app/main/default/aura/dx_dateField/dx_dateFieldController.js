({  
    // most of the time this is called before a value has been assigned to lclvalue, but if this component is rendered late, 
    // then the opposite happens, there is a value, but since the change was missed, we would never go through the setLclValue code.
    // BECAUSE, this component renders before the page has a chance to call the controller (which is why no values exist at init typically).
    init : function(component, event) {
        var value = component.get("v.value");
        var lv = component.get("v.lastvalue");
        // So if during init, we find a value, but no last value, we have to assume a late rendering.
        if (!$A.util.isEmpty(value) && $A.util.isEmpty(lv)) {
            component.set("v.lastvalue",value);
            component.set("v.lclvalue",value);
        }
        if (!$A.util.isEmpty(component.get("v.disabled"))) component.set("v.lcldisabled",component.get("v.disabled"));
    },

    setLclValue : function(component, event) {
        var value = component.get("v.value");
        var lv = component.get("v.lastvalue");

        // since a change to lclvalue triggers a change handler, it's worth the check here to short circuit the update if 
        // it's not really necessary.  if nothing exists or  something exists and they are the same, then leave.
        if (($A.util.isEmpty(value) && $A.util.isEmpty(lv)) || (!$A.util.isEmpty(value) && !$A.util.isEmpty(lv) && (value === lv)))
            return;

        component.set("v.lastvalue",value);
        component.set("v.lclvalue",value);
    },

    // transition over the external attribute to our internal attribute.
    setLclDisabled : function ( component, event) {
      if (!$A.util.isEmpty(component.get("v.disabled"))) component.set("v.lcldisabled",component.get("v.disabled"));  
  }, 
    // DAte Processor
    // Goal is to Validate the date, set the time back to midnight local time, handle any two digit year conversions

    dateChange : function(component, event) {
    	if (component.get("v.NoValidation"))        // If this is on, just leave 
            return;

        var fieldValue = component.get("v.lclvalue");

        // another short circuit check - We get re-invoked when we fix our date. if this is the re-invocation, just leave.
        var lv = component.get("v.lastvalue");
        if (!$A.util.isEmpty(lv) && lv === fieldValue)
            return;

        fieldValueAsDate = new Date(fieldValue);

        // If we fail the simple validation, wipe the field for the caller
        if ($A.util.isEmpty(fieldValue) ||          // ignore empty strings
            fieldValue.length < 6  ||               // anything less than six digits can be converted to a valid date.
            fieldValueAsDate == 'Invalid Date') {
            component.set("v.value","");
            component.set("v.lclvalue","");
            return;
        }

        var cutOffYear = ((new Date().getFullYear()+1).toString().substr(-2)*1);//May need to set this value in a custom setting

        // if it's not all numbers or dash or slash, then we can't process it.
        var dateCheck = /[^0-9-\/]/;
        if (! dateCheck.test(fieldValue)) {

            // if the first field is not a year, then proceed
            if (fieldValue.indexOf('-') !== 4) {

                // Let's assume mm/dd/yy or mm-dd-yy format for this 2 digit year handling.
                var last3 = fieldValue.substr(-3);
                // determine if the last 4 characters contain the character: / - 
                var sepIndex = last3.indexOf('/') > -1 ? last3.indexOf('/') : ( last3.indexOf('-') > -1 ? last3.indexOf('-') : -1 );
                if(sepIndex > -1 ) {    
                        // yes there is a / character which means a one or two digit year was provided
                        // store the digits after the seperator from the input string
                        var lastSepLocation = 3-sepIndex;
                        var lastDigits = ((fieldValue.substr(-(lastSepLocation-1))));
                        var lastDigitsAsNumber = Number(lastDigits);

                        // remove the last digits from the input string
                        fieldValue = fieldValue.slice(0,(fieldValue.length-(lastSepLocation-1)));
                        
                        // anything less than the cutoff year is assumed to be this century.
                        if(lastDigitsAsNumber <= cutOffYear){
                            fieldValue = fieldValue + (lastDigitsAsNumber + 2000).toString();
                        }else{
                            fieldValue = fieldValue + (lastDigitsAsNumber + 1900).toString();
                        }
                }
                else {      // we didn't find a seperator in the last 3 characters.
                }
            }
        }
        
        // This is a real pain
        fieldValue  = new Date(fieldValue).toJSON().substr(0,10);
        var fieldValueAsLocalDate = new Date(new Date(fieldValue).getTime() + new Date(fieldValue).getTimezoneOffset()*60*1000);
        var formattedDate = $A.localizationService.formatDate(fieldValueAsLocalDate,"yyyy-MM-dd");
        // This order is critical since a change to lclvalue and value triggers an immediate "change encountered" event.
        // but since I added a handler for the value routine changing locally, I don't really need these first two lines.
        // component.set("v.lastvalue",formattedDate);
        // component.set("v.lclvalue",formattedDate);
        component.set("v.value",formattedDate);
    }
})