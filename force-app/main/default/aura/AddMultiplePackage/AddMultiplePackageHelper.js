({
    validateAccountRecords: function(component, event) {
        var isValid = true;
        var Order = component.get("v.Order");
        var Order1 = component.get("v.Order1");
        var lstPackage = component.get("v.lstPackage");
        var selected = event.getSource().get("v.text");
        if(selected == 'Record1' && (Order.length == 0 || lstPackage.length == 0)){
            alert('NULL');
            isValid = false;
        }
        if(selected == 'Record2' && (Order1.length == 0 || lstPackage.length == 0)){
            alert('NULL');
            isValid = false;
        }   
        return isValid;
    },
    
})