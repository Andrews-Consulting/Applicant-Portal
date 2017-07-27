({
	getFieldDefinition:function(component){
        console.log('FieldSetFormController.init');
        var action = component.get("c.getPage");
        console.log(1);
        
        
        action.setParams({
            pName: component.get("v.page"),
            aId: component.get("v.relatedId")
        });
        console.log(2);
        action.setCallback(this, 
            function(response) { 
                console.log('FieldSetFormController getFields callback');
                console.log(response.getReturnValue());
                var rec = response.getReturnValue();
                console.log(rec);
                //console.log(rec.types);
                //component.set("v.questionTypes", rec.types);
                //if(record.Id==null)
                	component.set("v.record", rec);
                //if(rec.columns>1)
                    
                //if(fields!==null)
                	//this.createForm(component);
            }
        );
        $A.enqueueAction(action);
    }
})