({
    doInit: function(component, event, helper) {
        var qType = component.get("v.questionType");
        var r = component.get("v.response");
        var lm = [];
        var show;
        switch(qType.BGCK__Type__c){
        	case 'Radio Button':
        		show = "Radio";
        		break;
        	case 'Checkbox - Horizontal':
        		show = "CBH";
        		break;
        	case 'Checkbox - Vertical':
        		show = "CBV";
        		break;
        	case 'Date':
        		show = "Date";
        		break;
        	case 'Picklist':
        		show = "Pick";
        		break;
        	case 'Record List':
        		show = "List";
        		break;
            case 'Number - Percent':
                show = "NumP";
                break;
            case 'Number - Integer':
                show = "NumI";
                break;
            case 'Number - Currency':
                show = "NumC";
                break;
            case 'Number - Decimal':
                show = "NumD";
                break;
            case 'Phone Number':
                show = "NumPhone";
                break;
            case 'Label':
            case 'Text Area':
            case 'Text':
                show = "Text";
                break;
        	default:
        		show = "Text";
        }

        // Don't show the 'not answered yet'.  Oh and if it's text, change the apostrophe's back to characters.
        if (show.startsWith('Num') || show === 'Text' )
            if(!$A.util.isEmpty(r.BGCK__Actual_Value2__c)) {
                if (r.BGCK__Actual_Value2__c === 'Not Answered Yet') 
                    r.BGCK__Actual_Value2__c = '';
                if (show === 'Text') 
                    r.BGCK__Actual_Value2__c = r.BGCK__Actual_Value2__c.replace("&#39;","'");
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
    handleDateChange: function(component, event, helper) {
        var obj = component.get("v.response");
        if (!obj) {
            obj = JSON.parse(JSON.stringify(obj));
        }
        if (new Date(obj.abd_Date_Value__c) == 'Invalid Date') {
            obj.abd_Date_Value__c = null;
        }
        else {
            var val = obj.abd_Date_Value__c.toString();
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
        var val = obj.BGCK__Actual_Value2__c;
        // If the user wipes out the field, let's reset the name to the default value.
        if ($A.util.isEmpty(val)) 
            val = 'Not Answered Yet';
        obj.Name = val.substring(0, 79);
        obj.BGCK__Actual_Value__c = val.substring(0, 254);
        component.set("v.response", obj);
    },
    onSelectChange: function(component, event, helper) {
    	console.log('Select Change');
        var obj = component.get("v.response");
        if (!obj) {
            obj = JSON.parse(JSON.stringify(obj));
        }
        var val = component.find("picklist").get("v.value");
        obj.Name = val.substring(0, 79);
        obj.BGCK__Actual_Value__c = val.substring(0, 254);
        obj.BGCK__Actual_Value2__c = val;
        component.set("v.response", obj);
    }, 
    handleNumberChange: function(component, event, helper) {
        component.set("v.itemErrorMessage","");
        var obj = component.get("v.response");
        if (!obj) {
            obj = JSON.parse(JSON.stringify(obj));
        }
        var val = obj.BGCK__Actual_Value2__c;
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
        var val = obj.BGCK__Actual_Value2__c;

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