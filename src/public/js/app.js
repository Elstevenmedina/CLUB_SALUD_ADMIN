/* Template Name: Bootgen - Responsive Multipurpose Template
   Author: Shreethemes
   Email: support@shreethemes.in
   Version: 1.2.0
   Updated: December 2019 
   File Description: Main JS file of the template
*/

// Preloader
// window.onload = function loader() { 
//     setTimeout(() => {
//         document.getElementById('preloader').style.visibility = 'hidden';
//         document.getElementById('preloader').style.opacity = '0';
//     }, 350);
// } 


// Menu sticky
function windowScroll() {
    const navbar = document.getElementById("navbar");
    if (
        document.body.scrollTop >= 50 ||
        document.documentElement.scrollTop >= 50
    ) {
        navbar.classList.add("nav-sticky");
    } else {
        navbar.classList.remove("nav-sticky");
    }
}

window.addEventListener('scroll', (ev) => {
    ev.preventDefault();
    windowScroll();
})

// back-to-top
var mybutton = document.getElementById("back-to-top");
window.onscroll = function () {
    scrollFunction();
};
function scrollFunction() {
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        console.log(document.body.scrollTop);
        mybutton.style.display = "block";
    } else {
        mybutton.style.display = "none";
    }
}
function topFunction() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}
