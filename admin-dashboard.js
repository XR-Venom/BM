

let currentView = 'toDoTasks';
let tasks = [];
let employees = [];
let announcementText = '';
let newTaskText = '';
let newTaskDueDate = '';
let selectedEmployee = '';
let newEmployeeName = '';
let newEmployeeEmail = '';
let newEmployeePassword = '';
let selectedEmployeeReport = '';
let employeeTasks = [];
let employeeLoginLogout = {};
let totalLoggedHours = 0;


function showToDoTasks() {
    hideAllSections();
    document.getElementById('toDoTasks').classList.remove('hidden');
    document.getElementById('toDoTasksBtn').classList.add('btn-active');
    currentView = 'toDoTasks';
    fetchTasks();
    fetchEmployees();
    populateSelectEmployees(); //Populate employee select dropdown.
}

function showDailyAnnouncement() {
    hideAllSections();
    document.getElementById('dailyAnnouncement').classList.remove('hidden');
    document.getElementById('dailyAnnouncementBtn').classList.add('btn-active');
    currentView = 'dailyAnnouncement';
    fetchAnnouncement();
}

function showAddEmployee() {
    hideAllSections();
    document.getElementById('addEmployee').classList.remove('hidden');
    document.getElementById('addEmployeeBtn').classList.add('btn-active');
    currentView = 'addEmployee';
}

function showEmployees() {
    hideAllSections();
    document.getElementById('employees').classList.remove('hidden');
    document.getElementById('employeesBtn').classList.add('btn-active');
    currentView = 'employees';
    fetchEmployees();
    populateEmployeeList(); //Populate Employee list.
}

function showReport() {
    hideAllSections();
    document.getElementById('report').classList.remove('hidden');
    document.getElementById('reportBtn').classList.add('btn-active');
    currentView = 'report';
    fetchEmployees();
    populateSelectReportEmployees();
}


async function fetchTasks() {
    const response = await fetch('/api/tasks');
    if (response.ok) {
        tasks = await response.json();
        populateTaskList(); //Populate task list.
    } else {
        console.error('Error fetching tasks:', response.status);
    }
}

async function fetchEmployees() {
    const response = await fetch('/api/employees');
    if (response.ok) {
        employees = await response.json();
    } else {
        console.error('Error fetching employees:', response.status);
    }
}

async function fetchAnnouncement() {
    const response = await fetch('/api/announcement');
    if (response.ok) {
        const data = await response.json();
        announcementText = data.text;
        document.getElementById('announcementText').value = announcementText;
    } else {
        console.error('Error fetching announcement:', response.status);
    }
}


