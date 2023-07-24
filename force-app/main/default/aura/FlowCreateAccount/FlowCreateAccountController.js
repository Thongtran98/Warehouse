({
    doInit : function(component, event, helper) {
        var getShowFlow = event.getParam("showFlow");
        console.log(getShowFlow);
        component.set("v.showFlow", getShowFlow);
        const flow = component.find("flowData");
        flow.startFlow("Order_Screen_to_Create_Account");
    }
})