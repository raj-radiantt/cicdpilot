public with sharing class OceanOrderedProperty{
    @AuraEnabled
    public Integer order { get; set; } 
    @AuraEnabled
    public String label { get; set; }
    @AuraEnabled
    public string value { get; set; } 

    public OceanOrderedProperty(integer order, String label, String value) {
        this.order = order;
        this.label = label;
        this.value = value;
    }

}

