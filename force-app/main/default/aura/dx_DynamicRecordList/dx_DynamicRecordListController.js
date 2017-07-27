({
    initDRL: function(component, event, helper) {
        if (component.get("v.isRendered"))
            helper.getFieldDefinition(component);
    },
    save: function(component, event, helper) {
        console.log('Dynamic save');
        //helper.toggle(component, event);
        helper.doUpdate(component, event);
        //helper.toggleOff(component, event);

    },
    handleValueChange: function(cmp, event, helper) {
            console.log('Click Event');
            //var obj = cmp.get(event.getSource().getParentId());
            //console.log(event.getSource());
            /*var editRecordEvent = $A.get("e.force:editRecord");
            editRecordEvent.setParams({
                "recordId": 'a1l3500000008zQ'
            });
            editRecordEvent.fire();*/
            cmp.set("v.renderForm",true);
            //console.log(obj);
        }
        /*,
            setObject: function(component, event, helper){
                var object = event.getParam("Pass_App");
                if(object.Id!=null)
                	component.set("v.detailRecord",object);
                console.log('setObject');
                console.log(object);
            }*/
})