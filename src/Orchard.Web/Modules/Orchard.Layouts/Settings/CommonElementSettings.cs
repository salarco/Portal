using Orchard.Layouts.Framework.Elements;

namespace Orchard.Layouts.Settings {
    public class CommonElementSettings {
        public string Id { get; set; }
        public string CssClass { get; set; }
        public string InlineStyle { get; set; }

        public void Store(ElementDataDictionary dictionary) {
            dictionary["CommonElementSettings.Id"] = Id;
            dictionary["CommonElementSettings.CssClass"] = CssClass;
            dictionary["CommonElementSettings.InlineStyle"] = InlineStyle;
        }
    }
}