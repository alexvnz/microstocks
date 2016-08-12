Meteor.subscribe("images");
Meteor.subscribe("eventPhotos"); 

/// routing 
Router.configure({
  layoutTemplate: 'ApplicationLayout'
});

var mustBeSignedIn = function(pause) {
  if (!(Meteor.user() || Meteor.loggingIn())) {
    this.next();
    Router.go('/');
  } else {
    this.next();
  }
};

Router.route('/', function () {
  this.render('navbar', {
    to:"navbar"
  });
  this.render('welcome', {
    to:"main"
  });
});

Router.route('/images', function () {
  this.render('navbar', {
    to:"navbar"
  });
  this.render('images', {
    to:"main"
  });
});

Router.route('/stock/:stockname', function () {
  this.render('navbar', {
    to:"navbar"
  });
  this.render('stock', {
    to:"main", 
    data:function(){
      var cols = Images.find({});
      var ind = 0;
      var n = this.params.stockname;
      var items = new Array;
      cols.forEach(function(a){
        var result = $.grep(a.stocks, function(e){ return e.name === n; });
        items[ind] = {
          id: a._id,
          img_src: a.img_src,
          img_alt: a.img_alt,
          status: result[0].value,
          downloads: result[0].downloads
        };
        ind++;
      });
      var dta = {
        stockname: this.params.stockname,
        images: items
      };
      return dta;
    }
  });
});

Router.route('/downloads', function () {
  this.render('navbar', {
    to:"navbar"
  });
  this.render('downloads', {
    to:"main"
  });
});

Router.route('/keywords', function () {
  this.render('navbar', {
    to:"navbar"
  });
  this.render('keywords', {
    to:"main"
  });
});

Router.route('/image/:_id', function () {
  this.render('navbar', {
    to:"navbar"
  });
  this.render('image', {
    to:"main", 
    data:function(){
      return Images.findOne({_id:this.params._id});
    }
  });
});

Router.onBeforeAction(mustBeSignedIn, {except: ['/']});

/// accounts config
Accounts.ui.config({
  passwordSignupFields: "USERNAME_AND_EMAIL"
});

Template.stock.helpers({
  totalNotUploaded:function(){
    var t = this.images;
    var sum = 0;
    for (var i=0; i<t.length; i++){
      if (t[i].status == "0") sum++;
    }
    return sum;
  },
  totalApproved:function(){
    var t = this.images;
    var sum = 0;
    for (var i=0; i<t.length; i++){
      if (t[i].status == "3") sum++;
    }
    return sum;
  },
  totalNotApproved:function(){
    var t = this.images;
    var sum = 0;
    for (var i=0; i<t.length; i++){
      if (t[i].status == "2") sum++;
    }
    return sum;
  },
  totalUploaded:function(){
    var t = this.images;
    var sum = 0;
    for (var i=0; i<t.length; i++){
      if (t[i].status == "1") sum++;
    }
    return sum;
  },
});

Template.keywords.helpers({
  isOrderedU:function(){
    return false;
  },
  isOrderedD:function(){
    return false;
  },
  isOrderedC:function(){
    return false;
  },
  keys:function(){
    var imgs = Images.find().fetch();
    var keys = [];
    var usage = [];
    var downloads = [];
    for (var i=0; i<imgs.length; i++){
      var desc = imgs[i].desc;
      var arr = desc.split(',');
      for (var j=0; j<arr.length; j++){
        var trimmed = arr[j].replace(/^\s+|\s+$/g, '');
        if (keys.indexOf(trimmed)>-1){
          usage[keys.indexOf(trimmed)]++;
          downloads[keys.indexOf(trimmed)] += imgs[i].total;
        }else{
          keys.push(trimmed);
          usage.push(1);
          downloads.push(imgs[i].total);
        }
      }
    }
    var keywords = [];
    for (var i=0; i<keys.length; i++){
      var obj = {};
      obj.key = keys[i];
      obj.usage = usage[i];
      obj.downloads = downloads[i];
      obj.coeff = parseInt(downloads[i]/usage[i]*1000)/1000;
      keywords.push(obj);
    }
    var uOrder = Session.get("orderByU");
    var dOrder = Session.get("orderByD");
    var cOrder = Session.get("orderByC");
    if (uOrder == 1) {
      keywords.sort(function(a,b){return b.usage-a.usage;});
    }
    if (uOrder == -1) {
      keywords.sort(function(a,b){return a.usage-b.usage;});
    }
    if (dOrder == 1) {
      keywords.sort(function(a,b){return b.downloads-a.downloads;});
    }
    if (dOrder == -1) {
      keywords.sort(function(a,b){return a.downloads-b.downloads;});
    }
    if (cOrder == 1) {
      keywords.sort(function(a,b){return b.coeff-a.coeff;});
    }
    if (cOrder == -1) {
      keywords.sort(function(a,b){return a.coeff-b.coeff;});
    }
    return keywords;
  }
})

