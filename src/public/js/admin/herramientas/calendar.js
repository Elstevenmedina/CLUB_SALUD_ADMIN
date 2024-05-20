const d = document,
$form = d.getElementById('form'),
$btnRegistar = d.getElementById('btnRegistrar'),
$btnEliminar = d.getElementById('btnEliminar'),
$title = d.getElementById('titleInput'),
$start = d.getElementById('start'),
$color = d.getElementById('color'),
$btnCancelar = d.getElementById('btnCancelar'),
$id = d.getElementById('id'),
myModal = new bootstrap.Modal(d.getElementById('modalCalendar'));

d.addEventListener('DOMContentLoaded', async () => {
    await fetch('/solicitar-fechas-calendario', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then((res) => {
        return res.json();
    }).then((res) => {
        var calendarEl = d.getElementById('calendar');
        var calendar = new FullCalendar.Calendar(calendarEl, {
          initialView: 'dayGridMonth',
          locale: 'es',
          headerToolbar: {
            left: 'prev next today',
            center: 'title',
            right: 'dayGridMonth timeGridWeek listWeek'
            
          },
          events: res,
          editable: true,
          dateClick : function (info) {
            d.getElementById('start').value = info.dateStr;
            $btnEliminar.classList.add('d-none');
            $btnRegistar.textContent = 'Guardar apunte';            
            d.getElementById('title').textContent = 'Nuevo apunte';
            myModal.show(); 
          },
        eventClick: function (info){
            $title.value = info.event.title;
            $start.value = info.event.startStr;
            $color.value = info.event.backgroundColor;
            $id.value = info.event.id;
            $btnEliminar.classList.remove('d-none');
            $btnRegistar.textContent = 'Actualizar apunte';            
            d.getElementById('title').textContent = 'Editar apunte';
            myModal.show()
        },
        eventDrop: function (info) {
            const id = info.event.id;
            const fecha = info.event.startStr;
            let data = {
                id,
                fecha
            }
            actualizarDrop(data);
        }
        });
        calendar.render();
        const actualizarDrop = async (data) => {
            await fetch('/actualizar-fecha-drop', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then((res) => {
                return res.json();
            })
            .then((res) => {
                const eventSources = calendar.getEventSources(); 
                for (i = 0; i < eventSources.length; i++) { 
                    eventSources[i].remove(); 
                } 
                calendar.addEventSource(res);
                calendar.refetchEvents();
                d.getElementById('id').value= '';
                $form.reset();
            })
        }
        const eliminar = async (data) => {
            await fetch('/eliminar-fecha-calendario', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then((res) => {
                return res.json();
            })
            .then((res) => {
                Swal.fire(
                    'Apunte eliminado',
                    'El apunte se ha eliminado correctamente',
                    'success'
                ) 
                myModal.hide();
                const eventSources = calendar.getEventSources(); 
                for (i = 0; i < eventSources.length; i++) { 
                    eventSources[i].remove(); 
                } 
                calendar.addEventSource(res.fechas);
                calendar.refetchEvents();
                d.getElementById('id').value= '';
                $form.reset();
            })
        }
        const enviar = async (data) => {
            await fetch('/nueva-fecha-calendario', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then((res) => {
                return res.json();
            })
            .then((res) => {
                if(res.error){
                    //asking for confirmation of a registration of a title that already exists
                    Swal.fire({
                        title: 'Aviso',
                        text: "Ya existe un apunte con el mismo titulo, ¿Desea registrarlo?",
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Si, registrar',
                        cancelButtonText: 'Cancelar'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            let data = {
                                id: $id.value,
                                title: $title.value,
                                start: $start.value,
                                color: $color.value,
                                registrarDuplicado: true
                            }
                            //loading with sweetalert2
            
                            Swal.fire({
                                title: 'Cargando...',
                                allowOutsideClick: false,
                                didOpen: () => {
                                    Swal.showLoading()
                                },
                            });
            
            
                            enviar(data)
                        }
                    })
                }else{
                    if(res.tipo === 'actualizacion'){
                        Swal.fire(
                            'Apunte actualizado',
                            'El apunte se ha actualizado correctamente',
                            'success'
                        ) 
                    }else if(res.tipo === 'nuevo'){
                        Swal.fire(
                            'Apunte registrado',
                            'El apunte se ha registrado correctamente',
                            'success'
                        ) 
                    } else{
                        Swal.fire(
                            'Apunte eliminado',
                            'El apunte se ha eliminado correctamente',
                            'success'
                        ) 
                    }
                    myModal.hide();
                    const eventSources = calendar.getEventSources(); 
                    for (i = 0; i < eventSources.length; i++) { 
                        eventSources[i].remove(); 
                    } 
                    calendar.addEventSource(res.fechas);
                    calendar.refetchEvents();
                    d.getElementById('id').value= '';
                    Swal.close();
                    $form.reset();
                }
            })
        }
        $form.addEventListener('submit', e => {
            e.preventDefault();
            if($title.value == '' || $color.value == ''){
                Swal.fire(
                    'Aviso',
                    'Todos los campos son requeridos para crear el apunte',
                    'warning'
                )
            }else{  
                let data = {
                    id: $id.value,
                    title: $title.value,
                    start: $start.value,
                    color: $color.value
                }
                //loading with sweetalert2

                Swal.fire({
                    title: 'Cargando...',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading()
                    },
                });


                enviar(data);
            }
        })
        $btnCancelar.onclick = () => {
            myModal.hide();
        }
        $btnEliminar.onclick = () => {
            Swal.fire({
                title: '¿Estás seguro/a?',
                text: "¡No podrás revertir esto!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: '¡Sí, eliminar!',
                cancelButtonText: 'Cancelar'
              }).then((result) => {
                if (result.value) {
                    let data = {
                        id: $id.value,
                     }
                    eliminar(data);
                }
              })
        }
    })
  });