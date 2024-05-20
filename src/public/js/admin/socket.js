const $chat = document.getElementById('chat');
const socket = io();
if ($chat) {

    const $cardContactos = document.getElementById('cardContactos')
    let idUser = null
    let idActive = document.querySelector('.page-title').getAttribute('data-id')
    let simplebar
    const $search = document.getElementById('search')


    //filtro de contactos
    $search.addEventListener('keyup', e => {
        document.querySelectorAll('.usuarios').forEach((usuario) => {
            console.log(usuario.dataset.usuario.toLocaleLowerCase().includes(e.target.value.toLocaleLowerCase()))
            usuario.dataset.usuario.toLocaleLowerCase().includes(e.target.value.toLocaleLowerCase()) ?
                usuario.classList.remove('filtro') :
                usuario.classList.add('filtro');
        })
    })

    document.addEventListener('click', e => {
        e.stopPropagation();
        if (e.target.classList.contains('openChat')) {
            //abrir chat
            let data = {
                _id: e.target.dataset.id,
                _idReq: e.target.dataset.idreq,
            }
            fetch('/chat/abrir', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then((res) => {
                return res.json();
            }).then((res) => {
                if (res.chat) {
                    let li = ""
                    res.mensajes.forEach(dataMensaje => {
                        let nuevoLi = `
                        <li class="clearfix ${dataMensaje.Posicion}">
                            <div class="chat-avatar">
                                <img src="${dataMensaje.RutaImagen}" height="50px" width="50px" class="rounded" alt="${dataMensaje.Usuario}}" />
                                <i> ${dataMensaje.Tiempo}</i>
                            </div>
                            <div class="conversation-text">
                                <div class="ctext-wrap">
                                    <i>${dataMensaje.Usuario}</i>
                                    <p>
                                        ${dataMensaje.Mensaje}
                                    </p>
                                </div>
                            </div>
                        </li>
                        `
                        li += nuevoLi;
                    })
                    document.getElementById('cardChat').innerHTML = `
                        <div class="card-header">
                            <div class="chat-avatar">
                                <div class="row">
                                    <div class="col-sm-6">
                                        <img src="${res.usuario.RutaImage}" height="50px" width="50px" class="rounded-circle" alt="Shreyu N" />
                                    </div>
                                    <div class="col-sm-6 text-start">
                                        <h2 id="usuarioChat" data-usuarioPersonal="${res.usuarioPersonal}">${res.usuario.Nombres} ${res.usuario.Apellidos}</h2>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="card-body px-0 pb-0">
                            <ul class="conversation-list px-3" id="conversation-list" data-simplebar style="max-height: 538px">
                                ${li}
                            </ul>
                            <div class="row px-3 pb-3">
                            <div class="col">
                                <div class="mt-2 bg-light p-3 rounded">
                                    <div class="row">
                                        <div class="col-sm-11 mb-2 mb-sm-0">
                                            <textarea name="msg" id="msg" data-contenid="0" class="form-control border-0" cols="1" rows="2" required="" placeholder="Introduzca tu mensaje aquí"></textarea>
                                        </div>
                                        <div class="col-sm-1">
                                                <button type="button" data-idreq="${res._idReq}" data-id="${res._id}" id="btnSend" class="btn btn-primary w-100" style="height: 55px;" ><i class='uil uil-message' id="icon-send" data-idreq="${res._idReq}"  data-id="${res._id}"></i></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        </div>
                    `
                    simplebar = new SimpleBar(document.getElementById('conversation-list'));
                    simplebar.getScrollElement().scrollTop = simplebar.getScrollElement().scrollHeight;
                    document.getElementById('msg').focus()
                    document.getElementById("btnSend").scrollIntoView();
                } else {
                    document.getElementById('cardChat').innerHTML = `
                        <div class="card-header">
                            <div class="chat-avatar">
                                <div class="row">
                                    <div class="col-sm-6">
                                        <img src="${res.usuario.RutaImage}" height="50px" width="50px" class="rounded-circle" alt="Shreyu N" />
                                    </div>
                                    <div class="col-sm-6 text-start">
                                        <h2 id="usuarioChat" data-usuarioPersonal="${res.usuarioPersonal}">${res.usuario.Nombres} ${res.usuario.Apellidos}</h2>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="card-body px-0 pb-0">
                            <ul class="conversation-list px-3" id="conversation-list" data-simplebar style="max-height: 538px">
                                <li class="text-center">
                                    <p class="h4">¡Saluda a ${res.usuario.Nombres} ${res.usuario.Apellidos}! <i class="mdi mdi-hand-wave"></i> </p>
                                </li>
                            </ul>
                            <div class="row px-3 pb-3">
                                <div class="col">
                                    <div class="mt-2 bg-light p-3 rounded">
                                        <div class="row">
                                            <div class="col-sm-11 mb-2 mb-sm-0">
                                                <textarea name="msg" id="msg" data-contenid="0" class="form-control border-0" cols="1" rows="2" required="" placeholder="Introduzca tu mensaje aquí"></textarea>
                                            </div>
                                            <div class="col-sm-1">
                                                <button type="button" data-idreq="${res._idReq}" data-id="${res._id}" id="btnSend" class="btn btn-primary w-100" style="height: 55px;" ><i class='uil uil-message' id="icon-send" data-idreq="${res._idReq}"  data-id="${res._id}"></i></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `
                    document.getElementById("btnSend").scrollIntoView();

                }

            })
        }
        if (e.target.classList.contains('btn-primary') || e.target == document.getElementById('icon-send')) {
            //enviar mensaje
            //obteniendo el mensaje
            const message = document.getElementById('msg').value;
            let data = {
                message,
                idUser,
                _id: e.target.dataset.id,
                Notificacion: true,
                _idReq: e.target.dataset.idreq,
            }

            //emitir mensaje al servidor
            socket.emit('chatMessage', data);
            //clear input
            document.getElementById('msg').value = '';
            document.getElementById('msg').focus();
        }
    })


    //emicion de sockets

    //mensaje del servidor
    socket.on('message', (message) => {
        outputMessage(message);
        //scroll down
        simplebar.getScrollElement().scrollTop = simplebar.getScrollElement().scrollHeight;
    })

    //actualizar id socket
    socket.on('id', (userId) => {
        let data = {
            userId,
            idActive
        }
        socket.emit('actualizarId', data);
    })

    socket.emit('activo', idActive)


    //recibir notificacion

    socket.on('notificacion', (data) => {
        console.log(data)
        let audio = new Audio('audio/notificacion.mp3');
        audio.play();
    })

    //actualizar lista de contactos

    socket.on('actualizarLista', (contactosAgregados) => {
        let insertar = $cardContactos.children[0].children[1].children[0].children[0].children[0]
        let fragment = ""
        for (i = 0; i < contactosAgregados.length; i++) {
            let notificacion = ""
            if (contactosAgregados[i].Notificacion == true) {
                notificacion = `
                    <span class="w-25 float-end text-end text-primary notification">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-circle-fill" viewBox="0 0 16 16">
                            <circle cx="8" cy="8" r="8"/>
                        </svg>
                    </span>
                `
            }
            let a = `
            <a href="javascript:void(0);" data-idreq="${contactosAgregados[i]._idReq}" data-id="${contactosAgregados[i]._id}" class="usuarios openChat text-body" data-usuario="${contactosAgregados[i].Nombres} ${contactosAgregados[i].Apellidos}">
                <div class="d-flex align-items-start mt-1 p-2 openChat openChatOnly" data-idreq="${contactosAgregados[i]._idReq}" data-id="${contactosAgregados[i]._id}">
                    <img src="${contactosAgregados[i].RutaImage}" height="50px" width="50px" class="me-2 rounded-circle openChat"  alt="Brandon Smith" data-idreq="${contactosAgregados[i]._idReq}" data-id="${contactosAgregados[i]._id}"/>
                    <div class="w-100 overflow-hidden openChat" data-idreq="${contactosAgregados[i]._idReq}" data-id="${contactosAgregados[i]._id}">
                        <h5 class="mt-0 mb-0 font-14 openChat" data-idreq="${contactosAgregados[i]._idReq}"  data-id="${contactosAgregados[i]._id}">
                            <span class="float-end text-muted font-12 openChat" data-idreq="${contactosAgregados[i]._idReq}"  data-id="${contactosAgregados[i]._id}">${contactosAgregados[i].Tiempo}</span> ${contactosAgregados[i].Nombres} ${contactosAgregados[i].Apellidos}
                        </h5>
                        <p class="mt-1 mb-0 text-muted font-14 openChat" data-idreq="${contactosAgregados[i]._idReq}"  data-id="${contactosAgregados[i]._id}">
                            ${notificacion}
                            <span class="w-75 openChat" data-idreq="${contactosAgregados[i]._idReq}"  data-id="${contactosAgregados[i]._id}">${contactosAgregados[i].Mensaje}</span>
                        </p>
                    </div>
                </div>
            </a>
            `
            fragment += a
        }
        insertar.innerHTML = fragment
    })


    //enviar mensaje

    const outputMessage = (dataEnvio) => {
        if (document.getElementById('usuarioChat').textContent == dataEnvio.username) {
            dataEnvio.Posicion = ''
        } else {
            dataEnvio.Posicion = 'odd'
        }
        let insertMessages = document.getElementById('conversation-list').children[0].children[1].children[0].children[0].children[0]
        if (dataEnvio.username == document.getElementById('usuarioChat').textContent || document.getElementById('usuarioChat').dataset.usuariopersonal == dataEnvio.username) {
            const contenido = `
                <li class="clearfix ${dataEnvio.Posicion}">
                    <div class="chat-avatar">
                        <img src="${dataEnvio.rutaImagen}" class="rounded" alt="${dataEnvio.username}}" />
                        <i> ${dataEnvio.time}</i>
                    </div>
                    <div class="conversation-text">
                        <div class="ctext-wrap">
                            <i>${dataEnvio.username}</i>
                            <p>
                                ${dataEnvio.text}
                            </p>
                        </div>
                    </div>
                </li>
            `
            insertMessages.innerHTML += contenido;
            document.getElementById('msg').focus()
        }
    }
} else {
    //actualizar estado de usuario
    let idActive = document.getElementById('usuarioId').dataset.id
    socket.on('id', (userId) => {
        let data = {
            userId,
            idActive
        }
        socket.emit('actualizarId', data);
    })
    socket.emit('inactivo', idActive)

    //recibir notificacion campana
    socket.on('campana', (notificaciones) => {

        let elementoCamapana = document.getElementById('insertNotification')
        elementoCamapana = elementoCamapana.children[0].children[1].children[0].children[0].children[0]
        elementoCamapana.innerHTML = ""
        let elementos = ""
        notificaciones.forEach(notificacion => {
            let elemento = `
            <a href="${notificacion.link}" class="dropdown-item p-0 notify-item card read-noti shadow-none mb-2">
                <div class="card-body">
                    <div class="d-flex align-items-center">
                        <div class="flex-shrink-0">
                            <div class="notify-icon">
                                <img src="${notificacion.Imagen}" height="50px" width="50px" class="img-fluid rounded-circle" alt="" />
                            </div>
                        </div>
                        <div class="flex-grow-1 text-truncate ms-2">
                            <h5 class="noti-item-title fw-semibold font-14">${notificacion.Titulo}<small class="fw-normal text-muted ms-1"></small></h5>
                            <small class="noti-item-subtitle text-muted">${notificacion.Mensaje}</small>
                        </div>
                    </div>
                </div>
            </a>
            `
            elementos += elemento
        })
        document.getElementById('topbar-notifydrop').innerHTML += `
            <span class="noti-icon-badge"></span>
        `
        elementoCamapana.innerHTML = elementos
    })
}