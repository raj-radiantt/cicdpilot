
global class Ec2PricingBatchScheduler implements Schedulable {
    global void execute(SchedulableContext context) {
        Ec2PricingBatch batchObj = new Ec2PricingBatch ();
        ID batchprocessid = Database.executeBatch(batchObj, 2);  
    } 
}

