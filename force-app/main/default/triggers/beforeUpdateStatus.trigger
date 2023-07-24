trigger beforeUpdateStatus on F_TMS_SO__c (before insert, before update, after update) {
    if(trigger.isBefore && trigger.isUpdate){
        UpdateStatusHepper.checkUpdateStatusHepper(trigger.new, trigger.oldMap);
    }
    // for(F_TMS_SO__c so : Trigger.new){
    //     F_TMS_SO__c soo = Trigger.oldMap.get(so.Id);
    //     if(so.Schedule_Record_Type__c != soo.Schedule_Record_Type__c){
    //         so.Schedule_Record_Type_Text__c = so.Schedule_Record_Type__c;
    //     }
    //     else{
    //         so.Schedule_Record_Type_Text__c = soo.Schedule_Record_Type_Text__c;
    //     }
    // }
}   