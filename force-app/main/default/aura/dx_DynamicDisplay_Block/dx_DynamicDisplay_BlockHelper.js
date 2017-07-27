({
    configMap: {
        'anytype': { componentDef: 'ui:inputText', attributes: {"aura:id":""} },
        'base64': { componentDef: 'ui:inputText', attributes: {"aura:id":""} },
        'boolean': {componentDef: 'ui:inputCheckbox', attributes: {"aura:id":""} },
        'combobox': { componentDef: 'ui:inputText', attributes: {"aura:id":""} },
        'currency': { componentDef: 'ui:inputText', attributes: {"aura:id":""} },
        'datacategorygroupreference': { componentDef: 'ui:inputText', attributes: {"aura:id":""} },
        'date': {
            componentDef: 'ui:inputDate',
            attributes: {
                "aura:id":"",
                displayDatePicker: true
            }
        },
        'datetime': { componentDef: 'ui:inputDateTime', attributes: {"aura:id":""} },
        'double': { componentDef: 'ui:inputText', attributes: {"aura:id":""} },
        'email': { componentDef: 'ui:inputEmail', attributes: {"aura:id":""} },
        'encryptedstring': { componentDef: 'ui:inputText', attributes: {"aura:id":""} },
        'id': { componentDef: 'ui:inputText', attributes: {"aura:id":""} },
        'integer': { componentDef: 'ui:inputText', attributes: {"aura:id":""} },
        'multipicklist': { componentDef: 'ui:inputSelect', attributes: {multiple: true,"aura:id":""} },
        'percent': { componentDef: 'ui:inputText', attributes: {"aura:id":""} },
        'phone': { componentDef: 'ui:inputPhone', attributes: {"aura:id":""} },
        'picklist': { componentDef: 'ui:inputSelect', attributes: {"aura:id":""} },
        'reference': { componentDef: 'ui:inputText', attributes: {"aura:id":"",disabled:true} },
        'string': { componentDef: 'ui:inputText', attributes: {"aura:id":""} },
        'textarea': { componentDef: 'ui:inputTextArea', attributes: {"aura:id":""} },
        'time': { componentDef: 'ui:inputDateTime', attributes: {"aura:id":""} },
        'url': { componentDef: 'ui:inputURL', attributes: {"aura:id":""} }
    },
    
    createForm: function(cmp) {
        console.log('FieldSetFormHelper.createForm');
        var fields = cmp.get('v.fields');
        var obj = cmp.get('v.detailRecord');
        var col = cmp.get('v.colNum');
        var inputDesc = [];
        var fieldPaths = [];
        var colMap = {};
        for (var c = 0; c < col; c++){
            inputDesc.push(["aura:html", {"tag": "div","HTMLAttributes": {"class": "slds-col ","id":"div_Col_"+c}}]);
            console.log(inputDesc);
        }
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            //console.log(field);
            var config = JSON.parse(JSON.stringify(this.configMap[field.type.toLowerCase()]));
            if (config) {
                config.attributes.label = field.label;
                config.attributes.required = field.required;
                config.attributes.value = obj[field.fieldPath];
                config.attributes.fieldPath = field.fieldPath;
                config.attributes["aura:id"]=field.fieldPath;
                config.attributes.disabled = field.readOnly;
                if(config.componentDef==='ui:inputSelect' && field.options !== null){
                    var fieldOpts = field.options;
                    var opts = [];
                    for(var j = 0; j < fieldOpts.length; j++){
                        opts.push({class: "slds-picklist__item", label: field.options[j], value: field.options[j]});    
                    }
                    config.attributes.options = opts;
                    config.attributes.class = "slds-picklist__options slds-picklist__options--multi";
                }
                inputDesc.push(["aura:html", {"tag": "div","HTMLAttributes": {class: "slds-p-horizontal--small slds-size--1-of-1","id":"div_"+config.attributes.fieldPath}}]);
                inputDesc.push([
                	config.componentDef,
                	config.attributes
                ]);
                fieldPaths.push(field.fieldPath);
                colMap[field.fieldPath] = field.column;
            } else {
                console.log('type ' + field.type.toLowerCase() + ' not supported');
            }
        }
        
        $A.createComponents(inputDesc, function(cmps) {
            console.log('createComponents');
            var inputToField = {};
            var formBody = cmp.get('v.form');
            var col = cmp.get('v.colNum');
            var j=0;
            var index=col;
            var formBody = cmp.get('v.form');
            for (var c = 0; c < col; c++){
                console.log(c);
                console.log(cmps[index+1]);
            	var topDiv = cmps[c].get("v.body");
                while(index< cmps.length && colMap[cmps[index+1].getLocalId()]==c+1){
                    console.log('In while loop');
                    var childObj = cmps[index+1];
                    var eventType = (childObj.isInstanceOf("ui:inputDate"))?'select':'change';
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
        var action = component.get("c.getFields");
        console.log(1);
        var record = component.get("v.detailRecord");
        
        action.setParams({
            fsName: component.get("v.fsName"),
            typeName: component.get("v.typeName"),
            rId: component.get("v.recordId")
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
                if(record.Id==null)
                	component.set("v.detailRecord", rec.obj);
                if(rec.columns>1)
                    component.set("v.colNum",rec.columns)
                if(fields!==null)
                	this.createForm(component);
            }
        );
        $A.enqueueAction(action);
    }
})