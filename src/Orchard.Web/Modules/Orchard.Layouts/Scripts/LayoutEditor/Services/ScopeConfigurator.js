angular
    .module("LayoutEditor")
    .factory("scopeConfigurator", function () {
        return {

            configureForElement: function ($scope, $element) {
                $element.find(".layout-panel").click(function (e) {
                    e.stopPropagation();
                });

                var keypressTarget = $element.find(".layout-element").first(); // For the Canvas case (main element is contained in template).
                if (!keypressTarget.hasClass("layout-element"))
                    keypressTarget = $element.parent(); // For all other cases (main element is the parent of template).

                keypressTarget.keydown(function (e) {
                    console.log("Keydown detected on " + $scope.element.type + ".");
                    console.log(e);
                    var c = String.fromCharCode(e.which);
                    $scope.$apply(function () { // Event is not triggered by Angular directive but raw event handler on element.
                        if (e.which == 46) { // DEL
                            $scope.element.delete();
                            e.preventDefault();
                        }
                    });
                    e.stopPropagation();
                });

                $scope.element.setIsFocusedEventHandlers.push(function () {
                    $element.closest(".layout-element").focus();
                });

                $scope.click = function (element, e) {
                    element.setIsFocused();
                    e.stopPropagation();
                };
            },

            configureForContainer: function ($scope, $element) {
                $scope.invokeAddContentElement = function (contentType) {
                    $scope.$root.addElement(contentType).then(function (args) {
                        $scope.$apply(function () {
                            var container = $scope.element;
                            var newElement = LayoutEditor.Content.from({
                                contentType: args.element.typeName,
                                contentTypeLabel: args.element.typeLabel,
                                contentTypeClass: args.element.typeClass,
                                data: decodeURIComponent(args.element.data),
                                html: decodeURIComponent(args.element.html.replace(/\+/g, "%20"))
                            });
                            container.addChild(newElement);
                            newElement.setIsFocused();
                        });
                    });
                };

                $scope.sortableOptions = {
                    cursor: "move",
                    delay: 150,
                    distance: 5,
                    start: function (e, ui) {
                        $scope.$apply(function () {
                            $scope.element.canvas.isDragging = true;
                            $scope.element.isDropTarget = true;
                        });
                        // Make the drop target placeholder as high as the item being dragged.
                        ui.placeholder.height(ui.item.height());
                    },
                    stop: function (e, ui) {
                        $scope.$apply(function () {
                            $scope.element.canvas.isDragging = false;
                            $scope.element.isDropTarget = false;
                        });
                    }
                };

                $scope.getClasses = function (child) {
                    var result = ["layout-element"];

                    if (!!child.children)
                        result.push("layout-container");

                    result.push("layout-" + child.type.toLowerCase());

                    // TODO: Move these to either the Column directive or the Column model class.
                    if (child.type == "Row")
                        result.push("row");
                    if (child.type == "Column") {
                        result.push("col-xs-" + child.width);
                        result.push("col-xs-offset-" + child.offset);
                    }
                    if (child.type == "Content") {
                        result.push("layout-content-" + child.contentTypeClass);
                    }

                    if (child.getIsActive())
                        result.push("layout-element-active");
                    if (child.getIsFocused())
                        result.push("layout-element-focused");
                    if (child.getIsSelected())
                        result.push("layout-element-selected");

                    if (child.isDropTarget)
                        result.push("layout-element-droptarget");

                    return result;
                };
            }
        }
    });