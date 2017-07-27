/**
 *  Provides data related BGBL letters to DRE
 */
public class DRELetterManager
{
    public static Id getLetterId(String letterName)
    {
        SObject letter = getLetter(letterName);
        return (letter != null) ? letter.Id : null;
    }
    
    public static String getLetterOutputType(String letterName)
    {
        SObject letter = getLetter(letterName);
        return (letter != null) ? (String)letter.get('BGBL__Output_Type_Short__c') : null;
    }
    
    /**
     *  child tables referenced in Applied Queries must be specified in Scope
     */
    public static String getChildrenIds(String letterName, DRE.DREResultContext rc)
    {
        String childIdsStr = null;
        SObject letter = getLetter(letterName);
        
        // if children are needed for the letter, get them from the filters
        if (letter.getSObjects('BGBL__Applied_Queries__r') != null)
        {
            for (SObject appliedQ : letter.getSObjects('BGBL__Applied_Queries__r'))
            {
                if ((Boolean)appliedQ.get('BGBL__Child_Iterate_Query__c'))
                {
                    String childName = (String)appliedQ.getSObject('BGBL__Query__r').get('BGBL__Object_Name__c');
                    
                    // add children Ids from Scope records
                    Id[] childIds = new Id[]{};
                    for (DRE.DREResultContext.ResultScopeVO rs : rc.getScopeRecords())
                    {
                        if (rs.getRecord().getSObjectType_Str() == childName)
                        {
                            childIds.add(rs.getRecord().getId());
                        }
                    }
                    
                    if (!childIds.isEmpty())
                    {
                        childIdsStr = '';
                        for (Id oid : childIds) childIdsStr += ',' + oid;
                        childIdsStr = childIdsStr.replaceFirst(',', '');
                    }
                    
                    break;
                }
            }
        }
        
        return childIdsStr;
    }
    
    public static SObject getLetter(String letterName)
    {
        SObject[] lettersByName = new SObject[]{};
        for (SObject letter : letters)
        {
            if (letter.get('Name') == letterName) lettersByName.add(letter);
        }
        
        if (lettersByName.size() > 1)
        {
            throw new LetterException('Duplicate Batch Letters called "' + letterName + '" were found.');
        }
        else if (lettersByName.size() == 0)
        {
            throw new LetterException('The Batch Letter "' + letterName + '" referenced in a DRE Rule could not be found.');
        }
        
        return lettersByName[0];
    }
    
    private static SObject[] letters
    {
        get
        {
            if (letters == null)
            {
                // get all letters using dynamic query in case letters package isn't installed
                letters = database.query('select Id, Name, BGBL__File_Name_Prefix__c, BGBL__Merge_Template__c, BGBL__Output_Type_Short__c, (select Id, BGBL__Child_Iterate_Query__c, BGBL__Query__r.BGBL__Object_Name__c from BGBL__Applied_Queries__r where BGBL__Child_Iterate_Query__c = true) from BGBL__Batch_Letter__c');
            }
            
            return letters;
        }
        set;
    }
    
    public class LetterException extends Exception {}
}