angular
    .module("LayoutEditor")
    .directive("orcLayoutGrid", function ($compile, scopeConfigurator) {
        return {
            restrict: "E",
            scope: { element: "=" },
            controller: function ($scope, $element) {
                scopeConfigurator.configureForElement($scope, $element);
                scopeConfigurator.configureForContainer($scope, $element);
                $scope.sortableOptions["axis"] = "y";
            },
            templateUrl: "Templates/orc-layout-grid.html",
            replace: true
        };
    });