Template.images.helpers({
  stocks:function(){
    var stck = Images.findOne();
    return stck.stocks;
  },
  imageUploaded:function(value){
    if (value == '3'){
      return true;
    }
  },
  imagesExist:function(value){
    var stck = Images.find().count();
    if (stck == 0){
      return false;
    }
    return true;
  },
  images:function(){
    var uFilter = Session.get("userFilter");
    if (uFilter){// they set a filter!
      if (uFilter == 'filter1'){
         if (Session.get("orderByDate")){
           return Images.find({ "stocks.value" : '2'}, {sort:{createdOn: 1}});
         }else{
           if (Session.get("orderByDownloads")){
             return Images.find({ "stocks.value" : '2'}, {sort:{total: Session.get("orderByDownloads")}});
           } else {
             return Images.find({ "stocks.value" : '2'}, {sort:{createdOn: -1}});
           }
         }
      }
      if (uFilter == 'filter2'){
         if (Session.get("orderByDate")){
           return Images.find({ "stocks.value" : '0'}, {sort:{createdOn: 1}});
         }else{
           if (Session.get("orderByDownloads")){
             return Images.find({ "stocks.value" : '0'}, {sort:{total: Session.get("orderByDownloads")}});
           } else {
             return Images.find({ "stocks.value" : '0'}, {sort:{createdOn: -1}});
           }
         }
      }
      if (uFilter == 'filter3'){
         if (Session.get("orderByDate")){
           return Images.find({ "stocks.downloads" : {"$gt":'0'}}, {sort:{createdOn: 1}});
         }else{
           if (Session.get("orderByDownloads")){
             return Images.find({ "stocks.downloads" : {"$gt":'0'}}, {sort:{total: Session.get("orderByDownloads")}});
           } else {
             return Images.find({ "stocks.downloads" : {"$gt":'0'}}, {sort:{createdOn: -1}});
           }
         }
      }
    }
    else {
       if (Session.get("orderByDate")){
        return Images.find({}, {sort:{createdOn: 1}});
       }else{
         if (Session.get("orderByDownloads")){
           return Images.find({}, {sort:{total: Session.get("orderByDownloads")}});
         } else {
          return Images.find({}, {sort:{createdOn: -1}});
        }
       }
    }
  },
  formatDate: function(timestamp) {
    return moment(timestamp).format("DD-MM-YYYY");
  },
  filtering_images:function(){
    if (Session.get("userFilter")){// they set a filter!
      return true;
    } 
    else {
      return false;
    }
  },
  showDs: function(){
    if (Session.get("showds")){
      return true;
    } 
    else {
      return false;
    }
  },
  headers: function(){
    var hdrs;
    if (Session.get("userLang") == 1){
      hdrs ={
        addimage: "добавить иллюстрацию",
        addstock: "добавить сток",
        downloads: "показать скачивания",
        hidedownloads: "спрятать скачивания",
        filter0: "отобразить все",
        filter1: "только не принятые",
        filter2: "только не выложенные",
        filter3: "только скачанные",
        image: "Иллюстрация",
        name: "Имя",
        date: "Дата",
        ds: "Скачивания",
        desc: "Ключевые слова"
      };
    }else{
      hdrs ={
        addimage: "add image",
        addstock: "add stock",
        downloads: "show downloads",
        hidedownloads: "hide downloads",
        filter0: "show all images",
        filter1: "show not approved",
        filter2: "show not uploaded",
        filter3: "show downloaded",
        image: "Image",
        name: "Name",
        date: "Date",
        ds: "Downloads",
        desc: "Keywords"
      };
    }
    return hdrs;
  },
  getFilter:function(){
    if (Session.get("userFilter")){// they set a filter!
      if (Session.get("userFilter") == 'filter1'){
        if (Session.get("userLang") == 1){
         return 'Непринятые иллюстрации';
        }else{
         return 'Showing not approved images';
        }
      }
      if (Session.get("userFilter") == 'filter2'){
        if (Session.get("userLang") == 1){
         return 'Невыложенные иллюстрации';
        }else{
         return 'Showing not uploaded images';
        }
      }
      if (Session.get("userFilter") == 'filter3'){
        if (Session.get("userLang") == 1){
         return 'Скачанные иллюстрации';
        }else{
         return 'Showing downloaded images';
        }
      }
//      var user = Meteor.users.findOne(
//        {_id:Session.get("userFilter")});
//      return user.username;
    } 
    else {
      return false;
    }
  },
  isOrdered:function(){
   if (Session.get("orderByDate")){
     return true;
   }else{
     return false;
   }
  },
  isOrderedD:function(){
   if (Session.get("orderByDownloads") == 1){
     return true;
   }else{
     return false;
   }
  }
});

