// ... (other code)


const loginRoutes = express.Router();

// Handle login requests
loginRoutes.post('/', async (req, res) => {
    // Validate user credentials 
    const { email, password } = req.body;

    try {
        const foundEmployee = await Employee.findOne({ email });

        if (!foundEmployee) {
            return res.status(401).json({ error: 'Employee not found' });
        }

        // Assuming you have password hashing in place, verify the password:
        if (foundEmployee.password === password) {
            // Authentication successful
            return res.status(200).json(foundEmployee);
        } else {
            return res.status(401).json({ error: 'Incorrect password' }); 
        }
    } catch (error) {
        return res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = loginRoutes;