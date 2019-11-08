const { io } = require('../server');
const { Usuarios } = require('../classes/usuarios');
const usuarios = new Usuarios();
const { crearMensaje } = require('../utils/utilidades');

io.on('connection', (client) => {

   

    client.on('entrarChat', (usuario, callback) =>{
        if(!usuario.nombre){
            return callback({
                error: true,
                mensaje: 'El nombre es necesario'
            });
        }
        let personas = usuarios.agregarPersona(client.id, usuario.nombre);

        client.broadcast.emit('listaPersona', usuarios.getPersonas());

        callback(personas);
        //console.log(usuario);
    });

    client.on('crearMensaje', (data) => {

        let persona = usuarios.getPersona(client.id);
        let mensaje = crearMensaje(persona.nombre, data.mensaje);
        client.broadcast.emit('crearMensaje', mensaje);
    });

    client.on('disconnect', () =>{
        let personaBorrada = usuarios.borrarPersona(client.id);
        client.broadcast.emit('crearMensaje', crearMensaje('Administrador', `${personaBorrada.nombre} abandonó el chat`));
        client.broadcast.emit('listaPersona', usuarios.getPersonas());

    });

    
   

});