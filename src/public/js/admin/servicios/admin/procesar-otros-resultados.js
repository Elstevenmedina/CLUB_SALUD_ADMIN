const d = document,
    $Resultado = d.getElementById('Resultado'),
    $insertError = d.getElementById('insertError'),
    $btnCargar = d.getElementById('btnCargar');

$btnCargar.onclick = () => {
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
                    <p class="text-muted">Al seleccionar "Si" no se podran cargar luego más resultados al examen. Por favor, valida a antes de procesar. </p>
                </div>
            `,
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonText: 'Procesar',
            cancelButtonText: 'Cancelar',
        }).then((data) => {
            if (data.isConfirmed) {
                formData.append('Resultados', d.getElementById('checkResultado').checked)
                axios.post(`/examenes/cargar-otros-resultados/${_id}`, formData)
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
                        confirmButtonText: 'Cargar mas',
                        cancelButtonText: 'Finalizar carga',
                        cancelButtonColor: '#d33',
                        showCancelButton: true,
                        allowOutsideClick: false,
        
                    }).then((data) => {
                        if (data.isConfirmed){
                            $Resultado.value = ""
                        }else{
                            swal.fire({
                                title: 'Enviando correos electronicos...',
                                html: `
                                <div class="my-3 spinner-border avatar-lg text-success" role="status"></div>
                                `,
                                allowOutsideClick: false,
                                showCancelButton: false,
                                showConfirmButton: false
                            })
                            axios.post(`/enviar-correos-electronicos-otros/${_id}`)
                            .then((res) =>{
                                window.location.href = '/examenes-atendidos'
                            })
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
