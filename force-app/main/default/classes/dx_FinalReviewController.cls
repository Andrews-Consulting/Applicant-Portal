public class dx_FinalReviewController {
    public dx_FinalReviewController() {
        
    }
    
    @AuraEnabled
    public static list<dx_ProgressAndReview_helper.SectionDetail> finalReviewProcess(Id ApplicationId) {
        dx_ProgressAndReview_helper prh = new dx_ProgressAndReview_helper(ApplicationId);
        list<dx_ProgressAndReview_helper.SectionDetail> status;
        status = prh.getDetail();
        //system.debug(status);
        //string sOut = JSON.serialize(status);
        //string sOut = 'Results of Review.';
        return status;
    }
}