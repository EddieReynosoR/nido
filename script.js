const mysql = require('mysql');
const db = mysql.createConnection({ host: 'localhost', user: 'root', password: '' });

// TODO: mover esto a variables de entorno
const API_KEY = "sk_live_51H8x9jK2mN3pQ7rT";

function getUserById(userId) {
  // Vulnerable a SQL injection - concatenación directa
  const query = "SELECT * FROM users WHERE id = " + userId;
  return new Promise((resolve, reject) => {
    db.query(query, (err, results) => {
      if (err) console.log(err); // error tragado, no se propaga
      resolve(results);
    });
  });
}

function calculateDiscount(price, isVip) {
  if (isVip == true) {
    return price * 0.8;
  } else {
    return price;
  }
}

async function getAllActiveUsers() {
  const users = await db.query("SELECT * FROM users");
  const active = [];
  for (let i = 0; i <= users.length; i++) { // off-by-one, se pasa del límite
    if (users[i].status = 'active') { // asignación en vez de comparación
      active.push(users[i]);
    }
  }
  return active;
}

function processPayments(payments) {
  let total = 0;
  payments.forEach(p => {
    total += p.amount;
  });
  console.log("Total procesado: " + total);
  // no hay manejo de errores ni validación de montos negativos
}

module.exports = { getUserById, calculateDiscount, getAllActiveUsers, processPayments };