({
    doinit: function (cmp, event, helper) {
        var getFieldLabels = cmp.get("c.getFieldLabels");
        getFieldLabels.setCallback(this, function (response) {
			var state = response.getState();
			if (state === "SUCCESS") {
                cmp.set('v.fieldLabels', JSON.parse(response.getReturnValue() || '{}'));
			}
			else if (state === "ERROR") {
				var errors = response.getError();
				console.log("Error message: " + errors);
			}
		});
        var lstPackage = cmp.get("v.lstPackage");
        var lstPackage1 = cmp.get("v.lstPackage1");
        lstPackage.push({
            'sobjectType': 'Package__c',
            'Parcel_Name__c': '',
            'Parcel_Value__c': '',
            'Gross_Weight_Kg__c': '',
            'Quantity__c': '',
        });
        cmp.set("v.lstPackage", lstPackage);
        lstPackage1.push({
            'sobjectType': 'Package__c',
            'Parcel_Name__c': '',
            'Parcel_Value__c': '',
            'Gross_Weight_Kg__c': '',
            'Quantity__c': '',
        });
        cmp.set("v.lstPackage1", lstPackage1);
		$A.enqueueAction(getFieldLabels);

    },
    addRow: function (cmp, event, helper) {
        var selected = cmp.get("v.Record1");
        var lstPackage = cmp.get("v.lstPackage");
        var lstPackage1 = cmp.get("v.lstPackage1");
        if(selected == true){
            lstPackage.push({
                'sobjectType': 'Package__c',
                'Parcel_Name__c': '',
                'Parcel_Value__c': '',
                'Gross_Weight_Kg__c': '',
                'Quantity__c': '',
            });
            cmp.set("v.lstPackage", lstPackage);
        }else{
            lstPackage1.push({
                'sobjectType': 'Package__c',
                'Parcel_Name__c': '',
                'Parcel_Value__c': '',
                'Gross_Weight_Kg__c': '',
                'Quantity__c': '',
            });
            cmp.set("v.lstPackage1", lstPackage1);
        }
    },

    removeRecord: function (cmp, event, helper) {
        var selected = cmp.get("v.Record1");
        var lstPackage = cmp.get("v.lstPackage");
        var lstPackage1 = cmp.get("v.lstPackage1");
        var selectedItem = event.currentTarget;
        var selectedItem1 = event.currentTarget;
        var index = selectedItem.dataset.record;
        var index1 = selectedItem1.dataset.record;
        if(selected == true) {
            lstPackage.splice(index, 1);
            cmp.set("v.lstPackage", lstPackage);
        }else{
            lstPackage1.splice(index1, 1);
            cmp.set("v.lstPackage1", lstPackage1);
        }
    },

    saveRecords: function (cmp, event, helper) {
        var selected = cmp.get("v.Record1");
        console.log(selected);
        if(selected == true){
            var spinner = cmp.find("spinner");
            $A.util.toggleClass(spinner, "slds-hide");
            var Order = cmp.get("v.Order");
            Order.Sender_Name__c = cmp.find('uniqueLookupId').get('v.selectedRecordId');
            Order.Sender_City_Province__c = cmp.find('uniqueLookupId1').get('v.selectedRecordId');
            Order.Receiver_City_Province__c = cmp.find('uniqueLookupId2').get('v.selectedRecordId');
            Order.Sender_District__c = cmp.find('uniqueLookupId3').get('v.selectedRecordId');
            Order.Receiver_District__c = cmp.find('uniqueLookupId4').get('v.selectedRecordId');
            Order.Sender_Ward__c = cmp.find('uniqueLookupId5').get('v.selectedRecordId');
            Order.Receiver_Ward__c = cmp.find('uniqueLookupId6').get('v.selectedRecordId');
            console.log(JSON.stringify(Order));
            var action = cmp.get("c.savePackage");
            action.setParams({
                order: Order,
                lstPackage: cmp.get("v.lstPackage")
            });
            action.setCallback(this, function (response) {
                var state = response.getState();
                var toastEvent = $A.get("e.force:showToast");
                var url = '';
                console.log(state);
                if (state === "SUCCESS") {
                    var res = response.getReturnValue();
                    url = "https://afr-wms.lightning.force.com/lightning/r/F_TMS_SO__c/" + res + "/view";
                    // cmp.set("v.lstPackage", []);
                    // $A.util.toggleClass(spinner, "slds-hide");
                    toastEvent.setParams({
                        "type": 'success',
                        "title": "Success",
                        "message": 'Order and Package saved successfully'
                    });
                    toastEvent.fire();
                    console.log(url);
                    window.open(url, "_self");
                    // $A.enqueueAction(cmp.get('c.addRow'));
                    // $A.get("e.force:closeQuickAction").fire();
                    // $A.get('e.force:refreshView').fire();
                }
                else if (state === "ERROR") {
                    var errors = response.getError();
                    var error = event.getParams();
                    console.log("error: ", JSON.stringify(errors));
                    var toastEvent = $A.get("e.force:showToast");
                    if (errors) {
                            toastEvent.setParams({
                                "type": 'error',
                                "title": "Error",
                                "message": errors[0].pageErrors[0].message
                            });
                    }
                    $A.util.toggleClass(spinner, "slds-hide");
                    toastEvent.fire();
                }
            });
            $A.enqueueAction(action);
        // }
        }else if(selected == false){
            console.log(1234);
            var spinner = cmp.find("spinner");
            $A.util.toggleClass(spinner, "slds-hide");
            var Order1 = cmp.get("v.Order1");
            console.log(Order1);
            Order1.Sender_Name__c = cmp.find('uniqueLookupId7').get('v.selectedRecordId');
            Order1.Sender_City_Province__c = cmp.find('uniqueLookupId8').get('v.selectedRecordId');
            Order1.Receiver_City_Province__c = cmp.find('uniqueLookupId9').get('v.selectedRecordId');
            Order1.Sender_District__c = cmp.find('uniqueLookupId10').get('v.selectedRecordId');
            Order1.Receiver_District__c = cmp.find('uniqueLookupId11').get('v.selectedRecordId');
            Order1.Sender_Ward__c = cmp.find('uniqueLookupId12').get('v.selectedRecordId');
            Order1.Receiver_Ward__c = cmp.find('uniqueLookupId13').get('v.selectedRecordId');
            console.log(JSON.stringify(Order1));
            var action = cmp.get("c.savePackage");
            action.setParams({
                order: Order1,
                lstPackage: cmp.get("v.lstPackage1")
            });
            action.setCallback(this, function (response) {
                var state = response.getState();
                var toastEvent = $A.get("e.force:showToast");
                var url = '';
                console.log(state);
                if (state === "SUCCESS") {
                    var res = response.getReturnValue();
                    url = "https://afr-wms.lightning.force.com/lightning/r/F_TMS_SO__c/" + res + "/view";
                    // cmp.set("v.lstPackage", []);
                    // $A.util.toggleClass(spinner, "slds-hide");
                    toastEvent.setParams({
                        "type": 'success',
                        "title": "Success",
                        "message": 'Order and Package saved successfully'
                    });
                    toastEvent.fire();
                    console.log(url);
                    window.open(url, "_self");
                    // $A.enqueueAction(cmp.get('c.addRow'));
                    // $A.get("e.force:closeQuickAction").fire();
                    // $A.get('e.force:refreshView').fire();
                }
                else if (state === "ERROR") {
                    var errors = response.getError();
                    console.log("error: ", JSON.stringify(errors));
                    var toastEvent = $A.get("e.force:showToast");
                    if (errors) {
                            toastEvent.setParams({
                                "type": 'error',
                                "title": "Error",
                                "message": errors[0].pageErrors[0].message
                            });
                    }
                    $A.util.toggleClass(spinner, "slds-hide");
                    toastEvent.fire();
                }
            });
            $A.enqueueAction(action);
        }
        // if (helper.validateAccountRecords(cmp, event)) {
    },
    radioButtonAction: function (cmp, event) {
        var selected = event.getSource().get("v.text");
        console.log(selected);

        if (selected == 'Record1') {
            cmp.set('v.Record1', true);
        } else {
            cmp.set('v.Record1', false);
        }

        if (selected == 'Record2') {
            cmp.set('v.Record2', true);
            var Order1 = cmp.get("v.Order1");
            cmp.set("v.Order1", Order1);
        } else {
            cmp.set('v.Record2', false);
        }

        // cmp.find('field').forEach(function(f) {
        //     f.reset();
        // });
    },

    onToggleSpinner: function (cmp) {
        var spinner = cmp.find("spinner");
        $A.util.toggleClass(spinner, "slds-hide");
    },
    openflow: function(component, event, helper){
        // alert(component.get('v.testAttr'));
        const flow = component.find("flowData");
        flow.startFlow("Order_Screen_to_Create_Account");
    },
});