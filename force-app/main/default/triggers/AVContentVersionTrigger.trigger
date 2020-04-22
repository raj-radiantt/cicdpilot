/**************************************************************************************************************** 
Trigger Name : AVContentVersionTrigger Version : 1.0
Trigger on ContentVersion Object.
This After Insert trigger, triggers after the file is inserted. It calls the 'getFileScanResults' method from the
handler class 'SAVIFileScan' which sends the file for antivirus scanning to SAVI Service.
By: Subha Janarthanan(subha@radiantt.com)
******************************************************************************************************************/

trigger AVContentVersionTrigger on ContentVersion (after insert, after update) {
        system.debug('isRecursive::'+SAVIFileScan.isRecursive);
        if(trigger.isAfter && trigger.isInsert ){
                SAVIFileScan.isRecursive = false;
                SAVIFileScan.getFileScanResults(Trigger.newMap.keySet());                              
        } else if(trigger.isAfter && trigger.isUpdate && SAVIFileScan.isRecursive == true){
                        system.debug('Inside after update 1');
                if(!system.isFuture()){
                        system.debug('Inside after update 2');
                        SAVIFileScan.getFileScanResults(Trigger.newMap.keySet());
                }
        }
}
