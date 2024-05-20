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
    $inputs = d.querySelectorAll('input'),
    $FechaNacimiento = d.getElementById('FechaNacimiento'),
    $Cargo = d.getElementById('Cargo'),
    $Rol = d.getElementById('Rol'),
    $sucursal = d.getElementById('sucursal'),
    $nuevaSucursal = d.getElementById('nuevaSucursal'),
    $passwordConfirm = d.getElementById('passwordConfirm');


$nuevaSucursal.onclick = () =>{
    Swal.fire({
        title:'Nueva Sucursal',
        html: `
            <div>
                <label for="nuevaSucursalInput">Nombre sucursal</label>
                <input class="form-control" name="nuevaSucursalInput" id="nuevaSucursalInput" placeholder="Nombre de la sucursal">
            </div>
        `,
        showCancelButton: true,
        showCofnirmButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            let nuevaSucursalValue = d.getElementById('nuevaSucursalInput').value;
            if(nuevaSucursalValue === ''){
                Swal.showValidationMessage(`El campo no puede estar vacio`)
            }
            //validate if the sucursal already exist inside the select $sucursal
            let sucursales = [];
            $sucursal.querySelectorAll('option').forEach(option => {
                sucursales.push(option.value)
            })
            if(sucursales.find(data => data === nuevaSucursalValue)){
                Swal.showValidationMessage(`La sucursal ya existe`)
            }

            return nuevaSucursalValue;
        }
    }).then((data) =>{
        if(data.isConfirmed){
            fetch('/nueva-sucursal',{
                method:'POST',
                body: JSON.stringify({sucursal: data.value}),
                headers: {
                    'Content-Type': 'application/json',
                }
            }).then((data) =>{
                return data.json()
            })
            .then((data) =>{
                if(data.ok){
                    $sucursal.innerHTML += `<option value="${data.sucursal}">${data.sucursal}</option>`
                }
            })
        }
    })
}


const enviar = (data) => {
    fetch('/registro/nuevo-personal', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        }).then(res => res.json())
        .then(data => {
            if (data.status === 'ok') {
                $("#Rol").select2("val", "0");
                $form.reset();
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
        $insertError.innerHTML = `
        <div class="alert alert-danger" role="alert">
            <i class="dripicons-wrong me-2"></i> Tiene que seleccionar una nivel de usuario.
        </div>
        `
    } else if ($email.value === '') {
        $email.classList.add('is-invalid');
    } else if ($emailConfirm.value === '') {
        $emailConfirm.classList.add('is-invalid');
    } else if ($password.value === '') {
        $password.classList.add('is-invalid');
    } else if ($passwordConfirm.value === '') {
        $passwordConfirm.classList.add('is-invalid');
    } else if($sucursal.value === '' || !$sucursal.value || $sucursal.value == 0){
        $insertError.innerHTML = `
        <div class="alert alert-danger" role="alert">
            <i class="dripicons-wrong me-2"></i> Tiene que seleccionar una sucursal.
        </div>
        `
    }
     else if ($email.value.toLowerCase() !== $emailConfirm.value.toLowerCase()) {
        $insertError.innerHTML = `
        <div class="alert alert-danger" role="alert">
            <i class="dripicons-wrong me-2"></i> Los correos no coinciden.
        </div>
        `
    } else if ($password.value !== $passwordConfirm.value) {
        $insertError.innerHTML = `
        <div class="alert alert-danger" role="alert">
            <i class="dripicons-wrong me-2"></i> Las contraseñas no coinciden.
        </div>
        `
    } else {
        if ((roles.find(data => data === "Master") || roles.find(data => data === "Sub-master")) && (roles.length > 1)) {
            $insertError.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <i class="dripicons-wrong me-2"></i> El personal solo puede poseer un nivel de usuario de "Master" o "Submaster".
            </div>
            `
        } else {
            let data = {
                Nombres: $Nombres.value,
                Apellidos: $Apellidos.value,
                Cedula: $Cedula.value,
                Direccion: $Direccion.value,
                email: $email.value.toLowerCase(),
                Role: roles,
                FechaNacimiento: $FechaNacimiento.value,
                Cargo: $Cargo.value,
                password: $password.value,
                Sucursal: $sucursal.value
            }
            enviar(data);
            $btnSubmit.disabled = true;
            $btnSubmit.innerHTML = `
            <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
            Registrando datos...
            `
        }

    }
})