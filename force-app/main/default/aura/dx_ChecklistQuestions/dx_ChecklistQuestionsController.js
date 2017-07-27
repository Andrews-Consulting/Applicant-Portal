({	
	init: function(cmp, event, helper) {
        console.log('Init: ChecklistQuestions');
        //helper.getFieldDefinition(cmp);
    },
	/*
    save : function(cmp, event, helper) {
    	console.log('Dynamic save');
        //helper.toggle(component, event);
        helper.doUpdate(cmp, event);
        //helper.toggleOff(component, event);
        
    },
    handleValueChange: function(cmp, event, helper) {
        console.log('change');
        var obj = cmp.get("v.questionBlock");
        if (!obj) {
            // Have to make a copy of the object to set a new property - thanks LockerService!
            obj = JSON.parse(JSON.stringify(obj));
            console.log('copy');
        	//console.log(obj);
        }
        var val = event.getSource().get('v.value');
        obj.question.response.Name = val.left(80);
        obj.question.response.BGCK__Actual_Value__c = val;
        obj.question.response.BGCK__Actual_Value2__c = val;
        cmp.set('v.questionBlock', obj);
        //console.log(event);
        //console.log(event.getSource().getGlobalId());
        //console.log(inputToField);
        //console.log(inputToField[event.getSource().getGlobalId()]);
        //console.log(obj);
    }*/
})