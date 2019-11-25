trigger SAVI_FileUpload_Trigger on ContentVersion (before insert) {
List<ContentVersion> cvs = ( Trigger.new == null ? Trigger.old : Trigger.new );
    System.debug('$$$$$$$$$$$ Debugging in trigger ' + cvs);
    for(ContentVersion cv : cvs) {
        System.debug('$$$$$$$$$$$ ID Present ' + cv);
        if(cv.IsLatest){
            System.debug('$$$$$$$$$$$ Latest Version is ' + cv.Id);
            SAVI_Utils.CallSaviService(cv.Id);
        }
    }
}