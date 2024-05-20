const d = document,
    $form = d.getElementById('form'),
    $Nombres = d.getElementById('Nombres'),
    $Apellidos = d.getElementById('Apellidos'),
    $Cedula = d.getElementById('Cedula'),
    $Direccion = d.getElementById('Direccion'),
    $email = d.getElementById('email'),
    $insertError = d.getElementById('insertError'),
    $FechaNacimiento = d.getElementById('FechaNacimiento'),
    $Cargo = d.getElementById('Cargo'),
    $Rol = d.getElementById('Rol'),
    $rolesActivos = d.getElementById('rolesActivos'),
    $inputs = d.querySelectorAll('input'),
    $sucursal = d.getElementById('sucursal'),
    $btnSubmit = d.getElementById('btnSubmit');


const enviar = (data) => {
    fetch('/edicion/actualizar-personal', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        }).then(res => res.json())
        .then(data => {
            if (data.status === 'ok') {
                let textoRoles = ""
                for (i = 0; i < data.Role.length; i++) {
                    if (i === data.Role.length - 1) {
                        textoRoles += data.Role[i]
                    } else {
                        textoRoles += data.Role[i] + ", "
                    }
                }
                $rolesActivos.textContent = textoRoles
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

$form.addEventListener('submit', (e) => {
    e.preventDefault()
    let roles = []
    $Rol.querySelectorAll('option').forEach(option => {
        if (option.selected) {
            roles.push(option.value)
        }
    })
    $inputs.forEach(input => {
        if (input.classList.contains('is-invalid')) {
            input.classList.remove('is-invalid');
        }
    })
    if ($Nombres.value === '') {
        $Nombres.classList.add('is-invalid');
    } else if ($Apellidos.value === '') {
        $Apellidos.classList.add('is-invalid');
    } else if ($Cedula.value === '') {
        $Cedula.classList.add('is-invalid');
    } else if ($Direccion.value === '') {
        $Direccion.classList.add('is-invalid');
    } else if ($FechaNacimiento.value === '' || !$FechaNacimiento.value) {
        $FechaNacimiento.classList.add('is-invalid');
    } else if ($Cargo.value === '' || !$Cargo.value) {
        $Cargo.classList.add('is-invalid');
    } else if ($Rol.value === '' || !$Rol.value) {
        $Rol.classList.add('is-invalid');
    } else if ($email.value === '') {
        $email.classList.add('is-invalid');
    } else {
        if ((roles.find(data => data === "Master") || roles.find(data => data === "Sub-master")) && (roles.length > 1)) {
            $insertError.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <i class="dripicons-wrong me-2"></i> El personal solo puede poseer un nivel de usuario de "Master" o "Submaster".
            </div>
            `
        } else {
            let _id = $form.dataset.id;
            let data = {
                Nombres: $Nombres.value,
                Apellidos: $Apellidos.value,
                Cedula: $Cedula.value,
                Direccion: $Direccion.value,
                email: $email.value,
                Role: roles,
                FechaNacimiento: $FechaNacimiento.value,
                Cargo: $Cargo.value,
                _id: _id,
                email: $email.value,
                Sucursal : $sucursal.value
            }
            enviar(data);
            $btnSubmit.setAttribute('disabled', 'disabled');
            $btnSubmit.innerHTML = `
            <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
            Actualizando datos...
            `
        }
    }
})