Images = new Mongo.Collection("images");
//the code for cfs
//var photosStore = new FS.Store.FileSystem('eventPhotos', {
//  path: 'uploads/'
//});
var photosStore = new FS.Store.GridFS("eventPhotos", {
//  transformWrite: myTransformWriteFunction, //optional
//  transformRead: myTransformReadFunction, //optional
//  maxTries: 1, // optional, default 5
//  chunkSize: 1024*1024  // optional, default GridFS chunk size in bytes (can be overridden per file).
                        // Default: 2MB. Reasonable range: 512KB - 4MB
      beforeWrite: function(fileObj) {
        // We return an object, which will change the
        // filename extension and type for this store only.
        return {
          extension: 'jpeg',
          type: 'image/jpeg'
        };
      },
      transformWrite: resizeImageStream({
        width: 200,
        height: 200,
        format: 'image/jpeg',
        quality: 50
      })
});
//Images = new FS.Collection("images", {
//  stores: [imageStore]
//});
eventPhotos = new FS.Collection('eventPhotos', {
  stores: [photosStore]
});

Images.allow({
	// we need to be able to update images
	update:function(userId, doc){
		if (Meteor.user()){// they are logged in
			return true;
		} else {// user not logged in - do not let them update  (rate) the image. 
			return false;
		}
	},
	insert:function(userId, doc){
		if (Meteor.user()){// they are logged in
			if (userId != doc.createdBy){// the user is messing about
				return false;
			}
			else {// the user is logged in, the image has the correct user id
				return true;
			}
		}
		else {// user not logged in
			return false;
		}
	}, 
	remove:function(userId, doc){
		return true;
	}
});

eventPhotos.allow({
  insert: function () {
		return true;
  },
  update: function () {
    return true;
  },
  remove: function () {
		return true;
  },
  download: function () {
    return true;
  }
});