Template.state.helpers({
  isBlack: function (number) {
    return number == 0;
  },
  isBlue: function (number) {
    return number == 1;
  },
  isRed: function (number) {
    return number == 2;
  },
  isGreen: function (number) {
    return number == 3;
  },
  states: function(){
    var hdrs;
    if (Session.get("userLang") == 1){
      hdrs ={
        state0: "Не выложен",
        state1: "Ожидает",
        state2: "Не принят",
        state3: "Принят"
      };
    }else{
      hdrs ={
        state0: "Not uploaded",
        state1: "Uploaded",
        state2: "Not approved",
        state3: "Approved"
      };
    }
    return hdrs;
  },
});

Template.body.helpers({
	username:function(){
    if (Meteor.user()){
		return Meteor.user().username;
    }
    else {
		return "anonymous internet user";
    }
  }
});

Template.image_add_form.helpers({
  header: function(){
    var hdrs;
    if (Session.get("userLang") == 1){
      hdrs ={
        hdr: "Добавить иллюстрацию",
        image: "Иллюстрация",
        name: "Имя",
        desc: "Ключевые слова",
        image0: "url",
        name0: "имя файла",
        desc0: "Ключевые слова"
      };
    }else{
      hdrs ={
        hdr: "Add image",
        image: "Image",
        name: "Name",
        desc: "Description",
        image0: "url",
        name0: "image name",
        desc0: "Describe the image here"
      };
    }
    return hdrs;
  },
  uploadedImage: function(){
    if (Session.get('uploadedFile')){
      var image_id = Session.get('uploadedFile');
      return eventPhotos.findOne({_id:image_id});
    }
  },
  uploadStart: function(){
    if (Session.get('uploadedFile')){
      return true;
    }
    return false;
  }
// the code for tomi:upload-server
//  myCallbacks: function() {
//    return {
//        finished: function(index, fileInfo, context) {
//          console.log(fileInfo);
//          $('#img_src').val(fileInfo.name);
//        }
//    };
//  }
  });

Template.stock_add_form.helpers({
  header: function(){
    var hdrs;
    if (Session.get("userLang") == 1){
      hdrs ={
        hdr: "Добавить сток",
        name: "Имя",
        name0: "Введите имя стока"
      };
    }else{
      hdrs ={
        hdr: "Add stock",
        name: "Name",
        name0: "Enter stock name"
      };
    }
    return hdrs;
  },
});

Template.image_rem_confirm.helpers({
  confirm: function(){
    if (Session.get("userLang") == 1){
      return "Удалить этот файл из списка? (потом нельзя восстановить)";
    }else{
      return "Would you like remove this image permamently?";
    }
  }
});

Template.image.helpers({
  imageUploaded:function(stck){
    var image_id = this._id;
    var imgg = Images.findOne({_id:image_id});
    var stcks = imgg.stocks;
    for (var i=0; i<stcks.length; i++){
      if (stcks[i].name == stck && stcks[i].value == '3'){
        return true;
      }
    }
    return false;
  },
  header: function(){
    var hdrs;
    if (Session.get("userLang") == 1){
      hdrs ={
        hdr: "Редактировать иллюстрацию",
        image: "удалить",
        save: "сохранить",
        name: "Имя",
        desc: "Ключевые слова"
      };
    }else{
      hdrs ={
        hdr: "Edit image",
        image: "remove",
        save: "save",
        name: "Name",
        desc: "Description"
      };
    }
    return hdrs;
  }
});

