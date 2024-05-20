const CACHE_NAME = "my-cache-v32";
const CACHE_VERSION = 32;

const urlsToCache = [
  "/",
  "/manifest.json",
  "/assets/css/icons-rtl.min.css.map",
  "/assets/css/app.css",
  "/assets/css/app.min.css",
  "/assets/css/app.min.css.map",
  "/assets/css/app-creative.css",
  "/assets/css/app-creative.min.css",
  "/assets/css/app-creative.min.css.map",
  "/assets/css/app-creative-rtl.min.css",
  "/assets/css/app-creative-rtl.min.css.map",
  "/assets/css/app-modern.css",
  "/assets/css/app-modern.min.css",
  "/assets/css/app-modern.min.css.map",
  "/assets/css/app-modern-rtl.min.css",
  "/assets/css/app-modern-rtl.min.css.map",
  "/assets/css/app-rtl.min.css",
  "/assets/css/app-rtl.min.css.map",
  "/assets/css/icons.css",
  "/assets/css/icons.min.css",
  "/assets/css/icons.min.css.map",
  "/assets/css/icons-rtl.min.css",
  "/assets/css/vendor/throbber.gif",
  "/assets/css/vendor/32px.png",
  "/assets/css/vendor/britecharts.min.css",
  "/assets/css/vendor/buttons.bootstrap5.css",
  "/assets/css/vendor/dataTables.bootstrap5.css",
  "/assets/css/vendor/fixedColumns.bootstrap5.css",
  "/assets/css/vendor/fixedHeader.bootstrap5.css",
  "/assets/css/vendor/frappe-gantt.css",
  "/assets/css/vendor/fullcalendar.min.css",
  "/assets/css/vendor/jquery-jvectormap-1.2.2.css",
  "/assets/css/vendor/jstree.min.css",
  "/assets/css/vendor/quill.bubble.css",
  "/assets/css/vendor/quill.core.css",
  "/assets/css/vendor/quill.snow.css",
  "/assets/css/vendor/responsive.bootstrap5.css",
  "/assets/css/vendor/select.bootstrap5.css",
  "/assets/css/vendor/simplemde.min.css",
  "/assets/data/vendor/ajax_demo_children.json",
  "/assets/fonts/unicons.woff2",
  "/assets/fonts/dripicons-v2.eot",
  "/assets/fonts/dripicons-v2.svg",
  "/assets/fonts/dripicons-v2.ttf",
  "/assets/fonts/dripicons-v2.woff",
  "/assets/fonts/materialdesignicons-webfont.eot",
  "/assets/fonts/materialdesignicons-webfont.ttf",
  "/assets/fonts/materialdesignicons-webfont.woff",
  "/assets/fonts/materialdesignicons-webfont.woff2",
  "/assets/fonts/Nunito-Bold.eot",
  "/assets/fonts/Nunito-Bold.svg",
  "/assets/fonts/Nunito-Bold.ttf",
  "/assets/fonts/Nunito-Bold.woff",
  "/assets/fonts/Nunito-Light.eot",
  "/assets/fonts/Nunito-Light.svg",
  "/assets/fonts/Nunito-Light.ttf",
  "/assets/fonts/Nunito-Light.woff",
  "/assets/fonts/Nunito-Light.woff2",
  "/assets/fonts/Nunito-Regular.eot",
  "/assets/fonts/Nunito-Regular.svg",
  "/assets/fonts/Nunito-Regular.ttf",
  "/assets/fonts/Nunito-Regular.woff",
  "/assets/fonts/Nunito-SemiBold.eot",
  "/assets/fonts/Nunito-SemiBold.svg",
  "/assets/fonts/Nunito-SemiBold.ttf",
  "/assets/fonts/Nunito-SemiBold.woff",
  "/assets/fonts/unicons.eot",
  "/assets/fonts/unicons.svg",
  "/assets/fonts/unicons.ttf",
  "/assets/fonts/unicons.woff",
  "/assets/images/waves_blue.png",
  "/assets/images/barcode.png",
  "/assets/images/bg-auth.jpg",
  "/assets/images/bg-auth2.jpeg",
  "/assets/images/bg-pattern.png",
  "/assets/images/bg-pattern-dark.png",
  "/assets/images/bg-pattern-light.svg",
  "/assets/images/email-campaign.svg",
  "/assets/images/favicon.ico",
  "/assets/images/features-1.svg",
  "/assets/images/features-2.svg",
  "/assets/images/file-searching.svg",
  "/assets/images/help-icon.svg",
  "/assets/images/ico-instagram.png",
  "/assets/images/ico-messenger.png",
  "/assets/images/logo.png",
  "/assets/images/logo_sm.png",
  "/assets/images/logo_sm_dark.png",
  "/assets/images/logo-dark.png",
  "/assets/images/logo-light.png",
  "/assets/images/mail_sent.svg",
  "/assets/images/maintenance.svg",
  "/assets/images/report.svg",
  "/assets/images/startman.svg",
  "/assets/images/startup.svg",
  "/assets/images/waves.png",
  "/assets/images/medals/silver.png",
  "/assets/images/medals/bronze.png",
  "/assets/images/medals/gold.png",
  "/assets/images/users/avatar-4.jpg",
  "/assets/images/users/avatar-1.jpg",
  "/assets/images/users/avatar-2.jpg",
  "/assets/images/users/avatar-3.jpg",
  "/assets/js/pages/demo.widgets.js",
  "/assets/js/pages/dashboard-projects.js",
  "/assets/js/pages/demo.apex-area.js",
  "/assets/js/pages/demo.apex-bar.js",
  "/assets/js/pages/demo.apex-bubble.js",
  "/assets/js/pages/demo.apex-candlestick.js",
  "/assets/js/pages/demo.apex-column.js",
  "/assets/js/pages/demo.apex-heatmap.js",
  "/assets/js/pages/demo.apex-line.js",
  "/assets/js/pages/demo.apex-mixed.js",
  "/assets/js/pages/demo.apex-pie.js",
  "/assets/js/pages/demo.apex-radar.js",
  "/assets/js/pages/demo.apex-radialbar.js",
  "/assets/js/pages/demo.apex-scatter.js",
  "/assets/js/pages/demo.apex-sparklines.js",
  "/assets/js/pages/demo.britechart.js",
  "/assets/js/pages/demo.calendar.js",
  "/assets/js/pages/demo.chartjs.js",
  "/assets/js/pages/demo.crm-dashboard.js",
  "/assets/js/pages/demo.crm-management.js",
  "/assets/js/pages/demo.crm-project.js",
  "/assets/js/pages/demo.customers.js",
  "/assets/js/pages/demo.dashboard.js",
  "/assets/js/pages/demo.dashboard-analytics.js",
  "/assets/js/pages/demo.dashboard-medicos.js",
  "/assets/js/pages/demo.dashboard-wallet.js",
  "/assets/js/pages/demo.datatable-init.js",
  "/assets/js/pages/demo.form-wizard.js",
  "/assets/js/pages/demo.google-maps.js",
  "/assets/js/pages/demo.inbox.js",
  "/assets/js/pages/demo.jstree.js",
  "/assets/js/pages/demo.materialdesignicons.js",
  "/assets/js/pages/demo.products.js",
  "/assets/js/pages/demo.profile.js",
  "/assets/js/pages/demo.project-detail.js",
  "/assets/js/pages/demo.project-gantt.js",
  "/assets/js/pages/demo.quilljs.js",
  "/assets/js/pages/demo.sellers.js",
  "/assets/js/pages/demo.simplemde.js",
  "/assets/js/pages/demo.sparkline.js",
  "/assets/js/pages/demo.tasks.js",
  "/assets/js/pages/demo.timepicker.js",
  "/assets/js/pages/demo.toastr.js",
  "/assets/js/pages/demo.typehead.js",
  "/assets/js/pages/demo.vector-maps.js",
  "/assets/js/ui/component.todo.js",
  "/assets/js/ui/component.chat.js",
  "/assets/js/ui/component.dragula.js",
  "/assets/js/ui/component.fileupload.js",
  "/assets/js/ui/component.range-slider.js",
  "/assets/js/ui/component.rating.js",
  "/assets/js/ui/component.scrollbar.js",
  "/assets/js/vendor/typeahead.bundle.min.js",
  "/assets/js/vendor/apexcharts.min.js",
  "/assets/js/vendor/britecharts.min.js",
  "/assets/js/vendor/buttons.bootstrap5.min.js",
  "/assets/js/vendor/buttons.flash.min.js",
  "/assets/js/vendor/buttons.html5.min.js",
  "/assets/js/vendor/buttons.print.min.js",
  "/assets/js/vendor/chart.min.js",
  "/assets/js/vendor/d3.min.js",
  "/assets/js/vendor/dataTables.bootstrap5.js",
  "/assets/js/vendor/dataTables.buttons.min.js",
  "/assets/js/vendor/dataTables.checkboxes.min.js",
  "/assets/js/vendor/dataTables.keyTable.min.js",
  "/assets/js/vendor/dataTables.responsive.min.js",
  "/assets/js/vendor/dataTables.select.min.js",
  "/assets/js/vendor/dragula.min.js",
  "/assets/js/vendor/dropzone.min.js",
  "/assets/js/vendor/fixedColumns.bootstrap5.min.js",
  "/assets/js/vendor/fixedHeader.bootstrap5.min.js",
  "/assets/js/vendor/frappe-gantt.min.js",
  "/assets/js/vendor/fullcalendar.min.js",
  "/assets/js/vendor/gmaps.min.js",
  "/assets/js/vendor/handlebars.min.js",
  "/assets/js/vendor/ion.rangeSlider.min.js",
  "/assets/js/vendor/jquery.dataTables.min.js",
  "/assets/js/vendor/jquery.rateit.min.js",
  "/assets/js/vendor/jquery.sparkline.min.js",
  "/assets/js/vendor/jquery-jvectormap-1.2.2.min.js",
  "/assets/js/vendor/jquery-jvectormap-au-mill-en.js",
  "/assets/js/vendor/jquery-jvectormap-ca-lcc-en.js",
  "/assets/js/vendor/jquery-jvectormap-es-merc.js",
  "/assets/js/vendor/jquery-jvectormap-es-mill.js",
  "/assets/js/vendor/jquery-jvectormap-europe-mill-en.js",
  "/assets/js/vendor/jquery-jvectormap-fr-merc-en.js",
  "/assets/js/vendor/jquery-jvectormap-in-mill-en.js",
  "/assets/js/vendor/jquery-jvectormap-uk-mill-en.js",
  "/assets/js/vendor/jquery-jvectormap-us-il-chicago-mill-en.js",
  "/assets/js/vendor/jquery-jvectormap-us-merc-en.js",
  "/assets/js/vendor/jquery-jvectormap-world-mill-en.js",
  "/assets/js/vendor/jquery-ui.min.js",
  "/assets/js/vendor/jstree.min.js",
  "/assets/js/vendor/quill.min.js",
  "/assets/js/vendor/responsive.bootstrap5.min.js",
  "/assets/js/vendor/simplemde.min.js",
  "/assets/js/vendor.min.js.map",
  "/assets/js/app.js",
  "/assets/js/app.min.js",
  "/assets/js/app.min.js.map",
  "/assets/js/vendor.js",
  "/assets/js/vendor.min.js",
  "/audio/notificacion.mp3",
  "/css/colors/red.css",
  "/css/colors/blue.css",
  "/css/colors/default.css",
  "/css/colors/green.css",
  "/css/tobii.min.css",
  "/css/animate.css",
  "/css/animations-delay.css",
  "/css/bootstrap.min.css",
  "/css/bootstrap.min.css.map",
  "/css/bootstrap-datepicker.min.css",
  "/css/datepicker.min.css",
  "/css/flexslider.css",
  "/css/fullcalendar.min.css",
  "/css/jquery.timepicker.css",
  "/css/jquery.timepicker.min.css",
  "/css/magnific-popup.css",
  "/css/materialdesignicons.css.map",
  "/css/materialdesignicons.min.css",
  "/css/materialdesignicons.min.css.map",
  "/css/owl.carousel.min.css",
  "/css/owl.theme.css",
  "/css/owl.transitions.css",
  "/css/pe-icon-7-stroke.css",
  "/css/slick.css",
  "/css/slick-theme.css",
  "/css/style.css",
  "/css/style.css.map",
  "/css/style.min.css",
  "/css/style.min.css.map",
  "/css/swiper.min.css",
  "/css/tiny-slider.css",
  "/css/tiny-slider.css.map",
  "/fonts/slick.woff",
  "/fonts/ajax-loader.gif",
  "/fonts/materialdesignicons-webfont.eot",
  "/fonts/materialdesignicons-webfont.svg",
  "/fonts/materialdesignicons-webfont.ttf",
  "/fonts/materialdesignicons-webfont.woff",
  "/fonts/materialdesignicons-webfont.woff2",
  "/fonts/Pe-icon-7-stroke.eot",
  "/fonts/Pe-icon-7-stroke.svg",
  "/fonts/Pe-icon-7-stroke.ttf",
  "/fonts/Pe-icon-7-stroke.woff",
  "/fonts/slick.ttf",
  "/images/business/team04.jpg",
  "/images/business/01.jpg",
  "/images/business/02.jpg",
  "/images/business/03.jpg",
  "/images/business/04.jpg",
  "/images/business/about.jpg",
  "/images/business/blog01.jpg",
  "/images/business/blog02.jpg",
  "/images/business/blog03.jpg",
  "/images/business/cancel.png",
  "/images/business/check.png",
  "/images/business/collaboration.png",
  "/images/business/ideas.png",
  "/images/business/logo.png",
  "/images/business/logo-light.png",
  "/images/business/risks.png",
  "/images/business/team01.jpg",
  "/images/business/team02.jpg",
  "/images/business/team03.jpg",
  "/images/icons/twitter.png",
  "/images/icons/facebook.png",
  "/images/icons/icon.png",
  "/images/icons/instagram.png",
  "/images/pwa/splash_screens/iPhone_14_Pro_portrait.png",
  "/images/pwa/splash_screens/4__iPhone_SE__iPod_touch_5th_generation_and_later_landscape.png",
  "/images/pwa/splash_screens/4__iPhone_SE__iPod_touch_5th_generation_and_later_portrait.png",
  "/images/pwa/splash_screens/8.3__iPad_Mini_landscape.png",
  "/images/pwa/splash_screens/8.3__iPad_Mini_portrait.png",
  "/images/pwa/splash_screens/9.7__iPad_Pro__7.9__iPad_mini__9.7__iPad_Air__9.7__iPad_landscape.png",
  "/images/pwa/splash_screens/9.7__iPad_Pro__7.9__iPad_mini__9.7__iPad_Air__9.7__iPad_portrait.png",
  "/images/pwa/splash_screens/10.2__iPad_landscape.png",
  "/images/pwa/splash_screens/10.2__iPad_portrait.png",
  "/images/pwa/splash_screens/10.5__iPad_Air_landscape.png",
  "/images/pwa/splash_screens/10.5__iPad_Air_portrait.png",
  "/images/pwa/splash_screens/10.9__iPad_Air_landscape.png",
  "/images/pwa/splash_screens/10.9__iPad_Air_portrait.png",
  "/images/pwa/splash_screens/11__iPad_Pro__10.5__iPad_Pro_landscape.png",
  "/images/pwa/splash_screens/11__iPad_Pro__10.5__iPad_Pro_portrait.png",
  "/images/pwa/splash_screens/12.9__iPad_Pro_landscape.png",
  "/images/pwa/splash_screens/12.9__iPad_Pro_portrait.png",
  "/images/pwa/splash_screens/icon.png",
  "/images/pwa/splash_screens/iPhone_8__iPhone_7__iPhone_6s__iPhone_6__4.7__iPhone_SE_landscape.png",
  "/images/pwa/splash_screens/iPhone_8__iPhone_7__iPhone_6s__iPhone_6__4.7__iPhone_SE_portrait.png",
  "/images/pwa/splash_screens/iPhone_8_Plus__iPhone_7_Plus__iPhone_6s_Plus__iPhone_6_Plus_landscape.png",
  "/images/pwa/splash_screens/iPhone_8_Plus__iPhone_7_Plus__iPhone_6s_Plus__iPhone_6_Plus_portrait.png",
  "/images/pwa/splash_screens/iPhone_11__iPhone_XR_landscape.png",
  "/images/pwa/splash_screens/iPhone_11__iPhone_XR_portrait.png",
  "/images/pwa/splash_screens/iPhone_11_Pro_Max__iPhone_XS_Max_landscape.png",
  "/images/pwa/splash_screens/iPhone_11_Pro_Max__iPhone_XS_Max_portrait.png",
  "/images/pwa/splash_screens/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_landscape.png",
  "/images/pwa/splash_screens/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_portrait.png",
  "/images/pwa/splash_screens/iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_landscape.png",
  "/images/pwa/splash_screens/iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_portrait.png",
  "/images/pwa/splash_screens/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_landscape.png",
  "/images/pwa/splash_screens/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_portrait.png",
  "/images/pwa/splash_screens/iPhone_14_Pro_landscape.png",
  "/images/pwa/splash_screens/iPhone_14_Pro_Max_landscape.png",
  "/images/pwa/splash_screens/iPhone_14_Pro_Max_portrait.png",
  "/images/pwa/icon-512x512.png",
  "/images/pwa/icon-192x192.png",
  "/images/pwa/icon-256x256.png",
  "/images/pwa/icon-384x384.png",
  "/images/favicon.ico",
  "/js/typed.js",
  "/js/app.js",
  "/js/bootstrap.bundle.min.js",
  "/js/bootstrap.bundle.min.js.map",
  "/js/bootstrap-datepicker.min.js",
  "/js/contact.js",
  "/js/counter.init.js",
  "/js/datepicker.init.js",
  "/js/datepicker.min.js",
  "/js/datetimepicker.init.js",
  "/js/easypiechart.init.js",
  "/js/es.js",
  "/js/feather.min.js",
  "/js/feather.min.js.map",
  "/js/fullcalendar.min.js",
  "/js/gallery.init.js",
  "/js/jquery.easypiechart.min.js",
  "/js/jquery.min.js",
  "/js/jquery.timepicker.min.js",
  "/js/main.js",
  "/js/masonry.pkgd.min.js",
  "/js/moment.js",
  "/js/parallax.js",
  "/js/shuffle.min.js",
  "/js/shuffle.min.js.map",
  "/js/sweetalert2.all.min.js",
  "/js/swiper.init.js",
  "/js/swiper.min.js",
  "/js/switcher.js",
  "/js/tiny-slider.js",
  "/js/tiny-slider.js.map",
  "/js/tiny-slider-init.js",
  "/js/tobii.min.js",
  "/js/typed.init.js",
  "/js/admin/activacion/activacion-cuentas.js",
  "/js/admin/edicion/usuarios.js",
  "/js/admin/edicion/cuenta.js",
  "/js/admin/edicion/cuenta-medico.js",
  "/js/admin/edicion/cuenta-paciente.js",
  "/js/admin/edicion/examen.js",
  "/js/admin/edicion/medicos.js",
  "/js/admin/edicion/pacientes.js",
  "/js/admin/edicion/personal.js",
  "/js/admin/herramientas/calendar.js",
  "/js/admin/red/contactos.js",
  "/js/admin/registro/registro-personal.js",
  "/js/admin/registro/registro-examenes.js",
  "/js/admin/registro/registro-medico.js",
  "/js/admin/registro/registro-pacientes.js",
  "/js/admin/registro/registro-pacientes-rapido.js",
  "/js/admin/servicios/admin/procesar-otros-resultados.js",
  "/js/admin/servicios/admin/procesar-examenes.js",
  "/js/admin/servicios/admin/procesar-examenes-nuevos.js",
  "/js/admin/servicios/admin/procesar-examenes-resolicitados.js",
  "/js/admin/servicios/resolicitar-examen.js",
  "/js/admin/servicios/info-examenes.js",
  "/js/admin/servicios/info-examenes2.js",
  "/js/admin/servicios/info-resultados.js",
  "/js/admin/servicios/nuevo-examen-admin.js",
  "/js/admin/servicios/nuevo-examen-doctor.js",
  "/js/admin/tema.js",
  "/sign-in/css/bootstrap/bootstrap-reboot.css",
  "/sign-in/css/bootstrap/bootstrap-grid.css",
  "/sign-in/css/style.css",
  "/sign-in/css/bootstrap.min.css",
  "/sign-in/css/bootstrap.min.css.map",
  "/sign-in/css/owl.carousel.min.css",
  "/sign-in/fonts/icomoon/demo-files/demo.js",
  "/sign-in/fonts/icomoon/demo-files/demo.css",
  "/sign-in/fonts/icomoon/style.css",
  "/sign-in/fonts/icomoon/demo.html",
  "/sign-in/fonts/icomoon/selection.json",
  "/sign-in/images/undraw_remotely_2j6y.svg",
  "/sign-in/images/bg_1.jpg",
  "/sign-in/images/login-image.png",
  "/sign-in/images/logo.png",
  "/sign-in/images/register-image.png",
  "/sign-in/js/popper.min.js",
  "/sign-in/js/bootstrap.min.js",
  "/sign-in/js/jquery-3.3.1.min.js",
  "/sign-in/js/main.js",
  "/sign-in/js/owl.carousel.min.js",
  "/sign-in/scss/bootstrap/mixins/_visibility.scss",
  "/sign-in/scss/bootstrap/mixins/_alert.scss",
  "/sign-in/scss/bootstrap/mixins/_background-variant.scss",
  "/sign-in/scss/bootstrap/mixins/_badge.scss",
  "/sign-in/scss/bootstrap/mixins/_border-radius.scss",
  "/sign-in/scss/bootstrap/mixins/_box-shadow.scss",
  "/sign-in/scss/bootstrap/mixins/_breakpoints.scss",
  "/sign-in/scss/bootstrap/mixins/_buttons.scss",
  "/sign-in/scss/bootstrap/mixins/_caret.scss",
  "/sign-in/scss/bootstrap/mixins/_clearfix.scss",
  "/sign-in/scss/bootstrap/mixins/_deprecate.scss",
  "/sign-in/scss/bootstrap/mixins/_float.scss",
  "/sign-in/scss/bootstrap/mixins/_forms.scss",
  "/sign-in/scss/bootstrap/mixins/_gradients.scss",
  "/sign-in/scss/bootstrap/mixins/_grid.scss",
  "/sign-in/scss/bootstrap/mixins/_grid-framework.scss",
  "/sign-in/scss/bootstrap/mixins/_hover.scss",
  "/sign-in/scss/bootstrap/mixins/_image.scss",
  "/sign-in/scss/bootstrap/mixins/_list-group.scss",
  "/sign-in/scss/bootstrap/mixins/_lists.scss",
  "/sign-in/scss/bootstrap/mixins/_nav-divider.scss",
  "/sign-in/scss/bootstrap/mixins/_pagination.scss",
  "/sign-in/scss/bootstrap/mixins/_reset-text.scss",
  "/sign-in/scss/bootstrap/mixins/_resize.scss",
  "/sign-in/scss/bootstrap/mixins/_screen-reader.scss",
  "/sign-in/scss/bootstrap/mixins/_size.scss",
  "/sign-in/scss/bootstrap/mixins/_table-row.scss",
  "/sign-in/scss/bootstrap/mixins/_text-emphasis.scss",
  "/sign-in/scss/bootstrap/mixins/_text-hide.scss",
  "/sign-in/scss/bootstrap/mixins/_text-truncate.scss",
  "/sign-in/scss/bootstrap/mixins/_transition.scss",
  "/sign-in/scss/bootstrap/utilities/_visibility.scss",
  "/sign-in/scss/bootstrap/utilities/_align.scss",
  "/sign-in/scss/bootstrap/utilities/_background.scss",
  "/sign-in/scss/bootstrap/utilities/_borders.scss",
  "/sign-in/scss/bootstrap/utilities/_clearfix.scss",
  "/sign-in/scss/bootstrap/utilities/_display.scss",
  "/sign-in/scss/bootstrap/utilities/_embed.scss",
  "/sign-in/scss/bootstrap/utilities/_flex.scss",
  "/sign-in/scss/bootstrap/utilities/_float.scss",
  "/sign-in/scss/bootstrap/utilities/_overflow.scss",
  "/sign-in/scss/bootstrap/utilities/_position.scss",
  "/sign-in/scss/bootstrap/utilities/_screenreaders.scss",
  "/sign-in/scss/bootstrap/utilities/_shadows.scss",
  "/sign-in/scss/bootstrap/utilities/_sizing.scss",
  "/sign-in/scss/bootstrap/utilities/_spacing.scss",
  "/sign-in/scss/bootstrap/utilities/_stretched-link.scss",
  "/sign-in/scss/bootstrap/utilities/_text.scss",
  "/sign-in/scss/bootstrap/vendor/_rfs.scss",
  "/sign-in/scss/bootstrap/bootstrap-reboot.scss",
  "/sign-in/scss/bootstrap/_alert.scss",
  "/sign-in/scss/bootstrap/_badge.scss",
  "/sign-in/scss/bootstrap/_breadcrumb.scss",
  "/sign-in/scss/bootstrap/_button-group.scss",
  "/sign-in/scss/bootstrap/_buttons.scss",
  "/sign-in/scss/bootstrap/_card.scss",
  "/sign-in/scss/bootstrap/_carousel.scss",
  "/sign-in/scss/bootstrap/_close.scss",
  "/sign-in/scss/bootstrap/_code.scss",
  "/sign-in/scss/bootstrap/_custom-forms.scss",
  "/sign-in/scss/bootstrap/_dropdown.scss",
  "/sign-in/scss/bootstrap/_forms.scss",
  "/sign-in/scss/bootstrap/_functions.scss",
  "/sign-in/scss/bootstrap/_grid.scss",
  "/sign-in/scss/bootstrap/_images.scss",
  "/sign-in/scss/bootstrap/_input-group.scss",
  "/sign-in/scss/bootstrap/_jumbotron.scss",
  "/sign-in/scss/bootstrap/_list-group.scss",
  "/sign-in/scss/bootstrap/_media.scss",
  "/sign-in/scss/bootstrap/_mixins.scss",
  "/sign-in/scss/bootstrap/_modal.scss",
  "/sign-in/scss/bootstrap/_nav.scss",
  "/sign-in/scss/bootstrap/_navbar.scss",
  "/sign-in/scss/bootstrap/_pagination.scss",
  "/sign-in/scss/bootstrap/_popover.scss",
  "/sign-in/scss/bootstrap/_print.scss",
  "/sign-in/scss/bootstrap/_progress.scss",
  "/sign-in/scss/bootstrap/_reboot.scss",
  "/sign-in/scss/bootstrap/_root.scss",
  "/sign-in/scss/bootstrap/_spinners.scss",
  "/sign-in/scss/bootstrap/_tables.scss",
  "/sign-in/scss/bootstrap/_toasts.scss",
  "/sign-in/scss/bootstrap/_tooltip.scss",
  "/sign-in/scss/bootstrap/_transitions.scss",
  "/sign-in/scss/bootstrap/_type.scss",
  "/sign-in/scss/bootstrap/_utilities.scss",
  "/sign-in/scss/bootstrap/_variables.scss",
  "/sign-in/scss/bootstrap/bootstrap.scss",
  "/sign-in/scss/bootstrap/bootstrap-grid.scss",
  "/sign-in/scss/style.scss",
];

var swLocation = "/sw.js";

let swReg;

if (navigator.serviceWorker) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register(swLocation);
  });
}
2;
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("installing cache : " + CACHE_NAME);
        cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
      .catch((err) => console.log("error caching", err))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.startsWith("my-cache") && cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log(`Cache updated to version ${CACHE_VERSION}`);
      })
      .catch((err) => console.log("error caching 2 ", err))
  );
});

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  // Only respond to GET requests for cached static assets
  if (
    event.request.method === "GET" &&
    urlsToCache.includes(requestUrl.pathname)
  ) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          return response;
        }

        return fetch(event.request).then((networkResponse) => {
          const clonedResponse = networkResponse.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clonedResponse);
          });

          return networkResponse;
        });
      })
    );
  }
});