async function createTask() {
    newTaskText = document.getElementById('newTaskText').value; // Get value from field
    newTaskDueDate = document.getElementById('newTaskDueDate').value; // Get value from field
    selectedEmployee = document.getElementById('selectedEmployee').value; // Get value from field

    if (newTaskText.trim() && selectedEmployee) {
        const response = await fetch(`/api/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: newTaskText,
                due_date: newTaskDueDate,
                completed: false,
                employee_id: selectedEmployee // Assign employee_id
            })
        });
        if (response.ok) {
            document.getElementById('newTaskText').value = '';
            document.getElementById('newTaskDueDate').value = '';
            showToDoTasks(); // Refresh the tasks list
        } else {
            console.error('Error creating task:', response.status);
        }
    }
}


async function deleteTask(taskId) {
    const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
    });
    if (response.ok) {
        showToDoTasks(); // Refresh the tasks list
    } else {
        console.error('Error deleting task:', response.status);
    }
}


async function updateAnnouncement() {
    announcementText = document.getElementById('announcementText').value; // Get value from field

    const response = await fetch('/api/announcement', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: announcementText })
    });
    if (response.ok) {
        console.log('Announcement updated successfully');
        fetchAnnouncement(); // Refresh announcement
    } else {
        console.error('Error updating announcement:', response.status);
    }
}


async function registerEmployee() {
    newEmployeeName = document.getElementById('newEmployeeName').value; // Get value from field
    newEmployeeEmail = document.getElementById('newEmployeeEmail').value; // Get value from field
    newEmployeePassword = document.getElementById('newEmployeePassword').value; // Get value from field

    if (newEmployeeName.trim() && newEmployeeEmail.trim() && newEmployeePassword.trim()) {
        const response = await fetch(`/api/employees`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: newEmployeeName,
                email: newEmployeeEmail,
                password: newEmployeePassword,
                role: "employee"
            })
        });
        if (response.ok) {
            document.getElementById('newEmployeeName').value = '';
            document.getElementById('newEmployeeEmail').value = '';
            document.getElementById('newEmployeePassword').value = '';
            showEmployees();
        } else {
            console.error('Error registering employee:', response.status);
        }
    }
}


function viewEmployee(employeeId) {
    // Redirect to employee profile page 
    window.location.href = `employee-profile.html?id=${employeeId}`;
}


async function getReportData(employeeId) {
    // Fetch data for Employee tasks & login history
    const responseEmployeeTasks = await fetch(`/api/tasks/employee/${employeeId}`);
    if (responseEmployeeTasks.ok) {
        employeeTasks = await responseEmployeeTasks.json();
        populateTaskReportList();
    } else {
        console.error('Error fetching employee tasks:', responseEmployeeTasks.status);
    }

    const responseLoginHistory = await fetch(`/api/login-time/employee/${employeeId}`);
    if (responseLoginHistory.ok) {
        const loginTimes = await responseLoginHistory.json();
        if (loginTimes.length > 1) {
            const firstLogin = loginTimes[0].login_time;
            const lastLogin = loginTimes[loginTimes.length - 1].logout_time;
            employeeLoginLogout = {
                loginTime: firstLogin,
                logoutTime: lastLogin,
            };
            const hours = (employeeLoginLogout.logoutTime - employeeLoginLogout.loginTime) / (1000 * 60 * 60);
            totalLoggedHours = hours;
            document.getElementById('loginTime').textContent = `Login Time: ${firstLogin}`;
            document.getElementById('logoutTime').textContent = `Logout Time: ${lastLogin}`;
            document.getElementById('totalLoggedHours').textContent = `Total Hours: ${hours}`;
        } else {
            employeeLoginLogout = {
                loginTime: null,
                logoutTime: null,
            };
            totalLoggedHours = null;
            document.getElementById('loginTime').textContent = `Login Time: ${null}`;
            document.getElementById('logoutTime').textContent = `Logout Time: ${null}`;
            document.getElementById('totalLoggedHours').textContent = `Total Hours: ${null}`;
        }
    } else {
        console.error('Error fetching login history:', responseLoginHistory.status);
    }
}

function logout() {
    // Add Logout logic here if necessary
    // this.isLoggedIn = false; // Or redirect to login
    window.location.href = 'index.html';
}

function hideAllSections() {
    document.getElementById('toDoTasks').classList.add('hidden');
    document.getElementById('dailyAnnouncement').classList.add('hidden');
    document.getElementById('addEmployee').classList.add('hidden');
    document.getElementById('employees').classList.add('hidden');
    document.getElementById('report').classList.add('hidden');
    document.getElementById('toDoTasksBtn').classList.remove('btn-active');
    document.getElementById('dailyAnnouncementBtn').classList.remove('btn-active');
    document.getElementById('addEmployeeBtn').classList.remove('btn-active');
    document.getElementById('employeesBtn').classList.remove('btn-active');
    document.getElementById('reportBtn').classList.remove('btn-active');
}

function populateTaskList() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.classList.add('mb-2', 'flex', 'items-center');
        li.innerHTML = `
                    <input class="mr-2" type="checkbox" onchange="updateTaskCompletionStatus('${task._id}')">
                    <span>${task.text}</span>
                    <button onclick="deleteTask('${task._id}')" class="btn btn-error ml-auto">Delete</button>
                `;
        taskList.appendChild(li);
    });
}

function populateEmployeeList() {
    const employeeList = document.getElementById('employeeList');
    employeeList.innerHTML = '';

    employees.forEach(employee => {
        const li = document.createElement('li');
        li.classList.add('mb-2', 'flex', 'items-center');
        li.innerHTML = `
                    <span>${employee.name} (${employee.email})</span>
                    <button onclick="viewEmployee('${employee._id}')" class="btn btn-info ml-auto">View</button>
                `;
        employeeList.appendChild(li);
    });
}

function populateSelectEmployees() {
    const selectEmployee = document.getElementById('selectedEmployee');
    selectEmployee.innerHTML = '';

    employees.forEach(employee => {
        const option = document.createElement('option');
        option.value = employee._id;
        option.textContent = employee.name;
        selectEmployee.appendChild(option);
    });
}

function populateTaskReportList() {
    const taskReportList = document.getElementById('taskReportList');
    taskReportList.innerHTML = '';

    employeeTasks.forEach(task => {
        const li = document.createElement('li');
        li.classList.add('mb-2');
        li.innerHTML = `
                    <span>${task.text}</span>
                    <span> - Completed: ${task.completed ? 'Yes' : 'No'}</span> 
                `;
        taskReportList.appendChild(li);
    });
}

function populateSelectReportEmployees() {
    const selectReportEmployee = document.getElementById('selectedEmployeeReport');
    selectReportEmployee.innerHTML = '';

    employees.forEach(employee => {
        const option = document.createElement('option');
        option.value = employee._id;
        option.textContent = employee.name;
        selectReportEmployee.appendChild(option);
    });

    selectReportEmployee.addEventListener('change', () => {
        selectedEmployeeReport = selectReportEmployee.value;
        if (selectedEmployeeReport) {
            getReportData(selectedEmployeeReport);
        }
    });
}

async function updateTaskCompletionStatus(taskId) {
    const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !task.completed }),
    });
    if (response.ok) {
        fetchTasks();
    } else {
        console.error('Error updating task completion status:', response.status);
    }
}

window.onload = function() {
    showToDoTasks();
};