global class DREAddLetterHandler implements DRE.DREInterface.IResultActionHandler
{
    public DRE.DREResultActionOutput execute(DRE.DREResultContext rc)
    {
        DRE.DREResultActionOutput result = new DRE.DREResultActionOutput();
        
        // create Batch Letter record
        SObject letter = Schema.getGlobalDescribe().get('bgbl__batch_letter_job__c').newSObject();
        letter.put('BGBL__Status__c', 'In Queue (verifying...)');
        letter.put('BGBL__Single_Letter_Job__c', true);
        
        // no objects are to be specified for Add Letter so just get the first Scope Record
        DRE.DREResultVO[] results = rc.getScopeRecords()[0].getResults();
        
        String letterName;
        String outputType;
        for (DRE.DREResultVO rvo : results)
        {
            Object value = rvo.getLiteralValue();
            if (rvo.getAttribute() == 'letterName') letterName = (String)value;
            else if (rvo.getAttribute() == 'letterOutputType') outputType = (String)value;
            else if (rvo.getAttribute() == 'letterParentId') letter.put('BGBL__Override_Parameters__c', 'WHERE Id=\'' + (String)value + '\'');
        }
        
        if (letterName == null) throw new DRELetterManager.LetterException('Action attribute Letter Name not specified');
        
        if (outputType == null) outputType = DRELetterManager.getLetterOutputType(letterName);
        Id letterId = DRELetterManager.getLetterId(letterName);
        String childIds = DRELetterManager.getChildrenIds(letterName, rc);
        
        letter.put('BGBL__Output_Type__c', outputType);
        letter.put('BGBL__Batch_Letter__c', letterId);
        letter.put('BGBL__Child_Iterate_Ids__c', childIds);
        letter.put('BGBL__HasChildIds__c', childIds != null);
        
        Set<String> fieldsChanged = new Set<String>{'BGBL__Batch_Letter__c', 'BGBL__Output_Type__c', 'BGBL__Status__c', 'BGBL__Single_Letter_Job__c', 'BGBL__Override_Parameters__c', 'BGBL__Child_Iterate_Ids__c', 'BGBL__HasChildIds__c'};
        result.addRecordForUpsert(DRE.DREObjectFactory.createObject(letter), fieldsChanged);
        
        return result;
    }
}