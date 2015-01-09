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
                console.log("Configuring keypress handler on " + $scope.element.type + ".");
                console.log(keypressTarget);

                keypressTarget.keypress(function (e) {
                    console.log("Keypress detected on " + $scope.element.type + ".");
                    $scope.keypress(e);
                    e.stopPropagation();
                });

                $scope.click = function (element, e) {
                    console.log("Setting focus to " + element.type + ".");
                    element.setIsFocused();
                    var focusTarget = $(e.target); // For the Canvas case (current scope belongs directly to main element).
                    if (!focusTarget.hasClass("layout-element"))
                        focusTarget = $element.find(".layout-element").first(); // For all other cases (current scope belongs to parent element).
                    focusTarget.focus();
                    e.stopPropagation();
                };

                $scope.keypress = function (e) {
                    var c = String.fromCharCode(e.which);
                    console.log("Keypress " + c + " handled on element " + $scope.element.type + ".");
                    $scope.$apply(function () { // Event is not triggered by Angular directive but raw event handler on element.
                        if (c == "c") // CTRL+C
                            $scope.element.copyToClipboard();
                        else if (c == "v") // CTRL+V
                            $scope.element.pasteFromClipboard();
                    });
                };
            },

            configureForContainer: function ($scope, $element) {
                $scope.invokeAddContentElement = function (contentType) {
                    $scope.$root.addElement(contentType.id).then(function (args) {
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

                // Redefine function for container behavior.
                $scope.keypress = function (e) {
                    var c = String.fromCharCode(e.which);
                    console.log("Keypress " + c + " handled on container " + $scope.element.type + ".");
                    $scope.$apply(function () { // Event is not triggered by Angular directive but raw event handler on element.
                        if (c == "c") // CTRL+C
                            $scope.element.copyToClipboard();
                        else if (c == "v") // CTRL+V
                            $scope.element.pasteChildFromClipboard();
                    });
                };
            }
        }
    });