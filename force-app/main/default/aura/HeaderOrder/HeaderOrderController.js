({
    openFlow : function(cmp, event, helper){
        console.log('START');
        var showFlow = cmp.get('v.checkPoint');
        if(showFlow == false){
            cmp.set('v.checkPoint', true);
        }else{
            cmp.set('v.checkPoint', false);
        }
        console.log(cmp.get('v.checkPoint'));
        var appEvent = $A.get("e.c:FlowEvent");
        appEvent.setParams({
            "showFlow" : cmp.get('v.checkPoint')
        }); 
        appEvent.fire();

    }
})