const d = document,
    $form = d.getElementById('form'),
    $Nombres = d.getElementById('Nombres'),
    $Direccion = d.getElementById('Direccion'),
    $TipoDocumento = d.getElementById('TipoDocumento'),
    $email = d.getElementById('email'),
    $emailConfirm = d.getElementById('emailConfirm'),
    $password = d.getElementById('password'),
    $insertError = d.getElementById('insertError'),
    $Medico = d.getElementById('Medico'),
    $btnSubmit = d.getElementById('btnSubmit'),
    $Documento = d.getElementById('Documento'),
    $Nota = d.getElementById('Nota'),
    $FechaNacimiento = d.getElementById('FechaNacimiento'),
    $Telefono = d.getElementById('Telefono'),
    $TipoFactura = d.getElementById('TipoFactura'),
    $inputs = d.querySelectorAll('input'),
    $passwordConfirm = d.getElementById('passwordConfirm');

const enviar = (data) => {
    fetch('/registro/nuevo-paciente', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        }).then(res => res.json())
        .then(data => {
            if (data.status === 'ok') {
               location.href= "/nuevo-examen-admin"
            } else {
                $btnSubmit.disabled = false;
                $btnSubmit.innerHTML = `Registrar personal`;
                $insertError.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <i class="dripicons-wrong me-2"></i> ${data.msg}.
            </div>
            `;
            }
        })
}

$form.addEventListener('submit', (e) => {
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

    console.log(medicos)

    if ($Nombres.value === '') {
        $Nombres.classList.add('is-invalid');
    } else if ($FechaNacimiento.value === '' || !$FechaNacimiento.value) {
        $FechaNacimiento.classList.add('is-invalid');
    } else if ($Telefono.value === '' || !$Telefono.value) {
        $Telefono.classList.add('is-invalid');
    } else if ($TipoFactura.value === '' || !$TipoFactura.value || $TipoFactura.value == 0) {
        $TipoFactura.classList.add('is-invalid');
    }else if($TipoDocumento.value === "0"){
        $TipoDocumento.classList.add('is-invalid');
    }
    else if ($Documento.value === '') {
        $Documento.classList.add('is-invalid');
    } else if ($Direccion.value === '') {
        $Direccion.classList.add('is-invalid');
    } else if ($email.value === '') {
        $email.classList.add('is-invalid');
    } else if ($emailConfirm.value === '') {
        $emailConfirm.classList.add('is-invalid');
    } else if ($email.value !== $emailConfirm.value) {
        $insertError.innerHTML = `
        <div class="alert alert-danger" role="alert">
            <i class="dripicons-wrong me-2"></i>Los correos no coinciden.
        </div>
        `
    } else if (medicos.length == 0) {
        $insertError.innerHTML = `
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
            TipoDocumento: $TipoDocumento.value,
            FechaNacimiento: $FechaNacimiento.value,
            Nota: $Nota.value,
            Telefono: $Telefono.value,
            TipoFactura: $TipoFactura.value,
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