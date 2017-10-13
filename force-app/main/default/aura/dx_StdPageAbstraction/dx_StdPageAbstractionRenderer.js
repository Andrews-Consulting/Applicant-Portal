({
	render: function(cmp, helper){ 
		// console.log('stdpage Abstract render');
		var ret = this.superRender();
		return ret;
	},
	//   var _helper = component.getConcreteComponent().getDef().getHelper();  If we don't think the helper is being found correctly.
	rerender:function(cmp, helper){
		// console.log('stdpage Abstract re-render');
		this.superRerender();
		if (cmp.get("v.MightBeInInit"))
			helper.InvokeInitRoutines(cmp);
	},
	afterRender:function(cmp, helper){
		// console.log('stdpage Abstract after render');
		this.superAfterRender();
	},
	unrender:function(cmp, helper){
		// console.log('stdpage Abstract unrender');
		this.superUnrender();
	}
})