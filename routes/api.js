const express = require('express');
const router = express.Router();
const connection = require('../db');
const cors = require('cors');

// Middleware para analizar cuerpos de solicitudes JSON
router.use(express.json());

// Configurar CORS para permitir solicitudes desde cualquier origen
router.use(cors());

// Ruta para obtener todos los hoteles
router.get('/hoteles', (req, res) => {
  connection.query('SELECT * FROM hoteles', (error, results) => {
    if (error) {
      console.error('Error fetching hotels: ', error);
      return res.status(500).json({ error: 'Error fetching hotels' });
    }
    res.json(results);
  });
});

// Ruta para obtener un hotel por ID
router.get('/hoteles/:id', (req, res) => {
  const id = req.params.id;
  connection.query('SELECT * FROM hoteles WHERE id = ?', [id], (error, results) => {
    if (error) {
      console.error('Error fetching hotel: ', error);
      return res.status(500).json({ error: 'Error fetching hotel' });
    }
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ error: 'Hotel not found' });
    }
  });
});

// Ruta para crear un nuevo hotel
router.post('/hoteles', (req, res) => {
  const hotel = req.body;

  // Validar que se envían todos los campos necesarios excepto 'id'
  const requiredFields = ['numero_establecimiento', 'ruc', 'razon_social', 'nombre_comercial', 'representante_legal', 'clase', 'tipo_via', 'nombre_via', 'numero_via', 'distrito', 'provincia', 'categoria', 'precio', 'url', 'TELEF'];
  for (const field of requiredFields) {
    if (!hotel[field]) {
      return res.status(400).json({ error: `Falta el campo requerido: ${field}` });
    }
  }

  const query = `
    INSERT INTO hoteles (
      numero_establecimiento, ruc, razon_social, nombre_comercial,
      representante_legal, clase, tipo_via, nombre_via, numero_via,
      distrito, provincia, categoria, precio, url, TELEF
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    hotel.numero_establecimiento, hotel.ruc, hotel.razon_social, hotel.nombre_comercial,
    hotel.representante_legal, hotel.clase, hotel.tipo_via, hotel.nombre_via, hotel.numero_via,
    hotel.distrito, hotel.provincia, hotel.categoria, hotel.precio, hotel.url, hotel.TELEF
  ];

  connection.query(query, values, (error, results) => {
    if (error) {
      console.error('Error creating hotel:', error);
      return res.status(500).json({ error: 'Error creating hotel' });
    }
    res.status(201).json({ message: 'Hotel creado correctamente', id: results.insertId, ...hotel });
  });
});

// Ruta para actualizar un hotel
router.put('/hoteles/:id', (req, res) => {
  const id = req.params.id;
  const hotel = req.body;

  // Validar que se envían todos los campos necesarios excepto 'id'
  const requiredFields = ['numero_establecimiento', 'ruc', 'razon_social', 'nombre_comercial', 'representante_legal', 'clase', 'tipo_via', 'nombre_via', 'numero_via', 'distrito', 'provincia', 'categoria', 'precio', 'url', 'TELEF'];
  for (const field of requiredFields) {
    if (!hotel[field]) {
      return res.status(400).json({ error: `Falta el campo requerido: ${field}` });
    }
  }

  connection.query('UPDATE hoteles SET ? WHERE id = ?', [hotel, id], (error, results) => {
    if (error) {
      console.error('Error updating hotel: ', error);
      return res.status(500).json({ error: 'Error updating hotel' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Hotel no encontrado' });
    }
    res.json({ message: 'Hotel actualizado correctamente', id, ...hotel });
  });
});

// Ruta para eliminar un hotel
router.delete('/hoteles/:id', (req, res) => {
  const id = req.params.id;
  connection.query('DELETE FROM hoteles WHERE id = ?', [id], (error, results) => {
    if (error) {
      console.error('Error deleting hotel: ', error);
      return res.status(500).json({ error: 'Error deleting hotel' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Hotel no encontrado' });
    }
    res.status(204).json({ message: 'Hotel eliminado correctamente' });
  });
});

module.exports = router;
