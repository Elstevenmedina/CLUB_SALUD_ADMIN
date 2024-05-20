const d = document,
    $form = d.getElementById('form'),
    $Nombres = d.getElementById('Nombres'),
    $Documento = d.getElementById('Documento'),
    $Direccion = d.getElementById('Direccion'),
    $email = d.getElementById('email'),
    $insertError = d.getElementById('insertError'),
    $TipoFactura = d.getElementById('TipoFactura'),
    $Medico = d.getElementById('Medico'),
    $Telefono = d.getElementById('Telefono'),
    $Nota = d.getElementById('Nota'),
    $FechaNacimiento = d.getElementById('FechaNacimiento'),
    $TipoDocumento = d.getElementById('TipoDocumento'),
    $btnSubmit = d.getElementById('btnSubmit');


const enviar = (data) => {
    fetch('/edicion/actualizar-paciente', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        }).then(res => res.json())
        .then(data => {
            if (data.status === 'ok') {
               
                $btnSubmit.disabled = false;
                $btnSubmit.innerHTML = `Actualizar datos`;
                $insertError.innerHTML = `
            <div class="alert alert-success" role="alert">
                <i class="dripicons-checkmark me-2"></i> ${data.msg}.
            </div>
            `;
                setTimeout(() => {
                    $insertError.innerHTML = ""
                }, 10000);
            } else {
                $btnSubmit.disabled = false;
                $btnSubmit.innerHTML = `Actualizar datos`;
                $insertError.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <i class="dripicons-wrong me-2"></i> ${data.msg}.
            </div>
            `;
                setTimeout(() => {
                    $insertError.innerHTML = ""
                }, 10000);
            }
        })
}

$TipoFactura
$Medico
$Telefono
$FechaNacimiento

$form.addEventListener('submit', (e) => {
    e.preventDefault();

    let medicos = []

    for (let i = 0; i < $Medico.length; i++) {
        if ($Medico[i].selected) {
            medicos.push($Medico[i].value)
        }
    }

    if ($Nombres.value === '') {
        $Nombres.classList.add('is-invalid');
    }else if ($Documento.value === '') {
        $Documento.classList.add('is-invalid');
    } else if ($Direccion.value === '') {
        $Direccion.classList.add('is-invalid');
    } else if ($email.value === '') {
        $email.classList.add('is-invalid');
    } else if ($TipoFactura.value === '' || $TipoFactura.value == 0) {
        $TipoFactura.classList.add('is-invalid');
    } else if ($Medico.value === '' || $Medico.value == 0) {
        $Medico.classList.add('is-invalid');
    }else if($TipoDocumento.value === "" || $TipoDocumento.value === "0"){
        $TipoDocumento.classList.add('is-invalid');
    }
     else if ($Telefono.value === '') {
        $Telefono.classList.add('is-invalid');
    } else if ($FechaNacimiento.value === '' || !$FechaNacimiento.value) {
        $FechaNacimiento.classList.add('is-invalid');
    } else if (medicos.length == 0) {
        $insertError.innerHTML = `
        <div class="alert alert-danger" role="alert">
            <i class="dripicons-wrong me-2"></i>Debe seleccionar por lo menos un médico.
        </div>
        `
    }  else {
        let _id = $form.dataset.id;
        let data = {
            Nombres: $Nombres.value,
            Documento: $Documento.value,
            Direccion: $Direccion.value,
            _id: _id,
            email: $email.value,
            Nota: $Nota.value,
            TipoDocumento : $TipoDocumento.value,
            TipoFactura: $TipoFactura.value,
            Medico: medicos,
            Telefono: $Telefono.value,
            FechaNacimiento: $FechaNacimiento.value,
        }
        enviar(data);
        $btnSubmit.setAttribute('disabled', 'disabled');
        $btnSubmit.innerHTML = `
        <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
        Actualizando datos...
        `
    }
})