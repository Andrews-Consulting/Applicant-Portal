({
    init: function(cmp, event, helper) {
        helper.getFieldDefinition(cmp);
    },
	save : function(cmp, event, helper) {
    	//var spinner = component.find("spinner");
        //$A.util.toggleClass(spinner, "slds-hide");
        console.log('Save');
        //helper.toggle(component, event);
        var action = cmp.get("c.saveAnswers");
        var records = cmp.get("v.records");
        console.log(records[0].questionBlocks[0]);
        var saveList = [];
        for(var i=0;i<records.length;i++){
        	var qbs = records[i].questionBlocks;
        	for(var j=0;j<qbs.length;j++){
        		saveList.push(qbs[j].question.response);
        		if(typeof qbs[j].subQuestions !== "undefined"){
	        		console.log(qbs[j].subQuestions);
	        		for(var s=0;s<qbs[j].subQuestions.length;s++){
	        			saveList.push(qbs[j].subQuestions[s].response);
	        		}
	        	}
        	}
        }
        console.log(JSON.stringify(saveList));
        action.setParams({
            answers: JSON.stringify(saveList)
        });
        console.log(2);
        action.setCallback(this, 
            function(response) { 
                console.log('Save Return Value');
                cmp.set("v.errorMessage", response.getReturnValue());
                cmp.set("v.showError", true);
                //$A.util.toggleClass(spinner, "slds-hide");
             }
        );
        $A.enqueueAction(action);
        
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