({
    handleChangePassword: function (component, event, helpler) {
        helpler.handleChangePassword(component, event, helpler);
    },
    onKeyUp: function(component, event, helpler){
    //checks for "enter" key
        if (event.getParam('keyCode')===13) {
            helpler.handleChangePassword(component, event, helpler);
        }
    }
})