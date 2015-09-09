(function() {
    'use strict';

    /* ---------------------------------------------------------------------------------------------------- */
    /*  INIT                                                                                                */
    /* ---------------------------------------------------------------------------------------------------- */

    angular.module('service', [])

    /* ---------------------------------------------------------------------------------------------------- */
    /*  SERVICE                                                                                             */
    /* ---------------------------------------------------------------------------------------------------- */

    // Create Main Service
    .service('infoSrvc', ['$q', '$http', '$location', '$timeout', function($q, $http, $location, $timeout) {

        var self = this;

        self.activityType = [];
        self.allActivities = [];
        self.allCores = [];
        self.aboutPark = [];

        // Start
        self.getData = function() {
            $http.get('data/atividades_tipo.json')
                .then(function(response) {
                    self.activityType = response.data;
                    return $http.get('data/atividades_lista.json');
                })
                .then(function(response) {
                    self.allActivities = response.data;
                    return $http.get('data/nucleos_lista.json');
                })
                .then(function(response) {
                    self.allCores = response.data;
                    return $http.get('data/sobre_o_parque.json');
                })
                .then(function(response) {
                    self.aboutPark = response.data;
                    $timeout(function() {
                        $location.path("/home");
                    });
                })
                .catch(function(error) {
                    console.log("JSON Loader Error: " + error);
                });
        };

        return self;

    }])

    // Create GPS Service
    .service('gpsSrvc', ['$interval', '$timeout', function($interval, $timeout) {

        var self = this;
        var html5Options = {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        };

        // Pure HTML5 Geolocation
        function getHTML5Position() {
            if (Modernizr.geolocation) {
                navigator.geolocation.getCurrentPosition(onGpsSuccess, onGpsError, html5Options);
            } else {
                self.area = 'GPS não encontrado';
            }
        }

        function onGpsSuccess(position) {
            var latitude = position.coords.latitude,
                longitude = position.coords.longitude,
                sLatStr = (''+latitude).substr(0,10),
                sLonStr = (''+longitude).substr(0,10);

            self.latitude = latitude;
            self.longitude = longitude;
            self.city = 'Cidade não encontrada';
            self.region = 'Região não encontrada';
            self.area = '<small>' + sLatStr + ', ' + sLonStr + '</small>';
        }

        function onGpsError(error) {
            self.latitude = null;
            self.longitude = null;
            self.city = 'Cidade não encontrada';
            self.region = 'Região não encontrada';
            self.area = 'GPS não encontrado'; //NO GPS ON DEVICE, or...

            if (error.code === 1) {
                self.area = 'Uso de GPS negado'; //PERMISSION_DENIED (1)
            }
            if (error.code === 2) {
                self.area = 'GPS indisponível'; //POSITION_UNAVAILABLE (2)
            }
            if (error.code === 3) {
                self.area = 'GPS não respondeu'; //TIMEOUT (3)
            }
        }

        //The callback function executed when the location is fetched successfully by geolocator().
        function onGeoSuccess(location) {
            self.latitude = location.coords.latitude;
            self.longitude = location.coords.longitude;
            self.city = location.address.city;
            self.region = getUF(location.address.region);
            self.area = self.city + self.region;
            return self;
        }

        //The callback function executed when the location could not be fetched by geolocator().
        function onGeoError(error) {
            self.latitude = null;
            self.longitude = null;
            self.city = 'Cidade não encontrada';
            self.region = 'Região não encontrada';

            if (geolocator.isPositionError(error)) {
                if (error.code === 1) {
                    self.area = 'Uso de GPS negado'; //PERMISSION_DENIED (1)
                }
                if (error.code === 2) {
                    self.area = 'GPS indisponível'; //POSITION_UNAVAILABLE (2)
                }
                if (error.code === 3) {
                    self.area = 'GPS não respondeu'; //TIMEOUT (3)
                }
            } else {
                //SOMETHING WENT WRONG, LET'S TRY AGAIN WITH RAW HTML5 GEOLOCATION
                self.area = 'Ainda procurando...';
                getHTML5Position();
            }

            return self;
        }

        // Update GPS
        self.updateGps = function() {
            $timeout(function() {
                geolocator.locate(onGeoSuccess, onGeoError, 0, html5Options); //0 = FreeGeoIP - https://github.com/onury/geolocator
            });
        };

    }]);

}());