const mongoose = require('mongoose');
const BoardEnum = Object.freeze({
    ICSE: "ICSE",
    CBSE: "CBSE",
    SSC:  "SSC",
});

const SuperAdminSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        },
    board: {
        type: String,
        enum: Object.values(BoardEnum),
    },
    SchoolAffiliationCode:{
        type: Number,
        unique: true
    },
    access:{
        type: Boolean,
        default: true,
    },
    SchoolEmail:{
        type: String,
        unique: true,
    },
    SchoolPassword:{
        type: String,
        unique: true
    }

});

module.exports = mongoose.model('SuperAdmin',SuperAdminSchema);
