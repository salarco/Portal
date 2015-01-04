using System.Collections.Generic;
using Orchard.Layouts.Framework.Elements;

namespace Orchard.Layouts.Services {
    public interface ILayoutSerializer : IDependency {
        IEnumerable<IElement> Deserialize(string data, DescribeElementsContext describeContext);
        string Serialize(IEnumerable<IElement> elements);
    }
}