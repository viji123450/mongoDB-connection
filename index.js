import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import bodyParser from "body-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 7000;  // Set PORT to 7000
const MONGOURL = process.env.MONGO_URL; // Correctly access MONGO_URL from .env file

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB without deprecated options
mongoose.connect(MONGOURL)
    .then(() => {
        console.log("Database connected successfully.");
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => console.log(error));




// Define Mongoose schema and model
const userSchema = new mongoose.Schema({
    name: String,
    rollNo: String,
    department: String,
    semester: String,
    grade: String,
    marks: {
        eda: Number,
        fullStack: Number,
        cloudArchitecture: Number,
        marketingFundamental: Number,
        constitutionOfIndia: Number
    },
    total: Number,
    average: Number
});

const UserModel = mongoose.model("Users", userSchema);

// Serve the static HTML form
app.get("/", (req, res) => {
    res.sendFile(path.join(process.cwd(), "form.html")); // Use process.cwd() to get the current directory
});

// Handle form submission
app.post("/submitForm", async (req, res) => {
    const { name, rollNo, department, semester, grade, subject1, subject2, subject3, subject4, subject5 } = req.body;

    // Calculate total and average marks
    const totalMarks = parseInt(subject1) + parseInt(subject2) + parseInt(subject3) + parseInt(subject4) + parseInt(subject5);
    const averageMarks = (totalMarks / 5).toFixed(2); // Fixed to 2 decimal points

    // Save the student data to MongoDB
    const newUser = new UserModel({
        name,
        rollNo,
        department,
        semester,
        grade,
        marks: {
            eda: parseInt(subject1),
            fullStack: parseInt(subject2),
            cloudArchitecture: parseInt(subject3),
            marketingFundamental: parseInt(subject4),
            constitutionOfIndia: parseInt(subject5)
        },
        total: totalMarks,
        average: averageMarks
    });

    await newUser.save();
    
    // Redirect to results page
    res.redirect(`/result?name=${encodeURIComponent(name)}&rollNo=${encodeURIComponent(rollNo)}&department=${encodeURIComponent(department)}&semester=${encodeURIComponent(semester)}&grade=${encodeURIComponent(grade)}&total=${totalMarks}&average=${averageMarks}`);
});

// Serve the result page
app.get("/result", (req, res) => {
    const { name, rollNo, department, semester, grade, total, average } = req.query;
    res.send(`
        <h1>Submission Successful</h1>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Roll No:</strong> ${rollNo}</p>
        <p><strong>Department:</strong> ${department}</p>
        <p><strong>Semester:</strong> ${semester}</p>
        <p><strong>Grade:</strong> ${grade}</p>
        <p><strong>Total Marks:</strong> ${total}</p>
        <p><strong>Average Marks:</strong> ${average}</p>
        <a href="/">Go Back to Form</a>
    `);
});
