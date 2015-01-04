angular
    .module("LayoutEditor")
    .factory("baseUrl", function () {
        return {
            get: function () {
                return $("[data-base-url]").data("base-url");
            }
        }
    });