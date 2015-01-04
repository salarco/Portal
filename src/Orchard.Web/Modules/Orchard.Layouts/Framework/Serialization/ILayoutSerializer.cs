using System.Collections.Generic;
using Orchard.Layouts.Framework.Elements;
using Orchard.Layouts.Services;

namespace Orchard.Layouts.Framework.Serialization {
    public interface ILayoutSerializer : IDependency {
        IEnumerable<IElement> Deserialize(string data, DescribeElementsContext describeContext);
        string Serialize(IEnumerable<IElement> elements);
    }
}