angular
    .module("LayoutEditor")
    .directive("orcLayoutGrid", function ($compile, scopeConfigurator, environment) {
        return {
            restrict: "E",
            scope: { element: "=" },
            controller: function ($scope, $element) {
                scopeConfigurator.configureForElement($scope, $element);
                scopeConfigurator.configureForContainer($scope, $element);
                $scope.sortableOptions["axis"] = "y";
            },
            templateUrl: environment.baseUrl + "Templates/orc-layout-grid.html",
            replace: true
        };
    });