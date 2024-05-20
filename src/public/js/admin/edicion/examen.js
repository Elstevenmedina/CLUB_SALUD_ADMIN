    const d = document,
        $form = d.getElementById('form'),
        $Estado = d.getElementById('Estado'),
        $AgregadoPosterior = d.getElementById('AgregadoPosterior'),
        $campoTexto = d.getElementById('campoTexto'),
        $Subtipo3 = d.getElementById('Subtipo3'),
        $Subtipo2 = d.getElementById('Subtipo2'),
        $Nombre = d.getElementById('Nombre'),
        $Subtipo1 = d.getElementById('Subtipo1'),
        $TipoExamen = d.getElementById('TipoExamen'),
        $insertError = d.getElementById('insertError'),
        $inputs = d.querySelectorAll('input'),
        $Puntos = d.getElementById('Puntos'),
        $Especialidades = d.getElementById('Especialidad'),
        $btnRegistrarEspecialidad = d.getElementById('btnRegistrarEspecialidad'),
        $CantidadMaxima = d.getElementById('CantidadMaxima'),
        $Perfil = d.getElementById('Perfil'),
        $Comisiones = d.getElementById('Comisiones'),
        $btnSubmit = d.getElementById('btnSubmit');

    d.addEventListener('click', e => {
        if (e.target.id === 'btnRegistrarTipo') {
            Swal.fire({
                title: 'Nuevo tipo de examen',
                html: `<input type="text" id="Tipo" name="Tipo" class="swal2-input" placeholder="Tipo">`,
                confirmButtonText: 'Registrar',
                focusConfirm: false,
                preConfirm: () => {
                    const Tipo = Swal.getPopup().querySelector('#Tipo').value
                    if (!Tipo) {
                        Swal.showValidationMessage(`Por favor intrdozuca un tipo de examen`)
                    }
                    return { Tipo: Tipo, }
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    fetch('/nuevo-tipo-examen', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(result.value)
                    }).then((res) => {
                        return res.json()
                    }).then((data) => {
                        if (data.success) {
                            $TipoExamen.innerHTML = `<option value="0" selected>--Seleccione un tipo de examen--</option>`
                            data.Tipos.forEach(tipo => {
                                const $option = d.createElement('option');
                                $option.value = tipo.Nombre;
                                $option.innerHTML = tipo.Nombre;
                                $TipoExamen.appendChild($option);
                            })
                            $insertError.innerHTML = `
                    <div class="alert alert-success" role="alert">
                        <i class="dripicons-wrong me-2"></i> Tipo de examen registrado correctamente.
                    </div>
                    `
                            setTimeout(() => {
                                $insertError.innerHTML = ""
                            }, 10000);
                        } else {
                            $insertError.innerHTML = `
                    <div class="alert alert-danger" role="alert">
                        <i class="dripicons-wrong me-2"></i> El tipo de examen ya se encuentra registrado.
                    </div>
                    `
                            setTimeout(() => {
                                $insertError.innerHTML = ""
                            }, 10000);
                        }
                    })
                }
            })
        }
        if (e.target.id === 'btnRegistrarEspecialidad') {
            Swal.fire({
                title: 'Nueva especialidad',
                html: `<input type="text" id="nuevaEspecialidad" name="nuevaEspecialidad" class="swal2-input" placeholder="Especialidad">`,
                confirmButtonText: 'Registrar',
                focusConfirm: false,
                preConfirm: () => {
                    const nuevaEspecialidad = Swal.getPopup().querySelector('#nuevaEspecialidad').value
                    if (!nuevaEspecialidad) {
                        Swal.showValidationMessage(`Por favor intrdozuca una especialidad`)
                    }
                    return { Especialidad: nuevaEspecialidad, }
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    fetch('/nuevo-tipo-especialidad', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(result.value)
                    }).then((res) => {
                        return res.json()
                    }).then((data) => {
                        if (data.success) {
                            data.Tipos.forEach(tipo => {
                                const $option = d.createElement('option');
                                $option.value = tipo.Nombre;
                                $option.innerHTML = tipo.Nombre;
                                $Especialidades.appendChild($option);
                            })
                            $insertError.innerHTML = `
                        <div class="alert alert-success" role="alert">
                            <i class="dripicons-success me-2"></i> Tipo de examen registrado correctamente.
                        </div>
                        `
                            setTimeout(() => {
                                $insertError.innerHTML = ""
                            }, 10000);
                        } else {
                            $insertError.innerHTML = `
                        <div class="alert alert-danger" role="alert">
                            <i class="dripicons-wrong me-2"></i> El tipo de examen ya se encuentra registrado.
                        </div>
                        `
                            setTimeout(() => {
                                $insertError.innerHTML = ""
                            }, 10000);
                        }
                    })
                }
            })
        }
    })

    $form.addEventListener('submit', (e) => {
        e.preventDefault();
        $inputs.forEach(input => {
            $(input).removeClass('is-invalid');
        })
        
        if ($Nombre.value === '') {
            console.log("Nombre")
            $Nombre.classList.add('is-invalid');
        } else if ($Puntos.value === '' || $Puntos.value === 0) {
            console.log("puntos")
            $Puntos.classList.add('is-invalid');
        }
        else if($CantidadMaxima.value <= 0){
            $CantidadMaxima.classList.add('is-invalid');
        }
        else if ($TipoExamen.value === '0') {
            $TipoExamen.classList.add('is-invalid');
        } else if ($Subtipo3.value != '' && ($Subtipo2.value === '' || $Subtipo1.value === '')) {
            $Subtipo2.classList.add('is-invalid');
            $Subtipo1.classList.add('is-invalid');
        } else if ($Subtipo2.value && $Subtipo1.value === '') {
            $Subtipo1.classList.add('is-invalid');
        } else {
            
            let Especialidades = []
            let Perfiles = []
            for(i=0; i< $Especialidades.length; i++){
                //validar si esta seleccionado 
                if($Especialidades[i].selected){
                    //agregarlo al array
                    Especialidades.push($Especialidades[i].value)
                }
            }
            for(i=0; i< $Perfil.length; i++){
                //validar si esta seleccionado 
                if($Perfil[i].selected){
                    //agregarlo al array
                    Perfiles.push($Perfil[i].value)
                }
            }

            let _id = $form.dataset.id;
            let data = {
                _id: _id,
                Nombre: $Nombre.value,
                Tipo: $TipoExamen.value,
                Subtipo1: $Subtipo1.value,
                Subtipo2: $Subtipo2.value,
                Subtipo3: $Subtipo3.value,
                AgregadoPosterior: $AgregadoPosterior.value,
                Estado: $Estado.value,
                CantidadMaxima: $CantidadMaxima.value,
                Puntos: $Puntos.value,
                campoTexto: $campoTexto.value,
                Comisiones: $Comisiones.checked,
                Especialidad: Especialidades,
                Perfiles:Perfiles,
            }
            $btnSubmit.setAttribute('disabled', 'disabled');
            $btnSubmit.innerHTML = `
        <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
        Registrando datos...
        `
            fetch('/edicion/actualizar-examen', {
                    method: 'POST',
                    body: JSON.stringify(data),
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    }
                }).then(res => res.json())
                .then(data => {
                    if (data.status === 'ok') {
                        $insertError.innerHTML = `
                <div class="alert alert-success" role="alert">
                    <i class="dripicons-checkmark me-2"></i> ${data.msg}.
                </div>
                `;
                        $btnSubmit.disabled = false;
                        $btnSubmit.innerHTML = `Actualizar datos`;
                        setTimeout(() => {
                            $insertError.innerHTML = ""
                        }, 15000);
                    } else {
                        $btnSubmit.disabled = false;
                        $btnSubmit.innerHTML = `Actualizar datos`;
                        $insertError.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    <i class="dripicons-wrong me-2"></i> ${data.msg}.
                </div>
                `;
                    }
                })
        }
    })