Template.welcome.helpers({
	username: function(){
	if (Meteor.user()) {
			return Meteor.user().username;
		}else {
			return undefined;
		}
	},
	header:function(){
	  if (Session.get('userLang')==1){
	    return 'Статистика стоков';
	  }else{
	    return 'Stock sites statistics';
	  }
	},
    showEnter:function(){
		if (Meteor.user()) {
			return true;
		}else {
			return false;
		}
    }
});

Template.welcome.onRendered(function(){
  $('body').css('background-image','url(/bg.jpg)');
});

Template.images.onRendered(function(){
  $('body').css('background-image','');
});

Template.image.onRendered(function(){
  $('body').css('background-image','');
});

Template.uploadForm.helpers({

});

//the code for cfs
Template.uploadForm.events({
  'click input[type="submit"]': function () {
    var file = $('#file').get(0).files[0];
    var fileObj = eventPhotos.insert(file);
    console.log('Upload result: ', fileObj);
    Session.set('uploadedFile',fileObj._id);
  }
});

Template.images.events({
  'shown.bs.modal #image_add_form': function(e){
    Session.set('uploadedFile',undefined);
    $('input[type=file]').val('');
    $('.upl').empty();
    $('.upl').append('<input type="file" id="file">');
    $('input[type=file]').bootstrapFileInput();
  },
  'hidden.bs.modal #image_add_form': function(e){
    $('input[type=file]').val('');
  },
  'click .js-image':function(event){
      $(event.target).css("width", "50px");
  }, 
  'click .js-show-image-form':function(event){
    $("#image_add_form").modal('show');
  },
  'click .js-show-stock-form':function(event){
    $("#stock_add_form").modal('show');
  },
  'click .js-filter1':function(event){
    Session.set("userFilter", 'filter1');
  },
  'click .js-filter2':function(event){
    Session.set("userFilter", 'filter2');
  }, 
  'click .js-filter3':function(event){
    Session.set("userFilter", 'filter3');
  }, 
  'click .js-unset-image-filter':function(event){
    Session.set("userFilter", undefined);
  },
  'click .orderByDate':function(event){
      if (Session.get("orderByDate")){
        Session.set("orderByDate", 0);
      }else{
        Session.set("orderByDownloads", 0);
        Session.set("orderByDate", 1);
      }
  },
  'click .orderByDownloads':function(event){
      if (Session.get("orderByDownloads") == -1){
        Session.set("orderByDate", 0);
        Session.set("orderByDownloads", 1);
      }else{
        Session.set("orderByDate", 0);
        Session.set("orderByDownloads", -1);
      }
  },
  'click .js-show-downloads':function(event){
      if (Session.get("showds")){
        Session.set("orderByDownloads", 0);
        Session.set("showds", 0);
      }else{
        Session.set("showds", 1);
      }
  },
});

Template.keywords.events({
  'click .orderByUsage':function(event){
      if (Session.get("orderByU") == 1){
        Session.set("orderByU", -1);
        Session.set("orderByD", 0);
        Session.set("orderByC", 0);
      } else {
        Session.set("orderByU", 1);
        Session.set("orderByD", 0);
        Session.set("orderByC", 0);
      }
  },
  'click .orderByDownloads':function(event){
      if (Session.get("orderByD") == 1){
        Session.set("orderByD", -1);
        Session.set("orderByU", 0);
        Session.set("orderByC", 0);
      } else {
        Session.set("orderByD", 1);
        Session.set("orderByU", 0);
        Session.set("orderByC", 0);
      }
  },
  'click .orderByCoeff':function(event){
      if (Session.get("orderByC") == 1){
        Session.set("orderByC", -1);
        Session.set("orderByD", 0);
        Session.set("orderByU", 0);
      } else {
        Session.set("orderByC", 1);
        Session.set("orderByD", 0);
        Session.set("orderByU", 0);
      }
  },
});

Template.navbar.events({
  'click #gb':function(event, template){
      Session.set("userLang", 0);
      template.$('#gb').addClass('active');
      template.$('#ua').removeClass('active');
  },
  'click #ua':function(event, template){
      Session.set("userLang", 1);
      template.$('#ua').addClass('active');
      template.$('#gb').removeClass('active');
  },
});

