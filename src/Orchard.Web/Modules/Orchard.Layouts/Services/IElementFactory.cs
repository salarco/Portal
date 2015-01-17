using System;
using Orchard.Layouts.Framework.Elements;

namespace Orchard.Layouts.Services {
    public interface IElementFactory : IDependency {
        IElement Activate(Type elementType, Action<IElement> initialize = null);
        T Activate<T>(Action<T> initialize = null) where T:IElement;
        IElement Activate(ElementDescriptor descriptor, Action<IElement> initialize = null);
        T Activate<T>(ElementDescriptor descriptor, Action<T> initialize = null) where T:IElement;
    }
}