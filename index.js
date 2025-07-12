console.log("Iniciando backend...");


// index.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());


// Ajusta estos datos si es necesario
const pool = new Pool({
  user: 'nanicocio',
  host: 'localhost',
  database: 'likeme',
  password: '',         // deja vacío si no tienes contraseña
  port: 5432,
});

(async () => {
  try {
    await pool.query('SELECT NOW()'); // consulta simple de prueba
    console.log('✅ Conectado a la base de datos');
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error.message);
  }
})();

// Ruta GET: obtener todos los posts
app.get('/posts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM posts');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los posts' });
  }
});

// Ruta POST: crear un nuevo post
app.post('/posts', async (req, res) => {
  const { titulo, img, descripcion, likes } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO posts (titulo, img, descripcion, likes) VALUES ($1, $2, $3, $4) RETURNING *',
      [titulo, img, descripcion, likes]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el post' });
  }
});

//Eliminar post
app.delete('/posts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM posts WHERE id = $1', [id]);
    res.json({ mensaje: 'Post eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar post:', error.message);
    res.status(500).json({ error: 'No se pudo eliminar el post' });
  }
});

// Iniciar el servidor
app.get('/', (req, res) => {
  res.send('Servidor funcionando 🚀');
});
console.log("Antes de app.listen");
app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
console.log("Después de app.listen");


// Agregar like
app.put('/posts/like/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE posts SET likes = likes + 1 WHERE id = $1 RETURNING *',
      [id]
    );
    res.status(200).json(result.rows[0]); // Devuelve el post actualizado
  } catch (error) {
    console.error('Error al dar like:', error.message);
    res.status(500).json({ error: 'No se pudo dar like al post' });
  }
});