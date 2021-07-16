//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://Gowtham:Gowtham@cluster0.jhkxu.mongodb.net/todolistDB",{ useNewUrlParser: true,useUnifiedTopology: true });

const itemsSchema={
  name:String
};
const Item=mongoose.model("Item",itemsSchema);

const item1 =new Item({
  name:"Welcome to your todolist"
});
const item2 =new Item({
  name:"Hit + to add new item"
});
const item3 =new Item({
  name:"Hit - to delete an item"
});
const defaultItems=[item1,item2,item3];

const listSchema={
  name:String,
  items:[itemsSchema]
};
const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {

 Item.find({},function(err,foundItems){
  if(foundItems.length===0){

    Item.insertMany(defaultItems,function(err){
      if(err){
        console.log("error");
      }
      else{
        console.log("Saved default items");
      }
    });
    res.redirect("/");
  }else{
     res.render("list", {listTitle: "Today", newListItems: foundItems});
  }

 });




});
app.get("/:customlistName",function(req,res){
  const customListName=_.capitalize(req.params.customlistName);
  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
      //Create a new liste
      const list=new List({
        name:customListName,
        items:defaultItems
      });
      list.save();
      res.redirect("/"+customListName);
      }
      else{
    //Show an existing list
    res.render("List",{listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });

});
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
  const item=new Item({
    name:itemName
  });
  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }


});
app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today"){
    Item.deleteOne({_id:checkedItemId},function(err){
    if(!err){
      console.log("Successfully deleted item");
      res.redirect("/");
    }
  });
}else{
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
    if(!err){
      res.redirect("/"+listName);
    }
  });
}


});

app.get("/about", function(req, res){
  res.render("about");
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);

app.listen(port, function() {
  console.log("Server has started");
});