Template.state.events({
  'click .js-state':function(event){
    var stockname = this.stock;
    var set = Images.findOne({_id:this.cid});
    var setst = set.stocks;
    var state_id = event.target.id;
    for (var i=0;i<setst.length;i++){
      if (setst[i].name == stockname){
        setst[i].value = state_id;
      }
    }
    var sett = {};
    sett['stocks'] = setst;
//    console.log(sett);
    Images.update({_id:this.cid}, {$set: sett});
  }
});

Template.image_rem_confirm.events({
  'click .js-del-image':function(event){
    Session.set("remove","remove");
    $("#image_rem_confirm").modal('hide');
   return false;
  },
});

Template.image_add_form.events({
  'submit .js-add-image':function(event){
    var stocks, img_id, img_src, img_alt, description;
      img_id = event.target.img_id.value;
      img_src = event.target.img_src.value;
      img_alt = event.target.img_alt.value;
      description = event.target.desc.value;
      if (Images.find().count() == 0){
        stocks = [ 
          {'name':'Fotolia', 'value':'0', 'downloads':'0'}
        ];
      }else{
        var immg = Images.findOne();
        stocks = immg.stocks;
        for (var i=0;i<stocks.length;i++){
          stocks[i].value = '0';
          stocks[i].downloads = '0';
        }
    //    console.log(sett);
      }
      if (Meteor.user()){
        Images.insert({
          img_id:img_id, 
          img_src:img_src, 
          img_alt:img_alt, 
          desc:description,
          stocks:stocks,
          total:0,
          createdOn:new Date(),
          createdBy:Meteor.user()._id
        });
      }
      Session.set('uploadedFile',undefined);
      event.target.img_src.value = '';
      event.target.img_alt.value = '';
      event.target.desc.value = '';
      $("#image_add_form").modal('hide');
   return false;
  }
});

Template.stock_add_form.events({
  'submit .js-add-stock':function(event){
    var st_name, newstock;
      st_name = event.target.st_name.value;
      newstock = {'name':st_name, 'value':'0'};
      var ids = Images.find({}).fetch().map(function(image) { 
          return image._id;
      }); 
    if (Images.find().count() != 0){
        if (Meteor.user()){
          for (var i=0; i<ids.length;i++){
            Images.update({'_id':ids[i]}, {$addToSet:{'stocks': newstock}});
          }
        }
      }
      event.target.st_name.value = '';
      $("#stock_add_form").modal('hide');
    return false;
  }
});

Template.image.events({
  'submit .js-edit-image':function(event){
    var img_alt, description;
      var imageid = this._id;
      img_alt = event.target.img_alt.value;
      description = event.target.desc.value;
      var thisimg = Images.findOne({_id:imageid});
      var stcks = thisimg.stocks;
      var totals = 0;
      for (var i=0;i<stcks.length;i++){
        if (stcks[i].value == '3'){
          stcks[i].downloads = $("#"+stcks[i].name).val();
          totals += parseInt(stcks[i].downloads);
        }
      }
      if (Meteor.user()){
        Images.update({_id:imageid}, {$set: {
          img_alt:img_alt,
          desc:description,
          stocks:stcks,
          total:totals
        }});
      }
    Router.go('/images');
    return false;
  },
  'click .js-del-image':function(event){
    var imageid = this._id;
    Session.set("imageRemove", imageid);
    Session.set("remove",undefined);
    $("#image_rem_confirm").modal('show');
     // use jquery to hide the image component
     // then remove it at the end of the animation
//     $("#"+image_id).hide('slow', function(){
//      Images.remove({"_id":image_id});
//     }) 
  },
  'hidden.bs.modal #image_rem_confirm': function(e){
    var image_id = Session.get("imageRemove");
    var checkRemove = Session.get("remove");
    if (checkRemove == "remove"){
      Router.go('/images');
//        console.log($("#"+image_id));
//      $("#"+image_id).hide('slow', function(){
        var immg = Images.findOne({_id:image_id});
        var photo_id = immg.img_id;
        Images.remove({"_id":image_id});
        eventPhotos.remove({"_id":photo_id});
//      });
    }
  },
});