({
	render : function(component, helper) {
    	var ret = this.superRender();
    	console.log('CRNA render');
    	// do custom rendering here
    	return ret;
	},

	rerender : function(component, helper){
    	this.superRerender();
    	console.log('CRNA Rerender 1');		
      	var oCounter = component.get("v.oCounter");
      	if (!$A.util.isEmpty(oCounter)) {
			//var OwnerItems = component.find("OwnerItems"+ oCounter.toString());  //framework bug prevents this from working.
			dynamicComponentsByAuraId = component.get("v.dynamicComponentsByAuraId");
            var OwnerItems = dynamicComponentsByAuraId["OwnerItems"+ oCounter.toString()];
             var ownerNameList = component.get("v.ownerNameList");
			if (!$A.util.isEmpty(ownerNameList) && ownerNameList.size > 0 && !$A.util.isEmpty(OwnerItems)) {
				if ($A.util.isEmpty(OwnerItems.get("v.options"))) {
					// Build the select list for the next set of owners (only shows remaining)
					var opts = [];
					opts.push({label: "Select Owner", value: "NONE", selected: true});
					ownerNameList.forEach(function (item, key, mapObj) {opts.push({label: item.toString(), 
  																					value: key.toString(),
  																					selected: false});
																		});  
					OwnerItems.set("v.options", opts);    	  	
	            }
	        }
        }
    // do custom rerendering here
	},

	afterRender: function (component, helper) {
    	console.log('CRNA AfterRender 1');		
    	this.superAfterRender();
    	console.log('CRNA AfterRender 2');		
    // interact with the DOM here
	},

	unrender: function () {
    	console.log('CRNA UnRender 1');		
    	this.superUnrender();
    	console.log('CRNA UnRender 2');    	
    // do custom unrendering here
	}

})