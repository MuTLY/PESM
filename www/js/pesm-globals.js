// This is the preferred Cordova detection method, as it doesn't require updating.
var isCordovaApp = !!window.cordova;

// Stores the current platform
var cordovaPlatform; // This will be Android, iOS, Windows, WinCE, Win32NT, etc

if (isCordovaApp) {
    document.addEventListener("deviceready", bootstrapAngular, false);
} else {
    bootstrapAngular();
}

// This is a function that bootstraps AngularJS, which is called from later code
function bootstrapAngular() {
    "use strict";

    // Set the platform, and hide the Status Bar
    if (isCordovaApp) {
        cordovaPlatform = device.platform;

        if (StatusBar.isVisible) {
            StatusBar.hide();
            StatusBar.overlaysWebView(false);
        }
    }

    // Bootstrapping
    var domElement = document.querySelector('html');
    angular.bootstrap(domElement, ['pesm']);
}

// Preload images
function preloadImages() {
    'use strict';
    var img,
        imgArr = [
            'AjaxLoader.gif',
            'spacer.gif',
            'home_slide1.jpg',
            'home_slide2.jpg',
            'home_slide3.jpg',
            'sobre_img1.jpg',
            'sobre_img2.jpg',
            'sobre_img3.jpg',
            'grabbing.png',
            'atividade_icone_arvorismo.svg',
            'atividade_icone_asa-delta.svg',
            'atividade_icone_banho.svg',
            'atividade_icone_bike.svg',
            'atividade_icone_binoculo.svg',
            'atividade_icone_boia-cross.svg',
            'atividade_icone_camping.svg',
            'atividade_icone_cartografia.svg',
            'atividade_icone_casas.svg',
            'atividade_icone_escalada.svg',
            'atividade_icone_fotografia.svg',
            'atividade_icone_jipe.svg',
            'atividade_icone_lago1.svg',
            'atividade_icone_montanhismo.svg',
            'atividade_icone_observacao-de-aves.svg',
            'atividade_icone_passeio-de-barco.svg',
            'atividade_icone_passeio-noturno.svg',
            'atividade_icone_patrimonio-cultural.svg',
            'atividade_icone_peixes.svg',
            'atividade_icone_picnic.svg',
            'atividade_icone_praia.svg',
            'atividade_icone_praia2.svg',
            'atividade_icone_rafting.svg',
            'atividade_icone_surf.svg',
            'atividade_icone_tirolesa.svg',
            'atividade_icone_travessia.svg',
            'atividade_icone_trilha.svg',
            'atividade_icone_trilha-fluvial.svg',
            'atividade_icone_violao.svg',
            'bg_bt1.svg',
            'bg_icone1.svg',
            'borda_1.svg',
            'borda_2.svg',
            'borda_3.svg',
            'borda_4.svg',
            'borda_5.svg',
            'icone_arraste.svg',
            'icone_botao_coisas.svg',
            'icone_botao_nucleos.svg',
            'icone_contato_browser.svg',
            'icone_contato_email.svg',
            'icone_contato_rota.svg',
            'icone_contato_telefone.svg',
            'icone_lupa.svg',
            'icone_seta1.svg',
            'icone_voltar1.svg',
            'logo_bertioga.svg',
            'logo_caraguatatuba.svg',
            'logo_cunha.svg',
            'logo_curucutu.svg',
            'logo_itariru.svg',
            'logo_itutinga-piloes.svg',
            'logo_nucleo_bertioga.svg',
            'logo_nucleo_caraguatatuba.svg',
            'logo_nucleo_cunha.svg',
            'logo_nucleo_curucutu.svg',
            'logo_nucleo_itariru.svg',
            'logo_nucleo_itutinga-piloes.svg',
            'logo_nucleo_padre-doria.svg',
            'logo_nucleo_picinguaba.svg',
            'logo_nucleo_santa-virginia.svg',
            'logo_nucleo_sao-sebastiao.svg',
            'logo_padre-doria.svg',
            'logo_picinguaba.svg',
            'logo_santa-virginia.svg',
            'logo_sao-sebastiao.svg'
        ];

    if (!preloadImages.cache) {
        preloadImages.cache = [];
    }
    for (var i = 0; i < imgArr.length; i++) {
        img = new Image();
        img.src = 'img/' + imgArr[i];
        preloadImages.cache.push(img);
    }
}

// Windows Phone Bounce "Fix"
function fixWpBounce() {
    'use strict';

    if (cordovaPlatform === 'WinCE' || cordovaPlatform === 'Win32NT') {
        if (window.FixWPBouncing) {
            var wrapper = $('.stage_miolo, .stage_miolo2, .stage_miolo4, .stage_miolo5');
            FixWPBouncing.fix(wrapper);
        }
    }
}

