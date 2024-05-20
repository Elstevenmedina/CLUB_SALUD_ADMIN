const d = document,
    $form = d.getElementById('form'),
    $Nombres = d.getElementById('Nombres'),
    $Direccion = d.getElementById('Direccion'),
    $email = d.getElementById('email'),
    $emailConfirm = d.getElementById('emailConfirm'),
    $password = d.getElementById('password'),
    $insertError = d.getElementById('insertError'),
    $Medico = d.getElementById('Medico'),
    $btnSubmit = d.getElementById('btnSubmit'),
    $Documento = d.getElementById('Documento'),
    $FechaNacimiento = d.getElementById('FechaNacimiento'),
    $Telefono = d.getElementById('Telefono'),
    $TipoDocumento = d.getElementById('TipoDocumento'),
    $TipoFactura = d.getElementById('TipoFactura'),
    $btnNuevoTipoDocumento = d.getElementById('btnNuevoTipoDocumento'),
    $inputs = d.querySelectorAll('input'),
    $Nota = d.getElementById('Nota'),
    $passwordConfirm = d.getElementById('passwordConfirm');



$btnNuevoTipoDocumento.onclick = () =>{
    Swal.fire({
        title: "Introduzca el nuevo tipo de documento",
        html: `
            <input class="form-control" id="nuevoTipoDocumento" placeholder="Introduzca el tipo de documento"/>
        `,
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: 'Registrar',
        cancelButtonText:'Cancelar',
        preConfirm: () =>{
            let nuevoTipoDocumento = d.getElementById('nuevoTipoDocumento')
            if(nuevoTipoDocumento.value == ""){
                Swal.showValidationMessage('Debe introducir un tipo de documento')
            }
            return {nuevoTipoDocumento : nuevoTipoDocumento.value}
        }
      })
      .then((data) =>{
        if(data.isConfirmed){
            let nuevoTipoDocumento =data.value.nuevoTipoDocumento
            fetch('/nuevo-tipo-documento',{
                method:'POST',
                headers:{
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({nuevoTipoDocumento: data.value.nuevoTipoDocumento})
            }).then((data) =>{
                return data.json()
            })
            .then((data) =>{
                if(data.ok){
                    $TipoDocumento.innerHTML += `<option value="${nuevoTipoDocumento}">${nuevoTipoDocumento}</option>`
                    
                }
            })

        }
      })
   
}

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
                $form.reset();
                $("#Medico").select2("val", "0");
                $("#TipoFactura").select2("val", "0");
                $insertError.innerHTML = `
            <div class="alert alert-success" role="alert">
                <i class="dripicons-checkmark me-2"></i> ${data.msg}.
            </div>
            `;
                $btnSubmit.disabled = false;
                $btnSubmit.innerHTML = `Registrar personal`;
                setTimeout(() => {
                    $insertError.innerHTML = ""
                }, 15000);
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

    if ($Nombres.value === '') {
        $Nombres.classList.add('is-invalid');
    } else if ($FechaNacimiento.value === '' || !$FechaNacimiento.value) {
        $FechaNacimiento.classList.add('is-invalid');
    } else if ($Telefono.value === '' || !$Telefono.value) {
        $Telefono.classList.add('is-invalid');
    } else if ($TipoFactura.value === '' || !$TipoFactura.value || $TipoFactura.value == 0) {
        $TipoFactura.classList.add('is-invalid');
    }  else if ($Documento.value === '') {
        $Documento.classList.add('is-invalid');
    }else if($TipoDocumento.value == 0){
        $TipoDocumento.classList.add('is-invalid');
    }
     else if ($Direccion.value === '') {
        $Direccion.classList.add('is-invalid');
    } else if ($email.value === '') {
        $email.classList.add('is-invalid');
    } else if ($emailConfirm.value === '') {
        $emailConfirm.classList.add('is-invalid');
    }else if ($email.value !== $emailConfirm.value) {
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
            FechaNacimiento: $FechaNacimiento.value,
            Telefono: $Telefono.value,
            TipoFactura: $TipoFactura.value,
            Nota : $Nota.value,
            TipoDocumento : $TipoDocumento.value,
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