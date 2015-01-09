﻿using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using Orchard.DisplayManagement.Shapes;
using Orchard.Layouts.Framework.Elements;

namespace Orchard.Layouts.Helpers {
    public static class TagBuilderExtensions {
        
        public static OrchardTagBuilder AddCommonElementAttributes(this OrchardTagBuilder tagBuilder, dynamic shape) {
            var attributes = GetCommonElementAttributes(shape);
            tagBuilder.MergeAttributes(attributes);
            return tagBuilder;
        }

        public static IDictionary<string, object> GetCommonElementAttributes(dynamic shape) {
            var element = (IElement)shape.Element;
            var htmlId = element.HtmlId;
            var htmlClass = element.HtmlClass;
            var htmlStyle = element.HtmlStyle;
            var attributes = new Dictionary<string, object>();

            if (!String.IsNullOrWhiteSpace(htmlId)) {
                var tokenize = (Func<string>)shape.TokenizeId;
                attributes["id"] = tokenize();
            }

            if (!String.IsNullOrWhiteSpace(htmlStyle)) {
                var tokenize = (Func<string>)shape.TokenizeInlineStyle;
                attributes["style"] = Regex.Replace(tokenize(), @"(?:\r\n|[\r\n])", "");
            }

            if (!String.IsNullOrWhiteSpace(htmlClass)) {
                var tokenize = (Func<string>)shape.TokenizeCssClass;
                attributes["class"] = tokenize();
            }

            return attributes;
        }

        public static void AddClientValidationAttributes(this OrchardTagBuilder tagBuilder, IDictionary<string, string> clientAttributes) {
            foreach (var attribute in clientAttributes) {
                tagBuilder.Attributes[attribute.Key] = attribute.Value;
            }
        }
    }
}