// Map Scrolling (iScroll)
function mapScroll(elementClass) {
    'use strict';

    var sigScroller = $('#alerta'),
        mapScroller = document.querySelector(elementClass),
        mapScrollerC = mapScroller.firstElementChild;

    // is it a simple IMG element or not?
    if (mapScrollerC.nodeName.toLowerCase() === 'img') {
        mapScrollerC.addEventListener('load', scrollIt);
    } else {
        scrollIt();
    }

    function scrollIt() {
        var mapScrollerW = mapScrollerC.offsetWidth,
            mapScrollerH = mapScrollerC.offsetHeight;

        mapScrollerC.style.width = mapScrollerW + 'px';
        mapScrollerC.style.height = mapScrollerH + 'px';

        var mapScrolld = new IScroll(mapScroller, {
            bindToWrapper: true,
            bounce: true,
            click: true,
            eventPassthrough: false,
            freeScroll: true,
            momentum: true,
            scrollX: true,
            scrollY: true,
            mouseWheel: true,
            zoom: true,
            zoomMax: 4,
            zoomMin: 1,
            wheelAction: 'zoom'
        });

        mapScrolld.on('scrollStart', hideAlert);
        mapScrolld.on('beforeScrollStart', hideAlert);
    }

    function hideAlert() {
        if (sigScroller.length > 0) {
            sigScroller.addClass("inativo");
            sigScroller.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function() {
                sigScroller.hide();
            });
        }
    }
}

// Slider Galerias
function carousel(element, attrs) {
    "use strict";
    angular.element(document).ready(function() {
        var pagination = (attrs.pagination === 'true');
        angular.element(element, attrs).owlCarousel({
            autoPlay: attrs.autoplay,
            pagination: pagination,
            transitionStyle: attrs.transition,
            items: 1,
            singleItem: true
        });
    });
}

// Transforma IMG em SVG inline
// https://github.com/iconic/SVGInjector
function imgToSvg() {
    'use strict';
    var mySVGsToInject = document.querySelectorAll('img.svg');
    new SVGInjector(mySVGsToInject);
}

// Get KM
function getKM(lat1, lon1, lat2, lon2) {
    'use strict';

    if (!lat1 || !lon1 || !lat2 || !lon2) {
        return 0;
    }

    var R = 6371; // km
    var dLat = toRad(lat2 - lat1);
    var dLon = toRad(lon2 - lon1);
    var lat1r = toRad(lat1);
    var lat2r = toRad(lat2);

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1r) * Math.cos(lat2r);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;

    function toRad(value) {
        // Converts numeric degrees to radians
        return value * Math.PI / 180;
    }

    return Math.floor(d);
}

// Get UF
function getUF(str) {
    "use strict";

    // Estados e Siglas
    var estado = '';
    var estados = [{
        nome: "Acre",
        sigla: "AC"
    }, {
        nome: "Alagoas",
        sigla: "AL"
    }, {
        nome: "Amapá",
        sigla: "AP"
    }, {
        nome: "Amazonas",
        sigla: "AM"
    }, {
        nome: "Bahia",
        sigla: "BA"
    }, {
        nome: "Ceará",
        sigla: "CE"
    }, {
        nome: "Distrito Federal",
        sigla: "DF"
    }, {
        nome: "Espírito Santo",
        sigla: "ES"
    }, {
        nome: "Goiás",
        sigla: "GO"
    }, {
        nome: "Maranhão",
        sigla: "MA"
    }, {
        nome: "Mato Grosso",
        sigla: "MT"
    }, {
        nome: "Mato Grosso do Sul",
        sigla: "MS"
    }, {
        nome: "Minas Gerais",
        sigla: "MG"
    }, {
        nome: "Pará",
        sigla: "PA"
    }, {
        nome: "Paraíba",
        sigla: "PB"
    }, {
        nome: "Paraná",
        sigla: "PR"
    }, {
        nome: "Pernambuco",
        sigla: "PE"
    }, {
        nome: "Piauí",
        sigla: "PI"
    }, {
        nome: "Rio de Janeiro",
        sigla: "RJ"
    }, {
        nome: "Rio Grande do Norte",
        sigla: "RN"
    }, {
        nome: "Rio Grande do Sul",
        sigla: "RS"
    }, {
        nome: "Rondônia",
        sigla: "RO"
    }, {
        nome: "Roraima",
        sigla: "RR"
    }, {
        nome: "Santa Catarina",
        sigla: "SC"
    }, {
        nome: "São Paulo",
        sigla: "SP"
    }, {
        nome: "Sergipe",
        sigla: "SE"
    }, {
        nome: "Tocantins",
        sigla: "TO"
    }];

    for (var i = 0; i < estados.length; i++) {
        if (str == estados[i].nome) {
            estado = ', ' + estados[i].sigla;
            return estado;
        }
    }

    return '';
}