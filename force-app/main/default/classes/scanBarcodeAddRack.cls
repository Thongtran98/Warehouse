public with sharing class scanBarcodeAddRack {
    @AuraEnabled(cacheable=true)
    public static F_TMS_SO__c  findRecord(String id) {
        F_TMS_SO__c ship = [SELECT Id, 
        Name,
        Status__c,
        Warehouse__c,
        Warehouse__r.Name,
        Parcel_name__c,
        Gross_Weight__c,
        Measurement_Total_CBM__c,
        Warehouse_Location__c,
        Warehouse_Location__r.Name,
        Truck__c,
        Truck__r.Name,
        Schedule_ID__c,
        Schedule_ID__r.RecordType.Name,
        Schedule_ID__r.Order_Record_Type__c,
        Schedule_ID__r.RecordTypeId,
        Schedule_ID__r.Schedule_Status__c,
        Schedule_Record_Type_Text__c,
        Schedulestatus__c,
        Schedule_Record_Type__c,
        Receiver_Name__c,
        Parcel_category__c,
        RecordType.Name,
        Number_of_package__c,
        Shipper__c,
        Shipper__r.Name,
        Schedule_ID__r.Destination_Warehouse__c,
        Destination_Warehouse__c

        FROM F_TMS_SO__c WHERE M_v_n_n__c =: id];
        // acc.AnnualRevenue = 5555;
        // update acc;
        return ship;
    }

    @AuraEnabled(cacheable=true)
    public static Package__c  findRecordPackage(String id) {
        Package__c pack = [SELECT Id, 
        Name,
        PackageStatus__c,
        Warehouse__c,
        Warehouse__r.Name,
        WarehouseLocation__c,
        WarehouseLocation__r.Name,
        Schedules__c,
        Schedules__r.RecordType.Name,
        Schedules__r.Order_Record_Type__c,
        Schedules__r.RecordTypeId,
        Schedules__r.Schedule_Status__c,
        Schedules__r.Destination_Warehouse__c,
        StorageRack__c

        FROM Package__c WHERE MaVanDon__c =: id];
        // acc.AnnualRevenue = 5555;
        // update acc;
        return pack;
    }

    @AuraEnabled(cacheable=true)
    public static List<F_TMS_SO__c> findRecordList(List<String> ids) {
        List<F_TMS_SO__c> ship = [SELECT Id, 
        Name,
        Status__c,
        Warehouse__c,
        Warehouse__r.Name,
        Parcel_name__c,
        Gross_Weight__c,
        Measurement_Total_CBM__c,
        Warehouse_Location__c,
        Warehouse_Location__r.Name,
        Truck__c,
        Truck__r.Name,
        Schedule_ID__c,
        Schedule_ID__r.RecordType.Name,
        Schedule_ID__r.Order_Record_Type__c,
        Schedule_ID__r.RecordTypeId,
        Schedule_ID__r.Schedule_Status__c,
        Schedule_Record_Type_Text__c,
        Schedulestatus__c,
        Schedule_Record_Type__c,
        Receiver_Name__c,
        Parcel_category__c,
        RecordType.Name,
        Number_of_package__c,
        Shipper__c,
        ShipperContact__c,
        ShipperContact__r.Name,
        Shipper__r.Name,
        Schedule_ID__r.Destination_Warehouse__c,
        Destination_Warehouse__c

        FROM F_TMS_SO__c WHERE M_v_n_n__c IN :ids];
        // acc.AnnualRevenue = 5555;
        // update acc;
        return ship;
    }

    @AuraEnabled(cacheable=true)
    public static List<Package__c> findRecordListPackage(List<String> ids) {
        List<Package__c> pack = [SELECT Id, 
        Name,
        PackageStatus__c,
        Warehouse__c,
        Warehouse__r.Name,
        WarehouseLocation__c,
        WarehouseLocation__r.Name,
        Schedules__c,
        Schedules__r.RecordType.Name,
        Schedules__r.Order_Record_Type__c,
        Schedules__r.RecordTypeId,
        Schedules__r.Schedule_Status__c,
        Schedules__r.Destination_Warehouse__c,
        StorageRack__c

        FROM Package__c WHERE MaVanDon__c IN :ids];
        // acc.AnnualRevenue = 5555;
        // update acc;
        return pack;
    }

    @AuraEnabled(cacheable=true)
    public static List<Warehouse__c>  findWarehouse() {
        // List<Warehouse__c> warehouse = [SELECT Id, Name FROM Warehouse__c];
        return [SELECT Id, Name FROM Warehouse__c];
    }
    @AuraEnabled(cacheable=true)
    public static List<Package__c>  findPackage(String idd) {
        // List<Warehouse__c> warehouse = [SELECT Id, Name FROM Warehouse__c];
        return [SELECT Id, Name,WarehouseLocation__c FROM Package__c WHERE Id =: idd];
    }
    @AuraEnabled(cacheable=true)
    public static List<StorageRack__c>  findWarehouseLocation(String warehouse) {
        
        return [SELECT Id, Name FROM StorageRack__c WHERE WarehouseLocation__c = : warehouse];
    }
    @AuraEnabled(cacheable=true)
    public static StorageRack__c  findStorageRack(String rackId) {
        
        return [SELECT Id, Name,WarehouseLocation__c FROM StorageRack__c WHERE Id = : rackId];
    }
    @AuraEnabled(cacheable=true)
    public static Warehouse_Location__c  findWarehouseLocationByNameAndWH(String warehouse, String name) {
        // List<Warehouse__c> warehouse = [SELECT Id, Name FROM Warehouse__c];
        return [SELECT Id, Name FROM Warehouse_Location__c WHERE Warehouse_Name__c = :warehouse AND Name = :name];
    }
    // @AuraEnabled(cacheable=true)
    // public static void insertInventory(String id,String warehouse, String parcel){
    //     F_TMS_SO__c ship = [SELECT 
    //     Id, 
    //     Name,
    //     Status__c,
    //     Warehouse__c,
    //     Warehouse_Location__c,
    //     Parcel_name__c,
    //     Number_of_package__c,
    //     Gross_Weight__c,
    //     Measurement_Total_CBM__c,
    //     Truck__c
    //     FROM F_TMS_SO__c WHERE Id =: id];

    //     Inventory_Item__c inven = new Inventory_Item__c();
    //     inven.Warehouse_Destination__c = warehouse;
    //     inven.Parcel_name__c = parcel;
    //     // inven.F_TMS_SO__c = ship.Name;
    //     // inven.Parcel_Name__c = ship.Parcel_name__c;
    //     // inven.Gross_weight_kg__c = ship.Gross_Weight__c;
    //     // inven.Measurement_Total_CBM__c = ship.Measurement_Total_CBM__c;

    //     insert inven;
    // }
}