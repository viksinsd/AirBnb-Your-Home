const Review = require("../models/review.js");
const listing = require("../models/listing.js");

module.exports.createReview = async (req,res)=>{
    let rlisting = await listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    
    newReview.author = req.user._id;
    rlisting.reviews.push(newReview);

    await newReview.save();
    await rlisting.save();
    req.flash("success","New Review Created!");
    res.redirect(`/listings/${rlisting._id}`);
};

module.exports.destroyReview = async(req,res)=>{
    let {id , reviewId}= req.params;
    await listing.findByIdAndUpdate(id ,{$pull : {reviews: reviewId}} );
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review Deleted!");
    res.redirect(`/listings/${id}`);
};