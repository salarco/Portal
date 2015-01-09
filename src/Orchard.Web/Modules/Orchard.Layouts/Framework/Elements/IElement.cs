using Orchard.Localization;

namespace Orchard.Layouts.Framework.Elements {
    public interface IElement {
        IContainer Container { get; set; }
        string Type { get; }
        LocalizedString DisplayText { get; }
        string Category { get; }
        bool IsSystemElement { get; }
        bool HasEditor { get; }
        bool IsTemplated { get; set; }
        ElementDataDictionary Data { get; set; }
        ElementDataDictionary ExportableData { get; set; }
        ElementDescriptor Descriptor { get; set; }
        int Index { get; set; }
        Localizer T { get; set; }
        string HtmlId { get; set; }
        string HtmlClass { get; set; }
        string HtmlStyle { get; set; }
    }
}