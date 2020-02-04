public with sharing class OceanWaveWrapper {
        @AuraEnabled
        public string  id {get; set;}  
        @AuraEnabled
        public string  name {get; set;}        
        @AuraEnabled
        public Boolean isActive {get; set;} 
        @AuraEnabled
        public Date waveEndDate {get; set;}
        @AuraEnabled 
        public Date waveStartDate {get; set;}
        @AuraEnabled 
        public string cspOY {get; set;}
        @AuraEnabled 
        public Date oyStartDate {get; set;}
        @AuraEnabled 
        public Date oyEndDate {get; set;}
        @AuraEnabled 
        public Decimal oyMonthsRemaining {get; set;}
    }