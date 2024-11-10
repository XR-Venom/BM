 new Vue({
            el: '#app',
            data: {
                email: '',
                password: ''
            },
            methods: {
                async login() {
                    const response = await fetch('/api/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ email: this.email, password: this.password })
                    });
                    if (response.ok) {
                        const userData = await response.json();
                        // Store user information in LocalStorage
                        localStorage.setItem('user', JSON.stringify(userData));
                        // Redirect the user to Employee Dashboard (assuming the URL is employee-dashboard.html)
                        window.location.href = 'employee-dashboard.html';
                    } else {
                        // Handle incorrect credentials
                        alert('Invalid email or password');
                    }
                }
            }
        })
    </script>