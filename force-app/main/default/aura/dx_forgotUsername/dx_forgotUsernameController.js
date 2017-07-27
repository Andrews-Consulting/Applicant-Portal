({
    handleForgotUsername: function (component, event, helpler) {
        helpler.handleForgotUsername(component, event, helpler);
    },
    onKeyUp: function(component, event, helpler){
    //checks for "enter" key
        if (event.getParam('keyCode')===13) {
            helpler.handleForgotUsername(component, event, helpler);
        }
    }
})