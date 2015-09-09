(function() {
    'use strict';

    angular.module('cores', [])

    /* ---------------------------------------------------------------------------------------------------- */
    /*  SERVICES                                                                                            */
    /* ---------------------------------------------------------------------------------------------------- */

    // Cores Service
    .service('coresSrvc', function() {

        // Vars
        this.listCores = [];
        this.storeCore = [];
        this.storeDisplayData = [];

        // Reset List
        this.resetList = function() {
            this.listCores = [];
        };

        // Reset Store
        this.resetStore = function() {
            this.storeCore = [];
        };

        // Reset Display
        this.resetDisplay = function() {
            this.storeDisplayData = [];
        };

        return this;

    })

    /* ---------------------------------------------------------------------------------------------------- */
    /*  CONTROLLERS                                                                                         */
    /* ---------------------------------------------------------------------------------------------------- */

    // Create Core List (Nucleos.htm)
    .controller('coreListCtrl', ['$scope', '$location', 'infoSrvc', 'gpsSrvc', 'coresSrvc', function($scope, $location, infoSrvc, gpsSrvc, coresSrvc) {

        coresSrvc.resetList();

        // Create Data For Display (nucleos_lista.html & nucleo_descricao.html)
        var lat = 0,
            lon = 0;

        for (var i = 0; i < infoSrvc.allCores.length; i++) {

            lat = 0;
            lon = 0;

            if(infoSrvc.allCores[i].post_metas.enderecos !== null) {
                lat = infoSrvc.allCores[i].post_metas.enderecos[0].geolocation.latitude;
                lon = infoSrvc.allCores[i].post_metas.enderecos[0].geolocation.longitude;
            }

            coresSrvc.listCores.push({
                'ID': infoSrvc.allCores[i].ID,
                'name': infoSrvc.allCores[i].title,
                //'content': infoSrvc.allCores[i].post_metas.info_content,
                'content': '<p>' + (infoSrvc.allCores[i].post_metas.info_content).replace(/[\r\n]+(?=[^\r\n])/g,'</p><p>') + '</p>',
                'slug': infoSrvc.allCores[i].slug,
                'city': infoSrvc.allCores[i].post_metas.info_municipio,
                'endereco': infoSrvc.allCores[i].post_metas.info_endereco,
                'telefone': infoSrvc.allCores[i].post_metas.info_telefone,
                'email': infoSrvc.allCores[i].post_metas.info_email,
                'enderecos': infoSrvc.allCores[i].post_metas.enderecos,
                'como_chegar': infoSrvc.allCores[i].post_metas.local_descricao,
                'atividades': infoSrvc.allCores[i].post_metas.atividades,
                'galeria_atrativos': infoSrvc.allCores[i].post_metas.galeria_atrativos,
                'site': 'www.ambiente.sp.gov.br/parque-serra-do-mar-nucleo-' + infoSrvc.allCores[i].slug,
                'latitude': lat,
                'longitude': lon,
                'km': getKM(gpsSrvc.latitude, gpsSrvc.longitude, lat, lon),
            });

            // Getting activity icon (slug)
            var totalActivities = coresSrvc.listCores[i].atividades ? coresSrvc.listCores[i].atividades.length : 0;

            for (var j = 0; j < totalActivities; j++) {
                var activityId = coresSrvc.listCores[i].atividades[j].atividadeID;

                for (var k = 0; k < infoSrvc.allActivities.length; k++) {
                    if (activityId == infoSrvc.allActivities[k].ID) {
                        var tipoPrincipal = infoSrvc.allActivities[k].post_metas.tipo_principal;
                        var tipoLength = infoSrvc.allActivities[k].terms.tipo_atividades ? infoSrvc.allActivities[k].terms.tipo_atividades.length : 0;
                        for (var m = 0; m < tipoLength; m++) {
                            if (tipoPrincipal == infoSrvc.allActivities[k].terms.tipo_atividades[m].ID) {
                                coresSrvc.listCores[i].atividades[j].atividadeSlug = infoSrvc.allActivities[k].terms.tipo_atividades[m].slug;
                            }
                        }
                    }
                }
            }

            // GeoURL
            for (var n = 0; n < coresSrvc.listCores.length; n++) {
                if(coresSrvc.listCores[n].enderecos !== null){
                    for (var o = 0; o < coresSrvc.listCores[n].enderecos.length; o++) {
                        lat = coresSrvc.listCores[n].enderecos[o].geolocation.latitude;
                        lon = coresSrvc.listCores[n].enderecos[o].geolocation.longitude;
                        coresSrvc.listCores[n].enderecos[o].geoUrl = getMapUrl(lat, lon);
                    }
                }
            }
        }

        function getMapUrl(lat, lon) {
            var mapUrl;
            switch (cordovaPlatform) {
                case 'Android':
                    mapUrl = 'geo:' + lat + ',' + lon + '?z=15';
                    break;

                case 'iOS':
                    mapUrl = 'http://maps.apple.com/?ll=' + lat + ',' + lon + ',15z';
                    break;

                case 'Win32NT':
                    mapUrl = 'bingmaps:?cp='+lat+'~'+lon+'&lvl=15&sty=r';
                    break;

                default:
                    mapUrl = 'http://www.google.com/maps/@' + lat + ',' + lon + ',15z';
            }
            return mapUrl;
        }

        // Sort on Distance
        coresSrvc.listCores.sort(function(a, b) {
            return a.km - b.km;
        });

        // Display Holder
        $scope.coresList = coresSrvc.listCores;

        // Renderiza SVG inline
        $scope.$on('renderSvg', function() {
            imgToSvg();
        });

        // call fix for Windows Phone Bouncing after deviceready.
        fixWpBounce();
    }])

    // Create Core MAP list
    .controller('coreMapCtrl', ['$scope', '$timeout', '$location', 'infoSrvc', 'coresSrvc', function($scope, $timeout, $location, infoSrvc, coresSrvc) {
        $scope.coresList = coresSrvc.listCores;
    }])

    // Create Core Description
    .controller('coreDescriptionCtrl', ['$scope', '$routeParams', '$location', '$timeout', 'infoSrvc', 'coresSrvc', function($scope, $routeParams, $location, $timeout, infoSrvc, coresSrvc) {

        var coreId = parseInt($routeParams.id, 10);

        for (var i = 0; i < coresSrvc.listCores.length; i++) {
            if (coresSrvc.listCores[i].ID === coreId) {
                $scope.coresList = coresSrvc.listCores[i];
            }
        }

        // Renderiza SVG inline
        $scope.$on('renderSvg', function() {
            imgToSvg();
        });

        // call fix for Windows Phone Bouncing after deviceready.
        fixWpBounce();
    }])

    // Create Core How to Get Here
    .controller('coreHowToGetHereCtrl', ['$scope', '$routeParams', '$location', '$timeout', 'infoSrvc', 'coresSrvc', function($scope, $routeParams, $location, $timeout, infoSrvc, coresSrvc) {

        var coreId = parseInt($routeParams.id, 10);
        var imgMap = $routeParams.map;

        $scope.coresList = coresSrvc.listCores;

        for (var i = 0; i < coresSrvc.listCores.length; i++) {
            if (coresSrvc.listCores[i].ID === coreId) {

                $scope.coresList.name = coresSrvc.listCores[i].name;
                $scope.coreSlug = coresSrvc.listCores[i].slug;
                $scope.localMap = imgMap;

                for (var j = 0; j < coresSrvc.listCores[i].enderecos.length; j++) {
                    if (coresSrvc.listCores[i].enderecos[j].slug === imgMap) {
                        $scope.geoUrl = coresSrvc.listCores[i].enderecos[j].geoUrl;
                        break;
                    }
                }

                break;
            }
        }

        // call fix for Windows Phone Bouncing after deviceready.
        fixWpBounce();
    }])

    /* ---------------------------------------------------------------------------------------------------- */
    /*  DIRECTIVES                                                                                          */
    /* ---------------------------------------------------------------------------------------------------- */

    // Reset Cores Store
    .directive('resetActivities', ['coresSrvc', function(coresSrvc) {
        return {
            restrict: 'A',
            link: function() {
                coresSrvc.resetStore();
                coresSrvc.resetDisplay();
            }
        };
    }]);

}());