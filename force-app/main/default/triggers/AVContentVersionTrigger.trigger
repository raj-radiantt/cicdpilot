/**************************************************************************************************************** 
Trigger Name : AVContentVersionTrigger Version : 1.0
Trigger on ContentVersion Object.
This After Insert trigger, triggers after the file is inserted. It calls the 'getFileScanResults' method from the
handler class 'SAVIFileScan' which sends the file for antivirus scanning to SAVI Service.
By: Subha Janarthanan(subha@radiantt.com)
******************************************************************************************************************/

trigger AVContentVersionTrigger on ContentVersion (after insert, after update) {
        if(trigger.isAfter && trigger.isInsert ){
                SAVIFileScan.getFileScanResults(Trigger.newMap.keySet()); 
        }
        system.debug('isRecursive:::'+SAVIFileScan.isRecursive);

        if(trigger.isAfter && trigger.isUpdate && SAVIFileScan.isRecursive == true){
                SAVIFileScan.getFileScanResults(Trigger.newMap.keySet()); 
        }
}