const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cors = require('cors');


const app = express();
const port = 3000;

app.use(cors()); // Enable CORS for all origins
app.use(bodyParser.json());

// Replace with your MongoDB connection string
const mongoURI = 'mongodb+srv://indiablueminds:rNvOHfaT66UL0KhZ@cluster0.lvnwp.mongodb.net/sample_mflix?retryWrites=true&w=majority&appName=Cluster0'; // Replace with your MongoDB URI
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB:', err);
});

// Define Mongoose schemas
const employeeSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'employee'], default: 'employee' },
  department:{ type:String,required: true}
});

const taskSchema = new mongoose.Schema({
  text: String,
  due_date: Date,
  completed: Boolean,
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' } 
});

const announcementSchema = new mongoose.Schema({
  text: String
});

const loginTimeSchema = new mongoose.Schema({
    employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    login_time: { type: Date, default: Date.now }
});

const logoutTimeSchema = new mongoose.Schema({
    employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    logout_time: { type: Date, default: Date.now }
});

// Create Mongoose models
const Employee = mongoose.model('Employee', employeeSchema);
const Task = mongoose.model('Task', taskSchema);
const Announcement = mongoose.model('Announcement', announcementSchema);
const LoginTime = mongoose.model('LoginTime', loginTimeSchema);
const LogoutTime = mongoose.model('LogoutTime', logoutTimeSchema);

// Registration API
app.post('/api/register', async (req, res) => {
  try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const newEmployee = new Employee({
          name: req.body.name,
          email: req.body.email,
          password: hashedPassword,
          role: req.body.role
      });
      await newEmployee.save();
      res.status(201).json({ message: 'Employee registered successfully' });
  } catch (error) {
      console.error('Error registering employee:', error);
      res.status(500).json({ message: 'Server error' });
  }
});

// Login API
app.post('/api/login', async (req, res) => {
  try {
    const employee = await Employee.findOne({ email: req.body.email });
    if (!employee) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isPasswordValid = await bcrypt.compare(req.body.password, employee.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.status(200).json({ 
        message: 'Login successful', 
        employee: { 
            id: employee._id, 
            name: employee.name, 
            role: employee.role 
        } 
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Tasks API
app.get('/api/tasks', async (req, res) => {
  try {
      const tasks = await Task.find();
      res.json(tasks);
  } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
      const newTask = new Task(req.body);
      await newTask.save();
      res.status(201).json(newTask);
  } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
      await Task.findByIdAndDelete(req.params.id);
      res.status(204).send(); 
  } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedTask);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Announcement API
app.get('/api/announcement', async (req, res) => {
  try {
      const announcement = await Announcement.findOne(); // Assuming only one announcement
      if (!announcement) {
          return res.status(404).json({ message: 'Announcement not found' });
      }
      res.json(announcement);
  } catch (error) {
      console.error('Error fetching announcement:', error);
      res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/announcement', async (req, res) => {
  try {
      let announcement = await Announcement.findOne();
      if (!announcement) {
          announcement = new Announcement(req.body);
      } else {
          announcement.text = req.body.text;
      }
      await announcement.save();
      res.json({ message: 'Announcement updated successfully' });
  } catch (error) {
      console.error('Error updating announcement:', error);
      res.status(500).json({ message: 'Server error' });
  }
});

// Employees API
app.get('/api/employees', async (req, res) => {
  try {
      const employees = await Employee.find({}, 'name email role'); // Exclude password
      res.json(employees);
  } catch (error) {
      console.error('Error fetching employees:', error);
      res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/employees', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newEmployee = new Employee({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        role: req.body.role,
        department:req.body.department
    });
    await newEmployee.save();
    res.status(201).json({ message: 'Employee registered successfully' });
} catch (error) {
    console.error('Error registering employee:', error);
    res.status(500).json({ message: 'Server error' });
}
});

app.get('/api/employees/:id', async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id, 'name email role'); // Exclude password
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json(employee);
    } catch (error) {
        console.error('Error fetching employee:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/employees/:id', async (req, res) => {
    try {
        // Handle password update separately if needed
        const updatedEmployee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedEmployee);
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).json({ message: 'Server error' });
    }
});



// Employee's Task based on employee id.
app.get('/api/tasks/employee/:employeeId', async (req, res) => {
    const employeeId = req.params.employeeId;
    try {
        const employeeTasks = await Task.find({employee_id: employeeId});
        res.json(employeeTasks);
    } catch (error) {
        console.error('Error fetching tasks for employee:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Employee Login time based on employee id.
app.get('/api/login-time/employee/:employeeId', async (req, res) => {
    const employeeId = req.params.employeeId;
    try {
        const loginTimes = await LoginTime.find({ employee_id: employeeId }).populate('employee_id');
        res.json(loginTimes.map(l => ({
            login_time: l.login_time,
            employee_id: l.employee_id._id
        })));
    } catch (error) {
        console.error('Error fetching login times:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Employee Logout time based on employee id.
app.get('/api/logout-time/employee/:employeeId', async (req, res) => {
    const employeeId = req.params.employeeId;
    try {
        const logoutTimes = await LogoutTime.find({ employee_id: employeeId }).populate('employee_id');
        res.json(logoutTimes.map(l => ({
            logout_time: l.logout_time,
            employee_id: l.employee_id._id
        })));
    } catch (error) {
        console.error('Error fetching logout times:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

//Login time
app.post('/api/login-time', async (req, res) => {
    try {
        const newLoginTime = new LoginTime({
            employee_id: req.body.employee_id, // Assuming you send employee ID in the request body
        });
        await newLoginTime.save();
        res.status(201).json(newLoginTime);
    } catch (error) {
        console.error('Error recording login time:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

//Logout time
app.post('/api/logout-time', async (req, res) => {
    try {
        const newLogoutTime = new LogoutTime({
            employee_id: req.body.employee_id, // Assuming you send employee ID in the request body
        });
        await newLogoutTime.save();
        res.status(201).json(newLogoutTime);
    } catch (error) {
        console.error('Error recording logout time:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});