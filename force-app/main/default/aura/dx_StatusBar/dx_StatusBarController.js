({
	doInit : function(component, event, helper) {
		//Build/Add the necessary items (dx_StatusBarEntry) to this component

		//BuildStatusBar(component);

	 $A.createComponent(
           	"c:dx_StatusBarEntry",
           	{
           		"status": "fauxStatus",
           		"title": "fauxTitle",
           		"navURL": "http://google.com",
              "aura:id" : "timtest"
           	},
        	function(newButton, status, errorMessage){
                //Add the new button to the body array
                if (status === "SUCCESS") {
                    var body = component.get("v.form");
                    body.push(newButton);
                    component.set("v.form", body);
                }
                else if (status === "INCOMPLETE") {
                    console.log("No response from server or client is offline.");
                    // Show offline error
                }
                else if (status === "ERROR") {
                    console.log("Error: " + errorMessage);
                    // Show error message
                }
            }
		);



	},

	BuildStatusBar: function(component) {
	        
        // clear any existing form out of the view
        console.log('Called BuildStatusBar');
        //component.set("v.statusBarEntries", []);
        //var newListOfEntries = component.get("v.statusBarEntries");

        // for (var i = 0; i < 5; i++) {
        // 	newListOfEntries.push(["c.dx_StatusBarEntry", {"status": "TestStatus", "title":"TestTitle" + i, "navURL": "http://testing"+i+".com"}]);                
    	// }

        // $A.createComponents(newListOfEntries, function(cmps) {	            
        //     component.set('v.statusBarEntries', cmps);	           
        // });

  //       $A.createComponent(
           
  //          	"c.dx_StatusBarEntry",
  //          	{
  //          		"status": "fauxStatus",
  //          		"title": "fauxTitle",
  //          		"navURL": "http://google.com"
  //          	},

  //       	function(newComp){
  //           	//if (status === "SUCCESS") {
  //             		var statusBar = component.get("v.form");
  //              		statusBar.push(newComp);
  //              		component.set("v.form", statusBar);
  //           	// }
  //           	// else if (status === "INCOMPLETE") {
  //            //    	console.log("No response from server or client is offline.")
  //           	// }
  //           	// else if (status === "ERROR") {
  //            //    	console.log("Error: " + errorMessage);
  //            //    }
  //  			}
		// );
	}
})