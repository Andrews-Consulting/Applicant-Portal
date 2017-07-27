({
	setPick : function(component) {
		var list = component.get("v.questionType.BGCK__Choices__r");
		var resp = component.get("v.response");
        var opts = [];
        opts.push({label:'--None--', value:'Not Answered Yet'});
        if(resp.Name === null || resp.Name === '' || resp.Name === undefined)
        	resp.Name=list[0];
    	for(var i=0;i<list.length;i++){
    		var selected = (list[i].Name === resp.Name);
    		opts.push({label:(list[i].BGCK__Display_Value__c !== null)?list[i].BGCK__Display_Value__c:list[i].Name, value:list[i].Name, selected:selected});
    	}
    	component.find("picklist").set("v.options",opts);
	}
})