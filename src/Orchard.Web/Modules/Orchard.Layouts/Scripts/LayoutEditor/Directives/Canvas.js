angular
    .module("LayoutEditor")
    .directive("orcLayoutCanvas", function ($compile, elementConfigurator, baseUrl) {
        return {
            restrict: "E",
            scope: {},
            controller: function ($scope, $element, $attrs) {
                if (!!$attrs.model)
                    $scope.element = eval($attrs.model);
                else
                    $scope.element = new LayoutEditor.Canvas(null, null, null, null, null, []);
                elementConfigurator.addElementFunctions($scope, $element);
                elementConfigurator.addContainerFunctions($scope, $element);
                $scope.sortableOptions["axis"] = "y";
                $scope.$root.layoutDesignerHost = $element.closest(".layout-designer").data("layout-designer-host");
                $scope.$root.editElement = function(elementType, elementData) {
                    var host = $scope.$root.layoutDesignerHost;
                    return host.editElement(elementType, elementData);
                };
                $scope.$root.addElement = function (elementType, elementLabel) {
                    var host = $scope.$root.layoutDesignerHost;
                    return host.addElement(elementType, elementLabel);
                };
            },
            templateUrl: baseUrl.get() + "/Templates/orc-layout-canvas.html",
            replace: true,
            link: function (scope, element) {
                // Unfocus and unselect everything on click outside of canvas.
                $(window).click(function (e) {
                    scope.$apply(function () {
                        scope.element.canvas.activeElement = null;
                        scope.element.canvas.focusedElement = null;
                    });
                });
            }
        };
    });