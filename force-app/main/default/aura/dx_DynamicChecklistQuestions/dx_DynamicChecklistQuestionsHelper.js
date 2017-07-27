({
    getFieldDefinition:function(component){
        console.log('FieldSetFormController.init');
        var action = component.get("c.getChecklist");
        console.log(1);
        
        
        action.setParams({
            lType: component.get("v.licenseType"),
            aType: component.get("v.applicationType"),
            rId: component.get("v.checklistVersion"),
            aId: component.get("v.application")
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
                	component.set("v.records", rec.sections);
                //if(rec.columns>1)
                    
                //if(fields!==null)
                	//this.createForm(component);
            }
        );
        $A.enqueueAction(action);
    }
})