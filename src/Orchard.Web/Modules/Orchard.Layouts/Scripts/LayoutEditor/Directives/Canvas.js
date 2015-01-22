﻿angular
    .module("LayoutEditor")
    .directive("orcLayoutCanvas", function (scopeConfigurator, environment) {
        return {
            restrict: "E",
            scope: { element: "=" },
            controller: function ($scope, $element, $attrs) {
                scopeConfigurator.configureForElement($scope, $element);
                scopeConfigurator.configureForContainer($scope, $element);
                $scope.sortableOptions["axis"] = "y";
            },
            templateUrl: environment.baseUrl + "Templates/orc-layout-canvas.html",
            replace: true
        };
    });