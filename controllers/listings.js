const listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res, next) => {
   const allListings = await listing.find({});
   res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = async (req, res, next) => {
   res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res, next) => {
   let { id } = req.params;
   const list = await listing.findById(id)
      .populate({
         path: "reviews",
         populate: {
            path: "author",
         },
      })
      .populate("owner");
   if (!list) {
      req.flash("error", "Listing You Requested for does not exist!");
      res.redirect("/listings");
   }
   res.render("listings/show.ejs", { list });
};

module.exports.createListing = async (req, res, next) => {
   let response= await geocodingClient.forwardGeocode({
      query: req.body.listing.location,
      limit: 2
   })
      .send();
   let url = req.file.path;
   let filename = req.file.filename;
   const newlist = new listing(req.body.listing);
   newlist.owner = req.user._id;
   newlist.image = { url, filename };
   newlist.geometry= response.body.features[0].geometry;
   let savedListing=await newlist.save();
   console.log(savedListing);
   req.flash("success", "New Listing Created!");
   res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res, next) => {
   let { id } = req.params;
   const list = await listing.findById(id);
   if (!list) {
      req.flash("error", "Listing You Requested for does not exist!");
      res.redirect("/listings");
   }
   let originalImageUrl = list.image.url;
   originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
   console.log(originalImageUrl);
   res.render("listings/edit.ejs", { list, originalImageUrl });
};

module.exports.updateListing = async (req, res, next) => {
   let { id } = req.params;
   let Listing = await listing.findByIdAndUpdate(id, { ...req.body.listing });
   if (typeof req.file != "undefined") {
      let url = req.file.path;
      let filename = req.file.filename;
      Listing.image = { url, filename };
      await Listing.save();
   }
   req.flash("success", "Listing Updated!");
   res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res, next) => {
   let { id } = req.params;
   let deletedlist = await listing.findByIdAndDelete(id);
   req.flash("success", "Listing Deleted!");
   res.redirect("/listings");
};