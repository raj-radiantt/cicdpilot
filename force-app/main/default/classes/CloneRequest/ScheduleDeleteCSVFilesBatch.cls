
global with sharing class ScheduleDeleteCSVFilesBatch implements Schedulable {
    global void execute(SchedulableContext context) {
        DeleteCSVFilesBatch batchObj = new DeleteCSVFilesBatch();
        ID batchprocessid = Database.executeBatch(batchObj, 2);  
    } 
}