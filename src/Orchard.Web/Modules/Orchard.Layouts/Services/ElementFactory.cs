using System;
using Orchard.Layouts.Framework.Elements;
using Orchard.Localization;

namespace Orchard.Layouts.Services {
    public class ElementFactory : IElementFactory {
        private readonly IElementEventHandler _elementEventHandler;

        public ElementFactory(IElementEventHandler elementEventHandler) {
            _elementEventHandler = elementEventHandler;
            T = NullLocalizer.Instance;
        }

        public Localizer T { get; set; }

        public IElement Activate(Type elementType) {
            return (IElement)Activator.CreateInstance(elementType);
        }

        public T Activate<T>() where T : IElement {
            return (T)Activate(typeof (T));
        }

        public IElement Activate(ElementDescriptor descriptor, ActivateElementArgs args) {
            _elementEventHandler.Creating(new ElementCreatingContext {
                ElementDescriptor = descriptor
            });

            var element = Activate(descriptor.ElementType);

            args = args ?? ActivateElementArgs.Empty;
            element.Container = args.Container;
            element.Descriptor = descriptor;
            element.T = T;
            element.Index = args.Index;
            element.Data = args.Data ?? new ElementDataDictionary();
            element.ExportableData = args.ExportableData ?? new ElementDataDictionary();
            element.HtmlId = args.HtmlId;
            element.HtmlClass = args.HtmlClass;
            element.HtmlStyle = args.HtmlStyle;

            _elementEventHandler.Created(new ElementCreatedContext {
                Element = element,
                ElementDescriptor = descriptor
            });

            return element;
        }
    }
}