({
	   CommitCheck: function(component){
        if (!$A.util.isEmpty(component.get("v.ShowCommit"))) {
            var commitflag = component.get("v.ShowCommit");
            if (!commitflag) {
                component.set("v.ShowCommit",true);
                alert('Press Confirm Changes or Next Button to apply the changes.');
            }
        }
    }
})