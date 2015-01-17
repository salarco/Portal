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

        public IElement Activate(Type elementType, Action<IElement> initialize = null) {
            var element = (IElement)Activator.CreateInstance(elementType);

            if (initialize != null)
                initialize(element);

            return element;
        }

        public T Activate<T>(Action<T> initialize = null) where T : IElement {
            var element = (T)Activator.CreateInstance(typeof(T));

            if (initialize != null)
                initialize(element);

            return element;
        }

        public T Activate<T>(ElementDescriptor descriptor, Action<T> initialize = null) where T : IElement {
            var initializeWrapper = initialize != null ? e => initialize((T)e) : default(Action<IElement>);
            return (T)Activate(descriptor, initializeWrapper);
        }

        public IElement Activate(ElementDescriptor descriptor, Action<IElement> initialize = null) {
            _elementEventHandler.Creating(new ElementCreatingContext {
                ElementDescriptor = descriptor
            });

            var element = Activate(descriptor.ElementType);

            element.Descriptor = descriptor;
            element.T = T;
            element.Data = new ElementDataDictionary();
            element.ExportableData = new ElementDataDictionary();

            if (initialize != null)
                initialize(element);

            _elementEventHandler.Created(new ElementCreatedContext {
                Element = element,
                ElementDescriptor = descriptor
            });

            return element;
        }
    }
}