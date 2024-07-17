const express = require('express');
const router = express.Router();
const mysql = require('mysql');

// Configurar la conexión a la base de datos
const connection = mysql.createConnection({
  host: 'b2astyriqlmaokfgozyc-mysql.services.clever-cloud.com',
  user: 'u6kwxj98pyge2exk',
  password: 'YcPjltl7uAyABv31rPtB',
  database: 'b2astyriqlmaokfgozyc',
  port: 3306
});

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
      return res.status(500).send('Error al cerrar sesión');
    }
    res.redirect('/admin/login'); // Redirige al usuario a la página de inicio de sesión
  });
});
// Middleware para verificar si el usuario es admin_crud
function isAdminCrud(req, res, next) {
  if (req.session.admin && req.session.admin.rol === 'admin_crud') {
    return next();
  } else {
    return res.redirect('/admin/login');
  }
}

// Middleware para verificar si el usuario es admin_reportes
function isAdminReportes(req, res, next) {
  if (req.session.admin && req.session.admin.rol === 'admin_reportes') {
    return next();
  } else {
    return res.redirect('/admin/login');
  }
}

// Ruta para mostrar el formulario de inicio de sesión
router.get('/login', (req, res) => {
  res.render('login');
});

// Ruta para procesar el inicio de sesión
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  connection.query('SELECT * FROM administradores WHERE email = ? AND contraseña = ?', [email, password], (error, results) => {
    if (error) {
      console.error('Error al autenticar al administrador: ', error);
      res.status(500).send('Error en el servidor');
      return;
    }
    if (results.length > 0) {
      req.session.admin = results[0];
      res.redirect('/admin/dashboard');
    } else {
      res.render('login', { error: 'Credenciales incorrectas' });
    }
  });
});

// Ruta protegida para el panel de administrador
router.get('/dashboard', (req, res) => {
  if (req.session.admin) {
    const admin = req.session.admin;
    if (admin.rol === 'admin_crud') {
      res.redirect('/admin/hoteles');
    } else if (admin.rol === 'admin_reportes') {
      res.redirect('/admin/reportes');
    } else {
      res.render('admin_dashboard', { admin });
    }
  } else {
    res.redirect('/admin/login');
  }
});


// Rutas CRUD para hoteles, protegidas para admin_crud
router.get('/hoteles', isAdminCrud, (req, res) => {
  connection.query('SELECT * FROM hoteles', (error, results) => {
    if (error) throw error;
    res.render('hoteles', { hoteles: results });
  });
});

router.get('/hoteles/new', isAdminCrud, (req, res) => {
  res.render('hotel_form', { hotel: {} });
});

router.post('/hoteles', isAdminCrud, (req, res) => {
  const hotel = req.body;
  connection.query('INSERT INTO hoteles SET ?', hotel, (error) => {
    if (error) throw error;
    res.redirect('/admin/hoteles');
  });
});

router.get('/hoteles/edit/:id', isAdminCrud, (req, res) => {
  const id = req.params.id;
  connection.query('SELECT * FROM hoteles WHERE id = ?', [id], (error, results) => {
    if (error) throw error;
    if (results.length > 0) {
      res.render('hotel_form', { hotel: results[0] });
    } else {
      res.redirect('/admin/hoteles');
    }
  });
});

router.post('/hoteles/update/:id', isAdminCrud, (req, res) => {
  const id = req.params.id;
  const hotel = req.body;
  connection.query('UPDATE hoteles SET ? WHERE id = ?', [hotel, id], (error) => {
    if (error) throw error;
    res.redirect('/admin/hoteles');
  });
});
// Ruta para mostrar el listado de administradores
router.get('/administradores', (req, res) => {
  connection.query('SELECT * FROM administradores', (error, results) => {
    if (error) {
      console.error('Error al obtener los administradores:', error);
      return res.status(500).send('Error al obtener los administradores');
    }
    res.render('administradores', { administradores: results });
  });
});

router.post('/hoteles/delete/:id', isAdminCrud, (req, res) => {
  const id = req.params.id;
  connection.query('DELETE FROM hoteles WHERE id = ?', [id], (error) => {
    if (error) throw error;
    res.redirect('/admin/hoteles');
  });
});

// Rutas de reportes, protegidas para admin_reportes
function isAdminReportes(req, res, next) {
  if (req.session.admin && req.session.admin.rol === 'admin_reportes') {
    return next();
  } else {
    return res.redirect('/admin/login');
  }
}

router.get('/reportes', isAdminReportes, (req, res) => {
  const queries = {
    totalHoteles: 'SELECT COUNT(*) as totalHoteles FROM hoteles',
    dataProvincias: 'SELECT provincia, COUNT(*) as count FROM hoteles GROUP BY provincia',
    dataCategorias: 'SELECT categoria, COUNT(*) as count FROM hoteles GROUP BY categoria',
    dataPrecios: 'SELECT categoria, AVG(precio) as avgPrice FROM hoteles GROUP BY categoria'
  };

  const results = {};

  connection.query(queries.totalHoteles, (error, totalHotelesResult) => {
    if (error) throw error;
    results.totalHoteles = totalHotelesResult[0].totalHoteles;

    connection.query(queries.dataProvincias, (error, dataProvinciasResult) => {
      if (error) throw error;
      results.dataProvincias = dataProvinciasResult;

      connection.query(queries.dataCategorias, (error, dataCategoriasResult) => {
        if (error) throw error;
        results.dataCategorias = dataCategoriasResult;

        connection.query(queries.dataPrecios, (error, dataPreciosResult) => {
          if (error) throw error;
          results.dataPrecios = dataPreciosResult;

          res.render('reportes', results);
        });
      });
    });
  });
});

module.exports = router;
