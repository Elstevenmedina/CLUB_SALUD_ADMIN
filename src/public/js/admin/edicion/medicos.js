const d = document,
    $form = d.getElementById('form'),
    $Nombres = d.getElementById('Nombres'),
    $Apellidos = d.getElementById('Apellidos'),
    $Cedula = d.getElementById('Cedula'),
    $Direccion = d.getElementById('Direccion'),
    $email = d.getElementById('email'),
    $insertError = d.getElementById('insertError'),
    $FechaNacimiento = d.getElementById('FechaNacimiento'),
    $Telefono = d.getElementById('Telefono'),
    $Especialidad = d.getElementById('Especialidad'),
    $Cuenta = d.getElementById('Cuenta'),
    $input = d.querySelectorAll('input'),
    $Medalla = d.getElementById('Medalla'),
    $btnDesactivar = d.getElementById('btnDesactivar'),
    $btnEliminar = d.getElementById('btnEliminar'),
    $numeroCIV = d.getElementById('numeroCIV'),
    $grupoSanguineo = d.getElementById('grupoSanguineo'),
    $btnSubmit = d.getElementById('btnSubmit');


let _id = window.location.pathname.split('/')[3];

const activarCuenta = () =>{
    //asking for confirmation with sweetalert
    Swal.fire({
        title: '¿Estas seguro?',
        text: "Esto activará la cuenta y le permitirá Iniciar sesión al usuario",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si, activar cuenta'
    }).then((result) => {
        if (result.isConfirmed) {
            //loading with Sweetalert
            Swal.fire({
                title: 'Activando cuenta',
                html: 'Por favor espere...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading()
                },
            })
            fetch(`/edicion/activar-cuenta-medico/${_id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            }).then(res => res.json())
            .then(data => {
                if (data.ok) {
                    Swal.fire(
                        '¡Activada!',
                        'La cuenta ha sido activada.',
                        'success'
                    ).then((data) =>{
                        location.reload()
                    })
                } else {
                    Swal.fire(
                        'Error!',
                        'Ha ocurrido un error al activar la cuenta. Por favor, intente de nuevo o comunicate con soporte',
                        'error'
                    )
                }
            })
        }
    })
}
const desactivarCuenta = () =>{
    //asking for confirmation with sweetalert
    Swal.fire({
        title: '¿Estas seguro?',
        text: "Esto desactivara la cuenta y no le permitira iniciar sesión",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si, desactivar cuenta'
    }).then((result) => {
        if (result.isConfirmed) {
            //loading with Sweetalert
                Swal.fire({
                title: 'Desactivando cuenta',
                html: 'Por favor espere...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading()
                },
            })
    
            fetch(`/edicion/desactivar-cuenta-medico/${_id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            }).then(res => res.json())
            .then(data => {
                if (data.ok) {
                    Swal.fire(
                        'Desactivado!',
                        'La cuenta ha sido desactivada correctamente',
                        'success'
                    ).then((data) =>{
                        location.reload()
                    })
                } else {
                    Swal.fire(
                        'Error!',
                        'Ha ocurrido un error.',
                        'error'
                    )
                }
            })
        }
    })
}

const eliminarCuenta = () =>{
    //asking for confirmation with sweetalert
    Swal.fire({
        title: '¿Estas seguro?',
        text: "Esto eliminará la cuenta del medico y no se podrá acceder a sus datos",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si, desactivar cuenta'
    }).then((result) => {
        if (result.isConfirmed) {
            //loading with Sweetalert
            Swal.fire({
                title: 'Eliminando cuenta',
                html: 'Por favor espere...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading()
                },
            })

            fetch(`/edicion/eliminar-cuenta-medico/${_id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            }).then(res => res.json())
            .then(data => {
                if (data.ok) {
                    Swal.fire(
                        'Eliminada!',
                        'La cuenta ha sido eliminada correctamente',
                        'success'
                        ).then((data) =>{
                            location.href = "/directorio-medico"
                        })
                    } else {
                        Swal.fire(
                        'Error!',
                        'Ha ocurrido un error al desactivar la cuenta. Por favor, intente de nuevo o comunicate con soporte',
                        'error'
                    )
                }
            })
        }
    })
}


d.addEventListener('click', e=>{
    if(e.target == $btnEliminar){
        eliminarCuenta()
    }
    if(e.target == $btnDesactivar){
        desactivarCuenta()
    }
    if(e.target.matches('#btnActivar')){
        activarCuenta()
    }
})


const enviar = (data) => {
    fetch('/edicion/actualizar-medico', {
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
    }if ($Apellidos.value === '') {
        $Apellidos.classList.add('is-invalid');
        errors++ 
    }
    if ($Cedula.value === '') {
        $Cedula.classList.add('is-invalid');
        errors++ 
    }
    if($numeroCIV.value == ""){
        $numeroCIV.classList.add('is-invalid')
        errors++
    }
    if($grupoSanguineo.value == ""){
        $grupoSanguineo.classList.add('is-invalid')
        errors++
    }
    if ($Direccion.value === '') {
        $Direccion.classList.add('is-invalid');
        errors++ 
    }if ($Telefono.value === '') {
        $Telefono.classList.add('is-invalid');
        errors++ 
    }if ($Especialidad.value === '') {
        $Especialidad.classList.add('is-invalid');
        errors++ 
    }if ($Cuenta.value === '') {
        $Cuenta.classList.add('is-invalid');
        errors++ 
    }if ($FechaNacimiento.value === '' || !$FechaNacimiento) {
        $FechaNacimiento.classList.add('is-invalid');
        errors++ 
    }if ($email.value === '') {
        $email.classList.add('is-invalid');
        errors++ 
    } if(errors == 0) {
        let _id = $form.dataset.id;
        let data = {
            Nombres: $Nombres.value,
            Apellidos: $Apellidos.value,
            Cedula: $Cedula.value,
            Direccion: $Direccion.value,
            _id: _id,
            FechaNacimiento: $FechaNacimiento.value,
            Telefono: $Telefono.value,
            Especialidad: $Especialidad.value,
            Cuenta: $Cuenta.value,
            Medalla: $Medalla.value,
            email: $email.value,
            numeroCIV: $numeroCIV.value,
            grupoSanguineo: $grupoSanguineo.value,
        }
        console.log(data)
        enviar(data);
        $btnSubmit.setAttribute('disabled', 'disabled');
        $btnSubmit.innerHTML = `
        <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
        Actualizando datos...
        `
    }
})