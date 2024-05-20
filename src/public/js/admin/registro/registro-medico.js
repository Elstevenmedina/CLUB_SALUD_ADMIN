const d = document,
    $form = d.getElementById('form'),
    $Nombres = d.getElementById('Nombres'),
    $Apellidos = d.getElementById('Apellidos'),
    $Cedula = d.getElementById('Cedula'),
    $Direccion = d.getElementById('Direccion'),
    $email = d.getElementById('email'),
    $emailConfirm = d.getElementById('emailConfirm'),
    $password = d.getElementById('password'),
    $insertError = d.getElementById('insertError'),
    $btnSubmit = d.getElementById('btnSubmit'),
    $Telefono = d.getElementById('Telefono'),
    $Especialidad = d.getElementById('Especialidad'),
    $FechaNacimiento = d.getElementById('FechaNacimiento'),
    $Cuenta = d.getElementById('Cuenta'),
    $input = d.querySelectorAll('input'),
    $Medalla = d.getElementById('Medalla'),
    $numeroCIV = d.getElementById('numeroCIV'),
    $grupoSanguineo = d.getElementById('grupoSanguineo'),
    $passwordConfirm = d.getElementById('passwordConfirm');


const enviar = (data) => {
    fetch('/registro/nuevo-medico', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        }).then(res => res.json())
        .then(data => {
            console.log(data)
            if (data.status === 'ok') {
                $form.reset();
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

$form.addEventListener('submit', (e) => {
    e.preventDefault();

    $input.forEach(input => {
        if (input.classList.contains('is-invalid')) {
            input.classList.remove('is-invalid');
        }
    })
    let errors = 0
    if ($Nombres.value === '') {
        $Nombres.classList.add('is-invalid');
        errors++
    } if ($Apellidos.value === '') {
        $Apellidos.classList.add('is-invalid');
        errors++
    } if ($Medalla.value == 0 || !$Medalla.value || $Medalla.value == ""){
        $Medalla.classList.add('is-invalid');
        errors++
    }if ($Cedula.value === '') {
        $Cedula.classList.add('is-invalid');
        errors++
    }
    if($numeroCIV.value === ""){
        $numeroCIV.classList.add('is-invalid')
        errors++
    }
    if($grupoSanguineo.value === ""){
        $grupoSanguineo.classList.add('is-invalid')
        errors++
    }
    if ($Direccion.value === '') {
        $Direccion.classList.add('is-invalid');
        errors++
    }
    if ($Telefono.value === '') {
        $Telefono.classList.add('is-invalid');
        errors++
    }if ($Especialidad.value === '') {
        $Especialidad.classList.add('is-invalid');
        errors++
    }if ($FechaNacimiento.value === '' || !$FechaNacimiento.value) {
        $FechaNacimiento.classList.add('is-invalid');
        errors++
    }if ($Cuenta.value === '') {
        $Cuenta.classList.add('is-invalid');
        errors++
    }if ($email.value === '') {
        $email.classList.add('is-invalid');
        errors++
    }if ($emailConfirm.value === '') {
        $emailConfirm.classList.add('is-invalid');
        errors++
    }if ($email.value !== $emailConfirm.value) {
        $insertError.innerHTML = `
        <div class="alert alert-danger" role="alert">
            <i class="dripicons-wrong me-2"></i>Los correos no coinciden.
        </div>
        `
    } if(errors == 0) {
        let data = {
            Nombres: $Nombres.value,
            Medalla: $Medalla.value,
            Apellidos: $Apellidos.value,
            Cedula: $Cedula.value,
            Direccion: $Direccion.value,
            email: $email.value,
            Telefono: $Telefono.value,
            Especialidad: $Especialidad.value,
            FechaNacimiento: $FechaNacimiento.value,
            Cuenta: $Cuenta.value,
            numeroCIV: $numeroCIV.value,
            grupoSanguineo: $grupoSanguineo.value,
        }
        enviar(data);
        $btnSubmit.setAttribute('disabled', 'disabled');
        $btnSubmit.innerHTML = `
        <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
        Registrando datos...
        `
    }
})