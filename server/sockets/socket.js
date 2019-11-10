const { io } = require('../server');
const { Usuarios } = require('../classes/usuarios');
const usuarios = new Usuarios();
const { crearMensaje } = require('../utils/utilidades');

io.on('connection', (client) => {

   

    client.on('entrarChat', (usuario, callback) =>{
        if(!usuario.nombre || !usuario.sala){
            return callback({
                error: true,
                mensaje: 'El nombre y sala son necesarios'
            });
        }

        client.join(usuario.sala);

        let personas = usuarios.agregarPersona(client.id, usuario.nombre, usuario.sala);

        client.broadcast.to(usuario.sala).emit('listaPersona', usuarios.getPersonasPorSala(usuario.sala));
        client.broadcast.to(usuario.sala).emit('crearMensaje', crearMensaje('Administrador', `${usuario.nombre} se unió al chat`));
    

        callback(personas);
        console.log(usuario);
    });

    client.on('crearMensaje', (data, callback) => {

        let persona = usuarios.getPersona(client.id);
        let mensaje = crearMensaje(persona.nombre, data.mensaje);
        client.broadcast.to(persona.sala).emit('crearMensaje', mensaje);
        
        callback(mensaje);
    });

    client.on('disconnect', () =>{
        let personaBorrada = usuarios.borrarPersona(client.id);
        client.broadcast.to(personaBorrada.sala).emit('crearMensaje', crearMensaje('Administrador', `${personaBorrada.nombre} abandonó el chat`));
        client.broadcast.to(personaBorrada.sala).emit('listaPersona', usuarios.getPersonasPorSala(personaBorrada.sala));

    });

    //mensaje privado
    client.on('mensajePrivado', data => {
        let persona = usuarios.getPersona(client.id);
        client.broadcast.to(data.para).emit('mensajePrivado', crearMensaje(persona.nombre, data.mensaje));
    });
     
    //client.on()
    
   

});