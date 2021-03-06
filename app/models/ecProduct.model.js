const mongoose = require('mongoose');

function transform(ret) {
	ret.id = ret._id;
	delete ret._id;
	delete ret.status;
	delete ret.tSCreatedAt;
	delete ret.tSModifiedAt;
}
var options = {
	toObject: {
		virtuals: true,
		transform: function (doc, ret) {
			transform(ret);
		}
	},
	toJSON: {
		virtuals: true,
		transform: function (doc, ret) {
			transform(ret);
		}
	}
};

const ecProduct = mongoose.Schema({
	status: Number,
	name: String,
	description: String,
	qty: Number,
	category: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'EcCategory'
	},
	image: [String],
	subImages: [String],
	costPrice: Number,
	brand:String,
	shopOwner:String,
  
	sellingPrice:Number,
	meter: String,
	variantsExists: Boolean,
	
	discount: Number,
	tSCreatedAt: Number,
	tSModifiedAt: Number,
	id: Number,
	sku: String,
	weight: Number,
	expiryDate: Number,
	manufacturingDate: String,
	serialNumber: Number,
	height: Number,
	width: Number,
	length: Number,
	//isManagedInventory: Boolean,
	currency: String,
	//rebate_price: String,
	isActive: Boolean,
	//isFeaturedNew: Boolean,
	//inPromotion: Boolean,
	currencyId : { type: mongoose.Schema.Types.ObjectId, ref: 'Currency' },
	modelNumber: String,
	color:String,
	salesPackages: String,
	isBuyable: Boolean,
	isShippable: Boolean,
	parentProduct_id: Number,
	stockAvailable: Number,
	numberSold: Number,
	avaregeRating: Number,
	outOfStock: Boolean
}, options);

module.exports = mongoose.model('EcProduct', ecProduct, "EcProducts");