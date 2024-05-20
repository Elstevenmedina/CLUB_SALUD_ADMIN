const d = document,
    $Resultado = d.getElementById('Resultado'),
    $insertError = d.getElementById('insertError'),
    $btnRechazar = d.getElementById('btnRechazar'),
    $btnFinalizar = d.getElementById('btnFinalizar'),
    $btnCargar = d.getElementById('btnCargar');

let numero = window.location.pathname.split('/')[3]

$btnFinalizar.onclick = () => {
    //Asking for confirmation with sweetalert

    Swal.fire({
        title: '¿Está seguro de finalizar el examen?',
        text: "Esta acción no se puede deshacer",
        icon: 'warning',
        html: `
            <h3>Procesamiento de resultados</h3>
            <div>
                <label for="checkResultados">¿Se cargaron todos los resultados?</label>
                </br>
                <input type="checkbox" id="checkResultado" data-switch="bool"/>
                <label for="checkResultado" data-on-label="Si" data-off-label="No"></label>
                <p class="text-muted">Al seleccionar “Si” no se podrán cargar luego más resultados al examen. Por favor, valida antes de procesar. </p>
            </div>
    `,
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si, finalizar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if(result.isConfirmed){
            let dataEnvio = {
                Resultados: d.getElementById('checkResultado').checked
            }
            fetch(`/examenes/finalizar-examen/${numero}`,{
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataEnvio)
            })
            .then((data) =>{
                return data.json()
            })
            .then((data) =>{
                
                if(!data.ok){
                    swal.fire({
                        title: 'Error',
                        icon: 'error',
                        text: data.message,
                        type: 'error',
                        confirmButtonText: 'Aceptar',
                        allowOutsideClick: false,
                    })
                }else{
                    let _idExamen = data._id
                    window.location.href = '/examenes-nuevos'
                    //swal.fire({
                    //    title: 'Enviando correos electronicos...',
                    //    html: `
                    //    <div class="my-3 spinner-border avatar-lg text-success" role="status"></div>
                    //    `,
                    //    allowOutsideClick: false,
                    //    showCancelButton: false,
                    //    showConfirmButton: false
                    //}).then((data) =>{
                    //})
                    //axios.post(`/enviar-correos-electronicos/${_idExamen}`)
                    //.then((res) =>{
                    //})
                }
            })
        }
    })
}

$btnCargar.onclick = () => {
    if(d.getElementById('btnSubmit').textContent != 'Paciente registrado'){
        //error with swal alert
        swal.fire({
            title: 'Error',
            icon: 'error',
            text: 'Debe registrar al paciente antes de cargar los resultados',
            type: 'error',
            confirmButtonText: 'Aceptar',
            allowOutsideClick: false,
        })
        
    }else{
        if ($Resultado.files[0]) {
            let _id = $Resultado.dataset.examen
            let formData = new FormData()
            formData.append('Resultado', $Resultado.files[0]);
            $btnCargar.setAttribute('disabled', 'disabled');
            $btnCargar.innerHTML = `
            <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                Registrando resultado...
            `
            swal.fire({
                title: 'Resumen de solicitud',
                type: 'info',
                html: `
                    <h3>Procesamiento de resultados</h3>
                    <div>
                        <label for="checkResultados">¿Se cargaron todos los resultados?</label>
                        </br>
                        <input type="checkbox" id="checkResultado" data-switch="bool"/>
                        <label for="checkResultado" data-on-label="Si" data-off-label="No"></label>
                        <p class="text-muted">Al seleccionar “Si” no se podrán cargar luego más resultados al examen. Por favor, valida antes de procesar. </p>
                    </div>
                `,
                showCloseButton: true,
                showCancelButton: true,
                confirmButtonText: 'Procesar',
                cancelButtonText: 'Cancelar',
            }).then((data) => {
                if (data.isConfirmed) {
                    formData.append('Resultados', d.getElementById('checkResultado').checked)
                    axios.post(`/examenes/cargar-resultados/${_id}-${document.getElementById('Documento').value}`, formData)
                    /*.then(res => {
                        return res.json()
                    })*/
                    .then(res => {
                        $btnCargar.removeAttribute('disabled');
                        $btnCargar.innerHTML = `Cargar resultados`
                        Swal.fire({
                            title: 'Éxito',
                            icon: 'success',
                            text: 'Resultado cargado con éxito. ¿Desea cargar otros resultados?',
                            type: 'success',
                            confirmButtonText: 'Ok',
                            cancelButtonColor: '#d33',
                            allowOutsideClick: false,
            
                        }).then((data) => {
                            if (data.isConfirmed){
                                $Resultado.value = ""
                            }
                        })
                    })
                    .catch(err => console.log(err));
                }else{
                    $btnCargar.removeAttribute('disabled');
                    $btnCargar.innerHTML = `Cargar resultados`
                }
            })
        } else {
            $insertError.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <i class="dripicons-wrong me-2"></i> No se ha agregado ningún documento.
            </div>
            `
            setTimeout(() => {
                $insertError.innerHTML = ""
            }, 10000);
        }
    }
}

$btnRechazar.onclick = () => {
    let _id = $Resultado.dataset.examen
    Swal.fire({
        title: '¿Estás seguro que quieres rechazar el examen?',
        text: "Esta acción no se puede deshacer",
        html: `
        <div class="form-group">
            <label for="ObservacionRechazo">Motivo:</label>
            <textarea class="form-control text-dark bg-light" id="ObservacionRechazo" rows="3" placeholder="Introduzca el motivo de rechazo" 
            style="border:none; border-bottom: 1px solid #1890ff; padding: 5px 10px; outline: none;" focus></textarea>
        </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si, rechazar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.value) {
            let data = {
                ObservacionRechazo: d.getElementById('ObservacionRechazo').value
            }
            axios.post(`/examenes/rechazar-examen/${_id}`, data)
                .then(res => {
                    Swal.fire({
                        title: 'Éxito',
                        icon: 'success',
                        text: 'Examen rechazado con éxito',
                        type: 'success',
                        confirmButtonText: 'Aceptar',
                        showCancelButton: false,
                        allowOutsideClick: false,

                    }).then(() => {
                        window.location.href = res.data.ruta
                    })
                })
                .catch(err => console.log(err));
        }
    })
}