({
    configMap: {
        'anytype': { componentDef: 'ui:outputText', attributes: {"aura:id":""} },
        'base64': { componentDef: 'ui:outputText', attributes: {"aura:id":""} },
        'boolean': {componentDef: 'ui:outputCheckbox', attributes: {"aura:id":""} },
        'combobox': { componentDef: 'ui:outputText', attributes: {"aura:id":""} },
        'currency': { componentDef: 'ui:outputText', attributes: {"aura:id":""} },
        'datacategorygroupreference': { componentDef: 'ui:inputText', attributes: {"aura:id":""} },
        'date': {
            componentDef: 'ui:outputDate',
            attributes: {
                "aura:id":"",
                displayDatePicker: true
            }
        },
        'datetime': { componentDef: 'ui:outputDateTime', attributes: {"aura:id":""} },
        'double': { componentDef: 'ui:outputText', attributes: {"aura:id":""} },
        'email': { componentDef: 'ui:outputEmail', attributes: {"aura:id":""} },
        'encryptedstring': { componentDef: 'ui:outputText', attributes: {"aura:id":""} },
        'id': { componentDef: 'ui:outputText', attributes: {"aura:id":""} },
        'integer': { componentDef: 'ui:outputText', attributes: {"aura:id":""} },
        'multipicklist': { componentDef: 'ui:outputSelect', attributes: {multiple: true,"aura:id":""} },
        'percent': { componentDef: 'ui:outputText', attributes: {"aura:id":""} },
        'phone': { componentDef: 'ui:outputPhone', attributes: {"aura:id":""} },
        'picklist': { componentDef: 'ui:outputText', attributes: {"aura:id":""} },
        'reference': { componentDef: 'ui:outputText', attributes: {"aura:id":"",disabled:true} },
        'string': { componentDef: 'ui:outputText', attributes: {"aura:id":""} },
        'textarea': { componentDef: 'ui:outputTextArea', attributes: {"aura:id":""} },
        'time': { componentDef: 'ui:outputDateTime', attributes: {"aura:id":""} },
        'url': { componentDef: 'ui:outputURL', attributes: {"aura:id":""} }
    },
    
    createForm: function(cmp) {
        console.log('FieldSetFormHelper.createForm');
        var fields = cmp.get('v.fields');
        var obj = cmp.get('v.records');
        var rows = obj.length;
        if(rows>0)
        	cmp.set("v.showEmpty",false);
        var inputDesc = [];
        var fieldPaths = [];
        //var colMap = {};
        for (var r = 0; r < rows; r++){
            inputDesc.push(["aura:html", {"tag": "tr"}]);
            console.log(inputDesc);
        }
        for (var o = 0; o < obj.length; o++){
        	for (var i = 0; i < fields.length; i++) {
	            var field = fields[i];
	            //console.log(field);
	            var config = JSON.parse(JSON.stringify(this.configMap[field.type.toLowerCase()]));
	            if (config) {
	                //config.attributes.label = field.label;
	                config.attributes.required = field.required;
	                config.attributes.value = obj[o][field.fieldPath];
	                config.attributes.fieldPath = field.fieldPath;
	                config.attributes["aura:id"]=field.fieldPath;
	                config.attributes.disabled = field.readOnly;
	                /*if(config.componentDef==='ui:inputSelect' && field.options !== null){
	                    var fieldOpts = field.options;
	                    var opts = [];
	                    for(var j = 0; j < fieldOpts.length; j++){
	                        opts.push({class: "slds-picklist__item", label: field.options[j], value: field.options[j]});    
	                    }
	                    config.attributes.options = opts;
	                    config.attributes.class = "slds-picklist__options slds-picklist__options--multi";
	                }*/
	                inputDesc.push(["aura:html", {"tag": "td","HTMLAttributes": {class: "slds-truncate","id":"td_"+config.attributes.fieldPath}}]);
	                inputDesc.push([
	                	config.componentDef,
	                	config.attributes
	                ]);
	                fieldPaths.push(field.fieldPath);
	                //colMap[field.fieldPath] = field.column;
	            } else {
	                console.log('type ' + field.type.toLowerCase() + ' not supported');
	            }
	        }
        }
        
        $A.createComponents(inputDesc, function(cmps) {
            console.log('createComponents');
            var inputToField = {};
            var formBody = cmp.get('v.form');
            var rows = cmp.get('v.records').length;
            var index=rows;
            var formBody = cmp.get('v.form');
            var fields = cmp.get('v.fields');
            for (var c = 0; c < rows; c++){
                var j=0;
                console.log(c);
                console.log(cmps[index+1]);
            	var topDiv = cmps[c].get("v.body");
                for (var i = 0; i < fields.length; i++){
                    console.log('In while loop');
                    var childObj = cmps[index+1];
                    var eventType = (childObj.isInstanceOf("ui:inputDate"))?'select':'click';
                    var divBody = cmps[index].get("v.body");
                    childObj.addHandler(eventType, cmp, 'c.handleValueChange');
                    divBody.push(childObj);
                    inputToField[childObj.getGlobalId()] = fieldPaths[j];
                    cmps[index].set("v.body",divBody);
                    topDiv.push(cmps[index]);
                    cmps[c].set("v.body",topDiv);
                    j++;
                    index+=2;
                    
                }
                console.log(cmps[c]);
                    
                formBody.push(cmps[c]);
            }
            cmp.set('v.form', formBody);
            cmp.set('v.inputToField', inputToField);
            console.log(inputToField);
        });
    },
    doUpdate: function(component){
        console.log('called updateRecord');
        var action = component.get("c.upRecordApex");
        var record = component.get("v.detailRecord");
        console.log(record);
        action.setParams({"obj": record});
        action.setCallback(this, function(response){
            var rtnValue = response.getReturnValue();
            console.log(rtnValue);
            if (rtnValue !== null) {
                component.set("v.errorMessage",response.getReturnValue());
                component.set("v.showError",true);
            }
            //this.toggle(component, event);
        });
        $A.enqueueAction(action);
        console.log(action.getReturnValue());
    },
    toggle: function (cmp, event) {
        var spinner = cmp.find("spinner");
        $A.util.toggleClass(spinner, "slds-hide");
    },
    getFieldDefinition:function(component){
        console.log('FieldSetFormController.init');
        var action = component.get("c.getObjectList");
        console.log(1);
        var records = component.get("v.records");
        
        action.setParams({
            fsName: component.get("v.fsName"),
            typeName: component.get("v.objectName"),
            rId: component.get("v.recordId"),
            fieldNums: component.get("v.fieldNum")
        });
        console.log(2);
        action.setCallback(this, 
            function(response) { 
                console.log('FieldSetFormController getFields callback');
                console.log(response.getReturnValue());
                var rec = response.getReturnValue();
                var fields = rec.fieldSetList;
                console.log(rec);
                console.log(fields);
                component.set("v.fields", fields);
                //if(record.Id==null)
                	component.set("v.records", rec.lobj);
                //if(rec.columns>1)
                    //component.set("v.colNum",rec.columns)
                if(fields!==null)
                	this.createForm(component);
            }
        );
        $A.enqueueAction(action);
    }
})