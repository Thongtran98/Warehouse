trigger ScheduleTrigger on Schedules__c (before update, after update) {
    if(trigger.isAfter && trigger.isUpdate){
        ScheduleClass.checkAfterUpdate(trigger.new, trigger.oldMap);
    }
}