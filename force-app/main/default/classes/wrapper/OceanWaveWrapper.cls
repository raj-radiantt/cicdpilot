public with sharing class OceanWaveWrapper {
        @AuraEnabled
        public string  id {get; set;}        
        @AuraEnabled
        public Boolean isActive {get; set;} 
        @AuraEnabled
        public Date waveenddate {get; set;}
        @AuraEnabled 
        public Date wavestartdate {get; set;}
        @AuraEnabled 
        public string cspoy {get; set;}
        @AuraEnabled 
        public Date oystartdate {get; set;}
        @AuraEnabled 
        public Date oyenddate {get; set;}
        @AuraEnabled 
        public Decimal oymonthsremaining {get; set;}
    }