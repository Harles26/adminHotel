const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const adminRoutes = require('./routes/admin');
const apiRoutes = require('./routes/api');
const cors = require('cors');

const app = express();
const port = 3000;

// Configurar sesión
app.use(session({
  secret: 'secreto',
  resave: false,
  saveUninitialized: true
}));
// Middleware para analizar cuerpos de solicitudes JSON
app.use(express.json());
app.use(cors());

// Middleware para analizar datos de formulario
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware para analizar cuerpos de solicitudes JSON
app.use(express.json()); // Agregar esta línea para manejar solicitudes JSON

// Configurar vistas
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Rutas de administrador
app.use('/admin', adminRoutes);

// Rutas de API
app.use('/api', apiRoutes);

// Escuchar en el puerto
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
