Meteor.publish("images", function () {
    return Images.find({ createdBy: this.userId });
});

Meteor.publish("eventPhotos", function () {
    return eventPhotos.find({});
});

Meteor.startup(function () {
// code to run on server at startup

// the code for tomi:upload-server plugin
//  UploadServer.init({
//    tmpDir: process.env.PWD + './uploads/tmp',
//    uploadDir: process.env.PWD + './uploads',
//    checkCreateDirectories: true //create the directories for you
//  });
if (Images.find().count() == 0){
    	// count the images!
    	console.log("startup.js says: "+Images.find().count());
    }// end of if have no images
});