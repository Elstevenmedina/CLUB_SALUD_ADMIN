const d = document,
    $usuarios = d.querySelectorAll('.usuarios'),
    $dropdownItem = d.querySelectorAll('.dropdown-item'),
    $search = d.querySelector('#search');

$search.addEventListener('keyup', e => {
    e.preventDefault();
    $usuarios.forEach((usuario) => {
        usuario.textContent.toLocaleLowerCase().includes(e.target.value.toLocaleLowerCase()) ?
            usuario.parentElement.parentElement.parentElement.parentElement.classList.remove('filtro') :
            usuario.parentElement.parentElement.parentElement.parentElement.classList.add('filtro');
    })
})
d.addEventListener('click', e => {
    if (e.target.classList.contains('dropdown-item')) {
        e.preventDefault()
        alert('dropdown')
    }
    if (e.target.classList.contains('agregar')) {
        const id = e.target.dataset.id;
        const url = `/red/contactos/agregar/${id}`;
        fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(res => res.json())
            .then(data => {
                if (data.status == 'success') {
                    Swal.fire({
                        title: '¡Contacto agregado!',
                        text: 'El contacto ha sido agregado a tu lista de contactos',
                        icon: 'success',
                        confirmButtonText: 'Cerrar'
                    })
                    setTimeout(() => {
                        e.target.parentElement.innerHTML = `
                        <a href="javascript:void(0);" class="btn w-100 btn-success" data-bs-toggle="tooltip" data-bs-placement="top" title="¡Contacto agregado!"><i class="uil uil-user-check"></i></a>
                    `
                    }, 1000);
                } else {
                    Swal.fire({
                        title: '¡Error!',
                        text: 'El contacto no ha sido agregado a tu lista de contactos',
                        icon: 'error',
                        confirmButtonText: 'Cerrar'
                    })
                }
            })
    }
})