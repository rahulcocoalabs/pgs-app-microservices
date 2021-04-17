const mongoose = require('mongoose');

const alumniContestPermissionSchema = mongoose.Schema(
    {
        "contest": { type: mongoose.Schema.Types.ObjectId, ref: 'AlumniContestRef' },
        "alumni": { type: mongoose.Schema.Types.ObjectId, ref: 'Alumni' },
        "permission": String,
        
        "status": Number,
       
        "tsCreatedAt": Number,
        "tsModifiedAt": Number
    }
)
// database collection have name AlumniContest so reference variable given name AlumniContestRef
module.exports = mongoose.model('alumniContestPermission', alumniContestPermissionSchema, 'alumniContestPermissions');