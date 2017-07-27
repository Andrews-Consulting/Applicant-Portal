({
    init: function(cmp, event, helper) {
        //helper.getFieldDefinition();
        /*action = cmp.get('c.getStyling');
        action.setCallback(this, 
            function(response) { 
                var style = response.getReturnValue();
                cmp.set('v.Styling', response.getReturnValue());
            }
        );
        $A.enqueueAction(action);*/
    },
	save : function(component, event, helper) {
    	console.log('Dynamic save');
        //helper.toggle(component, event);
        helper.doUpdate(component, event);
        //helper.toggleOff(component, event);
        
    },
    handleValueChange: function(cmp, event, helper) {
        console.log('change');
        var inputToField = cmp.get('v.inputToField');
        var field = inputToField[event.getSource().getGlobalId()];
        var obj = cmp.get('v.detailRecord');
        if (!obj[field]) {
            // Have to make a copy of the object to set a new property - thanks LockerService!
            obj = JSON.parse(JSON.stringify(obj));
            console.log('copy');
        	//console.log(obj);
        }
        obj[field] = event.getSource().get('v.value');
        cmp.set('v.detailRecord', obj);
        console.log(event);
        console.log(event.getSource().getGlobalId());
        console.log(inputToField);
        console.log(inputToField[event.getSource().getGlobalId()]);
        //console.log(obj);
    },
    setObject: function(component, event, helper){
        var object = event.getParam("Pass_App");
        if(object.Id!=null)
        	component.set("v.detailRecord",object);
        console.log('setObject');
        console.log(object);
    }
})