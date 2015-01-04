using System.Collections.Generic;
using Orchard.Layouts.Framework.Elements;

namespace Orchard.Layouts.Services {
    /// <summary>
    /// Maps element data to an editor compatible object model.
    /// </summary>
    public interface ILayoutModelMapper : IDependency {
        /// <summary>
        /// Maps the specified layout data to a JSON representation of a layout editor compatible object model.
        /// </summary>
        /// <param name="layoutData">The layout serialized as a string to map to the editor JSON format.</param>
        /// <param name="describeContext">A context for the element activator when describing elements.</param>
        /// <returns>Returns a JSON string that represents the layout model compatible with the layout editor.</returns>
        string ToEditorModel(string layoutData, DescribeElementsContext describeContext);

        /// <summary>
        /// Maps the specified editor data to an hierarchical list of elements.
        /// </summary>
        /// <param name="editorData">The editor JSON sent from the client browser.</param>
        /// <param name="describeContext">A context for the element activator when describing elements.</param>
        /// <returns>Returns an hierarchical list of elements.</returns>
        IEnumerable<IElement> ToLayoutModel(string editorData, DescribeElementsContext describeContext);
    }
}