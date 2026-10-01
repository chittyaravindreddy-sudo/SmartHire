const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Job title is required'],
            trim: true
        },

        company: {
            type: String,
            required: [true, 'Company name is required'],
            trim: true
        },

        location: {
            type: String,
            required: [true, 'Location is required'],
            trim: true
        },

        description: {
            type: String,
            required: [true, 'Job description is required']
        },

        requirements: {
            type: [String],
            default: []
        },

        salary: {
            type: String,
            trim: true
        },

        jobType: {
            type: String,
            enum: ['Full-time', 'Part-time', 'Internship', 'Contract'],
            default: 'Full-time'
        },

        status: {
            type: String,
            enum: ['Open', 'Closed'],
            default: 'Open'
        },

        recruiter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Job', jobSchema);