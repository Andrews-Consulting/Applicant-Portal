({
	myAction : function(component, event, helper) {
		
	}
})
var GOVDSNIPPET = function() {
    var form  = document.getElementById('GD-snippet-form');
    var typeSelect = form.getElementsByTagName('select')[0];
    var getStyleType = function(type) {
        return typeSelect.value === type ? 'block' : 'none';
    };
    var toggleType = function() {
        form.getElementsByTagName('li')[2].style.display = getStyleType('email');
        form.getElementsByTagName('li')[1].style.display = getStyleType('phone');
    };
    if (typeSelect.addEventListener) {
        typeSelect.addEventListener('change', toggleType);
    } else if (typeSelect.attachEvent)  {
        typeSelect.attachEvent('onchange', toggleType);
    }
}();