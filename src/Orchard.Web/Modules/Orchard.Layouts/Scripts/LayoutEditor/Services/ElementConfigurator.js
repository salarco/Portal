angular
    .module("LayoutEditor")
    .factory("elementConfigurator", function () {
        return {
            addElementFunctions: function ($scope, $element) {
                $scope.setIsActive = function () {
                    $scope.element.setIsActive(true);
                };

                $scope.clearIsActive = function () {
                    $scope.element.setIsActive(false);
                };

                $scope.setIsFocused = function (e) {
                    $scope.element.setIsFocused();
                    e.stopPropagation();
                };

                $scope.getClasses = function () {
                    if (!$scope.element)
                        return null;

                    var result = [];
                    if ($scope.element.getIsActive())
                        result.push("layout-element-active");
                    if ($scope.element.getIsFocused())
                        result.push("layout-element-focused");
                    if ($scope.element.getIsSelected())
                        result.push("layout-element-selected");
                    return result;
                };

                $scope.delete = function (e) {
                    $scope.element.delete();
                    e.stopPropagation();
                }

                $scope.moveUp = function (e) {
                    $scope.element.moveUp();
                    e.stopPropagation();
                }

                $scope.moveDown = function (e) {
                    $scope.element.moveDown();
                    e.stopPropagation();
                }
            },
            addContainerFunctions: function ($scope, $element) {
                $scope.invokeAddOperation = function (operation, e) {
                    operation.invoke();
                };
            }
        }
    });