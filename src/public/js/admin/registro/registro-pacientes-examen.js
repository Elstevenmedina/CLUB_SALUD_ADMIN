const $form = d.getElementById('form'),
    $Nombres = d.getElementById('Nombres'),
    $Direccion = d.getElementById('Direccion'),
    $email = d.getElementById('email'),
    $emailConfirm = d.getElementById('emailConfirm'),
    $password = d.getElementById('password'),
    $insertError2 = d.getElementById('insertError2'),
    $Medico = d.getElementById('Medico'),
    $btnSubmit = d.getElementById('btnSubmit'),
    $Documento = d.getElementById('Documento'),
    $FechaNacimiento = d.getElementById('FechaNacimiento'),
    $Telefono = d.getElementById('Telefono'),
    $TipoFactura = d.getElementById('TipoFactura'),
    $inputs = d.querySelectorAll('input'),
    $Nota = d.getElementById('Nota'),
    $passwordConfirm = d.getElementById('passwordConfirm');

const enviar = (data) => {
    fetch('/registro/nuevo-paciente-examen', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        }).then(res => res.json())
        .then(data => {
            if (data.status === 'ok') {
                
                $btnSubmit.innerHTML = `Paciente registrado`;
                $insertError2.innerHTML = `
                <div class="alert alert-success" role="alert">
                    <i class="dripicons-wrong me-2"></i> Paciente registrado correctamente
                </div>
            `;

            } else {

                if(data.msg == 'El documento ingresado ya se encuentra registrado. Se autocompletaron los datos del paciente'){
                    $Nombres.value = data.validacionPaciente.Nombres
                    $Documento.value = data.validacionPaciente.Documento
                    $Direccion.value = data.validacionPaciente.Direccion
                    $FechaNacimiento.value = data.validacionPaciente.FechaNacimiento
                    $Telefono.value = data.validacionPaciente.Telefono
                    $TipoFactura.innerHTML = `<option value="" selected>${data.validacionPaciente.TipoFactura}</option>`
                    $Nota.value = data.validacionPaciente.Nota
                    $email.value = data.validacionPaciente.Email
                    $emailConfirm.value = data.validacionPaciente.Email
                }

                $btnSubmit.disabled = false;
                $btnSubmit.innerHTML = `Registrar paciente`;
                $insertError2.innerHTML = `
            <div class="alert alert-warning" role="alert">
                <i class="dripicons-wrong me-2"></i> ${data.msg}.
            </div>
            `;
            }
        })
}

$btnSubmit.addEventListener('click', (e) => {
    e.preventDefault();
    $inputs.forEach(input => {
        if (input.classList.contains('is-invalid')) {
            input.classList.remove('is-invalid');
        }
    })

    let medicos = []

    for (let i = 0; i < $Medico.length; i++) {
        if ($Medico[i].selected) {
            medicos.push($Medico[i].value)
        }
    }

    if ($Nombres.value === '') {
        $Nombres.classList.add('is-invalid');
    } else if ($FechaNacimiento.value === '' || !$FechaNacimiento.value) {
        $FechaNacimiento.classList.add('is-invalid');
    } else if ($Telefono.value === '' || !$Telefono.value) {
        $Telefono.classList.add('is-invalid');
    } else if ($TipoFactura.value === '' || !$TipoFactura.value || $TipoFactura.value == 0) {
        $TipoFactura.classList.add('is-invalid');
    } else if ($Documento.value === '') {
        $Documento.classList.add('is-invalid');
    } else if ($Direccion.value === '') {
        $Direccion.classList.add('is-invalid');
    } else if ($email.value === '') {
        $email.classList.add('is-invalid');
    } else if ($emailConfirm.value === '') {
        $emailConfirm.classList.add('is-invalid');
    }else if ($email.value !== $emailConfirm.value) {
        $insertError2.innerHTML = `
        <div class="alert alert-danger" role="alert">
            <i class="dripicons-wrong me-2"></i>Los correos no coinciden.
        </div>
        `
    } else if (medicos.length == 0) {
        $insertError2.innerHTML = `
        <div class="alert alert-danger" role="alert">
            <i class="dripicons-wrong me-2"></i>Debe seleccionar por lo menos un médico.
        </div>
        `
    } else {
        let data = {
            Nombres: $Nombres.value,
            Documento: $Documento.value,
            Medicos: medicos,
            Direccion: $Direccion.value,
            FechaNacimiento: $FechaNacimiento.value,
            Telefono: $Telefono.value,
            TipoFactura: $TipoFactura.value,
            Nota : $Nota.value,
            email: $email.value,
        }
        enviar(data);
        $btnSubmit.setAttribute('disabled', 'disabled');
        $btnSubmit.innerHTML = `
        <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
        Registrando datos...
        `
    }
})