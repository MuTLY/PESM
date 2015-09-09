(function() {
    'use strict';

    angular.module('activities', [])

    /* ---------------------------------------------------------------------------------------------------- */
    /*  SERVICES                                                                                            */
    /* ---------------------------------------------------------------------------------------------------- */

    // Activities Service
    .service('activitiesSrvc', ['infoSrvc', 'gpsSrvc', '$interval', function(infoSrvc, gpsSrvc, $interval) {
        // Vars
        var self = this;
        self.selectedActivities = [];
        self.storeActivities = [];
        self.storeActivitiesFull = [];
        self.storeDisplayData = [];
        self.storeDisplayFullData = [];

        // Set Selected
        this.setSelected = function(id) {
            var exists = false;
            var temp = self.selectedActivities;

            angular.forEach(temp, function(value, index) {
                if (id === temp[index]) {
                    exists = true;
                    temp.splice(index, 1);
                    //return;
                }
            });
            if (!exists) {
                self.selectedActivities.push(id);
            }
        };

        // Reset Selected
        this.resetSelected = function() {
            self.selectedActivities = [];
        };

        // Reset Store
        this.resetStore = function() {
            self.storeActivities = [];
        };

        // Reset Display
        this.resetDisplay = function() {
            self.storeDisplayData = [];
        };

        // Static Parsed Data
        this.start = function() {
            for (var j = 0; j < infoSrvc.allActivities.length; j++) {
                var typeActivities = infoSrvc.allActivities[j].terms.tipo_atividades;
                var typeLength = typeActivities ? typeActivities.length : 0;

                // JSON Parse
                for (var k = 0; k < typeLength; k++) {
                    self.storeActivitiesFull.push({
                        'groupId': infoSrvc.allActivities[j].id,
                        'activityId': infoSrvc.allActivities[j].terms.tipo_atividades[k].ID,
                        'activity': j,
                        'type': k,
                        'core_id': infoSrvc.allActivities[j].post_metas.nucleo_id,
                        'core_name': null,
                        'core_city': null,
                        'core_slug': null
                    });
                }
            }

            // Loop Store List
            for (var l = 0; l < self.storeActivitiesFull.length; l++) {
                // Loop All Cores
                for (var n = 0; n < infoSrvc.allCores.length; n++) {
                    // Update Data
                    if (self.storeActivitiesFull[l].core_id == infoSrvc.allCores[n].ID) {
                        self.storeActivitiesFull[l].core_name = infoSrvc.allCores[n].title;
                        self.storeActivitiesFull[l].core_city = infoSrvc.allCores[n].post_metas.info_municipio;
                        self.storeActivitiesFull[l].core_slug = infoSrvc.allCores[n].slug;
                        self.storeActivitiesFull[l].core_latitude = 0;
                        self.storeActivitiesFull[l].core_longitude = 0;

                        if (infoSrvc.allCores[n].post_metas.enderecos) {
                            self.storeActivitiesFull[l].core_latitude = infoSrvc.allCores[n].post_metas.enderecos[0].geolocation.latitude;
                            self.storeActivitiesFull[l].core_longitude = infoSrvc.allCores[n].post_metas.enderecos[0].geolocation.longitude;
                        }

                        break;
                    }
                }
            }

            // Create Data For Display (Atividades_lista.htm, Atividades_lista_nucleo.htm e Atividades_descricao.htm)
            for (var m = 0; m < self.storeActivitiesFull.length; m++) {
                var a = self.storeActivitiesFull[m].activity;
                var t = self.storeActivitiesFull[m].type;

                // If there's no featured image...
                var feat_image = "img/spacer.gif";
                
                if (infoSrvc.allActivities[a].featured_image !== null) {
                    if (infoSrvc.allActivities[a].featured_image.guid !== null) {
                        feat_image = infoSrvc.allActivities[a].featured_image.guid;
                        console.log(feat_image);
                    }
                }

                self.storeDisplayFullData.push({
                    'ID': infoSrvc.allActivities[a].ID,
                    'title': infoSrvc.allActivities[a].title,
                    'activity_icon': infoSrvc.allActivities[a].terms.tipo_atividades[t].slug,
                    'core_id': self.storeActivitiesFull[m].core_id,
                    'core_name': self.storeActivitiesFull[m].core_name,
                    'core_city': self.storeActivitiesFull[m].core_city,
                    'core_slug': self.storeActivitiesFull[m].core_slug,
                    'content': infoSrvc.allActivities[a].content,
                    'gallery': infoSrvc.allActivities[a].post_metas.galeria,
                    'image': feat_image,
                    'activities': infoSrvc.allActivities[a].terms.tipo_atividades
                });
            }
        };

        // Get KM Update
        this.kmUpdate = function() {
            for (var n = 0; n < self.storeDisplayFullData.length; n++) {
                var lat = self.storeActivitiesFull[n].core_latitude;
                var lon = self.storeActivitiesFull[n].core_longitude;
                var km = getKM(gpsSrvc.latitude, gpsSrvc.longitude, lat, lon);

                self.storeDisplayFullData[n].km = km;
            }
        };

        // JSON Check
        if (infoSrvc.allCores.length === 0) {
            var running = $interval(function() {
                if (infoSrvc.allCores.length !== 0) {
                    self.start();
                    $interval.cancel(running);
                }
            }, 1000);
        } else {
            self.start();
        }

        return self;

    }])

    /* ---------------------------------------------------------------------------------------------------- */
    /*  CONTROLLERS                                                                                         */
    /* ---------------------------------------------------------------------------------------------------- */

    // Manager Activity Type List (Atividades.htm)
    .controller('listActivityTypeCtrl', ['$scope', '$location', 'infoSrvc', 'activitiesSrvc', function($scope, $location, infoSrvc, activitiesSrvc) {

        // Always Reset Selected
        activitiesSrvc.resetSelected();

        // Always Update KM
        activitiesSrvc.kmUpdate();

        // Get Type List
        $scope.activityType = infoSrvc.activityType;

        // Update Activity
        $scope.setActivity = function(id) {
            activitiesSrvc.setSelected(id);
        };

        // Renderiza SVG inline
        $scope.$on('renderSvg', function() {
            imgToSvg();
        });

        // call fix for Windows Phone Bouncing after deviceready.
        fixWpBounce();

    }])

    // Manager Selected Activities (Atividades_lista.htm e Atividades_lista_nucleo.htm)
    .controller('listActivitiesCtrl', ['$scope', '$location', 'infoSrvc', 'gpsSrvc', 'activitiesSrvc', function($scope, $location, infoSrvc, gpsSrvc, activitiesSrvc) {

        // Reset
        activitiesSrvc.resetStore();
        activitiesSrvc.resetDisplay();

        // Check Zero Length
        if (activitiesSrvc.selectedActivities.length === 0) {
            $location.path('/home').replace();
        }

        // Loop Selected Activities
        for (var i = 0; i < activitiesSrvc.selectedActivities.length; i++) {
            // Loop All Activities
            for (var j = 0; j < activitiesSrvc.storeActivitiesFull.length; j++) {
                if (activitiesSrvc.selectedActivities[i] == activitiesSrvc.storeActivitiesFull[j].activityId) {
                    activitiesSrvc.storeDisplayData.push(activitiesSrvc.storeDisplayFullData[j]);
                }
            }
        }

        // Sort on Distance
        activitiesSrvc.storeDisplayData.sort(function(a, b) {
            return a.km - b.km;
        });

        // Display Holder
        $scope.activitiesList = activitiesSrvc.storeDisplayData;

        // Renders SVG inline
        $scope.$on('renderSvg', function() {
            imgToSvg();
        });

        // call fix for Windows Phone Bouncing after deviceready.
        fixWpBounce();
    }])

    // Display Data By Core (Atividades_lista_nucleo.htm)
    .controller('listActivitiesByCoreCtrl', ['$scope', '$location', 'activitiesSrvc', function($scope, $location, activitiesSrvc) {

        // Check Zero Length
        if (activitiesSrvc.storeDisplayData.length === 0) {
            $location.path('/home').replace();
        }

        // Display Holder
        $scope.activitiesList = activitiesSrvc.storeDisplayData;

        // Renders SVG inline
        $scope.$on('renderSvg', function() {
            imgToSvg();
        });

        // call fix for Windows Phone Bouncing after deviceready.
        fixWpBounce();
    }])

    // Activity Description
    .controller('activityDescriptionCtrl', ['$scope', '$routeParams', '$location', 'activitiesSrvc', function($scope, $routeParams, $location, activitiesSrvc) {

        // Check Zero Length
        if (activitiesSrvc.storeDisplayFullData.length === 0) {
            $location.path('/home').replace();
        }

        // Vars
        var groupId = parseInt($routeParams.id, 10);
        var selectedActivity = {};

        // Loop
        for (var i = 0; i < activitiesSrvc.storeDisplayFullData.length; i++) {
            if (activitiesSrvc.storeDisplayFullData[i].ID === groupId) {
                selectedActivity.title = activitiesSrvc.storeDisplayFullData[i].title;
                selectedActivity.activity_icon = activitiesSrvc.storeDisplayFullData[i].activity_icon;
                selectedActivity.core_name = activitiesSrvc.storeDisplayFullData[i].core_name;
                selectedActivity.core_city = activitiesSrvc.storeDisplayFullData[i].core_city;
                selectedActivity.core_slug = activitiesSrvc.storeDisplayFullData[i].core_slug;
                selectedActivity.content = activitiesSrvc.storeDisplayFullData[i].content;
                selectedActivity.gallery = activitiesSrvc.storeDisplayFullData[i].gallery;
                selectedActivity.image = activitiesSrvc.storeDisplayFullData[i].image;
                selectedActivity.activities = activitiesSrvc.storeDisplayFullData[i].activities;

                //Display Holder
                $scope.selectedActivity = selectedActivity;
                break;
            }
        }

        // Renders SVG inline
        $scope.$on('renderSvg', function() {
            imgToSvg();
        });

        // call fix for Windows Phone Bouncing after deviceready.
        fixWpBounce();
    }])

    /* ---------------------------------------------------------------------------------------------------- */
    /*  DIRECTIVES                                                                                          */
    /* ---------------------------------------------------------------------------------------------------- */

    // Clear Activities
    .directive('clearActivities', ['activitiesSrvc', function(activitiesSrvc) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                element.bind('click', function(e) {
                    e.preventDefault();
                    var el = angular.element(document.querySelectorAll('#lista_tipo_atividade .btn_tipo_atividade'));
                    el.removeClass('ativo');
                    activitiesSrvc.resetSelected();
                    activitiesSrvc.resetStore();
                    activitiesSrvc.resetDisplay();
                });
            }
        };
    }])

    // Reset Activities
    .directive('resetActivities', ['activitiesSrvc', function(activitiesSrvc) {
        return {
            restrict: 'A',
            link: function() {
                activitiesSrvc.resetStore();
                activitiesSrvc.resetDisplay();
            }
        };
    }])

    // Check Activities
    .directive('checkActivities', ['activitiesSrvc', function(activitiesSrvc) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                element.bind('click', function(e) {
                    if (activitiesSrvc.selectedActivities.length === 0) {
                        e.preventDefault();
                        alert('Selecione pelo menos uma atividade');
                    }
                });
            }
        };
    }]);

}());