import express from 'express';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Rutas de archivos de datos
const TOWNS_FILE = path.join(__dirname, '../resources/towns.json');
const DEPARTMENTS_FILE = path.join(__dirname, '../resources/departments.json');

//leer archivos JSON
const readJSONFile = (filePath) => {
    try {
        const data = readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error leyendo archivo ${filePath}:`, error);
        return [];
    }
};
// escribir archivos JSON
const writeJSONFile = (filePath, data) => {
    try {
        writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error escribiendo archivo ${filePath}:`, error);
        return false;
    }
};

// Cargar datos de departamentos y municipios
const departments = readJSONFile(DEPARTMENTS_FILE);
const towns = readJSONFile(TOWNS_FILE);


if (!existsSync(TOWNS_FILE)) {
    writeJSONFile(TOWNS_FILE, []);
}

// Mostrar todos los municipios
router.get('/', (req, res) => {
    const objects = readJSONFile(TOWNS_FILE); // <-- Cambiado aquí
    const { filter, value } = req.query;
    
    let filteredObjects = objects;
    
    if (filter && value) {
        filteredObjects = objects.filter(obj => {
            if (filter === 'departamento') {
                return obj.departamento.toLowerCase().includes(value.toLowerCase());
            } else if (filter === 'municipio') {
                return obj.municipio.toLowerCase().includes(value.toLowerCase());
            } else if (filter === 'fecha') {
                return obj.fecha.includes(value);
            }
            return true;
        });
    }
    
    res.render('home', { 
        title: 'Inicio', // <-- Agregado aquí
        objects: filteredObjects,
        departments,
        filter: filter || '',
        value: value || ''
    });
});

// mostrar formulario para crear
router.get('/create', (req, res) => {
    res.render('create', { 
        title: 'Crear municipio', // <-- Agregado aquí
        departments,
        towns: [],
        object: null,
        editing: false
    });
});

// crear nuevo objeto
router.post('/create', (req, res) => {
    const { nombre, descripcion, fecha, departamento, municipio, categoria } = req.body;
    
    if (!nombre || !descripcion || !fecha || !departamento || !municipio) {
        return res.redirect('/create?error=Todos los campos son obligatorios');
    }
    
    const objects = readJSONFile(TOWNS_FILE);
    const newObject = {
        id: Date.now().toString(),
        nombre,
        descripcion,
        fecha,
        departamento,
        municipio,
        categoria: categoria || 'General',
        fechaCreacion: new Date().toISOString()
    };
    
    objects.push(newObject);
    
    if (writeJSONFile(TOWNS_FILE, objects)) {
        res.redirect('/?success=Objeto creado exitosamente');
    } else {
        res.redirect('/create?error=Error al guardar el objeto');
    }
});

// mostrar formulario para editar
router.get('/edit/:id', (req, res) => {
    const objects = readJSONFile(TOWNS_FILE);
    const object = objects.find(obj => obj.id === req.params.id);
    
    if (!object) {
        return res.redirect('/?error=Objeto no encontrado');
    }
    
    // Filtrar municipios del departamento que se selecciono
    const departmentTowns = towns.filter(town => town.department === object.departamento);
    
    res.render('create', { 
        title: 'Editar municipio', // <-- Agregado aquí
        departments,
        towns: departmentTowns,
        object,
        editing: true
    });
});

// actualizar objeto
router.post('/edit/:id', (req, res) => {
    const { nombre, descripcion, fecha, departamento, municipio, categoria } = req.body;
    const objects = readJSONFile(TOWNS_FILE);
    const objectIndex = objects.findIndex(obj => obj.id === req.params.id);
    
    if (objectIndex === -1) {
        return res.redirect('/?error=Objeto no encontrado');
    }
    
    if (!nombre || !descripcion || !fecha || !departamento || !municipio) {
        return res.redirect(`/edit/${req.params.id}?error=Todos los campos son obligatorios`);
    }
    
    objects[objectIndex] = {
        ...objects[objectIndex],
        nombre,
        descripcion,
        fecha,
        departamento,
        municipio,
        categoria: categoria || 'General',
        fechaModificacion: new Date().toISOString()
    };
    
    if (writeJSONFile(TOWNS_FILE, objects)) {
        res.redirect('/?success=Objeto actualizado exitosamente');
    } else {
        res.redirect(`/edit/${req.params.id}?error=Error al actualizar el objeto`);
    }
});

//eliminar objeto
router.post('/delete/:id', (req, res) => {
    const objects = readJSONFile(TOWNS_FILE);
    const filteredObjects = objects.filter(obj => obj.id !== req.params.id);
    
    if (objects.length === filteredObjects.length) {
        return res.redirect('/?error=Objeto no encontrado');
    }
    
    if (writeJSONFile(TOWNS_FILE, filteredObjects)) { // <-- Cambiado aquí
        res.redirect('/?success=Objeto eliminado exitosamente');
    } else {
        res.redirect('/?error=Error al eliminar el objeto');
    }
});

// municipios por departamento
router.get('/api/towns/:departmentCode', (req, res) => {
    const departmentCode = req.params.departmentCode;
    const departmentTowns = towns.filter(town => town.department === departmentCode);
    res.json(departmentTowns);
});

export default router;