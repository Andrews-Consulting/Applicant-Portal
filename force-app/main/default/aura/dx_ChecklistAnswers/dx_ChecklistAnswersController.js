({
    doInit: function(component, event, helper) {
        var qType = component.get("v.questionType");
        var r = component.get("v.response");
        var lm = [];
        var show;
        switch(qType.BGCK__Type__c){
        	case 'Radio Button':       // radio buttons and checkboxes are an iteration over the various choices
        		show = "Radio";
        		break;
        	case 'Checkbox - Horizontal':  
                if(!$A.util.isEmpty(r.Name) && (r.Name !== 'Not Answered Yet') && (r.Name !== 'Skipped'))
                    component.set("v.fldCheckBoxH",true);
                else 
                    component.set("v.fldCheckBoxH",false);
        		show = "CBH";
        		break;
        	case 'Checkbox - Vertical':
                if(!$A.util.isEmpty(r.Name) && (r.Name !== 'Not Answered Yet') && (r.Name !== 'Skipped'))
                    component.set("v.fldCheckBoxV",true);
                else 
                    component.set("v.fldCheckBoxV",false);
        		show = "CBV";
        		break;
        	case 'Date':           // Date is populated from v.response.abd_Date_Value__c
        		show = "Date";
        		break;
        	case 'Picklist':       // Picklist is built from helper class routine.
        		show = "Pick";
        		break;
        	case 'Record List':
        		show = "List";
        		break;
            case 'Number - Percent':    // 
                if(!$A.util.isEmpty(r.Name) && (r.Name !== 'Not Answered Yet'))
                    component.set("v.fldDecimalInput",r.BGCK__Actual_Value2__c);
                else 
                    component.set("v.fldDecimalInput","");
                show = "NumP";
                break;
            case 'Number - Integer':
                if(!$A.util.isEmpty(r.Name) && (r.Name !== 'Not Answered Yet'))
                    component.set("v.fldIntegerInput",r.BGCK__Actual_Value2__c);
                else 
                    component.set("v.fldIntegerInput","");
                show = "NumI";
                break;
            case 'Number - Currency':
                if(!$A.util.isEmpty(r.Name) && (r.Name !== 'Not Answered Yet'))
                    component.set("v.fldDecimalInput",r.BGCK__Actual_Value2__c);
                else 
                    component.set("v.fldDecimalInput","");
                show = "NumC";
                break;
            case 'Number - Decimal':
                if(!$A.util.isEmpty(r.Name) && (r.Name !== 'Not Answered Yet'))
                    component.set("v.fldDecimalInput",r.BGCK__Actual_Value2__c);
                else 
                    component.set("v.fldDecimalInput","");
                show = "NumD";
                break;
            case 'Phone Number':        // Phone number is still pointing to r.BGCK__Actual_Value2__c
                show = "NumPhone";
                break;
            // case 'Label':                All of these need the same support, so we just let default handle it all
            // case 'Text Area':
            // case 'Text': 
        	default:
                if(!$A.util.isEmpty(r.Name) && (r.Name !== 'Not Answered Yet'))
                    component.set("v.fldTextInput",r.BGCK__Actual_Value2__c.replace("&#39;","'"));
                else 
                    component.set("v.fldTextInput","");
        		show = "Text";
        }

        component.set("v.showType",show);

       
        var lMap = {
        		'fsName': qType.BGCK__Fieldset_Name__c,
        		'objectName' : qType.BGCK__Object_Name__c, 
    			'fieldNum' : qType.BGCK__Preview_Field_Count__c, 
				'response' : r,
				'render' : (show==='List')
        };
        lm.push(lMap);
        //console.log(lm);
        component.set("v.listMap",lm);
        if(show === "Pick")
        	helper.setPick(component);
    },
    handleRadioChange: function(component, event, helper) {
        var obj = component.get("v.response");
        if (!obj) {
            obj = JSON.parse(JSON.stringify(obj));
        }
        var val = event.getSource().get("v.label");
        obj.Name = val.substring(0, 79);
        obj.BGCK__Actual_Value__c = val.substring(0, 254);
        obj.BGCK__Actual_Value2__c = val;
        component.set("v.response", obj);
    },
    handleCheckboxChange: function(component, event, helper) {
        var obj = component.get("v.response");
        if (!obj) {
            obj = JSON.parse(JSON.stringify(obj));
        }
        var val = event.getSource().get("v.value");
        if (!val) {
            val = 'Not Answered Yet';
            obj.Name = val.substring(0, 79);
            obj.BGCK__Actual_Value__c = null;
            obj.BGCK__Actual_Value2__c = null;
        }
        else {
            val = event.getSource().get("v.label");
            obj.Name = val.substring(0, 79);
            obj.BGCK__Actual_Value__c = val.substring(0, 254);
            obj.BGCK__Actual_Value2__c = val;
        }
        component.set("v.response", obj);
    },

    handleDateChange: function(component, event, helper) {
        var obj = component.get("v.response");
        if (!obj) {
            obj = JSON.parse(JSON.stringify(obj));
        }
        if (new Date(obj.abd_Date_Value__c) == 'Invalid Date') {
            obj.abd_Date_Value__c = null;
            obj.BGCK__Actual_Value__c = null;
            obj.BGCK__Actual_Value2__c = null;
        }
        else {
            // ie converts 2 digit years to 1900 dates. Let's show the user the converted value here.
            var val = new Date(obj.abd_Date_Value__c).toString();
            obj.BGCK__Actual_Value__c = val;
            obj.Name = val;
            obj.BGCK__Actual_Value2__c = val;
            component.set("v.response", obj);
        }
    },
    handleTextChange: function(component, event, helper) {
        var obj = component.get("v.response");
        if (!obj) {
            obj = JSON.parse(JSON.stringify(obj));
        }
        var val = component.get("v.fldTextInput");

        // If the user wipes out the field, let's reset the name to the default value.
        if ($A.util.isEmpty(val)) 
            val = 'Not Answered Yet';
        obj.Name = val.substring(0, 79);
        obj.BGCK__Actual_Value__c = val.substring(0, 254);
        obj.BGCK__Actual_Value2__c = val;
        component.set("v.response", obj);
    },
    // source is a picklist - NAME is set.
    onSelectChange: function(component, event, helper) {
    	console.log('Select Change');
        var obj = component.get("v.response");
        if (!obj) {
            obj = JSON.parse(JSON.stringify(obj));
        }
        // If there's something there
        val = component.get("v.fldPicklistInput");
        if (!$A.util.isEmpty(val)) {

            // unselect and reselect the correct choice.
            var opts = event.getSource().get("v.options");
            for (i = 0; i < opts.length; i++) {
                selected = (opts[i].label == val);
            }
            event.getSource().set("v.options",opts);

            // But if they selected --None--, (value is Not answered yet), just clear out other data values
            if (val != 'Not Answered Yet') {
                obj.BGCK__Actual_Value__c = val.substring(0, 254);
                obj.BGCK__Actual_Value2__c = val;
                obj.Name = val;
            }
            else  {
                obj.BGCK__Actual_Value__c = null;
                obj.BGCK__Actual_Value2__c = null;
                obj.name = val;
            }
            component.set("v.response", obj);
        }
    }, 
    handleNumberChange: function(component, event, helper) {
        component.set("v.itemErrorMessage","");
        var obj = component.get("v.response");
        if (!obj) {
            obj = JSON.parse(JSON.stringify(obj));
        }
        var val = component.get("v.fldDecimalInput");
        var Validation = new RegExp(/[^0-9\-\+\.\^\*\%]/);
        if (Validation.test(val))
            component.set("v.itemErrorMessage","Please enter a valid number");
        else {
            // If the user wipes out the field, let's reset the name to the default value.
            if ($A.util.isEmpty(val)) 
                val = ''; //Not Answered Yet';
            else 
                if (!Number.isNaN(val))
                    val = Number(val);
                else { 
                    component.set("v.itemErrorMessage","Please enter a valid number");
                    return;
                }
            obj.Name = val.toString();
            obj.BGCK__Actual_Value2__c = val;
            obj.BGCK__Actual_Value__c = val;
            component.set("v.response", obj);
        }
    },
    handleIntegerChange: function(component, event, helper) {
        component.set("v.itemErrorMessage","");
        var obj = component.get("v.response");
        if (!obj) {
            obj = JSON.parse(JSON.stringify(obj));
        }
        var val = component.get("v.fldIntegerInput");

        // We're getting invoked when the object is being built, val is null.
        
        var Validation = new RegExp(/[^0-9]/);
        if (!$A.util.isEmpty(val) && Validation.test(val)) {
            component.set("v.itemErrorMessage","Please enter a positve whole number");
            val = '';
        }
        else {
           // If the user wipes out the field, let's reset the name to the default value.
            if ($A.util.isEmpty(val)) 
                val = '';
            else 
                if (!Number.isNaN(val) && Number.isSafeInteger(Number(val))) {
                    val = Number(val);         
                }
                else { 
                    component.set("v.itemErrorMessage","Please enter a positve whole number");
                    val = '';
                }

            obj.Name = val.toString();
            obj.BGCK__Actual_Value2__c = val;
            obj.BGCK__Actual_Value__c = val;
            component.set("v.response", obj);       
        }
    },
    handlePhoneChange: function(component, event, helper) {
        component.set("v.itemErrorMessage","");
        var obj = component.get("v.response");
        if (!obj) {
            obj = JSON.parse(JSON.stringify(obj));
        }
        var val = obj.BGCK__Actual_Value2__c;
        var Validation = new RegExp(/[^0-9\.\(\)\-\+]/);
        if (Validation.test(val))
            component.set("v.itemErrorMessage","Please enter a valid Phone number");
        else {
           // If the user wipes out the field, let's reset the name to the default value.
            if ($A.util.isEmpty(val)) 
                val = '';

            obj.Name = val.toString();
            obj.BGCK__Actual_Value2__c = val.substring(0,20);
            obj.BGCK__Actual_Value__c = val.substring(0, 20);
            component.set("v.response", obj);
        }
    }
})