    const d = document,
        $form = d.getElementById('form'),
        $Nombre = d.getElementById('Nombre'),
        $TipoExamen = d.getElementById('TipoExamen'),
        $insertError = d.getElementById('insertError'),
        $campoTexto = d.getElementById('campoTexto'),
        $Subtipo3 = d.getElementById('Subtipo3'),
        $Subtipo2 = d.getElementById('Subtipo2'),
        $Subtipo1 = d.getElementById('Subtipo1'),
        $inputs = d.querySelectorAll('input'),
        $AgregadoPosterior = d.getElementById('AgregadoPosterior'),
        $Puntos = d.getElementById('Puntos'),
        $Comisiones = d.getElementById('Comisiones'),
        $Especialidades = d.getElementById('Especialidad'),
        $btnRegistrarEspecialidad = d.getElementById('btnRegistrarEspecialidad'),
        $CantidadMaxima = d.getElementById('CantidadMaxima'),
        $Perfil = d.getElementById('Perfil'),
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
                            $Especialidades.innerHTML = `<option value="0" selected>--Seleccione un tipo de examen--</option>`
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
        let errors = 0
        if ($Nombre.value === '') {
            $Nombre.classList.add('is-invalid');
            errors++
        }if ($Puntos.value === '' || $Puntos.value == 0) {
            $Puntos.classList.add('is-invalid');
            errors++
        }
        if ($TipoExamen.value === '0') {
            $TipoExamen.classList.add('is-invalid');
            errors++
        }
        if ($Especialidades.value === '0') {
            $Especialidades.classList.add('is-invalid');
            errors++
        }
        if($CantidadMaxima.value <= 0){
            $CantidadMaxima.classList.add('is-invalid');
            errors++
        }
        if ($Subtipo3.value != '' && ($Subtipo2.value === '' || $Subtipo1.value === '')) {
            $Subtipo2.classList.add('is-invalid');
            $Subtipo1.classList.add('is-invalid');
            errors++
        }if ($Subtipo2.value && $Subtipo1.value === '') {
            errors++
            $Subtipo1.classList.add('is-invalid');
        } if(errors == 0){

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

            let data = {
                Nombre: $Nombre.value,
                Tipo: $TipoExamen.value,
                Subtipo1: $Subtipo1.value,
                Subtipo2: $Subtipo2.value,
                Subtipo3: $Subtipo3.value,
                CantidadMaxima: $CantidadMaxima.value,
                Puntos: $Puntos.value,
                AgregadoPosterior: $AgregadoPosterior.value,
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
            fetch('/registro/nuevo-examen', {
                    method: 'POST',
                    body: JSON.stringify(data),
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    }
                }).then(res => res.json())
                .then(data => {
                    if (data.status === 'ok') {
                        $form.reset();
                        $("#TipoExamen").select2("val", "0");
                        $("#Especialidad").select2("val", "");
                        $insertError.innerHTML = `
                <div class="alert alert-success" role="alert">
                    <i class="dripicons-checkmark me-2"></i> ${data.msg}.
                </div>
                `;
                        $btnSubmit.disabled = false;
                        $btnSubmit.innerHTML = `Registrar examen`;
                        setTimeout(() => {
                            $insertError.innerHTML = ""
                        }, 10000);
                    } else {
                        $btnSubmit.disabled = false;
                        $btnSubmit.innerHTML = `Registrar examen`;
                        $insertError.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    <i class="dripicons-wrong me-2"></i> ${data.msg}.
                </div>
                `;
                    }
                })
        }
    })