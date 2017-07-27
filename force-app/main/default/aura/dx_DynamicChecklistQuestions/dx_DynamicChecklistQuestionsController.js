({
    init: function(cmp, event, helper) {
        helper.getFieldDefinition(cmp);
    },
	save : function(cmp, event, helper) {
    	console.log('Dynamic save');
        //helper.toggle(component, event);
        helper.doUpdate(cmp, event);
        //helper.toggleOff(component, event);
        
    },
    handleValueChange: function(cmp, event, helper) {
        console.log('change');
        var inputToField = cmp.get('v.inputToField');
        var field = inputToField[event.getSource().getGlobalId()];
        var obj = cmp.get(event.getSource().getParentId());
        if (!obj[field]) {
            // Have to make a copy of the object to set a new property - thanks LockerService!
            obj = JSON.parse(JSON.stringify(obj));
            console.log('copy');
        	//console.log(obj);
        }
        obj[field] = event.getSource().get('v.value');
        cmp.set('v.record', obj);
        //console.log(event);
        //console.log(event.getSource().getGlobalId());
        //console.log(inputToField);
        //console.log(inputToField[event.getSource().getGlobalId()]);
        //console.log(obj);
    }
})