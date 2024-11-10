// (employee-profile.js)
const employeeId = location.search.split('=')[1]; // Get employee ID from URL

new Vue({
    el: '#app',
    data: {
        employee: {},
        logins: [] // Array to store Login History
    },
    mounted() {
        this.fetchEmployee(employeeId); 
        this.fetchLoginHistory(employeeId); 
    },
    methods: {
        async fetchEmployee(employeeId) {
            const response = await fetch(`/api/employees/${employeeId}`); 
            if (response.ok) {
                this.employee = await response.json();
            } else {
                console.error('Error fetching employee');
            }
        },
        async fetchLoginHistory(employeeId) {
            // Replace this with your API endpoint for fetching login history 
            const response = await fetch(`/api/login-history/${employeeId}`);
            if (response.ok) {
                this.logins = await response.json();
            } else {
                console.error('Error fetching login history');
            }
        }
    }
});