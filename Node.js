// (Server.js)
const express = require('express');
const cors = require('cors'); // If needed
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // For hashing passwords
const bodyParser = require('body-parser'); // For parsing JSON requests

const app = express();
const port = process.env.PORT || 3000;

// Database Setup
const mongoURI = 'mongodb+srv://indiablueminds:rNvOHfaT66UL0KhZ@cluster0.lvnwp.mongodb.net/sample_mflix?retryWrites=true&w=majority&appName=Cluster0'; // Replace with your MongoDB URI
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('Error connecting to MongoDB:', err));

// Define Models (e.g., Employee, Task, Announcement, etc.)
const EmployeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    role: { type: String, enum: ['employee', 'admin'], default: 'employee' },
    password: { type: String, required: true }
});

const TaskSchema = new mongoose.Schema({
    text: { type: String, required: true },
    due_date: { type: Date, required: true },
    completed: { type: Boolean, default: false }
});

const AnnouncementSchema = new mongoose.Schema({
    text: String
});

// Create Models
const Employee = mongoose.model('Employee', EmployeeSchema);
const Task = mongoose.model('Task', TaskSchema);
const Announcement = mongoose.model('Announcement', AnnouncementSchema);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API Endpoints

// Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const employee = await Employee.findOne({ email });
        if (!employee) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const match = await bcrypt.compare(password, employee.password);
        if (!match) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Return employee data (adjust to your needs)
        const userData = {
            id: employee._id, // Assuming you have an _id in your database
            name: employee.name,
            email: employee.email,
            department: employee.department,
            role: employee.role 
        };
        res.json(userData);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Employee Registration
app.post('/api/employees', async (req, res) => {
    const { name, email, department, role, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Hash password
        const newEmployee = new Employee({ name, email, department, role, password: hashedPassword });
        await newEmployee.save();
        res.status(201).json(newEmployee);
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete Employee (Admin Only)
app.delete('/api/employees/:employeeId', async (req, res) => {
    const employeeId = req.params.employeeId;
    try {
        await Employee.findByIdAndDelete(employeeId);
        res.status(204).send(); // No content response
    } catch (error) {
        console.error('Delete employee error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.json(tasks);
    } catch (error) {
        console.error('Fetch tasks error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/tasks', async (req, res) => {
    const { text, due_date, completed } = req.body;
    try {
        const newTask = new Task({ text, due_date, completed });
        await newTask.save();
        res.status(201).json(newTask);
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Announcement
app.get('/api/announcement', async (req, res) => {
    try {
        const announcement = await Announcement.findOne();
        res.json(announcement || { text: '' }); // Return empty text if no announcement
    } catch (error) {
        console.error('Fetch announcement error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/announcement', async (req, res) => {
    const { text } = req.body;
    try {
        const updatedAnnouncement = await Announcement.findOneAndUpdate({}, { text }, { upsert: true, new: true });
        res.json(updatedAnnouncement);
    } catch (error) {
        console.error('Update announcement error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Chat (optional)
app.get('/api/chat', async (req, res) => {
    try {
        const messages = await ChatMessage.find().sort({ time: 1 });
        res.json(messages);
    } catch (error) {
        console.error('Fetch messages error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/chat', async (req, res) => {
    const { sender, text, time } = req.body;
    try {
        const newMessage = new ChatMessage({ sender, text, time });
        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Create message error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login/Logout Times (Track Sessions)
app.post('/api/login-time', async (req, res) => {
    const { employee_id, login_time } = req.body;
    try {
        await Employee.findByIdAndUpdate(employee_id, {
            last_login: login_time // Or create a separate schema for login/logout history
        });
        res.status(200).json({ message: 'Login time updated' });
    } catch (error) {
        console.error('Update login time error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/logout-time', async (req, res) => {
    const { employee_id, logout_time } = req.body;
    try {
        await Employee.findByIdAndUpdate(employee_id, {
            last_logout: logout_time // Or create a separate schema for login/logout history
        });
        res.status(200).json({ message: 'Logout time updated' });
    } catch (error) {
        console.error('Update logout time error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Start Server
app.listen(3000, () => {
    console.log(`Server listening at http://localhost:${3000}`);
});