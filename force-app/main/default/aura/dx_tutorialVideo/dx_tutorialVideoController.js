({
	playPause : function(component, event, helper) {
		var myVideo = component.find("video1");
		if (myVideo.paused) 
			myVideo.play(); 
		else 
			myVideo.pause();
		component.set(component.find("video1"),myVideo);
	}
})