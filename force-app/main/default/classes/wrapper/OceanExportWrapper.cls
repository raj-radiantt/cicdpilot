public with sharing virtual class OceanExportWrapper {
   @AuraEnabled 
   public String AppName { get; set; }
   @AuraEnabled 
   public String AppAcronym { get; set; }
   @AuraEnabled 
   public String AdoName { get; set; }
   @AuraEnabled 
   public String ProjectName { get; set; }
   @AuraEnabled 
   public String ProjectNumber { get; set; }
   @AuraEnabled  
   public String WaveName { get; set; }
   @AuraEnabled 
   public String OptionYear { get; set; }
   @AuraEnabled 
   public String OptionYearStartDate { get; set; }
   @AuraEnabled 
   public String OptionYearEndDate { get; set; }
   @AuraEnabled 
   public Decimal RemainingMonthsInOY { get; set; }
}
