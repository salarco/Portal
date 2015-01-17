using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json.Linq;
using Orchard.Layouts.Framework.Elements;
using Orchard.Layouts.Helpers;

namespace Orchard.Layouts.Services {
    public class LayoutSerializer : ILayoutSerializer {
        private readonly IElementManager _elementManager;
        private readonly IElementFactory _elementFactory;

        public LayoutSerializer(IElementManager elementManager, IElementFactory elementFactory) {
            _elementManager = elementManager;
            _elementFactory = elementFactory;
        }

        public IEnumerable<IElement> Deserialize(string data, DescribeElementsContext describeContext) {
            var emptyList = Enumerable.Empty<IElement>();

            if (String.IsNullOrWhiteSpace(data))
                return emptyList;

            var token = JToken.Parse(data);
            var nodes = (JArray)token["elements"];
            var elements = nodes != null 
                ? nodes.Select((x, i) => ParseNode(node: x, parent: null, index: i, describeContext: describeContext)).Where(x => x != null).ToArray() 
                : emptyList;

            return elements;
        }

        public string Serialize(IEnumerable<IElement> elements) {
            var root = new {
                elements = elements.Select(Serialize).ToArray()
            };

            return JToken.FromObject(root).ToString();
        }

        private static object Serialize(IElement element, int index) {
            var container = element as IContainer;
            var dto = new {
                typeName = element.Descriptor.TypeName,
                data = element.Data.Serialize(),
                exportableData = element.ExportableData.Serialize(),
                index = index,
                elements = container != null ? container.Elements.Select(Serialize).ToList() : new List<object>(),
                isTemplated = element.IsTemplated,
                htmlId = element.HtmlId,
                htmlClass = element.HtmlClass,
                htmlStyle = element.HtmlStyle
            };
            return dto;
        }

        private IElement ParseNode(JToken node, IContainer parent, int index, DescribeElementsContext describeContext) {
            var elementTypeName = (string)node["typeName"];

            if (String.IsNullOrWhiteSpace(elementTypeName))
                return null;

            var data = (string) node["data"] ?? (string) node["state"]; // Falling back to "state" node for backwards compatibility.
            var htmlId = (string) node["htmlId"];
            var htmlClass = (string)node["htmlClass"];
            var htmlStyle = (string)node["htmlStyle"];
            var elementData = ElementDataHelper.Deserialize(data);
            var exportableData = ElementDataHelper.Deserialize((string)node["exportableData"]);
            var childNodes = node["elements"];
            var elementDescriptor = _elementManager.GetElementDescriptorByTypeName(describeContext, elementTypeName);

            if (elementDescriptor == null)
                return null; // This happens if an element exists in a layout, but its type is no longer available due to its feature being disabled.

            var element = _elementFactory.Activate(elementDescriptor, e => {
                e.Container = parent;
                    e.Index = index; 
                    e.Data = elementData;
                    e.ExportableData = exportableData;
                    e.HtmlId = htmlId;
                    e.HtmlClass = htmlClass;
                    e.HtmlStyle = htmlStyle;
            });

            var container = element as IContainer;

            if (container != null)
                container.Elements = childNodes != null 
                    ? childNodes.Select((x, i) => ParseNode(x, container, i, describeContext)).Where(x => x != null).ToList() 
                    : new List<IElement>();

            element.IsTemplated = node.Value<bool>("isTemplated");

            return element;
        }
    }
}