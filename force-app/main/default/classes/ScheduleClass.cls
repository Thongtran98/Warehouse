public with sharing class ScheduleClass {
    public static void checkAfterUpdate(List<Schedules__c> lstnewSchedules, Map<Id,Schedules__c> MapoldSchedules) {
        // for (Schedules__c schedule : lstnewSchedules) {
        //     if(schedule.RecordTypeId != MapoldSchedules.get(schedule.Id).RecordTypeId){
        //         // so.Schedule_Record_Type_Text__c = so.Schedule_Record_Type__c;
        //         String RecordTypeName = [Select id, Name From RecordType Where Id =: schedule.RecordTypeId].Name;
        //         List<F_TMS_SO__c> so = [Select Id, Schedule_Record_Type_Text__c From F_TMS_SO__c Where Schedule_ID__c =: schedule.Id];
        //         System.debug('123 :'+so);
        //         for(F_TMS_SO__c ship : so){
        //             ship.Schedule_Record_Type_Text__c = RecordTypeName;
        //             System.debug('1234 :'+ship.Schedule_Record_Type_Text__c);

        //         }
        //         update so;
        //     }
        // }
    }
}