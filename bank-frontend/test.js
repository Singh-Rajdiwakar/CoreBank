
const roles = [
  { role: 'Admin', email: 'admin@bank.local', password: 'password' },
  { role: 'Manager', email: 'manager1@bank.local', password: 'password' },
  { role: 'Employee', email: 'employee1@bank.local', password: 'password' },
  { role: 'Auditor', email: 'auditor1@bank.local', password: 'password' },
  { role: 'Customer', email: 'customer1@bank.local', password: 'password' }
];

async function run() {
  for (let c of roles) {
    const res = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernameOrEmail: c.email, password: c.password })
    });
    const d = await res.json();
    if (d.success) console.log(c.role + ' SUCCESS -> ' + d.data.roles.join(', '));
    else console.log(c.role + ' FAILED -> ' + d.message);
  }
}
run();

