angular
    .module("LayoutEditor")
    .directive("orcLayoutContent", function (elementConfigurator, baseUrl) {
        return {
            restrict: "E",
            scope: { element: "=" },
            controller: function ($scope, $element) {
                elementConfigurator.addElementFunctions($scope, $element);
            },
            templateUrl: baseUrl.get() + "/Templates/orc-layout-content.html",
            replace: true,
        };
    });