({
    // Call the getSinglePage server routine.  It needs the application record ID and the name of the section/page to display
    // It returns a list of checklist questions (page info and questions) to process.
    getRecordsForPage: function(component) {
        var action = component.get("c.getSinglePage");
        action.setParams({
            aId: component.get("v.recordId"),
            pName: component.get("v.Section")
        });
        action.setCallback(this, function(response) {
            try {
                var state = response.getState();
                if (state === 'SUCCESS') {
                    component.set("v.record", response.getReturnValue());

                    if (response.getReturnValue() === null) {
                        var nextAction = component.getEvent("EmptyComponent");
                        nextAction.setParams({
                            "Component": component
                        });
                        nextAction.fire();
                    }
                } else { // error or incomplete comes here
                    var errors = response.getError();
                    if (errors) {
                        // get all error messages to display
                        for (var erri = 0; erri < errors.length; erri++) {
                            component.set("v.errorMessage", component.get("v.errorMessage") + " : " + errors[erri].message);
                        }
                        component.set("v.showError", true);
                    }
                }
            } catch (e) {
                alert(e.stack);
            }
        });
        $A.enqueueAction(action);
    },


    doUpdate: function(component, event) {
        try {
            // our parent wants to keep track of the number of invocations out there.
            //            var sectionCount = component.get("v.SectionCounts");
            //            component.set("v.SectionCounts",sectionCount+1);


            // If this isn't an application, then skip the Save for Now and tell everyone we're okay!
            if (!component.get("v.RecordIdIsApplication")) {
                var action = component.getEvent("SaveCompleted");
                action.setParams({"Component" : component, "Action": "Saved" });
                action.fire();
                return;
            }




            var record = JSON.parse(JSON.stringify(component.get("v.record")));
            
            //Temporary fix for having multiple sections trying to save the same thing
            if(record === null){
            	var nextAction = component.getEvent("SaveCompleted");
            	nextAction.setParams({
                    "Component": component,
                    "Action": "Saved"
                });
                nextAction.fire();
            }else{
            
           
            var saveList = [];
            // for each of the questions on this page, get the response
            console.log(record);
            var qbs = record.questionBlocks;
            for (var j = 0; j < qbs.length; j++) {
                saveList.push(qbs[j].question.response);

                // See if there is a subquestion we need to handle as well, if so
                // save away all of the subquestion responses as well
                if (typeof qbs[j].subQuestions !== "undefined") {
                    for (var s = 0; s < qbs[j].subQuestions.length; s++) {
                        saveList.push(qbs[j].subQuestions[s].response);
                    }
                }
            }

            // Now that we have a list of the answers, we can call the Server side Apex to process the results
            console.log(JSON.stringify(saveList));
            var action = component.get("c.saveAnswersWithContext");
            var cname = component.getLocalId();
            action.setParams({
                "context": cname,
                "answers": JSON.stringify(saveList)
            });

            //  callback from Apex code
            action.setCallback(this, function(response) {
                var action = component.getEvent("SaveCompleted");
                try {
                    var state = response.getState();
                    console.log(state);
                    if (state === 'SUCCESS') {
                    	console.log('Successful Save');
                        action.setParams({
                            "Component": component,
                            "Action": "Saved"
                        });
                    } else { // error or incomplete comes here
                        var errors = response.getError();
                        if (errors) {
                            for (var erri = 0; erri < errors.length; erri++) {
                                component.set("v.errorMessage", errors[erri].message + " : " + component.get("v.errorMessage"));
                            }
                            component.set("v.showError", true);
                        }
                        action.setParams({
                            "Component": component,
                            "Action": "Fail"
                        });
                    }
                } catch (e) {
                    alert(e.stack);
                    action.setParams({
                        "Component": component,
                        "Action": "Fail"
                    });
                } finally {
                    // always fire this action.  parms are set.                
                    action.fire();
                }
            });
            $A.enqueueAction(action);
            }
        } catch (e) {
            alert(e.stack);
            var nextAction = component.getEvent("SaveCompleted");
            nextAction.setParams({
                "Component": component,
                "Action": "Fail"
            });
            nextAction.fire();
        }
    },


    valueChange: function(component, event) {
        var inputToField = component.get('v.inputToField');
        var field = inputToField[event.getSource().getGlobalId()];
        var obj = component.get(event.getSource().getParentId());
        if (!obj[field]) {
            // Have to make a copy of the object to set a new property - thanks LockerService!
            obj = JSON.parse(JSON.stringify(obj));
        }
        obj[field] = event.getSource().get('v.value');
        component.set('v.record', obj);
    }
})