import mongoose from "mongoose";



/**
 * -job description: The job description for the interview report.
 * -resume text: The resume text for the interview report.
 * -self description: The self description for the interview report.
 * 
 * matchScore : number, // The match score for the interview report.
 *
 * -technical questions: An array of technical questions asked during the interview.
 * [{
 *   question: "",
 *   intention : "",
 *   answer: ""
 * }]
 * -behavioral questions: An array of behavioral questions asked during the interview.
 * [{
 *   question: "",
 *   intention : "",
 *   answer: ""
 * }]
 * -skill gaps : An array of skill gaps identified during the interview.
 * [{
 *   skill: "",
 *   severity: "",
 *   type: string,
 *   enum: ["low", "medium", "high"]
 * }]
 * -prepration plan: The preparation plan for the interview report.
 * [{
 *      day: number,
 *      focus: string,
 *      tasks : [{
 *          task: string,
 *          type: string
 * }]
 *
 * }]
*/

const technicalQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true,"Question is required"]
    },
    intention: {
        type: String,
        required: [true,"Intention is required"]
    },
    answer: {
        type: String,
        required: [true,"Answer is required"]
    }
    },
    {
        _id:false

})

const behavioralQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true,"Question is required"]
    },
    intention: {
        type: String,
        required: [true,"Intention is required"]
    },
    answer: {
        type: String,
        required: [true,"Answer is required"]
    }
},
    {
        _id:false

})

const skillGapSchema = new mongoose.Schema({
    skill: {
        type: String,
        required: [true,"Skill is required"]
    },
    severity: {
        type: String,
        enum: ["low", "medium", "high"],
        required: [true,"Severity is required"]
    }
},
    {
        _id:false

    })

const preparationPlanSchema = new mongoose.Schema({
    day: {
        type: Number,
        required: [true,"Day is required"]
    },
    focus: {
        type: String,
        required: [true,"Focus is required"]
    },
    tasks: [{
        task: {
            type: String,
            required: [true,"Task is required"]
        },
        type: {
            type: String,
            required: [true,"Type is required"]
        }
    }]
})

const interviewReportSchema = new mongoose.Schema(
  {
    jobDescription: {
      type: String,
      required: [true,"Job description is required"]
    },
    resumeText: {
      type: String,

    },
    selfDescription: {
      type: String,
    },
    matchScore: {
      type: Number,
      min: [0, "Match score must be at least 0"],
        max: [100, "Match score must be at most 100"]
    },
    technicalQuestions: [technicalQuestionSchema],
    behavioralQuestions: [behavioralQuestionSchema],
    skillGaps: [skillGapSchema],
    preparationPlan: [preparationPlanSchema]
  },
  {
    timestamps: true,
  }
);

const InterviewReport = mongoose.model("InterviewReport", interviewReportSchema);

export default InterviewReport;