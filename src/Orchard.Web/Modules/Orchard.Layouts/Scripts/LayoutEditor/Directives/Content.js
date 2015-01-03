angular
    .module("LayoutEditor")
    .directive("orcLayoutContent", function (elementConfigurator) {
        return {
            restrict: "E",
            scope: { element: "=" },
            controller: function ($scope, $element) {
                elementConfigurator.addElementFunctions($scope, $element);
            },
            templateUrl: "Templates/orc-layout-content.html",
            replace: true,
        };
    });